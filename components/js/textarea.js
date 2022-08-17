import Mediator from './mediator.js';

/**
 * @class
 * @description Fake Textarea
 * @param { object } args.element - the outer HTML element
 * @param { number } args.maxLength - the max amount of characters allowed
 * @example
    <textarea
      id="my-textarea"
      placeholder="PLACEHOLDER_TEXT..."
      maxlength="100"
    >PREFILLED_CONTENT</textarea>

    @import 'textarea.scss';

    import Textarea from 'textarea.js';

    new Textarea({
      element: document.querySelector('#my-textarea'),
    });
 */
class Textarea extends Mediator {
  constructor(element, options) {
    super();

    // catch deprecated implementations and modify arguments
    if (element instanceof Element === false) {
      element = element.element;
      options = {};
    }

    this._settings = Object.assign(
      {
        showInputLength: true,
        maxLength: (_ => {
          if (options.maxLength) return options.maxLength;
          if (element.hasAttribute('maxlength')) return parseInt(element.getAttribute('maxlength'));
          return null;
        })(),
        transformHTML: transformTextareaInput, // transforms the html content before publishing the value. Updates the HTML content on blur
      },
      options
    );

    if (element.tagName.toLowerCase() === 'textarea') {
      this.textareaElement = element;
      this.element = document.createElement('div');
      this.textareaElement.insertAdjacentElement('afterend', this.element);

      this.element.classList.add('textarea');
      this.element.appendChild(this.textareaElement);

      this.element.insertAdjacentHTML(
        'beforeend',
        `
        <div class="placeholder">${this.textareaElement.getAttribute('placeholder')}</div>
        <div class="content" contenteditable>${this.textareaElement.value}</div>
        ${
          this._settings.maxLength && this._settings.showInputLength
            ? `
          <div class="maxlength-info"></div>
        `
            : ''
        }
      `
      );
    } else {
      this.element = element;
    }

    this.maxReachedClass = 'max-reached';
    this.placeholder = this.element.querySelector('.placeholder');
    this.content = this.element.querySelector('.content');
    this.maxlengthInfo = this.element.querySelector('.maxlength-info');

    this.setCharCount();
    this.addEvents();
    this.triggerEvent('blur');
  }

  setCharCount() {
    if (!this._settings.maxLength || !this._settings.showInputLength) return;

    if (this.content.textContent.length >= this._settings.maxLength) {
      this.element.classList.add(this.maxReachedClass);
    } else {
      this.element.classList.remove(this.maxReachedClass);
    }

    this.maxlengthInfo.innerHTML = `${this.content.textContent.length}/${this._settings.maxLength}`;
  }

  addEvents() {
    this.content.addEventListener('blur', e => (this.value = this.value));

    this.content.addEventListener('input', e => {
      this.textareaElement.value = this._settings.transformHTML(e.target.innerHTML);
      this.togglePlaceholder();
      this.publish('input', this.value);
      this.setCharCount();
    });

    this.content.addEventListener('keydown', e => {
      const selectedTextLength = window.getSelection().toString().length;

      if (this._settings.maxLength && this.content.textContent.length - selectedTextLength >= this._settings.maxLength) {
        if (
          !e.ctrlKey &&
          !['CapsLock', 'Shift', 'Backspace', 'Delete', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Control', 'Home', 'End', 'Tab', 'F5', 'Alt', 'AltGraph'].includes(e.key)
        ) {
          e.preventDefault();
        }
      }
    });

    this.content.addEventListener('paste', e => {
      e.preventDefault();

      const tempElement = document.createElement('div');
      tempElement.textContent = e.clipboardData.getData('text/plain');

      const currentTextLength = this.content.textContent.length;
      const selectionLength = window
        .getSelection()
        .toString()
        .replace(/(\n\t)/, '').length;
      const numAvailableChars = this._settings.maxLength - currentTextLength + selectionLength;

      const str = tempElement.textContent.substring(0, numAvailableChars);
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(str, 'text/html');

      [...doc.body.childNodes].map(node => insertNodeAtCursor(node));

      setTimeout(_ => {
        this.textareaElement.value = this._settings.transformHTML(this.content.innerHTML);

        this.togglePlaceholder();
        this.publish('input', this.textareaElement.value);
        this.setCharCount();
      }, 0);
    });
  }

  triggerEvent(type) {
    const e = document.createEvent('Event');
    e.initEvent(type, false, true);
    this.content.dispatchEvent(e);
  }

  togglePlaceholder() {
    this.placeholder.style.display = !this.content.textContent.trim().length ? 'block' : 'none';
  }

  focus() {
    this.content.focus();
  }

  get value() {
    return this.textareaElement.value;
  }

  get html() {
    return this.textareaElement.value;
  }

  set value(value) {
    const el = document.createElement('div');
    el.innerHTML = value;
    const strLen = el.textContent.length;

    if (strLen > this._settings.maxLength) return;

    this.textareaElement.value = this._settings.transformHTML(value);
    this.content.innerHTML = this.value;

    this.togglePlaceholder();
    this.publish('input', this.value);
    this.setCharCount();
  }
}

/**
 * helper function for transforming innerHTML of the textarea
 * @param {string} html = the innerHTML of the textarea (textareaInstance.html)
 */
const transformTextareaInput = (html, options) => {
  return (
    html
      // remove leading and trailing whitespaces
      .trim()

      // remove space within html tags
      .replace(/>\s+/g, '>')
      .replace(/\s+</g, '<')

      // reduce multiple subsequent whitespaces to a single whitespace
      .replace(/\s+(?=\s)/g, '')

      // replace headline's and paragraph's ending tag with 2 linesbreaks
      .replace(/<\/(h1|h2|h3|h4|h5|h6|p)>/gi, '<br><br>')

      // replace whitespace entities
      .replace(/&nbsp;/gi, ' ')

      // replace div's ending tag with 1 linesbreak
      .replace(/<\/(div)>/gi, '<br>')

      // replace br tags in order to remove inline styles
      .replace(/<\/?(br)>/gi, '<br>')

      // remove br tags and leading or trailing whitespces in order to have only 2 subsequent br tags without whitespaces
      .replace(/(\s*)?(<\/?(br)>(\s*)?){2,}/gi, '<br><br>')

      // remove all html tags except br tags
      .replace(/<(?!(br))[^>]+>/gi, ' ')
  );
};

export { Textarea, transformTextareaInput };

function insertNodeAtCursor(node) {
  let selection = window.getSelection();
  let range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(node);
  selection.collapseToEnd();
}
