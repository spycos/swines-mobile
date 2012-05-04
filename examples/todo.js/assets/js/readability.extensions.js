var readability = (typeof readability !== "undefined") ? readability : {};

readability.extensions = (function(){
    function browser_synced(browser_string){
        try {
            var sync_profile = $.parseJSON(unescape(browser_string));
        }
        // All sorts of things can go wrong, so just die otherwise
        catch(e){ };
    }

    function init(){
        //
    }

    return {
        init:           init,
        browser_synced: browser_synced
    };
}());
