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