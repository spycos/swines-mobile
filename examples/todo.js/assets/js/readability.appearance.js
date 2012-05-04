var readability = (typeof readability !== "undefined") ? readability : {};

readability.appearance = {
  body_classes: [],
  swatch_hash: {
  },
  property_timeouts: [],
  set_property: function(property, value, previous_value, ignore_timeout) {
    var timeout = ignore_timeout ? 100 : 500;
    // Boolean values
    if(typeof(value) === 'boolean'){
      if(value && this.body_classes.indexOf(property) === -1){
        this.body_classes.push(property);
      } else if(this.body_classes.indexOf(property) !== -1) {
        this.body_classes.splice(this.body_classes.indexOf(property), 1);
      }
    } else { 
    // String values
      if(this.body_classes.indexOf(previous_value) !== -1){
        this.body_classes.splice(this.body_classes.indexOf(previous_value), 1);
      }
      if(typeof(value) !== 'undefined'){
        this.body_classes.push(value);
      }
    }
    
    if( readability.has_local_storage() ){
      localStorage[property] = value;
    }

    var is_preview = $('#sample-appearance').length > 0;
    if (is_preview) {
      var preview_classes = this.body_classes.join(" ") + " preview";
      $('#sample-appearance').contents().find('body')[0].className = preview_classes;
    } else {
      var active_classes = this.body_classes.join(" ");
      $('body')[0].className = active_classes;
    }


    if(property in this.property_timeouts) {
      window.clearTimeout(this.property_timeouts[property]);
      delete this.property_timeouts[property];
    }
    this.property_timeouts[property] = window.setTimeout(function() {
        readability.setAppearanceValue(
          "appearance",
          property,
          value,
          function(data){
            if( data.success ){
              readability.invalidateCache();
            } else {
              readability.dbg("Unable to save appearance preferences");
            }
          }
      );
    }, timeout);
  }
};
$(function () {
  readability.appearance.body_classes = body_classes.split(' ');
  // Slider inits and actions
  $('.appearance-slider').each(function(){
    var $slider_group = $(this),
      $slider       = $slider_group.find('.slider'),
      $next_btn     = $slider_group.find('[rel=next]'),
      $prev_btn     = $slider_group.find('[rel=prev]'),
      property      = $slider_group.attr('data-property'),
      choices       = styles[property],
      current_index = Math.floor(choices.length/2);
    var choice;
    for(choice in choices) {
      if(choices.hasOwnProperty(choice)){
        if(readability.appearance.body_classes.indexOf(choices[choice][0]) !== -1){
          current_index = parseInt(choice);
          break;
        }
      }
    }

    // Assumes #property as selector for slider
        // Instantiate the slider
    $slider.slider({
      min: 0,
      max: choices.length - 1,
      value: current_index,
      slide: function (event, ui) {
        set_value(parseInt(ui.value));
      }
    });
    $prev_btn.bind('click', function(event){
      $slider.slider('option', 'value', current_index - 1);
      set_value($slider.slider('value'), true);
    });
    $next_btn.bind('click', function(event){
      $slider.slider('option', 'value', current_index + 1);
      set_value($slider.slider('value'), true);
    });

    function set_value(new_index, skip_timeout){
      if(new_index !== current_index){
        readability.appearance.set_property(
          property,
          choices[new_index][0],
          choices[current_index][0],
          skip_timeout ? true : false
        );
        current_index = new_index;
      }
    }
  });

  // Checkbox actions
  $.each([
    'appearance_strip_images',
    'appearance_convert_links'
    ], function(i, property){
      var $el = $('#id_' + property);
      $el.bind('change', function(event){
        readability.appearance.set_property(property, $el.is(':checked'), undefined, true);
      });
    }
  );

  // Swatch actions
  $('#appearance-style-swatches').each(function(){
    var $list    = $(this),
      property = 'appearance_style',
      current_swatch;

    $list.find('li').each(function(){
      var $el = $(this);
      if(readability.appearance.body_classes.indexOf($el.attr('data-value')) !== -1){
        current_swatch = $el;
        $el.addClass('active');
      }
      $el.bind('click touchstart', function(){
        set_current_swatch($el);
      });
    });

    function set_current_swatch(new_swatch){
      var previous_value = null;
      if(current_swatch) {
	      current_swatch.removeClass('active');	
          previous_value = current_swatch.attr('data-value')
      }
      readability.appearance.set_property(property, new_swatch.attr('data-value'), previous_value, true);
      current_swatch = new_swatch;
      current_swatch.addClass('active');
    }
  });
});
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(searchElement /*, fromIndex */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0)
      return -1;

    var n = 0;
    if (arguments.length > 0)
    {
      n = Number(arguments[1]);
      if (n !== n)
        n = 0;
      else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }

    if (n >= len)
      return -1;

    var k = n >= 0
          ? n
          : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++)
    {
      if (k in t && t[k] === searchElement)
        return k;
    }
    return -1;
  };
}
