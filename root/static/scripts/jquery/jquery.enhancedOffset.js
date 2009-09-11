/**
 * Enhanced .offset()
 * Abstracts offset().right and offset().bottom into a built-in getter and adds .offset(top, left) as a setter.
 *
 * @version 1.0
 * @example $('#foo').offset().bottom
 * @example $('#foo').offset().right
 * @example $('#foo').offset(10, 20);
 * @example $('#foo').offset({ top: 10, left: 20 });
 * @author Brian Schweitzer (BrianFreud)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function($) {
    var offsetMethod = $.fn.offset;
    $.fn.offset = function () {
        var offset = offsetMethod.call(this),
            bottom = offset.top + this.outerHeight() - 1,
            right = offset.left + this.outerWidth() - 1,
            a = arguments;
        return (a.length) ? this.css({
                                     top  : a[0].top  || a[0],
                                     left : a[0].left || a[1]
                                     })
                          : $.extend(offset, {
                                             bottom: bottom,
                                             right: right
                                             });
    };
})(jQuery);
