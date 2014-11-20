/// <summary>
/// An exception thrown when a port number < 1 or > 65000 is passed
/// </summary>
function AlreadyConnectedException()
{
    this.__defineGetter__("Name", function(){
        return "AlreadyConnectedException";
    });
    this.__defineGetter__("Message", function(){
        return "Cannot connect to the server when there is already a connection";
    });
    this.__defineGetter__("StackTrace", function(){
        return new Error().stack;
    });
}
module.exports = AlreadyConnectedException;