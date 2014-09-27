var System = new require("all")("System");

function Message() {
    this.Parts = [];
    this.MessageLine = String.Empty;
    this.Command = String.Empty;
    this.RawLine = String.Empty;

    this.From = {};
    this.Timestamp = {};
}


module.exports = Message;

