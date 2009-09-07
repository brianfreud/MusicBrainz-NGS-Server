/*jslint undef: true, browser: true*/
/*global jQuery, $, MusicBrainz, notLive */

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
     * @description Stores static selectors.
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
                        results = 'results',
                        padString = MusicBrainz.utility.padString,
                        text = MusicBrainz.text,
                        lookupHTML = MusicBrainz.html()
                                                .div({ id: 'lookup' })
                                                    .div({ cl: 'center', id: 'status' })
                                                        .div({ id: 'search' })
                                                            .button({ id: 'btnSearch', ti: -1, val: text.Search })
                                                        .close(div)
                                                        .div({ id: 'noInput' }, 1)
                                                            .span({ cl: 'bold', val: text.NothingToLookUp })
                                                        .close(div)
                                                        .div({ id: 'noResults', cl: bold }, 1)
                                                            .span({ cl: 'bold', val: text.NoResultsFound })
                                                        .close(div)
                                                        .div({ id: 'nowSearching', cl: bold }, 1)
                                                            .img({ alt: text.Searching, src: MusicBrainz.images.doingSomething })
                                                            .span({ cl: 'bold', val: padString(text.Searching) })
                                                        .close(div)
                                                    .close(div)
                                                    .div({ id: 'info' }, 1)
                                                        .span(padString(text.Results))
                                                        .span({ id: 'matches', cl: bold })
                                                        .text(',' + padString(text.MatchesFound))
                                                        .span({ id: 'loaded', cl: bold })
                                                        .text(',' + padString(text.Loaded))
                                                        .span({ id: results + 'Start' })
                                                        .text(padString('&ndash;'))
                                                        .span({ id: results + 'End' })
                                                    .close(div)
                                                    .div({ id: results }, 1).text(' ').close(div) // Without the space, the div is not always created.
                                                    .div({ id: 'BottomControls' }, 1)
                                                        .div({ css: 'float:left;' }, 1)
                                                            .input({ id: 'hasAC', ti: -1, type: 'checkbox' })
                                                            .label({ 'for': 'hasAC', val: padString(text.HasNameVariation) })
                                                        .close(div)
                                                        .div({ css: 'float:right;' })
                                                            .button({ id: 'btnAddNew', ti: -1 })
                                                        .close(div)
                                                        .div({ id: 'addNewEntity' }, 1).text(' ').close(div) // Without the space, the div is not always created.
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
                    if ($(e.target).parents("dl")) { // Don't toggle if the click wasn't within a dl.
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
        sidebar = mbEditor.sidebar;
    if (typeof notLive === 'undefined') { // Prevent self-initiation when loaded for unit-tests.
        mbEditor.cache.init($);
        sidebar.init($);
        sidebar.events.showEditFieldsOnClick($);
    }
    /* Initialize static HTML strings generated from per-session dynamic strings. */
    htmlCache.popups.lookup = htmlCache.popups.lookup();



    /* DEBUG STUFF */
    MusicBrainz.html().input({ id: 'foo', cl: 'artist' }).append("#content");
    /* END DEBUG STUFF */

});


$("input.artist").live("click", function () {
    $(this).parent()
           .after($(MusicBrainz.editor.cache.html.popups.lookup));
});

$("#btnSearch").live("click", function () {
    var mbUtility = MusicBrainz.utility,
        $inputField = $(this).prev().find('input.artist:first'),
        searchString = $inputField.val();
    $("#lookup").addClass("hidden");
    if ($inputField.length === 0) {
        mbUtility.showError("BUG: lookup called on a non-existant input field."); // Should never happen
    } else if (searchString.length === 0) {
        $("#noInput").show(); // Nothing to look up
    } else {
        $("#lookup").data("inputField", $inputField)
                    .data("searchString", $inputField.val())
    }
});


/*
var newLookup = function () {
    var lookupData = {
                     inputField: $("foo")
                     };
};

var processLookup = function (lookupData) {
    var mbUtility = MusicBrainz.utility;

        if (!$("#lookup").data("searchString").length) {
            throw 0;
        }



MusicBrainz.utility.showError("a")


    }
    catch (problem) {
        
        switch (problem) {

// NoResultsFound
        }
    }
    finally{
         alert('I am alerted regardless of the outcome above');
    }
};

*/
