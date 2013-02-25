"use strict";

var assert = window.chai.assert;
var v = window.v;

describe("V", function () {
  it("is defined", function () {
    assert.isObject(v, "v is an object");
  });
  it("saves any previous version of this.v in v.old_v", function () {
    assert.strictEqual(v.old_v, "v", "previous value of v was saved");
  });
});

describe("Manipulating the DOM", function () {
  describe("v.create_element(name, [attrs], ...)", function () {
    it("creates an element with the given name", function () {
      var p = v.create_element("p");
      assert.strictEqual(p.localName, "p", "created p element");
    });
    it("use known namespace prefixes svg and html for the name of the element ", function () {
      var rect = v.create_element("svg:rect");
      assert.strictEqual(rect.localName, "rect", "created rect element");
      assert.strictEqual(rect.namespaceURI, v.ns.svg, "created SVG element");
    });
  });
});
