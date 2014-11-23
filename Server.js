var Parser = require('./Parser');
var ServerType = require('./ServerType');
var events = require('events');


function Server(ctx, me, connection) {
    var whoisLibraryRequested = [];

    var serverType = ServerType.Unknown; // ServerType

    if (!ctx) {
        throw "ctx cannot be null";
    }

    var multiModes = false; // bool
    var hostInNames = false; // bool

    this.Attributes = {};

    this.__defineGetter__("Display", function() {
        return this.Attributes["NETWORK"];
    });

    this.Channels = {};

    this.__defineGetter__("Connection", function() {
        return connection;
    });
    this.__defineSetter__("Connection", function(val) {
        connection = value;
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

    if (me.Modes == null) {
        me.Modes = [];
    }

    this.__defineGetter__("Me", function() {
        return me;
    });

    this.Channels = {}; //new Dictionary<string, Channel>(StringComparer.CurrentCultureIgnoreCase);
    this.OnNumeric = {}; //new Dictionary<RawReplies, IrcEventHandler>();

    // Add prefined and used attributes
    this.Attributes["NETWORK"] = connection.Host;

    this.Attributes["STATUSMSG"] = "";
    this.Attributes["CHANTYPES"] = "";
    
    var self = this;

    this.PerformConnect = function() {
        self.Connection.ConnectAsync(self.rawMessageReceived);

        self.Connection.Write("CAP LS"); // Get list of extras (For multi prefix)
        
        if (self.Password)
        {
            self.Connection.Write("PASS " + self.Password);
        }

        self.Connection.Write("NICK " + self.Me.Nick);
        self.Connection.Write("USER " + self.Me.Ident + " * * :" + self.Me.Name);
    }

    this.IsThisMe = function(usr) {
        return usr == me.Nick
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

    this.Events.on('OnCap', function(svr, msg) { 
        // remove leading : so we can do a direct check
        msg.Parts[4] = msg.Parts[4].substring(1);

        for (var i = 4; i < msg.Parts.Count(); i++)
        {
            if (msg.Parts[i] == "multi-prefix")
            {
                self.Connection.Write("CAP REQ :multi-prefix");
                break;
            }
        }

        self.Connection.Write("CAP END");
    });

    this.Events.on('OnConnectionEstablished', function(svr, msg) {
        self.Connection.Write("WHOIS " + self.Me.Nick);
        whoisLibraryRequested.push(self.Me.Nick);

        if (self.Attributes["NAMESX"]) {
            multiModes = true;
            self.Connection.Write("PROTOCTL NAMESX");
        }
        if (self.Attributes["UHNAMES"]) {
            hostInNames = true;
            self.Connection.Write("PROTOCTL UHNAMES");
        }
    });

    this.Events.on('OnWhois', function(svr, msg) { 

        whoisLibraryRequested.Remove(tempWhois.Nick);
    });

    this.Events.on('OnPing', function(svr, msg) {
        self.Connection.Write("PONG " + msg.Parts[1]);
    });

    this.Events.on('OnNewChannelJoin', function(svr, msg) {
        self.Connection.Write("MODE " + msg.Channel);
    });

    this.Events.on('OnRemovePrefix', function(svr, msg) {
        if (false == self.MultiModes)
        {
           self.Connection.Write("NAMES " + msg.Parts[2]);
        }
    });

    this.rawMessageReceived = function(msg) {
        Parser.parse(self, ctx, msg);
    }


}

module.exports = Server;