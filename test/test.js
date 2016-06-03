var QUnit = require("steal-qunit");
var register = require("../register");
var Component = require("can-component");
var isEmptyObject = require("can-util/js/is-empty-object/is-empty-object");
var callbacks = require("can-view-callbacks");
var stache = require("can-stache");

function randomTag(base){
	var chars = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
	return base + "-" + chars;
}

function removeTags(){
	Object.keys(callbacks._tags).forEach(function(tag){
		if(/-/.test(tag)) {
			delete callbacks._tags[tag];
		}
	});
}

QUnit.module("can-register-element", {
	afterEach: function(){
		removeTags();
		document.getElementById("qunit-test-area").innerHTML = "";
	}
});

QUnit.test("registers Components created before", function(assert){
	var tag = randomTag("foo");
	Component.extend({
		tag: tag
	});

	var registration = register();

	assert.ok(registration.tags[tag], "tag was registered");
	registration.unregister();
});

QUnit.test("registers Components created after", function(assert){
	var registration = register();
	
	assert.ok(isEmptyObject(registration.tags), "nothing registered");
	removeTags();

	var tag = randomTag("bar");
	Component.extend({
		tag: tag
	});

	assert.ok(registration.tags[tag], "tag is not registered");
	registration.unregister();
});

QUnit.test("Component's callback is only called once", function(assert){
	var registration = register();

	var times = 0;
	var tag = randomTag("once");

	Component.extend({
		tag: tag,
		events: {
			init: function(){
				times++;
			}
		}
	});

	var frag = stache("<" + tag + "/>")();
	document.getElementById("qunit-test-area").appendChild(frag);

	assert.equal(times, 1, "callback only called once");
	registration.unregister();
});
