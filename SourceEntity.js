var User = require('./User');

function SourceEntity(prts, sourceType) {

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

module.exports = SourceEntity