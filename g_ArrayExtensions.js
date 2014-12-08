if (!global.Array_Where) {
	global.Array_Where = function(array, lambda) {
		var res = [];

		for(var i = 0; i < array.length; i++)
		{
			if (lambda(array[i])) {
				res.push(array[i]);
			}
		}

		return res;
	}
}

if (!global.Array_WhereId) {
	global.Array_WhereId = function(array, lambda) {
		var res = [];

		var found = false;
		for(var i = 0; i < array.length; i++)
		{
			if (lambda(array[i])) {
				found = true;
				res.push(i);
			}
		}

		if (false == found) res.push(-1);

		return res;
	}
}

if (!global.Array_FirstOrDefault) {
	global.Array_FirstOrDefault = function(array, def) {
		return array.length > 0 ? array[0] : def || {};
	}
}

if (!global.Array_Remove) {
	global.Array_Remove = function(array, obj) {
		var indx = array.indexOf(obj);
		if (indx != -1) {
			array.splice(indx, 1);
		}
	}
}