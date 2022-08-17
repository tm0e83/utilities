import './clip-text.scss';

customElements.define('clip-text', class extends HTMLElement {
  constructor() {
    super();
    this._debugMode = false;
  }

  connectedCallback() {
    this._toggleButton();
    this._addEvents();
  }

  _addEvents() {
    this.querySelector('.toggle').addEventListener('click', _ => this.classList.toggle('show'));

    let resizeTimeout = null;
    window.addEventListener('resize', _ => {
      if(resizeTimeout) clearTimeout(resizeTimeout);

      new Promise((resolve, reject) => {
        resizeTimeout = setTimeout(_ => resolve(), 100);
      }).then(_ => this._toggleButton());
    });
  }

  _toggleButton() {
    this.querySelector('.toggle').style.display = this._hasOverflow || this.classList.contains('show') ? 'inline' : 'none';
  }

  get _hasOverflow() {
    const contentElement = this.querySelector('.text');
    return contentElement.scrollWidth > contentElement.clientWidth;
  }
});