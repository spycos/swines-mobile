      
(function ($) {
	

	window.readability = (typeof window.readability !== "undefined") ? window.readability : {};
    window.readability.utilities = (typeof window.readability.utilities !== "undefined") ? window.readability.utilities : {};
    window.readability.utilities.secureBaseUrl = (typeof window.readability.utilities.secureBaseUrl !== "undefined") ? window.readability.utilities.secureBaseUrl : {};
    window.readability.utilities.secureBaseUrl.replace = function(){};
    
	var swinesApi = {};

	swinesApi.getCategoryPosts = function (hrefSlugId) {
        
	    var slugId = hrefSlugId.split('#')[1].replace('Page', '');
	    var pageId = '#' + slugId + 'Page';
	    var listviewId = pageId + '-listview';
	            
	    var serviceURL = "http://pearlsfortheswine.es/?json=get_category_posts&slug="+slugId+"&callback=?";
	    
	    http://pearlsfortheswine.es/?json=get_category_posts&slug=arte
	            
	    $.getJSON(serviceURL, function(data) {
	                
	        //construct page list-view id
	        
	        
	        //empty possible old existent list
	        $(listviewId).empty();	
	                        
	        //for each post from this category             
	        $.each(data.posts, function(index) { 

	            //get post json
	            var articleModelJSON = data.posts[index];
	            
	            //debug into console => remove later
	            //console.dir(data.posts[index]);
	            
	                                    
	            articleModelJSON.urlMobile = $.trim(articleModelJSON.title).replace(/[^a-zA-Z 0-9-]+/g,'').toLowerCase().replace(/\s/g,'-');
	            
	                     
	             var articleTemplate = '<li>'
	                                    +   '<a class="swinesViewFullArticle" href="#{{slug}}">'
	                                    +       '<img src="{{thumbnail}}" alt="{{title}}" style="width: 270px; height: 180px;"/>'
	                                    +   '</a>'
	                                    +   '<h4>{{{title}}}</h4>'

	                                        //add facebook
	                                    +   '<div class="fb-like" data-href="{{url}}" data-send="true" data-width="450" data-show-faces="true" data-font="arial"></div>'

	                                    + '</li>';
	                                    
	                                                               
	             var articleResume = $.mustache(articleTemplate, articleModelJSON);
	             $(listviewId).append(articleResume);

	             var onReadabilityTemplatesLoadedCallback = function () {
	            	 // create helper template function
		            var buildViewArticlePageReadability = function(contentHtml) {
		            	return '<div data-role="page" data-add-back-btn="true" id="{{slug}}">'
		                
		            	+      '<div data-theme="e" data-role="header" data-position="fixed">'
		                +          '<h1>{{{title}}}</h1>'
		                +      '</div>'
		                +      '<div data-role="content" id="content">'
		                
		                + contentHtml
		                + 	'</div>'		
		                
		                + '</div>';
		            
		          };
		            
		       
		         // Configure debug
		         $.Mustache.options.warnOnMissingTemplates = false;
		         
		         // Load in our readability templates and await callback.
		         $.Mustache.load('./resource/templates/readability.htm').done(onReadabilityTemplatesLoadedCallback);
		         
		         var readabilityContent = $.Mustache.render('rdb-article-content-wrapper', articleModelJSON);
		            
		            // aply template to model and append it to body
	             $('body').append(buildViewArticlePageReadability(readabilityContent));
	                
	                // refresh the list to show new article now!!
		         $(listviewId).listview('refresh');
	                
	            

	
				window.swinesApi = swinesApi;
			    
			    readability.TypekitHelpers = {
			        isFontSmoothingOn : true,
			        isWindows : /win/.test(navigator.platform.toLowerCase())
			    };
			
			    if (readability.TypekitHelpers.isWindows) {
			        readability.TypekitHelpers.isFontSmoothingOn = (window.TypeHelpers) ? TypeHelpers.hasSmoothing() : "unknown";
			    }
			
			    document.getElementsByTagName("html")[0].className += (" hasFontSmoothing-" + readability.TypekitHelpers.isFontSmoothingOn);
			
			    if(readability.TypekitHelpers.isFontSmoothingOn || readability.TypekitHelpers.isFontSmoothingOn === "unknown") {
			        document.write('<scr' + 'ipt src=' +  '"resource/js/jkv4lvx.js"' + '></scr' + 'ipt>');
			    }
			    
			    
			    if (readability.TypekitHelpers.isFontSmoothingOn || readability.TypekitHelpers.isFontSmoothingOn === "unknown") {
			        try{Typekit.load();}catch(e){}
			    }



				var styles = {
				        
				        'appearance_size': [
				            
				            ['size\u002Dx\u002Dsmall', 'Extra Small'],
				            
				            ['size\u002Dsmall', 'Small'],
				            
				            ['size\u002Dmedium', 'Medium'],
				            
				            ['size\u002Dlarge', 'Large'],
				            
				            ['size\u002Dx\u002Dlarge', 'Extra Large']
				            
				        ],
				        
				        'appearance_mobile_style': [
				            
				            ['mobile\u002Dstyle\u002Dnewspaper', 'Newspaper'],
				            
				            ['mobile\u002Dstyle\u002Dnovel', 'Novel'],
				            
				            ['mobile\u002Dstyle\u002Debook', 'eBook'],
				            
				            ['mobile\u002Dstyle\u002Dinverse', 'Inverse'],
				            
				            ['mobile\u002Dstyle\u002Dathelas', 'Athelas']
				            
				        ],
				        
				        'appearance_mobile_size': [
				            
				            ['mobile\u002Dsize\u002Dx\u002Dsmall', 'Extra Small'],
				            
				            ['mobile\u002Dsize\u002Dsmall', 'Small'],
				            
				            ['mobile\u002Dsize\u002Dmedium', 'Medium'],
				            
				            ['mobile\u002Dsize\u002Dlarge', 'Large'],
				            
				            ['mobile\u002Dsize\u002Dx\u002Dlarge', 'Extra Large']
				            
				        ],
				        
				        'appearance_col_width': [
				            
				            ['col\u002Dx\u002Dnarrow', 'Extra Narrow'],
				            
				            ['col\u002Dnarrow', 'Narrow'],
				            
				            ['col\u002Dmedium', 'Medium'],
				            
				            ['col\u002Dwide', 'Wide'],
				            
				            ['col\u002Dx\u002Dwide', 'Extra Wide']
				            
				        ],
				        
				        'appearance_style': [
				            
				            ['style\u002Dnewspaper', 'Newspaper'],
				            
				            ['style\u002Dnovel', 'Novel'],
				            
				            ['style\u002Debook', 'eBook'],
				            
				            ['style\u002Dinverse', 'Inverse'],
				            
				            ['style\u002Dathelas', 'Athelas']
				            
				        ],
				        
				        'appearance_mobile_col_width': [
				            
				            ['mobile\u002Dcol\u002Dx\u002Dnarrow', 'Extra Narrow'],
				            
				            ['mobile\u002Dcol\u002Dnarrow', 'Narrow'],
				            
				            ['mobile\u002Dcol\u002Dmedium', 'Medium'],
				            
				            ['mobile\u002Dcol\u002Dwide', 'Wide'],
				            
				            ['mobile\u002Dcol\u002Dx\u002Dwide', 'Extra Wide']
				            
				        ]
				        
				        },
				        body_classes = 'col\u002Dwide mobile\u002Dcol\u002Dwide mobile\u002Dsize\u002Dmedium mobile\u002Dstyle\u002Dnewspaper size\u002Dmedium style\u002Dnewspaper';
			       

}
	        }); //getCategories posts     
	        
	        )(jQuery);

