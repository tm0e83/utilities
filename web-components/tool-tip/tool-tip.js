import './tool-tip.scss';

customElements.define('tool-tip', class extends HTMLElement {
  constructor() {
    super();
    this._debugMode = false;
    this._ypos = 'bottom';
    this._xpos = 'center';
    this._maxWidth = this.getAttribute('max-width') || null;
    this._zIndex = this.getAttribute('z-index') || null;
    this._id = this.getAttribute('tool-tip-id') || null;
    this._stayVisible = false;
  }

  set content(text) {
    this._textContextElement.innerHTML = decodeURIComponent(text);
  }

  connectedCallback() {
    this._contentElement = document.createElement('div');
    if (this._id) this._contentElement.setAttribute('data-tool-tip-id', this._id);
    this._contentElement.classList.add('tool-tip-content');
    this._contentElement.setAttribute('data-ypos', this._ypos);
    this._contentElement.setAttribute('data-xpos', this._xpos);
    this._arrow = document.createElement('span');
    this._contentElement.insertAdjacentElement('beforeend', this._arrow);
    this._textContextElement = document.createElement('div');
    this._contentElement.insertAdjacentElement('beforeend', this._textContextElement);
    this.content = this.title;
    this.removeAttribute('title');
    document.body.insertAdjacentElement('beforeend', this._contentElement);

    this._addEvents();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this._hide);
    window.removeEventListener('resize', this._hide);
    window.removeEventListener('orientationchange', this._hide);
    window.removeEventListener('click', this._onClickOutside);

    document.body.removeChild(this._contentElement);
  }

  _addEvents() {
    window.addEventListener('scroll', this._hide.bind(this));
    window.addEventListener('resize', this._hide.bind(this));
    window.addEventListener('orientationchange', this._hide.bind(this));
    window.addEventListener('click', this._onClickOutside.bind(this));

    this.addEventListener('click', e => {
      this._stayVisible = true;
      this._show();
    });

    this.addEventListener('mouseenter', this._onMouseEnter.bind(this));
    this.addEventListener('mouseleave', this._onMouseLeave.bind(this));

    this._contentElement.addEventListener('mouseenter', this._onMouseEnter.bind(this));
    this._contentElement.addEventListener('mouseleave', this._onMouseLeave.bind(this));
  }

  _onClickOutside(e) {
    if (!this._stayVisible) return;
    if (this.contains(e.target) || this._contentElement.contains(e.target)) return;
    this._hide();
  }

  _onMouseEnter() {
    if (!this._stayVisible) this._show();
  }

  _hide() {
    this._contentElement.removeAttribute('style');
    this._stayVisible = false;
  }

  _onMouseLeave() {
    if (!this._stayVisible) {
      this._visible = false;
      setTimeout(_ => {
        if (this._visible === false) this._hide();
      }, 300);
    }
  }

  _show() {
    this._visible = true;
    if (this._maxWidth) this._contentElement.style.maxWidth = `${this._maxWidth}px`;
    this._contentElement.style.zIndex = this._zIndex || 99;
    this._contentElement.style.opacity = 1;
    this._positionAt();
  }

  /**
   * Positions the tooltip
   */
  _positionAt() {
    const dist = this.dist || 10;

    const parentCoords = this.getBoundingClientRect();

    let top = parseInt(parentCoords.bottom) + dist;
    top = (top < 0) ? parseInt(parentCoords.bottom) + dist : top;

    const leftOfToolTip = parentCoords.x;
    const rightOfToolTip = Math.round(document.body.getBoundingClientRect().width - parentCoords.right);

    if (leftOfToolTip > rightOfToolTip) {
      this._contentElement.style.left = 'initial';
      this._contentElement.style.right = `${rightOfToolTip - 10}px`;
      this._arrow.style.left = `initial`;
      this._arrow.style.right = `${Math.round(parentCoords.width/2) + 3}px`;
    } else {
      this._contentElement.style.right = 'initial';
      this._contentElement.style.left = `${leftOfToolTip - 10}px`;
      this._arrow.style.right = `initial`;
      this._arrow.style.left = `${Math.round(parentCoords.width/2) + 3}px`;
    }

    this._contentElement.style.top = `${top + pageYOffset}px`;
  }
});