/**
 * DO NOT USE! Reactoring required!
 */

import {
  Mediator
} from '../util/mediator';

/**
 * @description Class for filters with two lists (available items <> chosen items)
 * @param {object} container jQuery Object of the outer container
 * @param {object} options class settings
 * @event selectionChange fires whenever items are added or removed and passes all selected items
 * @example
    <?php echo $this->partial('application/helper/translations/script/uic-two-list-filter.phtml'); ?>

    <div
      class="uic-two-list-filter"
    >
      <input type="hidden" name="NAME_OF_OPTIONAL_HIDDEN_FIELD">
      <div class="uic-available-header">
        <input type="text" class="uic-search-available" placeholder="${translations.uicTwoListFilter.search}...">
        <a class="uic-add-all" href="#">
          <span class="uic-add-all-label">${translations.uicTwoListFilter.addAll}</span>
          <span class="uic-add-visible-label">${translations.uicTwoListFilter.addAllVisible}</span>
        </a>
      </div>
      <div class="uic-chosen-header">
        <input type="text" class="uic-search-chosen" placeholder="${translations.uicTwoListFilter.search}...">
        <a class="uic-remove-all" href="#">
          <span class="uic-remove-all-label">${translations.uicTwoListFilter.removeAll}</span>
          <span class="uic-remove-visible-label">${translations.uicTwoListFilter.removeAllVisible}</span>
        </a>
      </div>
      <div class="uic-column-available">
        <ul class="uic-list">
          <li data-uic-value="1">Item 1</li>
          <li data-uic-value="2">Item 2</li>
        </ul>
      </div>
      <div class="uic-column-nav">
        <ul>
          <li><button class="uic-add"><i class="fas fa-angle-double-right"></i></button></li>
          <li><button class="uic-remove"><i class="fas fa-angle-double-left"></i></button></li>
        </ul>
      </div>
      <div class="uic-column-chosen">
        <ul class="uic-list">
          <li data-uic-value="3">Item 3</li>
        </ul>
      </div>
      <div class="uic-available-footer">
        <div>
          <div><span class="uic-num-available-entries">0</span> ${translations.uicTwoListFilter.total}</div>
          <div><span class="uic-available-selected-count">0</span> ${translations.uicTwoListFilter.selected}</div>
        </div>
      </div>
      <div class="uic-chosen-footer">
        <div>
          <div><span class="uic-num-chosen-entries">0</span> ${translations.uicTwoListFilter.total}</div>
          <div><span class="uic-chosen-selected-count">0</span> ${translations.uicTwoListFilter.selected}</div>
        </div>
      </div>
    </div>

    new TwoListFilter(this.element.querySelector('#product-filter'));
 */
export default class TwoListFilter extends Mediator {
  constructor(element, options) {
    super();

    this.element = typeof jQuery !== 'undefined' && element instanceof jQuery ? $(element).get(0) : element;

    const defaults = {
      initialSort: true // set to true if options should be sorted on init
    };

    this.settings = Object.assign({}, defaults, options || {});

    this.listClass = 'uic-list';
    this.selectedClass = 'uic-selected';
    this.preselectedClass = 'uic-preselected';
    this.activeClass = 'uic-active';
    this.activeSearchFilterClass = 'uic-filtered';
    this.invisibleClass = 'uic-invisible';
    this.valueDataAttr = 'data-uic-value';

    this.hiddenField = this.element.querySelector('input[type="hidden"]');

    this.searchAvailable = this.element.querySelector('.uic-search-available');
    this.searchChosen = this.element.querySelector('.uic-search-chosen');

    this.addButton = this.element.querySelector('.uic-add');
    this.removeButton = this.element.querySelector('.uic-remove');
    this.addAllButton = this.element.querySelector('.uic-add-all');
    this.removeAllButton = this.element.querySelector('.uic-remove-all');

    this.availableItemsList = this.element.querySelector('.uic-column-available .uic-list');
    this.chosenItemsList = this.element.querySelector('.uic-column-chosen .uic-list');

    this.availableCount = this.element.querySelector('.uic-num-available-entries');
    this.chosenCount = this.element.querySelector('.uic-num-chosen-entries');

    this.availableSelectedCount = this.element.querySelector('.uic-available-selected-count');
    this.chosenSelectedCount = this.element.querySelector('.uic-chosen-selected-count');
    this.selectedValues = [...this.chosenItemsList.querySelectorAll('li')].map(item => item.getAttribute('data-uic-value'));

    if (this.hiddenField) this.hiddenField.value = this.selectedValues.join(',');

    // sort items
    if (this.settings.initialSort === true) {
      this.availableItemsList.innerHTML = [...this.availableItemsList.querySelectorAll('li')].sort((a, b) => {
        return a.textContent.localeCompare(b.textContent);
      }).reduce((html, current) => html += current.outerHTML, '');
    }

    this.updateCount();
    this.addEvents();
  }

  getSelectedFrom(items) {
    return items.filter(item => item.classList.contains(this.selectedClass));
  }

  addEvents() {
    this.searchAvailable.addEventListener('input', _ => this.filterItems(this.searchAvailable, this.availableItemsList));
    this.searchChosen.addEventListener('input', _ => this.filterItems(this.searchChosen, this.chosenItemsList));

    this.addListItemEvents(this.element.querySelectorAll('.' + this.listClass + ' li'));

    this.addButton.addEventListener('click', e => {
      e.preventDefault();
      let items = this.getSelectedFrom([...this.availableItemsList.querySelectorAll('li')]);
      items.map(item => item.classList.remove(this.selectedClass));

      if (items.length === 0) return;

      let sortedItems = [...this.chosenItemsList.querySelectorAll('li'), ...items].sort((a, b) => {
        return a.textContent.localeCompare(b.textContent);
      });

      sortedItems.map(item => item.classList.remove(this.selectedClass, this.preselectedClass));

      const itemsHTML = sortedItems.reduce((html, current) => html += current.outerHTML, '');
      items.map(item => item.parentElement.removeChild(item));

      this.chosenItemsList.innerHTML = itemsHTML;
      this.addListItemEvents([...this.chosenItemsList.querySelectorAll('li')]);
      this.updateCount();
      this.toggleHighlightButtons();
      this.clearSearch();
      this.publishValues(items, 'Add');
    });

    this.removeButton.addEventListener('click', e => {
      e.preventDefault();
      let items = this.getSelectedFrom([...this.chosenItemsList.querySelectorAll('li')]);
      items.map(item => item.classList.remove(this.selectedClass));

      if (items.length === 0) return;

      let sortedItems = [...this.availableItemsList.querySelectorAll('li'), ...items].sort((a, b) => {
        return a.textContent.localeCompare(b.textContent);
      });

      sortedItems.map(item => item.classList.remove(this.selectedClass, this.preselectedClass));

      const itemsHTML = sortedItems.reduce((html, current) => html += current.outerHTML, '');
      items.map(item => item.parentElement.removeChild(item));

      this.availableItemsList.innerHTML = itemsHTML;
      this.addListItemEvents([...this.availableItemsList.querySelectorAll('li')]);
      this.updateCount();
      this.toggleHighlightButtons();
      this.clearSearch();
      this.publishValues(items, 'Remove');
    });

    this.addAllButton.addEventListener('click', e => {
      e.preventDefault();
      this.selectAll();
    });

    this.removeAllButton.addEventListener('click', e => {
      e.preventDefault();
      this.unselectAll();
    });

    window.addEventListener('keyup', e => {
      if (e.shiftKey === false) {
        this.lastSelectedOption = null;
        const preselectedItems = [...this.element.querySelectorAll('li')].filter(item => item.classList.contains(this.preselectedClass));
        preselectedItems.map(item => {
          item.classList.remove(this.preselectedClass);
          item.classList.add(this.selectedClass);
        });
      }
    });
  }

  clearSearch() {
    this.searchAvailable.value = '';
    this.searchChosen.value = '';

    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('input', false, true);

    this.searchAvailable.dispatchEvent(evt);
    this.searchChosen.dispatchEvent(evt);
  }

  selectAll() {
    let items = [...this.availableItemsList.querySelectorAll('li')].filter(item => !item.classList.contains(this.invisibleClass));

    if (items.length === 0) return;

    let sortedItems = [...this.chosenItemsList.querySelectorAll('li'), ...items].sort((a, b) => {
      return a.textContent.localeCompare(b.textContent);
    });

    const itemsHTML = sortedItems.reduce((html, current) => {
      current.classList.remove(this.selectedClass, this.preselectedClass);
      html += current.outerHTML;
      return html;
    }, '');

    items.map(item => item.parentElement.removeChild(item));
    this.chosenItemsList.innerHTML = itemsHTML;

    this.addListItemEvents([...this.chosenItemsList.querySelectorAll('li')]);
    this.updateCount();
    this.toggleHighlightButtons();
    this.clearSearch();
    this.publishValues(items, 'Add');
  }

  unselectAll() {
    let items = [...this.chosenItemsList.querySelectorAll('li')].filter(item => !item.classList.contains(this.invisibleClass));

    if (items.length === 0) return;

    let sortedItems = [...this.availableItemsList.querySelectorAll('li'), ...items].sort((a, b) => {
      return a.textContent.localeCompare(b.textContent);
    });

    const itemsHTML = sortedItems.reduce((html, current) => {
      current.classList.remove(this.selectedClass, this.preselectedClass);
      html += current.outerHTML;
      return html;
    }, '');

    items.map(item => item.parentElement.removeChild(item));
    this.availableItemsList.innerHTML = itemsHTML;

    this.addListItemEvents([...this.availableItemsList.querySelectorAll('li')]);
    this.updateCount();
    this.toggleHighlightButtons();
    this.clearSearch();
    this.publishValues(items, 'Remove');
  }

  addListItemEvents(items) {
    [...items].map(item => {
      item.addEventListener('mousedown', e => {
        let list = e.target.parentElement;
        let targetList = [...this.element.querySelectorAll('.' + this.listClass)].filter(currentList => currentList !== list)[0];

        if (this.lastSelectedOption && this.lastSelectedOption.parentElement === targetList) {
          this.lastSelectedOption = null;
          [...targetList.querySelectorAll('li')].map(item => item.classList.remove(this.selectedClass));
        }

        if (e.shiftKey === true && this.lastSelectedOption !== null && [...list.querySelectorAll('.' + this.selectedClass)].length > 0) {
          this.toggleSelectRange(e);
        } else {
          this.toggleSelectOption(e);
        }

        [...targetList.querySelectorAll('li')].map(item => item.classList.remove(this.selectedClass, this.preselectedClass));
        this.updateCount();
        this.toggleHighlightButtons();
      });
    });
  }

  toggleSelectOption(event) {
    event.currentTarget.classList.toggle(this.selectedClass);
    this.lastSelectedOption = event.currentTarget;
  }

  toggleSelectRange(event) {
    let listItems = [...event.currentTarget.parentElement.querySelectorAll('li')];
    let lastSelectedOptionIndex = listItems.indexOf(this.lastSelectedOption);
    let currentOptionIndex = listItems.indexOf(event.currentTarget);
    let isSelected = this.lastSelectedOption.classList.contains(this.selectedClass);

    let startIndex = Math.min(lastSelectedOptionIndex, currentOptionIndex);
    let endIndex = Math.max(lastSelectedOptionIndex, currentOptionIndex);

    listItems.filter(item => item.classList.contains(this.preselectedClass)).map(item => item.classList.remove(this.preselectedClass));

    for (let i = startIndex; i <= endIndex; i++) {
      let currentOption = listItems[i];
      if (currentOption !== this.lastSelectedOption && currentOption.classList.contains(this.invisibleClass) === false) {
        if (isSelected === true) {
          currentOption.classList.add(this.preselectedClass);
        } else {
          currentOption.classList.remove(this.preselectedClass, this.selectedClass);
        }
      }
    }
  }

  filterItems(inputField, searchTargetList) {
    let regex = new RegExp(inputField.value, 'i');

    [...searchTargetList.querySelectorAll('li')].map(item => {
      if (item.textContent.match(regex) === null) {
        item.classList.add(this.invisibleClass);
        item.classList.remove(this.selectedClass);
      } else {
        item.classList.remove(this.invisibleClass);
      }
    });

    if ([...searchTargetList.querySelectorAll('.' + this.invisibleClass)].length > 0) {
      inputField.parentElement.classList.add(this.activeSearchFilterClass);
    } else {
      inputField.parentElement.classList.remove(this.activeSearchFilterClass);
    }

    this.updateCount();
  }

  updateCount() {
    let selectedCount = [...this.availableItemsList.querySelectorAll('.' + this.selectedClass)].length;
    let preselectedCount = [...this.availableItemsList.querySelectorAll('.' + this.preselectedClass + ':not(.' + this.selectedClass + ')')].length;
    this.availableSelectedCount.innerHTML = selectedCount + preselectedCount;

    let numEntries = [...this.availableItemsList.querySelectorAll('li')].filter(item => !item.classList.contains(this.invisibleClass)).length;
    this.availableCount.innerHTML = numEntries;

    selectedCount = [...this.chosenItemsList.querySelectorAll('.' + this.selectedClass)].length;
    preselectedCount = [...this.chosenItemsList.querySelectorAll('.' + this.preselectedClass)].filter(item => !item.classList.contains(this.selectedClass)).length;
    this.chosenSelectedCount.innerHTML = selectedCount + preselectedCount;

    numEntries = [...this.chosenItemsList.querySelectorAll('li')].filter(item => !item.classList.contains(this.invisibleClass)).length;
    this.chosenCount.innerHTML = numEntries;
  }

  toggleHighlightButtons() {
    if ([...this.availableItemsList.querySelectorAll('.' + this.selectedClass)].length > 0) {
      this.addButton.classList.add(this.activeClass);
    } else {
      this.addButton.classList.remove(this.activeClass);
    }

    if ([...this.chosenItemsList.querySelectorAll('.' + this.selectedClass)].length > 0) {
      this.removeButton.classList.add(this.activeClass);
    } else {
      this.removeButton.classList.remove(this.activeClass);
    }
  }

  clear() {
    const clickEvt = document.createEvent('HTMLEvents');
    clickEvt.initEvent('click', false, true);
    this.removeAllButton.dispatchEvent(clickEvt);

    const clearEvt = document.createEvent('HTMLEvents');
    clearEvt.initEvent('clear', false, true);
    this.element.trigger(clearEvt);
  }

  publishValues(items, action) {
    let chosenValues = [];
    [...this.chosenItemsList.querySelectorAll('li')].map(item => {
      chosenValues.push(item.getAttribute(this.valueDataAttr));
    });

    let actionValues = [];
    items.map(item => {
      actionValues.push(item.getAttribute(this.valueDataAttr));
    });

    this.selectedValues = chosenValues;
    if (this.hiddenField) this.hiddenField.value = this.selectedValues.join(',');
    this.publish('selectionChange', this);
  }

  getAllSelectedValues() {
    return this.selectedValues;
  }
}