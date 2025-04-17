class Proposition {
	constructor(name, params, truth_value) {
		this.name = name;
		this.params = params;
		this.truth_value = truth_value;
	}

	equals(other) {
		return (
			this.name === other.name &&
			JSON.stringify(this.params) === JSON.stringify(other.params) &&
			this.truth_value === other.truth_value
		);
	}

	negation(other) {
		return (
			this.name === other.name &&
			JSON.stringify(this.params) === JSON.stringify(other.params) &&
			this.truth_value !== other.truth_value
		);
	}

	toString() {
		return `${this.truth_value ? "" : "¬"}${this.name} (${
			this.params == null
				? ""
				: Object.entries(this.params)
						.map((el) => `${el[0]}=${el[1]}`)
						.join(", ")
		})`;
	}
}

export { Proposition };
