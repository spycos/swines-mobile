/*
 * Readability.Behaviors.Js
 *
 * @Authors: Daniel Lacy <daniell@arc90.com>, Philip Forget <philipf@arc90.com>
*/
var readability = (typeof readability !== "undefined") ? readability : {};

readability.UI = {
    _dropdowns: [],
    _dropdownLinks: [],

    DropDown: function (link_selector, dropdown_selector){
        var dropdownLink = $(link_selector),
            dropdown     = $(dropdown_selector);

        $.merge(readability.UI._dropdowns, dropdown.get());
        $.merge(readability.UI._dropdownLinks, dropdownLink.get());

        /* Hide or Show the dropdown content and set aria-expanded property. */
        dropdownLink.bind('click', function (ev) {
            ev.preventDefault();

            if (dropdown.is(':visible')) {
                readability.UI.hideDropdowns();

            } else {
                readability.UI.hideDropdowns();
                dropdownLink.parent().toggleClass('active', !dropdown.is(':visible'));
                dropdown.toggle();

            }

            if (dropdown.attr('aria-expanded')) {
                dropdown.attr('aria-expanded', 'false');

            } else {
                dropdown.attr('aria-expanded','true');

            }
        });

        return { /* Return public methods */ };
    },
    
    hideDropdowns: function () {
        $(readability.UI._dropdowns).hide();
        $(readability.UI._dropdownLinks).parent().removeClass('active');

        return true;
    },

    // Displays a message that overlays the element calling the warning.
    displayWarning: function (container_id, message) {
        var container = $("#article-" + container_id),
            height    = container.innerHeight(),
            width     = container.innerWidth();

        container.css('position','relative').append('<div class="warning">' + message + '</div>');

        container.find('.warning').css({ 'height' : height, 'width' : width }).fadeIn();
    },

    _init: $(function () {
        /**
         * Toggle a dropdown menu associated with this link.
         * Determined by ID. I.E. a link will have the id "dropdownLink-rdb-appearance", which
         * Associated to the dropdown with the id "rdb-appearance".
        **/
        $('.hasDropdown').each(function () {
            if (
                !$(this).hasClass('no-mobile') ||
                !(
                    (/iphone/.test(navigator.userAgent.toLowerCase())) ||
                    (/android/.test(navigator.userAgent.toLowerCase()))
                )
            ) {
                readability.UI.DropDown(this, '#dropdown-' + this.href.split(/#/)[1]);

            }
        });

        // $(window).resize(function () {
            // TODO: This is causing the mobile appearance dropdown to shit the bed
            //readability.UI.hideDropdowns();
        // });

        $(document).bind('click touchstart', function (ev) {
            if (!(
                    $(ev.target).is('.hasDropdown') ||
                    $(ev.target).parents('.hasDropdown').length > 0 ||
                    $(ev.target).closest('.dropdown').length > 0
                )
            ) {
                readability.UI.hideDropdowns();
            }
        });
    })
};


var decrElement = function ($elems) {
    $elems.each(function () {
        return $(this).text(
            parseInt($(this).text().replace(/[^\d]/g, ''), 10) - 1
        );
    });
};


var incrElement = function ($elems) {
    $elems.each(function () {
        return $(this).text(
            parseInt($(this).text().replace(/[^\d]/g, ''), 10) + 1
        );
    });
};

var ArchiveToggle = function ($toggleLink) {
    var url         = $toggleLink.attr("href"),
        $article    = $('#article-' + ($toggleLink.attr("data-article-id") || readability.utilities.articleId)),
        init_value  = $toggleLink.attr("data-value") == "1" ? true : false,
        value       = init_value;

    function set_value (new_value) {
        if (value != new_value) {
            value = new_value;

            $toggleLink.attr("data-value", value ? 1 : 0);
            $toggleLink.toggleClass('active', value);

            if (!$('body').is('.favorites')) {
                if (value != init_value) {
                    $article.stop().fadeTo(250, 0).slideUp();

                } else {
                    $article.stop().animate({"opacity": "1"}, 350);

                }

            } else {
                if (new_value) { //unarchive to archive
                  $article.find('.article-archive').text('Unarchive');

                } else {
                  $article.find('.article-archive').text('Archive');

                }
            }

            if (value === true) {
                if ($('body').hasClass('latest')) {
                    incrElement($('#contribute-sidebar strong.count'));
                }

                incrElement($('#sect-nav-archive span.count'));
                decrElement($('#sect-nav-queue span.count'));

            } else {
                incrElement($('#sect-nav-queue span.count'));
                decrElement($('#sect-nav-archive span.count'));

                if ($('body').hasClass('latest')) {
                    decrElement($('#contribute-sidebar strong.count'));
                }

            }
        }
    }

    $toggleLink.click(function (ev) {
        ev.preventDefault();

        readability.toggleBooleanField({
            url: url,
            callback: function (data) {
                if (!data.success) {
                    set_value(init_value);
                }
                readability.invalidateCache();
            }
        });

        set_value(!value);
        
        return false;
    });
};


var FavoriteToggle = function ($toggleLink) {
    var url         = $toggleLink.attr("href"),
        init_value  = $toggleLink.attr("data-value") == "1" ? true : false,
        value       = init_value;

    function set_value (new_value) {
        if (value != new_value) {
            value = new_value;

            $toggleLink.toggleClass('active', value);

            if (value) {
                incrElement($('#sect-nav-favorite span.count'));

                if ($('body').hasClass('favorites')) {
                    decrElement($('#contribute-sidebar strong.count'));
                }

            } else {
                if ($('body').hasClass('favorites')) {
                    incrElement($('#contribute-sidebar strong.count'));
                }

                decrElement($('#sect-nav-favorite span.count'));

            }
        }
    }

    $toggleLink.click(function (ev) {
        ev.preventDefault();

        readability.toggleBooleanField({
            url: url,
            callback: function (data) {
                if (!data.success) {
                    set_value(init_value);
                }
                readability.invalidateCache();
            }
        });

        set_value(!value);

    });
};


$(function () {

    // TODO: I'm not sure this is the greatest idea, what if I just want to select my content tag, or a part of this?
    $('input.copy-paste, textarea.copy-paste').click(function () {
        $(this).focus().select();
    });


    /* Readonly messes with iOS' ability to select text, so remove it for them. */
    if($.browser.ipad || $.browser.iphone) {
        $('input.copy-paste, textarea.copy-paste').removeAttr('readonly');
    }

    /**
     * TODO: break the favorite toggle JS two separate methods, such that the
     * reading list and article view UI components can be decoupled.
     */
    
    /* Favorite an article. */
    $('.article-favorite').each(function () {
        favoriteToggle = new FavoriteToggle($(this));
    });


    /* TODO: This is reading-list specific logic, it should be moved
       to readability.articles.js */

    /* Archive an article. */
    $('#rdb-reading-list .article-archive').each(function() {
        archiveToggle = new ArchiveToggle($(this));
    });
    
    
    if($('#article-archive').hasClass('active')){
        $('#article-archive').html('Unarchive');
    }

    /* Set '.clicked' class on opened articles. */
    $('#rdb-reading-list > li').each(function () {
        var $article   = $(this),
            articleUrl = "/articles/" + $article.attr('data-article-id');
        
        $article.find('a[href="' + articleUrl + '"]').click(function () {
            $article.addClass('clicked');

            return true;
        });
    });


    /* Confirm deletion from user's Reading List. */
    $('#rdb-reading-list .article-confirmDelete').live('click', function (ev) {
        ev.preventDefault();

        var articleId               = $(this).data("article-id"),
            articleDomain           = $(this).parents('li').find("span.article-domain").text(),
            showContributionWarning = $(this).data("show-contribution-warning") == "1";

        readability.UI.displayWarning(articleId, 
            '<p class="confirm-delete">Are you sure you want to remove this article?' +
            (showContributionWarning ? '<span>*</span>' : '') + '</p>' +
            '<p><a href="#" class="article-remove button-negative" data-article-action="remove" data-article-id="' +
            articleId + '">Delete It</a>' +
            ' or <a href="#" class="main-link cancel-warning">Cancel</a></p>' +
            (showContributionWarning ? '<p class="hint">*Deleting will remove this contribution to ' + articleDomain + '.</p>' : '')
        );
    });


    /* Remove from user's Reading List. */
    $('a.article-remove').live('click', function () {
        var articleId = readability.utilities.articleId || $(this).attr('data-article-id');
        
        $.post('/articles/' + articleId + '/ajax/remove/', {}, function (responseObj) {
            if(responseObj.success) {
                if ($('body').hasClass('favorites')) {
                    decrElement($('#sect-nav-favorite span.count'));

                } else if ($('body').hasClass('archives')) {
                    decrElement($('#sect-nav-archive span.count'));

                } else if ($('body').hasClass('latest') && $('#article-' + articleId).find('.article-favorite.active').length > 0) {
                    decrElement($('#sect-nav-favorite span.count'));
                    decrElement($('#sect-nav-queue span.count'));
                    incrElement($('#contribute-sidebar strong.count'));

                } else {
                    decrElement($('#sect-nav-queue span.count'));
                    incrElement($('#contribute-sidebar strong.count'));

                }

                $('#article-' + articleId).fadeTo(250, 0).slideUp();

            } else {
                readability.UI.displayWarning(articleId, '<p>Sorry, there was a problem removing this article. Please contact Readability support. (Article ID: ' + articleId + ')</p>');

            }

            readability.invalidateCache();

        }, 'json');

        return false;

    });


    /* Add to user's Reading List. */
    $('a.article-add').live('click', function () {
        if ($(this).is('.added')) {
            return false;

        }

        var article_link = $(this),
            cached_link  = article_link.clone(),
            added_text   = 'Added to Reading List',
            error_text   = 'There was an error adding the article, please try again later.';

        article_link.html("Adding&hellip;");

        $.post(article_link.attr('href'), {"strict_on_duplicate": 0}, function (data) {
            if (data.success) {
                article_link.addClass('added').attr({title: added_text, 'data-value' : 1}).text(added_text);   

                if (article_link.is('.sample-article')) {
                    $('#empty-message').fadeOut(function () {
                        $('p.meantime').hide();
                        $('#have-message').fadeIn();
                        $('div.sample-articles-continue').slideDown();
                    });

                    incrElement($('#sect-nav-queue span.count'));
                    decrElement($('#contribute-sidebar strong.count'));

                }

            } else {
                if (typeof data.duplicate != "undefined" && data.duplicate) {
                    article_link.addClass('added').attr({title: added_text, 'data-value' : 1}).text(added_text);

                } else {
                    article_link.html(error_text);

                    setTimeout((function (article_link) {
                        return function () {
                            article_link.fadeOut(500, function () {
                                article_link.remove();   
                            });
                        };

                    }(article_link)), 2000);

                    article_link.after(cached_link);

                }

            }

            readability.invalidateCache();

        }, 'json');
        
        return false;

    });


    /* Refresh Page. */
    $('a.refresh-page').live('click', function () {
        window.location.reload(true);
    });


    // grays out title of h2 in the suggested reading box for empty list
    $('.sample-articles a.add-button').live('click', function () {
        $(this).parent().find('h2:first').css('color', '#777');
    });


    // Hide all warning messages on dismiss.
    $('.cancel-warning').live('click', function (ev) {
        ev.preventDefault();

        $(".warning").fadeOut();
    });


    // Sidebar tools
    $("#tool-print").click(function (ev) {
        ev.preventDefault();

        window.print();
    });


    /* Appearance ajax settings - both in the appearance control panel and article view. */
    $('#dropdown-appearance input:radio').click(function (ev) {
        ev.stopImmediatePropagation();

        var property        = $(this).attr("name"),
            value           = $(this).attr("value"),
            previous_value  = readability.BodyClass.getClassByRegex(new RegExp("^" + value.split("-")[0]+"-"));

        if (previous_value != value) {
            if ($('body').is('#article')) {
                readability.BodyClass.addRemove(value, previous_value);             
            }

            // Set the body class right away
            readability.setAppearanceValue(
                "appearance",
                property,
                value,
                function (data) {
                    if (data.success) {
                        readability.invalidateCache();

                    } else {
                        readability.dbg("Unable to save appearance preferences");

                    }
                }
            );
        }
    });


    $('#dropdown-appearance input:checkbox').click(function (ev) {
        ev.stopImmediatePropagation();

        var property = $(this).attr("name"),
            value    = $(this).attr("checked") ? true : false;

        if ($('body').is('#article')) {
            if (value) {
                readability.BodyClass.add(property);

            } else {
                readability.BodyClass.remove(property);

            }           
        }

        readability.setAppearanceValue(
            "appearance",
            property,
            value,
            function (data) {
                if (data.success) {
                    readability.invalidateCache();

                } else {
                    readability.dbg("Unable to save appearance preferences");

                }
            }
        );
    });


    // Keep track of any id_subscription_ammount fields for change and update the corresponding fields
    $('#id_subscription_amount').each(function () {
        function amount_validator () {
            var amount = (parseFloat($(this).val()));

            if (isNaN(amount) || amount < 5) {
                $('#contribution_notice').hide();

                $('#contribution_notice_error').show();

            } else {
                $('#contribution_notice').show();

                $('#contribution_notice_error').hide();

                $('#contribution_amount').text((amount * 0.7).toFixed(2));

            }
        }

        $(this).keyup(amount_validator);

        amount_validator.call($(this));
    });
    
    
    //  Grabs the initial inbox slug for the email and stores it in order to reset to correct slug when cancel is clicked.
    var initInboxSlug = $('#id_inbox_slug').val();
     
	$('#email-into-change').click(function(){
		$('#email-into-display').fadeOut(function(){
			$('#email-into-edit').fadeIn('fast');
		});
	});
	
	$('#email-into-cancel').click(function(){
		$('#email-into-edit').fadeOut(function(){
			$('#email-into-display').fadeIn('fast');
			$('#id_inbox_slug').val(initInboxSlug);
		});
	});
    
    /**
     * Re-send activation email
    **/
    $('a.email-validation-reminder-resend').click(function () {
        var $link = $(this);

        if($link.data('sent')) {
            return false;
        }
        
        
        $.ajax({
            url: "/readers/ajax/resendActivationEmail",
            type: "POST",
            data: {
                'resend': true
            },
            success: function(data){ 
                if(data.success){
                    if(data.email.length > 20){
                        var charLength = 18;
                        $link.text('Sent to ' + data.email.substring(0, charLength) + ' ...').data('sent', 1);
                        $('a.email-validation-reminder-resend').attr('title', data.email);
                    }
                    else{
                        $link.text('Sent to ' + data.email + '.').data('sent', 1);
                    } 
                }
                else {
                    alert(data.error);
                }
            },
            error: function(XMLHttpRequest){
                alert("There was an issue sending your activation email. If you continue to have trouble, please contact Readability support.");
            },
            dataType: 'json'
        });
        
        return false;
    });
});
