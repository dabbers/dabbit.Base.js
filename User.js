var SourceEntityType = require('./SourceEntityType');

function User(se) {
    this.Nick = "";
    this.Ident = "";

    this.Host = "";

    //this.IdentifiedAs = "";
    this.Modes = []; // Modes
    //this.Channels = []; //Channel

    this.Name = "";

    this.__defineGetter__("Display", function() {
        return (this.Modes.length > 0 ? this.Modes[0] : "") + this.Nick;
    });

    //this.IrcOp = false;
    //this.Identified = false;
    //this.Server = "";
    //this.IdleTime = 0;

    //this.SignedOn = new Date();

    this.Attributes = []; // String

    if (se) {
        if (se.Type != SourceEntityType.Client) {
            this.Nick = se.Parts[0];
            this.Host = se.Parts[0];
            this.Ident = "";
            this.Name = "";
        }
        else {
            this.Nick = se.Parts[0];
            this.Ident = se.Parts[1];
            this.Host = se.Parts[2];
            this.Name = "";
        }
    }
}
module.exports = User;