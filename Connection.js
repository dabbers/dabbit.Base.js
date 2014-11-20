var AlreadyConnectedException = require('./AlreadyConnectedException');
var Message = require('./Message');
var SourceEntity = require('./SourceEntity');
var SourceEntityType = require('./SourceEntityType');
var IContext = require('./IContext');
var ISocketWrapper = require('./ISocketWrapper');

function Connection(inCtx, socket) {
    var messages = []; // new Stack<Message>();
    var ctx = inCtx;
    
    if (!inCtx) {
        throw "Context cannot be null";
    }

    var socketWrapper = socket; // ISocketWrapper
    if (!socket) {
        throw "Socket cannot be null";
    }

    this.__defineGetter__("Host", function() { // string
        return socketWrapper.Host;
    });
    this.__defineGetter__("Port", function() { // number
        return socketWrapper.Port;
    });
    this.__defineGetter__("Secure", function() { // bool
        return socketWrapper.Port;
    });

    var id = generateUUID();
    this.__defineGetter__("Id", function() { // GUID
        return id;
    });

    this.__defineGetter__("Async", function() { // bool
        return socketWrapper.Port;
    });

    this.__defineGetter__("Connected", function() { // bool
        return socketWrapper.Connected;
    });

    this.RawMessageReceived = function() { } // Callback for any message received

    /// <summary>
    /// Establish a connection to the server. dataCallback is called for each complete line of IRC
    /// data. Only parameter is a dabbit.Base.Message object
    /// </summary>
    this.ConnectAsync = function(dataCallback) {
        if (this.Connected)
        {
            throw new AlreadyConnectedException();
        }

        // Store a user provided callback for data. If no callback is provided, just use an empty function
        this.RawMessageReceived = (dataCallback || function() {});

        // Connect to our server providing our own data parsing method for the callback.
        // our callback will call their callback when we've placed the line into a nicely packaged object
        socketWrapper.ConnectAsync(onRead);
    }

    /// <summary>
    /// Disconnect from the server with an optional quit message
    /// </summary>
    this.Disconnect = function(quitmsg) {
        this.Write(quitmsg || "QUIT :dabbit IRC Client. Get it today! http://dabb.it");

        socketWrapper.Disconnect();
        socketWrapper = ctx.CreateSocket(socketWrapper.Host, socketWrapper.Port, socketWrapper.Secure);
    }

    var self = this;
    var onRead = function(data) {

        var msg = new Message();
        msg.Timestamp = new Date();
        msg.RawLine = data.toString();

        if (!msg.RawLine)
        {
            return;
        }
        var messages = msg.RawLine.split(' ');

        msg.Parts = messages;

        if (messages.length == 0) {
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

        for( i = 1; i < messages.length; i++) {

            if (!messages[i])
                continue;

            if (messages[i][0] == ':')
            {
                found = true;
            }

            if (found)
                temp += messages[i] + " ";
        }

        temp = TrimEnd(String(temp));

        if (found)
            msg.MessageLine = temp.substring(1);
        else
            msg.MessageLine = msg.RawLine.substring(1);

        var fromParts = messages[0].split('!');

        if (fromParts.length > 1)
        {
            var identHost = fromParts[1].split('@');
            msg.From = new SourceEntity([ fromParts[0].substring(1), identHost[0], identHost[1] ], SourceEntityType.Client);
        }
        else
        {
            msg.From = new SourceEntity([ fromParts[0].substring(1) ], SourceEntityType.Server);
        }

        self.RawMessageReceived(msg);
    }

    this.Write = function(message) {
        socketWrapper.Writer.write(message + "\r\n");
    }
}

// http://stackoverflow.com/a/8809472/486058
function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function TrimEnd(str) {
    c = ' ';
    var i=str.length-1;
    for(;i>=0 && (str.charAt(i)==" " || str.charAt(i)=="\r" || str.charAt(i)=="\n" ) ;i--);
    return str.substring(0,i+1);
}

module.exports = Connection;