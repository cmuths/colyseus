(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("textik_vendor"));
	else if(typeof define === 'function' && define.amd)
		define(["textik_vendor"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("textik_vendor")) : factory(root["textik_vendor"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_10__) {
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
/******/ 	__webpack_require__.p = "http://localhost:8080/public";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var app = __webpack_require__(4);
	app.main();


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __assign = (this && this.__assign) || Object.assign || function(t) {
	    for (var s, i = 1, n = arguments.length; i < n; i++) {
	        s = arguments[i];
	        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	            t[p] = s[p];
	    }
	    return t;
	};
	var dimensions = __webpack_require__(5);
	var item_1 = __webpack_require__(6);
	var store = __webpack_require__(8);
	var textEditor = __webpack_require__(13);
	function uuidGenerate() {
	    return Math.random().toString(16).substr(2, 8) + Math.random().toString(16).substr(2, 8);
	}
	function isRendered() {
	    return document.querySelector(".project") != null;
	}
	function initData(documentId) {
	    return __assign({}, dimensions.appDimensions(), { documentId: documentId });
	}
	function buildGuestUser() {
	    var userJson = window.localStorage.getItem("textik_user");
	    var user;
	    if (userJson != null) {
	        user = JSON.parse(userJson);
	    }
	    if (user == null) {
	        user = { uid: "guest_" + uuidGenerate(), isGuest: true, email: "" };
	        window.localStorage.setItem("textik_user", JSON.stringify(user));
	    }
	    return user;
	}
	function buildUser(userPayload) {
	    return {
	        email: userPayload.email || "",
	        isGuest: !userPayload.email,
	        uid: userPayload.uid
	    };
	}
	var connections = [];
	function initialize(documentId, app, initialUser) {
	    var user = initialUser;
	    if (isRendered()) {
	        window.addEventListener("keydown", function (e) {
	            // left, right, top, bottom
	            if (e.which >= 37 && e.which <= 40 && e.target.tagName !== "INPUT") {
	                e.preventDefault();
	            }
	        });
	        var initialData = initData(documentId);
	        var projectList_1 = !user.isGuest ? store.getProjectList(user) : Promise.resolve([]);
	        app.ports.initializeApp.send(initialData);
	        app.ports.setUser.send(user);
	        app.ports.requestResult.subscribe(function (payload) {
	            app.ports.receiveResult.send(item_1.globalItem.buildResult(payload.items));
	        });
	        app.ports.showTextEditor.subscribe(function (payload) {
	            textEditor.showTextEditor(payload, function (newValue) {
	                app.ports.setText.send({
	                    id: payload.id,
	                    value: newValue,
	                    point: { x: payload.bounds.start.x, y: payload.bounds.start.y }
	                });
	            });
	        });
	        app.ports.shareData.subscribe(function (payload) {
	            if (connections.length > 1) {
	                shareCoordinates(documentId, user.uid, payload);
	            }
	        });
	        app.ports.saveProject.subscribe(function (payload) {
	            saveProject(user, documentId, payload.state, payload.projectName);
	        });
	        app.ports.deleteProject.subscribe(function (projectId) {
	            if (confirm("Are you sure?")) {
	                store.deleteProject(user, projectId).then(function (_) {
	                    return loadProjectList(store.getProjectList(user));
	                }).then(function (list) {
	                    return app.ports.receiveProjectList.send(list);
	                });
	            }
	        });
	        app.ports.authenticate.subscribe(function () {
	            store.authenticate().then(function (result) {
	                user = buildUser(result.user);
	                store.updateUser(user).then(function () {
	                    document.location.reload();
	                });
	            });
	        });
	        app.ports.requestProjectList.subscribe(function (_) {
	            loadProjectList(projectList_1).then(function (list) {
	                app.ports.receiveProjectList.send(list);
	            });
	        });
	        app.ports.logOut.subscribe(function () {
	            store.logOut().then(function () {
	                user = buildGuestUser();
	                app.ports.setUser.send(user);
	            });
	        });
	        store.registerConnection(documentId, user.uid);
	        store.listenToConnections(documentId, function (snapshot) {
	            var value = snapshot.val();
	            if (value != null) {
	                connections = objectValues(value);
	            }
	        });
	        store.listenToCoordinates(documentId, function (snapshot) {
	            var payload = snapshot.val();
	            if (payload != null) {
	                Object.keys(payload).forEach(function (userName) {
	                    var point = payload[userName];
	                    if (userName !== user.email) {
	                        app.ports.showCoordinates.send({ user: userName, point: point });
	                    }
	                });
	            }
	        });
	        var projectNode_1 = document.querySelector(".project");
	        if (projectNode_1 != null) {
	            projectNode_1.addEventListener("scroll", function () {
	                app.ports.updateScrollPosition.send(dimensions.scrollPosition(projectNode_1));
	            });
	        }
	        else {
	            throw "Missing .project while initializing on scroll event handler";
	        }
	    }
	    else {
	        setTimeout(function () { return initialize(documentId, app, user); }, 5);
	    }
	}
	var saveProject = throttle(store.saveProject);
	var shareCoordinates = throttle(store.shareCoordinates);
	function throttle(fn, threshold, scope) {
	    if (threshold === void 0) { threshold = 250; }
	    var last;
	    var deferTimer;
	    /* tslint:disable-next-line */
	    return function () {
	        var context = scope || this;
	        var now = +new Date();
	        var args = arguments;
	        if (last && now < last + threshold) {
	            // hold on to it
	            clearTimeout(deferTimer);
	            deferTimer = setTimeout(function () {
	                last = now;
	                fn.apply(context, args);
	            }, threshold + last - now);
	        }
	        else {
	            last = now;
	            fn.apply(context, args);
	        }
	    };
	}
	function objectValues(value) {
	    return Object.keys(value).map(function (key) {
	        return value[key];
	    });
	}
	function loadProjectList(projectList) {
	    return projectList.then(function (projects) {
	        var list = projects.map(function (project) {
	            var textikItem = new item_1.Item();
	            return {
	                name: project.name,
	                projectId: project.id,
	                result: textikItem.buildResult(project.state.completed)
	            };
	        });
	        return list;
	    });
	}
	function main() {
	    var projectPromise;
	    var id = location.hash.replace("#", "");
	    if (id === "") {
	        id = uuidGenerate();
	        location.hash = id;
	        projectPromise = Promise.resolve({});
	    }
	    else {
	        projectPromise = new Promise(function (resolve, _) {
	            store.getProject(id).then(function (project) {
	                resolve(project || {});
	            });
	        });
	    }
	    var userPromise = new Promise(function (resolve, _) {
	        var unsubscribe = store.auth.onAuthStateChanged(function (user) {
	            unsubscribe();
	            if (user) {
	                resolve(buildUser(user));
	            }
	            else {
	                resolve(buildGuestUser());
	            }
	        });
	    });
	    Promise.all([userPromise, projectPromise]).then(function (_a) {
	        var user = _a[0], project = _a[1];
	        // const screen = project != null ? "EditorScreen" : "NotFoundScreen";
	        var screen = "EditorScreen";
	        project = project != null && project.completed != null ? project : null;
	        var appNode = document.querySelector("#app");
	        if (appNode != null) {
	            var app_1 = Elm["Main"].embed(appNode, {
	                user: user,
	                state: project,
	                screen: screen,
	                projectName: "My Project 1"
	            });
	            setTimeout(function () { return initialize(id, app_1, user); }, 5);
	        }
	    });
	}
	exports.main = main;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	function scrollPosition(node) {
	    return {
	        x: node.scrollLeft,
	        y: node.scrollTop
	    };
	}
	exports.scrollPosition = scrollPosition;
	function appDimensions() {
	    return {
	        canvasBounds: projectSize(),
	        letterSize: letterSize()
	    };
	}
	exports.appDimensions = appDimensions;
	function projectSize() {
	    var project = document.querySelector(".project");
	    if (project == null) {
	        throw "There's no .project HTML element yet";
	    }
	    else {
	        var projectRect = project.getBoundingClientRect();
	        return {
	            start: { x: Math.round(projectRect.left), y: Math.round(projectRect.top) },
	            end: { x: Math.round(projectRect.left + projectRect.width), y: Math.round(projectRect.top + projectRect.height) }
	        };
	    }
	}
	function letterSize() {
	    var numberOfX = 100;
	    var calculator = document.querySelector(".calculate-letter-size");
	    if (calculator == null) {
	        calculator = document.createElement("div");
	        calculator.setAttribute("class", "calculate-letter-size");
	        calculator.innerHTML = Array(numberOfX).join("X") + Array(numberOfX - 1).join("<br />X");
	        document.body.appendChild(calculator);
	    }
	    var width = calculator.offsetWidth / (numberOfX - 1);
	    var height = calculator.offsetHeight / (numberOfX - 1);
	    document.body.removeChild(calculator);
	    return { width: width, height: height };
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var utils = __webpack_require__(7);
	var Item = (function () {
	    function Item() {
	    }
	    Item.prototype.draw = function (item) {
	        if (item.tool.ctor === "Text") {
	            return "";
	        }
	        else {
	            var parsedData = this.parse(item);
	            var width = item.input.end.x - item.input.start.x;
	            var height = item.input.end.y - item.input.start.y;
	            return this.generateString(width, height, this.sortData(parsedData.points));
	        }
	    };
	    ;
	    Item.prototype.isHit = function (item, point) {
	        if (item.tool.ctor === "Text") {
	            var lengths = item.text.split("\n").map(function (l) { return l.length; });
	            var line = point.y - item.input.start.y;
	            var pointInLine = point.x - item.input.start.x;
	            return pointInLine >= 0 && pointInLine <= lengths[line] - 1;
	        }
	        else {
	            return !!this.parse(item).index[point.x + "_" + point.y];
	        }
	    };
	    Item.prototype.buildResult = function (items) {
	        var that = this;
	        var values = [];
	        for (var i = 0; i < items.length; i += 1) {
	            var item = items[i];
	            values.push([item.id, item, this.parse(this.shiftTo0(item))]);
	        }
	        values = values.sort(function (a, b) {
	            return parseInt(a[1].z, 10) - parseInt(b[1].z, 10);
	        });
	        function generateIndex(viewport) {
	            var index = {};
	            for (var i = 0; i < values.length; i += 1) {
	                var item = values[i][1];
	                var indexCache = values[i][2];
	                for (var k in indexCache.index) {
	                    if (indexCache.index.hasOwnProperty(k)) {
	                        var match = k.match(/(\d+)_(\d+)/);
	                        if (match) {
	                            var x = parseInt(match[1], 10);
	                            var y = parseInt(match[2], 10);
	                            var startX = Math.min(item.input.start.x, item.input.end.x) - viewport.startX;
	                            var startY = Math.min(item.input.start.y, item.input.end.y) - viewport.startY;
	                            index[(startX + x) + "_" + (startY + y)] = indexCache.index[k];
	                        }
	                    }
	                }
	            }
	            return index;
	        }
	        function generatePoints(index) {
	            var points = [];
	            for (var k in index) {
	                if (index.hasOwnProperty(k)) {
	                    var match = k.match(/(\d+)_(\d+)/);
	                    if (match) {
	                        var x = parseInt(match[1], 10);
	                        var y = parseInt(match[2], 10);
	                        points.push([[x, y], index[k]]);
	                    }
	                }
	            }
	            return that.sortData(points);
	        }
	        function stringLength(str) {
	            return str.length;
	        }
	        function getViewport() {
	            var result = { startX: Infinity, startY: Infinity, endX: 0, endY: 0 };
	            for (var i = 0; i < values.length; i += 1) {
	                var item = values[i][1];
	                var rect = itemWithTextBoundingRect(item);
	                result.startX = Math.min(result.startX, rect.x);
	                result.startY = Math.min(result.startY, rect.y);
	                result.endX = Math.max(result.endX, rect.x + rect.width);
	                result.endY = Math.max(result.endY, rect.y + rect.height);
	            }
	            return result;
	        }
	        function addText(viewport, width, data) {
	            for (var i = 0; i < values.length; i += 1) {
	                var item = values[i][1];
	                var text = item.text;
	                var widthItem = Math.abs(item.input.start.x - item.input.end.x);
	                var heightItem = Math.abs(item.input.start.y - item.input.end.y);
	                var startX = Math.min(item.input.start.x, item.input.end.x) - viewport.startX;
	                var startY = Math.min(item.input.start.y, item.input.end.y) - viewport.startY;
	                var widthCenterItem = startX + widthItem / 2;
	                var heightCenterItem = startY + heightItem / 2;
	                var pos = void 0;
	                var line = void 0;
	                if (text && text !== "") {
	                    var textArray = void 0;
	                    if (item.tool === "Text") {
	                        textArray = text.split("\n");
	                        for (var j = 0; j < textArray.length; j += 1) {
	                            line = textArray[j];
	                            pos = (startY + j) * (width + 1) + startX;
	                            data = data.substr(0, pos) +
	                                data.substr(pos, line.length).replace(/.*/, line) +
	                                data.substr(pos + line.length, data.length - (pos + line.length));
	                        }
	                    }
	                    else {
	                        var splittedText = text.split("\n");
	                        var widthText = Math.max.apply(null, splittedText.map(stringLength));
	                        var heightText = splittedText.length;
	                        var startXText = Math.ceil(widthCenterItem - widthText / 2);
	                        var startYText = Math.ceil(heightCenterItem - heightText / 2);
	                        for (var j = 0; j < splittedText.length; j += 1) {
	                            line = splittedText[j];
	                            pos = (startYText + j) * (width + 1) + startXText;
	                            data = data.substr(0, pos) +
	                                data.substr(pos + 1, line.length).replace(/.*/, line) +
	                                data.substr(pos + line.length, data.length - (pos + line.length));
	                        }
	                    }
	                }
	            }
	            return data;
	        }
	        var viewport = getViewport();
	        var result = generateIndex(viewport);
	        var points = generatePoints(result);
	        var width = viewport.endX - viewport.startX + 1;
	        var height = viewport.endY - viewport.startY + 1;
	        var content = that.generateString(width, height, points);
	        content = addText(viewport, width, content);
	        return { width: width, height: height, content: content };
	    };
	    Item.prototype.elmListToArray = function (list) {
	        if (!list.ctor || list.ctor === "[]") {
	            return [];
	        }
	        else {
	            var result = [list._0];
	            var v = list._1;
	            while (v.ctor === "::") {
	                result.push(v._0);
	                v = v._1;
	            }
	            return result;
	        }
	    };
	    // Bresenham's line algorithm
	    // http://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
	    // data - [x1: num, y1: num, x2: num, y2: num], firstChar: string (e.g. "-" or "|")
	    Item.prototype.buildLine = function (data, firstChars, lastChars) {
	        if (firstChars === void 0) { firstChars = []; }
	        if (lastChars === void 0) { lastChars = []; }
	        var x1 = data[0], y1 = data[1], x2 = data[2], y2 = data[3];
	        var dx = Math.abs(x2 - x1);
	        var dy = Math.abs(y2 - y1);
	        var sx = (x1 < x2 ? 1 : -1);
	        var sy = (y1 < y2 ? 1 : -1);
	        var sym = (dx < dy ? "|" : "-");
	        var slash = (sx === sy ? "\\" : "/");
	        var err = dx - dy;
	        var result = { points: [], index: {} };
	        while (x1 !== x2 || y1 !== y2) {
	            var e2 = err << 1;
	            var newErr = void 0;
	            if (e2 > -dy && e2 < dx) {
	                newErr = err - dy + dx;
	            }
	            else if (e2 > -dy) {
	                newErr = err - dy;
	            }
	            else if (e2 < dx) {
	                newErr = err + dx;
	            }
	            else {
	                newErr = err;
	            }
	            var newX1 = (e2 > -dy ? x1 + sx : x1);
	            var newY1 = (e2 < dx ? y1 + sy : y1);
	            var newSym = ((sym === "|" && newX1 !== x1) || (sym === "-" && newY1 !== y1) ? slash : sym);
	            utils.add(result, x1, y1, newSym);
	            x1 = newX1;
	            y1 = newY1;
	            err = newErr;
	        }
	        utils.add(result, x2, y2, sym);
	        firstChars = firstChars || [];
	        lastChars = lastChars || [];
	        firstChars.forEach(function (firstChar, i) {
	            var points = result.points[i];
	            if (points != null) {
	                var point = points[0];
	                utils.replace(result, point[0], point[1], firstChar);
	            }
	        });
	        lastChars.forEach(function (lastChar, i) {
	            var points = result.points[result.points.length - 1 - i];
	            if (points != null) {
	                var point = points[0];
	                utils.replace(result, point[0], point[1], lastChar);
	            }
	        });
	        return result;
	    };
	    Item.prototype.buildRect = function (data) {
	        var x1 = Math.min(data[0], data[2]);
	        var y1 = Math.min(data[1], data[3]);
	        var x2 = Math.max(data[0], data[2]);
	        var y2 = Math.max(data[1], data[3]);
	        var result = { points: [], index: {} };
	        utils.add(result, x1, y1, "+");
	        if (x1 !== x2) {
	            utils.add(result, x2, y1, "+");
	        }
	        if (y1 !== y2) {
	            utils.add(result, x1, y2, "+");
	        }
	        if (x1 !== x2 && y1 !== y2) {
	            utils.add(result, x2, y2, "+");
	        }
	        if (Math.abs(x2 - x1) > 1) {
	            utils.concat(result, this.buildLine([x1 + 1, y1, x2 - 1, y1], ["-"]));
	            if (Math.abs(y2 - y1) > 0) {
	                utils.concat(result, this.buildLine([x1 + 1, y2, x2 - 1, y2], ["-"]));
	            }
	        }
	        if (Math.abs(y2 - y1) > 1) {
	            utils.concat(result, this.buildLine([x1, y1 + 1, x1, y2 - 1], ["|"]));
	            if (Math.abs(x2 - x1) > 0) {
	                utils.concat(result, this.buildLine([x2, y1 + 1, x2, y2 - 1], ["|"]));
	            }
	        }
	        return result;
	    };
	    Item.prototype.buildRectLine = function (data, direction, firstChars, lastChars) {
	        if (direction === void 0) { direction = "Horizontal"; }
	        if (firstChars === void 0) { firstChars = []; }
	        if (lastChars === void 0) { lastChars = []; }
	        var x1 = data[0], y1 = data[1], x2 = data[2], y2 = data[3];
	        var result = { points: [], index: {} };
	        if (direction === "Horizontal") {
	            if (Math.abs(x2 - x1) > 0) {
	                utils.concat(result, this.buildLine([x1, y1, x2 > x1 ? (x2 - 1) : (x2 + 1), y1], firstChars));
	            }
	            utils.add(result, x2, y1, "+");
	            if (Math.abs(y2 - y1) > 0) {
	                utils.concat(result, this.buildLine([x2, y2 > y1 ? (y1 + 1) : (y1 - 1), x2, y2], ["|"], lastChars));
	            }
	        }
	        else {
	            if (Math.abs(y2 - y1) > 0) {
	                utils.concat(result, this.buildLine([x1, y1, x1, y2 > y1 ? (y2 - 1) : (y2 + 1)], firstChars));
	            }
	            utils.add(result, x1, y2, "+");
	            if (Math.abs(x2 - x1) > 0) {
	                utils.concat(result, this.buildLine([x2 > x1 ? (x1 + 1) : (x1 - 1), y2, x2, y2], ["-"], lastChars));
	            }
	        }
	        return result;
	    };
	    Item.prototype.sortData = function (data) {
	        return (data || []).sort(function (a, b) {
	            var result;
	            if (a[0][1] > b[0][1]) {
	                result = 1;
	            }
	            else if (a[0][1] < b[0][1]) {
	                result = -1;
	            }
	            else {
	                if (a[0][0] > b[0][0]) {
	                    result = 1;
	                }
	                else if (a[0][0] < b[0][0]) {
	                    result = -1;
	                }
	                else {
	                    result = 0;
	                }
	            }
	            return result;
	        });
	    };
	    Item.prototype.generateString = function (width, height, points) {
	        var line = 0;
	        var pos = 0;
	        var result = "";
	        for (var i in points) {
	            if (points.hasOwnProperty(i)) {
	                var dataPoint = points[i];
	                var point = dataPoint[0];
	                var x = point[0];
	                var y = point[1];
	                var character = dataPoint[1];
	                while (y !== line) {
	                    result += utils.repeatString(" ", width - pos);
	                    result += "\n";
	                    pos = 0;
	                    line += 1;
	                }
	                result += utils.repeatString(" ", x - pos);
	                result += character.v;
	                pos = x + 1;
	                line = y;
	            }
	        }
	        while (line < height) {
	            result += utils.repeatString(" ", width - pos);
	            pos = 0;
	            line += 1;
	            if (line < height) {
	                result += "\n";
	            }
	        }
	        return result;
	    };
	    Item.prototype.isConnected = function (item, isFirst) {
	        var isConnected = false;
	        var connected = this.elmListToArray(item.connected);
	        for (var i in connected) {
	            if (connected.hasOwnProperty(i)) {
	                var el = connected[i];
	                isConnected = el && el.ctor && el.ctor === (isFirst ? "StartEdge" : "EndEdge");
	                if (isConnected) {
	                    return isConnected;
	                }
	            }
	        }
	        return isConnected;
	    };
	    Item.prototype.getEdgeChar = function (item, isFirst) {
	        var tool = item.tool.ctor || item.tool;
	        switch (tool) {
	            case "Line": {
	                var result = [];
	                if (this.isConnected(item, isFirst)) {
	                    result.push("+");
	                }
	                if ((isFirst && (item.lineEdges.start.ctor || item.lineEdges.start) === "EdgeArrow")
	                    || (!isFirst && (item.lineEdges.end.ctor || item.lineEdges.end) === "EdgeArrow")) {
	                    var aspectRatio = (item.input.end.x - item.input.start.x) / (item.input.end.y - item.input.start.y);
	                    var isHorizontallyFlipped = item.input.start.x > item.input.end.x;
	                    var isVerticallyFlipped = item.input.start.y > item.input.end.y;
	                    if (Math.abs(aspectRatio) > 1) {
	                        result.push(isHorizontallyFlipped ? (isFirst ? ">" : "<") : (isFirst ? "<" : ">"));
	                    }
	                    else {
	                        result.push(isVerticallyFlipped ? (isFirst ? "v" : "^") : (isFirst ? "^" : "v"));
	                    }
	                }
	                return result;
	            }
	            case "RectLine": {
	                var result = [];
	                if (this.isConnected(item, isFirst)) {
	                    result.push("+");
	                }
	                if ((isFirst && (item.lineEdges.start.ctor || item.lineEdges.start) === "EdgeArrow")
	                    || (!isFirst && (item.lineEdges.end.ctor || item.lineEdges.end) === "EdgeArrow")) {
	                    var direction = (item.direction._0 && item.direction._0.ctor) || item.direction;
	                    var isHorizontallyFlipped = item.input.start.x > item.input.end.x;
	                    var isVerticallyFlipped = item.input.start.y > item.input.end.y;
	                    if (direction === "Horizontal") {
	                        result.push(isHorizontallyFlipped
	                            ? (isVerticallyFlipped ? (isFirst ? ">" : "^") : (isFirst ? ">" : "v"))
	                            : (isVerticallyFlipped ? (isFirst ? "<" : "^") : (isFirst ? "<" : "v")));
	                    }
	                    else {
	                        result.push(isHorizontallyFlipped
	                            ? (isVerticallyFlipped ? (isFirst ? "v" : "<") : (isFirst ? "^" : "<"))
	                            : (isVerticallyFlipped ? (isFirst ? "v" : ">") : (isFirst ? "^" : ">")));
	                    }
	                }
	                return result;
	            }
	            default:
	                throw ("Unknown tool: " + tool);
	        }
	    };
	    Item.prototype.parse = function (item) {
	        var input = [item.input.start.x, item.input.start.y, item.input.end.x, item.input.end.y];
	        var tool = item.tool.ctor || item.tool;
	        switch (tool) {
	            case "Line": {
	                var firstChars = this.getEdgeChar(item, true);
	                var lastChars = this.getEdgeChar(item, false);
	                return this.buildLine(input, firstChars, lastChars);
	            }
	            case "Rect": {
	                return this.buildRect(input);
	            }
	            case "RectLine": {
	                var firstChars = this.getEdgeChar(item, true);
	                var lastChars = this.getEdgeChar(item, false);
	                return this.buildRectLine(input, (item.direction._0 && item.direction._0.ctor) || item.direction, firstChars, lastChars);
	            }
	            default:
	                return { points: [], index: {} };
	        }
	    };
	    Item.prototype.shiftTo0 = function (item) {
	        var x = Math.min(item.input.start.x, item.input.end.x);
	        var y = Math.min(item.input.start.y, item.input.end.y);
	        return Object.assign({}, item, { input: {
	                start: { x: item.input.start.x - x, y: item.input.start.y - y },
	                end: { x: item.input.end.x - x, y: item.input.end.y - y }
	            } });
	    };
	    return Item;
	}());
	exports.Item = Item;
	function itemWithTextBoundingRect(item) {
	    var rect = itemBoundingRect(item);
	    var splittedText = item.text.split("\n");
	    var widthText = Math.max.apply(null, splittedText.map(function (str) { return str.length; }));
	    var heightText = splittedText.length;
	    if (rect.width < widthText) {
	        rect.x = rect.x - Math.round(widthText / 2 - rect.width / 2);
	        rect.width = widthText;
	    }
	    if (rect.height < heightText) {
	        rect.y = rect.y - Math.round(heightText / 2 - rect.height / 2);
	        rect.height = heightText;
	    }
	    return rect;
	}
	function itemBoundingRect(item) {
	    var x = Math.min(item.input.start.x, item.input.end.x);
	    var y = Math.min(item.input.start.y, item.input.end.y);
	    var width = Math.abs(item.input.start.x - item.input.end.x);
	    var height = Math.abs(item.input.start.y - item.input.end.y);
	    return { x: x, y: y, width: width, height: height };
	}
	exports.globalItem = new Item();
	window["Textik"] = window["Textik"] || {};
	window["Textik"]["globalItem"] = exports.globalItem;


/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	var __assign = (this && this.__assign) || Object.assign || function(t) {
	    for (var s, i = 1, n = arguments.length; i < n; i++) {
	        s = arguments[i];
	        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	            t[p] = s[p];
	    }
	    return t;
	};
	function repeatString(str, times) {
	    var result = "";
	    for (var i = 0; i < times; i += 1) {
	        result += str;
	    }
	    return result;
	}
	exports.repeatString = repeatString;
	function replace(result, x, y, character) {
	    var value = { v: character };
	    var key = [x, y];
	    result.points.forEach(function (point, i) {
	        if (point[0][0] === x && point[0][1] === y) {
	            result.points[i] = [key, value];
	        }
	    });
	    result.index[x + "_" + y] = value;
	}
	exports.replace = replace;
	function add(result, x, y, character) {
	    var value = { v: character };
	    var key = [x, y];
	    result.points.push([key, value]);
	    result.index[x + "_" + y] = value;
	}
	exports.add = add;
	function concat(result, other) {
	    result.points = result.points.concat(other.points);
	    result.index = __assign({}, result.index, other.index);
	}
	exports.concat = concat;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var firebase = __webpack_require__(9);
	var compress = __webpack_require__(11);
	var config = {
	    apiKey: "AIzaSyA58ZYxnK0eb41PCvqJWAC3suMLcnA-AvM",
	    authDomain: "textik-48365.firebaseapp.com",
	    databaseURL: "https://textik-48365.firebaseio.com",
	    storageBucket: "textik-48365.appspot.com",
	    messagingSenderId: "636072371544"
	};
	firebase.initializeApp(config);
	var database = firebase.database();
	var provider = new firebase.auth.GoogleAuthProvider();
	exports.auth = firebase.auth();
	function path() {
	    var rest = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        rest[_i] = arguments[_i];
	    }
	    var args = rest[0] instanceof Array
	        ? rest[0]
	        : Array.prototype.slice.call(rest);
	    return args.map(function (a) {
	        return a.toString().replace(/^\//, "").replace(/\/$/, "");
	    }).join("/");
	}
	function getProject(id) {
	    if (database) {
	        return database.ref(path("projects", id, "state")).once("value").then(function (data) {
	            if (data != null && data.val() != null) {
	                return JSON.parse(compress.decompress(data.val()));
	            }
	            else {
	                return null;
	            }
	        });
	    }
	    else {
	        return Promise.resolve(null);
	    }
	}
	exports.getProject = getProject;
	function authenticate() {
	    return exports.auth.signInWithPopup(provider);
	}
	exports.authenticate = authenticate;
	function updateUser(user) {
	    if (database) {
	        return database.ref(path("users", user.uid)).once("value").then(function (data) {
	            if (data == null || data.val() == null) {
	                return database.ref(path("users", user.uid)).set(user);
	            }
	            else {
	                return Promise.resolve(null);
	            }
	        });
	    }
	    else {
	        return Promise.resolve(null);
	    }
	}
	exports.updateUser = updateUser;
	function logOut() {
	    return exports.auth.signOut();
	}
	exports.logOut = logOut;
	function shareCoordinates(id, uid, coords) {
	    if (database) {
	        return database.ref(path("projects", id, "coordinates", uid)).set(coords);
	    }
	    else {
	        return Promise.resolve(null);
	    }
	}
	exports.shareCoordinates = shareCoordinates;
	function listenToCoordinates(id, callback) {
	    if (database) {
	        database.ref(path("projects", id, "coordinates")).on("value", callback);
	    }
	}
	exports.listenToCoordinates = listenToCoordinates;
	function getProjectList(user) {
	    return database.ref(path("users", user.uid, "projects")).once("value").then(function (value) {
	        var projectPromises = Object.keys((value && value.val()) || []).map(function (id) {
	            return database.ref(path("projects", id)).once("value").then(function (data) {
	                if (data != null && data.val() != null) {
	                    var project = data.val();
	                    var state = JSON.parse(compress.decompress(project.state));
	                    return {
	                        id: id,
	                        state: state,
	                        name: project.name
	                    };
	                }
	                else {
	                    return null;
	                }
	            });
	        });
	        return Promise.all(projectPromises);
	    });
	}
	exports.getProjectList = getProjectList;
	function saveProject(user, id, state, projectName, callback) {
	    if (database) {
	        var saveState = database
	            .ref(path("projects", id, "state"))
	            .set(compress.compress(JSON.stringify(state)), callback);
	        var projectNamePromise = database
	            .ref(path("projects", id, "name"))
	            .set(projectName);
	        var assignToUser = void 0;
	        if (user && !user.isGuest) {
	            assignToUser = database.ref(path("users", user.uid, "projects", id)).set(true);
	        }
	        else {
	            assignToUser = Promise.resolve(null);
	        }
	        return Promise.all([saveState, projectNamePromise, assignToUser]).then(function (_) { return null; });
	    }
	    else {
	        return Promise.resolve(null);
	    }
	}
	exports.saveProject = saveProject;
	function deleteProject(user, projectId) {
	    var removePromise = database.ref(path("projects", projectId)).remove();
	    var removeFromUserPromise;
	    if (user && !user.isGuest) {
	        removeFromUserPromise = database.ref(path("users", user.uid, "projects", projectId)).remove();
	    }
	    else {
	        removeFromUserPromise = Promise.resolve(null);
	    }
	    return Promise.all([removePromise, removeFromUserPromise]).then(function (_) { return null; });
	}
	exports.deleteProject = deleteProject;
	function listenToProject(id, callback) {
	    if (database) {
	        database.ref(path("projects", id, "state")).on("value", callback);
	    }
	}
	exports.listenToProject = listenToProject;
	function registerConnection(id, uid) {
	    if (database) {
	        return database.ref(path("projects", id, "connections")).push(uid).then(function (ref) {
	            ref.onDisconnect().remove();
	        }).then(function (_) { return null; });
	    }
	    else {
	        return Promise.resolve(null);
	    }
	}
	exports.registerConnection = registerConnection;
	function listenToConnections(id, callback) {
	    if (database) {
	        database.ref(path("projects", id, "connections")).on("value", callback);
	    }
	}
	exports.listenToConnections = listenToConnections;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (__webpack_require__(10))(2);

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var LZString = __webpack_require__(12);
	function compress(data) {
	    return LZString.compressToBase64(data);
	}
	exports.compress = compress;
	function decompress(data) {
	    return LZString.decompressFromBase64(data);
	}
	exports.decompress = decompress;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (__webpack_require__(10))(8);

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var CodeMirror = __webpack_require__(14);
	function textDimensions(text) {
	    var lines = text.split("\n");
	    var maxWidth = Math.max.apply(null, lines.map(function (l) { return l.length; }));
	    return { width: maxWidth, height: lines.length };
	}
	function buildEditorNode(isText) {
	    var textEditorNode = document.querySelector("#text-editor");
	    if (textEditorNode != null && textEditorNode.parentNode != null) {
	        try {
	            textEditorNode.parentNode.removeChild(textEditorNode);
	        }
	        catch (_) {
	        }
	    }
	    textEditorNode = document.createElement("div");
	    textEditorNode.setAttribute("id", "text-editor");
	    textEditorNode.classList.add("is-visible");
	    if (!isText) {
	        textEditorNode.classList.add("is-shape");
	    }
	    textEditorNode.addEventListener("keydown", function (e) { return e.stopPropagation(); });
	    return textEditorNode;
	}
	function repositionEditor(textEditorNode, value, bounds, letterSizePx, canvasOriginPx, scrollPositionPx, isText) {
	    var x;
	    var y;
	    if (isText) {
	        x = bounds.start.x * letterSizePx.width + canvasOriginPx.x - scrollPositionPx.x;
	        y = bounds.start.y * letterSizePx.height + canvasOriginPx.y - scrollPositionPx.y;
	    }
	    else {
	        var textDim = textDimensions(value);
	        var boundsWidth = Math.abs(bounds.end.x - bounds.start.x) + 1;
	        var boundsHeight = Math.abs(bounds.end.y - bounds.start.y) + 1;
	        x =
	            ((Math.floor(boundsWidth / 2) - Math.floor(textDim.width / 2)) + Math.min(bounds.start.x, bounds.end.x))
	                * letterSizePx.width
	                + canvasOriginPx.x
	                - scrollPositionPx.x;
	        y =
	            ((Math.floor(boundsHeight / 2) - Math.floor(textDim.height / 2)) + Math.min(bounds.start.y, bounds.end.y))
	                * letterSizePx.height
	                + canvasOriginPx.y
	                - scrollPositionPx.y;
	    }
	    textEditorNode.style.left = x + "px";
	    textEditorNode.style.top = y + "px";
	}
	function showTextEditor(payload, onDone) {
	    var value = payload.value;
	    var isText = payload.isText;
	    var bounds = payload.bounds;
	    var canvasOriginPx = payload.canvasOriginPx;
	    var letterSizePx = payload.letterSizePx;
	    var scrollPositionPx = payload.scrollPositionPx;
	    var textEditorNode = buildEditorNode(isText);
	    repositionEditor(textEditorNode, value, bounds, letterSizePx, canvasOriginPx, scrollPositionPx, isText);
	    var content = document.querySelector("#content");
	    if (content != null) {
	        content.appendChild(textEditorNode);
	        var cm_1 = CodeMirror(textEditorNode, {
	            lineWrapping: true,
	            mode: "text/plain",
	            value: value,
	            smartIndent: false,
	            electricChars: false
	        });
	        cm_1.on("change", function () {
	            var text = cm_1.getValue();
	            repositionEditor(textEditorNode, text, bounds, letterSizePx, canvasOriginPx, scrollPositionPx, isText);
	        });
	        cm_1.on("blur", function () {
	            var newValue = cm_1.getValue();
	            if (textEditorNode.parentNode != null) {
	                textEditorNode.parentNode.removeChild(textEditorNode);
	            }
	            onDone(newValue);
	        });
	        cm_1.on("keyHandled", function (_, __, event) {
	            if (event.keyCode === 27) {
	                cm_1.getInputField().blur();
	            }
	        });
	        cm_1.focus();
	        cm_1.execCommand("goDocEnd");
	    }
	}
	exports.showTextEditor = showTextEditor;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (__webpack_require__(10))(1);

/***/ }
/******/ ])
});
;
//# sourceMappingURL=index.js.map