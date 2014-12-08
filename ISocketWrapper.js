function ISocketWrapper() {
    
    // Request these attributes in the Constructor

    this.__defineGetter__("Host", function() {
        throw "You must implement Host";
    });

    this.__defineGetter__("Port", function() {
        throw "You must implement Port";
    });

    this.__defineGetter__("Secure", function() {
        throw "You must implement Secure";
    });

    this.__defineGetter__("Connected", function() {
        throw "You must implement Connected";
    });

    this.ConnectAsync = function() { 
        throw "You must implement ConnectAsync";
    };

    this.Disconnect = function() {
        throw "You must implement Disconnect";
    }

    this.__defineGetter__("Reader", function() {
        throw "You must implement Reader";
    });

    this.__defineGetter__("Writer", function() {
        throw "You must implement Writer";
    });

    this.write = function(msg) { 
        throw "You must implement write";
    };
}
module.exports = ISocketWrapper;
