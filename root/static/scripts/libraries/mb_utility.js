/*jslint undef: true, browser: true*/
/*global jQuery, $, MusicBrainz, window */

/**
 * @fileOverview This file contains all utility functions used in MusicBrainz javascript code.
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 * @requires html_factory.js
 * @requires jquery.js
 * @requires jquery.selectboxes.js
 * @requires jquery.unwrap.js
 * @requires text_strings.js
 */

"use strict";

/**
 * Generic utility functions.
 *
 * @memberOf MusicBrainz
 * @namespace
 */
MusicBrainz.utility = {
    /**
     * Creates a text overlay over an element, using the plaintext value of the original element as the text source.
     * 
     * @param {Object} $element A single jQuery-wrapped element over which to place an overlay.
     * @param {Function} [options.createOverlayText] A callback to create custom plaintext strings for use as the overlay text; if $element is not
     *        an &lt;input&gt; or a &lt;select&gt; and stringFormatter is omitted, an empty string will be returned.
     * @param {String} [options.textForUnknown] The text to use for overlaying fields which currently have no defined value; default text is stored in MusicBrainz.text.Unknown.
     * @param {String} [options.wrapper] Type of element to use to enclose the overlay; by default, $element's enclosing element type will be used.
     * @see <a href="#addOverlayThis"/>
     **/
    addOverlay: function ($element, options) {
        options = options ? options : {};
        var $elementToOverlay = $element,
            elementValue,
            textForUnknown = options.textForUnknown ? '[ ' + options.textForUnknown + ' ]' : MusicBrainz.text.UnknownPlaceholder,
            parentWrapped = false,
            $thisParent = $element.parent() || $element,
            wrapper;
        if ($element.is('button, input, select, textarea')) {
            elementValue = MusicBrainz.utility.getValue($element).toString();
            elementValue = elementValue !== '' ? elementValue : textForUnknown;
            $elementToOverlay = $thisParent;
        } else {
            elementValue = options.createOverlayText ? options.createOverlayText($element) || textForUnknown : "";
        }
        wrapper = options.wrapper || $elementToOverlay[0].tagName.toLowerCase();
        if (!$elementToOverlay.parent().length) { // .after() uses .parentNode.  This breaks in a shallow document fragment, so
            $thisParent.wrap('<div id="temp_wrapper"></div>'); // wrap $thisParent to ensure that it has a valid parentNode.
            parentWrapped = true;
        }
        MusicBrainz.html()
                   .use(wrapper, { cl: 'editable' })
                   .text(elementValue)
                   .close(wrapper)
                   .after($elementToOverlay);
        if (parentWrapped) {
            $("#temp_wrapper > *:first").unwrap(); // Remove the protective wrapper.
        }
        return $element;
    },
    /**
     * Interface wrapper for addOverlay; "this" is implicitly used as the target element, rather than (as in addOverlay) explicitly defined in $element.
     * 
     * @param {Object} [$eleInt] This variable is ignored.
     * @param {Object} [options] See <a href="#addOverlay"/>
     * @see <a href="#addOverlay"/>
     **/
    addOverlayThis: function ($eleInt, options) {
        return MusicBrainz.utility.addOverlay($(this), options || {});
    },
    /**
     * Returns a plaintext string based on the deliniated value(s) of text input(s) within a parent element.
     * 
     * @param {Object} $inputs A single jQuery-wrapped parent element containing child inputs of type text.
     * @param {String} [joinSeparator] The separator to use between the values of each input; default is '&nbsp;&ndash;&nbsp;'.
     **/
    getChildValues: function ($inputs, joinSeparator) {
        return $('input[type=text][value!=""]', $inputs).map(function () {
                                                                 return this.value;
                                                        })
                                                       .get()
                                                       .join(typeof joinSeparator === 'undefined' ? '&nbsp;&ndash;&nbsp;' : joinSeparator);
    },
    /**
     * Returns the plaintext value of an element; if $element is not an &lt;input&gt; of type text, or a &lt;select&gt;, an empty string will be returned.
     * 
     * @param {Object} $element A single jQuery-wrapped element for which to return the plaintext value.
     **/
    getValue: function ($element) {
        if ($element.is('select')) {
            return $element.selectedTexts()[0];
        } else if ($element.is('input')) {
            if ($element.is('[type=radio],[type=checkbox]')) {
                return $element.attr("checked");
            } else {
                return $element.val();
            }
        } else if ($element.is('textarea')) {
            return $element.html();
        } else if ($element.is('button')) {
            return $element.val();
        }
        return '';
    },
    /**
     * Generic HTML string 
     *
     * @memberOf MusicBrainz.utility
     * @namespace
     */
    makeHTML: {
        /**
         * @description Creates the HTML string for a popup window
         * 
         * @param {String} contentsID The ID to assign to the contents div within the window.
         **/
        popup: function (contentsID) {
            var popupHTML;
            popupHTML = MusicBrainz.html().div({
                                               cl: 'popup'
                                               })
                                              .addHTML(MusicBrainz.cache.html.shadow)
                                              .div({
                                                   cl: 'popupContents',
                                                   id: contentsID
                                                   })
                                              .close('div')
                                          .close('div')
                                          .end();
            return popupHTML;
        },
        /**
         * @description Creates the HTML string for a div shadow.
         * 
         * @param {String} [color] The css color to use for the shadow; defaults to #000.
         **/
        shadow: function (color) {
            var shadow = "",
                shadowCt = 6,
                bgColor = 'background-color:' + (color || '#000') + ';';
            do {
                shadow = MusicBrainz.html()
                                    .div({ cl: 'shadow', css: bgColor })
                                        .addHTML(shadow)
                                    .close('div')
                                    .end();
            } while (--shadowCt);
            MusicBrainz.cache.html.shadow = shadow;
        }
    },
    /**
     * @description Logs a message to the FireBug or FireBug Lite console, if present, otherwise it alerts it.
     * 
     * @param {String} error The message to be passed.
     **/
    showError: function (error) {
        (window.console ? console.debug : window.alert)(error);
    },
    /**
     * @description Adds a space to either end of a string.
     * 
     * @param {String} str The string to be padded.
     **/
    unTrim: function (str) {
        return ' ' + str + ' ';
    }
};

/**
 * @description Initialize statics set on page-load.
 */
$(function ($) {
    /* Define MusicBrainz.cache.html.shadow */
    MusicBrainz.utility.makeHTML.shadow();
});

/**
 * Sets the disabled attribute on the current selection set.
 **/
jQuery.fn.disable = function () {
    return $(this).attr("disabled", "disabled");
};
/**
 * Sets the readonly attribute on the current selection set.
 **/
jQuery.fn.readonly = function () {
    return $(this).attr("readonly", "readonly");
};
/**
 * Clears the disabled and readonly attributes on the current selection set.
 **/
jQuery.fn.enable = function () {
    return $(this).removeAttr("disabled").removeAttr("readonly");
};
