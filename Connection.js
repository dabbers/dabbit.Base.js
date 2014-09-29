var System = new require("all")("System");
var AlreadyConnectedException = require('./AlreadyConnectedException');
var Message = require('./Message');
var SourceEntity = require('./SourceEntity');
var SourceEntityType = require('./SourceEntityType');

function Connection(inCtx, socket) {
    System.Object.call(this);

    var messages = []; // new Stack<Message>();
    var ctx = new CheckedProperty(undefined, System.Typeof(Context));
    
    if (!inCtx) {
        throw new System.ArgumentException("Context cannot be null");
    }
    ctx.Value = inCtx;

    var socketWrapper = new CheckedProperty(undefined, System.Typeof(SocketWrapper)); // ISocketWrapper
    if (!socket) {
        throw new System.ArgumentException("Socket cannot be null");
    }
    socketWrapper.Value = socket;

    this.__defineGetter__("Host", function() { // string
        return socketWrapper.Value.Host;
    });
    this.__defineGetter__("Port", function() { // number
        return socketWrapper.Value.Port;
    });
    this.__defineGetter__("Secure", function() { // bool
        return socketWrapper.Value.Port;
    });

    this.__defineGetter__("Id", function() { // GUID
        return id;
    });
    var id = new System.GUID();

    this.__defineGetter__("Async", function() { // bool
        return socketWrapper.Value.Port;
    });
    var id = new System.GUID();

    this.__defineGetter__("Connected", function() { // bool
        return socketWrapper.Value.Connected;
    });

    this.RawMessageReceived = function() { } // Callback for any message received

    /// <summary>
    /// Establish a connection to the server. dataCallback is called for each complete line of IRC
    /// data. Only parameter is a dabbit.Base.Message object
    /// </summary>
    this.Connect = function(dataCallback) {
        if (this.Connected)
        {
            throw new AlreadyConnectedException();
        }

        // Store a user provided callback for data. If no callback is provided, just use an empty function
        this.RawMessageReceived = (dataCallback || function() {});

        // Connect to our server providing our own data parsing method for the callback.
        // our callback will call their callback when we've placed the line into a nicely packaged object
        socketWrapper.Value.Connect(onRead);
    }

    /// <summary>
    /// Disconnect from the server with an optional quit message
    /// </summary>
    this.Disconnect = function(quitmsg) {
        this.Write(quitmsg || "QUIT :dabbit IRC Client. Get it today! http://dabb.it");

        socketWrapper.Value.Disconnect();
        socketWrapper.Value = ctx.CreateSocket(socketWrapper.Value.Host, socketWrapper.Value.Port, socketWrapper.Value.Secure);
    }

    var onRead = function(data) {

        var msg = new Message();
        msg.Timestamp = new Date();
        msg.RawLine = data;

        if (String.IsNullOrEmpty(msg.RawLine))
        {
            return;
        }

        var messages = msg.RawLine.split(' ');
        msg.Parts = messages;

        if (messages.length > 0) {
            return;
        }

        if (messages[0] == "PING" || messages[0] == "ERROR")
        {
            msg.Command = messages[0];
        }
        else
        {
            msg.Command = messages[1];
        }

        var temp = "";
        var found = false;

        for( i = 0; i < messages.length; i++) {
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

        var fromParts = messages[0].split('!');

        if (fromParts.length > 1)
        {
            var identHost = fromParts[1].split('@');
            msg.From = new SourceEntity([ fromParts[0].Substring(1), identHost[0], identHost[1] ], SourceEntityType.Client);
        }
        else
        {
            msg.From = new SourceEntity([ fromParts[0].Substring(1) ], SourceEntityType.Server);
        }
        
        this.RawMessageReceived(msg);
    }

    this.Write = function(message) {
        socketWrapper.Value.Writer.WriteLine(message);
        socketWrapper.Value.Writer.Flush();
    }
}
System.Javascript.Inherit(System.Object, Connection);


module.exports = Connection;