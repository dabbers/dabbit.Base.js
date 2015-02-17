var Topic = require("./Topic");

function Channel(svr) {
    if (!svr) {
        throw "svr cannot be null";
    }

    this.Name = "";
    this.Modes = [];
    this.Users = [];
    var created = new Date();
    var topic = new Topic();

    // Public getter for Display, returns channel name
    this.__defineGetter__("Display", function() {
        return this.Name;
    });

    // Public getter for Created (datetime)
    this.__defineGetter__("Created", function() {
        return created;
    });
    

    this.__defineGetter__("ServerOf", function() {
        return svr;
    });

    this.__defineGetter__("ChannelLoaded", function() {
        return this.Name && this.Modes.length != 0 && this.Users.length != 0 && this.Display;
    });

    this.__defineGetter__("Topic", function() {
        return topic;
    });
    this.__defineSetter__("Topic", function(val) {
        topic = val;
    });


    this.toString = function() {
        return this.Name;
    }

    this.__defineGetter__("isChannel", function() {
        return true;
    });

}

module.exports = Channel;
