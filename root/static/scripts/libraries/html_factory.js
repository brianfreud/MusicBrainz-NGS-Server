/*jslint bitwise: true, browser: true, eqeqeq: true, immed: true, newcap: true, nomen: true,
         onevar: true, plusplus: false, regexp: false, rhino: true,  strict: true, undef: true */
/*global MusicBrainz, $, jQuery, window */
/*members IB, SelectOne, a, accesskey, addHTML, after, alt, append, basic, before, button, call, checked, cl, close, constructor, css, 
    display, div, end, fn, for, h, hasOwnProperty, href, hreflang, html, id, img, innerHTMLtoMB, input, insertInto, join, label, length, level, make, 
    name, none, notHTTP, option, outerHTML, outerHTMLtoMB, parent, parseInt, prepend, prototype, rel, replace, rev, select, size, span, src, swap, 
    tag, target, text, textSelectOne, ti, title, tojQuery, type, use, val
*/
/**
 * @fileOverview An HTML string factory.
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 * @version 1.1.0
 * @requires text_strings.js
 * @requires jquery.jquery.js
 * @requires jquery.outerHTML.js
 */

"use strict";

(function () {
    var i, loops, htmlStr,
        jQueryMethods = {
                        after: 'after',
                        append: 'append',
                        before: 'before',
                        insertInto: 'html',
                        prepend: 'prepend',
                        'replace': 'replaceWith'
                        },
        closed        = [/* XHTML 1.1 */ 'area','br','col','hr','param' /* HTML 5 */ /* ,'embed' */],
        nonClosed     = [/* XHTML 1.1 */
                        'abbr','address','bdo','blockquote','caption','cite','code','colgroup','dd','del','dfn','dl','dt',
                        'em','fieldset','form','iframe','ins','kbd','legend','li','map','object','ol','optgroup','option',
                        'p','pre','q','samp','script','style','sub', 'sup','table','tbody','td','textarea','tfoot','th',
                        'thead','title','tr','tt','ul', /* redefined in HTML 5 */ 'b','i','menu','small','strong',
                        /* HTML 5  */ /* 'article','aside','audio',*/ 'canvas' /*,'command','datalist','details','dialog','eventsource',
                        'figure','footer','header','hgroup','keygen','mark','meter','nav','output','progress','rp','rt','ruby','section',
                        'source','time','video' */],
    /**
     * Used internally to create an object with a tag key assigned.
     *
     * @example makeTagObj('div')
     * @param {String} tagName The value to assign to the tag key.
     */
    makeTagObj = function (tagName) {
        return { tag: tagName };
    },
    /**
     * Used internally as method for elements which are not specifically defined.
     *
     * @example genericElement('tt')
     * @param {String} element The element being created.
     */
    genericElement = function (element, closeVal) {
        return function (args) {
            args        = args || {};
            args.tag    = element;
            args.close  = closeVal;
            return this.make.call(this, args);
        };
    },
    /**
     * Used internally to invoke jQuery methods.
     *
     * @example genericjQueryMethod('append')
     * @param {String} method The method being invoked.
     * @param {Bool} [jQueryScope] Optionally return the target's jQuery scope rather than the MusicBrainz.html() scope.
     */
    genericjQueryMethod = function (method) {
        return function (element, jQueryScope) {
            var $element   = $(element),
                oldHTML    = $element.parent().html(),
                jQueryThis = $element[method](this.html);
            /* The folling conditional test for null will only ever resolve to false when using .replace(selector, 1) */
            return typeof jQueryScope !== 'undefined' && jQueryScope ? (jQueryThis.parent().html() !== null ? jQueryThis : oldHTML) : this;
        };
    },
    /**
     * Used internally to create the standardized string for a single attribute of an element.
     *
     * @example createAttributeStringIfDefined('foo', 'id')
     * @param {Object} [args] The attributes object containing the properties to be used for HTML string formation.
     * @param {String} arg The value of the attribute key being tested.
     * @param {String} [attr] The attribute name; defaults to the value of arg.
     * @param {String} [override] An attribute value to use in place of the one passed via the attributes.
     */
    createAttributeStringIfDefined = function (args) {
        return function (arg, attr, override) {
            args = args || {};
            var thisKeyname = args[arg];
            return typeof thisKeyname === 'undefined' ? '' : (thisKeyname ? [' ', attr || arg, '="', override || thisKeyname, '"'].join('') : '');
        };
    },
    /**
     * HTML element factory, used to build standardized html strings.<br /><br />
     * <em>All MusicBrainz html string generation method invocations must begin with this function.</em>
     *
     * @name Inner_HTML
     * @constructor
     * @exports Inner_HTML as MusicBrainz.html
     */
    Inner_HTML = function () {
        /**
         * Stores css rule parameter strings.
         *
         * @name css
         * @memberOf MusicBrainz.html
         */
        this.css = {
            /**
             * @name display
             * @memberOf MusicBrainz.html.css
             * @public
             */
            display : {
                IB   : 'display:inline-block;',
                none : 'display:none;'
            }
        };
    };
    Inner_HTML.prototype = {
        /* MAIN STRING GENERATOR FUNCTION */

        /**
         * The central HTML string factory; it creates the actual HTML string using standardized format and attribute order.
         *
         * @name make
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html()[make]({ tag: 'div', cl: 'foo', id: 'bar', close: false })
         * @param {Object} [args] The attributes to be added to the HTML element string being formed.
         * @param {String} [args.accesskey] The "accesskey" attribute.
         * @param {String} [args.alt] The "alt" attribute.
         * @param {String} [args.checked] The "checked" attribute.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.for] The "for" attribute.
         * @param {String} [args.href] The "href" attribute.
         * @param {String} [args.hreflang] The "hreflang" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.name] The "name" attribute.
         * @param {String} [args.rel] The "rel" attribute.
         * @param {String} [args.rev] The "rev" attribute.
         * @param {String} [args.size] The "size" attribute.
         * @param {String} [args.src] The "src" attribute.
         * @param {String} [args.ti] The "tabindex" attribute.
         * @param {String} [args.target] The "target" attribute.
         * @param {String} [args.title] The "title" attribute.
         * @param {String} [args.type] The "type" attribute.
         * @param {String} [args.val] The "value" attribute.
         * @param {Boolean} args.close Is this a self-closing element?
         * @param {Object} [originalArgs] Used internally to pass in the original attribute object from accessor functions.
         * @see MusicBrainz.html.a
         * @see MusicBrainz.html.abbr
         * @see MusicBrainz.html.address
         * @see MusicBrainz.html.area
         * @see MusicBrainz.html.b
         * @see MusicBrainz.html.basic
         * @see MusicBrainz.html.bdo
         * @see MusicBrainz.html.blockquote
         * @see MusicBrainz.html.br
         * @see MusicBrainz.html.button
         * @see MusicBrainz.html.canvas
         * @see MusicBrainz.html.caption
         * @see MusicBrainz.html.cite
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.code
         * @see MusicBrainz.html.col
         * @see MusicBrainz.html.colgroup
         * @see MusicBrainz.html.dd
         * @see MusicBrainz.html.del
         * @see MusicBrainz.html.dfn
         * @see MusicBrainz.html.div
         * @see MusicBrainz.html.dl
         * @see MusicBrainz.html.dt
         * @see MusicBrainz.html.em
         * @see MusicBrainz.html.fieldset
         * @see MusicBrainz.html.form
         * @see MusicBrainz.html.hr
         * @see MusicBrainz.html.i
         * @see MusicBrainz.html.iframe
         * @see MusicBrainz.html.input
         * @see MusicBrainz.html.ins
         * @see MusicBrainz.html.kbd
         * @see MusicBrainz.html.label
         * @see MusicBrainz.html.legend
         * @see MusicBrainz.html.li
         * @see MusicBrainz.html.map
         * @see MusicBrainz.html.menu
         * @see MusicBrainz.html.object
         * @see MusicBrainz.html.ol
         * @see MusicBrainz.html.optgroup
         * @see MusicBrainz.html.option
         * @see MusicBrainz.html.p
         * @see MusicBrainz.html.param
         * @see MusicBrainz.html.pre
         * @see MusicBrainz.html.q
         * @see MusicBrainz.html.samp
         * @see MusicBrainz.html.script
         * @see MusicBrainz.html.select
         * @see MusicBrainz.html.small
         * @see MusicBrainz.html.span
         * @see MusicBrainz.html.strong
         * @see MusicBrainz.html.style
         * @see MusicBrainz.html.sub
         * @see MusicBrainz.html.sup
         * @see MusicBrainz.html.table
         * @see MusicBrainz.html.tbody
         * @see MusicBrainz.html.td
         * @see MusicBrainz.html.text
         * @see MusicBrainz.html.textarea
         * @see MusicBrainz.html.tfoot
         * @see MusicBrainz.html.th
         * @see MusicBrainz.html.thead
         * @see MusicBrainz.html.title
         * @see MusicBrainz.html.tr
         * @see MusicBrainz.html.tt
         * @see MusicBrainz.html.ul
         * @see MusicBrainz.html.use
         * @see MusicBrainz.html.var
         */
        make: function (args, originalArgs) {
            args = args || {};
            var localCreateAttributeStringIfDefined = createAttributeStringIfDefined(args),
                coreSource = originalArgs || args;
            /* Set core W3C element properties. */
            args.alt  = args.title = coreSource.alt;
            args.cl   = coreSource.cl;
            args.css  = coreSource.css;
            args.id   = coreSource.id;
            /* Generate the HTML string. */
            this.html = [(this.html || ''),
                        '<' + args.tag,
                        localCreateAttributeStringIfDefined('accesskey'),
                        localCreateAttributeStringIfDefined('alt'),
                        localCreateAttributeStringIfDefined('checked', 'checked', 'checked'),
                        localCreateAttributeStringIfDefined('cl', 'class'),
                        localCreateAttributeStringIfDefined('colspan'),
                        localCreateAttributeStringIfDefined('for'),
                        localCreateAttributeStringIfDefined('href'),
                        localCreateAttributeStringIfDefined('hreflang'),
                        localCreateAttributeStringIfDefined('id'),
                        localCreateAttributeStringIfDefined('name'),
                        localCreateAttributeStringIfDefined('rel'),
                        localCreateAttributeStringIfDefined('rev'),
                        localCreateAttributeStringIfDefined('size'),
                        localCreateAttributeStringIfDefined('span'),
                        localCreateAttributeStringIfDefined('src'),
                        localCreateAttributeStringIfDefined('css', 'style'),
                        localCreateAttributeStringIfDefined('ti', 'tabindex'),
                        localCreateAttributeStringIfDefined('target'),
                        localCreateAttributeStringIfDefined('title'),
                        localCreateAttributeStringIfDefined('type'),
                        localCreateAttributeStringIfDefined('val', 'value'),
                        (args.close ? ' />' : '>')].join('');
            return this;
        },

        /* STRING GENERATOR ACCESSOR FUNCTIONS */

        /**
         * Generates the HTML for an anchor element.
         *
         * @name a
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().a({ cl: 'foo', id: 'bar', href: 'musicbrainz.org', val: 'MusicBrainz main page' })
         * @example MusicBrainz.html().a({ cl: 'foo', id: 'bar', notHTTP: true, href: 'ftp://musicbrainz.org', val: 'MusicBrainz ftp site' })
         * @param {Object} [args] The attributes to be added to the &lt;heading&gt; string being formed.
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
         * @see MusicBrainz.html.make
         */
        a: function (args) {
            args = args || {};
            var urlPrefix = args.notHTTP ? '' : 'http://',
                obj = {
                      tag    : 'a',
                      href   : args.href ? urlPrefix + args.href : '',
                      rel    : args.rel,
                      rev    : args.rev,
                      target : args.target,
                      ti     : args.ti === 'none' ? '-1' : args.ti
                      };
            obj.name      = args.name;
            obj.accesskey = args.accesskey;
            obj.hreflang  = args.hreflang ? urlPrefix + args.hreflang : '';
            if (typeof args === 'string') {
                return this.basic('span')
                           .text(args)
                           .close('span');
            } else {
                return this.make(obj, args)
                           .text(args.val || '')
                           .close('a');
            }
        },
        /**
         * Generates the HTML for a simple element with no attributes, such as &lt;textarea&gt;.
         *
         * @name basic
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().basic('textarea')
         * @param {String} tag The element type to create.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         */
        basic: function (tag) {
            return this.make(makeTagObj(tag));
        },
        /**
         * Generates the HTML for a button-type input (which is removed from the tab index).</br />
         * <em>Note: This creates an input element of type button, not a button element.</em>
         *
         * @name button
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().button({ cl: 'foo', id: 'bar' })
         * @param {Object} [args] The attributes to be added to the &lt;input&gt; string being formed.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.alt] The "accesskey" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.ti] The "tabindex" attribute; 'none' can be used to have a -1 tabindex set.
         * @param {String} [args.val] The "value" attribute.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.input
         * @see MusicBrainz.html.make
         */
        button: function (args) {
            args = args || {};
            var obj = {
                      cl   : args.cl,
                      id   : args.id,
                      ti   : args.ti === 'none' ? '-1' : args.ti,
                      type : 'button',
                      val  : args.val
                      };
            obj.accesskey = args.accesskey;
            obj.alt       = obj.title = args.alt;
            obj.css       = args.css;
            if (typeof args === 'string') {
                return this.input({
                                  type: 'button',
                                  val: args
                                  });
            } else {
                return this.input(obj);
            }
        },
        /**
         * Generates the HTML for a simple closing element, such as &lt;/textarea&gt;.
         *
         * @name close
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().close('textarea')
         * @param {String} tag The element type to close.
         * @see MusicBrainz.html.basic
         * @see MusicBrainz.html.make
         */
        close: function (tag) {
            return this.basic('/' + tag);
        },
        /**
         * Generates the HTML for a div element.
         *
         * @name div
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().div({ cl: 'foo', id: 'bar' })
         * @param {Object} [args] The attributes to be added to the &lt;div&gt; string being formed.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {Boolean} [hide] Create this element with "display: none" set.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         */
        div: function (args, hide) {
            var obj = makeTagObj('div');
            args = args || {};
            args.css = (typeof args.css !== 'undefined' ? args.css : '') + (typeof hide !== 'undefined' && hide ? this.css.display.none : '');
            return this.make(obj, args);
        },
        /**
         * Generates the HTML for a heading element.
         *
         * @name h
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().h({ cl: 'foo', id: 'bar', level: 6, val: 'This is a heading' })
         * @param {Object} [args] The attributes to be added to the &lt;heading&gt; string being formed.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.cl] The "class" attribute.
         * @param {Int} [args.level] The heading level for the tag; valid values are 1 through 6; default is 1.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.val] The html to appear within the heading; if omitted, an empty heading element is returned.
         * @see MusicBrainz.html.make
         */
        h: function (args) {
            args = args || {};
            var level = window.parseInt(args.level, 10);
            level = 'h' + (level > 0 && level < 7 ? level : 1);
            return this.make(makeTagObj(level), args)
                       .text(args.val || '')
                       .close(level);
        },
        /**
         * Generates the HTML for an img element.
         *
         * @name img
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().img({ cl: 'foo', id: 'bar', src: 'http://musicbrainz.org/foo.png' })
         * @param {Object} [args] The attributes to be added to the &lt;img&gt; string being formed.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.src] The "src" attribute.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         */
        img: function (args) {
            args = args || {};
            var obj = {
                      tag   : 'img',
                      src   : typeof args === 'string' ? args : args.src || args.href, 
                      close : 1
                      };
            return this.make(obj, args);
        },
        /**
         * Generates the HTML for an input element.
         *
         * @name input
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().input({ cl: 'foo', id: 'bar', type: 'checkbox' })
         * @param {Object} [args] The attributes to be added to the &lt;input&gt; string being formed.
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
         * @see MusicBrainz.html.button
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         */
        input: function (args) {
            args = args || {};
            var obj = {
                      tag   : 'input',
                      size  : args.size,
                      ti    : args.ti === 'none' ? '-1' : args.ti,
                      type  : args.type || 'text',
                      val   : args.val
                      };
            obj.accesskey = args.accesskey;
            obj.checked   = args.checked;
            obj.close     = 1;
            obj.name      = args.name;
            return this.make(obj, args);
        },
        /**
         * Generates the HTML for a label element.
         *
         * @name label
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().label({ cl: 'foo', id: 'bar' })
         * @param {Object} [args] The attributes to be added to the &lt;label&gt; string being formed.
         * @param {String} [args.alt] The "accesskey" attribute.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.for] The "for" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.val] The string to use for the label's text.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         */
        label: function (args) {
            args = args || {};
            var obj = {
                      tag       : 'label',
                      'for'     : args['for']
                      };
            obj.accesskey = args.accesskey;
            return this.make(obj, args)
                       .text(args.val || '')
                       .close('label');
        },
        /**
         * Generates the HTML for an unpopulated select element with a default "[ Select One ]" option.
         *
         * @name select
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().select({ cl: 'foo', id: 'bar' })
         * @param {Object} [args] The attributes to be added to the &lt;select&gt; string being formed.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.text.SelectOne] The text to use for the "nothing selected" option; default text is stored in MusicBrainz.text.SelectOne.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         */
        select: function (args) {
            args = args || {};
            return this.make({
                             tag   : 'select',
                             type  : 'select-one'
                             }, args)
                       .option({
                               val   : ''
                               })
                       .text('[ ' + (args.textSelectOne ? args.textSelectOne : MusicBrainz.text.SelectOne) + ' ]')
                       .close('option')
                       .close('select');
        },
        /**
         * Generates the HTML for a span element.
         *
         * @name span
         * @methodOf MusicBrainz.html
         * @example MusicBrainz.html().span({ cl: 'foo', id: 'bar' })
         * @param {Object|String} args The attributes to be added to the &lt;span&gt; string being formed; if only a string is passed, a basic span is created, with the string as the HTML to appear within the span.
         * @param {String} [args.alt] The "alt" and "title" attributes.
         * @param {String} [args.cl] The "class" attribute.
         * @param {String} [args.css] The "style" attribute.
         * @param {String} [args.id] The "id" attribute.
         * @param {String} [args.val] The HTML to appear within the span; if omitted, an empty span element is returned.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         */
        span: function (args) {
            args = args || {};
            return this.make(makeTagObj('span'), args)
                       .text(typeof args === 'string' ? args : args.val || '')
                       .close('span');
        },

        /* UTILITY FUNCTIONS */

        /**
         * Appends a string of pre-created HTML to the end of the current HTML string being created.
         *
         * @name MusicBrainz.html.addHTML
         * @example MusicBrainz.html().addHTML('<span>FooBar</span>')
         * @example MusicBrainz.html().span('Foo').addHTML('<span>Bar</span>')
         * @param [newHTML] The string of valid XHTML to be appended to the end of the current HTML string.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         * @see MusicBrainz.html.append
         * @see MusicBrainz.html.end
         * @see MusicBrainz.html.after
         * @see MusicBrainz.html.before
         * @see MusicBrainz.html.insertInto
         * @see MusicBrainz.html.prepend
         * @see MusicBrainz.html.tojQuery
         * @see MusicBrainz.html.use
             */
        addHTML: function (newHTML) {
            this.html = (this.html || '') + (newHTML || '');
            return this;
        },
        /**
         * Similar to MusicBrainz.html().html; ends a chain and returns the html string.<br /><br />
         * <em>Note that this function can only end a MusicBrainz.html() chain.</em><br /><br />
         * Useful for more clearly documenting the end of a MusicBrainz.html() chain, rather than MusicBrainz.html().span('foo').html.
         *
         * @name MusicBrainz.html.end
         * @example MusicBrainz.html().span('foo').end();
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         * @see MusicBrainz.html.addHTML
         * @see MusicBrainz.html.append
         * @see MusicBrainz.html.after
         * @see MusicBrainz.html.before
         * @see MusicBrainz.html.insertInto
         * @see MusicBrainz.html.prepend
         * @see MusicBrainz.html.tojQuery
         * @see MusicBrainz.html.use
             */
        end: function () {
            htmlStr = this.html;
            delete this.html;
            return htmlStr;
        },
        /**
         * Used to insert plaintext within an HTML string without breaking a chain.
         *
         * @name MusicBrainz.html.text
         * @example MusicBrainz.html().text('foo')
         * @param {String} [text] The text to append to the HTML string being formed.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         */
        text: function (text) {
            this.html = (this.html || '') + (text || '');
            return this;
        },
        /**
         * Swap the current html string with the html of the given element.<br />
         * This <em>is</em> subtly different from .replace($element, 1).<br />
         * .swap($element) returns the <em>outerHTML</em>, while .replace($element, 1) returns the <em>innerHTML</em>.<br /><br />
         * <strong>Note: this will break any events bound to the given element!</strong>
         *
         * @name MusicBrainz.html.swap
         * @example MusicBrainz.html().span('foo').swap('#bar')
         * @param {Object} $element The jQuery selected element to be swapped; note that this method only is designed to work for single-element selections.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         * @see MusicBrainz.html.addHTML
         * @see MusicBrainz.html.append
         * @see MusicBrainz.html.end
         * @see MusicBrainz.html.after
         * @see MusicBrainz.html.before
         * @see MusicBrainz.html.insertInto
         * @see MusicBrainz.html.prepend
         * @see MusicBrainz.html.tojQuery
         * @see MusicBrainz.html.use
         */
        swap: function (element) {
            var $element = $(element),
                oldHTML  = $element.outerHTML();
            this.replace($element);
            return oldHTML;
        },
        /**
         * Changes the current context from MusicBrainz.html() to jQuery, passing the current html string generated by MusicBrainz.html().
         *
         * @name MusicBrainz.html.tojQuery
         * @example MusicBrainz.html().span('foo').toJquery().append('body');
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         * @see MusicBrainz.html.addHTML
         * @see MusicBrainz.html.append
         * @see MusicBrainz.html.end
         * @see MusicBrainz.html.after
         * @see MusicBrainz.html.before
         * @see MusicBrainz.html.insertInto
         * @see MusicBrainz.html.prepend
         * @see MusicBrainz.html.use
         */
        tojQuery: function () {
            return $(this.html);
        },
        /**
         * Allows access to element creation methods when the method name to be accessed is stored as a string.<br /><br />
         *
         * @name MusicBrainz.html.use
         * @example MusicBrainz.html().use('div')
         * @param {String} eleName The element creation function to invoke.
         * @param {Object} args The attribute settings to be passed into the element creation method.
         * @see MusicBrainz.html.close
         * @see MusicBrainz.html.make
         * @see MusicBrainz.html.addHTML
         * @see MusicBrainz.html.append
         * @see MusicBrainz.html.end
         * @see MusicBrainz.html.after
         * @see MusicBrainz.html.before
         * @see MusicBrainz.html.insertInto
         * @see MusicBrainz.html.prepend
         * @see MusicBrainz.html.replace
         * @see MusicBrainz.html.swap
         * @see MusicBrainz.html.tojQuery
         */
        use: function (eleName, args) {
            return this[eleName].call(this, args);
        }
    };
    /**
     * Inserts the current html string as the innerHTML of a given element or elements.<br /><br />
     * <em>Note that this does *not* have to end a MusicBrainz.html() chain.</em><br /><br />
     * This performs the same function as the $(element).html(string) jQuery innerHTML setter.  Keep in mind,
     * however, that the arguments here are reversed: MusicBrainz.html().{generate string}.insertInto(element);
     *
     * @name MusicBrainz.html.insertInto
     * @param {Object} $element The jQuery-wrapped object(s) (or jQuery selector) into which to insert the html string, replacing the current html within that/those element(s).
     * @example MusicBrainz.html().span('foo').toJquery().append('body');
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     * @see MusicBrainz.html.addHTML
     * @see MusicBrainz.html.append
     * @see MusicBrainz.html.end
     * @see MusicBrainz.html.after
     * @see MusicBrainz.html.before
     * @see MusicBrainz.html.prepend
     * @see MusicBrainz.html.replace
     * @see MusicBrainz.html.swap
     * @see MusicBrainz.html.tojQuery
     * @see MusicBrainz.html.use
     */
    /**
     * Insert the current HTML string into the DOM .after() the specified element.
     *
     * @methodOf MusicBrainz.html
     * @name after
     * @param {Object} element The jQuery selector to use, as you would for jQuery's .after(selector).
     * @param {Bool} [jQueryScope] The method will return a MusicBrainz.html() scope by default; set this to true to return the target's jQuery scope instead.
     * @example MusicBrainz.html().span('foo').after('#foo');
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     * @see MusicBrainz.html.addHTML
     * @see MusicBrainz.html.append
     * @see MusicBrainz.html.end
     * @see MusicBrainz.html.before
     * @see MusicBrainz.html.insertInto
     * @see MusicBrainz.html.prepend
     * @see MusicBrainz.html.replace
     * @see MusicBrainz.html.swap
     * @see MusicBrainz.html.tojQuery
     * @see MusicBrainz.html.use
     */
    /**
     * Uses the current HTML string to replace the specified element. <br /><br />
     *
     * @methodOf MusicBrainz.html
     * @name replace
     * @param {Object} element The jQuery selector to use, as you would for jQuery's .after(selector).
     * @param {Bool} [jQueryScope] The method will return a MusicBrainz.html() scope by default; set this to true to return the target's jQuery scope instead.
     * @example MusicBrainz.html().span('foo').replace('#foo');
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     * @see MusicBrainz.html.addHTML
     * @see MusicBrainz.html.append
     * @see MusicBrainz.html.end
     * @see MusicBrainz.html.before
     * @see MusicBrainz.html.insertInto
     * @see MusicBrainz.html.prepend
     * @see MusicBrainz.html.replace
     * @see MusicBrainz.html.swap
     * @see MusicBrainz.html.tojQuery
     * @see MusicBrainz.html.use
     */
    /**
     * Switches from a MusicBrainz.html() chain to a jQuery chain, invoking jQuery's .append() with the current HTML string from MusicBrainz.html().<br /><br />
     *
     * @methodOf MusicBrainz.html
     * @name append
     * @param {Object} element The jQuery selector to use, as you would for jQuery's .append(selector).
     * @param {Bool} [jQueryScope] The method will return a MusicBrainz.html() scope by default; set this to true to return the target's jQuery scope instead.
     * @example MusicBrainz.html().span('foo').append('#foo');
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     * @see MusicBrainz.html.addHTML
     * @see MusicBrainz.html.end
     * @see MusicBrainz.html.after
     * @see MusicBrainz.html.before
     * @see MusicBrainz.html.insertInto
     * @see MusicBrainz.html.prepend
     * @see MusicBrainz.html.replace
     * @see MusicBrainz.html.swap
     * @see MusicBrainz.html.tojQuery
     * @see MusicBrainz.html.use
     */
    /**
     * Switches from a MusicBrainz.html() chain to a jQuery chain, invoking jQuery's .before() with the current HTML string from MusicBrainz.html().<br /><br />
     *
     * @methodOf MusicBrainz.html
     * @name before
     * @param {Object} element The jQuery selector to use, as you would for jQuery's .before(selector).
     * @param {Bool} [jQueryScope] The method will return a MusicBrainz.html() scope by default; set this to true to return the target's jQuery scope instead.
     * @example MusicBrainz.html().span('foo').before('#foo');
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     * @see MusicBrainz.html.addHTML
     * @see MusicBrainz.html.append
     * @see MusicBrainz.html.end
     * @see MusicBrainz.html.after
     * @see MusicBrainz.html.insertInto
     * @see MusicBrainz.html.prepend
     * @see MusicBrainz.html.replace
     * @see MusicBrainz.html.swap
     * @see MusicBrainz.html.tojQuery
     * @see MusicBrainz.html.use
     */
    /**
     * Switches from a MusicBrainz.html() chain to a jQuery chain, invoking jQuery's .prepend() with the current HTML string from MusicBrainz.html().<br /><br />
     *
     * @methodOf MusicBrainz.html
     * @name prepend
     * @param {Object} element The jQuery object or selector to use, as you would for jQuery's .prepend(selector).
     * @param {Bool} [jQueryScope] The method will return a MusicBrainz.html() scope by default; set this to true to return the target's jQuery scope instead.
     * @example MusicBrainz.html().span('foo').prepend('#foo');
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     * @see MusicBrainz.html.addHTML
     * @see MusicBrainz.html.append
     * @see MusicBrainz.html.end
     * @see MusicBrainz.html.after
     * @see MusicBrainz.html.before
     * @see MusicBrainz.html.insertInto
     * @see MusicBrainz.html.replace
     * @see MusicBrainz.html.swap
     * @see MusicBrainz.html.tojQuery
     * @see MusicBrainz.html.use
     */
    for (i in jQueryMethods) {
        if (jQueryMethods.hasOwnProperty(i)) {
            Inner_HTML.prototype[i] = genericjQueryMethod(jQueryMethods[i]);
        }
    }
    /* Non-empty HTML elements without need for a dedicated function above. */
    /**
     * Generates the HTML for an abbr element.
     *
     * @methodOf MusicBrainz.html
     * @name abbr
     * @example MusicBrainz.html().abbr({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;abbr&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an address element.
     *
     * @methodOf MusicBrainz.html
     * @name address
     * @example MusicBrainz.html().address({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;address&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a bdo element.
     *
     * @name bdo
     * @methodOf MusicBrainz.html
     * @example MusicBrainz.html().bdo({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;bdo&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a blockquote element.
     *
     * @methodOf MusicBrainz.html
     * @name blockquote
     * @example MusicBrainz.html().blockquote({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;blockquote&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a caption element.
     *
     * @methodOf MusicBrainz.html
     * @name caption
     * @example MusicBrainz.html().caption({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;caption&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a cite element.
     *
     * @methodOf MusicBrainz.html
     * @name cite
     * @example MusicBrainz.html().cite({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;cite&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a code element.
     *
     * @methodOf MusicBrainz.html
     * @name code
     * @example MusicBrainz.html().code({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;code&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a colgroup element.
     *
     * @methodOf MusicBrainz.html
     * @name colgroup
     * @example MusicBrainz.html().colgroup({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;colgroup&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a dd element.
     *
     * @methodOf MusicBrainz.html
     * @name dd
     * @example MusicBrainz.html().dd({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;dd&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a del element.
     *
     * @methodOf MusicBrainz.html
     * @name del
     * @example MusicBrainz.html().del({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;del&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a dfn element.
     *
     * @methodOf MusicBrainz.html
     * @name dfn
     * @example MusicBrainz.html().dfn({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;dfn&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a dl element.
     *
     * @methodOf MusicBrainz.html
     * @name dl
     * @example MusicBrainz.html().dl({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;dl&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a dt element.
     *
     * @methodOf MusicBrainz.html
     * @name dt
     * @example MusicBrainz.html().dt({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;dt&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an em element.
     *
     * @methodOf MusicBrainz.html
     * @name em
     * @example MusicBrainz.html().em({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;em&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a fieldset element.
     *
     * @methodOf MusicBrainz.html
     * @name fieldset
     * @example MusicBrainz.html().fieldset({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;fieldset&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a form element.
     *
     * @methodOf MusicBrainz.html
     * @name form
     * @example MusicBrainz.html().form({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;form&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an iframe element.
     *
     * @methodOf MusicBrainz.html
     * @name iframe
     * @example MusicBrainz.html().iframe({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;iframe&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an ins element.
     *
     * @methodOf MusicBrainz.html
     * @name ins
     * @example MusicBrainz.html().ins({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;ins&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a kbd element.
     *
     * @methodOf MusicBrainz.html
     * @name kbd
     * @example MusicBrainz.html().kbd({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;kbd&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a legend element.
     *
     * @methodOf MusicBrainz.html
     * @name legend
     * @example MusicBrainz.html().legend({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;legend&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a li element.
     *
     * @methodOf MusicBrainz.html
     * @name li
     * @example MusicBrainz.html().li({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;li&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a map element.
     *
     * @methodOf MusicBrainz.html
     * @name map
     * @example MusicBrainz.html().map({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;map&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an object element.
     *
     * @methodOf MusicBrainz.html
     * @name object
     * @example MusicBrainz.html().object({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;object&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an ol element.
     *
     * @methodOf MusicBrainz.html
     * @name ol
     * @example MusicBrainz.html().ol({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;ol&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an optgroup element.
     *
     * @methodOf MusicBrainz.html
     * @name optgroup
     * @example MusicBrainz.html().optgroup({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;optgroup&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an option element.
     *
     * @methodOf MusicBrainz.html
     * @name option
     * @example MusicBrainz.html().option({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;option&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a p element.
     *
     * @methodOf MusicBrainz.html
     * @name p
     * @example MusicBrainz.html().p({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;p&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a pre element.
     *
     * @methodOf MusicBrainz.html
     * @name pre
     * @example MusicBrainz.html().pre({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;pre&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a q element.
     *
     * @methodOf MusicBrainz.html
     * @name q
     * @example MusicBrainz.html().q({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;q&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a samp element.
     *
     * @methodOf MusicBrainz.html
     * @name samp
     * @example MusicBrainz.html().samp({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;samp&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a script element.
     *
     * @methodOf MusicBrainz.html
     * @name script
     * @example MusicBrainz.html().script({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;script&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a style element.
     *
     * @methodOf MusicBrainz.html
     * @name style
     * @example MusicBrainz.html().style({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;style&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a sub element.
     *
     * @methodOf MusicBrainz.html
     * @name sub
     * @example MusicBrainz.html().sub({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;sub&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a sup element.
     *
     * @methodOf MusicBrainz.html
     * @name sup
     * @example MusicBrainz.html().sup({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;sup&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a table element.
     *
     * @methodOf MusicBrainz.html
     * @name table
     * @example MusicBrainz.html().table({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;table&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a tbody element.
     *
     * @methodOf MusicBrainz.html
     * @name tbody
     * @example MusicBrainz.html().tbody({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;tbody&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a td element.
     *
     * @methodOf MusicBrainz.html
     * @name td
     * @example MusicBrainz.html().td({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;td&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a textarea element.
     *
     * @methodOf MusicBrainz.html
     * @name textarea
     * @example MusicBrainz.html().textarea({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;textarea&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a tfoot element.
     *
     * @methodOf MusicBrainz.html
     * @name tfoot
     * @example MusicBrainz.html().tfoot({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;tfoot&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a th element.
     *
     * @methodOf MusicBrainz.html
     * @name th
     * @example MusicBrainz.html().th({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;th&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a thead element.
     *
     * @methodOf MusicBrainz.html
     * @name thead
     * @example MusicBrainz.html().thead({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;thead&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a title element.
     *
     * @methodOf MusicBrainz.html
     * @name title
     * @example MusicBrainz.html().title({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;title&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a tr element.
     *
     * @methodOf MusicBrainz.html
     * @name tr
     * @example MusicBrainz.html().tr({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;tr&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a tt element.
     *
     * @methodOf MusicBrainz.html
     * @name tt
     * @example MusicBrainz.html().tt({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;tt&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an ul element.
     *
     * @methodOf MusicBrainz.html
     * @name ul
     * @example MusicBrainz.html().ul({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;ul&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a b element.
     *
     * @methodOf MusicBrainz.html
     * @name b
     * @example MusicBrainz.html().b({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;b&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for an i element.
     *
     * @methodOf MusicBrainz.html
     * @name i
     * @example MusicBrainz.html().i({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;i&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a menu element.
     *
     * @methodOf MusicBrainz.html
     * @name menu
     * @example MusicBrainz.html().menu({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;menu&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a small element.
     *
     * @methodOf MusicBrainz.html
     * @name small
     * @example MusicBrainz.html().small({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;small&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a strong element.
     *
     * @methodOf MusicBrainz.html
     * @name strong
     * @example MusicBrainz.html().strong({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;strong&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a canvas element.
     *
     * @methodOf MusicBrainz.html
     * @name canvas
     * @example MusicBrainz.html().canvas({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;canvas&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    loops = nonClosed.length - 1;
    do {
        Inner_HTML.prototype[nonClosed[loops]] = genericElement(nonClosed[loops], 0);
    } while (loops--);
    /* Empty HTML elements without need for a dedicated function above. */
    /**
     * Generates the HTML for an area element.<br >
     * <em>Note: The element is created as a closed element.</em>
     *
     * @methodOf MusicBrainz.html
     * @name area
     * @example MusicBrainz.html().area({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;area&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a br element.<br >
     * <em>Note: The element is created as a closed element.</em>
     *
     * @name br
     * @methodOf MusicBrainz.html
     * @example MusicBrainz.html().br({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;br&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a col element.<br >
     * <em>Note: The element is created as a closed element.</em>
     *
     * @name col
     * @methodOf MusicBrainz.html
     * @example MusicBrainz.html().col({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;col&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a hr element.<br >
     * <em>Note: The element is created as a closed element.</em>
     *
     * @name hr
     * @methodOf MusicBrainz.html
     * @example MusicBrainz.html().hr({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;hr&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    /**
     * Generates the HTML for a param element.<br >
     * <em>Note: The element is created as a closed element.</em>
     *
     * @name param
     * @methodOf MusicBrainz.html
     * @example MusicBrainz.html().param({ cl: 'foo', id: 'bar' })
     * @param {Object} [args] The attributes to be added to the &lt;param&gt; string being formed.
     * @param [args.*] Note that the attributes passed to this function are *not* filtered; if an invalid attribute is defined, it will be added the the HTML string.
     * @see MusicBrainz.html.close
     * @see MusicBrainz.html.make
     */
    loops = nonClosed.length - 1;
    do {
        Inner_HTML.prototype[closed[loops]] = genericElement(closed[loops], 1);
    } while (loops--);
    MusicBrainz.html = function () {
        MusicBrainz.html.constructor = Inner_HTML;
        return new Inner_HTML();
    };
}());

/**
 * Changes the current context from jQuery to MusicBrainz.html(), passing the outerHTML contents of the first element in the current jQuery scope as the initial value of MusicBrainz.html().html.<br />
 * Note that the case and order of attributes within the HTML for each element is browser-specific.
 *
 * @example $('body').find('div:first').outerHTMLtoMB().span('div');
 * @param {String} eleName The element creation function to invoke.
 */
jQuery.fn.outerHTMLtoMB = function() {
    return MusicBrainz.html().addHTML($(this).outerHTML());
};
/**
 * Changes the current context from jQuery to MusicBrainz.html(), passing the innerHTML contents of the first element in the current jQuery scope as the initial value of MusicBrainz.html().html.<br />
 * Note that the case and order of attributes within the HTML for each element is browser-specific.
 *
 * @example $('body').find('div:first').innerHTMLtoMB().span('div');
 * @param {String} eleName The element creation function to invoke.
 */
jQuery.fn.innerHTMLtoMB = function() {
    return MusicBrainz.html().addHTML($(this).html());
};
