import { Proposition } from "./Proposition.js";
import { Action } from "./Action.js";
import { Problem, Planner } from "./Planner.js";

// Define the rocket domain from the paper
function createRocketDomain() {
	// Create propositions for initial state
	const initialState = [
		new Proposition("at", { rocket: "rocket1", loc: "London" }, true),
		new Proposition("at", { cargo: "A", loc: "London" }, true),
		new Proposition("at", { cargo: "B", loc: "London" }, true),
		new Proposition("has-fuel", { rocket: "rocket1" }, true),
	];

	// Define goal state
	const goals = [
		new Proposition("at", { cargo: "A", loc: "Paris" }, true),
		new Proposition("at", { cargo: "B", loc: "Paris" }, true),
	];

	// Define actions
	const actions = [];

	// Move action: London to Paris
	const moveLP = new Action(
		"move",
		{ rocket: "rocket1", from: "London", to: "Paris" },
		[
			new Proposition("at", { rocket: "rocket1", loc: "London" }, true),
			new Proposition("has-fuel", { rocket: "rocket1" }, true),
		],
		[
			new Proposition("at", { rocket: "rocket1", loc: "Paris" }, true),
			new Proposition("at", { rocket: "rocket1", loc: "London" }, false),
			new Proposition("has-fuel", { rocket: "rocket1" }, false),
		],
	);
	actions.push(moveLP);

	// Move action: Paris to London
	const movePL = new Action(
		"move",
		{ rocket: "rocket1", from: "Paris", to: "London" },
		[
			new Proposition("at", { rocket: "rocket1", loc: "Paris" }, true),
			new Proposition("has-fuel", { rocket: "rocket1" }, true),
		],
		[
			new Proposition("at", { rocket: "rocket1", loc: "London" }, true),
			new Proposition("at", { rocket: "rocket1", loc: "Paris" }, false),
			new Proposition("has-fuel", { rocket: "rocket1" }, false),
		],
	);
	actions.push(movePL);

	// Load A in London
	const loadAL = new Action(
		"load",
		{ cargo: "A", rocket: "rocket1", loc: "London" },
		[
			new Proposition("at", { rocket: "rocket1", loc: "London" }, true),
			new Proposition("at", { cargo: "A", loc: "London" }, true),
		],
		[
			new Proposition("in", { cargo: "A", rocket: "rocket1" }, true),
			new Proposition("at", { cargo: "A", loc: "London" }, false),
		],
	);
	actions.push(loadAL);

	// Load B in London
	const loadBL = new Action(
		"load",
		{ cargo: "B", rocket: "rocket1", loc: "London" },
		[
			new Proposition("at", { rocket: "rocket1", loc: "London" }, true),
			new Proposition("at", { cargo: "B", loc: "London" }, true),
		],
		[
			new Proposition("in", { cargo: "B", rocket: "rocket1" }, true),
			new Proposition("at", { cargo: "B", loc: "London" }, false),
		],
	);
	actions.push(loadBL);

	// Unload A in Paris
	const unloadAP = new Action(
		"unload",
		{ cargo: "A", rocket: "rocket1", loc: "Paris" },
		[
			new Proposition("at", { rocket: "rocket1", loc: "Paris" }, true),
			new Proposition("in", { cargo: "A", rocket: "rocket1" }, true),
		],
		[
			new Proposition("at", { cargo: "A", loc: "Paris" }, true),
			new Proposition("in", { cargo: "A", rocket: "rocket1" }, false),
		],
	);
	actions.push(unloadAP);

	// Unload B in Paris
	const unloadBP = new Action(
		"unload",
		{ cargo: "B", rocket: "rocket1", loc: "Paris" },
		[
			new Proposition("at", { rocket: "rocket1", loc: "Paris" }, true),
			new Proposition("in", { cargo: "B", rocket: "rocket1" }, true),
		],
		[
			new Proposition("at", { cargo: "B", loc: "Paris" }, true),
			new Proposition("in", { cargo: "B", rocket: "rocket1" }, false),
		],
	);
	actions.push(unloadBP);

	return new Problem(initialState, goals, actions);
}

// Main function to run the planner
function main() {
	console.log("Creating rocket domain problem...");
	const problem = createRocketDomain();
	console.log(problem.toString());

	console.log("\nGenerating plan...");
	const planner = new Planner();
	const plan = planner.generatePlan(problem);

	if (plan) {
		console.log("\nPlan found:");
		console.log(plan.toString());
	} else {
		console.log("\nNo plan found!");
	}
}

// Run the planner
main();
