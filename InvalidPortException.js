/// <summary>
/// An exception thrown when a port number < 1 or > 65000 is passed
/// </summary>
function InvalidPortException(port)
{
    this.__defineGetter__("Name", function(){
        return "InvalidPortException";
    });
    this.__defineGetter__("Message", function(){
        return "Invalid port " + port;
    });
    this.__defineGetter__("StackTrace", function(){
        return new Error().stack;
    });

    // Public getter for Display, returns channel name
    this.__defineGetter__("Port", function() {
        return port;
    });

}
module.exports = InvalidPortException;