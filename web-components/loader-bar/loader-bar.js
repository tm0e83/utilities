// DO NOT USE THIS!

import './loader-bar.scss';

customElements.define('loader-bar', class extends HTMLElement {
  constructor() {
    super();

    this._debugMode = true;

    this._shadowRoot = this.attachShadow({mode: 'open'});
    const tpl = document.querySelector('#wc-tpl-loader-bar');
    if (!tpl || !tpl.content) return; // IE bugfix
    let clonedTpl = tpl.content.cloneNode(true);

    this._shadowRoot.appendChild(clonedTpl);
  };

  show() {
    this.setAttribute('visible', '');
  }

  hide() {
    this.removeAttribute('visible');
  }
});