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
