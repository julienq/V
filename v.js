// This is the Javascript library that we will use throughout the book.
// Simply include it with:
//   <script xlink:href="v.js"/>
// in an SVG document, or
//   <script src="v.js"></script>
// in an HTML5 document.

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
    for (attr in attrs) {
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

  

}.call(this));
