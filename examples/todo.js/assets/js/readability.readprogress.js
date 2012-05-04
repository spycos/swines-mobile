/**
 * Track where a user is in an article, and bring them back there if they come back to it.
 * Used by both web view and mobile web view.
 * @author Chris Dary <chrisd@arc90.com>
**/
var readability = (typeof readability !== "undefined") ? readability : {};

readability.readProgress = {
    readPercent: 0,

    updateReadPercent: function () {
        /**
         * For a minor performance gain, we could pull viewportHeight and documentHeight out, and update them onResize.
         * If scrolling begins to seem laggy, do this.
        **/
        var scrollTop      = $(window).scrollTop(),
            viewportHeight = $(window).height(),
            documentHeight = $(document).height();

        if(scrollTop + viewportHeight >= documentHeight) {
            /* We've reached the end of the page. Set readPercent to 1 (done) */
            readability.readProgress.readPercent = 1;
        }
        else {
            readability.readProgress.readPercent = scrollTop / documentHeight;
        }
    },

    /**
     * Send our read percent to the server for recording.
    **/
    sendReadPercent: function () {
        readability.readProgress.updateReadPercent();

        if(isNaN(readability.readProgress.readPercent)) {
            return false;
        }

        $.ajax({
            url: "/articles/" + readability.utilities.articleId + "/ajax/read_percent/",
            type: "POST",
            data: {"read_percent": readability.readProgress.readPercent},
            async: false
        });

        readability.invalidateCache();

        return;
    },

    jumpToReadPercent: function () {
        if(this.readPercent && this.readPercent < 1.0) {
            var scrollToInPixels = $(document).height() * this.readPercent;

            if(scrollToInPixels > 0) {
                /* Todo: Should we animate here to be spiff, or is that just wasting someones time? */
                /* TODO: I think it would be nice, it lets someone know they are being taken somewhere instead of it magically happening */
                $('html, body').animate({"scrollTop": scrollToInPixels}, 'slow');
            }
        }
    },

    init: function () {
        this.readPercent = parseFloat($('#rdb-article').attr('data-read-percent'));

        /**
         * Send the read percent on unload. Make sure we're not in mobile view before we run it.
         * Mobile has its own process that hooks into jqMobile in readability.mobile.js near pagebeforehide
        **/
        if($('div[data-role="page"]').length === 0 && readability.utilities.user.id !== false) {
            $(window).unload(this.sendReadPercent);
            this.jumpToReadPercent();
        }

    }
};

$(function() {
    readability.readProgress.init();
});
