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
        jQuery.fn.jquery = '1.3.2 + Changeset 6253';
    }
} (jQuery));
