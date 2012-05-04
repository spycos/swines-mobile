App.View = (function(lng, App, undefined) {
	
	/*
	 lng.View.Template.create('swines-navigation',
	            '<a href="#{{slug}}" data-target="article" class="active" data-icon="plus">\
	                    <image src="{{thumbnail}}" />\
	    				<abbr>{{title}}</abbr>\
	             </a>'
	        );
	*/
	

    lng.View.Template.create('category-articles-list',
            '<li id="{{slug}}">\
                <a href="#">\
                    <image src="{{thumbnail}}" />\
                    {{title}}\
                    <small>{{excerpt}}</small>\
                </a>\
            </li>'
        );
    
    
    lng.View.Template.create('categories-list',
    		'<a id="{{slug}}" href="#{{slug}}" data-target="article" class="current" data-label="{{title}}" data-icon="folder">\
    			<image src="{{thumbnail}}" />\
    			<abbr>{{title}}</abbr>\
    		</a>'
        );
    
    
    /*
     * 
     * 
     * <nav id="navigation">
                <a id="art" href="#art" data-target="article" class="current" data-label="Arte" data-icon="folder"></a>
                <a id="music" href="#music" data-target="article" class="current" data-label="Musica" data-icon="folder"></a>
                <a id="rincones" href="#rincones" data-target="article" class="current" data-label="Rincones" data-icon="folder"></a>
                <a id="trends" href="#trends" data-target="article" class="current" data-label="Tendencias" data-icon="folder"></a>
                <a id="tv" href="#tv" data-target="article" class="current" data-label="TV" data-icon="folder"></a>
                <a id="style" href="#style" data-target="article" class="current" data-label="Fashion" data-icon="folder"></a>
	</nav>
     * 
     */
    
   
    var navigation = function(container, template, rows) {
        lng.View.Template.Nav.create({
            el: container,
            template: template,
            data: rows
        });
        lng.View.Element.count('a[href="' + container + '"]', rows.length);
    };
    
    
    var list = function(container, template, rows) {
        lng.View.Template.List.create({
            el: container,
            template: template,
            data: rows
        });
        lng.View.Element.count('a[href="' + container + '"]', rows.length);
    };
    
    
   
     var returnToMain = function(message, icon) {
        lng.Sugar.Growl.show(message, 'Please wait...', icon, true, 2);
        
        App.Services.loadHomeArticles();
        //App.Data.refresh();

        setTimeout(function() {
            lng.Router.back();
            lng.Sugar.Growl.hide();
        }, 2000);
    };

   
    
    return{
        //returnToMain: returnToMain,
        list: list,
        navigation: navigation
    }

})(LUNGO, App);