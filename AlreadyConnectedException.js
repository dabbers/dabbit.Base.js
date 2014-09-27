var System = require("all")("System");

/// <summary>
/// An exception thrown when a port number < 1 or > 65000 is passed
/// </summary>
function AlreadyConnectedException()
{
	System.Exception.Exception.call(this, "Cannot connect to the server when there is already a connection");


}
System.Javascript.Inherit(System.Exception, AlreadyConnectedException);

module.exports = AlreadyConnectedException;