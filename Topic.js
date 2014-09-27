var System = require("all")("System");

function Topic() {
        this.Display = String.Empty;
        this.SetBy = String.Empty;
        this.DateSet = new Date();
}
System.Javascript.Inherit(System.Object, Topic);