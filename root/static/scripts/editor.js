/*jslint undef: true, browser: true*/
/*global jQuery, $, MusicBrainz, notLive, window */

/** 
 * @fileOverview This file contains all functions to initialize and run the MusicBrainz inline editor. 
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 * @requires html_factory.js
 * @requires jquery.js
 * @requires jquery.selectboxes.js
 * @requires jquery.jquery.js
 * @requires mb_utilities.js
 */

"use strict";

/**
 * @description Contains all functionality for the inline editor.
 * @namespace
 */
MusicBrainz.editor = {
    /**
     * @description Stores editor-specific statics.
     * @namespace
     */
    cache: {
        /** 
         * @description Stores sidebar-specific collections of static selectors.
         */
        $sidebar: {},
        /** 
         * @description Stores dynamically generated, then static, HTML strings.
         */
        html: {
            popups: {
                lookup: function () {
                    var bold = 'bold',
                        div = 'div',
                        hidden = 'hidden',
                        results = 'results',
                        mbImages = MusicBrainz.cache.images,
                        unTrim = MusicBrainz.utility.unTrim,
                        text = MusicBrainz.text,
                        textGenericError = text.GenericError,
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
                    return lookupHTML;
                }
            }
        },
        /**
         * @description Initializes cache data for derived variables, onReady.
         **/
        init: function ($) {
            var $sidebar = MusicBrainz.editor.cache.$sidebar,
                $sidebarDDs;
            /* Sidebar initiation */
            $sidebarDDs = $sidebar.$DDs = $('#sidebar dd');
            $sidebar.$DateDDs = $sidebarDDs.filter('.date');
            $sidebar.$InputDDs = $sidebarDDs.filter(':has(input):not(.date)');
            $sidebar.$SelectDDs = $sidebarDDs.filter(':has(select)');
        }
    },
    /**
     * @description Stores sidebar-specific functionality.
     * @namespace
     */
    sidebar: {
        /**
         * @description Initializes sidebar functionality, onReady.
         **/
        init: function ($) {
            var mb = MusicBrainz,
                $sidebar = mb.editor.cache.$sidebar,
                utility = mb.utility,
                addOverlay = utility.addOverlay,
                addOverlayThis = utility.addOverlayThis,
                getChildValues = utility.getChildValues;
            $sidebar.$DateDDs.each(function (i) {
                addOverlay($(this), {
                                    createOverlayText: getChildValues
                                    });
            });
            $sidebar.$InputDDs.find('input')
                              .add($sidebar.$SelectDDs.find('select'))
                              .each(addOverlayThis);
        },
        /** 
         * @description Stores sidebar-specific event bindings.
         */
        events: {
            showEditFieldsOnClick: function ($) {
                $('#sidebar').bind('click', function (e) {
                    if ($(e.target).parents('dl')) { // Don't toggle if the click wasn't within a dl.
                        $(e.target).closest('.editable')
                                   .addClass('hidden')
                                   .prev()
                                   .show();
                    }
                });
            }
        }
    }
};






/**
 * @description Initialize initial page-load functionality.
 */
$(function ($) {
    var mbEditor = MusicBrainz.editor,
        htmlCache = mbEditor.cache.html,
        sidebar = mbEditor.sidebar;
    if (typeof notLive === 'undefined') { // Prevent self-initiation when loaded for unit-tests.
        mbEditor.cache.init($);
        sidebar.init($);
        sidebar.events.showEditFieldsOnClick($);
    }
    /* Initialize static HTML strings generated from per-session dynamic strings. */
    htmlCache.popups.lookup = $(MusicBrainz.utility.makeHTML.popup()).find(".popupContents")
                                                                     .append(htmlCache.popups.lookup())
                                                                     .end()
                                                                     .outerHTML();


    /* DEBUG STUFF */
    MusicBrainz.html().input({ id: 'foo', cl: 'artist' }).append('#content');
    /* END DEBUG STUFF */

});


$('input.artist').live('click', function () {
    var $self = $(this),
        hidden = 'hidden',
        inputOffset = $self.offset(),
        $oldLookup = $self.data('lookup');
    if (typeof $oldLookup === 'undefined') { // Don't create more than one lookup at a time for the same input.
        $self.after($(MusicBrainz.editor.cache.html.popups.lookup).offset(inputOffset.bottom - 1, inputOffset.left + 1));
    } else {
        $oldLookup.$divs.filter(':not(#status)')
                        .addClass(hidden) // Hide any existing lookup results or status messages.
                        .filter('.search:first').removeClass(hidden); // Re-show the search button.
    }
});

/**
 * Offset extention
 * Adds offset().right and offset().bottom built-in getter capabilities, as well as .offset(top, left) setter capability.
 *
 * @example $('#tester').offset().bottom
 * @example $('#tester').offset().right
 * @example $('#tester').offset(10, 20);
 * @example $('#tester').offset(10, 20, 'fast');
 * @example $('#tester').offset('+=10', '+=20');
 * @example $('#tester').offset('+=5', '-=30');
 * @author Brian Schweitzer (BrianFreud)
 * @author Charles Phillips, first half of the return conditional ( http://groups.google.com/group/jquery-dev/browse_thread/thread/10fa400d3f9d9521/ )
 */
(function ($) {
    var offsetMethod = $.fn.offset;
    $.fn.offset = function () {
        var offset = offsetMethod.call(this),
            bottom = offset.top + this.outerHeight(),
            right = offset.left + this.outerWidth(),
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

$('#btnSearch').live('click', function (c) {
    var hidden = 'hidden',
        artist = 'artist',
        label = 'label',
        mbLookup = MusicBrainz.cache.lookup,
        mbUtility = MusicBrainz.utility,
        $self,
        $selfParent,
        $selfGrandParent,
        $statusSearching,
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
            $statusSearching = $self.find('.search:last');
            lookup = {
                     $divs            : $self.find('div'),
                     $input           : $selfGrandParent.prev(),
                     $lookupContainer : $self,
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
            lookupType = lookup.$input.data("lookupType"); // Allow overriding the lookup type by pre-setting a .data() value on the input.
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
            show($statusSearching); // Status: searching
            $.ajax({
                   /* defaults:
                   async    : false,
                   cache    : true,
                   type     : "GET",
                   */
                   error    : function () { throw 0; },
                   success  : function (data) { console.log(data); }, /* CHANGE ME artistEditor.processResults, */
                   data     : [mbLookup.type + lookup.lookupType, mbLookup.limit, mbLookup.query + window.escape(searchStr)].join("&"),
                   dataType : "json",
                   url      : mbLookup.server
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
});
