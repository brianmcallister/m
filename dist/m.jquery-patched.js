/*jslint browser: true, indent: 2, maxlen: 80, nomen: true, plusplus: true */
/*global define, $ */

(function ($, window, document) {
  'use strict';

  var M,
    defaults;

  // Private: Default options.
  defaults = {
    // Pass a string to set your own, or false to have nothing.
    classPrefix: 'm',
    // Pass a string to set a class on the wrapper element. Useful for
    // custom themes.
    wrapperClass: null,
    // Click the title to open the dropdown list. Behaves like a regular
    // select box.
    clickToOpen: true,
    // Add a unicode arrow icon. Pass true, or your own unicode or even
    // blank string.
    arrowString: true
  };

  /**
   * m: A super-simple way to style select elements.
   *
   * $element - A select box element to style with m.
   * config   - An object of configuration options. Defaults to `defaults`.
   *
   * Examples
   *
   *   $('select').m();
   *
   * Returns this.
   */
  M = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, defaults, options);

    // Set up the correct class prefix.
    this.options.classPrefix = this.options.classPrefix ?
        this.options.classPrefix + '-' : '';

    // Initialization methods.
    this.setElementReferences()
      .buildCustomHtml()
      .setPlaceholderText()
      .bindCustomEvents();

    return this;
  };

  M.prototype = {
    /**
     * Private: Prefix a string with the classPrefix property of the
     * options object.
     *
     * string - String to prefix.
     *
     * Returns the prefixed string.
     */
    prefix: function (string) {
      return this.options.classPrefix + string;
    },

    /**
     * Show the custom dropdown.
     *
     * Returns this.
     */
    showList: function () {
      this.options.$list.css('display', 'block');
      return this;
    },

    /**
     * Hide the custom dropdown.
     *
     * Returns this.
     */
    hideList: function () {
      this.options.$list.css('display', 'none');
      return this;
    },

    /**
     * Private: Get the data from the custom dropdown that matches the
     * select value.
     *
     * Returns the data.
     */
    getOptionData: function ($el) {
      return {text: $el.text(), value: $el.val() || $el.data('value')};
    },

    /**
     * Private: Update the title with the initial placeholder text.
     *
     * Returns this.
     */
    setPlaceholderText: function () {
      this.updateTitle(this.getOptionData(this.getSelected()));
      return this;
    },

    /**
     * Private: Update the custom dropdown title.
     * TODO - combine this with updateSelect.
     *
     * Returns this.
     */
    updateTitle: function (data) {
      this.options.$titleTarget.text(data.text);
      return this;
    },

    /**
     * Private: Update the select box's value. Use the patched jQuery#val
     * if available.
     *
     * data - Data to update.
     *        value - Value to assign to the select box.
     *
     * Returns this.
     */
    updateSelect: function (data) {
      this.options.$select.val(data.value);

      // Check for a patched val. Fire a 'change' event if it isn't
      if (!this.options.$select.data('m').patchedVal) {
        this.options.$select.trigger('change');
      }

      return this;
    },

    /**
     * Private: Set internal references to DOM elements that make up the
     * list replacing the select box. Uses the options object to keep
     * track of elements.
     *
     * Returns this.
     */
    setElementReferences: function () {
      var icon;

      // Reference to main element, with the prefixed classname.
      this.options.$select = this.$element.addClass(this.prefix('select'));

      // References to other common elements.
      $.extend(this.options, {
        $wrapper: $('<div />', {'class': this.prefix('select-box-wrapper')}),
        $title: $('<span />', {'class': this.prefix('title')}),
        $titleTarget: this.options.$title,
        $list: $('<ul />', {'class': this.prefix('list')})
      });

      if (this.options.arrowString !== false) {
        icon = '&#x25BE;';

        // Use a string if it's passed.
        if (typeof this.options.arrowString === 'string') {
          icon = this.options.arrowString;
        }

        // Update the title to accomodate the text and the icon.
        this.options.$title.attr('class', this.prefix('title-wrap')).append(
          '<span class="' + this.prefix('title-target') + '"></span>' +
            '<span class="' + this.prefix('arrow-icon') + '">' + icon +
            '</span>'
        );

        // Update the new target.
        this.options.$titleTarget = this.options.$title.find('.' +
          this.prefix('title-target'));
      }

      return this;
    },

    /**
     * Private: Build the HTML structure for the custom select and add
     * to the DOM.
     *
     * Returns this.
     */
    buildCustomHtml: function () {
      var $options = this.options.$select.find('option');

      // Wrap the select and update the $wrapper element.
      this.options.$select.wrap(this.options.$wrapper);
      this.options.$wrapper = this.options.$select.parent();

      // Add the wrapper class.
      if (this.options.wrapperClass) {
        this.options.$wrapper.addClass(this.prefix(this.options.wrapperClass));
      }

      // Create the list.
      $options.each($.proxy(function (index, option) {
        var $option = $(option),
          val = $option.val(),
          text = $option.text(),
          li = '<li data-value="' + val + '">' + text + '</li>';

        // Add a classname for the placeholder.
        if (val === '') {
          li = li.slice(0, 4) + 'class="' + this.prefix('placeholder') + '"' +
            li.slice(4);
        }

        this.options.$list.append(li);
      }, this));

      // Append the title and the list.
      this.options.$wrapper.append(this.options.$title, this.options.$list);

      return this;
    },

    /**
     * Private: Bind events for the elements in the custom dropdown list.
     *
     * Returns this.
     */
    bindCustomEvents: function () {
      // Update m by clicking dropdown list items.
      this.options.$list.on('click', 'li', $.proxy(function (event) {
        var $target = $(event.target),
          data = this.getOptionData($target);

        this.updateSelect(data);
        $target.addClass('selected').siblings().removeClass('selected');
      }, this));

      // Update m by changing the select box.
      this.options.$select.on('change', $.proxy(this.setPlaceholderText, this));

      if (this.options.clickToOpen) {
        this.clickToOpen();
      }

      return this;
    },

    /**
     * Private: Get the selected option in the select box.
     *
     * Returns the selected item.
     */
    getSelected: function () {
      return this.options.$select.find(':selected');
    },

    /**
     * Private: Bind extra events to simulate the default click
     * behavior of standard browser select boxes.
     *
     * Returns this.
     */
    clickToOpen: function () {
      var $win = $(window),
        api = this;

      this.options.$list.css('display', 'none') // You probably want this.
        // Clicking an li always closes the list.
        .on('click.m', 'li', function () {
          api.hideList();
          $win.off('click.m'); // Remove this handler if it exists.
        });

      this.options.$title.on('click.m', $.proxy(function () {
        // Either show or hide the list.
        if (this.options.$list.css('display') !== 'block') {
          this.showList();

          setTimeout(function () {
            $win.on('click.m', function (event) {
              event.preventDefault(); // This is not working?
              api.hideList();
              $win.off('click.m');
            });
          }, 15);
        } else {
          this.hideList();
          $win.off('click.m');
        }
      }, this));

      return this;
    }
  };

  /**
   * Identity function.
   *
   * Returns the MClass.
   */
  function identity() {
    return M;
  }

  // Add function to jQuery.
  $.m = identity();

  // Create a new plugin object.
  $.fn.m = function (options) {
    return this.each(function () {
      var $this = $(this),
        menu;

      if (!$this.data('m')) {
        menu = new $.m($this, options);
        $this.data('m', menu);
      }
    });
  };
}(window.jQuery, window, document));
/*jslint browser: true, indent: 2, maxlen: 80, nomen: true, plusplus: true */
/*global $ */

(function ($) {
  'use strict';

  // Monkeypatch jQuery#val to fire an event on our select.
  var oldVal = $.fn.val;

  $.fn.val = function (value) {
    var $this = $(this),
      elData = $this.data('m'),
      newVal;

    // Call the old val() function...
    newVal = oldVal.apply(this, arguments);

    // ...fire our custom event...
    if (elData && value) {
      elData.patchedVal = true;
      $this.data('m', elData);
      $this.trigger('change');
    }

    // ...return the value as the old val() does.
    return newVal;
  };
}($));