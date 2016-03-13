dabbit.base
============

dabbit.base is an IRC parsing library built for node.js and made to be highly adaptable. It uses the EventsEmitter to make callbacks to the listeners, and each event represents a list of IRC events. 


dabbit.base was built to follow the IRC protocol without any assumptions. It makes no assumptions about the channel prefix, it makes no assumptions about what user channel modes exist, and it attempts to mask the CAP featureset from other IRCds. 

dabbit.base was originally written in C# and then ported to Javascript. This means it uses C# styles. Someday it will follow the javascript standards, but today is not that day. There's a chance I might translate it to TypeScript, but that's another task for another day. 


Using dabbit.base
=================

Using dabbit.base is probably not as user friendly in javascript as it is in C#. It was designed to support class injection for various types of things. You can pass in your own Channel class that the library uses internally. This is useful if you need to add some UI type properties to the class. You can do the same for User, Server, and Socket. 

I'll provide the sample NodeSocket.js and NodeContext.js from DeBot.js 


NodeSocket: https://github.com/dabbers/DeBot.js/blob/master/src/core/NodeSocket.js
NodeContext: https://github.com/dabbers/DeBot.js/blob/master/src/core/NodeContext.js
The context won't work as is, you'll want to replace 
```
return new InterceptedUsersChannel(svr);
```

with

```
return new Base.Channel(svr);
```


To use these 2 classes with dabbit.base (untested):

```
var ctx = new (require('NodeContext'))();

ctx.AddServer(ctx.CreateConnection("", ctx.CreateSocket("irc.gamergalaxy.net", 6697, true)));

ctx.Server.Events.on('RawMessageReceived', function(server, msg) {  console.log(msg); });

ctx.Server.ConnectAsync();

```

That's all it takes to create a connection. RawMessageReceived is the event callback fired for every message. This is the first event fired before we parse for what detailed event to callback.


I'll update with more information.

Hopefully you enjoy this library, I've put a lot of work into building an accurate and extensive IRC framework. It might be a bit heavy for a lot of people. It stores the channels and server information. the server stored in both the context and included in the event callbacks. The server has a Channels and an Attributes property that you can view the Channels and the server information. You can view the list of users in the Channels["#channel"].Users. The list is sorted by privilage level. 

If you have any questions, join irc.gamergalaxy.net and join #dab . I'll try and help if you need it.

