var System = require("all")("System");
var Server = require("./Server");
var Topic = require("./Topic");

function Channel(svr) {
    // Indicates object inheritance.
    System.Object.call(this);
    
    if (!svr || svr.GetType() != "Server") {
        throw new System.ArgumentException("Invalid Server Parameter svr");
    }

    this.Name = String.Empty;
    this.Modes = [];
    this.Users = [];

    // Public getter for Display, returns channel name
    this.__defineGetter__("Display", function() {
        return this.Name;
    });

    // Public getter for Created (datetime)
    this.__defineGetter__("Created", function() {
        return created.Value;
    });
    var created = new System.Javascript.CheckedProperty(new Date(), Date);

    this.__defineGetter__("ServerOf", function() {
        return server.Value;
    });

    this.__defineGetter__("ChannelLoaded", function() {
        return !String.IsNullOrEmpty(this.Name) && this.Modes.length != 0 && this.Users.length != 0 && !String.IsNullOrEmpty(this.Display);
    });

    this.__defineGetter__("Topic", function() {
        return topic.Value;
    });
    this.__defineSetter__("Topic", function(val) {
        topic.Value = val;
    });
    var topic = new System.Javascript.CheckedProperty(new Topic(), Topic);


    this.toString = function() {
        return this.Name;
    }

    var server = new System.Javascript.CheckedProperty(svr, Server);

}
System.Javascript.Inherit(System.Object, Channel);

module.exports = Channel;
