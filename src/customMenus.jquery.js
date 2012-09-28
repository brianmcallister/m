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

    // Set up options
    this.originalOptions = options || {};
    this.defaults = {
      classPrefix: 'm', // Pass a string to set your own, or false to have nothing.
      clickToOpen: true, // Click the title to open the dropdown list. Behaves like a regular select box.
      unicodeArrow: false // Add a little unicode arrow to the title. Pass true, or your own unicode or blank string.
    };
    this.options = $.extend(this.defaults, this.originalOptions);
    
    /**
     * Initialize.
     */
    this.initialize = function () {
      var pre = this.options.classPrefix;

      // Set up the correct class prefix.
      this.options.classPrefix = pre ? pre + '-' : '';
      
      privateApi.setElementReferences()
        .buildCustomHtml()
        .setPlaceholderText()
        .bindCustomEvents();
    };

    // Private methods.
    privateApi = {
      /**
       * Set up references to commonly used elements.
       * Handle the unicodeArrow option.
       * @private
       */
      setElementReferences: function () {
        var icon;
        
        // Reference to main element.
        plugin.$select = $(element).addClass(this.prefix('select'));
        
        plugin.$wrapper = $('<div class="' + this.prefix('select-box-wrapper') + '"></div>');
        plugin.$title = $('<span class="' + this.prefix('title') + '"></span>');
        plugin.$titleTarget = plugin.$title;
        plugin.$list = $('<ul class="' + this.prefix('list') + '"></ul>');

        if (plugin.options.unicodeArrow !== false) {
          icon = '&#x25BE;';

          // Use a string if it's passed.
          if (typeof plugin.options.unicodeArrow === 'string') {
            icon = plugin.options.unicodeArrow;
          }
          
          // Update the title to accomodate the text and the icon.
          plugin.$title.attr('class', this.prefix('title-wrap'))
            .append('<span class="' + this.prefix('title-target') + '"></span><span class="' + this.prefix('arrow-icon') + '">' + icon + '</span>');

          // Update the new target.
          plugin.$titleTarget = plugin.$title.find('.' + this.prefix('title-target'));
        }

        return this;
      },
      
      /**
       * Create the custom markup for the list.
       * @private
       */
      buildCustomHtml: function () {
        var $options = plugin.$select.find('option'),
          privateApi = this;

        // Wrap the select and update the $wrapper element.
        plugin.$select.wrap(plugin.$wrapper);
        plugin.$wrapper = plugin.$select.parent();

        // Create the list.
        $options.each(function (index, option) {
          var $option = $(option),
            val = $option.val(),
            text = $option.text(),
            li = '<li data-value="' + val + '">' + text + '</li>';

          // Add a classname for the placeholder.
          if (val === '') {
            li = li.substring(0, 4) + 'class="' + privateApi.prefix('placeholder') + '" ' + li.substring(4);
          }

          plugin.$list.append(li);
        });

        // Append the title and the list.
        plugin.$wrapper.append(plugin.$title, plugin.$list);

        return this;
      },
      
      /**
       * Can update the title with whatever is currently selected,
       * but is convenient for setting the placeholder text on initialize.
       * @private
       */
      setPlaceholderText: function () {
        this.updateTitle(this.getOptionData(this.getSelected()));
        return this;
      },
      
      /**
       * Set up custom events for handling the custom markup, and deal with
       * change events on select box.
       * @private
       */
      bindCustomEvents: function () {
        var privateApi = this;

        // Update m by clicking dropdown list items.
        plugin.$list.on('click', 'li', function (event) {
          var $target = $(event.target),
            data = privateApi.getOptionData($target);

          privateApi.updateSelect(data);
          $target.addClass('selected').siblings().removeClass('selected');
        });

        // Update m by changing the select box.
        plugin.$select.on('change', function () {
          var data = privateApi.getOptionData(privateApi.getSelected());
          privateApi.updateTitle(data);
        });

        if (plugin.options.clickToOpen) {
          this.clickToOpen();
        }

        return this;
      },

      /**
       * Show the dropdown list.
       * @private
       */
      showList: function () {
        plugin.$list.css('display', 'block');
        return this;
      },
      
      /**
       * Hide the dropdown list.
       * @private
       */
      hideList: function () {
        plugin.$list.css('display', 'none');
        return this;
      },
      
      /**
       * Bind the events that simulate regular select box behavior. Used for the
       * clickToOpen option.
       * @private
       */
      clickToOpen: function () {
        var $win = $(window),
          privateApi = this;

        plugin.$list.css('display', 'none') // You probably want this.
          // Clicking an li always closes the list.
          .on('click.m', 'li', function () {
            privateApi.hideList();
            $win.off('click.m'); // Remove this handler if it exists.
          });

        plugin.$title.on('click.m', function () {
          // Either show or hide the list.
          if (plugin.$list.css('display') !== 'block') {
            privateApi.showList();

            setTimeout(function () {
              $win.on('click.m', function (event) {
                event.preventDefault(); // This is not working?
                privateApi.hideList();
                $win.off('click.m');
              });
            }, 15);
          } else {
            privateApi.hideList();
            $win.off('click.m');
          }
        });
      },
      
      /**
       * Return a classname that includes the classPrefix option.
       * @private
       * @param {String} className Class name to prefix.
       */
      prefix: function (className) {
        return plugin.options.classPrefix + className;
      },
      
      /**
       * Return an object for updating the select box.
       * @private
       * @param {jQuery Object} $el Element to get data from.
       */
      getOptionData: function ($el) {
        return {text: $el.text(), value: $el.val() || $el.data('value')};
      },
      
      /**
       * Return the currently selected option.
       * @private
       */
      getSelected: function () {
        return plugin.$select.find(':selected');
      },
      
      /**
       * Update the title in the custom HTML.
       * @private
       * @param {Object} data Data to use for updating. Should contain a text property.
       */
      updateTitle: function (data) {
        plugin.$titleTarget.text(data.text);
        return this;
      },
      
      /**
       * Update the select box.
       * @private
       * @param {Object} data Data to use. Should contain a value property.
       */
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
      $this.trigger('change');
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