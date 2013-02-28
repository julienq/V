// This is the Javascript library that we will use throughout the book.
// Simply include it with:
//   <script xlink:href="V.js" type="text/javascript"/>
// in an SVG document, or
//   <script src="V.js"></script>
// in an HTML5 document. Do this at the end of the document if you have custom
// elements (e.g. <poly> or <strip>) and want them replaced.

(function () {
  "use strict";

  // Create the v object, saving the previous value of v if it was defined.
  var V = this.V = {
    old_V: this.V
  };

  // When we want to call array methods on array-like objects, such as strings,
  // `arguments`, or DOM lists, we can use this shorthand for the array
  // prototype. For instance: A.forEach.call(element.childNodes, ...) or the
  // classic A.slice.call(arguments, ...)
  var A = Array.prototype;


  // Remove prefix from requestAnimationFrame and cancelAnimationFrame, or
  // provide a fallback
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
      window.oRequestAnimationFrame || function (f) {
        return window.setTimeout(function () {
          f(Date.now());
        }, 16);
      }).bind(window);
    window.cancelAnimationFrame = (window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame || window.msCancelAnimationFrame ||
      window.oCancelAnimationFrame || window.clearTimeout).bind(window);
  }

  // Randomness

  // Random integer in the [min, max] range, or [0, max] if min is not given.
  // We asssume that min < max.
  V.random_int = function (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // Define a property named `name` on object `obj` with the custom setter `set`
  V.make_property = function (obj, name, set, init) {
    var value = init;
    Object.defineProperty(obj, name, {
      enumerable: true,
      get: function () {
        return value;
      },
      set: function (v) {
        value = v;
        set.call(this);
      }
    });
  };

  // Simple format function for messages and templates. Use %0, %1... as slots
  // for parameters. %% is also replaced by %. Null and undefined are replaced
  // by an empty string.
  String.prototype.fmt = function () {
    var args = arguments;
    return this.replace(/%(\d+|%)/g, function (_, p) {
      return p === "%" ? "%" : args[p] == null ? "" : args[p];
    });
  };

  // Convert a string with dash to camel case: remove dashes and capitalize the
  // following letter (e.g., convert foo-bar to fooBar)
  V.undash = function (s) {
    return s.replace(/-+(.?)/g, function (_, p) {
      return p.toUpperCase();
    });
  };

  // Known XML namespaces and their prefixes for use with create_element below.
  // XLink is used for href attributes with SVG elements. New namespace prefixes
  // can be added to this list and will be recognized by create_element. (For
  // instance, if you need MathML.)
  V.ns = {
    html: "http://www.w3.org/1999/xhtml",
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink"
  };

  // Make shorthands for known HTML, SVG and MathML elements, e.g. V.$p,
  // V.$fontFaceFormat (for svg:font-face-format), &c.
  V.tags = {
    html: ["a", "abbr", "address", "area", "article", "aside", "audio", "b",
      "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas",
      "caption", "cite", "code", "col", "colgroup", "command", "datalist", "dd",
      "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed",
      "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3",
      "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe",
      "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link",
      "map", "mark", "menu", "meta", "meter", "nav", "noscript", "object", "ol",
      "optgroup", "option", "output", "p", "param", "pre", "progress", "q",
      "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small",
      "source", "span", "strong", "style", "sub", "summary", "sup", "table",
      "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr",
      "tref", "track", "u", "ul", "var", "video", "wbr"],
    svg: ["altGlyph", "altGlyphDef", "altGlyphItem", "animate", "animateColor",
      "animateMotion", "animateTransform", "circle", "clipPath",
      "color-profile", "cursor", "defs", "desc", "ellipse", "feBlend",
      "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix",
      "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feFlood",
      "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage",
      "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight",
      "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter",
      "font", "font-face", "font-face-format", "font-face-name",
      "font-face-src", "font-face-uri", "foreignObject", "g", "glyph",
      "glyphRef", "hkern", "image", "line", "linearGradient", "marker", "mask",
      "metadata", "missing-glyph", "mpath", "path", "pattern", "polygon",
      "polyline", "radialGradient", "rect", "set", "stop", "svg", "switch",
      "symbol", "text", "textPath", "tref", "tspan", "use", "view", "vkern"]
  };

  // Append a child node `ch` to `node`. If it is a string, create a text
  // node with the string as content; if it is an array, append all elements of
  // the array; if it is not a Node, then simply ignore it.
  V.append_child = function (node, ch) {
    if (typeof ch === "string") {
      node.appendChild(node.ownerDocument.createTextNode(ch));
    } else if (typeof ch === "object") {
      if (Array.isArray(ch)) {
        ch.forEach(function (ch_) {
          V.append_child(node, ch_);
        });
      } else if (ch instanceof window.Node) {
        node.appendChild(ch);
      }
    }
  };

  // Simple way to create elements. The first argument is a string with the name
  // of the element (e.g., "rect"), and may also contain a namespace prefix as
  // defined in V.ns (e.g., "html:p"; the default is the namespace URI of the
  // document), class names, using "." as a separator similarly to CSS (e.g.,
  // "html:p.important.description") and an id preceded by # (e.g.,
  // "html:p.important.description#rule; not that this id may not contain a .)
  // The second argument is optional and is an object defining attributes of the
  // element; its properties are names of attributes, and the values are the
  // values for the attribute. Note that a false, null or undefined value will
  // *not* set the attribute. Attributes may have namespace prefixes so that we
  // can use "xlink:href" for instance (e.g., V.create_element("svg:use",
  // { "xlink:href": "#foo" });)
  V.create_element = function (name, attrs) {
    var contents;
    if (typeof attrs === "object" && !(attrs instanceof Node) &&
        !Array.isArray(attrs)) {
      // Make sure that attrs is a regular object (not an array or a Node object
      // as that would be the contents of the element, not its attributes.) If
      // that's the case, then the contents are all the other arguments passed
      // to the function
      contents = A.slice.call(arguments, 2);
    } else {
      // There are no attributes so the contents are all arguments except for
      // the first one.
      contents = A.slice.call(arguments, 1);
      attrs = {};
    }
    // Get the list of classes by splitting the first argument; the name will be
    // the first element, and the classes, if any, will follow.
    var classes = name.trim().split(".").map(function (x) {
      // If the element or class name contains #, then this is the id for the
      // element
      var m = x.match(/#(.*)$/);
      if (m) {
        attrs.id = m[1];
        return x.substr(0, m.index);
      }
      return x;
    });
    name = classes.shift();
    // Add the classes to the value of the class attribute if it was defined;
    // otherwise set it (id and class are regular attributes after all.)
    if (classes.length > 0) {
      attrs["class"] =
        (typeof attrs["class"] === "string" ? attrs["class"] + " " : "")
        + classes.join(" ");
    }
    // The name may be prefixed by a namespace prefix
    var m = name.match(/^(?:([^:]+):)?/);
    // Find the namespace URI for the prefix, if it is present and known;
    // default to the URI of the document element
    var ns = (m[1] && V.ns[m[1].toLowerCase()]) ||
      window.document.documentElement.namespaceURI;
    var elem = window.document
      .createElementNS(ns, m[1] ? name.substr(m[0].length) : name);
    for (var a in attrs) {
      if (attrs[a] != null && attrs[a] !== false) {
        var sp = a.split(":");
        ns = sp[1] && V.ns[sp[0].toLowerCase()];
        if (ns) {
          elem.setAttributeNS(ns, sp[1], attrs[a]);
        } else {
          elem.setAttribute(a, attrs[a]);
        }
      }
    }
    // Now append all the contents (if any) to the element and return it
    contents.forEach(function (ch) {
      V.append_child(elem, ch);
    });
    return elem;
  };

  for (var ns in V.tags) {
    V.tags[ns].forEach(function (tag) {
      V["$" + V.undash(tag)] =
        V.create_element.bind(this, "%0:%1".fmt(ns, tag));
    });
  }

  // Remove all children of a node
  V.remove_children = function (node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  };

  // SVG uses degrees for angle values, but Javascript trigonometric functions
  // use radians so we need to convert between the two.
  V.deg2rad = function (d) {
    return d / 180 * Math.PI;
  };

  V.rad2deg = function (r) {
    return r / Math.PI * 180;
  };

  // Create a regular polygon with the `sides` sides (should be at least 3),
  // inscribed in a circle of radius `r`, with an optional starting phase
  // (in degrees)
  V.$poly = function (attrs) {
    var sides = parseFloat(attrs.sides) || 0;
    var r = parseFloat(attrs.r) || 0;
    var phase = V.deg2rad(parseFloat(attrs.phase || 0));
    var x = parseFloat(attrs.x) || 0;
    var y = parseFloat(attrs.y) || 0;
    delete attrs.sides;
    delete attrs.r;
    delete attrs.phase;
    delete attrs.x;
    delete attrs.y;
    var points = [];
    for (var i = 0, ph = 2 * Math.PI / sides; i < sides; ++i) {
      points.push(x + r * Math.cos(phase + ph * i));
      points.push(y - r * Math.sin(phase + ph * i));
    }
    attrs.points = points.join(" ");
    return V.create_element("svg:polygon", attrs, arguments);
  };

  // Create a star with `branches` branches inscribed in a circle of radius `r`,
  // with an optional starting phase (in degrees)
  V.$star = function (attrs) {
    var branches = parseFloat(attrs.branches) || 0;
    var r = parseFloat(attrs.r) || 0;
    var phase = parseFloat(attrs.phase || 0);
    var x = parseFloat(attrs.x) || 0;
    var y = parseFloat(attrs.y) || 0;
    delete attrs.branches;
    delete attrs.r;
    delete attrs.phase;
    delete attrs.x;
    delete attrs.y;
    var points = [];
    if (branches % 2 === 0) {
      var sides = branches / 2;
      return V.create_element("svg:g", attrs,
          V.$poly({ sides: sides, x: x, y: y, r: r, phase: phase }),
          V.$poly({ sides: sides, x: x, y: y, r: r,
            phase: phase + 360 / branches }));
    }
    phase = V.deg2rad(phase);
    for (var i = 0, ph = 4 * Math.PI / branches; i < branches; ++i) {
      points.push(x + r * Math.cos(phase + ph * i));
      points.push(y - r * Math.sin(phase + ph * i));
    }
    points.push(points[0]);
    points.push(points[1]);
    attrs.points = points.join(" ");
    return V.create_element("svg:polyline", attrs, arguments);
  };

  // Triangle strips. The list of points should be at least 6 long (i.e. 3 pairs
  // of coordinates)
  V.$strip = function (attrs) {
    var points = (attrs.points || "").split(/\s*,\s*|\s+/);
    delete attrs.points;
    var g = V.create_element("g", attrs, arguments);
    for (var i = 0, n = points.length / 2 - 2; i < n; ++i) {
      g.appendChild(V.create_element("polygon", { points:
        [points[2 * i], points[2 * i + 1],
         points[2 * i + 2], points[2 * i + 3],
         points[2 * i + 4], points[2 * i + 5],
         points[2 * i], points[2 * i + 1]
        ].join(" ")
      }));
    }
    return g;
  };

  // Replace "fake" elements with their actual counterpart (e.g. strip, poly...)
  function realize_element(name) {
    A.forEach.call(document.querySelectorAll(name), function (elem) {
      var attrs = {};
      var ns_attrs = [];
      A.forEach.call(elem.attributes, function (a) {
        if (a.namespaceURI) {
          ns_attrs.push(a);
        } else {
          attrs[a.localName] = a.value;
        }
      });
      var e = elem.parentNode.replaceChild(
        V["$" + name](attrs, elem.childNodes),
        elem
      );
      ns_attrs.forEach(function (a) {
        e.setAttributeNS(a.namespaceURI, a.localName, a.value);
      });
      return e;
    });
  }

  // Realize all elements in the input document
  ["poly", "star", "strip"].forEach(realize_element);

}.call(this));
