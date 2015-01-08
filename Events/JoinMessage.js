var Message = require('../Message');
var SourceEntityType = require('../SourceEntityType');
var util = require("util");


function JoinMessage(old) // Message param
{
    Message.call(this);
    this.Channel = "";

    this.From = old.From;
    this.Command = old.Command;
    this.MessageLine = old.MessageLine;
    this.Parts = old.Parts;
    this.RawLine = old.RawLine;
    this.Timestamp = old.Timestamp;

    if (this.From.Type == SourceEntityType.Client)
    {
        if (old.Parts[2][0] == ':')
        {
            old.Parts[2] = old.Parts[2].substring(1);
        }

        this.Channel = old.Parts[2].toLowerCase();
    }

    this.To = {"Parts":[this.Channel,"",""], "Type":"Channel"};
}

util.inherits(JoinMessage, Message);

module.exports = JoinMessage;