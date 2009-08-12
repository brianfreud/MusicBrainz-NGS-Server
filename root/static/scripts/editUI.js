/*jslint undef: true, browser: true*/
/*global jQuery, $, mb, text, convertToHTML, convertToMarkup*/

var experimental = false,
    charMap = {
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
},
    MusicBrainz = {

    roundness  : "round 6px",

    annotationEditorBuilt : false,

    artistEditor : {
                   editor_window       : {
                                         background  : "#F9F9F9",
                                         borderColor : "#666",
                                         css         : {
                                                       width  : "31em"
                                                       },
                                         id          : "artistEditBox",
                                         round       : false
                                         },
                   edit_width_with_AC  : "51em",
                   editor_inputs       : 'input.artistName, input.artistCredit, input.joinPhrase',
                   html_button_add     : '<input type="button" value="' + text.AddArtistShort + '" class="NewArtistButton"/>',
                   html_button_done    : '<input type="button" value="' + text.Done + '" class="ArtistDoneButton"/>',
                   html_button_remove  : '<div class="removeArtist"/>',
                   html_input_joiner   : '<input class="artistCredit"/>',
                   html_line_artist    : function () {
                                                     return '<div class="artistLine">' +
                                                                MusicBrainz.artistEditor.html_button_remove +
                                                                '<input type="text" class="artistName"/>' +
                                                                MusicBrainz.artistEditor.html_input_joiner +
                                                                '<input class="joinPhrase" style="visibility:hidden;"/>' +
                                                            '</div>';
                                                     },
                   html_line_header    : '<div class="artistLine labelLine">' +
                                             '<div class="labelArtist">' +
                                                 text.ArtistName +
                                             '</div>' +
                                             '<div class="labelCredit">' +
                                                 text.ArtistCredit +
                                             '</div>' +
                                             '<div class="labelJoiner" style="width:8em;">' +
                                                 text.ArtistJoiner +
                                             '</div>' +
                                         '</div>',
                   html_lookup_box     : '<div id="lookupControls" class="center">' +
                                             '<input type="button" value="' + text.SearchArtist + '" id="btnArtistSearch" tabindex="-1"/>' +
                                             '<div style="display:none;" id="lookupNoArtist">' + 
                                                 text.ArtistNameIsEmpty +
                                             '</div>' +
                                             '<div style="display:none;" id="lookupNoResults">' +
                                                 text.ArtistLookupNoResults +
                                             '</div>' +
                                             '<div style="display:none;" id="lookupSearching">' +
                                                 '<img src="/static/images/loading-small.gif"/> ' +
                                                 text.ArtistLookupSearching +
                                             '</div>' +
                                         '</div>' +
                                         '<div style="display:none;" id="lookupInfo">' +
                                             '<span>' +
                                                 text.ArtistLookupResults +
                                             '</span>' +
                                             ' ' + text.ArtistLookupMatches +
                                             ' <span id="lookupMatches"></span>' +
                                             ', ' +
                                             text.ArtistLookupLoaded +
                                             ' <span id="lookupLoaded"></span>' +
                                         '</div>' +
                                         '<div id="lookupResults" style="display:none;">' +
                                         '</div>' +
                                         '<div id="lookupBottomControls" class="hidden">' +
                                             '<div id="lookupHasAC" style="float:left">' +
                                                 '<input type="checkbox" value="false" class="hasAC" tabindex="-1"/>' +
                                                 ' <label>' + text.HasDiffArtistCredit + '</label>' +
                                             '</div>' +
                                             '<div style="float:right">' +
                                                 '<input type="button" value="' + text.AddArtistNew + '" id="btnArtistAdd" tabindex="-1"/>' +
                                             '</div>' +
                                         '</div>',
                   lookupBox           : {
                                         after       : true,
                                         borderColor : "#666",
                                         css         : {
                                                       float  : "left",
                                                       width  : "12em"
                                                       },
                                         id          : "artistLookup",
                                         round       : false
                                         },
                   store_active_editor : "",
                   searchServer        : "/ajax/search",
                   queryBase           : "type=artist&limit=20&query=",
                   destroyGeneric      : function (element) {
                                                            $(element).removeShadow()
                                                                      .hide()
                                                                      .remove();
                                                            },
                   destroySelf         : function () {
                                                     MusicBrainz.destroyGeneric("#artistEditBox");
                                                     },
                   destroyLookup       : function () {
                                                     MusicBrainz.destroyGeneric("#artistLookup");
                                                     },
                   flashEditorWindow   : function () {
                                                     $("#artistEditBox").find("div:first")
                                                                        .effect("highlight", {}, 800)
                                                                        .effect("highlight", {}, 800);
                                                     },
                   processResults      : function (data) {
                                                         $("#lookupSearching").css("display","none");
                                                         if (data.results.length == 0) {
                                                             $("#lookupNoResults").css("display","block");
                                                         } else {
                                                             $("#lookupInfo").css("display","block");
                                                             $.each($.map(data.results, function (result) {
                                                                    var resultstring = '<div class="result" style="display:none;">' +
                                                                                           '<div class="artist">' +
                                                                                               result.name +
                                                                                           '</div>' +
                                                                                           ((typeof(result.comment) != "undefined") ? '<div class="disambiguation">' + result.comment + '</div>' : '') +
                                                                                       '</div>';
                                                                    return $(resultstring);
                                                             }), function (i) {
                                                                 var thisResult = data.results[i];
                                                                 $(this).data("artistInfo", {
                                                                                            comment : $(this).find("div.disambiguation").val(),
                                                                                            gid     : thisResult.gid,
                                                                                            name    : thisResult.name,
                                                                                            rowid   : thisResult.id
                                                                                            })
                                                                        .appendTo("#lookupResults");
                                                             });
                                                             $("#lookupMatches").text(data.hits);
                                                             var alreadyLoaded = parseInt($("#lookupLoaded").text(),10);
                                                             $("#lookupLoaded").text(((alreadyLoaded == "NaN") ? alreadyLoaded : 0) + data.results.length);
                                                             $("#lookupResults").css("padding-top",".5em")
                                                                                .find("div.result")
                                                                                .corner()
                                                                                .filter(":even")
                                                                                .css("background-color","#F1F1F1")
                                                                                .end()
                                                                                .filter(":odd")
                                                                                .css("background-color","#FEFEFE")
                                                                                .end()
                                                                                .slice(0,10)
                                                                                .show();
                                                             if ($("#lookupResults").css("display") == "none") {
                                                                 $("#lookupResults").slideDown(200);
                                                                 $("#lookupBottomControls").css({
                                                                                                marginTop: "1em",
                                                                                                display: "block"
                                                                                                });
                                                                 setTimeout('$("#artistLookup").redrawShadow();',225);
                                                             }
                                                         }
                                                         },
                   resetAppearance     : function () {
                                                     $(artistEditor.editor_inputs).css("backgroundColor","#dadada");
                                                     $("#artistLookup").removeShadow()
                                                                       .hide()
                                                                       .remove();
                                                     artistEditor.destroyLookup();
                                                     },
                   thereCanBeOnlyOne   : function () {
                                                     $('<div>' + text.ArtistEditorError + '</div>').dialog({
                                                                 buttons       : { "Ok" : function() { 
                                                                                                     $(this).dialog("close");
                                                                                                     }
                                                                                 },
                                                                 close         : function () {
                                                                                             $.scrollTo($("#artistEditBox"));
                                                                                             artistEditor.flashEditorWindow();
                                                                                             },
                                                                 closeOnEscape : true,
                                                                 dialogClass   : 'alert',
                                                                 modal         : true,
                                                                 position      : 'center',
                                                                 title         : text.ErrorTitle,
                                                                 zIndex        : 10000
                                                                 });
                                                     },
                   updateTrackArtist   : function () {
                                                     $("#artistEditBox").prev()
                                                                        .prev()
                                                                        .find("textarea")
                                                                        .val($("#artistEditBox").find("input.artistCredit")
                                                                                                .map(function(i) {
                                                                                                    return $(this).val() + $("#artistEditBox").find("input.joinPhrase:eq(" + i + ")").val();
                                                                                                })
                                                                                                .get()
                                                                                                .join("")
                                                                        )
                                                                        .trigger("update");
                                                     },
                   events              : {
                                         init            : function () {
                                                                       artistEditor.events.makeEditor_One();
                                                                       artistEditor.events.makeEditor_Many();
                                                                       artistEditor.events.synchTextareas();
                                                                       artistEditor.events.keepTACorrect();
                                                                       artistEditor.events.initLookupBoxOne();
                                                                       artistEditor.events.initLookupBoxMany();
                                                                       artistEditor.events.synchACJPcolors();
                                                                       },
                                         synchTextareas  : function () { /* Keep the AC synched to the artist name, but only if the AC hasn't been modified independently. */
                                                                       $("input.artistName").live("keydown", function () {
                                                                           $(this).data("oldVal").push($(this).val());
                                                                       }).live("keyup", function () {
                                                                           var thisAC = $(this).next().val();
                                                                           if (thisAC.length === 0 || $.inArray(thisAC, $(this).data("oldVal")) > -1) {
                                                                               $(this).next().val($.trim($(this).val()));
                                                                               artistEditor.updateTrackArtist();
                                                                           }
                                                                       }).live("paste", function () {
                                                                           var artistbox = this;
                                                                           setTimeout(function () {
                                                                               if ($(this).next().val().length == 0) {
                                                                                   $(this).next().val($.trim($(this).val()));
                                                                                   artistEditor.updateTrackArtist();
                                                                               }
                                                                           }, 1);
                                                                       }).live("blur", function () {
                                                                           $(this).data("oldVal", []);
                                                                       });
                                                                       },
                                         makeEditor_One  : function () { /* This is used when a track artist has only 0 or 1 artist as constituant artist. */
                                                                       $("div.addArtist").live("click", function (e) {
                                                                           if ($("#artistEditBox").length > 0) {
                                                                               e.stopPropagation();
                                                                               artistEditor.thereCanBeOnlyOne();
                                                                           } else {
                                                                               artistEditor.store_active_editor = e.target;
                                                                               var artistCell = $(this).parent().parent();
                                                                               $(this).parent()
                                                                                      .makeFloatingDiv(artistEditor.editor_window)
                                                                                      .find("div:first")
                                                                                      .append('<div>' + 
                                                                                              artistEditor.html_line_header +
                                                                                              '</div><div>' +
                                                                                              artistEditor.html_button_done +
                                                                                              artistEditor.html_button_add + 
                                                                                              '</div>')
                                                                                      .parent()
                                                                                      .parent()
                                                                                      .find("div:first")
                                                                                      .append('<textarea readonly="readonly" class="editTAs">' + 
                                                                                              $(this).parent().find("div:first").find("input").val() +
                                                                                              '</textarea>')
                                                                                      .find("input")
                                                                                      .appendTo("#artistEditBox > div:first > div:first")
                                                                                      .wrap('<div class="artistLine"></div>')
                                                                                      .removeClass("oneArtist")
                                                                                      .before(artistEditor.html_button_remove)
                                                                                      .after(artistEditor.html_input_joiner +
                                                                                             '<input class="joinPhrase" value="&"/>')
                                                                                      .addClass("artistName")
                                                                                      .parent()
                                                                                      .after(artistEditor.html_line_artist)
                                                                                      .parents("td.trackartist")
                                                                                      .find("div:first")
                                                                                      .find("textarea")
                                                                                      .autogrow({minHeight: 1, expandTolerance: 0});
                                                                               artistEditor.updateTrackArtist();
                                                                               $("#artistEditBox > div:first > div:first > div:eq(1) > input:first").focus();
                                                                               $(this).remove();
                                                                               $(".artistName").data("oldVal",[]);
                                                                               $(".artistCredit:eq(0)").val($("#artistEditBox").find("div:first").find("input:eq(2)").val());
                                                                           }
                                                                       });
                                                                       },
                                         makeEditor_Many : function () { /* This is used when a track artist has more than 1 artist as constituant artists. */
                                                                       $("textarea.editTAs").live("click", function (e) {
                                                                           if ($("#artistEditBox").length > 0) { // If another artist editor is already active, don't open another one.
                                                                               if (artistEditor.store_active_editor != e.target) { // The textarea the user clicked on was *not* the one already being edited.
                                                                                   e.stopPropagation();
                                                                                   artistEditor.thereCanBeOnlyOne();
                                                                               }
                                                                           } else {
                                                                               artistEditor.store_active_editor = e.target;
                                                                               var artistCell = $(this).parent().parent(),
                                                                                   artistData = $(this).parent().data("TAs"),
                                                                                   dataHTML = "";
                                                                               for (var i = 0, loops = artistData.length; i < loops; i++) {
                                                                                   dataHTML += '<div class="artistLine">' +
                                                                                                   artistEditor.html_button_remove + 
                                                                                                   '<input type="text" class="artistName" value="' + artistData[i].name + '"/>' +
                                                                                                   '<input class="artistCredit" value="' + artistData[i].credit + '"/>' +
                                                                                                   '<input class="joinPhrase" value="' + artistData[i].join + '"/>' +
                                                                                               '</div>';
                                                                               }
                                                                               $(this).parent()
                                                                                      .parent()
                                                                                      .makeFloatingDiv(artistEditor.editor_window)
                                                                                      .find("div:first")
                                                                                      .append('<div>' + 
                                                                                              artistEditor.html_line_header +
                                                                                              '</div><div>' +
                                                                                              artistEditor.html_button_done +
                                                                                              artistEditor.html_button_add + 
                                                                                              '</div>')
                                                                                      .find("div:first")
                                                                                      .append(dataHTML)
                                                                                      .find("input:last")
                                                                                      .css("visibility","hidden");
                                                                               $(".artistName").data("oldVal",[]);
                                                                               $("#artistEditBox").redrawShadow();
                                                                               artistEditor.updateTrackArtist();
                                                                               $("#artistEditBox > div:first > div:first > div:eq(1) > input:first").focus();
                                                                           }
                                                                       });
                                                                       },
                                         keepTACorrect   : function () { /* Listen for changes to ACs or join phrases, to keep the trackartist textareas updated. */
                                                                       $("input.artistCredit, input.joinPhrase").live("change", function () {
                                                                           artistEditor.updateTrackArtist();
                                                                       }).live("keyup", function () {
                                                                           artistEditor.updateTrackArtist();
                                                                       }).live("paste", function () {
                                                                           artistEditor.updateTrackArtist();
                                                                       });
                                                                       },
                                         initLookupBoxOne: function () {
                                                                       $('input.oneArtist').live("focusin", function () {
                                                                           artistEditor.destroyLookup();
                                                                           $(this).parent()
                                                                                  .parent()
                                                                                  .makeFloatingDiv(artistEditor.lookupBox)
                                                                                  .find("div:first")
                                                                                  .append(artistEditor.html_lookup_box);
                                                                           $("#artistLookup").redrawShadow();
                                                                       })
                                                                       },
                                         initLookupBoxMany: function () { /* Create the initial lookup float box, with the structure to fill in results later. */
                                                                       $('input.artistName').live("focusin", function () {
                                                                           artistEditor.resetAppearance();
                                                                           $(this).parent()
                                                                                  .find("input")
                                                                                  .css("backgroundColor","#fff")
                                                                                  .end()
                                                                                  .find("input.artistName")
                                                                                  .makeFloatingDiv(artistEditor.lookupBox)
                                                                                  .find("div:first")
                                                                                  .append(artistEditor.html_lookup_box);
                                                                           $("#artistLookup").redrawShadow();
                                                                       })
                                                                       },
                                         synchACJPcolors : function () { /* Keep coloring and lookup box synched for AC and Join Phrase fields. */
                                                                       $('input.artistCredit, input.joinPhrase').live("focusin", function () {
                                                                           artistEditor.resetAppearance();
                                                                           $(this).parent()
                                                                                  .find("input")
                                                                                  .css("backgroundColor","#fff");
                                                                       });
                                                                       }
                                         }
                   },
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
                                             return selectedText.replace(/\n$/g,"");
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
            var newSet = $(this).attr('class');
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
            if ($(this).val() === text.AnnotationEditorShow) { // Show the annotation editor.
                $(this).val(text.AnnotationEditorHide);
                if (!MusicBrainz.annotationEditorBuilt) { /* The annotation editor only needs to be initialized once. */
                    $('#annotation').markItUp(MusicBrainz.markup.wiki); /* This takes about 350ms, hence we don't do it on page load. */
                    MusicBrainz.annotationEditorBuilt = true;
                }
                $(".annotationFS").css("display","block");
            } else { // Hide the track parser.
                $(".annotationFS").css("display","none");
                $(this).val(text.AnnotationEditorShow);
            }
        });
    },

    addAnnotationSwitcher : function () {
        if (experimental) {
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
            $('#annotation').before('<br/><br/><em>Note: Converting from HTML to Wikiformat and editing using HTML mode are both experimental at the moment!</em>');
        }
    },

    addArtistEditorButton : function (context) {
        context.find(".oneArtist").parent().after('<div class="addArtist hidden" alt="' + text.AddArtist + '" title="' + text.AddArtist + '"></div>');
        return context;
    },

    addToolButton : function (buttonText, buttonID) {
        $("#MenuEditTools").append('<input type="button" id="' + buttonID + '" value="' + buttonText + '"/>');
    },

    addTrackTools : function (context) {
        context.find("td.toolbox").append('<div class="removeTrack" alt="' + text.RemoveTrack + '" title="' + text.RemoveTrack + '"></div>' +
                                          '<div class="handleIcon" alt="' + text.DragTrack + '" title="' + text.DragTrack + '"></div>');
        return context;
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
        $("#editStatusMsg").html("&nbsp;");
    },

    destroyGeneric : function (element) {
        $(element).removeShadow()
                  .hide()
                  .remove();
   },

    hideErrorForSidebar : function (element) {
        $("#" + element + "-dt").btOff();
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
        $("select.medium.format").each(function (i) {
            var otherVal,
                formatSelect = $(this),
                presetFormat = $("input.medium.format:eq(" + i + ")").val();
            $.each(mb.format, function (i) {
                if (mb.format[i][0] !== 13) {
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
            if (presetFormat.length > 0) {
                $(this).val(presetFormat);
            }
        });
    },

    makeStatusBox : function () {
        $("#statusHead").append(mb.HTMLsnippets.editBox);
        $("#tabs").after(mb.HTMLsnippets.docsBox);
        $("#editMsg").corner(MusicBrainz.roundness);
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
                    $('.editable.' + toggleclass[0] + ':eq(' + i + ')').css("display","none"); // Hide the specific item's text.
                    $('.hidden.' + toggleclass[0] + ':eq(' + i + ')').show() // Show the specific item's editing form field.
                                                                     .find('textarea:visible:first')
                                                                     .autogrow({minHeight: 1, expandTolerance: 0})
                                                                     .end()
                                                                     .find('input:visible:first, textarea:visible:first') // Find the first edit field,
                                                                     .focus() // and give it focus.
                                                                     .click(); // and click it (to trigger the artist editor).
                });
            });
        });
    },

    populateCharArrays : function () {
        var chars = [
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
                ],
            symbols = ["¿","†","‡","↔","↑","↓","•","∞","¶","½","⅓",
                   "⅔","¼","¾","⅛","⅜","⅝","⅞","«","»","¤","₳",
                   "฿","₵","¢","₡","₢","$","₫","₯","€","₠","₣",
                   "ƒ","₴","₭","₤","₥","₦","№","₧","₰","£","៛",
                     "₨","₪","৳","₮","₩","¥","♠","♣","♥","♦","²","³",
                   "®","©","™"];
        for (var i = 0, charCount = chars.length; i < charCount; i++) {
            charMap.characters.dropMenu[i] = {
                                             name      : chars[i][0],
                                             openWith  : chars[i][0],
                                             className : "skip" + chars[i][1]
                                             };
        }
        for (var j = 0, symCount = symbols.length; j < symCount; j++) {
            charMap.symbols.dropMenu[j] = {
                                          name      : symbols[j],
                                          openWith  : symbols[j],
                                          className : "skip0"
                                          };
        }
        charMap.symbols.dropMenu[charMap.symbols.dropMenu.length] = { name: "[", openWith: "&91;", className: "skip0" };
        charMap.symbols.dropMenu[charMap.symbols.dropMenu.length] = { name: "]", openWith: "&93;", className: "skip0" };
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
        if (typeof(select.selectedValues()[0]) !== "undefined") { // If there actually is a currently selected item,
            var selecteditem = select.selectedValues()[0]; // then store the currently selected item.
        }
        select.css("display","none"); // Avoid needless (and very slow) DOM redraws.
        select.removeOption(/./); // Empty the select list.
        if (button.attr("value") === text.FullList) { // Switch to the full list.
            button.attr("value", text.ShortList); // Change the text on the button.
            select.addOption(bigarray, false); // Populate the select list.
        } else { // Switch to the short list.
            button.attr("value", text.FullList); // Change the text on the button.
            if ($.inArray(parseInt(selecteditem, 10), commonarray) === -1 && typeof(selecteditem) !== "undefined") {
                if (typeof(bigarray[selecteditem]) !== "undefined") { // Make sure the selected item is in the list,
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

    toggleTools : function () {
        $("table.tbl").addClass("hidden");
        $("#toolsHead").toggleClass("toolsHeadGrey");
        var show = $("#toolsHead").hasClass("toolsHeadGrey") ? false : true;
        $("#toolsHead").attr("title",show ? text.toolsShow : text.toolsHide)
                       .attr("alt",show ? text.toolsShow : text.toolsHide);
        show = show ? $(".toolbox").css("display","none") : $(".toolbox").show();
        $("table.tbl").removeClass("hidden");
    },

    updateMediumTotalDuration : function () {
        $("table.tbl > tbody").each(function () {
            var seconds = 0,
                minutes = 0;
            $(this).find(".trackdur > input").each(function () {
                var thisValue = $(this).val();
                if (thisValue.length > 0 && thisValue !== "?:??") {
                    minutes += parseInt(thisValue.split(":")[0], 10);
                    seconds += parseInt(thisValue.split(":")[1], 10);
                }
            });
            if (seconds > 59) { // Carry over :60+ to minutes
                minutes += Math.floor(seconds / 60);
                seconds = seconds % 60;
            }
            if (seconds < 10) {
                seconds = "0" + seconds; // Pad out :0 - :9
            }
            if (minutes + ":" + seconds !== "0:00") {
                $(this).find(".medium.trackdur > span").text(minutes + ":" + seconds);
            } else {
                $(this).find(".medium.trackdur > span").text("?:??");
            }
        });
    },

    updatePositionFields : function () {
        $(".tbl.release > tbody").each(function () {
            var originalPositions = $($(this).find(".editable.trackposition")),
                newPositions = $($(this).find('.trackposition:not(".editable")'));
            for (var i = 0, mediumTrackCount = $(this).find(".editable.trackposition").length; i < mediumTrackCount; i++) {
                if ($(originalPositions[i]).text() !== i+1) { // If the original position != the current position,
                    $(originalPositions[i]).click(); // The track position field now has been edited (via a remove or reorder), so show the edit field,
                    $(newPositions[i]).find("input:eq(0)").val(i+1); // and populate the input with the new position.
                }
            }
        });
    },

    events : {
             addArtistCopiers : function () {
                                            /* Attach functionality to the the artist duplication icons. */
                                            $(".copyArtist").draggable({
                                                                       helper: 'clone',
                                                                       opacity: 0.5
                                                                       })
                                                            .live('dragstart', function () {
                                                                artistEditor.store_artist_edit = $(this).parents("table:first");
                                                            });
                                        
                                            /* Attach artist duplication target functionality to the the tracks. */
                                        // TODO: Add multi-medium support.
                                            $('.tartist').parent().droppable({ accept: '.copyArtist' })
                                                         .bind('drop', function() {
                                        // TODO: Abstract this out, so it can less-redundantly also be accomplished when reading in a stash.
                                                         var sourceArtists = artistEditor.store_artist_edit.find("input.name"),
                                                             sourceJoiners = artistEditor.store_artist_edit.find("input.joiner"),
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
                                                         for (var j = 0; j < artistCountDifference; j++) { // Add artist fields, such that there's enough to equal the
                                                             MusicBrainz.addSingleArtist(targetAddArtistBtn); // number of artists in the combo-artist being copied over.
                                                         }
                                                         for (var k = 0; k < sourceArtistCount; k++) {
                                                             $(targetArtists[k]).val($(sourceArtists[k]).val()); // Copy over the artist name
                                                             $(targetJoiners[k]).val($(sourceJoiners[k]).val()); // Copy over the join phrases
                                                         }
                                                         artistEditor.updateTrackArtist();
                                                     });
                                            }
             },
},
    artistEditor = MusicBrainz.artistEditor;
$.extend(MusicBrainz, {
                      html_line_artist : MusicBrainz.artistEditor.html_line_artist()
});



$(function () {
//console.time("Sidebar")
    /* ==== Start functions that initially manipulate the sidebar DOM. ==== */

    /* Populate basic select lists. */
    $("#select-edit-release-packaging").addOption(mb.packaging, false);
    $("#select-edit-release-status").addOption(mb.releasestatus, false);

    /* Populate the format list, in alphabetical order, and with "Other" at the bottom. */
// FireFox: 30ms Opera: 13ms
    MusicBrainz.makeFormatList();

    /* Setup and initialize language and script selects.  */
    $("#select-edit-release-language").addOption($("#edit-release-language-value").val(), "");
// FireFox: 29ms Opera: 80ms
    MusicBrainz.swapShortLongList($("#select-edit-release-language"), $("#btn-switch-language-list"), mb.commonLangs, mb.language);
    $("#select-edit-release-script").addOption($("#edit-release-script-value").val(), "");
// FireFox: 6ms Opera: 5ms
    MusicBrainz.swapShortLongList($("#select-edit-release-script"), $("#btn-switch-script-list"), mb.commonScripts, mb.script);

    $('dd.editable.release-language').click(function () {
        MusicBrainz.makeSwappableSelectList("release", "language", mb.commonLangs, mb.language);
    });

    $('dd.editable.release-script').click(function () {
        MusicBrainz.makeSwappableSelectList("release", "script", mb.commonScripts, mb.script);
    });

    /* This next duplicates the jQuery UI accordion, except it also allows the pegboard effect. */
        $.ajax({
               async    : true,
               cache    : true,
               success  : function () {
                                      $("#MenuGuessCase").append('<select id="edit-select-gc-mode"></select>');
                                      $("#accordion").addClass("ui-accordion ui-widget ui-helper-reset")
                                                     .find("h3")
                                                     .addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom")
                                                     .prepend('<span class="ui-icon ui-icon-triangle-1-e"/>')
                                                     .click(function () {
                                                         $(this).toggleClass("ui-accordion-header-active")
                                                                .toggleClass("ui-state-active")
                                                                .toggleClass("ui-state-default")
                                                                .toggleClass("ui-corner-bottom")
                                                                .find("> .ui-icon")
                                                                .toggleClass("ui-icon-triangle-1-e")
                                                                .toggleClass("ui-icon-triangle-1-s")
                                                                .end()
                                                                .next()
                                                                .toggleClass("ui-accordion-content-active")
                                                                .toggle();
                                                         return false;
                                                     })
                                                     .next()
                                                     .addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom")
                                                     .css("display","none")
                                                     .end()
                                                     .end()
                                                     .fadeIn("slow");
                          },
               dataType : "script",
               type     : "GET",
               url      : "/static/scripts/jquery/jquery.jquery-ui.js"
        });

    /* Add the show help button to the tool box, and round the corners on the docs display div. */
    setTimeout(function () {
        $("#wikiHelpBox").corner(MusicBrainz.roundness);
        $("#wikiHelpInnerBox").corner(MusicBrainz.roundness);
        MusicBrainz.addToolButton("Show Help Buttons", "btnHelp")
    },1000);

    /* ==== End functions that initially manipulate the sidebar DOM. ==== */

    $("#sidebar").css("display","block");
//console.timeEnd("Sidebar")
//console.time("Tracklist")
    /* ==== Only functions that affect the initial DOM for the tracklist should go here. ==== */

    /* Insert the status display box. */
    MusicBrainz.makeStatusBox();

    /* Insert the initial status display box text. */
    MusicBrainz.setStatus(text.StatusInitial);

    /* Add mouseover text for the toolbox button. */
    $("#toolsHead").attr("title",text.toolsShow)
                   .attr("alt",text.toolsShow);

    /* Add the track movement and removal icons. */
    MusicBrainz.addTrackTools($("table.tbl"));

    /* Add functionality to the show/hide controls for the toolbox column */
    $("#toolsHead").click(function () {
        MusicBrainz.clearStatus();
        MusicBrainz.toggleTools();
    });

    /* Insert help icons. */
    $("dl.datumList div dt, th.release").prepend('<img src="/static/images/blank.gif" class="helpIcon"/>');

    /* Insert the artist duplication icons. */
//    $(".trackartist").prepend('<div class="copyArtist" alt="' + text.DragArtist + '" title="' + text.DragArtist + '"></div>');

    /* Create the add artist button for tracks which only have 0 or 1 artist in the track artist. */
    MusicBrainz.addArtistEditorButton($("table.tbl"));

    /* Set the initial total durations for each medium. */
// FireFox: 13ms Opera: 8ms
    MusicBrainz.updateMediumTotalDuration();

    /* ==== End functions that initially manipulate the tracklist's DOM. ==== */

    /* Show the tracklist. */
    $("table.tbl").css("display","block");
    $("#loader").css("display","none");

//console.timeEnd("Tracklist")
//console.time("Notes")

    /* ==== Only functions that affect the initial DOM for the edit note or annotation should go here. ==== */

    /* Populate the character and symbol arrays for the annotation editor. */
    MusicBrainz.populateCharArrays();

    if (experimental) {
        /* Add annotation markup switcher controls. */
        MusicBrainz.addAnnotationSwitcher();

        /* Activate the annotation markup switcher controls. */
        MusicBrainz.activateAnnotationSwitcher();
    }

    /* Attach and activate the editor for the annotation and edit note. */
    /* Each of these takes about 350ms to run; neither is needed immediately, so */
    /* rather than slow down the page initialization, delay creating the edit note editor
    /* until after page load, and only initialize the annotation editor if it is needed. */
    setTimeout("$('#edit-releaseedit_note').markItUp(MusicBrainz.markup.wiki)", 1000);
    MusicBrainz.addAnnotationButton();

    /* ==== End functions that initially manipulate the edit note or annotation DOM. ==== */

    /* Show the edit note. */
    $("fieldset.editNote").css("display","block");
//console.timeEnd("Notes")
//console.time("MouseEvents")
    /* ==== Start functions that attach mouse events. ==== */

   /* Set click behaviour for editable fields (where there is qty 1 of that field type). */
    MusicBrainz.makeTogglable([
                              /* Definitions for entity type: Release */
                              ['release-date'],
                              'release-format',
                              'release-packaging',
                              'release-status'
                              ]);

    /* Make each multiple-item entity editable. */
    MusicBrainz.makeTogglableEachInGroup([
                                         ["trackposition"],
                                         ["trackname", true],
                                         ["trackartist", true],
                                         ["trackdur"],
                                         ["medium.format"],
                                         ["medium.title"]
                                         ]);

    /* Per-medium show/hide */
    $("div.mediumToggle").live("click", function () {
        if ($(this).hasClass("mediumToggleClosed")) {
            $(this).removeClass("mediumToggleClosed");
            $(this).parents("tbody:first")
                   .find("> tr:not(:has(th))")
                   .show();
        } else {
            $(this).addClass("mediumToggleClosed");
            $(this).parents("tbody:first")
                   .find("> tr:not(:has(th))")
                   .css("display","none");
        }
    });

    /* Attach functionality to the the track dragging icons. */
    $(".tbl").tableDnD({ // Add drag and drop reordering to the track rows.
        dragHandle: "toolbox",
        onDragClass: "upDown",
        onDrop: function (table, movedRow) {
                                            MusicBrainz.stripeTracks();
//                                            MusicBrainz.updatePositionFields();
                                            if (!$(movedRow).parents("#removedTracks").length) { // If the track was not dropped within Removed Tracks,
                                                $(movedRow).children("td:eq(0)")
                                                           .children(".removeTrack")
                                                          .show(); // then re-show the remove track icon.
                                                if ($("#removedTracks > tr").length <= 1) { // If Removed Tracks now has no tracks in it,
                                                    $("#removedTracks").css("visibility","collapse"); // re-hide Remove Tracks.
                                                }
                                            }
                                            MusicBrainz.updateMediumTotalDuration();
                                        }
                       });

    /* Attach functionality to the the track removal icons. */
    $(".removeTrack").live("click", function () {  // If the remove track icon is clicked, move the track to the Removed Tracks tfoot.
        $("#removedTracks").append($(this).parents("tr:first")
                                          .removeClass("ev") // Unstripe the track.
                           );
        $("#removedTracks").css("visibility","visible"); // Make sure that Removed Tracks is visible.
        $("#removedTracks tr .removeTrack").css("display","none"); // Hide the removed track's remove track icon.
        MusicBrainz.stripeTracks();
//        MusicBrainz.updatePositionFields();
        MusicBrainz.updateMediumTotalDuration();
    });

    /* Set up autotabbing and limit input to \d only for date and barcode fields. */
    $('#edit-release-date-y').autotab({ target: 'edit-release-date-m', format: 'numeric',                                  maxlength: '4' });
    $('#edit-release-date-m').autotab({ target: 'edit-release-date-d', format: 'numeric', previous: 'edit-release-date-y', maxlength: '2' });
    $('#edit-release-date-d').autotab({                                format: 'numeric', previous: 'edit-release-date-m', maxlength: '2' });
    $("input[id$='edit-release-barcode']").attr("maxlength", 15) // EAN13 + EAN2, 15 digit maximum length
                                          .autotab({format: 'numeric'});

    /* Attach functionality to the show/hide help button. */
    setTimeout(function () {
        $("#btnHelp").click(function () {
            $(".helpIcon").toggle();
            $("#btnHelp").val($("#btnHelp").val() === text.HelpShow ? text.HelpHide : text.HelpShow);
        });
    }, 2000);

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

   /* Create and attach click event for the documentation display close button. */
    var closeButton = $('<img src="/static/images/blank.gif" class="closeButton"/>');
    $("#wikiTitle").prepend(closeButton);
    closeButton.click(function () {
        $("#wikiHelpBox").slideUp(1000);
    });

    /* Update total duration for each medium when track duration is changed. */
    $("td.trackdur > input").live("change", function () {
                                                        MusicBrainz.updateMediumTotalDuration();
                                                        });

    /* ==== End functions that attach mouse events. ==== */
//console.timeEnd("MouseEvents")
//console.time("Other")
    /* ==== Start other functions. ==== */

    /* Add the track movement and removal icons and the add artist button to the blank track template. */
    mb.HTMLsnippets.newTrack = MusicBrainz.addArtistEditorButton(MusicBrainz.addTrackTools($(mb.HTMLsnippets.newTrack))).outerHTML();

    /* Clean out the "Loading..." div.  .remove() is slow, so we do this last, not at the instant we're initially done with that div. */
    $("#loader").remove();

    /* Clear the initial status text after 15 seconds. */
    setTimeout(MusicBrainz.clearStatus, 15000);


/* Everything below is rough code in progress. */

// TODO: Add new artist
// TODO: Artist lookup
// TODO: Updating join phrases


/*
Lookup:

Box opens on artist field click.

Initial box shows only the search button, only on click/tab into the field.

Search button click: Show "searching" text + icon, disable search button.

Lookup failure: Change text and icon to reflect the error.

Results returned: 
    Check for results count.
    If there are more results than were returned, add controls to support getting more results, paginated.  
    Cache search + results.
    Populate div with the results.
    Zebra-stripe results.

More results returned: 
    Add pagination buttons
    Re-check to see if there are still yet even more results available, and update those controls to reflect it.  
    Update cache.
    Add to div population with the new results.
    Zebra-stripe results.

Artist in results list hover:
    Change background color + outline to reflect hovered artist.

Artist selected:
    Get rid of the search div.
    Toggle the artist field to a text view.

Artist text view:
    On click, switch (back) to artist field, re-add initial search box.  Show disambiguation.

*/




$("#btnArtistSearch").live("click", function () {
    var artistInput  = $("#artistLookup").prev().find("input.artistName, input.oneArtist").val();
    if (artistInput.length == 0) {
        $("#btnArtistSearch").css("display","none");
        $("#lookupNoArtist").css("display","block");
    } else {
        $("#btnArtistSearch").css("display","none");
        $("#lookupControls").css({
                                 textAlign : "left",
                                 margin    : "0",
                                 padding   : "0 2em 0"
                                 });
        $("#lookupSearching").show();
        setTimeout(function () { /* Load the effect now, but delay sending it, so that it happens while the ajax request is taking place. */
                               $("#artistLookup >div:first").css("width","");
                               $("#artistLookup").animate({width:"45em"},300);
                               setTimeout('$("#artistLookup").redrawShadow();',310);
                               }, 1);
        $.ajax({
               async    : false,
               cache    : true,
               success  : artistEditor.processResults,
               data     : artistEditor.queryBase + escape(artistInput),
               dataType : "json",
               type     : "GET",
               url      : artistEditor.searchServer
        });
    }
});


/* Add and activate the live events that trigger the various artist editor functionalities. */
artistEditor.events.init();

    $(".NewArtistButton").live("click", function () {
        artistEditor.resetAppearance()
        $("#artistEditBox").find("div:first > div:first")
                           .find("input")
                           .show()
                           .css("visibility","visible")
                           .end()
                           .append(artistEditor.html_line_artist)
                           .parent()
                           .parent()
                           .redrawShadow();
        $("div.removeArtist:first").css("height","16px");
        $("div.labelJoiner").css("visibility","visible");
        artistEditor.updateTrackArtist();
// TODO: Add a new entry to the data array store for the new artist.
    });

    $(".ArtistDoneButton").live("click", function () {
// TODO: Insert a check here that all artists have actually been identified
        var thisTextarea = $(this).parent()
                                  .parent()
                                  .parent()
                                  .find("div:first")
                                  .find("textarea");
        artistEditor.resetAppearance();
        artistEditor.destroySelf()
        $(thisTextarea).focus(); // Force focus to the textarea; this forces the textarea's position to be updated, and avoids the textarea ending
    });                          // up aligned to the absolute top of the td.  It's not perfectly centered, but about as good as css allows us to do.


    $(".removeArtist").live("click", function () {
// TODO: Clear out the data array store for this artist.
        artistEditor.resetAppearance()
        $(this).parent().remove();
        $("#artistEditBox").find("div:first > div:first")
                           .find("input:last")
                           .val("")
                           .css("visibility","hidden")
                           .end()
                           .end()
                           .redrawShadow();
        var removeIcons = $("div.removeArtist");
        if (removeIcons.length == 1) {
            removeIcons.css("height","0");
            $("div.labelJoiner").css("visibility","hidden");
        }
        artistEditor.updateTrackArtist();
//            MusicBrainz.updateJoinPhrases(thisSingleArtist.find(".addartist"));
    });


// MusicBrainz.events.addArtistCopiers();


/*


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
                                 });
    }

*/



/* TODO: pre-populate:
                          * Type
                          * Format
                          * Packaging
                          * Status
                          * Barcodes
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
// TODO: Missing medium support
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
// TODO: Type editing is a RG concept, not a release one
// TODO: Format is a medium concept, not a release one.
// TODO: RG selection / addition

 MusicBrainz.showErrorForSidebar("release-date", "Test sidebar error");

//console.timeEnd("Other")
});


//MusicBrainz.initializeTrackParser = function () {
    /* Insert the track parser into the document. */
//    $(".tbl.release").before(mb.HTMLsnippets.trackParser);
    /* Create the tool button. */
//    MusicBrainz.addToolButton(text.TrackParserShow, "btnTrackParser");
    /* Set the click event controls for the Show / Hide Track Parser button. */
/*    $("#btnTrackParser").click(function () {
        if ($(this).val() === text.TrackParserShow) { // Show the track parser.
            $("#js-fieldset-tp").show();
            $(this).val(text.TrackParserHide);
        } else { // Hide the track parser.
            $("#js-fieldset-tp").css("display","none");
            $(this).val(text.TrackParserShow);
        }
    });
*/    /* Set textarea height auto-adjustment for the track parser input field. */
/*    $('#tp-textarea').autogrow({ minHeight: 30 });
};

$(function () {
    MusicBrainz.initializeTrackParser();
});
*/
