App.Services = (function(lng, app, undefined) {
	//Get some Friends
	var getFriends = function() {
		//Show a Modal while we wait
		//lng.Sugar.Growl.show('loading', 'points', true);
		var url = 'getFriends';
        
        
		//Data if we needed it... 
		var data = {'screen_name': 'hflambo'};
        
        var hugo = 'https://api.twitter.com/1/friends/ids.json';
        
		//lng.Service.post(url, data, function(response) {
		lng.Service.get(hugo, data, function(response) {
		
            //Do something with response
			lng.View.Template.List.create({
				container_id: 'twitters',
				template_id: 'twitterfriends',
				data: response
			});
            //lng.Sugar.Growl.hide();
		});
	}

    return {
		getFriends: getFriends
    };

})(LUNGO, App);
