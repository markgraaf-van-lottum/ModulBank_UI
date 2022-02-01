/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @version 1.1.0
 *
 * http://wenzhixin.net.cn/p/multiple-select/
 */

(function ($) {

    'use strict';

    var privateEventChanel = $({});

    var KEY = {
        ESC: 27,
        TAB: 9,
        SPACE: 32,
        ENTER: 13,
        DOWN: 40,
        UP: 38
    };

    function eventName(name) {
        return name + '.multipleselect';
    }

    function normalizeOption(opt) {
        if (Array.isArray(opt)) {
            return opt.filter(function (o) {
                return !!o
            }).map(normalize);
        } else {
            return normalize(opt);
        }

        function normalize(opt) {
            var value = opt.id || opt.value || opt.name || opt.text;
            return {
                id: value,
                name: opt.text || opt.name || value
            }
        }
    }

    function arrayify(val) {
        return Array.isArray(val) ? val : [val];
    }

    $('body').click(function (e) {
        privateEventChanel.trigger(eventName('click.body'), e)
    });

    function MultipleSelect($el, options) {
        var that = this,
            name = $el.attr('name') || options.name || '';

        $el.parent().hide();
        var elWidth = $el.css("width");

        $el.parent().show();
        if (elWidth == "0px") {
            elWidth = $el.outerWidth() + 20;
        }

        this.$el = $el.hide();
        this.options = options;

        this.$parent = $('<div' + ['class', 'title'].map(function (att) {
                var attValue = that.$el.attr(att) || '';
                attValue = (att === 'class' ? ('ms-parent' + (attValue ? ' ' : '')) : '') + attValue;
                return attValue ? (' ' + att + '="' + attValue + '"') : '';
            }).join('') + ' />');

        this.$choice = $('<button type="button" class="ms-choice" name="' + name + '"><span class="placeholder">' +
            options.placeholder + '</span></button>');

        this.$drop = $('<div class="ms-drop ' + options.position + '"></div>');

        this.$el.after(this.$parent);
        this.$parent.append(this.$choice);
        this.$parent.append(this.$drop);

        if (this.$el.prop('disabled')) {
            this.$choice.addClass('disabled');
        }

        //this.$parent.css('width', options.width || elWidth);

        if (!this.options.keepOpen) {
            privateEventChanel.on(eventName('click.body'), onBodyClick);

            this.$el.one(eventName('destroy'), function () {
                privateEventChanel.off(eventName('click.body'), onBodyClick);
            });
        }

        this.selectAllName = 'name="selectAll' + name + '"';
        this.selectGroupName = 'name="selectGroup' + name + '"';
        this.selectItemName = 'name="selectItem' + name + '"';

        function onBodyClick(event, e) {
            if ($(e.target)[0] === that.$choice[0] ||
                $(e.target).parents('.ms-choice')[0] === that.$choice[0]) {
                return;
            }
            if (e.target.tagName.toUpperCase() === "INPUT" &&
                ($(e.target)[0] === that.$drop[0] ||
                $(e.target).parents('.ms-drop')[0] !== that.$drop[0]) &&
                that.options.isOpen) {
                that.close();
            }
        }
    }

    MultipleSelect.prototype = {
        constructor: MultipleSelect,

        visible: function (val) {
            if (arguments.length === 0 || val === undefined) {
                return this.$parent.is(':visible');
            } else {
                this.$parent[vav ? 'show' : 'hide']();
            }
        },

        init: function () {
            var that = this,
                html = [];

            if (this.options.filter) {
                html.push(
                    '<div class="ms-search">',
                    '<input type="text" autocomplete="off" autocorrect="off" autocapitilize="off" spellcheck="false">',
                    '</div>'
                );
            }

            html.push('<ul>');

            if (this.options.selectAll && !this.options.single) {
                html.push(
                    '<li class="ms-select-all">',
                    '<label>',
                    '<input type="checkbox" ' + this.selectAllName + ' /> ',
                    this.options.selectAllDelimiter[0] + this.options.selectAllText + this.options.selectAllDelimiter[1],
                    '</label>',
                    '</li>'
                );
            }

            $.each(this.$el.children(), function (i, elm) {
                html.push(that.optionToHtml(i, elm));
            });

            html.push('<li class="ms-no-results">' + this.options.noMatchesFound + '</li>');
            html.push('</ul>');

            this.$drop.html(html.join(''));

            this.$selectItemsContainer = this.$drop.find('ul').css('max-height', this.options.maxHeight + 'px');

            this.$drop.find('.multiple').css('width', this.options.multipleWidth + 'px');

            this.$searchInput = this.$drop.find('.ms-search input');
            this.$selectAll = this.$drop.find('input[' + this.selectAllName + ']');
            this.$selectGroups = this.$drop.find('input[' + this.selectGroupName + ']');
            this.$selectItems = this.$drop.find('input[' + this.selectItemName + ']:enabled');
            this.$disableItems = this.$drop.find('input[' + this.selectItemName + ']:disabled');
            this.$noResults = this.$drop.find('.ms-no-results');

            this.events();
            this.updateSelectAll(true);
            this.update(true);

            if (this.options.isOpen) {
                this.open();
            }
        },

        destroy: function () {
            this.close();
            this.$el.trigger(eventName('destroy'));
            this.$parent.off('multipleselect');
            var that = this;
            Object.keys(this).forEach(function (key) {
                that[key] = null;
            });
        },

        /**
         * Add new option
         * @param {object{value,text,selected, disabled, class} } option
         * @param {object{name, disabled}} group
         */
        addOption: function (option, group, onlyGenerate) {
            group = group || {};

            if (!option) {
                return;
            }

            var html = [],
                that = this;

            if (Array.isArray(option)) {
                html = html.concat(option.map(function (opt) {
                    return that.addOption(opt, group, true);
                }));
            } else {
                option = normalizeOption(option);

                var value = option.id,
                    text = option.name,
                    selected = option.selected,
                    style = this.options.styler(value) ? ' style="' + this.options.styler(value) + '"' : '',
                    clss = option.class || '',
                    groupDisabled = group ? group.disabled : false,
                    disabled = groupDisabled || option.disabled,
                    type = this.options.single ? 'radio' : 'checkbox',
                    inputId = Math.random(),
                    tabIndex = ' tabindex="-1" ',
                    multiple = this.options.multiple,
                    labelClassName = ['label_check'];

                if (disabled) {
                    labelClassName.push("disabled");
                }


                if ((this.options.blockSeparator > "") && (this.options.blockSeparator == value)) {
                    html.push(
                        '<li' + clss + style + tabIndex + '>',
                        '<label class="' + this.options.blockSeparator + (disabled ? 'disabled' : '') + '">',
                        text,
                        '</label>',
                        '</li>'
                    );
                } else {
                    html.push(
                        '<li' + clss + style + tabIndex + ' >',
                        '<input id="checkbox-' + inputId + '" class="input_check" type="' + type + '" ' + this.selectItemName + ' value="' + value + '"' +
                        (selected ? ' checked="checked"' : '') +
                        (disabled ? ' disabled="disabled"' : '') +
                        (group.name ? ' data-group="' + group.name + '"' : '') +
                        ' data-option=\'' + encodeURI(JSON.stringify(option)) + '\'',
                        '/> ',

                        '<label class="' + labelClassName.join(' ') + '" for="checkbox-' + inputId + '">',
                        '<i class="icon"></i><span>',
                        text,
                        '</span></label>',
                        '</li>'
                    );
                }
            }

            if (onlyGenerate) {
                return html.join('');
            } else {
                this.$selectItemsContainer.append(html.join(' '));
                this.$selectItems = this.$drop.find('input[' + this.selectItemName + ']:enabled');
                this.$disableItems = this.$drop.find('input[' + this.selectItemName + ']:disabled');
            }
        },

        clearOptions: function () {
            this.$selectItemsContainer.html('');
            this.$selectItems = this.$drop.find('input[' + this.selectItemName + ']:enabled');
            this.$disableItems = this.$drop.find('input[' + this.selectItemName + ']:disabled');
        },

        /**
         * Add new group for options
         * @param {object{name, label,disabled}}group
         */
        addGroup: function (group, onlyGenerate) {
            var _group = group.name,
                label = group.label,
                disabled = group.disabled,
                html = [];

            html.push(
                '<li class="group">',
                '<label class="optgroup' + (disabled ? ' disabled' : '') + '" data-group="' + _group + '">',
                (this.options.hideOptgroupCheckboxes ? '' : '<input type="checkbox" ' + this.selectGroupName +
                (disabled ? ' disabled="disabled"' : '') + ' /> '),
                label,
                '</label>',
                '</li>');
            if (onlyGenerate) {
                return html.join('');
            } else {
                this.$selectItemsContainer.append(html);
            }

        },

        optionToHtml: function (i, elm, group, groupDisabled) {
            var that = this,
                $elm = $(elm),
                html = [],
                multiple = this.options.multiple;

            if (!group && $elm.is('optgroup')) {
                var group = getGroupParams(i, elm, group, groupDisabled);
                html.push(this.addGroup(group), true);

                $.each($elm.children(), function (i, elm) {
                    html.push(that.optionToHtml(i, elm, group.name, group.disabled));
                });
            } else {
                html.push(this.addOption(getOptionParams(i, elm, group, groupDisabled), {
                    name: group,
                    disabled: groupDisabled
                }, true));
            }

            return html.join('');

            function getOptionParams(i, elm, group, groupDisabled) {
                var $elm = $(elm),
                    value = $elm.attr('value'),
                    text = that.options.textTemplate($elm),
                    selected = (that.$el.attr('multiple') != undefined) ? $elm.prop('selected') : ($elm.attr('selected') == 'selected'),
                    disabled = $elm.prop('disabled');

                var clss = $.map(['class', 'title'], function (att, i) {
                    var isMultiple = att === 'class' && multiple;
                    var attValue = $elm.attr(att) || '';
                    return (isMultiple || attValue) ?
                        (' ' + att + '="' + (isMultiple ? ('multiple' + (attValue ? ' ' : '')) : '') + attValue + '"') :
                        '';
                }).join('');

                return {
                    value: value,
                    text: text,
                    selected: selected,
                    disabled: disabled,
                    class: clss
                };
            }

            function getGroupParams(i, elm, group, groupDisabled) {
                var $elm = $(elm),
                    _group = 'group_' + i,
                    label = $elm.attr('label'),
                    disabled = $elm.prop('disabled');

                return {
                    label: label,
                    name: _group,
                    disabled: disabled
                };
            }
        },

        onEvent: function ($element, event) {
            var event = eventName(event);
            $element
                .off(event)
                .on.apply($element, [event].concat(Array.prototype.slice.call(arguments, 2)));

            this.$el.one(eventName('destroy'), function () {
                $element.off(event);
            });
        },

        events: function () {
            var that = this;

            function toggleOpen(e) {
                e.preventDefault();
                that[that.options.isOpen ? 'close' : 'open']();
            }

            var label = this.$el.parent().closest('label')[0] || $('label[for=' + this.$el.attr('id') + ']')[0];
            if (label) {
                this.onEvent($(label), 'click', function (e) {
                    if (e.target.nodeName.toLowerCase() !== 'label' || e.target !== this) {
                        return;
                    }
                    toggleOpen(e);
                    if (!that.options.filter || !that.options.isOpen) {
                        that.focus();
                    }
                    e.stopPropagation(); // Causes lost focus otherwise
                });
            }

            this.onEvent(this.$choice, 'click', toggleOpen);
            this.onEvent(this.$choice, 'focus', this.options.onFocus);
            this.onEvent(this.$choice, 'blur', this.options.onBlur);


            this.onEvent(this.$parent, 'keyup', function (e) {
                switch (e.which) {
                    case KEY.ESC: // esc key
                        e.stopPropagation();
                        that.close();
                        that.$choice.focus();
                        break;
                    case KEY.DOWN:
                    case KEY.UP:
                        if (!that.options.isOpen) {
                            that.open();
                        } else {
                            that.highlightItem(e.which == KEY.DOWN);
                        }
                        break;
                    case KEY.SPACE:
                        e.stopPropagation();
                        e.preventDefault();
                        if (that.highlightedItem) {
                            that.highlightedItem.select();
                            itemSelected(that.highlightedItem.input);
                            if (that.options.single && that.options.isOpen && !that.options.keepOpen) {
                                that.close();
                                that.$choice.focus();
                            }
                        }
                        break;
                    case KEY.ENTER:
                        if (that.options.isOpen) {
                            that.close();
                            that.$choice.focus();
                        }
                }
            });

            this.onEvent(this.$searchInput, 'keydown', function (e) {
                if (e.keyCode === KEY.TAB && e.shiftKey) { // Ensure shift-tab causes lost focus from filter as with clicking away
                    that.close();
                }
            });

            this.onEvent(this.$searchInput, 'keyup', function (e) {
                if (that.options.filterAcceptOnEnter &&
                    (e.which === KEY.ENTER || e.which == KEY.SPACE) && // enter or space
                    that.$searchInput.val() // Avoid selecting/deselecting if no choices made
                ) {
                    that.$selectAll.click();
                    that.close();
                    that.focus();
                    return;
                }
                that.filter();
            });

            this.onEvent(this.$selectAll, 'click', function () {
                var checked = $(this).prop('checked'),
                    $items = that.$selectItems.filter(':visible');
                if ($items.length === that.$selectItems.length) {
                    that[checked ? 'checkAll' : 'uncheckAll']();
                } else { // when the filter option is true
                    that.$selectGroups.prop('checked', checked);
                    $items.prop('checked', checked);
                    that.options[checked ? 'onCheckAll' : 'onUncheckAll']();
                    that.update();
                }
            });

            this.onEvent(this.$selectGroups, 'click', function () {
                var group = $(this).parent().attr('data-group'),
                    $items = that.$selectItems.filter(':visible'),
                    $children = $items.filter('[data-group="' + group + '"]'),
                    checked = $children.length !== $children.filter(':checked').length;
                $children.prop('checked', checked);
                that.updateSelectAll();
                that.update();
                that.options.onOptgroupClick({
                    label: $(this).parent().text(),
                    checked: checked,
                    children: $children.get()
                });
            });

            /**
             * Subscribe to select/click item event
             */
            this.$parent.on(eventName('click'), 'input[' + this.selectItemName + ']:enabled', function () {
                var $this = $(this);
                itemSelected($this);
                if (that.options.single && that.options.isOpen && !that.options.keepOpen) {
                    that.close();
                    that.$choice.focus();
                }
            });


            this.onEvent(this.$selectItems, 'keydown', function (e) {
                if (e.which === KEY.ENTER) {
                    var $this = $(this);
                    $this.prop('checked', true);
                    itemSelected($this);
                    that.$choice.focus();
                }
            });


            privateEventChanel.on(eventName('opened'), opened);

            privateEventChanel.on(eventName('click.body'), onBodyClick);

            this.$el.one(eventName('destroy'), function () {
                privateEventChanel.off(eventName('opened'), opened);
                privateEventChanel.off(eventName('click.body'), onBodyClick);
            });

            function opened(e, multipleSelect) {
                if (that.options.isOpen && that != multipleSelect) {
                    that.close();
                }
            }

            function onBodyClick(event, e) {
                if (that.options.isOpen && !that.$parent.has(e.target).length) {
                    that.close();
                }
            }

            function itemSelected($this) {
                that.updateSelectAll();
                that.update();
                that.updateOptGroupSelect();
                that.setHighlightItem($this.closest('li'));
                that.options.onClick({
                    label: $this.parent().text(),
                    value: $this.val(),
                    checked: $this.prop('checked')
                });
            }
        },

        highlightItem: function (toDown) {
            var highlightedItem = this.highlightedItem;
            var fisrtSelector = ':visible' + (toDown ? ':first' : ':last');

            if (!highlightedItem) {
                highlightedItem = this.$selectItemsContainer.find('li').filter(fisrtSelector);
            } else {
                highlightedItem = highlightedItem.next(toDown);
                if (!highlightedItem || !highlightedItem.length) {
                    highlightedItem = this.$selectItemsContainer.find('li').filter(fisrtSelector);
                }
            }

            this.setHighlightItem(highlightedItem);
        },

        setHighlightItem: function (highlightedItem) {
            this.resetHighlightItem();

            var highlightedObj = {
                item: highlightedItem,
                input: highlightedItem.find('input'),
                reset: function () {
                    highlightedItem.removeClass('highlight');

                },
                init: function () {
                    highlightedItem.addClass('highlight');
                    highlightedItem.focus();
                },
                select: function () {
                    highlightedObj.input.prop('checked', !highlightedObj.input.prop('checked'));
                },
                next: function (toDown) {
                    return highlightedItem[toDown ? 'next' : 'prev'](":visible");
                }
            };

            highlightedObj.init();
            this.highlightedItem = highlightedObj;
        },

        resetHighlightItem: function () {
            if (this.highlightedItem) {
                this.highlightedItem.reset();
                this.highlightedItem = null;
            }
        },

        open: function () {

            this.changeAfterOpen = false;

            if (this.$choice.hasClass('disabled')) {
                return;
            }
            this.options.isOpen = true;
            this.$choice.addClass('open');

            this.$drop.show();
            this.$drop.removeClass('right');
            this.$drop.removeClass('bottom');

            var dropOffset = this.$drop.offset();
            var outerWidth = this.$drop.outerWidth();
            var outerHeight = this.$drop.outerHeight();
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();


            if (dropOffset.left + outerWidth >= windowWidth) {
                this.$drop.addClass('right');
            }


            if (dropOffset.top + outerHeight >= windowHeight) {
                this.$drop.addClass('bottom');
            }

            // fix filter bug: no results show
            this.$selectAll.parent().show();
            this.$noResults.hide();

            // Fix #77: 'All selected' when no options
            if (this.$el.children().length === 0) {
                this.$selectAll.parent().hide();
                this.$noResults.show();
            }

            if (this.options.container) {
                var offset = this.$drop.offset();
                this.$drop.appendTo($(this.options.container));
                this.$drop.offset({top: offset.top, left: offset.left});
            }
            if (this.options.filter) {
                this.$searchInput.val('');
                this.$searchInput.focus();
                this.filter();
            }
            this.options.onOpen();

            privateEventChanel.trigger(eventName('opened'), this);

        },

        close: function () {
            this.options.isOpen = false;
            this.$choice.removeClass('open');
            this.$drop.hide();
            if (this.options.container) {
                this.$parent.append(this.$drop);
                this.$drop.css({
                    'top': 'auto',
                    'left': 'auto'
                });
            }
            this.options.onClose();
            this.resetHighlightItem();
            if (this.changeAfterOpen) {
                this.$el.trigger(eventName('change'), {items: this.getSelects('obj')});
            }
            this.changeAfterOpen = false;
            this.$choice.focus();
        },

        update: function (isInit) {

            var selects = this.getSelects(),
                $span = this.$choice.find('>span'),
                that = this;

            if (selects.length === 0) {
                $span.addClass('placeholder').html(this.options.placeholder);
            } else if (this.options.countSelected && selects.length < this.options.minimumCountSelected) {
                $span.removeClass('placeholder').html(selectedItemHtml());
            } else if (this.options.allSelected &&
                selects.length === this.$selectItems.length + this.$disableItems.length) {
                $span.removeClass('placeholder').html(this.options.allSelected);
            } else if ((this.options.countSelected || this.options.etcaetera) && selects.length > this.options.minimumCountSelected) {
                if (this.options.etcaetera) {
                    $span.removeClass('placeholder').html((this.options.displayValues ? selects : this.getSelects('text').slice(0, this.options.minimumCountSelected)).join(this.options.delimiter) + '...');
                }
                else {
                    $span.removeClass('placeholder').html(this.options.countSelected
                        .replace('#', selects.length)
                        .replace('%', this.$selectItems.length + this.$disableItems.length));
                }
            } else {
                $span.removeClass('placeholder').html(selectedItemHtml());
            }
            // set selects to select
            this.$el.val(this.getSelects());

            // add selected class to selected li
            this.$drop.find('li').removeClass('selected');
            this.$drop.find('input[' + this.selectItemName + ']:checked').each(function () {
                $(this).parents('li').first().addClass('selected');
            });

            // trigger <select> change event
            if (!isInit) {
                if (this.options.single) {
                    this.$el.trigger(eventName('change'), {items: this.getSelects('obj')});
                } else {
                    this.$el.trigger(eventName('select'), {items: this.getSelects('obj')});
                    this.changeAfterOpen = true;
                }
            }

            function selectedItemHtml() {
                return that.options.displayValues ? selects : that.getSelects('text').map(function (text) {
                    return this.options.selectedItemTemplate(text);
                }.bind(that));
            };
        },

        updateSelectAll: function (Init) {
            var $items = this.$selectItems;
            if (!Init) {
                $items = $items.filter(':visible');
            }
            this.$selectAll.prop('checked', $items.length &&
                $items.length === $items.filter(':checked').length);
            if (this.$selectAll.prop('checked')) {
                this.options.onCheckAll();
            }
        },

        updateOptGroupSelect: function () {
            var $items = this.$selectItems.filter(':visible');
            $.each(this.$selectGroups, function (i, val) {
                var group = $(val).parent().attr('data-group'),
                    $children = $items.filter('[data-group="' + group + '"]');
                $(val).prop('checked', $children.length &&
                    $children.length === $children.filter(':checked').length);
            });
        },

        //value or text, default: 'value'
        getSelects: function (type) {
            var that = this,
                texts = [],
                values = [],
                options = [];

            this.$drop.find('input[' + this.selectItemName + ']:checked').each(function () {
                var $this = $(this);
                texts.push($this.parents('li').first().text());
                values.push($this.val());
                options.push(JSON.parse(decodeURI($this.data('option'))));
            });

            if (type === 'text' && this.$selectGroups.length) {
                texts = [];
                this.$selectGroups.each(function () {
                    var html = [],
                        text = $.trim($(this).parent().text()),
                        group = $(this).parent().data('group'),
                        $children = that.$drop.find('[' + that.selectItemName + '][data-group="' + group + '"]'),
                        $selected = $children.filter(':checked');

                    if ($selected.length === 0) {
                        return;
                    }

                    html.push('[');
                    html.push(text);
                    if ($children.length > $selected.length) {
                        var list = [];
                        $selected.each(function () {
                            list.push($(this).parent().text());
                        });
                        html.push(': ' + list.join(', '));
                    }
                    html.push(']');
                    texts.push(html.join(''));
                });
            }
            return type === 'text' ? texts : type === 'obj' ? options : values;
        },

        setSelects: function (values) {
            if (!values) {
                this.clearSelection(true);
                return;
            }

            values = normalizeOption(arrayify(values));

            if (!values.length) {
                this.clearSelection(true);
                return;
            }

            var that = this;
            this.$selectItems.prop('checked', false);
            values.forEach(function (value, i) {
                that.$selectItems.filter('[value="' + value.id + '"]').prop('checked', true);
            });
            this.$selectAll.prop('checked', this.$selectItems.length ===
                this.$selectItems.filter(':checked').length);
            this.update(true);
        },

        enable: function () {
            this.$choice.removeClass('disabled');
        },

        disable: function () {
            this.$choice.addClass('disabled');
        },

        checkAll: function () {
            this.$selectItems.prop('checked', true);
            this.$selectGroups.prop('checked', true);
            this.$selectAll.prop('checked', true);
            this.update();
            this.options.onCheckAll();
        },

        uncheckAll: function () {
            this.clearSelection(false);
            this.options.onUncheckAll();
        },

        clearSelection: function (isInit) {
            this.$selectItems.prop('checked', false);
            this.$selectGroups.prop('checked', false);
            this.$selectAll.prop('checked', false);
            this.update(isInit);
        },

        focus: function () {
            this.$choice.focus();
            this.options.onFocus();
        },

        blur: function () {
            this.$choice.blur();
            this.options.onBlur();
        },

        refresh: function () {
            this.init();
        },

        filter: function () {
            var that = this,
                text = $.trim(this.$searchInput.val()).toLowerCase();
            if (text.length === 0) {
                this.$selectItems.parent().show();
                this.$disableItems.parent().show();
                this.$selectGroups.parent().show();
            } else {
                this.$selectItems.each(function () {
                    var $parent = $(this).parent();
                    $parent[$parent.text().toLowerCase().indexOf(text) < 0 ? 'hide' : 'show']();
                });
                this.$disableItems.parent().hide();
                this.$selectGroups.each(function () {
                    var $parent = $(this).parent();
                    var group = $parent.attr('data-group'),
                        $items = that.$selectItems.filter(':visible');
                    $parent[$items.filter('[data-group="' + group + '"]').length === 0 ? 'hide' : 'show']();
                });

                //Check if no matches found
                if (this.$selectItems.filter(':visible').length) {
                    this.$selectAll.parent().show();
                    this.$noResults.hide();
                } else {
                    this.$selectAll.parent().hide();
                    this.$noResults.show();
                }
            }
            this.updateOptGroupSelect();
            this.updateSelectAll();
        }
    };

    $.fn.multipleSelect = function () {
        var option = arguments[0],
            args = arguments,

            value,
            allowedMethods = [
                'getSelects', 'setSelects',
                'enable', 'disable',
                'checkAll', 'uncheckAll',
                'focus', 'blur',
                'refresh', 'close',
                'destroy', 'addOption',
                'visible'
            ];

        this.each(function () {
            var $this = $(this),
                data = $this.data('multipleSelect'),
                options = $.extend({}, $.fn.multipleSelect.defaults,
                    $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new MultipleSelect($this, options);
                $this.data('multipleSelect', data);
            }

            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw "Unknown method: " + option;
                }
                value = data[option](args[1]);
            } else {
                data.init();
                if (args[1]) {
                    value = data[args[1]].apply(data, [].slice.call(args, 2));
                }
            }
        });

        return value ? value : this;
    };

    $.fn.multipleSelect.defaults = {
        name: '',
        isOpen: false,
        placeholder: '',
        selectAll: false,
        selectAllText: 'Выбрать все',
        selectAllDelimiter: ['[', ']'],
        allSelected: 'Выбраны все',
        minimumCountSelected: 5,
        countSelected: 'выбрано # из %',
        noMatchesFound: 'No matches found',
        multiple: false,
        multipleWidth: 80,
        single: false,
        filter: false,
        width: undefined,
        maxHeight: 250,
        container: null,
        position: 'bottom',
        keepOpen: false,
        blockSeparator: '',
        displayValues: false,
        delimiter: ', ',

        styler: function () {
            return false;
        },
        textTemplate: function ($elm) {
            return $elm.text();
        },

        selectedItemTemplate: function (text) {
            return '<span class="ms-choice-multi-item"><span>' + text + '</span></span>'
        },

        onOpen: function () {
            return false;
        },
        onClose: function () {
            return false;
        },
        onCheckAll: function () {
            return false;
        },
        onUncheckAll: function () {
            return false;
        },
        onFocus: function () {
            return false;
        },
        onBlur: function () {
            return false;
        },
        onOptgroupClick: function () {
            return false;
        },
        onClick: function () {
            return false;
        }
    };
})(jQuery);
