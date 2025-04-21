//gpt
import { Action } from "../graphplan/Action";
import { Problem } from "../graphplan/Planner";
import { Proposition } from "../graphplan/Proposition";

// Locations
const door = "door";
const middle = "middle";
const window = "window";

// Objects
const monkey = "monkey";
const banana = "banana";
const box = "box";

// Initial state
const initialState = [
	new Proposition("at", { obj: monkey, loc: door }, true),  // Monkey is at the door
	new Proposition("at", { obj: banana, loc: middle }, true),  // Banana is at the middle
	new Proposition("at", { obj: box, loc: window }, true),  // Box is at the window
	new Proposition("on-floor", { obj: monkey }, true),  // Monkey is on the floor
	new Proposition("has-banana", { obj: monkey }, false),  // Monkey doesn't have the banana
	new Proposition("on-box", { obj: monkey }, false),  // Monkey is not on the box
];

// Goal
const goals = [
	new Proposition("has-banana", { obj: monkey }, true),  // Monkey has the banana
];

// Actions

const goToMiddle = new Action(
	"go-to-middle",
	{ obj: monkey },
	[
		new Proposition("at", { obj: monkey, loc: door }, true),  // Monkey is at the door
	],
	[
		new Proposition("at", { obj: monkey, loc: middle }, true),  // Monkey is at the middle
		new Proposition("at", { obj: monkey, loc: door }, false),  // Monkey leaves the door
	],
);

const pushBoxToMiddle = new Action(
	"push-box-to-middle",
	null,
	[
		new Proposition("at", { obj: monkey, loc: window }, true),  // Monkey is at the window
		new Proposition("at", { obj: box, loc: window }, true),  // Box is at the window
		new Proposition("on-floor", { obj: monkey }, true),  // Monkey is on the floor
	],
	[
		new Proposition("at", { obj: box, loc: middle }, true),  // Box is moved to the middle
		new Proposition("at", { obj: box, loc: window }, false),  // Box leaves the window
		new Proposition("at", { obj: monkey, loc: middle }, true),  // Monkey is at the middle
		new Proposition("at", { obj: monkey, loc: window }, false),  // Monkey leaves the window
	],
);

const climbBox = new Action(
	"climb-box",
	null,
	[
		new Proposition("at", { obj: monkey, loc: middle }, true),  // Monkey is at the middle
		new Proposition("at", { obj: box, loc: middle }, true),  // Box is at the middle
		new Proposition("on-floor", { obj: monkey }, true),  // Monkey is on the floor
	],
	[
		new Proposition("on-box", { obj: monkey }, true),  // Monkey is now on the box
		new Proposition("on-floor", { obj: monkey }, false),  // Monkey is no longer on the floor
	],
);

const graspBanana = new Action(
	"grasp-banana",
	null,
	[
		new Proposition("on-box", { obj: monkey }, true),  // Monkey is on the box
		new Proposition("at", { obj: banana, loc: middle }, true),  // Banana is at the middle
	],
	[
		new Proposition("has-banana", { obj: monkey }, true),  // Monkey has the banana
	],
);

const goToWindow = new Action(
	"go-to-window",
	{ obj: monkey },
	[
		new Proposition("at", { obj: monkey, loc: middle }, true),  // Monkey is at the middle
	],
	[
		new Proposition("at", { obj: monkey, loc: window }, true),  // Monkey is at the window
		new Proposition("at", { obj: monkey, loc: middle }, false),  // Monkey leaves the middle
	],
);

const monkeyBananaActions = [goToMiddle, pushBoxToMiddle, climbBox, graspBanana, goToWindow];

const monkeyBananaProblem = new Problem(initialState, goals, monkeyBananaActions);

export { monkeyBananaProblem };
