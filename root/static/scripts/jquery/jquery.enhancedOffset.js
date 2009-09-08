/**
 * Enhanced .offset()
 * Abstracts offset().right and offset().bottom into a built-in getter, and adds .offset(top, left) as a setter.
 *
 * @version 1.0
 * @example $('#tester').offset().bottom
 * @example $('#tester').offset().right
 * @example $('#tester').offset(10, 20);
 * @example $('#tester').offset({ top: 10, left: 20 });
 * @example $('#tester').offset(10, 20, 'fast');
 * @example $('#tester').offset('+=10', '+=20');
 * @example $('#tester').offset('+=5', '-=30');
 * @author Brian Schweitzer (BrianFreud)
 * @author Charles Phillips, first half of the return conditional ( http://groups.google.com/group/jquery-dev/browse_thread/thread/10fa400d3f9d9521/ )
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
        return (a.length) ? this.animate({
                                         top  : a[0].top  || a[0],
                                         left : a[0].left || a[1]
                                         }, (a[0].top ? a[1] : a[2]) || 1)
                          : $.extend(offset, {
                                             bottom: bottom,
                                             right: right
                                             });
    };
})(jQuery);
