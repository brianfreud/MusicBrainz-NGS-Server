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
