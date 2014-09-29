var System = require('all')('System');
var Message = require('../Message');
var SourceEntityType = require('../SourceEntityType');

function ModeMessage(old)
{
    Message.call(this);
    
    this.Adding = true;
    this.Mode = {}; // Mode

    this.From = old.From;
    this.Command = old.Command;
    this.MessageLine = old.MessageLine;
    this.Parts = old.Parts;
    this.RawLine = old.RawLine;
    this.Timestamp = old.Timestamp;
}
System.Javascript.Inherit(Message, ModeMessage);

module.exports = ModeMessage;