import { Action } from "../graphplan/Action";
import { Problem } from "../graphplan/Planner";
import { Proposition } from "../graphplan/Proposition";

const london = "London";
const paris = "Paris";
const rocket = "Rocket1";
const cargoA = "CargoA";
const cargoB = "CargoB";

const initialState = [
	new Proposition("at", { obj: rocket, loc: london }),
	new Proposition("at", { obj: cargoA, loc: london }),
	new Proposition("at", { obj: cargoB, loc: london }),
	new Proposition("has-fuel", { obj: rocket }),
];

const goals = [
	new Proposition("at", { obj: cargoA, loc: paris }),
	new Proposition("at", { obj: cargoB, loc: paris }),
];

const loadAction = new Action(
	"load",
	{ obj: null, rocket: null, loc: null },
	[
		new Proposition("at", { obj: "{obj}", loc: "{loc}" }),
		new Proposition("at", { obj: "{rocket}", loc: "{loc}" }),
	],
	[
		{
			add: [new Proposition("in", { obj: "{obj}", rocket: "{rocket}" })],
			delete: [new Proposition("at", { obj: "{obj}", loc: "{loc}" })],
		},
	],
);

const unloadAction = new Action(
	"unload",
	{ obj: null, rocket: null, loc: null },
	[
		new Proposition("in", { obj: "{obj}", rocket: "{rocket}" }),
		new Proposition("at", { obj: "{rocket}", loc: "{loc}" }),
	],
	[
		{
			add: [new Proposition("at", { obj: "{obj}", loc: "{loc}" })],
			delete: [new Proposition("in", { obj: "{obj}", rocket: "{rocket}" })],
		},
	],
);

const moveAction = new Action(
	"move",
	{ rocket: null, from: null, to: null },
	[
		new Proposition("at", { obj: "{rocket}", loc: "{from}" }),
		new Proposition("has-fuel", { obj: "{rocket}" }),
	],
	[
		{
			add: [new Proposition("at", { obj: "{rocket}", loc: "{to}" })],
			delete: [
				new Proposition("at", { obj: "{rocket}", loc: "{from}" }),
				new Proposition("has-fuel", { obj: "{rocket}" }),
			],
		},
	],
);

const actionsForRocketProblem = [
	new Action(
		"load-A-R1-London",
		{ obj: cargoA, rocket: rocket, loc: london },
		[
			new Proposition("at", { obj: cargoA, loc: london }),
			new Proposition("at", { obj: rocket, loc: london }),
		],
		{
			add: [new Proposition("in", { obj: cargoA, rocket: rocket })],
			delete: [new Proposition("at", { obj: cargoA, loc: london })],
		},
	),

	new Action(
		"load-B-R1-London",
		{ obj: cargoB, rocket: rocket, loc: london },
		[
			new Proposition("at", { obj: cargoB, loc: london }),
			new Proposition("at", { obj: rocket, loc: london }),
		],
		{
			add: [new Proposition("in", { obj: cargoB, rocket: rocket })],
			delete: [new Proposition("at", { obj: cargoB, loc: london })],
		},
	),

	new Action(
		"move-R1-London-Paris",
		{ rocket: rocket, from: london, to: paris },
		[
			new Proposition("at", { obj: rocket, loc: london }),
			new Proposition("has-fuel", { obj: rocket }),
		],
		{
			add: [new Proposition("at", { obj: rocket, loc: paris })],
			delete: [
				new Proposition("at", { obj: rocket, loc: london }),
				new Proposition("has-fuel", { obj: rocket }),
			],
		},
	),

	new Action(
		"unload-A-R1-Paris",
		{ obj: cargoA, rocket: rocket, loc: paris },
		[
			new Proposition("in", { obj: cargoA, rocket: rocket }),
			new Proposition("at", { obj: rocket, loc: paris }),
		],
		{
			add: [new Proposition("at", { obj: cargoA, loc: paris })],
			delete: [new Proposition("in", { obj: cargoA, rocket: rocket })],
		},
	),

	new Action(
		"unload-B-R1-Paris",
		{ obj: cargoB, rocket: rocket, loc: paris },
		[
			new Proposition("in", { obj: cargoB, rocket: rocket }),
			new Proposition("at", { obj: rocket, loc: paris }),
		],
		{
			add: [new Proposition("at", { obj: cargoB, loc: paris })],
			delete: [new Proposition("in", { obj: cargoB, rocket: rocket })],
		},
	),
];

const rocketProblem = new Problem(initialState, goals, actionsForRocketProblem);

export { rocketProblem };
