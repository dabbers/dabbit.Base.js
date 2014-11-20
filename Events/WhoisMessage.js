var Message = require('../Message');
var util = require("util");

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
util.inherits(WhoisMessage, Message);

module.exports = WhoisMessage;