var System = require('all')('System');
var Message = require('../Message');

function WhoisMessage(old) {
    Message.call(this);

    this.Who = {}; // User

    this.From = old.From;
    this.Command = old.Command;
    this.MessageLine = old.MessageLine;
    this.Parts = old.Parts;
    this.RawLine = old.RawLine;
    this.Timestamp = old.Timestamp;
}
System.Javascript.Inherit(Message, WhoisMessage);

module.exports = WhoisMessage;