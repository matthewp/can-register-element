var callbacks = require("can-view-callbacks");
var each = require("can-util/js/each/each");
var Scope = require("can-view-scope");
var Options = Scope.Options;

var isValidTag = /-/;

module.exports = function(){
	// Tags that have been registered
	var registered = {};

	// A scope for all registered elements
	var registeredScope = Scope.refsScope();

	each(callbacks._tags, function(callback, tag){
		register(tag, callback);
	});

	var callbacksTag = callbacks.tag;
	callbacks.tag = function(tag, callback){
		var res = callbacksTag.apply(this, arguments);
		register(tag, callback);
		return res;
	};

	function register(tag, callback){
		if(!isValidTag.test(tag) ||
			registered[tag]) {
			return;
		}
		registered[tag] = true;

		var proto = Object.create(HTMLElement.prototype);

		proto.createdCallback = function(){
			var tagData = makeTagData();
			callback(this, tagData);
		};

		document.registerElement(tag, { prototype: proto });
	}

	function makeTagData(){
		return {
			scope: registeredScope,
			options: new Options({}),
			templateType: "stache",
			parentNodeList: undefined
		};
	}

	return {
		tags: registered,
		unregister: function(){
			register = {};
			callbacks.tag = callbacksTag;
		}
	};
};
