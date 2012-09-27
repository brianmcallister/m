/*jslint devel: true, browser: true, nomen: true */
/*global define */

/*

    Custom menus.
    
    jQuery plugin that replaces select boxes with custom styled
    select box form elements. See: /src/sass/modules/_custom-select.scss
    
*/
$.customSelectBox = function (el, options) {
    var plugin, methods;
    
    plugin = this;
    plugin.$el = $(el);
    
    // Default options.
    plugin.defaults = {
        
    };
    
    // Public data object for keeping track of the select box properties.
    plugin.data = {};
    
    /**
     * Initialize.
     */
    plugin.init = function () {
        // Create settings object.
        plugin.settings = $.extend({}, plugin.defaults, options);
        
        // Convert the select box into a JSON object.
        plugin.data = methods.parseContents();
          
        // Set up the HTML.         
        methods.buildCustomHtml();
        
        // Bind events.
        plugin.bindEvents();
        
        // Track the currently selected item.
        methods.setCurrentValue();
        
        methods.checkForDisabledOptions();
    };
    
    /**
     * Bind event handlers for this element.
     */
    plugin.bindEvents = function () {
        // Events for the custom select box markup.
        plugin.$parent
            // Clicking the title.
            .on('click', '.select-box-title', function (event) {
                plugin.showDropdown();
                
                // Listen for outside clicks.
                setTimeout(function () {
                    $(window).on('click.custom-select', function (event) {
                        event.preventDefault();
                        plugin.hideDropdown();
                        $(window).off('click.custom-select');
                    });
                }, 100);
            })
            // Clicking a list item.
            .on('click', 'li', function (event) {
                var $target = $(event.target),
                    data = $.extend({}, $target.data(), {content: $target.text()});
                
                plugin.$el.trigger('internalChange', [data]);
            });
            
        // Select box events.
        plugin.$el
            // Changes triggered by the plugin.
            .on('internalChange', function (event, data) {
                plugin.updateSelection(data, {internal: true});
            })
            // Changes triggered by setting the value of the select element (i.e., using jQuery#val())
            .on('change', function (event, options) {
                var $target = $(event.target),
                    data = {
                        value: plugin.$el.val(),
                        content: plugin.$el.find(':selected').text()
                    };
                
                options = options || {};
                                    
                // Block updating twice if the original update was from an internal change event.
                if (!options.internal) {
                    // Update the selection silently, because the real change event already happened.
                    plugin.updateSelection(data, {silent: true});
                }
            });
    };
    
    /**
     * Show the dropdown list.
     */
    plugin.showDropdown = function () {
        plugin.$parent.addClass('showing');
        plugin.$dropdown.show();
    };
    
    /**
     * Hide the dropdown list.
     */
    plugin.hideDropdown = function () {
        plugin.$parent.removeClass('showing');
        plugin.$dropdown.hide();
    };
    
    /**
     * Update the whole list with the selected item.
     * @param {Object} data Data from event target.
     */
    plugin.updateSelection = function (data, options) {
        var titleData = plugin.$title.data(),
            oldTitleText = plugin.$title.text(),
            $option = methods.getOptionByValue(data.value);
        
        options = options || {};
        
        // Update the title element and data.
        plugin.$title.text(data.content).attr('data-value', data.value);
        
        // TODO: Figure out a way to use the plugin.data object to make this faster?
        $option.attr('selected', 'selected').siblings().removeAttr('selected');
            
        // Update the data.
        methods.setCurrentValue(data);
        
        methods.checkForDisabledOptions();
        
        // Trigger a change event.
        if (!options.silent) {
            plugin.$el.trigger('change', options);
        }
    };
    
    // Private methods.
    methods = {
        /**
         * Check for any disabled items and return an array of corresponding values.
         */
        checkForDisabledOptions: function () {
            var $options = plugin.$el.find('option'),
                disabled = [];
            
            $options.each(function (index, el) {
                var $el = $(el),
                    $li = methods.getListItemByValue($el.val()),
                    fn = $el.is(':disabled') ? 'addClass' : 'removeClass';
                
                $li[fn]('disabled');
            });
        },
        
        /**
         * Set the currently selected option in the data.
         */
        setCurrentValue: function (data) {
            var $selected;
            
            if (data) {
                plugin.$el.data('selectedItem', data);
            } else {
                $selected = plugin.$el.find(':selected');
                plugin.$el.data({content: $selected.text(), value: $selected.val()});
            }
        },
        
        /**
         * Get the currently selected value.
         * @returns {String} The currently selected value in within data.
         */
        getCurrentValue: function () {
            return plugin.$el.data('selectedItem');
        },
        
        /**
         * Get the option el by the option's value.
         * @returns {jQuery object} The requested option element.
         */
        getOptionByValue: function (value) {
            return plugin.$el.find('option[value="' + value + '"]');
        },
        
        /**
         * Get a list item by value.
         * @returns {jQuery object} The requested list item.
         */
        getListItemByValue: function (value) {
            return plugin.$parent.find('li[data-value="' + value + '"]');
        },
        
        /**
         * Parse the contents of the $el.
         * @returns {Object} Object representing the contents of the plugin.$el
         */
        parseContents: function () {
            var $el = plugin.$el,
                $options = $el.find('option'),
                properties = {
                    atts: {},
                    options: [] // Array because items must be in order.
                };
            
            properties.atts.cls = $el.attr('class'); // TODO: split() this?
            properties.atts.name = $el.attr('name');
            
            // Add each <option> into the options array.
            if ($options.length) {
                $options.each(function (index, el) {
                    var $el = $(el);
                    properties.options.push({
                        value: $el.val(),
                        content: $el.text(),
                        selected: $el.is(':selected') ? true : false
                    });
                });
            }
                                
            return properties;
        },
        
        /**
         * Use the parsed data object to build out the custom HTML for this list.
         * @returns {Object} `methods` object.
         */
        buildCustomHtml: function () {
            // Wrap the select box and hide it.
            plugin.$el.wrap('<div class="custom-select-box-wrapper" />').hide();
            
            // Get a reference to the wrapper.
            plugin.$parent = plugin.$el.parent();
            
            // Insert the new list HTML.
            plugin.$parent.append(this.buildDropdownList());
            
            // Get a reference to the dropdown and title.
            plugin.$dropdown = plugin.$parent.find('.dropdown-list');
            plugin.$title = plugin.$parent.find('.select-box-title-text');
            
            return this;
        },
        
        /**
         * Build the dropdown list portion of the custom HTML.
         * @returns {String} HTML for the list.
         */
        buildDropdownList: function () {
            var title = '',
                list = '<ul class="dropdown-list">',
                option,
                data = plugin.data;
            
            for (option in data.options) {
                if (!data.options.hasOwnProperty(option)) { continue; }
                
                // Selected items go in as the title.
                // TODO: Hide this item from the list on the FIRST selection, but add it in after?
                // TODO: OR, just add an option to hide selected items from the dropdown list?
                if (data.options[option].selected) {
                    title = '<div class="select-box-title">';
                    title += '<span class="select-box-title-text" data-value="' + data.options[option].value + '">' + data.options[option].content + '</span>';
                    title += '<span class="arrow-icon">&blacktriangledown;</span>';
                    title += '</div>';
                }
                
                // The rest are list items.
                if (data.options[option].value !== '') {
                    list += '<li data-value="' + data.options[option].value + '">' + data.options[option].content + '</li>';
                }
            }
            
            list = title + list + '</ul>';
            return list;
        }
    };
    
    plugin.init();
};




$.fn.customSelectBox = function (options) {
  return this.each(function () {
    var $this = $(this),
      plugin;
    
      if ($this.data('customSelectBox') === undefined) {
        plugin = new $.customSelectBox(this, options);
        $this.data('customSelectBox', plugin);
      }
  });
};

// define([
//     'jquery'
// ], function ($) {
//     'use strict';
//     
//     
// });