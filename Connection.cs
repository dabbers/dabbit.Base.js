    public /*abstract*/ class Connection
    {
        public string Host { get { return this.socketWrapper.Host; } }
        public int Port { get { return this.socketWrapper.Port; } }
        public bool Secure { get { return this.socketWrapper.Secure; } }
        public Guid Id { get; internal set; }
        public bool Async { get; protected set; }
        public bool Connected { get { return this.socketWrapper.Connected; } }
        internal RawMessageReceived RawMessageReceived { get;  set; }

        public Connection(IContext ctx, ISocketWrapper socket)
        {
            if (ctx == null)
            {
                throw new ArgumentNullException("ctx");
            }
            this.ctx = ctx;
            this.socketWrapper = socket;
        }


        public void Connect()
        {
            if (this.Connected)
            {
                throw new AlreadyConnectedException();
            }

            this.socketWrapper.ConnectAsync();
        }

        public void Disconnect()
        {
            this.Disconnect("QUIT :dabbit IRC Client. Get it today! http://dabb.it");
            this.socketWrapper.Disconnect();

            this.socketWrapper = this.ctx.CreateSocket(this.socketWrapper.Host, this.socketWrapper.Port, this.socketWrapper.Secure);
        }
        public void Disconnect(string quitmsg)
        {
            this.Write(quitmsg);
            this.socketWrapper.Disconnect();

            this.socketWrapper = this.ctx.CreateSocket(this.socketWrapper.Host, this.socketWrapper.Port, this.socketWrapper.Secure);
        }

        /// <summary>
        /// This is called to return a single message from the stack. By default this doesn't run in
        /// async, but it can if you call ReadAsync first. 
        /// </summary>
        /// <returns>Message object if there is a message available. Null if not (and running async)</returns>
        private Message Read()
        {
            if (this.Async)
            {
                if (this.messages.Count > 0)
                    return this.messages.Pop();
                else
                    return null;
            } 
            else
            {
                return this.ReadDirect();
            }
        }

        /// <summary>
        /// Calling this method in the same thread as your application WILL lock it up. Use this method for 
        /// doing a background reader and checker. If you set the RawMessageReceived delegate,
        /// you can get a callback for every time a raw message is received.
        /// </summary>
        public void ReadAsync()
        {
            this.Async = true;

            // Callback based 
            if (this.RawMessageReceived == null)
            {
                while (this.Connected && this.RawMessageReceived == null)
                {
                    Message msg = this.ReadDirect();
                    if (msg == null)
                    {
                        this.Disconnect();
                        return;
                    }
                    this.messages.Push(this.ReadDirect());
                }
            }

            // If we're transitioning to using a callback, make sure to empty the stack so we don't miss
            // any messages
            if (this.RawMessageReceived != null)
            {
                // empty stack
                while (this.messages.Count > 0)
                {
                    this.RawMessageReceived(this.messages.Pop());
                }

                // resume async reading
                while (this.Connected)
                {
                    this.RawMessageReceived(this.ReadDirect());
                }
            }

            this.Async = false;
        }

        private Message ReadDirect()
        {
            Message msg = new Message();
            
            msg.Timestamp = DateTime.Now;
            try
            {
                msg.RawLine = this.socketWrapper.Reader.ReadLine().Trim();
            }
            catch(Exception)
            {
                return null;
            }
            

            if (String.IsNullOrEmpty(msg.RawLine))
            {
                return null;
            }
              
            string[] messages = msg.RawLine.Split(' ');

            msg.Parts = messages;
            if (messages.Count() == 0)
                return null;

            if (messages[0] == "PING" || messages[0] == "ERROR")
            {
                msg.Command = messages[0];
            }
            else
            {
                msg.Command = messages[1];
            }

            string temp = "";
            bool found = false;
            for (int i = 1; i < messages.Count(); i++)
            {
                if (String.IsNullOrEmpty(messages[i]))
                    continue;

                if (messages[i][0] == ':')
                {
                    found = true;
                }

                if (found)
                    temp += messages[i] + " ";

            }

            temp = temp.TrimEnd();

            if (temp != "")
                msg.MessageLine = temp.Substring(1);
            else
                msg.MessageLine = msg.RawLine.Substring(1);

            string[] fromParts = messages[0].Split('!');

            if (fromParts.Count() > 1)
            {
                string[] identHost = fromParts[1].Split('@');
                msg.From = new SourceEntity(new string[] { fromParts[0].Substring(1), identHost[0], identHost[1] }, SourceEntityType.Client);
            }
            else
            {
                msg.From = new SourceEntity(new string[] { fromParts[0].Substring(1) }, SourceEntityType.Server);
            }

            return msg;

        }

        public void Write(string message)
        {
            this.socketWrapper.Writer.WriteLine(message);
            this.socketWrapper.Writer.Flush();
        }

        private Stack<Message> messages = new Stack<Message>();
        private IContext ctx;
        private ISocketWrapper socketWrapper;
    }

    public enum ConnectionType
    {
        /// <summary>
        /// Direct TCP/IP connection
        /// </summary>
        Direct,

        /// <summary>
        /// A connection to a BNC server
        /// </summary>
        BNC,

        /// <summary>
        /// Connection to a dabbit Socket Server
        /// </summary>
        Dabbit,

        /// <summary>
        /// Sock 5 server
        /// </summary>
        Socks5,

        /// <summary>
        /// Sock 4 server
        /// </summary>
        Socks4
    }
}
