// This is the Javascript library that we will use throughout the book.
// Simply include it with:
//   <script xlink:href="v.js" type="text/javascript"/>
// in an SVG document, or
//   <script src="v.js"></script>
// in an HTML5 document. Do this at the end of the document if you have custom
// elements (e.g. <poly> or <strip>) and want them replaced.

(function () {
  "use strict";

  // Create the v object, saving the previous value of v if it was defined.
  var v = this.v = {
    old_v: this.v
  };

  // When we want to call array methods on array-like objects, such as strings,
  // `arguments`, or DOM lists, we can use this shorthand for the array
  // prototype. For instance: A.forEach.call(element.childNodes, ...) or the
  // classic A.slice.call(arguments, ...)
  var A = Array.prototype;

  // Known XML namespaces and their prefixes for use with create_element below.
  // XLink is used for href attributes with SVG elements. New namespace prefixes
  // can be added to this list and will be recognized by create_element. (For
  // instance, if you need MathML.)
  v.ns = {
    html: "http://www.w3.org/1999/xhtml",
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink"
  };

  // Append a child node `ch` to `node`. If it is a string, create a text
  // node with the string as content; if it is an array, append all elements of
  // the array; if it is not a Node, then simply ignore it.
  v.append_child = function (node, ch) {
    if (typeof ch === "string") {
      node.appendChild(node.ownerDocument.createTextNode(ch));
    } else if (typeof ch === "object") {
      if (Array.isArray(ch)) {
        ch.forEach(function (ch_) {
          v.append_child(node, ch_);
        });
      } else if (ch instanceof window.Node) {
        node.appendChild(ch);
      }
    }
  };

  // Simple way to create elements. The first argument is a string with the name
  // of the element (e.g., "rect"), and may also contain a namespace prefix as
  // defined in v.ns (e.g., "html:p"; the default is the namespace URI of the
  // document), class names, using "." as a separator similarly to CSS (e.g.,
  // "html:p.important.description") and an id preceded by # (e.g.,
  // "html:p.important.description#rule; not that this id may not contain a .)
  // The second argument is optional and is an object defining attributes of the
  // element; its properties are names of attributes, and the values are the
  // values for the attribute. Note that a false, null or undefined value will
  // *not* set the attribute. Attributes may have namespace prefixes so that we
  // can use "xlink:href" for instance (e.g., v.create_element("svg:use",
  // { "xlink:href": "#foo" });)
  v.create_element = function (name, attrs) {
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
    var ns = (m[1] && v.ns[m[1].toLowerCase()]) ||
      window.document.documentElement.namespaceURI;
    var elem = window.document
      .createElementNS(ns, m[1] ? name.substr(m[0].length) : name);
    for (var a in attrs) {
      if (attrs[a] != null && attrs[a] !== false) {
        var sp = a.split(":");
        ns = sp[1] && v.ns[sp[0].toLowerCase()];
        if (ns) {
          elem.setAttributeNS(ns, sp[1], attrs[a]);
        } else {
          elem.setAttribute(a, attrs[a]);
        }
      }
    }
    // Now append all the contents (if any) to the element and return it
    contents.forEach(function (ch) {
      v.append_child(elem, ch);
    });
    return elem;
  };

  // SVG uses degrees for angle values, but Javascript trigonometric functions
  // use radians so we need to convert between the two.
  v.deg2rad = function (d) {
    return d / 180 * Math.PI;
  };

  // Create a regular polygon with the `sides` sides (should be at least 3),
  // inscribed in a circle of radius `r`, with an optional starting phase
  // (in degrees)
  v.$poly = function (attrs) {
    var sides = parseFloat(attrs.sides) || 0;
    var radius = parseFloat(attrs.r) || 0;
    var phase = v.deg2rad(parseFloat(attrs.phase || 0));
    var x = parseFloat(attrs.x) || 0;
    var y = parseFloat(attrs.y) || 0;
    delete attrs.sides;
    delete attrs.r;
    delete attrs.phase;
    delete attrs.x;
    delete attrs.y;
    var points = [];
    for (var i = 0, ph = 2 * Math.PI / sides; i < sides; ++i) {
      points.push(x + radius * Math.cos(phase + ph * i));
      points.push(y - radius * Math.sin(phase + ph * i));
    }
    attrs.points = points.join(" ");
    return v.create_element("svg:polygon", attrs, arguments);
  };

  v.$star = function (attrs) {
    var sides = parseFloat(attrs.sides) || 0;
    var radius = parseFloat(attrs.r) || 0;
    var phase = v.deg2rad(parseFloat(attrs.phase || 0));
    var x = parseFloat(attrs.x) || 0;
    var y = parseFloat(attrs.y) || 0;
    delete attrs.sides;
    delete attrs.r;
    delete attrs.phase;
    delete attrs.x;
    delete attrs.y;
    var points = [];
    if (sides % 2 === 0) {
      var g = v.create_element("svg:g", attrs);
      for (var i = 0, ph = 4 * Math.PI / sides; i < sides; i += 2) {
        points.push(x + radius * Math.cos(phase + ph * i));
        points.push(y - radius * Math.sin(phase + ph * i));
      }
      points.push(points[0]);
      points.push(points[1]);
      g.appendChild(v.create_element("svg:polyline",
            { points: points.join(" ") }));
      for (points = [], i = 0.5; i < sides; i += 2) {
        points.push(x + radius * Math.cos(phase + ph * i));
        points.push(y - radius * Math.sin(phase + ph * i));
      }
      points.push(points[0]);
      points.push(points[1]);
      g.appendChild(v.create_element("svg:polyline",
            { points: points.join(" ") }));
      return g;
    }
    for (var i = 0, ph = 4 * Math.PI / sides; i < sides; ++i) {
      points.push(x + radius * Math.cos(phase + ph * i));
      points.push(y - radius * Math.sin(phase + ph * i));
    }
    points.push(points[0]);
    points.push(points[1]);
    attrs.points = points.join(" ");
    return v.create_element("svg:polyline", attrs, arguments);
  };

  // Triangle strips. The list of points should be at least 6 long (i.e. 3 pairs
  // of coordinates)
  v.$strip = function (attrs) {
    var points = (attrs.points || "").split(/\s*,\s*|\s+/);
    delete attrs.points;
    var g = v.create_element("g", attrs, arguments);
    for (var i = 0, n = points.length / 2 - 2; i < n; ++i) {
      g.appendChild(v.create_element("polygon", { points:
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
        v["$" + name](attrs, elem.childNodes),
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
