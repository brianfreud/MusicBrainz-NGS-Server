var MusicBrainz = {

    roundness : "round 6px",

    addToolButton : function (buttonText, buttonID) {
        $("#editMenuControlsInline").append('<input type="button" id="' + buttonID + '" value="' + buttonText + '"/>');
        $("#editMenuControlsInline").show();
        MusicBrainz.setPulloutHeight();
    },
    attachHelpButtonEvents : function (helpArray) {
        $.each(helpArray, function (i) {
            $(helpArray[i][0] + " img").click(function () {
                $("#wikiDocName").html(helpArray[i][1]);
                MusicBrainz.setStatus("Loading documentation, please wait.");
                $("#wikiHelp").html("")
                              .slideDown();
                /* TODO: START: Junk stub code to simulate downloading text. */
                /* Get URL from helpArray[i][2]. */
                setTimeout(function () {
                    $("#wikiHelp").lorem({ type: 'words',amount:'500',ptags:true});
                    $("#wikiHelpBox").slideDown(1000);
                    MusicBrainz.setStatus("Documentation loaded.");
                }, 1000);
                /* END */
            });
        })
    },
    clearHelpMsg : function () {
        $("#editHelpMsg").html("");
    },
    clearStatus : function () {
        $("#editStatusMsg").html("");
    },
    hideErrorForSidebar : function (element) {
        $("#" + element + "-dt").btOff();
    },
    makeEditMenu : function () {
        $("body").append(mb.HTMLsnippets.sideMenu);
        $("#editMenuPullout").corner(MusicBrainz.roundness + " tr")
                             .corner(MusicBrainz.roundness + " br")
                             .mouseover(function () {
                                                    $("#editMenuPullout").hide();
                                                    $("#editMenu").unbind("mouseleave")
                                                                  .stop()
                                                                  .animate({
                                                                            width: "14em"
                                                                            }, 'slow')
                                                                  .children()
                                                                  .show();
                                                    /* The setTimeout here, with the unbind above, avoids a yo-yo effect *
                                                     * due to mouseleave events that would otherwise get triggered while *
                                                     * the menu is displaying.                                           */
                                                    setTimeout(function () {
                                                        $("#editMenu").mouseleave(function () {
                                                            $("#editMenu")
                                                                          .animate({
                                                                                    width: "0px"
                                                                                    }, 'slow', function () {
                                                                                                          $("#editMenu").children()
                                                                                                                        .hide();
                                                                                                          $("#editMenuPullout").show();
                                                                                                          $("#editMenu").hide();
                                                                                    });
                                                            });
                                                        }, 250);
                                                    });
        $("#editMenu").hide();
        $("#editMenuPullout, #editMenu").css('top', $("#editToggle").offset().top + 20);
        /* This next chunk works around a problem present in IE, Chrome, and FireFox, where option lists with long text, such as
         * the very long country names, scroll right off the page.  This problem is not present in how Safari and Opera handle
         * long option text, so those are left to operate normally, without the workaround. */
        if (!$.browser.safari && !$.browser.opera) {
            $("#select-edit-release-country").hoverIntent({
                interval: 1
            });
            $("#select-edit-release-country").hoverIntent(function () {
                $(this).removeClass("width100", "normal")
                       .addClass("shiftSelect", "normal");
            },
            function () {
                $(this).addClass("width100", "normal")
                       .removeClass("shiftSelect", "normal");
            });
        }
    },
    makeCountryList : function () {
        var countrySelect = $("#select-edit-release-country");
        $.each(mb.country, function (i) {
            /* Add country <option> to the <select>. */
            countrySelect.addOption(mb.country[i][0], mb.country[i][1]);
            /* This next pushes CSS2 engines and only works in FireFox at the moment.  As the results either look really
             * ugly or do nothing at all in the other browsers, don't even try to do it on any browser but FireFox. */
            if ($.browser.mozilla) {
                /* Add flag icon to the left of the <option>'s text. */
                countrySelect.children(":last")
                             .before($("<optgroup/>").css({
                                                          background: "url(/static/images/icon/flags.png) no-repeat " + mb.country[i][3] + "px"
                                                          })
                                                     .addClass("icon")
                             );
            }
        });
    },
    makeFormatList : function () {
        var otherVal,
            formatSelect = $("#select-edit-release-format");
        $.each(mb.format, function (i) {
            mb.format[i][0] != 13 ? formatSelect.addOption(mb.format[i][0],mb.format[i][2]) : otherVal = i;
            formatSelect.children(':last').data("start_date",mb.format[i][1]);
        });
        formatSelect.sortOptions()
                    .val("")
                    .addOption(mb.format[otherVal][0],mb.format[otherVal][2]); // Add the option for "Other" to the end of the list.
        formatSelect.children(':last').data("start_date", "");
        formatSelect.children(':first').attr("selected", "selected");
    },
    makeStatusAndDocsBox : function () {
        $(".tabs:eq(0)").after(mb.HTMLsnippets.editBox + mb.HTMLsnippets.docsBox);
        $("#editMsgBox").corner(MusicBrainz.roundness);
        $("#editMsg").corner(MusicBrainz.roundness);
        $("#wikiHelpBox").corner(MusicBrainz.roundness);
        $("#wikiHelpInnerBox").corner(MusicBrainz.roundness);
    },
    makeSwappableSelectList : function (entity, toSwap, swapArray) {
        var swapList = "#select-edit-" + entity + "-" + toSwap,
            swapButton = "btn-switch-" + toSwap + "-list";
        $('.' + entity + '-' + toSwap + ':not(dt)').toggle();
        $(swapList).after('<input type="button" value="' + text.FullList + '" id="' + swapButton + '"/>');
        swapButton = '#' + swapButton;
        $(swapButton).addClass("rightsidebutton").click(function () {
            MusicBrainz.swapShortLongList($(swapList), $(swapButton), mb.commonLangs, swapArray);
        });
        MusicBrainz.setHoverMsg([[swapButton, text.hoverSwapList]]);
        $(swapButton).mouseout(function () { MusicBrainz.clearHelpMsg(); });
    },
    makeTogglable : function (togglableItemArray) {
        $.each(togglableItemArray, function () {
            var toggleclass = this;
            $('.editable.' + toggleclass).click(function () {
                $('.' + toggleclass + ':not(dt)').toggle();
            });
        });
    },
    makeTogglableEachInGroup : function (togglableItemArray) {
        $.each(togglableItemArray, function () {
            var toggleclass = this;
            $('.editable.' + toggleclass).each(function (i) {
                $(this).click(function () { // We cannot just toggle toggleclass, as we only want to swap the one item, not the whole group.
                    $('.editable.' + toggleclass + ':eq(' + i + ')').hide(); // Hide the specific item's text.
                    $('.hidden.' + toggleclass + ':eq(' + i + ')').show(); // Show the specific item's form field.
                });
            });
        });
    },
    setHelpMsg : function (status) {
        $("#editHelpMsg").html(status);
    },
    setHoverMsg : function (hoverArray) {
        jQuery.each(hoverArray, function (i) {
            $(hoverArray[i][0]).mouseover(function () { MusicBrainz.setHelpMsg(hoverArray[i][1]); });
        });
    },
    setPulloutHeight : function () {
        var pulloutHeight = ($("#editMenu").height() + 10) + "px";
        $("#editMenuPullout").css({
                                  height: pulloutHeight,
                                  lineHeight: pulloutHeight,
                                  });
    },
    setStatus : function (status, showThrobber) {
        if (showThrobber) {
            status = '<img src="/static/images/loading-small.gif">&nbsp;' + status;
        }
        $("#editStatusMsg").html(status);
    },
    /* Note: Due to a selector problem with ExplorerCanvas in MSIE, the selector passed here must be an id, not a class or other selector. */
    showErrorForSidebar : function (element, errorMessage) {
        $("#" + element + "-dt").bt(errorMessage, {
                                    spikeLength: 30,
                                    positions: 'left',
                                    fill: '#FEEECD',
                                    trigger: '',
                                    shrinkToFit: 'true'
        }).btOn();
    },
    swapShortLongList : function (select, button, commonarray, bigarray) {
        if (typeof(select.selectedValues()[0]) != "undefined") { // If there actually is a currently selected item,
            var selecteditem = select.selectedValues()[0]; // then store the currently selected item.
        }
        select.hide(); // Avoid needless (and very slow) DOM redraws.
        select.removeOption(/./); // Empty the select list.
        if (button.attr("value") == text.FullList) { // Switch to the full list.
            button.attr("value", text.ShortList); // Change the text on the button.
            select.addOption(bigarray, false); // Populate the select list.
        } else { // Switch to the short list.
            button.attr("value", text.FullList); // Change the text on the button.
            if ($.inArray(parseInt(selecteditem, 10), commonarray) == -1 && typeof(selecteditem) != "undefined") {
                if (typeof(bigarray[selecteditem]) != "undefined") { // Make sure the selected item is in the list,
                    select.addOption(selecteditem, bigarray[selecteditem]); // even if it isn't in the short list.
                }
            }
            $.each(commonarray, function () {
                select.addOption(parseInt(this, 10), bigarray[parseInt(this, 10)]); // Populate the select list.
            });
        }
        select.addOption("", '[ ' + text.Select + ' ]', false); // Reset the displayed text for the non-option option.
        select.val(selecteditem); // Re-select the selected item.
        select.show();
    }
};

$(function () {
   /* === Editor Initialization === */

    /* Insert help icons. */
    $(".datumItem dt, th.release").prepend('<img src="/static/images/blank.gif" class="helpIcon"/>&nbsp;');

    /* Expand tracklist position and duration columns slightly, to accomodate the help icons without wrapping. */
    $("th.release:first").css({width: "3em"});
    $("th.release:last").css({width: "6em"});

    /* Insert the status and heads-up display box. */
    MusicBrainz.makeStatusAndDocsBox();

    /* Initialize the display text box. */
    MusicBrainz.setStatus(text.LoadingJS, true);

   /* Create and attach click event for the documentation display close button. */
    var closeButton = $('<img src="/static/images/blank.gif" class="closeButton"/>');
    $("#wikiTitle").prepend(closeButton);
    closeButton.click(function () {
        $("#wikiHelpBox").slideUp(1000);
    });

    /* Disable default behaviour for anchor links. */
    $(".editable a").bind("click.blocked", function (event) {
        event.preventDefault();
    });

   /* Create and initialize the side menu. */
    MusicBrainz.makeEditMenu();
    MusicBrainz.setPulloutHeight();

   /* Set click behaviour for editable fields (where there is qty 1 of that field type). */
    MusicBrainz.makeTogglable([
                              /* Definitions for entity type: Release */
                              ['release-date'],
                              'release-format',
                              'release-packaging',
                              'release-status',
                              'release-type'
                              ]);

    /* Add background and cursor hover behaviours for editable fields. */
    $(".editable").each(function (event) {
        $(this).addClass('highlight')
               .css("cursor", "pointer");
    });

    /* Set up autotabbing and limit input to \d only for date and barcode fields. */
    $('#edit-release-date-y').autotab({ target: 'edit-release-date-m', format: 'numeric',                                  maxlength: '4' });
    $('#edit-release-date-m').autotab({ target: 'edit-release-date-d', format: 'numeric', previous: 'edit-release-date-y', maxlength: '2' });
    $('#edit-release-date-d').autotab({                                format: 'numeric', previous: 'edit-release-date-m', maxlength: '2' });
    $("input[id$='edit-release-barcode']").attr("maxlength", 15) // EAN13 + EAN2, 15 digit maximum length
                                          .autotab({format: 'numeric'});

    /* Populate the simple select lists. */
    $("#select-edit-release-type").addOption(mb.releasetype, false);
    $("#select-edit-release-packaging").addOption(mb.packaging, false);
    $("#select-edit-release-status").addOption(mb.releasestatus, false);

    /* Populate the format list, in alphabetical order, and with "Other" at the bottom. */
    MusicBrainz.makeFormatList();

    /* Setup and initialize language and script selects.  */
    $('.editable.release-language').click(function () {
        MusicBrainz.makeSwappableSelectList("release", "language", mb.language);
    });
    $('.editable.release-script').click(function () {
        MusicBrainz.makeSwappableSelectList("release", "script", mb.script);
    });

    /* Set hover help texts. */
    MusicBrainz.setHoverMsg([
                            /* Definitions for entity type: Release */
                            [".editable.release-barcode", text.hoverBarcode],
                            [".editable.release-catalog", text.hoverCatNumber],
                            [".editable.release-country", text.hoverCountry],
                            [".editable.release-date", text.hoverDate],
                            [".editable.release-format", text.hoverFormat],
                            [".editable.release-language", text.hoverLanguage],
                            [".editable.release-script", text.hoverScript],
                            [".editable.release-label", text.hoverLabel],
                            [".editable.release-packaging", text.hoverPackaging],
                            [".editable.release-status", text.hoverStatus],
                            [".editable.release-type", text.hoverType],
                            [".helpIcon", text.hoverHelp],
                            ["#btnTrackParser", text.hoverTP]
                            ]);
    $(".editable, .helpIcon, #btnTrackParser").mouseout(function () {
                                                         MusicBrainz.clearHelpMsg();
                                                         });

    /* Attach click events to the help buttons. */
    MusicBrainz.attachHelpButtonEvents([
                                       /* Definitions for entity type: Release */
                                       ["#release-date-dt", text.displayReleaseDate, "http://"],
                                       ["#release-type-dt", text.displayReleaseType, "http://"],
                                       ["#release-format-dt", text.displayReleaseFormat, "http://"],
                                       ["#release-packaging-dt", text.displayReleasePackaging, "http://"],
                                       ["#release-status-dt", text.displayReleaseStatus, "http://"],
                                       ["#release-language-dt", text.displayReleaseLanguage, "http://"],
                                       ["#release-script-dt", text.displayReleaseScript, "http://"],
                                       ["dt[id^=release-label]", text.displayLabel, "http://"],
                                       ["dt[id^=release-catalog]", text.displayCatalogNumber, "http://"],
                                       ["dt[id^=release-barcode]", text.displayBarcode, "http://"],
                                       ["dt[id^=release-country]", text.displayCountry, "http://"],
                                       ["th.release:eq(0)", text.displayTrackNumber, "http://"],
                                       ["th.release:eq(1)", text.displayTrackTitle, "http://"],
                                       ["th.release:eq(2)", text.displayTrackArtist, "http://"],
                                       ["th.release:eq(3)", text.displayTrackDuration, "http://"]
                                       ]);

   /* === Bring existing data into the editor. === */

    /* Set the selected language and script, if there is a pre-existing selected one. */
    $("#select-edit-release-language").addOption($("#edit-release-language-value").val(), "");
    MusicBrainz.swapShortLongList($("#select-edit-release-language"), $("#btn-switch-language-list"), mb.commonLangs, mb.language);
    $("#select-edit-release-script").addOption($("#edit-release-script-value").val(), "");
    MusicBrainz.swapShortLongList($("#select-edit-release-script"), $("#btn-switch-script-list"), mb.commonScripts, mb.script);

/* TODO: Also pre-populate:
                          * Release Date
                          * Type
                          * Format
                          * Packaging
                          * Status
                          * Labels
                          * Cat #s
                          * Barcodes
                          * Countries */


/* Everything below is rough code in progress. */

// TODO:   /* Set click behaviour for editable fields (where there is more than one of that field type). */
    MusicBrainz.makeTogglable([
                              'release-barcode',
                              'release-catalog',
                              'release-country',
                              'release-label'
                              ]);

// TODO: There can be more than one country dropdown.
    MusicBrainz.makeCountryList();

// TODO: Test using makeTogglableEachInGroup instead here, once loading release data is function.
    $(".editable.trackposition").each(function (i) {
        $(this).click(function () {
            $(".editable.trackposition:eq(" + i + ")").hide();
            $(".hidden.trackposition:eq(" + i + ")").show();
        });
    });
    $(".editable.trackname").each(function (i) {
        $(this).click(function () {
            $(".editable.trackname:eq(" + i + ")").hide();
            $(".hidden.trackname:eq(" + i + ")").show();
        });
    });
    $(".editable.trackartist").each(function (i) {
        $(this).click(function () {
            $(".editable.trackartist:eq(" + i + ")").hide();
            $(".hidden.trackartist:eq(" + i + ")").show();
        });
    });
    $(".editable.trackdur").each(function (i) {
        $(this).click(function () {
            $(".editable.trackdur:eq(" + i + ")").hide();
            $(".hidden.trackdur:eq(" + i + ")").show();
        });
    });





    MusicBrainz.setStatus(text.EditorReady, false);
});

// MusicBrainz.showErrorForSidebar("release-date", "FOO");

MusicBrainz.initializeTrackParser = function () {
    /* Insert the track parser into the document. */
    $(".tbl.release").before(mb.HTMLsnippets.trackParser);
    /* Create the tool button. */
    MusicBrainz.addToolButton("Show Track Parser", "btnTrackParser");
    /* Set the click event controls for the Show / Hide Track Parser button. */
    $("#btnTrackParser").click(function () {
        if ($(this).val() == text.TrackParserShow) { // Show the track parser.
            $("#js-fieldset-tp").show();
            $(this).val(text.TrackParserHide);
        } else { // Hide the track parser.
            $("#js-fieldset-tp").hide();
            $(this).val(text.TrackParserShow);
        }
    });
    /* Set auto-newline correction and textarea height auto-adjustment for the track parser input field. */
    $('#tp-textarea').keypress(function () {
        var rows = $('#tp-textarea').val().match(/\n/g).length;
        rows === null ? 1 : rows;
        $('#tp-textarea').attr("rows", rows);
    });
}

$(function () {
    MusicBrainz.initializeTrackParser();
});
