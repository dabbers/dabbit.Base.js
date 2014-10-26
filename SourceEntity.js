var System = new require("all")("System");
var User = require('./User');

function SourceEntity(prts, sourceType) {
    // Indicates object inheritance.
    System.Object.call(this);

    var fromType;
    var parts;

    this.__defineGetter__("Type", function() { // GUID
        return fromType;
    });

    this.__defineGetter__("Parts", function() { // GUID
        return parts;
    });

    if (sourceType == null && prts instanceof User)
    {
        parts = [ prts.Nick, prts.Ident, prts.Host ];
        fromType = "Client";
    }
    else
    {
        fromType = sourceType || "Client";
        parts = prts;   
    }

}
System.Javascript.Inherit(System.Object, SourceEntity);

module.exports = SourceEntity