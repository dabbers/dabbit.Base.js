var System = require('all')('System');
var Message = require('../Message');

function NickChangeMessage(old) {
    Message.call(this);
    
    this.To = String.Empty;

    this.Channels = [];

    this.From = old.From;
    this.Command = old.Command;
    this.MessageLine = old.MessageLine;
    this.Parts = old.Parts;
    this.RawLine = old.RawLine;
    this.Timestamp = old.Timestamp;

    this.To = old.Parts[2];
}
System.Javascript.Inherit(Message, NickChangeMessage);

module.exports = NickChangeMessage;
