class Proposition {
	constructor(name, params, truth_value) {
		this.name = name;
		this.params = params;
		this.truth_value = truth_value;
	}

	equals(other) {
		const result =
			this.name === other.name &&
			JSON.stringify(this.params) === JSON.stringify(other.params) &&
			this.truth_value === other.truth_value;
		if (result) {
			console.log(`EQUAL: ${this.toString()} == ${other.toString()}`);
		}
		return result;
	}

	negation(other) {
		const result =
			this.name === other.name &&
			JSON.stringify(this.params) === JSON.stringify(other.params) &&
			this.truth_value !== other.truth_value;
		if (result) {
			console.log(`NEGATION: ${this.toString()} negates ${other.toString()}`);
		}
		return result;
	}

	toString() {
		return `${this.truth_value ? "" : "¬"}${this.name} (${
			this.params == null
				? ""
				: Object.entries(this.params)
						.map((el) => ` ${el[0]}=${el[1]}`)
						.join(",")
		})`;
	}
}

export { Proposition };
