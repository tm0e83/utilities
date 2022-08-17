import FlyoutMenu from './flyout-menu.js';

/**
 * @param {array} args.breakpoints
 * @example
  <ul class="horizontal-menu-bar">
    <li>
      <a href="/">
        <span>menu item 1</span>
      </a>
    </li>
    <li>
      <a href="/">
        <span>menu item 2</span>
      </a>
    </li>

    <li>
      <div class="flyout-menu">
        <a class="flyout-trigger no-style"><i class="fas fa-ellipsis-v"></i></a>
        <ul>
          <li>
            <a href="/">
              <span>menu item 1</span>
            </a>
          </li>
          <li>
            <a href="/">
              <span>menu item 2</span>
            </a>
          </li>
        </ul>
      </div>
    </li>
  </ul>

  @import 'horizontal-menu-bar.scss';

  import HorizontalMenuBar from 'horizontal-menu-bar.js';

  new HorizontalMenuBar();

 * @example
  @import 'horizontal-menu-bar.scss';

  import HorizontalMenuBar from 'horizontal-menu-bar.js';

  const menuData = [
    {
      'attr': {
        'title': 'Edit',
        'href': 'foo/edit',
      },
      'label': 'Edit foo',
    },
    {
      'attr': {
        'title': 'Delete',
        'href': 'foo/delete',
      },
      'label': 'Delete foo',
    },
  ];

  new HorizontalMenuBar({
    targetContainer: this.element.querySelector('.some-element'),
    insertPosition: 'afterend',
    data: menuData
  });
 */
export default class HorizontalMenuBar {
  constructor(args = {}) {
    this.element = args.element || document.querySelector('.horizontal-menu-bar');
    this.targetContainer = args.targetContainer;
    this.insertPosition = args.insertPosition || 'beforeend';

    if (!this.element && !this.targetContainer) return;

    this.data = args.data || [];

    this.visibleClass = 'visible';
    this.measuringClass = 'measuring';
    this.hasFlyoutClass = 'has-flyout';

    if (this.targetContainer) this.render();

    this.menuItems = [...this.element.children];
    this.flyoutMenuItems = [...this.element.querySelectorAll('.flyout-menu li')];
    this.flyoutContainer = this.menuItems.pop();
    this.lastMenuItem = this.menuItems[this.menuItems.length - 1];

    new FlyoutMenu({
      element: this.element.querySelector('.flyout-menu'),
    });

    this.addEvents();
    this.adjustMenu();
  }

  addEvents() {
    window.addEventListener('resize', _ => this.wait().then(_ => this.adjustMenu()));
  }

  wait() {
    if (this.waitTimeout) clearTimeout(this.waitTimeout);
    return new Promise((resolve, reject) => {
      this.waitTimeout = setTimeout(_ => resolve(), 50);
    });
  }

  adjustMenu() {
    this.element.classList.add(this.measuringClass);
    const menuRect = this.element.getBoundingClientRect();
    const flyoutRect = this.flyoutContainer.getBoundingClientRect();

    let visibleItemsWidth = 0;
    let invisibleItems = [];

    this.menuItems.map((item, index) => {
      const menuItemWidth = item.getBoundingClientRect().width;

      let showItem = false;

      if (visibleItemsWidth + menuItemWidth >= menuRect.width - flyoutRect.width) {
        showItem = false;
        invisibleItems.push(item);
      } else {
        showItem = true;
        visibleItemsWidth += menuItemWidth;
      }

      item.classList[showItem ? 'add' : 'remove'](this.visibleClass);
      this.flyoutMenuItems[index].classList[showItem ? 'remove' : 'add'](this.visibleClass);
      this.flyoutContainer.classList[invisibleItems.length ? 'add' : 'remove'](this.visibleClass);
    });
    this.element.classList[invisibleItems.length ? 'add' : 'remove'](this.hasFlyoutClass);
    this.element.classList.remove(this.measuringClass);
  }

  render() {
    if (this.element) this.destroy();
    this.element = document.createElement('ul');
    this.element.classList.add('horizontal-menu-bar');
    this.element.innerHTML = this.template;
    this.targetContainer.insertAdjacentElement(this.insertPosition, this.element);
  }

  destroy() {
    if (this.element) {
      this.element.parentElement.removeChild(this.element);
    }
  }

  get template() {
    return `
      ${this.data.map(item => this.getMenuItemTemplate(item)).join('')}
      <li>
        <div class="flyout-menu">
          <a class="flyout-trigger no-style"><i class="fas fa-ellipsis-v"></i></a>
          <ul>
            ${this.data.map(item => this.getMenuItemTemplate(item)).join('')}
          </ul>
        </div>
      </li>
    `;
  }

  getMenuItemTemplate(item) {
    return `
      ${
        typeof item.condition === 'undefined' || item.condition
          ? `
        <li>
          <a ${Object.entries(item.attr)
            .map(([attrName, attrValue]) => `${attrName}="${attrValue}"`)
            .join('')}>
            ${item.label}
          </a>
        </li>
      `
          : ''
      }
    `;
  }
}

export { HorizontalMenuBar };
