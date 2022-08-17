import Mediator from './mediator.js';

/**
 * @example
  <div class="tabs-container shrink tabs-660px" id="TABS_ID">
    <div class="tab-label active">
      <div class="tab-label-text">Tab 1 Label</div>
    </div>
    <div class="tab-content active">
      Tab 1 Content
    </div>
    <div class="tab-label">
      <div class="tab-label-text">Tab 2 Label</div>
    </div>
    <div class="tab-content">
      Tab 2 Content
    </div>
  </div>

  @import 'tabs.scss';

  import Tabs from 'tabs.js';

  const tabs = new Tabs(document.querySelector('#TABS_ID'), {
    breakpoint: 660 // tabs will stack when the window width is lower than this
  });

  tabs.subscribe('pageChange', (currentActiveTabLabels, currentActiveContentBoxes, nextActiveTabLabel, nextActiveContentBox) => {
    console.log('page changed');
  });
 */
export default class Tabs extends Mediator {
  constructor(container, config) {
    super();
    const options = config || {};
    this.tabLabelClass = options.tabLabelClass || 'tab-label';
    this.tabContentClass = options.tabContentClass || 'tab-content';
    this.activeClass = options.activeClass || 'active';
    this.disabledClass = options.disabledClass || 'disabled';
    this.allowAllClosed = options.allowAllClosed || false;
    this.breakpoint = isNaN(options.breakpoint) ? 480 : options.breakpoint; // px
    this.breakpoints = options.breakpoints || [];
    this.breakpoints = this.breakpoints.sort((a, b) => (a.minWidth < b.minWidth ? -1 : 1));

    // breakpoints = [{
    //   minWidth: 0,
    //   maxWidth: 479,
    //   stacked: true
    // }, {
    //   minWidth: 480,
    //   stacked: false
    // }]

    this.container = typeof jQuery !== 'undefined' && container instanceof jQuery ? $(container).get(0) : container;
    if (!this.container) return;

    this.tabLabels = this.container.querySelectorAll(`.${this.tabLabelClass}:not(.${this.disabledClass})`);
    this.tabContentBoxes = this.container.querySelectorAll('.' + this.tabContentClass);
    if (!this.tabLabels.length || !this.tabContentBoxes.length) return;

    this.addEvents();
  }

  addEvents() {
    [...this.tabLabels].map((label, i) => {
      label.addEventListener('click', _ => this.toggle(i, label));
    });

    window.addEventListener('resize', _ => {
      if (this.breakpoints.length) {
        const breakpoint = this.breakpoints.reduce((activeBreakpoint, bp) => {
          if (window.innerWidth >= bp.minWidth && (!bp.maxWidth || window.innerWidth <= bp.maxWidth)) {
            activeBreakpoint = bp;
          }

          return activeBreakpoint;
        }, this.breakpoints[0]);

        this.container.classList[breakpoint.stacked ? 'remove' : 'add']('horizontal');
      } else {
        if (window.innerWidth >= this.breakpoint) {
          if (this.activeLabels.length === 0) {
            [...this.tabLabels][0].classList.add(this.activeClass);
            [...this.tabContentBoxes][0].classList.add(this.activeClass);
          }
        }
      }
    });

    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('resize', false, true);
    window.dispatchEvent(evt);
  }

  gotoTabIndex(index) {
    this.toggle(index, [...this.tabLabels][index]);
  }

  get activeLabels() {
    return [...this.tabLabels].filter(element => element.classList.contains(this.activeClass));
  }

  get activeContentBox() {
    return [...this.tabContentBoxes].filter(element => element.classList.contains(this.activeClass));
  }

  toggle(i, label) {
    const currentActiveTabLabels = this.activeLabels,
      currentActiveContentBoxes = this.activeContentBox,
      nextActiveTabLabel = label,
      nextActiveContentBox = [...this.tabContentBoxes][i],
      nextActiveIsCurrent = currentActiveContentBoxes.indexOf(nextActiveContentBox) >= 0;

    if (!nextActiveContentBox) return;

    if (window.innerWidth < this.breakpoint) {
      currentActiveTabLabels.map(label => label.classList.remove(this.activeClass));
      currentActiveContentBoxes.map(box => {
        box.classList.remove(this.activeClass);
        box.style.display = 'none';
      });

      if (nextActiveIsCurrent && this.allowAllClosed) return;

      nextActiveContentBox.style.display = 'none';

      if (currentActiveContentBoxes.indexOf(nextActiveContentBox) == -1) {
        nextActiveContentBox.classList.add(this.activeClass);
        nextActiveTabLabel.classList.add(this.activeClass);
        nextActiveContentBox.style.display = 'block';
      }
    } else {
      if (!nextActiveIsCurrent || this.allowAllClosed) {
        currentActiveTabLabels.map(label => label.classList.remove(this.activeClass));
        currentActiveContentBoxes.map(box => box.classList.remove(this.activeClass));

        if (nextActiveIsCurrent && this.allowAllClosed) return;

        nextActiveTabLabel.classList.add(this.activeClass);
        nextActiveContentBox.classList.add(this.activeClass);
      }
    }

    this.publish('pageChange', currentActiveTabLabels, currentActiveContentBoxes, nextActiveTabLabel, nextActiveContentBox);
  }
}

export { Tabs };
