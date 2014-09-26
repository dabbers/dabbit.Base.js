using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Reflection;

namespace dabbit.Base
{
    public class Server
    {
        public string Name { get { return this.Display; } set { this.Attributes["NETWORK"] = value; } }
        public ServerType Type { get { return this.serverType; } }
        public User Me { get { return this.me; } }
        public Dictionary<string, string> Attributes { get { return this.attributes; } }
        
        public virtual Dictionary<string, Channel> Channels { get; protected set; }
        public Connection Connection { get { return this.connection; } }
        public string Display { get { return this.Attributes["NETWORK"]; } }
        public string Password { get; set; }

        public bool MultiModes { get { return this.multiModes; } }
        public bool HostInNames { get { return this.hostInNames; } }

        protected Server()
        { }

        public Server(IContext ctx, User me, Connection connection)
        {
            if (ctx == null)
            {
                throw new ArgumentNullException("ctx");
            }

            this.me = me;
            if (me.Modes == null)
                me.Modes = new List<string>();

            this.ctx = ctx;
            this.Channels = new Dictionary<string, Channel>(StringComparer.CurrentCultureIgnoreCase);
            this.OnNumeric = new Dictionary<RawReplies, IrcEventHandler>();

            this.connection = connection;
            this.connection.RawMessageReceived = this.rawMessageReceived;

            // Add prefined and used attributes
            this.Attributes.Add("NETWORK", this.connection.Host);
            this.Attributes.Add("STATUSMSG", "");
            this.Attributes.Add("CHANTYPES", "");

            this.connection.Connect();

            this.connection.Write("CAP LS"); // Get list of extras (For multi prefix)
            
            if (!String.IsNullOrEmpty(this.Password))
            {
                this.connection.Write("PASS " + this.Password);
            }

            this.connection.Write("NICK " + this.Me.Nick);
            this.connection.Write("USER " + this.Me.Ident + " * * :" + this.Me.Name);
        }

#region Events
        public event IrcEventHandler OnConnectionEstablished;
        public event IrcEventHandler OnRawMessage; //
        public event ErrorEventHandler OnError; //
        public event JoinEventHandler OnNewChannelJoin; //
        public event PartEventHandler OnCloseChannelPart; //
        public event JoinEventHandler OnJoin; //
        public event NamesEventHandler OnNames;
        public event ListEventHandler OnList;
        public event PartEventHandler OnPart; //
        public event QuitEventHandler OnQuit; //
        public event KickEventHandler OnKick; //
        public event IrcEventHandler OnUnAway; //
        public event IrcEventHandler OnAway; //
        public event InviteEventHandler OnInvite; //
        public event BanEventHandler OnBan; //
        public event UnbanEventHandler OnUnban; //

        public event WhoIsEventHandler OnWhoIs; // 
        public event MotdEventHandler OnMotd;
        public event TopicEventHandler OnTopic; //
        public event NickChangeEventHandler OnNickChange; //
        public event ModeChangeEventHandler OnModeChange; //
        public event IrcEventHandler OnUserModeChange; //
        public event IrcEventHandler OnChannelModeChange; //

        public event PrivmsgEventHandler OnChannelMessage; // Channel->No Action->Not Notice
        public event PrivmsgEventHandler OnChannelMessageNotice; // Channel->No Action->Notice
        public event ActionEventHandler OnChannelAction; // Channel->Action->Not Notice
        public event ActionEventHandler OnChannelActionNotice; // Channel->Action->Notice

        public event PrivmsgEventHandler OnQueryMessage; // Query->No Action->Not Notice
        public event PrivmsgEventHandler OnQueryMessageNotice; // Query->No Action->Notice
        public event ActionEventHandler OnQueryAction; // Query->Action->Not Notice
        public event ActionEventHandler OnQueryActionNotice; // Query->Action->Notice

        public event CtcpEventHandler OnCtcpRequest;
        public event CtcpEventHandler OnCtcpReply;

        public event IrcEventHandler OnUnhandledEvent;

        public Dictionary<RawReplies, IrcEventHandler> OnNumeric;

#endregion

        private void rawMessageReceived(Message msg)
        {
            if (msg == null)
            {
                return;
            }


            if (this.OnRawMessage != null)
                this.OnRawMessage(this, msg);
            int temp;

            if (Int32.TryParse(msg.Command, out temp))
            {
                RawReplies rawenum = (RawReplies)temp;

                if (rawenum != null)
                {
                    IrcEventHandler evtdel;

                    this.OnNumeric.TryGetValue(rawenum, out evtdel);

                    if (evtdel != null)
                    {
                        evtdel(this, msg);
                    }
                }
            }


            switch (msg.Command)
            {
                #region PRIVMSG
                case "PRIVMSG":
                    PrivmsgMessage pvm = new PrivmsgMessage(msg);

                    // We are parsing a message to a channel
                    pvm.To = new SourceEntity(new string[] { msg.Parts[2] }, SourceEntityType.Channel);

                    if (this.Attributes["STATUSMSG"].Contains(msg.Parts[2][0].ToString()))
                    {
                        // Check for a wallops message (+#channel)
                        pvm.Wall = msg.Parts[2][0].ToString();
                        msg.Parts[2] = msg.Parts[2].Substring(1);

                        pvm.To = new SourceEntity(new string[] { msg.Parts[2] }, SourceEntityType.Channel);
                    }
    
                    if (this.Attributes["CHANTYPES"].Contains(pvm.Parts[2][0].ToString()))
                    {
                        if (msg.Parts[3] == ":\001ACTION")
                        {
                            msg.MessageLine = msg.MessageLine.Substring(8, msg.MessageLine.Length - 10);
                            // CTCP Action
                            if (this.OnChannelAction != null)
                            {
                                this.OnChannelAction(this, pvm);
                            }
                        }
                        else
                        {
                            if (this.OnChannelMessage != null)
                            {
                                this.OnChannelMessage(this, pvm);
                            }
                        }

                        break;
                    }

                    // A message is being sent to a non-channel which means it HAS to be going to us.
                    pvm.To = new SourceEntity(pvm.To.Parts, SourceEntityType.Client);

                    if (msg.Parts[3] == ":\001ACTION")
                    {
                        // Remove ending \001
                        if (msg.MessageLine[msg.MessageLine.Length - 1] == '\u0001')
                        {
                            msg.MessageLine = msg.MessageLine.Substring(9, msg.MessageLine.Length - 1);
                            string lastpart = msg.Parts[msg.Parts.Count() - 1];
                            msg.Parts[msg.Parts.Count() - 1] = lastpart.Substring(0, lastpart.Length - 1);
                        }

                        // CTCP Action
                        if (this.OnQueryAction != null)
                        {
                            this.OnQueryAction(this, pvm);
                        }
                    }
                    else
                    {
                        if (this.OnQueryMessage != null)
                        {
                            this.OnQueryMessage(this, pvm);
                        }
                    }

                    break;
                #endregion
                #region NOTICE
                case "NOTICE":
                    pvm = new PrivmsgMessage(msg);

                    // We are parsing a message to a channel
                    pvm.To = new SourceEntity(new string[] { msg.Parts[2] }, SourceEntityType.Channel);

                    if (this.Attributes["STATUSMSG"].Contains(msg.Parts[2][0].ToString()))
                    {
                        // Check for a wallops message (+#channel)
                        pvm.Wall = msg.Parts[2][0].ToString();
                        msg.Parts[2] = msg.Parts[2].Substring(1);

                        pvm.To = new SourceEntity(new string[] { msg.Parts[2] }, SourceEntityType.Channel);
                    }
    
                    if (this.Attributes["CHANTYPES"].Contains(pvm.Parts[2][0].ToString()))
                    {
                        if (msg.Parts[3] == ":\001ACTION")
                        {
                            msg.MessageLine = msg.MessageLine.Substring(9, msg.MessageLine.Length - 10);
                            // CTCP Action
                            if (this.OnChannelActionNotice != null)
                            {
                                this.OnChannelActionNotice(this, pvm);
                            }
                        }
                        else
                        {
                            if (this.OnChannelMessageNotice != null)
                            {
                                this.OnChannelMessageNotice(this, pvm);
                            }
                        }

                        break;
                    }

                    // A message is being sent to a non-channel which means it HAS to be going to us.
                    pvm.To = new SourceEntity(pvm.To.Parts, SourceEntityType.Client);

                    if (msg.Parts[3] == ":\001ACTION")
                    {
                        // Remove ending \001
                        if (msg.MessageLine[msg.MessageLine.Length - 1] == '\u0001')
                        {
                            msg.MessageLine = msg.MessageLine.Substring(8, msg.MessageLine.Length - 1);
                            string lastpart = msg.Parts[msg.Parts.Count() - 1];
                            msg.Parts[msg.Parts.Count() - 1] = lastpart.Substring(0, lastpart.Length - 1);
                        }

                        // CTCP Action
                        if (this.OnQueryActionNotice != null)
                        {
                            this.OnQueryActionNotice(this, pvm);
                        }
                    }
                    else
                    {
                        if (this.OnQueryMessageNotice != null)
                        {
                            this.OnQueryMessageNotice(this, pvm);
                        }
                    }

                    break;
                #endregion
                #region PING/ERROR
                case "PING":
                    this.connection.Write("PONG " + msg.Parts[1]);
                    break;
                case "ERROR":
                    this.OnError(this, msg);
                    break;
                #endregion
                #region JOIN
                case "JOIN":
                    JoinMessage jm = new JoinMessage(msg);
                    if (msg.From.Parts[0] == this.Me.Nick)
                    {
                        Channel value;
                        this.Channels.TryGetValue(msg.Parts[2], out value);

                        if (value == null)
                        {
                            value = this.ctx.CreateChannel(this);
                            value.Modes = new List<Mode>();
                            value.Users = new List<User>();
                            value.Topic = new Topic();

                            this.Channels.Add(msg.Parts[2], value);
                        }
                        value.Name = msg.Parts[2];
                        value.Display = value.Name;

                        this.connection.Write("MODE " + jm.Channel);

                        this.Channels[msg.Parts[2]] = value;

                        if (value.ChannelLoaded && this.OnNewChannelJoin != null)
                        {
                            this.OnNewChannelJoin(this, jm);
                        }
                    }
                    else
                    {
                        User usr = this.ctx.CreateUser();
                        usr.Nick = jm.From.Parts[0];
                        usr.Ident = jm.From.Parts[1];
                        usr.Host = jm.From.Parts[2];
                        usr.Modes = new List<string>();

                        this.Channels[jm.Channel].Users.Add(usr);


                        this.Channels[jm.Channel].Users.Sort(sortuser);
                        if (this.OnJoin != null)
                        {
                            this.OnJoin(this, jm);
                        }
                        
                    }
                    break;
                #endregion
                #region 324 Channel modes (On Join)
                case "324": // :hyperion.gamergalaxy.net 324 dabbbb #dab +r
                    Channel chnl;
                    this.Channels.TryGetValue(msg.Parts[3], out chnl);

                    if (chnl == null)
                    {
                        // do nothing because we aren't a member of this channel
                        return;
                    }

                    //chnl.Modes = new List<Mode>();

                    string modes = msg.Parts[4];
                    int paramidx = 5;

                    // 1 was from the + sign in the model.
                    for (int i = 1; i < modes.Length; i++)
                    {
                        Mode mode = new Mode();

                        // Is this a mode with a parameter?
                        if (this.Attributes["CHANMODES_B"].Contains(modes[i].ToString()))
                        {
                            mode.Argument = msg.Parts[paramidx++];
                        }
                        else
                        {
                            mode.Argument = String.Empty;
                        }

                        mode.Character = modes[i];
                        mode.Type = ModeType.Channel;
                        chnl.Modes.Add(mode);
                    }

                    this.Channels[msg.Parts[3]] = chnl;

                    break;
                #endregion
                #region 353, 329  Channel Users, channel create (On Join)
                case "329": // navi.gamergalaxy.net 329 dab #TBN 1403649503
                    Channel chan329Val;

                    this.Channels.TryGetValue(msg.Parts[3], out chan329Val);

                    if (chan329Val == null)
                        return;

                    chan329Val.Created = Utility.FromUnixTime(long.Parse(msg.Parts[4]));

                    break;
                case "353": // /Names list item :hyperion.gamergalaxy.net 353 badddd = #dab :badddd BB-Aso
                    //msg.Parts[4] = msg.Parts[4].Substring(1);
                    
                    Channel vall;
                    this.Channels.TryGetValue(msg.Parts[4], out vall);

                    // Should NEVER HAPPEN
                    if (vall == null)
                    {
                        // We don't want to execute this
                        return;
                    }

                    if (vall.Users == null)
                    {
                        vall.Users = new List<User>();
                    }

                    msg.Parts[5] = msg.Parts[5].Substring(1);
                    string prefixes = this.Attributes["PREFIX_PREFIXES"];

                    for (int i = 5; i < msg.Parts.Count(); i++)
                    {
                        if (String.IsNullOrEmpty(msg.Parts[i]))
                            continue;

                        User tempuser = this.ctx.CreateUser();
                        tempuser.Modes = new List<string>();

                        if (this.HostInNames)
                        {
                            string[] nick = msg.Parts[i].Split('!');
                            if (nick.Count() > 1)
                            {
                                string[] identhost = nick[1].Split('@');
                                tempuser.Nick = nick[0];
                                tempuser.Ident = identhost[0];
                                tempuser.Host = identhost[1];
                            }
                            else
                            {
                                tempuser.Nick = msg.Parts[i];
                            }
                        }
                        else
                        {
                            tempuser.Nick = msg.Parts[i];
                        }
                        
                        while (prefixes.Contains(tempuser.Nick[0].ToString()))
                        {
                            tempuser.Modes.Add(tempuser.Nick[0].ToString());
                            tempuser.Nick = tempuser.Nick.Substring(1);

                            tempuser.Modes.Sort(delegate(string s1, string s2)
                            {
                                return prefixes.IndexOf(s1[0]).CompareTo(prefixes.IndexOf(s2[0]));
                            });
                        }
                        

                        //JoinMessage xinmsg = new JoinMessage(msg);
                        //joinmsg.Channel = msg.Parts[3];


                        vall.Users.Add(tempuser);

                        vall.Users.Sort(sortuser);
                    }


                    this.Channels[msg.Parts[5]] = vall;

                    break;
                #endregion
                #region PART
                case "PART":

                    this.Channels[msg.Parts[2]].Users.Remove
                        (this.Channels[msg.Parts[2]].Users.Where(u => u.Nick == msg.From.Parts[0]).First());

                    if (this.OnPart != null)
                    {
                        this.OnPart(this, msg);
                    }


                    if (msg.From.Parts[0] == me.Nick)
                    {
                        this.Channels.Remove(msg.Parts[2]);

                        if (this.OnCloseChannelPart != null)
                        {
                            this.OnCloseChannelPart(this, msg);
                        }
                    }

                    break;
                #endregion
                #region QUIT
                case "QUIT":
                    List<string> channels = new List<string>();

                    foreach (var chn in this.Channels)
                    {
                        User usr = chn.Value.Users.Where(u => u.Nick == msg.From.Parts[0]).FirstOrDefault();

                        if (usr != null)
                        {
                            chn.Value.Users.Remove(usr);
                            channels.Add(chn.Key);
                        }

                    }
                    if (this.OnQuit != null)
                    {
                        this.OnQuit(this, new QuitMessage(msg) { Channels = channels.ToArray() });
                    }
                    
                    break;
                #endregion
                #region KICK
                case "KICK":
                    // :from kick #channel nick :Reason (optional)

                    this.Channels[msg.Parts[2]].Users.Remove(this.Channels[msg.Parts[2]].Users.Where(u => u.Nick == msg.Parts[3]).First());

                    if (this.OnKick != null)
                    {
                        this.OnKick(this, msg);
                    }

                    break;
                #endregion
                #region NICK
                case "NICK":
                    NickChangeMessage nickmsg = new NickChangeMessage(msg);
                                        
                    List<string> nickchannels = new List<string>();

                    foreach (var chn in this.Channels)
                    {
                        User usr = chn.Value.Users.Where(u => u.Nick == msg.From.Parts[0]).FirstOrDefault();
                        int usridx = chn.Value.Users.IndexOf(usr);

                        if (usr != null)
                        {
                            this.Channels[chn.Value.Display].Users[usridx].Nick = nickmsg.To;
                            this.Channels[chn.Value.Display].Users.Sort(sortuser);
                            nickchannels.Add(chn.Key);
                        }

                        

                    }
                    if (nickmsg.From.Parts[0] == me.Nick)
                    {
                        me.Nick = nickmsg.To.Substring(1);
                    }

                    nickmsg.Channels = nickchannels.ToArray();
                    
                    if (this.OnNickChange != null)
                    {
                        this.OnNickChange(this, nickmsg);
                    }

                    break;
                #endregion
                #region MODE
                case "MODE":

                    string modesstring = msg.Parts[3];
                    int paramsindex = 4;
                    bool adding = true;

                    string prefixz = this.Attributes["PREFIX_PREFIXES"];
                    int start = modesstring[0] == ':' ? 1 : 0;
                    for (int i = start; i < modesstring.Length; i++)
                    {
                        if (modesstring[i] == '+')
                        {
                            adding = true;
                            continue;
                        }
                        else if (modesstring[i] == '-')
                        {
                            adding = false;
                            continue;
                        }


                        Mode mode = new Mode();
                        mode.Display = mode.Character = modesstring[i];
                        mode.ModificationType = adding ? ModeModificationType.Adding : ModeModificationType.Removing;

                        if (this.Attributes["CHANMODES_A"].Contains(modesstring[i].ToString()) ||
                            this.Attributes["CHANMODES_B"].Contains(modesstring[i].ToString()) ||
                            this.Attributes["CHANMODES_C"].Contains(modesstring[i].ToString()))
                        {
                            mode.Argument = msg.Parts[paramsindex++];
                        }
                        else
                        {
                            mode.Argument = String.Empty;
                        }

                        mode.Character = modesstring[i];

                        if (msg.Parts[2] != me.Nick && this.Attributes["PREFIX_MODES"].Contains(modesstring[i].ToString()))
                        {
                            mode.Type = ModeType.User;
                            mode.Argument = msg.Parts[paramsindex++];

                            mode.Character = this.Attributes["PREFIX_PREFIXES"][this.Attributes["PREFIX_MODES"].IndexOf(mode.Character)];

                            int userid = this.Channels[msg.Parts[2]].Users.
                                Select((item, index) => new { Index = index, Item = item })
                                .Where(u => u.Item.Nick == mode.Argument).First().Index;

                            if (mode.ModificationType == ModeModificationType.Removing)
                            {
                                this.Channels[msg.Parts[2]].Users[userid].Modes.
                                    Remove(this.Channels[msg.Parts[2]].Users[userid].Modes.
                                    Where(m => m == mode.Character.ToString()).First());


                            }
                            else
                            {
                                this.Channels[msg.Parts[2]].Users[userid].Modes.Add(mode.Character.ToString());

                                this.Channels[msg.Parts[2]].Users[userid].Modes.Sort(delegate(string s1, string s2)
                                {
                                    return prefixz.IndexOf(s1[0]).CompareTo(prefixz.IndexOf(s2[0]));
                                });
                            }

                            this.Channels[msg.Parts[2]].Users.Sort(sortuser);
                        }
                        else if (msg.Parts[2] == me.Nick)
                        {
                            mode.Type = ModeType.UMode;
                            if (mode.ModificationType == ModeModificationType.Adding)
                            {
                                me.Modes.Add(mode.Character.ToString());
                            }
                            else
                            {
                                me.Modes.Remove(me.Modes.Where(m => m[0] == mode.Character).First());
                            }
                        }
                        else
                        {
                            mode.Type = ModeType.Channel;
                            if (mode.ModificationType == ModeModificationType.Adding)
                            {
                                this.Channels[msg.Parts[2]].Modes.Add(mode);

                                if (mode.Character == 'b')
                                {
                                    if (this.OnBan != null)
                                    {
                                        this.OnBan(this, msg);
                                    }
                                }
                            }
                            else
                            {
                                this.Channels[msg.Parts[2]].Modes.Remove
                                    (this.Channels[msg.Parts[2]].Modes.Where(m => m.Character == mode.Character &&
                                        mode.Argument == m.Argument).First());


                                if (mode.Character == 'b')
                                {
                                    if (this.OnUnban != null)
                                    {
                                        this.OnUnban(this, msg);
                                    }
                                }
                            }
                        }

                        if (this.OnModeChange != null)
                        {
                            this.OnModeChange(this, new ModeMessage(msg) { Mode = mode });
                        }

                    }

                    break;
                #endregion
                #region 366 End of /Names List
                case "366": // End of /names list

                    JoinMessage jm_ = new JoinMessage(msg);
                    jm_.Channel = msg.Parts[3];

                    if (this.Channels[jm_.Channel].ChannelLoaded && this.OnNewChannelJoin != null)
                    {
                        this.OnNewChannelJoin(this, jm_);
                    }
                    break;
                #endregion
                #region 332 Channel Topic (On Join)
                case "332":
                    Channel tmpchan;

                    this.Channels.TryGetValue(msg.Parts[3], out tmpchan);

                    if (tmpchan == null)
                    {
                        // We don't want to execute in case the user called this command outside of a channel
                        return;
                    }

                    tmpchan.Topic = new Topic();
                    tmpchan.Topic.Display = msg.MessageLine;

                    this.Channels[msg.Parts[3]] = tmpchan;

                    if (this.OnTopic != null)
                    {
                        this.OnTopic(this, msg);
                    }
                    break;
                #endregion
                #region 333 Channel Topic set by and when (on join)
                case "333": // Who set the topic and when they set it
                    
                    Channel tmpchan2;

                    this.Channels.TryGetValue(msg.Parts[3], out tmpchan2);

                    if (tmpchan2 == null)
                    {
                        // If a user calls topic by themselves we don't want to execute this
                        return;
                    }

                    tmpchan2.Topic.SetBy = msg.Parts[4];
                    // Set a dateTime to the beginning of unix epoch
                    DateTime dateTime = new System.DateTime(1970, 1, 1, 0, 0, 0, 0);
                    // Add the # of seconds (the date of which we set the channel topic)
                    dateTime = dateTime.AddSeconds(Int32.Parse(msg.Parts[5]));

                    tmpchan2.Topic.DateSet = dateTime;

                    this.Channels[msg.Parts[3]] = tmpchan2;
                    break;
                #endregion
                #region 004
                case "004": // Get Server Type
                    Array values = Enum.GetValues(typeof(ServerType));
                    this.me.Nick = msg.Parts[2];

                    for( int i = 0; i < ServerTypeSearch.MatchToServerType.Count(); i++ )
                    {
                        if (msg.Parts[4].StartsWith(ServerTypeSearch.MatchToServerType[i]))
                        {
                            this.serverType = (ServerType)i;
                            break;
                        }
                    }
                    break;
                #endregion
                #region 005
                case "005":
                    for (int i = 3; i < msg.Parts.Count(); i++)
                    {
                        string key = String.Empty;
                        string value = String.Empty;

                        if (msg.Parts[i].Contains("="))
                        {
                            string[] sep = msg.Parts[i].Split('=');
                            key = sep[0];
                            value = sep[1];
                        }
                        else
                        {
                            key = msg.Parts[i];
                            value = "true";
                        }

                        if (!this.attributes.ContainsKey(key))
                        {
                            this.attributes.Add(key, value);
                        }
                        else
                        {
                            this.attributes[key] = value;
                        }

                        if (key == "NAMESX")
                        {
                            this.connection.Write("PROTOCTL NAMESX");
                            this.multiModes = true;
                        }
                        else if (key == "UHNAMES")
                        {
                            this.connection.Write("PROTOCTL UHNAMES");
                            this.hostInNames = true;
                        } 
                        else if (key == "PREFIX")
                        {
                            string tosplit = value.Substring(1);
                            string[] split = tosplit.Split(')');
                            this.Attributes.Add("PREFIX_MODES", split[0]);
                            this.Attributes.Add("PREFIX_PREFIXES", split[1]);
                            //
                        }
                        else if (key == "CHANMODES")
                        {
                            string[] chanmodes = value.Split(',');

                            // Mode that adds or removes nick or address to a list
                            this.Attributes.Add("CHANMODES_A", chanmodes[0]);
                            // Changes a setting and always had a parameter
                            this.Attributes.Add("CHANMODES_B", chanmodes[1]);
                            // Only has a parameter when set
                            this.Attributes.Add("CHANMODES_C", chanmodes[2]);
                            // Never has a parameter
                            this.Attributes.Add("CHANMODES_D", chanmodes[3]);
                        }
                    }
                    break;
                #endregion
                #region CAP
                case "CAP":
                    // :leguin.freenode.net CAP goooooodab LS :account-notify extended-join identify-msg multi-prefix sasl

                    if (msg.Parts.Count() < 5)
                        break;

                    if (msg.Parts[3] != "LS")
                        break;

                    // remove leading : so we can do a direct check
                    msg.Parts[4] = msg.Parts[4].Substring(1);

                    for (int i = 4; i < msg.Parts.Count(); i++)
                    {
                        if (msg.Parts[i] == "multi-prefix")
                        {
                            this.connection.Write("CAP REQ :multi-prefix");
                            break;
                        }
                    }

                    this.connection.Write("CAP END");
                    break;
                #endregion
                #region AWWAY/UNAWAY
                case "306": // :irc.foonet.com 306 dabb :You have been marked as being away

                    if (this.OnAway != null)
                        this.OnAway(this, msg);
                    break;
                case "305": // :irc.foonet.com 305 dabb :You are no longer marked as being away
                    if (this.OnUnAway != null)
                        this.OnUnAway(this, msg);
                    break;
                #endregion
                #region INVITE
                case "INVITE": // :dab!dabitp@dab.biz INVITE dabb :#dab

                    this.OnInvite(this, msg);

                    break;
                #endregion
                #region WHOIS
                    /*
                     * 
                     * 
                    
                    :hyperion.gamergalaxy.net 307 dabbb dab :is a registered nick
                    :hyperion.gamergalaxy.net 319 dabbb dab :~#dab &#gamergalaxy ~#dab.beta &#office
                    :hyperion.gamergalaxy.net 312 dabbb dab hyperion.gamergalaxy.net :Gamer Galaxy IRC
                    :hyperion.gamergalaxy.net 313 dabbb dab :is a Network Administrator
                    :hyperion.gamergalaxy.net 310 dabbb dab :is available for help.
                    :hyperion.gamergalaxy.net 671 dabbb dab :is using a Secure Connection
                    :hyperion.gamergalaxy.net 317 dabbb dab 4405 1383796581 :seconds idle, signon time
                    :hyperion.gamergalaxy.net 318 dabbb dab :End of /WHOIS list.
                    */
                // All of these are WHOIS results.
                case "311": // :hyperion.gamergalaxy.net 311 dabbb dab dabitp dab.biz * :David

                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.Ident = msg.Parts[4];
                    this.tempWhois.Host = msg.Parts[5];
                    this.tempWhois.Name = msg.MessageLine;

                    break;
                case "378": // (IRCOP Message) :simmons.freenode.net 378 ivazquez ivazquez :is connecting from *@host ip
                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.Attributes.Add(msg.MessageLine);

                    break;
                case "379": // :irc.foonet.com 379 dab dab :is using modes +iowghaAsxN +kcfvGqso
                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.Modes = new List<string>();
                    this.tempWhois.Modes.Add(msg.Parts[7] + " " + (msg.Parts.Count() > 8 ? msg.Parts[8] : ""));

                    break;
                case "307": // :registered nick?
                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.Identified = true;

                    break;
                case "319": // Channels :hyperion.gamergalaxy.net 319 dabbb dab :~#dab &#gamergalaxy ~#dab.beta &#office
                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.Channels = new List<Channel>();

                    msg.Parts[4] = msg.Parts[4].Substring(1);

                    for (int i = 4; i < msg.Parts.Count(); i++)
                    {
                        Channel chan319 = new Channel(this);
                        chan319.Name = msg.Parts[i];
                        chan319.Display = msg.Parts[i];

                        this.tempWhois.Channels.Add(chan319);
                    }

                    break;
                case "312": // Server :hyperion.gamergalaxy.net 312 dabbb dab hyperion.gamergalaxy.net :Gamer Galaxy IRC
                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.Server = msg.Parts[4] + " " + msg.MessageLine;

                    break;
                case "330": // :navi.gamergalaxy.net 330 bad dab` dab :is logged in as

                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.IdentifiedAs = msg.Parts[4];

                    break;
                case "313": // is a net admin
                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.IrcOp = true;
                    this.tempWhois.Attributes.Add(msg.MessageLine);

                    break;
                case "310": // available for help
                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.Attributes.Add(msg.MessageLine);

                    break;
                case "671": // secure connection
                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    this.tempWhois.Attributes.Add(msg.MessageLine);

                    break;
                case "317": // idle time
                    // Either never done a whois before or recycle old whois result
                    // Meaning the whois is not thread safe.
                    if (this.tempWhois == null || tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = this.ctx.CreateUser();
                        this.tempWhois.Nick = msg.Parts[3];
                    }

                    // :hyperion.gamergalaxy.net 317 dabbb dab 4405 1383796581 :seconds idle, signon time
                    this.tempWhois.IdleTime = Int32.Parse(msg.Parts[4]);
                    this.tempWhois.SignedOn = Utility.FromUnixTime(long.Parse(msg.Parts[5]));

                    break;
                case "401": // No such nick
                case "318": // End of WHOIS results
                                /*
                                <- :irc.botsites.net 401 dab sdfasdfasdf :No such nick/channel
                                <- :irc.botsites.net 318 dab sdfasdfasdf :End of /WHOIS list.
                                */

                    if (this.tempWhois != null && tempWhois.Nick != msg.Parts[3])
                    {
                        this.tempWhois = null;
                    }

                    WhoisMessage whomsg = new WhoisMessage(msg);
                    whomsg.Who = this.tempWhois;

                    if (this.OnWhoIs != null)
                    {
                        this.OnWhoIs(this, whomsg);
                    }
                    break;

                #endregion
                #region Connection Established (End of MOTD or No MOTD)
                case "376":// End of MOTD. Meaning most spam is done. We can begin our adventure
                case "422": // No MOTD, but still, no more spam.
                    if (this.OnConnectionEstablished != null)
                    {
                        this.OnConnectionEstablished(this, msg);
                    }
                    break;
                #endregion
                #region MOTD
                case "372":
                case "375":
                    if (this.OnMotd != null)
                        this.OnMotd(this, msg);

                    break;
                #endregion
                #region LIST
                case "321":
                    this.tempList = new List<ListEntry>();
                    break;
                case "322":
                    ListEntry le = new ListEntry();
                    le.Channel = msg.Parts[3];
                    le.Users = Int32.Parse(msg.Parts[4]);
                    le.Topic = msg.MessageLine;
                    this.tempList.Add(le);
                    break;
                case "323":
                    ListMessage lm = new ListMessage(msg);

                    lm.Entries = this.tempList.ToArray();

                    if (this.OnList != null)
                    {
                        this.OnList(this, lm);
                    }
                    break;
                #endregion
                default:
                    if (this.OnUnhandledEvent != null)
                    {
                        this.OnUnhandledEvent(this, msg);
                    }
                    break;

            }
        }

        private int sortuser(User u1, User u2)
        {
            string prefixes = this.Attributes["PREFIX_PREFIXES"];

            if (u1.Modes.Count() == 0)
            {
                if (u2.Modes.Count() == 0)
                {
                    return u1.Nick.CompareTo(u2.Nick);
                }
                return 1;
            }

            if (u2.Modes.Count() == 0)
            {
                return -1;
            }

            int res = prefixes.IndexOf(u1.Modes[0][0]).CompareTo(prefixes.IndexOf(u2.Modes[0][0]));

            if (res == 0)
            {
                res = u1.Nick.CompareTo(u2.Nick);
            }

            return res;
        }

        private User tempWhois;
        private List<ListEntry> tempList;
        //private List<Channel> channels = new List<Channel>();
        private User me;
        private ServerType serverType = ServerType.Unknown;
        private Dictionary<string, string> attributes = new Dictionary<string, string>();
        private Connection connection;
        protected IContext ctx;
        private bool multiModes = false;
        private bool hostInNames = false;
    }



    static class ServerTypeSearch
    {
        public static string[] MatchToServerType = new string[] { "Unreal3.2", "ircd-seven-1" };
    }

    public enum ServerType
    {
        Unknown = 999,

        Unreal3_2 = 0, // Match # to index above

        ircd7_1 = 1
    }
}
