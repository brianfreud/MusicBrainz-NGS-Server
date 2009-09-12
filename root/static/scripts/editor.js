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
            baseName: 'ArtistEditor',
            /**
             * Adds an artist row to an artist editor popup.
             * @param {Object} [artist] Artist data to populate the fields
             * @param {Object} [artist.name] The artist's name.
             * @param {Object} [artist.credit] The artist credit
             * @param {Object} [artist.joiner] The join phrase
             * @param {Bool} [includeAC] Should the artist credit fields be included; defaults to false.
             */
            addArtist: function (artist, includeAC) {
                artist = artist || {};
                var aeditor  = this.baseName,
                    html = MusicBrainz.html().tr({ cl: aeditor + '-Artist' }),
                    makeCell = function (type, args, invoke) {
                        html.td({ cl: aeditor + '-cell-' + type });
                        if (!invoke) {
                            html.input({
                                       cl      : aeditor + '-' + type + (type === 'Name' ? ' artist' : ''),
                                       colspan : args.colspan || '',
                                       val     : args.val || ''
                                       }, true);
                        } else {
                            html.use(invoke, args);
                            html.close(invoke);
                        }
                        html.close('td');
                    };
                makeCell('Remove', { cl: aeditor + '-Artist-Remove pointer icon editorIcons removeable' }, 'div');
                makeCell('Name', { val: artist.name, colspan: includeAC ? '' : 3 });
                if (includeAC) {
                    makeCell('Remove', { cl: aeditor + '-AC-Remove pointer icon editorIcons removeable' }, 'div');
                    makeCell('Credit', { val: artist.credit });
                }
                makeCell('Joiner', { val: artist.joiner});
                return html.close('tr').end();
            },
            /**
             * Initializes events and HTML for an artist editor popup.
             */
            init: function () {
                /* Create the HTML. */
                var aeditor  = this.baseName,
                    edHTMLCache = MusicBrainz.editor.cache.html,
                    mbText = MusicBrainz.text,
                    header = '-Header',
                    mbHTML = MusicBrainz.html,
                    originalInput,
                    html   = mbHTML().div().table({ id: aeditor })
                                               .col({ id: aeditor + '-Col-Remove' })
                                               .col({
                                                    id: aeditor + '-Col-Name'
                                                    })
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
                                                       .close('th'),
                    makeCell = function (type, colspan, hide) {
                        colspan = colspan || '';
                        html.th({
                                cl: hide ? 'hidden' : '',
                                colspan: colspan
                                })
                                .span({
                                      cl  : 'bold',
                                      id  : aeditor + header + '-' + type,
                                      val : mbText[aeditor][type]
                                      })
                                  .close('span')
                              .close('th');
                    };
                makeCell('Name');
                makeCell('Credit', 2, true);
                makeCell('Joiner');
                html.close('tr')
                    .close('thead')
                    .tbody({ id: aeditor + '-Contents' })
                    .close('tbody')
                    .close('table')
                    .br()
                    .close('div')
                    .button({
                            id  : aeditor + '-Done',
                            val : mbText.Done
                            })
                    .button({
                            css : MusicBrainz.cache.css.buttonRight,
                            id  : aeditor + '-AddAnother',
                            val : mbText.AddArtistShort
                            });
                edHTMLCache[aeditor] = MusicBrainz.utility.makeHTML.popup('artistEditor', html.end(), '#F1F1F1');

                /* Set the events. */

                /* Click on a 'add another artist' icon. */
                $('#ArtistEditor-AddAnother').live('click', function () {
                    $('#ArtistEditor-Contents').append($(MusicBrainz.editor.artist.editor.addArtist()));
                    MusicBrainz.editor.artist.editor.updateDisplayedFields();
                });
                /* Click on a 'remove artist' icon. */
                $('div.ArtistEditor-Artist-Remove').live('click', function () {
                    $(this).parents('tr').remove();
                    MusicBrainz.editor.artist.editor.updateDisplayedFields();
                });
                /* Click on a 'remove artist credit' icon. */
                $('div.ArtistEditor-AC-Remove').live('click', function () {
                    var $thisTD = $(this).parent();
                    $thisTD.next().remove();
                    $thisTD.remove();
                    MusicBrainz.editor.artist.editor.updateDisplayedFields();
                });
                /* Click on a 'close artist editor' (aka 'Done') button. */
                $('#ArtistEditor-Done').live('click', function () {
                    // TODO: PORT
                    alert('Not implemented yet.');
                    $('#artistEditor_parent').remove();
                });
                /* Click on a 'open artist editor' icon. */
                $('div.makeAE').live('click', function () {
                    var $input = $(this).prev()
                                        .addClass('ArtistEditor-Name');
                    $(this).remove();
                    $(MusicBrainz.editor.cache.html.ArtistEditor).find('#ArtistEditor-Contents')
                                                                 .append($(MusicBrainz.editor.artist.editor.addArtist()))
                                                                 .end()
                                                                 .insertAfter($input)
                                                                 .find('.ArtistEditor-Name:first')
                                                                 .swap($input)
                                                                 .replaceWith(MusicBrainz.html().textarea().close('textarea').end());
                });

                /* Extend MusicBrainz.html().input() to auto-add the artist-editor icon if the 'artist' class will be an attr of the new input. */
                originalInput = mbHTML.constructor.prototype.input;
                mbHTML.constructor.prototype.input = function (args, suppress) {
                    if (typeof suppress === 'undefined' || suppress === false) {
                        if (typeof args !== 'undefined' && args.cl && /(?:^|\s)artist(?:\s|$)/.test(args.cl)) {
                            return originalInput.call(this, args).div({ cl: 'makeAE pointer icon addable' }).close('div');
                        }
                    }
                    return originalInput.call(this, args);
                };
                delete MusicBrainz.editor.artist.editor.init;
            },
            updateDisplayedFields: function () {
                var editorContext = $('#ArtistEditor')[0],
                    $removeArtistButtons = $('div.ArtistEditor-Remove', editorContext),
                    $joinPhraseFields = $('input.ArtistEditor-Joiner', editorContext),
                    $joinPhraseLabel = $('#ArtistEditor-Header-Joiner', editorContext),
                    $ArtistCreditLabel = $('#ArtistEditor-Header-Credit', editorContext),
                    $ArtistCreditFields = $('div.ArtistEditor-AC-Remove', editorContext);
                if ($removeArtistButtons.length === 1) {
                    $removeArtistButtons.css('display', 'none');
                } else {
                    $removeArtistButtons.show();
                }
                if ($joinPhraseFields.length === 1) {
                    $joinPhraseFields.add($joinPhraseLabel).css('display', 'none');
                } else {
                    $joinPhraseFields.add($joinPhraseLabel).show();
                    $joinPhraseFields.filter(':last').css('display', 'none');
                }
                if ($ArtistCreditFields.length === 0) {
                    $ArtistCreditLabel.css('display', 'none');
                } else {
                    $ArtistCreditLabel.show();
                }
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
            showEditFieldsOnClick: function () {
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
        /* Initialize the editor cache. */
        mbEditor.cache.init($);

        /* Add lookups to artist input fields. */
        $('input.artist').addMBLookup('artist', true);

        /* Add the Artist editor trigger icon buttons. */
        $('.artist:not(> .ArtistEditor-cell-Name)').after(MusicBrainz.html().div({ cl: 'pointer icon addable' }).close('div').end());

        /* Initialize the artist editor. */
        MusicBrainz.editor.artist.editor.init();

        /* Sidebar-specific */
        sidebar.init($);
        sidebar.events.showEditFieldsOnClick();
    }

    /* FOR TESTING ONLY */
    MusicBrainz.html().div().input({ id: 'foo', cl: 'artist' }).close('div').append('#content');
    MusicBrainz.html().div().input({ id: 'bar', cl: 'artist' }).close('div').append('#content');
    MusicBrainz.html().div().input({ id: 'pez', cl: 'artist' }).close('div').append('#content');
    MusicBrainz.html().div().input({ id: 'zap', cl: 'artist' }).close('div').append('#content');
    /* END TESTING STUFF */

}(jQuery));
