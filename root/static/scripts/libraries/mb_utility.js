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
            textForUnknown    = options.textForUnknown ? '[ ' + options.textForUnknown + ' ]' : MusicBrainz.text.UnknownPlaceholder,
            parentWrapped     = false,
            $thisParent       = $element.parent() || $element,
            elementValue,
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
     * @param {Object} entityType The type of entity to look up.
     **/
    addLookup: function ($self, entityType) {
        var hidden         = 'hidden',
            inputOffset    = $self.offset(),
            $oldLookup     = $self.data('lookup');
        if (typeof $oldLookup === 'undefined') { // Don't create more than one lookup at a time for the same input.
            MusicBrainz.utility.removeLookups();
            entityType = entityType === 'artist' ? entityType : 'generic';
            $(MusicBrainz.cache.html.popups.lookup[entityType]).insertAfter($self) // Add the new lookup.
                                                               .offset(inputOffset.bottom, inputOffset.left + 1, 0); // Position it flush to the input.
        } else {
            $oldLookup.$divs.filter(':not(#status)').addClass(hidden) // Hide any existing lookup results or status messages.
                            .end()
                            .filter('.search:first').removeClass(hidden) // Re-show the search button.
                            .end()
                            .filter('#results').empty(); // Remove any old results
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
        var artist    = 'artist',
            hidden    = 'hidden',
            label     = 'label',
            mbLookup  = MusicBrainz.cache.lookup,
            mbUtility = MusicBrainz.utility,
            $self,
            $selfParent,
            $selfGrandParent,
            lookup,
            type,
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
                type = lookup.$input.data('lookupType'); // Allow presetting the lookup type by setting a jQuery data value on the input.
                if (typeof type !== 'undefined') {
                    lookup.lookupType = type;
                } else if (lookup.$input.hasClass(artist)) {
                    lookup.type = artist;
                } else if (lookup.$input.hasClass(label)) {
                    lookup.type = label;
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
                       data     : [mbLookup.type + type, mbLookup.limit, mbLookup.query + window.escape(searchStr)].join('&'),
                       dataType : 'json',
                       timeout  : 5000,
                       url      : mbLookup.server,
                       error    : function (/* request, errorType, errorThrown */) {
                                      show($self.find('.error:first')); // Status: generic error
                                  },
                       success  : function (data, status) {
                                      var resultCount = data.results.length;
                                      mbUtility.processLookup(data, status);
                                      $("#results").removeClass('hidden')
                                                   .find('.result')
                                                   .slice(0, 10)
                                                   .removeClass('hidden'); // Show the first 10 results.
                                      $("#lookupInfo, #hasACDiv, #BottomControls").removeClass('hidden');
                                      $("#btnAddNew").attr('value', MusicBrainz.text.addNew[type]);
                                      $("#btnShowLast").attr('value', '« ' + MusicBrainz.text.LastResults).disable();
                                      $("#btnShowNext").attr('value', MusicBrainz.text.NextResults + ' »');
                                      if (resultCount < 10) {
                                          $("#btnShowNext").disable();
                                      }
                                      $.extend(lookup, {
                                                       resultsStart : 1,
                                                       resultsEnd   : resultCount > 10 ? 10 : resultCount,
                                                       justLoaded   : resultCount,
                                                       matches      : data.hits
                                                       });
                                      MusicBrainz.utility.setLookupNumbers();
                                  },
                       complete : function () {
                                      hide($self.find('.search:last')); // Hide 'Searching...'.
                                  }
                       }
                );
            }
        } catch (f) {
            switch (f) {
                case 1  : show($('#noInput')); break; // Status: nothing to look up
                case 0  : show($self.filter('.error:first')); break; // Status: generic error
                case 2  : mbUtility.showError('Lookup called on an unsupported entity type.'); break;
                default : throw f;
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
            var bold       = 'bold',
                div        = 'div',
                hidden     = 'hidden',
                results    = 'results',
                mbCache    = MusicBrainz.cache,
                mbImages   = mbCache.images,
                mbLookup   = mbCache.html.popups.lookup,
                mbText     = MusicBrainz.text,
                unTrim     = MusicBrainz.utility.unTrim,
                textError  = mbText.Error,
                objError   = { alt: textError, src: mbImages.warning },
                lookupHTML = MusicBrainz.html()
                                              .div({ id: 'lookup' })
                                                  .div({ cl: 'center', id: 'status' })
                                                      .div({ cl: 'search' })
                                                           .button({ id: 'btnSearch', ti: -1, val: mbText.Search })
                                                      .close(div)
                                                      .div({ cl: 'error ' + hidden })
                                                          .img(objError)
                                                          .span({ cl: 'bold', val: textError })
                                                      .close(div)
                                                      .div({ id: 'noInput', cl: 'error ' + hidden })
                                                          .img(objError)
                                                          .span({ cl: 'bold', val: mbText.NothingToLookUp })
                                                      .close(div)
                                                      .div({ id: 'noResults', cl: bold + ' ' + hidden })
                                                          .img(objError)
                                                          .span({ cl: 'bold', val: mbText.NoResultsFound })
                                                      .close(div)
                                                      .div({ cl: hidden + ' search ' + bold })
                                                          .img({ alt: mbText.Searching, src: mbImages.working })
                                                          .span({ cl: 'bold', val: mbText.Searching })
                                                      .close(div)
                                                  .close(div)
                                                  .div({ id: 'lookupInfo', cl: hidden })
                                                      .text(unTrim(mbText.MatchesFound))
                                                      .span({ id: 'matches', cl: bold })
                                                      .text(',' + unTrim(mbText.Loaded))
                                                      .span({ id: 'loaded', cl: bold })
                                                      .text(',' + unTrim(mbText.ShowingMatches))
                                                      .span({ id: results + 'Start', cl: bold })
                                                      .text(unTrim('&ndash;'))
                                                      .span({ id: results + 'End', cl: bold })
                                                  .close(div)
                                                  .div({ id: results, cl: hidden }).text(' ').close(div)
                                                  .div({ id: 'hasACDiv', cl: hidden })
                                                          .input({ id: 'hasAC', ti: -1, type: 'checkbox' })
                                                          .label({ 'for': 'hasAC', val: unTrim(mbText.HasNameVariation) })
                                                  .close(div)
                                                  .div({ id: 'BottomControls', cl: hidden })
                                                      .div({ css: 'padding-top:0.3em;display:inline-block;' })
                                                          .button({ id: 'btnShowLast', ti: -1 })
                                                          .button({ id: 'btnShowNext', ti: -1  })
                                                          .button({ id: 'btnAddNew', ti: -1, css: 'position:absolute;right:1em;'  })
                                                      .close(div)
                                                  .close(div)
                                                  .div({ id: 'addNewEntity' }).text(' ').close(div)
                                                  .close(div)
                                              .close(div)
                                        .end();
            lookupHTML = $(MusicBrainz.utility.makeHTML.popup('lookupPopup')).find('.popupContents')
                                                                             .append(lookupHTML)
                                                                             .end()
                                                                             .outerHTML();
            mbLookup.artist = lookupHTML;
            mbLookup.generic = $(lookupHTML).find('#hasAC').parent().remove()
                                            .end()         .end()
                                            .outerHTML();
        },
        /**
         * @description Creates the HTML string for a popup window.
         *
         * @param {String} contentsID The ID to assign to the contents div within the window.
         * @param {String} [bgColor] The css background color for the contents area of the popup; defaults to #fff.
         **/
        popup: function (contentsID, bgColor) {
            var popupHTML = MusicBrainz.html()
                                              .div({
                                                   cl: 'popup',
                                                   id: contentsID + '_parent'
                                                   })
                                                  .addHTML(MusicBrainz.cache.html.shadow)
                                                  .div({
                                                       cl  : 'popupContents',
                                                       css : 'background-color:' + (bgColor || '#fff') + ';',
                                                       id  : contentsID
                                                       })
                                                  .close('div')
                                              .close('div')
                                       .end();
            return popupHTML;
        },
        /**
         * @description Creates the HTML string for a div shadow.
         **/
        shadow: function () {
            var shadow   = '',
                shadowCt = 6,
                bgColor  = 'background-color:#000;';
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
     * @description Processes the results from a error-free lookup.
     *
     * @param {Object} data The json request results, passed automatically from $.ajax().
     * @param {Object} status The ajax request status, passed automatically from $.ajax().
     **/
    processLookup: function (data, status) {
        var i,
            thisResult,
            processResult,
            results = [];
        if (data.hits === 0) {
            $("#noResults").show(); // Status: no results
        } else {
            processResult = MusicBrainz.utility.processResult;
            for (i in data.results) if (data.results.hasOwnProperty(i)) {
                thisResult = data.results[i];
                results.push(processResult(thisResult));
            }
            /* Done this way, you *can* pass an array of jQuery-wrapped objects to have them all appended with only a single DOM manipulation. */
            $.fn.append.apply($("#results"), results);
            $("#results .result").filter(":not(.rounded)")
                                 .corner(MusicBrainz.cache.roundness)
                                 .addClass('rounded')
                                 .end()
                                 .filter(":even")
                                 .css("background-color","#F1F1F1")
                                 .end()
                                 .filter(":odd")
                                 .css("background-color","#FEFEFE"); // Needs a slight tint so that .corner() + the css :hover can work.
        }
    },
    /**
     * @description Processes a single lookup result.
     * @param {Object} thisResult The lookup result to process.
     */
    processResult: function (thisResult) {
        var isAllLatin = XRegExp("^\\p{InBasicLatin}|\\p{InLatin1Supplement}|\\p{InLatinExtendedAdditional}|\\p{InLatinExtendedA}|\\p{InLatinExtendedB}|\\p{InLatinExtendedC}|\\p{InLatinExtendedD}$"),
            result = MusicBrainz.html()
                                .div({ cl: 'result hidden' })
                                    .div({ cl: 'resultName' })
                                            .span({ cl: 'namename', val: thisResult.name })
                                        .addHTML(!isAllLatin.test(thisResult.name) ? MusicBrainz.html()
                                                                                                .em()
                                                                                                    .span({ cl: 'sortname', val: ' ( ' + thisResult.sort_name + ' )' })
                                                                                                .close('em')
                                                                                                .end()
                                                                                  : '')
                                    .close('div')
                                    .addHTML(thisResult.comment ? MusicBrainz.html()
                                                                             .div({ cl: 'disambiguation' })
                                                                                 .span(thisResult.comment)
                                                                             .close('div')
                                                                             .end()
                                                                : '')
                                .close('div')
                                .tojQuery()
                                .data("MusicBrainz", {
                                                     comment  : thisResult.comment,
                                                     gid      : thisResult.gid,
                                                     name     : thisResult.name,
                                                     sortname : thisResult.sort_name,
                                                     rowid    : thisResult.id
                                                     });
        return result;
    },	
    /**
     * Removes any existing lookup popup(s).
     */
    removeLookups: function () {
        var oldLookupPopup = $('#lookupPopup_parent'),
            oldStaticDivs,
            oldData = $('#lookup').data('lookup'); // Only present if an old lookup actually ran a search.
            if (typeof oldData !== 'undefined') {
                oldData.$input.removeData('lookup'); // Clear the old lookup's data from the input.
            }
            if (oldLookupPopup.length > 0) {
                oldLookupPopup.remove(); // Get rid of the old lookup.
            }
    },
    /**
     * @description Updates the status bar counts for a lookup.
     **/
    setLookupNumbers: function () {
        var mbUtility = MusicBrainz.utility;
        mbUtility.setLookupMatches();
        mbUtility.setLookupLoaded();
        mbUtility.setLookupVisibleMatches();
    },
    /**
     * @description Sets the 'loaded' text contents for lookup popup window results.
     **/
    setLookupLoaded: function () {
        var lookupData = $('#lookup').data('lookup');
        lookupData.loadedResults = (parseInt(lookupData.loadedResults, 10) || 0) + parseInt(lookupData.justLoaded, 10);
        $("#loaded").text(lookupData.loadedResults);
    },
    /**
     * @description Sets the 'matches found' text contents for lookup popup window results.
     **/
    setLookupMatches: function () {
        var lookupData = $('#lookup').data('lookup');
        $("#matches").text(lookupData.matches);
    },
    /**
     * @description Sets the 'start' and 'end' text contents for lookup popup window results.
     *
     * @param {String|Int} [start] The start value.
     * @param {String|Int} [end] The end value.
     **/
    setLookupVisibleMatches: function (start, end) {
        var lookupData = $('#lookup').data('lookup');
        $("#resultsStart").text(start || lookupData.resultsStart);
        $("#resultsEnd").text(end || lookupData.resultsEnd);
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
    delete MusicBrainz.utility.makeHTML.shadow;

    MusicBrainz.utility.makeHTML.lookup();
    delete MusicBrainz.utility.makeHTML.lookup;
});
