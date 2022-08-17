import Mediator from './mediator.js';

/** DO NOT USE THIS YET!
 * @class
 * @description this is a newer version for creating tabs that works without framework. Do not mix this with the orignal Tabs class
 * @example
  <div class="tabs">
    <div class="tab-label" data-tab-id="tab-1">tab label 1</div>
    <div class="tab-content" data-tab-id="tab-1">content...</div>
    <div class="tab-label" data-tab-id="tab-2">tab label 2</div>
    <div class="tab-content" data-tab-id="tab-2">content...</div>
  </div>

  @import 'tabs2.scss';

  import Tabs2 from 'tabs2.js';

  new Tabs(document.querySelector('.tabs-container'));
 */
export default class Tabs2 extends Mediator {
  constructor(element, config = {}) {
    super();

    this.element = element;
    if (!this.element) return;

    this.config = Object.assign(
      {},
      {
        // breakpoint: 480,
        allowMultiExpand: false, // mobile view only
        allowhideContent: false, // mobile view only
      },
      config
    );

    this.tabs = [];

    this.init();
  }

  init() {
    let tabsIds = [];

    [...this.element.querySelectorAll('.tab-label')].map(label => {
      const tabId = label.getAttribute('data-tab-id');

      if (tabsIds.indexOf(tabId) == -1) {
        this.tabs.push(
          new Tab({
            parent: this,
            id: tabId,
            label: this.element.querySelectorAll(`.tab-label[data-tab-id="${tabId}"]`),
            content: this.element.querySelector(`.tab-content[data-tab-id="${tabId}"]`),
          })
        );
      }
    });
  }

  // addEvents() {
  //   window.addEventListener('resize', e => {
  //     this.wait()
  //       .then(_ => {
  //         if (this.isMobileView <= this.config.breakpoint) ;
  //       });
  //   });
  // }

  // get isMobileView() {
  //   this.
  // }

  // wait() {
  //   if (this.waitTimeout) clearTimeout(this.waitTimeout);
  //   return new Promise((resolve, reject) => {
  //     this.waitTimeout = setTimeout(_ => resolve(), 100)
  //   });
  // }

  onHideContent(tab) {
    this.publish('tabChange', this, tab);
  }

  onShowContent(tab) {
    if (!this.config.allowMultiExpand) this.hideContent(tab.id);
    this.publish('tabChange', this, tab);
  }

  hideContent(excludeId) {
    this.tabs.map(tab => {
      if (excludeId !== tab.id && tab.contentVisible) tab.fold();
    });
  }

  goToTab(tabId) {
    this.tabs.map(tab => {
      if (tabId !== tab.id && tab.contentVisible) tab.fold();
    });
  }

  get visibleTabs() {
    return this.tabs.filter(tab => tab.contentVisible === true);
  }

  get canHide() {
    return (!this.config.allowhideContent && this.visibleTabs.length > 0) || true;
  }

  get canShow() {
    return (!this.allowMultiExpand && !this.visibleTabs.length) || true;
  }
}

class Tab {
  constructor(args) {
    this.parent = args.parent;
    this.id = args.id;
    this.label = args.label;
    this.content = args.content;
    this.activeClass = 'active';
    this.contentVisible = this.content.classList.contains(this.activeClass);

    this.addEvents();
  }

  addEvents() {
    [...this.label].map(label => {
      label.addEventListener('click', e => {
        if (this.contentVisible) {
          if (this.parent.canShow) {
            this.fold();
            this.parent.onHideContent(this);
          }
        } else {
          if (this.parent.canHide) {
            this.expand();
            this.parent.onShowContent(this);
          }
        }
      });
    });
  }

  expand() {
    [...this.label, this.content].map(element => {
      element.classList.add(this.activeClass);
      this.contentVisible = true;
    });
  }

  fold() {
    [...this.label, this.content].map(element => {
      element.classList.remove(this.activeClass);
      this.contentVisible = false;
    });
  }
}

export { Tabs2 };
