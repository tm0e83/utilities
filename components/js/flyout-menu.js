import Mediator from './mediator.js';

/**
 * @class
 * @description class for creating a flyout-menu
 * @param {node} element the outer .flyout-menu element
 * @param {node=} container the container, where the menu is supposed to be inserted
 * @method addEntries
 * @method open
 * @method close
 * @example
  div class="flyout-menu" id="my-flyout">
    <a class="flyout-trigger"><i class="fas fa-ellipsis-v"></i></a>
    <ul>
      <li>
        <a>menu entry</a>
      </li>
    </ul>
  </div>

  @import 'flyout-menu.scss';

  import FlyoutMenu from 'flyout-menu.js';

  new FlyoutMenu({
    element: document.querySelector('#my-flyout')
  });
 */
export default class FlyoutMenu extends Mediator {
  constructor(args) {
    super();
    if (!args) return;
    if (!args.element && !args.container) return;

    this.element = args.element;
    this.container = args.container;

    if (typeof jQuery !== 'undefined' && this.element instanceof jQuery) this.element = $(this.element).get(0);

    this.menuClass = args.menuClass || 'flyout-menu';
    this.triggerClass = args.triggerClass || 'flyout-trigger';
    this.openClass = args.openClass || 'is-open';
    this.isOpen = false;

    const onWindowClick = function (e) {
      if (!document.body.contains(this.element)) {
        window.removeEventListener('click', this.onWindowClick);
        return;
      }

      if (!this.element.contains(e.target) && this.isOpen) {
        this.close();
      }
    };

    this.onWindowClick = onWindowClick.bind(this);

    if (this.container) {
      this.render();
    } else {
      this.element = args.element;
      this.trigger = this.element.querySelector(`.${this.triggerClass}`);
      this.flyout = this.element.querySelector('ul');
      this.addEvents();
    }

    if (args.entries) this.addEntries(args.entries);
  }

  render() {
    if (this.element) this.element.parentElement.removeElement(this.element);
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.trigger = this.element.querySelector(`.${this.triggerClass}`);
    this.flyout = this.element.querySelector('ul');
    this.element.classList.add(this.menuClass);
    this.container.insertAdjacentElement('beforeend', this.element);
    this.addEvents();
  }

  addEvents() {
    this.trigger.addEventListener('click', e => (this.isOpen ? this.close() : this.open()));

    window.addEventListener('click', this.onWindowClick);
  }

  open() {
    this.element.classList.add(this.openClass);
    this.isOpen = true;
    this.publish('open', this);
  }

  close() {
    this.element.classList.remove(this.openClass);
    this.isOpen = false;
    this.publish('close', this);
  }

  getElement() {
    return this.element;
  }

  /**
   * Add new options to the menu
   * @param {Object} entryData - array containing an object for each menu entry
   * @param {string} menuEntry.text - the label of the menu entry
   * @param {string=} menuEntry.href - the href of the menu entry
   * @param {string=} menuEntry.classAttribute - the class attribute of the menu entry
   */
  addEntries(entryData, getTemplateFn = '') {
    entryData.map(data => {
      const entryElement = document.createElement('li');
      this.flyout.insertAdjacentElement('beforeend', entryElement);

      new MenuEntry({
        element: entryElement,
        data: data,
        getTemplate: getTemplateFn,
      });
    });
  }

  /**
   * Returns the menu template
   * @param {object} data - object containing the settings for the menu
   * @param {string} data.triggerLabel - the html template string used for the trigger element
   */
  get template() {
    return `
      ${
        this.triggerLabel
          ? this.triggerLabel
          : `
        <a class="${this.triggerClass}"><i class="fas fa-ellipsis-v"></i></a>
      `
      }
      <ul></ul>
    `;
  }
}

class MenuEntry {
  constructor(args) {
    this.element = args.element;
    this.data = args.data;
    this.getTemplate = args.getTemplate || this.getTemplate;

    this.render();
  }

  render() {
    this.element.innerHTML = this.getTemplate(this.data);
    if (this.data.classAttribute) this.element.classAttribute = this.data.classAttribute;
  }

  getTemplate(data) {
    return `
      <a
        ${data.className ? `class="${data.className}"` : ``}
        ${data.href ? `href="${data.href}"` : ``}
      >
        ${data.text}
      </a>
    `;
  }
}

export { FlyoutMenu };
