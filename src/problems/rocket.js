import { Action } from "../graphplan/Action";
import { Problem } from "../graphplan/Planner";
import { Proposition } from "../graphplan/Proposition";

const london = "London";
const paris = "Paris";
const rocket = "Rocket1";
const cargoA = "CargoA";
const cargoB = "CargoB";

const initialState = [
	new Proposition("at", { obj: rocket, loc: london }, true),
	new Proposition("at", { obj: cargoA, loc: london }, true),
	new Proposition("at", { obj: cargoB, loc: london }, true),
	new Proposition("has-fuel", { obj: rocket }, true),
];

const goals = [
	new Proposition("at", { obj: cargoA, loc: paris }, true),
	new Proposition("at", { obj: cargoB, loc: paris }, true),
];

const loadAction = new Action(
	"load",
	{ obj: null, rocket: null, loc: null },
	[
		new Proposition("at", { obj: "{obj}", loc: "{loc}" }, true),
		new Proposition("at", { obj: "{rocket}", loc: "{loc}" }, true),
	],
	[
		new Proposition("in", { obj: "{obj}", rocket: "{rocket}" }, true),
		new Proposition("at", { obj: "{obj}", loc: "{loc}" }, false),
	],
);

const unloadAction = new Action(
	"unload",
	{ obj: null, rocket: null, loc: null },
	[
		new Proposition("in", { obj: "{obj}", rocket: "{rocket}" }, true),
		new Proposition("at", { obj: "{rocket}", loc: "{loc}" }, false),
	],
	[
		new Proposition("at", { obj: "{obj}", loc: "{loc}" }, true),
		new Proposition("in", { obj: "{obj}", rocket: "{rocket}" }, false),
	],
);

const moveAction = new Action(
	"move",
	{ rocket: null, from: null, to: null },
	[
		new Proposition("at", { obj: "{rocket}", loc: "{from}" }, true),
		new Proposition("has-fuel", { obj: "{rocket}" }, true),
	],
	[
		new Proposition("at", { obj: "{rocket}", loc: "{to}" }, true),
		new Proposition("at", { obj: "{rocket}", loc: "{from}" }, false),
		new Proposition("has-fuel", { obj: "{rocket}" }, false),
	],
);

const actionsForRocketProblem = [
	new Action(
		"load-A-R1-London",
		{ obj: cargoA, rocket: rocket, loc: london },
		[
			new Proposition("at", { obj: cargoA, loc: london }, true),
			new Proposition("at", { obj: rocket, loc: london }, true),
		],
		[
			new Proposition("in", { obj: cargoA, rocket: rocket }, true),
			new Proposition("at", { obj: cargoA, loc: london }, false),
		],
	),

	new Action(
		"load-B-R1-London",
		{ obj: cargoB, rocket: rocket, loc: london },
		[
			new Proposition("at", { obj: cargoB, loc: london }, true),
			new Proposition("at", { obj: rocket, loc: london }, true),
		],
		[
			new Proposition("in", { obj: cargoB, rocket: rocket }, true),
			new Proposition("at", { obj: cargoB, loc: london }, false),
		]
	),

	new Action(
		"move-R1-London-Paris",
		{ rocket: rocket, from: london, to: paris },
		[
			new Proposition("at", { obj: rocket, loc: london }),
			new Proposition("has-fuel", { obj: rocket }),
		],
		[
			new Proposition("at", { obj: rocket, loc: paris }, true),
			new Proposition("at", { obj: rocket, loc: london }, false),
			new Proposition("has-fuel", { obj: rocket }, false),
		],
	),

	new Action(
		"unload-A-R1-Paris",
		{ obj: cargoA, rocket: rocket, loc: paris },
		[
			new Proposition("in", { obj: cargoA, rocket: rocket }, true),
			new Proposition("at", { obj: rocket, loc: paris }, true),
		],
		[
			new Proposition("at", { obj: cargoA, loc: paris }, true),
			new Proposition("in", { obj: cargoA, rocket: rocket }, false),
		],
	),

	new Action(
		"unload-B-R1-Paris",
		{ obj: cargoB, rocket: rocket, loc: paris },
		[
			new Proposition("in", { obj: cargoB, rocket: rocket }, true),
			new Proposition("at", { obj: rocket, loc: paris }, true),
		],
		[
			new Proposition("at", { obj: cargoB, loc: paris }, true),
			new Proposition("in", { obj: cargoB, rocket: rocket }, false),
		],
	),
];

const rocketProblem = new Problem(initialState, goals, actionsForRocketProblem);

export { rocketProblem };
