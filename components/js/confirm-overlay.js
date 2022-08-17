import Mediator from './mediator.js';

/**
 * @description class for showing a confirm window, which has a confirm and a cancel button.
 * you can either pass the overlay as 'element' or define a target 'container', where the overlay is supposed to be created.
 * @param {node=} container target container element where the confirm overlay will be created
 * @param {node=} element overlay element. If 'container' option is not set, element is required
 * @param {string=} headline the headline text
 * @param {string=} description = the description text
 * @param {string=} buttonConfirmLabel the text on the confirm button
 * @param {string=} buttonConfirmColorClass - e.g. 'alert' or 'success'
 * @param {string=} buttonCancelLabel the text on the cancel button
 * @param {string=} position css 'position'
 * @param {number=} maxWidth css 'max-width
 * @param {number=} zIndex css 'z-index'
 * @param {boolean=} closeOnCancel close the overlay when clicking the cancel button
 * @fires confirm
 * @fires cancel
 * @fires open
 * @fires close
 * @example
  @import 'confirm-overlay.scss';

  import ConfirmOverlay from 'confirm-overlay.js';

  const overlay = new ConfirmOverlay({
    container: document.body,
    headline: 'Need vacations?',
    buttonConfirmLabel: 'YES!',
    buttonCancelLabel: 'nope',
    position: 'fixed',
  });

  overlay.subscribe('confirm', (instance, data) => {
    console.log(data); // logs 'hello';
    instance.close();
  });

  overlay.subscribe('cancel', (instance, data) => {
    instance.close();
  });

  overlay.open('hello');
 */
export default class ConfirmOverlay extends Mediator {
  constructor(args) {
    super(args);
    this.container = args.container || args.targetContainer || document.body;
    if (this.container && typeof jQuery !== 'undefined' && this.container instanceof jQuery) this.container = this.container.get(0);
    this.headline = args.headline || 'Really?';
    this.description = args.description || '';
    this.content = args.content || '';
    this.buttonConfirmLabel = args.buttonConfirmLabel || 'Confirm';
    this.buttonConfirmColorClass = args.buttonConfirmColorClass || '';
    this.buttonCancelLabel = args.buttonCancelLabel || 'Cancel';
    this.position = args.position; // value for css style 'position'
    this.maxWidth = args.maxWidth; // max-width number in px
    this.zIndex = args.zIndex;
    this.closeOnCancel = args.closeOnCancel || false;
    this.closeOnSubmit = args.closeOnSubmit || false;

    this.data = null;
    this.element = null;
    this.openClass = 'open';

    if (args.openButton) {
      this.openButton = args.openButton.length ? args.openButton : [args.openButton];
    } else {
      this.openButton = [];
    }

    if (this.container) {
      this.render();
    } else {
      this.element = args.element;
      this.addEvents();
    }
  }

  render() {
    if (this.element) this.element.parentElement.removeChild(this.element);

    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.innerElement = this.element.querySelector('div');
    this.element.classList.add('confirm-overlay');

    if (this.position) this.element.style.position = this.position;
    if (this.zIndex) this.element.style.zIndex = this.zIndex;

    this.container.insertAdjacentElement('beforeend', this.element);
    this.addEvents();
  }

  addEvents() {
    if (this.openButton) {
      [...this.openButton].map(button => button.addEventListener('click', e => this.open()));
    }

    this.element.querySelector('.button-confirm').addEventListener('click', e => {
      e.stopPropagation();
      this.publish('confirm', this, this.data);
      if (this.closeOnSubmit) this.close();
    });

    this.element.querySelector('.button-cancel').addEventListener('click', e => {
      e.stopPropagation();
      this.publish('cancel', this, this.data);
      if (this.closeOnCancel) this.close();
    });
  }

  open(args) {
    this.data = args;
    this.element.classList.add(this.openClass);
    this.publish('open', this, this.data);
  }

  close() {
    this.element.classList.remove(this.openClass);
    this.publish('close', this, this.data);
    this.data = null;
  }

  get template() {
    return `
      <div${this.maxWidth ? ` style="max-width:${this.maxWidth}px"` : ''}>
        <h5>${this.headline}</h5>
        ${this.description ? `<p class="text-center">${this.description}</p>` : ''}
        ${this.content ? `<div class="content">${this.content}</content>` : ''}
        <div class="buttons">
          <a title="${this.buttonCancelLabel}" class="button hollow button-cancel">${this.buttonCancelLabel}</a>
          <a title="${this.buttonConfirmLabel}" class="button ${this.buttonConfirmColorClass} button-confirm">${this.buttonConfirmLabel}</a>
        </div>
      </div>
    `;
  }
}

export { ConfirmOverlay };
