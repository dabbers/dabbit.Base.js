var System = require('all')('System');
var Message = require('../Message');
var util = require("util");

function QuitMessage(old) {
    Message.call(this);
    
    this.Channels = [];

    this.From = old.From;
    this.Command = old.Command;
    this.MessageLine = old.MessageLine;
    this.Parts = old.Parts;
    this.RawLine = old.RawLine;
    this.Timestamp = old.Timestamp;
}
util.inherits(QuitMessage, Message);

module.exports = QuitMessage;