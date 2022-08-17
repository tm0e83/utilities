// DO NOT USE THIS!

import {
  // getInputValueWidth,
  isInView,
} from '../../global/js/functions.js';

import Mediator from './mediator';

/**
 * @description select dropdown with search input
 * @param {node} args.element
 * @param {boolean} [args.options.search=false] Has search input field or not
 * @example 1) single select with preselected value with search input field
  <select>
    <option value="">Auswählen</option>
    <option value="af">Afghanistan</option>
    <option value="ax" selected>Aland Islands</option>
    <option value="al">Albania</option>
    <option value="dz">Algeria</option>
    <option value="as">American Samoa</option>
    <option value="ad">Andorra</option>
    <option value="ao">Angola</option>
    <option value="ai">Anguilla</option>
    <option value="ai">Anguilla</option>
    <option value="td">Chad</option>
    <option value="cl">Chile</option>
    <option value="cn">China</option>
    <option value="cx">Christmas Island</option>
    <option value="cc">Cocos Islands</option>
    <option value="co">Colombia</option>
    <option value="km">Comoros</option>
  </select>

  @import 'single-select-dropdown.scss';

  import SingleSelectDropdown from 'single-select-dropdown.js';

  const dropdown = new SingleSelectDropdown(document.querySelector('#my-single-select-dropdown'), {
    search: true
  });

  dropdown.subscribe('change', value => console.log(value));

  dropdown.setValue('cn'); // option "China" will be selected
*/
export default class SingleSelectDropdown extends Mediator {
  constructor(element, options = {}) {
    super();

    const settings = Object.assign(
      {
        search: false,
      },
      options
    );

    if (element.tagName.toLowerCase() === 'select') {
      this.selectElement = element;
      this.element = document.createElement('div');
      this.selectElement.insertAdjacentElement('afterend', this.element);
      this.element.classList.add('single-select-dropdown');

      if (this.selectElement.className) {
        [this.selectElement.className.split(' ')].map(cl => this.element.classList.add(cl));
      }

      if (settings.search) this.element.classList.add('search');
      this.element.appendChild(this.selectElement);

      this.defaultOption = this.selectElement.querySelector('option[value=""]');
      const defaultText = this.defaultOption ? this.defaultOption.textContent : settings.defaultText || 'Select';
      const noResultsText = settings.noResultsText || 'No results';
      const valueOptions = [...this.selectElement.querySelectorAll('option')];

      this.element.insertAdjacentHTML(
        'beforeend',
        `
        <input class="search" autocomplete="off-x" tabindex="0" ${settings.search ? '' : 'readonly'}>
        <div class="text default"><span>${defaultText}</span></div>
        <div class="item-list" tabindex="-1">
          ${valueOptions
            .map(
              option => `
            <div class="item ${option.selected ? 'selected' : ''}" data-value="${option.value}">
              ${option.textContent}
            </div>
          `
            )
            .join('')}
          <div class="message">${noResultsText}</div>
        </div>
      `
      );
    } else {
      this.element = element;
    }

    this.hiddenField = this.element.querySelector('input[type="hidden"]');
    this.sizer = this.element.querySelector('.sizer');
    this.searchInput = this.element.querySelector('input.search');
    this.textElement = this.element.querySelector('.text');
    this.itemList = this.element.querySelector('.item-list');
    this.message = this.element.querySelector('.message');

    this.openClass = 'open';
    this.selectedClass = 'selected';
    this.filteredClass = 'filtered';
    this.activeClass = 'active';
    this.itemClass = 'item';
    this.labelClass = 'label';
    this.defaultClass = 'default';

    this.placeholder = this.textElement.querySelector('span').innerHTML;

    const onWindowClick = function (e) {
      if (!document.body.contains(this.element)) {
        window.removeEventListener('click', this.onWindowClick);
        return;
      }

      if (e.target !== this.element && !this.element.contains(e.target) && this.element.classList.contains(this.openClass)) {
        this.close();
      }
    };

    this.onWindowClick = onWindowClick.bind(this);
    if (this.value) this.preselect();
    this.items.map(itemElement => this.addItemEvents(itemElement));
    this.setActive();
    this.addEvents();
  }

  preselect() {
    this.items.map(itemElement => {
      if (itemElement.getAttribute('data-value') === this.value) {
        itemElement.classList.add(this.selectedClass);
        this.textElement.querySelector('span').innerHTML = itemElement.innerHTML;
        this.textElement.classList.remove(this.defaultClass);
      } else {
        itemElement.classList.remove(this.selectedClass);
      }
    });
  }

  addEvents() {
    window.addEventListener('click', e => this.onWindowClick(e));

    this.element.addEventListener('click', _ => {
      this.filterItems();
      this.open();
      this.setActive();
      this.textElement.classList.add(this.defaultClass);
      this.searchInput.focus();
    });

    this.searchInput.addEventListener('input', e => {
      if (e.target.value) {
        this.setActive();
        this.open();
      }
      // this.resizeSearchInput();
      this.filterItems();
    });

    ['keydown', 'keypress'].map(eventType => {
      this.searchInput.addEventListener(eventType, e => {
        switch (e.key) {
          case 'Backspace':
            if (e.target.value.trim().length === 0) {
              e.preventDefault();

              if (this.labels.length) {
                this.removeLabel(this.labels[this.labels.length - 1]);
              }
            }

            break;

          case 'Enter':
            e.preventDefault();

            if (!this.inputTimeout) {
              this.onSelect();
              this.slowDown();
            }

            break;

          case 'ArrowUp':
            e.preventDefault();

            if (!this.inputTimeout) {
              this.navUp();
              this.slowDown();
            }

            break;

          case 'ArrowDown':
            e.preventDefault();

            if (!this.inputTimeout) {
              this.navDown();
              this.slowDown();
            }

            break;

          case 'Tab':
            e.preventDefault();

            if (!this.inputTimeout) {
              this.navDown();
              this.slowDown();
            }

            break;
        }
      });
    });

    this.labels.map(labelElement => this.addSelectedItemsEvents(labelElement));
  }

  /**
   * removes current items and adds new ones
   * @param {array} data
   * @example
   * instance.addItems([{label: 'A', value: 1}, {label: 'B', value: 2}]);
   */
  addItems(data) {
    this.message.style.display = data.length ? 'none' : 'block';
    this.items.map(item => this.itemList.removeChild(item));

    this.selectElement.appendChild(this.defaultOption);

    this.selectElement.insertAdjacentHTML(
      'beforeend',
      data
        .map(
          item => `
      <option value="${typeof item === 'object' ? item.value : item.label}">
        ${typeof item === 'object' ? item.label : item}
      </option>
    `
        )
        .join('')
    );

    this.message.insertAdjacentHTML(
      'beforebegin',
      `
      <div class="item ${this.selectedClass}" data-value="${this.defaultOption.value}">${this.defaultOption.textContent}</div>
    `
    );

    this.message.insertAdjacentHTML(
      'beforebegin',
      data
        .map(
          item => `
      <div class="item" ${typeof item === 'object' ? `data-value="${item.value}"` : ''}>
        ${typeof item === 'object' ? item.label : item}
      </div>
    `
        )
        .join('')
    );

    this.items.map(itemElement => this.addItemEvents(itemElement));
    this.onSelect(this.activeItem, false, false);
  }

  addItemEvents(itemElement) {
    itemElement.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.onSelect(itemElement);
    });
  }

  // resizeSearchInput() {
  //   this.searchInput.style.width = getInputValueWidth(this.searchInput) + 25 + 'px';
  // }

  filterItems() {
    const regex = this.searchInput.value.trim().length ? new RegExp(`^${this.searchInput.value.trim()}`, 'i') : /.*/;

    this.items.map(item => {
      item.classList[item.textContent.trim().match(regex) !== null ? 'remove' : 'add'](this.filteredClass);
    });

    this.textElement.classList[this.searchInput.value.trim().length ? 'add' : 'remove'](this.filteredClass);
    this.message.style.display = this.visibleItems.length === 0 && this.visibleItems.length !== this.items.length ? 'block' : 'none';
  }

  slowDown() {
    new Promise((resolve, reject) => (this.inputTimeout = setTimeout(_ => resolve(), 50))).then(_ => {
      clearTimeout(this.inputTimeout);
      this.inputTimeout = null;
    });
  }

  open() {
    this.element.classList.add(this.openClass);
  }

  close() {
    this.element.classList.remove(this.openClass);
    this.onClose();
  }

  onClose() {
    this.searchInput.value = '';
    this.filterItems();
    this.textElement.classList[this.value ? 'remove' : 'add'](this.defaultClass);
  }

  get labels() {
    return [...this.element.querySelectorAll(`.${this.labelClass}`)];
  }

  get activeItem() {
    const activeItems = this.visibleItems.filter(item => item.classList.contains(this.activeClass));
    return activeItems[0] || this.items[0];
  }

  get activeItemIndex() {
    return this.activeItem ? this.visibleItems.indexOf(this.activeItem) : 0;
  }

  get items() {
    return [...this.itemList.querySelectorAll(`.${this.itemClass}`)];
  }

  get visibleItems() {
    return this.items.filter(item => {
      return !item.classList.contains(this.selectedClass) && !item.classList.contains(this.filteredClass);
    });
  }

  get value() {
    if (this.hiddenField) {
      return this.hiddenField.value;
    } else {
      return this.selectElement.value;
    }
  }

  navUp() {
    const items = this.visibleItems;
    const activeIndex = this.activeItemIndex;

    if (items[activeIndex - 1]) {
      const nextActiveItem = items[activeIndex - 1];

      const topVisible = isInView(nextActiveItem, {
        scrollElement: this.itemList,
        area: 'top',
      });

      if (!topVisible) {
        this.itemList.scrollTop = nextActiveItem.offsetTop;
      }

      this.setActive(nextActiveItem);
    }
  }

  navDown() {
    const items = this.visibleItems;
    const activeIndex = this.activeItemIndex;

    if (items[activeIndex + 1]) {
      const nextActiveItem = items[activeIndex + 1];

      const bottomVisible = isInView(this.activeItem, {
        scrollElement: this.itemList,
        area: 'bottom',
      });

      if (!bottomVisible) {
        this.itemList.scrollTop = nextActiveItem.offsetTop;
      }

      this.setActive(nextActiveItem);
    }
  }

  setActive(nextActiveItemElement = this.visibleItems[0] || this.items[0]) {
    this.items.map(itemElement => {
      if (itemElement === nextActiveItemElement) {
        itemElement.classList.add(this.activeClass);
      } else {
        itemElement.classList.remove(this.activeClass);
      }
    });
  }

  empty() {
    this.items.filter(item => item.classList.remove(this.selectedClass));
    this.textElement.querySelector('span').innerHTML = this.placeholder;
    this.textElement.classList.add(this.defaultClass);
    this.searchInput.value = '';

    if (this.hiddenField) {
      this.hiddenField.value = '';
    } else {
      this.selectElement.value = '';
    }
  }

  setValue(value) {
    const strValue = `${value}`;

    this.items.filter(item => item.getAttribute('data-value') === strValue).map(item => this.onSelect(item));
  }

  onSelect(itemElement = this.activeItem, publish = true, focus = true) {
    const itemElementIndex = this.visibleItems.indexOf(itemElement);
    const nextActiveItem = this.visibleItems[itemElementIndex + 1] || this.visibleItems[0] || this.items[0];
    this.setActive(nextActiveItem);

    this.items.map(item => item.classList.remove(this.selectedClass));
    itemElement.classList.add(this.selectedClass);
    itemElement.classList.remove(this.activeClass);

    this.close();

    if (this.hiddenField) {
      this.hiddenField.value = itemElement.getAttribute('data-value');
    } else {
      this.selectElement.value = itemElement.getAttribute('data-value');
    }

    this.searchInput.value = '';

    if (focus) this.searchInput.focus();

    this.textElement.querySelector('span').innerHTML = itemElement.textContent.trim();
    this.textElement.classList.remove(this.defaultClass);

    if (publish) {
      this.publish('select', this.selectionType === 'multiple' ? this.values : this.value); // deprecated
      this.publish('change', this.selectionType === 'multiple' ? this.values : this.value);
    }
  }
}
