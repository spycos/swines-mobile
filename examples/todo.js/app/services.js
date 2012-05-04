App.Services = (function(lng, App, undefined) {

	var serviceGetEndpointUrl = "http://pearlsfortheswine.es/";
	
	
	var loadArticlesByCategorySlug = function(slugId) {
		var serviceGetEndpointUrlParameters = {
			'json' : 'get_category_posts',
			'slug' : slugId
		};
		lng.Service.get(serviceGetEndpointUrl, serviceGetEndpointUrlParameters, function(response) {
			App.View.list('#' + slugId, 'category-articles-list', response.posts);
		});
	};

	
	var loadHomeArticles = function() {
		var serviceGetEndpointUrlParameters = {
			'json' : 'get_recent_posts'
		};
		lng.Service.get(serviceGetEndpointUrl, serviceGetEndpointUrlParameters, function(response) {
			App.View.list('#home', 'category-articles-list', response.posts);
		});
	};
	
	
	var loadArticlesCategories = function() {
		var serviceGetEndpointUrlParameters = {
			'json' : 'get_category_index'
		};
		
		lng.Service.get(serviceGetEndpointUrl, serviceGetEndpointUrlParameters, function(response) {
			
			var serviceGetEndpointUrlParameters = {
					'json' : 'get_recent_posts'
			};
			
			lng.Service.get(serviceGetEndpointUrl, serviceGetEndpointUrlParameters, function(result) {
				
				//add recent artcle into json response ;) home!!
				var home = {};
				home.description = "Home page with recent articles";
				home.count = result.length;
				home.slug = 'home';
				home.title = 'Home';
				
				response.categories.unshift(home);
				
				App.View.navigation('#swines-nav', 'categories-list', response.categories);
				
			});
			
			
			
		});
	};
	
	
	return {
		navigation: loadArticlesCategories(),
		home : loadHomeArticles(),		
		art: loadArticlesByCategorySlug('art'),
		music: loadArticlesByCategorySlug('music'),
		fashion: loadArticlesByCategorySlug('style'),
		trends: loadArticlesByCategorySlug('trends'),
		places: loadArticlesByCategorySlug('rincones'),
		tv: loadArticlesByCategorySlug('tv')
	}

})(LUNGO, App);