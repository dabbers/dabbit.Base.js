var User = require('../User');
var Message = require('../Message');
var SourceEntityType = require('../SourceEntityType');
var util = require("util");

function PrivmsgMessage(old) {
    Message.call(this);

    if (old) {
        this.From = old.From;
        this.Command = old.Command;
        this.MessageLine = old.MessageLine;
        this.Parts = old.Parts;
        this.RawLine = old.RawLine;
        this.Timestamp = old.Timestamp;
        
        if (this.From.Type == SourceEntityType.Client)
        {
            this.UserFrom = new User();
            this.UserFrom.Nick = this.From.Parts[0];
            this.UserFrom.Ident = this.From.Parts[1];
            this.UserFrom.Host = this.From.Parts[2];
        }
    }

    this.UserFrom; // User
    this.To; // SourceEntity
    this.Wall; // + % @ & ~ before the channel
}
util.inherits(PrivmsgMessage, Message);

module.exports = PrivmsgMessage;

