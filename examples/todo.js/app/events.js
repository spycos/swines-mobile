App.Events = (function(lng, undefined) {

    //Login
    lng.dom('#btnLogin').tap(function(event) {
        lng.Router.section('main');
        //App.Services.loadCategoryArticles('art');
        
        
    });

    //Done ToDo
    lng.dom('#btnDoneTodo').tap(function(event) {
        var current_todo = lng.Data.Cache.get('current_todo');

        App.Data.doneTodo(current_todo.id);
        App.View.returnToMain('ToDo done', 'check');
    });


})(LUNGO);