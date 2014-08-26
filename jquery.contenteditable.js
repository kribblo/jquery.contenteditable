(function (factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
}(function ($) {
		'use strict';

		var ENTER_KEY_CODE = 13;
		var CONTENT_EDITABLE_INIT = 'contenteditable.init';
		var CONTENT_EDITABLE_ORIGINAL = 'contenteditable.original';
		var CONTENT_EDITABLE_BEFORE = 'contenteditable.before';
		var CONTENT_EDITABLE_OPTIONS = 'contenteditable.options';

		$.fn.contenteditable = function (options) {
			if (this.data(CONTENT_EDITABLE_INIT)) {
				return this;
			}

			var defaults = {
				trim: false
			};

			options = $.extend(defaults, options);

			return this.each(function () {
				var $editable = $(this);
				$editable.data(CONTENT_EDITABLE_INIT, true);
				$editable.data(CONTENT_EDITABLE_OPTIONS, options);
				$editable.data(CONTENT_EDITABLE_ORIGINAL, $editable.html());

				$editable.prop('contenteditable', true);
				saveBefore($editable);

				$editable.on('focus', function () {
					var $editable = $(this);
					saveBefore($editable);
					return $editable;
				});

				$editable.on('blur keyup paste input', function () {
					var $editable = $(this);
					if ($editable.data(CONTENT_EDITABLE_BEFORE) !== $editable.html()) {
						if (options.trim) {
							$editable.html($.trim($editable.html()));
						}
						var after = $editable.html();

						$editable.data(CONTENT_EDITABLE_BEFORE, after);
						$editable.trigger('change', after);
					}
					return $editable;
				});

				$editable.on('keydown', preventWebKitDivs);
			});
		};

		// val(value) also sets the original 'reset to-value'
		var originalVal = $.fn.val;
		$.fn.val = function (value) {
			var isEditable = this.data(CONTENT_EDITABLE_INIT);
			if (isEditable) {
				if (arguments.length === 1) {
					this.data(CONTENT_EDITABLE_ORIGINAL, value);
					return this.html(value);
				}
				return this.html();
			}
			return originalVal.apply(this, arguments);
		};

		var originalReset = $.fn.reset;
		$.fn.reset = function () {
			var isEditable = this.data(CONTENT_EDITABLE_INIT);
			if (isEditable) {
				return this.each(function () {
					var $editable = $(this);

					var originalValue = $editable.data(CONTENT_EDITABLE_ORIGINAL);
					$editable.html(originalValue);
					$editable.data(CONTENT_EDITABLE_BEFORE, originalValue);
				});
			} else if (originalReset) {
				return originalReset.apply(this, arguments);
			}
		};

		function saveBefore($editable) {
			return $editable.data('contenteditable.before', $editable.html());
		}

		// WebKit (and others?) insert a <div>, we want a <br> always
		function preventWebKitDivs(e) {
			if (e.keyCode === ENTER_KEY_CODE) {
				var selection = window.getSelection();
				var range = selection.getRangeAt(0);
				var br = document.createElement('br');

				range.deleteContents();
				range.insertNode(br);
				range.setStartAfter(br);
				range.setEndAfter(br);

				selection.removeAllRanges();
				selection.addRange(range);

				return false;
			}
			return true;
		}

	}
))
;
