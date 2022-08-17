/**
 * @description DEPRECATED! Do not use! Use util/spinner-overlay.js instead
 */
export default class LoadingOverlay {
  constructor(options) {
    const defaults = {
      element: $('#loading-overlay'),
      trigger: $('.loading-overlay')
    }

    this.settings = $.extend({}, defaults, options || {});

    this.overlay = this.settings.element;
    this.trigger = this.settings.trigger;

    if (!this.overlay.length || !this.trigger.length) return;
    this.addEvents();
  }

  addEvents() {
    this.trigger.on('click', () => this.overlay.show(200));
  }
}