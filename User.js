var System = require("all")("System");
var SourceEntityType = require('./SourceEntityType');

function User(se) {
    Object.call(this);


    this.Nick = String.Empty;
    this.Ident = String.Empty;

    this.Host = String.Empty;

    this.IdentifiedAs = String.Empty;
    this.Modes = []; // Modes
    this.Channels = []; //Channel

    this.Name = String.Empty;

    this.__defineGetter__("Display", function() {
        return (this.Modes.length > 0 ? this.Modes[0] : "") + this.Nick;
    });

    this.IrcOp = false;
    this.Identified = false;
    this.Server = String.Empty;
    this.IdleTime = 0;

    this.SignedOn = new Date();

    this.Attributes = []; // String

    if (se) {
        if (se.Type != SourceEntityType.Client) {
            this.Nick = se.Parts[0];
            this.Host = se.Parts[0];
            this.Ident = String.Empty;
            this.Name = String.Empty;
        }
        else {
            this.Nick = se.Parts[0];
            this.Ident = se.Parts[1];
            this.Host = se.Parts[2];
            this.Name = String.Empty;
        }
    }
}