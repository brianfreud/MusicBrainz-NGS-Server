/*jslint undef: true, browser: true*/
/*global jQuery, $, MusicBrainz */

/** 
 * @fileOverview This file contains all functions to initialize and run the MusicBrainz inline editor. 
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 * @requires html_factory.js
 * @requires mb_utilities.js
 * @requires jquery.selectboxes.js
 * @requires jquery.jquery.js
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
    $cache: {
        /** 
         * @description Stores sidebar-specific collections of static selectors.
         */
        $sidebar: {},
        /**
         * @description Initializes cache data for derived variables, onReady.
         **/
        init: ($(function ($) {
            var $sidebar = MusicBrainz.editor.$cache.$sidebar,
                $sidebarDDs;
            /* Sidebar initiation */
            $sidebarDDs = $sidebar.$DDs = $('#sidebar dd');
            $sidebar.$DateDDs = $sidebarDDs.filter('.date');
            $sidebar.$InputDDs = $sidebarDDs.filter(':has(input):not(.date)');
            $sidebar.$SelectDDs = $sidebarDDs.filter(':has(select)');
        }))
    },
    /**
     * @description Stores sidebar-specific functionality.
     * @namespace
     */
    sidebar: {
        /**
         * @description Initializes sidebar functionality, onReady.
         **/
        init: ($(function ($) {
            var mb = MusicBrainz,
                $sidebar = mb.editor.$cache.$sidebar,
                utility = mb.utility;
            $sidebar.$DateDDs.each(function (i) {
                utility.addOverlay($(this), {
                                            createOverlayText: utility.getChildValues
                                            });
            });
            $sidebar.$InputDDs.find('input')
                              .add($sidebar.$SelectDDs.find('select'))
                              .each(utility.addOverlayThis);
        })),
        /** 
         * @description Stores sidebar-specific event bindings.
         */
        events: {
            toggleOnClick: ($(function ($) {
                $('#sidebar').bind('click', function (e) {
                    if ($(e.target).parents("dl")) {
                        $(e.target).closest('.editable')
                                   .addClass('hidden')
                                   .prev()
                                   .show();
                    }
                });
            }))
        }
    }
};
