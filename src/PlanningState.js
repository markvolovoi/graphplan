// class to store all portions of the problem, plan, and planning graph
import { createSignal, createMemo, createEffect } from "solid-js";
import { PlanningGraph } from "./graphplan/PlanningGraph.js";
import { Planner, Problem, GPSearch } from "./graphplan/Planner.js";
import { problems } from "./problems/problems.js";

export const [problemName, setProblemName] = createSignal("null");
export const [selectedProblem, setSelectedProblem] = createSignal(null);

export const [planningGraph, setPlanningGraph] = createSignal(null);
export const [isGraphBuilt, setIsGraphBuilt] = createSignal(false);

export const [plan, setPlan] = createSignal(null);
export const [isPlanGenerated, setIsPlanGenerated] = createSignal(false);

createEffect(() => {
	const currentProblemName = problemName();
	if (currentProblemName === "null" || !problems[currentProblemName]) {
		setSelectedProblem(null);
	} else {
		setSelectedProblem(problems[currentProblemName]);
	}

	setPlanningGraph(null);
	setIsGraphBuilt(false);
	setPlan(null);
	setIsPlanGenerated(false);
});

export const buildPlanningGraph = () => {
	const problem = selectedProblem();
	if (!problem) return;

	const graph = new PlanningGraph(problem);

	let leveledOff = false;
	while (!leveledOff && !graph.goalsAchievable()) {
		graph.extend();
		leveledOff = graph.isLeveledOff();
	}

	setPlanningGraph(graph);
	setIsGraphBuilt(true);

	setPlan(null);
	setIsPlanGenerated(false);

	return graph;
};

export const searchForPlans = () => {
	const graph = planningGraph();
	if (!graph) return null;

	const gpSearch = new GPSearch(graph);
	const generatedPlan = gpSearch.search();

	setPlan(generatedPlan);
	setIsPlanGenerated(true);

	return generatedPlan;
};

export const planningGraphString = createMemo(() => {
	const graph = planningGraph();
	if (!graph) return "No planning graph built yet.";

	let result = "Planning Graph:\n\n";

	for (let i = 0; i < graph.propLevels.length; i++) {
		const propLevel = graph.propLevels[i];
		result += `<span class="proposition-level">Proposition Level ${i}:</span>\n`;
		result +=
			propLevel.propositions.map((p) => p.toString()).join("\n") + "\n\n";

		if (propLevel.mutexRelations.size > 0) {
			result += '<span class="mutex-relation">Mutex Relations:</span>\n';
			for (const [prop, mutexProps] of propLevel.mutexRelations.entries()) {
				if (mutexProps.length > 0) {
					result += `${prop.toString()} is mutex with ${mutexProps.map((p) => p.toString()).join(", ")}\n`;
				}
			}
			result += "\n";
		}

		if (i < graph.actionLevels.length) {
			const actionLevel = graph.actionLevels[i];
			result += `<span class="action-level">Action Level ${i}:</span>\n`;
			result +=
				actionLevel.actions.map((a) => a.toString()).join("\n") + "\n\n";

			if (actionLevel.mutexRelations.size > 0) {
				result += '<span class="mutex-relation">Mutex Relations:</span>\n';
				for (const [
					action,
					mutexActions,
				] of actionLevel.mutexRelations.entries()) {
					if (mutexActions.length > 0) {
						result += `${action.toString()} is mutex with ${mutexActions.map((a) => a.toString()).join(", ")}\n`;
					}
				}
				result += "\n";
			}
		}
	}

	return result;
});

export const planString = createMemo(() => {
	const currentPlan = plan();
	if (!currentPlan) return "No plan generated yet.";

	let result = "Plan Result:\n\n";

	const timeSteps = Object.keys(currentPlan.actionsByTimeStep).sort(
		(a, b) => a - b,
	);

	for (const timeStep of timeSteps) {
		const actions = currentPlan.actionsByTimeStep[timeStep];
		result += `<div class="plan-step">Time ${timeStep}: [${actions.map((a) => a.toString()).join(", ")}]</div>\n`;
	}

	if (timeSteps.length === 0) {
		result += "No valid plan was found!";
	}

	return result;
});
