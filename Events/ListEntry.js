var System = require('all')('System');

function ListEntry()
{
	System.Object.call(this);
	
    this.Channel = String.Empty;
    this.Users = 0;
    this.Topic = String.Empty;
}
System.Javascript.Inherit(System.Object, ListEntry);
module.export = ListEntry;