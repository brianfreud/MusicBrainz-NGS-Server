/*jslint undef: true, browser: true*/
/*global jQuery, $, mb, text, window, convertToHTML, convertToMarkup, escape, parseFloat, parseInt, Math */

"use strict";

if (window.console) {
//    console.profile();
    console.time("Main: initDOMr");
    console.time("Main: initDOMl");
    console.time("Main: libraries");
}

/**
 * @description A simple addition to the Date object, to return the number of days in a given month for a given year.
 */
Date.prototype.daysInMonth = function () {
   return new Date(this.getFullYear(), this.getMonth()+1, 0).getDate();
};

/**
 * @description Map IE functions to W3C DOM level 2 Style functions.
 */
if (document.styleSheets[0].rules) {
    document.styleSheets[0].cssRules = document.styleSheets[0].rules;
    document.styleSheets[0].deleteRule = function (ruleIndex) {
	this.removeRule(ruleIndex);
    };
    document.styleSheets[0].insertRule = function (ruleText, ruleIndex) { 
	ruleText = ruleText.match(/(.*)\{(.*)\}/);
	document.styleSheets[0].addRule(ruleText[0], ruleText[1], ruleIndex);
    };
}

var artistEditor,
    aeHTML,
    $cache,
    experimental = false,
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

    /**
     * @namespace HTML element factory, used to build standardized html strings.
     */
    html = {
	   css : {
	         displayIB   : 'display: inline-block;',
	         displayNone : 'display: none;',
	         floatLeft   : 'float: left;',
	         floatRight  : 'float: right;'
	   },
	   /**
	    * @description Used by the various HTML shortcut functions to test the undefined state of an object key so it can be used in a manner 
	    *              that won't lead to our attempting to access the value of an undefined key.
	    * @param {Variable} arg The variable being tested.
	    */
	   checkDef : function (arg) {
	       return (typeof(arg) !== 'undefined') ? arg : undefined;
	   },
	   /**
	    * @description The central HTML string factory; it creates the actual HTML string using standardized format and attribute order.
	    * @param {Object} args The attributes to be added to the HTML element string being formed.
	    * @param {String} [args.alt] The "alt" attribute.
	    * @param {String} [args.checked] The "checked" attribute.
	    * @param {String} [args.cl] The "class" attribute.
	    * @param {String} [args.css] The "style" attribute.
	    * @param {String} [args.for] The "for" attribute.
	    * @param {String} [args.id] The "id" attribute.
	    * @param {String} [args.size] The "size" attribute.
	    * @param {String} [args.ti] The "tabindex" attribute.
	    * @param {String} [args.title] The "title" attribute.
	    * @param {String} [args.type] The "type" attribute.
	    * @param {String} [args.val] The "value" attribute.
	    * @param {Boolean} args.close Is this a self-closing element?
	    */
	   make : function (args) {
	                          /**
	                           * isDef is used internally to create the standardized string for a single attribute of an element.
	                           * @param {String} arg The attribute key value to test.
	                           * @param {String} attr The attribute text to use in the generated HTML string.
	                           */
	                          var isDef = function (arg, attr) {
	                                                           return (typeof(arg) !== 'undefined') ? ' ' + attr + '="' + arg + '"' : '';
	                                                           };
	                          return '<' + args.tag +
	                                       isDef(args.alt, 'alt') +
	                                       ((typeof(args.checked) !== "undefined") ? ' checked="checked"' : '') +
	                                       isDef(args.cl, 'class') +
	                                       isDef(args['for'], 'for') +
	                                       isDef(args.id, 'id') +
	                                       isDef(args.css, 'style') +
	                                       isDef(args.size, 'size') +
	                                       isDef(args.ti, 'tabindex') +
	                                       isDef(args.title, 'title') +
	                                       isDef(args.type, 'type') +
	                                       isDef(args.val, 'value') +
	                                       (args.close ? '/>' : '>');
	   },
	   /**
	    * @description Used to create simple elements, with no attributes, such as &lt;textarea&gt;.
	    * @example html.make('textarea')
	    * @param {String} tag The element type to create.
	    * @augments html.make
	    * @see html.close
	    */
	   basic : function (tag) {
	                          return html.make({
	                                           tag     : tag,
	                                           close   : false
	                                           });
	   },
	   /**
	    * @description Creates a button-type input (which is removed from the tab index).
	    * @param {Object} args The attributes to be added to the &lt;input&gt; string being formed.
	    * @param {String} [args.id] The "id" attribute.
	    * @param {String} [args.cl] The "class" attribute.
	    * @param {String} [args.css] The "style" attribute.
	    * @param {String} [args.val] The "value" attribute.
	    * @augments html.make
	    * @see html.close
	    * @see html.input
	    */
	   button : function (args) {
	                            var checkDef = html.checkDef;
	                            return html.input({
	                                              id   : checkDef(args.id),
	                                              cl   : checkDef(args.cl),
	                                              css  : checkDef(args.css),
	                                              ti   : '-1',
	                                              type : 'button',
	                                              val  : checkDef(args.val)
	                                              });
	   },
	   /**
	    * @description Used to create simple closing elements, such as &lt;/textarea&gt;.
	    * @example html.close('textarea')
	    * @param {String} tag The element type to close.
	    * @augments html.make
	    * @see html.basic
	    */
	   close : function (tag) {
	                          return html.basic('/' + tag);
	   },
	   /**
	    * @description Used to create div elements.
	    * @example html.div({ cl: 'foo', id: 'bar' })
	    * @param {Object} args The attributes to be added to the &lt;div&gt; string being formed.
	    * @param {String} [args.alt] The "alt" attribute.
	    * @param {String} [args.cl] The "class" attribute.
	    * @param {String} [args.css] The "style" attribute.
	    * @param {String} [args.id] The "id" attribute.
	    * @param {String} [args.title] The "title" attribute.
	    * @augments html.make
	    * @see html.close
	    * @see html.divNoDisplay
	    */
	   div : function (args) {
	                         var checkDef = html.checkDef;
	                         return html.make({
	                                          tag   : 'div',
	                                          alt   : checkDef(args.alt),
	                                          cl    : checkDef(args.cl),
	                                          css   : checkDef(args.css),
	                                          id    : checkDef(args.id),
	                                          title : checkDef(args.title),
	                                          close : false
	                                          });
	   },
	   /**
	    * @description Used to create simple hidden div elements; the "display" property is used to hide the element.
	    * @example html.divNoDisplay({ cl: 'foo', id: 'bar' })
	    * @param {Object} args The attributes to be added to the &lt;div&gt; string being formed.
	    * @param {String} [args.cl] The "class" attribute.
	    * @param {String} [args.id] The "id" attribute.
	    * @augments html.div
	    * @see html.close
	    * @see html.div
	    */
	   divNoDisplay : function (args) {
	                                  var checkDef = html.checkDef;
	                                  return html.div({
	                                                  cl  : checkDef(args.cl),
	                                                  css : html.css.displayNone,
	                                                  id  : checkDef(args.id)
	                                                  });
	   },
	   /**
	    * @description Used to create fieldset elements.
	    * @example html.fieldset({ cl: 'foo', id: 'bar' })
	    * @param {Object} args The attributes to be added to the &lt;fieldset&gt; string being formed.
	    * @param {String} [args.cl] The "class" attribute.
	    * @param {String} [args.css] The "style" attribute.
	    * @param {String} [args.id] The "id" attribute.
	    * @augments html.make
	    * @see html.close
	    */
	   fieldset : function (args) {
	                              var checkDef = html.checkDef;
	                              return html.make({
	                                               tag   : 'fieldset',
	                                               cl    : checkDef(args.cl),
	                                               css   : checkDef(args.css),
	                                               id    : checkDef(args.id),
	                                               close : false
	                                               });
	   },
	   /**
	    * @description Used to create input elements.
	    * @example html.input({ cl: 'foo', id: 'bar', type: 'checkbox' })
	    * @param {Object} args The attributes to be added to the &lt;input&gt; string being formed.
	    * @param {String} [args.checked] The "checked" attribute.
	    * @param {String} [args.cl] The "class" attribute.
	    * @param {String} [args.css] The "style" attribute.
	    * @param {String} [args.id] The "id" attribute.
	    * @param {String} [args.size] The "size" attribute.
	    * @param {String} [args.ti] The "tabindex" attribute.
	    * @param {String} [args.type] The "type" attribute; by default, inputs of type text will be created if this is omitted.
	    * @param {String} [args.val] The "value" attribute.
	    * @augments html.make
	    * @see html.button
	    * @see html.close
	    */
	   input : function (args) {
	                           var checkDef = html.checkDef;
	                           return html.make({
	                                            tag   : 'input',
	                                            cl    : checkDef(args.cl),
	                                            check : checkDef(args.check),
	                                            css   : checkDef(args.css),
	                                            id    : checkDef(args.id),
	                                            size  : checkDef(args.size),
	                                            ti    : checkDef(args.ti),
	                                            type  : typeof(args.type) !== 'undefined' ? args.type : 'text',
	                                            val   : checkDef(args.val),
	                                            close : true
	                                            });
	   },
	   /**
	    * @description Used to create label elements.
	    * @example html.label({ cl: 'foo', id: 'bar' })
	    * @param {Object} args The attributes to be added to the &lt;label&gt; string being formed.
	    * @param {String} [args.cl] The "class" attribute.
	    * @param {String} [args.css] The "style" attribute.
	    * @param {String} [args.for] The "for" attribute.
	    * @param {String} [args.id] The "id" attribute.
	    * @param {String} [args.val] The string to use for the label's text.
	    * @augments html.make
	    * @see html.close
	    */
	   label : function (args) {
	                           var checkDef = html.checkDef;
	                           return html.make({
	                                            tag   : 'label',
	                                            cl    : checkDef(args.cl),
	                                            css   : checkDef(args.css),
	                                            'for' : checkDef(args['for']),
	                                            id    : checkDef(args.id),
	                                            close : false
	                                            }) +
	                                  (typeof(args.val) !== 'undefined' ? args.val : '') +
	                                  html.close('label');
	   },
	   /**
	    * @description Used to create unpopulated select elements with a default "[ Select One ]" option.
	    * @example html.select({ cl: 'foo', id: 'bar' })
	    * @param {Object} args The attributes to be added to the &lt;select&gt; string being formed.
	    * @param {String} [args.cl] The "class" attribute.
	    * @param {String} [args.css] The "style" attribute.
	    * @param {String} [args.id] The "id" attribute.
	    * @augments html.make
	    * @see html.close
	    */
	   select : function (args) {
	                            var checkDef = html.checkDef,
	                                close = html.close,
	                                make = html.make;
	                            return make({
	                                        tag   : 'select',
	                                        cl    : checkDef(args.cl),
	                                        id    : checkDef(args.id),
	                                        css   : checkDef(args.css),
	                                        close : false
	                                        }) +
	                                   make({
	                                        tag   : 'option',
	                                        val   : '',
	                                        close : false
	                                        }) +
	                                   '[ ' + text.SelectOne + ' ]' +
	                                   close('option') +
	                                   close('select');
	   },
	   /**
	    * @description Used to create span elements.
	    * @example html.span({ cl: 'foo', id: 'bar' })
	    * @param {Object} args The attributes to be added to the &lt;label&gt; string being formed.
	    * @param {String} [args.cl] The "class" attribute.
	    * @param {String} [args.css] The "style" attribute.
	    * @param {String} [args.id] The "id" attribute.
	    * @augments html.make
	    * @see html.close
	    */
	   span : function (args) {
	                          var checkDef = html.checkDef;
	                          return html.make({
	                                           tag   : 'span',
	                                           cl    : checkDef(args.cl),
	                                           id    : checkDef(args.id),
	                                           css   : checkDef(args.css),
	                                           close : false
	                                           });
	   }
    },

    /** @namespace Main storage array; keeps common variables and functionality globally available without polluting the global namespace. */
    MusicBrainz = {

	$cache : {},

	countrySelectArray : [],
    
	roundness  : "round 6px",
    
	annotationEditorBuilt : false,

	newArtists : [],

	artistEditor : {
	               currentTrack        : "",
                       lookupResults       : [],
	               add_window          : {
	                                     background  : "#F9F9F9",
	                                     borderColor : "#666",
	                                     id          : "artistAddBox",
	                                     round       : false
	                                     },
	               editor_window       : {
	                                     background  : "#F9F9F9",
	                                     borderColor : "#666",
	                                     css         : {
	                                                   width  : "32em"
	                                                   },
	                                     id          : "artistEditBox",
	                                     round       : false
	                                     },
	               edit_width_with_AC  : "52",
	               editor_inputs       : 'input.artistName, input.artistCredit, input.joinPhrase',
	               html : {
	                      button : {
	                               add: function () {
	                                        return html.button({ id: 'NewArtistButton', val: text.AddArtistShort });
	                               },
	                               done: function () {
	                                         return html.button({ id: 'ArtistDoneButton', val: text.Done });
	                               },
	                               remove: function () {
	                                           return html.div({ cl: 'removeArtist' }) + html.close('div');
	                               }
	                      },
	                      input : {
	                              joiner: function () {
	                                          return html.input({ cl: 'artistCredit' });
	                              }
	                      },
	                      row : {
	                            artist: function () {
	                                        var close = html.close,
	                                            div   = html.div,
	                                            input = html.input;
	                                        return div({ cl : 'artistLine' }) +
	                                                   aeHTML.button.remove +
	                                                   div({ cl: 'artistResolvedName' }) + close('div') +
	                                                   input({ cl: 'artistName' }) +
	                                                   aeHTML.input.joiner +
	                                                   input({ cl: 'joinPhrase', css: 'visibility:hidden;' }) +
	                                               close('div');
	                            },
	                            header: function () {
	                                        var close = html.close,
	                                            div   = html.div,
	                                            makeDiv = function (args, thisText) {
	                                                          return div(args) + thisText + close('div');
	                                            };
	                                        return div({ cl: 'artistLine labelLine' }) +
	                                                   makeDiv({ id: 'labelArtist' }, text.ArtistName) +
	                                                   makeDiv({ id: 'labelCredit' }, text.ArtistCredit) +
	                                                   makeDiv({ id: 'labelJoiner', css: 'width:8em;' }, text.ArtistJoiner) +
	                                               close('div');
	                            }
	                      },
	                      box : {
	                            lookup: function () {
	                                        var oneSpace = ' ',
	                                            button             = html.button,
	                                            close              = html.close,
	                                            css                = html.css,
	                                            displayInlineBlock,
	                                            div                = html.div,
	                                            input              = html.input,
	                                            span               = html.span,
	                                            addStyle           = MusicBrainz.addStyle,
	                                            lookup             = 'lookup',
	                                            AddNew             = 'AddNew',
	                                            idaddNew           = '#addNew-',
	                                            Results            = 'Results',
	                                            Name               = 'Name',
	                                            Controls           = 'Controls',
	                                            makeDivND          = function (thisID, thisHTML) {
	                                                                     return html.divNoDisplay({ id: thisID }) + thisHTML + close('div');
	                                            },
	                                            makeSpan           = function (args, thisHTML) {
	                                                                     return span(args) + thisHTML + close('span');
	                                            };
	                                        displayInlineBlock = css.displayIB;
	                                        addStyle('.label' + AddNew + '{font-weight:600;width:17%;' + displayInlineBlock + '}');
	                                        addStyle('#' + lookup + AddNew + ' div{padding-top:5px;width:100%;}');
	                                        addStyle('#' + lookup + AddNew + ' fieldset{border-width:0;margin-bottom:0;padding:0;' + displayInlineBlock + '}');
	                                        addStyle('#' + lookup + AddNew + ' .ui-watermark-label{top:4px;}');
	                                        addStyle(idaddNew + Name + ',' + idaddNew + Name + 'Sort,' + idaddNew + 'Comment{width:80%;}');
	                                        return div({ cl: 'center', id: lookup + Controls}) +
	                                                   button({ id: 'btnArtistSearch', ti: -1, val: text.SearchArtist }) +
	                                                   makeDivND(lookup + 'NoArtist', text.ArtistNameIsEmpty) +
	                                                   makeDivND(lookup + 'No' + Results, text.ArtistLookupNoResults) +
	                                                   makeDivND(lookup + 'Searching', '<img src="/static/images/loading-small.gif"/> ' + text.ArtistLookupSearching) +
	                                               close('div') +
	                                               makeDivND(lookup + 'Info', makeSpan({}, text.ArtistLookupResults) +
	                                                                          oneSpace + text.ArtistLookupMatches + oneSpace +
	                                                                          makeSpan({ id: lookup + 'Matches' }, '') +
	                                                                          ', ' + text.ArtistLookupLoaded + oneSpace +
	                                                                          makeSpan({ id: lookup + 'Loaded' }, '') +
	                                                                          ', ' + text.Results + oneSpace +
	                                                                          makeSpan({ id: Results + 'Start' }, '') +
	                                                                          ' &ndash; ' +
	                                                                          makeSpan({ id: Results + 'End' }, '')) +
	                                               makeDivND(lookup + Results, ' ') +
	                                               makeDivND(lookup + 'Bottom' + Controls, div({ id: lookup + 'HasAC', css: css.floatLeft }) +
	                                                                                           input({ id: 'hasAC', ti: -1, type: 'checkbox' }) +
	                                                                                           oneSpace +
	                                                                                           html.label({ 'for': 'hasAC', val: text.HasDiffArtistCredit }) +
	                                                                                       close('div') +
	                                                                                       div({ css: css.floatRight }) +
	                                                                                           button({ id: 'btnArtistAdd', ti: -1, val: text.AddArtistNew }) +
	                                                                                       close('div')) +
	                                               makeDivND(lookup + AddNew, ' ');
	                                        }
	                      }
	               },
	               lookupBox           : {
	                                     after       : true,
	                                     background  : '#f0f0f0',
	                                     borderColor : "#666",
	                                     css         : {
	                                                   'float' : "left",
	                                                   width   : "11em"
	                                                   },
	                                     id          : "artistLookup",
	                                     round       : false
	                                     },
	               store_active_editor : "",
	               searchServer        : "/ajax/search",
	               queryBase           : "type=artist&limit=20&query=",
	               toolsWereActive     : false,
	               widthNameAndAC      : false,
	               storeNewArtist      : function (artist) {
	                                         MusicBrainz.newArtists.push(artist);
	                                     },
	               destroyGeneric      : function (element) {
	                                         $(element).unbind("outerClick");
	                                         $(element).removeShadow()
	                                                   .css("display","none")
	                                                   .remove();
	                                     },
	               destroyArtistEditor : function () {
// (window.console) ? console.time("destroyArtistEditor") : '';
	                                                 artistEditor.widthNameAndAC = false;
	                                                 artistEditor.destroyGeneric("#artistEditBox");
// (window.console) ? console.timeEnd("destroyArtistEditor") : '';
	                                                 },
	               destroyLookup       : function () {
// (window.console) ? console.time("destroyLookup") : '';
                                                         artistEditor.lookupResults.length = 0;
	                                                 artistEditor.currentTrack = "";
	                                                 artistEditor.destroyGeneric("#artistLookup");
// (window.console) ? console.timeEnd("destroyLookup") : '';
	                                                 },
	               flashEditorWindow   : function () {
	                                                 $("#artistEditBox").find("div:first")
	                                                                    .effect("highlight", {}, 800)
	                                                                    .effect("highlight", {}, 800)
	                                                                    .effect("highlight", {}, 800);
	                                                 },
	               identifyUnresolved  : function (data) {
// (window.console) ? console.time("identifyUnresolved") : '';
	                                                     $('.trackartist').css("backgroundColor","transparent");
	                                                     $('.trackartist:has(> div > input[type=text]:visible), .trackartist:has(div > textarea:visible)').css("backgroundColor","#ffb");
// (window.console) ? console.timeEnd("identifyUnresolved") : '';
	                                                 },
	               processResults      : function (data) {
// (window.console) ? console.time("processResults") : '';
// TODO: Add support for locally created artists.
                                                             var lookupResults = artistEditor.lookupResults;
	                                                     artistEditor.currentTrack = ""; // Clear the current track store, so a new lookup can be done
	                                                     $("#lookupSearching").css("display","none"); // (for new text, etc) on that same artist field.
	                                                     $("#artistLookup").bind("outerClick", artistEditor.destroyLookup);
	                                                     if (data.results.length === 0) {
	                                                         $("#lookupNoResults").css("display","block");
	                                                     } else {
	                                                         $("#lookupInfo").css("display","block");
	                                                         $.each($.map(data.results, function (result) {
	                                                             var close = html.close,
	                                                                 div = html.div;
                                                                         lookupResults.push(result.name);
	                                                                 return $(html.divNoDisplay({ cl: 'result' }) +
	                                                                               div({ cl: 'artist' }) +
	                                                                                   result.name +
	                                                                               close('div') +
	                                                                              ((typeof(result.comment) !== "undefined") ? div({ cl: 'disambiguation' }) + result.comment + close('div') : '') +
	                                                                          close('div'));
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
	                                                         $("#lookupLoaded").text((isNaN(alreadyLoaded) ? 0 : alreadyLoaded) + data.results.length);
	                                                         $("#lookupResults").css("padding-top",".5em")
	                                                                            .css("backgroundColor","#fff")
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
	                                                         $("#ResultsStart").text(1);
	                                                         $("#ResultsEnd").text((data.results.length > 9) ? 10 : data.results.length);
	                                                         if ($("#lookupResults").css("display") === "none") {
	                                                             $("#artistLookup").find("div:first")
	                                                                               .animate({ backgroundColor: "#fff"},{queue: false});
	                                                             $("#lookupResults").css("backgroundColor","#fff") // It should already be #fff, but rarely
	                                                                                .slideDown(200);               // everything above goes too quickly and
	                                                             $("#lookupBottomControls").css({                  // the .css() color change gets skipped.
	                                                                                            marginTop: "1em",
	                                                                                            display: "block"
	                                                                                            });
	                                                             window.setTimeout(function () {
	                                                                                           $("#artistLookup").redrawShadow();
	                                                                                           }, 225);
	                                                         }
	                                                     }
// (window.console) ? console.timeEnd("processResults") : '';
	                                                     },
	               resetAppearance     : function () {
// (window.console) ? console.time("resetAppearance") : '';
	                                                 $(artistEditor.editor_inputs).css("backgroundColor","#dadada");
	                                                 artistEditor.destroyLookup();
// (window.console) ? console.timeEnd("resetAppearance") : '';
	                                                 },
	               resolveArtist      : function (element, $artistInput, event) { /* Resolve artist when lookup result is clicked. */
// (window.console) ? console.time("resolveArtist") : '';
	                                                                            var $displayText,
	                                                                                resultData = $(element).data("artistInfo"),
	                                                                                showAC = false,
	                                                                                $tempHasAC,
	                                                                                $thisEditor,
	                                                                                nextJP,
	                                                                                case1 = function () {
	                                                                                                    $displayText = $artistInput.val(resultData.name) // Update the text in the input.
	                                                                                                                               .parent() // The input's parent div.
	                                                                                                                               .parent() // The div's parent td (the artist editing cell).
	                                                                                                                               .css("display","none") // Hide it.
	                                                                                                                               .prev() // The previous td (the artist display text cell).
	                                                                                                                               .show() // Show that td.
	                                                                                                                               .find("div"); // The artist cell's display text is in this div.
	                                                                                },
	                                                                                case2 = function () {
	                                                                                                    $artistInput.parent()
	                                                                                                                .next()
	                                                                                                                .remove(); // Get rid of the "add another artist" icon button.
	                                                                                                    $artistInput.removeClass("oneArtist") // Get rid of the "simple case" triggering class.
	                                                                                                                .addClass("artistName") // Add the class for an artist name input inside of the artist editor.
	                                                                                                                .after('<textarea readonly="readonly" class="editTAs">' + resultData.name + '</textarea>') // Add the "complex artist" textarea.
	                                                                                                                .next() // Switch to the textarea.
	                                                                                                                .click() // Click on it to activate the artist editor (the event was auto-attached due to the live event).
	                                                                                                                .prev() // Switch back to the simple case artist name input.
	                                                                                                                .replaceAll($("#artistEditBox").find("input.artistName")) // Move the simple case's artist name input into the artist editor,
	                                                                                                                .css("display","inline") // Show the artist name input.      getting rid of the useless complex artist name input that's there.
	                                                                                                                .prev()
	                                                                                                                .css("display","none"); // Hide the displayed text for the artist.
	                                                                                                    $("#labelJoiner").css("visibility","hidden"); // Hide the label for the join phrase column.  There's only 1 artist, so no join phrase fields are visible.
	                                                                                                    $tempHasAC = $(html.input({ cl: 'hidden', id: 'hasAC', type: 'checkbox', check: true }));
	                                                                                                    $("body").append($tempHasAC); // Force the complex editor to detect a hasAC id.
	                                                                                                    window.setTimeout(function () {
	                                                                                                                                  $tempHasAC.remove(); // And then get rid of it again a second later, after it will have been detected.
	                                                                                                                                  }, 1000);
	                                                                                                    /* Now that we've set things up to be a pseudo-complex artist, restart the function and go through again, as a complex artist. */
	                                                                                                    artistEditor.resolveArtist($(html.div({})).data("artistInfo", resultData), $artistInput, event);
	                                                                                                    return false;
	                                                                                },
	                                                                                case3 = function () {
	                                                                                                    $displayText = $artistInput.val(resultData.name) // Update the text in the input.
	                                                                                                                               .css("display","none") // Hide the input.
	                                                                                                                               .prev() // The artist display text for the input.
	                                                                                                                               .css({ // Setting css here for $displayText, not $artistInput.
	                                                                                                                                    display       : "inline-block", // Show the resolved artist text's div inline with the rest of the artist line.
	                                                                                                                                    verticalAlign : 'middle',
	                                                                                                                                    visibility    : "visible",
	                                                                                                                                    width         : $artistInput.outerWidth() + 2 + "px" // 19em isn't 100% of the input's width - there's also the border width to deal with.
	                                                                                                                                    });
	                                                                                                    artistEditor.synchNextInput($artistInput, true); // Update the AC, if applicable (which in turn will trigger updating the textarea display text).
	                                                                                                    if (showAC || typeof(resultData.aCredit) !== "undefined") { // If the AC checkbox was checked, or if an artist object with an AC was passed,
	                                                                                                        $thisEditor = $("#artistEditBox");
	                                                                                                        $("#labelCredit").css("display", "block"); // make sure that the AC label is visible,
	                                                                                                        $artistInput.next()
	                                                                                                                    .css("display", "inline") // show the AC field for this artist line,
	                                                                                                                    .before(html.div({ cl: 'removeAC' }));
	                                                                                                        if (typeof(resultData.aCredit) !== "undefined") { // If an artist object with an AC was passed, use that AC.
	                                                                                                            $artistInput.nextAll()
	                                                                                                                        .filter(".artistCredit")
	                                                                                                                        .val(resultData.aCredit);
	                                                                                                        }
	                                                                                                        if (typeof(resultData.jPhrase) !== "undefined") { // If an artist object with a defined join phrase was passed, set that join phrase.
	                                                                                                            $artistInput.nextAll()
	                                                                                                                        .filter(".joinPhrase")
	                                                                                                                        .val(resultData.jPhrase);
	                                                                                                        }
	                                                                                                        $thisEditor.css("width", artistEditor.edit_width_with_AC + "em") // Make sure the artist editor popup is expanded to fit the AC column,
	                                                                                                                   .find("div:first") // Get the foreground edit window div,
	                                                                                                                   .css("width",parseInt($("#artistEditBox").width(), 10) - 16 + "px") // Adjust the width of the inner div to match the new outer div's width.
	                                                                                                                   .end()
	                                                                                                                   .redrawShadow(); // reset the shadow for that popup window,
	                                                                                                        if (!artistEditor.widthNameAndAC) { // If, in this artist editor, we've not yet done any artist with an AC,
	                                                                                                            /* then calculate the width required, for the artist name fields that don't have AC fields, to make them fill the AC space. */
	                                                                                                            nextJP = $artistInput.find("~ input.joinPhrase");
	                                                                                                            artistEditor.widthNameAndAC = nextJP.offset().left - $displayText.offset().left - (2 * (nextJP.outerWidth() - nextJP.width()));
	                                                                                                        }
	                                                                                                        $thisEditor.find("div:first > div:first > div:not(:first)") // Find all artist entry lines,
	                                                                                                                   .filter(":has(input.artistCredit:visible)") // and for those lines with visible AC fields,
	                                                                                                                   .find("input.artistName, div.artistResolvedName") // get the artist name input and resolved text elements in each,
	                                                                                                                   .each(function () { // make sure the width of those fields is at the 'visible AC' width,
	                                                                                                                                     $(this).css("width", "19em");
	                                                                                                                                     }
	                                                                                                                   )                      
	                                                                                                                   .end() // then return to the pre-find,
	                                                                                                                   .end() // pre-filter 'all artist entry lines' collection,
	                                                                                                                   .filter(":has(input.artistCredit:hidden)") // get those without a visible AC field,
	                                                                                                                   .find("input.artistName") // get the artist name input and resolved text elements in each,
	                                                                                                                   .each(function () { // and stretch out the width for the ones without a visible AC field.
	                                                                                                                                     $(this).css("width", artistEditor.widthNameAndAC - parseFloat($(0.5).toPx(), 10) - 2 + "px");
	                                                                                                                                     }
	                                                                                                                   )
	                                                                                                                   .end()
	                                                                                                                   .find("div.artistResolvedName").log()
	                                                                                                                   .each(function () {
	                                                                                                                                     $(this).css("width", artistEditor.widthNameAndAC + 2 + "px");
	                                                                                                                                     }
	                                                                                                                   );
	                                                                                                    }
	                                                                                };
	                                                                            /* BEGIN FUNCTION */
	                                                                            if ($("#hasAC:checked").length) { // If the AC checkbox is checked,
	                                                                                showAC = true; // store that setting (we get rid of the lookup next, and would lose this setting if it wasn't stored beforehand).
	                                                                            }
	                                                                            artistEditor.destroyLookup(); // Get rid of any open artist lookup.
	                                                                            if ($artistInput.hasClass("artistName")) { // Complex artist, case 3. => Artist editor.
	                                                                                case3();
	                                                                            } else { // Simple artist, cases 1 and 2
	                                                                                if (showAC) { // Case 2: 1 artist but artist name != artist credit. => Inline tracklist editor converts to the artist editor.
	                                                                                    case2();
	                                                                                } else {
	                                                                                    case1(); // Case 1: simple case, 1 artist and artist name == artist credit.  => Simple inline tracklist editor.
	                                                                                }
	                                                                            }
	                                                                            $displayText.text(resultData.name) // Change the display text.
	                                                                                        .click(function () { // Attach the event to allow toggling back from resolved artist to artist edit input field.
	                                                                                                               $(this).css("display","none");
	                                                                                                               $artistInput.css("display","inline")
	                                                                                                                           .focus();
	                                                                                                           }
	                                                                                        );
	                                                                            /* END FUNCTION */
// (window.console) ? console.timeEnd("resolveArtist") : '';
	                                                 },
	               synchNextInput      : function (thisElement, override) {
// (window.console) ? console.time("synchNextInput") : '';
	                                                 var artistbox = $($(thisElement).next());
	                                                 window.setTimeout(function () {
	                                                                               if (artistbox.val().length === 0 || override) {
	                                                                                   artistbox.val($.trim($(thisElement).val()));
	                                                                                   artistEditor.updateTrackArtist();
	                                                                               }
	                                                 }, 1);
// (window.console) ? console.timeEnd("synchNextInput") : '';
	                                                 },
	               thereCanBeOnlyOne   : function (errorMessage) {
// (window.console) ? console.time("thereCanBeOnlyOne") : '';
	                                                 $(html.div({}) + errorMessage + html.close('div')).dialog({
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
// (window.console) ? console.timeEnd("thereCanBeOnlyOne") : '';
	                                                 },
	               updateTrackArtist   : function () {
// (window.console) ? console.time("updateTrackArtist") : '';
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
// (window.console) ? console.timeEnd("updateTrackArtist") : '';
	                                                 },
	               events              : {
	                                     init            : function () {
// (window.console) ? console.time("initEvents") : '';
	                                                                   var aeEvents = artistEditor.events;
	                                                                   /* Lock the HTML strings. */
	                                                                   aeHTML.button.add    = aeHTML.button.add();
	                                                                   aeHTML.button.done   = aeHTML.button.done();
	                                                                   aeHTML.button.remove = aeHTML.button.remove();
	                                                                   aeHTML.input.joiner  = aeHTML.input.joiner();
	                                                                   aeHTML.row.artist    = aeHTML.row.artist();
	                                                                   aeHTML.row.header    = aeHTML.row.header();
	                                                                   aeHTML.box.lookup    = aeHTML.box.lookup();
	                                                                   aeHTML.box.addNew    = MusicBrainz.html_addNew_Generic('artist');
	                                                                   /* Set the artist-related events. */
	                                                                   aeEvents.makeEditor_One();
	                                                                   aeEvents.eventEditor_Many();
	                                                                   aeEvents.synchArtistInputs();
	                                                                   aeEvents.keepTACorrect();
	                                                                   aeEvents.initLookupBoxOne();
	                                                                   aeEvents.initLookupBoxMany();
	                                                                   aeEvents.synchACJPcolors();
	                                                                   aeEvents.initRemoveAC();
	                                                                   /* Artist Lookup */
	                                                                   aeEvents.initArtistLookup();
	                                                                   /* Artist Lookup -> Add New Artist */
	                                                                   aeEvents.HandleAddNewArtist();
	                                                                   aeEvents.CancelAddNewArtist();
	                                                                   aeEvents.CreateNewArtistClicked();
// (window.console) ? console.timeEnd("initEvents") : '';
	                                                                   },
	                                     /** Handle a click on the 'add artist' button: validate, and if the data is good,
                                               * store the artist to be created, then resolve the artist. **/
	                                     CreateNewArtistClicked: function () {
                                                 $("#CreateAdd").live("click", function () {
                                                     var artist,
                                                     formPrefix = '#addNew-',
                                                     datePrefix = 'Date-',
                                                     sDate,
                                                     eDate,
                                                     sDateObj,
                                                     eDateObj,
                                                     tDateObj,
                                                     colonSpace = ": ",
                                                     reused,
                                                     YearText,
                                                     MonthText,
                                                     DayText,
                                                     i,
                                                     validation = MusicBrainz.validation,
                                                     isLaterDate,
                                                     isValidDate,
                                                     isValidDay,
                                                     isValidMonth,
                                                     ChronologicalDates = text.ChronologicalDates,
                                                     CannotBeFuture = text.CannotBeFuture,
                                                     validated = 0,
                                                     rules = [],
                                                     getVal  = function (element) {
                                                                   return element.val();
                                                     },
                                                     validate = function ($elementToFlag, passesRule, message, i) {
                                                                   if (passesRule === true) {
                                                                       return true;
                                                                   } else {
                                                                       $elementToFlag.css("background-color","#FFB")
                                                                                     .bind("click", function () {
                                                                                                                $(".error" + i).css({
                                                                                                                                    fontWeight : 900,
                                                                                                                                    color      : 'red'
                                                                                                                                    });
                                                                                                                })
                                                                                     .bind("blur", function () {
                                                                                                               $("#errorList li").css({
                                                                                                                                      fontWeight : 500,
                                                                                                                                      color      : '#000'
                                                                                                                                      })
                                                                                                                });
                                                                       $('#errorList').append('<li class="error' + i + '">' +
                                                                                                  (passesRule === false ? message : passesRule) +  // Allow the rule's test to define the message.
                                                                                              '</li>');
                                                                       return false;
                                                                   }
                                                     },
                                                     commentRequiredButMissing = function () {
                                                         var commentRequired = function () {
                                                             return ($.inArray(artistEditor.lookupResults, reused.name.value) > -1);
                                                         };
                                                         return (commentRequired() && artist.comment.value === "");
                                                     };
                                                     $("#addErrors").css("display", "none");
                                                     $("#errorList").html(""); // Clear any errors that may be left over from an earlier creation attempt.
                                                     $("#addNewFields input[type=text]").css("background-color", "#FFF")
                                                                                        .unbind("click");
                                                     isLaterDate = validation.isLaterDate;
                                                     isValidDate = validation.isValidDate;
                                                     isValidDay = validation.isValidDay;
                                                     isValidMonth = validation.isValidMonth;
                                                     YearText = colonSpace + text.DateYear;
                                                     MonthText = colonSpace + text.DateMonth;
                                                     DayText = colonSpace + text.DateDay;
                                                     sDate = datePrefix + 'Start-';
                                                     eDate = datePrefix + 'End-';
                                                     /* Create the artist object. */
                                                     artist = {
                                                         comment: {
                                                             element : $(formPrefix + 'Comment'),
                                                             label   : text.Disambiguation,
                                                             value   : ""
                                                         },
                                                         country: {
                                                             element : $(formPrefix + 'Country'),
                                                             label   : text.Country,
                                                             value   : ""
                                                         },
                                                         date: {
                                                             start: {
                                                                 year: {
                                                                     element : $(formPrefix + sDate + 'Y'),
                                                                     label   : text.DateStart + YearText,
                                                                     value   : ""
                                                                 },
                                                                 month: {
                                                                     element : $(formPrefix + sDate + 'M'),
                                                                     label   : text.DateStart + MonthText,
                                                                     value   : ""
                                                                 },
                                                                 day: {
                                                                     element : $(formPrefix + sDate + 'D'),
                                                                     label   : text.DateStart + DayText,
                                                                     value   : ""
                                                                 }
                                                             },
                                                             end: {
                                                                 year: {
                                                                     element : $(formPrefix + eDate + 'Y'),
                                                                     label   : text.DateEnd + YearText,
                                                                     value   : ""
                                                                 },
                                                                 month: {
                                                                     element : $(formPrefix + eDate + 'M'),
                                                                     label   : text.DateEnd + MonthText,
                                                                     value   : ""
                                                                 },
                                                                 day: {
                                                                     element : $(formPrefix + eDate + 'D'),
                                                                     label   : text.DateEnd + DayText,
                                                                     value   : ""
                                                                 }
                                                             }
                                                         },
                                                         name: {
                                                             name: {
                                                                 element : $(formPrefix + 'Name'),
                                                                 label   : text.ArtistName,
                                                                 value   : ""
                                                             },
                                                             sort: {
                                                                 element : $(formPrefix + 'NameSort'),
                                                                 label   : text.NameSort,
                                                                 value   : ""
                                                             }
                                                         },
                                                         gender: {
                                                             element : $(formPrefix + 'Gender'),
                                                             label   : text.Gender,
                                                             value   : ""
                                                         },
                                                         type: {
                                                             element : $(formPrefix + 'Type'),
                                                             label   : text.Type,
                                                             value   : ""
                                                         }
                                                     };
                                                     reused = artist.date;
                                                     sDate = reused.start;
                                                     eDate = reused.end;
                                                     /* Store the value of each input field. */
                                                     $.each([artist.comment,
                                                             sDate.year,
                                                             sDate.month,
                                                             sDate.day,
                                                             eDate.year,
                                                             eDate.month,
                                                             eDate.day,
                                                             artist.name.name,
                                                             artist.name.sort], function () {
                                                         this.value = getVal(this.element);
                                                     });
                                                     artist.country.value = getVal(artist.country.element);
                                                     artist.gender.value = getVal(artist.gender.element);
                                                     artist.type.value = getVal(artist.type.element);
                                                     /* Define the validation rules for a new artist. */
                                                     reused = artist.name;
                                                     /* Create basic date objects to avoid creating them over and over. */
                                                     sDateObj = {
                                                                day   : sDate.day.value,
                                                                month : sDate.month.value,
                                                                year  : sDate.year.value
                                                                };
                                                     eDateObj = {
                                                                day   : eDate.day.value,
                                                                month : eDate.month.value,
                                                                year  : eDate.year.value
                                                                };
                                                     tDateObj = MusicBrainz.validation.getToday();
                                                     /* Artist name and sort name. */
                                                     rules = [
                                                             [reused.name.element, reused.name.value !== "", reused.name.label + colonSpace + text.CannotBeEmpty], // Artist name cannot be empty.
                                                             [reused.sort.element, reused.sort.value !== "", reused.sort.label + colonSpace + text.CannotBeEmpty], // Sort name cannot be empty.
                                                             [sDate.month.element, isValidMonth(sDate.month.value), sDate.month.label + colonSpace + text.NoSuchMonth], // Start month is valid
                                                             [sDate.day.element, isValidDay(sDate.year.value, sDate.month.value, sDate.day.value), sDate.day.label + colonSpace + text.NoSuchDay], // Start day is valid
                                                             [eDate.month.element, isValidMonth(eDate.month.value), eDate.month.label + colonSpace + text.NoSuchMonth], // End month is valid
                                                             [eDate.day.element, isValidDay(eDate.year.value, eDate.month.value, eDate.day.value), eDate.day.label + colonSpace + text.NoSuchDay], // End day is valid
                                                             [sDate.month.element, isValidDate("month")(sDate.year, sDate.month)], // Valid start date.
                                                             [sDate.day.element, isValidDate("day")("month")(sDate.month, sDate.day)], // Valid start date.
                                                             [sDate.day.element, isValidDate("day")("year")(sDate.year, sDate.day)], // Valid start date.
                                                             [eDate.month.element, isValidDate("month")(eDate.year, eDate.month)], // Valid end date.
                                                             [eDate.day.element, isValidDate("day")("month")(eDate.month, eDate.day)], // Valid end date.
                                                             [eDate.day.element, isValidDate("day")("year")(eDate.year, eDate.day)], // Valid end date.
                                                             [eDate.year.element, isLaterDate(sDateObj, eDateObj)("year"), eDate.year.label + colonSpace + ChronologicalDates], // End date comes after the start date.
                                                             [eDate.month.element, isLaterDate(sDateObj, eDateObj)("month"), eDate.month.label + colonSpace + ChronologicalDates], // End date comes after the start date.
                                                             [eDate.day.element, isLaterDate(sDateObj, eDateObj)("day"), eDate.day.label + colonSpace + ChronologicalDates], // End date comes after the start date.
                                                             [sDate.year.element, isLaterDate(sDateObj, tDateObj)("year"), sDate.year.label + colonSpace + CannotBeFuture], // Start date comes after today.
                                                             [sDate.month.element, isLaterDate(sDateObj, tDateObj)("month"), sDate.month.label + colonSpace + CannotBeFuture], // Start date comes after today.
                                                             [sDate.day.element, isLaterDate(sDateObj, tDateObj)("day"), sDate.day.label + colonSpace + CannotBeFuture], // Start date comes after today.
                                                             [eDate.year.element, isLaterDate(eDateObj, tDateObj)("year"), eDate.year.label + colonSpace + CannotBeFuture], // End date comes after today.
                                                             [eDate.month.element, isLaterDate(eDateObj, tDateObj)("month"), eDate.month.label + colonSpace + CannotBeFuture], // End date comes after today.
                                                             [eDate.day.element, isLaterDate(eDateObj, tDateObj)("day"), eDate.day.label + colonSpace + CannotBeFuture], // End date comes after today.
                                                             [artist.comment.element, commentRequiredButMissing(), text.CommentIsRequired]
                                                             ];
                                                     /* Test each rule.  Note that error messages are created by the test itself; the loop's body only serves to increment the validation count. */
                                                     for (i = 0; i < rules.length; i++) {
                                                         if (validate(rules[i][0], rules[i][1], rules[i][2], i)) {
                                                             validated++;
                                                         }
                                                     }
                                                     /* If all rules validated, add and resolve the artist. */
                                                     if (validated === rules.length) {
                                                         artistEditor.storeNewArtist(artist);
// TODO: Resolve the artist
                                                     } else {
                                                         $("#addErrors").show();
                                                         window.setTimeout(function () {
                                                                                       $("#artistLookup").redrawShadow();
                                             	                                  }, 400);
                                                     }
                                                 });
	                                     },
	                                     /** Attaches a click event to the "add a new artist" button for artist lookup windows. **/
	                                     HandleAddNewArtist: function () {
	                                         $("#btnArtistAdd").live("click", function (event) {
// TODO: Expand this to cover labels.
	                                             var $lookupAddNew = $("#lookupAddNew"),
	                                                 $artistLookup = $("#artistLookup"),
	                                                 $genderLabel,
	                                                 $addNewType,
	                                                 makeAutotabDate = MusicBrainz.makeAutotabDate,
	                                                 dateFieldsPrefix = 'addNew-Date-',
	                                                 dateFieldsPrefixS,
	                                                 dateFieldsPrefixE,
	                                                 hideGender = function () {
	                                                     $genderLabel.css("display", "none")
	                                                                 .prev()
	                                                                 .css("display", "none");
	                                                 };
	                                             dateFieldsPrefixS = dateFieldsPrefix + 'Start-';
	                                             dateFieldsPrefixE = dateFieldsPrefix + 'End-';
	                                             $lookupAddNew.append(aeHTML.box.addNew);
	                                             $("#addNew-Country").html($("#select-edit-release-country").html());
                                                     $('#addNew-Name').val($("#artistLookup").data("searchName"));
                                                     $('#addNew-NameSort').val($("#artistLookup").data("searchName"));
	                                             $genderLabel = $("#addNew-Gender").addOption(mb.artistgenders, false);
	                                             $addNewType = $("#addNew-Type").addOption(mb.artisttype, false);
	                                             /* Hide the current results and the "add a new artist" button. */
	                                             $("#btnArtistAdd, #lookupControls, #lookupInfo, #lookupResults").slideUp();
	                                             $artistLookup.find("div:first").css("background-color", "#F9F9F9");
	                                             hideGender();
	                                             $lookupAddNew.slideDown();
	                                             $("#lookupBottomControls").css("margin-top","");
	                                             window.setTimeout(function () {
	                                                                           $artistLookup.redrawShadow();
	                                                                           }, 375);
	                                             makeAutotabDate(dateFieldsPrefixS + 'Y', dateFieldsPrefixS + 'M', dateFieldsPrefixS + 'D');
	                                             makeAutotabDate(dateFieldsPrefixE + 'Y', dateFieldsPrefixE + 'M', dateFieldsPrefixE + 'D');
	                                             /* Based on the artist type, show or hide the gender field and set the date field label texts. */
	                                             $("#addNew-Type").bind("change", function () {
	                                                 var $labelStart = $(dateFieldsPrefixS + 'label'),
	                                                     $labelEnd = $(dateFieldsPrefixE + 'label'),
                                                              text = text; // Bring the text array into local scope.
	                                                 switch ($addNewType.val()) {
	                                                     case "1":
	                                                         $genderLabel.show()
	                                                                     .prev()
	                                                                     .show();
	                                                         $labelStart.text(text.DateOfBirth);
	                                                         $labelEnd.text(text.DateOfDeath);
	                                                         break;
	                                                     case "2":
                                                                 $("#addNew-Gender").val("");
	                                                         hideGender();
	                                                         $labelStart.text(text.DateFounded);
	                                                         $labelEnd.text(text.DateDissolved);
	                                                         break;
	                                                     default:
                                                                 $("#addNew-Gender").val("");
	                                                         hideGender();
	                                                         $labelStart.text(text.DateStart);
	                                                         $labelEnd.text(text.DateEnd);
	                                                 }
	                                             });
	                                         });
	                                     },
	                                     /** Handle a click on the 'cancel' button in an add artist window. **/
	                                     CancelAddNewArtist: function () {
	                                         $("#CancelAdd").live("click", function (event) {
	                                         // TODO: Expand this to cover labels.
	                                             var $lookupAddNew = $("#lookupAddNew"),
	                                                 $artistLookup = $("#artistLookup");
	                                             $lookupAddNew.slideUp();
	                                             $artistLookup.next()
	                                                          .css("display","none") // Avoid an initially laggy shadow.
	                                                          .prev()
	                                                          .find("div:first").css("background-color", "#FFF");
	                                             $("#lookupBottomControls").css("margin-top","1em");
	                                             $("#btnArtistAdd, #lookupControls, #lookupInfo, #lookupResults").slideDown();
	                                             window.setTimeout(function () {
                                                                                   $lookupAddNew.html(""); // Delayed until after the lookup is revealed, to avoid the slight lag effect this would otherwise cause.
                                                                                   $artistLookup.show()
                                                                                                .redrawShadow(); // Delayed so the height of the lookup window can settle before we calculate using it.
	                                             }, 300);
	                                         });
	                                     },
	                                     /** Create initial artist lookup. **/
	                                     initArtistLookup: function () {
	                                         $("#btnArtistSearch").live("click", function () {
	                                             var $artistLookup = $("#artistLookup"),
	                                                 $artistInput;
	                                             $artistInput  = $artistLookup.prev()
	                                                                          .find('input.artistName, input.oneArtist')
	                                                                          .val();
	                                             $("#btnArtistSearch").css('display', "none");
	                                             if ($artistInput.length === 0) {
	                                                 $('#lookupNoArtist').css('display', "block");
	                                             } else {
	                                                 $('#lookupControls').css({
	                                                                          textAlign : "left",
	                                                                          margin    : "0",
	                                                                          padding   : "0 2em 0"
	                                                                          });
	                                                 $('#lookupSearching').show();
	                                                 $artistLookup.find("> div:first")
	                                                              .css("width", '')
	                                                              .end()
                                                                      .data("searchName", $artistInput)
	                                                              .animate({
	                                                                       width:"45em"
	                                                                       },
	                                                                       150,
	                                                                       'swing',
	                                                                       function () {
	                                                                           $artistLookup.redrawShadow();
	                                                                           $.ajax({
	                                                                                  async    : false,
	                                                                                  cache    : true,
	                                                                                  success  : artistEditor.processResults,
	                                                                                  data     : artistEditor.queryBase + escape($artistInput),
	                                                                                  dataType : "json",
	                                                                                  type     : "GET",
	                                                                                  url      : artistEditor.searchServer
	                                                                                  }
	                                                                           );
	                                                                       }
	                                                              );
	                                             }
	                                         });
	                                     },
	                                     initRemoveAC: function () { /* Remove an AC field when a remove AC icon is clicked. */
	                                         $(".removeAC").live("click", function (e) {
	                                             var $thisACremover = $(this),
	                                                 $thisEditor = $("#artistEditBox"),
	                                                 $thisArtistName,
	                                                 $artistLines;
	                                             $thisArtistName = $thisACremover.prev();
	                                             $artistLines = $thisEditor.find("> div:first > div:first");
	                                             $thisACremover.css("display","none") // Hide the AC toggle icon,
	                                                           .next() // get the associated AC input field,
	                                                           .css("display","none") // hide it,
	                                                           .val($thisArtistName.val()); // set the AC field value to the current artist name field's value,
	                                             $thisACremover.remove(); // and remove the AC toggle icon.
	                                             artistEditor.synchNextInput($thisArtistName, true); // Resync the textarea.
	                                             $thisArtistName.css("width", artistEditor.widthNameAndAC - parseFloat($(0.5).toPx(), 10) - 2 + "px") // Resize the artist name input.
	                                                            .prev() // Get the resolved artist text div,
	                                                            .css("width", artistEditor.widthNameAndAC + 2 + "px"); // and resize it as well.
	                                             if ($artistLines.find("input.artistCredit:visible").length === 0) { // If this was the last visible AC field,
	                                                 $artistLines.find("input.artistName") // get all artist name input fields,
	                                                             .css("width", "19em") // resize them to the initial "no-AC" width,
	                                                             .end()
	                                                             .find("div.artistResolvedName") // and all artist resolved name divs,
	                                                             .css("width", $thisArtistName.outerWidth() + 2 + "px"); // and resize them to the initial "no-AC" width.
	                                                 $("#labelCredit").css("display", "none"); // Hide the AC fields' column label.
	                                                 $thisEditor.css("width", "32em") // Re-shrink the artist editor,
	                                                                .find("div:first") // get the inner div,
	                                                                .css("width", parseInt($(32).toPx(), 10) - 16) // re-shrink it,
	                                                                .end()
	                                                                .redrawShadow(); // and fix the editor window's shadow for the new width.
	                                             }
	                                         });
	                                     },
	                                     synchArtistInputs  : function () { /* Keep the AC synched to the artist name, but only if the AC hasn't been modified independently. */
// (window.console) ? console.time("synchArtistInputs") : '';
	                                                                   $("input.artistName").live("keydown", function () {
	                                                                       $(this).data("oldVal").push($(this).val());
	                                                                   }).live("keyup", function () {
	                                                                       var thisAC = $(this).next().val();
	                                                                       if (thisAC.length === 0 || $.inArray(thisAC, $(this).data("oldVal")) > -1) {
	                                                                           $(this).next().val($.trim($(this).val()));
	                                                                           artistEditor.updateTrackArtist();
	                                                                       }
	                                                                   }).live("paste", function () {
	                                                                       artistEditor.synchNextInput(this, true);
	                                                                   }).live("blur", function () {
	                                                                       $(this).data("oldVal", []);
	                                                                   });
// (window.console) ? console.timeEnd("synchArtistInputs") : '';
	                                                                   },
	                                     makeEditor_One  : function () { /* This is used when a track artist has only 0 or 1 artist as constituant artist. */
// (window.console) ? console.time("makeEditor_One") : '';
	                                                                   $("div.addArtist").live("click", function (e) {
                                                                                var div = html.div;
	                                                                       artistEditor.destroyLookup();
	                                                                       if ($("#artistEditBox").length > 0) {
	                                                                           e.stopPropagation();
	                                                                           artistEditor.thereCanBeOnlyOne(text.ArtistEditorError);
	                                                                       } else {
	                                                                           artistEditor.store_active_editor = e.target;
	                                                                           $(this).parent()
	                                                                                  .makeFloatingDiv(artistEditor.editor_window)
	                                                                                  .find("div:first")
	                                                                                  .append(div({}) + 
	                                                                                              aeHTML.row.header +
	                                                                                          html.close('div') +
	                                                                                          div({}) +
	                                                                                              aeHTML.button.done +
	                                                                                              aeHTML.button.add + 
	                                                                                          html.close('div'))
	                                                                                  .parent()
	                                                                                  .parent()
	                                                                                  .find("div:first")
	                                                                                  .append('<textarea readonly="readonly" class="editTAs">' + 
	                                                                                          $(this).parent().find("div:first").find("input").val() +
	                                                                                          '</textarea>')
	                                                                                  .find("input")
	                                                                                  .appendTo("#artistEditBox > div:first > div:first")
	                                                                                  .wrap(html.div({ cl: 'artistLine' }))
	                                                                                  .removeClass("oneArtist")
	                                                                                  .before(aeHTML.button.remove + html.div({ cl: 'artistResolvedName' }) + html.close('div'))
	                                                                                  .after(aeHTML.input.joiner + html.input({ cl: 'joinPhrase', val: '&' }))
	                                                                                  .addClass("artistName")
	                                                                                  .parent()
	                                                                                  .after(aeHTML.row.artist)
	                                                                                  .parents("td.trackartist")
	                                                                                  .find("div:first")
	                                                                                  .find("textarea")
	                                                                                  .autogrow({minHeight: 1, expandTolerance: 0});
	                                                                           artistEditor.updateTrackArtist();
	                                                                           $("#artistEditBox > div:first > div:first > div:eq(1) > input:first").focus();
	                                                                           $(this).css("display","none")
	                                                                                  .remove();
	                                                                           $(".artistName").data("oldVal",[]);
	                                                                           $(".artistCredit:first").val($("#artistEditBox").find("div:first").find("input:eq(2)").val());
	                                                                       }
	                                                                   });
// (window.console) ? console.timeEnd("makeEditor_One") : '';
	                                                                   },
    
    
	                                     eventEditor_Many: function () { /* Open an artist editor for a track artist with more than 1 artist as constituant artists. */
// (window.console) ? console.time("eventEditor_Many") : '';
	                                                                   $("textarea.editTAs").live("click", function (event) {
	                                                                       artistEditor.events.makeEditor_Many($(this), event);
	                                                                   });
// (window.console) ? console.timeEnd("eventEditor_Many") : '';
	                                                                   },
	                                     makeEditor_Many : function ($element, event) { /* Create an artist editor. */
// (window.console) ? console.time("makeEditor_Many") : '';
	                                                                       if ($("#artistEditBox").length > 0) { // If another artist editor is already active, don't open another one.
	                                                                           if (artistEditor.store_active_editor !== event.target) { // The textarea the user clicked on was *not* the one already being edited.
	                                                                               event.stopPropagation();
	                                                                               artistEditor.thereCanBeOnlyOne();
	                                                                           }
	                                                                       } else {
	                                                                           artistEditor.store_active_editor = event.target;
	                                                                           var artistData = $element.parent().data("TAs"),
	                                                                               dataHTML = "",
	                                                                               $editorBox,
	                                                                               $artistCell,
	                                                                               textareaHeight,
	                                                                               cellHeight,
	                                                                               i,
	                                                                               loops; 
	                                                                           for (i = 0, loops = artistData.length; i < loops; i++) {
	                                                                               dataHTML += html.div({ cl: 'artistLine' }) +
	                                                                                               aeHTML.button.remove + 
	                                                                                               html.div({ cl: 'artistResolvedName' }) + html.close('div') +
	                                                                                               html.input({ cl: 'artistName', val: artistData[i].name }) +
	                                                                                               html.input({ cl: 'artistCredit', val: artistData[i].credit }) +
	                                                                                               html.input({ cl: 'joinPhrase', val: artistData[i].join }) +
	                                                                                           html.close('div');
	                                                                           }
	                                                                           $editorBox = $element.parent()
	                                                                                               .parent()
	                                                                                               .makeFloatingDiv(artistEditor.editor_window)
	                                                                                               .find("div:first")
	                                                                                               .append(html.div({}) + 
	                                                                                                           aeHTML.row.header +
	                                                                                                       html.close('div') +
	                                                                                                       html.div({}) +
	                                                                                                           aeHTML.button.done +
	                                                                                                           aeHTML.button.add + 
	                                                                                                       html.close('div'))
    
	                                                                                               .find("div:first")
	                                                                                               .append(dataHTML)
	                                                                                               .find("input:last")
	                                                                                               .css("visibility","hidden")
	                                                                                               .end()
	                                                                                               .end()
	                                                                                               .end();
	                                                                           $(".artistName").data("oldVal",[]);
	                                                                           artistEditor.updateTrackArtist();
	                                                                           $artistCell = $editorBox.parents("td:first");
	                                                                           /* Resolve the individual track artist artists/ */
	                                                                           $editorBox.find("> div:first > div:first > div:not(:first) > input")
	                                                                                     .filter(".artistName")
	                                                                                     .each(function (i) {
	                                                                                                         var thisData = artistData[i];
	                                                                                                         artistEditor.resolveArtist($(html.div({})).data("artistInfo", {
	                                                                                                                                                     comment : thisData.disambig,
	                                                                                                                                                     gid     : thisData.gid,
	                                                                                                                                                     name    : thisData.name,
	                                                                                                                                                     rowid   : thisData.rowID,
	                                                                                                                                                     aCredit : (thisData.name !== thisData.credit) ? thisData.credit : undefined,
	                                                                                                                                                     jPhrase : thisData.join
	                                                                                                                                                     }), $(this));
	                                                                                                        }
	                                                                                     )
	                                                                                     .end()
	                                                                                     .filter(":first")
	                                                                                     .focus()
	                                                                                     .end()
	                                                                                     .end();
	                                                                           window.setTimeout(function () { // Need a tiny delay to allow the autogrow on the textarea to kick in before reading that height.
	                                                                                                         textareaHeight = $artistCell.find("textarea").height();
	                                                                                                         cellHeight = $artistCell.height();
	                                                                                                         cellHeight = (cellHeight > textareaHeight) ? cellHeight : textareaHeight;
	                                                                                                         $editorBox.css("top", $artistCell.offset().top + cellHeight + "px")
	                                                                                                                   .redrawShadow();
	                                                                                                         }, 1);
	                                                                           if ($("#toolsHead").hasClass("toolsHeadGrey")) { // If "show tools" is currently on,
	                                                                               MusicBrainz.toggleTools(); // hide the tools.
	                                                                               artistEditor.toolsWereActive = true;
	                                                                               $("#toolsHead").css("display", "none");
	                                                                           }
	                                                                       }
// (window.console) ? console.timeEnd("makeEditor_Many") : '';
	                                                                   },
	                                     keepTACorrect   : function () { /* Listen for changes to ACs or join phrases, to keep the trackartist textareas updated. */
// (window.console) ? console.time("keepTACorrect") : '';
	                                                                   $("input.artistCredit, input.joinPhrase").live("change", function () {
	                                                                       artistEditor.updateTrackArtist();
	                                                                   }).live("keyup", function () {
	                                                                       artistEditor.updateTrackArtist();
	                                                                   }).live("paste", function () {
	                                                                       artistEditor.updateTrackArtist();
	                                                                   });
// (window.console) ? console.timeEnd("keepTACorrect") : '';
	                                                                   },
	                                     initLookupBoxOne: function () {
    
	                                                                   $('input.oneArtist').live("focusin", function (e) {
// (window.console) ? console.time("initLookupBoxOne") : '';
	                                                                       if ($("#artistEditBox").length > 0) { // Don't allow a simple case lookup to be opened when an artist editor is also open.
	                                                                           e.stopPropagation();
	                                                                           artistEditor.thereCanBeOnlyOne(text.ArtistEditorIsOpen);
	                                                                       } else {
	                                                                           if (artistEditor.currentTrack !== e.target) {
	                                                                               artistEditor.currentTrack = e.target;
	                                                                               artistEditor.destroyLookup();
	                                                                               $(this).parent()
	                                                                                      .parent()
	                                                                                      .makeFloatingDiv(artistEditor.lookupBox)
	                                                                                      .hide()
	                                                                                      .find("div:first")
	                                                                                      .attr("id","lookup")
	                                                                                      .append(aeHTML.box.lookup)
	                                                                                      .end()
	                                                                                      .show();
	                                                                               $("#artistLookup").redrawShadow()
	                                                                                                 .data("linkedText",e.target);
	                                                                           }
	                                                                        }
// (window.console) ? console.timeEnd("initLookupBoxOne") : '';
	                                                                   });
	                                                                   },
	                                     initLookupBoxMany: function () { /* Create the initial lookup float box, with the structure to fill in results later. */
	                                                                   $('input.artistName').live("focusin", function (e) {
// (window.console) ? console.time("initLookupBoxMany") : '';
	                                                                       if (artistEditor.currentTrack !== e.target) { // have we changed input fields?
	                                                                           artistEditor.currentTrack = e.target;
	                                                                           artistEditor.resetAppearance();
	                                                                           $(this).parent()
	                                                                                  .find("input")
	                                                                                  .css("backgroundColor","#fff")
	                                                                                  .end()
	                                                                                  .find("input.artistName")
	                                                                                  .makeFloatingDiv(artistEditor.lookupBox)
	                                                                                  .find("div:first")
	                                                                                  .attr("id","lookup")
	                                                                                  .append(aeHTML.box.lookup);
	                                                                           $("#artistLookup").redrawShadow()
	                                                                                             .data("linkedText", e.target);
	                                                                       }
// (window.console) ? console.timeEnd("initLookupBoxMany") : '';
	                                                                   });
	                                                                   },
	                                     synchACJPcolors : function () { /* Keep coloring and lookup box synched for AC and Join Phrase fields. */
// (window.console) ? console.time("synchACJPcolors") : '';
	                                                                   $('input.artistCredit, input.joinPhrase').live("focusin", function () {
	                                                                       artistEditor.resetAppearance();
	                                                                       $(this).parent()
	                                                                              .find("input")
	                                                                              .css("backgroundColor","#fff");
	                                                                   });
// (window.console) ? console.timeEnd("synchACJPcolors") : '';
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
	                                                  window.setTimeout(function () {
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
// (window.console) ? console.time("activateAnnotationSwitcher") : '';
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
// (window.console) ? console.timeEnd("activateAnnotationSwitcher") : '';
	},
    
	addAnnotationButton : function () {
// (window.console) ? console.time("addAnnotationButton") : '';
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
// (window.console) ? console.timeEnd("addAnnotationButton") : '';
	},
    
	addAnnotationSwitcher : function () {
// (window.console) ? console.time("addAnnotationSwitcher") : '';
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
// (window.console) ? console.timeEnd("addAnnotationSwitcher") : '';
	},
    
	addArtistEditorButton : function (context) {
// (window.console) ? console.time("addArtistEditorButton") : '';
	    context.find(".oneArtist")
	           .parent()
	           .after(html.div({ alt: text.AddArtist, cl: 'addArtist', title: text.AddArtist }) + html.close('div'));
// (window.console) ? console.timeEnd("addArtistEditorButton") : '';
	    return context;
	},

	html_addNew_Generic : function (type) {
	                                      var close = html.close,
	                                          closeDiv,
	                                          closeFS,
	                                          div = html.div,
	                                          fieldset = html.fieldset,
	                                          input = html.input,
	                                          label = html.label,
	                                          ClassLabels = 'labelAddNew',
	                                          idBase = 'addNew-',
	                                          nbsp = '&nbsp;',
	                                          row = function (isInput, thisVal, noDiv) {
	                                              var thisID = idBase + thisVal;
	                                              return (!noDiv ? div({}) : '') +
	                                                         label({ 'for': thisID, val: text[thisVal], id: thisID + '-label', cl: ClassLabels }) +
	                                                         ((isInput) ? input({ id: thisID }) : html.select({ id: thisID })) +
	                                                     (!noDiv ? closeDiv : '');
	                                          },
	                                          date = function (whichDate) {
	                                              var thisID = idBase + 'Date-' + whichDate,
	                                                  makeInput = function (str, thisSize) {
	                                                      return input({ id: thisID + '-' + str, size: thisSize });
	                                                  };
	                                              return label({ 'for': thisID, val: text['Date' + whichDate], id: thisID + '-label', cl: ClassLabels }) +
	                                                     makeInput('Y', 4) + ' ' + makeInput('M', 2) + ' ' + makeInput('D', 2);
	                                          };
                                              closeDiv = html.close('div');
                                              closeFS = html.close('fieldset');
	                                      nbsp += nbsp;
	                                      nbsp = nbsp + nbsp + nbsp;
	                                      return div({}) +
	                                                 fieldset({ css: 'width:100%;', id: 'addNewFields' }) +
	                                                     row(1, 'Name', 0) +
	                                                     row(1, 'NameSort', 0) +
	                                                     (type === 'label' ? row(1, 'LabelCode', 0) : '') +
	                                                     div({}) + date('Start') + nbsp + date('End') + closeDiv +
	                                                     div({}) +
	                                                         (type === 'artist' ? row(0, 'Type', 1) + nbsp + nbsp + row(0, 'Gender', 1) : row(0, 'Type', 0)) +
	                                                     closeDiv +
	                                                     row(0, 'Country', 0) +
	                                                     row(1, 'Comment', 0) +
	                                                 closeFS +
	                                             closeDiv +
	                                             div({ css: 'text-align:center;width:45em;padding-top:2em;' }) +
	                                                 html.button({ id: 'CancelAdd', val: text.Cancel, css: 'margin-right: 4em;' }) +
	                                                 html.button({ id: 'CreateAdd', val: (type === 'artist' ? text.CreateArtist : text.CreateLabel) }) +
	                                             closeDiv +
	                                             div({ id: 'addErrors', css: 'background-color:#FFB;border:2px inset #aaa;display:none;margin-top:.7em;padding:.6em;width:96%;' }) +
                                                         html.span({ css: 'font-weight:900;color:red;' }) +
                                                             text.Errors +
                                                         html.close('span') +
                                                         '<ol id="errorList"></ol>' +
	                                             closeDiv;
	},

	/** 
	 * Creates and adds a style rule to the global stylesheet. (Execution time: ~1ms)
	 *  @param {String} rule This is the style rule to be added.
	 */
	addStyle : function (rule) {
	    if (document.styleSheets) {
	        var sheet = document.styleSheets[1];
	        sheet.insertRule(rule, sheet.cssRules.length);
	    }
	},
    
	addToolButton : function (buttonText, buttonID) {
// (window.console) ? console.time("addToolButton") : '';
	    $("#MenuEditTools").append(html.button({ id: buttonID, val: buttonText }));
// (window.console) ? console.timeEnd("addToolButton") : '';
	},
    
	addTrackTools : function (context) {
// (window.console) ? console.time("addTrackTools") : '';
	    context.find("td.toolbox").append(html.div({ alt: text.RemoveTrack, cl: 'removeTrack', title: text.RemoveTrack }) + html.close('div') +
	                                      html.div({ alt: text.DragTrack, cl: 'handleIcon', title: text.DragTrack }) + html.close('div'));
// (window.console) ? console.timeEnd("addTrackTools") : '';
	    return context;
	},
    
	attachHelpButtonEvents : function (helpArray) {
// (window.console) ? console.time("attachHelpButtonEvents") : '';
	    $.each(helpArray, function (i) {
	        $(helpArray[i][0] + " img").click(function () {
	            $("#wikiDocName").html(helpArray[i][1]);
	            MusicBrainz.setStatus("Loading documentation, please wait.");
	            $("#wikiHelp").html("")
	                          .slideDown();
	            /* TODO: START: Junk stub code to simulate downloading text. */
	            /* Get URL from helpArray[i][2]. */
	            window.setTimeout(function () {
	                                          $("#wikiHelp").lorem({ type: 'words',amount:'500',ptags:true});
	                                          $("#wikiHelpBox").slideDown(1000);
	                                          MusicBrainz.setStatus("Documentation loaded.");
	                                      }, 1000);
	            /* END */
	        });
	    });
// (window.console) ? console.timeEnd("attachHelpButtonEvents") : '';
	},
    
	clearStatus : function () {
// (window.console) ? console.time("clearStatus") : '';
	    $("#editStatusMsg").html("&nbsp;");
// (window.console) ? console.timeEnd("clearStatus") : '';
	},
    
	hideErrorForSidebar : function (element) {
// (window.console) ? console.time("hideErrorForSidebar") : '';
	    $("#" + element + "-dt").btOff();
// (window.console) ? console.timeEnd("hideErrorForSidebar") : '';
	},

	makeAutotabDate : function (fieldY, fieldM, fieldD) {
	    $('#' + fieldY).autotab({ target: fieldM, format: 'numeric',                   maxlength: '4' });
	    $('#' + fieldM).autotab({ target: fieldD, format: 'numeric', previous: fieldY, maxlength: '2' });
	    $('#' + fieldD).autotab({                 format: 'numeric', previous: fieldM, maxlength: '2' });
	    window.setTimeout(function () {
	        $('#' + fieldY).watermark({ placeholder: text.YearMask });
	        $('#' + fieldM).watermark({ placeholder: text.MonthMask });
	        $('#' + fieldD).watermark({ placeholder: text.DayMask });
	    }, 350);
	},
    
	makeCountryList : function () {
// (window.console) ? console.time("makeCountryList") : '';
	    var countries = mb.country,
	        country,
	        optionArray = [],
	        addStyle = MusicBrainz.addStyle,
	        selectArray = [],
	        i = mb.country.length,
	        n = i % 8,
	        processItem = function () {
	            country = countries[--i];
	            optionArray.push('<option value="' + country[0] + '" class="span-' + country[2] + '">' + country[1] + '</option>');
	            // Add the flag class to the global editor stylesheet.
	            addStyle('.flag-' + country[2] + '{background:transparent url(/static/images/icon/flags.png) no-repeat scroll ' + country[3] + 'px!important;height:12px;width:16px;}');
	            selectArray.push({find:'.span-' + country[2], icon:'flag-' + country[2]});
	        };
	    if (n > 0) {
	        do {
	            processItem();
	        } while (--n); 
	    }
	    n = parseInt(i / 8, 10);
	    do {
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	    } while (--n); // n must be greater than 0 here
	    document.getElementById("select-edit-release-country").innerHTML = '<option value="">[ ' + text.SelectOne + ' ]</option>' + optionArray.reverse().join(""); // Populate the select.
	    MusicBrainz.countrySelectArray = selectArray; // Store the country array for this select's later conversion.
// (window.console) ? console.timeEnd("makeCountryList") : '';
	},
    
	makeFormatList : function () {
// (window.console) ? console.time("makeFormatList") : '';
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
// (window.console) ? console.timeEnd("makeFormatList") : '';
	},
    
	makeSelectSideBar : function (selector, width, leftOpening, height) {
// (window.console) ? console.time("makeSelectSideBar") : '';
	    if (typeof(leftOpening) === "undefined") {
	        leftOpening = false;
	    }
	    selector.selectmenu({
	                        handleWidth: 0,
	                        maxHeight: (height || 400),
	                        width: width,
	                        openLeft: leftOpening
	                        });
// (window.console) ? console.timeEnd("makeSelectSideBar") : '';
	},
    
	makeStatusBox : function () {
// (window.console) ? console.time("makeStatusBox") : '';
	    $("#statusHead").append(mb.HTMLsnippets.editBox);
	    $("#tabs").after(mb.HTMLsnippets.docsBox);
	    $("#editMsg").corner(MusicBrainz.roundness);
// (window.console) ? console.timeEnd("makeStatusBox") : '';
	},
    
	makeSwappableSelectList : function (entity, toSwap, commonArray, swapArray) {
// (window.console) ? console.time("makeSwappableSelectList") : '';
	    var $swapList = $("#select-edit-" + entity + "-" + toSwap),
	        swapButton = "btn-switch-" + toSwap + "-list";
	    $('.' + entity + '-' + toSwap + ':not(dt)').toggle();
	    $swapList.parent().after('<input type="button" value="' + text.FullList + '" id="' + swapButton + '"/>');
	    swapButton = '#' + swapButton;
	    $(swapButton).addClass("rightsidebutton")
	                 .css("top",$("#" + entity + "-" + toSwap + "-dt").offset().top + "px")
	                 .click(function () {
	                                    MusicBrainz.swapShortLongList($swapList, $(swapButton), commonArray, swapArray);
	                                    });
// (window.console) ? console.timeEnd("makeSwappableSelectList") : '';
	},
    
	makeTogglable : function (togglableItemArray) {
// (window.console) ? console.time("makeTogglable") : '';
	    $.each(togglableItemArray, function () {
	        var toggleclass = this;
	        $('.editable.' + toggleclass).click(function () {
	            $('.' + toggleclass).filter(":not(dt)")
	                                .toggle()
	                                .find("input:first")
	                                .focus();
	        });
	    });
// (window.console) ? console.timeEnd("makeTogglable") : '';
	},
    
	makeTogglableEachInGroup : function (togglableItemArray) {
// (window.console) ? console.time("makeTogglableEachInGroup") : '';
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
	                                                                 .click(); // and click it (to trigger the initial artist editor, basic or complex).
	                if (toggleclass[0] === "trackartist") {
	                    artistEditor.identifyUnresolved(); // Check unresolved artist highlighting when toggling an artist.
	                }
	            });
	        });
	    });
// (window.console) ? console.timeEnd("makeTogglableEachInGroup") : '';
	},
    
	populateCharArrays : function () {
// (window.console) ? console.time("populateCharArrays") : '';
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
	               "®","©","™"],
	        i,
	        j,
	        charCount,
	        symCount,
	        symStore = [];
	    for (i = 0, charCount = chars.length; i < charCount; i++) {
	        charMap.characters.dropMenu[i] = {
	                                         name      : chars[i][0],
	                                         openWith  : chars[i][0],
	                                         className : "skip" + chars[i][1]
	                                         };
	    }
	    for (j = 0, symCount = symbols.length; j < symCount; j++) {
	        symStore[j] = {
	                      name      : symbols[j],
	                      openWith  : symbols[j],
	                      className : "skip0"
	                      };
	    }
	    symStore[symStore.length] = { name: "[", openWith: "&91;", className: "skip0" };
	    symStore[symStore.length] = { name: "]", openWith: "&93;", className: "skip0" };
	    charMap.symbols.dropMenu = symStore;
// (window.console) ? console.timeEnd("populateCharArrays") : '';
	},
    
	setStatus : function (status, showThrobber) {
// (window.console) ? console.time("setStatus") : '';
	    if (showThrobber) {
	        status = '<img src="/static/images/loading-small.gif">&nbsp;' + status;
	    }
	    $("#editStatusMsg").html(status);
// (window.console) ? console.timeEnd("setStatus") : '';
	},
    
	showError : function ($element, errorMessage) {
	    $element.bt(errorMessage, {
	                              spikeLength: 30,
	                              positions: 'left',
	                              fill: '#FEEECD',
	                              trigger: 'click',
	                              shrinkToFit: true
                                      })
                    .css("background-color","#FFBA58")
	            .bind("click", function () {
                                       $(this).unbind("click")
                                              .bt()
                                              .css("background-color","#FFF");
                                       });
	},
    
	stripeTracks : function () {
// (window.console) ? console.time("stripeTracks") : '';
	    $cache.$releaseTable.find("> tbody")
	                                    .each(function () {
	                                                      $(this).children("tr")
	                                                             .removeClass("ev") // Unstripe the tracks.
	                                                             .filter(":visible:even")
	                                                             .addClass("ev"); // Restripe the tracks, using the new ordering.
	                                                      });
// (window.console) ? console.timeEnd("stripeTracks") : '';
	},
    
	swapShortLongList : function (select, button, commonarray, bigarray, initial) {
// (window.console) ? console.time("swapShortLongList") : '';
	    var item,
	        selecteditem = -1,
	        showFullList = false,
	        optionArray = [],
	        i = bigarray.length,
	        n = i % 8,
	        processItem = function () {
	            item = bigarray[--i];
	            if (!showFullList) {
	                if ($.inArray(item[0], commonarray) > -1 || item[0] === selecteditem) { // If the current item is also in the common items array,
	                    optionArray.push('<option value="' + item[0] + '">' + item[1] + '</option>'); // add it to the string.
	                }
	            } else {
	                optionArray.push('<option value="' + item[0] + '">' + item[1] + '</option>'); // add it to the string.
	            }
	        };
	    if (typeof(select.selectedValues()[0]) !== "undefined") { // If there actually is a currently selected item,
	        selecteditem = select.selectedValues()[0]; // then store the currently selected item.
	    }
	    select.css("display","none") // Avoid needless (and very slow) DOM redraws.
	          .removeOption(/./); // Empty the select list.
	    if (button.attr("value") === text.FullList) { // Switching to the full list.
	        button.attr("value", text.ShortList); // Change the text on the button.
	        showFullList = true;
	    } else {
	        button.attr("value", text.FullList); // Change the text on the button.
	    }
	    if (n > 0) {
	        do {
	            processItem();
	        } while (--n); 
	    }
	    n = parseInt(i / 8, 10);
	    do {
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	        processItem();
	    } while (--n); // n must be greater than 0 here
	    select.html('<option value="">[ ' + text.SelectOne + ' ]</option>' + optionArray.reverse().join("")) // Populate the select.
	          .val(selecteditem); // Re-select the selected item.
	    if (typeof(initial) === "undefined") { // Don't initialize the select twice.  (We init this separately at page load, else the width would be wrong).
	        select.selectmenu('destroy');
	        MusicBrainz.makeSelectSideBar(select, $("#release-date-view").outerWidth() + 12, true);
	    }
// (window.console) ? console.timeEnd("swapShortLongList") : '';
	},
    
	toggleTools : function () {
// (window.console) ? console.time("toggleTools") : '';
	    $cache.$releaseTable.addClass("hidden");
	    $("#toolsHead").toggleClass("toolsHeadGrey");
	    var show = $("#toolsHead").hasClass("toolsHeadGrey") ? false : true;
	    $("#toolsHead").attr("title",show ? text.toolsShow : text.toolsHide)
	                   .attr("alt",show ? text.toolsShow : text.toolsHide);
	    show = show ? $(".toolbox").css("display","none") : $(".toolbox").show();
	    $cache.$releaseTable.removeClass("hidden");
// (window.console) ? console.timeEnd("toggleTools") : '';
	},
    
	updateMediumTotalDuration : function () {
// (window.console) ? console.time("updateMediumTotalDuration") : '';
	    $cache.$releaseTable.find("> tbody")
	                                    .each(function () {
	                                                      var seconds = 0,
	                                                          minutes = 0;
	                                                      $(this).find("input.dur").each(function () {
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
// (window.console) ? console.timeEnd("updateMediumTotalDuration") : '';
	},
    
	updatePositionFields : function () {
// (window.console) ? console.time("updatePositionFields") : '';
	    $cache.$releaseTable.find("> tbody")
	                             .each(function () {
	                                               var originalPositions = $($(this).find(".editable.trackposition")),
	                                                   newPositions = $($(this).find('.trackposition:not(".editable")')),
	                                                   i,
	                                                   mediumTrackCount;
	                                               for (i = 0, mediumTrackCount = $(this).find(".editable.trackposition").length; i < mediumTrackCount; i++) {
	                                                   if ($(originalPositions[i]).text() !== i+1) { // If the original position != the current position,
	                                                       $(originalPositions[i]).click(); // The track position field now has been edited (via a remove or reorder), so show the edit field,
	                                                       $(newPositions[i]).find("input:first").val(i+1); // and populate the input with the new position.
	                                                   }
	                                               }
	                                           });
// (window.console) ? console.timeEnd("updatePositionFields") : '';
	},

        validation : {
            getToday : function () {
                var today = new Date();
                return {
                       day   : today.getDate(),
                       month : today.getMonth() + 1,
                       year  : today.getYear() + 1900
                       };
            },
            isValidDate : function (what) {
                var colonSpace,
                    test = function (varA, varB) {
                        return (varA.value === "" && varB.value !== "" ? false : true);
                    };
                    colonSpace = ': ';
                if (what === "day") {
                    return function (what) {
                        if (what === "year") {
                            return function (year, day) {
                                return (test(year, day) ? true : day.label + colonSpace + text.NoYear);
                            }
                        } else if (what === "month") {
                            return function (month, day) {
                                return (test(month, day) ? true : day.label + colonSpace + text.NoMonth);
                            }
                        }
                    };
                } else if (what === "month") {
                    return function (year, month) {
                        return (test(year, month) ? true : month.label + colonSpace + text.NoYear);
                    };
                }
                return true;
            },
            isLaterDate : function (dateA, dateB) {
                var colonSpace = ': ',
                    test = function (varA, varB) {
                        if (varA !== "" && varB !== "") { // Make sure we have two valid strings to use.
                            return (parseInt(varA, 10) <= parseInt(varB, 10));
                        } else {
                            return true; // Either one or both are empty, so no comparison is possible.
                        }
                    };
                if (dateA.year !== "" && dateB.year !== "") { // Do we have two valid dates to work with?
                    return function (what) {
                        switch (what) {
                            case "year":
                                return test(dateA.year, dateB.year); // Catch start: 2001 vs end: 2000
                            case "month":
                                if (dateA.year < dateB.year) {
                                    return true; // Catch case that would false negative on start: 2000-03 end: 2001-02
                                }
                                return test(dateA.month, dateB.month); // Catch start: 2000-02 vs end: 2000-01
                            case "day":
                                if (dateA.year < dateB.year) {
                                    return true; // Catch month case that would false negative on start: 2000-03-01 end: 2001-02-01
                                }
                                if (dateA.month < dateB.month) { // All years now are true for dateA.year >= dateB.year
                                    return true; // Catch day case that would false negative on start: 2000-01-01 end: 2001-02-02
                                }
                                return test(dateA.day, dateB.day);
                            default:
                                return true; // Should never happen.
                        }
                    }
                } else {
                    return function () {
                        return true; // Either both dates are empty, or only one date was provided, so no comparison can be done.
                    }
                }
            },
            isValidDay : function (year, month, day) {
                var getDaysInMonth = function () {
                    var date = new Date(year, (month - 1), day);
                    return date.daysInMonth();
                };
                return (day > 0 && day < getDaysInMonth() || day === "") ? true : false;
            },
            isValidMonth : function (month) {
                return ((month > 0 && month < 13) || month === ""); // Month is empty, or is a number between 1 and 12.
            }
        },

	events : {
	         addArtistCopiers : function () {
// (window.console) ? console.time("addArtistCopiers") : '';
	                                        /* Attach functionality to the the artist duplication icons. */
    /*                                            $(".copyArtist").draggable({
	                                                                   helper  : 'clone',
	                                                                   opacity : 0.5, // Firefox, Safari, Opera
	                                                                   filter  : 'alpha(opacity=50)' // IE
	                                                                   })
	                                                        .live('dragstart', function () {
	                                                            artistEditor.store_artist_edit = $(this).parents("table:first");
	                                                        });
    */
	                                    
	                                        /* Attach artist duplication target functionality to the the tracks. */
    /*                                        // TODO: Add multi-medium support.
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
	                                                         targetArtistCell.find(".addartist:not(:first)")
	                                                                         .css("display","none")
	                                                                         .remove();
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
    */
// (window.console) ? console.timeEnd("addArtistCopiers") : '';
	                                        },
	         showHideMediums  : function () { /* Per-medium show/hide */
// (window.console) ? console.time("showHideMediums") : '';
	                                        $("div.mediumToggle").live("click", function (e) {
	                                            if ($("#artistEditBox").length > 0) { // Don't allow a potentially hidden artist editor when we hide the tbody.
	                                                e.stopPropagation();
	                                                artistEditor.thereCanBeOnlyOne(text.ArtistEditorIsOpen);
	                                            } else {
	                                                artistEditor.destroyLookup(); // Get rid of any artist lookup that may exist. (The lookup div screws up the table layout if it is present when the tbody is hidden then reshown.)
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
	                                            }
	                                        });
// (window.console) ? console.timeEnd("showHideMediums") : '';
	                                        }
	         },
                 return : {
	             foo: "foo"
	         }
    },
    artistEditor = MusicBrainz.artistEditor,
    aeHTML = MusicBrainz.artistEditor.html,
    $cache = MusicBrainz.$cache;

/* Lock the HTML strings. */
MusicBrainz.html_addNew_Label = MusicBrainz.html_addNew_Generic('label');

// (window.console) ? console.timeEnd("Main: libraries") : '';

$(function ($) { // Bring jQuery into the local scope, shaving about 50 ms off the page init time.
// (window.console) ? console.time("Main: sidebar") : '';

    /* Populate the elements cache. */
    $cache.$accordion = $("#accordion");
    $cache.$releaseTable = $("#releasetable");

    /* ==== Start functions that initially manipulate the sidebar DOM. ==== */

    /* Create the style for left-opening selects. */
    window.setTimeout(function () { // This has to be slightly time-delayed post-document ready, or it won't get the correct offset value.
	                          var sidebarDD = $("#release-date-view");
	                          MusicBrainz.addStyle('.leftOpenMenu{width:375px!important;z-index:20;left:' + (sidebarDD.offset().left + sidebarDD.outerWidth() + 12 - 375) + 'px;}');
	                      }, 1);

    /* Populate basic select lists. */
    $("#select-edit-release-packaging").addOption(mb.packaging, false);
    $("#select-edit-release-status").addOption(mb.releasestatus, false);

    /* Populate the format list, in alphabetical order, and with "Other" at the bottom. */
// FireFox: 30ms Opera: 13ms
    MusicBrainz.makeFormatList();

    /* Setup and initialize language and script selects.  */
    $("#select-edit-release-language").addOption($("#edit-release-language-value").val(), "");
// FireFox: 29ms Opera: 80ms
    MusicBrainz.swapShortLongList($("#select-edit-release-language"), $("#btn-switch-language-list"), mb.commonLangs, mb.language, true);
    $("#select-edit-release-script").addOption($("#edit-release-script-value").val(), "");
// FireFox: 6ms Opera: 5ms
    MusicBrainz.swapShortLongList($("#select-edit-release-script"), $("#btn-switch-script-list"), mb.commonScripts, mb.script, true);

    $('dd.editable.release-language').click(function () {
	MusicBrainz.makeSwappableSelectList("release", "language", mb.commonLangs, mb.language);
    });

    $('dd.editable.release-script').click(function () {
	MusicBrainz.makeSwappableSelectList("release", "script", mb.commonScripts, mb.script);
    });


    MusicBrainz.makeCountryList();

    $("#MenuGuessCase").append('<select id="edit-select-gc-mode"></select>');

    /* This next duplicates the jQuery UI accordion, except it also allows the pegboard effect. */
    $cache.$accordion.addClass("ui-accordion ui-widget ui-helper-reset")
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

    window.setTimeout(function () { // We need to delay slightly, to give the select time to finish populating and the DOM time to update calculated positions.
	                          var vDDwidth = $("#release-date-view").outerWidth() + 12;
	                          $('#select-edit-release-country').selectmenu({
	                                                                       icons: MusicBrainz.countrySelectArray,
	                                                                       handleWidth: 0,
	                                                                       maxHeight: 400,
	                                                                       width: vDDwidth,
	                                                                       openLeft: true
	                                                                       });
	                          $.each(['packaging','status','language','script'], function () {
	                              MusicBrainz.makeSelectSideBar($('#select-edit-release-' + this), vDDwidth, true);
	                          });
	                          }, 1);

    /* Add the show help button to the tool box, and round the corners on the docs display div. */
    window.setTimeout(function () {
	                          $("#wikiHelpBox").corner(MusicBrainz.roundness);
	                          $("#wikiHelpInnerBox").corner(MusicBrainz.roundness);
	                          MusicBrainz.addToolButton("Show Help Buttons", "btnHelp");
	                          },1000);

    /* ==== End functions that initially manipulate the sidebar DOM. ==== */

    $("#sidebar").css("display","block");
if (window.console) {
    console.timeEnd("Main: sidebar");
    console.time("Main: Tracklist");
}
    /* ==== Only functions that affect the initial DOM for the tracklist should go here. ==== */

    /* Insert the status display box. */
    MusicBrainz.makeStatusBox();

    /* Insert the initial status display box text. */
    MusicBrainz.setStatus(text.StatusInitial);

    /* Add mouseover text for the toolbox button. */
    $("#toolsHead").attr("title",text.toolsShow)
	           .attr("alt",text.toolsShow);

    /* Add the track movement and removal icons. */
    MusicBrainz.addTrackTools($cache.$releaseTable);

    /* Add functionality to the show/hide controls for the toolbox column */
    $("#toolsHead").click(function () {
	MusicBrainz.clearStatus();
	MusicBrainz.toggleTools();
    });

    /* Insert help icons. */
    $("dl.datumList div dt, th.release").prepend('<img src="/static/images/blank.gif" class="helpIcon"/>');

    /* Insert the artist duplication icons. */
//    $(".trackartist").prepend('<div class="' + 'copyArtist" alt="' + text.DragArtist + '" title="' + text.DragArtist + '">' + html.close('div'));

    /* Create the add artist button for tracks which only have 0 or 1 artist in the track artist. */
    MusicBrainz.addArtistEditorButton($cache.$releaseTable);

    /* Set the initial total durations for each medium. */
// FireFox: 13ms Opera: 8ms
    MusicBrainz.updateMediumTotalDuration();

    /* Highlight any tracks with unresolved artist fields. */
    artistEditor.identifyUnresolved();

    /* ==== End functions that initially manipulate the tracklist's DOM. ==== */

    /* Show the tracklist. */
    $cache.$releaseTable.css("display","block");
    $("#loader").css("display","none");

if (window.console) {
    console.timeEnd("Main: Tracklist");
    console.time("Main: Notes");
}
    /* ==== Only functions that affect the initial DOM for the edit note or annotation should go here. ==== */

    /* Populate the character and symbol arrays for the annotation and edit note editors. */
    MusicBrainz.populateCharArrays();

    /* Attach and activate the button controls for the annotation shower.                   */
    MusicBrainz.addAnnotationButton();

    /* Attach and activate the editor for edit notes. */
    $('#edit-releaseedit_note').markItUp(MusicBrainz.markup.wiki);

    /* ==== End functions that initially manipulate the edit note or annotation DOM. ==== */

    /* Show the edit note. */
    $("fieldset.editNote").css("display","block");

if (window.console) {
    console.timeEnd("Main: Notes");
    console.time("Main: MouseEvents");
}
    /* ==== Start functions that attach mouse events. ==== */

   /* Set click behaviour for editable fields (where there is qty 1 of that field type). */
    MusicBrainz.makeTogglable([
	                      /* Definitions for entity type: Release */
	                      'release-date',
	                      'release-format',
	                      'release-packaging',
	                      'release-status'
	                      ]);

    /* Make each multiple-item entity editable. */
    MusicBrainz.makeTogglableEachInGroup([
	                                 ["trackname", true],
	                                 ["trackartist", true],
	                                 ["trackdur"],
	                                 ["medium.format"],
	                                 ["medium.title"]
	                                 ]);

    /* Enable show/hide toggling for mediums. */
    MusicBrainz.events.showHideMediums();

    /* Attach functionality to the the track dragging icons. */
    $cache.$releaseTable.tableDnD({ // Add drag and drop reordering to the track rows.
	                               dragHandle: "toolbox",
	                               onDragClass: "upDown",
	                               onDrop: function (table, movedRow) {
	                                                                   MusicBrainz.stripeTracks();
//                                            MusicBrainz.updatePositionFields();
	                                                                   if (!$(movedRow).parents("#removedTracks").length) { // If the track was not dropped within Removed Tracks,
	                                                                       $(movedRow).children("td:first")
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
    MusicBrainz.makeAutotabDate('edit-release-date-y', 'edit-release-date-m', 'edit-release-date-d');
    $("input[id$='edit-release-barcode']").attr("maxlength", 15) // EAN13 + EAN2, 15 digit maximum length
	                                  .autotab({format: 'numeric'});

    /* Attach functionality to the show/hide help button. */
    window.setTimeout(function () {
	                          $("#btnHelp").click(function () {
	                              $(".helpIcon").toggle();
	                              $("#btnHelp").val($("#btnHelp").val() === text.HelpShow ? text.HelpHide : text.HelpShow);
	                          });
	                          }, 1000);

    /* Attach click events to the help buttons. */
    MusicBrainz.attachHelpButtonEvents([
	                               /* Definitions for entity type: Release */
	                               ["#release-date-dt", text.displayReleaseDate, "http://"],
	                               ["#release-packaging-dt", text.displayReleasePackaging, "http://"],
	                               ["#release-status-dt", text.displayReleaseStatus, "http://"],
	                               ["#release-language-dt", text.displayReleaseLanguage, "http://"],
	                               ["#release-script-dt", text.displayReleaseScript, "http://"],
	                               ["dt[id^=release-label]", text.displayLabel, "http://"],
	                               ["dt[id^=release-catalog]", text.displayCatalogNumber, "http://"],
	                               ["dt[id^=release-barcode]", text.displayBarcode, "http://"],
	                               ["dt[id^=release-country]", text.displayCountry, "http://"],
	                               ["th.release:first", text.displayTrackNumber, "http://"],
	                               ["th.release:eq(1)", text.displayTrackTitle, "http://"],
	                               ["th.release:eq(2)", text.displayTrackArtist, "http://"],
	                               ["th.release:last", text.displayTrackDuration, "http://"]
	                               ]);

   /* Create and attach click event for the documentation display close button. */
    $('<img src="/static/images/blank.gif" class="closeButton"/>').prependTo($("#wikiTitle"))
	                                                          .click(function () {
	                                                                             $("#wikiHelpBox").slideUp(1000);
	                                                                             });

    /* Update total duration for each medium when track duration is changed. */
    $("input.dur").live("change", function () {
	                                      MusicBrainz.updateMediumTotalDuration();
	                                      });

    /* ==== End functions that attach mouse events. ==== */
if (window.console) {
    console.timeEnd("Main: MouseEvents");
    console.time("Main: Other");
}
    /* ==== Start other functions. ==== */

    /* Add the track movement and removal icons and the add artist button to the blank track template. */
    mb.HTMLsnippets.newTrack = MusicBrainz.addArtistEditorButton(MusicBrainz.addTrackTools($(mb.HTMLsnippets.newTrack))).outerHTML();

    /* Clean out the "Loading..." div.  .remove() is slow, so we do this last, not at the instant we're initially done with that div. */
    $("#loader").remove();

    /* Clear the initial status text after 15 seconds. */
    window.setTimeout(MusicBrainz.clearStatus, 15000);


/* Everything below is rough code in progress. */




/*
Lookup:

Lookup failure: Change text *and icon* to reflect the error.

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






$("div.result").live("click", function (event) {
    artistEditor.resolveArtist(this, $($("#artistLookup").data("linkedText")), event);
});










/* Add and activate the events that trigger the various artist editor functionalities. */
artistEditor.events.init();


    $("#NewArtistButton").live("click", function () {
	artistEditor.resetAppearance();
	$(".artistLine > input.joinPhrase")
	                   .show() // Show all join phrases (all but the last already should be visible).
	                   .css("visibility","visible")
	                   .parent()
	                   .parent()
	                   .append(aeHTML.row.artist) // Add the new artist line
	                   .parent()
	                   .parent()
	                   .redrawShadow();
	$("div.removeArtist:first").css("height","16px"); // Show the remove artist icon on the first artist line, if it wasn't already showing.
	$("#labelJoiner").css("visibility","visible");
	artistEditor.updateTrackArtist();
// TODO: Add a new entry to the data array store for the new artist.
    });

    $("#ArtistDoneButton").live("click", function () {
// TODO: Insert a check here that all artists have actually been identified
	var thisTextarea = $(this).parent()
	                          .parent()
	                          .parent()
	                          .find("div:first")
	                          .find("textarea");
	artistEditor.resetAppearance();
	artistEditor.destroyArtistEditor();
	$(thisTextarea).focus(); // Force focus to the textarea; this forces the textarea's position to be updated, and avoids the textarea ending
	                         // up aligned to the absolute top of the td.  It's not perfectly centered, but about as good as css allows us to do.
	if (artistEditor.toolsWereActive) { // If tools were visible when the editor was opened,
	    MusicBrainz.toggleTools(); // re-show them.
	    artistEditor.toolsWereActive = false;
	    $("#toolsHead").show();
	}
    });


    $("div.removeArtist").live("click", function () {
// TODO: Clear out the data array store for this artist.
	artistEditor.resetAppearance();
	$(this).parent()
	       .css("display","none")
	       .remove();
	$("#artistEditBox").find("div:first > div:first")
	                   .find("input:last")
	                   .val("")
	                   .css("visibility","hidden")
	                   .end()
	                   .end()
	                   .redrawShadow();
	var removeIcons = $("div.removeArtist");
	if (removeIcons.length === 1) {
	    removeIcons.css("height","0");
	    $("#labelJoiner").css("visibility","hidden");
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
	                  * Packaging
	                  * Status 
	                  * Country */

// TODO:   /* Set click behaviour for editable fields (where there is more than one of that field type). */
    MusicBrainz.makeTogglable([
	                      'release-barcode',
	                      'release-catalog',
	                      'release-country',
	                      'release-label'
	                      ]);

// TODO: There can be more than one country dropdown.
// TODO: Track renumbering on remove or delete.
// TODO: Track addition.
// TODO: Medium reordering.
// TODO: Fix everything to support multiple mediums. (artist; note that the onclick is off by one for medium 2, likely off by n+1 for medium n)
// TODO: Medium addition.
// TODO: Missing medium support
// TODO: Release artist editing.
// TODO: Release title editing.
// TODO: Setting all track artists from release artist.
// TODO: track parser support
// TODO: track parser template layout
// TODO: guess case support
// TODO: guess case template layout
// TODO: stash, undo, and redo support
// TODO: data loading via url args support
// TODO: add/remove label
// TODO: extend existing label functionality to support multiple labels
// TODO: Copy in a clean label for later use
// TODO: Loading of each single artist for each combo-artist
// TODO: Block /n's in field textareas.
// TODO: Fix up HTML -> Wiki parser to handle HTML not generated by Text::Wikiformat
// TODO: label lookup
// TODO: Type editing is a RG concept, not a release one
// TODO: Format is a medium concept, not a release one.
// TODO: RG selection / addition
// TODO: Replace "tag this" with inlined functionality
// TODO: Tracks dragged into deleted tracks shouldn't show the X
// TODO: Add offset support to artist lookup
// TODO: Take out manual position editing
// TODO: hide join phrase label on initial window opening for artist converted from 1 to Artist editor (many)
// TODO: Add artist button is broken
// TODO: Finish updatePositionFields
// TODO: Remove position edit inputs
// TODO: rewrite/rework artist copiers
// TODO: AC for simple case
// TODO: Add artist
// TODO: Artist link icons
// TODO: Auto-artist resolution
// TODO: Figure the cause of the rare comma-artist
// TODO: Figure the cause of the occasional NaN:Nan durations
// TODO: Set the data array store after resolution in the resolveArtist function.
// TODO: Keep click to edit events bound to the correct tracks after a track reordering
// TODO: Updating join phrases

if (window.console) {
    console.timeEnd("Main: Other");
    console.timeEnd("Main: initDOMr");
}


});


$().load(function ($) {
    if (experimental) {
	/* Add annotation markup switcher controls. */
	MusicBrainz.addAnnotationSwitcher();

	/* Activate the annotation markup switcher controls. */
	MusicBrainz.activateAnnotationSwitcher();
    }

    /* Attach and activate the editor for annotations.                   */
    $('#edit-releaseedit_note').markItUp(MusicBrainz.markup.wiki);

if (window.console) {
    console.timeEnd("Main: initDOMl");
//    console.profileEnd();
}



});


//MusicBrainz.initializeTrackParser = function () {
    /* Insert the track parser into the document. */
//    $("#releasetable.release").before(mb.HTMLsnippets.trackParser);
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
