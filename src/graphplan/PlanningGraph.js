class ActionLevel {
	constructor(actions, mutexRelations) {
		this.actions = actions;
		this.mutexRelations = mutexRelations;
	}

	constructor() {
		this.actions = []
		this.mutexRelations = new Map()
	}

	add(action) {
		this.actions.append(action);
	}

	isMutex() {
		for (let i = 0; i < this.actions.length; i++) {
			for (let j = i + 1; l < this.actions.length; j++) {
				let first_action = this.actions[i];
				let second_action = this.actions[j];

				let mutex = true;

				//ways to be mutex: if preconditions are opposite
				for (pre_1 in first_action.preconditions) {
					for (pre_2 in second_action.preconditions) {
						if (pre_1.negation(pre_2)) {
							mutex = false;
							break;
						}
					}
					if (!mutex) {
						break;
					}

					for (pre_2 in second_action.effects) {
						if (pre_1.negation(pre_2)) {
							mutex = false;
							break;
						}
					}
					if (!mutex) {
						break;
					}
				}

				//if effects are opposite
				for (pre_1 in first_action.effects) {
					for (pre_2 in second_action.effects) {
						if (pre_1.negation(pre_2)) {
							mutex = false;
							break;
						}
					}
					if (!mutex) {
						break;
					}

					for (pre_2 in second_action.propositions) {
						if (pre_1.negation(pre_2)) {
							mutex = false;
							break;
						}
					}
					if (!mutex) {
						break;
					}
				}

				if (!mutex) {
					continue;
				}

				//prob should be map but idk what you want
				if (!this.mutexRelations.has(first_action)) {
					this.mutexRelations.set(first_action, []);
				}
				if (!this.mutexRelations.has(second_action)) {
					this.mutexRelations.set(second_action, []);
				}
				this.mutexRelations.set(first_action, [this.mutexRelations.get(first_action), second_action]);
				this.mutexRelations.set(second_action, [this.mutexRelations.get(second_action), first_action]);
			}
		}
	}

	propagateMutex() {}
}

class PropositionLevel {
	constructor(propositions, mutexRelations) {
		this.propositions = propositions;
		this.mutexRelations = mutexRelations;
	}

	constructor() {
		this.propositions = []
		this.mutexRelations = new Map()
	}

	add(p) {
		this.propositions.append(p);
	}

	//pass in previous action level
	isMutex(prevLevel) {
		for (let i = 0; i < this.propositions.length; i++) {
			for (let j = i + 1; l < this.propositions.length; j++) {
				let first_prop = this.propositions[i];
				let second_prop = this.propositions[j];

				//ways to be mutex: if are opposite
				if (first_prop.negation(second_prop)) {
					continue;
				}

				//if the only actions that lead to each prop are mutex, they are mutex
				prev_actions = prevLevel.actions;
				let actions_1 = [];
				let actions_2 = [];
				for (action in prev_actions) {
					if (action.effects.includes(prop_1)) {
						actions_1.append(action);
					}
					if (action.effects.includes(prop_2)) {
						actions_2.append(action);
					}
				}

				let valid_action = false;
				for (action_1 in actions_1) {
					for (action_2 in actions_2) {
						if (!(prevLevel.mutexRelations.get(action_1).includes(actions_2))) {
							valid_action = true;
							break;
						}
					}
					if (valid_action) {
						break;
					}
				}

				if (!valid_action) {
					continue;
				}

				//prob should be map but idk what you want
				if (!this.mutexRelations.has(first_prop)) {
					this.mutexRelations.set(first_prop, []);
				}
				if (!this.mutexRelations.has(second_prop)) {
					this.mutexRelations.set(second_prop, []);
				}
				this.mutexRelations.set(first_prop, [this.mutexRelations.get(first_prop), second_prop]);
				this.mutexRelations.set(second_prop, [this.mutexRelations.get(second_prop), first_prop]);
			}
		}
	}

	propagateMutex() {}
}

class PlanningGraph {
	constructor(problem) {
		this.problem = problem;

		this.propLevels = []; // the list of proposition levels
		this.actionLevels = []; // the list of action levels
		// in the paper these are interlaced

		// add the initial conditions
		var first = new PropositionLevel();
		problem.initial.forEach((c) => first.add(c));
		this.propLevels.push(first);
	}

	// main construction of the planning graph
	extend() {
		var last = this.propLevels[this.propLevels.length - 1];

		var nextA = new ActionLevel();
		var nextP = new PropositionLevel();

		// add the actions
		for (var action of this.problem.actionList) {
			if (action.isApplicable(last)) {
				nextA.add(action);
			}
		}

		// these functions need to be implemented still

		this.addNoOpActions(last, nextA); //add the no ops
		nextA.propagateMutex(last); // update mutex
		this.actionLevels.push(nextA);

		// add all properties
		//I think all props should be on every level - just give them a truth value
		nextA.actions.forEach((action) => {
			action.effects
				.forEach((prop) => {
					nextP.add(prop);
				});
		});

		nextP.propagateMutex();

		this.propLevels.push(nextP);

		return nextP;
	}

	isLeveledOff(last_prop_layer, curr_prop_layer) {
		//leveled off if last level propositions have same mutex and same number of props
		last_props = last_prop_layer.propositions;
		curr_props = curr_prop_layer.propositions;

		if (last_props.lenght != curr_props.length) {
			return false;
		}

		for (prop in last_props) {
			if (!curr_props.includes(prop)) {
				return false;
			}
		}

		last_mutex = last_prop_layer.mutexRelations;
		curr_mutex = curr_prop_layer.mutexRelations;

		if (last_mutex.size != curr_mutex.size) {
			return false;
		}

		for (last_key in last_mutex.keys()) {
			if (!curr_mutex.has(last_key)) {
				return false;
			}
			curr_arr = curr_mutex.get(last_key);
			last_arr = last_mutex.get(last_key);
			if (curr_arr.length != last_arr.length) {
				return false;
			}
			for (val in last_arr) {
				if (!curr_arr.includes(prop)) {
					return false;
				}
			}
		}
	}

	isSolvable() {}

	build() {}

	addNoOpActions(last_prop_layer, next_action_layer) {
		for (prop in last_prop_layer) {
			let new_action = Action("no-op", [], [prop], [prop])
			next_action_layer.add(new_action);
		}
	}
}

export { PlanningGraph };
