if (!Array.prototype.Where) {
	Array.prototype.Where = function(lambda) {
		var res = [];

		for(var i = 0; i < this.length; i++)
		{
			if (lambda(this[i])) {
				res.push(this[i]);
			}
		}

		return res;
	}
}
if (!Array.prototype.WhereId) {
	Array.prototype.WhereId = function(lambda) {
		var res = [];

		var found = false;
		for(var i = 0; i < this.length; i++)
		{
			if (lambda(this[i])) {
				found = true;
				res.push(i);
			}
		}

		if (false == found) res.push(-1);

		return res;
	}
}

if (!Array.prototype.First) {
	Array.prototype.First = function() {
		return this[0];
	}
}

if (!Array.prototype.Add) {
	Array.prototype.Add = function(value) {
		this.push(value);
	}
}

if (!Array.prototype.FirstOrDefault) {
	Array.prototype.FirstOrDefault = function(def) {
		return this.length > 0 ? this[0] : def || {};
	}
}
if (!Array.prototype.Remove) {
	Array.prototype.Remove = function(obj) {
		var indx = this.indexOf(obj);
		if (indx != -1) {
			this.splice(indx, 1);
		}
	}
}

if (!Array.prototype.Count) {
	Array.prototype.Count = function() {
		return this.length;
	}
}