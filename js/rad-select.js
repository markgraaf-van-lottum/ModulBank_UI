(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 *  Хелпер для Динара
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _radSelect2Js = require('./radSelect2.js');

var _radSelect2Js2 = _interopRequireDefault(_radSelect2Js);

setTimeout(initRadSelect2, 200);

exports['default'] = initRadSelect2;

function initRadSelect2() {
	$('.jsRadSelect2').each(function () {

		var $element = $(this);
		var radSelect2Options = {
			renderSelectedOption: function renderSelectedOption(o) {
				return o.html().addClass('ms-choice-multi-item');
			}
		};
		var data = $element.data();

		Object.keys(data).forEach(function (k) {
			if (k.indexOf('rd') === 0) {
				var key = k.slice(2);
				radSelect2Options[key[0].toLowerCase() + key.slice(1)] = data[k];
			}
		});

		if ($element.data('radselect2')) {
			return;
		}

		var _options = Array.prototype.map.call($element.find('.jsRadSelect2Options'), function (el) {
			return {
				selected: $(el).is('[selected]'),
				html: function html() {
					return $(el).clone();
				}
			};
		});

		var selectItem = $element.find('.jsRadSelect2SelectedItem');
		if (selectItem.length) {
			radSelect2Options.renderSelectedOption = function (o) {
				return selectItem;
			};
		}

		var multipleSelect = new _radSelect2Js2['default'](this, $.extend(radSelect2Options, {
			options: function options() {
				return _options;
			},
			renderOptionItem: function renderOptionItem(o) {
				return o.html();
			}
		}));

		multipleSelect.$selector.addClass($element.prop('class')).removeClass('jsRadSelect2');
		multipleSelect.$button.attr('disabled', $element.attr('disabled'));

		var selectedItems = _options.filter(function (o) {
			return o.selected;
		});
		multipleSelect.setSelects(selectedItems);

		$element.data('radselect2', multipleSelect);

		$element.remove();
	});
}
module.exports = exports['default'];

},{"./radSelect2.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _defaultOptions = {

	dropClassName: function dropClassName() {
		return 'ms-drop';
	},

	className: function className() {
		return 'ms-parent';
	},

	renderOptionItem: function renderOptionItem(option) {
		return this.options.getOptionText(option);
	},

	renderSelectedOption: function renderSelectedOption(option) {
		var name = this.options.getOptionText(option);
		return $('<span class="ms-choice-multi-item"><span>' + name + '</span></span>');
	},

	getOptionText: function getOptionText(option) {
		return option.name || option.label || option.text || option.id || option.value;
	},

	renderNoResultHtml: function renderNoResultHtml() {
		return 'Нет данных.';
	},

	compareOptions: function compareOptions(o1, o2) {
		return o1 === o2 || o1.id && o1.id === o2.id || o1.value && o1.value === o2.value;
	},

	fitlerLiBySearchText: function fitlerLiBySearchText($li, text) {
		text = text.toLowerCase();
		return $li.filter(function (index, li) {
			return $(li).text().toLowerCase().indexOf(text) == 0;
		});
	},

	options: function options() {
		throw 'Set options function';
	},

	searchPromt: function searchPromt() {
		var limit = this.options.maxItemsCount;
		return '<div class="ms-choice-no-result">Показаны первые ' + limit + ' элементов списка. Уточните критерии поиска, если искомый элемент отсутствует в списке.<div>';
	},

	minSearchLength: 0,
	isMultySelect: false,
	search: 'auto',
	placeholder: 'Выбрать',
	autocomplete: false,
	autocompleteAutoOpen: false,
	maxItemsCount: 50,
	openOnFocus: false
};

var _trigger = $.fn.trigger;
var _on = $.fn.on;
var prefix = 'rad-select-2';
var id = 0;
var $root = $('body');
var innerEventChanel = $({});

var BROWSER = {
	CHROME: navigator.userAgent.indexOf('Chrome') > -1,
	IE: navigator.userAgent.indexOf('MSIE') > -1,
	FIREFOX: navigator.userAgent.indexOf('Firefox') > -1,
	SAFARI: navigator.userAgent.indexOf("Safari") > -1,
	OPERA: navigator.userAgent.toLowerCase().indexOf("op") > -1
};

if (BROWSER.CHROME && BROWSER.SAFARI) {
	BROWSER.SAFARI = false;
}

if (BROWSER.CHROME && BROWSER.OPERA) {
	BROWSER.CHROME = false;
}

var KEY = {
	ESC: 27,
	TAB: 9,
	SPACE: 32,
	ENTER: 13,
	DOWN: 40,
	UP: 38
};

var transitionEndEvent = (function () {
	var transitionEndEvents = {
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'otransitionend',
		'transition': 'transitionend'
	};
	var hasOwnProperty = ({}).hasOwnProperty;
	var tempEl = document.createElement('p');
	var _name = undefined;
	var transitionEndEventName = undefined;
	for (_name in transitionEndEvents) {
		if (hasOwnProperty.call(transitionEndEvents, _name)) {
			if (typeof tempEl.style[_name] !== 'undefined') {
				transitionEndEventName = transitionEndEvents[_name];
			}
		}
	}
	return transitionEndEventName;
})();

var RadSelect2 = (function () {
	_createClass(RadSelect2, null, [{
		key: 'defaultOptions',
		value: function defaultOptions() {
			return _defaultOptions;
		}
	}, {
		key: 'normalizeEventName',
		value: function normalizeEventName() {
			for (var _len = arguments.length, eventName = Array(_len), _key = 0; _key < _len; _key++) {
				eventName[_key] = arguments[_key];
			}

			return eventName.reduce(function (events, name) {
				return events.concat(name.split(' '));
			}, []).filter(function (e) {
				return !!e;
			}).map(function (e) {
				return e + '.' + prefix;
			}).join(' ');
		}
	}]);

	function RadSelect2(element, options) {
		_classCallCheck(this, RadSelect2);

		this.$element = $(element);
		this.options = $.extend(true, {}, RadSelect2.defaultOptions(), options || {});

		if (this.options.autocomplete) {
			this.options.isMultySelect = false;
			this.options.search = false;
		}

		for (var k in this.options) {
			if (typeof this.options[k] === 'function') {
				this.options[k] = this.options[k].bind(this);
			}
		}

		this.UID = ++id;
		this.liIds = 0;
		this._selectedOptions = [];
		this._loading = 0;
		this.init();
	}

	_createClass(RadSelect2, [{
		key: 'destroy',
		value: function destroy() {
			this.trigger(RadSelect2.normalizeEventName('destroy'));

			this.$selector || this.$selector.off(prefix);
			this.$element || this.$element.off(prefix);
			$root.off(prefix);

			var innerEventChanelNamespace = 'innerEventChanelNamespace' + this.UID;
			innerEventChanel.off('opened.' + innerEventChanelNamespace);

			this.$element = null;
			this.$drop = null;
			this.$selector = null;
			this.$searchInput = null;
			this.$ulPlaceholder = null;
			this.$button = null;
			this.$focusser = null;
			this.selectedItemsPlaceholder = null;
			this.$placeholderText = null;
			this.$loader = null;
		}
	}, {
		key: 'trigger',
		value: function trigger() {
			return _trigger.apply(this.$element, arguments);
		}
	}, {
		key: 'on',
		value: function on() {
			return _on.apply(this.$element, arguments);
		}
	}, {
		key: 'init',
		value: function init() {
			this.renderSelector();
			this.events();
		}
	}, {
		key: 'events',
		value: function events() {
			var _this = this;

			var $selector = this.$selector;
			var onSearch = debounce(search.bind(this), 400);

			$selector.on(RadSelect2.normalizeEventName('input'), '.ms-search-input', function (ev) {
				onSearch();
			});

			this.on(RadSelect2.normalizeEventName('closing'), function (ev) {
				onSearch.cancel();
			});

			var openAfterClickTimer = undefined;
			if (this.options.autocomplete) {
				(function () {
					var clearInput = true; // инвертированный флаг того, что полее ввода изменили НЕ через клавиатуру
					$selector.on(RadSelect2.normalizeEventName('keydown'), '.ms-choice', function (ev) {
						clearInput = false;
					});

					$selector.on(RadSelect2.normalizeEventName('input'), '.ms-choice', function (ev) {
						if (clearInput) {
							// если изменили значение поля не вводя символы, а, например, через нажатие на крестик(очистить) у <input type="search">
							_this.clearSelections();
							lastSelectedOptions = [];
							if (openAfterClickTimer) {
								// при нажатии на крестик срабатывает событие click, обработчик которого отлежен через setTimeout. Отменяем таймаут
								clearTimeout(openAfterClickTimer);
							}
						}
						clearInput = true;
						onSearch();
					});
				})();
			} else {
				// после получения фокуса выпадайкой, нужно переключить фокус на невидимый инпут, чтобы при начале вводу сразу шел поиск
				$selector.on(RadSelect2.normalizeEventName('focus'), '.ms-choice', function (ev) {
					setTimeout(function () {
						_this.$focusser.focus();
					}, 0);
				});
			}

			if (this.options.openOnFocus) {
				$selector.on(RadSelect2.normalizeEventName('focus'), '.ms-choice-input, .ms-choice-focusser', function () {
					if (!_this.isOpen) {
						_this.open();
					}
				});
			}

			if (!this.options.autocomplete || this.options.autocompleteAutoOpen) {
				// клик на выпадайку скрывает/раскрывает выпадушку
				$selector.on(RadSelect2.normalizeEventName('click'), '.ms-choice', function (ev) {
					openAfterClickTimer = setTimeout(function () {
						_this.toggle();
						openAfterClickTimer = 0;
					}, 0);
				});
			}

			if (!this.options.isMultySelect) {
				(function () {
					var needReselect = false;
					$selector.on(RadSelect2.normalizeEventName('mousedown'), '.' + prefix + '-option', function (ev) {
						needReselect = $(ev.currentTarget).find('.input_check:checked').length > 0;
						_this.$button.focus();
					});

					$selector.on(RadSelect2.normalizeEventName('click'), '.' + prefix + '-option', function (ev) {
						if (needReselect) {
							needReselect = false;
							$(ev.currentTarget).find('.input_check:checked').trigger(RadSelect2.normalizeEventName('selected-input'));
						}
					});
				})();
			}

			// обработчик выбора элемента выпадайки
			$selector.on(RadSelect2.normalizeEventName('change', 'selected-input'), '.input_check', function (ev) {
				var $this = $(ev.target);
				var option = $this.data(prefix + '-option');

				if (!_this.options.isMultySelect) {
					_this._selectedOptions.length = 0;
				}

				var optionAllreadySelected = _this._selectedOptions.filter(function (o) {
					return _this.options.compareOptions(o, option);
				}).length > 0;

				if ($this.is(':checked')) {
					if (!optionAllreadySelected) {
						_this._selectedOptions.push(option);
					}
				} else {
					if (optionAllreadySelected) {
						_this._selectedOptions = _this._selectedOptions.filter(function (o) {
							return !_this.options.compareOptions(o, option);
						});
					}
				}

				_this.setSelects(_this._selectedOptions);

				if (!_this.options.isMultySelect) {
					_this.close();
				} else {
					_this.trigger(RadSelect2.normalizeEventName('select'), {
						items: _this._selectedOptions
					});
				}
			});

			// Обработчик клавиатуры
			$selector.on(RadSelect2.normalizeEventName('keydown'), function (ev) {
				switch (ev.which) {
					case KEY.DOWN:
					case KEY.UP:
						// навигация по стрелкам вверх/вних
						if (!_this.isOpen) {
							if (!_this.options.autocomplete || _this.options.autocompleteAutoOpen) {
								_this.open(ev.which == KEY.DOWN);
							}
						} else {
							_this.highlightItem(ev.which == KEY.DOWN);
						}
						ev.preventDefault();
						break;
					case KEY.ESC:
						// закрываем нажатии на ESC
						if (_this.isOpen) {
							_this.close();
							if (_this.options.autocomplete) {
								_this.$button.focus();
							} else {
								_this.$focusser.focus();
							}
							ev.stopPropagation();
							ev.preventDefault();
						}
						break;
					case KEY.ENTER:
						if (!_this.isOpen) {
							_this.$element.closest('form').submit();
						} else {
							toogleHighlightItem();
						}
						ev.preventDefault();
						break;
					case KEY.SPACE:
						if (_this.isOpen && _this.highlightedItem && (ev.target != _this.$button[0] && ev.target != _this.$searchInput[0])) {
							toogleHighlightItem();
							ev.preventDefault();
						}
						break;
					case KEY.TAB:
						//при нажатии таб, скрываем выпадайки и передаем фокус дальше
						if (_this.isOpen) {
							if (!_this.options.isMultySelect) {
								var seatchText = _this.getSearchText();
								if (!_this.isLoading() && _this.$selector.find('.' + prefix + '-option').length && _this.lastSearchText === seatchText) {
									_this.clearSelections();
									_this.toogleHighlightItem();
								}
							}
						}
						_this.close();
						break;
					default:
						break;
				}
			});

			var toogleHighlightItem = function toogleHighlightItem() {
				var result = _this.toogleHighlightItem();
				if (!result) {
					_this.close();
				}
				if (!_this.options.isMultySelect) _this.$button.focus();
			};

			//При вводе на невидимый инпут, открываем выпадайку и копируем введенный текст в поле для поиска
			var focusserOnInput = debounce(focusserInput.bind(this), 200);
			$selector.on(RadSelect2.normalizeEventName('input'), '.ms-choice-focusser', function (ev) {
				focusserOnInput();
			});

			var lastSelectedOptions = undefined;
			var selectedItemsChanged = isSelectedItemsChanged.bind(this);
			// наша выпадайка успешна открылась
			this.on(RadSelect2.normalizeEventName('opened'), function (ev) {
				$root.on('click.' + prefix, clickOutsideThisSelector);
				_this.$focusser.val('');

				if (!_this.options.autocomplete) {
					setTimeout(function () {
						return _this.$searchInput.focus();
					}, 10);
				}

				var searchVal = _this.$searchInput.val();
				if (searchVal && !_this.options.search) {
					_this.scrollToLiBySearchText(searchVal);
				} else {
					var selectedLi = _this.getSelectedLI();
					if (selectedLi.length) {
						_this.setHighlightItem(selectedLi);
					}
				}
				lastSelectedOptions = _this._selectedOptions.slice(0);

				innerEventChanel.trigger('opened', _this);
			});

			// обработчик клика вне выпадайки
			var clickOutsideThisSelector = clickOutsideSelector.bind(this);

			// наша выпадайка успешна закрылась
			this.on(RadSelect2.normalizeEventName('closed'), function (ev) {
				$root.off('click.' + prefix, clickOutsideThisSelector);
				_this.$searchInput.val('');
				_this.resetHighlightItem();

				if (selectedItemsChanged()) {
					_this.trigger(RadSelect2.normalizeEventName('change'), {
						items: _this._selectedOptions
					});
				}

				innerEventChanel.trigger('closed', _this);
			});

			this.on(RadSelect2.normalizeEventName('destroy'), function () {
				$root.off('click.' + prefix, clickOutsideThisSelector);
			});

			var innerEventChanelNamespace = 'innerEventChanelNamespace' + this.UID;
			//Какая то другая выпадайка открылась, нашу зкарываем
			innerEventChanel.on('opened.' + innerEventChanelNamespace, function (ev, selector) {
				if (_this.isOpen && selector !== _this) {
					_this.close();
				}
			});

			// обработчик строки поиска
			function search() {
				var seatchText = this.getSearchText();
				var searchDefer = undefined;

				if (this.options.autocomplete) {
					if (seatchText || this.options.autocompleteAutoOpen) {
						if (!this.isOpen) {
							searchDefer = this.open();
						} else {
							searchDefer = this.renderOptions();
						}
					} else {
						if (this.isOpen) {
							searchDefer = this.close();
						}
					}
				} else {
					if (!this.isOpen) {
						searchDefer = this.open();
					} else {
						searchDefer = this.renderOptions();
					}
				}
			};

			var $focusserClearTimeout = undefined;

			function focusserInput() {
				var _this2 = this;

				this.$searchInput.val(this.$focusser.val());

				if ($focusserClearTimeout) {
					clearInterval($focusserClearTimeout);
				}

				if (!this.isOpen) {
					this.open();
				}

				var searchVal = this.$searchInput.val();
				if (searchVal && !this.options.search) {
					this.scrollToLiBySearchText(searchVal);
				}

				$focusserClearTimeout = setTimeout(function () {
					$focusserClearTimeout = null;
					_this2.$focusser.val('');
				}, 1000);
			}

			// обработчик клика вне выпадайки
			function clickOutsideSelector(ev) {
				if ($(ev.target).closest('.' + this.options.className())[0] !== this.$selector[0]) {
					if (this.isOpen) {
						this.close();
					}
				}
			}

			function isSelectedItemsChanged() {
				var _this3 = this;

				lastSelectedOptions = lastSelectedOptions || [];
				var selectedOptions = this._selectedOptions || [];

				//if (this.options.autocomplete) {
				//	return !!selectedOptions.length;
				//}

				var arrayItemsIsEqual = function arrayItemsIsEqual() {
					return lastSelectedOptions.filter(function (o) {
						return selectedOptions.filter(function (selectedO) {
							return _this3.options.compareOptions(o, selectedO);
						}).length === 0;
					}).length === 0;
				};

				return lastSelectedOptions.length != selectedOptions.length || !arrayItemsIsEqual();
			}
		}

		/**
   * Прорисовка выпадайки
   */
	}, {
		key: 'renderSelector',
		value: function renderSelector() {
			var ulPlaceholderID = prefix + '-ul-placeholder-' + this.UID;
			this.$selector = $('<div class="' + this.options.className() + '" tabindex="-1"></div>');
			this.$drop = $('<div class="' + this.options.dropClassName() + '"></div>');
			this.$searchInput = $('<input type="search" autocomplete="off" autocorrect="off" autocapitilize="off" spellcheck="false"  class="ms-search-input" name="' + prefix + 'SearchInput' + this.UID + '">');

			if (this.options.search === true) {
				this.$drop.append($('<div class="ms-search">').append(this.$searchInput));
			}

			this.$drop.append('<div class=\'ms-drop-inner\' id="' + ulPlaceholderID + '"></div>');
			this.$ulPlaceholder = this.$drop.find('#' + ulPlaceholderID);
			this.$placeholderText = this.generatePlaceholder();
			this.selectedItemsPlaceholder = $('<span style="display: none;">');
			this.$focusser = $('<input type="search" class="ms-choice-focusser">');
			this.$loader = $('<div class="loading"><div></div></div>');

			var $html = [];

			if (this.options.autocomplete) {
				this.$button = $('<input type="search" class="ms-choice ms-choice-input" placeholder="' + this.options.placeholder + '">');
			} else {
				var tabIndex = BROWSER.SAFARI ? '' : 'tabindex="-1"';
				this.$button = $('<button type="button" class="ms-choice" ' + tabIndex + '>');
				this.$placeholderText.appendTo(this.$button);
				this.selectedItemsPlaceholder.appendTo(this.$button);
				$html.push(this.$focusser);
			}

			if (this.options.name) {
				this.$selector.attr('name', this.options.name);
			}

			this.$selector.append($html.concat([this.$button, this.$drop]));
			this.$selector.insertAfter(this.$element);
		}

		/**
   * Возвращает елемент, который выделяется при валидации
   */
	}, {
		key: 'getInputElement',
		value: function getInputElement() {
			var elements = $();

			if (!this.options.autocomplete) {
				elements = elements.add(this.$focusser);
			}

			elements = elements.add(this.$button);

			if (this.options.search === true) {
				elements = elements.add(this.$searchInput);
			}

			return elements;
		}

		/**
   * В фокусе ли в данный момент выпадайка
   */
	}, {
		key: 'inFocus',
		value: function inFocus() {
			return this.isOpen || this.$focusser.is(':focus') || this.$button.is(':focus') || this.$searchInput.is(':focus');
		}
	}, {
		key: 'getSearchText',
		value: function getSearchText() {
			var str = this.options.autocomplete ? this.$button.val() : this.options.search ? this.$searchInput.val() : '';
			return str.length >= this.options.minSearchLength ? str : '';
		}

		/**
   * Прорисовка выпадющей части выпадайки. Отображение элементов выбора
   * @returns {Promise}
   */
	}, {
		key: 'renderOptions',
		value: function renderOptions() {
			var _this4 = this;

			var toDown = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

			this._loading++;

			var seatchText = this.getSearchText();
			this.lastSearchText = seatchText;

			var showLoaderTimeout = setTimeout(function () {
				_this4.showLoader();
			}, 400);

			var renderDefer = $.Deferred(function (d) {
				promisify(_this4.options.options(seatchText)).then(d.resolve, d.reject);
			});

			if (this.renderDefer) {
				this.renderDefer.reject({
					renderingNoActualData: true
				});
			}

			this.renderDefer = renderDefer;
			var needRenderNeedSearchPromt = false;
			return renderDefer.then(function (options) {
				if (options === false) {
					return $.Deferred().reject();
				}
				return options;
			}).then(function (options) {
				return Array.isArray(options) ? options : options && [options] || [];
			}).then(function (options) {
				if (options.length > _this4.options.maxItemsCount) {
					needRenderNeedSearchPromt = true;
					return options.slice(0, _this4.options.maxItemsCount);
				}
				return options;
			}).always(function (reason) {
				_this4.resetHighlightItem();
			}).then(function (options) {
				if (!options.length) {
					return _this4.getNoResultHtml().then(function ($noResult) {
						_this4.$ulPlaceholder.empty();
						$noResult.appendTo(_this4.$ulPlaceholder);
					});
				} else {
					return _this4.genereateUL(options).then(function () {
						for (var _len2 = arguments.length, $html = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
							$html[_key2] = arguments[_key2];
						}

						_this4.$ulPlaceholder.empty();
						_this4.$ulPlaceholder.append($html);
						if (needRenderNeedSearchPromt) {
							return promisify(_this4.options.searchPromt.call(_this4)).then(function ($html) {
								_this4.$ulPlaceholder.append($html);
								if (_this4.options.search === 'auto' && !_this4.$drop.find('.ms-search').length) {
									_this4.$drop.prepend($('<div class="ms-search">').append(_this4.$searchInput));
								}
							});
						}
					});
				}
			}).then(function () {
				_this4.highlightItem(toDown);
			}).always(function (reason) {
				clearInterval(showLoaderTimeout);
				if (!renderingNoActualData(reason)) {
					_this4.hideLoader();
				}
			}).fail(function (reason) {
				if (!renderingNoActualData(reason)) {
					_this4.close();
				}

				return $.Deferred().reject();
			}).always(function () {
				_this4._loading--;
				_this4.renderDefer = null;
			});

			function renderingNoActualData(reason) {
				return reason && reason.renderingNoActualData;
			}
		}
	}, {
		key: 'isLoading',
		value: function isLoading() {
			return !!this._loading;
		}

		/**
   * Получение шаблона для кейса когда выпадайка пустая
   * @returns {Promise(jqueryObj)}
   */
	}, {
		key: 'getNoResultHtml',
		value: function getNoResultHtml() {
			return promisify(this.options.renderNoResultHtml()).then(function ($html) {
				return $('<div class="ms-choice-no-result">').html($html);
			});
		}

		/**
   * Получание выбранных элементов выпадайки
   * @returns {Array}
   */
	}, {
		key: 'getSelectedOptions',
		value: function getSelectedOptions() {
			var _selectedOptions = this._selectedOptions;
			return _selectedOptions.length ? _selectedOptions : this.getSelectedOptionsFromLI();
		}

		/**
   * Получание выбранных элементов выпадайки по выбранным LI элементам
   * @returns {Array}
   */
	}, {
		key: 'getSelectedOptionsFromLI',
		value: function getSelectedOptionsFromLI() {
			return Array.prototype.map.call(this.getSelectedLI(), function (el) {
				return $(el).data(prefix + '-option');
			});
		}

		/**
   * Получание выбранных LI элементов
   * @returns {jqueryObj}
   */
	}, {
		key: 'getSelectedLI',
		value: function getSelectedLI() {
			return this.$ulPlaceholder.find('.input_check:checked').closest('.' + prefix + '-option');
		}

		/**
   * Прорисовка выбранных элементов
   * @returns {Promise}
   */
	}, {
		key: 'renderSelectedOption',
		value: function renderSelectedOption() {
			var _this5 = this;

			var selectedOptions = this._selectedOptions.map(function (op) {
				return _this5.options.renderSelectedOption(op);
			});

			return $.when.apply($, selectedOptions).then((function () {
				var _this6 = this;

				for (var _len3 = arguments.length, $selectedOptions = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
					$selectedOptions[_key3] = arguments[_key3];
				}

				if (this.options.autocomplete) {
					this.$button.val($.trim($($selectedOptions).text()));
				} else {
					(function () {
						var $span = _this6.selectedItemsPlaceholder;
						$span.empty();
						if ($selectedOptions.length) {
							_this6.$placeholderText.hide();
							$selectedOptions.forEach(function ($item) {
								return $span.append($item);
							});
							$span.show();
						} else {
							_this6.$placeholderText.show();
							$span.hide();
						}
					})();
				}
			}).bind(this));
		}

		/**
   * Выделяем выбранные LI элементов
   */
	}, {
		key: 'highlightSelectedItems',
		value: function highlightSelectedItems() {
			this.$ulPlaceholder.find('.' + prefix + '-option').removeClass('selected');

			this.getSelectedLI().addClass('selected');
		}
	}, {
		key: 'generatePlaceholder',
		value: function generatePlaceholder() {
			return $('<span class="placeholder">' + this.options.placeholder + '</span>');
		}

		/**
   * Генерация выпадающей части выпадайки
   * @param options (Array)
   * @returns {Promise}
   */
	}, {
		key: 'genereateUL',
		value: function genereateUL(options) {
			var _this7 = this;

			return $.when.apply($, this.groupOptions(options).map(function (group) {
				var groupName = group.name;
				var defers = asyncMap(group.options, _this7.genereateLI.bind(_this7));
				return defers.then(function ($liItems) {
					return $.when.apply($, $liItems).then((function () {
						var $html = [];
						if (groupName) {
							$html.push($('<div class="ms-group-title">' + groupName + '</div>'));
						}
						var $ul = $('<ul>');

						for (var _len4 = arguments.length, $liItems = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
							$liItems[_key4] = arguments[_key4];
						}

						$ul.append($liItems);
						$html.push($ul);
						return $html;
					}).bind(this));
				});
			})).then(function () {
				for (var _len5 = arguments.length, $grops = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
					$grops[_key5] = arguments[_key5];
				}

				var $html = $('<div>');
				var append = $html.append.bind($html);
				$grops.forEach(function (gr) {
					return append.apply(null, gr);
				});
				return $html.children();
			});
		}

		/**
   * Группируем опции
   * @param options
   * @returns {Array}
   */
	}, {
		key: 'groupOptions',
		value: function groupOptions(options) {
			return options.reduce(function (groups, o) {
				var group = findOrAddGroup(groups, o);
				group.options.push(o);
				return groups;
			}, []).sort(function (a, b) {
				return +(a.order > b.order) || +(a.order === b.order) - 1;
			});

			function findOrAddGroup(groups, o) {
				var group = groups.filter(function (g) {
					return g.name == o.group;
				})[0];
				if (!group) {
					group = {
						name: o.group,
						options: [],
						order: o.groupOrder || o.grop
					};
					groups.push(group);
				}
				return group;
			}
		}

		/**
   * Генерация LI-шек для выпадающей части выпадайки
   * @param option
   * @returns {Promise}
   */
	}, {
		key: 'genereateLI',
		value: function genereateLI(option) {
			var _this8 = this;

			return $.Deferred(function (d) {

				var id = ++_this8.liIds;
				var liID = prefix + '-li-' + _this8.UID + '-' + id;
				var liInputID = prefix + '-li-input-' + _this8.UID + '-' + id;
				var liPlaceholderID = prefix + '-li-placeholder-' + _this8.UID + '-' + id;
				var inputType = _this8.options.isMultySelect ? 'checkbox' : 'radio';
				var inputName = prefix + 'inputs-' + _this8.UID;
				var selectedOptions = _this8.getSelectedOptions();
				var optionsIsSelected = selectedOptions.filter(function (o) {
					return _this8.options.compareOptions(o, option);
				}).length > 0;

				var html = [];

				html.push('<li id="' + liID + '" tabindex="-1" class="' + prefix + '-option ' + (optionsIsSelected ? 'selected' : '') + '">');
				html.push('<input class="input_check" name="' + inputName + '" id="' + liInputID + '" type="' + inputType + '" ' + (optionsIsSelected ? 'checked' : '') + ' >');
				html.push('<label for="' + liInputID + '" class="label_check">');
				html.push('<i class="icon"></i>');
				html.push('<span id="' + liPlaceholderID + '"><span>');
				html.push('</label>');
				html.push('</li>');

				promisify(_this8.options.renderOptionItem(option)).then(function (item) {
					var $html = $(html.join(''));
					$html.data(prefix + '-option', option);
					$html.find('#' + liPlaceholderID).html(item);
					$html.find('.input_check').data(prefix + '-option', option);
					return $html;
				}).then(d.resolve, d.reject);
			}, 0);
		}

		/**
   * Выдиление элемента при навигации по стрелкам вверх/вниз
   * @param toDown
   */
	}, {
		key: 'highlightItem',
		value: function highlightItem(toDown) {
			var highlightedItem = this.highlightedItem;
			var fisrtSelector = ':visible' + (toDown ? ':first' : ':last');
			var $allLi = this.$ulPlaceholder.find('.' + prefix + '-option:visible');

			if (!highlightedItem) {
				highlightedItem = $allLi.filter(fisrtSelector);
			} else {
				highlightedItem = highlightedItem.next($allLi, toDown);
				if (!highlightedItem || !highlightedItem.length) {
					highlightedItem = this.$ulPlaceholder.find('.' + prefix + '-option').filter(fisrtSelector);
				}
			}
			if (highlightedItem.length) {
				this.setHighlightItem(highlightedItem, toDown);
			}
		}

		/**
   * Уcтановка выделенного элемента при навигации по стрелкам вверх/вниз
   * @param highlightedItem
   * @param toDown
   */
	}, {
		key: 'setHighlightItem',
		value: function setHighlightItem(highlightedItem) {
			var toDown = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

			this.resetHighlightItem();
			var that = this;
			var highlightedObj = {
				item: highlightedItem,
				input: highlightedItem.find('input'),
				reset: function reset() {
					highlightedItem.removeClass('highlight');
				},
				init: function init() {
					highlightedItem.addClass('highlight');
					that.scrollToLi(highlightedItem, !toDown);
				},
				select: function select() {
					highlightedObj.input.prop('checked', !highlightedObj.input.prop('checked'));
				},
				next: function next($allLi, toDown) {
					var index = $allLi.index(highlightedItem);
					index = index + (toDown ? 1 : -1);
					return $allLi.eq(index);
				},
				toogleSelection: function toogleSelection() {
					highlightedObj.input.prop("checked", !highlightedObj.input.prop("checked"));
					highlightedObj.input.trigger(RadSelect2.normalizeEventName('selected-input'));
				},
				isSelected: function isSelected() {
					return !!highlightedObj.input.prop("checked");
				}
			};

			highlightedObj.init();
			this.highlightedItem = highlightedObj;
		}

		/**
   * Обнуление выделенного элемента при навигации по стрелкам вверх/вниз
   */
	}, {
		key: 'resetHighlightItem',
		value: function resetHighlightItem() {
			if (this.highlightedItem) {
				this.highlightedItem.reset();
				this.highlightedItem = null;
			}
		}

		/**
   * Выбор или отмена выбора текущего (на котором остановились при навигации по стрелкам) элемента
   */
	}, {
		key: 'toogleHighlightItem',
		value: function toogleHighlightItem() {
			if (this.highlightedItem) {
				if (this.options.isMultySelect) {
					this.highlightedItem.toogleSelection();
					return true;
				}

				if (!this.highlightedItem.isSelected()) {
					this.highlightedItem.toogleSelection();
					return true;
				}
			}
			return false;
		}

		/**
   * Открыть/Закрыть выпадайку
   * @returns {*}
   */
	}, {
		key: 'toggle',
		value: function toggle() {
			return this.isOpen ? this.close() : this.open();
		}
	}, {
		key: 'showLoader',
		value: function showLoader() {
			if (this.$ulPlaceholder.children().length == 0) {
				this.$ulPlaceholder.append(this.$loader);
			} else {
				this.$ulPlaceholder.addClass("loading_block");
			}
		}
	}, {
		key: 'hideLoader',
		value: function hideLoader() {
			this.$loader.remove();
			this.$ulPlaceholder.removeClass("loading_block");
		}
	}, {
		key: 'open',
		value: function open() {
			var _this9 = this;

			var toDown = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

			if (this.openDefer) {
				return this.openDefer;
			}

			var renderDefer = $.Deferred(function (defer) {
				_this9.$drop.one(transitionEndEvent, transitionOnEndEvent.bind(_this9));

				function transitionOnEndEvent() {
					defer.resolve();
				}
			});

			this.$selector.addClass('open');
			this.$drop.show();

			var openDefer = this.openDefer = this.renderOptions(toDown);

			return openDefer.then(function () {
				_this9.$drop.removeClass('right');
				_this9.$drop.removeClass('bottom');

				var dropOffset = _this9.$drop.offset();
				var outerWidth = _this9.$drop.outerWidth();
				var outerHeight = _this9.$drop.outerHeight();
				var windowWidth = $(window).width();
				var windowHeight = $(window).height();

				if (dropOffset.left + outerWidth >= windowWidth) {
					_this9.$drop.addClass('right');
				} else {
					_this9.$drop.removeClass('right');
				}

				if (dropOffset.top + outerHeight >= windowHeight) {
					_this9.$drop.addClass('bottom');
				} else {
					_this9.$drop.removeClass('bottom');
				}

				return renderDefer;
			}).then(function () {
				_this9.isOpen = true;
				_this9.trigger(RadSelect2.normalizeEventName('opened'));
			}).always(function () {
				_this9.openDefer = null;
			});
		}
	}, {
		key: 'close',
		value: function close() {
			if (this.closeDefer) {
				return this.closeDefer;
			}
			this.trigger(RadSelect2.normalizeEventName('closing'));
			this.closeDefer = $.Deferred();

			var onClosed = transitionOnEndEvent.bind(this);
			var closeTimeot = setTimeout(onClosed, 300);
			this.$drop.on(transitionEndEvent, onClosed);

			this.$selector.removeClass('open');
			this.$drop.hide();

			return this.closeDefer;

			function transitionOnEndEvent() {
				clearTimeout(closeTimeot);
				if (!this.$drop) {
					return;
				}

				this.$drop.off(transitionEndEvent, onClosed);

				this.closeDefer.resolve();

				if (this.isOpen) {
					this.isOpen = false;
					this.trigger(RadSelect2.normalizeEventName('closed'));
				}

				this.closeDefer = null;
			}
		}
	}, {
		key: 'clearSelections',
		value: function clearSelections() {
			this.setSelects([]);
		}
	}, {
		key: 'setSelects',
		value: function setSelects(items) {
			var _this10 = this;

			this._selectedOptions = items || [];
			this._selectedOptions = Array.isArray(this._selectedOptions) ? this._selectedOptions : [this._selectedOptions];
			this.renderSelectedOption();
			if (this.isOpen) {

				var all = this.$ulPlaceholder.find('.input_check');

				all.prop('checked', false);

				var x = all.filter(function (i, item) {
					return _this10._selectedOptions.filter(function (o) {
						return _this10.options.compareOptions(o, $(item).data(prefix + '-option'));
					}).length > 0;
				});

				x.prop('checked', true);

				this.highlightSelectedItems();
			}
		}
	}, {
		key: 'scrollToLiBySearchText',
		value: function scrollToLiBySearchText(text) {
			this.scrollToLi(this.options.fitlerLiBySearchText(this.$ulPlaceholder.find('.' + prefix + '-option'), text));
		}
	}, {
		key: 'scrollToLi',
		value: function scrollToLi($li) {
			var alignToTop = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

			if ($li.length && !this.isScrolledIntoView($li)) {
				var position = $li.position(),
				    parentPosition = this.$ulPlaceholder.position(),
				    elementTop = position.top + parentPosition.top,
				    viewPort = this.$drop;

				var diff = elementTop + $li.outerHeight() - viewPort.height();
				viewPort[0].scrollTop = alignToTop ? viewPort[0].scrollTop + diff + viewPort.height() - $li.outerHeight() : viewPort[0].scrollTop + diff;
			}
		}
	}, {
		key: 'isScrolledIntoView',
		value: function isScrolledIntoView($li) {
			var position = $li.position(),
			    parentPosition = this.$ulPlaceholder.position(),
			    elementTop = position.top + parentPosition.top,
			    scrollableViewPort = this.$drop;

			return elementTop >= 0 && elementTop + $li.outerHeight() <= scrollableViewPort.height();
		}
	}]);

	return RadSelect2;
})();

function promisify(obj) {
	return $.when(obj);
}

function printableChar(keycode) {
	return keycode > 47 && keycode < 58 || // number keys
	keycode == 32 || keycode == 13 || // spacebar & return key(s) (if you want to allow carriage returns)
	keycode > 64 && keycode < 91 || // letter keys
	keycode > 95 && keycode < 112 || // numpad keys
	keycode > 185 && keycode < 193 || // ;=,-./` (in order)
	keycode > 218 && keycode < 223; // [\]' (in order)
}

function debounce(fn, delay) {
	var timer = null;
	var debouncedFn = function debouncedFn() {
		var context = this,
		    args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function () {
			fn.apply(context, args);
		}, delay);
	};

	debouncedFn.cancel = function () {
		clearTimeout(timer);
	};

	return debouncedFn;
};

function asyncMap(array, fn) {
	return $.Deferred(map);

	function map(defer) {
		var length = array.length;
		var lastIndex = length - 1;
		var i = -1;
		var result = [];

		forEach();

		function forEach() {
			i = ++i;
			if (i > lastIndex) {
				return defer.resolve(result);
			}
			setTimeout(function () {
				result.push(fn(array[i]));
				forEach();
			}, 0);
		}
	}
}

exports['default'] = RadSelect2;
module.exports = exports['default'];

},{}]},{},[1]);
