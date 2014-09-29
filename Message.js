var System = new require("all")("System");

function Message() {
    // Indicates object inheritance.
    System.Object.call(this);
    
    this.Parts = [];
    this.MessageLine = String.Empty;
    this.Command = String.Empty;
    this.RawLine = String.Empty;

    this.From = {};
    this.Timestamp = {};
}
System.Javascript.Inherit(System.Object, Message);

module.exports = Message;

