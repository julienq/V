"use strict";

var map = Array.prototype.map;

var Kanji = {};

// Initialize a new kanji from an XML element containing kanji elements and
// paths.
Kanji.init = function (xml) {
  this.vb = xml.documentElement.getAttribute("viewBox");
  this.paths = map.call(xml.querySelectorAll("path"), function (p) {
    return p.getAttribute("d");
  });
  return this;
};

var args = V.get_args();
if (typeof args.k === "string" && args.k.length === 1) {
  var code = V.pad(args.k.charCodeAt(0).toString(16), 5);
  V.ez_xhr("kanji/%0.svg".fmt(code), function (req) {
    if (req.readyState === 4 && (req.status === 0 || req.status === 200)) {
      var kanji = Object.create(Kanji).init(req.responseXML);
      var svg = document.querySelector("svg");
      svg.setAttribute("viewBox", kanji.vb);
      kanji.paths.forEach(function (d) {
        svg.appendChild(V.$path({ d: d }));
      });
    }
  });
}

// Split a C command n times by splitting repeatedly in the middle (this
// produces 2**n commands in the end.)
function split_C(c, x, y, n) {
  if (n > 0) {
    var x0 = x;
    var y0 = y;
    var x1 = c[1];
    var y1 = c[2];
    var x2 = c[3];
    var y2 = c[4];
    x = c[5];
    y = c[6];
    var x3 = (x1 + x0) / 2;
    var y3 = (y1 + y0) / 2;
    var x4 = (x2 + x1) / 2;
    var y4 = (y2 + y1) / 2;
    var x5 = (x + x2) / 2;
    var y5 = (y + y2) / 2;
    var x6 = (x4 + x3) / 2;
    var y6 = (y4 + y3) / 2;
    var x7 = (x5 + x4) / 2;
    var y7 = (y5 + y4) / 2;
    var x8 = (x7 + x6) / 2;
    var y8 = (y7 + y6) / 2;
    return split_C(["C", x3, y3, x6, y6, x8, y8], x0, y0, n - 1)
      .concat(split_C(["C", x7, y7, x5, y5, x, y], x8, y8, n - 1));
  } else {
    return [c];
  }
}

// Parse the d attribute of an SVG path element and returns a list of commands.
// Always return absolute commands.
// Cf. http://www.w3.org/TR/SVGMobile12/paths.html
function parse_path_data(d, splits) {
  var tokens = tokenize_path_data(d);
  var commands = [];
  var token;
  var x = 0;
  var y = 0;
  while (token = tokens.shift()) {
    if (token === "z" || token === "Z") {
      // Close path; no parameter
      commands.push(["Z"]);
    } else if (token === "M" || token === "L") {
      x = tokens.next_p();
      y = tokens.next_p();
      commands.push([token, x, y]);
    } else if (token === "m" || token === "l") {
      x += tokens.next_p();
      y += tokens.next_p();
      commands.push([token === "m" ? "M" : "L", x, y]);
    } else if (token === "C") {
      // Cubic curveto (6 params)
      var x1 = tokens.next_p();
      var y1 = tokens.next_p();
      var x2 = tokens.next_p();
      var y2 = tokens.next_p();
      var x3 = tokens.next_p();
      var y3 = tokens.next_p();
      commands = commands
        .concat(split_C(["C", x1, y1, x2, y2, x3, y3], x, y, splits));
      x = x3;
      y = y3;
    } else if (token === "c") {
      var x1 = tokens.next_p() + x;
      var y1 = tokens.next_p() + y;
      var x2 = tokens.next_p() + x;
      var y2 = tokens.next_p() + y;
      var x3 = tokens.next_p() + x;
      var y3 = tokens.next_p() + y;
      commands = commands
        .concat(split_C(["C", x1, y1, x2, y2, x3, y3], x, y, splits));
      x = x3;
      y = y3;
    } else if (token === "S") {
      // Smooth curveto where the two middle control points are the same
      // we expand it to a regular curveto and split it just the same
      var x1 = tokens.next_p();
      var y1 = tokens.next_p();
      var x2 = tokens.next_p();
      var y2 = tokens.next_p();
      commands = commands
        .concat(split_C(["C", x1, y1, x1, y1, x2, y2], x, y, splits));
      x = x2;
      y = y2;
    } else if (token === "s") {
      var x1 = tokens.next_p() + x;
      var y1 = tokens.next_p() + y;
      var x2 = tokens.next_p() + x;
      var y2 = tokens.next_p() + y;
      commands = commands
        .concat(split_C(["C", x1, y1, x1, y1, x2, y2], x, y, splits));
      x = x2;
      y = y2;
    } else {
      // Additional parameters, depending on the previous command
      var prev = commands[commands.length - 1];
      if (prev === undefined || prev === "Z") {
        tokens.unshift("M");
      } else if (prev === "M") {
        tokens.unshift("L");
      } else {
        tokens.unshift(prev);
      }
    }
  }
  return commands;
}

// Return the tokens (commands and parameters) for path data, everything else
// is ignored (no error reporting is done.) The token list has a next_p method
// to get the next parameter, or 0 if there is none.
function tokenize_path_data(d) {
  var tokenizer = /([chlmqstvz]|(?:\-?\d+\.?\d*)|(?:\-?\.\d+))/i;
  var tokens = [];
  tokens.next_p = function () {
    return parseFloat(this.shift()) || 0;
  };
  for (var m; m = tokenizer.exec(d);) {
    tokens.push(match[1]);
    d = d.substr(match.index + match[0].length);
  }
  return tokens;
}
