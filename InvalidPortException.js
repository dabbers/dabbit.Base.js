var System = require("all")("System");

/// <summary>
/// An exception thrown when a port number < 1 or > 65000 is passed
/// </summary>
function InvalidPortException(port)
{
	System.Exception.Exception.call(this, "Fatal", "Invalid port {0}".format(port));

    // Public getter for Display, returns channel name
    this.__defineGetter__("Port", function() {
        return port;
    });

}
System.Javascript.Inherit(System.Exception, InvalidPortException);

module.exports = InvalidPortException;