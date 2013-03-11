(function () {
  "use strict";

  var turtle = {
    elem: document.getElementById("turtle"),
    pen: document.getElementById("turtle-pen"),
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
    ],
  };

  turtle.exec = function (f) {
    var exec_cmd = function() {
      for (var i = 0; i < this.speed; ++i) {
        var cmd = this.commands.shift();
        if (cmd) {
          cmd.call(this);
        }
      }
      if (this.commands.length > 0) {
        this.__req = window.requestAnimationFrame(exec_cmd);
      } else {
        delete this.__req;
        if (typeof this.done === "function") {
          this.done.call(this);
        }
      }
    }.bind(this);
    this.commands.push(f);
    if (!this.__req) {
      this.__req = window.requestAnimationFrame(exec_cmd);
    }
  };

  turtle.stop = function (f) {
    if (this.__req) {
      window.cancelAnimationFrame(this.__req);
      this.commands = [];
      delete this.__req;
    }
  };

  // Start a new path with the current color
  turtle.new_path = function () {
    this.__path = this.sheet.appendChild(V.$path({ fill: "none",
      stroke: this.color, "stroke-width": this.pensize,
      d: "M%0,%1".fmt(this.x.toFixed(2), -this.y.toFixed(2))
    }));
    this.__points = [[this.x, this.y]];
  };

  // Start a new sheet to draw on
  turtle.new_sheet = function () {
    this.sheet = this.elem.parentNode.parentNode.insertBefore(V.$g(),
        this.elem.parentNode);
  };

  // Update the position of the turtle; if the pen is down, keep drawing to the
  // new point
  turtle.update_position = function () {
    if (this.__path) {
      var p = this.__points[this.__points.length - 1];
      if (this.x !== p[0] || this.y !== p[1]) {
        this.__points.push([this.x, this.y]);
        this.__path.setAttribute("d",
          this.__path.getAttribute("d") +
            "L%0,%1".fmt(this.x.toFixed(2), -this.y.toFixed(2)));
      }
    }
    this.elem.parentNode.setAttribute("transform",
      "translate(%0, %1) rotate(%2)".fmt(this.x, -this.y, this.h));
  };

  V.make_property(turtle, "color", function () {
    this.elem.setAttribute("stroke", this.color);
    this.pen.setAttribute("fill", this.color);
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
    this.pen.setAttribute("fill-opacity", this.visible ? 1 : 0);
  });

  V.make_property(turtle, "background", function () {
    document.querySelector("svg").parentNode.style.backgroundColor =
      this.palette[this.background] || this.background;
  });


  // LOGO-like commands

  this.FOREVER = function (f) {
    turtle.done = f;
    f();
  };

  this.STOP = function () {
    turtle.stop();
    delete turtle.done;
  };

  // Functions from UCB Logo
  // TODO: ARC, SCRUNCH, WRAP, WINDOW, FENCE, FILL, FILLED, LABEL,
  // SETLABELHEIGHT, SETSCRUNCH, TURTLEMODE, LABELSIZE, PENPAINT, PENERASE,
  // SETPENPATTERN, PENMODE, PALETTE, PENSIZE, PENPATTERN,
  // PEN, SAVEPICT, LOADPICT, MOUSEPOS, CLICKPOS, BUTTONP, BUTTON
  // Ours:
  // FOLLOW, SCALE, TOUCH*, SHEET*, UNDO, REDO

  this.FORWARD = this.FD = function (steps) {
    turtle.exec(function () {
      var r = V.deg2rad(90 - this.h);
      this.x += steps * Math.cos(r);
      this.y += steps * Math.sin(r);
      this.update_position();
    });
  };

  this.BACK = this.BK = function (steps) {
    FORWARD(-steps);
  };

  this.LEFT = this.LT = function (degrees) {
    RIGHT(-degrees);
  };

  this.RIGHT = this.RT = function (degrees) {
    turtle.exec(function () {
      this.h += degrees;
      this.update_position();
    });
  };

  this.SETPOS = function (p) {
    this.SETXY.apply(this, p);
  };

  this.SETXY = function (x, y) {
    turtle.exec(function () {
      this.x = x;
      this.y = y;
      this.update_position();
    });
  };

  this.SETX = function (x) {
    turtle.exec(function () {
      this.x = x;
      this.update_position();
    });
  };

  this.SETY = function (y) {
    turtle.exec(function () {
      this.y = y;
      this.update_position();
    });
  };

  this.SETHEADING = this.SETH = function (h) {
    turtle.exec(function () {
      this.h = h;
      this.update_position();
    });
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

  this.TOWARDS = function (x, y) {
    return V.rad2deg(3 * Math.PI / 2 - Math.atan2(turtle.y - y, turtle.x - x))
      - turtle.h;
  };

  this.SHOWTURTLE = this.ST = function () {
    turtle.visible = true;
  };

  this.HIDETURTLE = this.HT = function () {
    turtle.visible = false;
  };

  this.CLEAN = function () {
    turtle.exec(function () {
      V.remove_children(this.sheet);
    });
  };

  this.CLEARSCREEN = this.CS = function () {
    CLEAN();
    HOME();
  };

  this.SHOWNP = function () {
    return turtle.visible;
  };

  this.PENDOWN = this.PD = function () {
    turtle.exec(function () {
      this.new_path();
    });
  };

  this.PENUP = this.PU = function () {
    turtle.exec(function () {
      delete turtle.__path;
      delete turtle.__points;
    });
  };

  this.PENDOWNP = function () {
    return !!turtle.__path;
  };

  this.SETPENCOLOR = this.SETPC = function (color) {
    turtle.exec(function () {
      if (this.palette[color]) {
        this.palette_color = color;
        color = this.palette[color];
      }
      this.color = color;
    });
  };

  this.PENCOLOR = function () {
    return turtle.palette_color || turtle.color;
  };

  this.SETPALETTE = function (n, color) {
    turtle.exec(function () {
      this.palette[n] = color;
    });
  };

  this.SETPENSIZE = function (n) {
    turtle.exec(function () {
      this.pensize = n;
    });
  };

  this.SETBACKGROUND = this.SETBG = function (color) {
    turtle.exec(function () {
      this.background = color;
    });
  };

  this.BACKGROUND = function (n) {
    return turtle.background;
  };

  this.SETSPEED = function (speed) {
    turtle.speed = speed;
  };

  this.SPEED = function () {
    return turtle.speed;
  }

  // Initialize the turtle
  turtle.commands = [];
  turtle.new_sheet();
  SETSPEED(24);
  HOME();
  SHOWTURTLE();
  SETBACKGROUND(0);
  SETPENCOLOR(7);
  PENDOWN();

}.call(this));
