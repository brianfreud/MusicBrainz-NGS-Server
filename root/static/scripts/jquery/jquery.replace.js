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
