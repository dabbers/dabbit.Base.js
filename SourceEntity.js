function SourceEntity(parts, sourceType) {

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

module.exports = SourceEntity