import { Action } from "../graphplan/Action";
import { Problem } from "../graphplan/Planner";
import { Proposition } from "../graphplan/Proposition";

import { rocketProblem } from "./rocket";

const problems = {
	Frogs: new Problem(
		[new Proposition("Sitting", null)], // initial state
		[new Proposition("Eat bug", null)], // goals
		[new Action("Jump", null, null, null)], // actions
	),
	"Rocket Problem": rocketProblem,
	"Russell's Fixit Problem": new Problem([], [], []),
	"Monkey and Bananas": new Problem([], [], []),
};

export { problems };
