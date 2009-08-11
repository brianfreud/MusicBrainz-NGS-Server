/*jslint undef: true, browser: true*/
/*global jQuery, $, window*/

/* 
 * Auto Expanding Text Area (1.2.2)
 * by Chrys Bader (www.chrysbader.com)
 * chrysb@gmail.com
 *
 * Version 1.2.3 update
 * by Richard Vallee
 * richardvallee@gmail.com
 *
 * Version 1.2.4 update
 * by Brian Schweitzer (BrianFreud)
 * brian.brianschweitzer@gmail.com
 *
 * Special thanks to:
 * Jake Chapa - jake@hybridstudio.com
 * John Resig - jeresig@gmail.com
 *
 * Copyright (c) 2008 Chrys Bader (www.chrysbader.com)
 * Copyright (c) 2009 Miles Nordin <carton@Ivy.NET>
 * Licensed under GPL (gpl.txt)
 *
 *
 * NOTE: This script requires jQuery to work.  Download jQuery at www.jquery.com
 *
 */

(function (jQuery) {

    jQuery.fn.autogrow = function (o) {
        return this.each(function () {
            new jQuery.autogrow(this, o);
        });
    };

    /**
     * The autogrow object.
     *
     * @constructor
     * @name jQuery.autogrow
     * @param Object e The textarea to create the autogrow for.
     * @param Hash o A set of key/value pairs to set as configuration properties.
     * @cat Plugins/autogrow
     */

    jQuery.autogrow = function (e, o) {
        this.options = o || {};
        this.dummy = null;
        this.interval = null;
        this.line_height = this.options.lineHeight || parseInt(jQuery(e).css('line-height'), 10);
        this.min_height = this.options.minHeight || parseInt(jQuery(e).css('min-height'), 10);
        this.max_height = this.options.maxHeight || parseInt(jQuery(e).css('max-height'), 10);
        this.textarea = jQuery(e);
        this.expand_tolerance = (!isNaN(this.options.expandTolerance) && this.options.expandTolerance > -1) ? this.options.expandTolerance : 4;

        if (isNaN(this.line_height)) {
            this.line_height = 0;
        }

        if (isNaN(this.min_height) || this.min_height === 0) {
            this.min_height = this.textarea.height();
        }

        // Only one textarea activated at a time, the one being used
        this.init();
    };

    jQuery.autogrow.fn = jQuery.autogrow.prototype = {
        autogrow: '1.2.4'
    };

    jQuery.autogrow.fn.extend = jQuery.autogrow.extend = jQuery.extend;

    jQuery.autogrow.fn.extend({
        init: function () {
            var self = this;
            this.textarea.css({
                overflow: 'hidden',
                display: 'block'
            });
            this.textarea.bind('focus', function () {
                self.startExpand();
            }).bind('blur', function () {
                self.stopExpand();
            }).bind('update', function () {
                self.checkExpand(0, true);
            });
            this.checkExpand(0, true);
        },

        startExpand: function () {
            var self = this;
            // while focused, leave an extra line.  The cursor can never actually reach 
            // this extra line, but it makes the gesture for select-all much easier to perform
            // (or, _possible_ to perform, if the last line is overflow-x-hidden)
            this.checkExpand(this.line_height, true);
            this.interval = window.setInterval(function () {
                self.checkExpand(self.line_height, false);
            }, 400);
        },

        stopExpand: function () {
            clearInterval(this.interval);
            this.checkExpand(0, true);
        },

        checkExpand: function (extraspace, forcecheck) {
            if (this.dummy === null) {
                this.dummy = jQuery('<div></div>');
                this.dummy.css({
                    'font-size': this.textarea.css('font-size'),
                    'font-family': this.textarea.css('font-family'),
                    'width': this.textarea.css('width'),
                    'padding-top': this.textarea.css('padding-top'),
                    'padding-bottom': this.textarea.css('padding-bottom'),
                    'padding-left': this.textarea.css('padding-left'),
                    'padding-right': this.textarea.css('padding-right'),
                    'line-height': this.line_height + 'px',
                    'overflow-x': 'hidden',
                    'position': 'absolute',
                    'top': 0,
                    'left': -9999
                }).appendTo('body');
            } else {
                // If the dummy was already created, show it as it is hidden after expansion
                this.dummy.show();
            }

            // textarea -> div
            // textarea rules are unique.  it's not the same as <pre> because it word-wraps, 
            // but it does not condense spaces like html.
            // dot at the end is to make sure we leave room for the cursor, if the cursor is on a blank line
            var html = this.textarea.val()
                           .toString()
                           .replace(/&/g, '&amp;')
                           .replace(/</g, '&lt;')
                           .replace(/>/g, '&gt;')
                           .replace(/^\s/, '&nbsp;')
                           .replace(/\s{2}/g, ' &nbsp;') + ".";

            // IE is different, as per usual
            if (jQuery.browser.msie) {
                html = html.replace(/\n/g, '<BR>');
            }
            else {
                html = html.replace(/\n/g, '<br>');
            }

            if (forcecheck || this.dummy.html() != html) {

                this.dummy.html(html);
                if (this.max_height > 0 && (this.dummy.height() + (this.expand_tolerance * this.line_height) > this.max_height)) {
                    //                if (this.max_height > 0 && (this.dummy.height() + extraspace + 1 > this.max_height)) {
                    this.textarea.css('overflow-y', 'auto');
                    this.textarea.css('height', this.max_height);
                    //Added the above line to enfore the max height if content length more than max height.
                    if (this.textarea.height() < this.max_height) {
                        this.textarea.animate({
                            height: (this.max_height + (this.expand_tolerance * this.line_height)) + 'px'
                        }, 100);
                    }
                }
                else {
                    this.textarea.css('overflow-y', 'hidden');
                    if (this.textarea.height() < this.dummy.height() + (this.expand_tolerance * this.line_height) || (this.dummy.height() < this.textarea.height())) {
                        if (this.dummy.height() < this.min_height) {
                            this.textarea.animate({
                                height: (this.min_height + (this.expand_tolerance * this.line_height)) + 'px'
                            }, 100);
                        } else {
                            this.textarea.animate({
                                height: (this.dummy.height() + (this.expand_tolerance * this.line_height)) + 'px'
                            }, 100);
                        }
                    }
                }
            }
            // Hide the dummy, as otherwise it overflows the body when the content is long
            this.dummy.hide();
        }
    });
})(jQuery);
/*jslint undef: true, browser: true*/
/*global jQuery, $*/

/**
 * Autotab - jQuery plugin 1.1b
 * http://www.lousyllama.com/sandbox/jquery-autotab
 * 
 * Copyright (c) 2008 Matthew Miller
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 * 
 * Revised: 2008-09-10 16:55:08
 * Modified: 2009-07-26 Brian Schweitzer (brianfreud) to satisfy jslint, optimize var declarations, and fix a few minor scoping bugs.
 */

(function ($) {
    // Look for an element based on ID or name
    var check_element = function (name) {
        var obj = null,
        check_id = $('#' + name),
        check_name = $('input[name=' + name + ']');

        if (check_id !== undefined) {
            obj = check_id;
        } else if (check_name !== undefined) {
            obj = check_name;
        }
        return obj;
    };

    /**
 * autotab_magic automatically establishes autotabbing with the
 * next and previous elements as provided by :input.
 * 
 * autotab_magic should called after applying filters, if used.
 * If any filters are applied after calling autotab_magic, then
 * Autotab may not protect against brute force typing.
 * 
 * @name	autotab_magic
 * @param	focus	Applies focus on the specified element
 * @example	$(':input').autotab_magic();
 */
    $.fn.autotab_magic = function (focus) {
        for (var i = 0; i < this.length; i++) {
            var n = i + 1,
            p = i - 1;

            if (i > 0 && n < this.length) {
                $(this[i]).autotab({
                    target: $(this[n]),
                    previous: $(this[p])
                });
            } else if (i > 0) {
                $(this[i]).autotab({
                    previous: $(this[p])
                });
            } else {
                $(this[i]).autotab({
                    target: $(this[n])
                });
            }
            // Set the focus on the specified element
            if (focus !== null && (isNaN(focus) && focus == $(this[i]).attr('id')) || (!isNaN(focus) && focus == i)) {
                $(this[i]).focus();
            }
        }
    };

    /**
 * This will take any of the text that is typed and
 * format it according to the options specified.
 * 
 * Option values:
 *	format		text|number|alphanumeric|all|custom
 *	- Text			Allows all characters except numbers
 *	- Number		Allows only numbers
 *	- Alphanumeric	        Allows only letters and numbers
 *	- All			Allows any and all characters
 *	- Custom		Allows developer to provide their own filter
 *
 *	uppercase	true|false
 *	- Converts a string to UPPERCASE
 * 
 *	lowercase	true|false
 *	- Converts a string to lowecase
 * 
 *	nospace		true|false
 *	- Remove spaces in the user input
 * 
 *	pattern		null|(regular expression)
 *	- Custom regular expression for the filter
 * 
 * @name	autotab_filter
 * @param	options		Can be a string, function or a list of options. If a string or
 *						function is passed, it will be assumed to be a format option.
 * @example	$('#number1, #number2, #number3').autotab_filter('number');
 * @example	$('#product_key').autotab_filter({ format: 'alphanumeric', nospace: true });
 * @example	$('#unique_id').autotab_filter({ format: 'custom', pattern: '[^0-9\.]' });
 */
    $.fn.autotab_filter = function (options) {
        var defaults = {
            format: 'all',
            uppercase: false,
            lowercase: false,
            nospace: false,
            pattern: null
        };

        if (typeof options == 'string' || typeof options == 'function') {
            defaults.format = options;
        } else {
            $.extend(defaults, options);
        }
        for (var i = 0; i < this.length; i++) {
            $(this[i]).bind('keyup', function (e) {
                var val = this.value,
                pattern;

                switch (defaults.format) {
                case 'text':
                    pattern = new RegExp('[0-9]+', 'g');
                    val = val.replace(pattern, '');
                    break;

                case 'alpha':
                    pattern = new RegExp('[^a-zA-Z]+', 'g');
                    val = val.replace(pattern, '');
                    break;

                case 'number':
                case 'numeric':
                    pattern = new RegExp('[^0-9]+', 'g');
                    val = val.replace(pattern, '');
                    break;

                case 'alphanumeric':
                    pattern = new RegExp('[^0-9a-zA-Z]+', 'g');
                    val = val.replace(pattern, '');
                    break;

                case 'custom':
                    pattern = new RegExp(defaults.pattern, 'g');
                    val = val.replace(pattern, '');
                    break;
                default:
                    if (typeof defaults.format == 'function') {
                        val = defaults.format(val);
                    }
                    break;
                }

                if (defaults.nospace) {
                    pattern = new RegExp('[ ]+', 'g');
                    val = val.replace(pattern, '');
                }

                if (defaults.uppercase) {
                    val = val.toUpperCase();
                }
                if (defaults.lowercase) {
                    val = val.toLowerCase();
                }
                if (val != this.value) {
                    this.value = val;
                }
            });
        }
    };

    /**
 * Provides the autotabbing mechanism for the supplied element and passes
 * any formatting options to autotab_filter.
 * 
 * Refer to autotab_filter's description for a detailed explanation of
 * the options available.
 * 
 * @name	autotab
 * @param	options
 * @example	$('#phone').autotab({ format: 'number' });
 * @example	$('#username').autotab({ format: 'alphanumeric', target: 'password' });
 * @example	$('#password').autotab({ previous: 'username', target: 'confirm' });
 */
    $.fn.autotab = function (options) {
        var defaults = {
            format: 'all',
            maxlength: 2147483647,
            uppercase: false,
            lowercase: false,
            nospace: false,
            target: null,
            previous: null,
            pattern: null
        },
        maxlength = $(this).attr('maxlength'),
        keys = [8, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 144, 145];

        $.extend(defaults, options);

        // Sets targets to element based on the name or ID
        // passed if they are not currently objects
        if (typeof defaults.target == 'string') {
            defaults.target = check_element(defaults.target);
        }
        if (typeof defaults.previous == 'string') {
            defaults.previous = check_element(defaults.previous);
        }
        // defaults.maxlength has not changed and maxlength was specified
        if (defaults.maxlength == 2147483647 && maxlength != 2147483647) {
            defaults.maxlength = maxlength;
            // defaults.maxlength overrides maxlength
        } else if (defaults.maxlength > 0) {
            $(this).attr('maxlength', defaults.maxlength);
            // defaults.maxlength and maxlength have not been specified
            // A target cannot be used since there is no defined maxlength
        } else {
            defaults.target = null;
        }
        if (defaults.format != 'all') {
            $(this).autotab_filter(defaults);
        }
        // Go to the previous element when backspace
        // is pressed in an empty input field
        return $(this).bind('keydown', function (e) {
            if (e.which == 8 && this.value.length === 0 && defaults.previous) {
                defaults.previous.focus().val(defaults.previous.val());
            }
        }).bind('keyup', function (e) {
            /**
		 * Do not auto tab when the following keys are pressed
		 * 8:	Backspace
		 * 9:	Tab
		 * 16:	Shift
		 * 17:	Ctrl
		 * 18:	Alt
		 * 19:	Pause Break
		 * 20:	Caps Lock
		 * 27:	Esc
		 * 33:	Page Up
		 * 34:	Page Down
		 * 35:	End
		 * 36:	Home
		 * 37:	Left Arrow
		 * 38:	Up Arrow
		 * 39:	Right Arrow
		 * 40:	Down Arrow
		 * 45:	Insert
		 * 46:	Delete
		 * 144:	Num Lock
		 * 145:	Scroll Lock
		 */

            if (e.which != 8) {
                var val = $(this).val();

                if ($.inArray(e.which, keys) == -1 && val.length == defaults.maxlength && defaults.target) {
                    defaults.target.focus();
                }
            }
        });
    };
})(jQuery);
/*jslint undef: true, browser: true*/
/*global jQuery, $, window, G_vmlCanvasManager*/

/* 2009-09-10: Brian Schweitzer (BrianFreud): Some minor bug fixing to make JSLint happy, and some significant restructuring,
 *                                            needed because the code essentially was upside-down (functionality, then helper
 *                                            functions, then all default variable definitions), which really slowed down
 *                                            script load time and execution time, and which also really annoyed JSLint.
 */

/*
 * @name BeautyTips
 * @desc a tooltips/baloon-help plugin for jQuery
 *
 * @author Jeff Robbins - Lullabot - http://www.lullabot.com
 * @version 0.9.5 release candidate 1  (5/20/2009)
 */

jQuery.bt = {
    version: '0.9.5-rc1'
};

/*
 * @type jQuery
 * @cat Plugins/bt
 * @requires jQuery v1.2+ (not tested on versions prior to 1.2.6)
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Encourage development. If you use BeautyTips for anything cool 
 * or on a site that people have heard of, please drop me a note.
 * - jeff ^at lullabot > com
 *
 * No guarantees, warranties, or promises of any kind
 *
 */

(function ($) {
    /**
   * @credit Inspired by Karl Swedberg's ClueTip
   *    (http://plugins.learningjquery.com/cluetip/), which in turn was inspired
   *    by Cody Lindley's jTip (http://www.codylindley.com)
   *
   * @fileoverview
   * Beauty Tips is a jQuery tooltips plugin which uses the canvas drawing element
   * in the HTML5 spec in order to dynamically draw tooltip "talk bubbles" around
   * the descriptive help text associated with an item. This is in many ways
   * similar to Google Maps which both provides similar talk-bubbles and uses the
   * canvas element to draw them.
   *
   * The canvas element is supported in modern versions of FireFox, Safari, and
   * Opera. However, Internet Explorer needs a separate library called ExplorerCanvas
   * included on the page in order to support canvas drawing functions. ExplorerCanvas
   * was created by Google for use with their web apps and you can find it here:
   * http://excanvas.sourceforge.net/
   *
   * Beauty Tips was written to be simple to use and pretty. All of its options
   * are documented at the bottom of this file and defaults can be overwritten
   * globally for the entire page, or individually on each call.
   *
   * By default each tooltip will be positioned on the side of the target element
   * which has the most free space. This is affected by the scroll position and
   * size of the current window, so each Beauty Tip is redrawn each time it is
   * displayed. It may appear above an element at the bottom of the page, but when
   * the page is scrolled down (and the element is at the top of the page) it will
   * then appear below it. Additionally, positions can be forced or a preferred
   * order can be defined. See examples below.
   *
   * To fix z-index problems in IE6, include the bgiframe plugin on your page
   * http://plugins.jquery.com/project/bgiframe - BeautyTips will automatically
   * recognize it and use it.
   *
   * BeautyTips also works with the hoverIntent plugin
   * http://cherne.net/brian/resources/jquery.hoverIntent.html
   * see hoverIntent example below for usage
   *
   * Usage
   * The function can be called in a number of ways.
   * $(selector).bt();
   * $(selector).bt('Content text');
   * $(selector).bt('Content text', {option1: value, option2: value});
   * $(selector).bt({option1: value, option2: value});
   *
   * For more/better documentation and lots of examples, visit the demo page included with the distribution
   *
   */

    jQuery.fn.bt = function (content, options) {
        var contentSelect = false;

        /**
   * Defaults for the beauty tips
   *
   * Note this is a variable definition and not a function. So defaults can be
   * written for an entire page by simply redefining attributes like so:
   *
   *   jQuery.bt.options.width = 400;
   *
   * Be sure to use *jQuery.bt.options* and not jQuery.bt.defaults when overriding
   *
   * This would make all Beauty Tips boxes 400px wide.
   *
   * Each of these options may also be overridden during
   *
   * Can be overriden globally or at time of call.
   *
   */
        jQuery.bt.defaults = {
            trigger: 'hover',
            // trigger to show/hide tip
            // use [on, off] to define separate on/off triggers
            // also use space character to allow multiple  to trigger
            // examples:
            //   ['focus', 'blur'] // focus displays, blur hides
            //   'dblclick'        // dblclick toggles on/off
            //   ['focus mouseover', 'blur mouseout'] // multiple triggers
            //   'now'             // shows/hides tip without event
            //   'none'            // use $('#selector').btOn(); and ...btOff();
            //   'hoverIntent'     // hover using hoverIntent plugin (settings below)
            // note:
            //   hoverIntent becomes default if available
            clickAnywhereToClose: true,
            // clicking anywhere outside of the tip will close it 
            closeWhenOthersOpen: false,
            // tip will be closed before another opens - stop >= 2 tips being on
            shrinkToFit: false,
            // should short single-line content get a narrower balloon?
            width: '200px',
            // width of tooltip box
            padding: '10px',
            // padding for content (get more fine grained with cssStyles)
            spikeGirth: 10,
            // width of spike
            spikeLength: 15,
            // length of spike
            overlap: 0,
            // spike overlap (px) onto target (can cause problems with 'hover' trigger)
            overlay: false,
            // display overlay on target (use CSS to style) -- BUGGY!
            killTitle: true,
            // kill title tags to avoid double tooltips
            textzIndex: 9999,
            // z-index for the text
            boxzIndex: 9998,
            // z-index for the "talk" box (should always be less than textzIndex)
            wrapperzIndex: 9997,
            offsetParent: null,
            // DOM node to append the tooltip into.
            // Must be positioned relative or absolute. Can be selector or object
            positions: ['most'],
            // preference of positions for tip (will use first with available space)
            // possible values 'top', 'bottom', 'left', 'right' as an array in order of
            // preference. Last value will be used if others don't have enough space.
            // or use 'most' to use the area with the most space
            fill: "rgb(255, 255, 102)",
            // fill color for the tooltip box, you can use any CSS-style color definition method
            // http://www.w3.org/TR/css3-color/#numerical - not all methods have been tested
            windowMargin: 10,
            // space (px) to leave between text box and browser edge
            strokeWidth: 1,
            // width of stroke around box, **set to 0 for no stroke**
            strokeStyle: "#000",
            // color/alpha of stroke
            cornerRadius: 5,
            // radius of corners (px), set to 0 for square corners
            // following values are on a scale of 0 to 1 with .5 being centered
            centerPointX: '.5',
            // the spike extends from center of the target edge to this point
            centerPointY: '.5',
            // defined by percentage horizontal (x) and vertical (y)
            shadow: false,
            // use drop shadow? (only displays in Safari and FF 3.1) - experimental
            shadowOffsetX: 2,
            // shadow offset x (px)
            shadowOffsetY: 2,
            // shadow offset y (px)
            shadowBlur: 3,
            // shadow blur (px)
            shadowColor: "#000",
            // shadow color/alpha
            shadowOverlap: false,
            // when shadows overlap the target element it can cause problem with hovering
            // set this to true to overlap or set to a numeric value to define the amount of overlap
            noShadowOpts: {
                strokeStyle: '#999'
            },
            // use this to define 'fall-back' options for browsers which don't support drop shadows
            cssClass: '',
            // CSS class to add to the box wrapper div (of the TIP)
            cssStyles: {},
            // styles to add the text box
            //   example: {fontFamily: 'Georgia, Times, serif', fontWeight: 'bold'}
            activeClass: 'bt-active',
            // class added to TARGET element when its BeautyTip is active
            contentSelector: "$(this).attr('title')",
            // if there is no content argument, use this selector to retrieve the title
            // a function which returns the content may also be passed here
            ajaxPath: null,
            // if using ajax request for content, this contains url and (opt) selector
            // this will override content and contentSelector
            // examples (see jQuery load() function):
            //   '/demo.html'
            //   '/help/ajax/snip'
            //   '/help/existing/full div#content'
            // ajaxPath can also be defined as an array
            // in which case, the first value will be parsed as a jQuery selector
            // the result of which will be used as the ajaxPath
            // the second (optional) value is the content selector as above
            // examples:
            //    ["$(this).attr('href')", 'div#content']
            //    ["$(this).parents('.wrapper').find('.title').attr('href')"]
            //    ["$('#some-element').val()"]
            ajaxError: '<strong>ERROR:</strong> <em>%error</em>',
            // error text, use "%error" to insert error from server
            ajaxLoading: '<blink>Loading...</blink>',
            // yes folks, it's the blink tag!
            ajaxData: {},
            // key/value pairs
            ajaxType: 'GET',
            // 'GET' or 'POST'
            ajaxCache: true,
            // cache ajax results and do not send request to same url multiple times
            ajaxOpts: {},
            // any other ajax options - timeout, passwords, processing functions, etc...
            // see http://docs.jquery.com/Ajax/jQuery.ajax#options
            preBuild: function () {},
            // function to run before popup is built
            preShow: function (box) {},
            // function to run before popup is displayed
            showTip: function (box) {
                $(box).show();
            },
            postShow: function (box) {},
            // function to run after popup is built and displayed
            preHide: function (box) {},
            // function to run before popup is removed
            hideTip: function (box, callback) {
                $(box).hide();
                callback(); // you MUST call "callback" at the end of your animations
            },
            postHide: function () {},
            // function to run after popup is removed
            hoverIntentOpts: { // options for hoverIntent (if installed)
                interval: 300,
                // http://cherne.net/brian/resources/jquery.hoverIntent.html
                timeout: 500
            }

        }; // </ jQuery.bt.defaults >
        jQuery.bt.options = {};

        /**
     * Ensure that a number is a number... or zero
     */
        function numb(num) {
            return parseInt(num, 10) || 0;
        } // </ numb() >
        if (typeof content != 'string') {
            contentSelect = true;
            options = content;
            content = false;
        }

        /**
     * Does the current browser support canvas drop shadows?
     */
        function shadowSupport() {

            // to test for drop shadow support in the current browser, uncomment the next line
            // return true;
            // until a good feature-detect is found, we have to look at user agents
            try {
                var userAgent = navigator.userAgent.toLowerCase();
                if (/webkit/.test(userAgent)) {
                    // WebKit.. let's go!
                    return true;
                }
                else if (/gecko|mozilla/.test(userAgent) && parseFloat(userAgent.match(/firefox\/(\d+(?:\.\d+)+)/)[1]) >= 3.1) {
                    // Mozilla 3.1 or higher
                    return true;
                }
            }
            catch(err) {
                // if there's an error, just keep going, we'll assume that drop shadows are not supported
            }

            return false;

        } // </ shadowSupport() >
        /**
     * For odd stroke widths, round to the nearest .5 pixel to avoid antialiasing
     * http://developer.mozilla.org/en/Canvas_tutorial/Applying_styles_and_colors
     */
        function round5(num, strokeWidth) {
            var ret;
            strokeWidth = numb(strokeWidth);
            if (strokeWidth % 2) {
                ret = num;
            }
            else {
                ret = Math.round(num - 0.5) + 0.5;
            }
            return ret;
        } // </ round5() >
        /**
     * Remove an element from an array
     */
        function arrayRemove(arr, elem) {
            var x, newArr = [];
            for (x in arr) {
                if (arr[x] != elem) {
                    newArr.push(arr[x]);
                }
            }
            return newArr;
        } // </ arrayRemove() >
        /**
     * Does the current browser support canvas?
     * This is a variation of http://code.google.com/p/browser-canvas-support/
     */
        function canvasSupport() {
            var canvas_compatible = false;
            try {
                canvas_compatible = !!(document.createElement('canvas').getContext('2d')); // S60
            } catch(e) {
                canvas_compatible = !!(document.createElement('canvas').getContext); // IE
            }
            return canvas_compatible;
        }

        // if hoverIntent is installed, use that as default instead of hover
        if (jQuery.fn.hoverIntent && jQuery.bt.defaults.trigger == 'hover') {
            jQuery.bt.defaults.trigger = 'hoverIntent';
        }

        return this.each(function (index) {

            var opts = jQuery.extend(false, jQuery.bt.defaults, jQuery.bt.options, options),
            ajaxTimeout = false;

            // clean up the options
            opts.spikeLength = numb(opts.spikeLength);
            opts.spikeGirth = numb(opts.spikeGirth);
            opts.overlap = numb(opts.overlap);

            function drawIt(points, strokeWidth) {
                this.moveTo(points[0].x, points[0].y);
                for (var i = 1; i < points.length; i++) {
                    if (points[i - 1].type == 'arcStart') {
                        // if we're creating a rounded corner
                        //ctx.arc(round5(points[i].x), round5(points[i].y), points[i].startAngle, points[i].endAngle, opts.cornerRadius, false);
                        this.quadraticCurveTo(round5(points[i].x, strokeWidth), round5(points[i].y, strokeWidth), round5(points[(i + 1) % points.length].x, strokeWidth), round5(points[(i + 1) % points.length].y, strokeWidth));
                        i++;
                        //ctx.moveTo(round5(points[i].x), round5(points[i].y));
                    }
                    else {
                        this.lineTo(round5(points[i].x, strokeWidth), round5(points[i].y, strokeWidth));
                    }
                }
            } // </ drawIt() >

            /**
     * Given two points, find a point which is dist pixels from point1 on a line to point2
     */
            function betweenPoint(point1, point2, dist) {
                // figure out if we're horizontal or vertical
                var y, x;
                if (point1.x == point2.x) {
                    // vertical
                    y = point1.y < point2.y ? point1.y + dist : point1.y - dist;
                    return {
                        x: point1.x,
                        y: y
                    };
                }
                else if (point1.y == point2.y) {
                    // horizontal
                    x = point1.x < point2.x ? point1.x + dist : point1.x - dist;
                    return {
                        x: x,
                        y: point1.y
                    };
                }
            } // </ betweenPoint() >
            function centerPoint(arcStart, corner, arcEnd) {
                var x = corner.x == arcStart.x ? arcEnd.x : arcStart.x;
                var y = corner.y == arcStart.y ? arcEnd.y : arcStart.y;
                var startAngle, endAngle;
                if (arcStart.x < arcEnd.x) {
                    if (arcStart.y > arcEnd.y) {
                        // arc is on upper left
                        startAngle = (Math.PI / 180) * 180;
                        endAngle = (Math.PI / 180) * 90;
                    }
                    else {
                        // arc is on upper right
                        startAngle = (Math.PI / 180) * 90;
                        endAngle = 0;
                    }
                }
                else { if (arcStart.y > arcEnd.y) {
                        // arc is on lower left
                        startAngle = (Math.PI / 180) * 270;
                        endAngle = (Math.PI / 180) * 180;
                    }
                    else {
                        // arc is on lower right
                        startAngle = 0;
                        endAngle = (Math.PI / 180) * 270;
                    }
                }
                return {
                    x: x,
                    y: y,
                    type: 'center',
                    startAngle: startAngle,
                    endAngle: endAngle
                };
            } // </ centerPoint() >
            /**
     * Find the y intersection point of a line and given x vertical
     */
            function findIntersectY(r1x1, r1y1, r1x2, r1y2, x) {
                if (r1y1 == r1y2) {
                    return {
                        x: x,
                        y: r1y1
                    };
                }
                var r1m = (r1y1 - r1y2) / (r1x1 - r1x2);
                var r1b = r1y1 - (r1m * r1x1);

                var y = r1m * x + r1b;

                return {
                    x: x,
                    y: y
                };
            } // </ findIntersectY() >
            /**
     * Find the x intersection point of a line and given y horizontal
     */
            function findIntersectX(r1x1, r1y1, r1x2, r1y2, y) {
                if (r1x1 == r1x2) {
                    return {
                        x: r1x1,
                        y: y
                    };
                }
                var r1m = (r1y1 - r1y2) / (r1x1 - r1x2);
                var r1b = r1y1 - (r1m * r1x1);

                // y = mx + b     // your old friend, linear equation
                // x = (y - b)/m  // linear equation solved for x
                var x = (y - r1b) / r1m;

                return {
                    x: x,
                    y: y
                };

            } // </ findIntersectX() >
            /**
     * Find the intersection point of two lines, each defined by two points
     * arguments are x1, y1 and x2, y2 for r1 (line 1) and r2 (line 2)
     * It's like an algebra party!!!
     */
            function findIntersect(r1x1, r1y1, r1x2, r1y2, r2x1, r2y1, r2x2, r2y2) {

                if (r2x1 == r2x2) {
                    return findIntersectY(r1x1, r1y1, r1x2, r1y2, r2x1);
                }
                if (r2y1 == r2y2) {
                    return findIntersectX(r1x1, r1y1, r1x2, r1y2, r2y1);
                }

                // m = (y1 - y2) / (x1 - x2)  // <-- how to find the slope
                // y = mx + b                 // the 'classic' linear equation
                // b = y - mx                 // how to find b (the y-intersect)
                // x = (y - b)/m              // how to find x
                var r1m = (r1y1 - r1y2) / (r1x1 - r1x2);
                var r1b = r1y1 - (r1m * r1x1);
                var r2m = (r2y1 - r2y2) / (r2x1 - r2x2);
                var r2b = r2y1 - (r2m * r2x1);

                var x = (r2b - r1b) / (r1m - r2m);
                var y = r1m * x + r1b;

                return {
                    x: x,
                    y: y
                };
            } // </ findIntersect() >
            /**
       * This is sort of the "starting spot" for the this.each()
       * These are the init functions to handle the .bt() call
       */

            if (opts.killTitle) {
                $(this).find('[title]').andSelf().each(function () {
                    if (!$(this).attr('bt-xTitle')) {
                        $(this).attr('bt-xTitle', $(this).attr('title')).attr('title', '');
                    }
                });
            }

            if (typeof opts.trigger == 'string') {
                opts.trigger = [opts.trigger];
            }
            if (opts.trigger[0] == 'hoverIntent') {
                var hoverOpts = jQuery.extend(opts.hoverIntentOpts, {
                    over: function () {
                        this.btOn();
                    },
                    out: function () {
                        this.btOff();
                    }
                });
                $(this).hoverIntent(hoverOpts);

            }
            else if (opts.trigger[0] == 'hover') {
                $(this).hover(
                function () {
                    this.btOn();
                },
                function () {
                    this.btOff();
                });
            }
            else if (opts.trigger[0] == 'now') {
                // toggle the on/off right now
                // note that 'none' gives more control (see below)
                if ($(this).hasClass('bt-active')) {
                    this.btOff();
                }
                else {
                    this.btOn();
                }
            }
            else if (opts.trigger[0] == 'none') {
                // initialize the tip with no event trigger
                // use javascript to turn on/off tip as follows:
                // $('#selector').btOn();
                // $('#selector').btOff();
            }
            else if (opts.trigger.length > 1 && opts.trigger[0] != opts.trigger[1]) {
                $(this).bind(opts.trigger[0], function () {
                    this.btOn();
                }).bind(opts.trigger[1], function () {
                    this.btOff();
                });
            }
            else {
                // toggle using the same event
                $(this).bind(opts.trigger[0], function () {
                    if ($(this).hasClass('bt-active')) {
                        this.btOff();
                    }
                    else {
                        this.btOn();
                    }
                });
            }

            /**
       *  The BIG TURN ON
       *  Any element that has been initiated
       */
            this.btOn = function () {
                if (typeof $(this).data('bt-box') == 'object') {
                    // if there's already a popup, remove it before creating a new one.
                    this.btOff();
                }

                // trigger preBuild function
                // preBuild has no argument since the box hasn't been built yet
                opts.preBuild.apply(this);

                // turn off other tips
                $(jQuery.bt.vars.closeWhenOpenStack).btOff();

                // add the class to the target element (for hilighting, for example)
                // bt-active is always applied to all, but activeClass can apply another
                $(this).addClass('bt-active ' + opts.activeClass);

                if (contentSelect && opts.ajaxPath === null) {
                    // bizarre, I know
                    if (opts.killTitle) {
                        // if we've killed the title attribute, it's been stored in 'bt-xTitle' so get it..
                        $(this).attr('title', $(this).attr('bt-xTitle'));
                    }
                    // then evaluate the selector... title is now in place
                    content = $.isFunction(opts.contentSelector) ? opts.contentSelector.apply(this) : eval(opts.contentSelector);
                    if (opts.killTitle) {
                        // now remove the title again, so we don't get double tips
                        $(this).attr('title', '');
                    }
                }

                // ----------------------------------------------
                // All the Ajax(ish) stuff is in this next bit...
                // ----------------------------------------------
                if (opts.ajaxPath !== null && content === false) {
                    var url = "";
                    if (typeof opts.ajaxPath == 'object') {
                        url = eval(opts.ajaxPath[0]);
                        url += opts.ajaxPath[1] ? ' ' + opts.ajaxPath[1] : '';
                    }
                    else {
                        url = opts.ajaxPath;
                    }
                    var off = url.indexOf(" ");
                    if (off >= 0) {
                        var selector = url.slice(off, url.length);
                        url = url.slice(0, off);
                    }

                    // load any data cached for the given ajax path
                    var cacheData = opts.ajaxCache ? $(document.body).data('btCache-' + url.replace(/\./g, '')) : null;
                    if (typeof cacheData == 'string') {
                        content = selector ? $("<div/>").append(cacheData.replace(/<script(.|\s)*?\/script>/g, "")).find(selector) : cacheData;
                    }
                    else {
                        var target = this;

                        // set up the options
                        var ajaxOpts = jQuery.extend(false, {
                            type: opts.ajaxType,
                            data: opts.ajaxData,
                            cache: opts.ajaxCache,
                            url: url,
                            complete: function (XMLHttpRequest, textStatus) {
                                if (textStatus == 'success' || textStatus == 'notmodified') {
                                    if (opts.ajaxCache) {
                                        $(document.body).data('btCache-' + url.replace(/\./g, ''), XMLHttpRequest.responseText);
                                    }
                                    ajaxTimeout = false;
                                    content = selector ?
                                    // Create a dummy div to hold the results
                                    $("<div/>")
                                    // inject the contents of the document in, removing the scripts
                                    // to avoid any 'Permission Denied' errors in IE
                                    .append(XMLHttpRequest.responseText.replace(/<script(.|\s)*?\/script>/g, ""))

                                    // Locate the specified elements
                                    .find(selector) :

                                    // If not, just inject the full result
                                    XMLHttpRequest.responseText;

                                }
                                else { if (textStatus == 'timeout') {
                                        // if there was a timeout, we don't cache the result
                                        ajaxTimeout = true;
                                    }
                                    content = opts.ajaxError.replace(/%error/g, XMLHttpRequest.statusText);
                                }
                                // if the user rolls out of the target element before the ajax request comes back, don't show it
                                if ($(target).hasClass('bt-active')) {
                                    target.btOn();
                                }
                            }
                        },
                        opts.ajaxOpts);
                        // do the ajax request
                        jQuery.ajax(ajaxOpts);
                        // load the throbber while the magic happens
                        content = opts.ajaxLoading;
                    }
                }
                // </ ajax stuff >
                // now we start actually figuring out where to place the tip
                // figure out how to compensate for the shadow, if present
                var shadowMarginX = 0; // extra added to width to compensate for shadow
                var shadowMarginY = 0; // extra added to height
                var shadowShiftX = 0; // amount to shift the tip horizontally to allow for shadow
                var shadowShiftY = 0; // amount to shift vertical
                if (opts.shadow && !shadowSupport()) {
                    // if browser doesn't support drop shadows, turn them off
                    opts.shadow = false;
                    // and bring in the noShadows options
                    jQuery.extend(opts, opts.noShadowOpts);
                }

                if (opts.shadow) {
                    // figure out horizontal placement
                    if (opts.shadowBlur > Math.abs(opts.shadowOffsetX)) {
                        shadowMarginX = opts.shadowBlur * 2;
                    }
                    else {
                        shadowMarginX = opts.shadowBlur + Math.abs(opts.shadowOffsetX);
                    }
                    shadowShiftX = (opts.shadowBlur - opts.shadowOffsetX) > 0 ? opts.shadowBlur - opts.shadowOffsetX : 0;

                    // now vertical
                    if (opts.shadowBlur > Math.abs(opts.shadowOffsetY)) {
                        shadowMarginY = opts.shadowBlur * 2;
                    }
                    else {
                        shadowMarginY = opts.shadowBlur + Math.abs(opts.shadowOffsetY);
                    }
                    shadowShiftY = (opts.shadowBlur - opts.shadowOffsetY) > 0 ? opts.shadowBlur - opts.shadowOffsetY : 0;
                }
                var pos, top, left, offsetParent;

                if (opts.offsetParent) {
                    // if offsetParent is defined by user
                    var offsetParentPos = offsetParent.offset();
                    offsetParent = $(opts.offsetParent);
                    pos = $(this).offset();
                    top = numb(pos.top) - numb(offsetParentPos.top) + numb($(this).css('margin-top')) - shadowShiftY; // IE can return 'auto' for margins
                    left = numb(pos.left) - numb(offsetParentPos.left) + numb($(this).css('margin-left')) - shadowShiftX;
                }
                else {
                    // if the target element is absolutely positioned, use its parent's offsetParent instead of its own
                    offsetParent = ($(this).css('position') == 'absolute') ? $(this).parents().eq(0).offsetParent() : $(this).offsetParent();
                    pos = $(this).btPosition();
                    top = numb(pos.top) + numb($(this).css('margin-top')) - shadowShiftY; // IE can return 'auto' for margins
                    left = numb(pos.left) + numb($(this).css('margin-left')) - shadowShiftX;
                }

                var width = $(this).btOuterWidth(),
                height = $(this).outerHeight();

                if (typeof content == 'object') {
                    // if content is a DOM object (as opposed to text)
                    // use a clone, rather than removing the original element
                    // and ensure that it's visible
                    var original = content;
                    var clone = $(original).clone(true).show();
                    // also store a reference to the original object in the clone data
                    // and a reference to the clone in the original
                    var origClones = $(original).data('bt-clones') || [];
                    origClones.push(clone);
                    $(original).data('bt-clones', origClones);
                    $(clone).data('bt-orig', original);
                    $(this).data('bt-content-orig', {
                        original: original,
                        clone: clone
                    });
                    content = clone;
                }
                if (typeof content === 'null' || content === '') {
                    // if content is empty, bail out...
                    return;
                }

                // create the tip content div, populate it, and style it
                var $text = $('<div class="bt-content"></div>').append(content).css({
                    padding: opts.padding,
                    position: 'absolute',
                    width: (opts.shrinkToFit ? 'auto' : opts.width),
                    zIndex: opts.textzIndex,
                    left: shadowShiftX,
                    top: shadowShiftY
                }).css(opts.cssStyles);
                // create the wrapping box which contains text and canvas
                // put the content in it, style it, and append it to the same offset parent as the target
                var $box = $('<div class="bt-wrapper"></div>').append($text).addClass(opts.cssClass).css({
                    position: 'absolute',
                    width: opts.width,
                    zIndex: opts.wrapperzIndex,
                    visibility: 'hidden'
                }).appendTo(offsetParent);

                // use bgiframe to get around z-index problems in IE6
                // http://plugins.jquery.com/project/bgiframe
                if (jQuery.fn.bgiframe) {
                    $text.bgiframe();
                    $box.bgiframe();
                }

                $(this).data('bt-box', $box);

                // see if the text box will fit in the various positions
                var scrollTop = numb($(document).scrollTop()),
                scrollLeft = numb($(document).scrollLeft()),
                docWidth = numb($(window).width()),
                docHeight = numb($(window).height()),
                winRight = scrollLeft + docWidth,
                winBottom = scrollTop + docHeight,
                space = {},
                thisOffset = $(this).offset(),
                textOutHeight = numb($text.outerHeight()),
                textOutWidth = numb($text.btOuterWidth()),
                position;
                space.top = thisOffset.top - scrollTop;
                space.bottom = docHeight - ((thisOffset + height) - scrollTop);
                space.left = thisOffset.left - scrollLeft;
                space.right = docWidth - ((thisOffset.left + width) - scrollLeft);
                if (opts.positions.constructor == String) {
                    opts.positions = opts.positions.replace(/ /, '').split(',');
                }
                if (opts.positions[0] == 'most') {
                    // figure out which is the largest
                    position = 'top'; // prime the pump
                    for (var pig in space) { //            <-------  pigs in space!
                        position = space[pig] > space[position] ? pig : position;
                    }
                }
                else {
                    for (var x in opts.positions) {
                        position = opts.positions[x];
                        // @todo: acommodate shadow space in the following lines...
                        if ((position == 'left' || position == 'right') && space[position] > textOutWidth + opts.spikeLength) {
                            break;
                        }
                        else if ((position == 'top' || position == 'bottom') && space[position] > textOutHeight + opts.spikeLength) {
                            break;
                        }
                    }
                }

                // horizontal (left) offset for the box
                var horiz = left + ((width - textOutWidth) * 0.5),
                // vertical (top) offset for the box
                vert = top + ((height - textOutHeight) * 0.5),
                points = [],
                textTop,
                textLeft,
                textRight,
                textBottom,
                textTopSpace,
                textBottomSpace,
                textLeftSpace,
                textRightSpace,
                crossPoint,
                textCenter,
                spikePoint,
                yShift,
                xShift;

                // Yes, yes, this next bit really could use to be condensed
                // each switch case is basically doing the same thing in slightly different ways
                switch (position) {
                    // =================== TOP =======================
                case 'top':
                    // spike on bottom
                    $text.css('margin-bottom', opts.spikeLength + 'px');
                    $box.css({
                        top: (top - $text.outerHeight(true)) + opts.overlap,
                        left: horiz
                    });
                    // move text left/right if extends out of window
                    textRightSpace = (winRight - opts.windowMargin) - ($text.offset().left + $text.btOuterWidth(true));
                    xShift = shadowShiftX;
                    if (textRightSpace < 0) {
                        // shift it left
                        $box.css('left', (numb($box.css('left')) + textRightSpace) + 'px');
                        xShift -= textRightSpace;
                    }
                    // we test left space second to ensure that left of box is visible
                    textLeftSpace = ($text.offset().left + numb($text.css('margin-left'))) - (scrollLeft + opts.windowMargin);
                    if (textLeftSpace < 0) {
                        // shift it right
                        $box.css('left', (numb($box.css('left')) - textLeftSpace) + 'px');
                        xShift += textLeftSpace;
                    }
                    textTop = $text.btPosition().top + numb($text.css('margin-top'));
                    textLeft = $text.btPosition().left + numb($text.css('margin-left'));
                    textRight = textLeft + $text.btOuterWidth();
                    textBottom = textTop + $text.outerHeight();
                    textCenter = {
                        x: textLeft + ($text.btOuterWidth() * opts.centerPointX),
                        y: textTop + ($text.outerHeight() * opts.centerPointY)
                    };
                    // points[points.length] = {x: x, y: y};
                    points[points.length] = spikePoint = {
                        y: textBottom + opts.spikeLength,
                        x: ((textRight - textLeft) * 0.5) + xShift,
                        type: 'spike'
                    };
                    crossPoint = findIntersectX(spikePoint.x, spikePoint.y, textCenter.x, textCenter.y, textBottom);
                    // make sure that the crossPoint is not outside of text box boundaries
                    crossPoint.x = crossPoint.x < textLeft + opts.spikeGirth / 2 + opts.cornerRadius ? textLeft + opts.spikeGirth / 2 + opts.cornerRadius : crossPoint.x;
                    crossPoint.x = crossPoint.x > (textRight - opts.spikeGirth / 2) - opts.cornerRadius ? (textRight - opts.spikeGirth / 2) - opts.CornerRadius : crossPoint.x;
                    points[points.length] = {
                        x: crossPoint.x - (opts.spikeGirth / 2),
                        y: textBottom,
                        type: 'join'
                    };
                    points[points.length] = {
                        x: textLeft,
                        y: textBottom,
                        type: 'corner'
                    }; // left bottom corner
                    points[points.length] = {
                        x: textLeft,
                        y: textTop,
                        type: 'corner'
                    }; // left top corner
                    points[points.length] = {
                        x: textRight,
                        y: textTop,
                        type: 'corner'
                    }; // right top corner
                    points[points.length] = {
                        x: textRight,
                        y: textBottom,
                        type: 'corner'
                    }; // right bottom corner
                    points[points.length] = {
                        x: crossPoint.x + (opts.spikeGirth / 2),
                        y: textBottom,
                        type: 'join'
                    };
                    points[points.length] = spikePoint;
                    break;

                    // =================== LEFT =======================
                case 'left':
                    // spike on right
                    $text.css('margin-right', opts.spikeLength + 'px');
                    $box.css({
                        top: vert + 'px',
                        left: ((left - $text.btOuterWidth(true)) + opts.overlap) + 'px'
                    });
                    // move text up/down if extends out of window
                    textBottomSpace = (winBottom - opts.windowMargin) - ($text.offset().top + $text.outerHeight(true));
                    yShift = shadowShiftY;
                    if (textBottomSpace < 0) {
                        // shift it up
                        $box.css('top', (numb($box.css('top')) + textBottomSpace) + 'px');
                        yShift -= textBottomSpace;
                    }
                    // we ensure top space second to ensure that top of box is visible
                    textTopSpace = ($text.offset().top + numb($text.css('margin-top'))) - (scrollTop + opts.windowMargin);
                    if (textTopSpace < 0) {
                        // shift it down
                        $box.css('top', (numb($box.css('top')) - textTopSpace) + 'px');
                        yShift += textTopSpace;
                    }
                    textTop = $text.btPosition().top + numb($text.css('margin-top'));
                    textLeft = $text.btPosition().left + numb($text.css('margin-left'));
                    textRight = textLeft + $text.btOuterWidth();
                    textBottom = textTop + $text.outerHeight();
                    textCenter = {
                        x: textLeft + ($text.btOuterWidth() * opts.centerPointX),
                        y: textTop + ($text.outerHeight() * opts.centerPointY)
                    };
                    points[points.length] = spikePoint = {
                        x: textRight + opts.spikeLength,
                        y: ((textBottom - textTop) * 0.5) + yShift,
                        type: 'spike'
                    };
                    crossPoint = findIntersectY(spikePoint.x, spikePoint.y, textCenter.x, textCenter.y, textRight);
                    // make sure that the crossPoint is not outside of text box boundaries
                    crossPoint.y = crossPoint.y < textTop + opts.spikeGirth / 2 + opts.cornerRadius ? textTop + opts.spikeGirth / 2 + opts.cornerRadius : crossPoint.y;
                    crossPoint.y = crossPoint.y > (textBottom - opts.spikeGirth / 2) - opts.cornerRadius ? (textBottom - opts.spikeGirth / 2) - opts.cornerRadius : crossPoint.y;
                    points[points.length] = {
                        x: textRight,
                        y: crossPoint.y + opts.spikeGirth / 2,
                        type: 'join'
                    };
                    points[points.length] = {
                        x: textRight,
                        y: textBottom,
                        type: 'corner'
                    }; // right bottom corner
                    points[points.length] = {
                        x: textLeft,
                        y: textBottom,
                        type: 'corner'
                    }; // left bottom corner
                    points[points.length] = {
                        x: textLeft,
                        y: textTop,
                        type: 'corner'
                    }; // left top corner
                    points[points.length] = {
                        x: textRight,
                        y: textTop,
                        type: 'corner'
                    }; // right top corner
                    points[points.length] = {
                        x: textRight,
                        y: crossPoint.y - opts.spikeGirth / 2,
                        type: 'join'
                    };
                    points[points.length] = spikePoint;
                    break;

                    // =================== BOTTOM =======================
                case 'bottom':
                    // spike on top
                    $text.css('margin-top', opts.spikeLength + 'px');
                    $box.css({
                        top: (top + height) - opts.overlap,
                        left: horiz
                    });
                    // move text up/down if extends out of window
                    textRightSpace = (winRight - opts.windowMargin) - ($text.offset().left + $text.btOuterWidth(true));
                    xShift = shadowShiftX;
                    if (textRightSpace < 0) {
                        // shift it left
                        $box.css('left', (numb($box.css('left')) + textRightSpace) + 'px');
                        xShift -= textRightSpace;
                    }
                    // we ensure left space second to ensure that left of box is visible
                    textLeftSpace = ($text.offset().left + numb($text.css('margin-left'))) - (scrollLeft + opts.windowMargin);
                    if (textLeftSpace < 0) {
                        // shift it right
                        $box.css('left', (numb($box.css('left')) - textLeftSpace) + 'px');
                        xShift += textLeftSpace;
                    }
                    textTop = $text.btPosition().top + numb($text.css('margin-top'));
                    textLeft = $text.btPosition().left + numb($text.css('margin-left'));
                    textRight = textLeft + $text.btOuterWidth();
                    textBottom = textTop + $text.outerHeight();
                    textCenter = {
                        x: textLeft + ($text.btOuterWidth() * opts.centerPointX),
                        y: textTop + ($text.outerHeight() * opts.centerPointY)
                    };
                    points[points.length] = spikePoint = {
                        x: ((textRight - textLeft) * 0.5) + xShift,
                        y: shadowShiftY,
                        type: 'spike'
                    };
                    crossPoint = findIntersectX(spikePoint.x, spikePoint.y, textCenter.x, textCenter.y, textTop);
                    // make sure that the crossPoint is not outside of text box boundaries
                    crossPoint.x = crossPoint.x < textLeft + opts.spikeGirth / 2 + opts.cornerRadius ? textLeft + opts.spikeGirth / 2 + opts.cornerRadius : crossPoint.x;
                    crossPoint.x = crossPoint.x > (textRight - opts.spikeGirth / 2) - opts.cornerRadius ? (textRight - opts.spikeGirth / 2) - opts.cornerRadius : crossPoint.x;
                    points[points.length] = {
                        x: crossPoint.x + opts.spikeGirth / 2,
                        y: textTop,
                        type: 'join'
                    };
                    points[points.length] = {
                        x: textRight,
                        y: textTop,
                        type: 'corner'
                    }; // right top corner
                    points[points.length] = {
                        x: textRight,
                        y: textBottom,
                        type: 'corner'
                    }; // right bottom corner
                    points[points.length] = {
                        x: textLeft,
                        y: textBottom,
                        type: 'corner'
                    }; // left bottom corner
                    points[points.length] = {
                        x: textLeft,
                        y: textTop,
                        type: 'corner'
                    }; // left top corner
                    points[points.length] = {
                        x: crossPoint.x - (opts.spikeGirth / 2),
                        y: textTop,
                        type: 'join'
                    };
                    points[points.length] = spikePoint;
                    break;

                    // =================== RIGHT =======================
                case 'right':
                    // spike on left
                    $text.css('margin-left', (opts.spikeLength + 'px'));
                    $box.css({
                        top: vert + 'px',
                        left: ((left + width) - opts.overlap) + 'px'
                    });
                    // move text up/down if extends out of window
                    textBottomSpace = (winBottom - opts.windowMargin) - ($text.offset().top + $text.outerHeight(true));
                    yShift = shadowShiftY;
                    if (textBottomSpace < 0) {
                        // shift it up
                        $box.css('top', (numb($box.css('top')) + textBottomSpace) + 'px');
                        yShift -= textBottomSpace;
                    }
                    // we ensure top space second to ensure that top of box is visible
                    textTopSpace = ($text.offset().top + numb($text.css('margin-top'))) - (scrollTop + opts.windowMargin);
                    if (textTopSpace < 0) {
                        // shift it down
                        $box.css('top', (numb($box.css('top')) - textTopSpace) + 'px');
                        yShift += textTopSpace;
                    }
                    textTop = $text.btPosition().top + numb($text.css('margin-top'));
                    textLeft = $text.btPosition().left + numb($text.css('margin-left'));
                    textRight = textLeft + $text.btOuterWidth();
                    textBottom = textTop + $text.outerHeight();
                    textCenter = {
                        x: textLeft + ($text.btOuterWidth() * opts.centerPointX),
                        y: textTop + ($text.outerHeight() * opts.centerPointY)
                    };
                    points[points.length] = spikePoint = {
                        x: shadowShiftX,
                        y: ((textBottom - textTop) * 0.5) + yShift,
                        type: 'spike'
                    };
                    crossPoint = findIntersectY(spikePoint.x, spikePoint.y, textCenter.x, textCenter.y, textLeft);
                    // make sure that the crossPoint is not outside of text box boundaries
                    crossPoint.y = crossPoint.y < textTop + opts.spikeGirth / 2 + opts.cornerRadius ? textTop + opts.spikeGirth / 2 + opts.cornerRadius : crossPoint.y;
                    crossPoint.y = crossPoint.y > (textBottom - opts.spikeGirth / 2) - opts.cornerRadius ? (textBottom - opts.spikeGirth / 2) - opts.cornerRadius : crossPoint.y;
                    points[points.length] = {
                        x: textLeft,
                        y: crossPoint.y - opts.spikeGirth / 2,
                        type: 'join'
                    };
                    points[points.length] = {
                        x: textLeft,
                        y: textTop,
                        type: 'corner'
                    }; // left top corner
                    points[points.length] = {
                        x: textRight,
                        y: textTop,
                        type: 'corner'
                    }; // right top corner
                    points[points.length] = {
                        x: textRight,
                        y: textBottom,
                        type: 'corner'
                    }; // right bottom corner
                    points[points.length] = {
                        x: textLeft,
                        y: textBottom,
                        type: 'corner'
                    }; // left bottom corner
                    points[points.length] = {
                        x: textLeft,
                        y: crossPoint.y + opts.spikeGirth / 2,
                        type: 'join'
                    };
                    points[points.length] = spikePoint;
                    break;
                } // </ switch >
                var canvas = document.createElement('canvas');
                $(canvas).attr('width', (numb($text.btOuterWidth(true)) + opts.strokeWidth * 2 + shadowMarginX)).attr('height', (numb($text.outerHeight(true)) + opts.strokeWidth * 2 + shadowMarginY)).appendTo($box).css({
                    position: 'absolute',
                    zIndex: opts.boxzIndex
                });

                // if excanvas is set up, we need to initialize the new canvas element
                if (typeof(G_vmlCanvasManager) != 'undefined') {
                    canvas = G_vmlCanvasManager.initElement(canvas);
                }

                if (opts.cornerRadius > 0) {
                    // round the corners!
                    var newPoints = [],
                    newPoint;
                    for (var i = 0; i < points.length; i++) {
                        if (points[i].type == 'corner') {
                            // create two new arc points
                            // find point between this and previous (using modulo in case of ending)
                            newPoint = betweenPoint(points[i], points[(i - 1) % points.length], opts.cornerRadius);
                            newPoint.type = 'arcStart';
                            newPoints[newPoints.length] = newPoint;
                            // the original corner point
                            newPoints[newPoints.length] = points[i];
                            // find point between this and next
                            newPoint = betweenPoint(points[i], points[(i + 1) % points.length], opts.cornerRadius);
                            newPoint.type = 'arcEnd';
                            newPoints[newPoints.length] = newPoint;
                        }
                        else {
                            newPoints[newPoints.length] = points[i];
                        }
                    }
                    // overwrite points with new version
                    points = newPoints;
                }

                var ctx = canvas.getContext("2d");

                if (opts.shadow && opts.shadowOverlap !== true) {

                    var shadowOverlap = numb(opts.shadowOverlap);

                    // keep the shadow (and canvas) from overlapping the target element
                    switch (position) {
                    case 'top':
                        if (opts.shadowOffsetX + opts.shadowBlur - shadowOverlap > 0) {
                            $box.css('top', (numb($box.css('top')) - (opts.shadowOffsetX + opts.shadowBlur - shadowOverlap)));
                        }
                        break;
                    case 'right':
                        if (shadowShiftX - shadowOverlap > 0) {
                            $box.css('left', (numb($box.css('left')) + shadowShiftX - shadowOverlap));
                        }
                        break;
                    case 'bottom':
                        if (shadowShiftY - shadowOverlap > 0) {
                            $box.css('top', (numb($box.css('top')) + shadowShiftY - shadowOverlap));
                        }
                        break;
                    case 'left':
                        if (opts.shadowOffsetY + opts.shadowBlur - shadowOverlap > 0) {
                            $box.css('left', (numb($box.css('left')) - (opts.shadowOffsetY + opts.shadowBlur - shadowOverlap)));
                        }
                        break;
                    }
                }

                drawIt.apply(ctx, [points], opts.strokeWidth);
                ctx.fillStyle = opts.fill;
                if (opts.shadow) {
                    ctx.shadowOffsetX = opts.shadowOffsetX;
                    ctx.shadowOffsetY = opts.shadowOffsetY;
                    ctx.shadowBlur = opts.shadowBlur;
                    ctx.shadowColor = opts.shadowColor;
                }
                ctx.closePath();
                ctx.fill();
                if (opts.strokeWidth > 0) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0)'; //remove shadow from stroke
                    ctx.lineWidth = opts.strokeWidth;
                    ctx.strokeStyle = opts.strokeStyle;
                    ctx.beginPath();
                    drawIt.apply(ctx, [points], opts.strokeWidth);
                    ctx.closePath();
                    ctx.stroke();
                }

                // trigger preShow function
                // function receives the box element (the balloon wrapper div) as an argument
                opts.preShow.apply(this, [$box[0]]);

                // switch from visibility: hidden to display: none so we can run animations
                $box.css({
                    display: 'none',
                    visibility: 'visible'
                });

                // Here's where we show the tip
                opts.showTip.apply(this, [$box[0]]);

                if (opts.overlay) {
                    // EXPERIMENTAL AND FOR TESTING ONLY!!!!
                    var overlay = $('<div class="bt-overlay"></div>').css({
                        position: 'absolute',
                        backgroundColor: 'blue',
                        top: top,
                        left: left,
                        width: width,
                        height: height,
                        opacity: '.2'
                    }).appendTo(offsetParent);
                    $(this).data('overlay', overlay);
                }

                if ((opts.ajaxPath !== null && opts.ajaxCache === false) || ajaxTimeout) {
                    // if ajaxCache is not enabled or if there was a server timeout,
                    // remove the content variable so it will be loaded again from server
                    content = false;
                }

                // stick this element into the clickAnywhereToClose stack
                if (opts.clickAnywhereToClose) {
                    jQuery.bt.vars.clickAnywhereStack.push(this);
                    $(document).click(jQuery.bt.docClick);
                }

                // stick this element into the closeWhenOthersOpen stack
                if (opts.closeWhenOthersOpen) {
                    jQuery.bt.vars.closeWhenOpenStack.push(this);
                }

                // trigger postShow function
                // function receives the box element (the balloon wrapper div) as an argument
                opts.postShow.apply(this, [$box[0]]);

            }; // </ turnOn() >
            this.btOff = function () {

                var box = $(this).data('bt-box');

                // trigger preHide function
                // function receives the box element (the balloon wrapper div) as an argument
                opts.preHide.apply(this, [box]);

                var i = this;

                // set up the stuff to happen AFTER the tip is hidden
                i.btCleanup = function () {
                    var box = $(i).data('bt-box');
                    var contentOrig = $(i).data('bt-content-orig');
                    var overlay = $(i).data('bt-overlay');
                    if (typeof box == 'object') {
                        $(box).remove();
                        $(i).removeData('bt-box');
                    }
                    if (typeof contentOrig == 'object') {
                        var clones = $(contentOrig.original).data('bt-clones');
                        $(contentOrig).data('bt-clones', arrayRemove(clones, contentOrig.clone));
                    }
                    if (typeof overlay == 'object') {
                        $(overlay).remove();
                        $(i).removeData('bt-overlay');
                    }

                    // remove this from the stacks
                    jQuery.bt.vars.clickAnywhereStack = arrayRemove(jQuery.bt.vars.clickAnywhereStack, i);
                    jQuery.bt.vars.closeWhenOpenStack = arrayRemove(jQuery.bt.vars.closeWhenOpenStack, i);

                    // remove the 'bt-active' and activeClass classes from target
                    $(i).removeClass('bt-active ' + opts.activeClass);

                    // trigger postHide function
                    // no box argument since it has been removed from the DOM
                    opts.postHide.apply(i);

                };

                opts.hideTip.apply(this, [box, i.btCleanup]);

            }; // </ turnOff() >
            var refresh = this.btRefresh = function () {
                this.btOff();
                this.btOn();
            };

        }); // </ this.each() >
    }; // </ jQuery.fn.bt() >
    /**
   * jQuery's compat.js (used in Drupal's jQuery upgrade module, overrides the $().position() function
   *  this is a copy of that function to allow the plugin to work when compat.js is present
   *  once compat.js is fixed to not override existing functions, this function can be removed
   *  and .btPosion() can be replaced with .position() above...
   */
    jQuery.fn.btPosition = function () {

        function num(elem, prop) {
            return elem[0] && parseInt(jQuery.curCSS(elem[0], prop, true), 10) || 0;
        }

        var left = 0,
        top = 0,
        results;

        if (this[0]) {
            // Get *real* offsetParent
            var offsetParent = this.offsetParent(),

            // Get correct offsets
            offset = this.offset(),
            parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? {
                top: 0,
                left: 0
            } : offsetParent.offset();

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= num(this, 'marginTop');
            offset.left -= num(this, 'marginLeft');

            // Add offsetParent borders
            parentOffset.top += num(offsetParent, 'borderTopWidth');
            parentOffset.left += num(offsetParent, 'borderLeftWidth');

            // Subtract the two offsets
            results = {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        }

        return results;
    }; // </ jQuery.fn.btPosition() >
    /**
  * jQuery's dimensions.js overrides the $().btOuterWidth() function
  *  this is a copy of original jQuery's outerWidth() function to 
  *  allow the plugin to work when dimensions.js is present
  */
    jQuery.fn.btOuterWidth = function (margin) {

        function num(elem, prop) {
            return elem[0] && parseInt(jQuery.curCSS(elem[0], prop, true), 10) || 0;
        }

        return this.innerWidth() + num(this, "borderLeftWidth") + num(this, "borderRightWidth") + (margin ? num(this, "marginLeft") + num(this, "marginRight") : 0);

    }; // </ jQuery.fn.btOuterWidth() >
    /**
   * A convenience function to run btOn() (if available)
   * for each selected item
   */
    jQuery.fn.btOn = function () {
        return this.each(function (index) {
            if (jQuery.isFunction(this.btOn)) {
                this.btOn();
            }
        });
    }; // </ $().btOn() >
    /**
   * 
   * A convenience function to run btOff() (if available)
   * for each selected item
   */
    jQuery.fn.btOff = function () {
        return this.each(function (index) {
            if (jQuery.isFunction(this.btOff)) {
                this.btOff();
            }
        });
    }; // </ $().btOff() >
    jQuery.bt.vars = {
        clickAnywhereStack: [],
        closeWhenOpenStack: []
    };

    /**
   * This function gets bound to the document's click event
   * It turns off all of the tips in the click-anywhere-to-close stack
   */
    jQuery.bt.docClick = function (e) {
        if (typeof(e) === "undefined") {
            e = window.event;
        }
        // if clicked element is a child of neither a tip NOR a target
        // and there are tips in the stack
        if (!$(e.target).parents().andSelf().filter('.bt-wrapper, .bt-active').length && jQuery.bt.vars.clickAnywhereStack.length) {
            // if clicked element isn't inside tip, close tips in stack
            $(jQuery.bt.vars.clickAnywhereStack).btOff();
            $(document).unbind('click', jQuery.bt.docClick);
        }
    }; // </ docClick() >
})(jQuery);

// @todo
// use larger canvas (extend to edge of page when windowMargin is active)
// add options to shift position of tip vert/horiz and position of spike tip
// create drawn (canvas) shadows
// use overlay to allow overlap with hover
// experiment with making tooltip a subelement of the target
// handle non-canvas-capable browsers elegantly
/*jslint undef: true, browser: true*/
/*global jQuery, $*/

/*
 * jQuery corner plugin: simple corner rounding
 * Examples and documentation at: http://jquery.malsup.com/corner/
 * version 1.98 (02-JUN-2009)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

/**
 *  corner() takes a single string argument:  $('#myDiv').corner("effect corners width")
 *
 *  effect:  name of the effect to apply, such as round, bevel, notch, bite, etc (default is round).
 *  corners: one or more of: top, bottom, tr, tl, br, or bl.
 *           by default, all four corners are adorned.
 *  width:   width of the effect; in the case of rounded corners this is the radius.
 *           specify this value using the px suffix such as 10px (and yes, it must be pixels).
 *
 * @name corner
 * @type jQuery
 * @param String options Options which control the corner style
 * @cat Plugins/Corner
 * @return jQuery
 * @author Dave Methvin (http://methvin.com/jquery/jq-corner.html)
 * @author Mike Alsup   (http://jquery.malsup.com/corner/)
 */
(function ($) {

    var expr = (function () {
        if (!$.browser.msie) {
            return false;
        }
        var div = document.createElement('div');
        try {
            div.style.setExpression('width', '0+0');
        }
        catch(e) {
            return false;
        }
        return true;
    })();

    function sz(el, p) {
        return parseInt($.css(el, p), 10) || 0;
    }
    function hex2(s) {
        s = parseInt(s, 10).toString(16);
        return (s.length < 2) ? '0' + s : s;
    }
    function gpc(node) {
        for (; node && node.nodeName.toLowerCase() != 'html'; node = node.parentNode) {
            var v = $.css(node, 'backgroundColor');
            if (v == 'rgba(0, 0, 0, 0)') {
                continue; // webkit
            }
            if (v.indexOf('rgb') >= 0) {
                var rgb = v.match(/\d+/g);
                return '#' + hex2(rgb[0]) + hex2(rgb[1]) + hex2(rgb[2]);
            }
            if (v && v != 'transparent') {
                return v;
            }
        }
        return '#ffffff';
    }

    function getWidth(fx, i, width) {
        switch (fx) {
        case 'round':
            return Math.round(width * (1 - Math.cos(Math.asin(i / width))));
        case 'cool':
            return Math.round(width * (1 + Math.cos(Math.asin(i / width))));
        case 'sharp':
            return Math.round(width * (1 - Math.cos(Math.acos(i / width))));
        case 'bite':
            return Math.round(width * (Math.cos(Math.asin((width - i - 1) / width))));
        case 'slide':
            return Math.round(width * (Math.atan2(i, width / i)));
        case 'jut':
            return Math.round(width * (Math.atan2(width, (width - i - 1))));
        case 'curl':
            return Math.round(width * (Math.atan(i)));
        case 'tear':
            return Math.round(width * (Math.cos(i)));
        case 'wicked':
            return Math.round(width * (Math.tan(i)));
        case 'long':
            return Math.round(width * (Math.sqrt(i)));
        case 'sculpt':
            return Math.round(width * (Math.log((width - i - 1), width)));
        case 'dog':
            return (i & 1) ? (i + 1) : width;
        case 'dog2':
            return (i & 2) ? (i + 1) : width;
        case 'dog3':
            return (i & 3) ? (i + 1) : width;
        case 'fray':
            return (i % 2) * width;
        case 'notch':
            return width;
        case 'bevel':
            return i + 1;
        }
    }

    $.fn.corner = function (o) {
        // in 1.3+ we can fix mistakes with the ready state
        if (this.length === 0) {
            if (!$.isReady && this.selector) {
                var s = this.selector,
                c = this.context;
                $(function () {
                    $(s, c).corner(o);
                });
            }
            return this;
        }

        o = (o || "").toLowerCase();
        var keep = /keep/.test(o),
        // keep borders?
        cc = ((o.match(/cc:(#[0-9a-f]+)/) || [])[1]),
        // corner color
        sc = ((o.match(/sc:(#[0-9a-f]+)/) || [])[1]),
        // strip color
        width = parseInt((o.match(/(\d+)px/) || [])[1], 10) || 10,
        // corner width
        re = /round|bevel|notch|bite|cool|sharp|slide|jut|curl|tear|fray|wicked|sculpt|long|dog3|dog2|dog/,
        fx = ((o.match(re) || ['round'])[0]),
        edges = {
            T: 0,
            B: 1
        },
        opts = {
            TL: /top|tl/.test(o),
            TR: /top|tr/.test(o),
            BL: /bottom|bl/.test(o),
            BR: /bottom|br/.test(o)
        };
        if (!opts.TL && !opts.TR && !opts.BL && !opts.BR) {
            opts = {
                TL: 1,
                TR: 1,
                BL: 1,
                BR: 1
            };
        }
        var strip = document.createElement('div');
        strip.style.overflow = 'hidden';
        strip.style.height = '1px';
        strip.style.backgroundColor = sc || 'transparent';
        strip.style.borderStyle = 'solid';
        return this.each(function (index) {
            var pad = {
                T: parseInt($.css(this, 'paddingTop'), 10) || 0,
                R: parseInt($.css(this, 'paddingRight'), 10) || 0,
                B: parseInt($.css(this, 'paddingBottom'), 10) || 0,
                L: parseInt($.css(this, 'paddingLeft'), 10) || 0
            },
            cssHeight = $.curCSS(this, 'height');

            if (typeof(this.style.zoom) !== 'undefined') {
                this.style.zoom = 1;
            } // force 'hasLayout' in IE
            if (!keep) {
                this.style.border = 'none';
            }
            strip.style.borderColor = cc || gpc(this.parentNode);

            for (var j in edges) {
                var bot = edges[j];
                // only add stips if needed
                if ((bot && (opts.BL || opts.BR)) || (!bot && (opts.TL || opts.TR))) {
                    strip.style.borderStyle = 'none ' + (opts[j + 'R'] ? 'solid' : 'none') + ' none ' + (opts[j + 'L'] ? 'solid' : 'none');
                    var d = document.createElement('div');
                    $(d).addClass('jquery-corner');
                    var ds = d.style;

                    bot ? this.appendChild(d) : this.insertBefore(d, this.firstChild);

                    if (bot && cssHeight != 'auto') {
                        if ($.css(this, 'position') == 'static') {
                            this.style.position = 'relative';
                        }
                        ds.position = 'absolute';
                        ds.bottom = ds.left = ds.padding = ds.margin = '0';
                        if (expr) {
                            ds.setExpression('width', 'this.parentNode.offsetWidth');
                        }
                        else {
                            ds.width = '100%';
                        }
                    }
                    else if (!bot && $.browser.msie) {
                        if ($.css(this, 'position') == 'static') {
                            this.style.position = 'relative';
                        }
                        ds.position = 'absolute';
                        ds.top = ds.left = ds.right = ds.padding = ds.margin = '0';

                        // fix ie6 problem when blocked element has a border width
                        if (expr) {
                            var bw = sz(this, 'borderLeftWidth') + sz(this, 'borderRightWidth');
                            ds.setExpression('width', 'this.parentNode.offsetWidth - ' + bw + '+ "px"');
                        }
                        else {
                            ds.width = '100%';
                        }
                    }
                    else {
                        ds.margin = !bot ? '-' + pad.T + 'px -' + pad.R + 'px ' + (pad.T - width) + 'px -' + pad.L + 'px' : (pad.B - width) + 'px -' + pad.R + 'px -' + pad.B + 'px -' + pad.L + 'px';
                    }

                    for (var i = 0; i < width; i++) {
                        var w = Math.max(0, getWidth(fx, i, width)),
                        e = strip.cloneNode(false);
                        e.style.borderWidth = '0 ' + (opts[j + 'R'] ? w : 0) + 'px 0 ' + (opts[j + 'L'] ? w : 0) + 'px';
                        bot ? d.appendChild(e) : d.insertBefore(e, d.firstChild);
                    }
                }
            }
        });
    };

    $.fn.uncorner = function () {
        $('div.jquery-corner', this).remove();
        return this;
    };

})(jQuery);
/*jslint undef: true, browser: true*/
/*global jQuery, $*/

/*
    VERSION: Drop Shadow jQuery Plugin 1.6  12-13-2007

        Modified: 2009-09-05: Brian Schweitzer (BrianFreud) - Make var declarations more efficient,
                                                              Fix bug where initial z-index of the calling element was ignored.
        Modified: 2009-09-10: Brian Schweitzer (BrianFreud) - Fix JSLint issues.

    REQUIRES: jquery.js (1.2.6 or later)

    SYNTAX: $(selector).dropShadow(options);  // Creates new drop shadows
                    $(selector).redrawShadow();       // Redraws shadows on elements
                    $(selector).removeShadow();       // Removes shadows from elements
                    $(selector).shadowId();           // Returns an existing shadow's ID

    OPTIONS:

        left    : integer (default = 4)
        top     : integer (default = 4)
        blur    : integer (default = 2)
        opacity : decimal (default = 0.5)
        color   : string (default = "black")
        swap    : boolean (default = false)

    The left and top parameters specify the distance and direction, in    pixels, to
    offset the shadow. Zero values position the shadow directly behind the element.
    Positive values shift the shadow to the right and down, while negative values 
    shift the shadow to the left and up.
    
    The blur parameter specifies the spread, or dispersion, of the shadow. Zero 
    produces a sharp shadow, one or two produces a normal shadow, and    three or four
    produces a softer shadow. Higher values increase the processing load.
    
    The opacity parameter    should be a decimal value, usually less than one. You can
    use a value    higher than one in special situations, e.g. with extreme blurring. 
    
    Color is specified in the usual manner, with a color name or hex value. The
    color parameter    does not apply with transparent images.
    
    The swap parameter reverses the stacking order of the original and the shadow.
    This can be used for special effects, like an embossed or engraved look.

    EXPLANATION:
    
    This jQuery plug-in adds soft drop shadows behind page elements. It is only
    intended for adding a few drop shadows to mostly stationary objects, like a
    page heading, a photo, or content containers.

    The shadows it creates are not bound to the original elements, so they won't
    move or change size automatically if the original elements change. A window
    resize event listener is assigned, which should re-align the shadows in many
    cases, but if the elements otherwise move or resize you will have to handle
    those events manually. Shadows can be redrawn with the redrawShadow() method
    or removed with the removeShadow() method. The redrawShadow() method uses the
    same options used to create the original shadow. If you want to change the
    options, you should remove the shadow first and then create a new shadow.
    
    The dropShadow method returns a jQuery collection of the new shadow(s). If
    further manipulation is required, you can store it in a variable like this:

        var myShadow = $("#myElement").dropShadow();

    You can also read the ID of the shadow from the original element at a later
    time. To get a shadow's ID, either read the shadowId attribute of the
    original element or call the shadowId() method. For example:

        var myShadowId = $("#myElement").attr("shadowId");  or
        var myShadowId = $("#myElement").shadowId();

    If the original element does not already have an ID assigned, a random ID will
    be generated for the shadow. However, if the original does have an ID, the 
    shadow's ID will be the original ID and "_dropShadow". For example, if the
    element's ID is "myElement", the shadow's ID would be "myElement_dropShadow".

    If you have a long piece of text and the user resizes the    window so that the
    text wraps or unwraps, the shape of the text changes and the words are no
    longer in the same positions. In that case, you can either preset the height
    and width, so that it becomes a fixed box, or you can shadow each word
    separately, like this:

        <h1><span>Your</span> <span>Page</span> <span>Title</span></h1>

        $("h1 span").dropShadow();

    The dropShadow method attempts to determine whether the selected elements have
    transparent backgrounds. If you want to shadow the content inside an element,
    like text or a transparent image, it must not have a background-color or
    background-image style. If the element has a solid background it will create a
    rectangular    shadow around the outside box.

    The shadow elements are positioned absolutely one layer below the original 
    element, which is positioned relatively (unless it's already absolute).

    *** All shadows have the "dropShadow" class, for selecting with CSS or jQuery.

    ISSUES:
    
        1)    Limited styling of shadowed elements by ID. Because IDs must be unique,
                and the shadows have their own ID, styles applied by ID won't transfer
                to the shadows. Instead, style elements by class or use inline styles.
        2)    Sometimes shadows don't align properly. Elements may need to be wrapped
                in container elements, margins or floats changed, etc. or you may just 
                have to tweak the left and top offsets to get them to align. For example,
                with draggable objects, you have to wrap them inside two divs. Make the 
                outer div draggable and set the inner div's position to relative. Then 
                you can create a shadow on the element inside the inner div.
        3)    If the user changes font sizes it will throw the shadows off. Browsers 
                do not expose an event for font size changes. The only known way to 
                detect a user font size change is to embed an invisible text element and
                then continuously poll for changes in size.
        4)    Safari support is shaky, and may require even more tweaks/wrappers, etc.
        
        The bottom line is that this is a gimick effect, not PFM, and if you push it
        too hard or expect it to work in every possible situation on every browser,
        you will be disappointed. Use it sparingly, and don't use it for anything 
        critical. Otherwise, have fun with it!
                
    AUTHOR: Larry Stevens (McLars@eyebulb.com) This work is in the public domain,
                    and it is not supported in any way. Use it at your own risk.
*/

(function ($) {

    var dropShadowZindex; //z-index counter
    $.fn.dropShadow = function (options) {
        // Default options
        var opt = $.extend({
            left: 4,
            top: 4,
            blur: 2,
            opacity: ".5",
            color: "black",
            swap: false
        },
        options);
        var jShadows = $([]); //empty jQuery collection
        // Loop through original elements
        this.not(".dropShadow").each(function () {
            dropShadowZindex = parseInt($(this).css("z-index"), 10);
            var jthis = $(this),
            shadows = [],
            blur = (opt.blur <= 0) ? 0 : opt.blur,
            opacity = (blur === 0) ? opt.opacity : opt.opacity / (blur * 8),
            zOriginal = (opt.swap) ? dropShadowZindex : dropShadowZindex + 1,
            zShadow = (opt.swap) ? dropShadowZindex + 1 : dropShadowZindex,

            // Create ID for shadow
            shadowId;
            if (this.id) {
                shadowId = this.id + "_dropShadow";
            }
            else {
                shadowId = "ds" + (1 + Math.floor(9999 * Math.random()));
            }

            // Modify original element
            $.data(this, "shadowId", shadowId); //store id in expando
            $.data(this, "shadowOptions", options); //store options in expando
            jthis.attr("shadowId", shadowId).css("zIndex", zOriginal);
            if (jthis.css("position") != "absolute") {
                jthis.css({
                    position: "relative",
                    zoom: 1 //for IE layout
                });
            }

            // Create first shadow layer
            var bgColor = jthis.css("backgroundColor");
            if (bgColor == "rgba(0, 0, 0, 0)") {
                bgColor = "transparent"; //Safari
            }
            if (bgColor != "transparent" || jthis.css("backgroundImage") != "none" || this.nodeName == "SELECT" || this.nodeName == "INPUT" || this.nodeName == "TEXTAREA") {
                shadows[0] = $("<div></div>").css("background", opt.color);
            }
            else {
                shadows[0] = jthis.clone().removeAttr("id").removeAttr("name").removeAttr("shadowId").css("color", opt.color);
            }
            shadows[0].addClass("dropShadow").css({
                height: jthis.outerHeight(),
                left: blur,
                opacity: opacity,
                position: "absolute",
                top: blur,
                width: jthis.outerWidth(),
                zIndex: zShadow
            });

            // Create other shadow layers
            var layers = (8 * blur) + 1;
            for (var i = 1; i < layers; i++) {
                shadows[i] = shadows[0].clone();
            }

            // Position layers
            var k = 1,
            j = blur;
            while (j > 0) {
                shadows[k].css({
                    left: j * 2,
                    top: 0
                }); //top
                shadows[k + 1].css({
                    left: j * 4,
                    top: j * 2
                }); //right
                shadows[k + 2].css({
                    left: j * 2,
                    top: j * 4
                }); //bottom
                shadows[k + 3].css({
                    left: 0,
                    top: j * 2
                }); //left
                shadows[k + 4].css({
                    left: j * 3,
                    top: j
                }); //top-right
                shadows[k + 5].css({
                    left: j * 3,
                    top: j * 3
                }); //bottom-right
                shadows[k + 6].css({
                    left: j,
                    top: j * 3
                }); //bottom-left
                shadows[k + 7].css({
                    left: j,
                    top: j
                }); //top-left
                k += 8;
                j--;
            }

            // Create container
            var divShadow = $("<div></div>").attr("id", shadowId).addClass("dropShadow").css({
                left: jthis.position().left + opt.left - blur,
                marginTop: jthis.css("marginTop"),
                marginRight: jthis.css("marginRight"),
                marginBottom: jthis.css("marginBottom"),
                marginLeft: jthis.css("marginLeft"),
                position: "absolute",
                top: jthis.position().top + opt.top - blur,
                zIndex: zShadow
            });

            // Add layers to container    
            for (i = 0; i < layers; i++) {
                divShadow.append(shadows[i]);
            }

            // Add container to DOM
            jthis.after(divShadow);

            // Add shadow to return set
            jShadows = jShadows.add(divShadow);

            // Re-align shadow on window resize
            $(window).resize(function () {
                try {
                    divShadow.css({
                        left: jthis.position().left + opt.left - blur,
                        top: jthis.position().top + opt.top - blur
                    });
                }
                catch(e) {}
            });

            // Increment z-index counter
            dropShadowZindex += 2;

        }); //end each
        return this.pushStack(jShadows);
    };

    $.fn.redrawShadow = function () {
        // Remove existing shadows
        this.removeShadow();

        // Draw new shadows
        return this.each(function () {
            var shadowOptions = $.data(this, "shadowOptions");
            $(this).dropShadow(shadowOptions);
        });
    };

    $.fn.removeShadow = function () {
        return this.each(function () {
            var shadowId = $(this).shadowId();
            $("div#" + shadowId).remove();
        });
    };

    $.fn.shadowId = function () {
        return $.data(this[0], "shadowId");
    };

    $(function () {
        // Suppress printing of shadows
        var noPrint = "<style type='text/css' media='print'>";
        noPrint += ".dropShadow{visibility:hidden;}</style>";
        $("head").append(noPrint);
    });

})(jQuery);
/*jslint undef: true, browser: true*/
/*global $*/

/*
 * jQuery plugin: Basic wrappers to use FireBug controls without breaking jQuery chains.
 *
 * version 1.0: 2009-09-11
 * by Brian Schweitzer (BrianFreud)
 */

$.extend(jQuery.fn, {
    count: function (msg) {
        console ? console.count(this) : "";
        return this;
    },
    dir: function (msg) {
        console ? console.dir(this) : "";
        return this;
    },
    log: function (msg) {
        console ? console.log("%s: %o", msg, this) : "";
        return this;
    },
    profile: function (msg) {
        console ? console.profile(this) : "";
        return this;
    },
    time: function (argA, argB) {
        if (console) {
            if (argB == true || argB == false) {
                console ? (argB ? console.timeEnd(argA) : console.time(argA)) : "";
            } else {
                console.timeEnd(argA).time(argB);
            }
        }
        return this;
    },
    trace: function (msg) {
        console ? console.trace(this) : "";
        return this;
    }
});

/*jslint undef: true, browser: true*/
/*global $*/

/*
 * jQuery plugin: floating div creator, with optional shadows and rounded corners
 * Corner rounding requires: http://jquery.malsup.com/corner/
 * Shadows requires: http://eyebulb.com/dropshadow/
 *
 * version 0.2: 2009-09-11
 * by Brian Schweitzer (BrianFreud)
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

// .makeFloatingDiv({
//                  after       : true                             <-- where the floating div will be attached; append if false, after if true.  Default: false 
//                  background  : "#FFF",                          <-- the background color.  Do not define this using the css arguments. Default: #fff
//                  borderColor : "#000",                          <-- the border color.  Do not define this using the css arguments. Default: #000
//                  classes     : { 1: "bar", 2: "baz" },          <-- classes to be given to the generated div. Default: none
//                  css         : { color  : "red" },              <-- any css customization. Defaults: see settings var below.
//                  id          : "foo",                           <-- id to be given to the generated div. Default: "floatdiv"
//                  innerPad    : 7,                               <-- padding to be assigned to the inner div.  Default: 7px
//                  position    : "bl",                            <-- align to which corner of the parent element: bl, tl, br, tr.  Default: bl
//                  round       : true                             <-- add shadowing visual effects. Default: true
//                  shadow      : true                             <-- add round corner visual effects. Default: true
//                  });
$.fn.makeFloatingDiv = function (options) {
    $("#floatdiv").remove();
    var thisZIndex = $(this).css("z-index"),
    floatBox = $("<div></div>"),
    floatBoxInner = $("<div></div>"),
    settings = {
        backgroundColor: "#000",
        border: "none",
        color: "#000",
        position: "absolute",
        width: "20em",
        zIndex: (thisZIndex < 10 || thisZIndex == "auto") ? 10 : (parseInt(thisZIndex, 10) + 1)
    },
    shadowMe = function (element, round) {
        /* If it's the first time this has been run, curve the corners and create the drop shadow divs. */
        if (typeof(element.shadowId()) == "undefined") {
            element.dropShadow();
            if (round !== false) {
                $("#" + element.shadowId() + " div").corner("round 6px").dropShadow();
            }
            /* Otherwise, leave the corners alone, and just recalculate the positions for the drop shadow div. */
        } else {
            element.redrawShadow();
            $("#" + element.shadowId() + " div").redrawShadow();
        }
    };
    if (typeof(options.classes) != "undefined") {
        $.each(options.classes, function () {
            floatBox.addClass(this);
        });
    }
    if (typeof(options.id) == "undefined") {
        options.id = "floatdiv";
    }
    if (typeof(options.position) == "undefined") {
        options.position = "bl";
    }
    floatBox.attr("id", options.id);
    if (typeof(options.borderColor) != "undefined") {
        settings.backgroundColor = options.borderColor;
    }
    if (typeof(options.round) == "undefined") {
        options.round = true;
    }
    if (typeof(options.shadow) == "undefined") {
        options.shadow = true;
    }
    switch (options.position) {
    case "bl":
        $.extend(settings, {
            left: $(this).position().left + 1,
            top: $(this).position().top + $(this).outerHeight() - 1
        });
        break;
    case "tl":
        $.extend(settings, {
            left: $(this).position().left + 1,
            top: $(this).position().top
        });
        break;
    case "br":
        $.extend(settings, {
            left: $(this).position().left + $(this).outerWidth(),
            top: $(this).position().top + $(this).outerHeight() - 1
        });
        break;
    case "tr":
        $.extend(settings, {
            left: $(this).position().left + $(this).outerWidth(),
            top: $(this).position().top
        });
        break;
    }
    if (typeof(options.css) != "undefined") {
        $.extend(settings, options.css);
    }
    floatBox.css(settings);
    if (typeof(options.after) != "undefined") {
        if (options.after) {
            $(this).parent().after(floatBox);
        } else {
            $(this).append(floatBox);
        }
    } else {
        $(this).append(floatBox);
    }
    floatBoxInner.css({
        backgroundColor: (typeof(options.background) == "undefined") ? "#fff" : options.background,
        height: "100%",
        margin: "1px",
        padding: (typeof(options.innerPad) == "undefined") ? "7px" : options.innerPad + "px",
        width: parseInt(floatBox.width(), 10) - ((typeof(options.innerPad) == "undefined") ? 16 : (options.innerPad * 2) + 2)
    });
    floatBox.append(floatBoxInner);
    if (options.round !== false) {
        floatBox.corner("round 6px");
        floatBoxInner.corner("round 6px");
    }
    if (options.shadow !== false) {
        shadowMe(floatBox, options.round);
    }
    return floatBox;
};
/*jslint undef: true, browser: true*/
/*global jQuery, $*/

/**
* hoverIntent is similar to jQuery's built-in "hover" function except that
* instead of firing the onMouseOver event immediately, hoverIntent checks
* to see if the user's mouse has slowed down (beneath the sensitivity
* threshold) before firing the onMouseOver event.
* 
* hoverIntent r5 // 2007.03.27 // jQuery 1.1.2+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* hoverIntent is currently available for use in all personal or commercial 
* projects under both MIT and GPL licenses. This means that you can choose 
* the license that best suits your project, and use it accordingly.
* 
* // basic usage (just like .hover) receives onMouseOver and onMouseOut functions
* $("ul li").hoverIntent( showNav , hideNav );
* 
* // advanced usage receives configuration object only
* $("ul li").hoverIntent({
*	sensitivity: 7, // number = sensitivity threshold (must be 1 or higher)
*	interval: 100,   // number = milliseconds of polling interval
*	over: showNav,  // function = onMouseOver callback (required)
*	timeout: 0,   // number = milliseconds delay before onMouseOut function call
*	out: hideNav    // function = onMouseOut callback (required)
* });
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne <brian@cherne.net>
*/
(function ($) {
    $.fn.hoverIntent = function (f, g) {
        // default configuration options
        var cfg = {
            sensitivity: 7,
            interval: 100,
            timeout: 0
        };
        // override configuration options with user supplied object
        cfg = $.extend(cfg, g ? {
            over: f,
            out: g
        } : f);

        // instantiate variables
        // cX, cY = current X and Y position of mouse, updated by mousemove event
        // pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
        var cX, cY, pX, pY;

        // A private function for getting mouse position
        var track = function (ev) {
            cX = ev.pageX;
            cY = ev.pageY;
        };

        // A private function for comparing current and previous mouse position
        var compare = function (ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            // compare mouse positions to see if they've crossed the threshold
            if ((Math.abs(pX - cX) + Math.abs(pY - cY)) < cfg.sensitivity) {
                $(ob).unbind("mousemove", track);
                // set hoverIntent state to true (so mouseOut can be called)
                ob.hoverIntent_s = 1;
                return cfg.over.apply(ob, [ev]);
            } else {
                // set previous coordinates for next time
                pX = cX;
                pY = cY;
                // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
                ob.hoverIntent_t = setTimeout(function () {
                    compare(ev, ob);
                },
                cfg.interval);
            }
        };

        // A private function for delaying the mouseOut function
        var delay = function (ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = 0;
            return cfg.out.apply(ob, [ev]);
        };

        // A private function for handling mouse 'hovering'
        var handleHover = function (e) {
            // next three lines copied from jQuery.hover, ignore children onMouseOver/onMouseOut
            var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;
            while (p && p != this) {
                try {
                    p = p.parentNode;
                } catch(e) {
                    p = this;
                }
            }
            if (p == this) {
                return false;
            }

            // copy objects to be passed into t (required for event object to be passed in IE)
            var ev = jQuery.extend({},
            e);
            var ob = this;

            // cancel hoverIntent timer if it exists
            if (ob.hoverIntent_t) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            }

            // else e.type == "onmouseover"
            if (e.type == "mouseover") {
                // set "previous" X and Y position based on initial entry point
                pX = ev.pageX;
                pY = ev.pageY;
                // update "current" X and Y position based on mousemove
                $(ob).bind("mousemove", track);
                // start polling interval (self-calling timeout) to compare mouse coordinates over time
                if (ob.hoverIntent_s != 1) {
                    ob.hoverIntent_t = setTimeout(function () {
                        compare(ev, ob);
                    },
                    cfg.interval);
                }

                // else e.type == "onmouseout"
            } else {
                // unbind expensive mousemove event
                $(ob).unbind("mousemove", track);
                // if hoverIntent state is true, then call the mouseOut function after the specified delay
                if (ob.hoverIntent_s == 1) {
                    ob.hoverIntent_t = setTimeout(function () {
                        delay(ev, ob);
                    },
                    cfg.timeout);
                }
            }
        };

        // bind the function to the two event listeners
        return this.mouseover(handleHover).mouseout(handleHover);
    };
})(jQuery);
/*jslint undef: true, browser: true*/
/*global jQuery, $*/

/*
 * iff - v0.2 - 6/3/2009
 * http://benalman.com/projects/jquery-iff-plugin/
 * 
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Licensed under the MIT license
 * http://benalman.com/about/license/
 */

(function ($) {

    $.fn.iff = function (test) {
        var elems = !test || $.isFunction(test) && !test.apply(this, Array.prototype.slice.call(arguments, 1)) ? [] : this;
        return this.pushStack(elems, 'iff', test);
    };

})(jQuery);

// http://mar.anomy.net/entry/2008/11/04/20.00.32/
jQuery.fn.extend({

    if_: function (cond) {
        if (jQuery.isFunction(cond)) {
            cond = cond.call(this);
        }
        this.if_CondMet = !!cond;
        return this.pushStack(cond ? this : []);
    },

    else_: function (cond) {
        var _this = this.end();
        return _this.if_CondMet ? _this.pushStack([]) : _this.if_(arguments.length ? cond : 1);
    }

});
/*jslint undef: true, browser: true*/
/*global jQuery, $*/

/**
 * http://plugins.jquery.com/project/Live-Extension
 * @author Alexander Farkas
 * @ version 1.05
 * 2009-08-10: Modified by Brian Schweitzer (BrianFreud) to fix JSLint problems.
 */
(function ($) {

    function getFnIndex(args) {
        var ret = 2;
        $.each(args, function (i, data) {

            if ($.isFunction(data)) {
                ret = i;
                return false;
            }
        });
        return ret;
    }

    (function () {

        var contains = document.compareDocumentPosition ?
        function (a, b) {
            return a.compareDocumentPosition(b) & 16;
        } : function (a, b) {
            return a !== b && (a.contains ? a.contains(b) : true);
        },
        oldLive = $.fn.live,
        oldDie = $.fn.die;

        function createEnterLeaveFn(fn, type) {
            return jQuery.event.proxy(fn, function (e) {
                if (this !== e.relatedTarget && e.relatedTarget && !contains(this, e.relatedTarget)) {
                    e.type = type;
                    fn.apply(this, arguments);
                }
            });
        }

        var enterLeaveTypes = {
            mouseenter: 'mouseover',
            mouseleave: 'mouseout'
        };

        $.fn.live = function (types) {
            var that = this,
            args = arguments,
            fnIndex = getFnIndex(args),
            fn = args[fnIndex];

            $.each(types.split(' '), function (i, type) {
                var proxy = fn;

                if (enterLeaveTypes[type]) {
                    proxy = createEnterLeaveFn(proxy, type);
                    type = enterLeaveTypes[type];
                }
                args[0] = type;
                args[fnIndex] = proxy;
                oldLive.apply(that, args);
            });
            return this;
        };

        $.fn.die = function (type, fn) {
            if (/mouseenter|mouseleave/.test(type)) {
                if (type == 'mouseenter') {
                    type = type.replace(/mouseenter/g, 'mouseover');
                }
                if (type == 'mouseleave') {
                    type = type.replace(/mouseleave/g, 'mouseout');
                }
            }
            oldDie.call(this, type, fn);
            return this;
        };

        function createBubbleFn(fn, selector, context) {
            return jQuery.event.proxy(fn, function (e) {
                var parent = this.parentNode,
                stop = (enterLeaveTypes[e.type]) ? e.relatedTarget : undefined;
                fn.apply(this, arguments);
                while (parent && parent !== context && parent !== e.relatedTarget) {
                    if ($.multiFilter(selector, [parent])[0]) {
                        fn.apply(parent, arguments);
                    }
                    parent = parent.parentNode;
                }
            });
        }

        $.fn.bubbleLive = function () {
            var args = arguments,
            fnIndex = getFnIndex(args);

            args[fnIndex] = createBubbleFn(args[fnIndex], this.selector, this.context);
            $.fn.live.apply(this, args);
        };

        $.fn.liveHover = function (enter, out) {
            return this.live('mouseenter', enter).live('mouseleave', out);
        };
    })();

    (function () {

        $.support.bubblingChange = !($.browser.msie || $.browser.safari);

        if (!$.support.bubblingChange) {

            var oldLive = $.fn.live,
            oldDie = $.fn.die,
            detectChange = function (fn) {
                return $.event.proxy(fn, function (e) {
                    var jElm = $(e.target);
                    if ((e.type !== 'keydown' || e.keyCode === 13) && jElm.is('input, textarea, select')) {

                        var oldData = jElm.data('changeVal'),
                        isRadioCheckbox = jElm.is(':checkbox, :radio'),
                        nowData;
                        if (isRadioCheckbox && jElm.is(':enabled') && e.type === 'click') {
                            nowData = jElm.is(':checked');
                            if ((e.target.type !== 'radio' || nowData === true) && e.type !== 'change' && oldData !== nowData) {
                                e.type = 'change';
                                jElm.trigger(e);
                            }
                        } else if (!isRadioCheckbox) {
                            nowData = jElm.val();
                            if (oldData !== undefined && oldData !== nowData) {
                                e.type = 'change';
                                jElm.trigger(e);
                            }
                        }
                        if (nowData !== undefined) {
                            jElm.data('changeVal', nowData);
                        }
                    }
                });
            },
            createChangeProxy = function (fn) {
                return $.event.proxy(fn, function (e) {
                    if (e.type === 'change') {
                        var jElm = $(e.target),
                        nowData = (jElm.is(':checkbox, :radio')) ? jElm.is(':checked') : jElm.val();
                        if (nowData === jElm.data('changeVal')) {
                            return false;
                        }
                        jElm.data('changeVal', nowData);
                    }
                    fn.apply(this, arguments);
                });
            };

            $.fn.live = function (type, fn) {
                var that = this,
                args = arguments,
                fnIndex = getFnIndex(args),
                proxy = args[fnIndex];

                if (type.indexOf('change') != -1) {
                    $(this.context).bind('click focusin focusout keydown', detectChange(proxy));
                    proxy = createChangeProxy(proxy);
                }
                args[fnIndex] = proxy;
                oldLive.apply(that, args);
                return this;
            };
            $.fn.die = function (type, fn) {
                if (type.indexOf('change') != -1) {
                    $(this.context).unbind('click focusin focusout keydown', fn);
                }
                oldDie.apply(this, arguments);
                return this;
            };

        }
    })();

    /**
 * Copyright (c) 2007 Jörn Zaefferer
 */

    (function () {
        $.support.focusInOut = !!($.browser.msie);
        if (!$.support.focusInOut) {
            $.each({
                focus: 'focusin',
                blur: 'focusout'
            },
            function (original, fix) {
                $.event.special[fix] = {
                    setup: function () {
                        if (!this.addEventListener) {
                            return false;
                        }
                        this.addEventListener(original, $.event.special[fix].handler, true);
                    },
                    teardown: function () {
                        if (!this.removeEventListener) {
                            return false;
                        }
                        this.removeEventListener(original, $.event.special[fix].handler, true);
                    },
                    handler: function (e) {
                        arguments[0] = $.event.fix(e);
                        arguments[0].type = fix;
                        return $.event.handle.apply(this, arguments);
                    }
                };
            });
        }
        //IE has some troubble with focusout with select and keyboard navigation
        var activeFocus = null,
        block;

        $(document).bind('focusin', function (e) {
            var target = e.realTarget || e.target;
            if (activeFocus && activeFocus !== target) {
                e.type = 'focusout';
                $(activeFocus).trigger(e);
                e.type = 'focusin';
                e.target = target;
            }
            activeFocus = target;
        }).bind('focusout', function (e) {
            activeFocus = null;
        });

    })();
})(jQuery);
(function($) {
  $.fn.lorem = function(options) {
  	$.fn.lorem.defaults = {
		type: 'paragraphs',
		amount: '3',
		ptags: true
	};
	var opts = $.extend({}, $.fn.lorem.defaults, options);
	var min_num = 1;  
	var max_num = 10; 
	var diff = max_num-min_num+1 ; 
	var howmany = opts.amount;
	var lorem = new Array(10);
	lorem[1] ="Nam quis nulla. Integer malesuada. In in enim a arcu imperdiet malesuada. Sed vel lectus. Donec odio urna, tempus molestie, porttitor ut, iaculis quis, sem. Phasellus rhoncus. Aenean id metus id velit ullamcorper pulvinar. Vestibulum fermentum tortor id mi. Pellentesque ipsum. Nulla non arcu lacinia neque faucibus fringilla. Nulla non lectus sed nisl molestie malesuada. Proin in tellus sit amet nibh dignissim sagittis. Vivamus luctus egestas leo. Maecenas sollicitudin. Nullam rhoncus aliquam metus. Etiam egestas wisi a erat."; 
	lorem[2] ="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam feugiat, turpis at pulvinar vulputate, erat libero tristique tellus, nec bibendum odio risus sit amet ante. Aliquam erat volutpat. Nunc auctor. Mauris pretium quam et urna. Fusce nibh. Duis risus. Curabitur sagittis hendrerit ante. Aliquam erat volutpat. Vestibulum erat nulla, ullamcorper nec, rutrum non, nonummy ac, erat. Duis condimentum augue id magna semper rutrum. Nullam justo enim, consectetuer nec, ullamcorper ac, vestibulum in, elit. Proin pede metus, vulputate nec, fermentum fringilla, vehicula vitae, justo. Fusce consectetuer risus a nunc. Aliquam ornare wisi eu metus. Integer pellentesque quam vel velit. Duis pulvinar."; 
	lorem[3] ="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi gravida libero nec velit. Morbi scelerisque luctus velit. Etiam dui sem, fermentum vitae, sagittis id, malesuada in, quam. Proin mattis lacinia justo. Vestibulum facilisis auctor urna. Aliquam in lorem sit amet leo accumsan lacinia. Integer rutrum, orci vestibulum ullamcorper ultricies, lacus quam ultricies odio, vitae placerat pede sem sit amet enim. Phasellus et lorem id felis nonummy placerat. Fusce dui leo, imperdiet in, aliquam sit amet, feugiat eu, orci. Aenean vel massa quis mauris vehicula lacinia. Quisque tincidunt scelerisque libero. Maecenas libero. Etiam dictum tincidunt diam. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Suspendisse nisl. Sed convallis magna eu sem. Cras pede libero, dapibus nec, pretium sit amet, tempor quis, urna."; 
	lorem[4] ="Etiam posuere quam ac quam. Maecenas aliquet accumsan leo. Nullam dapibus fermentum ipsum. Etiam quis quam. Integer lacinia. Nulla est. Nulla turpis magna, cursus sit amet, suscipit a, interdum id, felis. Integer vulputate sem a nibh rutrum consequat. Maecenas lorem. Pellentesque pretium lectus id turpis. Etiam sapien elit, consequat eget, tristique non, venenatis quis, ante. Fusce wisi. Phasellus faucibus molestie nisl. Fusce eget urna. Curabitur vitae diam non enim vestibulum interdum. Nulla quis diam. Ut tempus purus at lorem."; 
	lorem[5] ="In sem justo, commodo ut, suscipit at, pharetra vitae, orci. Duis sapien nunc, commodo et, interdum suscipit, sollicitudin et, dolor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam id dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Mauris dictum facilisis augue. Fusce tellus. Pellentesque arcu. Maecenas fermentum, sem in pharetra pellentesque, velit turpis volutpat ante, in pharetra metus odio a lectus. Sed elit dui, pellentesque a, faucibus vel, interdum nec, diam. Mauris dolor felis, sagittis at, luctus sed, aliquam non, tellus. Etiam ligula pede, sagittis quis, interdum ultricies, scelerisque eu, urna. Nullam at arcu a est sollicitudin euismod. Praesent dapibus. Duis bibendum, lectus ut viverra rhoncus, dolor nunc faucibus libero, eget facilisis enim ipsum id lacus. Nam sed tellus id magna elementum tincidunt."; 
	lorem[6] ="Morbi a metus. Phasellus enim erat, vestibulum vel, aliquam a, posuere eu, velit. Nullam sapien sem, ornare ac, nonummy non, lobortis a, enim. Nunc tincidunt ante vitae massa. Duis ante orci, molestie vitae, vehicula venenatis, tincidunt ac, pede. Nulla accumsan, elit sit amet varius semper, nulla mauris mollis quam, tempor suscipit diam nulla vel leo. Etiam commodo dui eget wisi. Donec iaculis gravida nulla. Donec quis nibh at felis congue commodo. Etiam bibendum elit eget erat."; 
	lorem[7] ="Praesent in mauris eu tortor porttitor accumsan. Mauris suscipit, ligula sit amet pharetra semper, nibh ante cursus purus, vel sagittis velit mauris vel metus. Aenean fermentum risus id tortor. Integer imperdiet lectus quis justo. Integer tempor. Vivamus ac urna vel leo pretium faucibus. Mauris elementum mauris vitae tortor. In dapibus augue non sapien. Aliquam ante. Curabitur bibendum justo non orci."; 
	lorem[8] ="Morbi leo mi, nonummy eget, tristique non, rhoncus non, leo. Nullam faucibus mi quis velit. Integer in sapien. Fusce tellus odio, dapibus id, fermentum quis, suscipit id, erat. Fusce aliquam vestibulum ipsum. Aliquam erat volutpat. Pellentesque sapien. Cras elementum. Nulla pulvinar eleifend sem. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque porta. Vivamus porttitor turpis ac leo."; 
	lorem[9] ="Maecenas ipsum velit, consectetuer eu, lobortis ut, dictum at, dui. In rutrum. Sed ac dolor sit amet purus malesuada congue. In laoreet, magna id viverra tincidunt, sem odio bibendum justo, vel imperdiet sapien wisi sed libero. Suspendisse sagittis ultrices augue. Mauris metus. Nunc dapibus tortor vel mi dapibus sollicitudin. Etiam posuere lacus quis dolor. Praesent id justo in neque elementum ultrices. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. In convallis. Fusce suscipit libero eget elit. Praesent vitae arcu tempor neque lacinia pretium. Morbi imperdiet, mauris ac auctor dictum, nisl ligula egestas nulla, et sollicitudin sem purus in lacus."; 
	lorem[10] ="Aenean placerat. In vulputate urna eu arcu. Aliquam erat volutpat. Suspendisse potenti. Morbi mattis felis at nunc. Duis viverra diam non justo. In nisl. Nullam sit amet magna in magna gravida vehicula. Mauris tincidunt sem sed arcu. Nunc posuere. Nullam lectus justo, vulputate eget, mollis sed, tempor sed, magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam neque. Curabitur ligula sapien, pulvinar a, vestibulum quis, facilisis vel, sapien. Nullam eget nisl. Donec vitae arcu."; 
	function makeipsum(){
		var ipsum_text = "";
		for (var i = 0; i < howmany; i++){
			rnd_number=Math.floor(Math.random()*diff + min_num); 
		if(options.ptags==true){
			ipsum_text+="<p>";
		}
		ipsum_text+=lorem[rnd_number];
		if(opts.ptags==true){
			ipsum_text+="</p>";
		}
		ipsum_text+="\n\n";
		}
		switch(opts.type) {
			case "words":{
		      	var numOfWords = opts.amount;
				numOfWords = parseInt( numOfWords );
				var list = new Array();
				var wordList = new Array();
				wordList = ipsum_text.split( ' ' );
				var iParagraphCount = 0;
				var iWordCount = 0;
				while( list.length < numOfWords ) {
					if( iWordCount > wordList.length ) {
						iWordCount = 0;
		        		iParagraphCount++;
		      		  	if( iParagraphCount + 1 > lorem.length ) {
							iParagraphCount = 0;
						}
		        		wordList = lorem[ iParagraphCount ].split( ' ' );
		        		wordList[0] = "\n\n" + wordList[ 0 ];
					}
		       		list.push( wordList[ iWordCount ] );
		       		iWordCount++;
				}
				ipsum_text = list.join(' '); // changed
			break;
			}
			case 'characters':
			{
				var outputString = '';
			    var numOfChars = opts.amount;
			    numOfChars = parseInt( numOfChars );
			    var tempString = lorem.join( "\n\n" );
				while(outputString.length < numOfChars ){
						outputString += tempString;
				}
			    ipsum_text = outputString.substring(0, numOfChars );
			break;
			}
			case 'paragraphs':{
			///no action needed
			break;
			}
		}
		return ipsum_text;
	}


return this.each(function() {
	  $this = $(this);
	  var markup = makeipsum();
	  $this.html(markup);
	  
	});
  };

})(jQuery);
/*jslint undef: true, browser: true*/
/*global jQuery, $*/

// ----------------------------------------------------------------------------
// markItUp! Universal MarkUp Engine, JQuery plugin
// v 1.1.5
// NOTE: Do not just upgrade by replacing this file! -- Brian Schweitzer (BrianFreud) 2009-08-03
//       This version has had the preview functions modified, some JSLinting, and tiny speed imrprovements.
//
// Dual licensed under the MIT and GPL licenses.
// ----------------------------------------------------------------------------
// Copyright (C) 2007-2008 Jay Salvat
// http://markitup.jaysalvat.com/
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------
(function ($) {
    $.fn.markItUp = function (settings, extraSettings) {
        var options, ctrlKey, shiftKey, altKey;
        ctrlKey = shiftKey = altKey = false;

        options = {
            id: '',
            nameSpace: '',
            root: '',
            previewInWindow: '',
            // 'width=800, height=600, resizable=yes, scrollbars=yes'
            previewAutoRefresh: true,
            previewPosition: 'after',
            previewTemplatePath: '~/templates/preview.html',
            previewParserPath: '',
            previewParserVar: 'data',
            resizeHandle: true,
            beforeInsert: '',
            afterInsert: '',
            onEnter: {},
            onShiftEnter: {},
            onCtrlEnter: {},
            onTab: {},
            markupSet: [{
                /* set */
            }]
        };
        $.extend(options, settings, extraSettings);

        // compute markItUp! path
        if (!options.root) {
            $('script').each(function (a, tag) {
                var miuScript = $(tag).get(0).src.match(/(.*)jquery\.markitup(\.pack)?\.js$/);
                if (miuScript !== null) {
                    options.root = miuScript[1];
                }
            });
        }

        return this.each(function () {
            // apply the computed path to ~/
            function localize(data, inText) {
                if (inText) {
                    return data.replace(/("|')~\//g, "$1" + options.root);
                }
                return data.replace(/^~\//, options.root);
            }

            var $$, textarea, levels, scrollPosition, caretPosition, caretOffset, clicked, hash, header, footer, previewWindow, template, iFrame, abort;
            $$ = $(this);
            textarea = this;
            levels = [];
            abort = false;
            scrollPosition = caretPosition = 0;
            caretOffset = -1;

            options.previewParserPath = localize(options.previewParserPath);
            options.previewTemplatePath = localize(options.previewTemplatePath);

            // recursively build header with dropMenus from markupset
            function dropMenus(markupSet) {
                var ul = $('<ul></ul>'),
                i = 0;
                $('li:hover > ul', ul).css('display', 'block');
                $.each(markupSet, function () {
                    var button = this,
                    t = '',
                    title, li, j, title = (button.key) ? (button.name || '') + ' [Ctrl+' + button.key + ']' : (button.name || ''),
                    key = (button.key) ? 'accesskey="' + button.key + '"' : '';
                    if (button.separator) {
                        li = $('<li class="markItUpSeparator">' + (button.separator || '') + '</li>').appendTo(ul);
                    } else {
                        i++;
                        for (j = levels.length - 1; j >= 0; j--) {
                            t += levels[j] + "-";
                        }
                        li = $('<li class="markItUpButton markItUpButton' + t + (i) + ' ' + (button.className || '') + '"><a href="" ' + key + ' title="' + title + '">' + (button.name || '') + '</a></li>').bind("contextmenu", function () { // prevent contextmenu on mac and allow ctrl+click
                            return false;
                        }).click(function () {
                            return false;
                        }).mouseup(function () {
                            if (button.call) {
                                eval(button.call)();
                            }
                            markup(button);
                            return false;
                        }).hover(function () {
                            $('> ul', this).css("display", "block")
                            $(document).one('click', function () { // close dropmenu if click outside
                                $('ul ul', header).css("display", "none");
                            });
                        },
                        function () {
                            $('> ul', this).css("display", "none");
                        }).appendTo(ul);
                        if (button.dropMenu) {
                            levels.push(i);
                            $(li).addClass('markItUpDropMenu').append(dropMenus(button.dropMenu));
                        }
                    }
                });
                levels.pop();
                return ul;
            }

            // init and build editor
            function init() {
                var id = '',
                nameSpace = '';
                if (options.id) {
                    id = 'id="' + options.id + '"';
                } else if ($$.attr("id")) {
                    id = 'id="markItUp' + ($$.attr("id").substr(0, 1).toUpperCase()) + ($$.attr("id").substr(1)) + '"';

                }
                if (options.nameSpace) {
                    nameSpace = 'class="' + options.nameSpace + '"';
                }
                $$.wrap('<div ' + nameSpace + '></div>');
                $$.wrap('<div ' + id + ' class="markItUp"></div>');
                $$.wrap('<div class="markItUpContainer"></div>');
                $$.addClass("markItUpEditor");

                // add the header before the textarea
                header = $('<div class="markItUpHeader"></div>').insertBefore($$);
                $(dropMenus(options.markupSet)).appendTo(header);

                // add the footer after the textarea
                footer = $('<div class="markItUpFooter"></div>').insertAfter($$);

                // add the resize handle after textarea
                if (options.resizeHandle === true && $.browser.safari !== true) {
                    resizeHandle = $('<div class="markItUpResizeHandle"></div>').insertAfter($$).bind("mousedown", function (e) {
                        var h = $$.height(),
                        y = e.clientY,
                        mouseMove,
                        mouseUp;
                        mouseMove = function (e) {
                            $$.css("height", Math.max(20, e.clientY + h - y) + "px");
                            return false;
                        };
                        mouseUp = function (e) {
                            $("html").unbind("mousemove", mouseMove).unbind("mouseup", mouseUp);
                            return false;
                        };
                        $("html").bind("mousemove", mouseMove).bind("mouseup", mouseUp);
                    });
                    footer.append(resizeHandle);
                }

                // listen key events
                $$.keydown(keyPressed).keyup(keyPressed);

                // bind an event to catch external calls
                $$.bind("insertion", function (e, settings) {
                    if (settings.target !== false) {
                        get();
                    }
                    if (textarea === $.markItUp.focused) {
                        markup(settings);
                    }
                });

                // remember the last focus
                $$.focus(function () {
                    $.markItUp.focused = this;
                });
            }

            // markItUp! markups
            function magicMarkups(string) {
                if (string) {
                    string = string.toString();
                    string = string.replace(/\(\!\(([\s\S]*?)\)\!\)/g, function (x, a) {
                        var b = a.split('|!|');
                        if (altKey === true) {
                            return (b[1] !== undefined) ? b[1] : b[0];
                        } else {
                            return (b[1] === undefined) ? "" : b[0];
                        }
                    });
                    // [![prompt]!], [![prompt:!:value]!]
                    string = string.replace(/\[\!\[([\s\S]*?)\]\!\]/g, function (x, a) {
                        var b = a.split(':!:');
                        if (abort === true) {
                            return false;
                        }
                        value = prompt(b[0], (b[1]) ? b[1] : '');
                        if (value === null) {
                            abort = true;
                        }
                        return value;
                    });
                    return string;
                }
                return "";
            }

            // prepare action
            function prepare(action) {
                if ($.isFunction(action)) {
                    action = action(hash);
                }
                return magicMarkups(action);
            }

            // build block to insert
            function build(string) {
                openWith = prepare(clicked.openWith);
                placeHolder = prepare(clicked.placeHolder);
                replaceWith = prepare(clicked.replaceWith);
                closeWith = prepare(clicked.closeWith);
                if (replaceWith !== "") {
                    block = openWith + replaceWith + closeWith;
                } else if (selection === '' && placeHolder !== '') {
                    block = openWith + placeHolder + closeWith;
                } else {
                    block = openWith + (string || selection) + closeWith;
                }
                return {
                    block: block,
                    openWith: openWith,
                    replaceWith: replaceWith,
                    placeHolder: placeHolder,
                    closeWith: closeWith
                };
            }

            // define markup to insert
            function markup(button) {
                var len, j, n, i;
                hash = clicked = button;
                get();

                $.extend(hash, {
                    line: "",
                    root: options.root,
                    textarea: textarea,
                    selection: (selection || ''),
                    caretPosition: caretPosition,
                    ctrlKey: ctrlKey,
                    shiftKey: shiftKey,
                    altKey: altKey
                });
                // callbacks before insertion
                prepare(options.beforeInsert);
                prepare(clicked.beforeInsert);
                if (ctrlKey === true && shiftKey === true) {
                    prepare(clicked.beforeMultiInsert);
                }
                $.extend(hash, {
                    line: 1
                });

                if (ctrlKey === true && shiftKey === true) {
                    lines = selection.split(/\r?\n/);
                    for (j = 0, n = lines.length, i = 0; i < n; i++) {
                        if ($.trim(lines[i]) !== '') {
                            $.extend(hash, {
                                line: ++j,
                                selection: lines[i]
                            });
                            lines[i] = build(lines[i]).block;
                        } else {
                            lines[i] = "";
                        }
                    }
                    string = {
                        block: lines.join('\n')
                    };
                    start = caretPosition;
                    len = string.block.length + (($.browser.opera) ? n : 0);
                } else if (ctrlKey === true) {
                    string = build(selection);
                    start = caretPosition + string.openWith.length;
                    len = string.block.length - string.openWith.length - string.closeWith.length;
                    len -= fixIeBug(string.block);
                } else if (shiftKey === true) {
                    string = build(selection);
                    start = caretPosition;
                    len = string.block.length;
                    len -= fixIeBug(string.block);
                } else {
                    string = build(selection);
                    start = caretPosition + string.block.length;
                    len = 0;
                    start -= fixIeBug(string.block);
                }
                if ((selection === '' && string.replaceWith === '')) {
                    caretOffset += fixOperaBug(string.block);

                    start = caretPosition + string.openWith.length;
                    len = string.block.length - string.openWith.length - string.closeWith.length;

                    caretOffset = $$.val().substring(caretPosition, $$.val().length).length;
                    caretOffset -= fixOperaBug($$.val().substring(0, caretPosition));
                }
                $.extend(hash, {
                    caretPosition: caretPosition,
                    scrollPosition: scrollPosition
                });

                if (string.block !== selection && abort === false) {
                    insert(string.block);
                    set(start, len);
                } else {
                    caretOffset = -1;
                }
                get();

                $.extend(hash, {
                    line: '',
                    selection: selection
                });

                // callbacks after insertion
                if (ctrlKey === true && shiftKey === true) {
                    prepare(clicked.afterMultiInsert);
                }
                prepare(clicked.afterInsert);
                prepare(options.afterInsert);

                // refresh preview if opened
                if (previewWindow && options.previewAutoRefresh) {
                    refreshPreview();
                }

                // reinit keyevent
                shiftKey = altKey = ctrlKey = abort = false;
            }

            // Substract linefeed in Opera
            function fixOperaBug(string) {
                if ($.browser.opera) {
                    return string.length - string.replace(/\n*/g, '').length;
                }
                return 0;
            }
            // Substract linefeed in IE
            function fixIeBug(string) {
                if ($.browser.msie) {
                    return string.length - string.replace(/\r*/g, '').length;
                }
                return 0;
            }

            // add markup
            function insert(block) {
                if (document.selection) {
                    var newSelection = document.selection.createRange();
                    newSelection.text = block;
                } else {
                    $$.val($$.val().substring(0, caretPosition) + block + $$.val().substring(caretPosition + selection.length, $$.val().length));
                }
            }

            // set a selection
            function set(start, len) {
                if (textarea.createTextRange) {
                    // quick fix to make it work on Opera 9.5
                    if ($.browser.opera && $.browser.version >= 9.5 && len === 0) {
                        return false;
                    }
                    range = textarea.createTextRange();
                    range.collapse(true);
                    range.moveStart('character', start);
                    range.moveEnd('character', len);
                    range.select();
                } else if (textarea.setSelectionRange) {
                    textarea.setSelectionRange(start, start + len);
                }
                textarea.scrollTop = scrollPosition;
                textarea.focus();
            }

            // get the selection
            function get() {
                textarea.focus();

                scrollPosition = textarea.scrollTop;
                if (document.selection) {
                    selection = document.selection.createRange().text;
                    if ($.browser.msie) { // ie
                        var range = document.selection.createRange(),
                        rangeCopy = range.duplicate();
                        rangeCopy.moveToElementText(textarea);
                        caretPosition = -1;
                        while (rangeCopy.inRange(range)) { // fix most of the ie bugs with linefeeds...
                            rangeCopy.moveStart('character');
                            caretPosition++;
                        }
                    } else { // opera
                        caretPosition = textarea.selectionStart;
                    }
                } else { // gecko
                    caretPosition = textarea.selectionStart;
                    selection = $$.val().substring(caretPosition, textarea.selectionEnd);
                }
                return selection;
            }

            // open preview window
            function preview() {
                if (!previewWindow || previewWindow.closed) {
                    if (options.previewInWindow) {
                        previewWindow = window.open('', 'preview', options.previewInWindow);
                    } else {
                        iFrame = $('<iframe class="markItUpPreviewFrame"></iframe>');
                        if (options.previewPosition == 'after') {
                            iFrame.insertAfter(footer);
                        } else {
                            iFrame.insertBefore(header);
                        }
                        previewWindow = iFrame[iFrame.length - 1].contentWindow || frame[iFrame.length - 1];
                    }
                } else if (altKey === true) {
                    if (iFrame) {
                        iFrame.remove();
                    }
                    previewWindow.close();
                    previewWindow = iFrame = false;
                }
                if (!options.previewAutoRefresh) {
                    refreshPreview();
                }
            }

            // refresh Preview window
            function refreshPreview() {
                if (previewWindow.document) {
                    try {
                        sp = previewWindow.document.documentElement.scrollTop;
                    } catch(e) {
                        sp = 0;
                    }
                    previewWindow.document.open();
                    previewWindow.document.write(renderPreview());
                    previewWindow.document.close();
                    previewWindow.document.documentElement.scrollTop = sp;
                }
                if (options.previewInWindow) {
                    previewWindow.focus();
                }
            }

            function renderPreview() {
                // This function has been changed from the official distribution's version. --BrianFreud, 2009-08-03
                phtml = "<html><head></head><body>" + $$.val() + "</body></html>";
                return phtml;
            }

            // set keys pressed
            function keyPressed(e) {
                shiftKey = e.shiftKey;
                altKey = e.altKey;
                ctrlKey = (!(e.altKey && e.ctrlKey)) ? e.ctrlKey : false;

                if (e.type === 'keydown') {
                    if (ctrlKey === true) {
                        li = $("a[accesskey=" + String.fromCharCode(e.keyCode) + "]", header).parent('li');
                        if (li.length !== 0) {
                            ctrlKey = false;
                            li.triggerHandler('mouseup');
                            return false;
                        }
                    }
                    if (e.keyCode === 13 || e.keyCode === 10) { // Enter key
                        if (ctrlKey === true) { // Enter + Ctrl
                            ctrlKey = false;
                            markup(options.onCtrlEnter);
                            return options.onCtrlEnter.keepDefault;
                        } else if (shiftKey === true) { // Enter + Shift
                            shiftKey = false;
                            markup(options.onShiftEnter);
                            return options.onShiftEnter.keepDefault;
                        } else { // only Enter
                            markup(options.onEnter);
                            return options.onEnter.keepDefault;
                        }
                    }
                    if (e.keyCode === 9) { // Tab key
                        if (shiftKey === true || ctrlKey === true || altKey === true) { // Thx Dr Floob.
                            return false;
                        }
                        if (caretOffset !== -1) {
                            get();
                            caretOffset = $$.val().length - caretOffset;
                            set(caretOffset, 0);
                            caretOffset = -1;
                            return false;
                        } else {
                            markup(options.onTab);
                            return options.onTab.keepDefault;
                        }
                    }
                }
            }

            init();
        });
    };

    $.fn.markItUpRemove = function () {
        return this.each(function () {
            $$ = $(this).unbind().removeClass('markItUpEditor');
            $$.parent('div').parent('div.markItUp').parent('div').replaceWith($$);
        });
    };

    $.markItUp = function (settings) {
        var options = {
            target: false
        };
        $.extend(options, settings);
        if (options.target) {
            return $(options.target).each(function () {
                $(this).focus();
                $(this).trigger('insertion', [options]);
            });
        } else {
            $('textarea').trigger('insertion', [options]);
        }
    };
})(jQuery);
/* This adds an outerHTML function.
 *
 * By Brian Schweitzer (BrianFreud)
 *
 * Based on outerHTML functions from http://brandonaaron.net/blog/2007/06/17/jquery-snippets-outerhtml
 * Originally by Brandon Aaron, with multi-document support added by Brian Grinstead, 
 * and a <script> workaround for http://dev.jquery.com/ticket/4801 from Al.
 */

$.fn.outerHTML = function () {
    if (this.find("script").length === 0) {
        var doc = this[0] ? this[0].ownerDocument : document;
        return $('<div>', doc).append(this.eq(0).clone()).html();
    } else {
        var p = document.createElement('p');
        var c = this.eq(0).clone();
        p.appendChild(c[0]);
        return (s) ? this.before(s).remove() : p.innerHTML;
    }
};
/* Element replace function by Brandon Aaron
 * from http://brandonaaron.net/blog/2007/06/01/jquery-snippets-replace/
 */

jQuery.fn.replace = function () {
    var stack = [];
    return this.domManip(arguments, true, 1, function (a) {
        this.parentNode.replaceChild(a, this);
        stack.push(a);
    }).pushStack(stack);
};
/*jslint undef: true, browser: true*/
/*global jQuery, $*/

/**
 * jQuery.ScrollTo
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 5/25/2009
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * Works with jQuery +1.2.6. Tested on FF 2/3, IE 6/7/8, Opera 9.5/6, Safari 3, Chrome 1 on WinXP.
 *
 * @author Ariel Flesler
 * @version 1.4.2
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *      The different options for target are:
 *        - A number position (will be applied to all axes).
 *        - A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *        - A jQuery/DOM element ( logically, child of the element to scroll )
 *        - A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *        - A hash { top:x, left:y }, x and y can be any kind of number/string like above.
*        - A percentage of the container's dimension/s, for example: 50% to go to the middle.
 *        - The string 'max' for go-to-end. 
 * @param {Number} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *     @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *     @option {Number} duration The OVERALL length of the animation.
 *     @option {String} easing The easing method for the animation.
 *     @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *     @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *     @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *     @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *     @option {Function} onAfter Function to be called after the scrolling ends. 
 *     @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @dec Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @ Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *            $('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *                alert('scrolled!!');                                                                   
 *            }});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */
(function ($) {

    var $scrollTo = $.scrollTo = function (target, duration, settings) {
        $(window).scrollTo(target, duration, settings);
    },
    both = function (val) {
        return typeof val == 'object' ? val : {
            top: val,
            left: val
        };
    };

    $scrollTo.defaults = {
        axis: 'xy',
        duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1
    };

    // Returns the element that needs to be animated to scroll the window.
    // Kept for backwards compatibility (specially for localScroll & serialScroll)
    $scrollTo.window = function (scope) {
        return $(window)._scrollable();
    };

    // Hack, hack, hack :)
    // Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
    $.fn._scrollable = function () {
        return this.map(function () {
            var elem = this,
            isWin = !elem.nodeName || $.inArray(elem.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1;

            if (!isWin) {
                return elem;
            }

            var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;

            return $.browser.safari || doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;
        });
    };

    $.fn.scrollTo = function (target, duration, settings) {
        if (typeof duration == 'object') {
            settings = duration;
            duration = 0;
        }
        if (typeof settings == 'function') {
            settings = {
                onAfter: "settings"
            };
        }
        if (target == 'max') {
            target = "9e9";
        }

        settings = $.extend({},
        $scrollTo.defaults, settings);
        // Speed is still recognized for backwards compatibility
        duration = duration || settings.speed || settings.duration;
        // Make sure the settings are given right
        settings.queue = settings.queue && settings.axis.length > 1;

        if (settings.queue) {
            // Let's keep the overall duration
            duration /= 2;
        }
        settings.offset = both(settings.offset);
        settings.over = both(settings.over);

        return this._scrollable().each(function () {
            var elem = this,
            $elem = $(elem),
            targ = target,
            toff,
            attr = {},
            win = $elem.is('html,body'),
            animate = function (callback) {
                $elem.animate(attr, duration, settings.easing, callback &&
                function () {
                    callback.call(this, target, settings);
                });
            };

            switch (typeof targ) {
                // A number will pass the regex
            case 'number':
            case 'string':
                if (/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
                    targ = both(targ);
                    // We are done
                    break;
                }
                // Relative selector, no break!
                targ = $(targ, this);
            case 'object':
                // DOMElement / jQuery
                if (targ.is || targ.style) {
                    // Get the real position of the target 
                    toff = (targ = $(targ)).offset();
                }
            }
            $.each(settings.axis.split(''), function (i, axis) {
                var Pos = axis == 'x' ? 'Left' : 'Top',
                pos = Pos.toLowerCase(),
                key = 'scroll' + Pos,
                old = elem[key],
                max = $scrollTo.max(elem, axis);

                if (toff) { // jQuery / DOMElement
                    attr[key] = toff[pos] + (win ? 0 : old - $elem.offset()[pos]);

                    // If it's a dom element, reduce the margin
                    if (settings.margin) {
                        attr[key] -= parseInt(targ.css('margin' + Pos), 10) || 0;
                        attr[key] -= parseInt(targ.css('border' + Pos + 'Width'), 10) || 0;
                    }

                    attr[key] += settings.offset[pos] || 0;

                    if (settings.over[pos]) {
                        // Scroll to a fraction of its width/height
                        attr[key] += targ[axis == 'x' ? 'width' : 'height']() * settings.over[pos];
                    }
                } else {
                    var val = targ[pos];
                    // Handle percentage values
                    attr[key] = val.slice && val.slice(-1) == '%' ? parseFloat(val) / 100 * max : val;
                }

                // Number or 'number'
                if (/^\d+$/.test(attr[key])) {
                    // Check the limits
                    attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
                }
                // Queueing axes
                if (!i && settings.queue) {
                    // Don't waste time animating, if there's no need.
                    if (old != attr[key]) {
                        // Intermediate animation
                        animate(settings.onAfterFirst);
                    }
                    // Don't animate this axis again in the next iteration.
                    delete attr[key];
                }
            });

            animate(settings.onAfter);

        }).end();
    };

    // Max scrolling position, works on quirks mode
    // It only fails (not too badly) on IE, quirks mode.
    $scrollTo.max = function (elem, axis) {
        var Dim = axis == 'x' ? 'Width' : 'Height',
        scroll = 'scroll' + Dim;

        if (!$(elem).is('html,body')) {
            return elem[scroll] - $(elem)[Dim.toLowerCase()]();
        }

        var size = 'client' + Dim,
        html = elem.ownerDocument.documentElement,
        body = elem.ownerDocument.body;

        return Math.max(html[scroll], body[scroll]) - Math.min(html[size], body[size]);

    };

})(jQuery);
/*jslint undef: true, browser: true*/
/*global jQuery, $*/

/*
 *
 * Copyright (c) 2006-2009 Sam Collett (http://www.texotela.co.uk)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version 2.2.4
 * Demo: http://www.texotela.co.uk/code/jquery/select/
 * Modified to include beta version of addOption(): http://www.texotela.co.uk/code/jquery/select/indexdev.php
 *
 * $LastChangedDate$
 * $Rev$
 *
 */

(function ($) {

    /**
 * Adds (single/multiple) options to a select box (or series of select boxes)
 *
 * @name     addOption
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @type     jQuery
 * @example  $("#myselect").addOption("Value", "Text"); // add single value (will be selected)
 * @example  $("#myselect").addOption("Value 2", "Text 2", false); // add single value (won't be selected)
 * @example  $("#myselect").addOption({"foo":"bar","bar":"baz"}, false); // add multiple values, but don't select
 *
 * @example (beta) Use $("#myselect").addOption("Value", "Text Edit", false) to edit an existing entry with the value Value
 *
 */
    $.fn.addOption = function () {
        var add = function (el, v, t, sO) {
            var option, newOption = true;
            // create cache
            if (!el.cache) {
                el.cache = {};
            }
            // get options
            var o = el.options,
            // get number of options
            oL = o.length;
            // check if option already exists
            for (var i = 0; i < oL; i++) {
                // add to cache if not already there
                if (!el.cache[o[i].value]) {
                    el.cache[o[i].value] = i;
                }
                // if option with value already exists, set it to option variable
                if (o[i].value == v) {
                    option = o[i];
                    newOption = false;
                }
            }
            // if option does not already exist, create it
            if (typeof option == "undefined") {
                option = document.createElement("option");
                option.value = v;
            }
            option.text = t;
            // add to cache if it isn't already
            if (typeof el.cache[v] == "undefined") {
                el.cache[v] = oL;
            }
            // if it is a new, rather than edited option, add it
            if (newOption) {
                el.options[el.cache[v]] = option;
            }
            if (sO) {
                option.selected = true;
            }
        };

        var a = arguments;
        if (a.length === 0) {
            return this;
        }
        // select option when added? default is true
        var sO = true,
        // multiple items
        m = false,
        // other variables
        items, v, t;
        if (typeof(a[0]) == "object") {
            m = true;
            items = a[0];
        }
        if (a.length >= 2) {
            if (typeof(a[1]) == "boolean") {
                sO = a[1];
            }
            else if (typeof(a[2]) == "boolean") {
                sO = a[2];
            }
            if (!m) {
                v = a[0];
                t = a[1];
            }
        }
        this.each(
        function () {
            if (this.nodeName.toLowerCase() != "select") {
                return;
            }
            if (m) {
                for (var item in items) {
                    add(this, item, items[item], sO);
                }
            }
            else {
                add(this, v, t, sO);
            }
        });
        return this;
    };
    /**
 * Add options via ajax
 *
 * @name     ajaxAddOption
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @type     jQuery
 * @param    String url      Page to get options from (must be valid JSON)
 * @param    Object params   (optional) Any parameters to send with the request
 * @param    Boolean select  (optional) Select the added options, default true
 * @param    Function fn     (optional) Call this function with the select object as param after completion
 * @param    Array args      (optional) Array with params to pass to the function afterwards
 * @example  $("#myselect").ajaxAddOption("myoptions.php");
 * @example  $("#myselect").ajaxAddOption("myoptions.php", {"code" : "007"});
 * @example  $("#myselect").ajaxAddOption("myoptions.php", {"code" : "007"}, false, sortoptions, [{"dir": "desc"}]);
 *
 */
    $.fn.ajaxAddOption = function (url, params, select, fn, args) {
        if (typeof(url) != "string") {
            return this;
        }
        if (typeof(params) != "object") {
            params = {};
        }
        if (typeof(select) != "boolean") {
            select = true;
        }
        this.each(
        function () {
            var el = this;
            $.getJSON(url, params, function (r) {
                $(el).addOption(r, select);
                if (typeof fn == "function") {
                    if (typeof args == "object") {
                        fn.apply(el, args);
                    }
                    else {
                        fn.call(el);
                    }
                }
            });
        });
        return this;
    };

    /**
 * Removes an option (by value or index) from a select box (or series of select boxes)
 *
 * @name     removeOption
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @type     jQuery
 * @param    String|RegExp|Number what  Option to remove
 * @param    Boolean selectedOnly       (optional) Remove only if it has been selected (default false)   
 * @example  $("#myselect").removeOption("Value"); // remove by value
 * @example  $("#myselect").removeOption(/^val/i); // remove options with a value starting with 'val'
 * @example  $("#myselect").removeOption(/./); // remove all options
 * @example  $("#myselect").removeOption(/./, true); // remove all options that have been selected
 * @example  $("#myselect").removeOption(0); // remove by index
 * @example  $("#myselect").removeOption(["myselect_1","myselect_2"]); // values contained in passed array
 *
 */
    $.fn.removeOption = function () {
        var a = arguments;
        if (a.length === 0) {
            return this;
        }
        var ta = typeof(a[0]),
        v,
        index;
        // has to be a string or regular expression (object in IE, function in Firefox)
        if (ta == "string" || ta == "object" || ta == "function") {
            v = a[0];
            // if an array, remove items
            if (v.constructor == Array) {
                var l = v.length;
                for (var i = 0; i < l; i++) {
                    this.removeOption(v[i], a[1]);
                }
                return this;
            }
        }
        else if (ta == "number") {
            index = a[0];
        }
        else {
            return this;
        }
        this.each(
        function () {
            if (this.nodeName.toLowerCase() != "select") {
                return;
            }
            // clear cache
            if (this.cache) {
                this.cache = null;
            }
            // does the option need to be removed?
            var remove = false,
            // get options
            o = this.options;
            if ( !! v) {
                // get number of options
                var oL = o.length;
                for (var i = oL - 1; i >= 0; i--) {
                    if (v.constructor == RegExp) {
                        if (o[i].value.match(v)) {
                            remove = true;
                        }
                    }
                    else if (o[i].value == v) {
                        remove = true;
                    }
                    // if the option is only to be removed if selected
                    if (remove && a[1] === true) {
                        remove = o[i].selected;
                    }
                    if (remove) {
                        o[i] = null;
                    }
                    remove = false;
                }
            }
            else {
                // only remove if selected?
                if (a[1] === true) {
                    remove = o[index].selected;
                }
                else {
                    remove = true;
                }
                if (remove) {
                    this.remove(index);
                }
            }
        });
        return this;
    };

    /**
 * Sort options (ascending or descending) in a select box (or series of select boxes)
 *
 * @name     sortOptions
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @type     jQuery
 * @param    Boolean ascending   (optional) Sort ascending (true/undefined), or descending (false)
 * @example  // ascending
 * $("#myselect").sortOptions(); // or $("#myselect").sortOptions(true);
 * @example  // descending
 * $("#myselect").sortOptions(false);
 *
 */
    $.fn.sortOptions = function (ascending) {
        // get selected values first
        var sel = $(this).selectedValues();
        var a = typeof(ascending) == "undefined" ? true : !!ascending;
        this.each(
        function () {
            if (this.nodeName.toLowerCase() != "select") {
                return;
            }
            // get options
            var o = this.options,
            // get number of options
            oL = o.length,
            // create an array for sorting
            sA = [];
            // loop through options, adding to sort array
            for (var i = 0; i < oL; i++) {
                sA[i] = {
                    v: o[i].value,
                    t: o[i].text
                };
            }
            // sort items in array
            sA.sort(
            function (o1, o2) {
                // option text is made lowercase for case insensitive sorting
                var o1t = o1.t.toLowerCase(),
                o2t = o2.t.toLowerCase();
                // if options are the same, no sorting is needed
                if (o1t == o2t) {
                    return 0;
                }
                if (a) {
                    return o1t < o2t ? -1 : 1;
                }
                else {
                    return o1t > o2t ? -1 : 1;
                }
            });
            // change the options to match the sort array
            for (var j = 0; j < oL; j++) {
                o[j].text = sA[j].t;
                o[j].value = sA[j].v;
            }
        }).selectOptions(sel, true); // select values, clearing existing ones
        return this;
    };
    /**
 * Selects an option by value
 *
 * @name     selectOptions
 * @author   Mathias Bank (http://www.mathias-bank.de), original function
 * @author   Sam Collett (http://www.texotela.co.uk), addition of regular expression matching
 * @type     jQuery
 * @param    String|RegExp|Array value  Which options should be selected
 * can be a string or regular expression, or an array of strings / regular expressions
 * @param    Boolean clear  Clear existing selected options, default false
 * @example  $("#myselect").selectOptions("val1"); // with the value 'val1'
 * @example  $("#myselect").selectOptions(["val1","val2","val3"]); // with the values 'val1' 'val2' 'val3'
 * @example  $("#myselect").selectOptions(/^val/i); // with the value starting with 'val', case insensitive
 *
 */
    $.fn.selectOptions = function (value, clear) {
        var v = value,
        vT = typeof(value);
        // handle arrays
        if (vT == "object" && v.constructor == Array) {
            var $this = this;
            $.each(v, function () {
                $this.selectOptions(this, clear);
            });
        }
        var c = clear || false;
        // has to be a string or regular expression (object in IE, function in Firefox)
        if (vT != "string" && vT != "function" && vT != "object") {
            return this;
        }
        this.each(
        function () {
            if (this.nodeName.toLowerCase() != "select") {
                return this;
            }
            // get options
            var o = this.options,
            // get number of options
            oL = o.length;
            for (var i = 0; i < oL; i++) {
                if (v.constructor == RegExp) {
                    if (o[i].value.match(v)) {
                        o[i].selected = true;
                    }
                    else if (c) {
                        o[i].selected = false;
                    }
                }
                else { if (o[i].value == v) {
                        o[i].selected = true;
                    }
                    else if (c) {
                        o[i].selected = false;
                    }
                }
            }
        });
        return this;
    };

    /**
 * Copy options to another select
 *
 * @name     copyOptions
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @type     jQuery
 * @param    String to  Element to copy to
 * @param    String which  (optional) Specifies which options should be copied - 'all' or 'selected'. Default is 'selected'
 * @example  $("#myselect").copyOptions("#myselect2"); // copy selected options from 'myselect' to 'myselect2'
 * @example  $("#myselect").copyOptions("#myselect2","selected"); // same as above
 * @example  $("#myselect").copyOptions("#myselect2","all"); // copy all options from 'myselect' to 'myselect2'
 *
 */
    $.fn.copyOptions = function (to, which) {
        var w = which || "selected";
        if ($(to).size() === 0) {
            return this;
        }
        this.each(
        function () {
            if (this.nodeName.toLowerCase() != "select") {
                return this;
            }
            // get options
            var o = this.options,
            // get number of options
            oL = o.length;
            for (var i = 0; i < oL; i++) {
                if (w == "all" || (w == "selected" && o[i].selected)) {
                    $(to).addOption(o[i].value, o[i].text);
                }
            }
        });
        return this;
    };

    /**
 * Checks if a select box has an option with the supplied value
 *
 * @name     containsOption
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @type     Boolean|jQuery
 * @param    String|RegExp value  Which value to check for. Can be a string or regular expression
 * @param    Function fn          (optional) Function to apply if an option with the given value is found.
 * Use this if you don't want to break the chaining
 * @example  if($("#myselect").containsOption("val1")) alert("Has an option with the value 'val1'");
 * @example  if($("#myselect").containsOption(/^val/i)) alert("Has an option with the value starting with 'val'");
 * @example  $("#myselect").containsOption("val1", copyoption).doSomethingElseWithSelect(); // calls copyoption (user defined function) for any options found, chain is continued
 *
 */
    $.fn.containsOption = function (value, fn) {
        var found = false,
        v = value,
        vT = typeof(v),
        fT = typeof(fn);
        // has to be a string or regular expression (object in IE, function in Firefox)
        if (vT != "string" && vT != "function" && vT != "object") {
            return fT == "function" ? this : found;
        }
        this.each(
        function () {
            if (this.nodeName.toLowerCase() != "select") {
                return this;
            }
            // option already found
            if (found && fT != "function") {
                return false;
            }
            // get options
            var o = this.options,
            // get number of options
            oL = o.length;
            for (var i = 0; i < oL; i++) {
                if (v.constructor == RegExp) {
                    if (o[i].value.match(v)) {
                        found = true;
                        if (fT == "function") {
                            fn.call(o[i], i);
                        }
                    }
                }
                else { if (o[i].value == v) {
                        found = true;
                        if (fT == "function") {
                            fn.call(o[i], i);
                        }
                    }
                }
            }
        });
        return fT == "function" ? this : found;
    };

    /**
 * Returns values which have been selected
 *
 * @name     selectedValues
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @type     Array
 * @example  $("#myselect").selectedValues();
 *
 */
    $.fn.selectedValues = function () {
        var v = [];
        this.selectedOptions().each(
        function () {
            v[v.length] = this.value;
        });
        return v;
    };

    /**
 * Returns text which has been selected
 *
 * @name     selectedTexts
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @type     Array
 * @example  $("#myselect").selectedTexts();
 *
 */
    $.fn.selectedTexts = function () {
        var t = [];
        this.selectedOptions().each(
        function () {
            t[t.length] = this.text;
        });
        return t;
    };

    /**
 * Returns options which have been selected
 *
 * @name     selectedOptions
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @type     jQuery
 * @example  $("#myselect").selectedOptions();
 *
 */
    $.fn.selectedOptions = function () {
        return this.find("option:selected");
    };

})(jQuery);
/* Copyright (c) 2008 Brandon Aaron (brandon.aaron@gmail.com || http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */

/**
 * Swaps out one element with another. It can take either a DOM element, 
 * a selector or a jQuery object. It only swaps the first matched element.
 */
jQuery.fn.swap = function(b) {
	b = jQuery(b)[0];
	var a = this[0],
	    a2 = a.cloneNode(true),
	    b2 = b.cloneNode(true),
	    stack = this;
	
	a.parentNode.replaceChild(b2, a);
	b.parentNode.replaceChild(a2, b);
	
	stack[0] = a2;
	return this.pushStack( stack );
};
/*jslint undef: true, browser: true*/
/*global jQuery, $, window*/

/**
 * TableDnD plug-in for JQuery, allows you to drag and drop table rows
 * You can set up various options to control how the system will work
 * Copyright (c) Denis Howlett <denish@isocra.com>
 * Licensed like jQuery, see http://docs.jquery.com/License.
 *
 * Configuration options:
 * 
 * onDragStyle
 *     This is the style that is assigned to the row during drag. There are limitations to the styles that can be
 *     associated with a row (such as you can't assign a border--well you can, but it won't be
 *     displayed). (So instead consider using onDragClass.) The CSS style to apply is specified as
 *     a map (as used in the jQuery css(...) function).
 * onDropStyle
 *     This is the style that is assigned to the row when it is dropped. As for onDragStyle, there are limitations
 *     to what you can do. Also this replaces the original style, so again consider using onDragClass which
 *     is simply added and then removed on drop.
 * onDragClass
 *     This class is added for the duration of the drag and then removed when the row is dropped. It is more
 *     flexible than using onDragStyle since it can be inherited by the row cells and other content. The default
 *     is class is tDnD_whileDrag. So to use the default, simply customise this CSS class in your
 *     stylesheet.
 * onDrop
 *     Pass a function that will be called when the row is dropped. The function takes 2 parameters: the table
 *     and the row that was dropped. You can work out the new order of the rows by using
 *     table.rows.
 * onDragStart
 *     Pass a function that will be called when the user starts dragging. The function takes 2 parameters: the
 *     table and the row which the user has started to drag.
 * onAllowDrop
 *     Pass a function that will be called as a row is over another row. If the function returns true, allow 
 *     dropping on that row, otherwise not. The function takes 2 parameters: the dragged row and the row under
 *     the cursor. It returns a boolean: true allows the drop, false doesn't allow it.
 * scrollAmount
 *     This is the number of pixels to scroll if the user moves the mouse cursor to the top or bottom of the
 *     window. The page should automatically scroll up or down as appropriate (tested in IE6, IE7, Safari, FF2,
 *     FF3 beta
 * dragHandle
 *     This is the name of a class that you assign to one or more cells in each row that is draggable. If you
 *     specify this class, then you are responsible for setting cursor: move in the CSS and only these cells
 *     will have the drag behaviour. If you do not specify a dragHandle, then you get the old behaviour where
 *     the whole row is draggable.
 * 
 * Other ways to control behaviour:
 *
 * Add class="nodrop" to any rows for which you don't want to allow dropping, and class="nodrag" to any rows
 * that you don't want to be draggable.
 *
 * Inside the onDrop method you can also call $.tableDnD.serialize() this returns a string of the form
 * <tableID>[]=<rowID1>&<tableID>[]=<rowID2> so that you can send this back to the server. The table must have
 * an ID as must all the rows.
 *
 * Other methods:
 *
 * $("...").tableDnDUpdate() 
 * Will update all the matching tables, that is it will reapply the mousedown method to the rows (or handle cells).
 * This is useful if you have updated the table rows using Ajax and you want to make the table draggable again.
 * The table maintains the original configuration (so you don't have to specify it again).
 *
 * $("...").tableDnDSerialize()
 * Will serialize and return the serialized string as above, but for each of the matching tables--so it can be
 * called from anywhere and isn't dependent on the currentTable being set up correctly before calling
 *
 * Known problems:
 * - Auto-scoll has some problems with IE7  (it scrolls even when it shouldn't), work-around: set scrollAmount to 0
 * 
 * Version 0.2: 2008-02-20 First public version
 * Version 0.3: 2008-02-07 Added onDragStart option
 *                         Made the scroll amount configurable (default is 5 as before)
 * Version 0.4: 2008-03-15 Changed the noDrag/noDrop attributes to nodrag/nodrop classes
 *                         Added onAllowDrop to control dropping
 *                         Fixed a bug which meant that you couldn't set the scroll amount in both directions
 *                         Added serialize method
 * Version 0.5: 2008-05-16 Changed so that if you specify a dragHandle class it doesn't make the whole row
 *                         draggable
 *                         Improved the serialize method to use a default (and settable) regular expression.
 *                         Added tableDnDupate() and tableDnDSerialize() to be called when you are outside the table
 */
jQuery.tableDnD = {
    /** Keep hold of the current table being dragged */
    currentTable: null,
    /** Keep hold of the current drag object if any */
    dragObject: null,
    /** The current mouse offset */
    mouseOffset: null,
    /** Remember the old value of Y so that we don't do too much processing */
    oldY: 0,

    /** Actually build the structure */
    build: function (options) {
        // Set up the defaults if any
        this.each(function () {
            // This is bound to each matching table, set up the defaults and override with user options
            this.tableDnDConfig = jQuery.extend({
                onDragStyle: null,
                onDropStyle: null,
                // Add in the default class for whileDragging
                onDragClass: "tDnD_whileDrag",
                onDrop: null,
                onDragStart: null,
                scrollAmount: 5,
                serializeRegexp: /[^\-]*$/,
                // The regular expression to use to trim row IDs
                serializeParamName: null,
                // If you want to specify another parameter name instead of the table ID
                dragHandle: null // If you give the name of a class here, then only Cells with this class will be draggable
            },
            options || {});
            // Now make the rows draggable
            jQuery.tableDnD.makeDraggable(this);
        });

        // Now we need to capture the mouse up and mouse move event
        // We can use bind so that we don't interfere with other event handlers
        jQuery(document).bind('mousemove', jQuery.tableDnD.mousemove).bind('mouseup', jQuery.tableDnD.mouseup);

        // Don't break the chain
        return this;
    },

    /** This function makes all the rows on the table draggable apart from those marked as "NoDrag" */
    makeDraggable: function (table) {
        var config = table.tableDnDConfig;
        if (table.tableDnDConfig.dragHandle) {
            // We only need to add the event to the specified cells
            var cells = jQuery("td." + table.tableDnDConfig.dragHandle, table);
            cells.each(function () {
                // The cell is bound to "this"
                jQuery(this).mousedown(function (ev) {
                    jQuery.tableDnD.dragObject = this.parentNode;
                    jQuery.tableDnD.currentTable = table;
                    jQuery.tableDnD.mouseOffset = jQuery.tableDnD.getMouseOffset(this, ev);
                    if (config.onDragStart) {
                        // Call the onDrop method if there is one
                        config.onDragStart(table, this);
                    }
                    return false;
                });
            });
        } else {
            // For backwards compatibility, we add the event to the whole row
            var rows = jQuery("tr", table); // get all the rows as a wrapped set
            rows.each(function () {
                // Iterate through each row, the row is bound to "this"
                var row = jQuery(this);
                if (!row.hasClass("nodrag")) {
                    row.mousedown(function (ev) {
                        if (ev.target.tagName == "TD") {
                            jQuery.tableDnD.dragObject = this;
                            jQuery.tableDnD.currentTable = table;
                            jQuery.tableDnD.mouseOffset = jQuery.tableDnD.getMouseOffset(this, ev);
                            if (config.onDragStart) {
                                // Call the onDrop method if there is one
                                config.onDragStart(table, this);
                            }
                            return false;
                        }
                    }).css("cursor", "move"); // Store the tableDnD object
                }
            });
        }
    },

    updateTables: function () {
        this.each(function () {
            // this is now bound to each matching table
            if (this.tableDnDConfig) {
                jQuery.tableDnD.makeDraggable(this);
            }
        });
    },

    /** Get the mouse coordinates from the event (allowing for browser differences) */
    mouseCoords: function (ev) {
        if (ev.pageX || ev.pageY) {
            return {
                x: ev.pageX,
                y: ev.pageY
            };
        }
        return {
            x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: ev.clientY + document.body.scrollTop - document.body.clientTop
        };
    },

    /** Given a target element and a mouse event, get the mouse offset from that element.
        To do this we need the element's position and the mouse position */
    getMouseOffset: function (target, ev) {
        ev = ev || window.event;

        var docPos = this.getPosition(target);
        var mousePos = this.mouseCoords(ev);
        return {
            x: mousePos.x - docPos.x,
            y: mousePos.y - docPos.y
        };
    },

    /** Get the position of an element by going up the DOM tree and adding up all the offsets */
    getPosition: function (e) {
        var left = 0;
        var top = 0;
        /** Safari fix -- thanks to Luis Chato for this! */
        if (e.offsetHeight === 0) {
            /** Safari 2 doesn't correctly grab the offsetTop of a table row
            this is detailed here:
            http://jacob.peargrove.com/blog/2006/technical/table-row-offsettop-bug-in-safari/
            the solution is likewise noted there, grab the offset of a table cell in the row - the firstChild.
            note that firefox will return a text node as a first child, so designing a more thorough
            solution may need to take that into account, for now this seems to work in firefox, safari, ie */
            e = e.firstChild; // a table cell
        }

        while (e.offsetParent) {
            left += e.offsetLeft;
            top += e.offsetTop;
            e = e.offsetParent;
        }

        left += e.offsetLeft;
        top += e.offsetTop;

        return {
            x: left,
            y: top
        };
    },

    mousemove: function (ev) {
        if (jQuery.tableDnD.dragObject === null) {
            return;
        }

        var dragObj = jQuery(jQuery.tableDnD.dragObject);
        var config = jQuery.tableDnD.currentTable.tableDnDConfig;
        var mousePos = jQuery.tableDnD.mouseCoords(ev);
        var y = mousePos.y - jQuery.tableDnD.mouseOffset.y;
        //auto scroll the window
        var yOffset = window.pageYOffset;
        if (document.all) {
            // Windows version
            //yOffset=document.body.scrollTop;
            if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
                yOffset = document.documentElement.scrollTop;
            }
            else if (typeof document.body != 'undefined') {
                yOffset = document.body.scrollTop;
            }

        }

        if (mousePos.y - yOffset < config.scrollAmount) {
            window.scrollBy(0, -config.scrollAmount);
        } else {
            var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
            if (windowHeight - (mousePos.y - yOffset) < config.scrollAmount) {
                window.scrollBy(0, config.scrollAmount);
            }
        }

        if (y != jQuery.tableDnD.oldY) {
            // work out if we're going up or down...
            var movingDown = y > jQuery.tableDnD.oldY;
            // update the old value
            jQuery.tableDnD.oldY = y;
            // update the style to show we're dragging
            if (config.onDragClass) {
                dragObj.addClass(config.onDragClass);
            } else {
                dragObj.css(config.onDragStyle);
            }
            // If we're over a row then move the dragged row to there so that the user sees the
            // effect dynamically
            var currentRow = jQuery.tableDnD.findDropTargetRow(dragObj, y);
            if (currentRow) {
                // TODO worry about what happens when there are multiple TBODIES
                if (movingDown && jQuery.tableDnD.dragObject != currentRow) {
                    currentRow.parentNode.insertBefore(jQuery.tableDnD.dragObject, currentRow.nextSibling);
                } else if (!movingDown && jQuery.tableDnD.dragObject != currentRow) {
                    currentRow.parentNode.insertBefore(jQuery.tableDnD.dragObject, currentRow);
                }
            }
        }

        return false;
    },

    /** We're only worried about the y position really, because we can only move rows up and down */
    findDropTargetRow: function (draggedRow, y) {
        var rows = jQuery.tableDnD.currentTable.rows;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowY = this.getPosition(row).y;
            var rowHeight = parseInt(row.offsetHeight, 10) / 2;
            if (row.offsetHeight === 0) {
                rowY = this.getPosition(row.firstChild).y;
                rowHeight = parseInt(row.firstChild.offsetHeight, 10) / 2;
            }
            // Because we always have to insert before, we need to offset the height a bit
            if ((y > rowY - rowHeight) && (y < (rowY + rowHeight))) {
                // that's the row we're over
                // If it's the same as the current row, ignore it
                if (row == draggedRow) {
                    return null;
                }
                var config = jQuery.tableDnD.currentTable.tableDnDConfig;
                if (config.onAllowDrop) {
                    if (config.onAllowDrop(draggedRow, row)) {
                        return row;
                    } else {
                        return null;
                    }
                } else {
                    // If a row has nodrop class, then don't allow dropping (inspired by John Tarr and Famic)
                    var nodrop = jQuery(row).hasClass("nodrop");
                    if (!nodrop) {
                        return row;
                    } else {
                        return null;
                    }
                }
                return row;
            }
        }
        return null;
    },

    mouseup: function (e) {
        if (jQuery.tableDnD.currentTable && jQuery.tableDnD.dragObject) {
            var droppedRow = jQuery.tableDnD.dragObject;
            var config = jQuery.tableDnD.currentTable.tableDnDConfig;
            // If we have a dragObject, then we need to release it,
            // The row will already have been moved to the right place so we just reset stuff
            if (config.onDragClass) {
                jQuery(droppedRow).removeClass(config.onDragClass);
            } else {
                jQuery(droppedRow).css(config.onDropStyle);
            }
            jQuery.tableDnD.dragObject = null;
            if (config.onDrop) {
                // Call the onDrop method if there is one
                config.onDrop(jQuery.tableDnD.currentTable, droppedRow);
            }
            jQuery.tableDnD.currentTable = null; // let go of the table too
        }
    },

    serialize: function () {
        if (jQuery.tableDnD.currentTable) {
            return jQuery.tableDnD.serializeTable(jQuery.tableDnD.currentTable);
        } else {
            return "Error: No Table id set, you need to set an id on your table and every row";
        }
    },

    serializeTable: function (table) {
        var result = "";
        var tableId = table.id;
        var rows = table.rows;
        for (var i = 0; i < rows.length; i++) {
            if (result.length > 0) {
                result += "&";
            }
            var rowId = rows[i].id;
            if (rowId && rowId && table.tableDnDConfig && table.tableDnDConfig.serializeRegexp) {
                rowId = rowId.match(table.tableDnDConfig.serializeRegexp)[0];
            }

            result += tableId + '[]=' + rowId;
        }
        return result;
    },

    serializeTables: function () {
        var result = "";
        this.each(function () {
            // this is now bound to each matching table
            result += jQuery.tableDnD.serializeTable(this);
        });
        return result;
    }

};

jQuery.fn.extend({
    tableDnD: jQuery.tableDnD.build,
    tableDnDUpdate: jQuery.tableDnD.updateTables,
    tableDnDSerialize: jQuery.tableDnD.serializeTables
});
/*
  @author: Brian Schweitzer (BrianFreud)
  @license: GPL v2.0 http://www.gnu.org/licenses/gpl-2.0.html
  @version: 0.1 beta
  
  Can extend String or be used stand alone - just change the flag at the top of the script.
*/
function convertToMarkup(processingString) {
    var i = 0,
        x = '',
        listDepth = 0,
        listType = [];
    function convertToMarkupCallback(str) {
        switch (str) {
        case '<p>':
        case '</p>':
        case '\n</p>':
        case '\n<p>':
            return '\n';
        case '<em>':
            return "''";
        case '\n<em>':
            return "\n''";
        case '\n</em>':
            return "\n''";
        case '</em>':
            return "''";
        case '<strong>':
            return "'''";
        case '\n<strong>':
            return "\n'''";
        case '\n</strong>':
            return "\n'''";
        case '</strong>':
            return "'''";
        case '\n<h1>':
            return "\n= ";
        case '</h1>':
            return " =";
        case '\n<h2>':
            return "\n== ";
        case '</h2>':
            return " ==";
        case '\n<h3>':
            return "\n=== ";
        case '</h3>':
            return " ===";
        case '\n<h4>':
            return "\n==== ";
        case '</h4>':
            return " ====";
        case '\n<h5>':
            return "\n===== ";
        case '</h5>':
            return " =====";
        case '\n<h6>':
            return "\n====== ";
        case '</h6>':
            return " ======";
        case '</a>':
        case '\n</a>':
            return "]";
        case '\n<hr>':
            return "\n----";
        case '<hr>':
            return "----\n";
        case '\n<ul>':
        case '<ul>':
            listDepth++;
            listType[listDepth] = "ul";
            return "";
        case '\n<ol>':
        case '<ol>':
            listDepth++;
            listType[listDepth] = "ol";
            return "";
        case '\n<br>':
            return "\n";
        case '\n</ol>':
        case '</ol>':
        case '\n</ul>':
        case '</ul>':
            listDepth--;
            return '';
        case '\n</li>':
        case '</li>':
            return "";
        case '<br>':
        case '<code>':
            return "";
        case '</pre>':
        case '</code>':
        case '\n</code>':
            return "\n";
        case '\n<li>':
        case '<li>':
            x = "";
            for (var i = 0; i < listDepth; i++) {
                x = x + "    ";
            }
            if (listType[listDepth] == "ol") {
                return '\n' + x + "a. ";
            } else {
                return '\n' + x + "* ";
            }
            break;
        case '\n<pre>':
            return "\n        ";
        default:
            x = "";
            if (str.slice(0, 4) == "\n<li" || str.slice(0, 4) == "<li ") {
                for (i = 0; i < listDepth; i++) {
                    x = x + "    ";
                }
                return '\n' + x + str.split('"')[1] + ". ";
            } else {
                return str;
            }
        }
    }
    function makeURL(str) {
        x = str.slice(1, str.length);
        return "\n[" + x + "|" + x + "]";
    }
    function clearRedundantLists(str) {
        switch (str) {
        case '</ol><ol>':
        case '</ol>\n<ol>':
            return '';
        case '</ul><ul>':
        case '</ul>\n<ul>':
            return '';
        case '</ul></li></ul>':
        case '</ul></li></ol>':
            return '</ul>';
        case '</ol></li></ol>':
        case '</ul></li></ol>':
            return '</ol>';
        default:
            return str;
        }
    }
    if (processingString.length > 0) {
        processingString = processingString.replace(/\[/g, "&#91;")
                                           .replace(/\]/g, "&#93;");
        x = processingString.split(/<a href=\"/);
        // Detect which type of anchor we have
        processingString = x[0];
        if (x.length > 1) {
            for (i = 1; i < x.length; i++) {
                x[i] = x[i].replace(/">/, "|");
                processingString = processingString + "[" + x[i];
            }
        }
        // Strip the first <p> without adding a newline
        processingString = processingString.replace('<p>', "")
        // Catch the 2 cases that can cause ''''''''
                                           .replace(/<\/strong><\/em><strong>/g, "''")
                                           .replace(/<\/em><\/strong><em>/g, "'''")
        // Keep spaces before lists
                                           .replace(/<\/p><.?l>/g, "\n<ol>")
                                           .replace(/<\/p><ul>/g, "\n<ul>")
        // Text::WikiFormat doesn't do block-level indents
                                           .replace(/\n */g, "\n")
        // Convert everything else
                                           .replace(/\n?<.*?>/g, convertToMarkupCallback)
        // Text::WikiFormat converts alt-255 into space
                                           .replace(/ /g, " ")
        // Linkify those naked urls Text::WikiFormat currently misses
                                           .replace(/\n\b((ftp|https?):\/\/\S*)/g, makeURL)
                                           .replace(/\n\n\n/g, '\n\n');
        // Strip whitespace off the end
        while (processingString.length > 0 && processingString.charAt(processingString.length - 1).match(/\s/)) {
            processingString = processingString.slice(0, processingString.length - 1);
        }
    }
    return processingString;
}
function convertToHTML(processingString) {
    var i = 0;
    var lastDepth = 0;
    var lasttype = "";
    var listTypes = [];
    var currentDepth = 0;
    var inList = false;
    function addPreAndLists(str, p1, p2) {
        var d = 0;
        // Fix where the user added an extra 1-3 spaces.
        // ----------------------------------------------------------------------------------
        // Normalizing levels here means the generated HTML will not
        // be 100% 1:1 with Text::WikiFormat-generated HTML.  However,
        // Text::WikiFormat adds meaningless </ul><ul> and </ol><ol> tags where
        // they have no semantic markup or HTML meaning; doing it this way
        // is ultimately less confusing for the user, by making depth errors in
        // nested lists much easier to spot - the depth difference between '3
        // spaces vs 4 spaces' is much more obvious when rerendered in
        // markup as '0 spaces vs 4 spaces'.
        // ----------------------------------------------------------------------------------
        while ((str.length - 4) % 4 > 0) {
            str = str.slice(1, str.length);
        }
        // ----------------------------------------------------------------------------------
        // Pre + Code, can only happen at 8 spaces in
        if (str.match(/\s{8}[^   ..|\* ..|\d\d?\. ?.]/) !== null) {
            str = '<pre><code>' + str.slice(str.length - 4, str.length);
            return str;
        }
        // ----------------------------------------------------------------------------------
        // Now it can only be *, #., or ##. where # can be a number or letter
        // If it's *, it's an UL.  Otherwise it's an OL.
        currentDepth = str.split('    ').length - 1;
        var y = "";
        if (str.split('    ')[currentDepth].slice(0, 1)) {
            if (currentDepth == lastDepth) {
                if (lasttype == 'ol') { y = '</ol><ul>'; }
                else if (lasttype === '') { y = '<ul>'; }
            } else if (currentDepth > lastDepth) {
                y = '<ul>';
                listTypes[listTypes.length] = 'ul>';
                lastDepth = currentDepth;
            } else if (currentDepth < lastDepth) {
                for (d = lastDepth; d > currentDepth; d--) {
                    y = y + '</' + listTypes.pop();
                }
            }
            y = y + '<li>' + str.slice(str.length - 2);
            lasttype = 'ul';
        } else {
            if (currentDepth == lastDepth) {
                if (lasttype == 'ul') { y = '</ul><ol>'; }
                else if (lasttype === '') { y = '<ol>'; }
            } else if (currentDepth > lastDepth) {
                listTypes[listTypes.length] = 'ol>';
                y = '<ol>';
                lastDepth = currentDepth;
            } else if (currentDepth < lastDepth) {
                for (d = lastDepth; d > currentDepth; d--) {
                    y = y + '</' + listTypes.pop();
                }
            }
            var z = str.slice(str.length - 3).split(' ')[1];
            if (typeof(z) == "undefined") { z = ""; }
            y = y + '<li>' + z;
            lasttype = 'ol';
        }
        return y;
    }
    function convertToHTMLHeadersCallback(str) {
        function selector(inputStr) {
            switch (inputStr) {
            case '\n=':
            case '<p>=':
            case '=</p>':
            case '=':
                return 'h1>';
            case '\n==':
            case '<p>==':
            case '==</p>':
            case '==':
                return 'h2>';
            case '\n===':
            case '<p>===':
            case '===</p>':
            case '===':
                return 'h3>';
            case '\n====':
            case '<p>====':
            case '====</p>':
            case '====':
                return 'h4>';
            case '\n=====':
            case '<p>=====':
            case '=====</p>':
            case '=====':
                return 'h5>';
            case '\n======':
            case '<p>======':
            case '======</p>':
            case '======':
                return 'h6>';
            }
        }
        var x = str.split(' ');
        x[0] = '<' + selector(x[0]);
        x[(x.length - 1)] = '</' + selector(x[(x.length - 1)]);
        str = x.join("");
        return str;
    }
    function fixLists(str) {
        var x = str.slice(0, 7);
        var y = str.slice(7, str.length - 4);
        y = y.replace(/></g, '>\n<');
        switch (x) {
        case '<p><ul>':
            x = '<ul>\n';
            break;
        case '<p><ol>':
            x = '<ol>\n';
            break;
        case '</ol><p>':
            x = '</ol>';
            break;
        case '</ul><p>':
            x = '</ul>';
            break;
        }
        x = x + y;
        return x;
    }
    function fixHeaders(str) {
        return str + '\n';
    }
    function fixEndOfLists(str) {
        var v = str.slice(0, 5);
        v = v + '\n<p>';
        var w = str.slice(5, str.length - 6);
        var y = str.slice(str.length - 1);
        if (y == '\n') {
            // Only happens if we have a list, then a single text block, then a new list
            str = v + w + '</p>' + y;
        } else {
            str = v + w + '<br>' + y;
        }
        return str;
    }
    function fixBreakType(str) {
        return '\n<p>' + str.slice(5, str.length);
    }
    function fixBr(str) {
        return str.slice(0, 1) + '<br>\n';
    }
    function fixPostHrBreak(str) {
        return '<hr>\n<p>' + str.slice(9, str.length - 4) + '</p>';
    }
    function lastFix(str) {
        return '</p>' + str.slice(8, str.length);
    }
    function ILied(str) {
        switch (str) {
        case '<li>\n':
            return '<li>';
        case '<p>\n':
            return '<p>';
        }
    }
    function preCorrectLists(str) {
        return str.slice(0, 1) + '\n<li';
    }
    if (processingString.length > 0) {
        processingString = processingString.replace(/.<li/g, preCorrectLists);
        var zzz = processingString.split('\n');
        processingString = "";
        for (i = 0; i < zzz.length; i++) {
            if (zzz[i].split(/\s{4}\s*..../).length == 1) {
                // close lists
                if (inList === true) {
                    for (var d = listTypes.length; d > 0; d--) {
                        if (d == 1) { zzz[i] = '</' + listTypes.shift() + '\n\n' + zzz[i]; }
                        else { zzz[i] = '</' + listTypes.shift() + zzz[i]; }
                    }
                    lastDepth = 0;
                }
            } else {
                zzz[i] = zzz[i].replace(/\s{4}\s*..../g, addPreAndLists);
                inList = true;
            }
            switch (zzz[i].slice(0, 4)) {
            case '<pre':
                zzz[i] = '\n' + zzz[i] + '</code></pre>';
                break;
            case '<li>':
            case '<ol>':
            case '<ul>':
                // Including the next two adds an incorrect </li>, but it blocks paragraphizing of the
                // last <li> and the line following the closing tag of a list.
            case '</ol':
            case '</ul':
            case '<li ':
                zzz[i] = zzz[i] + '</li>';
                break;
            default:
            }
            // Take care of non-<p> line breaks
            if (i < zzz.length - 1 && zzz[i].match(/^[\w|"|']/) !== null && zzz[i].match(/^[\w|"|']/) !== null && zzz[i].length > 0 && zzz[i + 1].length > 0) { processingString = processingString + zzz[i] + '<br>'; }
            else if (i < zzz.length - 1 && zzz[i].match(/>$/) !== null && zzz[i].match(/^</) !== null) { processingString = processingString + zzz[i]; }
            else if (zzz[i].match(/-{4}/) !== null) { processingString = processingString + '<hr>'; }
            else { processingString = processingString + zzz[i] + '\n'; }
        }
        processingString = processingString.replace(/\n\n/g, "</p>\n<p>");
        processingString = processingString.replace(/\n/g, "<br>");
        // Add the surrounding <p>
        processingString = '<p>' + processingString + '</p>';
        // Link both types of anchors
        var x = processingString.split(/\[/);
        if (x.length > 1) {
            processingString = x[0];
            for (i = 1; i < x.length; i++) {
                if (x[i].indexOf('|') > -1) {
                    var y = x[i].split(/\|/);
                    x[i] = '<a href="' + y[0] + '">' + y[1].replace(/\]/, '</a>');
                } else {
                    x[i] = '<a href="' + x[i] + '">' + x[i] + '</a>';
                }
                processingString = processingString + x[i];
            }
        }
        // Distinguish and convert '' and '''
        var bold = false;
        var italics = false;
        // Using the <X> later to clear unwanted linebreaks
        for (i = 0; i < processingString.length; i++) {
            if (processingString.charAt(i) == "'") {
                if (processingString.charAt(i + 1) == "'") {
                    if (processingString.charAt(i + 2) == "'") {
                        if (bold === false) {
                            processingString = processingString.slice(0, i) + '<strong><X>' + processingString.slice((i + 3));
                            i += 3;
                            bold = true;
                        } else {
                            processingString = processingString.slice(0, i) + '</strong><X>' + processingString.slice((i + 3));
                            i += 3;
                            bold = false;
                        }
                    } else {
                        if (italics === false) {
                            processingString = processingString.slice(0, i) + '<em><X>' + processingString.slice((i + 2));
                            i += 2;
                            italics = true;
                        } else {
                            processingString = processingString.slice(0, i) + '</em><X>' + processingString.slice((i + 2));
                            i += 2;
                            italics = false;
                        }
                    }
                }
            }
        }
        // Strip whitespace off the end of the string
        while (processingString.length > 0 && processingString.charAt(processingString.length - 1).match(/\s/)) {
            processingString = processingString.slice(0, processingString.length - 1);
        }
        // Scrub the results so they match the HTML shortcuts and line-breaks Text::WikiFormat uses
        // ----------------------------------------------------------------------------------------------------------------
        processingString = processingString.replace(/<p><\/p>\n<p>/g, '<p>')
                                           .replace(/<\/h\d>/g, fixHeaders)
                                           .replace(/.<br>/g, fixBr)
        // Cheaper to use <X> here than loop on <strong> and <em>
                                           .replace(/\n?<X>\n?/g, '')
                                           .replace(/\n<ol>/g, '<ol>')
                                           .replace(/\n<ul>/g, '<ul>')
                                           .replace(/<\/p>\n?<br>/g, '</p>')
                                           .replace(/<p>\n<hr>/g, '<hr>')
                                           .replace(/\n<br>.*<\/p>/g, fixBreakType)
                                           .replace(/\n<br>/g, '<br>\n')
                                           .replace(/<hr><br>\n.*<br>/g, fixPostHrBreak)
                                           .replace(/<br>\n\n/g, '<br>\n')
                                           .replace(/<\/p>\n<p><(o|u)l>\n<li>/g, lastFix)
                                           .replace(/<(li|p)>\n/g, ILied)
                                           .replace(/<\/p>\n\n/g, '</p>\n')
                                           .slice(0, processingString.length - 5)
        // code blocks tend to grow tags
                                           .replace(/\n?<p>\n?<br>\n?<pre>\n?/g, '\n<pre>')
                                           .replace(/\n?<\/pre>\n?<br>\n?<\/ol>\n?(<\/li>)?\n?/g, '</pre>\n')
                                           .replace(/<\/pre>\n<br>/g, '</pre>')
                                           .replace(/\=<br>/g, '=\n')
                                           .replace(/<p>=/g, '=')
                                           .replace(/\=<\/p>/g, '=')
                                           .replace(/(<p>={1,6}\s.+=\s{1,6}<\/p>)|(^={1,6}\s.+\s={1,6}$)/gm, convertToHTMLHeadersCallback)
        // Next two lines prevent lists from collapsing over multiple conversions
                                           .replace(/<\/p><ul>/g, '<\/p>\n<ul>')
                                           .replace(/<\/p><ol>/g, '<\/p>\n<ol>');
    }
    return processingString;
}
