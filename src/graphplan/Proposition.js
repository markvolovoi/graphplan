class Proposition {
	constructor(name, params, truth_value) {
		this.name = name;
		this.params = params;
		this.truth_value = truth_value;
	}

	equals(other) {
		return this.name === other.name && this.params === other.params && this.truth_value == other.truth_value;
	}

	negation(other) {
		return this.name === other.name && this.params === other.params && this.truth_value == !other.truth_value;
	}

	toString() {
		return `Proposition ${this.name} (${this.params})`;
	}
}

export { Proposition };
