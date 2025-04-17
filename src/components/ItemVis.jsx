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

function PropVis(props) {
	var [opened, setOpened] = createSignal(false);

	return (
		<>
			<div
				class="bg-lime-100 rounded-sm px-3 py-1 m-2 cursor-pointer select-none transition-all hover:bg-lime-200 active:bg-lime-300 shadow-md"
				onclick={() => setOpened(!opened())}
			>
				<span class="font-bold block">
					{props.prop.truth_value ? "" : "¬"}
					{props.prop.name}
					{props.prop.params["obj"] !== undefined
						? ` (${props.prop.params["obj"]} @ ${props.prop.params["loc"]})`
						: ""}
				</span>
				<Show when={opened()}>
					<div class="block mt-2">
						<p class="font-medium text-center">Parameters:</p>
						<For each={Object.entries(props.prop.params)}>
							{(item, index) => (
								<p>
									{item[0]}: {item[1]}
								</p>
							)}
						</For>
						{/* {props.prop.params} */}
						<br />
					</div>
				</Show>
			</div>
		</>
	);
}

export { ActionVis, PropVis };
