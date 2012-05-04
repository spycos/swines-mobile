/**
 * Readability.global.js - Actions to run on every page of Readability.
 *
**/

// Browser detection
$.extend(true, $.browser, {
    chrome      : /chrome/.test(navigator.userAgent.toLowerCase()),
    ipad        : /ipad/.test(navigator.userAgent.toLowerCase()),
    iphone      : /iphone/.test(navigator.userAgent.toLowerCase()),
    firefox4    : /firefox\/4/.test(navigator.userAgent.toLowerCase()),
    android     : /android/.test(navigator.userAgent.toLowerCase()),
    webos       : /webos/.test(navigator.userAgent.toLowerCase()),
    real_safari : $.browser.safari && !(/chrome/.test(navigator.userAgent.toLowerCase()))
});

// OS detection
$.extend(true, {
    os : {
        windows : /win/.test(navigator.platform.toLowerCase())
    }
});

$(function() {

	/* Helper methods that add classes that can be useful */
	$('ul li:first-child').addClass('first');
	$('ul li:last-child').addClass('last');


	// Any links, like the bookmarklet itself, that should have their default actions overridden
	$('.rdb-no-link').click(function (e){ e.preventDefault(); });

    if ($.os.windows) {
        $('body').addClass('windows').data('browser', 'windows');
    }
    if ($.browser.firefox4) {
        $('body').addClass('firefox4').data('browser', 'firefox4');
    }
     else if ($.browser.mozilla) {
        $('body').addClass('firefox').data('browser', 'firefox');
    }
     else if ($.browser.chrome) {
        $('body').addClass('chrome').data('browser', 'chrome');
    }
     else if ($.browser.msie) {
        $('body').addClass('msie').data('browser', 'msie');
    }
     else if ($.browser.android) {
        $('body').addClass('android').data('browser', 'android');
    }
     else if ($.browser.iphone) {
        $('body').addClass('iphone ios').data('browser', 'iphone ios');
    }
     else if ($.browser.ipad) {
        $('body').addClass('ipad ios').data('browser', 'ipad ios');
    }
     else if ($.browser.webos) {
        $('body').addClass('webos').data('browser', 'webos');
    }
     else if ($.browser.webkit) {
        $('body').addClass('safari').data('browser', 'safari');
    }
     else {
        $('body').addClass('unknown-browser').data('browser', 'unknown-browser');
    }
    if ($.browser.iphone || $.browser.android) {
        $('#login-link').click(function() {
            window.location = "/login";
        });
    }

	/**
	 * HTML5 Placeholder Deprecation JS.
	 * Automatically support the placeholder attribute in browsers that don't support it.
	**/
	if (!('placeholder' in document.createElement('input'))) {
		var showPlaceholder = function () {
			var $this        = $(this),
				 placeholder = $this.attr('placeholder');

			if ($this.val() === '' && placeholder) {
				$this.val(placeholder).addClass('placeholderActive');
			}
		};

		var hidePlaceholder = function () {
			var $this        = $(this),
				 placeholder = $this.attr('placeholder');

			if (placeholder && $this.val() == placeholder) {
				$this.val('').removeClass('placeholderActive');
			}
		};

		// Look for forms with inputs and/or textareas with a placeholder attribute in them
		$('form').submit(function () {
			// Clear the placeholder values so they don't get submitted
			$('.placeholderActive', this).val('');
		});

		// Clear placeholder values upon page reload
		$(window).unload(function () {
			$('.placeholderActive').val('');
		});

		$(':input').each(showPlaceholder).blur(showPlaceholder).focus(hidePlaceholder);
	}

	if($('body').data('page-cached')) {
		/* Update the CSRF token when the login box is opened */
		$('#login-link').click( function () {
			$.get('/ajax/csrf_token/', function (responseObj) {
				$('#login-form').find('input[name="csrfmiddlewaretoken"]').val(responseObj.token);
			}, 'json');
		});
	}
	
	$('#login-link').click( function () {
		$('#login-form input[name="username"]').focus();
	});

    /**
     * For each modal, activate the close button.
     *
     * If the modal is an announcement (has class announcement), then we want to hide
     *      it 'forever' once they close it once.
     * If the modal is a lightbox (has class lightbox), then a click on the modal itself
     *     should close the window. A click on the .modal-inner should not close.
    **/
    $('div.modal, #new-feature').each(function () {
        var $modal          = $(this),
            announcementKey = 'announcement-status-' + $modal.attr('id'),
            isAnnouncement  = $modal.is('.announcement'),
            isLightbox      = $modal.is('.lightbox'),
            isNewFeature    = $modal.is('#new-feature'),
            hideModal       = function () {
              $modal.hide();
            };

        if (isAnnouncement && $modal.attr('id') === "") {
            throw "Announcement modals must have IDs in order to store their state.";
        }

        if (isAnnouncement && localStorage[announcementKey] !== 'hidden') {
            $modal.show();
        }
        
        $(this).find('a.modal-close, a.dismissmodal, a.close').live('click', function (ev) {
            var linkUrl = $(ev.target).attr('href');
            
            ev.preventDefault();
            
            if (isAnnouncement) {
                localStorage[announcementKey] = 'hidden';
            }
            
            // Dismissing a new feature box needs to send an update to the UserMeta
            // We'll also give it a little animation out instead of just hiding
            if (isNewFeature) {
              
                if (!$('body').hasClass('msie')) {
                    $modal.addClass('animate-out');
                
                    $modal[0].addEventListener('webkitTransitionEnd', hideModal, false);
                    $modal[0].addEventListener('transitionend', hideModal, false);
                } else {
                  hideModal();
                }
                
                readability.setKeyValue({
                    'email_into_notification': false
                });
              
            } else {
                hideModal();
            }            
        });
    });


    if ($('.modal').length > 0) {
        $(document).click(function (e) {
            var $modal = $(e.target).is('.modal') ? $(e.target) : $(e.target).parents('.modal:first'),
                announcementKey;

            /* If we clicked in a modal, and it was a lightbox, and it was a click in modal-inner, ignore it. Otherwise close the modal. */
            if ($modal && $modal.is('.lightbox')) {
                var $modalInner = $(e.target).is('.modal-inner') ? $(e.target) : $(e.target).parents('.modal-inner:first');

                if ($modalInner.length > 0) {
                    return true;
                }
            }

            $('.modal').hide();

            $('.modal.announcement').each(function () {
                announcementKey = 'announcement-status-' + $(this).attr('id');

                if ($(this).is(':hidden')) {
                    localStorage[announcementKey] = 'hidden';
                }
            });
        });
    }

    // If the page has colorbox, set some defaults and init
    // on links that need it.
    if ("colorbox" in window.jQuery.fn) {
        $.extend($.colorbox.settings, {
            transition: 'none',
            opacity: 1,
            speed: 0
        });

        $("a[rel=colorbox]").colorbox({
            rel: 'nofollow'
        });

        // NOTE: From here down isn't really the best place for this

        // Apps page, Add-ons learn more link
        $('a[href=#colorbox-addons]').colorbox({
            inline : true,
            width: '640px'
        });

        // Home for Intro video
        $('a[href=#video-demo]').colorbox({
            html: '<div class="cboxContentWrapper cboxVideoModal"><iframe src="http://player.vimeo.com/video/30450876?title=0&amp;byline=0&amp;portrait=0&amp;autoplay=1&amp;color=ffffff" width="620" height="349" frameborder="0"></iframe></div>'
        });

        // Learn More Kindle video
        $("a[href='#kindle-video-demo']").colorbox({
            html: '<div class="cboxContentWrapper cboxVideoModal"><iframe src="http://player.vimeo.com/video/30451002?title=0&amp;byline=0&amp;portrait=0" width="620" height="349" frameborder="0" webkitAllowFullScreen allowFullScreen></iframe></div>'
        });
    }


	if ($.browser.msie) {
        // IE Form submission bug
        $('input').keydown(function(e){
            if (e.keyCode == 13) {
                $(this).parents('form').submit();
                return false;
            }
        });
    }
});
