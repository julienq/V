(function () {
  "use strict";

  var turtle = {
    elem: document.getElementById("turtle"),
    palette: [
      "#000000",  //  0: black
      "#0000ff",  //  1: blue
      "#00ff00",  //  2: green
      "#00ffff",  //  3: cyan
      "#ff0000",  //  4: red
      "#ff00ff",  //  5: magenta
      "#ffff00",  //  6: yellow
      "#ffffff",  //  7: white
      "#543512",  //  8: brown
      "#bfa76f",  //  9: tan
      "#007d13",  // 10: forest
      "#15cab1",  // 11: aqua
      "#fc746d",  // 12: salmon
      "#420943",  // 13: purple
      "#fbb829",  // 14: orange
      "#808080"   // 15: gray
    ]
  };

  // Start a new path with the current color
  turtle.new_path = function () {
    this.__path = this.sheet.appendChild(V.$path({ fill: "none",
      stroke: this.color, "stroke-width": this.pensize,
      d: "M%0,%1".fmt(this.x, this.y)
    }));
    this.__points = [[this.x, this.y]];
  };

  // Start a new sheet to draw on
  turtle.new_sheet = function () {
    this.sheet = this.elem.parentNode.appendChild(V.$g());
  };

  // Update the position of the turtle; if the pen is down, keep drawing to the
  // new point
  turtle.update_position = function () {
    if (this.__path) {
      var p = this.__points[this.__points.length - 1];
      if (this.x !== p[0] || this.y !== p[1]) {
        this.__points.push([this.x, this.y]);
        this.__path.setAttribute("d",
          this.__path.getAttribute("d") + "L%0,%1".fmt(this.x, this.y));
      }
    }
    this.elem.setAttribute("transform", "translate(%0, %1) rotate(%2)"
      .fmt(this.x, this.y, this.h));
  };

  V.make_property(turtle, "color", function () {
    this.elem.setAttribute("stroke", this.color);
    if (this.__path) {
      this.new_path();
    }
  });

  V.make_property(turtle, "pensize", function () {
    if (this.__path) {
      this.new_path();
    }
  });

  V.make_property(turtle, "visible", function () {
    this.elem.setAttribute("stroke-opacity", this.visible ? 1 : 0);
  });


  // Functions from UCB Logo
  // TODO: ARC, TOWARDS, SCRUNCH, WRAP, WINDOW, FENCE, FILL, FILLED, LABEL,
  // SETLABELHEIGHT, SETSCRUNCH, TURTLEMODE, LABELSIZE, PENPAINT, PENERASE,
  // SETPENPATTERN, PENDOWNP, PENMODE, PENCOLOR, PALETTE, PENSIZE, PENPATTERN,
  // PEN, BACKGROUND, SAVEPICT, LOADPICT, MOUSEPOS, CLICKPOS, BUTTONP, BUTTON
  // Ours:
  // FOLLOW, SCALE, TOUCH*, SHEET*, UNDO, REDO

  this.FORWARD = this.FD = function (steps) {
    var r = V.deg2rad(turtle.h);
    turtle.x += steps * Math.cos(r);
    turtle.y += steps * Math.sin(r);
    turtle.update_position();
  };

  this.BACK = this.BK = function (steps) {
    FORWARD(-steps);
  };

  this.LEFT = this.LT = function (degrees) {
    RIGHT(-degrees);
  };

  this.RIGHT = this.RT = function (degrees) {
    turtle.h += degrees;
    turtle.update_position();
  };

  this.SETPOS = function (p) {
    this.SETXY.apply(this, p);
  };

  this.SETXY = function (x, y) {
    turtle.x = x;
    turtle.y = y;
    turtle.update_position();
  };

  this.SETX = function (x) {
    turtle.x = x;
    turtle.update_position();
  };

  this.SETY = function (y) {
    turtle.y = y;
    turtle.update_position();
  };

  this.SETHEADING = this.SETH = function (h) {
    turtle.h = h;
    turtle.update_position();
  };

  this.HOME = function () {
    SETXY(0, 0);
    SETH(0);
  };

  this.POS = function () {
    return [turtle.x, turtle.y];
  };

  this.XCOR = function () {
    return turtle.x;
  };

  this.YCOR = function () {
    return turtle.y;
  };

  this.HEADING = function () {
    return (360 + turtle.h) % 360;
  };

  this.SHOWTURTLE = this.ST = function () {
    turtle.visible = true;
  };

  this.HIDETURTLE = this.HT = function () {
    turtle.visible = false;
  };

  this.CLEAN = function () {
    V.remove_children(turtle.sheet);
  };

  this.CLEARSCREEN = this.CS = function () {
    CLEAN();
    HOME();
  };

  this.SHOWNP = function () {
    return turtle.visible;
  };

  this.PENDOWN = this.PD = function () {
    turtle.new_path();
  };

  this.PENUP = this.PU = function () {
    delete turtle.__path;
    delete turtle.__points;
  };

  this.SETPENCOLOR = this.SETPC = function (color) {
    turtle.color = turtle.palette[color] || color;
  };

  this.SETPALETTE = function (n, color) {
    turtle.palette[n] = color;
  };

  this.SETPENSIZE = function (n) {
    turtle.pensize = n;
  };

  this.SETBACKGROUND = this.SETBG = function (color) {
    document.querySelector("svg").style.backgroundColor =
      turtle.palette[color] || color;
  };


  // Initialize the turtle
  turtle.new_sheet();
  HOME();
  SHOWTURTLE();
  SETBACKGROUND(0);
  SETPENCOLOR(7);
  PENDOWN();

}.call(this));
