var System = require("all")("System");

function ISocketWrapper() {
    // Indicates object inheritance.
    System.Object.call(this);
    
    // Request these attributes in the Constructor

    this.__defineGetter__("Host", function() {
        throw new System.MustImplementException("CreateConnection");
    });

    this.__defineGetter__("Port", function() {
        throw new System.MustImplementException("CreateConnection");
    });

    this.__defineGetter__("Secure", function() {
        throw new System.MustImplementException("CreateConnection");
    });

    this.__defineGetter__("Connected", function() {
        throw new System.MustImplementException("CreateConnection");
    });

    this.ConnectAsync = function() { 
        throw new System.MustImplementException("CreateConnection");
    };

    this.Disconnect = function() {
        throw new System.MustImplementException("CreateConnection");
    }

    this.__defineGetter__("Reader", function() {
        throw new System.MustImplementException("CreateConnection");
    });

    this.__defineGetter__("Writer", function() {
        throw new System.MustImplementException("CreateConnection");
    });
}
System.Javascript.Inherit(System.Object, ISocketWrapper);

module.exports = ISocketWrapper;
