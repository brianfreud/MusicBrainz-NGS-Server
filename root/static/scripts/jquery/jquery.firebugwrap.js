/*jslint undef: true, browser: true*/
/*global $*/

/*
 * jQuery plugin: Basic wrappers to use FireBug controls without breaking jQuery chains.
 *
 * version 1.0: 2009-09-11
 * by Brian Schweitzer (BrianFreud)
 */

$.extend(jQuery.fn, {
    count: function (msg) {
        console ? console.count(this) : "";
        return this;
    },
    dir: function (msg) {
        console ? console.dir(this) : "";
        return this;
    },
    log: function (msg) {
        console ? console.log("%s: %o", msg, this) : "";
        return this;
    },
    profile: function (msg) {
        console ? console.profile(this) : "";
        return this;
    },
    time: function (argA, argB) {
        if (console) {
            if (argB === true || argB === false) {
                console ? (argB ? console.timeEnd(argA) : console.time(argA)) : "";
            } else {
                console.timeEnd(argA).time(argB);
            }
        }
        return this;
    },
    trace: function (msg) {
        console ? console.trace(this) : "";
        return this;
    }
});

