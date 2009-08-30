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
            equals(typeof htmlFactory, 'object', 'constructor instantation');
        });
        test("css string access", function () {
            equals(htmlFactory.css['float'].left, 'float:left;');
            equals(htmlFactory.css['float'].right, 'float:right;');
            equals(htmlFactory.css.display.IB, 'display:inline-block;');
            equals(htmlFactory.css.display.none, 'display:none;');
        });
        test("make", function () {
            equals(htmlFactory.make({ tag: 'div', close: false }), '<div>', 'Basic element');
            equals(htmlFactory.make({ tag: 'div', close: true }), '<div/>', 'Basic self closing element');
            equals(htmlFactory.make({
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
            equals(htmlFactory.basic("div"), '<div>');
        });
        test("button", function () {
            equals(htmlFactory.button({}), '<input tabindex="-1" type="button"/>', 'Basic button element');
            equals(htmlFactory.button({
                                      cl: 'classText',
                                      css: 'styleText',
                                      id: 'idText',
                                      val: 'valueText' }), '<input class="classText" id="idText" style="styleText" tabindex="-1" type="button" value="valueText"/>', 'Complex button element');
        });
        test("close", function () {
            equals(htmlFactory.close("div"), '</div>');
        });
        test("dd", function () {
            equals(htmlFactory.dd({}), '<dd>', 'Basic dd element');
            equals(htmlFactory.dd({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }), '<dd class="classText" id="idText" style="styleText">', 'Complex dd element');
        });
        test("div", function () {
            equals(htmlFactory.div({}), '<div>', 'Basic div element, implicitly non-hidden');
            equals(htmlFactory.div({}, false), '<div>', 'Basic div element, expressly non-hidden');
            equals(htmlFactory.div({
                                  alt: 'altText',
                                  cl: 'classText',
                                  css: 'color:black;',
                                  id: 'idText' }), '<div alt="altText" class="classText" id="idText" style="color:black;" title="altText">', 'Complex div element');
            equals(htmlFactory.div({}, true), '<div style="display:none;">', 'Basic hidden div element');
            equals(htmlFactory.div({
                                  alt: 'altText',
                                  cl: 'classText',
                                  css: 'color:black;',
                                  id: 'idText' }, true), '<div alt="altText" class="classText" id="idText" style="color:black;display:none;" title="altText">', 'Complex hidden div element');
        });
        test("fieldset", function () {
            equals(htmlFactory.fieldset({}), '<fieldset>', 'Basic fieldset element');
            equals(htmlFactory.fieldset({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }), '<fieldset class="classText" id="idText" style="styleText">', 'Complex fieldset element');
        });
        test("input", function () {
            equals(htmlFactory.input({}), '<input type="text"/>', 'Basic input element, implied type text');
            equals(htmlFactory.input({
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  size: '10',
                                  ti: '4',
                                  val: 'Test string',
                                  id: 'idText' }), '<input class="classText" id="idText" name="nameText" size="10" style="styleText" tabindex="4" type="text" value="Test string"/>', 'Complex input element, type text (implied)');
            equals(htmlFactory.input({
                                  cl: 'classText',
                                  css: 'styleText',
                                  'name': "nameText",
                                  size: '10',
                                  ti: '4',
                                  type: 'text',
                                  val: 'Test string',
                                  id: 'idText' }), '<input class="classText" id="idText" name="nameText" size="10" style="styleText" tabindex="4" type="text" value="Test string"/>', 'Complex input element, type text (explicit)');
            equals(htmlFactory.input({
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
            equals(htmlFactory.label({}), '<label></label>', 'Basic label element');
            equals(htmlFactory.label({
                                     cl: 'classText',
                                     css: 'styleText',
                                     for: 'forText',
                                     id: 'idText' }), '<label class="classText" for="forText" id="idText" style="styleText"></label>', 'Complex label element');
        });
        test("select", function () {
            equals(htmlFactory.select({}), '<select><option>[ Select One ]</option></select>', 'Basic select element');
            equals(htmlFactory.select({
                                      cl: 'classText',
                                      css: 'styleText',
                                      id: 'idText' }), '<select class="classText" id="idText" style="styleText"><option>[ Select One ]</option></select>', 'Complex select element with default default option text');
            equals(htmlFactory.select({
                                      cl: 'classText',
                                      css: 'styleText',
                                      textSelectOne: 'Custom Text!',
                                      id: 'idText' }), '<select class="classText" id="idText" style="styleText"><option>[ Custom Text! ]</option></select>', 'Complex select element with custom default option text');
        });
        test("span", function () {
            equals(htmlFactory.span({}), '<span>', 'Basic span element');
            equals(htmlFactory.span({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }), '<span class="classText" id="idText" style="styleText">', 'Complex span element');
        });

    module("mb_utility");
        test("Basic requirements", function () {
            ok( MusicBrainz.html, "MusicBrainz.html" );
            ok( MusicBrainz.text, "MusicBrainz.text" );
        });
        test("addOverlay", function () {
            ok(false, "missing test - untested code is broken code.");
        });
        test("addOverlayThis", function () {
            ok(false, "missing test - untested code is broken code.");
        });
        test("getChildValues", function () {
            ok(false, "missing test - untested code is broken code.");
        });
        test("getValue", function () {
            ok(false, "missing test - untested code is broken code.");
        });
});














