(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["textik_vendor"] = factory();
	else
		root["textik_vendor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// CodeMirror, copyright (c) by Marijn Haverbeke and others
	// Distributed under an MIT license: http://codemirror.net/LICENSE
	
	// This is CodeMirror (http://codemirror.net), a code editor
	// implemented in JavaScript on top of the browser's DOM.
	//
	// You can find some technical background for some of the code below
	// at http://marijnhaverbeke.nl/blog/#cm-internals .
	
	(function (global, factory) {
	   true ? module.exports = factory() :
	  typeof define === 'function' && define.amd ? define(factory) :
	  (global.CodeMirror = factory());
	}(this, (function () { 'use strict';
	
	// Kludges for bugs and behavior differences that can't be feature
	// detected are enabled based on userAgent etc sniffing.
	var userAgent = navigator.userAgent
	var platform = navigator.platform
	
	var gecko = /gecko\/\d/i.test(userAgent)
	var ie_upto10 = /MSIE \d/.test(userAgent)
	var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent)
	var ie = ie_upto10 || ie_11up
	var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : ie_11up[1])
	var webkit = /WebKit\//.test(userAgent)
	var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent)
	var chrome = /Chrome\//.test(userAgent)
	var presto = /Opera\//.test(userAgent)
	var safari = /Apple Computer/.test(navigator.vendor)
	var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent)
	var phantom = /PhantomJS/.test(userAgent)
	
	var ios = /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent)
	// This is woefully incomplete. Suggestions for alternative methods welcome.
	var mobile = ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent)
	var mac = ios || /Mac/.test(platform)
	var chromeOS = /\bCrOS\b/.test(userAgent)
	var windows = /win/i.test(platform)
	
	var presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/)
	if (presto_version) { presto_version = Number(presto_version[1]) }
	if (presto_version && presto_version >= 15) { presto = false; webkit = true }
	// Some browsers use the wrong event properties to signal cmd/ctrl on OS X
	var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11))
	var captureRightClick = gecko || (ie && ie_version >= 9)
	
	function classTest(cls) { return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*") }
	
	var rmClass = function(node, cls) {
	  var current = node.className
	  var match = classTest(cls).exec(current)
	  if (match) {
	    var after = current.slice(match.index + match[0].length)
	    node.className = current.slice(0, match.index) + (after ? match[1] + after : "")
	  }
	}
	
	function removeChildren(e) {
	  for (var count = e.childNodes.length; count > 0; --count)
	    { e.removeChild(e.firstChild) }
	  return e
	}
	
	function removeChildrenAndAdd(parent, e) {
	  return removeChildren(parent).appendChild(e)
	}
	
	function elt(tag, content, className, style) {
	  var e = document.createElement(tag)
	  if (className) { e.className = className }
	  if (style) { e.style.cssText = style }
	  if (typeof content == "string") { e.appendChild(document.createTextNode(content)) }
	  else if (content) { for (var i = 0; i < content.length; ++i) { e.appendChild(content[i]) } }
	  return e
	}
	
	var range
	if (document.createRange) { range = function(node, start, end, endNode) {
	  var r = document.createRange()
	  r.setEnd(endNode || node, end)
	  r.setStart(node, start)
	  return r
	} }
	else { range = function(node, start, end) {
	  var r = document.body.createTextRange()
	  try { r.moveToElementText(node.parentNode) }
	  catch(e) { return r }
	  r.collapse(true)
	  r.moveEnd("character", end)
	  r.moveStart("character", start)
	  return r
	} }
	
	function contains(parent, child) {
	  if (child.nodeType == 3) // Android browser always returns false when child is a textnode
	    { child = child.parentNode }
	  if (parent.contains)
	    { return parent.contains(child) }
	  do {
	    if (child.nodeType == 11) { child = child.host }
	    if (child == parent) { return true }
	  } while (child = child.parentNode)
	}
	
	function activeElt() {
	  // IE and Edge may throw an "Unspecified Error" when accessing document.activeElement.
	  // IE < 10 will throw when accessed while the page is loading or in an iframe.
	  // IE > 9 and Edge will throw when accessed in an iframe if document.body is unavailable.
	  var activeElement
	  try {
	    activeElement = document.activeElement
	  } catch(e) {
	    activeElement = document.body || null
	  }
	  while (activeElement && activeElement.root && activeElement.root.activeElement)
	    { activeElement = activeElement.root.activeElement }
	  return activeElement
	}
	
	function addClass(node, cls) {
	  var current = node.className
	  if (!classTest(cls).test(current)) { node.className += (current ? " " : "") + cls }
	}
	function joinClasses(a, b) {
	  var as = a.split(" ")
	  for (var i = 0; i < as.length; i++)
	    { if (as[i] && !classTest(as[i]).test(b)) { b += " " + as[i] } }
	  return b
	}
	
	var selectInput = function(node) { node.select() }
	if (ios) // Mobile Safari apparently has a bug where select() is broken.
	  { selectInput = function(node) { node.selectionStart = 0; node.selectionEnd = node.value.length } }
	else if (ie) // Suppress mysterious IE10 errors
	  { selectInput = function(node) { try { node.select() } catch(_e) {} } }
	
	function bind(f) {
	  var args = Array.prototype.slice.call(arguments, 1)
	  return function(){return f.apply(null, args)}
	}
	
	function copyObj(obj, target, overwrite) {
	  if (!target) { target = {} }
	  for (var prop in obj)
	    { if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
	      { target[prop] = obj[prop] } }
	  return target
	}
	
	// Counts the column offset in a string, taking tabs into account.
	// Used mostly to find indentation.
	function countColumn(string, end, tabSize, startIndex, startValue) {
	  if (end == null) {
	    end = string.search(/[^\s\u00a0]/)
	    if (end == -1) { end = string.length }
	  }
	  for (var i = startIndex || 0, n = startValue || 0;;) {
	    var nextTab = string.indexOf("\t", i)
	    if (nextTab < 0 || nextTab >= end)
	      { return n + (end - i) }
	    n += nextTab - i
	    n += tabSize - (n % tabSize)
	    i = nextTab + 1
	  }
	}
	
	function Delayed() {this.id = null}
	Delayed.prototype.set = function(ms, f) {
	  clearTimeout(this.id)
	  this.id = setTimeout(f, ms)
	}
	
	function indexOf(array, elt) {
	  for (var i = 0; i < array.length; ++i)
	    { if (array[i] == elt) { return i } }
	  return -1
	}
	
	// Number of pixels added to scroller and sizer to hide scrollbar
	var scrollerGap = 30
	
	// Returned or thrown by various protocols to signal 'I'm not
	// handling this'.
	var Pass = {toString: function(){return "CodeMirror.Pass"}}
	
	// Reused option objects for setSelection & friends
	var sel_dontScroll = {scroll: false};
	var sel_mouse = {origin: "*mouse"};
	var sel_move = {origin: "+move"};
	// The inverse of countColumn -- find the offset that corresponds to
	// a particular column.
	function findColumn(string, goal, tabSize) {
	  for (var pos = 0, col = 0;;) {
	    var nextTab = string.indexOf("\t", pos)
	    if (nextTab == -1) { nextTab = string.length }
	    var skipped = nextTab - pos
	    if (nextTab == string.length || col + skipped >= goal)
	      { return pos + Math.min(skipped, goal - col) }
	    col += nextTab - pos
	    col += tabSize - (col % tabSize)
	    pos = nextTab + 1
	    if (col >= goal) { return pos }
	  }
	}
	
	var spaceStrs = [""]
	function spaceStr(n) {
	  while (spaceStrs.length <= n)
	    { spaceStrs.push(lst(spaceStrs) + " ") }
	  return spaceStrs[n]
	}
	
	function lst(arr) { return arr[arr.length-1] }
	
	function map(array, f) {
	  var out = []
	  for (var i = 0; i < array.length; i++) { out[i] = f(array[i], i) }
	  return out
	}
	
	function insertSorted(array, value, score) {
	  var pos = 0, priority = score(value)
	  while (pos < array.length && score(array[pos]) <= priority) { pos++ }
	  array.splice(pos, 0, value)
	}
	
	function nothing() {}
	
	function createObj(base, props) {
	  var inst
	  if (Object.create) {
	    inst = Object.create(base)
	  } else {
	    nothing.prototype = base
	    inst = new nothing()
	  }
	  if (props) { copyObj(props, inst) }
	  return inst
	}
	
	var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/
	function isWordCharBasic(ch) {
	  return /\w/.test(ch) || ch > "\x80" &&
	    (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch))
	}
	function isWordChar(ch, helper) {
	  if (!helper) { return isWordCharBasic(ch) }
	  if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) { return true }
	  return helper.test(ch)
	}
	
	function isEmpty(obj) {
	  for (var n in obj) { if (obj.hasOwnProperty(n) && obj[n]) { return false } }
	  return true
	}
	
	// Extending unicode characters. A series of a non-extending char +
	// any number of extending chars is treated as a single unit as far
	// as editing and measuring is concerned. This is not fully correct,
	// since some scripts/fonts/browsers also treat other configurations
	// of code points as a group.
	var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/
	function isExtendingChar(ch) { return ch.charCodeAt(0) >= 768 && extendingChars.test(ch) }
	
	// The display handles the DOM integration, both for input reading
	// and content drawing. It holds references to DOM nodes and
	// display-related state.
	
	function Display(place, doc, input) {
	  var d = this
	  this.input = input
	
	  // Covers bottom-right square when both scrollbars are present.
	  d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler")
	  d.scrollbarFiller.setAttribute("cm-not-content", "true")
	  // Covers bottom of gutter when coverGutterNextToScrollbar is on
	  // and h scrollbar is present.
	  d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler")
	  d.gutterFiller.setAttribute("cm-not-content", "true")
	  // Will contain the actual code, positioned to cover the viewport.
	  d.lineDiv = elt("div", null, "CodeMirror-code")
	  // Elements are added to these to represent selection and cursors.
	  d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1")
	  d.cursorDiv = elt("div", null, "CodeMirror-cursors")
	  // A visibility: hidden element used to find the size of things.
	  d.measure = elt("div", null, "CodeMirror-measure")
	  // When lines outside of the viewport are measured, they are drawn in this.
	  d.lineMeasure = elt("div", null, "CodeMirror-measure")
	  // Wraps everything that needs to exist inside the vertically-padded coordinate system
	  d.lineSpace = elt("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv],
	                    null, "position: relative; outline: none")
	  // Moved around its parent to cover visible view.
	  d.mover = elt("div", [elt("div", [d.lineSpace], "CodeMirror-lines")], null, "position: relative")
	  // Set to the height of the document, allowing scrolling.
	  d.sizer = elt("div", [d.mover], "CodeMirror-sizer")
	  d.sizerWidth = null
	  // Behavior of elts with overflow: auto and padding is
	  // inconsistent across browsers. This is used to ensure the
	  // scrollable area is big enough.
	  d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;")
	  // Will contain the gutters, if any.
	  d.gutters = elt("div", null, "CodeMirror-gutters")
	  d.lineGutter = null
	  // Actual scrollable element.
	  d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll")
	  d.scroller.setAttribute("tabIndex", "-1")
	  // The element in which the editor lives.
	  d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror")
	
	  // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)
	  if (ie && ie_version < 8) { d.gutters.style.zIndex = -1; d.scroller.style.paddingRight = 0 }
	  if (!webkit && !(gecko && mobile)) { d.scroller.draggable = true }
	
	  if (place) {
	    if (place.appendChild) { place.appendChild(d.wrapper) }
	    else { place(d.wrapper) }
	  }
	
	  // Current rendered range (may be bigger than the view window).
	  d.viewFrom = d.viewTo = doc.first
	  d.reportedViewFrom = d.reportedViewTo = doc.first
	  // Information about the rendered lines.
	  d.view = []
	  d.renderedView = null
	  // Holds info about a single rendered line when it was rendered
	  // for measurement, while not in view.
	  d.externalMeasured = null
	  // Empty space (in pixels) above the view
	  d.viewOffset = 0
	  d.lastWrapHeight = d.lastWrapWidth = 0
	  d.updateLineNumbers = null
	
	  d.nativeBarWidth = d.barHeight = d.barWidth = 0
	  d.scrollbarsClipped = false
	
	  // Used to only resize the line number gutter when necessary (when
	  // the amount of lines crosses a boundary that makes its width change)
	  d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null
	  // Set to true when a non-horizontal-scrolling line widget is
	  // added. As an optimization, line widget aligning is skipped when
	  // this is false.
	  d.alignWidgets = false
	
	  d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null
	
	  // Tracks the maximum line length so that the horizontal scrollbar
	  // can be kept static when scrolling.
	  d.maxLine = null
	  d.maxLineLength = 0
	  d.maxLineChanged = false
	
	  // Used for measuring wheel scrolling granularity
	  d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null
	
	  // True when shift is held down.
	  d.shift = false
	
	  // Used to track whether anything happened since the context menu
	  // was opened.
	  d.selForContextMenu = null
	
	  d.activeTouch = null
	
	  input.init(d)
	}
	
	// Find the line object corresponding to the given line number.
	function getLine(doc, n) {
	  n -= doc.first
	  if (n < 0 || n >= doc.size) { throw new Error("There is no line " + (n + doc.first) + " in the document.") }
	  var chunk = doc
	  while (!chunk.lines) {
	    for (var i = 0;; ++i) {
	      var child = chunk.children[i], sz = child.chunkSize()
	      if (n < sz) { chunk = child; break }
	      n -= sz
	    }
	  }
	  return chunk.lines[n]
	}
	
	// Get the part of a document between two positions, as an array of
	// strings.
	function getBetween(doc, start, end) {
	  var out = [], n = start.line
	  doc.iter(start.line, end.line + 1, function (line) {
	    var text = line.text
	    if (n == end.line) { text = text.slice(0, end.ch) }
	    if (n == start.line) { text = text.slice(start.ch) }
	    out.push(text)
	    ++n
	  })
	  return out
	}
	// Get the lines between from and to, as array of strings.
	function getLines(doc, from, to) {
	  var out = []
	  doc.iter(from, to, function (line) { out.push(line.text) }) // iter aborts when callback returns truthy value
	  return out
	}
	
	// Update the height of a line, propagating the height change
	// upwards to parent nodes.
	function updateLineHeight(line, height) {
	  var diff = height - line.height
	  if (diff) { for (var n = line; n; n = n.parent) { n.height += diff } }
	}
	
	// Given a line object, find its line number by walking up through
	// its parent links.
	function lineNo(line) {
	  if (line.parent == null) { return null }
	  var cur = line.parent, no = indexOf(cur.lines, line)
	  for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
	    for (var i = 0;; ++i) {
	      if (chunk.children[i] == cur) { break }
	      no += chunk.children[i].chunkSize()
	    }
	  }
	  return no + cur.first
	}
	
	// Find the line at the given vertical position, using the height
	// information in the document tree.
	function lineAtHeight(chunk, h) {
	  var n = chunk.first
	  outer: do {
	    for (var i$1 = 0; i$1 < chunk.children.length; ++i$1) {
	      var child = chunk.children[i$1], ch = child.height
	      if (h < ch) { chunk = child; continue outer }
	      h -= ch
	      n += child.chunkSize()
	    }
	    return n
	  } while (!chunk.lines)
	  var i = 0
	  for (; i < chunk.lines.length; ++i) {
	    var line = chunk.lines[i], lh = line.height
	    if (h < lh) { break }
	    h -= lh
	  }
	  return n + i
	}
	
	function isLine(doc, l) {return l >= doc.first && l < doc.first + doc.size}
	
	function lineNumberFor(options, i) {
	  return String(options.lineNumberFormatter(i + options.firstLineNumber))
	}
	
	// A Pos instance represents a position within the text.
	function Pos (line, ch) {
	  if (!(this instanceof Pos)) { return new Pos(line, ch) }
	  this.line = line; this.ch = ch
	}
	
	// Compare two positions, return 0 if they are the same, a negative
	// number when a is less, and a positive number otherwise.
	function cmp(a, b) { return a.line - b.line || a.ch - b.ch }
	
	function copyPos(x) {return Pos(x.line, x.ch)}
	function maxPos(a, b) { return cmp(a, b) < 0 ? b : a }
	function minPos(a, b) { return cmp(a, b) < 0 ? a : b }
	
	// Most of the external API clips given positions to make sure they
	// actually exist within the document.
	function clipLine(doc, n) {return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1))}
	function clipPos(doc, pos) {
	  if (pos.line < doc.first) { return Pos(doc.first, 0) }
	  var last = doc.first + doc.size - 1
	  if (pos.line > last) { return Pos(last, getLine(doc, last).text.length) }
	  return clipToLen(pos, getLine(doc, pos.line).text.length)
	}
	function clipToLen(pos, linelen) {
	  var ch = pos.ch
	  if (ch == null || ch > linelen) { return Pos(pos.line, linelen) }
	  else if (ch < 0) { return Pos(pos.line, 0) }
	  else { return pos }
	}
	function clipPosArray(doc, array) {
	  var out = []
	  for (var i = 0; i < array.length; i++) { out[i] = clipPos(doc, array[i]) }
	  return out
	}
	
	// Optimize some code when these features are not used.
	var sawReadOnlySpans = false;
	var sawCollapsedSpans = false;
	function seeReadOnlySpans() {
	  sawReadOnlySpans = true
	}
	
	function seeCollapsedSpans() {
	  sawCollapsedSpans = true
	}
	
	// TEXTMARKER SPANS
	
	function MarkedSpan(marker, from, to) {
	  this.marker = marker
	  this.from = from; this.to = to
	}
	
	// Search an array of spans for a span matching the given marker.
	function getMarkedSpanFor(spans, marker) {
	  if (spans) { for (var i = 0; i < spans.length; ++i) {
	    var span = spans[i]
	    if (span.marker == marker) { return span }
	  } }
	}
	// Remove a span from an array, returning undefined if no spans are
	// left (we don't store arrays for lines without spans).
	function removeMarkedSpan(spans, span) {
	  var r
	  for (var i = 0; i < spans.length; ++i)
	    { if (spans[i] != span) { (r || (r = [])).push(spans[i]) } }
	  return r
	}
	// Add a span to a line.
	function addMarkedSpan(line, span) {
	  line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span]
	  span.marker.attachLine(line)
	}
	
	// Used for the algorithm that adjusts markers for a change in the
	// document. These functions cut an array of spans at a given
	// character position, returning an array of remaining chunks (or
	// undefined if nothing remains).
	function markedSpansBefore(old, startCh, isInsert) {
	  var nw
	  if (old) { for (var i = 0; i < old.length; ++i) {
	    var span = old[i], marker = span.marker
	    var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh)
	    if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
	      var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh)
	      ;(nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to))
	    }
	  } }
	  return nw
	}
	function markedSpansAfter(old, endCh, isInsert) {
	  var nw
	  if (old) { for (var i = 0; i < old.length; ++i) {
	    var span = old[i], marker = span.marker
	    var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh)
	    if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
	      var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh)
	      ;(nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh,
	                                            span.to == null ? null : span.to - endCh))
	    }
	  } }
	  return nw
	}
	
	// Given a change object, compute the new set of marker spans that
	// cover the line in which the change took place. Removes spans
	// entirely within the change, reconnects spans belonging to the
	// same marker that appear on both sides of the change, and cuts off
	// spans partially within the change. Returns an array of span
	// arrays with one element for each line in (after) the change.
	function stretchSpansOverChange(doc, change) {
	  if (change.full) { return null }
	  var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans
	  var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans
	  if (!oldFirst && !oldLast) { return null }
	
	  var startCh = change.from.ch, endCh = change.to.ch, isInsert = cmp(change.from, change.to) == 0
	  // Get the spans that 'stick out' on both sides
	  var first = markedSpansBefore(oldFirst, startCh, isInsert)
	  var last = markedSpansAfter(oldLast, endCh, isInsert)
	
	  // Next, merge those two ends
	  var sameLine = change.text.length == 1, offset = lst(change.text).length + (sameLine ? startCh : 0)
	  if (first) {
	    // Fix up .to properties of first
	    for (var i = 0; i < first.length; ++i) {
	      var span = first[i]
	      if (span.to == null) {
	        var found = getMarkedSpanFor(last, span.marker)
	        if (!found) { span.to = startCh }
	        else if (sameLine) { span.to = found.to == null ? null : found.to + offset }
	      }
	    }
	  }
	  if (last) {
	    // Fix up .from in last (or move them into first in case of sameLine)
	    for (var i$1 = 0; i$1 < last.length; ++i$1) {
	      var span$1 = last[i$1]
	      if (span$1.to != null) { span$1.to += offset }
	      if (span$1.from == null) {
	        var found$1 = getMarkedSpanFor(first, span$1.marker)
	        if (!found$1) {
	          span$1.from = offset
	          if (sameLine) { (first || (first = [])).push(span$1) }
	        }
	      } else {
	        span$1.from += offset
	        if (sameLine) { (first || (first = [])).push(span$1) }
	      }
	    }
	  }
	  // Make sure we didn't create any zero-length spans
	  if (first) { first = clearEmptySpans(first) }
	  if (last && last != first) { last = clearEmptySpans(last) }
	
	  var newMarkers = [first]
	  if (!sameLine) {
	    // Fill gap with whole-line-spans
	    var gap = change.text.length - 2, gapMarkers
	    if (gap > 0 && first)
	      { for (var i$2 = 0; i$2 < first.length; ++i$2)
	        { if (first[i$2].to == null)
	          { (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i$2].marker, null, null)) } } }
	    for (var i$3 = 0; i$3 < gap; ++i$3)
	      { newMarkers.push(gapMarkers) }
	    newMarkers.push(last)
	  }
	  return newMarkers
	}
	
	// Remove spans that are empty and don't have a clearWhenEmpty
	// option of false.
	function clearEmptySpans(spans) {
	  for (var i = 0; i < spans.length; ++i) {
	    var span = spans[i]
	    if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false)
	      { spans.splice(i--, 1) }
	  }
	  if (!spans.length) { return null }
	  return spans
	}
	
	// Used to 'clip' out readOnly ranges when making a change.
	function removeReadOnlyRanges(doc, from, to) {
	  var markers = null
	  doc.iter(from.line, to.line + 1, function (line) {
	    if (line.markedSpans) { for (var i = 0; i < line.markedSpans.length; ++i) {
	      var mark = line.markedSpans[i].marker
	      if (mark.readOnly && (!markers || indexOf(markers, mark) == -1))
	        { (markers || (markers = [])).push(mark) }
	    } }
	  })
	  if (!markers) { return null }
	  var parts = [{from: from, to: to}]
	  for (var i = 0; i < markers.length; ++i) {
	    var mk = markers[i], m = mk.find(0)
	    for (var j = 0; j < parts.length; ++j) {
	      var p = parts[j]
	      if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) { continue }
	      var newParts = [j, 1], dfrom = cmp(p.from, m.from), dto = cmp(p.to, m.to)
	      if (dfrom < 0 || !mk.inclusiveLeft && !dfrom)
	        { newParts.push({from: p.from, to: m.from}) }
	      if (dto > 0 || !mk.inclusiveRight && !dto)
	        { newParts.push({from: m.to, to: p.to}) }
	      parts.splice.apply(parts, newParts)
	      j += newParts.length - 1
	    }
	  }
	  return parts
	}
	
	// Connect or disconnect spans from a line.
	function detachMarkedSpans(line) {
	  var spans = line.markedSpans
	  if (!spans) { return }
	  for (var i = 0; i < spans.length; ++i)
	    { spans[i].marker.detachLine(line) }
	  line.markedSpans = null
	}
	function attachMarkedSpans(line, spans) {
	  if (!spans) { return }
	  for (var i = 0; i < spans.length; ++i)
	    { spans[i].marker.attachLine(line) }
	  line.markedSpans = spans
	}
	
	// Helpers used when computing which overlapping collapsed span
	// counts as the larger one.
	function extraLeft(marker) { return marker.inclusiveLeft ? -1 : 0 }
	function extraRight(marker) { return marker.inclusiveRight ? 1 : 0 }
	
	// Returns a number indicating which of two overlapping collapsed
	// spans is larger (and thus includes the other). Falls back to
	// comparing ids when the spans cover exactly the same range.
	function compareCollapsedMarkers(a, b) {
	  var lenDiff = a.lines.length - b.lines.length
	  if (lenDiff != 0) { return lenDiff }
	  var aPos = a.find(), bPos = b.find()
	  var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b)
	  if (fromCmp) { return -fromCmp }
	  var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b)
	  if (toCmp) { return toCmp }
	  return b.id - a.id
	}
	
	// Find out whether a line ends or starts in a collapsed span. If
	// so, return the marker for that span.
	function collapsedSpanAtSide(line, start) {
	  var sps = sawCollapsedSpans && line.markedSpans, found
	  if (sps) { for (var sp = (void 0), i = 0; i < sps.length; ++i) {
	    sp = sps[i]
	    if (sp.marker.collapsed && (start ? sp.from : sp.to) == null &&
	        (!found || compareCollapsedMarkers(found, sp.marker) < 0))
	      { found = sp.marker }
	  } }
	  return found
	}
	function collapsedSpanAtStart(line) { return collapsedSpanAtSide(line, true) }
	function collapsedSpanAtEnd(line) { return collapsedSpanAtSide(line, false) }
	
	// Test whether there exists a collapsed span that partially
	// overlaps (covers the start or end, but not both) of a new span.
	// Such overlap is not allowed.
	function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
	  var line = getLine(doc, lineNo)
	  var sps = sawCollapsedSpans && line.markedSpans
	  if (sps) { for (var i = 0; i < sps.length; ++i) {
	    var sp = sps[i]
	    if (!sp.marker.collapsed) { continue }
	    var found = sp.marker.find(0)
	    var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker)
	    var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker)
	    if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) { continue }
	    if (fromCmp <= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) ||
	        fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0))
	      { return true }
	  } }
	}
	
	// A visual line is a line as drawn on the screen. Folding, for
	// example, can cause multiple logical lines to appear on the same
	// visual line. This finds the start of the visual line that the
	// given line is part of (usually that is the line itself).
	function visualLine(line) {
	  var merged
	  while (merged = collapsedSpanAtStart(line))
	    { line = merged.find(-1, true).line }
	  return line
	}
	
	// Returns an array of logical lines that continue the visual line
	// started by the argument, or undefined if there are no such lines.
	function visualLineContinued(line) {
	  var merged, lines
	  while (merged = collapsedSpanAtEnd(line)) {
	    line = merged.find(1, true).line
	    ;(lines || (lines = [])).push(line)
	  }
	  return lines
	}
	
	// Get the line number of the start of the visual line that the
	// given line number is part of.
	function visualLineNo(doc, lineN) {
	  var line = getLine(doc, lineN), vis = visualLine(line)
	  if (line == vis) { return lineN }
	  return lineNo(vis)
	}
	
	// Get the line number of the start of the next visual line after
	// the given line.
	function visualLineEndNo(doc, lineN) {
	  if (lineN > doc.lastLine()) { return lineN }
	  var line = getLine(doc, lineN), merged
	  if (!lineIsHidden(doc, line)) { return lineN }
	  while (merged = collapsedSpanAtEnd(line))
	    { line = merged.find(1, true).line }
	  return lineNo(line) + 1
	}
	
	// Compute whether a line is hidden. Lines count as hidden when they
	// are part of a visual line that starts with another line, or when
	// they are entirely covered by collapsed, non-widget span.
	function lineIsHidden(doc, line) {
	  var sps = sawCollapsedSpans && line.markedSpans
	  if (sps) { for (var sp = (void 0), i = 0; i < sps.length; ++i) {
	    sp = sps[i]
	    if (!sp.marker.collapsed) { continue }
	    if (sp.from == null) { return true }
	    if (sp.marker.widgetNode) { continue }
	    if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp))
	      { return true }
	  } }
	}
	function lineIsHiddenInner(doc, line, span) {
	  if (span.to == null) {
	    var end = span.marker.find(1, true)
	    return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker))
	  }
	  if (span.marker.inclusiveRight && span.to == line.text.length)
	    { return true }
	  for (var sp = (void 0), i = 0; i < line.markedSpans.length; ++i) {
	    sp = line.markedSpans[i]
	    if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to &&
	        (sp.to == null || sp.to != span.from) &&
	        (sp.marker.inclusiveLeft || span.marker.inclusiveRight) &&
	        lineIsHiddenInner(doc, line, sp)) { return true }
	  }
	}
	
	// Find the height above the given line.
	function heightAtLine(lineObj) {
	  lineObj = visualLine(lineObj)
	
	  var h = 0, chunk = lineObj.parent
	  for (var i = 0; i < chunk.lines.length; ++i) {
	    var line = chunk.lines[i]
	    if (line == lineObj) { break }
	    else { h += line.height }
	  }
	  for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
	    for (var i$1 = 0; i$1 < p.children.length; ++i$1) {
	      var cur = p.children[i$1]
	      if (cur == chunk) { break }
	      else { h += cur.height }
	    }
	  }
	  return h
	}
	
	// Compute the character length of a line, taking into account
	// collapsed ranges (see markText) that might hide parts, and join
	// other lines onto it.
	function lineLength(line) {
	  if (line.height == 0) { return 0 }
	  var len = line.text.length, merged, cur = line
	  while (merged = collapsedSpanAtStart(cur)) {
	    var found = merged.find(0, true)
	    cur = found.from.line
	    len += found.from.ch - found.to.ch
	  }
	  cur = line
	  while (merged = collapsedSpanAtEnd(cur)) {
	    var found$1 = merged.find(0, true)
	    len -= cur.text.length - found$1.from.ch
	    cur = found$1.to.line
	    len += cur.text.length - found$1.to.ch
	  }
	  return len
	}
	
	// Find the longest line in the document.
	function findMaxLine(cm) {
	  var d = cm.display, doc = cm.doc
	  d.maxLine = getLine(doc, doc.first)
	  d.maxLineLength = lineLength(d.maxLine)
	  d.maxLineChanged = true
	  doc.iter(function (line) {
	    var len = lineLength(line)
	    if (len > d.maxLineLength) {
	      d.maxLineLength = len
	      d.maxLine = line
	    }
	  })
	}
	
	// BIDI HELPERS
	
	function iterateBidiSections(order, from, to, f) {
	  if (!order) { return f(from, to, "ltr") }
	  var found = false
	  for (var i = 0; i < order.length; ++i) {
	    var part = order[i]
	    if (part.from < to && part.to > from || from == to && part.to == from) {
	      f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr")
	      found = true
	    }
	  }
	  if (!found) { f(from, to, "ltr") }
	}
	
	function bidiLeft(part) { return part.level % 2 ? part.to : part.from }
	function bidiRight(part) { return part.level % 2 ? part.from : part.to }
	
	function lineLeft(line) { var order = getOrder(line); return order ? bidiLeft(order[0]) : 0 }
	function lineRight(line) {
	  var order = getOrder(line)
	  if (!order) { return line.text.length }
	  return bidiRight(lst(order))
	}
	
	function compareBidiLevel(order, a, b) {
	  var linedir = order[0].level
	  if (a == linedir) { return true }
	  if (b == linedir) { return false }
	  return a < b
	}
	
	var bidiOther = null
	function getBidiPartAt(order, pos) {
	  var found
	  bidiOther = null
	  for (var i = 0; i < order.length; ++i) {
	    var cur = order[i]
	    if (cur.from < pos && cur.to > pos) { return i }
	    if ((cur.from == pos || cur.to == pos)) {
	      if (found == null) {
	        found = i
	      } else if (compareBidiLevel(order, cur.level, order[found].level)) {
	        if (cur.from != cur.to) { bidiOther = found }
	        return i
	      } else {
	        if (cur.from != cur.to) { bidiOther = i }
	        return found
	      }
	    }
	  }
	  return found
	}
	
	function moveInLine(line, pos, dir, byUnit) {
	  if (!byUnit) { return pos + dir }
	  do { pos += dir }
	  while (pos > 0 && isExtendingChar(line.text.charAt(pos)))
	  return pos
	}
	
	// This is needed in order to move 'visually' through bi-directional
	// text -- i.e., pressing left should make the cursor go left, even
	// when in RTL text. The tricky part is the 'jumps', where RTL and
	// LTR text touch each other. This often requires the cursor offset
	// to move more than one unit, in order to visually move one unit.
	function moveVisually(line, start, dir, byUnit) {
	  var bidi = getOrder(line)
	  if (!bidi) { return moveLogically(line, start, dir, byUnit) }
	  var pos = getBidiPartAt(bidi, start), part = bidi[pos]
	  var target = moveInLine(line, start, part.level % 2 ? -dir : dir, byUnit)
	
	  for (;;) {
	    if (target > part.from && target < part.to) { return target }
	    if (target == part.from || target == part.to) {
	      if (getBidiPartAt(bidi, target) == pos) { return target }
	      part = bidi[pos += dir]
	      return (dir > 0) == part.level % 2 ? part.to : part.from
	    } else {
	      part = bidi[pos += dir]
	      if (!part) { return null }
	      if ((dir > 0) == part.level % 2)
	        { target = moveInLine(line, part.to, -1, byUnit) }
	      else
	        { target = moveInLine(line, part.from, 1, byUnit) }
	    }
	  }
	}
	
	function moveLogically(line, start, dir, byUnit) {
	  var target = start + dir
	  if (byUnit) { while (target > 0 && isExtendingChar(line.text.charAt(target))) { target += dir } }
	  return target < 0 || target > line.text.length ? null : target
	}
	
	// Bidirectional ordering algorithm
	// See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
	// that this (partially) implements.
	
	// One-char codes used for character types:
	// L (L):   Left-to-Right
	// R (R):   Right-to-Left
	// r (AL):  Right-to-Left Arabic
	// 1 (EN):  European Number
	// + (ES):  European Number Separator
	// % (ET):  European Number Terminator
	// n (AN):  Arabic Number
	// , (CS):  Common Number Separator
	// m (NSM): Non-Spacing Mark
	// b (BN):  Boundary Neutral
	// s (B):   Paragraph Separator
	// t (S):   Segment Separator
	// w (WS):  Whitespace
	// N (ON):  Other Neutrals
	
	// Returns null if characters are ordered as they appear
	// (left-to-right), or an array of sections ({from, to, level}
	// objects) in the order in which they occur visually.
	var bidiOrdering = (function() {
	  // Character types for codepoints 0 to 0xff
	  var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN"
	  // Character types for codepoints 0x600 to 0x6f9
	  var arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111"
	  function charType(code) {
	    if (code <= 0xf7) { return lowTypes.charAt(code) }
	    else if (0x590 <= code && code <= 0x5f4) { return "R" }
	    else if (0x600 <= code && code <= 0x6f9) { return arabicTypes.charAt(code - 0x600) }
	    else if (0x6ee <= code && code <= 0x8ac) { return "r" }
	    else if (0x2000 <= code && code <= 0x200b) { return "w" }
	    else if (code == 0x200c) { return "b" }
	    else { return "L" }
	  }
	
	  var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/
	  var isNeutral = /[stwN]/, isStrong = /[LRr]/, countsAsLeft = /[Lb1n]/, countsAsNum = /[1n]/
	  // Browsers seem to always treat the boundaries of block elements as being L.
	  var outerType = "L"
	
	  function BidiSpan(level, from, to) {
	    this.level = level
	    this.from = from; this.to = to
	  }
	
	  return function(str) {
	    if (!bidiRE.test(str)) { return false }
	    var len = str.length, types = []
	    for (var i = 0; i < len; ++i)
	      { types.push(charType(str.charCodeAt(i))) }
	
	    // W1. Examine each non-spacing mark (NSM) in the level run, and
	    // change the type of the NSM to the type of the previous
	    // character. If the NSM is at the start of the level run, it will
	    // get the type of sor.
	    for (var i$1 = 0, prev = outerType; i$1 < len; ++i$1) {
	      var type = types[i$1]
	      if (type == "m") { types[i$1] = prev }
	      else { prev = type }
	    }
	
	    // W2. Search backwards from each instance of a European number
	    // until the first strong type (R, L, AL, or sor) is found. If an
	    // AL is found, change the type of the European number to Arabic
	    // number.
	    // W3. Change all ALs to R.
	    for (var i$2 = 0, cur = outerType; i$2 < len; ++i$2) {
	      var type$1 = types[i$2]
	      if (type$1 == "1" && cur == "r") { types[i$2] = "n" }
	      else if (isStrong.test(type$1)) { cur = type$1; if (type$1 == "r") { types[i$2] = "R" } }
	    }
	
	    // W4. A single European separator between two European numbers
	    // changes to a European number. A single common separator between
	    // two numbers of the same type changes to that type.
	    for (var i$3 = 1, prev$1 = types[0]; i$3 < len - 1; ++i$3) {
	      var type$2 = types[i$3]
	      if (type$2 == "+" && prev$1 == "1" && types[i$3+1] == "1") { types[i$3] = "1" }
	      else if (type$2 == "," && prev$1 == types[i$3+1] &&
	               (prev$1 == "1" || prev$1 == "n")) { types[i$3] = prev$1 }
	      prev$1 = type$2
	    }
	
	    // W5. A sequence of European terminators adjacent to European
	    // numbers changes to all European numbers.
	    // W6. Otherwise, separators and terminators change to Other
	    // Neutral.
	    for (var i$4 = 0; i$4 < len; ++i$4) {
	      var type$3 = types[i$4]
	      if (type$3 == ",") { types[i$4] = "N" }
	      else if (type$3 == "%") {
	        var end = (void 0)
	        for (end = i$4 + 1; end < len && types[end] == "%"; ++end) {}
	        var replace = (i$4 && types[i$4-1] == "!") || (end < len && types[end] == "1") ? "1" : "N"
	        for (var j = i$4; j < end; ++j) { types[j] = replace }
	        i$4 = end - 1
	      }
	    }
	
	    // W7. Search backwards from each instance of a European number
	    // until the first strong type (R, L, or sor) is found. If an L is
	    // found, then change the type of the European number to L.
	    for (var i$5 = 0, cur$1 = outerType; i$5 < len; ++i$5) {
	      var type$4 = types[i$5]
	      if (cur$1 == "L" && type$4 == "1") { types[i$5] = "L" }
	      else if (isStrong.test(type$4)) { cur$1 = type$4 }
	    }
	
	    // N1. A sequence of neutrals takes the direction of the
	    // surrounding strong text if the text on both sides has the same
	    // direction. European and Arabic numbers act as if they were R in
	    // terms of their influence on neutrals. Start-of-level-run (sor)
	    // and end-of-level-run (eor) are used at level run boundaries.
	    // N2. Any remaining neutrals take the embedding direction.
	    for (var i$6 = 0; i$6 < len; ++i$6) {
	      if (isNeutral.test(types[i$6])) {
	        var end$1 = (void 0)
	        for (end$1 = i$6 + 1; end$1 < len && isNeutral.test(types[end$1]); ++end$1) {}
	        var before = (i$6 ? types[i$6-1] : outerType) == "L"
	        var after = (end$1 < len ? types[end$1] : outerType) == "L"
	        var replace$1 = before || after ? "L" : "R"
	        for (var j$1 = i$6; j$1 < end$1; ++j$1) { types[j$1] = replace$1 }
	        i$6 = end$1 - 1
	      }
	    }
	
	    // Here we depart from the documented algorithm, in order to avoid
	    // building up an actual levels array. Since there are only three
	    // levels (0, 1, 2) in an implementation that doesn't take
	    // explicit embedding into account, we can build up the order on
	    // the fly, without following the level-based algorithm.
	    var order = [], m
	    for (var i$7 = 0; i$7 < len;) {
	      if (countsAsLeft.test(types[i$7])) {
	        var start = i$7
	        for (++i$7; i$7 < len && countsAsLeft.test(types[i$7]); ++i$7) {}
	        order.push(new BidiSpan(0, start, i$7))
	      } else {
	        var pos = i$7, at = order.length
	        for (++i$7; i$7 < len && types[i$7] != "L"; ++i$7) {}
	        for (var j$2 = pos; j$2 < i$7;) {
	          if (countsAsNum.test(types[j$2])) {
	            if (pos < j$2) { order.splice(at, 0, new BidiSpan(1, pos, j$2)) }
	            var nstart = j$2
	            for (++j$2; j$2 < i$7 && countsAsNum.test(types[j$2]); ++j$2) {}
	            order.splice(at, 0, new BidiSpan(2, nstart, j$2))
	            pos = j$2
	          } else { ++j$2 }
	        }
	        if (pos < i$7) { order.splice(at, 0, new BidiSpan(1, pos, i$7)) }
	      }
	    }
	    if (order[0].level == 1 && (m = str.match(/^\s+/))) {
	      order[0].from = m[0].length
	      order.unshift(new BidiSpan(0, 0, m[0].length))
	    }
	    if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
	      lst(order).to -= m[0].length
	      order.push(new BidiSpan(0, len - m[0].length, len))
	    }
	    if (order[0].level == 2)
	      { order.unshift(new BidiSpan(1, order[0].to, order[0].to)) }
	    if (order[0].level != lst(order).level)
	      { order.push(new BidiSpan(order[0].level, len, len)) }
	
	    return order
	  }
	})()
	
	// Get the bidi ordering for the given line (and cache it). Returns
	// false for lines that are fully left-to-right, and an array of
	// BidiSpan objects otherwise.
	function getOrder(line) {
	  var order = line.order
	  if (order == null) { order = line.order = bidiOrdering(line.text) }
	  return order
	}
	
	// EVENT HANDLING
	
	// Lightweight event framework. on/off also work on DOM nodes,
	// registering native DOM handlers.
	
	var noHandlers = []
	
	var on = function(emitter, type, f) {
	  if (emitter.addEventListener) {
	    emitter.addEventListener(type, f, false)
	  } else if (emitter.attachEvent) {
	    emitter.attachEvent("on" + type, f)
	  } else {
	    var map = emitter._handlers || (emitter._handlers = {})
	    map[type] = (map[type] || noHandlers).concat(f)
	  }
	}
	
	function getHandlers(emitter, type) {
	  return emitter._handlers && emitter._handlers[type] || noHandlers
	}
	
	function off(emitter, type, f) {
	  if (emitter.removeEventListener) {
	    emitter.removeEventListener(type, f, false)
	  } else if (emitter.detachEvent) {
	    emitter.detachEvent("on" + type, f)
	  } else {
	    var map = emitter._handlers, arr = map && map[type]
	    if (arr) {
	      var index = indexOf(arr, f)
	      if (index > -1)
	        { map[type] = arr.slice(0, index).concat(arr.slice(index + 1)) }
	    }
	  }
	}
	
	function signal(emitter, type /*, values...*/) {
	  var handlers = getHandlers(emitter, type)
	  if (!handlers.length) { return }
	  var args = Array.prototype.slice.call(arguments, 2)
	  for (var i = 0; i < handlers.length; ++i) { handlers[i].apply(null, args) }
	}
	
	// The DOM events that CodeMirror handles can be overridden by
	// registering a (non-DOM) handler on the editor for the event name,
	// and preventDefault-ing the event in that handler.
	function signalDOMEvent(cm, e, override) {
	  if (typeof e == "string")
	    { e = {type: e, preventDefault: function() { this.defaultPrevented = true }} }
	  signal(cm, override || e.type, cm, e)
	  return e_defaultPrevented(e) || e.codemirrorIgnore
	}
	
	function signalCursorActivity(cm) {
	  var arr = cm._handlers && cm._handlers.cursorActivity
	  if (!arr) { return }
	  var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = [])
	  for (var i = 0; i < arr.length; ++i) { if (indexOf(set, arr[i]) == -1)
	    { set.push(arr[i]) } }
	}
	
	function hasHandler(emitter, type) {
	  return getHandlers(emitter, type).length > 0
	}
	
	// Add on and off methods to a constructor's prototype, to make
	// registering events on such objects more convenient.
	function eventMixin(ctor) {
	  ctor.prototype.on = function(type, f) {on(this, type, f)}
	  ctor.prototype.off = function(type, f) {off(this, type, f)}
	}
	
	// Due to the fact that we still support jurassic IE versions, some
	// compatibility wrappers are needed.
	
	function e_preventDefault(e) {
	  if (e.preventDefault) { e.preventDefault() }
	  else { e.returnValue = false }
	}
	function e_stopPropagation(e) {
	  if (e.stopPropagation) { e.stopPropagation() }
	  else { e.cancelBubble = true }
	}
	function e_defaultPrevented(e) {
	  return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false
	}
	function e_stop(e) {e_preventDefault(e); e_stopPropagation(e)}
	
	function e_target(e) {return e.target || e.srcElement}
	function e_button(e) {
	  var b = e.which
	  if (b == null) {
	    if (e.button & 1) { b = 1 }
	    else if (e.button & 2) { b = 3 }
	    else if (e.button & 4) { b = 2 }
	  }
	  if (mac && e.ctrlKey && b == 1) { b = 3 }
	  return b
	}
	
	// Detect drag-and-drop
	var dragAndDrop = function() {
	  // There is *some* kind of drag-and-drop support in IE6-8, but I
	  // couldn't get it to work yet.
	  if (ie && ie_version < 9) { return false }
	  var div = elt('div')
	  return "draggable" in div || "dragDrop" in div
	}()
	
	var zwspSupported
	function zeroWidthElement(measure) {
	  if (zwspSupported == null) {
	    var test = elt("span", "\u200b")
	    removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]))
	    if (measure.firstChild.offsetHeight != 0)
	      { zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8) }
	  }
	  var node = zwspSupported ? elt("span", "\u200b") :
	    elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px")
	  node.setAttribute("cm-text", "")
	  return node
	}
	
	// Feature-detect IE's crummy client rect reporting for bidi text
	var badBidiRects
	function hasBadBidiRects(measure) {
	  if (badBidiRects != null) { return badBidiRects }
	  var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"))
	  var r0 = range(txt, 0, 1).getBoundingClientRect()
	  var r1 = range(txt, 1, 2).getBoundingClientRect()
	  removeChildren(measure)
	  if (!r0 || r0.left == r0.right) { return false } // Safari returns null in some cases (#2780)
	  return badBidiRects = (r1.right - r0.right < 3)
	}
	
	// See if "".split is the broken IE version, if so, provide an
	// alternative way to split lines.
	var splitLinesAuto = "\n\nb".split(/\n/).length != 3 ? function (string) {
	  var pos = 0, result = [], l = string.length
	  while (pos <= l) {
	    var nl = string.indexOf("\n", pos)
	    if (nl == -1) { nl = string.length }
	    var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl)
	    var rt = line.indexOf("\r")
	    if (rt != -1) {
	      result.push(line.slice(0, rt))
	      pos += rt + 1
	    } else {
	      result.push(line)
	      pos = nl + 1
	    }
	  }
	  return result
	} : function (string) { return string.split(/\r\n?|\n/); }
	
	var hasSelection = window.getSelection ? function (te) {
	  try { return te.selectionStart != te.selectionEnd }
	  catch(e) { return false }
	} : function (te) {
	  var range
	  try {range = te.ownerDocument.selection.createRange()}
	  catch(e) {}
	  if (!range || range.parentElement() != te) { return false }
	  return range.compareEndPoints("StartToEnd", range) != 0
	}
	
	var hasCopyEvent = (function () {
	  var e = elt("div")
	  if ("oncopy" in e) { return true }
	  e.setAttribute("oncopy", "return;")
	  return typeof e.oncopy == "function"
	})()
	
	var badZoomedRects = null
	function hasBadZoomedRects(measure) {
	  if (badZoomedRects != null) { return badZoomedRects }
	  var node = removeChildrenAndAdd(measure, elt("span", "x"))
	  var normal = node.getBoundingClientRect()
	  var fromRange = range(node, 0, 1).getBoundingClientRect()
	  return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1
	}
	
	var modes = {};
	var mimeModes = {};
	// Extra arguments are stored as the mode's dependencies, which is
	// used by (legacy) mechanisms like loadmode.js to automatically
	// load a mode. (Preferred mechanism is the require/define calls.)
	function defineMode(name, mode) {
	  if (arguments.length > 2)
	    { mode.dependencies = Array.prototype.slice.call(arguments, 2) }
	  modes[name] = mode
	}
	
	function defineMIME(mime, spec) {
	  mimeModes[mime] = spec
	}
	
	// Given a MIME type, a {name, ...options} config object, or a name
	// string, return a mode config object.
	function resolveMode(spec) {
	  if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
	    spec = mimeModes[spec]
	  } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
	    var found = mimeModes[spec.name]
	    if (typeof found == "string") { found = {name: found} }
	    spec = createObj(found, spec)
	    spec.name = found.name
	  } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
	    return resolveMode("application/xml")
	  } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(spec)) {
	    return resolveMode("application/json")
	  }
	  if (typeof spec == "string") { return {name: spec} }
	  else { return spec || {name: "null"} }
	}
	
	// Given a mode spec (anything that resolveMode accepts), find and
	// initialize an actual mode object.
	function getMode(options, spec) {
	  spec = resolveMode(spec)
	  var mfactory = modes[spec.name]
	  if (!mfactory) { return getMode(options, "text/plain") }
	  var modeObj = mfactory(options, spec)
	  if (modeExtensions.hasOwnProperty(spec.name)) {
	    var exts = modeExtensions[spec.name]
	    for (var prop in exts) {
	      if (!exts.hasOwnProperty(prop)) { continue }
	      if (modeObj.hasOwnProperty(prop)) { modeObj["_" + prop] = modeObj[prop] }
	      modeObj[prop] = exts[prop]
	    }
	  }
	  modeObj.name = spec.name
	  if (spec.helperType) { modeObj.helperType = spec.helperType }
	  if (spec.modeProps) { for (var prop$1 in spec.modeProps)
	    { modeObj[prop$1] = spec.modeProps[prop$1] } }
	
	  return modeObj
	}
	
	// This can be used to attach properties to mode objects from
	// outside the actual mode definition.
	var modeExtensions = {}
	function extendMode(mode, properties) {
	  var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : (modeExtensions[mode] = {})
	  copyObj(properties, exts)
	}
	
	function copyState(mode, state) {
	  if (state === true) { return state }
	  if (mode.copyState) { return mode.copyState(state) }
	  var nstate = {}
	  for (var n in state) {
	    var val = state[n]
	    if (val instanceof Array) { val = val.concat([]) }
	    nstate[n] = val
	  }
	  return nstate
	}
	
	// Given a mode and a state (for that mode), find the inner mode and
	// state at the position that the state refers to.
	function innerMode(mode, state) {
	  var info
	  while (mode.innerMode) {
	    info = mode.innerMode(state)
	    if (!info || info.mode == mode) { break }
	    state = info.state
	    mode = info.mode
	  }
	  return info || {mode: mode, state: state}
	}
	
	function startState(mode, a1, a2) {
	  return mode.startState ? mode.startState(a1, a2) : true
	}
	
	// STRING STREAM
	
	// Fed to the mode parsers, provides helper functions to make
	// parsers more succinct.
	
	var StringStream = function(string, tabSize) {
	  this.pos = this.start = 0
	  this.string = string
	  this.tabSize = tabSize || 8
	  this.lastColumnPos = this.lastColumnValue = 0
	  this.lineStart = 0
	}
	
	StringStream.prototype = {
	  eol: function() {return this.pos >= this.string.length},
	  sol: function() {return this.pos == this.lineStart},
	  peek: function() {return this.string.charAt(this.pos) || undefined},
	  next: function() {
	    if (this.pos < this.string.length)
	      { return this.string.charAt(this.pos++) }
	  },
	  eat: function(match) {
	    var ch = this.string.charAt(this.pos)
	    var ok
	    if (typeof match == "string") { ok = ch == match }
	    else { ok = ch && (match.test ? match.test(ch) : match(ch)) }
	    if (ok) {++this.pos; return ch}
	  },
	  eatWhile: function(match) {
	    var start = this.pos
	    while (this.eat(match)){}
	    return this.pos > start
	  },
	  eatSpace: function() {
	    var this$1 = this;
	
	    var start = this.pos
	    while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) { ++this$1.pos }
	    return this.pos > start
	  },
	  skipToEnd: function() {this.pos = this.string.length},
	  skipTo: function(ch) {
	    var found = this.string.indexOf(ch, this.pos)
	    if (found > -1) {this.pos = found; return true}
	  },
	  backUp: function(n) {this.pos -= n},
	  column: function() {
	    if (this.lastColumnPos < this.start) {
	      this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue)
	      this.lastColumnPos = this.start
	    }
	    return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
	  },
	  indentation: function() {
	    return countColumn(this.string, null, this.tabSize) -
	      (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
	  },
	  match: function(pattern, consume, caseInsensitive) {
	    if (typeof pattern == "string") {
	      var cased = function (str) { return caseInsensitive ? str.toLowerCase() : str; }
	      var substr = this.string.substr(this.pos, pattern.length)
	      if (cased(substr) == cased(pattern)) {
	        if (consume !== false) { this.pos += pattern.length }
	        return true
	      }
	    } else {
	      var match = this.string.slice(this.pos).match(pattern)
	      if (match && match.index > 0) { return null }
	      if (match && consume !== false) { this.pos += match[0].length }
	      return match
	    }
	  },
	  current: function(){return this.string.slice(this.start, this.pos)},
	  hideFirstChars: function(n, inner) {
	    this.lineStart += n
	    try { return inner() }
	    finally { this.lineStart -= n }
	  }
	}
	
	// Compute a style array (an array starting with a mode generation
	// -- for invalidation -- followed by pairs of end positions and
	// style strings), which is used to highlight the tokens on the
	// line.
	function highlightLine(cm, line, state, forceToEnd) {
	  // A styles array always starts with a number identifying the
	  // mode/overlays that it is based on (for easy invalidation).
	  var st = [cm.state.modeGen], lineClasses = {}
	  // Compute the base array of styles
	  runMode(cm, line.text, cm.doc.mode, state, function (end, style) { return st.push(end, style); },
	    lineClasses, forceToEnd)
	
	  // Run overlays, adjust style array.
	  var loop = function ( o ) {
	    var overlay = cm.state.overlays[o], i = 1, at = 0
	    runMode(cm, line.text, overlay.mode, true, function (end, style) {
	      var start = i
	      // Ensure there's a token end at the current position, and that i points at it
	      while (at < end) {
	        var i_end = st[i]
	        if (i_end > end)
	          { st.splice(i, 1, end, st[i+1], i_end) }
	        i += 2
	        at = Math.min(end, i_end)
	      }
	      if (!style) { return }
	      if (overlay.opaque) {
	        st.splice(start, i - start, end, "overlay " + style)
	        i = start + 2
	      } else {
	        for (; start < i; start += 2) {
	          var cur = st[start+1]
	          st[start+1] = (cur ? cur + " " : "") + "overlay " + style
	        }
	      }
	    }, lineClasses)
	  };
	
	  for (var o = 0; o < cm.state.overlays.length; ++o) loop( o );
	
	  return {styles: st, classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null}
	}
	
	function getLineStyles(cm, line, updateFrontier) {
	  if (!line.styles || line.styles[0] != cm.state.modeGen) {
	    var state = getStateBefore(cm, lineNo(line))
	    var result = highlightLine(cm, line, line.text.length > cm.options.maxHighlightLength ? copyState(cm.doc.mode, state) : state)
	    line.stateAfter = state
	    line.styles = result.styles
	    if (result.classes) { line.styleClasses = result.classes }
	    else if (line.styleClasses) { line.styleClasses = null }
	    if (updateFrontier === cm.doc.frontier) { cm.doc.frontier++ }
	  }
	  return line.styles
	}
	
	function getStateBefore(cm, n, precise) {
	  var doc = cm.doc, display = cm.display
	  if (!doc.mode.startState) { return true }
	  var pos = findStartLine(cm, n, precise), state = pos > doc.first && getLine(doc, pos-1).stateAfter
	  if (!state) { state = startState(doc.mode) }
	  else { state = copyState(doc.mode, state) }
	  doc.iter(pos, n, function (line) {
	    processLine(cm, line.text, state)
	    var save = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo
	    line.stateAfter = save ? copyState(doc.mode, state) : null
	    ++pos
	  })
	  if (precise) { doc.frontier = pos }
	  return state
	}
	
	// Lightweight form of highlight -- proceed over this line and
	// update state, but don't save a style array. Used for lines that
	// aren't currently visible.
	function processLine(cm, text, state, startAt) {
	  var mode = cm.doc.mode
	  var stream = new StringStream(text, cm.options.tabSize)
	  stream.start = stream.pos = startAt || 0
	  if (text == "") { callBlankLine(mode, state) }
	  while (!stream.eol()) {
	    readToken(mode, stream, state)
	    stream.start = stream.pos
	  }
	}
	
	function callBlankLine(mode, state) {
	  if (mode.blankLine) { return mode.blankLine(state) }
	  if (!mode.innerMode) { return }
	  var inner = innerMode(mode, state)
	  if (inner.mode.blankLine) { return inner.mode.blankLine(inner.state) }
	}
	
	function readToken(mode, stream, state, inner) {
	  for (var i = 0; i < 10; i++) {
	    if (inner) { inner[0] = innerMode(mode, state).mode }
	    var style = mode.token(stream, state)
	    if (stream.pos > stream.start) { return style }
	  }
	  throw new Error("Mode " + mode.name + " failed to advance stream.")
	}
	
	// Utility for getTokenAt and getLineTokens
	function takeToken(cm, pos, precise, asArray) {
	  var getObj = function (copy) { return ({
	    start: stream.start, end: stream.pos,
	    string: stream.current(),
	    type: style || null,
	    state: copy ? copyState(doc.mode, state) : state
	  }); }
	
	  var doc = cm.doc, mode = doc.mode, style
	  pos = clipPos(doc, pos)
	  var line = getLine(doc, pos.line), state = getStateBefore(cm, pos.line, precise)
	  var stream = new StringStream(line.text, cm.options.tabSize), tokens
	  if (asArray) { tokens = [] }
	  while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
	    stream.start = stream.pos
	    style = readToken(mode, stream, state)
	    if (asArray) { tokens.push(getObj(true)) }
	  }
	  return asArray ? tokens : getObj()
	}
	
	function extractLineClasses(type, output) {
	  if (type) { for (;;) {
	    var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/)
	    if (!lineClass) { break }
	    type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length)
	    var prop = lineClass[1] ? "bgClass" : "textClass"
	    if (output[prop] == null)
	      { output[prop] = lineClass[2] }
	    else if (!(new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)")).test(output[prop]))
	      { output[prop] += " " + lineClass[2] }
	  } }
	  return type
	}
	
	// Run the given mode's parser over a line, calling f for each token.
	function runMode(cm, text, mode, state, f, lineClasses, forceToEnd) {
	  var flattenSpans = mode.flattenSpans
	  if (flattenSpans == null) { flattenSpans = cm.options.flattenSpans }
	  var curStart = 0, curStyle = null
	  var stream = new StringStream(text, cm.options.tabSize), style
	  var inner = cm.options.addModeClass && [null]
	  if (text == "") { extractLineClasses(callBlankLine(mode, state), lineClasses) }
	  while (!stream.eol()) {
	    if (stream.pos > cm.options.maxHighlightLength) {
	      flattenSpans = false
	      if (forceToEnd) { processLine(cm, text, state, stream.pos) }
	      stream.pos = text.length
	      style = null
	    } else {
	      style = extractLineClasses(readToken(mode, stream, state, inner), lineClasses)
	    }
	    if (inner) {
	      var mName = inner[0].name
	      if (mName) { style = "m-" + (style ? mName + " " + style : mName) }
	    }
	    if (!flattenSpans || curStyle != style) {
	      while (curStart < stream.start) {
	        curStart = Math.min(stream.start, curStart + 5000)
	        f(curStart, curStyle)
	      }
	      curStyle = style
	    }
	    stream.start = stream.pos
	  }
	  while (curStart < stream.pos) {
	    // Webkit seems to refuse to render text nodes longer than 57444
	    // characters, and returns inaccurate measurements in nodes
	    // starting around 5000 chars.
	    var pos = Math.min(stream.pos, curStart + 5000)
	    f(pos, curStyle)
	    curStart = pos
	  }
	}
	
	// Finds the line to start with when starting a parse. Tries to
	// find a line with a stateAfter, so that it can start with a
	// valid state. If that fails, it returns the line with the
	// smallest indentation, which tends to need the least context to
	// parse correctly.
	function findStartLine(cm, n, precise) {
	  var minindent, minline, doc = cm.doc
	  var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100)
	  for (var search = n; search > lim; --search) {
	    if (search <= doc.first) { return doc.first }
	    var line = getLine(doc, search - 1)
	    if (line.stateAfter && (!precise || search <= doc.frontier)) { return search }
	    var indented = countColumn(line.text, null, cm.options.tabSize)
	    if (minline == null || minindent > indented) {
	      minline = search - 1
	      minindent = indented
	    }
	  }
	  return minline
	}
	
	// LINE DATA STRUCTURE
	
	// Line objects. These hold state related to a line, including
	// highlighting info (the styles array).
	function Line(text, markedSpans, estimateHeight) {
	  this.text = text
	  attachMarkedSpans(this, markedSpans)
	  this.height = estimateHeight ? estimateHeight(this) : 1
	}
	eventMixin(Line)
	Line.prototype.lineNo = function() { return lineNo(this) }
	
	// Change the content (text, markers) of a line. Automatically
	// invalidates cached information and tries to re-estimate the
	// line's height.
	function updateLine(line, text, markedSpans, estimateHeight) {
	  line.text = text
	  if (line.stateAfter) { line.stateAfter = null }
	  if (line.styles) { line.styles = null }
	  if (line.order != null) { line.order = null }
	  detachMarkedSpans(line)
	  attachMarkedSpans(line, markedSpans)
	  var estHeight = estimateHeight ? estimateHeight(line) : 1
	  if (estHeight != line.height) { updateLineHeight(line, estHeight) }
	}
	
	// Detach a line from the document tree and its markers.
	function cleanUpLine(line) {
	  line.parent = null
	  detachMarkedSpans(line)
	}
	
	// Convert a style as returned by a mode (either null, or a string
	// containing one or more styles) to a CSS style. This is cached,
	// and also looks for line-wide styles.
	var styleToClassCache = {};
	var styleToClassCacheWithMode = {};
	function interpretTokenStyle(style, options) {
	  if (!style || /^\s*$/.test(style)) { return null }
	  var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache
	  return cache[style] ||
	    (cache[style] = style.replace(/\S+/g, "cm-$&"))
	}
	
	// Render the DOM representation of the text of a line. Also builds
	// up a 'line map', which points at the DOM nodes that represent
	// specific stretches of text, and is used by the measuring code.
	// The returned object contains the DOM node, this map, and
	// information about line-wide styles that were set by the mode.
	function buildLineContent(cm, lineView) {
	  // The padding-right forces the element to have a 'border', which
	  // is needed on Webkit to be able to get line-level bounding
	  // rectangles for it (in measureChar).
	  var content = elt("span", null, null, webkit ? "padding-right: .1px" : null)
	  var builder = {pre: elt("pre", [content], "CodeMirror-line"), content: content,
	                 col: 0, pos: 0, cm: cm,
	                 trailingSpace: false,
	                 splitSpaces: (ie || webkit) && cm.getOption("lineWrapping")}
	  lineView.measure = {}
	
	  // Iterate over the logical lines that make up this visual line.
	  for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
	    var line = i ? lineView.rest[i - 1] : lineView.line, order = (void 0)
	    builder.pos = 0
	    builder.addToken = buildToken
	    // Optionally wire in some hacks into the token-rendering
	    // algorithm, to deal with browser quirks.
	    if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line)))
	      { builder.addToken = buildTokenBadBidi(builder.addToken, order) }
	    builder.map = []
	    var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line)
	    insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate))
	    if (line.styleClasses) {
	      if (line.styleClasses.bgClass)
	        { builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "") }
	      if (line.styleClasses.textClass)
	        { builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "") }
	    }
	
	    // Ensure at least a single node is present, for measuring.
	    if (builder.map.length == 0)
	      { builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure))) }
	
	    // Store the map and a cache object for the current logical line
	    if (i == 0) {
	      lineView.measure.map = builder.map
	      lineView.measure.cache = {}
	    } else {
	      ;(lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map)
	      ;(lineView.measure.caches || (lineView.measure.caches = [])).push({})
	    }
	  }
	
	  // See issue #2901
	  if (webkit) {
	    var last = builder.content.lastChild
	    if (/\bcm-tab\b/.test(last.className) || (last.querySelector && last.querySelector(".cm-tab")))
	      { builder.content.className = "cm-tab-wrap-hack" }
	  }
	
	  signal(cm, "renderLine", cm, lineView.line, builder.pre)
	  if (builder.pre.className)
	    { builder.textClass = joinClasses(builder.pre.className, builder.textClass || "") }
	
	  return builder
	}
	
	function defaultSpecialCharPlaceholder(ch) {
	  var token = elt("span", "\u2022", "cm-invalidchar")
	  token.title = "\\u" + ch.charCodeAt(0).toString(16)
	  token.setAttribute("aria-label", token.title)
	  return token
	}
	
	// Build up the DOM representation for a single token, and add it to
	// the line map. Takes care to render special characters separately.
	function buildToken(builder, text, style, startStyle, endStyle, title, css) {
	  if (!text) { return }
	  var displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text
	  var special = builder.cm.state.specialChars, mustWrap = false
	  var content
	  if (!special.test(text)) {
	    builder.col += text.length
	    content = document.createTextNode(displayText)
	    builder.map.push(builder.pos, builder.pos + text.length, content)
	    if (ie && ie_version < 9) { mustWrap = true }
	    builder.pos += text.length
	  } else {
	    content = document.createDocumentFragment()
	    var pos = 0
	    while (true) {
	      special.lastIndex = pos
	      var m = special.exec(text)
	      var skipped = m ? m.index - pos : text.length - pos
	      if (skipped) {
	        var txt = document.createTextNode(displayText.slice(pos, pos + skipped))
	        if (ie && ie_version < 9) { content.appendChild(elt("span", [txt])) }
	        else { content.appendChild(txt) }
	        builder.map.push(builder.pos, builder.pos + skipped, txt)
	        builder.col += skipped
	        builder.pos += skipped
	      }
	      if (!m) { break }
	      pos += skipped + 1
	      var txt$1 = (void 0)
	      if (m[0] == "\t") {
	        var tabSize = builder.cm.options.tabSize, tabWidth = tabSize - builder.col % tabSize
	        txt$1 = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"))
	        txt$1.setAttribute("role", "presentation")
	        txt$1.setAttribute("cm-text", "\t")
	        builder.col += tabWidth
	      } else if (m[0] == "\r" || m[0] == "\n") {
	        txt$1 = content.appendChild(elt("span", m[0] == "\r" ? "\u240d" : "\u2424", "cm-invalidchar"))
	        txt$1.setAttribute("cm-text", m[0])
	        builder.col += 1
	      } else {
	        txt$1 = builder.cm.options.specialCharPlaceholder(m[0])
	        txt$1.setAttribute("cm-text", m[0])
	        if (ie && ie_version < 9) { content.appendChild(elt("span", [txt$1])) }
	        else { content.appendChild(txt$1) }
	        builder.col += 1
	      }
	      builder.map.push(builder.pos, builder.pos + 1, txt$1)
	      builder.pos++
	    }
	  }
	  builder.trailingSpace = displayText.charCodeAt(text.length - 1) == 32
	  if (style || startStyle || endStyle || mustWrap || css) {
	    var fullStyle = style || ""
	    if (startStyle) { fullStyle += startStyle }
	    if (endStyle) { fullStyle += endStyle }
	    var token = elt("span", [content], fullStyle, css)
	    if (title) { token.title = title }
	    return builder.content.appendChild(token)
	  }
	  builder.content.appendChild(content)
	}
	
	function splitSpaces(text, trailingBefore) {
	  if (text.length > 1 && !/  /.test(text)) { return text }
	  var spaceBefore = trailingBefore, result = ""
	  for (var i = 0; i < text.length; i++) {
	    var ch = text.charAt(i)
	    if (ch == " " && spaceBefore && (i == text.length - 1 || text.charCodeAt(i + 1) == 32))
	      { ch = "\u00a0" }
	    result += ch
	    spaceBefore = ch == " "
	  }
	  return result
	}
	
	// Work around nonsense dimensions being reported for stretches of
	// right-to-left text.
	function buildTokenBadBidi(inner, order) {
	  return function (builder, text, style, startStyle, endStyle, title, css) {
	    style = style ? style + " cm-force-border" : "cm-force-border"
	    var start = builder.pos, end = start + text.length
	    for (;;) {
	      // Find the part that overlaps with the start of this text
	      var part = (void 0)
	      for (var i = 0; i < order.length; i++) {
	        part = order[i]
	        if (part.to > start && part.from <= start) { break }
	      }
	      if (part.to >= end) { return inner(builder, text, style, startStyle, endStyle, title, css) }
	      inner(builder, text.slice(0, part.to - start), style, startStyle, null, title, css)
	      startStyle = null
	      text = text.slice(part.to - start)
	      start = part.to
	    }
	  }
	}
	
	function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
	  var widget = !ignoreWidget && marker.widgetNode
	  if (widget) { builder.map.push(builder.pos, builder.pos + size, widget) }
	  if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
	    if (!widget)
	      { widget = builder.content.appendChild(document.createElement("span")) }
	    widget.setAttribute("cm-marker", marker.id)
	  }
	  if (widget) {
	    builder.cm.display.input.setUneditable(widget)
	    builder.content.appendChild(widget)
	  }
	  builder.pos += size
	  builder.trailingSpace = false
	}
	
	// Outputs a number of spans to make up a line, taking highlighting
	// and marked text into account.
	function insertLineContent(line, builder, styles) {
	  var spans = line.markedSpans, allText = line.text, at = 0
	  if (!spans) {
	    for (var i$1 = 1; i$1 < styles.length; i$1+=2)
	      { builder.addToken(builder, allText.slice(at, at = styles[i$1]), interpretTokenStyle(styles[i$1+1], builder.cm.options)) }
	    return
	  }
	
	  var len = allText.length, pos = 0, i = 1, text = "", style, css
	  var nextChange = 0, spanStyle, spanEndStyle, spanStartStyle, title, collapsed
	  for (;;) {
	    if (nextChange == pos) { // Update current marker set
	      spanStyle = spanEndStyle = spanStartStyle = title = css = ""
	      collapsed = null; nextChange = Infinity
	      var foundBookmarks = [], endStyles = (void 0)
	      for (var j = 0; j < spans.length; ++j) {
	        var sp = spans[j], m = sp.marker
	        if (m.type == "bookmark" && sp.from == pos && m.widgetNode) {
	          foundBookmarks.push(m)
	        } else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
	          if (sp.to != null && sp.to != pos && nextChange > sp.to) {
	            nextChange = sp.to
	            spanEndStyle = ""
	          }
	          if (m.className) { spanStyle += " " + m.className }
	          if (m.css) { css = (css ? css + ";" : "") + m.css }
	          if (m.startStyle && sp.from == pos) { spanStartStyle += " " + m.startStyle }
	          if (m.endStyle && sp.to == nextChange) { (endStyles || (endStyles = [])).push(m.endStyle, sp.to) }
	          if (m.title && !title) { title = m.title }
	          if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0))
	            { collapsed = sp }
	        } else if (sp.from > pos && nextChange > sp.from) {
	          nextChange = sp.from
	        }
	      }
	      if (endStyles) { for (var j$1 = 0; j$1 < endStyles.length; j$1 += 2)
	        { if (endStyles[j$1 + 1] == nextChange) { spanEndStyle += " " + endStyles[j$1] } } }
	
	      if (!collapsed || collapsed.from == pos) { for (var j$2 = 0; j$2 < foundBookmarks.length; ++j$2)
	        { buildCollapsedSpan(builder, 0, foundBookmarks[j$2]) } }
	      if (collapsed && (collapsed.from || 0) == pos) {
	        buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos,
	                           collapsed.marker, collapsed.from == null)
	        if (collapsed.to == null) { return }
	        if (collapsed.to == pos) { collapsed = false }
	      }
	    }
	    if (pos >= len) { break }
	
	    var upto = Math.min(len, nextChange)
	    while (true) {
	      if (text) {
	        var end = pos + text.length
	        if (!collapsed) {
	          var tokenText = end > upto ? text.slice(0, upto - pos) : text
	          builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle,
	                           spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", title, css)
	        }
	        if (end >= upto) {text = text.slice(upto - pos); pos = upto; break}
	        pos = end
	        spanStartStyle = ""
	      }
	      text = allText.slice(at, at = styles[i++])
	      style = interpretTokenStyle(styles[i++], builder.cm.options)
	    }
	  }
	}
	
	
	// These objects are used to represent the visible (currently drawn)
	// part of the document. A LineView may correspond to multiple
	// logical lines, if those are connected by collapsed ranges.
	function LineView(doc, line, lineN) {
	  // The starting line
	  this.line = line
	  // Continuing lines, if any
	  this.rest = visualLineContinued(line)
	  // Number of logical lines in this visual line
	  this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1
	  this.node = this.text = null
	  this.hidden = lineIsHidden(doc, line)
	}
	
	// Create a range of LineView objects for the given lines.
	function buildViewArray(cm, from, to) {
	  var array = [], nextPos
	  for (var pos = from; pos < to; pos = nextPos) {
	    var view = new LineView(cm.doc, getLine(cm.doc, pos), pos)
	    nextPos = pos + view.size
	    array.push(view)
	  }
	  return array
	}
	
	var operationGroup = null
	
	function pushOperation(op) {
	  if (operationGroup) {
	    operationGroup.ops.push(op)
	  } else {
	    op.ownsGroup = operationGroup = {
	      ops: [op],
	      delayedCallbacks: []
	    }
	  }
	}
	
	function fireCallbacksForOps(group) {
	  // Calls delayed callbacks and cursorActivity handlers until no
	  // new ones appear
	  var callbacks = group.delayedCallbacks, i = 0
	  do {
	    for (; i < callbacks.length; i++)
	      { callbacks[i].call(null) }
	    for (var j = 0; j < group.ops.length; j++) {
	      var op = group.ops[j]
	      if (op.cursorActivityHandlers)
	        { while (op.cursorActivityCalled < op.cursorActivityHandlers.length)
	          { op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm) } }
	    }
	  } while (i < callbacks.length)
	}
	
	function finishOperation(op, endCb) {
	  var group = op.ownsGroup
	  if (!group) { return }
	
	  try { fireCallbacksForOps(group) }
	  finally {
	    operationGroup = null
	    endCb(group)
	  }
	}
	
	var orphanDelayedCallbacks = null
	
	// Often, we want to signal events at a point where we are in the
	// middle of some work, but don't want the handler to start calling
	// other methods on the editor, which might be in an inconsistent
	// state or simply not expect any other events to happen.
	// signalLater looks whether there are any handlers, and schedules
	// them to be executed when the last operation ends, or, if no
	// operation is active, when a timeout fires.
	function signalLater(emitter, type /*, values...*/) {
	  var arr = getHandlers(emitter, type)
	  if (!arr.length) { return }
	  var args = Array.prototype.slice.call(arguments, 2), list
	  if (operationGroup) {
	    list = operationGroup.delayedCallbacks
	  } else if (orphanDelayedCallbacks) {
	    list = orphanDelayedCallbacks
	  } else {
	    list = orphanDelayedCallbacks = []
	    setTimeout(fireOrphanDelayed, 0)
	  }
	  var loop = function ( i ) {
	    list.push(function () { return arr[i].apply(null, args); })
	  };
	
	  for (var i = 0; i < arr.length; ++i)
	    loop( i );
	}
	
	function fireOrphanDelayed() {
	  var delayed = orphanDelayedCallbacks
	  orphanDelayedCallbacks = null
	  for (var i = 0; i < delayed.length; ++i) { delayed[i]() }
	}
	
	// When an aspect of a line changes, a string is added to
	// lineView.changes. This updates the relevant part of the line's
	// DOM structure.
	function updateLineForChanges(cm, lineView, lineN, dims) {
	  for (var j = 0; j < lineView.changes.length; j++) {
	    var type = lineView.changes[j]
	    if (type == "text") { updateLineText(cm, lineView) }
	    else if (type == "gutter") { updateLineGutter(cm, lineView, lineN, dims) }
	    else if (type == "class") { updateLineClasses(lineView) }
	    else if (type == "widget") { updateLineWidgets(cm, lineView, dims) }
	  }
	  lineView.changes = null
	}
	
	// Lines with gutter elements, widgets or a background class need to
	// be wrapped, and have the extra elements added to the wrapper div
	function ensureLineWrapped(lineView) {
	  if (lineView.node == lineView.text) {
	    lineView.node = elt("div", null, null, "position: relative")
	    if (lineView.text.parentNode)
	      { lineView.text.parentNode.replaceChild(lineView.node, lineView.text) }
	    lineView.node.appendChild(lineView.text)
	    if (ie && ie_version < 8) { lineView.node.style.zIndex = 2 }
	  }
	  return lineView.node
	}
	
	function updateLineBackground(lineView) {
	  var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass
	  if (cls) { cls += " CodeMirror-linebackground" }
	  if (lineView.background) {
	    if (cls) { lineView.background.className = cls }
	    else { lineView.background.parentNode.removeChild(lineView.background); lineView.background = null }
	  } else if (cls) {
	    var wrap = ensureLineWrapped(lineView)
	    lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild)
	  }
	}
	
	// Wrapper around buildLineContent which will reuse the structure
	// in display.externalMeasured when possible.
	function getLineContent(cm, lineView) {
	  var ext = cm.display.externalMeasured
	  if (ext && ext.line == lineView.line) {
	    cm.display.externalMeasured = null
	    lineView.measure = ext.measure
	    return ext.built
	  }
	  return buildLineContent(cm, lineView)
	}
	
	// Redraw the line's text. Interacts with the background and text
	// classes because the mode may output tokens that influence these
	// classes.
	function updateLineText(cm, lineView) {
	  var cls = lineView.text.className
	  var built = getLineContent(cm, lineView)
	  if (lineView.text == lineView.node) { lineView.node = built.pre }
	  lineView.text.parentNode.replaceChild(built.pre, lineView.text)
	  lineView.text = built.pre
	  if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
	    lineView.bgClass = built.bgClass
	    lineView.textClass = built.textClass
	    updateLineClasses(lineView)
	  } else if (cls) {
	    lineView.text.className = cls
	  }
	}
	
	function updateLineClasses(lineView) {
	  updateLineBackground(lineView)
	  if (lineView.line.wrapClass)
	    { ensureLineWrapped(lineView).className = lineView.line.wrapClass }
	  else if (lineView.node != lineView.text)
	    { lineView.node.className = "" }
	  var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass
	  lineView.text.className = textClass || ""
	}
	
	function updateLineGutter(cm, lineView, lineN, dims) {
	  if (lineView.gutter) {
	    lineView.node.removeChild(lineView.gutter)
	    lineView.gutter = null
	  }
	  if (lineView.gutterBackground) {
	    lineView.node.removeChild(lineView.gutterBackground)
	    lineView.gutterBackground = null
	  }
	  if (lineView.line.gutterClass) {
	    var wrap = ensureLineWrapped(lineView)
	    lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass,
	                                    ("left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px; width: " + (dims.gutterTotalWidth) + "px"))
	    wrap.insertBefore(lineView.gutterBackground, lineView.text)
	  }
	  var markers = lineView.line.gutterMarkers
	  if (cm.options.lineNumbers || markers) {
	    var wrap$1 = ensureLineWrapped(lineView)
	    var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", ("left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px"))
	    cm.display.input.setUneditable(gutterWrap)
	    wrap$1.insertBefore(gutterWrap, lineView.text)
	    if (lineView.line.gutterClass)
	      { gutterWrap.className += " " + lineView.line.gutterClass }
	    if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"]))
	      { lineView.lineNumber = gutterWrap.appendChild(
	        elt("div", lineNumberFor(cm.options, lineN),
	            "CodeMirror-linenumber CodeMirror-gutter-elt",
	            ("left: " + (dims.gutterLeft["CodeMirror-linenumbers"]) + "px; width: " + (cm.display.lineNumInnerWidth) + "px"))) }
	    if (markers) { for (var k = 0; k < cm.options.gutters.length; ++k) {
	      var id = cm.options.gutters[k], found = markers.hasOwnProperty(id) && markers[id]
	      if (found)
	        { gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt",
	                                   ("left: " + (dims.gutterLeft[id]) + "px; width: " + (dims.gutterWidth[id]) + "px"))) }
	    } }
	  }
	}
	
	function updateLineWidgets(cm, lineView, dims) {
	  if (lineView.alignable) { lineView.alignable = null }
	  for (var node = lineView.node.firstChild, next = (void 0); node; node = next) {
	    next = node.nextSibling
	    if (node.className == "CodeMirror-linewidget")
	      { lineView.node.removeChild(node) }
	  }
	  insertLineWidgets(cm, lineView, dims)
	}
	
	// Build a line's DOM representation from scratch
	function buildLineElement(cm, lineView, lineN, dims) {
	  var built = getLineContent(cm, lineView)
	  lineView.text = lineView.node = built.pre
	  if (built.bgClass) { lineView.bgClass = built.bgClass }
	  if (built.textClass) { lineView.textClass = built.textClass }
	
	  updateLineClasses(lineView)
	  updateLineGutter(cm, lineView, lineN, dims)
	  insertLineWidgets(cm, lineView, dims)
	  return lineView.node
	}
	
	// A lineView may contain multiple logical lines (when merged by
	// collapsed spans). The widgets for all of them need to be drawn.
	function insertLineWidgets(cm, lineView, dims) {
	  insertLineWidgetsFor(cm, lineView.line, lineView, dims, true)
	  if (lineView.rest) { for (var i = 0; i < lineView.rest.length; i++)
	    { insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false) } }
	}
	
	function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
	  if (!line.widgets) { return }
	  var wrap = ensureLineWrapped(lineView)
	  for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
	    var widget = ws[i], node = elt("div", [widget.node], "CodeMirror-linewidget")
	    if (!widget.handleMouseEvents) { node.setAttribute("cm-ignore-events", "true") }
	    positionLineWidget(widget, node, lineView, dims)
	    cm.display.input.setUneditable(node)
	    if (allowAbove && widget.above)
	      { wrap.insertBefore(node, lineView.gutter || lineView.text) }
	    else
	      { wrap.appendChild(node) }
	    signalLater(widget, "redraw")
	  }
	}
	
	function positionLineWidget(widget, node, lineView, dims) {
	  if (widget.noHScroll) {
	    ;(lineView.alignable || (lineView.alignable = [])).push(node)
	    var width = dims.wrapperWidth
	    node.style.left = dims.fixedPos + "px"
	    if (!widget.coverGutter) {
	      width -= dims.gutterTotalWidth
	      node.style.paddingLeft = dims.gutterTotalWidth + "px"
	    }
	    node.style.width = width + "px"
	  }
	  if (widget.coverGutter) {
	    node.style.zIndex = 5
	    node.style.position = "relative"
	    if (!widget.noHScroll) { node.style.marginLeft = -dims.gutterTotalWidth + "px" }
	  }
	}
	
	function widgetHeight(widget) {
	  if (widget.height != null) { return widget.height }
	  var cm = widget.doc.cm
	  if (!cm) { return 0 }
	  if (!contains(document.body, widget.node)) {
	    var parentStyle = "position: relative;"
	    if (widget.coverGutter)
	      { parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;" }
	    if (widget.noHScroll)
	      { parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;" }
	    removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle))
	  }
	  return widget.height = widget.node.parentNode.offsetHeight
	}
	
	// Return true when the given mouse event happened in a widget
	function eventInWidget(display, e) {
	  for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
	    if (!n || (n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true") ||
	        (n.parentNode == display.sizer && n != display.mover))
	      { return true }
	  }
	}
	
	// POSITION MEASUREMENT
	
	function paddingTop(display) {return display.lineSpace.offsetTop}
	function paddingVert(display) {return display.mover.offsetHeight - display.lineSpace.offsetHeight}
	function paddingH(display) {
	  if (display.cachedPaddingH) { return display.cachedPaddingH }
	  var e = removeChildrenAndAdd(display.measure, elt("pre", "x"))
	  var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle
	  var data = {left: parseInt(style.paddingLeft), right: parseInt(style.paddingRight)}
	  if (!isNaN(data.left) && !isNaN(data.right)) { display.cachedPaddingH = data }
	  return data
	}
	
	function scrollGap(cm) { return scrollerGap - cm.display.nativeBarWidth }
	function displayWidth(cm) {
	  return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth
	}
	function displayHeight(cm) {
	  return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight
	}
	
	// Ensure the lineView.wrapping.heights array is populated. This is
	// an array of bottom offsets for the lines that make up a drawn
	// line. When lineWrapping is on, there might be more than one
	// height.
	function ensureLineHeights(cm, lineView, rect) {
	  var wrapping = cm.options.lineWrapping
	  var curWidth = wrapping && displayWidth(cm)
	  if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
	    var heights = lineView.measure.heights = []
	    if (wrapping) {
	      lineView.measure.width = curWidth
	      var rects = lineView.text.firstChild.getClientRects()
	      for (var i = 0; i < rects.length - 1; i++) {
	        var cur = rects[i], next = rects[i + 1]
	        if (Math.abs(cur.bottom - next.bottom) > 2)
	          { heights.push((cur.bottom + next.top) / 2 - rect.top) }
	      }
	    }
	    heights.push(rect.bottom - rect.top)
	  }
	}
	
	// Find a line map (mapping character offsets to text nodes) and a
	// measurement cache for the given line number. (A line view might
	// contain multiple lines when collapsed ranges are present.)
	function mapFromLineView(lineView, line, lineN) {
	  if (lineView.line == line)
	    { return {map: lineView.measure.map, cache: lineView.measure.cache} }
	  for (var i = 0; i < lineView.rest.length; i++)
	    { if (lineView.rest[i] == line)
	      { return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i]} } }
	  for (var i$1 = 0; i$1 < lineView.rest.length; i$1++)
	    { if (lineNo(lineView.rest[i$1]) > lineN)
	      { return {map: lineView.measure.maps[i$1], cache: lineView.measure.caches[i$1], before: true} } }
	}
	
	// Render a line into the hidden node display.externalMeasured. Used
	// when measurement is needed for a line that's not in the viewport.
	function updateExternalMeasurement(cm, line) {
	  line = visualLine(line)
	  var lineN = lineNo(line)
	  var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN)
	  view.lineN = lineN
	  var built = view.built = buildLineContent(cm, view)
	  view.text = built.pre
	  removeChildrenAndAdd(cm.display.lineMeasure, built.pre)
	  return view
	}
	
	// Get a {top, bottom, left, right} box (in line-local coordinates)
	// for a given character.
	function measureChar(cm, line, ch, bias) {
	  return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias)
	}
	
	// Find a line view that corresponds to the given line number.
	function findViewForLine(cm, lineN) {
	  if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo)
	    { return cm.display.view[findViewIndex(cm, lineN)] }
	  var ext = cm.display.externalMeasured
	  if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size)
	    { return ext }
	}
	
	// Measurement can be split in two steps, the set-up work that
	// applies to the whole line, and the measurement of the actual
	// character. Functions like coordsChar, that need to do a lot of
	// measurements in a row, can thus ensure that the set-up work is
	// only done once.
	function prepareMeasureForLine(cm, line) {
	  var lineN = lineNo(line)
	  var view = findViewForLine(cm, lineN)
	  if (view && !view.text) {
	    view = null
	  } else if (view && view.changes) {
	    updateLineForChanges(cm, view, lineN, getDimensions(cm))
	    cm.curOp.forceUpdate = true
	  }
	  if (!view)
	    { view = updateExternalMeasurement(cm, line) }
	
	  var info = mapFromLineView(view, line, lineN)
	  return {
	    line: line, view: view, rect: null,
	    map: info.map, cache: info.cache, before: info.before,
	    hasHeights: false
	  }
	}
	
	// Given a prepared measurement object, measures the position of an
	// actual character (or fetches it from the cache).
	function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
	  if (prepared.before) { ch = -1 }
	  var key = ch + (bias || ""), found
	  if (prepared.cache.hasOwnProperty(key)) {
	    found = prepared.cache[key]
	  } else {
	    if (!prepared.rect)
	      { prepared.rect = prepared.view.text.getBoundingClientRect() }
	    if (!prepared.hasHeights) {
	      ensureLineHeights(cm, prepared.view, prepared.rect)
	      prepared.hasHeights = true
	    }
	    found = measureCharInner(cm, prepared, ch, bias)
	    if (!found.bogus) { prepared.cache[key] = found }
	  }
	  return {left: found.left, right: found.right,
	          top: varHeight ? found.rtop : found.top,
	          bottom: varHeight ? found.rbottom : found.bottom}
	}
	
	var nullRect = {left: 0, right: 0, top: 0, bottom: 0}
	
	function nodeAndOffsetInLineMap(map, ch, bias) {
	  var node, start, end, collapse, mStart, mEnd
	  // First, search the line map for the text node corresponding to,
	  // or closest to, the target character.
	  for (var i = 0; i < map.length; i += 3) {
	    mStart = map[i]
	    mEnd = map[i + 1]
	    if (ch < mStart) {
	      start = 0; end = 1
	      collapse = "left"
	    } else if (ch < mEnd) {
	      start = ch - mStart
	      end = start + 1
	    } else if (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) {
	      end = mEnd - mStart
	      start = end - 1
	      if (ch >= mEnd) { collapse = "right" }
	    }
	    if (start != null) {
	      node = map[i + 2]
	      if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right"))
	        { collapse = bias }
	      if (bias == "left" && start == 0)
	        { while (i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft) {
	          node = map[(i -= 3) + 2]
	          collapse = "left"
	        } }
	      if (bias == "right" && start == mEnd - mStart)
	        { while (i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft) {
	          node = map[(i += 3) + 2]
	          collapse = "right"
	        } }
	      break
	    }
	  }
	  return {node: node, start: start, end: end, collapse: collapse, coverStart: mStart, coverEnd: mEnd}
	}
	
	function getUsefulRect(rects, bias) {
	  var rect = nullRect
	  if (bias == "left") { for (var i = 0; i < rects.length; i++) {
	    if ((rect = rects[i]).left != rect.right) { break }
	  } } else { for (var i$1 = rects.length - 1; i$1 >= 0; i$1--) {
	    if ((rect = rects[i$1]).left != rect.right) { break }
	  } }
	  return rect
	}
	
	function measureCharInner(cm, prepared, ch, bias) {
	  var place = nodeAndOffsetInLineMap(prepared.map, ch, bias)
	  var node = place.node, start = place.start, end = place.end, collapse = place.collapse
	
	  var rect
	  if (node.nodeType == 3) { // If it is a text node, use a range to retrieve the coordinates.
	    for (var i$1 = 0; i$1 < 4; i$1++) { // Retry a maximum of 4 times when nonsense rectangles are returned
	      while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) { --start }
	      while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) { ++end }
	      if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart)
	        { rect = node.parentNode.getBoundingClientRect() }
	      else
	        { rect = getUsefulRect(range(node, start, end).getClientRects(), bias) }
	      if (rect.left || rect.right || start == 0) { break }
	      end = start
	      start = start - 1
	      collapse = "right"
	    }
	    if (ie && ie_version < 11) { rect = maybeUpdateRectForZooming(cm.display.measure, rect) }
	  } else { // If it is a widget, simply get the box for the whole widget.
	    if (start > 0) { collapse = bias = "right" }
	    var rects
	    if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1)
	      { rect = rects[bias == "right" ? rects.length - 1 : 0] }
	    else
	      { rect = node.getBoundingClientRect() }
	  }
	  if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
	    var rSpan = node.parentNode.getClientRects()[0]
	    if (rSpan)
	      { rect = {left: rSpan.left, right: rSpan.left + charWidth(cm.display), top: rSpan.top, bottom: rSpan.bottom} }
	    else
	      { rect = nullRect }
	  }
	
	  var rtop = rect.top - prepared.rect.top, rbot = rect.bottom - prepared.rect.top
	  var mid = (rtop + rbot) / 2
	  var heights = prepared.view.measure.heights
	  var i = 0
	  for (; i < heights.length - 1; i++)
	    { if (mid < heights[i]) { break } }
	  var top = i ? heights[i - 1] : 0, bot = heights[i]
	  var result = {left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
	                right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
	                top: top, bottom: bot}
	  if (!rect.left && !rect.right) { result.bogus = true }
	  if (!cm.options.singleCursorHeightPerLine) { result.rtop = rtop; result.rbottom = rbot }
	
	  return result
	}
	
	// Work around problem with bounding client rects on ranges being
	// returned incorrectly when zoomed on IE10 and below.
	function maybeUpdateRectForZooming(measure, rect) {
	  if (!window.screen || screen.logicalXDPI == null ||
	      screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure))
	    { return rect }
	  var scaleX = screen.logicalXDPI / screen.deviceXDPI
	  var scaleY = screen.logicalYDPI / screen.deviceYDPI
	  return {left: rect.left * scaleX, right: rect.right * scaleX,
	          top: rect.top * scaleY, bottom: rect.bottom * scaleY}
	}
	
	function clearLineMeasurementCacheFor(lineView) {
	  if (lineView.measure) {
	    lineView.measure.cache = {}
	    lineView.measure.heights = null
	    if (lineView.rest) { for (var i = 0; i < lineView.rest.length; i++)
	      { lineView.measure.caches[i] = {} } }
	  }
	}
	
	function clearLineMeasurementCache(cm) {
	  cm.display.externalMeasure = null
	  removeChildren(cm.display.lineMeasure)
	  for (var i = 0; i < cm.display.view.length; i++)
	    { clearLineMeasurementCacheFor(cm.display.view[i]) }
	}
	
	function clearCaches(cm) {
	  clearLineMeasurementCache(cm)
	  cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null
	  if (!cm.options.lineWrapping) { cm.display.maxLineChanged = true }
	  cm.display.lineNumChars = null
	}
	
	function pageScrollX() { return window.pageXOffset || (document.documentElement || document.body).scrollLeft }
	function pageScrollY() { return window.pageYOffset || (document.documentElement || document.body).scrollTop }
	
	// Converts a {top, bottom, left, right} box from line-local
	// coordinates into another coordinate system. Context may be one of
	// "line", "div" (display.lineDiv), "local"./null (editor), "window",
	// or "page".
	function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
	  if (!includeWidgets && lineObj.widgets) { for (var i = 0; i < lineObj.widgets.length; ++i) { if (lineObj.widgets[i].above) {
	    var size = widgetHeight(lineObj.widgets[i])
	    rect.top += size; rect.bottom += size
	  } } }
	  if (context == "line") { return rect }
	  if (!context) { context = "local" }
	  var yOff = heightAtLine(lineObj)
	  if (context == "local") { yOff += paddingTop(cm.display) }
	  else { yOff -= cm.display.viewOffset }
	  if (context == "page" || context == "window") {
	    var lOff = cm.display.lineSpace.getBoundingClientRect()
	    yOff += lOff.top + (context == "window" ? 0 : pageScrollY())
	    var xOff = lOff.left + (context == "window" ? 0 : pageScrollX())
	    rect.left += xOff; rect.right += xOff
	  }
	  rect.top += yOff; rect.bottom += yOff
	  return rect
	}
	
	// Coverts a box from "div" coords to another coordinate system.
	// Context may be "window", "page", "div", or "local"./null.
	function fromCoordSystem(cm, coords, context) {
	  if (context == "div") { return coords }
	  var left = coords.left, top = coords.top
	  // First move into "page" coordinate system
	  if (context == "page") {
	    left -= pageScrollX()
	    top -= pageScrollY()
	  } else if (context == "local" || !context) {
	    var localBox = cm.display.sizer.getBoundingClientRect()
	    left += localBox.left
	    top += localBox.top
	  }
	
	  var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect()
	  return {left: left - lineSpaceBox.left, top: top - lineSpaceBox.top}
	}
	
	function charCoords(cm, pos, context, lineObj, bias) {
	  if (!lineObj) { lineObj = getLine(cm.doc, pos.line) }
	  return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context)
	}
	
	// Returns a box for a given cursor position, which may have an
	// 'other' property containing the position of the secondary cursor
	// on a bidi boundary.
	function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
	  lineObj = lineObj || getLine(cm.doc, pos.line)
	  if (!preparedMeasure) { preparedMeasure = prepareMeasureForLine(cm, lineObj) }
	  function get(ch, right) {
	    var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight)
	    if (right) { m.left = m.right; } else { m.right = m.left }
	    return intoCoordSystem(cm, lineObj, m, context)
	  }
	  function getBidi(ch, partPos) {
	    var part = order[partPos], right = part.level % 2
	    if (ch == bidiLeft(part) && partPos && part.level < order[partPos - 1].level) {
	      part = order[--partPos]
	      ch = bidiRight(part) - (part.level % 2 ? 0 : 1)
	      right = true
	    } else if (ch == bidiRight(part) && partPos < order.length - 1 && part.level < order[partPos + 1].level) {
	      part = order[++partPos]
	      ch = bidiLeft(part) - part.level % 2
	      right = false
	    }
	    if (right && ch == part.to && ch > part.from) { return get(ch - 1) }
	    return get(ch, right)
	  }
	  var order = getOrder(lineObj), ch = pos.ch
	  if (!order) { return get(ch) }
	  var partPos = getBidiPartAt(order, ch)
	  var val = getBidi(ch, partPos)
	  if (bidiOther != null) { val.other = getBidi(ch, bidiOther) }
	  return val
	}
	
	// Used to cheaply estimate the coordinates for a position. Used for
	// intermediate scroll updates.
	function estimateCoords(cm, pos) {
	  var left = 0
	  pos = clipPos(cm.doc, pos)
	  if (!cm.options.lineWrapping) { left = charWidth(cm.display) * pos.ch }
	  var lineObj = getLine(cm.doc, pos.line)
	  var top = heightAtLine(lineObj) + paddingTop(cm.display)
	  return {left: left, right: left, top: top, bottom: top + lineObj.height}
	}
	
	// Positions returned by coordsChar contain some extra information.
	// xRel is the relative x position of the input coordinates compared
	// to the found position (so xRel > 0 means the coordinates are to
	// the right of the character position, for example). When outside
	// is true, that means the coordinates lie outside the line's
	// vertical range.
	function PosWithInfo(line, ch, outside, xRel) {
	  var pos = Pos(line, ch)
	  pos.xRel = xRel
	  if (outside) { pos.outside = true }
	  return pos
	}
	
	// Compute the character position closest to the given coordinates.
	// Input must be lineSpace-local ("div" coordinate system).
	function coordsChar(cm, x, y) {
	  var doc = cm.doc
	  y += cm.display.viewOffset
	  if (y < 0) { return PosWithInfo(doc.first, 0, true, -1) }
	  var lineN = lineAtHeight(doc, y), last = doc.first + doc.size - 1
	  if (lineN > last)
	    { return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, true, 1) }
	  if (x < 0) { x = 0 }
	
	  var lineObj = getLine(doc, lineN)
	  for (;;) {
	    var found = coordsCharInner(cm, lineObj, lineN, x, y)
	    var merged = collapsedSpanAtEnd(lineObj)
	    var mergedPos = merged && merged.find(0, true)
	    if (merged && (found.ch > mergedPos.from.ch || found.ch == mergedPos.from.ch && found.xRel > 0))
	      { lineN = lineNo(lineObj = mergedPos.to.line) }
	    else
	      { return found }
	  }
	}
	
	function coordsCharInner(cm, lineObj, lineNo, x, y) {
	  var innerOff = y - heightAtLine(lineObj)
	  var wrongLine = false, adjust = 2 * cm.display.wrapper.clientWidth
	  var preparedMeasure = prepareMeasureForLine(cm, lineObj)
	
	  function getX(ch) {
	    var sp = cursorCoords(cm, Pos(lineNo, ch), "line", lineObj, preparedMeasure)
	    wrongLine = true
	    if (innerOff > sp.bottom) { return sp.left - adjust }
	    else if (innerOff < sp.top) { return sp.left + adjust }
	    else { wrongLine = false }
	    return sp.left
	  }
	
	  var bidi = getOrder(lineObj), dist = lineObj.text.length
	  var from = lineLeft(lineObj), to = lineRight(lineObj)
	  var fromX = getX(from), fromOutside = wrongLine, toX = getX(to), toOutside = wrongLine
	
	  if (x > toX) { return PosWithInfo(lineNo, to, toOutside, 1) }
	  // Do a binary search between these bounds.
	  for (;;) {
	    if (bidi ? to == from || to == moveVisually(lineObj, from, 1) : to - from <= 1) {
	      var ch = x < fromX || x - fromX <= toX - x ? from : to
	      var outside = ch == from ? fromOutside : toOutside
	      var xDiff = x - (ch == from ? fromX : toX)
	      // This is a kludge to handle the case where the coordinates
	      // are after a line-wrapped line. We should replace it with a
	      // more general handling of cursor positions around line
	      // breaks. (Issue #4078)
	      if (toOutside && !bidi && !/\s/.test(lineObj.text.charAt(ch)) && xDiff > 0 &&
	          ch < lineObj.text.length && preparedMeasure.view.measure.heights.length > 1) {
	        var charSize = measureCharPrepared(cm, preparedMeasure, ch, "right")
	        if (innerOff <= charSize.bottom && innerOff >= charSize.top && Math.abs(x - charSize.right) < xDiff) {
	          outside = false
	          ch++
	          xDiff = x - charSize.right
	        }
	      }
	      while (isExtendingChar(lineObj.text.charAt(ch))) { ++ch }
	      var pos = PosWithInfo(lineNo, ch, outside, xDiff < -1 ? -1 : xDiff > 1 ? 1 : 0)
	      return pos
	    }
	    var step = Math.ceil(dist / 2), middle = from + step
	    if (bidi) {
	      middle = from
	      for (var i = 0; i < step; ++i) { middle = moveVisually(lineObj, middle, 1) }
	    }
	    var middleX = getX(middle)
	    if (middleX > x) {to = middle; toX = middleX; if (toOutside = wrongLine) { toX += 1000; } dist = step}
	    else {from = middle; fromX = middleX; fromOutside = wrongLine; dist -= step}
	  }
	}
	
	var measureText
	// Compute the default text height.
	function textHeight(display) {
	  if (display.cachedTextHeight != null) { return display.cachedTextHeight }
	  if (measureText == null) {
	    measureText = elt("pre")
	    // Measure a bunch of lines, for browsers that compute
	    // fractional heights.
	    for (var i = 0; i < 49; ++i) {
	      measureText.appendChild(document.createTextNode("x"))
	      measureText.appendChild(elt("br"))
	    }
	    measureText.appendChild(document.createTextNode("x"))
	  }
	  removeChildrenAndAdd(display.measure, measureText)
	  var height = measureText.offsetHeight / 50
	  if (height > 3) { display.cachedTextHeight = height }
	  removeChildren(display.measure)
	  return height || 1
	}
	
	// Compute the default character width.
	function charWidth(display) {
	  if (display.cachedCharWidth != null) { return display.cachedCharWidth }
	  var anchor = elt("span", "xxxxxxxxxx")
	  var pre = elt("pre", [anchor])
	  removeChildrenAndAdd(display.measure, pre)
	  var rect = anchor.getBoundingClientRect(), width = (rect.right - rect.left) / 10
	  if (width > 2) { display.cachedCharWidth = width }
	  return width || 10
	}
	
	// Do a bulk-read of the DOM positions and sizes needed to draw the
	// view, so that we don't interleave reading and writing to the DOM.
	function getDimensions(cm) {
	  var d = cm.display, left = {}, width = {}
	  var gutterLeft = d.gutters.clientLeft
	  for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
	    left[cm.options.gutters[i]] = n.offsetLeft + n.clientLeft + gutterLeft
	    width[cm.options.gutters[i]] = n.clientWidth
	  }
	  return {fixedPos: compensateForHScroll(d),
	          gutterTotalWidth: d.gutters.offsetWidth,
	          gutterLeft: left,
	          gutterWidth: width,
	          wrapperWidth: d.wrapper.clientWidth}
	}
	
	// Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
	// but using getBoundingClientRect to get a sub-pixel-accurate
	// result.
	function compensateForHScroll(display) {
	  return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left
	}
	
	// Returns a function that estimates the height of a line, to use as
	// first approximation until the line becomes visible (and is thus
	// properly measurable).
	function estimateHeight(cm) {
	  var th = textHeight(cm.display), wrapping = cm.options.lineWrapping
	  var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3)
	  return function (line) {
	    if (lineIsHidden(cm.doc, line)) { return 0 }
	
	    var widgetsHeight = 0
	    if (line.widgets) { for (var i = 0; i < line.widgets.length; i++) {
	      if (line.widgets[i].height) { widgetsHeight += line.widgets[i].height }
	    } }
	
	    if (wrapping)
	      { return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th }
	    else
	      { return widgetsHeight + th }
	  }
	}
	
	function estimateLineHeights(cm) {
	  var doc = cm.doc, est = estimateHeight(cm)
	  doc.iter(function (line) {
	    var estHeight = est(line)
	    if (estHeight != line.height) { updateLineHeight(line, estHeight) }
	  })
	}
	
	// Given a mouse event, find the corresponding position. If liberal
	// is false, it checks whether a gutter or scrollbar was clicked,
	// and returns null if it was. forRect is used by rectangular
	// selections, and tries to estimate a character position even for
	// coordinates beyond the right of the text.
	function posFromMouse(cm, e, liberal, forRect) {
	  var display = cm.display
	  if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") { return null }
	
	  var x, y, space = display.lineSpace.getBoundingClientRect()
	  // Fails unpredictably on IE[67] when mouse is dragged around quickly.
	  try { x = e.clientX - space.left; y = e.clientY - space.top }
	  catch (e) { return null }
	  var coords = coordsChar(cm, x, y), line
	  if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
	    var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length
	    coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff))
	  }
	  return coords
	}
	
	// Find the view element corresponding to a given line. Return null
	// when the line isn't visible.
	function findViewIndex(cm, n) {
	  if (n >= cm.display.viewTo) { return null }
	  n -= cm.display.viewFrom
	  if (n < 0) { return null }
	  var view = cm.display.view
	  for (var i = 0; i < view.length; i++) {
	    n -= view[i].size
	    if (n < 0) { return i }
	  }
	}
	
	function updateSelection(cm) {
	  cm.display.input.showSelection(cm.display.input.prepareSelection())
	}
	
	function prepareSelection(cm, primary) {
	  var doc = cm.doc, result = {}
	  var curFragment = result.cursors = document.createDocumentFragment()
	  var selFragment = result.selection = document.createDocumentFragment()
	
	  for (var i = 0; i < doc.sel.ranges.length; i++) {
	    if (primary === false && i == doc.sel.primIndex) { continue }
	    var range = doc.sel.ranges[i]
	    if (range.from().line >= cm.display.viewTo || range.to().line < cm.display.viewFrom) { continue }
	    var collapsed = range.empty()
	    if (collapsed || cm.options.showCursorWhenSelecting)
	      { drawSelectionCursor(cm, range.head, curFragment) }
	    if (!collapsed)
	      { drawSelectionRange(cm, range, selFragment) }
	  }
	  return result
	}
	
	// Draws a cursor for the given range
	function drawSelectionCursor(cm, head, output) {
	  var pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine)
	
	  var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"))
	  cursor.style.left = pos.left + "px"
	  cursor.style.top = pos.top + "px"
	  cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px"
	
	  if (pos.other) {
	    // Secondary cursor, shown when on a 'jump' in bi-directional text
	    var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"))
	    otherCursor.style.display = ""
	    otherCursor.style.left = pos.other.left + "px"
	    otherCursor.style.top = pos.other.top + "px"
	    otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px"
	  }
	}
	
	// Draws the given range as a highlighted selection
	function drawSelectionRange(cm, range, output) {
	  var display = cm.display, doc = cm.doc
	  var fragment = document.createDocumentFragment()
	  var padding = paddingH(cm.display), leftSide = padding.left
	  var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right
	
	  function add(left, top, width, bottom) {
	    if (top < 0) { top = 0 }
	    top = Math.round(top)
	    bottom = Math.round(bottom)
	    fragment.appendChild(elt("div", null, "CodeMirror-selected", ("position: absolute; left: " + left + "px;\n                             top: " + top + "px; width: " + (width == null ? rightSide - left : width) + "px;\n                             height: " + (bottom - top) + "px")))
	  }
	
	  function drawForLine(line, fromArg, toArg) {
	    var lineObj = getLine(doc, line)
	    var lineLen = lineObj.text.length
	    var start, end
	    function coords(ch, bias) {
	      return charCoords(cm, Pos(line, ch), "div", lineObj, bias)
	    }
	
	    iterateBidiSections(getOrder(lineObj), fromArg || 0, toArg == null ? lineLen : toArg, function (from, to, dir) {
	      var leftPos = coords(from, "left"), rightPos, left, right
	      if (from == to) {
	        rightPos = leftPos
	        left = right = leftPos.left
	      } else {
	        rightPos = coords(to - 1, "right")
	        if (dir == "rtl") { var tmp = leftPos; leftPos = rightPos; rightPos = tmp }
	        left = leftPos.left
	        right = rightPos.right
	      }
	      if (fromArg == null && from == 0) { left = leftSide }
	      if (rightPos.top - leftPos.top > 3) { // Different lines, draw top part
	        add(left, leftPos.top, null, leftPos.bottom)
	        left = leftSide
	        if (leftPos.bottom < rightPos.top) { add(left, leftPos.bottom, null, rightPos.top) }
	      }
	      if (toArg == null && to == lineLen) { right = rightSide }
	      if (!start || leftPos.top < start.top || leftPos.top == start.top && leftPos.left < start.left)
	        { start = leftPos }
	      if (!end || rightPos.bottom > end.bottom || rightPos.bottom == end.bottom && rightPos.right > end.right)
	        { end = rightPos }
	      if (left < leftSide + 1) { left = leftSide }
	      add(left, rightPos.top, right - left, rightPos.bottom)
	    })
	    return {start: start, end: end}
	  }
	
	  var sFrom = range.from(), sTo = range.to()
	  if (sFrom.line == sTo.line) {
	    drawForLine(sFrom.line, sFrom.ch, sTo.ch)
	  } else {
	    var fromLine = getLine(doc, sFrom.line), toLine = getLine(doc, sTo.line)
	    var singleVLine = visualLine(fromLine) == visualLine(toLine)
	    var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end
	    var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start
	    if (singleVLine) {
	      if (leftEnd.top < rightStart.top - 2) {
	        add(leftEnd.right, leftEnd.top, null, leftEnd.bottom)
	        add(leftSide, rightStart.top, rightStart.left, rightStart.bottom)
	      } else {
	        add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom)
	      }
	    }
	    if (leftEnd.bottom < rightStart.top)
	      { add(leftSide, leftEnd.bottom, null, rightStart.top) }
	  }
	
	  output.appendChild(fragment)
	}
	
	// Cursor-blinking
	function restartBlink(cm) {
	  if (!cm.state.focused) { return }
	  var display = cm.display
	  clearInterval(display.blinker)
	  var on = true
	  display.cursorDiv.style.visibility = ""
	  if (cm.options.cursorBlinkRate > 0)
	    { display.blinker = setInterval(function () { return display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden"; },
	      cm.options.cursorBlinkRate) }
	  else if (cm.options.cursorBlinkRate < 0)
	    { display.cursorDiv.style.visibility = "hidden" }
	}
	
	function ensureFocus(cm) {
	  if (!cm.state.focused) { cm.display.input.focus(); onFocus(cm) }
	}
	
	function delayBlurEvent(cm) {
	  cm.state.delayingBlurEvent = true
	  setTimeout(function () { if (cm.state.delayingBlurEvent) {
	    cm.state.delayingBlurEvent = false
	    onBlur(cm)
	  } }, 100)
	}
	
	function onFocus(cm, e) {
	  if (cm.state.delayingBlurEvent) { cm.state.delayingBlurEvent = false }
	
	  if (cm.options.readOnly == "nocursor") { return }
	  if (!cm.state.focused) {
	    signal(cm, "focus", cm, e)
	    cm.state.focused = true
	    addClass(cm.display.wrapper, "CodeMirror-focused")
	    // This test prevents this from firing when a context
	    // menu is closed (since the input reset would kill the
	    // select-all detection hack)
	    if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
	      cm.display.input.reset()
	      if (webkit) { setTimeout(function () { return cm.display.input.reset(true); }, 20) } // Issue #1730
	    }
	    cm.display.input.receivedFocus()
	  }
	  restartBlink(cm)
	}
	function onBlur(cm, e) {
	  if (cm.state.delayingBlurEvent) { return }
	
	  if (cm.state.focused) {
	    signal(cm, "blur", cm, e)
	    cm.state.focused = false
	    rmClass(cm.display.wrapper, "CodeMirror-focused")
	  }
	  clearInterval(cm.display.blinker)
	  setTimeout(function () { if (!cm.state.focused) { cm.display.shift = false } }, 150)
	}
	
	// Re-align line numbers and gutter marks to compensate for
	// horizontal scrolling.
	function alignHorizontally(cm) {
	  var display = cm.display, view = display.view
	  if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) { return }
	  var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft
	  var gutterW = display.gutters.offsetWidth, left = comp + "px"
	  for (var i = 0; i < view.length; i++) { if (!view[i].hidden) {
	    if (cm.options.fixedGutter) {
	      if (view[i].gutter)
	        { view[i].gutter.style.left = left }
	      if (view[i].gutterBackground)
	        { view[i].gutterBackground.style.left = left }
	    }
	    var align = view[i].alignable
	    if (align) { for (var j = 0; j < align.length; j++)
	      { align[j].style.left = left } }
	  } }
	  if (cm.options.fixedGutter)
	    { display.gutters.style.left = (comp + gutterW) + "px" }
	}
	
	// Used to ensure that the line number gutter is still the right
	// size for the current document size. Returns true when an update
	// is needed.
	function maybeUpdateLineNumberWidth(cm) {
	  if (!cm.options.lineNumbers) { return false }
	  var doc = cm.doc, last = lineNumberFor(cm.options, doc.first + doc.size - 1), display = cm.display
	  if (last.length != display.lineNumChars) {
	    var test = display.measure.appendChild(elt("div", [elt("div", last)],
	                                               "CodeMirror-linenumber CodeMirror-gutter-elt"))
	    var innerW = test.firstChild.offsetWidth, padding = test.offsetWidth - innerW
	    display.lineGutter.style.width = ""
	    display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1
	    display.lineNumWidth = display.lineNumInnerWidth + padding
	    display.lineNumChars = display.lineNumInnerWidth ? last.length : -1
	    display.lineGutter.style.width = display.lineNumWidth + "px"
	    updateGutterSpace(cm)
	    return true
	  }
	  return false
	}
	
	// Read the actual heights of the rendered lines, and update their
	// stored heights to match.
	function updateHeightsInViewport(cm) {
	  var display = cm.display
	  var prevBottom = display.lineDiv.offsetTop
	  for (var i = 0; i < display.view.length; i++) {
	    var cur = display.view[i], height = (void 0)
	    if (cur.hidden) { continue }
	    if (ie && ie_version < 8) {
	      var bot = cur.node.offsetTop + cur.node.offsetHeight
	      height = bot - prevBottom
	      prevBottom = bot
	    } else {
	      var box = cur.node.getBoundingClientRect()
	      height = box.bottom - box.top
	    }
	    var diff = cur.line.height - height
	    if (height < 2) { height = textHeight(display) }
	    if (diff > .001 || diff < -.001) {
	      updateLineHeight(cur.line, height)
	      updateWidgetHeight(cur.line)
	      if (cur.rest) { for (var j = 0; j < cur.rest.length; j++)
	        { updateWidgetHeight(cur.rest[j]) } }
	    }
	  }
	}
	
	// Read and store the height of line widgets associated with the
	// given line.
	function updateWidgetHeight(line) {
	  if (line.widgets) { for (var i = 0; i < line.widgets.length; ++i)
	    { line.widgets[i].height = line.widgets[i].node.parentNode.offsetHeight } }
	}
	
	// Compute the lines that are visible in a given viewport (defaults
	// the the current scroll position). viewport may contain top,
	// height, and ensure (see op.scrollToPos) properties.
	function visibleLines(display, doc, viewport) {
	  var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop
	  top = Math.floor(top - paddingTop(display))
	  var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight
	
	  var from = lineAtHeight(doc, top), to = lineAtHeight(doc, bottom)
	  // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
	  // forces those lines into the viewport (if possible).
	  if (viewport && viewport.ensure) {
	    var ensureFrom = viewport.ensure.from.line, ensureTo = viewport.ensure.to.line
	    if (ensureFrom < from) {
	      from = ensureFrom
	      to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight)
	    } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
	      from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight)
	      to = ensureTo
	    }
	  }
	  return {from: from, to: Math.max(to, from + 1)}
	}
	
	// Sync the scrollable area and scrollbars, ensure the viewport
	// covers the visible area.
	function setScrollTop(cm, val) {
	  if (Math.abs(cm.doc.scrollTop - val) < 2) { return }
	  cm.doc.scrollTop = val
	  if (!gecko) { updateDisplaySimple(cm, {top: val}) }
	  if (cm.display.scroller.scrollTop != val) { cm.display.scroller.scrollTop = val }
	  cm.display.scrollbars.setScrollTop(val)
	  if (gecko) { updateDisplaySimple(cm) }
	  startWorker(cm, 100)
	}
	// Sync scroller and scrollbar, ensure the gutter elements are
	// aligned.
	function setScrollLeft(cm, val, isScroller) {
	  if (isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) { return }
	  val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth)
	  cm.doc.scrollLeft = val
	  alignHorizontally(cm)
	  if (cm.display.scroller.scrollLeft != val) { cm.display.scroller.scrollLeft = val }
	  cm.display.scrollbars.setScrollLeft(val)
	}
	
	// Since the delta values reported on mouse wheel events are
	// unstandardized between browsers and even browser versions, and
	// generally horribly unpredictable, this code starts by measuring
	// the scroll effect that the first few mouse wheel events have,
	// and, from that, detects the way it can convert deltas to pixel
	// offsets afterwards.
	//
	// The reason we want to know the amount a wheel event will scroll
	// is that it gives us a chance to update the display before the
	// actual scrolling happens, reducing flickering.
	
	var wheelSamples = 0;
	var wheelPixelsPerUnit = null;
	// Fill in a browser-detected starting value on browsers where we
	// know one. These don't have to be accurate -- the result of them
	// being wrong would just be a slight flicker on the first wheel
	// scroll (if it is large enough).
	if (ie) { wheelPixelsPerUnit = -.53 }
	else if (gecko) { wheelPixelsPerUnit = 15 }
	else if (chrome) { wheelPixelsPerUnit = -.7 }
	else if (safari) { wheelPixelsPerUnit = -1/3 }
	
	function wheelEventDelta(e) {
	  var dx = e.wheelDeltaX, dy = e.wheelDeltaY
	  if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) { dx = e.detail }
	  if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) { dy = e.detail }
	  else if (dy == null) { dy = e.wheelDelta }
	  return {x: dx, y: dy}
	}
	function wheelEventPixels(e) {
	  var delta = wheelEventDelta(e)
	  delta.x *= wheelPixelsPerUnit
	  delta.y *= wheelPixelsPerUnit
	  return delta
	}
	
	function onScrollWheel(cm, e) {
	  var delta = wheelEventDelta(e), dx = delta.x, dy = delta.y
	
	  var display = cm.display, scroll = display.scroller
	  // Quit if there's nothing to scroll here
	  var canScrollX = scroll.scrollWidth > scroll.clientWidth
	  var canScrollY = scroll.scrollHeight > scroll.clientHeight
	  if (!(dx && canScrollX || dy && canScrollY)) { return }
	
	  // Webkit browsers on OS X abort momentum scrolls when the target
	  // of the scroll event is removed from the scrollable element.
	  // This hack (see related code in patchDisplay) makes sure the
	  // element is kept around.
	  if (dy && mac && webkit) {
	    outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
	      for (var i = 0; i < view.length; i++) {
	        if (view[i].node == cur) {
	          cm.display.currentWheelTarget = cur
	          break outer
	        }
	      }
	    }
	  }
	
	  // On some browsers, horizontal scrolling will cause redraws to
	  // happen before the gutter has been realigned, causing it to
	  // wriggle around in a most unseemly way. When we have an
	  // estimated pixels/delta value, we just handle horizontal
	  // scrolling entirely here. It'll be slightly off from native, but
	  // better than glitching out.
	  if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
	    if (dy && canScrollY)
	      { setScrollTop(cm, Math.max(0, Math.min(scroll.scrollTop + dy * wheelPixelsPerUnit, scroll.scrollHeight - scroll.clientHeight))) }
	    setScrollLeft(cm, Math.max(0, Math.min(scroll.scrollLeft + dx * wheelPixelsPerUnit, scroll.scrollWidth - scroll.clientWidth)))
	    // Only prevent default scrolling if vertical scrolling is
	    // actually possible. Otherwise, it causes vertical scroll
	    // jitter on OSX trackpads when deltaX is small and deltaY
	    // is large (issue #3579)
	    if (!dy || (dy && canScrollY))
	      { e_preventDefault(e) }
	    display.wheelStartX = null // Abort measurement, if in progress
	    return
	  }
	
	  // 'Project' the visible viewport to cover the area that is being
	  // scrolled into view (if we know enough to estimate it).
	  if (dy && wheelPixelsPerUnit != null) {
	    var pixels = dy * wheelPixelsPerUnit
	    var top = cm.doc.scrollTop, bot = top + display.wrapper.clientHeight
	    if (pixels < 0) { top = Math.max(0, top + pixels - 50) }
	    else { bot = Math.min(cm.doc.height, bot + pixels + 50) }
	    updateDisplaySimple(cm, {top: top, bottom: bot})
	  }
	
	  if (wheelSamples < 20) {
	    if (display.wheelStartX == null) {
	      display.wheelStartX = scroll.scrollLeft; display.wheelStartY = scroll.scrollTop
	      display.wheelDX = dx; display.wheelDY = dy
	      setTimeout(function () {
	        if (display.wheelStartX == null) { return }
	        var movedX = scroll.scrollLeft - display.wheelStartX
	        var movedY = scroll.scrollTop - display.wheelStartY
	        var sample = (movedY && display.wheelDY && movedY / display.wheelDY) ||
	          (movedX && display.wheelDX && movedX / display.wheelDX)
	        display.wheelStartX = display.wheelStartY = null
	        if (!sample) { return }
	        wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1)
	        ++wheelSamples
	      }, 200)
	    } else {
	      display.wheelDX += dx; display.wheelDY += dy
	    }
	  }
	}
	
	// SCROLLBARS
	
	// Prepare DOM reads needed to update the scrollbars. Done in one
	// shot to minimize update/measure roundtrips.
	function measureForScrollbars(cm) {
	  var d = cm.display, gutterW = d.gutters.offsetWidth
	  var docH = Math.round(cm.doc.height + paddingVert(cm.display))
	  return {
	    clientHeight: d.scroller.clientHeight,
	    viewHeight: d.wrapper.clientHeight,
	    scrollWidth: d.scroller.scrollWidth, clientWidth: d.scroller.clientWidth,
	    viewWidth: d.wrapper.clientWidth,
	    barLeft: cm.options.fixedGutter ? gutterW : 0,
	    docHeight: docH,
	    scrollHeight: docH + scrollGap(cm) + d.barHeight,
	    nativeBarWidth: d.nativeBarWidth,
	    gutterWidth: gutterW
	  }
	}
	
	var NativeScrollbars = function(place, scroll, cm) {
	  this.cm = cm
	  var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar")
	  var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar")
	  place(vert); place(horiz)
	
	  on(vert, "scroll", function () {
	    if (vert.clientHeight) { scroll(vert.scrollTop, "vertical") }
	  })
	  on(horiz, "scroll", function () {
	    if (horiz.clientWidth) { scroll(horiz.scrollLeft, "horizontal") }
	  })
	
	  this.checkedZeroWidth = false
	  // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
	  if (ie && ie_version < 8) { this.horiz.style.minHeight = this.vert.style.minWidth = "18px" }
	};
	
	NativeScrollbars.prototype.update = function (measure) {
	  var needsH = measure.scrollWidth > measure.clientWidth + 1
	  var needsV = measure.scrollHeight > measure.clientHeight + 1
	  var sWidth = measure.nativeBarWidth
	
	  if (needsV) {
	    this.vert.style.display = "block"
	    this.vert.style.bottom = needsH ? sWidth + "px" : "0"
	    var totalHeight = measure.viewHeight - (needsH ? sWidth : 0)
	    // A bug in IE8 can cause this value to be negative, so guard it.
	    this.vert.firstChild.style.height =
	      Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px"
	  } else {
	    this.vert.style.display = ""
	    this.vert.firstChild.style.height = "0"
	  }
	
	  if (needsH) {
	    this.horiz.style.display = "block"
	    this.horiz.style.right = needsV ? sWidth + "px" : "0"
	    this.horiz.style.left = measure.barLeft + "px"
	    var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0)
	    this.horiz.firstChild.style.width =
	      (measure.scrollWidth - measure.clientWidth + totalWidth) + "px"
	  } else {
	    this.horiz.style.display = ""
	    this.horiz.firstChild.style.width = "0"
	  }
	
	  if (!this.checkedZeroWidth && measure.clientHeight > 0) {
	    if (sWidth == 0) { this.zeroWidthHack() }
	    this.checkedZeroWidth = true
	  }
	
	  return {right: needsV ? sWidth : 0, bottom: needsH ? sWidth : 0}
	};
	
	NativeScrollbars.prototype.setScrollLeft = function (pos) {
	  if (this.horiz.scrollLeft != pos) { this.horiz.scrollLeft = pos }
	  if (this.disableHoriz) { this.enableZeroWidthBar(this.horiz, this.disableHoriz) }
	};
	
	NativeScrollbars.prototype.setScrollTop = function (pos) {
	  if (this.vert.scrollTop != pos) { this.vert.scrollTop = pos }
	  if (this.disableVert) { this.enableZeroWidthBar(this.vert, this.disableVert) }
	};
	
	NativeScrollbars.prototype.zeroWidthHack = function () {
	  var w = mac && !mac_geMountainLion ? "12px" : "18px"
	  this.horiz.style.height = this.vert.style.width = w
	  this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none"
	  this.disableHoriz = new Delayed
	  this.disableVert = new Delayed
	};
	
	NativeScrollbars.prototype.enableZeroWidthBar = function (bar, delay) {
	  bar.style.pointerEvents = "auto"
	  function maybeDisable() {
	    // To find out whether the scrollbar is still visible, we
	    // check whether the element under the pixel in the bottom
	    // left corner of the scrollbar box is the scrollbar box
	    // itself (when the bar is still visible) or its filler child
	    // (when the bar is hidden). If it is still visible, we keep
	    // it enabled, if it's hidden, we disable pointer events.
	    var box = bar.getBoundingClientRect()
	    var elt = document.elementFromPoint(box.left + 1, box.bottom - 1)
	    if (elt != bar) { bar.style.pointerEvents = "none" }
	    else { delay.set(1000, maybeDisable) }
	  }
	  delay.set(1000, maybeDisable)
	};
	
	NativeScrollbars.prototype.clear = function () {
	  var parent = this.horiz.parentNode
	  parent.removeChild(this.horiz)
	  parent.removeChild(this.vert)
	};
	
	var NullScrollbars = function () {};
	
	NullScrollbars.prototype.update = function () { return {bottom: 0, right: 0} };
	NullScrollbars.prototype.setScrollLeft = function () {};
	NullScrollbars.prototype.setScrollTop = function () {};
	NullScrollbars.prototype.clear = function () {};
	
	function updateScrollbars(cm, measure) {
	  if (!measure) { measure = measureForScrollbars(cm) }
	  var startWidth = cm.display.barWidth, startHeight = cm.display.barHeight
	  updateScrollbarsInner(cm, measure)
	  for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
	    if (startWidth != cm.display.barWidth && cm.options.lineWrapping)
	      { updateHeightsInViewport(cm) }
	    updateScrollbarsInner(cm, measureForScrollbars(cm))
	    startWidth = cm.display.barWidth; startHeight = cm.display.barHeight
	  }
	}
	
	// Re-synchronize the fake scrollbars with the actual size of the
	// content.
	function updateScrollbarsInner(cm, measure) {
	  var d = cm.display
	  var sizes = d.scrollbars.update(measure)
	
	  d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px"
	  d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px"
	  d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent"
	
	  if (sizes.right && sizes.bottom) {
	    d.scrollbarFiller.style.display = "block"
	    d.scrollbarFiller.style.height = sizes.bottom + "px"
	    d.scrollbarFiller.style.width = sizes.right + "px"
	  } else { d.scrollbarFiller.style.display = "" }
	  if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
	    d.gutterFiller.style.display = "block"
	    d.gutterFiller.style.height = sizes.bottom + "px"
	    d.gutterFiller.style.width = measure.gutterWidth + "px"
	  } else { d.gutterFiller.style.display = "" }
	}
	
	var scrollbarModel = {"native": NativeScrollbars, "null": NullScrollbars}
	
	function initScrollbars(cm) {
	  if (cm.display.scrollbars) {
	    cm.display.scrollbars.clear()
	    if (cm.display.scrollbars.addClass)
	      { rmClass(cm.display.wrapper, cm.display.scrollbars.addClass) }
	  }
	
	  cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](function (node) {
	    cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller)
	    // Prevent clicks in the scrollbars from killing focus
	    on(node, "mousedown", function () {
	      if (cm.state.focused) { setTimeout(function () { return cm.display.input.focus(); }, 0) }
	    })
	    node.setAttribute("cm-not-content", "true")
	  }, function (pos, axis) {
	    if (axis == "horizontal") { setScrollLeft(cm, pos) }
	    else { setScrollTop(cm, pos) }
	  }, cm)
	  if (cm.display.scrollbars.addClass)
	    { addClass(cm.display.wrapper, cm.display.scrollbars.addClass) }
	}
	
	// SCROLLING THINGS INTO VIEW
	
	// If an editor sits on the top or bottom of the window, partially
	// scrolled out of view, this ensures that the cursor is visible.
	function maybeScrollWindow(cm, coords) {
	  if (signalDOMEvent(cm, "scrollCursorIntoView")) { return }
	
	  var display = cm.display, box = display.sizer.getBoundingClientRect(), doScroll = null
	  if (coords.top + box.top < 0) { doScroll = true }
	  else if (coords.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) { doScroll = false }
	  if (doScroll != null && !phantom) {
	    var scrollNode = elt("div", "\u200b", null, ("position: absolute;\n                         top: " + (coords.top - display.viewOffset - paddingTop(cm.display)) + "px;\n                         height: " + (coords.bottom - coords.top + scrollGap(cm) + display.barHeight) + "px;\n                         left: " + (coords.left) + "px; width: 2px;"))
	    cm.display.lineSpace.appendChild(scrollNode)
	    scrollNode.scrollIntoView(doScroll)
	    cm.display.lineSpace.removeChild(scrollNode)
	  }
	}
	
	// Scroll a given position into view (immediately), verifying that
	// it actually became visible (as line heights are accurately
	// measured, the position of something may 'drift' during drawing).
	function scrollPosIntoView(cm, pos, end, margin) {
	  if (margin == null) { margin = 0 }
	  var coords
	  for (var limit = 0; limit < 5; limit++) {
	    var changed = false
	    coords = cursorCoords(cm, pos)
	    var endCoords = !end || end == pos ? coords : cursorCoords(cm, end)
	    var scrollPos = calculateScrollPos(cm, Math.min(coords.left, endCoords.left),
	                                       Math.min(coords.top, endCoords.top) - margin,
	                                       Math.max(coords.left, endCoords.left),
	                                       Math.max(coords.bottom, endCoords.bottom) + margin)
	    var startTop = cm.doc.scrollTop, startLeft = cm.doc.scrollLeft
	    if (scrollPos.scrollTop != null) {
	      setScrollTop(cm, scrollPos.scrollTop)
	      if (Math.abs(cm.doc.scrollTop - startTop) > 1) { changed = true }
	    }
	    if (scrollPos.scrollLeft != null) {
	      setScrollLeft(cm, scrollPos.scrollLeft)
	      if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) { changed = true }
	    }
	    if (!changed) { break }
	  }
	  return coords
	}
	
	// Scroll a given set of coordinates into view (immediately).
	function scrollIntoView(cm, x1, y1, x2, y2) {
	  var scrollPos = calculateScrollPos(cm, x1, y1, x2, y2)
	  if (scrollPos.scrollTop != null) { setScrollTop(cm, scrollPos.scrollTop) }
	  if (scrollPos.scrollLeft != null) { setScrollLeft(cm, scrollPos.scrollLeft) }
	}
	
	// Calculate a new scroll position needed to scroll the given
	// rectangle into view. Returns an object with scrollTop and
	// scrollLeft properties. When these are undefined, the
	// vertical/horizontal position does not need to be adjusted.
	function calculateScrollPos(cm, x1, y1, x2, y2) {
	  var display = cm.display, snapMargin = textHeight(cm.display)
	  if (y1 < 0) { y1 = 0 }
	  var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop
	  var screen = displayHeight(cm), result = {}
	  if (y2 - y1 > screen) { y2 = y1 + screen }
	  var docBottom = cm.doc.height + paddingVert(display)
	  var atTop = y1 < snapMargin, atBottom = y2 > docBottom - snapMargin
	  if (y1 < screentop) {
	    result.scrollTop = atTop ? 0 : y1
	  } else if (y2 > screentop + screen) {
	    var newTop = Math.min(y1, (atBottom ? docBottom : y2) - screen)
	    if (newTop != screentop) { result.scrollTop = newTop }
	  }
	
	  var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft
	  var screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0)
	  var tooWide = x2 - x1 > screenw
	  if (tooWide) { x2 = x1 + screenw }
	  if (x1 < 10)
	    { result.scrollLeft = 0 }
	  else if (x1 < screenleft)
	    { result.scrollLeft = Math.max(0, x1 - (tooWide ? 0 : 10)) }
	  else if (x2 > screenw + screenleft - 3)
	    { result.scrollLeft = x2 + (tooWide ? 0 : 10) - screenw }
	  return result
	}
	
	// Store a relative adjustment to the scroll position in the current
	// operation (to be applied when the operation finishes).
	function addToScrollPos(cm, left, top) {
	  if (left != null || top != null) { resolveScrollToPos(cm) }
	  if (left != null)
	    { cm.curOp.scrollLeft = (cm.curOp.scrollLeft == null ? cm.doc.scrollLeft : cm.curOp.scrollLeft) + left }
	  if (top != null)
	    { cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top }
	}
	
	// Make sure that at the end of the operation the current cursor is
	// shown.
	function ensureCursorVisible(cm) {
	  resolveScrollToPos(cm)
	  var cur = cm.getCursor(), from = cur, to = cur
	  if (!cm.options.lineWrapping) {
	    from = cur.ch ? Pos(cur.line, cur.ch - 1) : cur
	    to = Pos(cur.line, cur.ch + 1)
	  }
	  cm.curOp.scrollToPos = {from: from, to: to, margin: cm.options.cursorScrollMargin, isCursor: true}
	}
	
	// When an operation has its scrollToPos property set, and another
	// scroll action is applied before the end of the operation, this
	// 'simulates' scrolling that position into view in a cheap way, so
	// that the effect of intermediate scroll commands is not ignored.
	function resolveScrollToPos(cm) {
	  var range = cm.curOp.scrollToPos
	  if (range) {
	    cm.curOp.scrollToPos = null
	    var from = estimateCoords(cm, range.from), to = estimateCoords(cm, range.to)
	    var sPos = calculateScrollPos(cm, Math.min(from.left, to.left),
	                                  Math.min(from.top, to.top) - range.margin,
	                                  Math.max(from.right, to.right),
	                                  Math.max(from.bottom, to.bottom) + range.margin)
	    cm.scrollTo(sPos.scrollLeft, sPos.scrollTop)
	  }
	}
	
	// Operations are used to wrap a series of changes to the editor
	// state in such a way that each change won't have to update the
	// cursor and display (which would be awkward, slow, and
	// error-prone). Instead, display updates are batched and then all
	// combined and executed at once.
	
	var nextOpId = 0
	// Start a new operation.
	function startOperation(cm) {
	  cm.curOp = {
	    cm: cm,
	    viewChanged: false,      // Flag that indicates that lines might need to be redrawn
	    startHeight: cm.doc.height, // Used to detect need to update scrollbar
	    forceUpdate: false,      // Used to force a redraw
	    updateInput: null,       // Whether to reset the input textarea
	    typing: false,           // Whether this reset should be careful to leave existing text (for compositing)
	    changeObjs: null,        // Accumulated changes, for firing change events
	    cursorActivityHandlers: null, // Set of handlers to fire cursorActivity on
	    cursorActivityCalled: 0, // Tracks which cursorActivity handlers have been called already
	    selectionChanged: false, // Whether the selection needs to be redrawn
	    updateMaxLine: false,    // Set when the widest line needs to be determined anew
	    scrollLeft: null, scrollTop: null, // Intermediate scroll position, not pushed to DOM yet
	    scrollToPos: null,       // Used to scroll to a specific position
	    focus: false,
	    id: ++nextOpId           // Unique ID
	  }
	  pushOperation(cm.curOp)
	}
	
	// Finish an operation, updating the display and signalling delayed events
	function endOperation(cm) {
	  var op = cm.curOp
	  finishOperation(op, function (group) {
	    for (var i = 0; i < group.ops.length; i++)
	      { group.ops[i].cm.curOp = null }
	    endOperations(group)
	  })
	}
	
	// The DOM updates done when an operation finishes are batched so
	// that the minimum number of relayouts are required.
	function endOperations(group) {
	  var ops = group.ops
	  for (var i = 0; i < ops.length; i++) // Read DOM
	    { endOperation_R1(ops[i]) }
	  for (var i$1 = 0; i$1 < ops.length; i$1++) // Write DOM (maybe)
	    { endOperation_W1(ops[i$1]) }
	  for (var i$2 = 0; i$2 < ops.length; i$2++) // Read DOM
	    { endOperation_R2(ops[i$2]) }
	  for (var i$3 = 0; i$3 < ops.length; i$3++) // Write DOM (maybe)
	    { endOperation_W2(ops[i$3]) }
	  for (var i$4 = 0; i$4 < ops.length; i$4++) // Read DOM
	    { endOperation_finish(ops[i$4]) }
	}
	
	function endOperation_R1(op) {
	  var cm = op.cm, display = cm.display
	  maybeClipScrollbars(cm)
	  if (op.updateMaxLine) { findMaxLine(cm) }
	
	  op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null ||
	    op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom ||
	                       op.scrollToPos.to.line >= display.viewTo) ||
	    display.maxLineChanged && cm.options.lineWrapping
	  op.update = op.mustUpdate &&
	    new DisplayUpdate(cm, op.mustUpdate && {top: op.scrollTop, ensure: op.scrollToPos}, op.forceUpdate)
	}
	
	function endOperation_W1(op) {
	  op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update)
	}
	
	function endOperation_R2(op) {
	  var cm = op.cm, display = cm.display
	  if (op.updatedDisplay) { updateHeightsInViewport(cm) }
	
	  op.barMeasure = measureForScrollbars(cm)
	
	  // If the max line changed since it was last measured, measure it,
	  // and ensure the document's width matches it.
	  // updateDisplay_W2 will use these properties to do the actual resizing
	  if (display.maxLineChanged && !cm.options.lineWrapping) {
	    op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3
	    cm.display.sizerWidth = op.adjustWidthTo
	    op.barMeasure.scrollWidth =
	      Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth)
	    op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm))
	  }
	
	  if (op.updatedDisplay || op.selectionChanged)
	    { op.preparedSelection = display.input.prepareSelection(op.focus) }
	}
	
	function endOperation_W2(op) {
	  var cm = op.cm
	
	  if (op.adjustWidthTo != null) {
	    cm.display.sizer.style.minWidth = op.adjustWidthTo + "px"
	    if (op.maxScrollLeft < cm.doc.scrollLeft)
	      { setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true) }
	    cm.display.maxLineChanged = false
	  }
	
	  var takeFocus = op.focus && op.focus == activeElt() && (!document.hasFocus || document.hasFocus())
	  if (op.preparedSelection)
	    { cm.display.input.showSelection(op.preparedSelection, takeFocus) }
	  if (op.updatedDisplay || op.startHeight != cm.doc.height)
	    { updateScrollbars(cm, op.barMeasure) }
	  if (op.updatedDisplay)
	    { setDocumentHeight(cm, op.barMeasure) }
	
	  if (op.selectionChanged) { restartBlink(cm) }
	
	  if (cm.state.focused && op.updateInput)
	    { cm.display.input.reset(op.typing) }
	  if (takeFocus) { ensureFocus(op.cm) }
	}
	
	function endOperation_finish(op) {
	  var cm = op.cm, display = cm.display, doc = cm.doc
	
	  if (op.updatedDisplay) { postUpdateDisplay(cm, op.update) }
	
	  // Abort mouse wheel delta measurement, when scrolling explicitly
	  if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos))
	    { display.wheelStartX = display.wheelStartY = null }
	
	  // Propagate the scroll position to the actual DOM scroller
	  if (op.scrollTop != null && (display.scroller.scrollTop != op.scrollTop || op.forceScroll)) {
	    doc.scrollTop = Math.max(0, Math.min(display.scroller.scrollHeight - display.scroller.clientHeight, op.scrollTop))
	    display.scrollbars.setScrollTop(doc.scrollTop)
	    display.scroller.scrollTop = doc.scrollTop
	  }
	  if (op.scrollLeft != null && (display.scroller.scrollLeft != op.scrollLeft || op.forceScroll)) {
	    doc.scrollLeft = Math.max(0, Math.min(display.scroller.scrollWidth - display.scroller.clientWidth, op.scrollLeft))
	    display.scrollbars.setScrollLeft(doc.scrollLeft)
	    display.scroller.scrollLeft = doc.scrollLeft
	    alignHorizontally(cm)
	  }
	  // If we need to scroll a specific position into view, do so.
	  if (op.scrollToPos) {
	    var coords = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from),
	                                   clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin)
	    if (op.scrollToPos.isCursor && cm.state.focused) { maybeScrollWindow(cm, coords) }
	  }
	
	  // Fire events for markers that are hidden/unidden by editing or
	  // undoing
	  var hidden = op.maybeHiddenMarkers, unhidden = op.maybeUnhiddenMarkers
	  if (hidden) { for (var i = 0; i < hidden.length; ++i)
	    { if (!hidden[i].lines.length) { signal(hidden[i], "hide") } } }
	  if (unhidden) { for (var i$1 = 0; i$1 < unhidden.length; ++i$1)
	    { if (unhidden[i$1].lines.length) { signal(unhidden[i$1], "unhide") } } }
	
	  if (display.wrapper.offsetHeight)
	    { doc.scrollTop = cm.display.scroller.scrollTop }
	
	  // Fire change events, and delayed event handlers
	  if (op.changeObjs)
	    { signal(cm, "changes", cm, op.changeObjs) }
	  if (op.update)
	    { op.update.finish() }
	}
	
	// Run the given function in an operation
	function runInOp(cm, f) {
	  if (cm.curOp) { return f() }
	  startOperation(cm)
	  try { return f() }
	  finally { endOperation(cm) }
	}
	// Wraps a function in an operation. Returns the wrapped function.
	function operation(cm, f) {
	  return function() {
	    if (cm.curOp) { return f.apply(cm, arguments) }
	    startOperation(cm)
	    try { return f.apply(cm, arguments) }
	    finally { endOperation(cm) }
	  }
	}
	// Used to add methods to editor and doc instances, wrapping them in
	// operations.
	function methodOp(f) {
	  return function() {
	    if (this.curOp) { return f.apply(this, arguments) }
	    startOperation(this)
	    try { return f.apply(this, arguments) }
	    finally { endOperation(this) }
	  }
	}
	function docMethodOp(f) {
	  return function() {
	    var cm = this.cm
	    if (!cm || cm.curOp) { return f.apply(this, arguments) }
	    startOperation(cm)
	    try { return f.apply(this, arguments) }
	    finally { endOperation(cm) }
	  }
	}
	
	// Updates the display.view data structure for a given change to the
	// document. From and to are in pre-change coordinates. Lendiff is
	// the amount of lines added or subtracted by the change. This is
	// used for changes that span multiple lines, or change the way
	// lines are divided into visual lines. regLineChange (below)
	// registers single-line changes.
	function regChange(cm, from, to, lendiff) {
	  if (from == null) { from = cm.doc.first }
	  if (to == null) { to = cm.doc.first + cm.doc.size }
	  if (!lendiff) { lendiff = 0 }
	
	  var display = cm.display
	  if (lendiff && to < display.viewTo &&
	      (display.updateLineNumbers == null || display.updateLineNumbers > from))
	    { display.updateLineNumbers = from }
	
	  cm.curOp.viewChanged = true
	
	  if (from >= display.viewTo) { // Change after
	    if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo)
	      { resetView(cm) }
	  } else if (to <= display.viewFrom) { // Change before
	    if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
	      resetView(cm)
	    } else {
	      display.viewFrom += lendiff
	      display.viewTo += lendiff
	    }
	  } else if (from <= display.viewFrom && to >= display.viewTo) { // Full overlap
	    resetView(cm)
	  } else if (from <= display.viewFrom) { // Top overlap
	    var cut = viewCuttingPoint(cm, to, to + lendiff, 1)
	    if (cut) {
	      display.view = display.view.slice(cut.index)
	      display.viewFrom = cut.lineN
	      display.viewTo += lendiff
	    } else {
	      resetView(cm)
	    }
	  } else if (to >= display.viewTo) { // Bottom overlap
	    var cut$1 = viewCuttingPoint(cm, from, from, -1)
	    if (cut$1) {
	      display.view = display.view.slice(0, cut$1.index)
	      display.viewTo = cut$1.lineN
	    } else {
	      resetView(cm)
	    }
	  } else { // Gap in the middle
	    var cutTop = viewCuttingPoint(cm, from, from, -1)
	    var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1)
	    if (cutTop && cutBot) {
	      display.view = display.view.slice(0, cutTop.index)
	        .concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN))
	        .concat(display.view.slice(cutBot.index))
	      display.viewTo += lendiff
	    } else {
	      resetView(cm)
	    }
	  }
	
	  var ext = display.externalMeasured
	  if (ext) {
	    if (to < ext.lineN)
	      { ext.lineN += lendiff }
	    else if (from < ext.lineN + ext.size)
	      { display.externalMeasured = null }
	  }
	}
	
	// Register a change to a single line. Type must be one of "text",
	// "gutter", "class", "widget"
	function regLineChange(cm, line, type) {
	  cm.curOp.viewChanged = true
	  var display = cm.display, ext = cm.display.externalMeasured
	  if (ext && line >= ext.lineN && line < ext.lineN + ext.size)
	    { display.externalMeasured = null }
	
	  if (line < display.viewFrom || line >= display.viewTo) { return }
	  var lineView = display.view[findViewIndex(cm, line)]
	  if (lineView.node == null) { return }
	  var arr = lineView.changes || (lineView.changes = [])
	  if (indexOf(arr, type) == -1) { arr.push(type) }
	}
	
	// Clear the view.
	function resetView(cm) {
	  cm.display.viewFrom = cm.display.viewTo = cm.doc.first
	  cm.display.view = []
	  cm.display.viewOffset = 0
	}
	
	function viewCuttingPoint(cm, oldN, newN, dir) {
	  var index = findViewIndex(cm, oldN), diff, view = cm.display.view
	  if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size)
	    { return {index: index, lineN: newN} }
	  var n = cm.display.viewFrom
	  for (var i = 0; i < index; i++)
	    { n += view[i].size }
	  if (n != oldN) {
	    if (dir > 0) {
	      if (index == view.length - 1) { return null }
	      diff = (n + view[index].size) - oldN
	      index++
	    } else {
	      diff = n - oldN
	    }
	    oldN += diff; newN += diff
	  }
	  while (visualLineNo(cm.doc, newN) != newN) {
	    if (index == (dir < 0 ? 0 : view.length - 1)) { return null }
	    newN += dir * view[index - (dir < 0 ? 1 : 0)].size
	    index += dir
	  }
	  return {index: index, lineN: newN}
	}
	
	// Force the view to cover a given range, adding empty view element
	// or clipping off existing ones as needed.
	function adjustView(cm, from, to) {
	  var display = cm.display, view = display.view
	  if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
	    display.view = buildViewArray(cm, from, to)
	    display.viewFrom = from
	  } else {
	    if (display.viewFrom > from)
	      { display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view) }
	    else if (display.viewFrom < from)
	      { display.view = display.view.slice(findViewIndex(cm, from)) }
	    display.viewFrom = from
	    if (display.viewTo < to)
	      { display.view = display.view.concat(buildViewArray(cm, display.viewTo, to)) }
	    else if (display.viewTo > to)
	      { display.view = display.view.slice(0, findViewIndex(cm, to)) }
	  }
	  display.viewTo = to
	}
	
	// Count the number of lines in the view whose DOM representation is
	// out of date (or nonexistent).
	function countDirtyView(cm) {
	  var view = cm.display.view, dirty = 0
	  for (var i = 0; i < view.length; i++) {
	    var lineView = view[i]
	    if (!lineView.hidden && (!lineView.node || lineView.changes)) { ++dirty }
	  }
	  return dirty
	}
	
	// HIGHLIGHT WORKER
	
	function startWorker(cm, time) {
	  if (cm.doc.mode.startState && cm.doc.frontier < cm.display.viewTo)
	    { cm.state.highlight.set(time, bind(highlightWorker, cm)) }
	}
	
	function highlightWorker(cm) {
	  var doc = cm.doc
	  if (doc.frontier < doc.first) { doc.frontier = doc.first }
	  if (doc.frontier >= cm.display.viewTo) { return }
	  var end = +new Date + cm.options.workTime
	  var state = copyState(doc.mode, getStateBefore(cm, doc.frontier))
	  var changedLines = []
	
	  doc.iter(doc.frontier, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function (line) {
	    if (doc.frontier >= cm.display.viewFrom) { // Visible
	      var oldStyles = line.styles, tooLong = line.text.length > cm.options.maxHighlightLength
	      var highlighted = highlightLine(cm, line, tooLong ? copyState(doc.mode, state) : state, true)
	      line.styles = highlighted.styles
	      var oldCls = line.styleClasses, newCls = highlighted.classes
	      if (newCls) { line.styleClasses = newCls }
	      else if (oldCls) { line.styleClasses = null }
	      var ischange = !oldStyles || oldStyles.length != line.styles.length ||
	        oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass)
	      for (var i = 0; !ischange && i < oldStyles.length; ++i) { ischange = oldStyles[i] != line.styles[i] }
	      if (ischange) { changedLines.push(doc.frontier) }
	      line.stateAfter = tooLong ? state : copyState(doc.mode, state)
	    } else {
	      if (line.text.length <= cm.options.maxHighlightLength)
	        { processLine(cm, line.text, state) }
	      line.stateAfter = doc.frontier % 5 == 0 ? copyState(doc.mode, state) : null
	    }
	    ++doc.frontier
	    if (+new Date > end) {
	      startWorker(cm, cm.options.workDelay)
	      return true
	    }
	  })
	  if (changedLines.length) { runInOp(cm, function () {
	    for (var i = 0; i < changedLines.length; i++)
	      { regLineChange(cm, changedLines[i], "text") }
	  }) }
	}
	
	// DISPLAY DRAWING
	
	var DisplayUpdate = function(cm, viewport, force) {
	  var display = cm.display
	
	  this.viewport = viewport
	  // Store some values that we'll need later (but don't want to force a relayout for)
	  this.visible = visibleLines(display, cm.doc, viewport)
	  this.editorIsHidden = !display.wrapper.offsetWidth
	  this.wrapperHeight = display.wrapper.clientHeight
	  this.wrapperWidth = display.wrapper.clientWidth
	  this.oldDisplayWidth = displayWidth(cm)
	  this.force = force
	  this.dims = getDimensions(cm)
	  this.events = []
	};
	
	DisplayUpdate.prototype.signal = function (emitter, type) {
	  if (hasHandler(emitter, type))
	    { this.events.push(arguments) }
	};
	DisplayUpdate.prototype.finish = function () {
	    var this$1 = this;
	
	  for (var i = 0; i < this.events.length; i++)
	    { signal.apply(null, this$1.events[i]) }
	};
	
	function maybeClipScrollbars(cm) {
	  var display = cm.display
	  if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
	    display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth
	    display.heightForcer.style.height = scrollGap(cm) + "px"
	    display.sizer.style.marginBottom = -display.nativeBarWidth + "px"
	    display.sizer.style.borderRightWidth = scrollGap(cm) + "px"
	    display.scrollbarsClipped = true
	  }
	}
	
	// Does the actual updating of the line display. Bails out
	// (returning false) when there is nothing to be done and forced is
	// false.
	function updateDisplayIfNeeded(cm, update) {
	  var display = cm.display, doc = cm.doc
	
	  if (update.editorIsHidden) {
	    resetView(cm)
	    return false
	  }
	
	  // Bail out if the visible area is already rendered and nothing changed.
	  if (!update.force &&
	      update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo &&
	      (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) &&
	      display.renderedView == display.view && countDirtyView(cm) == 0)
	    { return false }
	
	  if (maybeUpdateLineNumberWidth(cm)) {
	    resetView(cm)
	    update.dims = getDimensions(cm)
	  }
	
	  // Compute a suitable new viewport (from & to)
	  var end = doc.first + doc.size
	  var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first)
	  var to = Math.min(end, update.visible.to + cm.options.viewportMargin)
	  if (display.viewFrom < from && from - display.viewFrom < 20) { from = Math.max(doc.first, display.viewFrom) }
	  if (display.viewTo > to && display.viewTo - to < 20) { to = Math.min(end, display.viewTo) }
	  if (sawCollapsedSpans) {
	    from = visualLineNo(cm.doc, from)
	    to = visualLineEndNo(cm.doc, to)
	  }
	
	  var different = from != display.viewFrom || to != display.viewTo ||
	    display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth
	  adjustView(cm, from, to)
	
	  display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom))
	  // Position the mover div to align with the current scroll position
	  cm.display.mover.style.top = display.viewOffset + "px"
	
	  var toUpdate = countDirtyView(cm)
	  if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view &&
	      (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo))
	    { return false }
	
	  // For big changes, we hide the enclosing element during the
	  // update, since that speeds up the operations on most browsers.
	  var focused = activeElt()
	  if (toUpdate > 4) { display.lineDiv.style.display = "none" }
	  patchDisplay(cm, display.updateLineNumbers, update.dims)
	  if (toUpdate > 4) { display.lineDiv.style.display = "" }
	  display.renderedView = display.view
	  // There might have been a widget with a focused element that got
	  // hidden or updated, if so re-focus it.
	  if (focused && activeElt() != focused && focused.offsetHeight) { focused.focus() }
	
	  // Prevent selection and cursors from interfering with the scroll
	  // width and height.
	  removeChildren(display.cursorDiv)
	  removeChildren(display.selectionDiv)
	  display.gutters.style.height = display.sizer.style.minHeight = 0
	
	  if (different) {
	    display.lastWrapHeight = update.wrapperHeight
	    display.lastWrapWidth = update.wrapperWidth
	    startWorker(cm, 400)
	  }
	
	  display.updateLineNumbers = null
	
	  return true
	}
	
	function postUpdateDisplay(cm, update) {
	  var viewport = update.viewport
	
	  for (var first = true;; first = false) {
	    if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
	      // Clip forced viewport to actual scrollable area.
	      if (viewport && viewport.top != null)
	        { viewport = {top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)} }
	      // Updated line heights might result in the drawn area not
	      // actually covering the viewport. Keep looping until it does.
	      update.visible = visibleLines(cm.display, cm.doc, viewport)
	      if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo)
	        { break }
	    }
	    if (!updateDisplayIfNeeded(cm, update)) { break }
	    updateHeightsInViewport(cm)
	    var barMeasure = measureForScrollbars(cm)
	    updateSelection(cm)
	    updateScrollbars(cm, barMeasure)
	    setDocumentHeight(cm, barMeasure)
	  }
	
	  update.signal(cm, "update", cm)
	  if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
	    update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo)
	    cm.display.reportedViewFrom = cm.display.viewFrom; cm.display.reportedViewTo = cm.display.viewTo
	  }
	}
	
	function updateDisplaySimple(cm, viewport) {
	  var update = new DisplayUpdate(cm, viewport)
	  if (updateDisplayIfNeeded(cm, update)) {
	    updateHeightsInViewport(cm)
	    postUpdateDisplay(cm, update)
	    var barMeasure = measureForScrollbars(cm)
	    updateSelection(cm)
	    updateScrollbars(cm, barMeasure)
	    setDocumentHeight(cm, barMeasure)
	    update.finish()
	  }
	}
	
	// Sync the actual display DOM structure with display.view, removing
	// nodes for lines that are no longer in view, and creating the ones
	// that are not there yet, and updating the ones that are out of
	// date.
	function patchDisplay(cm, updateNumbersFrom, dims) {
	  var display = cm.display, lineNumbers = cm.options.lineNumbers
	  var container = display.lineDiv, cur = container.firstChild
	
	  function rm(node) {
	    var next = node.nextSibling
	    // Works around a throw-scroll bug in OS X Webkit
	    if (webkit && mac && cm.display.currentWheelTarget == node)
	      { node.style.display = "none" }
	    else
	      { node.parentNode.removeChild(node) }
	    return next
	  }
	
	  var view = display.view, lineN = display.viewFrom
	  // Loop over the elements in the view, syncing cur (the DOM nodes
	  // in display.lineDiv) with the view as we go.
	  for (var i = 0; i < view.length; i++) {
	    var lineView = view[i]
	    if (lineView.hidden) {
	    } else if (!lineView.node || lineView.node.parentNode != container) { // Not drawn yet
	      var node = buildLineElement(cm, lineView, lineN, dims)
	      container.insertBefore(node, cur)
	    } else { // Already drawn
	      while (cur != lineView.node) { cur = rm(cur) }
	      var updateNumber = lineNumbers && updateNumbersFrom != null &&
	        updateNumbersFrom <= lineN && lineView.lineNumber
	      if (lineView.changes) {
	        if (indexOf(lineView.changes, "gutter") > -1) { updateNumber = false }
	        updateLineForChanges(cm, lineView, lineN, dims)
	      }
	      if (updateNumber) {
	        removeChildren(lineView.lineNumber)
	        lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)))
	      }
	      cur = lineView.node.nextSibling
	    }
	    lineN += lineView.size
	  }
	  while (cur) { cur = rm(cur) }
	}
	
	function updateGutterSpace(cm) {
	  var width = cm.display.gutters.offsetWidth
	  cm.display.sizer.style.marginLeft = width + "px"
	}
	
	function setDocumentHeight(cm, measure) {
	  cm.display.sizer.style.minHeight = measure.docHeight + "px"
	  cm.display.heightForcer.style.top = measure.docHeight + "px"
	  cm.display.gutters.style.height = (measure.docHeight + cm.display.barHeight + scrollGap(cm)) + "px"
	}
	
	// Rebuild the gutter elements, ensure the margin to the left of the
	// code matches their width.
	function updateGutters(cm) {
	  var gutters = cm.display.gutters, specs = cm.options.gutters
	  removeChildren(gutters)
	  var i = 0
	  for (; i < specs.length; ++i) {
	    var gutterClass = specs[i]
	    var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass))
	    if (gutterClass == "CodeMirror-linenumbers") {
	      cm.display.lineGutter = gElt
	      gElt.style.width = (cm.display.lineNumWidth || 1) + "px"
	    }
	  }
	  gutters.style.display = i ? "" : "none"
	  updateGutterSpace(cm)
	}
	
	// Make sure the gutters options contains the element
	// "CodeMirror-linenumbers" when the lineNumbers option is true.
	function setGuttersForLineNumbers(options) {
	  var found = indexOf(options.gutters, "CodeMirror-linenumbers")
	  if (found == -1 && options.lineNumbers) {
	    options.gutters = options.gutters.concat(["CodeMirror-linenumbers"])
	  } else if (found > -1 && !options.lineNumbers) {
	    options.gutters = options.gutters.slice(0)
	    options.gutters.splice(found, 1)
	  }
	}
	
	// Selection objects are immutable. A new one is created every time
	// the selection changes. A selection is one or more non-overlapping
	// (and non-touching) ranges, sorted, and an integer that indicates
	// which one is the primary selection (the one that's scrolled into
	// view, that getCursor returns, etc).
	function Selection(ranges, primIndex) {
	  this.ranges = ranges
	  this.primIndex = primIndex
	}
	
	Selection.prototype = {
	  primary: function() { return this.ranges[this.primIndex] },
	  equals: function(other) {
	    var this$1 = this;
	
	    if (other == this) { return true }
	    if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) { return false }
	    for (var i = 0; i < this.ranges.length; i++) {
	      var here = this$1.ranges[i], there = other.ranges[i]
	      if (cmp(here.anchor, there.anchor) != 0 || cmp(here.head, there.head) != 0) { return false }
	    }
	    return true
	  },
	  deepCopy: function() {
	    var this$1 = this;
	
	    var out = []
	    for (var i = 0; i < this.ranges.length; i++)
	      { out[i] = new Range(copyPos(this$1.ranges[i].anchor), copyPos(this$1.ranges[i].head)) }
	    return new Selection(out, this.primIndex)
	  },
	  somethingSelected: function() {
	    var this$1 = this;
	
	    for (var i = 0; i < this.ranges.length; i++)
	      { if (!this$1.ranges[i].empty()) { return true } }
	    return false
	  },
	  contains: function(pos, end) {
	    var this$1 = this;
	
	    if (!end) { end = pos }
	    for (var i = 0; i < this.ranges.length; i++) {
	      var range = this$1.ranges[i]
	      if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0)
	        { return i }
	    }
	    return -1
	  }
	}
	
	function Range(anchor, head) {
	  this.anchor = anchor; this.head = head
	}
	
	Range.prototype = {
	  from: function() { return minPos(this.anchor, this.head) },
	  to: function() { return maxPos(this.anchor, this.head) },
	  empty: function() {
	    return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch
	  }
	}
	
	// Take an unsorted, potentially overlapping set of ranges, and
	// build a selection out of it. 'Consumes' ranges array (modifying
	// it).
	function normalizeSelection(ranges, primIndex) {
	  var prim = ranges[primIndex]
	  ranges.sort(function (a, b) { return cmp(a.from(), b.from()); })
	  primIndex = indexOf(ranges, prim)
	  for (var i = 1; i < ranges.length; i++) {
	    var cur = ranges[i], prev = ranges[i - 1]
	    if (cmp(prev.to(), cur.from()) >= 0) {
	      var from = minPos(prev.from(), cur.from()), to = maxPos(prev.to(), cur.to())
	      var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head
	      if (i <= primIndex) { --primIndex }
	      ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to))
	    }
	  }
	  return new Selection(ranges, primIndex)
	}
	
	function simpleSelection(anchor, head) {
	  return new Selection([new Range(anchor, head || anchor)], 0)
	}
	
	// Compute the position of the end of a change (its 'to' property
	// refers to the pre-change end).
	function changeEnd(change) {
	  if (!change.text) { return change.to }
	  return Pos(change.from.line + change.text.length - 1,
	             lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0))
	}
	
	// Adjust a position to refer to the post-change position of the
	// same text, or the end of the change if the change covers it.
	function adjustForChange(pos, change) {
	  if (cmp(pos, change.from) < 0) { return pos }
	  if (cmp(pos, change.to) <= 0) { return changeEnd(change) }
	
	  var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1, ch = pos.ch
	  if (pos.line == change.to.line) { ch += changeEnd(change).ch - change.to.ch }
	  return Pos(line, ch)
	}
	
	function computeSelAfterChange(doc, change) {
	  var out = []
	  for (var i = 0; i < doc.sel.ranges.length; i++) {
	    var range = doc.sel.ranges[i]
	    out.push(new Range(adjustForChange(range.anchor, change),
	                       adjustForChange(range.head, change)))
	  }
	  return normalizeSelection(out, doc.sel.primIndex)
	}
	
	function offsetPos(pos, old, nw) {
	  if (pos.line == old.line)
	    { return Pos(nw.line, pos.ch - old.ch + nw.ch) }
	  else
	    { return Pos(nw.line + (pos.line - old.line), pos.ch) }
	}
	
	// Used by replaceSelections to allow moving the selection to the
	// start or around the replaced test. Hint may be "start" or "around".
	function computeReplacedSel(doc, changes, hint) {
	  var out = []
	  var oldPrev = Pos(doc.first, 0), newPrev = oldPrev
	  for (var i = 0; i < changes.length; i++) {
	    var change = changes[i]
	    var from = offsetPos(change.from, oldPrev, newPrev)
	    var to = offsetPos(changeEnd(change), oldPrev, newPrev)
	    oldPrev = change.to
	    newPrev = to
	    if (hint == "around") {
	      var range = doc.sel.ranges[i], inv = cmp(range.head, range.anchor) < 0
	      out[i] = new Range(inv ? to : from, inv ? from : to)
	    } else {
	      out[i] = new Range(from, from)
	    }
	  }
	  return new Selection(out, doc.sel.primIndex)
	}
	
	// Used to get the editor into a consistent state again when options change.
	
	function loadMode(cm) {
	  cm.doc.mode = getMode(cm.options, cm.doc.modeOption)
	  resetModeState(cm)
	}
	
	function resetModeState(cm) {
	  cm.doc.iter(function (line) {
	    if (line.stateAfter) { line.stateAfter = null }
	    if (line.styles) { line.styles = null }
	  })
	  cm.doc.frontier = cm.doc.first
	  startWorker(cm, 100)
	  cm.state.modeGen++
	  if (cm.curOp) { regChange(cm) }
	}
	
	// DOCUMENT DATA STRUCTURE
	
	// By default, updates that start and end at the beginning of a line
	// are treated specially, in order to make the association of line
	// widgets and marker elements with the text behave more intuitive.
	function isWholeLineUpdate(doc, change) {
	  return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" &&
	    (!doc.cm || doc.cm.options.wholeLineUpdateBefore)
	}
	
	// Perform a change on the document data structure.
	function updateDoc(doc, change, markedSpans, estimateHeight) {
	  function spansFor(n) {return markedSpans ? markedSpans[n] : null}
	  function update(line, text, spans) {
	    updateLine(line, text, spans, estimateHeight)
	    signalLater(line, "change", line, change)
	  }
	  function linesFor(start, end) {
	    var result = []
	    for (var i = start; i < end; ++i)
	      { result.push(new Line(text[i], spansFor(i), estimateHeight)) }
	    return result
	  }
	
	  var from = change.from, to = change.to, text = change.text
	  var firstLine = getLine(doc, from.line), lastLine = getLine(doc, to.line)
	  var lastText = lst(text), lastSpans = spansFor(text.length - 1), nlines = to.line - from.line
	
	  // Adjust the line structure
	  if (change.full) {
	    doc.insert(0, linesFor(0, text.length))
	    doc.remove(text.length, doc.size - text.length)
	  } else if (isWholeLineUpdate(doc, change)) {
	    // This is a whole-line replace. Treated specially to make
	    // sure line objects move the way they are supposed to.
	    var added = linesFor(0, text.length - 1)
	    update(lastLine, lastLine.text, lastSpans)
	    if (nlines) { doc.remove(from.line, nlines) }
	    if (added.length) { doc.insert(from.line, added) }
	  } else if (firstLine == lastLine) {
	    if (text.length == 1) {
	      update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans)
	    } else {
	      var added$1 = linesFor(1, text.length - 1)
	      added$1.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight))
	      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0))
	      doc.insert(from.line + 1, added$1)
	    }
	  } else if (text.length == 1) {
	    update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0))
	    doc.remove(from.line + 1, nlines)
	  } else {
	    update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0))
	    update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans)
	    var added$2 = linesFor(1, text.length - 1)
	    if (nlines > 1) { doc.remove(from.line + 1, nlines - 1) }
	    doc.insert(from.line + 1, added$2)
	  }
	
	  signalLater(doc, "change", doc, change)
	}
	
	// Call f for all linked documents.
	function linkedDocs(doc, f, sharedHistOnly) {
	  function propagate(doc, skip, sharedHist) {
	    if (doc.linked) { for (var i = 0; i < doc.linked.length; ++i) {
	      var rel = doc.linked[i]
	      if (rel.doc == skip) { continue }
	      var shared = sharedHist && rel.sharedHist
	      if (sharedHistOnly && !shared) { continue }
	      f(rel.doc, shared)
	      propagate(rel.doc, doc, shared)
	    } }
	  }
	  propagate(doc, null, true)
	}
	
	// Attach a document to an editor.
	function attachDoc(cm, doc) {
	  if (doc.cm) { throw new Error("This document is already in use.") }
	  cm.doc = doc
	  doc.cm = cm
	  estimateLineHeights(cm)
	  loadMode(cm)
	  if (!cm.options.lineWrapping) { findMaxLine(cm) }
	  cm.options.mode = doc.modeOption
	  regChange(cm)
	}
	
	function History(startGen) {
	  // Arrays of change events and selections. Doing something adds an
	  // event to done and clears undo. Undoing moves events from done
	  // to undone, redoing moves them in the other direction.
	  this.done = []; this.undone = []
	  this.undoDepth = Infinity
	  // Used to track when changes can be merged into a single undo
	  // event
	  this.lastModTime = this.lastSelTime = 0
	  this.lastOp = this.lastSelOp = null
	  this.lastOrigin = this.lastSelOrigin = null
	  // Used by the isClean() method
	  this.generation = this.maxGeneration = startGen || 1
	}
	
	// Create a history change event from an updateDoc-style change
	// object.
	function historyChangeFromChange(doc, change) {
	  var histChange = {from: copyPos(change.from), to: changeEnd(change), text: getBetween(doc, change.from, change.to)}
	  attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1)
	  linkedDocs(doc, function (doc) { return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1); }, true)
	  return histChange
	}
	
	// Pop all selection events off the end of a history array. Stop at
	// a change event.
	function clearSelectionEvents(array) {
	  while (array.length) {
	    var last = lst(array)
	    if (last.ranges) { array.pop() }
	    else { break }
	  }
	}
	
	// Find the top change event in the history. Pop off selection
	// events that are in the way.
	function lastChangeEvent(hist, force) {
	  if (force) {
	    clearSelectionEvents(hist.done)
	    return lst(hist.done)
	  } else if (hist.done.length && !lst(hist.done).ranges) {
	    return lst(hist.done)
	  } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
	    hist.done.pop()
	    return lst(hist.done)
	  }
	}
	
	// Register a change in the history. Merges changes that are within
	// a single operation, or are close together with an origin that
	// allows merging (starting with "+") into a single event.
	function addChangeToHistory(doc, change, selAfter, opId) {
	  var hist = doc.history
	  hist.undone.length = 0
	  var time = +new Date, cur
	  var last
	
	  if ((hist.lastOp == opId ||
	       hist.lastOrigin == change.origin && change.origin &&
	       ((change.origin.charAt(0) == "+" && doc.cm && hist.lastModTime > time - doc.cm.options.historyEventDelay) ||
	        change.origin.charAt(0) == "*")) &&
	      (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
	    // Merge this change into the last event
	    last = lst(cur.changes)
	    if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
	      // Optimized case for simple insertion -- don't want to add
	      // new changesets for every character typed
	      last.to = changeEnd(change)
	    } else {
	      // Add new sub-event
	      cur.changes.push(historyChangeFromChange(doc, change))
	    }
	  } else {
	    // Can not be merged, start a new event.
	    var before = lst(hist.done)
	    if (!before || !before.ranges)
	      { pushSelectionToHistory(doc.sel, hist.done) }
	    cur = {changes: [historyChangeFromChange(doc, change)],
	           generation: hist.generation}
	    hist.done.push(cur)
	    while (hist.done.length > hist.undoDepth) {
	      hist.done.shift()
	      if (!hist.done[0].ranges) { hist.done.shift() }
	    }
	  }
	  hist.done.push(selAfter)
	  hist.generation = ++hist.maxGeneration
	  hist.lastModTime = hist.lastSelTime = time
	  hist.lastOp = hist.lastSelOp = opId
	  hist.lastOrigin = hist.lastSelOrigin = change.origin
	
	  if (!last) { signal(doc, "historyAdded") }
	}
	
	function selectionEventCanBeMerged(doc, origin, prev, sel) {
	  var ch = origin.charAt(0)
	  return ch == "*" ||
	    ch == "+" &&
	    prev.ranges.length == sel.ranges.length &&
	    prev.somethingSelected() == sel.somethingSelected() &&
	    new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500)
	}
	
	// Called whenever the selection changes, sets the new selection as
	// the pending selection in the history, and pushes the old pending
	// selection into the 'done' array when it was significantly
	// different (in number of selected ranges, emptiness, or time).
	function addSelectionToHistory(doc, sel, opId, options) {
	  var hist = doc.history, origin = options && options.origin
	
	  // A new event is started when the previous origin does not match
	  // the current, or the origins don't allow matching. Origins
	  // starting with * are always merged, those starting with + are
	  // merged when similar and close together in time.
	  if (opId == hist.lastSelOp ||
	      (origin && hist.lastSelOrigin == origin &&
	       (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin ||
	        selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))))
	    { hist.done[hist.done.length - 1] = sel }
	  else
	    { pushSelectionToHistory(sel, hist.done) }
	
	  hist.lastSelTime = +new Date
	  hist.lastSelOrigin = origin
	  hist.lastSelOp = opId
	  if (options && options.clearRedo !== false)
	    { clearSelectionEvents(hist.undone) }
	}
	
	function pushSelectionToHistory(sel, dest) {
	  var top = lst(dest)
	  if (!(top && top.ranges && top.equals(sel)))
	    { dest.push(sel) }
	}
	
	// Used to store marked span information in the history.
	function attachLocalSpans(doc, change, from, to) {
	  var existing = change["spans_" + doc.id], n = 0
	  doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function (line) {
	    if (line.markedSpans)
	      { (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans }
	    ++n
	  })
	}
	
	// When un/re-doing restores text containing marked spans, those
	// that have been explicitly cleared should not be restored.
	function removeClearedSpans(spans) {
	  if (!spans) { return null }
	  var out
	  for (var i = 0; i < spans.length; ++i) {
	    if (spans[i].marker.explicitlyCleared) { if (!out) { out = spans.slice(0, i) } }
	    else if (out) { out.push(spans[i]) }
	  }
	  return !out ? spans : out.length ? out : null
	}
	
	// Retrieve and filter the old marked spans stored in a change event.
	function getOldSpans(doc, change) {
	  var found = change["spans_" + doc.id]
	  if (!found) { return null }
	  var nw = []
	  for (var i = 0; i < change.text.length; ++i)
	    { nw.push(removeClearedSpans(found[i])) }
	  return nw
	}
	
	// Used for un/re-doing changes from the history. Combines the
	// result of computing the existing spans with the set of spans that
	// existed in the history (so that deleting around a span and then
	// undoing brings back the span).
	function mergeOldSpans(doc, change) {
	  var old = getOldSpans(doc, change)
	  var stretched = stretchSpansOverChange(doc, change)
	  if (!old) { return stretched }
	  if (!stretched) { return old }
	
	  for (var i = 0; i < old.length; ++i) {
	    var oldCur = old[i], stretchCur = stretched[i]
	    if (oldCur && stretchCur) {
	      spans: for (var j = 0; j < stretchCur.length; ++j) {
	        var span = stretchCur[j]
	        for (var k = 0; k < oldCur.length; ++k)
	          { if (oldCur[k].marker == span.marker) { continue spans } }
	        oldCur.push(span)
	      }
	    } else if (stretchCur) {
	      old[i] = stretchCur
	    }
	  }
	  return old
	}
	
	// Used both to provide a JSON-safe object in .getHistory, and, when
	// detaching a document, to split the history in two
	function copyHistoryArray(events, newGroup, instantiateSel) {
	  var copy = []
	  for (var i = 0; i < events.length; ++i) {
	    var event = events[i]
	    if (event.ranges) {
	      copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event)
	      continue
	    }
	    var changes = event.changes, newChanges = []
	    copy.push({changes: newChanges})
	    for (var j = 0; j < changes.length; ++j) {
	      var change = changes[j], m = (void 0)
	      newChanges.push({from: change.from, to: change.to, text: change.text})
	      if (newGroup) { for (var prop in change) { if (m = prop.match(/^spans_(\d+)$/)) {
	        if (indexOf(newGroup, Number(m[1])) > -1) {
	          lst(newChanges)[prop] = change[prop]
	          delete change[prop]
	        }
	      } } }
	    }
	  }
	  return copy
	}
	
	// The 'scroll' parameter given to many of these indicated whether
	// the new cursor position should be scrolled into view after
	// modifying the selection.
	
	// If shift is held or the extend flag is set, extends a range to
	// include a given position (and optionally a second position).
	// Otherwise, simply returns the range between the given positions.
	// Used for cursor motion and such.
	function extendRange(doc, range, head, other) {
	  if (doc.cm && doc.cm.display.shift || doc.extend) {
	    var anchor = range.anchor
	    if (other) {
	      var posBefore = cmp(head, anchor) < 0
	      if (posBefore != (cmp(other, anchor) < 0)) {
	        anchor = head
	        head = other
	      } else if (posBefore != (cmp(head, other) < 0)) {
	        head = other
	      }
	    }
	    return new Range(anchor, head)
	  } else {
	    return new Range(other || head, head)
	  }
	}
	
	// Extend the primary selection range, discard the rest.
	function extendSelection(doc, head, other, options) {
	  setSelection(doc, new Selection([extendRange(doc, doc.sel.primary(), head, other)], 0), options)
	}
	
	// Extend all selections (pos is an array of selections with length
	// equal the number of selections)
	function extendSelections(doc, heads, options) {
	  var out = []
	  for (var i = 0; i < doc.sel.ranges.length; i++)
	    { out[i] = extendRange(doc, doc.sel.ranges[i], heads[i], null) }
	  var newSel = normalizeSelection(out, doc.sel.primIndex)
	  setSelection(doc, newSel, options)
	}
	
	// Updates a single range in the selection.
	function replaceOneSelection(doc, i, range, options) {
	  var ranges = doc.sel.ranges.slice(0)
	  ranges[i] = range
	  setSelection(doc, normalizeSelection(ranges, doc.sel.primIndex), options)
	}
	
	// Reset the selection to a single range.
	function setSimpleSelection(doc, anchor, head, options) {
	  setSelection(doc, simpleSelection(anchor, head), options)
	}
	
	// Give beforeSelectionChange handlers a change to influence a
	// selection update.
	function filterSelectionChange(doc, sel, options) {
	  var obj = {
	    ranges: sel.ranges,
	    update: function(ranges) {
	      var this$1 = this;
	
	      this.ranges = []
	      for (var i = 0; i < ranges.length; i++)
	        { this$1.ranges[i] = new Range(clipPos(doc, ranges[i].anchor),
	                                   clipPos(doc, ranges[i].head)) }
	    },
	    origin: options && options.origin
	  }
	  signal(doc, "beforeSelectionChange", doc, obj)
	  if (doc.cm) { signal(doc.cm, "beforeSelectionChange", doc.cm, obj) }
	  if (obj.ranges != sel.ranges) { return normalizeSelection(obj.ranges, obj.ranges.length - 1) }
	  else { return sel }
	}
	
	function setSelectionReplaceHistory(doc, sel, options) {
	  var done = doc.history.done, last = lst(done)
	  if (last && last.ranges) {
	    done[done.length - 1] = sel
	    setSelectionNoUndo(doc, sel, options)
	  } else {
	    setSelection(doc, sel, options)
	  }
	}
	
	// Set a new selection.
	function setSelection(doc, sel, options) {
	  setSelectionNoUndo(doc, sel, options)
	  addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options)
	}
	
	function setSelectionNoUndo(doc, sel, options) {
	  if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange"))
	    { sel = filterSelectionChange(doc, sel, options) }
	
	  var bias = options && options.bias ||
	    (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1)
	  setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true))
	
	  if (!(options && options.scroll === false) && doc.cm)
	    { ensureCursorVisible(doc.cm) }
	}
	
	function setSelectionInner(doc, sel) {
	  if (sel.equals(doc.sel)) { return }
	
	  doc.sel = sel
	
	  if (doc.cm) {
	    doc.cm.curOp.updateInput = doc.cm.curOp.selectionChanged = true
	    signalCursorActivity(doc.cm)
	  }
	  signalLater(doc, "cursorActivity", doc)
	}
	
	// Verify that the selection does not partially select any atomic
	// marked ranges.
	function reCheckSelection(doc) {
	  setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false), sel_dontScroll)
	}
	
	// Return a selection that does not partially select any atomic
	// ranges.
	function skipAtomicInSelection(doc, sel, bias, mayClear) {
	  var out
	  for (var i = 0; i < sel.ranges.length; i++) {
	    var range = sel.ranges[i]
	    var old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i]
	    var newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear)
	    var newHead = skipAtomic(doc, range.head, old && old.head, bias, mayClear)
	    if (out || newAnchor != range.anchor || newHead != range.head) {
	      if (!out) { out = sel.ranges.slice(0, i) }
	      out[i] = new Range(newAnchor, newHead)
	    }
	  }
	  return out ? normalizeSelection(out, sel.primIndex) : sel
	}
	
	function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
	  var line = getLine(doc, pos.line)
	  if (line.markedSpans) { for (var i = 0; i < line.markedSpans.length; ++i) {
	    var sp = line.markedSpans[i], m = sp.marker
	    if ((sp.from == null || (m.inclusiveLeft ? sp.from <= pos.ch : sp.from < pos.ch)) &&
	        (sp.to == null || (m.inclusiveRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
	      if (mayClear) {
	        signal(m, "beforeCursorEnter")
	        if (m.explicitlyCleared) {
	          if (!line.markedSpans) { break }
	          else {--i; continue}
	        }
	      }
	      if (!m.atomic) { continue }
	
	      if (oldPos) {
	        var near = m.find(dir < 0 ? 1 : -1), diff = (void 0)
	        if (dir < 0 ? m.inclusiveRight : m.inclusiveLeft)
	          { near = movePos(doc, near, -dir, near && near.line == pos.line ? line : null) }
	        if (near && near.line == pos.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0))
	          { return skipAtomicInner(doc, near, pos, dir, mayClear) }
	      }
	
	      var far = m.find(dir < 0 ? -1 : 1)
	      if (dir < 0 ? m.inclusiveLeft : m.inclusiveRight)
	        { far = movePos(doc, far, dir, far.line == pos.line ? line : null) }
	      return far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null
	    }
	  } }
	  return pos
	}
	
	// Ensure a given position is not inside an atomic range.
	function skipAtomic(doc, pos, oldPos, bias, mayClear) {
	  var dir = bias || 1
	  var found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) ||
	      (!mayClear && skipAtomicInner(doc, pos, oldPos, dir, true)) ||
	      skipAtomicInner(doc, pos, oldPos, -dir, mayClear) ||
	      (!mayClear && skipAtomicInner(doc, pos, oldPos, -dir, true))
	  if (!found) {
	    doc.cantEdit = true
	    return Pos(doc.first, 0)
	  }
	  return found
	}
	
	function movePos(doc, pos, dir, line) {
	  if (dir < 0 && pos.ch == 0) {
	    if (pos.line > doc.first) { return clipPos(doc, Pos(pos.line - 1)) }
	    else { return null }
	  } else if (dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length) {
	    if (pos.line < doc.first + doc.size - 1) { return Pos(pos.line + 1, 0) }
	    else { return null }
	  } else {
	    return new Pos(pos.line, pos.ch + dir)
	  }
	}
	
	function selectAll(cm) {
	  cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll)
	}
	
	// UPDATING
	
	// Allow "beforeChange" event handlers to influence a change
	function filterChange(doc, change, update) {
	  var obj = {
	    canceled: false,
	    from: change.from,
	    to: change.to,
	    text: change.text,
	    origin: change.origin,
	    cancel: function () { return obj.canceled = true; }
	  }
	  if (update) { obj.update = function (from, to, text, origin) {
	    if (from) { obj.from = clipPos(doc, from) }
	    if (to) { obj.to = clipPos(doc, to) }
	    if (text) { obj.text = text }
	    if (origin !== undefined) { obj.origin = origin }
	  } }
	  signal(doc, "beforeChange", doc, obj)
	  if (doc.cm) { signal(doc.cm, "beforeChange", doc.cm, obj) }
	
	  if (obj.canceled) { return null }
	  return {from: obj.from, to: obj.to, text: obj.text, origin: obj.origin}
	}
	
	// Apply a change to a document, and add it to the document's
	// history, and propagating it to all linked documents.
	function makeChange(doc, change, ignoreReadOnly) {
	  if (doc.cm) {
	    if (!doc.cm.curOp) { return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly) }
	    if (doc.cm.state.suppressEdits) { return }
	  }
	
	  if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
	    change = filterChange(doc, change, true)
	    if (!change) { return }
	  }
	
	  // Possibly split or suppress the update based on the presence
	  // of read-only spans in its range.
	  var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to)
	  if (split) {
	    for (var i = split.length - 1; i >= 0; --i)
	      { makeChangeInner(doc, {from: split[i].from, to: split[i].to, text: i ? [""] : change.text}) }
	  } else {
	    makeChangeInner(doc, change)
	  }
	}
	
	function makeChangeInner(doc, change) {
	  if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) { return }
	  var selAfter = computeSelAfterChange(doc, change)
	  addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN)
	
	  makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change))
	  var rebased = []
	
	  linkedDocs(doc, function (doc, sharedHist) {
	    if (!sharedHist && indexOf(rebased, doc.history) == -1) {
	      rebaseHist(doc.history, change)
	      rebased.push(doc.history)
	    }
	    makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change))
	  })
	}
	
	// Revert a change stored in a document's history.
	function makeChangeFromHistory(doc, type, allowSelectionOnly) {
	  if (doc.cm && doc.cm.state.suppressEdits && !allowSelectionOnly) { return }
	
	  var hist = doc.history, event, selAfter = doc.sel
	  var source = type == "undo" ? hist.done : hist.undone, dest = type == "undo" ? hist.undone : hist.done
	
	  // Verify that there is a useable event (so that ctrl-z won't
	  // needlessly clear selection events)
	  var i = 0
	  for (; i < source.length; i++) {
	    event = source[i]
	    if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges)
	      { break }
	  }
	  if (i == source.length) { return }
	  hist.lastOrigin = hist.lastSelOrigin = null
	
	  for (;;) {
	    event = source.pop()
	    if (event.ranges) {
	      pushSelectionToHistory(event, dest)
	      if (allowSelectionOnly && !event.equals(doc.sel)) {
	        setSelection(doc, event, {clearRedo: false})
	        return
	      }
	      selAfter = event
	    }
	    else { break }
	  }
	
	  // Build up a reverse change object to add to the opposite history
	  // stack (redo when undoing, and vice versa).
	  var antiChanges = []
	  pushSelectionToHistory(selAfter, dest)
	  dest.push({changes: antiChanges, generation: hist.generation})
	  hist.generation = event.generation || ++hist.maxGeneration
	
	  var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")
	
	  var loop = function ( i ) {
	    var change = event.changes[i]
	    change.origin = type
	    if (filter && !filterChange(doc, change, false)) {
	      source.length = 0
	      return {}
	    }
	
	    antiChanges.push(historyChangeFromChange(doc, change))
	
	    var after = i ? computeSelAfterChange(doc, change) : lst(source)
	    makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change))
	    if (!i && doc.cm) { doc.cm.scrollIntoView({from: change.from, to: changeEnd(change)}) }
	    var rebased = []
	
	    // Propagate to the linked documents
	    linkedDocs(doc, function (doc, sharedHist) {
	      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
	        rebaseHist(doc.history, change)
	        rebased.push(doc.history)
	      }
	      makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change))
	    })
	  };
	
	  for (var i$1 = event.changes.length - 1; i$1 >= 0; --i$1) {
	    var returned = loop( i$1 );
	
	    if ( returned ) return returned.v;
	  }
	}
	
	// Sub-views need their line numbers shifted when text is added
	// above or below them in the parent document.
	function shiftDoc(doc, distance) {
	  if (distance == 0) { return }
	  doc.first += distance
	  doc.sel = new Selection(map(doc.sel.ranges, function (range) { return new Range(
	    Pos(range.anchor.line + distance, range.anchor.ch),
	    Pos(range.head.line + distance, range.head.ch)
	  ); }), doc.sel.primIndex)
	  if (doc.cm) {
	    regChange(doc.cm, doc.first, doc.first - distance, distance)
	    for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++)
	      { regLineChange(doc.cm, l, "gutter") }
	  }
	}
	
	// More lower-level change function, handling only a single document
	// (not linked ones).
	function makeChangeSingleDoc(doc, change, selAfter, spans) {
	  if (doc.cm && !doc.cm.curOp)
	    { return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans) }
	
	  if (change.to.line < doc.first) {
	    shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line))
	    return
	  }
	  if (change.from.line > doc.lastLine()) { return }
	
	  // Clip the change to the size of this doc
	  if (change.from.line < doc.first) {
	    var shift = change.text.length - 1 - (doc.first - change.from.line)
	    shiftDoc(doc, shift)
	    change = {from: Pos(doc.first, 0), to: Pos(change.to.line + shift, change.to.ch),
	              text: [lst(change.text)], origin: change.origin}
	  }
	  var last = doc.lastLine()
	  if (change.to.line > last) {
	    change = {from: change.from, to: Pos(last, getLine(doc, last).text.length),
	              text: [change.text[0]], origin: change.origin}
	  }
	
	  change.removed = getBetween(doc, change.from, change.to)
	
	  if (!selAfter) { selAfter = computeSelAfterChange(doc, change) }
	  if (doc.cm) { makeChangeSingleDocInEditor(doc.cm, change, spans) }
	  else { updateDoc(doc, change, spans) }
	  setSelectionNoUndo(doc, selAfter, sel_dontScroll)
	}
	
	// Handle the interaction of a change to a document with the editor
	// that this document is part of.
	function makeChangeSingleDocInEditor(cm, change, spans) {
	  var doc = cm.doc, display = cm.display, from = change.from, to = change.to
	
	  var recomputeMaxLength = false, checkWidthStart = from.line
	  if (!cm.options.lineWrapping) {
	    checkWidthStart = lineNo(visualLine(getLine(doc, from.line)))
	    doc.iter(checkWidthStart, to.line + 1, function (line) {
	      if (line == display.maxLine) {
	        recomputeMaxLength = true
	        return true
	      }
	    })
	  }
	
	  if (doc.sel.contains(change.from, change.to) > -1)
	    { signalCursorActivity(cm) }
	
	  updateDoc(doc, change, spans, estimateHeight(cm))
	
	  if (!cm.options.lineWrapping) {
	    doc.iter(checkWidthStart, from.line + change.text.length, function (line) {
	      var len = lineLength(line)
	      if (len > display.maxLineLength) {
	        display.maxLine = line
	        display.maxLineLength = len
	        display.maxLineChanged = true
	        recomputeMaxLength = false
	      }
	    })
	    if (recomputeMaxLength) { cm.curOp.updateMaxLine = true }
	  }
	
	  // Adjust frontier, schedule worker
	  doc.frontier = Math.min(doc.frontier, from.line)
	  startWorker(cm, 400)
	
	  var lendiff = change.text.length - (to.line - from.line) - 1
	  // Remember that these lines changed, for updating the display
	  if (change.full)
	    { regChange(cm) }
	  else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change))
	    { regLineChange(cm, from.line, "text") }
	  else
	    { regChange(cm, from.line, to.line + 1, lendiff) }
	
	  var changesHandler = hasHandler(cm, "changes"), changeHandler = hasHandler(cm, "change")
	  if (changeHandler || changesHandler) {
	    var obj = {
	      from: from, to: to,
	      text: change.text,
	      removed: change.removed,
	      origin: change.origin
	    }
	    if (changeHandler) { signalLater(cm, "change", cm, obj) }
	    if (changesHandler) { (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj) }
	  }
	  cm.display.selForContextMenu = null
	}
	
	function replaceRange(doc, code, from, to, origin) {
	  if (!to) { to = from }
	  if (cmp(to, from) < 0) { var tmp = to; to = from; from = tmp }
	  if (typeof code == "string") { code = doc.splitLines(code) }
	  makeChange(doc, {from: from, to: to, text: code, origin: origin})
	}
	
	// Rebasing/resetting history to deal with externally-sourced changes
	
	function rebaseHistSelSingle(pos, from, to, diff) {
	  if (to < pos.line) {
	    pos.line += diff
	  } else if (from < pos.line) {
	    pos.line = from
	    pos.ch = 0
	  }
	}
	
	// Tries to rebase an array of history events given a change in the
	// document. If the change touches the same lines as the event, the
	// event, and everything 'behind' it, is discarded. If the change is
	// before the event, the event's positions are updated. Uses a
	// copy-on-write scheme for the positions, to avoid having to
	// reallocate them all on every rebase, but also avoid problems with
	// shared position objects being unsafely updated.
	function rebaseHistArray(array, from, to, diff) {
	  for (var i = 0; i < array.length; ++i) {
	    var sub = array[i], ok = true
	    if (sub.ranges) {
	      if (!sub.copied) { sub = array[i] = sub.deepCopy(); sub.copied = true }
	      for (var j = 0; j < sub.ranges.length; j++) {
	        rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff)
	        rebaseHistSelSingle(sub.ranges[j].head, from, to, diff)
	      }
	      continue
	    }
	    for (var j$1 = 0; j$1 < sub.changes.length; ++j$1) {
	      var cur = sub.changes[j$1]
	      if (to < cur.from.line) {
	        cur.from = Pos(cur.from.line + diff, cur.from.ch)
	        cur.to = Pos(cur.to.line + diff, cur.to.ch)
	      } else if (from <= cur.to.line) {
	        ok = false
	        break
	      }
	    }
	    if (!ok) {
	      array.splice(0, i + 1)
	      i = 0
	    }
	  }
	}
	
	function rebaseHist(hist, change) {
	  var from = change.from.line, to = change.to.line, diff = change.text.length - (to - from) - 1
	  rebaseHistArray(hist.done, from, to, diff)
	  rebaseHistArray(hist.undone, from, to, diff)
	}
	
	// Utility for applying a change to a line by handle or number,
	// returning the number and optionally registering the line as
	// changed.
	function changeLine(doc, handle, changeType, op) {
	  var no = handle, line = handle
	  if (typeof handle == "number") { line = getLine(doc, clipLine(doc, handle)) }
	  else { no = lineNo(handle) }
	  if (no == null) { return null }
	  if (op(line, no) && doc.cm) { regLineChange(doc.cm, no, changeType) }
	  return line
	}
	
	// The document is represented as a BTree consisting of leaves, with
	// chunk of lines in them, and branches, with up to ten leaves or
	// other branch nodes below them. The top node is always a branch
	// node, and is the document object itself (meaning it has
	// additional methods and properties).
	//
	// All nodes have parent links. The tree is used both to go from
	// line numbers to line objects, and to go from objects to numbers.
	// It also indexes by height, and is used to convert between height
	// and line object, and to find the total height of the document.
	//
	// See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html
	
	function LeafChunk(lines) {
	  var this$1 = this;
	
	  this.lines = lines
	  this.parent = null
	  var height = 0
	  for (var i = 0; i < lines.length; ++i) {
	    lines[i].parent = this$1
	    height += lines[i].height
	  }
	  this.height = height
	}
	
	LeafChunk.prototype = {
	  chunkSize: function() { return this.lines.length },
	  // Remove the n lines at offset 'at'.
	  removeInner: function(at, n) {
	    var this$1 = this;
	
	    for (var i = at, e = at + n; i < e; ++i) {
	      var line = this$1.lines[i]
	      this$1.height -= line.height
	      cleanUpLine(line)
	      signalLater(line, "delete")
	    }
	    this.lines.splice(at, n)
	  },
	  // Helper used to collapse a small branch into a single leaf.
	  collapse: function(lines) {
	    lines.push.apply(lines, this.lines)
	  },
	  // Insert the given array of lines at offset 'at', count them as
	  // having the given height.
	  insertInner: function(at, lines, height) {
	    var this$1 = this;
	
	    this.height += height
	    this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at))
	    for (var i = 0; i < lines.length; ++i) { lines[i].parent = this$1 }
	  },
	  // Used to iterate over a part of the tree.
	  iterN: function(at, n, op) {
	    var this$1 = this;
	
	    for (var e = at + n; at < e; ++at)
	      { if (op(this$1.lines[at])) { return true } }
	  }
	}
	
	function BranchChunk(children) {
	  var this$1 = this;
	
	  this.children = children
	  var size = 0, height = 0
	  for (var i = 0; i < children.length; ++i) {
	    var ch = children[i]
	    size += ch.chunkSize(); height += ch.height
	    ch.parent = this$1
	  }
	  this.size = size
	  this.height = height
	  this.parent = null
	}
	
	BranchChunk.prototype = {
	  chunkSize: function() { return this.size },
	  removeInner: function(at, n) {
	    var this$1 = this;
	
	    this.size -= n
	    for (var i = 0; i < this.children.length; ++i) {
	      var child = this$1.children[i], sz = child.chunkSize()
	      if (at < sz) {
	        var rm = Math.min(n, sz - at), oldHeight = child.height
	        child.removeInner(at, rm)
	        this$1.height -= oldHeight - child.height
	        if (sz == rm) { this$1.children.splice(i--, 1); child.parent = null }
	        if ((n -= rm) == 0) { break }
	        at = 0
	      } else { at -= sz }
	    }
	    // If the result is smaller than 25 lines, ensure that it is a
	    // single leaf node.
	    if (this.size - n < 25 &&
	        (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
	      var lines = []
	      this.collapse(lines)
	      this.children = [new LeafChunk(lines)]
	      this.children[0].parent = this
	    }
	  },
	  collapse: function(lines) {
	    var this$1 = this;
	
	    for (var i = 0; i < this.children.length; ++i) { this$1.children[i].collapse(lines) }
	  },
	  insertInner: function(at, lines, height) {
	    var this$1 = this;
	
	    this.size += lines.length
	    this.height += height
	    for (var i = 0; i < this.children.length; ++i) {
	      var child = this$1.children[i], sz = child.chunkSize()
	      if (at <= sz) {
	        child.insertInner(at, lines, height)
	        if (child.lines && child.lines.length > 50) {
	          // To avoid memory thrashing when child.lines is huge (e.g. first view of a large file), it's never spliced.
	          // Instead, small slices are taken. They're taken in order because sequential memory accesses are fastest.
	          var remaining = child.lines.length % 25 + 25
	          for (var pos = remaining; pos < child.lines.length;) {
	            var leaf = new LeafChunk(child.lines.slice(pos, pos += 25))
	            child.height -= leaf.height
	            this$1.children.splice(++i, 0, leaf)
	            leaf.parent = this$1
	          }
	          child.lines = child.lines.slice(0, remaining)
	          this$1.maybeSpill()
	        }
	        break
	      }
	      at -= sz
	    }
	  },
	  // When a node has grown, check whether it should be split.
	  maybeSpill: function() {
	    if (this.children.length <= 10) { return }
	    var me = this
	    do {
	      var spilled = me.children.splice(me.children.length - 5, 5)
	      var sibling = new BranchChunk(spilled)
	      if (!me.parent) { // Become the parent node
	        var copy = new BranchChunk(me.children)
	        copy.parent = me
	        me.children = [copy, sibling]
	        me = copy
	     } else {
	        me.size -= sibling.size
	        me.height -= sibling.height
	        var myIndex = indexOf(me.parent.children, me)
	        me.parent.children.splice(myIndex + 1, 0, sibling)
	      }
	      sibling.parent = me.parent
	    } while (me.children.length > 10)
	    me.parent.maybeSpill()
	  },
	  iterN: function(at, n, op) {
	    var this$1 = this;
	
	    for (var i = 0; i < this.children.length; ++i) {
	      var child = this$1.children[i], sz = child.chunkSize()
	      if (at < sz) {
	        var used = Math.min(n, sz - at)
	        if (child.iterN(at, used, op)) { return true }
	        if ((n -= used) == 0) { break }
	        at = 0
	      } else { at -= sz }
	    }
	  }
	}
	
	// Line widgets are block elements displayed above or below a line.
	
	function LineWidget(doc, node, options) {
	  var this$1 = this;
	
	  if (options) { for (var opt in options) { if (options.hasOwnProperty(opt))
	    { this$1[opt] = options[opt] } } }
	  this.doc = doc
	  this.node = node
	}
	eventMixin(LineWidget)
	
	function adjustScrollWhenAboveVisible(cm, line, diff) {
	  if (heightAtLine(line) < ((cm.curOp && cm.curOp.scrollTop) || cm.doc.scrollTop))
	    { addToScrollPos(cm, null, diff) }
	}
	
	LineWidget.prototype.clear = function() {
	  var this$1 = this;
	
	  var cm = this.doc.cm, ws = this.line.widgets, line = this.line, no = lineNo(line)
	  if (no == null || !ws) { return }
	  for (var i = 0; i < ws.length; ++i) { if (ws[i] == this$1) { ws.splice(i--, 1) } }
	  if (!ws.length) { line.widgets = null }
	  var height = widgetHeight(this)
	  updateLineHeight(line, Math.max(0, line.height - height))
	  if (cm) { runInOp(cm, function () {
	    adjustScrollWhenAboveVisible(cm, line, -height)
	    regLineChange(cm, no, "widget")
	  }) }
	}
	LineWidget.prototype.changed = function() {
	  var oldH = this.height, cm = this.doc.cm, line = this.line
	  this.height = null
	  var diff = widgetHeight(this) - oldH
	  if (!diff) { return }
	  updateLineHeight(line, line.height + diff)
	  if (cm) { runInOp(cm, function () {
	    cm.curOp.forceUpdate = true
	    adjustScrollWhenAboveVisible(cm, line, diff)
	  }) }
	}
	
	function addLineWidget(doc, handle, node, options) {
	  var widget = new LineWidget(doc, node, options)
	  var cm = doc.cm
	  if (cm && widget.noHScroll) { cm.display.alignWidgets = true }
	  changeLine(doc, handle, "widget", function (line) {
	    var widgets = line.widgets || (line.widgets = [])
	    if (widget.insertAt == null) { widgets.push(widget) }
	    else { widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget) }
	    widget.line = line
	    if (cm && !lineIsHidden(doc, line)) {
	      var aboveVisible = heightAtLine(line) < doc.scrollTop
	      updateLineHeight(line, line.height + widgetHeight(widget))
	      if (aboveVisible) { addToScrollPos(cm, null, widget.height) }
	      cm.curOp.forceUpdate = true
	    }
	    return true
	  })
	  return widget
	}
	
	// TEXTMARKERS
	
	// Created with markText and setBookmark methods. A TextMarker is a
	// handle that can be used to clear or find a marked position in the
	// document. Line objects hold arrays (markedSpans) containing
	// {from, to, marker} object pointing to such marker objects, and
	// indicating that such a marker is present on that line. Multiple
	// lines may point to the same marker when it spans across lines.
	// The spans will have null for their from/to properties when the
	// marker continues beyond the start/end of the line. Markers have
	// links back to the lines they currently touch.
	
	// Collapsed markers have unique ids, in order to be able to order
	// them, which is needed for uniquely determining an outer marker
	// when they overlap (they may nest, but not partially overlap).
	var nextMarkerId = 0
	
	function TextMarker(doc, type) {
	  this.lines = []
	  this.type = type
	  this.doc = doc
	  this.id = ++nextMarkerId
	}
	eventMixin(TextMarker)
	
	// Clear the marker.
	TextMarker.prototype.clear = function() {
	  var this$1 = this;
	
	  if (this.explicitlyCleared) { return }
	  var cm = this.doc.cm, withOp = cm && !cm.curOp
	  if (withOp) { startOperation(cm) }
	  if (hasHandler(this, "clear")) {
	    var found = this.find()
	    if (found) { signalLater(this, "clear", found.from, found.to) }
	  }
	  var min = null, max = null
	  for (var i = 0; i < this.lines.length; ++i) {
	    var line = this$1.lines[i]
	    var span = getMarkedSpanFor(line.markedSpans, this$1)
	    if (cm && !this$1.collapsed) { regLineChange(cm, lineNo(line), "text") }
	    else if (cm) {
	      if (span.to != null) { max = lineNo(line) }
	      if (span.from != null) { min = lineNo(line) }
	    }
	    line.markedSpans = removeMarkedSpan(line.markedSpans, span)
	    if (span.from == null && this$1.collapsed && !lineIsHidden(this$1.doc, line) && cm)
	      { updateLineHeight(line, textHeight(cm.display)) }
	  }
	  if (cm && this.collapsed && !cm.options.lineWrapping) { for (var i$1 = 0; i$1 < this.lines.length; ++i$1) {
	    var visual = visualLine(this$1.lines[i$1]), len = lineLength(visual)
	    if (len > cm.display.maxLineLength) {
	      cm.display.maxLine = visual
	      cm.display.maxLineLength = len
	      cm.display.maxLineChanged = true
	    }
	  } }
	
	  if (min != null && cm && this.collapsed) { regChange(cm, min, max + 1) }
	  this.lines.length = 0
	  this.explicitlyCleared = true
	  if (this.atomic && this.doc.cantEdit) {
	    this.doc.cantEdit = false
	    if (cm) { reCheckSelection(cm.doc) }
	  }
	  if (cm) { signalLater(cm, "markerCleared", cm, this) }
	  if (withOp) { endOperation(cm) }
	  if (this.parent) { this.parent.clear() }
	}
	
	// Find the position of the marker in the document. Returns a {from,
	// to} object by default. Side can be passed to get a specific side
	// -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
	// Pos objects returned contain a line object, rather than a line
	// number (used to prevent looking up the same line twice).
	TextMarker.prototype.find = function(side, lineObj) {
	  var this$1 = this;
	
	  if (side == null && this.type == "bookmark") { side = 1 }
	  var from, to
	  for (var i = 0; i < this.lines.length; ++i) {
	    var line = this$1.lines[i]
	    var span = getMarkedSpanFor(line.markedSpans, this$1)
	    if (span.from != null) {
	      from = Pos(lineObj ? line : lineNo(line), span.from)
	      if (side == -1) { return from }
	    }
	    if (span.to != null) {
	      to = Pos(lineObj ? line : lineNo(line), span.to)
	      if (side == 1) { return to }
	    }
	  }
	  return from && {from: from, to: to}
	}
	
	// Signals that the marker's widget changed, and surrounding layout
	// should be recomputed.
	TextMarker.prototype.changed = function() {
	  var pos = this.find(-1, true), widget = this, cm = this.doc.cm
	  if (!pos || !cm) { return }
	  runInOp(cm, function () {
	    var line = pos.line, lineN = lineNo(pos.line)
	    var view = findViewForLine(cm, lineN)
	    if (view) {
	      clearLineMeasurementCacheFor(view)
	      cm.curOp.selectionChanged = cm.curOp.forceUpdate = true
	    }
	    cm.curOp.updateMaxLine = true
	    if (!lineIsHidden(widget.doc, line) && widget.height != null) {
	      var oldHeight = widget.height
	      widget.height = null
	      var dHeight = widgetHeight(widget) - oldHeight
	      if (dHeight)
	        { updateLineHeight(line, line.height + dHeight) }
	    }
	  })
	}
	
	TextMarker.prototype.attachLine = function(line) {
	  if (!this.lines.length && this.doc.cm) {
	    var op = this.doc.cm.curOp
	    if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1)
	      { (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this) }
	  }
	  this.lines.push(line)
	}
	TextMarker.prototype.detachLine = function(line) {
	  this.lines.splice(indexOf(this.lines, line), 1)
	  if (!this.lines.length && this.doc.cm) {
	    var op = this.doc.cm.curOp
	    ;(op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this)
	  }
	}
	
	// Create a marker, wire it up to the right lines, and
	function markText(doc, from, to, options, type) {
	  // Shared markers (across linked documents) are handled separately
	  // (markTextShared will call out to this again, once per
	  // document).
	  if (options && options.shared) { return markTextShared(doc, from, to, options, type) }
	  // Ensure we are in an operation.
	  if (doc.cm && !doc.cm.curOp) { return operation(doc.cm, markText)(doc, from, to, options, type) }
	
	  var marker = new TextMarker(doc, type), diff = cmp(from, to)
	  if (options) { copyObj(options, marker, false) }
	  // Don't connect empty markers unless clearWhenEmpty is false
	  if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false)
	    { return marker }
	  if (marker.replacedWith) {
	    // Showing up as a widget implies collapsed (widget replaces text)
	    marker.collapsed = true
	    marker.widgetNode = elt("span", [marker.replacedWith], "CodeMirror-widget")
	    if (!options.handleMouseEvents) { marker.widgetNode.setAttribute("cm-ignore-events", "true") }
	    if (options.insertLeft) { marker.widgetNode.insertLeft = true }
	  }
	  if (marker.collapsed) {
	    if (conflictingCollapsedRange(doc, from.line, from, to, marker) ||
	        from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker))
	      { throw new Error("Inserting collapsed marker partially overlapping an existing one") }
	    seeCollapsedSpans()
	  }
	
	  if (marker.addToHistory)
	    { addChangeToHistory(doc, {from: from, to: to, origin: "markText"}, doc.sel, NaN) }
	
	  var curLine = from.line, cm = doc.cm, updateMaxLine
	  doc.iter(curLine, to.line + 1, function (line) {
	    if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine)
	      { updateMaxLine = true }
	    if (marker.collapsed && curLine != from.line) { updateLineHeight(line, 0) }
	    addMarkedSpan(line, new MarkedSpan(marker,
	                                       curLine == from.line ? from.ch : null,
	                                       curLine == to.line ? to.ch : null))
	    ++curLine
	  })
	  // lineIsHidden depends on the presence of the spans, so needs a second pass
	  if (marker.collapsed) { doc.iter(from.line, to.line + 1, function (line) {
	    if (lineIsHidden(doc, line)) { updateLineHeight(line, 0) }
	  }) }
	
	  if (marker.clearOnEnter) { on(marker, "beforeCursorEnter", function () { return marker.clear(); }) }
	
	  if (marker.readOnly) {
	    seeReadOnlySpans()
	    if (doc.history.done.length || doc.history.undone.length)
	      { doc.clearHistory() }
	  }
	  if (marker.collapsed) {
	    marker.id = ++nextMarkerId
	    marker.atomic = true
	  }
	  if (cm) {
	    // Sync editor state
	    if (updateMaxLine) { cm.curOp.updateMaxLine = true }
	    if (marker.collapsed)
	      { regChange(cm, from.line, to.line + 1) }
	    else if (marker.className || marker.title || marker.startStyle || marker.endStyle || marker.css)
	      { for (var i = from.line; i <= to.line; i++) { regLineChange(cm, i, "text") } }
	    if (marker.atomic) { reCheckSelection(cm.doc) }
	    signalLater(cm, "markerAdded", cm, marker)
	  }
	  return marker
	}
	
	// SHARED TEXTMARKERS
	
	// A shared marker spans multiple linked documents. It is
	// implemented as a meta-marker-object controlling multiple normal
	// markers.
	function SharedTextMarker(markers, primary) {
	  var this$1 = this;
	
	  this.markers = markers
	  this.primary = primary
	  for (var i = 0; i < markers.length; ++i)
	    { markers[i].parent = this$1 }
	}
	eventMixin(SharedTextMarker)
	
	SharedTextMarker.prototype.clear = function() {
	  var this$1 = this;
	
	  if (this.explicitlyCleared) { return }
	  this.explicitlyCleared = true
	  for (var i = 0; i < this.markers.length; ++i)
	    { this$1.markers[i].clear() }
	  signalLater(this, "clear")
	}
	SharedTextMarker.prototype.find = function(side, lineObj) {
	  return this.primary.find(side, lineObj)
	}
	
	function markTextShared(doc, from, to, options, type) {
	  options = copyObj(options)
	  options.shared = false
	  var markers = [markText(doc, from, to, options, type)], primary = markers[0]
	  var widget = options.widgetNode
	  linkedDocs(doc, function (doc) {
	    if (widget) { options.widgetNode = widget.cloneNode(true) }
	    markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type))
	    for (var i = 0; i < doc.linked.length; ++i)
	      { if (doc.linked[i].isParent) { return } }
	    primary = lst(markers)
	  })
	  return new SharedTextMarker(markers, primary)
	}
	
	function findSharedMarkers(doc) {
	  return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), function (m) { return m.parent; })
	}
	
	function copySharedMarkers(doc, markers) {
	  for (var i = 0; i < markers.length; i++) {
	    var marker = markers[i], pos = marker.find()
	    var mFrom = doc.clipPos(pos.from), mTo = doc.clipPos(pos.to)
	    if (cmp(mFrom, mTo)) {
	      var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type)
	      marker.markers.push(subMark)
	      subMark.parent = marker
	    }
	  }
	}
	
	function detachSharedMarkers(markers) {
	  var loop = function ( i ) {
	    var marker = markers[i], linked = [marker.primary.doc]
	    linkedDocs(marker.primary.doc, function (d) { return linked.push(d); })
	    for (var j = 0; j < marker.markers.length; j++) {
	      var subMarker = marker.markers[j]
	      if (indexOf(linked, subMarker.doc) == -1) {
	        subMarker.parent = null
	        marker.markers.splice(j--, 1)
	      }
	    }
	  };
	
	  for (var i = 0; i < markers.length; i++) loop( i );
	}
	
	var nextDocId = 0
	var Doc = function(text, mode, firstLine, lineSep) {
	  if (!(this instanceof Doc)) { return new Doc(text, mode, firstLine, lineSep) }
	  if (firstLine == null) { firstLine = 0 }
	
	  BranchChunk.call(this, [new LeafChunk([new Line("", null)])])
	  this.first = firstLine
	  this.scrollTop = this.scrollLeft = 0
	  this.cantEdit = false
	  this.cleanGeneration = 1
	  this.frontier = firstLine
	  var start = Pos(firstLine, 0)
	  this.sel = simpleSelection(start)
	  this.history = new History(null)
	  this.id = ++nextDocId
	  this.modeOption = mode
	  this.lineSep = lineSep
	  this.extend = false
	
	  if (typeof text == "string") { text = this.splitLines(text) }
	  updateDoc(this, {from: start, to: start, text: text})
	  setSelection(this, simpleSelection(start), sel_dontScroll)
	}
	
	Doc.prototype = createObj(BranchChunk.prototype, {
	  constructor: Doc,
	  // Iterate over the document. Supports two forms -- with only one
	  // argument, it calls that for each line in the document. With
	  // three, it iterates over the range given by the first two (with
	  // the second being non-inclusive).
	  iter: function(from, to, op) {
	    if (op) { this.iterN(from - this.first, to - from, op) }
	    else { this.iterN(this.first, this.first + this.size, from) }
	  },
	
	  // Non-public interface for adding and removing lines.
	  insert: function(at, lines) {
	    var height = 0
	    for (var i = 0; i < lines.length; ++i) { height += lines[i].height }
	    this.insertInner(at - this.first, lines, height)
	  },
	  remove: function(at, n) { this.removeInner(at - this.first, n) },
	
	  // From here, the methods are part of the public interface. Most
	  // are also available from CodeMirror (editor) instances.
	
	  getValue: function(lineSep) {
	    var lines = getLines(this, this.first, this.first + this.size)
	    if (lineSep === false) { return lines }
	    return lines.join(lineSep || this.lineSeparator())
	  },
	  setValue: docMethodOp(function(code) {
	    var top = Pos(this.first, 0), last = this.first + this.size - 1
	    makeChange(this, {from: top, to: Pos(last, getLine(this, last).text.length),
	                      text: this.splitLines(code), origin: "setValue", full: true}, true)
	    setSelection(this, simpleSelection(top))
	  }),
	  replaceRange: function(code, from, to, origin) {
	    from = clipPos(this, from)
	    to = to ? clipPos(this, to) : from
	    replaceRange(this, code, from, to, origin)
	  },
	  getRange: function(from, to, lineSep) {
	    var lines = getBetween(this, clipPos(this, from), clipPos(this, to))
	    if (lineSep === false) { return lines }
	    return lines.join(lineSep || this.lineSeparator())
	  },
	
	  getLine: function(line) {var l = this.getLineHandle(line); return l && l.text},
	
	  getLineHandle: function(line) {if (isLine(this, line)) { return getLine(this, line) }},
	  getLineNumber: function(line) {return lineNo(line)},
	
	  getLineHandleVisualStart: function(line) {
	    if (typeof line == "number") { line = getLine(this, line) }
	    return visualLine(line)
	  },
	
	  lineCount: function() {return this.size},
	  firstLine: function() {return this.first},
	  lastLine: function() {return this.first + this.size - 1},
	
	  clipPos: function(pos) {return clipPos(this, pos)},
	
	  getCursor: function(start) {
	    var range = this.sel.primary(), pos
	    if (start == null || start == "head") { pos = range.head }
	    else if (start == "anchor") { pos = range.anchor }
	    else if (start == "end" || start == "to" || start === false) { pos = range.to() }
	    else { pos = range.from() }
	    return pos
	  },
	  listSelections: function() { return this.sel.ranges },
	  somethingSelected: function() {return this.sel.somethingSelected()},
	
	  setCursor: docMethodOp(function(line, ch, options) {
	    setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options)
	  }),
	  setSelection: docMethodOp(function(anchor, head, options) {
	    setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options)
	  }),
	  extendSelection: docMethodOp(function(head, other, options) {
	    extendSelection(this, clipPos(this, head), other && clipPos(this, other), options)
	  }),
	  extendSelections: docMethodOp(function(heads, options) {
	    extendSelections(this, clipPosArray(this, heads), options)
	  }),
	  extendSelectionsBy: docMethodOp(function(f, options) {
	    var heads = map(this.sel.ranges, f)
	    extendSelections(this, clipPosArray(this, heads), options)
	  }),
	  setSelections: docMethodOp(function(ranges, primary, options) {
	    var this$1 = this;
	
	    if (!ranges.length) { return }
	    var out = []
	    for (var i = 0; i < ranges.length; i++)
	      { out[i] = new Range(clipPos(this$1, ranges[i].anchor),
	                         clipPos(this$1, ranges[i].head)) }
	    if (primary == null) { primary = Math.min(ranges.length - 1, this.sel.primIndex) }
	    setSelection(this, normalizeSelection(out, primary), options)
	  }),
	  addSelection: docMethodOp(function(anchor, head, options) {
	    var ranges = this.sel.ranges.slice(0)
	    ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)))
	    setSelection(this, normalizeSelection(ranges, ranges.length - 1), options)
	  }),
	
	  getSelection: function(lineSep) {
	    var this$1 = this;
	
	    var ranges = this.sel.ranges, lines
	    for (var i = 0; i < ranges.length; i++) {
	      var sel = getBetween(this$1, ranges[i].from(), ranges[i].to())
	      lines = lines ? lines.concat(sel) : sel
	    }
	    if (lineSep === false) { return lines }
	    else { return lines.join(lineSep || this.lineSeparator()) }
	  },
	  getSelections: function(lineSep) {
	    var this$1 = this;
	
	    var parts = [], ranges = this.sel.ranges
	    for (var i = 0; i < ranges.length; i++) {
	      var sel = getBetween(this$1, ranges[i].from(), ranges[i].to())
	      if (lineSep !== false) { sel = sel.join(lineSep || this$1.lineSeparator()) }
	      parts[i] = sel
	    }
	    return parts
	  },
	  replaceSelection: function(code, collapse, origin) {
	    var dup = []
	    for (var i = 0; i < this.sel.ranges.length; i++)
	      { dup[i] = code }
	    this.replaceSelections(dup, collapse, origin || "+input")
	  },
	  replaceSelections: docMethodOp(function(code, collapse, origin) {
	    var this$1 = this;
	
	    var changes = [], sel = this.sel
	    for (var i = 0; i < sel.ranges.length; i++) {
	      var range = sel.ranges[i]
	      changes[i] = {from: range.from(), to: range.to(), text: this$1.splitLines(code[i]), origin: origin}
	    }
	    var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse)
	    for (var i$1 = changes.length - 1; i$1 >= 0; i$1--)
	      { makeChange(this$1, changes[i$1]) }
	    if (newSel) { setSelectionReplaceHistory(this, newSel) }
	    else if (this.cm) { ensureCursorVisible(this.cm) }
	  }),
	  undo: docMethodOp(function() {makeChangeFromHistory(this, "undo")}),
	  redo: docMethodOp(function() {makeChangeFromHistory(this, "redo")}),
	  undoSelection: docMethodOp(function() {makeChangeFromHistory(this, "undo", true)}),
	  redoSelection: docMethodOp(function() {makeChangeFromHistory(this, "redo", true)}),
	
	  setExtending: function(val) {this.extend = val},
	  getExtending: function() {return this.extend},
	
	  historySize: function() {
	    var hist = this.history, done = 0, undone = 0
	    for (var i = 0; i < hist.done.length; i++) { if (!hist.done[i].ranges) { ++done } }
	    for (var i$1 = 0; i$1 < hist.undone.length; i$1++) { if (!hist.undone[i$1].ranges) { ++undone } }
	    return {undo: done, redo: undone}
	  },
	  clearHistory: function() {this.history = new History(this.history.maxGeneration)},
	
	  markClean: function() {
	    this.cleanGeneration = this.changeGeneration(true)
	  },
	  changeGeneration: function(forceSplit) {
	    if (forceSplit)
	      { this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null }
	    return this.history.generation
	  },
	  isClean: function (gen) {
	    return this.history.generation == (gen || this.cleanGeneration)
	  },
	
	  getHistory: function() {
	    return {done: copyHistoryArray(this.history.done),
	            undone: copyHistoryArray(this.history.undone)}
	  },
	  setHistory: function(histData) {
	    var hist = this.history = new History(this.history.maxGeneration)
	    hist.done = copyHistoryArray(histData.done.slice(0), null, true)
	    hist.undone = copyHistoryArray(histData.undone.slice(0), null, true)
	  },
	
	  setGutterMarker: docMethodOp(function(line, gutterID, value) {
	    return changeLine(this, line, "gutter", function (line) {
	      var markers = line.gutterMarkers || (line.gutterMarkers = {})
	      markers[gutterID] = value
	      if (!value && isEmpty(markers)) { line.gutterMarkers = null }
	      return true
	    })
	  }),
	
	  clearGutter: docMethodOp(function(gutterID) {
	    var this$1 = this;
	
	    var i = this.first
	    this.iter(function (line) {
	      if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
	        changeLine(this$1, line, "gutter", function () {
	          line.gutterMarkers[gutterID] = null
	          if (isEmpty(line.gutterMarkers)) { line.gutterMarkers = null }
	          return true
	        })
	      }
	      ++i
	    })
	  }),
	
	  lineInfo: function(line) {
	    var n
	    if (typeof line == "number") {
	      if (!isLine(this, line)) { return null }
	      n = line
	      line = getLine(this, line)
	      if (!line) { return null }
	    } else {
	      n = lineNo(line)
	      if (n == null) { return null }
	    }
	    return {line: n, handle: line, text: line.text, gutterMarkers: line.gutterMarkers,
	            textClass: line.textClass, bgClass: line.bgClass, wrapClass: line.wrapClass,
	            widgets: line.widgets}
	  },
	
	  addLineClass: docMethodOp(function(handle, where, cls) {
	    return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
	      var prop = where == "text" ? "textClass"
	               : where == "background" ? "bgClass"
	               : where == "gutter" ? "gutterClass" : "wrapClass"
	      if (!line[prop]) { line[prop] = cls }
	      else if (classTest(cls).test(line[prop])) { return false }
	      else { line[prop] += " " + cls }
	      return true
	    })
	  }),
	  removeLineClass: docMethodOp(function(handle, where, cls) {
	    return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
	      var prop = where == "text" ? "textClass"
	               : where == "background" ? "bgClass"
	               : where == "gutter" ? "gutterClass" : "wrapClass"
	      var cur = line[prop]
	      if (!cur) { return false }
	      else if (cls == null) { line[prop] = null }
	      else {
	        var found = cur.match(classTest(cls))
	        if (!found) { return false }
	        var end = found.index + found[0].length
	        line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null
	      }
	      return true
	    })
	  }),
	
	  addLineWidget: docMethodOp(function(handle, node, options) {
	    return addLineWidget(this, handle, node, options)
	  }),
	  removeLineWidget: function(widget) { widget.clear() },
	
	  markText: function(from, to, options) {
	    return markText(this, clipPos(this, from), clipPos(this, to), options, options && options.type || "range")
	  },
	  setBookmark: function(pos, options) {
	    var realOpts = {replacedWith: options && (options.nodeType == null ? options.widget : options),
	                    insertLeft: options && options.insertLeft,
	                    clearWhenEmpty: false, shared: options && options.shared,
	                    handleMouseEvents: options && options.handleMouseEvents}
	    pos = clipPos(this, pos)
	    return markText(this, pos, pos, realOpts, "bookmark")
	  },
	  findMarksAt: function(pos) {
	    pos = clipPos(this, pos)
	    var markers = [], spans = getLine(this, pos.line).markedSpans
	    if (spans) { for (var i = 0; i < spans.length; ++i) {
	      var span = spans[i]
	      if ((span.from == null || span.from <= pos.ch) &&
	          (span.to == null || span.to >= pos.ch))
	        { markers.push(span.marker.parent || span.marker) }
	    } }
	    return markers
	  },
	  findMarks: function(from, to, filter) {
	    from = clipPos(this, from); to = clipPos(this, to)
	    var found = [], lineNo = from.line
	    this.iter(from.line, to.line + 1, function (line) {
	      var spans = line.markedSpans
	      if (spans) { for (var i = 0; i < spans.length; i++) {
	        var span = spans[i]
	        if (!(span.to != null && lineNo == from.line && from.ch >= span.to ||
	              span.from == null && lineNo != from.line ||
	              span.from != null && lineNo == to.line && span.from >= to.ch) &&
	            (!filter || filter(span.marker)))
	          { found.push(span.marker.parent || span.marker) }
	      } }
	      ++lineNo
	    })
	    return found
	  },
	  getAllMarks: function() {
	    var markers = []
	    this.iter(function (line) {
	      var sps = line.markedSpans
	      if (sps) { for (var i = 0; i < sps.length; ++i)
	        { if (sps[i].from != null) { markers.push(sps[i].marker) } } }
	    })
	    return markers
	  },
	
	  posFromIndex: function(off) {
	    var ch, lineNo = this.first, sepSize = this.lineSeparator().length
	    this.iter(function (line) {
	      var sz = line.text.length + sepSize
	      if (sz > off) { ch = off; return true }
	      off -= sz
	      ++lineNo
	    })
	    return clipPos(this, Pos(lineNo, ch))
	  },
	  indexFromPos: function (coords) {
	    coords = clipPos(this, coords)
	    var index = coords.ch
	    if (coords.line < this.first || coords.ch < 0) { return 0 }
	    var sepSize = this.lineSeparator().length
	    this.iter(this.first, coords.line, function (line) { // iter aborts when callback returns a truthy value
	      index += line.text.length + sepSize
	    })
	    return index
	  },
	
	  copy: function(copyHistory) {
	    var doc = new Doc(getLines(this, this.first, this.first + this.size),
	                      this.modeOption, this.first, this.lineSep)
	    doc.scrollTop = this.scrollTop; doc.scrollLeft = this.scrollLeft
	    doc.sel = this.sel
	    doc.extend = false
	    if (copyHistory) {
	      doc.history.undoDepth = this.history.undoDepth
	      doc.setHistory(this.getHistory())
	    }
	    return doc
	  },
	
	  linkedDoc: function(options) {
	    if (!options) { options = {} }
	    var from = this.first, to = this.first + this.size
	    if (options.from != null && options.from > from) { from = options.from }
	    if (options.to != null && options.to < to) { to = options.to }
	    var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep)
	    if (options.sharedHist) { copy.history = this.history
	    ; }(this.linked || (this.linked = [])).push({doc: copy, sharedHist: options.sharedHist})
	    copy.linked = [{doc: this, isParent: true, sharedHist: options.sharedHist}]
	    copySharedMarkers(copy, findSharedMarkers(this))
	    return copy
	  },
	  unlinkDoc: function(other) {
	    var this$1 = this;
	
	    if (other instanceof CodeMirror) { other = other.doc }
	    if (this.linked) { for (var i = 0; i < this.linked.length; ++i) {
	      var link = this$1.linked[i]
	      if (link.doc != other) { continue }
	      this$1.linked.splice(i, 1)
	      other.unlinkDoc(this$1)
	      detachSharedMarkers(findSharedMarkers(this$1))
	      break
	    } }
	    // If the histories were shared, split them again
	    if (other.history == this.history) {
	      var splitIds = [other.id]
	      linkedDocs(other, function (doc) { return splitIds.push(doc.id); }, true)
	      other.history = new History(null)
	      other.history.done = copyHistoryArray(this.history.done, splitIds)
	      other.history.undone = copyHistoryArray(this.history.undone, splitIds)
	    }
	  },
	  iterLinkedDocs: function(f) {linkedDocs(this, f)},
	
	  getMode: function() {return this.mode},
	  getEditor: function() {return this.cm},
	
	  splitLines: function(str) {
	    if (this.lineSep) { return str.split(this.lineSep) }
	    return splitLinesAuto(str)
	  },
	  lineSeparator: function() { return this.lineSep || "\n" }
	})
	
	// Public alias.
	Doc.prototype.eachLine = Doc.prototype.iter
	
	// Kludge to work around strange IE behavior where it'll sometimes
	// re-fire a series of drag-related events right after the drop (#1551)
	var lastDrop = 0
	
	function onDrop(e) {
	  var cm = this
	  clearDragCursor(cm)
	  if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
	    { return }
	  e_preventDefault(e)
	  if (ie) { lastDrop = +new Date }
	  var pos = posFromMouse(cm, e, true), files = e.dataTransfer.files
	  if (!pos || cm.isReadOnly()) { return }
	  // Might be a file drop, in which case we simply extract the text
	  // and insert it.
	  if (files && files.length && window.FileReader && window.File) {
	    var n = files.length, text = Array(n), read = 0
	    var loadFile = function (file, i) {
	      if (cm.options.allowDropFileTypes &&
	          indexOf(cm.options.allowDropFileTypes, file.type) == -1)
	        { return }
	
	      var reader = new FileReader
	      reader.onload = operation(cm, function () {
	        var content = reader.result
	        if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) { content = "" }
	        text[i] = content
	        if (++read == n) {
	          pos = clipPos(cm.doc, pos)
	          var change = {from: pos, to: pos,
	                        text: cm.doc.splitLines(text.join(cm.doc.lineSeparator())),
	                        origin: "paste"}
	          makeChange(cm.doc, change)
	          setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)))
	        }
	      })
	      reader.readAsText(file)
	    }
	    for (var i = 0; i < n; ++i) { loadFile(files[i], i) }
	  } else { // Normal drop
	    // Don't do a replace if the drop happened inside of the selected text.
	    if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
	      cm.state.draggingText(e)
	      // Ensure the editor is re-focused
	      setTimeout(function () { return cm.display.input.focus(); }, 20)
	      return
	    }
	    try {
	      var text$1 = e.dataTransfer.getData("Text")
	      if (text$1) {
	        var selected
	        if (cm.state.draggingText && !cm.state.draggingText.copy)
	          { selected = cm.listSelections() }
	        setSelectionNoUndo(cm.doc, simpleSelection(pos, pos))
	        if (selected) { for (var i$1 = 0; i$1 < selected.length; ++i$1)
	          { replaceRange(cm.doc, "", selected[i$1].anchor, selected[i$1].head, "drag") } }
	        cm.replaceSelection(text$1, "around", "paste")
	        cm.display.input.focus()
	      }
	    }
	    catch(e){}
	  }
	}
	
	function onDragStart(cm, e) {
	  if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) { e_stop(e); return }
	  if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) { return }
	
	  e.dataTransfer.setData("Text", cm.getSelection())
	  e.dataTransfer.effectAllowed = "copyMove"
	
	  // Use dummy image instead of default browsers image.
	  // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.
	  if (e.dataTransfer.setDragImage && !safari) {
	    var img = elt("img", null, null, "position: fixed; left: 0; top: 0;")
	    img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
	    if (presto) {
	      img.width = img.height = 1
	      cm.display.wrapper.appendChild(img)
	      // Force a relayout, or Opera won't use our image for some obscure reason
	      img._top = img.offsetTop
	    }
	    e.dataTransfer.setDragImage(img, 0, 0)
	    if (presto) { img.parentNode.removeChild(img) }
	  }
	}
	
	function onDragOver(cm, e) {
	  var pos = posFromMouse(cm, e)
	  if (!pos) { return }
	  var frag = document.createDocumentFragment()
	  drawSelectionCursor(cm, pos, frag)
	  if (!cm.display.dragCursor) {
	    cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors")
	    cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv)
	  }
	  removeChildrenAndAdd(cm.display.dragCursor, frag)
	}
	
	function clearDragCursor(cm) {
	  if (cm.display.dragCursor) {
	    cm.display.lineSpace.removeChild(cm.display.dragCursor)
	    cm.display.dragCursor = null
	  }
	}
	
	// These must be handled carefully, because naively registering a
	// handler for each editor will cause the editors to never be
	// garbage collected.
	
	function forEachCodeMirror(f) {
	  if (!document.body.getElementsByClassName) { return }
	  var byClass = document.body.getElementsByClassName("CodeMirror")
	  for (var i = 0; i < byClass.length; i++) {
	    var cm = byClass[i].CodeMirror
	    if (cm) { f(cm) }
	  }
	}
	
	var globalsRegistered = false
	function ensureGlobalHandlers() {
	  if (globalsRegistered) { return }
	  registerGlobalHandlers()
	  globalsRegistered = true
	}
	function registerGlobalHandlers() {
	  // When the window resizes, we need to refresh active editors.
	  var resizeTimer
	  on(window, "resize", function () {
	    if (resizeTimer == null) { resizeTimer = setTimeout(function () {
	      resizeTimer = null
	      forEachCodeMirror(onResize)
	    }, 100) }
	  })
	  // When the window loses focus, we want to show the editor as blurred
	  on(window, "blur", function () { return forEachCodeMirror(onBlur); })
	}
	// Called when the window resizes
	function onResize(cm) {
	  var d = cm.display
	  if (d.lastWrapHeight == d.wrapper.clientHeight && d.lastWrapWidth == d.wrapper.clientWidth)
	    { return }
	  // Might be a text scaling operation, clear size caches.
	  d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null
	  d.scrollbarsClipped = false
	  cm.setSize()
	}
	
	var keyNames = {
	  3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
	  19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
	  36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
	  46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod",
	  106: "*", 107: "=", 109: "-", 110: ".", 111: "/", 127: "Delete",
	  173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
	  221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
	  63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"
	}
	
	// Number keys
	for (var i = 0; i < 10; i++) { keyNames[i + 48] = keyNames[i + 96] = String(i) }
	// Alphabetic keys
	for (var i$1 = 65; i$1 <= 90; i$1++) { keyNames[i$1] = String.fromCharCode(i$1) }
	// Function keys
	for (var i$2 = 1; i$2 <= 12; i$2++) { keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2 }
	
	var keyMap = {}
	
	keyMap.basic = {
	  "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
	  "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
	  "Delete": "delCharAfter", "Backspace": "delCharBefore", "Shift-Backspace": "delCharBefore",
	  "Tab": "defaultTab", "Shift-Tab": "indentAuto",
	  "Enter": "newlineAndIndent", "Insert": "toggleOverwrite",
	  "Esc": "singleSelection"
	}
	// Note that the save and find-related commands aren't defined by
	// default. User code or addons can define them. Unknown commands
	// are simply ignored.
	keyMap.pcDefault = {
	  "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
	  "Ctrl-Home": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Up": "goLineUp", "Ctrl-Down": "goLineDown",
	  "Ctrl-Left": "goGroupLeft", "Ctrl-Right": "goGroupRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
	  "Ctrl-Backspace": "delGroupBefore", "Ctrl-Delete": "delGroupAfter", "Ctrl-S": "save", "Ctrl-F": "find",
	  "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
	  "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
	  "Ctrl-U": "undoSelection", "Shift-Ctrl-U": "redoSelection", "Alt-U": "redoSelection",
	  fallthrough: "basic"
	}
	// Very basic readline/emacs-style bindings, which are standard on Mac.
	keyMap.emacsy = {
	  "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
	  "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
	  "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
	  "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars",
	  "Ctrl-O": "openLine"
	}
	keyMap.macDefault = {
	  "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
	  "Cmd-Home": "goDocStart", "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goGroupLeft",
	  "Alt-Right": "goGroupRight", "Cmd-Left": "goLineLeft", "Cmd-Right": "goLineRight", "Alt-Backspace": "delGroupBefore",
	  "Ctrl-Alt-Backspace": "delGroupAfter", "Alt-Delete": "delGroupAfter", "Cmd-S": "save", "Cmd-F": "find",
	  "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
	  "Cmd-[": "indentLess", "Cmd-]": "indentMore", "Cmd-Backspace": "delWrappedLineLeft", "Cmd-Delete": "delWrappedLineRight",
	  "Cmd-U": "undoSelection", "Shift-Cmd-U": "redoSelection", "Ctrl-Up": "goDocStart", "Ctrl-Down": "goDocEnd",
	  fallthrough: ["basic", "emacsy"]
	}
	keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault
	
	// KEYMAP DISPATCH
	
	function normalizeKeyName(name) {
	  var parts = name.split(/-(?!$)/)
	  name = parts[parts.length - 1]
	  var alt, ctrl, shift, cmd
	  for (var i = 0; i < parts.length - 1; i++) {
	    var mod = parts[i]
	    if (/^(cmd|meta|m)$/i.test(mod)) { cmd = true }
	    else if (/^a(lt)?$/i.test(mod)) { alt = true }
	    else if (/^(c|ctrl|control)$/i.test(mod)) { ctrl = true }
	    else if (/^s(hift)?$/i.test(mod)) { shift = true }
	    else { throw new Error("Unrecognized modifier name: " + mod) }
	  }
	  if (alt) { name = "Alt-" + name }
	  if (ctrl) { name = "Ctrl-" + name }
	  if (cmd) { name = "Cmd-" + name }
	  if (shift) { name = "Shift-" + name }
	  return name
	}
	
	// This is a kludge to keep keymaps mostly working as raw objects
	// (backwards compatibility) while at the same time support features
	// like normalization and multi-stroke key bindings. It compiles a
	// new normalized keymap, and then updates the old object to reflect
	// this.
	function normalizeKeyMap(keymap) {
	  var copy = {}
	  for (var keyname in keymap) { if (keymap.hasOwnProperty(keyname)) {
	    var value = keymap[keyname]
	    if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) { continue }
	    if (value == "...") { delete keymap[keyname]; continue }
	
	    var keys = map(keyname.split(" "), normalizeKeyName)
	    for (var i = 0; i < keys.length; i++) {
	      var val = (void 0), name = (void 0)
	      if (i == keys.length - 1) {
	        name = keys.join(" ")
	        val = value
	      } else {
	        name = keys.slice(0, i + 1).join(" ")
	        val = "..."
	      }
	      var prev = copy[name]
	      if (!prev) { copy[name] = val }
	      else if (prev != val) { throw new Error("Inconsistent bindings for " + name) }
	    }
	    delete keymap[keyname]
	  } }
	  for (var prop in copy) { keymap[prop] = copy[prop] }
	  return keymap
	}
	
	function lookupKey(key, map, handle, context) {
	  map = getKeyMap(map)
	  var found = map.call ? map.call(key, context) : map[key]
	  if (found === false) { return "nothing" }
	  if (found === "...") { return "multi" }
	  if (found != null && handle(found)) { return "handled" }
	
	  if (map.fallthrough) {
	    if (Object.prototype.toString.call(map.fallthrough) != "[object Array]")
	      { return lookupKey(key, map.fallthrough, handle, context) }
	    for (var i = 0; i < map.fallthrough.length; i++) {
	      var result = lookupKey(key, map.fallthrough[i], handle, context)
	      if (result) { return result }
	    }
	  }
	}
	
	// Modifier key presses don't count as 'real' key presses for the
	// purpose of keymap fallthrough.
	function isModifierKey(value) {
	  var name = typeof value == "string" ? value : keyNames[value.keyCode]
	  return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod"
	}
	
	// Look up the name of a key as indicated by an event object.
	function keyName(event, noShift) {
	  if (presto && event.keyCode == 34 && event["char"]) { return false }
	  var base = keyNames[event.keyCode], name = base
	  if (name == null || event.altGraphKey) { return false }
	  if (event.altKey && base != "Alt") { name = "Alt-" + name }
	  if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") { name = "Ctrl-" + name }
	  if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Cmd") { name = "Cmd-" + name }
	  if (!noShift && event.shiftKey && base != "Shift") { name = "Shift-" + name }
	  return name
	}
	
	function getKeyMap(val) {
	  return typeof val == "string" ? keyMap[val] : val
	}
	
	// Helper for deleting text near the selection(s), used to implement
	// backspace, delete, and similar functionality.
	function deleteNearSelection(cm, compute) {
	  var ranges = cm.doc.sel.ranges, kill = []
	  // Build up a set of ranges to kill first, merging overlapping
	  // ranges.
	  for (var i = 0; i < ranges.length; i++) {
	    var toKill = compute(ranges[i])
	    while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
	      var replaced = kill.pop()
	      if (cmp(replaced.from, toKill.from) < 0) {
	        toKill.from = replaced.from
	        break
	      }
	    }
	    kill.push(toKill)
	  }
	  // Next, remove those actual ranges.
	  runInOp(cm, function () {
	    for (var i = kill.length - 1; i >= 0; i--)
	      { replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete") }
	    ensureCursorVisible(cm)
	  })
	}
	
	// Commands are parameter-less actions that can be performed on an
	// editor, mostly used for keybindings.
	var commands = {
	  selectAll: selectAll,
	  singleSelection: function (cm) { return cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll); },
	  killLine: function (cm) { return deleteNearSelection(cm, function (range) {
	    if (range.empty()) {
	      var len = getLine(cm.doc, range.head.line).text.length
	      if (range.head.ch == len && range.head.line < cm.lastLine())
	        { return {from: range.head, to: Pos(range.head.line + 1, 0)} }
	      else
	        { return {from: range.head, to: Pos(range.head.line, len)} }
	    } else {
	      return {from: range.from(), to: range.to()}
	    }
	  }); },
	  deleteLine: function (cm) { return deleteNearSelection(cm, function (range) { return ({
	    from: Pos(range.from().line, 0),
	    to: clipPos(cm.doc, Pos(range.to().line + 1, 0))
	  }); }); },
	  delLineLeft: function (cm) { return deleteNearSelection(cm, function (range) { return ({
	    from: Pos(range.from().line, 0), to: range.from()
	  }); }); },
	  delWrappedLineLeft: function (cm) { return deleteNearSelection(cm, function (range) {
	    var top = cm.charCoords(range.head, "div").top + 5
	    var leftPos = cm.coordsChar({left: 0, top: top}, "div")
	    return {from: leftPos, to: range.from()}
	  }); },
	  delWrappedLineRight: function (cm) { return deleteNearSelection(cm, function (range) {
	    var top = cm.charCoords(range.head, "div").top + 5
	    var rightPos = cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div")
	    return {from: range.from(), to: rightPos }
	  }); },
	  undo: function (cm) { return cm.undo(); },
	  redo: function (cm) { return cm.redo(); },
	  undoSelection: function (cm) { return cm.undoSelection(); },
	  redoSelection: function (cm) { return cm.redoSelection(); },
	  goDocStart: function (cm) { return cm.extendSelection(Pos(cm.firstLine(), 0)); },
	  goDocEnd: function (cm) { return cm.extendSelection(Pos(cm.lastLine())); },
	  goLineStart: function (cm) { return cm.extendSelectionsBy(function (range) { return lineStart(cm, range.head.line); },
	    {origin: "+move", bias: 1}
	  ); },
	  goLineStartSmart: function (cm) { return cm.extendSelectionsBy(function (range) { return lineStartSmart(cm, range.head); },
	    {origin: "+move", bias: 1}
	  ); },
	  goLineEnd: function (cm) { return cm.extendSelectionsBy(function (range) { return lineEnd(cm, range.head.line); },
	    {origin: "+move", bias: -1}
	  ); },
	  goLineRight: function (cm) { return cm.extendSelectionsBy(function (range) {
	    var top = cm.charCoords(range.head, "div").top + 5
	    return cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div")
	  }, sel_move); },
	  goLineLeft: function (cm) { return cm.extendSelectionsBy(function (range) {
	    var top = cm.charCoords(range.head, "div").top + 5
	    return cm.coordsChar({left: 0, top: top}, "div")
	  }, sel_move); },
	  goLineLeftSmart: function (cm) { return cm.extendSelectionsBy(function (range) {
	    var top = cm.charCoords(range.head, "div").top + 5
	    var pos = cm.coordsChar({left: 0, top: top}, "div")
	    if (pos.ch < cm.getLine(pos.line).search(/\S/)) { return lineStartSmart(cm, range.head) }
	    return pos
	  }, sel_move); },
	  goLineUp: function (cm) { return cm.moveV(-1, "line"); },
	  goLineDown: function (cm) { return cm.moveV(1, "line"); },
	  goPageUp: function (cm) { return cm.moveV(-1, "page"); },
	  goPageDown: function (cm) { return cm.moveV(1, "page"); },
	  goCharLeft: function (cm) { return cm.moveH(-1, "char"); },
	  goCharRight: function (cm) { return cm.moveH(1, "char"); },
	  goColumnLeft: function (cm) { return cm.moveH(-1, "column"); },
	  goColumnRight: function (cm) { return cm.moveH(1, "column"); },
	  goWordLeft: function (cm) { return cm.moveH(-1, "word"); },
	  goGroupRight: function (cm) { return cm.moveH(1, "group"); },
	  goGroupLeft: function (cm) { return cm.moveH(-1, "group"); },
	  goWordRight: function (cm) { return cm.moveH(1, "word"); },
	  delCharBefore: function (cm) { return cm.deleteH(-1, "char"); },
	  delCharAfter: function (cm) { return cm.deleteH(1, "char"); },
	  delWordBefore: function (cm) { return cm.deleteH(-1, "word"); },
	  delWordAfter: function (cm) { return cm.deleteH(1, "word"); },
	  delGroupBefore: function (cm) { return cm.deleteH(-1, "group"); },
	  delGroupAfter: function (cm) { return cm.deleteH(1, "group"); },
	  indentAuto: function (cm) { return cm.indentSelection("smart"); },
	  indentMore: function (cm) { return cm.indentSelection("add"); },
	  indentLess: function (cm) { return cm.indentSelection("subtract"); },
	  insertTab: function (cm) { return cm.replaceSelection("\t"); },
	  insertSoftTab: function (cm) {
	    var spaces = [], ranges = cm.listSelections(), tabSize = cm.options.tabSize
	    for (var i = 0; i < ranges.length; i++) {
	      var pos = ranges[i].from()
	      var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize)
	      spaces.push(spaceStr(tabSize - col % tabSize))
	    }
	    cm.replaceSelections(spaces)
	  },
	  defaultTab: function (cm) {
	    if (cm.somethingSelected()) { cm.indentSelection("add") }
	    else { cm.execCommand("insertTab") }
	  },
	  // Swap the two chars left and right of each selection's head.
	  // Move cursor behind the two swapped characters afterwards.
	  //
	  // Doesn't consider line feeds a character.
	  // Doesn't scan more than one line above to find a character.
	  // Doesn't do anything on an empty line.
	  // Doesn't do anything with non-empty selections.
	  transposeChars: function (cm) { return runInOp(cm, function () {
	    var ranges = cm.listSelections(), newSel = []
	    for (var i = 0; i < ranges.length; i++) {
	      if (!ranges[i].empty()) { continue }
	      var cur = ranges[i].head, line = getLine(cm.doc, cur.line).text
	      if (line) {
	        if (cur.ch == line.length) { cur = new Pos(cur.line, cur.ch - 1) }
	        if (cur.ch > 0) {
	          cur = new Pos(cur.line, cur.ch + 1)
	          cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2),
	                          Pos(cur.line, cur.ch - 2), cur, "+transpose")
	        } else if (cur.line > cm.doc.first) {
	          var prev = getLine(cm.doc, cur.line - 1).text
	          if (prev) {
	            cur = new Pos(cur.line, 1)
	            cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() +
	                            prev.charAt(prev.length - 1),
	                            Pos(cur.line - 1, prev.length - 1), cur, "+transpose")
	          }
	        }
	      }
	      newSel.push(new Range(cur, cur))
	    }
	    cm.setSelections(newSel)
	  }); },
	  newlineAndIndent: function (cm) { return runInOp(cm, function () {
	    var sels = cm.listSelections()
	    for (var i = sels.length - 1; i >= 0; i--)
	      { cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input") }
	    sels = cm.listSelections()
	    for (var i$1 = 0; i$1 < sels.length; i$1++)
	      { cm.indentLine(sels[i$1].from().line, null, true) }
	    ensureCursorVisible(cm)
	  }); },
	  openLine: function (cm) { return cm.replaceSelection("\n", "start"); },
	  toggleOverwrite: function (cm) { return cm.toggleOverwrite(); }
	}
	
	
	function lineStart(cm, lineN) {
	  var line = getLine(cm.doc, lineN)
	  var visual = visualLine(line)
	  if (visual != line) { lineN = lineNo(visual) }
	  var order = getOrder(visual)
	  var ch = !order ? 0 : order[0].level % 2 ? lineRight(visual) : lineLeft(visual)
	  return Pos(lineN, ch)
	}
	function lineEnd(cm, lineN) {
	  var merged, line = getLine(cm.doc, lineN)
	  while (merged = collapsedSpanAtEnd(line)) {
	    line = merged.find(1, true).line
	    lineN = null
	  }
	  var order = getOrder(line)
	  var ch = !order ? line.text.length : order[0].level % 2 ? lineLeft(line) : lineRight(line)
	  return Pos(lineN == null ? lineNo(line) : lineN, ch)
	}
	function lineStartSmart(cm, pos) {
	  var start = lineStart(cm, pos.line)
	  var line = getLine(cm.doc, start.line)
	  var order = getOrder(line)
	  if (!order || order[0].level == 0) {
	    var firstNonWS = Math.max(0, line.text.search(/\S/))
	    var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch
	    return Pos(start.line, inWS ? 0 : firstNonWS)
	  }
	  return start
	}
	
	// Run a handler that was bound to a key.
	function doHandleBinding(cm, bound, dropShift) {
	  if (typeof bound == "string") {
	    bound = commands[bound]
	    if (!bound) { return false }
	  }
	  // Ensure previous input has been read, so that the handler sees a
	  // consistent view of the document
	  cm.display.input.ensurePolled()
	  var prevShift = cm.display.shift, done = false
	  try {
	    if (cm.isReadOnly()) { cm.state.suppressEdits = true }
	    if (dropShift) { cm.display.shift = false }
	    done = bound(cm) != Pass
	  } finally {
	    cm.display.shift = prevShift
	    cm.state.suppressEdits = false
	  }
	  return done
	}
	
	function lookupKeyForEditor(cm, name, handle) {
	  for (var i = 0; i < cm.state.keyMaps.length; i++) {
	    var result = lookupKey(name, cm.state.keyMaps[i], handle, cm)
	    if (result) { return result }
	  }
	  return (cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm))
	    || lookupKey(name, cm.options.keyMap, handle, cm)
	}
	
	var stopSeq = new Delayed
	function dispatchKey(cm, name, e, handle) {
	  var seq = cm.state.keySeq
	  if (seq) {
	    if (isModifierKey(name)) { return "handled" }
	    stopSeq.set(50, function () {
	      if (cm.state.keySeq == seq) {
	        cm.state.keySeq = null
	        cm.display.input.reset()
	      }
	    })
	    name = seq + " " + name
	  }
	  var result = lookupKeyForEditor(cm, name, handle)
	
	  if (result == "multi")
	    { cm.state.keySeq = name }
	  if (result == "handled")
	    { signalLater(cm, "keyHandled", cm, name, e) }
	
	  if (result == "handled" || result == "multi") {
	    e_preventDefault(e)
	    restartBlink(cm)
	  }
	
	  if (seq && !result && /\'$/.test(name)) {
	    e_preventDefault(e)
	    return true
	  }
	  return !!result
	}
	
	// Handle a key from the keydown event.
	function handleKeyBinding(cm, e) {
	  var name = keyName(e, true)
	  if (!name) { return false }
	
	  if (e.shiftKey && !cm.state.keySeq) {
	    // First try to resolve full name (including 'Shift-'). Failing
	    // that, see if there is a cursor-motion command (starting with
	    // 'go') bound to the keyname without 'Shift-'.
	    return dispatchKey(cm, "Shift-" + name, e, function (b) { return doHandleBinding(cm, b, true); })
	        || dispatchKey(cm, name, e, function (b) {
	             if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion)
	               { return doHandleBinding(cm, b) }
	           })
	  } else {
	    return dispatchKey(cm, name, e, function (b) { return doHandleBinding(cm, b); })
	  }
	}
	
	// Handle a key from the keypress event
	function handleCharBinding(cm, e, ch) {
	  return dispatchKey(cm, "'" + ch + "'", e, function (b) { return doHandleBinding(cm, b, true); })
	}
	
	var lastStoppedKey = null
	function onKeyDown(e) {
	  var cm = this
	  cm.curOp.focus = activeElt()
	  if (signalDOMEvent(cm, e)) { return }
	  // IE does strange things with escape.
	  if (ie && ie_version < 11 && e.keyCode == 27) { e.returnValue = false }
	  var code = e.keyCode
	  cm.display.shift = code == 16 || e.shiftKey
	  var handled = handleKeyBinding(cm, e)
	  if (presto) {
	    lastStoppedKey = handled ? code : null
	    // Opera has no cut event... we try to at least catch the key combo
	    if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey))
	      { cm.replaceSelection("", null, "cut") }
	  }
	
	  // Turn mouse into crosshair when Alt is held on Mac.
	  if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
	    { showCrossHair(cm) }
	}
	
	function showCrossHair(cm) {
	  var lineDiv = cm.display.lineDiv
	  addClass(lineDiv, "CodeMirror-crosshair")
	
	  function up(e) {
	    if (e.keyCode == 18 || !e.altKey) {
	      rmClass(lineDiv, "CodeMirror-crosshair")
	      off(document, "keyup", up)
	      off(document, "mouseover", up)
	    }
	  }
	  on(document, "keyup", up)
	  on(document, "mouseover", up)
	}
	
	function onKeyUp(e) {
	  if (e.keyCode == 16) { this.doc.sel.shift = false }
	  signalDOMEvent(this, e)
	}
	
	function onKeyPress(e) {
	  var cm = this
	  if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) { return }
	  var keyCode = e.keyCode, charCode = e.charCode
	  if (presto && keyCode == lastStoppedKey) {lastStoppedKey = null; e_preventDefault(e); return}
	  if ((presto && (!e.which || e.which < 10)) && handleKeyBinding(cm, e)) { return }
	  var ch = String.fromCharCode(charCode == null ? keyCode : charCode)
	  // Some browsers fire keypress events for backspace
	  if (ch == "\x08") { return }
	  if (handleCharBinding(cm, e, ch)) { return }
	  cm.display.input.onKeyPress(e)
	}
	
	// A mouse down can be a single click, double click, triple click,
	// start of selection drag, start of text drag, new cursor
	// (ctrl-click), rectangle drag (alt-drag), or xwin
	// middle-click-paste. Or it might be a click on something we should
	// not interfere with, such as a scrollbar or widget.
	function onMouseDown(e) {
	  var cm = this, display = cm.display
	  if (signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch()) { return }
	  display.input.ensurePolled()
	  display.shift = e.shiftKey
	
	  if (eventInWidget(display, e)) {
	    if (!webkit) {
	      // Briefly turn off draggability, to allow widgets to do
	      // normal dragging things.
	      display.scroller.draggable = false
	      setTimeout(function () { return display.scroller.draggable = true; }, 100)
	    }
	    return
	  }
	  if (clickInGutter(cm, e)) { return }
	  var start = posFromMouse(cm, e)
	  window.focus()
	
	  switch (e_button(e)) {
	  case 1:
	    // #3261: make sure, that we're not starting a second selection
	    if (cm.state.selectingText)
	      { cm.state.selectingText(e) }
	    else if (start)
	      { leftButtonDown(cm, e, start) }
	    else if (e_target(e) == display.scroller)
	      { e_preventDefault(e) }
	    break
	  case 2:
	    if (webkit) { cm.state.lastMiddleDown = +new Date }
	    if (start) { extendSelection(cm.doc, start) }
	    setTimeout(function () { return display.input.focus(); }, 20)
	    e_preventDefault(e)
	    break
	  case 3:
	    if (captureRightClick) { onContextMenu(cm, e) }
	    else { delayBlurEvent(cm) }
	    break
	  }
	}
	
	var lastClick;
	var lastDoubleClick;
	function leftButtonDown(cm, e, start) {
	  if (ie) { setTimeout(bind(ensureFocus, cm), 0) }
	  else { cm.curOp.focus = activeElt() }
	
	  var now = +new Date, type
	  if (lastDoubleClick && lastDoubleClick.time > now - 400 && cmp(lastDoubleClick.pos, start) == 0) {
	    type = "triple"
	  } else if (lastClick && lastClick.time > now - 400 && cmp(lastClick.pos, start) == 0) {
	    type = "double"
	    lastDoubleClick = {time: now, pos: start}
	  } else {
	    type = "single"
	    lastClick = {time: now, pos: start}
	  }
	
	  var sel = cm.doc.sel, modifier = mac ? e.metaKey : e.ctrlKey, contained
	  if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() &&
	      type == "single" && (contained = sel.contains(start)) > -1 &&
	      (cmp((contained = sel.ranges[contained]).from(), start) < 0 || start.xRel > 0) &&
	      (cmp(contained.to(), start) > 0 || start.xRel < 0))
	    { leftButtonStartDrag(cm, e, start, modifier) }
	  else
	    { leftButtonSelect(cm, e, start, type, modifier) }
	}
	
	// Start a text drag. When it ends, see if any dragging actually
	// happen, and treat as a click if it didn't.
	function leftButtonStartDrag(cm, e, start, modifier) {
	  var display = cm.display, startTime = +new Date
	  var dragEnd = operation(cm, function (e2) {
	    if (webkit) { display.scroller.draggable = false }
	    cm.state.draggingText = false
	    off(document, "mouseup", dragEnd)
	    off(display.scroller, "drop", dragEnd)
	    if (Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) < 10) {
	      e_preventDefault(e2)
	      if (!modifier && +new Date - 200 < startTime)
	        { extendSelection(cm.doc, start) }
	      // Work around unexplainable focus problem in IE9 (#2127) and Chrome (#3081)
	      if (webkit || ie && ie_version == 9)
	        { setTimeout(function () {document.body.focus(); display.input.focus()}, 20) }
	      else
	        { display.input.focus() }
	    }
	  })
	  // Let the drag handler handle this.
	  if (webkit) { display.scroller.draggable = true }
	  cm.state.draggingText = dragEnd
	  dragEnd.copy = mac ? e.altKey : e.ctrlKey
	  // IE's approach to draggable
	  if (display.scroller.dragDrop) { display.scroller.dragDrop() }
	  on(document, "mouseup", dragEnd)
	  on(display.scroller, "drop", dragEnd)
	}
	
	// Normal selection, as opposed to text dragging.
	function leftButtonSelect(cm, e, start, type, addNew) {
	  var display = cm.display, doc = cm.doc
	  e_preventDefault(e)
	
	  var ourRange, ourIndex, startSel = doc.sel, ranges = startSel.ranges
	  if (addNew && !e.shiftKey) {
	    ourIndex = doc.sel.contains(start)
	    if (ourIndex > -1)
	      { ourRange = ranges[ourIndex] }
	    else
	      { ourRange = new Range(start, start) }
	  } else {
	    ourRange = doc.sel.primary()
	    ourIndex = doc.sel.primIndex
	  }
	
	  if (chromeOS ? e.shiftKey && e.metaKey : e.altKey) {
	    type = "rect"
	    if (!addNew) { ourRange = new Range(start, start) }
	    start = posFromMouse(cm, e, true, true)
	    ourIndex = -1
	  } else if (type == "double") {
	    var word = cm.findWordAt(start)
	    if (cm.display.shift || doc.extend)
	      { ourRange = extendRange(doc, ourRange, word.anchor, word.head) }
	    else
	      { ourRange = word }
	  } else if (type == "triple") {
	    var line = new Range(Pos(start.line, 0), clipPos(doc, Pos(start.line + 1, 0)))
	    if (cm.display.shift || doc.extend)
	      { ourRange = extendRange(doc, ourRange, line.anchor, line.head) }
	    else
	      { ourRange = line }
	  } else {
	    ourRange = extendRange(doc, ourRange, start)
	  }
	
	  if (!addNew) {
	    ourIndex = 0
	    setSelection(doc, new Selection([ourRange], 0), sel_mouse)
	    startSel = doc.sel
	  } else if (ourIndex == -1) {
	    ourIndex = ranges.length
	    setSelection(doc, normalizeSelection(ranges.concat([ourRange]), ourIndex),
	                 {scroll: false, origin: "*mouse"})
	  } else if (ranges.length > 1 && ranges[ourIndex].empty() && type == "single" && !e.shiftKey) {
	    setSelection(doc, normalizeSelection(ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0),
	                 {scroll: false, origin: "*mouse"})
	    startSel = doc.sel
	  } else {
	    replaceOneSelection(doc, ourIndex, ourRange, sel_mouse)
	  }
	
	  var lastPos = start
	  function extendTo(pos) {
	    if (cmp(lastPos, pos) == 0) { return }
	    lastPos = pos
	
	    if (type == "rect") {
	      var ranges = [], tabSize = cm.options.tabSize
	      var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize)
	      var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize)
	      var left = Math.min(startCol, posCol), right = Math.max(startCol, posCol)
	      for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line));
	           line <= end; line++) {
	        var text = getLine(doc, line).text, leftPos = findColumn(text, left, tabSize)
	        if (left == right)
	          { ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos))) }
	        else if (text.length > leftPos)
	          { ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize)))) }
	      }
	      if (!ranges.length) { ranges.push(new Range(start, start)) }
	      setSelection(doc, normalizeSelection(startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex),
	                   {origin: "*mouse", scroll: false})
	      cm.scrollIntoView(pos)
	    } else {
	      var oldRange = ourRange
	      var anchor = oldRange.anchor, head = pos
	      if (type != "single") {
	        var range
	        if (type == "double")
	          { range = cm.findWordAt(pos) }
	        else
	          { range = new Range(Pos(pos.line, 0), clipPos(doc, Pos(pos.line + 1, 0))) }
	        if (cmp(range.anchor, anchor) > 0) {
	          head = range.head
	          anchor = minPos(oldRange.from(), range.anchor)
	        } else {
	          head = range.anchor
	          anchor = maxPos(oldRange.to(), range.head)
	        }
	      }
	      var ranges$1 = startSel.ranges.slice(0)
	      ranges$1[ourIndex] = new Range(clipPos(doc, anchor), head)
	      setSelection(doc, normalizeSelection(ranges$1, ourIndex), sel_mouse)
	    }
	  }
	
	  var editorSize = display.wrapper.getBoundingClientRect()
	  // Used to ensure timeout re-tries don't fire when another extend
	  // happened in the meantime (clearTimeout isn't reliable -- at
	  // least on Chrome, the timeouts still happen even when cleared,
	  // if the clear happens after their scheduled firing time).
	  var counter = 0
	
	  function extend(e) {
	    var curCount = ++counter
	    var cur = posFromMouse(cm, e, true, type == "rect")
	    if (!cur) { return }
	    if (cmp(cur, lastPos) != 0) {
	      cm.curOp.focus = activeElt()
	      extendTo(cur)
	      var visible = visibleLines(display, doc)
	      if (cur.line >= visible.to || cur.line < visible.from)
	        { setTimeout(operation(cm, function () {if (counter == curCount) { extend(e) }}), 150) }
	    } else {
	      var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0
	      if (outside) { setTimeout(operation(cm, function () {
	        if (counter != curCount) { return }
	        display.scroller.scrollTop += outside
	        extend(e)
	      }), 50) }
	    }
	  }
	
	  function done(e) {
	    cm.state.selectingText = false
	    counter = Infinity
	    e_preventDefault(e)
	    display.input.focus()
	    off(document, "mousemove", move)
	    off(document, "mouseup", up)
	    doc.history.lastSelOrigin = null
	  }
	
	  var move = operation(cm, function (e) {
	    if (!e_button(e)) { done(e) }
	    else { extend(e) }
	  })
	  var up = operation(cm, done)
	  cm.state.selectingText = up
	  on(document, "mousemove", move)
	  on(document, "mouseup", up)
	}
	
	
	// Determines whether an event happened in the gutter, and fires the
	// handlers for the corresponding event.
	function gutterEvent(cm, e, type, prevent) {
	  var mX, mY
	  try { mX = e.clientX; mY = e.clientY }
	  catch(e) { return false }
	  if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) { return false }
	  if (prevent) { e_preventDefault(e) }
	
	  var display = cm.display
	  var lineBox = display.lineDiv.getBoundingClientRect()
	
	  if (mY > lineBox.bottom || !hasHandler(cm, type)) { return e_defaultPrevented(e) }
	  mY -= lineBox.top - display.viewOffset
	
	  for (var i = 0; i < cm.options.gutters.length; ++i) {
	    var g = display.gutters.childNodes[i]
	    if (g && g.getBoundingClientRect().right >= mX) {
	      var line = lineAtHeight(cm.doc, mY)
	      var gutter = cm.options.gutters[i]
	      signal(cm, type, cm, line, gutter, e)
	      return e_defaultPrevented(e)
	    }
	  }
	}
	
	function clickInGutter(cm, e) {
	  return gutterEvent(cm, e, "gutterClick", true)
	}
	
	// CONTEXT MENU HANDLING
	
	// To make the context menu work, we need to briefly unhide the
	// textarea (making it as unobtrusive as possible) to let the
	// right-click take effect on it.
	function onContextMenu(cm, e) {
	  if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) { return }
	  if (signalDOMEvent(cm, e, "contextmenu")) { return }
	  cm.display.input.onContextMenu(e)
	}
	
	function contextMenuInGutter(cm, e) {
	  if (!hasHandler(cm, "gutterContextMenu")) { return false }
	  return gutterEvent(cm, e, "gutterContextMenu", false)
	}
	
	function themeChanged(cm) {
	  cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
	    cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-")
	  clearCaches(cm)
	}
	
	var Init = {toString: function(){return "CodeMirror.Init"}}
	
	var defaults = {}
	var optionHandlers = {}
	
	function defineOptions(CodeMirror) {
	  var optionHandlers = CodeMirror.optionHandlers
	
	  function option(name, deflt, handle, notOnInit) {
	    CodeMirror.defaults[name] = deflt
	    if (handle) { optionHandlers[name] =
	      notOnInit ? function (cm, val, old) {if (old != Init) { handle(cm, val, old) }} : handle }
	  }
	
	  CodeMirror.defineOption = option
	
	  // Passed to option handlers when there is no old value.
	  CodeMirror.Init = Init
	
	  // These two are, on init, called from the constructor because they
	  // have to be initialized before the editor can start at all.
	  option("value", "", function (cm, val) { return cm.setValue(val); }, true)
	  option("mode", null, function (cm, val) {
	    cm.doc.modeOption = val
	    loadMode(cm)
	  }, true)
	
	  option("indentUnit", 2, loadMode, true)
	  option("indentWithTabs", false)
	  option("smartIndent", true)
	  option("tabSize", 4, function (cm) {
	    resetModeState(cm)
	    clearCaches(cm)
	    regChange(cm)
	  }, true)
	  option("lineSeparator", null, function (cm, val) {
	    cm.doc.lineSep = val
	    if (!val) { return }
	    var newBreaks = [], lineNo = cm.doc.first
	    cm.doc.iter(function (line) {
	      for (var pos = 0;;) {
	        var found = line.text.indexOf(val, pos)
	        if (found == -1) { break }
	        pos = found + val.length
	        newBreaks.push(Pos(lineNo, found))
	      }
	      lineNo++
	    })
	    for (var i = newBreaks.length - 1; i >= 0; i--)
	      { replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length)) }
	  })
	  option("specialChars", /[\u0000-\u001f\u007f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g, function (cm, val, old) {
	    cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g")
	    if (old != Init) { cm.refresh() }
	  })
	  option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function (cm) { return cm.refresh(); }, true)
	  option("electricChars", true)
	  option("inputStyle", mobile ? "contenteditable" : "textarea", function () {
	    throw new Error("inputStyle can not (yet) be changed in a running editor") // FIXME
	  }, true)
	  option("spellcheck", false, function (cm, val) { return cm.getInputField().spellcheck = val; }, true)
	  option("rtlMoveVisually", !windows)
	  option("wholeLineUpdateBefore", true)
	
	  option("theme", "default", function (cm) {
	    themeChanged(cm)
	    guttersChanged(cm)
	  }, true)
	  option("keyMap", "default", function (cm, val, old) {
	    var next = getKeyMap(val)
	    var prev = old != Init && getKeyMap(old)
	    if (prev && prev.detach) { prev.detach(cm, next) }
	    if (next.attach) { next.attach(cm, prev || null) }
	  })
	  option("extraKeys", null)
	
	  option("lineWrapping", false, wrappingChanged, true)
	  option("gutters", [], function (cm) {
	    setGuttersForLineNumbers(cm.options)
	    guttersChanged(cm)
	  }, true)
	  option("fixedGutter", true, function (cm, val) {
	    cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0"
	    cm.refresh()
	  }, true)
	  option("coverGutterNextToScrollbar", false, function (cm) { return updateScrollbars(cm); }, true)
	  option("scrollbarStyle", "native", function (cm) {
	    initScrollbars(cm)
	    updateScrollbars(cm)
	    cm.display.scrollbars.setScrollTop(cm.doc.scrollTop)
	    cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft)
	  }, true)
	  option("lineNumbers", false, function (cm) {
	    setGuttersForLineNumbers(cm.options)
	    guttersChanged(cm)
	  }, true)
	  option("firstLineNumber", 1, guttersChanged, true)
	  option("lineNumberFormatter", function (integer) { return integer; }, guttersChanged, true)
	  option("showCursorWhenSelecting", false, updateSelection, true)
	
	  option("resetSelectionOnContextMenu", true)
	  option("lineWiseCopyCut", true)
	
	  option("readOnly", false, function (cm, val) {
	    if (val == "nocursor") {
	      onBlur(cm)
	      cm.display.input.blur()
	      cm.display.disabled = true
	    } else {
	      cm.display.disabled = false
	    }
	    cm.display.input.readOnlyChanged(val)
	  })
	  option("disableInput", false, function (cm, val) {if (!val) { cm.display.input.reset() }}, true)
	  option("dragDrop", true, dragDropChanged)
	  option("allowDropFileTypes", null)
	
	  option("cursorBlinkRate", 530)
	  option("cursorScrollMargin", 0)
	  option("cursorHeight", 1, updateSelection, true)
	  option("singleCursorHeightPerLine", true, updateSelection, true)
	  option("workTime", 100)
	  option("workDelay", 100)
	  option("flattenSpans", true, resetModeState, true)
	  option("addModeClass", false, resetModeState, true)
	  option("pollInterval", 100)
	  option("undoDepth", 200, function (cm, val) { return cm.doc.history.undoDepth = val; })
	  option("historyEventDelay", 1250)
	  option("viewportMargin", 10, function (cm) { return cm.refresh(); }, true)
	  option("maxHighlightLength", 10000, resetModeState, true)
	  option("moveInputWithCursor", true, function (cm, val) {
	    if (!val) { cm.display.input.resetPosition() }
	  })
	
	  option("tabindex", null, function (cm, val) { return cm.display.input.getField().tabIndex = val || ""; })
	  option("autofocus", null)
	}
	
	function guttersChanged(cm) {
	  updateGutters(cm)
	  regChange(cm)
	  alignHorizontally(cm)
	}
	
	function dragDropChanged(cm, value, old) {
	  var wasOn = old && old != Init
	  if (!value != !wasOn) {
	    var funcs = cm.display.dragFunctions
	    var toggle = value ? on : off
	    toggle(cm.display.scroller, "dragstart", funcs.start)
	    toggle(cm.display.scroller, "dragenter", funcs.enter)
	    toggle(cm.display.scroller, "dragover", funcs.over)
	    toggle(cm.display.scroller, "dragleave", funcs.leave)
	    toggle(cm.display.scroller, "drop", funcs.drop)
	  }
	}
	
	function wrappingChanged(cm) {
	  if (cm.options.lineWrapping) {
	    addClass(cm.display.wrapper, "CodeMirror-wrap")
	    cm.display.sizer.style.minWidth = ""
	    cm.display.sizerWidth = null
	  } else {
	    rmClass(cm.display.wrapper, "CodeMirror-wrap")
	    findMaxLine(cm)
	  }
	  estimateLineHeights(cm)
	  regChange(cm)
	  clearCaches(cm)
	  setTimeout(function () { return updateScrollbars(cm); }, 100)
	}
	
	// A CodeMirror instance represents an editor. This is the object
	// that user code is usually dealing with.
	
	function CodeMirror(place, options) {
	  var this$1 = this;
	
	  if (!(this instanceof CodeMirror)) { return new CodeMirror(place, options) }
	
	  this.options = options = options ? copyObj(options) : {}
	  // Determine effective options based on given values and defaults.
	  copyObj(defaults, options, false)
	  setGuttersForLineNumbers(options)
	
	  var doc = options.value
	  if (typeof doc == "string") { doc = new Doc(doc, options.mode, null, options.lineSeparator) }
	  this.doc = doc
	
	  var input = new CodeMirror.inputStyles[options.inputStyle](this)
	  var display = this.display = new Display(place, doc, input)
	  display.wrapper.CodeMirror = this
	  updateGutters(this)
	  themeChanged(this)
	  if (options.lineWrapping)
	    { this.display.wrapper.className += " CodeMirror-wrap" }
	  initScrollbars(this)
	
	  this.state = {
	    keyMaps: [],  // stores maps added by addKeyMap
	    overlays: [], // highlighting overlays, as added by addOverlay
	    modeGen: 0,   // bumped when mode/overlay changes, used to invalidate highlighting info
	    overwrite: false,
	    delayingBlurEvent: false,
	    focused: false,
	    suppressEdits: false, // used to disable editing during key handlers when in readOnly mode
	    pasteIncoming: false, cutIncoming: false, // help recognize paste/cut edits in input.poll
	    selectingText: false,
	    draggingText: false,
	    highlight: new Delayed(), // stores highlight worker timeout
	    keySeq: null,  // Unfinished key sequence
	    specialChars: null
	  }
	
	  if (options.autofocus && !mobile) { display.input.focus() }
	
	  // Override magic textarea content restore that IE sometimes does
	  // on our hidden textarea on reload
	  if (ie && ie_version < 11) { setTimeout(function () { return this$1.display.input.reset(true); }, 20) }
	
	  registerEventHandlers(this)
	  ensureGlobalHandlers()
	
	  startOperation(this)
	  this.curOp.forceUpdate = true
	  attachDoc(this, doc)
	
	  if ((options.autofocus && !mobile) || this.hasFocus())
	    { setTimeout(bind(onFocus, this), 20) }
	  else
	    { onBlur(this) }
	
	  for (var opt in optionHandlers) { if (optionHandlers.hasOwnProperty(opt))
	    { optionHandlers[opt](this$1, options[opt], Init) } }
	  maybeUpdateLineNumberWidth(this)
	  if (options.finishInit) { options.finishInit(this) }
	  for (var i = 0; i < initHooks.length; ++i) { initHooks[i](this$1) }
	  endOperation(this)
	  // Suppress optimizelegibility in Webkit, since it breaks text
	  // measuring on line wrapping boundaries.
	  if (webkit && options.lineWrapping &&
	      getComputedStyle(display.lineDiv).textRendering == "optimizelegibility")
	    { display.lineDiv.style.textRendering = "auto" }
	}
	
	// The default configuration options.
	CodeMirror.defaults = defaults
	// Functions to run when options are changed.
	CodeMirror.optionHandlers = optionHandlers
	
	// Attach the necessary event handlers when initializing the editor
	function registerEventHandlers(cm) {
	  var d = cm.display
	  on(d.scroller, "mousedown", operation(cm, onMouseDown))
	  // Older IE's will not fire a second mousedown for a double click
	  if (ie && ie_version < 11)
	    { on(d.scroller, "dblclick", operation(cm, function (e) {
	      if (signalDOMEvent(cm, e)) { return }
	      var pos = posFromMouse(cm, e)
	      if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) { return }
	      e_preventDefault(e)
	      var word = cm.findWordAt(pos)
	      extendSelection(cm.doc, word.anchor, word.head)
	    })) }
	  else
	    { on(d.scroller, "dblclick", function (e) { return signalDOMEvent(cm, e) || e_preventDefault(e); }) }
	  // Some browsers fire contextmenu *after* opening the menu, at
	  // which point we can't mess with it anymore. Context menu is
	  // handled in onMouseDown for these browsers.
	  if (!captureRightClick) { on(d.scroller, "contextmenu", function (e) { return onContextMenu(cm, e); }) }
	
	  // Used to suppress mouse event handling when a touch happens
	  var touchFinished, prevTouch = {end: 0}
	  function finishTouch() {
	    if (d.activeTouch) {
	      touchFinished = setTimeout(function () { return d.activeTouch = null; }, 1000)
	      prevTouch = d.activeTouch
	      prevTouch.end = +new Date
	    }
	  }
	  function isMouseLikeTouchEvent(e) {
	    if (e.touches.length != 1) { return false }
	    var touch = e.touches[0]
	    return touch.radiusX <= 1 && touch.radiusY <= 1
	  }
	  function farAway(touch, other) {
	    if (other.left == null) { return true }
	    var dx = other.left - touch.left, dy = other.top - touch.top
	    return dx * dx + dy * dy > 20 * 20
	  }
	  on(d.scroller, "touchstart", function (e) {
	    if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e)) {
	      d.input.ensurePolled()
	      clearTimeout(touchFinished)
	      var now = +new Date
	      d.activeTouch = {start: now, moved: false,
	                       prev: now - prevTouch.end <= 300 ? prevTouch : null}
	      if (e.touches.length == 1) {
	        d.activeTouch.left = e.touches[0].pageX
	        d.activeTouch.top = e.touches[0].pageY
	      }
	    }
	  })
	  on(d.scroller, "touchmove", function () {
	    if (d.activeTouch) { d.activeTouch.moved = true }
	  })
	  on(d.scroller, "touchend", function (e) {
	    var touch = d.activeTouch
	    if (touch && !eventInWidget(d, e) && touch.left != null &&
	        !touch.moved && new Date - touch.start < 300) {
	      var pos = cm.coordsChar(d.activeTouch, "page"), range
	      if (!touch.prev || farAway(touch, touch.prev)) // Single tap
	        { range = new Range(pos, pos) }
	      else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) // Double tap
	        { range = cm.findWordAt(pos) }
	      else // Triple tap
	        { range = new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0))) }
	      cm.setSelection(range.anchor, range.head)
	      cm.focus()
	      e_preventDefault(e)
	    }
	    finishTouch()
	  })
	  on(d.scroller, "touchcancel", finishTouch)
	
	  // Sync scrolling between fake scrollbars and real scrollable
	  // area, ensure viewport is updated when scrolling.
	  on(d.scroller, "scroll", function () {
	    if (d.scroller.clientHeight) {
	      setScrollTop(cm, d.scroller.scrollTop)
	      setScrollLeft(cm, d.scroller.scrollLeft, true)
	      signal(cm, "scroll", cm)
	    }
	  })
	
	  // Listen to wheel events in order to try and update the viewport on time.
	  on(d.scroller, "mousewheel", function (e) { return onScrollWheel(cm, e); })
	  on(d.scroller, "DOMMouseScroll", function (e) { return onScrollWheel(cm, e); })
	
	  // Prevent wrapper from ever scrolling
	  on(d.wrapper, "scroll", function () { return d.wrapper.scrollTop = d.wrapper.scrollLeft = 0; })
	
	  d.dragFunctions = {
	    enter: function (e) {if (!signalDOMEvent(cm, e)) { e_stop(e) }},
	    over: function (e) {if (!signalDOMEvent(cm, e)) { onDragOver(cm, e); e_stop(e) }},
	    start: function (e) { return onDragStart(cm, e); },
	    drop: operation(cm, onDrop),
	    leave: function (e) {if (!signalDOMEvent(cm, e)) { clearDragCursor(cm) }}
	  }
	
	  var inp = d.input.getField()
	  on(inp, "keyup", function (e) { return onKeyUp.call(cm, e); })
	  on(inp, "keydown", operation(cm, onKeyDown))
	  on(inp, "keypress", operation(cm, onKeyPress))
	  on(inp, "focus", function (e) { return onFocus(cm, e); })
	  on(inp, "blur", function (e) { return onBlur(cm, e); })
	}
	
	var initHooks = []
	CodeMirror.defineInitHook = function (f) { return initHooks.push(f); }
	
	// Indent the given line. The how parameter can be "smart",
	// "add"/null, "subtract", or "prev". When aggressive is false
	// (typically set to true for forced single-line indents), empty
	// lines are not indented, and places where the mode returns Pass
	// are left alone.
	function indentLine(cm, n, how, aggressive) {
	  var doc = cm.doc, state
	  if (how == null) { how = "add" }
	  if (how == "smart") {
	    // Fall back to "prev" when the mode doesn't have an indentation
	    // method.
	    if (!doc.mode.indent) { how = "prev" }
	    else { state = getStateBefore(cm, n) }
	  }
	
	  var tabSize = cm.options.tabSize
	  var line = getLine(doc, n), curSpace = countColumn(line.text, null, tabSize)
	  if (line.stateAfter) { line.stateAfter = null }
	  var curSpaceString = line.text.match(/^\s*/)[0], indentation
	  if (!aggressive && !/\S/.test(line.text)) {
	    indentation = 0
	    how = "not"
	  } else if (how == "smart") {
	    indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text)
	    if (indentation == Pass || indentation > 150) {
	      if (!aggressive) { return }
	      how = "prev"
	    }
	  }
	  if (how == "prev") {
	    if (n > doc.first) { indentation = countColumn(getLine(doc, n-1).text, null, tabSize) }
	    else { indentation = 0 }
	  } else if (how == "add") {
	    indentation = curSpace + cm.options.indentUnit
	  } else if (how == "subtract") {
	    indentation = curSpace - cm.options.indentUnit
	  } else if (typeof how == "number") {
	    indentation = curSpace + how
	  }
	  indentation = Math.max(0, indentation)
	
	  var indentString = "", pos = 0
	  if (cm.options.indentWithTabs)
	    { for (var i = Math.floor(indentation / tabSize); i; --i) {pos += tabSize; indentString += "\t"} }
	  if (pos < indentation) { indentString += spaceStr(indentation - pos) }
	
	  if (indentString != curSpaceString) {
	    replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input")
	    line.stateAfter = null
	    return true
	  } else {
	    // Ensure that, if the cursor was in the whitespace at the start
	    // of the line, it is moved to the end of that space.
	    for (var i$1 = 0; i$1 < doc.sel.ranges.length; i$1++) {
	      var range = doc.sel.ranges[i$1]
	      if (range.head.line == n && range.head.ch < curSpaceString.length) {
	        var pos$1 = Pos(n, curSpaceString.length)
	        replaceOneSelection(doc, i$1, new Range(pos$1, pos$1))
	        break
	      }
	    }
	  }
	}
	
	// This will be set to a {lineWise: bool, text: [string]} object, so
	// that, when pasting, we know what kind of selections the copied
	// text was made out of.
	var lastCopied = null
	
	function setLastCopied(newLastCopied) {
	  lastCopied = newLastCopied
	}
	
	function applyTextInput(cm, inserted, deleted, sel, origin) {
	  var doc = cm.doc
	  cm.display.shift = false
	  if (!sel) { sel = doc.sel }
	
	  var paste = cm.state.pasteIncoming || origin == "paste"
	  var textLines = splitLinesAuto(inserted), multiPaste = null
	  // When pasing N lines into N selections, insert one line per selection
	  if (paste && sel.ranges.length > 1) {
	    if (lastCopied && lastCopied.text.join("\n") == inserted) {
	      if (sel.ranges.length % lastCopied.text.length == 0) {
	        multiPaste = []
	        for (var i = 0; i < lastCopied.text.length; i++)
	          { multiPaste.push(doc.splitLines(lastCopied.text[i])) }
	      }
	    } else if (textLines.length == sel.ranges.length) {
	      multiPaste = map(textLines, function (l) { return [l]; })
	    }
	  }
	
	  var updateInput
	  // Normal behavior is to insert the new text into every selection
	  for (var i$1 = sel.ranges.length - 1; i$1 >= 0; i$1--) {
	    var range = sel.ranges[i$1]
	    var from = range.from(), to = range.to()
	    if (range.empty()) {
	      if (deleted && deleted > 0) // Handle deletion
	        { from = Pos(from.line, from.ch - deleted) }
	      else if (cm.state.overwrite && !paste) // Handle overwrite
	        { to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length)) }
	      else if (lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == inserted)
	        { from = to = Pos(from.line, 0) }
	    }
	    updateInput = cm.curOp.updateInput
	    var changeEvent = {from: from, to: to, text: multiPaste ? multiPaste[i$1 % multiPaste.length] : textLines,
	                       origin: origin || (paste ? "paste" : cm.state.cutIncoming ? "cut" : "+input")}
	    makeChange(cm.doc, changeEvent)
	    signalLater(cm, "inputRead", cm, changeEvent)
	  }
	  if (inserted && !paste)
	    { triggerElectric(cm, inserted) }
	
	  ensureCursorVisible(cm)
	  cm.curOp.updateInput = updateInput
	  cm.curOp.typing = true
	  cm.state.pasteIncoming = cm.state.cutIncoming = false
	}
	
	function handlePaste(e, cm) {
	  var pasted = e.clipboardData && e.clipboardData.getData("Text")
	  if (pasted) {
	    e.preventDefault()
	    if (!cm.isReadOnly() && !cm.options.disableInput)
	      { runInOp(cm, function () { return applyTextInput(cm, pasted, 0, null, "paste"); }) }
	    return true
	  }
	}
	
	function triggerElectric(cm, inserted) {
	  // When an 'electric' character is inserted, immediately trigger a reindent
	  if (!cm.options.electricChars || !cm.options.smartIndent) { return }
	  var sel = cm.doc.sel
	
	  for (var i = sel.ranges.length - 1; i >= 0; i--) {
	    var range = sel.ranges[i]
	    if (range.head.ch > 100 || (i && sel.ranges[i - 1].head.line == range.head.line)) { continue }
	    var mode = cm.getModeAt(range.head)
	    var indented = false
	    if (mode.electricChars) {
	      for (var j = 0; j < mode.electricChars.length; j++)
	        { if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
	          indented = indentLine(cm, range.head.line, "smart")
	          break
	        } }
	    } else if (mode.electricInput) {
	      if (mode.electricInput.test(getLine(cm.doc, range.head.line).text.slice(0, range.head.ch)))
	        { indented = indentLine(cm, range.head.line, "smart") }
	    }
	    if (indented) { signalLater(cm, "electricInput", cm, range.head.line) }
	  }
	}
	
	function copyableRanges(cm) {
	  var text = [], ranges = []
	  for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
	    var line = cm.doc.sel.ranges[i].head.line
	    var lineRange = {anchor: Pos(line, 0), head: Pos(line + 1, 0)}
	    ranges.push(lineRange)
	    text.push(cm.getRange(lineRange.anchor, lineRange.head))
	  }
	  return {text: text, ranges: ranges}
	}
	
	function disableBrowserMagic(field, spellcheck) {
	  field.setAttribute("autocorrect", "off")
	  field.setAttribute("autocapitalize", "off")
	  field.setAttribute("spellcheck", !!spellcheck)
	}
	
	function hiddenTextarea() {
	  var te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none")
	  var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;")
	  // The textarea is kept positioned near the cursor to prevent the
	  // fact that it'll be scrolled into view on input from scrolling
	  // our fake cursor out of view. On webkit, when wrap=off, paste is
	  // very slow. So make the area wide instead.
	  if (webkit) { te.style.width = "1000px" }
	  else { te.setAttribute("wrap", "off") }
	  // If border: 0; -- iOS fails to open keyboard (issue #1287)
	  if (ios) { te.style.border = "1px solid black" }
	  disableBrowserMagic(te)
	  return div
	}
	
	// The publicly visible API. Note that methodOp(f) means
	// 'wrap f in an operation, performed on its `this` parameter'.
	
	// This is not the complete set of editor methods. Most of the
	// methods defined on the Doc type are also injected into
	// CodeMirror.prototype, for backwards compatibility and
	// convenience.
	
	function addEditorMethods(CodeMirror) {
	  var optionHandlers = CodeMirror.optionHandlers
	
	  var helpers = CodeMirror.helpers = {}
	
	  CodeMirror.prototype = {
	    constructor: CodeMirror,
	    focus: function(){window.focus(); this.display.input.focus()},
	
	    setOption: function(option, value) {
	      var options = this.options, old = options[option]
	      if (options[option] == value && option != "mode") { return }
	      options[option] = value
	      if (optionHandlers.hasOwnProperty(option))
	        { operation(this, optionHandlers[option])(this, value, old) }
	      signal(this, "optionChange", this, option)
	    },
	
	    getOption: function(option) {return this.options[option]},
	    getDoc: function() {return this.doc},
	
	    addKeyMap: function(map, bottom) {
	      this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map))
	    },
	    removeKeyMap: function(map) {
	      var maps = this.state.keyMaps
	      for (var i = 0; i < maps.length; ++i)
	        { if (maps[i] == map || maps[i].name == map) {
	          maps.splice(i, 1)
	          return true
	        } }
	    },
	
	    addOverlay: methodOp(function(spec, options) {
	      var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec)
	      if (mode.startState) { throw new Error("Overlays may not be stateful.") }
	      insertSorted(this.state.overlays,
	                   {mode: mode, modeSpec: spec, opaque: options && options.opaque,
	                    priority: (options && options.priority) || 0},
	                   function (overlay) { return overlay.priority; })
	      this.state.modeGen++
	      regChange(this)
	    }),
	    removeOverlay: methodOp(function(spec) {
	      var this$1 = this;
	
	      var overlays = this.state.overlays
	      for (var i = 0; i < overlays.length; ++i) {
	        var cur = overlays[i].modeSpec
	        if (cur == spec || typeof spec == "string" && cur.name == spec) {
	          overlays.splice(i, 1)
	          this$1.state.modeGen++
	          regChange(this$1)
	          return
	        }
	      }
	    }),
	
	    indentLine: methodOp(function(n, dir, aggressive) {
	      if (typeof dir != "string" && typeof dir != "number") {
	        if (dir == null) { dir = this.options.smartIndent ? "smart" : "prev" }
	        else { dir = dir ? "add" : "subtract" }
	      }
	      if (isLine(this.doc, n)) { indentLine(this, n, dir, aggressive) }
	    }),
	    indentSelection: methodOp(function(how) {
	      var this$1 = this;
	
	      var ranges = this.doc.sel.ranges, end = -1
	      for (var i = 0; i < ranges.length; i++) {
	        var range = ranges[i]
	        if (!range.empty()) {
	          var from = range.from(), to = range.to()
	          var start = Math.max(end, from.line)
	          end = Math.min(this$1.lastLine(), to.line - (to.ch ? 0 : 1)) + 1
	          for (var j = start; j < end; ++j)
	            { indentLine(this$1, j, how) }
	          var newRanges = this$1.doc.sel.ranges
	          if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0)
	            { replaceOneSelection(this$1.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll) }
	        } else if (range.head.line > end) {
	          indentLine(this$1, range.head.line, how, true)
	          end = range.head.line
	          if (i == this$1.doc.sel.primIndex) { ensureCursorVisible(this$1) }
	        }
	      }
	    }),
	
	    // Fetch the parser token for a given character. Useful for hacks
	    // that want to inspect the mode state (say, for completion).
	    getTokenAt: function(pos, precise) {
	      return takeToken(this, pos, precise)
	    },
	
	    getLineTokens: function(line, precise) {
	      return takeToken(this, Pos(line), precise, true)
	    },
	
	    getTokenTypeAt: function(pos) {
	      pos = clipPos(this.doc, pos)
	      var styles = getLineStyles(this, getLine(this.doc, pos.line))
	      var before = 0, after = (styles.length - 1) / 2, ch = pos.ch
	      var type
	      if (ch == 0) { type = styles[2] }
	      else { for (;;) {
	        var mid = (before + after) >> 1
	        if ((mid ? styles[mid * 2 - 1] : 0) >= ch) { after = mid }
	        else if (styles[mid * 2 + 1] < ch) { before = mid + 1 }
	        else { type = styles[mid * 2 + 2]; break }
	      } }
	      var cut = type ? type.indexOf("overlay ") : -1
	      return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1)
	    },
	
	    getModeAt: function(pos) {
	      var mode = this.doc.mode
	      if (!mode.innerMode) { return mode }
	      return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode
	    },
	
	    getHelper: function(pos, type) {
	      return this.getHelpers(pos, type)[0]
	    },
	
	    getHelpers: function(pos, type) {
	      var this$1 = this;
	
	      var found = []
	      if (!helpers.hasOwnProperty(type)) { return found }
	      var help = helpers[type], mode = this.getModeAt(pos)
	      if (typeof mode[type] == "string") {
	        if (help[mode[type]]) { found.push(help[mode[type]]) }
	      } else if (mode[type]) {
	        for (var i = 0; i < mode[type].length; i++) {
	          var val = help[mode[type][i]]
	          if (val) { found.push(val) }
	        }
	      } else if (mode.helperType && help[mode.helperType]) {
	        found.push(help[mode.helperType])
	      } else if (help[mode.name]) {
	        found.push(help[mode.name])
	      }
	      for (var i$1 = 0; i$1 < help._global.length; i$1++) {
	        var cur = help._global[i$1]
	        if (cur.pred(mode, this$1) && indexOf(found, cur.val) == -1)
	          { found.push(cur.val) }
	      }
	      return found
	    },
	
	    getStateAfter: function(line, precise) {
	      var doc = this.doc
	      line = clipLine(doc, line == null ? doc.first + doc.size - 1: line)
	      return getStateBefore(this, line + 1, precise)
	    },
	
	    cursorCoords: function(start, mode) {
	      var pos, range = this.doc.sel.primary()
	      if (start == null) { pos = range.head }
	      else if (typeof start == "object") { pos = clipPos(this.doc, start) }
	      else { pos = start ? range.from() : range.to() }
	      return cursorCoords(this, pos, mode || "page")
	    },
	
	    charCoords: function(pos, mode) {
	      return charCoords(this, clipPos(this.doc, pos), mode || "page")
	    },
	
	    coordsChar: function(coords, mode) {
	      coords = fromCoordSystem(this, coords, mode || "page")
	      return coordsChar(this, coords.left, coords.top)
	    },
	
	    lineAtHeight: function(height, mode) {
	      height = fromCoordSystem(this, {top: height, left: 0}, mode || "page").top
	      return lineAtHeight(this.doc, height + this.display.viewOffset)
	    },
	    heightAtLine: function(line, mode, includeWidgets) {
	      var end = false, lineObj
	      if (typeof line == "number") {
	        var last = this.doc.first + this.doc.size - 1
	        if (line < this.doc.first) { line = this.doc.first }
	        else if (line > last) { line = last; end = true }
	        lineObj = getLine(this.doc, line)
	      } else {
	        lineObj = line
	      }
	      return intoCoordSystem(this, lineObj, {top: 0, left: 0}, mode || "page", includeWidgets).top +
	        (end ? this.doc.height - heightAtLine(lineObj) : 0)
	    },
	
	    defaultTextHeight: function() { return textHeight(this.display) },
	    defaultCharWidth: function() { return charWidth(this.display) },
	
	    getViewport: function() { return {from: this.display.viewFrom, to: this.display.viewTo}},
	
	    addWidget: function(pos, node, scroll, vert, horiz) {
	      var display = this.display
	      pos = cursorCoords(this, clipPos(this.doc, pos))
	      var top = pos.bottom, left = pos.left
	      node.style.position = "absolute"
	      node.setAttribute("cm-ignore-events", "true")
	      this.display.input.setUneditable(node)
	      display.sizer.appendChild(node)
	      if (vert == "over") {
	        top = pos.top
	      } else if (vert == "above" || vert == "near") {
	        var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
	        hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth)
	        // Default to positioning above (if specified and possible); otherwise default to positioning below
	        if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight)
	          { top = pos.top - node.offsetHeight }
	        else if (pos.bottom + node.offsetHeight <= vspace)
	          { top = pos.bottom }
	        if (left + node.offsetWidth > hspace)
	          { left = hspace - node.offsetWidth }
	      }
	      node.style.top = top + "px"
	      node.style.left = node.style.right = ""
	      if (horiz == "right") {
	        left = display.sizer.clientWidth - node.offsetWidth
	        node.style.right = "0px"
	      } else {
	        if (horiz == "left") { left = 0 }
	        else if (horiz == "middle") { left = (display.sizer.clientWidth - node.offsetWidth) / 2 }
	        node.style.left = left + "px"
	      }
	      if (scroll)
	        { scrollIntoView(this, left, top, left + node.offsetWidth, top + node.offsetHeight) }
	    },
	
	    triggerOnKeyDown: methodOp(onKeyDown),
	    triggerOnKeyPress: methodOp(onKeyPress),
	    triggerOnKeyUp: onKeyUp,
	
	    execCommand: function(cmd) {
	      if (commands.hasOwnProperty(cmd))
	        { return commands[cmd].call(null, this) }
	    },
	
	    triggerElectric: methodOp(function(text) { triggerElectric(this, text) }),
	
	    findPosH: function(from, amount, unit, visually) {
	      var this$1 = this;
	
	      var dir = 1
	      if (amount < 0) { dir = -1; amount = -amount }
	      var cur = clipPos(this.doc, from)
	      for (var i = 0; i < amount; ++i) {
	        cur = findPosH(this$1.doc, cur, dir, unit, visually)
	        if (cur.hitSide) { break }
	      }
	      return cur
	    },
	
	    moveH: methodOp(function(dir, unit) {
	      var this$1 = this;
	
	      this.extendSelectionsBy(function (range) {
	        if (this$1.display.shift || this$1.doc.extend || range.empty())
	          { return findPosH(this$1.doc, range.head, dir, unit, this$1.options.rtlMoveVisually) }
	        else
	          { return dir < 0 ? range.from() : range.to() }
	      }, sel_move)
	    }),
	
	    deleteH: methodOp(function(dir, unit) {
	      var sel = this.doc.sel, doc = this.doc
	      if (sel.somethingSelected())
	        { doc.replaceSelection("", null, "+delete") }
	      else
	        { deleteNearSelection(this, function (range) {
	          var other = findPosH(doc, range.head, dir, unit, false)
	          return dir < 0 ? {from: other, to: range.head} : {from: range.head, to: other}
	        }) }
	    }),
	
	    findPosV: function(from, amount, unit, goalColumn) {
	      var this$1 = this;
	
	      var dir = 1, x = goalColumn
	      if (amount < 0) { dir = -1; amount = -amount }
	      var cur = clipPos(this.doc, from)
	      for (var i = 0; i < amount; ++i) {
	        var coords = cursorCoords(this$1, cur, "div")
	        if (x == null) { x = coords.left }
	        else { coords.left = x }
	        cur = findPosV(this$1, coords, dir, unit)
	        if (cur.hitSide) { break }
	      }
	      return cur
	    },
	
	    moveV: methodOp(function(dir, unit) {
	      var this$1 = this;
	
	      var doc = this.doc, goals = []
	      var collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected()
	      doc.extendSelectionsBy(function (range) {
	        if (collapse)
	          { return dir < 0 ? range.from() : range.to() }
	        var headPos = cursorCoords(this$1, range.head, "div")
	        if (range.goalColumn != null) { headPos.left = range.goalColumn }
	        goals.push(headPos.left)
	        var pos = findPosV(this$1, headPos, dir, unit)
	        if (unit == "page" && range == doc.sel.primary())
	          { addToScrollPos(this$1, null, charCoords(this$1, pos, "div").top - headPos.top) }
	        return pos
	      }, sel_move)
	      if (goals.length) { for (var i = 0; i < doc.sel.ranges.length; i++)
	        { doc.sel.ranges[i].goalColumn = goals[i] } }
	    }),
	
	    // Find the word at the given position (as returned by coordsChar).
	    findWordAt: function(pos) {
	      var doc = this.doc, line = getLine(doc, pos.line).text
	      var start = pos.ch, end = pos.ch
	      if (line) {
	        var helper = this.getHelper(pos, "wordChars")
	        if ((pos.xRel < 0 || end == line.length) && start) { --start; } else { ++end }
	        var startChar = line.charAt(start)
	        var check = isWordChar(startChar, helper)
	          ? function (ch) { return isWordChar(ch, helper); }
	          : /\s/.test(startChar) ? function (ch) { return /\s/.test(ch); }
	          : function (ch) { return (!/\s/.test(ch) && !isWordChar(ch)); }
	        while (start > 0 && check(line.charAt(start - 1))) { --start }
	        while (end < line.length && check(line.charAt(end))) { ++end }
	      }
	      return new Range(Pos(pos.line, start), Pos(pos.line, end))
	    },
	
	    toggleOverwrite: function(value) {
	      if (value != null && value == this.state.overwrite) { return }
	      if (this.state.overwrite = !this.state.overwrite)
	        { addClass(this.display.cursorDiv, "CodeMirror-overwrite") }
	      else
	        { rmClass(this.display.cursorDiv, "CodeMirror-overwrite") }
	
	      signal(this, "overwriteToggle", this, this.state.overwrite)
	    },
	    hasFocus: function() { return this.display.input.getField() == activeElt() },
	    isReadOnly: function() { return !!(this.options.readOnly || this.doc.cantEdit) },
	
	    scrollTo: methodOp(function(x, y) {
	      if (x != null || y != null) { resolveScrollToPos(this) }
	      if (x != null) { this.curOp.scrollLeft = x }
	      if (y != null) { this.curOp.scrollTop = y }
	    }),
	    getScrollInfo: function() {
	      var scroller = this.display.scroller
	      return {left: scroller.scrollLeft, top: scroller.scrollTop,
	              height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
	              width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
	              clientHeight: displayHeight(this), clientWidth: displayWidth(this)}
	    },
	
	    scrollIntoView: methodOp(function(range, margin) {
	      if (range == null) {
	        range = {from: this.doc.sel.primary().head, to: null}
	        if (margin == null) { margin = this.options.cursorScrollMargin }
	      } else if (typeof range == "number") {
	        range = {from: Pos(range, 0), to: null}
	      } else if (range.from == null) {
	        range = {from: range, to: null}
	      }
	      if (!range.to) { range.to = range.from }
	      range.margin = margin || 0
	
	      if (range.from.line != null) {
	        resolveScrollToPos(this)
	        this.curOp.scrollToPos = range
	      } else {
	        var sPos = calculateScrollPos(this, Math.min(range.from.left, range.to.left),
	                                      Math.min(range.from.top, range.to.top) - range.margin,
	                                      Math.max(range.from.right, range.to.right),
	                                      Math.max(range.from.bottom, range.to.bottom) + range.margin)
	        this.scrollTo(sPos.scrollLeft, sPos.scrollTop)
	      }
	    }),
	
	    setSize: methodOp(function(width, height) {
	      var this$1 = this;
	
	      var interpret = function (val) { return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val; }
	      if (width != null) { this.display.wrapper.style.width = interpret(width) }
	      if (height != null) { this.display.wrapper.style.height = interpret(height) }
	      if (this.options.lineWrapping) { clearLineMeasurementCache(this) }
	      var lineNo = this.display.viewFrom
	      this.doc.iter(lineNo, this.display.viewTo, function (line) {
	        if (line.widgets) { for (var i = 0; i < line.widgets.length; i++)
	          { if (line.widgets[i].noHScroll) { regLineChange(this$1, lineNo, "widget"); break } } }
	        ++lineNo
	      })
	      this.curOp.forceUpdate = true
	      signal(this, "refresh", this)
	    }),
	
	    operation: function(f){return runInOp(this, f)},
	
	    refresh: methodOp(function() {
	      var oldHeight = this.display.cachedTextHeight
	      regChange(this)
	      this.curOp.forceUpdate = true
	      clearCaches(this)
	      this.scrollTo(this.doc.scrollLeft, this.doc.scrollTop)
	      updateGutterSpace(this)
	      if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5)
	        { estimateLineHeights(this) }
	      signal(this, "refresh", this)
	    }),
	
	    swapDoc: methodOp(function(doc) {
	      var old = this.doc
	      old.cm = null
	      attachDoc(this, doc)
	      clearCaches(this)
	      this.display.input.reset()
	      this.scrollTo(doc.scrollLeft, doc.scrollTop)
	      this.curOp.forceScroll = true
	      signalLater(this, "swapDoc", this, old)
	      return old
	    }),
	
	    getInputField: function(){return this.display.input.getField()},
	    getWrapperElement: function(){return this.display.wrapper},
	    getScrollerElement: function(){return this.display.scroller},
	    getGutterElement: function(){return this.display.gutters}
	  }
	  eventMixin(CodeMirror)
	
	  CodeMirror.registerHelper = function(type, name, value) {
	    if (!helpers.hasOwnProperty(type)) { helpers[type] = CodeMirror[type] = {_global: []} }
	    helpers[type][name] = value
	  }
	  CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
	    CodeMirror.registerHelper(type, name, value)
	    helpers[type]._global.push({pred: predicate, val: value})
	  }
	}
	
	// Used for horizontal relative motion. Dir is -1 or 1 (left or
	// right), unit can be "char", "column" (like char, but doesn't
	// cross line boundaries), "word" (across next word), or "group" (to
	// the start of next group of word or non-word-non-whitespace
	// chars). The visually param controls whether, in right-to-left
	// text, direction 1 means to move towards the next index in the
	// string, or towards the character to the right of the current
	// position. The resulting position will have a hitSide=true
	// property if it reached the end of the document.
	function findPosH(doc, pos, dir, unit, visually) {
	  var line = pos.line, ch = pos.ch, origDir = dir
	  var lineObj = getLine(doc, line)
	  function findNextLine() {
	    var l = line + dir
	    if (l < doc.first || l >= doc.first + doc.size) { return false }
	    line = l
	    return lineObj = getLine(doc, l)
	  }
	  function moveOnce(boundToLine) {
	    var next = (visually ? moveVisually : moveLogically)(lineObj, ch, dir, true)
	    if (next == null) {
	      if (!boundToLine && findNextLine()) {
	        if (visually) { ch = (dir < 0 ? lineRight : lineLeft)(lineObj) }
	        else { ch = dir < 0 ? lineObj.text.length : 0 }
	      } else { return false }
	    } else { ch = next }
	    return true
	  }
	
	  if (unit == "char") {
	    moveOnce()
	  } else if (unit == "column") {
	    moveOnce(true)
	  } else if (unit == "word" || unit == "group") {
	    var sawType = null, group = unit == "group"
	    var helper = doc.cm && doc.cm.getHelper(pos, "wordChars")
	    for (var first = true;; first = false) {
	      if (dir < 0 && !moveOnce(!first)) { break }
	      var cur = lineObj.text.charAt(ch) || "\n"
	      var type = isWordChar(cur, helper) ? "w"
	        : group && cur == "\n" ? "n"
	        : !group || /\s/.test(cur) ? null
	        : "p"
	      if (group && !first && !type) { type = "s" }
	      if (sawType && sawType != type) {
	        if (dir < 0) {dir = 1; moveOnce()}
	        break
	      }
	
	      if (type) { sawType = type }
	      if (dir > 0 && !moveOnce(!first)) { break }
	    }
	  }
	  var result = skipAtomic(doc, Pos(line, ch), pos, origDir, true)
	  if (!cmp(pos, result)) { result.hitSide = true }
	  return result
	}
	
	// For relative vertical movement. Dir may be -1 or 1. Unit can be
	// "page" or "line". The resulting position will have a hitSide=true
	// property if it reached the end of the document.
	function findPosV(cm, pos, dir, unit) {
	  var doc = cm.doc, x = pos.left, y
	  if (unit == "page") {
	    var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight)
	    var moveAmount = Math.max(pageSize - .5 * textHeight(cm.display), 3)
	    y = (dir > 0 ? pos.bottom : pos.top) + dir * moveAmount
	
	  } else if (unit == "line") {
	    y = dir > 0 ? pos.bottom + 3 : pos.top - 3
	  }
	  var target
	  for (;;) {
	    target = coordsChar(cm, x, y)
	    if (!target.outside) { break }
	    if (dir < 0 ? y <= 0 : y >= doc.height) { target.hitSide = true; break }
	    y += dir * 5
	  }
	  return target
	}
	
	// CONTENTEDITABLE INPUT STYLE
	
	var ContentEditableInput = function(cm) {
	  this.cm = cm
	  this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null
	  this.polling = new Delayed()
	  this.composing = null
	  this.gracePeriod = false
	  this.readDOMTimeout = null
	};
	
	ContentEditableInput.prototype.init = function (display) {
	    var this$1 = this;
	
	  var input = this, cm = input.cm
	  var div = input.div = display.lineDiv
	  disableBrowserMagic(div, cm.options.spellcheck)
	
	  on(div, "paste", function (e) {
	    if (signalDOMEvent(cm, e) || handlePaste(e, cm)) { return }
	    // IE doesn't fire input events, so we schedule a read for the pasted content in this way
	    if (ie_version <= 11) { setTimeout(operation(cm, function () {
	      if (!input.pollContent()) { regChange(cm) }
	    }), 20) }
	  })
	
	  on(div, "compositionstart", function (e) {
	    this$1.composing = {data: e.data, done: false}
	  })
	  on(div, "compositionupdate", function (e) {
	    if (!this$1.composing) { this$1.composing = {data: e.data, done: false} }
	  })
	  on(div, "compositionend", function (e) {
	    if (this$1.composing) {
	      if (e.data != this$1.composing.data) { this$1.readFromDOMSoon() }
	      this$1.composing.done = true
	    }
	  })
	
	  on(div, "touchstart", function () { return input.forceCompositionEnd(); })
	
	  on(div, "input", function () {
	    if (!this$1.composing) { this$1.readFromDOMSoon() }
	  })
	
	  function onCopyCut(e) {
	    if (signalDOMEvent(cm, e)) { return }
	    if (cm.somethingSelected()) {
	      setLastCopied({lineWise: false, text: cm.getSelections()})
	      if (e.type == "cut") { cm.replaceSelection("", null, "cut") }
	    } else if (!cm.options.lineWiseCopyCut) {
	      return
	    } else {
	      var ranges = copyableRanges(cm)
	      setLastCopied({lineWise: true, text: ranges.text})
	      if (e.type == "cut") {
	        cm.operation(function () {
	          cm.setSelections(ranges.ranges, 0, sel_dontScroll)
	          cm.replaceSelection("", null, "cut")
	        })
	      }
	    }
	    if (e.clipboardData) {
	      e.clipboardData.clearData()
	      var content = lastCopied.text.join("\n")
	      // iOS exposes the clipboard API, but seems to discard content inserted into it
	      e.clipboardData.setData("Text", content)
	      if (e.clipboardData.getData("Text") == content) {
	        e.preventDefault()
	        return
	      }
	    }
	    // Old-fashioned briefly-focus-a-textarea hack
	    var kludge = hiddenTextarea(), te = kludge.firstChild
	    cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild)
	    te.value = lastCopied.text.join("\n")
	    var hadFocus = document.activeElement
	    selectInput(te)
	    setTimeout(function () {
	      cm.display.lineSpace.removeChild(kludge)
	      hadFocus.focus()
	      if (hadFocus == div) { input.showPrimarySelection() }
	    }, 50)
	  }
	  on(div, "copy", onCopyCut)
	  on(div, "cut", onCopyCut)
	};
	
	ContentEditableInput.prototype.prepareSelection = function () {
	  var result = prepareSelection(this.cm, false)
	  result.focus = this.cm.state.focused
	  return result
	};
	
	ContentEditableInput.prototype.showSelection = function (info, takeFocus) {
	  if (!info || !this.cm.display.view.length) { return }
	  if (info.focus || takeFocus) { this.showPrimarySelection() }
	  this.showMultipleSelections(info)
	};
	
	ContentEditableInput.prototype.showPrimarySelection = function () {
	  var sel = window.getSelection(), prim = this.cm.doc.sel.primary()
	  var curAnchor = domToPos(this.cm, sel.anchorNode, sel.anchorOffset)
	  var curFocus = domToPos(this.cm, sel.focusNode, sel.focusOffset)
	  if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad &&
	      cmp(minPos(curAnchor, curFocus), prim.from()) == 0 &&
	      cmp(maxPos(curAnchor, curFocus), prim.to()) == 0)
	    { return }
	
	  var start = posToDOM(this.cm, prim.from())
	  var end = posToDOM(this.cm, prim.to())
	  if (!start && !end) { return }
	
	  var view = this.cm.display.view
	  var old = sel.rangeCount && sel.getRangeAt(0)
	  if (!start) {
	    start = {node: view[0].measure.map[2], offset: 0}
	  } else if (!end) { // FIXME dangerously hacky
	    var measure = view[view.length - 1].measure
	    var map = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map
	    end = {node: map[map.length - 1], offset: map[map.length - 2] - map[map.length - 3]}
	  }
	
	  var rng
	  try { rng = range(start.node, start.offset, end.offset, end.node) }
	  catch(e) {} // Our model of the DOM might be outdated, in which case the range we try to set can be impossible
	  if (rng) {
	    if (!gecko && this.cm.state.focused) {
	      sel.collapse(start.node, start.offset)
	      if (!rng.collapsed) {
	        sel.removeAllRanges()
	        sel.addRange(rng)
	      }
	    } else {
	      sel.removeAllRanges()
	      sel.addRange(rng)
	    }
	    if (old && sel.anchorNode == null) { sel.addRange(old) }
	    else if (gecko) { this.startGracePeriod() }
	  }
	  this.rememberSelection()
	};
	
	ContentEditableInput.prototype.startGracePeriod = function () {
	    var this$1 = this;
	
	  clearTimeout(this.gracePeriod)
	  this.gracePeriod = setTimeout(function () {
	    this$1.gracePeriod = false
	    if (this$1.selectionChanged())
	      { this$1.cm.operation(function () { return this$1.cm.curOp.selectionChanged = true; }) }
	  }, 20)
	};
	
	ContentEditableInput.prototype.showMultipleSelections = function (info) {
	  removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors)
	  removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection)
	};
	
	ContentEditableInput.prototype.rememberSelection = function () {
	  var sel = window.getSelection()
	  this.lastAnchorNode = sel.anchorNode; this.lastAnchorOffset = sel.anchorOffset
	  this.lastFocusNode = sel.focusNode; this.lastFocusOffset = sel.focusOffset
	};
	
	ContentEditableInput.prototype.selectionInEditor = function () {
	  var sel = window.getSelection()
	  if (!sel.rangeCount) { return false }
	  var node = sel.getRangeAt(0).commonAncestorContainer
	  return contains(this.div, node)
	};
	
	ContentEditableInput.prototype.focus = function () {
	  if (this.cm.options.readOnly != "nocursor") {
	    if (!this.selectionInEditor())
	      { this.showSelection(this.prepareSelection(), true) }
	    this.div.focus()
	  }
	};
	ContentEditableInput.prototype.blur = function () { this.div.blur() };
	ContentEditableInput.prototype.getField = function () { return this.div };
	
	ContentEditableInput.prototype.supportsTouch = function () { return true };
	
	ContentEditableInput.prototype.receivedFocus = function () {
	  var input = this
	  if (this.selectionInEditor())
	    { this.pollSelection() }
	  else
	    { runInOp(this.cm, function () { return input.cm.curOp.selectionChanged = true; }) }
	
	  function poll() {
	    if (input.cm.state.focused) {
	      input.pollSelection()
	      input.polling.set(input.cm.options.pollInterval, poll)
	    }
	  }
	  this.polling.set(this.cm.options.pollInterval, poll)
	};
	
	ContentEditableInput.prototype.selectionChanged = function () {
	  var sel = window.getSelection()
	  return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset ||
	    sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset
	};
	
	ContentEditableInput.prototype.pollSelection = function () {
	  if (!this.composing && this.readDOMTimeout == null && !this.gracePeriod && this.selectionChanged()) {
	    var sel = window.getSelection(), cm = this.cm
	    this.rememberSelection()
	    var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset)
	    var head = domToPos(cm, sel.focusNode, sel.focusOffset)
	    if (anchor && head) { runInOp(cm, function () {
	      setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll)
	      if (anchor.bad || head.bad) { cm.curOp.selectionChanged = true }
	    }) }
	  }
	};
	
	ContentEditableInput.prototype.pollContent = function () {
	  if (this.readDOMTimeout != null) {
	    clearTimeout(this.readDOMTimeout)
	    this.readDOMTimeout = null
	  }
	
	  var cm = this.cm, display = cm.display, sel = cm.doc.sel.primary()
	  var from = sel.from(), to = sel.to()
	  if (from.ch == 0 && from.line > cm.firstLine())
	    { from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length) }
	  if (to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine())
	    { to = Pos(to.line + 1, 0) }
	  if (from.line < display.viewFrom || to.line > display.viewTo - 1) { return false }
	
	  var fromIndex, fromLine, fromNode
	  if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
	    fromLine = lineNo(display.view[0].line)
	    fromNode = display.view[0].node
	  } else {
	    fromLine = lineNo(display.view[fromIndex].line)
	    fromNode = display.view[fromIndex - 1].node.nextSibling
	  }
	  var toIndex = findViewIndex(cm, to.line)
	  var toLine, toNode
	  if (toIndex == display.view.length - 1) {
	    toLine = display.viewTo - 1
	    toNode = display.lineDiv.lastChild
	  } else {
	    toLine = lineNo(display.view[toIndex + 1].line) - 1
	    toNode = display.view[toIndex + 1].node.previousSibling
	  }
	
	  if (!fromNode) { return false }
	  var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine))
	  var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length))
	  while (newText.length > 1 && oldText.length > 1) {
	    if (lst(newText) == lst(oldText)) { newText.pop(); oldText.pop(); toLine-- }
	    else if (newText[0] == oldText[0]) { newText.shift(); oldText.shift(); fromLine++ }
	    else { break }
	  }
	
	  var cutFront = 0, cutEnd = 0
	  var newTop = newText[0], oldTop = oldText[0], maxCutFront = Math.min(newTop.length, oldTop.length)
	  while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront))
	    { ++cutFront }
	  var newBot = lst(newText), oldBot = lst(oldText)
	  var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0),
	                           oldBot.length - (oldText.length == 1 ? cutFront : 0))
	  while (cutEnd < maxCutEnd &&
	         newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1))
	    { ++cutEnd }
	
	  newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, "")
	  newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "")
	
	  var chFrom = Pos(fromLine, cutFront)
	  var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0)
	  if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
	    replaceRange(cm.doc, newText, chFrom, chTo, "+input")
	    return true
	  }
	};
	
	ContentEditableInput.prototype.ensurePolled = function () {
	  this.forceCompositionEnd()
	};
	ContentEditableInput.prototype.reset = function () {
	  this.forceCompositionEnd()
	};
	ContentEditableInput.prototype.forceCompositionEnd = function () {
	  if (!this.composing) { return }
	  clearTimeout(this.readDOMTimeout)
	  this.composing = null
	  if (!this.pollContent()) { regChange(this.cm) }
	  this.div.blur()
	  this.div.focus()
	};
	ContentEditableInput.prototype.readFromDOMSoon = function () {
	    var this$1 = this;
	
	  if (this.readDOMTimeout != null) { return }
	  this.readDOMTimeout = setTimeout(function () {
	    this$1.readDOMTimeout = null
	    if (this$1.composing) {
	      if (this$1.composing.done) { this$1.composing = null }
	      else { return }
	    }
	    if (this$1.cm.isReadOnly() || !this$1.pollContent())
	      { runInOp(this$1.cm, function () { return regChange(this$1.cm); }) }
	  }, 80)
	};
	
	ContentEditableInput.prototype.setUneditable = function (node) {
	  node.contentEditable = "false"
	};
	
	ContentEditableInput.prototype.onKeyPress = function (e) {
	  e.preventDefault()
	  if (!this.cm.isReadOnly())
	    { operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0) }
	};
	
	ContentEditableInput.prototype.readOnlyChanged = function (val) {
	  this.div.contentEditable = String(val != "nocursor")
	};
	
	ContentEditableInput.prototype.onContextMenu = function () {};
	ContentEditableInput.prototype.resetPosition = function () {};
	
	ContentEditableInput.prototype.needsContentAttribute = true
	
	function posToDOM(cm, pos) {
	  var view = findViewForLine(cm, pos.line)
	  if (!view || view.hidden) { return null }
	  var line = getLine(cm.doc, pos.line)
	  var info = mapFromLineView(view, line, pos.line)
	
	  var order = getOrder(line), side = "left"
	  if (order) {
	    var partPos = getBidiPartAt(order, pos.ch)
	    side = partPos % 2 ? "right" : "left"
	  }
	  var result = nodeAndOffsetInLineMap(info.map, pos.ch, side)
	  result.offset = result.collapse == "right" ? result.end : result.start
	  return result
	}
	
	function badPos(pos, bad) { if (bad) { pos.bad = true; } return pos }
	
	function domTextBetween(cm, from, to, fromLine, toLine) {
	  var text = "", closing = false, lineSep = cm.doc.lineSeparator()
	  function recognizeMarker(id) { return function (marker) { return marker.id == id; } }
	  function walk(node) {
	    if (node.nodeType == 1) {
	      var cmText = node.getAttribute("cm-text")
	      if (cmText != null) {
	        if (cmText == "") { text += node.textContent.replace(/\u200b/g, "") }
	        else { text += cmText }
	        return
	      }
	      var markerID = node.getAttribute("cm-marker"), range
	      if (markerID) {
	        var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID))
	        if (found.length && (range = found[0].find()))
	          { text += getBetween(cm.doc, range.from, range.to).join(lineSep) }
	        return
	      }
	      if (node.getAttribute("contenteditable") == "false") { return }
	      for (var i = 0; i < node.childNodes.length; i++)
	        { walk(node.childNodes[i]) }
	      if (/^(pre|div|p)$/i.test(node.nodeName))
	        { closing = true }
	    } else if (node.nodeType == 3) {
	      var val = node.nodeValue
	      if (!val) { return }
	      if (closing) {
	        text += lineSep
	        closing = false
	      }
	      text += val
	    }
	  }
	  for (;;) {
	    walk(from)
	    if (from == to) { break }
	    from = from.nextSibling
	  }
	  return text
	}
	
	function domToPos(cm, node, offset) {
	  var lineNode
	  if (node == cm.display.lineDiv) {
	    lineNode = cm.display.lineDiv.childNodes[offset]
	    if (!lineNode) { return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true) }
	    node = null; offset = 0
	  } else {
	    for (lineNode = node;; lineNode = lineNode.parentNode) {
	      if (!lineNode || lineNode == cm.display.lineDiv) { return null }
	      if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) { break }
	    }
	  }
	  for (var i = 0; i < cm.display.view.length; i++) {
	    var lineView = cm.display.view[i]
	    if (lineView.node == lineNode)
	      { return locateNodeInLineView(lineView, node, offset) }
	  }
	}
	
	function locateNodeInLineView(lineView, node, offset) {
	  var wrapper = lineView.text.firstChild, bad = false
	  if (!node || !contains(wrapper, node)) { return badPos(Pos(lineNo(lineView.line), 0), true) }
	  if (node == wrapper) {
	    bad = true
	    node = wrapper.childNodes[offset]
	    offset = 0
	    if (!node) {
	      var line = lineView.rest ? lst(lineView.rest) : lineView.line
	      return badPos(Pos(lineNo(line), line.text.length), bad)
	    }
	  }
	
	  var textNode = node.nodeType == 3 ? node : null, topNode = node
	  if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
	    textNode = node.firstChild
	    if (offset) { offset = textNode.nodeValue.length }
	  }
	  while (topNode.parentNode != wrapper) { topNode = topNode.parentNode }
	  var measure = lineView.measure, maps = measure.maps
	
	  function find(textNode, topNode, offset) {
	    for (var i = -1; i < (maps ? maps.length : 0); i++) {
	      var map = i < 0 ? measure.map : maps[i]
	      for (var j = 0; j < map.length; j += 3) {
	        var curNode = map[j + 2]
	        if (curNode == textNode || curNode == topNode) {
	          var line = lineNo(i < 0 ? lineView.line : lineView.rest[i])
	          var ch = map[j] + offset
	          if (offset < 0 || curNode != textNode) { ch = map[j + (offset ? 1 : 0)] }
	          return Pos(line, ch)
	        }
	      }
	    }
	  }
	  var found = find(textNode, topNode, offset)
	  if (found) { return badPos(found, bad) }
	
	  // FIXME this is all really shaky. might handle the few cases it needs to handle, but likely to cause problems
	  for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
	    found = find(after, after.firstChild, 0)
	    if (found)
	      { return badPos(Pos(found.line, found.ch - dist), bad) }
	    else
	      { dist += after.textContent.length }
	  }
	  for (var before = topNode.previousSibling, dist$1 = offset; before; before = before.previousSibling) {
	    found = find(before, before.firstChild, -1)
	    if (found)
	      { return badPos(Pos(found.line, found.ch + dist$1), bad) }
	    else
	      { dist$1 += before.textContent.length }
	  }
	}
	
	// TEXTAREA INPUT STYLE
	
	var TextareaInput = function(cm) {
	  this.cm = cm
	  // See input.poll and input.reset
	  this.prevInput = ""
	
	  // Flag that indicates whether we expect input to appear real soon
	  // now (after some event like 'keypress' or 'input') and are
	  // polling intensively.
	  this.pollingFast = false
	  // Self-resetting timeout for the poller
	  this.polling = new Delayed()
	  // Tracks when input.reset has punted to just putting a short
	  // string into the textarea instead of the full selection.
	  this.inaccurateSelection = false
	  // Used to work around IE issue with selection being forgotten when focus moves away from textarea
	  this.hasSelection = false
	  this.composing = null
	};
	
	TextareaInput.prototype.init = function (display) {
	    var this$1 = this;
	
	  var input = this, cm = this.cm
	
	  // Wraps and hides input textarea
	  var div = this.wrapper = hiddenTextarea()
	  // The semihidden textarea that is focused when the editor is
	  // focused, and receives input.
	  var te = this.textarea = div.firstChild
	  display.wrapper.insertBefore(div, display.wrapper.firstChild)
	
	  // Needed to hide big blue blinking cursor on Mobile Safari (doesn't seem to work in iOS 8 anymore)
	  if (ios) { te.style.width = "0px" }
	
	  on(te, "input", function () {
	    if (ie && ie_version >= 9 && this$1.hasSelection) { this$1.hasSelection = null }
	    input.poll()
	  })
	
	  on(te, "paste", function (e) {
	    if (signalDOMEvent(cm, e) || handlePaste(e, cm)) { return }
	
	    cm.state.pasteIncoming = true
	    input.fastPoll()
	  })
	
	  function prepareCopyCut(e) {
	    if (signalDOMEvent(cm, e)) { return }
	    if (cm.somethingSelected()) {
	      setLastCopied({lineWise: false, text: cm.getSelections()})
	      if (input.inaccurateSelection) {
	        input.prevInput = ""
	        input.inaccurateSelection = false
	        te.value = lastCopied.text.join("\n")
	        selectInput(te)
	      }
	    } else if (!cm.options.lineWiseCopyCut) {
	      return
	    } else {
	      var ranges = copyableRanges(cm)
	      setLastCopied({lineWise: true, text: ranges.text})
	      if (e.type == "cut") {
	        cm.setSelections(ranges.ranges, null, sel_dontScroll)
	      } else {
	        input.prevInput = ""
	        te.value = ranges.text.join("\n")
	        selectInput(te)
	      }
	    }
	    if (e.type == "cut") { cm.state.cutIncoming = true }
	  }
	  on(te, "cut", prepareCopyCut)
	  on(te, "copy", prepareCopyCut)
	
	  on(display.scroller, "paste", function (e) {
	    if (eventInWidget(display, e) || signalDOMEvent(cm, e)) { return }
	    cm.state.pasteIncoming = true
	    input.focus()
	  })
	
	  // Prevent normal selection in the editor (we handle our own)
	  on(display.lineSpace, "selectstart", function (e) {
	    if (!eventInWidget(display, e)) { e_preventDefault(e) }
	  })
	
	  on(te, "compositionstart", function () {
	    var start = cm.getCursor("from")
	    if (input.composing) { input.composing.range.clear() }
	    input.composing = {
	      start: start,
	      range: cm.markText(start, cm.getCursor("to"), {className: "CodeMirror-composing"})
	    }
	  })
	  on(te, "compositionend", function () {
	    if (input.composing) {
	      input.poll()
	      input.composing.range.clear()
	      input.composing = null
	    }
	  })
	};
	
	TextareaInput.prototype.prepareSelection = function () {
	  // Redraw the selection and/or cursor
	  var cm = this.cm, display = cm.display, doc = cm.doc
	  var result = prepareSelection(cm)
	
	  // Move the hidden textarea near the cursor to prevent scrolling artifacts
	  if (cm.options.moveInputWithCursor) {
	    var headPos = cursorCoords(cm, doc.sel.primary().head, "div")
	    var wrapOff = display.wrapper.getBoundingClientRect(), lineOff = display.lineDiv.getBoundingClientRect()
	    result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10,
	                                        headPos.top + lineOff.top - wrapOff.top))
	    result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10,
	                                         headPos.left + lineOff.left - wrapOff.left))
	  }
	
	  return result
	};
	
	TextareaInput.prototype.showSelection = function (drawn) {
	  var cm = this.cm, display = cm.display
	  removeChildrenAndAdd(display.cursorDiv, drawn.cursors)
	  removeChildrenAndAdd(display.selectionDiv, drawn.selection)
	  if (drawn.teTop != null) {
	    this.wrapper.style.top = drawn.teTop + "px"
	    this.wrapper.style.left = drawn.teLeft + "px"
	  }
	};
	
	// Reset the input to correspond to the selection (or to be empty,
	// when not typing and nothing is selected)
	TextareaInput.prototype.reset = function (typing) {
	  if (this.contextMenuPending) { return }
	  var minimal, selected, cm = this.cm, doc = cm.doc
	  if (cm.somethingSelected()) {
	    this.prevInput = ""
	    var range = doc.sel.primary()
	    minimal = hasCopyEvent &&
	      (range.to().line - range.from().line > 100 || (selected = cm.getSelection()).length > 1000)
	    var content = minimal ? "-" : selected || cm.getSelection()
	    this.textarea.value = content
	    if (cm.state.focused) { selectInput(this.textarea) }
	    if (ie && ie_version >= 9) { this.hasSelection = content }
	  } else if (!typing) {
	    this.prevInput = this.textarea.value = ""
	    if (ie && ie_version >= 9) { this.hasSelection = null }
	  }
	  this.inaccurateSelection = minimal
	};
	
	TextareaInput.prototype.getField = function () { return this.textarea };
	
	TextareaInput.prototype.supportsTouch = function () { return false };
	
	TextareaInput.prototype.focus = function () {
	  if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
	    try { this.textarea.focus() }
	    catch (e) {} // IE8 will throw if the textarea is display: none or not in DOM
	  }
	};
	
	TextareaInput.prototype.blur = function () { this.textarea.blur() };
	
	TextareaInput.prototype.resetPosition = function () {
	  this.wrapper.style.top = this.wrapper.style.left = 0
	};
	
	TextareaInput.prototype.receivedFocus = function () { this.slowPoll() };
	
	// Poll for input changes, using the normal rate of polling. This
	// runs as long as the editor is focused.
	TextareaInput.prototype.slowPoll = function () {
	    var this$1 = this;
	
	  if (this.pollingFast) { return }
	  this.polling.set(this.cm.options.pollInterval, function () {
	    this$1.poll()
	    if (this$1.cm.state.focused) { this$1.slowPoll() }
	  })
	};
	
	// When an event has just come in that is likely to add or change
	// something in the input textarea, we poll faster, to ensure that
	// the change appears on the screen quickly.
	TextareaInput.prototype.fastPoll = function () {
	  var missed = false, input = this
	  input.pollingFast = true
	  function p() {
	    var changed = input.poll()
	    if (!changed && !missed) {missed = true; input.polling.set(60, p)}
	    else {input.pollingFast = false; input.slowPoll()}
	  }
	  input.polling.set(20, p)
	};
	
	// Read input from the textarea, and update the document to match.
	// When something is selected, it is present in the textarea, and
	// selected (unless it is huge, in which case a placeholder is
	// used). When nothing is selected, the cursor sits after previously
	// seen text (can be empty), which is stored in prevInput (we must
	// not reset the textarea when typing, because that breaks IME).
	TextareaInput.prototype.poll = function () {
	    var this$1 = this;
	
	  var cm = this.cm, input = this.textarea, prevInput = this.prevInput
	  // Since this is called a *lot*, try to bail out as cheaply as
	  // possible when it is clear that nothing happened. hasSelection
	  // will be the case when there is a lot of text in the textarea,
	  // in which case reading its value would be expensive.
	  if (this.contextMenuPending || !cm.state.focused ||
	      (hasSelection(input) && !prevInput && !this.composing) ||
	      cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq)
	    { return false }
	
	  var text = input.value
	  // If nothing changed, bail.
	  if (text == prevInput && !cm.somethingSelected()) { return false }
	  // Work around nonsensical selection resetting in IE9/10, and
	  // inexplicable appearance of private area unicode characters on
	  // some key combos in Mac (#2689).
	  if (ie && ie_version >= 9 && this.hasSelection === text ||
	      mac && /[\uf700-\uf7ff]/.test(text)) {
	    cm.display.input.reset()
	    return false
	  }
	
	  if (cm.doc.sel == cm.display.selForContextMenu) {
	    var first = text.charCodeAt(0)
	    if (first == 0x200b && !prevInput) { prevInput = "\u200b" }
	    if (first == 0x21da) { this.reset(); return this.cm.execCommand("undo") }
	  }
	  // Find the part of the input that is actually new
	  var same = 0, l = Math.min(prevInput.length, text.length)
	  while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) { ++same }
	
	  runInOp(cm, function () {
	    applyTextInput(cm, text.slice(same), prevInput.length - same,
	                   null, this$1.composing ? "*compose" : null)
	
	    // Don't leave long text in the textarea, since it makes further polling slow
	    if (text.length > 1000 || text.indexOf("\n") > -1) { input.value = this$1.prevInput = "" }
	    else { this$1.prevInput = text }
	
	    if (this$1.composing) {
	      this$1.composing.range.clear()
	      this$1.composing.range = cm.markText(this$1.composing.start, cm.getCursor("to"),
	                                         {className: "CodeMirror-composing"})
	    }
	  })
	  return true
	};
	
	TextareaInput.prototype.ensurePolled = function () {
	  if (this.pollingFast && this.poll()) { this.pollingFast = false }
	};
	
	TextareaInput.prototype.onKeyPress = function () {
	  if (ie && ie_version >= 9) { this.hasSelection = null }
	  this.fastPoll()
	};
	
	TextareaInput.prototype.onContextMenu = function (e) {
	  var input = this, cm = input.cm, display = cm.display, te = input.textarea
	  var pos = posFromMouse(cm, e), scrollPos = display.scroller.scrollTop
	  if (!pos || presto) { return } // Opera is difficult.
	
	  // Reset the current text selection only if the click is done outside of the selection
	  // and 'resetSelectionOnContextMenu' option is true.
	  var reset = cm.options.resetSelectionOnContextMenu
	  if (reset && cm.doc.sel.contains(pos) == -1)
	    { operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll) }
	
	  var oldCSS = te.style.cssText, oldWrapperCSS = input.wrapper.style.cssText
	  input.wrapper.style.cssText = "position: absolute"
	  var wrapperBox = input.wrapper.getBoundingClientRect()
	  te.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - wrapperBox.top - 5) + "px; left: " + (e.clientX - wrapperBox.left - 5) + "px;\n      z-index: 1000; background: " + (ie ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);"
	  var oldScrollY
	  if (webkit) { oldScrollY = window.scrollY } // Work around Chrome issue (#2712)
	  display.input.focus()
	  if (webkit) { window.scrollTo(null, oldScrollY) }
	  display.input.reset()
	  // Adds "Select all" to context menu in FF
	  if (!cm.somethingSelected()) { te.value = input.prevInput = " " }
	  input.contextMenuPending = true
	  display.selForContextMenu = cm.doc.sel
	  clearTimeout(display.detectingSelectAll)
	
	  // Select-all will be greyed out if there's nothing to select, so
	  // this adds a zero-width space so that we can later check whether
	  // it got selected.
	  function prepareSelectAllHack() {
	    if (te.selectionStart != null) {
	      var selected = cm.somethingSelected()
	      var extval = "\u200b" + (selected ? te.value : "")
	      te.value = "\u21da" // Used to catch context-menu undo
	      te.value = extval
	      input.prevInput = selected ? "" : "\u200b"
	      te.selectionStart = 1; te.selectionEnd = extval.length
	      // Re-set this, in case some other handler touched the
	      // selection in the meantime.
	      display.selForContextMenu = cm.doc.sel
	    }
	  }
	  function rehide() {
	    input.contextMenuPending = false
	    input.wrapper.style.cssText = oldWrapperCSS
	    te.style.cssText = oldCSS
	    if (ie && ie_version < 9) { display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos) }
	
	    // Try to detect the user choosing select-all
	    if (te.selectionStart != null) {
	      if (!ie || (ie && ie_version < 9)) { prepareSelectAllHack() }
	      var i = 0, poll = function () {
	        if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 &&
	            te.selectionEnd > 0 && input.prevInput == "\u200b")
	          { operation(cm, selectAll)(cm) }
	        else if (i++ < 10) { display.detectingSelectAll = setTimeout(poll, 500) }
	        else { display.input.reset() }
	      }
	      display.detectingSelectAll = setTimeout(poll, 200)
	    }
	  }
	
	  if (ie && ie_version >= 9) { prepareSelectAllHack() }
	  if (captureRightClick) {
	    e_stop(e)
	    var mouseup = function () {
	      off(window, "mouseup", mouseup)
	      setTimeout(rehide, 20)
	    }
	    on(window, "mouseup", mouseup)
	  } else {
	    setTimeout(rehide, 50)
	  }
	};
	
	TextareaInput.prototype.readOnlyChanged = function (val) {
	  if (!val) { this.reset() }
	};
	
	TextareaInput.prototype.setUneditable = function () {};
	
	TextareaInput.prototype.needsContentAttribute = false
	
	function fromTextArea(textarea, options) {
	  options = options ? copyObj(options) : {}
	  options.value = textarea.value
	  if (!options.tabindex && textarea.tabIndex)
	    { options.tabindex = textarea.tabIndex }
	  if (!options.placeholder && textarea.placeholder)
	    { options.placeholder = textarea.placeholder }
	  // Set autofocus to true if this textarea is focused, or if it has
	  // autofocus and no other element is focused.
	  if (options.autofocus == null) {
	    var hasFocus = activeElt()
	    options.autofocus = hasFocus == textarea ||
	      textarea.getAttribute("autofocus") != null && hasFocus == document.body
	  }
	
	  function save() {textarea.value = cm.getValue()}
	
	  var realSubmit
	  if (textarea.form) {
	    on(textarea.form, "submit", save)
	    // Deplorable hack to make the submit method do the right thing.
	    if (!options.leaveSubmitMethodAlone) {
	      var form = textarea.form
	      realSubmit = form.submit
	      try {
	        var wrappedSubmit = form.submit = function () {
	          save()
	          form.submit = realSubmit
	          form.submit()
	          form.submit = wrappedSubmit
	        }
	      } catch(e) {}
	    }
	  }
	
	  options.finishInit = function (cm) {
	    cm.save = save
	    cm.getTextArea = function () { return textarea; }
	    cm.toTextArea = function () {
	      cm.toTextArea = isNaN // Prevent this from being ran twice
	      save()
	      textarea.parentNode.removeChild(cm.getWrapperElement())
	      textarea.style.display = ""
	      if (textarea.form) {
	        off(textarea.form, "submit", save)
	        if (typeof textarea.form.submit == "function")
	          { textarea.form.submit = realSubmit }
	      }
	    }
	  }
	
	  textarea.style.display = "none"
	  var cm = CodeMirror(function (node) { return textarea.parentNode.insertBefore(node, textarea.nextSibling); },
	    options)
	  return cm
	}
	
	function addLegacyProps(CodeMirror) {
	  CodeMirror.off = off
	  CodeMirror.on = on
	  CodeMirror.wheelEventPixels = wheelEventPixels
	  CodeMirror.Doc = Doc
	  CodeMirror.splitLines = splitLinesAuto
	  CodeMirror.countColumn = countColumn
	  CodeMirror.findColumn = findColumn
	  CodeMirror.isWordChar = isWordCharBasic
	  CodeMirror.Pass = Pass
	  CodeMirror.signal = signal
	  CodeMirror.Line = Line
	  CodeMirror.changeEnd = changeEnd
	  CodeMirror.scrollbarModel = scrollbarModel
	  CodeMirror.Pos = Pos
	  CodeMirror.cmpPos = cmp
	  CodeMirror.modes = modes
	  CodeMirror.mimeModes = mimeModes
	  CodeMirror.resolveMode = resolveMode
	  CodeMirror.getMode = getMode
	  CodeMirror.modeExtensions = modeExtensions
	  CodeMirror.extendMode = extendMode
	  CodeMirror.copyState = copyState
	  CodeMirror.startState = startState
	  CodeMirror.innerMode = innerMode
	  CodeMirror.commands = commands
	  CodeMirror.keyMap = keyMap
	  CodeMirror.keyName = keyName
	  CodeMirror.isModifierKey = isModifierKey
	  CodeMirror.lookupKey = lookupKey
	  CodeMirror.normalizeKeyMap = normalizeKeyMap
	  CodeMirror.StringStream = StringStream
	  CodeMirror.SharedTextMarker = SharedTextMarker
	  CodeMirror.TextMarker = TextMarker
	  CodeMirror.LineWidget = LineWidget
	  CodeMirror.e_preventDefault = e_preventDefault
	  CodeMirror.e_stopPropagation = e_stopPropagation
	  CodeMirror.e_stop = e_stop
	  CodeMirror.addClass = addClass
	  CodeMirror.contains = contains
	  CodeMirror.rmClass = rmClass
	  CodeMirror.keyNames = keyNames
	}
	
	// EDITOR CONSTRUCTOR
	
	defineOptions(CodeMirror)
	
	addEditorMethods(CodeMirror)
	
	// Set up methods on CodeMirror's prototype to redirect to the editor's document.
	var dontDelegate = "iter insert remove copy getEditor constructor".split(" ")
	for (var prop in Doc.prototype) { if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
	  { CodeMirror.prototype[prop] = (function(method) {
	    return function() {return method.apply(this.doc, arguments)}
	  })(Doc.prototype[prop]) } }
	
	eventMixin(Doc)
	
	// INPUT HANDLING
	
	CodeMirror.inputStyles = {"textarea": TextareaInput, "contenteditable": ContentEditableInput}
	
	// MODE DEFINITION AND QUERYING
	
	// Extra arguments are stored as the mode's dependencies, which is
	// used by (legacy) mechanisms like loadmode.js to automatically
	// load a mode. (Preferred mechanism is the require/define calls.)
	CodeMirror.defineMode = function(name/*, mode, …*/) {
	  if (!CodeMirror.defaults.mode && name != "null") { CodeMirror.defaults.mode = name }
	  defineMode.apply(this, arguments)
	}
	
	CodeMirror.defineMIME = defineMIME
	
	// Minimal default mode.
	CodeMirror.defineMode("null", function () { return ({token: function (stream) { return stream.skipToEnd(); }}); })
	CodeMirror.defineMIME("text/plain", "null")
	
	// EXTENSIONS
	
	CodeMirror.defineExtension = function (name, func) {
	  CodeMirror.prototype[name] = func
	}
	CodeMirror.defineDocExtension = function (name, func) {
	  Doc.prototype[name] = func
	}
	
	CodeMirror.fromTextArea = fromTextArea
	
	addLegacyProps(CodeMirror)
	
	CodeMirror.version = "5.22.2"
	
	return CodeMirror;
	
	})));

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *  Firebase libraries for browser - npm package.
	 *
	 * Usage:
	 *
	 *   firebase = require('firebase');
	 */
	var firebase = __webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	module.exports = firebase;


/***/ },
/* 3 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {var firebase = (function(){
	/*! @license Firebase v3.6.6
	    Build: 3.6.6-rc.3
	    Terms: https://firebase.google.com/terms/ */
	var firebase = null; (function() { var aa="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(c.get||c.set)throw new TypeError("ES3 does not support getters and setters.");a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)},h="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this,l=function(){l=function(){};h.Symbol||(h.Symbol=ba)},ca=0,ba=function(a){return"jscomp_symbol_"+(a||"")+ca++},n=function(){l();var a=h.Symbol.iterator;a||(a=h.Symbol.iterator=
	h.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&aa(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return m(this)}});n=function(){}},m=function(a){var b=0;return da(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})},da=function(a){n();a={next:a};a[h.Symbol.iterator]=function(){return this};return a},q=this,r=function(){},t=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);
	if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a.call)return"object";return b},v=function(a){return"function"==t(a)},ea=function(a,
	b,c){return a.call.apply(a.bind,arguments)},fa=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}},w=function(a,b,c){w=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ea:fa;return w.apply(null,arguments)},x=function(a,b){var c=Array.prototype.slice.call(arguments,
	1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}},y=function(a,b){function c(){}c.prototype=b.prototype;a.ba=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.aa=function(a,c,f){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d)}};var z;z="undefined"!==typeof window?window:"undefined"!==typeof self?self:global;function __extends(a,b){function c(){this.constructor=a}for(var d in b)b.hasOwnProperty(d)&&(a[d]=b[d]);a.prototype=null===b?Object.create(b):(c.prototype=b.prototype,new c)}
	function __decorate(a,b,c,d){var e=arguments.length,f=3>e?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d,g;g=z.Reflect;if("object"===typeof g&&"function"===typeof g.decorate)f=g.decorate(a,b,c,d);else for(var k=a.length-1;0<=k;k--)if(g=a[k])f=(3>e?g(f):3<e?g(b,c,f):g(b,c))||f;return 3<e&&f&&Object.defineProperty(b,c,f),f}function __metadata(a,b){var c=z.Reflect;if("object"===typeof c&&"function"===typeof c.metadata)return c.metadata(a,b)}
	var __param=function(a,b){return function(c,d){b(c,d,a)}},__awaiter=function(a,b,c,d){return new (c||(c=Promise))(function(e,f){function g(a){try{p(d.next(a))}catch(u){f(u)}}function k(a){try{p(d.throw(a))}catch(u){f(u)}}function p(a){a.done?e(a.value):(new c(function(b){b(a.value)})).then(g,k)}p((d=d.apply(a,b)).next())})};"undefined"!==typeof z.M&&z.M||(z.__extends=__extends,z.__decorate=__decorate,z.__metadata=__metadata,z.__param=__param,z.__awaiter=__awaiter);var A=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,A);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))};y(A,Error);A.prototype.name="CustomError";var ga=function(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")};var B=function(a,b){b.unshift(a);A.call(this,ga.apply(null,b));b.shift()};y(B,A);B.prototype.name="AssertionError";var ha=function(a,b,c,d){var e="Assertion failed";if(c)var e=e+(": "+c),f=d;else a&&(e+=": "+a,f=b);throw new B(""+e,f||[]);},C=function(a,b,c){a||ha("",null,b,Array.prototype.slice.call(arguments,2))},D=function(a,b,c){v(a)||ha("Expected function but got %s: %s.",[t(a),a],b,Array.prototype.slice.call(arguments,2))};var E=function(a,b,c){this.T=c;this.N=a;this.U=b;this.s=0;this.o=null};E.prototype.get=function(){var a;0<this.s?(this.s--,a=this.o,this.o=a.next,a.next=null):a=this.N();return a};E.prototype.put=function(a){this.U(a);this.s<this.T&&(this.s++,a.next=this.o,this.o=a)};var F;a:{var ia=q.navigator;if(ia){var ja=ia.userAgent;if(ja){F=ja;break a}}F=""};var ka=function(a){q.setTimeout(function(){throw a;},0)},G,la=function(){var a=q.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&-1==F.indexOf("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+
	"//"+b.location.host,a=w(function(a){if(("*"==d||a.origin==d)&&a.data==c)this.port1.onmessage()},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d)}}});if("undefined"!==typeof a&&-1==F.indexOf("Trident")&&-1==F.indexOf("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var a=c.G;c.G=null;a()}};return function(a){d.next={G:a};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in
	document.createElement("SCRIPT")?function(a){var b=document.createElement("SCRIPT");b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null};document.documentElement.appendChild(b)}:function(a){q.setTimeout(a,0)}};var H=function(){this.v=this.f=null},ma=new E(function(){return new I},function(a){a.reset()},100);H.prototype.add=function(a,b){var c=ma.get();c.set(a,b);this.v?this.v.next=c:(C(!this.f),this.f=c);this.v=c};H.prototype.remove=function(){var a=null;this.f&&(a=this.f,this.f=this.f.next,this.f||(this.v=null),a.next=null);return a};var I=function(){this.next=this.scope=this.B=null};I.prototype.set=function(a,b){this.B=a;this.scope=b;this.next=null};
	I.prototype.reset=function(){this.next=this.scope=this.B=null};var M=function(a,b){J||na();L||(J(),L=!0);oa.add(a,b)},J,na=function(){if(-1!=String(q.Promise).indexOf("[native code]")){var a=q.Promise.resolve(void 0);J=function(){a.then(pa)}}else J=function(){var a=pa;!v(q.setImmediate)||q.Window&&q.Window.prototype&&-1==F.indexOf("Edge")&&q.Window.prototype.setImmediate==q.setImmediate?(G||(G=la()),G(a)):q.setImmediate(a)}},L=!1,oa=new H,pa=function(){for(var a;a=oa.remove();){try{a.B.call(a.scope)}catch(b){ka(b)}ma.put(a)}L=!1};var O=function(a,b){this.b=0;this.L=void 0;this.j=this.g=this.u=null;this.m=this.A=!1;if(a!=r)try{var c=this;a.call(b,function(a){N(c,2,a)},function(a){try{if(a instanceof Error)throw a;throw Error("Promise rejected.");}catch(e){}N(c,3,a)})}catch(d){N(this,3,d)}},qa=function(){this.next=this.context=this.h=this.c=this.child=null;this.w=!1};qa.prototype.reset=function(){this.context=this.h=this.c=this.child=null;this.w=!1};
	var ra=new E(function(){return new qa},function(a){a.reset()},100),sa=function(a,b,c){var d=ra.get();d.c=a;d.h=b;d.context=c;return d},ua=function(a,b,c){ta(a,b,c,null)||M(x(b,a))};O.prototype.then=function(a,b,c){null!=a&&D(a,"opt_onFulfilled should be a function.");null!=b&&D(b,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?");return va(this,v(a)?a:null,v(b)?b:null,c)};O.prototype.then=O.prototype.then;O.prototype.$goog_Thenable=!0;
	O.prototype.X=function(a,b){return va(this,null,a,b)};var xa=function(a,b){a.g||2!=a.b&&3!=a.b||wa(a);C(null!=b.c);a.j?a.j.next=b:a.g=b;a.j=b},va=function(a,b,c,d){var e=sa(null,null,null);e.child=new O(function(a,g){e.c=b?function(c){try{var e=b.call(d,c);a(e)}catch(K){g(K)}}:a;e.h=c?function(b){try{var e=c.call(d,b);a(e)}catch(K){g(K)}}:g});e.child.u=a;xa(a,e);return e.child};O.prototype.Y=function(a){C(1==this.b);this.b=0;N(this,2,a)};O.prototype.Z=function(a){C(1==this.b);this.b=0;N(this,3,a)};
	var N=function(a,b,c){0==a.b&&(a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself")),a.b=1,ta(c,a.Y,a.Z,a)||(a.L=c,a.b=b,a.u=null,wa(a),3!=b||ya(a,c)))},ta=function(a,b,c,d){if(a instanceof O)return null!=b&&D(b,"opt_onFulfilled should be a function."),null!=c&&D(c,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?"),xa(a,sa(b||r,c||null,d)),!0;var e;if(a)try{e=!!a.$goog_Thenable}catch(g){e=!1}else e=!1;if(e)return a.then(b,c,d),
	!0;e=typeof a;if("object"==e&&null!=a||"function"==e)try{var f=a.then;if(v(f))return za(a,f,b,c,d),!0}catch(g){return c.call(d,g),!0}return!1},za=function(a,b,c,d,e){var f=!1,g=function(a){f||(f=!0,c.call(e,a))},k=function(a){f||(f=!0,d.call(e,a))};try{b.call(a,g,k)}catch(p){k(p)}},wa=function(a){a.A||(a.A=!0,M(a.P,a))},Aa=function(a){var b=null;a.g&&(b=a.g,a.g=b.next,b.next=null);a.g||(a.j=null);null!=b&&C(null!=b.c);return b};
	O.prototype.P=function(){for(var a;a=Aa(this);){var b=this.b,c=this.L;if(3==b&&a.h&&!a.w){var d;for(d=this;d&&d.m;d=d.u)d.m=!1}if(a.child)a.child.u=null,Ba(a,b,c);else try{a.w?a.c.call(a.context):Ba(a,b,c)}catch(e){Ca.call(null,e)}ra.put(a)}this.A=!1};var Ba=function(a,b,c){2==b?a.c.call(a.context,c):a.h&&a.h.call(a.context,c)},ya=function(a,b){a.m=!0;M(function(){a.m&&Ca.call(null,b)})},Ca=ka;function P(a,b){if(!(b instanceof Object))return b;switch(b.constructor){case Date:return new Date(b.getTime());case Object:void 0===a&&(a={});break;case Array:a=[];break;default:return b}for(var c in b)b.hasOwnProperty(c)&&(a[c]=P(a[c],b[c]));return a};O.all=function(a){return new O(function(b,c){var d=a.length,e=[];if(d)for(var f=function(a,c){d--;e[a]=c;0==d&&b(e)},g=function(a){c(a)},k=0,p;k<a.length;k++)p=a[k],ua(p,x(f,k),g);else b(e)})};O.resolve=function(a){if(a instanceof O)return a;var b=new O(r);N(b,2,a);return b};O.reject=function(a){return new O(function(b,c){c(a)})};O.prototype["catch"]=O.prototype.X;var Q=O;"undefined"!==typeof Promise&&(Q=Promise);var Da=Q;function Ea(a,b){a=new R(a,b);return a.subscribe.bind(a)}var R=function(a,b){var c=this;this.a=[];this.K=0;this.task=Da.resolve();this.l=!1;this.D=b;this.task.then(function(){a(c)}).catch(function(a){c.error(a)})};R.prototype.next=function(a){S(this,function(b){b.next(a)})};R.prototype.error=function(a){S(this,function(b){b.error(a)});this.close(a)};R.prototype.complete=function(){S(this,function(a){a.complete()});this.close()};
	R.prototype.subscribe=function(a,b,c){var d=this,e;if(void 0===a&&void 0===b&&void 0===c)throw Error("Missing Observer.");e=Fa(a)?a:{next:a,error:b,complete:c};void 0===e.next&&(e.next=T);void 0===e.error&&(e.error=T);void 0===e.complete&&(e.complete=T);a=this.$.bind(this,this.a.length);this.l&&this.task.then(function(){try{d.H?e.error(d.H):e.complete()}catch(f){}});this.a.push(e);return a};
	R.prototype.$=function(a){void 0!==this.a&&void 0!==this.a[a]&&(delete this.a[a],--this.K,0===this.K&&void 0!==this.D&&this.D(this))};var S=function(a,b){if(!a.l)for(var c=0;c<a.a.length;c++)Ga(a,c,b)},Ga=function(a,b,c){a.task.then(function(){if(void 0!==a.a&&void 0!==a.a[b])try{c(a.a[b])}catch(d){"undefined"!==typeof console&&console.error&&console.error(d)}})};R.prototype.close=function(a){var b=this;this.l||(this.l=!0,void 0!==a&&(this.H=a),this.task.then(function(){b.a=void 0;b.D=void 0}))};
	function Fa(a){if("object"!==typeof a||null===a)return!1;var b;b=["next","error","complete"];n();var c=b[Symbol.iterator];b=c?c.call(b):m(b);for(c=b.next();!c.done;c=b.next())if(c=c.value,c in a&&"function"===typeof a[c])return!0;return!1}function T(){};var Ha=Error.captureStackTrace,V=function(a,b){this.code=a;this.message=b;if(Ha)Ha(this,U.prototype.create);else{var c=Error.apply(this,arguments);this.name="FirebaseError";Object.defineProperty(this,"stack",{get:function(){return c.stack}})}};V.prototype=Object.create(Error.prototype);V.prototype.constructor=V;V.prototype.name="FirebaseError";var U=function(a,b,c){this.V=a;this.W=b;this.O=c;this.pattern=/\{\$([^}]+)}/g};
	U.prototype.create=function(a,b){void 0===b&&(b={});var c=this.O[a];a=this.V+"/"+a;var c=void 0===c?"Error":c.replace(this.pattern,function(a,c){a=b[c];return void 0!==a?a.toString():"<"+c+"?>"}),c=this.W+": "+c+" ("+a+").",c=new V(a,c),d;for(d in b)b.hasOwnProperty(d)&&"_"!==d.slice(-1)&&(c[d]=b[d]);return c};var W=Q,X=function(a,b,c){var d=this;this.I=c;this.J=!1;this.i={};this.C=b;this.F=P(void 0,a);a="serviceAccount"in this.F;("credential"in this.F||a)&&"undefined"!==typeof console&&console.log("The '"+(a?"serviceAccount":"credential")+"' property specified in the first argument to initializeApp() is deprecated and will be removed in the next major version. You should instead use the 'firebase-admin' package. See https://firebase.google.com/docs/admin/setup for details on how to get started.");Object.keys(c.INTERNAL.factories).forEach(function(a){var b=
	c.INTERNAL.useAsService(d,a);null!==b&&(b=d.S.bind(d,b),d[a]=b)})};X.prototype.delete=function(){var a=this;return(new W(function(b){Y(a);b()})).then(function(){a.I.INTERNAL.removeApp(a.C);return W.all(Object.keys(a.i).map(function(b){return a.i[b].INTERNAL.delete()}))}).then(function(){a.J=!0;a.i={}})};X.prototype.S=function(a){Y(this);void 0===this.i[a]&&(this.i[a]=this.I.INTERNAL.factories[a](this,this.R.bind(this)));return this.i[a]};X.prototype.R=function(a){P(this,a)};
	var Y=function(a){a.J&&Z(Ia("deleted",{name:a.C}))};h.Object.defineProperties(X.prototype,{name:{configurable:!0,enumerable:!0,get:function(){Y(this);return this.C}},options:{configurable:!0,enumerable:!0,get:function(){Y(this);return this.F}}});X.prototype.name&&X.prototype.options||X.prototype.delete||console.log("dc");
	function Ja(){function a(a){a=a||"[DEFAULT]";var b=d[a];void 0===b&&Z("noApp",{name:a});return b}function b(a,b){Object.keys(e).forEach(function(d){d=c(a,d);if(null!==d&&f[d])f[d](b,a)})}function c(a,b){if("serverAuth"===b)return null;var c=b;a=a.options;"auth"===b&&(a.serviceAccount||a.credential)&&(c="serverAuth","serverAuth"in e||Z("serverAuthMissing"));return c}var d={},e={},f={},g={__esModule:!0,initializeApp:function(a,c){void 0===c?c="[DEFAULT]":"string"===typeof c&&""!==c||Z("bad-app-name",
	{name:c+""});void 0!==d[c]&&Z("dupApp",{name:c});a=new X(a,c,g);d[c]=a;b(a,"create");void 0!=a.INTERNAL&&void 0!=a.INTERNAL.getToken||P(a,{INTERNAL:{getToken:function(){return W.resolve(null)},addAuthTokenListener:function(){},removeAuthTokenListener:function(){}}});return a},app:a,apps:null,Promise:W,SDK_VERSION:"0.0.0",INTERNAL:{registerService:function(b,c,d,u){e[b]&&Z("dupService",{name:b});e[b]=c;u&&(f[b]=u);c=function(c){void 0===c&&(c=a());return c[b]()};void 0!==d&&P(c,d);return g[b]=c},createFirebaseNamespace:Ja,
	extendNamespace:function(a){P(g,a)},createSubscribe:Ea,ErrorFactory:U,removeApp:function(a){b(d[a],"delete");delete d[a]},factories:e,useAsService:c,Promise:O,deepExtend:P}};g["default"]=g;Object.defineProperty(g,"apps",{get:function(){return Object.keys(d).map(function(a){return d[a]})}});a.App=X;return g}function Z(a,b){throw Error(Ia(a,b));}
	function Ia(a,b){b=b||{};b={noApp:"No Firebase App '"+b.name+"' has been created - call Firebase App.initializeApp().","bad-app-name":"Illegal App name: '"+b.name+"'.",dupApp:"Firebase App named '"+b.name+"' already exists.",deleted:"Firebase App named '"+b.name+"' already deleted.",dupService:"Firebase Service named '"+b.name+"' already registered.",serverAuthMissing:"Initializing the Firebase SDK with a service account is only allowed in a Node.js environment. On client devices, you should instead initialize the SDK with an api key and auth domain."}[a];
	return void 0===b?"Application Error: ("+a+")":b};"undefined"!==typeof firebase&&(firebase=Ja()); }).call(this);
	firebase.SDK_VERSION = "3.6.6";
	return firebase;}).call(global);
	module.exports = firebase;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var firebase = __webpack_require__(3);
	(function(){
	/*! @license Firebase v3.6.6
	    Build: 3.6.6-rc.3
	    Terms: https://firebase.google.com/terms/ */
	(function(){var h,aa=aa||{},l=this,ba=function(){},m=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&
	!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a.call)return"object";return b},ca=function(a){return null===a},da=function(a){return"array"==m(a)},ea=function(a){var b=m(a);return"array"==b||"object"==b&&"number"==typeof a.length},p=function(a){return"string"==typeof a},fa=function(a){return"number"==typeof a},q=function(a){return"function"==m(a)},ga=function(a){var b=typeof a;return"object"==b&&null!=a||"function"==b},ha=function(a,b,
	c){return a.call.apply(a.bind,arguments)},ia=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}},r=function(a,b,c){r=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ha:ia;return r.apply(null,arguments)},ja=function(a,b){var c=Array.prototype.slice.call(arguments,
	1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}},ka=Date.now||function(){return+new Date},t=function(a,b){function c(){}c.prototype=b.prototype;a.hd=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.Bf=function(a,c,f){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d)}};var u=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,u);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))};t(u,Error);u.prototype.name="CustomError";var la=function(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")},ma=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")},na=/&/g,oa=/</g,pa=/>/g,qa=/"/g,ra=/'/g,sa=/\x00/g,ta=/[\x00&<>"']/,v=function(a,b){return-1!=a.indexOf(b)},ua=function(a,b){return a<b?-1:a>b?1:0};var va=function(a,b){b.unshift(a);u.call(this,la.apply(null,b));b.shift()};t(va,u);va.prototype.name="AssertionError";
	var wa=function(a,b,c,d){var e="Assertion failed";if(c)var e=e+(": "+c),f=d;else a&&(e+=": "+a,f=b);throw new va(""+e,f||[]);},w=function(a,b,c){a||wa("",null,b,Array.prototype.slice.call(arguments,2))},xa=function(a,b){throw new va("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));},ya=function(a,b,c){fa(a)||wa("Expected number but got %s: %s.",[m(a),a],b,Array.prototype.slice.call(arguments,2));return a},za=function(a,b,c){p(a)||wa("Expected string but got %s: %s.",[m(a),a],b,Array.prototype.slice.call(arguments,
	2))},Aa=function(a,b,c){q(a)||wa("Expected function but got %s: %s.",[m(a),a],b,Array.prototype.slice.call(arguments,2))};var Ba=Array.prototype.indexOf?function(a,b,c){w(null!=a.length);return Array.prototype.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(p(a))return p(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},x=Array.prototype.forEach?function(a,b,c){w(null!=a.length);Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Ca=function(a,b){for(var c=p(a)?
	a.split(""):a,d=a.length-1;0<=d;--d)d in c&&b.call(void 0,c[d],d,a)},Da=Array.prototype.map?function(a,b,c){w(null!=a.length);return Array.prototype.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=p(a)?a.split(""):a,g=0;g<d;g++)g in f&&(e[g]=b.call(c,f[g],g,a));return e},Ea=Array.prototype.some?function(a,b,c){w(null!=a.length);return Array.prototype.some.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return!0;return!1},
	Ga=function(a){var b;a:{b=Fa;for(var c=a.length,d=p(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1}return 0>b?null:p(a)?a.charAt(b):a[b]},Ha=function(a,b){return 0<=Ba(a,b)},Ja=function(a,b){b=Ba(a,b);var c;(c=0<=b)&&Ia(a,b);return c},Ia=function(a,b){w(null!=a.length);return 1==Array.prototype.splice.call(a,b,1).length},Ka=function(a,b){var c=0;Ca(a,function(d,e){b.call(void 0,d,e,a)&&Ia(a,e)&&c++})},La=function(a){return Array.prototype.concat.apply(Array.prototype,
	arguments)},Ma=function(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]};var Na=function(a,b){for(var c in a)b.call(void 0,a[c],c,a)},Oa=function(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b},Pa=function(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b},Qa=function(a){for(var b in a)return!1;return!0},Ra=function(a,b){for(var c in a)if(!(c in b)||a[c]!==b[c])return!1;for(c in b)if(!(c in a))return!1;return!0},Sa=function(a){var b={},c;for(c in a)b[c]=a[c];return b},Ta="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),
	Ua=function(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<Ta.length;f++)c=Ta[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};var Va;a:{var Xa=l.navigator;if(Xa){var Ya=Xa.userAgent;if(Ya){Va=Ya;break a}}Va=""}var z=function(a){return v(Va,a)};var Za=function(a){Za[" "](a);return a};Za[" "]=ba;var ab=function(a,b){var c=$a;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)};var bb=z("Opera"),A=z("Trident")||z("MSIE"),cb=z("Edge"),db=cb||A,eb=z("Gecko")&&!(v(Va.toLowerCase(),"webkit")&&!z("Edge"))&&!(z("Trident")||z("MSIE"))&&!z("Edge"),fb=v(Va.toLowerCase(),"webkit")&&!z("Edge"),gb=function(){var a=l.document;return a?a.documentMode:void 0},hb;
	a:{var ib="",jb=function(){var a=Va;if(eb)return/rv\:([^\);]+)(\)|;)/.exec(a);if(cb)return/Edge\/([\d\.]+)/.exec(a);if(A)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(fb)return/WebKit\/(\S+)/.exec(a);if(bb)return/(?:Version)[ \/]?(\S+)/.exec(a)}();jb&&(ib=jb?jb[1]:"");if(A){var kb=gb();if(null!=kb&&kb>parseFloat(ib)){hb=String(kb);break a}}hb=ib}
	var lb=hb,$a={},B=function(a){return ab(a,function(){for(var b=0,c=ma(String(lb)).split("."),d=ma(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",k=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];k=/(\d*)(\D*)(.*)/.exec(k)||["","","",""];if(0==g[0].length&&0==k[0].length)break;b=ua(0==g[1].length?0:parseInt(g[1],10),0==k[1].length?0:parseInt(k[1],10))||ua(0==g[2].length,0==k[2].length)||ua(g[2],k[2]);g=g[3];k=k[3]}while(0==b)}return 0<=b})},mb;var nb=l.document;
	mb=nb&&A?gb()||("CSS1Compat"==nb.compatMode?parseInt(lb,10):5):void 0;var ob=function(a){return Da(a,function(a){a=a.toString(16);return 1<a.length?a:"0"+a}).join("")};var pb=null,qb=null,sb=function(a){var b="";rb(a,function(a){b+=String.fromCharCode(a)});return b},rb=function(a,b){function c(b){for(;d<a.length;){var c=a.charAt(d++),e=qb[c];if(null!=e)return e;if(!/^[\s\xa0]*$/.test(c))throw Error("Unknown base64 encoding at char: "+c);}return b}tb();for(var d=0;;){var e=c(-1),f=c(0),g=c(64),k=c(64);if(64===k&&-1===e)break;b(e<<2|f>>4);64!=g&&(b(f<<4&240|g>>2),64!=k&&b(g<<6&192|k))}},tb=function(){if(!pb){pb={};qb={};for(var a=0;65>a;a++)pb[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),
	qb[pb[a]]=a,62<=a&&(qb["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a)]=a)}};var ub=function(){this.ya=-1};var xb=function(a,b){this.ya=64;this.Qb=l.Uint8Array?new Uint8Array(this.ya):Array(this.ya);this.vc=this.Va=0;this.h=[];this.Ye=a;this.Bd=b;this.xf=l.Int32Array?new Int32Array(64):Array(64);void 0!==vb||(vb=l.Int32Array?new Int32Array(wb):wb);this.reset()},vb;t(xb,ub);for(var yb=[],zb=0;63>zb;zb++)yb[zb]=0;var Ab=La(128,yb);xb.prototype.reset=function(){this.vc=this.Va=0;this.h=l.Int32Array?new Int32Array(this.Bd):Ma(this.Bd)};
	var Bb=function(a){var b=a.Qb;w(b.length==a.ya);for(var c=a.xf,d=0,e=0;e<b.length;)c[d++]=b[e]<<24|b[e+1]<<16|b[e+2]<<8|b[e+3],e=4*d;for(b=16;64>b;b++){var e=c[b-15]|0,d=c[b-2]|0,f=(c[b-16]|0)+((e>>>7|e<<25)^(e>>>18|e<<14)^e>>>3)|0,g=(c[b-7]|0)+((d>>>17|d<<15)^(d>>>19|d<<13)^d>>>10)|0;c[b]=f+g|0}for(var d=a.h[0]|0,e=a.h[1]|0,k=a.h[2]|0,n=a.h[3]|0,y=a.h[4]|0,Eb=a.h[5]|0,Wa=a.h[6]|0,f=a.h[7]|0,b=0;64>b;b++)var oe=((d>>>2|d<<30)^(d>>>13|d<<19)^(d>>>22|d<<10))+(d&e^d&k^e&k)|0,g=y&Eb^~y&Wa,f=f+((y>>>6|
	y<<26)^(y>>>11|y<<21)^(y>>>25|y<<7))|0,g=g+(vb[b]|0)|0,g=f+(g+(c[b]|0)|0)|0,f=Wa,Wa=Eb,Eb=y,y=n+g|0,n=k,k=e,e=d,d=g+oe|0;a.h[0]=a.h[0]+d|0;a.h[1]=a.h[1]+e|0;a.h[2]=a.h[2]+k|0;a.h[3]=a.h[3]+n|0;a.h[4]=a.h[4]+y|0;a.h[5]=a.h[5]+Eb|0;a.h[6]=a.h[6]+Wa|0;a.h[7]=a.h[7]+f|0};
	xb.prototype.update=function(a,b){void 0===b&&(b=a.length);var c=0,d=this.Va;if(p(a))for(;c<b;)this.Qb[d++]=a.charCodeAt(c++),d==this.ya&&(Bb(this),d=0);else if(ea(a))for(;c<b;){var e=a[c++];if(!("number"==typeof e&&0<=e&&255>=e&&e==(e|0)))throw Error("message must be a byte array");this.Qb[d++]=e;d==this.ya&&(Bb(this),d=0)}else throw Error("message must be string or array");this.Va=d;this.vc+=b};
	xb.prototype.digest=function(){var a=[],b=8*this.vc;56>this.Va?this.update(Ab,56-this.Va):this.update(Ab,this.ya-(this.Va-56));for(var c=63;56<=c;c--)this.Qb[c]=b&255,b/=256;Bb(this);for(c=b=0;c<this.Ye;c++)for(var d=24;0<=d;d-=8)a[b++]=this.h[c]>>d&255;return a};
	var wb=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,
	4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];var Db=function(){xb.call(this,8,Cb)};t(Db,xb);var Cb=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];var Fb=!A||9<=Number(mb),Gb=A&&!B("9");!fb||B("528");eb&&B("1.9b")||A&&B("8")||bb&&B("9.5")||fb&&B("528");eb&&!B("8")||A&&B("9");var Hb=function(){this.Aa=this.Aa;this.gc=this.gc};Hb.prototype.Aa=!1;Hb.prototype.isDisposed=function(){return this.Aa};Hb.prototype.Ra=function(){if(this.gc)for(;this.gc.length;)this.gc.shift()()};var Ib=function(a,b){this.type=a;this.currentTarget=this.target=b;this.defaultPrevented=this.$a=!1;this.Md=!0};Ib.prototype.preventDefault=function(){this.defaultPrevented=!0;this.Md=!1};var Jb=function(a,b){Ib.call(this,a?a.type:"");this.relatedTarget=this.currentTarget=this.target=null;this.charCode=this.keyCode=this.button=this.screenY=this.screenX=this.clientY=this.clientX=this.offsetY=this.offsetX=0;this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.qb=this.state=null;a&&this.init(a,b)};t(Jb,Ib);
	Jb.prototype.init=function(a,b){var c=this.type=a.type,d=a.changedTouches?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.currentTarget=b;if(b=a.relatedTarget){if(eb){var e;a:{try{Za(b.nodeName);e=!0;break a}catch(f){}e=!1}e||(b=null)}}else"mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;null===d?(this.offsetX=fb||void 0!==a.offsetX?a.offsetX:a.layerX,this.offsetY=fb||void 0!==a.offsetY?a.offsetY:a.layerY,this.clientX=void 0!==a.clientX?a.clientX:
	a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0):(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0);this.button=a.button;this.keyCode=a.keyCode||0;this.charCode=a.charCode||("keypress"==c?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.state=a.state;this.qb=a;a.defaultPrevented&&
	this.preventDefault()};Jb.prototype.preventDefault=function(){Jb.hd.preventDefault.call(this);var a=this.qb;if(a.preventDefault)a.preventDefault();else if(a.returnValue=!1,Gb)try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode)a.keyCode=-1}catch(b){}};Jb.prototype.Ae=function(){return this.qb};var Kb="closure_listenable_"+(1E6*Math.random()|0),Lb=0;var Mb=function(a,b,c,d,e){this.listener=a;this.lc=null;this.src=b;this.type=c;this.capture=!!d;this.Yb=e;this.key=++Lb;this.gb=this.Pb=!1},Nb=function(a){a.gb=!0;a.listener=null;a.lc=null;a.src=null;a.Yb=null};var Ob=function(a){this.src=a;this.C={};this.Lb=0};Ob.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.C[f];a||(a=this.C[f]=[],this.Lb++);var g=Pb(a,b,d,e);-1<g?(b=a[g],c||(b.Pb=!1)):(b=new Mb(b,this.src,f,!!d,e),b.Pb=c,a.push(b));return b};Ob.prototype.remove=function(a,b,c,d){a=a.toString();if(!(a in this.C))return!1;var e=this.C[a];b=Pb(e,b,c,d);return-1<b?(Nb(e[b]),Ia(e,b),0==e.length&&(delete this.C[a],this.Lb--),!0):!1};
	var Qb=function(a,b){var c=b.type;c in a.C&&Ja(a.C[c],b)&&(Nb(b),0==a.C[c].length&&(delete a.C[c],a.Lb--))};Ob.prototype.Kc=function(a,b,c,d){a=this.C[a.toString()];var e=-1;a&&(e=Pb(a,b,c,d));return-1<e?a[e]:null};var Pb=function(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.gb&&f.listener==b&&f.capture==!!c&&f.Yb==d)return e}return-1};var Rb="closure_lm_"+(1E6*Math.random()|0),Sb={},Tb=0,Ub=function(a,b,c,d,e){if(da(b))for(var f=0;f<b.length;f++)Ub(a,b[f],c,d,e);else c=Vb(c),a&&a[Kb]?a.listen(b,c,d,e):Wb(a,b,c,!1,d,e)},Wb=function(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var g=!!e,k=Xb(a);k||(a[Rb]=k=new Ob(a));c=k.add(b,c,d,e,f);if(!c.lc){d=Yb();c.lc=d;d.src=a;d.listener=c;if(a.addEventListener)a.addEventListener(b.toString(),d,g);else if(a.attachEvent)a.attachEvent(Zb(b.toString()),d);else throw Error("addEventListener and attachEvent are unavailable.");
	Tb++}},Yb=function(){var a=$b,b=Fb?function(c){return a.call(b.src,b.listener,c)}:function(c){c=a.call(b.src,b.listener,c);if(!c)return c};return b},ac=function(a,b,c,d,e){if(da(b))for(var f=0;f<b.length;f++)ac(a,b[f],c,d,e);else c=Vb(c),a&&a[Kb]?bc(a,b,c,d,e):Wb(a,b,c,!0,d,e)},cc=function(a,b,c,d,e){if(da(b))for(var f=0;f<b.length;f++)cc(a,b[f],c,d,e);else c=Vb(c),a&&a[Kb]?a.aa.remove(String(b),c,d,e):a&&(a=Xb(a))&&(b=a.Kc(b,c,!!d,e))&&dc(b)},dc=function(a){if(!fa(a)&&a&&!a.gb){var b=a.src;if(b&&
	b[Kb])Qb(b.aa,a);else{var c=a.type,d=a.lc;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent&&b.detachEvent(Zb(c),d);Tb--;(c=Xb(b))?(Qb(c,a),0==c.Lb&&(c.src=null,b[Rb]=null)):Nb(a)}}},Zb=function(a){return a in Sb?Sb[a]:Sb[a]="on"+a},fc=function(a,b,c,d){var e=!0;if(a=Xb(a))if(b=a.C[b.toString()])for(b=b.concat(),a=0;a<b.length;a++){var f=b[a];f&&f.capture==c&&!f.gb&&(f=ec(f,d),e=e&&!1!==f)}return e},ec=function(a,b){var c=a.listener,d=a.Yb||a.src;a.Pb&&dc(a);return c.call(d,
	b)},$b=function(a,b){if(a.gb)return!0;if(!Fb){if(!b)a:{b=["window","event"];for(var c=l,d;d=b.shift();)if(null!=c[d])c=c[d];else{b=null;break a}b=c}d=b;b=new Jb(d,this);c=!0;if(!(0>d.keyCode||void 0!=d.returnValue)){a:{var e=!1;if(0==d.keyCode)try{d.keyCode=-1;break a}catch(g){e=!0}if(e||void 0==d.returnValue)d.returnValue=!0}d=[];for(e=b.currentTarget;e;e=e.parentNode)d.push(e);a=a.type;for(e=d.length-1;!b.$a&&0<=e;e--){b.currentTarget=d[e];var f=fc(d[e],a,!0,b),c=c&&f}for(e=0;!b.$a&&e<d.length;e++)b.currentTarget=
	d[e],f=fc(d[e],a,!1,b),c=c&&f}return c}return ec(a,new Jb(b,this))},Xb=function(a){a=a[Rb];return a instanceof Ob?a:null},gc="__closure_events_fn_"+(1E9*Math.random()>>>0),Vb=function(a){w(a,"Listener can not be null.");if(q(a))return a;w(a.handleEvent,"An object listener must have handleEvent method.");a[gc]||(a[gc]=function(b){return a.handleEvent(b)});return a[gc]};var hc=/^[+a-zA-Z0-9_.!#$%&'*\/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/;var jc=function(){this.sc="";this.ge=ic};jc.prototype.bc=!0;jc.prototype.Wb=function(){return this.sc};jc.prototype.toString=function(){return"Const{"+this.sc+"}"};var kc=function(a){if(a instanceof jc&&a.constructor===jc&&a.ge===ic)return a.sc;xa("expected object of type Const, got '"+a+"'");return"type_error:Const"},ic={},lc=function(a){var b=new jc;b.sc=a;return b};lc("");var nc=function(){this.ma="";this.fe=mc};nc.prototype.bc=!0;nc.prototype.Wb=function(){return this.ma};nc.prototype.toString=function(){return"SafeUrl{"+this.ma+"}"};
	var oc=function(a){if(a instanceof nc&&a.constructor===nc&&a.fe===mc)return a.ma;xa("expected object of type SafeUrl, got '"+a+"' of type "+m(a));return"type_error:SafeUrl"},pc=/^(?:(?:https?|mailto|ftp):|[^&:/?#]*(?:[/?#]|$))/i,rc=function(a){if(a instanceof nc)return a;a=a.bc?a.Wb():String(a);pc.test(a)||(a="about:invalid#zClosurez");return qc(a)},mc={},qc=function(a){var b=new nc;b.ma=a;return b};qc("about:blank");var sc=function(a){return/^\s*$/.test(a)?!1:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/(?:"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)[\s\u2028\u2029]*(?=:|,|]|}|$)/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,""))},tc=function(a){a=String(a);if(sc(a))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);},wc=function(a){var b=[];uc(new vc,a,b);return b.join("")},vc=function(){this.nc=void 0},
	uc=function(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if(da(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),e=d[f],uc(a,a.nc?a.nc.call(d,String(f),e):e,c),e=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");f="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(e=b[d],"function"!=typeof e&&(c.push(f),xc(d,c),c.push(":"),uc(a,a.nc?a.nc.call(b,d,e):e,c),f=","));c.push("}");return}}switch(typeof b){case "string":xc(b,
	c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}},yc={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},zc=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g,xc=function(a,b){b.push('"',a.replace(zc,function(a){var b=yc[a];b||(b="\\u"+(a.charCodeAt(0)|65536).toString(16).substr(1),
	yc[a]=b);return b}),'"')};var Ac=function(){};Ac.prototype.ld=null;var Bc=function(a){return a.ld||(a.ld=a.Pc())};var Cc,Dc=function(){};t(Dc,Ac);Dc.prototype.Rb=function(){var a=Ec(this);return a?new ActiveXObject(a):new XMLHttpRequest};Dc.prototype.Pc=function(){var a={};Ec(this)&&(a[0]=!0,a[1]=!0);return a};
	var Ec=function(a){if(!a.Ad&&"undefined"==typeof XMLHttpRequest&&"undefined"!=typeof ActiveXObject){for(var b=["MSXML2.XMLHTTP.6.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"],c=0;c<b.length;c++){var d=b[c];try{return new ActiveXObject(d),a.Ad=d}catch(e){}}throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");}return a.Ad};Cc=new Dc;var Fc=function(){};t(Fc,Ac);Fc.prototype.Rb=function(){var a=new XMLHttpRequest;if("withCredentials"in a)return a;if("undefined"!=typeof XDomainRequest)return new Gc;throw Error("Unsupported browser");};Fc.prototype.Pc=function(){return{}};
	var Gc=function(){this.pa=new XDomainRequest;this.readyState=0;this.onreadystatechange=null;this.responseText="";this.status=-1;this.statusText=this.responseXML=null;this.pa.onload=r(this.De,this);this.pa.onerror=r(this.xd,this);this.pa.onprogress=r(this.Ee,this);this.pa.ontimeout=r(this.Fe,this)};h=Gc.prototype;h.open=function(a,b,c){if(null!=c&&!c)throw Error("Only async requests are supported.");this.pa.open(a,b)};
	h.send=function(a){if(a)if("string"==typeof a)this.pa.send(a);else throw Error("Only string data is supported");else this.pa.send()};h.abort=function(){this.pa.abort()};h.setRequestHeader=function(){};h.De=function(){this.status=200;this.responseText=this.pa.responseText;Hc(this,4)};h.xd=function(){this.status=500;this.responseText="";Hc(this,4)};h.Fe=function(){this.xd()};h.Ee=function(){this.status=200;Hc(this,1)};var Hc=function(a,b){a.readyState=b;if(a.onreadystatechange)a.onreadystatechange()};var Jc=function(){this.jc="";this.he=Ic};Jc.prototype.bc=!0;Jc.prototype.Wb=function(){return this.jc};Jc.prototype.toString=function(){return"TrustedResourceUrl{"+this.jc+"}"};var Ic={};var Lc=function(){this.ma="";this.ee=Kc};Lc.prototype.bc=!0;Lc.prototype.Wb=function(){return this.ma};Lc.prototype.toString=function(){return"SafeHtml{"+this.ma+"}"};var Mc=function(a){if(a instanceof Lc&&a.constructor===Lc&&a.ee===Kc)return a.ma;xa("expected object of type SafeHtml, got '"+a+"' of type "+m(a));return"type_error:SafeHtml"},Kc={};Lc.prototype.Me=function(a){this.ma=a;return this};!eb&&!A||A&&9<=Number(mb)||eb&&B("1.9.1");A&&B("9");var Oc=function(a,b){Na(b,function(b,d){"style"==d?a.style.cssText=b:"class"==d?a.className=b:"for"==d?a.htmlFor=b:Nc.hasOwnProperty(d)?a.setAttribute(Nc[d],b):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,b):a[d]=b})},Nc={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};var Pc=function(a,b,c){this.Qe=c;this.oe=a;this.df=b;this.fc=0;this.Zb=null};Pc.prototype.get=function(){var a;0<this.fc?(this.fc--,a=this.Zb,this.Zb=a.next,a.next=null):a=this.oe();return a};Pc.prototype.put=function(a){this.df(a);this.fc<this.Qe&&(this.fc++,a.next=this.Zb,this.Zb=a)};var Qc=function(a){l.setTimeout(function(){throw a;},0)},Rc,Sc=function(){var a=l.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!z("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+"//"+b.location.host,
	a=r(function(a){if(("*"==d||a.origin==d)&&a.data==c)this.port1.onmessage()},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d)}}});if("undefined"!==typeof a&&!z("Trident")&&!z("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var a=c.od;c.od=null;a()}};return function(a){d.next={od:a};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?
	function(a){var b=document.createElement("SCRIPT");b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null};document.documentElement.appendChild(b)}:function(a){l.setTimeout(a,0)}};var Tc=function(){this.yc=this.La=null},Vc=new Pc(function(){return new Uc},function(a){a.reset()},100);Tc.prototype.add=function(a,b){var c=Vc.get();c.set(a,b);this.yc?this.yc.next=c:(w(!this.La),this.La=c);this.yc=c};Tc.prototype.remove=function(){var a=null;this.La&&(a=this.La,this.La=this.La.next,this.La||(this.yc=null),a.next=null);return a};var Uc=function(){this.next=this.scope=this.Jc=null};Uc.prototype.set=function(a,b){this.Jc=a;this.scope=b;this.next=null};
	Uc.prototype.reset=function(){this.next=this.scope=this.Jc=null};var $c=function(a,b){Wc||Xc();Yc||(Wc(),Yc=!0);Zc.add(a,b)},Wc,Xc=function(){if(-1!=String(l.Promise).indexOf("[native code]")){var a=l.Promise.resolve(void 0);Wc=function(){a.then(ad)}}else Wc=function(){var a=ad;!q(l.setImmediate)||l.Window&&l.Window.prototype&&!z("Edge")&&l.Window.prototype.setImmediate==l.setImmediate?(Rc||(Rc=Sc()),Rc(a)):l.setImmediate(a)}},Yc=!1,Zc=new Tc,ad=function(){for(var a;a=Zc.remove();){try{a.Jc.call(a.scope)}catch(b){Qc(b)}Vc.put(a)}Yc=!1};var bd=function(a){a.prototype.then=a.prototype.then;a.prototype.$goog_Thenable=!0},cd=function(a){if(!a)return!1;try{return!!a.$goog_Thenable}catch(b){return!1}};var C=function(a,b){this.M=0;this.na=void 0;this.Pa=this.ja=this.s=null;this.Xb=this.Ic=!1;if(a!=ba)try{var c=this;a.call(b,function(a){dd(c,2,a)},function(a){if(!(a instanceof ed))try{if(a instanceof Error)throw a;throw Error("Promise rejected.");}catch(e){}dd(c,3,a)})}catch(d){dd(this,3,d)}},fd=function(){this.next=this.context=this.Xa=this.Fa=this.child=null;this.ob=!1};fd.prototype.reset=function(){this.context=this.Xa=this.Fa=this.child=null;this.ob=!1};
	var gd=new Pc(function(){return new fd},function(a){a.reset()},100),hd=function(a,b,c){var d=gd.get();d.Fa=a;d.Xa=b;d.context=c;return d},D=function(a){if(a instanceof C)return a;var b=new C(ba);dd(b,2,a);return b},E=function(a){return new C(function(b,c){c(a)})},jd=function(a,b,c){id(a,b,c,null)||$c(ja(b,a))},kd=function(a){return new C(function(b){var c=a.length,d=[];if(c)for(var e=function(a,e,f){c--;d[a]=e?{ye:!0,value:f}:{ye:!1,reason:f};0==c&&b(d)},f=0,g;f<a.length;f++)g=a[f],jd(g,ja(e,f,!0),
	ja(e,f,!1));else b(d)})};C.prototype.then=function(a,b,c){null!=a&&Aa(a,"opt_onFulfilled should be a function.");null!=b&&Aa(b,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?");return ld(this,q(a)?a:null,q(b)?b:null,c)};bd(C);var nd=function(a,b){b=hd(b,b,void 0);b.ob=!0;md(a,b);return a};C.prototype.c=function(a,b){return ld(this,null,a,b)};C.prototype.cancel=function(a){0==this.M&&$c(function(){var b=new ed(a);od(this,b)},this)};
	var od=function(a,b){if(0==a.M)if(a.s){var c=a.s;if(c.ja){for(var d=0,e=null,f=null,g=c.ja;g&&(g.ob||(d++,g.child==a&&(e=g),!(e&&1<d)));g=g.next)e||(f=g);e&&(0==c.M&&1==d?od(c,b):(f?(d=f,w(c.ja),w(null!=d),d.next==c.Pa&&(c.Pa=d),d.next=d.next.next):pd(c),qd(c,e,3,b)))}a.s=null}else dd(a,3,b)},md=function(a,b){a.ja||2!=a.M&&3!=a.M||rd(a);w(null!=b.Fa);a.Pa?a.Pa.next=b:a.ja=b;a.Pa=b},ld=function(a,b,c,d){var e=hd(null,null,null);e.child=new C(function(a,g){e.Fa=b?function(c){try{var e=b.call(d,c);a(e)}catch(y){g(y)}}:
	a;e.Xa=c?function(b){try{var e=c.call(d,b);void 0===e&&b instanceof ed?g(b):a(e)}catch(y){g(y)}}:g});e.child.s=a;md(a,e);return e.child};C.prototype.qf=function(a){w(1==this.M);this.M=0;dd(this,2,a)};C.prototype.rf=function(a){w(1==this.M);this.M=0;dd(this,3,a)};
	var dd=function(a,b,c){0==a.M&&(a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself")),a.M=1,id(c,a.qf,a.rf,a)||(a.na=c,a.M=b,a.s=null,rd(a),3!=b||c instanceof ed||sd(a,c)))},id=function(a,b,c,d){if(a instanceof C)return null!=b&&Aa(b,"opt_onFulfilled should be a function."),null!=c&&Aa(c,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?"),md(a,hd(b||ba,c||null,d)),!0;if(cd(a))return a.then(b,c,d),!0;if(ga(a))try{var e=a.then;if(q(e))return td(a,
	e,b,c,d),!0}catch(f){return c.call(d,f),!0}return!1},td=function(a,b,c,d,e){var f=!1,g=function(a){f||(f=!0,c.call(e,a))},k=function(a){f||(f=!0,d.call(e,a))};try{b.call(a,g,k)}catch(n){k(n)}},rd=function(a){a.Ic||(a.Ic=!0,$c(a.te,a))},pd=function(a){var b=null;a.ja&&(b=a.ja,a.ja=b.next,b.next=null);a.ja||(a.Pa=null);null!=b&&w(null!=b.Fa);return b};C.prototype.te=function(){for(var a;a=pd(this);)qd(this,a,this.M,this.na);this.Ic=!1};
	var qd=function(a,b,c,d){if(3==c&&b.Xa&&!b.ob)for(;a&&a.Xb;a=a.s)a.Xb=!1;if(b.child)b.child.s=null,ud(b,c,d);else try{b.ob?b.Fa.call(b.context):ud(b,c,d)}catch(e){vd.call(null,e)}gd.put(b)},ud=function(a,b,c){2==b?a.Fa.call(a.context,c):a.Xa&&a.Xa.call(a.context,c)},sd=function(a,b){a.Xb=!0;$c(function(){a.Xb&&vd.call(null,b)})},vd=Qc,ed=function(a){u.call(this,a)};t(ed,u);ed.prototype.name="cancel";/*
	 Portions of this code are from MochiKit, received by
	 The Closure Authors under the MIT license. All other code is Copyright
	 2005-2009 The Closure Authors. All Rights Reserved.
	*/
	var wd=function(a,b){this.pc=[];this.Gd=a;this.rd=b||null;this.sb=this.Ta=!1;this.na=void 0;this.fd=this.kd=this.Dc=!1;this.wc=0;this.s=null;this.Ec=0};wd.prototype.cancel=function(a){if(this.Ta)this.na instanceof wd&&this.na.cancel();else{if(this.s){var b=this.s;delete this.s;a?b.cancel(a):(b.Ec--,0>=b.Ec&&b.cancel())}this.Gd?this.Gd.call(this.rd,this):this.fd=!0;this.Ta||xd(this,new yd)}};wd.prototype.pd=function(a,b){this.Dc=!1;zd(this,a,b)};
	var zd=function(a,b,c){a.Ta=!0;a.na=c;a.sb=!b;Ad(a)},Cd=function(a){if(a.Ta){if(!a.fd)throw new Bd;a.fd=!1}};wd.prototype.callback=function(a){Cd(this);Dd(a);zd(this,!0,a)};
	var xd=function(a,b){Cd(a);Dd(b);zd(a,!1,b)},Dd=function(a){w(!(a instanceof wd),"An execution sequence may not be initiated with a blocking Deferred.")},Hd=function(a){var b=Ed("https://apis.google.com/js/client.js?onload="+Fd);Gd(b,null,a,void 0)},Gd=function(a,b,c,d){w(!a.kd,"Blocking Deferreds can not be re-used");a.pc.push([b,c,d]);a.Ta&&Ad(a)};wd.prototype.then=function(a,b,c){var d,e,f=new C(function(a,b){d=a;e=b});Gd(this,d,function(a){a instanceof yd?f.cancel():e(a)});return f.then(a,b,c)};
	bd(wd);
	var Id=function(a){return Ea(a.pc,function(a){return q(a[1])})},Ad=function(a){if(a.wc&&a.Ta&&Id(a)){var b=a.wc,c=Jd[b];c&&(l.clearTimeout(c.tb),delete Jd[b]);a.wc=0}a.s&&(a.s.Ec--,delete a.s);for(var b=a.na,d=c=!1;a.pc.length&&!a.Dc;){var e=a.pc.shift(),f=e[0],g=e[1],e=e[2];if(f=a.sb?g:f)try{var k=f.call(e||a.rd,b);void 0!==k&&(a.sb=a.sb&&(k==b||k instanceof Error),a.na=b=k);if(cd(b)||"function"===typeof l.Promise&&b instanceof l.Promise)d=!0,a.Dc=!0}catch(n){b=n,a.sb=!0,Id(a)||(c=!0)}}a.na=b;d&&
	(k=r(a.pd,a,!0),d=r(a.pd,a,!1),b instanceof wd?(Gd(b,k,d),b.kd=!0):b.then(k,d));c&&(b=new Kd(b),Jd[b.tb]=b,a.wc=b.tb)},Bd=function(){u.call(this)};t(Bd,u);Bd.prototype.message="Deferred has already fired";Bd.prototype.name="AlreadyCalledError";var yd=function(){u.call(this)};t(yd,u);yd.prototype.message="Deferred was canceled";yd.prototype.name="CanceledError";var Kd=function(a){this.tb=l.setTimeout(r(this.pf,this),0);this.O=a};
	Kd.prototype.pf=function(){w(Jd[this.tb],"Cannot throw an error that is not scheduled.");delete Jd[this.tb];throw this.O;};var Jd={};var Ed=function(a){var b=new Jc;b.jc=a;return Ld(b)},Ld=function(a){var b={},c=b.document||document,d;a instanceof Jc&&a.constructor===Jc&&a.he===Ic?d=a.jc:(xa("expected object of type TrustedResourceUrl, got '"+a+"' of type "+m(a)),d="type_error:TrustedResourceUrl");var e=document.createElement("SCRIPT");a={Nd:e,Kb:void 0};var f=new wd(Md,a),g=null,k=null!=b.timeout?b.timeout:5E3;0<k&&(g=window.setTimeout(function(){Nd(e,!0);xd(f,new Od(1,"Timeout reached for loading script "+d))},k),a.Kb=g);e.onload=
	e.onreadystatechange=function(){e.readyState&&"loaded"!=e.readyState&&"complete"!=e.readyState||(Nd(e,b.Cf||!1,g),f.callback(null))};e.onerror=function(){Nd(e,!0,g);xd(f,new Od(0,"Error while loading script "+d))};a=b.attributes||{};Ua(a,{type:"text/javascript",charset:"UTF-8",src:d});Oc(e,a);Pd(c).appendChild(e);return f},Pd=function(a){var b;return(b=(a||document).getElementsByTagName("HEAD"))&&0!=b.length?b[0]:a.documentElement},Md=function(){if(this&&this.Nd){var a=this.Nd;a&&"SCRIPT"==a.tagName&&
	Nd(a,!0,this.Kb)}},Nd=function(a,b,c){null!=c&&l.clearTimeout(c);a.onload=ba;a.onerror=ba;a.onreadystatechange=ba;b&&window.setTimeout(function(){a&&a.parentNode&&a.parentNode.removeChild(a)},0)},Od=function(a,b){var c="Jsloader error (code #"+a+")";b&&(c+=": "+b);u.call(this,c);this.code=a};t(Od,u);var Qd=function(){Hb.call(this);this.aa=new Ob(this);this.ke=this;this.Vc=null};t(Qd,Hb);Qd.prototype[Kb]=!0;h=Qd.prototype;h.addEventListener=function(a,b,c,d){Ub(this,a,b,c,d)};h.removeEventListener=function(a,b,c,d){cc(this,a,b,c,d)};
	h.dispatchEvent=function(a){Rd(this);var b,c=this.Vc;if(c){b=[];for(var d=1;c;c=c.Vc)b.push(c),w(1E3>++d,"infinite loop")}c=this.ke;d=a.type||a;if(p(a))a=new Ib(a,c);else if(a instanceof Ib)a.target=a.target||c;else{var e=a;a=new Ib(d,c);Ua(a,e)}var e=!0,f;if(b)for(var g=b.length-1;!a.$a&&0<=g;g--)f=a.currentTarget=b[g],e=Sd(f,d,!0,a)&&e;a.$a||(f=a.currentTarget=c,e=Sd(f,d,!0,a)&&e,a.$a||(e=Sd(f,d,!1,a)&&e));if(b)for(g=0;!a.$a&&g<b.length;g++)f=a.currentTarget=b[g],e=Sd(f,d,!1,a)&&e;return e};
	h.Ra=function(){Qd.hd.Ra.call(this);if(this.aa){var a=this.aa,b=0,c;for(c in a.C){for(var d=a.C[c],e=0;e<d.length;e++)++b,Nb(d[e]);delete a.C[c];a.Lb--}}this.Vc=null};h.listen=function(a,b,c,d){Rd(this);return this.aa.add(String(a),b,!1,c,d)};
	var bc=function(a,b,c,d,e){a.aa.add(String(b),c,!0,d,e)},Sd=function(a,b,c,d){b=a.aa.C[String(b)];if(!b)return!0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var g=b[f];if(g&&!g.gb&&g.capture==c){var k=g.listener,n=g.Yb||g.src;g.Pb&&Qb(a.aa,g);e=!1!==k.call(n,d)&&e}}return e&&0!=d.Md};Qd.prototype.Kc=function(a,b,c,d){return this.aa.Kc(String(a),b,c,d)};var Rd=function(a){w(a.aa,"Event target is not initialized. Did you call the superclass (goog.events.EventTarget) constructor?")};var Td="StopIteration"in l?l.StopIteration:{message:"StopIteration",stack:""},Ud=function(){};Ud.prototype.next=function(){throw Td;};Ud.prototype.je=function(){return this};var Vd=function(a,b){this.ba={};this.w=[];this.nb=this.o=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else a&&this.addAll(a)};Vd.prototype.Y=function(){Wd(this);for(var a=[],b=0;b<this.w.length;b++)a.push(this.ba[this.w[b]]);return a};Vd.prototype.ka=function(){Wd(this);return this.w.concat()};Vd.prototype.pb=function(a){return Xd(this.ba,a)};
	Vd.prototype.remove=function(a){return Xd(this.ba,a)?(delete this.ba[a],this.o--,this.nb++,this.w.length>2*this.o&&Wd(this),!0):!1};var Wd=function(a){if(a.o!=a.w.length){for(var b=0,c=0;b<a.w.length;){var d=a.w[b];Xd(a.ba,d)&&(a.w[c++]=d);b++}a.w.length=c}if(a.o!=a.w.length){for(var e={},c=b=0;b<a.w.length;)d=a.w[b],Xd(e,d)||(a.w[c++]=d,e[d]=1),b++;a.w.length=c}};h=Vd.prototype;h.get=function(a,b){return Xd(this.ba,a)?this.ba[a]:b};
	h.set=function(a,b){Xd(this.ba,a)||(this.o++,this.w.push(a),this.nb++);this.ba[a]=b};h.addAll=function(a){var b;a instanceof Vd?(b=a.ka(),a=a.Y()):(b=Pa(a),a=Oa(a));for(var c=0;c<b.length;c++)this.set(b[c],a[c])};h.forEach=function(a,b){for(var c=this.ka(),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this)}};h.clone=function(){return new Vd(this)};
	h.je=function(a){Wd(this);var b=0,c=this.nb,d=this,e=new Ud;e.next=function(){if(c!=d.nb)throw Error("The map has changed since the iterator was created");if(b>=d.w.length)throw Td;var e=d.w[b++];return a?e:d.ba[e]};return e};var Xd=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)};var Yd=function(a){if(a.Y&&"function"==typeof a.Y)return a.Y();if(p(a))return a.split("");if(ea(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}return Oa(a)},Zd=function(a){if(a.ka&&"function"==typeof a.ka)return a.ka();if(!a.Y||"function"!=typeof a.Y){if(ea(a)||p(a)){var b=[];a=a.length;for(var c=0;c<a;c++)b.push(c);return b}return Pa(a)}},$d=function(a,b){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,void 0);else if(ea(a)||p(a))x(a,b,void 0);else for(var c=Zd(a),d=Yd(a),e=
	d.length,f=0;f<e;f++)b.call(void 0,d[f],c&&c[f],a)};var ae=function(a,b,c,d,e){this.reset(a,b,c,d,e)};ae.prototype.td=null;var be=0;ae.prototype.reset=function(a,b,c,d,e){"number"==typeof e||be++;d||ka();this.xb=a;this.Ve=b;delete this.td};ae.prototype.Qd=function(a){this.xb=a};var ce=function(a){this.We=a;this.yd=this.Fc=this.xb=this.s=null},de=function(a,b){this.name=a;this.value=b};de.prototype.toString=function(){return this.name};var ee=new de("SEVERE",1E3),fe=new de("CONFIG",700),ge=new de("FINE",500);ce.prototype.getParent=function(){return this.s};ce.prototype.Qd=function(a){this.xb=a};var he=function(a){if(a.xb)return a.xb;if(a.s)return he(a.s);xa("Root logger has no level set.");return null};
	ce.prototype.log=function(a,b,c){if(a.value>=he(this).value)for(q(b)&&(b=b()),a=new ae(a,String(b),this.We),c&&(a.td=c),c="log:"+a.Ve,l.console&&(l.console.timeStamp?l.console.timeStamp(c):l.console.markTimeline&&l.console.markTimeline(c)),l.msWriteProfilerMark&&l.msWriteProfilerMark(c),c=this;c;){var d=c,e=a;if(d.yd)for(var f=0;b=d.yd[f];f++)b(e);c=c.getParent()}};
	var ie={},je=null,ke=function(a){je||(je=new ce(""),ie[""]=je,je.Qd(fe));var b;if(!(b=ie[a])){b=new ce(a);var c=a.lastIndexOf("."),d=a.substr(c+1),c=ke(a.substr(0,c));c.Fc||(c.Fc={});c.Fc[d]=b;b.s=c;ie[a]=b}return b};var F=function(a,b){a&&a.log(ge,b,void 0)};var le=function(a,b,c){if(q(a))c&&(a=r(a,c));else if(a&&"function"==typeof a.handleEvent)a=r(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(b)?-1:l.setTimeout(a,b||0)},me=function(a){var b=null;return(new C(function(c,d){b=le(function(){c(void 0)},a);-1==b&&d(Error("Failed to schedule timer."))})).c(function(a){l.clearTimeout(b);throw a;})};var ne=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/,pe=function(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e,f=null;0<=d?(e=a[c].substring(0,d),f=a[c].substring(d+1)):e=a[c];b(e,f?decodeURIComponent(f.replace(/\+/g," ")):"")}}};var G=function(a){Qd.call(this);this.headers=new Vd;this.Ac=a||null;this.qa=!1;this.zc=this.b=null;this.wb=this.Ed=this.ec="";this.Ca=this.Nc=this.cc=this.Hc=!1;this.kb=0;this.uc=null;this.Ld="";this.xc=this.bf=this.ae=!1};t(G,Qd);var qe=G.prototype,re=ke("goog.net.XhrIo");qe.U=re;var se=/^https?$/i,te=["POST","PUT"];
	G.prototype.send=function(a,b,c,d){if(this.b)throw Error("[goog.net.XhrIo] Object is active with another request="+this.ec+"; newUri="+a);b=b?b.toUpperCase():"GET";this.ec=a;this.wb="";this.Ed=b;this.Hc=!1;this.qa=!0;this.b=this.Ac?this.Ac.Rb():Cc.Rb();this.zc=this.Ac?Bc(this.Ac):Bc(Cc);this.b.onreadystatechange=r(this.Id,this);this.bf&&"onprogress"in this.b&&(this.b.onprogress=r(function(a){this.Hd(a,!0)},this),this.b.upload&&(this.b.upload.onprogress=r(this.Hd,this)));try{F(this.U,ue(this,"Opening Xhr")),
	this.Nc=!0,this.b.open(b,String(a),!0),this.Nc=!1}catch(f){F(this.U,ue(this,"Error opening Xhr: "+f.message));this.O(5,f);return}a=c||"";var e=this.headers.clone();d&&$d(d,function(a,b){e.set(b,a)});d=Ga(e.ka());c=l.FormData&&a instanceof l.FormData;!Ha(te,b)||d||c||e.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");e.forEach(function(a,b){this.b.setRequestHeader(b,a)},this);this.Ld&&(this.b.responseType=this.Ld);"withCredentials"in this.b&&this.b.withCredentials!==this.ae&&(this.b.withCredentials=
	this.ae);try{ve(this),0<this.kb&&(this.xc=we(this.b),F(this.U,ue(this,"Will abort after "+this.kb+"ms if incomplete, xhr2 "+this.xc)),this.xc?(this.b.timeout=this.kb,this.b.ontimeout=r(this.Kb,this)):this.uc=le(this.Kb,this.kb,this)),F(this.U,ue(this,"Sending request")),this.cc=!0,this.b.send(a),this.cc=!1}catch(f){F(this.U,ue(this,"Send error: "+f.message)),this.O(5,f)}};var we=function(a){return A&&B(9)&&fa(a.timeout)&&void 0!==a.ontimeout},Fa=function(a){return"content-type"==a.toLowerCase()};
	G.prototype.Kb=function(){"undefined"!=typeof aa&&this.b&&(this.wb="Timed out after "+this.kb+"ms, aborting",F(this.U,ue(this,this.wb)),this.dispatchEvent("timeout"),this.abort(8))};G.prototype.O=function(a,b){this.qa=!1;this.b&&(this.Ca=!0,this.b.abort(),this.Ca=!1);this.wb=b;xe(this);ye(this)};var xe=function(a){a.Hc||(a.Hc=!0,a.dispatchEvent("complete"),a.dispatchEvent("error"))};
	G.prototype.abort=function(){this.b&&this.qa&&(F(this.U,ue(this,"Aborting")),this.qa=!1,this.Ca=!0,this.b.abort(),this.Ca=!1,this.dispatchEvent("complete"),this.dispatchEvent("abort"),ye(this))};G.prototype.Ra=function(){this.b&&(this.qa&&(this.qa=!1,this.Ca=!0,this.b.abort(),this.Ca=!1),ye(this,!0));G.hd.Ra.call(this)};G.prototype.Id=function(){this.isDisposed()||(this.Nc||this.cc||this.Ca?ze(this):this.$e())};G.prototype.$e=function(){ze(this)};
	var ze=function(a){if(a.qa&&"undefined"!=typeof aa)if(a.zc[1]&&4==Ae(a)&&2==Be(a))F(a.U,ue(a,"Local request error detected and ignored"));else if(a.cc&&4==Ae(a))le(a.Id,0,a);else if(a.dispatchEvent("readystatechange"),4==Ae(a)){F(a.U,ue(a,"Request complete"));a.qa=!1;try{var b=Be(a),c;a:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:c=!0;break a;default:c=!1}var d;if(!(d=c)){var e;if(e=0===b){var f=String(a.ec).match(ne)[1]||null;if(!f&&l.self&&l.self.location)var g=l.self.location.protocol,
	f=g.substr(0,g.length-1);e=!se.test(f?f.toLowerCase():"")}d=e}if(d)a.dispatchEvent("complete"),a.dispatchEvent("success");else{var k;try{k=2<Ae(a)?a.b.statusText:""}catch(n){F(a.U,"Can not get status: "+n.message),k=""}a.wb=k+" ["+Be(a)+"]";xe(a)}}finally{ye(a)}}};G.prototype.Hd=function(a,b){w("progress"===a.type,"goog.net.EventType.PROGRESS is of the same type as raw XHR progress.");this.dispatchEvent(Ce(a,"progress"));this.dispatchEvent(Ce(a,b?"downloadprogress":"uploadprogress"))};
	var Ce=function(a,b){return{type:b,lengthComputable:a.lengthComputable,loaded:a.loaded,total:a.total}},ye=function(a,b){if(a.b){ve(a);var c=a.b,d=a.zc[0]?ba:null;a.b=null;a.zc=null;b||a.dispatchEvent("ready");try{c.onreadystatechange=d}catch(e){(a=a.U)&&a.log(ee,"Problem encountered resetting onreadystatechange: "+e.message,void 0)}}},ve=function(a){a.b&&a.xc&&(a.b.ontimeout=null);fa(a.uc)&&(l.clearTimeout(a.uc),a.uc=null)},Ae=function(a){return a.b?a.b.readyState:0},Be=function(a){try{return 2<Ae(a)?
	a.b.status:-1}catch(b){return-1}},De=function(a){try{return a.b?a.b.responseText:""}catch(b){return F(a.U,"Can not get responseText: "+b.message),""}},ue=function(a,b){return b+" ["+a.Ed+" "+a.ec+" "+Be(a)+"]"};var Ee=function(a,b){this.$=this.Ja=this.da="";this.Za=null;this.Ba=this.sa="";this.R=this.Pe=!1;var c;a instanceof Ee?(this.R=void 0!==b?b:a.R,Fe(this,a.da),c=a.Ja,H(this),this.Ja=c,Ge(this,a.$),He(this,a.Za),Ie(this,a.sa),Je(this,a.W.clone()),a=a.Ba,H(this),this.Ba=a):a&&(c=String(a).match(ne))?(this.R=!!b,Fe(this,c[1]||"",!0),a=c[2]||"",H(this),this.Ja=Ke(a),Ge(this,c[3]||"",!0),He(this,c[4]),Ie(this,c[5]||"",!0),Je(this,c[6]||"",!0),a=c[7]||"",H(this),this.Ba=Ke(a)):(this.R=!!b,this.W=new I(null,
	0,this.R))};Ee.prototype.toString=function(){var a=[],b=this.da;b&&a.push(Le(b,Me,!0),":");var c=this.$;if(c||"file"==b)a.push("//"),(b=this.Ja)&&a.push(Le(b,Me,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.Za,null!=c&&a.push(":",String(c));if(c=this.sa)this.$&&"/"!=c.charAt(0)&&a.push("/"),a.push(Le(c,"/"==c.charAt(0)?Ne:Oe,!0));(c=this.W.toString())&&a.push("?",c);(c=this.Ba)&&a.push("#",Le(c,Pe));return a.join("")};
	Ee.prototype.resolve=function(a){var b=this.clone(),c=!!a.da;c?Fe(b,a.da):c=!!a.Ja;if(c){var d=a.Ja;H(b);b.Ja=d}else c=!!a.$;c?Ge(b,a.$):c=null!=a.Za;d=a.sa;if(c)He(b,a.Za);else if(c=!!a.sa){if("/"!=d.charAt(0))if(this.$&&!this.sa)d="/"+d;else{var e=b.sa.lastIndexOf("/");-1!=e&&(d=b.sa.substr(0,e+1)+d)}e=d;if(".."==e||"."==e)d="";else if(v(e,"./")||v(e,"/.")){for(var d=0==e.lastIndexOf("/",0),e=e.split("/"),f=[],g=0;g<e.length;){var k=e[g++];"."==k?d&&g==e.length&&f.push(""):".."==k?((1<f.length||
	1==f.length&&""!=f[0])&&f.pop(),d&&g==e.length&&f.push("")):(f.push(k),d=!0)}d=f.join("/")}else d=e}c?Ie(b,d):c=""!==a.W.toString();c?Je(b,a.W.clone()):c=!!a.Ba;c&&(a=a.Ba,H(b),b.Ba=a);return b};Ee.prototype.clone=function(){return new Ee(this)};
	var Fe=function(a,b,c){H(a);a.da=c?Ke(b,!0):b;a.da&&(a.da=a.da.replace(/:$/,""))},Ge=function(a,b,c){H(a);a.$=c?Ke(b,!0):b},He=function(a,b){H(a);if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.Za=b}else a.Za=null},Ie=function(a,b,c){H(a);a.sa=c?Ke(b,!0):b},Je=function(a,b,c){H(a);b instanceof I?(a.W=b,a.W.ed(a.R)):(c||(b=Le(b,Qe)),a.W=new I(b,0,a.R))},J=function(a,b,c){H(a);a.W.set(b,c)},Re=function(a,b){return a.W.get(b)},Se=function(a,b){H(a);a.W.remove(b)},H=function(a){if(a.Pe)throw Error("Tried to modify a read-only Uri");
	};Ee.prototype.ed=function(a){this.R=a;this.W&&this.W.ed(a);return this};
	var Te=function(a){return a instanceof Ee?a.clone():new Ee(a,void 0)},Ue=function(a,b){var c=new Ee(null,void 0);Fe(c,"https");a&&Ge(c,a);b&&Ie(c,b);return c},Ke=function(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""},Le=function(a,b,c){return p(a)?(a=encodeURI(a).replace(b,Ve),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null},Ve=function(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)},Me=/[#\/\?@]/g,Oe=/[\#\?:]/g,Ne=/[\#\?]/g,Qe=/[\#\?@]/g,
	Pe=/#/g,I=function(a,b,c){this.o=this.l=null;this.N=a||null;this.R=!!c},We=function(a){a.l||(a.l=new Vd,a.o=0,a.N&&pe(a.N,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c)}))},Ye=function(a){var b=Zd(a);if("undefined"==typeof b)throw Error("Keys are undefined");var c=new I(null,0,void 0);a=Yd(a);for(var d=0;d<b.length;d++){var e=b[d],f=a[d];da(f)?Xe(c,e,f):c.add(e,f)}return c};h=I.prototype;
	h.add=function(a,b){We(this);this.N=null;a=this.P(a);var c=this.l.get(a);c||this.l.set(a,c=[]);c.push(b);this.o=ya(this.o)+1;return this};h.remove=function(a){We(this);a=this.P(a);return this.l.pb(a)?(this.N=null,this.o=ya(this.o)-this.l.get(a).length,this.l.remove(a)):!1};h.pb=function(a){We(this);a=this.P(a);return this.l.pb(a)};h.ka=function(){We(this);for(var a=this.l.Y(),b=this.l.ka(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};
	h.Y=function(a){We(this);var b=[];if(p(a))this.pb(a)&&(b=La(b,this.l.get(this.P(a))));else{a=this.l.Y();for(var c=0;c<a.length;c++)b=La(b,a[c])}return b};h.set=function(a,b){We(this);this.N=null;a=this.P(a);this.pb(a)&&(this.o=ya(this.o)-this.l.get(a).length);this.l.set(a,[b]);this.o=ya(this.o)+1;return this};h.get=function(a,b){a=a?this.Y(a):[];return 0<a.length?String(a[0]):b};var Xe=function(a,b,c){a.remove(b);0<c.length&&(a.N=null,a.l.set(a.P(b),Ma(c)),a.o=ya(a.o)+c.length)};
	I.prototype.toString=function(){if(this.N)return this.N;if(!this.l)return"";for(var a=[],b=this.l.ka(),c=0;c<b.length;c++)for(var d=b[c],e=encodeURIComponent(String(d)),d=this.Y(d),f=0;f<d.length;f++){var g=e;""!==d[f]&&(g+="="+encodeURIComponent(String(d[f])));a.push(g)}return this.N=a.join("&")};I.prototype.clone=function(){var a=new I;a.N=this.N;this.l&&(a.l=this.l.clone(),a.o=this.o);return a};I.prototype.P=function(a){a=String(a);this.R&&(a=a.toLowerCase());return a};
	I.prototype.ed=function(a){a&&!this.R&&(We(this),this.N=null,this.l.forEach(function(a,c){var b=c.toLowerCase();c!=b&&(this.remove(c),Xe(this,b,a))},this));this.R=a};var Ze=function(){var a=K();return A&&!!mb&&11==mb||/Edge\/\d+/.test(a)},$e=function(){return l.window&&l.window.location.href||""},af=function(a,b){b=b||l.window;var c="about:blank";a&&(c=oc(rc(a)));b.location.href=c},bf=function(a,b){var c=[],d;for(d in a)d in b?typeof a[d]!=typeof b[d]?c.push(d):da(a[d])?Ra(a[d],b[d])||c.push(d):"object"==typeof a[d]&&null!=a[d]&&null!=b[d]?0<bf(a[d],b[d]).length&&c.push(d):a[d]!==b[d]&&c.push(d):c.push(d);for(d in b)d in a||c.push(d);return c},df=function(){var a;
	a=K();a="Chrome"!=cf(a)?null:(a=a.match(/\sChrome\/(\d+)/i))&&2==a.length?parseInt(a[1],10):null;return a&&30>a?!1:!A||!mb||9<mb},ef=function(a){a=(a||K()).toLowerCase();return a.match(/android/)||a.match(/webos/)||a.match(/iphone|ipad|ipod/)||a.match(/blackberry/)||a.match(/windows phone/)||a.match(/iemobile/)?!0:!1},ff=function(a){a=a||l.window;try{a.close()}catch(b){}},gf=function(a,b,c){var d=Math.floor(1E9*Math.random()).toString();b=b||500;c=c||600;var e=(window.screen.availHeight-c)/2,f=(window.screen.availWidth-
	b)/2;b={width:b,height:c,top:0<e?e:0,left:0<f?f:0,location:!0,resizable:!0,statusbar:!0,toolbar:!1};c=K().toLowerCase();d&&(b.target=d,v(c,"crios/")&&(b.target="_blank"));"Firefox"==cf(K())&&(a=a||"http://localhost",b.scrollbars=!0);var g;c=a||"about:blank";(d=b)||(d={});a=window;b=c instanceof nc?c:rc("undefined"!=typeof c.href?c.href:String(c));c=d.target||c.target;e=[];for(g in d)switch(g){case "width":case "height":case "top":case "left":e.push(g+"="+d[g]);break;case "target":case "noreferrer":break;
	default:e.push(g+"="+(d[g]?1:0))}g=e.join(",");(z("iPhone")&&!z("iPod")&&!z("iPad")||z("iPad")||z("iPod"))&&a.navigator&&a.navigator.standalone&&c&&"_self"!=c?(g=a.document.createElement("A"),"undefined"!=typeof HTMLAnchorElement&&"undefined"!=typeof Location&&"undefined"!=typeof Element&&(e=g&&(g instanceof HTMLAnchorElement||!(g instanceof Location||g instanceof Element)),f=ga(g)?g.constructor.displayName||g.constructor.name||Object.prototype.toString.call(g):void 0===g?"undefined":null===g?"null":
	typeof g,w(e,"Argument is not a HTMLAnchorElement (or a non-Element mock); got: %s",f)),b=b instanceof nc?b:rc(b),g.href=oc(b),g.setAttribute("target",c),d.noreferrer&&g.setAttribute("rel","noreferrer"),d=document.createEvent("MouseEvent"),d.initMouseEvent("click",!0,!0,a,1),g.dispatchEvent(d),g={}):d.noreferrer?(g=a.open("",c,g),d=oc(b),g&&(db&&v(d,";")&&(d="'"+d.replace(/'/g,"%27")+"'"),g.opener=null,a=lc("b/12014412, meta tag with sanitized URL"),ta.test(d)&&(-1!=d.indexOf("&")&&(d=d.replace(na,
	"&amp;")),-1!=d.indexOf("<")&&(d=d.replace(oa,"&lt;")),-1!=d.indexOf(">")&&(d=d.replace(pa,"&gt;")),-1!=d.indexOf('"')&&(d=d.replace(qa,"&quot;")),-1!=d.indexOf("'")&&(d=d.replace(ra,"&#39;")),-1!=d.indexOf("\x00")&&(d=d.replace(sa,"&#0;"))),d='<META HTTP-EQUIV="refresh" content="0; url='+d+'">',za(kc(a),"must provide justification"),w(!/^[\s\xa0]*$/.test(kc(a)),"must provide non-empty justification"),g.document.write(Mc((new Lc).Me(d))),g.document.close())):g=a.open(oc(b),c,g);if(g)try{g.focus()}catch(k){}return g},
	hf=function(a){return new C(function(b){var c=function(){me(2E3).then(function(){if(!a||a.closed)b();else return c()})};return c()})},jf=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,kf=function(){var a=null;return(new C(function(b){"complete"==l.document.readyState?b():(a=function(){b()},ac(window,"load",a))})).c(function(b){cc(window,"load",a);throw b;})},mf=function(){return lf(void 0)?kf().then(function(){return new C(function(a,b){var c=l.document,d=setTimeout(function(){b(Error("Cordova framework is not ready."))},
	1E3);c.addEventListener("deviceready",function(){clearTimeout(d);a()},!1)})}):E(Error("Cordova must run in an Android or iOS file scheme."))},lf=function(a){a=a||K();return!("file:"!==nf()||!a.toLowerCase().match(/iphone|ipad|ipod|android/))},L=function(){return firebase.INTERNAL.hasOwnProperty("reactNative")?"ReactNative":l.hasOwnProperty("process")?"Node":"Browser"},of=function(){var a=L();return"ReactNative"===a||"Node"===a},cf=function(a){var b=a.toLowerCase();if(v(b,"opera/")||v(b,"opr/")||v(b,
	"opios/"))return"Opera";if(v(b,"iemobile"))return"IEMobile";if(v(b,"msie")||v(b,"trident/"))return"IE";if(v(b,"edge/"))return"Edge";if(v(b,"firefox/"))return"Firefox";if(v(b,"silk/"))return"Silk";if(v(b,"blackberry"))return"Blackberry";if(v(b,"webos"))return"Webos";if(!v(b,"safari/")||v(b,"chrome/")||v(b,"crios/")||v(b,"android"))if(!v(b,"chrome/")&&!v(b,"crios/")||v(b,"edge/")){if(v(b,"android"))return"Android";if((a=a.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/))&&2==a.length)return a[1]}else return"Chrome";
	else return"Safari";return"Other"},pf=function(a){var b=L();return("Browser"===b?cf(K()):b)+"/JsCore/"+a},K=function(){return l.navigator&&l.navigator.userAgent||""},M=function(a,b){a=a.split(".");b=b||l;for(var c=0;c<a.length&&"object"==typeof b&&null!=b;c++)b=b[a[c]];c!=a.length&&(b=void 0);return b},rf=function(){var a;if(a=("http:"===nf()||"https:"===nf()||"chrome-extension:"===nf()||lf()&&!1)&&!of())a:{try{var b=l.localStorage,c=qf();if(b){b.setItem(c,"1");b.removeItem(c);a=Ze()?!!l.indexedDB:
	!0;break a}}catch(d){}a=!1}return a},nf=function(){return l.location&&l.location.protocol||null},sf=function(a){a=a||K();return ef(a)||"Firefox"==cf(a)?!1:!0},tf=function(a){return"undefined"===typeof a?null:wc(a)},uf=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&null!==a[c]&&void 0!==a[c]&&(b[c]=a[c]);return b},vf=function(a){if(null!==a){var b;try{b=tc(a)}catch(c){try{b=JSON.parse(a)}catch(d){throw c;}}return b}},qf=function(a){return a?a:""+Math.floor(1E9*Math.random()).toString()},wf=
	function(a){a=a||K();return"Safari"==cf(a)||a.toLowerCase().match(/iphone|ipad|ipod/)?!1:!0},xf=function(){var a=l.___jsl;if(a&&a.H)for(var b in a.H)if(a.H[b].r=a.H[b].r||[],a.H[b].L=a.H[b].L||[],a.H[b].r=a.H[b].L.concat(),a.CP)for(var c=0;c<a.CP.length;c++)a.CP[c]=null},yf=function(){return l.navigator&&"boolean"===typeof l.navigator.onLine?l.navigator.onLine:!0},zf=function(a,b,c,d){if(a>b)throw Error("Short delay should be less than long delay!");this.lf=a;this.Ue=b;a=c||K();d=d||L();this.Oe=ef(a)||
	"ReactNative"===d};zf.prototype.get=function(){return this.Oe?this.Ue:this.lf};var Af;try{var Bf={};Object.defineProperty(Bf,"abcd",{configurable:!0,enumerable:!0,value:1});Object.defineProperty(Bf,"abcd",{configurable:!0,enumerable:!0,value:2});Af=2==Bf.abcd}catch(a){Af=!1}
	var N=function(a,b,c){Af?Object.defineProperty(a,b,{configurable:!0,enumerable:!0,value:c}):a[b]=c},Cf=function(a,b){if(b)for(var c in b)b.hasOwnProperty(c)&&N(a,c,b[c])},Df=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b},Ef=function(a,b){if(!b||!b.length)return!0;if(!a)return!1;for(var c=0;c<b.length;c++){var d=a[b[c]];if(void 0===d||null===d||""===d)return!1}return!0},Ff=function(a){var b=a;if("object"==typeof a&&null!=a){var b="length"in a?[]:{},c;for(c in a)N(b,c,
	Ff(a[c]))}return b};var Gf=["client_id","response_type","scope","redirect_uri","state"],Hf={be:{Bb:500,Ab:600,providerId:"facebook.com",oc:Gf},ce:{Bb:500,Ab:620,providerId:"github.com",oc:Gf},de:{Bb:515,Ab:680,providerId:"google.com",oc:Gf},ie:{Bb:485,Ab:705,providerId:"twitter.com",oc:"oauth_consumer_key oauth_nonce oauth_signature oauth_signature_method oauth_timestamp oauth_token oauth_version".split(" ")}},If=function(a){for(var b in Hf)if(Hf[b].providerId==a)return Hf[b];return null},Jf=function(a){return(a=If(a))&&
	a.oc||[]};var O=function(a,b){this.code="auth/"+a;this.message=b||Kf[a]||""};t(O,Error);O.prototype.D=function(){return{name:this.code,code:this.code,message:this.message}};
	var Lf=function(a){var b=a&&(a.name||a.code);return b?new O(b.substring(5),a.message):null},Kf={"argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.","cordova-not-ready":"Cordova framework is not ready.",
	"cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-already-in-use":"The email address is already in use by another account.",
	"expired-action-code":"The action code has expired. ","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal error has occurred.","invalid-user-token":"The user's credential is no longer valid. The user must sign in again.","invalid-auth-event":"An internal error has occurred.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.",
	"invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-email":"The email address is badly formatted.","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-credential":"The supplied auth credential is malformed or has expired.","invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.",
	"invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.","invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.",
	"invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.","missing-iframe-start":"An internal error has occurred.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.",
	"app-deleted":"This instance of FirebaseApp has been deleted.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network error (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal error has occurred.","no-such-provider":"User was not linked to an account with the given provider.",
	"operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http or https and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.",
	"provider-already-linked":"User can only be linked to one identity for the given provider.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.",
	"user-cancelled":"User did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled."};var P=function(a,b,c,d,e){this.ga=a;this.F=b||null;this.mb=c||null;this.dd=d||null;this.O=e||null;if(this.mb||this.O){if(this.mb&&this.O)throw new O("invalid-auth-event");if(this.mb&&!this.dd)throw new O("invalid-auth-event");}else throw new O("invalid-auth-event");};P.prototype.Vb=function(){return this.dd};P.prototype.getError=function(){return this.O};P.prototype.D=function(){return{type:this.ga,eventId:this.F,urlResponse:this.mb,sessionId:this.dd,error:this.O&&this.O.D()}};
	var Mf=function(a){a=a||{};return a.type?new P(a.type,a.eventId,a.urlResponse,a.sessionId,a.error&&Lf(a.error)):null};var Nf=function(a){var b="unauthorized-domain",c=void 0,d=Te(a);a=d.$;d=d.da;"http"!=d&&"https"!=d?b="operation-not-supported-in-this-environment":c=la("This domain (%s) is not authorized to run this operation. Add it to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.",a);O.call(this,b,c)};t(Nf,O);var Of=function(a){this.Te=a.sub;ka();this.Sb=a.email||null};var Pf=function(a,b,c,d){var e={};ga(c)?e=c:b&&p(c)&&p(d)?e={oauthToken:c,oauthTokenSecret:d}:!b&&p(c)&&(e={accessToken:c});if(b||!e.idToken&&!e.accessToken)if(b&&e.oauthToken&&e.oauthTokenSecret)N(this,"accessToken",e.oauthToken),N(this,"secret",e.oauthTokenSecret);else{if(b)throw new O("argument-error","credential failed: expected 2 arguments (the OAuth access token and secret).");throw new O("argument-error","credential failed: expected 1 argument (the OAuth access token).");}else e.idToken&&N(this,
	"idToken",e.idToken),e.accessToken&&N(this,"accessToken",e.accessToken);N(this,"provider",a)};Pf.prototype.Ub=function(a){return Qf(a,Rf(this))};Pf.prototype.Fd=function(a,b){var c=Rf(this);c.idToken=b;return Sf(a,c)};var Rf=function(a){var b={};a.idToken&&(b.id_token=a.idToken);a.accessToken&&(b.access_token=a.accessToken);a.secret&&(b.oauth_token_secret=a.secret);b.providerId=a.provider;return{postBody:Ye(b).toString(),requestUri:rf()?$e():"http://localhost"}};
	Pf.prototype.D=function(){var a={provider:this.provider};this.idToken&&(a.oauthIdToken=this.idToken);this.accessToken&&(a.oauthAccessToken=this.accessToken);this.secret&&(a.oauthTokenSecret=this.secret);return a};
	var Tf=function(a,b,c){var d=!!b,e=c||[];b=function(){Cf(this,{providerId:a,isOAuthProvider:!0});this.cd=[];this.qd={};"google.com"==a&&this.addScope("profile")};d||(b.prototype.addScope=function(a){Ha(this.cd,a)||this.cd.push(a)});b.prototype.setCustomParameters=function(a){this.qd=Sa(a)};b.prototype.Be=function(){var a=uf(this.qd),b;for(b in a)a[b]=a[b].toString();a=Sa(a);for(b=0;b<e.length;b++){var c=e[b];c in a&&delete a[c]}return a};b.prototype.Ce=function(){return Ma(this.cd)};b.credential=
	function(b,c){return new Pf(a,d,b,c)};Cf(b,{PROVIDER_ID:a});return b},Uf=Tf("facebook.com",!1,Jf("facebook.com"));Uf.prototype.addScope=Uf.prototype.addScope||void 0;var Vf=Tf("github.com",!1,Jf("github.com"));Vf.prototype.addScope=Vf.prototype.addScope||void 0;var Wf=Tf("google.com",!1,Jf("google.com"));Wf.prototype.addScope=Wf.prototype.addScope||void 0;
	Wf.credential=function(a,b){if(!a&&!b)throw new O("argument-error","credential failed: must provide the ID token and/or the access token.");return new Pf("google.com",!1,ga(a)?a:{idToken:a||null,accessToken:b||null})};var Xf=Tf("twitter.com",!0,Jf("twitter.com")),Yf=function(a,b){this.Sb=a;this.Wc=b;N(this,"provider","password")};Yf.prototype.Ub=function(a){return Q(a,Zf,{email:this.Sb,password:this.Wc})};Yf.prototype.Fd=function(a,b){return Q(a,$f,{idToken:b,email:this.Sb,password:this.Wc})};
	Yf.prototype.D=function(){return{email:this.Sb,password:this.Wc}};var ag=function(){Cf(this,{providerId:"password",isOAuthProvider:!1})};Cf(ag,{PROVIDER_ID:"password"});
	var bg={Af:ag,be:Uf,de:Wf,ce:Vf,ie:Xf},cg=function(a){var b=a&&a.providerId;if(!b)return null;var c=a&&a.oauthAccessToken,d=a&&a.oauthTokenSecret;a=a&&a.oauthIdToken;for(var e in bg)if(bg[e].PROVIDER_ID==b)try{return bg[e].credential({accessToken:c,idToken:a,oauthToken:c,oauthTokenSecret:d})}catch(f){break}return null},dg=function(a){if(!a.isOAuthProvider)throw new O("invalid-oauth-provider");};var eg=function(a,b,c,d){O.call(this,a,d);N(this,"email",b);N(this,"credential",c)};t(eg,O);eg.prototype.D=function(){var a={code:this.code,message:this.message,email:this.email},b=this.credential&&this.credential.D();b&&(Ua(a,b),a.providerId=b.provider,delete a.provider);return a};var fg=function(a){if(a.code){var b=a.code||"";0==b.indexOf("auth/")&&(b=b.substring(5));return a.email?new eg(b,a.email,cg(a),a.message):new O(b,a.message||void 0)}return null};var gg=function(a){this.zf=a};t(gg,Ac);gg.prototype.Rb=function(){return new this.zf};gg.prototype.Pc=function(){return{}};
	var R=function(a,b,c){var d;d="Node"==L();d=l.XMLHttpRequest||d&&firebase.INTERNAL.node&&firebase.INTERNAL.node.XMLHttpRequest;if(!d)throw new O("internal-error","The XMLHttpRequest compatibility library was not found.");this.j=a;a=b||{};this.gf=a.secureTokenEndpoint||"https://securetoken.googleapis.com/v1/token";this.hf=a.secureTokenTimeout||hg;this.Od=Sa(a.secureTokenHeaders||ig);this.we=a.firebaseEndpoint||"https://www.googleapis.com/identitytoolkit/v3/relyingparty/";this.xe=a.firebaseTimeout||
	jg;this.vd=Sa(a.firebaseHeaders||kg);c&&(this.vd["X-Client-Version"]=c,this.Od["X-Client-Version"]=c);this.ne=new Fc;this.yf=new gg(d)},lg,hg=new zf(1E4,3E4),ig={"Content-Type":"application/x-www-form-urlencoded"},jg=new zf(1E4,3E4),kg={"Content-Type":"application/json"},ng=function(a,b,c,d,e,f,g){yf()?(df()?a=r(a.kf,a):(lg||(lg=new C(function(a,b){mg(a,b)})),a=r(a.jf,a)),a(b,c,d,e,f,g)):c&&c(null)};
	R.prototype.kf=function(a,b,c,d,e,f){var g="Node"==L(),k=of()?g?new G(this.yf):new G:new G(this.ne),n;f&&(k.kb=Math.max(0,f),n=setTimeout(function(){k.dispatchEvent("timeout")},f));k.listen("complete",function(){n&&clearTimeout(n);var a=null;try{var c;c=this.b?tc(this.b.responseText):void 0;a=c||null}catch(Wa){try{a=JSON.parse(De(this))||null}catch(oe){a=null}}b&&b(a)});bc(k,"ready",function(){n&&clearTimeout(n);this.Aa||(this.Aa=!0,this.Ra())});bc(k,"timeout",function(){n&&clearTimeout(n);this.Aa||
	(this.Aa=!0,this.Ra());b&&b(null)});k.send(a,c,d,e)};var Fd="__fcb"+Math.floor(1E6*Math.random()).toString(),mg=function(a,b){((window.gapi||{}).client||{}).request?a():(l[Fd]=function(){((window.gapi||{}).client||{}).request?a():b(Error("CORS_UNSUPPORTED"))},Hd(function(){b(Error("CORS_UNSUPPORTED"))}))};
	R.prototype.jf=function(a,b,c,d,e){var f=this;lg.then(function(){window.gapi.client.setApiKey(f.j);var g=window.gapi.auth.getToken();window.gapi.auth.setToken(null);window.gapi.client.request({path:a,method:c,body:d,headers:e,authType:"none",callback:function(a){window.gapi.auth.setToken(g);b&&b(a)}})}).c(function(a){b&&b({error:{message:a&&a.message||"CORS_UNSUPPORTED"}})})};
	var pg=function(a,b){return new C(function(c,d){"refresh_token"==b.grant_type&&b.refresh_token||"authorization_code"==b.grant_type&&b.code?ng(a,a.gf+"?key="+encodeURIComponent(a.j),function(a){a?a.error?d(og(a)):a.access_token&&a.refresh_token?c(a):d(new O("internal-error")):d(new O("network-request-failed"))},"POST",Ye(b).toString(),a.Od,a.hf.get()):d(new O("internal-error"))})},qg=function(a,b,c,d,e){var f=Te(a.we+b);J(f,"key",a.j);e&&J(f,"cb",ka().toString());var g="GET"==c;if(g)for(var k in d)d.hasOwnProperty(k)&&
	J(f,k,d[k]);return new C(function(b,e){ng(a,f.toString(),function(a){a?a.error?e(og(a)):b(a):e(new O("network-request-failed"))},c,g?void 0:wc(uf(d)),a.vd,a.xe.get())})},rg=function(a){if(!hc.test(a.email))throw new O("invalid-email");},sg=function(a){"email"in a&&rg(a)},ug=function(a,b){var c=rf()?$e():"http://localhost";return Q(a,tg,{identifier:b,continueUri:c}).then(function(a){return a.allProviders||[]})},wg=function(a){return Q(a,vg,{}).then(function(a){return a.authorizedDomains||[]})},xg=
	function(a){if(!a.idToken)throw new O("internal-error");};R.prototype.signInAnonymously=function(){return Q(this,yg,{})};R.prototype.updateEmail=function(a,b){return Q(this,zg,{idToken:a,email:b})};R.prototype.updatePassword=function(a,b){return Q(this,$f,{idToken:a,password:b})};var Ag={displayName:"DISPLAY_NAME",photoUrl:"PHOTO_URL"};
	R.prototype.updateProfile=function(a,b){var c={idToken:a},d=[];Na(Ag,function(a,f){var e=b[f];null===e?d.push(a):f in b&&(c[f]=e)});d.length&&(c.deleteAttribute=d);return Q(this,zg,c)};R.prototype.sendPasswordResetEmail=function(a){return Q(this,Bg,{requestType:"PASSWORD_RESET",email:a})};R.prototype.sendEmailVerification=function(a){return Q(this,Cg,{requestType:"VERIFY_EMAIL",idToken:a})};
	var Eg=function(a,b,c){return Q(a,Dg,{idToken:b,deleteProvider:c})},Fg=function(a){if(!a.requestUri||!a.sessionId&&!a.postBody)throw new O("internal-error");},Gg=function(a){var b=null;a.needConfirmation?(a.code="account-exists-with-different-credential",b=fg(a)):"FEDERATED_USER_ID_ALREADY_LINKED"==a.errorMessage?(a.code="credential-already-in-use",b=fg(a)):"EMAIL_EXISTS"==a.errorMessage&&(a.code="email-already-in-use",b=fg(a));if(b)throw b;if(!a.idToken)throw new O("internal-error");},Qf=function(a,
	b){b.returnIdpCredential=!0;return Q(a,Hg,b)},Sf=function(a,b){b.returnIdpCredential=!0;return Q(a,Ig,b)},Jg=function(a){if(!a.oobCode)throw new O("invalid-action-code");};R.prototype.confirmPasswordReset=function(a,b){return Q(this,Kg,{oobCode:a,newPassword:b})};R.prototype.checkActionCode=function(a){return Q(this,Lg,{oobCode:a})};R.prototype.applyActionCode=function(a){return Q(this,Mg,{oobCode:a})};
	var Mg={endpoint:"setAccountInfo",K:Jg,ib:"email"},Lg={endpoint:"resetPassword",K:Jg,va:function(a){if(!a.email||!a.requestType)throw new O("internal-error");}},Ng={endpoint:"signupNewUser",K:function(a){rg(a);if(!a.password)throw new O("weak-password");},va:xg,wa:!0},tg={endpoint:"createAuthUri"},Og={endpoint:"deleteAccount",hb:["idToken"]},Dg={endpoint:"setAccountInfo",hb:["idToken","deleteProvider"],K:function(a){if(!da(a.deleteProvider))throw new O("internal-error");}},Pg={endpoint:"getAccountInfo"},
	Cg={endpoint:"getOobConfirmationCode",hb:["idToken","requestType"],K:function(a){if("VERIFY_EMAIL"!=a.requestType)throw new O("internal-error");},ib:"email"},Bg={endpoint:"getOobConfirmationCode",hb:["requestType"],K:function(a){if("PASSWORD_RESET"!=a.requestType)throw new O("internal-error");rg(a)},ib:"email"},vg={me:!0,endpoint:"getProjectConfig",Ie:"GET"},Kg={endpoint:"resetPassword",K:Jg,ib:"email"},zg={endpoint:"setAccountInfo",hb:["idToken"],K:sg,wa:!0},$f={endpoint:"setAccountInfo",hb:["idToken"],
	K:function(a){sg(a);if(!a.password)throw new O("weak-password");},va:xg,wa:!0},yg={endpoint:"signupNewUser",va:xg,wa:!0},Hg={endpoint:"verifyAssertion",K:Fg,va:Gg,wa:!0},Ig={endpoint:"verifyAssertion",K:function(a){Fg(a);if(!a.idToken)throw new O("internal-error");},va:Gg,wa:!0},Qg={endpoint:"verifyCustomToken",K:function(a){if(!a.token)throw new O("invalid-custom-token");},va:xg,wa:!0},Zf={endpoint:"verifyPassword",K:function(a){rg(a);if(!a.password)throw new O("wrong-password");},va:xg,wa:!0},Q=
	function(a,b,c){if(!Ef(c,b.hb))return E(new O("internal-error"));var d=b.Ie||"POST",e;return D(c).then(b.K).then(function(){b.wa&&(c.returnSecureToken=!0);return qg(a,b.endpoint,d,c,b.me||!1)}).then(function(a){return e=a}).then(b.va).then(function(){if(!b.ib)return e;if(!(b.ib in e))throw new O("internal-error");return e[b.ib]})},og=function(a){var b,c;c=(a.error&&a.error.errors&&a.error.errors[0]||{}).reason||"";var d={keyInvalid:"invalid-api-key",ipRefererBlocked:"app-not-authorized"};if(c=d[c]?
	new O(d[c]):null)return c;c=a.error&&a.error.message||"";d={INVALID_CUSTOM_TOKEN:"invalid-custom-token",CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_EMAIL:"invalid-email",INVALID_PASSWORD:"wrong-password",USER_DISABLED:"user-disabled",MISSING_PASSWORD:"internal-error",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",
	FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",INVALID_MESSAGE_PAYLOAD:"invalid-message-payload",INVALID_RECIPIENT_EMAIL:"invalid-recipient-email",INVALID_SENDER:"invalid-sender",EMAIL_NOT_FOUND:"user-not-found",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",
	CORS_UNSUPPORTED:"cors-unsupported",DYNAMIC_LINK_NOT_ACTIVATED:"dynamic-link-not-activated",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",WEAK_PASSWORD:"weak-password",OPERATION_NOT_ALLOWED:"operation-not-allowed",USER_CANCELLED:"user-cancelled"};b=(b=c.match(/^[^\s]+\s*:\s*(.*)$/))&&1<b.length?b[1]:void 0;for(var e in d)if(0===c.indexOf(e))return new O(d[e],b);!b&&a&&(b=tf(a));return new O("internal-error",b)};var Rg=function(a){this.V=a};Rg.prototype.value=function(){return this.V};Rg.prototype.Rd=function(a){this.V.style=a;return this};var Sg=function(a){this.V=a||{}};Sg.prototype.value=function(){return this.V};Sg.prototype.Rd=function(a){this.V.style=a;return this};var Ug=function(a){this.wf=a;this.ac=null;this.Uc=Tg(this)},Vg=function(a){var b=new Sg;b.V.where=document.body;b.V.url=a.wf;b.V.messageHandlersFilter=M("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER");b.V.attributes=b.V.attributes||{};(new Rg(b.V.attributes)).Rd({position:"absolute",top:"-100px",width:"1px",height:"1px"});b.V.dontclear=!0;return b},Tg=function(a){return Wg().then(function(){return new C(function(b,c){M("gapi.iframes.getContext")().open(Vg(a).value(),function(d){a.ac=d;a.ac.restyle({setHideOnLeave:!1});
	var e=setTimeout(function(){c(Error("Network Error"))},Xg.get()),f=function(){clearTimeout(e);b()};d.ping(f).then(f,function(){c(Error("Network Error"))})})})})};Ug.prototype.sendMessage=function(a){var b=this;return this.Uc.then(function(){return new C(function(c){b.ac.send(a.type,a,c,M("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"))})})};
	var Yg=function(a,b){a.Uc.then(function(){a.ac.register("authEvent",b,M("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"))})},Zg=new zf(3E3,15E3),Xg=new zf(5E3,15E3),Wg=function(){return new C(function(a,b){if(yf()){var c=function(){xf();M("gapi.load")("gapi.iframes",{callback:a,ontimeout:function(){xf();b(Error("Network Error"))},timeout:Zg.get()})};if(M("gapi.iframes.Iframe"))a();else if(M("gapi.load"))c();else{var d="__iframefcb"+Math.floor(1E6*Math.random()).toString();l[d]=function(){M("gapi.load")?
	c():b(Error("Network Error"))};D(Ed("https://apis.google.com/js/api.js?onload="+d)).c(function(){b(Error("Network Error"))})}}else b(Error("Network Error"))})};var $g=function(a,b,c){this.v=a;this.j=b;this.B=c;this.Ka=null;this.Mb=Ue(this.v,"/__/auth/iframe");J(this.Mb,"apiKey",this.j);J(this.Mb,"appName",this.B)};$g.prototype.setVersion=function(a){this.Ka=a;return this};$g.prototype.toString=function(){this.Ka?J(this.Mb,"v",this.Ka):Se(this.Mb,"v");return this.Mb.toString()};var ah=function(a,b,c,d,e){this.v=a;this.j=b;this.B=c;this.le=d;this.Ka=this.F=this.ad=null;this.kc=e};ah.prototype.setVersion=function(a){this.Ka=a;return this};
	ah.prototype.toString=function(){var a=Ue(this.v,"/__/auth/handler");J(a,"apiKey",this.j);J(a,"appName",this.B);J(a,"authType",this.le);if(this.kc.isOAuthProvider){J(a,"providerId",this.kc.providerId);var b=this.kc.Ce();b&&b.length&&J(a,"scopes",b.join(","));b=this.kc.Be();Qa(b)||J(a,"customParameters",tf(b))}this.ad?J(a,"redirectUrl",this.ad):Se(a,"redirectUrl");this.F?J(a,"eventId",this.F):Se(a,"eventId");this.Ka?J(a,"v",this.Ka):Se(a,"v");if(this.Nb)for(var c in this.Nb)this.Nb.hasOwnProperty(c)&&
	!Re(a,c)&&J(a,c,this.Nb[c]);return a.toString()};
	var bh=function(a,b,c,d){this.v=a;this.j=b;this.B=c;this.ze=(this.za=d||null)?pf(this.za):null;d=this.za;this.Je=(new $g(a,b,c)).setVersion(d).toString();this.ia=[];this.g=new R(b,null,this.ze);this.dc=this.ra=null},ch=function(a){var b=$e();return wg(a).then(function(a){a:{for(var c=Te(b),e=c.da,c=c.$,f=0;f<a.length;f++){var g;var k=a[f];g=c;var n=e;0==k.indexOf("chrome-extension://")?g=Te(k).$==g&&"chrome-extension"==n:"http"!=n&&"https"!=n?g=!1:jf.test(k)?g=g==k:(k=k.split(".").join("\\."),g=(new RegExp("^(.+\\."+
	k+"|"+k+")$","i")).test(g));if(g){a=!0;break a}}a=!1}if(!a)throw new Nf($e());})};h=bh.prototype;h.vb=function(){if(this.dc)return this.dc;var a=this;return this.dc=kf().then(function(){a.$b=new Ug(a.Je);dh(a)})};h.Hb=function(a,b,c){var d=new O("popup-closed-by-user"),e=new O("web-storage-unsupported"),f=this,g=!1;return this.Da().then(function(){eh(f).then(function(c){c||(a&&ff(a),b(e),g=!0)})}).c(function(){}).then(function(){if(!g)return hf(a)}).then(function(){if(!g)return me(c).then(function(){b(d)})})};
	h.Sd=function(){var a=K();return!sf(a)&&!wf(a)};h.zd=function(){return!1};h.Cb=function(a,b,c,d,e,f,g){if(!a)return E(new O("popup-blocked"));if(g)return this.Da().c(function(b){ff(a);e(b)}),d(),D();this.ra||(this.ra=ch(this.g));var k=this;return this.ra.then(function(){var b=k.Da().c(function(b){ff(a);e(b);throw b;});d();return b}).then(function(){dg(c);var d=fh(k.v,k.j,k.B,b,c,null,f,k.za);af(d,a)}).c(function(a){"auth/network-request-failed"==a.code&&(k.ra=null);throw a;})};
	h.Db=function(a,b,c){this.ra||(this.ra=ch(this.g));var d=this;return this.ra.then(function(){dg(b);var e=fh(d.v,d.j,d.B,a,b,$e(),c,d.za);af(e)})};h.Da=function(){var a=this;return this.vb().then(function(){return a.$b.Uc}).c(function(){a.ra=null;throw new O("network-request-failed");})};h.Wd=function(){return!0};
	var fh=function(a,b,c,d,e,f,g,k,n){a=new ah(a,b,c,d,e);a.ad=f;a.F=g;f=a.setVersion(k);f.Nb=Sa(n||null);return f.toString()},dh=function(a){if(!a.$b)throw Error("IfcHandler must be initialized!");Yg(a.$b,function(b){var c={};if(b&&b.authEvent){var d=!1;b=Mf(b.authEvent);for(c=0;c<a.ia.length;c++)d=a.ia[c](b)||d;c={};c.status=d?"ACK":"ERROR";return D(c)}c.status="ERROR";return D(c)})},eh=function(a){var b={type:"webStorageSupport"};return a.vb().then(function(){return a.$b.sendMessage(b)}).then(function(a){if(a&&
	a.length&&"undefined"!==typeof a[0].webStorageSupport)return a[0].webStorageSupport;throw Error();})};bh.prototype.Ma=function(a){this.ia.push(a)};bh.prototype.Gb=function(a){Ka(this.ia,function(b){return b==a})};var gh=function(a){this.A=a||firebase.INTERNAL.reactNative&&firebase.INTERNAL.reactNative.AsyncStorage;if(!this.A)throw new O("internal-error","The React Native compatibility library was not found.");};h=gh.prototype;h.get=function(a){return D(this.A.getItem(a)).then(function(a){return a&&vf(a)})};h.set=function(a,b){return D(this.A.setItem(a,tf(b)))};h.remove=function(a){return D(this.A.removeItem(a))};h.Na=function(){};h.fb=function(){};var hh=function(){this.A={}};h=hh.prototype;h.get=function(a){return D(this.A[a])};h.set=function(a,b){this.A[a]=b;return D()};h.remove=function(a){delete this.A[a];return D()};h.Na=function(){};h.fb=function(){};var jh=function(){if(!ih()){if("Node"==L())throw new O("internal-error","The LocalStorage compatibility library was not found.");throw new O("web-storage-unsupported");}this.A=l.localStorage||firebase.INTERNAL.node.localStorage},ih=function(){var a="Node"==L(),a=l.localStorage||a&&firebase.INTERNAL.node&&firebase.INTERNAL.node.localStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return!1}};h=jh.prototype;
	h.get=function(a){var b=this;return D().then(function(){var c=b.A.getItem(a);return vf(c)})};h.set=function(a,b){var c=this;return D().then(function(){var d=tf(b);null===d?c.remove(a):c.A.setItem(a,d)})};h.remove=function(a){var b=this;return D().then(function(){b.A.removeItem(a)})};h.Na=function(a){l.window&&Ub(l.window,"storage",a)};h.fb=function(a){l.window&&cc(l.window,"storage",a)};var kh=function(){this.A={}};h=kh.prototype;h.get=function(){return D(null)};h.set=function(){return D()};h.remove=function(){return D()};h.Na=function(){};h.fb=function(){};var mh=function(){if(!lh()){if("Node"==L())throw new O("internal-error","The SessionStorage compatibility library was not found.");throw new O("web-storage-unsupported");}this.A=l.sessionStorage||firebase.INTERNAL.node.sessionStorage},lh=function(){var a="Node"==L(),a=l.sessionStorage||a&&firebase.INTERNAL.node&&firebase.INTERNAL.node.sessionStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return!1}};h=mh.prototype;
	h.get=function(a){var b=this;return D().then(function(){var c=b.A.getItem(a);return vf(c)})};h.set=function(a,b){var c=this;return D().then(function(){var d=tf(b);null===d?c.remove(a):c.A.setItem(a,d)})};h.remove=function(a){var b=this;return D().then(function(){b.A.removeItem(a)})};h.Na=function(){};h.fb=function(){};var nh=function(a,b,c,d,e,f){if(!window.indexedDB)throw new O("web-storage-unsupported");this.pe=a;this.Tc=b;this.Gc=c;this.$d=d;this.nb=e;this.T={};this.Ib=[];this.yb=0;this.Ke=f||l.indexedDB},oh,ph=function(a){return new C(function(b,c){var d=a.Ke.open(a.pe,a.nb);d.onerror=function(a){c(Error(a.target.errorCode))};d.onupgradeneeded=function(b){b=b.target.result;try{b.createObjectStore(a.Tc,{keyPath:a.Gc})}catch(f){c(f)}};d.onsuccess=function(a){b(a.target.result)}})},qh=function(a){a.Cd||(a.Cd=
	ph(a));return a.Cd},rh=function(a,b){return b.objectStore(a.Tc)},sh=function(a,b,c){return b.transaction([a.Tc],c?"readwrite":"readonly")},th=function(a){return new C(function(b,c){a.onsuccess=function(a){a&&a.target?b(a.target.result):b()};a.onerror=function(a){c(Error(a.target.errorCode))}})};h=nh.prototype;
	h.set=function(a,b){var c=!1,d,e=this;return nd(qh(this).then(function(b){d=b;b=rh(e,sh(e,d,!0));return th(b.get(a))}).then(function(f){var g=rh(e,sh(e,d,!0));if(f)return f.value=b,th(g.put(f));e.yb++;c=!0;f={};f[e.Gc]=a;f[e.$d]=b;return th(g.add(f))}).then(function(){e.T[a]=b}),function(){c&&e.yb--})};h.get=function(a){var b=this;return qh(this).then(function(c){return th(rh(b,sh(b,c,!1)).get(a))}).then(function(a){return a&&a.value})};
	h.remove=function(a){var b=!1,c=this;return nd(qh(this).then(function(d){b=!0;c.yb++;return th(rh(c,sh(c,d,!0))["delete"](a))}).then(function(){delete c.T[a]}),function(){b&&c.yb--})};
	h.nf=function(){var a=this;return qh(this).then(function(b){var c=rh(a,sh(a,b,!1));return c.getAll?th(c.getAll()):new C(function(a,b){var d=[],e=c.openCursor();e.onsuccess=function(b){(b=b.target.result)?(d.push(b.value),b["continue"]()):a(d)};e.onerror=function(a){b(Error(a.target.errorCode))}})}).then(function(b){var c={},d=[];if(0==a.yb){for(d=0;d<b.length;d++)c[b[d][a.Gc]]=b[d][a.$d];d=bf(a.T,c);a.T=c}return d})};h.Na=function(a){0==this.Ib.length&&this.gd();this.Ib.push(a)};
	h.fb=function(a){Ka(this.Ib,function(b){return b==a});0==this.Ib.length&&this.rc()};h.gd=function(){var a=this;this.rc();var b=function(){a.Xc=me(800).then(r(a.nf,a)).then(function(b){0<b.length&&x(a.Ib,function(a){a(b)})}).then(b).c(function(a){"STOP_EVENT"!=a.message&&b()});return a.Xc};b()};h.rc=function(){this.Xc&&this.Xc.cancel("STOP_EVENT")};var xh=function(){this.sd={Browser:uh,Node:vh,ReactNative:wh}[L()]},yh,uh={I:jh,jd:mh},vh={I:jh,jd:mh},wh={I:gh,jd:kh};var zh=function(a){var b={},c=a.email,d=a.newEmail;a=a.requestType;if(!c||!a)throw Error("Invalid provider user info!");b.fromEmail=d||null;b.email=c;N(this,"operation",a);N(this,"data",Ff(b))};var Ah="First Second Third Fourth Fifth Sixth Seventh Eighth Ninth".split(" "),S=function(a,b){return{name:a||"",fa:"a valid string",optional:!!b,ha:p}},T=function(a){return{name:a||"",fa:"a valid object",optional:!1,ha:ga}},Bh=function(a,b){return{name:a||"",fa:"a function",optional:!!b,ha:q}},Ch=function(){return{name:"",fa:"null",optional:!1,ha:ca}},Dh=function(){return{name:"credential",fa:"a valid credential",optional:!1,ha:function(a){return!(!a||!a.Ub)}}},Eh=function(){return{name:"authProvider",
	fa:"a valid Auth provider",optional:!1,ha:function(a){return!!(a&&a.providerId&&a.hasOwnProperty&&a.hasOwnProperty("isOAuthProvider"))}}},Fh=function(a,b,c,d){return{name:c||"",fa:a.fa+" or "+b.fa,optional:!!d,ha:function(c){return a.ha(c)||b.ha(c)}}};var Hh=function(a,b){for(var c in b){var d=b[c].name;a[d]=Gh(d,a[c],b[c].a)}},U=function(a,b,c,d){a[b]=Gh(b,c,d)},Gh=function(a,b,c){if(!c)return b;var d=Ih(a);a=function(){var a=Array.prototype.slice.call(arguments),e;a:{e=Array.prototype.slice.call(a);var k;k=0;for(var n=!1,y=0;y<c.length;y++)if(c[y].optional)n=!0;else{if(n)throw new O("internal-error","Argument validator encountered a required argument after an optional argument.");k++}n=c.length;if(e.length<k||n<e.length)e="Expected "+(k==n?1==
	k?"1 argument":k+" arguments":k+"-"+n+" arguments")+" but got "+e.length+".";else{for(k=0;k<e.length;k++)if(n=c[k].optional&&void 0===e[k],!c[k].ha(e[k])&&!n){e=c[k];if(0>k||k>=Ah.length)throw new O("internal-error","Argument validator received an unsupported number of arguments.");e=Ah[k]+" argument "+(e.name?'"'+e.name+'" ':"")+"must be "+e.fa+".";break a}e=null}}if(e)throw new O("argument-error",d+" failed: "+e);return b.apply(this,a)};for(var e in b)a[e]=b[e];for(e in b.prototype)a.prototype[e]=
	b.prototype[e];return a},Ih=function(a){a=a.split(".");return a[a.length-1]};var Jh=function(a,b,c,d){this.Xe=a;this.Pd=b;this.ef=c;this.jb=d;this.S={};yh||(yh=new xh);a=yh;try{var e;Ze()?(oh||(oh=new nh("firebaseLocalStorageDb","firebaseLocalStorage","fbase_key","value",1)),e=oh):e=new a.sd.I;this.Ya=e}catch(f){this.Ya=new hh,this.jb=!0}try{this.tc=new a.sd.jd}catch(f){this.tc=new hh}this.Td=r(this.Ud,this);this.T={}},Kh,Lh=function(){Kh||(Kh=new Jh("firebase",":",!wf(K())&&l.window&&l.window!=l.window.top?!0:!1,sf()));return Kh};h=Jh.prototype;
	h.P=function(a,b){return this.Xe+this.Pd+a.name+(b?this.Pd+b:"")};h.get=function(a,b){return(a.I?this.Ya:this.tc).get(this.P(a,b))};h.remove=function(a,b){b=this.P(a,b);a.I&&!this.jb&&(this.T[b]=null);return(a.I?this.Ya:this.tc).remove(b)};h.set=function(a,b,c){var d=this.P(a,c),e=this,f=a.I?this.Ya:this.tc;return f.set(d,b).then(function(){return f.get(d)}).then(function(b){a.I&&!this.jb&&(e.T[d]=b)})};
	h.addListener=function(a,b,c){a=this.P(a,b);this.jb||(this.T[a]=l.localStorage.getItem(a));Qa(this.S)&&this.gd();this.S[a]||(this.S[a]=[]);this.S[a].push(c)};h.removeListener=function(a,b,c){a=this.P(a,b);this.S[a]&&(Ka(this.S[a],function(a){return a==c}),0==this.S[a].length&&delete this.S[a]);Qa(this.S)&&this.rc()};h.gd=function(){this.Ya.Na(this.Td);this.jb||Mh(this)};
	var Mh=function(a){Nh(a);a.Sc=setInterval(function(){for(var b in a.S){var c=l.localStorage.getItem(b);c!=a.T[b]&&(a.T[b]=c,c=new Jb({type:"storage",key:b,target:window,oldValue:a.T[b],newValue:c}),a.Ud(c))}},1E3)},Nh=function(a){a.Sc&&(clearInterval(a.Sc),a.Sc=null)};Jh.prototype.rc=function(){this.Ya.fb(this.Td);this.jb||Nh(this)};
	Jh.prototype.Ud=function(a){if(a&&a.Ae){var b=a.qb.key;if(this.ef){var c=l.localStorage.getItem(b);a=a.qb.newValue;a!=c&&(a?l.localStorage.setItem(b,a):a||l.localStorage.removeItem(b))}this.T[b]=l.localStorage.getItem(b);this.md(b)}else x(a,r(this.md,this))};Jh.prototype.md=function(a){this.S[a]&&x(this.S[a],function(a){a()})};var Oh=function(a,b){this.u=a;this.i=b||Lh()},Ph={name:"authEvent",I:!0},Qh=function(a){return a.i.get(Ph,a.u).then(function(a){return Mf(a)})};Oh.prototype.Ma=function(a){this.i.addListener(Ph,this.u,a)};Oh.prototype.Gb=function(a){this.i.removeListener(Ph,this.u,a)};var Rh=function(a){this.i=a||Lh()},Sh={name:"sessionId",I:!1};Rh.prototype.Vb=function(a){return this.i.get(Sh,a)};var Th=function(a,b,c,d,e,f){this.v=a;this.j=b;this.B=c;this.za=d||null;this.Vd=b+":"+c;this.ff=new Rh;this.wd=new Oh(this.Vd);this.Oc=null;this.ia=[];this.Ne=e||500;this.cf=f||2E3;this.ub=this.hc=null},Uh=function(a){return new O("invalid-cordova-configuration",a)};
	Th.prototype.Da=function(){return this.Qc?this.Qc:this.Qc=mf().then(function(){if("function"!==typeof M("universalLinks.subscribe",l))throw Uh("cordova-universal-links-plugin is not installed");if("undefined"===typeof M("BuildInfo.packageName",l))throw Uh("cordova-plugin-buildinfo is not installed");if("function"!==typeof M("cordova.plugins.browsertab.openUrl",l))throw Uh("cordova-plugin-browsertab is not installed");if("function"!==typeof M("cordova.InAppBrowser.open",l))throw Uh("cordova-plugin-inappbrowser is not installed");
	},function(){throw new O("cordova-not-ready");})};var Vh=function(){for(var a=20,b=[];0<a;)b.push("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(62*Math.random()))),a--;return b.join("")},Wh=function(a){var b=new Db;b.update(a);return ob(b.digest())};h=Th.prototype;h.Hb=function(a,b){b(new O("operation-not-supported-in-this-environment"));return D()};h.Cb=function(){return E(new O("operation-not-supported-in-this-environment"))};h.Wd=function(){return!1};h.Sd=function(){return!0};
	h.zd=function(){return!0};
	h.Db=function(a,b,c){if(this.hc)return E(new O("redirect-operation-pending"));var d=this,e=l.document,f=null,g=null,k=null,n=null;return this.hc=nd(D().then(function(){dg(b);return Xh(d)}).then(function(){return Yh(d,a,b,c)}).then(function(){return(new C(function(a,b){g=function(){var b=M("cordova.plugins.browsertab.close",l);a();"function"===typeof b&&b();d.ub&&"function"===typeof d.ub.close&&(d.ub.close(),d.ub=null);return!1};d.Ma(g);k=function(){f||(f=me(d.cf).then(function(){b(new O("redirect-cancelled-by-user"))}))};n=
	function(){var a=l.document;(a&&"undefined"!==typeof a.visibilityState?"visible"==a.visibilityState:1)&&k()};e.addEventListener("resume",k,!1);K().toLowerCase().match(/android/)||e.addEventListener("visibilitychange",n,!1)})).c(function(a){return Zh(d).then(function(){throw a;})})}),function(){k&&e.removeEventListener("resume",k,!1);n&&e.removeEventListener("visibilitychange",n,!1);f&&f.cancel();g&&d.Gb(g);d.hc=null})};
	var Yh=function(a,b,c,d){var e=Vh(),f=new P(b,d,null,e,new O("no-auth-event")),g=M("BuildInfo.packageName",l);if("string"!==typeof g)throw new O("invalid-cordova-configuration");var k=M("BuildInfo.displayName",l),n={};if(K().toLowerCase().match(/iphone|ipad|ipod/))n.ibi=g;else if(K().toLowerCase().match(/android/))n.apn=g;else return E(new O("operation-not-supported-in-this-environment"));k&&(n.appDisplayName=k);e=Wh(e);n.sessionId=e;var y=fh(a.v,a.j,a.B,b,c,null,d,a.za,n);return a.Da().then(function(){var b=
	a.Vd;return a.ff.i.set(Ph,f.D(),b)}).then(function(){var b=M("cordova.plugins.browsertab.isAvailable",l);if("function"!==typeof b)throw new O("invalid-cordova-configuration");var c=null;b(function(b){if(b){c=M("cordova.plugins.browsertab.openUrl",l);if("function"!==typeof c)throw new O("invalid-cordova-configuration");c(y)}else{c=M("cordova.InAppBrowser.open",l);if("function"!==typeof c)throw new O("invalid-cordova-configuration");b=c;var d;d=K();d=!(!d.match(/(iPad|iPhone|iPod).*OS 7_\d/i)&&!d.match(/(iPad|iPhone|iPod).*OS 8_\d/i));
	a.ub=b(y,d?"_blank":"_system","location=yes")}})})},$h=function(a,b){for(var c=0;c<a.ia.length;c++)try{a.ia[c](b)}catch(d){}},Xh=function(a){a.Oc||(a.Oc=a.Da().then(function(){return new C(function(b){var c=function(d){b(d);a.Gb(c);return!1};a.Ma(c);ai(a)})}));return a.Oc},Zh=function(a){var b=null;return Qh(a.wd).then(function(c){b=c;c=a.wd;return c.i.remove(Ph,c.u)}).then(function(){return b})},ai=function(a){var b=M("universalLinks.subscribe",l);if("function"!==typeof b)throw new O("invalid-cordova-configuration");
	var c=new P("unknown",null,null,null,new O("no-auth-event")),d=!1,e=me(a.Ne).then(function(){return Zh(a).then(function(){d||$h(a,c)})}),f=function(b){d=!0;e&&e.cancel();Zh(a).then(function(d){var e=c;if(d&&b&&b.url){var e=null,f;f=b.url;var g=Te(f),k=Re(g,"link"),n=Re(Te(k),"link"),g=Re(g,"deep_link_id");f=Re(Te(g),"link")||g||n||k||f;-1!=f.indexOf("/__/auth/callback")&&(e=Te(f),e=vf(Re(e,"error")||null),e=(e="object"===typeof e?Lf(e):null)?new P(d.ga,d.F,null,null,e):new P(d.ga,d.F,f,d.Vb()));e=
	e||c}$h(a,e)})},g=l.handleOpenURL;l.handleOpenURL=function(a){0==a.indexOf(M("BuildInfo.packageName",l)+"://")&&f({url:a});if("function"===typeof g)try{g(a)}catch(n){console.error(n)}};b(null,f)};Th.prototype.Ma=function(a){this.ia.push(a);Xh(this).c(function(){})};Th.prototype.Gb=function(a){Ka(this.ia,function(b){return b==a})};var bi=function(a){this.u=a;this.i=Lh()},ci={name:"pendingRedirect",I:!1},di=function(a){return a.i.set(ci,"pending",a.u)},ei=function(a){return a.i.remove(ci,a.u)},fi=function(a){return a.i.get(ci,a.u).then(function(a){return"pending"==a})};var V=function(a,b,c){this.v=a;this.j=b;this.B=c;this.Jb=[];this.Wa=!1;this.Cc=r(this.Mc,this);this.ab=new gi(this);this.Jd=new hi(this);this.zb=new bi(this.j+":"+this.B);this.lb={};this.lb.unknown=this.ab;this.lb.signInViaRedirect=this.ab;this.lb.linkViaRedirect=this.ab;this.lb.signInViaPopup=this.Jd;this.lb.linkViaPopup=this.Jd;this.G=ii(this.v,this.j,this.B)},ii=function(a,b,c){var d=firebase.SDK_VERSION||null;return lf()?new Th(a,b,c,d):new bh(a,b,c,d)};
	V.prototype.reset=function(){this.Wa=!1;this.G.Gb(this.Cc);this.G=ii(this.v,this.j,this.B)};V.prototype.vb=function(){var a=this;this.Wa||(this.Wa=!0,this.G.Ma(this.Cc));var b=this.G;return this.G.Da().c(function(c){a.G==b&&a.reset();throw c;})};var li=function(a){a.G.Sd()&&a.vb().c(function(b){var c=new P("unknown",null,null,null,new O("operation-not-supported-in-this-environment"));ji(b)&&a.Mc(c)});a.G.zd()||ki(a.ab)};
	V.prototype.subscribe=function(a){Ha(this.Jb,a)||this.Jb.push(a);if(!this.Wa){var b=this;fi(this.zb).then(function(a){a?ei(b.zb).then(function(){b.vb().c(function(a){var c=new P("unknown",null,null,null,new O("operation-not-supported-in-this-environment"));ji(a)&&b.Mc(c)})}):li(b)}).c(function(){li(b)})}};V.prototype.unsubscribe=function(a){Ka(this.Jb,function(b){return b==a})};
	V.prototype.Mc=function(a){if(!a)throw new O("invalid-auth-event");for(var b=!1,c=0;c<this.Jb.length;c++){var d=this.Jb[c];if(d.nd(a.ga,a.F)){(b=this.lb[a.ga])&&b.Kd(a,d);b=!0;break}}ki(this.ab);return b};var mi=new zf(2E3,1E4),ni=new zf(1E4,3E4);V.prototype.getRedirectResult=function(){return this.ab.getRedirectResult()};V.prototype.Cb=function(a,b,c,d,e){var f=this;return this.G.Cb(a,b,c,function(){f.Wa||(f.Wa=!0,f.G.Ma(f.Cc))},function(){f.reset()},d,e)};
	var ji=function(a){return a&&"auth/cordova-not-ready"==a.code?!0:!1};V.prototype.Db=function(a,b,c){var d=this,e;return di(this.zb).then(function(){return d.G.Db(a,b,c).c(function(a){if(ji(a))throw new O("operation-not-supported-in-this-environment");e=a;return ei(d.zb).then(function(){throw e;})}).then(function(){return d.G.Wd()?new C(function(){}):ei(d.zb).then(function(){return d.getRedirectResult()}).then(function(){}).c(function(){})})})};
	V.prototype.Hb=function(a,b,c,d){return this.G.Hb(c,function(c){a.Ia(b,null,c,d)},mi.get())};var oi={},pi=function(a,b,c){var d=b+":"+c;oi[d]||(oi[d]=new V(a,b,c));return oi[d]},gi=function(a){this.i=a;this.eb=null;this.Fb=[];this.Eb=[];this.bb=null;this.$c=!1};gi.prototype.reset=function(){this.eb=null;this.bb&&(this.bb.cancel(),this.bb=null)};
	gi.prototype.Kd=function(a,b){if(!a)return E(new O("invalid-auth-event"));this.reset();this.$c=!0;var c=a.ga,d=a.F,e=a.getError()&&"auth/web-storage-unsupported"==a.getError().code,f=a.getError()&&"auth/operation-not-supported-in-this-environment"==a.getError().code;"unknown"!=c||e||f?a=a.O?this.Yc(a,b):b.rb(c,d)?this.Zc(a,b):E(new O("invalid-auth-event")):(qi(this,!1,null,null),a=D());return a};var ki=function(a){a.$c||(a.$c=!0,qi(a,!1,null,null))};
	gi.prototype.Yc=function(a){qi(this,!0,null,a.getError());return D()};gi.prototype.Zc=function(a,b){var c=this,d=a.ga;b=b.rb(d,a.F);var e=a.mb;a=a.Vb();var f="signInViaRedirect"==d||"linkViaRedirect"==d;return b(e,a).then(function(a){qi(c,f,a,null)}).c(function(a){qi(c,f,null,a)})};
	var ri=function(a,b){a.eb=function(){return E(b)};if(a.Eb.length)for(var c=0;c<a.Eb.length;c++)a.Eb[c](b)},si=function(a,b){a.eb=function(){return D(b)};if(a.Fb.length)for(var c=0;c<a.Fb.length;c++)a.Fb[c](b)},qi=function(a,b,c,d){b?d?ri(a,d):si(a,c):si(a,{user:null});a.Fb=[];a.Eb=[]};gi.prototype.getRedirectResult=function(){var a=this;return new C(function(b,c){a.eb?a.eb().then(b,c):(a.Fb.push(b),a.Eb.push(c),ti(a))})};
	var ti=function(a){var b=new O("timeout");a.bb&&a.bb.cancel();a.bb=me(ni.get()).then(function(){a.eb||qi(a,!0,null,b)})},hi=function(a){this.i=a};hi.prototype.Kd=function(a,b){if(!a)return E(new O("invalid-auth-event"));var c=a.ga,d=a.F;return a.O?this.Yc(a,b):b.rb(c,d)?this.Zc(a,b):E(new O("invalid-auth-event"))};hi.prototype.Yc=function(a,b){b.Ia(a.ga,null,a.getError(),a.F);return D()};
	hi.prototype.Zc=function(a,b){var c=a.F,d=a.ga,e=b.rb(d,c),f=a.mb;a=a.Vb();return e(f,a).then(function(a){b.Ia(d,a,null,c)}).c(function(a){b.Ia(d,null,a,c)})};var ui=function(a){this.g=a;this.xa=this.X=null;this.Sa=0};ui.prototype.D=function(){return{apiKey:this.g.j,refreshToken:this.X,accessToken:this.xa,expirationTime:this.Sa}};
	var wi=function(a,b){var c=b.idToken,d=b.refreshToken;b=vi(b.expiresIn);a.xa=c;a.Sa=b;a.X=d},vi=function(a){return ka()+1E3*parseInt(a,10)},xi=function(a,b){return pg(a.g,b).then(function(b){a.xa=b.access_token;a.Sa=vi(b.expires_in);a.X=b.refresh_token;return{accessToken:a.xa,expirationTime:a.Sa,refreshToken:a.X}}).c(function(b){"auth/user-token-expired"==b.code&&(a.X=null);throw b;})},yi=function(a){return!(!a.xa||a.X)};
	ui.prototype.getToken=function(a){a=!!a;return yi(this)?E(new O("user-token-expired")):a||!this.xa||ka()>this.Sa-3E4?this.X?xi(this,{grant_type:"refresh_token",refresh_token:this.X}):D(null):D({accessToken:this.xa,expirationTime:this.Sa,refreshToken:this.X})};var zi=function(a,b,c,d,e){Cf(this,{uid:a,displayName:d||null,photoURL:e||null,email:c||null,providerId:b})},Ai=function(a,b){Ib.call(this,a);for(var c in b)this[c]=b[c]};t(Ai,Ib);
	var W=function(a,b,c){this.Z=[];this.j=a.apiKey;this.B=a.appName;this.v=a.authDomain||null;a=firebase.SDK_VERSION?pf(firebase.SDK_VERSION):null;this.g=new R(this.j,null,a);this.ea=new ui(this.g);Bi(this,b.idToken);wi(this.ea,b);N(this,"refreshToken",this.ea.X);Ci(this,c||{});Qd.call(this);this.ic=!1;this.v&&rf()&&(this.m=pi(this.v,this.j,this.B));this.qc=[];this.Bc=D()};t(W,Qd);
	W.prototype.ta=function(a,b){var c=Array.prototype.slice.call(arguments,1),d=this;return this.Bc=this.Bc.then(function(){return a.apply(d,c)},function(){return a.apply(d,c)})};
	var Bi=function(a,b){a.Dd=b;N(a,"_lat",b)},Di=function(a,b){Ka(a.qc,function(a){return a==b})},Ei=function(a){for(var b=[],c=0;c<a.qc.length;c++)b.push(a.qc[c](a));return kd(b).then(function(){return a})},Fi=function(a){a.m&&!a.ic&&(a.ic=!0,a.m.subscribe(a))},Ci=function(a,b){Cf(a,{uid:b.uid,displayName:b.displayName||null,photoURL:b.photoURL||null,email:b.email||null,emailVerified:b.emailVerified||!1,isAnonymous:b.isAnonymous||!1,providerData:[]})};N(W.prototype,"providerId","firebase");
	var Gi=function(){},Hi=function(a){return D().then(function(){if(a.re)throw new O("app-deleted");})},Ii=function(a){return Da(a.providerData,function(a){return a.providerId})},Ki=function(a,b){b&&(Ji(a,b.providerId),a.providerData.push(b))},Ji=function(a,b){Ka(a.providerData,function(a){return a.providerId==b})},Li=function(a,b,c){("uid"!=b||c)&&a.hasOwnProperty(b)&&N(a,b,c)};
	W.prototype.copy=function(a){var b=this;b!=a&&(Cf(this,{uid:a.uid,displayName:a.displayName,photoURL:a.photoURL,email:a.email,emailVerified:a.emailVerified,isAnonymous:a.isAnonymous,providerData:[]}),x(a.providerData,function(a){Ki(b,a)}),this.ea=a.ea,N(this,"refreshToken",this.ea.X))};W.prototype.reload=function(){var a=this;return Hi(this).then(function(){return Mi(a).then(function(){return Ei(a)}).then(Gi)})};
	var Mi=function(a){return a.getToken().then(function(b){var c=a.isAnonymous;return Ni(a,b).then(function(){c||Li(a,"isAnonymous",!1);return b}).c(function(b){"auth/user-token-expired"==b.code&&(a.dispatchEvent(new Ai("userDeleted")),Oi(a));throw b;})})};
	W.prototype.getToken=function(a){var b=this,c=yi(this.ea);return Hi(this).then(function(){return b.ea.getToken(a)}).then(function(a){if(!a)throw new O("internal-error");a.accessToken!=b.Dd&&(Bi(b,a.accessToken),b.Ea());Li(b,"refreshToken",a.refreshToken);return a.accessToken}).c(function(a){if("auth/user-token-expired"==a.code&&!c)return Ei(b).then(function(){Li(b,"refreshToken",null);throw a;});throw a;})};
	var Pi=function(a,b){b.idToken&&a.Dd!=b.idToken&&(wi(a.ea,b),a.Ea(),Bi(a,b.idToken),Li(a,"refreshToken",a.ea.X))};W.prototype.Ea=function(){this.dispatchEvent(new Ai("tokenChanged"))};var Ni=function(a,b){return Q(a.g,Pg,{idToken:b}).then(r(a.af,a))};
	W.prototype.af=function(a){a=a.users;if(!a||!a.length)throw new O("internal-error");a=a[0];Ci(this,{uid:a.localId,displayName:a.displayName,photoURL:a.photoUrl,email:a.email,emailVerified:!!a.emailVerified});for(var b=Qi(a),c=0;c<b.length;c++)Ki(this,b[c]);Li(this,"isAnonymous",!(this.email&&a.passwordHash)&&!(this.providerData&&this.providerData.length))};
	var Qi=function(a){return(a=a.providerUserInfo)&&a.length?Da(a,function(a){return new zi(a.rawId,a.providerId,a.email,a.displayName,a.photoUrl)}):[]};W.prototype.reauthenticate=function(a){var b=this;return this.f(a.Ub(this.g).then(function(a){var c;a:{var e=a.idToken.split(".");if(3==e.length){for(var e=e[1],f=(4-e.length%4)%4,g=0;g<f;g++)e+=".";try{var k=tc(sb(e));if(k.sub&&k.iss&&k.aud&&k.exp){c=new Of(k);break a}}catch(n){}}c=null}if(!c||b.uid!=c.Te)throw new O("user-mismatch");Pi(b,a);return b.reload()}))};
	var Ri=function(a,b){return Mi(a).then(function(){if(Ha(Ii(a),b))return Ei(a).then(function(){throw new O("provider-already-linked");})})};h=W.prototype;h.Re=function(a){var b=this;return this.f(Ri(this,a.provider).then(function(){return b.getToken()}).then(function(c){return a.Fd(b.g,c)}).then(r(this.ud,this)))};h.link=function(a){return this.ta(this.Re,a)};h.ud=function(a){Pi(this,a);var b=this;return this.reload().then(function(){return b})};
	h.tf=function(a){var b=this;return this.f(this.getToken().then(function(c){return b.g.updateEmail(c,a)}).then(function(a){Pi(b,a);return b.reload()}))};h.updateEmail=function(a){return this.ta(this.tf,a)};h.uf=function(a){var b=this;return this.f(this.getToken().then(function(c){return b.g.updatePassword(c,a)}).then(function(a){Pi(b,a);return b.reload()}))};h.updatePassword=function(a){return this.ta(this.uf,a)};
	h.vf=function(a){if(void 0===a.displayName&&void 0===a.photoURL)return Hi(this);var b=this;return this.f(this.getToken().then(function(c){return b.g.updateProfile(c,{displayName:a.displayName,photoUrl:a.photoURL})}).then(function(a){Pi(b,a);Li(b,"displayName",a.displayName||null);Li(b,"photoURL",a.photoUrl||null);return Ei(b)}).then(Gi))};h.updateProfile=function(a){return this.ta(this.vf,a)};
	h.sf=function(a){var b=this;return this.f(Mi(this).then(function(c){return Ha(Ii(b),a)?Eg(b.g,c,[a]).then(function(a){var c={};x(a.providerUserInfo||[],function(a){c[a.providerId]=!0});x(Ii(b),function(a){c[a]||Ji(b,a)});return Ei(b)}):Ei(b).then(function(){throw new O("no-such-provider");})}))};h.unlink=function(a){return this.ta(this.sf,a)};h.qe=function(){var a=this;return this.f(this.getToken().then(function(b){return Q(a.g,Og,{idToken:b})}).then(function(){a.dispatchEvent(new Ai("userDeleted"))})).then(function(){Oi(a)})};
	h["delete"]=function(){return this.ta(this.qe)};h.nd=function(a,b){return"linkViaPopup"==a&&(this.la||null)==b&&this.ca||"linkViaRedirect"==a&&(this.mc||null)==b?!0:!1};h.Ia=function(a,b,c,d){"linkViaPopup"==a&&d==(this.la||null)&&(c&&this.Ga?this.Ga(c):b&&!c&&this.ca&&this.ca(b),this.J&&(this.J.cancel(),this.J=null),delete this.ca,delete this.Ga)};h.rb=function(a,b){return"linkViaPopup"==a&&b==(this.la||null)||"linkViaRedirect"==a&&(this.mc||null)==b?r(this.ue,this):null};
	h.Tb=function(){return qf(this.uid+":::")};
	var Ti=function(a,b){if(!rf())return E(new O("operation-not-supported-in-this-environment"));var c=If(b.providerId),d=a.Tb(),e=null;!sf()&&a.v&&b.isOAuthProvider&&(e=fh(a.v,a.j,a.B,"linkViaPopup",b,null,d,firebase.SDK_VERSION||null));var f=gf(e,c&&c.Bb,c&&c.Ab),c=Ri(a,b.providerId).then(function(){return Ei(a)}).then(function(){Si(a);return a.getToken()}).then(function(){return a.m.Cb(f,"linkViaPopup",b,d,!!e)}).then(function(){return new C(function(b,c){a.Ia("linkViaPopup",null,new O("cancelled-popup-request"),
	a.la||null);a.ca=b;a.Ga=c;a.la=d;a.J=a.m.Hb(a,"linkViaPopup",f,d)})}).then(function(a){f&&ff(f);return a}).c(function(a){f&&ff(f);throw a;});return a.f(c)};W.prototype.linkWithPopup=function(a){var b=Ti(this,a);return this.ta(function(){return b})};
	W.prototype.Se=function(a){if(!rf())return E(new O("operation-not-supported-in-this-environment"));var b=this,c=null,d=this.Tb(),e=Ri(this,a.providerId).then(function(){Si(b);return b.getToken()}).then(function(){b.mc=d;return Ei(b)}).then(function(a){b.Ha&&(a=b.Ha,a=a.i.set(Ui,b.D(),a.u));return a}).then(function(){return b.m.Db("linkViaRedirect",a,d)}).c(function(a){c=a;if(b.Ha)return Vi(b.Ha);throw c;}).then(function(){if(c)throw c;});return this.f(e)};
	W.prototype.linkWithRedirect=function(a){return this.ta(this.Se,a)};var Si=function(a){if(!a.m||!a.ic){if(a.m&&!a.ic)throw new O("internal-error");throw new O("auth-domain-config-required");}};W.prototype.ue=function(a,b){var c=this;this.J&&(this.J.cancel(),this.J=null);var d=null,e=this.getToken().then(function(d){return Sf(c.g,{requestUri:a,sessionId:b,idToken:d})}).then(function(a){d=cg(a);return c.ud(a)}).then(function(a){return{user:a,credential:d}});return this.f(e)};
	W.prototype.sendEmailVerification=function(){var a=this;return this.f(this.getToken().then(function(b){return a.g.sendEmailVerification(b)}).then(function(b){if(a.email!=b)return a.reload()}).then(function(){}))};var Oi=function(a){for(var b=0;b<a.Z.length;b++)a.Z[b].cancel("app-deleted");a.Z=[];a.re=!0;N(a,"refreshToken",null);a.m&&a.m.unsubscribe(a)};W.prototype.f=function(a){var b=this;this.Z.push(a);nd(a,function(){Ja(b.Z,a)});return a};W.prototype.toJSON=function(){return this.D()};
	W.prototype.D=function(){var a={uid:this.uid,displayName:this.displayName,photoURL:this.photoURL,email:this.email,emailVerified:this.emailVerified,isAnonymous:this.isAnonymous,providerData:[],apiKey:this.j,appName:this.B,authDomain:this.v,stsTokenManager:this.ea.D(),redirectEventId:this.mc||null};x(this.providerData,function(b){a.providerData.push(Df(b))});return a};
	var Wi=function(a){if(!a.apiKey)return null;var b={apiKey:a.apiKey,authDomain:a.authDomain,appName:a.appName},c={};if(a.stsTokenManager&&a.stsTokenManager.accessToken&&a.stsTokenManager.expirationTime)c.idToken=a.stsTokenManager.accessToken,c.refreshToken=a.stsTokenManager.refreshToken||null,c.expiresIn=(a.stsTokenManager.expirationTime-ka())/1E3;else return null;var d=new W(b,c,a);a.providerData&&x(a.providerData,function(a){if(a){var b={};Cf(b,a);Ki(d,b)}});a.redirectEventId&&(d.mc=a.redirectEventId);
	return d},Xi=function(a,b,c){var d=new W(a,b);c&&(d.Ha=c);return d.reload().then(function(){return d})};var Yi=function(a){this.u=a;this.i=Lh()},Ui={name:"redirectUser",I:!1},Vi=function(a){return a.i.remove(Ui,a.u)},Zi=function(a,b){return a.i.get(Ui,a.u).then(function(a){a&&b&&(a.authDomain=b);return Wi(a||{})})};var $i=function(a){this.u=a;this.i=Lh()},aj={name:"authUser",I:!0},bj=function(a,b){return a.i.set(aj,b.D(),a.u)},cj=function(a){return a.i.remove(aj,a.u)},dj=function(a,b){return a.i.get(aj,a.u).then(function(a){a&&b&&(a.authDomain=b);return Wi(a||{})})};var Y=function(a){this.Qa=!1;N(this,"app",a);if(X(this).options&&X(this).options.apiKey)a=firebase.SDK_VERSION?pf(firebase.SDK_VERSION):null,this.g=new R(X(this).options&&X(this).options.apiKey,null,a);else throw new O("invalid-api-key");this.Z=[];this.Oa=[];this.Ze=firebase.INTERNAL.createSubscribe(r(this.Le,this));ej(this,null);this.oa=new $i(X(this).options.apiKey+":"+X(this).name);this.cb=new Yi(X(this).options.apiKey+":"+X(this).name);this.Ob=this.f(fj(this));this.ua=this.f(gj(this));this.Rc=
	!1;this.Lc=r(this.mf,this);this.Yd=r(this.Ua,this);this.Zd=r(this.He,this);this.Xd=r(this.Ge,this);hj(this);this.INTERNAL={};this.INTERNAL["delete"]=r(this["delete"],this)};Y.prototype.toJSON=function(){return{apiKey:X(this).options.apiKey,authDomain:X(this).options.authDomain,appName:X(this).name,currentUser:Z(this)&&Z(this).D()}};
	var ij=function(a){return a.se||E(new O("auth-domain-config-required"))},hj=function(a){var b=X(a).options.authDomain,c=X(a).options.apiKey;b&&rf()&&(a.se=a.Ob.then(function(){if(!a.Qa)return a.m=pi(b,c,X(a).name),a.m.subscribe(a),Z(a)&&Fi(Z(a)),a.bd&&(Fi(a.bd),a.bd=null),a.m}))};h=Y.prototype;h.nd=function(a,b){switch(a){case "unknown":case "signInViaRedirect":return!0;case "signInViaPopup":return this.la==b&&!!this.ca;default:return!1}};
	h.Ia=function(a,b,c,d){"signInViaPopup"==a&&this.la==d&&(c&&this.Ga?this.Ga(c):b&&!c&&this.ca&&this.ca(b),this.J&&(this.J.cancel(),this.J=null),delete this.ca,delete this.Ga)};h.rb=function(a,b){return"signInViaRedirect"==a||"signInViaPopup"==a&&this.la==b&&this.ca?r(this.ve,this):null};
	h.ve=function(a,b){var c=this;a={requestUri:a,sessionId:b};this.J&&(this.J.cancel(),this.J=null);var d=null,e=Qf(c.g,a).then(function(a){d=cg(a);return a});a=c.Ob.then(function(){return e}).then(function(a){return jj(c,a)}).then(function(){return{user:Z(c),credential:d}});return this.f(a)};h.Tb=function(){return qf()};
	h.signInWithPopup=function(a){if(!rf())return E(new O("operation-not-supported-in-this-environment"));var b=this,c=If(a.providerId),d=this.Tb(),e=null;!sf()&&X(this).options.authDomain&&a.isOAuthProvider&&(e=fh(X(this).options.authDomain,X(this).options.apiKey,X(this).name,"signInViaPopup",a,null,d,firebase.SDK_VERSION||null));var f=gf(e,c&&c.Bb,c&&c.Ab),c=ij(this).then(function(b){return b.Cb(f,"signInViaPopup",a,d,!!e)}).then(function(){return new C(function(a,c){b.Ia("signInViaPopup",null,new O("cancelled-popup-request"),
	b.la);b.ca=a;b.Ga=c;b.la=d;b.J=b.m.Hb(b,"signInViaPopup",f,d)})}).then(function(a){f&&ff(f);return a}).c(function(a){f&&ff(f);throw a;});return this.f(c)};h.signInWithRedirect=function(a){if(!rf())return E(new O("operation-not-supported-in-this-environment"));var b=this,c=ij(this).then(function(){return b.m.Db("signInViaRedirect",a)});return this.f(c)};
	h.getRedirectResult=function(){if(!rf())return E(new O("operation-not-supported-in-this-environment"));var a=this,b=ij(this).then(function(){return a.m.getRedirectResult()});return this.f(b)};
	var jj=function(a,b){var c={};c.apiKey=X(a).options.apiKey;c.authDomain=X(a).options.authDomain;c.appName=X(a).name;return a.Ob.then(function(){return Xi(c,b,a.cb)}).then(function(b){if(Z(a)&&b.uid==Z(a).uid)return Z(a).copy(b),a.Ua(b);ej(a,b);Fi(b);return a.Ua(b)}).then(function(){a.Ea()})},ej=function(a,b){Z(a)&&(Di(Z(a),a.Yd),cc(Z(a),"tokenChanged",a.Zd),cc(Z(a),"userDeleted",a.Xd));b&&(b.qc.push(a.Yd),Ub(b,"tokenChanged",a.Zd),Ub(b,"userDeleted",a.Xd));N(a,"currentUser",b)};
	Y.prototype.signOut=function(){var a=this,b=this.ua.then(function(){if(!Z(a))return D();ej(a,null);return cj(a.oa).then(function(){a.Ea()})});return this.f(b)};
	var kj=function(a){var b=Zi(a.cb,X(a).options.authDomain).then(function(b){if(a.bd=b)b.Ha=a.cb;return Vi(a.cb)});return a.f(b)},fj=function(a){var b=X(a).options.authDomain,c=kj(a).then(function(){return dj(a.oa,b)}).then(function(b){return b?(b.Ha=a.cb,b.reload().then(function(){return bj(a.oa,b).then(function(){return b})}).c(function(c){return"auth/network-request-failed"==c.code?b:cj(a.oa)})):null}).then(function(b){ej(a,b||null)});return a.f(c)},gj=function(a){return a.Ob.then(function(){return a.getRedirectResult()}).c(function(){}).then(function(){if(!a.Qa)return a.Lc()}).c(function(){}).then(function(){if(!a.Qa){a.Rc=
	!0;var b=a.oa;b.i.addListener(aj,b.u,a.Lc)}})};Y.prototype.mf=function(){var a=this;return dj(this.oa,X(this).options.authDomain).then(function(b){if(!a.Qa){var c;if(c=Z(a)&&b){c=Z(a).uid;var d=b.uid;c=void 0===c||null===c||""===c||void 0===d||null===d||""===d?!1:c==d}if(c)return Z(a).copy(b),Z(a).getToken();if(Z(a)||b)ej(a,b),b&&(Fi(b),b.Ha=a.cb),a.m&&a.m.subscribe(a),a.Ea()}})};Y.prototype.Ua=function(a){return bj(this.oa,a)};Y.prototype.He=function(){this.Ea();this.Ua(Z(this))};
	Y.prototype.Ge=function(){this.signOut()};var lj=function(a,b){return a.f(b.then(function(b){return jj(a,b)}).then(function(){return Z(a)}))};h=Y.prototype;h.Le=function(a){var b=this;this.addAuthTokenListener(function(){a.next(Z(b))})};h.onAuthStateChanged=function(a,b,c){var d=this;this.Rc&&firebase.Promise.resolve().then(function(){q(a)?a(Z(d)):q(a.next)&&a.next(Z(d))});return this.Ze(a,b,c)};
	h.getToken=function(a){var b=this,c=this.ua.then(function(){return Z(b)?Z(b).getToken(a).then(function(a){return{accessToken:a}}):null});return this.f(c)};h.signInWithCustomToken=function(a){var b=this;return this.ua.then(function(){return lj(b,Q(b.g,Qg,{token:a}))}).then(function(a){Li(a,"isAnonymous",!1);return b.Ua(a)}).then(function(){return Z(b)})};h.signInWithEmailAndPassword=function(a,b){var c=this;return this.ua.then(function(){return lj(c,Q(c.g,Zf,{email:a,password:b}))})};
	h.createUserWithEmailAndPassword=function(a,b){var c=this;return this.ua.then(function(){return lj(c,Q(c.g,Ng,{email:a,password:b}))})};h.signInWithCredential=function(a){var b=this;return this.ua.then(function(){return lj(b,a.Ub(b.g))})};h.signInAnonymously=function(){var a=Z(this),b=this;return a&&a.isAnonymous?D(a):this.ua.then(function(){return lj(b,b.g.signInAnonymously())}).then(function(a){Li(a,"isAnonymous",!0);return b.Ua(a)}).then(function(){return Z(b)})};
	var X=function(a){return a.app},Z=function(a){return a.currentUser};h=Y.prototype;h.Ea=function(){if(this.Rc)for(var a=0;a<this.Oa.length;a++)if(this.Oa[a])this.Oa[a](Z(this)&&Z(this)._lat||null)};h.addAuthTokenListener=function(a){var b=this;this.Oa.push(a);this.f(this.ua.then(function(){b.Qa||Ha(b.Oa,a)&&a(Z(b)&&Z(b)._lat||null)}))};h.removeAuthTokenListener=function(a){Ka(this.Oa,function(b){return b==a})};
	h["delete"]=function(){this.Qa=!0;for(var a=0;a<this.Z.length;a++)this.Z[a].cancel("app-deleted");this.Z=[];this.oa&&(a=this.oa,a.i.removeListener(aj,a.u,this.Lc));this.m&&this.m.unsubscribe(this);return firebase.Promise.resolve()};h.f=function(a){var b=this;this.Z.push(a);nd(a,function(){Ja(b.Z,a)});return a};h.fetchProvidersForEmail=function(a){return this.f(ug(this.g,a))};h.verifyPasswordResetCode=function(a){return this.checkActionCode(a).then(function(a){return a.data.email})};
	h.confirmPasswordReset=function(a,b){return this.f(this.g.confirmPasswordReset(a,b).then(function(){}))};h.checkActionCode=function(a){return this.f(this.g.checkActionCode(a).then(function(a){return new zh(a)}))};h.applyActionCode=function(a){return this.f(this.g.applyActionCode(a).then(function(){}))};h.sendPasswordResetEmail=function(a){return this.f(this.g.sendPasswordResetEmail(a).then(function(){}))};Hh(Y.prototype,{applyActionCode:{name:"applyActionCode",a:[S("code")]},checkActionCode:{name:"checkActionCode",a:[S("code")]},confirmPasswordReset:{name:"confirmPasswordReset",a:[S("code"),S("newPassword")]},createUserWithEmailAndPassword:{name:"createUserWithEmailAndPassword",a:[S("email"),S("password")]},fetchProvidersForEmail:{name:"fetchProvidersForEmail",a:[S("email")]},getRedirectResult:{name:"getRedirectResult",a:[]},onAuthStateChanged:{name:"onAuthStateChanged",a:[Fh(T(),Bh(),"nextOrObserver"),
	Bh("opt_error",!0),Bh("opt_completed",!0)]},sendPasswordResetEmail:{name:"sendPasswordResetEmail",a:[S("email")]},signInAnonymously:{name:"signInAnonymously",a:[]},signInWithCredential:{name:"signInWithCredential",a:[Dh()]},signInWithCustomToken:{name:"signInWithCustomToken",a:[S("token")]},signInWithEmailAndPassword:{name:"signInWithEmailAndPassword",a:[S("email"),S("password")]},signInWithPopup:{name:"signInWithPopup",a:[Eh()]},signInWithRedirect:{name:"signInWithRedirect",a:[Eh()]},signOut:{name:"signOut",
	a:[]},toJSON:{name:"toJSON",a:[S(null,!0)]},verifyPasswordResetCode:{name:"verifyPasswordResetCode",a:[S("code")]}});
	Hh(W.prototype,{"delete":{name:"delete",a:[]},getToken:{name:"getToken",a:[{name:"opt_forceRefresh",fa:"a boolean",optional:!0,ha:function(a){return"boolean"==typeof a}}]},link:{name:"link",a:[Dh()]},linkWithPopup:{name:"linkWithPopup",a:[Eh()]},linkWithRedirect:{name:"linkWithRedirect",a:[Eh()]},reauthenticate:{name:"reauthenticate",a:[Dh()]},reload:{name:"reload",a:[]},sendEmailVerification:{name:"sendEmailVerification",a:[]},toJSON:{name:"toJSON",a:[S(null,!0)]},unlink:{name:"unlink",a:[S("provider")]},
	updateEmail:{name:"updateEmail",a:[S("email")]},updatePassword:{name:"updatePassword",a:[S("password")]},updateProfile:{name:"updateProfile",a:[T("profile")]}});Hh(C.prototype,{c:{name:"catch"},then:{name:"then"}});U(ag,"credential",function(a,b){return new Yf(a,b)},[S("email"),S("password")]);Hh(Uf.prototype,{addScope:{name:"addScope",a:[S("scope")]},setCustomParameters:{name:"setCustomParameters",a:[T("customOAuthParameters")]}});U(Uf,"credential",Uf.credential,[Fh(S(),T(),"token")]);
	Hh(Vf.prototype,{addScope:{name:"addScope",a:[S("scope")]},setCustomParameters:{name:"setCustomParameters",a:[T("customOAuthParameters")]}});U(Vf,"credential",Vf.credential,[Fh(S(),T(),"token")]);Hh(Wf.prototype,{addScope:{name:"addScope",a:[S("scope")]},setCustomParameters:{name:"setCustomParameters",a:[T("customOAuthParameters")]}});U(Wf,"credential",Wf.credential,[Fh(S(),Fh(T(),Ch()),"idToken"),Fh(S(),Ch(),"accessToken",!0)]);Hh(Xf.prototype,{setCustomParameters:{name:"setCustomParameters",a:[T("customOAuthParameters")]}});
	U(Xf,"credential",Xf.credential,[Fh(S(),T(),"token"),S("secret",!0)]);
	(function(){if("undefined"!==typeof firebase&&firebase.INTERNAL&&firebase.INTERNAL.registerService){var a={Auth:Y,Error:O};U(a,"EmailAuthProvider",ag,[]);U(a,"FacebookAuthProvider",Uf,[]);U(a,"GithubAuthProvider",Vf,[]);U(a,"GoogleAuthProvider",Wf,[]);U(a,"TwitterAuthProvider",Xf,[]);firebase.INTERNAL.registerService("auth",function(a,c){a=new Y(a);c({INTERNAL:{getToken:r(a.getToken,a),addAuthTokenListener:r(a.addAuthTokenListener,a),removeAuthTokenListener:r(a.removeAuthTokenListener,a)}});return a},
	a,function(a,c){if("create"===a)try{c.auth()}catch(d){}});firebase.INTERNAL.extendNamespace({User:W})}else throw Error("Cannot find the firebase namespace; be sure to include firebase-app.js before this library.");})();}).call(this);
	}).call(global);
	module.exports = firebase.auth;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var firebase = __webpack_require__(3);
	(function(){
	/*! @license Firebase v3.6.6
	    Build: 3.6.6-rc.3
	    Terms: https://firebase.google.com/terms/
	
	    ---
	
	    typedarray.js
	    Copyright (c) 2010, Linden Research, Inc.
	
	    Permission is hereby granted, free of charge, to any person obtaining a copy
	    of this software and associated documentation files (the "Software"), to deal
	    in the Software without restriction, including without limitation the rights
	    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	    copies of the Software, and to permit persons to whom the Software is
	    furnished to do so, subject to the following conditions:
	
	    The above copyright notice and this permission notice shall be included in
	    all copies or substantial portions of the Software.
	
	    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	    THE SOFTWARE. */
	(function() {var g,aa=this;function n(a){return void 0!==a}function ba(){}function ca(a){a.Vb=function(){return a.Ye?a.Ye:a.Ye=new a}}
	function da(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
	else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function ea(a){return"array"==da(a)}function fa(a){var b=da(a);return"array"==b||"object"==b&&"number"==typeof a.length}function p(a){return"string"==typeof a}function ga(a){return"number"==typeof a}function ha(a){return"function"==da(a)}function ia(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}function ja(a,b,c){return a.call.apply(a.bind,arguments)}
	function ka(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function q(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ja:ka;return q.apply(null,arguments)}
	function la(a,b){function c(){}c.prototype=b.prototype;a.wg=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.sg=function(a,c,f){for(var h=Array(arguments.length-2),k=2;k<arguments.length;k++)h[k-2]=arguments[k];return b.prototype[c].apply(a,h)}};function ma(){this.Wa=-1};function na(){this.Wa=-1;this.Wa=64;this.M=[];this.Vd=[];this.Af=[];this.zd=[];this.zd[0]=128;for(var a=1;a<this.Wa;++a)this.zd[a]=0;this.Pd=this.$b=0;this.reset()}la(na,ma);na.prototype.reset=function(){this.M[0]=1732584193;this.M[1]=4023233417;this.M[2]=2562383102;this.M[3]=271733878;this.M[4]=3285377520;this.Pd=this.$b=0};
	function oa(a,b,c){c||(c=0);var d=a.Af;if(p(b))for(var e=0;16>e;e++)d[e]=b.charCodeAt(c)<<24|b.charCodeAt(c+1)<<16|b.charCodeAt(c+2)<<8|b.charCodeAt(c+3),c+=4;else for(e=0;16>e;e++)d[e]=b[c]<<24|b[c+1]<<16|b[c+2]<<8|b[c+3],c+=4;for(e=16;80>e;e++){var f=d[e-3]^d[e-8]^d[e-14]^d[e-16];d[e]=(f<<1|f>>>31)&4294967295}b=a.M[0];c=a.M[1];for(var h=a.M[2],k=a.M[3],l=a.M[4],m,e=0;80>e;e++)40>e?20>e?(f=k^c&(h^k),m=1518500249):(f=c^h^k,m=1859775393):60>e?(f=c&h|k&(c|h),m=2400959708):(f=c^h^k,m=3395469782),f=(b<<
	5|b>>>27)+f+l+m+d[e]&4294967295,l=k,k=h,h=(c<<30|c>>>2)&4294967295,c=b,b=f;a.M[0]=a.M[0]+b&4294967295;a.M[1]=a.M[1]+c&4294967295;a.M[2]=a.M[2]+h&4294967295;a.M[3]=a.M[3]+k&4294967295;a.M[4]=a.M[4]+l&4294967295}
	na.prototype.update=function(a,b){if(null!=a){n(b)||(b=a.length);for(var c=b-this.Wa,d=0,e=this.Vd,f=this.$b;d<b;){if(0==f)for(;d<=c;)oa(this,a,d),d+=this.Wa;if(p(a))for(;d<b;){if(e[f]=a.charCodeAt(d),++f,++d,f==this.Wa){oa(this,e);f=0;break}}else for(;d<b;)if(e[f]=a[d],++f,++d,f==this.Wa){oa(this,e);f=0;break}}this.$b=f;this.Pd+=b}};function r(a,b){for(var c in a)b.call(void 0,a[c],c,a)}function pa(a,b){var c={},d;for(d in a)c[d]=b.call(void 0,a[d],d,a);return c}function qa(a,b){for(var c in a)if(!b.call(void 0,a[c],c,a))return!1;return!0}function ra(a){var b=0,c;for(c in a)b++;return b}function sa(a){for(var b in a)return b}function ta(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b}function ua(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b}function va(a,b){for(var c in a)if(a[c]==b)return!0;return!1}
	function wa(a,b,c){for(var d in a)if(b.call(c,a[d],d,a))return d}function xa(a,b){var c=wa(a,b,void 0);return c&&a[c]}function ya(a){for(var b in a)return!1;return!0}function za(a){var b={},c;for(c in a)b[c]=a[c];return b};function Aa(a){a=String(a);if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);}function Ba(){this.Fd=void 0}
	function Ca(a,b,c){switch(typeof b){case "string":Da(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(null==b){c.push("null");break}if(ea(b)){var d=b.length;c.push("[");for(var e="",f=0;f<d;f++)c.push(e),e=b[f],Ca(a,a.Fd?a.Fd.call(b,String(f),e):e,c),e=",";c.push("]");break}c.push("{");d="";for(f in b)Object.prototype.hasOwnProperty.call(b,f)&&(e=b[f],"function"!=typeof e&&(c.push(d),Da(f,c),
	c.push(":"),Ca(a,a.Fd?a.Fd.call(b,f,e):e,c),d=","));c.push("}");break;case "function":break;default:throw Error("Unknown type: "+typeof b);}}var Ea={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},Fa=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
	function Da(a,b){b.push('"',a.replace(Fa,function(a){if(a in Ea)return Ea[a];var b=a.charCodeAt(0),e="\\u";16>b?e+="000":256>b?e+="00":4096>b&&(e+="0");return Ea[a]=e+b.toString(16)}),'"')};var t;a:{var Ga=aa.navigator;if(Ga){var Ha=Ga.userAgent;if(Ha){t=Ha;break a}}t=""};var v=Array.prototype,Ia=v.indexOf?function(a,b,c){return v.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(p(a))return p(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Ja=v.forEach?function(a,b,c){v.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Ka=v.filter?function(a,b,c){return v.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,h=p(a)?
	a.split(""):a,k=0;k<d;k++)if(k in h){var l=h[k];b.call(c,l,k,a)&&(e[f++]=l)}return e},La=v.map?function(a,b,c){return v.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=p(a)?a.split(""):a,h=0;h<d;h++)h in f&&(e[h]=b.call(c,f[h],h,a));return e},Ma=v.reduce?function(a,b,c,d){for(var e=[],f=1,h=arguments.length;f<h;f++)e.push(arguments[f]);d&&(e[0]=q(b,d));return v.reduce.apply(a,e)}:function(a,b,c,d){var e=c;Ja(a,function(c,h){e=b.call(d,e,c,h,a)});return e},Na=v.every?function(a,b,
	c){return v.every.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&!b.call(c,e[f],f,a))return!1;return!0};function Oa(a,b){var c=Pa(a,b,void 0);return 0>c?null:p(a)?a.charAt(c):a[c]}function Pa(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return f;return-1}function Qa(a,b){var c=Ia(a,b);0<=c&&v.splice.call(a,c,1)}function Ra(a,b,c){return 2>=arguments.length?v.slice.call(a,b):v.slice.call(a,b,c)}
	function Sa(a,b){a.sort(b||Ta)}function Ta(a,b){return a>b?1:a<b?-1:0};var Ua=-1!=t.indexOf("Opera")||-1!=t.indexOf("OPR"),Va=-1!=t.indexOf("Trident")||-1!=t.indexOf("MSIE"),Wa=-1!=t.indexOf("Gecko")&&-1==t.toLowerCase().indexOf("webkit")&&!(-1!=t.indexOf("Trident")||-1!=t.indexOf("MSIE")),Xa=-1!=t.toLowerCase().indexOf("webkit");
	(function(){var a="",b;if(Ua&&aa.opera)return a=aa.opera.version,ha(a)?a():a;Wa?b=/rv\:([^\);]+)(\)|;)/:Va?b=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:Xa&&(b=/WebKit\/(\S+)/);b&&(a=(a=b.exec(t))?a[1]:"");return Va&&(b=(b=aa.document)?b.documentMode:void 0,b>parseFloat(a))?String(b):a})();var Ya=null,Za=null,$a=null;function ab(a,b){if(!fa(a))throw Error("encodeByteArray takes an array as a parameter");bb();for(var c=b?Za:Ya,d=[],e=0;e<a.length;e+=3){var f=a[e],h=e+1<a.length,k=h?a[e+1]:0,l=e+2<a.length,m=l?a[e+2]:0,u=f>>2,f=(f&3)<<4|k>>4,k=(k&15)<<2|m>>6,m=m&63;l||(m=64,h||(k=64));d.push(c[u],c[f],c[k],c[m])}return d.join("")}
	function bb(){if(!Ya){Ya={};Za={};$a={};for(var a=0;65>a;a++)Ya[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),Za[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a),$a[Za[a]]=a,62<=a&&($a["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a)]=a)}};function cb(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function w(a,b){if(Object.prototype.hasOwnProperty.call(a,b))return a[b]}function db(a,b){for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&b(c,a[c])};function x(a,b,c,d){var e;d<b?e="at least "+b:d>c&&(e=0===c?"none":"no more than "+c);if(e)throw Error(a+" failed: Was called with "+d+(1===d?" argument.":" arguments.")+" Expects "+e+".");}function y(a,b,c){var d="";switch(b){case 1:d=c?"first":"First";break;case 2:d=c?"second":"Second";break;case 3:d=c?"third":"Third";break;case 4:d=c?"fourth":"Fourth";break;default:throw Error("errorPrefix called with argumentNumber > 4.  Need to update it?");}return a=a+" failed: "+(d+" argument ")}
	function A(a,b,c,d){if((!d||n(c))&&!ha(c))throw Error(y(a,b,d)+"must be a valid function.");}function eb(a,b,c){if(n(c)&&(!ia(c)||null===c))throw Error(y(a,b,!0)+"must be a valid context object.");};function fb(a){var b=[];db(a,function(a,d){ea(d)?Ja(d,function(d){b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))}):b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))});return b.length?"&"+b.join("&"):""};var gb=firebase.Promise;function hb(){var a=this;this.reject=this.resolve=null;this.ra=new gb(function(b,c){a.resolve=b;a.reject=c})}function ib(a,b){return function(c,d){c?a.reject(c):a.resolve(d);ha(b)&&(jb(a.ra),1===b.length?b(c):b(c,d))}}function jb(a){a.then(void 0,ba)};function kb(a,b){if(!a)throw lb(b);}function lb(a){return Error("Firebase Database ("+firebase.SDK_VERSION+") INTERNAL ASSERT FAILED: "+a)};function mb(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);55296<=e&&56319>=e&&(e-=55296,d++,kb(d<a.length,"Surrogate pair missing trail surrogate."),e=65536+(e<<10)+(a.charCodeAt(d)-56320));128>e?b[c++]=e:(2048>e?b[c++]=e>>6|192:(65536>e?b[c++]=e>>12|224:(b[c++]=e>>18|240,b[c++]=e>>12&63|128),b[c++]=e>>6&63|128),b[c++]=e&63|128)}return b}function nb(a){for(var b=0,c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b++:2048>d?b+=2:55296<=d&&56319>=d?(b+=4,c++):b+=3}return b};function ob(a){return"undefined"!==typeof JSON&&n(JSON.parse)?JSON.parse(a):Aa(a)}function B(a){if("undefined"!==typeof JSON&&n(JSON.stringify))a=JSON.stringify(a);else{var b=[];Ca(new Ba,a,b);a=b.join("")}return a};function pb(a,b){this.committed=a;this.snapshot=b};function qb(){return"undefined"!==typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test("undefined"!==typeof navigator&&"string"===typeof navigator.userAgent?navigator.userAgent:"")};function rb(a){this.re=a;this.Bd=[];this.Qb=0;this.Xd=-1;this.Fb=null}function sb(a,b,c){a.Xd=b;a.Fb=c;a.Xd<a.Qb&&(a.Fb(),a.Fb=null)}function tb(a,b,c){for(a.Bd[b]=c;a.Bd[a.Qb];){var d=a.Bd[a.Qb];delete a.Bd[a.Qb];for(var e=0;e<d.length;++e)if(d[e]){var f=a;ub(function(){f.re(d[e])})}if(a.Qb===a.Xd){a.Fb&&(clearTimeout(a.Fb),a.Fb(),a.Fb=null);break}a.Qb++}};function vb(){this.pc={}}vb.prototype.set=function(a,b){null==b?delete this.pc[a]:this.pc[a]=b};vb.prototype.get=function(a){return cb(this.pc,a)?this.pc[a]:null};vb.prototype.remove=function(a){delete this.pc[a]};vb.prototype.Ze=!0;function wb(a){this.uc=a;this.Cd="firebase:"}g=wb.prototype;g.set=function(a,b){null==b?this.uc.removeItem(this.Cd+a):this.uc.setItem(this.Cd+a,B(b))};g.get=function(a){a=this.uc.getItem(this.Cd+a);return null==a?null:ob(a)};g.remove=function(a){this.uc.removeItem(this.Cd+a)};g.Ze=!1;g.toString=function(){return this.uc.toString()};function xb(a){try{if("undefined"!==typeof window&&"undefined"!==typeof window[a]){var b=window[a];b.setItem("firebase:sentinel","cache");b.removeItem("firebase:sentinel");return new wb(b)}}catch(c){}return new vb}var yb=xb("localStorage"),zb=xb("sessionStorage");function Ab(a,b,c){this.type=Bb;this.source=a;this.path=b;this.Ga=c}Ab.prototype.Mc=function(a){return this.path.e()?new Ab(this.source,C,this.Ga.Q(a)):new Ab(this.source,D(this.path),this.Ga)};Ab.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" overwrite: "+this.Ga.toString()+")"};function Cb(a,b){this.type=Db;this.source=a;this.path=b}Cb.prototype.Mc=function(){return this.path.e()?new Cb(this.source,C):new Cb(this.source,D(this.path))};Cb.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" listen_complete)"};function Eb(a){this.oc=a}Eb.prototype.getToken=function(a){return this.oc.INTERNAL.getToken(a).then(null,function(a){return a&&"auth/token-not-initialized"===a.code?(E("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(a)})};function Fb(a,b){a.oc.INTERNAL.addAuthTokenListener(b)};function Gb(){this.Jd=G}Gb.prototype.j=function(a){return this.Jd.P(a)};Gb.prototype.toString=function(){return this.Jd.toString()};function Hb(a,b,c,d,e){this.host=a.toLowerCase();this.domain=this.host.substr(this.host.indexOf(".")+1);this.Sc=b;this.ne=c;this.qg=d;this.gf=e||"";this.$a=yb.get("host:"+a)||this.host}function Ib(a,b){b!==a.$a&&(a.$a=b,"s-"===a.$a.substr(0,2)&&yb.set("host:"+a.host,a.$a))}
	function Jb(a,b,c){H("string"===typeof b,"typeof type must == string");H("object"===typeof c,"typeof params must == object");if("websocket"===b)b=(a.Sc?"wss://":"ws://")+a.$a+"/.ws?";else if("long_polling"===b)b=(a.Sc?"https://":"http://")+a.$a+"/.lp?";else throw Error("Unknown connection type: "+b);a.host!==a.$a&&(c.ns=a.ne);var d=[];r(c,function(a,b){d.push(b+"="+a)});return b+d.join("&")}
	Hb.prototype.toString=function(){var a=(this.Sc?"https://":"http://")+this.host;this.gf&&(a+="<"+this.gf+">");return a};function Kb(){this.tc={}}function Lb(a,b,c){n(c)||(c=1);cb(a.tc,b)||(a.tc[b]=0);a.tc[b]+=c}Kb.prototype.get=function(){return za(this.tc)};function Mb(a){this.Ef=a;this.rd=null}Mb.prototype.get=function(){var a=this.Ef.get(),b=za(a);if(this.rd)for(var c in this.rd)b[c]-=this.rd[c];this.rd=a;return b};function Nb(){this.vb=[]}function Ob(a,b){for(var c=null,d=0;d<b.length;d++){var e=b[d],f=e.Yb();null===c||f.Z(c.Yb())||(a.vb.push(c),c=null);null===c&&(c=new Pb(f));c.add(e)}c&&a.vb.push(c)}function Qb(a,b,c){Ob(a,c);Rb(a,function(a){return a.Z(b)})}function Sb(a,b,c){Ob(a,c);Rb(a,function(a){return a.contains(b)||b.contains(a)})}
	function Rb(a,b){for(var c=!0,d=0;d<a.vb.length;d++){var e=a.vb[d];if(e)if(e=e.Yb(),b(e)){for(var e=a.vb[d],f=0;f<e.jd.length;f++){var h=e.jd[f];if(null!==h){e.jd[f]=null;var k=h.Tb();Tb&&E("event: "+h.toString());ub(k)}}a.vb[d]=null}else c=!1}c&&(a.vb=[])}function Pb(a){this.qa=a;this.jd=[]}Pb.prototype.add=function(a){this.jd.push(a)};Pb.prototype.Yb=function(){return this.qa};function Ub(a,b,c,d){this.$d=b;this.Md=c;this.Dd=d;this.hd=a}Ub.prototype.Yb=function(){var a=this.Md.wb();return"value"===this.hd?a.path:a.getParent().path};Ub.prototype.ee=function(){return this.hd};Ub.prototype.Tb=function(){return this.$d.Tb(this)};Ub.prototype.toString=function(){return this.Yb().toString()+":"+this.hd+":"+B(this.Md.Qe())};function Vb(a,b,c){this.$d=a;this.error=b;this.path=c}Vb.prototype.Yb=function(){return this.path};Vb.prototype.ee=function(){return"cancel"};
	Vb.prototype.Tb=function(){return this.$d.Tb(this)};Vb.prototype.toString=function(){return this.path.toString()+":cancel"};function Wb(){}Wb.prototype.Te=function(){return null};Wb.prototype.de=function(){return null};var Xb=new Wb;function Yb(a,b,c){this.xf=a;this.Ka=b;this.yd=c}Yb.prototype.Te=function(a){var b=this.Ka.N;if(Zb(b,a))return b.j().Q(a);b=null!=this.yd?new $b(this.yd,!0,!1):this.Ka.w();return this.xf.qc(a,b)};Yb.prototype.de=function(a,b,c){var d=null!=this.yd?this.yd:ac(this.Ka);a=this.xf.Wd(d,b,1,c,a);return 0===a.length?null:a[0]};function I(a,b,c,d){this.type=a;this.Ja=b;this.Xa=c;this.oe=d;this.Dd=void 0}function bc(a){return new I(cc,a)}var cc="value";function $b(a,b,c){this.A=a;this.da=b;this.Sb=c}function dc(a){return a.da}function ec(a){return a.Sb}function fc(a,b){return b.e()?a.da&&!a.Sb:Zb(a,J(b))}function Zb(a,b){return a.da&&!a.Sb||a.A.Da(b)}$b.prototype.j=function(){return this.A};function gc(a,b){return hc(a.name,b.name)}function ic(a,b){return hc(a,b)};function K(a,b){this.name=a;this.R=b}function jc(a,b){return new K(a,b)};function kc(a,b){return a&&"object"===typeof a?(H(".sv"in a,"Unexpected leaf node or priority contents"),b[a[".sv"]]):a}function lc(a,b){var c=new mc;nc(a,new L(""),function(a,e){oc(c,a,pc(e,b))});return c}function pc(a,b){var c=a.C().H(),c=kc(c,b),d;if(a.J()){var e=kc(a.Ca(),b);return e!==a.Ca()||c!==a.C().H()?new qc(e,M(c)):a}d=a;c!==a.C().H()&&(d=d.fa(new qc(c)));a.O(N,function(a,c){var e=pc(c,b);e!==c&&(d=d.T(a,e))});return d};var rc=function(){var a=1;return function(){return a++}}(),H=kb,sc=lb;
	function tc(a){try{var b;bb();for(var c=$a,d=[],e=0;e<a.length;){var f=c[a.charAt(e++)],h=e<a.length?c[a.charAt(e)]:0;++e;var k=e<a.length?c[a.charAt(e)]:64;++e;var l=e<a.length?c[a.charAt(e)]:64;++e;if(null==f||null==h||null==k||null==l)throw Error();d.push(f<<2|h>>4);64!=k&&(d.push(h<<4&240|k>>2),64!=l&&d.push(k<<6&192|l))}if(8192>d.length)b=String.fromCharCode.apply(null,d);else{a="";for(c=0;c<d.length;c+=8192)a+=String.fromCharCode.apply(null,Ra(d,c,c+8192));b=a}return b}catch(m){E("base64Decode failed: ",
	m)}return null}function uc(a){var b=mb(a);a=new na;a.update(b);var b=[],c=8*a.Pd;56>a.$b?a.update(a.zd,56-a.$b):a.update(a.zd,a.Wa-(a.$b-56));for(var d=a.Wa-1;56<=d;d--)a.Vd[d]=c&255,c/=256;oa(a,a.Vd);for(d=c=0;5>d;d++)for(var e=24;0<=e;e-=8)b[c]=a.M[d]>>e&255,++c;return ab(b)}function vc(a){for(var b="",c=0;c<arguments.length;c++)b=fa(arguments[c])?b+vc.apply(null,arguments[c]):"object"===typeof arguments[c]?b+B(arguments[c]):b+arguments[c],b+=" ";return b}var Tb=null,wc=!0;
	function xc(a,b){kb(!b||!0===a||!1===a,"Can't turn on custom loggers persistently.");!0===a?("undefined"!==typeof console&&("function"===typeof console.log?Tb=q(console.log,console):"object"===typeof console.log&&(Tb=function(a){console.log(a)})),b&&zb.set("logging_enabled",!0)):ha(a)?Tb=a:(Tb=null,zb.remove("logging_enabled"))}function E(a){!0===wc&&(wc=!1,null===Tb&&!0===zb.get("logging_enabled")&&xc(!0));if(Tb){var b=vc.apply(null,arguments);Tb(b)}}
	function yc(a){return function(){E(a,arguments)}}function zc(a){if("undefined"!==typeof console){var b="FIREBASE INTERNAL ERROR: "+vc.apply(null,arguments);"undefined"!==typeof console.error?console.error(b):console.log(b)}}function Ac(a){var b=vc.apply(null,arguments);throw Error("FIREBASE FATAL ERROR: "+b);}function O(a){if("undefined"!==typeof console){var b="FIREBASE WARNING: "+vc.apply(null,arguments);"undefined"!==typeof console.warn?console.warn(b):console.log(b)}}
	function Bc(a){var b,c,d,e,f,h=a;f=c=a=b="";d=!0;e="https";if(p(h)){var k=h.indexOf("//");0<=k&&(e=h.substring(0,k-1),h=h.substring(k+2));k=h.indexOf("/");-1===k&&(k=h.length);b=h.substring(0,k);f="";h=h.substring(k).split("/");for(k=0;k<h.length;k++)if(0<h[k].length){var l=h[k];try{l=decodeURIComponent(l.replace(/\+/g," "))}catch(m){}f+="/"+l}h=b.split(".");3===h.length?(a=h[1],c=h[0].toLowerCase()):2===h.length&&(a=h[0]);k=b.indexOf(":");0<=k&&(d="https"===e||"wss"===e)}"firebase"===a&&Ac(b+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");
	c&&"undefined"!=c||Ac("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com");d||"undefined"!==typeof window&&window.location&&window.location.protocol&&-1!==window.location.protocol.indexOf("https:")&&O("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");return{jc:new Hb(b,d,c,"ws"===e||"wss"===e),path:new L(f)}}function Cc(a){return ga(a)&&(a!=a||a==Number.POSITIVE_INFINITY||a==Number.NEGATIVE_INFINITY)}
	function Dc(a){if("complete"===document.readyState)a();else{var b=!1,c=function(){document.body?b||(b=!0,a()):setTimeout(c,Math.floor(10))};document.addEventListener?(document.addEventListener("DOMContentLoaded",c,!1),window.addEventListener("load",c,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",function(){"complete"===document.readyState&&c()}),window.attachEvent("onload",c))}}
	function hc(a,b){if(a===b)return 0;if("[MIN_NAME]"===a||"[MAX_NAME]"===b)return-1;if("[MIN_NAME]"===b||"[MAX_NAME]"===a)return 1;var c=Ec(a),d=Ec(b);return null!==c?null!==d?0==c-d?a.length-b.length:c-d:-1:null!==d?1:a<b?-1:1}function Fc(a,b){if(b&&a in b)return b[a];throw Error("Missing required key ("+a+") in object: "+B(b));}
	function Gc(a){if("object"!==typeof a||null===a)return B(a);var b=[],c;for(c in a)b.push(c);b.sort();c="{";for(var d=0;d<b.length;d++)0!==d&&(c+=","),c+=B(b[d]),c+=":",c+=Gc(a[b[d]]);return c+"}"}function Hc(a,b){if(a.length<=b)return[a];for(var c=[],d=0;d<a.length;d+=b)d+b>a?c.push(a.substring(d,a.length)):c.push(a.substring(d,d+b));return c}function Ic(a,b){if(ea(a))for(var c=0;c<a.length;++c)b(c,a[c]);else r(a,b)}
	function Jc(a){H(!Cc(a),"Invalid JSON number");var b,c,d,e;0===a?(d=c=0,b=-Infinity===1/a?1:0):(b=0>a,a=Math.abs(a),a>=Math.pow(2,-1022)?(d=Math.min(Math.floor(Math.log(a)/Math.LN2),1023),c=d+1023,d=Math.round(a*Math.pow(2,52-d)-Math.pow(2,52))):(c=0,d=Math.round(a/Math.pow(2,-1074))));e=[];for(a=52;a;--a)e.push(d%2?1:0),d=Math.floor(d/2);for(a=11;a;--a)e.push(c%2?1:0),c=Math.floor(c/2);e.push(b?1:0);e.reverse();b=e.join("");c="";for(a=0;64>a;a+=8)d=parseInt(b.substr(a,8),2).toString(16),1===d.length&&
	(d="0"+d),c+=d;return c.toLowerCase()}var Kc=/^-?\d{1,10}$/;function Ec(a){return Kc.test(a)&&(a=Number(a),-2147483648<=a&&2147483647>=a)?a:null}function ub(a){try{a()}catch(b){setTimeout(function(){O("Exception was thrown by user callback.",b.stack||"");throw b;},Math.floor(0))}}function Lc(a,b,c){Object.defineProperty(a,b,{get:c})}function Mc(a,b){var c=setTimeout(a,b);"object"===typeof c&&c.unref&&c.unref();return c};function Nc(a){var b={},c={},d={},e="";try{var f=a.split("."),b=ob(tc(f[0])||""),c=ob(tc(f[1])||""),e=f[2],d=c.d||{};delete c.d}catch(h){}return{tg:b,Ie:c,data:d,mg:e}}function Oc(a){a=Nc(a);var b=a.Ie;return!!a.mg&&!!b&&"object"===typeof b&&b.hasOwnProperty("iat")}function Pc(a){a=Nc(a).Ie;return"object"===typeof a&&!0===w(a,"admin")};function Qc(a,b,c){this.f=yc("p:rest:");this.L=a;this.Gb=b;this.$c=c;this.$={}}function Rc(a,b){if(n(b))return"tag$"+b;H(Sc(a.m),"should have a tag if it's not a default query.");return a.path.toString()}g=Qc.prototype;
	g.$e=function(a,b,c,d){var e=a.path.toString();this.f("Listen called for "+e+" "+a.ja());var f=Rc(a,c),h={};this.$[f]=h;a=Tc(a.m);var k=this;Uc(this,e+".json",a,function(a,b){var u=b;404===a&&(a=u=null);null===a&&k.Gb(e,u,!1,c);w(k.$,f)===h&&d(a?401==a?"permission_denied":"rest_error:"+a:"ok",null)})};g.uf=function(a,b){var c=Rc(a,b);delete this.$[c]};g.kf=function(){};g.pe=function(){};g.cf=function(){};g.xd=function(){};g.put=function(){};g.af=function(){};g.we=function(){};
	function Uc(a,b,c,d){c=c||{};c.format="export";a.$c.getToken(!1).then(function(e){(e=e&&e.accessToken)&&(c.auth=e);var f=(a.L.Sc?"https://":"http://")+a.L.host+b+"?"+fb(c);a.f("Sending REST request for "+f);var h=new XMLHttpRequest;h.onreadystatechange=function(){if(d&&4===h.readyState){a.f("REST Response for "+f+" received. status:",h.status,"response:",h.responseText);var b=null;if(200<=h.status&&300>h.status){try{b=ob(h.responseText)}catch(c){O("Failed to parse JSON response for "+f+": "+h.responseText)}d(null,
	b)}else 401!==h.status&&404!==h.status&&O("Got unsuccessful REST response for "+f+" Status: "+h.status),d(h.status);d=null}};h.open("GET",f,!0);h.send()})};function Vc(a,b,c){this.type=Wc;this.source=a;this.path=b;this.children=c}Vc.prototype.Mc=function(a){if(this.path.e())return a=this.children.subtree(new L(a)),a.e()?null:a.value?new Ab(this.source,C,a.value):new Vc(this.source,C,a);H(J(this.path)===a,"Can't get a merge for a child not on the path of the operation");return new Vc(this.source,D(this.path),this.children)};Vc.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"};function Xc(a,b){this.rf={};this.Vc=new Mb(a);this.va=b;var c=1E4+2E4*Math.random();Mc(q(this.lf,this),Math.floor(c))}Xc.prototype.lf=function(){var a=this.Vc.get(),b={},c=!1,d;for(d in a)0<a[d]&&cb(this.rf,d)&&(b[d]=a[d],c=!0);c&&this.va.we(b);Mc(q(this.lf,this),Math.floor(6E5*Math.random()))};var Yc={},Zc={};function $c(a){a=a.toString();Yc[a]||(Yc[a]=new Kb);return Yc[a]}function ad(a,b){var c=a.toString();Zc[c]||(Zc[c]=b());return Zc[c]};var bd=null;"undefined"!==typeof MozWebSocket?bd=MozWebSocket:"undefined"!==typeof WebSocket&&(bd=WebSocket);function cd(a,b,c,d){this.Yd=a;this.f=yc(this.Yd);this.frames=this.zc=null;this.pb=this.qb=this.De=0;this.Va=$c(b);a={v:"5"};"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");c&&(a.s=c);d&&(a.ls=d);this.Je=Jb(b,"websocket",a)}var dd;
	cd.prototype.open=function(a,b){this.ib=b;this.Xf=a;this.f("Websocket connecting to "+this.Je);this.wc=!1;yb.set("previous_websocket_failure",!0);try{this.Ia=new bd(this.Je)}catch(c){this.f("Error instantiating WebSocket.");var d=c.message||c.data;d&&this.f(d);this.bb();return}var e=this;this.Ia.onopen=function(){e.f("Websocket connected.");e.wc=!0};this.Ia.onclose=function(){e.f("Websocket connection was disconnected.");e.Ia=null;e.bb()};this.Ia.onmessage=function(a){if(null!==e.Ia)if(a=a.data,e.pb+=
	a.length,Lb(e.Va,"bytes_received",a.length),ed(e),null!==e.frames)fd(e,a);else{a:{H(null===e.frames,"We already have a frame buffer");if(6>=a.length){var b=Number(a);if(!isNaN(b)){e.De=b;e.frames=[];a=null;break a}}e.De=1;e.frames=[]}null!==a&&fd(e,a)}};this.Ia.onerror=function(a){e.f("WebSocket error.  Closing connection.");(a=a.message||a.data)&&e.f(a);e.bb()}};cd.prototype.start=function(){};
	cd.isAvailable=function(){var a=!1;if("undefined"!==typeof navigator&&navigator.userAgent){var b=navigator.userAgent.match(/Android ([0-9]{0,}\.[0-9]{0,})/);b&&1<b.length&&4.4>parseFloat(b[1])&&(a=!0)}return!a&&null!==bd&&!dd};cd.responsesRequiredToBeHealthy=2;cd.healthyTimeout=3E4;g=cd.prototype;g.sd=function(){yb.remove("previous_websocket_failure")};function fd(a,b){a.frames.push(b);if(a.frames.length==a.De){var c=a.frames.join("");a.frames=null;c=ob(c);a.Xf(c)}}
	g.send=function(a){ed(this);a=B(a);this.qb+=a.length;Lb(this.Va,"bytes_sent",a.length);a=Hc(a,16384);1<a.length&&gd(this,String(a.length));for(var b=0;b<a.length;b++)gd(this,a[b])};g.Tc=function(){this.Ab=!0;this.zc&&(clearInterval(this.zc),this.zc=null);this.Ia&&(this.Ia.close(),this.Ia=null)};g.bb=function(){this.Ab||(this.f("WebSocket is closing itself"),this.Tc(),this.ib&&(this.ib(this.wc),this.ib=null))};g.close=function(){this.Ab||(this.f("WebSocket is being closed"),this.Tc())};
	function ed(a){clearInterval(a.zc);a.zc=setInterval(function(){a.Ia&&gd(a,"0");ed(a)},Math.floor(45E3))}function gd(a,b){try{a.Ia.send(b)}catch(c){a.f("Exception thrown from WebSocket.send():",c.message||c.data,"Closing connection."),setTimeout(q(a.bb,a),0)}};function hd(){this.fb={}}
	function jd(a,b){var c=b.type,d=b.Xa;H("child_added"==c||"child_changed"==c||"child_removed"==c,"Only child changes supported for tracking");H(".priority"!==d,"Only non-priority child changes can be tracked.");var e=w(a.fb,d);if(e){var f=e.type;if("child_added"==c&&"child_removed"==f)a.fb[d]=new I("child_changed",b.Ja,d,e.Ja);else if("child_removed"==c&&"child_added"==f)delete a.fb[d];else if("child_removed"==c&&"child_changed"==f)a.fb[d]=new I("child_removed",e.oe,d);else if("child_changed"==c&&
	"child_added"==f)a.fb[d]=new I("child_added",b.Ja,d);else if("child_changed"==c&&"child_changed"==f)a.fb[d]=new I("child_changed",b.Ja,d,e.oe);else throw sc("Illegal combination of changes: "+b+" occurred after "+e);}else a.fb[d]=b};function kd(a){this.V=a;this.g=a.m.g}function ld(a,b,c,d){var e=[],f=[];Ja(b,function(b){"child_changed"===b.type&&a.g.nd(b.oe,b.Ja)&&f.push(new I("child_moved",b.Ja,b.Xa))});md(a,e,"child_removed",b,d,c);md(a,e,"child_added",b,d,c);md(a,e,"child_moved",f,d,c);md(a,e,"child_changed",b,d,c);md(a,e,cc,b,d,c);return e}function md(a,b,c,d,e,f){d=Ka(d,function(a){return a.type===c});Sa(d,q(a.Ff,a));Ja(d,function(c){var d=nd(a,c,f);Ja(e,function(e){e.nf(c.type)&&b.push(e.createEvent(d,a.V))})})}
	function nd(a,b,c){"value"!==b.type&&"child_removed"!==b.type&&(b.Dd=c.Ve(b.Xa,b.Ja,a.g));return b}kd.prototype.Ff=function(a,b){if(null==a.Xa||null==b.Xa)throw sc("Should only compare child_ events.");return this.g.compare(new K(a.Xa,a.Ja),new K(b.Xa,b.Ja))};function od(a,b){this.Sd=a;this.Df=b}function pd(a){this.U=a}
	pd.prototype.eb=function(a,b,c,d){var e=new hd,f;if(b.type===Bb)b.source.ce?c=qd(this,a,b.path,b.Ga,c,d,e):(H(b.source.Se,"Unknown source."),f=b.source.Ce||ec(a.w())&&!b.path.e(),c=rd(this,a,b.path,b.Ga,c,d,f,e));else if(b.type===Wc)b.source.ce?c=sd(this,a,b.path,b.children,c,d,e):(H(b.source.Se,"Unknown source."),f=b.source.Ce||ec(a.w()),c=td(this,a,b.path,b.children,c,d,f,e));else if(b.type===ud)if(b.Id)if(b=b.path,null!=c.lc(b))c=a;else{f=new Yb(c,a,d);d=a.N.j();if(b.e()||".priority"===J(b))dc(a.w())?
	b=c.Aa(ac(a)):(b=a.w().j(),H(b instanceof P,"serverChildren would be complete if leaf node"),b=c.rc(b)),b=this.U.ya(d,b,e);else{var h=J(b),k=c.qc(h,a.w());null==k&&Zb(a.w(),h)&&(k=d.Q(h));b=null!=k?this.U.F(d,h,k,D(b),f,e):a.N.j().Da(h)?this.U.F(d,h,G,D(b),f,e):d;b.e()&&dc(a.w())&&(d=c.Aa(ac(a)),d.J()&&(b=this.U.ya(b,d,e)))}d=dc(a.w())||null!=c.lc(C);c=vd(a,b,d,this.U.Na())}else c=wd(this,a,b.path,b.Ob,c,d,e);else if(b.type===Db)d=b.path,b=a.w(),f=b.j(),h=b.da||d.e(),c=xd(this,new yd(a.N,new $b(f,
	h,b.Sb)),d,c,Xb,e);else throw sc("Unknown operation type: "+b.type);e=ta(e.fb);d=c;b=d.N;b.da&&(f=b.j().J()||b.j().e(),h=zd(a),(0<e.length||!a.N.da||f&&!b.j().Z(h)||!b.j().C().Z(h.C()))&&e.push(bc(zd(d))));return new od(c,e)};
	function xd(a,b,c,d,e,f){var h=b.N;if(null!=d.lc(c))return b;var k;if(c.e())H(dc(b.w()),"If change path is empty, we must have complete server data"),ec(b.w())?(e=ac(b),d=d.rc(e instanceof P?e:G)):d=d.Aa(ac(b)),f=a.U.ya(b.N.j(),d,f);else{var l=J(c);if(".priority"==l)H(1==Ad(c),"Can't have a priority with additional path components"),f=h.j(),k=b.w().j(),d=d.ad(c,f,k),f=null!=d?a.U.fa(f,d):h.j();else{var m=D(c);Zb(h,l)?(k=b.w().j(),d=d.ad(c,h.j(),k),d=null!=d?h.j().Q(l).F(m,d):h.j().Q(l)):d=d.qc(l,
	b.w());f=null!=d?a.U.F(h.j(),l,d,m,e,f):h.j()}}return vd(b,f,h.da||c.e(),a.U.Na())}function rd(a,b,c,d,e,f,h,k){var l=b.w();h=h?a.U:a.U.Ub();if(c.e())d=h.ya(l.j(),d,null);else if(h.Na()&&!l.Sb)d=l.j().F(c,d),d=h.ya(l.j(),d,null);else{var m=J(c);if(!fc(l,c)&&1<Ad(c))return b;var u=D(c);d=l.j().Q(m).F(u,d);d=".priority"==m?h.fa(l.j(),d):h.F(l.j(),m,d,u,Xb,null)}l=l.da||c.e();b=new yd(b.N,new $b(d,l,h.Na()));return xd(a,b,c,e,new Yb(e,b,f),k)}
	function qd(a,b,c,d,e,f,h){var k=b.N;e=new Yb(e,b,f);if(c.e())h=a.U.ya(b.N.j(),d,h),a=vd(b,h,!0,a.U.Na());else if(f=J(c),".priority"===f)h=a.U.fa(b.N.j(),d),a=vd(b,h,k.da,k.Sb);else{c=D(c);var l=k.j().Q(f);if(!c.e()){var m=e.Te(f);d=null!=m?".priority"===Bd(c)&&m.P(c.parent()).e()?m:m.F(c,d):G}l.Z(d)?a=b:(h=a.U.F(k.j(),f,d,c,e,h),a=vd(b,h,k.da,a.U.Na()))}return a}
	function sd(a,b,c,d,e,f,h){var k=b;Cd(d,function(d,m){var u=c.n(d);Zb(b.N,J(u))&&(k=qd(a,k,u,m,e,f,h))});Cd(d,function(d,m){var u=c.n(d);Zb(b.N,J(u))||(k=qd(a,k,u,m,e,f,h))});return k}function Dd(a,b){Cd(b,function(b,d){a=a.F(b,d)});return a}
	function td(a,b,c,d,e,f,h,k){if(b.w().j().e()&&!dc(b.w()))return b;var l=b;c=c.e()?d:Ed(Q,c,d);var m=b.w().j();c.children.ha(function(c,d){if(m.Da(c)){var F=b.w().j().Q(c),F=Dd(F,d);l=rd(a,l,new L(c),F,e,f,h,k)}});c.children.ha(function(c,d){var F=!Zb(b.w(),c)&&null==d.value;m.Da(c)||F||(F=b.w().j().Q(c),F=Dd(F,d),l=rd(a,l,new L(c),F,e,f,h,k))});return l}
	function wd(a,b,c,d,e,f,h){if(null!=e.lc(c))return b;var k=ec(b.w()),l=b.w();if(null!=d.value){if(c.e()&&l.da||fc(l,c))return rd(a,b,c,l.j().P(c),e,f,k,h);if(c.e()){var m=Q;l.j().O(Fd,function(a,b){m=m.set(new L(a),b)});return td(a,b,c,m,e,f,k,h)}return b}m=Q;Cd(d,function(a){var b=c.n(a);fc(l,b)&&(m=m.set(a,l.j().P(b)))});return td(a,b,c,m,e,f,k,h)};function Gd(a){this.g=a}g=Gd.prototype;g.F=function(a,b,c,d,e,f){H(a.yc(this.g),"A node must be indexed if only a child is updated");e=a.Q(b);if(e.P(d).Z(c.P(d))&&e.e()==c.e())return a;null!=f&&(c.e()?a.Da(b)?jd(f,new I("child_removed",e,b)):H(a.J(),"A child remove without an old child only makes sense on a leaf node"):e.e()?jd(f,new I("child_added",c,b)):jd(f,new I("child_changed",c,b,e)));return a.J()&&c.e()?a:a.T(b,c).nb(this.g)};
	g.ya=function(a,b,c){null!=c&&(a.J()||a.O(N,function(a,e){b.Da(a)||jd(c,new I("child_removed",e,a))}),b.J()||b.O(N,function(b,e){if(a.Da(b)){var f=a.Q(b);f.Z(e)||jd(c,new I("child_changed",e,b,f))}else jd(c,new I("child_added",e,b))}));return b.nb(this.g)};g.fa=function(a,b){return a.e()?G:a.fa(b)};g.Na=function(){return!1};g.Ub=function(){return this};function Hd(a){this.fe=new Gd(a.g);this.g=a.g;var b;a.ka?(b=Id(a),b=a.g.Ec(Jd(a),b)):b=a.g.Hc();this.Uc=b;a.na?(b=Kd(a),a=a.g.Ec(Ld(a),b)):a=a.g.Fc();this.vc=a}g=Hd.prototype;g.matches=function(a){return 0>=this.g.compare(this.Uc,a)&&0>=this.g.compare(a,this.vc)};g.F=function(a,b,c,d,e,f){this.matches(new K(b,c))||(c=G);return this.fe.F(a,b,c,d,e,f)};
	g.ya=function(a,b,c){b.J()&&(b=G);var d=b.nb(this.g),d=d.fa(G),e=this;b.O(N,function(a,b){e.matches(new K(a,b))||(d=d.T(a,G))});return this.fe.ya(a,d,c)};g.fa=function(a){return a};g.Na=function(){return!0};g.Ub=function(){return this.fe};function Md(a){this.sa=new Hd(a);this.g=a.g;H(a.xa,"Only valid if limit has been set");this.oa=a.oa;this.Ib=!Nd(a)}g=Md.prototype;g.F=function(a,b,c,d,e,f){this.sa.matches(new K(b,c))||(c=G);return a.Q(b).Z(c)?a:a.Eb()<this.oa?this.sa.Ub().F(a,b,c,d,e,f):Od(this,a,b,c,e,f)};
	g.ya=function(a,b,c){var d;if(b.J()||b.e())d=G.nb(this.g);else if(2*this.oa<b.Eb()&&b.yc(this.g)){d=G.nb(this.g);b=this.Ib?b.Zb(this.sa.vc,this.g):b.Xb(this.sa.Uc,this.g);for(var e=0;0<b.Pa.length&&e<this.oa;){var f=R(b),h;if(h=this.Ib?0>=this.g.compare(this.sa.Uc,f):0>=this.g.compare(f,this.sa.vc))d=d.T(f.name,f.R),e++;else break}}else{d=b.nb(this.g);d=d.fa(G);var k,l,m;if(this.Ib){b=d.We(this.g);k=this.sa.vc;l=this.sa.Uc;var u=Pd(this.g);m=function(a,b){return u(b,a)}}else b=d.Wb(this.g),k=this.sa.Uc,
	l=this.sa.vc,m=Pd(this.g);for(var e=0,z=!1;0<b.Pa.length;)f=R(b),!z&&0>=m(k,f)&&(z=!0),(h=z&&e<this.oa&&0>=m(f,l))?e++:d=d.T(f.name,G)}return this.sa.Ub().ya(a,d,c)};g.fa=function(a){return a};g.Na=function(){return!0};g.Ub=function(){return this.sa.Ub()};
	function Od(a,b,c,d,e,f){var h;if(a.Ib){var k=Pd(a.g);h=function(a,b){return k(b,a)}}else h=Pd(a.g);H(b.Eb()==a.oa,"");var l=new K(c,d),m=a.Ib?Qd(b,a.g):Rd(b,a.g),u=a.sa.matches(l);if(b.Da(c)){for(var z=b.Q(c),m=e.de(a.g,m,a.Ib);null!=m&&(m.name==c||b.Da(m.name));)m=e.de(a.g,m,a.Ib);e=null==m?1:h(m,l);if(u&&!d.e()&&0<=e)return null!=f&&jd(f,new I("child_changed",d,c,z)),b.T(c,d);null!=f&&jd(f,new I("child_removed",z,c));b=b.T(c,G);return null!=m&&a.sa.matches(m)?(null!=f&&jd(f,new I("child_added",
	m.R,m.name)),b.T(m.name,m.R)):b}return d.e()?b:u&&0<=h(m,l)?(null!=f&&(jd(f,new I("child_removed",m.R,m.name)),jd(f,new I("child_added",d,c))),b.T(c,d).T(m.name,G)):b};function qc(a,b){this.B=a;H(n(this.B)&&null!==this.B,"LeafNode shouldn't be created with null/undefined value.");this.aa=b||G;Sd(this.aa);this.Db=null}var Td=["object","boolean","number","string"];g=qc.prototype;g.J=function(){return!0};g.C=function(){return this.aa};g.fa=function(a){return new qc(this.B,a)};g.Q=function(a){return".priority"===a?this.aa:G};g.P=function(a){return a.e()?this:".priority"===J(a)?this.aa:G};g.Da=function(){return!1};g.Ve=function(){return null};
	g.T=function(a,b){return".priority"===a?this.fa(b):b.e()&&".priority"!==a?this:G.T(a,b).fa(this.aa)};g.F=function(a,b){var c=J(a);if(null===c)return b;if(b.e()&&".priority"!==c)return this;H(".priority"!==c||1===Ad(a),".priority must be the last token in a path");return this.T(c,G.F(D(a),b))};g.e=function(){return!1};g.Eb=function(){return 0};g.O=function(){return!1};g.H=function(a){return a&&!this.C().e()?{".value":this.Ca(),".priority":this.C().H()}:this.Ca()};
	g.hash=function(){if(null===this.Db){var a="";this.aa.e()||(a+="priority:"+Ud(this.aa.H())+":");var b=typeof this.B,a=a+(b+":"),a="number"===b?a+Jc(this.B):a+this.B;this.Db=uc(a)}return this.Db};g.Ca=function(){return this.B};g.sc=function(a){if(a===G)return 1;if(a instanceof P)return-1;H(a.J(),"Unknown node type");var b=typeof a.B,c=typeof this.B,d=Ia(Td,b),e=Ia(Td,c);H(0<=d,"Unknown leaf type: "+b);H(0<=e,"Unknown leaf type: "+c);return d===e?"object"===c?0:this.B<a.B?-1:this.B===a.B?0:1:e-d};
	g.nb=function(){return this};g.yc=function(){return!0};g.Z=function(a){return a===this?!0:a.J()?this.B===a.B&&this.aa.Z(a.aa):!1};g.toString=function(){return B(this.H(!0))};function Vd(){}var Wd={};function Pd(a){return q(a.compare,a)}Vd.prototype.nd=function(a,b){return 0!==this.compare(new K("[MIN_NAME]",a),new K("[MIN_NAME]",b))};Vd.prototype.Hc=function(){return Xd};function Yd(a){H(!a.e()&&".priority"!==J(a),"Can't create PathIndex with empty path or .priority key");this.bc=a}la(Yd,Vd);g=Yd.prototype;g.xc=function(a){return!a.P(this.bc).e()};g.compare=function(a,b){var c=a.R.P(this.bc),d=b.R.P(this.bc),c=c.sc(d);return 0===c?hc(a.name,b.name):c};
	g.Ec=function(a,b){var c=M(a),c=G.F(this.bc,c);return new K(b,c)};g.Fc=function(){var a=G.F(this.bc,Zd);return new K("[MAX_NAME]",a)};g.toString=function(){return this.bc.slice().join("/")};function $d(){}la($d,Vd);g=$d.prototype;g.compare=function(a,b){var c=a.R.C(),d=b.R.C(),c=c.sc(d);return 0===c?hc(a.name,b.name):c};g.xc=function(a){return!a.C().e()};g.nd=function(a,b){return!a.C().Z(b.C())};g.Hc=function(){return Xd};g.Fc=function(){return new K("[MAX_NAME]",new qc("[PRIORITY-POST]",Zd))};
	g.Ec=function(a,b){var c=M(a);return new K(b,new qc("[PRIORITY-POST]",c))};g.toString=function(){return".priority"};var N=new $d;function ae(){}la(ae,Vd);g=ae.prototype;g.compare=function(a,b){return hc(a.name,b.name)};g.xc=function(){throw sc("KeyIndex.isDefinedOn not expected to be called.");};g.nd=function(){return!1};g.Hc=function(){return Xd};g.Fc=function(){return new K("[MAX_NAME]",G)};g.Ec=function(a){H(p(a),"KeyIndex indexValue must always be a string.");return new K(a,G)};g.toString=function(){return".key"};
	var Fd=new ae;function be(){}la(be,Vd);g=be.prototype;g.compare=function(a,b){var c=a.R.sc(b.R);return 0===c?hc(a.name,b.name):c};g.xc=function(){return!0};g.nd=function(a,b){return!a.Z(b)};g.Hc=function(){return Xd};g.Fc=function(){return ce};g.Ec=function(a,b){var c=M(a);return new K(b,c)};g.toString=function(){return".value"};var de=new be;function ee(){this.Rb=this.na=this.Kb=this.ka=this.xa=!1;this.oa=0;this.mb="";this.dc=null;this.zb="";this.ac=null;this.xb="";this.g=N}var fe=new ee;function Nd(a){return""===a.mb?a.ka:"l"===a.mb}function Jd(a){H(a.ka,"Only valid if start has been set");return a.dc}function Id(a){H(a.ka,"Only valid if start has been set");return a.Kb?a.zb:"[MIN_NAME]"}function Ld(a){H(a.na,"Only valid if end has been set");return a.ac}
	function Kd(a){H(a.na,"Only valid if end has been set");return a.Rb?a.xb:"[MAX_NAME]"}function ge(a){var b=new ee;b.xa=a.xa;b.oa=a.oa;b.ka=a.ka;b.dc=a.dc;b.Kb=a.Kb;b.zb=a.zb;b.na=a.na;b.ac=a.ac;b.Rb=a.Rb;b.xb=a.xb;b.g=a.g;b.mb=a.mb;return b}g=ee.prototype;g.le=function(a){var b=ge(this);b.xa=!0;b.oa=a;b.mb="l";return b};g.me=function(a){var b=ge(this);b.xa=!0;b.oa=a;b.mb="r";return b};g.Nd=function(a,b){var c=ge(this);c.ka=!0;n(a)||(a=null);c.dc=a;null!=b?(c.Kb=!0,c.zb=b):(c.Kb=!1,c.zb="");return c};
	g.gd=function(a,b){var c=ge(this);c.na=!0;n(a)||(a=null);c.ac=a;n(b)?(c.Rb=!0,c.xb=b):(c.vg=!1,c.xb="");return c};function he(a,b){var c=ge(a);c.g=b;return c}function ie(a){var b={};a.ka&&(b.sp=a.dc,a.Kb&&(b.sn=a.zb));a.na&&(b.ep=a.ac,a.Rb&&(b.en=a.xb));if(a.xa){b.l=a.oa;var c=a.mb;""===c&&(c=Nd(a)?"l":"r");b.vf=c}a.g!==N&&(b.i=a.g.toString());return b}function S(a){return!(a.ka||a.na||a.xa)}function Sc(a){return S(a)&&a.g==N}
	function Tc(a){var b={};if(Sc(a))return b;var c;a.g===N?c="$priority":a.g===de?c="$value":a.g===Fd?c="$key":(H(a.g instanceof Yd,"Unrecognized index type!"),c=a.g.toString());b.orderBy=B(c);a.ka&&(b.startAt=B(a.dc),a.Kb&&(b.startAt+=","+B(a.zb)));a.na&&(b.endAt=B(a.ac),a.Rb&&(b.endAt+=","+B(a.xb)));a.xa&&(Nd(a)?b.limitToFirst=a.oa:b.limitToLast=a.oa);return b}g.toString=function(){return B(ie(this))};function je(a,b){this.od=a;this.cc=b}je.prototype.get=function(a){var b=w(this.od,a);if(!b)throw Error("No index defined for "+a);return b===Wd?null:b};function ke(a,b,c){var d=pa(a.od,function(d,f){var h=w(a.cc,f);H(h,"Missing index implementation for "+f);if(d===Wd){if(h.xc(b.R)){for(var k=[],l=c.Wb(jc),m=R(l);m;)m.name!=b.name&&k.push(m),m=R(l);k.push(b);return le(k,Pd(h))}return Wd}h=c.get(b.name);k=d;h&&(k=k.remove(new K(b.name,h)));return k.Oa(b,b.R)});return new je(d,a.cc)}
	function me(a,b,c){var d=pa(a.od,function(a){if(a===Wd)return a;var d=c.get(b.name);return d?a.remove(new K(b.name,d)):a});return new je(d,a.cc)}var ne=new je({".priority":Wd},{".priority":N});function oe(){this.set={}}g=oe.prototype;g.add=function(a,b){this.set[a]=null!==b?b:!0};g.contains=function(a){return cb(this.set,a)};g.get=function(a){return this.contains(a)?this.set[a]:void 0};g.remove=function(a){delete this.set[a]};g.clear=function(){this.set={}};g.e=function(){return ya(this.set)};g.count=function(){return ra(this.set)};function pe(a,b){r(a.set,function(a,d){b(d,a)})}g.keys=function(){var a=[];r(this.set,function(b,c){a.push(c)});return a};function qe(a,b,c,d){this.Yd=a;this.f=yc(a);this.jc=b;this.pb=this.qb=0;this.Va=$c(b);this.tf=c;this.wc=!1;this.Cb=d;this.Yc=function(a){return Jb(b,"long_polling",a)}}var re,se;
	qe.prototype.open=function(a,b){this.Me=0;this.ia=b;this.bf=new rb(a);this.Ab=!1;var c=this;this.sb=setTimeout(function(){c.f("Timed out trying to connect.");c.bb();c.sb=null},Math.floor(3E4));Dc(function(){if(!c.Ab){c.Ta=new te(function(a,b,d,k,l){ue(c,arguments);if(c.Ta)if(c.sb&&(clearTimeout(c.sb),c.sb=null),c.wc=!0,"start"==a)c.id=b,c.ff=d;else if("close"===a)b?(c.Ta.Kd=!1,sb(c.bf,b,function(){c.bb()})):c.bb();else throw Error("Unrecognized command received: "+a);},function(a,b){ue(c,arguments);
	tb(c.bf,a,b)},function(){c.bb()},c.Yc);var a={start:"t"};a.ser=Math.floor(1E8*Math.random());c.Ta.Qd&&(a.cb=c.Ta.Qd);a.v="5";c.tf&&(a.s=c.tf);c.Cb&&(a.ls=c.Cb);"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");a=c.Yc(a);c.f("Connecting via long-poll to "+a);ve(c.Ta,a,function(){})}})};
	qe.prototype.start=function(){var a=this.Ta,b=this.ff;a.Vf=this.id;a.Wf=b;for(a.Ud=!0;we(a););a=this.id;b=this.ff;this.fc=document.createElement("iframe");var c={dframe:"t"};c.id=a;c.pw=b;this.fc.src=this.Yc(c);this.fc.style.display="none";document.body.appendChild(this.fc)};
	qe.isAvailable=function(){return re||!se&&"undefined"!==typeof document&&null!=document.createElement&&!("object"===typeof window&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))&&!("object"===typeof Windows&&"object"===typeof Windows.rg)&&!0};g=qe.prototype;g.sd=function(){};g.Tc=function(){this.Ab=!0;this.Ta&&(this.Ta.close(),this.Ta=null);this.fc&&(document.body.removeChild(this.fc),this.fc=null);this.sb&&(clearTimeout(this.sb),this.sb=null)};
	g.bb=function(){this.Ab||(this.f("Longpoll is closing itself"),this.Tc(),this.ia&&(this.ia(this.wc),this.ia=null))};g.close=function(){this.Ab||(this.f("Longpoll is being closed."),this.Tc())};g.send=function(a){a=B(a);this.qb+=a.length;Lb(this.Va,"bytes_sent",a.length);a=mb(a);a=ab(a,!0);a=Hc(a,1840);for(var b=0;b<a.length;b++){var c=this.Ta;c.Qc.push({jg:this.Me,pg:a.length,Oe:a[b]});c.Ud&&we(c);this.Me++}};function ue(a,b){var c=B(b).length;a.pb+=c;Lb(a.Va,"bytes_received",c)}
	function te(a,b,c,d){this.Yc=d;this.ib=c;this.te=new oe;this.Qc=[];this.Zd=Math.floor(1E8*Math.random());this.Kd=!0;this.Qd=rc();window["pLPCommand"+this.Qd]=a;window["pRTLPCB"+this.Qd]=b;a=document.createElement("iframe");a.style.display="none";if(document.body){document.body.appendChild(a);try{a.contentWindow.document||E("No IE domain setting required")}catch(e){a.src="javascript:void((function(){document.open();document.domain='"+document.domain+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";
	a.contentDocument?a.gb=a.contentDocument:a.contentWindow?a.gb=a.contentWindow.document:a.document&&(a.gb=a.document);this.Ea=a;a="";this.Ea.src&&"javascript:"===this.Ea.src.substr(0,11)&&(a='<script>document.domain="'+document.domain+'";\x3c/script>');a="<html><body>"+a+"</body></html>";try{this.Ea.gb.open(),this.Ea.gb.write(a),this.Ea.gb.close()}catch(f){E("frame writing exception"),f.stack&&E(f.stack),E(f)}}
	te.prototype.close=function(){this.Ud=!1;if(this.Ea){this.Ea.gb.body.innerHTML="";var a=this;setTimeout(function(){null!==a.Ea&&(document.body.removeChild(a.Ea),a.Ea=null)},Math.floor(0))}var b=this.ib;b&&(this.ib=null,b())};
	function we(a){if(a.Ud&&a.Kd&&a.te.count()<(0<a.Qc.length?2:1)){a.Zd++;var b={};b.id=a.Vf;b.pw=a.Wf;b.ser=a.Zd;for(var b=a.Yc(b),c="",d=0;0<a.Qc.length;)if(1870>=a.Qc[0].Oe.length+30+c.length){var e=a.Qc.shift(),c=c+"&seg"+d+"="+e.jg+"&ts"+d+"="+e.pg+"&d"+d+"="+e.Oe;d++}else break;xe(a,b+c,a.Zd);return!0}return!1}function xe(a,b,c){function d(){a.te.remove(c);we(a)}a.te.add(c,1);var e=setTimeout(d,Math.floor(25E3));ve(a,b,function(){clearTimeout(e);d()})}
	function ve(a,b,c){setTimeout(function(){try{if(a.Kd){var d=a.Ea.gb.createElement("script");d.type="text/javascript";d.async=!0;d.src=b;d.onload=d.onreadystatechange=function(){var a=d.readyState;a&&"loaded"!==a&&"complete"!==a||(d.onload=d.onreadystatechange=null,d.parentNode&&d.parentNode.removeChild(d),c())};d.onerror=function(){E("Long-poll script failed to load: "+b);a.Kd=!1;a.close()};a.Ea.gb.body.appendChild(d)}}catch(e){}},Math.floor(1))};function ye(a){ze(this,a)}var Ae=[qe,cd];function ze(a,b){var c=cd&&cd.isAvailable(),d=c&&!(yb.Ze||!0===yb.get("previous_websocket_failure"));b.qg&&(c||O("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),d=!0);if(d)a.Wc=[cd];else{var e=a.Wc=[];Ic(Ae,function(a,b){b&&b.isAvailable()&&e.push(b)})}}function Be(a){if(0<a.Wc.length)return a.Wc[0];throw Error("No transports available");};function Ce(a,b,c,d,e,f,h){this.id=a;this.f=yc("c:"+this.id+":");this.re=c;this.Lc=d;this.ia=e;this.qe=f;this.L=b;this.Ad=[];this.Ke=0;this.sf=new ye(b);this.Ua=0;this.Cb=h;this.f("Connection created");De(this)}
	function De(a){var b=Be(a.sf);a.I=new b("c:"+a.id+":"+a.Ke++,a.L,void 0,a.Cb);a.ve=b.responsesRequiredToBeHealthy||0;var c=Ee(a,a.I),d=Fe(a,a.I);a.Xc=a.I;a.Rc=a.I;a.D=null;a.Bb=!1;setTimeout(function(){a.I&&a.I.open(c,d)},Math.floor(0));b=b.healthyTimeout||0;0<b&&(a.md=Mc(function(){a.md=null;a.Bb||(a.I&&102400<a.I.pb?(a.f("Connection exceeded healthy timeout but has received "+a.I.pb+" bytes.  Marking connection healthy."),a.Bb=!0,a.I.sd()):a.I&&10240<a.I.qb?a.f("Connection exceeded healthy timeout but has sent "+
	a.I.qb+" bytes.  Leaving connection alive."):(a.f("Closing unhealthy connection after timeout."),a.close()))},Math.floor(b)))}function Fe(a,b){return function(c){b===a.I?(a.I=null,c||0!==a.Ua?1===a.Ua&&a.f("Realtime connection lost."):(a.f("Realtime connection failed."),"s-"===a.L.$a.substr(0,2)&&(yb.remove("host:"+a.L.host),a.L.$a=a.L.host)),a.close()):b===a.D?(a.f("Secondary connection lost."),c=a.D,a.D=null,a.Xc!==c&&a.Rc!==c||a.close()):a.f("closing an old connection")}}
	function Ee(a,b){return function(c){if(2!=a.Ua)if(b===a.Rc){var d=Fc("t",c);c=Fc("d",c);if("c"==d){if(d=Fc("t",c),"d"in c)if(c=c.d,"h"===d){var d=c.ts,e=c.v,f=c.h;a.qf=c.s;Ib(a.L,f);0==a.Ua&&(a.I.start(),Ge(a,a.I,d),"5"!==e&&O("Protocol version mismatch detected"),c=a.sf,(c=1<c.Wc.length?c.Wc[1]:null)&&He(a,c))}else if("n"===d){a.f("recvd end transmission on primary");a.Rc=a.D;for(c=0;c<a.Ad.length;++c)a.wd(a.Ad[c]);a.Ad=[];Ie(a)}else"s"===d?(a.f("Connection shutdown command received. Shutting down..."),
	a.qe&&(a.qe(c),a.qe=null),a.ia=null,a.close()):"r"===d?(a.f("Reset packet received.  New host: "+c),Ib(a.L,c),1===a.Ua?a.close():(Je(a),De(a))):"e"===d?zc("Server Error: "+c):"o"===d?(a.f("got pong on primary."),Ke(a),Le(a)):zc("Unknown control packet command: "+d)}else"d"==d&&a.wd(c)}else if(b===a.D)if(d=Fc("t",c),c=Fc("d",c),"c"==d)"t"in c&&(c=c.t,"a"===c?Me(a):"r"===c?(a.f("Got a reset on secondary, closing it"),a.D.close(),a.Xc!==a.D&&a.Rc!==a.D||a.close()):"o"===c&&(a.f("got pong on secondary."),
	a.pf--,Me(a)));else if("d"==d)a.Ad.push(c);else throw Error("Unknown protocol layer: "+d);else a.f("message on old connection")}}Ce.prototype.ua=function(a){Ne(this,{t:"d",d:a})};function Ie(a){a.Xc===a.D&&a.Rc===a.D&&(a.f("cleaning up and promoting a connection: "+a.D.Yd),a.I=a.D,a.D=null)}
	function Me(a){0>=a.pf?(a.f("Secondary connection is healthy."),a.Bb=!0,a.D.sd(),a.D.start(),a.f("sending client ack on secondary"),a.D.send({t:"c",d:{t:"a",d:{}}}),a.f("Ending transmission on primary"),a.I.send({t:"c",d:{t:"n",d:{}}}),a.Xc=a.D,Ie(a)):(a.f("sending ping on secondary."),a.D.send({t:"c",d:{t:"p",d:{}}}))}Ce.prototype.wd=function(a){Ke(this);this.re(a)};function Ke(a){a.Bb||(a.ve--,0>=a.ve&&(a.f("Primary connection is healthy."),a.Bb=!0,a.I.sd()))}
	function He(a,b){a.D=new b("c:"+a.id+":"+a.Ke++,a.L,a.qf);a.pf=b.responsesRequiredToBeHealthy||0;a.D.open(Ee(a,a.D),Fe(a,a.D));Mc(function(){a.D&&(a.f("Timed out trying to upgrade."),a.D.close())},Math.floor(6E4))}function Ge(a,b,c){a.f("Realtime connection established.");a.I=b;a.Ua=1;a.Lc&&(a.Lc(c,a.qf),a.Lc=null);0===a.ve?(a.f("Primary connection is healthy."),a.Bb=!0):Mc(function(){Le(a)},Math.floor(5E3))}
	function Le(a){a.Bb||1!==a.Ua||(a.f("sending ping on primary."),Ne(a,{t:"c",d:{t:"p",d:{}}}))}function Ne(a,b){if(1!==a.Ua)throw"Connection is not connected";a.Xc.send(b)}Ce.prototype.close=function(){2!==this.Ua&&(this.f("Closing realtime connection."),this.Ua=2,Je(this),this.ia&&(this.ia(),this.ia=null))};function Je(a){a.f("Shutting down all connections");a.I&&(a.I.close(),a.I=null);a.D&&(a.D.close(),a.D=null);a.md&&(clearTimeout(a.md),a.md=null)};function L(a,b){if(1==arguments.length){this.o=a.split("/");for(var c=0,d=0;d<this.o.length;d++)0<this.o[d].length&&(this.o[c]=this.o[d],c++);this.o.length=c;this.Y=0}else this.o=a,this.Y=b}function T(a,b){var c=J(a);if(null===c)return b;if(c===J(b))return T(D(a),D(b));throw Error("INTERNAL ERROR: innerPath ("+b+") is not within outerPath ("+a+")");}
	function Oe(a,b){for(var c=a.slice(),d=b.slice(),e=0;e<c.length&&e<d.length;e++){var f=hc(c[e],d[e]);if(0!==f)return f}return c.length===d.length?0:c.length<d.length?-1:1}function J(a){return a.Y>=a.o.length?null:a.o[a.Y]}function Ad(a){return a.o.length-a.Y}function D(a){var b=a.Y;b<a.o.length&&b++;return new L(a.o,b)}function Bd(a){return a.Y<a.o.length?a.o[a.o.length-1]:null}g=L.prototype;
	g.toString=function(){for(var a="",b=this.Y;b<this.o.length;b++)""!==this.o[b]&&(a+="/"+this.o[b]);return a||"/"};g.slice=function(a){return this.o.slice(this.Y+(a||0))};g.parent=function(){if(this.Y>=this.o.length)return null;for(var a=[],b=this.Y;b<this.o.length-1;b++)a.push(this.o[b]);return new L(a,0)};
	g.n=function(a){for(var b=[],c=this.Y;c<this.o.length;c++)b.push(this.o[c]);if(a instanceof L)for(c=a.Y;c<a.o.length;c++)b.push(a.o[c]);else for(a=a.split("/"),c=0;c<a.length;c++)0<a[c].length&&b.push(a[c]);return new L(b,0)};g.e=function(){return this.Y>=this.o.length};g.Z=function(a){if(Ad(this)!==Ad(a))return!1;for(var b=this.Y,c=a.Y;b<=this.o.length;b++,c++)if(this.o[b]!==a.o[c])return!1;return!0};
	g.contains=function(a){var b=this.Y,c=a.Y;if(Ad(this)>Ad(a))return!1;for(;b<this.o.length;){if(this.o[b]!==a.o[c])return!1;++b;++c}return!0};var C=new L("");function Pe(a,b){this.Qa=a.slice();this.Ha=Math.max(1,this.Qa.length);this.Pe=b;for(var c=0;c<this.Qa.length;c++)this.Ha+=nb(this.Qa[c]);Qe(this)}Pe.prototype.push=function(a){0<this.Qa.length&&(this.Ha+=1);this.Qa.push(a);this.Ha+=nb(a);Qe(this)};Pe.prototype.pop=function(){var a=this.Qa.pop();this.Ha-=nb(a);0<this.Qa.length&&--this.Ha};
	function Qe(a){if(768<a.Ha)throw Error(a.Pe+"has a key path longer than 768 bytes ("+a.Ha+").");if(32<a.Qa.length)throw Error(a.Pe+"path specified exceeds the maximum depth that can be written (32) or object contains a cycle "+Re(a));}function Re(a){return 0==a.Qa.length?"":"in property '"+a.Qa.join(".")+"'"};function Se(a){a instanceof Te||Ac("Don't call new Database() directly - please use firebase.database().");this.ta=a;this.ba=new U(a,C);this.INTERNAL=new Ue(this)}var Ve={TIMESTAMP:{".sv":"timestamp"}};g=Se.prototype;g.app=null;g.jf=function(a){We(this,"ref");x("database.ref",0,1,arguments.length);return n(a)?this.ba.n(a):this.ba};
	g.gg=function(a){We(this,"database.refFromURL");x("database.refFromURL",1,1,arguments.length);var b=Bc(a);Xe("database.refFromURL",b);var c=b.jc;c.host!==this.ta.L.host&&Ac("database.refFromURL: Host name does not match the current database: (found "+c.host+" but expected "+this.ta.L.host+")");return this.jf(b.path.toString())};function We(a,b){null===a.ta&&Ac("Cannot call "+b+" on a deleted database.")}g.Pf=function(){x("database.goOffline",0,0,arguments.length);We(this,"goOffline");this.ta.ab()};
	g.Qf=function(){x("database.goOnline",0,0,arguments.length);We(this,"goOnline");this.ta.kc()};Object.defineProperty(Se.prototype,"app",{get:function(){return this.ta.app}});function Ue(a){this.Ya=a}Ue.prototype.delete=function(){We(this.Ya,"delete");var a=Ye.Vb(),b=this.Ya.ta;w(a.lb,b.app.name)!==b&&Ac("Database "+b.app.name+" has already been deleted.");b.ab();delete a.lb[b.app.name];this.Ya.ta=null;this.Ya.ba=null;this.Ya=this.Ya.INTERNAL=null;return firebase.Promise.resolve()};
	Se.prototype.ref=Se.prototype.jf;Se.prototype.refFromURL=Se.prototype.gg;Se.prototype.goOnline=Se.prototype.Qf;Se.prototype.goOffline=Se.prototype.Pf;Ue.prototype["delete"]=Ue.prototype.delete;function mc(){this.k=this.B=null}mc.prototype.find=function(a){if(null!=this.B)return this.B.P(a);if(a.e()||null==this.k)return null;var b=J(a);a=D(a);return this.k.contains(b)?this.k.get(b).find(a):null};function oc(a,b,c){if(b.e())a.B=c,a.k=null;else if(null!==a.B)a.B=a.B.F(b,c);else{null==a.k&&(a.k=new oe);var d=J(b);a.k.contains(d)||a.k.add(d,new mc);a=a.k.get(d);b=D(b);oc(a,b,c)}}
	function Ze(a,b){if(b.e())return a.B=null,a.k=null,!0;if(null!==a.B){if(a.B.J())return!1;var c=a.B;a.B=null;c.O(N,function(b,c){oc(a,new L(b),c)});return Ze(a,b)}return null!==a.k?(c=J(b),b=D(b),a.k.contains(c)&&Ze(a.k.get(c),b)&&a.k.remove(c),a.k.e()?(a.k=null,!0):!1):!0}function nc(a,b,c){null!==a.B?c(b,a.B):a.O(function(a,e){var f=new L(b.toString()+"/"+a);nc(e,f,c)})}mc.prototype.O=function(a){null!==this.k&&pe(this.k,function(b,c){a(b,c)})};var $e=/[\[\].#$\/\u0000-\u001F\u007F]/,af=/[\[\].#$\u0000-\u001F\u007F]/;function bf(a){return p(a)&&0!==a.length&&!$e.test(a)}function cf(a){return null===a||p(a)||ga(a)&&!Cc(a)||ia(a)&&cb(a,".sv")}function df(a,b,c,d){d&&!n(b)||ef(y(a,1,d),b,c)}
	function ef(a,b,c){c instanceof L&&(c=new Pe(c,a));if(!n(b))throw Error(a+"contains undefined "+Re(c));if(ha(b))throw Error(a+"contains a function "+Re(c)+" with contents: "+b.toString());if(Cc(b))throw Error(a+"contains "+b.toString()+" "+Re(c));if(p(b)&&b.length>10485760/3&&10485760<nb(b))throw Error(a+"contains a string greater than 10485760 utf8 bytes "+Re(c)+" ('"+b.substring(0,50)+"...')");if(ia(b)){var d=!1,e=!1;db(b,function(b,h){if(".value"===b)d=!0;else if(".priority"!==b&&".sv"!==b&&(e=
	!0,!bf(b)))throw Error(a+" contains an invalid key ("+b+") "+Re(c)+'.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');c.push(b);ef(a,h,c);c.pop()});if(d&&e)throw Error(a+' contains ".value" child '+Re(c)+" in addition to actual children.");}}
	function ff(a,b){var c,d;for(c=0;c<b.length;c++){d=b[c];for(var e=d.slice(),f=0;f<e.length;f++)if((".priority"!==e[f]||f!==e.length-1)&&!bf(e[f]))throw Error(a+"contains an invalid key ("+e[f]+") in path "+d.toString()+'. Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');}b.sort(Oe);e=null;for(c=0;c<b.length;c++){d=b[c];if(null!==e&&e.contains(d))throw Error(a+"contains a path "+e.toString()+" that is ancestor of another path "+d.toString());e=d}}
	function gf(a,b,c){var d=y(a,1,!1);if(!ia(b)||ea(b))throw Error(d+" must be an object containing the children to replace.");var e=[];db(b,function(a,b){var k=new L(a);ef(d,b,c.n(k));if(".priority"===Bd(k)&&!cf(b))throw Error(d+"contains an invalid value for '"+k.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");e.push(k)});ff(d,e)}
	function hf(a,b,c){if(Cc(c))throw Error(y(a,b,!1)+"is "+c.toString()+", but must be a valid Firebase priority (a string, finite number, server value, or null).");if(!cf(c))throw Error(y(a,b,!1)+"must be a valid Firebase priority (a string, finite number, server value, or null).");}
	function jf(a,b,c){if(!c||n(b))switch(b){case "value":case "child_added":case "child_removed":case "child_changed":case "child_moved":break;default:throw Error(y(a,1,c)+'must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');}}function kf(a,b){if(n(b)&&!bf(b))throw Error(y(a,2,!0)+'was an invalid key: "'+b+'".  Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]").');}
	function lf(a,b){if(!p(b)||0===b.length||af.test(b))throw Error(y(a,1,!1)+'was an invalid path: "'+b+'". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"');}function mf(a,b){if(".info"===J(b))throw Error(a+" failed: Can't modify data under /.info/");}
	function Xe(a,b){var c=b.path.toString(),d;!(d=!p(b.jc.host)||0===b.jc.host.length||!bf(b.jc.ne))&&(d=0!==c.length)&&(c&&(c=c.replace(/^\/*\.info(\/|$)/,"/")),d=!(p(c)&&0!==c.length&&!af.test(c)));if(d)throw Error(y(a,1,!1)+'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".');};function V(a,b){this.ta=a;this.qa=b}V.prototype.cancel=function(a){x("Firebase.onDisconnect().cancel",0,1,arguments.length);A("Firebase.onDisconnect().cancel",1,a,!0);var b=new hb;this.ta.xd(this.qa,ib(b,a));return b.ra};V.prototype.cancel=V.prototype.cancel;V.prototype.remove=function(a){x("Firebase.onDisconnect().remove",0,1,arguments.length);mf("Firebase.onDisconnect().remove",this.qa);A("Firebase.onDisconnect().remove",1,a,!0);var b=new hb;nf(this.ta,this.qa,null,ib(b,a));return b.ra};
	V.prototype.remove=V.prototype.remove;V.prototype.set=function(a,b){x("Firebase.onDisconnect().set",1,2,arguments.length);mf("Firebase.onDisconnect().set",this.qa);df("Firebase.onDisconnect().set",a,this.qa,!1);A("Firebase.onDisconnect().set",2,b,!0);var c=new hb;nf(this.ta,this.qa,a,ib(c,b));return c.ra};V.prototype.set=V.prototype.set;
	V.prototype.Jb=function(a,b,c){x("Firebase.onDisconnect().setWithPriority",2,3,arguments.length);mf("Firebase.onDisconnect().setWithPriority",this.qa);df("Firebase.onDisconnect().setWithPriority",a,this.qa,!1);hf("Firebase.onDisconnect().setWithPriority",2,b);A("Firebase.onDisconnect().setWithPriority",3,c,!0);var d=new hb;of(this.ta,this.qa,a,b,ib(d,c));return d.ra};V.prototype.setWithPriority=V.prototype.Jb;
	V.prototype.update=function(a,b){x("Firebase.onDisconnect().update",1,2,arguments.length);mf("Firebase.onDisconnect().update",this.qa);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;O("Passing an Array to Firebase.onDisconnect().update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}gf("Firebase.onDisconnect().update",a,this.qa);A("Firebase.onDisconnect().update",2,b,!0);
	c=new hb;pf(this.ta,this.qa,a,ib(c,b));return c.ra};V.prototype.update=V.prototype.update;function qf(a){H(ea(a)&&0<a.length,"Requires a non-empty array");this.Bf=a;this.Dc={}}qf.prototype.Ee=function(a,b){var c;c=this.Dc[a]||[];var d=c.length;if(0<d){for(var e=Array(d),f=0;f<d;f++)e[f]=c[f];c=e}else c=[];for(d=0;d<c.length;d++)c[d].He.apply(c[d].Ma,Array.prototype.slice.call(arguments,1))};qf.prototype.gc=function(a,b,c){rf(this,a);this.Dc[a]=this.Dc[a]||[];this.Dc[a].push({He:b,Ma:c});(a=this.Ue(a))&&b.apply(c,a)};
	qf.prototype.Ic=function(a,b,c){rf(this,a);a=this.Dc[a]||[];for(var d=0;d<a.length;d++)if(a[d].He===b&&(!c||c===a[d].Ma)){a.splice(d,1);break}};function rf(a,b){H(Oa(a.Bf,function(a){return a===b}),"Unknown event: "+b)};function sf(){qf.call(this,["online"]);this.hc=!0;if("undefined"!==typeof window&&"undefined"!==typeof window.addEventListener&&!qb()){var a=this;window.addEventListener("online",function(){a.hc||(a.hc=!0,a.Ee("online",!0))},!1);window.addEventListener("offline",function(){a.hc&&(a.hc=!1,a.Ee("online",!1))},!1)}}la(sf,qf);sf.prototype.Ue=function(a){H("online"===a,"Unknown event type: "+a);return[this.hc]};ca(sf);function tf(){qf.call(this,["visible"]);var a,b;"undefined"!==typeof document&&"undefined"!==typeof document.addEventListener&&("undefined"!==typeof document.hidden?(b="visibilitychange",a="hidden"):"undefined"!==typeof document.mozHidden?(b="mozvisibilitychange",a="mozHidden"):"undefined"!==typeof document.msHidden?(b="msvisibilitychange",a="msHidden"):"undefined"!==typeof document.webkitHidden&&(b="webkitvisibilitychange",a="webkitHidden"));this.Mb=!0;if(b){var c=this;document.addEventListener(b,
	function(){var b=!document[a];b!==c.Mb&&(c.Mb=b,c.Ee("visible",b))},!1)}}la(tf,qf);tf.prototype.Ue=function(a){H("visible"===a,"Unknown event type: "+a);return[this.Mb]};ca(tf);var uf=function(){var a=0,b=[];return function(c){var d=c===a;a=c;for(var e=Array(8),f=7;0<=f;f--)e[f]="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c%64),c=Math.floor(c/64);H(0===c,"Cannot push at time == 0");c=e.join("");if(d){for(f=11;0<=f&&63===b[f];f--)b[f]=0;b[f]++}else for(f=0;12>f;f++)b[f]=Math.floor(64*Math.random());for(f=0;12>f;f++)c+="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);H(20===c.length,"nextPushId: Length should be 20.");
	return c}}();function vf(a,b){this.La=a;this.ba=b?b:wf}g=vf.prototype;g.Oa=function(a,b){return new vf(this.La,this.ba.Oa(a,b,this.La).X(null,null,!1,null,null))};g.remove=function(a){return new vf(this.La,this.ba.remove(a,this.La).X(null,null,!1,null,null))};g.get=function(a){for(var b,c=this.ba;!c.e();){b=this.La(a,c.key);if(0===b)return c.value;0>b?c=c.left:0<b&&(c=c.right)}return null};
	function xf(a,b){for(var c,d=a.ba,e=null;!d.e();){c=a.La(b,d.key);if(0===c){if(d.left.e())return e?e.key:null;for(d=d.left;!d.right.e();)d=d.right;return d.key}0>c?d=d.left:0<c&&(e=d,d=d.right)}throw Error("Attempted to find predecessor key for a nonexistent key.  What gives?");}g.e=function(){return this.ba.e()};g.count=function(){return this.ba.count()};g.Gc=function(){return this.ba.Gc()};g.ec=function(){return this.ba.ec()};g.ha=function(a){return this.ba.ha(a)};
	g.Wb=function(a){return new yf(this.ba,null,this.La,!1,a)};g.Xb=function(a,b){return new yf(this.ba,a,this.La,!1,b)};g.Zb=function(a,b){return new yf(this.ba,a,this.La,!0,b)};g.We=function(a){return new yf(this.ba,null,this.La,!0,a)};function yf(a,b,c,d,e){this.Hd=e||null;this.je=d;this.Pa=[];for(e=1;!a.e();)if(e=b?c(a.key,b):1,d&&(e*=-1),0>e)a=this.je?a.left:a.right;else if(0===e){this.Pa.push(a);break}else this.Pa.push(a),a=this.je?a.right:a.left}
	function R(a){if(0===a.Pa.length)return null;var b=a.Pa.pop(),c;c=a.Hd?a.Hd(b.key,b.value):{key:b.key,value:b.value};if(a.je)for(b=b.left;!b.e();)a.Pa.push(b),b=b.right;else for(b=b.right;!b.e();)a.Pa.push(b),b=b.left;return c}function zf(a){if(0===a.Pa.length)return null;var b;b=a.Pa;b=b[b.length-1];return a.Hd?a.Hd(b.key,b.value):{key:b.key,value:b.value}}function Af(a,b,c,d,e){this.key=a;this.value=b;this.color=null!=c?c:!0;this.left=null!=d?d:wf;this.right=null!=e?e:wf}g=Af.prototype;
	g.X=function(a,b,c,d,e){return new Af(null!=a?a:this.key,null!=b?b:this.value,null!=c?c:this.color,null!=d?d:this.left,null!=e?e:this.right)};g.count=function(){return this.left.count()+1+this.right.count()};g.e=function(){return!1};g.ha=function(a){return this.left.ha(a)||a(this.key,this.value)||this.right.ha(a)};function Bf(a){return a.left.e()?a:Bf(a.left)}g.Gc=function(){return Bf(this).key};g.ec=function(){return this.right.e()?this.key:this.right.ec()};
	g.Oa=function(a,b,c){var d,e;e=this;d=c(a,e.key);e=0>d?e.X(null,null,null,e.left.Oa(a,b,c),null):0===d?e.X(null,b,null,null,null):e.X(null,null,null,null,e.right.Oa(a,b,c));return Cf(e)};function Df(a){if(a.left.e())return wf;a.left.ea()||a.left.left.ea()||(a=Ef(a));a=a.X(null,null,null,Df(a.left),null);return Cf(a)}
	g.remove=function(a,b){var c,d;c=this;if(0>b(a,c.key))c.left.e()||c.left.ea()||c.left.left.ea()||(c=Ef(c)),c=c.X(null,null,null,c.left.remove(a,b),null);else{c.left.ea()&&(c=Ff(c));c.right.e()||c.right.ea()||c.right.left.ea()||(c=Gf(c),c.left.left.ea()&&(c=Ff(c),c=Gf(c)));if(0===b(a,c.key)){if(c.right.e())return wf;d=Bf(c.right);c=c.X(d.key,d.value,null,null,Df(c.right))}c=c.X(null,null,null,null,c.right.remove(a,b))}return Cf(c)};g.ea=function(){return this.color};
	function Cf(a){a.right.ea()&&!a.left.ea()&&(a=Hf(a));a.left.ea()&&a.left.left.ea()&&(a=Ff(a));a.left.ea()&&a.right.ea()&&(a=Gf(a));return a}function Ef(a){a=Gf(a);a.right.left.ea()&&(a=a.X(null,null,null,null,Ff(a.right)),a=Hf(a),a=Gf(a));return a}function Hf(a){return a.right.X(null,null,a.color,a.X(null,null,!0,null,a.right.left),null)}function Ff(a){return a.left.X(null,null,a.color,null,a.X(null,null,!0,a.left.right,null))}
	function Gf(a){return a.X(null,null,!a.color,a.left.X(null,null,!a.left.color,null,null),a.right.X(null,null,!a.right.color,null,null))}function If(){}g=If.prototype;g.X=function(){return this};g.Oa=function(a,b){return new Af(a,b,null)};g.remove=function(){return this};g.count=function(){return 0};g.e=function(){return!0};g.ha=function(){return!1};g.Gc=function(){return null};g.ec=function(){return null};g.ea=function(){return!1};var wf=new If;function P(a,b,c){this.k=a;(this.aa=b)&&Sd(this.aa);a.e()&&H(!this.aa||this.aa.e(),"An empty node cannot have a priority");this.yb=c;this.Db=null}g=P.prototype;g.J=function(){return!1};g.C=function(){return this.aa||G};g.fa=function(a){return this.k.e()?this:new P(this.k,a,this.yb)};g.Q=function(a){if(".priority"===a)return this.C();a=this.k.get(a);return null===a?G:a};g.P=function(a){var b=J(a);return null===b?this:this.Q(b).P(D(a))};g.Da=function(a){return null!==this.k.get(a)};
	g.T=function(a,b){H(b,"We should always be passing snapshot nodes");if(".priority"===a)return this.fa(b);var c=new K(a,b),d,e;b.e()?(d=this.k.remove(a),c=me(this.yb,c,this.k)):(d=this.k.Oa(a,b),c=ke(this.yb,c,this.k));e=d.e()?G:this.aa;return new P(d,e,c)};g.F=function(a,b){var c=J(a);if(null===c)return b;H(".priority"!==J(a)||1===Ad(a),".priority must be the last token in a path");var d=this.Q(c).F(D(a),b);return this.T(c,d)};g.e=function(){return this.k.e()};g.Eb=function(){return this.k.count()};
	var Jf=/^(0|[1-9]\d*)$/;g=P.prototype;g.H=function(a){if(this.e())return null;var b={},c=0,d=0,e=!0;this.O(N,function(f,h){b[f]=h.H(a);c++;e&&Jf.test(f)?d=Math.max(d,Number(f)):e=!1});if(!a&&e&&d<2*c){var f=[],h;for(h in b)f[h]=b[h];return f}a&&!this.C().e()&&(b[".priority"]=this.C().H());return b};g.hash=function(){if(null===this.Db){var a="";this.C().e()||(a+="priority:"+Ud(this.C().H())+":");this.O(N,function(b,c){var d=c.hash();""!==d&&(a+=":"+b+":"+d)});this.Db=""===a?"":uc(a)}return this.Db};
	g.Ve=function(a,b,c){return(c=Kf(this,c))?(a=xf(c,new K(a,b)))?a.name:null:xf(this.k,a)};function Qd(a,b){var c;c=(c=Kf(a,b))?(c=c.Gc())&&c.name:a.k.Gc();return c?new K(c,a.k.get(c)):null}function Rd(a,b){var c;c=(c=Kf(a,b))?(c=c.ec())&&c.name:a.k.ec();return c?new K(c,a.k.get(c)):null}g.O=function(a,b){var c=Kf(this,a);return c?c.ha(function(a){return b(a.name,a.R)}):this.k.ha(b)};g.Wb=function(a){return this.Xb(a.Hc(),a)};
	g.Xb=function(a,b){var c=Kf(this,b);if(c)return c.Xb(a,function(a){return a});for(var c=this.k.Xb(a.name,jc),d=zf(c);null!=d&&0>b.compare(d,a);)R(c),d=zf(c);return c};g.We=function(a){return this.Zb(a.Fc(),a)};g.Zb=function(a,b){var c=Kf(this,b);if(c)return c.Zb(a,function(a){return a});for(var c=this.k.Zb(a.name,jc),d=zf(c);null!=d&&0<b.compare(d,a);)R(c),d=zf(c);return c};g.sc=function(a){return this.e()?a.e()?0:-1:a.J()||a.e()?1:a===Zd?-1:0};
	g.nb=function(a){if(a===Fd||va(this.yb.cc,a.toString()))return this;var b=this.yb,c=this.k;H(a!==Fd,"KeyIndex always exists and isn't meant to be added to the IndexMap.");for(var d=[],e=!1,c=c.Wb(jc),f=R(c);f;)e=e||a.xc(f.R),d.push(f),f=R(c);d=e?le(d,Pd(a)):Wd;e=a.toString();c=za(b.cc);c[e]=a;a=za(b.od);a[e]=d;return new P(this.k,this.aa,new je(a,c))};g.yc=function(a){return a===Fd||va(this.yb.cc,a.toString())};
	g.Z=function(a){if(a===this)return!0;if(a.J())return!1;if(this.C().Z(a.C())&&this.k.count()===a.k.count()){var b=this.Wb(N);a=a.Wb(N);for(var c=R(b),d=R(a);c&&d;){if(c.name!==d.name||!c.R.Z(d.R))return!1;c=R(b);d=R(a)}return null===c&&null===d}return!1};function Kf(a,b){return b===Fd?null:a.yb.get(b.toString())}g.toString=function(){return B(this.H(!0))};function M(a,b){if(null===a)return G;var c=null;"object"===typeof a&&".priority"in a?c=a[".priority"]:"undefined"!==typeof b&&(c=b);H(null===c||"string"===typeof c||"number"===typeof c||"object"===typeof c&&".sv"in c,"Invalid priority type found: "+typeof c);"object"===typeof a&&".value"in a&&null!==a[".value"]&&(a=a[".value"]);if("object"!==typeof a||".sv"in a)return new qc(a,M(c));if(a instanceof Array){var d=G,e=a;r(e,function(a,b){if(cb(e,b)&&"."!==b.substring(0,1)){var c=M(a);if(c.J()||!c.e())d=
	d.T(b,c)}});return d.fa(M(c))}var f=[],h=!1,k=a;db(k,function(a){if("string"!==typeof a||"."!==a.substring(0,1)){var b=M(k[a]);b.e()||(h=h||!b.C().e(),f.push(new K(a,b)))}});if(0==f.length)return G;var l=le(f,gc,function(a){return a.name},ic);if(h){var m=le(f,Pd(N));return new P(l,M(c),new je({".priority":m},{".priority":N}))}return new P(l,M(c),ne)}var Lf=Math.log(2);
	function Mf(a){this.count=parseInt(Math.log(a+1)/Lf,10);this.Ne=this.count-1;this.Cf=a+1&parseInt(Array(this.count+1).join("1"),2)}function Nf(a){var b=!(a.Cf&1<<a.Ne);a.Ne--;return b}
	function le(a,b,c,d){function e(b,d){var f=d-b;if(0==f)return null;if(1==f){var m=a[b],u=c?c(m):m;return new Af(u,m.R,!1,null,null)}var m=parseInt(f/2,10)+b,f=e(b,m),z=e(m+1,d),m=a[m],u=c?c(m):m;return new Af(u,m.R,!1,f,z)}a.sort(b);var f=function(b){function d(b,h){var k=u-b,z=u;u-=b;var z=e(k+1,z),k=a[k],F=c?c(k):k,z=new Af(F,k.R,h,null,z);f?f.left=z:m=z;f=z}for(var f=null,m=null,u=a.length,z=0;z<b.count;++z){var F=Nf(b),id=Math.pow(2,b.count-(z+1));F?d(id,!1):(d(id,!1),d(id,!0))}return m}(new Mf(a.length));
	return null!==f?new vf(d||b,f):new vf(d||b)}function Ud(a){return"number"===typeof a?"number:"+Jc(a):"string:"+a}function Sd(a){if(a.J()){var b=a.H();H("string"===typeof b||"number"===typeof b||"object"===typeof b&&cb(b,".sv"),"Priority must be a string or number.")}else H(a===Zd||a.e(),"priority of unexpected type.");H(a===Zd||a.C().e(),"Priority nodes can't have a priority of their own.")}var G=new P(new vf(ic),null,ne);function Of(){P.call(this,new vf(ic),G,ne)}la(Of,P);g=Of.prototype;
	g.sc=function(a){return a===this?0:1};g.Z=function(a){return a===this};g.C=function(){return this};g.Q=function(){return G};g.e=function(){return!1};var Zd=new Of,Xd=new K("[MIN_NAME]",G),ce=new K("[MAX_NAME]",Zd);function W(a,b,c){this.A=a;this.V=b;this.g=c}W.prototype.H=function(){x("Firebase.DataSnapshot.val",0,0,arguments.length);return this.A.H()};W.prototype.val=W.prototype.H;W.prototype.Qe=function(){x("Firebase.DataSnapshot.exportVal",0,0,arguments.length);return this.A.H(!0)};W.prototype.exportVal=W.prototype.Qe;W.prototype.Lf=function(){x("Firebase.DataSnapshot.exists",0,0,arguments.length);return!this.A.e()};W.prototype.exists=W.prototype.Lf;
	W.prototype.n=function(a){x("Firebase.DataSnapshot.child",0,1,arguments.length);ga(a)&&(a=String(a));lf("Firebase.DataSnapshot.child",a);var b=new L(a),c=this.V.n(b);return new W(this.A.P(b),c,N)};W.prototype.child=W.prototype.n;W.prototype.Da=function(a){x("Firebase.DataSnapshot.hasChild",1,1,arguments.length);lf("Firebase.DataSnapshot.hasChild",a);var b=new L(a);return!this.A.P(b).e()};W.prototype.hasChild=W.prototype.Da;
	W.prototype.C=function(){x("Firebase.DataSnapshot.getPriority",0,0,arguments.length);return this.A.C().H()};W.prototype.getPriority=W.prototype.C;W.prototype.forEach=function(a){x("Firebase.DataSnapshot.forEach",1,1,arguments.length);A("Firebase.DataSnapshot.forEach",1,a,!1);if(this.A.J())return!1;var b=this;return!!this.A.O(this.g,function(c,d){return a(new W(d,b.V.n(c),N))})};W.prototype.forEach=W.prototype.forEach;
	W.prototype.kd=function(){x("Firebase.DataSnapshot.hasChildren",0,0,arguments.length);return this.A.J()?!1:!this.A.e()};W.prototype.hasChildren=W.prototype.kd;W.prototype.getKey=function(){x("Firebase.DataSnapshot.key",0,0,arguments.length);return this.V.getKey()};Lc(W.prototype,"key",W.prototype.getKey);W.prototype.Eb=function(){x("Firebase.DataSnapshot.numChildren",0,0,arguments.length);return this.A.Eb()};W.prototype.numChildren=W.prototype.Eb;
	W.prototype.wb=function(){x("Firebase.DataSnapshot.ref",0,0,arguments.length);return this.V};Lc(W.prototype,"ref",W.prototype.wb);function yd(a,b){this.N=a;this.Ld=b}function vd(a,b,c,d){return new yd(new $b(b,c,d),a.Ld)}function zd(a){return a.N.da?a.N.j():null}yd.prototype.w=function(){return this.Ld};function ac(a){return a.Ld.da?a.Ld.j():null};function Pf(a,b){this.V=a;var c=a.m,d=new Gd(c.g),c=S(c)?new Gd(c.g):c.xa?new Md(c):new Hd(c);this.hf=new pd(c);var e=b.w(),f=b.N,h=d.ya(G,e.j(),null),k=c.ya(G,f.j(),null);this.Ka=new yd(new $b(k,f.da,c.Na()),new $b(h,e.da,d.Na()));this.Za=[];this.Jf=new kd(a)}function Qf(a){return a.V}g=Pf.prototype;g.w=function(){return this.Ka.w().j()};g.hb=function(a){var b=ac(this.Ka);return b&&(S(this.V.m)||!a.e()&&!b.Q(J(a)).e())?b.P(a):null};g.e=function(){return 0===this.Za.length};g.Nb=function(a){this.Za.push(a)};
	g.kb=function(a,b){var c=[];if(b){H(null==a,"A cancel should cancel all event registrations.");var d=this.V.path;Ja(this.Za,function(a){(a=a.Le(b,d))&&c.push(a)})}if(a){for(var e=[],f=0;f<this.Za.length;++f){var h=this.Za[f];if(!h.matches(a))e.push(h);else if(a.Xe()){e=e.concat(this.Za.slice(f+1));break}}this.Za=e}else this.Za=[];return c};
	g.eb=function(a,b,c){a.type===Wc&&null!==a.source.Hb&&(H(ac(this.Ka),"We should always have a full cache before handling merges"),H(zd(this.Ka),"Missing event cache, even though we have a server cache"));var d=this.Ka;a=this.hf.eb(d,a,b,c);b=this.hf;c=a.Sd;H(c.N.j().yc(b.U.g),"Event snap not indexed");H(c.w().j().yc(b.U.g),"Server snap not indexed");H(dc(a.Sd.w())||!dc(d.w()),"Once a server snap is complete, it should never go back");this.Ka=a.Sd;return Rf(this,a.Df,a.Sd.N.j(),null)};
	function Sf(a,b){var c=a.Ka.N,d=[];c.j().J()||c.j().O(N,function(a,b){d.push(new I("child_added",b,a))});c.da&&d.push(bc(c.j()));return Rf(a,d,c.j(),b)}function Rf(a,b,c,d){return ld(a.Jf,b,c,d?[d]:a.Za)};function Tf(a,b,c){this.Pb=a;this.rb=b;this.tb=c||null}g=Tf.prototype;g.nf=function(a){return"value"===a};g.createEvent=function(a,b){var c=b.m.g;return new Ub("value",this,new W(a.Ja,b.wb(),c))};g.Tb=function(a){var b=this.tb;if("cancel"===a.ee()){H(this.rb,"Raising a cancel event on a listener with no cancel callback");var c=this.rb;return function(){c.call(b,a.error)}}var d=this.Pb;return function(){d.call(b,a.Md)}};g.Le=function(a,b){return this.rb?new Vb(this,a,b):null};
	g.matches=function(a){return a instanceof Tf?a.Pb&&this.Pb?a.Pb===this.Pb&&a.tb===this.tb:!0:!1};g.Xe=function(){return null!==this.Pb};function Uf(a,b,c){this.ga=a;this.rb=b;this.tb=c}g=Uf.prototype;g.nf=function(a){a="children_added"===a?"child_added":a;return("children_removed"===a?"child_removed":a)in this.ga};g.Le=function(a,b){return this.rb?new Vb(this,a,b):null};
	g.createEvent=function(a,b){H(null!=a.Xa,"Child events should have a childName.");var c=b.wb().n(a.Xa);return new Ub(a.type,this,new W(a.Ja,c,b.m.g),a.Dd)};g.Tb=function(a){var b=this.tb;if("cancel"===a.ee()){H(this.rb,"Raising a cancel event on a listener with no cancel callback");var c=this.rb;return function(){c.call(b,a.error)}}var d=this.ga[a.hd];return function(){d.call(b,a.Md,a.Dd)}};
	g.matches=function(a){if(a instanceof Uf){if(!this.ga||!a.ga)return!0;if(this.tb===a.tb){var b=ra(a.ga);if(b===ra(this.ga)){if(1===b){var b=sa(a.ga),c=sa(this.ga);return c===b&&(!a.ga[b]||!this.ga[c]||a.ga[b]===this.ga[c])}return qa(this.ga,function(b,c){return a.ga[c]===b})}}}return!1};g.Xe=function(){return null!==this.ga};function X(a,b,c,d){this.u=a;this.path=b;this.m=c;this.Nc=d}
	function Vf(a){var b=null,c=null;a.ka&&(b=Jd(a));a.na&&(c=Ld(a));if(a.g===Fd){if(a.ka){if("[MIN_NAME]"!=Id(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==typeof b)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}if(a.na){if("[MAX_NAME]"!=Kd(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==
	typeof c)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}}else if(a.g===N){if(null!=b&&!cf(b)||null!=c&&!cf(c))throw Error("Query: When ordering by priority, the first argument passed to startAt(), endAt(), or equalTo() must be a valid priority value (null, a number, or a string).");}else if(H(a.g instanceof Yd||a.g===de,"unknown index type."),null!=b&&"object"===typeof b||null!=c&&"object"===typeof c)throw Error("Query: First argument passed to startAt(), endAt(), or equalTo() cannot be an object.");
	}function Wf(a){if(a.ka&&a.na&&a.xa&&(!a.xa||""===a.mb))throw Error("Query: Can't combine startAt(), endAt(), and limit(). Use limitToFirst() or limitToLast() instead.");}function Xf(a,b){if(!0===a.Nc)throw Error(b+": You can't combine multiple orderBy calls.");}g=X.prototype;g.wb=function(){x("Query.ref",0,0,arguments.length);return new U(this.u,this.path)};
	g.gc=function(a,b,c,d){x("Query.on",2,4,arguments.length);jf("Query.on",a,!1);A("Query.on",2,b,!1);var e=Yf("Query.on",c,d);if("value"===a)Zf(this.u,this,new Tf(b,e.cancel||null,e.Ma||null));else{var f={};f[a]=b;Zf(this.u,this,new Uf(f,e.cancel,e.Ma))}return b};
	g.Ic=function(a,b,c){x("Query.off",0,3,arguments.length);jf("Query.off",a,!0);A("Query.off",2,b,!0);eb("Query.off",3,c);var d=null,e=null;"value"===a?d=new Tf(b||null,null,c||null):a&&(b&&(e={},e[a]=b),d=new Uf(e,null,c||null));e=this.u;d=".info"===J(this.path)?e.pd.kb(this,d):e.K.kb(this,d);Qb(e.ca,this.path,d)};
	g.$f=function(a,b){function c(k){f&&(f=!1,e.Ic(a,c),b&&b.call(d.Ma,k),h.resolve(k))}x("Query.once",1,4,arguments.length);jf("Query.once",a,!1);A("Query.once",2,b,!0);var d=Yf("Query.once",arguments[2],arguments[3]),e=this,f=!0,h=new hb;jb(h.ra);this.gc(a,c,function(b){e.Ic(a,c);d.cancel&&d.cancel.call(d.Ma,b);h.reject(b)});return h.ra};
	g.le=function(a){x("Query.limitToFirst",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToFirst: First argument must be a positive integer.");if(this.m.xa)throw Error("Query.limitToFirst: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new X(this.u,this.path,this.m.le(a),this.Nc)};
	g.me=function(a){x("Query.limitToLast",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToLast: First argument must be a positive integer.");if(this.m.xa)throw Error("Query.limitToLast: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new X(this.u,this.path,this.m.me(a),this.Nc)};
	g.ag=function(a){x("Query.orderByChild",1,1,arguments.length);if("$key"===a)throw Error('Query.orderByChild: "$key" is invalid.  Use Query.orderByKey() instead.');if("$priority"===a)throw Error('Query.orderByChild: "$priority" is invalid.  Use Query.orderByPriority() instead.');if("$value"===a)throw Error('Query.orderByChild: "$value" is invalid.  Use Query.orderByValue() instead.');lf("Query.orderByChild",a);Xf(this,"Query.orderByChild");var b=new L(a);if(b.e())throw Error("Query.orderByChild: cannot pass in empty path.  Use Query.orderByValue() instead.");
	b=new Yd(b);b=he(this.m,b);Vf(b);return new X(this.u,this.path,b,!0)};g.bg=function(){x("Query.orderByKey",0,0,arguments.length);Xf(this,"Query.orderByKey");var a=he(this.m,Fd);Vf(a);return new X(this.u,this.path,a,!0)};g.cg=function(){x("Query.orderByPriority",0,0,arguments.length);Xf(this,"Query.orderByPriority");var a=he(this.m,N);Vf(a);return new X(this.u,this.path,a,!0)};
	g.dg=function(){x("Query.orderByValue",0,0,arguments.length);Xf(this,"Query.orderByValue");var a=he(this.m,de);Vf(a);return new X(this.u,this.path,a,!0)};g.Nd=function(a,b){x("Query.startAt",0,2,arguments.length);df("Query.startAt",a,this.path,!0);kf("Query.startAt",b);var c=this.m.Nd(a,b);Wf(c);Vf(c);if(this.m.ka)throw Error("Query.startAt: Starting point was already set (by another call to startAt or equalTo).");n(a)||(b=a=null);return new X(this.u,this.path,c,this.Nc)};
	g.gd=function(a,b){x("Query.endAt",0,2,arguments.length);df("Query.endAt",a,this.path,!0);kf("Query.endAt",b);var c=this.m.gd(a,b);Wf(c);Vf(c);if(this.m.na)throw Error("Query.endAt: Ending point was already set (by another call to endAt or equalTo).");return new X(this.u,this.path,c,this.Nc)};
	g.If=function(a,b){x("Query.equalTo",1,2,arguments.length);df("Query.equalTo",a,this.path,!1);kf("Query.equalTo",b);if(this.m.ka)throw Error("Query.equalTo: Starting point was already set (by another call to endAt or equalTo).");if(this.m.na)throw Error("Query.equalTo: Ending point was already set (by another call to endAt or equalTo).");return this.Nd(a,b).gd(a,b)};
	g.toString=function(){x("Query.toString",0,0,arguments.length);for(var a=this.path,b="",c=a.Y;c<a.o.length;c++)""!==a.o[c]&&(b+="/"+encodeURIComponent(String(a.o[c])));return this.u.toString()+(b||"/")};g.ja=function(){var a=Gc(ie(this.m));return"{}"===a?"default":a};
	g.isEqual=function(a){x("Query.isEqual",1,1,arguments.length);if(!(a instanceof X))throw Error("Query.isEqual failed: First argument must be an instance of firebase.database.Query.");var b=this.u===a.u,c=this.path.Z(a.path),d=this.ja()===a.ja();return b&&c&&d};
	function Yf(a,b,c){var d={cancel:null,Ma:null};if(b&&c)d.cancel=b,A(a,3,d.cancel,!0),d.Ma=c,eb(a,4,d.Ma);else if(b)if("object"===typeof b&&null!==b)d.Ma=b;else if("function"===typeof b)d.cancel=b;else throw Error(y(a,3,!0)+" must either be a cancel callback or a context object.");return d}X.prototype.on=X.prototype.gc;X.prototype.off=X.prototype.Ic;X.prototype.once=X.prototype.$f;X.prototype.limitToFirst=X.prototype.le;X.prototype.limitToLast=X.prototype.me;X.prototype.orderByChild=X.prototype.ag;
	X.prototype.orderByKey=X.prototype.bg;X.prototype.orderByPriority=X.prototype.cg;X.prototype.orderByValue=X.prototype.dg;X.prototype.startAt=X.prototype.Nd;X.prototype.endAt=X.prototype.gd;X.prototype.equalTo=X.prototype.If;X.prototype.toString=X.prototype.toString;X.prototype.isEqual=X.prototype.isEqual;Lc(X.prototype,"ref",X.prototype.wb);function $f(a,b){this.value=a;this.children=b||ag}var ag=new vf(function(a,b){return a===b?0:a<b?-1:1});function bg(a){var b=Q;r(a,function(a,d){b=b.set(new L(d),a)});return b}g=$f.prototype;g.e=function(){return null===this.value&&this.children.e()};function cg(a,b,c){if(null!=a.value&&c(a.value))return{path:C,value:a.value};if(b.e())return null;var d=J(b);a=a.children.get(d);return null!==a?(b=cg(a,D(b),c),null!=b?{path:(new L(d)).n(b.path),value:b.value}:null):null}
	function dg(a,b){return cg(a,b,function(){return!0})}g.subtree=function(a){if(a.e())return this;var b=this.children.get(J(a));return null!==b?b.subtree(D(a)):Q};g.set=function(a,b){if(a.e())return new $f(b,this.children);var c=J(a),d=(this.children.get(c)||Q).set(D(a),b),c=this.children.Oa(c,d);return new $f(this.value,c)};
	g.remove=function(a){if(a.e())return this.children.e()?Q:new $f(null,this.children);var b=J(a),c=this.children.get(b);return c?(a=c.remove(D(a)),b=a.e()?this.children.remove(b):this.children.Oa(b,a),null===this.value&&b.e()?Q:new $f(this.value,b)):this};g.get=function(a){if(a.e())return this.value;var b=this.children.get(J(a));return b?b.get(D(a)):null};
	function Ed(a,b,c){if(b.e())return c;var d=J(b);b=Ed(a.children.get(d)||Q,D(b),c);d=b.e()?a.children.remove(d):a.children.Oa(d,b);return new $f(a.value,d)}function eg(a,b){return fg(a,C,b)}function fg(a,b,c){var d={};a.children.ha(function(a,f){d[a]=fg(f,b.n(a),c)});return c(b,a.value,d)}function gg(a,b,c){return hg(a,b,C,c)}function hg(a,b,c,d){var e=a.value?d(c,a.value):!1;if(e)return e;if(b.e())return null;e=J(b);return(a=a.children.get(e))?hg(a,D(b),c.n(e),d):null}
	function ig(a,b,c){jg(a,b,C,c)}function jg(a,b,c,d){if(b.e())return a;a.value&&d(c,a.value);var e=J(b);return(a=a.children.get(e))?jg(a,D(b),c.n(e),d):Q}function Cd(a,b){kg(a,C,b)}function kg(a,b,c){a.children.ha(function(a,e){kg(e,b.n(a),c)});a.value&&c(b,a.value)}function lg(a,b){a.children.ha(function(a,d){d.value&&b(a,d.value)})}var Q=new $f(null);$f.prototype.toString=function(){var a={};Cd(this,function(b,c){a[b.toString()]=c.toString()});return B(a)};function mg(a,b,c){this.type=ud;this.source=ng;this.path=a;this.Ob=b;this.Id=c}mg.prototype.Mc=function(a){if(this.path.e()){if(null!=this.Ob.value)return H(this.Ob.children.e(),"affectedTree should not have overlapping affected paths."),this;a=this.Ob.subtree(new L(a));return new mg(C,a,this.Id)}H(J(this.path)===a,"operationForChild called for unrelated child.");return new mg(D(this.path),this.Ob,this.Id)};
	mg.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" ack write revert="+this.Id+" affectedTree="+this.Ob+")"};var Bb=0,Wc=1,ud=2,Db=3;function og(a,b,c,d){this.ce=a;this.Se=b;this.Hb=c;this.Ce=d;H(!d||b,"Tagged queries must be from server.")}var ng=new og(!0,!1,null,!1),pg=new og(!1,!0,null,!1);og.prototype.toString=function(){return this.ce?"user":this.Ce?"server(queryID="+this.Hb+")":"server"};function qg(a){this.W=a}var rg=new qg(new $f(null));function sg(a,b,c){if(b.e())return new qg(new $f(c));var d=dg(a.W,b);if(null!=d){var e=d.path,d=d.value;b=T(e,b);d=d.F(b,c);return new qg(a.W.set(e,d))}a=Ed(a.W,b,new $f(c));return new qg(a)}function tg(a,b,c){var d=a;db(c,function(a,c){d=sg(d,b.n(a),c)});return d}qg.prototype.Ed=function(a){if(a.e())return rg;a=Ed(this.W,a,Q);return new qg(a)};function ug(a,b){var c=dg(a.W,b);return null!=c?a.W.get(c.path).P(T(c.path,b)):null}
	function vg(a){var b=[],c=a.W.value;null!=c?c.J()||c.O(N,function(a,c){b.push(new K(a,c))}):a.W.children.ha(function(a,c){null!=c.value&&b.push(new K(a,c.value))});return b}function wg(a,b){if(b.e())return a;var c=ug(a,b);return null!=c?new qg(new $f(c)):new qg(a.W.subtree(b))}qg.prototype.e=function(){return this.W.e()};qg.prototype.apply=function(a){return xg(C,this.W,a)};
	function xg(a,b,c){if(null!=b.value)return c.F(a,b.value);var d=null;b.children.ha(function(b,f){".priority"===b?(H(null!==f.value,"Priority writes must always be leaf nodes"),d=f.value):c=xg(a.n(b),f,c)});c.P(a).e()||null===d||(c=c.F(a.n(".priority"),d));return c};function yg(){this.za={}}g=yg.prototype;g.e=function(){return ya(this.za)};g.eb=function(a,b,c){var d=a.source.Hb;if(null!==d)return d=w(this.za,d),H(null!=d,"SyncTree gave us an op for an invalid query."),d.eb(a,b,c);var e=[];r(this.za,function(d){e=e.concat(d.eb(a,b,c))});return e};g.Nb=function(a,b,c,d,e){var f=a.ja(),h=w(this.za,f);if(!h){var h=c.Aa(e?d:null),k=!1;h?k=!0:(h=d instanceof P?c.rc(d):G,k=!1);h=new Pf(a,new yd(new $b(h,k,!1),new $b(d,e,!1)));this.za[f]=h}h.Nb(b);return Sf(h,b)};
	g.kb=function(a,b,c){var d=a.ja(),e=[],f=[],h=null!=zg(this);if("default"===d){var k=this;r(this.za,function(a,d){f=f.concat(a.kb(b,c));a.e()&&(delete k.za[d],S(a.V.m)||e.push(a.V))})}else{var l=w(this.za,d);l&&(f=f.concat(l.kb(b,c)),l.e()&&(delete this.za[d],S(l.V.m)||e.push(l.V)))}h&&null==zg(this)&&e.push(new U(a.u,a.path));return{hg:e,Kf:f}};function Ag(a){return Ka(ta(a.za),function(a){return!S(a.V.m)})}g.hb=function(a){var b=null;r(this.za,function(c){b=b||c.hb(a)});return b};
	function Bg(a,b){if(S(b.m))return zg(a);var c=b.ja();return w(a.za,c)}function zg(a){return xa(a.za,function(a){return S(a.V.m)})||null};function Cg(){this.S=rg;this.la=[];this.Bc=-1}function Dg(a,b){for(var c=0;c<a.la.length;c++){var d=a.la[c];if(d.Zc===b)return d}return null}g=Cg.prototype;
	g.Ed=function(a){var b=Pa(this.la,function(b){return b.Zc===a});H(0<=b,"removeWrite called with nonexistent writeId.");var c=this.la[b];this.la.splice(b,1);for(var d=c.visible,e=!1,f=this.la.length-1;d&&0<=f;){var h=this.la[f];h.visible&&(f>=b&&Eg(h,c.path)?d=!1:c.path.contains(h.path)&&(e=!0));f--}if(d){if(e)this.S=Fg(this.la,Gg,C),this.Bc=0<this.la.length?this.la[this.la.length-1].Zc:-1;else if(c.Ga)this.S=this.S.Ed(c.path);else{var k=this;r(c.children,function(a,b){k.S=k.S.Ed(c.path.n(b))})}return!0}return!1};
	g.Aa=function(a,b,c,d){if(c||d){var e=wg(this.S,a);return!d&&e.e()?b:d||null!=b||null!=ug(e,C)?(e=Fg(this.la,function(b){return(b.visible||d)&&(!c||!(0<=Ia(c,b.Zc)))&&(b.path.contains(a)||a.contains(b.path))},a),b=b||G,e.apply(b)):null}e=ug(this.S,a);if(null!=e)return e;e=wg(this.S,a);return e.e()?b:null!=b||null!=ug(e,C)?(b=b||G,e.apply(b)):null};
	g.rc=function(a,b){var c=G,d=ug(this.S,a);if(d)d.J()||d.O(N,function(a,b){c=c.T(a,b)});else if(b){var e=wg(this.S,a);b.O(N,function(a,b){var d=wg(e,new L(a)).apply(b);c=c.T(a,d)});Ja(vg(e),function(a){c=c.T(a.name,a.R)})}else e=wg(this.S,a),Ja(vg(e),function(a){c=c.T(a.name,a.R)});return c};g.ad=function(a,b,c,d){H(c||d,"Either existingEventSnap or existingServerSnap must exist");a=a.n(b);if(null!=ug(this.S,a))return null;a=wg(this.S,a);return a.e()?d.P(b):a.apply(d.P(b))};
	g.qc=function(a,b,c){a=a.n(b);var d=ug(this.S,a);return null!=d?d:Zb(c,b)?wg(this.S,a).apply(c.j().Q(b)):null};g.lc=function(a){return ug(this.S,a)};g.Wd=function(a,b,c,d,e,f){var h;a=wg(this.S,a);h=ug(a,C);if(null==h)if(null!=b)h=a.apply(b);else return[];h=h.nb(f);if(h.e()||h.J())return[];b=[];a=Pd(f);e=e?h.Zb(c,f):h.Xb(c,f);for(f=R(e);f&&b.length<d;)0!==a(f,c)&&b.push(f),f=R(e);return b};
	function Eg(a,b){return a.Ga?a.path.contains(b):!!wa(a.children,function(c,d){return a.path.n(d).contains(b)})}function Gg(a){return a.visible}
	function Fg(a,b,c){for(var d=rg,e=0;e<a.length;++e){var f=a[e];if(b(f)){var h=f.path;if(f.Ga)c.contains(h)?(h=T(c,h),d=sg(d,h,f.Ga)):h.contains(c)&&(h=T(h,c),d=sg(d,C,f.Ga.P(h)));else if(f.children)if(c.contains(h))h=T(c,h),d=tg(d,h,f.children);else{if(h.contains(c))if(h=T(h,c),h.e())d=tg(d,C,f.children);else if(f=w(f.children,J(h)))f=f.P(D(h)),d=sg(d,C,f)}else throw sc("WriteRecord should have .snap or .children");}}return d}function Hg(a,b){this.Lb=a;this.W=b}g=Hg.prototype;
	g.Aa=function(a,b,c){return this.W.Aa(this.Lb,a,b,c)};g.rc=function(a){return this.W.rc(this.Lb,a)};g.ad=function(a,b,c){return this.W.ad(this.Lb,a,b,c)};g.lc=function(a){return this.W.lc(this.Lb.n(a))};g.Wd=function(a,b,c,d,e){return this.W.Wd(this.Lb,a,b,c,d,e)};g.qc=function(a,b){return this.W.qc(this.Lb,a,b)};g.n=function(a){return new Hg(this.Lb.n(a),this.W)};function Ig(){this.children={};this.bd=0;this.value=null}function Jg(a,b,c){this.ud=a?a:"";this.Pc=b?b:null;this.A=c?c:new Ig}function Kg(a,b){for(var c=b instanceof L?b:new L(b),d=a,e;null!==(e=J(c));)d=new Jg(e,d,w(d.A.children,e)||new Ig),c=D(c);return d}g=Jg.prototype;g.Ca=function(){return this.A.value};function Lg(a,b){H("undefined"!==typeof b,"Cannot set value to undefined");a.A.value=b;Mg(a)}g.clear=function(){this.A.value=null;this.A.children={};this.A.bd=0;Mg(this)};
	g.kd=function(){return 0<this.A.bd};g.e=function(){return null===this.Ca()&&!this.kd()};g.O=function(a){var b=this;r(this.A.children,function(c,d){a(new Jg(d,b,c))})};function Ng(a,b,c,d){c&&!d&&b(a);a.O(function(a){Ng(a,b,!0,d)});c&&d&&b(a)}function Og(a,b){for(var c=a.parent();null!==c&&!b(c);)c=c.parent()}g.path=function(){return new L(null===this.Pc?this.ud:this.Pc.path()+"/"+this.ud)};g.name=function(){return this.ud};g.parent=function(){return this.Pc};
	function Mg(a){if(null!==a.Pc){var b=a.Pc,c=a.ud,d=a.e(),e=cb(b.A.children,c);d&&e?(delete b.A.children[c],b.A.bd--,Mg(b)):d||e||(b.A.children[c]=a.A,b.A.bd++,Mg(b))}};function Pg(a,b,c,d,e,f){this.id=Qg++;this.f=yc("p:"+this.id+":");this.qd={};this.$={};this.pa=[];this.Oc=0;this.Kc=[];this.ma=!1;this.Sa=1E3;this.td=3E5;this.Gb=b;this.Jc=c;this.se=d;this.L=a;this.ob=this.Fa=this.Cb=this.xe=null;this.$c=e;this.be=!1;this.ie=0;if(f)throw Error("Auth override specified in options, but not supported on non Node.js platforms");this.Ge=f||null;this.ub=null;this.Mb=!1;this.Gd={};this.ig=0;this.Re=!0;this.Ac=this.ke=null;Rg(this,0);tf.Vb().gc("visible",this.Zf,this);-1===
	a.host.indexOf("fblocal")&&sf.Vb().gc("online",this.Yf,this)}var Qg=0,Sg=0;g=Pg.prototype;g.ua=function(a,b,c){var d=++this.ig;a={r:d,a:a,b:b};this.f(B(a));H(this.ma,"sendRequest call when we're not connected not allowed.");this.Fa.ua(a);c&&(this.Gd[d]=c)};
	g.$e=function(a,b,c,d){var e=a.ja(),f=a.path.toString();this.f("Listen called for "+f+" "+e);this.$[f]=this.$[f]||{};H(Sc(a.m)||!S(a.m),"listen() called for non-default but complete query");H(!this.$[f][e],"listen() called twice for same path/queryId.");a={G:d,ld:b,eg:a,tag:c};this.$[f][e]=a;this.ma&&Tg(this,a)};
	function Tg(a,b){var c=b.eg,d=c.path.toString(),e=c.ja();a.f("Listen on "+d+" for "+e);var f={p:d};b.tag&&(f.q=ie(c.m),f.t=b.tag);f.h=b.ld();a.ua("q",f,function(f){var k=f.d,l=f.s;if(k&&"object"===typeof k&&cb(k,"w")){var m=w(k,"w");ea(m)&&0<=Ia(m,"no_index")&&O("Using an unspecified index. Consider adding "+('".indexOn": "'+c.m.g.toString()+'"')+" at "+c.path.toString()+" to your security rules for better performance")}(a.$[d]&&a.$[d][e])===b&&(a.f("listen response",f),"ok"!==l&&Ug(a,d,e),b.G&&b.G(l,
	k))})}g.kf=function(a){this.ob=a;this.f("Auth token refreshed");this.ob?Vg(this):this.ma&&this.ua("unauth",{},function(){});if(a&&40===a.length||Pc(a))this.f("Admin auth credential detected.  Reducing max reconnect time."),this.td=3E4};function Vg(a){if(a.ma&&a.ob){var b=a.ob,c=Oc(b)?"auth":"gauth",d={cred:b};a.Ge&&(d.authvar=a.Ge);a.ua(c,d,function(c){var d=c.s;c=c.d||"error";a.ob===b&&("ok"===d?a.ie=0:Wg(a,d,c))})}}
	g.uf=function(a,b){var c=a.path.toString(),d=a.ja();this.f("Unlisten called for "+c+" "+d);H(Sc(a.m)||!S(a.m),"unlisten() called for non-default but complete query");if(Ug(this,c,d)&&this.ma){var e=ie(a.m);this.f("Unlisten on "+c+" for "+d);c={p:c};b&&(c.q=e,c.t=b);this.ua("n",c)}};g.pe=function(a,b,c){this.ma?Xg(this,"o",a,b,c):this.Kc.push({ue:a,action:"o",data:b,G:c})};g.cf=function(a,b,c){this.ma?Xg(this,"om",a,b,c):this.Kc.push({ue:a,action:"om",data:b,G:c})};
	g.xd=function(a,b){this.ma?Xg(this,"oc",a,null,b):this.Kc.push({ue:a,action:"oc",data:null,G:b})};function Xg(a,b,c,d,e){c={p:c,d:d};a.f("onDisconnect "+b,c);a.ua(b,c,function(a){e&&setTimeout(function(){e(a.s,a.d)},Math.floor(0))})}g.put=function(a,b,c,d){Yg(this,"p",a,b,c,d)};g.af=function(a,b,c,d){Yg(this,"m",a,b,c,d)};function Yg(a,b,c,d,e,f){d={p:c,d:d};n(f)&&(d.h=f);a.pa.push({action:b,mf:d,G:e});a.Oc++;b=a.pa.length-1;a.ma?Zg(a,b):a.f("Buffering put: "+c)}
	function Zg(a,b){var c=a.pa[b].action,d=a.pa[b].mf,e=a.pa[b].G;a.pa[b].fg=a.ma;a.ua(c,d,function(d){a.f(c+" response",d);delete a.pa[b];a.Oc--;0===a.Oc&&(a.pa=[]);e&&e(d.s,d.d)})}g.we=function(a){this.ma&&(a={c:a},this.f("reportStats",a),this.ua("s",a,function(a){"ok"!==a.s&&this.f("reportStats","Error sending stats: "+a.d)}))};
	g.wd=function(a){if("r"in a){this.f("from server: "+B(a));var b=a.r,c=this.Gd[b];c&&(delete this.Gd[b],c(a.b))}else{if("error"in a)throw"A server-side error has occurred: "+a.error;"a"in a&&(b=a.a,a=a.b,this.f("handleServerMessage",b,a),"d"===b?this.Gb(a.p,a.d,!1,a.t):"m"===b?this.Gb(a.p,a.d,!0,a.t):"c"===b?$g(this,a.p,a.q):"ac"===b?Wg(this,a.s,a.d):"sd"===b?this.xe?this.xe(a):"msg"in a&&"undefined"!==typeof console&&console.log("FIREBASE: "+a.msg.replace("\n","\nFIREBASE: ")):zc("Unrecognized action received from server: "+
	B(b)+"\nAre you using the latest client?"))}};g.Lc=function(a,b){this.f("connection ready");this.ma=!0;this.Ac=(new Date).getTime();this.se({serverTimeOffset:a-(new Date).getTime()});this.Cb=b;if(this.Re){var c={};c["sdk.js."+firebase.SDK_VERSION.replace(/\./g,"-")]=1;qb()?c["framework.cordova"]=1:"object"===typeof navigator&&"ReactNative"===navigator.product&&(c["framework.reactnative"]=1);this.we(c)}ah(this);this.Re=!1;this.Jc(!0)};
	function Rg(a,b){H(!a.Fa,"Scheduling a connect when we're already connected/ing?");a.ub&&clearTimeout(a.ub);a.ub=setTimeout(function(){a.ub=null;bh(a)},Math.floor(b))}g.Zf=function(a){a&&!this.Mb&&this.Sa===this.td&&(this.f("Window became visible.  Reducing delay."),this.Sa=1E3,this.Fa||Rg(this,0));this.Mb=a};g.Yf=function(a){a?(this.f("Browser went online."),this.Sa=1E3,this.Fa||Rg(this,0)):(this.f("Browser went offline.  Killing connection."),this.Fa&&this.Fa.close())};
	g.df=function(){this.f("data client disconnected");this.ma=!1;this.Fa=null;for(var a=0;a<this.pa.length;a++){var b=this.pa[a];b&&"h"in b.mf&&b.fg&&(b.G&&b.G("disconnect"),delete this.pa[a],this.Oc--)}0===this.Oc&&(this.pa=[]);this.Gd={};ch(this)&&(this.Mb?this.Ac&&(3E4<(new Date).getTime()-this.Ac&&(this.Sa=1E3),this.Ac=null):(this.f("Window isn't visible.  Delaying reconnect."),this.Sa=this.td,this.ke=(new Date).getTime()),a=Math.max(0,this.Sa-((new Date).getTime()-this.ke)),a*=Math.random(),this.f("Trying to reconnect in "+
	a+"ms"),Rg(this,a),this.Sa=Math.min(this.td,1.3*this.Sa));this.Jc(!1)};
	function bh(a){if(ch(a)){a.f("Making a connection attempt");a.ke=(new Date).getTime();a.Ac=null;var b=q(a.wd,a),c=q(a.Lc,a),d=q(a.df,a),e=a.id+":"+Sg++,f=a.Cb,h=!1,k=null,l=function(){k?k.close():(h=!0,d())};a.Fa={close:l,ua:function(a){H(k,"sendRequest call when we're not connected not allowed.");k.ua(a)}};var m=a.be;a.be=!1;a.$c.getToken(m).then(function(l){h?E("getToken() completed but was canceled"):(E("getToken() completed. Creating connection."),a.ob=l&&l.accessToken,k=new Ce(e,a.L,b,c,d,function(b){O(b+
	" ("+a.L.toString()+")");a.ab("server_kill")},f))}).then(null,function(b){a.f("Failed to get token: "+b);h||l()})}}g.ab=function(a){E("Interrupting connection for reason: "+a);this.qd[a]=!0;this.Fa?this.Fa.close():(this.ub&&(clearTimeout(this.ub),this.ub=null),this.ma&&this.df())};g.kc=function(a){E("Resuming connection for reason: "+a);delete this.qd[a];ya(this.qd)&&(this.Sa=1E3,this.Fa||Rg(this,0))};
	function $g(a,b,c){c=c?La(c,function(a){return Gc(a)}).join("$"):"default";(a=Ug(a,b,c))&&a.G&&a.G("permission_denied")}function Ug(a,b,c){b=(new L(b)).toString();var d;n(a.$[b])?(d=a.$[b][c],delete a.$[b][c],0===ra(a.$[b])&&delete a.$[b]):d=void 0;return d}
	function Wg(a,b,c){E("Auth token revoked: "+b+"/"+c);a.ob=null;a.be=!0;a.Fa.close();"invalid_token"===b&&(a.ie++,3<=a.ie&&(a.Sa=3E4,a=a.$c,b='Provided authentication credentials for the app named "'+a.oc.name+'" are invalid. This usually indicates your app was not initialized correctly. ',b="credential"in a.oc.options?b+'Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in a.oc.options?
	b+'Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':b+'Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',O(b)))}
	function ah(a){Vg(a);r(a.$,function(b){r(b,function(b){Tg(a,b)})});for(var b=0;b<a.pa.length;b++)a.pa[b]&&Zg(a,b);for(;a.Kc.length;)b=a.Kc.shift(),Xg(a,b.action,b.ue,b.data,b.G)}function ch(a){var b;b=sf.Vb().hc;return ya(a.qd)&&b};var Y={Mf:function(){re=dd=!0}};Y.forceLongPolling=Y.Mf;Y.Nf=function(){se=!0};Y.forceWebSockets=Y.Nf;Y.Tf=function(){return cd.isAvailable()};Y.isWebSocketsAvailable=Y.Tf;Y.lg=function(a,b){a.u.Ra.xe=b};Y.setSecurityDebugCallback=Y.lg;Y.ze=function(a,b){a.u.ze(b)};Y.stats=Y.ze;Y.Ae=function(a,b){a.u.Ae(b)};Y.statsIncrementCounter=Y.Ae;Y.fd=function(a){return a.u.fd};Y.dataUpdateCount=Y.fd;Y.Sf=function(a,b){a.u.he=b};Y.interceptServerData=Y.Sf;function dh(a){this.wa=Q;this.jb=new Cg;this.Be={};this.ic={};this.Cc=a}function eh(a,b,c,d,e){var f=a.jb,h=e;H(d>f.Bc,"Stacking an older write on top of newer ones");n(h)||(h=!0);f.la.push({path:b,Ga:c,Zc:d,visible:h});h&&(f.S=sg(f.S,b,c));f.Bc=d;return e?fh(a,new Ab(ng,b,c)):[]}function gh(a,b,c,d){var e=a.jb;H(d>e.Bc,"Stacking an older merge on top of newer ones");e.la.push({path:b,children:c,Zc:d,visible:!0});e.S=tg(e.S,b,c);e.Bc=d;c=bg(c);return fh(a,new Vc(ng,b,c))}
	function hh(a,b,c){c=c||!1;var d=Dg(a.jb,b);if(a.jb.Ed(b)){var e=Q;null!=d.Ga?e=e.set(C,!0):db(d.children,function(a,b){e=e.set(new L(a),b)});return fh(a,new mg(d.path,e,c))}return[]}function ih(a,b,c){c=bg(c);return fh(a,new Vc(pg,b,c))}function jh(a,b,c,d){d=kh(a,d);if(null!=d){var e=lh(d);d=e.path;e=e.Hb;b=T(d,b);c=new Ab(new og(!1,!0,e,!0),b,c);return mh(a,d,c)}return[]}
	function nh(a,b,c,d){if(d=kh(a,d)){var e=lh(d);d=e.path;e=e.Hb;b=T(d,b);c=bg(c);c=new Vc(new og(!1,!0,e,!0),b,c);return mh(a,d,c)}return[]}
	dh.prototype.Nb=function(a,b){var c=a.path,d=null,e=!1;ig(this.wa,c,function(a,b){var f=T(a,c);d=d||b.hb(f);e=e||null!=zg(b)});var f=this.wa.get(c);f?(e=e||null!=zg(f),d=d||f.hb(C)):(f=new yg,this.wa=this.wa.set(c,f));var h;null!=d?h=!0:(h=!1,d=G,lg(this.wa.subtree(c),function(a,b){var c=b.hb(C);c&&(d=d.T(a,c))}));var k=null!=Bg(f,a);if(!k&&!S(a.m)){var l=oh(a);H(!(l in this.ic),"View does not exist, but we have a tag");var m=ph++;this.ic[l]=m;this.Be["_"+m]=l}h=f.Nb(a,b,new Hg(c,this.jb),d,h);k||
	e||(f=Bg(f,a),h=h.concat(qh(this,a,f)));return h};
	dh.prototype.kb=function(a,b,c){var d=a.path,e=this.wa.get(d),f=[];if(e&&("default"===a.ja()||null!=Bg(e,a))){f=e.kb(a,b,c);e.e()&&(this.wa=this.wa.remove(d));e=f.hg;f=f.Kf;b=-1!==Pa(e,function(a){return S(a.m)});var h=gg(this.wa,d,function(a,b){return null!=zg(b)});if(b&&!h&&(d=this.wa.subtree(d),!d.e()))for(var d=rh(d),k=0;k<d.length;++k){var l=d[k],m=l.V,l=sh(this,l);this.Cc.ye(th(m),uh(this,m),l.ld,l.G)}if(!h&&0<e.length&&!c)if(b)this.Cc.Od(th(a),null);else{var u=this;Ja(e,function(a){a.ja();
	var b=u.ic[oh(a)];u.Cc.Od(th(a),b)})}vh(this,e)}return f};dh.prototype.Aa=function(a,b){var c=this.jb,d=gg(this.wa,a,function(b,c){var d=T(b,a);if(d=c.hb(d))return d});return c.Aa(a,d,b,!0)};function rh(a){return eg(a,function(a,c,d){if(c&&null!=zg(c))return[zg(c)];var e=[];c&&(e=Ag(c));r(d,function(a){e=e.concat(a)});return e})}function vh(a,b){for(var c=0;c<b.length;++c){var d=b[c];if(!S(d.m)){var d=oh(d),e=a.ic[d];delete a.ic[d];delete a.Be["_"+e]}}}
	function th(a){return S(a.m)&&!Sc(a.m)?a.wb():a}function qh(a,b,c){var d=b.path,e=uh(a,b);c=sh(a,c);b=a.Cc.ye(th(b),e,c.ld,c.G);d=a.wa.subtree(d);if(e)H(null==zg(d.value),"If we're adding a query, it shouldn't be shadowed");else for(e=eg(d,function(a,b,c){if(!a.e()&&b&&null!=zg(b))return[Qf(zg(b))];var d=[];b&&(d=d.concat(La(Ag(b),function(a){return a.V})));r(c,function(a){d=d.concat(a)});return d}),d=0;d<e.length;++d)c=e[d],a.Cc.Od(th(c),uh(a,c));return b}
	function sh(a,b){var c=b.V,d=uh(a,c);return{ld:function(){return(b.w()||G).hash()},G:function(b){if("ok"===b){if(d){var f=c.path;if(b=kh(a,d)){var h=lh(b);b=h.path;h=h.Hb;f=T(b,f);f=new Cb(new og(!1,!0,h,!0),f);b=mh(a,b,f)}else b=[]}else b=fh(a,new Cb(pg,c.path));return b}f="Unknown Error";"too_big"===b?f="The data requested exceeds the maximum size that can be accessed with a single request.":"permission_denied"==b?f="Client doesn't have permission to access the desired data.":"unavailable"==b&&
	(f="The service is unavailable");f=Error(b+" at "+c.path.toString()+": "+f);f.code=b.toUpperCase();return a.kb(c,null,f)}}}function oh(a){return a.path.toString()+"$"+a.ja()}function lh(a){var b=a.indexOf("$");H(-1!==b&&b<a.length-1,"Bad queryKey.");return{Hb:a.substr(b+1),path:new L(a.substr(0,b))}}function kh(a,b){var c=a.Be,d="_"+b;return d in c?c[d]:void 0}function uh(a,b){var c=oh(b);return w(a.ic,c)}var ph=1;
	function mh(a,b,c){var d=a.wa.get(b);H(d,"Missing sync point for query tag that we're tracking");return d.eb(c,new Hg(b,a.jb),null)}function fh(a,b){return wh(a,b,a.wa,null,new Hg(C,a.jb))}function wh(a,b,c,d,e){if(b.path.e())return xh(a,b,c,d,e);var f=c.get(C);null==d&&null!=f&&(d=f.hb(C));var h=[],k=J(b.path),l=b.Mc(k);if((c=c.children.get(k))&&l)var m=d?d.Q(k):null,k=e.n(k),h=h.concat(wh(a,l,c,m,k));f&&(h=h.concat(f.eb(b,e,d)));return h}
	function xh(a,b,c,d,e){var f=c.get(C);null==d&&null!=f&&(d=f.hb(C));var h=[];c.children.ha(function(c,f){var m=d?d.Q(c):null,u=e.n(c),z=b.Mc(c);z&&(h=h.concat(xh(a,z,f,m,u)))});f&&(h=h.concat(f.eb(b,e,d)));return h};function Te(a,b,c){this.app=c;var d=new Eb(c);this.L=a;this.Va=$c(a);this.Vc=null;this.ca=new Nb;this.vd=1;this.Ra=null;if(b||0<=("object"===typeof window&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i))this.va=new Qc(this.L,q(this.Gb,this),d),setTimeout(q(this.Jc,this,!0),0);else{b=c.options.databaseAuthVariableOverride||null;if(null!==b){if("object"!==da(b))throw Error("Only objects are supported for option databaseAuthVariableOverride");
	try{B(b)}catch(e){throw Error("Invalid authOverride provided: "+e);}}this.va=this.Ra=new Pg(this.L,q(this.Gb,this),q(this.Jc,this),q(this.se,this),d,b)}var f=this;Fb(d,function(a){f.va.kf(a)});this.og=ad(a,q(function(){return new Xc(this.Va,this.va)},this));this.mc=new Jg;this.ge=new Gb;this.pd=new dh({ye:function(a,b,c,d){b=[];c=f.ge.j(a.path);c.e()||(b=fh(f.pd,new Ab(pg,a.path,c)),setTimeout(function(){d("ok")},0));return b},Od:ba});yh(this,"connected",!1);this.ia=new mc;this.Ya=new Se(this);this.fd=
	0;this.he=null;this.K=new dh({ye:function(a,b,c,d){f.va.$e(a,c,b,function(b,c){var e=d(b,c);Sb(f.ca,a.path,e)});return[]},Od:function(a,b){f.va.uf(a,b)}})}g=Te.prototype;g.toString=function(){return(this.L.Sc?"https://":"http://")+this.L.host};g.name=function(){return this.L.ne};function zh(a){a=a.ge.j(new L(".info/serverTimeOffset")).H()||0;return(new Date).getTime()+a}function Ah(a){a=a={timestamp:zh(a)};a.timestamp=a.timestamp||(new Date).getTime();return a}
	g.Gb=function(a,b,c,d){this.fd++;var e=new L(a);b=this.he?this.he(a,b):b;a=[];d?c?(b=pa(b,function(a){return M(a)}),a=nh(this.K,e,b,d)):(b=M(b),a=jh(this.K,e,b,d)):c?(d=pa(b,function(a){return M(a)}),a=ih(this.K,e,d)):(d=M(b),a=fh(this.K,new Ab(pg,e,d)));d=e;0<a.length&&(d=Bh(this,e));Sb(this.ca,d,a)};g.Jc=function(a){yh(this,"connected",a);!1===a&&Ch(this)};g.se=function(a){var b=this;Ic(a,function(a,d){yh(b,d,a)})};
	function yh(a,b,c){b=new L("/.info/"+b);c=M(c);var d=a.ge;d.Jd=d.Jd.F(b,c);c=fh(a.pd,new Ab(pg,b,c));Sb(a.ca,b,c)}g.Jb=function(a,b,c,d){this.f("set",{path:a.toString(),value:b,ug:c});var e=Ah(this);b=M(b,c);var e=pc(b,e),f=this.vd++,e=eh(this.K,a,e,f,!0);Ob(this.ca,e);var h=this;this.va.put(a.toString(),b.H(!0),function(b,c){var e="ok"===b;e||O("set at "+a+" failed: "+b);e=hh(h.K,f,!e);Sb(h.ca,a,e);Dh(d,b,c)});e=Eh(this,a);Bh(this,e);Sb(this.ca,e,[])};
	g.update=function(a,b,c){this.f("update",{path:a.toString(),value:b});var d=!0,e=Ah(this),f={};r(b,function(a,b){d=!1;var c=M(a);f[b]=pc(c,e)});if(d)E("update() called with empty data.  Don't do anything."),Dh(c,"ok");else{var h=this.vd++,k=gh(this.K,a,f,h);Ob(this.ca,k);var l=this;this.va.af(a.toString(),b,function(b,d){var e="ok"===b;e||O("update at "+a+" failed: "+b);var e=hh(l.K,h,!e),f=a;0<e.length&&(f=Bh(l,a));Sb(l.ca,f,e);Dh(c,b,d)});r(b,function(b,c){var d=Eh(l,a.n(c));Bh(l,d)});Sb(this.ca,
	a,[])}};function Ch(a){a.f("onDisconnectEvents");var b=Ah(a),c=[];nc(lc(a.ia,b),C,function(b,e){c=c.concat(fh(a.K,new Ab(pg,b,e)));var f=Eh(a,b);Bh(a,f)});a.ia=new mc;Sb(a.ca,C,c)}g.xd=function(a,b){var c=this;this.va.xd(a.toString(),function(d,e){"ok"===d&&Ze(c.ia,a);Dh(b,d,e)})};function nf(a,b,c,d){var e=M(c);a.va.pe(b.toString(),e.H(!0),function(c,h){"ok"===c&&oc(a.ia,b,e);Dh(d,c,h)})}
	function of(a,b,c,d,e){var f=M(c,d);a.va.pe(b.toString(),f.H(!0),function(c,d){"ok"===c&&oc(a.ia,b,f);Dh(e,c,d)})}function pf(a,b,c,d){var e=!0,f;for(f in c)e=!1;e?(E("onDisconnect().update() called with empty data.  Don't do anything."),Dh(d,"ok")):a.va.cf(b.toString(),c,function(e,f){if("ok"===e)for(var l in c){var m=M(c[l]);oc(a.ia,b.n(l),m)}Dh(d,e,f)})}function Zf(a,b,c){c=".info"===J(b.path)?a.pd.Nb(b,c):a.K.Nb(b,c);Qb(a.ca,b.path,c)}g.ab=function(){this.Ra&&this.Ra.ab("repo_interrupt")};
	g.kc=function(){this.Ra&&this.Ra.kc("repo_interrupt")};g.ze=function(a){if("undefined"!==typeof console){a?(this.Vc||(this.Vc=new Mb(this.Va)),a=this.Vc.get()):a=this.Va.get();var b=Ma(ua(a),function(a,b){return Math.max(b.length,a)},0),c;for(c in a){for(var d=a[c],e=c.length;e<b+2;e++)c+=" ";console.log(c+d)}}};g.Ae=function(a){Lb(this.Va,a);this.og.rf[a]=!0};g.f=function(a){var b="";this.Ra&&(b=this.Ra.id+":");E(b,arguments)};
	function Dh(a,b,c){a&&ub(function(){if("ok"==b)a(null);else{var d=(b||"error").toUpperCase(),e=d;c&&(e+=": "+c);e=Error(e);e.code=d;a(e)}})};function Fh(a,b,c,d,e){function f(){}a.f("transaction on "+b);var h=new U(a,b);h.gc("value",f);c={path:b,update:c,G:d,status:null,ef:rc(),Fe:e,of:0,Rd:function(){h.Ic("value",f)},Td:null,Ba:null,cd:null,dd:null,ed:null};d=a.K.Aa(b,void 0)||G;c.cd=d;d=c.update(d.H());if(n(d)){ef("transaction failed: Data returned ",d,c.path);c.status=1;e=Kg(a.mc,b);var k=e.Ca()||[];k.push(c);Lg(e,k);"object"===typeof d&&null!==d&&cb(d,".priority")?(k=w(d,".priority"),H(cf(k),"Invalid priority returned by transaction. Priority must be a valid string, finite number, server value, or null.")):
	k=(a.K.Aa(b)||G).C().H();e=Ah(a);d=M(d,k);e=pc(d,e);c.dd=d;c.ed=e;c.Ba=a.vd++;c=eh(a.K,b,e,c.Ba,c.Fe);Sb(a.ca,b,c);Gh(a)}else c.Rd(),c.dd=null,c.ed=null,c.G&&(a=new W(c.cd,new U(a,c.path),N),c.G(null,!1,a))}function Gh(a,b){var c=b||a.mc;b||Hh(a,c);if(null!==c.Ca()){var d=Ih(a,c);H(0<d.length,"Sending zero length transaction queue");Na(d,function(a){return 1===a.status})&&Jh(a,c.path(),d)}else c.kd()&&c.O(function(b){Gh(a,b)})}
	function Jh(a,b,c){for(var d=La(c,function(a){return a.Ba}),e=a.K.Aa(b,d)||G,d=e,e=e.hash(),f=0;f<c.length;f++){var h=c[f];H(1===h.status,"tryToSendTransactionQueue_: items in queue should all be run.");h.status=2;h.of++;var k=T(b,h.path),d=d.F(k,h.dd)}d=d.H(!0);a.va.put(b.toString(),d,function(d){a.f("transaction put response",{path:b.toString(),status:d});var e=[];if("ok"===d){d=[];for(f=0;f<c.length;f++){c[f].status=3;e=e.concat(hh(a.K,c[f].Ba));if(c[f].G){var h=c[f].ed,k=new U(a,c[f].path);d.push(q(c[f].G,
	null,null,!0,new W(h,k,N)))}c[f].Rd()}Hh(a,Kg(a.mc,b));Gh(a);Sb(a.ca,b,e);for(f=0;f<d.length;f++)ub(d[f])}else{if("datastale"===d)for(f=0;f<c.length;f++)c[f].status=4===c[f].status?5:1;else for(O("transaction at "+b.toString()+" failed: "+d),f=0;f<c.length;f++)c[f].status=5,c[f].Td=d;Bh(a,b)}},e)}function Bh(a,b){var c=Kh(a,b),d=c.path(),c=Ih(a,c);Lh(a,c,d);return d}
	function Lh(a,b,c){if(0!==b.length){for(var d=[],e=[],f=Ka(b,function(a){return 1===a.status}),f=La(f,function(a){return a.Ba}),h=0;h<b.length;h++){var k=b[h],l=T(c,k.path),m=!1,u;H(null!==l,"rerunTransactionsUnderNode_: relativePath should not be null.");if(5===k.status)m=!0,u=k.Td,e=e.concat(hh(a.K,k.Ba,!0));else if(1===k.status)if(25<=k.of)m=!0,u="maxretry",e=e.concat(hh(a.K,k.Ba,!0));else{var z=a.K.Aa(k.path,f)||G;k.cd=z;var F=b[h].update(z.H());n(F)?(ef("transaction failed: Data returned ",F,
	k.path),l=M(F),"object"===typeof F&&null!=F&&cb(F,".priority")||(l=l.fa(z.C())),z=k.Ba,F=Ah(a),F=pc(l,F),k.dd=l,k.ed=F,k.Ba=a.vd++,Qa(f,z),e=e.concat(eh(a.K,k.path,F,k.Ba,k.Fe)),e=e.concat(hh(a.K,z,!0))):(m=!0,u="nodata",e=e.concat(hh(a.K,k.Ba,!0)))}Sb(a.ca,c,e);e=[];m&&(b[h].status=3,setTimeout(b[h].Rd,Math.floor(0)),b[h].G&&("nodata"===u?(k=new U(a,b[h].path),d.push(q(b[h].G,null,null,!1,new W(b[h].cd,k,N)))):d.push(q(b[h].G,null,Error(u),!1,null))))}Hh(a,a.mc);for(h=0;h<d.length;h++)ub(d[h]);Gh(a)}}
	function Kh(a,b){for(var c,d=a.mc;null!==(c=J(b))&&null===d.Ca();)d=Kg(d,c),b=D(b);return d}function Ih(a,b){var c=[];Mh(a,b,c);c.sort(function(a,b){return a.ef-b.ef});return c}function Mh(a,b,c){var d=b.Ca();if(null!==d)for(var e=0;e<d.length;e++)c.push(d[e]);b.O(function(b){Mh(a,b,c)})}function Hh(a,b){var c=b.Ca();if(c){for(var d=0,e=0;e<c.length;e++)3!==c[e].status&&(c[d]=c[e],d++);c.length=d;Lg(b,0<c.length?c:null)}b.O(function(b){Hh(a,b)})}
	function Eh(a,b){var c=Kh(a,b).path(),d=Kg(a.mc,b);Og(d,function(b){Nh(a,b)});Nh(a,d);Ng(d,function(b){Nh(a,b)});return c}
	function Nh(a,b){var c=b.Ca();if(null!==c){for(var d=[],e=[],f=-1,h=0;h<c.length;h++)4!==c[h].status&&(2===c[h].status?(H(f===h-1,"All SENT items should be at beginning of queue."),f=h,c[h].status=4,c[h].Td="set"):(H(1===c[h].status,"Unexpected transaction status in abort"),c[h].Rd(),e=e.concat(hh(a.K,c[h].Ba,!0)),c[h].G&&d.push(q(c[h].G,null,Error("set"),!1,null))));-1===f?Lg(b,null):c.length=f+1;Sb(a.ca,b.path(),e);for(h=0;h<d.length;h++)ub(d[h])}};function Ye(){this.lb={};this.wf=!1}Ye.prototype.ab=function(){for(var a in this.lb)this.lb[a].ab()};Ye.prototype.kc=function(){for(var a in this.lb)this.lb[a].kc()};Ye.prototype.ae=function(a){this.wf=a};ca(Ye);Ye.prototype.interrupt=Ye.prototype.ab;Ye.prototype.resume=Ye.prototype.kc;var Z={};Z.nc=Pg;Z.DataConnection=Z.nc;Pg.prototype.ng=function(a,b){this.ua("q",{p:a},b)};Z.nc.prototype.simpleListen=Z.nc.prototype.ng;Pg.prototype.Hf=function(a,b){this.ua("echo",{d:a},b)};Z.nc.prototype.echo=Z.nc.prototype.Hf;Pg.prototype.interrupt=Pg.prototype.ab;Z.zf=Ce;Z.RealTimeConnection=Z.zf;Ce.prototype.sendRequest=Ce.prototype.ua;Ce.prototype.close=Ce.prototype.close;
	Z.Rf=function(a){var b=Pg.prototype.put;Pg.prototype.put=function(c,d,e,f){n(f)&&(f=a());b.call(this,c,d,e,f)};return function(){Pg.prototype.put=b}};Z.hijackHash=Z.Rf;Z.yf=Hb;Z.ConnectionTarget=Z.yf;Z.ja=function(a){return a.ja()};Z.queryIdentifier=Z.ja;Z.Uf=function(a){return a.u.Ra.$};Z.listens=Z.Uf;Z.ae=function(a){Ye.Vb().ae(a)};Z.forceRestClient=Z.ae;Z.Context=Ye;function U(a,b){if(!(a instanceof Te))throw Error("new Firebase() no longer supported - use app.database().");X.call(this,a,b,fe,!1);this.then=void 0;this["catch"]=void 0}la(U,X);g=U.prototype;g.getKey=function(){x("Firebase.key",0,0,arguments.length);return this.path.e()?null:Bd(this.path)};
	g.n=function(a){x("Firebase.child",1,1,arguments.length);if(ga(a))a=String(a);else if(!(a instanceof L))if(null===J(this.path)){var b=a;b&&(b=b.replace(/^\/*\.info(\/|$)/,"/"));lf("Firebase.child",b)}else lf("Firebase.child",a);return new U(this.u,this.path.n(a))};g.getParent=function(){x("Firebase.parent",0,0,arguments.length);var a=this.path.parent();return null===a?null:new U(this.u,a)};
	g.Of=function(){x("Firebase.ref",0,0,arguments.length);for(var a=this;null!==a.getParent();)a=a.getParent();return a};g.Gf=function(){return this.u.Ya};g.set=function(a,b){x("Firebase.set",1,2,arguments.length);mf("Firebase.set",this.path);df("Firebase.set",a,this.path,!1);A("Firebase.set",2,b,!0);var c=new hb;this.u.Jb(this.path,a,null,ib(c,b));return c.ra};
	g.update=function(a,b){x("Firebase.update",1,2,arguments.length);mf("Firebase.update",this.path);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;O("Passing an Array to Firebase.update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}gf("Firebase.update",a,this.path);A("Firebase.update",2,b,!0);c=new hb;this.u.update(this.path,a,ib(c,b));return c.ra};
	g.Jb=function(a,b,c){x("Firebase.setWithPriority",2,3,arguments.length);mf("Firebase.setWithPriority",this.path);df("Firebase.setWithPriority",a,this.path,!1);hf("Firebase.setWithPriority",2,b);A("Firebase.setWithPriority",3,c,!0);if(".length"===this.getKey()||".keys"===this.getKey())throw"Firebase.setWithPriority failed: "+this.getKey()+" is a read-only object.";var d=new hb;this.u.Jb(this.path,a,b,ib(d,c));return d.ra};
	g.remove=function(a){x("Firebase.remove",0,1,arguments.length);mf("Firebase.remove",this.path);A("Firebase.remove",1,a,!0);return this.set(null,a)};
	g.transaction=function(a,b,c){x("Firebase.transaction",1,3,arguments.length);mf("Firebase.transaction",this.path);A("Firebase.transaction",1,a,!1);A("Firebase.transaction",2,b,!0);if(n(c)&&"boolean"!=typeof c)throw Error(y("Firebase.transaction",3,!0)+"must be a boolean.");if(".length"===this.getKey()||".keys"===this.getKey())throw"Firebase.transaction failed: "+this.getKey()+" is a read-only object.";"undefined"===typeof c&&(c=!0);var d=new hb;ha(b)&&jb(d.ra);Fh(this.u,this.path,a,function(a,c,h){a?
	d.reject(a):d.resolve(new pb(c,h));ha(b)&&b(a,c,h)},c);return d.ra};g.kg=function(a,b){x("Firebase.setPriority",1,2,arguments.length);mf("Firebase.setPriority",this.path);hf("Firebase.setPriority",1,a);A("Firebase.setPriority",2,b,!0);var c=new hb;this.u.Jb(this.path.n(".priority"),a,null,ib(c,b));return c.ra};
	g.push=function(a,b){x("Firebase.push",0,2,arguments.length);mf("Firebase.push",this.path);df("Firebase.push",a,this.path,!0);A("Firebase.push",2,b,!0);var c=zh(this.u),d=uf(c),c=this.n(d);if(null!=a){var e=this,f=c.set(a,b).then(function(){return e.n(d)});c.then=q(f.then,f);c["catch"]=q(f.then,f,void 0);ha(b)&&jb(f)}return c};g.ib=function(){mf("Firebase.onDisconnect",this.path);return new V(this.u,this.path)};U.prototype.child=U.prototype.n;U.prototype.set=U.prototype.set;U.prototype.update=U.prototype.update;
	U.prototype.setWithPriority=U.prototype.Jb;U.prototype.remove=U.prototype.remove;U.prototype.transaction=U.prototype.transaction;U.prototype.setPriority=U.prototype.kg;U.prototype.push=U.prototype.push;U.prototype.onDisconnect=U.prototype.ib;Lc(U.prototype,"database",U.prototype.Gf);Lc(U.prototype,"key",U.prototype.getKey);Lc(U.prototype,"parent",U.prototype.getParent);Lc(U.prototype,"root",U.prototype.Of);if("undefined"===typeof firebase)throw Error("Cannot install Firebase Database - be sure to load firebase-app.js first.");
	try{firebase.INTERNAL.registerService("database",function(a){var b=Ye.Vb(),c=a.options.databaseURL;n(c)||Ac("Can't determine Firebase Database URL.  Be sure to include databaseURL option when calling firebase.intializeApp().");var d=Bc(c),c=d.jc;Xe("Invalid Firebase Database URL",d);d.path.e()||Ac("Database URL must point to the root of a Firebase Database (not including a child path).");(d=w(b.lb,a.name))&&Ac("FIREBASE INTERNAL ERROR: Database initialized multiple times.");d=new Te(c,b.wf,a);b.lb[a.name]=
	d;return d.Ya},{Reference:U,Query:X,Database:Se,enableLogging:xc,INTERNAL:Y,TEST_ACCESS:Z,ServerValue:Ve})}catch(Oh){Ac("Failed to register the Firebase Database Service ("+Oh+")")};})();
	
	}).call(global);
	module.exports = firebase.database;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var firebase = __webpack_require__(3);
	(function(){
	/*! @license Firebase v3.6.6
	    Build: 3.6.6-rc.3
	    Terms: https://firebase.google.com/terms/ */
	(function(){var k,l=this,m=function(a){return void 0!==a},aa=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&
	!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a.call)return"object";return b};var p=function(a,b){return-1!==a.indexOf(b)};var ba=function(a,b,c){function d(){z||(z=!0,b.apply(null,arguments))}function e(b){n=setTimeout(function(){n=null;a(f,2===C)},b)}function f(a,b){if(!z)if(a)d.apply(null,arguments);else if(2===C||B)d.apply(null,arguments);else{64>h&&(h*=2);var c;1===C?(C=2,c=0):c=1E3*(h+Math.random());e(c)}}function g(a){Ha||(Ha=!0,z||(null!==n?(a||(C=2),clearTimeout(n),e(0)):a||(C=1)))}var h=1,n=null,B=!1,C=0,z=!1,Ha=!1;e(0);setTimeout(function(){B=!0;g(!0)},c);return g};var q="https://firebasestorage.googleapis.com";var r=function(a,b){this.code="storage/"+a;this.message="Firebase Storage: "+b;this.serverResponse=null;this.name="FirebaseError"};(function(){var a=Error;function b(){}b.prototype=a.prototype;r.b=a.prototype;r.prototype=new b;r.a=function(b,d,e){for(var c=Array(arguments.length-2),g=2;g<arguments.length;g++)c[g-2]=arguments[g];return a.prototype[d].apply(b,c)}})();
	var ca=function(){return new r("unknown","An unknown error occurred, please check the error payload for server response.")},da=function(){return new r("canceled","User canceled the upload/download.")},ea=function(){return new r("cannot-slice-blob","Cannot slice blob for upload. Please retry the upload.")},fa=function(a,b,c){return new r("invalid-argument","Invalid argument in `"+b+"` at index "+a+": "+c)},ga=function(){return new r("app-deleted","The Firebase app was deleted.")},t=function(a,b){return new r("invalid-format",
	"String does not match format '"+a+"': "+b)},u=function(a){throw new r("internal-error","Internal error: "+a);};var v=function(a,b){for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&b(c,a[c])},ha=function(a){var b={};v(a,function(a,d){b[a]=d});return b};var ia=function(a,b){b=b.split("/").filter(function(a){return 0<a.length}).join("/");return 0===a.length?b:a+"/"+b},ja=function(a){var b=a.lastIndexOf("/",a.length-2);return-1===b?a:a.slice(b+1)};var ka=function(a){if("undefined"!==typeof firebase)return new firebase.Promise(a);throw Error("Error in Firebase Storage - be sure to load firebase-app.js first.");};var w=function(a,b,c,d){this.h=a;this.b={};this.method=b;this.headers={};this.body=null;this.j=c;this.l=this.a=null;this.c=[200];this.g=[];this.timeout=d;this.f=!0};var la={STATE_CHANGED:"state_changed"},x={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"},ma=function(a){switch(a){case "running":case "pausing":case "canceling":return"running";case "paused":return"paused";case "success":return"success";case "canceled":return"canceled";case "error":return"error";default:return"error"}};var y=function(a){return m(a)&&null!==a},na=function(a){return"string"===typeof a||a instanceof String},oa=function(){return"undefined"!==typeof Blob};var qa=function(a,b){var c=pa;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)};var ra=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")},sa=function(a,b){return a<b?-1:a>b?1:0};var A=function(a){return function(){var b=[];Array.prototype.push.apply(b,arguments);firebase.Promise.resolve(!0).then(function(){a.apply(null,b)})}};var D=function(a,b){this.bucket=a;this.path=b},ta=function(a){var b=encodeURIComponent;return"/b/"+b(a.bucket)+"/o/"+b(a.path)},ua=function(a){for(var b=null,c=[{K:/^gs:\/\/([A-Za-z0-9.\-]+)(\/(.*))?$/i,G:{bucket:1,path:3},J:function(a){"/"===a.path.charAt(a.path.length-1)&&(a.path=a.path.slice(0,-1))}},{K:/^https?:\/\/firebasestorage\.googleapis\.com\/v[A-Za-z0-9_]+\/b\/([A-Za-z0-9.\-]+)\/o(\/([^?#]*).*)?$/i,G:{bucket:1,path:3},J:function(a){a.path=decodeURIComponent(a.path)}}],d=0;d<c.length;d++){var e=
	c[d],f=e.K.exec(a);if(f){b=f[e.G.bucket];(f=f[e.G.path])||(f="");b=new D(b,f);e.J(b);break}}if(null==b)throw new r("invalid-url","Invalid URL '"+a+"'.");return b};var va=function(a,b,c){"function"==aa(a)||y(b)||y(c)?(this.c=a,this.a=b||null,this.b=c||null):(this.c=a.next||null,this.a=a.error||null,this.b=a.complete||null)};var E={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"},wa=function(a){switch(a){case "raw":case "base64":case "base64url":case "data_url":break;default:throw"Expected one of the event types: [raw, base64, base64url, data_url].";}},xa=function(a,b){this.b=a;this.a=b||null},Ba=function(a,b){switch(a){case "raw":return new xa(ya(b));case "base64":case "base64url":return new xa(za(a,b));case "data_url":a=new Aa(b);var c;if(a.a)c=za("base64",a.c);else{try{c=decodeURIComponent(a.c)}catch(d){throw t("data_url",
	"Malformed data URL.");}c=ya(c)}return new xa(c,(new Aa(b)).b)}throw ca();},ya=function(a){for(var b=[],c=0;c<a.length;c++){var d=a.charCodeAt(c);if(127>=d)b.push(d);else if(2047>=d)b.push(192|d>>6,128|d&63);else if(55296==(d&64512))if(c<a.length-1&&56320==(a.charCodeAt(c+1)&64512)){var e=a.charCodeAt(++c),d=65536|(d&1023)<<10|e&1023;b.push(240|d>>18,128|d>>12&63,128|d>>6&63,128|d&63)}else b.push(239,191,189);else 56320==(d&64512)?b.push(239,191,189):b.push(224|d>>12,128|d>>6&63,128|d&63)}return new Uint8Array(b)},
	za=function(a,b){switch(a){case "base64":var c=-1!==b.indexOf("-"),d=-1!==b.indexOf("_");if(c||d)throw t(a,"Invalid character '"+(c?"-":"_")+"' found: is it base64url encoded?");break;case "base64url":c=-1!==b.indexOf("+");d=-1!==b.indexOf("/");if(c||d)throw t(a,"Invalid character '"+(c?"+":"/")+"' found: is it base64 encoded?");b=b.replace(/-/g,"+").replace(/_/g,"/")}var e;try{e=atob(b)}catch(f){throw t(a,"Invalid character found");}a=new Uint8Array(e.length);for(b=0;b<e.length;b++)a[b]=e.charCodeAt(b);
	return a},Aa=function(a){var b=a.match(/^data:([^,]+)?,/);if(null===b)throw t("data_url","Must be formatted 'data:[<mediatype>][;base64],<data>");b=b[1]||null;this.a=!1;this.b=null;if(null!=b){var c=b.length-7;this.b=(this.a=0<=c&&b.indexOf(";base64",c)==c)?b.substring(0,b.length-7):b}this.c=a.substring(a.indexOf(",")+1)};var Ca=function(a){var b=encodeURIComponent,c="?";v(a,function(a,e){a=b(a)+"="+b(e);c=c+a+"&"});return c=c.slice(0,-1)};var Da=function(){var a=this;this.a=new XMLHttpRequest;this.c=0;this.f=ka(function(b){a.a.addEventListener("abort",function(){a.c=2;b(a)});a.a.addEventListener("error",function(){a.c=1;b(a)});a.a.addEventListener("load",function(){b(a)})});this.b=!1},Ea=function(a,b,c,d,e){if(a.b)throw u("cannot .send() more than once");a.b=!0;a.a.open(c,b,!0);y(e)&&v(e,function(b,c){a.a.setRequestHeader(b,c.toString())});y(d)?a.a.send(d):a.a.send();return a.f},Fa=function(a){if(!a.b)throw u("cannot .getErrorCode() before sending");
	return a.c},F=function(a){if(!a.b)throw u("cannot .getStatus() before sending");try{return a.a.status}catch(b){return-1}},Ga=function(a){if(!a.b)throw u("cannot .getResponseText() before sending");return a.a.responseText};Da.prototype.abort=function(){this.a.abort()};var G=function(a,b,c,d,e,f){this.b=a;this.h=b;this.f=c;this.a=d;this.g=e;this.c=f};k=G.prototype;k.V=function(){return this.b};k.qa=function(){return this.h};k.na=function(){return this.f};k.ia=function(){return this.a};k.W=function(){if(y(this.a)){var a=this.a.downloadURLs;return y(a)&&y(a[0])?a[0]:null}return null};k.pa=function(){return this.g};k.la=function(){return this.c};var H;a:{var Ia=l.navigator;if(Ia){var Ja=Ia.userAgent;if(Ja){H=Ja;break a}}H=""};var La=function(a,b,c,d,e,f,g,h,n,B,C){this.C=a;this.A=b;this.v=c;this.o=d;this.B=e.slice();this.m=f.slice();this.j=this.l=this.c=this.b=null;this.f=this.g=!1;this.s=g;this.h=h;this.D=C;this.w=n;var z=this;this.u=ka(function(a,b){z.l=a;z.j=b;Ka(z)})},Ma=function(a,b,c){this.b=a;this.c=b;this.a=!!c},Ka=function(a){function b(a,b){b?a(!1,new Ma(!1,null,!0)):(b=new Da,b.a.withCredentials=d.D,d.b=b,Ea(b,d.C,d.A,d.o,d.v).then(function(b){d.b=null;var c=0===Fa(b),e=F(b);if(!(c=!c))var c=p([408,429],e),
	f=p(d.m,e),c=500<=e&&600>e||c||f;c?(b=2===Fa(b),a(!1,new Ma(!1,null,b))):a(!0,new Ma(p(d.B,e),b))}))}function c(a,b){var c=d.l;a=d.j;var e=b.c;if(b.b)try{var f=d.s(e,Ga(e));m(f)?c(f):c()}catch(B){a(B)}else null!==e?(b=ca(),f=Ga(e),b.serverResponse=f,d.h?a(d.h(e,b)):a(b)):(b=b.a?d.f?ga():da():new r("retry-limit-exceeded","Max retry time for operation exceeded, please try again."),a(b))}var d=a;a.g?c(0,new Ma(!1,null,!0)):a.c=ba(b,c,a.w)};La.prototype.a=function(){return this.u};
	La.prototype.cancel=function(a){this.g=!0;this.f=a||!1;null!==this.c&&(0,this.c)(!1);null!==this.b&&this.b.abort()};var Na=function(a,b,c){var d=Ca(a.b),d=a.h+d,e=a.headers?ha(a.headers):{};null!==b&&0<b.length&&(e.Authorization="Firebase "+b);e["X-Firebase-Storage-Version"]="webjs/"+("undefined"!==typeof firebase?firebase.SDK_VERSION:"AppManager");return new La(d,a.method,e,a.body,a.c,a.g,a.j,a.a,a.timeout,0,c)};var Oa=function(){};var Pa=function(a){this.b=firebase.Promise.reject(a)};Pa.prototype.a=function(){return this.b};Pa.prototype.cancel=function(){};var Qa=function(){this.a={};this.b=Number.MIN_SAFE_INTEGER},Ra=function(a,b){function c(){delete e.a[d]}var d=a.b;a.b++;a.a[d]=b;var e=a;b.a().then(c,c)},Sa=function(a){v(a.a,function(a,c){c&&c.cancel(!0)});a.a={}};var Ta=function(a,b,c,d,e){this.a=a;this.g=null;if(null!==this.a&&(a=this.a.options,y(a))){a=a.storageBucket||null;if(null==a)a=null;else{var f=null;try{f=ua(a)}catch(g){}if(null!==f){if(""!==f.path)throw new r("invalid-default-bucket","Invalid default bucket '"+a+"'.");a=f.bucket}}this.g=a}this.o=b;this.m=c;this.j=e;this.l=d;this.c=12E4;this.b=6E4;this.h=new Qa;this.f=!1},Ua=function(a){return null!==a.a&&y(a.a.INTERNAL)&&y(a.a.INTERNAL.getToken)?a.a.INTERNAL.getToken().then(function(a){return y(a)?
	a.accessToken:null},function(){return null}):firebase.Promise.resolve(null)};Ta.prototype.bucket=function(){if(this.f)throw ga();return this.g};var I=function(a,b,c){if(a.f)return new Pa(ga());b=a.m(b,c,null===a.a,a.j);Ra(a.h,b);return b};var Va=-1!=H.indexOf("Opera"),Wa=-1!=H.indexOf("Trident")||-1!=H.indexOf("MSIE"),Xa=-1!=H.indexOf("Edge"),Ya=-1!=H.indexOf("Gecko")&&!(-1!=H.toLowerCase().indexOf("webkit")&&-1==H.indexOf("Edge"))&&!(-1!=H.indexOf("Trident")||-1!=H.indexOf("MSIE"))&&-1==H.indexOf("Edge"),Za=-1!=H.toLowerCase().indexOf("webkit")&&-1==H.indexOf("Edge"),$a;
	a:{var ab="",bb=function(){var a=H;if(Ya)return/rv\:([^\);]+)(\)|;)/.exec(a);if(Xa)return/Edge\/([\d\.]+)/.exec(a);if(Wa)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(Za)return/WebKit\/(\S+)/.exec(a);if(Va)return/(?:Version)[ \/]?(\S+)/.exec(a)}();bb&&(ab=bb?bb[1]:"");if(Wa){var cb,db=l.document;cb=db?db.documentMode:void 0;if(null!=cb&&cb>parseFloat(ab)){$a=String(cb);break a}}$a=ab}
	var eb=$a,pa={},fb=function(a){return qa(a,function(){for(var b=0,c=ra(String(eb)).split("."),d=ra(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",h=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];h=/(\d*)(\D*)(.*)/.exec(h)||["","","",""];if(0==g[0].length&&0==h[0].length)break;b=sa(0==g[1].length?0:parseInt(g[1],10),0==h[1].length?0:parseInt(h[1],10))||sa(0==g[2].length,0==h[2].length)||sa(g[2],h[2]);g=g[3];h=h[3]}while(0==b)}return 0<=b})};var gb=function(a){var b=l.BlobBuilder||l.WebKitBlobBuilder;if(m(b)){for(var b=new b,c=0;c<arguments.length;c++)b.append(arguments[c]);return b.getBlob()}b=Array.prototype.slice.call(arguments);c=l.BlobBuilder||l.WebKitBlobBuilder;if(m(c)){for(var c=new c,d=0;d<b.length;d++)c.append(b[d],void 0);b=c.getBlob(void 0)}else if(m(l.Blob))b=new Blob(b,{});else throw Error("This browser doesn't seem to support creating Blobs");return b},hb=function(a,b,c){m(c)||(c=a.size);return a.webkitSlice?a.webkitSlice(b,
	c):a.mozSlice?a.mozSlice(b,c):a.slice?Ya&&!fb("13.0")||Za&&!fb("537.1")?(0>b&&(b+=a.size),0>b&&(b=0),0>c&&(c+=a.size),c<b&&(c=b),a.slice(b,c-b)):a.slice(b,c):null};var ib=function(a,b){return b},J=function(a,b,c,d){this.c=a;this.b=b||a;this.writable=!!c;this.a=d||ib},jb=null,kb=function(){if(jb)return jb;var a=[];a.push(new J("bucket"));a.push(new J("generation"));a.push(new J("metageneration"));a.push(new J("name","fullPath",!0));var b=new J("name");b.a=function(a,b){return!na(b)||2>b.length?b:ja(b)};a.push(b);b=new J("size");b.a=function(a,b){return y(b)?+b:b};a.push(b);a.push(new J("timeCreated"));a.push(new J("updated"));a.push(new J("md5Hash",null,!0));
	a.push(new J("cacheControl",null,!0));a.push(new J("contentDisposition",null,!0));a.push(new J("contentEncoding",null,!0));a.push(new J("contentLanguage",null,!0));a.push(new J("contentType",null,!0));a.push(new J("metadata","customMetadata",!0));a.push(new J("downloadTokens","downloadURLs",!1,function(a,b){if(!(na(b)&&0<b.length))return[];var c=encodeURIComponent;return b.split(",").map(function(b){var d=a.fullPath,d="https://firebasestorage.googleapis.com/v0"+("/b/"+c(a.bucket)+"/o/"+c(d));b=Ca({alt:"media",
	token:b});return d+b})}));return jb=a},lb=function(a,b){Object.defineProperty(a,"ref",{get:function(){return b.o(b,new D(a.bucket,a.fullPath))}})},mb=function(a,b){for(var c={},d=b.length,e=0;e<d;e++){var f=b[e];f.writable&&(c[f.c]=a[f.b])}return JSON.stringify(c)},nb=function(a){if(!a||"object"!==typeof a)throw"Expected Metadata object.";for(var b in a){var c=a[b];if("customMetadata"===b){if("object"!==typeof c)throw"Expected object for 'customMetadata' mapping.";}else if(null!=c&&"object"===typeof c)throw"Mapping for '"+
	b+"' cannot be an object.";}};var K=function(a,b,c){for(var d=b.length,e=b.length,f=0;f<b.length;f++)if(b[f].b){d=f;break}if(!(d<=c.length&&c.length<=e))throw d===e?(b=d,d=1===d?"argument":"arguments"):(b="between "+d+" and "+e,d="arguments"),new r("invalid-argument-count","Invalid argument count in `"+a+"`: Expected "+b+" "+d+", received "+c.length+".");for(f=0;f<c.length;f++)try{b[f].a(c[f])}catch(g){if(g instanceof Error)throw fa(f,a,g.message);throw fa(f,a,g);}},L=function(a,b){var c=this;this.a=function(b){c.b&&!m(b)||a(b)};
	this.b=!!b},ob=function(a,b){return function(c){a(c);b(c)}},M=function(a,b){function c(a){if(!("string"===typeof a||a instanceof String))throw"Expected string.";}var d;a?d=ob(c,a):d=c;return new L(d,b)},pb=function(){return new L(function(a){if(!(a instanceof Uint8Array||a instanceof ArrayBuffer||oa()&&a instanceof Blob))throw"Expected Blob or File.";})},qb=function(){return new L(function(a){if(!(("number"===typeof a||a instanceof Number)&&0<=a))throw"Expected a number 0 or greater.";})},rb=function(a,
	b){return new L(function(b){if(!(null===b||y(b)&&b instanceof Object))throw"Expected an Object.";y(a)&&a(b)},b)},N=function(){return new L(function(a){if(null!==a&&"function"!=aa(a))throw"Expected a Function.";},!0)};var O=function(a,b){oa()&&a instanceof Blob?(this.i=a,b=a.size,a=a.type):(a instanceof ArrayBuffer?(b?this.i=new Uint8Array(a):(this.i=new Uint8Array(a.byteLength),this.i.set(new Uint8Array(a))),b=this.i.length):(b?this.i=a:(this.i=new Uint8Array(a.length),this.i.set(a)),b=a.length),a="");this.a=b;this.b=a};O.prototype.type=function(){return this.b};
	O.prototype.slice=function(a,b){if(oa()&&this.i instanceof Blob)return a=hb(this.i,a,b),null===a?null:new O(a);a=new Uint8Array(this.i.buffer,a,b-a);return new O(a,!0)};
	var sb=function(a){var b=[];Array.prototype.push.apply(b,arguments);if(oa())return b=b.map(function(a){return a instanceof O?a.i:a}),new O(gb.apply(null,b));var b=b.map(function(a){return na(a)?Ba("raw",a).b.buffer:a.i.buffer}),c=0;b.forEach(function(a){c+=a.byteLength});var d=new Uint8Array(c),e=0;b.forEach(function(a){a=new Uint8Array(a);for(var b=0;b<a.length;b++)d[e++]=a[b]});return new O(d,!0)};var P=function(a){if(!a)throw ca();},tb=function(a,b){return function(c,d){var e;a:{try{e=JSON.parse(d)}catch(h){e=null;break a}c=typeof e;e="object"==c&&null!=e||"function"==c?e:null}if(null===e)e=null;else{c={type:"file"};d=b.length;for(var f=0;f<d;f++){var g=b[f];c[g.b]=g.a(c,e[g.c])}lb(c,a);e=c}P(null!==e);return e}},Q=function(a){return function(b,c){b=401===F(b)?new r("unauthenticated","User is not authenticated, please authenticate using Firebase Authentication and try again."):402===F(b)?
	new r("quota-exceeded","Quota for bucket '"+a.bucket+"' exceeded, please view quota on https://firebase.google.com/pricing/."):403===F(b)?new r("unauthorized","User does not have permission to access '"+a.path+"'."):c;b.serverResponse=c.serverResponse;return b}},ub=function(a){var b=Q(a);return function(c,d){var e=b(c,d);404===F(c)&&(e=new r("object-not-found","Object '"+a.path+"' does not exist."));e.serverResponse=d.serverResponse;return e}},vb=function(a,b,c){var d=ta(b);a=new w(q+"/v0"+d,"GET",
	tb(a,c),a.c);a.a=ub(b);return a},wb=function(a,b){var c=ta(b);a=new w(q+"/v0"+c,"DELETE",function(){},a.c);a.c=[200,204];a.a=ub(b);return a},xb=function(a,b,c){c=c?ha(c):{};c.fullPath=a.path;c.size=b.a;c.contentType||(a=b&&b.type()||"application/octet-stream",c.contentType=a);return c},yb=function(a,b,c,d,e){var f="/b/"+encodeURIComponent(b.bucket)+"/o",g={"X-Goog-Upload-Protocol":"multipart"},h;h="";for(var n=0;2>n;n++)h+=Math.random().toString().slice(2);g["Content-Type"]="multipart/related; boundary="+
	h;e=xb(b,d,e);n=mb(e,c);d=sb("--"+h+"\r\nContent-Type: application/json; charset=utf-8\r\n\r\n"+n+"\r\n--"+h+"\r\nContent-Type: "+e.contentType+"\r\n\r\n",d,"\r\n--"+h+"--");if(null===d)throw ea();a=new w(q+"/v0"+f,"POST",tb(a,c),a.b);a.b={name:e.fullPath};a.headers=g;a.body=d.i;a.a=Q(b);return a},zb=function(a,b,c,d){this.a=a;this.b=b;this.c=!!c;this.f=d||null},Ab=function(a,b){var c;try{c=a.a.getResponseHeader("X-Goog-Upload-Status")}catch(d){P(!1)}P(p(b||["active"],c));return c},Bb=function(a,
	b,c,d,e){var f="/b/"+encodeURIComponent(b.bucket)+"/o",g=xb(b,d,e);e={name:g.fullPath};f=q+"/v0"+f;d={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":d.a,"X-Goog-Upload-Header-Content-Type":g.contentType,"Content-Type":"application/json; charset=utf-8"};c=mb(g,c);a=new w(f,"POST",function(a){Ab(a);var b;try{b=a.a.getResponseHeader("X-Goog-Upload-URL")}catch(B){P(!1)}P(na(b));return b},a.b);a.b=e;a.headers=d;a.body=c;a.a=Q(b);return a},Cb=
	function(a,b,c,d){a=new w(c,"POST",function(a){var b=Ab(a,["active","final"]),c;try{c=a.a.getResponseHeader("X-Goog-Upload-Size-Received")}catch(h){P(!1)}a=c;isFinite(a)&&(a=String(a));a="string"==typeof a?/^\s*-?0x/i.test(a)?parseInt(a,16):parseInt(a,10):NaN;P(!isNaN(a));return new zb(a,d.a,"final"===b)},a.b);a.headers={"X-Goog-Upload-Command":"query"};a.a=Q(b);a.f=!1;return a},Db=function(a,b,c,d,e,f,g){var h=new zb(0,0);g?(h.a=g.a,h.b=g.b):(h.a=0,h.b=d.a);if(d.a!==h.b)throw new r("server-file-wrong-size",
	"Server recorded incorrect upload file size, please retry the upload.");var n=g=h.b-h.a;0<e&&(n=Math.min(n,e));var B=h.a;e={"X-Goog-Upload-Command":n===g?"upload, finalize":"upload","X-Goog-Upload-Offset":h.a};g=d.slice(B,B+n);if(null===g)throw ea();c=new w(c,"POST",function(a,c){var e=Ab(a,["active","final"]),g=h.a+n,C=d.a,z;"final"===e?z=tb(b,f)(a,c):z=null;return new zb(g,C,"final"===e,z)},b.b);c.headers=e;c.body=g.i;c.l=null;c.a=Q(a);c.f=!1;return c};var T=function(a,b,c,d,e,f){this.L=a;this.c=b;this.l=c;this.f=e;this.h=f||null;this.s=d;this.m=0;this.D=this.u=!1;this.B=[];this.S=262144<this.f.a;this.b="running";this.a=this.v=this.g=null;this.j=1;var g=this;this.F=function(a){g.a=null;g.j=1;"storage/canceled"===a.code?(g.u=!0,R(g)):(g.g=a,S(g,"error"))};this.P=function(a){g.a=null;"storage/canceled"===a.code?R(g):(g.g=a,S(g,"error"))};this.A=this.o=null;this.C=ka(function(a,b){g.o=a;g.A=b;Eb(g)});this.C.then(null,function(){})},Eb=function(a){"running"===
	a.b&&null===a.a&&(a.S?null===a.v?Fb(a):a.u?Gb(a):a.D?Hb(a):Ib(a):Jb(a))},U=function(a,b){Ua(a.c).then(function(c){switch(a.b){case "running":b(c);break;case "canceling":S(a,"canceled");break;case "pausing":S(a,"paused")}})},Fb=function(a){U(a,function(b){var c=Bb(a.c,a.l,a.s,a.f,a.h);a.a=I(a.c,c,b);a.a.a().then(function(b){a.a=null;a.v=b;a.u=!1;R(a)},this.F)})},Gb=function(a){var b=a.v;U(a,function(c){var d=Cb(a.c,a.l,b,a.f);a.a=I(a.c,d,c);a.a.a().then(function(b){a.a=null;Kb(a,b.a);a.u=!1;b.c&&(a.D=
	!0);R(a)},a.F)})},Ib=function(a){var b=262144*a.j,c=new zb(a.m,a.f.a),d=a.v;U(a,function(e){var f;try{f=Db(a.l,a.c,d,a.f,b,a.s,c)}catch(g){a.g=g;S(a,"error");return}a.a=I(a.c,f,e);a.a.a().then(function(b){33554432>262144*a.j&&(a.j*=2);a.a=null;Kb(a,b.a);b.c?(a.h=b.f,S(a,"success")):R(a)},a.F)})},Hb=function(a){U(a,function(b){var c=vb(a.c,a.l,a.s);a.a=I(a.c,c,b);a.a.a().then(function(b){a.a=null;a.h=b;S(a,"success")},a.P)})},Jb=function(a){U(a,function(b){var c=yb(a.c,a.l,a.s,a.f,a.h);a.a=I(a.c,c,
	b);a.a.a().then(function(b){a.a=null;a.h=b;Kb(a,a.f.a);S(a,"success")},a.F)})},Kb=function(a,b){var c=a.m;a.m=b;a.m>c&&V(a)},S=function(a,b){if(a.b!==b)switch(b){case "canceling":a.b=b;null!==a.a&&a.a.cancel();break;case "pausing":a.b=b;null!==a.a&&a.a.cancel();break;case "running":var c="paused"===a.b;a.b=b;c&&(V(a),Eb(a));break;case "paused":a.b=b;V(a);break;case "canceled":a.g=da();a.b=b;V(a);break;case "error":a.b=b;V(a);break;case "success":a.b=b,V(a)}},R=function(a){switch(a.b){case "pausing":S(a,
	"paused");break;case "canceling":S(a,"canceled");break;case "running":Eb(a)}};T.prototype.w=function(){return new G(this.m,this.f.a,ma(this.b),this.h,this,this.L)};
	T.prototype.M=function(a,b,c,d){function e(a){try{g(a);return}catch(z){}try{if(h(a),!(m(a.next)||m(a.error)||m(a.complete)))throw"";}catch(z){throw"Expected a function or an Object with one of `next`, `error`, `complete` properties.";}}function f(a){return function(b,c,d){null!==a&&K("on",a,arguments);var e=new va(b,c,d);Lb(n,e);return function(){var a=n.B,b=a.indexOf(e);-1!==b&&a.splice(b,1)}}}var g=N().a,h=rb(null,!0).a;K("on",[M(function(){if("state_changed"!==a)throw"Expected one of the event types: [state_changed].";
	}),rb(e,!0),N(),N()],arguments);var n=this,B=[rb(function(a){if(null===a)throw"Expected a function or an Object with one of `next`, `error`, `complete` properties.";e(a)}),N(),N()];return m(b)||m(c)||m(d)?f(null)(b,c,d):f(B)};T.prototype.then=function(a,b){return this.C.then(a,b)};
	var Lb=function(a,b){a.B.push(b);Mb(a,b)},V=function(a){Nb(a);Array.prototype.slice.call(a.B).forEach(function(b){Mb(a,b)})},Nb=function(a){if(null!==a.o){var b=!0;switch(ma(a.b)){case "success":A(a.o.bind(null,a.w()))();break;case "canceled":case "error":A(a.A.bind(null,a.g))();break;default:b=!1}b&&(a.o=null,a.A=null)}},Mb=function(a,b){switch(ma(a.b)){case "running":case "paused":null!==b.c&&A(b.c.bind(b,a.w()))();break;case "success":null!==b.b&&A(b.b.bind(b))();break;case "canceled":case "error":null!==
	b.a&&A(b.a.bind(b,a.g))();break;default:null!==b.a&&A(b.a.bind(b,a.g))()}};T.prototype.O=function(){K("resume",[],arguments);var a="paused"===this.b||"pausing"===this.b;a&&S(this,"running");return a};T.prototype.N=function(){K("pause",[],arguments);var a="running"===this.b;a&&S(this,"pausing");return a};T.prototype.cancel=function(){K("cancel",[],arguments);var a="running"===this.b||"pausing"===this.b;a&&S(this,"canceling");return a};var W=function(a,b){this.b=a;if(b)this.a=b instanceof D?b:ua(b);else if(a=a.bucket(),null!==a)this.a=new D(a,"");else throw new r("no-default-bucket","No default bucket found. Did you set the 'storageBucket' property when initializing the app?");};W.prototype.toString=function(){K("toString",[],arguments);return"gs://"+this.a.bucket+"/"+this.a.path};var Ob=function(a,b){return new W(a,b)};k=W.prototype;
	k.H=function(a){K("child",[M()],arguments);var b=ia(this.a.path,a);return Ob(this.b,new D(this.a.bucket,b))};k.ka=function(){var a;a=this.a.path;if(0==a.length)a=null;else{var b=a.lastIndexOf("/");a=-1===b?"":a.slice(0,b)}return null===a?null:Ob(this.b,new D(this.a.bucket,a))};k.ma=function(){return Ob(this.b,new D(this.a.bucket,""))};k.U=function(){return this.a.bucket};k.fa=function(){return this.a.path};k.ja=function(){return ja(this.a.path)};k.oa=function(){return this.b.l};
	k.Z=function(a,b){K("put",[pb(),new L(nb,!0)],arguments);X(this,"put");return new T(this,this.b,this.a,kb(),new O(a),b)};k.$=function(a,b,c){K("putString",[M(),M(wa,!0),new L(nb,!0)],arguments);X(this,"putString");var d=Ba(y(b)?b:"raw",a),e=c?ha(c):{};!y(e.contentType)&&y(d.a)&&(e.contentType=d.a);return new T(this,this.b,this.a,kb(),new O(d.b,!0),e)};k.X=function(){K("delete",[],arguments);X(this,"delete");var a=this;return Ua(this.b).then(function(b){var c=wb(a.b,a.a);return I(a.b,c,b).a()})};
	k.I=function(){K("getMetadata",[],arguments);X(this,"getMetadata");var a=this;return Ua(this.b).then(function(b){var c=vb(a.b,a.a,kb());return I(a.b,c,b).a()})};k.aa=function(a){K("updateMetadata",[new L(nb,void 0)],arguments);X(this,"updateMetadata");var b=this;return Ua(this.b).then(function(c){var d=b.b,e=b.a,f=a,g=kb(),h=ta(e),h=q+"/v0"+h,f=mb(f,g),d=new w(h,"PATCH",tb(d,g),d.c);d.headers={"Content-Type":"application/json; charset=utf-8"};d.body=f;d.a=ub(e);return I(b.b,d,c).a()})};
	k.Y=function(){K("getDownloadURL",[],arguments);X(this,"getDownloadURL");return this.I().then(function(a){a=a.downloadURLs[0];if(y(a))return a;throw new r("no-download-url","The given file does not have any download URLs.");})};var X=function(a,b){if(""===a.a.path)throw new r("invalid-root-operation","The operation '"+b+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').");};var Y=function(a,b){this.a=new Ta(a,function(a,b){return new W(a,b)},Na,this,y(b)?b:new Oa);this.b=a;this.c=new Pb(this)};k=Y.prototype;k.ba=function(a){K("ref",[M(function(a){if(/^[A-Za-z]+:\/\//.test(a))throw"Expected child path but got a URL, use refFromURL instead.";},!0)],arguments);var b=new W(this.a);return m(a)?b.H(a):b};
	k.ca=function(a){K("refFromURL",[M(function(a){if(!/^[A-Za-z]+:\/\//.test(a))throw"Expected full URL but got a child path, use ref instead.";try{ua(a)}catch(c){throw"Expected valid full URL but got an invalid one.";}},!1)],arguments);return new W(this.a,a)};k.ha=function(){return this.a.b};k.ea=function(a){K("setMaxUploadRetryTime",[qb()],arguments);this.a.b=a};k.ga=function(){return this.a.c};k.da=function(a){K("setMaxOperationRetryTime",[qb()],arguments);this.a.c=a};k.T=function(){return this.b};
	k.R=function(){return this.c};var Pb=function(a){this.a=a};Pb.prototype.b=function(){var a=this.a.a;a.f=!0;a.a=null;Sa(a.h)};var Z=function(a,b,c){Object.defineProperty(a,b,{get:c})};W.prototype.toString=W.prototype.toString;W.prototype.child=W.prototype.H;W.prototype.put=W.prototype.Z;W.prototype.putString=W.prototype.$;W.prototype["delete"]=W.prototype.X;W.prototype.getMetadata=W.prototype.I;W.prototype.updateMetadata=W.prototype.aa;W.prototype.getDownloadURL=W.prototype.Y;Z(W.prototype,"parent",W.prototype.ka);Z(W.prototype,"root",W.prototype.ma);Z(W.prototype,"bucket",W.prototype.U);Z(W.prototype,"fullPath",W.prototype.fa);
	Z(W.prototype,"name",W.prototype.ja);Z(W.prototype,"storage",W.prototype.oa);Y.prototype.ref=Y.prototype.ba;Y.prototype.refFromURL=Y.prototype.ca;Z(Y.prototype,"maxOperationRetryTime",Y.prototype.ga);Y.prototype.setMaxOperationRetryTime=Y.prototype.da;Z(Y.prototype,"maxUploadRetryTime",Y.prototype.ha);Y.prototype.setMaxUploadRetryTime=Y.prototype.ea;Z(Y.prototype,"app",Y.prototype.T);Z(Y.prototype,"INTERNAL",Y.prototype.R);Pb.prototype["delete"]=Pb.prototype.b;Y.prototype.capi_=function(a){q=a};
	T.prototype.on=T.prototype.M;T.prototype.resume=T.prototype.O;T.prototype.pause=T.prototype.N;T.prototype.cancel=T.prototype.cancel;Z(T.prototype,"snapshot",T.prototype.w);Z(G.prototype,"bytesTransferred",G.prototype.V);Z(G.prototype,"totalBytes",G.prototype.qa);Z(G.prototype,"state",G.prototype.na);Z(G.prototype,"metadata",G.prototype.ia);Z(G.prototype,"downloadURL",G.prototype.W);Z(G.prototype,"task",G.prototype.pa);Z(G.prototype,"ref",G.prototype.la);la.STATE_CHANGED="state_changed";
	x.RUNNING="running";x.PAUSED="paused";x.SUCCESS="success";x.CANCELED="canceled";x.ERROR="error";E.RAW="raw";E.BASE64="base64";E.BASE64URL="base64url";E.DATA_URL="data_url";(function(){function a(a){return new Y(a)}var b={TaskState:x,TaskEvent:la,StringFormat:E,Storage:Y,Reference:W};if("undefined"!==typeof firebase)firebase.INTERNAL.registerService("storage",a,b);else throw Error("Cannot install Firebase Storage - be sure to load firebase-app.js first.");})();}).call(this);
	}).call(global);
	module.exports = firebase.storage;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var firebase = __webpack_require__(3);
	(function(){
	/*! @license Firebase v3.6.6
	    Build: 3.6.6-rc.3
	    Terms: https://firebase.google.com/terms/ */
	(function(){var f=function(a,b){function c(){}c.prototype=b.prototype;a.prototype=new c;for(var d in b)if(Object.defineProperties){var e=Object.getOwnPropertyDescriptor(b,d);e&&Object.defineProperty(a,d,e)}else a[d]=b[d]},g=this,h=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=
	typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a.call)return"object";return b},k=function(a,b){function c(){}c.prototype=b.prototype;a.B=b.prototype;a.prototype=new c;a.u=function(a,c,n){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];
	return b.prototype[c].apply(a,d)}};var m={},p=(m["only-available-in-window"]="This method is available in a Window context.",m["only-available-in-sw"]="This method is available in a service worker context.",m["should-be-overriden"]="This method should be overriden by extended classes.",m["bad-sender-id"]="Please ensure that 'messagingSenderId' is set correctly in the options passed into firebase.initializeApp().",m["permission-default"]="The required permissions were not granted and dismissed instead.",m["permission-blocked"]="The required permissions were not granted and blocked instead.",
	m["unsupported-browser"]="This browser doesn't support the API's required to use the firebase SDK.",m["notifications-blocked"]="Notifications have been blocked.",m["failed-serviceworker-registration"]="We are unable to register the default service worker. {$browserErrorMessage}",m["sw-registration-expected"]="A service worker registration was the expected input.",m["get-subscription-failed"]="There was an error when trying to get any existing Push Subscriptions.",m["invalid-saved-token"]="Unable to access details of the saved token.",
	m["sw-reg-redundant"]="The service worker being used for push was made redundant.",m["token-subscribe-failed"]="A problem occured while subscribing the user to FCM: {$message}",m["token-subscribe-no-token"]="FCM returned no token when subscribing the user to push.",m["token-subscribe-no-push-set"]="FCM returned an invalid response when getting an FCM token.",m["use-sw-before-get-token"]="You must call useServiceWorker() before calling getToken() to ensure your service worker is used.",m["invalid-delete-token"]=
	"You must pass a valid token into deleteToken(), i.e. the token from getToken().",m["delete-token-not-found"]="The deletion attempt for token could not be performed as the token was not found.",m["bg-handler-function-expected"]="The input to setBackgroundMessageHandler() must be a function.",m["no-window-client-to-msg"]="An attempt was made to message a non-existant window client.",m["unable-to-resubscribe"]="There was an error while re-subscribing the FCM token for push messaging. Will have to resubscribe the user on next visit. {$message}",
	m["no-fcm-token-for-resubscribe"]="Could not find an FCM token and as a result, unable to resubscribe. Will have to resubscribe the user on next visit.",m["failed-to-delete-token"]="Unable to delete the currently saved token.",m["no-sw-in-reg"]="Even though the service worker registration was successful, there was a problem accessing the service worker itself.",m["incorrect-gcm-sender-id"]="Please change your web app manifest's 'gcm_sender_id' value to '103953800507' to use Firebase messaging.",m);var q={userVisibleOnly:!0,applicationServerKey:new Uint8Array([4,51,148,247,223,161,235,177,220,3,162,94,21,113,219,72,211,46,237,237,178,52,219,183,71,58,12,143,196,204,225,111,60,140,132,223,171,182,102,62,242,12,212,139,254,227,249,118,47,20,28,99,8,106,111,45,177,26,149,176,206,55,192,156,110])};var r=function(a,b){var c={};return c["firebase-messaging-msg-type"]=a,c["firebase-messaging-msg-data"]=b,c};var u=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,u);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))};k(u,Error);var v=function(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")};var w=function(a,b){b.unshift(a);u.call(this,v.apply(null,b));b.shift()};k(w,u);var x=function(a,b,c){if(!a){var d="Assertion failed";if(b)var d=d+(": "+b),e=Array.prototype.slice.call(arguments,2);throw new w(""+d,e||[]);}};var y=null;var A=function(a){a=new Uint8Array(a);var b=h(a);x("array"==b||"object"==b&&"number"==typeof a.length,"encodeByteArray takes an array as a parameter");if(!y)for(y={},b=0;65>b;b++)y[b]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(b);for(var b=y,c=[],d=0;d<a.length;d+=3){var e=a[d],n=d+1<a.length,l=n?a[d+1]:0,z=d+2<a.length,t=z?a[d+2]:0,M=e>>2,e=(e&3)<<4|l>>4,l=(l&15)<<2|t>>6,t=t&63;z||(t=64,n||(l=64));c.push(b[M],b[e],b[l],b[t])}return c.join("").replace(/\+/g,"-").replace(/\//g,
	"_").replace(/=+$/,"")};var B=new firebase.INTERNAL.ErrorFactory("messaging","Messaging",p),C=function(){this.a=null},D=function(a){if(a.a)return a.a;a.a=new Promise(function(a,c){var b=g.indexedDB.open("fcm_token_details_db",1);b.onerror=function(a){c(a.target.error)};b.onsuccess=function(b){a(b.target.result)};b.onupgradeneeded=function(a){a=a.target.result.createObjectStore("fcm_token_object_Store",{keyPath:"swScope"});a.createIndex("fcmSenderId","fcmSenderId",{unique:!1});a.createIndex("fcmToken","fcmToken",{unique:!0})}});
	return a.a},E=function(a){a.a?a.a.then(function(b){b.close();a.a=null}):Promise.resolve()},F=function(a,b){return D(a).then(function(a){return new Promise(function(c,e){var d=a.transaction(["fcm_token_object_Store"]).objectStore("fcm_token_object_Store").index("fcmToken").get(b);d.onerror=function(a){e(a.target.error)};d.onsuccess=function(a){c(a.target.result)}})})},G=function(a,b){return D(a).then(function(a){return new Promise(function(c,e){var d=[],l=a.transaction(["fcm_token_object_Store"]).objectStore("fcm_token_object_Store").openCursor();
	l.onerror=function(a){e(a.target.error)};l.onsuccess=function(a){(a=a.target.result)?(a.value.fcmSenderId===b&&d.push(a.value),a.continue()):c(d)}})})},H=function(a,b,c){var d=A(b.getKey("p256dh")),e=A(b.getKey("auth"));a="authorized_entity="+a+"&"+("endpoint="+b.endpoint+"&")+("encryption_key="+d+"&")+("encryption_auth="+e);c&&(a+="&pushSet="+c);c=new Headers;c.append("Content-Type","application/x-www-form-urlencoded");return fetch("https://fcm.googleapis.com/fcm/connect/subscribe",{method:"POST",
	headers:c,body:a}).then(function(a){return a.json()}).then(function(a){if(a.error)throw B.create("token-subscribe-failed",{message:a.error.message});if(!a.token)throw B.create("token-subscribe-no-token");if(!a.pushSet)throw B.create("token-subscribe-no-push-set");return{token:a.token,pushSet:a.pushSet}})},I=function(a,b,c,d,e,n){var l={swScope:c.scope,endpoint:d.endpoint,auth:A(d.getKey("auth")),p256dh:A(d.getKey("p256dh")),fcmToken:e,fcmPushSet:n,fcmSenderId:b};return D(a).then(function(a){return new Promise(function(b,
	c){var d=a.transaction(["fcm_token_object_Store"],"readwrite").objectStore("fcm_token_object_Store").put(l);d.onerror=function(a){c(a.target.error)};d.onsuccess=function(){b()}})})};
	C.prototype.i=function(a,b){return b instanceof ServiceWorkerRegistration?"string"!==typeof a||0===a.length?Promise.reject(B.create("bad-sender-id")):G(this,a).then(function(c){if(0!==c.length){var d=c.findIndex(function(c){return b.scope===c.swScope&&a===c.fcmSenderId});if(-1!==d)return c[d]}}).then(function(a){if(a)return b.pushManager.getSubscription().catch(function(){throw B.create("get-subscription-failed");}).then(function(b){var c;if(c=b)c=b.endpoint===a.endpoint&&A(b.getKey("auth"))===a.auth&&
	A(b.getKey("p256dh"))===a.p256dh;if(c)return a.fcmToken})}):Promise.reject(B.create("sw-registration-expected"))};C.prototype.getSavedToken=C.prototype.i;
	C.prototype.h=function(a,b){var c=this;return"string"!==typeof a||0===a.length?Promise.reject(B.create("bad-sender-id")):b instanceof ServiceWorkerRegistration?b.pushManager.getSubscription().then(function(a){return a?a:b.pushManager.subscribe(q)}).then(function(d){return H(a,d).then(function(e){return I(c,a,b,d,e.token,e.pushSet).then(function(){return e.token})})}):Promise.reject(B.create("sw-registration-expected"))};C.prototype.createToken=C.prototype.h;
	C.prototype.deleteToken=function(a){var b=this;return"string"!==typeof a||0===a.length?Promise.reject(B.create("invalid-delete-token")):F(this,a).then(function(a){if(!a)throw B.create("delete-token-not-found");return D(b).then(function(b){return new Promise(function(c,d){var e=b.transaction(["fcm_token_object_Store"],"readwrite").objectStore("fcm_token_object_Store").delete(a.swScope);e.onerror=function(a){d(a.target.error)};e.onsuccess=function(b){0===b.target.result?d(B.create("failed-to-delete-token")):
	c(a)}})})})};var J=function(a){var b=this;this.a=new firebase.INTERNAL.ErrorFactory("messaging","Messaging",p);if(!a.options.messagingSenderId||"string"!==typeof a.options.messagingSenderId)throw this.a.create("bad-sender-id");this.l=a.options.messagingSenderId;this.c=new C;this.app=a;this.INTERNAL={};this.INTERNAL.delete=function(){return b.delete}};
	J.prototype.getToken=function(){var a=this,b=Notification.permission;return"granted"!==b?"denied"===b?Promise.reject(this.a.create("notifications-blocked")):Promise.resolve(null):this.f().then(function(b){return a.c.i(a.l,b).then(function(c){return c?c:a.c.h(a.l,b)})})};J.prototype.getToken=J.prototype.getToken;J.prototype.deleteToken=function(a){var b=this;return this.c.deleteToken(a).then(function(){return b.f()}).then(function(a){return a?a.pushManager.getSubscription():null}).then(function(a){if(a)return a.unsubscribe()})};
	J.prototype.deleteToken=J.prototype.deleteToken;J.prototype.f=function(){throw this.a.create("should-be-overriden");};J.prototype.requestPermission=function(){throw this.a.create("only-available-in-window");};J.prototype.useServiceWorker=function(){throw this.a.create("only-available-in-window");};J.prototype.useServiceWorker=J.prototype.useServiceWorker;J.prototype.onMessage=function(){throw this.a.create("only-available-in-window");};J.prototype.onMessage=J.prototype.onMessage;
	J.prototype.onTokenRefresh=function(){throw this.a.create("only-available-in-window");};J.prototype.onTokenRefresh=J.prototype.onTokenRefresh;J.prototype.setBackgroundMessageHandler=function(){throw this.a.create("only-available-in-sw");};J.prototype.setBackgroundMessageHandler=J.prototype.setBackgroundMessageHandler;J.prototype.delete=function(){E(this.c)};var K=self,P=function(a){J.call(this,a);var b=this;this.a=new firebase.INTERNAL.ErrorFactory("messaging","Messaging",p);K.addEventListener("push",function(a){return L(b,a)},!1);K.addEventListener("pushsubscriptionchange",function(a){return N(b,a)},!1);K.addEventListener("notificationclick",function(a){return O(b,a)},!1);this.b=null};f(P,J);
	var L=function(a,b){var c;try{c=b.data.json()}catch(e){return}var d=Q().then(function(b){if(b){if(c.notification||a.b)return R(a,c)}else{if((b=c)&&"object"===typeof b.notification){var d=Object.assign({},b.notification),e={};d.data=(e.FCM_MSG=b,e);b=d}else b=void 0;if(b)return K.registration.showNotification(b.title||"",b);if(a.b)return a.b(c)}});b.waitUntil(d)},N=function(a,b){var c=a.getToken().then(function(b){if(!b)throw a.a.create("no-fcm-token-for-resubscribe");var c=a.c;return F(c,b).then(function(b){if(!b)throw a.a.create("invalid-saved-token");
	return K.registration.pushManager.subscribe(q).then(function(a){return H(b.w,a,b.v)}).catch(function(d){return c.deleteToken(b.A).then(function(){throw a.a.create("unable-to-resubscribe",{message:d});})})})});b.waitUntil(c)},O=function(a,b){if(b.notification&&b.notification.data&&b.notification.data.FCM_MSG){b.stopImmediatePropagation();b.notification.close();var c=b.notification.data.FCM_MSG,d=c.notification.click_action;if(d){var e=S(d).then(function(a){return a?a:K.clients.openWindow(d)}).then(function(b){if(b)return delete c.notification,
	T(a,b,r("notification-clicked",c))});b.waitUntil(e)}}};P.prototype.setBackgroundMessageHandler=function(a){if(a&&"function"!==typeof a)throw this.a.create("bg-handler-function-expected");this.b=a};P.prototype.setBackgroundMessageHandler=P.prototype.setBackgroundMessageHandler;
	var S=function(a){var b=(new URL(a)).href;return K.clients.matchAll({type:"window",includeUncontrolled:!0}).then(function(a){for(var c=null,e=0;e<a.length;e++)if((new URL(a[e].url)).href===b){c=a[e];break}if(c)return c.focus(),c})},T=function(a,b,c){return new Promise(function(d,e){if(!b)return e(a.a.create("no-window-client-to-msg"));b.postMessage(c);d()})},Q=function(){return K.clients.matchAll({type:"window",includeUncontrolled:!0}).then(function(a){return a.some(function(a){return"visible"===
	a.visibilityState})})},R=function(a,b){return K.clients.matchAll({type:"window",includeUncontrolled:!0}).then(function(c){var d=r("push-msg-received",b);return Promise.all(c.map(function(b){return T(a,b,d)}))})};P.prototype.f=function(){return Promise.resolve(K.registration)};var V=function(a){J.call(this,a);var b=this;this.j=null;this.m=firebase.INTERNAL.createSubscribe(function(a){b.j=a});this.s=null;this.o=firebase.INTERNAL.createSubscribe(function(a){b.s=a});U(this)};f(V,J);
	V.prototype.getToken=function(){var a=this;return"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")?W(this).then(function(){return J.prototype.getToken.call(a)}):Promise.reject(this.a.create("unsupported-browser"))};V.prototype.getToken=V.prototype.getToken;
	var W=function(a){if(a.g)return a.g;var b=document.querySelector('link[rel="manifest"]');b?a.g=fetch(b.href).then(function(a){return a.json()}).catch(function(){return Promise.resolve()}).then(function(b){if(b&&b.gcm_sender_id&&"103953800507"!==b.gcm_sender_id)throw a.a.create("incorrect-gcm-sender-id");}):a.g=Promise.resolve();return a.g};
	V.prototype.requestPermission=function(){var a=this;return"granted"===Notification.permission?Promise.resolve():new Promise(function(b,c){var d=function(d){return"granted"===d?b():"denied"===d?c(a.a.create("permission-blocked")):c(a.a.create("permission-default"))},e=Notification.requestPermission(function(a){e||d(a)});e&&e.then(d)})};V.prototype.requestPermission=V.prototype.requestPermission;
	V.prototype.useServiceWorker=function(a){if(!(a instanceof ServiceWorkerRegistration))throw this.a.create("sw-registration-expected");if("undefined"!==typeof this.b)throw this.a.create("use-sw-before-get-token");this.b=a};V.prototype.useServiceWorker=V.prototype.useServiceWorker;V.prototype.onMessage=function(a,b,c){return this.m(a,b,c)};V.prototype.onMessage=V.prototype.onMessage;V.prototype.onTokenRefresh=function(a,b,c){return this.o(a,b,c)};V.prototype.onTokenRefresh=V.prototype.onTokenRefresh;
	var X=function(a,b){var c=b.installing||b.waiting||b.active;return new Promise(function(d,e){if(c)if("activated"===c.state)d(b);else if("redundant"===c.state)e(a.a.create("sw-reg-redundant"));else{var n=function(){if("activated"===c.state)d(b);else if("redundant"===c.state)e(a.a.create("sw-reg-redundant"));else return;c.removeEventListener("statechange",n)};c.addEventListener("statechange",n)}else e(a.a.create("no-sw-in-reg"))})};
	V.prototype.f=function(){var a=this;if(this.b)return X(this,this.b);this.b=null;return navigator.serviceWorker.register("/firebase-messaging-sw.js",{scope:"/firebase-cloud-messaging-push-scope"}).catch(function(b){throw a.a.create("failed-serviceworker-registration",{browserErrorMessage:b.message});}).then(function(b){return X(a,b).then(function(){a.b=b;b.update();return b})})};
	var U=function(a){"serviceWorker"in navigator&&navigator.serviceWorker.addEventListener("message",function(b){if(b.data&&b.data["firebase-messaging-msg-type"])switch(b=b.data,b["firebase-messaging-msg-type"]){case "push-msg-received":case "notification-clicked":a.j.next(b["firebase-messaging-msg-data"])}},!1)};if(!(firebase&&firebase.INTERNAL&&firebase.INTERNAL.registerService))throw Error("Cannot install Firebase Messaging - be sure to load firebase-app.js first.");firebase.INTERNAL.registerService("messaging",function(a){return self&&"ServiceWorkerGlobalScope"in self?new P(a):new V(a)},{Messaging:V});}).call(this);
	}).call(global);
	module.exports = firebase.messaging;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
	// This work is free. You can redistribute it and/or modify it
	// under the terms of the WTFPL, Version 2
	// For more information see LICENSE.txt or http://www.wtfpl.net/
	//
	// For more information, the home page:
	// http://pieroxy.net/blog/pages/lz-string/testing.html
	//
	// LZ-based compression algorithm, version 1.4.4
	var LZString = (function() {
	
	// private property
	var f = String.fromCharCode;
	var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
	var baseReverseDic = {};
	
	function getBaseValue(alphabet, character) {
	  if (!baseReverseDic[alphabet]) {
	    baseReverseDic[alphabet] = {};
	    for (var i=0 ; i<alphabet.length ; i++) {
	      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
	    }
	  }
	  return baseReverseDic[alphabet][character];
	}
	
	var LZString = {
	  compressToBase64 : function (input) {
	    if (input == null) return "";
	    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
	    switch (res.length % 4) { // To produce valid Base64
	    default: // When could this happen ?
	    case 0 : return res;
	    case 1 : return res+"===";
	    case 2 : return res+"==";
	    case 3 : return res+"=";
	    }
	  },
	
	  decompressFromBase64 : function (input) {
	    if (input == null) return "";
	    if (input == "") return null;
	    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
	  },
	
	  compressToUTF16 : function (input) {
	    if (input == null) return "";
	    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
	  },
	
	  decompressFromUTF16: function (compressed) {
	    if (compressed == null) return "";
	    if (compressed == "") return null;
	    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
	  },
	
	  //compress into uint8array (UCS-2 big endian format)
	  compressToUint8Array: function (uncompressed) {
	    var compressed = LZString.compress(uncompressed);
	    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character
	
	    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
	      var current_value = compressed.charCodeAt(i);
	      buf[i*2] = current_value >>> 8;
	      buf[i*2+1] = current_value % 256;
	    }
	    return buf;
	  },
	
	  //decompress from uint8array (UCS-2 big endian format)
	  decompressFromUint8Array:function (compressed) {
	    if (compressed===null || compressed===undefined){
	        return LZString.decompress(compressed);
	    } else {
	        var buf=new Array(compressed.length/2); // 2 bytes per character
	        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
	          buf[i]=compressed[i*2]*256+compressed[i*2+1];
	        }
	
	        var result = [];
	        buf.forEach(function (c) {
	          result.push(f(c));
	        });
	        return LZString.decompress(result.join(''));
	
	    }
	
	  },
	
	
	  //compress into a string that is already URI encoded
	  compressToEncodedURIComponent: function (input) {
	    if (input == null) return "";
	    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
	  },
	
	  //decompress from an output of compressToEncodedURIComponent
	  decompressFromEncodedURIComponent:function (input) {
	    if (input == null) return "";
	    if (input == "") return null;
	    input = input.replace(/ /g, "+");
	    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
	  },
	
	  compress: function (uncompressed) {
	    return LZString._compress(uncompressed, 16, function(a){return f(a);});
	  },
	  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
	    if (uncompressed == null) return "";
	    var i, value,
	        context_dictionary= {},
	        context_dictionaryToCreate= {},
	        context_c="",
	        context_wc="",
	        context_w="",
	        context_enlargeIn= 2, // Compensate for the first entry which should not count
	        context_dictSize= 3,
	        context_numBits= 2,
	        context_data=[],
	        context_data_val=0,
	        context_data_position=0,
	        ii;
	
	    for (ii = 0; ii < uncompressed.length; ii += 1) {
	      context_c = uncompressed.charAt(ii);
	      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
	        context_dictionary[context_c] = context_dictSize++;
	        context_dictionaryToCreate[context_c] = true;
	      }
	
	      context_wc = context_w + context_c;
	      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
	        context_w = context_wc;
	      } else {
	        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
	          if (context_w.charCodeAt(0)<256) {
	            for (i=0 ; i<context_numBits ; i++) {
	              context_data_val = (context_data_val << 1);
	              if (context_data_position == bitsPerChar-1) {
	                context_data_position = 0;
	                context_data.push(getCharFromInt(context_data_val));
	                context_data_val = 0;
	              } else {
	                context_data_position++;
	              }
	            }
	            value = context_w.charCodeAt(0);
	            for (i=0 ; i<8 ; i++) {
	              context_data_val = (context_data_val << 1) | (value&1);
	              if (context_data_position == bitsPerChar-1) {
	                context_data_position = 0;
	                context_data.push(getCharFromInt(context_data_val));
	                context_data_val = 0;
	              } else {
	                context_data_position++;
	              }
	              value = value >> 1;
	            }
	          } else {
	            value = 1;
	            for (i=0 ; i<context_numBits ; i++) {
	              context_data_val = (context_data_val << 1) | value;
	              if (context_data_position ==bitsPerChar-1) {
	                context_data_position = 0;
	                context_data.push(getCharFromInt(context_data_val));
	                context_data_val = 0;
	              } else {
	                context_data_position++;
	              }
	              value = 0;
	            }
	            value = context_w.charCodeAt(0);
	            for (i=0 ; i<16 ; i++) {
	              context_data_val = (context_data_val << 1) | (value&1);
	              if (context_data_position == bitsPerChar-1) {
	                context_data_position = 0;
	                context_data.push(getCharFromInt(context_data_val));
	                context_data_val = 0;
	              } else {
	                context_data_position++;
	              }
	              value = value >> 1;
	            }
	          }
	          context_enlargeIn--;
	          if (context_enlargeIn == 0) {
	            context_enlargeIn = Math.pow(2, context_numBits);
	            context_numBits++;
	          }
	          delete context_dictionaryToCreate[context_w];
	        } else {
	          value = context_dictionary[context_w];
	          for (i=0 ; i<context_numBits ; i++) {
	            context_data_val = (context_data_val << 1) | (value&1);
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	            value = value >> 1;
	          }
	
	
	        }
	        context_enlargeIn--;
	        if (context_enlargeIn == 0) {
	          context_enlargeIn = Math.pow(2, context_numBits);
	          context_numBits++;
	        }
	        // Add wc to the dictionary.
	        context_dictionary[context_wc] = context_dictSize++;
	        context_w = String(context_c);
	      }
	    }
	
	    // Output the code for w.
	    if (context_w !== "") {
	      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
	        if (context_w.charCodeAt(0)<256) {
	          for (i=0 ; i<context_numBits ; i++) {
	            context_data_val = (context_data_val << 1);
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	          }
	          value = context_w.charCodeAt(0);
	          for (i=0 ; i<8 ; i++) {
	            context_data_val = (context_data_val << 1) | (value&1);
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	            value = value >> 1;
	          }
	        } else {
	          value = 1;
	          for (i=0 ; i<context_numBits ; i++) {
	            context_data_val = (context_data_val << 1) | value;
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	            value = 0;
	          }
	          value = context_w.charCodeAt(0);
	          for (i=0 ; i<16 ; i++) {
	            context_data_val = (context_data_val << 1) | (value&1);
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	            value = value >> 1;
	          }
	        }
	        context_enlargeIn--;
	        if (context_enlargeIn == 0) {
	          context_enlargeIn = Math.pow(2, context_numBits);
	          context_numBits++;
	        }
	        delete context_dictionaryToCreate[context_w];
	      } else {
	        value = context_dictionary[context_w];
	        for (i=0 ; i<context_numBits ; i++) {
	          context_data_val = (context_data_val << 1) | (value&1);
	          if (context_data_position == bitsPerChar-1) {
	            context_data_position = 0;
	            context_data.push(getCharFromInt(context_data_val));
	            context_data_val = 0;
	          } else {
	            context_data_position++;
	          }
	          value = value >> 1;
	        }
	
	
	      }
	      context_enlargeIn--;
	      if (context_enlargeIn == 0) {
	        context_enlargeIn = Math.pow(2, context_numBits);
	        context_numBits++;
	      }
	    }
	
	    // Mark the end of the stream
	    value = 2;
	    for (i=0 ; i<context_numBits ; i++) {
	      context_data_val = (context_data_val << 1) | (value&1);
	      if (context_data_position == bitsPerChar-1) {
	        context_data_position = 0;
	        context_data.push(getCharFromInt(context_data_val));
	        context_data_val = 0;
	      } else {
	        context_data_position++;
	      }
	      value = value >> 1;
	    }
	
	    // Flush the last char
	    while (true) {
	      context_data_val = (context_data_val << 1);
	      if (context_data_position == bitsPerChar-1) {
	        context_data.push(getCharFromInt(context_data_val));
	        break;
	      }
	      else context_data_position++;
	    }
	    return context_data.join('');
	  },
	
	  decompress: function (compressed) {
	    if (compressed == null) return "";
	    if (compressed == "") return null;
	    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
	  },
	
	  _decompress: function (length, resetValue, getNextValue) {
	    var dictionary = [],
	        next,
	        enlargeIn = 4,
	        dictSize = 4,
	        numBits = 3,
	        entry = "",
	        result = [],
	        i,
	        w,
	        bits, resb, maxpower, power,
	        c,
	        data = {val:getNextValue(0), position:resetValue, index:1};
	
	    for (i = 0; i < 3; i += 1) {
	      dictionary[i] = i;
	    }
	
	    bits = 0;
	    maxpower = Math.pow(2,2);
	    power=1;
	    while (power!=maxpower) {
	      resb = data.val & data.position;
	      data.position >>= 1;
	      if (data.position == 0) {
	        data.position = resetValue;
	        data.val = getNextValue(data.index++);
	      }
	      bits |= (resb>0 ? 1 : 0) * power;
	      power <<= 1;
	    }
	
	    switch (next = bits) {
	      case 0:
	          bits = 0;
	          maxpower = Math.pow(2,8);
	          power=1;
	          while (power!=maxpower) {
	            resb = data.val & data.position;
	            data.position >>= 1;
	            if (data.position == 0) {
	              data.position = resetValue;
	              data.val = getNextValue(data.index++);
	            }
	            bits |= (resb>0 ? 1 : 0) * power;
	            power <<= 1;
	          }
	        c = f(bits);
	        break;
	      case 1:
	          bits = 0;
	          maxpower = Math.pow(2,16);
	          power=1;
	          while (power!=maxpower) {
	            resb = data.val & data.position;
	            data.position >>= 1;
	            if (data.position == 0) {
	              data.position = resetValue;
	              data.val = getNextValue(data.index++);
	            }
	            bits |= (resb>0 ? 1 : 0) * power;
	            power <<= 1;
	          }
	        c = f(bits);
	        break;
	      case 2:
	        return "";
	    }
	    dictionary[3] = c;
	    w = c;
	    result.push(c);
	    while (true) {
	      if (data.index > length) {
	        return "";
	      }
	
	      bits = 0;
	      maxpower = Math.pow(2,numBits);
	      power=1;
	      while (power!=maxpower) {
	        resb = data.val & data.position;
	        data.position >>= 1;
	        if (data.position == 0) {
	          data.position = resetValue;
	          data.val = getNextValue(data.index++);
	        }
	        bits |= (resb>0 ? 1 : 0) * power;
	        power <<= 1;
	      }
	
	      switch (c = bits) {
	        case 0:
	          bits = 0;
	          maxpower = Math.pow(2,8);
	          power=1;
	          while (power!=maxpower) {
	            resb = data.val & data.position;
	            data.position >>= 1;
	            if (data.position == 0) {
	              data.position = resetValue;
	              data.val = getNextValue(data.index++);
	            }
	            bits |= (resb>0 ? 1 : 0) * power;
	            power <<= 1;
	          }
	
	          dictionary[dictSize++] = f(bits);
	          c = dictSize-1;
	          enlargeIn--;
	          break;
	        case 1:
	          bits = 0;
	          maxpower = Math.pow(2,16);
	          power=1;
	          while (power!=maxpower) {
	            resb = data.val & data.position;
	            data.position >>= 1;
	            if (data.position == 0) {
	              data.position = resetValue;
	              data.val = getNextValue(data.index++);
	            }
	            bits |= (resb>0 ? 1 : 0) * power;
	            power <<= 1;
	          }
	          dictionary[dictSize++] = f(bits);
	          c = dictSize-1;
	          enlargeIn--;
	          break;
	        case 2:
	          return result.join('');
	      }
	
	      if (enlargeIn == 0) {
	        enlargeIn = Math.pow(2, numBits);
	        numBits++;
	      }
	
	      if (dictionary[c]) {
	        entry = dictionary[c];
	      } else {
	        if (c === dictSize) {
	          entry = w + w.charAt(0);
	        } else {
	          return null;
	        }
	      }
	      result.push(entry);
	
	      // Add w+entry[0] to the dictionary.
	      dictionary[dictSize++] = w + entry.charAt(0);
	      enlargeIn--;
	
	      w = entry;
	
	      if (enlargeIn == 0) {
	        enlargeIn = Math.pow(2, numBits);
	        numBits++;
	      }
	
	    }
	  }
	};
	  return LZString;
	})();
	
	if (true) {
	  !(__WEBPACK_AMD_DEFINE_RESULT__ = function () { return LZString; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if( typeof module !== 'undefined' && module != null ) {
	  module.exports = LZString
	}


/***/ }
/******/ ])
});
;
//# sourceMappingURL=textik_vendor.js.map