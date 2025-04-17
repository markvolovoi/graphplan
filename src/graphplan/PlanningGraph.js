// REMOVE LATER: this is just a test script which works through
// node test.js

import { Action } from "./Action.js";

class ActionLevel {
	constructor(actions = [], mutexRelations = new Map()) {
		this.actions = actions;
		this.mutexRelations = mutexRelations;
	}

	add(action) {
		this.actions.push(action);
	}

	// Find mutex relations between actions at this level
	computeMutexRelations(prevLevel) {
		// Clear previous mutex relations
		this.mutexRelations = new Map();

		// Check each pair of actions for mutex relations
		for (let i = 0; i < this.actions.length; i++) {
			for (let j = i + 1; j < this.actions.length; j++) {
				const firstAction = this.actions[i];
				const secondAction = this.actions[j];

				if (this.areActionsMutex(firstAction, secondAction, prevLevel)) {
					// Add to mutex relations map
					if (!this.mutexRelations.has(firstAction)) {
						this.mutexRelations.set(firstAction, []);
					}
					if (!this.mutexRelations.has(secondAction)) {
						this.mutexRelations.set(secondAction, []);
					}

					this.mutexRelations.get(firstAction).push(secondAction);
					this.mutexRelations.get(secondAction).push(firstAction);
				}
			}
		}
	}

	// Check if two actions are mutex
	areActionsMutex(action1, action2, prevLevel) {
		// Check Interference: one action deletes precondition or add-effect of other

		// Check if action1 deletes any precondition of action2
		for (const pre of action2.preconditions) {
			for (const effect of action1.effects) {
				if (effect.negation(pre)) {
					return true;
				}
			}
		}

		// Check if action2 deletes any precondition of action1
		for (const pre of action1.preconditions) {
			for (const effect of action2.effects) {
				if (effect.negation(pre)) {
					return true;
				}
			}
		}

		// Check if actions have contradictory effects
		for (const effect1 of action1.effects) {
			for (const effect2 of action2.effects) {
				if (effect1.negation(effect2)) {
					return true;
				}
			}
		}

		// Check Competing Needs: if preconditions are mutex in previous level
		for (const pre1 of action1.preconditions) {
			for (const pre2 of action2.preconditions) {
				// Check if these preconditions are mutex in previous level
				if (prevLevel.areMutex(pre1, pre2)) {
					return true;
				}
			}
		}

		return false;
	}
}

class PropositionLevel {
	constructor(propositions = [], mutexRelations = new Map()) {
		this.propositions = propositions;
		this.mutexRelations = mutexRelations;
	}

	add(proposition) {
		// Check if proposition already exists
		const exists = this.propositions.some((p) => p.equals(proposition));
		if (!exists) {
			this.propositions.push(proposition);
		}
	}

	// Check if two propositions are mutex
	areMutex(prop1, prop2) {
		// Check if they are in mutex relations
		if (this.mutexRelations.has(prop1)) {
			return this.mutexRelations.get(prop1).some((p) => p.equals(prop2));
		}
		return false;
	}

	// Compute mutex relations based on previous action level
	computeMutexRelations(prevActionLevel) {
		// Clear previous mutex relations
		this.mutexRelations = new Map();

		// Check each pair of propositions
		for (let i = 0; i < this.propositions.length; i++) {
			for (let j = i + 1; j < this.propositions.length; j++) {
				const firstProp = this.propositions[i];
				const secondProp = this.propositions[j];

				// Skip if propositions are negations of each other (automatically mutex)
				if (firstProp.negation(secondProp)) {
					this.addMutexRelation(firstProp, secondProp);
					continue;
				}

				// Find actions that produce each proposition
				const actionsForFirst = prevActionLevel.actions.filter((action) =>
					action.effects.some((effect) => effect.equals(firstProp)),
				);

				const actionsForSecond = prevActionLevel.actions.filter((action) =>
					action.effects.some((effect) => effect.equals(secondProp)),
				);

				// Check if all actions producing these propositions are mutex
				let allActionsAreMutex = true;

				for (const action1 of actionsForFirst) {
					for (const action2 of actionsForSecond) {
						// If we find a pair that's not mutex, then props aren't mutex
						if (
							!prevActionLevel.mutexRelations.has(action1) ||
							!prevActionLevel.mutexRelations.get(action1).includes(action2)
						) {
							allActionsAreMutex = false;
							break;
						}
					}
					if (!allActionsAreMutex) break;
				}

				// If all actions are mutex, then propositions are mutex
				if (
					allActionsAreMutex &&
					actionsForFirst.length > 0 &&
					actionsForSecond.length > 0
				) {
					this.addMutexRelation(firstProp, secondProp);
				}
			}
		}
	}

	// Helper to add mutex relation
	addMutexRelation(prop1, prop2) {
		if (!this.mutexRelations.has(prop1)) {
			this.mutexRelations.set(prop1, []);
		}
		if (!this.mutexRelations.has(prop2)) {
			this.mutexRelations.set(prop2, []);
		}

		this.mutexRelations.get(prop1).push(prop2);
		this.mutexRelations.get(prop2).push(prop1);
	}
}

class PlanningGraph {
	constructor(problem) {
		this.problem = problem;
		this.propLevels = []; // List of proposition levels
		this.actionLevels = []; // List of action levels

		// Initialize first proposition level with initial conditions
		const firstLevel = new PropositionLevel();
		for (const prop of problem.initial) {
			firstLevel.add(prop);
		}

		this.propLevels.push(firstLevel);
	}

	// Extend the planning graph by one level
	extend() {
		const lastPropLevel = this.propLevels[this.propLevels.length - 1];

		// Create new action level
		const nextActionLevel = new ActionLevel();

		// Add applicable actions
		for (const action of this.problem.actionList) {
			if (action.isApplicable(lastPropLevel)) {
				nextActionLevel.add(action);
			}
		}

		// Add no-op actions
		this.addNoOpActions(lastPropLevel, nextActionLevel);

		// Compute mutex relations for the action level
		nextActionLevel.computeMutexRelations(lastPropLevel);

		// Add this action level to the graph
		this.actionLevels.push(nextActionLevel);

		// Create new proposition level
		const nextPropLevel = new PropositionLevel();

		// Add effects of actions to the proposition level
		for (const action of nextActionLevel.actions) {
			for (const effect of action.effects) {
				nextPropLevel.add(effect);
			}
		}

		// Compute mutex relations for the proposition level
		nextPropLevel.computeMutexRelations(nextActionLevel);

		// Add this proposition level to the graph
		this.propLevels.push(nextPropLevel);

		return nextPropLevel;
	}

	// Check if the planning graph has leveled off
	isLeveledOff() {
		if (this.propLevels.length < 2) {
			return false;
		}

		const lastPropLevel = this.propLevels[this.propLevels.length - 1];
		const prevPropLevel = this.propLevels[this.propLevels.length - 2];

		// Check if propositions are the same
		if (
			lastPropLevel.propositions.length !== prevPropLevel.propositions.length
		) {
			return false;
		}

		// Check if each proposition in last level exists in previous level
		for (const prop of lastPropLevel.propositions) {
			if (!prevPropLevel.propositions.some((p) => p.equals(prop))) {
				return false;
			}
		}

		// Check if mutex relations are the same
		if (
			lastPropLevel.mutexRelations.size !== prevPropLevel.mutexRelations.size
		) {
			return false;
		}

		// Check each mutex relation
		for (const [prop, mutexProps] of lastPropLevel.mutexRelations.entries()) {
			const prevMutexProps = prevPropLevel.mutexRelations.get(
				prevPropLevel.propositions.find((p) => p.equals(prop)),
			);

			if (!prevMutexProps || prevMutexProps.length !== mutexProps.length) {
				return false;
			}

			for (const mutexProp of mutexProps) {
				if (!prevMutexProps.some((p) => p.equals(mutexProp))) {
					return false;
				}
			}
		}

		return true;
	}

	// Check if goals are achievable at current level
	goalsAchievable() {
		const lastPropLevel = this.propLevels[this.propLevels.length - 1];

		// Check if all goals exist in the last proposition level
		for (const goal of this.problem.goals) {
			if (!lastPropLevel.propositions.some((p) => p.equals(goal))) {
				return false;
			}
		}

		// Check if any two goals are mutex
		for (let i = 0; i < this.problem.goals.length; i++) {
			for (let j = i + 1; j < this.problem.goals.length; j++) {
				const goal1 = this.problem.goals[i];
				const goal2 = this.problem.goals[j];

				const prop1 = lastPropLevel.propositions.find((p) => p.equals(goal1));
				const prop2 = lastPropLevel.propositions.find((p) => p.equals(goal2));

				if (lastPropLevel.areMutex(prop1, prop2)) {
					return false;
				}
			}
		}

		return true;
	}

	// Add no-op actions (frame actions) for all propositions in the previous level
	addNoOpActions(prevPropLevel, nextActionLevel) {
		for (const prop of prevPropLevel.propositions) {
			// Create a no-op action that preserves this proposition
			const noOp = new Action(`no-op-${prop.name}`, null, [prop], [prop]);
			nextActionLevel.add(noOp);
		}
	}
}

export { PlanningGraph, ActionLevel, PropositionLevel };
