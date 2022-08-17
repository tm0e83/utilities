/**
 * DO NOT USE! Reactoring required!
 */

/**
 * @description Class for multi-select-dropdowns with search bar
 * @param {object} container jQuery Object of the outer container
 * @param {object} options class settings
 * @event selectionChange fires when an item is selected
 * @event clearAll fires when all items are removed at the same time
 */
export default class SingleSelectDrop {
  constructor(container, options) {
    this.element = container;

    const defaults = {
      searchTargetSelector: ''
    }
    this.o = $.extend({}, defaults, options || {});

    this.dropdownClass = 'uic-single-select-drop';
    this.selectedClass = 'uic-selected';
    this.expandedClass = 'uic-expanded';
    this.dataAttrName = 'uic-item-value';

    this.input = this.element.find('.uic-input');
    this.hiddenInput = this.element.find('[type="hidden"]');
    this.selection = this.element.find('.uic-selection');
    this.menu = this.element.find('.uic-menu');
    this.menuItems = this.menu.find('.uic-menu-item');
    this.message = this.element.find('.uic-message');

    this.selectedItem = this.selection.find('.' + this.selectedClass);

    this.isExpanded = false;

    this.addEvents();
    this.handlePreselection();
  }

  handlePreselection() {
    let value = this.selectedItem.data(this.dataAttrName);
    let menuItem = this.menu.find('[data-' + this.dataAttrName + '="' + value + '"]');
    menuItem.addClass(this.selectedClass);
  }

  selectOptionByValue(value) {
    let menuItem = this.menu.find('[data-' + this.dataAttrName + '="' + value + '"]');
    if (menuItem.length) {
      this.selectItem(menuItem);
    }
  }

  addEvents() {
    $(window).on('click', (event) => {
      if ($.contains(this.element.get(0), event.target) === false &&
        this.isExpanded === true) {
        this.closeMenu();
      }
    });

    this.selection.on('click', (event) => {
      if (this.isExpanded === true) {
        this.closeMenu();
      } else {
        this.showMenu();
      }
    });

    this.input.on({
      'keypress': (event) => {
        this.toggleMessage();
        return event.which != 13;
      },
      'keyup': (event) => {
        this.filterItems();
        this.toggleMessage();
      }
    });

    this.menuItems.on('click', (event) => {
      this.selectItem($(event.currentTarget));
      this.closeMenu();
      this.toggleMessage();
    });
  }

  toggleMessage() {
    let displayStyle = this.menuItems.filter((i, item) => {
      return $(item).css('display') != 'none' && $(item).data(this.dataAttrName) !== '';
    }).length > 0 ? 'none' : 'block';
    this.message.css('display', displayStyle);
  }

  filterItems() {
    let searchString = this.input.val(),
      regex = new RegExp(searchString, 'i');

    this.menuItems.each((i, item) => {
      let haystack = this.o.searchTargetSelector === '' ? $(item).text() : $(item).find(this.o.searchTargetSelector).text();
      if (haystack.toString().match(regex) === null && $(item).data(this.dataAttrName) !== '') {
        $(item).css('display', 'none');
      } else if ($(item).hasClass(this.selectedClass) === false) {
        $(item).css('display', 'block');
      }
    });
  }

  selectItem(item, isReset) {
    item.css('display', 'none');

    this.menuItems.removeClass(this.selectedClass);
    item.addClass(this.selectedClass);
    this.selectedItem.text(item.get(0).textContent);
    this.selectedItem
      .data(this.dataAttrName, item.data(this.dataAttrName))
      .attr('data-' + this.dataAttrName, item.data(this.dataAttrName));
    this.updateValue();

    if (!isReset) {
      this.element.trigger('selectionChange', this.selectedItem);
    }
  }

  closeMenu() {
    if (this.isExpanded === false) return;
    this.isExpanded = true;
    setTimeout(() => {
      this.input.val('');
      this.element.removeClass(this.expandedClass);
      this.menu.slideToggle(150, () => {
        this.isExpanded = false;
        this.input.focus();
        this.input.trigger('keyup');
      })
    }, 50);
  }

  showMenu() {
    if (this.isExpanded === true) return;
    this.isExpanded = true;
    this.element.addClass(this.expandedClass);
    this.menu.slideToggle(200, () => {
      this.isExpanded = true;
      if (!this.isTouchDevice()) {
        this.input.focus();
      }
    });
  }

  updateValue() {
    this.hiddenInput.val(this.selectedItem.data(this.dataAttrName));
  }

  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
  };

  clear() {
    let selectedItemObjects = this.selectedItems;

    if (this.menuItems.eq(0).data(this.dataAttrName) == '') {
      this.selectItem(this.menuItems.eq(0), true);
    }

    this.hiddenInput.attr('value', '');
    this.element.trigger('clearAll');
    return selectedItemObjects;
  }
}