/*jslint undef: true, browser: true*/
/*global jQuery, $, MusicBrainz, window, XRegExp */
/*members $divs, $input, $popupContainer, $popupContents, Error, HasNameVariation, LastResults, Loaded, MatchesFound, NextResults, 
    NoResultsFound, NothingToLookUp, Search, Searching, ShowingMatches, UnknownPlaceholder, add, addClass, addEntity, addHTML, addLookup, 
    addMBLookup, addNew, addNewContainer, addOverlay, addOverlayThis, after, ajax, alert, alt, append, apply, artist, attr, beforeSend, bind, bottom, 
    button, buttonAddNew, buttonContainer, buttonLast, buttonNext, buttonSearch, cache, cl, close, comment, complete, console, corner, 
    createOverlayText, css, data, dataType, debug, disable, div, em, end, error, errorNoInput, errorNoResults, escape, filter, find, fn, for, 
    generic, get, getChildValues, getData, getValue, gid, hasACCheckbox, hasACContainer, hasClass, hasOwnProperty, hits, html, id, images, img, 
    infoContainer, input, insertAfter, is, join, label, lastResults, latinAll, left, length, limit, live, loaded, lookup, lookupData, 
    lookupPopup, makeHTML, map, matches, name, nextResults, offset, outerHTML, parent, parents, popup, popups, prototype, push, query, 
    remove, removeClass, resolveLookup, results, resultsContainer, resultsDisplayed, resultsDisplayedEnd, resultsDisplayedStart, 
    resultsEnd, resultsLoaded, resultsMatches, resultsStart, roundness, rowid, scripts, selectedTexts, server, setDisplays, shadow, showError, 
    showingEnd, showingLoaded, showingMatches, showingStart, slice, sort_name, sortname, span, src, startSearch, stopImmediatePropagation, 
    success, tagName, target, test, text, textForUnknown, ti, timeout, toLowerCase, toString, tojQuery, traversalButtons, type, unTrim, unwrap, 
    url, use, utility, val, value, warning, working, wrap, wrapper, bold, hidden, showElements, hideElements, AC
*/
/**
 * @fileOverview This file contains all utility functions used in MusicBrainz javascript code.
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 * @requires html_factory.js
 * @requires jquery.corner.js
 * @requires jquery.enableDisable.js
 * @requires jquery.enhancedOffset.js
 * @requires jquery.js
 * @requires jquery.outerClick.js
 * @requires jquery.outerHTML.js
 * @requires jquery.selectboxes.js
 * @requires jquery.unwrap.js
 * @requires text_strings.js
 * @requires XRegExp.js
 * @requires XRegExp-Unicode.js
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
     * Creates an Add new Entity instance within the context of a lookup popup instance.
     *
     * @param {String} type The entity type to be added.
     **/
    addEntity: function(type) {
        // TODO: PORT
        alert('Not implemented yet.');
    },
    /**
     * Creates and attaches a lookup popup instance; will remove any existing lookup instance.
     * Call once with no parameters to initialize.  Afterwards, call either with only the jQuery-wrapped
     * element, or (faster), with both the jQuery-wrapped element and the type, to instantiate a lookup.
     *
     * @param {Object} [$element] The jQuery-wrapped input element to attach the lookup to.
     * @param {Object} [type] The lookup type to instantiate.
     **/
    addLookup: function ($element, type) {
        var self = this,
            mbCache        = MusicBrainz.cache,
            mbText         = MusicBrainz.text,
            mbCacheHTML    = mbCache.html,
            resultsAtATime = 20,
            classes = {
                artist : 'artist',
                bold   : 'bold',
                error  : 'bold error hidden',
                hidden : 'hidden',
                label  : 'label'
            },
            elements = {
                addNewContainer  : 'addNewEntity',
                buttonAddNew     : 'btnAddNew',
                buttonContainer  : 'BottomControls',
                buttonLast       : 'btnShowLast',
                buttonNext       : 'btnShowNext',
                buttonSearch     : 'btnSearch',
                errorNoInput     : 'noInput',
                errorNoResults   : 'noResults',
                hasACContainer   : 'hasACDiv',
                hasACCheckbox    : 'hasAC',
                infoContainer    : 'lookupInfo',
                lookupPopup      : 'lookup',
                resultsContainer : 'results',
                results          : 'result',
                showingEnd       : 'resultsEnd',
                showingLoaded    : 'loaded',
                showingMatches   : 'matches',
                showingStart     : 'resultsStart'
            },
            lookupContext,
            resultsContext,
            lookupData,
            show = self.showElements,
            hide = self.hideElements,
            removeLookup = function () {
                if (self.lookupData) {
                    var $popupToRemove = self.lookupData.$popupContainer;
                    $popupToRemove.css('display','none');
                    $('.removable', lookupContext).html('');
                    $popupToRemove.remove();
                    delete self.lookupData;
                }
            },
            createLookup = function (type) {
                var inputOffset = $element.offset(),
                    resultData;
                if (typeof self.lookupData === 'undefined') {
                    $(mbCacheHTML.popups.lookup[type === 'artist' ? type : 'generic']).insertAfter($element)
                                                                                       .offset(inputOffset.bottom, inputOffset.left + 1, 0)
                                                                                       .bind('outerClick', removeLookup);
                    $('#' + elements.resultsContainer, lookupContext).bind('click', function (e) {
                        resultData = $(e.target).parents('.' + elements.results).data('MusicBrainz');
                        resultData.type = type;
                        if (type === 'artist') {
                            resultData.AC = self.getValue($('#' + elements.hasACCheckbox));
                        }
                        resultData.$input = lookupData.$input;
                        removeLookup();
                        self.resolveLookup(resultData);
                    });
                } else {
                    removeLookup();
                    self.addLookup($element, type);
                }
            },
            setData = {
                resultsDisplayedStart: function (number) {
                    lookupData.resultsStart = number || 1;
                    return this;
                },
                resultsDisplayedEnd: function (number) {
                    lookupData.resultsEnd = number || 10;
                    return this;
                },
                resultsLoaded: function (number) {
                    lookupData.loaded = (lookupData.loaded || 0) + (number || 0);
                    return this;
                },
                resultsMatches: function (number) {
                    lookupData.matches = (number || 0);
                    return this;
                }
            },
            setDisplay = {
                buttonLast: function () {
                    $('#' + elements.buttonLast, lookupContext).attr('value', '« ' + mbText.LastResults);
                    return this;
                },
                buttonNext: function () {
                    var nextText = mbText.NextResults + ' ',
                        remainingResults = (lookupData.matches - lookupData.resultsEnd);
                    if (remainingResults > 9) {
                        nextText += 10;
                    } else {
                        nextText += remainingResults;
                    }
                    nextText += ' »';
                    $('#' + elements.buttonNext, lookupContext).attr('value',  nextText);
                    return this;
                },
                resultsDisplayed: function (start) {
                    var matches = lookupData.matches,
                        numberStart = (lookupData.resultsStart || 0) + start,
                        numberEnd = (numberStart + 9) <= matches ? (numberStart + 9) : matches,
                        $results;
                    $('#' + elements.showingStart, lookupContext).text(numberStart);
                    $('#' + elements.showingEnd, lookupContext).text(numberEnd);
                    setData.resultsDisplayedStart(numberStart)
                           .resultsDisplayedEnd(numberEnd);
                    $results = $('.' + elements.results, resultsContext);
                    hide($results.filter(':not(.' + classes.hidden + ')'));
                    show($results.slice(numberStart - 1, numberEnd));
                    return this;
                },
                resultsLoaded: function () {
                    $('#' + elements.showingLoaded, lookupContext).text(lookupData.loaded);
                    return this;
                },
                resultsMatches: function () {
                    $('#' + elements.showingMatches, lookupContext).text(lookupData.matches);
                    return this;
                },
                traversalButtons: function () {
                    $('#' + elements.buttonLast, lookupContext)[lookupData.resultsStart > 1 ? 'enable' : 'disable']();
                    $('#' + elements.buttonNext, lookupContext)[lookupData.resultsEnd < lookupData.matches ? 'enable' : 'disable']();
                    return this;
                }
            },
            setDisplays = function (start) {
                setDisplay.resultsDisplayed(start)
                          .resultsLoaded()
                          .resultsMatches()
                          .traversalButtons()
                          .buttonLast()
                          .buttonNext();
            },
            processResult = function (thisResult) {
                var isAllLatin = new XRegExp('^' + MusicBrainz.cache.scripts.latinAll + '$');
                return MusicBrainz.html()
                                         .div({ cl: elements.results + ' ' + classes.hidden })
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
                                   .data('MusicBrainz', {
                                                        comment  : thisResult.comment,
                                                        gid      : thisResult.gid,
                                                        name     : thisResult.name,
                                                        sortname : thisResult.sort_name,
                                                        rowid    : thisResult.id
                                                        });
            },	
            processResults = function (data) {
                if (data.hits === 0) {
                    show($('#' + elements.errorNoResults, lookupContext)); // Status: no results
                } else {
                    var i,
                        $resultsArr = [];
                    for (i in data.results) {
                        if (data.results.hasOwnProperty(i)) {
                            $resultsArr.push(processResult(data.results[i]));
                        }
                    }
                    $.prototype.append.apply($('#results', lookupContext), $resultsArr);
                    $('.' + elements.results, resultsContext).filter(':not(.rounded)').corner(MusicBrainz.cache.roundness).addClass('rounded')
                                                       .end().filter(':even').css('background-color','#F1F1F1')
                                                       .end().filter(':odd').css('background-color','#FEFEFE');
                }
            },
            getData = function (display) {
                var mbLookup = mbCache.lookup;
                $('#' + elements.buttonLast + ', #' + elements.buttonNext, lookupContext).disable();
                if (lookupData.offset === 0 || lookupData.offset < lookupData.matches) {
                    $.ajax({
                           /* defaults:
                           async      : false,
                           cache      : true,
                           type       : 'GET',
                           */
                           data       : [mbLookup.type + type,
                                         mbLookup.limit + resultsAtATime,
                                         mbLookup.offset + lookupData.offset,
                                         mbLookup.query + window.escape(self.getValue(lookupData.$input))
                                        ].join('&'),
                           dataType   : 'json',
                           timeout    : 5000,
                           url        : mbLookup.server,
                           beforeSend : function () {
                                            show(lookupData.$divs.find('.search:last')); // Show 'Searching...'.
                                        },
                           error      : function (/* data, status */) {
                                            show(lookupData.$divs.filter('.error:first'));
                                        },
                           success    : function (data/* , status */) {
                                            lookupData.offset += 20;
                                            setData.resultsLoaded(data.results.length)
                                                   .resultsMatches(data.hits);
                                            processResults(data);
                                            if (data.hits > 0) {
                                                lookupData.setDisplays(display);
                                                show($('#' + elements.resultsContainer, lookupContext).add('#' + elements.infoContainer, lookupContext)
                                                                                                      .add('#' + elements.hasACContainer, lookupContext));
                                            } else {
                                                $('#' + elements.buttonLast, lookupContext).add('#' + elements.buttonNext, lookupContext)
                                            // These 2 buttons prop open the div's vertical height, so visibility: hidden, not display: none.
                                                                                           .css('visibility', 'hidden');
                                            }
                                            show($('#' + elements.buttonContainer, lookupContext));
                                            $('#' + elements.buttonAddNew, lookupContext).attr('value', mbText.addNew[type]);
                                        },
                           complete   : function () {
                                            hide(lookupData.$divs.find('.search:last')); // Hide 'Searching...'.
                           }
                    });
                }
            },
            initNew = function ($element, type) {
            var $thisLookup,
                $thisLookupParent;
                type = type || $element.data('lookupType');
                if (!type) { // If the type didn't get explicitly set, try to figure out what the entity type is.
                    if ($element.hasClass(classes.artist)) {
                        type = 'artist';
                    } else if ($element.hasClass(classes.label)) {
                        type = 'label';
                    } else {
                       self.showError('Lookup called on an unspecified entity type.');
                    }
                }
                if (type !== 'artist' && type !== 'label') {
                    self.showError('Lookup called on an unsupported entity type.');
                }
                createLookup(type);
                $thisLookup = $('#' + elements.lookupPopup);
                $thisLookupParent = $thisLookup.parent();
                lookupContext = $thisLookup[0]; // Store the DOM context of the lookup popup.
                resultsContext = $('#' + elements.resultsContainer, lookupContext)[0]; // Store the DOM context of the results div.
                lookupData = self.lookupData = {
                                               $input          : $element,
                                               $divs           : $('div', lookupContext),
                                               $popupContents  : $thisLookupParent,
                                               $popupContainer : $thisLookupParent.parent(),
                                               offset          : 0,
                                               getData         : getData, // Store a reference to the private function.
                                               setDisplays     : setDisplays // Store a reference to the private function.
                                               };
            },
            enableButton = {
                addEntity: function () {
                    $('#' + elements.buttonAddNew, lookupContext).live('click', function () {
                        self.addEntity(type);
                    });
                    return this;
                },
                lastResults: function () {
                    $('#' + elements.buttonLast, lookupContext).live('click', function () {
                        self.lookupData.setDisplays(-10);
                    });
                    return this;
                },
                nextResults: function () {
                    $('#' + elements.buttonNext, lookupContext).live('click', function () {
                        var lookupData = self.lookupData;
                        if (lookupData.resultsEnd === lookupData.loaded && lookupData.loaded < lookupData.matches) {
                            lookupData.getData(10);
                        } else {
                            lookupData.setDisplays(10);
                        }
                    });
                    return this;
                },
                startSearch: function () {
                    $('#' + elements.buttonSearch, lookupContext).live('click', function () {
                        var lookupData = self.lookupData;
                        hide(lookupData.$divs.find('.search:first')); // Hide the search button's div.
                        if (self.getValue(lookupData.$input).length === 0) {
                            show($('#noInput')); // Status: nothing to look up
                        } else {
                            lookupData.getData(1);
                        }
                    });
                    return this;
                }
            },
            makeHTML = function () {
                var div          = 'div',
                    mbImages     = mbCache.images,
                    mbLookup     = mbCacheHTML.popups.lookup,
                    unTrim       = self.unTrim,
                    textError    = mbText.Error,
                    objError     = { alt: textError, src: mbImages.warning },
                    lookupHTML   = MusicBrainz.html() // Class removable should only be used on containers holding elements with no events or data().
                                                    .div({ id: elements.lookupPopup })
                                                        .div({ cl: 'center', id: 'status' })
                                                            .div({ cl: 'search' })
                                                                 .button({ id: elements.buttonSearch, ti: -1, val: mbText.Search })
                                                            .close(div)
                                                            .div({ cl: 'removable' })
                                                                .div({ cl: classes.error })
                                                                    .img(objError)
                                                                    .span({ cl: classes.bold, val: textError })
                                                                .close(div)
                                                                .div({ id: elements.errorNoInput, cl: classes.error })
                                                                    .img(objError)
                                                                    .span({ cl: classes.bold, val: mbText.NothingToLookUp })
                                                                .close(div)
                                                                .div({ id: elements.errorNoResults, cl: classes.error })
                                                                    .img(objError)
                                                                    .span({ cl: classes.bold, val: mbText.NoResultsFound })
                                                                .close(div)
                                                                .div({ cl: classes.hidden + ' search ' + classes.bold })
                                                                    .img({ alt: mbText.Searching, src: mbImages.working })
                                                                    .span({ cl: classes.bold, val: mbText.Searching })
                                                                .close(div)
                                                            .close(div)
                                                        .close(div)
                                                        .div({ id: elements.infoContainer, cl: classes.hidden + ' removable' })
                                                            .text(unTrim(mbText.MatchesFound))
                                                            .span({ id: elements.showingMatches, cl: classes.bold })
                                                            .text(',' + unTrim(mbText.Loaded))
                                                            .span({ id: elements.showingLoaded, cl: classes.bold })
                                                            .text(',' + unTrim(mbText.ShowingMatches))
                                                            .span({ id: elements.showingStart, cl: classes.bold })
                                                            .text(unTrim('&ndash;'))
                                                            .span({ id: elements.showingEnd, cl: classes.bold })
                                                        .close(div)
                                                        .div({ id: elements.resultsContainer, cl: classes.hidden }).close(div)
                                                        .div({ id: elements.hasACContainer, cl: classes.hidden, css: 'padding-top:.7em;' })
                                                            .input({ id: elements.hasACCheckbox, ti: -1, type: 'checkbox' })
                                                            .label({ 'for': elements.hasACCheckbox, val: unTrim(mbText.HasNameVariation) })
                                                        .close(div)
                                                        .div({ id: elements.buttonContainer, cl: classes.hidden	, css: 'padding-top:1em;' })
                                                            .button({ id: elements.buttonLast, ti: -1 })
                                                            .button({ id: elements.buttonNext, ti: -1  })
                                                            .button({ id: elements.buttonAddNew, ti: -1, css: 'position:absolute;right:1em;'  })
                                                        .close(div)
                                                        .div({ id: elements.addNewContainer }).close(div)
                                                        .close(div)
                                                    .close(div)
                                              .end();
                lookupHTML = self.makeHTML.popup('lookupPopup', lookupHTML);
                mbLookup.artist = lookupHTML;
                mbLookup.generic = $(lookupHTML).find('#hasAC').parent().remove()
                                                .end()         .end()
                                                .outerHTML();
        };
        if (arguments.length !== 0) {
            return initNew($element, type);
        } else {
            if (!mbCacheHTML.popups.lookup.artist) { // Prevent reinitialization.
                makeHTML();
                enableButton.addEntity()
                            .lastResults()
                            .nextResults()
                            .startSearch();
                /**
                 * Allows attaching MusicBrainz lookups from a jQuery chain.
                 * 
                 * @param {String} [type] The entity type to be looked up.
                 * @public
                 **/
                jQuery.fn.addMBLookup = function (type) {
                    $(this).live('click', function (e) {
                        e.stopImmediatePropagation(); // Prevent the outerClick event closing a newly created lookup.
                        MusicBrainz.utility.addLookup($(this), type);
                    });
                    return this;
                };
            }
        }
    },
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
     * Apply class 'hidden' to a jQuery element.
     *
     * @param {jQuery} $ele The element(s) to hide.
     */
    hideElements: function ($ele) {
        return $ele.addClass('hidden');
    },
    /**
     * Generic HTML strings
     *
     * @memberOf MusicBrainz.utility
     * @namespace
     */
    makeHTML: {
        /**
         * Creates the HTML string for a popup window.
         *
         * @param {String} contentsID The ID to assign to the contents div within the window.
         * @param {String} [contents] HTML to insert as the popup's contents.
         * @param {String} [bgColor] The css background color for the contents area of the popup; defaults to #fff.
         **/
        popup: function (contentsID, contents, bgColor) {
            contents = contents || '';
            var popupHTML = MusicBrainz.html()
                                              .div({
                                                   cl: 'popup',
                                                   id: contentsID + '_parent'
                                                   })
                                                  .div({ cl: 'removable' })
                                                      .addHTML(MusicBrainz.cache.html.shadow)
                                                  .close('div')
                                                  .div({
                                                       cl  : 'popupContents',
                                                       css : 'background-color:' + (bgColor || '#fff') + ';',
                                                       id  : contentsID
                                                       })
                                                      .addHTML(contents)
                                                  .close('div')
                                              .close('div')
                                       .end();
            return popupHTML;
        },
        /**
         * Creates the HTML string for a div shadow.
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
     * Handles a lookup result's selection.
     *
     * @param {Object} data The data for the selected lookup result.
     * @param {jQuery} data.$input The input which was being looked up.
     * @param {Bool} [data.AC] For artists, whether or not an artist has an artist credit.
     * @param {Object} data.comment The entity's disambiguation comment.
     * @param {Object} data.gid  The entity's gid.
     * @param {Object} data.name  The entity's name.
     * @param {Object} data.rowid  The entity's rowid.
     * @param {Object} data.sortname  The entity's sortname.
     * @param {Object} data.type  The entity type.
     */
    resolveLookup: function (data) {
        // TODO: PORT
        alert('Not implemented yet.');
    },
    /**
     * Remove class 'hidden' from a jQuery element.
     *
     * @param {jQuery} $ele The element(s) to unhide.
     */
    showElements: function ($ele) {
        return $ele.removeClass('hidden');
    },
    /**
     * Logs a message to the FireBug or FireBug Lite console, if present, otherwise it alerts it.
     *
     * @param {String} error The message to be passed.
     **/
    showError: function (error) {
        (window.console ? console.debug : window.alert)(error);
    },
    /**
     * Adds a space to either end of a string.
     *
     * @param {String} str The string to be padded.
     **/
    unTrim: function (str) {
        return ' ' + str + ' ';
    }
};

/**
 * Initialize statics set on page-load.
 */
$(function ($) {
    var mbUtility = MusicBrainz.utility;

    /* Initialize static HTML strings generated from per-session dynamic strings. */
    mbUtility.makeHTML.shadow();
    delete mbUtility.makeHTML.shadow;

    /* Initialize the HTML string and events for lookups. */
    mbUtility.addLookup();

}(jQuery));
