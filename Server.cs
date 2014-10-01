var User = require('./User');
var Connection = require('./Connection');
var Mode = require('./Mode');
var Topic = require('./Topic');
var ServerType = require('./ServerType');
var ModeType = require('./ModeType');
var RawReplies = require('./RawReplies');
var SourceEntity = require('./SourceEntity');
var SourceEntityType = require('./SourceEntityType');
var System = require('all')('System');
var Events = require('all')('dabbit/Base/Events');

function Server(ctx, me, connection) {

    this.tempWhois = {};
    this.tempList = [];

    private ServerType serverType = ServerType.Unknown; // ServerType
    var connection = new System.Javascript.CheckedProperty(connection, Connection); // Connection

    ctx = new System.Javascript.CheckedProperty(ctx, boolean); // IContext type
    if (!ctx.Value) {
        throw new System.ArgumentException("ctx cannot be null");
    }

    var multiModes = new System.Javascript.CheckedProperty(false, boolean); // bool
    var hostInNames = new System.Javascript.CheckedProperty(false, boolean); // bool

    this.Attributes = {};

    this.__defineGetter__("Display", function() {
        return this.Attributes["NETWORK"];
    });

    this.Channels = {};

    this.__defineGetter__("Connection", function() {
        return connection.Value;
    });
    this.__defineSetter__("Connection", function(val) {
        connection.Valuie = value;
    });
    
    this.Password = String.Empty;

    this.__defineGetter__("MultiModes", function() {
        return multiModes;
    });
    this.__defineGetter__("HostInNames", function() {
        return hostInNames;
    });

    this.__defineGetter__("Name", function() {
        return this.Display;
    });
    this.__defineSetter__("Name", function(val) {
        this.Attributes["NETWORK"] = value;
    });

    this.__defineGetter__("Type", function() {
        return this.serverType;
    });

    me = new System.Javascript.CheckedProperty(me, User);
    if (me.Modes == null) {
        me.Modes = new List<string>();
    }

    this.__defineGetter__("Me", function() {
        return me.Value;
    });

    this.ctx = ctx;
    this.Channels = {}; //new Dictionary<string, Channel>(StringComparer.CurrentCultureIgnoreCase);
    this.OnNumeric = {}; //new Dictionary<RawReplies, IrcEventHandler>();

    connection.Value.RawMessageReceived = this.rawMessageReceived;

    // Add prefined and used attributes
    this.Attributes["NETWORK"] = connection.Value.Host;
    this.Attributes["STATUSMSG"] = "";
    this.Attributes["CHANTYPES"] = "";

    connection.Value.Connect();

    connection.Value.Write("CAP LS"); // Get list of extras (For multi prefix)
    
    if (!String.IsNullOrEmpty(this.Password))
    {
        connection.Value.Write("PASS " + this.Password);
    }

    connection.Value.Write("NICK " + this.Me.Nick);
    connection.Value.Write("USER " + this.Me.Ident + " * * :" + this.Me.Name);

    /*
    OnConnectionEstablished; OnRawMessage; OnError; OnNewChannelJoin; OnCloseChannelPart; 
    OnJoin; OnNames; OnList; OnPart; OnQuit; OnKick; OnUnAway; OnAway; OnInvite; OnBan; 
    OnUnban;  OnWhoIs; OnMotd; OnTopic; OnNickChange; OnModeChange; OnUserModeChange; 
    OnChannelModeChange; OnChannelMessage; OnChannelMessageNotice; OnChannelAction; 
    OnChannelActionNotice; OnQueryMessage; OnQueryMessageNotice; OnQueryAction;  
    OnQueryActionNotice; OnCtcpRequest; OnCtcpReply; OnUnhandledEvent; OnNumeric;
    */
    this.Events = new require('events').EventEmitter;

    var rawMessageReceived(msg)
    {
        if (!msg)
        {
            return;
        }

        this.Events.emit('OnRawMessage', this, msg);
        var temp = NaN;

        if (!isNaN(temp = msg.Command))
        {
            this.Events.emit(temp, this, msg);
        }


        switch (msg.Command)
        {
            // ***
            // START PRIVMSG
            // ***
            case "PRIVMSG":
                var pvm = new Events.PrivmsgMessage(msg);

                // We are parsing a message to a channel
                pvm.To = new SourceEntity([msg.Parts[2] ], SourceEntityType.Channel);

                if (this.Attributes["STATUSMSG"].indexOf(msg.Parts[2][0].toString()) != -1)
                {
                    // Check for a wallops message (+#channel)
                    pvm.Wall = msg.Parts[2][0].toString();
                    msg.Parts[2] = msg.Parts[2].substring(1);

                    pvm.To = new SourceEntity([msg.Parts[2]], SourceEntityType.Channel);
                }

                if (this.Attributes["CHANTYPES"].indexOf(pvm.Parts[2][0].toString()) != -1)
                {
                    if (msg.Parts[3] == ":\001ACTION")
                    {
                        msg.MessageLine = msg.MessageLine.substring(8, msg.MessageLine.length - 10);
                        // CTCP Action
                        if (this.OnChannelAction != null)
                        {
                            this.OnChannelAction(this, pvm);
                        }
                    }
                    else
                    {
                        this.Events.emit('OnChannelMessage', this, pvm);
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
                        msg.MessageLine = msg.MessageLine.substring(9, msg.MessageLine.length - 1);
                        var lastpart = msg.Parts[msg.Parts.Count() - 1];
                        msg.Parts[msg.Parts.Count() - 1] = lastpart.Substring(0, lastpart.length - 1);
                    }

                    this.Events.emit('OnQueryAction', this, pvm);
                }
                else
                {
                    this.Events.emit('OnQueryMessage', this, pvm);
                }

                break;
            // ///
            // END PRIVMSG
            // ///


            // ***
            // BEGIN NOTICE
            // ***
            case "NOTICE":
                pvm = new Events.PrivmsgMessage(msg);

                // We are parsing a message to a channel
                pvm.To = new SourceEntity([msg.Parts[2]], SourceEntityType.Channel);

                if (this.Attributes["STATUSMSG"].indexOf(msg.Parts[2][0].toString()) != -1)
                {
                    // Check for a wallops message (+#channel)
                    pvm.Wall = msg.Parts[2][0].toString();
                    msg.Parts[2] = msg.Parts[2].substring(1);

                    pvm.To = new SourceEntity([msg.Parts[2]], SourceEntityType.Channel);
                }

                if (this.Attributes["CHANTYPES"].indexOf(pvm.Parts[2][0].toString()) != -1)
                {
                    if (msg.Parts[3] == ":\001ACTION")
                    {
                        msg.MessageLine = msg.MessageLine.substring(9, msg.MessageLine.length - 10);
                        // CTCP Action
                        this.Events.emit('OnChannelActionNotice', this, pvm);   
                    }
                    else
                    {
                        this.Events.emit('OnChannelMessageNotice', this, pvm);
                    }

                    break;
                }

                // A message is being sent to a non-channel which means it HAS to be going to us.
                pvm.To = new SourceEntity(pvm.To.Parts, SourceEntityType.Client);

                if (msg.Parts[3] == ":\001ACTION")
                {
                    // Remove ending \001
                    if (msg.MessageLine[msg.MessageLine.length - 1] == '\u0001')
                    {
                        msg.MessageLine = msg.MessageLine.substring(8, msg.MessageLine.length - 1);
                        var lastpart = msg.Parts[msg.Parts.length - 1];
                        msg.Parts[msg.Parts.length - 1] = lastpart.substring(0, lastpart.length - 1);
                    }

                    // CTCP Action
                    this.Events.emit('OnQueryActionNotice', this, pvm);
                }
                else
                {
                    this.Events.emit('OnQueryMessageNotice', this, pvm);
                }

                break;
            // ///
            // END NOTICE
            // ///

            // ***
            // BEGIN PING/ERROR
            // ***
            case "PING":
                connection.Value.Write("PONG " + msg.Parts[1]);
                break;
            case "ERROR":
                this.Events.emit('OnError', this, msg);
                break;
            // ///
            // END PING/ERROR
            // ///

            // ***
            // BEGIN JOIN
            // ***
            case "JOIN":
                var jm = new Events.JoinMessage(msg);
                if (msg.From.Parts[0] == this.Me.Nick)
                {
                    //this.Channels.TryGetValue(msg.Parts[2], out value);
                    var value = this.Channels[msg.Parts[2].toLowerCase()];

                    if (!value)
                    {
                        value = ctx.CreateChannel(this);
                        value.Modes = [];
                        value.Users = []
                        value.Topic = new Topic();

                        value = this.Channels[msg.Parts[2].toLowerCase()];
                    }

                    value.Name = msg.Parts[2];
                    value.Display = value.Name;

                    connection.Value.Write("MODE " + jm.Channel);

                    this.Channels[msg.Parts[2]] = value;
                    this.Events.emit('OnNewChannelJoin', this, jm);
                }
                else
                {
                    var usr = ctx.CreateUser(); // User
                    usr.Nick = jm.From.Parts[0];
                    usr.Ident = jm.From.Parts[1];
                    usr.Host = jm.From.Parts[2];
                    usr.Modes = [];

                    this.Channels[jm.Channel].Users.push(usr);


                    this.Channels[jm.Channel].Users.sort(sortuser);
                    this.Events.emit('OnJoin', this, jm);
                    
                }
                break;
            // ///
            // END JOIN
            // ///

            // ***
            // BEGIN CHANNEL MODES/OnJoin
            // ***
            case "324": // :hyperion.gamergalaxy.net 324 dabbbb #dab +r
                var chnl;
                chnl = this.Channels[msg.Parts[3]];

                if (!chnl)
                {
                    // do nothing because we aren't a member of this channel
                    return;
                }

                //chnl.Modes = new List<Mode>();

                var modes = msg.Parts[4];
                var paramidx = 5;

                // 1 was from the + sign in the model.
                for (var i = 1; i < modes.length; i++)
                {
                    var mode = new Mode();

                    // Is this a mode with a parameter?
                    if (this.Attributes["CHANMODES_B"].indexOf(modes[i].toString()) != -1)
                    {
                        mode.Argument = msg.Parts[paramidx++];
                    }
                    else
                    {
                        mode.Argument = String.Empty;
                    }

                    mode.Character = modes[i];
                    mode.Type = ModeType.Channel;
                    chnl.Modes.push(mode);
                }

                this.Channels[msg.Parts[3]] = chnl;
                this.Events.emit('324', this, msg);

                break;
            // ///
            // END CHANNEL MODES/OnJoin
            // ///

            // ***
            // BEGIN Channel Users, channel create (On Join)
            // ***
            case "329": // navi.gamergalaxy.net 329 dab #TBN 1403649503
                var chan329Val;

                chan329Val = this.Channels[msg.Parts[3]];

                if (!chan329Val) {
                    return;
                }

                chan329Val.Created = new Date(msg.Parts[4] * 1000);
                this.Events.emit('329', this, msg);

                break;
            case "353": // /Names list item :hyperion.gamergalaxy.net 353 badddd = #dab :badddd BB-Aso
                //msg.Parts[4] = msg.Parts[4].Substring(1);
                
                var vall;
                vall = this.Channels[msg.Parts[4]];

                // Should NEVER HAPPEN
                if (!vall)
                {
                    // We don't want to execute this
                    return;
                }

                if (!vall.Users)
                {
                    vall.Users = []; // User[]
                }

                msg.Parts[5] = msg.Parts[5].substring(1);
                var prefixes = this.Attributes["PREFIX_PREFIXES"];

                for (var i = 5; i < msg.Parts.length; i++)
                {
                    if (String.IsNullOrEmpty(msg.Parts[i]))
                        continue;

                    User tempuser = ctx.CreateUser();
                    tempuser.Modes = [];

                    if (this.HostInNames)
                    {
                        var nick = msg.Parts[i].split('!');
                        if (nick.Count() > 1)
                        {
                            string[] identhost = nick[1].split('@');
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
                    
                    while (prefixes.indexOf(tempuser.Nick[0].toString()) != -1)
                    {
                        tempuser.Modes.push(tempuser.Nick[0].toString());
                        tempuser.Nick = tempuser.Nick.substring(1);

                        tempuser.Modes.sort(delegate(string s1, string s2)
                        {
                            return prefixes.indexOf(s1[0]) - prefixes.indexOf(s2[0]);
                        });
                    }
                    

                    //JoinMessage xinmsg = new JoinMessage(msg);
                    //joinmsg.Channel = msg.Parts[3];


                    vall.Users.push(tempuser);

                    vall.Users.sort(sortuser);
                }


                this.Channels[msg.Parts[5]] = vall;
                this.Events.emit('353', this, msg);

                break;
            // ///
            // END Channel Users, channel create (On Join)
            // ///

            // ***
            // BEGIN PART
            // ***
            case "PART":
                this.Channels[msg.Parts[2]].Users.Remove
                    (this.Channels[msg.Parts[2]].Users.Where(function(u) { return u.Nick == msg.Parts[0] }).First());

                this.Events.emit('OnPart', this, msg);

                if (msg.From.Parts[0] == me.Nick)
                {
                    this.Channels.splice(msg.Parts[2], );
                    this.Events.emit('OnCloseChannelPart', this, msg);
                }

                break;
            // ///
            // End PART
            // ///
            
            // ***
            // QUIT
            // ***
            case "QUIT":
                var channels = [];

                for (var chn = 0; chn < this.Channels.length; chn++)
                {
                    var usr = this.Channels[chn].Users.Where(u => u.Nick == msg.From.Parts[0]).FirstOrDefault();

                    if (usr != null)
                    {
                        this.Channels[chn].Users.Remove(usr);
                        channels.push(chn.Key);
                    }

                }
                var quit = new QuitMessage(msg);
                quit.Channels = channels;

                this.Events.emit('OnCloseChannelPart', this, quit);
                break;
            // ///
            // END QUIT
            // ///

            // ***
            // BEGIN KICK
            // ***
            case "KICK":
                // :from kick #channel nick :Reason (optional)

                this.Channels[msg.Parts[2]].Users.Remove(this.Channels[msg.Parts[2]].Users.Where(function(u) { return u.Nick == msg.Parts[3]; }).First());
                this.Events.emit('OnKick', this, msg);
                break;
            // ///
            // END KICK
            // ///

            // ***
            // BEGIN NICK
            // ***
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
                        connection.Value.Write("PROTOCTL NAMESX");
                        this.multiModes = true;
                    }
                    else if (key == "UHNAMES")
                    {
                        connection.Value.Write("PROTOCTL UHNAMES");
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
                        connection.Value.Write("CAP REQ :multi-prefix");
                        break;
                    }
                }

                connection.Value.Write("CAP END");
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

}
