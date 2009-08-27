/*jslint undef: true, browser: true*/
/*global jQuery, $, mb, text */

/** 
 * @projectDescription    This contains all functions to initialize and run the MusicBrainz inline editor. 
 * @author Brian Schweitzer (BrianFreud) brian.brianschweitzer@gmail.com
 */

"use strict";

var
/**
 * HTML element factory, used to build standardized html strings.
 * @namespace
 */
html = {
    css: {
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
    checkDef: function (arg) {
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
    make: function (args) {
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
    basic: function (tag) {
        return html.make({
                         tag: tag,
                         close: false
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
    button: function (args) {
        var checkDef = html.checkDef;
        return html.input({
                          id: checkDef(args.id),
                          cl: checkDef(args.cl),
                          css: checkDef(args.css),
                          ti: '-1',
                          type: 'button',
                          val: checkDef(args.val)
                          });
    },
    /**
     * @description Used to create simple closing elements, such as &lt;/textarea&gt;.
     * @example html.close('textarea')
     * @param {String} tag The element type to close.
     * @augments html.make
     * @see html.basic
     */
    close: function (tag) {
        return html.basic('/' + tag);
    },
    /**
     * @description Used to create dd elements.
     * @example html.dd({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;dd&gt; string being formed.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @augments html.make
     * @see html.close
     */
    dd : function (args) {
        var checkDef = html.checkDef;
        return html.make({
                         tag   : 'dd',
                         cl    : checkDef(args.cl),
                         id    : checkDef(args.id),
                         css   : checkDef(args.css),
                         close : false
                         });
    },
    /**
     * @description Used to create div elements.
     * @example html.div({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;div&gt; string being formed.
     * @param {String} [args.alt] The "alt" and "title" attributes.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @augments html.make
     * @see html.close
     * @see html.divNoDisplay
     */
    div: function (args) {
        var checkDef = html.checkDef;
        return html.make({
                         tag: 'div',
                         alt: checkDef(args.alt),
                         cl: checkDef(args.cl),
                         css: checkDef(args.css),
                         id: checkDef(args.id),
                         title: checkDef(args.alt),
                         close: false
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
    divNoDisplay: function (args) {
        var checkDef = html.checkDef;
        return html.div({
                        cl: checkDef(args.cl),
                        css: html.css.displayNone,
                        id: checkDef(args.id)
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
    fieldset: function (args) {
        var checkDef = html.checkDef;
        return html.make({
                         tag: 'fieldset',
                         cl: checkDef(args.cl),
                         css: checkDef(args.css),
                         id: checkDef(args.id),
                         close: false
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
    input: function (args) {
        var checkDef = html.checkDef;
        return html.make({
                         tag: 'input',
                         cl: checkDef(args.cl),
                         check: checkDef(args.check),
                         css: checkDef(args.css),
                         id: checkDef(args.id),
                         size: checkDef(args.size),
                         ti: checkDef(args.ti),
                         type: typeof(args.type) !== 'undefined' ? args.type : 'text',
                         val: checkDef(args.val),
                         close: true
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
    label: function (args) {
        var checkDef = html.checkDef,
            label = 'label';
        return html.make({
                         tag: label,
                         cl: checkDef(args.cl),
                         css: checkDef(args.css),
                         'for': checkDef(args['for']),
                         id: checkDef(args.id),
                         close: false
                         }) +
               (typeof(args.val) !== 'undefined' ? args.val : '') +
               html.close(label);
    },
    /**
     * @description Used to create unpopulated select elements with a default "[ Select One ]" option.
     * @example html.select({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;select&gt; string being formed.
     * @param {String} [args.cl] The "class" attribute.
     * @param {String} [args.css] The "style" attribute.
     * @param {String} [args.id] The "id" attribute.
     * @alias html.select
     * @augments html.make
     * @see html.close
     */
    select: function (args) {
        var checkDef = html.checkDef,
            close = html.close,
            make = html.make,
            select = 'select',
            option = 'options';
        return make({
                    tag: select,
                    cl: checkDef(args.cl),
                    id: checkDef(args.id),
                    css: checkDef(args.css),
                    close: false
                    }) +
               make({
                    tag: option,
                    val: '',
                    close: false
                    }) +
               '[ ' + text.SelectOne + ' ]' +
               close(option) +
               close(select);
    },
    /**
     * @description Used to create span elements.
     * @example html.span({ cl: 'foo', id: 'bar' })
     * @param {Object} args The attributes to be added to the &lt;span&gt; string being formed.
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
/**
 * Principal namespace object, to keep common variables and functionality globally available without polluting the global namespace.
 * @namespace
 */
MusicBrainz = {
    /**
     * Stores static selectors.
     * @class
     */
    $cache: {
        /** 
         * @description Stores sidebar-specific collections of static selectors.
         */
        $sidebar: {},
        /**
         * Initializes cache data onload, for derived variables.
         **/
        init: ($(function ($) {
            var $sidebar = MusicBrainz.$cache.$sidebar;
            /** Sidebar initiation */
            $sidebar.$DDs = $('#sidebar dd')
            $sidebar.$DateDDs = $sidebar.$DDs.filter('.date');
            $sidebar.$InputDDs = $sidebar.$DDs.filter(':has(input):not(.date)');
            $sidebar.$SelectDDs = $sidebar.$DDs.filter(':has(select)');
        }))
    },
    /**
     * Stores sidebar-specific functionality.
     * @class
     */
    sidebar: {
        /**
         * @description Initializes sidebar functionality.
         **/
        init: ($(function ($) {
            var $sidebar = MusicBrainz.$cache.$sidebar,
                sidebarDD = MusicBrainz.$cache.$sidebar.$DDs.get(0);
            $sidebar.$SelectDDs.find('select').each(function () {
                MusicBrainz.utility.addOverlay($(this));
            });
            $sidebar.$InputDDs.find('input').each(function () {
                MusicBrainz.utility.addOverlay($(this));
            });
            $sidebar.$DateDDs.each(function () {
                MusicBrainz.utility.addOverlay($(this));
            });
            $sidebar.$DDs.hide();
        })),
        /** 
         * @description Stores sidebar-specific event bindings.
         */
        events: {
            toggleOnClick: ($(function ($) {
                $('#sidebar .editable').live('click', function () {
                    $(this).css("display", "none")
                           .prev()
                           .show();
                });
            })),
        }
    },
    /**
     * Stores generic utility functions.
     * @class
     */
    utility: {
        /**
         * @description Creates a text overlay over an element, using the plaintext value of the original element as the text source. 
         * @param {Object} $element The jQuery-wrapped element over which to place an overlay.
         **/
        addOverlay: function ($element) {
            var overlay = html.dd({
                                   cl: 'editable'
                                   }) +
                           html.span({}) +
                           MusicBrainz.utility.getValue($element) +
                           html.close('span') +
                           html.close('dd');
            if ($element.is('input, select')) {
                $element.parent()
                        .after(overlay);
            } else {
                $element.after(overlay);
            }
            return $element;
        },
        /**
         * @description Returns the plaintext value of an element. 
         * @param {Object} $element The jQuery-wrapped element for which to return the plaintext value.
         * @param {String} [dateSeparator] The separator to use when returning date strings.
         **/
        getValue: function ($element, dateSeparator) {
            var input = 'input',
                thisText = '';
            if ($element.is('select')) {
                thisText = $element.selectedTexts()[0];
            } else if ($element.is(input)) {
                if ($element.attr('type') === 'text') {
                    thisText = $element.val();    
                }
            } else if ($element.is('dd')) {
                dateSeparator = (typeof(dateSeparator) === 'undefined') ? '&nbsp;&ndash;&nbsp;' : dateSeparator; 
                thisText = $element.find(input)
                                   .map(function (i) {
                                       return (i === 0) ? $(this).val() : ($(this).val() === '') ? '' : dateSeparator + $(this).val();
                                   })
                                   .get()
                                   .join('');
            }
            return thisText;
        }
    }
};
