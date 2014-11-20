function Message() {
    
    this.Parts = [];
    this.MessageLine = "";
    this.Command = "";
    this.RawLine = "";

    this.From = {};
    this.Timestamp = {};
}
module.exports = Message;

