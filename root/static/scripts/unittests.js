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
                                      css: 'classText',
                                      id: 'idText',
                                      val: 'valueText' }), '<input class="classText" id="idText" style="classText" tabindex="-1" type="button" value="valueText"/>', 'Complex button element');
        });
        test("close", function () {
            equals(htmlFactory.close("div"), '</div>');
        });


});
