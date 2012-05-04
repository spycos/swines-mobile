/*
 * Readability.Core.Js
 *
 * @Authors: Daniel Lacy, Philip Forget, Chris Dary
*/

// Create the readability namespace.
var readability = (typeof readability !== "undefined") ? readability : {};

$.extend(true, readability, {
	// TODO: This should really be handled by the templates
	APPEARANCE_URL: "/account/ajax/appearance/",

	dbg: function(s) {
		if(typeof console !== 'undefined') {
			console.log(s);
		}
	},

	online: function () {
		return window.navigator.onLine;
	},

	/* Shortcut method for readability.offline.invalidateCache() */
	invalidateCache: function() {
		return;
	},
	
    /*
     * toggleBooleanField
     *
     * Allows a user to set an article's boolean fields
     *
     * @param {object} options : Used to pass the url to POST to and the callback function
    */
	toggleBooleanField: function(options){

        // Handle limited server error
        function _error_handler(XMLHttpRequest, textStatus, errorThrown){
            options.callback({
                success: false,
                article_id: options.article_id,
                request: XMLHttpRequest,
                status: textStatus,
                error: errorThrown
            });
        }

        // Handle server response, which could include an error!
        function _response_handler(data, textStatus, XMLHttpRequest){
			if(data){
				options.callback({
					success: data.success,
					article_id: options.article_id,
					value: data.value
				});
			}
			else {
				options.callback({
					success: false,
					article_id: options.article_id
				});
			}
        }

        $.ajax({
            type: "POST",
			url: options.url,
            dataType: "json",
            error: _error_handler,
			success: _response_handler
        });
	},

	/*
	 * setAppearanceValue
	 *
	 * Allows a user to set an appearance property to a specific value
	 *
	 * @param {string} model - The high level model to which the property belongs for determining the url
	 * @param {string} property - The name of the property to modify
	 * @param {string} value - The value the propety will be set to
	 * @param {object} callback
	*/
	setAppearanceValue: function(model, property, value, callback){
		
		function _error_handler(property, textStatus, errorThrown){
            callback({
                success: false,
                request: XMLHttpRequest,
                status: textStatus,
                error: errorThrown
            });
		};

        // Handle server response
        function _success_handler(data, textStatus){
			if(data){
				callback({
					success: data.success,
					property: data.property,
					value: data.value,
					previous_value: data.previous_value
				});
			}
			else {
				callback({
					success: false
				});
			}
        }

		$.ajax({
			type: 'POST',
			url: readability.APPEARANCE_URL,
			data: {
				property: property,
				value: value
			},
			dataType: 'json',
            error: _error_handler,
            success: _success_handler
		});
	},

	/*
	 * BodyClass
	 *
	 * Allows us to fire callbacks based on body class modifications
	 * which gives us much greater control of what we end up doing
	 * with those signals.
	 *
	 * Usage:
	 *
	 * appearance_style_listener = readability.BodyClass.AddListener("appearance_*", function(event){
	 *		if( event.type == "Added" ){
	 *			// Do something when classes of appearance_* are added
	 *		}
	 *		else if( event.type == "Removed" ){
	 *			// Do something when they are removed
	 *		}
	 * })
	 *
	 * readability.BodyClass.addRemove("some_style","some_other_style");
	 *
	 * appearance_style_listener.remove()
	 * or
	 * readability.BodyClass.removeListener(appearance_style_listener);
	 *
	 */

	BodyClass: {
		$body: $('body'),
		listeners: {},
		ADDED: "added",
		REMOVED: "removed",

		addRemove: function(class_added, class_removed){

			var event = {
				class_added: class_added,
				class_removed: class_removed
			};

			if( class_added && ! this.$body.hasClass(class_added) ){
				this.$body.addClass(class_added);	
				event.type = this.ADDED;
				fire_listeners(class_added, event);
			}
			if( class_removed && this.$body.hasClass(class_removed) ){
				this.$body.removeClass(class_removed);
				event.type = this.REMOVED;
				fire_listeners(class_removed, event);
			}

			function fire_listeners(class_name, event){
				for( var key in readability.BodyClass.listeners ){
					if( readability.BodyClass.listeners.hasOwnProperty(key) ){

						var listener = readability.BodyClass.listeners[key];
							regex = new RegExp(listener.body_class);

						if( regex.test(class_name) ){
							listener.callback(event);
						}
					}
				}
			}

		},
		/*
		 * getClassByRegex returns the classname of a body class matching the regex or undefined
		 */
		getClassByRegex: function(regex){
			if(regex instanceof Object){
				var body_classes = this.$body.attr("class").split(" ");
				for(i=0; i<body_classes.length; i++){
					var body_class = body_classes[i];
					if(regex.test(body_class)){
						return body_class;
					}
				}
			}
			return undefined;
		},

		add: function(class_added){
			this.addRemove(class_added);
		},

		toggle: function(class_toggle){
			if( this.$body.hasClass(class_toggle) ){
				this.addRemove(undefined,class_toggle);
			}
			else {
				this.addRemove(class_toggle);
			}
		},

		remove: function(class_removed){
			this.addRemove(undefined, class_removed);
		},

		addListener: function(body_class, callback){
			var listener = {
				body_class: body_class,
				callback: callback,
				id: readability.guid()
			};

			this.listeners[listener.id] = listener;

			return {
				remove: function(){
					delete readability.BodyClass.listeners[listener.id];
				},
				listener: listener
			};
		},

		removeListener: function(listener_var){
			delete readability.BodyClass.listeners[listener_var.listener.id];
		}
	},

	guid: function(){
		function S4() {
		   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		}
	   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	},

	// TODO figure out how to gracefully handle a maxed out localStorage
	local_storage_maxed: false,
	
	has_local_storage: function(){
		try {
			return 'localStorage' in window && window['localStorage'] !== null && readability.local_storage_maxed !== true;
		}
		catch(e){
			return false;
		}
	},
	
	local_storage_get: function (prop) {
		if(readability.has_local_storage()) {
			return localStorage.getItem(prop);
		}
		
		return null;
	},
	
	local_storage_set: function (prop, value) {
		if(readability.has_local_storage()) {
			try {
				localStorage[prop] = value;
			} catch(e) {
				readability.local_storage_maxed = true;
			}
		}
	},
	
	local_storage_delete: function (prop) {
		if(readability.has_local_storage()) {
			delete localStorage[prop];
		}
		
		return null;
	}

});

readability.checkAddonInstalled = function(callback, options){
    var options = options || {},
        timeout = options.timeout || 100,
        max_tries = options.max_tries || 10,
        try_number = 0; 

    function check_for_global(){
        try_number++;
        if(window.readabilityAddonInstalled){
            callback(window.readabilityAddonInstalled);
        }
        else if(try_number < max_tries){
            setTimeout(check_for_global, timeout);
        }
        else{
            callback(false);
        }
    }

    check_for_global();
};

// Users have a number of key:value settings that we can use to
// customize their experience. Use this to set each key.
// @param setting {obj}, key:value pair to set. Can only be one.
readability.setKeyValue = function (setting) {
    $.ajax({
        url: '/account/ajax/setkv',
        type: 'POST',
        data: JSON.stringify(setting)
    });
};

// Our custom tooltip
// @param OBJECT options:
// - el: A jQuery element that the tip should be positioned above
// - content: The text or html content that will populate the tip
// - className: A classname that will be added to the main container
readability.tooltip = function (options) {
    var that = this;

    this.init = function () {
        $('.tooltip').remove();

        this.$el = $('<div/>', {
            'class': 'tooltip hidden',
            'html': $('<div/>', {
                'class': 'tooltip-content',
                'html': options.content
            })
        });

        $('body').prepend(this.$el);
        this.setPosition();

        $('body').bind('click.tooltip', function (e) {
            that.close();
        });
    };

    this.setPosition = function () {
        var elPos = options.el.position(),
            x     = elPos.left - (this.$el.width() / 2),
            y     = (elPos.top - options.el.height() / 2) - this.$el.height(),
            elYPadding = this.$el.outerHeight() - this.$el.height(),
            scrollTop = $('body').scrollTop();
        
        // We need to make sure the tooltip doesn't show up outside
        // the viewport
        if (y < scrollTop) {
            y = scrollTop + elYPadding;
        }

        // This is a bit odd. I'm using margin-top in the CSS so we
        // can have the little animation up when the tooltip is shown
        // That is messing with the final position though.
        y += parseInt(this.$el.css('margin-top'), 10);

        this.$el.offset({left: x, top: y});

        // We want to make sure the tooltip is in position before
        // we show it, this does that.
        setTimeout(function () {
            that.$el.removeClass('hidden');
        }, 120);
    };

    this.close = function () {
        this.$el.fadeOut(120, function () {
            $(this).remove();
        });
        
        $('body').unbind('click.tooltip');
    };

    this.init();

    return this;
};