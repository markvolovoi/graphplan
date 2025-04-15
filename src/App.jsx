import { createSignal } from "solid-js";
import "./App.css";

function App() {
	const [problem, setProblem] = createSignal("null");

	return (
		<div class="flex justify-center w-full max-w-full py-12 mb-24">
			<div class="w-1/2 space-y-6">
				<h1 class="text-5xl font-medium">Graphplan</h1>

				<p>
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
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Select a problem set
					</label>
					<select
						id="problemSelect"
						value={problem()}
						onChange={(e) => setProblem(e.currentTarget.value)}
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						<option selected value="null">
							Choose a problem set
						</option>
						<option value="frogs">Frogs</option>
						<option value="fixit">Russell's Fixit Problem</option>
						<option value="monkey">Monkey and Bananas</option>
						<option value="rocket">Rocket Problem</option>
					</select>
				</form>

				<div class="w-full h-48 drop-shadow-md rounded-md border border-gray-300 p-6 bg-white">
					replace this with a nice view of the problem set, initial conditions,
					available actions
					<br />
					<p>Selected: {problem()}</p>
				</div>

				<button class="w-full p-3 bg-teal-600 border-none text-white rounded-md hover:bg-teal-700 active:bg-teal-800 cursor-pointer shadow-md hover:shadow-lg transition-all">
					Build Planning Graph
				</button>

				<div class="w-full h-96 drop-shadow-md rounded-md border border-gray-300 p-6 bg-white">
					replace this with the planning graph view. will probably need d3.
					install it with npm if you do rather than importing i think.
				</div>

				<button class="w-full p-3 bg-teal-600 border-none text-white rounded-md hover:bg-teal-700 active:bg-teal-800 cursor-pointer shadow-md hover:shadow-lg transition-all">
					Search For Plans
				</button>

				<div class="w-full h-96 drop-shadow-md rounded-md border border-gray-300 p-6 bg-white">
					plan view. probably also needs d3
				</div>
			</div>

			<div class="bg-gray-200 p-6 w-full max-w-full fixed bottom-0 left-0 text-center">
				Made by the Recursive Rascals for CS3511.
			</div>
		</div>
	);
}

export default App;
