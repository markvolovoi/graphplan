class Proposition {
	constructor(name, params) {
		this.name = name;
		this.params = params;
	}

	equals(other) {
		return this.name === other.name && this.params === other.params;
	}

	toString() {
		return `Proposition ${this.name} (${this.params})`;
	}
}

export { Proposition };
