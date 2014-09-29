var System = require('all')('System');
var Message = require('../Message');

function ListMessage(old) // Message
{
    Message.call(this);

    this.Entries = [];
    this.From = old.From;
    this.Command = old.Command;
    this.MessageLine = old.MessageLine;
    this.Parts = old.Parts;
    this.RawLine = old.RawLine;
    this.Timestamp = old.Timestamp;
}
System.Javascript.Inherit(Message, ListMessage);

module.exports = ListMessage;