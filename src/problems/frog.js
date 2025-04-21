//gpt
import { Action } from "../graphplan/Action";
import { Problem } from "../graphplan/Planner";
import { Proposition } from "../graphplan/Proposition";

// Objects
const money = "money";
const frog = "frog";
const box = "box";

// Initial state
const initialState = [
	new Proposition("Have", { obj: money }, false), 
    new Proposition("Have", { obj: frog }, false),
];

// Goal
const goals = [
	new Proposition("Have", { obj: frog }, true),  // Monkey has the banana
];

// Actions

const askFor = new Action(
	"ask-for",
	{ obj: money },
	[
		new Proposition("Have", { obj: money }, false), 
        new Proposition("Have", { obj: frog }, false),
	],
	[
		new Proposition("Have", { obj: money }, true), 
	],
);

const buy = new Action(
	"Buy",
	{ obj: frog },
	[
		new Proposition("Have", { obj: money }, true), 
        new Proposition("Have", { obj: frog }, false),
	],
	[
		new Proposition("Have", { obj: money }, false), 
        new Proposition("Have", { obj: frog }, true),
	],
);

const frogActions = [askFor, buy];

const frogProblem = new Problem(initialState, goals, frogActions);

export { frogProblem };
