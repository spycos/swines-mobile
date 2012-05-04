/*
 * readability.message.js
 * Provides simple methods to display a message to the user.
 *
 * @Authors: Chris Dary <chrisd@arc90.com>
*/
var readability = (typeof readability !== "undefined") ? readability : {};

readability.message = {
	
	defaults: {
		messageBoxId: 'rdb-message'
	},
	
	displayTimeout: null,
	
	show: function(message, options) {
		
		clearTimeout(readability.message.displayTimeout);
		readability.message.displayTimeout = null;

		var settings    = $.extend({}, readability.message.defaults, options),
		    messageBox  = $('#' + settings.messageBoxId);

		if (messageBox.length === 0) {
			return false;
		}

		if(typeof settings.css !== 'undefined') {
			messageBox.css(settings.css);
		}

		messageBox.html(message);

        /**
         * Note (@author Daniel):
         * Not sure if this is necessary, but I'm changing this to work with the
         * .visible class as it will improve accessibility. Also done in .hide().
        */
		messageBox.addClass('visible').fadeIn();

		if(typeof settings.hideAfter !== 'undefined') {
			readability.message.displayTimeout = window.setTimeout(readability.message.hide, settings.hideAfter);
		}
	},
	
	hide: function(options) {
		var settings    = $.extend({}, readability.message.defaults, options),
		    messageBox = $('#' + settings.messageBoxId);

		messageBox.removeClass('visible').fadeOut();
	}
	
};