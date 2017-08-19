(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) +
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));

},{}],2:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.2.1
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }
    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
      var parent = this;

      var child = new this.constructor(lib$es6$promise$$internal$$noop);

      if (child[lib$es6$promise$$internal$$PROMISE_ID] === undefined) {
        lib$es6$promise$$internal$$makePromise(child);
      }

      var state = parent._state;

      if (state) {
        var callback = arguments[state - 1];
        lib$es6$promise$asap$$asap(function(){
          lib$es6$promise$$internal$$invokeCallback(state, child, callback, parent._result);
        });
      } else {
        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }
    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    var lib$es6$promise$$internal$$PROMISE_ID = Math.random().toString(36).substring(16);

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
      if (maybeThenable.constructor === promise.constructor &&
          then === lib$es6$promise$then$$default &&
          constructor.resolve === lib$es6$promise$promise$resolve$$default) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    var lib$es6$promise$$internal$$id = 0;
    function lib$es6$promise$$internal$$nextId() {
      return lib$es6$promise$$internal$$id++;
    }

    function lib$es6$promise$$internal$$makePromise(promise) {
      promise[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$id++;
      promise._state = undefined;
      promise._result = undefined;
      promise._subscribers = [];
    }

    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      if (!lib$es6$promise$utils$$isArray(entries)) {
        return new Constructor(function(resolve, reject) {
          reject(new TypeError('You must pass an array to race.'));
        });
      } else {
        return new Constructor(function(resolve, reject) {
          var length = entries.length;
          for (var i = 0; i < length; i++) {
            Constructor.resolve(entries[i]).then(resolve, reject);
          }
        });
      }
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;


    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$nextId();
      this._result = this._state = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
        this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: lib$es6$promise$then$$default,

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!this.promise[lib$es6$promise$$internal$$PROMISE_ID]) {
        lib$es6$promise$$internal$$makePromise(this.promise);
      }

      if (lib$es6$promise$utils$$isArray(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._result = new Array(this.length);

        if (this.length === 0) {
          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(this.promise, lib$es6$promise$enumerator$$validationError());
      }
    }

    function lib$es6$promise$enumerator$$validationError() {
      return new Error('Array Methods must be provided an Array');
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var input   = this._input;

      for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      var resolve = c.resolve;

      if (resolve === lib$es6$promise$promise$resolve$$default) {
        var then = lib$es6$promise$$internal$$getThen(entry);

        if (then === lib$es6$promise$then$$default &&
            entry._state !== lib$es6$promise$$internal$$PENDING) {
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof then !== 'function') {
          this._remaining--;
          this._result[i] = entry;
        } else if (c === lib$es6$promise$promise$$default) {
          var promise = new c(lib$es6$promise$$internal$$noop);
          lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
        }
      } else {
        this._willSettleAt(resolve(entry), i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        this._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          this._result[i] = value;
        }
      }

      if (this._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, this._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":41}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var NODE_LIST_CLASSES = {
  '[object HTMLCollection]': true,
  '[object NodeList]': true,
  '[object RadioNodeList]': true
};

// .type values for elements which can appear in .elements and should be ignored
var IGNORED_ELEMENT_TYPES = {
  'button': true,
  'fieldset': true,
  // 'keygen': true,
  // 'output': true,
  'reset': true,
  'submit': true
};

var CHECKED_INPUT_TYPES = {
  'checkbox': true,
  'radio': true
};

var TRIM_RE = /^\s+|\s+$/g;

var slice = Array.prototype.slice;
var toString = Object.prototype.toString;

/**
 * @param {HTMLFormElement} form
 * @param {Object} options
 * @return {Object.<string,(string|Array.<string>)>} an object containing
 *   submittable value(s) held in the form's .elements collection, with
 *   properties named as per element names or ids.
 */
function getFormData(form) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? { trim: false } : arguments[1];

  if (!form) {
    throw new Error('A form is required by getFormData, was given form=' + form);
  }

  var data = {};
  var elementName = undefined;
  var elementNames = [];
  var elementNameLookup = {};

  // Get unique submittable element names for the form
  for (var i = 0, l = form.elements.length; i < l; i++) {
    var element = form.elements[i];
    if (IGNORED_ELEMENT_TYPES[element.type] || element.disabled) {
      continue;
    }
    elementName = element.name || element.id;
    if (elementName && !elementNameLookup[elementName]) {
      elementNames.push(elementName);
      elementNameLookup[elementName] = true;
    }
  }

  // Extract element data name-by-name for consistent handling of special cases
  // around elements which contain multiple inputs.
  for (var i = 0, l = elementNames.length; i < l; i++) {
    elementName = elementNames[i];
    var value = getNamedFormElementData(form, elementName, options);
    if (value != null) {
      data[elementName] = value;
    }
  }

  return data;
}

/**
 * @param {HTMLFormElement} form
 * @param {string} elementName
 * @param {Object} options
 * @return {(string|Array.<string>)} submittable value(s) in the form for a
 *   named element from its .elements collection, or null if there was no
 *   element with that name or the element had no submittable value(s).
 */
function getNamedFormElementData(form, elementName) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? { trim: false } : arguments[2];

  if (!form) {
    throw new Error('A form is required by getNamedFormElementData, was given form=' + form);
  }
  if (!elementName && toString.call(elementName) !== '[object String]') {
    throw new Error('A form element name is required by getNamedFormElementData, was given elementName=' + elementName);
  }

  var element = form.elements[elementName];
  if (!element || element.disabled) {
    return null;
  }

  if (!NODE_LIST_CLASSES[toString.call(element)]) {
    return getFormElementValue(element, options.trim);
  }

  // Deal with multiple form controls which have the same name
  var data = [];
  var allRadios = true;
  for (var i = 0, l = element.length; i < l; i++) {
    if (element[i].disabled) {
      continue;
    }
    if (allRadios && element[i].type !== 'radio') {
      allRadios = false;
    }
    var value = getFormElementValue(element[i], options.trim);
    if (value != null) {
      data = data.concat(value);
    }
  }

  // Special case for an element with multiple same-named inputs which were all
  // radio buttons: if there was a selected value, only return the value.
  if (allRadios && data.length === 1) {
    return data[0];
  }

  return data.length > 0 ? data : null;
}

/**
 * @param {HTMLElement} element a form element.
 * @param {booleam} trim should values for text entry inputs be trimmed?
 * @return {(string|Array.<string>|File|Array.<File>)} the element's submittable
 *   value(s), or null if it had none.
 */
function getFormElementValue(element, trim) {
  var value = null;
  var type = element.type;

  if (type === 'select-one') {
    if (element.options.length) {
      value = element.options[element.selectedIndex].value;
    }
    return value;
  }

  if (type === 'select-multiple') {
    value = [];
    for (var i = 0, l = element.options.length; i < l; i++) {
      if (element.options[i].selected) {
        value.push(element.options[i].value);
      }
    }
    if (value.length === 0) {
      value = null;
    }
    return value;
  }

  // If a file input doesn't have a files attribute, fall through to using its
  // value attribute.
  if (type === 'file' && 'files' in element) {
    if (element.multiple) {
      value = slice.call(element.files);
      if (value.length === 0) {
        value = null;
      }
    } else {
      // Should be null if not present, according to the spec
      value = element.files[0];
    }
    return value;
  }

  if (!CHECKED_INPUT_TYPES[type]) {
    value = trim ? element.value.replace(TRIM_RE, '') : element.value;
  } else if (element.checked) {
    value = element.value;
  }

  return value;
}

getFormData.getNamedFormElementData = getNamedFormElementData;

exports['default'] = getFormData;
module.exports = exports['default'];
},{}],4:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
var wildcard = require('wildcard');
var reMimePartSplit = /[\/\+\.]/;

/**
  # mime-match

  A simple function to checker whether a target mime type matches a mime-type
  pattern (e.g. image/jpeg matches image/jpeg OR image/*).

  ## Example Usage

  <<< example.js

**/
module.exports = function(target, pattern) {
  function test(pattern) {
    var result = wildcard(pattern, target, reMimePartSplit);

    // ensure that we have a valid mime type (should have two parts)
    return result && result.length >= 2;
  }

  return pattern ? test(pattern.split(';')[0]) : test;
};

},{"wildcard":6}],6:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  While the library works in Node, if you are are looking for file-based
  wildcard matching then you should have a look at:

  <https://github.com/isaacs/node-glob>
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = ~text.indexOf('*');
  this.separator = separator;
  this.parts = text.split(separator);
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

module.exports = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};

},{}],7:[function(require,module,exports){
/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/
module.exports = function createNamespaceEmitter () {
  var emitter = {}
  var _fns = emitter._fns = {}

  /**
  * Emit an event. Optionally namespace the event. Handlers are fired in the order in which they were added with exact matches taking precedence. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – up to 6 arguments that are passed to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event, arg1, arg2, arg3, arg4, arg5, arg6) {
    var toEmit = getListeners(event)

    if (toEmit.length) {
      emitAll(event, toEmit, [arg1, arg2, arg3, arg4, arg5, arg6])
    }
  }

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (!_fns[event]) {
      _fns[event] = []
    }

    _fns[event].push(fn)
  }

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments)
      emitter.off(event, one)
    }
    this.on(event, one)
  }

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener,
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = []

    if (event && fn) {
      var fns = this._fns[event]
      var i = 0
      var l = fns.length

      for (i; i < l; i++) {
        if (fns[i] !== fn) {
          keep.push(fns[i])
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event]
  }

  function getListeners (e) {
    var out = _fns[e] ? _fns[e] : []
    var idx = e.indexOf(':')
    var args = (idx === -1) ? [e] : [e.substring(0, idx), e.substring(idx + 1)]

    var keys = Object.keys(_fns)
    var i = 0
    var l = keys.length

    for (i; i < l; i++) {
      var key = keys[i]
      if (key === '*') {
        out = out.concat(_fns[key])
      }

      if (args.length === 2 && args[0] === key) {
        out = out.concat(_fns[key])
        break
      }
    }

    return out
  }

  function emitAll (e, fns, args) {
    var i = 0
    var l = fns.length

    for (i; i < l; i++) {
      if (!fns[i]) break
      fns[i].event = e
      fns[i].apply(fns[i], args)
    }
  }

  return emitter
}

},{}],8:[function(require,module,exports){
'use strict'

var assert = require('assert')

module.exports = nanoraf

// Only call RAF when needed
// (fn, fn?) -> fn
function nanoraf (render, raf) {
  assert.equal(typeof render, 'function', 'nanoraf: render should be a function')
  assert.ok(typeof raf === 'function' || typeof raf === 'undefined', 'nanoraf: raf should be a function or undefined')

  if (!raf) raf = window.requestAnimationFrame
  var redrawScheduled = false
  var args = null

  return function frame () {
    if (args === null && !redrawScheduled) {
      redrawScheduled = true

      raf(function redraw () {
        redrawScheduled = false

        var length = args.length
        var _args = new Array(length)
        for (var i = 0; i < length; i++) _args[i] = args[i]

        render.apply(render, _args)
        args = null
      })
    }

    args = arguments
  }
}

},{"assert":39}],9:[function(require,module,exports){
/* global MutationObserver */
var document = require('global/document')
var window = require('global/window')
var watch = Object.create(null)
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36)
var KEY_ATTR = 'data-' + KEY_ID
var INDEX = 0

if (window && window.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff)
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff)
      eachMutation(mutations[i].addedNodes, turnon)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  })
}

module.exports = function onload (el, on, off, caller) {
  on = on || function () {}
  off = off || function () {}
  el.setAttribute(KEY_ATTR, 'o' + INDEX)
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller]
  INDEX += 1
  return el
}

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el)
    watch[index][2] = 1
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el)
    watch[index][2] = 0
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR)
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue]
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target)
  }
  if (watch[newValue]) {
    on(newValue, mutation.target)
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR)
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i])
        }
      })
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn)
    }
  }
}

},{"global/document":10,"global/window":11}],10:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":40}],11:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],12:[function(require,module,exports){
module.exports = prettierBytes

function prettierBytes (num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num)
  }

  var neg = num < 0
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  if (neg) {
    num = -num
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B'
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
  num = Number(num / Math.pow(1000, exponent))
  var unit = units[exponent]

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit
  }
}

},{}],13:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],14:[function(require,module,exports){
var bel = require('bel') // turns template tag into DOM elements
var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements
var defaultEvents = require('./update-events.js') // default events to be copied when dom elements update

module.exports = bel

// TODO move this + defaultEvents to a new module once we receive more feedback
module.exports.update = function (fromNode, toNode, opts) {
  if (!opts) opts = {}
  if (opts.events !== false) {
    if (!opts.onBeforeElUpdated) opts.onBeforeElUpdated = copier
  }

  return morphdom(fromNode, toNode, opts)

  // morphdom only copies attributes. we decided we also wanted to copy events
  // that can be set via attributes
  function copier (f, t) {
    // copy events:
    var events = opts.events || defaultEvents
    for (var i = 0; i < events.length; i++) {
      var ev = events[i]
      if (t[ev]) { // if new element has a whitelisted attribute
        f[ev] = t[ev] // update existing element
      } else if (f[ev]) { // if existing element has it and new one doesnt
        f[ev] = undefined // remove it from existing element
      }
    }
    var oldValue = f.value
    var newValue = t.value
    // copy values for form elements
    if ((f.nodeName === 'INPUT' && f.type !== 'file') || f.nodeName === 'SELECT') {
      if (!newValue) {
        t.value = f.value
      } else if (newValue !== oldValue) {
        f.value = newValue
      }
    } else if (f.nodeName === 'TEXTAREA') {
      if (t.getAttribute('value') === null) f.value = t.value
    }
  }
}

},{"./update-events.js":20,"bel":15,"morphdom":19}],15:[function(require,module,exports){
var document = require('global/document')
var hyperx = require('hyperx')
var onload = require('on-load')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = {
  autofocus: 1,
  checked: 1,
  defaultchecked: 1,
  disabled: 1,
  formnovalidate: 1,
  indeterminate: 1,
  readonly: 1,
  required: 1,
  selected: 1,
  willvalidate: 1
}
var COMMENT_TAG = '!--'
var SVG_TAGS = [
  'svg',
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
  'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face',
  'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
  'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
  'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // If adding onload events
  if (props.onload || props.onunload) {
    var load = props.onload || function () {}
    var unload = props.onunload || function () {}
    onload(el, function belOnload () {
      load(el)
    }, function belOnunload () {
      unload(el)
    },
    // We have to use non-standard `caller` to find who invokes `belCreateElement`
    belCreateElement.caller.caller.caller)
    delete props.onload
    delete props.onunload
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS[key]) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  function appendChild (childs) {
    if (!Array.isArray(childs)) return
    for (var i = 0; i < childs.length; i++) {
      var node = childs[i]
      if (Array.isArray(node)) {
        appendChild(node)
        continue
      }

      if (typeof node === 'number' ||
        typeof node === 'boolean' ||
        typeof node === 'function' ||
        node instanceof Date ||
        node instanceof RegExp) {
        node = node.toString()
      }

      if (typeof node === 'string') {
        if (el.lastChild && el.lastChild.nodeName === '#text') {
          el.lastChild.nodeValue += node
          continue
        }
        node = document.createTextNode(node)
      }

      if (node && node.nodeType) {
        el.appendChild(node)
      }
    }
  }
  appendChild(children)

  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"global/document":16,"hyperx":17,"on-load":9}],16:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":40}],17:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        p.push([ VAR, xstate, arg ])
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else cur[1][key] = concat(cur[1][key], parts[i][1])
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else cur[1][key] = concat(cur[1][key], parts[i][2])
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)],[CLOSE])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && /\s/.test(c)) {
          res.push([OPEN, reg])
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var hasOwn = Object.prototype.hasOwnProperty
function has (obj, key) { return hasOwn.call(obj, key) }

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":18}],18:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],19:[function(require,module,exports){
'use strict';

var range; // Create a range object for efficently rendering strings to elements.
var NS_XHTML = 'http://www.w3.org/1999/xhtml';

var doc = typeof document === 'undefined' ? undefined : document;

var testEl = doc ?
    doc.body || doc.createElement('div') :
    {};

// Fixes <https://github.com/patrick-steele-idem/morphdom/issues/32>
// (IE7+ support) <=IE7 does not support el.hasAttribute(name)
var actualHasAttributeNS;

if (testEl.hasAttributeNS) {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttributeNS(namespaceURI, name);
    };
} else if (testEl.hasAttribute) {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttribute(name);
    };
} else {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.getAttributeNode(namespaceURI, name) != null;
    };
}

var hasAttributeNS = actualHasAttributeNS;


function toElement(str) {
    if (!range && doc.createRange) {
        range = doc.createRange();
        range.selectNode(doc.body);
    }

    var fragment;
    if (range && range.createContextualFragment) {
        fragment = range.createContextualFragment(str);
    } else {
        fragment = doc.createElement('body');
        fragment.innerHTML = str;
    }
    return fragment.childNodes[0];
}

/**
 * Returns true if two node's names are the same.
 *
 * NOTE: We don't bother checking `namespaceURI` because you will never find two HTML elements with the same
 *       nodeName and different namespace URIs.
 *
 * @param {Element} a
 * @param {Element} b The target element
 * @return {boolean}
 */
function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;

    if (fromNodeName === toNodeName) {
        return true;
    }

    if (toEl.actualize &&
        fromNodeName.charCodeAt(0) < 91 && /* from tag name is upper case */
        toNodeName.charCodeAt(0) > 90 /* target tag name is lower case */) {
        // If the target element is a virtual DOM node then we may need to normalize the tag name
        // before comparing. Normal HTML elements that are in the "http://www.w3.org/1999/xhtml"
        // are converted to upper case
        return fromNodeName === toNodeName.toUpperCase();
    } else {
        return false;
    }
}

/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {Element}
 */
function createElementNS(name, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML ?
        doc.createElement(name) :
        doc.createElementNS(namespaceURI, name);
}

/**
 * Copies the children of one DOM element to another DOM element
 */
function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
        var nextChild = curChild.nextSibling;
        toEl.appendChild(curChild);
        curChild = nextChild;
    }
    return toEl;
}

function morphAttrs(fromNode, toNode) {
    var attrs = toNode.attributes;
    var i;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;

    for (i = attrs.length - 1; i >= 0; --i) {
        attr = attrs[i];
        attrName = attr.name;
        attrNamespaceURI = attr.namespaceURI;
        attrValue = attr.value;

        if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);

            if (fromValue !== attrValue) {
                fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
            }
        } else {
            fromValue = fromNode.getAttribute(attrName);

            if (fromValue !== attrValue) {
                fromNode.setAttribute(attrName, attrValue);
            }
        }
    }

    // Remove any extra attributes found on the original DOM element that
    // weren't found on the target element.
    attrs = fromNode.attributes;

    for (i = attrs.length - 1; i >= 0; --i) {
        attr = attrs[i];
        if (attr.specified !== false) {
            attrName = attr.name;
            attrNamespaceURI = attr.namespaceURI;

            if (attrNamespaceURI) {
                attrName = attr.localName || attrName;

                if (!hasAttributeNS(toNode, attrNamespaceURI, attrName)) {
                    fromNode.removeAttributeNS(attrNamespaceURI, attrName);
                }
            } else {
                if (!hasAttributeNS(toNode, null, attrName)) {
                    fromNode.removeAttribute(attrName);
                }
            }
        }
    }
}

function syncBooleanAttrProp(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
        fromEl[name] = toEl[name];
        if (fromEl[name]) {
            fromEl.setAttribute(name, '');
        } else {
            fromEl.removeAttribute(name, '');
        }
    }
}

var specialElHandlers = {
    /**
     * Needed for IE. Apparently IE doesn't think that "selected" is an
     * attribute when reading over the attributes using selectEl.attributes
     */
    OPTION: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'selected');
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'checked');
        syncBooleanAttrProp(fromEl, toEl, 'disabled');

        if (fromEl.value !== toEl.value) {
            fromEl.value = toEl.value;
        }

        if (!hasAttributeNS(toEl, null, 'value')) {
            fromEl.removeAttribute('value');
        }
    },

    TEXTAREA: function(fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value !== newValue) {
            fromEl.value = newValue;
        }

        var firstChild = fromEl.firstChild;
        if (firstChild) {
            // Needed for IE. Apparently IE sets the placeholder as the
            // node value and vise versa. This ignores an empty update.
            var oldValue = firstChild.nodeValue;

            if (oldValue == newValue || (!newValue && oldValue == fromEl.placeholder)) {
                return;
            }

            firstChild.nodeValue = newValue;
        }
    },
    SELECT: function(fromEl, toEl) {
        if (!hasAttributeNS(toEl, null, 'multiple')) {
            var selectedIndex = -1;
            var i = 0;
            var curChild = toEl.firstChild;
            while(curChild) {
                var nodeName = curChild.nodeName;
                if (nodeName && nodeName.toUpperCase() === 'OPTION') {
                    if (hasAttributeNS(curChild, null, 'selected')) {
                        selectedIndex = i;
                        break;
                    }
                    i++;
                }
                curChild = curChild.nextSibling;
            }

            fromEl.selectedIndex = i;
        }
    }
};

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

function noop() {}

function defaultGetNodeKey(node) {
    return node.id;
}

function morphdomFactory(morphAttrs) {

    return function morphdom(fromNode, toNode, options) {
        if (!options) {
            options = {};
        }

        if (typeof toNode === 'string') {
            if (fromNode.nodeName === '#document' || fromNode.nodeName === 'HTML') {
                var toNodeHtml = toNode;
                toNode = doc.createElement('html');
                toNode.innerHTML = toNodeHtml;
            } else {
                toNode = toElement(toNode);
            }
        }

        var getNodeKey = options.getNodeKey || defaultGetNodeKey;
        var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
        var onNodeAdded = options.onNodeAdded || noop;
        var onBeforeElUpdated = options.onBeforeElUpdated || noop;
        var onElUpdated = options.onElUpdated || noop;
        var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
        var onNodeDiscarded = options.onNodeDiscarded || noop;
        var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
        var childrenOnly = options.childrenOnly === true;

        // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
        var fromNodesLookup = {};
        var keyedRemovalList;

        function addKeyedRemoval(key) {
            if (keyedRemovalList) {
                keyedRemovalList.push(key);
            } else {
                keyedRemovalList = [key];
            }
        }

        function walkDiscardedChildNodes(node, skipKeyedNodes) {
            if (node.nodeType === ELEMENT_NODE) {
                var curChild = node.firstChild;
                while (curChild) {

                    var key = undefined;

                    if (skipKeyedNodes && (key = getNodeKey(curChild))) {
                        // If we are skipping keyed nodes then we add the key
                        // to a list so that it can be handled at the very end.
                        addKeyedRemoval(key);
                    } else {
                        // Only report the node as discarded if it is not keyed. We do this because
                        // at the end we loop through all keyed elements that were unmatched
                        // and then discard them in one final pass.
                        onNodeDiscarded(curChild);
                        if (curChild.firstChild) {
                            walkDiscardedChildNodes(curChild, skipKeyedNodes);
                        }
                    }

                    curChild = curChild.nextSibling;
                }
            }
        }

        /**
         * Removes a DOM node out of the original DOM
         *
         * @param  {Node} node The node to remove
         * @param  {Node} parentNode The nodes parent
         * @param  {Boolean} skipKeyedNodes If true then elements with keys will be skipped and not discarded.
         * @return {undefined}
         */
        function removeNode(node, parentNode, skipKeyedNodes) {
            if (onBeforeNodeDiscarded(node) === false) {
                return;
            }

            if (parentNode) {
                parentNode.removeChild(node);
            }

            onNodeDiscarded(node);
            walkDiscardedChildNodes(node, skipKeyedNodes);
        }

        // // TreeWalker implementation is no faster, but keeping this around in case this changes in the future
        // function indexTree(root) {
        //     var treeWalker = document.createTreeWalker(
        //         root,
        //         NodeFilter.SHOW_ELEMENT);
        //
        //     var el;
        //     while((el = treeWalker.nextNode())) {
        //         var key = getNodeKey(el);
        //         if (key) {
        //             fromNodesLookup[key] = el;
        //         }
        //     }
        // }

        // // NodeIterator implementation is no faster, but keeping this around in case this changes in the future
        //
        // function indexTree(node) {
        //     var nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
        //     var el;
        //     while((el = nodeIterator.nextNode())) {
        //         var key = getNodeKey(el);
        //         if (key) {
        //             fromNodesLookup[key] = el;
        //         }
        //     }
        // }

        function indexTree(node) {
            if (node.nodeType === ELEMENT_NODE) {
                var curChild = node.firstChild;
                while (curChild) {
                    var key = getNodeKey(curChild);
                    if (key) {
                        fromNodesLookup[key] = curChild;
                    }

                    // Walk recursively
                    indexTree(curChild);

                    curChild = curChild.nextSibling;
                }
            }
        }

        indexTree(fromNode);

        function handleNodeAdded(el) {
            onNodeAdded(el);

            var curChild = el.firstChild;
            while (curChild) {
                var nextSibling = curChild.nextSibling;

                var key = getNodeKey(curChild);
                if (key) {
                    var unmatchedFromEl = fromNodesLookup[key];
                    if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
                        curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
                        morphEl(unmatchedFromEl, curChild);
                    }
                }

                handleNodeAdded(curChild);
                curChild = nextSibling;
            }
        }

        function morphEl(fromEl, toEl, childrenOnly) {
            var toElKey = getNodeKey(toEl);
            var curFromNodeKey;

            if (toElKey) {
                // If an element with an ID is being morphed then it is will be in the final
                // DOM so clear it out of the saved elements collection
                delete fromNodesLookup[toElKey];
            }

            if (toNode.isSameNode && toNode.isSameNode(fromNode)) {
                return;
            }

            if (!childrenOnly) {
                if (onBeforeElUpdated(fromEl, toEl) === false) {
                    return;
                }

                morphAttrs(fromEl, toEl);
                onElUpdated(fromEl);

                if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
                    return;
                }
            }

            if (fromEl.nodeName !== 'TEXTAREA') {
                var curToNodeChild = toEl.firstChild;
                var curFromNodeChild = fromEl.firstChild;
                var curToNodeKey;

                var fromNextSibling;
                var toNextSibling;
                var matchingFromEl;

                outer: while (curToNodeChild) {
                    toNextSibling = curToNodeChild.nextSibling;
                    curToNodeKey = getNodeKey(curToNodeChild);

                    while (curFromNodeChild) {
                        fromNextSibling = curFromNodeChild.nextSibling;

                        if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }

                        curFromNodeKey = getNodeKey(curFromNodeChild);

                        var curFromNodeType = curFromNodeChild.nodeType;

                        var isCompatible = undefined;

                        if (curFromNodeType === curToNodeChild.nodeType) {
                            if (curFromNodeType === ELEMENT_NODE) {
                                // Both nodes being compared are Element nodes

                                if (curToNodeKey) {
                                    // The target node has a key so we want to match it up with the correct element
                                    // in the original DOM tree
                                    if (curToNodeKey !== curFromNodeKey) {
                                        // The current element in the original DOM tree does not have a matching key so
                                        // let's check our lookup to see if there is a matching element in the original
                                        // DOM tree
                                        if ((matchingFromEl = fromNodesLookup[curToNodeKey])) {
                                            if (curFromNodeChild.nextSibling === matchingFromEl) {
                                                // Special case for single element removals. To avoid removing the original
                                                // DOM node out of the tree (since that can break CSS transitions, etc.),
                                                // we will instead discard the current node and wait until the next
                                                // iteration to properly match up the keyed target element with its matching
                                                // element in the original tree
                                                isCompatible = false;
                                            } else {
                                                // We found a matching keyed element somewhere in the original DOM tree.
                                                // Let's moving the original DOM node into the current position and morph
                                                // it.

                                                // NOTE: We use insertBefore instead of replaceChild because we want to go through
                                                // the `removeNode()` function for the node that is being discarded so that
                                                // all lifecycle hooks are correctly invoked
                                                fromEl.insertBefore(matchingFromEl, curFromNodeChild);

                                                fromNextSibling = curFromNodeChild.nextSibling;

                                                if (curFromNodeKey) {
                                                    // Since the node is keyed it might be matched up later so we defer
                                                    // the actual removal to later
                                                    addKeyedRemoval(curFromNodeKey);
                                                } else {
                                                    // NOTE: we skip nested keyed nodes from being removed since there is
                                                    //       still a chance they will be matched up later
                                                    removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                                                }

                                                curFromNodeChild = matchingFromEl;
                                            }
                                        } else {
                                            // The nodes are not compatible since the "to" node has a key and there
                                            // is no matching keyed node in the source tree
                                            isCompatible = false;
                                        }
                                    }
                                } else if (curFromNodeKey) {
                                    // The original has a key
                                    isCompatible = false;
                                }

                                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                                if (isCompatible) {
                                    // We found compatible DOM elements so transform
                                    // the current "from" node to match the current
                                    // target DOM node.
                                    morphEl(curFromNodeChild, curToNodeChild);
                                }

                            } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                                // Both nodes being compared are Text or Comment nodes
                                isCompatible = true;
                                // Simply update nodeValue on the original node to
                                // change the text value
                                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                                    curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                                }

                            }
                        }

                        if (isCompatible) {
                            // Advance both the "to" child and the "from" child since we found a match
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }

                        // No compatible match so remove the old node from the DOM and continue trying to find a
                        // match in the original DOM. However, we only do this if the from node is not keyed
                        // since it is possible that a keyed node might match up with a node somewhere else in the
                        // target tree and we don't want to discard it just yet since it still might find a
                        // home in the final DOM tree. After everything is done we will remove any keyed nodes
                        // that didn't find a home
                        if (curFromNodeKey) {
                            // Since the node is keyed it might be matched up later so we defer
                            // the actual removal to later
                            addKeyedRemoval(curFromNodeKey);
                        } else {
                            // NOTE: we skip nested keyed nodes from being removed since there is
                            //       still a chance they will be matched up later
                            removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                        }

                        curFromNodeChild = fromNextSibling;
                    }

                    // If we got this far then we did not find a candidate match for
                    // our "to node" and we exhausted all of the children "from"
                    // nodes. Therefore, we will just append the current "to" node
                    // to the end
                    if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
                        fromEl.appendChild(matchingFromEl);
                        morphEl(matchingFromEl, curToNodeChild);
                    } else {
                        var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
                        if (onBeforeNodeAddedResult !== false) {
                            if (onBeforeNodeAddedResult) {
                                curToNodeChild = onBeforeNodeAddedResult;
                            }

                            if (curToNodeChild.actualize) {
                                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
                            }
                            fromEl.appendChild(curToNodeChild);
                            handleNodeAdded(curToNodeChild);
                        }
                    }

                    curToNodeChild = toNextSibling;
                    curFromNodeChild = fromNextSibling;
                }

                // We have processed all of the "to nodes". If curFromNodeChild is
                // non-null then we still have some from nodes left over that need
                // to be removed
                while (curFromNodeChild) {
                    fromNextSibling = curFromNodeChild.nextSibling;
                    if ((curFromNodeKey = getNodeKey(curFromNodeChild))) {
                        // Since the node is keyed it might be matched up later so we defer
                        // the actual removal to later
                        addKeyedRemoval(curFromNodeKey);
                    } else {
                        // NOTE: we skip nested keyed nodes from being removed since there is
                        //       still a chance they will be matched up later
                        removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                    }
                    curFromNodeChild = fromNextSibling;
                }
            }

            var specialElHandler = specialElHandlers[fromEl.nodeName];
            if (specialElHandler) {
                specialElHandler(fromEl, toEl);
            }
        } // END: morphEl(...)

        var morphedNode = fromNode;
        var morphedNodeType = morphedNode.nodeType;
        var toNodeType = toNode.nodeType;

        if (!childrenOnly) {
            // Handle the case where we are given two DOM nodes that are not
            // compatible (e.g. <div> --> <span> or <div> --> TEXT)
            if (morphedNodeType === ELEMENT_NODE) {
                if (toNodeType === ELEMENT_NODE) {
                    if (!compareNodeNames(fromNode, toNode)) {
                        onNodeDiscarded(fromNode);
                        morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
                    }
                } else {
                    // Going from an element node to a text node
                    morphedNode = toNode;
                }
            } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) { // Text or comment node
                if (toNodeType === morphedNodeType) {
                    if (morphedNode.nodeValue !== toNode.nodeValue) {
                        morphedNode.nodeValue = toNode.nodeValue;
                    }

                    return morphedNode;
                } else {
                    // Text node to something else
                    morphedNode = toNode;
                }
            }
        }

        if (morphedNode === toNode) {
            // The "to node" was not compatible with the "from node" so we had to
            // toss out the "from node" and use the "to node"
            onNodeDiscarded(fromNode);
        } else {
            morphEl(morphedNode, toNode, childrenOnly);

            // We now need to loop over any keyed nodes that might need to be
            // removed. We only do the removal if we know that the keyed node
            // never found a match. When a keyed node is matched up we remove
            // it out of fromNodesLookup and we use fromNodesLookup to determine
            // if a keyed node has been matched up or not
            if (keyedRemovalList) {
                for (var i=0, len=keyedRemovalList.length; i<len; i++) {
                    var elToRemove = fromNodesLookup[keyedRemovalList[i]];
                    if (elToRemove) {
                        removeNode(elToRemove, elToRemove.parentNode, false);
                    }
                }
            }
        }

        if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
            if (morphedNode.actualize) {
                morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
            }
            // If we had to swap out the from node with a new node because the old
            // node was not compatible with the target node then we need to
            // replace the old DOM node in the original DOM tree. This is only
            // possible if the original DOM node was part of a DOM tree which
            // we know is the case if it has a parent node.
            fromNode.parentNode.replaceChild(morphedNode, fromNode);
        }

        return morphedNode;
    };
}

var morphdom = morphdomFactory(morphAttrs);

module.exports = morphdom;

},{}],20:[function(require,module,exports){
module.exports = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
]

},{}],21:[function(require,module,exports){
module.exports = function yoyoifyAppendChild (el, childs) {
  for (var i = 0; i < childs.length; i++) {
    var node = childs[i]
    if (Array.isArray(node)) {
      yoyoifyAppendChild(el, node)
      continue
    }
    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      node instanceof Date ||
      node instanceof RegExp) {
      node = node.toString()
    }
    if (typeof node === 'string') {
      if (el.lastChild && el.lastChild.nodeName === '#text') {
        el.lastChild.nodeValue += node
        continue
      }
      node = document.createTextNode(node)
    }
    if (node && node.nodeType) {
      el.appendChild(node)
    }
  }
}

},{}],22:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = require('../core/Utils');
var Translator = require('../core/Translator');
var UppySocket = require('./UppySocket');
var ee = require('namespace-emitter');
var cuid = require('cuid');
var throttle = require('lodash.throttle');
var prettyBytes = require('prettier-bytes');
var match = require('mime-match');
// const en_US = require('../locales/en_US')
// const deepFreeze = require('deep-freeze-strict')

/**
 * Main Uppy core
 *
 * @param {object} opts general options, like locales, to show modal or not to show
 */

var Uppy = function () {
  function Uppy(opts) {
    _classCallCheck(this, Uppy);

    var defaultLocale = {
      strings: {
        youCanOnlyUploadX: {
          0: 'You can only upload %{smart_count} file',
          1: 'You can only upload %{smart_count} files'
        },
        youHaveToAtLeastSelectX: {
          0: 'You have to select at least %{smart_count} file',
          1: 'You have to select at least %{smart_count} files'
        },
        exceedsSize: 'This file exceeds maximum allowed size of',
        youCanOnlyUploadFileTypes: 'You can only upload:',
        uppyServerError: 'Connection with Uppy server failed'
      }

      // set default options
    };var defaultOptions = {
      autoProceed: true,
      debug: false,
      restrictions: {
        maxFileSize: false,
        maxNumberOfFiles: false,
        minNumberOfFiles: false,
        allowedFileTypes: false
      },
      onBeforeFileAdded: function onBeforeFileAdded(currentFile, files) {
        return Promise.resolve();
      },
      onBeforeUpload: function onBeforeUpload(files, done) {
        return Promise.resolve();
      },
      locale: defaultLocale

      // Merge default options with the ones set by user
    };this.opts = _extends({}, defaultOptions, opts);

    // // Dictates in what order different plugin types are ran:
    // this.types = [ 'presetter', 'orchestrator', 'progressindicator',
    //                 'acquirer', 'modifier', 'uploader', 'presenter', 'debugger']

    this.locale = _extends({}, defaultLocale, this.opts.locale);
    this.locale.strings = _extends({}, defaultLocale.strings, this.opts.locale.strings);

    // i18n
    this.translator = new Translator({ locale: this.locale });
    this.i18n = this.translator.translate.bind(this.translator);

    // Container for different types of plugins
    this.plugins = {};

    // @TODO maybe bindall
    this.translator = new Translator({ locale: this.opts.locale });
    this.i18n = this.translator.translate.bind(this.translator);
    this.getState = this.getState.bind(this);
    this.updateMeta = this.updateMeta.bind(this);
    this.initSocket = this.initSocket.bind(this);
    this.log = this.log.bind(this);
    this.addFile = this.addFile.bind(this);
    this.calculateProgress = this.calculateProgress.bind(this);
    this.resetProgress = this.resetProgress.bind(this);

    // this.bus = this.emitter = ee()
    this.emitter = ee();
    this.on = this.emitter.on.bind(this.emitter);
    this.off = this.emitter.off.bind(this.emitter);
    this.once = this.emitter.once.bind(this.emitter);
    this.emit = this.emitter.emit.bind(this.emitter);

    this.preProcessors = [];
    this.uploaders = [];
    this.postProcessors = [];

    this.state = {
      files: {},
      capabilities: {
        resumableUploads: false
      },
      totalProgress: 0,
      meta: _extends({}, this.opts.meta),
      info: {
        isHidden: true,
        type: '',
        msg: ''
      }

      // for debugging and testing
    };this.updateNum = 0;
    if (this.opts.debug) {
      global.UppyState = this.state;
      global.uppyLog = '';
      // global.UppyAddFile = this.addFile.bind(this)
      global._uppy = this;
    }
  }

  /**
   * Iterate on all plugins and run `update` on them. Called each time state changes
   *
   */


  Uppy.prototype.updateAll = function updateAll(state) {
    var _this = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this.plugins[pluginType].forEach(function (plugin) {
        plugin.update(state);
      });
    });
  };

  /**
   * Updates state
   *
   * @param {newState} object
   */


  Uppy.prototype.setState = function setState(stateUpdate) {
    var newState = _extends({}, this.state, stateUpdate);
    this.emit('core:state-update', this.state, newState, stateUpdate);

    this.state = newState;
    this.updateAll(this.state);
  };

  /**
   * Returns current state
   *
   */


  Uppy.prototype.getState = function getState() {
    // use deepFreeze for debugging
    // return deepFreeze(this.state)
    return this.state;
  };

  Uppy.prototype.reset = function reset() {
    this.emit('core:pause-all');
    this.emit('core:cancel-all');
    this.setState({
      totalProgress: 0
    });
  };

  Uppy.prototype.resetProgress = function resetProgress() {
    var defaultProgress = {
      percentage: 0,
      bytesUploaded: 0,
      uploadComplete: false,
      uploadStarted: false
    };
    var files = _extends({}, this.state.files);
    var updatedFiles = {};
    Object.keys(files).forEach(function (fileID) {
      var updatedFile = _extends({}, files[fileID]);
      updatedFile.progress = _extends({}, updatedFile.progress, defaultProgress);
      updatedFiles[fileID] = updatedFile;
    });
    console.log(updatedFiles);
    this.setState({
      files: updatedFiles,
      totalProgress: 0
    });
  };

  Uppy.prototype.addPreProcessor = function addPreProcessor(fn) {
    this.preProcessors.push(fn);
  };

  Uppy.prototype.removePreProcessor = function removePreProcessor(fn) {
    var i = this.preProcessors.indexOf(fn);
    if (i !== -1) {
      this.preProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addPostProcessor = function addPostProcessor(fn) {
    this.postProcessors.push(fn);
  };

  Uppy.prototype.removePostProcessor = function removePostProcessor(fn) {
    var i = this.postProcessors.indexOf(fn);
    if (i !== -1) {
      this.postProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addUploader = function addUploader(fn) {
    this.uploaders.push(fn);
  };

  Uppy.prototype.removeUploader = function removeUploader(fn) {
    var i = this.uploaders.indexOf(fn);
    if (i !== -1) {
      this.uploaders.splice(i, 1);
    }
  };

  Uppy.prototype.setMeta = function setMeta(data) {
    var newMeta = _extends({}, this.getState().meta, data);
    this.log('Adding metadata:');
    this.log(data);
    this.setState({ meta: newMeta });
  };

  Uppy.prototype.updateMeta = function updateMeta(data, fileID) {
    var updatedFiles = _extends({}, this.getState().files);
    var newMeta = _extends({}, updatedFiles[fileID].meta, data);
    updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
      meta: newMeta
    });
    this.setState({ files: updatedFiles });
  };

  Uppy.prototype.checkRestrictions = function checkRestrictions(checkMinNumberOfFiles, file, fileType) {
    var _opts$restrictions = this.opts.restrictions,
        maxFileSize = _opts$restrictions.maxFileSize,
        maxNumberOfFiles = _opts$restrictions.maxNumberOfFiles,
        minNumberOfFiles = _opts$restrictions.minNumberOfFiles,
        allowedFileTypes = _opts$restrictions.allowedFileTypes;


    if (checkMinNumberOfFiles && minNumberOfFiles) {
      if (Object.keys(this.state.files).length < minNumberOfFiles) {
        this.info('' + this.i18n('youHaveToAtLeastSelectX', { smart_count: minNumberOfFiles }), 'error', 5000);
        return false;
      }
      return true;
    }

    if (maxNumberOfFiles) {
      if (Object.keys(this.state.files).length + 1 > maxNumberOfFiles) {
        this.info('' + this.i18n('youCanOnlyUploadX', { smart_count: maxNumberOfFiles }), 'error', 5000);
        return false;
      }
    }

    if (allowedFileTypes) {
      var isCorrectFileType = allowedFileTypes.filter(match(fileType.join('/'))).length > 0;
      if (!isCorrectFileType) {
        var allowedFileTypesString = allowedFileTypes.join(', ');
        this.info(this.i18n('youCanOnlyUploadFileTypes') + ' ' + allowedFileTypesString, 'error', 5000);
        return false;
      }
    }

    if (maxFileSize) {
      if (file.data.size > maxFileSize) {
        this.info(this.i18n('exceedsSize') + ' ' + prettyBytes(maxFileSize), 'error', 5000);
        return false;
      }
    }

    return true;
  };

  Uppy.prototype.addFile = function addFile(file) {
    var _this2 = this;

    return this.opts.onBeforeFileAdded(file, this.getState().files).catch(function (err) {
      _this2.info(err, 'error', 5000);
      return Promise.reject('onBeforeFileAdded: ' + err);
    }).then(function () {
      return Utils.getFileType(file).then(function (fileType) {
        var updatedFiles = _extends({}, _this2.state.files);
        var fileName = file.name || 'noname';
        var fileExtension = Utils.getFileNameAndExtension(fileName)[1];
        var isRemote = file.isRemote || false;

        var fileID = Utils.generateFileID(file);
        var fileTypeGeneral = fileType[0];
        var fileTypeSpecific = fileType[1];

        var newFile = {
          source: file.source || '',
          id: fileID,
          name: fileName,
          extension: fileExtension || '',
          meta: _extends({}, { name: fileName }, _this2.getState().meta),
          type: {
            general: fileTypeGeneral,
            specific: fileTypeSpecific
          },
          data: file.data,
          progress: {
            percentage: 0,
            bytesUploaded: 0,
            bytesTotal: file.data.size || 0,
            uploadComplete: false,
            uploadStarted: false
          },
          size: file.data.size || 'N/A',
          isRemote: isRemote,
          remote: file.remote || '',
          preview: file.preview
        };

        var isFileAllowed = _this2.checkRestrictions(false, newFile, fileType);
        if (!isFileAllowed) return Promise.reject('File not allowed');

        updatedFiles[fileID] = newFile;
        _this2.setState({ files: updatedFiles });

        _this2.emit('core:file-added', newFile);
        _this2.log('Added file: ' + fileName + ', ' + fileID + ', mime type: ' + fileType);

        if (_this2.opts.autoProceed && !_this2.scheduledAutoProceed) {
          _this2.scheduledAutoProceed = setTimeout(function () {
            _this2.scheduledAutoProceed = null;
            _this2.upload().catch(function (err) {
              console.error(err.stack || err.message || err);
            });
          }, 4);
        }
      });
    });
  };

  /**
   * Get a file object.
   *
   * @param {string} fileID The ID of the file object to return.
   */


  Uppy.prototype.getFile = function getFile(fileID) {
    return this.getState().files[fileID];
  };

  /**
   * Generate a preview image for the given file, if possible.
   */


  Uppy.prototype.generatePreview = function generatePreview(file) {
    var _this3 = this;

    if (Utils.isPreviewSupported(file.type.specific) && !file.isRemote) {
      Utils.createThumbnail(file, 200).then(function (thumbnail) {
        _this3.setPreviewURL(file.id, thumbnail);
      }).catch(function (err) {
        console.warn(err.stack || err.message);
      });
    }
  };

  /**
   * Set the preview URL for a file.
   */


  Uppy.prototype.setPreviewURL = function setPreviewURL(fileID, preview) {
    var _extends2;

    var files = this.state.files;

    this.setState({
      files: _extends({}, files, (_extends2 = {}, _extends2[fileID] = _extends({}, files[fileID], {
        preview: preview
      }), _extends2))
    });
  };

  Uppy.prototype.removeFile = function removeFile(fileID) {
    var updatedFiles = _extends({}, this.getState().files);
    var removedFile = updatedFiles[fileID];
    delete updatedFiles[fileID];

    this.setState({ files: updatedFiles });
    this.calculateTotalProgress();
    this.emit('core:file-removed', fileID);

    // Clean up object URLs.
    if (removedFile.preview && Utils.isObjectURL(removedFile.preview)) {
      URL.revokeObjectURL(removedFile.preview);
    }

    this.log('Removed file: ' + fileID);
  };

  Uppy.prototype.calculateProgress = function calculateProgress(data) {
    var fileID = data.id;
    var updatedFiles = _extends({}, this.getState().files);

    // skip progress event for a file that’s been removed
    if (!updatedFiles[fileID]) {
      this.log('Trying to set progress for a file that’s not with us anymore: ', fileID);
      return;
    }

    var updatedFile = _extends({}, updatedFiles[fileID], _extends({}, {
      progress: _extends({}, updatedFiles[fileID].progress, {
        bytesUploaded: data.bytesUploaded,
        bytesTotal: data.bytesTotal,
        percentage: Math.floor((data.bytesUploaded / data.bytesTotal * 100).toFixed(2))
      })
    }));
    updatedFiles[data.id] = updatedFile;

    this.setState({
      files: updatedFiles
    });

    this.calculateTotalProgress();
  };

  Uppy.prototype.calculateTotalProgress = function calculateTotalProgress() {
    // calculate total progress, using the number of files currently uploading,
    // multiplied by 100 and the summ of individual progress of each file
    var files = _extends({}, this.getState().files);

    var inProgress = Object.keys(files).filter(function (file) {
      return files[file].progress.uploadStarted;
    });
    var progressMax = inProgress.length * 100;
    var progressAll = 0;
    inProgress.forEach(function (file) {
      progressAll = progressAll + files[file].progress.percentage;
    });

    var totalProgress = Math.floor((progressAll * 100 / progressMax).toFixed(2));

    this.setState({
      totalProgress: totalProgress
    });
  };

  /**
   * Registers listeners for all global actions, like:
   * `file-add`, `file-remove`, `upload-progress`, `reset`
   *
   */


  Uppy.prototype.actions = function actions() {
    var _this4 = this;

    // this.bus.on('*', (payload) => {
    //   console.log('emitted: ', this.event)
    //   console.log('with payload: ', payload)
    // })

    // stress-test re-rendering
    // setInterval(() => {
    //   this.setState({bla: 'bla'})
    // }, 20)

    this.on('core:error', function (error) {
      _this4.setState({ error: error });
    });

    this.on('core:upload', function () {
      _this4.setState({ error: null });
    });

    this.on('core:file-add', function (data) {
      _this4.addFile(data);
    });

    this.on('core:file-added', function (file) {
      _this4.generatePreview(file);
    });

    // `remove-file` removes a file from `state.files`, for example when
    // a user decides not to upload particular file and clicks a button to remove it
    this.on('core:file-remove', function (fileID) {
      _this4.removeFile(fileID);
    });

    this.on('core:cancel-all', function () {
      // let updatedFiles = this.getState().files
      // updatedFiles = {}
      _this4.setState({ files: {} });
    });

    this.on('core:upload-started', function (fileID, upload) {
      var updatedFiles = _extends({}, _this4.getState().files);
      var updatedFile = _extends({}, updatedFiles[fileID], _extends({}, {
        progress: _extends({}, updatedFiles[fileID].progress, {
          uploadStarted: Date.now()
        })
      }));
      updatedFiles[fileID] = updatedFile;

      _this4.setState({ files: updatedFiles });
    });

    // upload progress events can occur frequently, especially when you have a good
    // connection to the remote server. Therefore, we are throtteling them to
    // prevent accessive function calls.
    // see also: https://github.com/tus/tus-js-client/commit/9940f27b2361fd7e10ba58b09b60d82422183bbb
    var throttledCalculateProgress = throttle(this.calculateProgress, 100, { leading: true, trailing: false });

    this.on('core:upload-progress', function (data) {
      // this.calculateProgress(data)
      throttledCalculateProgress(data);
    });

    this.on('core:upload-success', function (fileID, uploadResp, uploadURL) {
      var updatedFiles = _extends({}, _this4.getState().files);
      var updatedFile = _extends({}, updatedFiles[fileID], {
        progress: _extends({}, updatedFiles[fileID].progress, {
          uploadComplete: true,
          // good or bad idea? setting the percentage to 100 if upload is successful,
          // so that if we lost some progress events on the way, its still marked “compete”?
          percentage: 100
        }),
        uploadURL: uploadURL
      });
      updatedFiles[fileID] = updatedFile;

      _this4.setState({
        files: updatedFiles
      });

      _this4.calculateTotalProgress();

      if (_this4.getState().totalProgress === 100) {
        var completeFiles = Object.keys(updatedFiles).filter(function (file) {
          return updatedFiles[file].progress.uploadComplete;
        });
        _this4.emit('core:upload-complete', completeFiles.length);
      }
    });

    this.on('core:update-meta', function (data, fileID) {
      _this4.updateMeta(data, fileID);
    });

    this.on('core:preprocess-progress', function (fileID, progress) {
      var files = _extends({}, _this4.getState().files);
      files[fileID] = _extends({}, files[fileID], {
        progress: _extends({}, files[fileID].progress, {
          preprocess: progress
        })
      });

      _this4.setState({ files: files });
    });
    this.on('core:preprocess-complete', function (fileID) {
      var files = _extends({}, _this4.getState().files);
      files[fileID] = _extends({}, files[fileID], {
        progress: _extends({}, files[fileID].progress)
      });
      delete files[fileID].progress.preprocess;

      _this4.setState({ files: files });
    });
    this.on('core:postprocess-progress', function (fileID, progress) {
      var files = _extends({}, _this4.getState().files);
      files[fileID] = _extends({}, files[fileID], {
        progress: _extends({}, files[fileID].progress, {
          postprocess: progress
        })
      });

      _this4.setState({ files: files });
    });
    this.on('core:postprocess-complete', function (fileID) {
      var files = _extends({}, _this4.getState().files);
      files[fileID] = _extends({}, files[fileID], {
        progress: _extends({}, files[fileID].progress)
      });
      delete files[fileID].progress.postprocess;
      // TODO should we set some kind of `fullyComplete` property on the file object
      // so it's easier to see that the file is upload…fully complete…rather than
      // what we have to do now (`uploadComplete && !postprocess`)

      _this4.setState({ files: files });
    });

    // show informer if offline
    if (typeof window !== 'undefined') {
      window.addEventListener('online', function () {
        return _this4.isOnline(true);
      });
      window.addEventListener('offline', function () {
        return _this4.isOnline(false);
      });
      setTimeout(function () {
        return _this4.isOnline();
      }, 3000);
    }
  };

  Uppy.prototype.isOnline = function isOnline(status) {
    var online = status || window.navigator.onLine;
    if (!online) {
      this.emit('is-offline');
      this.info('No internet connection', 'error', 0);
      this.wasOffline = true;
    } else {
      this.emit('is-online');
      if (this.wasOffline) {
        this.emit('back-online');
        this.info('Connected!', 'success', 3000);
        this.wasOffline = false;
      }
    }
  };

  /**
   * Registers a plugin with Core
   *
   * @param {Class} Plugin object
   * @param {Object} options object that will be passed to Plugin later
   * @return {Object} self for chaining
   */


  Uppy.prototype.use = function use(Plugin, opts) {
    // Instantiate
    var plugin = new Plugin(this, opts);
    var pluginName = plugin.id;
    this.plugins[plugin.type] = this.plugins[plugin.type] || [];

    if (!pluginName) {
      throw new Error('Your plugin must have a name');
    }

    if (!plugin.type) {
      throw new Error('Your plugin must have a type');
    }

    var existsPluginAlready = this.getPlugin(pluginName);
    if (existsPluginAlready) {
      var msg = 'Already found a plugin named \'' + existsPluginAlready.name + '\'.\n        Tried to use: \'' + pluginName + '\'.\n        Uppy is currently limited to running one of every plugin.\n        Share your use case with us over at\n        https://github.com/transloadit/uppy/issues/\n        if you want us to reconsider.';
      throw new Error(msg);
    }

    this.plugins[plugin.type].push(plugin);
    plugin.install();

    return this;
  };

  /**
   * Find one Plugin by name
   *
   * @param string name description
   */


  Uppy.prototype.getPlugin = function getPlugin(name) {
    var foundPlugin = false;
    this.iteratePlugins(function (plugin) {
      var pluginName = plugin.id;
      if (pluginName === name) {
        foundPlugin = plugin;
        return false;
      }
    });
    return foundPlugin;
  };

  /**
   * Iterate through all `use`d plugins
   *
   * @param function method description
   */


  Uppy.prototype.iteratePlugins = function iteratePlugins(method) {
    var _this5 = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this5.plugins[pluginType].forEach(method);
    });
  };

  /**
   * Uninstall and remove a plugin.
   *
   * @param {Plugin} instance The plugin instance to remove.
   */


  Uppy.prototype.removePlugin = function removePlugin(instance) {
    var list = this.plugins[instance.type];

    if (instance.uninstall) {
      instance.uninstall();
    }

    var index = list.indexOf(instance);
    if (index !== -1) {
      list.splice(index, 1);
    }
  };

  /**
   * Uninstall all plugins and close down this Uppy instance.
   */


  Uppy.prototype.close = function close() {
    this.reset();

    this.iteratePlugins(function (plugin) {
      plugin.uninstall();
    });

    if (this.socket) {
      this.socket.close();
    }
  };

  /**
  * Set info message in `state.info`, so that UI plugins like `Informer`
  * can display the message
  *
  * @param {string} msg Message to be displayed by the informer
  */

  Uppy.prototype.info = function info(msg, type, duration) {
    var _this6 = this;

    this.setState({
      info: {
        isHidden: false,
        type: type,
        msg: msg
      }
    });

    this.emit('core:info-visible');

    window.clearTimeout(this.infoTimeoutID);
    if (duration === 0) {
      this.infoTimeoutID = undefined;
      return;
    }

    // hide the informer after `duration` milliseconds
    this.infoTimeoutID = setTimeout(function () {
      var newInformer = _extends({}, _this6.state.info, {
        isHidden: true
      });
      _this6.setState({
        info: newInformer
      });
      _this6.emit('core:info-hidden');
    }, duration);
  };

  Uppy.prototype.hideInfo = function hideInfo() {
    var newInfo = _extends({}, this.core.state.info, {
      isHidden: true
    });
    this.setState({
      info: newInfo
    });
    this.emit('core:info-hidden');
  };

  /**
   * Logs stuff to console, only if `debug` is set to true. Silent in production.
   *
   * @return {String|Object} to log
   */


  Uppy.prototype.log = function log(msg, type) {
    if (!this.opts.debug) {
      return;
    }

    if (type === 'error') {
      console.error('LOG: ' + msg);
      return;
    }

    if (msg === '' + msg) {
      console.log('LOG: ' + msg);
    } else {
      console.dir(msg);
    }

    global.uppyLog = global.uppyLog + '\n' + 'DEBUG LOG: ' + msg;
  };

  Uppy.prototype.initSocket = function initSocket(opts) {
    if (!this.socket) {
      this.socket = new UppySocket(opts);
    }

    return this.socket;
  };

  /**
   * Initializes actions, installs all plugins (by iterating on them and calling `install`), sets options
   *
   */


  Uppy.prototype.run = function run() {
    this.log('Core is run, initializing actions...');

    this.actions();

    // Forse set `autoProceed` option to false if there are multiple selector Plugins active
    // if (this.plugins.acquirer && this.plugins.acquirer.length > 1) {
    //   this.opts.autoProceed = false
    // }

    // Install all plugins
    // this.installAll()

    return this;
  };

  /**
   * Restore an upload by its ID.
   */


  Uppy.prototype.restore = function restore(uploadID) {
    this.log('Core: attempting to restore upload "' + uploadID + '"');

    if (!this.state.currentUploads[uploadID]) {
      this.removeUpload(uploadID);
      return Promise.reject(new Error('Nonexistent upload'));
    }

    return this.runUpload(uploadID);
  };

  /**
   * Create an upload for a bunch of files.
   *
   * @param {Array<string>} fileIDs File IDs to include in this upload.
   * @return {string} ID of this upload.
   */


  Uppy.prototype.createUpload = function createUpload(fileIDs) {
    var _extends3;

    var uploadID = cuid();

    this.emit('core:upload', {
      id: uploadID,
      fileIDs: fileIDs
    });

    this.setState({
      currentUploads: _extends({}, this.state.currentUploads, (_extends3 = {}, _extends3[uploadID] = {
        fileIDs: fileIDs,
        step: 0
      }, _extends3))
    });

    return uploadID;
  };

  /**
   * Remove an upload, eg. if it has been canceled or completed.
   *
   * @param {string} uploadID The ID of the upload.
   */


  Uppy.prototype.removeUpload = function removeUpload(uploadID) {
    var currentUploads = _extends({}, this.state.currentUploads);
    delete currentUploads[uploadID];

    this.setState({
      currentUploads: currentUploads
    });
  };

  /**
   * Run an upload. This picks up where it left off in case the upload is being restored.
   *
   * @private
   */


  Uppy.prototype.runUpload = function runUpload(uploadID) {
    var _this7 = this;

    var uploadData = this.state.currentUploads[uploadID];
    var fileIDs = uploadData.fileIDs;
    var restoreStep = uploadData.step;

    var steps = [].concat(this.preProcessors, this.uploaders, this.postProcessors);
    var lastStep = Promise.resolve();
    steps.forEach(function (fn, step) {
      // Skip this step if we are restoring and have already completed this step before.
      if (step < restoreStep) {
        return;
      }

      lastStep = lastStep.then(function () {
        var _extends4;

        var currentUpload = _extends({}, _this7.state.currentUploads[uploadID], {
          step: step
        });
        _this7.setState({
          currentUploads: _extends({}, _this7.state.currentUploads, (_extends4 = {}, _extends4[uploadID] = currentUpload, _extends4))
        });
        return fn(fileIDs);
      });
    });

    // Not returning the `catch`ed promise, because we still want to return a rejected
    // promise from this method if the upload failed.
    lastStep.catch(function (err) {
      _this7.emit('core:error', err);

      _this7.removeUpload(uploadID);
    });

    return lastStep.then(function () {
      // return number of uploaded files
      _this7.emit('core:success', fileIDs);

      _this7.removeUpload(uploadID);
    });
  };

  /**
  * Start an upload for all the files that are not currently being uploaded.
  *
  * @return {Promise}
  */


  Uppy.prototype.upload = function upload(forceUpload) {
    var _this8 = this;

    var isMinNumberOfFilesReached = this.checkRestrictions(true);
    if (!isMinNumberOfFilesReached) {
      return Promise.reject('Minimum number of files has not been reached');
    }

    return this.opts.onBeforeUpload(this.state.files).catch(function (err) {
      _this8.info(err, 'error', 5000);
      return Promise.reject('onBeforeUpload: ' + err);
    }).then(function () {
      var waitingFileIDs = [];
      Object.keys(_this8.state.files).forEach(function (fileID) {
        var file = _this8.getFile(fileID);

        // TODO: replace files[file].isRemote with some logic
        //
        // filter files that are now yet being uploaded / haven’t been uploaded
        // and remote too

        if (forceUpload) {
          _this8.resetProgress();
          waitingFileIDs.push(file.id);
        } else if (!file.progress.uploadStarted || file.isRemote) {
          waitingFileIDs.push(file.id);
        }
      });

      var uploadID = _this8.createUpload(waitingFileIDs);
      return _this8.runUpload(uploadID);
    });
  };

  return Uppy;
}();

module.exports = function (opts) {
  if (!(this instanceof Uppy)) {
    return new Uppy(opts);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../core/Translator":23,"../core/Utils":25,"./UppySocket":24,"cuid":1,"lodash.throttle":4,"mime-match":5,"namespace-emitter":7,"prettier-bytes":12}],23:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 *
 * @param {object} opts
 */
module.exports = function () {
  function Translator(opts) {
    _classCallCheck(this, Translator);

    var defaultOptions = {
      locale: {
        strings: {},
        pluralize: function pluralize(n) {
          if (n === 1) {
            return 0;
          }
          return 1;
        }
      }
    };

    this.opts = _extends({}, defaultOptions, opts);
    this.locale = _extends({}, defaultOptions.locale, opts.locale);

    // console.log(this.opts.locale)

    // this.locale.pluralize = this.locale ? this.locale.pluralize : defaultPluralize
    // this.locale.strings = Object.assign({}, en_US.strings, this.opts.locale.strings)
  }

  /**
   * Takes a string with placeholder variables like `%{smart_count} file selected`
   * and replaces it with values from options `{smart_count: 5}`
   *
   * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
   * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
   *
   * @param {string} phrase that needs interpolation, with placeholders
   * @param {object} options with values that will be used to replace placeholders
   * @return {string} interpolated
   */


  Translator.prototype.interpolate = function interpolate(phrase, options) {
    var replace = String.prototype.replace;
    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$$$';

    for (var arg in options) {
      if (arg !== '_' && options.hasOwnProperty(arg)) {
        // Ensure replacement value is escaped to prevent special $-prefixed
        // regex replace tokens. the "$$$$" is needed because each "$" needs to
        // be escaped with "$" itself, and we need two in the resulting output.
        var replacement = options[arg];
        if (typeof replacement === 'string') {
          replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
        }
        // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.
        phrase = replace.call(phrase, new RegExp('%\\{' + arg + '\\}', 'g'), replacement);
      }
    }
    return phrase;
  };

  /**
   * Public translate method
   *
   * @param {string} key
   * @param {object} options with values that will be used later to replace placeholders in string
   * @return {string} translated (and interpolated)
   */


  Translator.prototype.translate = function translate(key, options) {
    if (options && options.smart_count) {
      var plural = this.locale.pluralize(options.smart_count);
      return this.interpolate(this.opts.locale.strings[key][plural], options);
    }

    return this.interpolate(this.opts.locale.strings[key], options);
  };

  return Translator;
}();

},{}],24:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ee = require('namespace-emitter');

module.exports = function () {
  function UppySocket(opts) {
    var _this = this;

    _classCallCheck(this, UppySocket);

    this.queued = [];
    this.isOpen = false;
    this.socket = new WebSocket(opts.target);
    this.emitter = ee();

    this.socket.onopen = function (e) {
      _this.isOpen = true;

      while (_this.queued.length > 0 && _this.isOpen) {
        var first = _this.queued[0];
        _this.send(first.action, first.payload);
        _this.queued = _this.queued.slice(1);
      }
    };

    this.socket.onclose = function (e) {
      _this.isOpen = false;
    };

    this._handleMessage = this._handleMessage.bind(this);

    this.socket.onmessage = this._handleMessage;

    this.close = this.close.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.send = this.send.bind(this);
  }

  UppySocket.prototype.close = function close() {
    return this.socket.close();
  };

  UppySocket.prototype.send = function send(action, payload) {
    // attach uuid

    if (!this.isOpen) {
      this.queued.push({ action: action, payload: payload });
      return;
    }

    this.socket.send(JSON.stringify({
      action: action,
      payload: payload
    }));
  };

  UppySocket.prototype.on = function on(action, handler) {
    console.log(action);
    this.emitter.on(action, handler);
  };

  UppySocket.prototype.emit = function emit(action, payload) {
    console.log(action);
    this.emitter.emit(action, payload);
  };

  UppySocket.prototype.once = function once(action, handler) {
    this.emitter.once(action, handler);
  };

  UppySocket.prototype._handleMessage = function _handleMessage(e) {
    try {
      var message = JSON.parse(e.data);
      console.log(message);
      this.emit(message.action, message.payload);
    } catch (err) {
      console.log(err);
    }
  };

  return UppySocket;
}();

},{"namespace-emitter":7}],25:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var throttle = require('lodash.throttle');
// we inline file-type module, as opposed to using the NPM version,
// because of this https://github.com/sindresorhus/file-type/issues/78
// and https://github.com/sindresorhus/copy-text-to-clipboard/issues/5
var fileType = require('../vendor/file-type');

/**
 * A collection of small utility functions that help with dom manipulation, adding listeners,
 * promises and other good things.
 *
 * @module Utils
 */

/**
 * Shallow flatten nested arrays.
 */
function flatten(arr) {
  return [].concat.apply([], arr);
}

function isTouchDevice() {
  return 'ontouchstart' in window || // works on most browsers
  navigator.maxTouchPoints; // works on IE10/11 and Surface
}

// /**
//  * Shorter and fast way to select a single node in the DOM
//  * @param   { String } selector - unique dom selector
//  * @param   { Object } ctx - DOM node where the target of our search will is located
//  * @returns { Object } dom node found
//  */
// function $ (selector, ctx) {
//   return (ctx || document).querySelector(selector)
// }

// /**
//  * Shorter and fast way to select multiple nodes in the DOM
//  * @param   { String|Array } selector - DOM selector or nodes list
//  * @param   { Object } ctx - DOM node where the targets of our search will is located
//  * @returns { Object } dom nodes found
//  */
// function $$ (selector, ctx) {
//   var els
//   if (typeof selector === 'string') {
//     els = (ctx || document).querySelectorAll(selector)
//   } else {
//     els = selector
//     return Array.prototype.slice.call(els)
//   }
// }

function truncateString(str, length) {
  if (str.length > length) {
    return str.substr(0, length / 2) + '...' + str.substr(str.length - length / 4, str.length);
  }
  return str;

  // more precise version if needed
  // http://stackoverflow.com/a/831583
}

function secondsToTime(rawSeconds) {
  var hours = Math.floor(rawSeconds / 3600) % 24;
  var minutes = Math.floor(rawSeconds / 60) % 60;
  var seconds = Math.floor(rawSeconds % 60);

  return { hours: hours, minutes: minutes, seconds: seconds };
}

/**
 * Partition array by a grouping function.
 * @param  {[type]} array      Input array
 * @param  {[type]} groupingFn Grouping function
 * @return {[type]}            Array of arrays
 */
function groupBy(array, groupingFn) {
  return array.reduce(function (result, item) {
    var key = groupingFn(item);
    var xs = result.get(key) || [];
    xs.push(item);
    result.set(key, xs);
    return result;
  }, new Map());
}

/**
 * Tests if every array element passes predicate
 * @param  {Array}  array       Input array
 * @param  {Object} predicateFn Predicate
 * @return {bool}               Every element pass
 */
function every(array, predicateFn) {
  return array.reduce(function (result, item) {
    if (!result) {
      return false;
    }

    return predicateFn(item);
  }, true);
}

/**
 * Converts list into array
*/
function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

/**
 * Takes a fileName and turns it into fileID, by converting to lowercase,
 * removing extra characters and adding unix timestamp
 *
 * @param {String} fileName
 *
 */
function generateFileID(file) {
  var fileID = file.name.toLowerCase();
  fileID = fileID.replace(/[^A-Z0-9]/ig, '');
  fileID = fileID + file.data.lastModified;
  return fileID;
}

function extend() {
  for (var _len = arguments.length, objs = Array(_len), _key = 0; _key < _len; _key++) {
    objs[_key] = arguments[_key];
  }

  return Object.assign.apply(this, [{}].concat(objs));
}

/**
 * Runs an array of promise-returning functions in sequence.
 */
function runPromiseSequence(functions) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  var promise = Promise.resolve();
  functions.forEach(function (func) {
    promise = promise.then(function () {
      return func.apply(undefined, args);
    });
  });
  return promise;
}

/**
 * Takes function or class, returns its name.
 * Because IE doesn’t support `constructor.name`.
 * https://gist.github.com/dfkaye/6384439, http://stackoverflow.com/a/15714445
 *
 * @param {Object} fn — function
 *
 */
// function getFnName (fn) {
//   var f = typeof fn === 'function'
//   var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/))
//   return (!f && 'not a function') || (s && s[1] || 'anonymous')
// }

function isPreviewSupported(fileTypeSpecific) {
  // list of images that browsers can preview
  if (/^(jpeg|gif|png|svg|svg\+xml|bmp)$/.test(fileTypeSpecific)) {
    return true;
  }
  return false;
}

function getArrayBuffer(chunk) {
  return new _Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.addEventListener('load', function (e) {
      // e.target.result is an ArrayBuffer
      resolve(e.target.result);
    });
    reader.addEventListener('error', function (err) {
      console.error('FileReader error' + err);
      reject(err);
    });
    // file-type only needs the first 4100 bytes
    reader.readAsArrayBuffer(chunk);
  });
}

function getFileType(file) {
  var emptyFileType = ['', ''];
  var extensionsToMime = {
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    'mp4': 'video/mp4',
    'mp3': 'audio/mp3'

    // no smart detection for remote files, just trust the provider
  };if (file.isRemote) {
    return Promise.resolve(file.type.split('/'));
  }

  var fileExtension = getFileNameAndExtension(file.name)[1];

  // 1. try to determine file type from magic bytes with file-type module
  // this should be the most trustworthy way
  var chunk = file.data.slice(0, 4100);
  return getArrayBuffer(chunk).then(function (buffer) {
    var type = fileType(buffer);
    if (type && type.mime) {
      return type.mime.split('/');
    }

    // 2. if that’s no good, check if mime type is set in the file object
    if (file.type) {
      return file.type.split('/');
    }

    // 3. if that’s no good, see if we can map extension to a mime type
    if (extensionsToMime[fileExtension]) {
      return extensionsToMime[fileExtension].split('/');
    }

    // if all fails, well, return empty
    return emptyFileType;
  }).catch(function () {
    return emptyFileType;
  });

  // if (file.type) {
  //   return Promise.resolve(file.type.split('/'))
  // }
  // return mime.lookup(file.name)
  // return file.type ? file.type.split('/') : ['', '']
}

// TODO Check which types are actually supported in browsers. Chrome likes webm
// from my testing, but we may need more.
// We could use a library but they tend to contain dozens of KBs of mappings,
// most of which will go unused, so not sure if that's worth it.
var mimeToExtensions = {
  'video/ogg': 'ogv',
  'audio/ogg': 'ogg',
  'video/webm': 'webm',
  'audio/webm': 'webm',
  'video/mp4': 'mp4',
  'audio/mp3': 'mp3'
};

function getFileTypeExtension(mimeType) {
  return mimeToExtensions[mimeType] || null;
}

// returns [fileName, fileExt]
function getFileNameAndExtension(fullFileName) {
  var re = /(?:\.([^.]+))?$/;
  var fileExt = re.exec(fullFileName)[1];
  var fileName = fullFileName.replace('.' + fileExt, '');
  return [fileName, fileExt];
}

function supportsMediaRecorder() {
  return typeof MediaRecorder === 'function' && !!MediaRecorder.prototype && typeof MediaRecorder.prototype.start === 'function';
}

/**
 * Check if a URL string is an object URL from `URL.createObjectURL`.
 *
 * @param {string} url
 * @return {boolean}
 */
function isObjectURL(url) {
  return url.indexOf('blob:') === 0;
}

function getProportionalHeight(img, width) {
  var aspect = img.width / img.height;
  return Math.round(width / aspect);
}

/**
 * Create a thumbnail for the given Uppy file object.
 *
 * @param {{data: Blob}} file
 * @param {number} width
 * @return {Promise}
 */
function createThumbnail(file, targetWidth) {
  var originalUrl = URL.createObjectURL(file.data);

  var onload = new _Promise(function (resolve, reject) {
    var image = new Image();
    image.src = originalUrl;
    image.onload = function () {
      URL.revokeObjectURL(originalUrl);
      resolve(image);
    };
    image.onerror = function () {
      // The onerror event is totally useless unfortunately, as far as I know
      URL.revokeObjectURL(originalUrl);
      reject(new Error('Could not create thumbnail'));
    };
  });

  return onload.then(function (image) {
    var targetHeight = getProportionalHeight(image, targetWidth);
    var canvas = resizeImage(image, targetWidth, targetHeight);
    return canvasToBlob(canvas, 'image/jpeg');
  }).then(function (blob) {
    return URL.createObjectURL(blob);
  });
}

/**
 * Resize an image to the target `width` and `height`.
 *
 * Returns a Canvas with the resized image on it.
 */
function resizeImage(image, targetWidth, targetHeight) {
  var sourceWidth = image.width;
  var sourceHeight = image.height;

  if (targetHeight < image.height / 2) {
    var steps = Math.floor(Math.log(image.width / targetWidth) / Math.log(2));
    var stepScaled = downScaleInSteps(image, steps);
    image = stepScaled.image;
    sourceWidth = stepScaled.sourceWidth;
    sourceHeight = stepScaled.sourceHeight;
  }

  var canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  var context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);

  return canvas;
}

/**
 * Downscale an image by 50% `steps` times.
 */
function downScaleInSteps(image, steps) {
  var source = image;
  var currentWidth = source.width;
  var currentHeight = source.height;

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = currentWidth / 2;
  canvas.height = currentHeight / 2;

  for (var i = 0; i < steps; i += 1) {
    context.drawImage(source,
    // The entire source image. We pass width and height here,
    // because we reuse this canvas, and should only scale down
    // the part of the canvas that contains the previous scale step.
    0, 0, currentWidth, currentHeight,
    // Draw to 50% size
    0, 0, currentWidth / 2, currentHeight / 2);
    currentWidth /= 2;
    currentHeight /= 2;
    source = canvas;
  }

  return {
    image: canvas,
    sourceWidth: currentWidth,
    sourceHeight: currentHeight
  };
}

/**
 * Save a <canvas> element's content to a Blob object.
 *
 * @param {HTMLCanvasElement} canvas
 * @return {Promise}
 */
function canvasToBlob(canvas, type, quality) {
  if (canvas.toBlob) {
    return new _Promise(function (resolve) {
      canvas.toBlob(resolve, type, quality);
    });
  }
  return Promise.resolve().then(function () {
    return dataURItoBlob(canvas.toDataURL(type, quality), {});
  });
}

function dataURItoBlob(dataURI, opts, toFile) {
  // get the base64 data
  var data = dataURI.split(',')[1];

  // user may provide mime type, if not get it from data URI
  var mimeType = opts.mimeType || dataURI.split(',')[0].split(':')[1].split(';')[0];

  // default to plain/text if data URI has no mimeType
  if (mimeType == null) {
    mimeType = 'plain/text';
  }

  var binary = atob(data);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }

  // Convert to a File?
  if (toFile) {
    return new File([new Uint8Array(array)], opts.name || '', { type: mimeType });
  }

  return new Blob([new Uint8Array(array)], { type: mimeType });
}

function dataURItoFile(dataURI, opts) {
  return dataURItoBlob(dataURI, opts, true);
}

/**
 * Copies text to clipboard by creating an almost invisible textarea,
 * adding text there, then running execCommand('copy').
 * Falls back to prompt() when the easy way fails (hello, Safari!)
 * From http://stackoverflow.com/a/30810322
 *
 * @param {String} textToCopy
 * @param {String} fallbackString
 * @return {Promise}
 */
function copyToClipboard(textToCopy, fallbackString) {
  fallbackString = fallbackString || 'Copy the URL below';

  return new _Promise(function (resolve, reject) {
    var textArea = document.createElement('textarea');
    textArea.setAttribute('style', {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '2em',
      height: '2em',
      padding: 0,
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      background: 'transparent'
    });

    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();

    var magicCopyFailed = function magicCopyFailed(err) {
      document.body.removeChild(textArea);
      window.prompt(fallbackString, textToCopy);
      return reject('Oops, unable to copy displayed fallback prompt: ' + err);
    };

    try {
      var successful = document.execCommand('copy');
      if (!successful) {
        return magicCopyFailed('copy command unavailable');
      }
      document.body.removeChild(textArea);
      return resolve();
    } catch (err) {
      document.body.removeChild(textArea);
      return magicCopyFailed(err);
    }
  });
}

function getSpeed(fileProgress) {
  if (!fileProgress.bytesUploaded) return 0;

  var timeElapsed = new Date() - fileProgress.uploadStarted;
  var uploadSpeed = fileProgress.bytesUploaded / (timeElapsed / 1000);
  return uploadSpeed;
}

function getBytesRemaining(fileProgress) {
  return fileProgress.bytesTotal - fileProgress.bytesUploaded;
}

function getETA(fileProgress) {
  if (!fileProgress.bytesUploaded) return 0;

  var uploadSpeed = getSpeed(fileProgress);
  var bytesRemaining = getBytesRemaining(fileProgress);
  var secondsRemaining = Math.round(bytesRemaining / uploadSpeed * 10) / 10;

  return secondsRemaining;
}

function prettyETA(seconds) {
  var time = secondsToTime(seconds);

  // Only display hours and minutes if they are greater than 0 but always
  // display minutes if hours is being displayed
  // Display a leading zero if the there is a preceding unit: 1m 05s, but 5s
  var hoursStr = time.hours ? time.hours + 'h ' : '';
  var minutesVal = time.hours ? ('0' + time.minutes).substr(-2) : time.minutes;
  var minutesStr = minutesVal ? minutesVal + 'm ' : '';
  var secondsVal = minutesVal ? ('0' + time.seconds).substr(-2) : time.seconds;
  var secondsStr = secondsVal + 's';

  return '' + hoursStr + minutesStr + secondsStr;
}

/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
function isDOMElement(obj) {
  return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj.nodeType === Node.ELEMENT_NODE;
}

/**
 * Find a DOM element.
 *
 * @param {Node|string} element
 * @return {Node|null}
 */
function findDOMElement(element) {
  if (typeof element === 'string') {
    return document.querySelector(element);
  }

  if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' && isDOMElement(element)) {
    return element;
  }
}

function getSocketHost(url) {
  // get the host domain
  var regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/;
  var host = regex.exec(url)[1];
  var socketProtocol = location.protocol === 'https:' ? 'wss' : 'ws';

  return socketProtocol + '://' + host;
}

function _emitSocketProgress(uploader, progressData, file) {
  var progress = progressData.progress,
      bytesUploaded = progressData.bytesUploaded,
      bytesTotal = progressData.bytesTotal;

  if (progress) {
    uploader.core.log('Upload progress: ' + progress);
    uploader.core.emitter.emit('core:upload-progress', {
      uploader: uploader,
      id: file.id,
      bytesUploaded: bytesUploaded,
      bytesTotal: bytesTotal
    });
  }
}

var emitSocketProgress = throttle(_emitSocketProgress, 300, { leading: true, trailing: true });

module.exports = {
  generateFileID: generateFileID,
  toArray: toArray,
  every: every,
  flatten: flatten,
  groupBy: groupBy,
  extend: extend,
  runPromiseSequence: runPromiseSequence,
  supportsMediaRecorder: supportsMediaRecorder,
  isTouchDevice: isTouchDevice,
  getFileNameAndExtension: getFileNameAndExtension,
  truncateString: truncateString,
  getFileTypeExtension: getFileTypeExtension,
  getFileType: getFileType,
  getArrayBuffer: getArrayBuffer,
  isPreviewSupported: isPreviewSupported,
  isObjectURL: isObjectURL,
  createThumbnail: createThumbnail,
  secondsToTime: secondsToTime,
  dataURItoBlob: dataURItoBlob,
  dataURItoFile: dataURItoFile,
  getSpeed: getSpeed,
  getBytesRemaining: getBytesRemaining,
  getETA: getETA,
  copyToClipboard: copyToClipboard,
  prettyETA: prettyETA,
  findDOMElement: findDOMElement,
  getSocketHost: getSocketHost,
  emitSocketProgress: emitSocketProgress
};

},{"../vendor/file-type":38,"es6-promise":2,"lodash.throttle":4}],26:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

var onload = require('on-load');
var LoaderView = require('./Loader');

module.exports = function (props) {
  var _uppyProviderAuthBtnDemo, _div;

  var demoLink = props.demo ? (_uppyProviderAuthBtnDemo = document.createElement('button'), _uppyProviderAuthBtnDemo.onclick = props.handleDemoAuth, _uppyProviderAuthBtnDemo.setAttribute('class', 'UppyProvider-authBtnDemo'), _uppyProviderAuthBtnDemo.textContent = 'Proceed with Demo Account', _uppyProviderAuthBtnDemo) : null;
  var AuthBlock = function AuthBlock() {
    var _uppyProviderAuthTitleName, _br, _uppyProviderAuthTitle, _uppyProviderAuthBtn, _uppyProviderAuth;

    return _uppyProviderAuth = document.createElement('div'), _uppyProviderAuth.setAttribute('class', 'UppyProvider-auth'), _appendChild(_uppyProviderAuth, [' ', (_uppyProviderAuthTitle = document.createElement('h1'), _uppyProviderAuthTitle.setAttribute('class', 'UppyProvider-authTitle'), _appendChild(_uppyProviderAuthTitle, ['Please authenticate with ', (_uppyProviderAuthTitleName = document.createElement('span'), _uppyProviderAuthTitleName.setAttribute('class', 'UppyProvider-authTitleName'), _appendChild(_uppyProviderAuthTitleName, [props.pluginName]), _uppyProviderAuthTitleName), (_br = document.createElement('br'), _br), ' to select files']), _uppyProviderAuthTitle), ' ', (_uppyProviderAuthBtn = document.createElement('button'), _uppyProviderAuthBtn.setAttribute('type', 'button'), _uppyProviderAuthBtn.onclick = props.handleAuth, _uppyProviderAuthBtn.setAttribute('class', 'UppyProvider-authBtn'), _uppyProviderAuthBtn.textContent = 'Authenticate', _uppyProviderAuthBtn), ' ', demoLink, ' ']), _uppyProviderAuth;
  };
  return onload((_div = document.createElement('div'), _div.setAttribute('style', 'height: 100%;'), _appendChild(_div, [' ', props.checkAuthInProgress ? LoaderView() : AuthBlock(), ' ']), _div), props.checkAuth, null, 'auth' + props.pluginName);
};

},{"./Loader":30,"on-load":9,"yo-yoify/lib/appendChild":21}],27:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

module.exports = function (props) {
  var _button, _li;

  return _li = document.createElement('li'), _appendChild(_li, [' ', (_button = document.createElement('button'), _button.setAttribute('type', 'button'), _button.onclick = props.getFolder, _appendChild(_button, [props.title]), _button), ' ']), _li;
};

},{"yo-yoify/lib/appendChild":21}],28:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

var Breadcrumb = require('./Breadcrumb');

module.exports = function (props) {
  var _uppyProviderBreadcrumbs;

  return _uppyProviderBreadcrumbs = document.createElement('ul'), _uppyProviderBreadcrumbs.setAttribute('class', 'UppyProvider-breadcrumbs'), _appendChild(_uppyProviderBreadcrumbs, [' ', props.directories.map(function (directory, i) {
    return Breadcrumb({
      getFolder: function getFolder() {
        return props.getFolder(directory.id);
      },
      title: i === 0 ? props.title : directory.title
    });
  }), ' ']), _uppyProviderBreadcrumbs;
};

},{"./Breadcrumb":27,"yo-yoify/lib/appendChild":21}],29:[function(require,module,exports){
'use strict';

var _svgNamespace = 'http://www.w3.org/2000/svg',
    _appendChild = require('yo-yoify/lib/appendChild');

var Breadcrumbs = require('./Breadcrumbs');
var Table = require('./Table');

module.exports = function (props) {
  var _browserSearchInput, _path, _uppyIcon, _browserSearchClose, _browserSearch, _path2, _uppyIcon2, _browserSearchToggle, _browserUserLogout, _browserHeaderBar, _browserHeader, _browserBody, _div;

  var filteredFolders = props.folders;
  var filteredFiles = props.files;

  if (props.filterInput !== '') {
    filteredFolders = props.filterItems(props.folders);
    filteredFiles = props.filterItems(props.files);
  }

  return _div = document.createElement('div'), _div.setAttribute('class', 'Browser Browser-viewType--' + String(props.viewType) + ''), _appendChild(_div, [' ', (_browserHeader = document.createElement('header'), _browserHeader.setAttribute('class', 'Browser-header'), _appendChild(_browserHeader, [' ', (_browserSearch = document.createElement('div'), _browserSearch.setAttribute('aria-hidden', '' + String(!props.isSearchVisible) + ''), _browserSearch.setAttribute('class', 'Browser-search'), _appendChild(_browserSearch, [' ', (_browserSearchInput = document.createElement('input'), _browserSearchInput.setAttribute('type', 'text'), _browserSearchInput.setAttribute('placeholder', 'Search'), _browserSearchInput.onkeyup = props.filterQuery, _browserSearchInput.setAttribute('value', '' + String(props.filterInput) + ''), _browserSearchInput.setAttribute('class', 'Browser-searchInput'), _browserSearchInput), ' ', (_browserSearchClose = document.createElement('button'), _browserSearchClose.setAttribute('type', 'button'), _browserSearchClose.onclick = props.toggleSearch, _browserSearchClose.setAttribute('class', 'Browser-searchClose'), _appendChild(_browserSearchClose, [' ', (_uppyIcon = document.createElementNS(_svgNamespace, 'svg'), _uppyIcon.setAttribute('viewBox', '0 0 19 19'), _uppyIcon.setAttribute('class', 'UppyIcon'), _appendChild(_uppyIcon, [' ', (_path = document.createElementNS(_svgNamespace, 'path'), _path.setAttribute('d', 'M17.318 17.232L9.94 9.854 9.586 9.5l-.354.354-7.378 7.378h.707l-.62-.62v.706L9.318 9.94l.354-.354-.354-.354L1.94 1.854v.707l.62-.62h-.706l7.378 7.378.354.354.354-.354 7.378-7.378h-.707l.622.62v-.706L9.854 9.232l-.354.354.354.354 7.378 7.378.708-.707-7.38-7.378v.708l7.38-7.38.353-.353-.353-.353-.622-.622-.353-.353-.354.352-7.378 7.38h.708L2.56 1.23 2.208.88l-.353.353-.622.62-.353.355.352.353 7.38 7.38v-.708l-7.38 7.38-.353.353.352.353.622.622.353.353.354-.353 7.38-7.38h-.708l7.38 7.38z'), _path), ' ']), _uppyIcon), ' ']), _browserSearchClose), ' ']), _browserSearch), ' ', (_browserHeaderBar = document.createElement('div'), _browserHeaderBar.setAttribute('class', 'Browser-headerBar'), _appendChild(_browserHeaderBar, [' ', (_browserSearchToggle = document.createElement('button'), _browserSearchToggle.setAttribute('type', 'button'), _browserSearchToggle.onclick = props.toggleSearch, _browserSearchToggle.setAttribute('class', 'Browser-searchToggle'), _appendChild(_browserSearchToggle, [' ', (_uppyIcon2 = document.createElementNS(_svgNamespace, 'svg'), _uppyIcon2.setAttribute('viewBox', '0 0 100 100'), _uppyIcon2.setAttribute('class', 'UppyIcon'), _appendChild(_uppyIcon2, [' ', (_path2 = document.createElementNS(_svgNamespace, 'path'), _path2.setAttribute('d', 'M87.533 80.03L62.942 55.439c3.324-4.587 5.312-10.207 5.312-16.295 0-.312-.043-.611-.092-.908.05-.301.093-.605.093-.922 0-15.36-12.497-27.857-27.857-27.857-.273 0-.536.043-.799.08-.265-.037-.526-.08-.799-.08-15.361 0-27.858 12.497-27.858 27.857 0 .312.042.611.092.909a5.466 5.466 0 0 0-.093.921c0 15.36 12.496 27.858 27.857 27.858.273 0 .535-.043.8-.081.263.038.524.081.798.081 5.208 0 10.071-1.464 14.245-3.963L79.582 87.98a5.603 5.603 0 0 0 3.976 1.647 5.621 5.621 0 0 0 3.975-9.597zM39.598 55.838c-.265-.038-.526-.081-.8-.081-9.16 0-16.612-7.452-16.612-16.612 0-.312-.042-.611-.092-.908.051-.301.093-.605.093-.922 0-9.16 7.453-16.612 16.613-16.612.272 0 .534-.042.799-.079.263.037.525.079.799.079 9.16 0 16.612 7.452 16.612 16.612 0 .312.043.611.092.909-.05.301-.094.604-.094.921 0 9.16-7.452 16.612-16.612 16.612-.274 0-.536.043-.798.081z'), _path2), ' ']), _uppyIcon2), ' ']), _browserSearchToggle), ' ', Breadcrumbs({
    getFolder: props.getFolder,
    directories: props.directories,
    title: props.title
  }), ' ', (_browserUserLogout = document.createElement('button'), _browserUserLogout.setAttribute('type', 'button'), _browserUserLogout.onclick = props.logout, _browserUserLogout.setAttribute('class', 'Browser-userLogout'), _browserUserLogout.textContent = 'Log out', _browserUserLogout), ' ']), _browserHeaderBar), ' ']), _browserHeader), ' ', (_browserBody = document.createElement('div'), _browserBody.setAttribute('class', 'Browser-body'), _appendChild(_browserBody, [' ', Table({
    columns: [{
      name: 'Name',
      key: 'title'
    }],
    folders: filteredFolders,
    files: filteredFiles,
    activeRow: props.isActiveRow,
    sortByTitle: props.sortByTitle,
    sortByDate: props.sortByDate,
    handleFileClick: props.addFile,
    handleFolderClick: props.getNextFolder,
    getItemName: props.getItemName,
    getItemIcon: props.getItemIcon,
    handleScroll: props.handleScroll
  }), ' ']), _browserBody), ' ']), _div;
};

},{"./Breadcrumbs":28,"./Table":31,"yo-yoify/lib/appendChild":21}],30:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

module.exports = function (props) {
  var _span, _uppyProviderLoading;

  return _uppyProviderLoading = document.createElement('div'), _uppyProviderLoading.setAttribute('class', 'UppyProvider-loading'), _appendChild(_uppyProviderLoading, [' ', (_span = document.createElement('span'), _span.textContent = 'Loading...', _span), ' ']), _uppyProviderLoading;
};

},{"yo-yoify/lib/appendChild":21}],31:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

var Row = require('./TableRow');

module.exports = function (props) {
  var _tbody, _browserTable;

  // const headers = props.columns.map((column) => {
  //   return html`
  //     <th class="BrowserTable-headerColumn BrowserTable-column" onclick=${props.sortByTitle}>
  //       ${column.name}
  //     </th>
  //   `
  // })

  // <thead class="BrowserTable-header">
  //   <tr>${headers}</tr>
  // </thead>

  return _browserTable = document.createElement('table'), _browserTable.onscroll = props.handleScroll, _browserTable.setAttribute('class', 'BrowserTable'), _appendChild(_browserTable, [' ', (_tbody = document.createElement('tbody'), _appendChild(_tbody, [' ', props.folders.map(function (folder) {
    return Row({
      title: props.getItemName(folder),
      active: props.activeRow(folder),
      getItemIcon: function getItemIcon() {
        return props.getItemIcon(folder);
      },
      handleClick: function handleClick() {
        return props.handleFolderClick(folder);
      },
      columns: props.columns
    });
  }), ' ', props.files.map(function (file) {
    return Row({
      title: props.getItemName(file),
      active: props.activeRow(file),
      getItemIcon: function getItemIcon() {
        return props.getItemIcon(file);
      },
      handleClick: function handleClick() {
        return props.handleFileClick(file);
      },
      columns: props.columns
    });
  }), ' ']), _tbody), ' ']), _browserTable;
};

},{"./TableRow":33,"yo-yoify/lib/appendChild":21}],32:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

module.exports = function (props) {
  var _browserTableRowColumn;

  return _browserTableRowColumn = document.createElement('td'), _browserTableRowColumn.setAttribute('class', 'BrowserTable-rowColumn BrowserTable-column'), _appendChild(_browserTableRowColumn, [' ', props.getItemIcon(), ' ', props.value, ' ']), _browserTableRowColumn;
};

},{"yo-yoify/lib/appendChild":21}],33:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

var Column = require('./TableColumn');

module.exports = function (props) {
  var _tr;

  var classes = props.active ? 'BrowserTable-row is-active' : 'BrowserTable-row';
  return _tr = document.createElement('tr'), _tr.onclick = props.handleClick, _tr.setAttribute('class', '' + String(classes) + ''), _appendChild(_tr, [' ', Column({
    getItemIcon: props.getItemIcon,
    value: props.title
  }), ' ']), _tr;
};

},{"./TableColumn":32,"yo-yoify/lib/appendChild":21}],34:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthView = require('./AuthView');
var Browser = require('./Browser');
var LoaderView = require('./Loader');
var Utils = require('../core/Utils');

/**
 * Class to easily generate generic views for plugins
 *
 * This class expects the plugin using to have the following attributes
 *
 * stateId {String} object key of which the plugin state is stored
 *
 * This class also expects the plugin instance using it to have the following
 * accessor methods.
 * Each method takes the item whose property is to be accessed
 * as a param
 *
 * isFolder
 *    @return {Boolean} for if the item is a folder or not
 * getItemData
 *    @return {Object} that is format ready for uppy upload/download
 * getItemIcon
 *    @return {Object} html instance of the item's icon
 * getItemSubList
 *    @return {Array} sub-items in the item. e.g a folder may contain sub-items
 * getItemName
 *    @return {String} display friendly name of the item
 * getMimeType
 *    @return {String} mime type of the item
 * getItemId
 *    @return {String} unique id of the item
 * getItemRequestPath
 *    @return {String} unique request path of the item when making calls to uppy server
 * getItemModifiedDate
 *    @return {object} or {String} date of when last the item was modified
 * getItemThumbnailUrl
 *    @return {String}
 */
module.exports = function () {
  /**
   * @param {object} instance of the plugin
   */
  function View(plugin, opts) {
    _classCallCheck(this, View);

    this.plugin = plugin;
    this.Provider = plugin[plugin.id];

    // set default options
    var defaultOptions = {
      viewType: 'list'

      // merge default options with the ones set by user
    };this.opts = _extends({}, defaultOptions, opts);

    // Logic
    this.addFile = this.addFile.bind(this);
    this.filterItems = this.filterItems.bind(this);
    this.filterQuery = this.filterQuery.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.getFolder = this.getFolder.bind(this);
    this.getNextFolder = this.getNextFolder.bind(this);
    this.logout = this.logout.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
    this.handleAuth = this.handleAuth.bind(this);
    this.handleDemoAuth = this.handleDemoAuth.bind(this);
    this.sortByTitle = this.sortByTitle.bind(this);
    this.sortByDate = this.sortByDate.bind(this);
    this.isActiveRow = this.isActiveRow.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleScroll = this.handleScroll.bind(this);

    // Visual
    this.render = this.render.bind(this);
  }

  /**
   * Little shorthand to update the state with the plugin's state
   */


  View.prototype.updateState = function updateState(newState) {
    var _plugin$core$setState;

    var stateId = this.plugin.stateId;
    var state = this.plugin.core.state;


    this.plugin.core.setState((_plugin$core$setState = {}, _plugin$core$setState[stateId] = _extends({}, state[stateId], newState), _plugin$core$setState));
  };

  View.prototype._updateFilesAndFolders = function _updateFilesAndFolders(res, files, folders) {
    var _this = this;

    this.plugin.getItemSubList(res).forEach(function (item) {
      if (_this.plugin.isFolder(item)) {
        folders.push(item);
      } else {
        files.push(item);
      }
    });

    this.updateState({ folders: folders, files: files });
  };

  View.prototype.checkAuth = function checkAuth() {
    var _this2 = this;

    this.updateState({ checkAuthInProgress: true });
    this.Provider.checkAuth().then(function (authenticated) {
      _this2.updateState({ checkAuthInProgress: false });
      _this2.plugin.onAuth(authenticated);
    }).catch(function (err) {
      _this2.updateState({ checkAuthInProgress: false });
      _this2.handleError(err);
    });
  };

  /**
   * Based on folder ID, fetch a new folder and update it to state
   * @param  {String} id Folder id
   * @return {Promise}   Folders/files in folder
   */


  View.prototype.getFolder = function getFolder(id, name) {
    var _this3 = this;

    return this._loaderWrapper(this.Provider.list(id), function (res) {
      var folders = [];
      var files = [];
      var updatedDirectories = void 0;

      var state = _this3.plugin.core.getState()[_this3.plugin.stateId];
      var index = state.directories.findIndex(function (dir) {
        return id === dir.id;
      });

      if (index !== -1) {
        updatedDirectories = state.directories.slice(0, index + 1);
      } else {
        updatedDirectories = state.directories.concat([{ id: id, title: name || _this3.plugin.getItemName(res) }]);
      }

      _this3._updateFilesAndFolders(res, files, folders);
      _this3.updateState({ directories: updatedDirectories });
    }, this.handleError);
  };

  /**
   * Fetches new folder
   * @param  {Object} Folder
   * @param  {String} title Folder title
   */


  View.prototype.getNextFolder = function getNextFolder(folder) {
    var id = this.plugin.getItemRequestPath(folder);
    this.getFolder(id, this.plugin.getItemName(folder));
  };

  View.prototype.addFile = function addFile(file) {
    var _this4 = this;

    var tagFile = {
      source: this.plugin.id,
      data: this.plugin.getItemData(file),
      name: this.plugin.getItemName(file) || this.plugin.getItemId(file),
      type: this.plugin.getMimeType(file),
      isRemote: true,
      body: {
        fileId: this.plugin.getItemId(file)
      },
      remote: {
        host: this.plugin.opts.host,
        url: '' + this.Provider.fileUrl(this.plugin.getItemRequestPath(file)),
        body: {
          fileId: this.plugin.getItemId(file)
        }
      }
    };

    Utils.getFileType(tagFile).then(function (fileType) {
      if (Utils.isPreviewSupported(fileType[1])) {
        tagFile.preview = _this4.plugin.getItemThumbnailUrl(file);
      }
      _this4.plugin.core.log('Adding remote file');
      _this4.plugin.core.addFile(tagFile);
    });
  };

  /**
   * Removes session token on client side.
   */


  View.prototype.logout = function logout() {
    var _this5 = this;

    this.Provider.logout(location.href).then(function (res) {
      return res.json();
    }).then(function (res) {
      if (res.ok) {
        var newState = {
          authenticated: false,
          files: [],
          folders: [],
          directories: []
        };
        _this5.updateState(newState);
      }
    }).catch(this.handleError);
  };

  View.prototype.filterQuery = function filterQuery(e) {
    var state = this.plugin.core.getState()[this.plugin.stateId];
    this.updateState(_extends({}, state, {
      filterInput: e.target.value
    }));
  };

  View.prototype.toggleSearch = function toggleSearch() {
    var state = this.plugin.core.getState()[this.plugin.stateId];
    var searchInputEl = document.querySelector('.Browser-searchInput');

    this.updateState(_extends({}, state, {
      isSearchVisible: !state.isSearchVisible,
      filterInput: ''
    }));

    searchInputEl.value = '';
    if (!state.isSearchVisible) {
      searchInputEl.focus();
    }
  };

  View.prototype.filterItems = function filterItems(items) {
    var _this6 = this;

    var state = this.plugin.core.getState()[this.plugin.stateId];
    return items.filter(function (folder) {
      return _this6.plugin.getItemName(folder).toLowerCase().indexOf(state.filterInput.toLowerCase()) !== -1;
    });
  };

  View.prototype.sortByTitle = function sortByTitle() {
    var _this7 = this;

    var state = _extends({}, this.plugin.core.getState()[this.plugin.stateId]);
    var files = state.files,
        folders = state.folders,
        sorting = state.sorting;


    var sortedFiles = files.sort(function (fileA, fileB) {
      if (sorting === 'titleDescending') {
        return _this7.plugin.getItemName(fileB).localeCompare(_this7.plugin.getItemName(fileA));
      }
      return _this7.plugin.getItemName(fileA).localeCompare(_this7.plugin.getItemName(fileB));
    });

    var sortedFolders = folders.sort(function (folderA, folderB) {
      if (sorting === 'titleDescending') {
        return _this7.plugin.getItemName(folderB).localeCompare(_this7.plugin.getItemName(folderA));
      }
      return _this7.plugin.getItemName(folderA).localeCompare(_this7.plugin.getItemName(folderB));
    });

    this.updateState(_extends({}, state, {
      files: sortedFiles,
      folders: sortedFolders,
      sorting: sorting === 'titleDescending' ? 'titleAscending' : 'titleDescending'
    }));
  };

  View.prototype.sortByDate = function sortByDate() {
    var _this8 = this;

    var state = _extends({}, this.plugin.core.getState()[this.plugin.stateId]);
    var files = state.files,
        folders = state.folders,
        sorting = state.sorting;


    var sortedFiles = files.sort(function (fileA, fileB) {
      var a = new Date(_this8.plugin.getItemModifiedDate(fileA));
      var b = new Date(_this8.plugin.getItemModifiedDate(fileB));

      if (sorting === 'dateDescending') {
        return a > b ? -1 : a < b ? 1 : 0;
      }
      return a > b ? 1 : a < b ? -1 : 0;
    });

    var sortedFolders = folders.sort(function (folderA, folderB) {
      var a = new Date(_this8.plugin.getItemModifiedDate(folderA));
      var b = new Date(_this8.plugin.getItemModifiedDate(folderB));

      if (sorting === 'dateDescending') {
        return a > b ? -1 : a < b ? 1 : 0;
      }

      return a > b ? 1 : a < b ? -1 : 0;
    });

    this.updateState(_extends({}, state, {
      files: sortedFiles,
      folders: sortedFolders,
      sorting: sorting === 'dateDescending' ? 'dateAscending' : 'dateDescending'
    }));
  };

  View.prototype.sortBySize = function sortBySize() {
    var _this9 = this;

    var state = _extends({}, this.plugin.core.getState()[this.plugin.stateId]);
    var files = state.files,
        sorting = state.sorting;

    // check that plugin supports file sizes

    if (!files.length || !this.plugin.getItemData(files[0]).size) {
      return;
    }

    var sortedFiles = files.sort(function (fileA, fileB) {
      var a = _this9.plugin.getItemData(fileA).size;
      var b = _this9.plugin.getItemData(fileB).size;

      if (sorting === 'sizeDescending') {
        return a > b ? -1 : a < b ? 1 : 0;
      }
      return a > b ? 1 : a < b ? -1 : 0;
    });

    this.updateState(_extends({}, state, {
      files: sortedFiles,
      sorting: sorting === 'sizeDescending' ? 'sizeAscending' : 'sizeDescending'
    }));
  };

  View.prototype.isActiveRow = function isActiveRow(file) {
    return this.plugin.core.getState()[this.plugin.stateId].activeRow === this.plugin.getItemId(file);
  };

  View.prototype.handleDemoAuth = function handleDemoAuth() {
    var state = this.plugin.core.getState()[this.plugin.stateId];
    this.updateState({}, state, {
      authenticated: true
    });
  };

  View.prototype.handleAuth = function handleAuth() {
    var _this10 = this;

    var urlId = Math.floor(Math.random() * 999999) + 1;
    var redirect = '' + location.href + (location.search ? '&' : '?') + 'id=' + urlId;

    var authState = btoa(JSON.stringify({ redirect: redirect }));
    var link = this.Provider.authUrl() + '?state=' + authState;

    var authWindow = window.open(link, '_blank');
    var checkAuth = function checkAuth() {
      var authWindowUrl = void 0;

      try {
        authWindowUrl = authWindow.location.href;
      } catch (e) {
        if (e instanceof DOMException || e instanceof TypeError) {
          return setTimeout(checkAuth, 100);
        } else throw e;
      }

      // split url because chrome adds '#' to redirects
      if (authWindowUrl && authWindowUrl.split('#')[0] === redirect) {
        authWindow.close();
        _this10._loaderWrapper(_this10.Provider.checkAuth(), _this10.plugin.onAuth, _this10.handleError);
      } else {
        setTimeout(checkAuth, 100);
      }
    };

    checkAuth();
  };

  View.prototype.handleError = function handleError(error) {
    var core = this.plugin.core;
    var message = core.i18n('uppyServerError');
    core.log(error.toString());
    core.emit('informer', message, 'error', 5000);
  };

  View.prototype.handleScroll = function handleScroll(e) {
    var _this11 = this;

    var scrollPos = e.target.scrollHeight - (e.target.scrollTop + e.target.offsetHeight);
    var path = this.plugin.getNextPagePath ? this.plugin.getNextPagePath() : null;

    if (scrollPos < 50 && path && !this._isHandlingScroll) {
      this.Provider.list(path).then(function (res) {
        var _plugin$core$getState = _this11.plugin.core.getState()[_this11.plugin.stateId],
            files = _plugin$core$getState.files,
            folders = _plugin$core$getState.folders;

        _this11._updateFilesAndFolders(res, files, folders);
      }).catch(this.handleError).then(function () {
        _this11._isHandlingScroll = false;
      }); // always called

      this._isHandlingScroll = true;
    }
  };

  // displays loader view while asynchronous request is being made.


  View.prototype._loaderWrapper = function _loaderWrapper(promise, then, catch_) {
    var _this12 = this;

    promise.then(then).catch(catch_).then(function () {
      return _this12.updateState({ loading: false });
    }); // always called.
    this.updateState({ loading: true });
  };

  View.prototype.render = function render(state) {
    var _state$plugin$stateId = state[this.plugin.stateId],
        authenticated = _state$plugin$stateId.authenticated,
        checkAuthInProgress = _state$plugin$stateId.checkAuthInProgress,
        loading = _state$plugin$stateId.loading;


    if (loading) {
      return LoaderView();
    }

    if (!authenticated) {
      return AuthView({
        pluginName: this.plugin.title,
        demo: this.plugin.opts.demo,
        checkAuth: this.checkAuth,
        handleAuth: this.handleAuth,
        handleDemoAuth: this.handleDemoAuth,
        checkAuthInProgress: checkAuthInProgress
      });
    }

    var browserProps = _extends({}, state[this.plugin.stateId], {
      getNextFolder: this.getNextFolder,
      getFolder: this.getFolder,
      addFile: this.addFile,
      filterItems: this.filterItems,
      filterQuery: this.filterQuery,
      toggleSearch: this.toggleSearch,
      sortByTitle: this.sortByTitle,
      sortByDate: this.sortByDate,
      logout: this.logout,
      demo: this.plugin.opts.demo,
      isActiveRow: this.isActiveRow,
      getItemName: this.plugin.getItemName,
      getItemIcon: this.plugin.getItemIcon,
      handleScroll: this.handleScroll,
      title: this.plugin.title,
      viewType: this.opts.viewType
    });

    return Browser(browserProps);
  };

  return View;
}();

},{"../core/Utils":25,"./AuthView":26,"./Browser":29,"./Loader":30}],35:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _svgNamespace = 'http://www.w3.org/2000/svg',
    _appendChild = require('yo-yoify/lib/appendChild');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('../Plugin');

var Provider = require('../../uppy-base/src/plugins/Provider');

var View = require('../../generic-provider-views/index');

module.exports = function (_Plugin) {
  _inherits(Google, _Plugin);

  function Google(core, opts) {
    _classCallCheck(this, Google);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, core, opts));

    _this.type = 'acquirer';
    _this.id = 'GoogleDrive';
    _this.title = 'Google Drive';
    _this.stateId = 'googleDrive';
    _this.icon = function () {
      var _path, _uppyIcon;

      return _uppyIcon = document.createElementNS(_svgNamespace, 'svg'), _uppyIcon.setAttribute('width', '28'), _uppyIcon.setAttribute('height', '28'), _uppyIcon.setAttribute('viewBox', '0 0 16 16'), _uppyIcon.setAttribute('class', 'UppyIcon UppyModalTab-icon'), _appendChild(_uppyIcon, [' ', (_path = document.createElementNS(_svgNamespace, 'path'), _path.setAttribute('d', 'M2.955 14.93l2.667-4.62H16l-2.667 4.62H2.955zm2.378-4.62l-2.666 4.62L0 10.31l5.19-8.99 2.666 4.62-2.523 4.37zm10.523-.25h-5.333l-5.19-8.99h5.334l5.19 8.99z'), _path), ' ']), _uppyIcon;
    };

    // writing out the key explicitly for readability the key used to store
    // the provider instance must be equal to this.id.
    _this.GoogleDrive = new Provider(core, {
      host: _this.opts.host,
      provider: 'drive',
      authProvider: 'google'
    });

    _this.files = [];

    _this.onAuth = _this.onAuth.bind(_this);
    // Visual
    _this.render = _this.render.bind(_this);

    // set default options
    var defaultOptions = {};

    // merge default options with the ones set by user
    _this.opts = _extends({}, defaultOptions, opts);
    return _this;
  }

  Google.prototype.install = function install() {
    this.view = new View(this);
    // Set default state for Google Drive
    this.core.setState({
      // writing out the key explicitly for readability the key used to store
      // the plugin state must be equal to this.stateId.
      googleDrive: {
        authenticated: false,
        files: [],
        folders: [],
        directories: [],
        activeRow: -1,
        filterInput: '',
        isSearchVisible: false
      }
    });

    var target = this.opts.target;
    var plugin = this;
    this.target = this.mount(target, plugin);
  };

  Google.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  Google.prototype.onAuth = function onAuth(authenticated) {
    this.view.updateState({ authenticated: authenticated });
    if (authenticated) {
      this.view.getFolder('root');
    }
  };

  Google.prototype.isFolder = function isFolder(item) {
    return item.mimeType === 'application/vnd.google-apps.folder';
  };

  Google.prototype.getItemData = function getItemData(item) {
    return _extends({}, item, { size: parseFloat(item.fileSize) });
  };

  Google.prototype.getItemIcon = function getItemIcon(item) {
    var _img;

    return _img = document.createElement('img'), _img.setAttribute('src', '' + String(item.iconLink) + ''), _img;
  };

  Google.prototype.getItemSubList = function getItemSubList(item) {
    var _this2 = this;

    return item.items.filter(function (i) {
      return _this2.isFolder(i) || !i.mimeType.startsWith('application/vnd.google');
    });
  };

  Google.prototype.getItemName = function getItemName(item) {
    return item.title ? item.title : '/';
  };

  Google.prototype.getMimeType = function getMimeType(item) {
    return item.mimeType;
  };

  Google.prototype.getItemId = function getItemId(item) {
    return item.id;
  };

  Google.prototype.getItemRequestPath = function getItemRequestPath(item) {
    return this.getItemId(item);
  };

  Google.prototype.getItemModifiedDate = function getItemModifiedDate(item) {
    return item.modifiedByMeDate;
  };

  Google.prototype.getItemThumbnailUrl = function getItemThumbnailUrl(item) {
    return this.opts.host + '/' + this.GoogleDrive.id + '/thumbnail/' + this.getItemRequestPath(item);
  };

  Google.prototype.render = function render(state) {
    return this.view.render(state);
  };

  return Google;
}(Plugin);

},{"../../generic-provider-views/index":34,"../../uppy-base/src/plugins/Provider":37,"../Plugin":36,"yo-yoify/lib/appendChild":21}],36:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var yo = require('yo-yo');
var nanoraf = require('nanoraf');

var _require = require('../core/Utils'),
    findDOMElement = _require.findDOMElement;

var getFormData = require('get-form-data');

/**
 * Boilerplate that all Plugins share - and should not be used
 * directly. It also shows which methods final plugins should implement/override,
 * this deciding on structure.
 *
 * @param {object} main Uppy core object
 * @param {object} object with plugin options
 * @return {array | string} files or success/fail message
 */
module.exports = function () {
  function Plugin(core, opts) {
    _classCallCheck(this, Plugin);

    this.core = core;
    this.opts = opts || {};
    this.type = 'none';

    // clear everything inside the target selector
    this.opts.replaceTargetContent === this.opts.replaceTargetContent || true;

    this.update = this.update.bind(this);
    this.mount = this.mount.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  Plugin.prototype.update = function update(state) {
    if (typeof this.el === 'undefined') {
      return;
    }

    if (this.updateUI) {
      this.updateUI(state);
    }
  };

  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   *
   * @param {String|Object} target
   *
   */


  Plugin.prototype.mount = function mount(target, plugin) {
    var _this = this;

    var callerPluginName = plugin.id;

    var targetElement = findDOMElement(target);

    // Set up nanoraf.
    this.updateUI = nanoraf(function (state) {
      _this.el = yo.update(_this.el, _this.render(state));
    });

    if (targetElement) {
      this.core.log('Installing ' + callerPluginName + ' to a DOM element');

      // attempt to extract meta from form element
      if (this.opts.getMetaFromForm && targetElement.nodeName === 'FORM') {
        var formMeta = getFormData(targetElement);
        this.core.setMeta(formMeta);
      }

      // clear everything inside the target container
      if (this.opts.replaceTargetContent) {
        targetElement.innerHTML = '';
      }

      this.el = plugin.render(this.core.state);
      targetElement.appendChild(this.el);

      return targetElement;
    } else {
      // TODO: is instantiating the plugin really the way to roll
      // just to get the plugin name?
      var Target = target;
      var targetPluginName = new Target().id;

      this.core.log('Installing ' + callerPluginName + ' to ' + targetPluginName);

      var targetPlugin = this.core.getPlugin(targetPluginName);
      var selectorTarget = targetPlugin.addTarget(plugin);

      return selectorTarget;
    }
  };

  Plugin.prototype.unmount = function unmount() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  };

  Plugin.prototype.install = function install() {
    return;
  };

  Plugin.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return Plugin;
}();

},{"../core/Utils":25,"get-form-data":3,"nanoraf":8,"yo-yo":14}],37:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('whatwg-fetch');

var _getName = function _getName(id) {
  return id.split('-').map(function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};

module.exports = function () {
  function Provider(core, opts) {
    _classCallCheck(this, Provider);

    this.core = core;
    this.opts = opts;
    this.provider = opts.provider;
    this.id = this.provider;
    this.authProvider = opts.authProvider || this.provider;
    this.name = this.opts.name || _getName(this.id);

    this.onReceiveResponse = this.onReceiveResponse.bind(this);
  }

  _createClass(Provider, [{
    key: 'onReceiveResponse',
    value: function onReceiveResponse(response) {
      var uppyServer = this.core.state.uppyServer || {};
      var host = this.opts.host;
      var headers = response.headers;
      // Store the self-identified domain name for the uppy-server we just hit.
      if (headers.has('i-am') && headers.get('i-am') !== uppyServer[host]) {
        this.core.setState({
          uppyServer: Object.assign({}, uppyServer, _defineProperty({}, host, headers.get('i-am')))
        });
      }
      return response;
    }
  }, {
    key: 'checkAuth',
    value: function checkAuth() {
      return fetch(this.hostname + '/' + this.id + '/authorized', {
        method: 'get',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(this.onReceiveResponse).then(function (res) {
        return res.json().then(function (payload) {
          return payload.authenticated;
        });
      });
    }
  }, {
    key: 'authUrl',
    value: function authUrl() {
      return this.hostname + '/' + this.id + '/connect';
    }
  }, {
    key: 'fileUrl',
    value: function fileUrl(id) {
      return this.hostname + '/' + this.id + '/get/' + id;
    }
  }, {
    key: 'list',
    value: function list(directory) {
      return fetch(this.hostname + '/' + this.id + '/list/' + (directory || ''), {
        method: 'get',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(this.onReceiveResponse).then(function (res) {
        return res.json();
      });
    }
  }, {
    key: 'logout',
    value: function logout() {
      var redirect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : location.href;

      return fetch(this.hostname + '/' + this.id + '/logout?redirect=' + redirect, {
        method: 'get',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    }
  }, {
    key: 'hostname',
    get: function get() {
      var uppyServer = this.core.state.uppyServer || {};
      var host = this.opts.host;
      return uppyServer[host] || host;
    }
  }]);

  return Provider;
}();

},{"whatwg-fetch":13}],38:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

module.exports = function (input) {
	var buf = new Uint8Array(input);

	if (!(buf && buf.length > 1)) {
		return null;
	}

	var check = function check(header, opts) {
		opts = _extends({
			offset: 0
		}, opts);

		for (var i = 0; i < header.length; i++) {
			if (header[i] !== buf[i + opts.offset]) {
				return false;
			}
		}

		return true;
	};

	if (check([0xFF, 0xD8, 0xFF])) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (check([0x47, 0x49, 0x46])) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (check([0x57, 0x45, 0x42, 0x50], { offset: 8 })) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	if (check([0x46, 0x4C, 0x49, 0x46])) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	// Needs to be before `tif` check
	if ((check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) && check([0x43, 0x52], { offset: 8 })) {
		return {
			ext: 'cr2',
			mime: 'image/x-canon-cr2'
		};
	}

	if (check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (check([0x42, 0x4D])) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (check([0x49, 0x49, 0xBC])) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (check([0x38, 0x42, 0x50, 0x53])) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	// Needs to be before the `zip` check
	if (check([0x50, 0x4B, 0x3, 0x4]) && check([0x6D, 0x69, 0x6D, 0x65, 0x74, 0x79, 0x70, 0x65, 0x61, 0x70, 0x70, 0x6C, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x2F, 0x65, 0x70, 0x75, 0x62, 0x2B, 0x7A, 0x69, 0x70], { offset: 30 })) {
		return {
			ext: 'epub',
			mime: 'application/epub+zip'
		};
	}

	// Needs to be before `zip` check
	// Assumes signed `.xpi` from addons.mozilla.org
	if (check([0x50, 0x4B, 0x3, 0x4]) && check([0x4D, 0x45, 0x54, 0x41, 0x2D, 0x49, 0x4E, 0x46, 0x2F, 0x6D, 0x6F, 0x7A, 0x69, 0x6C, 0x6C, 0x61, 0x2E, 0x72, 0x73, 0x61], { offset: 30 })) {
		return {
			ext: 'xpi',
			mime: 'application/x-xpinstall'
		};
	}

	if (check([0x50, 0x4B]) && (buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) && (buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (check([0x75, 0x73, 0x74, 0x61, 0x72], { offset: 257 })) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) && (buf[6] === 0x0 || buf[6] === 0x1)) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	if (check([0x1F, 0x8B, 0x8])) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (check([0x42, 0x5A, 0x68])) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (check([0x78, 0x01])) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (check([0x0, 0x0, 0x0]) && (buf[3] === 0x18 || buf[3] === 0x20) && check([0x66, 0x74, 0x79, 0x70], { offset: 4 }) || check([0x33, 0x67, 0x70, 0x35]) || check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32]) && check([0x6D, 0x70, 0x34, 0x31, 0x6D, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6F, 0x6D], { offset: 16 }) || check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D]) || check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32, 0x0, 0x0, 0x0, 0x0])) {
		return {
			ext: 'mp4',
			mime: 'video/mp4'
		};
	}

	if (check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x56])) {
		return {
			ext: 'm4v',
			mime: 'video/x-m4v'
		};
	}

	if (check([0x4D, 0x54, 0x68, 0x64])) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	// https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska
	if (check([0x1A, 0x45, 0xDF, 0xA3])) {
		var sliced = buf.subarray(4, 4 + 4096);
		var idPos = sliced.findIndex(function (el, i, arr) {
			return arr[i] === 0x42 && arr[i + 1] === 0x82;
		});

		if (idPos >= 0) {
			var docTypePos = idPos + 3;
			var findDocType = function findDocType(type) {
				return Array.from(type).every(function (c, i) {
					return sliced[docTypePos + i] === c.charCodeAt(0);
				});
			};

			if (findDocType('matroska')) {
				return {
					ext: 'mkv',
					mime: 'video/x-matroska'
				};
			}

			if (findDocType('webm')) {
				return {
					ext: 'webm',
					mime: 'video/webm'
				};
			}
		}
	}

	if (check([0x0, 0x0, 0x0, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]) || check([0x66, 0x72, 0x65, 0x65], { offset: 4 }) || check([0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], { offset: 4 }) || check([0x6D, 0x64, 0x61, 0x74], { offset: 4 }) || // MJPEG
	check([0x77, 0x69, 0x64, 0x65], { offset: 4 })) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	if (check([0x52, 0x49, 0x46, 0x46]) && check([0x41, 0x56, 0x49], { offset: 8 })) {
		return {
			ext: 'avi',
			mime: 'video/x-msvideo'
		};
	}

	if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
		return {
			ext: 'wmv',
			mime: 'video/x-ms-wmv'
		};
	}

	if (check([0x0, 0x0, 0x1, 0xBA])) {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	if (check([0x49, 0x44, 0x33]) || check([0xFF, 0xFB])) {
		return {
			ext: 'mp3',
			mime: 'audio/mpeg'
		};
	}

	if (check([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], { offset: 4 }) || check([0x4D, 0x34, 0x41, 0x20])) {
		return {
			ext: 'm4a',
			mime: 'audio/m4a'
		};
	}

	// Needs to be before `ogg` check
	if (check([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], { offset: 28 })) {
		return {
			ext: 'opus',
			mime: 'audio/opus'
		};
	}

	if (check([0x4F, 0x67, 0x67, 0x53])) {
		return {
			ext: 'ogg',
			mime: 'audio/ogg'
		};
	}

	if (check([0x66, 0x4C, 0x61, 0x43])) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (check([0x52, 0x49, 0x46, 0x46]) && check([0x57, 0x41, 0x56, 0x45], { offset: 8 })) {
		return {
			ext: 'wav',
			mime: 'audio/x-wav'
		};
	}

	if (check([0x23, 0x21, 0x41, 0x4D, 0x52, 0x0A])) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (check([0x25, 0x50, 0x44, 0x46])) {
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (check([0x4D, 0x5A])) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if ((buf[0] === 0x43 || buf[0] === 0x46) && check([0x57, 0x53], { offset: 1 })) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	if (check([0x7B, 0x5C, 0x72, 0x74, 0x66])) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (check([0x00, 0x61, 0x73, 0x6D])) {
		return {
			ext: 'wasm',
			mime: 'application/wasm'
		};
	}

	if (check([0x77, 0x4F, 0x46, 0x46]) && (check([0x00, 0x01, 0x00, 0x00], { offset: 4 }) || check([0x4F, 0x54, 0x54, 0x4F], { offset: 4 }))) {
		return {
			ext: 'woff',
			mime: 'font/woff'
		};
	}

	if (check([0x77, 0x4F, 0x46, 0x32]) && (check([0x00, 0x01, 0x00, 0x00], { offset: 4 }) || check([0x4F, 0x54, 0x54, 0x4F], { offset: 4 }))) {
		return {
			ext: 'woff2',
			mime: 'font/woff2'
		};
	}

	if (check([0x4C, 0x50], { offset: 34 }) && (check([0x00, 0x00, 0x01], { offset: 8 }) || check([0x01, 0x00, 0x02], { offset: 8 }) || check([0x02, 0x00, 0x02], { offset: 8 }))) {
		return {
			ext: 'eot',
			mime: 'application/octet-stream'
		};
	}

	if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
		return {
			ext: 'ttf',
			mime: 'font/ttf'
		};
	}

	if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
		return {
			ext: 'otf',
			mime: 'font/otf'
		};
	}

	if (check([0x00, 0x00, 0x01, 0x00])) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (check([0x46, 0x4C, 0x56, 0x01])) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (check([0x25, 0x21])) {
		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (check([0x53, 0x51, 0x4C, 0x69])) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (check([0x4E, 0x45, 0x53, 0x1A])) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (check([0x43, 0x72, 0x32, 0x34])) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (check([0x4D, 0x53, 0x43, 0x46]) || check([0x49, 0x53, 0x63, 0x28])) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	// Needs to be before `ar` check
	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E, 0x0A, 0x64, 0x65, 0x62, 0x69, 0x61, 0x6E, 0x2D, 0x62, 0x69, 0x6E, 0x61, 0x72, 0x79])) {
		return {
			ext: 'deb',
			mime: 'application/x-deb'
		};
	}

	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E])) {
		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	if (check([0xED, 0xAB, 0xEE, 0xDB])) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	if (check([0x1F, 0xA0]) || check([0x1F, 0x9D])) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	if (check([0x4C, 0x5A, 0x49, 0x50])) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
		return {
			ext: 'msi',
			mime: 'application/x-msi'
		};
	}

	if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
		return {
			ext: 'mxf',
			mime: 'application/mxf'
		};
	}

	if (check([0x47], { offset: 4 }) && (check([0x47], { offset: 192 }) || check([0x47], { offset: 196 }))) {
		return {
			ext: 'mts',
			mime: 'video/mp2t'
		};
	}

	if (check([0x42, 0x4C, 0x45, 0x4E, 0x44, 0x45, 0x52])) {
		return {
			ext: 'blend',
			mime: 'application/x-blender'
		};
	}

	if (check([0x42, 0x50, 0x47, 0xFB])) {
		return {
			ext: 'bpg',
			mime: 'image/bpg'
		};
	}

	return null;
};

},{}],39:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && !isFinite(value)) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":44}],40:[function(require,module,exports){

},{}],41:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],42:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],43:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],44:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":43,"_process":41,"inherits":42}],45:[function(require,module,exports){
'use strict';

var Uppy = require('/home/travis/build/transloadit/uppy/src/core/Core');
var GoogleDrive = require('/home/travis/build/transloadit/uppy/src/plugins/GoogleDrive');
var UPPY_SERVER = require('../env');

var uppy = new Uppy({ debug: true, autoProceed: false });
uppy.use(GoogleDrive, { target: '#GoogleDriveContainer', host: UPPY_SERVER }).run();

},{"../env":46,"/home/travis/build/transloadit/uppy/src/core/Core":22,"/home/travis/build/transloadit/uppy/src/plugins/GoogleDrive":35}],46:[function(require,module,exports){
'use strict';

var uppyServerEndpoint = 'http://localhost:3020';

if (location.hostname === 'uppy.io') {
  uppyServerEndpoint = '//server.uppy.io';
}

var UPPY_SERVER = uppyServerEndpoint;
module.exports = UPPY_SERVER;

},{}]},{},[45])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9kaXN0L2Jyb3dzZXItY3VpZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9lczYtcHJvbWlzZS9kaXN0L2VzNi1wcm9taXNlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2dldC1mb3JtLWRhdGEvbGliL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC50aHJvdHRsZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9taW1lLW1hdGNoL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL21pbWUtbWF0Y2gvbm9kZV9tb2R1bGVzL3dpbGRjYXJkL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL25hbWVzcGFjZS1lbWl0dGVyL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL25hbm9yYWYvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvb24tbG9hZC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9vbi1sb2FkL25vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCIuLi9ub2RlX21vZHVsZXMvb24tbG9hZC9ub2RlX21vZHVsZXMvZ2xvYmFsL3dpbmRvdy5qcyIsIi4uL25vZGVfbW9kdWxlcy9wcmV0dGllci1ieXRlcy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCIuLi9ub2RlX21vZHVsZXMveW8teW8vaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMveW8teW8vbm9kZV9tb2R1bGVzL2JlbC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy95by15by9ub2RlX21vZHVsZXMvYmVsL25vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCIuLi9ub2RlX21vZHVsZXMveW8teW8vbm9kZV9tb2R1bGVzL2JlbC9ub2RlX21vZHVsZXMvaHlwZXJ4L2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3lvLXlvL25vZGVfbW9kdWxlcy9iZWwvbm9kZV9tb2R1bGVzL2h5cGVyeC9ub2RlX21vZHVsZXMvaHlwZXJzY3JpcHQtYXR0cmlidXRlLXRvLXByb3BlcnR5L2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3lvLXlvL25vZGVfbW9kdWxlcy9tb3JwaGRvbS9kaXN0L21vcnBoZG9tLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3lvLXlvL3VwZGF0ZS1ldmVudHMuanMiLCIuLi9ub2RlX21vZHVsZXMveW8teW9pZnkvbGliL2FwcGVuZENoaWxkLmpzIiwiLi4vc3JjL2NvcmUvQ29yZS5qcyIsIi4uL3NyYy9jb3JlL1RyYW5zbGF0b3IuanMiLCIuLi9zcmMvY29yZS9VcHB5U29ja2V0LmpzIiwiLi4vc3JjL2NvcmUvVXRpbHMuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9BdXRoVmlldy5qcyIsIi4uL3NyYy9nZW5lcmljLXByb3ZpZGVyLXZpZXdzL0JyZWFkY3J1bWIuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9CcmVhZGNydW1icy5qcyIsIi4uL3NyYy9nZW5lcmljLXByb3ZpZGVyLXZpZXdzL0Jyb3dzZXIuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9Mb2FkZXIuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9UYWJsZS5qcyIsIi4uL3NyYy9nZW5lcmljLXByb3ZpZGVyLXZpZXdzL1RhYmxlQ29sdW1uLmpzIiwiLi4vc3JjL2dlbmVyaWMtcHJvdmlkZXItdmlld3MvVGFibGVSb3cuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9pbmRleC5qcyIsIi4uL3NyYy9wbHVnaW5zL0dvb2dsZURyaXZlL2luZGV4LmpzIiwiLi4vc3JjL3BsdWdpbnMvUGx1Z2luLmpzIiwiLi4vc3JjL3VwcHktYmFzZS9zcmMvcGx1Z2lucy9Qcm92aWRlci5qcyIsIi4uL3NyYy92ZW5kb3IvZmlsZS10eXBlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9hc3NlcnQuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwic3JjL2V4YW1wbGVzL2RyaXZlL2FwcC5lczYiLCJzcmMvZXhhbXBsZXMvZW52LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDLzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxcUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2V0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQzFrQkEsSUFBTSxPQUFPLFFBQVEsb0JBQVIsQ0FBYjtBQUNBLElBQU0sY0FBYyxRQUFRLDhCQUFSLENBQXBCO0FBQ0EsSUFBTSxjQUFjLFFBQVEsUUFBUixDQUFwQjs7QUFFQSxJQUFNLE9BQU8sSUFBSSxJQUFKLENBQVMsRUFBQyxPQUFPLElBQVIsRUFBYyxhQUFhLEtBQTNCLEVBQVQsQ0FBYjtBQUNBLEtBQ0csR0FESCxDQUNPLFdBRFAsRUFDb0IsRUFBRSxRQUFRLHVCQUFWLEVBQW1DLE1BQU0sV0FBekMsRUFEcEIsRUFFRyxHQUZIOzs7OztBQ0xBLElBQUkscUJBQXFCLHVCQUF6Qjs7QUFFQSxJQUFJLFNBQVMsUUFBVCxLQUFzQixTQUExQixFQUFxQztBQUNuQyx1QkFBcUIsa0JBQXJCO0FBQ0Q7O0FBRUQsSUFBTSxjQUFjLGtCQUFwQjtBQUNBLE9BQU8sT0FBUCxHQUFpQixXQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGN1aWQuanNcbiAqIENvbGxpc2lvbi1yZXNpc3RhbnQgVUlEIGdlbmVyYXRvciBmb3IgYnJvd3NlcnMgYW5kIG5vZGUuXG4gKiBTZXF1ZW50aWFsIGZvciBmYXN0IGRiIGxvb2t1cHMgYW5kIHJlY2VuY3kgc29ydGluZy5cbiAqIFNhZmUgZm9yIGVsZW1lbnQgSURzIGFuZCBzZXJ2ZXItc2lkZSBsb29rdXBzLlxuICpcbiAqIEV4dHJhY3RlZCBmcm9tIENMQ1RSXG4gKlxuICogQ29weXJpZ2h0IChjKSBFcmljIEVsbGlvdHQgMjAxMlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4vKmdsb2JhbCB3aW5kb3csIG5hdmlnYXRvciwgZG9jdW1lbnQsIHJlcXVpcmUsIHByb2Nlc3MsIG1vZHVsZSAqL1xuKGZ1bmN0aW9uIChhcHApIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgbmFtZXNwYWNlID0gJ2N1aWQnLFxuICAgIGMgPSAwLFxuICAgIGJsb2NrU2l6ZSA9IDQsXG4gICAgYmFzZSA9IDM2LFxuICAgIGRpc2NyZXRlVmFsdWVzID0gTWF0aC5wb3coYmFzZSwgYmxvY2tTaXplKSxcblxuICAgIHBhZCA9IGZ1bmN0aW9uIHBhZChudW0sIHNpemUpIHtcbiAgICAgIHZhciBzID0gXCIwMDAwMDAwMDBcIiArIG51bTtcbiAgICAgIHJldHVybiBzLnN1YnN0cihzLmxlbmd0aC1zaXplKTtcbiAgICB9LFxuXG4gICAgcmFuZG9tQmxvY2sgPSBmdW5jdGlvbiByYW5kb21CbG9jaygpIHtcbiAgICAgIHJldHVybiBwYWQoKE1hdGgucmFuZG9tKCkgKlxuICAgICAgICAgICAgZGlzY3JldGVWYWx1ZXMgPDwgMClcbiAgICAgICAgICAgIC50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcbiAgICB9LFxuXG4gICAgc2FmZUNvdW50ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjID0gKGMgPCBkaXNjcmV0ZVZhbHVlcykgPyBjIDogMDtcbiAgICAgIGMrKzsgLy8gdGhpcyBpcyBub3Qgc3VibGltaW5hbFxuICAgICAgcmV0dXJuIGMgLSAxO1xuICAgIH0sXG5cbiAgICBhcGkgPSBmdW5jdGlvbiBjdWlkKCkge1xuICAgICAgLy8gU3RhcnRpbmcgd2l0aCBhIGxvd2VyY2FzZSBsZXR0ZXIgbWFrZXNcbiAgICAgIC8vIGl0IEhUTUwgZWxlbWVudCBJRCBmcmllbmRseS5cbiAgICAgIHZhciBsZXR0ZXIgPSAnYycsIC8vIGhhcmQtY29kZWQgYWxsb3dzIGZvciBzZXF1ZW50aWFsIGFjY2Vzc1xuXG4gICAgICAgIC8vIHRpbWVzdGFtcFxuICAgICAgICAvLyB3YXJuaW5nOiB0aGlzIGV4cG9zZXMgdGhlIGV4YWN0IGRhdGUgYW5kIHRpbWVcbiAgICAgICAgLy8gdGhhdCB0aGUgdWlkIHdhcyBjcmVhdGVkLlxuICAgICAgICB0aW1lc3RhbXAgPSAobmV3IERhdGUoKS5nZXRUaW1lKCkpLnRvU3RyaW5nKGJhc2UpLFxuXG4gICAgICAgIC8vIFByZXZlbnQgc2FtZS1tYWNoaW5lIGNvbGxpc2lvbnMuXG4gICAgICAgIGNvdW50ZXIsXG5cbiAgICAgICAgLy8gQSBmZXcgY2hhcnMgdG8gZ2VuZXJhdGUgZGlzdGluY3QgaWRzIGZvciBkaWZmZXJlbnRcbiAgICAgICAgLy8gY2xpZW50cyAoc28gZGlmZmVyZW50IGNvbXB1dGVycyBhcmUgZmFyIGxlc3NcbiAgICAgICAgLy8gbGlrZWx5IHRvIGdlbmVyYXRlIHRoZSBzYW1lIGlkKVxuICAgICAgICBmaW5nZXJwcmludCA9IGFwaS5maW5nZXJwcmludCgpLFxuXG4gICAgICAgIC8vIEdyYWIgc29tZSBtb3JlIGNoYXJzIGZyb20gTWF0aC5yYW5kb20oKVxuICAgICAgICByYW5kb20gPSByYW5kb21CbG9jaygpICsgcmFuZG9tQmxvY2soKTtcblxuICAgICAgICBjb3VudGVyID0gcGFkKHNhZmVDb3VudGVyKCkudG9TdHJpbmcoYmFzZSksIGJsb2NrU2l6ZSk7XG5cbiAgICAgIHJldHVybiAgKGxldHRlciArIHRpbWVzdGFtcCArIGNvdW50ZXIgKyBmaW5nZXJwcmludCArIHJhbmRvbSk7XG4gICAgfTtcblxuICBhcGkuc2x1ZyA9IGZ1bmN0aW9uIHNsdWcoKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKS50b1N0cmluZygzNiksXG4gICAgICBjb3VudGVyLFxuICAgICAgcHJpbnQgPSBhcGkuZmluZ2VycHJpbnQoKS5zbGljZSgwLDEpICtcbiAgICAgICAgYXBpLmZpbmdlcnByaW50KCkuc2xpY2UoLTEpLFxuICAgICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKS5zbGljZSgtMik7XG5cbiAgICAgIGNvdW50ZXIgPSBzYWZlQ291bnRlcigpLnRvU3RyaW5nKDM2KS5zbGljZSgtNCk7XG5cbiAgICByZXR1cm4gZGF0ZS5zbGljZSgtMikgK1xuICAgICAgY291bnRlciArIHByaW50ICsgcmFuZG9tO1xuICB9O1xuXG4gIGFwaS5nbG9iYWxDb3VudCA9IGZ1bmN0aW9uIGdsb2JhbENvdW50KCkge1xuICAgIC8vIFdlIHdhbnQgdG8gY2FjaGUgdGhlIHJlc3VsdHMgb2YgdGhpc1xuICAgIHZhciBjYWNoZSA9IChmdW5jdGlvbiBjYWxjKCkge1xuICAgICAgICB2YXIgaSxcbiAgICAgICAgICBjb3VudCA9IDA7XG5cbiAgICAgICAgZm9yIChpIGluIHdpbmRvdykge1xuICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgICB9KCkpO1xuXG4gICAgYXBpLmdsb2JhbENvdW50ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gY2FjaGU7IH07XG4gICAgcmV0dXJuIGNhY2hlO1xuICB9O1xuXG4gIGFwaS5maW5nZXJwcmludCA9IGZ1bmN0aW9uIGJyb3dzZXJQcmludCgpIHtcbiAgICByZXR1cm4gcGFkKChuYXZpZ2F0b3IubWltZVR5cGVzLmxlbmd0aCArXG4gICAgICBuYXZpZ2F0b3IudXNlckFnZW50Lmxlbmd0aCkudG9TdHJpbmcoMzYpICtcbiAgICAgIGFwaS5nbG9iYWxDb3VudCgpLnRvU3RyaW5nKDM2KSwgNCk7XG4gIH07XG5cbiAgLy8gZG9uJ3QgY2hhbmdlIGFueXRoaW5nIGZyb20gaGVyZSBkb3duLlxuICBpZiAoYXBwLnJlZ2lzdGVyKSB7XG4gICAgYXBwLnJlZ2lzdGVyKG5hbWVzcGFjZSwgYXBpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gYXBpO1xuICB9IGVsc2Uge1xuICAgIGFwcFtuYW1lc3BhY2VdID0gYXBpO1xuICB9XG5cbn0odGhpcy5hcHBsaXR1ZGUgfHwgdGhpcykpO1xuIiwiLyohXG4gKiBAb3ZlcnZpZXcgZXM2LXByb21pc2UgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9ycyAoQ29udmVyc2lvbiB0byBFUzYgQVBJIGJ5IEpha2UgQXJjaGliYWxkKVxuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2pha2VhcmNoaWJhbGQvZXM2LXByb21pc2UvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgMy4yLjFcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRvYmplY3RPckZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyB8fCAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc01heWJlVGhlbmFibGUoeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsO1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5O1xuICAgIGlmICghQXJyYXkuaXNBcnJheSkge1xuICAgICAgbGliJGVzNiRwcm9taXNlJHV0aWxzJCRfaXNBcnJheSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0FycmF5ID0gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRfaXNBcnJheTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiA9IDA7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQ7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbjtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2xpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW5dID0gY2FsbGJhY2s7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArIDFdID0gYXJnO1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArPSAyO1xuICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPT09IDIpIHtcbiAgICAgICAgLy8gSWYgbGVuIGlzIDIsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgICAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgICAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4obGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldFNjaGVkdWxlcihzY2hlZHVsZUZuKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4gPSBzY2hlZHVsZUZuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzZXRBc2FwKGFzYXBGbikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXAgPSBhc2FwRm47XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93ID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3NlcldpbmRvdyB8fCB7fTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNOb2RlID0gdHlwZW9mIHNlbGYgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXSc7XG5cbiAgICAvLyB0ZXN0IGZvciB3ZWIgd29ya2VyIGJ1dCBub3QgaW4gSUUxMFxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICAvLyBub2RlXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU5leHRUaWNrKCkge1xuICAgICAgLy8gbm9kZSB2ZXJzaW9uIDAuMTAueCBkaXNwbGF5cyBhIGRlcHJlY2F0aW9uIHdhcm5pbmcgd2hlbiBuZXh0VGljayBpcyB1c2VkIHJlY3Vyc2l2ZWx5XG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2N1am9qcy93aGVuL2lzc3Vlcy80MTAgZm9yIGRldGFpbHNcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB2ZXJ0eFxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VWZXJ0eFRpbWVyKCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkdmVydHhOZXh0KGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcihsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB3ZWIgd29ya2VyXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoLCAxKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2goKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW47IGkrPTIpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2ldO1xuICAgICAgICB2YXIgYXJnID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2krMV07XG5cbiAgICAgICAgY2FsbGJhY2soYXJnKTtcblxuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpKzFdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXR0ZW1wdFZlcnR4KCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHIgPSByZXF1aXJlO1xuICAgICAgICB2YXIgdmVydHggPSByKCd2ZXJ0eCcpO1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkdmVydHhOZXh0ID0gdmVydHgucnVuT25Mb29wIHx8IHZlcnR4LnJ1bk9uQ29udGV4dDtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VWZXJ0eFRpbWVyKCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VTZXRUaW1lb3V0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoO1xuICAgIC8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG4gICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc05vZGUpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU5leHRUaWNrKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc1dvcmtlcikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93ID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGF0dGVtcHRWZXJ0eCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VTZXRUaW1lb3V0KCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSR0aGVuJCR0aGVuKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgICB2YXIgcGFyZW50ID0gdGhpcztcblxuICAgICAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgIGlmIChjaGlsZFtsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQUk9NSVNFX0lEXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG1ha2VQcm9taXNlKGNoaWxkKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1tzdGF0ZSAtIDFdO1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChmdW5jdGlvbigpe1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHN0YXRlLCBjaGlsZCwgY2FsbGJhY2ssIHBhcmVudC5fcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdGhlbiQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSR0aGVuJCR0aGVuO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJHJlc29sdmUob2JqZWN0KSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QuY29uc3RydWN0b3IgPT09IENvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkcmVzb2x2ZTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUFJPTUlTRV9JRCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygxNik7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKCkge31cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IgPSBuZXcgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxmaWxsbWVudCgpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRjYW5ub3RSZXR1cm5Pd24oKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4ocHJvbWlzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbikge1xuICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3IgPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgICAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgICAgIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3RvciAmJlxuICAgICAgICAgIHRoZW4gPT09IGxpYiRlczYkcHJvbWlzZSR0aGVuJCRkZWZhdWx0ICYmXG4gICAgICAgICAgY29uc3RydWN0b3IucmVzb2x2ZSA9PT0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGVuID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24odGhlbikpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc2VsZkZ1bGZpbGxtZW50KCkpO1xuICAgICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4odmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgICAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICAgICAgcHJvbWlzZS5fb25lcnJvcihwcm9taXNlLl9yZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cblxuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuXG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gICAgICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcblxuICAgICAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgICAgIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgICAgIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUiA9IG5ldyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZTtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgICAgIHZhbHVlLCBlcnJvciwgc3VjY2VlZGVkLCBmYWlsZWQ7XG5cbiAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICB2YWx1ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAvLyBub29wXG4gICAgICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpe1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGlkID0gMDtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRuZXh0SWQoKSB7XG4gICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaWQrKztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRtYWtlUHJvbWlzZShwcm9taXNlKSB7XG4gICAgICBwcm9taXNlW2xpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBST01JU0VfSURdID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaWQrKztcbiAgICAgIHByb21pc2UuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgcHJvbWlzZS5fc3Vic2NyaWJlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbChlbnRyaWVzKSB7XG4gICAgICByZXR1cm4gbmV3IGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRkZWZhdWx0KHRoaXMsIGVudHJpZXMpLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbDtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRyYWNlKGVudHJpZXMpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICBpZiAoIWxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNBcnJheShlbnRyaWVzKSkge1xuICAgICAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIENvbnN0cnVjdG9yLnJlc29sdmUoZW50cmllc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkcmFjZTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJHJlamVjdChyZWFzb24pIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRyZWplY3Q7XG5cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc05ldygpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2U7XG4gICAgLyoqXG4gICAgICBQcm9taXNlIG9iamVjdHMgcmVwcmVzZW50IHRoZSBldmVudHVhbCByZXN1bHQgb2YgYW4gYXN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhlXG4gICAgICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICAgICAgcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGUgcmVhc29uXG4gICAgICB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgVGVybWlub2xvZ3lcbiAgICAgIC0tLS0tLS0tLS0tXG5cbiAgICAgIC0gYHByb21pc2VgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB3aXRoIGEgYHRoZW5gIG1ldGhvZCB3aG9zZSBiZWhhdmlvciBjb25mb3JtcyB0byB0aGlzIHNwZWNpZmljYXRpb24uXG4gICAgICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gICAgICAtIGB2YWx1ZWAgaXMgYW55IGxlZ2FsIEphdmFTY3JpcHQgdmFsdWUgKGluY2x1ZGluZyB1bmRlZmluZWQsIGEgdGhlbmFibGUsIG9yIGEgcHJvbWlzZSkuXG4gICAgICAtIGBleGNlcHRpb25gIGlzIGEgdmFsdWUgdGhhdCBpcyB0aHJvd24gdXNpbmcgdGhlIHRocm93IHN0YXRlbWVudC5cbiAgICAgIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgICAgIC0gYHNldHRsZWRgIHRoZSBmaW5hbCByZXN0aW5nIHN0YXRlIG9mIGEgcHJvbWlzZSwgZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuXG4gICAgICBBIHByb21pc2UgY2FuIGJlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6IHBlbmRpbmcsIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gICAgICBzdGF0ZS4gIFByb21pc2VzIHRoYXQgYXJlIHJlamVjdGVkIGhhdmUgYSByZWplY3Rpb24gcmVhc29uIGFuZCBhcmUgaW4gdGhlXG4gICAgICByZWplY3RlZCBzdGF0ZS4gIEEgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmV2ZXIgYSB0aGVuYWJsZS5cblxuICAgICAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gICAgICBwcm9taXNlLCB0aGVuIHRoZSBvcmlnaW5hbCBwcm9taXNlJ3Mgc2V0dGxlZCBzdGF0ZSB3aWxsIG1hdGNoIHRoZSB2YWx1ZSdzXG4gICAgICBzZXR0bGVkIHN0YXRlLiAgU28gYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCByZWplY3RzIHdpbGxcbiAgICAgIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgICAgIGl0c2VsZiBmdWxmaWxsLlxuXG5cbiAgICAgIEJhc2ljIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIGBgYGpzXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBvbiBzdWNjZXNzXG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuXG4gICAgICAgIC8vIG9uIGZhaWx1cmVcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICBQcm9taXNlcyBzaGluZSB3aGVuIGFic3RyYWN0aW5nIGF3YXkgYXN5bmNocm9ub3VzIGludGVyYWN0aW9ucyBzdWNoIGFzXG4gICAgICBgWE1MSHR0cFJlcXVlc3Rgcy5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBoYW5kbGVyO1xuICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgeGhyLnNlbmQoKTtcblxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSB0aGlzLkRPTkUpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2dldEpTT046IGAnICsgdXJsICsgJ2AgZmFpbGVkIHdpdGggc3RhdHVzOiBbJyArIHRoaXMuc3RhdHVzICsgJ10nKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZ2V0SlNPTignL3Bvc3RzLmpzb24nKS50aGVuKGZ1bmN0aW9uKGpzb24pIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFVubGlrZSBjYWxsYmFja3MsIHByb21pc2VzIGFyZSBncmVhdCBjb21wb3NhYmxlIHByaW1pdGl2ZXMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGdldEpTT04oJy9wb3N0cycpLFxuICAgICAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICAgICAgXSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuICAgICAgICB2YWx1ZXNbMF0gLy8gPT4gcG9zdHNKU09OXG4gICAgICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQGNsYXNzIFByb21pc2VcbiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVyXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlKHJlc29sdmVyKSB7XG4gICAgICB0aGlzW2xpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBST01JU0VfSURdID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbmV4dElkKCk7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB0aGlzLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG5cbiAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wICE9PSByZXNvbHZlcikge1xuICAgICAgICB0eXBlb2YgcmVzb2x2ZXIgIT09ICdmdW5jdGlvbicgJiYgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgICAgdGhpcyBpbnN0YW5jZW9mIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlID8gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UodGhpcywgcmVzb2x2ZXIpIDogbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzTmV3KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuYWxsID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkYWxsJCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJhY2UgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJlc29sdmUgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJlamVjdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkZGVmYXVsdDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5fc2V0U2NoZWR1bGVyID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldFNjaGVkdWxlcjtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5fc2V0QXNhcCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzZXRBc2FwO1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLl9hc2FwID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXA7XG5cbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5wcm90b3R5cGUgPSB7XG4gICAgICBjb25zdHJ1Y3RvcjogbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UsXG5cbiAgICAvKipcbiAgICAgIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICAgICAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgICAgIHJlYXNvbiB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHVzZXIgaXMgdW5hdmFpbGFibGUsIGFuZCB5b3UgYXJlIGdpdmVuIHRoZSByZWFzb24gd2h5XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBDaGFpbmluZ1xuICAgICAgLS0tLS0tLS1cblxuICAgICAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgICAgIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgICAgIG9yIHJlamVjdGlvbiBoYW5kbGVyLCBvciByZWplY3RlZCBpZiB0aGUgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiB1c2VyLm5hbWU7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCBuYW1lJztcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAgICAgLy8gd2lsbCBiZSBgJ2RlZmF1bHQgbmFtZSdgXG4gICAgICB9KTtcblxuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIGlmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgcmVhc29uYCB3aWxsIGJlICdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScuXG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICAgICAgfSk7XG4gICAgICBgYGBcbiAgICAgIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBQZWRhZ29naWNhbEV4Y2VwdGlvbignVXBzdHJlYW0gZXJyb3InKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gVGhlIGBQZWRnYWdvY2lhbEV4Y2VwdGlvbmAgaXMgcHJvcGFnYXRlZCBhbGwgdGhlIHdheSBkb3duIHRvIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFzc2ltaWxhdGlvblxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gICAgICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gICAgICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICAgICAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gVGhlIHVzZXIncyBjb21tZW50cyBhcmUgbm93IGF2YWlsYWJsZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBTaW1wbGUgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciBhdXRob3IsIGJvb2tzO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcblxuICAgICAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG5cbiAgICAgIH1cblxuICAgICAgZmluZEF1dGhvcihmdW5jdGlvbihhdXRob3IsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaW5kQm9vb2tzQnlBdXRob3IoYXV0aG9yLCBmdW5jdGlvbihib29rcywgZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICBmYWlsdXJlKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kQXV0aG9yKCkuXG4gICAgICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgICAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgICAgICAvLyBmb3VuZCBib29rc1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgdGhlblxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0ZWRcbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgIHRoZW46IGxpYiRlczYkcHJvbWlzZSR0aGVuJCRkZWZhdWx0LFxuXG4gICAgLyoqXG4gICAgICBgY2F0Y2hgIGlzIHNpbXBseSBzdWdhciBmb3IgYHRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbilgIHdoaWNoIG1ha2VzIGl0IHRoZSBzYW1lXG4gICAgICBhcyB0aGUgY2F0Y2ggYmxvY2sgb2YgYSB0cnkvY2F0Y2ggc3RhdGVtZW50LlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkbid0IGZpbmQgdGhhdCBhdXRob3InKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3luY2hyb25vdXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRBdXRob3IoKTtcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9XG5cbiAgICAgIC8vIGFzeW5jIHdpdGggcHJvbWlzZXNcbiAgICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBjYXRjaFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuICAgIH07XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3I7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0KSB7XG4gICAgICB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3I7XG4gICAgICB0aGlzLnByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgIGlmICghdGhpcy5wcm9taXNlW2xpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBST01JU0VfSURdKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG1ha2VQcm9taXNlKHRoaXMucHJvbWlzZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIHRoaXMuX2lucHV0ICAgICA9IGlucHV0O1xuICAgICAgICB0aGlzLmxlbmd0aCAgICAgPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMDtcbiAgICAgICAgICB0aGlzLl9lbnVtZXJhdGUoKTtcbiAgICAgICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdCh0aGlzLnByb21pc2UsIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCR2YWxpZGF0aW9uRXJyb3IoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJHZhbGlkYXRpb25FcnJvcigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVuZ3RoICA9IHRoaXMubGVuZ3RoO1xuICAgICAgdmFyIGlucHV0ICAgPSB0aGlzLl9pbnB1dDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHRoaXMuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uKGVudHJ5LCBpKSB7XG4gICAgICB2YXIgYyA9IHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I7XG4gICAgICB2YXIgcmVzb2x2ZSA9IGMucmVzb2x2ZTtcblxuICAgICAgaWYgKHJlc29sdmUgPT09IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQpIHtcbiAgICAgICAgdmFyIHRoZW4gPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRnZXRUaGVuKGVudHJ5KTtcblxuICAgICAgICBpZiAodGhlbiA9PT0gbGliJGVzNiRwcm9taXNlJHRoZW4kJGRlZmF1bHQgJiZcbiAgICAgICAgICAgIGVudHJ5Ll9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gZW50cnk7XG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJGRlZmF1bHQpIHtcbiAgICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBjKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgZW50cnksIHRoZW4pO1xuICAgICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChwcm9taXNlLCBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQobmV3IGMoZnVuY3Rpb24ocmVzb2x2ZSkgeyByZXNvbHZlKGVudHJ5KTsgfSksIGkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQocmVzb2x2ZShlbnRyeSksIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcblxuICAgICAgICBpZiAoc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbihwcm9taXNlLCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQsIGksIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkcG9seWZpbGwoKSB7XG4gICAgICB2YXIgbG9jYWw7XG5cbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGxvY2FsID0gZ2xvYmFsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBsb2NhbCA9IHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGxvY2FsID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgICAgIGlmIChQICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChQLnJlc29sdmUoKSkgPT09ICdbb2JqZWN0IFByb21pc2VdJyAmJiAhUC5jYXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9jYWwuUHJvbWlzZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0O1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRwb2x5ZmlsbDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlID0ge1xuICAgICAgJ1Byb21pc2UnOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCxcbiAgICAgICdwb2x5ZmlsbCc6IGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdFxuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbGliJGVzNiRwcm9taXNlJHVtZCQkRVM2UHJvbWlzZTsgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGVbJ2V4cG9ydHMnXSkge1xuICAgICAgbW9kdWxlWydleHBvcnRzJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzWydFUzZQcm9taXNlJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdCgpO1xufSkuY2FsbCh0aGlzKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIE5PREVfTElTVF9DTEFTU0VTID0ge1xuICAnW29iamVjdCBIVE1MQ29sbGVjdGlvbl0nOiB0cnVlLFxuICAnW29iamVjdCBOb2RlTGlzdF0nOiB0cnVlLFxuICAnW29iamVjdCBSYWRpb05vZGVMaXN0XSc6IHRydWVcbn07XG5cbi8vIC50eXBlIHZhbHVlcyBmb3IgZWxlbWVudHMgd2hpY2ggY2FuIGFwcGVhciBpbiAuZWxlbWVudHMgYW5kIHNob3VsZCBiZSBpZ25vcmVkXG52YXIgSUdOT1JFRF9FTEVNRU5UX1RZUEVTID0ge1xuICAnYnV0dG9uJzogdHJ1ZSxcbiAgJ2ZpZWxkc2V0JzogdHJ1ZSxcbiAgLy8gJ2tleWdlbic6IHRydWUsXG4gIC8vICdvdXRwdXQnOiB0cnVlLFxuICAncmVzZXQnOiB0cnVlLFxuICAnc3VibWl0JzogdHJ1ZVxufTtcblxudmFyIENIRUNLRURfSU5QVVRfVFlQRVMgPSB7XG4gICdjaGVja2JveCc6IHRydWUsXG4gICdyYWRpbyc6IHRydWVcbn07XG5cbnZhciBUUklNX1JFID0gL15cXHMrfFxccyskL2c7XG5cbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogQHBhcmFtIHtIVE1MRm9ybUVsZW1lbnR9IGZvcm1cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywoc3RyaW5nfEFycmF5LjxzdHJpbmc+KT59IGFuIG9iamVjdCBjb250YWluaW5nXG4gKiAgIHN1Ym1pdHRhYmxlIHZhbHVlKHMpIGhlbGQgaW4gdGhlIGZvcm0ncyAuZWxlbWVudHMgY29sbGVjdGlvbiwgd2l0aFxuICogICBwcm9wZXJ0aWVzIG5hbWVkIGFzIHBlciBlbGVtZW50IG5hbWVzIG9yIGlkcy5cbiAqL1xuZnVuY3Rpb24gZ2V0Rm9ybURhdGEoZm9ybSkge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHsgdHJpbTogZmFsc2UgfSA6IGFyZ3VtZW50c1sxXTtcblxuICBpZiAoIWZvcm0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgZm9ybSBpcyByZXF1aXJlZCBieSBnZXRGb3JtRGF0YSwgd2FzIGdpdmVuIGZvcm09JyArIGZvcm0pO1xuICB9XG5cbiAgdmFyIGRhdGEgPSB7fTtcbiAgdmFyIGVsZW1lbnROYW1lID0gdW5kZWZpbmVkO1xuICB2YXIgZWxlbWVudE5hbWVzID0gW107XG4gIHZhciBlbGVtZW50TmFtZUxvb2t1cCA9IHt9O1xuXG4gIC8vIEdldCB1bmlxdWUgc3VibWl0dGFibGUgZWxlbWVudCBuYW1lcyBmb3IgdGhlIGZvcm1cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBmb3JtLmVsZW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHZhciBlbGVtZW50ID0gZm9ybS5lbGVtZW50c1tpXTtcbiAgICBpZiAoSUdOT1JFRF9FTEVNRU5UX1RZUEVTW2VsZW1lbnQudHlwZV0gfHwgZWxlbWVudC5kaXNhYmxlZCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGVsZW1lbnROYW1lID0gZWxlbWVudC5uYW1lIHx8IGVsZW1lbnQuaWQ7XG4gICAgaWYgKGVsZW1lbnROYW1lICYmICFlbGVtZW50TmFtZUxvb2t1cFtlbGVtZW50TmFtZV0pIHtcbiAgICAgIGVsZW1lbnROYW1lcy5wdXNoKGVsZW1lbnROYW1lKTtcbiAgICAgIGVsZW1lbnROYW1lTG9va3VwW2VsZW1lbnROYW1lXSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gRXh0cmFjdCBlbGVtZW50IGRhdGEgbmFtZS1ieS1uYW1lIGZvciBjb25zaXN0ZW50IGhhbmRsaW5nIG9mIHNwZWNpYWwgY2FzZXNcbiAgLy8gYXJvdW5kIGVsZW1lbnRzIHdoaWNoIGNvbnRhaW4gbXVsdGlwbGUgaW5wdXRzLlxuICBmb3IgKHZhciBpID0gMCwgbCA9IGVsZW1lbnROYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBlbGVtZW50TmFtZSA9IGVsZW1lbnROYW1lc1tpXTtcbiAgICB2YXIgdmFsdWUgPSBnZXROYW1lZEZvcm1FbGVtZW50RGF0YShmb3JtLCBlbGVtZW50TmFtZSwgb3B0aW9ucyk7XG4gICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgIGRhdGFbZWxlbWVudE5hbWVdID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRhdGE7XG59XG5cbi8qKlxuICogQHBhcmFtIHtIVE1MRm9ybUVsZW1lbnR9IGZvcm1cbiAqIEBwYXJhbSB7c3RyaW5nfSBlbGVtZW50TmFtZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4geyhzdHJpbmd8QXJyYXkuPHN0cmluZz4pfSBzdWJtaXR0YWJsZSB2YWx1ZShzKSBpbiB0aGUgZm9ybSBmb3IgYVxuICogICBuYW1lZCBlbGVtZW50IGZyb20gaXRzIC5lbGVtZW50cyBjb2xsZWN0aW9uLCBvciBudWxsIGlmIHRoZXJlIHdhcyBub1xuICogICBlbGVtZW50IHdpdGggdGhhdCBuYW1lIG9yIHRoZSBlbGVtZW50IGhhZCBubyBzdWJtaXR0YWJsZSB2YWx1ZShzKS5cbiAqL1xuZnVuY3Rpb24gZ2V0TmFtZWRGb3JtRWxlbWVudERhdGEoZm9ybSwgZWxlbWVudE5hbWUpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyB7IHRyaW06IGZhbHNlIH0gOiBhcmd1bWVudHNbMl07XG5cbiAgaWYgKCFmb3JtKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBIGZvcm0gaXMgcmVxdWlyZWQgYnkgZ2V0TmFtZWRGb3JtRWxlbWVudERhdGEsIHdhcyBnaXZlbiBmb3JtPScgKyBmb3JtKTtcbiAgfVxuICBpZiAoIWVsZW1lbnROYW1lICYmIHRvU3RyaW5nLmNhbGwoZWxlbWVudE5hbWUpICE9PSAnW29iamVjdCBTdHJpbmddJykge1xuICAgIHRocm93IG5ldyBFcnJvcignQSBmb3JtIGVsZW1lbnQgbmFtZSBpcyByZXF1aXJlZCBieSBnZXROYW1lZEZvcm1FbGVtZW50RGF0YSwgd2FzIGdpdmVuIGVsZW1lbnROYW1lPScgKyBlbGVtZW50TmFtZSk7XG4gIH1cblxuICB2YXIgZWxlbWVudCA9IGZvcm0uZWxlbWVudHNbZWxlbWVudE5hbWVdO1xuICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudC5kaXNhYmxlZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKCFOT0RFX0xJU1RfQ0xBU1NFU1t0b1N0cmluZy5jYWxsKGVsZW1lbnQpXSkge1xuICAgIHJldHVybiBnZXRGb3JtRWxlbWVudFZhbHVlKGVsZW1lbnQsIG9wdGlvbnMudHJpbSk7XG4gIH1cblxuICAvLyBEZWFsIHdpdGggbXVsdGlwbGUgZm9ybSBjb250cm9scyB3aGljaCBoYXZlIHRoZSBzYW1lIG5hbWVcbiAgdmFyIGRhdGEgPSBbXTtcbiAgdmFyIGFsbFJhZGlvcyA9IHRydWU7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gZWxlbWVudC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoZWxlbWVudFtpXS5kaXNhYmxlZCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxSYWRpb3MgJiYgZWxlbWVudFtpXS50eXBlICE9PSAncmFkaW8nKSB7XG4gICAgICBhbGxSYWRpb3MgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHZhbHVlID0gZ2V0Rm9ybUVsZW1lbnRWYWx1ZShlbGVtZW50W2ldLCBvcHRpb25zLnRyaW0pO1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICBkYXRhID0gZGF0YS5jb25jYXQodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNwZWNpYWwgY2FzZSBmb3IgYW4gZWxlbWVudCB3aXRoIG11bHRpcGxlIHNhbWUtbmFtZWQgaW5wdXRzIHdoaWNoIHdlcmUgYWxsXG4gIC8vIHJhZGlvIGJ1dHRvbnM6IGlmIHRoZXJlIHdhcyBhIHNlbGVjdGVkIHZhbHVlLCBvbmx5IHJldHVybiB0aGUgdmFsdWUuXG4gIGlmIChhbGxSYWRpb3MgJiYgZGF0YS5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gZGF0YVswXTtcbiAgfVxuXG4gIHJldHVybiBkYXRhLmxlbmd0aCA+IDAgPyBkYXRhIDogbnVsbDtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IGEgZm9ybSBlbGVtZW50LlxuICogQHBhcmFtIHtib29sZWFtfSB0cmltIHNob3VsZCB2YWx1ZXMgZm9yIHRleHQgZW50cnkgaW5wdXRzIGJlIHRyaW1tZWQ/XG4gKiBAcmV0dXJuIHsoc3RyaW5nfEFycmF5LjxzdHJpbmc+fEZpbGV8QXJyYXkuPEZpbGU+KX0gdGhlIGVsZW1lbnQncyBzdWJtaXR0YWJsZVxuICogICB2YWx1ZShzKSwgb3IgbnVsbCBpZiBpdCBoYWQgbm9uZS5cbiAqL1xuZnVuY3Rpb24gZ2V0Rm9ybUVsZW1lbnRWYWx1ZShlbGVtZW50LCB0cmltKSB7XG4gIHZhciB2YWx1ZSA9IG51bGw7XG4gIHZhciB0eXBlID0gZWxlbWVudC50eXBlO1xuXG4gIGlmICh0eXBlID09PSAnc2VsZWN0LW9uZScpIHtcbiAgICBpZiAoZWxlbWVudC5vcHRpb25zLmxlbmd0aCkge1xuICAgICAgdmFsdWUgPSBlbGVtZW50Lm9wdGlvbnNbZWxlbWVudC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgaWYgKHR5cGUgPT09ICdzZWxlY3QtbXVsdGlwbGUnKSB7XG4gICAgdmFsdWUgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGVsZW1lbnQub3B0aW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChlbGVtZW50Lm9wdGlvbnNbaV0uc2VsZWN0ZWQpIHtcbiAgICAgICAgdmFsdWUucHVzaChlbGVtZW50Lm9wdGlvbnNbaV0udmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB2YWx1ZSA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8vIElmIGEgZmlsZSBpbnB1dCBkb2Vzbid0IGhhdmUgYSBmaWxlcyBhdHRyaWJ1dGUsIGZhbGwgdGhyb3VnaCB0byB1c2luZyBpdHNcbiAgLy8gdmFsdWUgYXR0cmlidXRlLlxuICBpZiAodHlwZSA9PT0gJ2ZpbGUnICYmICdmaWxlcycgaW4gZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50Lm11bHRpcGxlKSB7XG4gICAgICB2YWx1ZSA9IHNsaWNlLmNhbGwoZWxlbWVudC5maWxlcyk7XG4gICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2hvdWxkIGJlIG51bGwgaWYgbm90IHByZXNlbnQsIGFjY29yZGluZyB0byB0aGUgc3BlY1xuICAgICAgdmFsdWUgPSBlbGVtZW50LmZpbGVzWzBdO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBpZiAoIUNIRUNLRURfSU5QVVRfVFlQRVNbdHlwZV0pIHtcbiAgICB2YWx1ZSA9IHRyaW0gPyBlbGVtZW50LnZhbHVlLnJlcGxhY2UoVFJJTV9SRSwgJycpIDogZWxlbWVudC52YWx1ZTtcbiAgfSBlbHNlIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICB2YWx1ZSA9IGVsZW1lbnQudmFsdWU7XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbmdldEZvcm1EYXRhLmdldE5hbWVkRm9ybUVsZW1lbnREYXRhID0gZ2V0TmFtZWRGb3JtRWxlbWVudERhdGE7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGdldEZvcm1EYXRhO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBOQU4gPSAwIC8gMDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heCxcbiAgICBuYXRpdmVNaW4gPSBNYXRoLm1pbjtcblxuLyoqXG4gKiBHZXRzIHRoZSB0aW1lc3RhbXAgb2YgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2VcbiAqIHRoZSBVbml4IGVwb2NoICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBEYXRlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lc3RhbXAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmZXIoZnVuY3Rpb24oc3RhbXApIHtcbiAqICAgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTtcbiAqIH0sIF8ubm93KCkpO1xuICogLy8gPT4gTG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgaW52b2NhdGlvbi5cbiAqL1xudmFyIG5vdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcm9vdC5EYXRlLm5vdygpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIGludm9raW5nIGBmdW5jYCB1bnRpbCBhZnRlciBgd2FpdGBcbiAqIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHdhc1xuICogaW52b2tlZC4gVGhlIGRlYm91bmNlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbFxuICogZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG8gaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uXG4gKiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGVcbiAqIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWRcbiAqIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnRcbiAqIGNhbGxzIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgXG4gKiBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLmRlYm91bmNlYCBhbmQgYF8udGhyb3R0bGVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVib3VuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF1cbiAqICBUaGUgbWF4aW11bSB0aW1lIGBmdW5jYCBpcyBhbGxvd2VkIHRvIGJlIGRlbGF5ZWQgYmVmb3JlIGl0J3MgaW52b2tlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZGVib3VuY2VkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBjb3N0bHkgY2FsY3VsYXRpb25zIHdoaWxlIHRoZSB3aW5kb3cgc2l6ZSBpcyBpbiBmbHV4LlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHNlbmRNYWlsYCB3aGVuIGNsaWNrZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxscy5cbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSkpO1xuICpcbiAqIC8vIEVuc3VyZSBgYmF0Y2hMb2dgIGlzIGludm9rZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHMuXG4gKiB2YXIgZGVib3VuY2VkID0gXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7ICdtYXhXYWl0JzogMTAwMCB9KTtcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIGpRdWVyeShzb3VyY2UpLm9uKCdtZXNzYWdlJywgZGVib3VuY2VkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIGRlYm91bmNlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgZGVib3VuY2VkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxhc3RBcmdzLFxuICAgICAgbGFzdFRoaXMsXG4gICAgICBtYXhXYWl0LFxuICAgICAgcmVzdWx0LFxuICAgICAgdGltZXJJZCxcbiAgICAgIGxhc3RDYWxsVGltZSxcbiAgICAgIGxhc3RJbnZva2VUaW1lID0gMCxcbiAgICAgIGxlYWRpbmcgPSBmYWxzZSxcbiAgICAgIG1heGluZyA9IGZhbHNlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHdhaXQgPSB0b051bWJlcih3YWl0KSB8fCAwO1xuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gISFvcHRpb25zLmxlYWRpbmc7XG4gICAgbWF4aW5nID0gJ21heFdhaXQnIGluIG9wdGlvbnM7XG4gICAgbWF4V2FpdCA9IG1heGluZyA/IG5hdGl2ZU1heCh0b051bWJlcihvcHRpb25zLm1heFdhaXQpIHx8IDAsIHdhaXQpIDogbWF4V2FpdDtcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRnVuYyh0aW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBsYXN0QXJncyxcbiAgICAgICAgdGhpc0FyZyA9IGxhc3RUaGlzO1xuXG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbGVhZGluZ0VkZ2UodGltZSkge1xuICAgIC8vIFJlc2V0IGFueSBgbWF4V2FpdGAgdGltZXIuXG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIC8vIFN0YXJ0IHRoZSB0aW1lciBmb3IgdGhlIHRyYWlsaW5nIGVkZ2UuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAvLyBJbnZva2UgdGhlIGxlYWRpbmcgZWRnZS5cbiAgICByZXR1cm4gbGVhZGluZyA/IGludm9rZUZ1bmModGltZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZW1haW5pbmdXYWl0KHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lLFxuICAgICAgICByZXN1bHQgPSB3YWl0IC0gdGltZVNpbmNlTGFzdENhbGw7XG5cbiAgICByZXR1cm4gbWF4aW5nID8gbmF0aXZlTWluKHJlc3VsdCwgbWF4V2FpdCAtIHRpbWVTaW5jZUxhc3RJbnZva2UpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSW52b2tlKHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lO1xuXG4gICAgLy8gRWl0aGVyIHRoaXMgaXMgdGhlIGZpcnN0IGNhbGwsIGFjdGl2aXR5IGhhcyBzdG9wcGVkIGFuZCB3ZSdyZSBhdCB0aGVcbiAgICAvLyB0cmFpbGluZyBlZGdlLCB0aGUgc3lzdGVtIHRpbWUgaGFzIGdvbmUgYmFja3dhcmRzIGFuZCB3ZSdyZSB0cmVhdGluZ1xuICAgIC8vIGl0IGFzIHRoZSB0cmFpbGluZyBlZGdlLCBvciB3ZSd2ZSBoaXQgdGhlIGBtYXhXYWl0YCBsaW1pdC5cbiAgICByZXR1cm4gKGxhc3RDYWxsVGltZSA9PT0gdW5kZWZpbmVkIHx8ICh0aW1lU2luY2VMYXN0Q2FsbCA+PSB3YWl0KSB8fFxuICAgICAgKHRpbWVTaW5jZUxhc3RDYWxsIDwgMCkgfHwgKG1heGluZyAmJiB0aW1lU2luY2VMYXN0SW52b2tlID49IG1heFdhaXQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyRXhwaXJlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgIGlmIChzaG91bGRJbnZva2UodGltZSkpIHtcbiAgICAgIHJldHVybiB0cmFpbGluZ0VkZ2UodGltZSk7XG4gICAgfVxuICAgIC8vIFJlc3RhcnQgdGhlIHRpbWVyLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgcmVtYWluaW5nV2FpdCh0aW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFpbGluZ0VkZ2UodGltZSkge1xuICAgIHRpbWVySWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBPbmx5IGludm9rZSBpZiB3ZSBoYXZlIGBsYXN0QXJnc2Agd2hpY2ggbWVhbnMgYGZ1bmNgIGhhcyBiZWVuXG4gICAgLy8gZGVib3VuY2VkIGF0IGxlYXN0IG9uY2UuXG4gICAgaWYgKHRyYWlsaW5nICYmIGxhc3RBcmdzKSB7XG4gICAgICByZXR1cm4gaW52b2tlRnVuYyh0aW1lKTtcbiAgICB9XG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIGlmICh0aW1lcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB9XG4gICAgbGFzdEludm9rZVRpbWUgPSAwO1xuICAgIGxhc3RBcmdzID0gbGFzdENhbGxUaW1lID0gbGFzdFRoaXMgPSB0aW1lcklkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgcmV0dXJuIHRpbWVySWQgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IHRyYWlsaW5nRWRnZShub3coKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKSxcbiAgICAgICAgaXNJbnZva2luZyA9IHNob3VsZEludm9rZSh0aW1lKTtcblxuICAgIGxhc3RBcmdzID0gYXJndW1lbnRzO1xuICAgIGxhc3RUaGlzID0gdGhpcztcbiAgICBsYXN0Q2FsbFRpbWUgPSB0aW1lO1xuXG4gICAgaWYgKGlzSW52b2tpbmcpIHtcbiAgICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdFZGdlKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4aW5nKSB7XG4gICAgICAgIC8vIEhhbmRsZSBpbnZvY2F0aW9ucyBpbiBhIHRpZ2h0IGxvb3AuXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgICAgIHJldHVybiBpbnZva2VGdW5jKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgZGVib3VuY2VkLmZsdXNoID0gZmx1c2g7XG4gIHJldHVybiBkZWJvdW5jZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRocm90dGxlZCBmdW5jdGlvbiB0aGF0IG9ubHkgaW52b2tlcyBgZnVuY2AgYXQgbW9zdCBvbmNlIHBlclxuICogZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gVGhlIHRocm90dGxlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGBcbiAqIG1ldGhvZCB0byBjYW5jZWwgZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG9cbiAqIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYFxuICogc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YFxuICogdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZVxuICogdGhyb3R0bGVkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gcmV0dXJuIHRoZVxuICogcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLnRocm90dGxlYCBhbmQgYF8uZGVib3VuY2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gdGhyb3R0bGUuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgaW52b2NhdGlvbnMgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgdGhyb3R0bGVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBleGNlc3NpdmVseSB1cGRhdGluZyB0aGUgcG9zaXRpb24gd2hpbGUgc2Nyb2xsaW5nLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Njcm9sbCcsIF8udGhyb3R0bGUodXBkYXRlUG9zaXRpb24sIDEwMCkpO1xuICpcbiAqIC8vIEludm9rZSBgcmVuZXdUb2tlbmAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGJ1dCBub3QgbW9yZSB0aGFuIG9uY2UgZXZlcnkgNSBtaW51dGVzLlxuICogdmFyIHRocm90dGxlZCA9IF8udGhyb3R0bGUocmVuZXdUb2tlbiwgMzAwMDAwLCB7ICd0cmFpbGluZyc6IGZhbHNlIH0pO1xuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIHRocm90dGxlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyB0aHJvdHRsZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRocm90dGxlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gJ2xlYWRpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMubGVhZGluZyA6IGxlYWRpbmc7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuICByZXR1cm4gZGVib3VuY2UoZnVuYywgd2FpdCwge1xuICAgICdsZWFkaW5nJzogbGVhZGluZyxcbiAgICAnbWF4V2FpdCc6IHdhaXQsXG4gICAgJ3RyYWlsaW5nJzogdHJhaWxpbmdcbiAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvTnVtYmVyKDMuMik7XG4gKiAvLyA9PiAzLjJcbiAqXG4gKiBfLnRvTnVtYmVyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gNWUtMzI0XG4gKlxuICogXy50b051bWJlcihJbmZpbml0eSk7XG4gKiAvLyA9PiBJbmZpbml0eVxuICpcbiAqIF8udG9OdW1iZXIoJzMuMicpO1xuICogLy8gPT4gMy4yXG4gKi9cbmZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBOQU47XG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHZhciBvdGhlciA9IHR5cGVvZiB2YWx1ZS52YWx1ZU9mID09ICdmdW5jdGlvbicgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbiAgICB2YWx1ZSA9IGlzT2JqZWN0KG90aGVyKSA/IChvdGhlciArICcnKSA6IG90aGVyO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IDAgPyB2YWx1ZSA6ICt2YWx1ZTtcbiAgfVxuICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVUcmltLCAnJyk7XG4gIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gIHJldHVybiAoaXNCaW5hcnkgfHwgcmVJc09jdGFsLnRlc3QodmFsdWUpKVxuICAgID8gZnJlZVBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCBpc0JpbmFyeSA/IDIgOiA4KVxuICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIiwidmFyIHdpbGRjYXJkID0gcmVxdWlyZSgnd2lsZGNhcmQnKTtcbnZhciByZU1pbWVQYXJ0U3BsaXQgPSAvW1xcL1xcK1xcLl0vO1xuXG4vKipcbiAgIyBtaW1lLW1hdGNoXG5cbiAgQSBzaW1wbGUgZnVuY3Rpb24gdG8gY2hlY2tlciB3aGV0aGVyIGEgdGFyZ2V0IG1pbWUgdHlwZSBtYXRjaGVzIGEgbWltZS10eXBlXG4gIHBhdHRlcm4gKGUuZy4gaW1hZ2UvanBlZyBtYXRjaGVzIGltYWdlL2pwZWcgT1IgaW1hZ2UvKikuXG5cbiAgIyMgRXhhbXBsZSBVc2FnZVxuXG4gIDw8PCBleGFtcGxlLmpzXG5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHBhdHRlcm4pIHtcbiAgZnVuY3Rpb24gdGVzdChwYXR0ZXJuKSB7XG4gICAgdmFyIHJlc3VsdCA9IHdpbGRjYXJkKHBhdHRlcm4sIHRhcmdldCwgcmVNaW1lUGFydFNwbGl0KTtcblxuICAgIC8vIGVuc3VyZSB0aGF0IHdlIGhhdmUgYSB2YWxpZCBtaW1lIHR5cGUgKHNob3VsZCBoYXZlIHR3byBwYXJ0cylcbiAgICByZXR1cm4gcmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPj0gMjtcbiAgfVxuXG4gIHJldHVybiBwYXR0ZXJuID8gdGVzdChwYXR0ZXJuLnNwbGl0KCc7JylbMF0pIDogdGVzdDtcbn07XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAgIyB3aWxkY2FyZFxuXG4gIFZlcnkgc2ltcGxlIHdpbGRjYXJkIG1hdGNoaW5nLCB3aGljaCBpcyBkZXNpZ25lZCB0byBwcm92aWRlIHRoZSBzYW1lXG4gIGZ1bmN0aW9uYWxpdHkgdGhhdCBpcyBmb3VuZCBpbiB0aGVcbiAgW2V2ZV0oaHR0cHM6Ly9naXRodWIuY29tL2Fkb2JlLXdlYnBsYXRmb3JtL2V2ZSkgZXZlbnRpbmcgbGlicmFyeS5cblxuICAjIyBVc2FnZVxuXG4gIEl0IHdvcmtzIHdpdGggc3RyaW5nczpcblxuICA8PDwgZXhhbXBsZXMvc3RyaW5ncy5qc1xuXG4gIEFycmF5czpcblxuICA8PDwgZXhhbXBsZXMvYXJyYXlzLmpzXG5cbiAgT2JqZWN0cyAobWF0Y2hpbmcgYWdhaW5zdCBrZXlzKTpcblxuICA8PDwgZXhhbXBsZXMvb2JqZWN0cy5qc1xuXG4gIFdoaWxlIHRoZSBsaWJyYXJ5IHdvcmtzIGluIE5vZGUsIGlmIHlvdSBhcmUgYXJlIGxvb2tpbmcgZm9yIGZpbGUtYmFzZWRcbiAgd2lsZGNhcmQgbWF0Y2hpbmcgdGhlbiB5b3Ugc2hvdWxkIGhhdmUgYSBsb29rIGF0OlxuXG4gIDxodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtZ2xvYj5cbioqL1xuXG5mdW5jdGlvbiBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yKSB7XG4gIHRoaXMudGV4dCA9IHRleHQgPSB0ZXh0IHx8ICcnO1xuICB0aGlzLmhhc1dpbGQgPSB+dGV4dC5pbmRleE9mKCcqJyk7XG4gIHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuICB0aGlzLnBhcnRzID0gdGV4dC5zcGxpdChzZXBhcmF0b3IpO1xufVxuXG5XaWxkY2FyZE1hdGNoZXIucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgdmFyIG1hdGNoZXMgPSB0cnVlO1xuICB2YXIgcGFydHMgPSB0aGlzLnBhcnRzO1xuICB2YXIgaWk7XG4gIHZhciBwYXJ0c0NvdW50ID0gcGFydHMubGVuZ3RoO1xuICB2YXIgdGVzdFBhcnRzO1xuXG4gIGlmICh0eXBlb2YgaW5wdXQgPT0gJ3N0cmluZycgfHwgaW5wdXQgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuaGFzV2lsZCAmJiB0aGlzLnRleHQgIT0gaW5wdXQpIHtcbiAgICAgIG1hdGNoZXMgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVzdFBhcnRzID0gKGlucHV0IHx8ICcnKS5zcGxpdCh0aGlzLnNlcGFyYXRvcik7XG4gICAgICBmb3IgKGlpID0gMDsgbWF0Y2hlcyAmJiBpaSA8IHBhcnRzQ291bnQ7IGlpKyspIHtcbiAgICAgICAgaWYgKHBhcnRzW2lpXSA9PT0gJyonKSAge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlpIDwgdGVzdFBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgIG1hdGNoZXMgPSBwYXJ0c1tpaV0gPT09IHRlc3RQYXJ0c1tpaV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG1hdGNoZXMsIHRoZW4gcmV0dXJuIHRoZSBjb21wb25lbnQgcGFydHNcbiAgICAgIG1hdGNoZXMgPSBtYXRjaGVzICYmIHRlc3RQYXJ0cztcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGlucHV0LnNwbGljZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgbWF0Y2hlcyA9IFtdO1xuXG4gICAgZm9yIChpaSA9IGlucHV0Lmxlbmd0aDsgaWktLTsgKSB7XG4gICAgICBpZiAodGhpcy5tYXRjaChpbnB1dFtpaV0pKSB7XG4gICAgICAgIG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGhdID0gaW5wdXRbaWldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT0gJ29iamVjdCcpIHtcbiAgICBtYXRjaGVzID0ge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gaW5wdXQpIHtcbiAgICAgIGlmICh0aGlzLm1hdGNoKGtleSkpIHtcbiAgICAgICAgbWF0Y2hlc1trZXldID0gaW5wdXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGV4dCwgdGVzdCwgc2VwYXJhdG9yKSB7XG4gIHZhciBtYXRjaGVyID0gbmV3IFdpbGRjYXJkTWF0Y2hlcih0ZXh0LCBzZXBhcmF0b3IgfHwgL1tcXC9cXC5dLyk7XG4gIGlmICh0eXBlb2YgdGVzdCAhPSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBtYXRjaGVyLm1hdGNoKHRlc3QpO1xuICB9XG5cbiAgcmV0dXJuIG1hdGNoZXI7XG59O1xuIiwiLyoqXG4qIENyZWF0ZSBhbiBldmVudCBlbWl0dGVyIHdpdGggbmFtZXNwYWNlc1xuKiBAbmFtZSBjcmVhdGVOYW1lc3BhY2VFbWl0dGVyXG4qIEBleGFtcGxlXG4qIHZhciBlbWl0dGVyID0gcmVxdWlyZSgnLi9pbmRleCcpKClcbipcbiogZW1pdHRlci5vbignKicsIGZ1bmN0aW9uICgpIHtcbiogICBjb25zb2xlLmxvZygnYWxsIGV2ZW50cyBlbWl0dGVkJywgdGhpcy5ldmVudClcbiogfSlcbipcbiogZW1pdHRlci5vbignZXhhbXBsZScsIGZ1bmN0aW9uICgpIHtcbiogICBjb25zb2xlLmxvZygnZXhhbXBsZSBldmVudCBlbWl0dGVkJylcbiogfSlcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZU5hbWVzcGFjZUVtaXR0ZXIgKCkge1xuICB2YXIgZW1pdHRlciA9IHt9XG4gIHZhciBfZm5zID0gZW1pdHRlci5fZm5zID0ge31cblxuICAvKipcbiAgKiBFbWl0IGFuIGV2ZW50LiBPcHRpb25hbGx5IG5hbWVzcGFjZSB0aGUgZXZlbnQuIEhhbmRsZXJzIGFyZSBmaXJlZCBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSB3ZXJlIGFkZGVkIHdpdGggZXhhY3QgbWF0Y2hlcyB0YWtpbmcgcHJlY2VkZW5jZS4gU2VwYXJhdGUgdGhlIG5hbWVzcGFjZSBhbmQgZXZlbnQgd2l0aCBhIGA6YFxuICAqIEBuYW1lIGVtaXRcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQg4oCTIHRoZSBuYW1lIG9mIHRoZSBldmVudCwgd2l0aCBvcHRpb25hbCBuYW1lc3BhY2VcbiAgKiBAcGFyYW0gey4uLip9IGRhdGEg4oCTIHVwIHRvIDYgYXJndW1lbnRzIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIuZW1pdCgnZXhhbXBsZScpXG4gICogZW1pdHRlci5lbWl0KCdkZW1vOnRlc3QnKVxuICAqIGVtaXR0ZXIuZW1pdCgnZGF0YScsIHsgZXhhbXBsZTogdHJ1ZX0sICdhIHN0cmluZycsIDEpXG4gICovXG4gIGVtaXR0ZXIuZW1pdCA9IGZ1bmN0aW9uIGVtaXQgKGV2ZW50LCBhcmcxLCBhcmcyLCBhcmczLCBhcmc0LCBhcmc1LCBhcmc2KSB7XG4gICAgdmFyIHRvRW1pdCA9IGdldExpc3RlbmVycyhldmVudClcblxuICAgIGlmICh0b0VtaXQubGVuZ3RoKSB7XG4gICAgICBlbWl0QWxsKGV2ZW50LCB0b0VtaXQsIFthcmcxLCBhcmcyLCBhcmczLCBhcmc0LCBhcmc1LCBhcmc2XSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBDcmVhdGUgZW4gZXZlbnQgbGlzdGVuZXIuXG4gICogQG5hbWUgb25cbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vbignZXhhbXBsZScsIGZ1bmN0aW9uICgpIHt9KVxuICAqIGVtaXR0ZXIub24oJ2RlbW8nLCBmdW5jdGlvbiAoKSB7fSlcbiAgKi9cbiAgZW1pdHRlci5vbiA9IGZ1bmN0aW9uIG9uIChldmVudCwgZm4pIHtcbiAgICBpZiAoIV9mbnNbZXZlbnRdKSB7XG4gICAgICBfZm5zW2V2ZW50XSA9IFtdXG4gICAgfVxuXG4gICAgX2Zuc1tldmVudF0ucHVzaChmbilcbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZSBlbiBldmVudCBsaXN0ZW5lciB0aGF0IGZpcmVzIG9uY2UuXG4gICogQG5hbWUgb25jZVxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9uY2UoJ2V4YW1wbGUnLCBmdW5jdGlvbiAoKSB7fSlcbiAgKiBlbWl0dGVyLm9uY2UoJ2RlbW8nLCBmdW5jdGlvbiAoKSB7fSlcbiAgKi9cbiAgZW1pdHRlci5vbmNlID0gZnVuY3Rpb24gb25jZSAoZXZlbnQsIGZuKSB7XG4gICAgZnVuY3Rpb24gb25lICgpIHtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIGVtaXR0ZXIub2ZmKGV2ZW50LCBvbmUpXG4gICAgfVxuICAgIHRoaXMub24oZXZlbnQsIG9uZSlcbiAgfVxuXG4gIC8qKlxuICAqIFN0b3AgbGlzdGVuaW5nIHRvIGFuIGV2ZW50LiBTdG9wIGFsbCBsaXN0ZW5lcnMgb24gYW4gZXZlbnQgYnkgb25seSBwYXNzaW5nIHRoZSBldmVudCBuYW1lLiBTdG9wIGEgc2luZ2xlIGxpc3RlbmVyIGJ5IHBhc3NpbmcgdGhhdCBldmVudCBoYW5kbGVyIGFzIGEgY2FsbGJhY2suXG4gICogWW91IG11c3QgYmUgZXhwbGljaXQgYWJvdXQgd2hhdCB3aWxsIGJlIHVuc3Vic2NyaWJlZDogYGVtaXR0ZXIub2ZmKCdkZW1vJylgIHdpbGwgdW5zdWJzY3JpYmUgYW4gYGVtaXR0ZXIub24oJ2RlbW8nKWAgbGlzdGVuZXIsXG4gICogYGVtaXR0ZXIub2ZmKCdkZW1vOmV4YW1wbGUnKWAgd2lsbCB1bnN1YnNjcmliZSBhbiBgZW1pdHRlci5vbignZGVtbzpleGFtcGxlJylgIGxpc3RlbmVyXG4gICogQG5hbWUgb2ZmXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXSDigJMgdGhlIHNwZWNpZmljIGhhbmRsZXJcbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIub2ZmKCdleGFtcGxlJylcbiAgKiBlbWl0dGVyLm9mZignZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9mZiA9IGZ1bmN0aW9uIG9mZiAoZXZlbnQsIGZuKSB7XG4gICAgdmFyIGtlZXAgPSBbXVxuXG4gICAgaWYgKGV2ZW50ICYmIGZuKSB7XG4gICAgICB2YXIgZm5zID0gdGhpcy5fZm5zW2V2ZW50XVxuICAgICAgdmFyIGkgPSAwXG4gICAgICB2YXIgbCA9IGZucy5sZW5ndGhcblxuICAgICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChmbnNbaV0gIT09IGZuKSB7XG4gICAgICAgICAga2VlcC5wdXNoKGZuc1tpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGtlZXAubGVuZ3RoID8gdGhpcy5fZm5zW2V2ZW50XSA9IGtlZXAgOiBkZWxldGUgdGhpcy5fZm5zW2V2ZW50XVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGlzdGVuZXJzIChlKSB7XG4gICAgdmFyIG91dCA9IF9mbnNbZV0gPyBfZm5zW2VdIDogW11cbiAgICB2YXIgaWR4ID0gZS5pbmRleE9mKCc6JylcbiAgICB2YXIgYXJncyA9IChpZHggPT09IC0xKSA/IFtlXSA6IFtlLnN1YnN0cmluZygwLCBpZHgpLCBlLnN1YnN0cmluZyhpZHggKyAxKV1cblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoX2ZucylcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbCA9IGtleXMubGVuZ3RoXG5cbiAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICBpZiAoa2V5ID09PSAnKicpIHtcbiAgICAgICAgb3V0ID0gb3V0LmNvbmNhdChfZm5zW2tleV0pXG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMiAmJiBhcmdzWzBdID09PSBrZXkpIHtcbiAgICAgICAgb3V0ID0gb3V0LmNvbmNhdChfZm5zW2tleV0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdEFsbCAoZSwgZm5zLCBhcmdzKSB7XG4gICAgdmFyIGkgPSAwXG4gICAgdmFyIGwgPSBmbnMubGVuZ3RoXG5cbiAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICghZm5zW2ldKSBicmVha1xuICAgICAgZm5zW2ldLmV2ZW50ID0gZVxuICAgICAgZm5zW2ldLmFwcGx5KGZuc1tpXSwgYXJncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZW1pdHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5hbm9yYWZcblxuLy8gT25seSBjYWxsIFJBRiB3aGVuIG5lZWRlZFxuLy8gKGZuLCBmbj8pIC0+IGZuXG5mdW5jdGlvbiBuYW5vcmFmIChyZW5kZXIsIHJhZikge1xuICBhc3NlcnQuZXF1YWwodHlwZW9mIHJlbmRlciwgJ2Z1bmN0aW9uJywgJ25hbm9yYWY6IHJlbmRlciBzaG91bGQgYmUgYSBmdW5jdGlvbicpXG4gIGFzc2VydC5vayh0eXBlb2YgcmFmID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiByYWYgPT09ICd1bmRlZmluZWQnLCAnbmFub3JhZjogcmFmIHNob3VsZCBiZSBhIGZ1bmN0aW9uIG9yIHVuZGVmaW5lZCcpXG5cbiAgaWYgKCFyYWYpIHJhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgdmFyIHJlZHJhd1NjaGVkdWxlZCA9IGZhbHNlXG4gIHZhciBhcmdzID0gbnVsbFxuXG4gIHJldHVybiBmdW5jdGlvbiBmcmFtZSAoKSB7XG4gICAgaWYgKGFyZ3MgPT09IG51bGwgJiYgIXJlZHJhd1NjaGVkdWxlZCkge1xuICAgICAgcmVkcmF3U2NoZWR1bGVkID0gdHJ1ZVxuXG4gICAgICByYWYoZnVuY3Rpb24gcmVkcmF3ICgpIHtcbiAgICAgICAgcmVkcmF3U2NoZWR1bGVkID0gZmFsc2VcblxuICAgICAgICB2YXIgbGVuZ3RoID0gYXJncy5sZW5ndGhcbiAgICAgICAgdmFyIF9hcmdzID0gbmV3IEFycmF5KGxlbmd0aClcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykgX2FyZ3NbaV0gPSBhcmdzW2ldXG5cbiAgICAgICAgcmVuZGVyLmFwcGx5KHJlbmRlciwgX2FyZ3MpXG4gICAgICAgIGFyZ3MgPSBudWxsXG4gICAgICB9KVxuICAgIH1cblxuICAgIGFyZ3MgPSBhcmd1bWVudHNcbiAgfVxufVxuIiwiLyogZ2xvYmFsIE11dGF0aW9uT2JzZXJ2ZXIgKi9cbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpXG52YXIgd2luZG93ID0gcmVxdWlyZSgnZ2xvYmFsL3dpbmRvdycpXG52YXIgd2F0Y2ggPSBPYmplY3QuY3JlYXRlKG51bGwpXG52YXIgS0VZX0lEID0gJ29ubG9hZGlkJyArIChuZXcgRGF0ZSgpICUgOWU2KS50b1N0cmluZygzNilcbnZhciBLRVlfQVRUUiA9ICdkYXRhLScgKyBLRVlfSURcbnZhciBJTkRFWCA9IDBcblxuaWYgKHdpbmRvdyAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcikge1xuICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHdhdGNoKS5sZW5ndGggPCAxKSByZXR1cm5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKG11dGF0aW9uc1tpXS5hdHRyaWJ1dGVOYW1lID09PSBLRVlfQVRUUikge1xuICAgICAgICBlYWNoQXR0cihtdXRhdGlvbnNbaV0sIHR1cm5vbiwgdHVybm9mZilcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGVhY2hNdXRhdGlvbihtdXRhdGlvbnNbaV0ucmVtb3ZlZE5vZGVzLCB0dXJub2ZmKVxuICAgICAgZWFjaE11dGF0aW9uKG11dGF0aW9uc1tpXS5hZGRlZE5vZGVzLCB0dXJub24pXG4gICAgfVxuICB9KVxuICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlLFxuICAgIGF0dHJpYnV0ZUZpbHRlcjogW0tFWV9BVFRSXVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9ubG9hZCAoZWwsIG9uLCBvZmYsIGNhbGxlcikge1xuICBvbiA9IG9uIHx8IGZ1bmN0aW9uICgpIHt9XG4gIG9mZiA9IG9mZiB8fCBmdW5jdGlvbiAoKSB7fVxuICBlbC5zZXRBdHRyaWJ1dGUoS0VZX0FUVFIsICdvJyArIElOREVYKVxuICB3YXRjaFsnbycgKyBJTkRFWF0gPSBbb24sIG9mZiwgMCwgY2FsbGVyIHx8IG9ubG9hZC5jYWxsZXJdXG4gIElOREVYICs9IDFcbiAgcmV0dXJuIGVsXG59XG5cbmZ1bmN0aW9uIHR1cm5vbiAoaW5kZXgsIGVsKSB7XG4gIGlmICh3YXRjaFtpbmRleF1bMF0gJiYgd2F0Y2hbaW5kZXhdWzJdID09PSAwKSB7XG4gICAgd2F0Y2hbaW5kZXhdWzBdKGVsKVxuICAgIHdhdGNoW2luZGV4XVsyXSA9IDFcbiAgfVxufVxuXG5mdW5jdGlvbiB0dXJub2ZmIChpbmRleCwgZWwpIHtcbiAgaWYgKHdhdGNoW2luZGV4XVsxXSAmJiB3YXRjaFtpbmRleF1bMl0gPT09IDEpIHtcbiAgICB3YXRjaFtpbmRleF1bMV0oZWwpXG4gICAgd2F0Y2hbaW5kZXhdWzJdID0gMFxuICB9XG59XG5cbmZ1bmN0aW9uIGVhY2hBdHRyIChtdXRhdGlvbiwgb24sIG9mZikge1xuICB2YXIgbmV3VmFsdWUgPSBtdXRhdGlvbi50YXJnZXQuZ2V0QXR0cmlidXRlKEtFWV9BVFRSKVxuICBpZiAoc2FtZU9yaWdpbihtdXRhdGlvbi5vbGRWYWx1ZSwgbmV3VmFsdWUpKSB7XG4gICAgd2F0Y2hbbmV3VmFsdWVdID0gd2F0Y2hbbXV0YXRpb24ub2xkVmFsdWVdXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKHdhdGNoW211dGF0aW9uLm9sZFZhbHVlXSkge1xuICAgIG9mZihtdXRhdGlvbi5vbGRWYWx1ZSwgbXV0YXRpb24udGFyZ2V0KVxuICB9XG4gIGlmICh3YXRjaFtuZXdWYWx1ZV0pIHtcbiAgICBvbihuZXdWYWx1ZSwgbXV0YXRpb24udGFyZ2V0KVxuICB9XG59XG5cbmZ1bmN0aW9uIHNhbWVPcmlnaW4gKG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICBpZiAoIW9sZFZhbHVlIHx8ICFuZXdWYWx1ZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB3YXRjaFtvbGRWYWx1ZV1bM10gPT09IHdhdGNoW25ld1ZhbHVlXVszXVxufVxuXG5mdW5jdGlvbiBlYWNoTXV0YXRpb24gKG5vZGVzLCBmbikge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHdhdGNoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG5vZGVzW2ldICYmIG5vZGVzW2ldLmdldEF0dHJpYnV0ZSAmJiBub2Rlc1tpXS5nZXRBdHRyaWJ1dGUoS0VZX0FUVFIpKSB7XG4gICAgICB2YXIgb25sb2FkaWQgPSBub2Rlc1tpXS5nZXRBdHRyaWJ1dGUoS0VZX0FUVFIpXG4gICAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgaWYgKG9ubG9hZGlkID09PSBrKSB7XG4gICAgICAgICAgZm4oaywgbm9kZXNbaV0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChub2Rlc1tpXS5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGVhY2hNdXRhdGlvbihub2Rlc1tpXS5jaGlsZE5vZGVzLCBmbilcbiAgICB9XG4gIH1cbn1cbiIsInZhciB0b3BMZXZlbCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHt9XG52YXIgbWluRG9jID0gcmVxdWlyZSgnbWluLWRvY3VtZW50Jyk7XG5cbnZhciBkb2NjeTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBkb2NjeSA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9jY3k7XG4iLCJ2YXIgd2luO1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIHdpbiA9IHNlbGY7XG59IGVsc2Uge1xuICAgIHdpbiA9IHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbjtcbiIsIm1vZHVsZS5leHBvcnRzID0gcHJldHRpZXJCeXRlc1xuXG5mdW5jdGlvbiBwcmV0dGllckJ5dGVzIChudW0pIHtcbiAgaWYgKHR5cGVvZiBudW0gIT09ICdudW1iZXInIHx8IGlzTmFOKG51bSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIG51bWJlciwgZ290ICcgKyB0eXBlb2YgbnVtKVxuICB9XG5cbiAgdmFyIG5lZyA9IG51bSA8IDBcbiAgdmFyIHVuaXRzID0gWydCJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ11cblxuICBpZiAobmVnKSB7XG4gICAgbnVtID0gLW51bVxuICB9XG5cbiAgaWYgKG51bSA8IDEpIHtcbiAgICByZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bSArICcgQidcbiAgfVxuXG4gIHZhciBleHBvbmVudCA9IE1hdGgubWluKE1hdGguZmxvb3IoTWF0aC5sb2cobnVtKSAvIE1hdGgubG9nKDEwMDApKSwgdW5pdHMubGVuZ3RoIC0gMSlcbiAgbnVtID0gTnVtYmVyKG51bSAvIE1hdGgucG93KDEwMDAsIGV4cG9uZW50KSlcbiAgdmFyIHVuaXQgPSB1bml0c1tleHBvbmVudF1cblxuICBpZiAobnVtID49IDEwIHx8IG51bSAlIDEgPT09IDApIHtcbiAgICAvLyBEbyBub3Qgc2hvdyBkZWNpbWFscyB3aGVuIHRoZSBudW1iZXIgaXMgdHdvLWRpZ2l0LCBvciBpZiB0aGUgbnVtYmVyIGhhcyBub1xuICAgIC8vIGRlY2ltYWwgY29tcG9uZW50LlxuICAgIHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtLnRvRml4ZWQoMCkgKyAnICcgKyB1bml0XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0udG9GaXhlZCgxKSArICcgJyArIHVuaXRcbiAgfVxufVxuIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlcikge1xuICAgIHZhciB2aWV3Q2xhc3NlcyA9IFtcbiAgICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDY0QXJyYXldJ1xuICAgIF1cblxuICAgIHZhciBpc0RhdGFWaWV3ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgICB9XG5cbiAgICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPSBBcnJheUJ1ZmZlci5pc1ZpZXcgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICB0aGlzLmFwcGVuZChoZWFkZXJbMF0sIGhlYWRlclsxXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgICB0aGlzLm1hcFtuYW1lXSA9IG9sZFZhbHVlID8gb2xkVmFsdWUrJywnK3ZhbHVlIDogdmFsdWVcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IHRoaXMubWFwW25hbWVdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm1hcCkge1xuICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyQXNUZXh0KGJ1Zikge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIHZhciBjaGFycyA9IG5ldyBBcnJheSh2aWV3Lmxlbmd0aClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gICAgfVxuICAgIHJldHVybiBjaGFycy5qb2luKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyQ2xvbmUoYnVmKSB7XG4gICAgaWYgKGJ1Zi5zbGljZSkge1xuICAgICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zi5ieXRlTGVuZ3RoKVxuICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICAgIHJldHVybiB2aWV3LmJ1ZmZlclxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIHN1cHBvcnQuYmxvYiAmJiBpc0RhdGFWaWV3KGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkuYnVmZmVyKVxuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIChBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSB8fCBpc0FycmF5QnVmZmVyVmlldyhib2R5KSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IFN0cmluZyhpbnB1dClcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywgeyBib2R5OiB0aGlzLl9ib2R5SW5pdCB9KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKVxuICAgIHJhd0hlYWRlcnMuc3BsaXQoL1xccj9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gJ3N0YXR1cycgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzIDogMjAwXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJ1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsInZhciBiZWwgPSByZXF1aXJlKCdiZWwnKSAvLyB0dXJucyB0ZW1wbGF0ZSB0YWcgaW50byBET00gZWxlbWVudHNcbnZhciBtb3JwaGRvbSA9IHJlcXVpcmUoJ21vcnBoZG9tJykgLy8gZWZmaWNpZW50bHkgZGlmZnMgKyBtb3JwaHMgdHdvIERPTSBlbGVtZW50c1xudmFyIGRlZmF1bHRFdmVudHMgPSByZXF1aXJlKCcuL3VwZGF0ZS1ldmVudHMuanMnKSAvLyBkZWZhdWx0IGV2ZW50cyB0byBiZSBjb3BpZWQgd2hlbiBkb20gZWxlbWVudHMgdXBkYXRlXG5cbm1vZHVsZS5leHBvcnRzID0gYmVsXG5cbi8vIFRPRE8gbW92ZSB0aGlzICsgZGVmYXVsdEV2ZW50cyB0byBhIG5ldyBtb2R1bGUgb25jZSB3ZSByZWNlaXZlIG1vcmUgZmVlZGJhY2tcbm1vZHVsZS5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uIChmcm9tTm9kZSwgdG9Ob2RlLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9XG4gIGlmIChvcHRzLmV2ZW50cyAhPT0gZmFsc2UpIHtcbiAgICBpZiAoIW9wdHMub25CZWZvcmVFbFVwZGF0ZWQpIG9wdHMub25CZWZvcmVFbFVwZGF0ZWQgPSBjb3BpZXJcbiAgfVxuXG4gIHJldHVybiBtb3JwaGRvbShmcm9tTm9kZSwgdG9Ob2RlLCBvcHRzKVxuXG4gIC8vIG1vcnBoZG9tIG9ubHkgY29waWVzIGF0dHJpYnV0ZXMuIHdlIGRlY2lkZWQgd2UgYWxzbyB3YW50ZWQgdG8gY29weSBldmVudHNcbiAgLy8gdGhhdCBjYW4gYmUgc2V0IHZpYSBhdHRyaWJ1dGVzXG4gIGZ1bmN0aW9uIGNvcGllciAoZiwgdCkge1xuICAgIC8vIGNvcHkgZXZlbnRzOlxuICAgIHZhciBldmVudHMgPSBvcHRzLmV2ZW50cyB8fCBkZWZhdWx0RXZlbnRzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBldiA9IGV2ZW50c1tpXVxuICAgICAgaWYgKHRbZXZdKSB7IC8vIGlmIG5ldyBlbGVtZW50IGhhcyBhIHdoaXRlbGlzdGVkIGF0dHJpYnV0ZVxuICAgICAgICBmW2V2XSA9IHRbZXZdIC8vIHVwZGF0ZSBleGlzdGluZyBlbGVtZW50XG4gICAgICB9IGVsc2UgaWYgKGZbZXZdKSB7IC8vIGlmIGV4aXN0aW5nIGVsZW1lbnQgaGFzIGl0IGFuZCBuZXcgb25lIGRvZXNudFxuICAgICAgICBmW2V2XSA9IHVuZGVmaW5lZCAvLyByZW1vdmUgaXQgZnJvbSBleGlzdGluZyBlbGVtZW50XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBvbGRWYWx1ZSA9IGYudmFsdWVcbiAgICB2YXIgbmV3VmFsdWUgPSB0LnZhbHVlXG4gICAgLy8gY29weSB2YWx1ZXMgZm9yIGZvcm0gZWxlbWVudHNcbiAgICBpZiAoKGYubm9kZU5hbWUgPT09ICdJTlBVVCcgJiYgZi50eXBlICE9PSAnZmlsZScpIHx8IGYubm9kZU5hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICBpZiAoIW5ld1ZhbHVlKSB7XG4gICAgICAgIHQudmFsdWUgPSBmLnZhbHVlXG4gICAgICB9IGVsc2UgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xuICAgICAgICBmLnZhbHVlID0gbmV3VmFsdWVcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGYubm9kZU5hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgIGlmICh0LmdldEF0dHJpYnV0ZSgndmFsdWUnKSA9PT0gbnVsbCkgZi52YWx1ZSA9IHQudmFsdWVcbiAgICB9XG4gIH1cbn1cbiIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpXG52YXIgaHlwZXJ4ID0gcmVxdWlyZSgnaHlwZXJ4JylcbnZhciBvbmxvYWQgPSByZXF1aXJlKCdvbi1sb2FkJylcblxudmFyIFNWR05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xudmFyIFhMSU5LTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaydcblxudmFyIEJPT0xfUFJPUFMgPSB7XG4gIGF1dG9mb2N1czogMSxcbiAgY2hlY2tlZDogMSxcbiAgZGVmYXVsdGNoZWNrZWQ6IDEsXG4gIGRpc2FibGVkOiAxLFxuICBmb3Jtbm92YWxpZGF0ZTogMSxcbiAgaW5kZXRlcm1pbmF0ZTogMSxcbiAgcmVhZG9ubHk6IDEsXG4gIHJlcXVpcmVkOiAxLFxuICBzZWxlY3RlZDogMSxcbiAgd2lsbHZhbGlkYXRlOiAxXG59XG52YXIgQ09NTUVOVF9UQUcgPSAnIS0tJ1xudmFyIFNWR19UQUdTID0gW1xuICAnc3ZnJyxcbiAgJ2FsdEdseXBoJywgJ2FsdEdseXBoRGVmJywgJ2FsdEdseXBoSXRlbScsICdhbmltYXRlJywgJ2FuaW1hdGVDb2xvcicsXG4gICdhbmltYXRlTW90aW9uJywgJ2FuaW1hdGVUcmFuc2Zvcm0nLCAnY2lyY2xlJywgJ2NsaXBQYXRoJywgJ2NvbG9yLXByb2ZpbGUnLFxuICAnY3Vyc29yJywgJ2RlZnMnLCAnZGVzYycsICdlbGxpcHNlJywgJ2ZlQmxlbmQnLCAnZmVDb2xvck1hdHJpeCcsXG4gICdmZUNvbXBvbmVudFRyYW5zZmVyJywgJ2ZlQ29tcG9zaXRlJywgJ2ZlQ29udm9sdmVNYXRyaXgnLCAnZmVEaWZmdXNlTGlnaHRpbmcnLFxuICAnZmVEaXNwbGFjZW1lbnRNYXAnLCAnZmVEaXN0YW50TGlnaHQnLCAnZmVGbG9vZCcsICdmZUZ1bmNBJywgJ2ZlRnVuY0InLFxuICAnZmVGdW5jRycsICdmZUZ1bmNSJywgJ2ZlR2F1c3NpYW5CbHVyJywgJ2ZlSW1hZ2UnLCAnZmVNZXJnZScsICdmZU1lcmdlTm9kZScsXG4gICdmZU1vcnBob2xvZ3knLCAnZmVPZmZzZXQnLCAnZmVQb2ludExpZ2h0JywgJ2ZlU3BlY3VsYXJMaWdodGluZycsXG4gICdmZVNwb3RMaWdodCcsICdmZVRpbGUnLCAnZmVUdXJidWxlbmNlJywgJ2ZpbHRlcicsICdmb250JywgJ2ZvbnQtZmFjZScsXG4gICdmb250LWZhY2UtZm9ybWF0JywgJ2ZvbnQtZmFjZS1uYW1lJywgJ2ZvbnQtZmFjZS1zcmMnLCAnZm9udC1mYWNlLXVyaScsXG4gICdmb3JlaWduT2JqZWN0JywgJ2cnLCAnZ2x5cGgnLCAnZ2x5cGhSZWYnLCAnaGtlcm4nLCAnaW1hZ2UnLCAnbGluZScsXG4gICdsaW5lYXJHcmFkaWVudCcsICdtYXJrZXInLCAnbWFzaycsICdtZXRhZGF0YScsICdtaXNzaW5nLWdseXBoJywgJ21wYXRoJyxcbiAgJ3BhdGgnLCAncGF0dGVybicsICdwb2x5Z29uJywgJ3BvbHlsaW5lJywgJ3JhZGlhbEdyYWRpZW50JywgJ3JlY3QnLFxuICAnc2V0JywgJ3N0b3AnLCAnc3dpdGNoJywgJ3N5bWJvbCcsICd0ZXh0JywgJ3RleHRQYXRoJywgJ3RpdGxlJywgJ3RyZWYnLFxuICAndHNwYW4nLCAndXNlJywgJ3ZpZXcnLCAndmtlcm4nXG5dXG5cbmZ1bmN0aW9uIGJlbENyZWF0ZUVsZW1lbnQgKHRhZywgcHJvcHMsIGNoaWxkcmVuKSB7XG4gIHZhciBlbFxuXG4gIC8vIElmIGFuIHN2ZyB0YWcsIGl0IG5lZWRzIGEgbmFtZXNwYWNlXG4gIGlmIChTVkdfVEFHUy5pbmRleE9mKHRhZykgIT09IC0xKSB7XG4gICAgcHJvcHMubmFtZXNwYWNlID0gU1ZHTlNcbiAgfVxuXG4gIC8vIElmIHdlIGFyZSB1c2luZyBhIG5hbWVzcGFjZVxuICB2YXIgbnMgPSBmYWxzZVxuICBpZiAocHJvcHMubmFtZXNwYWNlKSB7XG4gICAgbnMgPSBwcm9wcy5uYW1lc3BhY2VcbiAgICBkZWxldGUgcHJvcHMubmFtZXNwYWNlXG4gIH1cblxuICAvLyBDcmVhdGUgdGhlIGVsZW1lbnRcbiAgaWYgKG5zKSB7XG4gICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIHRhZylcbiAgfSBlbHNlIGlmICh0YWcgPT09IENPTU1FTlRfVEFHKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQocHJvcHMuY29tbWVudClcbiAgfSBlbHNlIHtcbiAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKVxuICB9XG5cbiAgLy8gSWYgYWRkaW5nIG9ubG9hZCBldmVudHNcbiAgaWYgKHByb3BzLm9ubG9hZCB8fCBwcm9wcy5vbnVubG9hZCkge1xuICAgIHZhciBsb2FkID0gcHJvcHMub25sb2FkIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgdmFyIHVubG9hZCA9IHByb3BzLm9udW5sb2FkIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgb25sb2FkKGVsLCBmdW5jdGlvbiBiZWxPbmxvYWQgKCkge1xuICAgICAgbG9hZChlbClcbiAgICB9LCBmdW5jdGlvbiBiZWxPbnVubG9hZCAoKSB7XG4gICAgICB1bmxvYWQoZWwpXG4gICAgfSxcbiAgICAvLyBXZSBoYXZlIHRvIHVzZSBub24tc3RhbmRhcmQgYGNhbGxlcmAgdG8gZmluZCB3aG8gaW52b2tlcyBgYmVsQ3JlYXRlRWxlbWVudGBcbiAgICBiZWxDcmVhdGVFbGVtZW50LmNhbGxlci5jYWxsZXIuY2FsbGVyKVxuICAgIGRlbGV0ZSBwcm9wcy5vbmxvYWRcbiAgICBkZWxldGUgcHJvcHMub251bmxvYWRcbiAgfVxuXG4gIC8vIENyZWF0ZSB0aGUgcHJvcGVydGllc1xuICBmb3IgKHZhciBwIGluIHByb3BzKSB7XG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICB2YXIga2V5ID0gcC50b0xvd2VyQ2FzZSgpXG4gICAgICB2YXIgdmFsID0gcHJvcHNbcF1cbiAgICAgIC8vIE5vcm1hbGl6ZSBjbGFzc05hbWVcbiAgICAgIGlmIChrZXkgPT09ICdjbGFzc25hbWUnKSB7XG4gICAgICAgIGtleSA9ICdjbGFzcydcbiAgICAgICAgcCA9ICdjbGFzcydcbiAgICAgIH1cbiAgICAgIC8vIFRoZSBmb3IgYXR0cmlidXRlIGdldHMgdHJhbnNmb3JtZWQgdG8gaHRtbEZvciwgYnV0IHdlIGp1c3Qgc2V0IGFzIGZvclxuICAgICAgaWYgKHAgPT09ICdodG1sRm9yJykge1xuICAgICAgICBwID0gJ2ZvcidcbiAgICAgIH1cbiAgICAgIC8vIElmIGEgcHJvcGVydHkgaXMgYm9vbGVhbiwgc2V0IGl0c2VsZiB0byB0aGUga2V5XG4gICAgICBpZiAoQk9PTF9QUk9QU1trZXldKSB7XG4gICAgICAgIGlmICh2YWwgPT09ICd0cnVlJykgdmFsID0ga2V5XG4gICAgICAgIGVsc2UgaWYgKHZhbCA9PT0gJ2ZhbHNlJykgY29udGludWVcbiAgICAgIH1cbiAgICAgIC8vIElmIGEgcHJvcGVydHkgcHJlZmVycyBiZWluZyBzZXQgZGlyZWN0bHkgdnMgc2V0QXR0cmlidXRlXG4gICAgICBpZiAoa2V5LnNsaWNlKDAsIDIpID09PSAnb24nKSB7XG4gICAgICAgIGVsW3BdID0gdmFsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICBpZiAocCA9PT0gJ3hsaW5rOmhyZWYnKSB7XG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhYTElOS05TLCBwLCB2YWwpXG4gICAgICAgICAgfSBlbHNlIGlmICgvXnhtbG5zKCR8OikvaS50ZXN0KHApKSB7XG4gICAgICAgICAgICAvLyBza2lwIHhtbG5zIGRlZmluaXRpb25zXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKG51bGwsIHAsIHZhbClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwuc2V0QXR0cmlidXRlKHAsIHZhbClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGVuZENoaWxkIChjaGlsZHMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY2hpbGRzKSkgcmV0dXJuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBub2RlID0gY2hpbGRzW2ldXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlKSkge1xuICAgICAgICBhcHBlbmRDaGlsZChub2RlKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG5vZGUgPT09ICdudW1iZXInIHx8XG4gICAgICAgIHR5cGVvZiBub2RlID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgdHlwZW9mIG5vZGUgPT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgbm9kZSBpbnN0YW5jZW9mIERhdGUgfHxcbiAgICAgICAgbm9kZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICBub2RlID0gbm9kZS50b1N0cmluZygpXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGVsLmxhc3RDaGlsZCAmJiBlbC5sYXN0Q2hpbGQubm9kZU5hbWUgPT09ICcjdGV4dCcpIHtcbiAgICAgICAgICBlbC5sYXN0Q2hpbGQubm9kZVZhbHVlICs9IG5vZGVcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuICAgICAgfVxuXG4gICAgICBpZiAobm9kZSAmJiBub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGUpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGFwcGVuZENoaWxkKGNoaWxkcmVuKVxuXG4gIHJldHVybiBlbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGh5cGVyeChiZWxDcmVhdGVFbGVtZW50LCB7Y29tbWVudHM6IHRydWV9KVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVFbGVtZW50ID0gYmVsQ3JlYXRlRWxlbWVudFxuIiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxudmFyIGRvY2N5O1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGRvY2N5ID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXTtcblxuICAgIGlmICghZG9jY3kpIHtcbiAgICAgICAgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddID0gbWluRG9jO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbiIsInZhciBhdHRyVG9Qcm9wID0gcmVxdWlyZSgnaHlwZXJzY3JpcHQtYXR0cmlidXRlLXRvLXByb3BlcnR5JylcblxudmFyIFZBUiA9IDAsIFRFWFQgPSAxLCBPUEVOID0gMiwgQ0xPU0UgPSAzLCBBVFRSID0gNFxudmFyIEFUVFJfS0VZID0gNSwgQVRUUl9LRVlfVyA9IDZcbnZhciBBVFRSX1ZBTFVFX1cgPSA3LCBBVFRSX1ZBTFVFID0gOFxudmFyIEFUVFJfVkFMVUVfU1EgPSA5LCBBVFRSX1ZBTFVFX0RRID0gMTBcbnZhciBBVFRSX0VRID0gMTEsIEFUVFJfQlJFQUsgPSAxMlxudmFyIENPTU1FTlQgPSAxM1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChoLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9XG4gIHZhciBjb25jYXQgPSBvcHRzLmNvbmNhdCB8fCBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBTdHJpbmcoYSkgKyBTdHJpbmcoYilcbiAgfVxuICBpZiAob3B0cy5hdHRyVG9Qcm9wICE9PSBmYWxzZSkge1xuICAgIGggPSBhdHRyVG9Qcm9wKGgpXG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKHN0cmluZ3MpIHtcbiAgICB2YXIgc3RhdGUgPSBURVhULCByZWcgPSAnJ1xuICAgIHZhciBhcmdsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgdmFyIHBhcnRzID0gW11cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGkgPCBhcmdsZW4gLSAxKSB7XG4gICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaSsxXVxuICAgICAgICB2YXIgcCA9IHBhcnNlKHN0cmluZ3NbaV0pXG4gICAgICAgIHZhciB4c3RhdGUgPSBzdGF0ZVxuICAgICAgICBpZiAoeHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRKSB4c3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFJfVkFMVUVfU1EpIHhzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XKSB4c3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFIpIHhzdGF0ZSA9IEFUVFJfS0VZXG4gICAgICAgIHAucHVzaChbIFZBUiwgeHN0YXRlLCBhcmcgXSlcbiAgICAgICAgcGFydHMucHVzaC5hcHBseShwYXJ0cywgcClcbiAgICAgIH0gZWxzZSBwYXJ0cy5wdXNoLmFwcGx5KHBhcnRzLCBwYXJzZShzdHJpbmdzW2ldKSlcbiAgICB9XG5cbiAgICB2YXIgdHJlZSA9IFtudWxsLHt9LFtdXVxuICAgIHZhciBzdGFjayA9IFtbdHJlZSwtMV1dXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1ciA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXVswXVxuICAgICAgdmFyIHAgPSBwYXJ0c1tpXSwgcyA9IHBbMF1cbiAgICAgIGlmIChzID09PSBPUEVOICYmIC9eXFwvLy50ZXN0KHBbMV0pKSB7XG4gICAgICAgIHZhciBpeCA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXVsxXVxuICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMSkge1xuICAgICAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAgICAgc3RhY2tbc3RhY2subGVuZ3RoLTFdWzBdWzJdW2l4XSA9IGgoXG4gICAgICAgICAgICBjdXJbMF0sIGN1clsxXSwgY3VyWzJdLmxlbmd0aCA/IGN1clsyXSA6IHVuZGVmaW5lZFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzID09PSBPUEVOKSB7XG4gICAgICAgIHZhciBjID0gW3BbMV0se30sW11dXG4gICAgICAgIGN1clsyXS5wdXNoKGMpXG4gICAgICAgIHN0YWNrLnB1c2goW2MsY3VyWzJdLmxlbmd0aC0xXSlcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9LRVkgfHwgKHMgPT09IFZBUiAmJiBwWzFdID09PSBBVFRSX0tFWSkpIHtcbiAgICAgICAgdmFyIGtleSA9ICcnXG4gICAgICAgIHZhciBjb3B5S2V5XG4gICAgICAgIGZvciAoOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBrZXkgPSBjb25jYXQoa2V5LCBwYXJ0c1tpXVsxXSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHBhcnRzW2ldWzBdID09PSBWQVIgJiYgcGFydHNbaV1bMV0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnRzW2ldWzJdID09PSAnb2JqZWN0JyAmJiAha2V5KSB7XG4gICAgICAgICAgICAgIGZvciAoY29weUtleSBpbiBwYXJ0c1tpXVsyXSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0c1tpXVsyXS5oYXNPd25Qcm9wZXJ0eShjb3B5S2V5KSAmJiAhY3VyWzFdW2NvcHlLZXldKSB7XG4gICAgICAgICAgICAgICAgICBjdXJbMV1bY29weUtleV0gPSBwYXJ0c1tpXVsyXVtjb3B5S2V5XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAga2V5ID0gY29uY2F0KGtleSwgcGFydHNbaV1bMl0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRzW2ldWzBdID09PSBBVFRSX0VRKSBpKytcbiAgICAgICAgdmFyIGogPSBpXG4gICAgICAgIGZvciAoOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfVkFMVUUgfHwgcGFydHNbaV1bMF0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBpZiAoIWN1clsxXVtrZXldKSBjdXJbMV1ba2V5XSA9IHN0cmZuKHBhcnRzW2ldWzFdKVxuICAgICAgICAgICAgZWxzZSBjdXJbMV1ba2V5XSA9IGNvbmNhdChjdXJbMV1ba2V5XSwgcGFydHNbaV1bMV0pXG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJ0c1tpXVswXSA9PT0gVkFSXG4gICAgICAgICAgJiYgKHBhcnRzW2ldWzFdID09PSBBVFRSX1ZBTFVFIHx8IHBhcnRzW2ldWzFdID09PSBBVFRSX0tFWSkpIHtcbiAgICAgICAgICAgIGlmICghY3VyWzFdW2tleV0pIGN1clsxXVtrZXldID0gc3RyZm4ocGFydHNbaV1bMl0pXG4gICAgICAgICAgICBlbHNlIGN1clsxXVtrZXldID0gY29uY2F0KGN1clsxXVtrZXldLCBwYXJ0c1tpXVsyXSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggJiYgIWN1clsxXVtrZXldICYmIGkgPT09IGpcbiAgICAgICAgICAgICYmIChwYXJ0c1tpXVswXSA9PT0gQ0xPU0UgfHwgcGFydHNbaV1bMF0gPT09IEFUVFJfQlJFQUspKSB7XG4gICAgICAgICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZnJhc3RydWN0dXJlLmh0bWwjYm9vbGVhbi1hdHRyaWJ1dGVzXG4gICAgICAgICAgICAgIC8vIGVtcHR5IHN0cmluZyBpcyBmYWxzeSwgbm90IHdlbGwgYmVoYXZlZCB2YWx1ZSBpbiBicm93c2VyXG4gICAgICAgICAgICAgIGN1clsxXVtrZXldID0ga2V5LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIGN1clsxXVtwWzFdXSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gVkFSICYmIHBbMV0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIGN1clsxXVtwWzJdXSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQ0xPU0UpIHtcbiAgICAgICAgaWYgKHNlbGZDbG9zaW5nKGN1clswXSkgJiYgc3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIGl4ID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdWzFdXG4gICAgICAgICAgc3RhY2sucG9wKClcbiAgICAgICAgICBzdGFja1tzdGFjay5sZW5ndGgtMV1bMF1bMl1baXhdID0gaChcbiAgICAgICAgICAgIGN1clswXSwgY3VyWzFdLCBjdXJbMl0ubGVuZ3RoID8gY3VyWzJdIDogdW5kZWZpbmVkXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IFZBUiAmJiBwWzFdID09PSBURVhUKSB7XG4gICAgICAgIGlmIChwWzJdID09PSB1bmRlZmluZWQgfHwgcFsyXSA9PT0gbnVsbCkgcFsyXSA9ICcnXG4gICAgICAgIGVsc2UgaWYgKCFwWzJdKSBwWzJdID0gY29uY2F0KCcnLCBwWzJdKVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwWzJdWzBdKSkge1xuICAgICAgICAgIGN1clsyXS5wdXNoLmFwcGx5KGN1clsyXSwgcFsyXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJbMl0ucHVzaChwWzJdKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IFRFWFQpIHtcbiAgICAgICAgY3VyWzJdLnB1c2gocFsxXSlcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9FUSB8fCBzID09PSBBVFRSX0JSRUFLKSB7XG4gICAgICAgIC8vIG5vLW9wXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaGFuZGxlZDogJyArIHMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRyZWVbMl0ubGVuZ3RoID4gMSAmJiAvXlxccyokLy50ZXN0KHRyZWVbMl1bMF0pKSB7XG4gICAgICB0cmVlWzJdLnNoaWZ0KClcbiAgICB9XG5cbiAgICBpZiAodHJlZVsyXS5sZW5ndGggPiAyXG4gICAgfHwgKHRyZWVbMl0ubGVuZ3RoID09PSAyICYmIC9cXFMvLnRlc3QodHJlZVsyXVsxXSkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdtdWx0aXBsZSByb290IGVsZW1lbnRzIG11c3QgYmUgd3JhcHBlZCBpbiBhbiBlbmNsb3NpbmcgdGFnJ1xuICAgICAgKVxuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0cmVlWzJdWzBdKSAmJiB0eXBlb2YgdHJlZVsyXVswXVswXSA9PT0gJ3N0cmluZydcbiAgICAmJiBBcnJheS5pc0FycmF5KHRyZWVbMl1bMF1bMl0pKSB7XG4gICAgICB0cmVlWzJdWzBdID0gaCh0cmVlWzJdWzBdWzBdLCB0cmVlWzJdWzBdWzFdLCB0cmVlWzJdWzBdWzJdKVxuICAgIH1cbiAgICByZXR1cm4gdHJlZVsyXVswXVxuXG4gICAgZnVuY3Rpb24gcGFyc2UgKHN0cikge1xuICAgICAgdmFyIHJlcyA9IFtdXG4gICAgICBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfVykgc3RhdGUgPSBBVFRSXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IHN0ci5jaGFyQXQoaSlcbiAgICAgICAgaWYgKHN0YXRlID09PSBURVhUICYmIGMgPT09ICc8Jykge1xuICAgICAgICAgIGlmIChyZWcubGVuZ3RoKSByZXMucHVzaChbVEVYVCwgcmVnXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gT1BFTlxuICAgICAgICB9IGVsc2UgaWYgKGMgPT09ICc+JyAmJiAhcXVvdChzdGF0ZSkgJiYgc3RhdGUgIT09IENPTU1FTlQpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IE9QRU4pIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtPUEVOLHJlZ10pXG4gICAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUUgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLnB1c2goW0NMT1NFXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gVEVYVFxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBDT01NRU5UICYmIC8tJC8udGVzdChyZWcpICYmIGMgPT09ICctJykge1xuICAgICAgICAgIGlmIChvcHRzLmNvbW1lbnRzKSB7XG4gICAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWcuc3Vic3RyKDAsIHJlZy5sZW5ndGggLSAxKV0sW0NMT1NFXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IFRFWFRcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gT1BFTiAmJiAvXiEtLSQvLnRlc3QocmVnKSkge1xuICAgICAgICAgIGlmIChvcHRzLmNvbW1lbnRzKSB7XG4gICAgICAgICAgICByZXMucHVzaChbT1BFTiwgcmVnXSxbQVRUUl9LRVksJ2NvbW1lbnQnXSxbQVRUUl9FUV0pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZyA9IGNcbiAgICAgICAgICBzdGF0ZSA9IENPTU1FTlRcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gVEVYVCB8fCBzdGF0ZSA9PT0gQ09NTUVOVCkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IE9QRU4gJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIHJlcy5wdXNoKFtPUEVOLCByZWddKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IE9QRU4pIHtcbiAgICAgICAgICByZWcgKz0gY1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSICYmIC9bXlxcc1wiJz0vXS8udGVzdChjKSkge1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9LRVlcbiAgICAgICAgICByZWcgPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFIgJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIGlmIChyZWcubGVuZ3RoKSByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9CUkVBS10pXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZICYmIC9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9LRVlfV1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSAmJiBjID09PSAnPScpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSxbQVRUUl9FUV0pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfV1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoKHN0YXRlID09PSBBVFRSX0tFWV9XIHx8IHN0YXRlID09PSBBVFRSKSAmJiBjID09PSAnPScpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9FUV0pXG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX1dcbiAgICAgICAgfSBlbHNlIGlmICgoc3RhdGUgPT09IEFUVFJfS0VZX1cgfHwgc3RhdGUgPT09IEFUVFIpICYmICEvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIGlmICgvW1xcdy1dLy50ZXN0KGMpKSB7XG4gICAgICAgICAgICByZWcgKz0gY1xuICAgICAgICAgICAgc3RhdGUgPSBBVFRSX0tFWVxuICAgICAgICAgIH0gZWxzZSBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XICYmIGMgPT09ICdcIicpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfRFFcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XICYmIGMgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX1NRXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfRFEgJiYgYyA9PT0gJ1wiJykge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10sW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfU1EgJiYgYyA9PT0gXCInXCIpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddLFtBVFRSX0JSRUFLXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cgJiYgIS9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgICBpLS1cbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSAmJiAvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSxbQVRUUl9CUkVBS10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUVxuICAgICAgICB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUSkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZSA9PT0gVEVYVCAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtURVhULHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfRFEgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdHJmbiAoeCkge1xuICAgIGlmICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHhcbiAgICBlbHNlIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycpIHJldHVybiB4XG4gICAgZWxzZSBpZiAoeCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcpIHJldHVybiB4XG4gICAgZWxzZSByZXR1cm4gY29uY2F0KCcnLCB4KVxuICB9XG59XG5cbmZ1bmN0aW9uIHF1b3QgKHN0YXRlKSB7XG4gIHJldHVybiBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUVxufVxuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuZnVuY3Rpb24gaGFzIChvYmosIGtleSkgeyByZXR1cm4gaGFzT3duLmNhbGwob2JqLCBrZXkpIH1cblxudmFyIGNsb3NlUkUgPSBSZWdFeHAoJ14oJyArIFtcbiAgJ2FyZWEnLCAnYmFzZScsICdiYXNlZm9udCcsICdiZ3NvdW5kJywgJ2JyJywgJ2NvbCcsICdjb21tYW5kJywgJ2VtYmVkJyxcbiAgJ2ZyYW1lJywgJ2hyJywgJ2ltZycsICdpbnB1dCcsICdpc2luZGV4JywgJ2tleWdlbicsICdsaW5rJywgJ21ldGEnLCAncGFyYW0nLFxuICAnc291cmNlJywgJ3RyYWNrJywgJ3dicicsICchLS0nLFxuICAvLyBTVkcgVEFHU1xuICAnYW5pbWF0ZScsICdhbmltYXRlVHJhbnNmb3JtJywgJ2NpcmNsZScsICdjdXJzb3InLCAnZGVzYycsICdlbGxpcHNlJyxcbiAgJ2ZlQmxlbmQnLCAnZmVDb2xvck1hdHJpeCcsICdmZUNvbXBvc2l0ZScsXG4gICdmZUNvbnZvbHZlTWF0cml4JywgJ2ZlRGlmZnVzZUxpZ2h0aW5nJywgJ2ZlRGlzcGxhY2VtZW50TWFwJyxcbiAgJ2ZlRGlzdGFudExpZ2h0JywgJ2ZlRmxvb2QnLCAnZmVGdW5jQScsICdmZUZ1bmNCJywgJ2ZlRnVuY0cnLCAnZmVGdW5jUicsXG4gICdmZUdhdXNzaWFuQmx1cicsICdmZUltYWdlJywgJ2ZlTWVyZ2VOb2RlJywgJ2ZlTW9ycGhvbG9neScsXG4gICdmZU9mZnNldCcsICdmZVBvaW50TGlnaHQnLCAnZmVTcGVjdWxhckxpZ2h0aW5nJywgJ2ZlU3BvdExpZ2h0JywgJ2ZlVGlsZScsXG4gICdmZVR1cmJ1bGVuY2UnLCAnZm9udC1mYWNlLWZvcm1hdCcsICdmb250LWZhY2UtbmFtZScsICdmb250LWZhY2UtdXJpJyxcbiAgJ2dseXBoJywgJ2dseXBoUmVmJywgJ2hrZXJuJywgJ2ltYWdlJywgJ2xpbmUnLCAnbWlzc2luZy1nbHlwaCcsICdtcGF0aCcsXG4gICdwYXRoJywgJ3BvbHlnb24nLCAncG9seWxpbmUnLCAncmVjdCcsICdzZXQnLCAnc3RvcCcsICd0cmVmJywgJ3VzZScsICd2aWV3JyxcbiAgJ3ZrZXJuJ1xuXS5qb2luKCd8JykgKyAnKSg/OltcXC4jXVthLXpBLVowLTlcXHUwMDdGLVxcdUZGRkZfOi1dKykqJCcpXG5mdW5jdGlvbiBzZWxmQ2xvc2luZyAodGFnKSB7IHJldHVybiBjbG9zZVJFLnRlc3QodGFnKSB9XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGF0dHJpYnV0ZVRvUHJvcGVydHlcblxudmFyIHRyYW5zZm9ybSA9IHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdmb3InOiAnaHRtbEZvcicsXG4gICdodHRwLWVxdWl2JzogJ2h0dHBFcXVpdidcbn1cblxuZnVuY3Rpb24gYXR0cmlidXRlVG9Qcm9wZXJ0eSAoaCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHRhZ05hbWUsIGF0dHJzLCBjaGlsZHJlbikge1xuICAgIGZvciAodmFyIGF0dHIgaW4gYXR0cnMpIHtcbiAgICAgIGlmIChhdHRyIGluIHRyYW5zZm9ybSkge1xuICAgICAgICBhdHRyc1t0cmFuc2Zvcm1bYXR0cl1dID0gYXR0cnNbYXR0cl1cbiAgICAgICAgZGVsZXRlIGF0dHJzW2F0dHJdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoKHRhZ05hbWUsIGF0dHJzLCBjaGlsZHJlbilcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmFuZ2U7IC8vIENyZWF0ZSBhIHJhbmdlIG9iamVjdCBmb3IgZWZmaWNlbnRseSByZW5kZXJpbmcgc3RyaW5ncyB0byBlbGVtZW50cy5cbnZhciBOU19YSFRNTCA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJztcblxudmFyIGRvYyA9IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBkb2N1bWVudDtcblxudmFyIHRlc3RFbCA9IGRvYyA/XG4gICAgZG9jLmJvZHkgfHwgZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpIDpcbiAgICB7fTtcblxuLy8gRml4ZXMgPGh0dHBzOi8vZ2l0aHViLmNvbS9wYXRyaWNrLXN0ZWVsZS1pZGVtL21vcnBoZG9tL2lzc3Vlcy8zMj5cbi8vIChJRTcrIHN1cHBvcnQpIDw9SUU3IGRvZXMgbm90IHN1cHBvcnQgZWwuaGFzQXR0cmlidXRlKG5hbWUpXG52YXIgYWN0dWFsSGFzQXR0cmlidXRlTlM7XG5cbmlmICh0ZXN0RWwuaGFzQXR0cmlidXRlTlMpIHtcbiAgICBhY3R1YWxIYXNBdHRyaWJ1dGVOUyA9IGZ1bmN0aW9uKGVsLCBuYW1lc3BhY2VVUkksIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGVsLmhhc0F0dHJpYnV0ZU5TKG5hbWVzcGFjZVVSSSwgbmFtZSk7XG4gICAgfTtcbn0gZWxzZSBpZiAodGVzdEVsLmhhc0F0dHJpYnV0ZSkge1xuICAgIGFjdHVhbEhhc0F0dHJpYnV0ZU5TID0gZnVuY3Rpb24oZWwsIG5hbWVzcGFjZVVSSSwgbmFtZSkge1xuICAgICAgICByZXR1cm4gZWwuaGFzQXR0cmlidXRlKG5hbWUpO1xuICAgIH07XG59IGVsc2Uge1xuICAgIGFjdHVhbEhhc0F0dHJpYnV0ZU5TID0gZnVuY3Rpb24oZWwsIG5hbWVzcGFjZVVSSSwgbmFtZSkge1xuICAgICAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlTm9kZShuYW1lc3BhY2VVUkksIG5hbWUpICE9IG51bGw7XG4gICAgfTtcbn1cblxudmFyIGhhc0F0dHJpYnV0ZU5TID0gYWN0dWFsSGFzQXR0cmlidXRlTlM7XG5cblxuZnVuY3Rpb24gdG9FbGVtZW50KHN0cikge1xuICAgIGlmICghcmFuZ2UgJiYgZG9jLmNyZWF0ZVJhbmdlKSB7XG4gICAgICAgIHJhbmdlID0gZG9jLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jLmJvZHkpO1xuICAgIH1cblxuICAgIHZhciBmcmFnbWVudDtcbiAgICBpZiAocmFuZ2UgJiYgcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KSB7XG4gICAgICAgIGZyYWdtZW50ID0gcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHN0cik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZnJhZ21lbnQgPSBkb2MuY3JlYXRlRWxlbWVudCgnYm9keScpO1xuICAgICAgICBmcmFnbWVudC5pbm5lckhUTUwgPSBzdHI7XG4gICAgfVxuICAgIHJldHVybiBmcmFnbWVudC5jaGlsZE5vZGVzWzBdO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0d28gbm9kZSdzIG5hbWVzIGFyZSB0aGUgc2FtZS5cbiAqXG4gKiBOT1RFOiBXZSBkb24ndCBib3RoZXIgY2hlY2tpbmcgYG5hbWVzcGFjZVVSSWAgYmVjYXVzZSB5b3Ugd2lsbCBuZXZlciBmaW5kIHR3byBIVE1MIGVsZW1lbnRzIHdpdGggdGhlIHNhbWVcbiAqICAgICAgIG5vZGVOYW1lIGFuZCBkaWZmZXJlbnQgbmFtZXNwYWNlIFVSSXMuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBhXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGIgVGhlIHRhcmdldCBlbGVtZW50XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBjb21wYXJlTm9kZU5hbWVzKGZyb21FbCwgdG9FbCkge1xuICAgIHZhciBmcm9tTm9kZU5hbWUgPSBmcm9tRWwubm9kZU5hbWU7XG4gICAgdmFyIHRvTm9kZU5hbWUgPSB0b0VsLm5vZGVOYW1lO1xuXG4gICAgaWYgKGZyb21Ob2RlTmFtZSA9PT0gdG9Ob2RlTmFtZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodG9FbC5hY3R1YWxpemUgJiZcbiAgICAgICAgZnJvbU5vZGVOYW1lLmNoYXJDb2RlQXQoMCkgPCA5MSAmJiAvKiBmcm9tIHRhZyBuYW1lIGlzIHVwcGVyIGNhc2UgKi9cbiAgICAgICAgdG9Ob2RlTmFtZS5jaGFyQ29kZUF0KDApID4gOTAgLyogdGFyZ2V0IHRhZyBuYW1lIGlzIGxvd2VyIGNhc2UgKi8pIHtcbiAgICAgICAgLy8gSWYgdGhlIHRhcmdldCBlbGVtZW50IGlzIGEgdmlydHVhbCBET00gbm9kZSB0aGVuIHdlIG1heSBuZWVkIHRvIG5vcm1hbGl6ZSB0aGUgdGFnIG5hbWVcbiAgICAgICAgLy8gYmVmb3JlIGNvbXBhcmluZy4gTm9ybWFsIEhUTUwgZWxlbWVudHMgdGhhdCBhcmUgaW4gdGhlIFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiXG4gICAgICAgIC8vIGFyZSBjb252ZXJ0ZWQgdG8gdXBwZXIgY2FzZVxuICAgICAgICByZXR1cm4gZnJvbU5vZGVOYW1lID09PSB0b05vZGVOYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gZWxlbWVudCwgb3B0aW9uYWxseSB3aXRoIGEga25vd24gbmFtZXNwYWNlIFVSSS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgZWxlbWVudCBuYW1lLCBlLmcuICdkaXYnIG9yICdzdmcnXG4gKiBAcGFyYW0ge3N0cmluZ30gW25hbWVzcGFjZVVSSV0gdGhlIGVsZW1lbnQncyBuYW1lc3BhY2UgVVJJLCBpLmUuIHRoZSB2YWx1ZSBvZlxuICogaXRzIGB4bWxuc2AgYXR0cmlidXRlIG9yIGl0cyBpbmZlcnJlZCBuYW1lc3BhY2UuXG4gKlxuICogQHJldHVybiB7RWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWUsIG5hbWVzcGFjZVVSSSkge1xuICAgIHJldHVybiAhbmFtZXNwYWNlVVJJIHx8IG5hbWVzcGFjZVVSSSA9PT0gTlNfWEhUTUwgP1xuICAgICAgICBkb2MuY3JlYXRlRWxlbWVudChuYW1lKSA6XG4gICAgICAgIGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBuYW1lKTtcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGhlIGNoaWxkcmVuIG9mIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyIERPTSBlbGVtZW50XG4gKi9cbmZ1bmN0aW9uIG1vdmVDaGlsZHJlbihmcm9tRWwsIHRvRWwpIHtcbiAgICB2YXIgY3VyQ2hpbGQgPSBmcm9tRWwuZmlyc3RDaGlsZDtcbiAgICB3aGlsZSAoY3VyQ2hpbGQpIHtcbiAgICAgICAgdmFyIG5leHRDaGlsZCA9IGN1ckNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICB0b0VsLmFwcGVuZENoaWxkKGN1ckNoaWxkKTtcbiAgICAgICAgY3VyQ2hpbGQgPSBuZXh0Q2hpbGQ7XG4gICAgfVxuICAgIHJldHVybiB0b0VsO1xufVxuXG5mdW5jdGlvbiBtb3JwaEF0dHJzKGZyb21Ob2RlLCB0b05vZGUpIHtcbiAgICB2YXIgYXR0cnMgPSB0b05vZGUuYXR0cmlidXRlcztcbiAgICB2YXIgaTtcbiAgICB2YXIgYXR0cjtcbiAgICB2YXIgYXR0ck5hbWU7XG4gICAgdmFyIGF0dHJOYW1lc3BhY2VVUkk7XG4gICAgdmFyIGF0dHJWYWx1ZTtcbiAgICB2YXIgZnJvbVZhbHVlO1xuXG4gICAgZm9yIChpID0gYXR0cnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgYXR0ciA9IGF0dHJzW2ldO1xuICAgICAgICBhdHRyTmFtZSA9IGF0dHIubmFtZTtcbiAgICAgICAgYXR0ck5hbWVzcGFjZVVSSSA9IGF0dHIubmFtZXNwYWNlVVJJO1xuICAgICAgICBhdHRyVmFsdWUgPSBhdHRyLnZhbHVlO1xuXG4gICAgICAgIGlmIChhdHRyTmFtZXNwYWNlVVJJKSB7XG4gICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubG9jYWxOYW1lIHx8IGF0dHJOYW1lO1xuICAgICAgICAgICAgZnJvbVZhbHVlID0gZnJvbU5vZGUuZ2V0QXR0cmlidXRlTlMoYXR0ck5hbWVzcGFjZVVSSSwgYXR0ck5hbWUpO1xuXG4gICAgICAgICAgICBpZiAoZnJvbVZhbHVlICE9PSBhdHRyVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBmcm9tTm9kZS5zZXRBdHRyaWJ1dGVOUyhhdHRyTmFtZXNwYWNlVVJJLCBhdHRyTmFtZSwgYXR0clZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyb21WYWx1ZSA9IGZyb21Ob2RlLmdldEF0dHJpYnV0ZShhdHRyTmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChmcm9tVmFsdWUgIT09IGF0dHJWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGZyb21Ob2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0clZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBhbnkgZXh0cmEgYXR0cmlidXRlcyBmb3VuZCBvbiB0aGUgb3JpZ2luYWwgRE9NIGVsZW1lbnQgdGhhdFxuICAgIC8vIHdlcmVuJ3QgZm91bmQgb24gdGhlIHRhcmdldCBlbGVtZW50LlxuICAgIGF0dHJzID0gZnJvbU5vZGUuYXR0cmlidXRlcztcblxuICAgIGZvciAoaSA9IGF0dHJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGF0dHIgPSBhdHRyc1tpXTtcbiAgICAgICAgaWYgKGF0dHIuc3BlY2lmaWVkICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgYXR0ck5hbWUgPSBhdHRyLm5hbWU7XG4gICAgICAgICAgICBhdHRyTmFtZXNwYWNlVVJJID0gYXR0ci5uYW1lc3BhY2VVUkk7XG5cbiAgICAgICAgICAgIGlmIChhdHRyTmFtZXNwYWNlVVJJKSB7XG4gICAgICAgICAgICAgICAgYXR0ck5hbWUgPSBhdHRyLmxvY2FsTmFtZSB8fCBhdHRyTmFtZTtcblxuICAgICAgICAgICAgICAgIGlmICghaGFzQXR0cmlidXRlTlModG9Ob2RlLCBhdHRyTmFtZXNwYWNlVVJJLCBhdHRyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbU5vZGUucmVtb3ZlQXR0cmlidXRlTlMoYXR0ck5hbWVzcGFjZVVSSSwgYXR0ck5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNBdHRyaWJ1dGVOUyh0b05vZGUsIG51bGwsIGF0dHJOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tTm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gc3luY0Jvb2xlYW5BdHRyUHJvcChmcm9tRWwsIHRvRWwsIG5hbWUpIHtcbiAgICBpZiAoZnJvbUVsW25hbWVdICE9PSB0b0VsW25hbWVdKSB7XG4gICAgICAgIGZyb21FbFtuYW1lXSA9IHRvRWxbbmFtZV07XG4gICAgICAgIGlmIChmcm9tRWxbbmFtZV0pIHtcbiAgICAgICAgICAgIGZyb21FbC5zZXRBdHRyaWJ1dGUobmFtZSwgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnJvbUVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lLCAnJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbnZhciBzcGVjaWFsRWxIYW5kbGVycyA9IHtcbiAgICAvKipcbiAgICAgKiBOZWVkZWQgZm9yIElFLiBBcHBhcmVudGx5IElFIGRvZXNuJ3QgdGhpbmsgdGhhdCBcInNlbGVjdGVkXCIgaXMgYW5cbiAgICAgKiBhdHRyaWJ1dGUgd2hlbiByZWFkaW5nIG92ZXIgdGhlIGF0dHJpYnV0ZXMgdXNpbmcgc2VsZWN0RWwuYXR0cmlidXRlc1xuICAgICAqL1xuICAgIE9QVElPTjogZnVuY3Rpb24oZnJvbUVsLCB0b0VsKSB7XG4gICAgICAgIHN5bmNCb29sZWFuQXR0clByb3AoZnJvbUVsLCB0b0VsLCAnc2VsZWN0ZWQnKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBcInZhbHVlXCIgYXR0cmlidXRlIGlzIHNwZWNpYWwgZm9yIHRoZSA8aW5wdXQ+IGVsZW1lbnQgc2luY2UgaXQgc2V0c1xuICAgICAqIHRoZSBpbml0aWFsIHZhbHVlLiBDaGFuZ2luZyB0aGUgXCJ2YWx1ZVwiIGF0dHJpYnV0ZSB3aXRob3V0IGNoYW5naW5nIHRoZVxuICAgICAqIFwidmFsdWVcIiBwcm9wZXJ0eSB3aWxsIGhhdmUgbm8gZWZmZWN0IHNpbmNlIGl0IGlzIG9ubHkgdXNlZCB0byB0aGUgc2V0IHRoZVxuICAgICAqIGluaXRpYWwgdmFsdWUuICBTaW1pbGFyIGZvciB0aGUgXCJjaGVja2VkXCIgYXR0cmlidXRlLCBhbmQgXCJkaXNhYmxlZFwiLlxuICAgICAqL1xuICAgIElOUFVUOiBmdW5jdGlvbihmcm9tRWwsIHRvRWwpIHtcbiAgICAgICAgc3luY0Jvb2xlYW5BdHRyUHJvcChmcm9tRWwsIHRvRWwsICdjaGVja2VkJyk7XG4gICAgICAgIHN5bmNCb29sZWFuQXR0clByb3AoZnJvbUVsLCB0b0VsLCAnZGlzYWJsZWQnKTtcblxuICAgICAgICBpZiAoZnJvbUVsLnZhbHVlICE9PSB0b0VsLnZhbHVlKSB7XG4gICAgICAgICAgICBmcm9tRWwudmFsdWUgPSB0b0VsLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYXNBdHRyaWJ1dGVOUyh0b0VsLCBudWxsLCAndmFsdWUnKSkge1xuICAgICAgICAgICAgZnJvbUVsLnJlbW92ZUF0dHJpYnV0ZSgndmFsdWUnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBURVhUQVJFQTogZnVuY3Rpb24oZnJvbUVsLCB0b0VsKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHRvRWwudmFsdWU7XG4gICAgICAgIGlmIChmcm9tRWwudmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICBmcm9tRWwudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaXJzdENoaWxkID0gZnJvbUVsLmZpcnN0Q2hpbGQ7XG4gICAgICAgIGlmIChmaXJzdENoaWxkKSB7XG4gICAgICAgICAgICAvLyBOZWVkZWQgZm9yIElFLiBBcHBhcmVudGx5IElFIHNldHMgdGhlIHBsYWNlaG9sZGVyIGFzIHRoZVxuICAgICAgICAgICAgLy8gbm9kZSB2YWx1ZSBhbmQgdmlzZSB2ZXJzYS4gVGhpcyBpZ25vcmVzIGFuIGVtcHR5IHVwZGF0ZS5cbiAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IGZpcnN0Q2hpbGQubm9kZVZhbHVlO1xuXG4gICAgICAgICAgICBpZiAob2xkVmFsdWUgPT0gbmV3VmFsdWUgfHwgKCFuZXdWYWx1ZSAmJiBvbGRWYWx1ZSA9PSBmcm9tRWwucGxhY2Vob2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaXJzdENoaWxkLm5vZGVWYWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBTRUxFQ1Q6IGZ1bmN0aW9uKGZyb21FbCwgdG9FbCkge1xuICAgICAgICBpZiAoIWhhc0F0dHJpYnV0ZU5TKHRvRWwsIG51bGwsICdtdWx0aXBsZScpKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgICAgdmFyIGN1ckNoaWxkID0gdG9FbC5maXJzdENoaWxkO1xuICAgICAgICAgICAgd2hpbGUoY3VyQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZU5hbWUgPSBjdXJDaGlsZC5ub2RlTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZU5hbWUgJiYgbm9kZU5hbWUudG9VcHBlckNhc2UoKSA9PT0gJ09QVElPTicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0F0dHJpYnV0ZU5TKGN1ckNoaWxkLCBudWxsLCAnc2VsZWN0ZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZyb21FbC5zZWxlY3RlZEluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbnZhciBFTEVNRU5UX05PREUgPSAxO1xudmFyIFRFWFRfTk9ERSA9IDM7XG52YXIgQ09NTUVOVF9OT0RFID0gODtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmZ1bmN0aW9uIGRlZmF1bHRHZXROb2RlS2V5KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5pZDtcbn1cblxuZnVuY3Rpb24gbW9ycGhkb21GYWN0b3J5KG1vcnBoQXR0cnMpIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiBtb3JwaGRvbShmcm9tTm9kZSwgdG9Ob2RlLCBvcHRpb25zKSB7XG4gICAgICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0b05vZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoZnJvbU5vZGUubm9kZU5hbWUgPT09ICcjZG9jdW1lbnQnIHx8IGZyb21Ob2RlLm5vZGVOYW1lID09PSAnSFRNTCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9Ob2RlSHRtbCA9IHRvTm9kZTtcbiAgICAgICAgICAgICAgICB0b05vZGUgPSBkb2MuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xuICAgICAgICAgICAgICAgIHRvTm9kZS5pbm5lckhUTUwgPSB0b05vZGVIdG1sO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b05vZGUgPSB0b0VsZW1lbnQodG9Ob2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBnZXROb2RlS2V5ID0gb3B0aW9ucy5nZXROb2RlS2V5IHx8IGRlZmF1bHRHZXROb2RlS2V5O1xuICAgICAgICB2YXIgb25CZWZvcmVOb2RlQWRkZWQgPSBvcHRpb25zLm9uQmVmb3JlTm9kZUFkZGVkIHx8IG5vb3A7XG4gICAgICAgIHZhciBvbk5vZGVBZGRlZCA9IG9wdGlvbnMub25Ob2RlQWRkZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIG9uQmVmb3JlRWxVcGRhdGVkID0gb3B0aW9ucy5vbkJlZm9yZUVsVXBkYXRlZCB8fCBub29wO1xuICAgICAgICB2YXIgb25FbFVwZGF0ZWQgPSBvcHRpb25zLm9uRWxVcGRhdGVkIHx8IG5vb3A7XG4gICAgICAgIHZhciBvbkJlZm9yZU5vZGVEaXNjYXJkZWQgPSBvcHRpb25zLm9uQmVmb3JlTm9kZURpc2NhcmRlZCB8fCBub29wO1xuICAgICAgICB2YXIgb25Ob2RlRGlzY2FyZGVkID0gb3B0aW9ucy5vbk5vZGVEaXNjYXJkZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIG9uQmVmb3JlRWxDaGlsZHJlblVwZGF0ZWQgPSBvcHRpb25zLm9uQmVmb3JlRWxDaGlsZHJlblVwZGF0ZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIGNoaWxkcmVuT25seSA9IG9wdGlvbnMuY2hpbGRyZW5Pbmx5ID09PSB0cnVlO1xuXG4gICAgICAgIC8vIFRoaXMgb2JqZWN0IGlzIHVzZWQgYXMgYSBsb29rdXAgdG8gcXVpY2tseSBmaW5kIGFsbCBrZXllZCBlbGVtZW50cyBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWUuXG4gICAgICAgIHZhciBmcm9tTm9kZXNMb29rdXAgPSB7fTtcbiAgICAgICAgdmFyIGtleWVkUmVtb3ZhbExpc3Q7XG5cbiAgICAgICAgZnVuY3Rpb24gYWRkS2V5ZWRSZW1vdmFsKGtleSkge1xuICAgICAgICAgICAgaWYgKGtleWVkUmVtb3ZhbExpc3QpIHtcbiAgICAgICAgICAgICAgICBrZXllZFJlbW92YWxMaXN0LnB1c2goa2V5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ZWRSZW1vdmFsTGlzdCA9IFtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gd2Fsa0Rpc2NhcmRlZENoaWxkTm9kZXMobm9kZSwgc2tpcEtleWVkTm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyQ2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1ckNoaWxkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2tpcEtleWVkTm9kZXMgJiYgKGtleSA9IGdldE5vZGVLZXkoY3VyQ2hpbGQpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgYXJlIHNraXBwaW5nIGtleWVkIG5vZGVzIHRoZW4gd2UgYWRkIHRoZSBrZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvIGEgbGlzdCBzbyB0aGF0IGl0IGNhbiBiZSBoYW5kbGVkIGF0IHRoZSB2ZXJ5IGVuZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZEtleWVkUmVtb3ZhbChrZXkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSByZXBvcnQgdGhlIG5vZGUgYXMgZGlzY2FyZGVkIGlmIGl0IGlzIG5vdCBrZXllZC4gV2UgZG8gdGhpcyBiZWNhdXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhdCB0aGUgZW5kIHdlIGxvb3AgdGhyb3VnaCBhbGwga2V5ZWQgZWxlbWVudHMgdGhhdCB3ZXJlIHVubWF0Y2hlZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW5kIHRoZW4gZGlzY2FyZCB0aGVtIGluIG9uZSBmaW5hbCBwYXNzLlxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ob2RlRGlzY2FyZGVkKGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJDaGlsZC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2Fsa0Rpc2NhcmRlZENoaWxkTm9kZXMoY3VyQ2hpbGQsIHNraXBLZXllZE5vZGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgYSBET00gbm9kZSBvdXQgb2YgdGhlIG9yaWdpbmFsIERPTVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gIHtOb2RlfSBub2RlIFRoZSBub2RlIHRvIHJlbW92ZVxuICAgICAgICAgKiBAcGFyYW0gIHtOb2RlfSBwYXJlbnROb2RlIFRoZSBub2RlcyBwYXJlbnRcbiAgICAgICAgICogQHBhcmFtICB7Qm9vbGVhbn0gc2tpcEtleWVkTm9kZXMgSWYgdHJ1ZSB0aGVuIGVsZW1lbnRzIHdpdGgga2V5cyB3aWxsIGJlIHNraXBwZWQgYW5kIG5vdCBkaXNjYXJkZWQuXG4gICAgICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGUobm9kZSwgcGFyZW50Tm9kZSwgc2tpcEtleWVkTm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChvbkJlZm9yZU5vZGVEaXNjYXJkZWQobm9kZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9uTm9kZURpc2NhcmRlZChub2RlKTtcbiAgICAgICAgICAgIHdhbGtEaXNjYXJkZWRDaGlsZE5vZGVzKG5vZGUsIHNraXBLZXllZE5vZGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIC8vIFRyZWVXYWxrZXIgaW1wbGVtZW50YXRpb24gaXMgbm8gZmFzdGVyLCBidXQga2VlcGluZyB0aGlzIGFyb3VuZCBpbiBjYXNlIHRoaXMgY2hhbmdlcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgIC8vIGZ1bmN0aW9uIGluZGV4VHJlZShyb290KSB7XG4gICAgICAgIC8vICAgICB2YXIgdHJlZVdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoXG4gICAgICAgIC8vICAgICAgICAgcm9vdCxcbiAgICAgICAgLy8gICAgICAgICBOb2RlRmlsdGVyLlNIT1dfRUxFTUVOVCk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICB2YXIgZWw7XG4gICAgICAgIC8vICAgICB3aGlsZSgoZWwgPSB0cmVlV2Fsa2VyLm5leHROb2RlKCkpKSB7XG4gICAgICAgIC8vICAgICAgICAgdmFyIGtleSA9IGdldE5vZGVLZXkoZWwpO1xuICAgICAgICAvLyAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgZnJvbU5vZGVzTG9va3VwW2tleV0gPSBlbDtcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyAvLyBOb2RlSXRlcmF0b3IgaW1wbGVtZW50YXRpb24gaXMgbm8gZmFzdGVyLCBidXQga2VlcGluZyB0aGlzIGFyb3VuZCBpbiBjYXNlIHRoaXMgY2hhbmdlcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGZ1bmN0aW9uIGluZGV4VHJlZShub2RlKSB7XG4gICAgICAgIC8vICAgICB2YXIgbm9kZUl0ZXJhdG9yID0gZG9jdW1lbnQuY3JlYXRlTm9kZUl0ZXJhdG9yKG5vZGUsIE5vZGVGaWx0ZXIuU0hPV19FTEVNRU5UKTtcbiAgICAgICAgLy8gICAgIHZhciBlbDtcbiAgICAgICAgLy8gICAgIHdoaWxlKChlbCA9IG5vZGVJdGVyYXRvci5uZXh0Tm9kZSgpKSkge1xuICAgICAgICAvLyAgICAgICAgIHZhciBrZXkgPSBnZXROb2RlS2V5KGVsKTtcbiAgICAgICAgLy8gICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgIC8vICAgICAgICAgICAgIGZyb21Ob2Rlc0xvb2t1cFtrZXldID0gZWw7XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9XG5cbiAgICAgICAgZnVuY3Rpb24gaW5kZXhUcmVlKG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyQ2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1ckNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBnZXROb2RlS2V5KGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbU5vZGVzTG9va3VwW2tleV0gPSBjdXJDaGlsZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdhbGsgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhUcmVlKGN1ckNoaWxkKTtcblxuICAgICAgICAgICAgICAgICAgICBjdXJDaGlsZCA9IGN1ckNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGluZGV4VHJlZShmcm9tTm9kZSk7XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlTm9kZUFkZGVkKGVsKSB7XG4gICAgICAgICAgICBvbk5vZGVBZGRlZChlbCk7XG5cbiAgICAgICAgICAgIHZhciBjdXJDaGlsZCA9IGVsLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICB3aGlsZSAoY3VyQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFNpYmxpbmcgPSBjdXJDaGlsZC5uZXh0U2libGluZztcblxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBnZXROb2RlS2V5KGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1bm1hdGNoZWRGcm9tRWwgPSBmcm9tTm9kZXNMb29rdXBba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVubWF0Y2hlZEZyb21FbCAmJiBjb21wYXJlTm9kZU5hbWVzKGN1ckNoaWxkLCB1bm1hdGNoZWRGcm9tRWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJDaGlsZC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh1bm1hdGNoZWRGcm9tRWwsIGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoRWwodW5tYXRjaGVkRnJvbUVsLCBjdXJDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBoYW5kbGVOb2RlQWRkZWQoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gbmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3JwaEVsKGZyb21FbCwgdG9FbCwgY2hpbGRyZW5Pbmx5KSB7XG4gICAgICAgICAgICB2YXIgdG9FbEtleSA9IGdldE5vZGVLZXkodG9FbCk7XG4gICAgICAgICAgICB2YXIgY3VyRnJvbU5vZGVLZXk7XG5cbiAgICAgICAgICAgIGlmICh0b0VsS2V5KSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgYW4gZWxlbWVudCB3aXRoIGFuIElEIGlzIGJlaW5nIG1vcnBoZWQgdGhlbiBpdCBpcyB3aWxsIGJlIGluIHRoZSBmaW5hbFxuICAgICAgICAgICAgICAgIC8vIERPTSBzbyBjbGVhciBpdCBvdXQgb2YgdGhlIHNhdmVkIGVsZW1lbnRzIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICBkZWxldGUgZnJvbU5vZGVzTG9va3VwW3RvRWxLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodG9Ob2RlLmlzU2FtZU5vZGUgJiYgdG9Ob2RlLmlzU2FtZU5vZGUoZnJvbU5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWNoaWxkcmVuT25seSkge1xuICAgICAgICAgICAgICAgIGlmIChvbkJlZm9yZUVsVXBkYXRlZChmcm9tRWwsIHRvRWwpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbW9ycGhBdHRycyhmcm9tRWwsIHRvRWwpO1xuICAgICAgICAgICAgICAgIG9uRWxVcGRhdGVkKGZyb21FbCk7XG5cbiAgICAgICAgICAgICAgICBpZiAob25CZWZvcmVFbENoaWxkcmVuVXBkYXRlZChmcm9tRWwsIHRvRWwpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZnJvbUVsLm5vZGVOYW1lICE9PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1clRvTm9kZUNoaWxkID0gdG9FbC5maXJzdENoaWxkO1xuICAgICAgICAgICAgICAgIHZhciBjdXJGcm9tTm9kZUNoaWxkID0gZnJvbUVsLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICAgICAgdmFyIGN1clRvTm9kZUtleTtcblxuICAgICAgICAgICAgICAgIHZhciBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgdmFyIHRvTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoaW5nRnJvbUVsO1xuXG4gICAgICAgICAgICAgICAgb3V0ZXI6IHdoaWxlIChjdXJUb05vZGVDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICB0b05leHRTaWJsaW5nID0gY3VyVG9Ob2RlQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUtleSA9IGdldE5vZGVLZXkoY3VyVG9Ob2RlQ2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJGcm9tTm9kZUNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tTmV4dFNpYmxpbmcgPSBjdXJGcm9tTm9kZUNoaWxkLm5leHRTaWJsaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyVG9Ob2RlQ2hpbGQuaXNTYW1lTm9kZSAmJiBjdXJUb05vZGVDaGlsZC5pc1NhbWVOb2RlKGN1ckZyb21Ob2RlQ2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSB0b05leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWUgb3V0ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlS2V5ID0gZ2V0Tm9kZUtleShjdXJGcm9tTm9kZUNoaWxkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1ckZyb21Ob2RlVHlwZSA9IGN1ckZyb21Ob2RlQ2hpbGQubm9kZVR5cGU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpc0NvbXBhdGlibGUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJGcm9tTm9kZVR5cGUgPT09IGN1clRvTm9kZUNoaWxkLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJvdGggbm9kZXMgYmVpbmcgY29tcGFyZWQgYXJlIEVsZW1lbnQgbm9kZXNcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyVG9Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgdGFyZ2V0IG5vZGUgaGFzIGEga2V5IHNvIHdlIHdhbnQgdG8gbWF0Y2ggaXQgdXAgd2l0aCB0aGUgY29ycmVjdCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVLZXkgIT09IGN1ckZyb21Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGN1cnJlbnQgZWxlbWVudCBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWUgZG9lcyBub3QgaGF2ZSBhIG1hdGNoaW5nIGtleSBzb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCdzIGNoZWNrIG91ciBsb29rdXAgdG8gc2VlIGlmIHRoZXJlIGlzIGEgbWF0Y2hpbmcgZWxlbWVudCBpbiB0aGUgb3JpZ2luYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBET00gdHJlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgobWF0Y2hpbmdGcm9tRWwgPSBmcm9tTm9kZXNMb29rdXBbY3VyVG9Ob2RlS2V5XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlQ2hpbGQubmV4dFNpYmxpbmcgPT09IG1hdGNoaW5nRnJvbUVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIHNpbmdsZSBlbGVtZW50IHJlbW92YWxzLiBUbyBhdm9pZCByZW1vdmluZyB0aGUgb3JpZ2luYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERPTSBub2RlIG91dCBvZiB0aGUgdHJlZSAoc2luY2UgdGhhdCBjYW4gYnJlYWsgQ1NTIHRyYW5zaXRpb25zLCBldGMuKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIHdpbGwgaW5zdGVhZCBkaXNjYXJkIHRoZSBjdXJyZW50IG5vZGUgYW5kIHdhaXQgdW50aWwgdGhlIG5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGlvbiB0byBwcm9wZXJseSBtYXRjaCB1cCB0aGUga2V5ZWQgdGFyZ2V0IGVsZW1lbnQgd2l0aCBpdHMgbWF0Y2hpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVsZW1lbnQgaW4gdGhlIG9yaWdpbmFsIHRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGF0aWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgZm91bmQgYSBtYXRjaGluZyBrZXllZCBlbGVtZW50IHNvbWV3aGVyZSBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMZXQncyBtb3ZpbmcgdGhlIG9yaWdpbmFsIERPTSBub2RlIGludG8gdGhlIGN1cnJlbnQgcG9zaXRpb24gYW5kIG1vcnBoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpdC5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogV2UgdXNlIGluc2VydEJlZm9yZSBpbnN0ZWFkIG9mIHJlcGxhY2VDaGlsZCBiZWNhdXNlIHdlIHdhbnQgdG8gZ28gdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGByZW1vdmVOb2RlKClgIGZ1bmN0aW9uIGZvciB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nIGRpc2NhcmRlZCBzbyB0aGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbGwgbGlmZWN5Y2xlIGhvb2tzIGFyZSBjb3JyZWN0bHkgaW52b2tlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbUVsLmluc2VydEJlZm9yZShtYXRjaGluZ0Zyb21FbCwgY3VyRnJvbU5vZGVDaGlsZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21OZXh0U2libGluZyA9IGN1ckZyb21Ob2RlQ2hpbGQubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJGcm9tTm9kZUtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBub2RlIGlzIGtleWVkIGl0IG1pZ2h0IGJlIG1hdGNoZWQgdXAgbGF0ZXIgc28gd2UgZGVmZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgYWN0dWFsIHJlbW92YWwgdG8gbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRLZXllZFJlbW92YWwoY3VyRnJvbU5vZGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiB3ZSBza2lwIG5lc3RlZCBrZXllZCBub2RlcyBmcm9tIGJlaW5nIHJlbW92ZWQgc2luY2UgdGhlcmUgaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICBzdGlsbCBhIGNoYW5jZSB0aGV5IHdpbGwgYmUgbWF0Y2hlZCB1cCBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoY3VyRnJvbU5vZGVDaGlsZCwgZnJvbUVsLCB0cnVlIC8qIHNraXAga2V5ZWQgbm9kZXMgKi8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJGcm9tTm9kZUNoaWxkID0gbWF0Y2hpbmdGcm9tRWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgbm9kZXMgYXJlIG5vdCBjb21wYXRpYmxlIHNpbmNlIHRoZSBcInRvXCIgbm9kZSBoYXMgYSBrZXkgYW5kIHRoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlzIG5vIG1hdGNoaW5nIGtleWVkIG5vZGUgaW4gdGhlIHNvdXJjZSB0cmVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGF0aWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJGcm9tTm9kZUtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIG9yaWdpbmFsIGhhcyBhIGtleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wYXRpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NvbXBhdGlibGUgPSBpc0NvbXBhdGlibGUgIT09IGZhbHNlICYmIGNvbXBhcmVOb2RlTmFtZXMoY3VyRnJvbU5vZGVDaGlsZCwgY3VyVG9Ob2RlQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNDb21wYXRpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBmb3VuZCBjb21wYXRpYmxlIERPTSBlbGVtZW50cyBzbyB0cmFuc2Zvcm1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IFwiZnJvbVwiIG5vZGUgdG8gbWF0Y2ggdGhlIGN1cnJlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRhcmdldCBET00gbm9kZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoRWwoY3VyRnJvbU5vZGVDaGlsZCwgY3VyVG9Ob2RlQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1ckZyb21Ob2RlVHlwZSA9PT0gVEVYVF9OT0RFIHx8IGN1ckZyb21Ob2RlVHlwZSA9PSBDT01NRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQm90aCBub2RlcyBiZWluZyBjb21wYXJlZCBhcmUgVGV4dCBvciBDb21tZW50IG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGF0aWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbXBseSB1cGRhdGUgbm9kZVZhbHVlIG9uIHRoZSBvcmlnaW5hbCBub2RlIHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSB0aGUgdGV4dCB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyRnJvbU5vZGVDaGlsZC5ub2RlVmFsdWUgIT09IGN1clRvTm9kZUNoaWxkLm5vZGVWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZC5ub2RlVmFsdWUgPSBjdXJUb05vZGVDaGlsZC5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ29tcGF0aWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkdmFuY2UgYm90aCB0aGUgXCJ0b1wiIGNoaWxkIGFuZCB0aGUgXCJmcm9tXCIgY2hpbGQgc2luY2Ugd2UgZm91bmQgYSBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUNoaWxkID0gdG9OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJGcm9tTm9kZUNoaWxkID0gZnJvbU5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIG91dGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBObyBjb21wYXRpYmxlIG1hdGNoIHNvIHJlbW92ZSB0aGUgb2xkIG5vZGUgZnJvbSB0aGUgRE9NIGFuZCBjb250aW51ZSB0cnlpbmcgdG8gZmluZCBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaCBpbiB0aGUgb3JpZ2luYWwgRE9NLiBIb3dldmVyLCB3ZSBvbmx5IGRvIHRoaXMgaWYgdGhlIGZyb20gbm9kZSBpcyBub3Qga2V5ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIGl0IGlzIHBvc3NpYmxlIHRoYXQgYSBrZXllZCBub2RlIG1pZ2h0IG1hdGNoIHVwIHdpdGggYSBub2RlIHNvbWV3aGVyZSBlbHNlIGluIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGFyZ2V0IHRyZWUgYW5kIHdlIGRvbid0IHdhbnQgdG8gZGlzY2FyZCBpdCBqdXN0IHlldCBzaW5jZSBpdCBzdGlsbCBtaWdodCBmaW5kIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhvbWUgaW4gdGhlIGZpbmFsIERPTSB0cmVlLiBBZnRlciBldmVyeXRoaW5nIGlzIGRvbmUgd2Ugd2lsbCByZW1vdmUgYW55IGtleWVkIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGF0IGRpZG4ndCBmaW5kIGEgaG9tZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgdGhlIG5vZGUgaXMga2V5ZWQgaXQgbWlnaHQgYmUgbWF0Y2hlZCB1cCBsYXRlciBzbyB3ZSBkZWZlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3R1YWwgcmVtb3ZhbCB0byBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEtleWVkUmVtb3ZhbChjdXJGcm9tTm9kZUtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHdlIHNraXAgbmVzdGVkIGtleWVkIG5vZGVzIGZyb20gYmVpbmcgcmVtb3ZlZCBzaW5jZSB0aGVyZSBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHN0aWxsIGEgY2hhbmNlIHRoZXkgd2lsbCBiZSBtYXRjaGVkIHVwIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTm9kZShjdXJGcm9tTm9kZUNoaWxkLCBmcm9tRWwsIHRydWUgLyogc2tpcCBrZXllZCBub2RlcyAqLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBnb3QgdGhpcyBmYXIgdGhlbiB3ZSBkaWQgbm90IGZpbmQgYSBjYW5kaWRhdGUgbWF0Y2ggZm9yXG4gICAgICAgICAgICAgICAgICAgIC8vIG91ciBcInRvIG5vZGVcIiBhbmQgd2UgZXhoYXVzdGVkIGFsbCBvZiB0aGUgY2hpbGRyZW4gXCJmcm9tXCJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm9kZXMuIFRoZXJlZm9yZSwgd2Ugd2lsbCBqdXN0IGFwcGVuZCB0aGUgY3VycmVudCBcInRvXCIgbm9kZVxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgZW5kXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVLZXkgJiYgKG1hdGNoaW5nRnJvbUVsID0gZnJvbU5vZGVzTG9va3VwW2N1clRvTm9kZUtleV0pICYmIGNvbXBhcmVOb2RlTmFtZXMobWF0Y2hpbmdGcm9tRWwsIGN1clRvTm9kZUNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbUVsLmFwcGVuZENoaWxkKG1hdGNoaW5nRnJvbUVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoRWwobWF0Y2hpbmdGcm9tRWwsIGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdCA9IG9uQmVmb3JlTm9kZUFkZGVkKGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob25CZWZvcmVOb2RlQWRkZWRSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSBvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyVG9Ob2RlQ2hpbGQuYWN0dWFsaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUNoaWxkID0gY3VyVG9Ob2RlQ2hpbGQuYWN0dWFsaXplKGZyb21FbC5vd25lckRvY3VtZW50IHx8IGRvYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21FbC5hcHBlbmRDaGlsZChjdXJUb05vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlTm9kZUFkZGVkKGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUNoaWxkID0gdG9OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZCA9IGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHByb2Nlc3NlZCBhbGwgb2YgdGhlIFwidG8gbm9kZXNcIi4gSWYgY3VyRnJvbU5vZGVDaGlsZCBpc1xuICAgICAgICAgICAgICAgIC8vIG5vbi1udWxsIHRoZW4gd2Ugc3RpbGwgaGF2ZSBzb21lIGZyb20gbm9kZXMgbGVmdCBvdmVyIHRoYXQgbmVlZFxuICAgICAgICAgICAgICAgIC8vIHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VyRnJvbU5vZGVDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tTmV4dFNpYmxpbmcgPSBjdXJGcm9tTm9kZUNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGN1ckZyb21Ob2RlS2V5ID0gZ2V0Tm9kZUtleShjdXJGcm9tTm9kZUNoaWxkKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBub2RlIGlzIGtleWVkIGl0IG1pZ2h0IGJlIG1hdGNoZWQgdXAgbGF0ZXIgc28gd2UgZGVmZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3R1YWwgcmVtb3ZhbCB0byBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkS2V5ZWRSZW1vdmFsKGN1ckZyb21Ob2RlS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHdlIHNraXAgbmVzdGVkIGtleWVkIG5vZGVzIGZyb20gYmVpbmcgcmVtb3ZlZCBzaW5jZSB0aGVyZSBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgc3RpbGwgYSBjaGFuY2UgdGhleSB3aWxsIGJlIG1hdGNoZWQgdXAgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoY3VyRnJvbU5vZGVDaGlsZCwgZnJvbUVsLCB0cnVlIC8qIHNraXAga2V5ZWQgbm9kZXMgKi8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3BlY2lhbEVsSGFuZGxlciA9IHNwZWNpYWxFbEhhbmRsZXJzW2Zyb21FbC5ub2RlTmFtZV07XG4gICAgICAgICAgICBpZiAoc3BlY2lhbEVsSGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHNwZWNpYWxFbEhhbmRsZXIoZnJvbUVsLCB0b0VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSAvLyBFTkQ6IG1vcnBoRWwoLi4uKVxuXG4gICAgICAgIHZhciBtb3JwaGVkTm9kZSA9IGZyb21Ob2RlO1xuICAgICAgICB2YXIgbW9ycGhlZE5vZGVUeXBlID0gbW9ycGhlZE5vZGUubm9kZVR5cGU7XG4gICAgICAgIHZhciB0b05vZGVUeXBlID0gdG9Ob2RlLm5vZGVUeXBlO1xuXG4gICAgICAgIGlmICghY2hpbGRyZW5Pbmx5KSB7XG4gICAgICAgICAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgd2UgYXJlIGdpdmVuIHR3byBET00gbm9kZXMgdGhhdCBhcmUgbm90XG4gICAgICAgICAgICAvLyBjb21wYXRpYmxlIChlLmcuIDxkaXY+IC0tPiA8c3Bhbj4gb3IgPGRpdj4gLS0+IFRFWFQpXG4gICAgICAgICAgICBpZiAobW9ycGhlZE5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICBpZiAodG9Ob2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tcGFyZU5vZGVOYW1lcyhmcm9tTm9kZSwgdG9Ob2RlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25Ob2RlRGlzY2FyZGVkKGZyb21Ob2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gbW92ZUNoaWxkcmVuKGZyb21Ob2RlLCBjcmVhdGVFbGVtZW50TlModG9Ob2RlLm5vZGVOYW1lLCB0b05vZGUubmFtZXNwYWNlVVJJKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBHb2luZyBmcm9tIGFuIGVsZW1lbnQgbm9kZSB0byBhIHRleHQgbm9kZVxuICAgICAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZSA9IHRvTm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vcnBoZWROb2RlVHlwZSA9PT0gVEVYVF9OT0RFIHx8IG1vcnBoZWROb2RlVHlwZSA9PT0gQ09NTUVOVF9OT0RFKSB7IC8vIFRleHQgb3IgY29tbWVudCBub2RlXG4gICAgICAgICAgICAgICAgaWYgKHRvTm9kZVR5cGUgPT09IG1vcnBoZWROb2RlVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobW9ycGhlZE5vZGUubm9kZVZhbHVlICE9PSB0b05vZGUubm9kZVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZS5ub2RlVmFsdWUgPSB0b05vZGUubm9kZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vcnBoZWROb2RlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRleHQgbm9kZSB0byBzb21ldGhpbmcgZWxzZVxuICAgICAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZSA9IHRvTm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9ycGhlZE5vZGUgPT09IHRvTm9kZSkge1xuICAgICAgICAgICAgLy8gVGhlIFwidG8gbm9kZVwiIHdhcyBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBcImZyb20gbm9kZVwiIHNvIHdlIGhhZCB0b1xuICAgICAgICAgICAgLy8gdG9zcyBvdXQgdGhlIFwiZnJvbSBub2RlXCIgYW5kIHVzZSB0aGUgXCJ0byBub2RlXCJcbiAgICAgICAgICAgIG9uTm9kZURpc2NhcmRlZChmcm9tTm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb3JwaEVsKG1vcnBoZWROb2RlLCB0b05vZGUsIGNoaWxkcmVuT25seSk7XG5cbiAgICAgICAgICAgIC8vIFdlIG5vdyBuZWVkIHRvIGxvb3Agb3ZlciBhbnkga2V5ZWQgbm9kZXMgdGhhdCBtaWdodCBuZWVkIHRvIGJlXG4gICAgICAgICAgICAvLyByZW1vdmVkLiBXZSBvbmx5IGRvIHRoZSByZW1vdmFsIGlmIHdlIGtub3cgdGhhdCB0aGUga2V5ZWQgbm9kZVxuICAgICAgICAgICAgLy8gbmV2ZXIgZm91bmQgYSBtYXRjaC4gV2hlbiBhIGtleWVkIG5vZGUgaXMgbWF0Y2hlZCB1cCB3ZSByZW1vdmVcbiAgICAgICAgICAgIC8vIGl0IG91dCBvZiBmcm9tTm9kZXNMb29rdXAgYW5kIHdlIHVzZSBmcm9tTm9kZXNMb29rdXAgdG8gZGV0ZXJtaW5lXG4gICAgICAgICAgICAvLyBpZiBhIGtleWVkIG5vZGUgaGFzIGJlZW4gbWF0Y2hlZCB1cCBvciBub3RcbiAgICAgICAgICAgIGlmIChrZXllZFJlbW92YWxMaXN0KSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wLCBsZW49a2V5ZWRSZW1vdmFsTGlzdC5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsVG9SZW1vdmUgPSBmcm9tTm9kZXNMb29rdXBba2V5ZWRSZW1vdmFsTGlzdFtpXV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbFRvUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVOb2RlKGVsVG9SZW1vdmUsIGVsVG9SZW1vdmUucGFyZW50Tm9kZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjaGlsZHJlbk9ubHkgJiYgbW9ycGhlZE5vZGUgIT09IGZyb21Ob2RlICYmIGZyb21Ob2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChtb3JwaGVkTm9kZS5hY3R1YWxpemUpIHtcbiAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZSA9IG1vcnBoZWROb2RlLmFjdHVhbGl6ZShmcm9tTm9kZS5vd25lckRvY3VtZW50IHx8IGRvYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYWQgdG8gc3dhcCBvdXQgdGhlIGZyb20gbm9kZSB3aXRoIGEgbmV3IG5vZGUgYmVjYXVzZSB0aGUgb2xkXG4gICAgICAgICAgICAvLyBub2RlIHdhcyBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSB0YXJnZXQgbm9kZSB0aGVuIHdlIG5lZWQgdG9cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIG9sZCBET00gbm9kZSBpbiB0aGUgb3JpZ2luYWwgRE9NIHRyZWUuIFRoaXMgaXMgb25seVxuICAgICAgICAgICAgLy8gcG9zc2libGUgaWYgdGhlIG9yaWdpbmFsIERPTSBub2RlIHdhcyBwYXJ0IG9mIGEgRE9NIHRyZWUgd2hpY2hcbiAgICAgICAgICAgIC8vIHdlIGtub3cgaXMgdGhlIGNhc2UgaWYgaXQgaGFzIGEgcGFyZW50IG5vZGUuXG4gICAgICAgICAgICBmcm9tTm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChtb3JwaGVkTm9kZSwgZnJvbU5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1vcnBoZWROb2RlO1xuICAgIH07XG59XG5cbnZhciBtb3JwaGRvbSA9IG1vcnBoZG9tRmFjdG9yeShtb3JwaEF0dHJzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBtb3JwaGRvbTtcbiIsIm1vZHVsZS5leHBvcnRzID0gW1xuICAvLyBhdHRyaWJ1dGUgZXZlbnRzIChjYW4gYmUgc2V0IHdpdGggYXR0cmlidXRlcylcbiAgJ29uY2xpY2snLFxuICAnb25kYmxjbGljaycsXG4gICdvbm1vdXNlZG93bicsXG4gICdvbm1vdXNldXAnLFxuICAnb25tb3VzZW92ZXInLFxuICAnb25tb3VzZW1vdmUnLFxuICAnb25tb3VzZW91dCcsXG4gICdvbmRyYWdzdGFydCcsXG4gICdvbmRyYWcnLFxuICAnb25kcmFnZW50ZXInLFxuICAnb25kcmFnbGVhdmUnLFxuICAnb25kcmFnb3ZlcicsXG4gICdvbmRyb3AnLFxuICAnb25kcmFnZW5kJyxcbiAgJ29ua2V5ZG93bicsXG4gICdvbmtleXByZXNzJyxcbiAgJ29ua2V5dXAnLFxuICAnb251bmxvYWQnLFxuICAnb25hYm9ydCcsXG4gICdvbmVycm9yJyxcbiAgJ29ucmVzaXplJyxcbiAgJ29uc2Nyb2xsJyxcbiAgJ29uc2VsZWN0JyxcbiAgJ29uY2hhbmdlJyxcbiAgJ29uc3VibWl0JyxcbiAgJ29ucmVzZXQnLFxuICAnb25mb2N1cycsXG4gICdvbmJsdXInLFxuICAnb25pbnB1dCcsXG4gIC8vIG90aGVyIGNvbW1vbiBldmVudHNcbiAgJ29uY29udGV4dG1lbnUnLFxuICAnb25mb2N1c2luJyxcbiAgJ29uZm9jdXNvdXQnXG5dXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHlveW9pZnlBcHBlbmRDaGlsZCAoZWwsIGNoaWxkcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBub2RlID0gY2hpbGRzW2ldXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICAgIHlveW9pZnlBcHBlbmRDaGlsZChlbCwgbm9kZSlcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ251bWJlcicgfHxcbiAgICAgIHR5cGVvZiBub2RlID09PSAnYm9vbGVhbicgfHxcbiAgICAgIG5vZGUgaW5zdGFuY2VvZiBEYXRlIHx8XG4gICAgICBub2RlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICBub2RlID0gbm9kZS50b1N0cmluZygpXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChlbC5sYXN0Q2hpbGQgJiYgZWwubGFzdENoaWxkLm5vZGVOYW1lID09PSAnI3RleHQnKSB7XG4gICAgICAgIGVsLmxhc3RDaGlsZC5ub2RlVmFsdWUgKz0gbm9kZVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG4gICAgfVxuICAgIGlmIChub2RlICYmIG5vZGUubm9kZVR5cGUpIHtcbiAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGUpXG4gICAgfVxuICB9XG59XG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4uL2NvcmUvVXRpbHMnKVxuY29uc3QgVHJhbnNsYXRvciA9IHJlcXVpcmUoJy4uL2NvcmUvVHJhbnNsYXRvcicpXG5jb25zdCBVcHB5U29ja2V0ID0gcmVxdWlyZSgnLi9VcHB5U29ja2V0JylcbmNvbnN0IGVlID0gcmVxdWlyZSgnbmFtZXNwYWNlLWVtaXR0ZXInKVxuY29uc3QgY3VpZCA9IHJlcXVpcmUoJ2N1aWQnKVxuY29uc3QgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKVxuY29uc3QgcHJldHR5Qnl0ZXMgPSByZXF1aXJlKCdwcmV0dGllci1ieXRlcycpXG5jb25zdCBtYXRjaCA9IHJlcXVpcmUoJ21pbWUtbWF0Y2gnKVxuLy8gY29uc3QgZW5fVVMgPSByZXF1aXJlKCcuLi9sb2NhbGVzL2VuX1VTJylcbi8vIGNvbnN0IGRlZXBGcmVlemUgPSByZXF1aXJlKCdkZWVwLWZyZWV6ZS1zdHJpY3QnKVxuXG4vKipcbiAqIE1haW4gVXBweSBjb3JlXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgZ2VuZXJhbCBvcHRpb25zLCBsaWtlIGxvY2FsZXMsIHRvIHNob3cgbW9kYWwgb3Igbm90IHRvIHNob3dcbiAqL1xuY2xhc3MgVXBweSB7XG4gIGNvbnN0cnVjdG9yIChvcHRzKSB7XG4gICAgY29uc3QgZGVmYXVsdExvY2FsZSA9IHtcbiAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgeW91Q2FuT25seVVwbG9hZFg6IHtcbiAgICAgICAgICAwOiAnWW91IGNhbiBvbmx5IHVwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgICAgICAxOiAnWW91IGNhbiBvbmx5IHVwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlcydcbiAgICAgICAgfSxcbiAgICAgICAgeW91SGF2ZVRvQXRMZWFzdFNlbGVjdFg6IHtcbiAgICAgICAgICAwOiAnWW91IGhhdmUgdG8gc2VsZWN0IGF0IGxlYXN0ICV7c21hcnRfY291bnR9IGZpbGUnLFxuICAgICAgICAgIDE6ICdZb3UgaGF2ZSB0byBzZWxlY3QgYXQgbGVhc3QgJXtzbWFydF9jb3VudH0gZmlsZXMnXG4gICAgICAgIH0sXG4gICAgICAgIGV4Y2VlZHNTaXplOiAnVGhpcyBmaWxlIGV4Y2VlZHMgbWF4aW11bSBhbGxvd2VkIHNpemUgb2YnLFxuICAgICAgICB5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzOiAnWW91IGNhbiBvbmx5IHVwbG9hZDonLFxuICAgICAgICB1cHB5U2VydmVyRXJyb3I6ICdDb25uZWN0aW9uIHdpdGggVXBweSBzZXJ2ZXIgZmFpbGVkJ1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGF1dG9Qcm9jZWVkOiB0cnVlLFxuICAgICAgZGVidWc6IGZhbHNlLFxuICAgICAgcmVzdHJpY3Rpb25zOiB7XG4gICAgICAgIG1heEZpbGVTaXplOiBmYWxzZSxcbiAgICAgICAgbWF4TnVtYmVyT2ZGaWxlczogZmFsc2UsXG4gICAgICAgIG1pbk51bWJlck9mRmlsZXM6IGZhbHNlLFxuICAgICAgICBhbGxvd2VkRmlsZVR5cGVzOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIG9uQmVmb3JlRmlsZUFkZGVkOiAoY3VycmVudEZpbGUsIGZpbGVzKSA9PiBQcm9taXNlLnJlc29sdmUoKSxcbiAgICAgIG9uQmVmb3JlVXBsb2FkOiAoZmlsZXMsIGRvbmUpID0+IFByb21pc2UucmVzb2x2ZSgpLFxuICAgICAgbG9jYWxlOiBkZWZhdWx0TG9jYWxlXG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIG9uZXMgc2V0IGJ5IHVzZXJcbiAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cylcblxuICAgIC8vIC8vIERpY3RhdGVzIGluIHdoYXQgb3JkZXIgZGlmZmVyZW50IHBsdWdpbiB0eXBlcyBhcmUgcmFuOlxuICAgIC8vIHRoaXMudHlwZXMgPSBbICdwcmVzZXR0ZXInLCAnb3JjaGVzdHJhdG9yJywgJ3Byb2dyZXNzaW5kaWNhdG9yJyxcbiAgICAvLyAgICAgICAgICAgICAgICAgJ2FjcXVpcmVyJywgJ21vZGlmaWVyJywgJ3VwbG9hZGVyJywgJ3ByZXNlbnRlcicsICdkZWJ1Z2dlciddXG5cbiAgICB0aGlzLmxvY2FsZSA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRMb2NhbGUsIHRoaXMub3B0cy5sb2NhbGUpXG4gICAgdGhpcy5sb2NhbGUuc3RyaW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRMb2NhbGUuc3RyaW5ncywgdGhpcy5vcHRzLmxvY2FsZS5zdHJpbmdzKVxuXG4gICAgLy8gaTE4blxuICAgIHRoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKHtsb2NhbGU6IHRoaXMubG9jYWxlfSlcbiAgICB0aGlzLmkxOG4gPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodGhpcy50cmFuc2xhdG9yKVxuXG4gICAgLy8gQ29udGFpbmVyIGZvciBkaWZmZXJlbnQgdHlwZXMgb2YgcGx1Z2luc1xuICAgIHRoaXMucGx1Z2lucyA9IHt9XG5cbiAgICAvLyBAVE9ETyBtYXliZSBiaW5kYWxsXG4gICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3Ioe2xvY2FsZTogdGhpcy5vcHRzLmxvY2FsZX0pXG4gICAgdGhpcy5pMThuID0gdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZS5iaW5kKHRoaXMudHJhbnNsYXRvcilcbiAgICB0aGlzLmdldFN0YXRlID0gdGhpcy5nZXRTdGF0ZS5iaW5kKHRoaXMpXG4gICAgdGhpcy51cGRhdGVNZXRhID0gdGhpcy51cGRhdGVNZXRhLmJpbmQodGhpcylcbiAgICB0aGlzLmluaXRTb2NrZXQgPSB0aGlzLmluaXRTb2NrZXQuYmluZCh0aGlzKVxuICAgIHRoaXMubG9nID0gdGhpcy5sb2cuYmluZCh0aGlzKVxuICAgIHRoaXMuYWRkRmlsZSA9IHRoaXMuYWRkRmlsZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5jYWxjdWxhdGVQcm9ncmVzcyA9IHRoaXMuY2FsY3VsYXRlUHJvZ3Jlc3MuYmluZCh0aGlzKVxuICAgIHRoaXMucmVzZXRQcm9ncmVzcyA9IHRoaXMucmVzZXRQcm9ncmVzcy5iaW5kKHRoaXMpXG5cbiAgICAvLyB0aGlzLmJ1cyA9IHRoaXMuZW1pdHRlciA9IGVlKClcbiAgICB0aGlzLmVtaXR0ZXIgPSBlZSgpXG4gICAgdGhpcy5vbiA9IHRoaXMuZW1pdHRlci5vbi5iaW5kKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLm9mZiA9IHRoaXMuZW1pdHRlci5vZmYuYmluZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5vbmNlID0gdGhpcy5lbWl0dGVyLm9uY2UuYmluZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5lbWl0ID0gdGhpcy5lbWl0dGVyLmVtaXQuYmluZCh0aGlzLmVtaXR0ZXIpXG5cbiAgICB0aGlzLnByZVByb2Nlc3NvcnMgPSBbXVxuICAgIHRoaXMudXBsb2FkZXJzID0gW11cbiAgICB0aGlzLnBvc3RQcm9jZXNzb3JzID0gW11cblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmaWxlczoge30sXG4gICAgICBjYXBhYmlsaXRpZXM6IHtcbiAgICAgICAgcmVzdW1hYmxlVXBsb2FkczogZmFsc2VcbiAgICAgIH0sXG4gICAgICB0b3RhbFByb2dyZXNzOiAwLFxuICAgICAgbWV0YTogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRzLm1ldGEpLFxuICAgICAgaW5mbzoge1xuICAgICAgICBpc0hpZGRlbjogdHJ1ZSxcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIG1zZzogJydcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nXG4gICAgdGhpcy51cGRhdGVOdW0gPSAwXG4gICAgaWYgKHRoaXMub3B0cy5kZWJ1Zykge1xuICAgICAgZ2xvYmFsLlVwcHlTdGF0ZSA9IHRoaXMuc3RhdGVcbiAgICAgIGdsb2JhbC51cHB5TG9nID0gJydcbiAgICAgIC8vIGdsb2JhbC5VcHB5QWRkRmlsZSA9IHRoaXMuYWRkRmlsZS5iaW5kKHRoaXMpXG4gICAgICBnbG9iYWwuX3VwcHkgPSB0aGlzXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb24gYWxsIHBsdWdpbnMgYW5kIHJ1biBgdXBkYXRlYCBvbiB0aGVtLiBDYWxsZWQgZWFjaCB0aW1lIHN0YXRlIGNoYW5nZXNcbiAgICpcbiAgICovXG4gIHVwZGF0ZUFsbCAoc3RhdGUpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLnBsdWdpbnMpLmZvckVhY2goKHBsdWdpblR5cGUpID0+IHtcbiAgICAgIHRoaXMucGx1Z2luc1twbHVnaW5UeXBlXS5mb3JFYWNoKChwbHVnaW4pID0+IHtcbiAgICAgICAgcGx1Z2luLnVwZGF0ZShzdGF0ZSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHN0YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7bmV3U3RhdGV9IG9iamVjdFxuICAgKi9cbiAgc2V0U3RhdGUgKHN0YXRlVXBkYXRlKSB7XG4gICAgY29uc3QgbmV3U3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLCBzdGF0ZVVwZGF0ZSlcbiAgICB0aGlzLmVtaXQoJ2NvcmU6c3RhdGUtdXBkYXRlJywgdGhpcy5zdGF0ZSwgbmV3U3RhdGUsIHN0YXRlVXBkYXRlKVxuXG4gICAgdGhpcy5zdGF0ZSA9IG5ld1N0YXRlXG4gICAgdGhpcy51cGRhdGVBbGwodGhpcy5zdGF0ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGN1cnJlbnQgc3RhdGVcbiAgICpcbiAgICovXG4gIGdldFN0YXRlICgpIHtcbiAgICAvLyB1c2UgZGVlcEZyZWV6ZSBmb3IgZGVidWdnaW5nXG4gICAgLy8gcmV0dXJuIGRlZXBGcmVlemUodGhpcy5zdGF0ZSlcbiAgICByZXR1cm4gdGhpcy5zdGF0ZVxuICB9XG5cbiAgcmVzZXQgKCkge1xuICAgIHRoaXMuZW1pdCgnY29yZTpwYXVzZS1hbGwnKVxuICAgIHRoaXMuZW1pdCgnY29yZTpjYW5jZWwtYWxsJylcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDBcbiAgICB9KVxuICB9XG5cbiAgcmVzZXRQcm9ncmVzcyAoKSB7XG4gICAgY29uc3QgZGVmYXVsdFByb2dyZXNzID0ge1xuICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICB1cGxvYWRDb21wbGV0ZTogZmFsc2UsXG4gICAgICB1cGxvYWRTdGFydGVkOiBmYWxzZVxuICAgIH1cbiAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUuZmlsZXMpXG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0ge31cbiAgICBPYmplY3Qua2V5cyhmaWxlcykuZm9yRWFjaChmaWxlSUQgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZEZpbGUgPSBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlSURdKVxuICAgICAgdXBkYXRlZEZpbGUucHJvZ3Jlc3MgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZS5wcm9ncmVzcywgZGVmYXVsdFByb2dyZXNzKVxuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG4gICAgY29uc29sZS5sb2codXBkYXRlZEZpbGVzKVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlcyxcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDBcbiAgICB9KVxuICB9XG5cbiAgYWRkUHJlUHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucHJlUHJvY2Vzc29ycy5wdXNoKGZuKVxuICB9XG5cbiAgcmVtb3ZlUHJlUHJvY2Vzc29yIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnByZVByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucHJlUHJvY2Vzc29ycy5zcGxpY2UoaSwgMSlcbiAgICB9XG4gIH1cblxuICBhZGRQb3N0UHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucG9zdFByb2Nlc3NvcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVBvc3RQcm9jZXNzb3IgKGZuKSB7XG4gICAgY29uc3QgaSA9IHRoaXMucG9zdFByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucG9zdFByb2Nlc3NvcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgYWRkVXBsb2FkZXIgKGZuKSB7XG4gICAgdGhpcy51cGxvYWRlcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVVwbG9hZGVyIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnVwbG9hZGVycy5pbmRleE9mKGZuKVxuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgdGhpcy51cGxvYWRlcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgc2V0TWV0YSAoZGF0YSkge1xuICAgIGNvbnN0IG5ld01ldGEgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkubWV0YSwgZGF0YSlcbiAgICB0aGlzLmxvZygnQWRkaW5nIG1ldGFkYXRhOicpXG4gICAgdGhpcy5sb2coZGF0YSlcbiAgICB0aGlzLnNldFN0YXRlKHttZXRhOiBuZXdNZXRhfSlcbiAgfVxuXG4gIHVwZGF0ZU1ldGEgKGRhdGEsIGZpbGVJRCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCBuZXdNZXRhID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ubWV0YSwgZGF0YSlcbiAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLCB7XG4gICAgICBtZXRhOiBuZXdNZXRhXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHtmaWxlczogdXBkYXRlZEZpbGVzfSlcbiAgfVxuXG4gIGNoZWNrUmVzdHJpY3Rpb25zIChjaGVja01pbk51bWJlck9mRmlsZXMsIGZpbGUsIGZpbGVUeXBlKSB7XG4gICAgY29uc3Qge21heEZpbGVTaXplLCBtYXhOdW1iZXJPZkZpbGVzLCBtaW5OdW1iZXJPZkZpbGVzLCBhbGxvd2VkRmlsZVR5cGVzfSA9IHRoaXMub3B0cy5yZXN0cmljdGlvbnNcblxuICAgIGlmIChjaGVja01pbk51bWJlck9mRmlsZXMgJiYgbWluTnVtYmVyT2ZGaWxlcykge1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuZmlsZXMpLmxlbmd0aCA8IG1pbk51bWJlck9mRmlsZXMpIHtcbiAgICAgICAgdGhpcy5pbmZvKGAke3RoaXMuaTE4bigneW91SGF2ZVRvQXRMZWFzdFNlbGVjdFgnLCB7c21hcnRfY291bnQ6IG1pbk51bWJlck9mRmlsZXN9KX1gLCAnZXJyb3InLCA1MDAwKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKG1heE51bWJlck9mRmlsZXMpIHtcbiAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLnN0YXRlLmZpbGVzKS5sZW5ndGggKyAxID4gbWF4TnVtYmVyT2ZGaWxlcykge1xuICAgICAgICB0aGlzLmluZm8oYCR7dGhpcy5pMThuKCd5b3VDYW5Pbmx5VXBsb2FkWCcsIHtzbWFydF9jb3VudDogbWF4TnVtYmVyT2ZGaWxlc30pfWAsICdlcnJvcicsIDUwMDApXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhbGxvd2VkRmlsZVR5cGVzKSB7XG4gICAgICBjb25zdCBpc0NvcnJlY3RGaWxlVHlwZSA9IGFsbG93ZWRGaWxlVHlwZXMuZmlsdGVyKG1hdGNoKGZpbGVUeXBlLmpvaW4oJy8nKSkpLmxlbmd0aCA+IDBcbiAgICAgIGlmICghaXNDb3JyZWN0RmlsZVR5cGUpIHtcbiAgICAgICAgY29uc3QgYWxsb3dlZEZpbGVUeXBlc1N0cmluZyA9IGFsbG93ZWRGaWxlVHlwZXMuam9pbignLCAnKVxuICAgICAgICB0aGlzLmluZm8oYCR7dGhpcy5pMThuKCd5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzJyl9ICR7YWxsb3dlZEZpbGVUeXBlc1N0cmluZ31gLCAnZXJyb3InLCA1MDAwKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF4RmlsZVNpemUpIHtcbiAgICAgIGlmIChmaWxlLmRhdGEuc2l6ZSA+IG1heEZpbGVTaXplKSB7XG4gICAgICAgIHRoaXMuaW5mbyhgJHt0aGlzLmkxOG4oJ2V4Y2VlZHNTaXplJyl9ICR7cHJldHR5Qnl0ZXMobWF4RmlsZVNpemUpfWAsICdlcnJvcicsIDUwMDApXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBhZGRGaWxlIChmaWxlKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0cy5vbkJlZm9yZUZpbGVBZGRlZChmaWxlLCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHRoaXMuaW5mbyhlcnIsICdlcnJvcicsIDUwMDApXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoYG9uQmVmb3JlRmlsZUFkZGVkOiAke2Vycn1gKVxuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIFV0aWxzLmdldEZpbGVUeXBlKGZpbGUpLnRoZW4oKGZpbGVUeXBlKSA9PiB7XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUuZmlsZXMpXG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZS5uYW1lIHx8ICdub25hbWUnXG4gICAgICAgIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBVdGlscy5nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbihmaWxlTmFtZSlbMV1cbiAgICAgICAgY29uc3QgaXNSZW1vdGUgPSBmaWxlLmlzUmVtb3RlIHx8IGZhbHNlXG5cbiAgICAgICAgY29uc3QgZmlsZUlEID0gVXRpbHMuZ2VuZXJhdGVGaWxlSUQoZmlsZSlcbiAgICAgICAgY29uc3QgZmlsZVR5cGVHZW5lcmFsID0gZmlsZVR5cGVbMF1cbiAgICAgICAgY29uc3QgZmlsZVR5cGVTcGVjaWZpYyA9IGZpbGVUeXBlWzFdXG5cbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IHtcbiAgICAgICAgICBzb3VyY2U6IGZpbGUuc291cmNlIHx8ICcnLFxuICAgICAgICAgIGlkOiBmaWxlSUQsXG4gICAgICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICAgICAgZXh0ZW5zaW9uOiBmaWxlRXh0ZW5zaW9uIHx8ICcnLFxuICAgICAgICAgIG1ldGE6IE9iamVjdC5hc3NpZ24oe30sIHsgbmFtZTogZmlsZU5hbWUgfSwgdGhpcy5nZXRTdGF0ZSgpLm1ldGEpLFxuICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgIGdlbmVyYWw6IGZpbGVUeXBlR2VuZXJhbCxcbiAgICAgICAgICAgIHNwZWNpZmljOiBmaWxlVHlwZVNwZWNpZmljXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkYXRhOiBmaWxlLmRhdGEsXG4gICAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgICBieXRlc1VwbG9hZGVkOiAwLFxuICAgICAgICAgICAgYnl0ZXNUb3RhbDogZmlsZS5kYXRhLnNpemUgfHwgMCxcbiAgICAgICAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgICAgICAgIHVwbG9hZFN0YXJ0ZWQ6IGZhbHNlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzaXplOiBmaWxlLmRhdGEuc2l6ZSB8fCAnTi9BJyxcbiAgICAgICAgICBpc1JlbW90ZTogaXNSZW1vdGUsXG4gICAgICAgICAgcmVtb3RlOiBmaWxlLnJlbW90ZSB8fCAnJyxcbiAgICAgICAgICBwcmV2aWV3OiBmaWxlLnByZXZpZXdcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzRmlsZUFsbG93ZWQgPSB0aGlzLmNoZWNrUmVzdHJpY3Rpb25zKGZhbHNlLCBuZXdGaWxlLCBmaWxlVHlwZSlcbiAgICAgICAgaWYgKCFpc0ZpbGVBbGxvd2VkKSByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0ZpbGUgbm90IGFsbG93ZWQnKVxuXG4gICAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gbmV3RmlsZVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtmaWxlczogdXBkYXRlZEZpbGVzfSlcblxuICAgICAgICB0aGlzLmVtaXQoJ2NvcmU6ZmlsZS1hZGRlZCcsIG5ld0ZpbGUpXG4gICAgICAgIHRoaXMubG9nKGBBZGRlZCBmaWxlOiAke2ZpbGVOYW1lfSwgJHtmaWxlSUR9LCBtaW1lIHR5cGU6ICR7ZmlsZVR5cGV9YClcblxuICAgICAgICBpZiAodGhpcy5vcHRzLmF1dG9Qcm9jZWVkICYmICF0aGlzLnNjaGVkdWxlZEF1dG9Qcm9jZWVkKSB7XG4gICAgICAgICAgdGhpcy5zY2hlZHVsZWRBdXRvUHJvY2VlZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZWRBdXRvUHJvY2VlZCA9IG51bGxcbiAgICAgICAgICAgIHRoaXMudXBsb2FkKCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSB8fCBlcnIpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0sIDQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBmaWxlIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJRCBUaGUgSUQgb2YgdGhlIGZpbGUgb2JqZWN0IHRvIHJldHVybi5cbiAgICovXG4gIGdldEZpbGUgKGZpbGVJRCkge1xuICAgIHJldHVybiB0aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgcHJldmlldyBpbWFnZSBmb3IgdGhlIGdpdmVuIGZpbGUsIGlmIHBvc3NpYmxlLlxuICAgKi9cbiAgZ2VuZXJhdGVQcmV2aWV3IChmaWxlKSB7XG4gICAgaWYgKFV0aWxzLmlzUHJldmlld1N1cHBvcnRlZChmaWxlLnR5cGUuc3BlY2lmaWMpICYmICFmaWxlLmlzUmVtb3RlKSB7XG4gICAgICBVdGlscy5jcmVhdGVUaHVtYm5haWwoZmlsZSwgMjAwKS50aGVuKCh0aHVtYm5haWwpID0+IHtcbiAgICAgICAgdGhpcy5zZXRQcmV2aWV3VVJMKGZpbGUuaWQsIHRodW1ibmFpbClcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgcHJldmlldyBVUkwgZm9yIGEgZmlsZS5cbiAgICovXG4gIHNldFByZXZpZXdVUkwgKGZpbGVJRCwgcHJldmlldykge1xuICAgIGNvbnN0IHsgZmlsZXMgfSA9IHRoaXMuc3RhdGVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiBPYmplY3QuYXNzaWduKHt9LCBmaWxlcywge1xuICAgICAgICBbZmlsZUlEXTogT2JqZWN0LmFzc2lnbih7fSwgZmlsZXNbZmlsZUlEXSwge1xuICAgICAgICAgIHByZXZpZXc6IHByZXZpZXdcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHJlbW92ZUZpbGUgKGZpbGVJRCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCByZW1vdmVkRmlsZSA9IHVwZGF0ZWRGaWxlc1tmaWxlSURdXG4gICAgZGVsZXRlIHVwZGF0ZWRGaWxlc1tmaWxlSURdXG5cbiAgICB0aGlzLnNldFN0YXRlKHtmaWxlczogdXBkYXRlZEZpbGVzfSlcbiAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIHRoaXMuZW1pdCgnY29yZTpmaWxlLXJlbW92ZWQnLCBmaWxlSUQpXG5cbiAgICAvLyBDbGVhbiB1cCBvYmplY3QgVVJMcy5cbiAgICBpZiAocmVtb3ZlZEZpbGUucHJldmlldyAmJiBVdGlscy5pc09iamVjdFVSTChyZW1vdmVkRmlsZS5wcmV2aWV3KSkge1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChyZW1vdmVkRmlsZS5wcmV2aWV3KVxuICAgIH1cblxuICAgIHRoaXMubG9nKGBSZW1vdmVkIGZpbGU6ICR7ZmlsZUlEfWApXG4gIH1cblxuICBjYWxjdWxhdGVQcm9ncmVzcyAoZGF0YSkge1xuICAgIGNvbnN0IGZpbGVJRCA9IGRhdGEuaWRcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG5cbiAgICAvLyBza2lwIHByb2dyZXNzIGV2ZW50IGZvciBhIGZpbGUgdGhhdOKAmXMgYmVlbiByZW1vdmVkXG4gICAgaWYgKCF1cGRhdGVkRmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhpcy5sb2coJ1RyeWluZyB0byBzZXQgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF04oCZcyBub3Qgd2l0aCB1cyBhbnltb3JlOiAnLCBmaWxlSUQpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLFxuICAgICAgT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICBwcm9ncmVzczogT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ucHJvZ3Jlc3MsIHtcbiAgICAgICAgICBieXRlc1VwbG9hZGVkOiBkYXRhLmJ5dGVzVXBsb2FkZWQsXG4gICAgICAgICAgYnl0ZXNUb3RhbDogZGF0YS5ieXRlc1RvdGFsLFxuICAgICAgICAgIHBlcmNlbnRhZ2U6IE1hdGguZmxvb3IoKGRhdGEuYnl0ZXNVcGxvYWRlZCAvIGRhdGEuYnl0ZXNUb3RhbCAqIDEwMCkudG9GaXhlZCgyKSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICApKVxuICAgIHVwZGF0ZWRGaWxlc1tkYXRhLmlkXSA9IHVwZGF0ZWRGaWxlXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXNcbiAgICB9KVxuXG4gICAgdGhpcy5jYWxjdWxhdGVUb3RhbFByb2dyZXNzKClcbiAgfVxuXG4gIGNhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MgKCkge1xuICAgIC8vIGNhbGN1bGF0ZSB0b3RhbCBwcm9ncmVzcywgdXNpbmcgdGhlIG51bWJlciBvZiBmaWxlcyBjdXJyZW50bHkgdXBsb2FkaW5nLFxuICAgIC8vIG11bHRpcGxpZWQgYnkgMTAwIGFuZCB0aGUgc3VtbSBvZiBpbmRpdmlkdWFsIHByb2dyZXNzIG9mIGVhY2ggZmlsZVxuICAgIGNvbnN0IGZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuXG4gICAgY29uc3QgaW5Qcm9ncmVzcyA9IE9iamVjdC5rZXlzKGZpbGVzKS5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiBmaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRTdGFydGVkXG4gICAgfSlcbiAgICBjb25zdCBwcm9ncmVzc01heCA9IGluUHJvZ3Jlc3MubGVuZ3RoICogMTAwXG4gICAgbGV0IHByb2dyZXNzQWxsID0gMFxuICAgIGluUHJvZ3Jlc3MuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgcHJvZ3Jlc3NBbGwgPSBwcm9ncmVzc0FsbCArIGZpbGVzW2ZpbGVdLnByb2dyZXNzLnBlcmNlbnRhZ2VcbiAgICB9KVxuXG4gICAgY29uc3QgdG90YWxQcm9ncmVzcyA9IE1hdGguZmxvb3IoKHByb2dyZXNzQWxsICogMTAwIC8gcHJvZ3Jlc3NNYXgpLnRvRml4ZWQoMikpXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IHRvdGFsUHJvZ3Jlc3NcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBsaXN0ZW5lcnMgZm9yIGFsbCBnbG9iYWwgYWN0aW9ucywgbGlrZTpcbiAgICogYGZpbGUtYWRkYCwgYGZpbGUtcmVtb3ZlYCwgYHVwbG9hZC1wcm9ncmVzc2AsIGByZXNldGBcbiAgICpcbiAgICovXG4gIGFjdGlvbnMgKCkge1xuICAgIC8vIHRoaXMuYnVzLm9uKCcqJywgKHBheWxvYWQpID0+IHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdlbWl0dGVkOiAnLCB0aGlzLmV2ZW50KVxuICAgIC8vICAgY29uc29sZS5sb2coJ3dpdGggcGF5bG9hZDogJywgcGF5bG9hZClcbiAgICAvLyB9KVxuXG4gICAgLy8gc3RyZXNzLXRlc3QgcmUtcmVuZGVyaW5nXG4gICAgLy8gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7YmxhOiAnYmxhJ30pXG4gICAgLy8gfSwgMjApXG5cbiAgICB0aGlzLm9uKCdjb3JlOmVycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3IgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29yZTp1cGxvYWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29yZTpmaWxlLWFkZCcsIChkYXRhKSA9PiB7XG4gICAgICB0aGlzLmFkZEZpbGUoZGF0YSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29yZTpmaWxlLWFkZGVkJywgKGZpbGUpID0+IHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVQcmV2aWV3KGZpbGUpXG4gICAgfSlcblxuICAgIC8vIGByZW1vdmUtZmlsZWAgcmVtb3ZlcyBhIGZpbGUgZnJvbSBgc3RhdGUuZmlsZXNgLCBmb3IgZXhhbXBsZSB3aGVuXG4gICAgLy8gYSB1c2VyIGRlY2lkZXMgbm90IHRvIHVwbG9hZCBwYXJ0aWN1bGFyIGZpbGUgYW5kIGNsaWNrcyBhIGJ1dHRvbiB0byByZW1vdmUgaXRcbiAgICB0aGlzLm9uKCdjb3JlOmZpbGUtcmVtb3ZlJywgKGZpbGVJRCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVGaWxlKGZpbGVJRClcbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29yZTpjYW5jZWwtYWxsJywgKCkgPT4ge1xuICAgICAgLy8gbGV0IHVwZGF0ZWRGaWxlcyA9IHRoaXMuZ2V0U3RhdGUoKS5maWxlc1xuICAgICAgLy8gdXBkYXRlZEZpbGVzID0ge31cbiAgICAgIHRoaXMuc2V0U3RhdGUoe2ZpbGVzOiB7fX0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ2NvcmU6dXBsb2FkLXN0YXJ0ZWQnLCAoZmlsZUlELCB1cGxvYWQpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0sXG4gICAgICAgIE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICBwcm9ncmVzczogT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ucHJvZ3Jlc3MsIHtcbiAgICAgICAgICAgIHVwbG9hZFN0YXJ0ZWQ6IERhdGUubm93KClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApKVxuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB1cGRhdGVkRmlsZVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtmaWxlczogdXBkYXRlZEZpbGVzfSlcbiAgICB9KVxuXG4gICAgLy8gdXBsb2FkIHByb2dyZXNzIGV2ZW50cyBjYW4gb2NjdXIgZnJlcXVlbnRseSwgZXNwZWNpYWxseSB3aGVuIHlvdSBoYXZlIGEgZ29vZFxuICAgIC8vIGNvbm5lY3Rpb24gdG8gdGhlIHJlbW90ZSBzZXJ2ZXIuIFRoZXJlZm9yZSwgd2UgYXJlIHRocm90dGVsaW5nIHRoZW0gdG9cbiAgICAvLyBwcmV2ZW50IGFjY2Vzc2l2ZSBmdW5jdGlvbiBjYWxscy5cbiAgICAvLyBzZWUgYWxzbzogaHR0cHM6Ly9naXRodWIuY29tL3R1cy90dXMtanMtY2xpZW50L2NvbW1pdC85OTQwZjI3YjIzNjFmZDdlMTBiYTU4YjA5YjYwZDgyNDIyMTgzYmJiXG4gICAgY29uc3QgdGhyb3R0bGVkQ2FsY3VsYXRlUHJvZ3Jlc3MgPSB0aHJvdHRsZSh0aGlzLmNhbGN1bGF0ZVByb2dyZXNzLCAxMDAsIHtsZWFkaW5nOiB0cnVlLCB0cmFpbGluZzogZmFsc2V9KVxuXG4gICAgdGhpcy5vbignY29yZTp1cGxvYWQtcHJvZ3Jlc3MnLCAoZGF0YSkgPT4ge1xuICAgICAgLy8gdGhpcy5jYWxjdWxhdGVQcm9ncmVzcyhkYXRhKVxuICAgICAgdGhyb3R0bGVkQ2FsY3VsYXRlUHJvZ3Jlc3MoZGF0YSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29yZTp1cGxvYWQtc3VjY2VzcycsIChmaWxlSUQsIHVwbG9hZFJlc3AsIHVwbG9hZFVSTCkgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgICAgY29uc3QgdXBkYXRlZEZpbGUgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSwge1xuICAgICAgICBwcm9ncmVzczogT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ucHJvZ3Jlc3MsIHtcbiAgICAgICAgICB1cGxvYWRDb21wbGV0ZTogdHJ1ZSxcbiAgICAgICAgICAvLyBnb29kIG9yIGJhZCBpZGVhPyBzZXR0aW5nIHRoZSBwZXJjZW50YWdlIHRvIDEwMCBpZiB1cGxvYWQgaXMgc3VjY2Vzc2Z1bCxcbiAgICAgICAgICAvLyBzbyB0aGF0IGlmIHdlIGxvc3Qgc29tZSBwcm9ncmVzcyBldmVudHMgb24gdGhlIHdheSwgaXRzIHN0aWxsIG1hcmtlZCDigJxjb21wZXRl4oCdP1xuICAgICAgICAgIHBlcmNlbnRhZ2U6IDEwMFxuICAgICAgICB9KSxcbiAgICAgICAgdXBsb2FkVVJMOiB1cGxvYWRVUkxcbiAgICAgIH0pXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IHVwZGF0ZWRGaWxlXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBmaWxlczogdXBkYXRlZEZpbGVzXG4gICAgICB9KVxuXG4gICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuXG4gICAgICBpZiAodGhpcy5nZXRTdGF0ZSgpLnRvdGFsUHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICBjb25zdCBjb21wbGV0ZUZpbGVzID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZENvbXBsZXRlXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZW1pdCgnY29yZTp1cGxvYWQtY29tcGxldGUnLCBjb21wbGV0ZUZpbGVzLmxlbmd0aClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29yZTp1cGRhdGUtbWV0YScsIChkYXRhLCBmaWxlSUQpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlTWV0YShkYXRhLCBmaWxlSUQpXG4gICAgfSlcblxuICAgIHRoaXMub24oJ2NvcmU6cHJlcHJvY2Vzcy1wcm9ncmVzcycsIChmaWxlSUQsIHByb2dyZXNzKSA9PiB7XG4gICAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICAgIGZpbGVzW2ZpbGVJRF0gPSBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlSURdLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlSURdLnByb2dyZXNzLCB7XG4gICAgICAgICAgcHJlcHJvY2VzczogcHJvZ3Jlc3NcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlczogZmlsZXMgfSlcbiAgICB9KVxuICAgIHRoaXMub24oJ2NvcmU6cHJlcHJvY2Vzcy1jb21wbGV0ZScsIChmaWxlSUQpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgICAgZmlsZXNbZmlsZUlEXSA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGVJRF0sIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGVJRF0ucHJvZ3Jlc3MpXG4gICAgICB9KVxuICAgICAgZGVsZXRlIGZpbGVzW2ZpbGVJRF0ucHJvZ3Jlc3MucHJlcHJvY2Vzc1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IGZpbGVzIH0pXG4gICAgfSlcbiAgICB0aGlzLm9uKCdjb3JlOnBvc3Rwcm9jZXNzLXByb2dyZXNzJywgKGZpbGVJRCwgcHJvZ3Jlc3MpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgICAgZmlsZXNbZmlsZUlEXSA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGVJRF0sIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGVJRF0ucHJvZ3Jlc3MsIHtcbiAgICAgICAgICBwb3N0cHJvY2VzczogcHJvZ3Jlc3NcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlczogZmlsZXMgfSlcbiAgICB9KVxuICAgIHRoaXMub24oJ2NvcmU6cG9zdHByb2Nlc3MtY29tcGxldGUnLCAoZmlsZUlEKSA9PiB7XG4gICAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICAgIGZpbGVzW2ZpbGVJRF0gPSBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlSURdLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlSURdLnByb2dyZXNzKVxuICAgICAgfSlcbiAgICAgIGRlbGV0ZSBmaWxlc1tmaWxlSURdLnByb2dyZXNzLnBvc3Rwcm9jZXNzXG4gICAgICAvLyBUT0RPIHNob3VsZCB3ZSBzZXQgc29tZSBraW5kIG9mIGBmdWxseUNvbXBsZXRlYCBwcm9wZXJ0eSBvbiB0aGUgZmlsZSBvYmplY3RcbiAgICAgIC8vIHNvIGl0J3MgZWFzaWVyIHRvIHNlZSB0aGF0IHRoZSBmaWxlIGlzIHVwbG9hZOKApmZ1bGx5IGNvbXBsZXRl4oCmcmF0aGVyIHRoYW5cbiAgICAgIC8vIHdoYXQgd2UgaGF2ZSB0byBkbyBub3cgKGB1cGxvYWRDb21wbGV0ZSAmJiAhcG9zdHByb2Nlc3NgKVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IGZpbGVzIH0pXG4gICAgfSlcblxuICAgIC8vIHNob3cgaW5mb3JtZXIgaWYgb2ZmbGluZVxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29ubGluZScsICgpID0+IHRoaXMuaXNPbmxpbmUodHJ1ZSkpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsICgpID0+IHRoaXMuaXNPbmxpbmUoZmFsc2UpKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmlzT25saW5lKCksIDMwMDApXG4gICAgfVxuICB9XG5cbiAgaXNPbmxpbmUgKHN0YXR1cykge1xuICAgIGNvbnN0IG9ubGluZSA9IHN0YXR1cyB8fCB3aW5kb3cubmF2aWdhdG9yLm9uTGluZVxuICAgIGlmICghb25saW5lKSB7XG4gICAgICB0aGlzLmVtaXQoJ2lzLW9mZmxpbmUnKVxuICAgICAgdGhpcy5pbmZvKCdObyBpbnRlcm5ldCBjb25uZWN0aW9uJywgJ2Vycm9yJywgMClcbiAgICAgIHRoaXMud2FzT2ZmbGluZSA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbWl0KCdpcy1vbmxpbmUnKVxuICAgICAgaWYgKHRoaXMud2FzT2ZmbGluZSkge1xuICAgICAgICB0aGlzLmVtaXQoJ2JhY2stb25saW5lJylcbiAgICAgICAgdGhpcy5pbmZvKCdDb25uZWN0ZWQhJywgJ3N1Y2Nlc3MnLCAzMDAwKVxuICAgICAgICB0aGlzLndhc09mZmxpbmUgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIHBsdWdpbiB3aXRoIENvcmVcbiAqXG4gKiBAcGFyYW0ge0NsYXNzfSBQbHVnaW4gb2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBvYmplY3QgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byBQbHVnaW4gbGF0ZXJcbiAqIEByZXR1cm4ge09iamVjdH0gc2VsZiBmb3IgY2hhaW5pbmdcbiAqL1xuICB1c2UgKFBsdWdpbiwgb3B0cykge1xuICAgIC8vIEluc3RhbnRpYXRlXG4gICAgY29uc3QgcGx1Z2luID0gbmV3IFBsdWdpbih0aGlzLCBvcHRzKVxuICAgIGNvbnN0IHBsdWdpbk5hbWUgPSBwbHVnaW4uaWRcbiAgICB0aGlzLnBsdWdpbnNbcGx1Z2luLnR5cGVdID0gdGhpcy5wbHVnaW5zW3BsdWdpbi50eXBlXSB8fCBbXVxuXG4gICAgaWYgKCFwbHVnaW5OYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdXIgcGx1Z2luIG11c3QgaGF2ZSBhIG5hbWUnKVxuICAgIH1cblxuICAgIGlmICghcGx1Z2luLnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBwbHVnaW4gbXVzdCBoYXZlIGEgdHlwZScpXG4gICAgfVxuXG4gICAgbGV0IGV4aXN0c1BsdWdpbkFscmVhZHkgPSB0aGlzLmdldFBsdWdpbihwbHVnaW5OYW1lKVxuICAgIGlmIChleGlzdHNQbHVnaW5BbHJlYWR5KSB7XG4gICAgICBsZXQgbXNnID0gYEFscmVhZHkgZm91bmQgYSBwbHVnaW4gbmFtZWQgJyR7ZXhpc3RzUGx1Z2luQWxyZWFkeS5uYW1lfScuXG4gICAgICAgIFRyaWVkIHRvIHVzZTogJyR7cGx1Z2luTmFtZX0nLlxuICAgICAgICBVcHB5IGlzIGN1cnJlbnRseSBsaW1pdGVkIHRvIHJ1bm5pbmcgb25lIG9mIGV2ZXJ5IHBsdWdpbi5cbiAgICAgICAgU2hhcmUgeW91ciB1c2UgY2FzZSB3aXRoIHVzIG92ZXIgYXRcbiAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkvaXNzdWVzL1xuICAgICAgICBpZiB5b3Ugd2FudCB1cyB0byByZWNvbnNpZGVyLmBcbiAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpXG4gICAgfVxuXG4gICAgdGhpcy5wbHVnaW5zW3BsdWdpbi50eXBlXS5wdXNoKHBsdWdpbilcbiAgICBwbHVnaW4uaW5zdGFsbCgpXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbi8qKlxuICogRmluZCBvbmUgUGx1Z2luIGJ5IG5hbWVcbiAqXG4gKiBAcGFyYW0gc3RyaW5nIG5hbWUgZGVzY3JpcHRpb25cbiAqL1xuICBnZXRQbHVnaW4gKG5hbWUpIHtcbiAgICBsZXQgZm91bmRQbHVnaW4gPSBmYWxzZVxuICAgIHRoaXMuaXRlcmF0ZVBsdWdpbnMoKHBsdWdpbikgPT4ge1xuICAgICAgY29uc3QgcGx1Z2luTmFtZSA9IHBsdWdpbi5pZFxuICAgICAgaWYgKHBsdWdpbk5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgZm91bmRQbHVnaW4gPSBwbHVnaW5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm91bmRQbHVnaW5cbiAgfVxuXG4vKipcbiAqIEl0ZXJhdGUgdGhyb3VnaCBhbGwgYHVzZWBkIHBsdWdpbnNcbiAqXG4gKiBAcGFyYW0gZnVuY3Rpb24gbWV0aG9kIGRlc2NyaXB0aW9uXG4gKi9cbiAgaXRlcmF0ZVBsdWdpbnMgKG1ldGhvZCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMucGx1Z2lucykuZm9yRWFjaCgocGx1Z2luVHlwZSkgPT4ge1xuICAgICAgdGhpcy5wbHVnaW5zW3BsdWdpblR5cGVdLmZvckVhY2gobWV0aG9kKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVW5pbnN0YWxsIGFuZCByZW1vdmUgYSBwbHVnaW4uXG4gICAqXG4gICAqIEBwYXJhbSB7UGx1Z2lufSBpbnN0YW5jZSBUaGUgcGx1Z2luIGluc3RhbmNlIHRvIHJlbW92ZS5cbiAgICovXG4gIHJlbW92ZVBsdWdpbiAoaW5zdGFuY2UpIHtcbiAgICBjb25zdCBsaXN0ID0gdGhpcy5wbHVnaW5zW2luc3RhbmNlLnR5cGVdXG5cbiAgICBpZiAoaW5zdGFuY2UudW5pbnN0YWxsKSB7XG4gICAgICBpbnN0YW5jZS51bmluc3RhbGwoKVxuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gbGlzdC5pbmRleE9mKGluc3RhbmNlKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAxKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVbmluc3RhbGwgYWxsIHBsdWdpbnMgYW5kIGNsb3NlIGRvd24gdGhpcyBVcHB5IGluc3RhbmNlLlxuICAgKi9cbiAgY2xvc2UgKCkge1xuICAgIHRoaXMucmVzZXQoKVxuXG4gICAgdGhpcy5pdGVyYXRlUGx1Z2lucygocGx1Z2luKSA9PiB7XG4gICAgICBwbHVnaW4udW5pbnN0YWxsKClcbiAgICB9KVxuXG4gICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICB0aGlzLnNvY2tldC5jbG9zZSgpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogU2V0IGluZm8gbWVzc2FnZSBpbiBgc3RhdGUuaW5mb2AsIHNvIHRoYXQgVUkgcGx1Z2lucyBsaWtlIGBJbmZvcm1lcmBcbiAgKiBjYW4gZGlzcGxheSB0aGUgbWVzc2FnZVxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IG1zZyBNZXNzYWdlIHRvIGJlIGRpc3BsYXllZCBieSB0aGUgaW5mb3JtZXJcbiAgKi9cblxuICBpbmZvIChtc2csIHR5cGUsIGR1cmF0aW9uKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpbmZvOiB7XG4gICAgICAgIGlzSGlkZGVuOiBmYWxzZSxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgbXNnOiBtc2dcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdjb3JlOmluZm8tdmlzaWJsZScpXG5cbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuaW5mb1RpbWVvdXRJRClcbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgIHRoaXMuaW5mb1RpbWVvdXRJRCA9IHVuZGVmaW5lZFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gaGlkZSB0aGUgaW5mb3JtZXIgYWZ0ZXIgYGR1cmF0aW9uYCBtaWxsaXNlY29uZHNcbiAgICB0aGlzLmluZm9UaW1lb3V0SUQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnN0IG5ld0luZm9ybWVyID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdGF0ZS5pbmZvLCB7XG4gICAgICAgIGlzSGlkZGVuOiB0cnVlXG4gICAgICB9KVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGluZm86IG5ld0luZm9ybWVyXG4gICAgICB9KVxuICAgICAgdGhpcy5lbWl0KCdjb3JlOmluZm8taGlkZGVuJylcbiAgICB9LCBkdXJhdGlvbilcbiAgfVxuXG4gIGhpZGVJbmZvICgpIHtcbiAgICBjb25zdCBuZXdJbmZvID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb3JlLnN0YXRlLmluZm8sIHtcbiAgICAgIGlzSGlkZGVuOiB0cnVlXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGluZm86IG5ld0luZm9cbiAgICB9KVxuICAgIHRoaXMuZW1pdCgnY29yZTppbmZvLWhpZGRlbicpXG4gIH1cblxuICAvKipcbiAgICogTG9ncyBzdHVmZiB0byBjb25zb2xlLCBvbmx5IGlmIGBkZWJ1Z2AgaXMgc2V0IHRvIHRydWUuIFNpbGVudCBpbiBwcm9kdWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd8T2JqZWN0fSB0byBsb2dcbiAgICovXG4gIGxvZyAobXNnLCB0eXBlKSB7XG4gICAgaWYgKCF0aGlzLm9wdHMuZGVidWcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBMT0c6ICR7bXNnfWApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAobXNnID09PSBgJHttc2d9YCkge1xuICAgICAgY29uc29sZS5sb2coYExPRzogJHttc2d9YClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5kaXIobXNnKVxuICAgIH1cblxuICAgIGdsb2JhbC51cHB5TG9nID0gZ2xvYmFsLnVwcHlMb2cgKyAnXFxuJyArICdERUJVRyBMT0c6ICcgKyBtc2dcbiAgfVxuXG4gIGluaXRTb2NrZXQgKG9wdHMpIHtcbiAgICBpZiAoIXRoaXMuc29ja2V0KSB7XG4gICAgICB0aGlzLnNvY2tldCA9IG5ldyBVcHB5U29ja2V0KG9wdHMpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc29ja2V0XG4gIH1cblxuLyoqXG4gKiBJbml0aWFsaXplcyBhY3Rpb25zLCBpbnN0YWxscyBhbGwgcGx1Z2lucyAoYnkgaXRlcmF0aW5nIG9uIHRoZW0gYW5kIGNhbGxpbmcgYGluc3RhbGxgKSwgc2V0cyBvcHRpb25zXG4gKlxuICovXG4gIHJ1biAoKSB7XG4gICAgdGhpcy5sb2coJ0NvcmUgaXMgcnVuLCBpbml0aWFsaXppbmcgYWN0aW9ucy4uLicpXG5cbiAgICB0aGlzLmFjdGlvbnMoKVxuXG4gICAgLy8gRm9yc2Ugc2V0IGBhdXRvUHJvY2VlZGAgb3B0aW9uIHRvIGZhbHNlIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBzZWxlY3RvciBQbHVnaW5zIGFjdGl2ZVxuICAgIC8vIGlmICh0aGlzLnBsdWdpbnMuYWNxdWlyZXIgJiYgdGhpcy5wbHVnaW5zLmFjcXVpcmVyLmxlbmd0aCA+IDEpIHtcbiAgICAvLyAgIHRoaXMub3B0cy5hdXRvUHJvY2VlZCA9IGZhbHNlXG4gICAgLy8gfVxuXG4gICAgLy8gSW5zdGFsbCBhbGwgcGx1Z2luc1xuICAgIC8vIHRoaXMuaW5zdGFsbEFsbCgpXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmUgYW4gdXBsb2FkIGJ5IGl0cyBJRC5cbiAgICovXG4gIHJlc3RvcmUgKHVwbG9hZElEKSB7XG4gICAgdGhpcy5sb2coYENvcmU6IGF0dGVtcHRpbmcgdG8gcmVzdG9yZSB1cGxvYWQgXCIke3VwbG9hZElEfVwiYClcblxuICAgIGlmICghdGhpcy5zdGF0ZS5jdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0pIHtcbiAgICAgIHRoaXMucmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTm9uZXhpc3RlbnQgdXBsb2FkJykpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucnVuVXBsb2FkKHVwbG9hZElEKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiB1cGxvYWQgZm9yIGEgYnVuY2ggb2YgZmlsZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZmlsZUlEcyBGaWxlIElEcyB0byBpbmNsdWRlIGluIHRoaXMgdXBsb2FkLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IElEIG9mIHRoaXMgdXBsb2FkLlxuICAgKi9cbiAgY3JlYXRlVXBsb2FkIChmaWxlSURzKSB7XG4gICAgY29uc3QgdXBsb2FkSUQgPSBjdWlkKClcblxuICAgIHRoaXMuZW1pdCgnY29yZTp1cGxvYWQnLCB7XG4gICAgICBpZDogdXBsb2FkSUQsXG4gICAgICBmaWxlSURzOiBmaWxlSURzXG4gICAgfSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudFVwbG9hZHM6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUuY3VycmVudFVwbG9hZHMsIHtcbiAgICAgICAgW3VwbG9hZElEXToge1xuICAgICAgICAgIGZpbGVJRHM6IGZpbGVJRHMsXG4gICAgICAgICAgc3RlcDogMFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICByZXR1cm4gdXBsb2FkSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gdXBsb2FkLCBlZy4gaWYgaXQgaGFzIGJlZW4gY2FuY2VsZWQgb3IgY29tcGxldGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXBsb2FkSUQgVGhlIElEIG9mIHRoZSB1cGxvYWQuXG4gICAqL1xuICByZW1vdmVVcGxvYWQgKHVwbG9hZElEKSB7XG4gICAgY29uc3QgY3VycmVudFVwbG9hZHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLmN1cnJlbnRVcGxvYWRzKVxuICAgIGRlbGV0ZSBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudFVwbG9hZHM6IGN1cnJlbnRVcGxvYWRzXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYW4gdXBsb2FkLiBUaGlzIHBpY2tzIHVwIHdoZXJlIGl0IGxlZnQgb2ZmIGluIGNhc2UgdGhlIHVwbG9hZCBpcyBiZWluZyByZXN0b3JlZC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJ1blVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCB1cGxvYWREYXRhID0gdGhpcy5zdGF0ZS5jdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgICBjb25zdCBmaWxlSURzID0gdXBsb2FkRGF0YS5maWxlSURzXG4gICAgY29uc3QgcmVzdG9yZVN0ZXAgPSB1cGxvYWREYXRhLnN0ZXBcblxuICAgIGNvbnN0IHN0ZXBzID0gW1xuICAgICAgLi4udGhpcy5wcmVQcm9jZXNzb3JzLFxuICAgICAgLi4udGhpcy51cGxvYWRlcnMsXG4gICAgICAuLi50aGlzLnBvc3RQcm9jZXNzb3JzXG4gICAgXVxuICAgIGxldCBsYXN0U3RlcCA9IFByb21pc2UucmVzb2x2ZSgpXG4gICAgc3RlcHMuZm9yRWFjaCgoZm4sIHN0ZXApID0+IHtcbiAgICAgIC8vIFNraXAgdGhpcyBzdGVwIGlmIHdlIGFyZSByZXN0b3JpbmcgYW5kIGhhdmUgYWxyZWFkeSBjb21wbGV0ZWQgdGhpcyBzdGVwIGJlZm9yZS5cbiAgICAgIGlmIChzdGVwIDwgcmVzdG9yZVN0ZXApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGxhc3RTdGVwID0gbGFzdFN0ZXAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRVcGxvYWQgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSwge1xuICAgICAgICAgIHN0ZXA6IHN0ZXBcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgY3VycmVudFVwbG9hZHM6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUuY3VycmVudFVwbG9hZHMsIHtcbiAgICAgICAgICAgIFt1cGxvYWRJRF06IGN1cnJlbnRVcGxvYWRcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gZm4oZmlsZUlEcylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vIE5vdCByZXR1cm5pbmcgdGhlIGBjYXRjaGBlZCBwcm9taXNlLCBiZWNhdXNlIHdlIHN0aWxsIHdhbnQgdG8gcmV0dXJuIGEgcmVqZWN0ZWRcbiAgICAvLyBwcm9taXNlIGZyb20gdGhpcyBtZXRob2QgaWYgdGhlIHVwbG9hZCBmYWlsZWQuXG4gICAgbGFzdFN0ZXAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgdGhpcy5lbWl0KCdjb3JlOmVycm9yJywgZXJyKVxuXG4gICAgICB0aGlzLnJlbW92ZVVwbG9hZCh1cGxvYWRJRClcbiAgICB9KVxuXG4gICAgcmV0dXJuIGxhc3RTdGVwLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gcmV0dXJuIG51bWJlciBvZiB1cGxvYWRlZCBmaWxlc1xuICAgICAgdGhpcy5lbWl0KCdjb3JlOnN1Y2Nlc3MnLCBmaWxlSURzKVxuXG4gICAgICB0aGlzLnJlbW92ZVVwbG9hZCh1cGxvYWRJRClcbiAgICB9KVxuICB9XG5cbiAgICAvKipcbiAgICogU3RhcnQgYW4gdXBsb2FkIGZvciBhbGwgdGhlIGZpbGVzIHRoYXQgYXJlIG5vdCBjdXJyZW50bHkgYmVpbmcgdXBsb2FkZWQuXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICB1cGxvYWQgKGZvcmNlVXBsb2FkKSB7XG4gICAgY29uc3QgaXNNaW5OdW1iZXJPZkZpbGVzUmVhY2hlZCA9IHRoaXMuY2hlY2tSZXN0cmljdGlvbnModHJ1ZSlcbiAgICBpZiAoIWlzTWluTnVtYmVyT2ZGaWxlc1JlYWNoZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnTWluaW11bSBudW1iZXIgb2YgZmlsZXMgaGFzIG5vdCBiZWVuIHJlYWNoZWQnKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9wdHMub25CZWZvcmVVcGxvYWQodGhpcy5zdGF0ZS5maWxlcykuY2F0Y2goKGVycikgPT4ge1xuICAgICAgdGhpcy5pbmZvKGVyciwgJ2Vycm9yJywgNTAwMClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChgb25CZWZvcmVVcGxvYWQ6ICR7ZXJyfWApXG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICBjb25zdCB3YWl0aW5nRmlsZUlEcyA9IFtdXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLmZpbGVzKS5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuZ2V0RmlsZShmaWxlSUQpXG5cbiAgICAgICAgLy8gVE9ETzogcmVwbGFjZSBmaWxlc1tmaWxlXS5pc1JlbW90ZSB3aXRoIHNvbWUgbG9naWNcbiAgICAgICAgLy9cbiAgICAgICAgLy8gZmlsdGVyIGZpbGVzIHRoYXQgYXJlIG5vdyB5ZXQgYmVpbmcgdXBsb2FkZWQgLyBoYXZlbuKAmXQgYmVlbiB1cGxvYWRlZFxuICAgICAgICAvLyBhbmQgcmVtb3RlIHRvb1xuXG4gICAgICAgIGlmIChmb3JjZVVwbG9hZCkge1xuICAgICAgICAgIHRoaXMucmVzZXRQcm9ncmVzcygpXG4gICAgICAgICAgd2FpdGluZ0ZpbGVJRHMucHVzaChmaWxlLmlkKVxuICAgICAgICB9IGVsc2UgaWYgKCFmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWQgfHwgZmlsZS5pc1JlbW90ZSkge1xuICAgICAgICAgIHdhaXRpbmdGaWxlSURzLnB1c2goZmlsZS5pZClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29uc3QgdXBsb2FkSUQgPSB0aGlzLmNyZWF0ZVVwbG9hZCh3YWl0aW5nRmlsZUlEcylcbiAgICAgIHJldHVybiB0aGlzLnJ1blVwbG9hZCh1cGxvYWRJRClcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdHMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFVwcHkpKSB7XG4gICAgcmV0dXJuIG5ldyBVcHB5KG9wdHMpXG4gIH1cbn1cbiIsIi8qKlxuICogVHJhbnNsYXRlcyBzdHJpbmdzIHdpdGggaW50ZXJwb2xhdGlvbiAmIHBsdXJhbGl6YXRpb24gc3VwcG9ydC5cbiAqIEV4dGVuc2libGUgd2l0aCBjdXN0b20gZGljdGlvbmFyaWVzIGFuZCBwbHVyYWxpemF0aW9uIGZ1bmN0aW9ucy5cbiAqXG4gKiBCb3Jyb3dzIGhlYXZpbHkgZnJvbSBhbmQgaW5zcGlyZWQgYnkgUG9seWdsb3QgaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcyxcbiAqIGJhc2ljYWxseSBhIHN0cmlwcGVkLWRvd24gdmVyc2lvbiBvZiBpdC4gRGlmZmVyZW5jZXM6IHBsdXJhbGl6YXRpb24gZnVuY3Rpb25zIGFyZSBub3QgaGFyZGNvZGVkXG4gKiBhbmQgY2FuIGJlIGVhc2lseSBhZGRlZCBhbW9uZyB3aXRoIGRpY3Rpb25hcmllcywgbmVzdGVkIG9iamVjdHMgYXJlIHVzZWQgZm9yIHBsdXJhbGl6YXRpb25cbiAqIGFzIG9wcG9zZWQgdG8gYHx8fHxgIGRlbGltZXRlclxuICpcbiAqIFVzYWdlIGV4YW1wbGU6IGB0cmFuc2xhdG9yLnRyYW5zbGF0ZSgnZmlsZXNfY2hvc2VuJywge3NtYXJ0X2NvdW50OiAzfSlgXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUcmFuc2xhdG9yIHtcbiAgY29uc3RydWN0b3IgKG9wdHMpIHtcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGxvY2FsZToge1xuICAgICAgICBzdHJpbmdzOiB7fSxcbiAgICAgICAgcGx1cmFsaXplOiBmdW5jdGlvbiAobikge1xuICAgICAgICAgIGlmIChuID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdHMpXG4gICAgdGhpcy5sb2NhbGUgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucy5sb2NhbGUsIG9wdHMubG9jYWxlKVxuXG4gICAgLy8gY29uc29sZS5sb2codGhpcy5vcHRzLmxvY2FsZSlcblxuICAgIC8vIHRoaXMubG9jYWxlLnBsdXJhbGl6ZSA9IHRoaXMubG9jYWxlID8gdGhpcy5sb2NhbGUucGx1cmFsaXplIDogZGVmYXVsdFBsdXJhbGl6ZVxuICAgIC8vIHRoaXMubG9jYWxlLnN0cmluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBlbl9VUy5zdHJpbmdzLCB0aGlzLm9wdHMubG9jYWxlLnN0cmluZ3MpXG4gIH1cblxuLyoqXG4gKiBUYWtlcyBhIHN0cmluZyB3aXRoIHBsYWNlaG9sZGVyIHZhcmlhYmxlcyBsaWtlIGAle3NtYXJ0X2NvdW50fSBmaWxlIHNlbGVjdGVkYFxuICogYW5kIHJlcGxhY2VzIGl0IHdpdGggdmFsdWVzIGZyb20gb3B0aW9ucyBge3NtYXJ0X2NvdW50OiA1fWBcbiAqXG4gKiBAbGljZW5zZSBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqIHRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcy9ibG9iL21hc3Rlci9saWIvcG9seWdsb3QuanMjTDI5OVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwaHJhc2UgdGhhdCBuZWVkcyBpbnRlcnBvbGF0aW9uLCB3aXRoIHBsYWNlaG9sZGVyc1xuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgd2l0aCB2YWx1ZXMgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnNcbiAqIEByZXR1cm4ge3N0cmluZ30gaW50ZXJwb2xhdGVkXG4gKi9cbiAgaW50ZXJwb2xhdGUgKHBocmFzZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHJlcGxhY2UgPSBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2VcbiAgICBjb25zdCBkb2xsYXJSZWdleCA9IC9cXCQvZ1xuICAgIGNvbnN0IGRvbGxhckJpbGxzWWFsbCA9ICckJCQkJ1xuXG4gICAgZm9yIChsZXQgYXJnIGluIG9wdGlvbnMpIHtcbiAgICAgIGlmIChhcmcgIT09ICdfJyAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KGFyZykpIHtcbiAgICAgICAgLy8gRW5zdXJlIHJlcGxhY2VtZW50IHZhbHVlIGlzIGVzY2FwZWQgdG8gcHJldmVudCBzcGVjaWFsICQtcHJlZml4ZWRcbiAgICAgICAgLy8gcmVnZXggcmVwbGFjZSB0b2tlbnMuIHRoZSBcIiQkJCRcIiBpcyBuZWVkZWQgYmVjYXVzZSBlYWNoIFwiJFwiIG5lZWRzIHRvXG4gICAgICAgIC8vIGJlIGVzY2FwZWQgd2l0aCBcIiRcIiBpdHNlbGYsIGFuZCB3ZSBuZWVkIHR3byBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dC5cbiAgICAgICAgdmFyIHJlcGxhY2VtZW50ID0gb3B0aW9uc1thcmddXG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmVwbGFjZW1lbnQgPSByZXBsYWNlLmNhbGwob3B0aW9uc1thcmddLCBkb2xsYXJSZWdleCwgZG9sbGFyQmlsbHNZYWxsKVxuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGNyZWF0ZSBhIG5ldyBgUmVnRXhwYCBlYWNoIHRpbWUgaW5zdGVhZCBvZiB1c2luZyBhIG1vcmUtZWZmaWNpZW50XG4gICAgICAgIC8vIHN0cmluZyByZXBsYWNlIHNvIHRoYXQgdGhlIHNhbWUgYXJndW1lbnQgY2FuIGJlIHJlcGxhY2VkIG11bHRpcGxlIHRpbWVzXG4gICAgICAgIC8vIGluIHRoZSBzYW1lIHBocmFzZS5cbiAgICAgICAgcGhyYXNlID0gcmVwbGFjZS5jYWxsKHBocmFzZSwgbmV3IFJlZ0V4cCgnJVxcXFx7JyArIGFyZyArICdcXFxcfScsICdnJyksIHJlcGxhY2VtZW50KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGhyYXNlXG4gIH1cblxuLyoqXG4gKiBQdWJsaWMgdHJhbnNsYXRlIG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIGxhdGVyIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIHN0cmluZ1xuICogQHJldHVybiB7c3RyaW5nfSB0cmFuc2xhdGVkIChhbmQgaW50ZXJwb2xhdGVkKVxuICovXG4gIHRyYW5zbGF0ZSAoa2V5LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zbWFydF9jb3VudCkge1xuICAgICAgdmFyIHBsdXJhbCA9IHRoaXMubG9jYWxlLnBsdXJhbGl6ZShvcHRpb25zLnNtYXJ0X2NvdW50KVxuICAgICAgcmV0dXJuIHRoaXMuaW50ZXJwb2xhdGUodGhpcy5vcHRzLmxvY2FsZS5zdHJpbmdzW2tleV1bcGx1cmFsXSwgb3B0aW9ucylcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbnRlcnBvbGF0ZSh0aGlzLm9wdHMubG9jYWxlLnN0cmluZ3Nba2V5XSwgb3B0aW9ucylcbiAgfVxufVxuIiwiY29uc3QgZWUgPSByZXF1aXJlKCduYW1lc3BhY2UtZW1pdHRlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVXBweVNvY2tldCB7XG4gIGNvbnN0cnVjdG9yIChvcHRzKSB7XG4gICAgdGhpcy5xdWV1ZWQgPSBbXVxuICAgIHRoaXMuaXNPcGVuID0gZmFsc2VcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQob3B0cy50YXJnZXQpXG4gICAgdGhpcy5lbWl0dGVyID0gZWUoKVxuXG4gICAgdGhpcy5zb2NrZXQub25vcGVuID0gKGUpID0+IHtcbiAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZVxuXG4gICAgICB3aGlsZSAodGhpcy5xdWV1ZWQubGVuZ3RoID4gMCAmJiB0aGlzLmlzT3Blbikge1xuICAgICAgICBjb25zdCBmaXJzdCA9IHRoaXMucXVldWVkWzBdXG4gICAgICAgIHRoaXMuc2VuZChmaXJzdC5hY3Rpb24sIGZpcnN0LnBheWxvYWQpXG4gICAgICAgIHRoaXMucXVldWVkID0gdGhpcy5xdWV1ZWQuc2xpY2UoMSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gKGUpID0+IHtcbiAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9oYW5kbGVNZXNzYWdlID0gdGhpcy5faGFuZGxlTWVzc2FnZS5iaW5kKHRoaXMpXG5cbiAgICB0aGlzLnNvY2tldC5vbm1lc3NhZ2UgPSB0aGlzLl9oYW5kbGVNZXNzYWdlXG5cbiAgICB0aGlzLmNsb3NlID0gdGhpcy5jbG9zZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5lbWl0ID0gdGhpcy5lbWl0LmJpbmQodGhpcylcbiAgICB0aGlzLm9uID0gdGhpcy5vbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5vbmNlID0gdGhpcy5vbmNlLmJpbmQodGhpcylcbiAgICB0aGlzLnNlbmQgPSB0aGlzLnNlbmQuYmluZCh0aGlzKVxuICB9XG5cbiAgY2xvc2UgKCkge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5jbG9zZSgpXG4gIH1cblxuICBzZW5kIChhY3Rpb24sIHBheWxvYWQpIHtcbiAgICAvLyBhdHRhY2ggdXVpZFxuXG4gICAgaWYgKCF0aGlzLmlzT3Blbikge1xuICAgICAgdGhpcy5xdWV1ZWQucHVzaCh7YWN0aW9uLCBwYXlsb2FkfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgYWN0aW9uLFxuICAgICAgcGF5bG9hZFxuICAgIH0pKVxuICB9XG5cbiAgb24gKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIGNvbnNvbGUubG9nKGFjdGlvbilcbiAgICB0aGlzLmVtaXR0ZXIub24oYWN0aW9uLCBoYW5kbGVyKVxuICB9XG5cbiAgZW1pdCAoYWN0aW9uLCBwYXlsb2FkKSB7XG4gICAgY29uc29sZS5sb2coYWN0aW9uKVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KGFjdGlvbiwgcGF5bG9hZClcbiAgfVxuXG4gIG9uY2UgKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuZW1pdHRlci5vbmNlKGFjdGlvbiwgaGFuZGxlcilcbiAgfVxuXG4gIF9oYW5kbGVNZXNzYWdlIChlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSlcbiAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpXG4gICAgICB0aGlzLmVtaXQobWVzc2FnZS5hY3Rpb24sIG1lc3NhZ2UucGF5bG9hZClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICB9XG4gIH1cbn1cbiIsImNvbnN0IHRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLnRocm90dGxlJylcbi8vIHdlIGlubGluZSBmaWxlLXR5cGUgbW9kdWxlLCBhcyBvcHBvc2VkIHRvIHVzaW5nIHRoZSBOUE0gdmVyc2lvbixcbi8vIGJlY2F1c2Ugb2YgdGhpcyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL2ZpbGUtdHlwZS9pc3N1ZXMvNzhcbi8vIGFuZCBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL2NvcHktdGV4dC10by1jbGlwYm9hcmQvaXNzdWVzLzVcbmNvbnN0IGZpbGVUeXBlID0gcmVxdWlyZSgnLi4vdmVuZG9yL2ZpbGUtdHlwZScpXG5cbi8qKlxuICogQSBjb2xsZWN0aW9uIG9mIHNtYWxsIHV0aWxpdHkgZnVuY3Rpb25zIHRoYXQgaGVscCB3aXRoIGRvbSBtYW5pcHVsYXRpb24sIGFkZGluZyBsaXN0ZW5lcnMsXG4gKiBwcm9taXNlcyBhbmQgb3RoZXIgZ29vZCB0aGluZ3MuXG4gKlxuICogQG1vZHVsZSBVdGlsc1xuICovXG5cbi8qKlxuICogU2hhbGxvdyBmbGF0dGVuIG5lc3RlZCBhcnJheXMuXG4gKi9cbmZ1bmN0aW9uIGZsYXR0ZW4gKGFycikge1xuICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCBhcnIpXG59XG5cbmZ1bmN0aW9uIGlzVG91Y2hEZXZpY2UgKCkge1xuICByZXR1cm4gJ29udG91Y2hzdGFydCcgaW4gd2luZG93IHx8IC8vIHdvcmtzIG9uIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgICBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgICAvLyB3b3JrcyBvbiBJRTEwLzExIGFuZCBTdXJmYWNlXG59XG5cbi8vIC8qKlxuLy8gICogU2hvcnRlciBhbmQgZmFzdCB3YXkgdG8gc2VsZWN0IGEgc2luZ2xlIG5vZGUgaW4gdGhlIERPTVxuLy8gICogQHBhcmFtICAgeyBTdHJpbmcgfSBzZWxlY3RvciAtIHVuaXF1ZSBkb20gc2VsZWN0b3Jcbi8vICAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gY3R4IC0gRE9NIG5vZGUgd2hlcmUgdGhlIHRhcmdldCBvZiBvdXIgc2VhcmNoIHdpbGwgaXMgbG9jYXRlZFxuLy8gICogQHJldHVybnMgeyBPYmplY3QgfSBkb20gbm9kZSBmb3VuZFxuLy8gICovXG4vLyBmdW5jdGlvbiAkIChzZWxlY3RvciwgY3R4KSB7XG4vLyAgIHJldHVybiAoY3R4IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuLy8gfVxuXG4vLyAvKipcbi8vICAqIFNob3J0ZXIgYW5kIGZhc3Qgd2F5IHRvIHNlbGVjdCBtdWx0aXBsZSBub2RlcyBpbiB0aGUgRE9NXG4vLyAgKiBAcGFyYW0gICB7IFN0cmluZ3xBcnJheSB9IHNlbGVjdG9yIC0gRE9NIHNlbGVjdG9yIG9yIG5vZGVzIGxpc3Rcbi8vICAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gY3R4IC0gRE9NIG5vZGUgd2hlcmUgdGhlIHRhcmdldHMgb2Ygb3VyIHNlYXJjaCB3aWxsIGlzIGxvY2F0ZWRcbi8vICAqIEByZXR1cm5zIHsgT2JqZWN0IH0gZG9tIG5vZGVzIGZvdW5kXG4vLyAgKi9cbi8vIGZ1bmN0aW9uICQkIChzZWxlY3RvciwgY3R4KSB7XG4vLyAgIHZhciBlbHNcbi8vICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcbi8vICAgICBlbHMgPSAoY3R4IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuLy8gICB9IGVsc2Uge1xuLy8gICAgIGVscyA9IHNlbGVjdG9yXG4vLyAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVscylcbi8vICAgfVxuLy8gfVxuXG5mdW5jdGlvbiB0cnVuY2F0ZVN0cmluZyAoc3RyLCBsZW5ndGgpIHtcbiAgaWYgKHN0ci5sZW5ndGggPiBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyLnN1YnN0cigwLCBsZW5ndGggLyAyKSArICcuLi4nICsgc3RyLnN1YnN0cihzdHIubGVuZ3RoIC0gbGVuZ3RoIC8gNCwgc3RyLmxlbmd0aClcbiAgfVxuICByZXR1cm4gc3RyXG5cbiAgLy8gbW9yZSBwcmVjaXNlIHZlcnNpb24gaWYgbmVlZGVkXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzgzMTU4M1xufVxuXG5mdW5jdGlvbiBzZWNvbmRzVG9UaW1lIChyYXdTZWNvbmRzKSB7XG4gIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihyYXdTZWNvbmRzIC8gMzYwMCkgJSAyNFxuICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcihyYXdTZWNvbmRzIC8gNjApICUgNjBcbiAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IocmF3U2Vjb25kcyAlIDYwKVxuXG4gIHJldHVybiB7IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzIH1cbn1cblxuLyoqXG4gKiBQYXJ0aXRpb24gYXJyYXkgYnkgYSBncm91cGluZyBmdW5jdGlvbi5cbiAqIEBwYXJhbSAge1t0eXBlXX0gYXJyYXkgICAgICBJbnB1dCBhcnJheVxuICogQHBhcmFtICB7W3R5cGVdfSBncm91cGluZ0ZuIEdyb3VwaW5nIGZ1bmN0aW9uXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICAgICAgQXJyYXkgb2YgYXJyYXlzXG4gKi9cbmZ1bmN0aW9uIGdyb3VwQnkgKGFycmF5LCBncm91cGluZ0ZuKSB7XG4gIHJldHVybiBhcnJheS5yZWR1Y2UoKHJlc3VsdCwgaXRlbSkgPT4ge1xuICAgIGxldCBrZXkgPSBncm91cGluZ0ZuKGl0ZW0pXG4gICAgbGV0IHhzID0gcmVzdWx0LmdldChrZXkpIHx8IFtdXG4gICAgeHMucHVzaChpdGVtKVxuICAgIHJlc3VsdC5zZXQoa2V5LCB4cylcbiAgICByZXR1cm4gcmVzdWx0XG4gIH0sIG5ldyBNYXAoKSlcbn1cblxuLyoqXG4gKiBUZXN0cyBpZiBldmVyeSBhcnJheSBlbGVtZW50IHBhc3NlcyBwcmVkaWNhdGVcbiAqIEBwYXJhbSAge0FycmF5fSAgYXJyYXkgICAgICAgSW5wdXQgYXJyYXlcbiAqIEBwYXJhbSAge09iamVjdH0gcHJlZGljYXRlRm4gUHJlZGljYXRlXG4gKiBAcmV0dXJuIHtib29sfSAgICAgICAgICAgICAgIEV2ZXJ5IGVsZW1lbnQgcGFzc1xuICovXG5mdW5jdGlvbiBldmVyeSAoYXJyYXksIHByZWRpY2F0ZUZuKSB7XG4gIHJldHVybiBhcnJheS5yZWR1Y2UoKHJlc3VsdCwgaXRlbSkgPT4ge1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gcHJlZGljYXRlRm4oaXRlbSlcbiAgfSwgdHJ1ZSlcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBsaXN0IGludG8gYXJyYXlcbiovXG5mdW5jdGlvbiB0b0FycmF5IChsaXN0KSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChsaXN0IHx8IFtdLCAwKVxufVxuXG4vKipcbiAqIFRha2VzIGEgZmlsZU5hbWUgYW5kIHR1cm5zIGl0IGludG8gZmlsZUlELCBieSBjb252ZXJ0aW5nIHRvIGxvd2VyY2FzZSxcbiAqIHJlbW92aW5nIGV4dHJhIGNoYXJhY3RlcnMgYW5kIGFkZGluZyB1bml4IHRpbWVzdGFtcFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlTmFtZVxuICpcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVGaWxlSUQgKGZpbGUpIHtcbiAgbGV0IGZpbGVJRCA9IGZpbGUubmFtZS50b0xvd2VyQ2FzZSgpXG4gIGZpbGVJRCA9IGZpbGVJRC5yZXBsYWNlKC9bXkEtWjAtOV0vaWcsICcnKVxuICBmaWxlSUQgPSBmaWxlSUQgKyBmaWxlLmRhdGEubGFzdE1vZGlmaWVkXG4gIHJldHVybiBmaWxlSURcbn1cblxuZnVuY3Rpb24gZXh0ZW5kICguLi5vYmpzKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduLmFwcGx5KHRoaXMsIFt7fV0uY29uY2F0KG9ianMpKVxufVxuXG4vKipcbiAqIFJ1bnMgYW4gYXJyYXkgb2YgcHJvbWlzZS1yZXR1cm5pbmcgZnVuY3Rpb25zIGluIHNlcXVlbmNlLlxuICovXG5mdW5jdGlvbiBydW5Qcm9taXNlU2VxdWVuY2UgKGZ1bmN0aW9ucywgLi4uYXJncykge1xuICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpXG4gIGZ1bmN0aW9ucy5mb3JFYWNoKChmdW5jKSA9PiB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbigoKSA9PiBmdW5jKC4uLmFyZ3MpKVxuICB9KVxuICByZXR1cm4gcHJvbWlzZVxufVxuXG4vKipcbiAqIFRha2VzIGZ1bmN0aW9uIG9yIGNsYXNzLCByZXR1cm5zIGl0cyBuYW1lLlxuICogQmVjYXVzZSBJRSBkb2VzbuKAmXQgc3VwcG9ydCBgY29uc3RydWN0b3IubmFtZWAuXG4gKiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9kZmtheWUvNjM4NDQzOSwgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTU3MTQ0NDVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZm4g4oCUIGZ1bmN0aW9uXG4gKlxuICovXG4vLyBmdW5jdGlvbiBnZXRGbk5hbWUgKGZuKSB7XG4vLyAgIHZhciBmID0gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nXG4vLyAgIHZhciBzID0gZiAmJiAoKGZuLm5hbWUgJiYgWycnLCBmbi5uYW1lXSkgfHwgZm4udG9TdHJpbmcoKS5tYXRjaCgvZnVuY3Rpb24gKFteXFwoXSspLykpXG4vLyAgIHJldHVybiAoIWYgJiYgJ25vdCBhIGZ1bmN0aW9uJykgfHwgKHMgJiYgc1sxXSB8fCAnYW5vbnltb3VzJylcbi8vIH1cblxuZnVuY3Rpb24gaXNQcmV2aWV3U3VwcG9ydGVkIChmaWxlVHlwZVNwZWNpZmljKSB7XG4gIC8vIGxpc3Qgb2YgaW1hZ2VzIHRoYXQgYnJvd3NlcnMgY2FuIHByZXZpZXdcbiAgaWYgKC9eKGpwZWd8Z2lmfHBuZ3xzdmd8c3ZnXFwreG1sfGJtcCkkLy50ZXN0KGZpbGVUeXBlU3BlY2lmaWMpKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gZ2V0QXJyYXlCdWZmZXIgKGNodW5rKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAvLyBlLnRhcmdldC5yZXN1bHQgaXMgYW4gQXJyYXlCdWZmZXJcbiAgICAgIHJlc29sdmUoZS50YXJnZXQucmVzdWx0KVxuICAgIH0pXG4gICAgcmVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRmlsZVJlYWRlciBlcnJvcicgKyBlcnIpXG4gICAgICByZWplY3QoZXJyKVxuICAgIH0pXG4gICAgLy8gZmlsZS10eXBlIG9ubHkgbmVlZHMgdGhlIGZpcnN0IDQxMDAgYnl0ZXNcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoY2h1bmspXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGdldEZpbGVUeXBlIChmaWxlKSB7XG4gIGNvbnN0IGVtcHR5RmlsZVR5cGUgPSBbJycsICcnXVxuICBjb25zdCBleHRlbnNpb25zVG9NaW1lID0ge1xuICAgICdtZCc6ICd0ZXh0L21hcmtkb3duJyxcbiAgICAnbWFya2Rvd24nOiAndGV4dC9tYXJrZG93bicsXG4gICAgJ21wNCc6ICd2aWRlby9tcDQnLFxuICAgICdtcDMnOiAnYXVkaW8vbXAzJ1xuICB9XG5cbiAgLy8gbm8gc21hcnQgZGV0ZWN0aW9uIGZvciByZW1vdGUgZmlsZXMsIGp1c3QgdHJ1c3QgdGhlIHByb3ZpZGVyXG4gIGlmIChmaWxlLmlzUmVtb3RlKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmaWxlLnR5cGUuc3BsaXQoJy8nKSlcbiAgfVxuXG4gIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbihmaWxlLm5hbWUpWzFdXG5cbiAgLy8gMS4gdHJ5IHRvIGRldGVybWluZSBmaWxlIHR5cGUgZnJvbSBtYWdpYyBieXRlcyB3aXRoIGZpbGUtdHlwZSBtb2R1bGVcbiAgLy8gdGhpcyBzaG91bGQgYmUgdGhlIG1vc3QgdHJ1c3R3b3J0aHkgd2F5XG4gIGNvbnN0IGNodW5rID0gZmlsZS5kYXRhLnNsaWNlKDAsIDQxMDApXG4gIHJldHVybiBnZXRBcnJheUJ1ZmZlcihjaHVuaylcbiAgICAudGhlbigoYnVmZmVyKSA9PiB7XG4gICAgICBjb25zdCB0eXBlID0gZmlsZVR5cGUoYnVmZmVyKVxuICAgICAgaWYgKHR5cGUgJiYgdHlwZS5taW1lKSB7XG4gICAgICAgIHJldHVybiB0eXBlLm1pbWUuc3BsaXQoJy8nKVxuICAgICAgfVxuXG4gICAgICAvLyAyLiBpZiB0aGF04oCZcyBubyBnb29kLCBjaGVjayBpZiBtaW1lIHR5cGUgaXMgc2V0IGluIHRoZSBmaWxlIG9iamVjdFxuICAgICAgaWYgKGZpbGUudHlwZSkge1xuICAgICAgICByZXR1cm4gZmlsZS50eXBlLnNwbGl0KCcvJylcbiAgICAgIH1cblxuICAgICAgLy8gMy4gaWYgdGhhdOKAmXMgbm8gZ29vZCwgc2VlIGlmIHdlIGNhbiBtYXAgZXh0ZW5zaW9uIHRvIGEgbWltZSB0eXBlXG4gICAgICBpZiAoZXh0ZW5zaW9uc1RvTWltZVtmaWxlRXh0ZW5zaW9uXSkge1xuICAgICAgICByZXR1cm4gZXh0ZW5zaW9uc1RvTWltZVtmaWxlRXh0ZW5zaW9uXS5zcGxpdCgnLycpXG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGFsbCBmYWlscywgd2VsbCwgcmV0dXJuIGVtcHR5XG4gICAgICByZXR1cm4gZW1wdHlGaWxlVHlwZVxuICAgIH0pXG4gICAgLmNhdGNoKCgpID0+IHtcbiAgICAgIHJldHVybiBlbXB0eUZpbGVUeXBlXG4gICAgfSlcblxuICAgIC8vIGlmIChmaWxlLnR5cGUpIHtcbiAgICAvLyAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmlsZS50eXBlLnNwbGl0KCcvJykpXG4gICAgLy8gfVxuICAgIC8vIHJldHVybiBtaW1lLmxvb2t1cChmaWxlLm5hbWUpXG4gICAgLy8gcmV0dXJuIGZpbGUudHlwZSA/IGZpbGUudHlwZS5zcGxpdCgnLycpIDogWycnLCAnJ11cbn1cblxuLy8gVE9ETyBDaGVjayB3aGljaCB0eXBlcyBhcmUgYWN0dWFsbHkgc3VwcG9ydGVkIGluIGJyb3dzZXJzLiBDaHJvbWUgbGlrZXMgd2VibVxuLy8gZnJvbSBteSB0ZXN0aW5nLCBidXQgd2UgbWF5IG5lZWQgbW9yZS5cbi8vIFdlIGNvdWxkIHVzZSBhIGxpYnJhcnkgYnV0IHRoZXkgdGVuZCB0byBjb250YWluIGRvemVucyBvZiBLQnMgb2YgbWFwcGluZ3MsXG4vLyBtb3N0IG9mIHdoaWNoIHdpbGwgZ28gdW51c2VkLCBzbyBub3Qgc3VyZSBpZiB0aGF0J3Mgd29ydGggaXQuXG5jb25zdCBtaW1lVG9FeHRlbnNpb25zID0ge1xuICAndmlkZW8vb2dnJzogJ29ndicsXG4gICdhdWRpby9vZ2cnOiAnb2dnJyxcbiAgJ3ZpZGVvL3dlYm0nOiAnd2VibScsXG4gICdhdWRpby93ZWJtJzogJ3dlYm0nLFxuICAndmlkZW8vbXA0JzogJ21wNCcsXG4gICdhdWRpby9tcDMnOiAnbXAzJ1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlVHlwZUV4dGVuc2lvbiAobWltZVR5cGUpIHtcbiAgcmV0dXJuIG1pbWVUb0V4dGVuc2lvbnNbbWltZVR5cGVdIHx8IG51bGxcbn1cblxuLy8gcmV0dXJucyBbZmlsZU5hbWUsIGZpbGVFeHRdXG5mdW5jdGlvbiBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbiAoZnVsbEZpbGVOYW1lKSB7XG4gIHZhciByZSA9IC8oPzpcXC4oW14uXSspKT8kL1xuICB2YXIgZmlsZUV4dCA9IHJlLmV4ZWMoZnVsbEZpbGVOYW1lKVsxXVxuICB2YXIgZmlsZU5hbWUgPSBmdWxsRmlsZU5hbWUucmVwbGFjZSgnLicgKyBmaWxlRXh0LCAnJylcbiAgcmV0dXJuIFtmaWxlTmFtZSwgZmlsZUV4dF1cbn1cblxuZnVuY3Rpb24gc3VwcG9ydHNNZWRpYVJlY29yZGVyICgpIHtcbiAgcmV0dXJuIHR5cGVvZiBNZWRpYVJlY29yZGVyID09PSAnZnVuY3Rpb24nICYmICEhTWVkaWFSZWNvcmRlci5wcm90b3R5cGUgJiZcbiAgICB0eXBlb2YgTWVkaWFSZWNvcmRlci5wcm90b3R5cGUuc3RhcnQgPT09ICdmdW5jdGlvbidcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIFVSTCBzdHJpbmcgaXMgYW4gb2JqZWN0IFVSTCBmcm9tIGBVUkwuY3JlYXRlT2JqZWN0VVJMYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc09iamVjdFVSTCAodXJsKSB7XG4gIHJldHVybiB1cmwuaW5kZXhPZignYmxvYjonKSA9PT0gMFxufVxuXG5mdW5jdGlvbiBnZXRQcm9wb3J0aW9uYWxIZWlnaHQgKGltZywgd2lkdGgpIHtcbiAgY29uc3QgYXNwZWN0ID0gaW1nLndpZHRoIC8gaW1nLmhlaWdodFxuICByZXR1cm4gTWF0aC5yb3VuZCh3aWR0aCAvIGFzcGVjdClcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB0aHVtYm5haWwgZm9yIHRoZSBnaXZlbiBVcHB5IGZpbGUgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7e2RhdGE6IEJsb2J9fSBmaWxlXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAqIEByZXR1cm4ge1Byb21pc2V9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRodW1ibmFpbCAoZmlsZSwgdGFyZ2V0V2lkdGgpIHtcbiAgY29uc3Qgb3JpZ2luYWxVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUuZGF0YSlcblxuICBjb25zdCBvbmxvYWQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxuICAgIGltYWdlLnNyYyA9IG9yaWdpbmFsVXJsXG4gICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChvcmlnaW5hbFVybClcbiAgICAgIHJlc29sdmUoaW1hZ2UpXG4gICAgfVxuICAgIGltYWdlLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAvLyBUaGUgb25lcnJvciBldmVudCBpcyB0b3RhbGx5IHVzZWxlc3MgdW5mb3J0dW5hdGVseSwgYXMgZmFyIGFzIEkga25vd1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChvcmlnaW5hbFVybClcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NvdWxkIG5vdCBjcmVhdGUgdGh1bWJuYWlsJykpXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBvbmxvYWQudGhlbigoaW1hZ2UpID0+IHtcbiAgICBjb25zdCB0YXJnZXRIZWlnaHQgPSBnZXRQcm9wb3J0aW9uYWxIZWlnaHQoaW1hZ2UsIHRhcmdldFdpZHRoKVxuICAgIGNvbnN0IGNhbnZhcyA9IHJlc2l6ZUltYWdlKGltYWdlLCB0YXJnZXRXaWR0aCwgdGFyZ2V0SGVpZ2h0KVxuICAgIHJldHVybiBjYW52YXNUb0Jsb2IoY2FudmFzLCAnaW1hZ2UvanBlZycpXG4gIH0pLnRoZW4oKGJsb2IpID0+IHtcbiAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuICB9KVxufVxuXG4vKipcbiAqIFJlc2l6ZSBhbiBpbWFnZSB0byB0aGUgdGFyZ2V0IGB3aWR0aGAgYW5kIGBoZWlnaHRgLlxuICpcbiAqIFJldHVybnMgYSBDYW52YXMgd2l0aCB0aGUgcmVzaXplZCBpbWFnZSBvbiBpdC5cbiAqL1xuZnVuY3Rpb24gcmVzaXplSW1hZ2UgKGltYWdlLCB0YXJnZXRXaWR0aCwgdGFyZ2V0SGVpZ2h0KSB7XG4gIGxldCBzb3VyY2VXaWR0aCA9IGltYWdlLndpZHRoXG4gIGxldCBzb3VyY2VIZWlnaHQgPSBpbWFnZS5oZWlnaHRcblxuICBpZiAodGFyZ2V0SGVpZ2h0IDwgaW1hZ2UuaGVpZ2h0IC8gMikge1xuICAgIGNvbnN0IHN0ZXBzID0gTWF0aC5mbG9vcihNYXRoLmxvZyhpbWFnZS53aWR0aCAvIHRhcmdldFdpZHRoKSAvIE1hdGgubG9nKDIpKVxuICAgIGNvbnN0IHN0ZXBTY2FsZWQgPSBkb3duU2NhbGVJblN0ZXBzKGltYWdlLCBzdGVwcylcbiAgICBpbWFnZSA9IHN0ZXBTY2FsZWQuaW1hZ2VcbiAgICBzb3VyY2VXaWR0aCA9IHN0ZXBTY2FsZWQuc291cmNlV2lkdGhcbiAgICBzb3VyY2VIZWlnaHQgPSBzdGVwU2NhbGVkLnNvdXJjZUhlaWdodFxuICB9XG5cbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgY2FudmFzLndpZHRoID0gdGFyZ2V0V2lkdGhcbiAgY2FudmFzLmhlaWdodCA9IHRhcmdldEhlaWdodFxuXG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICBjb250ZXh0LmRyYXdJbWFnZShpbWFnZSxcbiAgICAwLCAwLCBzb3VyY2VXaWR0aCwgc291cmNlSGVpZ2h0LFxuICAgIDAsIDAsIHRhcmdldFdpZHRoLCB0YXJnZXRIZWlnaHQpXG5cbiAgcmV0dXJuIGNhbnZhc1xufVxuXG4vKipcbiAqIERvd25zY2FsZSBhbiBpbWFnZSBieSA1MCUgYHN0ZXBzYCB0aW1lcy5cbiAqL1xuZnVuY3Rpb24gZG93blNjYWxlSW5TdGVwcyAoaW1hZ2UsIHN0ZXBzKSB7XG4gIGxldCBzb3VyY2UgPSBpbWFnZVxuICBsZXQgY3VycmVudFdpZHRoID0gc291cmNlLndpZHRoXG4gIGxldCBjdXJyZW50SGVpZ2h0ID0gc291cmNlLmhlaWdodFxuXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICBjYW52YXMud2lkdGggPSBjdXJyZW50V2lkdGggLyAyXG4gIGNhbnZhcy5oZWlnaHQgPSBjdXJyZW50SGVpZ2h0IC8gMlxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RlcHM7IGkgKz0gMSkge1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKHNvdXJjZSxcbiAgICAgIC8vIFRoZSBlbnRpcmUgc291cmNlIGltYWdlLiBXZSBwYXNzIHdpZHRoIGFuZCBoZWlnaHQgaGVyZSxcbiAgICAgIC8vIGJlY2F1c2Ugd2UgcmV1c2UgdGhpcyBjYW52YXMsIGFuZCBzaG91bGQgb25seSBzY2FsZSBkb3duXG4gICAgICAvLyB0aGUgcGFydCBvZiB0aGUgY2FudmFzIHRoYXQgY29udGFpbnMgdGhlIHByZXZpb3VzIHNjYWxlIHN0ZXAuXG4gICAgICAwLCAwLCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQsXG4gICAgICAvLyBEcmF3IHRvIDUwJSBzaXplXG4gICAgICAwLCAwLCBjdXJyZW50V2lkdGggLyAyLCBjdXJyZW50SGVpZ2h0IC8gMilcbiAgICBjdXJyZW50V2lkdGggLz0gMlxuICAgIGN1cnJlbnRIZWlnaHQgLz0gMlxuICAgIHNvdXJjZSA9IGNhbnZhc1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbWFnZTogY2FudmFzLFxuICAgIHNvdXJjZVdpZHRoOiBjdXJyZW50V2lkdGgsXG4gICAgc291cmNlSGVpZ2h0OiBjdXJyZW50SGVpZ2h0XG4gIH1cbn1cblxuLyoqXG4gKiBTYXZlIGEgPGNhbnZhcz4gZWxlbWVudCdzIGNvbnRlbnQgdG8gYSBCbG9iIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXNcbiAqIEByZXR1cm4ge1Byb21pc2V9XG4gKi9cbmZ1bmN0aW9uIGNhbnZhc1RvQmxvYiAoY2FudmFzLCB0eXBlLCBxdWFsaXR5KSB7XG4gIGlmIChjYW52YXMudG9CbG9iKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjYW52YXMudG9CbG9iKHJlc29sdmUsIHR5cGUsIHF1YWxpdHkpXG4gICAgfSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgcmV0dXJuIGRhdGFVUkl0b0Jsb2IoY2FudmFzLnRvRGF0YVVSTCh0eXBlLCBxdWFsaXR5KSwge30pXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGRhdGFVUkl0b0Jsb2IgKGRhdGFVUkksIG9wdHMsIHRvRmlsZSkge1xuICAvLyBnZXQgdGhlIGJhc2U2NCBkYXRhXG4gIHZhciBkYXRhID0gZGF0YVVSSS5zcGxpdCgnLCcpWzFdXG5cbiAgLy8gdXNlciBtYXkgcHJvdmlkZSBtaW1lIHR5cGUsIGlmIG5vdCBnZXQgaXQgZnJvbSBkYXRhIFVSSVxuICB2YXIgbWltZVR5cGUgPSBvcHRzLm1pbWVUeXBlIHx8IGRhdGFVUkkuc3BsaXQoJywnKVswXS5zcGxpdCgnOicpWzFdLnNwbGl0KCc7JylbMF1cblxuICAvLyBkZWZhdWx0IHRvIHBsYWluL3RleHQgaWYgZGF0YSBVUkkgaGFzIG5vIG1pbWVUeXBlXG4gIGlmIChtaW1lVHlwZSA9PSBudWxsKSB7XG4gICAgbWltZVR5cGUgPSAncGxhaW4vdGV4dCdcbiAgfVxuXG4gIHZhciBiaW5hcnkgPSBhdG9iKGRhdGEpXG4gIHZhciBhcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyYXkucHVzaChiaW5hcnkuY2hhckNvZGVBdChpKSlcbiAgfVxuXG4gIC8vIENvbnZlcnQgdG8gYSBGaWxlP1xuICBpZiAodG9GaWxlKSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlKFtuZXcgVWludDhBcnJheShhcnJheSldLCBvcHRzLm5hbWUgfHwgJycsIHt0eXBlOiBtaW1lVHlwZX0pXG4gIH1cblxuICByZXR1cm4gbmV3IEJsb2IoW25ldyBVaW50OEFycmF5KGFycmF5KV0sIHt0eXBlOiBtaW1lVHlwZX0pXG59XG5cbmZ1bmN0aW9uIGRhdGFVUkl0b0ZpbGUgKGRhdGFVUkksIG9wdHMpIHtcbiAgcmV0dXJuIGRhdGFVUkl0b0Jsb2IoZGF0YVVSSSwgb3B0cywgdHJ1ZSlcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGV4dCB0byBjbGlwYm9hcmQgYnkgY3JlYXRpbmcgYW4gYWxtb3N0IGludmlzaWJsZSB0ZXh0YXJlYSxcbiAqIGFkZGluZyB0ZXh0IHRoZXJlLCB0aGVuIHJ1bm5pbmcgZXhlY0NvbW1hbmQoJ2NvcHknKS5cbiAqIEZhbGxzIGJhY2sgdG8gcHJvbXB0KCkgd2hlbiB0aGUgZWFzeSB3YXkgZmFpbHMgKGhlbGxvLCBTYWZhcmkhKVxuICogRnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMDgxMDMyMlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0VG9Db3B5XG4gKiBAcGFyYW0ge1N0cmluZ30gZmFsbGJhY2tTdHJpbmdcbiAqIEByZXR1cm4ge1Byb21pc2V9XG4gKi9cbmZ1bmN0aW9uIGNvcHlUb0NsaXBib2FyZCAodGV4dFRvQ29weSwgZmFsbGJhY2tTdHJpbmcpIHtcbiAgZmFsbGJhY2tTdHJpbmcgPSBmYWxsYmFja1N0cmluZyB8fCAnQ29weSB0aGUgVVJMIGJlbG93J1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdGV4dEFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gICAgdGV4dEFyZWEuc2V0QXR0cmlidXRlKCdzdHlsZScsIHtcbiAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgdG9wOiAwLFxuICAgICAgbGVmdDogMCxcbiAgICAgIHdpZHRoOiAnMmVtJyxcbiAgICAgIGhlaWdodDogJzJlbScsXG4gICAgICBwYWRkaW5nOiAwLFxuICAgICAgYm9yZGVyOiAnbm9uZScsXG4gICAgICBvdXRsaW5lOiAnbm9uZScsXG4gICAgICBib3hTaGFkb3c6ICdub25lJyxcbiAgICAgIGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCdcbiAgICB9KVxuXG4gICAgdGV4dEFyZWEudmFsdWUgPSB0ZXh0VG9Db3B5XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0QXJlYSlcbiAgICB0ZXh0QXJlYS5zZWxlY3QoKVxuXG4gICAgY29uc3QgbWFnaWNDb3B5RmFpbGVkID0gKGVycikgPT4ge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0ZXh0QXJlYSlcbiAgICAgIHdpbmRvdy5wcm9tcHQoZmFsbGJhY2tTdHJpbmcsIHRleHRUb0NvcHkpXG4gICAgICByZXR1cm4gcmVqZWN0KCdPb3BzLCB1bmFibGUgdG8gY29weSBkaXNwbGF5ZWQgZmFsbGJhY2sgcHJvbXB0OiAnICsgZXJyKVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdWNjZXNzZnVsID0gZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICAgICAgaWYgKCFzdWNjZXNzZnVsKSB7XG4gICAgICAgIHJldHVybiBtYWdpY0NvcHlGYWlsZWQoJ2NvcHkgY29tbWFuZCB1bmF2YWlsYWJsZScpXG4gICAgICB9XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRleHRBcmVhKVxuICAgICAgcmV0dXJuIHJlc29sdmUoKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0ZXh0QXJlYSlcbiAgICAgIHJldHVybiBtYWdpY0NvcHlGYWlsZWQoZXJyKVxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0U3BlZWQgKGZpbGVQcm9ncmVzcykge1xuICBpZiAoIWZpbGVQcm9ncmVzcy5ieXRlc1VwbG9hZGVkKSByZXR1cm4gMFxuXG4gIGNvbnN0IHRpbWVFbGFwc2VkID0gKG5ldyBEYXRlKCkpIC0gZmlsZVByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgY29uc3QgdXBsb2FkU3BlZWQgPSBmaWxlUHJvZ3Jlc3MuYnl0ZXNVcGxvYWRlZCAvICh0aW1lRWxhcHNlZCAvIDEwMDApXG4gIHJldHVybiB1cGxvYWRTcGVlZFxufVxuXG5mdW5jdGlvbiBnZXRCeXRlc1JlbWFpbmluZyAoZmlsZVByb2dyZXNzKSB7XG4gIHJldHVybiBmaWxlUHJvZ3Jlc3MuYnl0ZXNUb3RhbCAtIGZpbGVQcm9ncmVzcy5ieXRlc1VwbG9hZGVkXG59XG5cbmZ1bmN0aW9uIGdldEVUQSAoZmlsZVByb2dyZXNzKSB7XG4gIGlmICghZmlsZVByb2dyZXNzLmJ5dGVzVXBsb2FkZWQpIHJldHVybiAwXG5cbiAgY29uc3QgdXBsb2FkU3BlZWQgPSBnZXRTcGVlZChmaWxlUHJvZ3Jlc3MpXG4gIGNvbnN0IGJ5dGVzUmVtYWluaW5nID0gZ2V0Qnl0ZXNSZW1haW5pbmcoZmlsZVByb2dyZXNzKVxuICBjb25zdCBzZWNvbmRzUmVtYWluaW5nID0gTWF0aC5yb3VuZChieXRlc1JlbWFpbmluZyAvIHVwbG9hZFNwZWVkICogMTApIC8gMTBcblxuICByZXR1cm4gc2Vjb25kc1JlbWFpbmluZ1xufVxuXG5mdW5jdGlvbiBwcmV0dHlFVEEgKHNlY29uZHMpIHtcbiAgY29uc3QgdGltZSA9IHNlY29uZHNUb1RpbWUoc2Vjb25kcylcblxuICAvLyBPbmx5IGRpc3BsYXkgaG91cnMgYW5kIG1pbnV0ZXMgaWYgdGhleSBhcmUgZ3JlYXRlciB0aGFuIDAgYnV0IGFsd2F5c1xuICAvLyBkaXNwbGF5IG1pbnV0ZXMgaWYgaG91cnMgaXMgYmVpbmcgZGlzcGxheWVkXG4gIC8vIERpc3BsYXkgYSBsZWFkaW5nIHplcm8gaWYgdGhlIHRoZXJlIGlzIGEgcHJlY2VkaW5nIHVuaXQ6IDFtIDA1cywgYnV0IDVzXG4gIGNvbnN0IGhvdXJzU3RyID0gdGltZS5ob3VycyA/IHRpbWUuaG91cnMgKyAnaCAnIDogJydcbiAgY29uc3QgbWludXRlc1ZhbCA9IHRpbWUuaG91cnMgPyAoJzAnICsgdGltZS5taW51dGVzKS5zdWJzdHIoLTIpIDogdGltZS5taW51dGVzXG4gIGNvbnN0IG1pbnV0ZXNTdHIgPSBtaW51dGVzVmFsID8gbWludXRlc1ZhbCArICdtICcgOiAnJ1xuICBjb25zdCBzZWNvbmRzVmFsID0gbWludXRlc1ZhbCA/ICgnMCcgKyB0aW1lLnNlY29uZHMpLnN1YnN0cigtMikgOiB0aW1lLnNlY29uZHNcbiAgY29uc3Qgc2Vjb25kc1N0ciA9IHNlY29uZHNWYWwgKyAncydcblxuICByZXR1cm4gYCR7aG91cnNTdHJ9JHttaW51dGVzU3RyfSR7c2Vjb25kc1N0cn1gXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gb2JqZWN0IGlzIGEgRE9NIGVsZW1lbnQuIER1Y2stdHlwaW5nIGJhc2VkIG9uIGBub2RlVHlwZWAuXG4gKlxuICogQHBhcmFtIHsqfSBvYmpcbiAqL1xuZnVuY3Rpb24gaXNET01FbGVtZW50IChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmoubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFXG59XG5cbi8qKlxuICogRmluZCBhIERPTSBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7Tm9kZXxzdHJpbmd9IGVsZW1lbnRcbiAqIEByZXR1cm4ge05vZGV8bnVsbH1cbiAqL1xuZnVuY3Rpb24gZmluZERPTUVsZW1lbnQgKGVsZW1lbnQpIHtcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpXG4gIH1cblxuICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdvYmplY3QnICYmIGlzRE9NRWxlbWVudChlbGVtZW50KSkge1xuICAgIHJldHVybiBlbGVtZW50XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U29ja2V0SG9zdCAodXJsKSB7XG4gIC8vIGdldCB0aGUgaG9zdCBkb21haW5cbiAgdmFyIHJlZ2V4ID0gL14oPzpodHRwcz86XFwvXFwvfFxcL1xcLyk/KD86W15AXFxuXStAKT8oPzp3d3dcXC4pPyhbXlxcbl0rKS9cbiAgdmFyIGhvc3QgPSByZWdleC5leGVjKHVybClbMV1cbiAgdmFyIHNvY2tldFByb3RvY29sID0gbG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonID8gJ3dzcycgOiAnd3MnXG5cbiAgcmV0dXJuIGAke3NvY2tldFByb3RvY29sfTovLyR7aG9zdH1gXG59XG5cbmZ1bmN0aW9uIF9lbWl0U29ja2V0UHJvZ3Jlc3MgKHVwbG9hZGVyLCBwcm9ncmVzc0RhdGEsIGZpbGUpIHtcbiAgY29uc3Qge3Byb2dyZXNzLCBieXRlc1VwbG9hZGVkLCBieXRlc1RvdGFsfSA9IHByb2dyZXNzRGF0YVxuICBpZiAocHJvZ3Jlc3MpIHtcbiAgICB1cGxvYWRlci5jb3JlLmxvZyhgVXBsb2FkIHByb2dyZXNzOiAke3Byb2dyZXNzfWApXG4gICAgdXBsb2FkZXIuY29yZS5lbWl0dGVyLmVtaXQoJ2NvcmU6dXBsb2FkLXByb2dyZXNzJywge1xuICAgICAgdXBsb2FkZXIsXG4gICAgICBpZDogZmlsZS5pZCxcbiAgICAgIGJ5dGVzVXBsb2FkZWQ6IGJ5dGVzVXBsb2FkZWQsXG4gICAgICBieXRlc1RvdGFsOiBieXRlc1RvdGFsXG4gICAgfSlcbiAgfVxufVxuXG5jb25zdCBlbWl0U29ja2V0UHJvZ3Jlc3MgPSB0aHJvdHRsZShfZW1pdFNvY2tldFByb2dyZXNzLCAzMDAsIHtsZWFkaW5nOiB0cnVlLCB0cmFpbGluZzogdHJ1ZX0pXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZW5lcmF0ZUZpbGVJRCxcbiAgdG9BcnJheSxcbiAgZXZlcnksXG4gIGZsYXR0ZW4sXG4gIGdyb3VwQnksXG4gIGV4dGVuZCxcbiAgcnVuUHJvbWlzZVNlcXVlbmNlLFxuICBzdXBwb3J0c01lZGlhUmVjb3JkZXIsXG4gIGlzVG91Y2hEZXZpY2UsXG4gIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uLFxuICB0cnVuY2F0ZVN0cmluZyxcbiAgZ2V0RmlsZVR5cGVFeHRlbnNpb24sXG4gIGdldEZpbGVUeXBlLFxuICBnZXRBcnJheUJ1ZmZlcixcbiAgaXNQcmV2aWV3U3VwcG9ydGVkLFxuICBpc09iamVjdFVSTCxcbiAgY3JlYXRlVGh1bWJuYWlsLFxuICBzZWNvbmRzVG9UaW1lLFxuICBkYXRhVVJJdG9CbG9iLFxuICBkYXRhVVJJdG9GaWxlLFxuICBnZXRTcGVlZCxcbiAgZ2V0Qnl0ZXNSZW1haW5pbmcsXG4gIGdldEVUQSxcbiAgY29weVRvQ2xpcGJvYXJkLFxuICBwcmV0dHlFVEEsXG4gIGZpbmRET01FbGVtZW50LFxuICBnZXRTb2NrZXRIb3N0LFxuICBlbWl0U29ja2V0UHJvZ3Jlc3Ncbn1cbiIsImNvbnN0IGh0bWwgPSByZXF1aXJlKCd5by15bycpXG5jb25zdCBvbmxvYWQgPSByZXF1aXJlKCdvbi1sb2FkJylcbmNvbnN0IExvYWRlclZpZXcgPSByZXF1aXJlKCcuL0xvYWRlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IGRlbW9MaW5rID0gcHJvcHMuZGVtbyA/IGh0bWxgPGJ1dHRvbiBjbGFzcz1cIlVwcHlQcm92aWRlci1hdXRoQnRuRGVtb1wiIG9uY2xpY2s9JHtwcm9wcy5oYW5kbGVEZW1vQXV0aH0+UHJvY2VlZCB3aXRoIERlbW8gQWNjb3VudDwvYnV0dG9uPmAgOiBudWxsXG4gIGNvbnN0IEF1dGhCbG9jayA9ICgpID0+IGh0bWxgXG4gICAgPGRpdiBjbGFzcz1cIlVwcHlQcm92aWRlci1hdXRoXCI+XG4gICAgICA8aDEgY2xhc3M9XCJVcHB5UHJvdmlkZXItYXV0aFRpdGxlXCI+UGxlYXNlIGF1dGhlbnRpY2F0ZSB3aXRoIDxzcGFuIGNsYXNzPVwiVXBweVByb3ZpZGVyLWF1dGhUaXRsZU5hbWVcIj4ke3Byb3BzLnBsdWdpbk5hbWV9PC9zcGFuPjxicj4gdG8gc2VsZWN0IGZpbGVzPC9oMT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiVXBweVByb3ZpZGVyLWF1dGhCdG5cIiBvbmNsaWNrPSR7cHJvcHMuaGFuZGxlQXV0aH0+QXV0aGVudGljYXRlPC9idXR0b24+XG4gICAgICAke2RlbW9MaW5rfVxuICAgIDwvZGl2PlxuICBgXG4gIHJldHVybiBvbmxvYWQoaHRtbGBcbiAgICA8ZGl2IHN0eWxlPVwiaGVpZ2h0OiAxMDAlO1wiPlxuICAgICAgJHtwcm9wcy5jaGVja0F1dGhJblByb2dyZXNzXG4gICAgICAgID8gTG9hZGVyVmlldygpXG4gICAgICAgIDogQXV0aEJsb2NrKClcbiAgICAgIH1cbiAgICA8L2Rpdj5gLCBwcm9wcy5jaGVja0F1dGgsIG51bGwsIGBhdXRoJHtwcm9wcy5wbHVnaW5OYW1lfWApXG59XG4iLCJjb25zdCBodG1sID0gcmVxdWlyZSgneW8teW8nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChwcm9wcykgPT4ge1xuICByZXR1cm4gaHRtbGBcbiAgICA8bGk+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbmNsaWNrPSR7cHJvcHMuZ2V0Rm9sZGVyfT4ke3Byb3BzLnRpdGxlfTwvYnV0dG9uPlxuICAgIDwvbGk+XG4gIGBcbn1cbiIsImNvbnN0IGh0bWwgPSByZXF1aXJlKCd5by15bycpXG5jb25zdCBCcmVhZGNydW1iID0gcmVxdWlyZSgnLi9CcmVhZGNydW1iJylcblxubW9kdWxlLmV4cG9ydHMgPSAocHJvcHMpID0+IHtcbiAgcmV0dXJuIGh0bWxgXG4gICAgPHVsIGNsYXNzPVwiVXBweVByb3ZpZGVyLWJyZWFkY3J1bWJzXCI+XG4gICAgICAke1xuICAgICAgICBwcm9wcy5kaXJlY3Rvcmllcy5tYXAoKGRpcmVjdG9yeSwgaSkgPT4ge1xuICAgICAgICAgIHJldHVybiBCcmVhZGNydW1iKHtcbiAgICAgICAgICAgIGdldEZvbGRlcjogKCkgPT4gcHJvcHMuZ2V0Rm9sZGVyKGRpcmVjdG9yeS5pZCksXG4gICAgICAgICAgICB0aXRsZTogaSA9PT0gMCA/IHByb3BzLnRpdGxlIDogZGlyZWN0b3J5LnRpdGxlXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICA8L3VsPlxuICBgXG59XG4iLCJjb25zdCBodG1sID0gcmVxdWlyZSgneW8teW8nKVxuY29uc3QgQnJlYWRjcnVtYnMgPSByZXF1aXJlKCcuL0JyZWFkY3J1bWJzJylcbmNvbnN0IFRhYmxlID0gcmVxdWlyZSgnLi9UYWJsZScpXG5cbm1vZHVsZS5leHBvcnRzID0gKHByb3BzKSA9PiB7XG4gIGxldCBmaWx0ZXJlZEZvbGRlcnMgPSBwcm9wcy5mb2xkZXJzXG4gIGxldCBmaWx0ZXJlZEZpbGVzID0gcHJvcHMuZmlsZXNcblxuICBpZiAocHJvcHMuZmlsdGVySW5wdXQgIT09ICcnKSB7XG4gICAgZmlsdGVyZWRGb2xkZXJzID0gcHJvcHMuZmlsdGVySXRlbXMocHJvcHMuZm9sZGVycylcbiAgICBmaWx0ZXJlZEZpbGVzID0gcHJvcHMuZmlsdGVySXRlbXMocHJvcHMuZmlsZXMpXG4gIH1cblxuICByZXR1cm4gaHRtbGBcbiAgICA8ZGl2IGNsYXNzPVwiQnJvd3NlciBCcm93c2VyLXZpZXdUeXBlLS0ke3Byb3BzLnZpZXdUeXBlfVwiPlxuICAgICAgPGhlYWRlciBjbGFzcz1cIkJyb3dzZXItaGVhZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJCcm93c2VyLXNlYXJjaFwiIGFyaWEtaGlkZGVuPVwiJHshcHJvcHMuaXNTZWFyY2hWaXNpYmxlfVwiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiQnJvd3Nlci1zZWFyY2hJbnB1dFwiIHBsYWNlaG9sZGVyPVwiU2VhcmNoXCJcbiAgICAgICAgICAgICAgICAgb25rZXl1cD0ke3Byb3BzLmZpbHRlclF1ZXJ5fSB2YWx1ZT1cIiR7cHJvcHMuZmlsdGVySW5wdXR9XCIvPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiQnJvd3Nlci1zZWFyY2hDbG9zZVwiIFxuICAgICAgICAgICAgICAgICAgb25jbGljaz0ke3Byb3BzLnRvZ2dsZVNlYXJjaH0+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwiVXBweUljb25cIiB2aWV3Qm94PVwiMCAwIDE5IDE5XCI+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTcuMzE4IDE3LjIzMkw5Ljk0IDkuODU0IDkuNTg2IDkuNWwtLjM1NC4zNTQtNy4zNzggNy4zNzhoLjcwN2wtLjYyLS42MnYuNzA2TDkuMzE4IDkuOTRsLjM1NC0uMzU0LS4zNTQtLjM1NEwxLjk0IDEuODU0di43MDdsLjYyLS42MmgtLjcwNmw3LjM3OCA3LjM3OC4zNTQuMzU0LjM1NC0uMzU0IDcuMzc4LTcuMzc4aC0uNzA3bC42MjIuNjJ2LS43MDZMOS44NTQgOS4yMzJsLS4zNTQuMzU0LjM1NC4zNTQgNy4zNzggNy4zNzguNzA4LS43MDctNy4zOC03LjM3OHYuNzA4bDcuMzgtNy4zOC4zNTMtLjM1My0uMzUzLS4zNTMtLjYyMi0uNjIyLS4zNTMtLjM1My0uMzU0LjM1Mi03LjM3OCA3LjM4aC43MDhMMi41NiAxLjIzIDIuMjA4Ljg4bC0uMzUzLjM1My0uNjIyLjYyLS4zNTMuMzU1LjM1Mi4zNTMgNy4zOCA3LjM4di0uNzA4bC03LjM4IDcuMzgtLjM1My4zNTMuMzUyLjM1My42MjIuNjIyLjM1My4zNTMuMzU0LS4zNTMgNy4zOC03LjM4aC0uNzA4bDcuMzggNy4zOHpcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJCcm93c2VyLWhlYWRlckJhclwiPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiQnJvd3Nlci1zZWFyY2hUb2dnbGVcIlxuICAgICAgICAgICAgICAgICAgb25jbGljaz0ke3Byb3BzLnRvZ2dsZVNlYXJjaH0+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzPVwiVXBweUljb25cIiB2aWV3Qm94PVwiMCAwIDEwMCAxMDBcIj5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIk04Ny41MzMgODAuMDNMNjIuOTQyIDU1LjQzOWMzLjMyNC00LjU4NyA1LjMxMi0xMC4yMDcgNS4zMTItMTYuMjk1IDAtLjMxMi0uMDQzLS42MTEtLjA5Mi0uOTA4LjA1LS4zMDEuMDkzLS42MDUuMDkzLS45MjIgMC0xNS4zNi0xMi40OTctMjcuODU3LTI3Ljg1Ny0yNy44NTctLjI3MyAwLS41MzYuMDQzLS43OTkuMDgtLjI2NS0uMDM3LS41MjYtLjA4LS43OTktLjA4LTE1LjM2MSAwLTI3Ljg1OCAxMi40OTctMjcuODU4IDI3Ljg1NyAwIC4zMTIuMDQyLjYxMS4wOTIuOTA5YTUuNDY2IDUuNDY2IDAgMCAwLS4wOTMuOTIxYzAgMTUuMzYgMTIuNDk2IDI3Ljg1OCAyNy44NTcgMjcuODU4LjI3MyAwIC41MzUtLjA0My44LS4wODEuMjYzLjAzOC41MjQuMDgxLjc5OC4wODEgNS4yMDggMCAxMC4wNzEtMS40NjQgMTQuMjQ1LTMuOTYzTDc5LjU4MiA4Ny45OGE1LjYwMyA1LjYwMyAwIDAgMCAzLjk3NiAxLjY0NyA1LjYyMSA1LjYyMSAwIDAgMCAzLjk3NS05LjU5N3pNMzkuNTk4IDU1LjgzOGMtLjI2NS0uMDM4LS41MjYtLjA4MS0uOC0uMDgxLTkuMTYgMC0xNi42MTItNy40NTItMTYuNjEyLTE2LjYxMiAwLS4zMTItLjA0Mi0uNjExLS4wOTItLjkwOC4wNTEtLjMwMS4wOTMtLjYwNS4wOTMtLjkyMiAwLTkuMTYgNy40NTMtMTYuNjEyIDE2LjYxMy0xNi42MTIuMjcyIDAgLjUzNC0uMDQyLjc5OS0uMDc5LjI2My4wMzcuNTI1LjA3OS43OTkuMDc5IDkuMTYgMCAxNi42MTIgNy40NTIgMTYuNjEyIDE2LjYxMiAwIC4zMTIuMDQzLjYxMS4wOTIuOTA5LS4wNS4zMDEtLjA5NC42MDQtLjA5NC45MjEgMCA5LjE2LTcuNDUyIDE2LjYxMi0xNi42MTIgMTYuNjEyLS4yNzQgMC0uNTM2LjA0My0uNzk4LjA4MXpcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAke0JyZWFkY3J1bWJzKHtcbiAgICAgICAgICAgIGdldEZvbGRlcjogcHJvcHMuZ2V0Rm9sZGVyLFxuICAgICAgICAgICAgZGlyZWN0b3JpZXM6IHByb3BzLmRpcmVjdG9yaWVzLFxuICAgICAgICAgICAgdGl0bGU6IHByb3BzLnRpdGxlXG4gICAgICAgICAgfSl9XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25jbGljaz0ke3Byb3BzLmxvZ291dH0gY2xhc3M9XCJCcm93c2VyLXVzZXJMb2dvdXRcIj5Mb2cgb3V0PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9oZWFkZXI+XG4gICAgICA8ZGl2IGNsYXNzPVwiQnJvd3Nlci1ib2R5XCI+XG4gICAgICAgICR7VGFibGUoe1xuICAgICAgICAgIGNvbHVtbnM6IFt7XG4gICAgICAgICAgICBuYW1lOiAnTmFtZScsXG4gICAgICAgICAgICBrZXk6ICd0aXRsZSdcbiAgICAgICAgICB9XSxcbiAgICAgICAgICBmb2xkZXJzOiBmaWx0ZXJlZEZvbGRlcnMsXG4gICAgICAgICAgZmlsZXM6IGZpbHRlcmVkRmlsZXMsXG4gICAgICAgICAgYWN0aXZlUm93OiBwcm9wcy5pc0FjdGl2ZVJvdyxcbiAgICAgICAgICBzb3J0QnlUaXRsZTogcHJvcHMuc29ydEJ5VGl0bGUsXG4gICAgICAgICAgc29ydEJ5RGF0ZTogcHJvcHMuc29ydEJ5RGF0ZSxcbiAgICAgICAgICBoYW5kbGVGaWxlQ2xpY2s6IHByb3BzLmFkZEZpbGUsXG4gICAgICAgICAgaGFuZGxlRm9sZGVyQ2xpY2s6IHByb3BzLmdldE5leHRGb2xkZXIsXG4gICAgICAgICAgZ2V0SXRlbU5hbWU6IHByb3BzLmdldEl0ZW1OYW1lLFxuICAgICAgICAgIGdldEl0ZW1JY29uOiBwcm9wcy5nZXRJdGVtSWNvbixcbiAgICAgICAgICBoYW5kbGVTY3JvbGw6IHByb3BzLmhhbmRsZVNjcm9sbFxuICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgXG59XG4iLCJjb25zdCBodG1sID0gcmVxdWlyZSgneW8teW8nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChwcm9wcykgPT4ge1xuICByZXR1cm4gaHRtbGBcbiAgICA8ZGl2IGNsYXNzPVwiVXBweVByb3ZpZGVyLWxvYWRpbmdcIj5cbiAgICAgIDxzcGFuPkxvYWRpbmcuLi48L3NwYW4+XG4gICAgPC9kaXY+XG4gIGBcbn1cbiIsImNvbnN0IGh0bWwgPSByZXF1aXJlKCd5by15bycpXG5jb25zdCBSb3cgPSByZXF1aXJlKCcuL1RhYmxlUm93JylcblxubW9kdWxlLmV4cG9ydHMgPSAocHJvcHMpID0+IHtcbiAgLy8gY29uc3QgaGVhZGVycyA9IHByb3BzLmNvbHVtbnMubWFwKChjb2x1bW4pID0+IHtcbiAgLy8gICByZXR1cm4gaHRtbGBcbiAgLy8gICAgIDx0aCBjbGFzcz1cIkJyb3dzZXJUYWJsZS1oZWFkZXJDb2x1bW4gQnJvd3NlclRhYmxlLWNvbHVtblwiIG9uY2xpY2s9JHtwcm9wcy5zb3J0QnlUaXRsZX0+XG4gIC8vICAgICAgICR7Y29sdW1uLm5hbWV9XG4gIC8vICAgICA8L3RoPlxuICAvLyAgIGBcbiAgLy8gfSlcblxuICAvLyA8dGhlYWQgY2xhc3M9XCJCcm93c2VyVGFibGUtaGVhZGVyXCI+XG4gIC8vICAgPHRyPiR7aGVhZGVyc308L3RyPlxuICAvLyA8L3RoZWFkPlxuXG4gIHJldHVybiBodG1sYFxuICAgIDx0YWJsZSBjbGFzcz1cIkJyb3dzZXJUYWJsZVwiIG9uc2Nyb2xsPSR7cHJvcHMuaGFuZGxlU2Nyb2xsfT5cbiAgICAgIDx0Ym9keT5cbiAgICAgICAgJHtwcm9wcy5mb2xkZXJzLm1hcCgoZm9sZGVyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIFJvdyh7XG4gICAgICAgICAgICB0aXRsZTogcHJvcHMuZ2V0SXRlbU5hbWUoZm9sZGVyKSxcbiAgICAgICAgICAgIGFjdGl2ZTogcHJvcHMuYWN0aXZlUm93KGZvbGRlciksXG4gICAgICAgICAgICBnZXRJdGVtSWNvbjogKCkgPT4gcHJvcHMuZ2V0SXRlbUljb24oZm9sZGVyKSxcbiAgICAgICAgICAgIGhhbmRsZUNsaWNrOiAoKSA9PiBwcm9wcy5oYW5kbGVGb2xkZXJDbGljayhmb2xkZXIpLFxuICAgICAgICAgICAgY29sdW1uczogcHJvcHMuY29sdW1uc1xuICAgICAgICAgIH0pXG4gICAgICAgIH0pfVxuICAgICAgICAke3Byb3BzLmZpbGVzLm1hcCgoZmlsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiBSb3coe1xuICAgICAgICAgICAgdGl0bGU6IHByb3BzLmdldEl0ZW1OYW1lKGZpbGUpLFxuICAgICAgICAgICAgYWN0aXZlOiBwcm9wcy5hY3RpdmVSb3coZmlsZSksXG4gICAgICAgICAgICBnZXRJdGVtSWNvbjogKCkgPT4gcHJvcHMuZ2V0SXRlbUljb24oZmlsZSksXG4gICAgICAgICAgICBoYW5kbGVDbGljazogKCkgPT4gcHJvcHMuaGFuZGxlRmlsZUNsaWNrKGZpbGUpLFxuICAgICAgICAgICAgY29sdW1uczogcHJvcHMuY29sdW1uc1xuICAgICAgICAgIH0pXG4gICAgICAgIH0pfVxuICAgICAgPC90Ym9keT5cbiAgICA8L3RhYmxlPlxuICBgXG59XG4iLCJjb25zdCBodG1sID0gcmVxdWlyZSgneW8teW8nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChwcm9wcykgPT4ge1xuICByZXR1cm4gaHRtbGBcbiAgICA8dGQgY2xhc3M9XCJCcm93c2VyVGFibGUtcm93Q29sdW1uIEJyb3dzZXJUYWJsZS1jb2x1bW5cIj5cbiAgICAgICR7cHJvcHMuZ2V0SXRlbUljb24oKX0gJHtwcm9wcy52YWx1ZX1cbiAgICA8L3RkPlxuICBgXG59XG4iLCJjb25zdCBodG1sID0gcmVxdWlyZSgneW8teW8nKVxuY29uc3QgQ29sdW1uID0gcmVxdWlyZSgnLi9UYWJsZUNvbHVtbicpXG5cbm1vZHVsZS5leHBvcnRzID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IGNsYXNzZXMgPSBwcm9wcy5hY3RpdmUgPyAnQnJvd3NlclRhYmxlLXJvdyBpcy1hY3RpdmUnIDogJ0Jyb3dzZXJUYWJsZS1yb3cnXG4gIHJldHVybiBodG1sYFxuICAgIDx0ciBvbmNsaWNrPSR7cHJvcHMuaGFuZGxlQ2xpY2t9IGNsYXNzPSR7Y2xhc3Nlc30+XG4gICAgICAke0NvbHVtbih7XG4gICAgICAgIGdldEl0ZW1JY29uOiBwcm9wcy5nZXRJdGVtSWNvbixcbiAgICAgICAgdmFsdWU6IHByb3BzLnRpdGxlXG4gICAgICB9KX1cbiAgICA8L3RyPlxuICBgXG59XG4iLCJjb25zdCBBdXRoVmlldyA9IHJlcXVpcmUoJy4vQXV0aFZpZXcnKVxuY29uc3QgQnJvd3NlciA9IHJlcXVpcmUoJy4vQnJvd3NlcicpXG5jb25zdCBMb2FkZXJWaWV3ID0gcmVxdWlyZSgnLi9Mb2FkZXInKVxuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuLi9jb3JlL1V0aWxzJylcblxuLyoqXG4gKiBDbGFzcyB0byBlYXNpbHkgZ2VuZXJhdGUgZ2VuZXJpYyB2aWV3cyBmb3IgcGx1Z2luc1xuICpcbiAqIFRoaXMgY2xhc3MgZXhwZWN0cyB0aGUgcGx1Z2luIHVzaW5nIHRvIGhhdmUgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzXG4gKlxuICogc3RhdGVJZCB7U3RyaW5nfSBvYmplY3Qga2V5IG9mIHdoaWNoIHRoZSBwbHVnaW4gc3RhdGUgaXMgc3RvcmVkXG4gKlxuICogVGhpcyBjbGFzcyBhbHNvIGV4cGVjdHMgdGhlIHBsdWdpbiBpbnN0YW5jZSB1c2luZyBpdCB0byBoYXZlIHRoZSBmb2xsb3dpbmdcbiAqIGFjY2Vzc29yIG1ldGhvZHMuXG4gKiBFYWNoIG1ldGhvZCB0YWtlcyB0aGUgaXRlbSB3aG9zZSBwcm9wZXJ0eSBpcyB0byBiZSBhY2Nlc3NlZFxuICogYXMgYSBwYXJhbVxuICpcbiAqIGlzRm9sZGVyXG4gKiAgICBAcmV0dXJuIHtCb29sZWFufSBmb3IgaWYgdGhlIGl0ZW0gaXMgYSBmb2xkZXIgb3Igbm90XG4gKiBnZXRJdGVtRGF0YVxuICogICAgQHJldHVybiB7T2JqZWN0fSB0aGF0IGlzIGZvcm1hdCByZWFkeSBmb3IgdXBweSB1cGxvYWQvZG93bmxvYWRcbiAqIGdldEl0ZW1JY29uXG4gKiAgICBAcmV0dXJuIHtPYmplY3R9IGh0bWwgaW5zdGFuY2Ugb2YgdGhlIGl0ZW0ncyBpY29uXG4gKiBnZXRJdGVtU3ViTGlzdFxuICogICAgQHJldHVybiB7QXJyYXl9IHN1Yi1pdGVtcyBpbiB0aGUgaXRlbS4gZS5nIGEgZm9sZGVyIG1heSBjb250YWluIHN1Yi1pdGVtc1xuICogZ2V0SXRlbU5hbWVcbiAqICAgIEByZXR1cm4ge1N0cmluZ30gZGlzcGxheSBmcmllbmRseSBuYW1lIG9mIHRoZSBpdGVtXG4gKiBnZXRNaW1lVHlwZVxuICogICAgQHJldHVybiB7U3RyaW5nfSBtaW1lIHR5cGUgb2YgdGhlIGl0ZW1cbiAqIGdldEl0ZW1JZFxuICogICAgQHJldHVybiB7U3RyaW5nfSB1bmlxdWUgaWQgb2YgdGhlIGl0ZW1cbiAqIGdldEl0ZW1SZXF1ZXN0UGF0aFxuICogICAgQHJldHVybiB7U3RyaW5nfSB1bmlxdWUgcmVxdWVzdCBwYXRoIG9mIHRoZSBpdGVtIHdoZW4gbWFraW5nIGNhbGxzIHRvIHVwcHkgc2VydmVyXG4gKiBnZXRJdGVtTW9kaWZpZWREYXRlXG4gKiAgICBAcmV0dXJuIHtvYmplY3R9IG9yIHtTdHJpbmd9IGRhdGUgb2Ygd2hlbiBsYXN0IHRoZSBpdGVtIHdhcyBtb2RpZmllZFxuICogZ2V0SXRlbVRodW1ibmFpbFVybFxuICogICAgQHJldHVybiB7U3RyaW5nfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFZpZXcge1xuICAvKipcbiAgICogQHBhcmFtIHtvYmplY3R9IGluc3RhbmNlIG9mIHRoZSBwbHVnaW5cbiAgICovXG4gIGNvbnN0cnVjdG9yIChwbHVnaW4sIG9wdHMpIHtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpblxuICAgIHRoaXMuUHJvdmlkZXIgPSBwbHVnaW5bcGx1Z2luLmlkXVxuXG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgdmlld1R5cGU6ICdsaXN0J1xuICAgIH1cblxuICAgIC8vIG1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdHMpXG5cbiAgICAvLyBMb2dpY1xuICAgIHRoaXMuYWRkRmlsZSA9IHRoaXMuYWRkRmlsZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5maWx0ZXJJdGVtcyA9IHRoaXMuZmlsdGVySXRlbXMuYmluZCh0aGlzKVxuICAgIHRoaXMuZmlsdGVyUXVlcnkgPSB0aGlzLmZpbHRlclF1ZXJ5LmJpbmQodGhpcylcbiAgICB0aGlzLnRvZ2dsZVNlYXJjaCA9IHRoaXMudG9nZ2xlU2VhcmNoLmJpbmQodGhpcylcbiAgICB0aGlzLmdldEZvbGRlciA9IHRoaXMuZ2V0Rm9sZGVyLmJpbmQodGhpcylcbiAgICB0aGlzLmdldE5leHRGb2xkZXIgPSB0aGlzLmdldE5leHRGb2xkZXIuYmluZCh0aGlzKVxuICAgIHRoaXMubG9nb3V0ID0gdGhpcy5sb2dvdXQuYmluZCh0aGlzKVxuICAgIHRoaXMuY2hlY2tBdXRoID0gdGhpcy5jaGVja0F1dGguYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlQXV0aCA9IHRoaXMuaGFuZGxlQXV0aC5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVEZW1vQXV0aCA9IHRoaXMuaGFuZGxlRGVtb0F1dGguYmluZCh0aGlzKVxuICAgIHRoaXMuc29ydEJ5VGl0bGUgPSB0aGlzLnNvcnRCeVRpdGxlLmJpbmQodGhpcylcbiAgICB0aGlzLnNvcnRCeURhdGUgPSB0aGlzLnNvcnRCeURhdGUuYmluZCh0aGlzKVxuICAgIHRoaXMuaXNBY3RpdmVSb3cgPSB0aGlzLmlzQWN0aXZlUm93LmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZUVycm9yID0gdGhpcy5oYW5kbGVFcnJvci5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVTY3JvbGwgPSB0aGlzLmhhbmRsZVNjcm9sbC5iaW5kKHRoaXMpXG5cbiAgICAvLyBWaXN1YWxcbiAgICB0aGlzLnJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcylcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXR0bGUgc2hvcnRoYW5kIHRvIHVwZGF0ZSB0aGUgc3RhdGUgd2l0aCB0aGUgcGx1Z2luJ3Mgc3RhdGVcbiAgICovXG4gIHVwZGF0ZVN0YXRlIChuZXdTdGF0ZSkge1xuICAgIGxldCBzdGF0ZUlkID0gdGhpcy5wbHVnaW4uc3RhdGVJZFxuICAgIGNvbnN0IHtzdGF0ZX0gPSB0aGlzLnBsdWdpbi5jb3JlXG5cbiAgICB0aGlzLnBsdWdpbi5jb3JlLnNldFN0YXRlKHtbc3RhdGVJZF06IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlW3N0YXRlSWRdLCBuZXdTdGF0ZSl9KVxuICB9XG5cbiAgX3VwZGF0ZUZpbGVzQW5kRm9sZGVycyAocmVzLCBmaWxlcywgZm9sZGVycykge1xuICAgIHRoaXMucGx1Z2luLmdldEl0ZW1TdWJMaXN0KHJlcykuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaWYgKHRoaXMucGx1Z2luLmlzRm9sZGVyKGl0ZW0pKSB7XG4gICAgICAgIGZvbGRlcnMucHVzaChpdGVtKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmlsZXMucHVzaChpdGVtKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnVwZGF0ZVN0YXRlKHsgZm9sZGVycywgZmlsZXMgfSlcbiAgfVxuXG4gIGNoZWNrQXV0aCAoKSB7XG4gICAgdGhpcy51cGRhdGVTdGF0ZSh7IGNoZWNrQXV0aEluUHJvZ3Jlc3M6IHRydWUgfSlcbiAgICB0aGlzLlByb3ZpZGVyLmNoZWNrQXV0aCgpXG4gICAgICAudGhlbigoYXV0aGVudGljYXRlZCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKHsgY2hlY2tBdXRoSW5Qcm9ncmVzczogZmFsc2UgfSlcbiAgICAgICAgdGhpcy5wbHVnaW4ub25BdXRoKGF1dGhlbnRpY2F0ZWQpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSh7IGNoZWNrQXV0aEluUHJvZ3Jlc3M6IGZhbHNlIH0pXG4gICAgICAgIHRoaXMuaGFuZGxlRXJyb3IoZXJyKVxuICAgICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBCYXNlZCBvbiBmb2xkZXIgSUQsIGZldGNoIGEgbmV3IGZvbGRlciBhbmQgdXBkYXRlIGl0IHRvIHN0YXRlXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWQgRm9sZGVyIGlkXG4gICAqIEByZXR1cm4ge1Byb21pc2V9ICAgRm9sZGVycy9maWxlcyBpbiBmb2xkZXJcbiAgICovXG4gIGdldEZvbGRlciAoaWQsIG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fbG9hZGVyV3JhcHBlcihcbiAgICAgIHRoaXMuUHJvdmlkZXIubGlzdChpZCksXG4gICAgICAocmVzKSA9PiB7XG4gICAgICAgIGxldCBmb2xkZXJzID0gW11cbiAgICAgICAgbGV0IGZpbGVzID0gW11cbiAgICAgICAgbGV0IHVwZGF0ZWREaXJlY3Rvcmllc1xuXG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5wbHVnaW4uY29yZS5nZXRTdGF0ZSgpW3RoaXMucGx1Z2luLnN0YXRlSWRdXG4gICAgICAgIGNvbnN0IGluZGV4ID0gc3RhdGUuZGlyZWN0b3JpZXMuZmluZEluZGV4KChkaXIpID0+IGlkID09PSBkaXIuaWQpXG5cbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIHVwZGF0ZWREaXJlY3RvcmllcyA9IHN0YXRlLmRpcmVjdG9yaWVzLnNsaWNlKDAsIGluZGV4ICsgMSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1cGRhdGVkRGlyZWN0b3JpZXMgPSBzdGF0ZS5kaXJlY3Rvcmllcy5jb25jYXQoW3tpZCwgdGl0bGU6IG5hbWUgfHwgdGhpcy5wbHVnaW4uZ2V0SXRlbU5hbWUocmVzKX1dKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlRmlsZXNBbmRGb2xkZXJzKHJlcywgZmlsZXMsIGZvbGRlcnMpXG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoeyBkaXJlY3RvcmllczogdXBkYXRlZERpcmVjdG9yaWVzIH0pXG4gICAgICB9LFxuICAgICAgdGhpcy5oYW5kbGVFcnJvcilcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIG5ldyBmb2xkZXJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBGb2xkZXJcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0aXRsZSBGb2xkZXIgdGl0bGVcbiAgICovXG4gIGdldE5leHRGb2xkZXIgKGZvbGRlcikge1xuICAgIGxldCBpZCA9IHRoaXMucGx1Z2luLmdldEl0ZW1SZXF1ZXN0UGF0aChmb2xkZXIpXG4gICAgdGhpcy5nZXRGb2xkZXIoaWQsIHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZvbGRlcikpXG4gIH1cblxuICBhZGRGaWxlIChmaWxlKSB7XG4gICAgY29uc3QgdGFnRmlsZSA9IHtcbiAgICAgIHNvdXJjZTogdGhpcy5wbHVnaW4uaWQsXG4gICAgICBkYXRhOiB0aGlzLnBsdWdpbi5nZXRJdGVtRGF0YShmaWxlKSxcbiAgICAgIG5hbWU6IHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZpbGUpIHx8IHRoaXMucGx1Z2luLmdldEl0ZW1JZChmaWxlKSxcbiAgICAgIHR5cGU6IHRoaXMucGx1Z2luLmdldE1pbWVUeXBlKGZpbGUpLFxuICAgICAgaXNSZW1vdGU6IHRydWUsXG4gICAgICBib2R5OiB7XG4gICAgICAgIGZpbGVJZDogdGhpcy5wbHVnaW4uZ2V0SXRlbUlkKGZpbGUpXG4gICAgICB9LFxuICAgICAgcmVtb3RlOiB7XG4gICAgICAgIGhvc3Q6IHRoaXMucGx1Z2luLm9wdHMuaG9zdCxcbiAgICAgICAgdXJsOiBgJHt0aGlzLlByb3ZpZGVyLmZpbGVVcmwodGhpcy5wbHVnaW4uZ2V0SXRlbVJlcXVlc3RQYXRoKGZpbGUpKX1gLFxuICAgICAgICBib2R5OiB7XG4gICAgICAgICAgZmlsZUlkOiB0aGlzLnBsdWdpbi5nZXRJdGVtSWQoZmlsZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIFV0aWxzLmdldEZpbGVUeXBlKHRhZ0ZpbGUpLnRoZW4oZmlsZVR5cGUgPT4ge1xuICAgICAgaWYgKFV0aWxzLmlzUHJldmlld1N1cHBvcnRlZChmaWxlVHlwZVsxXSkpIHtcbiAgICAgICAgdGFnRmlsZS5wcmV2aWV3ID0gdGhpcy5wbHVnaW4uZ2V0SXRlbVRodW1ibmFpbFVybChmaWxlKVxuICAgICAgfVxuICAgICAgdGhpcy5wbHVnaW4uY29yZS5sb2coJ0FkZGluZyByZW1vdGUgZmlsZScpXG4gICAgICB0aGlzLnBsdWdpbi5jb3JlLmFkZEZpbGUodGFnRmlsZSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgc2Vzc2lvbiB0b2tlbiBvbiBjbGllbnQgc2lkZS5cbiAgICovXG4gIGxvZ291dCAoKSB7XG4gICAgdGhpcy5Qcm92aWRlci5sb2dvdXQobG9jYXRpb24uaHJlZilcbiAgICAgIC50aGVuKChyZXMpID0+IHJlcy5qc29uKCkpXG4gICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXMub2spIHtcbiAgICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgZmlsZXM6IFtdLFxuICAgICAgICAgICAgZm9sZGVyczogW10sXG4gICAgICAgICAgICBkaXJlY3RvcmllczogW11cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZShuZXdTdGF0ZSlcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2godGhpcy5oYW5kbGVFcnJvcilcbiAgfVxuXG4gIGZpbHRlclF1ZXJ5IChlKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnBsdWdpbi5jb3JlLmdldFN0YXRlKClbdGhpcy5wbHVnaW4uc3RhdGVJZF1cbiAgICB0aGlzLnVwZGF0ZVN0YXRlKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICBmaWx0ZXJJbnB1dDogZS50YXJnZXQudmFsdWVcbiAgICB9KSlcbiAgfVxuXG4gIHRvZ2dsZVNlYXJjaCAoKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnBsdWdpbi5jb3JlLmdldFN0YXRlKClbdGhpcy5wbHVnaW4uc3RhdGVJZF1cbiAgICBjb25zdCBzZWFyY2hJbnB1dEVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLkJyb3dzZXItc2VhcmNoSW5wdXQnKVxuXG4gICAgdGhpcy51cGRhdGVTdGF0ZShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgaXNTZWFyY2hWaXNpYmxlOiAhc3RhdGUuaXNTZWFyY2hWaXNpYmxlLFxuICAgICAgZmlsdGVySW5wdXQ6ICcnXG4gICAgfSkpXG5cbiAgICBzZWFyY2hJbnB1dEVsLnZhbHVlID0gJydcbiAgICBpZiAoIXN0YXRlLmlzU2VhcmNoVmlzaWJsZSkge1xuICAgICAgc2VhcmNoSW5wdXRFbC5mb2N1cygpXG4gICAgfVxuICB9XG5cbiAgZmlsdGVySXRlbXMgKGl0ZW1zKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnBsdWdpbi5jb3JlLmdldFN0YXRlKClbdGhpcy5wbHVnaW4uc3RhdGVJZF1cbiAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChmb2xkZXIpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnBsdWdpbi5nZXRJdGVtTmFtZShmb2xkZXIpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzdGF0ZS5maWx0ZXJJbnB1dC50b0xvd2VyQ2FzZSgpKSAhPT0gLTFcbiAgICB9KVxuICB9XG5cbiAgc29ydEJ5VGl0bGUgKCkge1xuICAgIGNvbnN0IHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wbHVnaW4uY29yZS5nZXRTdGF0ZSgpW3RoaXMucGx1Z2luLnN0YXRlSWRdKVxuICAgIGNvbnN0IHtmaWxlcywgZm9sZGVycywgc29ydGluZ30gPSBzdGF0ZVxuXG4gICAgbGV0IHNvcnRlZEZpbGVzID0gZmlsZXMuc29ydCgoZmlsZUEsIGZpbGVCKSA9PiB7XG4gICAgICBpZiAoc29ydGluZyA9PT0gJ3RpdGxlRGVzY2VuZGluZycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZpbGVCKS5sb2NhbGVDb21wYXJlKHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZpbGVBKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnBsdWdpbi5nZXRJdGVtTmFtZShmaWxlQSkubG9jYWxlQ29tcGFyZSh0aGlzLnBsdWdpbi5nZXRJdGVtTmFtZShmaWxlQikpXG4gICAgfSlcblxuICAgIGxldCBzb3J0ZWRGb2xkZXJzID0gZm9sZGVycy5zb3J0KChmb2xkZXJBLCBmb2xkZXJCKSA9PiB7XG4gICAgICBpZiAoc29ydGluZyA9PT0gJ3RpdGxlRGVzY2VuZGluZycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZvbGRlckIpLmxvY2FsZUNvbXBhcmUodGhpcy5wbHVnaW4uZ2V0SXRlbU5hbWUoZm9sZGVyQSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5wbHVnaW4uZ2V0SXRlbU5hbWUoZm9sZGVyQSkubG9jYWxlQ29tcGFyZSh0aGlzLnBsdWdpbi5nZXRJdGVtTmFtZShmb2xkZXJCKSlcbiAgICB9KVxuXG4gICAgdGhpcy51cGRhdGVTdGF0ZShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgZmlsZXM6IHNvcnRlZEZpbGVzLFxuICAgICAgZm9sZGVyczogc29ydGVkRm9sZGVycyxcbiAgICAgIHNvcnRpbmc6IChzb3J0aW5nID09PSAndGl0bGVEZXNjZW5kaW5nJykgPyAndGl0bGVBc2NlbmRpbmcnIDogJ3RpdGxlRGVzY2VuZGluZydcbiAgICB9KSlcbiAgfVxuXG4gIHNvcnRCeURhdGUgKCkge1xuICAgIGNvbnN0IHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wbHVnaW4uY29yZS5nZXRTdGF0ZSgpW3RoaXMucGx1Z2luLnN0YXRlSWRdKVxuICAgIGNvbnN0IHtmaWxlcywgZm9sZGVycywgc29ydGluZ30gPSBzdGF0ZVxuXG4gICAgbGV0IHNvcnRlZEZpbGVzID0gZmlsZXMuc29ydCgoZmlsZUEsIGZpbGVCKSA9PiB7XG4gICAgICBsZXQgYSA9IG5ldyBEYXRlKHRoaXMucGx1Z2luLmdldEl0ZW1Nb2RpZmllZERhdGUoZmlsZUEpKVxuICAgICAgbGV0IGIgPSBuZXcgRGF0ZSh0aGlzLnBsdWdpbi5nZXRJdGVtTW9kaWZpZWREYXRlKGZpbGVCKSlcblxuICAgICAgaWYgKHNvcnRpbmcgPT09ICdkYXRlRGVzY2VuZGluZycpIHtcbiAgICAgICAgcmV0dXJuIGEgPiBiID8gLTEgOiBhIDwgYiA/IDEgOiAwXG4gICAgICB9XG4gICAgICByZXR1cm4gYSA+IGIgPyAxIDogYSA8IGIgPyAtMSA6IDBcbiAgICB9KVxuXG4gICAgbGV0IHNvcnRlZEZvbGRlcnMgPSBmb2xkZXJzLnNvcnQoKGZvbGRlckEsIGZvbGRlckIpID0+IHtcbiAgICAgIGxldCBhID0gbmV3IERhdGUodGhpcy5wbHVnaW4uZ2V0SXRlbU1vZGlmaWVkRGF0ZShmb2xkZXJBKSlcbiAgICAgIGxldCBiID0gbmV3IERhdGUodGhpcy5wbHVnaW4uZ2V0SXRlbU1vZGlmaWVkRGF0ZShmb2xkZXJCKSlcblxuICAgICAgaWYgKHNvcnRpbmcgPT09ICdkYXRlRGVzY2VuZGluZycpIHtcbiAgICAgICAgcmV0dXJuIGEgPiBiID8gLTEgOiBhIDwgYiA/IDEgOiAwXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhID4gYiA/IDEgOiBhIDwgYiA/IC0xIDogMFxuICAgIH0pXG5cbiAgICB0aGlzLnVwZGF0ZVN0YXRlKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICBmaWxlczogc29ydGVkRmlsZXMsXG4gICAgICBmb2xkZXJzOiBzb3J0ZWRGb2xkZXJzLFxuICAgICAgc29ydGluZzogKHNvcnRpbmcgPT09ICdkYXRlRGVzY2VuZGluZycpID8gJ2RhdGVBc2NlbmRpbmcnIDogJ2RhdGVEZXNjZW5kaW5nJ1xuICAgIH0pKVxuICB9XG5cbiAgc29ydEJ5U2l6ZSAoKSB7XG4gICAgY29uc3Qgc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnBsdWdpbi5jb3JlLmdldFN0YXRlKClbdGhpcy5wbHVnaW4uc3RhdGVJZF0pXG4gICAgY29uc3Qge2ZpbGVzLCBzb3J0aW5nfSA9IHN0YXRlXG5cbiAgICAvLyBjaGVjayB0aGF0IHBsdWdpbiBzdXBwb3J0cyBmaWxlIHNpemVzXG4gICAgaWYgKCFmaWxlcy5sZW5ndGggfHwgIXRoaXMucGx1Z2luLmdldEl0ZW1EYXRhKGZpbGVzWzBdKS5zaXplKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgc29ydGVkRmlsZXMgPSBmaWxlcy5zb3J0KChmaWxlQSwgZmlsZUIpID0+IHtcbiAgICAgIGxldCBhID0gdGhpcy5wbHVnaW4uZ2V0SXRlbURhdGEoZmlsZUEpLnNpemVcbiAgICAgIGxldCBiID0gdGhpcy5wbHVnaW4uZ2V0SXRlbURhdGEoZmlsZUIpLnNpemVcblxuICAgICAgaWYgKHNvcnRpbmcgPT09ICdzaXplRGVzY2VuZGluZycpIHtcbiAgICAgICAgcmV0dXJuIGEgPiBiID8gLTEgOiBhIDwgYiA/IDEgOiAwXG4gICAgICB9XG4gICAgICByZXR1cm4gYSA+IGIgPyAxIDogYSA8IGIgPyAtMSA6IDBcbiAgICB9KVxuXG4gICAgdGhpcy51cGRhdGVTdGF0ZShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgZmlsZXM6IHNvcnRlZEZpbGVzLFxuICAgICAgc29ydGluZzogKHNvcnRpbmcgPT09ICdzaXplRGVzY2VuZGluZycpID8gJ3NpemVBc2NlbmRpbmcnIDogJ3NpemVEZXNjZW5kaW5nJ1xuICAgIH0pKVxuICB9XG5cbiAgaXNBY3RpdmVSb3cgKGZpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5wbHVnaW4uY29yZS5nZXRTdGF0ZSgpW3RoaXMucGx1Z2luLnN0YXRlSWRdLmFjdGl2ZVJvdyA9PT0gdGhpcy5wbHVnaW4uZ2V0SXRlbUlkKGZpbGUpXG4gIH1cblxuICBoYW5kbGVEZW1vQXV0aCAoKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnBsdWdpbi5jb3JlLmdldFN0YXRlKClbdGhpcy5wbHVnaW4uc3RhdGVJZF1cbiAgICB0aGlzLnVwZGF0ZVN0YXRlKHt9LCBzdGF0ZSwge1xuICAgICAgYXV0aGVudGljYXRlZDogdHJ1ZVxuICAgIH0pXG4gIH1cblxuICBoYW5kbGVBdXRoICgpIHtcbiAgICBjb25zdCB1cmxJZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDk5OTk5OSkgKyAxXG4gICAgY29uc3QgcmVkaXJlY3QgPSBgJHtsb2NhdGlvbi5ocmVmfSR7bG9jYXRpb24uc2VhcmNoID8gJyYnIDogJz8nfWlkPSR7dXJsSWR9YFxuXG4gICAgY29uc3QgYXV0aFN0YXRlID0gYnRvYShKU09OLnN0cmluZ2lmeSh7IHJlZGlyZWN0IH0pKVxuICAgIGNvbnN0IGxpbmsgPSBgJHt0aGlzLlByb3ZpZGVyLmF1dGhVcmwoKX0/c3RhdGU9JHthdXRoU3RhdGV9YFxuXG4gICAgY29uc3QgYXV0aFdpbmRvdyA9IHdpbmRvdy5vcGVuKGxpbmssICdfYmxhbmsnKVxuICAgIGNvbnN0IGNoZWNrQXV0aCA9ICgpID0+IHtcbiAgICAgIGxldCBhdXRoV2luZG93VXJsXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1dGhXaW5kb3dVcmwgPSBhdXRoV2luZG93LmxvY2F0aW9uLmhyZWZcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBET01FeGNlcHRpb24gfHwgZSBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGNoZWNrQXV0aCwgMTAwKVxuICAgICAgICB9IGVsc2UgdGhyb3cgZVxuICAgICAgfVxuXG4gICAgICAvLyBzcGxpdCB1cmwgYmVjYXVzZSBjaHJvbWUgYWRkcyAnIycgdG8gcmVkaXJlY3RzXG4gICAgICBpZiAoYXV0aFdpbmRvd1VybCAmJiBhdXRoV2luZG93VXJsLnNwbGl0KCcjJylbMF0gPT09IHJlZGlyZWN0KSB7XG4gICAgICAgIGF1dGhXaW5kb3cuY2xvc2UoKVxuICAgICAgICB0aGlzLl9sb2FkZXJXcmFwcGVyKHRoaXMuUHJvdmlkZXIuY2hlY2tBdXRoKCksIHRoaXMucGx1Z2luLm9uQXV0aCwgdGhpcy5oYW5kbGVFcnJvcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFRpbWVvdXQoY2hlY2tBdXRoLCAxMDApXG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tBdXRoKClcbiAgfVxuXG4gIGhhbmRsZUVycm9yIChlcnJvcikge1xuICAgIGNvbnN0IGNvcmUgPSB0aGlzLnBsdWdpbi5jb3JlXG4gICAgY29uc3QgbWVzc2FnZSA9IGNvcmUuaTE4bigndXBweVNlcnZlckVycm9yJylcbiAgICBjb3JlLmxvZyhlcnJvci50b1N0cmluZygpKVxuICAgIGNvcmUuZW1pdCgnaW5mb3JtZXInLCBtZXNzYWdlLCAnZXJyb3InLCA1MDAwKVxuICB9XG5cbiAgaGFuZGxlU2Nyb2xsIChlKSB7XG4gICAgY29uc3Qgc2Nyb2xsUG9zID0gZS50YXJnZXQuc2Nyb2xsSGVpZ2h0IC0gKGUudGFyZ2V0LnNjcm9sbFRvcCArIGUudGFyZ2V0Lm9mZnNldEhlaWdodClcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wbHVnaW4uZ2V0TmV4dFBhZ2VQYXRoID8gdGhpcy5wbHVnaW4uZ2V0TmV4dFBhZ2VQYXRoKCkgOiBudWxsXG5cbiAgICBpZiAoc2Nyb2xsUG9zIDwgNTAgJiYgcGF0aCAmJiAhdGhpcy5faXNIYW5kbGluZ1Njcm9sbCkge1xuICAgICAgdGhpcy5Qcm92aWRlci5saXN0KHBhdGgpXG4gICAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICBjb25zdCB7IGZpbGVzLCBmb2xkZXJzIH0gPSB0aGlzLnBsdWdpbi5jb3JlLmdldFN0YXRlKClbdGhpcy5wbHVnaW4uc3RhdGVJZF1cbiAgICAgICAgICB0aGlzLl91cGRhdGVGaWxlc0FuZEZvbGRlcnMocmVzLCBmaWxlcywgZm9sZGVycylcbiAgICAgICAgfSkuY2F0Y2godGhpcy5oYW5kbGVFcnJvcilcbiAgICAgICAgLnRoZW4oKCkgPT4geyB0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsID0gZmFsc2UgfSkgLy8gYWx3YXlzIGNhbGxlZFxuXG4gICAgICB0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIC8vIGRpc3BsYXlzIGxvYWRlciB2aWV3IHdoaWxlIGFzeW5jaHJvbm91cyByZXF1ZXN0IGlzIGJlaW5nIG1hZGUuXG4gIF9sb2FkZXJXcmFwcGVyIChwcm9taXNlLCB0aGVuLCBjYXRjaF8pIHtcbiAgICBwcm9taXNlXG4gICAgICAudGhlbih0aGVuKS5jYXRjaChjYXRjaF8pXG4gICAgICAudGhlbigoKSA9PiB0aGlzLnVwZGF0ZVN0YXRlKHsgbG9hZGluZzogZmFsc2UgfSkpIC8vIGFsd2F5cyBjYWxsZWQuXG4gICAgdGhpcy51cGRhdGVTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSlcbiAgfVxuXG4gIHJlbmRlciAoc3RhdGUpIHtcbiAgICBjb25zdCB7IGF1dGhlbnRpY2F0ZWQsIGNoZWNrQXV0aEluUHJvZ3Jlc3MsIGxvYWRpbmcgfSA9IHN0YXRlW3RoaXMucGx1Z2luLnN0YXRlSWRdXG5cbiAgICBpZiAobG9hZGluZykge1xuICAgICAgcmV0dXJuIExvYWRlclZpZXcoKVxuICAgIH1cblxuICAgIGlmICghYXV0aGVudGljYXRlZCkge1xuICAgICAgcmV0dXJuIEF1dGhWaWV3KHtcbiAgICAgICAgcGx1Z2luTmFtZTogdGhpcy5wbHVnaW4udGl0bGUsXG4gICAgICAgIGRlbW86IHRoaXMucGx1Z2luLm9wdHMuZGVtbyxcbiAgICAgICAgY2hlY2tBdXRoOiB0aGlzLmNoZWNrQXV0aCxcbiAgICAgICAgaGFuZGxlQXV0aDogdGhpcy5oYW5kbGVBdXRoLFxuICAgICAgICBoYW5kbGVEZW1vQXV0aDogdGhpcy5oYW5kbGVEZW1vQXV0aCxcbiAgICAgICAgY2hlY2tBdXRoSW5Qcm9ncmVzczogY2hlY2tBdXRoSW5Qcm9ncmVzc1xuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBicm93c2VyUHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZVt0aGlzLnBsdWdpbi5zdGF0ZUlkXSwge1xuICAgICAgZ2V0TmV4dEZvbGRlcjogdGhpcy5nZXROZXh0Rm9sZGVyLFxuICAgICAgZ2V0Rm9sZGVyOiB0aGlzLmdldEZvbGRlcixcbiAgICAgIGFkZEZpbGU6IHRoaXMuYWRkRmlsZSxcbiAgICAgIGZpbHRlckl0ZW1zOiB0aGlzLmZpbHRlckl0ZW1zLFxuICAgICAgZmlsdGVyUXVlcnk6IHRoaXMuZmlsdGVyUXVlcnksXG4gICAgICB0b2dnbGVTZWFyY2g6IHRoaXMudG9nZ2xlU2VhcmNoLFxuICAgICAgc29ydEJ5VGl0bGU6IHRoaXMuc29ydEJ5VGl0bGUsXG4gICAgICBzb3J0QnlEYXRlOiB0aGlzLnNvcnRCeURhdGUsXG4gICAgICBsb2dvdXQ6IHRoaXMubG9nb3V0LFxuICAgICAgZGVtbzogdGhpcy5wbHVnaW4ub3B0cy5kZW1vLFxuICAgICAgaXNBY3RpdmVSb3c6IHRoaXMuaXNBY3RpdmVSb3csXG4gICAgICBnZXRJdGVtTmFtZTogdGhpcy5wbHVnaW4uZ2V0SXRlbU5hbWUsXG4gICAgICBnZXRJdGVtSWNvbjogdGhpcy5wbHVnaW4uZ2V0SXRlbUljb24sXG4gICAgICBoYW5kbGVTY3JvbGw6IHRoaXMuaGFuZGxlU2Nyb2xsLFxuICAgICAgdGl0bGU6IHRoaXMucGx1Z2luLnRpdGxlLFxuICAgICAgdmlld1R5cGU6IHRoaXMub3B0cy52aWV3VHlwZVxuICAgIH0pXG5cbiAgICByZXR1cm4gQnJvd3Nlcihicm93c2VyUHJvcHMpXG4gIH1cbn1cbiIsImNvbnN0IGh0bWwgPSByZXF1aXJlKCd5by15bycpXG5jb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuLi9QbHVnaW4nKVxuXG5jb25zdCBQcm92aWRlciA9IHJlcXVpcmUoJy4uLy4uL3VwcHktYmFzZS9zcmMvcGx1Z2lucy9Qcm92aWRlcicpXG5cbmNvbnN0IFZpZXcgPSByZXF1aXJlKCcuLi8uLi9nZW5lcmljLXByb3ZpZGVyLXZpZXdzL2luZGV4JylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBHb29nbGUgZXh0ZW5kcyBQbHVnaW4ge1xuICBjb25zdHJ1Y3RvciAoY29yZSwgb3B0cykge1xuICAgIHN1cGVyKGNvcmUsIG9wdHMpXG4gICAgdGhpcy50eXBlID0gJ2FjcXVpcmVyJ1xuICAgIHRoaXMuaWQgPSAnR29vZ2xlRHJpdmUnXG4gICAgdGhpcy50aXRsZSA9ICdHb29nbGUgRHJpdmUnXG4gICAgdGhpcy5zdGF0ZUlkID0gJ2dvb2dsZURyaXZlJ1xuICAgIHRoaXMuaWNvbiA9ICgpID0+IGh0bWxgXG4gICAgICA8c3ZnIGNsYXNzPVwiVXBweUljb24gVXBweU1vZGFsVGFiLWljb25cIiB3aWR0aD1cIjI4XCIgaGVpZ2h0PVwiMjhcIiB2aWV3Qm94PVwiMCAwIDE2IDE2XCI+XG4gICAgICAgIDxwYXRoIGQ9XCJNMi45NTUgMTQuOTNsMi42NjctNC42MkgxNmwtMi42NjcgNC42MkgyLjk1NXptMi4zNzgtNC42MmwtMi42NjYgNC42MkwwIDEwLjMxbDUuMTktOC45OSAyLjY2NiA0LjYyLTIuNTIzIDQuMzd6bTEwLjUyMy0uMjVoLTUuMzMzbC01LjE5LTguOTloNS4zMzRsNS4xOSA4Ljk5elwiLz5cbiAgICAgIDwvc3ZnPlxuICAgIGBcblxuICAgIC8vIHdyaXRpbmcgb3V0IHRoZSBrZXkgZXhwbGljaXRseSBmb3IgcmVhZGFiaWxpdHkgdGhlIGtleSB1c2VkIHRvIHN0b3JlXG4gICAgLy8gdGhlIHByb3ZpZGVyIGluc3RhbmNlIG11c3QgYmUgZXF1YWwgdG8gdGhpcy5pZC5cbiAgICB0aGlzLkdvb2dsZURyaXZlID0gbmV3IFByb3ZpZGVyKGNvcmUsIHtcbiAgICAgIGhvc3Q6IHRoaXMub3B0cy5ob3N0LFxuICAgICAgcHJvdmlkZXI6ICdkcml2ZScsXG4gICAgICBhdXRoUHJvdmlkZXI6ICdnb29nbGUnXG4gICAgfSlcblxuICAgIHRoaXMuZmlsZXMgPSBbXVxuXG4gICAgdGhpcy5vbkF1dGggPSB0aGlzLm9uQXV0aC5iaW5kKHRoaXMpXG4gICAgLy8gVmlzdWFsXG4gICAgdGhpcy5yZW5kZXIgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpXG5cbiAgICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7fVxuXG4gICAgLy8gbWVyZ2UgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIG9uZXMgc2V0IGJ5IHVzZXJcbiAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cylcbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIHRoaXMudmlldyA9IG5ldyBWaWV3KHRoaXMpXG4gICAgLy8gU2V0IGRlZmF1bHQgc3RhdGUgZm9yIEdvb2dsZSBEcml2ZVxuICAgIHRoaXMuY29yZS5zZXRTdGF0ZSh7XG4gICAgICAvLyB3cml0aW5nIG91dCB0aGUga2V5IGV4cGxpY2l0bHkgZm9yIHJlYWRhYmlsaXR5IHRoZSBrZXkgdXNlZCB0byBzdG9yZVxuICAgICAgLy8gdGhlIHBsdWdpbiBzdGF0ZSBtdXN0IGJlIGVxdWFsIHRvIHRoaXMuc3RhdGVJZC5cbiAgICAgIGdvb2dsZURyaXZlOiB7XG4gICAgICAgIGF1dGhlbnRpY2F0ZWQ6IGZhbHNlLFxuICAgICAgICBmaWxlczogW10sXG4gICAgICAgIGZvbGRlcnM6IFtdLFxuICAgICAgICBkaXJlY3RvcmllczogW10sXG4gICAgICAgIGFjdGl2ZVJvdzogLTEsXG4gICAgICAgIGZpbHRlcklucHV0OiAnJyxcbiAgICAgICAgaXNTZWFyY2hWaXNpYmxlOiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLm9wdHMudGFyZ2V0XG4gICAgY29uc3QgcGx1Z2luID0gdGhpc1xuICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5tb3VudCh0YXJnZXQsIHBsdWdpbilcbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51bm1vdW50KClcbiAgfVxuXG4gIG9uQXV0aCAoYXV0aGVudGljYXRlZCkge1xuICAgIHRoaXMudmlldy51cGRhdGVTdGF0ZSh7YXV0aGVudGljYXRlZH0pXG4gICAgaWYgKGF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHRoaXMudmlldy5nZXRGb2xkZXIoJ3Jvb3QnKVxuICAgIH1cbiAgfVxuXG4gIGlzRm9sZGVyIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0ubWltZVR5cGUgPT09ICdhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLWFwcHMuZm9sZGVyJ1xuICB9XG5cbiAgZ2V0SXRlbURhdGEgKGl0ZW0pIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgaXRlbSwge3NpemU6IHBhcnNlRmxvYXQoaXRlbS5maWxlU2l6ZSl9KVxuICB9XG5cbiAgZ2V0SXRlbUljb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaHRtbGA8aW1nIHNyYz0ke2l0ZW0uaWNvbkxpbmt9Lz5gXG4gIH1cblxuICBnZXRJdGVtU3ViTGlzdCAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLml0ZW1zLmZpbHRlcigoaSkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuaXNGb2xkZXIoaSkgfHwgIWkubWltZVR5cGUuc3RhcnRzV2l0aCgnYXBwbGljYXRpb24vdm5kLmdvb2dsZScpXG4gICAgfSlcbiAgfVxuXG4gIGdldEl0ZW1OYW1lIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0udGl0bGUgPyBpdGVtLnRpdGxlIDogJy8nXG4gIH1cblxuICBnZXRNaW1lVHlwZSAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLm1pbWVUeXBlXG4gIH1cblxuICBnZXRJdGVtSWQgKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5pZFxuICB9XG5cbiAgZ2V0SXRlbVJlcXVlc3RQYXRoIChpdGVtKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SXRlbUlkKGl0ZW0pXG4gIH1cblxuICBnZXRJdGVtTW9kaWZpZWREYXRlIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0ubW9kaWZpZWRCeU1lRGF0ZVxuICB9XG5cbiAgZ2V0SXRlbVRodW1ibmFpbFVybCAoaXRlbSkge1xuICAgIHJldHVybiBgJHt0aGlzLm9wdHMuaG9zdH0vJHt0aGlzLkdvb2dsZURyaXZlLmlkfS90aHVtYm5haWwvJHt0aGlzLmdldEl0ZW1SZXF1ZXN0UGF0aChpdGVtKX1gXG4gIH1cblxuICByZW5kZXIgKHN0YXRlKSB7XG4gICAgcmV0dXJuIHRoaXMudmlldy5yZW5kZXIoc3RhdGUpXG4gIH1cbn1cbiIsImNvbnN0IHlvID0gcmVxdWlyZSgneW8teW8nKVxuY29uc3QgbmFub3JhZiA9IHJlcXVpcmUoJ25hbm9yYWYnKVxuY29uc3QgeyBmaW5kRE9NRWxlbWVudCB9ID0gcmVxdWlyZSgnLi4vY29yZS9VdGlscycpXG5jb25zdCBnZXRGb3JtRGF0YSA9IHJlcXVpcmUoJ2dldC1mb3JtLWRhdGEnKVxuXG4vKipcbiAqIEJvaWxlcnBsYXRlIHRoYXQgYWxsIFBsdWdpbnMgc2hhcmUgLSBhbmQgc2hvdWxkIG5vdCBiZSB1c2VkXG4gKiBkaXJlY3RseS4gSXQgYWxzbyBzaG93cyB3aGljaCBtZXRob2RzIGZpbmFsIHBsdWdpbnMgc2hvdWxkIGltcGxlbWVudC9vdmVycmlkZSxcbiAqIHRoaXMgZGVjaWRpbmcgb24gc3RydWN0dXJlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBtYWluIFVwcHkgY29yZSBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3Qgd2l0aCBwbHVnaW4gb3B0aW9uc1xuICogQHJldHVybiB7YXJyYXkgfCBzdHJpbmd9IGZpbGVzIG9yIHN1Y2Nlc3MvZmFpbCBtZXNzYWdlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUGx1Z2luIHtcblxuICBjb25zdHJ1Y3RvciAoY29yZSwgb3B0cykge1xuICAgIHRoaXMuY29yZSA9IGNvcmVcbiAgICB0aGlzLm9wdHMgPSBvcHRzIHx8IHt9XG4gICAgdGhpcy50eXBlID0gJ25vbmUnXG5cbiAgICAvLyBjbGVhciBldmVyeXRoaW5nIGluc2lkZSB0aGUgdGFyZ2V0IHNlbGVjdG9yXG4gICAgdGhpcy5vcHRzLnJlcGxhY2VUYXJnZXRDb250ZW50ID09PSB0aGlzLm9wdHMucmVwbGFjZVRhcmdldENvbnRlbnQgfHwgdHJ1ZVxuXG4gICAgdGhpcy51cGRhdGUgPSB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5tb3VudCA9IHRoaXMubW91bnQuYmluZCh0aGlzKVxuICAgIHRoaXMuaW5zdGFsbCA9IHRoaXMuaW5zdGFsbC5iaW5kKHRoaXMpXG4gICAgdGhpcy51bmluc3RhbGwgPSB0aGlzLnVuaW5zdGFsbC5iaW5kKHRoaXMpXG4gIH1cblxuICB1cGRhdGUgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmVsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXBkYXRlVUkpIHtcbiAgICAgIHRoaXMudXBkYXRlVUkoc3RhdGUpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHN1cHBsaWVkIGB0YXJnZXRgIGlzIGEgRE9NIGVsZW1lbnQgb3IgYW4gYG9iamVjdGAuXG4gICAqIElmIGl04oCZcyBhbiBvYmplY3Qg4oCUIHRhcmdldCBpcyBhIHBsdWdpbiwgYW5kIHdlIHNlYXJjaCBgcGx1Z2luc2BcbiAgICogZm9yIGEgcGx1Z2luIHdpdGggc2FtZSBuYW1lIGFuZCByZXR1cm4gaXRzIHRhcmdldC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB0YXJnZXRcbiAgICpcbiAgICovXG4gIG1vdW50ICh0YXJnZXQsIHBsdWdpbikge1xuICAgIGNvbnN0IGNhbGxlclBsdWdpbk5hbWUgPSBwbHVnaW4uaWRcblxuICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBmaW5kRE9NRWxlbWVudCh0YXJnZXQpXG5cbiAgICAvLyBTZXQgdXAgbmFub3JhZi5cbiAgICB0aGlzLnVwZGF0ZVVJID0gbmFub3JhZigoc3RhdGUpID0+IHtcbiAgICAgIHRoaXMuZWwgPSB5by51cGRhdGUodGhpcy5lbCwgdGhpcy5yZW5kZXIoc3RhdGUpKVxuICAgIH0pXG5cbiAgICBpZiAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgdGhpcy5jb3JlLmxvZyhgSW5zdGFsbGluZyAke2NhbGxlclBsdWdpbk5hbWV9IHRvIGEgRE9NIGVsZW1lbnRgKVxuXG4gICAgICAvLyBhdHRlbXB0IHRvIGV4dHJhY3QgbWV0YSBmcm9tIGZvcm0gZWxlbWVudFxuICAgICAgaWYgKHRoaXMub3B0cy5nZXRNZXRhRnJvbUZvcm0gJiYgdGFyZ2V0RWxlbWVudC5ub2RlTmFtZSA9PT0gJ0ZPUk0nKSB7XG4gICAgICAgIGNvbnN0IGZvcm1NZXRhID0gZ2V0Rm9ybURhdGEodGFyZ2V0RWxlbWVudClcbiAgICAgICAgdGhpcy5jb3JlLnNldE1ldGEoZm9ybU1ldGEpXG4gICAgICB9XG5cbiAgICAgIC8vIGNsZWFyIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSB0YXJnZXQgY29udGFpbmVyXG4gICAgICBpZiAodGhpcy5vcHRzLnJlcGxhY2VUYXJnZXRDb250ZW50KSB7XG4gICAgICAgIHRhcmdldEVsZW1lbnQuaW5uZXJIVE1MID0gJydcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbCA9IHBsdWdpbi5yZW5kZXIodGhpcy5jb3JlLnN0YXRlKVxuICAgICAgdGFyZ2V0RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsKVxuXG4gICAgICByZXR1cm4gdGFyZ2V0RWxlbWVudFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPOiBpcyBpbnN0YW50aWF0aW5nIHRoZSBwbHVnaW4gcmVhbGx5IHRoZSB3YXkgdG8gcm9sbFxuICAgICAgLy8ganVzdCB0byBnZXQgdGhlIHBsdWdpbiBuYW1lP1xuICAgICAgY29uc3QgVGFyZ2V0ID0gdGFyZ2V0XG4gICAgICBjb25zdCB0YXJnZXRQbHVnaW5OYW1lID0gbmV3IFRhcmdldCgpLmlkXG5cbiAgICAgIHRoaXMuY29yZS5sb2coYEluc3RhbGxpbmcgJHtjYWxsZXJQbHVnaW5OYW1lfSB0byAke3RhcmdldFBsdWdpbk5hbWV9YClcblxuICAgICAgY29uc3QgdGFyZ2V0UGx1Z2luID0gdGhpcy5jb3JlLmdldFBsdWdpbih0YXJnZXRQbHVnaW5OYW1lKVxuICAgICAgY29uc3Qgc2VsZWN0b3JUYXJnZXQgPSB0YXJnZXRQbHVnaW4uYWRkVGFyZ2V0KHBsdWdpbilcblxuICAgICAgcmV0dXJuIHNlbGVjdG9yVGFyZ2V0XG4gICAgfVxuICB9XG5cbiAgdW5tb3VudCAoKSB7XG4gICAgaWYgKHRoaXMuZWwgJiYgdGhpcy5lbC5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLmVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbClcbiAgICB9XG4gIH1cblxuICBpbnN0YWxsICgpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51bm1vdW50KClcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpXG5cbmNvbnN0IF9nZXROYW1lID0gKGlkKSA9PiB7XG4gIHJldHVybiBpZC5zcGxpdCgnLScpLm1hcCgocykgPT4gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSkpLmpvaW4oJyAnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IgKGNvcmUsIG9wdHMpIHtcbiAgICB0aGlzLmNvcmUgPSBjb3JlXG4gICAgdGhpcy5vcHRzID0gb3B0c1xuICAgIHRoaXMucHJvdmlkZXIgPSBvcHRzLnByb3ZpZGVyXG4gICAgdGhpcy5pZCA9IHRoaXMucHJvdmlkZXJcbiAgICB0aGlzLmF1dGhQcm92aWRlciA9IG9wdHMuYXV0aFByb3ZpZGVyIHx8IHRoaXMucHJvdmlkZXJcbiAgICB0aGlzLm5hbWUgPSB0aGlzLm9wdHMubmFtZSB8fCBfZ2V0TmFtZSh0aGlzLmlkKVxuXG4gICAgdGhpcy5vblJlY2VpdmVSZXNwb25zZSA9IHRoaXMub25SZWNlaXZlUmVzcG9uc2UuYmluZCh0aGlzKVxuICB9XG5cbiAgZ2V0IGhvc3RuYW1lICgpIHtcbiAgICBjb25zdCB1cHB5U2VydmVyID0gdGhpcy5jb3JlLnN0YXRlLnVwcHlTZXJ2ZXIgfHwge31cbiAgICBjb25zdCBob3N0ID0gdGhpcy5vcHRzLmhvc3RcbiAgICByZXR1cm4gdXBweVNlcnZlcltob3N0XSB8fCBob3N0XG4gIH1cblxuICBvblJlY2VpdmVSZXNwb25zZSAocmVzcG9uc2UpIHtcbiAgICBjb25zdCB1cHB5U2VydmVyID0gdGhpcy5jb3JlLnN0YXRlLnVwcHlTZXJ2ZXIgfHwge31cbiAgICBjb25zdCBob3N0ID0gdGhpcy5vcHRzLmhvc3RcbiAgICBjb25zdCBoZWFkZXJzID0gcmVzcG9uc2UuaGVhZGVyc1xuICAgIC8vIFN0b3JlIHRoZSBzZWxmLWlkZW50aWZpZWQgZG9tYWluIG5hbWUgZm9yIHRoZSB1cHB5LXNlcnZlciB3ZSBqdXN0IGhpdC5cbiAgICBpZiAoaGVhZGVycy5oYXMoJ2ktYW0nKSAmJiBoZWFkZXJzLmdldCgnaS1hbScpICE9PSB1cHB5U2VydmVyW2hvc3RdKSB7XG4gICAgICB0aGlzLmNvcmUuc2V0U3RhdGUoe1xuICAgICAgICB1cHB5U2VydmVyOiBPYmplY3QuYXNzaWduKHt9LCB1cHB5U2VydmVyLCB7XG4gICAgICAgICAgW2hvc3RdOiBoZWFkZXJzLmdldCgnaS1hbScpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIGNoZWNrQXV0aCAoKSB7XG4gICAgcmV0dXJuIGZldGNoKGAke3RoaXMuaG9zdG5hbWV9LyR7dGhpcy5pZH0vYXV0aG9yaXplZGAsIHtcbiAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9XG4gICAgfSlcbiAgICAudGhlbih0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlKVxuICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgIHJldHVybiByZXMuanNvbigpXG4gICAgICAudGhlbigocGF5bG9hZCkgPT4ge1xuICAgICAgICByZXR1cm4gcGF5bG9hZC5hdXRoZW50aWNhdGVkXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBhdXRoVXJsICgpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vJHt0aGlzLmlkfS9jb25uZWN0YFxuICB9XG5cbiAgZmlsZVVybCAoaWQpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vJHt0aGlzLmlkfS9nZXQvJHtpZH1gXG4gIH1cblxuICBsaXN0IChkaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gZmV0Y2goYCR7dGhpcy5ob3N0bmFtZX0vJHt0aGlzLmlkfS9saXN0LyR7ZGlyZWN0b3J5IHx8ICcnfWAsIHtcbiAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9XG4gICAgfSlcbiAgICAudGhlbih0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlKVxuICAgIC50aGVuKChyZXMpID0+IHJlcy5qc29uKCkpXG4gIH1cblxuICBsb2dvdXQgKHJlZGlyZWN0ID0gbG9jYXRpb24uaHJlZikge1xuICAgIHJldHVybiBmZXRjaChgJHt0aGlzLmhvc3RuYW1lfS8ke3RoaXMuaWR9L2xvZ291dD9yZWRpcmVjdD0ke3JlZGlyZWN0fWAsIHtcbiAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0ID0+IHtcblx0Y29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpO1xuXG5cdGlmICghKGJ1ZiAmJiBidWYubGVuZ3RoID4gMSkpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IGNoZWNrID0gKGhlYWRlciwgb3B0cykgPT4ge1xuXHRcdG9wdHMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdG9mZnNldDogMFxuXHRcdH0sIG9wdHMpO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBoZWFkZXIubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChoZWFkZXJbaV0gIT09IGJ1ZltpICsgb3B0cy5vZmZzZXRdKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblxuXHRpZiAoY2hlY2soWzB4RkYsIDB4RDgsIDB4RkZdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdqcGcnLFxuXHRcdFx0bWltZTogJ2ltYWdlL2pwZWcnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg4OSwgMHg1MCwgMHg0RSwgMHg0NywgMHgwRCwgMHgwQSwgMHgxQSwgMHgwQV0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3BuZycsXG5cdFx0XHRtaW1lOiAnaW1hZ2UvcG5nJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NDcsIDB4NDksIDB4NDZdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdnaWYnLFxuXHRcdFx0bWltZTogJ2ltYWdlL2dpZidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDU3LCAweDQ1LCAweDQyLCAweDUwXSwge29mZnNldDogOH0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3dlYnAnLFxuXHRcdFx0bWltZTogJ2ltYWdlL3dlYnAnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0NiwgMHg0QywgMHg0OSwgMHg0Nl0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2ZsaWYnLFxuXHRcdFx0bWltZTogJ2ltYWdlL2ZsaWYnXG5cdFx0fTtcblx0fVxuXG5cdC8vIE5lZWRzIHRvIGJlIGJlZm9yZSBgdGlmYCBjaGVja1xuXHRpZiAoXG5cdFx0KGNoZWNrKFsweDQ5LCAweDQ5LCAweDJBLCAweDBdKSB8fCBjaGVjayhbMHg0RCwgMHg0RCwgMHgwLCAweDJBXSkpICYmXG5cdFx0Y2hlY2soWzB4NDMsIDB4NTJdLCB7b2Zmc2V0OiA4fSlcblx0KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2NyMicsXG5cdFx0XHRtaW1lOiAnaW1hZ2UveC1jYW5vbi1jcjInXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHg0OSwgMHg0OSwgMHgyQSwgMHgwXSkgfHxcblx0XHRjaGVjayhbMHg0RCwgMHg0RCwgMHgwLCAweDJBXSlcblx0KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3RpZicsXG5cdFx0XHRtaW1lOiAnaW1hZ2UvdGlmZidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDQyLCAweDREXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnYm1wJyxcblx0XHRcdG1pbWU6ICdpbWFnZS9ibXAnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0OSwgMHg0OSwgMHhCQ10pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2p4cicsXG5cdFx0XHRtaW1lOiAnaW1hZ2Uvdm5kLm1zLXBob3RvJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4MzgsIDB4NDIsIDB4NTAsIDB4NTNdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdwc2QnLFxuXHRcdFx0bWltZTogJ2ltYWdlL3ZuZC5hZG9iZS5waG90b3Nob3AnXG5cdFx0fTtcblx0fVxuXG5cdC8vIE5lZWRzIHRvIGJlIGJlZm9yZSB0aGUgYHppcGAgY2hlY2tcblx0aWYgKFxuXHRcdGNoZWNrKFsweDUwLCAweDRCLCAweDMsIDB4NF0pICYmXG5cdFx0Y2hlY2soWzB4NkQsIDB4NjksIDB4NkQsIDB4NjUsIDB4NzQsIDB4NzksIDB4NzAsIDB4NjUsIDB4NjEsIDB4NzAsIDB4NzAsIDB4NkMsIDB4NjksIDB4NjMsIDB4NjEsIDB4NzQsIDB4NjksIDB4NkYsIDB4NkUsIDB4MkYsIDB4NjUsIDB4NzAsIDB4NzUsIDB4NjIsIDB4MkIsIDB4N0EsIDB4NjksIDB4NzBdLCB7b2Zmc2V0OiAzMH0pXG5cdCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdlcHViJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi9lcHViK3ppcCdcblx0XHR9O1xuXHR9XG5cblx0Ly8gTmVlZHMgdG8gYmUgYmVmb3JlIGB6aXBgIGNoZWNrXG5cdC8vIEFzc3VtZXMgc2lnbmVkIGAueHBpYCBmcm9tIGFkZG9ucy5tb3ppbGxhLm9yZ1xuXHRpZiAoXG5cdFx0Y2hlY2soWzB4NTAsIDB4NEIsIDB4MywgMHg0XSkgJiZcblx0XHRjaGVjayhbMHg0RCwgMHg0NSwgMHg1NCwgMHg0MSwgMHgyRCwgMHg0OSwgMHg0RSwgMHg0NiwgMHgyRiwgMHg2RCwgMHg2RiwgMHg3QSwgMHg2OSwgMHg2QywgMHg2QywgMHg2MSwgMHgyRSwgMHg3MiwgMHg3MywgMHg2MV0sIHtvZmZzZXQ6IDMwfSlcblx0KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3hwaScsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC14cGluc3RhbGwnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHg1MCwgMHg0Ql0pICYmXG5cdFx0KGJ1ZlsyXSA9PT0gMHgzIHx8IGJ1ZlsyXSA9PT0gMHg1IHx8IGJ1ZlsyXSA9PT0gMHg3KSAmJlxuXHRcdChidWZbM10gPT09IDB4NCB8fCBidWZbM10gPT09IDB4NiB8fCBidWZbM10gPT09IDB4OClcblx0KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3ppcCcsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24vemlwJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NzUsIDB4NzMsIDB4NzQsIDB4NjEsIDB4NzJdLCB7b2Zmc2V0OiAyNTd9KSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICd0YXInLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtdGFyJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoXG5cdFx0Y2hlY2soWzB4NTIsIDB4NjEsIDB4NzIsIDB4MjEsIDB4MUEsIDB4N10pICYmXG5cdFx0KGJ1Zls2XSA9PT0gMHgwIHx8IGJ1Zls2XSA9PT0gMHgxKVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAncmFyJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LXJhci1jb21wcmVzc2VkJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4MUYsIDB4OEIsIDB4OF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2d6Jyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi9nemlwJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NDIsIDB4NUEsIDB4NjhdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdiejInLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtYnppcDInXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgzNywgMHg3QSwgMHhCQywgMHhBRiwgMHgyNywgMHgxQ10pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJzd6Jyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWQnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg3OCwgMHgwMV0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2RtZycsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC1hcHBsZS1kaXNraW1hZ2UnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHQoXG5cdFx0XHRjaGVjayhbMHgwLCAweDAsIDB4MF0pICYmXG5cdFx0XHQoYnVmWzNdID09PSAweDE4IHx8IGJ1ZlszXSA9PT0gMHgyMCkgJiZcblx0XHRcdGNoZWNrKFsweDY2LCAweDc0LCAweDc5LCAweDcwXSwge29mZnNldDogNH0pXG5cdFx0KSB8fFxuXHRcdGNoZWNrKFsweDMzLCAweDY3LCAweDcwLCAweDM1XSkgfHxcblx0XHQoXG5cdFx0XHRjaGVjayhbMHgwLCAweDAsIDB4MCwgMHgxQywgMHg2NiwgMHg3NCwgMHg3OSwgMHg3MCwgMHg2RCwgMHg3MCwgMHgzNCwgMHgzMl0pICYmXG5cdFx0XHRjaGVjayhbMHg2RCwgMHg3MCwgMHgzNCwgMHgzMSwgMHg2RCwgMHg3MCwgMHgzNCwgMHgzMiwgMHg2OSwgMHg3MywgMHg2RiwgMHg2RF0sIHtvZmZzZXQ6IDE2fSlcblx0XHQpIHx8XG5cdFx0Y2hlY2soWzB4MCwgMHgwLCAweDAsIDB4MUMsIDB4NjYsIDB4NzQsIDB4NzksIDB4NzAsIDB4NjksIDB4NzMsIDB4NkYsIDB4NkRdKSB8fFxuXHRcdGNoZWNrKFsweDAsIDB4MCwgMHgwLCAweDFDLCAweDY2LCAweDc0LCAweDc5LCAweDcwLCAweDZELCAweDcwLCAweDM0LCAweDMyLCAweDAsIDB4MCwgMHgwLCAweDBdKVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbXA0Jyxcblx0XHRcdG1pbWU6ICd2aWRlby9tcDQnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgwLCAweDAsIDB4MCwgMHgxQywgMHg2NiwgMHg3NCwgMHg3OSwgMHg3MCwgMHg0RCwgMHgzNCwgMHg1Nl0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ200dicsXG5cdFx0XHRtaW1lOiAndmlkZW8veC1tNHYnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0RCwgMHg1NCwgMHg2OCwgMHg2NF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ21pZCcsXG5cdFx0XHRtaW1lOiAnYXVkaW8vbWlkaSdcblx0XHR9O1xuXHR9XG5cblx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3RocmVhdHN0YWNrL2xpYm1hZ2ljL2Jsb2IvbWFzdGVyL21hZ2ljL01hZ2Rpci9tYXRyb3NrYVxuXHRpZiAoY2hlY2soWzB4MUEsIDB4NDUsIDB4REYsIDB4QTNdKSkge1xuXHRcdGNvbnN0IHNsaWNlZCA9IGJ1Zi5zdWJhcnJheSg0LCA0ICsgNDA5Nik7XG5cdFx0Y29uc3QgaWRQb3MgPSBzbGljZWQuZmluZEluZGV4KChlbCwgaSwgYXJyKSA9PiBhcnJbaV0gPT09IDB4NDIgJiYgYXJyW2kgKyAxXSA9PT0gMHg4Mik7XG5cblx0XHRpZiAoaWRQb3MgPj0gMCkge1xuXHRcdFx0Y29uc3QgZG9jVHlwZVBvcyA9IGlkUG9zICsgMztcblx0XHRcdGNvbnN0IGZpbmREb2NUeXBlID0gdHlwZSA9PiBBcnJheS5mcm9tKHR5cGUpLmV2ZXJ5KChjLCBpKSA9PiBzbGljZWRbZG9jVHlwZVBvcyArIGldID09PSBjLmNoYXJDb2RlQXQoMCkpO1xuXG5cdFx0XHRpZiAoZmluZERvY1R5cGUoJ21hdHJvc2thJykpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRleHQ6ICdta3YnLFxuXHRcdFx0XHRcdG1pbWU6ICd2aWRlby94LW1hdHJvc2thJ1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZmluZERvY1R5cGUoJ3dlYm0nKSkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGV4dDogJ3dlYm0nLFxuXHRcdFx0XHRcdG1pbWU6ICd2aWRlby93ZWJtJ1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChjaGVjayhbMHgwLCAweDAsIDB4MCwgMHgxNCwgMHg2NiwgMHg3NCwgMHg3OSwgMHg3MCwgMHg3MSwgMHg3NCwgMHgyMCwgMHgyMF0pIHx8XG5cdFx0Y2hlY2soWzB4NjYsIDB4NzIsIDB4NjUsIDB4NjVdLCB7b2Zmc2V0OiA0fSkgfHxcblx0XHRjaGVjayhbMHg2NiwgMHg3NCwgMHg3OSwgMHg3MCwgMHg3MSwgMHg3NCwgMHgyMCwgMHgyMF0sIHtvZmZzZXQ6IDR9KSB8fFxuXHRcdGNoZWNrKFsweDZELCAweDY0LCAweDYxLCAweDc0XSwge29mZnNldDogNH0pIHx8IC8vIE1KUEVHXG5cdFx0Y2hlY2soWzB4NzcsIDB4NjksIDB4NjQsIDB4NjVdLCB7b2Zmc2V0OiA0fSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbW92Jyxcblx0XHRcdG1pbWU6ICd2aWRlby9xdWlja3RpbWUnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHg1MiwgMHg0OSwgMHg0NiwgMHg0Nl0pICYmXG5cdFx0Y2hlY2soWzB4NDEsIDB4NTYsIDB4NDldLCB7b2Zmc2V0OiA4fSlcblx0KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2F2aScsXG5cdFx0XHRtaW1lOiAndmlkZW8veC1tc3ZpZGVvJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4MzAsIDB4MjYsIDB4QjIsIDB4NzUsIDB4OEUsIDB4NjYsIDB4Q0YsIDB4MTEsIDB4QTYsIDB4RDldKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICd3bXYnLFxuXHRcdFx0bWltZTogJ3ZpZGVvL3gtbXMtd212J1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4MCwgMHgwLCAweDEsIDB4QkFdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdtcGcnLFxuXHRcdFx0bWltZTogJ3ZpZGVvL21wZWcnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHg0OSwgMHg0NCwgMHgzM10pIHx8XG5cdFx0Y2hlY2soWzB4RkYsIDB4RkJdKVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbXAzJyxcblx0XHRcdG1pbWU6ICdhdWRpby9tcGVnJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoXG5cdFx0Y2hlY2soWzB4NjYsIDB4NzQsIDB4NzksIDB4NzAsIDB4NEQsIDB4MzQsIDB4NDFdLCB7b2Zmc2V0OiA0fSkgfHxcblx0XHRjaGVjayhbMHg0RCwgMHgzNCwgMHg0MSwgMHgyMF0pXG5cdCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdtNGEnLFxuXHRcdFx0bWltZTogJ2F1ZGlvL200YSdcblx0XHR9O1xuXHR9XG5cblx0Ly8gTmVlZHMgdG8gYmUgYmVmb3JlIGBvZ2dgIGNoZWNrXG5cdGlmIChjaGVjayhbMHg0RiwgMHg3MCwgMHg3NSwgMHg3MywgMHg0OCwgMHg2NSwgMHg2MSwgMHg2NF0sIHtvZmZzZXQ6IDI4fSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnb3B1cycsXG5cdFx0XHRtaW1lOiAnYXVkaW8vb3B1cydcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDRGLCAweDY3LCAweDY3LCAweDUzXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnb2dnJyxcblx0XHRcdG1pbWU6ICdhdWRpby9vZ2cnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg2NiwgMHg0QywgMHg2MSwgMHg0M10pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2ZsYWMnLFxuXHRcdFx0bWltZTogJ2F1ZGlvL3gtZmxhYydcblx0XHR9O1xuXHR9XG5cblx0aWYgKFxuXHRcdGNoZWNrKFsweDUyLCAweDQ5LCAweDQ2LCAweDQ2XSkgJiZcblx0XHRjaGVjayhbMHg1NywgMHg0MSwgMHg1NiwgMHg0NV0sIHtvZmZzZXQ6IDh9KVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnd2F2Jyxcblx0XHRcdG1pbWU6ICdhdWRpby94LXdhdidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDIzLCAweDIxLCAweDQxLCAweDRELCAweDUyLCAweDBBXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnYW1yJyxcblx0XHRcdG1pbWU6ICdhdWRpby9hbXInXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgyNSwgMHg1MCwgMHg0NCwgMHg0Nl0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3BkZicsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24vcGRmJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NEQsIDB4NUFdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdleGUnLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtbXNkb3dubG9hZCdcblx0XHR9O1xuXHR9XG5cblx0aWYgKFxuXHRcdChidWZbMF0gPT09IDB4NDMgfHwgYnVmWzBdID09PSAweDQ2KSAmJlxuXHRcdGNoZWNrKFsweDU3LCAweDUzXSwge29mZnNldDogMX0pXG5cdCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdzd2YnLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4N0IsIDB4NUMsIDB4NzIsIDB4NzQsIDB4NjZdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdydGYnLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3J0Zidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDAwLCAweDYxLCAweDczLCAweDZEXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnd2FzbScsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24vd2FzbSdcblx0XHR9O1xuXHR9XG5cblx0aWYgKFxuXHRcdGNoZWNrKFsweDc3LCAweDRGLCAweDQ2LCAweDQ2XSkgJiZcblx0XHQoXG5cdFx0XHRjaGVjayhbMHgwMCwgMHgwMSwgMHgwMCwgMHgwMF0sIHtvZmZzZXQ6IDR9KSB8fFxuXHRcdFx0Y2hlY2soWzB4NEYsIDB4NTQsIDB4NTQsIDB4NEZdLCB7b2Zmc2V0OiA0fSlcblx0XHQpXG5cdCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICd3b2ZmJyxcblx0XHRcdG1pbWU6ICdmb250L3dvZmYnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHg3NywgMHg0RiwgMHg0NiwgMHgzMl0pICYmXG5cdFx0KFxuXHRcdFx0Y2hlY2soWzB4MDAsIDB4MDEsIDB4MDAsIDB4MDBdLCB7b2Zmc2V0OiA0fSkgfHxcblx0XHRcdGNoZWNrKFsweDRGLCAweDU0LCAweDU0LCAweDRGXSwge29mZnNldDogNH0pXG5cdFx0KVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnd29mZjInLFxuXHRcdFx0bWltZTogJ2ZvbnQvd29mZjInXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHg0QywgMHg1MF0sIHtvZmZzZXQ6IDM0fSkgJiZcblx0XHQoXG5cdFx0XHRjaGVjayhbMHgwMCwgMHgwMCwgMHgwMV0sIHtvZmZzZXQ6IDh9KSB8fFxuXHRcdFx0Y2hlY2soWzB4MDEsIDB4MDAsIDB4MDJdLCB7b2Zmc2V0OiA4fSkgfHxcblx0XHRcdGNoZWNrKFsweDAyLCAweDAwLCAweDAyXSwge29mZnNldDogOH0pXG5cdFx0KVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnZW90Jyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgwMCwgMHgwMSwgMHgwMCwgMHgwMCwgMHgwMF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3R0ZicsXG5cdFx0XHRtaW1lOiAnZm9udC90dGYnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0RiwgMHg1NCwgMHg1NCwgMHg0RiwgMHgwMF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ290ZicsXG5cdFx0XHRtaW1lOiAnZm9udC9vdGYnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgwMCwgMHgwMCwgMHgwMSwgMHgwMF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2ljbycsXG5cdFx0XHRtaW1lOiAnaW1hZ2UveC1pY29uJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NDYsIDB4NEMsIDB4NTYsIDB4MDFdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdmbHYnLFxuXHRcdFx0bWltZTogJ3ZpZGVvL3gtZmx2J1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4MjUsIDB4MjFdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdwcycsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24vcG9zdHNjcmlwdCdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweEZELCAweDM3LCAweDdBLCAweDU4LCAweDVBLCAweDAwXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAneHonLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gteHonXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg1MywgMHg1MSwgMHg0QywgMHg2OV0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3NxbGl0ZScsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC1zcWxpdGUzJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NEUsIDB4NDUsIDB4NTMsIDB4MUFdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICduZXMnLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtbmludGVuZG8tbmVzLXJvbSdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDQzLCAweDcyLCAweDMyLCAweDM0XSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnY3J4Jyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LWdvb2dsZS1jaHJvbWUtZXh0ZW5zaW9uJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoXG5cdFx0Y2hlY2soWzB4NEQsIDB4NTMsIDB4NDMsIDB4NDZdKSB8fFxuXHRcdGNoZWNrKFsweDQ5LCAweDUzLCAweDYzLCAweDI4XSlcblx0KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2NhYicsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24vdm5kLm1zLWNhYi1jb21wcmVzc2VkJ1xuXHRcdH07XG5cdH1cblxuXHQvLyBOZWVkcyB0byBiZSBiZWZvcmUgYGFyYCBjaGVja1xuXHRpZiAoY2hlY2soWzB4MjEsIDB4M0MsIDB4NjEsIDB4NzIsIDB4NjMsIDB4NjgsIDB4M0UsIDB4MEEsIDB4NjQsIDB4NjUsIDB4NjIsIDB4NjksIDB4NjEsIDB4NkUsIDB4MkQsIDB4NjIsIDB4NjksIDB4NkUsIDB4NjEsIDB4NzIsIDB4NzldKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdkZWInLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtZGViJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4MjEsIDB4M0MsIDB4NjEsIDB4NzIsIDB4NjMsIDB4NjgsIDB4M0VdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdhcicsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC11bml4LWFyY2hpdmUnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHhFRCwgMHhBQiwgMHhFRSwgMHhEQl0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3JwbScsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC1ycG0nXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHgxRiwgMHhBMF0pIHx8XG5cdFx0Y2hlY2soWzB4MUYsIDB4OURdKVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnWicsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC1jb21wcmVzcydcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDRDLCAweDVBLCAweDQ5LCAweDUwXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbHonLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtbHppcCdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweEQwLCAweENGLCAweDExLCAweEUwLCAweEExLCAweEIxLCAweDFBLCAweEUxXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbXNpJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LW1zaSdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDA2LCAweDBFLCAweDJCLCAweDM0LCAweDAyLCAweDA1LCAweDAxLCAweDAxLCAweDBELCAweDAxLCAweDAyLCAweDAxLCAweDAxLCAweDAyXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbXhmJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi9teGYnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0N10sIHtvZmZzZXQ6IDR9KSAmJiAoY2hlY2soWzB4NDddLCB7b2Zmc2V0OiAxOTJ9KSB8fCBjaGVjayhbMHg0N10sIHtvZmZzZXQ6IDE5Nn0pKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdtdHMnLFxuXHRcdFx0bWltZTogJ3ZpZGVvL21wMnQnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0MiwgMHg0QywgMHg0NSwgMHg0RSwgMHg0NCwgMHg0NSwgMHg1Ml0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2JsZW5kJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LWJsZW5kZXInXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0MiwgMHg1MCwgMHg0NywgMHhGQl0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2JwZycsXG5cdFx0XHRtaW1lOiAnaW1hZ2UvYnBnJ1xuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn07IiwiLy8gaHR0cDovL3dpa2kuY29tbW9uanMub3JnL3dpa2kvVW5pdF9UZXN0aW5nLzEuMFxuLy9cbi8vIFRISVMgSVMgTk9UIFRFU1RFRCBOT1IgTElLRUxZIFRPIFdPUksgT1VUU0lERSBWOCFcbi8vXG4vLyBPcmlnaW5hbGx5IGZyb20gbmFyd2hhbC5qcyAoaHR0cDovL25hcndoYWxqcy5vcmcpXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgVGhvbWFzIFJvYmluc29uIDwyODBub3J0aC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvXG4vLyBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxuLy8gcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG4vLyBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTlxuLy8gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHdoZW4gdXNlZCBpbiBub2RlLCB0aGlzIHdpbGwgYWN0dWFsbHkgbG9hZCB0aGUgdXRpbCBtb2R1bGUgd2UgZGVwZW5kIG9uXG4vLyB2ZXJzdXMgbG9hZGluZyB0aGUgYnVpbHRpbiB1dGlsIG1vZHVsZSBhcyBoYXBwZW5zIG90aGVyd2lzZVxuLy8gdGhpcyBpcyBhIGJ1ZyBpbiBub2RlIG1vZHVsZSBsb2FkaW5nIGFzIGZhciBhcyBJIGFtIGNvbmNlcm5lZFxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsLycpO1xuXG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vIDEuIFRoZSBhc3NlcnQgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9ucyB0aGF0IHRocm93XG4vLyBBc3NlcnRpb25FcnJvcidzIHdoZW4gcGFydGljdWxhciBjb25kaXRpb25zIGFyZSBub3QgbWV0LiBUaGVcbi8vIGFzc2VydCBtb2R1bGUgbXVzdCBjb25mb3JtIHRvIHRoZSBmb2xsb3dpbmcgaW50ZXJmYWNlLlxuXG52YXIgYXNzZXJ0ID0gbW9kdWxlLmV4cG9ydHMgPSBvaztcblxuLy8gMi4gVGhlIEFzc2VydGlvbkVycm9yIGlzIGRlZmluZWQgaW4gYXNzZXJ0LlxuLy8gbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7IG1lc3NhZ2U6IG1lc3NhZ2UsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkIH0pXG5cbmFzc2VydC5Bc3NlcnRpb25FcnJvciA9IGZ1bmN0aW9uIEFzc2VydGlvbkVycm9yKG9wdGlvbnMpIHtcbiAgdGhpcy5uYW1lID0gJ0Fzc2VydGlvbkVycm9yJztcbiAgdGhpcy5hY3R1YWwgPSBvcHRpb25zLmFjdHVhbDtcbiAgdGhpcy5leHBlY3RlZCA9IG9wdGlvbnMuZXhwZWN0ZWQ7XG4gIHRoaXMub3BlcmF0b3IgPSBvcHRpb25zLm9wZXJhdG9yO1xuICBpZiAob3B0aW9ucy5tZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubWVzc2FnZSA9IGdldE1lc3NhZ2UodGhpcyk7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gdHJ1ZTtcbiAgfVxuICB2YXIgc3RhY2tTdGFydEZ1bmN0aW9uID0gb3B0aW9ucy5zdGFja1N0YXJ0RnVuY3Rpb24gfHwgZmFpbDtcblxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBzdGFja1N0YXJ0RnVuY3Rpb24pO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIG5vbiB2OCBicm93c2VycyBzbyB3ZSBjYW4gaGF2ZSBhIHN0YWNrdHJhY2VcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCk7XG4gICAgaWYgKGVyci5zdGFjaykge1xuICAgICAgdmFyIG91dCA9IGVyci5zdGFjaztcblxuICAgICAgLy8gdHJ5IHRvIHN0cmlwIHVzZWxlc3MgZnJhbWVzXG4gICAgICB2YXIgZm5fbmFtZSA9IHN0YWNrU3RhcnRGdW5jdGlvbi5uYW1lO1xuICAgICAgdmFyIGlkeCA9IG91dC5pbmRleE9mKCdcXG4nICsgZm5fbmFtZSk7XG4gICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgLy8gb25jZSB3ZSBoYXZlIGxvY2F0ZWQgdGhlIGZ1bmN0aW9uIGZyYW1lXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gc3RyaXAgb3V0IGV2ZXJ5dGhpbmcgYmVmb3JlIGl0IChhbmQgaXRzIGxpbmUpXG4gICAgICAgIHZhciBuZXh0X2xpbmUgPSBvdXQuaW5kZXhPZignXFxuJywgaWR4ICsgMSk7XG4gICAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcobmV4dF9saW5lICsgMSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhY2sgPSBvdXQ7XG4gICAgfVxuICB9XG59O1xuXG4vLyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IgaW5zdGFuY2VvZiBFcnJvclxudXRpbC5pbmhlcml0cyhhc3NlcnQuQXNzZXJ0aW9uRXJyb3IsIEVycm9yKTtcblxuZnVuY3Rpb24gcmVwbGFjZXIoa2V5LCB2YWx1ZSkge1xuICBpZiAodXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJycgKyB2YWx1ZTtcbiAgfVxuICBpZiAodXRpbC5pc051bWJlcih2YWx1ZSkgJiYgIWlzRmluaXRlKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIGlmICh1dGlsLmlzRnVuY3Rpb24odmFsdWUpIHx8IHV0aWwuaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZShzLCBuKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHMpKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoIDwgbiA/IHMgOiBzLnNsaWNlKDAsIG4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZikge1xuICByZXR1cm4gdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5hY3R1YWwsIHJlcGxhY2VyKSwgMTI4KSArICcgJyArXG4gICAgICAgICBzZWxmLm9wZXJhdG9yICsgJyAnICtcbiAgICAgICAgIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuZXhwZWN0ZWQsIHJlcGxhY2VyKSwgMTI4KTtcbn1cblxuLy8gQXQgcHJlc2VudCBvbmx5IHRoZSB0aHJlZSBrZXlzIG1lbnRpb25lZCBhYm92ZSBhcmUgdXNlZCBhbmRcbi8vIHVuZGVyc3Rvb2QgYnkgdGhlIHNwZWMuIEltcGxlbWVudGF0aW9ucyBvciBzdWIgbW9kdWxlcyBjYW4gcGFzc1xuLy8gb3RoZXIga2V5cyB0byB0aGUgQXNzZXJ0aW9uRXJyb3IncyBjb25zdHJ1Y3RvciAtIHRoZXkgd2lsbCBiZVxuLy8gaWdub3JlZC5cblxuLy8gMy4gQWxsIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgdGhyb3cgYW4gQXNzZXJ0aW9uRXJyb3Jcbi8vIHdoZW4gYSBjb3JyZXNwb25kaW5nIGNvbmRpdGlvbiBpcyBub3QgbWV0LCB3aXRoIGEgbWVzc2FnZSB0aGF0XG4vLyBtYXkgYmUgdW5kZWZpbmVkIGlmIG5vdCBwcm92aWRlZC4gIEFsbCBhc3NlcnRpb24gbWV0aG9kcyBwcm92aWRlXG4vLyBib3RoIHRoZSBhY3R1YWwgYW5kIGV4cGVjdGVkIHZhbHVlcyB0byB0aGUgYXNzZXJ0aW9uIGVycm9yIGZvclxuLy8gZGlzcGxheSBwdXJwb3Nlcy5cblxuZnVuY3Rpb24gZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBvcGVyYXRvciwgc3RhY2tTdGFydEZ1bmN0aW9uKSB7XG4gIHRocm93IG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3Ioe1xuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgIG9wZXJhdG9yOiBvcGVyYXRvcixcbiAgICBzdGFja1N0YXJ0RnVuY3Rpb246IHN0YWNrU3RhcnRGdW5jdGlvblxuICB9KTtcbn1cblxuLy8gRVhURU5TSU9OISBhbGxvd3MgZm9yIHdlbGwgYmVoYXZlZCBlcnJvcnMgZGVmaW5lZCBlbHNld2hlcmUuXG5hc3NlcnQuZmFpbCA9IGZhaWw7XG5cbi8vIDQuIFB1cmUgYXNzZXJ0aW9uIHRlc3RzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0cnV0aHksIGFzIGRldGVybWluZWRcbi8vIGJ5ICEhZ3VhcmQuXG4vLyBhc3NlcnQub2soZ3VhcmQsIG1lc3NhZ2Vfb3B0KTtcbi8vIFRoaXMgc3RhdGVtZW50IGlzIGVxdWl2YWxlbnQgdG8gYXNzZXJ0LmVxdWFsKHRydWUsICEhZ3VhcmQsXG4vLyBtZXNzYWdlX29wdCk7LiBUbyB0ZXN0IHN0cmljdGx5IGZvciB0aGUgdmFsdWUgdHJ1ZSwgdXNlXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwodHJ1ZSwgZ3VhcmQsIG1lc3NhZ2Vfb3B0KTsuXG5cbmZ1bmN0aW9uIG9rKHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIGZhaWwodmFsdWUsIHRydWUsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5vayk7XG59XG5hc3NlcnQub2sgPSBvaztcblxuLy8gNS4gVGhlIGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzaGFsbG93LCBjb2VyY2l2ZSBlcXVhbGl0eSB3aXRoXG4vLyA9PS5cbi8vIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5lcXVhbCA9IGZ1bmN0aW9uIGVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPSBleHBlY3RlZCkgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQuZXF1YWwpO1xufTtcblxuLy8gNi4gVGhlIG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHdoZXRoZXIgdHdvIG9iamVjdHMgYXJlIG5vdCBlcXVhbFxuLy8gd2l0aCAhPSBhc3NlcnQubm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RXF1YWwgPSBmdW5jdGlvbiBub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPScsIGFzc2VydC5ub3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDcuIFRoZSBlcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgYSBkZWVwIGVxdWFsaXR5IHJlbGF0aW9uLlxuLy8gYXNzZXJ0LmRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoIV9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwRXF1YWwnLCBhc3NlcnQuZGVlcEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0J1ZmZlcihhY3R1YWwpICYmIHV0aWwuaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgaWYgKGFjdHVhbC5sZW5ndGggIT0gZXhwZWN0ZWQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNPYmplY3QoYWN0dWFsKSAmJiAhdXRpbC5pc09iamVjdChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIpIHtcbiAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgdXRpbC5pc051bGxPclVuZGVmaW5lZChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvLyBpZiBvbmUgaXMgYSBwcmltaXRpdmUsIHRoZSBvdGhlciBtdXN0IGJlIHNhbWVcbiAgaWYgKHV0aWwuaXNQcmltaXRpdmUoYSkgfHwgdXRpbC5pc1ByaW1pdGl2ZShiKSkge1xuICAgIHJldHVybiBhID09PSBiO1xuICB9XG4gIHZhciBhSXNBcmdzID0gaXNBcmd1bWVudHMoYSksXG4gICAgICBiSXNBcmdzID0gaXNBcmd1bWVudHMoYik7XG4gIGlmICgoYUlzQXJncyAmJiAhYklzQXJncykgfHwgKCFhSXNBcmdzICYmIGJJc0FyZ3MpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgaWYgKGFJc0FyZ3MpIHtcbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBfZGVlcEVxdWFsKGEsIGIpO1xuICB9XG4gIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICBrYiA9IG9iamVjdEtleXMoYiksXG4gICAgICBrZXksIGk7XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIDguIFRoZSBub24tZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGZvciBhbnkgZGVlcCBpbmVxdWFsaXR5LlxuLy8gYXNzZXJ0Lm5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3REZWVwRXF1YWwgPSBmdW5jdGlvbiBub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBFcXVhbCcsIGFzc2VydC5ub3REZWVwRXF1YWwpO1xuICB9XG59O1xuXG4vLyA5LiBUaGUgc3RyaWN0IGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzdHJpY3QgZXF1YWxpdHksIGFzIGRldGVybWluZWQgYnkgPT09LlxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnN0cmljdEVxdWFsID0gZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09PScsIGFzc2VydC5zdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDEwLiBUaGUgc3RyaWN0IG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHN0cmljdCBpbmVxdWFsaXR5LCBhc1xuLy8gZGV0ZXJtaW5lZCBieSAhPT0uICBhc3NlcnQubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT09JywgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkge1xuICBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHJldHVybiBleHBlY3RlZC50ZXN0KGFjdHVhbCk7XG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChleHBlY3RlZC5jYWxsKHt9LCBhY3R1YWwpID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF90aHJvd3Moc2hvdWxkVGhyb3csIGJsb2NrLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICB2YXIgYWN0dWFsO1xuXG4gIGlmICh1dGlsLmlzU3RyaW5nKGV4cGVjdGVkKSkge1xuICAgIG1lc3NhZ2UgPSBleHBlY3RlZDtcbiAgICBleHBlY3RlZCA9IG51bGw7XG4gIH1cblxuICB0cnkge1xuICAgIGJsb2NrKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBhY3R1YWwgPSBlO1xuICB9XG5cbiAgbWVzc2FnZSA9IChleHBlY3RlZCAmJiBleHBlY3RlZC5uYW1lID8gJyAoJyArIGV4cGVjdGVkLm5hbWUgKyAnKS4nIDogJy4nKSArXG4gICAgICAgICAgICAobWVzc2FnZSA/ICcgJyArIG1lc3NhZ2UgOiAnLicpO1xuXG4gIGlmIChzaG91bGRUaHJvdyAmJiAhYWN0dWFsKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoIXNob3VsZFRocm93ICYmIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnR290IHVud2FudGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICgoc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmIGV4cGVjdGVkICYmXG4gICAgICAhZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8ICghc2hvdWxkVGhyb3cgJiYgYWN0dWFsKSkge1xuICAgIHRocm93IGFjdHVhbDtcbiAgfVxufVxuXG4vLyAxMS4gRXhwZWN0ZWQgdG8gdGhyb3cgYW4gZXJyb3I6XG4vLyBhc3NlcnQudGhyb3dzKGJsb2NrLCBFcnJvcl9vcHQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnRocm93cyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFt0cnVlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuLy8gRVhURU5TSU9OISBUaGlzIGlzIGFubm95aW5nIHRvIHdyaXRlIG91dHNpZGUgdGhpcyBtb2R1bGUuXG5hc3NlcnQuZG9lc05vdFRocm93ID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbZmFsc2VdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG5hc3NlcnQuaWZFcnJvciA9IGZ1bmN0aW9uKGVycikgeyBpZiAoZXJyKSB7dGhyb3cgZXJyO319O1xuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXNPd24uY2FsbChvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiBrZXlzO1xufTtcbiIsIiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCJjb25zdCBVcHB5ID0gcmVxdWlyZSgndXBweS9saWIvY29yZS9Db3JlJylcbmNvbnN0IEdvb2dsZURyaXZlID0gcmVxdWlyZSgndXBweS9saWIvcGx1Z2lucy9Hb29nbGVEcml2ZScpXG5jb25zdCBVUFBZX1NFUlZFUiA9IHJlcXVpcmUoJy4uL2VudicpXG5cbmNvbnN0IHVwcHkgPSBuZXcgVXBweSh7ZGVidWc6IHRydWUsIGF1dG9Qcm9jZWVkOiBmYWxzZX0pXG51cHB5XG4gIC51c2UoR29vZ2xlRHJpdmUsIHsgdGFyZ2V0OiAnI0dvb2dsZURyaXZlQ29udGFpbmVyJywgaG9zdDogVVBQWV9TRVJWRVIgfSlcbiAgLnJ1bigpXG4iLCJsZXQgdXBweVNlcnZlckVuZHBvaW50ID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAyMCdcblxuaWYgKGxvY2F0aW9uLmhvc3RuYW1lID09PSAndXBweS5pbycpIHtcbiAgdXBweVNlcnZlckVuZHBvaW50ID0gJy8vc2VydmVyLnVwcHkuaW8nXG59XG5cbmNvbnN0IFVQUFlfU0VSVkVSID0gdXBweVNlcnZlckVuZHBvaW50XG5tb2R1bGUuZXhwb3J0cyA9IFVQUFlfU0VSVkVSXG4iXX0=
