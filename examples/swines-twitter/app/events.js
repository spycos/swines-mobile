App.Events = (function(lng, undefined) {

    lng.ready(function() {
		//Call the web service we set up.
		App.Services.getFriends();
	});
	

 
    
    
     return {

    };


})(LUNGO);