require('./g_ArrayExtensions');
var Evnts = require('./Events');
var ModeModificationType = require('./ModeModificationType');
var NickChangeMessage = Evnts.NickChangeMessage;

var User = require('./User');
var Channel = require('./Channel');
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


var tempWhois = {};
var tempList = [];
var server = undefined;

function CompareTo(a, s) {
  var f = a.toLowerCase();
  s = s.toLowerCase();

  var lon = (f.length > s.length ? f.length : s.length);


  for(var i = 0; i < lon; i++)
  {
      if (!f[i])
          return -1;
      if (!s[i])
          return 1;

      if (f[i] < s[i])
          return -1;
      else if (f[i] > s[i])
          return 1;
  }
  
  return 0;
}


function sortuser(u1, u2)
{
    var prefixes = server.Attributes["PREFIX_PREFIXES"];

    if (u1.Modes.length == 0)
    {
        if (u2.Modes.length == 0)
        {
            return CompareTo(u1.Nick, u2.Nick);
        }
        return 1;
    }

    if (u2.Modes.length == 0)
    {
        return -1;
    }

    var res = prefixes.indexOf(u1.Modes[0][0]) - prefixes.indexOf(u2.Modes[0][0]);

    if (res == 0)
    {
        res = CompareTo(u1.Nick, u2.Nick);
    }

    return res;
}

/*
 * the self variable needs to have a Me, Attributes, Channels, Events, IsThisMe()
 *
 */
function parse(self, ctx, msg)
{
    server = self;
    if (!msg)
    {
        return;
    }

    self.Events.emit('OnRawMessage', self, msg);
    var temp = NaN;

    if (!isNaN(msg.Command))
    {
        self.Events.emit("Raw" + msg.Command, self, msg);
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
            pvm.Wall = "";
            while (self.Attributes["STATUSMSG"].indexOf(msg.Parts[2][0].toString()) != -1) {
                pvm.Wall += msg.Parts[2][0].toString();
                msg.Parts[2] = msg.Parts[2].substring(1);

            }

            if (self.Attributes["CHANTYPES"].indexOf(pvm.Parts[2][0].toString()) != -1)
            {
                pvm.To = new SourceEntity([msg.Parts[2]], SourceEntityType.Channel);

                if (pvm.Parts[3][1] == "\001")
                {
                    var firstLength = pvm.Parts[3].substring(2).length + 1;  // length of ":\1WORD "
                    pvm.MessageLine = pvm.MessageLine.substring(firstLength, pvm.MessageLine.length - 1);
                    self.Events.emit('OnChannelCtcp', self, pvm);
                }
                else
                {
                    self.Events.emit('OnChannelMessage', self, pvm);
                }
            }
            else
            {
                // A message is being sent to a non-channel which means it HAS to be going to us.
                pvm.To = new SourceEntity(pvm.To.Parts, SourceEntityType.Client);

                if (pvm.Parts[3][1] == "\001")
                {
                    // Remove ending \001
                    //if (msg.MessageLine[msg.MessageLine.Length - 1] == '\u0001')
                    //{
                   var firstLength = pvm.Parts[3].substring(2).length + 1; // length of ":\1WORD " 

                    pvm.MessageLine = pvm.MessageLine.substring(firstLength, pvm.MessageLine.length - 1);
                    var lastpart = pvm.Parts[pvm.Parts.length - 1];
                    pvm.Parts[pvm.Parts.length - 1] = lastpart.substring(0, lastpart.length - 1); 
                    //}

                    self.Events.emit('OnQueryCtcp', self, pvm);
                }
                else
                {
                    self.Events.emit('OnQueryMessage', self, pvm);
                }
            }

            self.Events.emit('OnPrivmsg', self, pvm);
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
                pvm.Parts[2] = msg.Parts[2].substring(1);

                pvm.To = new SourceEntity([pvm.Parts[2]], SourceEntityType.Channel);
            }

            if (self.Attributes["CHANTYPES"].indexOf(pvm.Parts[2][0].toString()) != -1)
            {
                if (msg.Parts[3][1] == "\001")
                {
                    var firstLength = msg.Parts[3].substring(2).length + 1; // length of ":\1WORD " 
                    pvm.MessageLine = msg.MessageLine.substring(firstLength, msg.MessageLine.length - 10);
                    // CTCP Action
                    self.Events.emit('OnChannelCtcpNotice', self, pvm);   
                }
                else
                {
                    self.Events.emit('OnChannelMessageNotice', self, pvm);
                }
            }
            else
            {
                // A message is being sent to a non-channel which means it HAS to be going to us.
                pvm.To = new SourceEntity(pvm.To.Parts, SourceEntityType.Client);

                if (msg.Parts[3][1] == "\001")
                {
                    var firstLength = pvm.Parts[3].substring(2).length + 1; // length of ":\1WORD " 
                    // Remove ending \001
                    //if (pvm.MessageLine[msg.MessageLine.length - 1] == '\u0001')
                    //{
                    pvm.MessageLine = pvm.MessageLine.substring(firstLength, pvm.MessageLine.length - 1);
                    var lastpart = pvm.Parts[pvm.Parts.length - 1];
                    pvm.Parts[pvm.Parts.length - 1] = lastpart.substring(0, lastpart.length - 1);
                    //}

                    // CTCP Action
                    self.Events.emit('OnQueryCtcpNotice', self, pvm);
                }
                else
                {
                    self.Events.emit('OnQueryMessageNotice', self, pvm);
                }
            }

            self.Events.emit('OnNotice', self, pvm);
            break;
        // ///
        // END NOTICE
        // ///

        // ***
        // BEGIN PING/ERROR
        // ***
        case "PING":
            self.Events.emit('OnPing', self, msg);
            break;
        case "PONG":
            self.Events.emit('OnPong', self, msg);
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
            var index = 0;

            //if (msg.From.Parts[0] == self.Me.Nick)
            if (self.IsThisMe(msg.From.Parts[0]))
            {
                //this.Channels.TryGetValue(msg.Parts[2], out value);
                var value = self.Channels[jm.Channel];

                if (!value) {
                    value = ctx.CreateChannel(self);
                    value.Modes = [];
                    value.Topic = new Topic();
                }

                value.Name = msg.Parts[2];
                value.Display = value.Name;

                self.Channels[jm.Channel] = value;
                jm.Chanobj = value;

                self.Events.emit('OnNewChannelJoin', self, jm);
            }
            else
            {
                var usr = ctx.CreateUser(); // User
                usr.Nick = jm.From.Parts[0];
                usr.Ident = jm.From.Parts[1];
                usr.Host = jm.From.Parts[2];
                usr.Modes = [];
                
                // TODO: Check for existing user first
                if (Array_Where(self.Channels[jm.Channel].Users, function(p) { return p.Nick == jm.From.Parts[0];}).length == 0) {
                    self.Channels[jm.Channel].Users.push(usr);
                    self.Channels[jm.Channel].Users.sort(sortuser);

                    for(index = 0; self.Channels[jm.Channel].Users[index].Nick != usr.Nick; index++);
                }
                
            }
            jm.Chanobj = value;
            jm.UserIndex = index;

            self.Events.emit('OnJoin', self, jm);
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
                    mode.Argument = "";
                }

                if (Array_Where(chnl.Modes, function(p) { return p.Character == modes[i]}).length == 0) {
                    mode.Character = modes[i];
                    mode.Type = ModeType.Channel;
                    chnl.Modes.push(mode);
                }
    
            }

            self.Channels[msg.Parts[3]] = chnl;
            break;
        // ///
        // END CHANNEL MODES/OnJoin
        // ///

        // ***
        // BEGIN Channel Users, channel create (On Join)
        // ***
        case "329": // navi.gamergalaxy.net 329 dab #TBN 1403649503
            msg.Parts[3] = msg.Parts[3].toLowerCase();
            self.Channels[msg.Parts[3]].Created = new Date(msg.Parts[4] * 1000);
            break;
        case "353": // /Names list item :hyperion.gamergalaxy.net 353 badddd = #dab :badddd BB-Aso                
            var vall;
            msg.Parts[4] = msg.Parts[4].toLowerCase();

            vall = self.Channels[msg.Parts[4]];

            // Could happen if we are inspecting a channel we aren't in.
            if (!vall)
            {
                // We don't want to execute this
                return;
            }

            if (!vall.Users) {
                vall.Users = []; // User[]
            }

            msg.Parts[5] = msg.Parts[5].substring(1);
            var prefixes = self.Attributes["PREFIX_PREFIXES"];

            for (var i = 5; i < msg.Parts.length; i++)
            {
                if (!msg.Parts[i])
                    continue;

                var tempuser = ctx.CreateUser();
                tempuser.Modes = [];

                if (self.HostInNames) {
                    var nick = msg.Parts[i].split('!');
                    
                    // In case there is a disperity between setting the flag, and actually sending the command to enable the protocol change
                    if (nick.length > 1)
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
                
                // Even if multiple modes isn't enabled, this loop will detect multiple 
                // or just 1.
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

                var isExistingUserId = Array_WhereId(vall.Users, function(p) { return p.Nick == tempuser.Nick; } )[0];

                if (isExistingUserId == -1 || isExistingUserId == undefined) {
                    vall.Users.push(tempuser);
                }
                else {
                    vall.Users[isExistingUserId] = tempuser;
                }
                vall.Users.sort(sortuser);
                
            }
            

            self.Channels[msg.Parts[4].toLowerCase()] = vall;
            break;
        // ///
        // END Channel Users, channel create (On Join)
        // ///

        // ***
        // BEGIN PART
        // ***
        case "PART":
            msg.Parts[2] = msg.Parts[2].toLowerCase();

            var part_usr = Array_Where(self.Channels[msg.Parts[2]].Users, function(u) { return u.Nick == msg.From.Parts[0] })[0];

            if (part_usr != undefined) {
                Array_Remove(self.Channels[msg.Parts[2]].Users, part_usr);
            }
            self.Events.emit('OnPart', self, msg);

            //if (msg.From.Parts[0] == self.Me.Nick)
            if (self.IsThisMe(msg.From.Parts[0], "PART"))
            {
                delete self.Channels[Array_Where(self.Channels, function(u) { return u.Name == msg.Parts[2]; })[0]];
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
                var usr = Array_WhereId(self.Channels[chn].Users, function(u) { return u.Nick == msg.From.Parts[0]; })[0];

                if (usr && usr != -1) 
                {
                    Array_Remove(self.Channels[chn].Users, usr);
                    channels.push({ "channel": chn, "before": usr });
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

            //var kick_usr = Array_Where(self.Channels[msg.Parts[2]].Users, function(u) { return u.Nick == msg.Parts[3]; })[0];
            var kick_usr = Array_WhereId(self.Channels[msg.Parts[2]].Users, function (u) { return u.Nick == msg.Parts[3]; })[0];

            if (kick_usr != -1 && kick_usr != undefined) {
                Array_Remove(self.Channels[msg.Parts[2]].Users, self.Channels[msg.Parts[2]].Users[kick_usr]);
            }
            msg.Delta = kick_usr;
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
                

                //var usr = self.Channels[chn].Users.Where(function(u) { return u.Nick == msg.From.Parts[0]; }).FirstOrDefault();
                var usridx = Array_WhereId(self.Channels[chn.toLowerCase()].Users, function(u) { return u.Nick == msg.From.Parts[0]; })[0];
                var chnnl = { "channel": chn.toLowerCase(), "before": usridx, "after": 0 };

                if (usridx != -1)
                {
                    self.Channels[chn].Users[usridx].Nick = nickmsg.To;
                    self.Channels[chn].Users.sort(sortuser);

                    var usridx2 = Array_WhereId(self.Channels[chn].Users, function (u) { return u.Nick == nickmsg.To; })[0];
                    
                    chnnl.after = usridx2;

                    nickchannels.push(chnnl);
                }
            }

            //if (nickmsg.From.Parts[0] == self.Me.Nick)
            if (self.IsThisMe(msg.From.Parts[0]))
            {
                self.Me.Nick = nickmsg.To;
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
            var isChannel = true;

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
                    mode.Argument = "";
                }

                mode.Character = modesstring[i];


                // If this isn't a user mode, and this IS a channel prefix mode, ie: ~&@%+
                if (!self.IsThisMe(msg.Parts[2]) && self.Attributes["PREFIX_MODES"].indexOf(modesstring[i].toString()) != -1) // msg.Parts[2] != self.Me.Nick &&
                {
                    mode.Type = ModeType.User;
                    mode.Argument = msg.Parts[paramsindex++];

                    mode.Character = self.Attributes["PREFIX_PREFIXES"][self.Attributes["PREFIX_MODES"].indexOf(mode.Character)];
                    msg.Parts[2] = msg.Parts[2].toLowerCase();

                    var userid = Array_WhereId(self.Channels[msg.Parts[2]].Users,function(u) { return u.Nick == mode.Argument; })[0];

                    if (mode.ModificationType == ModeModificationType.Removing)
                    {
                        var mode_remove_prefix = Array_Where(self.Channels[msg.Parts[2]].Users[userid].Modes,
                            function(m) { return m == mode.Character.toString(); })[0];

                        if (mode_remove_prefix != undefined) {
                            Array_Remove(self.Channels[msg.Parts[2]].Users[userid].Modes, mode_remove_prefix);
                            self.Channels[msg.Parts[2]].Users.sort(sortuser);
                        }
 
                        var useridAfter = Array_WhereId(self.Channels[msg.Parts[2]].Users, function (u) { return u.Nick == mode.Argument; })[0];
                        msg.Delta = { "before": userid, "after": useridAfter, "user":self.Channels[msg.Parts[2]].Users[useridAfter] };
 
                        self.Events.emit('OnRemovePrefix', self, msg);
                    }
                    else
                    {
                        var mode_add_prefix = Array_Where(self.Channels[msg.Parts[2]].Users[userid].Modes, function(p) { return p.Character == mode.Character; } )[0];

                        if (mode_add_prefix == undefined) {
                            self.Channels[msg.Parts[2]].Users[userid].Modes.push(mode.Character.toString());
 
                            self.Channels[msg.Parts[2]].Users[userid].Modes.sort(function(s1, s2)
                            {
                                return prefixz.indexOf(s1[0]) - (prefixz.indexOf(s2[0]));
                            });
                            self.Channels[msg.Parts[2]].Users.sort(sortuser);
                        }
 
                        var useridAfter = Array_WhereId(self.Channels[msg.Parts[2]].Users, function (u) { return u.Nick == mode.Argument; })[0];
                        msg.Delta = { "before": userid, "after": useridAfter, "user": self.Channels[msg.Parts[2]].Users[useridAfter]  };
 
                        self.Events.emit('OnAddPrefix', self, msg);
                    }
                }
                else if (self.IsThisMe(msg.Parts[2])) // else if (msg.Parts[2] == self.Me.Nick)
                {
                    mode.Type = ModeType.UMode;
                    isChannel = false;

                    if (mode.ModificationType == ModeModificationType.Adding)
                    {
                        if (Array_Where(self.Me.Modes, function(m) { return m == mode.Character; })[0] == undefined) {
                            self.Me.Modes.push(mode.Character.toString());
                        }
                        
                    }
                    else
                    {
                        var me_mode_to_remove = Array_Where(self.Me.Modes,function(m) { return m[0] == mode.Character; })[0];
                        if (me_mode_to_remove != undefined) {
                            Array_Remove(self.Me.Modes, me_mode_to_remove);
                        }
                    }
                }
                else
                {
                    msg.Parts[2] = msg.Parts[2].toLowerCase();

                    mode.Type = ModeType.Channel;
                    if (mode.ModificationType == ModeModificationType.Adding)
                    {
                        var mode_ban_add = Array_Where(self.Channels[msg.Parts[2]].Modes, function (m) { return m.Character == mode.Character &&
                                mode.Argument == m.Argument; })[0];

                        if (mode_ban_add == undefined) {
                            self.Channels[msg.Parts[2]].Modes.push(mode);
                        }

                        if (mode.Character == 'b') {
                            self.Events.emit('OnBan', self, msg);
                        }
                    }
                    else {
                        var modeToRemove = Array_Where(self.Channels[msg.Parts[2]].Modes, function (m) { return m.Character == mode.Character &&
                                mode.Argument == m.Argument; })[0];

                        if (modeToRemove != undefined) {
                            Array_Remove(self.Channels[msg.Parts[2]].Modes, modeToRemove);
                        }


                        if (mode.Character == 'b')
                        {
                            self.Events.emit('OnUnban', self, msg);
                        }
                    }
                }
                var modeMessage = new Evnts.ModeMessage(msg);
                modeMessage.Mode = mode;
                modeMessage.To.Type = (mode.Type == ModeType.Channel ? "Channel" : "Client");
                modeMessage.Chanobj = self.Channels[msg.Parts[2]];
                self.Events.emit('OnModeChange', self, modeMessage);
            }
            msg.Type = (isChannel ? "Channel" : "UMode");
            self.Events.emit("OnMode", self, msg);
            break;
        // ///
        // END MODE
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


        case "TOPIC": // :from TOPIC #channel :Topic
            msg.Parts[2] = msg.Parts[2].toLowerCase();

            var tmpchan2pic = self.Channels[msg.Parts[2]];

            if (tmpchan2pic)
            {
                // update channel
                tmpchan2pic.Topic.Display = msg.MessageLine;
                tmpchan2pic.Topic.SetBy = msg.From.Parts[0];
            }

            self.Events.emit('OnTopic', self, msg);

            break;
        // ***
        // BEGIN 004
        // ***
        case "004": // Get Server Type
            //var values = Enum.GetValues(typeof(ServerType));

            self.Me.Nick = msg.Parts[2];
            serverType = ServerType.Unknown;

            for( var serverType in ServerType)
            {
                if (msg.Parts[4].indexOf(serverType) == 0)
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
                var key = "";
                var value = "";

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

                if (key == "PREFIX")
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

            self.Events.emit('OnCap', self, msg);
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
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.Ident = msg.Parts[4];
            tempWhois.Host = msg.Parts[5];
            tempWhois.Name = msg.MessageLine;

            if (tempWhois.Nick == self.Me.Nick)
            {
                self.Me.Ident = tempWhois.Ident;
                self.Me.Host = tempWhois.Host;
            }

            break;
        case "378": // (IRCOP Message) :simmons.freenode.net 378 ivazquez ivazquez :is connecting from *@host ip
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.Attributes.push(msg.MessageLine);

            break;
        case "379": // :irc.foonet.com 379 dab dab :is using modes +iowghaAsxN +kcfvGqso
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.Modes = [];
            tempWhois.Modes.push(msg.Parts[7] + " " + (msg.Parts.length > 8 ? msg.Parts[8] : ""));

            break;
        case "307": // :registered nick?
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.Identified = true;

            break;
        case "319": // Channels :hyperion.gamergalaxy.net 319 dabbb dab :~#dab &#gamergalaxy ~#dab.beta &#office
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.Channels = [];

            msg.Parts[4] = msg.Parts[4].substring(1);

            for (var i = 4; i < msg.Parts.length; i++)
            {
                // This channel doesn't represent a gui item
                
                tempWhois.Channels.push(msg.Parts[i]);
            }

            break;
        case "312": // Server :hyperion.gamergalaxy.net 312 dabbb dab hyperion.gamergalaxy.net :Gamer Galaxy IRC
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.Server = msg.Parts[4] + " " + msg.MessageLine;

            break;
        case "330": // :navi.gamergalaxy.net 330 bad dab` dab :is logged in as

            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.IdentifiedAs = msg.Parts[4];

            break;
        case "313": // is a net admin
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.IrcOp = true;
            tempWhois.Attributes.push(msg.MessageLine);

            break;
        case "310": // available for help
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }
            tempWhois.Attributes.push(msg.MessageLine);

            break;
        case "671": // secure connection
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.Attributes.push(msg.MessageLine);

            break;
        case "355": // 335 DaBot` DaBot` :is a ☻Bot☻ on Gamer Galaxy'
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            tempWhois.Attributes.push(msg.MessageLine);

            break;
        case "317": // idle time
            // Either never done a whois before or recycle old whois result
            // Meaning the whois is not thread safe.
            if (!tempWhois || tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.Parts[3];
            }

            // :hyperion.gamergalaxy.net 317 dabbb dab 4405 1383796581 :seconds idle, signon time
            tempWhois.IdleTime = parseInt(msg.Parts[4]);
            tempWhois.SignedOn = new Date(msg.Parts[5] * 1000);

            break;
        case "401": // No such nick
                tempWhois = ctx.CreateUser();
                tempWhois.Nick = msg.MessageLine + " " + msg.Parts[3];
            break;
        case "318": // End of WHOIS results
                        /*
                        <- :irc.botsites.net 401 dab sdfasdfasdf :No such nick/channel
                        <- :irc.botsites.net 318 dab sdfasdfasdf :End of /WHOIS list.
                        */
            // Not sure what this condition is supposed to prevent?
            /*if (tempWhois && tempWhois.Nick != msg.Parts[3])
            {
                tempWhois = null;
            }*/

            var whomsg = new Evnts.WhoisMessage(msg);
            whomsg.Who = tempWhois;
            self.Events.emit('OnWhoIs', self, whomsg);
            self.Events.emit('OnWhois', self, whomsg);

            tempWhois = null;
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
            tempList.push(le);
            break;
        case "323":
            var lm = new EventListMessage(msg);

            lm.Entries = tempList;
            self.Events.emit('OnList', self, lm);
            break;
        // ///
        // END LIST
        // ///
        default:
            self.Events.emit('OnUnhandledEvent', self, msg);
            break;

    }


    if (!isNaN(msg.Command))
    {
        self.Events.emit(msg.Command, self, msg);
    }
}


module.exports = {"parse":parse};