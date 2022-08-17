import { Mediator } from '../util/mediator';

/**
 * @description Class for dropdowns with multiple checkbox-options; with search bar
 * @param {object} container jQuery Object of the outer container
 * @param {object} args class settings
 * @event open fires when the menu opens
 * @event close fires when the menu closes
 * @event clearAll fires after the selection is cleared
 * @event selectionChange fires after one or more options are selected or deselected
 * @event optionSelect fires after one option is selected
 * @event optionDeselect fires after one option is deselected
 */
export default class MultiCheckboxDropdown extends Mediator {
	constructor(container, args) {
		super();

		if(!container) return;
		this.element = typeof jQuery !== 'undefined' && container instanceof jQuery ? $(container).get(0) : container;

		this.parseNumeric = args && args.parseNumeric ? args.parseNumeric : false;
		this.optionTemplate = args && args.optionTemplate ? args.optionTemplate : null;

		this.label = this.element.querySelector('.uic-label');
		this.input = this.element.querySelector('.uic-input');
		this.menu = this.element.querySelector('.uic-menu');
		this.submenu = this.element.querySelector('.uic-submenu');
		this.selectAll = this.element.querySelector('.uic-select-all');
		this.selectAllLabel = this.element.querySelector('.uic-select-all-label');
		this.selectAllVisibleLabel = this.element.querySelector('.uic-select-all-visible-label');
		this.scrollable = this.element.querySelector('.uic-scrollable');
		this.optionRows = this.element.querySelectorAll('.uic-option-row');
		this.message = this.element.querySelector('.uic-message');
		this.selectedClass = 'uic-selected';
		this.expandedClass = 'uic-expanded';
		this.numSelectedOut = this.element.querySelectorAll('.uic-num-selected-out');
		this.selectedValues = [];
		this.optionColumns = 1;
		this.labelHeight = this.label ? this.label.getBoundingClientRect().height : 0;
		this.isAnimating = false;
		this.isExpanded = false;
		this.lazyEventsBound = false;
		this.isDisabled = this.element.classList.contains('uic-is-disabled');
		this.dropdownStyle = this.element.getAttribute('data-uic-dropdown-style') || 'dropdown';

		const onWindowClick = function(e) {
			if (!document.body.contains(this.element)) {
				window.removeEventListener('click', this.onWindowClick);
				return;
			}

			if(this.isDisabled === true || !this.element) return;
			if(this.element.contains(e.target) === false && this.isExpanded === true) {
				this.closeMenu();
			}
		}

		this.onWindowClick = onWindowClick.bind(this);

		if(this.isTouchDevice()) this.scrollable.classList.add('uic-mobile-scrollbar');
		this.addEvents();
		this.setNumSelected();

		const keyupEvent = document.createEvent('HTMLEvents');
		keyupEvent.initEvent('keyup', false, true);
		this.input.dispatchEvent(keyupEvent);
	}

	disable() {
		this.isDisabled = true;
		[...this.optionRows].map(row => row.querySelector('input').disabled = true);
		if(this.selectAll) this.selectAll.disabled = true;
		this.element.classList.add('uic-is-disabled');
	}

	enable() {
		this.isDisabled = false;
		[...this.optionRows].map(row => row.querySelector('input').disabled = false);
		if(this.selectAll) this.selectAll.disabled = false;
		this.element.classList.remove('uic-is-disabled');
	}

	addEvents() {
		if(this.dropdownStyle.match('accordion|none') === null) {
			window.addEventListener('click', this.onWindowClick);
		}

		if(this.dropdownStyle != 'none') {
			this.label.addEventListener('click', e => {
				if(this.isDisabled === true) return;
				this.isExpanded === false ? this.showMenu() : this.closeMenu();
			});
		}

		this.input.addEventListener('keyup', e => {
			this.filterItems();

			if(this.selectAll) {
				this.toggleSubmenu();
				this.toggleSelectAllCheckbox();
			}
		});

		if(this.selectAll) {
			this.selectAll.addEventListener('change', _ => {
				if(this.isDisabled === true) return;
				let changedValues = this.selectAllVisible(!!this.selectAll.checked);

				this.publish('selectionChange', {
					selectedValues: this.getAllSelectedValues(),
					currentValue: changedValues
				});

				this.setNumSelected();
			});
		}

		if(this.dropdownStyle == 'dropdown') {
			this.subscribe('menuOpen', _ => {
				if(!this.lazyEventsBound) {
					[...this.optionRows].map(row => this.addOptionEvents(row));
					this.lazyEventsBound = true;
				}
			})
		} else {
			[...this.optionRows].map(row => this.addOptionEvents(row));
		}
	}

	setNumSelected() {
		[...this.numSelectedOut].map(element => element.innerHTML = this.getAllSelectedValues().length);
	}

	addOptionEvents(row) {
		let checkbox = row.querySelector('input');

		checkbox.addEventListener('change', e => {
			if(this.isDisabled === true) return;
			if(this.selectAll) this.toggleSelectAllCheckbox();
			let o = {
				selectedValues: this.getAllSelectedValues(),
				currentValue: checkbox.value
			};
			this.publish('selectionChange', o);
			this.publish(checkbox.checked === true ? 'optionSelect' : 'optionDeselect', o);
			this.setNumSelected();
		});
	}

	toggleSubmenu() {
		if(this.getAllVisibleOptionRows().length == this.optionRows.length) {
			this.selectAllVisibleLabel.style.display = 'none';
			this.selectAllLabel.style.display = 'block';
		} else {
			this.selectAllLabel.style.display = 'none';
			this.selectAllVisibleLabel.style.display = 'block';
		}
	}

	toggleSelectAllCheckbox() {
		this.selectAll.checked = this.getAllVisibleOptionRows().length == this.getAllVisibleSelectedOptionRows().length;
		return this.selectAll.checked;
	}

	selectAllVisible(check) {
		let checkboxes = [];

		[...this.getAllVisibleOptionRows()].map(row => {
			let checkbox = row.querySelector('input');
			if(!checkbox.disabled) {
				checkbox.checked = check;
				checkboxes.push(checkbox.value);
			}
		});

		return checkboxes;
	}

	getAllVisibleOptionRows() {
		return [...this.optionRows].filter(row => window.getComputedStyle(row).display == 'flex');
	}

	getAllVisibleSelectedOptionRows() {
		return [...this.getAllVisibleOptionRows()].filter(row => row.querySelector('input').checked);
	}

	filterItems() {
		const searchString = this.input.value,
					searchRegexp = searchString.trim() === '' ? /.*/ : new RegExp('.*' + searchString.trim() + '.*', 'gi');

		[...this.optionRows].map(row => {
			const textContent = row.innerHTML.replace(/<[^>]*>/g, '').trim();
			row.style.display = textContent.match(searchRegexp) === null ? 'none' : 'flex';
		});

		this.message.style.display = this.getAllVisibleOptionRows().length === 0 ? 'block' : 'none';
	}

	showMenu() {
		this.publish('menuOpen', {});
		this.element.classList.add(this.expandedClass);
		this.menu.style.display = 'block';
		this.isExpanded = true;

		if(!this.isTouchDevice()) {
			this.input.focus();
		}
	}

	closeMenu() {
		if(this.isAnimating === true) return;

		this.publish('menuClose', {});
		this.isAnimating = true;

		this.element.classList.remove(this.expandedClass);
		this.menu.style.display = 'none';
		this.input.value = '';
		this.isAnimating = false;
		this.isExpanded = false;

		const keyupEvent = document.createEvent('HTMLEvents');
		keyupEvent.initEvent('keyup', false, true);
		this.input.dispatchEvent(keyupEvent);

		this.publish('menuClose', {
			selectedValues: this.getAllSelectedValues(),
			currentValue: null
		});
	}

	getAllSelectedValues() {
		let allSelectedValues = [];
		[...this.optionRows].map(row => {
			const cb = row.querySelector('input');
			if(cb.checked) {
				allSelectedValues.push(this.parseNumeric && !isNaN(parseInt(cb.value)) ? parseInt(cb.value) : cb.value);
			}
		});
		return allSelectedValues;
	}

	getAllUnselectedValues() {
		let allUnselectedValues = [];
		[...this.optionRows].map(row => {
			const cb = row.querySelector('input');
			if(!cb.checked) {
				allUnselectedValues.push(cb.value)
			}
		});
		return allUnselectedValues;
	}

	getAllSelectedLabels(selector = null) {
		let allSelectedLabels = [];
		[...this.optionRows].map(row => {
			if(row.querySelector('input').checked) {
				if(selector) allSelectedLabels.push([...row.querySelectorAll(selector)].map(el => el.textContent.trim()));
				else allSelectedLabels.push(row.textContent.trim());
			}
		});
		return allSelectedLabels;
	}

	getAllValues() {
		let allValues = [];
		[...this.optionRows].map(r => allValues.push(e.querySelector('input').value));
		return allValues;
	}

	isTouchDevice() {
		return 'ontouchstart' in window || navigator.maxTouchPoints;
	};

	clear(c) {
		let isChecked = c === undefined ? true : c;
		this.selectedValues = isChecked === true ? this.getAllSelectedValues() : [];
		this.input.value = '';
		this.filterItems();
		if(this.selectAll) this.selectAll.checked = isChecked;
		[...this.optionRows].map(r => {
			if(r.style.display == 'none') r.style.display = 'flex';
			r.querySelector('input').checked = isChecked;
		});
		this.setNumSelected();
		this.publish('clearAll', this.selectedValues);

		return this.selectedValues;
	}

	removeOptions() {
		this.selectedValues = [];
		this.scrollable.innerHTML = '';
		this.optionRows = this.element.querySelectorAll('.uic-option-row');
		return this;
	}

	addOptions(data, mapper = {}, optionTemplate = null, idPrefix = '') {
		let rows = '';
		let defaultMapper = {
			id: 'id',
			value: 'value',
			name: 'name',
			label: 'label',
			checked: 'checked',
			disabled: 'disabled'
		};
		let keyMap = Object.assign({}, defaultMapper, mapper);

		data.map(d => {
			const disabled = this.isDisabled || d[keyMap.disabled];

			if(optionTemplate) {
				rows += optionTemplate(d, keyMap, d[keyMap.checked], disabled, idPrefix);
			} else if(this.optionTemplate) {
				rows += this.optionTemplate(d, keyMap, d[keyMap.checked], disabled, idPrefix);
			} else {
				rows += `
					<label for="${idPrefix}${d[keyMap.id]}" class="uic-option-row">
						<div>
							<input type="checkbox" id="${d[keyMap.id]}" value="${d[keyMap.value]}"
								${d[keyMap.checked] ? `checked` : ``}
								${disabled ? `disabled` : ``}
							>
						</div>
						<div><label for="${d[keyMap.id]}">${d[keyMap.label]}</label></div>
					</label>
				`;
			}
		});

		this.scrollable.insertAdjacentHTML('beforeend', rows);
		this.optionRows = this.scrollable.querySelectorAll('.uic-option-row');
		[...this.optionRows].map(row => this.addOptionEvents(row));
		this.message.style.display = 'none';

		if(this.optionRows.length && this.selectAll) {
			this.selectAll.checked = this.hasAllSelected();
		}

		this.setNumSelected();
		return this.optionRows;
	}

	hasAllSelected() {
		return this.getAllVisibleSelectedOptionRows().length == this.optionRows.length;
	}

	unselectAll() {
		[...this.optionRows].querySelector('input').map(r => r).checked = false;
		if(this.selectAll) this.selectAll.checked = false;
	}

	selectOptionsByValue(values) {
		[...this.optionRows].map(row => {
			let input = row.querySelector('input');
			if(values.indexOf(input.value) != -1) {
				input.checked = true;
			}
		})
	}
}

/**
 * returns the template for a MultiCheckboxDropdown option
 * @param {Object} d - JSON data for the option
 * @param {Object} keyMap - data mapper object
 * @param {string} checked - checked status of the option's checkbox
 * @param {string} disabled - disable status of the option's checkbox
 * @param {string} idPrefix - used as prefix for the input's ID attribute
 */
const multiCheckboxDropdownOptionTemplate = (d, keyMap, checked = true, disabled = false, idPrefix = 'option-') => {
  return `
    <label for="${idPrefix}${d[keyMap.id]}" class="uic-option-row" >
      <div>
        <div class="uic-pretty-checkbox ${disabled ? `uic-disabled` : ``}">
          <input
            type="checkbox"
            id="${idPrefix}${d[keyMap.id]}"
            value="${d[keyMap.value]}"
           	${keyMap.name && d[keyMap.name] ? `name="${d[keyMap.name]}"` : ``}
            ${checked ? `checked` : ``}
            ${disabled ? `disabled` : ``}
          >
          <label for="${idPrefix}${d[keyMap.id]}"></label>
        </div>
      </div>
      <div>
        <label for="${idPrefix}${d[keyMap.id]}">
          ${d[keyMap.label]}
        </label>
      </div>
    </label>
  `;
};

export { MultiCheckboxDropdown, multiCheckboxDropdownOptionTemplate };