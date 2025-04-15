class Effect {
	constructor(name, type) {
		this.name = name;
		this.type = type; // should either be add effect or delete effect
	}

	toString() {
		return `${this.type} Effect ${this.name}`;
	}
}

class Action {
	constructor(name, params, preconditions, effects) {
		this.name = name;
		this.params = params;
		this.preconditions = preconditions;
		this.effects = effects;
	}

	isApplicable(prevLevel) {}

	apply() {}

	toString() {
		return `Action ${this.name} (${this.params})`;
	}
}
