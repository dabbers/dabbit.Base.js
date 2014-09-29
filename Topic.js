var System = require("all")("System");

function Topic() {
    // Indicates object inheritance.
    System.Object.call(this);
    
    this.Display = String.Empty;
    this.SetBy = String.Empty;
    this.DateSet = new Date();
}
System.Javascript.Inherit(System.Object, Topic);

module.exports = Topic;