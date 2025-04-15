class Problem {
	constructor(initialState, goals, actionList) {
		this.initial = initialState;
		this.goals = goals;
		this.actionList = actionList;
	}

	toString() {
		return `Problem: Achieve ${this.goals} starting from ${this.initialState} using actions ${this.actionList}`;
	}
}

class GPSearch {
	constructor(pGraph) {
		this.pGraph = pGraph;
		this.memoizedGoals = new Map();
	}

	search() {
		var level = 0;
		while (true) {
			var last = this.pGraph.propLevels[level];
			if (/* can achieve goals */ true) {
				// extract plan
				var plan = extractPlan(this.pGraph.problem.goals, level);
				if (plan) return plan;
			}

			if (
				this.pGraph.isLeveledOff() &&
				this.memoizedGoals.get(level - 1)?.size ===
					this.memoizedGoals.get(level)?.size
			) {
				// no plan exists
				return null;
			}

			this.planningGraph.extend();
			level++;
		}
	}
	extractPlan() {}
	isSolvable() {}
}

class Planner {
	constructor() {
		self.actionsByTimeStep = {};
	}

	addAction(action, timeStep) {
		if (self.actionsByTimeStep[timeStep] === undefined) {
			self.actionsByTimeStep[timeStep] = [];
		}
		self.actionsByTimeStep[timeStep].push(action);
	}

	toString() {
		var s = `Plan:\n`;
		for ([k, v] of Object.entries(self.actionsByTimeStep)) {
			`Time ${k}: [${v.forEach((c) => c.toString()) + ", "}]\n`;
		}
	}

	// this was blindly ported from the python project, but i don't think
	// this is actually graphplan and also won't work with the rest of the
	// infra i've laid out. probably can delete

	// generatePlan(initialState, goalState) {
	// 	self.plan = [];
	// 	let queue = [initialState];
	// 	let visited = new Set();

	// 	while (queue.length > 0) {
	// 		let state = queue.shift();

	// 		if (state.equals(goalState)) {
	// 			return self.plan;
	// 		}

	// 		let actions = state.getActions();

	// 		for (let action of actions) {
	// 			let newState = state.applyAction(action);

	// 			if (!visited.has(newState)) {
	// 				queue.push(newState);
	// 				visited.add(newState);
	// 				self.plan.push(action);
	// 			}
	// 		}
	// 	}

	// 	return null;
	// }
}

export { Problem, GPSearch, Planner };
