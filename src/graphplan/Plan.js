class Plan {
	constructor() {
		this.plan = []; // Array of actions in the plan
		this.actionsByTimeStep = {}; // Map time step -> actions
	}

	append(action, timeStep) {
		this.plan.push({ action, timeStep });

		if (!this.actionsByTimeStep[timeStep]) {
			this.actionsByTimeStep[timeStep] = [];
		}
		this.actionsByTimeStep[timeStep].push(action);
	}

	remove(action) {
		const index = this.plan.findIndex((item) => item.action === action);
		if (index !== -1) {
			const timeStep = this.plan[index].timeStep;
			this.plan.splice(index, 1);

			const timeStepActions = this.actionsByTimeStep[timeStep];
			const actionIndex = timeStepActions.indexOf(action);
			if (actionIndex !== -1) {
				timeStepActions.splice(actionIndex, 1);
			}
			if (timeStepActions.length === 0) {
				delete this.actionsByTimeStep[timeStep];
			}
		}
	}

	equals(other) {
		if (this.plan.length !== other.plan.length) {
			return false;
		}

		// Compare each action in the plans
		return this.plan.every((item, index) => {
			const otherItem = other.plan[index];
			return (
				item.action === otherItem.action && item.timeStep === otherItem.timeStep
			);
		});
	}

	toString() {
		let s = `Plan:\n`;
		const timeSteps = Object.keys(this.actionsByTimeStep).sort((a, b) => a - b);

		for (const timeStep of timeSteps) {
			const actions = this.actionsByTimeStep[timeStep];
			s += `Time ${timeStep}: [${actions.map((a) => a.toString()).join(", ")}]\n`;
		}

		return s;
	}
}

export { Plan };
