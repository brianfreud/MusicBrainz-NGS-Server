/* This file exists to provide jsdoc with the symbols for the MusicBrainz parent variable.  This file is not used, otherwise; this variable
 * declaration is actually performed within a <script> tag, located in root/layout.tt. 
 */

/** 
 * @fileOverview This file creates the global MusicBrainz namespace used to store all other site javascript.
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 */

"use strict";

/**
 * @description Central namespace, used to store all MusicBrainz functionality.
 * @name MusicBrainz
 * @namespace
 */
var MusicBrainz = {};

// The following stubs out Sizzle, QUnit, jQuery, and the jQuery plugin structure such that jsdoc can figure out the correct structure, as
// those files don't have proper jsdoc symbols.  As the anonymous functions confuse jsdoc, InternalOnly is used to store (and then hide) internal
// private functions that would otherwise be exposed as if they were globally available.  The following will cause jsdoc to throw 59 warnings, 
// but they can all be safely ignored.  (They're all due to intentional symbol redefinitions or the use of @private for InternalOnly items).

/**
 * @namespace
 * @name InternalOnly
 * @private
 */

/**
 * @function
 * @name innerEquiv
 * @memberOf InternalOnly
 */

/**
 * @function
 * @name jQueryanonymous
 * @memberOf InternalOnly
 */

/**
 * @function
 * @name sortOrder
 * @memberOf InternalOnly
 */

/**
 * @function
 * @name makeArray
 * @memberOf InternalOnly
 */

/**
 * @class
 * @name jQuery
 * @exports $ as jQuery
 * @description The <a href="http://docs.jquery.com/">jQuery</a> library
 */

/**
 * @constructor
 * @name jQuery.event
 */

/**
 * @name jQuery.event.special
 * @memberOf jQuery.event
 */

/**
 * @name jQuery.event.special.ready
 * @class
 */

/**
 * @function
 * @name jQuery.event.special.ready.setup
 */

/**
 * @memberOf jQuery.event
 * @name jQuery.event.specialAll
 */

/**
 * @class
 * @name jQuery.event.specialAll.live
 */

/**
 * @class
 * @name jQuery.fn
 */

/**
 * @class
 * @name jQuery.fx
 */

/**
 * @class
 * @name jQuery.offset
 */

/**
 * @field
 * @name jQuery.offset.left
 */

/**
 * @field
 * @name jQuery.offset.top
 */

/**
 * @class
 * @name Sizzle
 * @description The <a href="http://sizzlejs.com/">Sizzle</a> library
 */

/**
 * @namespace
 * @name Sizzle.selectors
 * @exports Expr as Sizzle.selectors
 */

/**
 * @namespace
 * @name Sizzle.selectors.attrHandle
 * @exports Expr.attrHandle as Sizzle.selectors.attrHandle
 */

/**
 * @namespace
 * @name Sizzle.selectors.filter
 * @exports Expr.filter as Sizzle.selectors.filter
 */

/**
 * @namespace
 * @name Sizzle.selectors.filters
 * @exports Expr.filters as Sizzle.selectors.filters
 */

/**
 * @namespace
 * @name Sizzle.selectors.find
 * @exports Expr.find as Sizzle.selectors.find
 */

/**
 * @namespace
 * @name Sizzle.selectors.preFilter
 * @exports Expr.preFilter as Sizzle.selectors.preFilter
 */

/**
 * @namespace
 * @name Sizzle.selectors.setFilters
 * @exports Expr.setFilters as Sizzle.selectors.setFilters
 */

/**
 * @class
 * @name window

 */

/**
 * @namespace
 * @name window.jsDump
 * @memberOf InternalOnly
 * @private
 */

/**
 * @namespace
 * @name window.jsDump.parsers
 * @memberOf InternalOnly
 * @private
 */

/**
 * @namespace
 * @name opt
 * @methodOf InternalOnly
 * @private
 */

/**
 * @namespace
 * @name script
 * @methodOf InternalOnly
 * @private
 */

// Stub out functions added via .extend() that jsdoc doesn't pick up on.
/**
 * @function
 * @name jQuery.addClass
 * @param classNames
 */

/**
 * @function
 * @name jQuery.appendTo
 * @param selector
 */

/**
 * @function
 * @name jQuery.attr
 * @param elem
 * @param name
 * @param value
 */

/**
 * @function
 * @name jQuery.children
 * @param expr
 */

/**
 * @class
 * @name jQuery.className
 */

/**
 * @function
 * @name jQuery.className.add
 */

/**
 * @function
 * @name jQuery.className.has
 */

/**
 * @function
 * @name jQuery.className.remove
 */

/**
 * @function
 * @name jQuery.clean
 * @param elems
 * @param context
 * @param fragment
 */

/**
 * @function
 * @name jQuery.contents
 */

/**
 * @function
 * @name jQuery.css
 * @param elem
 * @param name
 * @param force
 * @param extra
 */

/**
 * @function
 * @name jQuery.curCSS
 * @param elem
 * @param name
 * @param force
 */

/**
 * @function
 * @name jQuery.data
 * Either (key + value) or (elem + name + data)
 * @param [key]
 * @param [value]
 * @param [elem]
 * @param [name]
 * @param [data]
 */

/**
 * @function
 * @name jQuery.dequeue
 * @param [elem]
 * @param type
 */

/**
 * @function
 * @name jQuery.each
 * @param object
 * @param callback
 * @param args
 */

/**
 * @function
 * @name jQuery.empty
 */

/**
 * @function
 * @name jQuery.globalEval
 * @param data
 */

/**
 * @function
 * @name jQuery.grep
 * @param elems
 * @param callback
 * @param inv
 */

/**
 * @function
 * @name jQuery.inArray
 * @param elem
 * @param array
 */

/**
 * @function
 * @name jQuery.insertAfter
 * @param selector
 */

/**
 * @function
 * @name jQuery.insertBefore
 * @param selector
 */

/**
 * @function
 * @name jQuery.isArray
 * @param object
 */

/**
 * @function
 * @name jQuery.isFunction
 * @param object
 */

/**
 * @function
 * @name jQuery.isXMLDoc
 * @param elem
 */

/**
 * @function
 * @name jQuery.makeArray
 * @param array
 */

/**
 * @function
 * @name jQuery.map
 * @param elems
 * @param callback
 */

/**
 * @function
 * @name jQuery.merge
 * @param first
 * @param second
 */

/**
 * @function
 * @name jQuery.nextAll
 * @param expr
 */

/**
 * @function
 * @name jQuery.next
 * @param expr
 */

/**
 * @function
 * @name jQuery.noConflict
 * @param deep
 */

/**
 * @function
 * @name jQuery.nodeName
 * @param elem
 * @param name
 */

/**
 * @function
 * @name jQuery.parent
 * @param expr
 */

/**
 * @function
 * @name jQuery.parents
 * @param expr
 */

/**
 * @function
 * @name jQuery.prependTo
 * @param selector
 */

/**
 * @function
 * @name jQuery.prevAll
 * @param expr
 */

/**
 * @function
 * @name jQuery.prev
 * @param expr
 */

/**
 * @function
 * @name jQuery.prop
 * @param elem
 * @param value
 * @param type
 * @param i
 * @param name
 */

/**
 * @function
 * @name jQuery.queue
 * @param [elem]
 * @param type
 * @param data
 */

/**
 * @function
 * @name jQuery.removeAttr
 * @param name
 */

/**
 * @function
 * @name jQuery.removeClass
 * @param classNames
 */

/**
 * @function
 * @name jQuery.removeData
 * Either (elem + name) or (key)
 * @param [elem]
 * @param [name]
 * @param [key]
 */

/**
 * @function
 * @name jQuery.remove
 * @param selector
 */

/**
 * @function
 * @name jQuery.replaceAll
 * @param selector
 */

/**
 * @function
 * @name jQuery.siblings
 * @param expr
 */

/**
 * @function
 * @name jQuery.swap
 * @param elem
 * @param options
 * @param callback
 */

/**
 * @function
 * @name jQuery.toggleClass
 * @param classNames
 * @param state
 */

/**
 * @function
 * @name jQuery.trim
 * @param string
 */

/**
 * @function
 * @name jQuery.unique
 * @param array
 */

/**
 * @namespace
 * @name jQuery.browser
 */

/**
 * @static
 * @name jQuery.browser.version
 */

/**
 * @static
 * @name jQuery.browser.safari
 */

/**
 * @static
 * @name jQuery.browser.opera
 */

/**
 * @static
 * @name jQuery.browser.msie
 */

/**
 * @static
 * @name jQuery.browser.mozilla
 */

/**
 * @name jQuery.cache
 */

/**
 * @static
 * @name jQuery.event.guid
 */

/**
 * @static
 * @name jQuery.event.global
 */

/**
 * @static
 * @name jQuery.event.props
 */

/**
 * @constructor
 * @name jQuery.Event
 */

/**
 * @function
 * @name jQuery.Event.prototype.preventDefault
 */

/**
 * @function
 * @name jQuery.Event.prototype.stopPropagation
 */

/**
 * @function
 * @name jQuery.Event.prototype.stopImmediatePropagation
 */

/**
 * @function
 * @name jQuery.Event.prototype.isDefaultPrevented
 */

/**
 * @function
 * @name jQuery.Event.prototype.isPropagationStopped
 */

/**
 * @function
 * @name jQuery.Event.prototype.isImmediatePropagationStopped
 */

/**
 * @static
 * @name jQuery.event.type
 */

/**
 * @static
 * @name jQuery.event.target
 */

/**
 * @static
 * @name jQuery.event.data
 */

/**
 * @static
 * @name jQuery.event.relatedTarget
 */

/**
 * @static
 * @name jQuery.event.currentTarget
 */

/**
 * @static
 * @name jQuery.event.pageX
 */

/**
 * @static
 * @name jQuery.event.pageY
 */

/**
 * @static
 * @name jQuery.event.result
 */

/**
 * @static
 * @name jQuery.event.timeStamp
 */

/**
 * @function
 * @name jQuery.event.blur
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.focus
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.load
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.resize
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.scroll
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.unload
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.click
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.dblclick
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.mousedown
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.mouseup
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.mousemove
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.mouseover
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.mouseout
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.mouseenter
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.mouseleave
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.change
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.select
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.submit
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.keydown
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.keypress
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.keyup
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.error
 * @param {Function} [function]
 */

/**
 * @function
 * @name jQuery.event.bind
 * @param type
 * @param data
 * @param fn
 */

/**
 * @function
 * @name jQuery.event.one
 * @param type
 * @param data
 * @param fn
 */

/**
 * @function
 * @name jQuery.event.unbind
 * @param type
 * @param fn
 */

/**
 * @function
 * @name jQuery.event.trigger
 * @param type
 * @param data
 */

/**
 * @function
 * @name jQuery.event.triggerHandler
 * @param type
 * @param data
 */

/**
 * @function
 * @name jQuery.event.toggle
 * @param fn
 */

/**
 * @function
 * @name jQuery.event.hover
 * @param fnOver
 * @param fnOut
 */

/**
 * @function
 * @name jQuery.event.ready
 * @param fn
 */

/**
 * @function
 * @name jQuery.event.live
 * @param type
 * @param fn
 */

/**
 * @function
 * @name jQuery.event.die
 * @param type
 * @param fn
 */

/**
 * @static
 * @name jQuery.event.isReady
 */

/**
 * @static
 * @name jQuery.event.readyList
 */

/**
 * @function
 * jQuery.event.ready
 */

/**
 * @namespace
 * @name jQuery.support
 */

/**
 * @static
 * @name jQuery.support.leadingWhitespace
 */

/**
 * @static
 * @name jQuery.support.tbody
 */

/**
 * @static
 * @name jQuery.support.objectAll
 */

/**
 * @static
 * @name jQuery.support.htmlSerialize
 */

/**
 * @static
 * @name jQuery.support.style
 */

/**
 * @static
 * @name jQuery.support.hrefNormalized
 */

/**
 * @static
 * @name jQuery.support.opacity
 */

/**
 * @static
 * @name jQuery.support.cssFloat
 */

/**
 * @static
 * @name jQuery.support.scriptEval
 */

/**
 * @static
 * @name jQuery.support.noCloneEvent
 */

/**
 * @static
 * @name jQuery.support.boxModel
 */

/**
 * @namespace
 * @name jQuery.props
 */

/**
 * @static
 * @name jQuery.props.for
 */

/**
 * @static
 * @name jQuery.props.class
 */

/**
 * @static
 * @name jQuery.props.float
 */

/**
 * @static
 * @name jQuery.props.cssFloat
 */

/**
 * @static
 * @name jQuery.props.styleFloat
 */

/**
 * @static
 * @name jQuery.props.readonly
 */

/**
 * @static
 * @name jQuery.props.maxlength
 */

/**
 * @static
 * @name jQuery.props.cellspacing
 */

/**
 * @static
 * @name jQuery.props.rowspan
 */

/**
 * @static
 * @name jQuery.props.tabindex
 */

/**
 * @function
 * @name jQuery.ajax
 * @param object
 * @param [options.url]
 * @param [options.type]
 * @param [options.dataType]
 * @param [options.data]
 * @param {Function} [options.complete]
 */

/**
 * @function
 * @name jQuery.ajaxSettings
 * @param {Object} options
 * @param {String} [options.url]
 * @param {Bool} [options.global]
 * @param {String} [options.type] Valid values: GET, POST
 * @param {string} [options.contentType]
 * @param {Bool} [options.processData]
 * @param {Bool} [options.async]
 * @param {Int} [options.timeout]
 * @param {Object} [options.data]
 * @param {String} [options.username]
 * @param {String} [options.password]
 * @param {Function} [options.xhr]
 * @param {Object} [options.accepts] Valid values:<ul><li>xml: application/xml, text/xml</li><li>html: text/html</li><li>script: text/javascript, application/javascript</li><li>json: application/json, text/javascript</li><li>text: text/plain</li></ul>
 * @param {String} [options.dataType] Valid values: html, text, xml, json, jsonp, script
 * @param {Bool} [options.cache]
 * @param {Bool} [options.ifModified]
 * @param {Function} [options.beforeSend]
 * @param {Function} [options.success]
 * @param {Function} [options.complete]
 * @param {Function} [options.error]
 */

/**
 * @function
 * @name jQuery.fn.load
 * @param url
 * @param params
 * @param callback
 */

/**
 * @function
 * @name jQuery.serialize
 */

/**
 * @function
 * @name jQuery.serializeArray
 */

/**
 * @function
 * @name jQuery.ajaxStart
 */

/**
 * @function
 * @name jQuery.ajaxStop
 * @param callback
 */

/**
 * @function
 * @name jQuery.ajaxComplete
 * @param callback
 */

/**
 * @function
 * @name jQuery.ajaxError
 * @param callback
 */

/**
 * @function
 * @name jQuery.ajaxSuccess
 * @param callback
 */

/**
 * @function
 * @name jQuery.ajaxSend
 * @param callback
 */

/**
 * @function
 * @name jQuery.get
 * @param url
 * @param data
 * @param callback
 * @param type
 */

/**
 * @function
 * @name jQuery.getScript
 * @param url
 * @param callback
 */

/**
 * @function
 * @name jQuery.getJSON
 * @param url
 * @param data
 * @param callback
 */

/**
 * @function
 * @name jQuery.post
 * @param url
 * @param data
 * @param callback
 * @param type
 */

/**
 * @function
 * @name jQuery.ajaxSetup
 * @param settings
 */

/**
 * @function
 * @name jQuery.handleError
 * @param s
 * @param xhr
 * @param status
 * @param e
 */

/**
 * @static
 * @name jQuery.active
 */

/**
 * @function
 * @name jQuery.httpSuccess
 * @param xhr
 */

/**
 * @function
 * @name jQuery.httpNotModified
 * @param xhr
 * @param url
 */

/**
 * @function
 * @name jQuery.httpData
 * @param xhr
 * @param type
 * @param s
 */

/**
 * @function
 * @name jQuery.param
 * @param a
 */

/**
 * @function
 * @name jQuery.fn.show
 * @param speed
 * @param callback
 */

/**
 * @function
 * @name jQuery.fn.hide
 * @param speed
 * @param callback
 */

/**
 * @function
 * @name jQuery.fn.toggle
 * @param fn
 * @param fn2
 */

/**
 * @function
 * @name jQuery.fn.fadeTo
 * @param speed
 * @param to
 * @param callback
 */

/**
 * @function
 * @name jQuery.fn.animate
 * @param prop
 * @param speed
 * @param easing
 * @param callback
 */

/**
 * @function
 * @name jQuery.fn.stop
 * @param clearQueue
 * @param gotoEnd
 */

/**
 * @function
 * @name jQuery.fn.slideDown
 * @param name
 * @param props
 */

/**
 * @function
 * @name jQuery.fn.slideUp
 * @param name
 * @param props
 */

/**
 * @function
 * @name jQuery.fn.slideToggle
 * @param name
 * @param props
 */

/**
 * @function
 * @name jQuery.fn.fadeIn
 * @param name
 * @param props
 */

/**
 * @function
 * @name jQuery.fn.fadeOut
 * @param name
 * @param props
 */

/**
 * @function
 * @name jQuery.fn.speed
 * @param speed
 * @param easing
 * @param fn
 */

/**
 * @field
 * @name jQuery.fn.position
 */

/**
 * @field
 * @name jQuery.fn.offsetParent
 */

/**
 * @field
 * @name jQuery.fn.scrollLeft
 */

/**
 * @field
 * @name jQuery.fn.scrollTop
 */

/**
 * @field
 * @name jQuery.fn.innerHeight
 */

/**
 * @field
 * @name jQuery.fn.innerWidth
 */

/**
 * @field
 * @name jQuery.fn.outerHeight
 */

/**
 * @field
 * @name jQuery.fn.outerWidth
 */

/**
 * @class
 * @name jQuery.fn.easing
 */

/**
 * @function
 * @name jQuery.fn.easing.linear
 * @param p
 * @param n
 * @param firstNum
 * @param diff
 */

/**
 * @function
 * @name jQuery.fn.easing.swing
 * @param p
 * @param n
 * @param firstNum
 * @param diff
 */

/**
 * @namespace
 * @name jQuery.fx.speeds
 */

/**
 * @static
 * @name jQuery.fx.speeds._default
 */

/**
 * @static
 * @name jQuery.fx.speeds.fast
 */

/**
 * @static
 * @name jQuery.fx.speeds.slow
 */

/**
 * @class
 * @name jQuery.fx.step
 */

/**
 * @function
 * @name jQuery.fx.step._default
 */

/**
 * @function
 * @name jQuery.fx.step.opacity
 */
