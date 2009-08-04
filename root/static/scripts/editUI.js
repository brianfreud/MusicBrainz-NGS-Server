/*jslint undef: true, browser: true*/
/*global jQuery, $, mb, text*/

var experimental = false;

var charMap = {
    characters : {
        name: 'Characters',
        className: "characters",
        dropMenu: []
    },
    symbols : {
        name: 'Symbols',
        className: "symbols",
        dropMenu: []
    }
}

var MusicBrainz = {

    artistData : new Object(),

    roundness  : "round 6px",

    markup     : {
                 wiki : {
                         nameSpace: 'wiki',
                         onTab: {
                                keepDefault:false,
                                openWith:'    '
                         },
                         markupSet: [
                                    {name:'Bold', className:"editor strong", key:'b', openWith:"'''", closeWith:"'''", placeHolder:'( ' + text.InsertTextBold + ' )' },
                                    {name:'Italic', className:"editor em", key:'i', openWith:"''", closeWith:"''", placeHolder:'( ' + text.InsertTextItalic + ' )' },
                                    {separator:'---------------' },
                                    {name:'Heading 1', className:"editor h1", key:'1', openWith:'= ', closeWith:' =', placeHolder:'( ' + text.InsertTitle + ' )' },
                                    {name:'Heading 2', className:"editor h2", key:'2', openWith:'== ', closeWith:' ==', placeHolder:'( ' + text.InsertTitle + ' )' },
                                    {name:'Heading 3', className:"editor h3", key:'3', openWith:'=== ', closeWith:' ===', placeHolder:'( ' + text.InsertTitle + ' )' },
                                    {name:'Heading 4', className:"editor h4", key:'4', openWith:'==== ', closeWith:' ====', placeHolder:'( ' + text.InsertTitle + ' )' },
                                    {name:'Heading 5', className:"editor h5", key:'5', openWith:'===== ', closeWith:' =====', placeHolder:'( ' + text.InsertTitle + ' )' },
                                    {name:'Heading 6', className:"editor h6", key:'6', openWith:'====== ', closeWith:' ======', placeHolder:'( ' + text.InsertTitle + ' )' },
                                    {separator:'---------------' },
                                    {name:'Hard rule', className:"editor hr", openWith:'\n----\n'},
                                    {name:'Paragraph', className:"editor p", openWith:'\n', closeWith:'\n' },
                                    {name:'Preformatted Text', className:"editor precode", openWith:'        ', placeHolder:'( ' + text.InsertTextPreformat + ' )' },
                                    {name:'Link to URL', key:'l', className:"editor a", openWith:'[[![Url:!:http://]!]|', closeWith:']', placeHolder:'( ' + text.InsertTextURL + ' )' },
                                    {separator:'---------------' },
                                    {name:'Bulleted list', className:"editor ul", 
                                     replaceWith: function (markItUp) {
                                             var selectedText = markItUp.selection;
                                             selectedText = selectedText.replace(/^\s{4}[\*(a.)]\s/gm,""); // Remove existing <li>s.
                                             selectedText = "    * " + selectedText.replace(/\n/g,"\n    * ") + "\n";
                                             return selectedText.replace(/\n$/g,"");;
                                         }
                                    },
                                    {name:'Numbered list', className:"editor ol",
                                     replaceWith: function (markItUp) {
                                             var selectedText = markItUp.selection;
                                             selectedText = selectedText.replace(/^\s{4}[\*(a.)]\s/gm,""); // Remove existing <li>s.
                                             selectedText = "    a. " + selectedText.replace(/\n/g,"\n    a. ") + "\n";
                                             return selectedText.replace(/\n$/g,"");
                                         }
                                    },
                                    {separator:'---------------' },
                                    charMap.characters,
                                    charMap.symbols,
                                    {separator:'---------------' },
                                    {name:'Preview',
                                     className:"preview",
                                     call:'preview',
                                     afterInsert: function () {
                                                      setTimeout(function () {
                                                          var previewWindow = $(".markItUpPreviewFrame")[0].contentWindow.document;
                                                          previewWindow.open().close();
                                                          /* The next replace() works around an open bug w/ "    a. " in convertToHTML. (There is the
                                                             reverse bug in Text::Wikiformat, such that it *only* supports numeric lists, but only if
                                                             they are defined using alphabetic markup syntax, so this workaround actually ends up
                                                             generating the correct ol type, even though it initially seems backwards. */
                                                          $("body", previewWindow).append(convertToHTML($("#annotation").val().replace(/^(\s{4,})a\.\s/gm,"$11. ").replace(/<ol>/g,'<ol type="1">')));
                                                      }, 1);
                                                  }
                                    }
                                    ]
                     },
                 html : {
                        nameSpace: 'html',
                        onTab: {
                               keepDefault:false,
                               openWith:'    '
                        },
                        markupSet: [
                                   {name:'Bold', className:"editor strong", key:'b', openWith:'<strong>', closeWith:'</strong>', placeHolder:'( ' + text.InsertTextBold + ' )'},
                                   {name:'Italic', className:"editor em", key:'i', openWith:'<em>', closeWith:'</em>', placeHolder:'( ' + text.InsertTextItalic + ' )'},
                                   {separator:'---------------' },
                                   {name:'Heading 1', className:"editor h1", key:'1', openWith:'<h1(!( class="[![Class]!]")!)>', closeWith:'</h1>', placeHolder:'( ' + text.InsertTitle + ' )'},
                                   {name:'Heading 2', className:"editor h2", key:'2', openWith:'<h2(!( class="[![Class]!]")!)>', closeWith:'</h2>', placeHolder:'( ' + text.InsertTitle + ' )'},
                                   {name:'Heading 3', className:"editor h3", key:'3', openWith:'<h3(!( class="[![Class]!]")!)>', closeWith:'</h3>', placeHolder:'( ' + text.InsertTitle + ' )'},
                                   {name:'Heading 4', className:"editor h4", key:'4', openWith:'<h4(!( class="[![Class]!]")!)>', closeWith:'</h4>', placeHolder:'( ' + text.InsertTitle + ' )'},
                                   {name:'Heading 5', className:"editor h5", key:'5', openWith:'<h5(!( class="[![Class]!]")!)>', closeWith:'</h5>', placeHolder:'( ' + text.InsertTitle + ' )'},
                                   {name:'Heading 6', className:"editor h6", key:'6', openWith:'<h6(!( class="[![Class]!]")!)>', closeWith:'</h6>', placeHolder:'( ' + text.InsertTitle + ' )'},
                                   {separator:'---------------' },
                                   {name:'Hard rule', className:"editor hr", openWith:'<hr/>'},
                                   {name:'Paragraph', className:"editor p", openWith:'<p>', closeWith:'</p>' },
                                   {name:'Preformatted Text', key:'c', className:"editor precode", openWith:'<pre><code>', closeWith:'</pre></code>', placeHolder:'( ' + text.InsertTextPreformat + ' )'},
                                   {name:'Link to URL', key:'l', className:"editor a", openWith:'<a href="[![Link:!:http://]!]">', closeWith:'</a>', placeHolder:'( ' + text.InsertTextURL + ' )' },
                                   {separator:'---------------' },
                                   {name:'Bulleted List', className:"editor ul", openWith:'<ul>\n', closeWith:'\n</ul>',
                                     replaceWith: function (markItUp) {
                                             var selectedText = markItUp.selection;
                                             selectedText = selectedText.replace(/(<\/?li>|<\/?[uo]l>)/g,""); // Remove existing <li>s.
                                             selectedText = "    <li>" + $.trim(selectedText).replace(/\n/g,"</li>\n    <li>") + "</li>";
                                             return selectedText;
                                         }
                                    },
                                   {name:'Numbered List', className:"editor ol", openWith:'<ol>\n', closeWith:'\n</ol>',
                                     replaceWith: function (markItUp) {
                                             var selectedText = markItUp.selection;
                                             selectedText = selectedText.replace(/(<\/?li>|<\/?[uo]l>)/g,""); // Remove existing <li>s.
                                             selectedText = "    <li>" + $.trim(selectedText).replace(/\n/g,"</li>\n    <li>") + "</li>";
                                             return selectedText;
                                         }
                                    },
                                   {name:'List Item', className:"editor li", openWith:'    <li>', closeWith:'</li>\n', placeHolder:'( ' + text.InsertListItem + ' )'},
                                    {separator:'---------------' },
                                    charMap.characters,
                                    charMap.symbols,
                                   {separator:'---------------' },
                                   {name:'Preview', className:"preview", call:'preview'}
                                   ]
                        }
                 },

    activateAnnotationSwitcher : function () {
        $('#ChangeMarkup li:not(:first)').click(function () {
            $('#ChangeMarkup li').removeClass('currentSet');
            newSet = $(this).attr('class');
            $(this).addClass('currentSet');
            $('#annotation').markItUpRemove();
            switch (newSet) {
                case 'wiki':
                    $('#annotation').val(convertToMarkup($("#annotation").val()));
                    $('#annotation').markItUp(MusicBrainz.markup.wiki);
                    break;
                case 'html':
                    $('#annotation').val(convertToHTML($("#annotation").val().replace(/^(\s{4,})a\.\s/gm,"$11. ").replace(/<ol>/g,'<ol type="1">')));
                    $('#annotation').markItUp(MusicBrainz.markup.html);
                    break;
                default:
                }
            return false;
        });
    },

    addAnnotationButton : function () {
        /* Create the tool button. */
        MusicBrainz.addToolButton(text.AnnotationEditorShow, "btnAnnotationEditor");
        /* Set the click event controls for the Show / Hide Annotation Editor button. */
        $("#btnAnnotationEditor").click(function () {
            if ($(this).val() == text.AnnotationEditorShow) { // Show the track parser.
                $(".annotationFS").show();
                $(this).val(text.AnnotationEditorHide);
            } else { // Hide the track parser.
                $(".annotationFS").hide();
                $(this).val(text.AnnotationEditorShow);
            }
        });
    },

    addAnnotationSwitcher : function () {
        $('#annotation').before('<ul id="ChangeMarkup">' +
                                    '<li>' +
                                        text.MarkupLanguage +
                                    ' </li>' +
                                    '<li class="wiki currentSet">' +
                                        '<a href="#">' +
                                            text.Wiki +
                                        '</a>' +
                                    '</li>' +
                                    '<li class="html">' +
                                        '<a href="#">' +
                                            text.HTML +
                                        '</a>' +
                                    '</li>' +
                                '</ul>');
        if (experimental) {
            $('#annotation').before('<br/><br/><em>Note: Converting from HTML to Wikiformat and editing using HTML mode are both experimental at the moment!</em>');
        }
    },

    addSingleArtist : function (whereClicked) {
        var targetArtists = $(whereClicked).parents("table:first"),
            artistRows = targetArtists.find(".addartist"),
            mNum = 0, // TODO: Add medium handling to the artist functions
            tNum = parseInt($(whereClicked).attr("id").replace("btnAddTA-",""),10);
        targetArtists.find(".joinerlabel strong, .joiner")
                  .removeClass("hidden");  // Show the "Joiner" header text.
        $(artistRows).filter(":last")
                     .after(MusicBrainz.makeHTMLNewArtist(tNum, mNum)) // Insert the new artist row.
        MusicBrainz.updateComboArtist($(artistRows[0])); // Update the displayed "combo artist" to include the new join phrases.
        MusicBrainz.updateJoinPhrases(targetArtists.find(".addartist"));
    },

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
        });
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
                                                                            width: "17em"
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
                interval: 1,
                sensitivity: 1,
                timeout: 300,
                over: function () {
                                  /* Expand the select's width, and bump it to the left. */
                                  $(this).removeClass("width100", "normal")
                                         .addClass("shiftSelect", "normal");
                                  },
                out: function () {
                                  /* Return the select to normal width and position. */
                                 $(this).addClass("width100", "normal")
                                        .removeClass("shiftSelect", "normal");
                                 }
            }).change(function () {
                                  /* Make the action of the select returning to normal width and position act more responsively when
                                   * the user makes a selection. (The hoverIntent event takes 300 extra ms to take notice and act.) */
                                  $(this).addClass("width100", "fast")
                                         .removeClass("shiftSelect", "fast");
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
            if (mb.format[i][0] != 13) {
                formatSelect.addOption(mb.format[i][0],mb.format[i][2]);
            } else {
                otherVal = i;
            }
            formatSelect.children(':last').data("start_date",mb.format[i][1]);
        });
        formatSelect.sortOptions()
                    .val("")
                    .addOption(mb.format[otherVal][0],mb.format[otherVal][2]); // Add the option for "Other" to the end of the list.
        formatSelect.children(':last').data("start_date", "");
        formatSelect.children(':first').attr("selected", "selected");
    },

    makeHTMLNewArtist : function(trackNum, mediumNum, artistName, joinPhrase) {
        mediumNum = (typeof(mediumNum) == "undefined") ? 0 : mediumNum;
        artistName = (typeof(artistName) == "undefined") ? "" : artistName;
        joinPhrase = (typeof(joinPhrase) == "undefined") ? "" : joinPhrase;
        return '<tr class="editartist addartist ' + trackNum + '">' +
                   '<td class="empty">' +
                       '<img src="/static/images/blank.gif" class="removeArtist"  alt="' + text.RemoveArtist + '" title="' + text.RemoveArtist + '"/>' +
                       '<input id="ta-name-' + trackNum + '" type="text" class="name" value="' + artistName + '"/>' +
                   '</td>' +
                   '<td class="joiner">' +
                       '<input id="ta-joiner-' + trackNum + '" type="text" class="joiner" value="' + joinPhrase + '"/>' +
                   '</td>' +
               '</tr>';
    },

    makeStatusBox : function () {
        $("table.tbl > thead:eq(0) > tr:eq(0) > th:eq(1)").append(mb.HTMLsnippets.editBox);
        $(".tabs:eq(0)").after(mb.HTMLsnippets.docsBox);
        $("#editMsgBox").corner(MusicBrainz.roundness);
        $("#editMsg").corner(MusicBrainz.roundness);
        $("#wikiHelpBox").corner(MusicBrainz.roundness);
        $("#wikiHelpInnerBox").corner(MusicBrainz.roundness);
    },

    makeSwappableSelectList : function (entity, toSwap, commonArray, swapArray) {
        var swapList = "#select-edit-" + entity + "-" + toSwap,
            swapButton = "btn-switch-" + toSwap + "-list";
        $('.' + entity + '-' + toSwap + ':not(dt)').toggle();
        $(swapList).after('<input type="button" value="' + text.FullList + '" id="' + swapButton + '"/>');
        swapButton = '#' + swapButton;
        $(swapButton).addClass("rightsidebutton").click(function () {
            MusicBrainz.swapShortLongList($(swapList), $(swapButton), commonArray, swapArray);
        });
    },

    makeTogglable : function (togglableItemArray) {
        $.each(togglableItemArray, function () {
            var toggleclass = this;
            $('.editable.' + toggleclass).click(function () {
                $('.' + toggleclass).filter(":not(dt)")
                                    .toggle()
                                    .find("input:first")
                                    .focus();
            });
        });
    },

    makeTogglableEachInGroup : function (togglableItemArray) {
        $.each(togglableItemArray, function () {
            var toggleclass = this;
            $('.editable.' + toggleclass[0]).each(function (i) {
                $(this).click(function () { // We cannot just toggle toggleclass, as we only want to swap the one item, not the whole group.
                    $('.editable.' + toggleclass[0] + ':eq(' + i + ')').hide(); // Hide the specific item's text.
                    if(typeof(toggleclass[1]) != 'undefined') {
                        if(toggleclass[1]) {
                            $('.hidden.' + toggleclass[0] + ':eq(' + i + ') textarea').autogrow({ minHeight: 10 });
                        }
                    }
                    if(typeof(toggleclass[2]) != 'undefined') {
                        $('.hidden.' + toggleclass[2] + '.' + i).show();
                    }
                    $('.hidden.' + toggleclass[0] + ':eq(' + i + ')').show() // Show the specific item's form field.
//                                                                     .if_($(this).find('input, textarea[readonly!=readonly]').length > 0)
                                                                         .find('input, textarea[readonly!=readonly]')
                                                                         .focus()
//                                                                     .else_()
//                                                                         .parent()
//                                                                         .find('tr:eq(2) input')
//                                                                         .focus()
                });
            });
        });
    },

    populateCharArrays : function () {
        chars = [
                ["Á",1],["Ć",1],["É",3],["Í",2],["Ĺ",1],["Ń",0],["Ó",2],["Ŕ",0],["Ś",1],["Ú",3],["Ý",0],["Ź",0],
                ["á",1],["ć",1],["é",3],["í",2],["ĺ",1],["ń",0],["ó",2],["ŕ",0],["ś",1],["ú",3],["ý",0],["ź",0],
                ["À",3],["È",2],["Ḥ",0],["Ì",3],["Ḷ",0],["Ṃ",0],["Ṇ",0],["Ò",2],["Ṛ",0],["Ṣ",0],["Ṭ",0],["Ù",4],
                ["à",3],["è",2],["ḥ",0],["ì",3],["ḷ",0],["ṃ",0],["ṇ",0],["ò",2],["ṛ",0],["ṣ",0],["ṭ",0],["ù",4],
                ["Â",1],["Ĉ",0],["Ḍ",0],["Ê",1],["Ĝ",0],["Ĥ",0],["Î",0],["Ĵ",4],["Ô",3],["Ŝ",1],["Û",1],["Ŵ",1],["Ŷ",1],
                ["â",1],["ĉ",0],["ḍ",0],["ê",1],["ĝ",0],["ĥ",0],["î",0],["ĵ",4],["ô",3],["ŝ",1],["û",1],["ŵ",1],["ŷ",1],
                ["Ä",3],["Ë",3],["Ï",2],["Ḹ",2],["Ö",5],["Ü",3],["Ÿ",1],
                ["ä",3],["ë",3],["ï",2],["ḹ",2],["ö",5],["ü",3],["ÿ",1],
                ["Ã",3],["Ẽ",3],["Ĩ",4],["Ñ",0],["Õ",5],["Ũ",3],["Ỹ",1],
                ["ã",3],["ẽ",3],["ĩ",4],["ñ",0],["õ",5],["ũ",3],["ỹ",1],
                ["Å",1],["Ç",0],["Đ",0],["Ə",1],["Ģ",3],["Ķ",0],["Ļ",1],["Ņ",3],["Ŗ",0],["Ş",0],["Ţ",6],
                ["å",1],["ç",0],["đ",0],["ə",1],["ģ",3],["ķ",0],["ļ",1],["ņ",3],["ŗ",0],["ş",0],["ţ",6],
                ["Ǎ",1],["Č",0],["Ď",0],["Ě",3],["Ǐ",1],["Ľ",1],["Ň",0],["Ǒ",2],["Ř",0],["Š",0],["Ť",0],["Ǔ",4],["Ž",0],
                ["ǎ",1],["č",0],["ď",0],["ě",3],["ǐ",1],["ľ",1],["ň",0],["ǒ",2],["ř",0],["š",0],["ť",0],["ǔ",4],["ž",0],
                ["Ā",2],["Ð",0],["Ē",3],["Ī",5],["Ō",5],["Ū",3],["Ȳ",1],
                ["ā",2],["ð",0],["ē",3],["ī",5],["ō",5],["ū",3],["ȳ",1],
                ["Ă",3],["Ĕ",1],["Ğ",1],["Ĭ",5],["Ŏ",5],["Ŭ",5],
                ["ă",3],["ĕ",1],["ğ",1],["ĭ",5],["ŏ",5],["ŭ",5],
                ["Æ",1],["Ċ",1],["Ė",1],["Ġ",1],["İ",16],["Ż",0],
                ["æ",1],["ċ",1],["ė",1],["ġ",1],["ı",16],["ż",0],
                ["Ą",3],["Ę",3],["Į",5],["Ǫ",5],["Ų",4],["þ",0],
                ["ą",3],["ę",3],["į",5],["ǫ",5],["ų",4],["Þ",0],
                ["Ǣ",0],["Ħ",0],["Ł",0],["Ŀ",0],["Ő",0],["Ø",0],["Œ",0],["Ṝ",0],["Ů",0],["Ű",16],
                ["ǣ",0],["ħ",0],["ł",0],["ŀ",0],["ő",0],["ø",0],["œ",0],["ṝ",0],["ß",0],["ů",0],["ǘ",0],["ǜ",0],["ǚ",0],["ǖ",0],["ű",0]
                ];
        for (var i=0; i < chars.length; i++) {
            charMap.characters.dropMenu[i] = {
                                             name      : chars[i][0],
                                             openWith  : chars[i][0],
                                             className : "skip" + chars[i][1]
                                             };
        }
        symbols = ["¿","†","‡","↔","↑","↓","•","∞","¶","½","⅓",
                   "⅔","¼","¾","⅛","⅜","⅝","⅞","«","»","¤","₳",
                   "฿","₵","¢","₡","₢","$","₫","₯","€","₠","₣",
                   "ƒ","₴","₭","₤","₥","₦","№","₧","₰","£","៛",
                     "₨","₪","৳","₮","₩","¥","♠","♣","♥","♦","²","³",
                   "®","©","™"];
        for (var i=0; i < symbols.length; i++) {
            charMap.symbols.dropMenu[i] = {
                                          name      : symbols[i],
                                          openWith  : symbols[i],
                                          className : "skip0"
                                          };
        }
        charMap.symbols.dropMenu[charMap.symbols.dropMenu.length] = { name: "[", openWith: "&91;", className: "skip0" };
        charMap.symbols.dropMenu[charMap.symbols.dropMenu.length] = { name: "]", openWith: "&93;", className: "skip0" };
    },

    setPulloutHeight : function () {
        var pulloutHeight = ($("#editMenu").height() + 10) + "px";
        $("#editMenuPullout").css({
                                  height: pulloutHeight,
                                  lineHeight: pulloutHeight
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

    stripeTracks : function () {
        $("table.tbl > tbody").each(function () {
                                   $(this).children("tr")
                                          .removeClass("ev") // Unstripe the tracks.
                                          .filter(":visible:even")
                                          .addClass("ev"); // Restripe the tracks, using the new ordering.
        });
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
    },

    updateComboArtist : function (artist) {
        var targetArtists = $(artist).parents("table:first"),
            comboArtist = "",
            removeArtistButtons = targetArtists.find(".removeArtist");
        $(targetArtists).find('input[type=text]:not(:last)') // Get all input fields except the last (which is the joiner after the last artist).
                     .each(function (i) {
                                       var inputValue = $.trim($(this).val());
                                       if (i % 2) { // Input field is an artist name field
                                           comboArtist += (inputValue == ",") ? "" : " ";
                                           comboArtist += (inputValue + " ");
                                       } else {
                                           comboArtist += inputValue;
                                       }
                     });
        targetArtists.find("textarea:first")
                     .val($.trim(comboArtist));
        if (removeArtistButtons.length == 1) {
            removeArtistButtons.hide();  // Can't remove the artist if there's only one.
        } else {
            removeArtistButtons.show();
        }
    },

    updatePositionFields : function () {
        $(".tbl.release > tbody").each(function () {
            var originalPositions = $($(this).find(".editable.trackposition")),
                newPositions = $($(this).find('.trackposition:not(".editable")')),
                mediumTrackCount = $(this).find(".editable.trackposition").length;
            for (var i = 0; i < mediumTrackCount; i++) {
                if ($(originalPositions[i]).text() != i+1) { // If the original position != the current position,
                    $(originalPositions[i]).click(); // The track position field now has been edited (via a remove or reorder), so show the edit field,
                    $(newPositions[i]).find("input:eq(0)").val(i+1); // and populate the input with the new position.
                }
            }
        });
    },

    updateJoinPhrases : function (artistJoinPhrases) {
        var artistCount = artistJoinPhrases.length;
        artistJoinPhrases.find("input.joiner") // Find all of this artist's join phrase input fields,
                         .show() // show them all,
                         .filter(":last") // then select only the last one,
                             .hide() // hide it,
                             .val("") // clear any value it may have (there's no next artist after this to join to, so no join phrase is valid),
                         .end() // then revert back to selecting all join phrase fields,
                         .filter(":visible") // select all visible join fields (ie: all but the last (unused) join phrase),
                                 .each(function (i) { // and for each one individually,
                                                    var joinVal = $(this).val(),
                                                        joiner = "";
                                                    if (joinVal == "&" || joinVal == "," || joinVal.length === 0) {  // if this value is still a default value,
                                                        joiner = ","; // set the joiner to the most-common comma,
                                                        if (artistCount == 2) { // but if there are only 2 artists,
                                                            joiner = "&"; // we want the joiner to be an ampersand, not a comma,
                                                        } else if (artistCount > 2 && i == (artistCount - 2)) { // or if there are 3+ artists and this is the last join phrase,
                                                            joiner = "&"; // then we want the last joiner to be an ampersand, not a comma.
                                                        }
                                                        $(this).val(joiner); // Populate the join phrase input.
                                                    }
                                 })
    },
};

$(function () {

    /* Insert help icons. */
    $(".datumItem dt, th.release").prepend($('<img src="/static/images/blank.gif" class="helpIcon"/>')
                                  .hide());

    /* Insert the status and heads-up display box. */
    MusicBrainz.makeStatusBox();

    /* Initialize the display text box. */
    MusicBrainz.setStatus(text.LoadingJS, true);

   /* Create and attach click event for the documentation display close button. */
    var closeButton = $('<img src="/static/images/blank.gif" class="closeButton"/>');
    $("#wikiTitle").prepend(closeButton);
    closeButton.click(function () {
        $("#wikiHelpBox").slideUp(1000);
    });


    /* Populate the character and symbol arrays for the annotation editor. */
    MusicBrainz.populateCharArrays();

    if (experimental) {
        /* Add annotation markup switcher controls. */
        MusicBrainz.addAnnotationSwitcher();
    }

    /* Attach and activate the editor for the annotation and edit note. */
    $('#annotation, #edit-releaseedit_note').markItUp(MusicBrainz.markup.wiki);

    if (experimental) {
        /* Activate the annotation markup switcher controls. */
        MusicBrainz.activateAnnotationSwitcher();
    }

    /* Disable default behaviour for anchor links. */
    $(".editable a").bind("click.blocked", function (event) {
        event.preventDefault();
    });

   /* Create and initialize the side menu. */
//    MusicBrainz.makeEditMenu();
//    MusicBrainz.setPulloutHeight();

   /* Set click behaviour for editable fields (where there is qty 1 of that field type). */
    MusicBrainz.makeTogglable([
                              /* Definitions for entity type: Release */
                              ['release-date'],
                              'release-format',
                              'release-packaging',
                              'release-status'
                              ]);

    /* Add background and cursor hover behaviours for editable fields. */
    $(".editable, .artistDisplay td:has(textarea)").each(function (event) {
        $(this).css("cursor", "pointer")
               .addClass('highlight');
    });

    /* Set up autotabbing and limit input to \d only for date and barcode fields. */
    $('#edit-release-date-y').autotab({ target: 'edit-release-date-m', format: 'numeric',                                  maxlength: '4' });
    $('#edit-release-date-m').autotab({ target: 'edit-release-date-d', format: 'numeric', previous: 'edit-release-date-y', maxlength: '2' });
    $('#edit-release-date-d').autotab({                                format: 'numeric', previous: 'edit-release-date-m', maxlength: '2' });
    $("input[id$='edit-release-barcode']").attr("maxlength", 15) // EAN13 + EAN2, 15 digit maximum length
                                          .autotab({format: 'numeric'});

    /* Populate basic select lists. */
    $("#select-edit-release-packaging").addOption(mb.packaging, false);
    $("#select-edit-release-status").addOption(mb.releasestatus, false);

    /* Populate the format list, in alphabetical order, and with "Other" at the bottom. */
    MusicBrainz.makeFormatList();

    /* Setup and initialize language and script selects.  */
    $("#select-edit-release-language").addOption($("#edit-release-language-value").val(), "");
    MusicBrainz.swapShortLongList($("#select-edit-release-language"), $("#btn-switch-language-list"), mb.commonLangs, mb.language);
    $("#select-edit-release-script").addOption($("#edit-release-script-value").val(), "");
    MusicBrainz.swapShortLongList($("#select-edit-release-script"), $("#btn-switch-script-list"), mb.commonScripts, mb.script);
    $('.editable.release-language').click(function () {
        MusicBrainz.makeSwappableSelectList("release", "language", mb.commonLangs, mb.language);
    });
    $('.editable.release-script').click(function () {
        MusicBrainz.makeSwappableSelectList("release", "script", mb.commonScripts, mb.script);
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


    /* Add functionality to the "Add another artist" buttons. */
    $(".btnAddTA").live("click", function () {
        MusicBrainz.addSingleArtist(this);
    });

    /* Add auto-updating of the "combo artist" field, based on the artist fields' contents. */
    $(".addartist input").live("keyup", function () { // User typed into an artist or join phrase field.
        MusicBrainz.updateComboArtist(this);
    }).live("paste", function () { // User pasted via mouse into an artist or join phrase field.
        var artistbox = this; // The value of "this" doesn't carry over into a setTimeout.
        setTimeout(function () { // The onpaste event fires before the data is actually inserted into the form field; we need to
            MusicBrainz.updateComboArtist(artistbox); // delay until after that occurs, so we can read out that inserted data.
        }, 1);
    });

    /* Add the track dragging and removal icons. */
    $(".trackposition:visible").before('<td class="toolbox">' + // Insert the reordering handler td.
                                           '<div class="removeTrack" alt="' + text.DragTrack + '" title="' + text.DragTrack + '">' +
                                           '</div>' +
                                           '<div class="handleIcon" alt="' + text.RemoveTrack + '" title="' + text.RemoveTrack + '">' +
                                           '</div>' +
                                       '</td>');

    /* Attach functionality to the the track dragging icons. */
    $(".tbl").tableDnD({ // Add drag and drop reordering to the track rows.
        dragHandle: "dragHandle",
        onDragClass: "upDown",
        onDrop: function (tabel, movedRow) {
                                               MusicBrainz.stripeTracks();
//                                               MusicBrainz.updatePositionFields();
                                               if (!$(movedRow).parents("#removedTracks").length) { // If the track was not dropped within Removed Tracks,
                                                   $(movedRow).children("td:eq(0)")
                                                              .children(".removeTrack")
                                                              .show(); // then re-show the remove track icon.
                                                   if ($("#removedTracks > tr").length <= 1) { // If Removed Tracks now has no tracks in it,
                                                       $("#removedTracks").addClass("hidden"); // re-hide Remove Tracks.
                                                   }
                                               }
                                           }
                       })
    /* Attach functionality to the the track removal icons. */
    $(".removeTrack").live("click", function () {  // If the remove track icon is clicked, move the track to the Removed Tracks tfoot.
        $("#removedTracks").append($(this).parents("tr:first")
                                          .removeClass("ev") // Unstripe the track.
                           );
        $("#removedTracks").removeClass("hidden"); // Make sure that Removed Tracks is visible.
        $("#removedTracks tr .removeTrack").hide(); // Hide the removed track's remove track icon.
        MusicBrainz.stripeTracks();
//        MusicBrainz.updatePositionFields();
    });

    /* Insert the artist duplication icons. */
//    $(".trackartist").prepend('<div class="copyArtist" alt="' + text.DragArtist + '" title="' + text.DragArtist + '"></div>');

    /* Attach functionality to the the artist duplication icons. */
    $(".copyArtist").draggable({
                               helper: 'clone',
                               opacity: 0.5
                               })
                    .live('dragstart', function () {
                        MusicBrainz.artistData = $(this).parents("table:first");
                    });

    /* Attach artist duplication target functionality to the the tracks. */
// TODO: Add multi-medium support.
    $('.tartist').parent().droppable({ accept: '.copyArtist' })
                 .bind('drop', function() {
// TODO: Abstract this out, so it can less-redundantly also be accomplished when reading in a stash.
                 var sourceArtists = MusicBrainz.artistData.find("input.name"),
                     sourceJoiners = MusicBrainz.artistData.find("input.joiner"),
                     sourceArtistCount = sourceArtists.length,
                     targetArtistCell = $(this).find("table:first"),
                     targetArtists = targetArtistCell.find("input.name"),
                     targetJoiners = targetArtistCell.find("input.joiner"),
                     targetArtistCount = targetArtistCell.find(".addartist").length,
                     artistCountDifference = sourceArtistCount - targetArtistCount,
                     targetAddArtistBtn = targetArtistCell.find("input[type=button]");
                 $(this).find("td.editable:eq(2)").click();
                 if (artistCountDifference < 0) { // The target track has more single artist fields than exist for the source track.
                     targetArtistCell.find(".addartist:not(:first)").remove();
                     artistCountDifference = sourceArtistCount - 1;
                 }
                 for (var i = 0; i < artistCountDifference; i++) { // Add artist fields, such that there's enough to equal the
                     MusicBrainz.addSingleArtist(targetAddArtistBtn); // number of artists in the combo-artist being copied over.
                 }
                 for (var i = 0; i < sourceArtistCount; i++) {
                     $(targetArtists[i]).val($(sourceArtists[i]).val()); // Copy over the artist name
                     $(targetJoiners[i]).val($(sourceJoiners[i]).val()); // Copy over the join phrases
                 }
                 MusicBrainz.updateComboArtist(targetAddArtistBtn);
             });

    /* Attach functionality to the the remove artist icons. */
    $(".removeArtist").live("click", function () {
        var thisSingleArtist = $(this).parents("table:first");
        $(this).parents("tr:first").remove();
        MusicBrainz.updateJoinPhrases(thisSingleArtist.find(".addartist"));
        MusicBrainz.updateComboArtist(thisSingleArtist.find("tr:eq(2)"));
    });

    /* Add and activate the Annotation Editor toolbox button. */
    MusicBrainz.addAnnotationButton();

    /* Make each multiple-item entity editable. */
    MusicBrainz.makeTogglableEachInGroup([
                                         ["trackposition"],
                                         ["trackname", true],
                                         ["trackartist", true, "editartist"],
                                         ["trackdur"]
                                         ]);

    /* Toggle artist editors, such that only one is visible at any one time. */
    $(".artistDisplay").live("click", function () {
        $(".artistDisplay").each(function () { // Find all artist textarea display fields,
            $(this).parents("table:first") // find their parent artist tables,
                   .find("tr:not(:first)") // find all rows of those tables, except the one with the textarea display text,
                   .hide() // hide them
                   .end() // go back up to the parent artist tables level,
                   .find("tr:first") // select only the first one - the one with the textarea display text,
                   .addClass("notActive"); // and remove the bottom box line from it.
        });
        $(this).parents("table:first") // find the parent artist table for the active artist,
               .find("tr") // find all table rows within that artist's edit table,
               .show() // show them,
               .filter(":first") // then filter to only the first one - the one with the textarea display text,
               .removeClass("notActive"); // and add the bottom box line to it.
    })

    /* Add functionality to the show/hide controls for the toolbox column */
    $(".toolsHead, .toolsShow").click(function () {
        $("table.tbl > * > tr:not(.toolsStatusLine)").each(function () {
            $(".toolsHead").toggle();
            $(this).find("td:first, th:first").toggle();
        })
    }).click();


/* Everything below is rough code in progress. */







/* TODO: pre-populate:
                          * Type
                          * Format
                          * Packaging
                          * Status 
                          * Barcodes  //TODO: Barcode is currently prepopulating the cat #, and cat # is prepopulating the label name
                          * Countries */




// TODO:   /* Set click behaviour for editable fields (where there is more than one of that field type). */
    MusicBrainz.makeTogglable([
                              'release-barcode',
                              'release-catalog',
                              'release-country',
                              'release-label'
                              ]);

// TODO: There can be more than one country dropdown.
    MusicBrainz.makeCountryList();

// TODO: Track renumbering on remove or delete.
// TODO: Track addition.
// TODO: Medium reordering.
// TODO: Fix everything to support multiple mediums. (artist; note that the onclick is off by one for medium 2, likely off by n+1 for medium n)
// TODO: Medium addition.
// TODO: Missing mediums?
// TODO: Medium titles.
// TODO: Medium numbering.
// TODO: Release artist editing.
// TODO: Release title editing.
// TODO: Medium type selection.
// TODO: Setting all track artists from release artist.
// TODO: track parser support
// TODO: track parser template layout
// TODO: guess case support
// TODO: guess case template layout
// TODO: stash, undo, and redo support
// TODO: data loading via url args support
// TODO: add/remove label
// TODO: extend existing label functionality to support multiple labels
// TODO: Copy in a clean track for later use
// TODO: Copy in a clean medium line for later use
// TODO: Copy in a clean label for later use
// TODO: Loading of each single artist for each combo-artist
// TODO: Block /n's in field textareas.
// TODO: Fix up HTML -> Wiki parser to handle HTML not generated by Text::Wikiformat
// TODO: artist lookup
// TODO: label lookup
// TODO: Fix Sidebar pre-populated data for dates (should be yyyy, mm, dd, actually is yyyy, yyyy, mm)
// TODO: Type editing is a RG concept, not a release one
// TODO: Format is a medium concept, not a release one.



    MusicBrainz.addToolButton("Show Help Buttons", "btnHelp");

    $("#btnHelp").click(function () {
        $(".helpIcon").toggle();
        $("#btnHelp").val($("#btnHelp").val() == "Show Help Buttons" ? "Hide Help Buttons" : "Show Help Buttons");
    });



    MusicBrainz.setStatus(text.StatusInitial);

});

 MusicBrainz.showErrorForSidebar("release-date", "Test sidebar error");

MusicBrainz.initializeTrackParser = function () {
    /* Insert the track parser into the document. */
    $(".tbl.release").before(mb.HTMLsnippets.trackParser);
    /* Create the tool button. */
    MusicBrainz.addToolButton(text.TrackParserShow, "btnTrackParser");
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
    /* Set textarea height auto-adjustment for the track parser input field. */
    $('#tp-textarea').autogrow({ minHeight: 30 });
};

$(function () {
    MusicBrainz.initializeTrackParser();
});
