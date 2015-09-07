(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require("./sidebar");
},{"./sidebar":2}],2:[function(require,module,exports){
function show(){showing||(body.classList.add("sidebar-show"),showing=!0)}function hide(){showing&&(body.classList.remove("sidebar-show"),showing=!1)}function toggle(){showing?hide():show()}var sensor=require("sensor").sensor,Swipeit=require("swipeit"),body=document.body,sidebar=document.querySelector("[data-sidebar]"),ham=document.querySelector("[data-sidebar-toggle]"),showing=!1;sensor(ham).on("click",function(e){e.preventDefault(),toggle()});var swipe=new Swipeit(body);swipe.on("west",function(e){show()}),swipe.on("east",function(e){hide()}),module.exports={show:show,hide:hide,toggle:toggle};

},{"sensor":4,"swipeit":5}],3:[function(require,module,exports){
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

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],4:[function(require,module,exports){
// Sensor v0.1.0
// Copyright (2013) Rich Harris
// Released under the MIT License

// https://github.com/science-gamed/Sensor

;(function ( global ) {

'use strict';

var sensor, proto, definitions, patched, matches, classPattern, cachedPatterns, proxy, getElFromString;

sensor = function ( el ) {
	var sensor;

	if ( !el ) {
		el = window;
	}

	if ( typeof el === 'string' ) {
		el = getElFromString( el );

		if ( !el ) {
			throw new Error( 'Could not find specified element' );
		}
	}

	if ( el.__sensor ) {
		return el.__sensor;
	}

	if ( !( el instanceof Node ) && !( el instanceof Window ) ) {
		throw new Error( 'Object must be a DOM node, or the window object' );
	}

	sensor = Object.create( proto );

	sensor.el = el;
	sensor.listeners = {};
	sensor.boundEvents = {};

	el.__sensor = sensor;

	return sensor;
};

proto = {
	on: function ( eventName, childSelector, handler ) {

		var self = this, listeners, listener, cancelled, map, key, index;

		// allow multiple listeners to be attached in one go
		if ( typeof eventName === 'object' ) {
			map = eventName;
			listeners = [];

			for ( key in map ) {
				if ( map.hasOwnProperty( key ) ) {
					if ( typeof map[ key ] === 'function' ) {
						handler = map[ key ];

						if ( ( index = key.indexOf( ' ' ) ) !== -1 ) {
							eventName = key.substr( 0, index );
							childSelector = key.substring( index + 1 );
						}

						else {
							eventName = key;
							childSelector = null;
						}
					}


					else if ( typeof map[ key ] === 'object' ) {
						eventName = key;
						childSelector = map[ key ].childSelector;
						handler = map[ key ].handler;
					}

					listener = {
						eventName: eventName,
						childSelector: childSelector,
						handler: handler
					};

					this._addListener( listener );
				}
			}

			return {
				cancel: function () {
					if ( !cancelled ) {
						while ( listeners.length ) {
							self.off( listeners.pop() );
						}
						cancelled = true;
					}
				}
			};
		}

		// there may not be a child selector involved
		if ( !handler ) {
			handler = childSelector;
			childSelector = null;
		}

		listener = {
			eventName: eventName,
			childSelector: childSelector,
			handler: handler
		};

		this._addListener( listener );

		return {
			cancel: function () {
				if ( !cancelled ) {
					self.off( listener );
					cancelled = true;
				}
			}
		};
	},

	off: function ( eventName, childSelector, handler ) {
		var self = this, listeners, listener, index, teardown, name;

		teardown = function ( eventName ) {
			delete self.listeners[ eventName ];

			self.boundEvents[ eventName ].teardown();
			delete self.boundEvents[ eventName ];
		};

		// no arguments supplied - remove all listeners for all event types
		if ( !arguments.length ) {
			for ( name in this.boundEvents ) {
				if ( this.boundEvents.hasOwnProperty( name ) ) {
					teardown( name );
				}
			}

			return;
		}

		// one argument supplied - could be a listener (via listener.cancel) or
		// an event name
		if ( arguments.length === 1 ) {
			if ( typeof eventName === 'object' ) {
				listener = eventName;
				eventName = listener.eventName;

				listeners = this.listeners[ eventName ];

				if ( !listeners ) {
					return;
				}

				index = listeners.indexOf( listener );

				if ( index === -1 ) {
					return;
				}

				listeners.splice( index, 1 );

				if ( !listeners.length ) {
					teardown( eventName );
				}

				return;
			}

			// otherwise it's a string, i.e. an event name
			teardown( eventName );
			return;
		}

		// two arguments supplied
		if ( arguments.length === 2 ) {
			// no child selector supplied
			if ( typeof childSelector === 'function' ) {
				handler = childSelector;
				childSelector = null;
			}

			// no handler supplied, which means we're removing all listeners applying
			// to this event name and child selector
			else {
				listeners = this.listeners[ eventName ];

				if ( listeners ) {
					this.listeners[ eventName ] = listeners.filter( function ( listener ) {
						return listener.childSelector !== childSelector;
					});

					if ( !this.listeners[ eventName ].length ) {
						teardown( eventName );
					}
				}

				return;
			}
		}

		// we have an event name, a child selector (possibly null), and a handler
		if ( this.listeners[ eventName ] ) {

			if ( childSelector ) {
				this.listeners[ eventName ] = this.listeners[ eventName ].filter( function ( listener ) {
					return listener.childSelector !== childSelector || listener.handler !== handler;
				});
			}

			else {
				this.listeners[ eventName ] = this.listeners[ eventName ].filter( function ( listener ) {
					return listener.childSelector  || listener.handler !== handler;
				});
			}

			if ( !this.listeners[ eventName ].length ) {
				teardown( eventName );
			}

			return;
		}
	},

	once: function ( eventName, childSelector, handler ) {
		var suicidalListener;

		if ( arguments.length === 2 ) {
			handler = childSelector;
			childSelector = null;
		}

		suicidalListener = this.on( eventName, childSelector, function () {
			handler.apply( this, arguments );
			suicidalListener.cancel();
		});

		return suicidalListener;
	},

	_addListener: function ( listener ) {
		var eventName = listener.eventName;

		if ( !this.listeners[ eventName ] ) {
			this.listeners[ eventName ] = [];
		}

		this.listeners[ eventName ].push( listener );
		this._bindEvent( eventName );
	},

	_bindEvent: function ( eventName ) {
		var self = this, definition;

		definition = definitions[ eventName ];

		if ( !definition ) {
			// assume this is a standard event - we need to proxy it
			definition = proxy( eventName );
		}

		if ( !this.boundEvents[ eventName ] ) {

			// block any children from binding before we've finished
			this.boundEvents[ eventName ] = true;

			// apply definition
			this.boundEvents[ eventName ] = definition.call( null, this.el, this, function () {
				var listeners, listener, i, el, match;

				// clone listeners, so any listeners bound by the handler don't
				// get called until it's their turn (e.g. doubletap)
				listeners = self.listeners[ eventName ].slice();

				for ( i=0; i<listeners.length; i+=1 ) {
					listener = listeners[i];

					if ( listener.childSelector ) {
						el = this;

						if ( el === self.el ) {
							continue; // not a child of self.el
						}

						while ( !match && el !== self.el ) {
							if ( matches( el, listener.childSelector ) ) {
								match = el;
							}

							el = el.parentNode;
						}

						if ( match ) {
							listener.handler.apply( match, arguments );
						}

					} else {
						listener.handler.apply( self.el, arguments );
					}
				}
			});
		}
	}
};

definitions = {};

// define custom events
sensor.define = function ( name, definition ) {
	definitions[ name ] = definition;
};

// matching
(function ( ElementPrototype ) {
	ElementPrototype.matches = ElementPrototype.matches || ElementPrototype.matchesSelector || 
	ElementPrototype.mozMatches    || ElementPrototype.mozMatchesSelector ||
	ElementPrototype.msMatches     || ElementPrototype.msMatchesSelector  ||
	ElementPrototype.oMatches      || ElementPrototype.oMatchesSelector   ||
	ElementPrototype.webkitMatches || ElementPrototype.webkitMatchesSelector;
}( Element.prototype ));

sensor.patch = function () {
	if ( patched ) {
		return;
	}

	[ Node.prototype, Window.prototype ].forEach( function ( proto ) {
		proto.on = function () {
			this.__sensor = sensor( this );
			this.__sensor.on.apply( this.__sensor, arguments );
		};

		proto.off = function () {
			this.__sensor = sensor( this );
			this.__sensor.off.apply( this.__sensor, arguments );
		};
	});

	patched = true;
};

classPattern = /^\.([^ ]+)$/;

matches = function ( el, childSelector ) {

	var classMatch, pattern;

	// CSS selectors - use el.matches if available
	if ( typeof childSelector === 'string' ) {
		if ( el.matches ) {
			return el.matches( childSelector );
		}

		// you need to bring your own el.matches polyfill - but we'll make
		// an exception for tag names...
		else if ( el.tagName.toLowerCase() === childSelector.toLowerCase() ) {
			return true;
		}

		// ...and class names
		else if ( classMatch = classPattern.exec( childSelector ) ) {
			pattern = cachedPatterns[ childSelector ] || (function () {
				return ( cachedPatterns[ childSelector ] = new RegExp( '\\s*' + childSelector + '\\s*' ) );
			}());

			return el.className.test( pattern );
		}

		throw ( 'This browser does not support matches (aka matchesSelector) - either polyfill it (see e.g. https://github.com/termi/CSS_selector_engine) or only use class names, element arrays, or functions as child selectors' );
	}

	if ( typeof childSelector === 'function' ) {
		return childSelector( el );
	}

	if ( childSelector.length ) {
		i = childSelector.length;
		while ( i-- ) {
			if ( childSelector[i] === el ) {
				return true;
			}
		}

		return false;
	}

	throw 'Illegal child selector';
};


getElFromString = function ( str ) {
	var el;

	if ( document.querySelector ) {
		if ( el = document.querySelector( str ) ) {
			return el;
		}
	}

	if ( str.charAt( 0 ) === '#' ) {
		if ( el = document.getElementById( str.substring( 1 ) ) ) {
			return el;
		}
	}

	return document.getElementById( str );
};


proxy = function ( eventName ) {
	var definition = function ( el, elSensor, fire ) {
		var handler = function ( event ) {
			fire.call( event.target, event );
		};

		el.addEventListener( eventName, handler );

		return {
			teardown: function () {
				el.removeEventListener( eventName, handler );
			}
		};
	};

	sensor.define( eventName, definition );

	return definition;
};


// doubletap event

(function ( sensor ) {

	'use strict';

	sensor.define( 'doubletap', function ( el, elSensor, fire ) {

		var threshold, interval, listener;

		threshold = 5; // px
		interval = 500; // ms

		listener = elSensor.on( 'tap', function ( x1, y1 ) {
			var secondTapListener = elSensor.on( 'tap', function ( x2, y2, event ) {
				var dx = Math.abs( x1 - x2 ), dy = Math.abs( y1 - y2 );

				if ( dx <= threshold && dy <= threshold ) {
					fire( x2, y2, event );
				}
			});

			setTimeout( secondTapListener.cancel, interval );
		});

		return {
			teardown: listener.cancel
		};
	});

}( sensor ));


// pull events

(function ( sensor ) {

	'use strict';

	// TODO touch equivalents

	sensor.define( 'pullstart', function ( el, elSensor, fire ) {
		var listener = elSensor.on( 'mousedown', function ( event ) {
			var x, y;

			x = event.offsetX;
			y = event.offsetY;

			elSensor.pull = {
				start: {
					x: x,
					y: y
				},
				last: {
					x: x,
					y: y
				}
			};

			fire( x, y, event );
		});

		return {
			teardown: listener.cancel
		};
	});


	sensor.define( 'pull', function ( el, elSensor, fire ) {
		var listener = elSensor.on( 'pullstart', function () {
			var moveListener;

			moveListener = elSensor.on( 'mousemove', function ( event ) {
				var x, y;

				x = event.offsetX;
				y = event.offsetY;

				fire.call( el, x - elSensor.pull.last.x, y - elSensor.pull.last.y );
				elSensor.pull.last.x = x;
				elSensor.pull.last.y = y;
			});

			elSensor.once( 'mouseup', moveListener.cancel );
		});

		return {
			teardown: listener.cancel
		};
	});



	sensor.define( 'pullend', function ( el, elSensor, fire ) {
		var listener = elSensor.on( 'pullstart', function () {
			elSensor.once( 'mouseup', function ( x, y, event ) {
				fire.call( el, x, y, event );
			});
		});

		return {
			teardown: listener.cancel
		};
	});

}( sensor ));
// tap event

(function ( sensor ) {

	'use strict';

	var sWindow = sensor( window );

	sensor.define( 'tap', function ( el, elSensor, fire ) {
		var threshold, interval, mouseListener, touchListener;

		threshold = 5; // px
		interval = 200; // ms

		mouseListener = elSensor.on( 'mousedown', function ( downEvent ) {
			var mousemove, mouseup, teardown, cancelled, startX, startY;

			startX = downEvent.clientX;
			startY = downEvent.clientY;

			teardown = function () {
				if ( cancelled ) {
					return;
				}

				mouseup.cancel();
				mousemove.cancel();

				cancelled = true;
			};

			mouseup = sWindow.on( 'mouseup', function ( upEvent ) {
				fire.call( downEvent.target, downEvent.offsetX, downEvent.offsetY, upEvent );
				teardown();
			});

			mousemove = sWindow.on( 'mousemove', function ( event ) {
				var x = event.clientX, y = event.clientY;

				if ( Math.abs( x - startX ) > threshold || Math.abs( y - startY ) > threshold ) {
					teardown();
				}
			});

			setTimeout( teardown, interval );
		});

		touchListener = elSensor.on( 'touchstart', function ( event ) {
			var touch, finger, target, startX, startY, touchstart, touchmove, touchend, touchcancel, teardown, cancelled;

			if ( event.touches.length !== 1 ) {
				return;
			}

			touch = event.touches[0];
			finger = touch.identifier;
			target = touch.target;

			startX = touch.clientX;
			startY = touch.clientY;

			teardown = function () {
				if ( cancelled ) {
					return;
				}

				touchstart.cancel();
				touchend.cancel();
				touchmove.cancel();
				touchcancel.cancel();

				cancelled = true;
			};

			// if another finger touches before tap has completed, abort
			touchstart = sWindow.on( 'touchstart', teardown );

			touchend = sWindow.on( 'touchend', function ( upEvent ) {
				fire.call( target, touch.offsetX, touch.offsetY, upEvent );
				teardown();
			});

			touchmove = sWindow.on( 'touchmove', function ( event ) {
				var touch, x, y;

				touch = event.touches[0];

				x = touch.clientX;
				y = touch.clientY;

				if ( Math.abs( x - startX ) > threshold || Math.abs( y - startY ) > threshold ) {
					teardown();
				}
			});

			setTimeout( teardown, interval );
		});

		return {
			teardown: function () {
				mouseListener.cancel();
				touchListener.cancel();
			}
		};
	});

}( sensor ));



if ( typeof global.module !== "undefined" && global.module.exports ) { global.module.exports = sensor; }
else if ( typeof global.define !== "undefined" && global.define.amd ) { global.define( function () { return sensor; }); }
else { global.sensor = sensor; }

}( this ));
},{}],5:[function(require,module,exports){
var events = require("events")

var Swiper = function( element){
	
	this.element = element;

	this.events = new events.EventEmitter();

	var _this = this;

	this.element.addEventListener('touchstart', function(evt){ _this.handleTouchStart(evt) }, false);        
  this.element.addEventListener('touchmove', function(evt){ _this.handleTouchMove(evt) } , false);
}

Swiper.prototype.emit = function(event, data){
	this.events.emit(event,data);
}

Swiper.prototype.on = function( event, callback ){
	this.events.on(event, callback);
}

Swiper.prototype.handleTouchStart = function(evt){
  this.xDown = evt.touches[0].clientX;                                      
  this.yDown = evt.touches[0].clientY;  
}

Swiper.prototype.handleTouchMove = function(evt){
	var _this = this;
	if ( ! this.xDown || ! this.yDown ) return;

  var xUp = evt.touches[0].clientX;                                    
  var yUp = evt.touches[0].clientY;

  var xDiff = this.xDown - xUp;
  var yDiff = this.yDown - yUp;

	if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
		if ( xDiff > 0 ) this.events.emit("east", { amount: xDiff, event: evt } )
		else this.events.emit("west", { amount: xDiff, event: evt } )
  } 
  else {
		if ( yDiff > 0 ) this.events.emit("north", { amount: yDiff, event: evt } )
		else this.events.emit("south", { amount: yDiff, event: evt } )
	}
      
  /* reset values */
  this.xDown = null;
  this.yDown = null;                                             
  
}

if(module) module.exports = Swiper;
else window.Swiper = Swiper;

},{"events":3}]},{},[1]);
