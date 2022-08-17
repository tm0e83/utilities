import Mediator from 'application/src/js/util.js';

import { isElementVisible } from '../../global/js/functions.js';

/**
 * watches an element wheather it is visible in the viewport or not
 *
 * @example
  new VisibilityWatcher({
    elements: [
      document.querySelector('section#one'),
      document.querySelector('section#two'),
    ]
  });
 */
export default class VisibilityWatcher extends Mediator {
  constructor(args) {
    super();

    this.elements = args.elements;
    this.once = typeof args.once === 'boolean' ? args.once : true;
    this.visibleElements = [];

    this.visibleClass = args && typeof args.visibleClass === 'string' ? args.visibleClass : 'visible';

    this.addEvents();
  }

  addEvents() {
    window.addEventListener('scroll', _ => {
      this.elements.map(element => {
        if (element) {
          if (isElementVisible(element) && !this.visibleElements.includes(element)) {
            this.onVisible(element);
          } else {
            if (!this.once) {
              this.onInvisible(element);
            }
          }
        }
      });
    });
  }

  onVisible(element) {
    this.visibleElements.push(element);
    element.classList.add(this.visibleClass);
    this.publish('visible', element);
  }

  onInvisible(element) {
    this.visibleElements = this.visibleElements.filter(el => el !== element);
    element.classList.remove(this.visibleClass);
    this.publish('invisible', element);
  }
}
