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

'use strict';

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
            elementValue = options.createOverlayText ? options.createOverlayText($element) || textForUnknown : '';
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
            $('#temp_wrapper > *:first').unwrap(); // Remove the protective wrapper.
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
     * Creates and attaches a lookup popup instance; will remove any existing lookup instance unless it would be removing the same one it would be creating.
     *
     * @param {Object} $self The jQuery-wrapped input element to attach the lookup to.
     **/
    addLookup: function ($self) {
        var hidden = 'hidden',
            inputOffset = $self.offset(),
            $oldLookup = $self.data('lookup'),
            oldLookupPopup = $('#lookupPopup_parent'),
            oldStaticDivs,
            oldData;
        if (typeof $oldLookup === 'undefined') { // Don't create more than one lookup at a time for the same input.
            oldData = $('#lookup').data('lookup'); // Only present if an old lookup actually ran a search.
            if (typeof oldData !== 'undefined') {
                oldData.$input.removeData('lookup'); // Clear the old lookup's data from the input.
            }
            if (oldLookupPopup.length > 0) {
                /* None of the next 6 lines is required.  However, they save a lot of wasted time in the following .remove(),
                   where it is  doing recursive checks for non-existant events and jQuery data in static DOM nodes - approx
                   160 ms.  This makes switching lookup popups much more responsive. */
                oldStaticDivs = oldLookupPopup[0].getElementsByTagName('div');
                oldLookupPopup[0].appendChild(document.getElementById('btnSearch'));
                oldStaticDivs[16].removeChild(oldStaticDivs[17]); // The hasAC checkbox div
                oldStaticDivs[7].removeChild(oldStaticDivs[14]); // The results info div
                oldStaticDivs[7].removeChild(oldStaticDivs[8]); // The current status div
                oldLookupPopup[0].removeChild(oldStaticDivs[0]); // The shadow
                /* End non-required code. */
                oldLookupPopup.remove(); // Get rid of the old lookup.
            }
            $(MusicBrainz.cache.html.popups.lookup).insertAfter($self) // Add the new lookup.
                                                   .offset(inputOffset.bottom, inputOffset.left + 1, 0); // Position it flush to the input.
        } else {
            $oldLookup.$divs.filter(':not(#status)')
                            .addClass(hidden) // Hide any existing lookup results or status messages.
                            .filter('.search:first').removeClass(hidden); // Re-show the search button.
        }
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
                return $element.attr('checked');
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
     * Handles an entity lookup.
     **/
    doLookup: function () {
        var hidden = 'hidden',
            artist = 'artist',
            label = 'label',
            mbLookup = MusicBrainz.cache.lookup,
            mbUtility = MusicBrainz.utility,
            $self,
            $selfParent,
            $selfGrandParent,
            lookup,
            lookupType,
            searchStr,
            show = function ($ele) {
                $ele.removeClass(hidden);
            },
            hide =  function ($ele) {
                $ele.addClass(hidden);
            };
        try {
            try {
                $self = $('#lookup');
                $selfParent = $self.parent();
                $selfGrandParent = $selfParent.parent();
                lookup = {
                         $divs            : $self.find('div'),
                         $input           : $selfGrandParent.prev(),
                         $self            : $self,
                         $popupContents   : $selfParent,
                         $popupContainer  : $selfGrandParent
                };
                searchStr = lookup.searchStr = mbUtility.getValue(lookup.$input);
            } catch (e) {
                mbUtility.showError('Lookup called on a non-existant input field.');
                throw 0; // Occurs if the input is removed without also removing any associated lookup popups.
            } finally {
                hide($self.find('.search:first')); // Hide the search button.
                lookup.$input.data('lookup', lookup); // Store lookup data on the associated input element.
                $self.data('lookup', lookup); // Store lookup data on the lookup itself.
                lookupType = lookup.$input.data('lookupType'); // Allow overriding the lookup type by pre-setting a .data() value on the input.
                if (typeof lookupType !== 'undefined') {
                    lookup.lookupType = lookupType;
                } else if (lookup.$input.hasClass(artist)) {
                    lookup.lookupType = artist;
                } else if (lookup.$input.hasClass(label)) {
                    lookup.lookupType = label;
                } else {
                    throw 2;
                }
            }
            if (!searchStr) {
                throw 1; // The input is empty, so there's nothing to search for.
            } else { // We're ready to search.
                show($self.find('.search:last')); // Status: searching
                $.ajax({
                       /* defaults:
                       async    : false,
                       cache    : true,
                       type     : 'GET',
                       */
                       data     : [mbLookup.type + lookup.lookupType, mbLookup.limit, mbLookup.query + window.escape(searchStr)].join('&'),
                       dataType : 'json',
                       timeout  : 5000,
                       url      : mbLookup.server,
                       error    : function (/* request, errorType, errorThrown */) {
                                      $('#lookup').find('.error:first')
                                                  .removeClass(hidden); // Status: generic error
                                  },
                       success  : function (data) {
                                      console.log(data);


                                  },
                       complete : function () {
                                      $('#lookup').find('.search:last')
                                                  .addClass(hidden); // Hide 'Searching...'.
                                  }
                       });
            }
        } catch (f) {
            switch (f) {
                case 1: show($('#noInput')); break; // Status: nothing to look up
                case 0: show($self.filter('.error:first')); break; // Status: generic error
                case 2: mbUtility.showError('Lookup called on an unsupported entity type.'); break;
                default: throw f;
            }
        }
    },
    /**
     * Generic HTML string
     *
     * @memberOf MusicBrainz.utility
     * @namespace
     */
    makeHTML: {
        /**
         * @description Creates the HTML string for a lookup popup.
         **/
        lookup: function () {
            var bold = 'bold',
                div = 'div',
                hidden = 'hidden',
                results = 'results',
                mbImages = MusicBrainz.cache.images,
                unTrim = MusicBrainz.utility.unTrim,
                text = MusicBrainz.text,
                textGenericError = text.Error,
                objGenericError = { alt: textGenericError, src: mbImages.warning },
                lookupHTML = MusicBrainz.html()
                                              .div({ id: 'lookup' })
                                                  .div({ cl: 'center', id: 'status' })
                                                      .div({ cl: 'search' })
                                                           .button({ id: 'btnSearch', ti: -1, val: text.Search })
                                                      .close(div)
                                                      .div({ cl: 'error ' + hidden })
                                                          .img(objGenericError)
                                                          .span({ cl: 'bold', val: textGenericError })
                                                      .close(div)
                                                      .div({ id: 'noInput', cl: 'error ' + hidden })
                                                          .img(objGenericError)
                                                          .span({ cl: 'bold', val: text.NothingToLookUp })
                                                      .close(div)
                                                      .div({ id: 'noResults', cl: bold + ' ' + hidden })
                                                          .img(objGenericError)
                                                          .span({ cl: 'bold', val: text.NoResultsFound })
                                                      .close(div)
                                                      .div({ cl: hidden + ' search ' + bold })
                                                          .img({ alt: text.Searching, src: mbImages.working })
                                                          .span({ cl: 'bold', val: text.Searching })
                                                      .close(div)
                                                  .close(div)
                                                  .div({ id: 'info', cl: hidden })
                                                      .span(unTrim(text.Results))
                                                      .span({ id: 'matches', cl: bold })
                                                      .text(',' + unTrim(text.MatchesFound))
                                                      .span({ id: 'loaded', cl: bold })
                                                      .text(',' + unTrim(text.Loaded))
                                                      .span({ id: results + 'Start' })
                                                      .text(unTrim('&ndash;'))
                                                      .span({ id: results + 'End' })
                                                  .close(div)
                                                  .div({ id: results, cl: hidden }).text(' ').close(div)
                                                  .div({ id: 'BottomControls', cl: hidden })
                                                      .div({ css: 'float:left;', cl: hidden })
                                                          .input({ id: 'hasAC', ti: -1, type: 'checkbox' })
                                                          .label({ 'for': 'hasAC', val: unTrim(text.HasNameVariation) })
                                                      .close(div)
                                                      .div({ css: 'float:right;' })
                                                          .button({ id: 'btnAddNew', ti: -1 })
                                                      .close(div)
                                                      .div({ id: 'addNewEntity', cl: hidden }).text(' ').close(div)
                                                  .close(div)
                                              .close(div)
                                              .end();
            lookupHTML = $(MusicBrainz.utility.makeHTML.popup('lookupPopup')).find('.popupContents')
                                                                             .append(lookupHTML)
                                                                             .end()
                                                                             .outerHTML();
            MusicBrainz.cache.html.popups.lookup = lookupHTML;
        },
        /**
         * @description Creates the HTML string for a popup window.
         *
         * @param {String} contentsID The ID to assign to the contents div within the window.
         **/
        popup: function (contentsID) {
            var popupHTML = MusicBrainz.html().div({
                                                   cl: 'popup',
                                                   id: contentsID + '_parent'
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
            var shadow = '',
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
    /* Initialize static HTML strings generated from per-session dynamic strings. */
    MusicBrainz.utility.makeHTML.shadow();
    MusicBrainz.utility.makeHTML.lookup();
});

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
