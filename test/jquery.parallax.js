/**!
 * @author odahcam
 * @see The boilerplate used here was https://github.com/odahcam/jQueryPlugin-Boilerplate
 * @external https://github.com/odahcam/jquery.parallax/
 */

/**
 * @param {object} $
 * @param {object} window
 * @param {object} document
 * @param {undefined} undefined
 * @return
 */
(function($, window, document, undefined) {

    /*
     * undefined is used here as the undefined global variable in ECMAScript 3 is
     * mutable (ie. it can be changed by someone else). undefined isn't really being
     * passed in so we can ensure the value of it is truly undefined. In ES5, undefined
     * can no longer be modified.
     *
     * window and document are passed through as local variables rather than global
     * as this (slightly) quickens the resolution process and can be more efficiently
     * minified (especially when both are regularly referenced in your plugin).
     *
     */

    'use strict';

    if (!$) {
        console.error('jQuery não encontrado, seu plugin jQuery não irá funcionar.');
        return false;
    }

    /**
     * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     * @see http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
     * @see requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
     * @license MIT license
     */
    (function() {

        var lastTime = 0,
            vendors = ['ms', 'moz', 'webkit', 'o'];

        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    })();

    /*
     * Store the plugin name in a variable. It helps you if later decide to
     * change the plugin's name
     */
    var pluginName = 'parallax',
        defaults = {
            on: "scroll",
            listenTo: window,
            sceneMode: false
        },
        $window = $(window),
        instancesCount = 0;

    /**
     * The plugin constructor
     * @param {DOM Element} element The DOM element where plugin is applied
     * @param {Object} options Options passed to the constructor
     */
    function Plugin(element, options) {

        // stores the plugin name O_O
        this._name = pluginName;

        // stores the plugin name O_O
        this._instance_id = ++instancesCount;

        // Store a reference to the source element
        this.el = element;

        // Store a jQuery reference  to the source element
        this.$el = $(element);

        /*
         * Set the instance options extending the plugin defaults and
         * the options passed by the user, the data-* too.
         *
         *
         * jQuery has an extend method which merges the contents of two or
         * more objects, storing the result in the first object. The first object
         * is generally empty as we don't want to alter the default options for
         * future instances of the plugin.
         *
         * @example
         * var options = {
         *    elem: "#someElementID",
         *    size: {
         *        width: 0,
         *        height: 0
         *    }
         * }
         *
         * $.extend(true, {}, defaults, options);
         *
         * The example above will recursive merge the defaults and options of the plugin.
         *
         */
        this.settings = $.extend(false, {}, defaults, options, this.$el.data());

        this.$triggerOrigin = $(this.settings.listenTo);

        // Initialize the plugin instance
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        /**
         * Initialize the plugin instance.
         * Set any other attribtes, store any other element reference, register
         * listeners, etc
         *
         * When bind listerners remember to name tag it with your plugin's name.
         * Elements can have more than one listener attached to the same event
         * so you need to tag it to unbind the appropriate listener on destroy:
         *
         * @example
         * this.$someSubElement.on('click.' + pluginName, function() {
         *      // Do something
         * });
         *
         *
         * You already have access to the DOM element and the options via the
         * instance.
         *
         * @example this.element; this.settings;
         *
         * You can add more functions like the one below and call them.
         *
         * @example this.yourOtherFunction("jQuery Boilerplate");
         *
         */
        init: function() {
            var self = this;

            this.$triggerOrigin.on(self.settings.on + "." + self._name, function() {

                console.group('Rolagem afetando o elemento#' + self._instance_id + '.');

                if (self.inScreen()) {
                    window.requestAnimationFrame(function() {
                        self.$el.css("transform", "translateY(" + $window.scrollTop() / 2 + "px)");
                    });
                }

                console.groupEnd();

            });

        },
        /**
         * The 'destroy' method is were you free the resources used by your plugin:
         * references, unregister listeners, etc.
         *
         * Remember to unbind for your event:
         *
         * @example
         * this.$someSubElement.off('.' + pluginName);
         *
         * Above example will remove any listener from your plugin for on the given
         * element.
         */
        destroy: function() {

            // Remove any attached data from your plugin
            this.$el.removeData();
            $(this.settings.listenTo).off('.' + pluginName);
        },
        /**
         * Write public methods within the plugin's prototype. They can
         * be called with:
         *
         * @example
         * $('#element').jqueryPlugin('somePublicMethod','Arguments', 'Here', 1001);
         *
         * @param  {[type]} foo [some parameter]
         * @param  {[type]} bar [some other parameter]
         * @return {[type]}
         */
        somePublicMethod: function(foo, bar) {

            // This is a call to a real private method. You need to use 'call' or 'apply'
            privateMethod.call(this);
        },
        /**
         * @author Luiz Filipe Machado Barni (odahcam) <luiz@odahcam.com>
         * @description Function to check if element is partialy or fully visible on window.
         *
         * @param {mixed} strict false return true when partialy in screen | true return true only if fully on screen | an jQuery element tobe analysed
         * @returns {Boolean}
         */
        inScreen: function(strict) {

            var $el;

            if (typeof strict !== 'boolean' && strict !== undefined) {
                $el = $(strict);
                strict = arguments[1] || false;
            } else {
                $el = this.$el;
                strict = strict || false;
            }

            var pageTop = $window.scrollTop(),
                pageBot = pageTop + $window.height(),
                elemTop = $el.offset().top,
                elemBot = elemTop + $el.height();

            if (strict === true) {
                // the entire element is visible on viewport
                return pageTop <= elemTop && pageBot >= elemBot;
            }

            // if (pageTop > elemBot) {
            //     console.info('Borda superior da página está abaixo da borda inferior do elemento#' + this._instance_id + '.');
            // }
            //
            // if (pageBot < elemTop) {
            //     console.info('Borda inferior da página está acima da borda superior do elemento#' + this._instance_id + '.');
            // }

            // strict === false
            return !(pageTop > elemBot || pageBot < elemTop);
        }
    });

    /**
     * This is a real private method. A plugin instance has access to it
     * @return {[type]}
     */
    // var privateMethod = function() {
    //     console.log("privateMethod");
    //     console.log(this);
    // };


    /**
     * @author Luiz Filipe Machado Barni (odahcam) <luiz@odahcam.com>
     *
     * @description
     * This is were we register our plugin withint jQuery plugins.
     * It is a plugin wrapper around the constructor and prevents agains multiple
     * plugin instantiation (soteing a plugin reference within the element's data).
     *
     * @example
     * $('#element').jqueryPlugin({
     *     defaultOption: 'this options overrides a default plugin option',
     *     additionalOption: 'this is a new option'
     * });
     */
    $.fn[pluginName] = function(options) {

        var args = arguments;

        if (options === undefined || typeof options === 'object') {
            /*
             * Creates a new plugin instance, for each selected element, and
             * stores a reference withint the element's data
             */
            return this.each(function() {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            });
        } else if (typeof options === 'string' && options !== 'init') {
            /*
             * Call a public plugin method for each selected element and returns this to not break chainbility.
             */
            return this.each(function() {
                var instance = $.data(this, 'plugin_' + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
            });
        }
    };

})(window.jQuery || false, window, document);
