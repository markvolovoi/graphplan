import { Show } from "solid-js";

function ProblemVis(props) {
	return (
		<div>
			<Show when={props.name === "null"}>
				<p>Please select a problem to visualize.</p>
			</Show>
			<Show when={props.name !== "null"}>
				<div>
					<p class="text-2xl text-center font-bold">{props.name}</p>
					<div class="grid grid-cols-3 my-2 gap-3">
						<div>
							<p class="text-center font-medium">Initial Conditions</p>
							<For each={props.problem.initial}>
								{(value, index) => <div>{value.toString()}</div>}
							</For>
						</div>
						<div>
							<p class="text-center font-medium">Actions</p>
							<For each={props.problem.actionList}>
								{(value, index) => <div>{value.toString()}</div>}
							</For>
						</div>
						<div>
							<p class="text-center font-medium">Goals</p>
							<For each={props.problem.goals}>
								{(value, index) => <div>{value.toString()}</div>}
							</For>
						</div>
					</div>
				</div>
			</Show>
		</div>
	);
}

export { ProblemVis };
