// DO NOT USE THIS!

import { getInputValueWidth, isInView } from '../../global/js/functions.js';

import Mediator from './mediator';

/**
 * @description select dropdown with search input
 * @param {node} args.element

 * @example multi select with preselected value
    <select class="multi-select-dropdown">
      <option value="af">Afghanistan</option>
      <option value="ax">Aland Islands</option>
      <option value="al">Albania</option>
      <option value="dz">Algeria</option>
      <option value="as">American Samoa</option>
      <option value="ad" selected>Andorra</option>
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
    </div>
  </div>

  @import 'multi-select-dropdown.scss';

  import MultiSelectDropdown from 'multi-select-dropdown.js';

  new MultiSelectDropdown(document.querySelector('.multi-select-dropdown'), {
    search: true
  });
*/
export default class MultiSelectDropdown extends Mediator {
  constructor(element, options) {
    super();

    if (!element) return;

    const settings = Object.assign(
      {
        search: false,
      },
      options
    );

    if (element.tagName.toLowerCase() === 'select') {
      this.selectElement = element;
      this.selectElement.setAttribute('multiple', true);
      this.element = document.createElement('div');
      this.selectElement.insertAdjacentElement('afterend', this.element);
      this.element.classList.add('multi-select-dropdown');
      if (settings.search) this.element.classList.add('search');
      this.element.appendChild(this.selectElement);

      const defaultOption = this.selectElement.querySelector('option[value=""]');
      const defaultText = defaultOption ? defaultOption.textContent : settings.defaultText || 'Select';
      const noResultsText = settings.noResultsText || 'No results';
      const valueOptions = [...this.selectElement.querySelectorAll('option')].filter(option => option.value);

      this.element.insertAdjacentHTML(
        'beforeend',
        `
        ${valueOptions
          .map(
            option => `
          ${
            option.selected
              ? `
            <a class="label" data-value="${option.value}">
              ${option.textContent} <i class="delete"></i>
            </a>
          `
              : ''
          }
        `
          )
          .join('')}
        <input type="text" autocomplete="off-x" tabindex="0" ${settings.search ? '' : 'readonly'}>
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
    this.searchInput = this.element.querySelector('input[type="text"]');
    this.defaultTextElement = this.element.querySelector('.default');
    this.itemList = this.element.querySelector('.item-list');
    this.message = this.element.querySelector('.message');

    this.openClass = 'open';
    this.selectedClass = 'selected';
    this.filteredClass = 'filtered';
    this.activeClass = 'active';
    this.itemClass = 'item';
    this.labelClass = 'label';

    this.placeholder = this.searchInput.getAttribute('placeholder');

    const onWindowClick = function (e) {
      if (!document.body.contains(this.element)) {
        window.removeEventListener('click', this.onWindowClick);
        return;
      }

      if (e.target !== this.element && !this.element.contains(e.target) && this.element.classList.contains(this.openClass)) {
        this.close();

        this.searchInput.value = '';
        this.toggleDefaultText();
        this.resizeSearchInput();
        this.filterItems();
      }
    };

    this.onWindowClick = onWindowClick.bind(this);
    this.setActive();
    this.addEvents();
  }

  addEvents() {
    window.addEventListener('click', e => this.onWindowClick(e));

    this.element.addEventListener('click', _ => {
      this.setActive();
      this.filterItems();
      this.open();
      this.searchInput.focus();
    });

    this.searchInput.addEventListener('input', e => {
      this.toggleDefaultText();
      this.resizeSearchInput();
      this.filterItems();
      if (e.target.value.trim().length) this.open();
    });

    ['keydown', 'keypress'].map(eventType => {
      this.searchInput.addEventListener(eventType, e => {
        switch (e.key) {
          case 'Backspace':
            if (e.target.value.trim().length === 0) {
              if (this.labels.length) {
                e.preventDefault();
                this.removeLabel(this.labels[this.labels.length - 1]);
                this.filterItems();
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

    this.items.map(itemElement => {
      itemElement.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.onSelect(itemElement);
      });
    });
  }

  resizeSearchInput() {
    this.searchInput.style.width = getInputValueWidth(this.searchInput) + 25 + 'px';
  }

  filterItems() {
    const regex = this.searchInput.value.trim().length ? new RegExp(`^${this.searchInput.value.trim()}`, 'i') : /.*/;

    this.items.map(item => {
      item.classList[item.textContent.trim().match(regex) !== null ? 'remove' : 'add'](this.filteredClass);
    });

    this.message.style.display = this.items.length === 0 || (this.visibleItems.length === 0 && this.visibleItems.length !== this.items.length ? 'block' : 'none');
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
  }

  addSelectedItemsEvents(labelElement) {
    labelElement.querySelector('.delete').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.removeLabel(labelElement);
    });
  }

  removeLabel(labelElement) {
    this.itemList.querySelector(`.${this.itemClass}[data-value="${labelElement.getAttribute('data-value')}"]`).classList.remove(this.selectedClass);

    this.element.removeChild(labelElement);
    this.updateHiddenField();
    this.toggleDefaultText();
    this.publish('change', this.values);
  }

  toggleDefaultText() {
    this.defaultTextElement.style.display = !this.searchInput.value.trim().length && !this.values.length ? 'block' : 'none';
  }

  updateHiddenField() {
    const selectedValues = this.items.filter(item => item.classList.contains(this.selectedClass)).map(item => item.getAttribute('data-value'));

    if (this.hiddenField) {
      this.hiddenField.value = selectedValues.join(',');
    } else {
      [...this.selectElement.options].map(option => (option.selected = selectedValues.includes(option.value)));
    }
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

  get values() {
    if (this.hiddenField) {
      return this.hiddenField.value ? this.hiddenField.value.split(',') : [];
    } else {
      return [...this.selectElement.options].filter(option => option.value && option.selected).map(option => option.value);
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
    this.labels.map(label => label.parentNode.removeChild(label));
    this.updateHiddenField();
    this.toggleDefaultText();
  }

  setValue(value) {
    const strValue = `${value}`;
    const values = Array.isArray(strValue) ? strValue : [strValue];
    const currentValues = this.values;

    const items = this.items.filter(item => {
      const dataValue = item.getAttribute('data-value');
      return values.includes(dataValue) && !currentValues.includes(dataValue);
    });

    items.map(item => this.onSelect(item));
  }

  onSelect(itemElement = this.activeItem) {
    const itemElementIndex = this.visibleItems.indexOf(itemElement);
    const nextActiveItem = this.visibleItems[itemElementIndex + 1] || this.visibleItems[0] || this.items[0];
    this.setActive(nextActiveItem);

    itemElement.classList.add(this.selectedClass);
    itemElement.classList.remove(this.activeClass);

    const labelElement = document.createElement('a');
    labelElement.classList.add(this.labelClass);
    labelElement.setAttribute('data-value', itemElement.getAttribute('data-value'));
    labelElement.insertAdjacentHTML('beforeend', `${itemElement.innerHTML} <i class="delete"></i>`);
    this.addSelectedItemsEvents(labelElement);
    this.updateHiddenField();
    this.toggleDefaultText();
    this.searchInput.insertAdjacentElement('beforebegin', labelElement);
    this.searchInput.focus();

    if (!this.visibleItems.length) this.close();

    this.publish('change', this.values);
  }
}
