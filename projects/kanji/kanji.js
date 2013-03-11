"use strict";

var speed = 72;    // units per second
var pause = 0.2;  // pause between strokes in seconds

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

// Get a kanji from the URL k argument and display it
var args = V.get_args();
if (typeof args.k === "string" && args.k.length === 1) {
  var code = V.pad(args.k.charCodeAt(0).toString(16), 5);
  V.ez_xhr("kanji/%0.svg".fmt(code), function (req) {
    if (req.readyState === 4 && (req.status === 0 || req.status === 200)) {
      var t = 0;
      var kanji = Object.create(Kanji).init(req.responseXML);
      var svg = document.querySelector("svg");
      svg.setAttribute("viewBox", kanji.vb);
      var mask = svg.appendChild(V.$rect({ width: svg.viewBox.baseVal.width,
        height: svg.viewBox.baseVal.height, fill: "rgba(0,0,0,0)",
        stroke: "none", id: "mask" }));
      kanji.paths.forEach(function (d) {
        var p = svg.insertBefore(V.$path({ d: d, "stroke-opacity": "0" }),
          mask);
        var l = p.getTotalLength();
        p.setAttribute("stroke-dasharray", "%0,%0".fmt(l, l));
        p.appendChild(V.$animate({ attributeName: "stroke-opacity",
          begin: "mask.click+%0s".fmt(t), from: 0, to: 1, dur: "%0s".fmt(pause),
          fill: "freeze" }));
        p.appendChild(V.$animate({ attributeName: "stroke-dashoffset",
          begin: "mask.click+%0s".fmt(t), from: l, to: 0, dur: "%0s".fmt(l / speed),
          fill: "freeze" }));
        t += l / speed + pause;
      });
    }
  });
}
