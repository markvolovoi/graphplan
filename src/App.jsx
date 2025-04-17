import { createSignal, For } from "solid-js";
import { ProblemVis } from "./components/ProblemVis.jsx";
import "./App.css";
import { problems } from "./problems/problems.js";

import {
	problemName,
	setProblemName,
	isGraphBuilt,
	isPlanGenerated,
	buildPlanningGraph,
	searchForPlans,
	planningGraphString,
	planString,
	selectedProblem,
} from "./PlanningState.js";

function App() {
	return (
		<div class="flex justify-center w-full max-w-full py-12 mb-24">
			<div class="w-1/2 space-y-6">
				<h1 class="text-5xl font-medium">Graphplan</h1>

				<p class="text-gray-900">
					This website allows you to visualize the workings of the Graphplan
					algorithm, originally outlined{" "}
					<a
						href="http://www.cs.cmu.edu/~avrim/Papers/graphplan.pdf"
						class="text-blue-500 hover:text-blue-800 cursor-pointer transition-all"
					>
						here
					</a>
					. First, choose a problem set (or create your own), and then click
					"Build Planning Graph." Then, you can see the final possible plans
					using "Search for Plans."
				</p>
				<form class="w-ful">
					<label
						for="problemSelect"
						class="block mb-2 text-sm font-medium text-gray-900"
					>
						Select a problem set
					</label>
					<select
						id="problemSelect"
						value={problemName()}
						onChange={(e) => setProblemName(e.currentTarget.value)}
						class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
					>
						<option selected value="null">
							Choose a problem set
						</option>
						<For each={Object.entries(problems)}>
							{(item, index) => <option value={item[0]}>{item[0]}</option>}
						</For>
					</select>
				</form>

				<div class="w-full h-48 drop-shadow-md rounded-md border border-gray-300 p-6 bg-white overflow-x-clip overflow-y-scroll">
					<ProblemVis name={problemName()} problem={problems[problemName()]} />
				</div>

				<button
					onClick={buildPlanningGraph}
					class="w-full p-3 bg-teal-600 border-none text-white rounded-md hover:bg-teal-700 active:bg-teal-800 cursor-pointer shadow-md hover:shadow-lg transition-all"
				>
					Build Planning Graph
				</button>

				<div class="w-full h-96 drop-shadow-md rounded-md border border-gray-300 p-6 bg-white overflow-y-auto">
					<pre
						innerHTML={
							isGraphBuilt()
								? planningGraphString()
								: "Planning graph will appear here."
						}
					></pre>
				</div>

				<button
					onClick={searchForPlans}
					class="w-full p-3 bg-teal-600 border-none text-white rounded-md hover:bg-teal-700 active:bg-teal-800 cursor-pointer shadow-md hover:shadow-lg transition-all"
				>
					Search For Plans
				</button>

				<div class="w-full h-96 drop-shadow-md rounded-md border border-gray-300 p-6 bg-white overflow-y-auto">
					<pre
						innerHTML={
							isPlanGenerated() ? planString() : "Plan will appear here."
						}
					></pre>
				</div>
			</div>

			<div class="bg-gray-200 p-6 w-full max-w-full fixed bottom-0 left-0 text-center">
				Made by the Recursive Rascals for CS3511.
			</div>
		</div>
	);
}

export default App;
