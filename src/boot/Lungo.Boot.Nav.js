/**
 * Initialize the <article> element
 *
 * @namespace LUNGO.Boot
 * @class Article
 *
 * @author Javier Jimenez Villar <javi@tapquo.com> || @soyjavi
 * @author Guillermo Pascual <pasku@tapquo.com> || @pasku1
 */

LUNGO.Boot.Nav = (function(lng, undefined) {

    var ATTRIBUTE = lng.Constants.ATTRIBUTE;
    var ELEMENT = lng.Constants.ELEMENT;
    var SELECTORS = {
        NAV: 'nav.navigation'
    };

    /**
     * Initializes the markup elements of an article
     *
     * @method init
     */
    var start = function() {
        _initElement(SELECTORS.LIST_IN_NAV, _createNavElement);
    };

    var _initElement = function(selector, callback) {
        var found_elements = lng.dom(selector);

        for (var i = 0, len = found_elements.length; i < len; i++) {
            var element = lng.dom(found_elements[i]);
            lng.Core.execute(callback, element);
        }
    };

    var _createNavElement = function(article) {
        if (article.children().length === 0) {
            var article_id = article.attr(ATTRIBUTE.ID);
            article.append(ELEMENT.NAV);
        }
    };

   
    return {
        start: start
    };

})(LUNGO);