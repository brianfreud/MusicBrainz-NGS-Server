/*jslint undef: true, browser: true*/
/*global jQuery, $, MusicBrainz, module, test, expect, equals, ok, same, HTML_Factory */

/**
 * @fileOverview This file contains all unit tests for MusicBrainz javascript code.
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 * @requires editor.js
 * @requires html_factory.js
 * @requires jquery.js
 * @requires jquery.outerHTML.js
 * @requires jquery.selectboxes.js
 * @requires jquery.unwrap.js
 * @requires mb_utility.js
 * @requires QUnit.js
 * @requires text_strings.js
 */

"use strict";

$(document).ready(function ($) {
    var i;

    // Get rid of the sidebar; there isn't one on the unit test page.
    $(".bg").removeClass("bg");

    if ($.browser.opera) {
        $("#opera").show();
    }

    // This works around the fact that some browsers do not return XHTML elements lowercased (ie, they ignore the standard).
    // Required any time .outerHTML() is used and element names are contained within the expectation string.
    var fixCase = function (expectString) {
        if ($.browser.opera || $.browser.ie) {
            return expectString.replace(/<\/?((abbr)|(address)|(area)|(base)|(bdo)|(blockquote)|(body)|(br)|(button)|(b)|(caption)|(cite)|(col)|(colgroup)|(dd)|(del)|(div)|(dfn)|(dl)|(dt)|(em)|(fieldset)|(form)|(h1)|(h2)|(h3)|(h4)|(h5)|(h6)|(head)|(hr)|(html)|(iframe)|(img)|(input)|(ins)|(i)|(kbd)|(label)|(legend)|(li)|(link)|(map)|(menu)|(meta)|(noscript)|(object)|(ol)|(optgroup)|(option)|(param)|(pre)|(p)|(q)|(samp)|(script)|(select)|(small)|(span)|(string)|(style)|(sub)|(sup)|(table)|(tbody)|(td)|(textarea)|(tfoot)|(th)|(thead)|(title)|(tr)|(ul)|(var)|(section)|(article)|(aside)|(hgroup)|(header)|(footer)|(nav)|(dialog)|(figure)|(video)|(audio)|(source)|(embed)|(mark)|(progress)|(meter)|(time)|(ruby)|(rt)|(rp)|(canvas)|(command)|(details)|(datalist)|(keygen)|(output))/g, function (a) { return a.toUpperCase(); });
        } else {
            return expectString;
        }
    };
    module("QUnit");
        test("Self-test", function () {
            var actual = { a: 1 };
            expect(3);
            ok(true, "Boolean assertion");
            equals(true, true, "Shallow comparison assertion");
            same(actual, { a: 1 }, "Deep comparison assertion");
        });
        test("Basic requirements", function () {
            ok( jQuery, "jQuery" );
            ok( $, "$" );
            ok( MusicBrainz, "MusicBrainz" );
        });
    module("Cached data");
        test("text strings", function () {
                same(MusicBrainz.text.addNew.artist, "Add a new Artist.");
                same(MusicBrainz.text.addNew.label, "Add a new Label.");
                same(MusicBrainz.text.ArtistEditor.Credit, "Artist Credit");
                same(MusicBrainz.text.ArtistEditor.Joiner, "Join Phrase");
                same(MusicBrainz.text.ArtistEditor.Name, "Artist Name");
                same(MusicBrainz.text.ArtistEditor.Remove, "Remove Artist");
            var textStrings = {
               AddArtistShort        : "Add another Artist&hellip;",
               Done                  : "Done",
               Error                 : "An error has occurred.",
               HasNameVariation      : "Credited using a variation on this name.",
               LastResults           : "Last 10",
               Loaded                : "Loaded:",
               MatchesFound          : "Matches found:",
               NextResults           : "Next",
               NoResultsFound        : "No results found.",
               NothingToLookUp       : "Nothing to look up!",
               RemoveArtist          : "Click here to remove this artist.",
               Searching             : "Searching&hellip;",
               Search                : "Search",
               SelectOne             : "Select One",
               ShowingMatches        : "Showing Matches:",
               TrackArtists          : "Artists for Track:",
               UnknownPlaceholder    : "[ Unknown ]"
            };
            for (i in textStrings) {
                same(MusicBrainz.text[i], textStrings[i]);
            }
        });
        test("image strings", function () {
            var imageStrings = {
                warning : '/static/images/scripts/warning.png',
                working : '/static/images/scripts/working.gif'
            };
            for (i in imageStrings) {
                same(MusicBrainz.cache.images[i], imageStrings[i]);
            }
        });
        test("lookup ws strings", function () {
            var lookupStrings = {
                   type   : 'type=',
                   limit  : 'limit=',
                   query  : 'query=',
                   server : '/ajax/search'
            };
            for (i in lookupStrings) {
                same(MusicBrainz.cache.lookup[i], lookupStrings[i]);
            }
        });
    module("HTML cache");
        test("init", function () {
            same(typeof MusicBrainz.cache.html.popups.lookup.artist, 'string', "Lookup menu: artist");
            same(typeof MusicBrainz.cache.html.popups.lookup.generic, 'string', "Lookup menu: generic");
        });
        test("Generated HTML", function () {
            same(MusicBrainz.cache.html.popups.lookup.artist, '<div class="popup" id="lookupPopup_parent"><div class="removable"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"></div></div></div></div></div></div></div><div class="popupContents" id="lookupPopup" style="background-color:#fff;"><div id="lookup"><div class="center" id="status"><div class="search"><input id="btnSearch" tabindex="-1" type="button" value="Search" /></div><div class="removable"><div class="bold error hidden"><img alt="An error has occurred." src="/static/images/scripts/warning.png" title="An error has occurred." /><span class="bold">An error has occurred.</span></div><div class="bold error hidden" id="noInput"><img alt="An error has occurred." src="/static/images/scripts/warning.png" title="An error has occurred." /><span class="bold">Nothing to look up!</span></div><div class="bold error hidden" id="noResults"><img alt="An error has occurred." src="/static/images/scripts/warning.png" title="An error has occurred." /><span class="bold">No results found.</span></div><div class="hidden search bold"><img alt="Searching&hellip;" src="/static/images/scripts/working.gif" title="Searching&hellip;" /><span class="bold">Searching&hellip;</span></div></div></div><div class="hidden removable" id="lookupInfo"> Matches found: <span class="bold" id="matches"></span>, Loaded: <span class="bold" id="loaded"></span>, Showing Matches: <span class="bold" id="resultsStart"></span> &ndash; <span class="bold" id="resultsEnd"></span></div><div class="hidden" id="results"></div><div class="hidden" id="hasACDiv" style="padding-top:.7em;"><input id="hasAC" tabindex="-1" type="checkbox" /><label for="hasAC"> Credited using a variation on this name. </label></div><div class="hidden" id="BottomControls" style="padding-top:1em;"><input id="btnShowLast" tabindex="-1" type="button" /><input id="btnShowNext" tabindex="-1" type="button" /><input id="btnAddNew" style="position:absolute;right:1em;" tabindex="-1" type="button" /></div><div id="addNewEntity"></div></div></div></div></div>', "Artist lookup menu HTML");
            same(MusicBrainz.cache.html.popups.lookup.generic, fixCase('<div class="popup" id="lookupPopup_parent"><div class="removable"><div class="shadow" style="background-color: rgb(0, 0, 0);"><div class="shadow" style="background-color: rgb(0, 0, 0);"><div class="shadow" style="background-color: rgb(0, 0, 0);"><div class="shadow" style="background-color: rgb(0, 0, 0);"><div class="shadow" style="background-color: rgb(0, 0, 0);"><div class="shadow" style="background-color: rgb(0, 0, 0);"></div></div></div></div></div></div></div><div class="popupContents" id="lookupPopup" style="background-color: rgb(255, 255, 255);"><div id="lookup"><div class="center" id="status"><div class="search"><input id="btnSearch" tabindex="-1" value="Search" type="button"></div><div class="removable"><div class="bold error hidden"><img alt="An error has occurred." src="/static/images/scripts/warning.png" title="An error has occurred."><span class="bold">An error has occurred.</span></div><div class="bold error hidden" id="noInput"><img alt="An error has occurred." src="/static/images/scripts/warning.png" title="An error has occurred."><span class="bold">Nothing to look up!</span></div><div class="bold error hidden" id="noResults"><img alt="An error has occurred." src="/static/images/scripts/warning.png" title="An error has occurred."><span class="bold">No results found.</span></div><div class="hidden search bold"><img alt="Searching…" src="/static/images/scripts/working.gif" title="Searching…"><span class="bold">Searching…</span></div></div></div><div class="hidden removable" id="lookupInfo"> Matches found: <span class="bold" id="matches"></span>, Loaded: <span class="bold" id="loaded"></span>, Showing Matches: <span class="bold" id="resultsStart"></span> – <span class="bold" id="resultsEnd"></span></div><div class="hidden" id="results"></div><div class="hidden" id="BottomControls" style="padding-top: 1em;"><input id="btnShowLast" tabindex="-1" type="button"><input id="btnShowNext" tabindex="-1" type="button"><input id="btnAddNew" style="position: absolute; right: 1em;" tabindex="-1" type="button"></div><div id="addNewEntity"></div></div></div></div>'), "Generic lookup menu HTML");
            same(MusicBrainz.cache.html.shadow, '<div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"></div></div></div></div></div></div>', "Div shadow HTML");
        });
    module("HTML Factory: Basic functionality");
        test("Basic requirements", function () {
            ok( MusicBrainz.html().basic, "basic" );
            ok( MusicBrainz.html().button, "button" );
            ok( MusicBrainz.html().close, "close" );
            ok( MusicBrainz.html().css, "css" );
            ok( MusicBrainz.html().dd, "dd" );
            ok( MusicBrainz.html().div, "div" );
            ok( MusicBrainz.html().fieldset, "fieldset" );
            ok( MusicBrainz.html().input, "input" );
            ok( MusicBrainz.html().label, "label" );
            ok( MusicBrainz.html().make, "make" );
            ok( MusicBrainz.html().select, "select" );
            ok( MusicBrainz.html().span, "span" );
            ok( MusicBrainz.text, "MusicBrainz.text" );
        });
        test("Instantation", function () {
            same(typeof MusicBrainz.html(), 'object', 'constructor instantation');
        });
        test("css string access", function () {
            same(MusicBrainz.html().css.display.IB, 'display:inline-block;');
            same(MusicBrainz.html().css.display.none, 'display:none;');
        });
        test("method chaining", function () {

            same(MusicBrainz.html().div({
                                        alt: 'altText',
                                        cl: 'classText',
                                        css: 'color:black;',
                                        id: 'idText' })
                                   .span('FooBar')
                                   .close('div')
                                   .basic('div')
                                   .use('select', { id: 'test' })
                                   .close('div').html, '<div alt="altText" class="classText" id="idText" style="color:black;" title="altText"><span>FooBar</span></div><div><select id="test" type="select-one"><option>[ Select One ]</option></select></div>');
        });
    module("HTML Factory: String generation functions");
        test("make", function () {
            same(MusicBrainz.html().make({ tag: 'div', close: false }).html, '<div>', 'Basic element');
            same(MusicBrainz.html().make({ tag: 'hr', close: true }).html, '<hr />', 'Basic self closing element');
            same(MusicBrainz.html().make({
                                    tag: 'foo',
                                    alt: 'altText',
                                    'class': 'classText',
                                    id: 'idText',
                                    style: 'styleText',
                                    size: 'sizeText',
                                    tabindex: 'tabindexText',
                                    title: 'titleText',
                                    type: 'typeText',
                                    value: 'valueText',
                                    close: true }).html, '<foo alt="altText" id="idText" size="sizeText" title="altText" type="typeText" />', 'Complex element');
        });
        test("a", function () {
            same(MusicBrainz.html().a().html, '<a></a>', 'Basic empty anchor element');
            same(MusicBrainz.html().a({ ti: 'none' }).html, '<a tabindex="-1"></a>', 'Basic empty anchor element, no tabindex');
            same(MusicBrainz.html().a({
                                      accesskey: 'A',
                                      alt: 'altText',
                                      cl: 'classText',
                                      css: 'styleText',
                                      href: 'musicbrainz.org',
                                      id: 'idText',
                                      name: 'musicbrainz',
                                      ti: 5,
                                      val: 'valueText' }).html, '<a accesskey="A" alt="altText" class="classText" href="http://musicbrainz.org" id="idText" name="musicbrainz" style="styleText" tabindex="5" title="altText">valueText</a>', 'Complex anchor element');
            same(MusicBrainz.html().a({
                                      href: 'musicbrainz.org',
                                      val: 'valueText' }).html, '<a href="http://musicbrainz.org">valueText</a>', 'Complex anchor element using http protocol');
            same(MusicBrainz.html().a({
                                      href: 'ftp://musicbrainz.org',
                                      notHTTP: true,
                                      val: 'valueText' }).html, '<a href="ftp://musicbrainz.org">valueText</a>', 'Complex anchor element not using http protocol');
        });
        test("abbr", function () {
            same(MusicBrainz.html().abbr().html, "<abbr>", "element creation");
        });
        test("address", function () {
            same(MusicBrainz.html().address().html, "<address>", "element creation");
        });
        test("area", function () {
            same(MusicBrainz.html().area().html, "<area />", "element creation");
         });
        test("b", function () {
            same(MusicBrainz.html().b().html, "<b>", "element creation");
         });
        test("basic", function () {
            same(MusicBrainz.html().basic("div").html, '<div>');
        });
        test("bdo", function () {
            same(MusicBrainz.html().bdo().html, "<bdo>", "element creation");
        });
        test("blockquote", function () {
            same(MusicBrainz.html().blockquote().html, "<blockquote>", "element creation");
        });
        test("br", function () {
            same(MusicBrainz.html().br().html, "<br />", "element creation");
         });
        test("button", function () {
            same(MusicBrainz.html().button().html, '<input type="button" />', 'Basic button element');
            same(MusicBrainz.html().button({ ti:'none' }).html, '<input tabindex="-1" type="button" />', 'Basic button element, no tabindex');
            same(MusicBrainz.html().button({
                                      cl: 'classText',
                                      css: 'styleText',
                                      id: 'idText',
                                      val: 'valueText' }).html, '<input class="classText" id="idText" style="styleText" type="button" value="valueText" />', 'Complex button element');
        });
        test("canvas", function () {
            same(MusicBrainz.html().canvas().html, "<canvas>", "element creation");
         });
        test("caption", function () {
            same(MusicBrainz.html().caption().html, "<caption>", "element creation");
        });
        test("cite", function () {
            same(MusicBrainz.html().cite().html, "<cite>", "element creation");
        });
        test("close", function () {
            same(MusicBrainz.html().close("div").html, '</div>');
        });
        test("code", function () {
            same(MusicBrainz.html().code().html, "<code>", "element creation");
        });
        test("col", function () {
            same(MusicBrainz.html().col().html, "<col />", "element creation");
         });
        test("colgroup", function () {
            same(MusicBrainz.html().colgroup().html, "<colgroup>", "element creation");
        });
        test("dd", function () {
            same(MusicBrainz.html().dd().html, '<dd>', 'Basic dd element');
            same(MusicBrainz.html().dd({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }).html, '<dd class="classText" id="idText" style="styleText">', 'Complex dd element');
        });
        test("del", function () {
            same(MusicBrainz.html().del().html, "<del>", "element creation");
        });
        test("dfn", function () {
            same(MusicBrainz.html().dfn().html, "<dfn>", "element creation");
        });
        test("div", function () {
            same(MusicBrainz.html().div().html, '<div>', 'Basic div element, implicitly non-hidden');
            same(MusicBrainz.html().div({}, false).html, '<div>', 'Basic div element, expressly non-hidden');
            same(MusicBrainz.html().div({
                                  alt: 'altText',
                                  cl: 'classText',
                                  css: 'color:black;',
                                  id: 'idText' }).html, '<div alt="altText" class="classText" id="idText" style="color:black;" title="altText">', 'Complex div element');
        });
        test("dl", function () {
            same(MusicBrainz.html().dl().html, "<dl>", "element creation");
        });
        test("dt", function () {
            same(MusicBrainz.html().dt().html, "<dt>", "element creation");
        });
        test("em", function () {
            same(MusicBrainz.html().em().html, "<em>", "element creation");
        });
        test("fieldset", function () {
            same(MusicBrainz.html().fieldset().html, '<fieldset>', 'Basic fieldset element');
            same(MusicBrainz.html().fieldset({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }).html, '<fieldset class="classText" id="idText" style="styleText">', 'Complex fieldset element');
        });
        test("form", function () {
            same(MusicBrainz.html().form().html, "<form>", "element creation");
        });
        test("h", function () {
            same(MusicBrainz.html().h().end(), '<h1></h1>', 'basic invocation');
            same(MusicBrainz.html().h({ val: 'test' }).end(), '<h1>test</h1>', 'default invocation');
            same(MusicBrainz.html().h({ level: 1, val: 'test' }).end(), '<h1>test</h1>', 'level 1 invocation');
            same(MusicBrainz.html().h({ level: 2, val: 'test' }).end(), '<h2>test</h2>', 'level 2 invocation');
            same(MusicBrainz.html().h({ level: 3, val: 'test' }).end(), '<h3>test</h3>', 'level 3 invocation');
            same(MusicBrainz.html().h({ level: 4, val: 'test' }).end(), '<h4>test</h4>', 'level 4 invocation');
            same(MusicBrainz.html().h({ level: 5, val: 'test' }).end(), '<h5>test</h5>', 'level 5 invocation');
            same(MusicBrainz.html().h({ level: 6, val: 'test' }).end(), '<h6>test</h6>', 'level 6 invocation');
            same(MusicBrainz.html().h({ level: 0, val: 'test' }).end(), '<h1>test</h1>', 'level 0, handle invalid invocation');
            same(MusicBrainz.html().h({ level: 7, val: 'test' }).end(), '<h1>test</h1>', 'level 7, handle invalid invocation');
            same(MusicBrainz.html().h({ level: 3, id: 'foobar', val: 'test' }).end(), '<h3 id="foobar">test</h3>', 'complex case');
        });
        test("hr", function () {
            same(MusicBrainz.html().hr().html, "<hr />", "element creation");
         });
        test("i", function () {
            same(MusicBrainz.html().i().html, "<i>", "element creation");
         });
        test("iframe", function () {
            same(MusicBrainz.html().iframe().html, "<iframe>", "element creation");
        });
        test("img", function () {
            same(MusicBrainz.html().img().end(), '<img />', 'basic invocation');
            same(MusicBrainz.html().img({ val: 'test' }).end(), '<img />', 'default invocation'); // with invalid attr passed
            same(MusicBrainz.html().img({ src: 'http://musicbrainz.org/foo.png', alt: 'bar', id: 'foobar' }).end(), '<img alt="bar" id="foobar" src="http://musicbrainz.org/foo.png" title="bar" />', 'normal case');
            same(MusicBrainz.html().img({ href: 'http://musicbrainz.org/foo.png', alt: 'bar', id: 'foobar' }).end(), '<img alt="bar" id="foobar" src="http://musicbrainz.org/foo.png" title="bar" />', 'handle wrong attr used');
            same(MusicBrainz.html().img({ src: 'http://musicbrainz.org/foo.png', href: 'http://musicbrainz.org/pez.png', alt: 'bar', id: 'foobar' }).end(), '<img alt="bar" id="foobar" src="http://musicbrainz.org/foo.png" title="bar" />', 'handle both correct and wrong attr used');
        });
        test("input", function () {
            same(MusicBrainz.html().input().html, '<input type="text" />', 'Basic input element, implied type text');
            same(MusicBrainz.html().input({ ti:'none' }).html, '<input tabindex="-1" type="text" />', 'Basic input element, implied type text, no tabindex');
            same(MusicBrainz.html().input({
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  size: '10',
                                  ti: '4',
                                  val: 'Test string',
                                  id: 'idText' }).html, '<input class="classText" id="idText" name="nameText" size="10" style="styleText" tabindex="4" type="text" value="Test string" />', 'Complex input element, type text (implied)');
            same(MusicBrainz.html().input({
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  size: '10',
                                  ti: '4',
                                  type: 'text',
                                  val: 'Test string',
                                  id: 'idText' }).html, '<input class="classText" id="idText" name="nameText" size="10" style="styleText" tabindex="4" type="text" value="Test string" />', 'Complex input element, type text (explicit)');
            same(MusicBrainz.html().input({
                                  checked: 'yes',
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  ti: '4',
                                  type: 'checkbox',
                                  val: 'Test',
                                  id: 'idText' }).html, '<input checked="checked" class="classText" id="idText" name="nameText" style="styleText" tabindex="4" type="checkbox" value="Test" />', 'Complex input element, type checkbox (explicit)');
        });
        test("ins", function () {
            same(MusicBrainz.html().ins().html, "<ins>", "element creation");
        });
        test("kbd", function () {
            same(MusicBrainz.html().kbd().html, "<kbd>", "element creation");
        });
        test("label", function () {
            same(MusicBrainz.html().label().html, '<label></label>', 'Basic label element');
            same(MusicBrainz.html().label({
                                     cl: 'classText',
                                     css: 'styleText',
                                     'for': 'forText',
                                     id: 'idText' }).html, '<label class="classText" for="forText" id="idText" style="styleText"></label>', 'Complex label element');
        });
        test("legend", function () {
            same(MusicBrainz.html().legend().html, "<legend>", "element creation");
        });
        test("li", function () {
            same(MusicBrainz.html().li().html, "<li>", "element creation");
        });
        test("map", function () {
            same(MusicBrainz.html().map().html, "<map>", "element creation");
        });
        test("menu", function () {
            same(MusicBrainz.html().menu().html, "<menu>", "element creation");
         });
        test("object", function () {
            same(MusicBrainz.html().object().html, "<object>", "element creation");
        });
        test("ol", function () {
            same(MusicBrainz.html().ol().html, "<ol>", "element creation");
        });
        test("optgroup", function () {
            same(MusicBrainz.html().optgroup().html, "<optgroup>", "element creation");
        });
        test("option", function () {
            same(MusicBrainz.html().option().html, "<option>", "element creation");
        });
        test("p", function () {
            same(MusicBrainz.html().p().html, "<p>", "element creation");
        });
        test("param", function () {
            same(MusicBrainz.html().param().html, "<param />", "element creation");
         });
        test("pre", function () {
            same(MusicBrainz.html().pre().html, "<pre>", "element creation");
        });
        test("q", function () {
            same(MusicBrainz.html().q().html, "<q>", "element creation");
        });
        test("samp", function () {
            same(MusicBrainz.html().samp().html, "<samp>", "element creation");
        });
        test("script", function () {
            same(MusicBrainz.html().script().html, "<script>", "element creation");
        });
        test("select", function () {
            same(MusicBrainz.html().select().html, '<select type="select-one"><option>[ Select One ]</option></select>', 'Basic select element');
            same(MusicBrainz.html().select({
                                      cl: 'classText',
                                      css: 'styleText',
                                      id: 'idText' }).html, '<select class="classText" id="idText" style="styleText" type="select-one"><option>[ Select One ]</option></select>', 'Complex select element with default default option text');
            same(MusicBrainz.html().select({
                                      cl: 'classText',
                                      css: 'styleText',
                                      textSelectOne: 'Custom Text!',
                                      id: 'idText' }).html, '<select class="classText" id="idText" style="styleText" type="select-one"><option>[ Custom Text! ]</option></select>', 'Complex select element with custom default option text');
        });
        test("small", function () {
            same(MusicBrainz.html().small().html, "<small>", "element creation");
         });
        test("span", function () {
            same(MusicBrainz.html().span('').html, '<span></span>', 'Basic empty span element (string mode)');
            same(MusicBrainz.html().span().html, '<span></span>', 'Basic empty span element (object mode)');
            same(MusicBrainz.html().span('test').html, '<span>test</span>', 'Basic span element with text content (string mode)');
            same(MusicBrainz.html().span({ val: 'test' }).html, '<span>test</span>', 'Basic span element with text content (object mode)');
            same(MusicBrainz.html().span('<input type="text"/>').html, '<span><input type="text"/></span>', 'Basic span element with html content (string mode)');
            same(MusicBrainz.html().span({ val: '<input type="text"/>' }).html, '<span><input type="text"/></span>', 'Basic span element with html content (object mode)');
            same(MusicBrainz.html().span({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }).html, '<span class="classText" id="idText" style="styleText"></span>', 'Complex span element');
        });
        test("strong", function () {
            same(MusicBrainz.html().strong().html, "<strong>", "element creation");
         });
        test("style", function () {
            same(MusicBrainz.html().style().html, "<style>", "element creation");
        });
        test("sub", function () {
            same(MusicBrainz.html().sub().html, "<sub>", "element creation");
        });
        test("sup", function () {
            same(MusicBrainz.html().sup().html, "<sup>", "element creation");
        });
        test("table", function () {
            same(MusicBrainz.html().table().html, "<table>", "element creation");
        });
        test("tbody", function () {
            same(MusicBrainz.html().tbody().html, "<tbody>", "element creation");
        });
        test("td", function () {
            same(MusicBrainz.html().td().html, "<td>", "element creation");
        });
        test("text", function () {
            same(MusicBrainz.html().text('This is a test.').html, 'This is a test.', "text inclusion in a chain");
        });
        test("textarea", function () {
            same(MusicBrainz.html().textarea().html, "<textarea>", "element creation");
        });
        test("tfoot", function () {
            same(MusicBrainz.html().tfoot().html, "<tfoot>", "element creation");
        });
        test("th", function () {
            same(MusicBrainz.html().th().html, "<th>", "element creation");
        });
        test("thead", function () {
            same(MusicBrainz.html().thead().html, "<thead>", "element creation");
        });
        test("title", function () {
            same(MusicBrainz.html().title().html, "<title>", "element creation");
        });
        test("tr", function () {
            same(MusicBrainz.html().tr().html, "<tr>", "element creation");
        });
        test("tt", function () {
            same(MusicBrainz.html().tt().html, "<tt>", "element creation");
        });
        test("ul", function () {
            same(MusicBrainz.html().ul().html, "<ul>", "element creation");
        });
    module("HTML Factory: Utility functions");
        test("addHTML()", function () {
            same(MusicBrainz.html().addHTML('<test>Foo</test>').end(), '<test>Foo</test>', 'change of chain context from jQuery to MusicBrainz.html()');
            same(MusicBrainz.html().span('Bar').addHTML('<test>Foo</test>').end(), '<span>Bar</span><test>Foo</test>', 'change of chain context from jQuery to MusicBrainz.html()');
        });
        test("end", function () {
            same(MusicBrainz.html().text('This is a test.').end(), MusicBrainz.html().text('This is a test.').html);
        });
        test("use", function () {
            same(MusicBrainz.html().use('a', { id: 'test' }).html, '<a id="test"></a>', 'indirect creation of a element');
            same(MusicBrainz.html().use('dd', { id: 'test' }).html, '<dd id="test">', 'indirect creation of dd element');
            same(MusicBrainz.html().use('div', { id: 'test' }).html, '<div id="test">', 'indirect creation of div element');
            same(MusicBrainz.html().use('fieldset', { id: 'test' }).html, '<fieldset id="test">', 'indirect creation of fieldset element');
            same(MusicBrainz.html().use('input', { id: 'test' }).html, '<input id="test" type="text" />', 'indirect creation of input type text element');
            same(MusicBrainz.html().use('label', { id: 'test' }).html, '<label id="test"></label>', 'indirect creation of label element');
            same(MusicBrainz.html().use('select', { id: 'test' }).html, '<select id="test" type="select-one"><option>[ Select One ]</option></select>', 'indirect creation of select element');
            same(MusicBrainz.html().use('span', { id: 'test' }).html, '<span id="test"></span>', 'indirect creation of span element');
        });
    module("HTML Factory: jQuery integration");
        test("outerHTMLtoMB", function () {
            same($(".simple-nested").outerHTMLtoMB().end(), fixCase('<div class="hidden simple-nested"><span>Foo Bar</span></div>'), 'change of chain context from jQuery to MusicBrainz.html()');
        });
        test("innerHTMLtoMB", function () {
            same($(".simple-nested").innerHTMLtoMB().end(), fixCase('<span>Foo Bar</span>'), 'change of chain context from jQuery to MusicBrainz.html()');
        });
        test("tojQuery", function () {
            same(MusicBrainz.html().span('test').tojQuery().outerHTML(), fixCase('<span>test</span>'), 'change of chain context from MusicBrainz.html() to jQuery');
        });
        var resetHTML = $(".simple-nested").html();
        test("after", function () {
            MusicBrainz.html().span('test').after($(".simple-nested > span:first"));
            same($(".simple-nested").html(), fixCase('<span>Foo Bar</span><span>test</span>'));
            $(".simple-nested").html(resetHTML);
            same(MusicBrainz.html().span('test').after(".simple-nested > span:first", 1).parent().html(), fixCase('<span>Foo Bar</span><span>test</span>'));
            $(".simple-nested").html(resetHTML);
        });
        test("before", function () {
            MusicBrainz.html().span('test').before(".simple-nested > span:first");
            same($(".simple-nested").html(), fixCase('<span>test</span><span>Foo Bar</span>'));
            $(".simple-nested").html(resetHTML);
            same(MusicBrainz.html().span('test').before(".simple-nested > span:first", 1).parent().html(), fixCase('<span>test</span><span>Foo Bar</span>'));
            $(".simple-nested").html(resetHTML);
        });
        test("append", function () {
            MusicBrainz.html().span('test').append(".simple-nested > span:first");
            same($(".simple-nested").html(), fixCase('<span>Foo Bar<span>test</span></span>'));
            $(".simple-nested").html(resetHTML);
            same(MusicBrainz.html().span('test').append(".simple-nested > span:first", 1).parent().html(), fixCase('<span>Foo Bar<span>test</span></span>'));
            $(".simple-nested").html(resetHTML);
        });
        test("prepend", function () {
            MusicBrainz.html().span('test').prepend(".simple-nested > span:first");
            same($(".simple-nested").html(), fixCase('<span><span>test</span>Foo Bar</span>'));
            $(".simple-nested").html(resetHTML);
            same(MusicBrainz.html().span('test').prepend(".simple-nested > span:first", 1).parent().html(), fixCase('<span><span>test</span>Foo Bar</span>'));
            $(".simple-nested").html(resetHTML);
        });
        test("insertInto", function () {
            MusicBrainz.html().span('test').insertInto(".simple-nested > span:first");
            same($(".simple-nested").html(), fixCase('<span><span>test</span></span>'));
            $(".simple-nested").html(resetHTML);
            same(MusicBrainz.html().span('test').insertInto(".simple-nested > span:first", 1).parent().html(), fixCase('<span><span>test</span></span>'));
            $(".simple-nested").html(resetHTML);
        });
        test("replace", function () {
            MusicBrainz.html().span('test').replace(".simple-nested > span:first");
            same($(".simple-nested").html(), fixCase('<span>test</span>'));
            $(".simple-nested").html(resetHTML);
            same(MusicBrainz.html().span('test').replace(".simple-nested > span:first", 1), fixCase('<span>Foo Bar</span>'));
            $(".simple-nested").html(resetHTML);
        });
        test("swap", function () {
            MusicBrainz.html().div().text('test').close('div').swap(".simple-nested > span:first");
            same($(".simple-nested").html(), fixCase('<div>test</div>'));
            $(".simple-nested").html(resetHTML);
        });
    module("mb_utility");
        test("Basic requirements", function () {
            ok( MusicBrainz.html(), "MusicBrainz.html()" );
            ok( MusicBrainz.text, "MusicBrainz.text" );
            ok( $("#testElements"), 'Test form elements');
            ok( $("#sidebar"), 'Test form elements');
        });
        test("addOverlay", function () {
            var $thisTestSet = $("#testElements .testElement").clone(),
                doTestAndGetNewHTML = function (element) {
                    return MusicBrainz.utility.addOverlay($(element))
                                              .parent()
                                              .next()
                                              .outerHTML();
                };
            ok( $thisTestSet, 'Test form elements');
            if ($.browser.opera) {
                expect(17);
            } else {
                expect(16);
            }
            $thisTestSet.children().each(function (i) {
                switch (i) {
                    case 0: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">One</div>'), 'Overlay on <select>'); break;
                    case 1: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), 'Overlay on <input>, type text'); break;
                    case 2: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), 'Overlay on <input>, type button'); break;
                    case 3: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">true</div>'), 'Overlay on <input>, type checkbox, checked'); break;
                    case 4: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">false</div>'), 'Overlay on <input>, type checkbox, unchecked'); break;
                    // Older versions of Opera treat the input type file security a little differently; while other browsers don't support a default
                    // value from the HTML, some versions of Opera do, placing the security check at form submission time instead (a forced "are you
                    // sure" prompt when submitting, if the input type file's default value has not been changed).
                    case 5: var message = '<input>, type file';
                            if ($.browser.opera) {
                                message = message + '*Note: This test will fail on some versions of Opera.  This is not a bug.  If this test passes on Opera, the next must fail.';
                            }
                            same(doTestAndGetNewHTML(this), fixCase('<div class="editable">[ Unknown ]</div>'), message);
                            if ($.browser.opera) {
                                same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Filename.Test</div>'), '<input>, type file, version of test for older versions of Opera - if the above test failed, this one must pass.');
                            }
                            break;
                    case 6: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), 'Overlay on <input>, type hidden'); break;
                    case 7: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), 'Overlay on <input>, type image'); break;
                    case 8: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), 'Overlay on <input>, type password'); break;
                    case 9: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">true</div>'), 'Overlay on <input>, type radio, selected'); break;
                    case 10: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">false</div>'), 'Overlay on <input>, type radio, unselected'); break;
                    case 11: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), 'Overlay on <input>, type reset'); break;
                    case 12: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), 'Overlay on <input>, type submit'); break;
                    case 13: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), 'Overlay on <button>'); break;
                    case 14: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Textarea Contents</div>'), 'Overlay on <textarea>'); break;
                }
            });
        });
        test("addOverlayThis", function () {
            var $thisTestSet = $("#testElements .testElement").clone(),
                doTestAndGetNewHTML = function (element) {
                    return $(element).parent()
                                     .next()
                                     .outerHTML();
                };
            ok( $thisTestSet, 'Test form elements');
            $thisTestSet.children().each(MusicBrainz.utility.addOverlayThis);
            if ($.browser.opera) {
                expect(17);
            } else {
                expect(16);
            }
            $thisTestSet.children(":not(.editable)").each(function (i) {
                switch (i) {
                    case 0: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">One</div>'), '<select>'); break;
                    case 1: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<input>, type text'); break;
                    case 2: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<input>, type button'); break;
                    case 3: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">true</div>'), '<input>, type checkbox, checked'); break;
                    case 4: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">false</div>'), '<input>, type checkbox, unchecked'); break;
                    case 5: var message = '<input>, type file';
                            if ($.browser.opera) {
                                message = message + '*Note: This test will fail on some versions of Opera.  This is not a bug.  If this test passes on Opera, the next must fail.';
                            }
                            same(doTestAndGetNewHTML(this), fixCase('<div class="editable">[ Unknown ]</div>'), message);
                            if ($.browser.opera) {
                                same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Filename.Test</div>'), '<input>, type file, version of test for older versions of Opera - if the above test failed, this one must pass.');
                            }
                            break;
                    case 6: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<input>, type hidden'); break;
                    case 7: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<input>, type image'); break;
                    case 8: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<input>, type password'); break;
                    case 9: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">true</div>'), '<input>, type radio, selected'); break;
                    case 10: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">false</div>'), '<input>, type radio, unselected'); break;
                    case 11: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<input>, type reset'); break;
                    case 12: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<input>, type submit'); break;
                    case 13: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<button>'); break;
                    case 14: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Textarea Contents</div>'), '<textarea>'); break;
                }
            });
        });
        test("getChildValues", function () {
            same(MusicBrainz.utility.getChildValues($("#testElements")), "Test Text");
        });
        test("getValue", function () {
            expect(16);
            $("#testElements .testElement").children().each(function (i) {
                switch (i) {
                    case 0: same(MusicBrainz.utility.getValue($(this)), 'One', '<select>'); break;
                    case 1: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type text'); break;
                    case 2: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type button'); break;
                    case 3: same(MusicBrainz.utility.getValue($(this)), true, '<input>, type checkbox, checked'); break;
                    case 4: same(MusicBrainz.utility.getValue($(this)), false, '<input>, type checkbox, unchecked'); break;
                    case 5: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type file, value preset in the HTML (expects empty string)'); break;
                    case 6: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type hidden'); break;
                    case 7: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type image'); break;
                    case 8: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type password'); break;
                    case 9: same(MusicBrainz.utility.getValue($(this)), true, '<input>, type radio, selected'); break;
                    case 10: same(MusicBrainz.utility.getValue($(this)), false, '<input>, type radio, unselected'); break;
                    case 11: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type reset'); break;
                    case 12: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type submit'); break;
                    case 13: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<button>'); break;
                    case 14: same(MusicBrainz.utility.getValue($(this)), 'Test Textarea Contents', '<textarea>'); break;
                }
            });
            same(MusicBrainz.utility.getValue($(".testElement")), '');
        });
    module("Inline editor: Selector cache");
        test("Sidebar init", function () {
            same(MusicBrainz.editor.cache.$sidebar, {}, '$sidebar cache is empty prior to initialization');
            MusicBrainz.editor.cache.init($);
            same(typeof MusicBrainz.editor.cache.$sidebar.$DDs, 'object', '$sidebar cache is not empty after initialization');
/* This test will always fail, using same or equals, as the new jQuery objects are never precisely identical to the ones created during initiation.
            same(MusicBrainz.editor.cache.$sidebar, {
                                                     $DDs: $([]),
                                                     $DateDDs: $([]),
                                                     $InputDDs: $([]),
                                                     $SelectDDs: $([])
                                                     }, '$sidebar cache contains expected cached selector collections.'); */
        });
    module("Inline editor: Sidebar");
        test("init", function () {
            same($("#sidebar").find("dd").length, 15, '<dd> test elements  present before init');
            same($("#sidebar").find(".editable").length, 0, '<dd> elements with class editable present before init');
            MusicBrainz.editor.cache.init($);
            MusicBrainz.editor.sidebar.init(jQuery);
            same($("#sidebar").find("dd").length, 28, '<dd> test elements present after init'); // textarea and button dd's should be ignored, hence 28, not 30.
            same($("#sidebar").find(".editable").length, 13, '<dd> elements with class editable present after init');
        });
        test("events: showEditFieldsOnClick", function () {
            MusicBrainz.editor.sidebar.events.showEditFieldsOnClick($);
            $("#sidebar").show(); // Test uses :visible, so hidden test elements would incorrectly cause the tests to fail.
            same($("#sidebar").find('dd.editable:visible').length, 13, 'visible overlabel <dd>s, before a click on each');
            same($("#sidebar").find('dd.hidden:visible').length, 0, 'visible edit field <dd>s, before a click on each');
            same($("#sidebar").find(".editable").click().end().find('dd.editable:visible').length, 0, 'visible overlabel <dd>s, after a click on each');
            same($("#sidebar").find(".editable").click().end().find('dd.hidden:visible').length, 13, 'visible edit field <dd>s, after a click on each');
            $("#sidebar").hide();
        });
    var $testObject = $('<input>');
    module("MusicBrainz.utility");
        test("hideElements", function () {
            same(MusicBrainz.utility.hideElements($testObject).hasClass('hidden'), true);
        });
        test("makeHTML.popup", function () {
            same(MusicBrainz.utility.makeHTML.popup('testID'), fixCase('<div class="popup" id="testID_parent"><div class="removable"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"></div></div></div></div></div></div></div><div class="popupContents" id="testID" style="background-color:#fff;"></div></div>'), 'called with only an ID parameter');
            same(MusicBrainz.utility.makeHTML.popup('testID', '<div>Foo bar</div>'), fixCase('<div class="popup" id="testID_parent"><div class="removable"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"></div></div></div></div></div></div></div><div class="popupContents" id="testID" style="background-color:#fff;"><div>Foo bar</div></div></div>'), 'called with ID and contents parameters.');
            same(MusicBrainz.utility.makeHTML.popup('testID', '<div>Foo bar</div>', 'grey'), fixCase('<div class="popup" id="testID_parent"><div class="removable"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"><div class="shadow" style="background-color:#000;"></div></div></div></div></div></div></div><div class="popupContents" id="testID" style="background-color:grey;"><div>Foo bar</div></div></div>'), 'called with ID, contents, and custom background color parameters.');
        });
        test("showElements", function () {
            same(MusicBrainz.utility.showElements($testObject.addClass('hidden')).hasClass('hidden'), false);
        });
        test("unTrim", function () {
            same(MusicBrainz.utility.unTrim('Test String'), ' Test String ');
        });
    var $testObject2 = $('<input>');
    var $testObject3 = $('<input>');
    module("jquery.enableDisable");
        test("$.readonly", function () {
            same($testObject.readonly().attr('readonly'), true, 'making an element readonly');
        });
        test("$.disable", function () {
            same($testObject2.disable().attr('disabled'), true, 'making an element disabled');
        });
        test("$.enable", function () {
            same($testObject.enable().attr('readonly'), false, 'making a readonly element not readonly');
            same($testObject2.enable().attr('disabled'), false, 'making a disabled element not disabled');
            $testObject3.disable().readonly();
            same($testObject3.enable().attr('disabled').toString() + $testObject3.attr('readonly').toString(), 'falsefalse', 'making an element which is both disabled and readonly be neither');
        });
});
