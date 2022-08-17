/**
 * Creates an an animated spinner
 * @param {number} args.size - spinner size in px
 * @param {string} args.sizeUnit - the unit to use for the spinner size
 * @param {color} args.color - spinner color
 * @param {string} args.id - spinner id attribute
 * @param {string} args.classAttribute - spinner CSS class string
 * @param {boolean} args.visible - if true, the spinner is visible (static value)
 * @param {node} args.element - the spinner HTML element
 * @param {string} args.targetContainer - DOM node, if "element" is not passed, the spinner will be rendered in "targetContainer"
 * @example
  <div class="spinner" id="my-spinner">
    <div>
      <div></div>
      <div></div>
    </div>
  </div>

  @import 'spinner.scss';

  import Spinner from 'spinner.js';

  new Spinner({
    element: document.querySelector('#my-spinner')
  });
 */
class Spinner {
  constructor(args) {
    this.size = args.size || 40;
    this.sizeUnit = args.sizeUnit || 'px';
    this.color = args.color || '#666';
    this.id = args.id || '';
    this.classAttribute = args.classAttribute || '';
    this.visible = args.visible || false;
    this.element = args.element || null;
    this.targetContainer = args.targetContainer || document.body;

    if (!this.element) this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = `spinner ${this.classAttribute}`;
    if (this.id) this.element.id = this.id;
    if (this.id) this.element.id = this.id;
    this.element.style.width = `${this.size}${this.sizeUnit}`;
    this.element.style.height = `${this.size}${this.sizeUnit}`;
    if (!this.visible) this.element.style.display = 'none';
    this.element.insertAdjacentHTML('beforeend', this.template);
    this.targetContainer.insertAdjacentElement('beforeend', this.element);
  }

  show() {
    this.element.style.display = 'block';
  }

  hide() {
    this.element.style.display = 'none';
  }

  get template() {
    return `
      <div>
        <div style="border-color:${this.color}"></div>
        <div style="border-color:${this.color}"></div>
      </div>
    `;
  }
}

export { Spinner };
