/**
 * @description equalizes the height of a group of elements
 * @param {nodelist} elements
 */
export default class MatchHeight {
  constructor(args) {
    this.elements = [...args.elements];
    this.responsive = typeof args.responsive === 'boolean' ? args.responsive : false;

    this.waitTimeout = null;

    this.equalize();
    this.addEvents();
  }

  addEvents() {
    window.addEventListener('resize', e => {
      this.wait().then(_ => this.equalize(this.elements));
    });
  }

  get groupedElements() {
    return Object.values(
      this.elements.reduce((groups, element) => {
        if (groups[element.getBoundingClientRect().y.toString()]) {
          groups[element.getBoundingClientRect().y.toString()].push(element);
        } else {
          groups[element.getBoundingClientRect().y.toString()] = [element];
        }

        return groups;
      }, {})
    );
  }

  wait() {
    if (this.waitTimeout) clearTimeout(this.waitTimeout);
    return new Promise((resolve, reject) => {
      this.waitTimeout = setTimeout(_ => resolve(), 100);
    });
  }

  equalize() {
    (this.responsive ? this.groupedElements : [this.elements]).map(elements => {
      elements.map(element => (element.style.minHeight = 'auto'));

      const height = Math.max(
        ...elements.reduce((heights, element) => {
          heights.push(element.getBoundingClientRect().height);
          return heights;
        }, [])
      );

      elements.map(element => (element.style.minHeight = `${height}px`));
    });
  }
}

export { MatchHeight };
