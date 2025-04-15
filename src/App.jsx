import { createSignal, For } from "solid-js";
import { ProblemVis } from "./components/ProblemVis.jsx";
import "./App.css";
import { problems } from "./problems/problems.js";

function App() {
	const [problem, setProblem] = createSignal("null");

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
						value={problem()}
						onChange={(e) => setProblem(e.currentTarget.value)}
						class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
					>
						<option selected value="null">
							Choose a problem set
						</option>
						<For each={Object.entries(problems)}>
							{(item, index) => <option value={item[0]}>{item[0]}</option>}
						</For>
						e
						{/* <option value="frogs">Frogs</option>
						<option value="fixit">Russell's Fixit Problem</option>
						<option value="monkey">Monkey and Bananas</option>
						<option value="rocket">Rocket Problem</option> */}
					</select>
				</form>

				<div class="w-full h-48 drop-shadow-md rounded-md border border-gray-300 p-6 bg-white overflow-x-clip overflow-y-scroll">
					<ProblemVis name={problem()} problem={problems[problem()]} />
				</div>

				<button class="w-full p-3 bg-teal-600 border-none text-white rounded-md hover:bg-teal-700 active:bg-teal-800 cursor-pointer shadow-md hover:shadow-lg transition-all">
					Build Planning Graph
				</button>

				<div class="w-full h-96 drop-shadow-md rounded-md border border-gray-300 p-6 bg-white">
					replace this with the planning graph view. will use d3 (already
					installed!)
				</div>

				<button class="w-full p-3 bg-teal-600 border-none text-white rounded-md hover:bg-teal-700 active:bg-teal-800 cursor-pointer shadow-md hover:shadow-lg transition-all">
					Search For Plans
				</button>

				<div class="w-full h-96 drop-shadow-md rounded-md border border-gray-300 p-6 bg-white">
					plan view. will use d3
				</div>
			</div>

			<div class="bg-gray-200 p-6 w-full max-w-full fixed bottom-0 left-0 text-center">
				Made by the Recursive Rascals for CS3511.
			</div>
		</div>
	);
}

export default App;
