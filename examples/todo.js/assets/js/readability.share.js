var readability = (typeof readability !== "undefined") ? readability : {};

readability.share = (function() {

	var openEmailBox = function (articleId) {
		window.open(
		    '/articles/' + articleId + '/email',
		    'emailBox',
            'chrome=yes,centerscreen=yes,width=800,height=580'
		);
	};

    var openTwitterBox = function (url, tweet, counturl) {
        return window.open(
            'http://twitter.com/share?url=' +  encodeURIComponent(url) + 
                '&counturl=' + encodeURIComponent(counturl) +
                '&text=' + encodeURIComponent('"' + tweet + '"') +
                '&count=none' + 
                '&via=readability',
            'tweetBox',
            'width=550,height=450,toolbar=no'
        );
    };

    var init = function () {
        // Nothin yet.
    };

    return {
        "init": init,
        "openEmailBox": openEmailBox,
        "openTwitterBox": openTwitterBox
    };

}());
	
$(readability.share.init);