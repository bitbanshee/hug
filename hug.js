const hug = function (_class) {
	return function () {
		this.inner = new (Function.prototype.bind.apply(_class, arguments))

		let prototype =
			Object.getOwnPropertyNames(_class.prototype)
				.reduce((proto, propName) => {
					let method = propName.match(/^set/g) ?
						(function () {
							_class.prototype[propName].apply(this.inner, [].slice.apply(arguments))
							return this
						}).bind(this) :
						(function () {
							return _class.prototype[propName].apply(this.inner, [].slice.apply(arguments))
						}).bind(this)

					return Object.defineProperty(proto, propName, {
						value: method,
						enumerable: false,
						writable: false,
						configurable: false
					})
				}, {})

		Object.defineProperty(prototype, 'applyFunction', {
			value: fn => { fn(this); return this },
			enumerable: false,
			writable: false,
			configurable: false
		})

		Object.setPrototypeOf(this, prototype)

		let innerDescriptors = Object.getOwnPropertyDescriptors(this.inner)
		Object.keys(innerDescriptors)
			.forEach(propName => {
				if (innerDescriptors[propName].value instanceof Function)
					innerDescriptors[propName].value = innerDescriptors[propName].value.bind(this.inner)
				else {
					innerDescriptors[propName] = {
						get: function () { return this.inner[propName] },
						set: function (value) { this.inner[propName] = value; return this },
						configurable: innerDescriptors[propName],
						enumerable: innerDescriptors[propName],
						writable: innerDescriptors[propName]
					}
				}			
			})

		Object.defineProperties(this, innerDescriptors);
	}
}
