/*jslint undef: true, browser: true*/
/*global $*/

/*
 * jQuery plugin: floating div creator, with optional shadows and rounded corners
 * Corner rounding requires: http://jquery.malsup.com/corner/
 * Shadows requires: http://eyebulb.com/dropshadow/
 *
 * version 1.0: 2009-09-06
 * by Brian Schweitzer (BrianFreud)
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

// .makeFloatingDiv({
//                  background  : "#FFF",                          <-- the background color.  Do not define this using the css arguments. Default: #fff
//                  borderColor : "#000",                          <-- the border color.  Do not define this using the css arguments. Default: #000
//                  css         : { color  : "red" },              <-- any css customization. Defaults: see settings var below.
//                  id          : "foo",                           <-- id to be given to the generated div. Default: "floatdiv"
//                  classes     : { 1: "bar", 2: "baz" },          <-- classes to be given to the generated div. Default: none
//                  position    : "bl",                            <-- align to which corner of the parent element: bl, tl, br, tr.  Default: bl
//                  round       : true                             <-- add shadowing visual effects. Default: true
//                  shadow      : true                             <-- add round corner visual effects. Default: true
//                  });

$.fn.makeFloatingDiv = function (options) {
    $("#floatdiv").remove();
    var thisZIndex = $(this).css("z-index"),
        floatBox = $("<div></div>"),
        floatBoxInner = $("<div></div>"),
        settings = {
                   backgroundColor  : "#000",
                   border           : "none",
                   color            : "#000",
                   height           : "10em",
                   position         : "absolute",
                   width            : "20em",
                   zIndex           : (thisZIndex < 10 || thisZIndex == "auto") ? 10 : (parseInt(thisZIndex, 10) + 1)
    },
        shadowMe = function (element, round) {
            /* If it's the first time this has been run, curve the corners and create the drop shadow divs. */
            if (typeof(element.shadowId()) == "undefined") {
                element.dropShadow();
                if (round !== false) {
                    $("#" + element.shadowId() + " div").corner("round 6px")
                                                        .dropShadow();
                }
            /* Otherwise, leave the corners alone, and just recalculate the positions for the drop shadow div. */
            } else {
                element.redrawShadow();
                $("#" + element.shadowId() + " div").redrawShadow();
            }
        };
    if (typeof(options.classes) != "undefined") {
        $.each(options.classes, function () {
            floatBox.addClass(this);
        });
    }
    if (typeof(options.id) == "undefined") {
        options.id = "floatdiv";
    }
    if (typeof(options.position) == "undefined") {
        options.position = "bl";
    }
    floatBox.attr("id", options.id);
    if (typeof(options.borderColor) != "undefined") {
            settings.backgroundColor = options.borderColor;
    }
    switch (options.position) {
        case "bl":
            $.extend(settings, {
                               left : $(this).position().left,
                               top  : $(this).position().top + $(this).outerHeight() - 1
                               });
            break;
        case "tl":
            $.extend(settings, {
                               left : $(this).position().left,
                               top  : $(this).position().top
                               });
            break;
        case "br":
            $.extend(settings, {
                               left : $(this).position().left  + $(this).outerWidth(),
                               top  : $(this).position().top + $(this).outerHeight() - 1
                               });
            break;
        case "tr":
            $.extend(settings, {
                               left : $(this).position().left  + $(this).outerWidth(),
                               top  : $(this).position().top
                               });
            break;
    }
    if (typeof(options.css) != "undefined") {
        $.extend(settings, options.css);
    }
    floatBox.css(settings);
    /* This next bit of magic overloads the $.css() function, so that whenever the css is changed for the
     * floating div created by this function, we change the css, but then also run the function to recalculate
     * the drop shadow, ensuring that the shadow always is in the right place, with the right size. */
    if (options.roundShadow) {
        floatBox.extend({
            css: function(elem, name) {
                                      var returnVal = $(this).css(elem, name);
                                      shadowMe(floatBox);
                                      return returnVal;
                                      }
        });
    }
    $(this).after(floatBox);
    floatBoxInner.css({
                      backgroundColor : (typeof(options.background) == "undefined") ? "#fff" : options.background,
                      height          : parseInt(floatBox.height(), 10) - 2,
                      margin          : "1px",
                      width           : parseInt(floatBox.width(), 10) - 2
                      });
    floatBox.append(floatBoxInner);
    if (options.round !== false) {
        floatBox.corner("round 6px");
        floatBoxInner.corner("round 6px");
    }
    if (options.shadow !== false) {
        shadowMe(floatBox, options.round);
    }
    return floatBox;
};

