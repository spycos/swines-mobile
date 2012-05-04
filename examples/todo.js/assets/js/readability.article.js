/**
 * Rich article functionality - used both for embedded article and for native article.
 *
 * @author Chris Dary <chrisd@arc90.com>, Philip Forget <philipf@arc90.com>, Daniel Lacy <daniell@arc90.com>
**/
var readability = typeof readability === "undefined" ? {} : readability;
readability.article = readability.article || {};

/**
 * Prepare article links for usage as Footnotes.
*/
readability.article.footnotes = {

    skipFootnoteLink: /^\s*(\[?[a-z0-9]{1,2}\]?|^|edit|citation needed)\s*$/i,
    
    prepareFootnotes: function () {
        var footnoteContainer = $("#rdb-footnotes ol"),
            footnoteLinks     = $("#rdb-article-content").find("a"),
            footnoteLength    = footnoteLinks.length,
            footnoteCounter   = 1,
            linkId,
            link,
            link_url,
            linkDomain;

        if (footnoteLength === 0) {
            $('#rdb-footnotes').hide();
            return;
        }

        for (linkId = 0; linkId < footnoteLength; linkId++) {
            link        = $(footnoteLinks[linkId]);
            link_url    = link.attr('href');
            linkDomain  = link[0].host ? link[0].host : document.location.host;
                
            // If the link has an href attribute create a footnote for it
            if (link_url && !link.text().match(readability.article.footnotes.skipFootnoteLink)) {

                var link_text = (link.text() !== "") ? link.text() : link_url,
                    link_obj  = $('<li name="rdb-footnote-' + footnoteCounter + '">' +
                        '<a href="#rdb-footnote-link-' + footnoteCounter + '" title="Jump to link #' + footnoteCounter + ' in this article" class="footnote-jump">^</a></li>');

                link.attr('name', 'rdb-footnote-link-' + footnoteCounter).addClass('rdb-footnoted').after(
                    '<sup class="rdb-footnote"><a href="#rdb-footnote-' + footnoteCounter + '">' + footnoteCounter + '</a></sup>'
                );

                link_obj.append('<a name="rdb-footnote-' + footnoteCounter + '" href="' + link_url + '">' + link_text + '</a> <small class="rdb-footnote-domain">(' + linkDomain + ')</small> <small class="rdb-footnote-full-url hidden">( ' + link_url + ' )</small>');

                footnoteContainer.append(link_obj);

                footnoteCounter += 1;
            }
        }
    },
    
    init: function () {
        this.prepareFootnotes();
        if ($('body').hasClass('appearance_convert_links')) {
            $('#id_appearance_convert_links').attr("checked", true);
        }
    }
    
};

readability.article.sidebar = {
    scrolling: false,
    scrollTimeout: null,
    logoPos: null,

    toggle: function ($sidebarLink) {
        if (!$.browser.msie) {
            // If it's hidden, show it
            if ($sidebarLink.is('.sidebar-hidden')) {
                $('#rdb-article-tools, #logo').animate({
                    'left': readability.article.sidebar.logoPos.left + 'px'
                }, {
                    duration: 235,
                    complete: function () {
                        $('body').css('background-position', '0 0');

                        $sidebarLink.removeClass('sidebar-hidden').html('&laquo;');

                    }
                });

            // Otherwise hide it.
            } else {
                $('#rdb-article-tools, #logo').animate({
                    'left': '-200px'
                }, {
                    duration: 435,
                    step: function () {
                        $('body').css('background-position', '-200px 0');

                    },
                    complete: function () {
                        $sidebarLink.addClass('sidebar-hidden').html('&raquo;');

                    }
                });
            }

        // IE needs some help for some reason.
        } else {
            $('#rdb-article-tools, #logo').toggle(function () {
                if ($('body').css('background-position-x') === '-200px') {
                    $('body').css('background-position', '0 0');
                } else {
                    $('body').css('background-position', '-200px 0');
                }
            });
        }
    },
    
    init: function () {
        var $sidebarLink = $('#sidebar-hide-link'),
            ua           = navigator.userAgent;

        readability.article.sidebar.logoPos = $('#rdb-article-tools').position();

        $sidebarLink.click(function (ev) {
            ev.preventDefault();

            readability.article.sidebar.toggle($sidebarLink);
        });

        if (ua.indexOf('AppleWebKit') !== -1 && ua.indexOf('Mobile') !== -1) {
            $(document).bind('touchmove', function () {
                if (readability.article.sidebar.scrolling === false) {
                    readability.article.sidebar.scrolling = true;

                    $sidebarLink.hide();
                }

                clearTimeout(readability.article.sidebar.scrollTimeout);

                readability.article.sidebar.scrollTimeout = setTimeout(function () {
                    $sidebarLink.css({
                        'position': 'absolute',
                        'top': (window.pageYOffset + window.innerHeight - $sidebarLink.innerHeight() - 10)
                    });

                    $sidebarLink.show();

                    readability.article.sidebar.scrolling = false;

                }, 500);
            });
        }
    }
};

/**
 * Archive/unarchive an article, maintaining state on both archive buttons.
**/
readability.article.archive = {

    /***
     * Given a boolean value, toggle whether an article should be marked
     * as archived or not in the UI.
    **/
    toggle: function (value) {
        $('#rdb-article').attr('data-is-archived', (value ? '1' : '0'));
        $('#tool-archive').toggleClass('active', value);

        if (value) {
            $('a.article-archive').addClass('active');
            $('#article-archive').text('Unarchive');
        } else {
            $('a.article-archive').removeClass('active');
            $('#article-archive').text('Archive');
        }
    },

    init: function () {
        var $archiveLinks = $('a.article-archive'),
            $article = $('#rdb-article'),
            rdba = readability.article.archive;

        $archiveLinks.click(function (ev) {
            var $archiveLink = $(this),
                isArchived = $article.attr('data-is-archived') === '1';

            ev.preventDefault();

            /**
             * Visually toggle it immediately, so that the user has feedback
             * even if the processing takes a second or so.
            **/
            rdba.toggle(!isArchived);

            /**
             * Toggle our archived flag to the opposite of whatever it
             * currently is.
            **/
            $.ajax({
                type: "POST",
                url: $archiveLink.attr('href'),
                data: {
                    "value": isArchived ? 0 : 1
                },
                dataType: "json",
                error: function () {
                    /* Problem, revert. */
                    rdba.toggle(isArchived);
                },
                success: function (response) {
                    if (!response.success) {
                        /* Problem, revert. */
                        rdba.toggle(isArchived);
                    } else {
                        /* Success, set to whatever the response was. */
                        rdba.toggle(response.value);
                    }
                }
            });

            return false;


        });
    }
};

/**
 * If the user clicked "print" from an embed.
 *
**/
readability.article.print = {
    init: function () {
        $(window).load(function () {
            if ($('body').data('print') === 1) {
                window.print();
            }
        });
    }
};

/**
 * Loop through the images in the article, fixing their display - centering
 * them, making sure that the figures look right if they have them, etc.
**/
readability.article.layoutImages = {

    imageWidthThreshold: null,
    
    imageHideThreshold: 30,

    layoutImage: function ($img) {
        var limg = readability.article.layoutImages;

        /**
         * Even after load, some images were still reporting incorrect widths.
         * A .25 second timeout to let them settle themselves.
        **/
        window.setTimeout(function () {
            var width    = $img.width(),
                height   = $img.height(),
                $figure  = $img.parents('figure'),
                inFigure = $figure.length > 0,
                figWidth,
                figHeight;
            
            /**
             * If the image has no area, there's nothing to fix.
             * In addition, the image may not have loaded properly yet,
             * so we should just leave it be.
            **/
            if(!width || !height) {
                return;
            }

            /**
             * If the image is too small to be worth displaying, hide it.
             */
            if (width <= limg.imageHideThreshold || height <= limg.imageHideThreshold) {
                /* If the image was explicitly kept and is small, it's probably
                 * an inline image like LaTeX, so just keep it and let it stay
                 * inline.
                **/
                if (!$img.is(".entry-content-asset")) {
                    $img.addClass("hidden");
                }
                return;
            }
            
            if (inFigure) {
                $figure.find('figcaption, p').width(width);

                /**
                 * Center and lay out all figure tags, which need a wrapping
                 * element to do so.
                 **/
                $figure.wrap('<div class="figure-wrap" />');

                /**
                 * Done after the width setting above because it can effect
                 * the figures width.
                 */
                figWidth = $figure.width();
                if (figWidth <= limg.imageWidthThreshold) {
                    $figure.addClass('rightFigure');
                }

            } else {
                /* Decide whether to float or center the image. */
                if (width > limg.imageWidthThreshold) {
                    $img.addClass("blockImage");
                } else {
                    $img.addClass("leftImage");
                }
            }
            
        }, 250);
        
    },

    init: function () {
        var limg = readability.article.layoutImages,
            $article = $('#rdb-article-content');
        
        limg.imageWidthThreshold = Math.min($article.width(), 800) * 0.55;
    }
};

readability.article.pageFetcher = {
    pageCount: 1,
    
    appendPage: function (articleId, force) {
        var pf = readability.article.pageFetcher;
        
        if (!force && pf.pageCount > 10) {
            var $nextPageLink = $('<a class="nextPageLink" href="#">Read Next Page</a>');

            $nextPageLink.data('article-id', articleId);

            $('#rdb-article-content').append($nextPageLink);

            return;
        }

        $.get("/articles/" + articleId + "/ajax/view/", function (responseObj) {
            var $nextPage;
            
            if (typeof responseObj.content === "undefined" || $.trim(responseObj.content) === "") {
                return false;
            }

            $nextPage = $(responseObj.content);

            $nextPage.prepend("<hr class='sect-separator' />");
            
            $('#rdb-article-content').append($nextPage);

            pf.pageCount++;

            $nextPage.find('img').each(function () {
                readability.article.layoutImages.layoutImage($(this));
            });
            
            if (responseObj.next_page) {
                return readability.article.pageFetcher.appendPage(responseObj.next_page);
            }

        }, 'json');
    },
    
    
    init: function () {
        var nextPageId = $('#rdb-article').attr('data-next-page-id') || "";

        $('a.nextPageLink').live('click', function () {
            var pf = readability.article.pageFetcher;
            
            pf.appendPage($(this).data('article-id'), true);
            
            $(this).hide();
            
            return false;
        });

        if (nextPageId !== "") {
            readability.article.pageFetcher.appendPage(nextPageId);
        }
    }
};

readability.article.smoothScrolling = {
    reversePageScroll : false, // If they hold shift and hit space, scroll up

    /**
     * How long it takes to scroll the page, in ms.
    **/
    scrollSpeed: 400,

    /**
     * The scrollable element, which changes depending on browser. Initialized via initScrollable.
    **/
    scrollable: null,

    /**
     * initScrollable - detect which element to use for scrolling - html or body. Sets the scrollable attribute.
     *
     * Derived from getScrollable, borrowed from jQuery Smooth Scroll by Karl Swedberg:
     * https://github.com/kswedberg/jquery-smooth-scroll/blob/master/jquery.smooth-scroll.js
     *
     * @param els an array of elements to try to scroll upon - probably ['html','body']
     * @return null
    **/
    initScrollable: function (els) {
        var scrolled = false;

        for(var i=0, il=els.length; i<il; i++) {
            var tagName = els[i],
                el      = $(tagName);

            if (el.scrollTop() > 0) {
                readability.article.smoothScrolling.scrollable = el.get(0);
                break;
            }

            el.scrollTop(1);
            scrolled = el.scrollTop() > 0;
            el.scrollTop(0);

            if (scrolled) {
                readability.article.smoothScrolling.scrollable = el.get(0);
                break;
            }
        }

        // If we weren't able to initialize the scrollable at all, fall back to 'html, body'.
        if (readability.article.smoothScrolling.scrollable === null) {
            readability.article.smoothScrolling.scrollable = $('html, body');
        }
    },

    /**
     * Are we already smooth scrolling the page?
    **/
    isAnimating: function () {
        return $(readability.article.smoothScrolling.scrollable).is(':animated');
    },

    /**
     * Determine when to fade the scroll bullet.
    **/
    fadeBulletInterval: null,
    fadeBullet: function () {
        if (!readability.article.smoothScrolling.isAnimating()) {
            $('#scroll-bullet').fadeOut('fast');
            clearInterval(readability.article.smoothScrolling.fadeBulletInterval);
        }
    },

    /**
     * Initialize the smooth scrolling functionality.
     * @return null
    **/
    init: function () {
        var rdbss = readability.article.smoothScrolling;
        
        rdbss.initScrollable(['html','body']);
        
        $(document).keydown( function (e) {
            var code           = (window.event) ? event.keyCode : e.keyCode,
                viewportHeight = $(window).height(),
                offset         = $(window).scrollTop(),
                direction      = 1,
                delta          = viewportHeight - 50;
            
            if (code === 16) {
                rdbss.reversePageScroll = true;
                return;
            }

            if (code === 32) {
                if (rdbss.isAnimating()) {
                    return false;
                }
                
                direction = (rdbss.reversePageScroll) ? -1 : 1; 

                if (direction == 1) {
                    $('#scroll-bullet').css({'opacity': 1, 'top': offset + (delta * direction), 'left': $('#rdb-article-content').position().left - 25}).show();                    
                }

                $(rdbss.scrollable).animate({scrollTop: offset + (delta * direction)}, rdbss.scrollSpeed, function () {
                    rdbss.fadeBulletInterval = setInterval(rdbss.fadeBullet, 500);
                });
                
                return false;
            }
        });
        
        $(document).keyup( function (e) {
            var code = (window.event) ? event.keyCode : e.keyCode;
            
            if (code === 16) {
                rdbss.reversePageScroll = false;
                return;
            }
        });
    }

};

/**
 * Analyze the article text and determine if it should be right-to-left. If so, add classes to do so.
**/
readability.article.direction = {
    
    /**
     * Given a bit of text, analyze it for right-to-left style characters.
     * @param text string - the text to analyze
     * @return string rtl|ltr - the direction of the text.
    **/
    getSuggestedDirection: function (text) {
        function sanitizeText() {
            return text.replace(/@\w+/, "");
        }
        
        function countMatches(match) {
            var matches = text.match(new RegExp(match, "g"));
            return matches !== null ? matches.length : 0; 
        }
        
        function isRTL() {            
            var count_heb =  countMatches("[\\u05B0-\\u05F4\\uFB1D-\\uFBF4]");
            var count_arb =  countMatches("[\\u060C-\\u06FE\\uFB50-\\uFEFC]");
    
            // if 20% of chars are Hebrew or Arbic then direction is rtl
            return  (count_heb + count_arb) * 100 / text.length > 20;
        }
    
        text  = sanitizeText(text);
        return isRTL() ? "rtl" : "ltr";
    },
    
    /**
     * If the article content looks to be right-to-left, add the right-to-left class to style it such.
     *
     * @return void
    **/
    init: function () {
        var sample_html = $('#article-entry-title').text() + $('#rdb-article-content p:lt(3)').text(),
            is_rtl = (readability.article.direction.getSuggestedDirection(sample_html) === 'rtl');
        
        if (is_rtl) {
            $('#rdb-primary, #article-entry-title').addClass('right-to-left');
        }
    }
};

readability.article.readLater = {

    readLater: function () {
        $.post(
            '/articles/' + readability.utilities.articleId + '/ajax/add',
            {
                "add": 1
            },
            function (response) {
                if(response.success || response.duplicate){
                    $('#read-later-button').addClass('added').html('<span>Added</span> to Reading List').unbind('click');
                }

                else if (response.login_required) {
                    readability.article.readLater.openModal();
                }
            },
            'json'
        );
        
    },

    openModal: function () {
        $.colorbox({
            width: "770px",
            top: "10%",
            fixed: true,
            inline: true,
            opacity: 0.6,
            href: 'div.login-modal',
            onComplete: function () {
                $('#login-modal-activation-email').focus();
            }
        });
        
    },
    
    init: function () {
        $('a.dismissmodal').live('click', function () {
            $.colorbox.close();
        });
        
        $('#read-later-button').click(function () {
            readability.article.readLater.readLater();
           
            return false; 
        });


        $('#login-modal-activation-form').submit(function () {
            var email = $("#login-modal-activation-email").val(),
                $form = $(this);

            if (readability.article.activator.validateEmail(email) == false) {
                $('#login-modal-activation-response').html("Sorry, that email looks invalid. Please try again.").slideDown();
                $('#login-modal-activation-email').focus();
                return false;
            }

            $form.find('input[type="submit"]').val("Activating...");
            $form.find('img.load-spinner').show();
            $('#login-modal-activation-response').hide();

            readability.article.activator.activate({
                "email": email,
                "success": function (responseObj) {
                    $('#login-modal-activation-form').fadeTo(250, 0).slideUp(250, function () {
                        $('#login-modal-activation-response').addClass('success').html("<div class='notice' id='success'>Your account has been created! Please check your email.</div> <a href='#' class='dismissmodal new-button'>&laquo; Back to my article</a>").fadeIn(250);
                    });
                },
                "error": function (errorObj) {
                    if (errorObj.errorCode == 409) {
                        $('#login-modal-activation-response').html("It looks like that email is already associated with an account! <br />Perhaps you meant to Login?").slideDown();
                    } else {
                        $('#login-modal-activation-response').text("It looks like there was a problem signing you up. Please check your email and try again.").slideDown();
                    }
                },
                "complete": function () {
                    $form.find('input[type="submit"]').val("Activate Account");
                    $form.find('img.load-spinner').hide();
                }
            });
            
            return false; 
        });
    }
};


readability.article.activator = {
    validateEmail: function (email) {
        var pattern = new RegExp(/^[^@ ]+@[^@ ]+\.[^@ ]+$/i);
        return pattern.test(email);
    },


    activate: function (args) {
        var options = {
            "email": args.email,
            "success": args.success || function () {},
            "error": args.error || function () {},
            "complete": args.complete || function () {}
        };
        
        $.ajax({
            url: "/account/ajax/register",
            type: "POST",
            dataType: "json",
            data: {
                "email": options.email
            },
            success: function (responseObj) {
                if (responseObj.success) {
                    options.success(responseObj);
                }
                else {
                    options.error(responseObj);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                // Build a "fake" error object
                var errorObject = {"success": false, "errorCode": xhr.status, "error": textStatus};
                options.error(errorObject);
            },
            complete: function (jqXHR, textStatus) {
                options.complete(jqXHR, textStatus);
            }
        });
    },


    init: function () {
        $('#footer-activation-form').submit(function () {
            var email = $("#activation-email").val(),
                $form = $(this);
            
            if (readability.article.activator.validateEmail(email) == false) {
                $('#footer-activation-response').html("Sorry, that email looks invalid. Please try again.").slideDown();
                $('#activation-email').focus();
                return false;
            }

            $form.find('input[type="submit"]').val("Activating...");
            $form.find('img.load-spinner').show();
            $('#footer-activation-response').hide();

            readability.article.activator.activate({
                "email": email,
                "success": function (responseObj) {
                    $('#footer-activation-form').fadeTo(250, 0).slideUp(250, function () {
                        $('#footer-activation-response').text("Your Readability account has been created! Check your email to get started.").fadeIn(250);
                    });
                },
                "error": function (errorObj) {
                    if (errorObj.errorCode == 409) {
                        $('#footer-activation-response').html("It looks like that email is already associated with an account! <br />Perhaps you meant to Login?").slideDown();
                    } else {
                        $('#footer-activation-response').text("It looks like there was a problem signing you up. Please check your email and try again.").slideDown();
                    }
                },
                "complete": function () {
                    $form.find('input[type="submit"]').val("Activate Account");
                    $form.find('img.load-spinner').hide();
                }
            });
            
            return false; 
        });
    }
};

readability.article.handlePostMessage = (function(){
    // TODO: This post message handling doesn't seem to be in use anymore anywhere on the site
    var // All messages need to have an origin that matches the secure root domain
        // without a trailing slash.
        domain = readability.utilities.secureBaseUrl.replace(/\/$/,''),
        // Map postMessage events to callables
        postMessageMap = {
            'login-success': function(event){
                // Just refresh the page to get the logged-in view
                document.location.href = document.location.href;
            },
            'login-failure': function(event){
                readability.article.showLoginError($('#cdm-login'), 'Sorry, that login was incorrect. Please try again.');

                $.colorbox.resize()
            },
            'read-later-success': function(event){
                $.colorbox.close();
                readability.article.readLater.readLater();
            },
            'read-later-failure': function(event){
                readability.article.showLoginError($('#read-later-cdm-login'), 'Sorry, that login was incorrect. Please try again.');

                $.colorbox.resize()
            }
        };


    // handlePostMessage public signature
    return function(event){
        // jQuery doesn't pass us the actual event. The postMessage event will
        // be a property originalEvent of the event object passed. We use
        // jQuery to attach the event listener because the method is different
        // for IE
        var originalEvent = event.originalEvent || event;

        if(originalEvent.origin != domain) return;

        try {
            postMessageMap[originalEvent.data](originalEvent); 
        }
        catch(postMessageError){
            console.log('postMessage error for event ' + originalEvent.data);
        }
    };
}());


readability.article.showLoginError = function($form, error){
    if(error){
        $form.find('.form-error')
        .html('').html(error)
        .removeClass('hidden').show();
    }
    else{
        $form.find('.form-error').hide().html('');
    }
};

// This is an object for each new modal pitch.
// Usage: var newPitch = new readability.article.modalPitch({options});
readability.article.modalPitch = function (options) {
    var that = this,
        cboxSettings = {
            fixed: true,
            href: options.el,
            inline: true,
            overlayClose: false,
            scrolling: false,
            top: "10%",
            width: "770px"
        },

        // Soft compare to null to match both undefined and null.
        // (Chrome/FF respectively)
        showModal = window.localStorage[options.localStorageKey] == null;

    this.el = options.el || null;
    this.$el = $(options.el) || null;
    this.forceData = options.forceData || null;
    this.localStorageKey = options.localStorageKey || null;

    // Setting this up outside the var dec to use this objs members
    cboxSettings.onClosed = function () {

        // Set a value in local storage for everyone
        window.localStorage[options.localStorageKey] = true;

        // Also set a key:value for authenticated users
        if (readability.utilities.user.id !== null && options.userSetting) {
            readability.setKeyValue(options.userSetting);
        }
    }

    // Override all default colorbox settings
    cboxSettings = $.extend(true, cboxSettings, options.cboxSettings || {});
    this.cboxSettings = cboxSettings;

    // This will run each time this object is instantiated.
    // @return OBJECT - This modalPitch object.
    this.render = function () {

        // First things first, if we're developing and need to
        // force open the modal we set up the views to take a
        // query string that will set the proper data attr
        if (this.$el.length && this.$el.data(this.forceData) == '1') {
            showModal = true;
        }

        if (this.$el.length && showModal) {
            $.colorbox(that.cboxSettings);
        }

        // Finally call the the provided render method if any.
        // Will be passed this object
        if ($.isFunction(options.render)) {

            // This modalPitch object will be passed back to
            // any user provided render method.
            options.render(that);
        }

        return this;
    };

    // Maybe a little strange?
    return this.render();
};

/* Outside of the document.ready block below because it uses window.onload instead - want to avoid a race. */
readability.article.print.init();


$(function () {
    readability.article.archive.init();
    readability.article.footnotes.init();
    readability.article.pageFetcher.init();
    readability.article.direction.init();
    readability.article.layoutImages.init();
    readability.article.sidebar.init();
    readability.article.smoothScrolling.init();
    readability.article.readLater.init();
    readability.article.activator.init();

    // ios and android app pitch.
    // Start Date: 03/19/2012
    // End Date: 04/15/2012
    // NOTE: This code is safe to remove after End Date.
    var appPitch = new readability.article.modalPitch({
        el: 'div.app-modal',
        localStorageKey: 'seen-app-modal',
        forceData: 'force-app-modal',
        userSetting: {
            'show_ios_ad': false
        },
        cboxSettings: {
            width: '665px'
        }
    });

    // Listen for Cross Domain Messages from our iframes and other windows
    $(window).bind('message', readability.article.handlePostMessage);


    $('a.item-share-email, #email-link').click(function () {
        readability.share.openEmailBox(readability.utilities.articleId);

        return false;
    });

    // Show the login form inside a modal
    $('.modal-show-login-button').click(function (event) {
        $( '#' + $(this).attr('data-login-id') ).toggleClass('hidden');

        $.colorbox.resize()

        return false;
    });


    $('a.twitter-share-button, a.item-share-twitter').click(function () {
        readability.share.openTwitterBox($(this).data('url'), $(this).data('tweet'), $(this).data('counturl'));

        return false;
    });


    $('#rdb-article-content img').each(function () {
        if ($(this).width() === 0) {
            /* If the image was not cached, call layoutImage when it's loaded. */
            $(this).load(function () {
                readability.article.layoutImages.layoutImage($(this));
            });

        } else {
            /* If the image was cached, you call it immediately because onload will never fire. */
            readability.article.layoutImages.layoutImage($(this));
        }
    });


    $('#home-overlay-dismiss').click(function () {
        $('#home-warning-overlay').hide();
    });


    $('#home-overlay-cancel').click(function () {
        /* We're in the read frame - it should close it on its own */
        if (window.parent !== window) {
            return false;

        }
        
        if (history.length > 1) {
            document.location = $('#article-url').attr('href');

            return false;

        } else {
            return true;

        }
    });


    /**
     * Show the download pitch by default, switch to activate if the add-on is
     * already installed. Remove the class of hidden or firefox won't properly
     * unhide the pitch container(s).
    **/ 
    $('[data-pitch-type="download"]').removeClass('hidden').show();
    readability.checkAddonInstalled(function (addonInstalled){
        if (addonInstalled){
            // Show the activate pitch
            $('[data-pitch-type="download"]').hide();

            $('[data-pitch-type="activate"]').removeClass('hidden').show();
        }
    });
});
