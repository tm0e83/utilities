/**
 * @class
 * @description Creates an overlay with an animated spinner
 * @param {number} args.size spinner size in px
 * @param {string} args.sizeUnit the unit to use for the spinner size
 * @param {position} args.position CSS position value of the overlay
 * @param {color} args.color spinner color
 * @param {zIndex} [args.zIndex] the z-index for the overlay
 * @param {string} args.id overlay id attribute
 * @param {string} args.classAttribute overlay CSS class string
 * @param {boolean} args.visible if true, the overlay is visible (static value)
 * @param {node} args.element the overlay HTML element
 * @param {string} args.targetContainer DOM node, if "element" is not passed, the overlay will be rendered in "targetContainer"
 * @method show displays the overlay
 * @method hide hides the overlay
 * @example
  <div class="example-container"></div>

  @import 'spinner-overlay.scss';

  import SpinnerOverlay from 'spinner-overlay.js';

  const loader = new SpinnerOverlay({
    targetContainer: document.querySelector('example-container')
    position: 'absolute',
  });
 *
  loader.hide();
 */
export default class SpinnerOverlay {
  constructor(args = {}) {
    this.size = args.size || 40;
    this.sizeUnit = args.sizeUnit || 'px';
    this.position = args.position || 'fixed';
    this.color = args.color || '#666';
    this.backgroundColor = args.backgroundColor;
    this.transparency = args.transparency;
    this.zIndex = args.zIndex;
    this.id = args.id || '';
    this.classAttribute = args.classAttribute || '';
    this.visible = args.visible || false;
    this.element = args.element || null;
    this.targetContainer = args.targetContainer || document.body || document.querySelector('body');

    if (!this.element) this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = `overlay ${this.position} ${this.classAttribute} uic-spinner-overlay`;

    if (this.id) this.element.id = this.id;
    if (this.zIndex) this.element.style.zIndex = this.zIndex;
    if (!this.visible) this.element.style.display = 'none';
    if (this.zIndex) this.element.style.zIndex = this.zIndex;

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
      <div class="bg"
        style="
          ${this.transparency ? `opacity:${this.transparency};` : ''}
          ${this.backgroundColor ? `background-color:${this.backgroundColor};` : ''}
        "></div>
      <div class="inner">
        <div class="spinner" style="width:${this.size}${this.sizeUnit}; height:${this.size}${this.sizeUnit};">
          <div>
            <div style="border-color:${this.color}"></div>
            <div style="border-color:${this.color}"></div>
          </div>
        </div>
      </div>
    `;
  }
}

export { SpinnerOverlay };
