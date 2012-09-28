/*jslint devel: true, browser: true, indent: 2, nomen: true */
/*global define, $ */

(function ($) {
  'use strict';

  var oldVal;

  /**
   * m class
   * @author Brian McAllister - http://brianmcallister.com
   * @version 0.0.1
   */
  $.m = function (element, options) {
    var plugin = this,
      privateApi = {};

    // Reference to main element.
    this.$select = $(element);

    // Set up options
    this.originalOptions = options || {};
    this.defaults = {
      clickToOpen: true, // Click the title to open the dropdown list.
      unicodeArrow: false, // Add a little unicode arrow to the title. Pass true, or your own arrow unicode.
      hideSelected: true, // Hide options in the list when they're selected.
      hidePlaceholder: true // Hide the placeholder option from the list entirely.
    };
    this.options = $.extend(this.defaults, this.originalOptions);

    /**
     * Initialize.
     */
    this.initialize = function () {
      privateApi.setElementReferences()
        .buildCustomHtml()
        .setPlaceholderText()
        .bindCustomEvents();
    };

    // Private methods.
    privateApi = {
      setElementReferences: function () {
        plugin.$wrapper = $('<div class="m-select-box-wrapper"></div>');
        plugin.$title = $('<span class="m-title"></span>');
        plugin.$list = $('<ul class="m-list"></ul>');

        return this;
      },

      buildCustomHtml: function () {
        var $options = plugin.$select.find('option');

        // Wrap the select and update the $wrapper element.
        plugin.$select.wrap(plugin.$wrapper);
        plugin.$wrapper = plugin.$select.parent();

        // Create the list.
        $options.each(function (index, option) {
          var $option = $(option);
          plugin.$list.append('<li data-value="' + $option.val() + '">' + $option.text() + '</li>');
        });

        // Append the title and the list.
        plugin.$wrapper.append(plugin.$title, plugin.$list);

        return this;
      },
      
      setPlaceholderText: function () {
        this.updateTitle(this.getOptionData(this.getSelected()));
        
        return this;
      },
      
      bindCustomEvents: function () {
        var privateApi = this;

        // Update m by clicking dropdown list items.
        plugin.$list.on('click', 'li', function (event) {
          var data = privateApi.getOptionData($(event.target));
          privateApi.updateSelect(data);
        });

        // Update m by changing the select box.
        plugin.$select.on('change.m', function () {
          var data = privateApi.getOptionData(privateApi.getSelected());
          privateApi.updateTitle(data);
        });

        return this;
      },

      getOptionData: function ($el) {
        return {text: $el.text(), value: $el.val() || $el.data('value')};
      },
      
      getSelected: function () {
        return plugin.$select.find(':selected');
      },

      updateTitle: function (data) {
        plugin.$title.attr('data-value', data.value).text(data.text);
        return this;
      },

      updateSelect: function (data) {
        plugin.$select.val(data.value);
        return this;
      }
    };

    this.initialize();
  };

  // Monkeypatch jQuery#val to fire an event on our select.
  oldVal = $.fn.val;

  $.fn.val = function (value) {
    var $this = $(this),
      newVal;

    // Call the old val() function...
    newVal = oldVal.apply(this, arguments);

    // ...fire our custom event...
    if ($this.data('m') && value) {
      $this.trigger('change.m');
    }

    // ...return the value as the old val() does.
    return newVal;
  };

  // Add the function to jQuery.
  $.fn.m = function (options) {
    return this.each(function () {
      var $this = $(this),
        menu;

      if ($this.data('m') === undefined) {
        menu = new $.m(this, options);
        $this.data('m', menu);
      }
    });
  };
}($));

// define([
//     'jquery'
// ], function ($) {
//     'use strict';
//     
//     
// });