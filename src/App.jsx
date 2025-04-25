import { createSignal, For } from "solid-js";
import { ProblemVis } from "./components/ProblemVis.jsx";
import { GraphView } from "./components/GraphView.jsx";
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
	planningGraph,
	plan,
} from "./PlanningState.js";

function App() {
	const [showGraph, setShowGraph] = createSignal(true);
	const [showPlanGraph, setShowPlanGraph] = createSignal(true);
	return (
		<div class="flex justify-center w-full max-w-full py-12 mb-24">
			<div class="w-1/2 space-y-6">
				<h1 class="text-5xl font-medium text-zinc-800">Graphplan</h1>

				<p class="text-zinc-800">
					This website allows you to visualize the workings of the Graphplan
					algorithm, originally outlined{" "}
					<a
						href="http://www.cs.cmu.edu/~avrim/Papers/graphplan.pdf"
						class="text-froggreen-500 hover:text-froggreen-700 cursor-pointer transition-all"
					>
						here
					</a>
					. First, choose a problem set and then click "Build Planning Graph."
					Then, you can see the final possible plans using "Search for Plans."
					The source code is available{" "}
					<a
						href="https://github.com/markvolovoi/graphplan"
						class="text-froggreen-500 hover:text-froggreen-700 cursor-pointer transition-all"
					>
						here
					</a>
					.
				</p>
				<p class="text-zinc-400 -mt-3">
					Note: Graphplan runs in browser, and complex problems may take a while
					to compute.
				</p>
				<form class="w-full">
					<label
						for="problemSelect"
						class="block mb-2 text-sm font-medium text-zinc-800"
					>
						Select a problem set
					</label>
					<select
						id="problemSelect"
						value={problemName()}
						onChange={(e) => setProblemName(e.currentTarget.value)}
						class="bg-white border border-gray-300 text-zinc-800 text-sm rounded-lg focus:ring-froggreen-500 focus:border-froggreen-500 block w-full p-3"
					>
						<option selected value="null">
							Choose a problem set
						</option>
						<For each={Object.entries(problems)}>
							{(item, index) => <option value={item[0]}>{item[0]}</option>}
						</For>
					</select>
				</form>

				<div class="w-full h-72 drop-shadow-md rounded-md border border-zinc-300 p-6 bg-zinc-50 overflow-x-clip overflow-y-scroll">
					<ProblemVis name={problemName()} problem={problems[problemName()]} />
				</div>

				<button
					onClick={buildPlanningGraph}
					class="w-full p-3 bg-froggreen-500 border-none text-white rounded-md hover:bg-froggreen-600 active:bg-froggreen-700 cursor-pointer shadow-md hover:shadow-lg transition-all"
				>
					Build Planning Graph
				</button>

				<div class="text-right">
					<label class="select-none">
						<input
							type="checkbox"
							checked={showGraph()}
							onInput={(e) => setShowGraph(e.currentTarget.checked)}
						/>
						<span class="ml-2 font-medium text-zinc-800">
							View Planning Graph as Graph
						</span>
					</label>
				</div>
				<div class="w-full h-96 relative drop-shadow-md rounded-md border border-zinc-300 bg-zinc-50">
					{isGraphBuilt() && showGraph() ? (
						<GraphView graph={planningGraph()} />
					) : (
						<pre class="p-2 overflow-auto h-full">
							{isGraphBuilt()
								? planningGraphString()
								: "Planning graph will appear here."}
						</pre>
					)}
				</div>

				<button
					onClick={searchForPlans}
					class="w-full p-3 bg-froggreen-500 border-none text-white rounded-md hover:bg-froggreen-600 active:bg-froggreen-700 cursor-pointer shadow-md hover:shadow-lg transition-all"
				>
					Search For Plans
				</button>

				<div class="text-right">
					<label class="select-none">
						<input
							type="checkbox"
							checked={showPlanGraph()}
							onInput={(e) => setShowPlanGraph(e.currentTarget.checked)}
						/>
						<span class="ml-2 font-medium text-gray-900">
							View Plan as Graph
						</span>
					</label>
				</div>
				<div class="w-full h-96 relative drop-shadow-md rounded-md border border-zinc-300 bg-zinc-50">
					{isPlanGenerated() && showPlanGraph() ? (
						<GraphView plan={plan()} />
					) : (
						<pre class="p-2 overflow-auto h-full">
							{isPlanGenerated() ? planString() : "Plan will appear here."}
						</pre>
					)}
				</div>
			</div>

			<div class="bg-zinc-200 p-3 w-full max-w-full fixed bottom-0 left-0 text-center">
				Made by the Recursive Rascals for CS3511.
			</div>
		</div>
	);
}

export default App;
