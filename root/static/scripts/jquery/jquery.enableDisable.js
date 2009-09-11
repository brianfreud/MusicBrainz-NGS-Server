/**
 * @fileOverview jQuery extentions for enabling and disabling DOM Form elements.
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 **/

/**
 * Sets the disabled attribute on the current selection set.
 **/
jQuery.fn.disable = function () {
    return $(this).attr('disabled', 'disabled');
};
/**
 * Sets the readonly attribute on the current selection set.
 **/
jQuery.fn.readonly = function () {
    return $(this).attr('readonly', 'readonly');
};
/**
 * Clears the disabled and readonly attributes on the current selection set.
 **/
jQuery.fn.enable = function () {
    return $(this).removeAttr('disabled').removeAttr('readonly');
};
