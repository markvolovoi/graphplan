import { Plan } from "./Plan.js";
import { PlanningGraph } from "./PlanningGraph.js";

class Problem {
	constructor(initialState, goals, actionList) {
		this.initial = initialState;
		this.goals = goals;
		this.actionList = actionList;
	}

	toString() {
		return `Problem: Achieve ${this.goals.map((g) => g.toString()).join(", ")} starting from ${this.initial.map((i) => i.toString()).join(", ")} using actions ${this.actionList.map((a) => a.toString()).join(", ")}`;
	}
}

class GPSearch {
	constructor(pGraph) {
		this.pGraph = pGraph;
		this.memoizedGoals = new Map(); // Maps level -> set of unsolvable goal sets
	}

	search() {
		let level = 0;

		while (level < 1000) {
			// Extend the planning graph if needed
			if (level >= this.pGraph.propLevels.length - 1) {
				this.pGraph.extend();
			}

			// Check if goals are achievable at this level
			if (this.pGraph.goalsAchievable()) {
				// Try to extract a plan
				const plan = this.extractPlan(this.pGraph.problem.goals, level);
				if (plan) {
					return plan;
				}
			}

			// Check if graph has leveled off
			if (this.pGraph.isLeveledOff()) {
				// Check if the set of memoized goals at the current level
				// is the same as the previous level
				if (
					level > 0 &&
					this.memoizedGoals.has(level - 1) &&
					this.memoizedGoals.has(level) &&
					this.memoizedGoals.get(level - 1).size ===
						this.memoizedGoals.get(level).size
				) {
					// No plan exists
					return null;
				}
			}

			level++;
		}
		return null; // search failed from sheer iterations
	}

	// Extract a plan that achieves the given goals at the given level
	extractPlan(goals, level) {
		// Base case: reached level 0
		if (level === 0) {
			// Check if all goals are in the initial state
			for (const goal of goals) {
				if (!this.pGraph.problem.initial.some((prop) => prop.equals(goal))) {
					return null;
				}
			}
			return new Plan();
		}

		// Check if this goal set has already been proven unsolvable
		if (this.isGoalSetMemoized(goals, level)) {
			return null;
		}

		// Create all subsets of actions at level-1 that achieve the goals
		const actionSubsets = this.findActionSubsets(goals, level);

		// Try each subset
		for (const actionSubset of actionSubsets) {
			// Collect preconditions of these actions as subgoals
			const subgoals = this.getSubgoals(actionSubset, level - 1);

			// Recursively extract a plan for these subgoals
			const subplan = this.extractPlan(subgoals, level - 1);

			if (subplan) {
				// Add actions to the plan at the current level
				for (const action of actionSubset) {
					subplan.append(action, level);
				}
				return subplan;
			}
		}

		// No plan found, memoize this goal set as unsolvable
		this.memoizeGoalSet(goals, level);
		return null;
	}

	// Find all non-mutex action subsets that achieve the goals
	findActionSubsets(goals, level) {
		const actionLevel = this.pGraph.actionLevels[level - 1];
		const propLevel = this.pGraph.propLevels[level];

		// Map each goal to the actions that achieve it
		const actionsForGoals = goals.map((goal) => {
			return actionLevel.actions.filter((action) =>
				action.effects.some((effect) => effect.equals(goal)),
			);
		});

		// Generate all possible combinations of actions
		return this.generateActionCombinations(actionsForGoals, actionLevel);
	}

	// Generate all valid combinations of actions (non-mutex)
	generateActionCombinations(actionsForGoals, actionLevel) {
		const result = [];

		// Helper function to recursively build combinations
		const buildCombination = (currentCombination, goalIndex) => {
			// Base case: all goals covered
			if (goalIndex >= actionsForGoals.length) {
				// Make sure combination is minimal
				const minimal = this.isMinimalActionSet(
					currentCombination,
					actionsForGoals,
				);
				if (minimal) {
					result.push([...currentCombination]);
				}
				return;
			}

			// Try each action for this goal
			for (const action of actionsForGoals[goalIndex]) {
				// Skip if this action is mutex with any in current combination
				let isMutex = false;
				for (const existingAction of currentCombination) {
					if (
						actionLevel.mutexRelations.has(action) &&
						actionLevel.mutexRelations.get(action).includes(existingAction)
					) {
						isMutex = true;
						break;
					}
				}

				if (!isMutex) {
					// Add this action to combination and recurse
					currentCombination.push(action);
					buildCombination(currentCombination, goalIndex + 1);
					currentCombination.pop();
				}
			}

			// Check if goal is already achieved by an action in the combination
			for (const existingAction of currentCombination) {
				for (const effect of existingAction.effects) {
					if (effect.equals(actionsForGoals[goalIndex][0].effects[0])) {
						// Goal already achieved, move to next goal
						buildCombination(currentCombination, goalIndex + 1);
						return;
					}
				}
			}
		};

		buildCombination([], 0);
		return result;
	}

	// Check if an action set is minimal (no action can be removed)
	isMinimalActionSet(actions, actionsForGoals) {
		// For each action, check if removing it would still achieve all goals
		for (let i = 0; i < actions.length; i++) {
			const actionToRemove = actions[i];
			const reducedSet = actions.filter((_, index) => index !== i);

			// Check if all goals are still achieved
			let allGoalsAchieved = true;

			for (const goalActions of actionsForGoals) {
				const goalEffect = goalActions[0].effects[0]; // Get the goal effect

				// Check if any action in reduced set achieves this goal
				let goalAchieved = false;
				for (const action of reducedSet) {
					if (action.effects.some((effect) => effect.equals(goalEffect))) {
						goalAchieved = true;
						break;
					}
				}

				if (!goalAchieved) {
					allGoalsAchieved = false;
					break;
				}
			}

			if (allGoalsAchieved) {
				return false; // Not minimal
			}
		}

		return true;
	}

	// Get all preconditions of actions as subgoals
	getSubgoals(actions, level) {
		const subgoals = [];

		for (const action of actions) {
			for (const precondition of action.preconditions) {
				// Add only if not already present
				if (!subgoals.some((goal) => goal.equals(precondition))) {
					subgoals.push(precondition);
				}
			}
		}

		return subgoals;
	}

	// Check if a goal set is memoized as unsolvable
	isGoalSetMemoized(goals, level) {
		if (!this.memoizedGoals.has(level)) {
			return false;
		}

		const memoized = this.memoizedGoals.get(level);

		// Convert goals to a string for set lookup
		const goalKey = this.goalSetToString(goals);
		return memoized.has(goalKey);
	}

	// Memoize a goal set as unsolvable
	memoizeGoalSet(goals, level) {
		if (!this.memoizedGoals.has(level)) {
			this.memoizedGoals.set(level, new Set());
		}

		const memoized = this.memoizedGoals.get(level);
		const goalKey = this.goalSetToString(goals);
		memoized.add(goalKey);
	}

	// Convert a goal set to a string for memoization
	goalSetToString(goals) {
		return goals
			.map((goal) => goal.toString())
			.sort()
			.join("|");
	}
}

class Planner {
	constructor() {
		this.plan = null;
	}

	// Generate a plan using Graphplan algorithm
	generatePlan(problem) {
		// Create planning graph
		const pGraph = new PlanningGraph(problem);

		// Search for a plan
		const gpSearch = new GPSearch(pGraph);
		this.plan = gpSearch.search();

		return this.plan;
	}

	toString() {
		if (!this.plan) {
			return "No plan generated yet.";
		}
		return this.plan.toString();
	}
}

export { Problem, GPSearch, Planner };
