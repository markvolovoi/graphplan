class ActionLevel {
	constructor(actions, mutexRelations) {
		this.actions = actions;
		this.mutexRelations = mutexRelations;
	}

	add(action) {
		this.actions.append(action);
	}

	isMutex() {}

	propagateMutex() {}
}

class PropositionLevel {
	constructor(propositions, mutexRelations) {
		this.propositions = propositions;
		this.mutexRelations = mutexRelations;
	}

	add(p) {
		this.actions.append(p);
	}

	isMutex() {}

	propagateMutex() {}
}

class PropositionLevel {}

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
		nextA.actions.forEach((action) => {
			action.effects
				.filter((e) => e.type === "add")
				.forEach((prop) => {
					nextP.add(prop);
				});
		});

		nextP.propagateMutex();

		this.propLevels.push(nextP);

		return nextP;
	}

	isLeveledOff() {}

	isSolvable() {}

	build() {}
}

export { PlanningGraph };
