// public enum ConnectionType
module.exports = Object.freeze({
    /// <summary>
    /// Direct TCP/IP connection
    /// </summary>
    Direct : "Direct",

    /// <summary>
    /// A connection to a BNC server
    /// </summary>
    BNC : "BNC",

    /// <summary>
    /// Connection to a dabbit Socket Server
    /// </summary>
    Dabbit : "Dabbit",

    /// <summary>
    /// Sock 5 server
    /// </summary>
    Socks5 : "Socks5",

    /// <summary>
    /// Sock 4 server
    /// </summary>
    Socks4 : "Socks4"
});