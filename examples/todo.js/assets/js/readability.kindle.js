var rdb = typeof(rdb) === 'undefined' ? {} : rdb;

if (typeof Cookie === 'undefined') {
    throw "rdb.kindle.js requires the Cookie library.";
}

/**
 * rdb.kindle - provides support for interacting with the Kindle API and displaying
 *              information relating to sending an article to your Kindle.
 *
**/
rdb.kindle = (function () {
    /**
     * Get the Kindle details of the currently active user.
     * 
     * @return Object|null - Will return a dictionary like {"username": "umbrae", "domain": "free.kindle.com"} 
    **/
    function getUserDetails() {
        try {
            user_details = JSON.parse(Cookie.get('kindleUserDetails'));

            /* Stop gap fix for nulls appearing as the username for a user. */
            if (!user_details['username'] || user_details['username'] == 'null') {
                return null;
            }

            return user_details;
        } catch(e) {
            return null;
        }
    }

    /**
     * Set the Kindle details for the currently active user.
     *
     * @param userDetails Object - A dictionary like {"username": "umbrae", "domain": "free.kindle.com"} 
     * @return void
    **/
    function setUserDetails(userDetails) {
        Cookie.set('kindleUserDetails', JSON.stringify(userDetails), {'path': '/', 'maxAge': '315569260'});
    }


    /**
     * Is this user set up to send articles to their Kindle?
     *
     * @return Boolean
    **/
    function isSetUp() {
        return getUserDetails() !== null;
    }

    return {
        'getUserDetails': getUserDetails,
        'setUserDetails': setUserDetails,
        'isSetUp': isSetUp
    };
}());