/*
 * jQuery UI selectmenu
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 * http://jquery-ui.googlecode.com/svn/branches/labs/selectmenu
 * http://www.filamentgroup.com/lab/jquery_ui_selectmenu_an_aria_accessible_plugin_for_styling_a_html_select/
 * http://wiki.jqueryui.com/Selectmenu
 */

// 2009-08    Brian Schweitzer - Note 1: Commented out; it resets the left position, which we don't want.  By default, the menu
//                               drops open to the right; we're changing the menu's left position after the menu is created, so the menu
//                               can open to the left.  If this line isn't commented out, this left override would be cleared.
//                               Note 2: has been added.  It's a bit of a hack, until this is dealt with in the widget better, but without it, 
//                               each time the selectmenu closes, little bits of the selectmenu's top and bottom borders get viably left behind.
//                               Note 3: The entire icon handling bit has been rewritten.  For a 254 item array, each item with an icon, the plugin was
//                               taking 13,500 ms to create the menu.  With the rewritten icon code, it takes around 1050 ms - a 12,450 ms improvement.
// This plugin has been significantly modified, for greater compatability, much faster functionality, etc.  It should not be upgraded without
// a good deal of care to maintain changes.  (The contact email address for filamentgroup is not working, so patches cannot be sent upstream.)

(function ($) {
// console.log("sm: main")
    jQuery.widget("ui.selectmenu", {
        _init: function () {
// console.log("sm: _init")
            var self = this,
                num,
                tabindex,
                e = this.element,
                o = this.options,
                cornerClass,
                selectOptionData = [],
                activeClass,
                iconCollection,
                iconGroup = [],
                widgetBaseClass = self.widgetBaseClass,
                temp;

            //quick array of button and menu id's
            num = Math.round(Math.random() * 1000);
            this.ids = [e.attr('id') + '_' + 'button' + '_' + num, e.attr('id') + '_' + 'menu' + '_' + num];

            //define safe mouseup for future toggling
            this._safemouseup = true;

            //serialize selectmenu element options	
            e.find('option').each(function () {
                temp = jQuery(this);
                selectOptionData.push({
                    value: temp.attr('value'),
                    text: self.options.format ? self.options.format(temp.text()) : temp.text(),
                    selected: temp.attr('selected'),
                    classes: temp.attr('class'),
                    parentOptGroup: temp.parent('optgroup').attr('label')
                });
            });

            //create menu button wrapper and add menu icon
            this.newelement = jQuery('<a tabindex="' + (e.attr('tabindex') || '0') + '" class="' + ((o.style === 'dropdown') ? widgetBaseClass + "-dropdown " : widgetBaseClass + "-popup ") + this.widgetBaseClass + ' ui-widget ui-state-default ui-corner-all" id="' + this.ids[0] + '" role="button" href="#" aria-haspopup="true" aria-owns="' + this.ids[1] + '" aria-expanded="false"></a>').prepend('<span class="' + widgetBaseClass + '-status">' + selectOptionData[this._selectedIndex()].text + '</span><span class="' + ((o.style === "popup") ? 'ui-icon-triangle-2-n-s ' : 'ui-icon-triangle-1-s ') + this.widgetBaseClass + '-icon ui-icon"></span>').insertAfter(e);

            //save reference to select in data for ease in calling methods
            this.newelement.data('selectelement', e);

            //make associated form label trigger focus
            jQuery('label[for=' + e.attr('id') + ']').attr('for', this.ids[0]).bind('click', function () {
                self.newelement.focus();
                return false;
            });

            //click toggle for menu visibility
            this.newelement.bind('mousedown', function (event) {
                self._toggle(event);
                //make sure a click won't open/close instantly
                if (o.style === "popup") {
                    self._safemouseup = false;
                    setTimeout(function () {
                        self._safemouseup = true;
                    },
                    300);
                }
                return false;
            }).bind('click', function () {
                return false;
            }).keydown(function (event) {
                var ret = true;
                switch (event.keyCode) {
                case jQuery.ui.keyCode.ENTER:
                    ret = true;
                    break;
                case jQuery.ui.keyCode.SPACE:
                    ret = false;
                    self._toggle(event);
                    break;
                case jQuery.ui.keyCode.UP:
                case jQuery.ui.keyCode.LEFT:
                    ret = false;
                    self._moveSelection(-1);
                    break;
                case jQuery.ui.keyCode.DOWN:
                case jQuery.ui.keyCode.RIGHT:
                    ret = false;
                    self._moveSelection(1);
                    break;
                case jQuery.ui.keyCode.TAB:
                    ret = true;
                    break;
                default:
                    ret = false;
                    self._typeAhead(event.keyCode, 'mouseup');
                    break;
                }
                return ret;
            }).bind('mouseover focus', function () {
                jQuery(this).addClass(widgetBaseClass + '-focus ui-state-hover');
            }).bind('mouseout blur', function () {
                jQuery(this).removeClass(widgetBaseClass + '-focus ui-state-hover');
            });

            //document click closes menu
            jQuery(document).mousedown(function (event) {
                self.close(event);
            });

            //change event on original selectmenu
            e.click(function () {
                this._refreshValue();
            }).focus(function () {
                this.newelement.focus();
            });

            //create menu portion
/* */            this.list = jQuery('<ul class="' + ((o.style === 'dropdown') ? widgetBaseClass + "-menu-dropdown " : widgetBaseClass + "-menu-popup ") + widgetBaseClass + '-menu ui-widget ui-widget-content' + ((o.style === "dropdown") ? " ui-corner-bottom" : " ui-corner-all") + '" aria-hidden="true" role="listbox" aria-multiselectable="false" aria-labelledby="' + this.ids[0] + '" id="' + this.ids[1] + '"></ul>');

            //active state class is only used in popup style
            activeClass = (self.options.style === "popup") ? " ui-state-active" : "";

            //write li's
            iconCollection = o.icons || [];
            if (iconCollection.length > 0) {
                jQuery.each(iconCollection, function () {
                    iconGroup[this.find.slice(1)] = this.icon;
                    });
            }
            for (var i in selectOptionData) {
                var classCollection = selectOptionData[i].classes,
                    thisLi,
                    iconString = "",
                    hasIcon = false,
                    parentOptGroup = selectOptionData[i].parentOptGroup;
                if (classCollection !== "undefined") {
                    if(typeof(iconGroup[classCollection]) !== "undefined") {
                        iconString = '<span class="' + widgetBaseClass + '-item-icon ui-icon ' + iconGroup[classCollection] + '">&nbsp;&nbsp;</span>';
                        hasIcon = true;
                    }
                }
                thisLi = jQuery('<li ' + ((hasIcon) ? 'class="' + widgetBaseClass + '-hasIcon"' : "") + '><a href="#" tabindex="-1" class="' + classCollection + '" role="option" aria-selected="false">&nbsp;' + iconString + selectOptionData[i].text + '</a></li>').data('index', i).data('optionClasses', classCollection).mouseup(function (event) {
                    if (self._safemouseup) {
                        var changed,
                            temp = jQuery(this);
                        changed = temp.data('index') !== self._selectedIndex();
                        self.value(temp.data('index'));
                        self.select(event);
                        if (changed) {
                            self.change(event);
                        }
                        self.close(event, true);
                    }
                    return false;
                }).click(function () {
                    return false;
                }).bind('mouseover focus', function () {
                    self._selectedOptionLi().addClass(activeClass);
                    self._focusedOptionLi().removeClass(widgetBaseClass + '-item-focus ui-state-hover');
                    jQuery(this).removeClass('ui-state-active').addClass(widgetBaseClass + '-item-focus ui-state-hover');
                }).bind('mouseout blur', function () {
                    if (jQuery(this).is(self._selectedOptionLi())) {
                        jQuery(this).addClass(activeClass);
                    }
                    jQuery(this).removeClass(widgetBaseClass + '-item-focus ui-state-hover');
                });

                if (hasIcon) {
                    thisLi.data('optionClasses', classCollection + ' ' + widgetBaseClass + '-hasIcon');
                }

                //optgroup or not...
                if (parentOptGroup) {
                    var optGroupName = widgetBaseClass + '-group-' + parentOptGroup;
                    if (this.list.find('li.' + optGroupName).size()) {
/* */                        this.list.find('li.' + optGroupName + ':last ul').append(thisLi);
                    }
                    else {
/* */                        jQuery('<li class="' + widgetBaseClass + '-group ' + optGroupName + '"><span class="' + widgetBaseClass + '-group-label">' + parentOptGroup + '</span><ul></ul></li>').appendTo(this.list).find('ul').append(thisLi);
                    }
                }
                else {
/* */                    thisLi.appendTo(this.list);
                }

                //this allows for using the scrollbar in an overflowed list
                this.list.bind('mousedown mouseup', function () {
                    return false;
                });
            }

            //transfer classes to selectmenu and list
            if (o.transferClasses) {
                var transferClasses = e.attr('class') || '';
                this.newelement.add(this.list).addClass(transferClasses);
            }

            //original selectmenu width
            var selectWidth = e.width();

            //set menu button width
            this.newelement.width((o.width) ? o.width : selectWidth);

            //set menu width to either menuWidth option value, width option value, or select width 
            if (o.style === 'dropdown') {
                this.list.width((o.menuWidth) ? o.menuWidth : ((o.width) ? o.width : selectWidth));
            }
            else {
                this.list.width((o.menuWidth) ? o.menuWidth : ((o.width) ? o.width - o.handleWidth : selectWidth - o.handleWidth));
            }

            //set max height from option 
            if (o.maxHeight) {
                this.list.css("max-height",o.maxHeight);
            }

            //save reference to actionable li's (not group label li's)
            this._optionLis = this.list.find('li:not(.' + widgetBaseClass + '-group)');

            //transfer menu click to menu button
            this.list.keydown(function (event) {
                var ret = true;
                switch (event.keyCode) {
                case jQuery.ui.keyCode.UP:
                case jQuery.ui.keyCode.LEFT:
                    ret = false;
                    self._moveFocus(-1);
                    break;
                case jQuery.ui.keyCode.DOWN:
                case jQuery.ui.keyCode.RIGHT:
                    ret = false;
                    self._moveFocus(1);
                    break;
                case jQuery.ui.keyCode.HOME:
                    ret = false;
                    self._moveFocus(':first');
                    break;
                case jQuery.ui.keyCode.PAGE_UP:
                    ret = false;
                    self._scrollPage('up');
                    break;
                case jQuery.ui.keyCode.PAGE_DOWN:
                    ret = false;
                    self._scrollPage('down');
                    break;
                case jQuery.ui.keyCode.END:
                    ret = false;
                    self._moveFocus(':last');
                    break;
                case jQuery.ui.keyCode.ENTER:
                case jQuery.ui.keyCode.SPACE:
                    ret = false;
                    self.close(event, true);
                    jQuery(event.target).parents('li:eq(0)').trigger('mouseup');
                    break;
                case jQuery.ui.keyCode.TAB:
                    ret = true;
                    self.close(event);
                    break;
                case jQuery.ui.keyCode.ESCAPE:
                    ret = false;
                    self.close(event, true);
                    break;
                default:
                    ret = false;
                    self._typeAhead(event.keyCode, 'focus');
                    break;
                }
                return ret;
            });

            //hide original selectmenu element
            e.hide();

            //transfer disabled state
            if (e.attr('disabled') === true) {
                this.disable();
            }

            //update value
            this.value(this._selectedIndex());

            // Add the new selectmenu to the body.
            this.list.appendTo('body');

            // Return the select, for any further post-creation modifications that may be desired.
            return this.ids[1];
        },
        destroy: function () {
// console.log("sm: destroy")
            var e = this.element;
            e.removeData(this.widgetName).removeClass(this.widgetBaseClass + '-disabled' + ' ' + this.namespace + '-state-disabled').removeAttr('aria-disabled');

            //unbind click on label, reset its for attr
            jQuery('label[for=' + this.newelement.attr('id') + ']').attr('for', e.attr('id')).unbind('click');
            this.newelement.css("display","none").remove();
            this.list.css("display","none").remove();
            e.show();
        },
        _typeAhead: function (code, eventType) {
// console.log("sm: _typeAhead")
            var self = this;
            //define self._prevChar if needed
            if (!self._prevChar) {
                self._prevChar = ['', 0];
            }
            var C = String.fromCharCode(code),
                focusFound = false,
                focusOpt = function (elem, ind) {
                    focusFound = true;
                    jQuery(elem).trigger(eventType);
                    self._prevChar[1] = ind;
                };
            c = C.toLowerCase();
            this.list.find('li a').each(function (i) {
                if (!focusFound) {
                    var thisText = jQuery(this).text();
                    if (thisText.indexOf(C) === 0 || thisText.indexOf(c) === 0) {
                        if (self._prevChar[0] == C) {
                            if (self._prevChar[1] < i) {
                                focusOpt(this, i);
                            }
                        }
                        else {
                            focusOpt(this, i);
                        }
                    }
                }
            });
            this._prevChar[0] = C;
        },
        _uiHash: function () {
// console.log("sm: _uiHash")
            return {
                value: this.value()
            };
        },
        open: function (event) {
// console.log("sm: open")
            var self = this;
            this._refreshPosition();
            this._closeOthers(event);
            this.newelement.attr('aria-expanded', true).addClass('ui-state-active');

/* */            this.list.appendTo('body').addClass(widgetBaseClass + '-open').attr('aria-hidden', false).find('li:not(.' + widgetBaseClass + '-group):eq(' + this._selectedIndex() + ') a').focus();
            if (this.options.style == "dropdown") {
                this.newelement.removeClass('ui-corner-all').addClass('ui-corner-top');
            }
            this._refreshPosition();
            this._trigger("open", event, this._uiHash());
            jQuery(".ui-selectmenu-menu").show();  /* Brian Schweitzer 2009-08-14: See note 1 up top. */
        },
        close: function (event, retainFocus) {
// console.log("sm: close")
            if (this.newelement.is('.ui-state-active')) {
                this.newelement.attr('aria-expanded', false).removeClass('ui-state-active');
                this.list.attr('aria-hidden', true).removeClass(this.widgetBaseClass + '-open');
                if (this.options.style == "dropdown") {
                    this.newelement.removeClass('ui-corner-top').addClass('ui-corner-all');
                }
                if (retainFocus) {
                    this.newelement.focus();
                }
                this._trigger("close", event, this._uiHash());
                jQuery(".ui-selectmenu-menu").css("display","none");  /* Brian Schweitzer 2009-08-14: See note 1 up top. */
            }
        },
        change: function (event) {
// console.log("sm: change")
            this.element.trigger('change');
            this._trigger("change", event, this._uiHash());
        },
        select: function (event) {
// console.log("sm: select")
            this._trigger("select", event, this._uiHash());
        },
        _closeOthers: function (event) {
// console.log("sm: closeOthers")
            jQuery('.' + this.widgetBaseClass + '.ui-state-active').not(this.newelement).each(function () {
                jQuery(this).data('selectelement').selectmenu('close', event);
            });
            jQuery('.' + this.widgetBaseClass + '.ui-state-hover').trigger('mouseout');
        },
        _toggle: function (event, retainFocus) {
// console.log("sm: _toggle")
            if (this.list.is('.' + this.widgetBaseClass + '-open')) {
                this.close(event, retainFocus);
            }
            else {
                this.open(event);
            }
        },
        _selectedIndex: function () {
// console.log("sm: _selectedIndex")
            return this.element[0].selectedIndex;
        },
        _selectedOptionLi: function () {
// console.log("sm: _selectedOptionLi")
            return this._optionLis.eq(this._selectedIndex());
        },
        _focusedOptionLi: function () {
// console.log("sm: _focusedOptionLi")
            return this.list.find('.' + this.widgetBaseClass + '-item-focus');
        },
        _moveSelection: function (amt) {
// console.log("sm: _moveSelection")
            var currIndex = parseInt(this._selectedOptionLi().data('index'), 10);
            var newIndex = currIndex + amt;
            return this._optionLis.eq(newIndex).trigger('mouseup');
        },
        _moveFocus: function (amt) {
// console.log("sm: _moveFocus")
            var newIndex; 
            if (!isNaN(amt)) {
                var currIndex = parseInt(this._focusedOptionLi().data('index'), 10);
                newIndex = currIndex + amt;
            }
            else {
                newIndex = parseInt(this._optionLis.filter(amt).data('index'), 10);
            }

            if (newIndex < 0) {
                newIndex = 0;
            }
            if (newIndex > this._optionLis.size() - 1) {
                newIndex = this._optionLis.size() - 1;
            }
            this._focusedOptionLi().find('a:eq(0)').blur();
            this._optionLis.eq(newIndex).find('a:eq(0)').focus();
        },
        _scrollPage: function (direction) {
// console.log("sm: _scrollPage")
            var numPerPage = Math.floor(this.list.outerHeight() / this.list.find('li:first').outerHeight());
            numPerPage = (direction == 'up') ? -numPerPage : numPerPage;
            this._moveFocus(numPerPage);
        },
        _setData: function (key, value) {
// console.log("sm: _setData")
            this.options[key] = value;
            if (key == 'disabled') {
                this.element.add(this.newelement).add(this.list)[value ? 'addClass' : 'removeClass'](
                this.widgetBaseClass + '-disabled' + ' ' + this.namespace + '-state-disabled').attr("aria-disabled", value);
            }
        },
        value: function (newValue) {
// console.log("sm: value")
            if (arguments.length) {
                this.element[0].selectedIndex = newValue;
                this._refreshValue();
                this._refreshPosition();
            }
            return this.element[0].selectedIndex;
        },
        _refreshValue: function () {
// console.log("sm: _refreshValue")
            var activeClass = (this.options.style == "popup") ? " ui-state-active" : "";
            //deselect previous
            this.list.find('.' + this.widgetBaseClass + '-item-selected').removeClass(this.widgetBaseClass + "-item-selected" + activeClass).find('a').attr('aria-selected', 'false');
            //select new
            this._selectedOptionLi().addClass(this.widgetBaseClass + "-item-selected" + activeClass).find('a').attr('aria-selected', 'true');
            //toggle any class brought in from option
            var currentOptionClasses = this.newelement.data('optionClasses') ? this.newelement.data('optionClasses') : "";
            var newOptionClasses = this._selectedOptionLi().data('optionClasses') ? this._selectedOptionLi().data('optionClasses') : "";
            this.newelement.removeClass(currentOptionClasses).data('optionClasses', newOptionClasses).addClass(newOptionClasses).find('.' + this.widgetBaseClass + '-status').html(
            this._selectedOptionLi().find('a:eq(0)').html());
        },
        _refreshPosition: function () {
// console.log("sm: _refreshPosition")
            //set left value
            if (this.options.openLeft) {
                this.list.addClass("leftOpenMenu");
            } else {
                this.list.css('left', this.newelement.offset().left); /* Brian Schweitzer 2009-08-14: See note 1 up top. */
            }

            //set top value
            var menuTop = this.newelement.offset().top;
            var scrolledAmt = this.list[0].scrollTop;
            this.list.find('li:lt(' + this._selectedIndex() + ')').each(function () {
                scrolledAmt -= jQuery(this).outerHeight();
            });

            if (this.newelement.is('.' + this.widgetBaseClass + '-popup')) {
                menuTop += scrolledAmt;
                this.list.css('top', menuTop);
            }
            else {
                menuTop += this.newelement.height();
                this.list.css('top', menuTop);
            }
        }
    });

    jQuery.extend(jQuery.ui.selectmenu, {
        getter: "value",
        version: "@VERSION",
        eventPrefix: "selectmenu",
        defaults: {
            transferClasses: true,
            style: 'popup',
            width: null,
            menuWidth: null,
            handleWidth: 26,
            maxHeight: null,
            icons: null,
            format: null,
            openLeft: false
        }
    });

})(jQuery);
