//gpt
import { Action } from "../graphplan/Action";
import { Problem } from "../graphplan/Planner";
import { Proposition } from "../graphplan/Proposition";

// Initial state
const initialState = [
	new Proposition("boltTight", null, false),            // bolt is initially loose
	new Proposition("wrench-on-table", null, true),        // wrench is on the table
	new Proposition("wrench-on-hand", null, false),        // wrench is not in hand
	new Proposition("handEmpty", null, true),              // hand is empty
];

const wrench = "wrench";
const bolt = "bolt";
// Goal: bolt is tight
const goals = [
	new Proposition("boltTight", null, true),
];

// Actions

const pickUp = new Action(
	"pickUp",
	{"item": wrench},
	[
		new Proposition("handEmpty", null, true),
		new Proposition("wrench-on-table", null, true),
	],
	[
		new Proposition("wrench-on-hand", null, true),
		new Proposition("wrench-on-table", null, false),
		new Proposition("handEmpty", null, false),
	],
);

const putDown = new Action(
	"putDown",
	{"item": wrench},
	[
		new Proposition("wrench-on-hand", null, true),
	],
	[
		new Proposition("wrench-on-table", null, true),
		new Proposition("handEmpty", null, true),
		new Proposition("wrench-on-hand", null, false),
	],
);

const tighten = new Action(
	"tighten",
	{"item" : bolt},
	[
		new Proposition("wrench-on-hand", null, true),
		new Proposition("boltTight", null, false),
	],
	[
		new Proposition("boltTight", null, true),
	],
);

const fixitActions = [pickUp, putDown, tighten];

const fixitProblem = new Problem(initialState, goals, fixitActions);

export { fixitProblem };
