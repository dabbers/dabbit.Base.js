
var System = require('all')('System');
var Evnts = require('all')('dabbit/Base/Events');
var events = require('events');
var ModeModificationType = require('./ModeModificationType');
var NickChangeMessage = Evnts.NickChangeMessage;

var User = require('./User');
var Connection = require('./Connection');
var Mode = require('./Mode');

var ModeType = require('./ModeType');
var Topic = require('./Topic');
var ServerType = require('./ServerType');

var ModeType = require('./ModeType');
var RawReplies = require('./RawReplies');
var SourceEntity = require('./SourceEntity');
var SourceEntityType = require('./SourceEntityType');
var IContext = require('./IContext');

function Server(ctx, me, connection) {
    Object.call(this);

    var tempWhois = {};
    var tempList = [];

    var serverType = ServerType.Unknown; // ServerType
    connection = new System.Javascript.CheckedProperty(connection, Connection); // Connection

    ctx = new System.Javascript.CheckedProperty(ctx, IContext); // IContext type
    if (!ctx.Value) {
        throw new System.ArgumentException("ctx cannot be null");
    }

    var multiModes = false; // bool
    var hostInNames = false; // bool

    this.Attributes = {};

    this.__defineGetter__("Display", function() {
        return this.Attributes["NETWORK"];
    });

    this.Channels = {};

    this.__defineGetter__("Connection", function() {
        return connection.Value;
    });
    this.__defineSetter__("Connection", function(val) {
        connection.Value = value;
    });
    
    this.Password = "";

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
        return serverType;
    });

    me = new System.Javascript.CheckedProperty(me, User);
    if (me.Value.Modes == null) {
        me.Value.Modes = [];
    }

    this.__defineGetter__("Me", function() {
        return me.Value;
    });

    this.Channels = {}; //new Dictionary<string, Channel>(StringComparer.CurrentCultureIgnoreCase);
    this.OnNumeric = {}; //new Dictionary<RawReplies, IrcEventHandler>();

    // Add prefined and used attributes
    this.Attributes["NETWORK"] = connection.Value.Host;

    this.Attributes["STATUSMSG"] = "";
    this.Attributes["CHANTYPES"] = "";
    
    var self = this;

    this.PerformConnect = function() {

        connection.Value.ConnectAsync(rawMessageReceived);

        connection.Value.Write("CAP LS"); // Get list of extras (For multi prefix)
        
        if (!String.IsNullOrEmpty(self.Password))
        {
            connection.Value.Write("PASS " + self.Password);
        }

        connection.Value.Write("NICK " + self.Me.Nick);
        connection.Value.Write("USER " + self.Me.Ident + " * * :" + self.Me.Name);
    }

    /*
    OnConnectionEstablished; OnRawMessage; OnError; OnNewChannelJoin; OnCloseChannelPart; 
    OnJoin; OnNames; OnList; OnPart; OnQuit; OnKick; OnUnAway; OnAway; OnInvite; OnBan; 
    OnUnban;  OnWhoIs; OnMotd; OnTopic; OnNickChange; OnModeChange; OnUserModeChange; 
    OnChannelModeChange; OnChannelMessage; OnChannelMessageNotice; OnChannelAction; 
    OnChannelActionNotice; OnQueryMessage; OnQueryMessageNotice; OnQueryAction;  
    OnQueryActionNotice; OnCtcpRequest; OnCtcpReply; OnUnhandledEvent; OnNumeric;
    */
    this.Events = new events.EventEmitter();

    var rawMessageReceived = function(msg)
    {
        if (!msg)
        {
            return;
        }

        self.Events.emit('OnRawMessage', self, msg);
        var temp = NaN;

        if (!isNaN(msg.Command))
        {
            self.Events.emit(msg.Command, self, msg);
        }


        switch (msg.Command)
        {
            // ***
            // START PRIVMSG
            // ***
            case "PRIVMSG":
                var pvm = new Evnts.PrivmsgMessage(msg);

                // We are parsing a message to a channel
                pvm.To = new SourceEntity([msg.Parts[2] ], SourceEntityType.Channel);

                if (self.Attributes["STATUSMSG"].indexOf(msg.Parts[2][0].toString()) != -1)
                {
                    // Check for a wallops message (+#channel)
                    pvm.Wall = msg.Parts[2][0].toString();
                    msg.Parts[2] = msg.Parts[2].substring(1);

                    pvm.To = new SourceEntity([msg.Parts[2]], SourceEntityType.Channel);
                }

                if (self.Attributes["CHANTYPES"].indexOf(pvm.Parts[2][0].toString()) != -1)
                {
                    if (msg.Parts[3] == ":\001ACTION")
                    {
                        msg.MessageLine = msg.MessageLine.substring(8, msg.MessageLine.length - 10);
                        self.Events.emit('OnChannelAction', self, pvm);
                    }
                    else
                    {
                        self.Events.emit('OnChannelMessage', self, pvm);
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
                        msg.Parts[msg.Parts.Count() - 1] = lastpart.substring(0, lastpart.length - 1);
                    }

                    self.Events.emit('OnQueryAction', self, pvm);
                }
                else
                {
                    self.Events.emit('OnQueryMessage', self, pvm);
                }

                break;
            // ///
            // END PRIVMSG
            // ///


            // ***
            // BEGIN NOTICE
            // ***
            case "NOTICE":
                pvm = new Evnts.PrivmsgMessage(msg);

                // We are parsing a message to a channel
                pvm.To = new SourceEntity([msg.Parts[2]], SourceEntityType.Channel);

                if (self.Attributes["STATUSMSG"].indexOf(msg.Parts[2][0].toString()) != -1)
                {
                    // Check for a wallops message (+#channel)
                    pvm.Wall = msg.Parts[2][0].toString();
                    msg.Parts[2] = msg.Parts[2].substring(1);

                    pvm.To = new SourceEntity([msg.Parts[2]], SourceEntityType.Channel);
                }

                if (self.Attributes["CHANTYPES"].indexOf(pvm.Parts[2][0].toString()) != -1)
                {
                    if (msg.Parts[3] == ":\001ACTION")
                    {
                        msg.MessageLine = msg.MessageLine.substring(9, msg.MessageLine.length - 10);
                        // CTCP Action
                        self.Events.emit('OnChannelActionNotice', self, pvm);   
                    }
                    else
                    {
                        self.Events.emit('OnChannelMessageNotice', self, pvm);
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
                    self.Events.emit('OnQueryActionNotice', self, pvm);
                }
                else
                {
                    self.Events.emit('OnQueryMessageNotice', self, pvm);
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
                self.Events.emit('OnError', self, msg);
                break;
            // ///
            // END PING/ERROR
            // ///

            // ***
            // BEGIN JOIN
            // ***
            case "JOIN":
                var jm = new Evnts.JoinMessage(msg);

                if (msg.From.Parts[0] == self.Me.Nick)
                {
                    //this.Channels.TryGetValue(msg.Parts[2], out value);
                    var value = self.Channels[jm.Channel];

                    if (!value) {
                        value = ctx.Value.CreateChannel(self);
                        value.Modes = [];
                        value.Users = [];
                        value.Topic = new Topic();

                        //self.Channels[msg.Parts[2].toLowerCase()] = value;
                    }

                    value.Name = msg.Parts[2];
                    value.Display = value.Name;

                    connection.Value.Write("MODE " + jm.Channel);

                    self.Channels[jm.Channel] = value;

                    self.Events.emit('OnNewChannelJoin', self, jm);
                }
                else
                {
                    var usr = ctx.Value.CreateUser(); // User
                    usr.Nick = jm.From.Parts[0];
                    usr.Ident = jm.From.Parts[1];
                    usr.Host = jm.From.Parts[2];
                    usr.Modes = [];

                    self.Channels[jm.Channel].Users.push(usr);


                    self.Channels[jm.Channel].Users.sort(sortuser);
                    self.Events.emit('OnJoin', self, jm);
                    
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
                msg.Parts[3] = msg.Parts[3].toLowerCase();
                chnl = self.Channels[msg.Parts[3]];

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
                    if (self.Attributes["CHANMODES_B"].indexOf(modes[i].toString()) != -1)
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

                self.Channels[msg.Parts[3]] = chnl;
                self.Events.emit('324', self, msg);

                break;
            // ///
            // END CHANNEL MODES/OnJoin
            // ///

            // ***
            // BEGIN Channel Users, channel create (On Join)
            // ***
            case "329": // navi.gamergalaxy.net 329 dab #TBN 1403649503
                var chan329Val;
                msg.Parts[3] = msg.Parts[3].toLowerCase();

                chan329Val = self.Channels[msg.Parts[3]];

                if (!chan329Val) {
                    return;
                }

                chan329Val.Created = new Date(msg.Parts[4] * 1000);
                self.Events.emit('329', self, msg);

                break;
            case "353": // /Names list item :hyperion.gamergalaxy.net 353 badddd = #dab :badddd BB-Aso
                //msg.Parts[4] = msg.Parts[4].Substring(1);
                
                var vall;
                msg.Parts[4] = msg.Parts[4].toLowerCase();

                vall = self.Channels[msg.Parts[4]];

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
                var prefixes = self.Attributes["PREFIX_PREFIXES"];

                for (var i = 5; i < msg.Parts.length; i++)
                {
                    if (String.IsNullOrEmpty(msg.Parts[i]))
                        continue;

                    var tempuser = ctx.Value.CreateUser();
                    tempuser.Modes = [];

                    if (self.HostInNames)
                    {
                        var nick = msg.Parts[i].split('!');
                        if (nick.Count() > 1)
                        {
                            var identhost = nick[1].split('@');
                            tempuser.Nick = nick[0];
                            tempuser.Ident = identhost[0];
                            tempuser.Host = identhost[1];
                        }
                        else {
                            tempuser.Nick = msg.Parts[i];
                        }
                    }
                    else {
                        tempuser.Nick = msg.Parts[i];
                    }
                    
                    while (prefixes.indexOf(tempuser.Nick[0].toString()) != -1) {
                        tempuser.Modes.push(tempuser.Nick[0].toString());
                        tempuser.Nick = tempuser.Nick.substring(1);

                        tempuser.Modes.sort(function(s1, s2)
                        {
                            return prefixes.indexOf(s1[0]) - prefixes.indexOf(s2[0]);
                        });
                    }

                    //JoinMessage xinmsg = new JoinMessage(msg);
                    //joinmsg.Channel = msg.Parts[3];

                    var isExistingUserId = vall.Users.WhereId(function(p) { return p.Nick == tempuser.Nick; } ).First();

                    if (isExistingUserId == -1 || isExistingUserId == undefined) {
                        vall.Users.push(tempuser);
                    }
                    else {
                        vall.Users[isExistingUserId] = tempuser;
                    }
                    vall.Users.sort(sortuser);
                    
                }
                

                self.Channels[msg.Parts[4].toLowerCase()] = vall;
                self.Events.emit('353', self, msg);

                break;
            // ///
            // END Channel Users, channel create (On Join)
            // ///

            // ***
            // BEGIN PART
            // ***
            case "PART":
                msg.Parts[2] = msg.Parts[2].toLowerCase();

                self.Channels[msg.Parts[2]].Users.Remove
                    (self.Channels[msg.Parts[2]].Users.Where(function(u) { return u.Nick == msg.From.Parts[0] }).First());

                self.Events.emit('OnPart', self, msg);

                if (msg.From.Parts[0] == me.Nick)
                {
                    self.Channels.Remove(self.Channels.Where(function(u) { return u.Name == msg.Parts[2]; }).First());
                    self.Events.emit('OnCloseChannelPart', self, msg);
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

                for (var chn in self.Channels)
                {
                    var usr = self.Channels[chn].Users.Where(function(u) {return u.Nick == msg.From.Parts[0]; }).FirstOrDefault();

                    if (usr)
                    {
                        self.Channels[chn].Users.Remove(usr);
                        channels.push(chn);
                    }

                }
                var quit = new Evnts.QuitMessage(msg);
                quit.Channels = channels;

                self.Events.emit('OnQuit', self, quit);
                break;
            // ///
            // END QUIT
            // ///

            // ***
            // BEGIN KICK
            // ***
            case "KICK":
                // :from kick #channel nick :Reason (optional)
                msg.Parts[2] = msg.Parts[2].toLowerCase();

                self.Channels[msg.Parts[2]].Users.Remove(self.Channels[msg.Parts[2]].Users.Where(function(u) { return u.Nick == msg.Parts[3]; }).First());
                self.Events.emit('OnKick', self, msg);
                break;
            // ///
            // END KICK
            // ///

            // ***
            // BEGIN NICK
            // ***
            case "NICK":
                var nickmsg = new NickChangeMessage(msg);
                                    
                var nickchannels = []; // string

                for (var chn in self.Channels)
                {
                    chn = chn.toLowerCase();

                    //var usr = self.Channels[chn].Users.Where(function(u) { return u.Nick == msg.From.Parts[0]; }).FirstOrDefault();
                    var usridx = self.Channels[chn].Users.WhereId(function(u) { return u.Nick == msg.From.Parts[0]; }).First();

                    if (usridx != -1)
                    {
                        self.Channels[chn].Users[usridx].Nick = nickmsg.To;
                        self.Channels[chn].Users.sort(sortuser);
                        nickchannels.Add(chn);
                    }
                }

                if (nickmsg.From.Parts[0] == me.Nick)
                {
                    me.Nick = nickmsg.To.substring(1);
                }

                nickmsg.Channels = nickchannels;
                self.Events.emit('OnNickChange', self, nickmsg);
                break;
            // ///
            // END NICK
            // ///

            // ***
            // BEGIN MODE
            // ***
            case "MODE":
                var modesstring = msg.Parts[3];
                var paramsindex = 4;
                var adding = true;

                var prefixz = self.Attributes["PREFIX_PREFIXES"];
                var start = modesstring[0] == ':' ? 1 : 0;
                for (var i = start; i < modesstring.length; i++)
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


                    var mode = new Mode(msg);
                    mode.Display = mode.Character = modesstring[i];
                    mode.ModificationType = adding ? ModeModificationType.Adding : ModeModificationType.Removing;

                    if (self.Attributes["CHANMODES_A"].indexOf(modesstring[i].toString()) > -1 ||
                        self.Attributes["CHANMODES_B"].indexOf(modesstring[i].toString()) > -1 ||
                        self.Attributes["CHANMODES_C"].indexOf(modesstring[i].toString()) > -1)
                    {

                        mode.Argument = msg.Parts[paramsindex];
                        paramsindex++;
                    }
                    else
                    {
                        mode.Argument = String.Empty;
                    }

                    mode.Character = modesstring[i];


                    if (msg.Parts[2] != self.Me.Nick && self.Attributes["PREFIX_MODES"].indexOf(modesstring[i].toString()) != -1)
                    {
                        mode.Type = ModeType.User;
                        mode.Argument = msg.Parts[paramsindex++];

                        mode.Character = self.Attributes["PREFIX_PREFIXES"][self.Attributes["PREFIX_MODES"].indexOf(mode.Character)];
                        msg.Parts[2] = msg.Parts[2].toLowerCase();

                        var userid = self.Channels[msg.Parts[2].toLowerCase()].Users.WhereId(function(u) { return u.Nick == mode.Argument; }).First();

                        if (mode.ModificationType == ModeModificationType.Removing)
                        {
                            self.Channels[msg.Parts[2]].Users[userid].Modes.
                                Remove(self.Channels[msg.Parts[2]].Users[userid].Modes.
                                Where(function(m) { return m == mode.Character.toString(); }).First());

                            if (false == self.MultiModes)
                            {
                               connection.Value.Write("NAMES " + msg.Parts[2]);
                            }
                        }
                        else
                        {
                            self.Channels[msg.Parts[2]].Users[userid].Modes.push(mode.Character.toString());

                            self.Channels[msg.Parts[2]].Users[userid].Modes.sort(function(s1, s2)
                            {
                                return prefixz.indexOf(s1[0]) - (prefixz.indexOf(s2[0]));
                            });
                        }

                        self.Channels[msg.Parts[2].toLowerCase()].Users.sort(sortuser);
                    }
                    else if (msg.Parts[2] == self.Me.Nick)
                    {
                        mode.Type = ModeType.UMode;

                        if (mode.ModificationType == ModeModificationType.Adding)
                        {
                            self.Me.Modes.push(mode.Character.toString());
                        }
                        else
                        {
                            self.Me.Modes.Remove(self.Me.Modes.Where(function(m) { return m[0] == mode.Character; }).First());
                        }
                    }
                    else
                    {
                        msg.Parts[2] = msg.Parts[2].toLowerCase();

                        mode.Type = ModeType.Channel;
                        if (mode.ModificationType == ModeModificationType.Adding)
                        {
                            self.Channels[msg.Parts[2]].Modes.push(mode);

                            if (mode.Character == 'b')
                            {
                                self.Events.emit('OnBan', self, msg);
                            }
                        }
                        else
                        {
                            var modeToRemove = self.Channels[msg.Parts[2]].Modes.Where(function (m) { return m.Character == mode.Character &&
                                    mode.Argument == m.Argument; }).First();

                            self.Channels[msg.Parts[2]].Modes.Remove
                                (modeToRemove);


                            if (mode.Character == 'b')
                            {
                                self.Events.emit('OnUnban', self, msg);
                            }
                        }
                    }
                    var modeMessage = new Evnts.ModeMessage(msg);
                    modeMessage.Mode = mode;

                    self.Events.emit('OnModeChange', self, modeMessage);
                }

                break;
            // ///
            // END MODE
            // ///

            // ***
            // BEGIN 366 End of /Names List
            // ***
            case "366": // End of /names list

                var jm_ = new Evnts.JoinMessage(msg);
                jm_.Channel = msg.Parts[3].toLowerCase();

                if (self.Channels[jm_.Channel].ChannelLoaded)
                {
                    self.Events.emit('OnNewChannelJoin', self, jm_);
                }
                break;
            // ///
            // END 366 End of /Names List
            // ///

            // ***
            // BEGIN 332 Channel Topic (On Join)
            // ***
            case "332":
                var tmpchan;
                msg.Parts[3] = msg.Parts[3].toLowerCase();

                tmpchan = self.Channels[msg.Parts[3]];

                if (!tmpchan)
                {
                    // We don't want to execute in case the user called this command outside of a channel
                    return;
                }

                tmpchan.Topic = new Topic();
                tmpchan.Topic.Display = msg.MessageLine;

                self.Channels[msg.Parts[3]] = tmpchan;
                self.Events.emit('OnTopic', self, msg);
                break;
            // ///
            // END 322 Channel TOpic (OnJoin)
            // ///

            // ***
            // BEGIN 333 Channel Topic set by and when (on join)
            // ***
            case "333": // Who set the topic and when they set it
                msg.Parts[3] = msg.Parts[3].toLowerCase();

                var tmpchan2 = self.Channels[msg.Parts[3]];

                if (!tmpchan2)
                {
                    // If a user calls topic by themselves we don't want to execute this
                    return;
                }

                tmpchan2.Topic.SetBy = msg.Parts[4];
                // Set a dateTime to the beginning of unix epoch
                //DateTime dateTime = new System.DateTime(1970, 1, 1, 0, 0, 0, 0);
                // Add the # of seconds (the date of which we set the channel topic)
                //dateTime = dateTime.AddSeconds(Int32.Parse(msg.Parts[5]));

                tmpchan2.Topic.DateSet = new Date(msg.Parts[5] * 1000);

                self.Channels[msg.Parts[3]] = tmpchan2;
                break;
            // ///
            // END 333 Channel Topic set by and when (on join)
            // ///

            // ***
            // BEGIN 004
            // ***
            case "004": // Get Server Type
                //var values = Enum.GetValues(typeof(ServerType));

                self.Me.Nick = msg.Parts[2];
                serverType = ServerType.Unknown;

                for( var serverType in ServerType)
                {
                    if (msg.Parts[4].startsWith(serverType))
                    {
                        serverType = serverType;
                        break;
                    }
                }
                break;
            // ///
            // END 004
            // ///

            // ***
            // BEGIN 005
            // ***
            case "005":
                for (var i = 3; i < msg.Parts.length; i++)
                {
                    var key = String.Empty;
                    var value = String.Empty;

                    if (msg.Parts[i].indexOf("=") > -1)
                    {
                        var sep = msg.Parts[i].split('=');
                        key = sep[0];
                        value = sep[1];
                    }
                    else
                    {
                        key = msg.Parts[i];
                        value = "true";
                    }

                    self.Attributes[key] = value;


                    if (key == "NAMESX")
                    {
                        connection.Value.Write("PROTOCTL NAMESX");
                        multiModes = true;
                    }
                    else if (key == "UHNAMES")
                    {
                        connection.Value.Write("PROTOCTL UHNAMES");
                        hostInNames = true;
                    } 
                    else if (key == "PREFIX")
                    {
                        var tosplit = value.substring(1);
                        var split = tosplit.split(')');
                        self.Attributes["PREFIX_MODES"] = split[0];
                        self.Attributes["PREFIX_PREFIXES"] = split[1];
                        //
                    }
                    else if (key == "CHANMODES")
                    {
                        var chanmodes = value.split(',');

                        // Mode that adds or removes nick or address to a list
                        self.Attributes["CHANMODES_A"] = chanmodes[0];
                        // Changes a setting and always had a parameter
                        self.Attributes["CHANMODES_B"] = chanmodes[1];
                        // Only has a parameter when set
                        self.Attributes["CHANMODES_C"] = chanmodes[2];
                        // Never has a parameter
                        self.Attributes["CHANMODES_D"] = chanmodes[3];
                    }
                }
                break;
            // ///
            // END 004
            // ///
            
            // ***
            // BEGIN CAP
            // **
            case "CAP":
                // :leguin.freenode.net CAP goooooodab LS :account-notify extended-join identify-msg multi-prefix sasl
                if (msg.Parts.length < 5)
                    break;

                if (msg.Parts[3] != "LS")
                    break;

                // remove leading : so we can do a direct check
                msg.Parts[4] = msg.Parts[4].substring(1);

                for (var i = 4; i < msg.Parts.Count(); i++)
                {
                    if (msg.Parts[i] == "multi-prefix")
                    {
                        connection.Value.Write("CAP REQ :multi-prefix");
                        break;
                    }
                }

                connection.Value.Write("CAP END");
                break;
            // /// 
            // END CAP
            // ///

            // ***
            // BEGIN AWWAY/UNAWAY
            // ***
            case "306": // :irc.foonet.com 306 dabb :You have been marked as being away

                self.Events.emit('OnAway', self, msg);
            case "305": // :irc.foonet.com 305 dabb :You are no longer marked as being away
                self.Events.emit('OnUnAway', self, msg);
                break;
            // ///
            // END AWAY/UNAWAY
            // ///

            // ***
            // BEGIN INVITE
            // ***
            case "INVITE": // :dab!dabitp@dab.biz INVITE dabb :#dab
                msg.Parts[3] = msg.Parts[3].toLowerCase();
                self.Events.emit('OnInvite', self, msg);
                break;
            // ///
            // END INVITE
            // ///

            // ***
            // BEGIN WHOIS
            // ***
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
                // Meaning the whois is not thre`ad safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                tempWhois.Ident = msg.Parts[4];
                tempWhois.Host = msg.Parts[5];
                tempWhois.Name = msg.MessageLine;

                break;
            case "378": // (IRCOP Message) :simmons.freenode.net 378 ivazquez ivazquez :is connecting from *@host ip
                // Either never done a whois before or recycle old whois result
                // Meaning the whois is not thread safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                tempWhois.Attributes.Add(msg.MessageLine);

                break;
            case "379": // :irc.foonet.com 379 dab dab :is using modes +iowghaAsxN +kcfvGqso
                // Either never done a whois before or recycle old whois result
                // Meaning the whois is not thread safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                tempWhois.Modes = [];
                tempWhois.Modes.Add(msg.Parts[7] + " " + (msg.Parts.Count() > 8 ? msg.Parts[8] : ""));

                break;
            case "307": // :registered nick?
                // Either never done a whois before or recycle old whois result
                // Meaning the whois is not thread safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                tempWhois.Identified = true;

                break;
            case "319": // Channels :hyperion.gamergalaxy.net 319 dabbb dab :~#dab &#gamergalaxy ~#dab.beta &#office
                // Either never done a whois before or recycle old whois result
                // Meaning the whois is not thread safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                tempWhois.Channels = [];

                msg.Parts[4] = msg.Parts[4].Substring(1);

                for (var i = 4; i < msg.Parts.Count(); i++)
                {
                    // This channel doesn't represent a gui item
                    var chan319 = new Channel(self);
                    chan319.Name = msg.Parts[i];
                    chan319.Display = msg.Parts[i];

                    tempWhois.Channels.Add(chan319);
                }

                break;
            case "312": // Server :hyperion.gamergalaxy.net 312 dabbb dab hyperion.gamergalaxy.net :Gamer Galaxy IRC
                // Either never done a whois before or recycle old whois result
                // Meaning the whois is not thread safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                tempWhois.Server = msg.Parts[4] + " " + msg.MessageLine;

                break;
            case "330": // :navi.gamergalaxy.net 330 bad dab` dab :is logged in as

                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                tempWhois.IdentifiedAs = msg.Parts[4];

                break;
            case "313": // is a net admin
                // Either never done a whois before or recycle old whois result
                // Meaning the whois is not thread safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                tempWhois.IrcOp = true;
                tempWhois.Attributes.Add(msg.MessageLine);

                break;
            case "310": // available for help
                // Either never done a whois before or recycle old whois result
                // Meaning the whois is not thread safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }
                tempWhois.Attributes.Add(msg.MessageLine);

                break;
            case "671": // secure connection
                // Either never done a whois before or recycle old whois result
                // Meaning the whois is not thread safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                tempWhois.Attributes.Add(msg.MessageLine);

                break;
            case "317": // idle time
                // Either never done a whois before or recycle old whois result
                // Meaning the whois is not thread safe.
                if (!tempWhois || tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = ctx.Value.CreateUser();
                    tempWhois.Nick = msg.Parts[3];
                }

                // :hyperion.gamergalaxy.net 317 dabbb dab 4405 1383796581 :seconds idle, signon time
                tempWhois.IdleTime = parseInt(msg.Parts[4]);
                tempWhois.SignedOn = new Date(msg.Parts[5] * 1000);

                break;
            case "401": // No such nick
            case "318": // End of WHOIS results
                            /*
                            <- :irc.botsites.net 401 dab sdfasdfasdf :No such nick/channel
                            <- :irc.botsites.net 318 dab sdfasdfasdf :End of /WHOIS list.
                            */

                if (tempWhois && tempWhois.Nick != msg.Parts[3])
                {
                    tempWhois = null;
                }

                var whomsg = new WhoisMessage(msg);
                whomsg.Who = tempWhois;

                self.Events.emit('OnWhoIs', self, msg);
                break;

            // ///
            // END 
            // ///

            // ***
            // BEGIN Connection Established (End of MOTD or No MOTD)
            // ***
            case "376":// End of MOTD. Meaning most spam is done. We can begin our adventure
            case "422": // No MOTD, but still, no more spam.
                self.Events.emit('OnConnectionEstablished', self, msg);
                break;
            // ///
            // END Connection Established (End of MOTD or No MOTD)
            // ///
            
            // ***
            // BEGIN MOTD
            // ***
            case "372":
            case "375":
                self.Events.emit('OnMotd', self, msg);
                break;
            // ///
            // END MOTD
            // ///

            // ***
            // BEGIN LIST
            // ***
            case "321":
                tempList = [];
                break;
            case "322":
                var le = new Evnts.ListEntry();

                le.Channel = msg.Parts[3];
                le.Users = parseInt(msg.Parts[4]);
                le.Topic = msg.MessageLine;
                tempList.Add(le);
                break;
            case "323":
                var lm = new EventListMessage(msg);

                lm.Entries = tempList.ToArray();
                self.Events.emit('OnList', self, lm);
                break;
            // ///
            // END LIST
            // ///
            default:
                self.Events.emit('OnUnhandledEvent', self, lm);
                break;

        }
    }

    var sortuser = function(u1, u2)
    {
        var prefixes = self.Attributes["PREFIX_PREFIXES"];

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

        var res = prefixes.indexOf(u1.Modes[0][0]) - prefixes.indexOf(u2.Modes[0][0]);

        if (res == 0)
        {
            res = u1.Nick.CompareTo(u2.Nick);
        }

        return res;
    }

}

System.Javascript.Inherit(System.Object, Server);

//exports.System = { "Javascript": { "CheckedProperty" : CheckedProperty } };
module.exports = Server;