/*jslint undef: true, browser: true*/
/*global MusicBrainz */

/**
 * @fileOverview An HTML string factory.
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 * @requires text_strings.js
 */

"use strict";

(function () {
    var accesskey   = 'accesskey',
        alt         = 'alt',
        checked     = 'checked',
        css         = 'css',
        display     = 'display',
        emptyString = '',
        href        = 'href',
        hreflang    = href + 'lang',
        html        = 'html',
        none        = 'none',
        title       = 'title',
        undef       = 'undefined';
    /**
     * @description Used internally to create the standardized string for a single attribute of an element.
     * @example isDef('foo', 'id')
     * @param {String} args The attributes object containing the properties to be used for HTML string formation.
     * @param {String} arg The value of the attribute key being tested.
     * @param {String} [attr] The attribute name; defaults to the value of arg.
     * @param {String} [override] An attribute value to use in place of the one passed via the attributes.
     */
    function isDef (args) {
        return function (arg, attr, override) {
            var thisKeyname = args[arg];
            return typeof thisKeyname === undef ? emptyString : (thisKeyname ? [' ', attr || arg, '="', override || thisKeyname, '"'].join(emptyString) : emptyString);
        };
    }
    /**
     * @description Used internally to create an object with a tag key assigned.
     * @example makeTagObj('div')
     * @param {String} tagName The value to assign to the tag key.
     */
    function makeTagObj (tagName) {
        return { tag: tagName };
    }
    /**
     * HTML element factory, used to build standardized html strings.
     * @constructor
     */
    function Inner_HTML () {
        /**
         * @description Stores css rule parameter strings.
         */
        this[css] = {
            display : {
                IB   : display + ':inline-block;',
                none : display + ':none;'
            },
            'float' : {
                left  : 'float:left;',
                right : 'float:right;'
            }
        };
    }
    Inner_HTML.prototype = {
        /**
         * @description The central HTML string factory; it creates the actual HTML string using standardized format and attribute order.
         * @example MusicBrainz.html().make({ tag: 'div', cl: 'foo', id: 'bar', close: false })
         * @param {Object} args The attributes to be added to the HTML element string being formed.
         * @param {String} [args.alt] The "accesskey" attribute.
         * @param {String} [args.alt] The "alt" attribute.
         * @param {String} [args.checked] The "checked" attribute.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.for] The "for" attribute.
         * @param {String} [args.href] The "href" attribute.
         * @param {String} [args.hreflang] The "hreflang" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.rel] The "rel" attribute.
         * @param {String} [args.rev] The "rev" attribute.
         * @param {String} [args.size] The "size" attribute.
         * @param {String} [args.src] The "src" attribute.
         * @param {String} [args.ti] The "tabindex" attribute.
         * @param {String} [args.title] The "title" attribute.
         * @param {String} [args.type] The "type" attribute.
         * @param {String} [args.val] The "value" attribute.
         * @param {Boolean} args.close Is this a self-closing element?
         * @param {Object} [originalArgs] Used internally to pass in the original attribute object from accessor functions.
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
        make: function (args, originalArgs) {
            var localIsDef = isDef(args),
                coreSource = originalArgs || args;
            /* Set core W3C element properties. */
            args[alt] = args[title] = coreSource[alt];
            args.cl   = coreSource.cl;
            args[css] = coreSource[css];
            args.id   = coreSource.id;
            /* Generate the HTML string. */
            this[html] = [(this[html] || emptyString),
                        '<' + args.tag,
                        localIsDef(accesskey),
                        localIsDef(alt),
                        localIsDef(checked, checked, checked),
                        localIsDef('cl', 'class'),
                        localIsDef('for'),
                        localIsDef(href),
                        localIsDef(hreflang),
                        localIsDef('id'),
                        localIsDef('name'),
                        localIsDef('rel'),
                        localIsDef('rev'),
                        localIsDef('size'),
                        localIsDef(css, 'style'),
                        localIsDef('ti', 'tabindex'),
                        localIsDef(title),
                        localIsDef('type'),
                        localIsDef('val', 'value'),
                        (args.close ? '/>' : '>')].join(emptyString);
            return this;
        },
        /**
         * @description Used to create anchor elements.
         * @example MusicBrainz.html().a({ cl: 'foo', id: 'bar', href: 'musicbrainz.org', val: 'MusicBrainz main page' })
         * @example MusicBrainz.html().a({ cl: 'foo', id: 'bar', notHTTP: true, href: 'ftp://musicbrainz.org', val: 'MusicBrainz ftp site' })
         * @param {Object} args The attributes to be added to the &lt;heading&gt; string being formed.
         * @param {String} [args.accesskey] The "accesskey" attribute.
         * @param {String} [args.alt] The "alt" attribute.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.href] The "href" attribute, excluding the 'http://' (see args.notHTTP).
         * @param {String} [args.hreflang] The "hreflang" attribute, excluding the 'http://' (see args.notHTTP).
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.name] The "name" attribute.
         * @param {String} [args.notHTTP] Indicates that args.href and/or args.hreflang are not http protocol.
         * @param {String} [args.rel] The "rel" attribute.
         * @param {String} [args.rev] The "rev" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.target] The "target" attribute.
         * @param {String} [args.ti] The "tabindex" attribute; 'none' can be used to have a -1 tabindex set.
         * @param {String} [args.title] The "title" attribute.
         * @param {String} [args.val] The html to appear within the anchor; if omitted, an empty anchor element is returned.
         * @see <a href="#make">make</a>
         */
        a: function (args) {
            var urlPrefix = args.notHTTP ? emptyString : 'http://',
                obj = {
                      tag    : 'a',
                      href   : args[href] ? urlPrefix + args[href] : emptyString,
                      name   : args.name,
                      rel    : args.rel,
                      rev    : args.rev,
                      target : args.target,
                      ti     : args.ti === none ? '-1' : args.ti
                      };
            obj[accesskey] = args[accesskey];
            obj[hreflang] = args[hreflang] ? urlPrefix + args[hreflang] : emptyString;
            return this.make(obj, args)
                       .text(args.val || emptyString)
                       .close('a');
        },
        /**
        * @description Used to create simple elements, with no attributes, such as &lt;textarea&gt;.
        * @example MusicBrainz.html().basic('textarea')
        * @param {String} tag The element type to create.
        * @see <a href="#close">close</a>
        * @see <a href="#make">make</a>
        */
        basic: function (tag) {
            return this.make(makeTagObj(tag));
        },
        /**
         * @description Creates a button-type input (which is removed from the tab index).
         * @example MusicBrainz.html().button({ cl: 'foo', id: 'bar' })
         * @param {Object} args The attributes to be added to the &lt;input&gt; string being formed.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.alt] The "accesskey" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.ti] The "tabindex" attribute; 'none' can be used to have a -1 tabindex set.
         * @param {String} [args.val] The "value" attribute.
         * @see <a href="#close">close</a>
         * @see <a href="#input">input</a>
         * @see <a href="#make">make</a>
         */
        button: function (args) {
            var obj = {
                      cl   : args.cl,
                      id   : args.id,
                      ti   : args.ti === none ? '-1' : args.ti,
                      type : 'button',
                      val  : args.val
                      };
            obj[accesskey] = args[accesskey];
            obj[alt] = obj[title] = args[alt];
            obj[css] = args[css];
            return this.input(obj);
        },
        /**
         * @description Used to create simple closing elements, such as &lt;/textarea&gt;.
         * @example MusicBrainz.html().close('textarea')
         * @param {String} tag The element type to close.
         * @see <a href="#basic">basic</a>
         * @see <a href="#make">make</a>
         */
        close: function (tag) {
            return this.basic('/' + tag);
        },
        /**
         * @description Used to create dd elements.
         * @example MusicBrainz.html().dd({ cl: 'foo', id: 'bar' })
         * @param {Object} args The attributes to be added to the &lt;dd&gt; string being formed.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @see <a href="#close">close</a>
         * @see <a href="#make">make</a>
         */
        dd: function (args) {
            return this.make(makeTagObj('dd'), args);
        },
        /**
         * @description Used to create div elements.
         * @example MusicBrainz.html().div({ cl: 'foo', id: 'bar' })
         * @param {Object} args The attributes to be added to the &lt;div&gt; string being formed.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {Boolean} [hide] Create this element with "display: none" set.
         * @see <a href="#close">close</a>
         * @see <a href="#make">make</a>
         */
        div: function (args, hide) {
            var obj = makeTagObj('div');
            args[css] = (typeof args[css] !== undef ? args[css] : emptyString) + (typeof hide !== undef && hide ? this[css][display][none] : emptyString);
            return this.make(obj, args);
        },
        /**
         * @description Used to create fieldset elements.
         * @example MusicBrainz.html().fieldset({ cl: 'foo', id: 'bar' })
         * @param {Object} args The attributes to be added to the &lt;fieldset&gt; string being formed.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @see <a href="#close">close</a>
         * @see <a href="#make">make</a>
         */
        fieldset: function (args) {
            return this.make(makeTagObj('fieldset'), args);
        },
        /**
         * @description Used to create heading elements.
         * @example MusicBrainz.html().h({ cl: 'foo', id: 'bar', level: 6, val: 'This is a heading' })
         * @param {Object} args The attributes to be added to the &lt;heading&gt; string being formed.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.cl] The "class" attribute.
         * @param {Int} [args.level] The heading level for the tag; valid values are 1 through 6; default is 1.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.val] The html to appear within the heading; if omitted, an empty heading element is returned.
         * @see <a href="#make">make</a>
         */
        h: function (args) {
            var level = parseInt(args.level, 10);
            level = 'h' + (level > 0 && level < 7 ? level : 1);
            return this.make(makeTagObj(level), args)
                       .text(args.val || emptyString)
                       .close(level);
        },
        /**
         * @description Used to create input elements.
         * @example MusicBrainz.html().input({ cl: 'foo', id: 'bar', type: 'checkbox' })
         * @param {Object} args The attributes to be added to the &lt;input&gt; string being formed.
         * @param {String} [args.alt] The "accesskey" attribute.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.checked] The "checked" attribute.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.size] The "size" attribute.
         * @param {String} [args.ti] The "tabindex" attribute; 'none' can be used to have a -1 tabindex set.
         * @param {String} [args.type] The "type" attribute; by default, inputs of type text will be created if this is omitted.
         * @param {String} [args.val] The "value" attribute.
         * @see <a href="#button">button</a>
         * @see <a href="#close">close</a>
         * @see <a href="#make">make</a>
         */
        input: function (args) {
            var obj = {
                      tag   : 'input',
                      name  : args.name,
                      size  : args.size,
                      ti    : args.ti === none ? '-1' : args.ti,
                      type  : args.type || 'text',
                      val   : args.val,
                      close : 1
                      };
            obj[accesskey] = args[accesskey];
            obj[checked] = args[checked];
            return this.make(obj, args);
        },
        /**
         * @description Used to create label elements.
         * @example MusicBrainz.html().label({ cl: 'foo', id: 'bar' })
         * @param {Object} args The attributes to be added to the &lt;label&gt; string being formed.
         * @param {String} [args.alt] The "accesskey" attribute.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.for] The "for" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.val] The string to use for the label's text.
         * @see <a href="#close">close</a>
         * @see <a href="#make">make</a>
         */
        label: function (args) {
            var obj = {
                      tag       : 'label',
                      'for'     : args['for']
                      };
            obj[accesskey] = args[accesskey];
            return this.make(obj, args)
                       .text(args.val || emptyString)
                       .close('label');
        },
        /**
         * @description Used to create unpopulated select elements with a default "[ Select One ]" option.
         * @example MusicBrainz.html().select({ cl: 'foo', id: 'bar' })
         * @param {Object} args The attributes to be added to the &lt;select&gt; string being formed.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.text.SelectOne] The text to use for the "nothing selected" option; default text is stored in MusicBrainz.text.SelectOne.
         * @see <a href="#close">close</a>
         * @see <a href="#make">make</a>
         */
        select: function (args) {
            var textSelectOne = 'textSelectOne',
                option = 'option',
                select = 'select';
            return this.make({
                             tag   : select,
                             type  : select + '-one'
                             }, args)
                       .make({
                             tag   : option,
                             val   : emptyString
                             })
                       .text('[ ' + (args[textSelectOne] ? args[textSelectOne] : MusicBrainz.text.SelectOne) + ' ]')
                       .close(option)
                       .close(select);
        },
        /**
         * @description Used to create span elements.
         * @example MusicBrainz.html().span({ cl: 'foo', id: 'bar' })
         * @param {Object|String} args The attributes to be added to the &lt;span&gt; string being formed; if only a string is passed, a basic span is created, with the string as the HTML to appear within the span.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.val] The HTML to appear within the span; if omitted, an empty span element is returned.
         * @see <a href="#close">close</a>
         * @see <a href="#make">make</a>
         */
        span: function (args) {
            return this.make(makeTagObj('span'), args)
                       .text(typeof args === 'string' ? args : args.val || emptyString)
                       .close('span');
        },
        /**
         * @description Used to insert plaintext within an HTML string without breaking a chain.
         * @example MusicBrainz.html().text('foo')
         * @param {String} [text] The text to append to the HTML string being formed.
         */
        text: function (text) {
            this[html] = (this[html] || emptyString) + (text || emptyString);
            return this;
        },
        /**
         * @description Allows access to element creation methods when method to be accessed is variable.
         * @example MusicBrainz.html().use('div')
         * @param {String} eleName The element creation function to invoke.
         * @param {Object} args The attribute settings to be passed into the element creation function.
         */
        use: function (eleName, args) {
            return this[eleName].call(this, args);
        }
    };
    MusicBrainz[html] = function () {
        return new Inner_HTML();
    };
}());
