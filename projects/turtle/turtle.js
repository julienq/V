(function () {
  "use strict";

  var turtle = this.turtle = {
    elem: document.getElementById("turtle")
  };

  turtle.new_path = function () {
    this.__path = this.elem.parentNode.appendChild(V.$path({
      stroke: this.color, fill: "none", d: "M%0,%1".fmt(this.x, this.y)
    }));
  };

  turtle.update_position = function () {
    if (this.__path) {
      this.__path.setAttribute("d",
        this.__path.getAttribute("d") + "L%0,%1".fmt(this.x, this.y));
    }
    this.elem.setAttribute("transform", "translate(%0, %1) rotate(%2)"
      .fmt(this.x, this.y, V.rad2deg(this.h)));
  };

  V.make_property(turtle, "color", function () {
    if (this.__path) {
      this.new_path();
    }
  });

  turtle.color = "black";

  V.make_property(turtle, "visible", function () {
    this.elem.setAttribute("stroke-opacity", this.visible ? 1 : 0);
  });

  turtle.visible = true;

  this.FORWARD = function (steps) {
    turtle.x += steps * Math.cos(turtle.h);
    turtle.y += steps * Math.sin(turtle.h);
    turtle.update_position();
  };

  this.BACK = function (steps) {
    FORWARD(-steps);
  };

  this.RIGHT = function (degrees) {
    turtle.h += V.deg2rad(degrees);
    turtle.update_position();
  };

  this.LEFT = function (degrees) {
    RIGHT(-degrees);
  };

  this.PENDOWN = function () {
    turtle.new_path();
  };

  this.PENUP = function () {
    delete turtle.__path;
  };

  turtle.x = 0;
  turtle.y = 0;
  turtle.h = 0;
  PENDOWN();
  turtle.update_position();

  for (var i = 0; i < 6; ++i) {
    LEFT(60);
    FORWARD(100);
  }

}.call(this));
