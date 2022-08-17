import './market-item-countdown.scss';

customElements.define('market-item-countdown', class extends HTMLElement {
  constructor() {
    super();

    this._debugMode = true;
    this._translations = translations.webComponents.marketItemCountdown;

    this._shadowRoot = this.attachShadow({mode: 'open'});
    const tpl = document.querySelector('#wc-tpl-market-item-countdown');
    if (!tpl || !tpl.content) return; // IE bugfix
    let clonedTpl = tpl.content.cloneNode(true);

    this._shadowRoot.appendChild(clonedTpl);
  };

  connectedCallback() {
    this._timer = this._shadowRoot.querySelector('.timer');
    this._expiredText = this._shadowRoot.querySelector('.expired');
    this._marketItemType = this.getAttribute('type') || 'offer';
    const timerItems = [...this._shadowRoot.querySelectorAll('.timer-item')];

    this._daysOut = timerItems[0];
    this._hoursOut = timerItems[1];
    this._minutesOut = timerItems[2];
    this._secondsOut = timerItems[3];

    this._start();
  }

  disconnectedCallback() {
    clearInterval(this._interval);
    this._translations = null;
  }

  _start() {
    let time = new Date(this.getAttribute('time'));

    if (this._marketItemType == 'request') {
      time.setHours(23);
      time.setMinutes(59);
    }

    let ms = time.getTime() - new Date().getTime();

    if (ms >= 1000) {
      this._expiredText.style.display = 'none';
      this._timer.style.display = 'inline-flex';
    }

    this._render(0);

    this._interval = setInterval(_ => {
      ms = ms - 1000;

      if (ms < 0) {
        ms = 0;
        this._end();
      }

      this._render(ms);
    }, 1000);
  }

  _render(ms) {
    const time = this._getTime(ms);
    const days = time.days < 10 ? '0' + time.days : time.days;
    const hours = time.hours < 10 ? '0' + time.hours : time.hours;
    const minutes = time.minutes < 10 ? '0' + time.minutes : time.minutes;
    const seconds = time.seconds < 10 ? '0' + time.seconds : time.seconds;

    this._daysOut.querySelector('.count').innerHTML = days;
    this._hoursOut.querySelector('.count').innerHTML = hours;
    this._minutesOut.querySelector('.count').innerHTML = minutes;
    this._secondsOut.querySelector('.count').innerHTML = seconds;
  }

  _end() {
    clearInterval(this._interval);
    this._expiredText.innerHTML = this._translations[this._marketItemType == 'request' ? 'requestExpired' : 'offerExpired'];
    this._expiredText.style.display = 'inline-block';
    this._timer.style.display = 'none';
  }

  _getTime(ms) {
    let d, h, m, s;

    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;

    return {
      days: d,
      hours: h,
      minutes: m,
      seconds: s,
    }
  }
});