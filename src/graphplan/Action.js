// class Effect {
// 	constructor(name, type) {
// 		this.name = name;
// 		this.type = type; // should either be add effect or delete effect
// 	}

// 	toString() {
// 		return `${this.type} Effect ${this.name}`;
// 	}
// }

//Instead of effect I think we should just use propositions for effects

class Action {
	constructor(name, params, preconditions, effects) {
		this.name = name;
		this.params = params;
		this.preconditions = preconditions;
		this.effects = effects;
	}

	isApplicable(prevLevel) {
		let preconditions_left = structuredClone(this.preconditions);
		for (prop in prevLevel.propositions) {
			if (preconditions_left.contains(prop)) {
				let index = preconditions_left.indexOf(prop);
				preconditions_left.splic(index, 1);
			}
			if (preconditions_left.length == 0) {
				return true;
			}
		}
		return preconditions_left.length == 0;
	}

	//take in a list of propositions and return a list of new propositions after action is done
	apply(old_propositions) {
			for (effect in this.effects) {
				let added_prop = false;
				for (proposition in old_propositions) {
					if (proposition.negation(effect)) {
						let index = old_propositions.indexOf(propostition);
						old_propositions.splice(index, 1);
						old_propositions.append(effect);
						added_prop = true;
						continue;
					}
				}
				if (!added_prop) {
					old_propositions.append(effect);
				}
			}
	}

	toString() {
		return `${this.name} (${this.params == null ? "" : this.params})`;
	}
}

export { Action };
