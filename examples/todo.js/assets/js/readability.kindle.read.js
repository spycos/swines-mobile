/**
 * rdb.kindle.read - provides support for the actual sending to Kindle from Reading View.
 *
 *
**/
rdb.kindle.read = (function () {
    var userDetails = null;

    function injectSendToKindle() {
        var h = document.createElement('script');
        h.setAttribute('type', 'text/javascript');
        h.setAttribute('charset', 'UTF-8');
        h.setAttribute('src', '/bookmarklet/send-to-kindle.js');
        document.documentElement.appendChild(h);
    }

    function formatUserEmail() {
        if(rdb.kindle.isSetUp()) {
            $('#kindle-email-address').text(userDetails['username'] + '@' + userDetails['domain']);
            $('#kindle-send-blurb').show();
            $('#kindle-setup-pending').hide();
        }
    }
    
    
    /**
     * Initialize Kindle Reading Logic
     *
     * @return void
    **/
    function init() {
        userDetails = rdb.kindle.getUserDetails();
        formatUserEmail();

        $('#kindle-edit-link, #kindle-setup-button').click(function () {
            $('#dropdown-kindle').hide();
            window.readabilityKindleAction = 'showSetup';
            injectSendToKindle();
        });

        $('#kindle-send-button').click(function () {
            $('#dropdown-kindle').hide();
            window.readabilityKindleAction = '';
            injectSendToKindle();            
        });

        /* On any message, refresh the user's kindle email blurb. */
        $(window).bind('message', function (e) {
            userDetails = rdb.kindle.getUserDetails();
            formatUserEmail();
        });

    };
    
    return {
        'init': init
    };
}());

$(function() {
    rdb.kindle.read.init();    
});
