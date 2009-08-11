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
