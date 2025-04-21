import { Action } from "../graphplan/Action";
import { Problem } from "../graphplan/Planner";
import { Proposition } from "../graphplan/Proposition";

import { rocketProblem } from "./rocket";
import { fixitProblem } from "./fix";
import { monkeyBananaProblem } from "./monkey_banana";
import { frogProblem } from "./frog";

const problems = {
	"Frogs": frogProblem,
	"Rocket Problem": rocketProblem,
	"Russell's Fixit Problem": fixitProblem,
	"Monkey and Bananas": monkeyBananaProblem,
};

export { problems };
