var callbacks = require("can-view-callbacks");
var each = require("can-util/js/each/each");
var Scope = require("can-view-scope");
var Options = Scope.Options;

var dataKey = Symbol("[[CanComponent]]");

module.exports = function(){
	// Tags that have been registered
	var registered = {};

	// A scope for all registered elements
	var registeredScope = Scope.refsScope();

	Object.keys(callbacks._tags).forEach(function(tag){
		callback = callbacks._tags[tag];

		if(isValidTag(tag)) {
			callback = callbacks._tags[tag] = wrappedCallback(callback);
		}

		register(tag, callback);
	});

	var callbacksTag = callbacks.tag;
	callbacks.tag = function(tag, callback){
		if(isValidTag(tag)) {
			callback = wrappedCallback(callback);
		}

		var res = callbacksTag.apply(this, arguments);
		register(tag, callback);
		return res;
	};

	function register(tag, callback){
		if(!isValidTag(tag) ||
			registered[tag]) {
			return;
		}
		registered[tag] = true;

		var proto = Object.create(HTMLElement.prototype);

		proto.createdCallback = function(){
			if(isTargetNode(this)) {
				return;
			}

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


function wrappedCallback(callback){
	return function(el){
		if(!getData(el)) {
			defineData(el);
		}
		var data = getData(el);
		if(!data.initialized) {
			var res = callback.apply(this, arguments);
			data.initialized = true;
			return res;
		}
	}
}

function getData(el){
	return el[dataKey];
}

function defineData(el){
	Object.defineProperty(el, dataKey, {
		enumerable: false,
		writable: false,
		configurable: false,
		value: {}
	});
	return getData(el);
}

function getOrDefineData(el) {
	var data = getData(el);
	if(!data) {
		data = defineData(el);
	}
	return data;
}

function isValidTag(str){
	return (str || "").indexOf("-") !== -1;
}

/**
 * This is a terrible hack. The point is to detect if this is a Node
 * that is being kept in the DocumentFragment to be cloned later, by
 * can-view-target
 */
var isTargetNode = (function(){
	var makeTargetExp = /makeTarget/, hydrateExp = /hydrate/;

	return function(el){
		var data = getOrDefineData(el);

		if(typeof data.isTargetNode === "undefined") {
			var stack = new Error().stack;
			data.isTargetNode = makeTargetExp.test(stack) && !hydrateExp.test(stack);
		}
		return data.isTargetNode;
	};
})();
