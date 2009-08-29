$(document).ready(function () {

    module("QUnit");
        test("Self-test", function () {
            var actual = { a: 1 };
            expect(3);
            ok(true, "Boolean assertion");
            equals(true, true, "Shallow comparison assertion");
            same(actual, { a: 1 }, "Deep comparison assertion");
        });

    module("jQuery");
        test("Basic requirements", function () {
            ok( jQuery, "jQuery" );
            ok( $, "$" );
        });

    module("HTML Factory");
        var htmlFactory = new HTML_Factory();
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
            ok(false, "missing test - untested code is broken code.");
        });
        test("label", function () {
            ok(false, "missing test - untested code is broken code.");
        });
        test("select", function () {
            ok(false, "missing test - untested code is broken code.");
        });
        test("span", function () {
            equals(htmlFactory.span({}), '<span>', 'Basic span element');
            equals(htmlFactory.span({
                                  cl: 'classText',
                                  css: 'styleText',
                                  id: 'idText' }), '<span class="classText" id="idText" style="styleText">', 'Complex span element');
        });

    module("mb_utility");
        test("addOverlay", function () {
            ok(false, "missing test - untested code is broken code.");
        });
        test("getChildValues", function () {
            ok(false, "missing test - untested code is broken code.");
        });
        test("getValue", function () {
            ok(false, "missing test - untested code is broken code.");
        });
});














