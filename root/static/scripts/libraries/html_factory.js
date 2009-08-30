/*jslint undef: true, browser: true*/
/*global jQuery, $, MusicBrainz */

/**
 * @fileOverview An HTML string factory.
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 */

"use strict";

/**
 * HTML element factory, used to build standardized html strings.
 * @constructor
 * @exports HTML_Factory as MusicBrainz.html
 */
var HTML_Factory = function () {
    var alt = 'alt',
        argFor = 'for',
        basic = 'basic',
        button = 'button',
        checked = 'checked',
        close = 'close',
        css = 'css',
        display = 'display',
        div = 'div',
        fieldset = 'fieldset',
        input = 'input',
        label = 'label',
        make = 'make',
        select = 'select',
        span = 'span',
        undef = 'undefined';
    /**
     * @description Stores css rule parameter strings.
     */
    this[css] = {
        'float' : {
            left   : 'float:left;',
            right  : 'float:right;'
        }
    };
    this[css][display] = {
        IB   : display + ':inline-block;',
        none : display + ':none;'
    };
    /**
     * @description Used by the various HTML shortcut functions to test the undefined state of an object key so it can be used in a manner
     *              that won't lead to our attempting to access the value of an undefined key.
     * @example checkDef('foo')
     * @param {Variable} arg The variable being tested.
     * @inner
     */
    function checkDef (arg) {
        return (typeof arg !== undef) ? arg : undefined;
    }
    /**
     * @description The central HTML string factory; it creates the actual HTML string using standardized format and attribute order.
     * @example MusicBrainz.html.make({ tag: 'div', cl: 'foo', id: 'bar', close: false })
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
     * @see <a href="#basic">basic</a>
     * @see <a href="#button">button</a>
     * @see <a href="#close">close</a>
     * @see <a href="#dd">dd</a>
     * @see <a href="#div">div</a>
     * @see <a href="#fieldset">fieldset</a>
     * @see <a href="#input">input</a>
     * @see <a href="#label">label</a>
     * @see <a href="#select">select</a>
     * @see <a href="#span">span</a>
     */
    this[make] = function (args) {
        /**
         * @description isDef is used internally to create the standardized string for a single attribute of an element.
         * @example isDef('foo', 'id')
         * @param {String} arg The value of the attribute key being tested.
         * @param {String} attr The attribute text to use in the generated HTML string.
         * @inner
         */
        var isDef = function (arg, attr) {
            return (typeof arg === undef) ? '' : (arg.length > 0 ? [' ',attr,'="',arg,'"'].join("") : '');
        };
        return '<' + args.tag +
               isDef(args[alt], alt) +
               ((typeof args[checked] !== undef) ? isDef(checked, checked) : '') +
               isDef(args.cl, 'class') +
               isDef(args[argFor], argFor) +
               isDef(args.id, 'id') +
               isDef(args['name'], 'name') +
               isDef(args.size, 'size') +
               isDef(args[css], 'style') +
               isDef(args.ti, 'tabindex') +
               isDef(args.title, 'title') +
               isDef(args.type, 'type') +
               isDef(args.val, 'value') +
               (args[close] ? '/>' : '>');
    };
    /**
    * @description Used to create simple elements, with no attributes, such as &lt;textarea&gt;.
    * @example MusicBrainz.html.basic('textarea')
    * @param {String} tag The element type to create.
    * @see <a href="#close">close</a>
    * @see <a href="#make">make</a>
    */
    this[basic] = function (tag) {
        return this[make]({
                         tag: tag,
                         close: 0
                         });
    };
    /**
     * @description Creates a button-type input (which is removed from the tab index).
     * @example MusicBrainz.html.button({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;input&gt; string being formed.
     * @param {String} [args.id] The "id" attribute.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.val] The "value" attribute.
     * @see <a href="#close">close</a>
     * @see <a href="#input">input</a>
     * @see <a href="#make">make</a>
     */
    this[button] = function (args) {
        return this[input]({
                          cl   : checkDef(args.cl),
                          css  : checkDef(args[css]),
                          id   : checkDef(args.id),
                          ti   : '-1',
                          type : button,
                          val  : checkDef(args.val)
                          });
    };
    /**
     * @description Used to create simple closing elements, such as &lt;/textarea&gt;.
     * @example MusicBrainz.html.close('textarea')
     * @param {String} tag The element type to close.
     * @see <a href="#basic">basic</a>
     * @see <a href="#make">make</a>
     */
    this[close] = function (tag) {
        return this[basic]('/' + tag);
    };
    /**
     * @description Used to create dd elements.
     * @example MusicBrainz.html.dd({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;dd&gt; string being formed.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @see <a href="#close">close</a>
     * @see <a href="#make">make</a>
     */
    this.dd = function (args) {
        return this[make]({
                         tag   : 'dd',
                         cl    : checkDef(args.cl),
                         css   : checkDef(args[css]),
                         id    : checkDef(args.id),
                         close : 0
                         });
    };
    /**
     * @description Used to create div elements.
     * @example MusicBrainz.html.div({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;div&gt; string being formed.
     * @param {String} [args.alt] The "alt" and "title" attributes.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @param {Boolean} [hide] Create this element with "display: none" set.
     * @see <a href="#close">close</a>
     * @see <a href="#make">make</a>
     */
    this[div] = function (args, hide) {
        hide = typeof hide === undef ? false : hide;
        return this[make]({
                         tag   : div,
                         alt   : checkDef(args[alt]),
                         cl    : checkDef(args.cl),
                         css   : (typeof args[css] !== undef ? args[css] : '') + (hide ? this[css][display].none : ''),
                         id    : checkDef(args.id),
                         title : checkDef(args[alt]),
                         close : 0
                         });
    };
    /**
     * @description Used to create fieldset elements.
     * @example MusicBrainz.html.fieldset({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;fieldset&gt; string being formed.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @see <a href="#close">close</a>
     * @see <a href="#make">make</a>
     */
    this[fieldset] = function (args) {
        return this[make]({
                         tag   : fieldset,
                         cl    : checkDef(args.cl),
                         css   : checkDef(args[css]),
                         id    : checkDef(args.id),
                         close : 0
                         });
    };
    /**
     * @description Used to create input elements.
     * @example MusicBrainz.html.input({ cl: 'foo', id: 'bar', type: 'checkbox' })
     * @param {Object} args The attributes to be added to the &lt;input&gt; string being formed.
     * @param {String} [args.checked] The "checked" attribute.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @param {String} [args.size] The "size" attribute.
     * @param {String} [args.ti] The "tabindex" attribute.
     * @param {String} [args.type] The "type" attribute; by default, inputs of type text will be created if this is omitted.
     * @param {String} [args.val] The "value" attribute.
     * @see <a href="#button">button</a>
     * @see <a href="#close">close</a>
     * @see <a href="#make">make</a>
     */
    this[input] = function (args) {
        return this[make]({
                         tag     : input,
                         cl      : checkDef(args.cl),
                         checked : checkDef(args[checked]),
                         css     : checkDef(args[css]),
                         id      : checkDef(args.id),
                         'name'  : checkDef(args.name),
                         size    : checkDef(args.size),
                         ti      : checkDef(args.ti),
                         type    : typeof args.type !== undef ? args.type : 'text',
                         val     : checkDef(args.val),
                         close   : 1
                         });
    };
    /**
     * @description Used to create label elements.
     * @example MusicBrainz.html.label({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;label&gt; string being formed.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.for] The "for" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @param {String} [args.val] The string to use for the label's text.
     * @see <a href="#close">close</a>
     * @see <a href="#make">make</a>
     */
    this[label] = function (args) {
        return this[make]({
                         tag   : label,
                         cl    : checkDef(args.cl),
                         css   : checkDef(args[css]),
                         'for' : checkDef(args[argFor]),
                         id    : checkDef(args.id),
                         close : 0
                         }) +
               (typeof args.val !== undef ? args.val : '') +
               this[close](label);
    };
    /**
     * @description Used to create unpopulated select elements with a default "[ Select One ]" option.
     * @example MusicBrainz.html.select({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;select&gt; string being formed.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @param {String} [args.text.SelectOne] The text to use for the "nothing selected" option; default text is stored in MusicBrainz.text.SelectOne.
     * @see <a href="#close">close</a>
     * @see <a href="#make">make</a>
     */
    this[select] = function (args) {
        var close = 'close',
            make = 'make',
            option = 'option',
            textSelectOne = 'textSelectOne';
        return this[make]({
                          tag   : select,
                          cl    : checkDef(args.cl),
                          id    : checkDef(args.id),
                          css   : checkDef(args[css]),
                          close : 0
                          }) +
               this[make]({
                          tag   : option,
                          val   : '',
                          close : 0
                          }) +
               '[ ' + (args.hasOwnProperty(textSelectOne) ? args[textSelectOne] : MusicBrainz.text.SelectOne) + ' ]' +
               this[close](option) +
               this[close](select);
    };
    /**
     * @description Used to create span elements.
     * @example MusicBrainz.html.span({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;span&gt; string being formed.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @see <a href="#close">close</a>
     * @see <a href="#make">make</a>
     */
    this[span] = function (args) {
        return this[make]({
                         tag   : span,
                         cl    : checkDef(args.cl),
                         id    : checkDef(args.id),
                         css   : checkDef(args[css]),
                         close : 0
                         });
   };
};
MusicBrainz.html = new HTML_Factory();
