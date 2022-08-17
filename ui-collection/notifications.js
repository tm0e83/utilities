export default class Notifications {
	constructor(options) {
		this.setConfig(options);

		this.element = document.createElement('div');
		this.element.classList.add('uic-notifications');
		document.body.insertAdjacentElement('beforeend', this.element);

		this.messages = [];
	}

	setConfig(options) {
		const defaults = {
			duration: 5000,
			types: {
				alert: {
					color: '#fff',
					bgColor: '#e74c3c',
					borderColor: 'transparent',
					closerColor: '#fff'
				},
				info: {
					color: '#fff',
					bgColor: '#057fd1',
					borderColor: 'transparent',
					closerColor: '#fff'
				},
				success: {
					color: '#fff',
					bgColor: '#27ae60',
					borderColor: 'transparent',
					closerColor: '#fff'
				},
				warning: {
					color: '#fff',
					bgColor: '#f39c12',
					borderColor: 'transparent',
					closerColor: '#fff'
				},
			}
		};

		this.o = Object.assign({}, defaults, options);
	}

	send(text, type = 'default', options = {}) {
		const currentOptions = Object.assign({}, this.o, options, {
			text: text,
			type: type
		});

		let messageElement = document.createElement('div');
		this.element.insertAdjacentElement('afterbegin', messageElement);

		const notificationMessage = new NotificationMessage({
			parent: this,
			element: messageElement,
			data: currentOptions,
		});

		return notificationMessage;
	}
}

class NotificationMessage {
	constructor(args) {
		this.parent = args.parent;
		this.element = args.element;
		this.data = args.data;

		this.defaultMessageClass = 'uic-message';
		this.messageClass = 'uic-message';
		this.closeButtonClass = 'uic-remove';
		this.fadeClass = 'uic-fade';

		this.render();
	}

	addEvents() {
		this.closer.addEventListener('click', () => this.removeMessage(this.data));

		if (this.data.duration) {
			setTimeout(_ => this.removeMessage(), this.data.duration);
		}
	}

	removeMessage() {
		this.element.classList.add(this.fadeClass);
		setTimeout(_ => this.element.parentElement.removeChild(this.element), 400);
		if (typeof this.data.onRemove === 'function') this.data.onRemove.call();
	}

	get messageStyles() {
		let messageStyles = '';

		if (typeof this.data.types[this.data.type] === 'object') {
			messageStyles += `color:${this.data.types[this.data.type].color};`;
			messageStyles += `background-color:${this.data.types[this.data.type].bgColor};`;

			if (this.data.types[this.data.type].borderColor) {
				messageStyles += `border: 1px solid ${this.data.types[this.data.type].borderColor};`;
			}
		}

		return messageStyles;
	}

	get closerStyles() {
		let closerStyles = '';

		if (typeof this.data.types[this.data.type] === 'object') {
			closerStyles += `color:${this.data.types[this.data.type].closerColor};`;
		}

		return closerStyles;
	}

	render() {
		this.element.classList.add(this.data.type ? 'uic-' + this.data.type : this.defaultMessageClass, this.messageClass);
		this.element.setAttribute('style', this.messageStyles);
		this.element.innerHTML = this.template;
		this.closer = this.element.querySelector(`.${this.closeButtonClass}`);

		this.addEvents();
	}

	get template() {
		return `
			<div>
				${this.data.text}
				<span class="${this.closeButtonClass}" style="${this.closerStyles}">&times;</span>
			</div>
		`
	}
}