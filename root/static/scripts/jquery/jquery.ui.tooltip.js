/*
 * jQuery UI Tooltip @VERSION
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Tooltip
 *
 * Depends:
 *	ui.core.js
 */
(function($) {

$.widget("ui.tooltip", {

	_init: function() {
		var self = this;
		this.tooltip = $("<div/>").addClass(this._classes()).text(this._content()).appendTo(document.body).hide();
		this.element
			.bind("mouseenter", function() { self._show(); })
			.bind("mouseleave", function() { self._hide(); });
			
		this._arrow();
	},
	
	_arrow: function() {
		var arrow = $("<div/>").addClass("ui-tooltip-pointer ui-widget-content").appendTo(this.tooltip);
		$("<div/>").addClass("ui-tooltip-pointer-inner").css("border-right-color", "rgb(255, 255, 255)").appendTo(arrow);
	},
	
	_classes: function() {
		return "ui-tooltip ui-widget ui-widget-content ui-corner-all ui-tooltip-arrow-" + this._direction();
	},
	
	_content: function() {
		return this.options.content.call(this.element[0]);
	},
	
	_direction: function() {
		return "lt";
	},
	
	_show: function() {
		this.tooltip.positionTo({
			my: "left top",
			at: "right center",
			of: this.element,
			offset: "15 -12"
		}).fadeIn();
	},
	
	_hide: function() {
		this.tooltip.fadeOut();
	}

});


$.extend($.ui.tooltip, {
	version: "@VERSION",
	defaults: {
		content: function() {
			return this.title;
		}
	}
});

})(jQuery);

