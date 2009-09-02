/** @author Ben Alman
 * http://benalman.com/projects/jquery-unwrap-plugin/
 */

jQuery.fn.unwrap = function () {
    this.parent(':not(body)')
        .each(function () {
            $(this).replaceWith(this.childNodes);
        });
    return this;
};
