function IContext() {
    /// <summary>
    /// Create a connection object given ConnectionType and ISocketWrapper
    /// </summary>
    this.CreateConnection = function(connectionType, socket) {
        throw "You must implement CreateConnection";
    }
    
    this.Servers = [];

    this.Settings = {};
    
    /// <summary>
    /// Creates a blank TCP Socket for use in a connection
    /// </summary>
    /// <param name="host">The host you want to connect to.</param>
    /// <param name="port">port</param>
    /// <param name="secure">bool is secure</param>
    /// <returns>A socket wrapper for a connection. This is platform dependant. This will not be in the same namespace</returns>
    this.CreateSocket = function(host, port, secure) {
        throw "You must implement CreateSocket";
    }

    this.AddServer = function(me, conn) {

        this.Servers.push(new Base.Server(this, me, conn));
    }

    /// <summary>
    /// Create a channel object
    /// <param name="svr">The Server object for applying this to. Used for passing into the Channel base class</param>
    /// <returns>An object that either is, or inherits from Channel</returns>
    this.CreateChannel = function(svr) {
        throw "You must implement CreateChannel";
    }

    /// <summary>
    /// Create a channel object
    /// <param name="source">(OPTIONAL) The SourceEntity object we want to create the user from. If no SourceEntity is passed, we pass an empty user</param>
    /// <returns>An object that either is, or inherits from User</returns>
    this.CreateUser = function(source) {
        throw "You must implement CreateUser";
    }
}

module.exports = IContext;