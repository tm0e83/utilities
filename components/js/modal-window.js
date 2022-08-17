import { deepMerge, isTouchDevice } from '../../global/js/functions.js';
import Mediator from './mediator.js';

/**
 * @class
 * @description class for creating modal windows (overlay content)
 * @param {node} element the outer html element (.modal-window)
 * @param {object} options config object
 * @param {NodeList} options.openButton elements that open the modal on click
 * @fires beforeOpen Mediator event fires before the modal opens
 * @fires beforeClose Mediator event fires before the modal closes
 * @fires open Mediator event fires after the modal opened
 * @fires close Mediator event fires after the modal closed
 * @method open open the modal
 * @method close close the modal
 * @example
  <div class="modal-window" id="MODAL_ID">
    <div class="modal-inner max-medium">
      <div class="modal-content">
        <div class="modal-head">
          <h3 class="thin-headline"><!-- HEADLINE --></h3>
        </div>
        <div class="modal-body">
          <!-- CONTENT -->
        </div>
        <div class="modal-footer flex justify-flex-between">
          <a title="<?php echo $this->translate('Abbrechen'); ?>" class="button hollow large close-modal"><?php echo $this->translate('Schließen'); ?></a>
          <a title="<?php echo $this->translate('Speichern'); ?>" class="button large button-save"><?php echo $this->translate('Speichern'); ?></a>
        </div>
        <button class="close-button close-modal" aria-label="Close modal" type="button">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  </div>

  @import 'modal-window.scss';

  import ModalWindow from 'modal-window.js';

  const myModalWindow = new ModalWindow(document.querySelector('#MODAL_ID'));

  myModalWindow.susbcribe('open', param => {
    console.log(param)
  });

  myModalWindow.open('modal window opened');
 */
export default class ModalWindow extends Mediator {
  constructor(element, options) {
    super();
    if (!element) return;
    this.element = typeof jQuery !== 'undefined' && element instanceof jQuery ? element.get(0) : element;
    this.options = Object.assign(
      {
        // defaults
        openOnInit: false,
        backgroundIsCloseTrigger: false,
        openButtonClass: '', // if set, trigger buttons rendered after initializing the modal will be recognized
        lockBodyPosition: false, // lock the body position and prevent scrolling when the modal is open
      },
      options || {}
    );

    this.openButton = this.getElementArrayOf(this.options.openButton);
    this.openClass = 'modal-open';
    this.absoluteClass = 'modal-absolute';
    this.innerElement = this.element.querySelector('.modal-inner');
    this.closeButton = [...this.element.querySelectorAll('.close-modal')];
    this.isOpen = this.element.classList.contains(this.openClass);
    this.isAbsolute = this.element.classList.contains(this.absoluteClass);

    if (this.options.backgroundIsCloseTrigger) {
      this.element.style.cursor = 'pointer';
      this.innerElement.style.cursor = 'default';
    }

    this.bodyLockClass = 'lock-position';

    this.addEvents();
    if (this.options.openOnInit) this.open();
  }

  addEvents() {
    if (this.options.backgroundIsCloseTrigger) {
      let mouseDownOnBackground = isTouchDevice();

      this.element.addEventListener('mousedown', e => {
        if (e.target === this.element || e.target === this.innerElement) mouseDownOnBackground = true;
      });

      this.element.addEventListener('click', e => {
        if ((e.target === this.element || e.target === this.innerElement) && mouseDownOnBackground) {
          this.close();
          mouseDownOnBackground = isTouchDevice();
        }
      });
    }

    if (this.options.openButtonClass) {
      document.addEventListener('click', e => {
        if (e.target && e.target.classList.contains(this.options.openButtonClass)) {
          this.open();
        }
      });
    }

    [...this.openButton].map(button => button.addEventListener('click', _ => this.open()));
    [...this.closeButton].map(button => button.addEventListener('click', _ => this.close()));
  }

  open(param) {
    this.publish('beforeOpen', param);
    if (this.options.lockBodyPosition) this.lockBodyPosition();
    if (!this.isAbsolute) document.documentElement.classList.add(this.openClass);
    this.element.classList.add(this.openClass);
    this.isOpen = true;
    this.publish('open', param);
  }

  close(param) {
    this.publish('beforeClose', param);
    if (this.options.lockBodyPosition) this.unlockBodyPosition();
    if (!this.isAbsolute) document.documentElement.classList.remove(this.openClass);
    this.element.classList.remove(this.openClass);
    this.isOpen = false;
    this.publish('close', param);
  }

  getElementArrayOf(e) {
    if (typeof e === 'undefined') return [];
    if (typeof jQuery !== 'undefined' && e instanceof jQuery) return $.makeArray(e);
    else return e.length ? [...e] : [e];
  }

  lockBodyPosition() {
    document.body.style.top = `${-1 * window.scrollY}px`;
    document.documentElement.style.overflow = 'hidden';
  }

  unlockBodyPosition() {
    document.body.style.top = 0;
    document.documentElement.style.overflow = 'visible';
  }
}

/**
 * DO NOT USE THIS YET!!!
 * @description creates a modal window node or template
 * @param {object} options
 * @returns {*}
 */
export const createModalWindow = (options = {}) => {
  const defaults = {
    classes: [],
    size: 'large',
    body: {
      content: '',
    },
    footer: {
      closeButton: {
        display: true,
        label: 'Close',
      },
      display: true,
      submitButton: {
        display: true,
        label: 'Submit',
      },
    },
    head: {
      display: true,
      headline: '',
    },
    id: null,
    returnNode: true,
  };

  const settings = deepMerge(defaults, options);

  const tpl = /*html*/ `
    <div class="modal-window ${settings.size} ${settings.classes.join(' ')}" ${settings.id ? `id="${settings.id}"` : ''}>
      <div class="modal-inner">
        <div class="modal-content">

          ${
            settings.head.display
              ? /*html*/ `
            <div class="modal-head">
              <div class="h3 thin-headline no-margin">${settings.head.headline}</div>
            </div>
          `
              : ''
          }

          <div class="modal-body">
            ${settings.body.content}
          </div>

          ${
            settings.footer.display
              ? /*html*/ `
            <div class="modal-footer flex ${settings.footer.closeButton.display && settings.footer.submitButton.display ? 'justify-flex-between' : 'justify-flex-end'}">
              ${
                settings.footer.closeButton.display
                  ? `
                <a title="${settings.footer.closeButton.label}" class="button hollow large close-modal">${settings.footer.closeButton.label}</a>
              `
                  : ''
              }
              ${
                settings.footer.submitButton.display
                  ? `
                <a title="${settings.footer.submitButton.label}" class="button large button-submit">${settings.footer.submitButton.label}</a>
              `
                  : ''
              }
            </div>
          `
              : ''
          }

          <button class="close-button close-modal" aria-label="Close modal" type="button">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    </div>
  `;

  if (settings.returnNode) {
    const placeholder = document.createElement('div');
    placeholder.insertAdjacentHTML('afterbegin', tpl);
    return placeholder.firstElementChild;
  } else {
    return tpl;
  }
};

export { createModalWindow, ModalWindow };
