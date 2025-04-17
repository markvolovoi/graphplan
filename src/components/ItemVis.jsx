import { createSignal } from "solid-js";

function ActionVis(props) {
	var [opened, setOpened] = createSignal(false);

	return (
		<>
			<div
				class="bg-sky-100 rounded-sm px-3 py-1 m-2 cursor-pointer select-none transition-all hover:bg-sky-200 active:bg-sky-300 shadow-md"
				onclick={() => setOpened(!opened())}
			>
				<span class="font-bold block">{props.action.name}</span>
				{/* {props.action.toString()} */}
				<Show when={opened()}>
					<div class="block mt-2">
						<p class="font-medium text-center">Preconditions:</p>
						{props.action.preconditions}
						<br />
						<p class="font-medium text-center">Effects:</p>
						{props.action.effects}
					</div>
				</Show>
			</div>
		</>
	);
}

export { ActionVis };
