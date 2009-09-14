/**
 * @fileOverview Enhanced .offset() and .position();
 * Abstracts offset().right and offset().bottom into built-in getters.
 * Adds setter capabilities to position().
 *
 * @version 1.0
 * @author Brian Schweitzer (BrianFreud)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

/** @private */
(function($) {

    /** @ignore */
    var offsetMethod = $.fn.offset;

    /**
     * @name jQuery.fn.offset
     * @function
     * @example $('#foo').offset().bottom
     * @example $('#foo').offset().right
     */
    $.fn.offset = function () {
        var offset = offsetMethod.call(this),
            bottom = offset.top + this.outerHeight() - 1,
            right = offset.left + this.outerWidth() - 1;
        return $.extend(offset, {
                                bottom: bottom,
                                right: right
                                });
    };

    /** @ignore */
    var positionMethod = $.fn.position;

    /**
     * @name jQuery.fn.position
     * @function
     * @example $('#foo').position(10, 20);
     * @example $('#foo').position({ top: 10, left: 20 });
     */
    $.fn.position = function () {
        var position = positionMethod.call(this),
            a = arguments;
        return (a.length) ? this.css({
                                     top  : a[0].top  || a[0],
                                     left : a[0].left || a[1]
                                     })
                          : position;
    };


})(jQuery);
