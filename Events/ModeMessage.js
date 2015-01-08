var Message = require('../Message');
var SourceEntityType = require('../SourceEntityType');
var util = require("util");

function ModeMessage(old)
{
    Message.call(this);
    
    this.Adding = true;
    this.Mode = {}; // Mode

    this.From = old.From;
    this.To = {"Parts": [old.Parts[2], "", ""], "Type":""};
    this.Command = old.Command;
    this.MessageLine = old.MessageLine;
    this.Parts = old.Parts;
    this.RawLine = old.RawLine;
    this.Timestamp = old.Timestamp;
}
util.inherits(ModeMessage, Message);

module.exports = ModeMessage;