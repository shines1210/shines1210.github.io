// \0rolldown/runtime.js
var __create = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp$1.call(to, key) && key !== except) __defProp$1(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp$1.call(mod, "default") ? __defProp$1(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
// node_modules/scheduler/cjs/scheduler.production.js
/**
* @license React
* scheduler.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_scheduler_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	function push(heap, node) {
		var index = heap.length;
		heap.push(node);
		a: for (; 0 < index;) {
			var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
			if (0 < compare(parent, node)) heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
			else break a;
		}
	}
	function peek(heap) {
		return 0 === heap.length ? null : heap[0];
	}
	function pop(heap) {
		if (0 === heap.length) return null;
		var first = heap[0], last = heap.pop();
		if (last !== first) {
			heap[0] = last;
			a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength;) {
				var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
				if (0 > compare(left, last)) rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
				else if (rightIndex < length && 0 > compare(right, last)) heap[index] = right, heap[rightIndex] = last, index = rightIndex;
				else break a;
			}
		}
		return first;
	}
	function compare(a, b) {
		var diff = a.sortIndex - b.sortIndex;
		return 0 !== diff ? diff : a.id - b.id;
	}
	exports.unstable_now = void 0;
	if ("object" === typeof performance && "function" === typeof performance.now) {
		var localPerformance = performance;
		exports.unstable_now = function() {
			return localPerformance.now();
		};
	} else {
		var localDate = Date, initialTime = localDate.now();
		exports.unstable_now = function() {
			return localDate.now() - initialTime;
		};
	}
	var taskQueue = [];
	var timerQueue = [];
	var taskIdCounter = 1;
	var currentTask = null;
	var currentPriorityLevel = 3;
	var isPerformingWork = !1;
	var isHostCallbackScheduled = !1;
	var isHostTimeoutScheduled = !1;
	var needsPaint = !1;
	var localSetTimeout = "function" === typeof setTimeout ? setTimeout : null;
	var localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null;
	var localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
	function advanceTimers(currentTime) {
		for (var timer = peek(timerQueue); null !== timer;) {
			if (null === timer.callback) pop(timerQueue);
			else if (timer.startTime <= currentTime) pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
			else break;
			timer = peek(timerQueue);
		}
	}
	function handleTimeout(currentTime) {
		isHostTimeoutScheduled = !1;
		advanceTimers(currentTime);
		if (!isHostCallbackScheduled) if (null !== peek(taskQueue)) isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline());
		else {
			var firstTimer = peek(timerQueue);
			null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
		}
	}
	var isMessageLoopRunning = !1;
	var taskTimeoutID = -1;
	var frameInterval = 5;
	var startTime = -1;
	function shouldYieldToHost() {
		return needsPaint ? !0 : exports.unstable_now() - startTime < frameInterval ? !1 : !0;
	}
	function performWorkUntilDeadline() {
		needsPaint = !1;
		if (isMessageLoopRunning) {
			var currentTime = exports.unstable_now();
			startTime = currentTime;
			var hasMoreWork = !0;
			try {
				a: {
					isHostCallbackScheduled = !1;
					isHostTimeoutScheduled && (isHostTimeoutScheduled = !1, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
					isPerformingWork = !0;
					var previousPriorityLevel = currentPriorityLevel;
					try {
						b: {
							advanceTimers(currentTime);
							for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost());) {
								var callback = currentTask.callback;
								if ("function" === typeof callback) {
									currentTask.callback = null;
									currentPriorityLevel = currentTask.priorityLevel;
									var continuationCallback = callback(currentTask.expirationTime <= currentTime);
									currentTime = exports.unstable_now();
									if ("function" === typeof continuationCallback) {
										currentTask.callback = continuationCallback;
										advanceTimers(currentTime);
										hasMoreWork = !0;
										break b;
									}
									currentTask === peek(taskQueue) && pop(taskQueue);
									advanceTimers(currentTime);
								} else pop(taskQueue);
								currentTask = peek(taskQueue);
							}
							if (null !== currentTask) hasMoreWork = !0;
							else {
								var firstTimer = peek(timerQueue);
								null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
								hasMoreWork = !1;
							}
						}
						break a;
					} finally {
						currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = !1;
					}
					hasMoreWork = void 0;
				}
			} finally {
				hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = !1;
			}
		}
	}
	var schedulePerformWorkUntilDeadline;
	if ("function" === typeof localSetImmediate) schedulePerformWorkUntilDeadline = function() {
		localSetImmediate(performWorkUntilDeadline);
	};
	else if ("undefined" !== typeof MessageChannel) {
		var channel = new MessageChannel(), port = channel.port2;
		channel.port1.onmessage = performWorkUntilDeadline;
		schedulePerformWorkUntilDeadline = function() {
			port.postMessage(null);
		};
	} else schedulePerformWorkUntilDeadline = function() {
		localSetTimeout(performWorkUntilDeadline, 0);
	};
	function requestHostTimeout(callback, ms) {
		taskTimeoutID = localSetTimeout(function() {
			callback(exports.unstable_now());
		}, ms);
	}
	exports.unstable_IdlePriority = 5;
	exports.unstable_ImmediatePriority = 1;
	exports.unstable_LowPriority = 4;
	exports.unstable_NormalPriority = 3;
	exports.unstable_Profiling = null;
	exports.unstable_UserBlockingPriority = 2;
	exports.unstable_cancelCallback = function(task) {
		task.callback = null;
	};
	exports.unstable_forceFrameRate = function(fps) {
		0 > fps || 125 < fps ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
	};
	exports.unstable_getCurrentPriorityLevel = function() {
		return currentPriorityLevel;
	};
	exports.unstable_next = function(eventHandler) {
		switch (currentPriorityLevel) {
			case 1:
			case 2:
			case 3:
				var priorityLevel = 3;
				break;
			default: priorityLevel = currentPriorityLevel;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_requestPaint = function() {
		needsPaint = !0;
	};
	exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
		switch (priorityLevel) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: priorityLevel = 3;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
		var currentTime = exports.unstable_now();
		"object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
		switch (priorityLevel) {
			case 1:
				var timeout = -1;
				break;
			case 2:
				timeout = 250;
				break;
			case 5:
				timeout = 1073741823;
				break;
			case 4:
				timeout = 1e4;
				break;
			default: timeout = 5e3;
		}
		timeout = options + timeout;
		priorityLevel = {
			id: taskIdCounter++,
			callback,
			priorityLevel,
			startTime: options,
			expirationTime: timeout,
			sortIndex: -1
		};
		options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = !0, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline())));
		return priorityLevel;
	};
	exports.unstable_shouldYield = shouldYieldToHost;
	exports.unstable_wrapCallback = function(callback) {
		var parentPriorityLevel = currentPriorityLevel;
		return function() {
			var previousPriorityLevel = currentPriorityLevel;
			currentPriorityLevel = parentPriorityLevel;
			try {
				return callback.apply(this, arguments);
			} finally {
				currentPriorityLevel = previousPriorityLevel;
			}
		};
	};
}));
// node_modules/scheduler/index.js
var require_scheduler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_scheduler_production();
}));
// node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	};
	var assign = Object.assign;
	var emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	};
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result, thenable = ctor();
			thenable.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject, void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error, void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			});
			-1 === payload._status && (payload._status = 0, payload._result = thenable);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	function startTransition(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		currentTransition.types = null !== prevTransition ? prevTransition.types : null;
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	}
	function addTransitionType(type) {
		var transition = ReactSharedInternals.T;
		if (null !== transition) {
			var transitionTypes = transition.types;
			null === transitionTypes ? transition.types = [type] : -1 === transitionTypes.indexOf(type) && transitionTypes.push(type);
		} else startTransition(addTransitionType.bind(null, type));
	}
	var Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.addTransitionType = addTransitionType;
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = startTransition;
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.3.1";
}));
// node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
// node_modules/react-dom/cjs/react-dom.production.js
/**
* @license React
* react-dom.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function noop() {}
	var Internals = {
		d: {
			f: noop,
			r: function() {
				throw Error(formatProdErrorMessage(522));
			},
			D: noop,
			C: noop,
			L: noop,
			m: noop,
			X: noop,
			S: noop,
			M: noop
		},
		p: 0,
		findDOMNode: null
	};
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_RECOVERABLE_TYPE = Symbol.for("react.recoverable");
	var REACT_OPTIMISTIC_KEY = Symbol.for("react.optimistic_key");
	function createPortal$1(children, containerInfo, implementation) {
		var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
		return {
			$$typeof: REACT_PORTAL_TYPE,
			key: null == key ? null : key === REACT_OPTIMISTIC_KEY ? REACT_OPTIMISTIC_KEY : "" + key,
			children,
			containerInfo,
			implementation
		};
	}
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function getCrossOriginStringAs(as, input) {
		if ("font" === as) return "";
		if ("string" === typeof input) return "use-credentials" === input ? input : "";
	}
	exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
	exports.browser = function(reason) {
		return {
			$$typeof: REACT_RECOVERABLE_TYPE,
			_reason: reason
		};
	};
	exports.createPortal = function(children, container) {
		var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
		if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType) throw Error(formatProdErrorMessage(299));
		return createPortal$1(children, container, null, key);
	};
	exports.flushSync = function(fn) {
		var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
		try {
			if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
		} finally {
			ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
		}
	};
	exports.preconnect = function(href, options) {
		"string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
	};
	exports.prefetchDNS = function(href) {
		"string" === typeof href && Internals.d.D(href);
	};
	exports.preinit = function(href, options) {
		if ("string" === typeof href && options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
			"style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
				crossOrigin,
				integrity,
				fetchPriority
			}) : "script" === as && Internals.d.X(href, {
				crossOrigin,
				integrity,
				fetchPriority,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0
			});
		}
	};
	exports.preinitModule = function(href, options) {
		if ("string" === typeof href) if ("object" === typeof options && null !== options) {
			if (null == options.as || "script" === options.as) {
				var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
				Internals.d.M(href, {
					crossOrigin,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0,
					fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
				});
			}
		} else options ?? Internals.d.M(href);
	};
	exports.preload = function(href, options) {
		if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
			Internals.d.L(href, as, {
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				type: "string" === typeof options.type ? options.type : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
				referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
				imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
				imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
				media: "string" === typeof options.media ? options.media : void 0
			});
		}
	};
	exports.preloadModule = function(href, options) {
		if ("string" === typeof href) if (options) {
			var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
			Internals.d.m(href, {
				as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
			});
		} else Internals.d.m(href);
	};
	exports.requestFormReset = function(form) {
		Internals.d.r(form);
	};
	exports.unstable_batchedUpdates = function(fn, a) {
		return fn(a);
	};
	exports.useFormState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useFormState(action, initialState, permalink);
	};
	exports.useFormStatus = function() {
		return ReactSharedInternals.H.useHostTransitionStatus();
	};
	exports.version = "19.3.1";
}));
// node_modules/react-dom/index.js
var require_react_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_production();
}));
// node_modules/react-dom/cjs/react-dom-client.production.js
/**
* @license React
* react-dom-client.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_client_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scheduler = require_scheduler();
	var React = require_react();
	var ReactDOM = require_react_dom();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function isValidContainer(node) {
		return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
	}
	function getNearestMountedFiber(fiber) {
		for (var node = fiber, nextNode = node; nextNode && !nextNode.alternate;) node = nextNode, 0 !== (node.flags & 4098) && (fiber = node.return), nextNode = node.return;
		for (; node.return;) node = node.return;
		return 3 === node.tag ? fiber : null;
	}
	function getSuspenseInstanceFromFiber(fiber) {
		if (13 === fiber.tag) {
			var suspenseState = fiber.memoizedState;
			null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
			if (null !== suspenseState) return suspenseState.dehydrated;
		}
		return null;
	}
	function getActivityInstanceFromFiber(fiber) {
		if (31 === fiber.tag) {
			var activityState = fiber.memoizedState;
			null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
			if (null !== activityState) return activityState.dehydrated;
		}
		return null;
	}
	function assertIsMounted(fiber) {
		if (getNearestMountedFiber(fiber) !== fiber) throw Error(formatProdErrorMessage(188));
	}
	function findCurrentFiberUsingSlowPath(fiber) {
		var alternate = fiber.alternate;
		if (!alternate) {
			alternate = getNearestMountedFiber(fiber);
			if (null === alternate) throw Error(formatProdErrorMessage(188));
			return alternate !== fiber ? null : fiber;
		}
		for (var a = fiber, b = alternate;;) {
			var parentA = a.return;
			if (null === parentA) break;
			var parentB = parentA.alternate;
			if (null === parentB) {
				b = parentA.return;
				if (null !== b) {
					a = b;
					continue;
				}
				break;
			}
			if (parentA.child === parentB.child) {
				for (parentB = parentA.child; parentB;) {
					if (parentB === a) return assertIsMounted(parentA), fiber;
					if (parentB === b) return assertIsMounted(parentA), alternate;
					parentB = parentB.sibling;
				}
				throw Error(formatProdErrorMessage(188));
			}
			if (a.return !== b.return) a = parentA, b = parentB;
			else {
				for (var didFindChild = !1, child$0 = parentA.child; child$0;) {
					if (child$0 === a) {
						didFindChild = !0;
						a = parentA;
						b = parentB;
						break;
					}
					if (child$0 === b) {
						didFindChild = !0;
						b = parentA;
						a = parentB;
						break;
					}
					child$0 = child$0.sibling;
				}
				if (!didFindChild) {
					for (child$0 = parentB.child; child$0;) {
						if (child$0 === a) {
							didFindChild = !0;
							a = parentB;
							b = parentA;
							break;
						}
						if (child$0 === b) {
							didFindChild = !0;
							b = parentB;
							a = parentA;
							break;
						}
						child$0 = child$0.sibling;
					}
					if (!didFindChild) throw Error(formatProdErrorMessage(189));
				}
			}
			if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
		}
		if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
		return a.stateNode.current === a ? fiber : alternate;
	}
	function findCurrentHostFiberImpl(node) {
		var tag = node.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
		for (node = node.child; null !== node;) {
			tag = findCurrentHostFiberImpl(node);
			if (null !== tag) return tag;
			node = node.sibling;
		}
		return null;
	}
	function traverseVisibleInstancesAndTextInstances(child, searchWithinHosts, fn, a, b, c) {
		for (; null !== child;) {
			if ((5 === child.tag || 27 === child.tag || 6 === child.tag) && fn(child, a, b, c) || (22 !== child.tag || null === child.memoizedState) && (searchWithinHosts || 5 !== child.tag && 27 !== child.tag) && traverseVisibleInstancesAndTextInstances(child.child, searchWithinHosts, fn, a, b, c)) return !0;
			child = child.sibling;
		}
		return !1;
	}
	function getFragmentParentInstanceOrContainerFiber(fiber) {
		for (fiber = fiber.return; null !== fiber;) {
			if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) return fiber;
			fiber = fiber.return;
		}
		return null;
	}
	function fiberIsPortaledIntoHost(fiber) {
		var foundPortalParent = !1;
		for (fiber = fiber.return; null !== fiber;) {
			4 === fiber.tag && (foundPortalParent = !0);
			if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) break;
			fiber = fiber.return;
		}
		return foundPortalParent;
	}
	function getFragmentInstanceOrTextInstanceSiblings(fiber) {
		var result = [null, null], parentHostFiber = getFragmentParentInstanceOrContainerFiber(fiber);
		if (null === parentHostFiber) return result;
		findFragmentInstanceOrTextInstanceSiblings(result, fiber, parentHostFiber.child, { foundSelf: !1 });
		return result;
	}
	function findFragmentInstanceOrTextInstanceSiblings(result, self, child, state) {
		for (; null !== child;) {
			if (child === self) state.foundSelf = !0;
			else if (5 === child.tag || 27 === child.tag || 6 === child.tag) {
				if (state.foundSelf) return result[1] = child, !0;
				result[0] = child;
			} else if ((22 !== child.tag || null === child.memoizedState) && findFragmentInstanceOrTextInstanceSiblings(result, self, child.child, state)) return !0;
			child = child.sibling;
		}
		return !1;
	}
	function getInstanceFromHostFiber(fiber) {
		switch (fiber.tag) {
			case 5:
			case 27:
			case 6: return fiber.stateNode;
			case 3: return fiber.stateNode.containerInfo;
			default: throw Error(formatProdErrorMessage(559));
		}
	}
	var searchTarget = null;
	var searchBoundary = null;
	function isFiberPrecedingCheck(child, target, boundary) {
		return child === boundary ? !0 : child === target ? (searchTarget = child, !0) : !1;
	}
	function isFiberFollowingCheck(child, target, boundary) {
		return child === boundary ? (searchBoundary = child, !1) : child === target ? (null !== searchBoundary && (searchTarget = child), !0) : !1;
	}
	function getParentForFragmentAncestors(inst) {
		if (null === inst) return null;
		do
			inst = null === inst ? null : inst.return;
		while (inst && 5 !== inst.tag && 27 !== inst.tag && 3 !== inst.tag);
		return inst ? inst : null;
	}
	function getLowestCommonAncestor(instA, instB, getParent) {
		for (var depthA = 0, tempA = instA; tempA; tempA = getParent(tempA)) depthA++;
		tempA = 0;
		for (var tempB = instB; tempB; tempB = getParent(tempB)) tempA++;
		for (; 0 < depthA - tempA;) instA = getParent(instA), depthA--;
		for (; 0 < tempA - depthA;) instB = getParent(instB), tempA--;
		for (; depthA--;) {
			if (instA === instB || null !== instB && instA === instB.alternate) return instA;
			instA = getParent(instA);
			instB = getParent(instB);
		}
		return null;
	}
	var assign = Object.assign;
	var REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element");
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden");
	var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
	var REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition");
	var REACT_RECOVERABLE_TYPE = Symbol.for("react.recoverable");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
	function getComponentNameFromType(type) {
		if (null == type) return null;
		if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
		if ("string" === typeof type) return type;
		switch (type) {
			case REACT_FRAGMENT_TYPE: return "Fragment";
			case REACT_PROFILER_TYPE: return "Profiler";
			case REACT_STRICT_MODE_TYPE: return "StrictMode";
			case REACT_SUSPENSE_TYPE: return "Suspense";
			case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
			case REACT_ACTIVITY_TYPE: return "Activity";
			case REACT_VIEW_TRANSITION_TYPE: return "ViewTransition";
		}
		if ("object" === typeof type) switch (type.$$typeof) {
			case REACT_PORTAL_TYPE: return "Portal";
			case REACT_CONTEXT_TYPE: return type.displayName || "Context";
			case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
			case REACT_FORWARD_REF_TYPE:
				var innerType = type.render;
				type = type.displayName;
				type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
				return type;
			case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
			case REACT_LAZY_TYPE:
				innerType = type._payload;
				type = type._init;
				try {
					return getComponentNameFromType(type(innerType));
				} catch (x) {}
		}
		return null;
	}
	var isArrayImpl = Array.isArray;
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	var sharedNotPendingObject = {
		pending: !1,
		data: null,
		method: null,
		action: null
	};
	var valueStack = [];
	var index = -1;
	function createCursor(defaultValue) {
		return { current: defaultValue };
	}
	function pop(cursor) {
		0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
	}
	function push(cursor, value) {
		index++;
		valueStack[index] = cursor.current;
		cursor.current = value;
	}
	var contextStackCursor = createCursor(null);
	var contextFiberStackCursor = createCursor(null);
	var rootInstanceStackCursor = createCursor(null);
	var hostTransitionProviderCursor = createCursor(null);
	function pushHostContainer(fiber, nextRootInstance) {
		push(rootInstanceStackCursor, nextRootInstance);
		push(contextFiberStackCursor, fiber);
		push(contextStackCursor, null);
		switch (nextRootInstance.nodeType) {
			case 9:
			case 11:
				fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
				break;
			default: if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI) nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
			else switch (fiber) {
				case "svg":
					fiber = 1;
					break;
				case "math":
					fiber = 2;
					break;
				default: fiber = 0;
			}
		}
		pop(contextStackCursor);
		push(contextStackCursor, fiber);
	}
	function popHostContainer() {
		pop(contextStackCursor);
		pop(contextFiberStackCursor);
		pop(rootInstanceStackCursor);
	}
	function pushHostContext(fiber) {
		var stateHook = fiber.memoizedState;
		null !== stateHook && (HostTransitionContext._currentValue = stateHook.memoizedState, push(hostTransitionProviderCursor, fiber));
		stateHook = contextStackCursor.current;
		var JSCompiler_inline_result = getChildHostContextProd(stateHook, fiber.type);
		stateHook !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
	}
	function popHostContext(fiber) {
		contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
		hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
	}
	var prefix;
	var suffix;
	function describeBuiltInComponentFrame(name) {
		if (void 0 === prefix) try {
			throw Error();
		} catch (x) {
			var match = x.stack.trim().match(/\n( *(at )?)/);
			prefix = match && match[1] || "";
			suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + prefix + name + suffix;
	}
	var reentry = !1;
	function describeNativeComponentFrame(fn, construct) {
		if (!fn || reentry) return "";
		reentry = !0;
		var previousPrepareStackTrace = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var RunInRootFrame = { DetermineComponentFrameRoot: function() {
				try {
					if (construct) {
						var Fake = function() {
							throw Error();
						};
						Object.defineProperty(Fake.prototype, "props", { set: function() {
							throw Error();
						} });
						if ("object" === typeof Reflect && Reflect.construct) {
							try {
								Reflect.construct(Fake, []);
							} catch (x) {
								var control = x;
							}
							Reflect.construct(fn, [], Fake);
						} else {
							try {
								Fake.call();
							} catch (x$1) {
								control = x$1;
							}
							Fake = !1;
							try {
								var prevProps = Object.getOwnPropertyDescriptor(fn.prototype, "props");
								Object.defineProperty(fn.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								});
								Fake = !0;
								new fn();
							} finally {
								Fake && (void 0 !== prevProps ? Object.defineProperty(fn.prototype, "props", prevProps) : delete fn.prototype.props);
							}
						}
					} else {
						try {
							throw Error();
						} catch (x$2) {
							control = x$2;
						}
						(Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {});
					}
				} catch (sample) {
					if (sample && control && "string" === typeof sample.stack) return [sample.stack, control.stack];
				}
				return [null, null];
			} };
			RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
			namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
			if (sampleStack && controlStack) {
				var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
				for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");) RunInRootFrame++;
				for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot");) namePropDescriptor++;
				if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length) for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];) namePropDescriptor--;
				for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--) if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
					if (1 !== RunInRootFrame || 1 !== namePropDescriptor) do
						if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
							var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
							fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
							return frame;
						}
					while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
					break;
				}
			}
		} finally {
			reentry = !1, Error.prepareStackTrace = previousPrepareStackTrace;
		}
		return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
	}
	function describeFiber(fiber, childFiber) {
		switch (fiber.tag) {
			case 26:
			case 27:
			case 5: return describeBuiltInComponentFrame(fiber.type);
			case 16: return describeBuiltInComponentFrame("Lazy");
			case 13: return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
			case 19: return describeBuiltInComponentFrame("SuspenseList");
			case 0:
			case 15: return describeNativeComponentFrame(fiber.type, !1);
			case 11: return describeNativeComponentFrame(fiber.type.render, !1);
			case 1: return describeNativeComponentFrame(fiber.type, !0);
			case 31: return describeBuiltInComponentFrame("Activity");
			case 30: return describeBuiltInComponentFrame("ViewTransition");
			default: return "";
		}
	}
	function getStackByFiberInDevAndProd(workInProgress) {
		try {
			var info = "", previous = null;
			do
				info += describeFiber(workInProgress, previous), previous = workInProgress, workInProgress = workInProgress.return;
			while (workInProgress);
			return info;
		} catch (x) {
			return "\nError generating stack: " + x.message + "\n" + x.stack;
		}
	}
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var scheduleCallback$3 = Scheduler.unstable_scheduleCallback;
	var cancelCallback$1 = Scheduler.unstable_cancelCallback;
	var shouldYield = Scheduler.unstable_shouldYield;
	var requestPaint = Scheduler.unstable_requestPaint;
	var now = Scheduler.unstable_now;
	var getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
	var ImmediatePriority = Scheduler.unstable_ImmediatePriority;
	var UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
	var NormalPriority$1 = Scheduler.unstable_NormalPriority;
	var LowPriority = Scheduler.unstable_LowPriority;
	var IdlePriority = Scheduler.unstable_IdlePriority;
	var log$1 = Scheduler.log;
	var unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;
	var rendererID = null;
	var injectedHook = null;
	function setIsStrictModeForDevtools(newIsStrictMode) {
		"function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
		if (injectedHook && "function" === typeof injectedHook.setStrictMode) try {
			injectedHook.setStrictMode(rendererID, newIsStrictMode);
		} catch (err) {}
	}
	var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
	var log = Math.log;
	var LN2 = Math.LN2;
	function clz32Fallback(x) {
		x >>>= 0;
		return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
	}
	var nextTransitionUpdateLane = 256;
	var nextTransitionDeferredLane = 262144;
	var nextRetryLane = 4194304;
	function getHighestPriorityLanes(lanes) {
		var pendingSyncLanes = lanes & 42;
		if (0 !== pendingSyncLanes) return pendingSyncLanes;
		switch (lanes & -lanes) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return lanes & -lanes;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return lanes & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return lanes & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return lanes;
		}
	}
	function getNextLanes(root, wipLanes, rootHasPendingCommit) {
		var pendingLanes = root.pendingLanes;
		if (0 === pendingLanes) return 0;
		var nextLanes = 0, suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes;
		root = root.warmLanes;
		var nonIdlePendingLanes = pendingLanes & 134217727;
		0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
		return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
	}
	function checkIfRootIsPrerendering(root, renderLanes) {
		return 0 === (root.pendingLanes & ~(root.suspendedLanes & ~root.pingedLanes) & renderLanes);
	}
	function getEntangledLanes(root, renderLanes) {
		0 !== (renderLanes & 8) && (renderLanes |= renderLanes & 32);
		var allEntangledLanes = root.entangledLanes;
		if (0 !== allEntangledLanes) for (root = root.entanglements, allEntangledLanes &= renderLanes; 0 < allEntangledLanes;) {
			var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
			renderLanes |= root[index$4];
			allEntangledLanes &= ~lane;
		}
		return renderLanes;
	}
	function computeExpirationTime(lane, currentTime) {
		switch (lane) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return currentTime + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return currentTime + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function claimNextRetryLane() {
		var lane = nextRetryLane;
		nextRetryLane <<= 1;
		0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
		return lane;
	}
	function createLaneMap(initial) {
		for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
		return laneMap;
	}
	function markRootUpdated$1(root, updateLane) {
		root.pendingLanes |= updateLane;
		268435456 !== updateLane && (root.suspendedLanes = 0, root.pingedLanes = 0, root.warmLanes = 0);
	}
	function markRootFinished(root, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
		var previouslyPendingLanes = root.pendingLanes;
		root.pendingLanes = remainingLanes;
		root.suspendedLanes = 0;
		root.pingedLanes = 0;
		root.warmLanes = 0;
		root.expiredLanes &= remainingLanes;
		root.entangledLanes &= remainingLanes;
		root.errorRecoveryDisabledLanes &= remainingLanes;
		root.shellSuspendCounter = 0;
		var entanglements = root.entanglements, expirationTimes = root.expirationTimes, hiddenUpdates = root.hiddenUpdates;
		for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes;) {
			var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
			entanglements[index$7] = 0;
			expirationTimes[index$7] = -1;
			var hiddenUpdatesForLane = hiddenUpdates[index$7];
			if (null !== hiddenUpdatesForLane) for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
				var update = hiddenUpdatesForLane[index$7];
				null !== update && (update.lane &= -536870913);
			}
			remainingLanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, 0);
		0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root.tag && (root.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
	}
	function markSpawnedDeferredLane(root, spawnedLane, entangledLanes) {
		root.pendingLanes |= spawnedLane;
		root.suspendedLanes &= ~spawnedLane;
		var spawnedLaneIndex = 31 - clz32(spawnedLane);
		root.entangledLanes |= spawnedLane;
		root.entanglements[spawnedLaneIndex] = root.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
	}
	function markRootEntangled(root, entangledLanes) {
		var rootEntangledLanes = root.entangledLanes |= entangledLanes;
		for (root = root.entanglements; rootEntangledLanes;) {
			var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
			lane & entangledLanes | root[index$8] & entangledLanes && (root[index$8] |= entangledLanes);
			rootEntangledLanes &= ~lane;
		}
	}
	function getBumpedLaneForHydration(root, renderLanes) {
		var renderLane = renderLanes & -renderLanes;
		renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
		return 0 !== (renderLane & (root.suspendedLanes | renderLanes)) ? 0 : renderLane;
	}
	function getBumpedLaneForHydrationByLane(lane) {
		switch (lane) {
			case 2:
				lane = 1;
				break;
			case 8:
				lane = 4;
				break;
			case 32:
				lane = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				lane = 128;
				break;
			case 268435456:
				lane = 134217728;
				break;
			default: lane = 0;
		}
		return lane;
	}
	function lanesToEventPriority(lanes) {
		lanes &= -lanes;
		return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
	}
	function resolveUpdatePriority() {
		var updatePriority = ReactDOMSharedInternals.p;
		if (0 !== updatePriority) return updatePriority;
		updatePriority = window.event;
		return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
	}
	function runWithPriority(priority, fn) {
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			return ReactDOMSharedInternals.p = priority, fn();
		} finally {
			ReactDOMSharedInternals.p = previousPriority;
		}
	}
	var randomKey = Math.random().toString(36).slice(2);
	var internalInstanceKey = "__reactFiber$" + randomKey;
	var internalPropsKey = "__reactProps$" + randomKey;
	var internalContainerInstanceKey = "__reactContainer$" + randomKey;
	var internalEventHandlersKey = "__reactEvents$" + randomKey;
	var internalEventHandlerListenersKey = "__reactListeners$" + randomKey;
	var internalEventHandlesSetKey = "__reactHandles$" + randomKey;
	var internalRootNodeResourcesKey = "__reactResources$" + randomKey;
	var internalHoistableMarker = "__reactMarker$" + randomKey;
	var internalLoadPendingKey = "__reactLoad$" + randomKey;
	function detachDeletedInstance(node) {
		delete node[internalInstanceKey];
		delete node[internalPropsKey];
		delete node[internalEventHandlerListenersKey];
		delete node[internalEventHandlesSetKey];
	}
	function getClosestInstanceFromNode(targetNode) {
		var targetInst;
		if (targetInst = targetNode[internalInstanceKey]) return targetInst;
		for (var parentNode = targetNode.parentNode; parentNode;) {
			if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
				parentNode = targetInst.alternate;
				if (null !== targetInst.child || null !== parentNode && null !== parentNode.child) for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode;) {
					if (parentNode = targetNode[internalInstanceKey]) return parentNode;
					targetNode = getParentHydrationBoundary(targetNode);
				}
				return targetInst;
			}
			targetNode = parentNode;
			parentNode = targetNode.parentNode;
		}
		return null;
	}
	function getInstanceFromNode(node) {
		if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
			var tag = node.tag;
			if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag) return node;
		}
		return null;
	}
	function getNodeFromInstance(inst) {
		var tag = inst.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
		throw Error(formatProdErrorMessage(33));
	}
	function getResourcesFromRoot(root) {
		var resources = root[internalRootNodeResourcesKey];
		resources || (resources = root[internalRootNodeResourcesKey] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		});
		return resources;
	}
	function markNodeAsHoistable(node) {
		node[internalHoistableMarker] = !0;
	}
	function clearPendingLoadOnNode(node) {
		node[internalLoadPendingKey] = void 0;
	}
	var allNativeEvents = /* @__PURE__ */ new Set();
	var registrationNameDependencies = {};
	function registerTwoPhaseEvent(registrationName, dependencies) {
		registerDirectEvent(registrationName, dependencies);
		registerDirectEvent(registrationName + "Capture", dependencies);
	}
	function registerDirectEvent(registrationName, dependencies) {
		registrationNameDependencies[registrationName] = dependencies;
		for (registrationName = 0; registrationName < dependencies.length; registrationName++) allNativeEvents.add(dependencies[registrationName]);
	}
	var VALID_ATTRIBUTE_NAME_REGEX = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$");
	var illegalAttributeNameCache = {};
	var validatedAttributeNameCache = {};
	function isAttributeNameSafe(attributeName) {
		if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) return !0;
		if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
		if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) return validatedAttributeNameCache[attributeName] = !0;
		illegalAttributeNameCache[attributeName] = !0;
		return !1;
	}
	var viewTransitionMutationContext = !1;
	function pushMutationContext() {
		var prev = viewTransitionMutationContext;
		viewTransitionMutationContext = !1;
		return prev;
	}
	function setValueForAttribute(node, name, value) {
		if (isAttributeNameSafe(name)) if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
					node.removeAttribute(name);
					return;
				case "boolean":
					var prefix$10 = name.toLowerCase().slice(0, 5);
					if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
						node.removeAttribute(name);
						return;
					}
			}
			node.setAttribute(name, value);
		}
	}
	function setValueForKnownAttribute(node, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttribute(name, value);
		}
	}
	function setValueForNamespacedAttribute(node, namespace, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttributeNS(namespace, name, value);
		}
	}
	function getToStringValue(value) {
		switch (typeof value) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return value;
			case "object": return value;
			default: return "";
		}
	}
	function isCheckable(elem) {
		var type = elem.type;
		return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
	}
	function trackValueOnNode(node, valueField, currentValue) {
		var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
		if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
			var get = descriptor.get, set = descriptor.set;
			Object.defineProperty(node, valueField, {
				configurable: !0,
				get: function() {
					return get.call(this);
				},
				set: function(value) {
					currentValue = "" + value;
					set.call(this, value);
				}
			});
			Object.defineProperty(node, valueField, { enumerable: descriptor.enumerable });
			return {
				getValue: function() {
					return currentValue;
				},
				setValue: function(value) {
					currentValue = "" + value;
				},
				stopTracking: function() {
					node._valueTracker = null;
					delete node[valueField];
				}
			};
		}
	}
	function track(node) {
		if (!node._valueTracker) {
			var valueField = isCheckable(node) ? "checked" : "value";
			node._valueTracker = trackValueOnNode(node, valueField, "" + node[valueField]);
		}
	}
	function updateValueIfChanged(node) {
		if (!node) return !1;
		var tracker = node._valueTracker;
		if (!tracker) return !0;
		var lastValue = tracker.getValue();
		var value = "";
		node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
		node = value;
		return node !== lastValue ? (tracker.setValue(node), !0) : !1;
	}
	var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
	function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
		return value.replace(escapeSelectorAttributeValueInsideDoubleQuotesRegex, function(ch) {
			return "\\" + ch.charCodeAt(0).toString(16) + " ";
		});
	}
	function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
		element.name = "";
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
		if (null != value) if ("number" === type) {
			if (0 === value && "" === element.value || element.value != value) element.value = "" + getToStringValue(value);
		} else element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
		else "submit" !== type && "reset" !== type || element.removeAttribute("value");
		null != value ? "number" === type && element.value == value ? setDefaultValue(element, getToStringValue(element.value)) : setDefaultValue(element, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
		null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
		null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
	}
	function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating) {
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
		if (null != value || null != defaultValue) {
			if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
				track(element);
				return;
			}
			defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
			value = null != value ? "" + getToStringValue(value) : defaultValue;
			isHydrating || value === element.value || (element.value = value);
			element.defaultValue = value;
		}
		checked = null != checked ? checked : defaultChecked;
		checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
		element.checked = isHydrating ? element.checked : !!checked;
		element.defaultChecked = !!checked;
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
		track(element);
	}
	function setDefaultValue(node, value) {
		node.defaultValue !== "" + value && (node.defaultValue = "" + value);
	}
	function updateOptions(node, multiple, propValue, setDefaultSelected) {
		node = node.options;
		if (multiple) {
			multiple = {};
			for (var i = 0; i < propValue.length; i++) multiple["$" + propValue[i]] = !0;
			for (propValue = 0; propValue < node.length; propValue++) i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = !0);
		} else {
			propValue = "" + getToStringValue(propValue);
			multiple = null;
			for (i = 0; i < node.length; i++) {
				if (node[i].value === propValue) {
					node[i].selected = !0;
					setDefaultSelected && (node[i].defaultSelected = !0);
					return;
				}
				null !== multiple || node[i].disabled || (multiple = node[i]);
			}
			null !== multiple && (multiple.selected = !0);
		}
	}
	function updateTextarea(element, value, defaultValue) {
		if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
			element.defaultValue !== value && (element.defaultValue = value);
			return;
		}
		element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
	}
	function initTextarea(element, value, defaultValue, children) {
		if (null == value) {
			if (null != children) {
				if (null != defaultValue) throw Error(formatProdErrorMessage(92));
				if (isArrayImpl(children)) {
					if (1 < children.length) throw Error(formatProdErrorMessage(93));
					children = children[0];
				}
				defaultValue = children;
			}
			defaultValue ??= "";
			value = defaultValue;
		}
		defaultValue = getToStringValue(value);
		element.defaultValue = defaultValue;
		children = element.textContent;
		children === defaultValue && "" !== children && null !== children && (element.value = children);
		track(element);
	}
	function setTextContent(node, text) {
		if (text) {
			var firstChild = node.firstChild;
			if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
				firstChild.nodeValue = text;
				return;
			}
		}
		node.textContent = text;
	}
	var unitlessNumbers = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function setValueForStyle(style, styleName, value) {
		var isCustomProperty = 0 === styleName.indexOf("--");
		null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style.setProperty(styleName, "") : "float" === styleName ? style.cssFloat = "" : style[styleName] = "" : isCustomProperty ? style.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style.cssFloat = value : style[styleName] = ("" + value).trim() : style[styleName] = value + "px";
	}
	function setValueForStyles(node, styles, prevStyles) {
		if (null != styles && "object" !== typeof styles) throw Error(formatProdErrorMessage(62));
		node = node.style;
		if (null != prevStyles) {
			for (var styleName in prevStyles) !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "", viewTransitionMutationContext = !0);
			for (var styleName$16 in styles) styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && (setValueForStyle(node, styleName$16, styleName), viewTransitionMutationContext = !0);
		} else for (var styleName$17 in styles) styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
	}
	function isCustomElement(tagName) {
		if (-1 === tagName.indexOf("-")) return !1;
		switch (tagName) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var aliases = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]);
	var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function sanitizeURL(url) {
		return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
	}
	function noop$1() {}
	var currentReplayingEvent = null;
	function getEventTarget(nativeEvent) {
		nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
		nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
		return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
	}
	var restoreTarget = null;
	var restoreQueue = null;
	function restoreStateOfTarget(target) {
		var internalInstance = getInstanceFromNode(target);
		if (internalInstance && (target = internalInstance.stateNode)) {
			var props = target[internalPropsKey] || null;
			a: switch (target = internalInstance.stateNode, internalInstance.type) {
				case "input":
					updateInput(target, props.value, props.defaultValue, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name);
					internalInstance = props.name;
					if ("radio" === props.type && null != internalInstance) {
						for (props = target; props.parentNode;) props = props.parentNode;
						props = props.querySelectorAll("input[name=\"" + escapeSelectorAttributeValueInsideDoubleQuotes("" + internalInstance) + "\"][type=\"radio\"]");
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
							var otherNode = props[internalInstance];
							if (otherNode !== target && otherNode.form === target.form) {
								var otherProps = otherNode[internalPropsKey] || null;
								if (!otherProps) throw Error(formatProdErrorMessage(90));
								updateInput(otherNode, otherProps.value, otherProps.defaultValue, otherProps.defaultValue, otherProps.checked, otherProps.defaultChecked, otherProps.type, otherProps.name);
							}
						}
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
					}
					break a;
				case "textarea":
					updateTextarea(target, props.value, props.defaultValue);
					break a;
				case "select": internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, !1);
			}
		}
	}
	var isInsideEventHandler = !1;
	function batchedUpdates$1(fn, a, b) {
		if (isInsideEventHandler) return fn(a, b);
		isInsideEventHandler = !0;
		try {
			return fn(a);
		} finally {
			if (isInsideEventHandler = !1, null !== restoreTarget || null !== restoreQueue) {
				if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn)) for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
			}
		}
	}
	function getListener(inst, registrationName) {
		var stateNode = inst.stateNode;
		if (null === stateNode) return null;
		var props = stateNode[internalPropsKey] || null;
		if (null === props) return null;
		stateNode = props[registrationName];
		a: switch (registrationName) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
				inst = !props;
				break a;
			default: inst = !1;
		}
		if (inst) return null;
		if (stateNode && "function" !== typeof stateNode) throw Error(formatProdErrorMessage(231, registrationName, typeof stateNode));
		return stateNode;
	}
	var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
	var passiveBrowserEventsSupported = !1;
	if (canUseDOM) try {
		var options = {};
		Object.defineProperty(options, "passive", { get: function() {
			passiveBrowserEventsSupported = !0;
		} });
		window.addEventListener("test", options, options);
		window.removeEventListener("test", options, options);
	} catch (e) {
		passiveBrowserEventsSupported = !1;
	}
	var root = null;
	var startText = null;
	var fallbackText = null;
	function getData() {
		if (fallbackText) return fallbackText;
		var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
		for (start = 0; start < startLength && startValue[start] === endValue[start]; start++);
		var minEnd = startLength - start;
		for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++);
		return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
	}
	function getEventCharCode(nativeEvent) {
		var keyCode = nativeEvent.keyCode;
		"charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
		10 === nativeEvent && (nativeEvent = 13);
		return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
	}
	function functionThatReturnsTrue() {
		return !0;
	}
	function functionThatReturnsFalse() {
		return !1;
	}
	function createSyntheticEvent(Interface) {
		function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
			this._reactName = reactName;
			this._targetInst = targetInst;
			this.type = reactEventType;
			this.nativeEvent = nativeEvent;
			this.target = nativeEventTarget;
			this.currentTarget = null;
			for (var propName in Interface) Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
			this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : !1 === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
			this.isPropagationStopped = functionThatReturnsFalse;
			return this;
		}
		assign(SyntheticBaseEvent.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var event = this.nativeEvent;
				event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = !1), this.isDefaultPrevented = functionThatReturnsTrue);
			},
			stopPropagation: function() {
				var event = this.nativeEvent;
				event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = !0), this.isPropagationStopped = functionThatReturnsTrue);
			},
			persist: function() {},
			isPersistent: functionThatReturnsTrue
		});
		return SyntheticBaseEvent;
	}
	var EventInterface = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(event) {
			return event.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	};
	var SyntheticEvent = createSyntheticEvent(EventInterface);
	var UIEventInterface = assign({}, EventInterface, {
		view: 0,
		detail: 0
	});
	var SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
	var lastMovementX;
	var lastMovementY;
	var lastMouseEvent;
	var MouseEventInterface = assign({}, UIEventInterface, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: getEventModifierState,
		button: 0,
		buttons: 0,
		relatedTarget: function(event) {
			return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
		},
		movementX: function(event) {
			if ("movementX" in event) return event.movementX;
			event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
			return lastMovementX;
		},
		movementY: function(event) {
			return "movementY" in event ? event.movementY : lastMovementY;
		}
	});
	var SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
	var SyntheticDragEvent = createSyntheticEvent(assign({}, MouseEventInterface, { dataTransfer: 0 }));
	var SyntheticFocusEvent = createSyntheticEvent(assign({}, UIEventInterface, { relatedTarget: 0 }));
	var SyntheticAnimationEvent = createSyntheticEvent(assign({}, EventInterface, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	}));
	var SyntheticClipboardEvent = createSyntheticEvent(assign({}, EventInterface, { clipboardData: function(event) {
		return "clipboardData" in event ? event.clipboardData : window.clipboardData;
	} }));
	var SyntheticCompositionEvent = createSyntheticEvent(assign({}, EventInterface, { data: 0 }));
	var normalizeKey = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	};
	var translateToKey = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	};
	var modifierKeyToProp = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function modifierStateGetter(keyArg) {
		var nativeEvent = this.nativeEvent;
		return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : !1;
	}
	function getEventModifierState() {
		return modifierStateGetter;
	}
	var SyntheticKeyboardEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		key: function(nativeEvent) {
			if (nativeEvent.key) {
				var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
				if ("Unidentified" !== key) return key;
			}
			return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: getEventModifierState,
		charCode: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : 0;
		},
		keyCode: function(event) {
			return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		},
		which: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		}
	}));
	var SyntheticPointerEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	}));
	var SyntheticSubmitEvent = createSyntheticEvent(assign({}, EventInterface, { submitter: 0 }));
	var SyntheticTouchEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: getEventModifierState
	}));
	var SyntheticTransitionEvent = createSyntheticEvent(assign({}, EventInterface, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	}));
	var SyntheticWheelEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		deltaX: function(event) {
			return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
		},
		deltaY: function(event) {
			return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	}));
	var SyntheticToggleEvent = createSyntheticEvent(assign({}, EventInterface, {
		newState: 0,
		oldState: 0,
		source: 0
	}));
	var END_KEYCODES = [
		9,
		13,
		27,
		32
	];
	var canUseCompositionEvent = canUseDOM && "CompositionEvent" in window;
	var documentMode = null;
	canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
	var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode;
	var useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode);
	var SPACEBAR_CHAR = String.fromCharCode(32);
	var hasSpaceKeypress = !1;
	function isFallbackCompositionEnd(domEventName, nativeEvent) {
		switch (domEventName) {
			case "keyup": return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
			case "keydown": return 229 !== nativeEvent.keyCode;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function getDataFromCustomEvent(nativeEvent) {
		nativeEvent = nativeEvent.detail;
		return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
	}
	var isComposing = !1;
	function getNativeBeforeInputChars(domEventName, nativeEvent) {
		switch (domEventName) {
			case "compositionend": return getDataFromCustomEvent(nativeEvent);
			case "keypress":
				if (32 !== nativeEvent.which) return null;
				hasSpaceKeypress = !0;
				return SPACEBAR_CHAR;
			case "textInput": return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
			default: return null;
		}
	}
	function getFallbackBeforeInputChars(domEventName, nativeEvent) {
		if (isComposing) return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = !1, domEventName) : null;
		switch (domEventName) {
			case "paste": return null;
			case "keypress":
				if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
					if (nativeEvent.char && 1 < nativeEvent.char.length) return nativeEvent.char;
					if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
				}
				return null;
			case "compositionend": return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
			default: return null;
		}
	}
	var supportedInputTypes = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function isTextInputElement(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? !0 : !1;
	}
	function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
		restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
		inst = accumulateTwoPhaseListeners(inst, "onChange");
		0 < inst.length && (nativeEvent = new SyntheticEvent("onChange", "change", null, nativeEvent, target), dispatchQueue.push({
			event: nativeEvent,
			listeners: inst
		}));
	}
	var activeElement$1 = null;
	var activeElementInst$1 = null;
	function runEventInBatch(dispatchQueue) {
		processDispatchQueue(dispatchQueue, 0);
	}
	function getInstIfValueChanged(targetInst) {
		if (updateValueIfChanged(getNodeFromInstance(targetInst))) return targetInst;
	}
	function getTargetInstForChangeEvent(domEventName, targetInst) {
		if ("change" === domEventName) return targetInst;
	}
	var isInputEventSupported = !1;
	if (canUseDOM) {
		var JSCompiler_inline_result$jscomp$318;
		if (canUseDOM) {
			var isSupported$jscomp$inline_474 = "oninput" in document;
			if (!isSupported$jscomp$inline_474) {
				var element$jscomp$inline_475 = document.createElement("div");
				element$jscomp$inline_475.setAttribute("oninput", "return;");
				isSupported$jscomp$inline_474 = "function" === typeof element$jscomp$inline_475.oninput;
			}
			JSCompiler_inline_result$jscomp$318 = isSupported$jscomp$inline_474;
		} else JSCompiler_inline_result$jscomp$318 = !1;
		isInputEventSupported = JSCompiler_inline_result$jscomp$318 && (!document.documentMode || 9 < document.documentMode);
	}
	function stopWatchingForValueChange() {
		activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
	}
	function handlePropertyChange(nativeEvent) {
		if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
			var dispatchQueue = [];
			createAndAccumulateChangeEvent(dispatchQueue, activeElementInst$1, nativeEvent, getEventTarget(nativeEvent));
			batchedUpdates$1(runEventInBatch, dispatchQueue);
		}
	}
	function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
		"focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
	}
	function getTargetInstForInputEventPolyfill(domEventName) {
		if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName) return getInstIfValueChanged(activeElementInst$1);
	}
	function getTargetInstForClickEvent(domEventName, targetInst) {
		if ("click" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
		if ("input" === domEventName || "change" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	function shallowEqual(objA, objB) {
		if (objectIs(objA, objB)) return !0;
		if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB) return !1;
		var keysA = Object.keys(objA), keysB = Object.keys(objB);
		if (keysA.length !== keysB.length) return !1;
		for (keysB = 0; keysB < keysA.length; keysB++) {
			var currentKey = keysA[keysB];
			if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey])) return !1;
		}
		return !0;
	}
	function getActiveElement(doc) {
		doc = doc || ("undefined" !== typeof document ? document : void 0);
		if ("undefined" === typeof doc) return null;
		try {
			return doc.activeElement || doc.body;
		} catch (e$20) {
			return doc.body;
		}
	}
	function getLeafNode(node) {
		for (; node && node.firstChild;) node = node.firstChild;
		return node;
	}
	function getNodeForCharacterOffset(root, offset) {
		var node = getLeafNode(root);
		root = 0;
		for (var nodeEnd; node;) {
			if (3 === node.nodeType) {
				nodeEnd = root + node.textContent.length;
				if (root <= offset && nodeEnd >= offset) return {
					node,
					offset: offset - root
				};
				root = nodeEnd;
			}
			a: {
				for (; node;) {
					if (node.nextSibling) {
						node = node.nextSibling;
						break a;
					}
					node = node.parentNode;
				}
				node = void 0;
			}
			node = getLeafNode(node);
		}
	}
	function containsNode(outerNode, innerNode) {
		return outerNode && innerNode ? outerNode === innerNode ? !0 : outerNode && 3 === outerNode.nodeType ? !1 : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : !1 : !1;
	}
	function getActiveElementDeep(containerInfo) {
		containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
		for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement;) {
			try {
				var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
			} catch (err) {
				JSCompiler_inline_result = !1;
			}
			if (JSCompiler_inline_result) containerInfo = element.contentWindow;
			else break;
			element = getActiveElement(containerInfo.document);
		}
		return element;
	}
	function hasSelectionCapabilities(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
	}
	var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode;
	var activeElement = null;
	var activeElementInst = null;
	var lastSelection = null;
	var mouseDown = !1;
	function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
		var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
		mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = {
			start: doc.selectionStart,
			end: doc.selectionEnd
		} : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
			anchorNode: doc.anchorNode,
			anchorOffset: doc.anchorOffset,
			focusNode: doc.focusNode,
			focusOffset: doc.focusOffset
		}), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent("onSelect", "select", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
			event: nativeEvent,
			listeners: doc
		}), nativeEvent.target = activeElement)));
	}
	function makePrefixMap(styleProp, eventName) {
		var prefixes = {};
		prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
		prefixes["Webkit" + styleProp] = "webkit" + eventName;
		prefixes["Moz" + styleProp] = "moz" + eventName;
		return prefixes;
	}
	var vendorPrefixes = {
		animationend: makePrefixMap("Animation", "AnimationEnd"),
		animationiteration: makePrefixMap("Animation", "AnimationIteration"),
		animationstart: makePrefixMap("Animation", "AnimationStart"),
		transitionrun: makePrefixMap("Transition", "TransitionRun"),
		transitionstart: makePrefixMap("Transition", "TransitionStart"),
		transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
		transitionend: makePrefixMap("Transition", "TransitionEnd")
	};
	var prefixedEventNames = {};
	var style = {};
	canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
	function getVendorPrefixedEventName(eventName) {
		if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
		if (!vendorPrefixes[eventName]) return eventName;
		var prefixMap = vendorPrefixes[eventName], styleProp;
		for (styleProp in prefixMap) if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) return prefixedEventNames[eventName] = prefixMap[styleProp];
		return eventName;
	}
	var ANIMATION_END = getVendorPrefixedEventName("animationend");
	var ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration");
	var ANIMATION_START = getVendorPrefixedEventName("animationstart");
	var TRANSITION_RUN = getVendorPrefixedEventName("transitionrun");
	var TRANSITION_START = getVendorPrefixedEventName("transitionstart");
	var TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel");
	var TRANSITION_END = getVendorPrefixedEventName("transitionend");
	var topLevelEventsToReactNames = /* @__PURE__ */ new Map();
	var simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	simpleEventPluginEvents.push("scrollEnd");
	function registerSimpleEvent(domEventName, reactName) {
		topLevelEventsToReactNames.set(domEventName, reactName);
		registerTwoPhaseEvent(reactName, [domEventName]);
	}
	var globalClientIdCounter$1 = 0;
	function getViewTransitionName(props, instance) {
		if (null != props.name && "auto" !== props.name) return props.name;
		if (null !== instance.autoName) return instance.autoName;
		props = pendingEffectsRoot.identifierPrefix;
		var globalClientId = globalClientIdCounter$1++;
		props = "_" + props + "t_" + globalClientId.toString(32) + "_";
		return instance.autoName = props;
	}
	function getClassNameByType(classByType) {
		if (null == classByType || "string" === typeof classByType) return classByType;
		var className = null, activeTypes = pendingTransitionTypes;
		if (null !== activeTypes) for (var i = 0; i < activeTypes.length; i++) {
			var match = classByType[activeTypes[i]];
			if (null != match) {
				if ("none" === match) return "none";
				className = null == className ? match : className + (" " + match);
			}
		}
		return null == className ? classByType.default : className;
	}
	function getViewTransitionClassName(defaultClass, eventClass) {
		defaultClass = getClassNameByType(defaultClass);
		eventClass = getClassNameByType(eventClass);
		return null == eventClass ? "auto" === defaultClass ? null : defaultClass : "auto" === eventClass ? null : eventClass;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	var concurrentQueues = [];
	var concurrentQueuesIndex = 0;
	var concurrentlyUpdatedLanes = 0;
	function finishQueueingConcurrentUpdates() {
		for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex;) {
			var fiber = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var queue = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var update = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var lane = concurrentQueues[i];
			concurrentQueues[i++] = null;
			if (null !== queue && null !== update) {
				var pending = queue.pending;
				null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
				queue.pending = update;
			}
			0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
		}
	}
	function enqueueUpdate$1(fiber, queue, update, lane) {
		concurrentQueues[concurrentQueuesIndex++] = fiber;
		concurrentQueues[concurrentQueuesIndex++] = queue;
		concurrentQueues[concurrentQueuesIndex++] = update;
		concurrentQueues[concurrentQueuesIndex++] = lane;
		concurrentlyUpdatedLanes |= lane;
		fiber.lanes |= lane;
		fiber = fiber.alternate;
		null !== fiber && (fiber.lanes |= lane);
	}
	function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
		enqueueUpdate$1(fiber, queue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function enqueueConcurrentRenderForLane(fiber, lane) {
		enqueueUpdate$1(fiber, null, null, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
		sourceFiber.lanes |= lane;
		var alternate = sourceFiber.alternate;
		null !== alternate && (alternate.lanes |= lane);
		for (var isHidden = !1, parent = sourceFiber.return; null !== parent;) parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = !0)), sourceFiber = parent, parent = parent.return;
		return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
	}
	function getRootForUpdatedFiber(sourceFiber) {
		if (50 < nestedUpdateCount) throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
		for (var parent = sourceFiber.return; null !== parent;) sourceFiber = parent, parent = sourceFiber.return;
		return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
	}
	var emptyContextObject = {};
	function FiberNode(tag, pendingProps, key, mode) {
		this.tag = tag;
		this.key = key;
		this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
		this.index = 0;
		this.refCleanup = this.ref = null;
		this.pendingProps = pendingProps;
		this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
		this.mode = mode;
		this.subtreeFlags = this.flags = 0;
		this.deletions = null;
		this.childLanes = this.lanes = 0;
		this.alternate = null;
	}
	function createFiberImplClass(tag, pendingProps, key, mode) {
		return new FiberNode(tag, pendingProps, key, mode);
	}
	function shouldConstruct(Component) {
		Component = Component.prototype;
		return !(!Component || !Component.isReactComponent);
	}
	function createWorkInProgress(current, pendingProps) {
		var workInProgress = current.alternate;
		null === workInProgress ? (workInProgress = createFiberImplClass(current.tag, pendingProps, current.key, current.mode), workInProgress.elementType = current.elementType, workInProgress.type = current.type, workInProgress.stateNode = current.stateNode, workInProgress.alternate = current, current.alternate = workInProgress) : (workInProgress.pendingProps = pendingProps, workInProgress.type = current.type, workInProgress.flags = 0, workInProgress.subtreeFlags = 0, workInProgress.deletions = null);
		workInProgress.flags = current.flags & 1206910976;
		workInProgress.childLanes = current.childLanes;
		workInProgress.lanes = current.lanes;
		workInProgress.child = current.child;
		workInProgress.memoizedProps = current.memoizedProps;
		workInProgress.memoizedState = current.memoizedState;
		workInProgress.updateQueue = current.updateQueue;
		pendingProps = current.dependencies;
		workInProgress.dependencies = null === pendingProps ? null : {
			lanes: pendingProps.lanes,
			firstContext: pendingProps.firstContext
		};
		workInProgress.sibling = current.sibling;
		workInProgress.index = current.index;
		workInProgress.ref = current.ref;
		workInProgress.refCleanup = current.refCleanup;
		return workInProgress;
	}
	function resetWorkInProgress(workInProgress, renderLanes) {
		workInProgress.flags &= 1206910978;
		var current = workInProgress.alternate;
		null === current ? (workInProgress.childLanes = 0, workInProgress.lanes = renderLanes, workInProgress.child = null, workInProgress.subtreeFlags = 0, workInProgress.memoizedProps = null, workInProgress.memoizedState = null, workInProgress.updateQueue = null, workInProgress.dependencies = null, workInProgress.stateNode = null) : (workInProgress.childLanes = current.childLanes, workInProgress.lanes = current.lanes, workInProgress.child = current.child, workInProgress.subtreeFlags = 0, workInProgress.deletions = null, workInProgress.memoizedProps = current.memoizedProps, workInProgress.memoizedState = current.memoizedState, workInProgress.updateQueue = current.updateQueue, workInProgress.type = current.type, renderLanes = current.dependencies, workInProgress.dependencies = null === renderLanes ? null : {
			lanes: renderLanes.lanes,
			firstContext: renderLanes.firstContext
		});
		return workInProgress;
	}
	function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
		var fiberTag = 0;
		owner = type;
		if ("function" === typeof owner) shouldConstruct(owner) && (fiberTag = 1);
		else if ("string" === typeof owner) fiberTag = isHostHoistableType(type, pendingProps, contextStackCursor.current) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
		else a: switch (owner) {
			case REACT_ACTIVITY_TYPE: return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
			case REACT_FRAGMENT_TYPE: return createFiberFromFragment(pendingProps.children, mode, lanes, key);
			case REACT_STRICT_MODE_TYPE:
				fiberTag = 8;
				mode |= 24;
				break;
			case REACT_PROFILER_TYPE: return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_TYPE: return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_LIST_TYPE: return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
			case REACT_LEGACY_HIDDEN_TYPE:
			case REACT_VIEW_TRANSITION_TYPE: return type = mode | 32, type = createFiberImplClass(30, pendingProps, key, type), type.elementType = REACT_VIEW_TRANSITION_TYPE, type.lanes = lanes, type.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, type;
			default:
				if ("object" === typeof owner && null !== owner) switch (owner.$$typeof) {
					case REACT_CONTEXT_TYPE:
						fiberTag = 10;
						break a;
					case REACT_CONSUMER_TYPE:
						fiberTag = 9;
						break a;
					case REACT_FORWARD_REF_TYPE:
						fiberTag = 11;
						break a;
					case REACT_MEMO_TYPE:
						fiberTag = 14;
						break a;
					case REACT_LAZY_TYPE:
						fiberTag = 16;
						owner = null;
						break a;
				}
				fiberTag = 29;
				pendingProps = Error(formatProdErrorMessage(130, null === type ? "null" : typeof type, ""));
				owner = null;
		}
		key = createFiberImplClass(fiberTag, pendingProps, key, mode);
		key.elementType = type;
		key.type = owner;
		key.lanes = lanes;
		return key;
	}
	function createFiberFromFragment(elements, mode, lanes, key) {
		elements = createFiberImplClass(7, elements, key, mode);
		elements.lanes = lanes;
		return elements;
	}
	function createFiberFromText(content, mode, lanes) {
		content = createFiberImplClass(6, content, null, mode);
		content.lanes = lanes;
		return content;
	}
	function createFiberFromDehydratedFragment(dehydratedNode) {
		var fiber = createFiberImplClass(18, null, null, 0);
		fiber.stateNode = dehydratedNode;
		return fiber;
	}
	function createFiberFromPortal(portal, mode, lanes) {
		mode = createFiberImplClass(4, null !== portal.children ? portal.children : [], portal.key, mode);
		mode.lanes = lanes;
		mode.stateNode = {
			containerInfo: portal.containerInfo,
			pendingChildren: null,
			implementation: portal.implementation
		};
		return mode;
	}
	var CapturedStacks = /* @__PURE__ */ new WeakMap();
	function createCapturedValueAtFiber(value, source) {
		if ("object" === typeof value && null !== value) {
			var existing = CapturedStacks.get(value);
			if (void 0 !== existing) return existing;
			source = {
				value,
				source,
				stack: getStackByFiberInDevAndProd(source)
			};
			CapturedStacks.set(value, source);
			return source;
		}
		return {
			value,
			source,
			stack: getStackByFiberInDevAndProd(source)
		};
	}
	var forkStack = [];
	var forkStackIndex = 0;
	var treeForkProvider = null;
	var treeForkCount = 0;
	var idStack = [];
	var idStackIndex = 0;
	var treeContextProvider = null;
	var treeContextId = 1;
	var treeContextOverflow = "";
	function pushTreeFork(workInProgress, totalChildren) {
		forkStack[forkStackIndex++] = treeForkCount;
		forkStack[forkStackIndex++] = treeForkProvider;
		treeForkProvider = workInProgress;
		treeForkCount = totalChildren;
	}
	function pushTreeId(workInProgress, totalChildren, index) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextProvider = workInProgress;
		var baseIdWithLeadingBit = treeContextId;
		workInProgress = treeContextOverflow;
		var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
		baseIdWithLeadingBit &= ~(1 << baseLength);
		index += 1;
		var length = 32 - clz32(totalChildren) + baseLength;
		if (30 < length) {
			var numberOfOverflowBits = baseLength - baseLength % 5;
			length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
			baseIdWithLeadingBit >>= numberOfOverflowBits;
			baseLength -= numberOfOverflowBits;
			treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index << baseLength | baseIdWithLeadingBit;
			treeContextOverflow = length + workInProgress;
		} else treeContextId = 1 << length | index << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress;
	}
	function pushMaterializedTreeId(workInProgress) {
		null !== workInProgress.return && (pushTreeFork(workInProgress, 1), pushTreeId(workInProgress, 1, 0));
	}
	function popTreeContext(workInProgress) {
		for (; workInProgress === treeForkProvider;) treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
		for (; workInProgress === treeContextProvider;) treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
	}
	function restoreSuspendedTreeContext(workInProgress, suspendedContext) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextId = suspendedContext.id;
		treeContextOverflow = suspendedContext.overflow;
		treeContextProvider = workInProgress;
	}
	var hydrationParentFiber = null;
	var nextHydratableInstance = null;
	var isHydrating = !1;
	var hydrationErrors = null;
	var rootOrSingletonContext = !1;
	var HydrationMismatchException = Error(formatProdErrorMessage(519));
	function throwOnHydrationMismatch(fiber) {
		queueHydrationError(createCapturedValueAtFiber(Error(formatProdErrorMessage(418, 1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML", "")), fiber));
		throw HydrationMismatchException;
	}
	function prepareToHydrateHostInstance(fiber) {
		var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
		instance[internalInstanceKey] = fiber;
		instance[internalPropsKey] = props;
		switch (type) {
			case "dialog":
				listenToNonDelegatedEvent("cancel", instance);
				listenToNonDelegatedEvent("close", instance);
				break;
			case "iframe":
			case "object":
			case "embed":
				listenToNonDelegatedEvent("load", instance);
				break;
			case "video":
			case "audio":
				for (type = 0; type < mediaEventTypes.length; type++) listenToNonDelegatedEvent(mediaEventTypes[type], instance);
				break;
			case "source":
				listenToNonDelegatedEvent("error", instance);
				break;
			case "img":
			case "image":
			case "link":
				listenToNonDelegatedEvent("error", instance);
				listenToNonDelegatedEvent("load", instance);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", instance);
				break;
			case "input":
				listenToNonDelegatedEvent("invalid", instance);
				initInput(instance, props.value, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name, !0);
				break;
			case "select":
				listenToNonDelegatedEvent("invalid", instance);
				break;
			case "textarea": listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
		}
		type = props.children;
		"string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || !0 === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = !0) : instance = !1;
		instance || throwOnHydrationMismatch(fiber, !0);
	}
	function popToNextHostParent(fiber) {
		for (hydrationParentFiber = fiber.return; hydrationParentFiber;) switch (hydrationParentFiber.tag) {
			case 5:
			case 31:
			case 13:
				rootOrSingletonContext = !1;
				return;
			case 27:
			case 3:
				rootOrSingletonContext = !0;
				return;
			default: hydrationParentFiber = hydrationParentFiber.return;
		}
	}
	function popHydrationState(fiber) {
		if (fiber !== hydrationParentFiber) return !1;
		if (!isHydrating) return popToNextHostParent(fiber), isHydrating = !0, !1;
		var tag = fiber.tag, JSCompiler_temp;
		if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
			if (JSCompiler_temp = 5 === tag) JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
			JSCompiler_temp = !JSCompiler_temp;
		}
		JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
		popToNextHostParent(fiber);
		if (13 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else if (31 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else 27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
		return !0;
	}
	function resetHydrationState() {
		nextHydratableInstance = hydrationParentFiber = null;
		isHydrating = !1;
	}
	function upgradeHydrationErrorsToRecoverable() {
		var queuedErrors = hydrationErrors;
		null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, queuedErrors), hydrationErrors = null);
		return queuedErrors;
	}
	function queueHydrationError(error) {
		null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
	}
	var valueCursor = createCursor(null);
	var currentlyRenderingFiber$1 = null;
	var lastContextDependency = null;
	function pushProvider(providerFiber, context, nextValue) {
		push(valueCursor, context._currentValue);
		context._currentValue = nextValue;
	}
	function popProvider(context) {
		context._currentValue = valueCursor.current;
		pop(valueCursor);
	}
	function scheduleContextWorkOnParentPath(parent, renderLanes, propagationRoot) {
		for (; null !== parent;) {
			var alternate = parent.alternate;
			(parent.childLanes & renderLanes) !== renderLanes ? (parent.childLanes |= renderLanes, null !== alternate && (alternate.childLanes |= renderLanes)) : null !== alternate && (alternate.childLanes & renderLanes) !== renderLanes && (alternate.childLanes |= renderLanes);
			if (parent === propagationRoot) break;
			parent = parent.return;
		}
	}
	function propagateContextChanges(workInProgress, contexts, renderLanes, forcePropagateEntireTree) {
		var fiber = workInProgress.child;
		null !== fiber && (fiber.return = workInProgress);
		for (; null !== fiber;) {
			var list = fiber.dependencies;
			if (null !== list) {
				var nextFiber = fiber.child;
				list = list.firstContext;
				a: for (; null !== list;) {
					var dependency = list;
					list = fiber;
					for (var i = 0; i < contexts.length; i++) if (dependency.context === contexts[i]) {
						list.lanes |= renderLanes;
						dependency = list.alternate;
						null !== dependency && (dependency.lanes |= renderLanes);
						scheduleContextWorkOnParentPath(list.return, renderLanes, workInProgress);
						forcePropagateEntireTree || (nextFiber = null);
						break a;
					}
					list = dependency.next;
				}
			} else if (18 === fiber.tag) {
				nextFiber = fiber.return;
				if (null === nextFiber) throw Error(formatProdErrorMessage(341));
				nextFiber.lanes |= renderLanes;
				list = nextFiber.alternate;
				null !== list && (list.lanes |= renderLanes);
				scheduleContextWorkOnParentPath(nextFiber, renderLanes, workInProgress);
				nextFiber = null;
			} else 13 === fiber.tag && null !== fiber.memoizedState && null === fiber.memoizedState.dehydrated ? (fiber.lanes |= renderLanes, nextFiber = fiber.alternate, null !== nextFiber && (nextFiber.lanes |= renderLanes), scheduleContextWorkOnParentPath(fiber.return, renderLanes, workInProgress), nextFiber = fiber.child, nextFiber = null !== nextFiber ? nextFiber.sibling : null) : nextFiber = fiber.child;
			if (null !== nextFiber) nextFiber.return = fiber;
			else for (nextFiber = fiber; null !== nextFiber;) {
				if (nextFiber === workInProgress) {
					nextFiber = null;
					break;
				}
				fiber = nextFiber.sibling;
				if (null !== fiber) {
					fiber.return = nextFiber.return;
					nextFiber = fiber;
					break;
				}
				nextFiber = nextFiber.return;
			}
			fiber = nextFiber;
		}
	}
	function propagateParentContextChanges(current, workInProgress, renderLanes, forcePropagateEntireTree) {
		current = null;
		for (var parent = workInProgress, isInsidePropagationBailout = !1; null !== parent;) {
			if (!isInsidePropagationBailout) {
				if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = !0;
				else if (0 !== (parent.flags & 262144)) break;
			}
			if (10 === parent.tag) {
				var currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent = currentParent.memoizedProps;
				if (null !== currentParent) {
					var context = parent.type;
					objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
				}
			} else if (parent === hostTransitionProviderCursor.current) {
				currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
			}
			parent = parent.return;
		}
		null !== current && propagateContextChanges(workInProgress, current, renderLanes, forcePropagateEntireTree);
		workInProgress.flags |= 262144;
		return null !== current;
	}
	function checkIfContextChanged(currentDependencies) {
		for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies;) {
			if (!objectIs(currentDependencies.context._currentValue, currentDependencies.memoizedValue)) return !0;
			currentDependencies = currentDependencies.next;
		}
		return !1;
	}
	function prepareToReadContext(workInProgress) {
		currentlyRenderingFiber$1 = workInProgress;
		lastContextDependency = null;
		workInProgress = workInProgress.dependencies;
		null !== workInProgress && (workInProgress.firstContext = null);
	}
	function readContext(context) {
		return readContextForConsumer(currentlyRenderingFiber$1, context);
	}
	function readContextDuringReconciliation(consumer, context) {
		null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
		return readContextForConsumer(consumer, context);
	}
	function readContextForConsumer(consumer, context) {
		var value = context._currentValue;
		context = {
			context,
			memoizedValue: value,
			next: null
		};
		if (null === lastContextDependency) {
			if (null === consumer) throw Error(formatProdErrorMessage(308));
			lastContextDependency = context;
			consumer.dependencies = {
				lanes: 0,
				firstContext: context
			};
			consumer.flags |= 524288;
		} else lastContextDependency = lastContextDependency.next = context;
		return value;
	}
	var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
		var listeners = [], signal = this.signal = {
			aborted: !1,
			addEventListener: function(type, listener) {
				listeners.push(listener);
			}
		};
		this.abort = function() {
			signal.aborted = !0;
			listeners.forEach(function(listener) {
				return listener();
			});
		};
	};
	var scheduleCallback$2 = Scheduler.unstable_scheduleCallback;
	var NormalPriority = Scheduler.unstable_NormalPriority;
	var CacheContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function createCache() {
		return {
			controller: new AbortControllerLocal(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function releaseCache(cache) {
		cache.refCount--;
		0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
			cache.controller.abort();
		});
	}
	function queueTransitionTypes(root, transitionTypes) {
		if (0 !== (root.pendingLanes & 4194048)) {
			var queued = root.transitionTypes;
			null === queued && (queued = root.transitionTypes = []);
			for (root = 0; root < transitionTypes.length; root++) {
				var transitionType = transitionTypes[root];
				-1 === queued.indexOf(transitionType) && queued.push(transitionType);
			}
		}
	}
	var entangledTransitionTypes = null;
	function claimQueuedTransitionTypes(root) {
		var claimed = root.transitionTypes;
		root.transitionTypes = null;
		return claimed;
	}
	var currentEntangledListeners = null;
	var currentEntangledPendingCount = 0;
	var currentEntangledLane = 0;
	var currentEntangledActionThenable = null;
	function entangleAsyncAction(transition, thenable) {
		if (null === currentEntangledListeners) {
			var entangledListeners = currentEntangledListeners = [];
			currentEntangledPendingCount = 0;
			currentEntangledLane = requestTransitionLane();
			currentEntangledActionThenable = {
				status: "pending",
				value: void 0,
				then: function(resolve) {
					entangledListeners.push(resolve);
				}
			};
		}
		currentEntangledPendingCount++;
		thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
		return thenable;
	}
	function pingEngtangledActionScope() {
		if (0 === --currentEntangledPendingCount && (entangledTransitionTypes = null, null !== currentEntangledListeners)) {
			null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
			var listeners = currentEntangledListeners;
			currentEntangledListeners = null;
			currentEntangledLane = 0;
			currentEntangledActionThenable = null;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
		}
	}
	function chainThenableValue(thenable, result) {
		var listeners = [], thenableWithOverride = {
			status: "pending",
			value: null,
			reason: null,
			then: function(resolve) {
				listeners.push(resolve);
			}
		};
		thenable.then(function() {
			thenableWithOverride.status = "fulfilled";
			thenableWithOverride.value = result;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
		}, function(error) {
			thenableWithOverride.status = "rejected";
			thenableWithOverride.reason = error;
			for (error = 0; error < listeners.length; error++) (0, listeners[error])(void 0);
		});
		return thenableWithOverride;
	}
	var prevOnStartTransitionFinish = ReactSharedInternals.S;
	ReactSharedInternals.S = function(transition, returnValue) {
		globalMostRecentTransitionTime = now();
		"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
		if (null !== entangledTransitionTypes) for (var root$28 = firstScheduledRoot; null !== root$28;) queueTransitionTypes(root$28, entangledTransitionTypes), root$28 = root$28.next;
		root$28 = transition.types;
		if (null !== root$28) {
			for (var root$29 = firstScheduledRoot; null !== root$29;) queueTransitionTypes(root$29, root$28), root$29 = root$29.next;
			if (0 !== currentEntangledLane) {
				root$29 = entangledTransitionTypes;
				null === root$29 && (root$29 = entangledTransitionTypes = []);
				for (var i = 0; i < root$28.length; i++) {
					var transitionType = root$28[i];
					-1 === root$29.indexOf(transitionType) && root$29.push(transitionType);
				}
			}
		}
		null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
	};
	var resumedCache = createCursor(null);
	function peekCacheFromPool() {
		var cacheResumedFromPreviousRender = resumedCache.current;
		return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
	}
	function pushTransition(offscreenWorkInProgress, prevCachePool) {
		null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
	}
	function getSuspendedCache() {
		var cacheFromPool = peekCacheFromPool();
		return null === cacheFromPool ? null : {
			parent: CacheContext._currentValue,
			pool: cacheFromPool
		};
	}
	var SuspenseException = Error(formatProdErrorMessage(460));
	var SuspenseyCommitException = Error(formatProdErrorMessage(474));
	var SuspenseActionException = Error(formatProdErrorMessage(542));
	var noopSuspenseyCommitThenable = { then: function() {} };
	function isThenableResolved(thenable) {
		thenable = thenable.status;
		return "fulfilled" === thenable || "rejected" === thenable;
	}
	function trackUsedThenable(thenableState, thenable, index) {
		index = thenableState[index];
		void 0 === index ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop$1, noop$1), thenable = index);
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected":
				thenableState = thenable.reason;
				checkIfUseWrappedInAsyncCatch(thenableState);
				if (void 0 === thenableState && !("reason" in thenable)) throw Error(formatProdErrorMessage(600));
				throw thenableState;
			default:
				if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
				else {
					thenableState = workInProgressRoot;
					if (null !== thenableState && 100 < thenableState.shellSuspendCounter) throw Error(formatProdErrorMessage(482));
					thenableState = thenable;
					thenableState.status = "pending";
					thenableState.then(function(fulfilledValue) {
						if ("pending" === thenable.status) {
							var fulfilledThenable = thenable;
							fulfilledThenable.status = "fulfilled";
							fulfilledThenable.value = fulfilledValue;
						}
					}, function(error) {
						if ("pending" === thenable.status) {
							var rejectedThenable = thenable;
							rejectedThenable.status = "rejected";
							rejectedThenable.reason = error;
						}
					});
				}
				switch (thenable.status) {
					case "fulfilled": return thenable.value;
					case "rejected": throw thenableState = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState), thenableState;
				}
				suspendedThenable = thenable;
				throw SuspenseException;
		}
	}
	function resolveLazy(lazyType) {
		try {
			var init = lazyType._init;
			return init(lazyType._payload);
		} catch (x) {
			if (null !== x && "object" === typeof x && "function" === typeof x.then) throw suspendedThenable = x, SuspenseException;
			throw x;
		}
	}
	var suspendedThenable = null;
	function getSuspendedThenable() {
		if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
		var thenable = suspendedThenable;
		suspendedThenable = null;
		return thenable;
	}
	function checkIfUseWrappedInAsyncCatch(rejectedReason) {
		if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException) throw Error(formatProdErrorMessage(483));
	}
	var thenableState$1 = null;
	var thenableIndexCounter$1 = 0;
	function unwrapThenable(thenable) {
		var index = thenableIndexCounter$1;
		thenableIndexCounter$1 += 1;
		null === thenableState$1 && (thenableState$1 = []);
		return trackUsedThenable(thenableState$1, thenable, index);
	}
	function coerceRef(workInProgress, element) {
		element = element.props.ref;
		workInProgress.ref = void 0 !== element ? element : null;
	}
	function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
		if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE) throw Error(formatProdErrorMessage(525));
		returnFiber = Object.prototype.toString.call(newChild);
		throw Error(formatProdErrorMessage(31, "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber));
	}
	function createChildReconciler(shouldTrackSideEffects) {
		function deleteChild(returnFiber, childToDelete) {
			if (shouldTrackSideEffects) {
				var deletions = returnFiber.deletions;
				null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
			}
		}
		function deleteRemainingChildren(returnFiber, currentFirstChild) {
			if (!shouldTrackSideEffects) return null;
			for (; null !== currentFirstChild;) deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return null;
		}
		function mapRemainingChildren(currentFirstChild) {
			for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild;) null === currentFirstChild.key ? existingChildren.set(currentFirstChild.index, currentFirstChild) : existingChildren.set(currentFirstChild.key, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return existingChildren;
		}
		function useFiber(fiber, pendingProps) {
			fiber = createWorkInProgress(fiber, pendingProps);
			fiber.index = 0;
			fiber.sibling = null;
			return fiber;
		}
		function placeChild(newFiber, lastPlacedIndex, newIndex) {
			newFiber.index = newIndex;
			if (!shouldTrackSideEffects) return newFiber.flags |= 1048576, lastPlacedIndex;
			newIndex = newFiber.alternate;
			if (null !== newIndex) return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 2, lastPlacedIndex) : newIndex;
			newFiber.flags |= 134217730;
			return lastPlacedIndex;
		}
		function placeSingleChild(newFiber) {
			shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 134217730);
			return newFiber;
		}
		function updateTextNode(returnFiber, current, textContent, lanes) {
			if (null === current || 6 !== current.tag) return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, textContent);
			current.return = returnFiber;
			return current;
		}
		function updateElement(returnFiber, current, element, lanes) {
			var elementType = element.type;
			if (elementType === REACT_FRAGMENT_TYPE) return returnFiber = updateFragment(returnFiber, current, element.props.children, lanes, element.key), coerceRef(returnFiber, element), returnFiber;
			if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type)) return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
			current = createFiberFromTypeAndProps(element.type, element.key, element.props, null, returnFiber.mode, lanes);
			coerceRef(current, element);
			current.return = returnFiber;
			return current;
		}
		function updatePortal(returnFiber, current, portal, lanes) {
			if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, portal.children || []);
			current.return = returnFiber;
			return current;
		}
		function updateFragment(returnFiber, current, fragment, lanes, key) {
			if (null === current || 7 !== current.tag) return current = createFiberFromFragment(fragment, returnFiber.mode, lanes, key), current.return = returnFiber, current;
			current = useFiber(current, fragment);
			current.return = returnFiber;
			return current;
		}
		function createChild(returnFiber, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return newChild = createFiberFromText("" + newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
					case REACT_PORTAL_TYPE: return newChild = createFiberFromPortal(newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return newChild = createFiberFromFragment(newChild, returnFiber.mode, lanes, null), newChild.return = returnFiber, newChild;
				if ("function" === typeof newChild.then) return createChild(returnFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return createChild(returnFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateSlot(returnFiber, oldFiber, newChild, lanes) {
			var key = null !== oldFiber ? oldFiber.key : null;
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_PORTAL_TYPE: return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateSlot(returnFiber, oldFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateSlot(returnFiber, oldFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
					case REACT_PORTAL_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateFromMap(existingChildren, returnFiber, newIdx, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateFromMap(existingChildren, returnFiber, newIdx, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (newIdx === newChildren.length) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; newIdx < newChildren.length; newIdx++) oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(oldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++) nextOldFiber = updateFromMap(oldFiber, returnFiber, newIdx, newChildren[newIdx], lanes), null !== nextOldFiber && (shouldTrackSideEffects && (newFiber = nextOldFiber.alternate, null !== newFiber && oldFiber.delete(null === newFiber.key ? newIdx : newFiber.key)), currentFirstChild = placeChild(nextOldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
			if (null == newChildren) throw Error(formatProdErrorMessage(151));
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (step.done) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; !step.done; newIdx++, step = newChildren.next()) step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next()) step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && (nextOldFiber = step.alternate, null !== nextOldFiber && oldFiber.delete(null === nextOldFiber.key ? newIdx : nextOldFiber.key)), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
			"object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && void 0 === newChild.props.ref && (newChild = newChild.props.children);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE:
						a: {
							for (var key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) {
									key = newChild.type;
									if (key === REACT_FRAGMENT_TYPE) {
										if (7 === currentFirstChild.tag) {
											deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
											lanes = useFiber(currentFirstChild, newChild.props.children);
											coerceRef(lanes, newChild);
											lanes.return = returnFiber;
											returnFiber = lanes;
											break a;
										}
									} else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
										deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
										lanes = useFiber(currentFirstChild, newChild.props);
										coerceRef(lanes, newChild);
										lanes.return = returnFiber;
										returnFiber = lanes;
										break a;
									}
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								} else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(newChild.props.children, returnFiber.mode, lanes, newChild.key), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
						}
						return placeSingleChild(returnFiber);
					case REACT_PORTAL_TYPE:
						a: {
							for (key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
									deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
									lanes = useFiber(currentFirstChild, newChild.children || []);
									lanes.return = returnFiber;
									returnFiber = lanes;
									break a;
								} else {
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								}
								else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
							lanes.return = returnFiber;
							returnFiber = lanes;
						}
						return placeSingleChild(returnFiber);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				}
				if (isArrayImpl(newChild)) return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
				if (getIteratorFn(newChild)) {
					key = getIteratorFn(newChild);
					if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
					newChild = key.call(newChild);
					return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, lanes);
				}
				if ("function" === typeof newChild.then) return reconcileChildFibersImpl(returnFiber, currentFirstChild, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return reconcileChildFibersImpl(returnFiber, currentFirstChild, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
		}
		return function(returnFiber, currentFirstChild, newChild, lanes) {
			try {
				thenableIndexCounter$1 = 0;
				var firstChildFiber = reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				thenableState$1 = null;
				return firstChildFiber;
			} catch (x) {
				if (x === SuspenseException || x === SuspenseActionException) throw x;
				var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
				fiber.lanes = lanes;
				fiber.return = returnFiber;
				return fiber;
			}
		};
	}
	var reconcileChildFibers = createChildReconciler(!0);
	var mountChildFibers = createChildReconciler(!1);
	var hasForceUpdate = !1;
	function initializeUpdateQueue(fiber) {
		fiber.updateQueue = {
			baseState: fiber.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function cloneUpdateQueue(current, workInProgress) {
		current = current.updateQueue;
		workInProgress.updateQueue === current && (workInProgress.updateQueue = {
			baseState: current.baseState,
			firstBaseUpdate: current.firstBaseUpdate,
			lastBaseUpdate: current.lastBaseUpdate,
			shared: current.shared,
			callbacks: null
		});
	}
	function createUpdate(lane) {
		return {
			lane,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function enqueueUpdate(fiber, update, lane) {
		var updateQueue = fiber.updateQueue;
		if (null === updateQueue) return null;
		updateQueue = updateQueue.shared;
		if (0 !== (executionContext & 2)) {
			var pending = updateQueue.pending;
			null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
			updateQueue.pending = update;
			update = getRootForUpdatedFiber(fiber);
			markUpdateLaneFromFiberToRoot(fiber, null, lane);
			return update;
		}
		enqueueUpdate$1(fiber, updateQueue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function entangleTransitions(root, fiber, lane) {
		fiber = fiber.updateQueue;
		if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
			var queueLanes = fiber.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			fiber.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	function enqueueCapturedUpdate(workInProgress, capturedUpdate) {
		var queue = workInProgress.updateQueue, current = workInProgress.alternate;
		if (null !== current && (current = current.updateQueue, queue === current)) {
			var newFirst = null, newLast = null;
			queue = queue.firstBaseUpdate;
			if (null !== queue) {
				do {
					var clone = {
						lane: queue.lane,
						tag: queue.tag,
						payload: queue.payload,
						callback: null,
						next: null
					};
					null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
					queue = queue.next;
				} while (null !== queue);
				null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
			} else newFirst = newLast = capturedUpdate;
			queue = {
				baseState: current.baseState,
				firstBaseUpdate: newFirst,
				lastBaseUpdate: newLast,
				shared: current.shared,
				callbacks: current.callbacks
			};
			workInProgress.updateQueue = queue;
			return;
		}
		workInProgress = queue.lastBaseUpdate;
		null === workInProgress ? queue.firstBaseUpdate = capturedUpdate : workInProgress.next = capturedUpdate;
		queue.lastBaseUpdate = capturedUpdate;
	}
	var didReadFromEntangledAsyncAction = !1;
	function suspendIfUpdateReadFromEntangledAsyncAction() {
		if (didReadFromEntangledAsyncAction) {
			var entangledActionThenable = currentEntangledActionThenable;
			if (null !== entangledActionThenable) throw entangledActionThenable;
		}
	}
	function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes) {
		didReadFromEntangledAsyncAction = !1;
		var queue = workInProgress$jscomp$0.updateQueue;
		hasForceUpdate = !1;
		var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
		if (null !== pendingQueue) {
			queue.shared.pending = null;
			var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
			lastPendingUpdate.next = null;
			null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
			lastBaseUpdate = lastPendingUpdate;
			var current = workInProgress$jscomp$0.alternate;
			null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
		}
		if (null !== firstBaseUpdate) {
			var newState = queue.baseState;
			lastBaseUpdate = 0;
			current = firstPendingUpdate = lastPendingUpdate = null;
			pendingQueue = firstBaseUpdate;
			do {
				var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
				if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = !0);
					null !== current && (current = current.next = {
						lane: 0,
						tag: pendingQueue.tag,
						payload: pendingQueue.payload,
						callback: null,
						next: null
					});
					a: {
						var workInProgress = workInProgress$jscomp$0, update = pendingQueue;
						updateLane = props;
						var instance = instance$jscomp$0;
						switch (update.tag) {
							case 1:
								workInProgress = update.payload;
								if ("function" === typeof workInProgress) {
									newState = workInProgress.call(instance, newState, updateLane);
									break a;
								}
								newState = workInProgress;
								break a;
							case 3: workInProgress.flags = workInProgress.flags & -65537 | 128;
							case 0:
								workInProgress = update.payload;
								updateLane = "function" === typeof workInProgress ? workInProgress.call(instance, newState, updateLane) : workInProgress;
								if (null === updateLane || void 0 === updateLane) break a;
								newState = assign({}, newState, updateLane);
								break a;
							case 2: hasForceUpdate = !0;
						}
					}
					updateLane = pendingQueue.callback;
					null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
				} else isHiddenUpdate = {
					lane: updateLane,
					tag: pendingQueue.tag,
					payload: pendingQueue.payload,
					callback: pendingQueue.callback,
					next: null
				}, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
				pendingQueue = pendingQueue.next;
				if (null === pendingQueue) if (pendingQueue = queue.shared.pending, null === pendingQueue) break;
				else isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
			} while (1);
			null === current && (lastPendingUpdate = newState);
			queue.baseState = lastPendingUpdate;
			queue.firstBaseUpdate = firstPendingUpdate;
			queue.lastBaseUpdate = current;
			null === firstBaseUpdate && (queue.shared.lanes = 0);
			workInProgressRootSkippedLanes |= lastBaseUpdate;
			workInProgress$jscomp$0.lanes = lastBaseUpdate;
			workInProgress$jscomp$0.memoizedState = newState;
		}
	}
	function callCallback(callback, context) {
		if ("function" !== typeof callback) throw Error(formatProdErrorMessage(191, callback));
		callback.call(context);
	}
	function commitCallbacks(updateQueue, context) {
		var callbacks = updateQueue.callbacks;
		if (null !== callbacks) for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++) callCallback(callbacks[updateQueue], context);
	}
	var currentTreeHiddenStackCursor = createCursor(null);
	var prevEntangledRenderLanesCursor = createCursor(0);
	function pushHiddenContext(fiber, context) {
		fiber = entangledRenderLanes;
		push(prevEntangledRenderLanesCursor, fiber);
		push(currentTreeHiddenStackCursor, context);
		entangledRenderLanes = fiber | context.baseLanes;
	}
	function reuseHiddenContextOnStack() {
		push(prevEntangledRenderLanesCursor, entangledRenderLanes);
		push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
	}
	function popHiddenContext() {
		entangledRenderLanes = prevEntangledRenderLanesCursor.current;
		pop(currentTreeHiddenStackCursor);
		pop(prevEntangledRenderLanesCursor);
	}
	var suspenseHandlerStackCursor = createCursor(null);
	var shellBoundary = null;
	function pushPrimaryTreeSuspenseHandler(handler) {
		var current = handler.alternate;
		push(suspenseStackCursor, suspenseStackCursor.current & 1);
		push(suspenseHandlerStackCursor, handler);
		null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
	}
	function pushDehydratedActivitySuspenseHandler(fiber) {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, fiber);
		null === shellBoundary && (shellBoundary = fiber);
	}
	function pushOffscreenSuspenseHandler(fiber) {
		22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack();
	}
	function reuseSuspenseHandlerOnStack() {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
	}
	function popSuspenseHandler(fiber) {
		pop(suspenseHandlerStackCursor);
		shellBoundary === fiber && (shellBoundary = null);
		pop(suspenseStackCursor);
	}
	var suspenseStackCursor = createCursor(0);
	function pushSuspenseListContext(fiber, newContext) {
		push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
		push(suspenseStackCursor, newContext);
	}
	function popSuspenseListContext(fiber) {
		pop(suspenseStackCursor);
		pop(suspenseHandlerStackCursor);
		shellBoundary === fiber && (shellBoundary = null);
	}
	function findFirstSuspended(row) {
		for (var node = row; null !== node;) {
			if (13 === node.tag) {
				var state = node.memoizedState;
				if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state))) return node;
			} else if (19 === node.tag && "independent" !== node.memoizedProps.revealOrder) {
				if (0 !== (node.flags & 128)) return node;
			} else if (null !== node.child) {
				node.child.return = node;
				node = node.child;
				continue;
			}
			if (node === row) break;
			for (; null === node.sibling;) {
				if (null === node.return || node.return === row) return null;
				node = node.return;
			}
			node.sibling.return = node.return;
			node = node.sibling;
		}
		return null;
	}
	var renderLanes = 0;
	var currentlyRenderingFiber = null;
	var currentHook = null;
	var workInProgressHook = null;
	var didScheduleRenderPhaseUpdate = !1;
	var didScheduleRenderPhaseUpdateDuringThisPass = !1;
	var shouldDoubleInvokeUserFnsInHooksDEV = !1;
	var localIdCounter = 0;
	var thenableIndexCounter = 0;
	var thenableState = null;
	var globalClientIdCounter = 0;
	function throwInvalidHookError() {
		throw Error(formatProdErrorMessage(321));
	}
	function areHookInputsEqual(nextDeps, prevDeps) {
		if (null === prevDeps) return !1;
		for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) if (!objectIs(nextDeps[i], prevDeps[i])) return !1;
		return !0;
	}
	function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderLanes) {
		renderLanes = nextRenderLanes;
		currentlyRenderingFiber = workInProgress;
		workInProgress.memoizedState = null;
		workInProgress.updateQueue = null;
		workInProgress.lanes = 0;
		ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		nextRenderLanes = Component(props, secondArg);
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(workInProgress, Component, props, secondArg));
		finishRenderingHooks(current);
		return nextRenderLanes;
	}
	function finishRenderingHooks(current) {
		ReactSharedInternals.H = ContextOnlyDispatcher;
		var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdate = !1;
		thenableIndexCounter = 0;
		thenableState = null;
		if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
		null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = !0));
	}
	function renderWithHooksAgain(workInProgress, Component, props, secondArg) {
		currentlyRenderingFiber = workInProgress;
		var numberOfReRenders = 0;
		do {
			didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
			thenableIndexCounter = 0;
			didScheduleRenderPhaseUpdateDuringThisPass = !1;
			if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
			numberOfReRenders += 1;
			workInProgressHook = currentHook = null;
			if (null != workInProgress.updateQueue) {
				var children = workInProgress.updateQueue;
				children.lastEffect = null;
				children.events = null;
				children.stores = null;
				null != children.memoCache && (children.memoCache.index = 0);
			}
			ReactSharedInternals.H = HooksDispatcherOnRerender;
			children = Component(props, secondArg);
		} while (didScheduleRenderPhaseUpdateDuringThisPass);
		return children;
	}
	function TransitionAwareHostComponent() {
		var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
		maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
		dispatcher = dispatcher.useState()[0];
		(null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
		return maybeThenable;
	}
	function checkDidRenderIdHook() {
		var didRenderIdHook = 0 !== localIdCounter;
		localIdCounter = 0;
		return didRenderIdHook;
	}
	function bailoutHooks(current, workInProgress, lanes) {
		workInProgress.updateQueue = current.updateQueue;
		workInProgress.flags &= -2053;
		current.lanes &= ~lanes;
	}
	function resetHooksOnUnwind(workInProgress) {
		if (didScheduleRenderPhaseUpdate) {
			for (workInProgress = workInProgress.memoizedState; null !== workInProgress;) {
				var queue = workInProgress.queue;
				null !== queue && (queue.pending = null);
				workInProgress = workInProgress.next;
			}
			didScheduleRenderPhaseUpdate = !1;
		}
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdateDuringThisPass = !1;
		thenableIndexCounter = localIdCounter = 0;
		thenableState = null;
	}
	function mountWorkInProgressHook() {
		var hook = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
		return workInProgressHook;
	}
	function updateWorkInProgressHook() {
		if (null === currentHook) {
			var nextCurrentHook = currentlyRenderingFiber.alternate;
			nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
		} else nextCurrentHook = currentHook.next;
		var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
		if (null !== nextWorkInProgressHook) workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
		else {
			if (null === nextCurrentHook) {
				if (null === currentlyRenderingFiber.alternate) throw Error(formatProdErrorMessage(467));
				throw Error(formatProdErrorMessage(310));
			}
			currentHook = nextCurrentHook;
			nextCurrentHook = {
				memoizedState: currentHook.memoizedState,
				baseState: currentHook.baseState,
				baseQueue: currentHook.baseQueue,
				queue: currentHook.queue,
				next: null
			};
			null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
		}
		return workInProgressHook;
	}
	function createFunctionComponentUpdateQueue() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function useThenable(thenable) {
		var index = thenableIndexCounter;
		thenableIndexCounter += 1;
		null === thenableState && (thenableState = []);
		thenable = trackUsedThenable(thenableState, thenable, index);
		index = currentlyRenderingFiber;
		null === (null === workInProgressHook ? index.memoizedState : workInProgressHook.next) && (index = index.alternate, ReactSharedInternals.H = null === index || null === index.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
		return thenable;
	}
	function use(usable) {
		if (null !== usable && "object" === typeof usable) {
			if ("function" === typeof usable.then) return useThenable(usable);
			if (usable.$$typeof === REACT_RECOVERABLE_TYPE) return;
			if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
		}
		throw Error(formatProdErrorMessage(438, String(usable)));
	}
	function useMemoCache(size) {
		var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
		null !== updateQueue && (memoCache = updateQueue.memoCache);
		if (null == memoCache) {
			var current = currentlyRenderingFiber.alternate;
			null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
				data: current.data.map(function(array) {
					return array.slice();
				}),
				index: 0
			})));
		}
		memoCache ??= {
			data: [],
			index: 0
		};
		null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
		updateQueue.memoCache = memoCache;
		updateQueue = memoCache.data[memoCache.index];
		if (void 0 === updateQueue) for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++) updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
		memoCache.index++;
		return updateQueue;
	}
	function basicStateReducer(state, action) {
		return "function" === typeof action ? action(state) : action;
	}
	function updateReducer(reducer) {
		return updateReducerImpl(updateWorkInProgressHook(), currentHook, reducer);
	}
	function updateReducerImpl(hook, current, reducer) {
		var queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
		if (null !== pendingQueue) {
			if (null !== baseQueue) {
				var baseFirst = baseQueue.next;
				baseQueue.next = pendingQueue.next;
				pendingQueue.next = baseFirst;
			}
			current.baseQueue = baseQueue = pendingQueue;
			queue.pending = null;
		}
		pendingQueue = hook.baseState;
		if (null === baseQueue) hook.memoizedState = pendingQueue;
		else {
			current = baseQueue.next;
			var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$64 = !1;
			do {
				var updateLane = update.lane & -536870913;
				if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					var revertLane = update.revertLane;
					if (0 === revertLane) null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = !0);
					else if ((renderLanes & revertLane) === revertLane) {
						update = update.next;
						revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = !0);
						continue;
					} else updateLane = {
						lane: 0,
						revertLane: update.revertLane,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
					updateLane = update.action;
					shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
					pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
				} else revertLane = {
					lane: updateLane,
					revertLane: update.revertLane,
					gesture: update.gesture,
					action: update.action,
					hasEagerState: update.hasEagerState,
					eagerState: update.eagerState,
					next: null
				}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
				update = update.next;
			} while (null !== update && update !== current);
			null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
			if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = !0, didReadFromEntangledAsyncAction$64 && (reducer = currentEntangledActionThenable, null !== reducer))) throw reducer;
			hook.memoizedState = pendingQueue;
			hook.baseState = baseFirst;
			hook.baseQueue = newBaseQueueLast;
			queue.lastRenderedState = pendingQueue;
		}
		null === baseQueue && (queue.lanes = 0);
		return [hook.memoizedState, queue.dispatch];
	}
	function rerenderReducer(reducer) {
		var hook = updateWorkInProgressHook(), queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
		if (null !== lastRenderPhaseUpdate) {
			queue.pending = null;
			var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
			do
				newState = reducer(newState, update.action), update = update.next;
			while (update !== lastRenderPhaseUpdate);
			objectIs(newState, hook.memoizedState) || (didReceiveUpdate = !0);
			hook.memoizedState = newState;
			null === hook.baseQueue && (hook.baseState = newState);
			queue.lastRenderedState = newState;
		}
		return [newState, dispatch];
	}
	function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
		var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
		if (isHydrating$jscomp$0) {
			if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
			getServerSnapshot = getServerSnapshot();
		} else getServerSnapshot = getSnapshot();
		var snapshotChanged = !objectIs((currentHook || hook).memoizedState, getServerSnapshot);
		snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = !0);
		hook = hook.queue;
		updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [subscribe]);
		subscribe = hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && 0 !== (workInProgressHook.memoizedState.tag & 1);
		pushSimpleEffect(subscribe ? 9 : 8, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, hook, getServerSnapshot, getSnapshot), null);
		if (subscribe) {
			fiber.flags |= 2048;
			if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
			isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
		}
		return getServerSnapshot;
	}
	function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
		fiber.flags |= 16384;
		fiber = {
			getSnapshot,
			value: renderedSnapshot
		};
		getSnapshot = currentlyRenderingFiber.updateQueue;
		null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
	}
	function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
		inst.value = nextSnapshot;
		inst.getSnapshot = getSnapshot;
		checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
	}
	function subscribeToStore(fiber, inst, subscribe) {
		return subscribe(function() {
			checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
		});
	}
	function checkIfSnapshotChanged(inst) {
		var latestGetSnapshot = inst.getSnapshot;
		inst = inst.value;
		try {
			var nextValue = latestGetSnapshot();
			return !objectIs(inst, nextValue);
		} catch (error) {
			return !0;
		}
	}
	function forceStoreRerender(fiber) {
		var root = enqueueConcurrentRenderForLane(fiber, 2);
		null !== root && scheduleUpdateOnFiber(root, fiber, 2);
	}
	function mountStateImpl(initialState) {
		var hook = mountWorkInProgressHook();
		if ("function" === typeof initialState) {
			var initialStateInitializer = initialState;
			initialState = initialStateInitializer();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					initialStateInitializer();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
		}
		hook.memoizedState = hook.baseState = initialState;
		hook.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: basicStateReducer,
			lastRenderedState: initialState
		};
		return hook;
	}
	function updateOptimisticImpl(hook, current, passthrough, reducer) {
		hook.baseState = passthrough;
		return updateReducerImpl(hook, currentHook, "function" === typeof reducer ? reducer : basicStateReducer);
	}
	function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
		if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
		fiber = actionQueue.action;
		if (null !== fiber) {
			var actionNode = {
				payload,
				action: fiber,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(listener) {
					actionNode.listeners.push(listener);
				}
			};
			null !== ReactSharedInternals.T ? setPendingState(!0) : actionNode.isTransition = !1;
			setState(actionNode);
			setPendingState = actionQueue.pending;
			null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
		}
	}
	function runActionStateAction(actionQueue, node) {
		var action = node.action, payload = node.payload, prevState = actionQueue.state;
		if (node.isTransition) {
			var prevTransition = ReactSharedInternals.T, currentTransition = {};
			currentTransition.types = null !== prevTransition ? prevTransition.types : null;
			ReactSharedInternals.T = currentTransition;
			try {
				var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
				null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
				handleActionReturnValue(actionQueue, node, returnValue);
			} catch (error) {
				onActionError(actionQueue, node, error);
			} finally {
				null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
			}
		} else try {
			prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
		} catch (error$70) {
			onActionError(actionQueue, node, error$70);
		}
	}
	function handleActionReturnValue(actionQueue, node, returnValue) {
		null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(function(nextState) {
			onActionSuccess(actionQueue, node, nextState);
		}, function(error) {
			return onActionError(actionQueue, node, error);
		}) : onActionSuccess(actionQueue, node, returnValue);
	}
	function onActionSuccess(actionQueue, actionNode, nextState) {
		actionNode.status = "fulfilled";
		actionNode.value = nextState;
		notifyActionListeners(actionNode);
		actionQueue.state = nextState;
		actionNode = actionQueue.pending;
		null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
	}
	function onActionError(actionQueue, actionNode, error) {
		var last = actionQueue.pending;
		actionQueue.pending = null;
		if (null !== last) {
			last = last.next;
			do
				actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
			while (actionNode !== last);
		}
		actionQueue.action = null;
	}
	function notifyActionListeners(actionNode) {
		actionNode = actionNode.listeners;
		for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
	}
	function actionStateReducer(oldState, newState) {
		return newState;
	}
	function mountActionState(action, initialStateProp) {
		if (isHydrating) {
			var ssrFormState = workInProgressRoot.formState;
			if (null !== ssrFormState) {
				a: {
					var JSCompiler_inline_result = currentlyRenderingFiber;
					if (isHydrating) {
						if (nextHydratableInstance) {
							b: {
								var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
								for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType;) {
									if (!inRootOrSingleton) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
									JSCompiler_inline_result$jscomp$0 = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
									if (null === JSCompiler_inline_result$jscomp$0) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
								}
								inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
								JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
							}
							if (JSCompiler_inline_result$jscomp$0) {
								nextHydratableInstance = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
								JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
								break a;
							}
						}
						throwOnHydrationMismatch(JSCompiler_inline_result);
					}
					JSCompiler_inline_result = !1;
				}
				JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
			}
		}
		ssrFormState = mountWorkInProgressHook();
		ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
		JSCompiler_inline_result = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: actionStateReducer,
			lastRenderedState: initialStateProp
		};
		ssrFormState.queue = JSCompiler_inline_result;
		ssrFormState = dispatchSetState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result);
		JSCompiler_inline_result.dispatch = ssrFormState;
		JSCompiler_inline_result = mountStateImpl(!1);
		inRootOrSingleton = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !1, JSCompiler_inline_result.queue);
		JSCompiler_inline_result = mountWorkInProgressHook();
		JSCompiler_inline_result$jscomp$0 = {
			state: initialStateProp,
			dispatch: null,
			action,
			pending: null
		};
		JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
		ssrFormState = dispatchActionState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result$jscomp$0, inRootOrSingleton, ssrFormState);
		JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
		JSCompiler_inline_result.memoizedState = action;
		return [
			initialStateProp,
			ssrFormState,
			!1
		];
	}
	function updateActionState(action) {
		return updateActionStateImpl(updateWorkInProgressHook(), currentHook, action);
	}
	function updateActionStateImpl(stateHook, currentStateHook, action) {
		currentStateHook = updateReducerImpl(stateHook, currentStateHook, actionStateReducer)[0];
		stateHook = updateReducer(basicStateReducer)[0];
		if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then) try {
			var state = useThenable(currentStateHook);
		} catch (x) {
			if (x === SuspenseException) throw SuspenseActionException;
			throw x;
		}
		else state = currentStateHook;
		currentStateHook = updateWorkInProgressHook();
		var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
		action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(9, { destroy: void 0 }, actionStateActionEffect.bind(null, actionQueue, action), null));
		return [
			state,
			dispatch,
			stateHook
		];
	}
	function actionStateActionEffect(actionQueue, action) {
		actionQueue.action = action;
	}
	function rerenderActionState(action) {
		var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
		if (null !== currentStateHook) return updateActionStateImpl(stateHook, currentStateHook, action);
		updateWorkInProgressHook();
		stateHook = stateHook.memoizedState;
		currentStateHook = updateWorkInProgressHook();
		var dispatch = currentStateHook.queue.dispatch;
		currentStateHook.memoizedState = action;
		return [
			stateHook,
			dispatch,
			!1
		];
	}
	function pushSimpleEffect(tag, inst, create, deps) {
		tag = {
			tag,
			create,
			deps,
			inst,
			next: null
		};
		inst = currentlyRenderingFiber.updateQueue;
		null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
		create = inst.lastEffect;
		null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
		return tag;
	}
	function updateRef() {
		return updateWorkInProgressHook().memoizedState;
	}
	function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = mountWorkInProgressHook();
		currentlyRenderingFiber.flags |= fiberFlags;
		hook.memoizedState = pushSimpleEffect(1 | hookFlags, { destroy: void 0 }, create, void 0 === deps ? null : deps);
	}
	function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var inst = hook.memoizedState.inst;
		null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(1 | hookFlags, inst, create, deps));
	}
	function mountEffect(create, deps) {
		mountEffectImpl(8390656, 8, create, deps);
	}
	function updateEffect(create, deps) {
		updateEffectImpl(2048, 8, create, deps);
	}
	function useEffectEventImpl(payload) {
		currentlyRenderingFiber.flags |= 4;
		var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
		if (null === componentUpdateQueue) componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
		else {
			var events = componentUpdateQueue.events;
			null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
		}
	}
	function updateEvent(callback) {
		var ref = updateWorkInProgressHook().memoizedState;
		useEffectEventImpl({
			ref,
			nextImpl: callback
		});
		return function() {
			if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
			return ref.impl.apply(void 0, arguments);
		};
	}
	function updateInsertionEffect(create, deps) {
		return updateEffectImpl(4, 2, create, deps);
	}
	function updateLayoutEffect(create, deps) {
		return updateEffectImpl(4, 4, create, deps);
	}
	function imperativeHandleEffect(create, ref) {
		if ("function" === typeof ref) {
			create = create();
			var refCleanup = ref(create);
			return function() {
				"function" === typeof refCleanup ? refCleanup() : ref(null);
			};
		}
		if (null !== ref && void 0 !== ref) return create = create(), ref.current = create, function() {
			ref.current = null;
		};
	}
	function updateImperativeHandle(ref, create, deps) {
		deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
		updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
	}
	function mountDebugValue() {}
	function updateCallback(callback, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		hook.memoizedState = [callback, deps];
		return callback;
	}
	function updateMemo(nextCreate, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		prevState = nextCreate();
		if (shouldDoubleInvokeUserFnsInHooksDEV) {
			setIsStrictModeForDevtools(!0);
			try {
				nextCreate();
			} finally {
				setIsStrictModeForDevtools(!1);
			}
		}
		hook.memoizedState = [prevState, deps];
		return prevState;
	}
	function mountDeferredValueImpl(hook, value, initialValue) {
		if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return hook.memoizedState = value;
		hook.memoizedState = initialValue;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return initialValue;
	}
	function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
		if (objectIs(value, prevValue)) return value;
		if (null !== currentTreeHiddenStackCursor.current) return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = !0), hook;
		if (0 === (renderLanes & 106) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return didReceiveUpdate = !0, hook.memoizedState = value;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return prevValue;
	}
	function startTransition(fiber, queue, pendingState, finishedState, callback) {
		var previousPriority = ReactDOMSharedInternals.p;
		ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		currentTransition.types = null !== prevTransition ? prevTransition.types : null;
		ReactSharedInternals.T = currentTransition;
		dispatchOptimisticSetState(fiber, !1, queue, pendingState);
		try {
			var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) dispatchSetStateInternal(fiber, queue, chainThenableValue(returnValue, finishedState), requestUpdateLane(fiber));
			else dispatchSetStateInternal(fiber, queue, finishedState, requestUpdateLane(fiber));
		} catch (error) {
			dispatchSetStateInternal(fiber, queue, {
				then: function() {},
				status: "rejected",
				reason: error
			}, requestUpdateLane());
		} finally {
			ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	}
	function noop() {}
	function startHostTransition(formFiber, pendingState, action, formData) {
		if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
		var queue = ensureFormComponentIsStateful(formFiber).queue;
		startTransition(formFiber, queue, pendingState, sharedNotPendingObject, null === action ? noop : function() {
			requestFormReset$1(formFiber);
			return action(formData);
		});
	}
	function ensureFormComponentIsStateful(formFiber) {
		var existingStateHook = formFiber.memoizedState;
		if (null !== existingStateHook) return existingStateHook;
		existingStateHook = {
			memoizedState: sharedNotPendingObject,
			baseState: sharedNotPendingObject,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: sharedNotPendingObject
			},
			next: null
		};
		var initialResetState = {};
		existingStateHook.next = {
			memoizedState: initialResetState,
			baseState: initialResetState,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: initialResetState
			},
			next: null
		};
		formFiber.memoizedState = existingStateHook;
		formFiber = formFiber.alternate;
		null !== formFiber && (formFiber.memoizedState = existingStateHook);
		return existingStateHook;
	}
	function requestFormReset$1(formFiber) {
		var stateHook = ensureFormComponentIsStateful(formFiber);
		null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
		dispatchSetStateInternal(formFiber, stateHook.next.queue, {}, requestUpdateLane());
	}
	function useHostTransitionStatus() {
		return readContext(HostTransitionContext);
	}
	function updateId() {
		return updateWorkInProgressHook().memoizedState;
	}
	function updateRefresh() {
		return updateWorkInProgressHook().memoizedState;
	}
	function refreshCache(fiber) {
		for (var provider = fiber.return; null !== provider;) {
			switch (provider.tag) {
				case 24:
				case 3:
					var lane = requestUpdateLane();
					fiber = createUpdate(lane);
					var root$73 = enqueueUpdate(provider, fiber, lane);
					null !== root$73 && (scheduleUpdateOnFiber(root$73, provider, lane), entangleTransitions(root$73, provider, lane));
					provider = { cache: createCache() };
					fiber.payload = provider;
					return;
			}
			provider = provider.return;
		}
	}
	function dispatchReducerAction(fiber, queue, action) {
		var lane = requestUpdateLane();
		action = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
	}
	function dispatchSetState(fiber, queue, action) {
		dispatchSetStateInternal(fiber, queue, action, requestUpdateLane());
	}
	function dispatchSetStateInternal(fiber, queue, action, lane) {
		var update = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
		else {
			var alternate = fiber.alternate;
			if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate)) try {
				var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
				update.hasEagerState = !0;
				update.eagerState = eagerState;
				if (objectIs(eagerState, currentState)) return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), !1;
			} catch (error) {}
			action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
			if (null !== action) return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), !0;
		}
		return !1;
	}
	function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
		action = {
			lane: 2,
			revertLane: requestTransitionLane(),
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) {
			if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
		} else throwIfDuringRender = enqueueConcurrentHookUpdate(fiber, queue, action, 2), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
	}
	function isRenderPhaseUpdate(fiber) {
		var alternate = fiber.alternate;
		return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
	}
	function enqueueRenderPhaseUpdate(queue, update) {
		didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = !0;
		var pending = queue.pending;
		null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
		queue.pending = update;
	}
	function entangleTransitionUpdate(root, queue, lane) {
		if (0 !== (lane & 4194048)) {
			var queueLanes = queue.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			queue.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	var ContextOnlyDispatcher = {
		readContext,
		use,
		useCallback: throwInvalidHookError,
		useContext: throwInvalidHookError,
		useEffect: throwInvalidHookError,
		useImperativeHandle: throwInvalidHookError,
		useLayoutEffect: throwInvalidHookError,
		useInsertionEffect: throwInvalidHookError,
		useMemo: throwInvalidHookError,
		useReducer: throwInvalidHookError,
		useRef: throwInvalidHookError,
		useState: throwInvalidHookError,
		useDebugValue: throwInvalidHookError,
		useDeferredValue: throwInvalidHookError,
		useTransition: throwInvalidHookError,
		useSyncExternalStore: throwInvalidHookError,
		useId: throwInvalidHookError,
		useHostTransitionStatus: throwInvalidHookError,
		useFormState: throwInvalidHookError,
		useActionState: throwInvalidHookError,
		useOptimistic: throwInvalidHookError,
		useMemoCache: throwInvalidHookError,
		useCacheRefresh: throwInvalidHookError,
		useEffectEvent: throwInvalidHookError
	};
	var HooksDispatcherOnMount = {
		readContext,
		use,
		useCallback: function(callback, deps) {
			mountWorkInProgressHook().memoizedState = [callback, void 0 === deps ? null : deps];
			return callback;
		},
		useContext: readContext,
		useEffect: mountEffect,
		useImperativeHandle: function(ref, create, deps) {
			deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
			mountEffectImpl(4194308, 4, imperativeHandleEffect.bind(null, create, ref), deps);
		},
		useLayoutEffect: function(create, deps) {
			return mountEffectImpl(4194308, 4, create, deps);
		},
		useInsertionEffect: function(create, deps) {
			mountEffectImpl(4, 2, create, deps);
		},
		useMemo: function(nextCreate, deps) {
			var hook = mountWorkInProgressHook();
			deps = void 0 === deps ? null : deps;
			var nextValue = nextCreate();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					nextCreate();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
			hook.memoizedState = [nextValue, deps];
			return nextValue;
		},
		useReducer: function(reducer, initialArg, init) {
			var hook = mountWorkInProgressHook();
			if (void 0 !== init) {
				var initialState = init(initialArg);
				if (shouldDoubleInvokeUserFnsInHooksDEV) {
					setIsStrictModeForDevtools(!0);
					try {
						init(initialArg);
					} finally {
						setIsStrictModeForDevtools(!1);
					}
				}
			} else initialState = initialArg;
			hook.memoizedState = hook.baseState = initialState;
			reducer = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: reducer,
				lastRenderedState: initialState
			};
			hook.queue = reducer;
			reducer = reducer.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, reducer);
			return [hook.memoizedState, reducer];
		},
		useRef: function(initialValue) {
			var hook = mountWorkInProgressHook();
			initialValue = { current: initialValue };
			return hook.memoizedState = initialValue;
		},
		useState: function(initialState) {
			initialState = mountStateImpl(initialState);
			var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
			queue.dispatch = dispatch;
			return [initialState.memoizedState, dispatch];
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return mountDeferredValueImpl(mountWorkInProgressHook(), value, initialValue);
		},
		useTransition: function() {
			var stateHook = mountStateImpl(!1);
			stateHook = startTransition.bind(null, currentlyRenderingFiber, stateHook.queue, !0, !1);
			mountWorkInProgressHook().memoizedState = stateHook;
			return [!1, stateHook];
		},
		useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
			var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
			if (isHydrating) {
				if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
				getServerSnapshot = getServerSnapshot();
			} else {
				getServerSnapshot = getSnapshot();
				if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
				0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
			}
			hook.memoizedState = getServerSnapshot;
			var inst = {
				value: getServerSnapshot,
				getSnapshot
			};
			hook.queue = inst;
			mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [subscribe]);
			fiber.flags |= 2048;
			pushSimpleEffect(9, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, inst, getServerSnapshot, getSnapshot), null);
			return getServerSnapshot;
		},
		useId: function() {
			var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
			if (isHydrating) {
				var JSCompiler_inline_result = treeContextOverflow;
				var idWithLeadingBit = treeContextId;
				JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
				identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
				JSCompiler_inline_result = localIdCounter++;
				0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
				identifierPrefix += "_";
			} else JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
			return hook.memoizedState = identifierPrefix;
		},
		useHostTransitionStatus,
		useFormState: mountActionState,
		useActionState: mountActionState,
		useOptimistic: function(passthrough) {
			var hook = mountWorkInProgressHook();
			hook.memoizedState = hook.baseState = passthrough;
			var queue = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			hook.queue = queue;
			hook = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !0, queue);
			queue.dispatch = hook;
			return [passthrough, hook];
		},
		useMemoCache,
		useCacheRefresh: function() {
			return mountWorkInProgressHook().memoizedState = refreshCache.bind(null, currentlyRenderingFiber);
		},
		useEffectEvent: function(callback) {
			var hook = mountWorkInProgressHook(), ref = { impl: callback };
			hook.memoizedState = ref;
			return function() {
				if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
				return ref.impl.apply(void 0, arguments);
			};
		}
	};
	var HooksDispatcherOnUpdate = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: updateReducer,
		useRef: updateRef,
		useState: function() {
			return updateReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return updateDeferredValueImpl(updateWorkInProgressHook(), currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: updateActionState,
		useActionState: updateActionState,
		useOptimistic: function(passthrough, reducer) {
			return updateOptimisticImpl(updateWorkInProgressHook(), currentHook, passthrough, reducer);
		},
		useMemoCache,
		useCacheRefresh: updateRefresh,
		useEffectEvent: updateEvent
	};
	var HooksDispatcherOnRerender = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: rerenderReducer,
		useRef: updateRef,
		useState: function() {
			return rerenderReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			var hook = updateWorkInProgressHook();
			return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(hook, currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: rerenderActionState,
		useActionState: rerenderActionState,
		useOptimistic: function(passthrough, reducer) {
			var hook = updateWorkInProgressHook();
			if (null !== currentHook) return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
			hook.baseState = passthrough;
			return [passthrough, hook.queue.dispatch];
		},
		useMemoCache,
		useCacheRefresh: updateRefresh,
		useEffectEvent: updateEvent
	};
	function applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, nextProps) {
		ctor = workInProgress.memoizedState;
		getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
		getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
		workInProgress.memoizedState = getDerivedStateFromProps;
		0 === workInProgress.lanes && (workInProgress.updateQueue.baseState = getDerivedStateFromProps);
	}
	var classComponentUpdater = {
		enqueueSetState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueReplaceState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 1;
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueForceUpdate: function(inst, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 2;
			void 0 !== callback && null !== callback && (update.callback = callback);
			callback = enqueueUpdate(inst, update, lane);
			null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
		}
	};
	function checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext) {
		workInProgress = workInProgress.stateNode;
		return "function" === typeof workInProgress.shouldComponentUpdate ? workInProgress.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : !0;
	}
	function callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext) {
		workInProgress = instance.state;
		"function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
		"function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
		instance.state !== workInProgress && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
	}
	function resolveClassComponentProps(Component, baseProps) {
		var newProps = baseProps;
		if ("ref" in baseProps) {
			newProps = {};
			for (var propName in baseProps) "ref" !== propName && (newProps[propName] = baseProps[propName]);
		}
		if (Component = Component.defaultProps) {
			newProps === baseProps && (newProps = assign({}, newProps));
			for (var propName$77 in Component) void 0 === newProps[propName$77] && (newProps[propName$77] = Component[propName$77]);
		}
		return newProps;
	}
	function defaultOnUncaughtError(error) {
		reportGlobalError(error);
	}
	function defaultOnCaughtError(error) {
		console.error(error);
	}
	function defaultOnRecoverableError(error) {
		reportGlobalError(error);
	}
	function logUncaughtError(root, errorInfo) {
		try {
			var onUncaughtError = root.onUncaughtError;
			onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
		} catch (e$78) {
			setTimeout(function() {
				throw e$78;
			});
		}
	}
	function logCaughtError(root, boundary, errorInfo) {
		try {
			var onCaughtError = root.onCaughtError;
			onCaughtError(errorInfo.value, {
				componentStack: errorInfo.stack,
				errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
			});
		} catch (e$79) {
			setTimeout(function() {
				throw e$79;
			});
		}
	}
	function createRootErrorUpdate(root, errorInfo, lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		lane.payload = { element: null };
		lane.callback = function() {
			logUncaughtError(root, errorInfo);
		};
		return lane;
	}
	function createClassErrorUpdate(lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		return lane;
	}
	function initializeClassErrorUpdate(update, root, fiber, errorInfo) {
		var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
		if ("function" === typeof getDerivedStateFromError) {
			var error = errorInfo.value;
			update.payload = function() {
				return getDerivedStateFromError(error);
			};
			update.callback = function() {
				logCaughtError(root, fiber, errorInfo);
			};
		}
		var inst = fiber.stateNode;
		null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
			logCaughtError(root, fiber, errorInfo);
			"function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
			var stack = errorInfo.stack;
			this.componentDidCatch(errorInfo.value, { componentStack: null !== stack ? stack : "" });
		});
	}
	function throwException(root, returnFiber, sourceFiber, value, rootRenderLanes) {
		sourceFiber.flags |= 32768;
		if (null !== value && "object" === typeof value && "function" === typeof value.then) {
			returnFiber = sourceFiber.alternate;
			null !== returnFiber && propagateParentContextChanges(returnFiber, sourceFiber, rootRenderLanes, !0);
			sourceFiber = suspenseHandlerStackCursor.current;
			if (null !== sourceFiber) {
				switch (sourceFiber.tag) {
					case 31:
					case 13:
					case 19: return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root, value, rootRenderLanes)), !1;
					case 22: return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([value])
					}, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root, value, rootRenderLanes)), !1;
				}
				throw Error(formatProdErrorMessage(435, sourceFiber.tag));
			}
			attachPingListener(root, value, rootRenderLanes);
			renderDidSuspendDelayIfPossible();
			return !1;
		}
		if (isHydrating) return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), { cause: value }), queueHydrationError(createCapturedValueAtFiber(returnFiber, sourceFiber))), root = root.current.alternate, root.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(root.stateNode, value, rootRenderLanes), enqueueCapturedUpdate(root, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), !1;
		var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
		wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
		null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
		4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
		if (null === returnFiber) return !0;
		value = createCapturedValueAtFiber(value, sourceFiber);
		sourceFiber = returnFiber;
		do {
			switch (sourceFiber.tag) {
				case 3: return sourceFiber.flags |= 65536, root = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root, root = createRootErrorUpdate(sourceFiber.stateNode, value, root), enqueueCapturedUpdate(sourceFiber, root), !1;
				case 1:
					returnFiber = sourceFiber.type;
					wrapperError = sourceFiber.stateNode;
					if (0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError)))) return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(rootRenderLanes, root, sourceFiber, value), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), !1;
					break;
				case 22: if (null !== sourceFiber.memoizedState) return sourceFiber.flags |= 65536, !1;
			}
			sourceFiber = sourceFiber.return;
		} while (null !== sourceFiber);
		return !1;
	}
	var SelectiveHydrationException = Error(formatProdErrorMessage(461));
	var didReceiveUpdate = !1;
	function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
		workInProgress.child = null === current ? mountChildFibers(workInProgress, null, nextChildren, renderLanes) : reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
	}
	function updateForwardRef(current, workInProgress, Component, nextProps, renderLanes) {
		Component = Component.render;
		var ref = workInProgress.ref;
		if ("ref" in nextProps) {
			var propsWithoutRef = {};
			for (var key in nextProps) "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
		} else propsWithoutRef = nextProps;
		prepareToReadContext(workInProgress);
		nextProps = renderWithHooks(current, workInProgress, Component, propsWithoutRef, ref, renderLanes);
		key = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && key && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null === current) {
			var type = Component.type;
			if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare) return workInProgress.tag = 15, workInProgress.type = type, updateSimpleMemoComponent(current, workInProgress, type, nextProps, renderLanes);
			current = createFiberFromTypeAndProps(Component.type, null, nextProps, workInProgress, workInProgress.mode, renderLanes);
			current.ref = workInProgress.ref;
			current.return = workInProgress;
			return workInProgress.child = current;
		}
		type = current.child;
		if (!checkScheduledUpdateOrContext(current, renderLanes)) {
			var prevProps = type.memoizedProps;
			Component = Component.compare;
			Component = null !== Component ? Component : shallowEqual;
			if (Component(prevProps, nextProps) && current.ref === workInProgress.ref) return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		workInProgress.flags |= 1;
		current = createWorkInProgress(type, nextProps);
		current.ref = workInProgress.ref;
		current.return = workInProgress;
		return workInProgress.child = current;
	}
	function updateSimpleMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null !== current) {
			var prevProps = current.memoizedProps;
			if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress.ref) if (didReceiveUpdate = !1, workInProgress.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes)) 0 !== (current.flags & 131072) && (didReceiveUpdate = !0);
			else return workInProgress.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		return updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes);
	}
	function updateOffscreenComponent(current, workInProgress, renderLanes, nextProps) {
		var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
		null === current && null === workInProgress.stateNode && (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		if ("hidden" === nextProps.mode) {
			if (0 !== (workInProgress.flags & 128)) {
				prevState = null !== prevState ? prevState.baseLanes | renderLanes : renderLanes;
				if (null !== current) {
					nextProps = workInProgress.child = current.child;
					for (nextChildren = 0; null !== nextProps;) nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
					nextProps = nextChildren & ~prevState;
				} else nextProps = 0, workInProgress.child = null;
				return deferHiddenOffscreenComponent(current, workInProgress, prevState, renderLanes, nextProps);
			}
			if (0 !== (renderLanes & 536870912)) workInProgress.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, null !== current && pushTransition(workInProgress, null !== prevState ? prevState.cachePool : null), null !== prevState ? pushHiddenContext(workInProgress, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress);
			else return nextProps = workInProgress.lanes = 536870912, deferHiddenOffscreenComponent(current, workInProgress, null !== prevState ? prevState.baseLanes | renderLanes : renderLanes, renderLanes, nextProps);
		} else null !== prevState ? (pushTransition(workInProgress, prevState.cachePool), pushHiddenContext(workInProgress, prevState), reuseSuspenseHandlerOnStack(), workInProgress.memoizedState = null) : (null !== current && pushTransition(workInProgress, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	function bailoutOffscreenComponent(current, workInProgress) {
		null !== current && 22 === current.tag || null !== workInProgress.stateNode || (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		return workInProgress.sibling;
	}
	function deferHiddenOffscreenComponent(current, workInProgress, nextBaseLanes, renderLanes, remainingChildLanes) {
		var JSCompiler_inline_result = peekCacheFromPool();
		JSCompiler_inline_result = null === JSCompiler_inline_result ? null : {
			parent: CacheContext._currentValue,
			pool: JSCompiler_inline_result
		};
		workInProgress.memoizedState = {
			baseLanes: nextBaseLanes,
			cachePool: JSCompiler_inline_result
		};
		null !== current && pushTransition(workInProgress, null);
		reuseHiddenContextOnStack();
		pushOffscreenSuspenseHandler(workInProgress);
		null !== current && propagateParentContextChanges(current, workInProgress, renderLanes, !0);
		workInProgress.childLanes = remainingChildLanes;
		return null;
	}
	function mountActivityChildren(workInProgress, nextProps) {
		nextProps = mountWorkInProgressOffscreenFiber({
			mode: nextProps.mode,
			children: nextProps.children
		}, workInProgress.mode);
		nextProps.ref = workInProgress.ref;
		workInProgress.child = nextProps;
		nextProps.return = workInProgress;
		return nextProps;
	}
	function retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountActivityChildren(workInProgress, workInProgress.pendingProps);
		current.flags |= 2;
		popSuspenseHandler(workInProgress);
		workInProgress.memoizedState = null;
		return current;
	}
	function updateActivityComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, didSuspend = 0 !== (workInProgress.flags & 128);
		workInProgress.flags &= -129;
		if (null === current) {
			if (isHydrating) {
				if ("hidden" === nextProps.mode) return current = mountActivityChildren(workInProgress, nextProps), workInProgress.lanes = 536870912, current.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, bailoutOffscreenComponent(null, current);
				pushDehydratedActivitySuspenseHandler(workInProgress);
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				workInProgress.lanes = 536870912;
				return null;
			}
			return mountActivityChildren(workInProgress, nextProps);
		}
		var prevState = current.memoizedState;
		if (null !== prevState) {
			var dehydrated = prevState.dehydrated;
			pushDehydratedActivitySuspenseHandler(workInProgress);
			if (didSuspend) if (workInProgress.flags & 256) workInProgress.flags &= -257, workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			else if (null !== workInProgress.memoizedState) workInProgress.child = current.child, workInProgress.flags |= 128, workInProgress = null;
			else throw Error(formatProdErrorMessage(558));
			else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1), didSuspend = 0 !== (renderLanes & current.childLanes), didReceiveUpdate || didSuspend) {
				if (null === currentTreeHiddenStackCursor.current) {
					nextProps = workInProgressRoot;
					if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes), 0 !== dehydrated && dehydrated !== prevState.retryLane)) throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
					renderDidSuspendDelayIfPossible();
				}
				workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			} else current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress, isHydrating = !0, hydrationErrors = null, rootOrSingletonContext = !1, null !== current && restoreSuspendedTreeContext(workInProgress, current), workInProgress = mountActivityChildren(workInProgress, nextProps), workInProgress.flags |= 134221824;
			return workInProgress;
		}
		current = createWorkInProgress(current.child, {
			mode: nextProps.mode,
			children: nextProps.children
		});
		current.ref = workInProgress.ref;
		workInProgress.child = current;
		current.return = workInProgress;
		return current;
	}
	function markRef(current, workInProgress) {
		var ref = workInProgress.ref;
		if (null === ref) null !== current && null !== current.ref && (workInProgress.flags |= 4194816);
		else {
			if ("function" !== typeof ref && "object" !== typeof ref) throw Error(formatProdErrorMessage(284));
			if (null === current || current.ref !== ref) workInProgress.flags |= 4194816;
		}
	}
	function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		Component = renderWithHooks(current, workInProgress, Component, nextProps, void 0, renderLanes);
		nextProps = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && nextProps && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, Component, renderLanes);
		return workInProgress.child;
	}
	function replayFunctionComponent(current, workInProgress, nextProps, Component, secondArg, renderLanes) {
		prepareToReadContext(workInProgress);
		workInProgress.updateQueue = null;
		nextProps = renderWithHooksAgain(workInProgress, Component, nextProps, secondArg);
		finishRenderingHooks(current);
		Component = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && Component && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateClassComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		if (null === workInProgress.stateNode) {
			var context = emptyContextObject, contextType = Component.contextType;
			"object" === typeof contextType && null !== contextType && (context = readContext(contextType));
			context = new Component(nextProps, context);
			workInProgress.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
			context.updater = classComponentUpdater;
			workInProgress.stateNode = context;
			context._reactInternals = workInProgress;
			context = workInProgress.stateNode;
			context.props = nextProps;
			context.state = workInProgress.memoizedState;
			context.refs = {};
			initializeUpdateQueue(workInProgress);
			contextType = Component.contextType;
			context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
			context.state = workInProgress.memoizedState;
			contextType = Component.getDerivedStateFromProps;
			"function" === typeof contextType && (applyDerivedStateFromProps(workInProgress, Component, contextType, nextProps), context.state = workInProgress.memoizedState);
			"function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress, nextProps, context, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress.memoizedState);
			"function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308);
			nextProps = !0;
		} else if (null === current) {
			context = workInProgress.stateNode;
			var unresolvedOldProps = workInProgress.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
			context.props = oldProps;
			var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
			contextType = emptyContextObject;
			"object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
			var getDerivedStateFromProps = Component.getDerivedStateFromProps;
			contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
			unresolvedOldProps = workInProgress.pendingProps !== unresolvedOldProps;
			contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(workInProgress, context, nextProps, contextType);
			hasForceUpdate = !1;
			var oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			oldContext = workInProgress.memoizedState;
			unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(workInProgress, Component, getDerivedStateFromProps, nextProps), oldContext = workInProgress.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, oldProps, nextProps, oldState, oldContext, contextType)) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), nextProps = !1);
		} else {
			context = workInProgress.stateNode;
			cloneUpdateQueue(current, workInProgress);
			contextType = workInProgress.memoizedProps;
			contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
			context.props = contextType$jscomp$0;
			getDerivedStateFromProps = workInProgress.pendingProps;
			oldState = context.context;
			oldContext = Component.contextType;
			oldProps = emptyContextObject;
			"object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
			unresolvedOldProps = Component.getDerivedStateFromProps;
			(oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(workInProgress, context, nextProps, oldProps);
			hasForceUpdate = !1;
			oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			var newState = workInProgress.memoizedState;
			contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(workInProgress, Component, unresolvedOldProps, nextProps), newState = workInProgress.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, contextType$jscomp$0, nextProps, oldState, newState, oldProps) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(nextProps, newState, oldProps)), "function" === typeof context.componentDidUpdate && (workInProgress.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), nextProps = !1);
		}
		context = nextProps;
		markRef(current, workInProgress);
		nextProps = 0 !== (workInProgress.flags & 128);
		context || nextProps ? (context = workInProgress.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress.flags |= 1, null !== current && nextProps ? (workInProgress.child = reconcileChildFibers(workInProgress, current.child, null, renderLanes), workInProgress.child = reconcileChildFibers(workInProgress, null, Component, renderLanes)) : reconcileChildren(current, workInProgress, Component, renderLanes), workInProgress.memoizedState = context.state, current = workInProgress.child) : current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		return current;
	}
	function mountHostRootWithoutHydrating(current, workInProgress, nextChildren, renderLanes) {
		resetHydrationState();
		workInProgress.flags |= 256;
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	var SUSPENDED_MARKER = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function mountSuspenseOffscreenState(renderLanes) {
		return {
			baseLanes: renderLanes,
			cachePool: getSuspendedCache()
		};
	}
	function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes) {
		current = null !== current ? current.childLanes & ~renderLanes : 0;
		primaryTreeDidDefer && (current |= workInProgressDeferredLane);
		return current;
	}
	function updateSuspenseComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, showFallback = !1, didSuspend = 0 !== (workInProgress.flags & 128), JSCompiler_temp;
		(JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? !1 : 0 !== (suspenseStackCursor.current & 2));
		JSCompiler_temp && (showFallback = !0, workInProgress.flags &= -129);
		JSCompiler_temp = 0 !== (workInProgress.flags & 32);
		workInProgress.flags &= -33;
		if (null === current) {
			if (isHydrating) {
				showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress) : reuseSuspenseHandlerOnStack();
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				isSuspenseInstanceFallback(current) ? workInProgress.lanes = 32 : workInProgress.lanes = 536870912;
				return null;
			}
			didSuspend = nextProps.children;
			nextProps = nextProps.fallback;
			if (showFallback) return reuseSuspenseHandlerOnStack(), showFallback = workInProgress.mode, didSuspend = mountWorkInProgressOffscreenFiber({
				mode: "hidden",
				children: didSuspend
			}, showFallback), nextProps = createFiberFromFragment(nextProps, showFallback, renderLanes, null), didSuspend.return = workInProgress, nextProps.return = workInProgress, didSuspend.sibling = nextProps, workInProgress.child = didSuspend, nextProps = workInProgress.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
			pushPrimaryTreeSuspenseHandler(workInProgress);
			return mountSuspensePrimaryChildren(workInProgress, didSuspend);
		}
		var prevState = current.memoizedState;
		if (null !== prevState) {
			var dehydrated$96 = prevState.dehydrated;
			if (null !== dehydrated$96) return updateDehydratedSuspenseComponent(current, workInProgress, didSuspend, JSCompiler_temp, nextProps, dehydrated$96, prevState, renderLanes);
		}
		if (showFallback) return reuseSuspenseHandlerOnStack(), showFallback = nextProps.fallback, didSuspend = workInProgress.mode, prevState = current.child, dehydrated$96 = prevState.sibling, nextProps = createWorkInProgress(prevState, {
			mode: "hidden",
			children: nextProps.children
		}), nextProps.subtreeFlags = prevState.subtreeFlags & 1206910976, null !== dehydrated$96 ? showFallback = createWorkInProgress(dehydrated$96, showFallback) : (showFallback = createFiberFromFragment(showFallback, didSuspend, renderLanes, null), showFallback.flags |= 2), showFallback.return = workInProgress, nextProps.return = workInProgress, nextProps.sibling = showFallback, workInProgress.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress.child, showFallback = current.child.memoizedState, null === showFallback ? showFallback = mountSuspenseOffscreenState(renderLanes) : (didSuspend = showFallback.cachePool, null !== didSuspend ? (prevState = CacheContext._currentValue, didSuspend = didSuspend.parent !== prevState ? {
			parent: prevState,
			pool: prevState
		} : didSuspend) : didSuspend = getSuspendedCache(), showFallback = {
			baseLanes: showFallback.baseLanes | renderLanes,
			cachePool: didSuspend
		}), nextProps.memoizedState = showFallback, nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
		pushPrimaryTreeSuspenseHandler(workInProgress);
		renderLanes = current.child;
		current = renderLanes.sibling;
		renderLanes = createWorkInProgress(renderLanes, {
			mode: "visible",
			children: nextProps.children
		});
		renderLanes.return = workInProgress;
		renderLanes.sibling = null;
		null !== current && (JSCompiler_temp = workInProgress.deletions, null === JSCompiler_temp ? (workInProgress.deletions = [current], workInProgress.flags |= 16) : JSCompiler_temp.push(current));
		workInProgress.child = renderLanes;
		workInProgress.memoizedState = null;
		return renderLanes;
	}
	function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
		primaryChildren = mountWorkInProgressOffscreenFiber({
			mode: "visible",
			children: primaryChildren
		}, workInProgress.mode);
		primaryChildren.return = workInProgress;
		return workInProgress.child = primaryChildren;
	}
	function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
		offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
		offscreenProps.lanes = 0;
		return offscreenProps;
	}
	function retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountSuspensePrimaryChildren(workInProgress, workInProgress.pendingProps.children);
		current.flags |= 2;
		workInProgress.memoizedState = null;
		return current;
	}
	function updateDehydratedSuspenseComponent(current, workInProgress, didSuspend, didPrimaryChildrenDefer, nextProps, suspenseInstance, suspenseState, renderLanes) {
		if (didSuspend) {
			if (workInProgress.flags & 256) return pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags &= -257, retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			if (null !== workInProgress.memoizedState) return reuseSuspenseHandlerOnStack(), workInProgress.child = current.child, workInProgress.flags |= 128, null;
			reuseSuspenseHandlerOnStack();
			suspenseInstance = nextProps.fallback;
			suspenseState = workInProgress.mode;
			nextProps = mountWorkInProgressOffscreenFiber({
				mode: "visible",
				children: nextProps.children
			}, suspenseState);
			suspenseInstance = createFiberFromFragment(suspenseInstance, suspenseState, renderLanes, null);
			suspenseInstance.flags |= 2;
			nextProps.return = workInProgress;
			suspenseInstance.return = workInProgress;
			nextProps.sibling = suspenseInstance;
			workInProgress.child = nextProps;
			reconcileChildFibers(workInProgress, current.child, null, renderLanes);
			nextProps = workInProgress.child;
			nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes);
			nextProps.childLanes = getRemainingWorkInPrimaryTree(current, didPrimaryChildrenDefer, renderLanes);
			workInProgress.memoizedState = SUSPENDED_MARKER;
			return bailoutOffscreenComponent(null, nextProps);
		}
		pushPrimaryTreeSuspenseHandler(workInProgress);
		if (isSuspenseInstanceFallback(suspenseInstance)) {
			didPrimaryChildrenDefer = suspenseInstance.nextSibling && suspenseInstance.nextSibling.dataset;
			if (didPrimaryChildrenDefer) var digest = didPrimaryChildrenDefer.dgst;
			didPrimaryChildrenDefer = digest;
			"" !== didPrimaryChildrenDefer && (nextProps = Error(formatProdErrorMessage(419)), nextProps.stack = "", nextProps.digest = didPrimaryChildrenDefer, queueHydrationError({
				value: nextProps,
				source: null,
				stack: null
			}));
			return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
		}
		didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1);
		didPrimaryChildrenDefer = 0 !== (renderLanes & current.childLanes);
		if (didReceiveUpdate || didPrimaryChildrenDefer) {
			if (null !== currentTreeHiddenStackCursor.current) return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			didPrimaryChildrenDefer = workInProgressRoot;
			if (null !== didPrimaryChildrenDefer && (nextProps = getBumpedLaneForHydration(didPrimaryChildrenDefer, renderLanes), 0 !== nextProps && nextProps !== suspenseState.retryLane)) throw suspenseState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(didPrimaryChildrenDefer, current, nextProps), SelectiveHydrationException;
			isSuspenseInstancePending(suspenseInstance) || renderDidSuspendDelayIfPossible();
			return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
		}
		if (isSuspenseInstancePending(suspenseInstance)) return workInProgress.flags |= 192, workInProgress.child = current.child, null;
		current = suspenseState.treeContext;
		nextHydratableInstance = getNextHydratable(suspenseInstance.nextSibling);
		hydrationParentFiber = workInProgress;
		isHydrating = !0;
		hydrationErrors = null;
		rootOrSingletonContext = !1;
		null !== current && restoreSuspendedTreeContext(workInProgress, current);
		workInProgress = mountSuspensePrimaryChildren(workInProgress, nextProps.children);
		workInProgress.flags |= 134221824;
		return workInProgress;
	}
	function scheduleSuspenseWorkOnFiber(fiber, renderLanes, propagationRoot) {
		fiber.lanes |= renderLanes;
		var alternate = fiber.alternate;
		null !== alternate && (alternate.lanes |= renderLanes);
		scheduleContextWorkOnParentPath(fiber.return, renderLanes, propagationRoot);
	}
	function findLastContentRow(firstChild) {
		for (var lastContentRow = null; null !== firstChild;) {
			var currentRow = firstChild.alternate;
			null !== currentRow && null === findFirstSuspended(currentRow) && (lastContentRow = firstChild);
			firstChild = firstChild.sibling;
		}
		return lastContentRow;
	}
	function initSuspenseListRenderState(workInProgress, isBackwards, tail, lastContentRow, tailMode, treeForkCount) {
		var renderState = workInProgress.memoizedState;
		null === renderState ? workInProgress.memoizedState = {
			isBackwards,
			rendering: null,
			renderingStartTime: 0,
			last: lastContentRow,
			tail,
			tailMode,
			treeForkCount
		} : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount);
	}
	function reverseChildren(fiber) {
		var row = fiber.child;
		for (fiber.child = null; null !== row;) {
			var nextRow = row.sibling;
			row.sibling = fiber.child;
			fiber.child = row;
			row = nextRow;
		}
	}
	function updateSuspenseListComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
		nextProps = nextProps.children;
		var suspenseContext = suspenseStackCursor.current;
		if (workInProgress.flags & 128) return pushSuspenseListContext(workInProgress, suspenseContext), null;
		var shouldForceFallback = 0 !== (suspenseContext & 2);
		shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress.flags |= 128) : suspenseContext &= 1;
		pushSuspenseListContext(workInProgress, suspenseContext);
		"backwards" === revealOrder && null !== current ? (reverseChildren(current), reconcileChildren(current, workInProgress, nextProps, renderLanes), reverseChildren(current)) : reconcileChildren(current, workInProgress, nextProps, renderLanes);
		nextProps = isHydrating ? treeForkCount : 0;
		if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128)) a: for (current = workInProgress.child; null !== current;) {
			if (13 === current.tag) null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (19 === current.tag) scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (null !== current.child) {
				current.child.return = current;
				current = current.child;
				continue;
			}
			if (current === workInProgress) break a;
			for (; null === current.sibling;) {
				if (null === current.return || current.return === workInProgress) break a;
				current = current.return;
			}
			current.sibling.return = current.return;
			current = current.sibling;
		}
		switch (revealOrder) {
			case "backwards":
				renderLanes = findLastContentRow(workInProgress.child);
				null === renderLanes ? (revealOrder = workInProgress.child, workInProgress.child = null) : (revealOrder = renderLanes.sibling, renderLanes.sibling = null, reverseChildren(workInProgress));
				initSuspenseListRenderState(workInProgress, !0, revealOrder, null, tailMode, nextProps);
				break;
			case "unstable_legacy-backwards":
				renderLanes = null;
				revealOrder = workInProgress.child;
				for (workInProgress.child = null; null !== revealOrder;) {
					current = revealOrder.alternate;
					if (null !== current && null === findFirstSuspended(current)) {
						workInProgress.child = revealOrder;
						break;
					}
					current = revealOrder.sibling;
					revealOrder.sibling = renderLanes;
					renderLanes = revealOrder;
					revealOrder = current;
				}
				initSuspenseListRenderState(workInProgress, !0, renderLanes, null, tailMode, nextProps);
				break;
			case "together":
				initSuspenseListRenderState(workInProgress, !1, null, null, void 0, nextProps);
				break;
			case "independent":
				workInProgress.memoizedState = null;
				break;
			default: renderLanes = findLastContentRow(workInProgress.child), null === renderLanes ? (revealOrder = workInProgress.child, workInProgress.child = null) : (revealOrder = renderLanes.sibling, renderLanes.sibling = null), initSuspenseListRenderState(workInProgress, !1, revealOrder, renderLanes, tailMode, nextProps);
		}
		return workInProgress.child;
	}
	function updateContextProvider(current, workInProgress, renderLanes) {
		var newProps = workInProgress.pendingProps;
		pushProvider(workInProgress, workInProgress.type, newProps.value);
		reconcileChildren(current, workInProgress, newProps.children, renderLanes);
		return workInProgress.child;
	}
	function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
		null !== current && (workInProgress.dependencies = current.dependencies);
		workInProgressRootSkippedLanes |= workInProgress.lanes;
		if (0 === (renderLanes & workInProgress.childLanes)) if (null !== current) {
			if (propagateParentContextChanges(current, workInProgress, renderLanes, !1), 0 === (renderLanes & workInProgress.childLanes)) return null;
		} else return null;
		if (null !== current && workInProgress.child !== current.child) throw Error(formatProdErrorMessage(153));
		if (null !== workInProgress.child) {
			current = workInProgress.child;
			renderLanes = createWorkInProgress(current, current.pendingProps);
			workInProgress.child = renderLanes;
			for (renderLanes.return = workInProgress; null !== current.sibling;) current = current.sibling, renderLanes = renderLanes.sibling = createWorkInProgress(current, current.pendingProps), renderLanes.return = workInProgress;
			renderLanes.sibling = null;
		}
		return workInProgress.child;
	}
	function checkScheduledUpdateOrContext(current, renderLanes) {
		if (0 !== (current.lanes & renderLanes)) return !0;
		current = current.dependencies;
		return null !== current && checkIfContextChanged(current) ? !0 : !1;
	}
	function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes) {
		switch (workInProgress.tag) {
			case 3:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
				resetHydrationState();
				break;
			case 27:
			case 5:
				pushHostContext(workInProgress);
				break;
			case 4:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				break;
			case 10:
				pushProvider(workInProgress, workInProgress.type, workInProgress.memoizedProps.value);
				break;
			case 31:
				if (null !== workInProgress.memoizedState) return workInProgress.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress), null;
				break;
			case 13:
				var state$108 = workInProgress.memoizedState;
				if (null !== state$108) {
					if (null !== state$108.dehydrated) return pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags |= 128, null;
					state$108 = propagateParentContextChanges(current, workInProgress, renderLanes, !1);
					var primaryChildLanes = workInProgress.child.childLanes;
					if (state$108 || 0 !== (renderLanes & primaryChildLanes)) return updateSuspenseComponent(current, workInProgress, renderLanes);
					pushPrimaryTreeSuspenseHandler(workInProgress);
					current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
					return null !== current ? current.sibling : null;
				}
				pushPrimaryTreeSuspenseHandler(workInProgress);
				break;
			case 19:
				if (workInProgress.flags & 128) return updateSuspenseListComponent(current, workInProgress, renderLanes);
				primaryChildLanes = 0 !== (current.flags & 128);
				state$108 = 0 !== (renderLanes & workInProgress.childLanes);
				state$108 || (propagateParentContextChanges(current, workInProgress, renderLanes, !1), state$108 = 0 !== (renderLanes & workInProgress.childLanes));
				if (primaryChildLanes) {
					if (state$108) return updateSuspenseListComponent(current, workInProgress, renderLanes);
					workInProgress.flags |= 128;
				}
				primaryChildLanes = workInProgress.memoizedState;
				null !== primaryChildLanes && (primaryChildLanes.rendering = null, primaryChildLanes.tail = null, primaryChildLanes.lastEffect = null);
				pushSuspenseListContext(workInProgress, suspenseStackCursor.current);
				if (state$108) break;
				else return null;
			case 22: return workInProgress.lanes = 0, updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
		}
		return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
	}
	function beginWork(current, workInProgress, renderLanes) {
		if (null !== current) if (current.memoizedProps !== workInProgress.pendingProps) didReceiveUpdate = !0;
		else {
			if (!checkScheduledUpdateOrContext(current, renderLanes) && 0 === (workInProgress.flags & 128)) return didReceiveUpdate = !1, attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);
			didReceiveUpdate = 0 !== (current.flags & 131072) ? !0 : !1;
		}
		else didReceiveUpdate = !1, isHydrating && 0 !== (workInProgress.flags & 1048576) && pushTreeId(workInProgress, treeForkCount, workInProgress.index);
		workInProgress.lanes = 0;
		switch (workInProgress.tag) {
			case 16:
				a: {
					var props = workInProgress.pendingProps;
					current = resolveLazy(workInProgress.elementType);
					workInProgress.type = current;
					if ("function" === typeof current) shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress.tag = 1, workInProgress = updateClassComponent(null, workInProgress, current, props, renderLanes)) : (workInProgress.tag = 0, workInProgress = updateFunctionComponent(null, workInProgress, current, props, renderLanes));
					else {
						if (void 0 !== current && null !== current) {
							var $$typeof = current.$$typeof;
							if ($$typeof === REACT_FORWARD_REF_TYPE) {
								workInProgress.tag = 11;
								workInProgress = updateForwardRef(null, workInProgress, current, props, renderLanes);
								break a;
							} else if ($$typeof === REACT_MEMO_TYPE) {
								workInProgress.tag = 14;
								workInProgress = updateMemoComponent(null, workInProgress, current, props, renderLanes);
								break a;
							} else if ($$typeof === REACT_CONTEXT_TYPE) {
								workInProgress.tag = 10;
								workInProgress.type = current;
								workInProgress = updateContextProvider(null, workInProgress, renderLanes);
								break a;
							}
						}
						workInProgress = getComponentNameFromType(current) || current;
						throw Error(formatProdErrorMessage(306, workInProgress, ""));
					}
				}
				return workInProgress;
			case 0: return updateFunctionComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 1: return props = workInProgress.type, $$typeof = resolveClassComponentProps(props, workInProgress.pendingProps), updateClassComponent(current, workInProgress, props, $$typeof, renderLanes);
			case 3:
				a: {
					pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
					if (null === current) throw Error(formatProdErrorMessage(387));
					props = workInProgress.pendingProps;
					var prevState = workInProgress.memoizedState;
					$$typeof = prevState.element;
					cloneUpdateQueue(current, workInProgress);
					processUpdateQueue(workInProgress, props, null, renderLanes);
					var nextState = workInProgress.memoizedState;
					props = nextState.cache;
					pushProvider(workInProgress, CacheContext, props);
					props !== prevState.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0);
					suspendIfUpdateReadFromEntangledAsyncAction();
					props = nextState.element;
					if (prevState.isDehydrated) if (prevState = {
						element: props,
						isDehydrated: !1,
						cache: nextState.cache
					}, workInProgress.updateQueue.baseState = prevState, workInProgress.memoizedState = prevState, workInProgress.flags & 256) {
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else if (props !== $$typeof) {
						$$typeof = createCapturedValueAtFiber(Error(formatProdErrorMessage(424)), workInProgress);
						queueHydrationError($$typeof);
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else {
						current = workInProgress.stateNode.containerInfo;
						switch (current.nodeType) {
							case 9:
								current = current.body;
								break;
							default: current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
						}
						nextHydratableInstance = getNextHydratable(current.firstChild);
						hydrationParentFiber = workInProgress;
						isHydrating = !0;
						hydrationErrors = null;
						rootOrSingletonContext = !0;
						renderLanes = mountChildFibers(workInProgress, null, props, renderLanes);
						for (workInProgress.child = renderLanes; renderLanes;) renderLanes.flags = renderLanes.flags & -3 | 134221824, renderLanes = renderLanes.sibling;
					}
					else {
						resetHydrationState();
						if (props === $$typeof) {
							workInProgress = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
							break a;
						}
						reconcileChildren(current, workInProgress, props, renderLanes);
					}
					workInProgress = workInProgress.child;
				}
				return workInProgress;
			case 26: return markRef(current, workInProgress), null === current ? (renderLanes = getResource(workInProgress.type, null, workInProgress.pendingProps, null)) ? workInProgress.memoizedState = renderLanes : isHydrating || (workInProgress.stateNode = createHoistableInstance(workInProgress.type, workInProgress.pendingProps, rootInstanceStackCursor.current, workInProgress)) : workInProgress.memoizedState = getResource(workInProgress.type, current.memoizedProps, workInProgress.pendingProps, current.memoizedState), null;
			case 27: return pushHostContext(workInProgress), null === current && isHydrating && (props = workInProgress.stateNode = resolveSingletonInstance(workInProgress.type, workInProgress.pendingProps, rootInstanceStackCursor.current), hydrationParentFiber = workInProgress, rootOrSingletonContext = !0, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), markRef(current, workInProgress), null === current && (workInProgress.flags |= 4194304), workInProgress.child;
			case 5:
				if (null === current && isHydrating) {
					if ($$typeof = props = nextHydratableInstance) props = canHydrateInstance(props, workInProgress.type, workInProgress.pendingProps, rootOrSingletonContext), null !== props ? (workInProgress.stateNode = props, hydrationParentFiber = workInProgress, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = !1, $$typeof = !0) : $$typeof = !1;
					$$typeof || throwOnHydrationMismatch(workInProgress);
				}
				pushHostContext(workInProgress);
				$$typeof = workInProgress.type;
				prevState = workInProgress.pendingProps;
				nextState = null !== current ? current.memoizedProps : null;
				props = prevState.children;
				shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress.flags |= 32);
				null !== workInProgress.memoizedState && ($$typeof = renderWithHooks(current, workInProgress, TransitionAwareHostComponent, null, null, renderLanes), HostTransitionContext._currentValue = $$typeof);
				markRef(current, workInProgress);
				reconcileChildren(current, workInProgress, props, renderLanes);
				return workInProgress.child;
			case 6:
				if (null === current && isHydrating) {
					if (current = renderLanes = nextHydratableInstance) renderLanes = canHydrateTextInstance(renderLanes, workInProgress.pendingProps, rootOrSingletonContext), null !== renderLanes ? (workInProgress.stateNode = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null, current = !0) : current = !1;
					current || throwOnHydrationMismatch(workInProgress);
				}
				return null;
			case 13: return updateSuspenseComponent(current, workInProgress, renderLanes);
			case 4: return pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo), props = workInProgress.pendingProps, null === current ? workInProgress.child = reconcileChildFibers(workInProgress, null, props, renderLanes) : reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 11: return updateForwardRef(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 7: return props = workInProgress.pendingProps, markRef(current, workInProgress), reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 8: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 12: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 10: return updateContextProvider(current, workInProgress, renderLanes);
			case 9: return $$typeof = workInProgress.type._context, props = workInProgress.pendingProps.children, prepareToReadContext(workInProgress), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress.flags |= 1, reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 14: return updateMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 15: return updateSimpleMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 19: return updateSuspenseListComponent(current, workInProgress, renderLanes);
			case 31: return updateActivityComponent(current, workInProgress, renderLanes);
			case 22: return updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: return prepareToReadContext(workInProgress), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes), $$typeof = prevState), workInProgress.memoizedState = {
				parent: props,
				cache: $$typeof
			}, initializeUpdateQueue(workInProgress), pushProvider(workInProgress, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes) && (cloneUpdateQueue(current, workInProgress), processUpdateQueue(workInProgress, null, null, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress.memoizedState, $$typeof.parent !== props ? ($$typeof = {
				parent: props,
				cache: props
			}, workInProgress.memoizedState = $$typeof, 0 === workInProgress.lanes && (workInProgress.memoizedState = workInProgress.updateQueue.baseState = $$typeof), pushProvider(workInProgress, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0))), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 30: return null === workInProgress.stateNode && (workInProgress.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), props = workInProgress.pendingProps, null != props.name && "auto" !== props.name ? workInProgress.flags |= null === current ? 18882560 : 18874368 : isHydrating && pushMaterializedTreeId(workInProgress), null !== current && current.memoizedProps.name !== props.name ? workInProgress.flags |= 4194816 : markRef(current, workInProgress), reconcileChildren(current, workInProgress, props.children, renderLanes), workInProgress.child;
			case 29: throw workInProgress.pendingProps;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function markUpdate(workInProgress) {
		workInProgress.flags |= 4;
	}
	function preloadInstanceAndSuspendIfNeeded(workInProgress, type, oldProps, newProps, renderLanes) {
		var JSCompiler_temp;
		if (JSCompiler_temp = 0 !== (workInProgress.mode & 32)) JSCompiler_temp = null === oldProps ? maySuspendCommit(type, newProps) : maySuspendCommit(type, newProps) && (newProps.src !== oldProps.src || newProps.srcSet !== oldProps.srcSet);
		if (JSCompiler_temp) {
			if (workInProgress.flags |= 16777216, (renderLanes & 335544128) === renderLanes) if (workInProgress.stateNode.complete) workInProgress.flags |= 8192;
			else if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
			else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
		} else workInProgress.flags &= -16777217;
	}
	function preloadResourceAndSuspendIfNeeded(workInProgress, resource) {
		if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4)) workInProgress.flags &= -16777217;
		else if (workInProgress.flags |= 16777216, !preloadResource(resource)) if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
		else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
	}
	function scheduleRetryEffect(workInProgress, retryQueue) {
		null !== retryQueue && (workInProgress.flags |= 4);
		workInProgress.flags & 16384 && (retryQueue = 22 !== workInProgress.tag ? claimNextRetryLane() : 536870912, workInProgress.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
	}
	function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
		if (!isHydrating) switch (renderState.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var tailNode = renderState.tail, lastTailNode = null; null !== tailNode;) null !== tailNode.alternate && (lastTailNode = tailNode), tailNode = tailNode.sibling;
				null === lastTailNode ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode.sibling = null;
				break;
			default:
				hasRenderedATailFallback = renderState.tail;
				for (tailNode = null; null !== hasRenderedATailFallback;) null !== hasRenderedATailFallback.alternate && (tailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
				null === tailNode ? renderState.tail = null : tailNode.sibling = null;
		}
	}
	function bubbleProperties(completedWork) {
		var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
		if (didBailout) for (var child$113 = completedWork.child; null !== child$113;) newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags & 1206910976, subtreeFlags |= child$113.flags & 1206910976, child$113.return = completedWork, child$113 = child$113.sibling;
		else for (child$113 = completedWork.child; null !== child$113;) newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags, subtreeFlags |= child$113.flags, child$113.return = completedWork, child$113 = child$113.sibling;
		completedWork.subtreeFlags |= subtreeFlags;
		completedWork.childLanes = newChildLanes;
		return didBailout;
	}
	function completeWork(current, workInProgress, renderLanes) {
		var newProps = workInProgress.pendingProps;
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return bubbleProperties(workInProgress), null;
			case 1: return bubbleProperties(workInProgress), null;
			case 3:
				renderLanes = workInProgress.stateNode;
				newProps = null;
				null !== current && (newProps = current.memoizedState.cache);
				workInProgress.memoizedState.cache !== newProps && (workInProgress.flags |= 2048);
				popProvider(CacheContext);
				popHostContainer();
				renderLanes.pendingContext && (renderLanes.context = renderLanes.pendingContext, renderLanes.pendingContext = null);
				if (null === current || null === current.child) popHydrationState(workInProgress) ? markUpdate(workInProgress) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress.flags & 256) || (workInProgress.flags |= 1024, upgradeHydrationErrorsToRecoverable());
				bubbleProperties(workInProgress);
				return null;
			case 26:
				var type = workInProgress.type, nextResource = workInProgress.memoizedState;
				null === current ? (markUpdate(workInProgress), null !== nextResource ? (bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, null, newProps, renderLanes))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress), bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), workInProgress.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress), bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, current, newProps, renderLanes));
				return null;
			case 27:
				popHostContext(workInProgress);
				renderLanes = rootInstanceStackCursor.current;
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						workInProgress.subtreeFlags &= -33554433;
						return null;
					}
					current = contextStackCursor.current;
					popHydrationState(workInProgress) ? prepareToHydrateHostInstance(workInProgress, current) : (current = resolveSingletonInstance(type, newProps, renderLanes), workInProgress.stateNode = current, markUpdate(workInProgress));
				}
				bubbleProperties(workInProgress);
				workInProgress.subtreeFlags &= -33554433;
				return null;
			case 5:
				popHostContext(workInProgress);
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						workInProgress.subtreeFlags &= -33554433;
						return null;
					}
					nextResource = contextStackCursor.current;
					if (popHydrationState(workInProgress)) prepareToHydrateHostInstance(workInProgress, nextResource);
					else {
						var ownerDocument = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current);
						switch (nextResource) {
							case 1:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
								break;
							case 2:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
								break;
							default: switch (type) {
								case "svg":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
									break;
								case "math":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
									break;
								case "script":
									nextResource = ownerDocument.createElement("div");
									nextResource.innerHTML = "<script><\/script>";
									nextResource = nextResource.removeChild(nextResource.firstChild);
									break;
								case "select":
									nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", { is: newProps.is }) : ownerDocument.createElement("select");
									newProps.multiple ? nextResource.multiple = !0 : newProps.size && (nextResource.size = newProps.size);
									break;
								default: nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
							}
						}
						nextResource[internalInstanceKey] = workInProgress;
						nextResource[internalPropsKey] = newProps;
						a: for (ownerDocument = workInProgress.child; null !== ownerDocument;) {
							if (5 === ownerDocument.tag || 6 === ownerDocument.tag) nextResource.appendChild(ownerDocument.stateNode);
							else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
								ownerDocument.child.return = ownerDocument;
								ownerDocument = ownerDocument.child;
								continue;
							}
							if (ownerDocument === workInProgress) break a;
							for (; null === ownerDocument.sibling;) {
								if (null === ownerDocument.return || ownerDocument.return === workInProgress) break a;
								ownerDocument = ownerDocument.return;
							}
							ownerDocument.sibling.return = ownerDocument.return;
							ownerDocument = ownerDocument.sibling;
						}
						workInProgress.stateNode = nextResource;
						a: switch (setInitialProperties(nextResource, type, newProps), type) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								newProps = !!newProps.autoFocus;
								break a;
							case "img":
								newProps = !0;
								break a;
							default: newProps = !1;
						}
						newProps && markUpdate(workInProgress);
					}
				}
				bubbleProperties(workInProgress);
				workInProgress.subtreeFlags &= -33554433;
				preloadInstanceAndSuspendIfNeeded(workInProgress, workInProgress.type, null === current ? null : current.memoizedProps, workInProgress.pendingProps, renderLanes);
				return null;
			case 6:
				if (current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if ("string" !== typeof newProps && null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
					current = rootInstanceStackCursor.current;
					if (popHydrationState(workInProgress)) {
						current = workInProgress.stateNode;
						renderLanes = workInProgress.memoizedProps;
						newProps = null;
						type = hydrationParentFiber;
						if (null !== type) switch (type.tag) {
							case 27:
							case 5: newProps = type.memoizedProps;
						}
						current[internalInstanceKey] = workInProgress;
						current = current.nodeValue === renderLanes || null !== newProps && !0 === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes) ? !0 : !1;
						current || throwOnHydrationMismatch(workInProgress, !0);
					} else current = getOwnerDocumentFromRootContainer(current).createTextNode(newProps), current[internalInstanceKey] = workInProgress, workInProgress.stateNode = current;
				}
				bubbleProperties(workInProgress);
				return null;
			case 31:
				renderLanes = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState) {
					newProps = popHydrationState(workInProgress);
					if (null !== renderLanes) {
						if (null === current) {
							if (!newProps) throw Error(formatProdErrorMessage(318));
							current = workInProgress.memoizedState;
							current = null !== current ? current.dehydrated : null;
							if (!current) throw Error(formatProdErrorMessage(557));
							current[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						current = !1;
					} else renderLanes = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes), current = !0;
					if (!current) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
					if (0 !== (workInProgress.flags & 128)) throw Error(formatProdErrorMessage(558));
				}
				bubbleProperties(workInProgress);
				return null;
			case 13:
				newProps = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
					type = popHydrationState(workInProgress);
					if (null !== newProps && null !== newProps.dehydrated) {
						if (null === current) {
							if (!type) throw Error(formatProdErrorMessage(318));
							type = workInProgress.memoizedState;
							type = null !== type ? type.dehydrated : null;
							if (!type) throw Error(formatProdErrorMessage(317));
							type[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						type = !1;
					} else type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = !0;
					if (!type) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
				}
				popSuspenseHandler(workInProgress);
				if (0 !== (workInProgress.flags & 128)) return workInProgress.lanes = renderLanes, workInProgress;
				renderLanes = null !== newProps;
				current = null !== current && null !== current.memoizedState;
				renderLanes && (newProps = workInProgress.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
				renderLanes !== current && renderLanes && (workInProgress.child.flags |= 8192);
				scheduleRetryEffect(workInProgress, workInProgress.updateQueue);
				bubbleProperties(workInProgress);
				return null;
			case 4: return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress.stateNode.containerInfo), workInProgress.flags |= 67108864, bubbleProperties(workInProgress), null;
			case 10: return popProvider(workInProgress.type), bubbleProperties(workInProgress), null;
			case 19:
				popSuspenseListContext(workInProgress);
				newProps = workInProgress.memoizedState;
				if (null === newProps) return bubbleProperties(workInProgress), null;
				type = 0 !== (workInProgress.flags & 128);
				nextResource = newProps.rendering;
				if (null === nextResource) if (type) cutOffTailIfNeeded(newProps, !1);
				else {
					if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128)) for (current = workInProgress.child; null !== current;) {
						nextResource = findFirstSuspended(current);
						if (null !== nextResource) {
							workInProgress.flags |= 128;
							cutOffTailIfNeeded(newProps, !1);
							current = nextResource.updateQueue;
							workInProgress.updateQueue = current;
							scheduleRetryEffect(workInProgress, current);
							workInProgress.subtreeFlags = 0;
							current = renderLanes;
							for (renderLanes = workInProgress.child; null !== renderLanes;) resetWorkInProgress(renderLanes, current), renderLanes = renderLanes.sibling;
							pushSuspenseListContext(workInProgress, suspenseStackCursor.current & 1 | 2);
							isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount);
							return workInProgress.child;
						}
						current = current.sibling;
					}
					null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
				}
				else {
					if (!type) if (current = findFirstSuspended(nextResource), null !== current) {
						if (workInProgress.flags |= 128, type = !0, current = current.updateQueue, workInProgress.updateQueue = current, scheduleRetryEffect(workInProgress, current), cutOffTailIfNeeded(newProps, !0), null === newProps.tail && "collapsed" !== newProps.tailMode && "visible" !== newProps.tailMode && !nextResource.alternate && !isHydrating) return bubbleProperties(workInProgress), null;
					} else 2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
					newProps.isBackwards ? (nextResource.sibling = workInProgress.child, workInProgress.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress.child = nextResource, newProps.last = nextResource);
				}
				if (null !== newProps.tail) {
					current = newProps.tail;
					a: {
						for (renderLanes = current; null !== renderLanes;) {
							if (null !== renderLanes.alternate) {
								renderLanes = !1;
								break a;
							}
							renderLanes = renderLanes.sibling;
						}
						renderLanes = !0;
					}
					newProps.rendering = current;
					newProps.tail = current.sibling;
					newProps.renderingStartTime = now();
					current.sibling = null;
					nextResource = suspenseStackCursor.current;
					nextResource = type ? nextResource & 1 | 2 : nextResource & 1;
					"visible" === newProps.tailMode || "collapsed" === newProps.tailMode || !renderLanes || isHydrating ? pushSuspenseListContext(workInProgress, nextResource) : (renderLanes = nextResource, push(suspenseHandlerStackCursor, workInProgress), push(suspenseStackCursor, renderLanes), null === shellBoundary && (shellBoundary = workInProgress));
					isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount);
					return current;
				}
				bubbleProperties(workInProgress);
				return null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), newProps = null !== workInProgress.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress.flags |= 8192) : newProps && (workInProgress.flags |= 8192), newProps ? 0 !== (renderLanes & 536870912) && 0 === (workInProgress.flags & 128) && (bubbleProperties(workInProgress), workInProgress.subtreeFlags & 6 && (workInProgress.flags |= 8192)) : bubbleProperties(workInProgress), renderLanes = workInProgress.updateQueue, null !== renderLanes && scheduleRetryEffect(workInProgress, renderLanes.retryQueue), renderLanes = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress.memoizedState && null !== workInProgress.memoizedState.cachePool && (newProps = workInProgress.memoizedState.cachePool.pool), newProps !== renderLanes && (workInProgress.flags |= 2048), null !== current && pop(resumedCache), null;
			case 24: return renderLanes = null, null !== current && (renderLanes = current.memoizedState.cache), workInProgress.memoizedState.cache !== renderLanes && (workInProgress.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress), null;
			case 25: return null;
			case 30: return workInProgress.flags |= 33554432, bubbleProperties(workInProgress), null;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function unwindWork(current, workInProgress) {
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 1: return current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 3: return popProvider(CacheContext), popHostContainer(), current = workInProgress.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 26:
			case 27:
			case 5: return popHostContext(workInProgress), null;
			case 31:
				if (null !== workInProgress.memoizedState) {
					popSuspenseHandler(workInProgress);
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 13:
				popSuspenseHandler(workInProgress);
				current = workInProgress.memoizedState;
				if (null !== current && null !== current.dehydrated) {
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 19: return popSuspenseListContext(workInProgress), current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, current = workInProgress.memoizedState, null !== current && (current.rendering = null, current.tail = null), workInProgress.flags |= 4, workInProgress) : null;
			case 4: return popHostContainer(), null;
			case 10: return popProvider(workInProgress.type), null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 24: return popProvider(CacheContext), null;
			case 25: return null;
			default: return null;
		}
	}
	function unwindInterruptedWork(current, interruptedWork) {
		popTreeContext(interruptedWork);
		switch (interruptedWork.tag) {
			case 3:
				popProvider(CacheContext);
				popHostContainer();
				break;
			case 26:
			case 27:
			case 5:
				popHostContext(interruptedWork);
				break;
			case 4:
				popHostContainer();
				break;
			case 31:
				null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
				break;
			case 13:
				popSuspenseHandler(interruptedWork);
				break;
			case 19:
				popSuspenseListContext(interruptedWork);
				break;
			case 10:
				popProvider(interruptedWork.type);
				break;
			case 22:
			case 23:
				popSuspenseHandler(interruptedWork);
				popHiddenContext();
				null !== current && pop(resumedCache);
				break;
			case 24: popProvider(CacheContext);
		}
	}
	function commitHookEffectListMount(flags, finishedWork) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						lastEffect = void 0;
						var create = updateQueue.create, inst = updateQueue.inst;
						lastEffect = create();
						inst.destroy = lastEffect;
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						var inst = updateQueue.inst, destroy = inst.destroy;
						if (void 0 !== destroy) {
							inst.destroy = void 0;
							lastEffect = finishedWork;
							var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
							try {
								destroy_();
							} catch (error) {
								captureCommitPhaseError(lastEffect, nearestMountedAncestor, error);
							}
						}
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitClassCallbacks(finishedWork) {
		var updateQueue = finishedWork.updateQueue;
		if (null !== updateQueue) {
			var instance = finishedWork.stateNode;
			try {
				commitCallbacks(updateQueue, instance);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
		instance.props = resolveClassComponentProps(current.type, current.memoizedProps);
		instance.state = current.memoizedState;
		try {
			instance.componentWillUnmount();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyAttachRef(current, nearestMountedAncestor) {
		try {
			var ref = current.ref;
			if (null !== ref) {
				switch (current.tag) {
					case 26:
					case 27:
					case 5:
						var instanceToUse = current.stateNode;
						break;
					case 30:
						var instance = current.stateNode, name = getViewTransitionName(current.memoizedProps, instance);
						if (null === instance.ref || instance.ref.name !== name) instance.ref = createViewTransitionInstance(name);
						instanceToUse = instance.ref;
						break;
					case 7:
						if (null === current.stateNode) {
							var fragmentInstance = new FragmentInstance(current);
							traverseVisibleInstancesAndTextInstances(current.child, !1, addFragmentHandleToFiber, fragmentInstance, void 0, void 0);
							current.stateNode = fragmentInstance;
						}
						instanceToUse = current.stateNode;
						break;
					default: instanceToUse = current.stateNode;
				}
				"function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
			}
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyDetachRef(current, nearestMountedAncestor) {
		var ref = current.ref, refCleanup = current.refCleanup;
		if (null !== ref) if ("function" === typeof refCleanup) try {
			refCleanup();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		} finally {
			current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
		}
		else if ("function" === typeof ref) try {
			ref(null);
		} catch (error$148) {
			captureCommitPhaseError(current, nearestMountedAncestor, error$148);
		}
		else ref.current = null;
	}
	function commitNewChildToFragmentInstances(fiber, parentFragmentInstances) {
		if ((5 === fiber.tag || 27 === fiber.tag || 6 === fiber.tag) && null === fiber.alternate && null !== parentFragmentInstances) for (var i = 0; i < parentFragmentInstances.length; i++) commitNewChildToFragmentInstance(fiber.stateNode, parentFragmentInstances[i]);
	}
	function commitFragmentInstanceInsertionEffects(fiber) {
		for (var parent = fiber.return; null !== parent;) {
			isFragmentInstanceParent(parent) && commitNewChildToFragmentInstance(fiber.stateNode, parent.stateNode);
			if (isFragmentInstanceHostBoundary(parent)) break;
			parent = parent.return;
		}
	}
	function commitFragmentInstanceDeletionEffects(fiber) {
		for (var parent = fiber.return; null !== parent;) {
			isFragmentInstanceParent(parent) && deleteChildFromFragmentInstance(fiber.stateNode, parent.stateNode);
			if (isFragmentInstanceHostBoundary(parent)) break;
			parent = parent.return;
		}
	}
	function isFragmentInstanceHostBoundary(fiber) {
		return 5 === fiber.tag || 3 === fiber.tag || 27 === fiber.tag;
	}
	function isFragmentInstanceParent(fiber) {
		return fiber && 7 === fiber.tag && null !== fiber.stateNode;
	}
	function commitHostMount(finishedWork) {
		var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
		try {
			a: switch (type) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					props.autoFocus && instance.focus();
					break a;
				case "img": props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHostUpdate(finishedWork, newProps, oldProps) {
		try {
			var domElement = finishedWork.stateNode;
			updateProperties(domElement, finishedWork.type, oldProps, newProps);
			domElement[internalPropsKey] = newProps;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function isHostParent(fiber) {
		return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
	}
	function getHostSibling(fiber) {
		a: for (;;) {
			for (; null === fiber.sibling;) {
				if (null === fiber.return || isHostParent(fiber.return)) return null;
				fiber = fiber.return;
			}
			fiber.sibling.return = fiber.return;
			for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag;) {
				if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
				if (fiber.flags & 2) continue a;
				if (null === fiber.child || 4 === fiber.tag) continue a;
				else fiber.child.return = fiber, fiber = fiber.child;
			}
			if (!(fiber.flags & 2)) return fiber.stateNode;
		}
	}
	function insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) tag = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(tag, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(tag), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1)), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = !0;
		else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode, before = null)), node = node.child, null !== node)) for (insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances), node = node.sibling; null !== node;) insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances), node = node.sibling;
	}
	function insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) tag = node.stateNode, before ? parent.insertBefore(tag, before) : parent.appendChild(tag), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = !0;
		else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode)), node = node.child, null !== node)) for (insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances), node = node.sibling; null !== node;) insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances), node = node.sibling;
	}
	function commitHostSingletonAcquisition(finishedWork) {
		var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
		try {
			for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length;) singleton.removeAttributeNode(attributes[0]);
			setInitialProperties(singleton, type, props);
			singleton[internalInstanceKey] = finishedWork;
			singleton[internalPropsKey] = props;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	var shouldStartViewTransition = !1;
	var appearingViewTransitions = null;
	function trackEnterViewTransitions(placement) {
		if (30 === placement.tag || 0 !== (placement.subtreeFlags & 33554432)) shouldStartViewTransition = !0;
	}
	var viewTransitionCancelableChildren = null;
	function pushViewTransitionCancelableScope() {
		var prevChildren = viewTransitionCancelableChildren;
		viewTransitionCancelableChildren = null;
		return prevChildren;
	}
	var viewTransitionHostInstanceIdx = 0;
	function applyViewTransitionToHostInstances(fiber, name, className, collectMeasurements, stopAtNestedViewTransitions) {
		viewTransitionHostInstanceIdx = 0;
		return applyViewTransitionToHostInstancesRecursive(fiber.child, name, className, collectMeasurements, stopAtNestedViewTransitions);
	}
	function applyViewTransitionToHostInstancesRecursive(child, name, className, collectMeasurements, stopAtNestedViewTransitions) {
		for (var inViewport = !1; null !== child;) {
			if (5 === child.tag) {
				var instance = child.stateNode;
				if (null !== collectMeasurements) {
					var measurement = measureInstance(instance);
					collectMeasurements.push(measurement);
					measurement.view && (inViewport = !0);
				} else inViewport || measureInstance(instance).view && (inViewport = !0);
				shouldStartViewTransition = !0;
				applyViewTransitionName(instance, 0 === viewTransitionHostInstanceIdx ? name : name + "_" + viewTransitionHostInstanceIdx, className);
				viewTransitionHostInstanceIdx++;
			} else if (22 !== child.tag || null === child.memoizedState) 30 === child.tag && stopAtNestedViewTransitions || applyViewTransitionToHostInstancesRecursive(child.child, name, className, collectMeasurements, stopAtNestedViewTransitions) && (inViewport = !0);
			child = child.sibling;
		}
		return inViewport;
	}
	function restoreViewTransitionOnHostInstances(child, stopAtNestedViewTransitions) {
		for (; null !== child;) {
			if (5 === child.tag) restoreViewTransitionName(child.stateNode, child.memoizedProps);
			else if (22 !== child.tag || null === child.memoizedState) 30 === child.tag && stopAtNestedViewTransitions || restoreViewTransitionOnHostInstances(child.child, stopAtNestedViewTransitions);
			child = child.sibling;
		}
	}
	function commitAppearingPairViewTransitions(placement) {
		if (0 !== (placement.subtreeFlags & 18874368)) for (placement = placement.child; null !== placement;) {
			if (22 !== placement.tag || null === placement.memoizedState) {
				if (commitAppearingPairViewTransitions(placement), 30 === placement.tag && 0 !== (placement.flags & 18874368) && placement.stateNode.paired) {
					var props = placement.memoizedProps;
					if (null == props.name || "auto" === props.name) throw Error(formatProdErrorMessage(544));
					var name = props.name;
					props = getViewTransitionClassName(props.default, props.share);
					"none" !== props && (applyViewTransitionToHostInstances(placement, name, props, null, !1) || restoreViewTransitionOnHostInstances(placement.child, !1));
				}
			}
			placement = placement.sibling;
		}
	}
	function commitEnterViewTransitions(placement, gesture) {
		if (30 === placement.tag) {
			var state = placement.stateNode, props = placement.memoizedProps, name = getViewTransitionName(props, state), className = getViewTransitionClassName(props.default, state.paired ? props.share : props.enter);
			"none" !== className ? applyViewTransitionToHostInstances(placement, name, className, null, !1) ? (commitAppearingPairViewTransitions(placement), state.paired || gesture || scheduleViewTransitionEvent(placement, props.onEnter)) : restoreViewTransitionOnHostInstances(placement.child, !1) : commitAppearingPairViewTransitions(placement);
		} else if (0 !== (placement.subtreeFlags & 33554432)) for (placement = placement.child; null !== placement;) commitEnterViewTransitions(placement, gesture), placement = placement.sibling;
		else commitAppearingPairViewTransitions(placement);
	}
	function commitDeletedPairViewTransitions(deletion) {
		if (null !== appearingViewTransitions && 0 !== appearingViewTransitions.size) {
			var pairs = appearingViewTransitions;
			if (0 !== (deletion.subtreeFlags & 18874368)) for (deletion = deletion.child; null !== deletion;) {
				if (22 !== deletion.tag || null === deletion.memoizedState) {
					if (30 === deletion.tag && 0 !== (deletion.flags & 18874368)) {
						var props = deletion.memoizedProps, name = props.name;
						if (null != name && "auto" !== name) {
							var pair = pairs.get(name);
							if (void 0 !== pair) {
								var className = getViewTransitionClassName(props.default, props.share);
								"none" !== className && (applyViewTransitionToHostInstances(deletion, name, className, null, !1) ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, scheduleViewTransitionEvent(deletion, props.onShare)) : restoreViewTransitionOnHostInstances(deletion.child, !1));
								pairs.delete(name);
								if (0 === pairs.size) break;
							}
						}
					}
					commitDeletedPairViewTransitions(deletion);
				}
				deletion = deletion.sibling;
			}
		}
	}
	function commitExitViewTransitions(deletion) {
		if (30 === deletion.tag) {
			var props = deletion.memoizedProps, name = getViewTransitionName(props, deletion.stateNode), pair = null !== appearingViewTransitions ? appearingViewTransitions.get(name) : void 0, className = getViewTransitionClassName(props.default, void 0 !== pair ? props.share : props.exit);
			"none" !== className && (applyViewTransitionToHostInstances(deletion, name, className, null, !1) ? void 0 !== pair ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, appearingViewTransitions.delete(name), scheduleViewTransitionEvent(deletion, props.onShare)) : scheduleViewTransitionEvent(deletion, props.onExit) : restoreViewTransitionOnHostInstances(deletion.child, !1));
			null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
		} else if (0 !== (deletion.subtreeFlags & 33554432)) for (deletion = deletion.child; null !== deletion;) commitExitViewTransitions(deletion), deletion = deletion.sibling;
		else null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
	}
	function commitNestedViewTransitions(changedParent) {
		for (changedParent = changedParent.child; null !== changedParent;) {
			if (30 === changedParent.tag) {
				var props = changedParent.memoizedProps, name = getViewTransitionName(props, changedParent.stateNode);
				props = getViewTransitionClassName(props.default, props.update);
				changedParent.flags &= -5;
				"none" !== props && applyViewTransitionToHostInstances(changedParent, name, props, changedParent.memoizedState = [], !1);
			} else 0 !== (changedParent.subtreeFlags & 33554432) && commitNestedViewTransitions(changedParent);
			changedParent = changedParent.sibling;
		}
	}
	function restorePairedViewTransitions(parent) {
		if (0 !== (parent.subtreeFlags & 18874368)) for (parent = parent.child; null !== parent;) {
			if (22 !== parent.tag || null === parent.memoizedState) {
				if (30 === parent.tag && 0 !== (parent.flags & 18874368)) {
					var instance = parent.stateNode;
					null !== instance.paired && (instance.paired = null, restoreViewTransitionOnHostInstances(parent.child, !1));
				}
				restorePairedViewTransitions(parent);
			}
			parent = parent.sibling;
		}
	}
	function restoreEnterOrExitViewTransitions(fiber) {
		if (30 === fiber.tag) fiber.stateNode.paired = null, restoreViewTransitionOnHostInstances(fiber.child, !1), restorePairedViewTransitions(fiber);
		else if (0 !== (fiber.subtreeFlags & 33554432)) for (fiber = fiber.child; null !== fiber;) restoreEnterOrExitViewTransitions(fiber), fiber = fiber.sibling;
		else restorePairedViewTransitions(fiber);
	}
	function restoreNestedViewTransitions(changedParent) {
		for (changedParent = changedParent.child; null !== changedParent;) 30 === changedParent.tag ? restoreViewTransitionOnHostInstances(changedParent.child, !1) : 0 !== (changedParent.subtreeFlags & 33554432) && restoreNestedViewTransitions(changedParent), changedParent = changedParent.sibling;
	}
	function measureViewTransitionHostInstancesRecursive(parentViewTransition, child, newName, oldName, className, previousMeasurements, stopAtNestedViewTransitions) {
		for (var inViewport = !1; null !== child;) {
			if (5 === child.tag) {
				var instance = child.stateNode;
				if (null !== previousMeasurements && viewTransitionHostInstanceIdx < previousMeasurements.length) {
					var previousMeasurement = previousMeasurements[viewTransitionHostInstanceIdx], nextMeasurement = measureInstance(instance);
					if (previousMeasurement.view || nextMeasurement.view) inViewport = !0;
					var JSCompiler_temp;
					if (JSCompiler_temp = 0 === (parentViewTransition.flags & 4)) if (nextMeasurement.clip) JSCompiler_temp = !0;
					else {
						JSCompiler_temp = previousMeasurement.rect;
						var newRect = nextMeasurement.rect;
						JSCompiler_temp = JSCompiler_temp.y !== newRect.y || JSCompiler_temp.x !== newRect.x || JSCompiler_temp.height !== newRect.height || JSCompiler_temp.width !== newRect.width;
					}
					JSCompiler_temp && (parentViewTransition.flags |= 4);
					nextMeasurement.abs ? nextMeasurement = !previousMeasurement.abs : (previousMeasurement = previousMeasurement.rect, nextMeasurement = nextMeasurement.rect, nextMeasurement = previousMeasurement.height !== nextMeasurement.height || previousMeasurement.width !== nextMeasurement.width);
					nextMeasurement && (parentViewTransition.flags |= 32);
				} else parentViewTransition.flags |= 32;
				0 !== (parentViewTransition.flags & 4) && applyViewTransitionName(instance, 0 === viewTransitionHostInstanceIdx ? newName : newName + "_" + viewTransitionHostInstanceIdx, className);
				inViewport && 0 !== (parentViewTransition.flags & 4) || (null === viewTransitionCancelableChildren && (viewTransitionCancelableChildren = []), viewTransitionCancelableChildren.push(instance, 0 === viewTransitionHostInstanceIdx ? oldName : oldName + "_" + viewTransitionHostInstanceIdx, child.memoizedProps));
				viewTransitionHostInstanceIdx++;
			} else if (22 !== child.tag || null === child.memoizedState) 30 === child.tag && stopAtNestedViewTransitions ? parentViewTransition.flags |= child.flags & 32 : measureViewTransitionHostInstancesRecursive(parentViewTransition, child.child, newName, oldName, className, previousMeasurements, stopAtNestedViewTransitions) && (inViewport = !0);
			child = child.sibling;
		}
		return inViewport;
	}
	function measureNestedViewTransitions(changedParent, gesture) {
		for (changedParent = changedParent.child; null !== changedParent;) {
			if (30 === changedParent.tag) {
				var props = changedParent.memoizedProps, state = changedParent.stateNode, name = getViewTransitionName(props, state), className = getViewTransitionClassName(props.default, props.update);
				if (gesture) {
					state = state.clones;
					var previousMeasurements = null === state ? null : state.map(measureClonedInstance);
				} else previousMeasurements = changedParent.memoizedState, changedParent.memoizedState = null;
				state = changedParent;
				var child = changedParent.child;
				viewTransitionHostInstanceIdx = 0;
				name = measureViewTransitionHostInstancesRecursive(state, child, name, name, className, previousMeasurements, !1);
				0 !== (changedParent.flags & 4) && name && (gesture || scheduleViewTransitionEvent(changedParent, props.onUpdate));
			} else 0 !== (changedParent.subtreeFlags & 33554432) && measureNestedViewTransitions(changedParent, gesture);
			changedParent = changedParent.sibling;
		}
	}
	var offscreenSubtreeIsHidden = !1;
	var offscreenSubtreeWasHidden = !1;
	var offscreenDirectParentIsHidden = !1;
	var needsFormReset = !1;
	var PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set;
	var nextEffect = null;
	var viewTransitionContextChanged = !1;
	var inUpdateViewTransition = !1;
	var rootViewTransitionAffected = !1;
	var rootViewTransitionNameCanceled = !1;
	function commitBeforeMutationEffects(root, firstChild, committedLanes) {
		root = root.containerInfo;
		eventsEnabled = _enabled;
		root = getActiveElementDeep(root);
		if (hasSelectionCapabilities(root)) {
			if ("selectionStart" in root) var JSCompiler_temp = {
				start: root.selectionStart,
				end: root.selectionEnd
			};
			else a: {
				JSCompiler_temp = (JSCompiler_temp = root.ownerDocument) && JSCompiler_temp.defaultView || window;
				var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
				if (selection && 0 !== selection.rangeCount) {
					JSCompiler_temp = selection.anchorNode;
					var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
					selection = selection.focusOffset;
					try {
						JSCompiler_temp.nodeType, focusNode.nodeType;
					} catch (e$21) {
						JSCompiler_temp = null;
						break a;
					}
					var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root, parentNode = null;
					b: for (;;) {
						for (var next;;) {
							node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
							node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
							3 === node.nodeType && (length += node.nodeValue.length);
							if (null === (next = node.firstChild)) break;
							parentNode = node;
							node = next;
						}
						for (;;) {
							if (node === root) break b;
							parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
							parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
							if (null !== (next = node.nextSibling)) break;
							node = parentNode;
							parentNode = node.parentNode;
						}
						node = next;
					}
					JSCompiler_temp = -1 === start || -1 === end ? null : {
						start,
						end
					};
				} else JSCompiler_temp = null;
			}
			JSCompiler_temp = JSCompiler_temp || {
				start: 0,
				end: 0
			};
		} else JSCompiler_temp = null;
		selectionInformation = {
			focusedElem: root,
			selectionRange: JSCompiler_temp
		};
		_enabled = !1;
		committedLanes = (committedLanes & 335544064) === committedLanes;
		nextEffect = firstChild;
		for (firstChild = committedLanes ? 9270 : 1024; null !== nextEffect;) {
			root = nextEffect;
			if (committedLanes && (JSCompiler_temp = root.deletions, null !== JSCompiler_temp)) for (anchorOffset = 0; anchorOffset < JSCompiler_temp.length; anchorOffset++) committedLanes && commitExitViewTransitions(JSCompiler_temp[anchorOffset]);
			if (null === root.alternate && 0 !== (root.flags & 2)) committedLanes && trackEnterViewTransitions(root), commitBeforeMutationEffects_complete(committedLanes);
			else {
				if (22 === root.tag) {
					if (JSCompiler_temp = root.alternate, null !== root.memoizedState) {
						null !== JSCompiler_temp && null === JSCompiler_temp.memoizedState && committedLanes && commitExitViewTransitions(JSCompiler_temp);
						commitBeforeMutationEffects_complete(committedLanes);
						continue;
					} else if (null !== JSCompiler_temp && null !== JSCompiler_temp.memoizedState) {
						committedLanes && trackEnterViewTransitions(root);
						commitBeforeMutationEffects_complete(committedLanes);
						continue;
					}
				}
				JSCompiler_temp = root.child;
				0 !== (root.subtreeFlags & firstChild) && null !== JSCompiler_temp ? (JSCompiler_temp.return = root, nextEffect = JSCompiler_temp) : (committedLanes && commitNestedViewTransitions(root), commitBeforeMutationEffects_complete(committedLanes));
			}
		}
		appearingViewTransitions = null;
	}
	function commitBeforeMutationEffects_complete(isViewTransitionEligible$jscomp$0) {
		for (; null !== nextEffect;) {
			var fiber = nextEffect, isViewTransitionEligible = isViewTransitionEligible$jscomp$0, current = fiber.alternate, flags = fiber.flags;
			switch (fiber.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (0 !== (flags & 1024) && null !== current) {
						isViewTransitionEligible = void 0;
						flags = current.memoizedProps;
						current = current.memoizedState;
						var instance = fiber.stateNode;
						try {
							var resolvedPrevProps = resolveClassComponentProps(fiber.type, flags);
							isViewTransitionEligible = instance.getSnapshotBeforeUpdate(resolvedPrevProps, current);
							instance.__reactInternalSnapshotBeforeUpdate = isViewTransitionEligible;
						} catch (error) {
							captureCommitPhaseError(fiber, fiber.return, error);
						}
					}
					break;
				case 3:
					if (0 !== (flags & 1024)) {
						if (current = fiber.stateNode.containerInfo, isViewTransitionEligible = current.nodeType, 9 === isViewTransitionEligible) clearContainerSparingly(current);
						else if (1 === isViewTransitionEligible) switch (current.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								clearContainerSparingly(current);
								break;
							default: current.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					isViewTransitionEligible && null !== current && (isViewTransitionEligible = getViewTransitionName(current.memoizedProps, current.stateNode), flags = fiber.memoizedProps, flags = getViewTransitionClassName(flags.default, flags.update), "none" !== flags && applyViewTransitionToHostInstances(current, isViewTransitionEligible, flags, current.memoizedState = [], !0));
					break;
				default: if (0 !== (flags & 1024)) throw Error(formatProdErrorMessage(163));
			}
			current = fiber.sibling;
			if (null !== current) {
				current.return = fiber.return;
				nextEffect = current;
				break;
			}
			nextEffect = fiber.return;
		}
	}
	function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitHookEffectListMount(5, finishedWork);
				break;
			case 1:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 4) if (finishedRoot = finishedWork.stateNode, null === current) try {
					finishedRoot.componentDidMount();
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				else {
					var prevProps = resolveClassComponentProps(finishedWork.type, current.memoizedProps);
					current = current.memoizedState;
					try {
						finishedRoot.componentDidUpdate(prevProps, current, finishedRoot.__reactInternalSnapshotBeforeUpdate);
					} catch (error$146) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error$146);
					}
				}
				flags & 64 && commitClassCallbacks(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
					current = null;
					if (null !== finishedWork.child) switch (finishedWork.child.tag) {
						case 27:
						case 5:
							current = finishedWork.child.stateNode;
							break;
						case 1: current = finishedWork.child.stateNode;
					}
					try {
						commitCallbacks(finishedRoot, current);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 27: null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
			case 26:
			case 5:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				null === current && flags & 4 && commitHostMount(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 12:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				break;
			case 31:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
				break;
			case 13:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
				flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(null, finishedWork), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
				break;
			case 22:
				flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
				if (!flags) {
					var newOffscreenSubtreeWasHidden = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
					current = offscreenSubtreeIsHidden;
					prevProps = offscreenSubtreeWasHidden;
					offscreenSubtreeIsHidden = flags;
					(offscreenSubtreeWasHidden = newOffscreenSubtreeWasHidden) && !prevProps ? (flags = 2, 0 !== (finishedWork.subtreeFlags & 8772) && (flags |= 1), recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, flags)) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
					offscreenSubtreeIsHidden = current;
					offscreenSubtreeWasHidden = prevProps;
				}
				break;
			case 30:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 7: flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
			default: recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		}
	}
	function hideOrUnhideAllChildren(parentFiber, isHidden) {
		for (parentFiber = parentFiber.child; null !== parentFiber;) hideOrUnhideAllChildrenOnFiber(parentFiber, isHidden), parentFiber = parentFiber.sibling;
	}
	function hideOrUnhideAllChildrenOnFiber(fiber, isHidden) {
		switch (fiber.tag) {
			case 5:
			case 26:
				try {
					var instance = fiber.stateNode;
					if (isHidden) {
						var style = instance.style;
						"function" === typeof style.setProperty ? style.setProperty("display", "none", "important") : style.display = "none";
					} else {
						var instance$jscomp$0 = fiber.stateNode, styleProp = fiber.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
						instance$jscomp$0.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
					}
				} catch (error) {
					captureCommitPhaseError(fiber, fiber.return, error);
				}
				hideOrUnhideNearestPortals(fiber, isHidden);
				break;
			case 6:
				try {
					fiber.stateNode.nodeValue = isHidden ? "" : fiber.memoizedProps, viewTransitionMutationContext = !0;
				} catch (error) {
					captureCommitPhaseError(fiber, fiber.return, error);
				}
				break;
			case 18:
				try {
					var instance$jscomp$1 = fiber.stateNode;
					isHidden ? hideOrUnhideDehydratedBoundary(instance$jscomp$1, !0) : hideOrUnhideDehydratedBoundary(fiber.stateNode, !1);
				} catch (error) {
					captureCommitPhaseError(fiber, fiber.return, error);
				}
				break;
			case 22:
			case 23:
				null === fiber.memoizedState && hideOrUnhideAllChildren(fiber, isHidden);
				break;
			default: hideOrUnhideAllChildren(fiber, isHidden);
		}
	}
	function hideOrUnhideNearestPortals(parentFiber, isHidden$jscomp$0) {
		if (parentFiber.subtreeFlags & 67108864) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			a: {
				var fiber = parentFiber, isHidden = isHidden$jscomp$0;
				switch (fiber.tag) {
					case 4:
						hideOrUnhideAllChildrenOnFiber(fiber, isHidden);
						break a;
					case 22:
						null === fiber.memoizedState && hideOrUnhideNearestPortals(fiber, isHidden);
						break a;
					default: hideOrUnhideNearestPortals(fiber, isHidden);
				}
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function detachFiberAfterEffects(fiber) {
		var alternate = fiber.alternate;
		null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
		fiber.child = null;
		fiber.deletions = null;
		fiber.sibling = null;
		5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
		fiber.stateNode = null;
		fiber.return = null;
		fiber.dependencies = null;
		fiber.memoizedProps = null;
		fiber.memoizedState = null;
		fiber.pendingProps = null;
		fiber.stateNode = null;
		fiber.updateQueue = null;
	}
	var hostParent = null;
	var hostParentIsContainer = !1;
	function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
		for (parent = parent.child; null !== parent;) commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
	}
	function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
		if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount) try {
			injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
		} catch (err) {}
		switch (deletedFiber.tag) {
			case 26:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && !offscreenSubtreeWasHidden && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
				break;
			case 27:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				commitFragmentInstanceDeletionEffects(deletedFiber);
				var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
				isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = !1);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				releaseSingletonInstance(deletedFiber.stateNode, deletedFiber.type, deletedFiber.memoizedProps);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 5: offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor), commitFragmentInstanceDeletionEffects(deletedFiber);
			case 6:
				6 === deletedFiber.tag && commitFragmentInstanceDeletionEffects(deletedFiber);
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = null;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				if (null !== hostParent) if (hostParentIsContainer) try {
					(9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode), viewTransitionMutationContext = !0;
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				else try {
					hostParent.removeChild(deletedFiber.stateNode), viewTransitionMutationContext = !0;
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				break;
			case 18:
				null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, deletedFiber.stateNode), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
				break;
			case 4:
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = deletedFiber.stateNode.containerInfo;
				hostParentIsContainer = !0;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
				offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 1:
				offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(deletedFiber, nearestMountedAncestor, prevHostParent));
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 21:
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 22:
				offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				offscreenSubtreeWasHidden = prevHostParent;
				break;
			case 30:
				safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 7:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			default: recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
		}
	}
	function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
			finishedRoot = finishedRoot.dehydrated;
			try {
				retryIfBlockedOn(finishedRoot);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot)))) try {
			retryIfBlockedOn(finishedRoot);
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function getRetryCache(finishedWork) {
		switch (finishedWork.tag) {
			case 31:
			case 13:
			case 19:
				var retryCache = finishedWork.stateNode;
				null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
				return retryCache;
			case 22: return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
			default: throw Error(formatProdErrorMessage(435, finishedWork.tag));
		}
	}
	function attachSuspenseRetryListeners(finishedWork, wakeables) {
		var retryCache = getRetryCache(finishedWork);
		wakeables.forEach(function(wakeable) {
			if (!retryCache.has(wakeable)) {
				retryCache.add(wakeable);
				var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
				wakeable.then(retry, retry);
			}
		});
	}
	function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber, lanes) {
		var deletions = parentFiber.deletions;
		if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
			var childToDelete = deletions[i], root = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
			a: for (; null !== parent;) {
				switch (parent.tag) {
					case 27:
						if (isSingletonScope(parent.type)) {
							hostParent = parent.stateNode;
							hostParentIsContainer = !1;
							break a;
						}
						break;
					case 5:
						hostParent = parent.stateNode;
						hostParentIsContainer = !1;
						break a;
					case 3:
					case 4:
						hostParent = parent.stateNode.containerInfo;
						hostParentIsContainer = !0;
						break a;
				}
				parent = parent.return;
			}
			if (null === hostParent) throw Error(formatProdErrorMessage(160));
			commitDeletionEffectsOnFiber(root, returnFiber, childToDelete);
			hostParent = null;
			hostParentIsContainer = !1;
			root = childToDelete.alternate;
			null !== root && (root.return = null);
			childToDelete.return = null;
		}
		if (parentFiber.subtreeFlags & 13886) for (parentFiber = parentFiber.child; null !== parentFiber;) commitMutationEffectsOnFiber(parentFiber, root$jscomp$0, lanes), parentFiber = parentFiber.sibling;
	}
	var currentHoistableRoot = null;
	function commitMutationEffectsOnFiber(finishedWork, root, lanes) {
		var current = finishedWork.alternate, flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (flags & 4 && (current = finishedWork.updateQueue, current = null !== current ? current.events : null, null !== current)) for (var ii = 0; ii < current.length; ii++) {
					var _eventPayloads$ii2 = current[ii];
					_eventPayloads$ii2.ref.impl = _eventPayloads$ii2.nextImpl;
				}
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
				break;
			case 1:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (root = finishedWork.callbacks, null !== root && (lanes = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === lanes ? root : lanes.concat(root))));
				break;
			case 26:
				ii = currentHoistableRoot;
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (flags & 4) if (flags = null !== current ? current.memoizedState : null, lanes = finishedWork.memoizedState, null === current) if (null === lanes) if (null === finishedWork.stateNode) if (offscreenSubtreeIsHidden) finishedWork.stateNode = createHoistableInstance(finishedWork.type, finishedWork.memoizedProps, root.containerInfo, finishedWork);
				else {
					a: {
						root = finishedWork.type;
						lanes = finishedWork.memoizedProps;
						flags = ii.ownerDocument || ii;
						b: switch (root) {
							case "title":
								current = flags.getElementsByTagName("title")[0];
								if (!current || current[internalHoistableMarker] || current[internalInstanceKey] || "http://www.w3.org/2000/svg" === current.namespaceURI || current.hasAttribute("itemprop")) current = flags.createElement(root), flags.head.insertBefore(current, flags.querySelector("head > title"));
								setInitialProperties(current, root, lanes);
								current[internalInstanceKey] = finishedWork;
								markNodeAsHoistable(current);
								root = current;
								break a;
							case "link":
								if (ii = getHydratableHoistableCache("link", "href", flags).get(root + (lanes.href || ""))) {
									for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++) if (current = ii[_eventPayloads$ii2], current.getAttribute("href") === (null == lanes.href || "" === lanes.href ? null : lanes.href) && current.getAttribute("rel") === (null == lanes.rel ? null : lanes.rel) && current.getAttribute("title") === (null == lanes.title ? null : lanes.title) && current.getAttribute("crossorigin") === (null == lanes.crossOrigin ? null : lanes.crossOrigin)) {
										ii.splice(_eventPayloads$ii2, 1);
										break b;
									}
								}
								current = flags.createElement(root);
								setInitialProperties(current, root, lanes);
								flags.head.appendChild(current);
								break;
							case "meta":
								if (ii = getHydratableHoistableCache("meta", "content", flags).get(root + (lanes.content || ""))) {
									for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++) if (current = ii[_eventPayloads$ii2], current.getAttribute("content") === (null == lanes.content ? null : "" + lanes.content) && current.getAttribute("name") === (null == lanes.name ? null : lanes.name) && current.getAttribute("property") === (null == lanes.property ? null : lanes.property) && current.getAttribute("http-equiv") === (null == lanes.httpEquiv ? null : lanes.httpEquiv) && current.getAttribute("charset") === (null == lanes.charSet ? null : lanes.charSet)) {
										ii.splice(_eventPayloads$ii2, 1);
										break b;
									}
								}
								current = flags.createElement(root);
								setInitialProperties(current, root, lanes);
								flags.head.appendChild(current);
								break;
							default: throw Error(formatProdErrorMessage(468, root));
						}
						current[internalInstanceKey] = finishedWork;
						markNodeAsHoistable(current);
						root = current;
					}
					finishedWork.stateNode = root;
				}
				else offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode);
				else finishedWork.stateNode = acquireResource(ii, lanes, finishedWork.memoizedProps);
				else flags !== lanes ? (null === flags ? (root = current.stateNode, null === root || offscreenSubtreeWasHidden || root.parentNode.removeChild(root)) : flags.count--, null === lanes ? offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode) : acquireResource(ii, lanes, finishedWork.memoizedProps)) : null === lanes && null !== finishedWork.stateNode && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				break;
			case 27:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				null !== current && flags & 4 && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				break;
			case 5:
				ii = offscreenDirectParentIsHidden;
				offscreenDirectParentIsHidden = !1;
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				offscreenDirectParentIsHidden = ii;
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (finishedWork.flags & 32) {
					root = finishedWork.stateNode;
					try {
						setTextContent(root, ""), viewTransitionMutationContext = !0;
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				flags & 4 && null != finishedWork.stateNode && (root = finishedWork.memoizedProps, commitHostUpdate(finishedWork, root, null !== current ? current.memoizedProps : root));
				flags & 1024 && (needsFormReset = !0);
				break;
			case 6:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				if (flags & 4) {
					if (null === finishedWork.stateNode) throw Error(formatProdErrorMessage(162));
					root = finishedWork.memoizedProps;
					lanes = finishedWork.stateNode;
					try {
						lanes.nodeValue = root, viewTransitionMutationContext = !0;
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 3:
				viewTransitionMutationContext = !1;
				tagCaches = null;
				ii = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(root.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				currentHoistableRoot = ii;
				commitReconciliationEffects(finishedWork);
				if (flags & 4 && null !== current && current.memoizedState.isDehydrated) try {
					retryIfBlockedOn(root.containerInfo);
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				needsFormReset && (needsFormReset = !1, recursivelyResetForms(finishedWork));
				viewTransitionMutationContext = !1;
				break;
			case 4:
				flags = offscreenDirectParentIsHidden;
				offscreenDirectParentIsHidden = offscreenSubtreeIsHidden;
				current = pushMutationContext();
				ii = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(finishedWork.stateNode.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				currentHoistableRoot = ii;
				viewTransitionMutationContext && inUpdateViewTransition && (rootViewTransitionAffected = !0);
				viewTransitionMutationContext = current;
				offscreenDirectParentIsHidden = flags;
				break;
			case 12:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				break;
			case 31:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root)));
				break;
			case 13:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root)));
				break;
			case 22:
				ii = null !== finishedWork.memoizedState;
				_eventPayloads$ii2 = null !== current && null !== current.memoizedState;
				var prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden, prevOffscreenDirectParentIsHidden$166 = offscreenDirectParentIsHidden;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || ii;
				offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166 || ii;
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || _eventPayloads$ii2;
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
				offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
				commitReconciliationEffects(finishedWork);
				flags & 8192 && (root = finishedWork.stateNode, root._visibility = ii ? root._visibility & -2 : root._visibility | 1, !ii || null === current || _eventPayloads$ii2 || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || (root = _eventPayloads$ii2 || offscreenSubtreeWasHidden, lanes = offscreenSubtreeIsHidden, current = offscreenSubtreeWasHidden, offscreenSubtreeIsHidden = ii || offscreenSubtreeIsHidden, offscreenSubtreeWasHidden = root, recursivelyTraverseDisappearLayoutEffects(finishedWork, 2), offscreenSubtreeIsHidden = lanes, offscreenSubtreeWasHidden = current), !ii && offscreenDirectParentIsHidden || hideOrUnhideAllChildren(finishedWork, ii));
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (lanes = root.retryQueue, null !== lanes && (root.retryQueue = null, attachSuspenseRetryListeners(finishedWork, lanes))));
				break;
			case 19:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root)));
				break;
			case 30:
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				flags = pushMutationContext();
				ii = inUpdateViewTransition;
				_eventPayloads$ii2 = (lanes & 335544064) === lanes;
				prevOffscreenSubtreeIsHidden = finishedWork.memoizedProps;
				inUpdateViewTransition = _eventPayloads$ii2 && "none" !== getViewTransitionClassName(prevOffscreenSubtreeIsHidden.default, prevOffscreenSubtreeIsHidden.update);
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				_eventPayloads$ii2 && null !== current && viewTransitionMutationContext && (finishedWork.flags |= 4);
				inUpdateViewTransition = ii;
				viewTransitionMutationContext = flags;
				break;
			case 21: break;
			case 7: flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return)), current && null !== current.stateNode && (current.stateNode._fragmentFiber = finishedWork);
			default: recursivelyTraverseMutationEffects(root, finishedWork, lanes), commitReconciliationEffects(finishedWork);
		}
	}
	function commitReconciliationEffects(finishedWork) {
		var flags = finishedWork.flags;
		if (flags & 2) {
			try {
				for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber;) {
					if (isHostParent(parentFiber)) {
						hostParentFiber = parentFiber;
						break;
					}
					parentFiber = parentFiber.return;
				}
				parentFiber = null;
				for (var parent = finishedWork.return; null !== parent;) {
					if (isFragmentInstanceParent(parent)) {
						var fragmentInstance = parent.stateNode;
						null === parentFiber ? parentFiber = [fragmentInstance] : parentFiber.push(fragmentInstance);
					}
					if (isFragmentInstanceHostBoundary(parent)) break;
					parent = parent.return;
				}
				var JSCompiler_inline_result = parentFiber;
				if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
				switch (hostParentFiber.tag) {
					case 27:
						var parent$jscomp$0 = hostParentFiber.stateNode;
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent$jscomp$0, JSCompiler_inline_result);
						break;
					case 5:
						var parent$149 = hostParentFiber.stateNode;
						hostParentFiber.flags & 32 && (setTextContent(parent$149, ""), hostParentFiber.flags &= -33);
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent$149, JSCompiler_inline_result);
						break;
					case 3:
					case 4:
						var parent$151 = hostParentFiber.stateNode.containerInfo;
						insertOrAppendPlacementNodeIntoContainer(finishedWork, getHostSibling(finishedWork), parent$151, JSCompiler_inline_result);
						break;
					default: throw Error(formatProdErrorMessage(161));
				}
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
			finishedWork.flags &= -3;
		}
		flags & 4096 && (finishedWork.flags &= -4097);
	}
	function recursivelyResetForms(parentFiber) {
		if (parentFiber.subtreeFlags & 1024) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var fiber = parentFiber;
			recursivelyResetForms(fiber);
			5 === fiber.tag && fiber.flags & 1024 && (fiber = fiber.stateNode, _enabled = !0, fiber.reset(), _enabled = !1);
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseAfterMutationEffects(root, parentFiber) {
		if (parentFiber.subtreeFlags & 9270) for (parentFiber = parentFiber.child; null !== parentFiber;) commitAfterMutationEffectsOnFiber(parentFiber, root), parentFiber = parentFiber.sibling;
		else measureNestedViewTransitions(parentFiber, !1);
	}
	function commitAfterMutationEffectsOnFiber(finishedWork, root) {
		var current = finishedWork.alternate;
		if (null === current) commitEnterViewTransitions(finishedWork, !1);
		else switch (finishedWork.tag) {
			case 3:
				rootViewTransitionNameCanceled = viewTransitionContextChanged = !1;
				pushViewTransitionCancelableScope();
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				if (!viewTransitionContextChanged && !rootViewTransitionAffected) {
					finishedWork = viewTransitionCancelableChildren;
					if (null !== finishedWork) for (var i = 0; i < finishedWork.length; i += 3) {
						current = finishedWork[i];
						var oldName = finishedWork[i + 1];
						restoreViewTransitionName(current, finishedWork[i + 2]);
						current = current.ownerDocument.documentElement;
						null !== current && current.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + oldName + ")"
						});
					}
					finishedWork = root.containerInfo;
					finishedWork = 9 === finishedWork.nodeType ? finishedWork.documentElement : finishedWork.ownerDocument.documentElement;
					null !== finishedWork && "" === finishedWork.style.viewTransitionName && (finishedWork.style.viewTransitionName = "none", finishedWork.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), finishedWork.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					}));
					rootViewTransitionNameCanceled = !0;
				}
				viewTransitionCancelableChildren = null;
				break;
			case 5:
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				break;
			case 4:
				i = viewTransitionContextChanged;
				viewTransitionContextChanged = !1;
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				viewTransitionContextChanged && (rootViewTransitionAffected = !0);
				viewTransitionContextChanged = i;
				break;
			case 22:
				null === finishedWork.memoizedState && (null !== current.memoizedState ? commitEnterViewTransitions(finishedWork, !1) : recursivelyTraverseAfterMutationEffects(root, finishedWork));
				break;
			case 30:
				i = viewTransitionContextChanged;
				oldName = pushViewTransitionCancelableScope();
				viewTransitionContextChanged = !1;
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				viewTransitionContextChanged && (finishedWork.flags |= 4);
				var props = finishedWork.memoizedProps, state = finishedWork.stateNode;
				root = getViewTransitionName(props, state);
				state = getViewTransitionName(current.memoizedProps, state);
				var className = getViewTransitionClassName(props.default, props.update);
				"none" === className ? root = !1 : (props = current.memoizedState, current.memoizedState = null, current = finishedWork.child, viewTransitionHostInstanceIdx = 0, root = measureViewTransitionHostInstancesRecursive(finishedWork, current, root, state, className, props, !0), viewTransitionHostInstanceIdx !== (null === props ? 0 : props.length) && (finishedWork.flags |= 32));
				0 !== (finishedWork.flags & 4) && root ? (scheduleViewTransitionEvent(finishedWork, finishedWork.memoizedProps.onUpdate), viewTransitionCancelableChildren = oldName) : null !== oldName && (oldName.push.apply(oldName, viewTransitionCancelableChildren), viewTransitionCancelableChildren = oldName);
				viewTransitionContextChanged = 0 !== (finishedWork.flags & 32) ? !0 : i;
				break;
			default: recursivelyTraverseAfterMutationEffects(root, finishedWork);
		}
	}
	function recursivelyTraverseLayoutEffects(root, parentFiber) {
		if (parentFiber.subtreeFlags & 8772) for (parentFiber = parentFiber.child; null !== parentFiber;) commitLayoutEffectOnFiber(root, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
	}
	function recursivelyTraverseDisappearLayoutEffects(parentFiber, layoutEffectTraversalFlags$jscomp$0) {
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedWork = parentFiber, layoutEffectTraversalFlags = layoutEffectTraversalFlags$jscomp$0;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 1:
					safelyDetachRef(finishedWork, finishedWork.return);
					var instance = finishedWork.stateNode;
					"function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(finishedWork, finishedWork.return, instance);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 27: 0 !== (layoutEffectTraversalFlags & 2) && releaseSingletonInstance(finishedWork.stateNode, finishedWork.type, finishedWork.memoizedProps);
				case 5:
					safelyDetachRef(finishedWork, finishedWork.return);
					5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceDeletionEffects(finishedWork);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 6:
					commitFragmentInstanceDeletionEffects(finishedWork);
					break;
				case 26:
					safelyDetachRef(finishedWork, finishedWork.return);
					instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState || null === instance || offscreenSubtreeWasHidden || instance.parentNode.removeChild(instance);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 30:
					safelyDetachRef(finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 7: safelyDetachRef(finishedWork, finishedWork.return);
				default: recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, layoutEffectTraversalFlags) {
		layoutEffectTraversalFlags = 0 !== (parentFiber.subtreeFlags & 8772) ? layoutEffectTraversalFlags : layoutEffectTraversalFlags & -2;
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags, includeWorkInProgressEffects = 0 !== (layoutEffectTraversalFlags & 1);
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					commitHookEffectListMount(4, finishedWork);
					break;
				case 1:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					current = finishedWork;
					finishedRoot = current.stateNode;
					if ("function" === typeof finishedRoot.componentDidMount) try {
						finishedRoot.componentDidMount();
					} catch (error) {
						captureCommitPhaseError(current, current.return, error);
					}
					current = finishedWork;
					finishedRoot = current.updateQueue;
					if (null !== finishedRoot) {
						var instance = current.stateNode;
						try {
							var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
							if (null !== hiddenCallbacks) for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++) callCallback(hiddenCallbacks[finishedRoot], instance);
						} catch (error) {
							captureCommitPhaseError(current, current.return, error);
						}
					}
					includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 27: 0 !== (layoutEffectTraversalFlags & 2) && commitHostSingletonAcquisition(finishedWork);
				case 5:
					5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceInsertionEffects(finishedWork);
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 6:
					commitFragmentInstanceInsertionEffects(finishedWork);
					break;
				case 26:
					instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState || null === instance || offscreenSubtreeIsHidden || mountHoistable(getHoistableRoot(instance.ownerDocument), finishedWork.type, instance);
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 12:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					break;
				case 31:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 13:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 30:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 7: safelyAttachRef(finishedWork, finishedWork.return);
				default: recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitOffscreenPassiveMountEffects(current, finishedWork) {
		var previousCache = null;
		null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
		current = null;
		null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
		current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
	}
	function commitCachePassiveMountEffect(current, finishedWork) {
		current = null;
		null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
		finishedWork = finishedWork.memoizedState.cache;
		finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
	}
	function recursivelyTraversePassiveMountEffects(root, parentFiber, committedLanes, committedTransitions) {
		var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
		if (parentFiber.subtreeFlags & (isViewTransitionEligible ? 10262 : 10256)) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveMountOnFiber(root, parentFiber, committedLanes, committedTransitions), parentFiber = parentFiber.sibling;
		else isViewTransitionEligible && restoreNestedViewTransitions(parentFiber);
	}
	function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
		var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
		isViewTransitionEligible && null === finishedWork.alternate && null !== finishedWork.return && null !== finishedWork.return.alternate && restoreEnterOrExitViewTransitions(finishedWork);
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitHookEffectListMount(9, finishedWork);
				break;
			case 1:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 3:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				isViewTransitionEligible && rootViewTransitionNameCanceled && (finishedRoot = finishedRoot.containerInfo, finishedRoot = 9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, "root" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""), finishedRoot = finishedRoot.ownerDocument.documentElement, null !== finishedRoot && "none" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""));
				flags & 2048 && (flags = null, null !== finishedWork.alternate && (flags = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== flags && (finishedWork.refCount++, null != flags && releaseCache(flags)));
				break;
			case 12:
				if (flags & 2048) {
					recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
					flags = finishedWork.stateNode;
					try {
						var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
						"function" === typeof onPostCommit && onPostCommit(id, null === finishedWork.alternate ? "mount" : "update", flags.passiveEffectDuration, -0);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				} else recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 31:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 13:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 23: break;
			case 22:
				_finishedWork$memoize2 = finishedWork.stateNode;
				id = finishedWork.alternate;
				null !== finishedWork.memoizedState ? (isViewTransitionEligible && null !== id && null === id.memoizedState && restoreEnterOrExitViewTransitions(id), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork)) : (isViewTransitionEligible && null !== id && null !== id.memoizedState && restoreEnterOrExitViewTransitions(finishedWork), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, 0 !== (finishedWork.subtreeFlags & 10256) || !1)));
				flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
				break;
			case 24:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
				break;
			case 30:
				isViewTransitionEligible && (flags = finishedWork.alternate, null !== flags && (restoreViewTransitionOnHostInstances(flags.child, !0), restoreViewTransitionOnHostInstances(finishedWork.child, !0)));
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			default: recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
		}
	}
	function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
		includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || !1);
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					commitHookEffectListMount(8, finishedWork);
					break;
				case 23: break;
				case 22:
					var instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects));
					includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 22:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	var suspenseyCommitFlag = 8192;
	function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
		if (parentFiber.subtreeFlags & suspenseyCommitFlag) for (parentFiber = parentFiber.child; null !== parentFiber;) accumulateSuspenseyCommitOnFiber(parentFiber, committedLanes, suspendedState), parentFiber = parentFiber.sibling;
	}
	function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
		switch (fiber.tag) {
			case 26:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				fiber.flags & suspenseyCommitFlag && (null !== fiber.memoizedState ? suspendResource(suspendedState, currentHoistableRoot, fiber.memoizedState, fiber.memoizedProps) : (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber)));
				break;
			case 5:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				fiber.flags & suspenseyCommitFlag && (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber));
				break;
			case 3:
			case 4:
				var previousHoistableRoot = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				currentHoistableRoot = previousHoistableRoot;
				break;
			case 22:
				null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState));
				break;
			case 30:
				if (0 !== (fiber.flags & suspenseyCommitFlag) && (previousHoistableRoot = fiber.memoizedProps.name, null != previousHoistableRoot && "auto" !== previousHoistableRoot)) {
					var state = fiber.stateNode;
					state.paired = null;
					null === appearingViewTransitions && (appearingViewTransitions = /* @__PURE__ */ new Map());
					appearingViewTransitions.set(previousHoistableRoot, state);
				}
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				break;
			default: recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
		}
	}
	function detachAlternateSiblings(parentFiber) {
		var previousFiber = parentFiber.alternate;
		if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
			previousFiber.child = null;
			do
				previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
			while (null !== parentFiber);
		}
	}
	function recursivelyTraversePassiveUnmountEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
	}
	function commitPassiveUnmountOnFiber(finishedWork) {
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 12:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 22:
				var instance = finishedWork.stateNode;
				null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			default: recursivelyTraversePassiveUnmountEffects(finishedWork);
		}
	}
	function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			deletions = parentFiber;
			switch (deletions.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, deletions, deletions.return);
					recursivelyTraverseDisconnectPassiveEffects(deletions);
					break;
				case 22:
					i = deletions.stateNode;
					i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
					break;
				default: recursivelyTraverseDisconnectPassiveEffects(deletions);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
		for (; null !== nextEffect;) {
			var fiber = nextEffect;
			switch (fiber.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
					break;
				case 23:
				case 22:
					if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
						var cache = fiber.memoizedState.cachePool.pool;
						null != cache && cache.refCount++;
					}
					break;
				case 24: releaseCache(fiber.memoizedState.cache);
			}
			cache = fiber.child;
			if (null !== cache) cache.return = fiber, nextEffect = cache;
			else a: for (fiber = deletedSubtreeRoot; null !== nextEffect;) {
				cache = nextEffect;
				var sibling = cache.sibling, returnFiber = cache.return;
				detachFiberAfterEffects(cache);
				if (cache === fiber) {
					nextEffect = null;
					break a;
				}
				if (null !== sibling) {
					sibling.return = returnFiber;
					nextEffect = sibling;
					break a;
				}
				nextEffect = returnFiber;
			}
		}
	}
	var DefaultAsyncDispatcher = {
		getCacheForType: function(resourceType) {
			var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
			void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
			return cacheForType;
		},
		cacheSignal: function() {
			return readContext(CacheContext).controller.signal;
		}
	};
	var PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map;
	var executionContext = 0;
	var workInProgressRoot = null;
	var workInProgress = null;
	var workInProgressRootRenderLanes = 0;
	var workInProgressSuspendedReason = 0;
	var workInProgressThrownValue = null;
	var workInProgressRootDidSkipSuspendedSiblings = !1;
	var workInProgressRootIsPrerendering = !1;
	var workInProgressRootDidAttachPingListener = !1;
	var entangledRenderLanes = 0;
	var workInProgressRootExitStatus = 0;
	var workInProgressRootSkippedLanes = 0;
	var workInProgressRootInterleavedUpdatedLanes = 0;
	var workInProgressRootPingedLanes = 0;
	var workInProgressDeferredLane = 0;
	var workInProgressSuspendedRetryLanes = 0;
	var workInProgressRootConcurrentErrors = null;
	var workInProgressRootRecoverableErrors = null;
	var workInProgressRootDidIncludeRecursiveRenderUpdate = !1;
	var globalMostRecentFallbackTime = 0;
	var globalMostRecentTransitionTime = 0;
	var workInProgressRootRenderTargetTime = Infinity;
	var workInProgressTransitions = null;
	var legacyErrorBoundariesThatAlreadyFailed = null;
	var pendingEffectsStatus = 0;
	var pendingEffectsRoot = null;
	var pendingFinishedWork = null;
	var pendingEffectsLanes = 0;
	var pendingEffectsRemainingLanes = 0;
	var pendingPassiveTransitions = null;
	var pendingRecoverableErrors = null;
	var pendingViewTransition = null;
	var pendingViewTransitionEvents = null;
	var pendingTransitionTypes = null;
	var nestedUpdateCount = 0;
	var rootWithNestedUpdates = null;
	function requestUpdateLane() {
		return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
	}
	function requestDeferredLane() {
		if (0 === workInProgressDeferredLane) if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
			var lane = nextTransitionDeferredLane;
			nextTransitionDeferredLane <<= 1;
			0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
			workInProgressDeferredLane = lane;
		} else workInProgressDeferredLane = 536870912;
		lane = suspenseHandlerStackCursor.current;
		null !== lane && (lane.flags |= 32);
		return workInProgressDeferredLane;
	}
	function scheduleViewTransitionEvent(fiber, callback) {
		if (null != callback) {
			var state = fiber.stateNode, instance = state.ref;
			null === instance && (instance = state.ref = createViewTransitionInstance(getViewTransitionName(fiber.memoizedProps, state)));
			null === pendingViewTransitionEvents && (pendingViewTransitionEvents = []);
			pendingViewTransitionEvents.push(callback.bind(null, instance));
		}
	}
	function scheduleUpdateOnFiber(root, fiber, lane) {
		if (root === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) prepareFreshStack(root, 0), markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
		markRootUpdated$1(root, lane);
		if (0 === (executionContext & 2) || root !== workInProgressRoot) root === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1)), ensureRootIsScheduled(root);
	}
	function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, !0), renderWasConcurrent = shouldTimeSlice;
		do {
			if (0 === exitStatus) {
				workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, !1);
				break;
			} else {
				forceSync = root$jscomp$0.current.alternate;
				if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
					exitStatus = renderRootSync(root$jscomp$0, lanes, !1);
					renderWasConcurrent = !1;
					continue;
				}
				if (2 === exitStatus) {
					renderWasConcurrent = lanes;
					if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent) var JSCompiler_inline_result = 0;
					else JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
					if (0 !== JSCompiler_inline_result) {
						lanes = JSCompiler_inline_result;
						a: {
							var root = root$jscomp$0;
							exitStatus = workInProgressRootConcurrentErrors;
							var wasRootDehydrated = root.current.memoizedState.isDehydrated;
							wasRootDehydrated && (prepareFreshStack(root, JSCompiler_inline_result).flags |= 256);
							JSCompiler_inline_result = renderRootSync(root, JSCompiler_inline_result, !1);
							if (2 !== JSCompiler_inline_result && 6 !== JSCompiler_inline_result) {
								if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
									root.errorRecoveryDisabledLanes |= renderWasConcurrent;
									workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
									exitStatus = 4;
									break a;
								}
								renderWasConcurrent = workInProgressRootRecoverableErrors;
								workInProgressRootRecoverableErrors = exitStatus;
								null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, renderWasConcurrent));
							}
							exitStatus = JSCompiler_inline_result;
						}
						renderWasConcurrent = !1;
						if (2 !== exitStatus) continue;
					}
				}
				if (1 === exitStatus) {
					prepareFreshStack(root$jscomp$0, 0);
					markRootSuspended(root$jscomp$0, lanes, 0, !0);
					break;
				}
				a: {
					shouldTimeSlice = root$jscomp$0;
					renderWasConcurrent = exitStatus;
					switch (renderWasConcurrent) {
						case 0:
						case 1: throw Error(formatProdErrorMessage(345));
						case 4: if ((lanes & 4194048) !== lanes && (lanes & 62914560) !== lanes) break;
						case 6:
							markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
							break a;
						case 2:
							workInProgressRootRecoverableErrors = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(formatProdErrorMessage(329));
					}
					if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
						markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
						if (0 !== getNextLanes(shouldTimeSlice, 0, !0)) break a;
						pendingEffectsLanes = lanes;
						shouldTimeSlice.timeoutHandle = scheduleTimeout(completeRootWhenReady.bind(null, shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, "Throttled", -0, 0), exitStatus);
						break a;
					}
					completeRootWhenReady(shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, null, -0, 0);
				}
			}
			break;
		} while (1);
		ensureRootIsScheduled(root$jscomp$0);
	}
	function completeRootWhenReady(root, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
		root.timeoutHandle = -1;
		var subtreeFlags = finishedWork.subtreeFlags, isViewTransitionEligible = (lanes & 335544064) === lanes;
		suspendedCommitReason = null;
		if (isViewTransitionEligible || subtreeFlags & 8192 || 16785408 === (subtreeFlags & 16785408)) {
			if (suspendedCommitReason = {
				stylesheets: null,
				count: 0,
				imgCount: 0,
				imgBytes: 0,
				suspenseyImages: [],
				waitingForImages: !0,
				waitingForViewTransition: !1,
				unsuspend: noop$1
			}, appearingViewTransitions = null, accumulateSuspenseyCommitOnFiber(finishedWork, lanes, suspendedCommitReason), isViewTransitionEligible && (subtreeFlags = suspendedCommitReason, isViewTransitionEligible = root.containerInfo, isViewTransitionEligible = (9 === isViewTransitionEligible.nodeType ? isViewTransitionEligible : isViewTransitionEligible.ownerDocument).__reactViewTransition, null != isViewTransitionEligible && (subtreeFlags.count++, subtreeFlags.waitingForViewTransition = !0, subtreeFlags = onUnsuspend.bind(subtreeFlags), isViewTransitionEligible.finished.then(subtreeFlags, subtreeFlags))), subtreeFlags = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0, subtreeFlags = waitForCommitToBeReady(suspendedCommitReason, subtreeFlags), null !== subtreeFlags) {
				pendingEffectsLanes = lanes;
				root.cancelPendingCommit = subtreeFlags(completeRoot.bind(null, root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, null, completedRenderStartTime, completedRenderEndTime));
				markRootSuspended(root, lanes, spawnedLane, !didSkipSuspendedSiblings);
				return;
			}
		}
		completeRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason);
	}
	function isRenderConsistentWithExternalStores(finishedWork) {
		for (var node = finishedWork;;) {
			var tag = node.tag;
			if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag))) for (var i = 0; i < tag.length; i++) {
				var check = tag[i], getSnapshot = check.getSnapshot;
				check = check.value;
				try {
					if (!objectIs(getSnapshot(), check)) return !1;
				} catch (error) {
					return !1;
				}
			}
			tag = node.child;
			if (node.subtreeFlags & 16384 && null !== tag) tag.return = node, node = tag;
			else {
				if (node === finishedWork) break;
				for (; null === node.sibling;) {
					if (null === node.return || node.return === finishedWork) return !0;
					node = node.return;
				}
				node.sibling.return = node.return;
				node = node.sibling;
			}
		}
		return !0;
	}
	function markRootSuspended(root, suspendedLanes, spawnedLane, didAttemptEntireTree) {
		suspendedLanes = getEntangledLanes(root, suspendedLanes);
		suspendedLanes &= ~workInProgressRootPingedLanes;
		suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
		root.suspendedLanes |= suspendedLanes;
		root.pingedLanes &= ~suspendedLanes;
		didAttemptEntireTree && (root.warmLanes |= suspendedLanes);
		didAttemptEntireTree = root.expirationTimes;
		for (var lanes = suspendedLanes; 0 < lanes;) {
			var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
			didAttemptEntireTree[index$6] = -1;
			lanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, suspendedLanes);
	}
	function flushSyncWork$1() {
		return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0, !1), !1) : !0;
	}
	function resetWorkInProgressStack() {
		if (null !== workInProgress) {
			if (0 === workInProgressSuspendedReason) var interruptedWork = workInProgress.return;
			else interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
			for (; null !== interruptedWork;) unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
			workInProgress = null;
		}
	}
	function prepareFreshStack(root, lanes) {
		var timeoutHandle = root.timeoutHandle;
		-1 !== timeoutHandle && (root.timeoutHandle = -1, cancelTimeout(timeoutHandle));
		timeoutHandle = root.cancelPendingCommit;
		null !== timeoutHandle && (root.cancelPendingCommit = null, timeoutHandle());
		pendingEffectsLanes = 0;
		resetWorkInProgressStack();
		workInProgressRoot = root;
		workInProgress = timeoutHandle = createWorkInProgress(root.current, null);
		workInProgressRootRenderLanes = lanes;
		workInProgressSuspendedReason = 0;
		workInProgressThrownValue = null;
		workInProgressRootDidSkipSuspendedSiblings = !1;
		workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		workInProgressRootDidAttachPingListener = !1;
		workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
		workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
		workInProgressRootDidIncludeRecursiveRenderUpdate = !1;
		entangledRenderLanes = getEntangledLanes(root, lanes);
		finishQueueingConcurrentUpdates();
		return timeoutHandle;
	}
	function handleThrow(root, thrownValue) {
		currentlyRenderingFiber = null;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
		workInProgressThrownValue = thrownValue;
		null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current)));
	}
	function shouldRemainOnPreviousScreen() {
		var handler = suspenseHandlerStackCursor.current;
		return null === handler ? !0 : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? !0 : !1 : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : !1;
	}
	function pushDispatcher() {
		var prevDispatcher = ReactSharedInternals.H;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
	}
	function pushAsyncDispatcher() {
		var prevAsyncDispatcher = ReactSharedInternals.A;
		ReactSharedInternals.A = DefaultAsyncDispatcher;
		return prevAsyncDispatcher;
	}
	function renderDidSuspendDelayIfPossible() {
		workInProgressRootExitStatus = 4;
		workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = !0);
		0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(workInProgressRoot, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
	}
	function renderRootSync(root, lanes, shouldYieldForPrerendering) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) workInProgressTransitions = null, prepareFreshStack(root, lanes);
		lanes = !1;
		var exitStatus = workInProgressRootExitStatus;
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
					switch (workInProgressSuspendedReason) {
						case 8:
							resetWorkInProgressStack();
							exitStatus = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							null === suspenseHandlerStackCursor.current && (lanes = !0);
							var reason = workInProgressSuspendedReason;
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
							if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
								exitStatus = 0;
								break a;
							}
							break;
						default: reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
					}
				}
				workLoopSync();
				exitStatus = workInProgressRootExitStatus;
				break;
			} catch (thrownValue$184) {
				handleThrow(root, thrownValue$184);
			}
		while (1);
		lanes && root.shellSuspendCounter++;
		lastContextDependency = currentlyRenderingFiber$1 = null;
		executionContext = prevExecutionContext;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
		return exitStatus;
	}
	function workLoopSync() {
		for (; null !== workInProgress;) performUnitOfWork(workInProgress);
	}
	function renderRootConcurrent(root, lanes) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					lanes = workInProgress;
					var thrownValue = workInProgressThrownValue;
					b: switch (workInProgressSuspendedReason) {
						case 1:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 1);
							break;
						case 2:
						case 9:
							if (isThenableResolved(thrownValue)) {
								workInProgressSuspendedReason = 0;
								workInProgressThrownValue = null;
								replaySuspendedUnitOfWork(lanes);
								break;
							}
							lanes = function() {
								2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root || (workInProgressSuspendedReason = 7);
								ensureRootIsScheduled(root);
							};
							thrownValue.then(lanes, lanes);
							break a;
						case 3:
							workInProgressSuspendedReason = 7;
							break a;
						case 4:
							workInProgressSuspendedReason = 5;
							break a;
						case 7:
							isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, lanes, thrownValue, 7));
							break;
						case 5:
							var resource = null;
							switch (workInProgress.tag) {
								case 26: resource = workInProgress.memoizedState;
								case 5:
								case 27:
									var hostFiber = workInProgress;
									if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
										workInProgressSuspendedReason = 0;
										workInProgressThrownValue = null;
										var sibling = hostFiber.sibling;
										if (null !== sibling) workInProgress = sibling;
										else {
											var returnFiber = hostFiber.return;
											null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
										}
										break b;
									}
							}
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 5);
							break;
						case 6:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 6);
							break;
						case 8:
							resetWorkInProgressStack();
							workInProgressRootExitStatus = 6;
							break a;
						default: throw Error(formatProdErrorMessage(462));
					}
				}
				workLoopConcurrentByScheduler();
				break;
			} catch (thrownValue$186) {
				handleThrow(root, thrownValue$186);
			}
		while (1);
		lastContextDependency = currentlyRenderingFiber$1 = null;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		executionContext = prevExecutionContext;
		if (null !== workInProgress) return 0;
		workInProgressRoot = null;
		workInProgressRootRenderLanes = 0;
		finishQueueingConcurrentUpdates();
		return workInProgressRootExitStatus;
	}
	function workLoopConcurrentByScheduler() {
		for (; null !== workInProgress && !shouldYield();) performUnitOfWork(workInProgress);
	}
	function performUnitOfWork(unitOfWork) {
		var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function replaySuspendedUnitOfWork(unitOfWork) {
		var next = unitOfWork;
		var current = next.alternate;
		switch (next.tag) {
			case 15:
			case 0:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type, void 0, workInProgressRootRenderLanes);
				break;
			case 11:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type.render, next.ref, workInProgressRootRenderLanes);
				break;
			case 5:
				resetHooksOnUnwind(next);
				var fiber = next;
				fiber === hydrationParentFiber && (isHydrating ? (popToNextHostParent(fiber), 5 === fiber.tag && null != fiber.stateNode && (nextHydratableInstance = fiber.stateNode)) : (popToNextHostParent(fiber), isHydrating = !0));
			default: unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
		}
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, suspendedReason) {
		lastContextDependency = currentlyRenderingFiber$1 = null;
		resetHooksOnUnwind(unitOfWork);
		thenableState$1 = null;
		thenableIndexCounter$1 = 0;
		var returnFiber = unitOfWork.return;
		try {
			if (throwException(root, returnFiber, unitOfWork, thrownValue, workInProgressRootRenderLanes)) {
				workInProgressRootExitStatus = 1;
				logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
				workInProgress = null;
				return;
			}
		} catch (error) {
			if (null !== returnFiber) throw workInProgress = returnFiber, error;
			workInProgressRootExitStatus = 1;
			logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
			workInProgress = null;
			return;
		}
		if (unitOfWork.flags & 32768) {
			if (isHydrating || 1 === suspendedReason) root = !0;
			else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912)) root = !1;
			else if (workInProgressRootDidSkipSuspendedSiblings = root = !0, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason) suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
			unwindUnitOfWork(unitOfWork, root);
		} else completeUnitOfWork(unitOfWork);
	}
	function completeUnitOfWork(unitOfWork) {
		var completedWork = unitOfWork;
		do {
			if (0 !== (completedWork.flags & 32768)) {
				unwindUnitOfWork(completedWork, workInProgressRootDidSkipSuspendedSiblings);
				return;
			}
			unitOfWork = completedWork.return;
			var next = completeWork(completedWork.alternate, completedWork, entangledRenderLanes);
			if (null !== next) {
				workInProgress = next;
				return;
			}
			completedWork = completedWork.sibling;
			if (null !== completedWork) {
				workInProgress = completedWork;
				return;
			}
			workInProgress = completedWork = unitOfWork;
		} while (null !== completedWork);
		0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
	}
	function unwindUnitOfWork(unitOfWork, skipSiblings) {
		do {
			var next = unwindWork(unitOfWork.alternate, unitOfWork);
			if (null !== next) {
				next.flags &= 32767;
				workInProgress = next;
				return;
			}
			next = unitOfWork.return;
			null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
			if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
				workInProgress = unitOfWork;
				return;
			}
			workInProgress = unitOfWork = next;
		} while (null !== unitOfWork);
		workInProgressRootExitStatus = 6;
		workInProgress = null;
	}
	function completeRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedState) {
		root.cancelPendingCommit = null;
		do
			flushPendingEffects();
		while (0 !== pendingEffectsStatus);
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		if (null !== finishedWork) {
			if (finishedWork === root.current) throw Error(formatProdErrorMessage(177));
			root === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
			pendingFinishedWork = finishedWork;
			pendingEffectsRoot = root;
			pendingEffectsLanes = lanes;
			pendingPassiveTransitions = transitions;
			pendingRecoverableErrors = recoverableErrors;
			commitRoot(root, finishedWork, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, suspendedState);
		}
	}
	function commitRoot(root, finishedWork, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, suspendedState) {
		var remainingLanes = finishedWork.lanes | finishedWork.childLanes;
		pendingEffectsRemainingLanes = remainingLanes;
		remainingLanes |= concurrentlyUpdatedLanes;
		markRootFinished(root, lanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes);
		pendingViewTransitionEvents = null;
		(lanes & 335544064) === lanes ? (pendingTransitionTypes = claimQueuedTransitionTypes(root), spawnedLane = 10262) : (pendingTransitionTypes = null, spawnedLane = 10256);
		0 !== (finishedWork.subtreeFlags & spawnedLane) || 0 !== (finishedWork.flags & spawnedLane) ? (root.callbackNode = null, root.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
			flushPassiveEffects();
			return null;
		})) : (root.callbackNode = null, root.callbackPriority = 0);
		shouldStartViewTransition = !1;
		spawnedLane = 0 !== (finishedWork.flags & 13878);
		if (0 !== (finishedWork.subtreeFlags & 13878) || spawnedLane) {
			spawnedLane = ReactSharedInternals.T;
			ReactSharedInternals.T = null;
			updatedLanes = ReactDOMSharedInternals.p;
			ReactDOMSharedInternals.p = 2;
			suspendedRetryLanes = executionContext;
			executionContext |= 4;
			try {
				commitBeforeMutationEffects(root, finishedWork, lanes);
			} finally {
				executionContext = suspendedRetryLanes, ReactDOMSharedInternals.p = updatedLanes, ReactSharedInternals.T = spawnedLane;
			}
		}
		pendingEffectsStatus = 1;
		shouldStartViewTransition ? pendingViewTransition = startViewTransition(suspendedState, root.containerInfo, pendingTransitionTypes, flushMutationEffects, flushLayoutEffects, flushAfterMutationEffects, flushSpawnedWork, flushPassiveEffects, reportViewTransitionError, null, null) : (flushMutationEffects(), flushLayoutEffects(), flushSpawnedWork());
	}
	function reportViewTransitionError(error) {
		if (0 !== pendingEffectsStatus) {
			var onRecoverableError = pendingEffectsRoot.onRecoverableError;
			onRecoverableError(error, { componentStack: null });
		}
	}
	function flushAfterMutationEffects() {
		3 === pendingEffectsStatus && (pendingEffectsStatus = 0, commitAfterMutationEffectsOnFiber(pendingFinishedWork, pendingEffectsRoot), pendingEffectsStatus = 4);
	}
	function flushMutationEffects() {
		if (1 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
			if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
				rootMutationHasEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					inUpdateViewTransition = rootViewTransitionAffected = !1;
					commitMutationEffectsOnFiber(finishedWork, root, lanes);
					lanes = selectionInformation;
					var curFocusedElem = getActiveElementDeep(root.containerInfo), priorFocusedElem = lanes.focusedElem, priorSelectionRange = lanes.selectionRange;
					if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(priorFocusedElem.ownerDocument.documentElement, priorFocusedElem)) {
						if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
							var start = priorSelectionRange.start, end = priorSelectionRange.end;
							void 0 === end && (end = start);
							if ("selectionStart" in priorFocusedElem) priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(end, priorFocusedElem.value.length);
							else {
								var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
								if (win.getSelection) {
									var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
									!selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
									var startMarker = getNodeForCharacterOffset(priorFocusedElem, start$jscomp$0), endMarker = getNodeForCharacterOffset(priorFocusedElem, end$jscomp$0);
									if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
										var range = doc.createRange();
										range.setStart(startMarker.node, startMarker.offset);
										selection.removeAllRanges();
										start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
									}
								}
							}
						}
						doc = [];
						for (selection = priorFocusedElem; selection = selection.parentNode;) 1 === selection.nodeType && doc.push({
							element: selection,
							left: selection.scrollLeft,
							top: selection.scrollTop
						});
						"function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
						for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
							var info = doc[priorFocusedElem];
							info.element.scrollLeft = info.left;
							info.element.scrollTop = info.top;
						}
					}
					_enabled = !!eventsEnabled;
					selectionInformation = eventsEnabled = null;
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
				}
			}
			root.current = finishedWork;
			pendingEffectsStatus = 2;
		}
	}
	function flushLayoutEffects() {
		if (2 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
			if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
				rootHasLayoutEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					commitLayoutEffectOnFiber(root, finishedWork.alternate, finishedWork);
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
				}
			}
			pendingEffectsStatus = 3;
		}
	}
	function flushSpawnedWork() {
		if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var committedViewTransition = pendingViewTransition;
			pendingViewTransition = null;
			requestPaint();
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors, passiveSubtreeMask = (lanes & 335544064) === lanes ? 10262 : 10256;
			0 !== (finishedWork.subtreeFlags & passiveSubtreeMask) || 0 !== (finishedWork.flags & passiveSubtreeMask) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root, root.pendingLanes));
			passiveSubtreeMask = root.pendingLanes;
			0 === passiveSubtreeMask && (legacyErrorBoundariesThatAlreadyFailed = null);
			lanesToEventPriority(lanes);
			finishedWork = finishedWork.stateNode;
			if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot) try {
				injectedHook.onCommitFiberRoot(rendererID, finishedWork, void 0, 128 === (finishedWork.current.flags & 128));
			} catch (err) {}
			if (null !== recoverableErrors) {
				finishedWork = ReactSharedInternals.T;
				passiveSubtreeMask = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				ReactSharedInternals.T = null;
				try {
					for (var onRecoverableError = root.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
						var recoverableError = recoverableErrors[i];
						onRecoverableError(recoverableError.value, { componentStack: recoverableError.stack });
					}
				} finally {
					ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = passiveSubtreeMask;
				}
			}
			recoverableErrors = pendingViewTransitionEvents;
			onRecoverableError = pendingTransitionTypes;
			pendingTransitionTypes = null;
			if (null !== recoverableErrors && (pendingViewTransitionEvents = null, null === onRecoverableError && (onRecoverableError = []), null !== committedViewTransition)) for (recoverableError = 0; recoverableError < recoverableErrors.length; recoverableError++) finishedWork = (0, recoverableErrors[recoverableError])(onRecoverableError), void 0 !== finishedWork && committedViewTransition.finished.finally(finishedWork);
			0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
			ensureRootIsScheduled(root);
			passiveSubtreeMask = root.pendingLanes;
			0 !== (lanes & 261930) && 0 !== (passiveSubtreeMask & 42) ? root === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root) : (nestedUpdateCount = 0, rootWithNestedUpdates = null);
			flushSyncWorkAcrossRoots_impl(0, !1);
		}
	}
	function releaseRootPooledCache(root, remainingLanes) {
		0 === (root.pooledCacheLanes &= remainingLanes) && (remainingLanes = root.pooledCache, null != remainingLanes && (root.pooledCache = null, releaseCache(remainingLanes)));
	}
	function flushPendingEffects() {
		null !== pendingViewTransition && (pendingViewTransition.skipTransition(), pendingViewTransition = null);
		flushMutationEffects();
		flushLayoutEffects();
		flushSpawnedWork();
		return flushPassiveEffects();
	}
	function flushPassiveEffects() {
		if (5 !== pendingEffectsStatus) return !1;
		var root = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
		pendingEffectsRemainingLanes = 0;
		var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
			ReactSharedInternals.T = null;
			renderPriority = pendingPassiveTransitions;
			pendingPassiveTransitions = null;
			var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
			pendingEffectsStatus = 0;
			pendingFinishedWork = pendingEffectsRoot = null;
			pendingEffectsLanes = 0;
			if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
			var prevExecutionContext = executionContext;
			executionContext |= 4;
			commitPassiveUnmountOnFiber(root$jscomp$0.current);
			commitPassiveMountOnFiber(root$jscomp$0, root$jscomp$0.current, lanes, renderPriority);
			executionContext = prevExecutionContext;
			flushSyncWorkAcrossRoots_impl(0, !1);
			if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot) try {
				injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
			} catch (err) {}
			return !0;
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root, remainingLanes);
		}
	}
	function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
		sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
		sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
		rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
		null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
	}
	function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
		if (3 === sourceFiber.tag) captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
		else for (; null !== nearestMountedAncestor;) {
			if (3 === nearestMountedAncestor.tag) {
				captureCommitPhaseErrorOnRoot(nearestMountedAncestor, sourceFiber, error);
				break;
			} else if (1 === nearestMountedAncestor.tag) {
				var instance = nearestMountedAncestor.stateNode;
				if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
					sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
					error = createClassErrorUpdate(2);
					instance = enqueueUpdate(nearestMountedAncestor, error, 2);
					null !== instance && (initializeClassErrorUpdate(error, instance, nearestMountedAncestor, sourceFiber), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
					break;
				}
			}
			nearestMountedAncestor = nearestMountedAncestor.return;
		}
	}
	function attachPingListener(root, wakeable, lanes) {
		var pingCache = root.pingCache;
		if (null === pingCache) {
			pingCache = root.pingCache = new PossiblyWeakMap();
			var threadIDs = /* @__PURE__ */ new Set();
			pingCache.set(wakeable, threadIDs);
		} else threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
		threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = !0, threadIDs.add(lanes), root = pingSuspendedRoot.bind(null, root, wakeable, lanes), wakeable.then(root, root));
	}
	function pingSuspendedRoot(root, wakeable, pingedLanes) {
		var pingCache = root.pingCache;
		null !== pingCache && pingCache.delete(wakeable);
		root.pingedLanes |= root.suspendedLanes & pingedLanes;
		root.warmLanes &= ~pingedLanes;
		workInProgressRoot === root && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) ? prepareFreshStack(root, 0) : workInProgressRootPingedLanes |= pingedLanes : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
		ensureRootIsScheduled(root);
	}
	function retryTimedOutBoundary(boundaryFiber, retryLane) {
		0 === retryLane && (retryLane = claimNextRetryLane());
		boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
		null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
	}
	function retryDehydratedSuspenseBoundary(boundaryFiber) {
		var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
		null !== suspenseState && (retryLane = suspenseState.retryLane);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function resolveRetryWakeable(boundaryFiber, wakeable) {
		var retryLane = 0;
		switch (boundaryFiber.tag) {
			case 31:
			case 13:
				var retryCache = boundaryFiber.stateNode;
				var suspenseState = boundaryFiber.memoizedState;
				null !== suspenseState && (retryLane = suspenseState.retryLane);
				break;
			case 19:
				retryCache = boundaryFiber.stateNode;
				break;
			case 22:
				retryCache = boundaryFiber.stateNode._retryCache;
				break;
			default: throw Error(formatProdErrorMessage(314));
		}
		null !== retryCache && retryCache.delete(wakeable);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function scheduleCallback$1(priorityLevel, callback) {
		return scheduleCallback$3(priorityLevel, callback);
	}
	var firstScheduledRoot = null;
	var lastScheduledRoot = null;
	var didScheduleMicrotask = !1;
	var mightHavePendingSyncWork = !1;
	var isFlushingWork = !1;
	var currentEventTransitionLane = 0;
	function ensureRootIsScheduled(root) {
		root !== lastScheduledRoot && null === root.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root : lastScheduledRoot = lastScheduledRoot.next = root);
		mightHavePendingSyncWork = !0;
		didScheduleMicrotask || (didScheduleMicrotask = !0, scheduleImmediateRootScheduleTask());
	}
	function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
		if (!isFlushingWork && mightHavePendingSyncWork) {
			isFlushingWork = !0;
			do {
				var didPerformSomeWork = !1;
				for (var root$190 = firstScheduledRoot; null !== root$190;) {
					if (!onlyLegacy) if (0 !== syncTransitionLanes) {
						var pendingLanes = root$190.pendingLanes;
						if (0 === pendingLanes) var JSCompiler_inline_result = 0;
						else {
							var suspendedLanes = root$190.suspendedLanes, pingedLanes = root$190.pingedLanes;
							JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
							JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
							JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
						}
						0 !== JSCompiler_inline_result && (didPerformSomeWork = !0, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
					} else JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(root$190, root$190 === workInProgressRoot ? JSCompiler_inline_result : 0, null !== root$190.cancelPendingCommit || -1 !== root$190.timeoutHandle), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$190, JSCompiler_inline_result) || (didPerformSomeWork = !0, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
					root$190 = root$190.next;
				}
			} while (didPerformSomeWork);
			isFlushingWork = !1;
		}
	}
	function processRootScheduleInImmediateTask() {
		processRootScheduleInMicrotask();
	}
	function processRootScheduleInMicrotask() {
		mightHavePendingSyncWork = didScheduleMicrotask = !1;
		var syncTransitionLanes = 0;
		0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
		for (var currentTime = now(), prev = null, root = firstScheduledRoot; null !== root;) {
			var next = root.next, nextLanes = scheduleTaskForRootDuringMicrotask(root, currentTime);
			if (0 === nextLanes) root.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
			else if (prev = root, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3)) mightHavePendingSyncWork = !0;
			root = next;
		}
		0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes, !1);
		0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
	}
	function scheduleTaskForRootDuringMicrotask(root, currentTime) {
		for (var suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes, expirationTimes = root.expirationTimes, lanes = root.pendingLanes & -62914561; 0 < lanes;) {
			var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
			if (-1 === expirationTime) {
				if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes)) expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
			} else expirationTime <= currentTime && (root.expiredLanes |= lane);
			lanes &= ~lane;
		}
		currentTime = workInProgressRoot;
		suspendedLanes = workInProgressRootRenderLanes;
		suspendedLanes = getNextLanes(root, root === currentTime ? suspendedLanes : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		pingedLanes = root.callbackNode;
		if (0 === suspendedLanes || root === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root.callbackNode = null, root.callbackPriority = 0;
		if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root, suspendedLanes)) {
			currentTime = suspendedLanes & -suspendedLanes;
			if (currentTime === root.callbackPriority) return currentTime;
			null !== pingedLanes && cancelCallback$1(pingedLanes);
			switch (lanesToEventPriority(suspendedLanes)) {
				case 2:
				case 8:
					suspendedLanes = UserBlockingPriority;
					break;
				case 32:
					suspendedLanes = NormalPriority$1;
					break;
				case 268435456:
					suspendedLanes = IdlePriority;
					break;
				default: suspendedLanes = NormalPriority$1;
			}
			pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root);
			suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
			root.callbackPriority = currentTime;
			root.callbackNode = suspendedLanes;
			return currentTime;
		}
		null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
		root.callbackPriority = 2;
		root.callbackNode = null;
		return 2;
	}
	function performWorkOnRootViaSchedulerTask(root, didTimeout) {
		if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus) return root.callbackNode = null, root.callbackPriority = 0, null;
		var originalCallbackNode = root.callbackNode;
		if (flushPendingEffects() && root.callbackNode !== originalCallbackNode) return null;
		var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
		workInProgressRootRenderLanes$jscomp$0 = getNextLanes(root, root === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
		performWorkOnRoot(root, workInProgressRootRenderLanes$jscomp$0, didTimeout);
		scheduleTaskForRootDuringMicrotask(root, now());
		return null != root.callbackNode && root.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root) : null;
	}
	function performSyncWorkOnRoot(root, lanes) {
		if (flushPendingEffects()) return null;
		performWorkOnRoot(root, lanes, !0);
	}
	function scheduleImmediateRootScheduleTask() {
		scheduleMicrotask(function() {
			0 !== (executionContext & 6) ? scheduleCallback$3(ImmediatePriority, processRootScheduleInImmediateTask) : processRootScheduleInMicrotask();
		});
	}
	function requestTransitionLane() {
		if (0 === currentEventTransitionLane) {
			var actionScopeLane = currentEntangledLane;
			0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
			currentEventTransitionLane = actionScopeLane;
		}
		return currentEventTransitionLane;
	}
	function coerceFormActionProp(actionProp) {
		return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL(actionProp);
	}
	function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
		if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
			var action = coerceFormActionProp((nativeEventTarget[internalPropsKey] || null).action), submitter = nativeEvent.submitter;
			submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
			var event = new SyntheticEvent("action", "action", null, nativeEvent, nativeEventTarget);
			dispatchQueue.push({
				event,
				listeners: [{
					instance: null,
					listener: function() {
						if (nativeEvent.defaultPrevented) {
							if (0 !== currentEventTransitionLane) {
								var formData = new FormData(nativeEventTarget, submitter);
								startHostTransition(maybeTargetInst, {
									pending: !0,
									data: formData,
									method: nativeEventTarget.method,
									action
								}, null, formData);
							}
						} else "function" === typeof action && (event.preventDefault(), formData = new FormData(nativeEventTarget, submitter), startHostTransition(maybeTargetInst, {
							pending: !0,
							data: formData,
							method: nativeEventTarget.method,
							action
						}, action, formData));
					},
					currentTarget: nativeEventTarget
				}]
			});
		}
	}
	for (var i$jscomp$inline_1667 = 0; i$jscomp$inline_1667 < simpleEventPluginEvents.length; i$jscomp$inline_1667++) {
		var eventName$jscomp$inline_1668 = simpleEventPluginEvents[i$jscomp$inline_1667];
		registerSimpleEvent(eventName$jscomp$inline_1668.toLowerCase(), "on" + (eventName$jscomp$inline_1668[0].toUpperCase() + eventName$jscomp$inline_1668.slice(1)));
	}
	registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
	registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
	registerSimpleEvent(ANIMATION_START, "onAnimationStart");
	registerSimpleEvent("dblclick", "onDoubleClick");
	registerSimpleEvent("focusin", "onFocus");
	registerSimpleEvent("focusout", "onBlur");
	registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
	registerSimpleEvent(TRANSITION_START, "onTransitionStart");
	registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
	registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
	registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
	registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
	registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
	registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
	registerTwoPhaseEvent("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
	registerTwoPhaseEvent("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
	registerTwoPhaseEvent("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]);
	registerTwoPhaseEvent("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
	var nonDelegatedEvents = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes));
	function processDispatchQueue(dispatchQueue, eventSystemFlags) {
		eventSystemFlags = 0 !== (eventSystemFlags & 4);
		for (var i = 0; i < dispatchQueue.length; i++) {
			var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
			_dispatchQueue$i = _dispatchQueue$i.listeners;
			a: {
				var previousInstance = void 0;
				if (eventSystemFlags) for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
					var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
				else for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
					_dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
					instance = _dispatchListeners$i.instance;
					currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
			}
		}
	}
	function listenToNonDelegatedEvent(domEventName, targetElement) {
		var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
		void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
		var listenerSetKey = domEventName + "__bubble";
		JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, !1), JSCompiler_inline_result.add(listenerSetKey));
	}
	function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
		var eventSystemFlags = 0;
		isCapturePhaseListener && (eventSystemFlags |= 4);
		addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
	}
	var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
	function listenToAllSupportedEvents(rootContainerElement) {
		if (!rootContainerElement[listeningMarker]) {
			rootContainerElement[listeningMarker] = !0;
			allNativeEvents.forEach(function(domEventName) {
				"selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, !1, rootContainerElement), listenToNativeEvent(domEventName, !0, rootContainerElement));
			});
			var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
			null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = !0, listenToNativeEvent("selectionchange", !1, ownerDocument));
		}
	}
	function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
		switch (getEventPriority(domEventName)) {
			case 2:
				var listenerWrapper = dispatchDiscreteEvent;
				break;
			case 8:
				listenerWrapper = dispatchContinuousEvent;
				break;
			default: listenerWrapper = dispatchEvent;
		}
		eventSystemFlags = listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
		listenerWrapper = void 0;
		!passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = !0);
		isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
			capture: !0,
			passive: listenerWrapper
		}) : targetContainer.addEventListener(domEventName, eventSystemFlags, !0) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, { passive: listenerWrapper }) : targetContainer.addEventListener(domEventName, eventSystemFlags, !1);
	}
	function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
		var ancestorInst = targetInst$jscomp$0;
		if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0) a: for (;;) {
			if (null === targetInst$jscomp$0) return;
			var nodeTag = targetInst$jscomp$0.tag;
			if (3 === nodeTag || 4 === nodeTag) {
				var container = targetInst$jscomp$0.stateNode.containerInfo;
				if (container === targetContainer) break;
				if (4 === nodeTag) for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag;) {
					var grandTag = nodeTag.tag;
					if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer) return;
					nodeTag = nodeTag.return;
				}
				for (; null !== container;) {
					nodeTag = getClosestInstanceFromNode(container);
					if (null === nodeTag) return;
					grandTag = nodeTag.tag;
					if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
						targetInst$jscomp$0 = ancestorInst = nodeTag;
						continue a;
					}
					container = container.parentNode;
				}
			}
			targetInst$jscomp$0 = targetInst$jscomp$0.return;
		}
		batchedUpdates$1(function() {
			var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
			a: {
				var reactName = topLevelEventsToReactNames.get(domEventName);
				if (void 0 !== reactName) {
					var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
					switch (domEventName) {
						case "keypress": if (0 === getEventCharCode(nativeEvent)) break a;
						case "keydown":
						case "keyup":
							SyntheticEventCtor = SyntheticKeyboardEvent;
							break;
						case "focusin":
							reactEventType = "focus";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "focusout":
							reactEventType = "blur";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "beforeblur":
						case "afterblur":
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "click": if (2 === nativeEvent.button) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							SyntheticEventCtor = SyntheticMouseEvent;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							SyntheticEventCtor = SyntheticDragEvent;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							SyntheticEventCtor = SyntheticTouchEvent;
							break;
						case ANIMATION_END:
						case ANIMATION_ITERATION:
						case ANIMATION_START:
							SyntheticEventCtor = SyntheticAnimationEvent;
							break;
						case TRANSITION_END:
							SyntheticEventCtor = SyntheticTransitionEvent;
							break;
						case "scroll":
						case "scrollend":
							SyntheticEventCtor = SyntheticUIEvent;
							break;
						case "wheel":
							SyntheticEventCtor = SyntheticWheelEvent;
							break;
						case "copy":
						case "cut":
						case "paste":
							SyntheticEventCtor = SyntheticClipboardEvent;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							SyntheticEventCtor = SyntheticPointerEvent;
							break;
						case "submit":
							SyntheticEventCtor = SyntheticSubmitEvent;
							break;
						case "toggle":
						case "beforetoggle": SyntheticEventCtor = SyntheticToggleEvent;
					}
					var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
					inCapturePhase = [];
					for (var instance = targetInst, lastHostComponent; null !== instance;) {
						var _instance = instance;
						lastHostComponent = _instance.stateNode;
						_instance = _instance.tag;
						5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(createDispatchListener(instance, _instance, lastHostComponent)));
						if (accumulateTargetOnly) break;
						instance = instance.return;
					}
					0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
						event: reactName,
						listeners: inCapturePhase
					}));
				}
			}
			if (0 === (eventSystemFlags & 7)) {
				a: {
					SyntheticEventCtor = "mouseover" === domEventName || "pointerover" === domEventName;
					reactName = "mouseout" === domEventName || "pointerout" === domEventName;
					if (SyntheticEventCtor && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey])) break a;
					if (reactName || SyntheticEventCtor) {
						reactEventType = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (SyntheticEventCtor = nativeEventTarget.ownerDocument) ? SyntheticEventCtor.defaultView || SyntheticEventCtor.parentWindow : window;
						if (reactName) {
							if (SyntheticEventCtor = nativeEvent.relatedTarget || nativeEvent.toElement, reactName = targetInst, SyntheticEventCtor = SyntheticEventCtor ? getClosestInstanceFromNode(SyntheticEventCtor) : null, null !== SyntheticEventCtor && (accumulateTargetOnly = getNearestMountedFiber(SyntheticEventCtor), inCapturePhase = SyntheticEventCtor.tag, SyntheticEventCtor !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase)) SyntheticEventCtor = null;
						} else reactName = null, SyntheticEventCtor = targetInst;
						if (reactName !== SyntheticEventCtor) {
							inCapturePhase = SyntheticMouseEvent;
							_instance = "onMouseLeave";
							reactEventName = "onMouseEnter";
							instance = "mouse";
							if ("pointerout" === domEventName || "pointerover" === domEventName) inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
							accumulateTargetOnly = null == reactName ? reactEventType : getNodeFromInstance(reactName);
							lastHostComponent = null == SyntheticEventCtor ? reactEventType : getNodeFromInstance(SyntheticEventCtor);
							reactEventType = new inCapturePhase(_instance, instance + "leave", reactName, nativeEvent, nativeEventTarget);
							reactEventType.target = accumulateTargetOnly;
							reactEventType.relatedTarget = lastHostComponent;
							_instance = null;
							getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(reactEventName, instance + "enter", SyntheticEventCtor, nativeEvent, nativeEventTarget), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
							accumulateTargetOnly = _instance;
							inCapturePhase = reactName && SyntheticEventCtor ? getLowestCommonAncestor(reactName, SyntheticEventCtor, getParent) : null;
							null !== reactName && accumulateEnterLeaveListenersForEvent(dispatchQueue, reactEventType, reactName, inCapturePhase, !1);
							null !== SyntheticEventCtor && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(dispatchQueue, accumulateTargetOnly, SyntheticEventCtor, inCapturePhase, !0);
						}
					}
				}
				a: {
					reactName = targetInst ? getNodeFromInstance(targetInst) : window;
					SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
					if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type) var getTargetInstFunc = getTargetInstForChangeEvent;
					else if (isTextInputElement(reactName)) if (isInputEventSupported) getTargetInstFunc = getTargetInstForInputOrChangeEvent;
					else {
						getTargetInstFunc = getTargetInstForInputEventPolyfill;
						var handleEventFunc = handleEventsForInputEventPolyfill;
					}
					else SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
					if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
						createAndAccumulateChangeEvent(dispatchQueue, getTargetInstFunc, nativeEvent, nativeEventTarget);
						break a;
					}
					handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
				}
				handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
				switch (domEventName) {
					case "focusin":
						if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable) activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
						break;
					case "focusout":
						lastSelection = activeElementInst = activeElement = null;
						break;
					case "mousedown":
						mouseDown = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						mouseDown = !1;
						constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
						break;
					case "selectionchange": if (skipSelectionChangeEvent) break;
					case "keydown":
					case "keyup": constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
				}
				var fallbackData;
				if (canUseCompositionEvent) b: {
					switch (domEventName) {
						case "compositionstart":
							var eventType = "onCompositionStart";
							break b;
						case "compositionend":
							eventType = "onCompositionEnd";
							break b;
						case "compositionupdate":
							eventType = "onCompositionUpdate";
							break b;
					}
					eventType = void 0;
				}
				else isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
				eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = !0)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: eventType,
					listeners: handleEventFunc
				}), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
				if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent)) eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent("onBeforeInput", "beforeinput", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: handleEventFunc,
					listeners: eventType
				}), handleEventFunc.data = fallbackData);
				extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
			}
			processDispatchQueue(dispatchQueue, eventSystemFlags);
		});
	}
	function createDispatchListener(instance, listener, currentTarget) {
		return {
			instance,
			listener,
			currentTarget
		};
	}
	function accumulateTwoPhaseListeners(targetFiber, reactName) {
		for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber;) {
			var _instance2 = targetFiber, stateNode = _instance2.stateNode;
			_instance2 = _instance2.tag;
			5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(createDispatchListener(targetFiber, _instance2, stateNode)), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(createDispatchListener(targetFiber, _instance2, stateNode)));
			if (3 === targetFiber.tag) return listeners;
			targetFiber = targetFiber.return;
		}
		return [];
	}
	function getParent(inst) {
		if (null === inst) return null;
		do
			inst = inst.return;
		while (inst && 5 !== inst.tag && 27 !== inst.tag);
		return inst ? inst : null;
	}
	function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
		for (var registrationName = event._reactName, listeners = []; null !== target && target !== common;) {
			var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
			_instance3 = _instance3.tag;
			if (null !== alternate && alternate === common) break;
			5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(createDispatchListener(target, stateNode, alternate))) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(createDispatchListener(target, stateNode, alternate))));
			target = target.return;
		}
		0 !== listeners.length && dispatchQueue.push({
			event,
			listeners
		});
	}
	var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
	var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
	function normalizeMarkupForTextOrAttribute(markup) {
		return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
	}
	function checkForUnmatchedText(serverText, clientText) {
		clientText = normalizeMarkupForTextOrAttribute(clientText);
		return normalizeMarkupForTextOrAttribute(serverText) === clientText ? !0 : !1;
	}
	function setProp(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "children":
				if ("string" === typeof value) "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value);
				else if ("number" === typeof value || "bigint" === typeof value) "body" !== tag && setTextContent(domElement, "" + value);
				else return;
				break;
			case "className":
				setValueForKnownAttribute(domElement, "class", value);
				break;
			case "tabIndex":
				setValueForKnownAttribute(domElement, "tabindex", value);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				setValueForKnownAttribute(domElement, key, value);
				break;
			case "style":
				setValueForStyles(domElement, value, prevValue);
				return;
			case "data": if ("object" !== tag) {
				setValueForKnownAttribute(domElement, "data", value);
				break;
			}
			case "src":
			case "href":
				if ("" === value && ("a" !== tag || "href" !== key)) {
					domElement.removeAttribute(key);
					break;
				}
				if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL(value);
				domElement.setAttribute(key, value);
				break;
			case "action":
			case "formAction":
				if ("function" === typeof value) {
					domElement.setAttribute(key, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				} else "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(domElement, tag, "formEncType", props.formEncType, props, null), setProp(domElement, tag, "formMethod", props.formMethod, props, null), setProp(domElement, tag, "formTarget", props.formTarget, props, null)) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
				if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL(value);
				domElement.setAttribute(key, value);
				break;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				return;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				return;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				return;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						(null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
					}
				}
				break;
			case "multiple":
				domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "muted":
				domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
					domElement.removeAttribute("xlink:href");
					break;
				}
				key = sanitizeURL(value);
				domElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", key);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
				break;
			case "capture":
			case "download":
				!0 === value ? domElement.setAttribute(key, "") : !1 !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "rowSpan":
			case "start":
				null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
				break;
			case "popover":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				setValueForAttribute(domElement, "popover", value);
				break;
			case "xlinkActuate":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:actuate", value);
				break;
			case "xlinkArcrole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:arcrole", value);
				break;
			case "xlinkRole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:role", value);
				break;
			case "xlinkShow":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:show", value);
				break;
			case "xlinkTitle":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:title", value);
				break;
			case "xlinkType":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:type", value);
				break;
			case "xmlBase":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:base", value);
				break;
			case "xmlLang":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:lang", value);
				break;
			case "xmlSpace":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:space", value);
				break;
			case "is":
				setValueForAttribute(domElement, "is", value);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1]) key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
			else return;
		}
		viewTransitionMutationContext = !0;
	}
	function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "style":
				setValueForStyles(domElement, value, prevValue);
				return;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						(null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
					}
				}
				break;
			case "children":
				if ("string" === typeof value) setTextContent(domElement, value);
				else if ("number" === typeof value || "bigint" === typeof value) setTextContent(domElement, "" + value);
				else return;
				break;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				return;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				return;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!registrationNameDependencies.hasOwnProperty(key)) a: {
					if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), prevValue = key.slice(2, props ? key.length - 7 : void 0), tag = domElement[internalPropsKey] || null, tag = null != tag ? tag[key] : null, "function" === typeof tag && domElement.removeEventListener(prevValue, tag, props), "function" === typeof value)) {
						"function" !== typeof tag && null !== tag && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
						domElement.addEventListener(prevValue, value, props);
						break a;
					}
					viewTransitionMutationContext = !0;
					key in domElement ? domElement[key] = value : !0 === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
				}
				return;
		}
		viewTransitionMutationContext = !0;
	}
	function setInitialProperties(domElement, tag, props) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				var hasSrc = !1, hasSrcSet = !1, propKey;
				for (propKey in props) if (props.hasOwnProperty(propKey)) {
					var propValue = props[propKey];
					if (null != propValue) switch (propKey) {
						case "src":
							hasSrc = !0;
							break;
						case "srcSet":
							hasSrcSet = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
						default: setProp(domElement, tag, propKey, propValue, props, null);
					}
				}
				hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
				hasSrc && setProp(domElement, tag, "src", props.src, props, null);
				return;
			case "input":
				listenToNonDelegatedEvent("invalid", domElement);
				var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
				for (hasSrc in props) if (props.hasOwnProperty(hasSrc)) {
					var propValue$204 = props[hasSrc];
					if (null != propValue$204) switch (hasSrc) {
						case "name":
							hasSrcSet = propValue$204;
							break;
						case "type":
							propValue = propValue$204;
							break;
						case "checked":
							checked = propValue$204;
							break;
						case "defaultChecked":
							defaultChecked = propValue$204;
							break;
						case "value":
							propKey = propValue$204;
							break;
						case "defaultValue":
							defaultValue = propValue$204;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propValue$204) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: setProp(domElement, tag, hasSrc, propValue$204, props, null);
					}
				}
				initInput(domElement, propKey, defaultValue, checked, defaultChecked, propValue, hasSrcSet, !1);
				return;
			case "select":
				listenToNonDelegatedEvent("invalid", domElement);
				hasSrc = propValue = propKey = null;
				for (hasSrcSet in props) if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue)) switch (hasSrcSet) {
					case "value":
						propKey = defaultValue;
						break;
					case "defaultValue":
						propValue = defaultValue;
						break;
					case "multiple": hasSrc = defaultValue;
					default: setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
				}
				tag = propKey;
				props = propValue;
				domElement.multiple = !!hasSrc;
				null != tag ? updateOptions(domElement, !!hasSrc, tag, !1) : null != props && updateOptions(domElement, !!hasSrc, props, !0);
				return;
			case "textarea":
				listenToNonDelegatedEvent("invalid", domElement);
				propKey = hasSrcSet = hasSrc = null;
				for (propValue in props) if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue)) switch (propValue) {
					case "value":
						hasSrc = defaultValue;
						break;
					case "defaultValue":
						hasSrcSet = defaultValue;
						break;
					case "children":
						propKey = defaultValue;
						break;
					case "dangerouslySetInnerHTML":
						if (null != defaultValue) throw Error(formatProdErrorMessage(91));
						break;
					default: setProp(domElement, tag, propValue, defaultValue, props, null);
				}
				initTextarea(domElement, hasSrc, hasSrcSet, propKey);
				return;
			case "option":
				for (checked in props) if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc)) switch (checked) {
					case "selected":
						domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
						break;
					default: setProp(domElement, tag, checked, hasSrc, props, null);
				}
				return;
			case "dialog":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				listenToNonDelegatedEvent("cancel", domElement);
				listenToNonDelegatedEvent("close", domElement);
				break;
			case "iframe":
			case "object":
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "video":
			case "audio":
				for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++) listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
				break;
			case "image":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", domElement);
				break;
			case "embed":
			case "source":
			case "link": listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (defaultChecked in props) if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc)) switch (defaultChecked) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
					default: setProp(domElement, tag, defaultChecked, hasSrc, props, null);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (propValue$204 in props) props.hasOwnProperty(propValue$204) && (hasSrc = props[propValue$204], void 0 !== hasSrc && setPropOnCustomElement(domElement, tag, propValue$204, hasSrc, props, void 0));
				return;
			}
		}
		for (defaultValue in props) props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
	}
	var emptyProps = {};
	function updateProperties(domElement, tag, lastProps, nextProps) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
				for (propKey in lastProps) {
					var lastProp = lastProps[propKey];
					if (lastProps.hasOwnProperty(propKey) && null != lastProp) switch (propKey) {
						case "checked": break;
						case "value": break;
						case "defaultValue": lastDefaultValue = lastProp;
						default: nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
					}
				}
				for (var propKey$221 in nextProps) {
					var propKey = nextProps[propKey$221];
					lastProp = lastProps[propKey$221];
					if (nextProps.hasOwnProperty(propKey$221) && (null != propKey || null != lastProp)) switch (propKey$221) {
						case "type":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							type = propKey;
							break;
						case "name":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							name = propKey;
							break;
						case "checked":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							checked = propKey;
							break;
						case "defaultChecked":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							defaultChecked = propKey;
							break;
						case "value":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							value = propKey;
							break;
						case "defaultValue":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							defaultValue = propKey;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propKey) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: propKey !== lastProp && setProp(domElement, tag, propKey$221, propKey, nextProps, lastProp);
					}
				}
				updateInput(domElement, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name);
				return;
			case "select":
				propKey = value = defaultValue = propKey$221 = null;
				for (type in lastProps) if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue) switch (type) {
					case "value": break;
					case "multiple": propKey = lastDefaultValue;
					default: nextProps.hasOwnProperty(type) || setProp(domElement, tag, type, null, nextProps, lastDefaultValue);
				}
				for (name in nextProps) if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue)) switch (name) {
					case "value":
						type !== lastDefaultValue && (viewTransitionMutationContext = !0);
						propKey$221 = type;
						break;
					case "defaultValue":
						type !== lastDefaultValue && (viewTransitionMutationContext = !0);
						defaultValue = type;
						break;
					case "multiple": type !== lastDefaultValue && (viewTransitionMutationContext = !0), value = type;
					default: type !== lastDefaultValue && setProp(domElement, tag, name, type, nextProps, lastDefaultValue);
				}
				tag = defaultValue;
				lastProps = value;
				nextProps = propKey;
				null != propKey$221 ? updateOptions(domElement, !!lastProps, propKey$221, !1) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, !0) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", !1));
				return;
			case "textarea":
				propKey = propKey$221 = null;
				for (defaultValue in lastProps) if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue)) switch (defaultValue) {
					case "value": break;
					case "children": break;
					default: setProp(domElement, tag, defaultValue, null, nextProps, name);
				}
				for (value in nextProps) if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type)) switch (value) {
					case "value":
						name !== type && (viewTransitionMutationContext = !0);
						propKey$221 = name;
						break;
					case "defaultValue":
						name !== type && (viewTransitionMutationContext = !0);
						propKey = name;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (null != name) throw Error(formatProdErrorMessage(91));
						break;
					default: name !== type && setProp(domElement, tag, value, name, nextProps, type);
				}
				updateTextarea(domElement, propKey$221, propKey);
				return;
			case "option":
				for (var propKey$237 in lastProps) if (propKey$221 = lastProps[propKey$237], lastProps.hasOwnProperty(propKey$237) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$237)) switch (propKey$237) {
					case "selected":
						domElement.selected = !1;
						break;
					default: setProp(domElement, tag, propKey$237, null, nextProps, propKey$221);
				}
				for (lastDefaultValue in nextProps) if (propKey$221 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$221 !== propKey && (null != propKey$221 || null != propKey)) switch (lastDefaultValue) {
					case "selected":
						propKey$221 !== propKey && (viewTransitionMutationContext = !0);
						domElement.selected = propKey$221 && "function" !== typeof propKey$221 && "symbol" !== typeof propKey$221;
						break;
					default: setProp(domElement, tag, lastDefaultValue, propKey$221, nextProps, propKey);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var propKey$242 in lastProps) propKey$221 = lastProps[propKey$242], lastProps.hasOwnProperty(propKey$242) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$242) && setProp(domElement, tag, propKey$242, null, nextProps, propKey$221);
				for (checked in nextProps) if (propKey$221 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$221 !== propKey && (null != propKey$221 || null != propKey)) switch (checked) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (null != propKey$221) throw Error(formatProdErrorMessage(137, tag));
						break;
					default: setProp(domElement, tag, checked, propKey$221, nextProps, propKey);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (var propKey$247 in lastProps) propKey$221 = lastProps[propKey$247], lastProps.hasOwnProperty(propKey$247) && void 0 !== propKey$221 && !nextProps.hasOwnProperty(propKey$247) && setPropOnCustomElement(domElement, tag, propKey$247, void 0, nextProps, propKey$221);
				for (defaultChecked in nextProps) propKey$221 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$221 === propKey || void 0 === propKey$221 && void 0 === propKey || setPropOnCustomElement(domElement, tag, defaultChecked, propKey$221, nextProps, propKey);
				return;
			}
		}
		for (var propKey$252 in lastProps) propKey$221 = lastProps[propKey$252], lastProps.hasOwnProperty(propKey$252) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$252) && setProp(domElement, tag, propKey$252, null, nextProps, propKey$221);
		for (lastProp in nextProps) propKey$221 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$221 === propKey || null == propKey$221 && null == propKey || setProp(domElement, tag, lastProp, propKey$221, nextProps, propKey);
	}
	function isLikelyStaticResource(initiatorType) {
		switch (initiatorType) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function estimateBandwidth() {
		if ("function" === typeof performance.getEntriesByType) {
			for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
				var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
				if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
					initiatorType = 0;
					duration = entry.responseEnd;
					for (i += 1; i < resourceEntries.length; i++) {
						var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
						if (overlapStartTime > duration) break;
						var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
						overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
					}
					--i;
					bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
					count++;
					if (10 < count) break;
				}
			}
			if (0 < count) return bits / count / 1e6;
		}
		return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
	}
	var eventsEnabled = null;
	var selectionInformation = null;
	function getOwnerDocumentFromRootContainer(rootContainerElement) {
		return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
	}
	function getOwnHostContext(namespaceURI) {
		switch (namespaceURI) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function getChildHostContextProd(parentNamespace, type) {
		if (0 === parentNamespace) switch (type) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
	}
	function createHoistableInstance(type, props, rootContainerInstance, internalInstanceHandle) {
		rootContainerInstance = getOwnerDocumentFromRootContainer(rootContainerInstance).createElement(type);
		rootContainerInstance[internalInstanceKey] = internalInstanceHandle;
		rootContainerInstance[internalPropsKey] = props;
		setInitialProperties(rootContainerInstance, type, props);
		markNodeAsHoistable(rootContainerInstance);
		return rootContainerInstance;
	}
	function shouldSetTextContent(type, props) {
		return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
	}
	var currentPopstateTransitionEvent = null;
	function shouldAttemptEagerTransition() {
		var event = window.event;
		if (event && "popstate" === event.type) {
			if (event === currentPopstateTransitionEvent) return !1;
			currentPopstateTransitionEvent = event;
			return !0;
		}
		currentPopstateTransitionEvent = null;
		return !1;
	}
	var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0;
	var cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0;
	var localPromise = "function" === typeof Promise ? Promise : void 0;
	var localRequestAnimationFrame = "function" === typeof requestAnimationFrame ? requestAnimationFrame : scheduleTimeout;
	var scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
		return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
	} : scheduleTimeout;
	function handleErrorInNextTick(error) {
		setTimeout(function() {
			throw error;
		});
	}
	function isSingletonScope(type) {
		return "head" === type;
	}
	function clearHydrationBoundary(parentInstance, hydrationInstance) {
		var node = hydrationInstance, depth = 0;
		do {
			var nextNode = node.nextSibling;
			parentInstance.removeChild(node);
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node || "/&" === node) {
				if (0 === depth) {
					parentInstance.removeChild(nextNode);
					retryIfBlockedOn(hydrationInstance);
					return;
				}
				depth--;
			} else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node) depth++;
			else if ("html" === node) clearSingletonPreambleContribution(parentInstance.ownerDocument.documentElement);
			else if ("head" === node) {
				node = parentInstance.ownerDocument.head;
				clearSingletonPreambleContribution(node);
				for (var node$jscomp$0 = node.firstChild; node$jscomp$0;) {
					var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
					node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
					node$jscomp$0 = nextNode$jscomp$0;
				}
			} else "body" === node && clearSingletonPreambleContribution(parentInstance.ownerDocument.body);
			node = nextNode;
		} while (node);
		retryIfBlockedOn(hydrationInstance);
	}
	function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
		var node = suspenseInstance;
		suspenseInstance = 0;
		do {
			var nextNode = node.nextSibling;
			1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node) if (0 === suspenseInstance) break;
			else suspenseInstance--;
			else "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
			node = nextNode;
		} while (node);
	}
	function applyViewTransitionName(instance, name, className) {
		name = CSS.escape(name) !== name ? "r-" + btoa(name).replace(/=/g, "") : name;
		instance.style.viewTransitionName = name;
		null != className && (instance.style.viewTransitionClass = className);
		className = getComputedStyle(instance);
		if ("inline" === className.display) {
			name = instance.getClientRects();
			if (1 === name.length) var JSCompiler_inline_result = 1;
			else for (var i = JSCompiler_inline_result = 0; i < name.length; i++) {
				var rect = name[i];
				0 < rect.width && 0 < rect.height && JSCompiler_inline_result++;
			}
			1 === JSCompiler_inline_result && (instance = instance.style, instance.display = 1 === name.length ? "inline-block" : "block", instance.marginTop = "-" + className.paddingTop, instance.marginBottom = "-" + className.paddingBottom);
		}
	}
	function restoreViewTransitionName(instance, props) {
		instance = instance.style;
		props = props.style;
		var viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionName") ? props.viewTransitionName : props.hasOwnProperty("view-transition-name") ? props["view-transition-name"] : null : null;
		instance.viewTransitionName = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
		viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionClass") ? props.viewTransitionClass : props.hasOwnProperty("view-transition-class") ? props["view-transition-class"] : null : null;
		instance.viewTransitionClass = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
		"inline-block" === instance.display && (null == props ? instance.display = instance.margin = "" : (viewTransitionName = props.display, instance.display = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, viewTransitionName = props.margin, null != viewTransitionName ? instance.margin = viewTransitionName : (viewTransitionName = props.hasOwnProperty("marginTop") ? props.marginTop : props["margin-top"], instance.marginTop = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, props = props.hasOwnProperty("marginBottom") ? props.marginBottom : props["margin-bottom"], instance.marginBottom = null == props || "boolean" === typeof props ? "" : props)));
	}
	function createMeasurement(rect, computedStyle, element) {
		element = element.ownerDocument.defaultView;
		return {
			rect,
			abs: "absolute" === computedStyle.position || "fixed" === computedStyle.position,
			clip: "none" !== computedStyle.clipPath || "visible" !== computedStyle.overflow || "none" !== computedStyle.filter || "none" !== computedStyle.mask || "none" !== computedStyle.mask || "0px" !== computedStyle.borderRadius,
			view: 0 <= rect.bottom && 0 <= rect.right && rect.top <= element.innerHeight && rect.left <= element.innerWidth
		};
	}
	function measureInstance(instance) {
		return createMeasurement(instance.getBoundingClientRect(), getComputedStyle(instance), instance);
	}
	function measureClonedInstance(instance) {
		var measuredRect = instance.getBoundingClientRect();
		measuredRect = new DOMRect(measuredRect.x + 2e4, measuredRect.y + 2e4, measuredRect.width, measuredRect.height);
		var computedStyle = getComputedStyle(instance);
		return createMeasurement(measuredRect, computedStyle, instance);
	}
	function forceLayout(ownerDocument) {
		return ownerDocument.documentElement.clientHeight;
	}
	function waitForImageToLoad(resolve) {
		this.addEventListener("load", resolve);
		this.addEventListener("error", resolve);
	}
	function startViewTransition(suspendedState, rootContainer, transitionTypes, mutationCallback, layoutCallback, afterMutationCallback, spawnedWorkCallback, passiveCallback, errorCallback) {
		var ownerDocument = 9 === rootContainer.nodeType ? rootContainer : rootContainer.ownerDocument;
		try {
			var transition = ownerDocument.startViewTransition({
				update: function() {
					var ownerWindow = ownerDocument.defaultView, pendingNavigation = ownerWindow.navigation && ownerWindow.navigation.transition, previousFontLoadingStatus = ownerDocument.fonts.status;
					mutationCallback();
					var blockingPromises = [];
					"loaded" === previousFontLoadingStatus && (forceLayout(ownerDocument), "loading" === ownerDocument.fonts.status && blockingPromises.push(ownerDocument.fonts.ready));
					previousFontLoadingStatus = blockingPromises.length;
					if (null !== suspendedState) for (var suspenseyImages = suspendedState.suspenseyImages, imgBytes = 0, i = 0; i < suspenseyImages.length; i++) {
						var suspenseyImage = suspenseyImages[i];
						if (!suspenseyImage.complete) {
							var rect = suspenseyImage.getBoundingClientRect();
							if (0 < rect.bottom && 0 < rect.right && rect.top < ownerWindow.innerHeight && rect.left < ownerWindow.innerWidth) {
								imgBytes += estimateImageBytes(suspenseyImage);
								if (imgBytes > estimatedBytesWithinLimit) {
									blockingPromises.length = previousFontLoadingStatus;
									break;
								}
								suspenseyImage = new Promise(waitForImageToLoad.bind(suspenseyImage));
								blockingPromises.push(suspenseyImage);
							}
						}
					}
					if (0 < blockingPromises.length) return ownerWindow = Promise.race([Promise.all(blockingPromises), new Promise(function(resolve) {
						return setTimeout(resolve, 500);
					})]).then(layoutCallback, layoutCallback), (pendingNavigation ? Promise.allSettled([pendingNavigation.finished, ownerWindow]) : ownerWindow).then(afterMutationCallback, afterMutationCallback);
					layoutCallback();
					if (pendingNavigation) return pendingNavigation.finished.then(afterMutationCallback, afterMutationCallback);
					afterMutationCallback();
				},
				types: transitionTypes
			});
			ownerDocument.__reactViewTransition = transition;
			var viewTransitionAnimations = [];
			transition.ready.then(function() {
				for (var animations = ownerDocument.documentElement.getAnimations({ subtree: !0 }), i = 0; i < animations.length; i++) {
					var animation = animations[i], effect = animation.effect, pseudoElement = effect.pseudoElement;
					if (null != pseudoElement && pseudoElement.startsWith("::view-transition")) {
						viewTransitionAnimations.push(animation);
						animation = effect.getKeyframes();
						for (var height = pseudoElement = void 0, unchangedDimensions = !0, j = 0; j < animation.length; j++) {
							var keyframe = animation[j], w = keyframe.width;
							if (void 0 === pseudoElement) pseudoElement = w;
							else if (pseudoElement !== w) {
								unchangedDimensions = !1;
								break;
							}
							w = keyframe.height;
							if (void 0 === height) height = w;
							else if (height !== w) {
								unchangedDimensions = !1;
								break;
							}
							delete keyframe.width;
							delete keyframe.height;
							"none" === keyframe.transform && delete keyframe.transform;
						}
						unchangedDimensions && void 0 !== pseudoElement && void 0 !== height && (effect.setKeyframes(animation), unchangedDimensions = getComputedStyle(effect.target, effect.pseudoElement), unchangedDimensions.width !== pseudoElement || unchangedDimensions.height !== height) && (unchangedDimensions = animation[0], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, unchangedDimensions = animation[animation.length - 1], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, effect.setKeyframes(animation));
					}
				}
				spawnedWorkCallback();
			}, function(error) {
				ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
				try {
					if ("object" === typeof error && null !== error) switch (error.name) {
						case "InvalidStateError": if ("View transition was skipped because document visibility state is hidden." === error.message || "Skipping view transition because document visibility state has become hidden." === error.message || "Skipping view transition because viewport size changed." === error.message || "Transition was aborted because of invalid state" === error.message) error = null;
					}
					null !== error && errorCallback(error);
				} finally {
					mutationCallback(), layoutCallback(), spawnedWorkCallback();
				}
			});
			transition.finished.finally(function() {
				for (var i = 0; i < viewTransitionAnimations.length; i++) viewTransitionAnimations[i].cancel();
				ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
				passiveCallback();
			});
			return transition;
		} catch (x) {
			return mutationCallback(), layoutCallback(), spawnedWorkCallback(), null;
		}
	}
	function ViewTransitionPseudoElement(pseudo, name) {
		this._scope = document.documentElement;
		this._selector = "::view-transition-" + pseudo + "(" + name + ")";
	}
	ViewTransitionPseudoElement.prototype.animate = function(keyframes, options) {
		options = "number" === typeof options ? { duration: options } : assign({}, options);
		options.pseudoElement = this._selector;
		return this._scope.animate(keyframes, options);
	};
	ViewTransitionPseudoElement.prototype.getAnimations = function() {
		for (var scope = this._scope, selector = this._selector, animations = scope.getAnimations({ subtree: !0 }), result = [], i = 0; i < animations.length; i++) {
			var effect = animations[i].effect;
			null !== effect && effect.target === scope && effect.pseudoElement === selector && result.push(animations[i]);
		}
		return result;
	};
	ViewTransitionPseudoElement.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function createViewTransitionInstance(name) {
		return {
			name,
			group: new ViewTransitionPseudoElement("group", name),
			imagePair: new ViewTransitionPseudoElement("image-pair", name),
			old: new ViewTransitionPseudoElement("old", name),
			new: new ViewTransitionPseudoElement("new", name)
		};
	}
	function FragmentInstance(fragmentFiber) {
		this._fragmentFiber = fragmentFiber;
		this._observers = this._eventListeners = null;
	}
	FragmentInstance.prototype.addEventListener = function(type, listener, optionsOrUseCapture) {
		var signal = null, cleanup = null;
		if (null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && (signal = optionsOrUseCapture.signal || null, null !== signal && signal.aborted)) return;
		null === this._eventListeners && (this._eventListeners = []);
		var listeners = this._eventListeners;
		if (-1 === indexOfEventListener(listeners, type, listener, optionsOrUseCapture)) {
			var fragmentInstance = this, attachedListener = listener;
			null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && !0 === optionsOrUseCapture.once && (attachedListener = function(event) {
				fragmentInstance.removeEventListener(type, listener, optionsOrUseCapture);
				"function" === typeof listener ? listener.call(this, event) : listener.handleEvent(event);
			});
			null !== signal && (cleanup = fragmentInstance.removeEventListener.bind(fragmentInstance, type, listener, optionsOrUseCapture), signal.addEventListener("abort", cleanup, { once: !0 }), cleanup = signal.removeEventListener.bind(signal, "abort", cleanup));
			signal = getAttachOptions(optionsOrUseCapture);
			listeners.push({
				type,
				listener,
				optionsOrUseCapture,
				attachedListener,
				cleanup
			});
			traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, addEventListenerToChild, type, attachedListener, signal);
		}
		this._eventListeners = listeners;
	};
	function addEventListenerToChild(child, type, listener, optionsOrUseCapture) {
		getInstanceFromHostFiber(child).addEventListener(type, listener, optionsOrUseCapture);
		return !1;
	}
	FragmentInstance.prototype.removeEventListener = function(type, listener, optionsOrUseCapture) {
		var listeners = this._eventListeners;
		if (null !== listeners && (listener = indexOfEventListener(listeners, type, listener, optionsOrUseCapture), -1 !== listener)) {
			var _listeners$index = listeners[listener];
			optionsOrUseCapture = _listeners$index.attachedListener;
			var cleanup = _listeners$index.cleanup;
			_listeners$index = getAttachOptions(_listeners$index.optionsOrUseCapture);
			traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, removeEventListenerFromChild, type, optionsOrUseCapture, _listeners$index);
			listeners.splice(listener, 1);
			null !== cleanup && cleanup();
		}
	};
	function removeEventListenerFromChild(child, type, listener, optionsOrUseCapture) {
		getInstanceFromHostFiber(child).removeEventListener(type, listener, optionsOrUseCapture);
		return !1;
	}
	function getAttachOptions(opts) {
		return null != opts && "boolean" !== typeof opts && (!0 === opts.once || opts.signal instanceof AbortSignal) ? {
			capture: opts.capture,
			passive: opts.passive
		} : opts;
	}
	function normalizeListenerOptions(opts) {
		return null == opts ? "c=0" : "boolean" === typeof opts ? "c=" + (opts ? "1" : "0") : "c=" + (opts.capture ? "1" : "0");
	}
	function indexOfEventListener(eventListeners, type, listener, optionsOrUseCapture) {
		if (0 === eventListeners.length) return -1;
		optionsOrUseCapture = normalizeListenerOptions(optionsOrUseCapture);
		for (var i = 0; i < eventListeners.length; i++) {
			var item = eventListeners[i];
			if (item.type === type && item.listener === listener && normalizeListenerOptions(item.optionsOrUseCapture) === optionsOrUseCapture) return i;
		}
		return -1;
	}
	FragmentInstance.prototype.dispatchEvent = function(event) {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		if (null === parentHostFiber) return !0;
		parentHostFiber = getInstanceFromHostFiber(parentHostFiber);
		var eventListeners = this._eventListeners;
		if (null !== eventListeners && 0 < eventListeners.length || !event.bubbles) {
			var temp = 9 === parentHostFiber.nodeType ? parentHostFiber.createComment("") : document.createTextNode("");
			if (eventListeners) for (var i = 0; i < eventListeners.length; i++) {
				var _eventListeners$i = eventListeners[i];
				temp.addEventListener(_eventListeners$i.type, _eventListeners$i.attachedListener, getAttachOptions(_eventListeners$i.optionsOrUseCapture));
			}
			parentHostFiber.appendChild(temp);
			event = temp.dispatchEvent(event);
			if (eventListeners) for (i = 0; i < eventListeners.length; i++) _eventListeners$i = eventListeners[i], temp.removeEventListener(_eventListeners$i.type, _eventListeners$i.attachedListener, getAttachOptions(_eventListeners$i.optionsOrUseCapture));
			parentHostFiber.removeChild(temp);
			return event;
		}
		return parentHostFiber.dispatchEvent(event);
	};
	FragmentInstance.prototype.focus = function(focusOptions) {
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !0, setFocusOnFiberIfFocusable, focusOptions, void 0, void 0);
	};
	function setFocusOnFiberIfFocusable(fiber, focusOptions) {
		if (6 === fiber.tag) return !1;
		fiber = getInstanceFromHostFiber(fiber);
		return setFocusIfFocusable(fiber, focusOptions);
	}
	FragmentInstance.prototype.focusLast = function(focusOptions) {
		var children = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !0, collectChildren, children, void 0, void 0);
		for (var i = children.length - 1; 0 <= i && !setFocusOnFiberIfFocusable(children[i], focusOptions); i--);
	};
	function collectChildren(child, collection) {
		collection.push(child);
		return !1;
	}
	FragmentInstance.prototype.blur = function() {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		null !== parentHostFiber && (parentHostFiber = getInstanceFromHostFiber(parentHostFiber), parentHostFiber = getOwnerDocumentFromRootContainer(parentHostFiber).activeElement, null !== parentHostFiber && traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, blurActiveElementWithinFragment, parentHostFiber, void 0, void 0));
	};
	function blurActiveElementWithinFragment(child, activeElement) {
		if (6 === child.tag) return !1;
		child = getInstanceFromHostFiber(child);
		return child === activeElement || child.contains(activeElement) ? (activeElement.blur(), !0) : !1;
	}
	FragmentInstance.prototype.observeUsing = function(observer) {
		null === this._observers && (this._observers = /* @__PURE__ */ new Set());
		this._observers.add(observer);
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, observeChild, observer, void 0, void 0);
	};
	function observeChild(child, observer) {
		if (6 === child.tag) return !1;
		child = getInstanceFromHostFiber(child);
		observer.observe(child);
		return !1;
	}
	FragmentInstance.prototype.unobserveUsing = function(observer) {
		var observers = this._observers;
		if (null !== observers && observers.has(observer)) {
			observers.delete(observer);
			traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, unobserveChild, observer, void 0, void 0);
			for (var i = observers = 0; i < pendingIntersectionUnobserves.length; i++) {
				var pending = pendingIntersectionUnobserves[i];
				pending.fragmentInstance === this && pending.observer === observer ? observer.unobserve(pending.instance) : pendingIntersectionUnobserves[observers++] = pending;
			}
			pendingIntersectionUnobserves.length = observers;
		}
	};
	function unobserveChild(child, observer) {
		if (6 === child.tag) return !1;
		child = getInstanceFromHostFiber(child);
		observer.unobserve(child);
		return !1;
	}
	var pendingIntersectionUnobserves = [];
	var intersectionUnobserveScheduled = !1;
	function schedulePendingIntersectionUnobserve(fragmentInstance, observer, instance) {
		pendingIntersectionUnobserves.push({
			fragmentInstance,
			observer,
			instance
		});
		intersectionUnobserveScheduled || (intersectionUnobserveScheduled = !0, requestPostPaintCallback(function() {
			intersectionUnobserveScheduled = !1;
			var pending = pendingIntersectionUnobserves;
			pendingIntersectionUnobserves = [];
			for (var i = 0; i < pending.length; i++) {
				var item = pending[i];
				item.observer.unobserve(item.instance);
			}
		}));
	}
	FragmentInstance.prototype.getClientRects = function() {
		var rects = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, collectClientRects, rects, void 0, void 0);
		return rects;
	};
	function collectClientRects(child, rects) {
		if (6 === child.tag) {
			child = child.stateNode;
			var range = child.ownerDocument.createRange();
			range.selectNodeContents(child);
			rects.push.apply(rects, range.getClientRects());
		} else child = getInstanceFromHostFiber(child), rects.push.apply(rects, child.getClientRects());
		return !1;
	}
	FragmentInstance.prototype.getRootNode = function(getRootNodeOptions) {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		return null === parentHostFiber ? this : getInstanceFromHostFiber(parentHostFiber).getRootNode(getRootNodeOptions);
	};
	FragmentInstance.prototype.compareDocumentPosition = function(otherNode) {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		if (null === parentHostFiber) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var children = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, collectChildren, children, void 0, void 0);
		var parentHostInstance = getInstanceFromHostFiber(parentHostFiber);
		if (0 === children.length) {
			children = parentHostInstance;
			if (fiberIsPortaledIntoHost(this._fragmentFiber)) {
				a: {
					for (parentHostFiber = this._fragmentFiber.return; null !== parentHostFiber;) {
						if (4 === parentHostFiber.tag) {
							parentHostFiber = parentHostFiber.stateNode.containerInfo;
							break a;
						}
						if (3 === parentHostFiber.tag || 5 === parentHostFiber.tag || 27 === parentHostFiber.tag) break;
						parentHostFiber = parentHostFiber.return;
					}
					parentHostFiber = null;
				}
				null != parentHostFiber && (children = parentHostFiber);
			}
			parentHostFiber = this._fragmentFiber;
			var result = parentHostInstance = children.compareDocumentPosition(otherNode);
			children === otherNode ? result = Node.DOCUMENT_POSITION_CONTAINS : parentHostInstance & Node.DOCUMENT_POSITION_CONTAINED_BY && (children = getFragmentInstanceOrTextInstanceSiblings(parentHostFiber)[1], null === children ? result = Node.DOCUMENT_POSITION_PRECEDING : (otherNode = getInstanceFromHostFiber(children).compareDocumentPosition(otherNode), result = 0 === otherNode || otherNode & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING));
			return result |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		parentHostFiber = getInstanceFromHostFiber(children[0]);
		result = getInstanceFromHostFiber(children[children.length - 1]);
		var parentHostInstanceFromDOM = fiberIsPortaledIntoHost(this._fragmentFiber) ? parentHostFiber.parentElement : parentHostInstance;
		if (null == parentHostInstanceFromDOM) return Node.DOCUMENT_POSITION_DISCONNECTED;
		parentHostInstance = parentHostInstanceFromDOM.compareDocumentPosition(parentHostFiber) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		parentHostInstanceFromDOM = parentHostInstanceFromDOM.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var firstResult = parentHostFiber.compareDocumentPosition(otherNode), lastResult = result.compareDocumentPosition(otherNode), otherNodeIsWithinFirstOrLastChild = firstResult & Node.DOCUMENT_POSITION_CONTAINED_BY || lastResult & Node.DOCUMENT_POSITION_CONTAINED_BY;
		lastResult = parentHostInstance && parentHostInstanceFromDOM && firstResult & Node.DOCUMENT_POSITION_FOLLOWING && lastResult & Node.DOCUMENT_POSITION_PRECEDING;
		parentHostFiber = parentHostInstance && parentHostFiber === otherNode || parentHostInstanceFromDOM && result === otherNode || otherNodeIsWithinFirstOrLastChild || lastResult ? Node.DOCUMENT_POSITION_CONTAINED_BY : !parentHostInstance && parentHostFiber === otherNode || !parentHostInstanceFromDOM && result === otherNode ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : firstResult;
		return parentHostFiber & Node.DOCUMENT_POSITION_DISCONNECTED || parentHostFiber & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || validateDocumentPositionWithFiberTree(parentHostFiber, this._fragmentFiber, children[0], children[children.length - 1], otherNode) ? parentHostFiber : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function validateDocumentPositionWithFiberTree(documentPosition, fragmentFiber, precedingBoundaryFiber, followingBoundaryFiber, otherNode) {
		var otherFiber = getClosestInstanceFromNode(otherNode);
		if (documentPosition & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (precedingBoundaryFiber = !!otherFiber) a: {
				for (; null !== otherFiber;) {
					if (7 === otherFiber.tag && (otherFiber === fragmentFiber || otherFiber.alternate === fragmentFiber)) {
						precedingBoundaryFiber = !0;
						break a;
					}
					otherFiber = otherFiber.return;
				}
				precedingBoundaryFiber = !1;
			}
			return precedingBoundaryFiber;
		}
		if (documentPosition & Node.DOCUMENT_POSITION_CONTAINS) {
			if (null === otherFiber) return otherFiber = otherNode.ownerDocument, otherNode === otherFiber || otherNode === otherFiber.documentElement || otherNode === otherFiber.body;
			a: {
				otherFiber = fragmentFiber;
				for (fragmentFiber = getFragmentParentInstanceOrContainerFiber(fragmentFiber); null !== otherFiber;) {
					if (!(5 !== otherFiber.tag && 3 !== otherFiber.tag && 27 !== otherFiber.tag || otherFiber !== fragmentFiber && otherFiber.alternate !== fragmentFiber)) {
						otherFiber = !0;
						break a;
					}
					otherFiber = otherFiber.return;
				}
				otherFiber = !1;
			}
			return otherFiber;
		}
		return documentPosition & Node.DOCUMENT_POSITION_PRECEDING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === precedingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(precedingBoundaryFiber, otherFiber, getParentForFragmentAncestors), null === fragmentFiber ? fragmentFiber = !1 : (traverseVisibleInstancesAndTextInstances(fragmentFiber, !0, isFiberPrecedingCheck, otherFiber, precedingBoundaryFiber), otherFiber = searchTarget, searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === followingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(followingBoundaryFiber, otherFiber, getParentForFragmentAncestors), null === fragmentFiber ? fragmentFiber = !1 : (traverseVisibleInstancesAndTextInstances(fragmentFiber, !0, isFiberFollowingCheck, otherFiber, followingBoundaryFiber), otherFiber = searchTarget, searchBoundary = searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : !1;
	}
	function scrollTextNodeIntoView(textNode, resolvedAlignToTop) {
		var range = textNode.ownerDocument.createRange();
		range.selectNodeContents(textNode);
		textNode = range.getBoundingClientRect();
		window.scrollTo(window.scrollX + textNode.left, resolvedAlignToTop ? window.scrollY + textNode.top : window.scrollY + textNode.bottom - window.innerHeight);
	}
	FragmentInstance.prototype.scrollIntoView = function(alignToTop) {
		if ("object" === typeof alignToTop) throw Error(formatProdErrorMessage(566));
		var children = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, collectChildren, children, void 0, void 0);
		var resolvedAlignToTop = !1 !== alignToTop;
		if (0 === children.length) {
			var hostSiblings = getFragmentInstanceOrTextInstanceSiblings(this._fragmentFiber);
			hostSiblings = resolvedAlignToTop ? hostSiblings[1] || hostSiblings[0] || getFragmentParentInstanceOrContainerFiber(this._fragmentFiber) : hostSiblings[0] || hostSiblings[1];
			if (null === hostSiblings) return;
			if (6 === hostSiblings.tag) {
				alignToTop = getInstanceFromHostFiber(hostSiblings);
				scrollTextNodeIntoView(alignToTop, resolvedAlignToTop);
				return;
			}
			hostSiblings = getInstanceFromHostFiber(hostSiblings);
			if (9 !== hostSiblings.nodeType) {
				if (11 === hostSiblings.nodeType) {
					resolvedAlignToTop = "host" in hostSiblings ? hostSiblings.host : null;
					null !== resolvedAlignToTop && resolvedAlignToTop.scrollIntoView(alignToTop);
					return;
				}
				hostSiblings.scrollIntoView(alignToTop);
			}
		}
		for (hostSiblings = resolvedAlignToTop ? children.length - 1 : 0; hostSiblings !== (resolvedAlignToTop ? -1 : children.length);) {
			var child = children[hostSiblings];
			6 === child.tag ? (child = getInstanceFromHostFiber(child), scrollTextNodeIntoView(child, resolvedAlignToTop)) : getInstanceFromHostFiber(child).scrollIntoView(alignToTop);
			hostSiblings += resolvedAlignToTop ? -1 : 1;
		}
	};
	function addFragmentHandleToFiber(child, fragmentInstance) {
		child = getInstanceFromHostFiber(child);
		addFragmentHandleToInstance(child, fragmentInstance);
		return !1;
	}
	function addFragmentHandleToInstance(instance, fragmentInstance) {
		instance.reactFragments ??= /* @__PURE__ */ new Set();
		instance.reactFragments.add(fragmentInstance);
	}
	function commitNewChildToFragmentInstance(childInstance, fragmentInstance) {
		var eventListeners = fragmentInstance._eventListeners;
		if (null !== eventListeners) for (var i$jscomp$0 = 0; i$jscomp$0 < eventListeners.length; i$jscomp$0++) {
			var _eventListeners$i3 = eventListeners[i$jscomp$0];
			childInstance.addEventListener(_eventListeners$i3.type, _eventListeners$i3.attachedListener, getAttachOptions(_eventListeners$i3.optionsOrUseCapture));
		}
		3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
			for (var writeIdx = 0, i = 0; i < pendingIntersectionUnobserves.length; i++) {
				var pending = pendingIntersectionUnobserves[i];
				if (pending.fragmentInstance !== fragmentInstance || pending.observer !== observer || pending.instance !== childInstance) pendingIntersectionUnobserves[writeIdx++] = pending;
			}
			pendingIntersectionUnobserves.length = writeIdx;
			observer.observe(childInstance);
		}), addFragmentHandleToInstance(childInstance, fragmentInstance));
	}
	function deleteChildFromFragmentInstance(childInstance, fragmentInstance) {
		var eventListeners = fragmentInstance._eventListeners;
		if (null !== eventListeners) for (var i = 0; i < eventListeners.length; i++) {
			var _eventListeners$i4 = eventListeners[i];
			childInstance.removeEventListener(_eventListeners$i4.type, _eventListeners$i4.attachedListener, getAttachOptions(_eventListeners$i4.optionsOrUseCapture));
		}
		3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
			"string" === typeof observer.rootMargin ? schedulePendingIntersectionUnobserve(fragmentInstance, observer, childInstance) : observer.unobserve(childInstance);
		}), null != childInstance.reactFragments && childInstance.reactFragments.delete(fragmentInstance));
	}
	function clearContainerSparingly(container) {
		var nextNode = container.firstChild;
		nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
		for (; nextNode;) {
			var node = nextNode;
			nextNode = nextNode.nextSibling;
			switch (node.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					clearContainerSparingly(node);
					detachDeletedInstance(node);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if ("stylesheet" === node.rel.toLowerCase()) continue;
			}
			container.removeChild(node);
		}
	}
	function canHydrateInstance(instance, type, props, inRootOrSingleton) {
		for (; 1 === instance.nodeType;) {
			var anyProps = props;
			if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
				if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type)) break;
			} else if (!inRootOrSingleton) if ("input" === type && "hidden" === instance.type) {
				var name = null == anyProps.name ? null : "" + anyProps.name;
				if ("hidden" === anyProps.type && instance.getAttribute("name") === name) return instance;
			} else return instance;
			else if (!instance[internalHoistableMarker]) switch (type) {
				case "meta":
					if (!instance.hasAttribute("itemprop")) break;
					return instance;
				case "link":
					name = instance.getAttribute("rel");
					if ("stylesheet" === name && instance.hasAttribute("data-precedence")) break;
					else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title)) break;
					return instance;
				case "style":
					if (instance.hasAttribute("data-precedence")) break;
					return instance;
				case "script":
					name = instance.getAttribute("src");
					if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop")) break;
					return instance;
				default: return instance;
			}
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) break;
		}
		return null;
	}
	function canHydrateTextInstance(instance, text, inRootOrSingleton) {
		if ("" === text) return null;
		for (; 3 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
		for (; 8 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function isSuspenseInstancePending(instance) {
		return "$?" === instance.data || "$~" === instance.data;
	}
	function isSuspenseInstanceFallback(instance) {
		return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
	}
	function registerSuspenseInstanceRetry(instance, callback) {
		var ownerDocument = instance.ownerDocument;
		if ("$~" === instance.data) instance._reactRetry = callback;
		else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState) callback();
		else {
			var listener = function() {
				callback();
				ownerDocument.removeEventListener("DOMContentLoaded", listener);
			};
			ownerDocument.addEventListener("DOMContentLoaded", listener);
			instance._reactRetry = listener;
		}
	}
	function getNextHydratable(node) {
		for (; null != node; node = node.nextSibling) {
			var nodeType = node.nodeType;
			if (1 === nodeType || 3 === nodeType) break;
			if (8 === nodeType) {
				nodeType = node.data;
				if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType) break;
				if ("/$" === nodeType || "/&" === nodeType) return null;
			}
		}
		return node;
	}
	var previousHydratableOnEnteringScopedSingleton = null;
	function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
		hydrationInstance = hydrationInstance.nextSibling;
		for (var depth = 0; hydrationInstance;) {
			if (8 === hydrationInstance.nodeType) {
				var data = hydrationInstance.data;
				if ("/$" === data || "/&" === data) {
					if (0 === depth) return getNextHydratable(hydrationInstance.nextSibling);
					depth--;
				} else "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
			}
			hydrationInstance = hydrationInstance.nextSibling;
		}
		return null;
	}
	function getParentHydrationBoundary(targetInstance) {
		targetInstance = targetInstance.previousSibling;
		for (var depth = 0; targetInstance;) {
			if (8 === targetInstance.nodeType) {
				var data = targetInstance.data;
				if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
					if (0 === depth) return targetInstance;
					depth--;
				} else "/$" !== data && "/&" !== data || depth++;
			}
			targetInstance = targetInstance.previousSibling;
		}
		return null;
	}
	function setFocusIfFocusable(node, focusOptions) {
		function handleFocus() {
			didFocus = !0;
		}
		if (node.ownerDocument.activeElement === node) return !0;
		var didFocus = !1;
		try {
			node.ownerDocument.addEventListener("focus", handleFocus, !0), (node.focus || HTMLElement.prototype.focus).call(node, focusOptions);
		} finally {
			node.ownerDocument.removeEventListener("focus", handleFocus, !0);
		}
		return didFocus;
	}
	function requestPostPaintCallback(callback) {
		localRequestAnimationFrame(function() {
			localRequestAnimationFrame(function(time) {
				return callback(time);
			});
		});
	}
	function resolveSingletonInstance(type, props, rootContainerInstance) {
		props = getOwnerDocumentFromRootContainer(rootContainerInstance);
		switch (type) {
			case "html":
				type = props.documentElement;
				if (!type) throw Error(formatProdErrorMessage(452));
				return type;
			case "head":
				type = props.head;
				if (!type) throw Error(formatProdErrorMessage(453));
				return type;
			case "body":
				type = props.body;
				if (!type) throw Error(formatProdErrorMessage(454));
				return type;
			default: throw Error(formatProdErrorMessage(451));
		}
	}
	function releaseSingletonInstance(instance, type, props) {
		for (var propKey in props) {
			var propValue = props[propKey];
			props.hasOwnProperty(propKey) && null != propValue && setProp(instance, type, propKey, null, emptyProps, propValue);
		}
		null != props.dangerouslySetInnerHTML && (instance.textContent = "");
		instance.onclick === noop$1 && (instance.onclick = null);
		detachDeletedInstance(instance);
	}
	function clearSingletonPreambleContribution(instance) {
		for (var attributes = instance.attributes; attributes.length;) instance.removeAttributeNode(attributes[0]);
		detachDeletedInstance(instance);
	}
	var preloadPropsMap = /* @__PURE__ */ new Map();
	var preconnectsSet = /* @__PURE__ */ new Set();
	function getHoistableRoot(container) {
		if ("function" === typeof container.getRootNode) {
			var rootNode = container.getRootNode();
			if (9 === rootNode.nodeType || 11 === rootNode.nodeType) return rootNode;
		}
		return 9 === container.nodeType ? container : container.ownerDocument;
	}
	var previousDispatcher = ReactDOMSharedInternals.d;
	ReactDOMSharedInternals.d = {
		f: flushSyncWork,
		r: requestFormReset,
		D: prefetchDNS,
		C: preconnect,
		L: preload,
		m: preloadModule,
		X: preinitScript,
		S: preinitStyle,
		M: preinitModuleScript
	};
	function flushSyncWork() {
		var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
		return previousWasRendering || wasRendering;
	}
	function requestFormReset(form) {
		var formInst = getInstanceFromNode(form);
		null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
	}
	var globalDocument = "undefined" === typeof document ? null : document;
	function preconnectAs(rel, href, crossOrigin) {
		var ownerDocument = globalDocument;
		if (ownerDocument && "string" === typeof href && href) {
			var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
			limitedEscapedHref = "link[rel=\"" + rel + "\"][href=\"" + limitedEscapedHref + "\"]";
			"string" === typeof crossOrigin && (limitedEscapedHref += "[crossorigin=\"" + crossOrigin + "\"]");
			preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = {
				rel,
				crossOrigin,
				href
			}, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
		}
	}
	function prefetchDNS(href) {
		previousDispatcher.D(href);
		preconnectAs("dns-prefetch", href, null);
	}
	function preconnect(href, crossOrigin) {
		previousDispatcher.C(href, crossOrigin);
		preconnectAs("preconnect", href, crossOrigin);
	}
	function preload(href, as, options) {
		previousDispatcher.L(href, as, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href && as) {
			var preloadSelector = "link[rel=\"preload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"]";
			"image" === as ? options && options.imageSrcSet ? (preloadSelector += "[imagesrcset=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSrcSet) + "\"]", "string" === typeof options.imageSizes && (preloadSelector += "[imagesizes=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSizes) + "\"]")) : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]" : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]";
			var key = preloadSelector;
			switch (as) {
				case "style":
					key = getStyleKey(href);
					break;
				case "script": key = getScriptKey(href);
			}
			if (!(preloadPropsMap.has(key) || (href = assign({
				rel: "preload",
				href: "image" === as && options && options.imageSrcSet ? void 0 : href,
				as
			}, options), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key))))) {
				var instance = ownerDocument.createElement("link");
				setInitialProperties(instance, "link", href);
				"style" === as && (instance[internalLoadPendingKey] = !0, instance.onload = instance.onerror = function() {
					clearPendingLoadOnNode(instance);
				});
				markNodeAsHoistable(instance);
				ownerDocument.head.appendChild(instance);
			}
		}
	}
	function preloadModule(href, options) {
		previousDispatcher.m(href, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var as = options && "string" === typeof options.as ? options.as : "script", preloadSelector = "link[rel=\"modulepreload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"][href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]", key = preloadSelector;
			switch (as) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": key = getScriptKey(href);
			}
			if (!preloadPropsMap.has(key) && (href = assign({
				rel: "modulepreload",
				href
			}, options), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
				switch (as) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (ownerDocument.querySelector(getScriptSelectorFromKey(key))) return;
				}
				as = ownerDocument.createElement("link");
				setInitialProperties(as, "link", href);
				markNodeAsHoistable(as);
				ownerDocument.head.appendChild(as);
			}
		}
	}
	function preinitStyle(href, precedence, options) {
		previousDispatcher.S(href, precedence, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
			precedence = precedence || "default";
			var resource = styles.get(key);
			if (!resource) {
				var state = {
					loading: 0,
					preload: null
				};
				if (resource = ownerDocument.querySelector(getStylesheetSelectorFromKey(key))) state.loading = 5;
				else {
					href = assign({
						rel: "stylesheet",
						href,
						"data-precedence": precedence
					}, options);
					(options = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options);
					var link = resource = ownerDocument.createElement("link");
					markNodeAsHoistable(link);
					setInitialProperties(link, "link", href);
					link._p = new Promise(function(resolve, reject) {
						link.onload = resolve;
						link.onerror = reject;
					});
					link.addEventListener("load", function() {
						state.loading |= 1;
					});
					link.addEventListener("error", function() {
						state.loading |= 2;
					});
					state.loading |= 4;
					insertStylesheet(resource, precedence, ownerDocument);
				}
				resource = {
					type: "stylesheet",
					instance: resource,
					count: 1,
					state
				};
				styles.set(key, resource);
			}
		}
	}
	function preinitScript(src, options) {
		previousDispatcher.X(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function preinitModuleScript(src, options) {
		previousDispatcher.M(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0,
				type: "module"
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function getResource(type, currentProps, pendingProps, currentResource) {
		var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
		if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
		switch (type) {
			case "meta":
			case "title": return null;
			case "style": return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (pendingProps = getStyleKey(pendingProps.href), currentProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, currentProps.set(pendingProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
					type = getStyleKey(pendingProps.href);
					var styles$268 = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, resource$269 = styles$268.get(type);
					resource$269 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$269 = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, styles$268.set(type, resource$269), (styles$268 = JSCompiler_inline_result.querySelector(getStylesheetSelectorFromKey(type))) ? styles$268._p || (resource$269.instance = styles$268, resource$269.state.loading = 5) : (styles$268 = preloadPropsMap.get(type), styles$268 || (styles$268 = {
						rel: "preload",
						as: "style",
						href: pendingProps.href,
						crossOrigin: pendingProps.crossOrigin,
						integrity: pendingProps.integrity,
						media: pendingProps.media,
						hrefLang: pendingProps.hrefLang,
						referrerPolicy: pendingProps.referrerPolicy
					}, preloadPropsMap.set(type, styles$268)), preloadStylesheet(JSCompiler_inline_result, type, styles$268, resource$269.state)));
					if (currentProps && null === currentResource) throw Error(formatProdErrorMessage(528, ""));
					return resource$269;
				}
				if (currentProps && null !== currentResource) throw Error(formatProdErrorMessage(529, ""));
				return null;
			case "script": return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (pendingProps = getScriptKey(pendingProps), currentProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableScripts, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, currentProps.set(pendingProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(formatProdErrorMessage(444, type));
		}
	}
	function getStyleKey(href) {
		return "href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"";
	}
	function getStylesheetSelectorFromKey(key) {
		return "link[rel=\"stylesheet\"][" + key + "]";
	}
	function stylesheetPropsFromRawProps(rawProps) {
		return assign({}, rawProps, {
			"data-precedence": rawProps.precedence,
			precedence: null
		});
	}
	function preloadStylesheet(ownerDocument, key, preloadProps, state) {
		if (key = ownerDocument.querySelector("link[rel=\"preload\"][as=\"style\"][" + key + "]")) {
			if (!0 !== key[internalLoadPendingKey]) {
				state.loading = 1;
				return;
			}
		} else key = ownerDocument.createElement("link"), key[internalLoadPendingKey] = !0, key.onload = key.onerror = clearPendingLoadOnNode.bind(null, key), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key);
		state.preload = key;
		key.addEventListener("load", function() {
			return state.loading |= 1;
		});
		key.addEventListener("error", function() {
			return state.loading |= 2;
		});
	}
	function getScriptKey(src) {
		return "[src=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(src) + "\"]";
	}
	function getScriptSelectorFromKey(key) {
		return "script[async]" + key;
	}
	function acquireResource(hoistableRoot, resource, props) {
		resource.count++;
		if (null === resource.instance) switch (resource.type) {
			case "style":
				var instance = hoistableRoot.querySelector("style[data-href~=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + "\"]");
				if (instance) return resource.instance = instance, markNodeAsHoistable(instance), instance;
				var styleProps = assign({}, props, {
					"data-href": props.href,
					"data-precedence": props.precedence,
					href: null,
					precedence: null
				});
				instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement("style");
				markNodeAsHoistable(instance);
				setInitialProperties(instance, "style", styleProps);
				insertStylesheet(instance, props.precedence, hoistableRoot);
				return resource.instance = instance;
			case "stylesheet":
				styleProps = getStyleKey(props.href);
				var instance$274 = hoistableRoot.querySelector(getStylesheetSelectorFromKey(styleProps));
				if (instance$274) return resource.state.loading |= 4, resource.instance = instance$274, markNodeAsHoistable(instance$274), instance$274;
				instance = stylesheetPropsFromRawProps(props);
				(styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
				instance$274 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
				markNodeAsHoistable(instance$274);
				var linkInstance = instance$274;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance$274, "link", instance);
				resource.state.loading |= 4;
				insertStylesheet(instance$274, props.precedence, hoistableRoot);
				return resource.instance = instance$274;
			case "script":
				instance$274 = getScriptKey(props.src);
				if (styleProps = hoistableRoot.querySelector(getScriptSelectorFromKey(instance$274))) return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
				instance = props;
				if (styleProps = preloadPropsMap.get(instance$274)) instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
				hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
				styleProps = hoistableRoot.createElement("script");
				markNodeAsHoistable(styleProps);
				setInitialProperties(styleProps, "link", instance);
				hoistableRoot.head.appendChild(styleProps);
				return resource.instance = styleProps;
			case "void": return null;
			default: throw Error(formatProdErrorMessage(443, resource.type));
		}
		else "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
		return resource.instance;
	}
	function insertStylesheet(instance, precedence, root) {
		for (var nodes = root.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.dataset.precedence === precedence) prior = node;
			else if (prior !== last) break;
		}
		prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root.nodeType ? root.head : root, precedence.insertBefore(instance, precedence.firstChild));
	}
	function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
		stylesheetProps.crossOrigin ??= preloadProps.crossOrigin;
		stylesheetProps.referrerPolicy ??= preloadProps.referrerPolicy;
		stylesheetProps.title ??= preloadProps.title;
	}
	function adoptPreloadPropsForScript(scriptProps, preloadProps) {
		scriptProps.crossOrigin ??= preloadProps.crossOrigin;
		scriptProps.referrerPolicy ??= preloadProps.referrerPolicy;
		scriptProps.integrity ??= preloadProps.integrity;
	}
	var tagCaches = null;
	function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
		if (null === tagCaches) {
			var cache = /* @__PURE__ */ new Map();
			var caches = tagCaches = /* @__PURE__ */ new Map();
			caches.set(ownerDocument, cache);
		} else caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
		if (cache.has(type)) return cache;
		cache.set(type, null);
		ownerDocument = ownerDocument.getElementsByTagName(type);
		for (caches = 0; caches < ownerDocument.length; caches++) {
			var node = ownerDocument[caches];
			if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
				var nodeKey = node.getAttribute(keyAttribute) || "";
				nodeKey = type + nodeKey;
				var existing = cache.get(nodeKey);
				existing ? existing.push(node) : cache.set(nodeKey, [node]);
			}
		}
		return cache;
	}
	function mountHoistable(hoistableRoot, type, instance) {
		hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
		hoistableRoot.head.insertBefore(instance, "title" === type ? hoistableRoot.querySelector("head > title") : null);
	}
	function isHostHoistableType(type, props, hostContext) {
		if (1 === hostContext || null != props.itemProp) return !1;
		switch (type) {
			case "meta":
			case "title": return !0;
			case "style":
				if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href) break;
				return !0;
			case "link":
				if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError) break;
				switch (props.rel) {
					case "stylesheet": return type = props.disabled, "string" === typeof props.precedence && null == type;
					default: return !0;
				}
			case "script": if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src) return !0;
		}
		return !1;
	}
	function maySuspendCommit(type, props) {
		return "img" === type && null != props.src && "" !== props.src && null == props.onLoad && "lazy" !== props.loading;
	}
	function preloadResource(resource) {
		return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? !1 : !0;
	}
	function estimateImageBytes(instance) {
		return (instance.width || 100) * (instance.height || 100) * ("number" === typeof devicePixelRatio ? devicePixelRatio : 1) * .25;
	}
	function suspendInstance(state, instance) {
		"function" === typeof instance.decode && (state.imgCount++, instance.complete || (state.imgBytes += estimateImageBytes(instance), state.suspenseyImages.push(instance)), state = onUnsuspendImg.bind(state), instance.decode().then(state, state));
	}
	function suspendResource(state, hoistableRoot, resource, props) {
		if ("stylesheet" === resource.type && ("string" !== typeof props.media || !1 !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
			if (null === resource.instance) {
				var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(getStylesheetSelectorFromKey(key));
				if (instance) {
					hoistableRoot = instance._p;
					null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
					resource.state.loading |= 4;
					resource.instance = instance;
					markNodeAsHoistable(instance);
					return;
				}
				instance = hoistableRoot.ownerDocument || hoistableRoot;
				props = stylesheetPropsFromRawProps(props);
				(key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
				instance = instance.createElement("link");
				markNodeAsHoistable(instance);
				var linkInstance = instance;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance, "link", props);
				resource.instance = instance;
			}
			null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
			state.stylesheets.set(resource, hoistableRoot);
			(hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
		}
	}
	var estimatedBytesWithinLimit = 0;
	function waitForCommitToBeReady(state, timeoutOffset) {
		state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
		return 0 < state.count || 0 < state.imgCount ? function(commit) {
			var stylesheetTimer = setTimeout(function() {
				state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
				if (state.unsuspend) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, 6e4 + timeoutOffset);
			0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
			var imgTimer = setTimeout(function() {
				state.waitingForImages = !1;
				if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset);
			state.unsuspend = commit;
			return function() {
				state.unsuspend = null;
				clearTimeout(stylesheetTimer);
				clearTimeout(imgTimer);
			};
		} : null;
	}
	function checkIfFullyUnsuspended(state) {
		if (0 === state.count && (0 === state.imgCount || !state.waitingForImages)) {
			if (state.stylesheets) insertSuspendedStylesheets(state, state.stylesheets);
			else if (state.unsuspend) {
				var unsuspend = state.unsuspend;
				state.unsuspend = null;
				unsuspend();
			}
		}
	}
	function onUnsuspend() {
		this.count--;
		checkIfFullyUnsuspended(this);
	}
	function onUnsuspendImg() {
		this.imgCount--;
		checkIfFullyUnsuspended(this);
	}
	var precedencesByRoot = null;
	function insertSuspendedStylesheets(state, resources) {
		state.stylesheets = null;
		null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
	}
	function insertStylesheetIntoRoot(root, resource) {
		if (!(resource.state.loading & 4)) {
			var precedences = precedencesByRoot.get(root);
			if (precedences) var last = precedences.get(null);
			else {
				precedences = /* @__PURE__ */ new Map();
				precedencesByRoot.set(root, precedences);
				for (var nodes = root.querySelectorAll("link[data-precedence],style[data-precedence]"), i = 0; i < nodes.length; i++) {
					var node = nodes[i];
					if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media")) precedences.set(node.dataset.precedence, node), last = node;
				}
				last && precedences.set(null, last);
			}
			nodes = resource.instance;
			node = nodes.getAttribute("data-precedence");
			i = precedences.get(node) || last;
			i === last && precedences.set(null, nodes);
			precedences.set(node, nodes);
			this.count++;
			last = onUnsuspend.bind(this);
			nodes.addEventListener("load", last);
			nodes.addEventListener("error", last);
			i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root = 9 === root.nodeType ? root.head : root, root.insertBefore(nodes, root.firstChild));
			resource.state.loading |= 4;
		}
	}
	var HostTransitionContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Provider: null,
		Consumer: null,
		_currentValue: sharedNotPendingObject,
		_currentValue2: sharedNotPendingObject,
		_threadCount: 0
	};
	function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
		this.tag = 1;
		this.containerInfo = containerInfo;
		this.pingCache = this.current = this.pendingChildren = null;
		this.timeoutHandle = -1;
		this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
		this.callbackPriority = 0;
		this.expirationTimes = createLaneMap(-1);
		this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
		this.entanglements = createLaneMap(0);
		this.hiddenUpdates = createLaneMap(null);
		this.identifierPrefix = identifierPrefix;
		this.onUncaughtError = onUncaughtError;
		this.onCaughtError = onCaughtError;
		this.onRecoverableError = onRecoverableError;
		this.pooledCache = null;
		this.pooledCacheLanes = 0;
		this.formState = formState;
		this.transitionTypes = null;
		this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
		containerInfo = new FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState);
		tag = 1;
		!0 === isStrictMode && (tag |= 24);
		isStrictMode = createFiberImplClass(3, null, null, tag);
		containerInfo.current = isStrictMode;
		isStrictMode.stateNode = containerInfo;
		tag = createCache();
		tag.refCount++;
		containerInfo.pooledCache = tag;
		tag.refCount++;
		isStrictMode.memoizedState = {
			element: initialChildren,
			isDehydrated: hydrate,
			cache: tag
		};
		initializeUpdateQueue(isStrictMode);
		return containerInfo;
	}
	function getContextForSubtree(parentComponent) {
		if (!parentComponent) return emptyContextObject;
		parentComponent = emptyContextObject;
		return parentComponent;
	}
	function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
		parentComponent = getContextForSubtree(parentComponent);
		null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
		container = createUpdate(lane);
		container.payload = { element };
		callback = void 0 === callback ? null : callback;
		null !== callback && (container.callback = callback);
		element = enqueueUpdate(rootFiber, container, lane);
		null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
	}
	function markRetryLaneImpl(fiber, retryLane) {
		fiber = fiber.memoizedState;
		if (null !== fiber && null !== fiber.dehydrated) {
			var a = fiber.retryLane;
			fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
		}
	}
	function markRetryLaneIfNotHydrated(fiber, retryLane) {
		markRetryLaneImpl(fiber, retryLane);
		(fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
	}
	function attemptContinuousHydration(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var root = enqueueConcurrentRenderForLane(fiber, 67108864);
			null !== root && scheduleUpdateOnFiber(root, fiber, 67108864);
			markRetryLaneIfNotHydrated(fiber, 67108864);
		}
	}
	function attemptHydrationAtCurrentPriority(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var lane = requestUpdateLane();
			lane = getBumpedLaneForHydrationByLane(lane);
			var root = enqueueConcurrentRenderForLane(fiber, lane);
			null !== root && scheduleUpdateOnFiber(root, fiber, lane);
			markRetryLaneIfNotHydrated(fiber, lane);
		}
	}
	var _enabled = !0;
	function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (_enabled) {
			var blockedOn = findInstanceBlockingEvent(nativeEvent);
			if (null === blockedOn) dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer), clearIfContinuousEvent(domEventName, nativeEvent);
			else if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)) nativeEvent.stopPropagation();
			else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
				for (; null !== blockedOn;) {
					var fiber = getInstanceFromNode(blockedOn);
					if (null !== fiber) switch (fiber.tag) {
						case 3:
							fiber = fiber.stateNode;
							if (fiber.current.memoizedState.isDehydrated) {
								var lanes = getHighestPriorityLanes(fiber.pendingLanes);
								if (0 !== lanes) {
									var root = fiber;
									root.pendingLanes |= 2;
									for (root.entangledLanes |= 2; lanes;) {
										var lane = 1 << 31 - clz32(lanes);
										root.entanglements[1] |= lane;
										lanes &= ~lane;
									}
									ensureRootIsScheduled(fiber);
									0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, !1));
								}
							}
							break;
						case 31:
						case 13: root = enqueueConcurrentRenderForLane(fiber, 2), null !== root && scheduleUpdateOnFiber(root, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
					}
					fiber = findInstanceBlockingEvent(nativeEvent);
					null === fiber && dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
					if (fiber === blockedOn) break;
					blockedOn = fiber;
				}
				null !== blockedOn && nativeEvent.stopPropagation();
			} else dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
		}
	}
	function findInstanceBlockingEvent(nativeEvent) {
		nativeEvent = getEventTarget(nativeEvent);
		return findInstanceBlockingTarget(nativeEvent);
	}
	var return_targetInst = null;
	function findInstanceBlockingTarget(targetNode) {
		return_targetInst = null;
		targetNode = getClosestInstanceFromNode(targetNode);
		if (null !== targetNode) {
			var nearestMounted = getNearestMountedFiber(targetNode);
			if (null === nearestMounted) targetNode = null;
			else {
				var tag = nearestMounted.tag;
				if (13 === tag) {
					targetNode = getSuspenseInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (31 === tag) {
					targetNode = getActivityInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (3 === tag) {
					if (nearestMounted.stateNode.current.memoizedState.isDehydrated) return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					targetNode = null;
				} else nearestMounted !== targetNode && (targetNode = null);
			}
		}
		return_targetInst = targetNode;
		return null;
	}
	function getEventPriority(domEventName) {
		switch (domEventName) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (getCurrentPriorityLevel()) {
				case ImmediatePriority: return 2;
				case UserBlockingPriority: return 8;
				case NormalPriority$1:
				case LowPriority: return 32;
				case IdlePriority: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var hasScheduledReplayAttempt = !1;
	var queuedFocus = null;
	var queuedDrag = null;
	var queuedMouse = null;
	var queuedPointers = /* @__PURE__ */ new Map();
	var queuedPointerCaptures = /* @__PURE__ */ new Map();
	var queuedExplicitHydrationTargets = [];
	var discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function clearIfContinuousEvent(domEventName, nativeEvent) {
		switch (domEventName) {
			case "focusin":
			case "focusout":
				queuedFocus = null;
				break;
			case "dragenter":
			case "dragleave":
				queuedDrag = null;
				break;
			case "mouseover":
			case "mouseout":
				queuedMouse = null;
				break;
			case "pointerover":
			case "pointerout":
				queuedPointers.delete(nativeEvent.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": queuedPointerCaptures.delete(nativeEvent.pointerId);
		}
	}
	function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent) return existingQueuedEvent = {
			blockedOn,
			domEventName,
			eventSystemFlags,
			nativeEvent,
			targetContainers: [targetContainer]
		}, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
		existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
		blockedOn = existingQueuedEvent.targetContainers;
		null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
		return existingQueuedEvent;
	}
	function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		switch (domEventName) {
			case "focusin": return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "dragenter": return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "mouseover": return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "pointerover":
				var pointerId = nativeEvent.pointerId;
				queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent));
				return !0;
			case "gotpointercapture": return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)), !0;
		}
		return !1;
	}
	function attemptExplicitHydrationTarget(queuedTarget) {
		var targetInst = getClosestInstanceFromNode(queuedTarget.target);
		if (null !== targetInst) {
			var nearestMounted = getNearestMountedFiber(targetInst);
			if (null !== nearestMounted) {
				if (targetInst = nearestMounted.tag, 13 === targetInst) {
					if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (31 === targetInst) {
					if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
					queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					return;
				}
			}
		}
		queuedTarget.blockedOn = null;
	}
	function attemptReplayContinuousQueuedEvent(queuedEvent) {
		if (null !== queuedEvent.blockedOn) return !1;
		for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length;) {
			var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
			if (null === nextBlockedOn) {
				nextBlockedOn = queuedEvent.nativeEvent;
				var nativeEventClone = new nextBlockedOn.constructor(nextBlockedOn.type, nextBlockedOn);
				currentReplayingEvent = nativeEventClone;
				nextBlockedOn.target.dispatchEvent(nativeEventClone);
				currentReplayingEvent = null;
			} else return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, !1;
			targetContainers.shift();
		}
		return !0;
	}
	function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
		attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
	}
	function replayUnblockedEvents() {
		hasScheduledReplayAttempt = !1;
		null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
		null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
		null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
		queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
		queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
	}
	function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
		queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = !0, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, replayUnblockedEvents)));
	}
	var lastScheduledReplayQueue = null;
	function scheduleReplayQueueIfNeeded(formReplayingQueue) {
		lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, function() {
			lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
			for (var i = 0; i < formReplayingQueue.length; i += 3) {
				var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
				if ("function" !== typeof submitterOrAction) if (null === findInstanceBlockingTarget(submitterOrAction || form)) continue;
				else break;
				var formInst = getInstanceFromNode(form);
				null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(formInst, {
					pending: !0,
					data: formData,
					method: form.method,
					action: submitterOrAction
				}, submitterOrAction, formData));
			}
		}));
	}
	function retryIfBlockedOn(unblocked) {
		function unblock(queuedEvent) {
			return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
		}
		null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
		null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
		null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
		queuedPointers.forEach(unblock);
		queuedPointerCaptures.forEach(unblock);
		for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
			var queuedTarget = queuedExplicitHydrationTargets[i];
			queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
		}
		for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn);) attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
		i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
		if (null != i) for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
			var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
			if ("function" === typeof submitterOrAction) formProps || scheduleReplayQueueIfNeeded(i);
			else if (formProps) {
				var action = null;
				if (submitterOrAction && submitterOrAction.hasAttribute("formAction")) {
					if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null) action = formProps.formAction;
					else if (null !== findInstanceBlockingTarget(form)) continue;
				} else action = formProps.action;
				"function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
				scheduleReplayQueueIfNeeded(i);
			}
		}
	}
	function defaultOnDefaultTransitionIndicator() {
		function handleNavigate(event) {
			event.canIntercept && "react-transition" === event.info && event.intercept({
				handler: function() {
					return new Promise(function(resolve) {
						return pendingResolve = resolve;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function handleNavigateComplete() {
			null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			isCancelled || setTimeout(startFakeNavigation, 20);
		}
		function startFakeNavigation() {
			if (!isCancelled && !navigation.transition) {
				var currentEntry = navigation.currentEntry;
				currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
					state: currentEntry.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if ("object" === typeof navigation) {
			var isCancelled = !1, pendingResolve = null;
			navigation.addEventListener("navigate", handleNavigate);
			navigation.addEventListener("navigatesuccess", handleNavigateComplete);
			navigation.addEventListener("navigateerror", handleNavigateComplete);
			setTimeout(startFakeNavigation, 100);
			return function() {
				isCancelled = !0;
				navigation.removeEventListener("navigate", handleNavigate);
				navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
				navigation.removeEventListener("navigateerror", handleNavigateComplete);
				null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			};
		}
	}
	function ReactDOMRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
		var root = this._internalRoot;
		if (null === root) throw Error(formatProdErrorMessage(409));
		var current = root.current;
		updateContainerImpl(current, requestUpdateLane(), children, root, null, null);
	};
	ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
		var root = this._internalRoot;
		if (null !== root) {
			this._internalRoot = null;
			var container = root.containerInfo;
			updateContainerImpl(root.current, 2, null, root, null, null);
			flushSyncWork$1();
			container[internalContainerInstanceKey] = null;
		}
	};
	function ReactDOMHydrationRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
		if (target) {
			var updatePriority = resolveUpdatePriority();
			target = {
				blockedOn: null,
				target,
				priority: updatePriority
			};
			for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++);
			queuedExplicitHydrationTargets.splice(i, 0, target);
			0 === i && attemptExplicitHydrationTarget(target);
		}
	};
	var isomorphicReactPackageVersion$jscomp$inline_2043 = React.version;
	if ("19.3.1" !== isomorphicReactPackageVersion$jscomp$inline_2043) throw Error(formatProdErrorMessage(527, isomorphicReactPackageVersion$jscomp$inline_2043, "19.3.1"));
	ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
		var fiber = componentOrElement._reactInternals;
		if (void 0 === fiber) {
			if ("function" === typeof componentOrElement.render) throw Error(formatProdErrorMessage(188));
			componentOrElement = Object.keys(componentOrElement).join(",");
			throw Error(formatProdErrorMessage(268, componentOrElement));
		}
		componentOrElement = findCurrentFiberUsingSlowPath(fiber);
		componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
		componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
		return componentOrElement;
	};
	var internals$jscomp$inline_2586 = {
		bundleType: 0,
		version: "19.3.1",
		rendererPackageName: "react-dom",
		currentDispatcherRef: ReactSharedInternals,
		reconcilerVersion: "19.3.1"
	};
	if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
		var hook$jscomp$inline_2587 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!hook$jscomp$inline_2587.isDisabled && hook$jscomp$inline_2587.supportsFiber) try {
			rendererID = hook$jscomp$inline_2587.inject(internals$jscomp$inline_2586), injectedHook = hook$jscomp$inline_2587;
		} catch (err) {}
	}
	exports.createRoot = function(container, options) {
		if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
		var isStrictMode = !1, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
		null !== options && void 0 !== options && (!0 === options.unstable_strictMode && (isStrictMode = !0), void 0 !== options.identifierPrefix && (identifierPrefix = options.identifierPrefix), void 0 !== options.onUncaughtError && (onUncaughtError = options.onUncaughtError), void 0 !== options.onCaughtError && (onCaughtError = options.onCaughtError), void 0 !== options.onRecoverableError && (onRecoverableError = options.onRecoverableError));
		options = createFiberRoot(container, 1, !1, null, null, isStrictMode, identifierPrefix, null, onUncaughtError, onCaughtError, onRecoverableError, defaultOnDefaultTransitionIndicator);
		container[internalContainerInstanceKey] = options.current;
		listenToAllSupportedEvents(container);
		return new ReactDOMRoot(options);
	};
}));
// node_modules/react-dom/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_client_production();
}));
// src/data/itineraryData.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var ITINERARY_DATA = [
	{
		dayNumber: 1,
		date: "11/11",
		dayOfWeek: "週三",
		title: "抵達札幌與市區散步",
		area: "札幌市區",
		routeHighlight: "新千歲機場 ➔ 市區入住 ➔ 二條市場 ➔ 大通電視塔 ➔ 狸小路散策",
		hotel: {
			name: "Hotel Nets Sapporo（札幌奈茨飯店）",
			nameJa: "ホテルネッツ札幌",
			checkInNote: "凌晨寄放行李 / 下午辦理完整 Check-in，鄰近薄野與狸小路商圈",
			address: "北海道札幌市中央区南7条西4丁目2-1",
			mapQuery: "Hotel Nets Sapporo",
			parking: "立體收費停車場（一晚約 ¥1,200，冬季建議先進出入庫除雪）"
		},
		snowTip: {
			title: "札幌市區初冬步道與黑冰警戒",
			roadCondition: "市區柏油路面微融結薄冰（Black Ice 黑冰），夜晚轉冷結凍。",
			tempRange: "0°C ~ 6°C（夜間體感降至 -2°C）",
			freezeLevel: "警戒",
			daylightNote: "日落時間 16:20，傍晚氣溫驟降明顯。",
			detail: "札幌人行道在初雪時常有人踩踏壓實變滑冰，斑馬線白線與地下鐵出入口斜坡特別滑溜，請穿具止滑溝槽的雪靴或加裝簡易冰爪。",
			precautions: [
				"市區步行採取「企鵝步伐」：重心微前傾、小步走、鞋底平著地",
				"二條市場清晨地面濕滑，穿著防滑保暖鞋",
				"地下街（Pole Town / Aurora Town）溫暖乾燥，進出注意溫差脫穿大衣"
			]
		},
		spots: [
			{
				id: "d1-1",
				time: "01:00",
				duration: "停留 01:00",
				name: "新千歲機場 國際線航廈",
				nameJa: "新千歳空港 国際線ターミナル",
				category: "transport",
				description: "抵達北海道國境大門！領取行李、深呼吸北國清冽寒冬空氣，準備前往札幌市區。",
				tags: [{
					type: "must_photo",
					label: "北國歡迎雪景地標"
				}],
				mapQuery: "New Chitose Airport International Terminal",
				mapCode: "113 774 443*22",
				parkingInfo: "國際線停車場（前 1 小時以內可接送暫停）",
				gasInfo: "機場周邊 ENEOS 機場通 SS 24小時營業",
				tip: "深夜抵達氣溫逼近 0°C，出航廈前記得穿上抗風羽絨外套與毛帽。"
			},
			{
				id: "d1-2",
				time: "02:57",
				duration: "停留 01:00",
				name: "Hotel Nets Sapporo",
				nameJa: "ホテルネッツ札幌",
				category: "hotel",
				description: "抵達飯店寄放行李、稍作梳洗休息，準備清晨探索甦醒中的雪都札幌。",
				tags: [{
					type: "must_photo",
					label: "冬夜市區飯店夜景"
				}],
				mapQuery: "Hotel Nets Sapporo",
				mapCode: "9 492 419*58",
				parkingInfo: "飯店附設機械停車位（限高 1.55m，高頂休旅車請停特約平面）",
				gasInfo: "南8条西5丁目 出光興產加油站",
				tip: "櫃檯 24 小時服務，可先行寄存大型行李並拿取暖暖包。"
			},
			{
				id: "d1-3",
				time: "04:14",
				duration: "停留 01:00",
				name: "二條市場",
				nameJa: "二条市場",
				category: "food",
				description: "百年歷史的海鮮廚房！清晨品嚐豪邁鋪滿北海道生海膽、鮭魚卵與厚切生干貝的極鮮海鮮丼。",
				tags: [{
					type: "must_eat",
					label: "特上海鮮三色丼、現剖活海膽"
				}, {
					type: "must_photo",
					label: "掛滿整排生鮮帝王蟹攤位"
				}],
				mapQuery: "Nijo Market Sapporo",
				mapCode: "9 523 045*36",
				parkingInfo: "二條市場周邊 Times 付費停車場（早朝有優惠空位多）",
				gasInfo: "市區加油站密度高，油量無虞",
				tip: "推薦「大磯」或「どんぶり茶屋」，寒冬清晨來一碗熱騰騰螃蟹鐵砲汁（味噌湯）超暖胃！"
			},
			{
				id: "d1-4",
				time: "05:20",
				duration: "停留 01:00",
				name: "札幌電視塔",
				nameJa: "さっぽろテレビ塔",
				category: "sightseeing",
				description: "矗立在大通公園東端的經典地標，清晨燈光漸退，迎來第一道冬日微光照亮銀白塔身。",
				tags: [{
					type: "must_photo",
					label: "電視塔晨光與倒影"
				}],
				mapQuery: "Sapporo TV Tower",
				mapCode: "9 523 384*58",
				parkingInfo: "大通地下停車場（直接連通地下街）",
				gasInfo: "市區 Central Gas Station",
				tip: "可在塔下的大通公園草坪邊緣拍攝以白雪為前景的仰角直幅構圖。"
			},
			{
				id: "d1-5",
				time: "06:23",
				duration: "停留 01:00",
				name: "大通公園",
				nameJa: "大通公園",
				category: "sightseeing",
				description: "橫貫札幌市中心的帶狀雪白綠洲。初雪覆蓋在黑松林木與雕塑噴泉上，宛如童話銀白步道。",
				tags: [{
					type: "must_photo",
					label: "雪覆林木與晨曦長椅"
				}, {
					type: "must_eat",
					label: "冬季烤玉米攤（依出攤而定）"
				}],
				mapQuery: "Odori Park Sapporo",
				mapCode: "9 522 239*77",
				parkingInfo: "大通公園周邊路旁限時停車格（冬季積雪路緣較窄需注意）",
				gasInfo: "市區加油便捷",
				tip: "清晨遊客極少，漫步在剛下過雪的軟雪地上非常療癒靜謐。"
			},
			{
				id: "d1-6",
				time: "07:29",
				duration: "停留 01:00",
				name: "札幌時計台プラザ",
				nameJa: "札幌市時計台",
				category: "sightseeing",
				description: "建於 1878 年的札幌歷史象徵！全木造美式殖民風鐘樓，紅色屋頂頂著厚厚雪冠，清脆鐘聲迴盪市區。",
				tags: [{
					type: "must_photo",
					label: "二樓最佳攝影台拍鐘樓雪頂"
				}],
				mapQuery: "Sapporo Clock Tower",
				mapCode: "9 523 234*00",
				parkingInfo: "時計台對面 MN大樓收費停車場",
				gasInfo: "市區加油站",
				tip: "對街大樓二樓露台設有官方取景攝影台，可以避開路樹拍出明信片級全景！"
			},
			{
				id: "d1-7",
				time: "08:43",
				duration: "停留 01:00",
				name: "狸小路商店街",
				nameJa: "狸小路商店街",
				category: "shopping",
				description: "貫穿 1 到 6 丁目的挑高全天候拱廊商場！不用淋雪即可舒適大採購藥妝、保暖雪靴與伴手禮。",
				tags: [{
					type: "must_buy",
					label: "防滑雪爪、藥妝、白色戀人限定商品"
				}, {
					type: "must_eat",
					label: "現炸生甜甜圈與熱抹茶"
				}],
				mapQuery: "Tanukikoji Shopping Street Sapporo",
				mapCode: "9 492 748*22",
				parkingInfo: "狸小路鄰近多座立體停車塔（步行 2 分鐘）",
				gasInfo: "市區加油站",
				tip: "拱廊內乾爽溫暖，若鞋底有卡雪，進商店前請於地墊踏踩蹭雪以免打滑。"
			},
			{
				id: "d1-8",
				time: "09:48",
				duration: "停留 01:00",
				name: "狸小路 7-chome",
				nameJa: "狸小路7丁目",
				category: "food",
				description: "保留昭和懷舊鋼骨拱廊的 7 丁目，聚集在地隱密咖啡館、手作喫茶店與文青精緻小店。",
				tags: [{
					type: "must_eat",
					label: "昭和手沖咖啡、手作烤布丁"
				}, {
					type: "must_photo",
					label: "復古懷舊燈箱街道"
				}],
				mapQuery: "Tanukikoji 7 Chome Sapporo",
				mapCode: "9 492 597*44",
				parkingInfo: "周邊 Times 停車場",
				gasInfo: "市區加油站",
				tip: "不同於 1-3 丁目的連鎖鬧區，7 丁目充滿深層次的老札幌常民風情。"
			},
			{
				id: "d1-9",
				time: "11:03",
				duration: "停留 01:00",
				name: "返回 Hotel Nets Sapporo",
				nameJa: "ホテルネッツ札幌",
				category: "hotel",
				description: "返回飯店稍事休息充電，整理戰利品並補眠，為隔天的小樽浪漫之旅養精蓄銳。",
				tags: [{
					type: "must_photo",
					label: "今日戰利品開箱"
				}],
				mapQuery: "Hotel Nets Sapporo",
				mapCode: "9 492 419*58",
				parkingInfo: "飯店停車場",
				gasInfo: "市區加油站",
				tip: "下午可在飯店好好泡熱水澡暖身，舒緩長途飛行疲勞。"
			}
		]
	},
	{
		dayNumber: 2,
		date: "11/12",
		dayOfWeek: "週四",
		title: "小樽浪漫巡禮 ➔ 藻岩山百萬夜景",
		area: "小樽 ＆ 札幌南區",
		routeHighlight: "運河雪景 ➔ 北一硝子煤油燈 ➔ 六花亭夾心酥 ➔ 蒸氣鐘 ➔ 音樂盒堂 ➔ 藻岩山俯瞰夜景",
		hotel: {
			name: "Hotel Nets Sapporo（札幌奈茨飯店）",
			nameJa: "ホテルネッツ札幌",
			checkInNote: "連住第二晚，市區交通出入便捷",
			address: "北海道札幌市中央区南7条西4丁目2-1",
			mapQuery: "Hotel Nets Sapporo",
			parking: "立體收費停車場（出發前請確認車頂無厚重積雪）"
		},
		snowTip: {
			title: "小樽海風凍結 ＆ 藻岩山頂強風低溫",
			roadCondition: "小樽港邊石疊步道容易被海水濕氣凝結成冰面；藻岩山頂步道極滑。",
			tempRange: "-2°C ~ 4°C（藻岩山頂體感 -6°C）",
			freezeLevel: "警戒",
			daylightNote: "日落約 16:18。藻岩山夜景建議 16:30 前搭纜車上山卡位夕暮魔幻時刻。",
			detail: "小樽運河旁散策路面多有堅硬踏冰，請靠內側走。藻岩山頂觀景台無遮蔽海風強勁，請務必戴齊防風連帽、手套與圍巾！",
			precautions: [
				"小樽蒸汽鐘前石階常積雪，拍照走動請緊抓扶手",
				"藻岩山纜車站設有免費鞋底防滑墊租借或簡易除雪設備",
				"山頂手機電池耗電極快，隨身攜帶暖暖包與行動電源緊貼手機"
			]
		},
		spots: [
			{
				id: "d2-1",
				time: "08:00",
				duration: "出發",
				name: "Hotel Nets Sapporo 出發",
				nameJa: "ホテル出発",
				category: "transport",
				description: "整裝出發！搭乘 JR 函館本線或自駕前往浪漫港都小樽，沿途可見日本海石狩灣的冬浪。",
				tags: [{
					type: "must_photo",
					label: "JR 朝里海景雪國車窗"
				}],
				mapQuery: "Hotel Nets Sapporo",
				parkingInfo: "出發前備妥保暖手套與相機",
				gasInfo: "札幌出發油箱保持半滿以上",
				tip: "若搭乘 JR，推薦坐靠右側車窗，過錢函站後即是壯闊的雪景海岸線！"
			},
			{
				id: "d2-2",
				time: "09:54",
				duration: "停留 01:00",
				name: "小樽運河",
				nameJa: "小樽運河",
				category: "sightseeing",
				description: "北海道最具代表性的冬季詩篇！復古石造倉庫群倒映在靜謐運河水中，煤油路燈覆上潔白積雪。",
				tags: [{
					type: "must_photo",
					label: "淺草橋經典運河弧度構圖"
				}],
				mapQuery: "Otaru Canal",
				mapCode: "493 690 384*44",
				parkingInfo: "小樽運河中央停車場（¥600-1000/次）",
				gasInfo: "小樽港通 ENEOS 小樽中央 SS",
				tip: "在淺草橋拍照點由上往下拍，能把紅磚倉庫頂的厚雪與水面波光完整收錄。"
			},
			{
				id: "d2-3",
				time: "11:18",
				duration: "停留 01:00",
				name: "北一硝子三號館",
				nameJa: "北一硝子三号館",
				category: "shopping",
				description: "由石造倉庫改建的玻璃工藝殿堂。館內「星空喫茶室」點燃 167 盞溫暖油燈，漫溢煤油芳香與典雅光影。",
				tags: [{
					type: "must_photo",
					label: "167盞煤油燈星空大廳"
				}, {
					type: "must_eat",
					label: "八段巨無霸彩虹霜淇淋"
				}],
				mapQuery: "Kitaichi Glass Sangokan Otaru",
				mapCode: "493 661 681*88",
				parkingInfo: "北一硝子特約停車場（消費折抵）",
				gasInfo: "臨港線加油站",
				tip: "油燈大廳每早有專人手動點燈，在室內喝杯熱咖啡聽古典樂極度放鬆。"
			},
			{
				id: "d2-4",
				time: "12:19",
				duration: "停留 01:00",
				name: "六花亭 小樽運河店",
				nameJa: "六花亭 小樽運河店",
				category: "food",
				description: "北海道甜點王者！二樓喫茶區提供現烤香酥脆泡芙「雪やこんこ」與現吃酥脆夾心餅，並招待免費熱黑咖啡。",
				tags: [{
					type: "must_eat",
					label: "賞味期僅2小時現烤脆皮泡芙"
				}, {
					type: "must_buy",
					label: "十勝產蘭姆葡萄奶油夾心酥餅"
				}],
				mapQuery: "Rokkatei Otaru Canal Store",
				mapCode: "493 661 743*00",
				parkingInfo: "六花亭與北菓樓共用後方停車場",
				gasInfo: "市區加油方便",
				tip: "隔壁就是「北菓樓」，可以順道品嚐「夢不思議」巨型大泡芙！"
			},
			{
				id: "d2-5",
				time: "13:22",
				duration: "停留 01:00",
				name: "小樽蒸汽鐘",
				nameJa: "小樽スチームクロック",
				category: "sightseeing",
				description: "全世界現存少數的蒸汽鐘之一，由加拿大製造。每整點與每隔 15 分鐘都會伴隨悅耳音樂噴出滾滾蒸氣。",
				tags: [{
					type: "must_photo",
					label: "整點蒸氣白煙升空瞬間"
				}],
				mapQuery: "Otaru Steam Clock",
				mapCode: "493 660 788*33",
				parkingInfo: "童話十字路口觀光停車場",
				gasInfo: "堺町通附近加油站",
				tip: "在童話十字路口中心抓好角度，可將蒸汽鐘與音樂盒堂紅磚歐式主建築一併入鏡。"
			},
			{
				id: "d2-6",
				time: "14:23",
				duration: "停留 01:00",
				name: "小樽音樂盒堂 本館",
				nameJa: "小樽オルゴール堂 本館",
				category: "shopping",
				description: "三層挑高木造暖色空間，陳列數萬件晶瑩音樂盒！清脆旋律在耳邊迴繞，是選購回憶禮物的最佳地點。",
				tags: [{
					type: "must_buy",
					label: "旋轉木馬與蒸氣鐘造型手工音樂盒"
				}, {
					type: "must_photo",
					label: "三樓木造閣樓俯瞰璀璨光海"
				}],
				mapQuery: "Otaru Music Box Museum",
				mapCode: "493 660 758*55",
				parkingInfo: "童話十字路口步行 1 分鐘",
				gasInfo: "小樽港通加油站",
				tip: "館內有可自行挑選樂曲底座與水晶飾品的 DIY 專區。"
			},
			{
				id: "d2-7",
				time: "16:49",
				duration: "停留 01:00",
				name: "藻岩山山頂展望台",
				nameJa: "もいわ山山頂展望台",
				category: "sightseeing",
				description: "【新日本三大夜景】搭乘索道纜車與莫里斯迷你軌道車登上山頂，飽覽宛如珠寶盒散落的 360 度璀璨百萬璀璨燈海！",
				tags: [{
					type: "must_photo",
					label: "「幸福之鐘」同框百萬札幌夜景"
				}, {
					type: "must_eat",
					label: "山頂景觀餐廳熱可可"
				}],
				mapQuery: "Mt Moiwa Ropeway Sapporo",
				mapCode: "9 400 432*77",
				parkingInfo: "藻岩山麓站免費大型停車場（滿車時需等候）",
				gasInfo: "南19条西16丁目 ENEOS 藻岩山麓 SS",
				tip: "傍晚 16:40 前後抵達可捕捉天空由寶藍色漸變為漆黑時的魔幻夜景，山頂風極冷請戴好手套！"
			},
			{
				id: "d2-8",
				time: "18:36",
				duration: "停留 01:00",
				name: "返回 Hotel Nets Sapporo",
				nameJa: "ホテルネッツ札幌",
				category: "hotel",
				description: "回到市區，夜晚可散步前往薄野拉麵橫丁來一碗濃郁熱氣騰騰的札幌味噌奶油玉米拉麵。",
				tags: [{
					type: "must_eat",
					label: "薄野元祖拉麵橫丁味噌拉麵"
				}],
				mapQuery: "Hotel Nets Sapporo",
				parkingInfo: "飯店停車場",
				gasInfo: "市區加油站",
				tip: "今晚把明天即將去白色戀人與北海道神宮的路線確認好。"
			}
		]
	},
	{
		dayNumber: 3,
		date: "11/13",
		dayOfWeek: "週五",
		title: "白色戀人 ➔ 北海道神宮參拜",
		area: "札幌西區 ＆ 圓山地區",
		routeHighlight: "夢幻巧克力工坊 ➔ 戶外運動裝備 ➔ 鎮守蝦夷全島神宮雪中參拜",
		hotel: {
			name: "Hotel Nets Sapporo（札幌奈茨飯店）",
			nameJa: "ホテルネッツ札幌",
			checkInNote: "在札幌的最後一晚！整理明日取車自駕所需之大型行李",
			address: "北海道札幌市中央区南7条西4丁目2-1",
			mapQuery: "Hotel Nets Sapporo",
			parking: "立體收費停車場"
		},
		snowTip: {
			title: "市郊積雪加厚 ＆ 明日雪地自駕前置叮嚀",
			roadCondition: "神宮參道森林步道為踏實硬雪，步道邊緣軟雪鬆散易深陷。",
			tempRange: "-1°C ~ 5°C",
			freezeLevel: "中等",
			daylightNote: "日落 16:16。神宮冬季閉門時間較早（約 16:00），需注意參拜時間。",
			detail: "今日集中在西區與圓山地區，明日早晨即將展開長達千公里的北海道自駕繞圈，今晚請務必再三確認台灣駕照正本與日文譯本！",
			precautions: [
				"神社境內洗手舍「手水舍」冬季泉水冰冷，參拜洗手後立刻以乾毛巾擦乾",
				"神宮石板參道雪面易滑，建議穿著刻紋深的防滑底鞋",
				"今晚整理後車廂放置行李的空間分配"
			]
		},
		spots: [
			{
				id: "d3-1",
				time: "08:00",
				duration: "出發",
				name: "Hotel Nets Sapporo 出發",
				nameJa: "ホテル出発",
				category: "transport",
				description: "出發前往宮之澤！前往宛如英倫古典莊園的白色戀人觀光工坊。",
				tags: [{
					type: "must_photo",
					label: "札幌街車市電剪影"
				}],
				mapQuery: "Hotel Nets Sapporo",
				parkingInfo: "市區地下鐵宮之澤站步行 7 分鐘",
				gasInfo: "市區油料充足",
				tip: "早晨可搭乘東西線地下鐵直達宮之澤終點站。"
			},
			{
				id: "d3-2",
				time: "09:36",
				duration: "停留 01:00",
				name: "白色戀人公園",
				nameJa: "白い恋人パーク",
				category: "sightseeing",
				description: "英式紅磚城堡在皚皚白雪襯托下美不勝收！參觀貓舌餅乾自動化生產線，庭園鐘樓每整點更有繽紛機械偶遊行。",
				tags: [{
					type: "must_photo",
					label: "雪中紅磚鐘塔與英式玫瑰園"
				}, {
					type: "must_eat",
					label: "白色戀人限定香濃白黑霜淇淋"
				}],
				mapQuery: "Shiroi Koibito Park Sapporo",
				mapCode: "9 602 384*55",
				parkingInfo: "白色戀人專用收費立體停車場（參觀可折抵）",
				gasInfo: "宮之澤通 ENEOS",
				tip: "中庭雪地常有可愛雪人裝飾，是拍照不可錯過的絕美打卡景點！"
			},
			{
				id: "d3-3",
				time: "10:37",
				duration: "停留 01:00",
				name: "XEBEC Miyanosawa",
				nameJa: "XEBEC 宮の沢（ゼビオ）",
				category: "shopping",
				description: "位於白色戀人公園正對面的大型運動旗艦商城！專門販售北海道嚴冬滑雪裝備、Columbia/The North Face防寒雪靴、冰爪與發熱配件。",
				tags: [{
					type: "must_buy",
					label: "抓地雪靴、防雪高係數手套、毛帽"
				}, {
					type: "must_photo",
					label: "挑高運動裝備展示牆"
				}],
				mapQuery: "Super Sports Xebio Miyanosawa",
				mapCode: "9 602 291*88",
				parkingInfo: "大型免費戶外專用停車場",
				gasInfo: "北5条手稻通加油站",
				tip: "若隨身鞋子抓地力不足，強烈建議在這裡補齊專業無釘防滑雪鞋套或羊毛保暖襪！"
			},
			{
				id: "d3-4",
				time: "12:07",
				duration: "停留 01:00",
				name: "北海道神宮",
				nameJa: "北海道神宮",
				category: "sightseeing",
				description: "北海道總鎮守！古木參天的原生森林覆蓋上純白雪被，穿過高聳鳥居踏著潔淨白雪步道祈求此行自駕行車平安。",
				tags: [
					{
						type: "must_photo",
						label: "白雪覆蓋的莊嚴巨大注連繩與神門"
					},
					{
						type: "must_eat",
						label: "六花亭神宮茶屋現烤「判官餅」"
					},
					{
						type: "must_buy",
						label: "交通安全御守、可愛拉拉熊繪馬"
					}
				],
				mapQuery: "Hokkaido Jingu Sapporo",
				mapCode: "9 487 314*44",
				parkingInfo: "神宮境內第一與第二停車場（參拜者可享 1 小時免費）",
				gasInfo: "南1条西28丁目加油站",
				tip: "六花亭神宮茶屋限定的「判官餅」是蕎麥外皮包紅豆餡，現場鐵板現煎香氣撲鼻，外酥內軟極度推薦！"
			},
			{
				id: "d3-5",
				time: "13:37",
				duration: "停留 01:00",
				name: "返回 Hotel Nets Sapporo",
				nameJa: "ホテルネッツ札幌",
				category: "hotel",
				description: "返回飯店稍事休息，下午可悠閒逛街或在飯店整理行李箱，將保暖衣物與租車證件分開收納。",
				tags: [{
					type: "must_photo",
					label: "神宮開運御守大合照"
				}],
				mapQuery: "Hotel Nets Sapporo",
				parkingInfo: "飯店停車場",
				gasInfo: "市區加油站",
				tip: "今晚早點就寢，明天 08:40 準時辦理租車手續，開啟自駕征途！"
			}
		]
	},
	{
		dayNumber: 4,
		date: "11/14",
		dayOfWeek: "週六",
		title: "札幌取車 ➔ 圓山動物園 ➔ 帶廣",
		area: "札幌 ➔ 占冠 ➔ 十勝帶廣",
		routeHighlight: "World Net 租車 ➔ 圓山動物園看北極熊 ➔ 道之驛占冠 ➔ 帶廣大一超市採買和牛",
		hotel: {
			name: "The Horizon Residence（帶廣）",
			nameJa: "ザ・ホライズンレジデンス帯広",
			checkInNote: "帶廣市區質感公寓式旅宿，附設廚房設施，可料理超市採買的和牛晚餐！",
			address: "北海道帯広市西3条南11丁目",
			mapQuery: "The Horizon Residence Obihiro",
			parking: "附設專用平底露天停車場（免費，停車後請將雨刷立起防止結凍）"
		},
		snowTip: {
			title: "【重大自駕警戒】道東自動車道（夕張–占冠山嶺隧道段）",
			roadCondition: "山區穿山隧道出入口易突發強側風、路面黑冰，路段最高速限依積雪調降。",
			tempRange: "-3°C ~ 3°C（占冠山區下午可達 -5°C）",
			freezeLevel: "極高危險",
			daylightNote: "日落時間 16:12！請務必在天黑前穿過占冠山區高速路段，天黑後視線極差。",
			detail: "取車時務必確認全時 4WD 運作正常、四輪均為合格無釘雪胎（Studless Tire），並領取除雪刮冰刷。行駛高速公路保持前車 100 公尺以上車距，嚴禁突然重踩煞車！",
			precautions: [
				"租車點仔細檢查車身刮痕並確認雪刷在後車廂",
				"占冠休息區務必上廁所並補充熱飲熱食",
				"到達帶廣後停妥車輛，立刻把前後雨刷「垂直立起」，避免清晨凍黏在擋風玻璃上"
			]
		},
		spots: [
			{
				id: "d4-1",
				time: "08:30",
				duration: "出發",
				name: "Hotel Nets Sapporo 出發",
				nameJa: "ホテル出発",
				category: "transport",
				description: "辦理退房手續，帶著所有行李步行前往租車營業所。",
				tags: [{
					type: "must_photo",
					label: "出發合影"
				}],
				mapQuery: "Hotel Nets Sapporo",
				parkingInfo: "辦理退房手續",
				gasInfo: "即將取車，租車滿油出發",
				tip: "確認隨身攜帶：台灣護照、台灣駕照正本、台灣駕照日文譯本！缺一不可！"
			},
			{
				id: "d4-2",
				time: "08:40",
				duration: "停留 01:00",
				name: "World Net Rent-A-Car Sapporo Sales Office",
				nameJa: "ワールドネットレンタカー 札幌営業所",
				category: "transport",
				description: "辦理租車契約、加購安心保險（免責補償 NOC）與雪胎/ETC 卡，開啟北海道壯遊模式！",
				tags: [{
					type: "must_photo",
					label: "與陪伴 9 天的雪地 4WD 愛車合照"
				}],
				mapQuery: "World Net Rent A Car Sapporo",
				mapCode: "9 493 056*22",
				parkingInfo: "營業所專用交車檢驗區",
				gasInfo: "取車時油箱已加滿",
				tip: "檢查確認：雨刷噴嘴防凍雨刷水（-30°C規格）、後行李廂除雪雪刷、雪鏟、4WD 切換鍵操作方式。"
			},
			{
				id: "d4-3",
				time: "09:59",
				duration: "停留 03:00",
				name: "札幌市円山動物園",
				nameJa: "札幌市円山動物園",
				category: "activity",
				description: "深度停留 3 小時！參觀全新北極熊館（水底透明隧道看北極熊在冰水與雪地悠游）、雪豹與喜馬拉雅小貓熊。",
				tags: [
					{
						type: "must_photo",
						label: "水底隧道抬頭看北極熊肉球大腳掌"
					},
					{
						type: "must_buy",
						label: "圓山動物園限定白色北極熊泡麵、玩偶"
					},
					{
						type: "must_eat",
						label: "園區熱熱的熊掌造型包子"
					}
				],
				mapQuery: "Maruyama Zoo Sapporo",
				mapCode: "9 457 407*66",
				parkingInfo: "動物園西門及第一停車場（小客車 ¥700/次）",
				gasInfo: "出動物園後接南7条線有 Shell 加油站",
				tip: "園內冬季積雪厚實，參觀路線都有除雪但部分坡道較陡，慢慢走別奔跑。"
			},
			{
				id: "d4-4",
				time: "14:45",
				duration: "停留 00:40",
				name: "道之驛自然體驗館（占冠）",
				nameJa: "道の駅 自然体感しむかっぷ",
				category: "food",
				description: "道東道深山中的溫暖休憩驛站。享用占冠特產山菜烏龍麵、香濃十勝牛奶霜淇淋，讓駕駛稍作喘息熱身。",
				tags: [{
					type: "must_eat",
					label: "占冠村產山菜天婦羅蕎麥麵、手作霜淇淋"
				}, {
					type: "must_photo",
					label: "雪山環繞的木造木屋道之驛"
				}],
				mapQuery: "Roadside station Shizentaikan Shimukappu",
				mapCode: "608 070 827*55",
				parkingInfo: "免費大型休息區停車場（附公廁與暖氣休息室）",
				gasInfo: "占冠交流道口 ENEOS 占冠 SS（營業至 18:00，山區務必留意油量）",
				tip: "這裡到帶廣還有約 1 小時車程，出發前確認擋風玻璃與頭燈上的飛雪已經刷除乾淨。"
			},
			{
				id: "d4-5",
				time: "16:45",
				duration: "停留 01:00",
				name: "大一超市 稻田店（ダイイチ 稲田店）",
				nameJa: "ダイイチ 稲田店",
				category: "shopping",
				description: "十勝帶廣在地最強超級市場！採購今晚公寓自煮的高等級十勝黑毛和牛、十勝特產男爵馬鈴薯、鮮乳與產地生鮮。",
				tags: [{
					type: "must_buy",
					label: "油花爆棚的十勝牛排肉、十勝四葉特選鮮乳"
				}, {
					type: "must_eat",
					label: "超市熟食部現烤成吉思汗羊肉串"
				}],
				mapQuery: "Daiichi Inada Obihiro",
				mapCode: "124 533 147*22",
				parkingInfo: "超市附設超大型免費平面停車場",
				gasInfo: "稻田通 Idemitsu 昭和出光加油站",
				tip: "超市晚上 17 點後許多生鮮肉品會貼出折扣貼紙，CP 值超級高！"
			},
			{
				id: "d4-6",
				time: "17:55",
				duration: "停留 01:00",
				name: "The Horizon Residence（帶廣）",
				nameJa: "ザ・ホライズンレジデンス帯広",
				category: "hotel",
				description: "抵達帶廣市區下榻！寬敞現代公寓客房配有全套廚具，煎香嫩多汁的和牛配北海道白米飯，犒賞開車辛苦的一天。",
				tags: [{
					type: "must_photo",
					label: "今晚十勝和牛澎湃私廚晚餐"
				}],
				mapQuery: "The Horizon Residence Obihiro",
				mapCode: "124 594 374*11",
				parkingInfo: "附設專用平底露天停車場（免費，請立起雨刷）",
				gasInfo: "帶廣市區加油非常方便",
				tip: "停好車後別忘了把前後雨刷立起，防止明早被凍住！"
			}
		]
	},
	{
		dayNumber: 5,
		date: "11/15",
		dayOfWeek: "週日",
		title: "帶廣 ➔ 釧路（丹頂鶴與濕原）",
		area: "帶廣 ➔ 浦幌 ➔ 釧路",
		routeHighlight: "真鍋庭園針葉林 ➔ 幸福站敲響戀人之鐘 ➔ 浦幌黑豆 ➔ 丹頂鶴仙姿 ➔ 細岡夕暉濕原",
		hotel: {
			name: "Sunlounge（釧路）",
			nameJa: "サンラウンジ釧路",
			checkInNote: "釧路市區舒適旅宿，鄰近釧路川與幣舞橋美食街",
			address: "北海道釧路市旭町",
			mapQuery: "Sunlounge Kushiro",
			parking: "提供平面停車位（積雪天停車請盡量遠離屋簷滴水處，防止落冰砸車）"
		},
		snowTip: {
			title: "國道 38 號海風凍結 ＆ 細岡展望台林道暗冰",
			roadCondition: "往釧路沿海路段常有濃霧結霜；細岡林道最後 2km 積雪深且無照明。",
			tempRange: "-4°C ~ 3°C",
			freezeLevel: "警戒",
			daylightNote: "日落 16:08！細岡展望台看日落必須在 15:45 前抵達觀景台木棧道。",
			detail: "道東地區野生蝦夷鹿（エゾシカ）繁多，傍晚或清晨常突然跳出路面，見到鹿群警示路標請減速至 50km/h 以下！如遇鹿隻切勿狂按喇叭以防其驚慌衝撞車體。",
			precautions: [
				"細岡展望台下車後林道走動配戴頭燈或手機手電筒",
				"冬季車輛切勿停在傾斜坡道邊緣，避免側滑",
				"釧路沿海海風濕冷，防風保暖大衣必穿"
			]
		},
		spots: [
			{
				id: "d5-1",
				time: "09:30",
				duration: "停留 02:00",
				name: "真鍋庭園",
				nameJa: "真鍋庭園",
				category: "sightseeing",
				description: "日本第一座針葉樹造景迴遊式庭園！面積廣達 25,000 坪，數千種歐洲珍稀針葉樹披掛厚雪，宛如置身北歐奇幻森林。",
				tags: [{
					type: "must_photo",
					label: "雪覆銀白針葉林與童話紅頂木屋"
				}, {
					type: "must_eat",
					label: "庭園咖啡館熱手沖咖啡與蒙布朗"
				}],
				mapQuery: "Manabe Garden Obihiro",
				mapCode: "124 473 346*00",
				parkingInfo: "庭園入口附設大型免費停車場",
				gasInfo: "帶廣南環線 ENEOS 帶廣稻田 SS",
				tip: "庭園散步道分為 30 分鐘與 60 分鐘路線，雪地請沿著木屑步道指示前進。"
			},
			{
				id: "d5-2",
				time: "11:51",
				duration: "停留 01:30",
				name: "幸福駅",
				nameJa: "幸福駅（旧広尾線）",
				category: "sightseeing",
				description: "「從愛的國度通往幸福」！已廢線的舊廣尾線名站，留存復古木造站舍，貼滿世界各地旅人的幸福車票與粉紅祈願箋。",
				tags: [{
					type: "must_photo",
					label: "敲響幸福之鐘、橘色復古柴油車廂"
				}, {
					type: "must_buy",
					label: "「愛國➔幸福」經典紀念厚紙車票與木質御守"
				}],
				mapQuery: "Kofuku Station Obihiro",
				mapCode: "396 844 711*22",
				parkingInfo: "幸福鐵道公園免費停車場",
				gasInfo: "幸福町周邊小型加油站",
				tip: "走進舊車廂內部可以坐下體驗昭和懷舊暖爐與絲絨座椅，拍照很有懷舊氛圍！"
			},
			{
				id: "d5-3",
				time: "14:17",
				duration: "停留 01:00",
				name: "浦幌道之驛休息站",
				nameJa: "道の駅 うらほろ",
				category: "food",
				description: "連結十勝平原與釧路的必經中繼站！後方緊鄰廣大森林公園，以浦幌特產光黑大豆烘焙甜點馳名。",
				tags: [{
					type: "must_eat",
					label: "現烤浦幌黑豆可頌、大豆霜淇淋"
				}, {
					type: "must_buy",
					label: "十勝產紅豆真空伴手禮"
				}],
				mapQuery: "Roadside Rest Area Urahoro",
				mapCode: "587 358 114*44",
				parkingInfo: "免費休息站大停車場",
				gasInfo: "浦幌國道 38 號沿線 COSMO 加油站（建議進釧路前補油）",
				tip: "上個洗手間伸展筋骨，接下來沿國道 38 號線向東約 1.5 小時即可抵達釧路市。"
			},
			{
				id: "d5-4",
				time: "16:22",
				duration: "停留 02:00",
				name: "釧路市丹頂鶴自然公園",
				nameJa: "釧路市丹頂鶴自然公園",
				category: "activity",
				description: "近距離見證特別天然紀念物「雪原之神」丹頂鶴！頭頂紅冠、羽翼純白如仙子般優雅漫步在深厚雪地之中。",
				tags: [{
					type: "must_photo",
					label: "丹頂鶴雪中展翅求偶舞"
				}, {
					type: "must_buy",
					label: "丹頂鶴造型刺繡手帕與胸針"
				}],
				mapQuery: "Kushiro Japanese Crane Reserve",
				mapCode: "577 874 544*77",
				parkingInfo: "園區專用免費停車場",
				gasInfo: "阿寒國道沿線加油站",
				tip: "下午是餵食時段，丹頂鶴活動頻繁且鳴叫聲高亢清脆，備好長焦鏡頭！"
			},
			{
				id: "d5-5",
				time: "19:07",
				duration: "停留 01:00",
				name: "細岡展望台",
				nameJa: "細岡展望台（大観望）",
				category: "sightseeing",
				description: "眺望日本最大濕地「釧路濕原」的第一名所！冬季釧路川蛇行蜿蜒在蒼茫雪原間，遠眺雌阿寒岳、雄阿寒岳連峰。",
				tags: [{
					type: "must_photo",
					label: "俯瞰蜿蜒如銀蛇的釧路川雪原大景"
				}],
				mapQuery: "Hosooka Observatory Kushiro",
				mapCode: "149 655 491*00",
				parkingInfo: "細岡遊客休息屋停車場（步行至展望台約 5 分鐘）",
				gasInfo: "山區無加油站，由市區出發務必半滿",
				tip: "林道冬季積雪較厚，下車後務必穿防滑靴，手電筒照明確認步伐。"
			},
			{
				id: "d5-6",
				time: "20:39",
				duration: "停留 01:00",
				name: "Big House Asahimachi Shop",
				nameJa: "ビッグハウス 旭町店",
				category: "shopping",
				description: "釧路在地大型量販生鮮超市！採買在地名產釧路爐端燒食材、釧路拉麵包、北海道鮮乳與零食。",
				tags: [{
					type: "must_buy",
					label: "道東產花咲蟹肉罐、釧路限定醬油拉麵"
				}, {
					type: "must_eat",
					label: "熟食區現炸北海道炸雞（Zangi ざんぎ）"
				}],
				mapQuery: "Big House Asahimachi Kushiro",
				mapCode: "149 226 738*33",
				parkingInfo: "超市專用寬敞免費平面停車場",
				gasInfo: "旭町通出光加油站",
				tip: "釧路是「日式炸雞塊（Zangi）」的發源地，超市的現炸 Zangi 香脆多汁不容錯過！"
			},
			{
				id: "d5-7",
				time: "21:42",
				duration: "停留 01:00",
				name: "Sunlounge（抵達入住）",
				nameJa: "サンラウンジ釧路",
				category: "hotel",
				description: "抵達釧路市區飯店入住，卸下行李放鬆身心，準備明天前往阿寒湖溫泉渡假村！",
				tags: [{
					type: "must_photo",
					label: "釧路冬夜港都夜景"
				}],
				mapQuery: "Sunlounge Kushiro",
				mapCode: "149 256 123*55",
				parkingInfo: "飯店停車位（遠離屋簷結冰滴水處）",
				gasInfo: "市區加油方便",
				tip: "記得拉起汽車雨刷，今晚好好休息。"
			}
		]
	},
	{
		dayNumber: 6,
		date: "11/16",
		dayOfWeek: "週一",
		title: "釧路 ➔ 阿寒湖溫泉渡假村",
		area: "釧路 ➔ 阿寒摩周國立公園",
		routeHighlight: "釧路港出發 ➔ 幸運之森木雕街 ➔ 愛努傳統工藝村 ➔ La Vista 溪流雪景頂級露天溫泉",
		hotel: {
			name: "La Vista 飯店渡假村 阿寒川釧路（La Vista Akangawa）",
			nameJa: "ラビスタ阿寒川（共立リゾート）",
			checkInNote: "全館被原始阿寒森林與清澈阿寒川環抱，房內自帶天然檜木溫泉風呂！享用奢華會席料理。",
			address: "北海道釧路市阿寒町オクルシュベ3-1",
			mapQuery: "La Vista Akangawa Resort",
			parking: "渡假村免費專屬平面停車場（工作人員會協助導引）"
		},
		snowTip: {
			title: "國道 240 號（毬藻國道）山區長下坡與結冰彎道",
			roadCondition: "進入阿寒山區海拔攀升，背陽坡積雪壓實全日結冰。",
			tempRange: "-6°C ~ 2°C（夜間渡假村氣溫可破 -8°C）",
			freezeLevel: "極高危險",
			daylightNote: "山谷日落極早，15:30 天色已暗。建議 13:00 前完成 Check-in。",
			detail: "通往 La Vista 阿寒川的私家引道有一段坡度較大的林道下坡，請排入 B 檔或低速檔運用「引擎煞車（Engine Brake）」減速，千萬避免長時間腳踩煞車造成煞車熱衰竭或雪地打滑！",
			precautions: [
				"進入渡假村坡道前打低速檔並鬆開油門慢行",
				"露天風呂戶外走道極凍結冰，泡湯進出務必踏在防滑防凍草蓆上",
				"深夜車輛易結厚霜，雨刷務必垂直立起"
			]
		},
		spots: [
			{
				id: "d6-1",
				time: "09:30",
				duration: "停留 01:00",
				name: "Sunlounge 出發",
				nameJa: "ホテル出発",
				category: "transport",
				description: "告別霧都釧路，驅車一路向北穿越原生蝦夷鹿棲息的林道，直奔神秘火山湖阿寒湖。",
				tags: [{
					type: "must_photo",
					label: "出發前車窗除霜"
				}],
				mapQuery: "Sunlounge Kushiro",
				parkingInfo: "出發前用雪刷徹底刮除前後擋風玻璃與後照鏡積雪",
				gasInfo: "出釧路市區前務必加滿油（國道240號山路長達70km無加油站）",
				tip: "阿寒山區加油站非常稀少且早早打烊，切記在釧路市區加滿油再出發！"
			},
			{
				id: "d6-2",
				time: "10:30",
				duration: "停留 01:00",
				name: "幸運之森商店街",
				nameJa: "幸運の森商店街（阿寒湖温泉）",
				category: "shopping",
				description: "阿寒湖畔溫泉街最具特色的工藝街！整排木造日式店舖陳列精雕細琢的守護神貓頭鷹（Kotankor Kamuy）、木杯與狐狸木雕。",
				tags: [{
					type: "must_buy",
					label: "守護家宅的蝦夷木雕貓頭鷹、綠毬藻吊飾"
				}, {
					type: "must_photo",
					label: "掛滿雪燈籠的木雕溫泉街景"
				}],
				mapQuery: "Koun no Mori Shopping Street Akan",
				mapCode: "739 342 633*22",
				parkingInfo: "阿寒湖畔公共收費停車場（冬季部分免費開放）",
				gasInfo: "阿寒湖溫泉 ENEOS 阿寒湖畔 SS",
				tip: "許多店家提供現場在木雕刻印旅人姓名的服務，是獨一無二的專屬紀念！"
			},
			{
				id: "d6-3",
				time: "11:40",
				duration: "停留 01:00",
				name: "阿寒湖愛努村",
				nameJa: "阿寒湖アイヌコタン",
				category: "activity",
				description: "北海道最大的原住民族愛努文化聚落！入口矗立著展翅貓頭鷹巨型木雕鳥居，村內展示傳統茅草屋舍（チセ）與民俗樂器。",
				tags: [{
					type: "must_photo",
					label: "愛努大鳥居與雪中傳統茅草房"
				}, {
					type: "must_eat",
					label: "愛努傳統野味燉鹿肉鹿湯、烤山女魚"
				}],
				mapQuery: "Akan Ainu Kotan",
				mapCode: "739 342 492*77",
				parkingInfo: "愛努村前專屬停車場",
				gasInfo: "阿寒湖畔加油站",
				tip: "部落裡的「波之聲（ポロンノ）」餐廳可以品嚐正統愛努風味傳統鄉土料理，極具深度！"
			},
			{
				id: "d6-4",
				time: "12:52",
				duration: "停留 01:00",
				name: "La Vista 飯店渡假村 阿寒川釧路",
				nameJa: "ラビスタ阿寒川（共立リゾート）",
				category: "hotel",
				description: "【本次旅行極上奢華住宿亮點】抵達頂級溫泉旅宿！換上溫暖館內服，一邊泡著私人檜木泉一邊凝望窗外潺潺清溪與落雪，運氣好還能看見野生鹿群在溪邊飲水！",
				tags: [{
					type: "must_photo",
					label: "溪流第一排森林雪景露天風呂"
				}, {
					type: "must_eat",
					label: "頂級會席晚餐與宵夜免費醬油拉麵（夜鳴きそば）"
				}],
				mapQuery: "La Vista Akangawa Resort",
				mapCode: "739 205 328*33",
				parkingInfo: "渡假村免費專屬停車場（服務人員協助行李與除雪）",
				gasInfo: "山區加油不易，明早出發前確認油量",
				tip: "館內有三間免費免預約的私人露天湯屋（風の湯），夜晚雪花飄落時泡湯如夢似幻！"
			}
		]
	},
	{
		dayNumber: 7,
		date: "11/17",
		dayOfWeek: "週二",
		title: "雙湖巡禮 ➔ 通往天空之路 ➔ 知床",
		area: "屈斜路湖 ➔ 摩周湖 ➔ 斜里 ➔ 知床",
		routeHighlight: "屈斜路湖砂湯挖溫泉 ➔ 神秘摩周藍 ➔ 硫磺山地熱白煙 ➔ 天空之路直衝天際 ➔ 入住知床",
		hotel: {
			name: "『Lantern SHIRETOKO / ランタン知床』",
			nameJa: "ランタン知床（Lantern Shiretoko）",
			checkInNote: "世界自然遺產知床半島宇登呂溫泉區溫馨旅店，親近自然大地的舒適驛站",
			address: "北海道斜里郡斜里町ウトロ東",
			mapQuery: "Lantern SHIRETOKO",
			parking: "旅館門前附設免費平面停車位（面海風大，停車後注意關緊車門）"
		},
		snowTip: {
			title: "摩周高地濃霧吹雪 ＆ 斜里天空之路強烈側風",
			roadCondition: "摩周湖道路標高超過 600m，經常突發瞬間強降雪（Whiteout）；天空之路坡頂開闊風切強勁。",
			tempRange: "-5°C ~ 1°C（知床沿海體感 -8°C）",
			freezeLevel: "警戒",
			daylightNote: "日落時間 16:04！通往天空之路必須在 14:30 抵達才能拍出夕照黃金大道。",
			detail: "通往天空之路坡道頂部地勢開闊，強烈側風容易使車身晃動，請雙手緊握方向盤慢行；屈斜路湖砂湯湖邊有地熱湧泉，積雪融水濕滑，下階梯踩踏小心。",
			precautions: [
				"硫磺山噴氣孔周邊岩石附著硫磺結晶極燙，務必遵守步道圍欄切勿跨越",
				"知床沿海傍晚氣溫驟降，停車後關妥車窗並拉緊車門防強風吹翻車門鉸鏈",
				"斜里前往宇登呂路段沿海浪花凍結成冰，切忌急超車"
			]
		},
		spots: [
			{
				id: "d7-1",
				time: "08:00",
				duration: "停留 01:00",
				name: "La Vista 飯店渡假村 阿寒川釧路 出發",
				nameJa: "ホテル出発",
				category: "transport",
				description: "在被白雪覆蓋的阿寒川晨曦中甦醒，享用豐盛日式早點後退房出發，展開神秘雙湖與道東極境之旅。",
				tags: [{
					type: "must_photo",
					label: "阿寒川清晨白雪繚繞溪谷"
				}],
				mapQuery: "La Vista Akangawa Resort",
				parkingInfo: "出發前工作人員協助將愛車車頂積雪掃淨",
				gasInfo: "沿途弟子屈町有 ENEOS 與出光加油站",
				tip: "早晨山區路面最容易有「薄冰黑冰」，起步請緩踩油門輕踩煞車。"
			},
			{
				id: "d7-2",
				time: "09:58",
				duration: "停留 01:00",
				name: "屈斜路湖（砂湯/天鵝）",
				nameJa: "屈斜路湖 砂湯（すなゆ）",
				category: "sightseeing",
				description: "日本最大火山口湖！湖畔砂灘只要輕輕一挖就有滾燙溫泉湧出。成群遠從西伯利亞飛來的野生黃嘴天鵝優雅棲息在冒煙湖面上。",
				tags: [{
					type: "must_photo",
					label: "天鵝優雅游在冒煙雪湖上的夢幻仙境"
				}, {
					type: "must_eat",
					label: "砂湯売店自煮高溫溫泉蛋"
				}],
				mapQuery: "Kussharo Lake Sunayu",
				mapCode: "638 148 559*00",
				parkingInfo: "砂湯前大型免費停車場",
				gasInfo: "弟子屈町市區加油站（距此 15 分鐘）",
				tip: "可以自備小塑膠鏟體驗在雪地砂灘挖溫泉，雙腳泡入熱呼呼的天然足湯！"
			},
			{
				id: "d7-3",
				time: "11:26",
				duration: "停留 01:00",
				name: "摩周湖（第一展望台）",
				nameJa: "摩周湖 第一展望台",
				category: "sightseeing",
				description: "世界透明度第二的「神之湖」！四周是陡峭絕壁，在終年霧氣籠罩中展現攝人心魄的深藍色（摩周藍），雪山絕景令人窒息。",
				tags: [{
					type: "must_photo",
					label: "雪峰懸崖環抱深邃無比的摩周藍"
				}, {
					type: "must_eat",
					label: "摩周藍特調霜淇淋"
				}],
				mapQuery: "Lake Mashu First Observatory",
				mapCode: "613 781 430*88",
				parkingInfo: "展望台大型收費停車場（與硫磺山共用聯票，冬季常免費或優惠）",
				gasInfo: "川湯溫泉周邊加油站",
				tip: "冬季因空氣乾燥澄澈，看見「清晰無霧摩周湖」的機率比夏天高出許多！"
			},
			{
				id: "d7-4",
				time: "12:41",
				duration: "停留 01:00",
				name: "硫磺山休息中心",
				nameJa: "硫黄山レストハウス（アトサヌプリ）",
				category: "food",
				description: "愛努語意為「赤裸的山」。整座火山寸草不生，數百個高溫噴氣孔在雪原中轟鳴噴湧濃烈黃色硫磺蒸氣，視覺效果震撼。",
				tags: [{
					type: "must_photo",
					label: "近距離與巨大噴氣硫磺結晶孔合影"
				}, {
					type: "must_eat",
					label: "利用地熱高溫蒸氣現煮的硫磺山溫泉名物蛋"
				}],
				mapQuery: "Mt Io Rest House Teshikaga",
				mapCode: "731 713 798*22",
				parkingInfo: "硫磺山專用超寬廣平底停車場",
				gasInfo: "川湯溫泉街 ENEOS 川湯 SS",
				tip: "剛出爐的溫泉蛋外殼帶有淡淡硫磺香，蛋白極嫩蛋黃膏香，搭配專屬食鹽絕配！"
			},
			{
				id: "d7-5",
				time: "14:44",
				duration: "停留 00:05",
				name: "通往天空之路 起點",
				nameJa: "天に続く道 スタート地点",
				category: "sightseeing",
				description: "全長 28.1 公里的筆直雪道！由於地形起伏綿延，公路如同直衝天際雲端一般，是道東自駕最具震撼張力的絕景大道。",
				tags: [{
					type: "must_photo",
					label: "由高處俯瞰筆直無盡伸向天空的雪白大道"
				}],
				mapQuery: "Road to the Sky Start Point Shari",
				mapCode: "894 769 180*22",
				parkingInfo: "起點木造展望台旁設有小型避車停車格（請打雙黃燈靠邊停妥）",
				gasInfo: "斜里町市區出光 / ENEOS 加油站（進知床半島最後大站）",
				tip: "此處風大請快拍快回車內，站在專用觀景木台上以長焦鏡頭壓縮路面，天空延伸感最強烈！"
			},
			{
				id: "d7-6",
				time: "15:17",
				duration: "停留 01:00",
				name: "『Lantern SHIRETOKO / ランタン知床』",
				nameJa: "ランタン知床",
				category: "hotel",
				description: "抵達知床半島宇登呂下榻！溫馨如家的原木風格旅宿，傍晚可在知床港口遠望鄂霍次克海壯闊夕陽。",
				tags: [{
					type: "must_photo",
					label: "知床半島世界遺產雪暮美景"
				}],
				mapQuery: "Lantern SHIRETOKO",
				mapCode: "894 855 491*44",
				parkingInfo: "旅店專用免費平面停車位（面海風大務必緊抓車門）",
				gasInfo: "宇登呂港旁 ENEOS 宇登呂 SS（知床半島唯一補給站，營業至 18:00）",
				tip: "今天走完通往天空之路後於 15:17 提早入住，好好泡澡暖身，明天探索知床五湖！"
			}
		]
	},
	{
		dayNumber: 8,
		date: "11/18",
		dayOfWeek: "週三",
		title: "知床世界自然遺產巡禮",
		area: "知床國立公園 ＆ 宇登呂",
		routeHighlight: "知床五湖高架木棧道 ➔ 湖畔絕景展望台 ➔ 知床峠遠眺羅臼岳 ➔ 哥吉拉奇岩 ➔ 返回知床民宿",
		hotel: {
			name: "『Lantern SHIRETOKO / ランタン知床』",
			nameJa: "ランタン知床",
			checkInNote: "連住知床第二晚，免除搬運行李舟車勞頓，悠閒感受大自然",
			address: "北海道斜里郡斜里町ウトロ東",
			mapQuery: "Lantern SHIRETOKO",
			parking: "旅館門前附設免費平面停車位"
		},
		snowTip: {
			title: "【重要通路管制】知床橫斷道路（知床峠）夜間閉鎖與降雪封路",
			roadCondition: "知床峠（標高 738m）11 月下旬常因積雪或夜間凍結實施閉鎖（通常傍晚至隔晨封閉）。",
			tempRange: "-6°C ~ 0°C（知床峠頂可達 -10°C）",
			freezeLevel: "極高危險",
			daylightNote: "日落時間 16:02！山區風大下午極冷，建議上午完成高架木棧道與知床峠巡禮。",
			detail: "出發前請先至宇登呂旅客中心或線上查詢知床橫斷道路（國道 334 號）最新通阻公告。若知床峠因雪封閉，則以五湖與海灣奇岩為主，切勿擅闖管制路段。知床高架木棧道鋪有通電防熊鐵絲網，請勿倚靠外側欄杆。",
			precautions: [
				"知床五湖高架木棧道無遮蔽，防風抗寒手套與毛帽是標配",
				"知床峠隘口狂風極大，開車門務必用另一手緊抓把手以免被強風外翻損壞",
				"傍晚返回宇登呂港口品嚐知床野生鮭魚卵與花咲蟹晚餐"
			]
		},
		spots: [
			{
				id: "d8-1",
				time: "08:00",
				duration: "停留 01:00",
				name: "知床五湖（高架木棧道）",
				nameJa: "知床五湖 高架木道",
				category: "sightseeing",
				description: "全長 800 公尺通往一湖的全天候無障礙高架木棧道！兩側設有電氣防熊鐵絲網，漫步其上飽覽一湖的銀白結冰水面與倒映知床連山。",
				tags: [{
					type: "must_photo",
					label: "高架木道直通壯麗白雪知床連山"
				}, {
					type: "must_buy",
					label: "知床野生動物明信片與知床熊油霜"
				}],
				mapQuery: "Shiretoko Goko Lakes",
				mapCode: "757 749 687*33",
				parkingInfo: "知床五湖付費專用停車場（小客車 ¥500/次）",
				gasInfo: "宇登呂港 ENEOS 加油站",
				tip: "冬季地面湖水部分已結冰，純白積雪與後方羅臼岳、硫磺岳相映成趣，美到令人屏息。"
			},
			{
				id: "d8-2",
				time: "09:01",
				duration: "停留 01:00",
				name: "湖畔展望台",
				nameJa: "知床一湖 湖畔展望台",
				category: "sightseeing",
				description: "高架木棧道的終點觀景台！360 度零死角俯瞰一湖冰面、廣袤原始針葉林海與遠方遼闊的鄂霍次克海。",
				tags: [{
					type: "must_photo",
					label: "連山與雪湖同框大景"
				}],
				mapQuery: "Shiretoko First Lake Observatory",
				mapCode: "757 749 712*55",
				parkingInfo: "木棧道終點步行往返",
				gasInfo: "宇登呂港加油站",
				tip: "在這裡深呼吸全世界最純淨的大自然冷空氣，感受世界遺產的寂靜之美。"
			},
			{
				id: "d8-3",
				time: "10:28",
				duration: "停留 01:00",
				name: "知床峠展望台",
				nameJa: "知床峠（知床峠展望台）",
				category: "sightseeing",
				description: "橫跨知床半島東西的最高隘口！近距離仰望巍峨壯麗的「羅臼岳」雪白主峰，天晴時更可隔海遠眺北方四島（國後島）。",
				tags: [{
					type: "must_photo",
					label: "知床峠石碑同框雪白羅臼岳"
				}],
				mapQuery: "Shiretoko Pass Observatory",
				mapCode: "757 523 481*00",
				parkingInfo: "知床峠山頂大型免費公共停車場",
				gasInfo: "山頂無加油站",
				tip: "知床峠標高 738m，風速常達 8-10 級且極為酷寒，拍照時手機嚴防凍死關機。"
			},
			{
				id: "d8-4",
				time: "11:48",
				duration: "停留 01:00",
				name: "哥吉拉岩",
				nameJa: "ゴジラ岩（ウトロ港）",
				category: "sightseeing",
				description: "矗立在宇登呂港旁的巨大自然奇岩！高度達數十公尺，維妙維肖的巨型哥吉拉輪廓正傲視著滔滔大海，十分吸睛逗趣。",
				tags: [{
					type: "must_photo",
					label: "借位拍攝哥吉拉張嘴噴出雪花或烈火"
				}, {
					type: "must_eat",
					label: "宇登呂港旁漁協食堂鮭魚親子丼"
				}],
				mapQuery: "Godzilla Rock Utoro Shiretoko",
				mapCode: "894 855 072*88",
				parkingInfo: "宇登呂港口空地免費停車場",
				gasInfo: "港口 ENEOS 宇登呂 SS",
				tip: "走到港口邊緣以仰角拍攝哥吉拉岩岩石側面，嘴型與尖背棘刺神似度 100%！"
			},
			{
				id: "d8-5",
				time: "12:52",
				duration: "停留 01:00",
				name: "返回『Lantern SHIRETOKO / ランタン知床』",
				nameJa: "ランタン知床",
				category: "hotel",
				description: "結束精彩的大自然巡禮返回民宿休息。下午可於宇登呂港灣散策、去公眾溫泉「夕陽之湯」泡湯，品嚐在地海鮮居酒屋。",
				tags: [{
					type: "must_eat",
					label: "知床宇登呂產鹿肉石狩鍋"
				}],
				mapQuery: "Lantern SHIRETOKO",
				parkingInfo: "民宿專用停車位",
				gasInfo: "宇登呂港加油站補滿油箱",
				tip: "明天即將離開知床前往能取岬與網走，今晚把所有電池和相機充滿電。"
			}
		]
	},
	{
		dayNumber: 9,
		date: "11/19",
		dayOfWeek: "週四",
		title: "知床 ➔ 網走 ➔ 北見",
		area: "知床 ➔ 能取岬 ➔ 網走 ➔ 北見",
		routeHighlight: "能取岬黑白燈塔 ➔ 網走監獄博物館 ➔ 購物中心 ARCS 補給 ➔ 北見燒肉之都入住",
		hotel: {
			name: "Tabist Kitami Athlete Stays（北見）",
			nameJa: "Tabist 北見アスリートステイズ",
			checkInNote: "北見市區機能完備的商務旅店，鄰近北見著名的「燒肉一條街」！",
			address: "北海道北見市大通東",
			mapQuery: "Tabist Kitami Athlete Stays",
			parking: "附設專用收費/免費平面停車場（請依照櫃檯引導停入雪位）"
		},
		snowTip: {
			title: "能取岬鄂霍次克海強風吹雪 ＆ 北見市區融雪結冰",
			roadCondition: "能取岬突出於大海，風速強勁常引起吹雪使視距降至數米；北見夜間路面極易回凍。",
			tempRange: "-4°C ~ 3°C（夜間北見可達 -6°C）",
			freezeLevel: "警戒",
			daylightNote: "日落時間 16:03。網走至北見國道 39 號線傍晚車流量大，請減速跟車。",
			detail: "能取岬懸崖步道無遮蔽，海風吹起雪花如針刺，防風眼鏡或有帽緣的大衣十分實用；網走監獄博物館園區廣大，木造舍房內無強暖氣，參觀請全程著大衣穿厚襪。",
			precautions: [
				"能取岬步道踩踏在防腐木棧道上，表面有薄霜注意防滑",
				"網走監獄內脫鞋參觀區域地底冰冷，請穿厚毛襪",
				"北見是全日本燒肉店密度最高的城市，今晚務必品嚐道地炭火牛生內臟與牛五花"
			]
		},
		spots: [
			{
				id: "d9-1",
				time: "08:00",
				duration: "停留 01:00",
				name: "『Lantern SHIRETOKO / ランタン知床』出發",
				nameJa: "ホテル出発",
				category: "transport",
				description: "收拾行囊，告別純淨知床。沿著鄂霍次克海國道一路向西，前往黑白燈塔守護的能取岬。",
				tags: [{
					type: "must_photo",
					label: "告別知床的晴空白雪港灣"
				}],
				mapQuery: "Lantern SHIRETOKO",
				parkingInfo: "出發前退房並刷除車身殘雪",
				gasInfo: "斜里町市區有大規模 ENEOS 加油站",
				tip: "沿海公路常有海浪打上海堤隨風飄散的鹽霧，沿路適時噴防凍雨刷水清洗前擋。"
			},
			{
				id: "d9-2",
				time: "10:31",
				duration: "停留 01:00",
				name: "能取岬",
				nameJa: "能取岬（のとろみさき）",
				category: "sightseeing",
				description: "電影《非誠勿擾》知名取景地！突入鄂霍次克海的斷崖絕壁，八角形黑白條紋燈塔在廣大雪原與蔚藍大海間傲然屹立。",
				tags: [{
					type: "must_photo",
					label: "黑白八角燈塔、懸崖與無垠鄂霍次克海大景"
				}, {
					type: "must_eat",
					label: "自備熱保溫瓶在燈塔前喝熱煎茶"
				}],
				mapQuery: "Cape Notoro Abashiri",
				mapCode: "992 119 509*00",
				parkingInfo: "能取岬燈塔入口附設免費停車場與洗手間",
				gasInfo: "網走市區加油站（距此 15 分鐘）",
				tip: "海角風力強勁，帽子務必抓好或繫好防風繩，沿著白雪步道走向燈塔拍出壯闊孤獨美感！"
			},
			{
				id: "d9-3",
				time: "11:54",
				duration: "停留 01:00",
				name: "網走監獄博物館",
				nameJa: "博物館 網走監獄",
				category: "activity",
				description: "歷史沉澱的著名野外博物館！保存明治時代收容重刑犯的五翼放射狀木造舍房，逼真蠟像生動重現開闢北海道艱辛公路的歷史。",
				tags: [
					{
						type: "must_photo",
						label: "網走監獄紅磚正門、五翼放射狀舍房通道"
					},
					{
						type: "must_eat",
						label: "監獄食堂體驗正統「監獄御膳體驗餐（烤秋刀魚定食）」"
					},
					{
						type: "must_buy",
						label: "脫獄王白鳥由榮周邊、監獄限定明信片"
					}
				],
				mapQuery: "Museum Abashiri Prison",
				mapCode: "305 585 539*44",
				parkingInfo: "博物館門口超大型免費停車場",
				gasInfo: "國道 39 號線 ENEOS 網走湖 SS",
				tip: "監獄食堂提供的餐點用料極為實在味美，白米與麥飯香 Q，搭配道產烤魚超有特色！"
			},
			{
				id: "d9-4",
				time: "13:39",
				duration: "停留 01:00",
				name: "購物中心 ARCS（網走/北見）",
				nameJa: "スーパーアークス",
				category: "shopping",
				description: "北海道東部大型連鎖超市商場！採購途中補給品、北海道特產夕張哈密瓜果凍、北見特產洋蔥湯包與新鮮水果。",
				tags: [{
					type: "must_buy",
					label: "北見名產洋蔥即溶濃湯（全日本第一產地）"
				}, {
					type: "must_eat",
					label: "北海道牛乳香濃布丁"
				}],
				mapQuery: "Super Arcs Kitami",
				mapCode: "185 572 491*22",
				parkingInfo: "大型購物中心免費廣闊平面停車場",
				gasInfo: "北見中央通出光加油站",
				tip: "北見是全日本洋蔥產量第一的故鄉，當地的洋蔥濃湯包加熱水泡開甘甜無比，送禮自用皆宜！"
			},
			{
				id: "d9-5",
				time: "14:47",
				duration: "停留 01:00",
				name: "Tabist Kitami Athlete Stays",
				nameJa: "Tabist 北見アスリートステイズ",
				category: "hotel",
				description: "抵達北見飯店 Check-in！稍作整理後，晚上步行前往北見著名的「燒肉一條街」品嚐炭火直烤七輪燒肉。",
				tags: [{
					type: "must_eat",
					label: "北見在地人激推：炭火七輪燒肉生內臟與生啤酒"
				}],
				mapQuery: "Tabist Kitami Athlete Stays",
				mapCode: "185 513 328*66",
				parkingInfo: "飯店專屬停車位（立起前後雨刷）",
				gasInfo: "北見市區加油站密集",
				tip: "北見有「燒肉之都」美譽，推薦名店「味覺園」或「四條屋」，新鮮沾醬極度過癮！"
			}
		]
	},
	{
		dayNumber: 10,
		date: "11/20",
		dayOfWeek: "週五",
		title: "北見 ➔ 層雲峽黑岳 ➔ 旭川",
		area: "北見 ➔ 石北峠 ➔ 層雲峽 ➔ 旭川",
		routeHighlight: "石北峠越嶺高山 ➔ 大雪山黑岳五合目纜車 ➔ 壯觀銀河冰瀑 ➔ AEON 旭川血拼 ➔ 旭川市區入住",
		hotel: {
			name: "THE VELLMORE（旭川）",
			nameJa: "THE VELLMORE 旭川",
			checkInNote: "旭川市中心精品風格設計旅店，緊鄰買物公園步行街與旭川拉麵名店",
			address: "北海道旭川市宮下通",
			mapQuery: "THE VELLMORE Asahikawa",
			parking: "飯店特約平面收費停車場（一晚約 ¥1,000）"
		},
		snowTip: {
			title: "【高難度高山隘口】國道 39 號石北峠（標高 1,050m）極度結冰警報",
			roadCondition: "石北峠為北海道險峻高山隘口，連續髮夾彎、壓實粉雪結冰、能見度隨時驟降。",
			tempRange: "-8°C ~ 1°C（石北峠隘口約 -12°C）",
			freezeLevel: "極高危險",
			daylightNote: "日落時間 16:05。務必在 11:00 前完成石北峠通行，黑岳山頂 13:00 後極速轉冷。",
			detail: "行經石北峠時全時掛入 4WD，入彎前充分減速至 30-40km/h，彎道中絕對「禁止猛踩煞車」或「猛打方向盤」，順應車身動量自然過彎。層雲峽黑岳纜車五合目展望台常有強風，請拉緊防風大衣拉鍊。",
			precautions: [
				"石北峠隘口遇除雪工程車慢速作業時，請耐心跟在後方保持 50m 車距，切勿強行超車",
				"黑岳五合目走木造步道需穿冰爪或防滑鞋套",
				"銀河瀑布停車場周圍有落雪，切勿靠近屋簷或陡坡下方"
			]
		},
		spots: [
			{
				id: "d10-1",
				time: "08:00",
				duration: "停留 01:00",
				name: "Tabist Kitami Athlete Stays 出發",
				nameJa: "ホテル出発",
				category: "transport",
				description: "早晨整裝出發！今天將翻越壯麗大雪山國立公園石北峠隘口，前往峽谷奇景層雲峽。",
				tags: [{
					type: "must_photo",
					label: "北見清晨霧淞晨景"
				}],
				mapQuery: "Tabist Kitami Athlete Stays",
				parkingInfo: "出發前徹底刷除前擋風玻璃結霜與輪胎周圍積雪",
				gasInfo: "出北見市區前務必加滿油箱！高山山路耗油加倍",
				tip: "確認車內暖氣、除霧功能運作正常，車距保持平時的兩倍以上。"
			},
			{
				id: "d10-2",
				time: "10:44",
				duration: "停留 01:00",
				name: "大雪山層雲峽黑岳纜車 層雲峽站",
				nameJa: "大雪山層雲峡・黒岳ロープウェイ",
				category: "activity",
				description: "搭乘大型空中纜車直上標高 1,300 公尺的黑岳五合目！遠眺巍峨雪白的大雪山連峰，俯瞰層雲峽銀白絕壁峽谷。",
				tags: [{
					type: "must_photo",
					label: "纜車空中俯瞰銀白大雪山針葉樹冰原"
				}, {
					type: "must_eat",
					label: "五合目休息室現烤香脆黑岳燒餅與熱可可"
				}],
				mapQuery: "Daisetsuzan Kurodake Ropeway Sounkyo",
				mapCode: "623 204 482*55",
				parkingInfo: "層雲峽纜車站旁免費專屬大型停車場",
				gasInfo: "層雲峽溫泉街小型加油站",
				tip: "纜車站五合目氣溫常低於 -8°C，保暖防風面罩與手套必不可少。"
			},
			{
				id: "d10-3",
				time: "11:49",
				duration: "停留 01:00",
				name: "銀河瀑布",
				nameJa: "銀河の滝・流星の滝",
				category: "sightseeing",
				description: "日本瀑布百選！落差達 120 公尺的銀白水流在寒冬中逐漸凍結成壯觀巨型冰瀑柱，宛如白絹垂掛在險峻石柱岩壁上。",
				tags: [{
					type: "must_photo",
					label: "冰晶懸掛的巨大銀河瀑布與雙瀑台"
				}, {
					type: "must_eat",
					label: "銀河休息中心溫熱甘酒"
				}],
				mapQuery: "Ginga and Ryusei Falls Sounkyo",
				mapCode: "623 177 644*88",
				parkingInfo: "瀑布前免費休息站大型停車場",
				gasInfo: "國道 39 號線沿路加油站",
				tip: "冬季瀑布周邊常凝結成冰雪奇景，站在木造展望台遠眺雙瀑最為壯麗。"
			},
			{
				id: "d10-4",
				time: "14:06",
				duration: "停留 01:00",
				name: "AEON 旭川站前店",
				nameJa: "イオンモール旭川駅前",
				category: "shopping",
				description: "與 JR 旭川車站直通的大型購物中心！擁有超齊全的北海道伴手禮專區（柳月三方六、六花亭、Royce）、服飾與超市。",
				tags: [{
					type: "must_buy",
					label: "柳月「三方六」白樺木年輪蛋糕、旭川拉麵伴手禮禮盒"
				}, {
					type: "must_eat",
					label: "美食街旭川在地名店醬油拉麵"
				}],
				mapQuery: "Aeon Mall Asahikawa Ekimae",
				mapCode: "79 342 344*22",
				parkingInfo: "AEON 站前室內大型立體停車場（購物可折抵停車費，免受風雪凍車）",
				gasInfo: "旭川市區加油極方便",
				tip: "室內立體停車場非常溫暖，可以趁機讓愛車融化底盤積冰，逛街採買也極為舒適！"
			},
			{
				id: "d10-5",
				time: "15:21",
				duration: "停留 01:00",
				name: "THE VELLMORE（旭川）",
				nameJa: "THE VELLMORE 旭川",
				category: "hotel",
				description: "抵達旭川市區飯店 Check-in！稍作休息後，晚上步行前往買物公園，品嚐聞名全日本的旭川黑醬油拉麵（梅光軒/青葉）。",
				tags: [{
					type: "must_eat",
					label: "旭川名物：青葉旭川醬油拉麵、蜂屋焦香豬油拉麵"
				}],
				mapQuery: "THE VELLMORE Asahikawa",
				mapCode: "79 342 788*11",
				parkingInfo: "飯店特約平面收費停車場",
				gasInfo: "旭川市區加油站",
				tip: "明天是重頭戲「旭山動物園企鵝散步」，今晚早點就寢養足精神！"
			}
		]
	},
	{
		dayNumber: 11,
		date: "11/21",
		dayOfWeek: "週六",
		title: "旭山動物園 ➔ 砂川休息站 ➔ 札幌",
		area: "旭川 ➔ 砂川 ➔ 札幌市區",
		routeHighlight: "超人氣企鵝雪地散步（深度4hr） ➔ 砂川北菓樓妖精之森泡芙 ➔ 返回札幌公寓入住",
		hotel: {
			name: "UCHI Living Stay PLAZA S4W12（札幌）",
			nameJa: "UCHI Living Stay PLAZA S4W12",
			checkInNote: "札幌中央區現代無人自助公寓，空間大、設備齊全，最後兩天在札幌舒適休憩",
			address: "北海道札幌市中央区南4条西12丁目",
			mapQuery: "UCHI Living Stay PLAZA S4W12 Sapporo",
			parking: "周邊多處 Times 24h 平面收費停車場（夜間最大收費約 ¥800-1000）"
		},
		snowTip: {
			title: "旭川極低溫 ＆ 道央自動車道（旭川至札幌）高架橫風",
			roadCondition: "旭川清晨氣溫常破 -8°C；道央高速道路遇除雪時速限常降至 50-80 km/h。",
			tempRange: "-7°C ~ 2°C",
			freezeLevel: "警戒",
			daylightNote: "日落時間 16:15。午後行駛高速公路，遇夕照與雪面反光請備妥太陽眼鏡。",
			detail: "旭山動物園企鵝散步在戶外雪道舉行，人潮眾多需在雪地站立等候 30-40 分鐘，腳底接觸積雪冰冷極快，務必貼上「鞋底暖暖包」！高速公路行駛遇前車除雪噴濺雪水時，拉大車距隨時啟動雨刷噴水。",
			precautions: [
				"企鵝散步請蹲下安靜觀賞，切勿越過紅線、嚴禁使用閃光燈",
				"道央高速公路砂川 SA 設有全日本最北的高速公路綠洲，適合深度休息採買",
				"回到札幌市區請注意路口行人與路面黑冰"
			]
		},
		spots: [
			{
				id: "d11-1",
				time: "08:00",
				duration: "停留 01:00",
				name: "THE VELLMORE 出發",
				nameJa: "ホテル出発",
				category: "transport",
				description: "退房整裝出發！前往全日本最具人氣的行為展示動物園「旭山動物園」。",
				tags: [{
					type: "must_photo",
					label: "旭川清晨雪都出發"
				}],
				mapQuery: "THE VELLMORE Asahikawa",
				parkingInfo: "出發前退房並取車",
				gasInfo: "旭川市區出光加油站加滿油",
				tip: "早點抵達動物園門口排隊，可搶先卡位第一排觀賞企鵝雪地散步！"
			},
			{
				id: "d11-2",
				time: "10:00",
				duration: "停留 04:00",
				name: "旭山動物園（企鵝散步）",
				nameJa: "旭川市旭山動物園",
				category: "activity",
				description: "【深度停留 4 小時完整體驗】冬季人氣最高企鵝雪地大遊行！國王企鵝挺著圓滾滾肚皮在雪道大步搖擺前進。更可走訪海豹垂直圓柱水槽、北極熊巨大透明水池與雪鴞。",
				tags: [
					{
						type: "must_photo",
						label: "國王企鵝在面前 50 公分處搖頭晃腦走過雪道"
					},
					{
						type: "must_buy",
						label: "旭山動物園限定企鵝雪人徽章、手繪繪本"
					},
					{
						type: "must_eat",
						label: "園區限定旭川醬油拉麵與特濃男山清酒甘酒"
					}
				],
				mapQuery: "Asahiyama Zoo Asahikawa",
				mapCode: "79 358 845*44",
				parkingInfo: "動物園正門有免費市營停車場，東門設有大型收費停車場（¥500）",
				gasInfo: "動物園通沿線加油站",
				tip: "企鵝散步依積雪狀況通常於上午 11:00 與下午 14:30 展開，提前 20 分鐘在紅線兩側等候最優取景！"
			},
			{
				id: "d11-3",
				time: "15:18",
				duration: "停留 01:30",
				name: "砂川服務區（下行）",
				nameJa: "砂川サービスエリア（下り・砂川ハイウェイオアシス）",
				category: "food",
				description: "道央自動車道最受歡迎的高速公路綠洲！直接連結北菓樓砂川本店綠洲館，品嚐剛出爐限定泡芙、妖精之森年輪蛋糕與夕張哈密瓜甜點。",
				tags: [{
					type: "must_eat",
					label: "北菓樓限定脆皮泡芙「ピスコット」、夕張哈密瓜冰淇淋"
				}, {
					type: "must_buy",
					label: "北菓樓開拓おかき米果（增毛甜蝦、白糠柳葉魚口味）"
				}],
				mapQuery: "Sunagawa Service Area Expressway Hokkaido",
				mapCode: "179 469 773*11",
				parkingInfo: "高速公路休息站超大型免費停車場",
				gasInfo: "砂川 SA 內附設 24 小時出光高速公路加油站（可在此補滿油箱）",
				tip: "砂川休息站可經由專用匝道進出「砂川公路綠洲館」，不需要重複繳高速公路過路費！"
			},
			{
				id: "d11-4",
				time: "18:12",
				duration: "停留 01:00",
				name: "UCHI Living Stay PLAZA S4W12",
				nameJa: "UCHI Living Stay PLAZA S4W12",
				category: "hotel",
				description: "順利返回札幌市區！入住現代寬敞自助公寓，整理 11 天以來的豐富戰利品，今晚慶祝完成北海道大半圈平安自駕！",
				tags: [{
					type: "must_photo",
					label: "環島成功慶祝晚餐合影"
				}],
				mapQuery: "UCHI Living Stay PLAZA S4W12 Sapporo",
				mapCode: "9 491 582*44",
				parkingInfo: "周邊 Times 24h 平面停車場（夜間最大收費約 ¥900）",
				gasInfo: "市區南4条通加油站",
				tip: "公寓具備密碼自助 Check-in，進房後享受寬敞客廳與舒適大床。"
			}
		]
	},
	{
		dayNumber: 12,
		date: "11/22",
		dayOfWeek: "週日",
		title: "札幌 ➔ 札幌車站 ➔ 新千歲機場返程",
		area: "札幌 ➔ 新千歲機場",
		routeHighlight: "札幌市區出發 ➔ 札幌車站 JR Tower 最後採買 ➔ 新千歲機場國際線出境返家",
		snowTip: {
			title: "機場高速道路積雪車流 ＆ 返程還車滿油叮嚀",
			roadCondition: "札幌至新千歲機場（道央道）冬季若遇突發大雪可能降速或短暫封閉，請多預留 1 小時車程。",
			tempRange: "-2°C ~ 4°C",
			freezeLevel: "中等",
			daylightNote: "上午出發日光充足，注意融雪噴濺與路面水花。",
			detail: "還車前務必於租車公司指定的機場鄰近加油站加滿油（Keep Gas Receipt 保留收據），並在國際線起飛前至少 2.5 至 3 小時抵達機場辦理登機。新千歲機場伴手禮與免稅店極為好逛，預留充足時間享受！",
			precautions: [
				"機場還車前將所有個人物品、車上垃圾與 ETC 卡取下",
				"保留最後一次加滿油的加油發票（領収書）供租車人員查驗",
				"新千歲機場國內線 2 樓為甜點大道、3 樓為北海道拉麵道場，出境前好好品嚐"
			]
		},
		spots: [
			{
				id: "d12-1",
				time: "08:00",
				duration: "停留 01:00",
				name: "UCHI Living Stay PLAZA S4W12 出發",
				nameJa: "ホテル出発",
				category: "transport",
				description: "打包所有行囊與伴手禮，辦理自助退房，向美麗的冬日札幌道別。",
				tags: [{
					type: "must_photo",
					label: "收拾滿滿行李箱大功告成"
				}],
				mapQuery: "UCHI Living Stay PLAZA S4W12 Sapporo",
				parkingInfo: "停車場結清停車費",
				gasInfo: "準備前往札幌車站或機場",
				tip: "確認隨身貴重物品（護照、皮夾、駕照日文譯本正本、手機充電線）隨身攜帶。"
			},
			{
				id: "d12-2",
				time: "09:36",
				duration: "停留 01:00",
				name: "札幌車站",
				nameJa: "JR札幌駅 / JRタワー",
				category: "shopping",
				description: "北海道最大的交通與商業核心！在 Daimaru 大丸百貨、Stellar Place 與 PASEO 作最後衝刺採購。",
				tags: [{
					type: "must_buy",
					label: "北菓樓米果、LeTAO 雙層乳酪蛋糕、KINOTOYA 濃郁起司塔"
				}, {
					type: "must_eat",
					label: "KINOTOYA 新千歲/札幌極上特濃牛乳霜淇淋"
				}],
				mapQuery: "Sapporo Station JR Tower",
				mapCode: "9 552 277*88",
				parkingInfo: "JR Tower 專用地下大型停車場（購物享折抵）",
				gasInfo: "市區加油方便",
				tip: "KINOTOYA 的現烤起司塔熱熱吃會爆漿，冷藏吃如冰淇淋，是回國前必吃的神級甜點！"
			},
			{
				id: "d12-3",
				time: "11:24",
				duration: "停留 01:00",
				name: "新千歲機場（抵達國際線準備辦理登機出境手續）",
				nameJa: "新千歳空港 国際線（帰国手続き）",
				category: "transport",
				description: "平安抵達新千歲機場國際線航廈！辦理還車手續與行李托運，在機場拉麵道場享用最後一碗北海道味噌拉麵，滿載 12 天北海道冰雪回憶平安返國。",
				tags: [
					{
						type: "must_eat",
						label: "北海道拉麵道場「一幻拉麵」濃厚甜蝦湯頭"
					},
					{
						type: "must_buy",
						label: "Royce 生巧克力、白色戀人、薯條三兄弟免稅伴手禮"
					},
					{
						type: "must_photo",
						label: "機場哆啦A夢空中樂園與出境閘門紀念"
					}
				],
				mapQuery: "New Chitose Airport International Terminal",
				mapCode: "113 774 443*22",
				parkingInfo: "還車至 World Net 千歲機場營業所（有專車接駁至航廈）",
				gasInfo: "千歲機場前 ENEOS 千歲中央 SS 加滿油並保留收據",
				tip: "入關後免稅店可一次補齊 Royce 生巧克力保冷袋包裝，滿載而歸！期待下一次北國再見！"
			}
		]
	}
];
// node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
// src/components/ShimaEnagaSvg.tsx
var import_jsx_runtime = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
})))();
var ShimaEnagaSvg = ({ className = "", size = 56, mood = "happy" }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 100 100",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: `select-none ${className}`,
		"aria-label": "北海道雪之精靈 銀喉長尾山雀 (シマエナガ)",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "50",
				cy: "88",
				rx: "30",
				ry: "6",
				fill: "#3B82F6",
				fillOpacity: "0.12"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "52",
				r: "36",
				fill: "#FFFFFF",
				stroke: "#E2E8F0",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M20 66 C10 74 12 84 18 84 C26 84 28 72 26 66 Z",
				fill: "#4A5568",
				stroke: "#2D3748",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "22",
				cy: "56",
				rx: "7",
				ry: "12",
				fill: "#718096",
				transform: "rotate(-15 22 56)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "78",
				cy: "56",
				rx: "7",
				ry: "12",
				fill: "#718096",
				transform: "rotate(15 78 56)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "50",
				cy: "56",
				rx: "26",
				ry: "24",
				fill: "#FAFCFF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M32 30 C32 18 68 18 68 30 Z",
				fill: "#3B82F6",
				stroke: "#2563EB",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "28",
				y: "27",
				width: "44",
				height: "7",
				rx: "3.5",
				fill: "#93C5FD"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "18",
				r: "5.5",
				fill: "#FFFFFF",
				stroke: "#DBEAFE",
				strokeWidth: "1.5"
			}),
			mood === "sleepy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M40 47 Q44 51 48 47",
				stroke: "#1E293B",
				strokeWidth: "2.5",
				strokeLinecap: "round"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M52 47 Q56 51 60 47",
				stroke: "#1E293B",
				strokeWidth: "2.5",
				strokeLinecap: "round"
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "43",
					cy: "46",
					r: "3.2",
					fill: "#1E293B"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "44.2",
					cy: "44.8",
					r: "1.1",
					fill: "#FFFFFF"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "57",
					cy: "46",
					r: "3.2",
					fill: "#1E293B"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "58.2",
					cy: "44.8",
					r: "1.1",
					fill: "#FFFFFF"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: "48,49 52,49 50,54",
				fill: "#D97706"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "37",
				cy: "52",
				rx: "4.5",
				ry: "3",
				fill: "#F472B6",
				fillOpacity: "0.45"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "63",
				cy: "52",
				rx: "4.5",
				ry: "3",
				fill: "#F472B6",
				fillOpacity: "0.45"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M44 84 L44 88 M41 87 L44 88 L47 87",
				stroke: "#EA580C",
				strokeWidth: "2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M56 84 L56 88 M53 87 L56 88 L59 87",
				stroke: "#EA580C",
				strokeWidth: "2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M50 22 L50 26 M48 24 L52 24",
				stroke: "#FFFFFF",
				strokeWidth: "1",
				strokeLinecap: "round"
			})
		]
	});
};
// node_modules/lucide-react/dist/esm/shared/src/utils.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var toCamelCase = (string) => string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase());
var toPascalCase = (string) => {
	const camelCase = toCamelCase(string);
	return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
	return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
var hasA11yProp = (props) => {
	for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
};
// node_modules/lucide-react/dist/esm/defaultAttributes.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
};
// node_modules/lucide-react/dist/esm/Icon.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Icon = (0, import_react.forwardRef)(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => (0, import_react.createElement)("svg", {
	ref,
	...defaultAttributes,
	width: size,
	height: size,
	stroke: color,
	strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
	className: mergeClasses("lucide", className),
	...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
	...rest
}, [...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)), ...Array.isArray(children) ? children : [children]]));
// node_modules/lucide-react/dist/esm/createLucideIcon.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var createLucideIcon = (iconName, iconNode) => {
	const Component = (0, import_react.forwardRef)(({ className, ...props }, ref) => (0, import_react.createElement)(Icon, {
		ref,
		iconNode,
		className: mergeClasses(`lucide-${toKebabCase(toPascalCase(iconName))}`, `lucide-${iconName}`, className),
		...props
	}));
	Component.displayName = toPascalCase(iconName);
	return Component;
};
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var BookOpen = createLucideIcon("book-open", [["path", {
	d: "M12 7v14",
	key: "1akyts"
}], ["path", {
	d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
	key: "ruj8y"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Calendar = createLucideIcon("calendar", [
	["path", {
		d: "M8 2v4",
		key: "1cmpym"
	}],
	["path", {
		d: "M16 2v4",
		key: "4m81vk"
	}],
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "4",
		rx: "2",
		key: "1hopcy"
	}],
	["path", {
		d: "M3 10h18",
		key: "8toen8"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Camera = createLucideIcon("camera", [["path", {
	d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
	key: "18u6gg"
}], ["circle", {
	cx: "12",
	cy: "13",
	r: "3",
	key: "1vg3eu"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Car = createLucideIcon("car", [
	["path", {
		d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
		key: "5owen"
	}],
	["circle", {
		cx: "7",
		cy: "17",
		r: "2",
		key: "u2ysq9"
	}],
	["path", {
		d: "M9 17h6",
		key: "r8uit2"
	}],
	["circle", {
		cx: "17",
		cy: "17",
		r: "2",
		key: "axvx0g"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Check = createLucideIcon("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronLeft = createLucideIcon("chevron-left", [["path", {
	d: "m15 18-6-6 6-6",
	key: "1wnfg3"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronRight = createLucideIcon("chevron-right", [["path", {
	d: "m9 18 6-6-6-6",
	key: "mthhwq"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleCheck = createLucideIcon("circle-check", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}], ["path", {
	d: "m9 12 2 2 4-4",
	key: "dzmm74"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Clock = createLucideIcon("clock", [["path", {
	d: "M12 6v6l4 2",
	key: "mmk7yg"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CloudSnow = createLucideIcon("cloud-snow", [
	["path", {
		d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",
		key: "1pljnt"
	}],
	["path", {
		d: "M8 15h.01",
		key: "a7atzg"
	}],
	["path", {
		d: "M8 19h.01",
		key: "puxtts"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}],
	["path", {
		d: "M12 21h.01",
		key: "h35vbk"
	}],
	["path", {
		d: "M16 15h.01",
		key: "rnfrdf"
	}],
	["path", {
		d: "M16 19h.01",
		key: "1vcnzz"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Compass = createLucideIcon("compass", [["path", {
	d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",
	key: "9ktpf1"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Copy = createLucideIcon("copy", [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2",
	key: "17jyea"
}], ["path", {
	d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	key: "zix9uf"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Download = createLucideIcon("download", [
	["path", {
		d: "M12 15V3",
		key: "m9g1x1"
	}],
	["path", {
		d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
		key: "ih7n3h"
	}],
	["path", {
		d: "m7 10 5 5 5-5",
		key: "brsn70"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ExternalLink = createLucideIcon("external-link", [
	["path", {
		d: "M15 3h6v6",
		key: "1q9fwt"
	}],
	["path", {
		d: "M10 14 21 3",
		key: "gplh6r"
	}],
	["path", {
		d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
		key: "a6xqqp"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FileCode = createLucideIcon("file-code", [
	["path", {
		d: "M10 12.5 8 15l2 2.5",
		key: "1tg20x"
	}],
	["path", {
		d: "m14 12.5 2 2.5-2 2.5",
		key: "yinavb"
	}],
	["path", {
		d: "M14 2v4a2 2 0 0 0 2 2h4",
		key: "tnqrlb"
	}],
	["path", {
		d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",
		key: "1mlx9k"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FileJson = createLucideIcon("file-json", [
	["path", {
		d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
		key: "1rqfz7"
	}],
	["path", {
		d: "M14 2v4a2 2 0 0 0 2 2h4",
		key: "tnqrlb"
	}],
	["path", {
		d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1",
		key: "1oajmo"
	}],
	["path", {
		d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1",
		key: "mpwhp6"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FileText = createLucideIcon("file-text", [
	["path", {
		d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
		key: "1rqfz7"
	}],
	["path", {
		d: "M14 2v4a2 2 0 0 0 2 2h4",
		key: "tnqrlb"
	}],
	["path", {
		d: "M10 9H8",
		key: "b1mrlr"
	}],
	["path", {
		d: "M16 13H8",
		key: "t4e002"
	}],
	["path", {
		d: "M16 17H8",
		key: "z1uh3a"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Fuel = createLucideIcon("fuel", [
	["path", {
		d: "M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5",
		key: "1wtuz0"
	}],
	["path", {
		d: "M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16",
		key: "e09ifn"
	}],
	["path", {
		d: "M2 21h13",
		key: "1x0fut"
	}],
	["path", {
		d: "M3 9h11",
		key: "1p7c0w"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var HardDrive = createLucideIcon("hard-drive", [
	["line", {
		x1: "22",
		x2: "2",
		y1: "12",
		y2: "12",
		key: "1y58io"
	}],
	["path", {
		d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
		key: "oot6mr"
	}],
	["line", {
		x1: "6",
		x2: "6.01",
		y1: "16",
		y2: "16",
		key: "sgf278"
	}],
	["line", {
		x1: "10",
		x2: "10.01",
		y1: "16",
		y2: "16",
		key: "1l4acy"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Hotel = createLucideIcon("hotel", [
	["path", {
		d: "M10 22v-6.57",
		key: "1wmca3"
	}],
	["path", {
		d: "M12 11h.01",
		key: "z322tv"
	}],
	["path", {
		d: "M12 7h.01",
		key: "1ivr5q"
	}],
	["path", {
		d: "M14 15.43V22",
		key: "1q2vjd"
	}],
	["path", {
		d: "M15 16a5 5 0 0 0-6 0",
		key: "o9wqvi"
	}],
	["path", {
		d: "M16 11h.01",
		key: "xkw8gn"
	}],
	["path", {
		d: "M16 7h.01",
		key: "1kdx03"
	}],
	["path", {
		d: "M8 11h.01",
		key: "1dfujw"
	}],
	["path", {
		d: "M8 7h.01",
		key: "1vti4s"
	}],
	["rect", {
		x: "4",
		y: "2",
		width: "16",
		height: "20",
		rx: "2",
		key: "1uxh74"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ImagePlus = createLucideIcon("image-plus", [
	["path", {
		d: "M16 5h6",
		key: "1vod17"
	}],
	["path", {
		d: "M19 2v6",
		key: "4bpg5p"
	}],
	["path", {
		d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5",
		key: "1ue2ih"
	}],
	["path", {
		d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
		key: "1xmnt7"
	}],
	["circle", {
		cx: "9",
		cy: "9",
		r: "2",
		key: "af1f0g"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Info = createLucideIcon("info", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M12 16v-4",
		key: "1dtifu"
	}],
	["path", {
		d: "M12 8h.01",
		key: "e9boi3"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var KeyRound = createLucideIcon("key-round", [["path", {
	d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
	key: "1s6t7t"
}], ["circle", {
	cx: "16.5",
	cy: "7.5",
	r: ".5",
	fill: "currentColor",
	key: "w0ekpg"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Landmark = createLucideIcon("landmark", [
	["path", {
		d: "M10 18v-7",
		key: "wt116b"
	}],
	["path", {
		d: "M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z",
		key: "1m329m"
	}],
	["path", {
		d: "M14 18v-7",
		key: "vav6t3"
	}],
	["path", {
		d: "M18 18v-7",
		key: "aexdmj"
	}],
	["path", {
		d: "M3 22h18",
		key: "8prr45"
	}],
	["path", {
		d: "M6 18v-7",
		key: "1ivflk"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var MapPin = createLucideIcon("map-pin", [["path", {
	d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
	key: "1r0f0z"
}], ["circle", {
	cx: "12",
	cy: "10",
	r: "3",
	key: "ilqhr7"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Map$1 = createLucideIcon("map", [
	["path", {
		d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
		key: "169xi5"
	}],
	["path", {
		d: "M15 5.764v15",
		key: "1pn4in"
	}],
	["path", {
		d: "M9 3.236v15",
		key: "1uimfh"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Maximize2 = createLucideIcon("maximize-2", [
	["path", {
		d: "M15 3h6v6",
		key: "1q9fwt"
	}],
	["path", {
		d: "m21 3-7 7",
		key: "1l2asr"
	}],
	["path", {
		d: "m3 21 7-7",
		key: "tjx5ai"
	}],
	["path", {
		d: "M9 21H3v-6",
		key: "wtvkvv"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Navigation = createLucideIcon("navigation", [["polygon", {
	points: "3 11 22 2 13 21 11 13 3 11",
	key: "1ltx0t"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var PhoneCall = createLucideIcon("phone-call", [
	["path", {
		d: "M13 2a9 9 0 0 1 9 9",
		key: "1itnx2"
	}],
	["path", {
		d: "M13 6a5 5 0 0 1 5 5",
		key: "11nki7"
	}],
	["path", {
		d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
		key: "9njp5v"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Save = createLucideIcon("save", [
	["path", {
		d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
		key: "1c8476"
	}],
	["path", {
		d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
		key: "1ydtos"
	}],
	["path", {
		d: "M7 3v4a1 1 0 0 0 1 1h7",
		key: "t51u73"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Send = createLucideIcon("send", [["path", {
	d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
	key: "1ffxy3"
}], ["path", {
	d: "m21.854 2.147-10.94 10.939",
	key: "12cjpa"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Settings = createLucideIcon("settings", [["path", {
	d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
	key: "1i5ecw"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Share2 = createLucideIcon("share-2", [
	["circle", {
		cx: "18",
		cy: "5",
		r: "3",
		key: "gq8acd"
	}],
	["circle", {
		cx: "6",
		cy: "12",
		r: "3",
		key: "w7nqdw"
	}],
	["circle", {
		cx: "18",
		cy: "19",
		r: "3",
		key: "1xt0gg"
	}],
	["line", {
		x1: "8.59",
		x2: "15.42",
		y1: "13.51",
		y2: "17.49",
		key: "47mynk"
	}],
	["line", {
		x1: "15.41",
		x2: "8.59",
		y1: "6.51",
		y2: "10.49",
		key: "1n3mei"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ShieldAlert = createLucideIcon("shield-alert", [
	["path", {
		d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
		key: "oel41y"
	}],
	["path", {
		d: "M12 8v4",
		key: "1got3b"
	}],
	["path", {
		d: "M12 16h.01",
		key: "1drbdi"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ShoppingBag = createLucideIcon("shopping-bag", [
	["path", {
		d: "M16 10a4 4 0 0 1-8 0",
		key: "1ltviw"
	}],
	["path", {
		d: "M3.103 6.034h17.794",
		key: "awc11p"
	}],
	["path", {
		d: "M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z",
		key: "o988cm"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Smartphone = createLucideIcon("smartphone", [["rect", {
	width: "14",
	height: "20",
	x: "5",
	y: "2",
	rx: "2",
	ry: "2",
	key: "1yt0o3"
}], ["path", {
	d: "M12 18h.01",
	key: "mhygvu"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Snowflake = createLucideIcon("snowflake", [
	["path", {
		d: "m10 20-1.25-2.5L6 18",
		key: "18frcb"
	}],
	["path", {
		d: "M10 4 8.75 6.5 6 6",
		key: "7mghy3"
	}],
	["path", {
		d: "m14 20 1.25-2.5L18 18",
		key: "1chtki"
	}],
	["path", {
		d: "m14 4 1.25 2.5L18 6",
		key: "1b4wsy"
	}],
	["path", {
		d: "m17 21-3-6h-4",
		key: "15hhxa"
	}],
	["path", {
		d: "m17 3-3 6 1.5 3",
		key: "11697g"
	}],
	["path", {
		d: "M2 12h6.5L10 9",
		key: "kv9z4n"
	}],
	["path", {
		d: "m20 10-1.5 2 1.5 2",
		key: "1swlpi"
	}],
	["path", {
		d: "M22 12h-6.5L14 15",
		key: "1mxi28"
	}],
	["path", {
		d: "m4 10 1.5 2L4 14",
		key: "k9enpj"
	}],
	["path", {
		d: "m7 21 3-6-1.5-3",
		key: "j8hb9u"
	}],
	["path", {
		d: "m7 3 3 6h4",
		key: "1otusx"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Sparkles = createLucideIcon("sparkles", [
	["path", {
		d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
		key: "1s2grr"
	}],
	["path", {
		d: "M20 2v4",
		key: "1rf3ol"
	}],
	["path", {
		d: "M22 4h-4",
		key: "gwowj6"
	}],
	["circle", {
		cx: "4",
		cy: "20",
		r: "2",
		key: "6kqj1y"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var SquareCheckBig = createLucideIcon("square-check-big", [["path", {
	d: "M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344",
	key: "2acyp4"
}], ["path", {
	d: "m9 11 3 3L22 4",
	key: "1pflzl"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var SquareParking = createLucideIcon("square-parking", [["rect", {
	width: "18",
	height: "18",
	x: "3",
	y: "3",
	rx: "2",
	key: "afitv7"
}], ["path", {
	d: "M9 17V7h4a3 3 0 0 1 0 6H9",
	key: "1dfk2c"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Square = createLucideIcon("square", [["rect", {
	width: "18",
	height: "18",
	x: "3",
	y: "3",
	rx: "2",
	key: "afitv7"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Sunset = createLucideIcon("sunset", [
	["path", {
		d: "M12 10V2",
		key: "16sf7g"
	}],
	["path", {
		d: "m4.93 10.93 1.41 1.41",
		key: "2a7f42"
	}],
	["path", {
		d: "M2 18h2",
		key: "j10viu"
	}],
	["path", {
		d: "M20 18h2",
		key: "wocana"
	}],
	["path", {
		d: "m19.07 10.93-1.41 1.41",
		key: "15zs5n"
	}],
	["path", {
		d: "M22 22H2",
		key: "19qnx5"
	}],
	["path", {
		d: "m16 6-4 4-4-4",
		key: "6wukr"
	}],
	["path", {
		d: "M16 18a4 4 0 0 0-8 0",
		key: "1lzouq"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Thermometer = createLucideIcon("thermometer", [["path", {
	d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z",
	key: "17jzev"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Trash2 = createLucideIcon("trash-2", [
	["path", {
		d: "M10 11v6",
		key: "nco0om"
	}],
	["path", {
		d: "M14 11v6",
		key: "outv1u"
	}],
	["path", {
		d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
		key: "miytrc"
	}],
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
		key: "e791ji"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var TriangleAlert = createLucideIcon("triangle-alert", [
	["path", {
		d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
		key: "wmoenq"
	}],
	["path", {
		d: "M12 9v4",
		key: "juzpu7"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Upload = createLucideIcon("upload", [
	["path", {
		d: "M12 3v12",
		key: "1x0j5s"
	}],
	["path", {
		d: "m17 8-5-5-5 5",
		key: "7q97r8"
	}],
	["path", {
		d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
		key: "ih7n3h"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Utensils = createLucideIcon("utensils", [
	["path", {
		d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2",
		key: "cjf0a3"
	}],
	["path", {
		d: "M7 2v20",
		key: "1473qp"
	}],
	["path", {
		d: "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7",
		key: "j28e5"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var X = createLucideIcon("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]);
// src/components/Header.tsx
var Header = ({ currentDay, totalDays, currentArea, onOpenQuickJump, onOpenShare, onOpenSettings }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 bg-white/92 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_rgba(59,130,246,0.06)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl mx-auto px-4 py-2.5 sm:py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#DBEAFE] border border-[#BFDBFE] p-0.5 flex items-center justify-center shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShimaEnagaSvg, {
							size: 38,
							mood: currentDay === 12 ? "sleepy" : "happy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3B82F6] text-[9px] font-bold text-white shadow-xs",
							children: "❄"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-bold tracking-wider text-[#3B82F6] uppercase",
									children: "Hokkaido Roadtrip"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-slate-300",
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-medium text-slate-500",
									children: "12 Days"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight flex items-center gap-1.5",
							children: ["北海道雪季自由行", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]",
								children: "繞半圈"
							})]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onOpenShare,
							className: "flex items-center gap-1 bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#2563EB] border border-slate-200 hover:border-[#93C5FD] active:scale-95 transition-all px-2.5 py-1.5 rounded-2xl cursor-pointer min-h-[38px]",
							title: "分享給同行旅伴",
							"aria-label": "分享給同行旅伴",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold hidden xs:inline",
								children: "分享"
							})]
						}),
						onOpenSettings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onOpenSettings,
							className: "flex items-center justify-center bg-[#F8FAFC] hover:bg-[#EFF6FF] text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-[#93C5FD] active:scale-95 transition-all w-9 h-9 rounded-2xl cursor-pointer",
							title: "旅程備份與設定",
							"aria-label": "旅程備份與設定",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "w-4 h-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onOpenQuickJump,
							className: "flex items-center gap-1.5 bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-slate-200 hover:border-[#93C5FD] active:scale-95 transition-all px-2.5 sm:px-3 py-1.5 rounded-2xl text-left cursor-pointer min-h-[38px]",
							title: "點擊切換天數",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] text-slate-400 font-medium",
									children: "進度"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs font-bold text-[#1E40AF]",
									children: [
										"D",
										currentDay,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-slate-400 font-normal",
											children: ["/ ", totalDays]
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-6 h-6 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#2563EB]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "w-3.5 h-3.5" })
							})]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 text-slate-500 font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "w-3.5 h-3.5 text-[#3B82F6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "11/11 (週三) – 11/22 (週日)" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 text-[#1E3A8A] font-semibold bg-[#EFF6FF] px-2 py-0.5 rounded-lg border border-[#DBEAFE]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "w-3 h-3 text-[#3B82F6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate max-w-[130px]",
						children: currentArea
					})]
				})]
			})]
		})
	});
};
// src/components/FloatingNav.tsx
var FloatingNav = ({ activeTab, onSelectTab, photoCount = 0 }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "主要導航",
		className: "fixed bottom-3 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-1.5 flex items-center justify-around gap-1",
			children: [
				{
					id: "itinerary",
					label: "行程",
					sublabel: "Itinerary",
					icon: Map$1
				},
				{
					id: "guide",
					label: "指南",
					sublabel: "Guide",
					icon: BookOpen
				},
				{
					id: "weather",
					label: "天氣",
					sublabel: "Weather & Snow",
					icon: CloudSnow
				},
				{
					id: "settings",
					label: "設定",
					sublabel: "Settings & Backup",
					icon: Settings
				}
			].map((tab) => {
				const isActive = activeTab === tab.id;
				const Icon = tab.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => onSelectTab(tab.id),
					className: `relative flex-1 py-2 px-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 min-h-[48px] select-none cursor-pointer ${isActive ? "bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white shadow-md shadow-blue-500/25 scale-[1.02]" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 active:scale-95"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: `w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`,
							strokeWidth: isActive ? 2.5 : 2
						}), tab.id === "itinerary" && photoCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -top-1 -right-2.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-xs",
							children: photoCount
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `text-[12px] font-bold tracking-tight mt-0.5 ${isActive ? "text-white" : "text-slate-700"}`,
						children: tab.label
					})]
				}, tab.id);
			})
		})
	});
};
// src/components/DaySelector.tsx
var DaySelector = ({ selectedDay, onSelectDay }) => {
	const scrollContainerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (scrollContainerRef.current) {
			const activeEl = scrollContainerRef.current.querySelector(`[data-day="${selectedDay}"]`);
			if (activeEl) activeEl.scrollIntoView({
				behavior: "smooth",
				inline: "center",
				block: "nearest"
			});
		}
	}, [selectedDay]);
	const handlePrev = () => {
		if (selectedDay > 1) onSelectDay(selectedDay - 1);
	};
	const handleNext = () => {
		if (selectedDay < ITINERARY_DATA.length) onSelectDay(selectedDay + 1);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bg-white/80 backdrop-blur-xs border-b border-slate-200/70 py-2.5 px-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl mx-auto flex items-center gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handlePrev,
					disabled: selectedDay === 1,
					"aria-label": "前一天",
					className: "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "w-5 h-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: scrollContainerRef,
					className: "flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth",
					children: ITINERARY_DATA.map((day) => {
						const isSelected = day.dayNumber === selectedDay;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-day": day.dayNumber,
							onClick: () => onSelectDay(day.dayNumber),
							className: `shrink-0 min-w-[72px] sm:min-w-[80px] py-1.5 px-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer text-center ${isSelected ? "bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] text-white shadow-md shadow-blue-500/20 scale-[1.03] ring-2 ring-[#93C5FD]" : "bg-[#F8FAFC] text-slate-600 hover:bg-slate-100 border border-slate-200/80 active:scale-95"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-0.5 text-[11px] font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Day ", day.dayNumber] }), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "w-2.5 h-2.5 text-blue-200 inline" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `text-[12px] font-bold ${isSelected ? "text-white" : "text-slate-800"}`,
									children: day.date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `text-[10px] font-medium leading-tight ${isSelected ? "text-blue-100" : "text-slate-400"}`,
									children: day.dayOfWeek
								})
							]
						}, day.dayNumber);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleNext,
					disabled: selectedDay === ITINERARY_DATA.length,
					"aria-label": "後一天",
					className: "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-5 h-5" })
				})
			]
		})
	});
};
// src/components/SpotCard.tsx
var CATEGORY_CONFIG = {
	food: {
		label: "美食必吃",
		icon: Utensils,
		color: "text-orange-600",
		bg: "bg-orange-50",
		border: "border-orange-200"
	},
	activity: {
		label: "體驗活動",
		icon: Sparkles,
		color: "text-indigo-600",
		bg: "bg-indigo-50",
		border: "border-indigo-200"
	},
	shopping: {
		label: "購物伴手",
		icon: ShoppingBag,
		color: "text-rose-600",
		bg: "bg-rose-50",
		border: "border-rose-200"
	},
	sightseeing: {
		label: "必訪名勝",
		icon: Landmark,
		color: "text-sky-700",
		bg: "bg-sky-50",
		border: "border-sky-200"
	},
	hotel: {
		label: "住宿旅宿",
		icon: Hotel,
		color: "text-emerald-700",
		bg: "bg-emerald-50",
		border: "border-emerald-200"
	},
	transport: {
		label: "交通移動",
		icon: Car,
		color: "text-blue-700",
		bg: "bg-blue-50",
		border: "border-blue-200"
	}
};
var SpotCard = ({ spot, index, isCompleted = false, onToggleComplete, photos, onAddPhoto, onDeletePhoto, onViewPhoto }) => {
	const fileInputRef = (0, import_react.useRef)(null);
	const [showDetails, setShowDetails] = (0, import_react.useState)(false);
	const cat = CATEGORY_CONFIG[spot.category] || CATEGORY_CONFIG.sightseeing;
	const CategoryIcon = cat.icon;
	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (file) onAddPhoto(spot.id, spot.name, file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};
	const handleOpenGoogleMaps = () => {
		const query = encodeURIComponent(spot.mapQuery || spot.name);
		window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: `relative bg-white rounded-3xl border transition-all duration-200 shadow-xs hover:shadow-md ${isCompleted ? "border-slate-200 bg-slate-50/70 opacity-90" : "border-slate-200/90 hover:border-[#93C5FD]"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 sm:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2 mb-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100/90 px-2.5 py-1 rounded-xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3.5 h-3.5 text-[#3B82F6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: spot.time
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/70",
								children: spot.duration
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cat.bg} ${cat.color} ${cat.border}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryIcon, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: cat.label })]
							})
						]
					}), onToggleComplete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onToggleComplete(spot.id),
						className: `p-1.5 rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${isCompleted ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"}`,
						title: isCompleted ? "標記為未到訪" : "標記已完成",
						"aria-label": isCompleted ? "標記為未到訪" : "標記已完成",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: `w-5 h-5 ${isCompleted ? "fill-emerald-600 text-white" : ""}` })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline gap-2 flex-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: `text-base sm:text-lg font-bold tracking-tight ${isCompleted ? "line-through text-slate-500" : "text-slate-900"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[#3B82F6] font-mono mr-1.5 text-sm",
								children: [index + 1, "."]
							}), spot.name]
						}), spot.nameJa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-slate-400 font-medium",
							children: spot.nameJa
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed",
						children: spot.description
					})]
				}),
				spot.tags && spot.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5 my-3",
					children: spot.tags.map((tag, tIdx) => {
						let tagStyle = "bg-amber-50 text-amber-800 border-amber-200/90";
						let iconChar = "🍽️";
						if (tag.type === "must_eat") {
							tagStyle = "bg-orange-50 text-orange-800 border-orange-200";
							iconChar = "🍴 必吃：";
						} else if (tag.type === "must_buy") {
							tagStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
							iconChar = "🛍️ 必買：";
						} else if (tag.type === "must_photo") {
							tagStyle = "bg-purple-50 text-purple-800 border-purple-200";
							iconChar = "📷 必拍：";
						}
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-xl border ${tagStyle} shadow-2xs`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mr-1",
								children: iconChar
							}), tag.label]
						}, tIdx);
					})
				}),
				spot.tip && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2.5 p-2.5 rounded-2xl bg-[#F0F7FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "leading-relaxed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold",
							children: "雪季秘笈："
						}), spot.tip]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 bg-[#F8FAFC] p-2.5 rounded-2xl border border-slate-200/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareParking, { className: "w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold text-slate-800 flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "停車情報" }), spot.mapCode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] font-mono text-slate-500 bg-slate-200/60 px-1 rounded",
									children: ["MC: ", spot.mapCode]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-slate-600 mt-0.5 text-[11px] leading-relaxed",
								children: spot.parkingInfo
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 bg-[#F8FAFC] p-2.5 rounded-2xl border border-slate-200/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fuel, { className: "w-4 h-4 text-amber-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-bold text-slate-800",
								children: "周邊加油站"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-slate-600 mt-0.5 text-[11px] leading-relaxed",
								children: spot.gasInfo
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 pt-2.5 border-t border-slate-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 text-xs font-bold text-slate-700",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "w-3.5 h-3.5 text-[#3B82F6]" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "本站旅記相簿" }),
								photos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] bg-[#EFF6FF] text-[#2563EB] px-1.5 py-0.2 rounded-full font-bold",
									children: photos.length
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2.5 py-1.5 rounded-xl border border-[#BFDBFE] transition-colors cursor-pointer active:scale-95",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "w-3.5 h-3.5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "拍照 / 上傳" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileInputRef,
									type: "file",
									accept: "image/*",
									capture: "environment",
									onChange: handleFileChange,
									className: "hidden"
								})
							]
						})]
					}), photos.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2 overflow-x-auto no-scrollbar py-1",
						children: photos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative shrink-0 group rounded-xl overflow-hidden border border-slate-200 shadow-2xs w-20 h-20 bg-slate-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: photo.imageUrl,
								alt: photo.caption || spot.name,
								referrerPolicy: "no-referrer",
								className: "w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => onViewPhoto(photo),
									className: "p-1 rounded-full bg-white/90 text-slate-800 hover:text-blue-600",
									title: "放大檢視",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "w-3.5 h-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => onDeletePhoto(photo.id),
									className: "p-1 rounded-full bg-white/90 text-red-600 hover:text-red-800",
									title: "刪除",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5" })
								})]
							})]
						}, photo.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-slate-400 italic py-1 flex items-center gap-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "尚未上傳照片，抵達時可拍照打卡記錄專屬雪景～" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3.5 pt-2 flex items-center justify-end gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleOpenGoogleMaps,
						className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer min-h-[44px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "w-4 h-4 fill-white/20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "開啟 Google Maps 導航" })]
					})
				})
			]
		})
	});
};
// src/components/SnowTipCard.tsx
var SnowTipCard = ({ snowTip, dayNumber }) => {
	const isHighRisk = snowTip.freezeLevel === "極高危險";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "每日雪況提示",
		className: `rounded-3xl border p-4 sm:p-5 relative overflow-hidden transition-all shadow-xs ${isHighRisk ? "bg-gradient-to-br from-[#FEF2F2] via-[#FFF1F2] to-[#EFF6FF] border-rose-300" : "bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#F0FDF4] border-[#BFDBFE]"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-2 right-2 text-blue-200/40 pointer-events-none select-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "w-24 h-24" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2 mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${isHighRisk ? "bg-rose-500 text-white" : "bg-[#2563EB] text-white"}`,
							children: isHighRisk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] font-bold uppercase tracking-wider text-slate-500",
							children: [
								"Day ",
								dayNumber,
								" 雪道行車防護"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm sm:text-base font-bold text-slate-900",
							children: snowTip.title
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${isHighRisk ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-blue-100 text-blue-800 border-blue-300"}`,
						children: ["結冰危險度：", snowTip.freezeLevel]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-200/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thermometer, { className: "w-4 h-4 text-blue-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-slate-800",
							children: "預估氣溫："
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-600 ml-1",
							children: snowTip.tempRange
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-200/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sunset, { className: "w-4 h-4 text-amber-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-slate-800",
							children: "日照提醒："
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-600 ml-1",
							children: snowTip.daylightNote
						})] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white/90 rounded-2xl p-3 border border-slate-200/90 mb-3 text-xs sm:text-sm text-slate-700 leading-relaxed",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-bold text-slate-900 mb-1 flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-3.5 h-3.5 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["道路狀況概要：", snowTip.roadCondition] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-600 leading-relaxed",
						children: snowTip.detail
					})]
				}),
				snowTip.precautions && snowTip.precautions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5 text-xs text-slate-700",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-bold text-slate-800 flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5 text-[#3B82F6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "今日重點叮嚀：" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1 pl-1",
						children: snowTip.precautions.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-1.5 text-slate-600",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#3B82F6] font-bold text-xs mt-0.5",
								children: "●"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "leading-snug",
								children: item
							})]
						}, idx))
					})]
				})
			]
		})]
	});
};
// src/components/HotelCard.tsx
var HotelCard = ({ hotel, dayNumber }) => {
	const handleNavigate = () => {
		const query = encodeURIComponent(hotel.mapQuery || hotel.name);
		window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-gradient-to-r from-emerald-50/70 via-white to-blue-50/40 rounded-3xl border border-emerald-200/80 p-4 sm:p-5 shadow-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hotel, { className: "w-4 h-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[10px] font-bold uppercase tracking-wider text-emerald-700",
						children: [
							"Day ",
							dayNumber,
							" 當日下榻旅宿"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm sm:text-base font-bold text-slate-900 leading-tight",
						children: hotel.name
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: handleNavigate,
					className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "導航" })]
				})]
			}),
			hotel.nameJa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-slate-500 font-medium pl-10 -mt-1 mb-2",
				children: hotel.nameJa
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5 text-xs text-slate-600 pl-1 mt-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-700 font-medium",
							children: hotel.address
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-1.5 bg-white/80 p-2.5 rounded-2xl border border-slate-200/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-slate-800",
								children: "入住備忘："
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-slate-600 ml-1",
								children: hotel.checkInNote
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-1.5 bg-white/80 p-2.5 rounded-2xl border border-slate-200/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareParking, { className: "w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-slate-800",
								children: "停車說明："
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-slate-600 ml-1",
								children: hotel.parking
							})]
						})]
					})
				]
			})
		]
	});
};
// src/components/PhotoModal.tsx
var PhotoModal = ({ photo, onClose, onDelete, onUpdateCaption }) => {
	if (!photo) return null;
	const [caption, setCaption] = (0, import_react.useState)(photo.caption || "");
	const [isEditing, setIsEditing] = (0, import_react.useState)(false);
	const [isSavedNotice, setIsSavedNotice] = (0, import_react.useState)(false);
	const handleSave = () => {
		onUpdateCaption(photo.id, caption);
		setIsEditing(false);
		setIsSavedNotice(true);
		setTimeout(() => setIsSavedNotice(false), 2e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					"aria-label": "關閉",
					className: "absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 sm:p-5 bg-[#FAFAF9]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: photo.imageUrl,
								alt: photo.caption || "旅記照片",
								referrerPolicy: "no-referrer",
								className: "w-full h-full object-contain"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 px-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs text-slate-500 mb-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 font-medium text-slate-600",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "w-3.5 h-3.5 text-[#3B82F6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate max-w-[180px]",
											children: photo.spotName || `Day ${photo.dayNumber} 旅程`
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 text-[11px] text-slate-400",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photo.dateStr })]
									})]
								}),
								isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										value: caption,
										onChange: (e) => setCaption(e.target.value),
										placeholder: "寫下這份雪國記憶（例如：超好吃、雪好大、企鵝好萌...）",
										rows: 3,
										className: "w-full text-xs sm:text-sm p-2 rounded-xl border border-[#93C5FD] focus:outline-hidden focus:ring-2 focus:ring-[#3B82F6] bg-white text-slate-800 resize-none",
										autoFocus: true
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setIsEditing(false),
											className: "px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100",
											children: "取消"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: handleSave,
											className: "px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "儲存心得" })]
										})]
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									onClick: () => setIsEditing(true),
									className: "mt-2 p-2 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-dashed border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group",
									title: "點擊編輯文字",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs sm:text-sm text-slate-700 italic leading-relaxed",
										children: caption || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-slate-400 not-italic",
											children: "✍️ 點擊這裡加入這張照片的旅遊心得記錄..."
										})
									})
								}),
								isSavedNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-center text-[11px] text-emerald-600 font-bold",
									children: "✓ 心得已成功保存！"
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 bg-white border-t border-slate-100 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							if (window.confirm("確定要刪除這張旅記照片嗎？")) {
								onDelete(photo.id);
								onClose();
							}
						},
						className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "刪除此照片" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer",
						children: "返回行程"
					})]
				})
			]
		})
	});
};
// node_modules/qrcode.react/lib/esm/index.js
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __spreadValues = (a, b) => {
	for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
	if (__getOwnPropSymbols) {
		for (var prop of __getOwnPropSymbols(b)) if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
	}
	return a;
};
var __objRest = (source, exclude) => {
	var target = {};
	for (var prop in source) if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0) target[prop] = source[prop];
	if (source != null && __getOwnPropSymbols) {
		for (var prop of __getOwnPropSymbols(source)) if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop)) target[prop] = source[prop];
	}
	return target;
};
/**
* @license QR Code generator library (TypeScript)
* Copyright (c) Project Nayuki.
* SPDX-License-Identifier: MIT
*/
var qrcodegen;
((qrcodegen2) => {
	const _QrCode = class _QrCode {
		constructor(version, errorCorrectionLevel, dataCodewords, msk) {
			this.version = version;
			this.errorCorrectionLevel = errorCorrectionLevel;
			this.modules = [];
			this.isFunction = [];
			if (version < _QrCode.MIN_VERSION || version > _QrCode.MAX_VERSION) throw new RangeError("Version value out of range");
			if (msk < -1 || msk > 7) throw new RangeError("Mask value out of range");
			this.size = version * 4 + 17;
			let row = [];
			for (let i = 0; i < this.size; i++) row.push(false);
			for (let i = 0; i < this.size; i++) {
				this.modules.push(row.slice());
				this.isFunction.push(row.slice());
			}
			this.drawFunctionPatterns();
			const allCodewords = this.addEccAndInterleave(dataCodewords);
			this.drawCodewords(allCodewords);
			if (msk == -1) {
				let minPenalty = 1e9;
				for (let i = 0; i < 8; i++) {
					this.applyMask(i);
					this.drawFormatBits(i);
					const penalty = this.getPenaltyScore();
					if (penalty < minPenalty) {
						msk = i;
						minPenalty = penalty;
					}
					this.applyMask(i);
				}
			}
			assert(0 <= msk && msk <= 7);
			this.mask = msk;
			this.applyMask(msk);
			this.drawFormatBits(msk);
			this.isFunction = [];
		}
		static encodeText(text, ecl) {
			const segs = qrcodegen2.QrSegment.makeSegments(text);
			return _QrCode.encodeSegments(segs, ecl);
		}
		static encodeBinary(data, ecl) {
			const seg = qrcodegen2.QrSegment.makeBytes(data);
			return _QrCode.encodeSegments([seg], ecl);
		}
		static encodeSegments(segs, ecl, minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true) {
			if (!(_QrCode.MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= _QrCode.MAX_VERSION) || mask < -1 || mask > 7) throw new RangeError("Invalid value");
			let version;
			let dataUsedBits;
			for (version = minVersion;; version++) {
				const dataCapacityBits2 = _QrCode.getNumDataCodewords(version, ecl) * 8;
				const usedBits = QrSegment.getTotalBits(segs, version);
				if (usedBits <= dataCapacityBits2) {
					dataUsedBits = usedBits;
					break;
				}
				if (version >= maxVersion) throw new RangeError("Data too long");
			}
			for (const newEcl of [
				_QrCode.Ecc.MEDIUM,
				_QrCode.Ecc.QUARTILE,
				_QrCode.Ecc.HIGH
			]) if (boostEcl && dataUsedBits <= _QrCode.getNumDataCodewords(version, newEcl) * 8) ecl = newEcl;
			let bb = [];
			for (const seg of segs) {
				appendBits(seg.mode.modeBits, 4, bb);
				appendBits(seg.numChars, seg.mode.numCharCountBits(version), bb);
				for (const b of seg.getData()) bb.push(b);
			}
			assert(bb.length == dataUsedBits);
			const dataCapacityBits = _QrCode.getNumDataCodewords(version, ecl) * 8;
			assert(bb.length <= dataCapacityBits);
			appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
			appendBits(0, (8 - bb.length % 8) % 8, bb);
			assert(bb.length % 8 == 0);
			for (let padByte = 236; bb.length < dataCapacityBits; padByte ^= 253) appendBits(padByte, 8, bb);
			let dataCodewords = [];
			while (dataCodewords.length * 8 < bb.length) dataCodewords.push(0);
			bb.forEach((b, i) => dataCodewords[i >>> 3] |= b << 7 - (i & 7));
			return new _QrCode(version, ecl, dataCodewords, mask);
		}
		getModule(x, y) {
			return 0 <= x && x < this.size && 0 <= y && y < this.size && this.modules[y][x];
		}
		getModules() {
			return this.modules;
		}
		drawFunctionPatterns() {
			for (let i = 0; i < this.size; i++) {
				this.setFunctionModule(6, i, i % 2 == 0);
				this.setFunctionModule(i, 6, i % 2 == 0);
			}
			this.drawFinderPattern(3, 3);
			this.drawFinderPattern(this.size - 4, 3);
			this.drawFinderPattern(3, this.size - 4);
			const alignPatPos = this.getAlignmentPatternPositions();
			const numAlign = alignPatPos.length;
			for (let i = 0; i < numAlign; i++) for (let j = 0; j < numAlign; j++) if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0)) this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
			this.drawFormatBits(0);
			this.drawVersion();
		}
		drawFormatBits(mask) {
			const data = this.errorCorrectionLevel.formatBits << 3 | mask;
			let rem = data;
			for (let i = 0; i < 10; i++) rem = rem << 1 ^ (rem >>> 9) * 1335;
			const bits = (data << 10 | rem) ^ 21522;
			assert(bits >>> 15 == 0);
			for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, getBit(bits, i));
			this.setFunctionModule(8, 7, getBit(bits, 6));
			this.setFunctionModule(8, 8, getBit(bits, 7));
			this.setFunctionModule(7, 8, getBit(bits, 8));
			for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, getBit(bits, i));
			for (let i = 0; i < 8; i++) this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
			for (let i = 8; i < 15; i++) this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
			this.setFunctionModule(8, this.size - 8, true);
		}
		drawVersion() {
			if (this.version < 7) return;
			let rem = this.version;
			for (let i = 0; i < 12; i++) rem = rem << 1 ^ (rem >>> 11) * 7973;
			const bits = this.version << 12 | rem;
			assert(bits >>> 18 == 0);
			for (let i = 0; i < 18; i++) {
				const color = getBit(bits, i);
				const a = this.size - 11 + i % 3;
				const b = Math.floor(i / 3);
				this.setFunctionModule(a, b, color);
				this.setFunctionModule(b, a, color);
			}
		}
		drawFinderPattern(x, y) {
			for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
				const dist = Math.max(Math.abs(dx), Math.abs(dy));
				const xx = x + dx;
				const yy = y + dy;
				if (0 <= xx && xx < this.size && 0 <= yy && yy < this.size) this.setFunctionModule(xx, yy, dist != 2 && dist != 4);
			}
		}
		drawAlignmentPattern(x, y) {
			for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
		}
		setFunctionModule(x, y, isDark) {
			this.modules[y][x] = isDark;
			this.isFunction[y][x] = true;
		}
		addEccAndInterleave(data) {
			const ver = this.version;
			const ecl = this.errorCorrectionLevel;
			if (data.length != _QrCode.getNumDataCodewords(ver, ecl)) throw new RangeError("Invalid argument");
			const numBlocks = _QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
			const blockEccLen = _QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
			const rawCodewords = Math.floor(_QrCode.getNumRawDataModules(ver) / 8);
			const numShortBlocks = numBlocks - rawCodewords % numBlocks;
			const shortBlockLen = Math.floor(rawCodewords / numBlocks);
			let blocks = [];
			const rsDiv = _QrCode.reedSolomonComputeDivisor(blockEccLen);
			for (let i = 0, k = 0; i < numBlocks; i++) {
				let dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
				k += dat.length;
				const ecc = _QrCode.reedSolomonComputeRemainder(dat, rsDiv);
				if (i < numShortBlocks) dat.push(0);
				blocks.push(dat.concat(ecc));
			}
			let result = [];
			for (let i = 0; i < blocks[0].length; i++) blocks.forEach((block, j) => {
				if (i != shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
			});
			assert(result.length == rawCodewords);
			return result;
		}
		drawCodewords(data) {
			if (data.length != Math.floor(_QrCode.getNumRawDataModules(this.version) / 8)) throw new RangeError("Invalid argument");
			let i = 0;
			for (let right = this.size - 1; right >= 1; right -= 2) {
				if (right == 6) right = 5;
				for (let vert = 0; vert < this.size; vert++) for (let j = 0; j < 2; j++) {
					const x = right - j;
					const y = (right + 1 & 2) == 0 ? this.size - 1 - vert : vert;
					if (!this.isFunction[y][x] && i < data.length * 8) {
						this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
						i++;
					}
				}
			}
			assert(i == data.length * 8);
		}
		applyMask(mask) {
			if (mask < 0 || mask > 7) throw new RangeError("Mask value out of range");
			for (let y = 0; y < this.size; y++) for (let x = 0; x < this.size; x++) {
				let invert;
				switch (mask) {
					case 0:
						invert = (x + y) % 2 == 0;
						break;
					case 1:
						invert = y % 2 == 0;
						break;
					case 2:
						invert = x % 3 == 0;
						break;
					case 3:
						invert = (x + y) % 3 == 0;
						break;
					case 4:
						invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
						break;
					case 5:
						invert = x * y % 2 + x * y % 3 == 0;
						break;
					case 6:
						invert = (x * y % 2 + x * y % 3) % 2 == 0;
						break;
					case 7:
						invert = ((x + y) % 2 + x * y % 3) % 2 == 0;
						break;
					default: throw new Error("Unreachable");
				}
				if (!this.isFunction[y][x] && invert) this.modules[y][x] = !this.modules[y][x];
			}
		}
		getPenaltyScore() {
			let result = 0;
			for (let y = 0; y < this.size; y++) {
				let runColor = false;
				let runX = 0;
				let runHistory = [
					0,
					0,
					0,
					0,
					0,
					0,
					0
				];
				for (let x = 0; x < this.size; x++) if (this.modules[y][x] == runColor) {
					runX++;
					if (runX == 5) result += _QrCode.PENALTY_N1;
					else if (runX > 5) result++;
				} else {
					this.finderPenaltyAddHistory(runX, runHistory);
					if (!runColor) result += this.finderPenaltyCountPatterns(runHistory) * _QrCode.PENALTY_N3;
					runColor = this.modules[y][x];
					runX = 1;
				}
				result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * _QrCode.PENALTY_N3;
			}
			for (let x = 0; x < this.size; x++) {
				let runColor = false;
				let runY = 0;
				let runHistory = [
					0,
					0,
					0,
					0,
					0,
					0,
					0
				];
				for (let y = 0; y < this.size; y++) if (this.modules[y][x] == runColor) {
					runY++;
					if (runY == 5) result += _QrCode.PENALTY_N1;
					else if (runY > 5) result++;
				} else {
					this.finderPenaltyAddHistory(runY, runHistory);
					if (!runColor) result += this.finderPenaltyCountPatterns(runHistory) * _QrCode.PENALTY_N3;
					runColor = this.modules[y][x];
					runY = 1;
				}
				result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * _QrCode.PENALTY_N3;
			}
			for (let y = 0; y < this.size - 1; y++) for (let x = 0; x < this.size - 1; x++) {
				const color = this.modules[y][x];
				if (color == this.modules[y][x + 1] && color == this.modules[y + 1][x] && color == this.modules[y + 1][x + 1]) result += _QrCode.PENALTY_N2;
			}
			let dark = 0;
			for (const row of this.modules) dark = row.reduce((sum, color) => sum + (color ? 1 : 0), dark);
			const total = this.size * this.size;
			const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
			assert(0 <= k && k <= 9);
			result += k * _QrCode.PENALTY_N4;
			assert(0 <= result && result <= 2568888);
			return result;
		}
		getAlignmentPatternPositions() {
			if (this.version == 1) return [];
			else {
				const numAlign = Math.floor(this.version / 7) + 2;
				const step = this.version == 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
				let result = [6];
				for (let pos = this.size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
				return result;
			}
		}
		static getNumRawDataModules(ver) {
			if (ver < _QrCode.MIN_VERSION || ver > _QrCode.MAX_VERSION) throw new RangeError("Version number out of range");
			let result = (16 * ver + 128) * ver + 64;
			if (ver >= 2) {
				const numAlign = Math.floor(ver / 7) + 2;
				result -= (25 * numAlign - 10) * numAlign - 55;
				if (ver >= 7) result -= 36;
			}
			assert(208 <= result && result <= 29648);
			return result;
		}
		static getNumDataCodewords(ver, ecl) {
			return Math.floor(_QrCode.getNumRawDataModules(ver) / 8) - _QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * _QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
		}
		static reedSolomonComputeDivisor(degree) {
			if (degree < 1 || degree > 255) throw new RangeError("Degree out of range");
			let result = [];
			for (let i = 0; i < degree - 1; i++) result.push(0);
			result.push(1);
			let root = 1;
			for (let i = 0; i < degree; i++) {
				for (let j = 0; j < result.length; j++) {
					result[j] = _QrCode.reedSolomonMultiply(result[j], root);
					if (j + 1 < result.length) result[j] ^= result[j + 1];
				}
				root = _QrCode.reedSolomonMultiply(root, 2);
			}
			return result;
		}
		static reedSolomonComputeRemainder(data, divisor) {
			let result = divisor.map((_) => 0);
			for (const b of data) {
				const factor = b ^ result.shift();
				result.push(0);
				divisor.forEach((coef, i) => result[i] ^= _QrCode.reedSolomonMultiply(coef, factor));
			}
			return result;
		}
		static reedSolomonMultiply(x, y) {
			if (x >>> 8 != 0 || y >>> 8 != 0) throw new RangeError("Byte out of range");
			let z = 0;
			for (let i = 7; i >= 0; i--) {
				z = z << 1 ^ (z >>> 7) * 285;
				z ^= (y >>> i & 1) * x;
			}
			assert(z >>> 8 == 0);
			return z;
		}
		finderPenaltyCountPatterns(runHistory) {
			const n = runHistory[1];
			assert(n <= this.size * 3);
			const core = n > 0 && runHistory[2] == n && runHistory[3] == n * 3 && runHistory[4] == n && runHistory[5] == n;
			return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
		}
		finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
			if (currentRunColor) {
				this.finderPenaltyAddHistory(currentRunLength, runHistory);
				currentRunLength = 0;
			}
			currentRunLength += this.size;
			this.finderPenaltyAddHistory(currentRunLength, runHistory);
			return this.finderPenaltyCountPatterns(runHistory);
		}
		finderPenaltyAddHistory(currentRunLength, runHistory) {
			if (runHistory[0] == 0) currentRunLength += this.size;
			runHistory.pop();
			runHistory.unshift(currentRunLength);
		}
	};
	_QrCode.MIN_VERSION = 1;
	_QrCode.MAX_VERSION = 40;
	_QrCode.PENALTY_N1 = 3;
	_QrCode.PENALTY_N2 = 3;
	_QrCode.PENALTY_N3 = 40;
	_QrCode.PENALTY_N4 = 10;
	_QrCode.ECC_CODEWORDS_PER_BLOCK = [
		[
			-1,
			7,
			10,
			15,
			20,
			26,
			18,
			20,
			24,
			30,
			18,
			20,
			24,
			26,
			30,
			22,
			24,
			28,
			30,
			28,
			28,
			28,
			28,
			30,
			30,
			26,
			28,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30
		],
		[
			-1,
			10,
			16,
			26,
			18,
			24,
			16,
			18,
			22,
			22,
			26,
			30,
			22,
			22,
			24,
			24,
			28,
			28,
			26,
			26,
			26,
			26,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28,
			28
		],
		[
			-1,
			13,
			22,
			18,
			26,
			18,
			24,
			18,
			22,
			20,
			24,
			28,
			26,
			24,
			20,
			30,
			24,
			28,
			28,
			26,
			30,
			28,
			30,
			30,
			30,
			30,
			28,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30
		],
		[
			-1,
			17,
			28,
			22,
			16,
			22,
			28,
			26,
			26,
			24,
			28,
			24,
			28,
			22,
			24,
			24,
			30,
			28,
			28,
			26,
			28,
			30,
			24,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30
		]
	];
	_QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
		[
			-1,
			1,
			1,
			1,
			1,
			1,
			2,
			2,
			2,
			2,
			4,
			4,
			4,
			4,
			4,
			6,
			6,
			6,
			6,
			7,
			8,
			8,
			9,
			9,
			10,
			12,
			12,
			12,
			13,
			14,
			15,
			16,
			17,
			18,
			19,
			19,
			20,
			21,
			22,
			24,
			25
		],
		[
			-1,
			1,
			1,
			1,
			2,
			2,
			4,
			4,
			4,
			5,
			5,
			5,
			8,
			9,
			9,
			10,
			10,
			11,
			13,
			14,
			16,
			17,
			17,
			18,
			20,
			21,
			23,
			25,
			26,
			28,
			29,
			31,
			33,
			35,
			37,
			38,
			40,
			43,
			45,
			47,
			49
		],
		[
			-1,
			1,
			1,
			2,
			2,
			4,
			4,
			6,
			6,
			8,
			8,
			8,
			10,
			12,
			16,
			12,
			17,
			16,
			18,
			21,
			20,
			23,
			23,
			25,
			27,
			29,
			34,
			34,
			35,
			38,
			40,
			43,
			45,
			48,
			51,
			53,
			56,
			59,
			62,
			65,
			68
		],
		[
			-1,
			1,
			1,
			2,
			4,
			4,
			4,
			5,
			6,
			8,
			8,
			11,
			11,
			16,
			16,
			18,
			16,
			19,
			21,
			25,
			25,
			25,
			34,
			30,
			32,
			35,
			37,
			40,
			42,
			45,
			48,
			51,
			54,
			57,
			60,
			63,
			66,
			70,
			74,
			77,
			81
		]
	];
	qrcodegen2.QrCode = _QrCode;
	function appendBits(val, len, bb) {
		if (len < 0 || len > 31 || val >>> len != 0) throw new RangeError("Value out of range");
		for (let i = len - 1; i >= 0; i--) bb.push(val >>> i & 1);
	}
	function getBit(x, i) {
		return (x >>> i & 1) != 0;
	}
	function assert(cond) {
		if (!cond) throw new Error("Assertion error");
	}
	const _QrSegment = class _QrSegment {
		constructor(mode, numChars, bitData) {
			this.mode = mode;
			this.numChars = numChars;
			this.bitData = bitData;
			if (numChars < 0) throw new RangeError("Invalid argument");
			this.bitData = bitData.slice();
		}
		static makeBytes(data) {
			let bb = [];
			for (const b of data) appendBits(b, 8, bb);
			return new _QrSegment(_QrSegment.Mode.BYTE, data.length, bb);
		}
		static makeNumeric(digits) {
			if (!_QrSegment.isNumeric(digits)) throw new RangeError("String contains non-numeric characters");
			let bb = [];
			for (let i = 0; i < digits.length;) {
				const n = Math.min(digits.length - i, 3);
				appendBits(parseInt(digits.substring(i, i + n), 10), n * 3 + 1, bb);
				i += n;
			}
			return new _QrSegment(_QrSegment.Mode.NUMERIC, digits.length, bb);
		}
		static makeAlphanumeric(text) {
			if (!_QrSegment.isAlphanumeric(text)) throw new RangeError("String contains unencodable characters in alphanumeric mode");
			let bb = [];
			let i = 0;
			for (; i + 2 <= text.length; i += 2) {
				let temp = _QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
				temp += _QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
				appendBits(temp, 11, bb);
			}
			if (i < text.length) appendBits(_QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
			return new _QrSegment(_QrSegment.Mode.ALPHANUMERIC, text.length, bb);
		}
		static makeSegments(text) {
			if (text == "") return [];
			else if (_QrSegment.isNumeric(text)) return [_QrSegment.makeNumeric(text)];
			else if (_QrSegment.isAlphanumeric(text)) return [_QrSegment.makeAlphanumeric(text)];
			else return [_QrSegment.makeBytes(_QrSegment.toUtf8ByteArray(text))];
		}
		static makeEci(assignVal) {
			let bb = [];
			if (assignVal < 0) throw new RangeError("ECI assignment value out of range");
			else if (assignVal < 128) appendBits(assignVal, 8, bb);
			else if (assignVal < 16384) {
				appendBits(2, 2, bb);
				appendBits(assignVal, 14, bb);
			} else if (assignVal < 1e6) {
				appendBits(6, 3, bb);
				appendBits(assignVal, 21, bb);
			} else throw new RangeError("ECI assignment value out of range");
			return new _QrSegment(_QrSegment.Mode.ECI, 0, bb);
		}
		static isNumeric(text) {
			return _QrSegment.NUMERIC_REGEX.test(text);
		}
		static isAlphanumeric(text) {
			return _QrSegment.ALPHANUMERIC_REGEX.test(text);
		}
		getData() {
			return this.bitData.slice();
		}
		static getTotalBits(segs, version) {
			let result = 0;
			for (const seg of segs) {
				const ccbits = seg.mode.numCharCountBits(version);
				if (seg.numChars >= 1 << ccbits) return Infinity;
				result += 4 + ccbits + seg.bitData.length;
			}
			return result;
		}
		static toUtf8ByteArray(str) {
			str = encodeURI(str);
			let result = [];
			for (let i = 0; i < str.length; i++) if (str.charAt(i) != "%") result.push(str.charCodeAt(i));
			else {
				result.push(parseInt(str.substring(i + 1, i + 3), 16));
				i += 2;
			}
			return result;
		}
	};
	_QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
	_QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
	_QrSegment.ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
	let QrSegment = _QrSegment;
	qrcodegen2.QrSegment = _QrSegment;
})(qrcodegen || (qrcodegen = {}));
((qrcodegen2) => {
	((QrCode2) => {
		const _Ecc = class _Ecc {
			constructor(ordinal, formatBits) {
				this.ordinal = ordinal;
				this.formatBits = formatBits;
			}
		};
		_Ecc.LOW = new _Ecc(0, 1);
		_Ecc.MEDIUM = new _Ecc(1, 0);
		_Ecc.QUARTILE = new _Ecc(2, 3);
		_Ecc.HIGH = new _Ecc(3, 2);
		QrCode2.Ecc = _Ecc;
	})(qrcodegen2.QrCode || (qrcodegen2.QrCode = {}));
})(qrcodegen || (qrcodegen = {}));
((qrcodegen2) => {
	((QrSegment2) => {
		const _Mode = class _Mode {
			constructor(modeBits, numBitsCharCount) {
				this.modeBits = modeBits;
				this.numBitsCharCount = numBitsCharCount;
			}
			numCharCountBits(ver) {
				return this.numBitsCharCount[Math.floor((ver + 7) / 17)];
			}
		};
		_Mode.NUMERIC = new _Mode(1, [
			10,
			12,
			14
		]);
		_Mode.ALPHANUMERIC = new _Mode(2, [
			9,
			11,
			13
		]);
		_Mode.BYTE = new _Mode(4, [
			8,
			16,
			16
		]);
		_Mode.KANJI = new _Mode(8, [
			8,
			10,
			12
		]);
		_Mode.ECI = new _Mode(7, [
			0,
			0,
			0
		]);
		QrSegment2.Mode = _Mode;
	})(qrcodegen2.QrSegment || (qrcodegen2.QrSegment = {}));
})(qrcodegen || (qrcodegen = {}));
var qrcodegen_default = qrcodegen;
/**
* @license qrcode.react
* Copyright (c) Paul O'Shannessy
* SPDX-License-Identifier: ISC
*/
var ERROR_LEVEL_MAP = {
	L: qrcodegen_default.QrCode.Ecc.LOW,
	M: qrcodegen_default.QrCode.Ecc.MEDIUM,
	Q: qrcodegen_default.QrCode.Ecc.QUARTILE,
	H: qrcodegen_default.QrCode.Ecc.HIGH
};
var DEFAULT_SIZE = 128;
var DEFAULT_LEVEL = "L";
var DEFAULT_BGCOLOR = "#FFFFFF";
var DEFAULT_FGCOLOR = "#000000";
var DEFAULT_INCLUDEMARGIN = false;
var DEFAULT_MINVERSION = 1;
var SPEC_MARGIN_SIZE = 4;
var DEFAULT_MARGIN_SIZE = 0;
var DEFAULT_IMG_SCALE = .1;
function generatePath(modules, margin = 0) {
	const ops = [];
	modules.forEach(function(row, y) {
		let start = null;
		row.forEach(function(cell, x) {
			if (!cell && start !== null) {
				ops.push(`M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`);
				start = null;
				return;
			}
			if (x === row.length - 1) {
				if (!cell) return;
				if (start === null) ops.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`);
				else ops.push(`M${start + margin},${y + margin} h${x + 1 - start}v1H${start + margin}z`);
				return;
			}
			if (cell && start === null) start = x;
		});
	});
	return ops.join("");
}
function excavateModules(modules, excavation) {
	return modules.slice().map((row, y) => {
		if (y < excavation.y || y >= excavation.y + excavation.h) return row;
		return row.map((cell, x) => {
			if (x < excavation.x || x >= excavation.x + excavation.w) return cell;
			return false;
		});
	});
}
function getImageSettings(cells, size, margin, imageSettings) {
	if (imageSettings == null) return null;
	const numCells = cells.length + margin * 2;
	const defaultSize = Math.floor(size * DEFAULT_IMG_SCALE);
	const scale = numCells / size;
	const w = (imageSettings.width || defaultSize) * scale;
	const h = (imageSettings.height || defaultSize) * scale;
	const x = imageSettings.x == null ? cells.length / 2 - w / 2 : imageSettings.x * scale;
	const y = imageSettings.y == null ? cells.length / 2 - h / 2 : imageSettings.y * scale;
	const opacity = imageSettings.opacity == null ? 1 : imageSettings.opacity;
	let excavation = null;
	if (imageSettings.excavate) {
		let floorX = Math.floor(x);
		let floorY = Math.floor(y);
		excavation = {
			x: floorX,
			y: floorY,
			w: Math.ceil(w + x - floorX),
			h: Math.ceil(h + y - floorY)
		};
	}
	const crossOrigin = imageSettings.crossOrigin;
	return {
		x,
		y,
		h,
		w,
		excavation,
		opacity,
		crossOrigin
	};
}
function getMarginSize(includeMargin, marginSize) {
	if (marginSize != null) return Math.max(Math.floor(marginSize), 0);
	return includeMargin ? SPEC_MARGIN_SIZE : DEFAULT_MARGIN_SIZE;
}
function useQRCode({ value, level, minVersion, includeMargin, marginSize, imageSettings, size, boostLevel }) {
	let qrcode = import_react.useMemo(() => {
		const segments = (Array.isArray(value) ? value : [value]).reduce((accum, v) => {
			accum.push(...qrcodegen_default.QrSegment.makeSegments(v));
			return accum;
		}, []);
		return qrcodegen_default.QrCode.encodeSegments(segments, ERROR_LEVEL_MAP[level], minVersion, void 0, void 0, boostLevel);
	}, [
		value,
		level,
		minVersion,
		boostLevel
	]);
	const { cells, margin, numCells, calculatedImageSettings } = import_react.useMemo(() => {
		let cells2 = qrcode.getModules();
		const margin2 = getMarginSize(includeMargin, marginSize);
		return {
			cells: cells2,
			margin: margin2,
			numCells: cells2.length + margin2 * 2,
			calculatedImageSettings: getImageSettings(cells2, size, margin2, imageSettings)
		};
	}, [
		qrcode,
		size,
		imageSettings,
		includeMargin,
		marginSize
	]);
	return {
		qrcode,
		margin,
		cells,
		numCells,
		calculatedImageSettings
	};
}
var SUPPORTS_PATH2D = function() {
	try {
		new Path2D().addPath(new Path2D());
	} catch (e) {
		return false;
	}
	return true;
}();
var QRCodeCanvas = import_react.forwardRef(function QRCodeCanvas2(props, forwardedRef) {
	const _a = props, { value, size = DEFAULT_SIZE, level = DEFAULT_LEVEL, bgColor = DEFAULT_BGCOLOR, fgColor = DEFAULT_FGCOLOR, includeMargin = DEFAULT_INCLUDEMARGIN, minVersion = DEFAULT_MINVERSION, boostLevel, marginSize, imageSettings } = _a;
	const _b = __objRest(_a, [
		"value",
		"size",
		"level",
		"bgColor",
		"fgColor",
		"includeMargin",
		"minVersion",
		"boostLevel",
		"marginSize",
		"imageSettings"
	]), { style } = _b, otherProps = __objRest(_b, ["style"]);
	const imgSrc = imageSettings == null ? void 0 : imageSettings.src;
	const _canvas = import_react.useRef(null);
	const _image = import_react.useRef(null);
	const setCanvasRef = import_react.useCallback((node) => {
		_canvas.current = node;
		if (typeof forwardedRef === "function") forwardedRef(node);
		else if (forwardedRef) forwardedRef.current = node;
	}, [forwardedRef]);
	const [isImgLoaded, setIsImageLoaded] = import_react.useState(false);
	const { margin, cells, numCells, calculatedImageSettings } = useQRCode({
		value,
		level,
		minVersion,
		boostLevel,
		includeMargin,
		marginSize,
		imageSettings,
		size
	});
	import_react.useEffect(() => {
		if (_canvas.current != null) {
			const canvas = _canvas.current;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			let cellsToDraw = cells;
			const image = _image.current;
			const haveImageToRender = calculatedImageSettings != null && image !== null && image.complete && image.naturalHeight !== 0 && image.naturalWidth !== 0;
			if (haveImageToRender) {
				if (calculatedImageSettings.excavation != null) cellsToDraw = excavateModules(cells, calculatedImageSettings.excavation);
			}
			const pixelRatio = window.devicePixelRatio || 1;
			canvas.height = canvas.width = size * pixelRatio;
			const scale = size / numCells * pixelRatio;
			ctx.scale(scale, scale);
			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, numCells, numCells);
			ctx.fillStyle = fgColor;
			if (SUPPORTS_PATH2D) ctx.fill(new Path2D(generatePath(cellsToDraw, margin)));
			else cells.forEach(function(row, rdx) {
				row.forEach(function(cell, cdx) {
					if (cell) ctx.fillRect(cdx + margin, rdx + margin, 1, 1);
				});
			});
			if (calculatedImageSettings) ctx.globalAlpha = calculatedImageSettings.opacity;
			if (haveImageToRender) ctx.drawImage(image, calculatedImageSettings.x + margin, calculatedImageSettings.y + margin, calculatedImageSettings.w, calculatedImageSettings.h);
		}
	});
	import_react.useEffect(() => {
		setIsImageLoaded(false);
	}, [imgSrc]);
	const canvasStyle = __spreadValues({
		height: size,
		width: size
	}, style);
	let img = null;
	if (imgSrc != null) img = /* @__PURE__ */ import_react.createElement("img", {
		src: imgSrc,
		key: imgSrc,
		style: { display: "none" },
		onLoad: () => {
			setIsImageLoaded(true);
		},
		ref: _image,
		crossOrigin: calculatedImageSettings == null ? void 0 : calculatedImageSettings.crossOrigin
	});
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, /* @__PURE__ */ import_react.createElement("canvas", __spreadValues({
		style: canvasStyle,
		height: size,
		width: size,
		ref: setCanvasRef,
		role: "img"
	}, otherProps)), img);
});
QRCodeCanvas.displayName = "QRCodeCanvas";
var QRCodeSVG = import_react.forwardRef(function QRCodeSVG2(props, forwardedRef) {
	const _a = props, { value, size = DEFAULT_SIZE, level = DEFAULT_LEVEL, bgColor = DEFAULT_BGCOLOR, fgColor = DEFAULT_FGCOLOR, includeMargin = DEFAULT_INCLUDEMARGIN, minVersion = DEFAULT_MINVERSION, boostLevel, title, marginSize, imageSettings } = _a, otherProps = __objRest(_a, [
		"value",
		"size",
		"level",
		"bgColor",
		"fgColor",
		"includeMargin",
		"minVersion",
		"boostLevel",
		"title",
		"marginSize",
		"imageSettings"
	]);
	const { margin, cells, numCells, calculatedImageSettings } = useQRCode({
		value,
		level,
		minVersion,
		boostLevel,
		includeMargin,
		marginSize,
		imageSettings,
		size
	});
	let cellsToDraw = cells;
	let image = null;
	if (imageSettings != null && calculatedImageSettings != null) {
		if (calculatedImageSettings.excavation != null) cellsToDraw = excavateModules(cells, calculatedImageSettings.excavation);
		image = /* @__PURE__ */ import_react.createElement("image", {
			href: imageSettings.src,
			height: calculatedImageSettings.h,
			width: calculatedImageSettings.w,
			x: calculatedImageSettings.x + margin,
			y: calculatedImageSettings.y + margin,
			preserveAspectRatio: "none",
			opacity: calculatedImageSettings.opacity,
			crossOrigin: calculatedImageSettings.crossOrigin
		});
	}
	const fgPath = generatePath(cellsToDraw, margin);
	return /* @__PURE__ */ import_react.createElement("svg", __spreadValues({
		height: size,
		width: size,
		viewBox: `0 0 ${numCells} ${numCells}`,
		ref: forwardedRef,
		role: "img"
	}, otherProps), !!title && /* @__PURE__ */ import_react.createElement("title", null, title), /* @__PURE__ */ import_react.createElement("path", {
		fill: bgColor,
		d: `M0,0 h${numCells}v${numCells}H0z`,
		shapeRendering: "crispEdges"
	}), /* @__PURE__ */ import_react.createElement("path", {
		fill: fgColor,
		d: fgPath,
		shapeRendering: "crispEdges"
	}), image);
});
QRCodeSVG.displayName = "QRCodeSVG";
// src/components/ShareModal.tsx
var ShareModal = ({ isOpen, onClose }) => {
	if (!isOpen) return null;
	const [copied, setCopied] = (0, import_react.useState)(false);
	const appUrl = typeof window !== "undefined" ? window.location.origin : "https://ais-pre-jaoyywwk6ssdfm2k3g45ju-800085840605.asia-northeast1.run.app";
	const handleCopy = () => {
		navigator.clipboard?.writeText(appUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2500);
	};
	const handleNativeShare = async () => {
		if (navigator.share) try {
			await navigator.share({
				title: "北海道雪季自由行 12Days 行程隨身導覽",
				text: "這是我做的北海道 12 天雪季繞半圈行程隨身 App，裡面有精確動線、Google Maps 導航、停車加油情報與每日雪況提示！",
				url: appUrl
			});
		} catch (err) {
			handleCopy();
		}
		else handleCopy();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-3xl w-full max-w-sm sm:max-w-md p-5 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[90vh]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					"aria-label": "關閉",
					className: "absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#BFDBFE] flex items-center justify-center shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShimaEnagaSvg, {
							size: 32,
							mood: "happy"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-bold text-[#2563EB] uppercase tracking-wider",
						children: "Share With Friends"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base sm:text-lg font-bold text-slate-900 leading-tight",
						children: "傳送給同行旅伴"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-y-auto space-y-4 pr-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-3 bg-white rounded-2xl shadow-xs border border-slate-200/90 inline-block mb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeSVG, {
									value: appUrl,
									size: 160,
									level: "M",
									includeMargin: false,
									imageSettings: {
										src: "",
										x: void 0,
										y: void 0,
										height: 24,
										width: 24,
										excavate: true
									}
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-600 font-medium",
								children: "請朋友打開手機相機掃描 QR Code 即可立即開啟！"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold text-slate-700 block",
								children: "專屬分享網址："
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 bg-slate-50 p-2 rounded-2xl border border-slate-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									readOnly: true,
									value: appUrl,
									className: "w-full bg-transparent text-xs text-slate-600 font-mono focus:outline-hidden px-1 select-all truncate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: handleCopy,
									className: `shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[36px] ${copied ? "bg-emerald-600 text-white" : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white active:scale-95"}`,
									children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "已複製" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "複製" })] })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleNativeShare,
							className: "w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "透過 LINE / 通訊軟體分享給旅伴" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1 leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-bold flex items-center gap-1 text-amber-950",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-3.5 h-3.5 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "小秘笈：如何像 App 一樣加入手機桌面？" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "pl-4 list-disc space-y-0.5 text-[11px] text-amber-900/90",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "iPhone (Safari)" }), "：點擊底部的「分享按鈕（方形箭頭）」➔ 選擇「加入主畫面」。"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Android (Chrome)" }), "：點擊右上角「三個點」➔ 選擇「安裝應用程式」或「新增至主畫面」。"] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-amber-700/80 pt-0.5",
									children: "加到桌面後點開就像原生 App 一樣全螢幕運作，自駕導航超順手！"
								})
							]
						})
					]
				})
			]
		})
	});
};
// src/data/guideData.ts
var INITIAL_CHECKLIST = [
	{
		id: "doc-1",
		category: "證件",
		text: "護照 X4",
		recommended: true
	},
	{
		id: "doc-2",
		category: "證件",
		text: "電子機票",
		recommended: true
	},
	{
		id: "doc-3",
		category: "證件",
		text: "外幣",
		recommended: true
	},
	{
		id: "doc-4",
		category: "證件",
		text: "健保卡",
		recommended: true
	},
	{
		id: "doc-5",
		category: "證件",
		text: "網卡",
		recommended: true
	},
	{
		id: "doc-6",
		category: "證件",
		text: "信用卡",
		recommended: true
	},
	{
		id: "doc-7",
		category: "證件",
		text: "台幣",
		recommended: true
	},
	{
		id: "doc-8",
		category: "證件",
		text: "駕照正本",
		recommended: true
	},
	{
		id: "doc-9",
		category: "證件",
		text: "日譯本駕照",
		recommended: true
	},
	{
		id: "doc-10",
		category: "證件",
		text: "日幣現金",
		recommended: true
	},
	{
		id: "doc-11",
		category: "證件",
		text: "家裡鑰匙",
		recommended: true
	},
	{
		id: "elec-1",
		category: "電子用品",
		text: "手機",
		recommended: true
	},
	{
		id: "elec-2",
		category: "電子用品",
		text: "充電線",
		recommended: true
	},
	{
		id: "elec-3",
		category: "電子用品",
		text: "轉接頭",
		recommended: true
	},
	{
		id: "elec-4",
		category: "電子用品",
		text: "延長線",
		recommended: true
	},
	{
		id: "elec-5",
		category: "電子用品",
		text: "自拍棒",
		recommended: false
	},
	{
		id: "elec-6",
		category: "電子用品",
		text: "腳架",
		recommended: false
	},
	{
		id: "elec-7",
		category: "電子用品",
		text: "車用手機架",
		recommended: true
	},
	{
		id: "elec-8",
		category: "電子用品",
		text: "行動電源",
		recommended: true
	},
	{
		id: "elec-9",
		category: "電子用品",
		text: "旅行電水壺、鍋",
		recommended: false
	},
	{
		id: "daily-1",
		category: "日用品",
		text: "眼鏡",
		recommended: true
	},
	{
		id: "daily-2",
		category: "日用品",
		text: "隱形眼鏡、藥水",
		recommended: true
	},
	{
		id: "daily-3",
		category: "日用品",
		text: "頸枕",
		recommended: false
	},
	{
		id: "daily-4",
		category: "日用品",
		text: "文具用品",
		recommended: false
	},
	{
		id: "daily-5",
		category: "日用品",
		text: "指甲剪、小剪刀",
		recommended: true
	},
	{
		id: "daily-6",
		category: "日用品",
		text: "面紙",
		recommended: true
	},
	{
		id: "daily-7",
		category: "日用品",
		text: "保溫瓶",
		recommended: true
	},
	{
		id: "daily-8",
		category: "日用品",
		text: "暖暖包",
		recommended: true
	},
	{
		id: "wash-1",
		category: "盥洗用品",
		text: "洗面乳",
		recommended: true
	},
	{
		id: "wash-2",
		category: "盥洗用品",
		text: "潤髮乳、護髮霜",
		recommended: true
	},
	{
		id: "wash-3",
		category: "盥洗用品",
		text: "牙刷、牙膏",
		recommended: true
	},
	{
		id: "wash-4",
		category: "盥洗用品",
		text: "梳子",
		recommended: true
	},
	{
		id: "wash-5",
		category: "盥洗用品",
		text: "髮圈",
		recommended: true
	},
	{
		id: "cloth-1",
		category: "衣物",
		text: "上衣 ( )件",
		recommended: true
	},
	{
		id: "cloth-2",
		category: "衣物",
		text: "褲子 ( )件",
		recommended: true
	},
	{
		id: "cloth-3",
		category: "衣物",
		text: "裙子 ( )件",
		recommended: false
	},
	{
		id: "cloth-4",
		category: "衣物",
		text: "內衣褲 ( )件",
		recommended: true
	},
	{
		id: "cloth-5",
		category: "衣物",
		text: "睡衣",
		recommended: true
	},
	{
		id: "cloth-6",
		category: "衣物",
		text: "鞋子 ( )雙",
		recommended: true
	},
	{
		id: "cloth-7",
		category: "衣物",
		text: "襪子 ( )雙",
		recommended: true
	},
	{
		id: "cloth-8",
		category: "衣物",
		text: "帽子",
		recommended: true
	},
	{
		id: "cloth-9",
		category: "衣物",
		text: "圍巾",
		recommended: true
	},
	{
		id: "cloth-10",
		category: "衣物",
		text: "手套",
		recommended: true
	},
	{
		id: "cloth-11",
		category: "衣物",
		text: "發熱衣",
		recommended: true
	},
	{
		id: "cloth-12",
		category: "衣物",
		text: "泳衣",
		recommended: false
	},
	{
		id: "care-1",
		category: "保養品",
		text: "化妝水",
		recommended: true
	},
	{
		id: "care-2",
		category: "保養品",
		text: "乳液",
		recommended: true
	},
	{
		id: "care-3",
		category: "保養品",
		text: "防曬乳",
		recommended: true
	},
	{
		id: "care-4",
		category: "保養品",
		text: "化妝鏡",
		recommended: false
	},
	{
		id: "care-5",
		category: "保養品",
		text: "化妝品",
		recommended: false
	},
	{
		id: "kid-1",
		category: "兒童行李",
		text: "紗布被子",
		recommended: true
	},
	{
		id: "kid-2",
		category: "兒童行李",
		text: "後背包",
		recommended: true
	},
	{
		id: "kid-3",
		category: "兒童行李",
		text: "耳溫槍",
		recommended: true
	},
	{
		id: "kid-4",
		category: "兒童行李",
		text: "玩具",
		recommended: false
	},
	{
		id: "kid-5",
		category: "兒童行李",
		text: "尿布",
		recommended: true
	},
	{
		id: "kid-6",
		category: "兒童行李",
		text: "濕紙巾",
		recommended: true
	},
	{
		id: "kid-7",
		category: "兒童行李",
		text: "牙刷、牙膏",
		recommended: true
	},
	{
		id: "meal-1",
		category: "餐具",
		text: "奶瓶 1瓶",
		recommended: true
	},
	{
		id: "meal-2",
		category: "餐具",
		text: "水壺",
		recommended: true
	},
	{
		id: "meal-3",
		category: "餐具",
		text: "保溫瓶",
		recommended: true
	},
	{
		id: "meal-4",
		category: "餐具",
		text: "奶瓶刷組",
		recommended: true
	},
	{
		id: "meal-5",
		category: "餐具",
		text: "奶粉",
		recommended: true
	},
	{
		id: "meal-6",
		category: "餐具",
		text: "餅乾",
		recommended: true
	},
	{
		id: "meal-7",
		category: "餐具",
		text: "湯匙",
		recommended: true
	},
	{
		id: "meal-8",
		category: "餐具",
		text: "小熊碗",
		recommended: true
	},
	{
		id: "meal-9",
		category: "餐具",
		text: "食物剪",
		recommended: true
	},
	{
		id: "med-1",
		category: "藥品",
		text: "腸胃藥",
		recommended: true
	},
	{
		id: "med-2",
		category: "藥品",
		text: "感冒藥",
		recommended: true
	},
	{
		id: "med-3",
		category: "藥品",
		text: "外傷用藥",
		recommended: true
	},
	{
		id: "med-4",
		category: "藥品",
		text: "美容膠",
		recommended: false
	},
	{
		id: "med-5",
		category: "藥品",
		text: "過敏藥",
		recommended: true
	},
	{
		id: "med-6",
		category: "藥品",
		text: "耳溫槍",
		recommended: true
	},
	{
		id: "med-7",
		category: "藥品",
		text: "OK蹦",
		recommended: true
	},
	{
		id: "kidcloth-1",
		category: "兒童衣物",
		text: "上衣 ( )件、外套",
		recommended: true
	},
	{
		id: "kidcloth-2",
		category: "兒童衣物",
		text: "褲子 ( )件",
		recommended: true
	},
	{
		id: "kidcloth-3",
		category: "兒童衣物",
		text: "帽子",
		recommended: true
	},
	{
		id: "kidcloth-4",
		category: "兒童衣物",
		text: "襪子 ( )雙",
		recommended: true
	},
	{
		id: "kidcloth-5",
		category: "兒童衣物",
		text: "手套",
		recommended: true
	},
	{
		id: "kidcloth-6",
		category: "兒童衣物",
		text: "鞋子",
		recommended: true
	}
];
var DRIVING_RULES = [
	{
		title: "三不原則：不急起步、不急轉彎、不急煞車",
		icon: "Snowflake",
		summary: "雪道摩擦力僅為普通柏油路的三分之一，所有操作都要極度柔和。",
		rules: [
			"保持平時「3倍以上」安全車距（國道行駛至少保持 100 公尺以上）",
			"起步時輕踩油門，若儀表板打滑燈（ESC）閃爍，立刻鬆油門讓輪胎重新咬合",
			"轉彎前在直線路段「提早完全減速」，彎道中切忌重踩煞車"
		]
	},
	{
		title: "過夜停車鐵律：立起前後雨刷",
		icon: "Car",
		summary: "北海道零度以下過夜，未立起的雨刷會被融雪水牢牢凍結在玻璃上，硬扯會撕裂橡膠！",
		rules: [
			"每晚停妥車輛後，手動將前後雨刷拉至「垂直立起」角度",
			"手煞車拉起適度即可，極寒地區（-10°C以下）手煞車纜線可能凍結，排入 P 檔並放輪擋防滑",
			"早晨發動車輛後先開暖氣與後窗除霧線，用雪刷輕刮玻璃，切忌淋熱水（玻璃會爆裂）"
		]
	},
	{
		title: "恐怖隱形殺手：黑冰（Black Ice）",
		icon: "AlertTriangle",
		summary: "看似只是潮濕黑色柏油路面，實際是一層光滑透明薄冰，極度容易發生甩尾！",
		rules: [
			"常見於：橋樑高架、隧道出入口、十字路口煞車區、被山壁遮蔽的陰涼彎道",
			"氣溫在 +2°C 至 -4°C 最易生成黑冰，看見路面有反光即代表結冰，務必提前放慢車速",
			"若發生輕微甩尾打滑：不要驚慌猛打方向盤，鬆開油門，順著打滑方向輕轉校正"
		]
	},
	{
		title: "善用 B 檔（引擎煞車）防熱衰竭",
		icon: "Compass",
		summary: "阿寒山區與石北峠長下坡，若持續踩著腳煞車，容易導致煞車油過熱失靈或直接打滑。",
		rules: [
			"遇長下坡或陡坡，將排檔桿撥至「B」檔（或 S/L 檔）",
			"利用引擎轉速阻力自然降低車速，腳煞車僅作輔助輕點",
			"高速公路嚴禁開啟定速巡航（Cruise Control），全時人工精準掌握油門"
		]
	},
	{
		title: "山區油量警戒 ＆ 日落前抵達",
		icon: "Fuel",
		summary: "道東地區加油站相距動輒 50-70 公里，且鄉村加油站常在下午 17:00 或 18:00 關門！",
		rules: [
			"油箱指針掉到「一半」時，見到加油站就要加滿",
			"北海道雪季日落約在 16:00 - 16:20，天黑後山路無路燈且能見度驟降，盡量規劃 16:30 前入住飯店",
			"若遇蝦夷鹿在路邊，請減速以閃大燈提醒，切勿長按喇叭恐驚嚇鹿隻撞擊車門"
		]
	}
];
var EMERGENCY_CONTACTS = [
	{
		name: "日本道路救援 (JAF)",
		phone: "#8139 / 0570-00-8139",
		note: "24小時道路救援（電瓶接電、雪地脫困、補胎）"
	},
	{
		name: "日本警察局 (事故報警)",
		phone: "110",
		note: "只要發生自駕車損擦撞，無論多小都必須報警取得事故證明，否則租車保險無效！"
	},
	{
		name: "救護車 / 火警",
		phone: "119",
		note: "突發急性身體不適或火災緊急求救"
	},
	{
		name: "台北駐日代表處 札幌分處",
		phone: "+81-11-222-2909",
		note: "緊急護照遺失或重大急難救助（札幌中央區）"
	},
	{
		name: "北海道道路即時資訊專線",
		phone: "011-709-2311",
		note: "查詢國道與峠道閉鎖最新路況（北の道ナビ）"
	}
];
// src/components/GuideTab.tsx
var GuideTab = () => {
	const [checkedIds, setCheckedIds] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("hokkaido_checklist_checked");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [activeCategory, setActiveCategory] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("hokkaido_checklist_checked", JSON.stringify(checkedIds));
		} catch (e) {
			console.warn("LocalStorage error:", e);
		}
	}, [checkedIds]);
	const toggleCheck = (id) => {
		setCheckedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
	};
	const categories = ["all", ...Array.from(new Set(INITIAL_CHECKLIST.map((item) => item.category)))];
	const filteredChecklist = activeCategory === "all" ? INITIAL_CHECKLIST : INITIAL_CHECKLIST.filter((item) => item.category === activeCategory);
	const completedCount = INITIAL_CHECKLIST.filter((i) => checkedIds.includes(i.id)).length;
	const progressPercent = Math.round(completedCount / INITIAL_CHECKLIST.length * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto px-4 py-4 space-y-6 pb-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-gradient-to-r from-[#EFF6FF] via-white to-[#F0F9FF] p-4 rounded-3xl border border-[#BFDBFE] flex items-center gap-3.5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShimaEnagaSvg, {
						size: 52,
						mood: "happy"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-bold text-[#2563EB] uppercase tracking-wider",
						children: "雪道自駕 ＆ 行前全攻略"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-bold text-slate-900",
						children: "初次北海道雪季自駕不用慌！"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-600 mt-0.5 leading-relaxed",
						children: "掌握三不原則（不急踩、不急轉、不急煞），備妥防寒與行車裝備，安心享受 12 天夢幻雪國！"
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-2xl bg-blue-600 text-white flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { className: "w-4 h-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-bold text-slate-900",
						children: "雪道自駕安全五大鐵則"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-500",
						children: "北海道自駕出發前必讀守則"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: DRIVING_RULES.map((rule, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-5 h-5 rounded-full bg-blue-100 text-[#1D4ED8] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5",
								children: idx + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-xs sm:text-sm font-bold text-slate-900",
									children: rule.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-blue-700 font-medium mt-0.5",
									children: rule.summary
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "pl-7 space-y-1 text-xs text-slate-600",
							children: rule.rules.map((r, rIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "list-disc list-outside leading-relaxed",
								children: r
							}, rIdx))
						})]
					}, idx))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "w-4 h-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-base font-bold text-slate-900",
								children: "雪季必備清單"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-slate-500",
								children: [
									"完成進度：",
									completedCount,
									" / ",
									INITIAL_CHECKLIST.length,
									" 項 (",
									progressPercent,
									"%)"
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-16 sm:w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-emerald-500 h-full transition-all duration-300",
								style: { width: `${progressPercent}%` }
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2",
						children: categories.map((cat) => {
							const totalInCat = cat === "all" ? INITIAL_CHECKLIST.length : INITIAL_CHECKLIST.filter((i) => i.category === cat).length;
							const checkedInCat = cat === "all" ? INITIAL_CHECKLIST.filter((i) => checkedIds.includes(i.id)).length : INITIAL_CHECKLIST.filter((i) => i.category === cat && checkedIds.includes(i.id)).length;
							const isCatAllDone = totalInCat > 0 && checkedInCat === totalInCat;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setActiveCategory(cat),
								className: `shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${activeCategory === cat ? "bg-slate-900 text-white font-bold shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: cat === "all" ? "全部項目" : cat }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeCategory === cat ? isCatAllDone ? "bg-emerald-500 text-white" : "bg-white/20 text-white" : isCatAllDone ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`,
									children: [
										checkedInCat,
										"/",
										totalInCat
									]
								})]
							}, cat);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between py-1.5 px-1 border-t border-slate-100 text-[11px] text-slate-500",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"目前檢視：",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeCategory === "all" ? "全部清單" : activeCategory }),
							"（",
							filteredChecklist.filter((i) => checkedIds.includes(i.id)).length,
							" /",
							" ",
							filteredChecklist.length,
							" 完成）"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									const currentCatIds = filteredChecklist.map((i) => i.id);
									if (currentCatIds.every((id) => checkedIds.includes(id))) setCheckedIds((prev) => prev.filter((id) => !currentCatIds.includes(id)));
									else setCheckedIds((prev) => Array.from(/* @__PURE__ */ new Set([...prev, ...currentCatIds])));
								},
								className: "text-[#2563EB] hover:text-[#1D4ED8] font-bold cursor-pointer hover:underline",
								children: filteredChecklist.every((i) => checkedIds.includes(i.id)) ? "取消本類別全選" : "全選本類別"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-slate-100 mt-1",
						children: filteredChecklist.map((item) => {
							const isChecked = checkedIds.includes(item.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								onClick: () => toggleCheck(item.id),
								className: "flex items-start gap-3 py-2.5 px-1 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer select-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 text-[#2563EB] shrink-0",
									children: isChecked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "w-4 h-4 fill-[#2563EB] text-white" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "w-4 h-4 text-slate-400" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `text-xs sm:text-sm font-medium ${isChecked ? "line-through text-slate-400" : "text-slate-800"}`,
										children: item.text
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-slate-400 font-normal",
										children: item.category
									})]
								})]
							}, item.id);
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-2xl bg-rose-600 text-white flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneCall, { className: "w-4 h-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-bold text-slate-900",
						children: "緊急救援與重要電話"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-500",
						children: "遇到突發狀況時點擊即可撥打"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: EMERGENCY_CONTACTS.map((contact, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs sm:text-sm font-bold text-slate-900",
								children: contact.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-slate-500 leading-snug mt-0.5",
								children: contact.note
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `tel:${contact.phone.replace(/[^0-9+]/g, "")}`,
							className: "shrink-0 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneCall, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: contact.phone.split("/")[0].trim() })]
						})]
					}, idx))
				})]
			})
		]
	});
};
// src/data/weatherData.ts
var DAY_WEATHER_SUMMARIES = [
	{
		dayNumber: 1,
		date: "11/11 (週三)",
		location: "札幌市區",
		weather: {
			region: "札幌・石狩",
			condition: "多雲偶飄初雪",
			tempHigh: 5,
			tempLow: -1,
			snowChance: 45,
			snowDepthCm: 3,
			iceIndex: "偏高",
			sunsetTime: "16:20",
			windSpeed: "西北風 3m/s",
			iconType: "cloud-snow"
		},
		roadsToWatch: ["國道 36 號（千歲至札幌）", "大通公園周邊步道"],
		snowAdvisory: "人行道初雪踩踏後易結硬冰，薄野與大通地下街路口坡道請小心防滑。"
	},
	{
		dayNumber: 2,
		date: "11/12 (週四)",
		location: "小樽 ＆ 藻岩山",
		weather: {
			region: "後志・小樽 / 札幌南",
			condition: "海風陣雪 轉 晴夜",
			tempHigh: 4,
			tempLow: -2,
			snowChance: 60,
			snowDepthCm: 6,
			iceIndex: "偏高",
			sunsetTime: "16:18",
			windSpeed: "北西強風 6m/s",
			iconType: "snow"
		},
		roadsToWatch: [
			"札樽自動車道",
			"小樽臨港通",
			"藻岩山觀光道路"
		],
		snowAdvisory: "小樽港邊受日本海雪雲影響陣雪頻繁；藻岩山頂風大體感逼近 -6°C，夜景觀景台防風必備。"
	},
	{
		dayNumber: 3,
		date: "11/13 (週五)",
		location: "白色戀人 ＆ 神宮",
		weather: {
			region: "札幌西區・圓山",
			condition: "晴時多雲乾冷",
			tempHigh: 5,
			tempLow: -1,
			snowChance: 25,
			snowDepthCm: 4,
			iceIndex: "中等",
			sunsetTime: "16:16",
			windSpeed: "微風 2m/s",
			iconType: "sun-snow"
		},
		roadsToWatch: ["北5条手稻通", "圓山公園外環道"],
		snowAdvisory: "午後陽光融雪，傍晚地面潮濕處隨即反凍成黑冰，明日取車自駕注意檢查雪胎。"
	},
	{
		dayNumber: 4,
		date: "11/14 (週六)",
		location: "占冠 ➔ 帶廣",
		weather: {
			region: "十勝・占冠山嶺",
			condition: "山區陣雪・平原乾晴",
			tempHigh: 3,
			tempLow: -4,
			snowChance: 55,
			snowDepthCm: 12,
			iceIndex: "極高 (黑冰)",
			sunsetTime: "16:12",
			windSpeed: "陣風 5m/s",
			iconType: "snow-heavy"
		},
		roadsToWatch: ["道東自動車道（夕張–占冠山嶺隧道群）", "狩勝峠周邊"],
		snowAdvisory: "重大警戒！山嶺隧道出入口有強烈突風與黑冰，拉開 100m 車距，天黑前務必穿過占冠。"
	},
	{
		dayNumber: 5,
		date: "11/15 (週日)",
		location: "帶廣 ➔ 釧路",
		weather: {
			region: "釧路・十勝平原",
			condition: "十勝青空 ➔ 釧路海霧寒冷",
			tempHigh: 4,
			tempLow: -4,
			snowChance: 20,
			snowDepthCm: 5,
			iceIndex: "偏高",
			sunsetTime: "16:08",
			windSpeed: "東南風 4m/s",
			iconType: "sun-snow"
		},
		roadsToWatch: ["國道 38 號（浦幌至釧路沿海）", "細岡展望台濕原林道"],
		snowAdvisory: "日落時間 16:08！細岡林道無路燈且積雪壓實，野生鹿群繁多，請減速慢行慢看。"
	},
	{
		dayNumber: 6,
		date: "11/16 (週一)",
		location: "釧路 ➔ 阿寒湖",
		weather: {
			region: "阿寒摩周國立公園",
			condition: "深山粉雪 森林霧淞",
			tempHigh: 1,
			tempLow: -7,
			snowChance: 70,
			snowDepthCm: 18,
			iceIndex: "極高 (黑冰)",
			sunsetTime: "16:06",
			windSpeed: "山風 3m/s",
			iconType: "snow-heavy"
		},
		roadsToWatch: ["國道 240 號（毬藻國道長下坡）", "阿寒川渡假村引道"],
		snowAdvisory: "海拔升高路面全日不融冰，進入渡假村坡道請排入 B 檔引擎煞車，切勿長踩腳煞車。"
	},
	{
		dayNumber: 7,
		date: "11/17 (週二)",
		location: "屈斜路 ➔ 摩周 ➔ 知床",
		weather: {
			region: "摩周高地・知床半島",
			condition: "高山濃霧吹雪 ➔ 沿海強風",
			tempHigh: 0,
			tempLow: -6,
			snowChance: 65,
			snowDepthCm: 15,
			iceIndex: "極高 (黑冰)",
			sunsetTime: "16:04",
			windSpeed: "海風 7m/s",
			iconType: "snow-heavy"
		},
		roadsToWatch: ["道道 52 號（摩周湖展望道）", "通往天空之路坡頂"],
		snowAdvisory: "通往天空之路坡頂側風強勁，雙手握穩方向盤；摩周湖可能突發吹雪視程不良。"
	},
	{
		dayNumber: 8,
		date: "11/18 (週三)",
		location: "知床五湖 ＆ 知床峠",
		weather: {
			region: "知床世界遺產半島",
			condition: "高山極凍・局部吹雪",
			tempHigh: -1,
			tempLow: -8,
			snowChance: 75,
			snowDepthCm: 22,
			iceIndex: "極高 (黑冰)",
			sunsetTime: "16:02",
			windSpeed: "隘口狂風 8m/s",
			iconType: "snow-heavy"
		},
		roadsToWatch: ["國道 334 號（知床橫斷道路/知床峠）", "宇登呂港灣道路"],
		snowAdvisory: "知床峠夜間常閉鎖，遇大雪隨時可能全線管制，五湖高架木棧道走動需著防風重裝。"
	},
	{
		dayNumber: 9,
		date: "11/19 (週四)",
		location: "能取岬 ➔ 網走 ➔ 北見",
		weather: {
			region: "鄂霍次克沿岸・北見盆地",
			condition: "岬角烈風 ➔ 盆地乾燥酷寒",
			tempHigh: 2,
			tempLow: -6,
			snowChance: 40,
			snowDepthCm: 10,
			iceIndex: "偏高",
			sunsetTime: "16:03",
			windSpeed: "西北強風 7m/s",
			iconType: "snow"
		},
		roadsToWatch: ["道道 76 號（能取岬燈塔道路）", "國道 39 號（網走至北見）"],
		snowAdvisory: "能取岬海風極強易將雪粒吹成雪霧障眼；北見市區傍晚融雪再凍結極為滑溜。"
	},
	{
		dayNumber: 10,
		date: "11/20 (週五)",
		location: "石北峠 ➔ 層雲峽 ➔ 旭川",
		weather: {
			region: "大雪山連峰・旭川盆地",
			condition: "石北峠強暴雪 ➔ 旭川低溫雪白",
			tempHigh: 0,
			tempLow: -9,
			snowChance: 80,
			snowDepthCm: 28,
			iceIndex: "極高 (黑冰)",
			sunsetTime: "16:05",
			windSpeed: "高山大風 6m/s",
			iconType: "snow-heavy"
		},
		roadsToWatch: ["國道 39 號（石北峠標高 1,050m 隘口）", "層雲峽黑岳纜車山道"],
		snowAdvisory: "【全線最高風險】石北峠積雪極深且結硬冰，連續急彎全時開啟 4WD 低速，緊隨前車轍印慢行！"
	},
	{
		dayNumber: 11,
		date: "11/21 (週六)",
		location: "旭川 ➔ 砂川 ➔ 札幌",
		weather: {
			region: "上川・空知・石狩平原",
			condition: "旭川極凍晨曦 ➔ 平原小雪",
			tempHigh: 2,
			tempLow: -8,
			snowChance: 45,
			snowDepthCm: 16,
			iceIndex: "偏高",
			sunsetTime: "16:15",
			windSpeed: "微風 3m/s",
			iconType: "cloud-snow"
		},
		roadsToWatch: ["道央自動車道（旭川鷹栖至砂川段）", "動物園通"],
		snowAdvisory: "旭川早晨極冷達 -8°C，戶外看企鵝散步必貼鞋底暖暖包；高速公路注意除雪車作業車隊。"
	},
	{
		dayNumber: 12,
		date: "11/22 (週日)",
		location: "札幌 ➔ 新千歲機場",
		weather: {
			region: "石狩・千歲",
			condition: "冬陽初現 偶有飄雪",
			tempHigh: 3,
			tempLow: -2,
			snowChance: 30,
			snowDepthCm: 8,
			iceIndex: "中等",
			sunsetTime: "16:18",
			windSpeed: "偏西風 3m/s",
			iconType: "sun-snow"
		},
		roadsToWatch: ["道央自動車道（札幌南至新千歲機場）", "國道 36 號"],
		snowAdvisory: "返程車流量大，出發前確認機場高速即時路況，保留充足還車加滿油與出境安檢時間。"
	}
];
var ROAD_RESOURCES = [
	{
		name: "北の道ナビ（北海道官方道路情報）",
		url: "https://katsura.spc.jrc.or.jp/hokkaido-road/fuyumichi/",
		desc: "查詢北海道全境即時道路監視相機、吹雪視程警報、峠道閉鎖最新狀態"
	},
	{
		name: "JARTIC 日本道路交通情報中心",
		url: "https://www.jartic.or.jp/",
		desc: "高速道路與國道通行止、車流回堵即時地圖"
	},
	{
		name: "DraPla 高速道路即時資訊",
		url: "https://www.driveplaza.com/",
		desc: "NEXCO 東日本雪道行車速度限制與 ETC 通行費查詢"
	}
];
// src/components/WeatherTab.tsx
var WeatherTab = ({ initialDay = 1 }) => {
	const [selectedDay, setSelectedDay] = (0, import_react.useState)(initialDay);
	const currentSummary = DAY_WEATHER_SUMMARIES.find((s) => s.dayNumber === selectedDay) || DAY_WEATHER_SUMMARIES[0];
	const { weather } = currentSummary;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto px-4 py-4 space-y-6 pb-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-gradient-to-r from-[#EFF6FF] via-[#F0F9FF] to-[#E0F2FE] p-4 rounded-3xl border border-[#BFDBFE] flex items-center justify-between gap-3 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "北海道道央・道東 雪況即時監測" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-bold text-slate-900 mt-0.5",
							children: "12 天全線雪道與氣象觀測"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-600 mt-0.5",
							children: "日落時間平均 16:10，嚴防氣溫破零度後之黑冰路況"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShimaEnagaSvg, {
						size: 52,
						mood: "happy"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs font-bold text-slate-500 mb-2 px-1 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "選擇檢視天數：" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[#2563EB] font-bold",
						children: [
							"Day ",
							selectedDay,
							" · ",
							currentSummary.location
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5",
					children: DAY_WEATHER_SUMMARIES.map((item) => {
						const isSelected = item.dayNumber === selectedDay;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setSelectedDay(item.dayNumber),
							className: `shrink-0 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center min-w-[56px] ${isSelected ? "bg-[#2563EB] text-white shadow-xs scale-105" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["D", item.dayNumber] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] font-normal opacity-85",
								children: [item.weather.tempLow, "°C"]
							})]
						}, item.dayNumber);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs font-semibold text-[#2563EB]",
								children: [
									"Day ",
									currentSummary.dayNumber,
									" · ",
									currentSummary.date
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xl font-bold text-slate-900 mt-0.5",
								children: weather.region
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-slate-600 mt-0.5",
								children: weather.condition
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-3xl font-black text-slate-900 tabular-nums",
								children: [
									weather.tempHigh,
									"°",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-base font-normal text-slate-400",
										children: [
											" ",
											"/ ",
											weather.tempLow,
											"°"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${weather.iceIndex.includes("極高") ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`,
								children: ["道路結冰：", weather.iceIndex]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-slate-400 text-[11px] mb-1",
									children: "降雪機率"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-base font-bold text-blue-700 tabular-nums",
									children: [weather.snowChance, "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-slate-400 text-[11px] mb-1",
									children: "路面積雪估計"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-base font-bold text-slate-800 tabular-nums",
									children: [weather.snowDepthCm, " cm"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-slate-400 text-[11px] mb-1",
									children: "風向風速"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-bold text-slate-800 mt-1",
									children: weather.windSpeed
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-slate-400 text-[11px] mb-1",
									children: "日落天黑時刻"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-base font-bold text-amber-700 tabular-nums",
									children: weather.sunsetTime
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-bold flex items-center gap-1.5 mb-1 text-amber-950",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4 text-amber-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "當日自駕雪況評估" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: currentSummary.snowAdvisory })]
					}),
					currentSummary.roadsToWatch && currentSummary.roadsToWatch.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 pt-3 border-t border-slate-100 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-slate-700",
							children: "當日重點監測路段："
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5 mt-1.5",
							children: currentSummary.roadsToWatch.map((road, rIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-medium border border-slate-200",
								children: ["🛣️ ", road]
							}, rIdx))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-2xl bg-sky-600 text-white flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "w-4 h-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-bold text-slate-900",
						children: "官方即時路況與相機"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-500",
						children: "自駕出發前一鍵查詢最新通阻"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2.5",
					children: ROAD_RESOURCES.map((res, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: res.url,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "p-3 rounded-2xl bg-[#F8FAFC] hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between gap-2 group block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: res.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-slate-500 mt-0.5 leading-snug",
								children: res.desc
							})]
						})
					}, idx))
				})]
			})
		]
	});
};
// src/components/SettingsTab.tsx
var SettingsTab = ({ completedSpotIds, photos, onRestoreData, onClearPhotos, onResetCompletedSpots, onClearAll }) => {
	const fileInputRef = (0, import_react.useRef)(null);
	const [downloadNotice, setDownloadNotice] = (0, import_react.useState)(null);
	const [importStatus, setImportStatus] = (0, import_react.useState)(null);
	const allSpots = ITINERARY_DATA.flatMap((d) => d.spots);
	const completedSpotsList = allSpots.filter((s) => completedSpotIds.includes(s.id));
	const completedCount = completedSpotsList.length;
	const totalCount = allSpots.length;
	const progressPercent = Math.round(completedCount / totalCount * 100);
	const photosStorageBytes = JSON.stringify(photos).length * 2;
	const photosStorageKB = Math.round(photosStorageBytes / 1024);
	const showNotification = (msg) => {
		setDownloadNotice(msg);
		setTimeout(() => setDownloadNotice(null), 3500);
	};
	const handleExportJSON = () => {
		const exportData = {
			app: "Hokkaido Snow Season Roadtrip 12Days",
			version: "1.2.0",
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			exportDateFormatted: (/* @__PURE__ */ new Date()).toLocaleString("zh-TW"),
			stats: {
				totalSpots: totalCount,
				completedSpotsCount: completedCount,
				progressPercent: `${progressPercent}%`,
				photosCount: photos.length
			},
			completedSpotIds,
			completedSpotsDetails: completedSpotsList.map((spot) => {
				const day = ITINERARY_DATA.find((d) => d.spots.some((s) => s.id === spot.id));
				return {
					dayNumber: day?.dayNumber,
					date: day?.date,
					area: day?.area,
					time: spot.time,
					duration: spot.duration,
					name: spot.name,
					nameJa: spot.nameJa,
					category: spot.category,
					tags: spot.tags.map((t) => t.label)
				};
			}),
			photos: photos.map((p) => ({
				id: p.id,
				dayNumber: p.dayNumber,
				spotId: p.spotId,
				spotName: p.spotName,
				dateStr: p.dateStr,
				caption: p.caption,
				imageUrl: p.imageUrl
			}))
		};
		const jsonString = JSON.stringify(exportData, null, 2);
		const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		const timestamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		link.href = url;
		link.download = `hokkaido-trip-backup-${timestamp}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		showNotification("✓ JSON 完整備份檔已成功下載！");
	};
	const handleExportText = () => {
		const timestamp = (/* @__PURE__ */ new Date()).toLocaleDateString("zh-TW", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		});
		let text = `========================================================\n`;
		text += `❄️ 北海道雪季自由行 12Days｜個人旅程紀實備忘錄\n`;
		text += `========================================================\n`;
		text += `匯出時間：${timestamp}\n`;
		text += `完成進度：${completedCount} / ${totalCount} 個景點 (${progressPercent}%)\n`;
		text += `照片紀錄：共 ${photos.length} 張旅記相片\n`;
		text += `--------------------------------------------------------\n\n`;
		ITINERARY_DATA.forEach((day) => {
			text += `【Day ${day.dayNumber}（${day.date} ${day.dayOfWeek}）：${day.title}】\n`;
			text += `📍 地區：${day.area}\n`;
			text += `🚗 動線：${day.routeHighlight}\n`;
			if (day.hotel) text += `🏨 住宿：${day.hotel.name}（${day.hotel.address}）\n`;
			text += `❄️ 雪況提示：${day.snowTip.title}（氣溫：${day.snowTip.tempRange}，結冰：${day.snowTip.freezeLevel}）\n`;
			text += `--- 當日站點 ---\n`;
			day.spots.forEach((spot, idx) => {
				const isDone = completedSpotIds.includes(spot.id);
				const spotPhotos = photos.filter((p) => p.spotId === spot.id);
				text += `${isDone ? "[✓ 已造訪]" : "[ ] 未標記"} ${idx + 1}. ${spot.time} ${spot.name}`;
				if (spot.nameJa) text += ` (${spot.nameJa})`;
				text += ` · ${spot.duration}\n`;
				text += `   類別：${spot.category} | 導航查詢：${spot.mapQuery}\n`;
				text += `   停車：${spot.parkingInfo}\n`;
				text += `   加油：${spot.gasInfo}\n`;
				if (spot.tags.length > 0) text += `   標籤：${spot.tags.map((t) => t.label).join("、")}\n`;
				if (spotPhotos.length > 0) {
					text += `   📸 拍立得照片：${spotPhotos.length} 張\n`;
					spotPhotos.forEach((p, pIdx) => {
						text += `      (${pIdx + 1}) [${p.dateStr}] ${p.caption ? `心得：「${p.caption}」` : "（未填寫文字）"}\n`;
					});
				}
				text += `\n`;
			});
			text += `\n`;
		});
		try {
			const savedChecklist = localStorage.getItem("hokkaido_checklist_checked");
			const checkedList = savedChecklist ? JSON.parse(savedChecklist) : [];
			if (INITIAL_CHECKLIST.length > 0) {
				text += `========================================================\n`;
				text += `📋 行李必備打包清單（共 ${INITIAL_CHECKLIST.length} 項，已完成 ${checkedList.length} 項）\n`;
				text += `========================================================\n\n`;
				Array.from(new Set(INITIAL_CHECKLIST.map((i) => i.category))).forEach((cat) => {
					const itemsInCat = INITIAL_CHECKLIST.filter((i) => i.category === cat);
					const checkedInCat = itemsInCat.filter((i) => checkedList.includes(i.id)).length;
					text += `【${cat}】(${checkedInCat}/${itemsInCat.length})\n`;
					itemsInCat.forEach((item) => {
						const isChecked = checkedList.includes(item.id);
						text += `  ${isChecked ? "[✓]" : "[ ]"} ${item.text}\n`;
					});
					text += `\n`;
				});
			}
		} catch {}
		text += `========================================================\n`;
		text += `北海道雪季自駕回憶 · 祝行車平安、旅途愉快！\n`;
		text += `========================================================\n`;
		const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		link.href = url;
		link.download = `hokkaido-trip-journal-${dateStr}.txt`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		showNotification("✓ 文字旅記摘要 (.txt) 已成功下載！");
	};
	const handleExportHTML = () => {
		let html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>北海道雪季自由行 12Days 旅程寫真備忘錄</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f4f8; color: #1e293b; padding: 20px; max-width: 800px; margin: 0 auto; }
  h1 { color: #1d4ed8; font-size: 24px; border-bottom: 2px solid #93c5fd; padding-bottom: 8px; }
  .summary { background: white; padding: 16px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .day-card { background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .day-title { font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 8px; }
  .spot { padding: 10px 0; border-top: 1px solid #f1f5f9; }
  .badge-done { background: #dcfce7; color: #15803d; font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: bold; }
  .badge-todo { background: #f1f5f9; color: #64748b; font-size: 11px; padding: 2px 8px; border-radius: 12px; }
  .photo-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
  .photo-box { background: #fafaf9; border: 1px solid #e7e5e4; padding: 8px; border-radius: 12px; width: 220px; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }
  .photo-box img { width: 100%; height: 160px; object-fit: cover; border-radius: 8px; }
  .caption { font-size: 12px; color: #475569; margin-top: 6px; font-style: italic; }
</style>
</head>
<body>
<h1>❄️ 北海道雪季自由行 12Days 旅程紀實備份</h1>
<div class="summary">
  <p><strong>匯出時間：</strong>${(/* @__PURE__ */ new Date()).toLocaleDateString("zh-TW")}</p>
  <p><strong>景點打卡進度：</strong>${completedCount} / ${totalCount} 個站點 (${progressPercent}%)</p>
  <p><strong>照片數量：</strong>${photos.length} 張旅記照片</p>
</div>
`;
		ITINERARY_DATA.forEach((day) => {
			html += `<div class="day-card">
  <div class="day-title">Day ${day.dayNumber} · ${day.date} (${day.dayOfWeek}) - ${day.title}</div>
  <p style="font-size: 13px; color: #64748b;">📍 ${day.area} | 🚗 ${day.routeHighlight}</p>
`;
			day.spots.forEach((spot) => {
				const isDone = completedSpotIds.includes(spot.id);
				const spotPhotos = photos.filter((p) => p.spotId === spot.id);
				html += `  <div class="spot">
    <div>
      <span class="${isDone ? "badge-done" : "badge-todo"}">${isDone ? "✓ 已打卡" : "未打卡"}</span>
      <strong>${spot.time} ${spot.name}</strong> <span style="font-size: 12px; color: #94a3b8;">${spot.nameJa || ""}</span>
    </div>
    <div style="font-size: 12px; color: #475569; margin-top: 4px;">${spot.description}</div>
`;
				if (spotPhotos.length > 0) {
					html += `    <div class="photo-grid">\n`;
					spotPhotos.forEach((p) => {
						html += `      <div class="photo-box">
        <img src="${p.imageUrl}" alt="${p.spotName}">
        <div class="caption">${p.caption || "（照片隨筆記錄）"}</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${p.dateStr}</div>
      </div>\n`;
					});
					html += `    </div>\n`;
				}
				html += `  </div>\n`;
			});
			html += `</div>\n`;
		});
		html += `</body></html>`;
		const blob = new Blob([html], { type: "text/html;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `hokkaido-trip-album-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.html`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		showNotification("✓ 離線 HTML 寫真備份檔已成功下載！");
	};
	const handleImportFile = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result;
				const parsed = JSON.parse(content);
				if (Array.isArray(parsed.completedSpotIds) && Array.isArray(parsed.photos)) {
					onRestoreData(parsed.completedSpotIds, parsed.photos);
					setImportStatus("✓ 備份檔案已成功還原！已同步至 App。");
					setTimeout(() => setImportStatus(null), 4e3);
				} else setImportStatus("⚠️ 檔案格式不符合備份檔規格，請確認是否為本 App 匯出的 JSON 檔案。");
			} catch (err) {
				setImportStatus("❌ 檔案解析失敗，請確認檔案內容正確。");
			}
			if (fileInputRef.current) fileInputRef.current.value = "";
		};
		reader.readAsText(file);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto px-4 py-4 space-y-6 pb-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-gradient-to-r from-[#EFF6FF] via-white to-[#F0F9FF] p-4 rounded-3xl border border-[#BFDBFE] flex items-center justify-between gap-3 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Trip Data & Backup" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base sm:text-lg font-bold text-slate-900 mt-0.5",
							children: "旅程紀錄備份與下載"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-600 mt-0.5",
							children: "將已打卡的行程清單與隨手拍攝的雪景照片打包封存"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShimaEnagaSvg, {
						size: 50,
						mood: "happy"
					})
				})]
			}),
			downloadNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: downloadNotice })]
			}),
			importStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 rounded-2xl bg-blue-50 border border-blue-300 text-blue-900 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "w-4 h-4 text-blue-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: importStatus })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-8 h-8 rounded-2xl bg-blue-600 text-white flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardDrive, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-bold text-slate-900",
							children: "目前本機儲存統計"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-500",
							children: "記錄保存在您的手機瀏覽器中"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl",
						children: [
							"約 ",
							photosStorageKB,
							" KB"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-slate-500 font-medium",
								children: "已完成打卡景點"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-lg sm:text-xl font-black text-emerald-600 tabular-nums mt-0.5",
								children: [
									completedCount,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-normal text-slate-400",
										children: ["/ ", totalCount]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-slate-500 font-medium",
								children: "上傳旅記相片"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-lg sm:text-xl font-black text-[#2563EB] tabular-nums mt-0.5",
								children: [
									photos.length,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-normal text-slate-400",
										children: "張"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-2 sm:col-span-1 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-slate-500 font-medium",
								children: "全趟行程達成率"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-lg sm:text-xl font-black text-amber-600 tabular-nums mt-0.5",
								children: [progressPercent, "%"]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-1 pb-2.5 border-b border-slate-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-8 h-8 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-bold text-slate-900",
							children: "打包下載與備份"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-500",
							children: "選擇適合您的備份檔案格式"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-10 h-10 rounded-2xl bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileJson, { className: "w-5 h-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm font-bold text-slate-900 flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "JSON 完整打包備份檔" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-md",
									children: "推薦備份"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-500 mt-0.5 leading-relaxed",
								children: "包含已勾選完成的景點狀態、詳細時間、所有上傳的照片及心得文字，可供未來隨時還原。"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleExportJSON,
							className: "w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "下載 .JSON" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "w-5 h-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold text-slate-900",
								children: "文字旅記日記純文字檔 (.txt)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-500 mt-0.5 leading-relaxed",
								children: "排版整齊的易讀純文字報告，條列已造訪景點、時間、打卡狀態與旅遊心得，適合列印或存入筆記。"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleExportText,
							className: "w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "下載 .TXT" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode, { className: "w-5 h-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold text-slate-900",
								children: "離線圖文寫真相簿網頁 (.html)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-500 mt-0.5 leading-relaxed",
								children: "單一 HTML 檔案，所有照片已直接內嵌，不需網路即可在任何電腦或手機瀏覽器離線閱讀寫真相簿。"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleExportHTML,
							className: "w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "下載 .HTML" })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-bold text-slate-900",
							children: "還原先前備份"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-500",
							children: "換手機或更換瀏覽器時可匯入還原"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 mb-3 leading-relaxed",
						children: [
							"若您先前有下載過 ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: ".json" }),
							" 備份檔，點擊下方即可上傳檔案還原已完成打卡與旅記相片。"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "w-full py-3 px-4 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-bold text-emerald-800",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "w-4 h-4 text-emerald-600" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "選擇 JSON 備份檔進行還原..." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileInputRef,
								type: "file",
								accept: ".json,application/json",
								onChange: handleImportFile,
								className: "hidden"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-2xl bg-rose-600 text-white flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-bold text-slate-900",
						children: "資料重置與清理"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-500",
						children: "注意：清除前請記得先備份資料"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-bold text-slate-800",
								children: "重置景點打卡狀態"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-slate-500",
								children: "保留照片，將所有景點恢復為未拜訪"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									if (window.confirm("確定要清除所有已勾選的景點打卡紀錄嗎？")) {
										onResetCompletedSpots();
										showNotification("已重置所有景點打卡狀態");
									}
								},
								className: "px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer",
								children: "重置打卡"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs font-bold text-slate-800",
								children: [
									"清除所有上傳相片 (",
									photos.length,
									" 張)"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-slate-500",
								children: "釋放瀏覽器儲存空間"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									if (window.confirm(`確定要刪除所有 ${photos.length} 張旅記照片嗎？此操作不可逆，請先下載備份！`)) {
										onClearPhotos();
										showNotification("已清空所有旅記相片");
									}
								},
								className: "px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-100 border border-rose-300 cursor-pointer",
								children: "清空相片"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-3 rounded-2xl bg-rose-50/60 border border-rose-200",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-bold text-rose-900",
								children: "完全恢復原廠預設"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-rose-700",
								children: "清空打卡、照片與行李清單紀錄"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									if (window.confirm("⚠️ 警告：這將會清除您在此裝置的所有旅遊打卡、相片與自訂紀錄，確定要重置嗎？")) {
										onClearAll();
										showNotification("已重置為全新狀態");
									}
								},
								className: "px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer",
								children: "全部清空"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center text-xs text-slate-400 pt-2 space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "北海道雪季自由行 12Days · 繞半圈隨身導覽 App" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px]",
					children: "版本 v1.2.0 · 支援離線瀏覽與資料備份"
				})]
			})
		]
	});
};
// src/App.tsx
var CATEGORY_FILTERS = [
	{
		id: "all",
		label: "全部景點"
	},
	{
		id: "sightseeing",
		label: "名勝景點"
	},
	{
		id: "food",
		label: "必吃美食"
	},
	{
		id: "shopping",
		label: "購物伴手"
	},
	{
		id: "activity",
		label: "體驗活動"
	},
	{
		id: "transport",
		label: "交通取車"
	}
];
function App() {
	const [activeTab, setActiveTab] = (0, import_react.useState)("itinerary");
	const [selectedDayNumber, setSelectedDayNumber] = (0, import_react.useState)(1);
	const [selectedCategory, setSelectedCategory] = (0, import_react.useState)("all");
	const [quickJumpOpen, setQuickJumpOpen] = (0, import_react.useState)(false);
	const [shareModalOpen, setShareModalOpen] = (0, import_react.useState)(false);
	const [completedSpotIds, setCompletedSpotIds] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("hokkaido_completed_spots");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [photos, setPhotos] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("hokkaido_diary_photos");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [activePhoto, setActivePhoto] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("hokkaido_completed_spots", JSON.stringify(completedSpotIds));
		} catch (e) {
			console.warn("LocalStorage error:", e);
		}
	}, [completedSpotIds]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("hokkaido_diary_photos", JSON.stringify(photos));
		} catch (e) {
			console.warn("LocalStorage error:", e);
		}
	}, [photos]);
	const currentDayData = (0, import_react.useMemo)(() => {
		return ITINERARY_DATA.find((d) => d.dayNumber === selectedDayNumber) || ITINERARY_DATA[0];
	}, [selectedDayNumber]);
	const filteredSpots = (0, import_react.useMemo)(() => {
		if (selectedCategory === "all") return currentDayData.spots;
		return currentDayData.spots.filter((s) => s.category === selectedCategory);
	}, [currentDayData, selectedCategory]);
	const handleToggleComplete = (spotId) => {
		setCompletedSpotIds((prev) => prev.includes(spotId) ? prev.filter((id) => id !== spotId) : [...prev, spotId]);
	};
	const handleAddPhoto = (spotId, spotName, file) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const MAX_WIDTH = 960;
				const MAX_HEIGHT = 960;
				let width = img.width;
				let height = img.height;
				if (width > height) {
					if (width > MAX_WIDTH) {
						height = Math.round(height * MAX_WIDTH / width);
						width = MAX_WIDTH;
					}
				} else if (height > MAX_HEIGHT) {
					width = Math.round(width * MAX_HEIGHT / height);
					height = MAX_HEIGHT;
				}
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.drawImage(img, 0, 0, width, height);
					const compressedDataUrl = canvas.toDataURL("image/jpeg", .8);
					const now = /* @__PURE__ */ new Date();
					const newPhoto = {
						id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
						dayNumber: selectedDayNumber,
						spotId,
						spotName,
						imageUrl: compressedDataUrl,
						caption: "",
						dateStr: `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
						timestamp: Date.now()
					};
					setPhotos((prev) => [newPhoto, ...prev]);
				}
			};
			if (typeof e.target?.result === "string") img.src = e.target.result;
		};
		reader.readAsDataURL(file);
	};
	const handleDeletePhoto = (photoId) => {
		setPhotos((prev) => prev.filter((p) => p.id !== photoId));
	};
	const handleUpdateCaption = (photoId, newCaption) => {
		setPhotos((prev) => prev.map((p) => p.id === photoId ? {
			...p,
			caption: newCaption
		} : p));
	};
	const handleRestoreData = (restoredSpots, restoredPhotos) => {
		setCompletedSpotIds(restoredSpots);
		setPhotos(restoredPhotos);
	};
	const handleClearPhotos = () => {
		setPhotos([]);
	};
	const handleResetCompletedSpots = () => {
		setCompletedSpotIds([]);
	};
	const handleClearAll = () => {
		setCompletedSpotIds([]);
		setPhotos([]);
		try {
			localStorage.removeItem("hokkaido_completed_spots");
			localStorage.removeItem("hokkaido_diary_photos");
			localStorage.removeItem("hokkaido_checklist_checked");
		} catch (e) {
			console.warn("LocalStorage clear error:", e);
		}
	};
	const totalCompletedSpots = ITINERARY_DATA.flatMap((d) => d.spots).filter((s) => completedSpotIds.includes(s.id)).length;
	const totalSpotsCount = ITINERARY_DATA.flatMap((d) => d.spots).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-[#F0F4F8] text-slate-800 relative selection:bg-[#93C5FD] selection:text-[#1E3A8A] font-sans",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30 select-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-4 left-1/6 w-2 h-2 bg-white rounded-full animate-snow-1 blur-[0.5px]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-2 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-snow-2 blur-[0.5px]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-8 left-2/3 w-2.5 h-2.5 bg-white rounded-full animate-snow-3 blur-[1px]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 left-5/6 w-1.5 h-1.5 bg-white rounded-full animate-snow-1 blur-[0.5px]" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				currentDay: selectedDayNumber,
				totalDays: ITINERARY_DATA.length,
				currentArea: currentDayData.area,
				onOpenQuickJump: () => setQuickJumpOpen(true),
				onOpenShare: () => setShareModalOpen(true),
				onOpenSettings: () => {
					setActiveTab("settings");
					window.scrollTo({
						top: 0,
						behavior: "smooth"
					});
				}
			}),
			activeTab === "itinerary" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative z-10 pb-28",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DaySelector, {
					selectedDay: selectedDayNumber,
					onSelectDay: (dayNum) => setSelectedDayNumber(dayNum)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-2xl mx-auto px-4 py-4 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs relative overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 flex-wrap text-xs text-slate-500 font-medium mb-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-lg border border-[#DBEAFE]",
													children: ["Day ", currentDayData.dayNumber]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													currentDayData.date,
													" (",
													currentDayData.dayOfWeek,
													")"
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-slate-300",
													children: "·"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-slate-600 font-semibold",
													children: currentDayData.area
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "text-lg sm:text-xl font-bold text-slate-900 tracking-tight",
											children: currentDayData.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed",
											children: ["📍 ", currentDayData.routeHighlight]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "shrink-0 hidden sm:block",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShimaEnagaSvg, {
										size: 48,
										mood: "happy"
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-3.5 h-3.5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"今日已造訪：",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-slate-800 ml-1",
											children: currentDayData.spots.filter((s) => completedSpotIds.includes(s.id)).length
										}),
										" ",
										"/ ",
										currentDayData.spots.length,
										" 站"
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-[#2563EB] font-bold",
									children: [
										"共 ",
										currentDayData.spots.length,
										" 個行程站點"
									]
								})]
							})]
						}),
						currentDayData.hotel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HotelCard, {
							hotel: currentDayData.hotel,
							dayNumber: currentDayData.dayNumber
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-between gap-2 pt-1 pb-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar",
								children: CATEGORY_FILTERS.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setSelectedCategory(cat.id),
									className: `shrink-0 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${selectedCategory === cat.id ? "bg-[#2563EB] text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`,
									children: cat.label
								}, cat.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5",
							children: [filteredSpots.map((spot, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpotCard, {
								spot,
								index: idx,
								isCompleted: completedSpotIds.includes(spot.id),
								onToggleComplete: handleToggleComplete,
								photos: photos.filter((p) => p.spotId === spot.id),
								onAddPhoto: handleAddPhoto,
								onDeletePhoto: handleDeletePhoto,
								onViewPhoto: (photo) => setActivePhoto(photo)
							}, spot.id)), filteredSpots.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm",
									children: "此類別今日無排定景點"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setSelectedCategory("all"),
									className: "mt-2 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer",
									children: "顯示全部景點"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnowTipCard, {
								snowTip: currentDayData.snowTip,
								dayNumber: currentDayData.dayNumber
							})
						})
					]
				})]
			}),
			activeTab === "guide" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "relative z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideTab, {})
			}),
			activeTab === "weather" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "relative z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeatherTab, { initialDay: selectedDayNumber })
			}),
			activeTab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "relative z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsTab, {
					completedSpotIds,
					photos,
					onRestoreData: handleRestoreData,
					onClearPhotos: handleClearPhotos,
					onResetCompletedSpots: handleResetCompletedSpots,
					onClearAll: handleClearAll
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingNav, {
				activeTab,
				onSelectTab: (tab) => {
					setActiveTab(tab);
					window.scrollTo({
						top: 0,
						behavior: "smooth"
					});
				},
				photoCount: photos.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoModal, {
				photo: activePhoto,
				onClose: () => setActivePhoto(null),
				onDelete: handleDeletePhoto,
				onUpdateCaption: handleUpdateCaption
			}),
			quickJumpOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "dialog",
				"aria-modal": "true",
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "w-5 h-5 text-[#2563EB]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-bold text-slate-900 text-base",
									children: "快速跳轉天數"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setQuickJumpOpen(false),
								className: "w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-y-auto py-2 space-y-1.5 flex-1 pr-1",
							children: ITINERARY_DATA.map((day) => {
								const isSelected = day.dayNumber === selectedDayNumber;
								const completedForDay = day.spots.filter((s) => completedSpotIds.includes(s.id)).length;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => {
										setSelectedDayNumber(day.dayNumber);
										setActiveTab("itinerary");
										setQuickJumpOpen(false);
										window.scrollTo({
											top: 0,
											behavior: "smooth"
										});
									},
									className: `w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? "bg-[#EFF6FF] border-[#93C5FD] shadow-xs" : "bg-[#F8FAFC] hover:bg-slate-100 border-slate-200/80"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 pr-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs font-bold text-[#2563EB]",
													children: ["Day ", day.dayNumber]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs text-slate-400",
													children: [
														day.date,
														" (",
														day.dayOfWeek,
														")"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-bold text-slate-800 truncate mt-0.5",
												children: day.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-slate-500 truncate",
												children: day.area
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] text-slate-400",
											children: [
												completedForDay,
												" / ",
												day.spots.length
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-4 h-4 text-slate-400 ml-auto mt-0.5" })]
									})]
								}, day.dayNumber);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-3 border-t border-slate-100 text-center text-xs text-slate-500",
							children: [
								"全趟行程進度：",
								totalCompletedSpots,
								" / ",
								totalSpotsCount,
								" 站完成"
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareModal, {
				isOpen: shareModalOpen,
				onClose: () => setShareModalOpen(false)
			})
		]
	});
}
// src/main.tsx
(0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}));
