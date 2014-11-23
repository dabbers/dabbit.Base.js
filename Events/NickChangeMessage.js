var Message = require('../Message');
var util = require("util");

function NickChangeMessage(old) {
    Message.call(this);
    
    this.To = "";

    this.Channels = [];

    this.From = old.From;
    this.Command = old.Command;
    this.MessageLine = old.MessageLine;
    this.Parts = old.Parts;
    this.RawLine = old.RawLine;
    this.Timestamp = old.Timestamp;

    this.To = old.Parts[2];
    if (this.To[0] == ':') {
        this.To = this.To.substring(1);
    }
}
util.inherits(NickChangeMessage, Message);

module.exports = NickChangeMessage;
