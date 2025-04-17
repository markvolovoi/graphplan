class Action {
	constructor(name, params, preconditions, effects) {
		this.name = name;
		this.params = params;
		this.preconditions = preconditions;
		this.effects = effects;
	}

	isApplicable(prevLevel) {
		// Check if all preconditions are satisfied in the previous level
		let preconditions_left = [...this.preconditions]; // Create a copy to modify

		for (const prop of prevLevel.propositions) {
			const index = preconditions_left.findIndex((p) => p.equals(prop));
			if (index !== -1) {
				preconditions_left.splice(index, 1);
			}
			if (preconditions_left.length === 0) {
				return true;
			}
		}
		return preconditions_left.length === 0;
	}

	// Apply this action to a list of propositions and return new list
	apply(old_propositions) {
		// Create a copy to avoid modifying the original
		const new_propositions = [...old_propositions];

		for (const effect of this.effects) {
			let added_prop = false;
			for (let i = 0; i < new_propositions.length; i++) {
				const proposition = new_propositions[i];
				if (proposition.negation(effect)) {
					// Replace contradicting proposition
					new_propositions.splice(i, 1);
					new_propositions.push(effect);
					added_prop = true;
					break;
				} else if (proposition.equals(effect)) {
					// Effect already present
					added_prop = true;
					break;
				}
			}

			if (!added_prop) {
				new_propositions.push(effect);
			}
		}

		return new_propositions;
	}

	toString() {
		return `${this.name} (${
			this.params == null
				? ""
				: Object.entries(this.params)
						.map((el) => ` ${el[0]}=${el[1]}`)
						.join(",")
		})`;
	}
}

export { Action };
