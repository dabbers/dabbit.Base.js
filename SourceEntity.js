var System = new require("all")("System");

function SourceEntity(parts, sourceType) {
    // Indicates object inheritance.
    System.Object.call(this);

    this.__defineGetter__("Type", function() { // GUID
        return fromType;
    });

    this.__defineGetter__("Parts", function() { // GUID
        return parts;
    });

    fromType = sourceType;
    parts = parts;

    var fromType;
    var parts;
}
System.Javascript.Inherit(System.Object, SourceEntity);

module.exports = SourceEntity