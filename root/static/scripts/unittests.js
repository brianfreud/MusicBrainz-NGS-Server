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

    // Get rid of the sidebar; there isn't one on the unit test page.
    $(".bg").removeClass("bg");

    // This works around the fact that some browsers do not return XHTML elements lowercased (ie, they ignore the standard).
    // Required any time .outerHTML() is used and element names are contained within the expectation string.
    var fixCase = function (expectString) {
        if ($.browser.opera || $.browser.ie) {
            return expectString.replace(/<\/?((abbr)|(address)|(area)|(b)|(base)|(bdo)|(blockquote)|(body)|(br)|(button)|(caption)|(cite)|(col)|(colgroup)|(dd)|(del)|(div)|(dfn)|(dl)|(dt)|(em)|(fieldset)|(form)|(h1)|(h2)|(h3)|(h4)|(h5)|(h6)|(head)|(hr)|(html)|(i)|(iframe)|(img)|(input)|(ins)|(kbd)|(label)|(legend)|(li)|(link)|(map)|(menu)|(meta)|(noscript)|(object)|(ol)|(optgroup)|(option)|(p)|(param)|(pre)|(q)|(samp)|(script)|(select)|(small)|(span)|(string)|(style)|(sub)|(sup)|(table)|(tbody)|(td)|(textarea)|(tfoot)|(th)|(thead)|(title)|(tr)|(ul)|(var)|(section)|(article)|(aside)|(hgroup)|(header)|(footer)|(nav)|(dialog)|(figure)|(video)|(audio)|(source)|(embed)|(mark)|(progress)|(meter)|(time)|(ruby)|(rt)|(rp)|(canvas)|(command)|(details)|(datalist)|(keygen)|(output))/g, function (a) { return a.toUpperCase(); });
        } else {
            return expectString;
        }
    }
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

    module("HTML Factory");
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
            same(MusicBrainz.html().css.float.left, 'float:left;');
            same(MusicBrainz.html().css.float.right, 'float:right;');
            same(MusicBrainz.html().css.display.IB, 'display:inline-block;');
            same(MusicBrainz.html().css.display.none, 'display:none;');
        });
        test("make", function () {
            same(MusicBrainz.html().make({ tag: 'div', close: false }).html, '<div>', 'Basic element');
            same(MusicBrainz.html().make({ tag: 'div', close: true }).html, '<div/>', 'Basic self closing element');
            same(MusicBrainz.html().make({
                                    tag: 'div',
                                    alt: 'altText',
                                    'class': 'classText',
                                    id: 'idText',
                                    style: 'styleText',
                                    size: 'sizeText',
                                    tabindex: 'tabindexText',
                                    title: 'titleText',
                                    type: 'typeText',
                                    value: 'valueText',
                                    close: true }).html, '<div alt="altText" id="idText" size="sizeText" title="altText" type="typeText"/>', 'Complex element');
        });
        test("anchor", function () {
            same(MusicBrainz.html().a({}).html, '<a></a>', 'Basic empty anchor element');
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
        test("basic", function () {
            same(MusicBrainz.html().basic("div").html, '<div>');
        });
        test("button", function () {
            same(MusicBrainz.html().button({}).html, '<input type="button"/>', 'Basic button element');
            same(MusicBrainz.html().button({ ti:'none' }).html, '<input tabindex="-1" type="button"/>', 'Basic button element, no tabindex');
            same(MusicBrainz.html().button({
                                      cl: 'classText',
                                      css: 'styleText',
                                      id: 'idText',
                                      val: 'valueText' }).html, '<input class="classText" id="idText" style="styleText" type="button" value="valueText"/>', 'Complex button element');
        });
        test("close", function () {
            same(MusicBrainz.html().close("div").html, '</div>');
        });
        test("dd", function () {
            same(MusicBrainz.html().dd({}).html, '<dd>', 'Basic dd element');
            same(MusicBrainz.html().dd({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }).html, '<dd class="classText" id="idText" style="styleText">', 'Complex dd element');
        });
        test("div", function () {
            same(MusicBrainz.html().div({}).html, '<div>', 'Basic div element, implicitly non-hidden');
            same(MusicBrainz.html().div({}, false).html, '<div>', 'Basic div element, expressly non-hidden');
            same(MusicBrainz.html().div({
                                  alt: 'altText',
                                  cl: 'classText',
                                  css: 'color:black;',
                                  id: 'idText' }).html, '<div alt="altText" class="classText" id="idText" style="color:black;" title="altText">', 'Complex div element');
            same(MusicBrainz.html().div({}, true).html, '<div style="display:none;">', 'Basic hidden div element');
            same(MusicBrainz.html().div({
                                  alt: 'altText',
                                  cl: 'classText',
                                  css: 'color:black;',
                                  id: 'idText' }, true).html, '<div alt="altText" class="classText" id="idText" style="color:black;display:none;" title="altText">', 'Complex hidden div element');
        });
        test("fieldset", function () {
            same(MusicBrainz.html().fieldset({}).html, '<fieldset>', 'Basic fieldset element');
            same(MusicBrainz.html().fieldset({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }).html, '<fieldset class="classText" id="idText" style="styleText">', 'Complex fieldset element');
        });
        test("input", function () {
            same(MusicBrainz.html().input({}).html, '<input type="text"/>', 'Basic input element, implied type text');
            same(MusicBrainz.html().input({ ti:'none' }).html, '<input tabindex="-1" type="text"/>', 'Basic input element, implied type text, no tabindex');
            same(MusicBrainz.html().input({
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  size: '10',
                                  ti: '4',
                                  val: 'Test string',
                                  id: 'idText' }).html, '<input class="classText" id="idText" name="nameText" size="10" style="styleText" tabindex="4" type="text" value="Test string"/>', 'Complex input element, type text (implied)');
            same(MusicBrainz.html().input({
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  size: '10',
                                  ti: '4',
                                  type: 'text',
                                  val: 'Test string',
                                  id: 'idText' }).html, '<input class="classText" id="idText" name="nameText" size="10" style="styleText" tabindex="4" type="text" value="Test string"/>', 'Complex input element, type text (explicit)');
            same(MusicBrainz.html().input({
                                  checked: 'yes',
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  ti: '4',
                                  type: 'checkbox',
                                  val: 'Test',
                                  id: 'idText' }).html, '<input checked="checked" class="classText" id="idText" name="nameText" style="styleText" tabindex="4" type="checkbox" value="Test"/>', 'Complex input element, type checkbox (explicit)');
        });
        test("label", function () {
            same(MusicBrainz.html().label({}).html, '<label></label>', 'Basic label element');
            same(MusicBrainz.html().label({
                                     cl: 'classText',
                                     css: 'styleText',
                                     'for': 'forText',
                                     id: 'idText' }).html, '<label class="classText" for="forText" id="idText" style="styleText"></label>', 'Complex label element');
        });
        test("select", function () {
            same(MusicBrainz.html().select({}).html, '<select type="select-one"><option>[ Select One ]</option></select>', 'Basic select element');
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
        test("span", function () {
            same(MusicBrainz.html().span('').html, '<span></span>', 'Basic empty span element (string mode)');
            same(MusicBrainz.html().span({}).html, '<span></span>', 'Basic empty span element (object mode)');
            same(MusicBrainz.html().span('test').html, '<span>test</span>', 'Basic span element with text content (string mode)');
            same(MusicBrainz.html().span({ val: 'test' }).html, '<span>test</span>', 'Basic span element with text content (object mode)');
            same(MusicBrainz.html().span('<input type="text"/>').html, '<span><input type="text"/></span>', 'Basic span element with html content (string mode)');
            same(MusicBrainz.html().span({ val: '<input type="text"/>' }).html, '<span><input type="text"/></span>', 'Basic span element with html content (object mode)');
            same(MusicBrainz.html().span({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }).html, '<span class="classText" id="idText" style="styleText"></span>', 'Complex span element');
        });
        test("use", function () {
            same(MusicBrainz.html().use('a', { id: 'test' }).html, '<a id="test"></a>', 'indirect creation of a element');
            same(MusicBrainz.html().use('dd', { id: 'test' }).html, '<dd id="test">', 'indirect creation of dd element');
            same(MusicBrainz.html().use('div', { id: 'test' }).html, '<div id="test">', 'indirect creation of div element');
            same(MusicBrainz.html().use('fieldset', { id: 'test' }).html, '<fieldset id="test">', 'indirect creation of fieldset element');
            same(MusicBrainz.html().use('input', { id: 'test' }).html, '<input id="test" type="text"/>', 'indirect creation of input type text element');
            same(MusicBrainz.html().use('label', { id: 'test' }).html, '<label id="test"></label>', 'indirect creation of label element');
            same(MusicBrainz.html().use('select', { id: 'test' }).html, '<select id="test" type="select-one"><option>[ Select One ]</option></select>', 'indirect creation of select element');
            same(MusicBrainz.html().use('span', { id: 'test' }).html, '<span id="test"></span>', 'indirect creation of span element');
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
                    case 5:
                            var message = '<input>, type file';
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
            $thisTestSet.children(":not(.editable)").each(function (i) {
                switch (i) {
                    case 0: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">One</div>'), '<select>'); break;
                    case 1: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<input>, type text'); break;
                    case 2: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">Test Text</div>'), '<input>, type button'); break;
                    case 3: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">true</div>'), '<input>, type checkbox, checked'); break;
                    case 4: same(doTestAndGetNewHTML(this), fixCase('<div class="editable">false</div>'), '<input>, type checkbox, unchecked'); break;
                    case 5:
                            var message = '<input>, type file';
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
            $("#testElements .testElement").children().each(function (i) {
                switch (i) {
                    case 0: same(MusicBrainz.utility.getValue($(this)), 'One', '<select>'); break;
                    case 1: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type text'); break;
                    case 2: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type button'); break;
                    case 3: same(MusicBrainz.utility.getValue($(this)), true, '<input>, type checkbox, checked'); break;
                    case 4: same(MusicBrainz.utility.getValue($(this)), false, '<input>, type checkbox, unchecked'); break;
                            var message = '<input>, type file';
                            if ($.browser.opera) {
                                message = message + '*Note: This test will fail on some versions of Opera.  This is not a bug.  If this test passes on Opera, the next must fail.';
                            }
                            same(MusicBrainz.utility.getValue($(this)), '[ Unknown ]', message);
                            if ($.browser.opera) {
                                same(MusicBrainz.utility.getValue($(this)), 'Filename.Test', '<input>, type file, version of test for older versions of Opera - if the above test failed, this one must pass.');
                            }
                            break;
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
            same(MusicBrainz.editor.$cache.$sidebar, {}, '$sidebar cache is empty prior to initialization');
            MusicBrainz.editor.$cache.init($);
            same(typeof MusicBrainz.editor.$cache.$sidebar.$DDs, 'object', '$sidebar cache is not empty after initialization');
/* This test will always fail, using same or equals, as the new jQuery objects are never precisely identical to the ones created during initiation.
            same(MusicBrainz.editor.$cache.$sidebar, {
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
            MusicBrainz.editor.$cache.init($);
            MusicBrainz.editor.sidebar.init($);
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
});
