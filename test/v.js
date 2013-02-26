"use strict";

var assert = window.chai.assert;

describe("V", function () {
  it("is defined", function () {
    assert.isObject(V, "V is an object");
  });
  it("saves any previous version of this.V in V.old_V", function () {
    assert.strictEqual(V.old_V, "V", "previous value of V was saved");
  });
});

describe("Manipulating the DOM", function () {
  describe("V.create_element(name, [attrs], ...)", function () {
    it("creates an element with the given name", function () {
      var p = V.create_element("p");
      assert.strictEqual(p.localName, "p", "created p element");
    });
    it("use known namespace prefixes svg and html for the name of the element ", function () {
      var rect = V.create_element("svg:rect");
      assert.strictEqual(rect.localName, "rect", "created rect element");
      assert.strictEqual(rect.namespaceURI, V.ns.svg, "created SVG element");
    });
  });
});
