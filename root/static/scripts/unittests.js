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

$(document).ready(function () {
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
        var htmlFactory = new HTML_Factory();
        test("Basic requirements", function () {
            ok( htmlFactory.basic, "basic" );
            ok( htmlFactory.button, "button" );
            ok( htmlFactory.close, "close" );
            ok( htmlFactory.css, "css" );
            ok( htmlFactory.dd, "dd" );
            ok( htmlFactory.div, "div" );
            ok( htmlFactory.fieldset, "fieldset" );
            ok( htmlFactory.input, "input" );
            ok( htmlFactory.label, "label" );
            ok( htmlFactory.make, "make" );
            ok( htmlFactory.select, "select" );
            ok( htmlFactory.span, "span" );
            ok( MusicBrainz.text, "MusicBrainz.text" );
        });
        test("Instantation", function () {
            same(typeof htmlFactory, 'object', 'constructor instantation');
        });
        test("css string access", function () {
            same(htmlFactory.css.float.left, 'float:left;');
            same(htmlFactory.css.float.right, 'float:right;');
            same(htmlFactory.css.display.IB, 'display:inline-block;');
            same(htmlFactory.css.display.none, 'display:none;');
        });
        test("make", function () {
            same(htmlFactory.make({ tag: 'div', close: false }), '<div>', 'Basic element');
            same(htmlFactory.make({ tag: 'div', close: true }), '<div/>', 'Basic self closing element');
            same(htmlFactory.make({
                                    tag: 'div',
                                    alt: 'altText',
                                    checked: true,
                                    'class': 'classText',
                                    id: 'idText',
                                    style: 'styleText',
                                    size: 'sizeText',
                                    tabindex: 'tabindexText',
                                    title: 'titleText',
                                    type: 'typeText',
                                    value: 'valueText',
                                    close: true }), '<div alt="altText" checked="checked" id="idText" size="sizeText" title="titleText" type="typeText"/>', 'Complex element');
        });
        test("basic", function () {
            same(htmlFactory.basic("div"), '<div>');
        });
        test("button", function () {
            same(htmlFactory.button({}), '<input tabindex="-1" type="button"/>', 'Basic button element');
            same(htmlFactory.button({
                                      cl: 'classText',
                                      css: 'styleText',
                                      id: 'idText',
                                      val: 'valueText' }), '<input class="classText" id="idText" style="styleText" tabindex="-1" type="button" value="valueText"/>', 'Complex button element');
        });
        test("close", function () {
            same(htmlFactory.close("div"), '</div>');
        });
        test("dd", function () {
            same(htmlFactory.dd({}), '<dd>', 'Basic dd element');
            same(htmlFactory.dd({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }), '<dd class="classText" id="idText" style="styleText">', 'Complex dd element');
        });
        test("div", function () {
            same(htmlFactory.div({}), '<div>', 'Basic div element, implicitly non-hidden');
            same(htmlFactory.div({}, false), '<div>', 'Basic div element, expressly non-hidden');
            same(htmlFactory.div({
                                  alt: 'altText',
                                  cl: 'classText',
                                  css: 'color:black;',
                                  id: 'idText' }), '<div alt="altText" class="classText" id="idText" style="color:black;" title="altText">', 'Complex div element');
            same(htmlFactory.div({}, true), '<div style="display:none;">', 'Basic hidden div element');
            same(htmlFactory.div({
                                  alt: 'altText',
                                  cl: 'classText',
                                  css: 'color:black;',
                                  id: 'idText' }, true), '<div alt="altText" class="classText" id="idText" style="color:black;display:none;" title="altText">', 'Complex hidden div element');
        });
        test("fieldset", function () {
            same(htmlFactory.fieldset({}), '<fieldset>', 'Basic fieldset element');
            same(htmlFactory.fieldset({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }), '<fieldset class="classText" id="idText" style="styleText">', 'Complex fieldset element');
        });
        test("input", function () {
            same(htmlFactory.input({}), '<input type="text"/>', 'Basic input element, implied type text');
            same(htmlFactory.input({
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  size: '10',
                                  ti: '4',
                                  val: 'Test string',
                                  id: 'idText' }), '<input class="classText" id="idText" name="nameText" size="10" style="styleText" tabindex="4" type="text" value="Test string"/>', 'Complex input element, type text (implied)');
            same(htmlFactory.input({
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  size: '10',
                                  ti: '4',
                                  type: 'text',
                                  val: 'Test string',
                                  id: 'idText' }), '<input class="classText" id="idText" name="nameText" size="10" style="styleText" tabindex="4" type="text" value="Test string"/>', 'Complex input element, type text (explicit)');
            same(htmlFactory.input({
                                  checked: 'yes',
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  ti: '4',
                                  type: 'checkbox',
                                  val: 'Test',
                                  id: 'idText' }), '<input checked="checked" class="classText" id="idText" name="nameText" style="styleText" tabindex="4" type="checkbox" value="Test"/>', 'Complex input element, type checkbox (explicit)');
        });
        test("label", function () {
            same(htmlFactory.label({}), '<label></label>', 'Basic label element');
            same(htmlFactory.label({
                                     cl: 'classText',
                                     css: 'styleText',
                                     'for': 'forText',
                                     id: 'idText' }), '<label class="classText" for="forText" id="idText" style="styleText"></label>', 'Complex label element');
        });
        test("select", function () {
            same(htmlFactory.select({}), '<select type="select-one"><option>[ Select One ]</option></select>', 'Basic select element');
            same(htmlFactory.select({
                                      cl: 'classText',
                                      css: 'styleText',
                                      id: 'idText' }), '<select class="classText" id="idText" style="styleText" type="select-one"><option>[ Select One ]</option></select>', 'Complex select element with default default option text');
            same(htmlFactory.select({
                                      cl: 'classText',
                                      css: 'styleText',
                                      textSelectOne: 'Custom Text!',
                                      id: 'idText' }), '<select class="classText" id="idText" style="styleText" type="select-one"><option>[ Custom Text! ]</option></select>', 'Complex select element with custom default option text');
        });
        test("span", function () {
            same(htmlFactory.span({}), '<span>', 'Basic span element');
            same(htmlFactory.span({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }), '<span class="classText" id="idText" style="styleText">', 'Complex span element');
        });

    module("mb_utility");
        test("Basic requirements", function () {
            ok( MusicBrainz.html, "MusicBrainz.html" );
            ok( MusicBrainz.text, "MusicBrainz.text" );
            ok( $(".testElement"), 'Test form elements');
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
            expect(16);
            $thisTestSet.children().each(function (i) {
                switch (i) {
                    case 0: same(doTestAndGetNewHTML(this), '<div class="editable"><span>One</span></div>', 'Overlay on <select>'); break;
                    case 1: same(doTestAndGetNewHTML(this), '<div class="editable"><span>Test Text</span></div>', 'Overlay on <input>, type text'); break;
                    case 2: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type button'); break;
                    case 3: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type checkbox, checked'); break;
                    case 4: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type checkbox, unchecked'); break;
                    case 5: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type file'); break;
                    case 6: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type hidden'); break;
                    case 7: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type image'); break;
                    case 8: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type password'); break;
                    case 9: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type radio, selected'); break;
                    case 10: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type radio, unselected'); break;
                    case 11: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type reset'); break;
                    case 12: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <input>, type submit'); break;
                    case 13: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <button>'); break;
                    case 14: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', 'Overlay on <textarea>'); break;
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
            expect(16);
            ok( $thisTestSet, 'Test form elements');
            $thisTestSet.children().each(MusicBrainz.utility.addOverlayThis);
            $thisTestSet.children(":not(.editable)").each(function (i) {
                switch (i) {
                    case 0: same(doTestAndGetNewHTML(this), '<div class="editable"><span>One</span></div>', '<select>'); break;
                    case 1: same(doTestAndGetNewHTML(this), '<div class="editable"><span>Test Text</span></div>', '<input>, type text'); break;
                    case 2: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type button'); break;
                    case 3: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type checkbox, checked'); break;
                    case 4: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type checkbox, unchecked'); break;
                    case 5: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type file'); break;
                    case 6: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type hidden'); break;
                    case 7: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type image'); break;
                    case 8: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type password'); break;
                    case 9: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type radio, selected'); break;
                    case 10: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type radio, unselected'); break;
                    case 11: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type reset'); break;
                    case 12: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<input>, type submit'); break;
                    case 13: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<button>'); break;
                    case 14: same(doTestAndGetNewHTML(this), '<div class="editable"><span>[ Unknown ]</span></div>', '<textarea>'); break;
                }
            });
        });
        test("getChildValues", function () {
            same(MusicBrainz.utility.getChildValues($("#testElements")), "Test Text");
        });
        test("getValue", function () {
            expect(16);
            $(".testElement").children().each(function (i) {
                switch (i) {
                    case 0: same(MusicBrainz.utility.getValue($(this)), 'One', '<select>'); break;
                    case 1: same(MusicBrainz.utility.getValue($(this)), 'Test Text', '<input>, type text'); break;
                    case 2: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type button'); break;
                    case 3: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type checkbox, checked'); break;
                    case 4: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type checkbox, unchecked'); break;
                    case 5: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type file'); break;
                    case 6: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type hidden'); break;
                    case 7: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type image'); break;
                    case 8: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type password'); break;
                    case 9: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type radio, selected'); break;
                    case 10: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type radio, unselected'); break;
                    case 11: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type reset'); break;
                    case 12: same(MusicBrainz.utility.getValue($(this)), '', '<input>, type submit'); break;
                    case 13: same(MusicBrainz.utility.getValue($(this)), '', '<button>'); break;
                    case 14: same(MusicBrainz.utility.getValue($(this)), '', '<textarea>'); break;
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
            $("#sidebar").show();
            same($("#sidebar").find('dd.editable:visible').length, 13, 'visible overlabel <dd>s, before a click on each');
            same($("#sidebar").find('dd.hidden:visible').length, 0, 'visible edit field <dd>s, before a click on each');
            same($("#sidebar").find(".editable").click().end().find('dd.editable:visible').length, 0, 'visible overlabel <dd>s, after a click on each');
            same($("#sidebar").find(".editable").click().end().find('dd.hidden:visible').length, 13, 'visible edit field <dd>s, after a click on each');
            $("#sidebar").hide();
        });
});
