import Mediator from './mediator.js';

/**
 * @class
 * @description class for creating a simple accordion
 * @param {node=} element the outer .accordion element
 * @param {node=} container the container, where the menu is supposed to be inserted (NOT YET IMPLEMENTED!)
 * @example
  <div class="accordion">
    <div class="acc-title" data-acc="1">Title</div>
    <div class="acc-content" data-acc="1">Content...</div>
  </div>

  @import 'accordion.scss';

  import Accordion from 'accordion.js';

  new Accordion({ element: document.querySelector('.accordion') });
 */

export default class Accordion extends Mediator {
  constructor(args) {
    super();

    if (!args) return;
    if (!args || (!args.element && !args.container)) return;

    this.element = args.element;
    this.container = args.container;

    this.isOpen = false;
    this.hideClass = 'hide';
    this.openClass = 'open';

    if (this.element) {
      this.addEvents();
    } else {
      // NOT YET IMPLEMENTED!
      this.render();
    }
  }

  addEvents() {
    [...this.element.querySelectorAll('.acc-title')].map(titleElement => {
      const accordionId = titleElement.getAttribute('data-acc');
      titleElement.addEventListener('click', _ => {
        titleElement.classList.contains(this.openClass) ? this.close(accordionId) : this.open(accordionId);
      });
    });
  }

  open(accordionId) {
    this.getTitleElement(accordionId).classList.add(this.openClass);
    this.getContentElement(accordionId).classList.add(this.openClass);
    this.publish('close', this, accordionId);
  }

  close(accordionId) {
    this.getTitleElement(accordionId).classList.remove(this.openClass);
    this.getContentElement(accordionId).classList.remove(this.openClass);
    this.publish('open', this, accordionId);
  }

  getTitleElement(accordionId) {
    return this.element.querySelector(`.acc-title[data-acc="${accordionId}"]`);
  }

  getContentElement(accordionId) {
    return this.element.querySelector(`.acc-content[data-acc="${accordionId}"]`);
  }

  // NOT YET IMPLEMENTED!
  render() {
    this.element = document.createElement('div');
    this.container.insertAdjacentElement('beforeend', this.element);
    this.element.innerHTML = this.template;

    this.addEvents();
  }

  get template() {
    return `
      NOT YET IMPLEMENTED!
    `;
  }
}

export { Accordion };
