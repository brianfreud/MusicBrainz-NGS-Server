// Backport remove and empty from 1.3.3; see http://ejohn.org/blog/function-call-profiling/
$(function ($) {
    if (jQuery.fn.jquery === '1.3.2') {
        jQuery.remove = function (selector) {
            var cleanData = function (elems) {
                for (var i = 0, l = elems.length; i < l; i++) {
                    var id = elems[i][expando];
                    if (id) {
                        delete jQuery.cache[id];
                    }
                }
            };
            if (!selector || jQuery.multiFilter(selector, [this]).length) {
                if (this.nodeType === 1) {
                    cleanData(this.getElementsByTagName("*"));
                    cleanData([this]);
                }
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            }
        };
        jQuery.empty = function () {
            if (this.nodeType === 1) {
                var elems = this.getElementsByTagName("*");
                for (var i = 0, l = elems.length; i < l; i++) {
                    var id = elems[i][expando];
                    if (id) {
                        delete jQuery.cache[id];
                    }
                }
            } // Remove any remaining nodes
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
        };
    }
} (jQuery));

// Fix for http://dev.jquery.com/ticket/5209
jQuery.extend({
	// Handle when the DOM is ready
	ready: function() {
		// Make sure that the DOM is not already loaded
		if ( !jQuery.isReady ) {
			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If there are functions bound, to execute
			if ( jQuery.readyList ) {
				// Execute all of them
                                var readyList = jQuery.readyList;
				while( readyList.length) {
					readyList[0].call( document, jQuery );
					readyList.splice(0,1);
				};
			}

			// Trigger any bound ready events
			jQuery(document).triggerHandler("ready");
		}
	}
});
