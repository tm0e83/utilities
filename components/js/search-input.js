import { isInView } from '../../global/jss/functions.js';

import Mediator from 'mediator.js';
import Spinner from 'spinner.js';

/**
 * @description search input
 * @param {node} args.element
 * @example search input
  <input type="text" id="my-search-input">

  @import 'search-input.scss';

  import SearchInput from 'search-input.js';

  const searchInput = new SearchInput(document.querySelector('#my-search-input'));

  // subscribe to the search event
  searchInput.subscribe('search', v => {
    // ... some async action ...

    searchInput.addItems([
      'Option 1',
      'Option 2',
      'Option 3',
    ]);
  });

  // subscribe to the select event
  searchInput.subscribe('select', selectedItem => {
    console.log(selectedItem.label, selectedItem.value);
  });

  // remove selection and current search results
  searchInput.reset();
*/
export default class SearchInput extends Mediator {
  constructor(element, options) {
    super();

    this._settings = Object.assign(
      {
        noResultsText: 'No results',
        useHiddenInput: true,
        initialValue: '',
        initialLabel: '',
        loader: true,
        minValueLength: 1,
      },
      options
    );

    if (element.tagName.toLowerCase() === 'input') {
      this.inputElement = element;
      this.inputElement.autocomplete = 'off';
      this.inputElement.value = this._settings.initialLabel;
      this.element = document.createElement('div');
      this.inputElement.insertAdjacentElement('afterend', this.element);

      const inputName = this.inputElement.name;
      if (this._settings.useHiddenInput) this.inputElement.removeAttribute('name');

      this.element.classList.add('search-input');
      this.element.appendChild(this.inputElement);

      this.element.insertAdjacentHTML(
        'beforeend',
        `
        <div class="item-list" tabindex="-1">
          <div class="message">${this._settings.noResultsText}</div>
        </div>
        ${this._settings.loader ? this.loaderTemplate : ''}
        ${this._settings.useHiddenInput ? `<input type="hidden" name="${inputName}" value="${this._settings.initialValue}">` : ''}
      `
      );
    } else {
      this.element = element;
    }

    this.searchInput = this.element.querySelector('input[type="text"]');
    this.hiddenField = this.element.querySelector('input[type="hidden"]');
    this.itemList = this.element.querySelector('.item-list');
    this.message = this.element.querySelector('.message');

    this.openClass = 'open';
    this.selectedClass = 'selected';
    this.filteredClass = 'filtered';
    this.loadingClass = 'loading';
    this.activeClass = 'active';
    this.itemClass = 'item';
    this.labelClass = 'label';

    this.instances = [];
    this.currentLabel = this.searchInput.value;
    this.currentValue = this.hiddenField ? this.hiddenField.value : this.searchInput.value;

    if (this._settings.loader) {
      this.loader = new Spinner({
        element: this.element.querySelector('.spinner'),
      });
    }

    const onWindowClick = function (e) {
      if (!document.body.contains(this.element)) {
        window.removeEventListener('click', this.onWindowClick);
        return;
      }

      if (e.target !== this.element && !this.element.contains(e.target) && this.element.classList.contains(this.openClass)) {
        this.close();

        // if search input has changed...
        if (this.searchInput.value.toLowerCase().trim() !== this.currentLabel.toLowerCase().trim()) {
          const matchingInstances = this.instances.filter(instance => this.searchInput.value === instance.element.textContent.toLowerCase().trim());

          if (matchingInstances.length) {
            this.onSelect(matchingInstances[0]);
          } else {
            this.searchInput.value = this.currentLabel;
            this.hiddenField.value = this.currentValue;
          }
        }
      }
    };

    this.onWindowClick = onWindowClick.bind(this);

    this.addEvents();
  }

  addEvents() {
    window.addEventListener('click', e => this.onWindowClick(e));

    this.searchInput.addEventListener('focus', _ => {
      if (this.instances.length) {
        this.setActive();
        this.open();
      }
    });

    this.searchInput.addEventListener('input', e => {
      this.close();

      if (e.target.value.trim() === '') {
        this.reset();
        return;
      }

      if (this.loader) {
        e.target.value.length >= this._settings.minValueLength ? this.onLoadStart() : this.onLoadEnd();
      }

      if (e.target.value.length >= this._settings.minValueLength) {
        this.publish('search', e.target.value);
      }
    });

    this.searchInput.addEventListener('blur', e => {
      if (!this.element.contains(document.activeElement)) {
        this.searchInput.value = this.currentLabel;
        this.hiddenField.value = this.currentValue;
      }

      if (this.loader) this.loader.hide();
    });

    ['keydown', 'keypress'].map(eventType => {
      this.searchInput.addEventListener(eventType, e => {
        switch (e.key) {
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

  get activeInstance() {
    return this.instances.filter(instance => instance.element.classList.contains(this.activeClass))[0];
  }

  get activeInstanceIndex() {
    return this.activeInstance ? this.instances.indexOf(this.activeInstance) : 0;
  }

  get value() {
    return this.currentValue;
  }

  navUp() {
    const activeIndex = this.activeInstanceIndex;

    if (this.instances[activeIndex - 1]) {
      const nextActiveInstance = this.instances[activeIndex - 1];

      const topVisible = isInView(nextActiveInstance.element, {
        scrollElement: this.itemList,
        area: 'top',
      });

      if (!topVisible) {
        this.itemList.scrollTop = nextActiveInstance.element.offsetTop;
      }

      this.setActive(nextActiveInstance);
    }
  }

  navDown() {
    const activeIndex = this.activeInstanceIndex;

    if (this.instances[activeIndex + 1]) {
      const nextActiveInstance = this.instances[activeIndex + 1];

      const bottomVisible = isInView(this.activeInstance.element, {
        scrollElement: this.itemList,
        area: 'bottom',
      });

      if (!bottomVisible) {
        this.itemList.scrollTop = nextActiveInstance.element.offsetTop;
      }

      this.setActive(nextActiveInstance);
    }
  }

  setActive(nextActiveInstance = this.instances[0]) {
    this.instances.map(instance => {
      if (instance.element === nextActiveInstance.element) {
        instance.element.classList.add(this.activeClass);
      } else {
        instance.element.classList.remove(this.activeClass);
      }
    });
  }

  onLoadStart() {
    this.element.classList.add(this.loadingClass);
    if (this.loader) this.loader.show();
  }

  onLoadEnd() {
    this.element.classList.remove(this.loadingClass);
    if (this.loader) this.loader.hide();
  }

  /**
   * removes current items and adds new ones
   * @param {array} data
   * @example
   * instance.addItems([{label: 'A', value: 1}, {label: 'B', value: 2}]);
   */
  addItems(data) {
    this.onLoadEnd();

    if (document.activeElement !== this.searchInput) {
      return;
    }

    this.message.style.display = data.length ? 'none' : 'block';

    // remove result elements from DOM
    this.instances.map(item => item.element.parentNode.removeChild(item.element));

    // empty the instances array
    this.instances = [];

    // insert search results
    data.map(itemData => {
      const itemElement = document.createElement('div');
      this.message.insertAdjacentElement('beforebegin', itemElement);

      this.instances.push(
        new SearchResult({
          parent: this,
          element: itemElement,
          data: itemData,
        })
      );
    });

    this.setActive();
    this.open();
  }

  reset() {
    this.instances.map(instance => this.itemList.removeChild(instance.element));

    this.instances = [];
    this.currentLabel = '';
    this.currentValue = '';

    this.searchInput.value = this.currentLabel;
    if (this.hiddenField) this.hiddenField.value = this.currentValue;

    if (this.loader) this.loader.hide();
    this.publish('empty');
  }

  enable() {
    this.searchInput.disabled = false;
    if (this.hiddenField) this.hiddenField.disabled = false;
  }

  disable() {
    this.searchInput.disabled = true;
    if (this.hiddenField) this.hiddenField.disabled = true;
  }

  setValue(value, label) {
    this.currentValue = value;
    this.currentLabel = label || this.currentValue;

    this.searchInput.value = this.currentLabel;
    this.hiddenField.value = this.currentValue;
  }

  get loaderTemplate() {
    return `
      <div class="spinner" style="width:1.5rem; height:1.5rem; position:absolute; top:0.5rem; right:0.5rem; display:none;">
        <div>
          <div></div>
          <div></div>
        </div>
      </div>
    `;
  }

  onSelect(instance = this.activeInstance) {
    if (!instance) return;

    const itemElementIndex = this.instances.indexOf(instance);
    const nextActiveInstance = this.instances[itemElementIndex + 1] || this.instances[0];

    this.setActive(nextActiveInstance);

    instance.element.classList.add(this.selectedClass);
    instance.element.classList.remove(this.activeClass);

    this.close();

    this.currentLabel = instance.label;
    this.currentValue = instance.value;

    this.setValue(this.currentValue, this.currentLabel);

    this.publish('select', instance.data);
  }
}

class SearchResult {
  constructor(args) {
    this.parent = args.parent;
    this.element = args.element;
    this.data = args.data;

    this.render();
  }

  addEvents() {
    this.element.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.parent.onSelect(this);
    });
  }

  get label() {
    return typeof this.data === 'object' ? this.data.label : this.data;
  }

  get value() {
    return typeof this.data === 'object' ? this.data.value : this.data;
  }

  render() {
    this.element.classList.add('item');
    this.element.setAttribute('data-value', typeof this.data === 'object' ? this.data.value : this.data);
    this.element.innerHTML = this.template;

    this.addEvents();
  }

  get template() {
    return typeof this.data === 'object'
      ? `
      ${this.data.template ? this.data.template : this.data.label}
    `
      : this.data;
  }
}
