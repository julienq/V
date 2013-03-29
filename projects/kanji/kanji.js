"use strict";

var speed = 144;   // units per second
var op_speed = 5;
var pause = 0.3;  // pause between strokes in seconds

var map = Array.prototype.map;

var Kanji = {};

// Initialize a new kanji from an XML element containing kanji elements and
// paths.
function init_kanji(xml) {
  var k = Object.create(Kanji);
  k.paths = map.call(xml.querySelectorAll("path"), function (path) {
    var p = V.$path({ d: path.getAttribute("d"), "stroke-opacity": 0 });
    p._length = p.getTotalLength();
    p.setAttribute("stroke-dasharray", "%0,%0".fmt(p._length));
    p.setAttribute("stroke-dashoffset", p._length);
    return p;
  });
  return k;
}

var silhouette = document.getElementById("silhouette");
var strokes = document.getElementById("strokes");
var paused = document.querySelector(".paused");
var kanji;

function animate() {
  var p = kanji.paths[kanji.path];
  var dt = (Date.now() - kanji.start) / 1000;
  if (dt > 0) {
    var offset = p._length - speed * dt;
    var op = V.clamp(dt * op_speed, 0, 1);
    if (offset < 0) {
      offset = 0;
      op = 1;
      ++kanji.path;
      kanji.start = Date.now() + pause * 1000;
    }
    p.setAttribute("stroke-dashoffset", offset);
    p.setAttribute("stroke-opacity", op);
  }
  if (!kanji.paused && kanji.path < kanji.paths.length) {
    kanji.frame = requestAnimationFrame(animate);
  }
}

document.addEventListener("click", function (e) {
  e.preventDefault();
  if (kanji.paused) {
    paused.classList.add("hidden");
    kanji.start = Date.now() + kanji.paused;
    delete kanji.paused;
    animate();
  } else if (kanji.path < kanji.paths.length) {
    paused.classList.remove("hidden");
    kanji.paused = kanji.start - Date.now();
    if (kanji.frame) {
      cancelAnimationFrame(kanji.frame);
    }
  } else {
    kanji.start = Date.now();
    kanji.path = 0;
    kanji.paths.forEach(function (p) {
      p.setAttribute("stroke-opacity", 0);
    });
    animate();
  }
}, false);

function get_kanji(response) {
  var parser = new DOMParser();
  var svg = window.atob(response.data.content.replace(/\s/g, ""));
  kanji = init_kanji(parser.parseFromString(svg, "application/xml"));
  V.remove_children(silhouette);
  V.remove_children(strokes);
  kanji.paths.forEach(function (p) {
    silhouette.appendChild(V.$path({ d: p.getAttribute("d") }));
    strokes.appendChild(p);
  });
}

var URL = "https://api.github.com/repos/KanjiVG/kanjivg/contents/kanji/%0.svg?callback=get_kanji";

// Get a kanji from the URL k argument and display it
var args = V.get_args();
if (typeof args.k === "string" && args.k.length === 1) {
  var code = V.pad(args.k.charCodeAt(0).toString(16), 5);
  window.document.body.appendChild(V.$script({ src: URL.fmt(code) }));
}
