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
     * @description Stores artist-specific statics.
     * @namespace
     */
    artist: {
        /**
         * @description Stores artist-specific event bindings.
         */
        events: {
            showLookupOnClick: function ($) {
                $('input.artist').live('click', function () {
                    MusicBrainz.utility.addLookup($(this), 'artist');
                    $(this).data('lookupType', 'artist'); // Saves the lookup having to do a (slower) class check to figure out the entity type.
                });
            },
            doLookupOnClick: function ($) {
                $('#btnSearch').live('click', function () {
                    MusicBrainz.utility.doLookup();
                });
            }
        }
    },
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
        },
        /**
         * @description Initializes cache data for derived variables, onReady.
         **/
        init: function ($) {
            var $sidebar = MusicBrainz.editor.cache.$sidebar,
                $sidebarDDs;
            /* Sidebar initiation */
            $sidebarDDs         = $sidebar.$DDs = $('#sidebar dd');
            $sidebar.$DateDDs   = $sidebarDDs.filter('.date');
            $sidebar.$InputDDs  = $sidebarDDs.filter(':has(input):not(.date)');
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
            var mb             = MusicBrainz,
                $sidebar       = mb.editor.cache.$sidebar,
                utility        = mb.utility,
                addOverlay     = utility.addOverlay,
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
        sidebar = mbEditor.sidebar,
        artist = mbEditor.artist;

    if (typeof notLive === 'undefined') { // Prevent self-initiation when loaded for unit-tests.
        mbEditor.cache.init($);

        /* Artist-specific */
        artist.events.showLookupOnClick($);
        delete artist.events.showLookupOnClick;

        artist.events.doLookupOnClick($);
        delete artist.events.doLookupOnClick;

        /* Sidebar-specific */
        sidebar.init($);
        delete sidebar.init;

        sidebar.events.showEditFieldsOnClick($);
        delete sidebar.events.showEditFieldsOnClick;
    }

    /* FOR TESTING OF THIS BRANCH ONLY */
    MusicBrainz.html().input({ id: 'foo', cl: 'artist' }).append('#content');
    MusicBrainz.html().input({ id: 'bar', cl: 'artist' }).append('#content');
    /* END TESTING STUFF */
});
