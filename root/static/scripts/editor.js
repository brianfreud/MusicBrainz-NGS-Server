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
     * @description Stores artist-editor-specific functionality.
     * @namespace
     */
    artist: {
        editor: {
            /**
             * Adds an artist row to an artist editor popup.
             */
            addArtist: function (artist) {
                artist = artist || {};
                var aeditor  = 'ArtistEditor',
                    html = MusicBrainz.html().tr({ cl: aeditor + '-Artist' }),
                    makeCell = function (type, args, invoke) {
                        html.td({ cl: aeditor + '-cell-' + type });
                        if (!invoke) {
                            html.input({
                                       cl  : 'bold ' + aeditor + '-' + type,
                                       val : args || ''
                                       });
                        } else {
                            html.use(invoke, args);
                        }
                        html.close('td');
                    };
                makeCell('Remove', { cl: aeditor + '-Remove' }, 'param');
                makeCell('Name', artist.name);
                makeCell('Remove', { cl: aeditor + '-HasAC', type: 'checkbox' }, 'input');
                makeCell('Credit', artist.credit);
                makeCell('Joiner', artist.joiner);
                return html.close('tr').end();
            },
            /**
             * Creates the HTML for an artist editor popup.
             */
            init: function () {
                var edHTMLCache = MusicBrainz.editor.cache.html,
                    mbText   = MusicBrainz.text,
                    aeditor  = 'ArtistEditor',
                    header   = '-Header',
                    html     = MusicBrainz.html().div().table({ id: aeditor })
                                                           .caption()
                                                               .strong()
                                                                   .span(mbText.TrackArtists + '&nbsp;')
                                                                   .span({ id: aeditor + '-TrackTitle' })
                                                               .close('strong')
                                                           .close('caption')
                                                           .col({ id: aeditor + '-Col-Remove' })
                                                           .col({ id: aeditor + '-Col-Name' })
                                                           .col({
                                                                cl: 'hidden',
                                                                id: aeditor + '-Col-Credit',
                                                                span: 2
                                                                })
                                                           .col({ id: aeditor + '-Col-Joiner' })
                                                           .thead()
                                                           .tr({ id: aeditor + header })
                                                               .th()
                                                                   .span({
                                                                         alt : mbText.RemoveArtist,
                                                                         cl  : 'bold',
                                                                         id  : aeditor + header + '-Remove'
                                                                         })
                                                                     .close('span')
                                                                 .close('th');
                    makeCell = function (type, colspan) {
                        colspan = colspan || '';
                        html.th({ colspan: colspan })
                                .span({
                                      cl  : 'bold',
                                      id  : aeditor + header + '-' + type,
                                      val : mbText[aeditor][type]
                                      })
                                  .close('span')
                              .close('th');
                    };
                makeCell('Name');
                makeCell('Credit', 2);
                makeCell('Joiner');
                html.close('tr')
                    .close('thead')
                    .tbody({ id: aeditor + '-Contents' })
                    .close('tbody')
                    .close('table')
                    .close('div')
                    .button({
                            css : MusicBrainz.cache.css.buttonRight,
                            id  : aeditor + '-AddAnother',
                            val : mbText.AddArtistShort
                            })
                    .br()
                    .br()
                edHTMLCache[aeditor] = MusicBrainz.utility.makeHTML.popup('artistEditor', html.end(), '#F1F1F1');
                delete MusicBrainz.editor.artist.editor.init;
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
            delete MusicBrainz.editor.cache.init;
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
            delete MusicBrainz.editor.sidebar.init;
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
                delete MusicBrainz.editor.sidebar.events.showEditFieldsOnClick;
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

        /* Artist-specific */
        $('input.artist').addMBLookup('artist', true);

        /* Sidebar-specific */
        sidebar.init($);

        sidebar.events.showEditFieldsOnClick($);

        MusicBrainz.editor.artist.editor.init();
    }

    /* FOR TESTING ONLY */
    MusicBrainz.html().input({ id: 'foo', cl: 'artist' }).append('#content');
    MusicBrainz.html().input({ id: 'bar', cl: 'artist' }).append('#content');
    /* END TESTING STUFF */


$("#foo").after($(MusicBrainz.editor.cache.html.ArtistEditor))

$('#ArtistEditor-Contents').append($(MusicBrainz.editor.artist.editor.addArtist()))
$('#ArtistEditor-TrackTitle').text("Foooo Barrrr");

}(jQuery));
