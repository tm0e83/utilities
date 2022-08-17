import {
  Mediator
} from "../util/mediator";

/**
 * @description Class input fields for adding search/filter tags
 * @param {object} container element node or jQuery object of the outer container
 * @param {object} options class settings
 * @event inputEmpty fires when the input field is emptied
 * @event inputFill fires when the input field is filled
 * @event itemAdd fires when an item is added
 * @event itemRemove fires when an item is removed
 * @event clearAll fires when all items are removed at the same time
 */
export default class MultiFilterInput extends Mediator {
  constructor(container, config) {
    super();

    this.element = typeof jQuery !== 'undefined' && container instanceof jQuery ? $(container).get(0) : container;

    const defaults = {
      confirmKeys: [] // e.key
    };

    this.o = Object.assign({}, defaults, config || {});

    this.input = this.element.querySelector('.uic-input');
    this.hiddenInput = this.element.querySelector('[type="hidden"]');
    this.selection = this.element.querySelector('.uic-selection');
    this.defaultText = this.element.querySelector('.uic-default-text');
    this.addButton = this.element.querySelector('.uic-add');

    this.elementClass = 'uic-multi-filter-input';
    this.addButtonClass = 'uic-add';
    this.selectedClass = 'uic-selected';
    this.removeButtonClass = 'uic-remove';
    this.activeClass = 'uic-active';
    this.hasInputClass = 'uic-has-input';
    this.dataAttrName = 'data-uic-item-value';

    this.selectedItems = [];
    this.selectedValues = [];
    this.addEvents();
    this.inputIsEmpty = true;
    this.handlePreselection();
  }

  handlePreselection() {
    [...this.selection.querySelectorAll('.' + this.selectedClass)].map(item => {
      let value = item.getAttribute(this.dataAttrName);

      this.selectedItems.push({
        selectedItem: item,
        value: value
      });

      this.addSelectedItemEvents(item);
    });
    this.toggleDefaultText();
    this.updateValues();
  }

  addSelectedItemEvents(selectedItem) {
    selectedItem.querySelector('i').addEventListener('click', _ => this.removeSearchTag(selectedItem));
  }

  addEvents() {
    window.addEventListener('click', e => {
      if (!this.element.contains(e.target)) {
        this.toggleDefaultText();

        if (!e.target.classList.contains(this.removeButtonClass)) {
          this.element.classList.remove(this.activeClass);
        }
      }

      if (e.target.classList.contains('.' + this.addButtonClass)) {
        this.toggleDefaultText();
      }
    });

    this.element.addEventListener('click', e => {
      this.input.focus();
      if (e.target !== this.input) this.setCursorToEnd();
    });

    if (this.addButton) {
      this.addButton.addEventListener('click', e => {
        if (this.input.textContent.trim() !== '') {
          this.addSearchTag(e);
          this.toggleDefaultText();
        }
        this.toggleHasInputClass();
        e.preventDefault();
      });
    }

    this.input.addEventListener('blur', e => {
      if (this.input.textContent.trim() !== '') {
        this.addSearchTag(e);
        this.toggleDefaultText();
      }
      this.toggleHasInputClass();
      e.preventDefault();
    });

    this.input.addEventListener('blur', _ => this.toggleHasInputClass());
    this.input.addEventListener('keypress', e => {
      this.toggleDefaultText();
      if (this.input.textContent.trim().length === 0) return false;
      if (e.key != 'Enter' && !this.o.confirmKeys.includes(e.key)) return;
      e.preventDefault();
      this.addSearchTag(e);

      const evt = document.createEvent('HTMLEvents');
      evt.initEvent('keyup', false, true);
      this.input.dispatchEvent(evt);
    });

    this.input.addEventListener('keyup', _ => {
      this.notifyInputState();
      this.toggleDefaultText();
      this.removeItemOnNextBackSpace = this.input.textContent.trim().length === 0 && this.selectedItems.length !== 0;
    });

    this.input.addEventListener('keydown', e => {
      if (this.removeItemOnNextBackSpace === false) return;
      let key = e.keyCode || e.charCode;
      if (key == 8 && this.input.textContent.trim().length === 0 && this.selectedItems.length !== 0) {
        const selected = [...this.selection.querySelectorAll('.' + this.selectedClass)];
        this.removeSearchTag(selected[selected.length - 1]);
        this.removeItemOnNextBackSpace = false;
      }
    });

    this.input.addEventListener('focus', _ => this.element.classList.add(this.activeClass));
    ['itemAdd', 'itemRemove'].map(eventType => this.subscribe(eventType, this.notifyInputState()));
  }

  toggleHasInputClass() {
    if (this.addButton) this.addButton.classList[this.input.textContent.trim() !== '' ? 'add' : 'remove'](this.hasInputClass);
  }

  removeLineBreaks() {
    let inner = this.input.textContent.trim().replace('<br>', '');
    this.input.html(inner);
  }

  setCursorToEnd() {
    let range = document.createRange();
    range.selectNodeContents(this.input);
    range.collapse(false);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  notifyInputState() {
    if (this.inputIsEmpty === false && this.input.textContent.trim().length === 0) {
      this.inputIsEmpty = true;
      this.publish('inputEmpty', this);
    }
    if (this.inputIsEmpty === true && this.input.textContent.trim().length > 0) {
      this.inputIsEmpty = false;
      this.publish('inputFill', this);
    }
  }

  toggleDefaultText() {
    let displayStyle = this.input.textContent.trim().length === 0 && this.selectedItems.length === 0 ? 'inline-block' : 'none';
    this.defaultText.style.display = displayStyle;
  }

  addSearchTag(e) {
    const selectedItemContainer = document.createElement('div');
    selectedItemContainer.classList.add(this.selectedClass);
    selectedItemContainer.insertAdjacentHTML('beforeend', `${this.input.textContent.trim()} <i class="${this.removeButtonClass}"></i>`);
    this.defaultText.insertAdjacentElement('beforebegin', selectedItemContainer);

    this.addSelectedItemEvents(selectedItemContainer);

    let newItemObject = {
      selectedItem: selectedItemContainer,
      value: this.input.textContent.trim()
    };

    this.selectedItems.push(newItemObject);
    this.updateValues();
    this.input.innerHTML = '';

    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('focus', false, true);
    this.input.dispatchEvent(evt);

    this.publish('itemAdd', Object.assign({}, newItemObject, {
      selectedItem: newItemObject.selectedItem
    }));
  }

  removeSearchTag(selectedItemContainer) {
    let selectedItemObject;
    let selectedItemIndex;

    this.selectedItems.map((item, i) => {
      if (item.selectedItem === selectedItemContainer) {
        selectedItemObject = item;
        selectedItemIndex = i;
      }
    });

    selectedItemContainer.parentElement.removeChild(selectedItemContainer);

    this.selectedItems.splice(selectedItemIndex, 1);
    this.updateValues();
    this.toggleDefaultText();

    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('focus', false, true);
    this.input.dispatchEvent(evt);

    this.setCursorToEnd();

    this.publish('itemRemove', Object.assign({}, selectedItemObject, {
      selectedItem: selectedItemObject.selectedItem
    }));
  }

  updateValues() {
    let values = this.selectedItems.map(item => item.value);
    this.selectedValues = values;
    this.hiddenInput.value = values.join(',');
  }

  clear() {
    let selectedItemObjects = this.selectedItems;
    this.selectedItems = [];
    this.selectedValues = [];
    [...this.selection.querySelectorAll('.' + this.selectedClass)].map(item => item.parentElement.removeChild(item));
    this.hiddenInput.value = '';
    this.toggleDefaultText();
    this.input.innerHTML = '';
    this.publish('clear');
    return selectedItemObjects;
  }

  getAllSelectedValues() {
    return this.selectedValues;
  }

  get hasInput() {
    return this.inputIsEmpty === false;
  }
}