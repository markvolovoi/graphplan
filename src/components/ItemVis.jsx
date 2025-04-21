import { createSignal } from "solid-js";

function ActionVis(props) {
	var [opened, setOpened] = createSignal(false);

	return (
		<>
			<div
				class="bg-yorple-100 rounded-sm px-3 py-1 m-2 cursor-pointer select-none transition-all hover:bg-yorple-200 active:bg-yorple-300 shadow-md"
				onclick={() => setOpened(!opened())}
			>
				<span class="text-md block">
					{props.action.name}
					{props.action.params != null ?
						`(${Object.entries(props.action.params)
						.map((el) => ` ${el[0]}=${el[1]}`)
						.join(",")})` : ""}
				</span>
				<Show when={opened()}>
					<div class="block mt-2 text-sm">
						<p class="font-medium text-center">Preconditions:</p>
						<For each={props.action.preconditions}>
							{(item, index) => <p>{item.toString()}</p>}
						</For>
						<br />
						<p class="font-medium text-center">Effects:</p>
						<For each={props.action.effects}>
							{(item, index) => <p>{item.toString()}</p>}
						</For>
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
				class="bg-froggreen-100 rounded-sm px-3 py-1 m-2 cursor-pointer select-none transition-all hover:bg-froggreen-200 active:bg-froggreen-300 shadow-md"
				onclick={() => setOpened(!opened())}
			>
				<span class="text-md block">
					{props.prop.truth_value ? "" : "¬"}
					{props.prop.name}
				</span>
				<Show when={opened()}>
					<div class="block mt-2 text-sm">
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
