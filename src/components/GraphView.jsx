import { onMount, createSignal } from "solid-js";
import * as d3 from "d3";

// Helper function to create more readable labels
function createReadableLabel(node) {
	if (!node || !node.original) return node.id;

	const original = node.original;

	if (node.type === "action") {
		// For actions, show the name with simplified parameters
		if (!original.params) return original.name;

		// Get a brief representation of parameters (just values)
		const paramValues = Object.values(original.params).join(",");
		return paramValues.length > 0
			? `${original.name}(${paramValues})`
			: original.name;
	} else if (node.type === "prop") {
		// For propositions, show name with a simplified parameter format
		const prefix = original.truth_value === false ? "¬" : "";

		// If there are no parameters, just return the name
		if (!original.params) return `${prefix}${original.name}`;

		// Get a brief representation of parameters (just values, not keys)
		const paramValues = Object.values(original.params).join(",");
		return paramValues.length > 0
			? `${prefix}${original.name}(${paramValues})`
			: `${prefix}${original.name}`;
	}

	return node.id;
}

export function GraphView(props) {
	let svgRef;
	let tooltipRef;

	// Signals for tooltip state
	const [tooltipVisible, setTooltipVisible] = createSignal(false);
	const [tooltipContent, setTooltipContent] = createSignal("");
	const [tooltipPosition, setTooltipPosition] = createSignal({ x: 0, y: 0 });

	onMount(() => {
		const raw = props.graph ?? props.plan;
		if (!raw) return;

		// Clear any previous graph
		d3.select(svgRef).selectAll("*").remove();

		// Debug logging
		console.log("Building graph with:", {
			graph: props.graph ? true : false,
			plan: props.plan ? true : false,
			propLevels: props.graph?.propLevels?.length,
			actionLevels: props.graph?.actionLevels?.length,
		});

		// Build nodes & links
		const nodes = [];
		const links = [];
		let levelInfo = [];

		if (props.graph) {
			// --- PLANNING GRAPH visualization ---
			const G = props.graph;

			// Add proposition nodes with level tracking
			G.propLevels.forEach((lev, i) => {
				levelInfo.push({
					level: i * 2, // Position prop levels at even numbers
					type: "prop",
					count: lev.propositions.length,
					label: `Proposition Level ${i}`,
				});

				lev.propositions.forEach((p) =>
					nodes.push({
						id: p.toString(),
						type: "prop",
						level: i * 2,
						original: p,
					}),
				);
			});

			// Add action nodes with level tracking
			G.actionLevels.forEach((lev, i) => {
				levelInfo.push({
					level: i * 2 + 1, // Position action levels at odd numbers
					type: "action",
					count: lev.actions.length,
					label: `Action Level ${i}`,
				});

				lev.actions.forEach((a) =>
					nodes.push({
						id: a.toString(),
						type: "action",
						level: i * 2 + 1,
						original: a,
					}),
				);
			});

			// Create precondition links
			G.propLevels.forEach((lev, i) => {
				if (i < G.actionLevels.length) {
					lev.propositions.forEach((p) => {
						G.actionLevels[i].actions.forEach((a) => {
							if (
								a.preconditions &&
								a.preconditions.some((pre) => {
									try {
										return pre.equals(p);
									} catch (error) {
										console.error(
											"Error comparing precondition:",
											error,
											pre,
											p,
										);
										return false;
									}
								})
							) {
								links.push({
									source: p.toString(),
									target: a.toString(),
									type: "precondition",
								});
							}
						});
					});
				}
			});

			// Create effect links
			G.actionLevels.forEach((lev, i) => {
				lev.actions.forEach((a) => {
					G.propLevels[i + 1].propositions.forEach((p) => {
						if (
							a.effects &&
							a.effects.some((eff) => {
								try {
									return eff.equals(p);
								} catch (error) {
									console.error("Error comparing effect:", error, eff, p);
									return false;
								}
							})
						) {
							links.push({
								source: a.toString(),
								target: p.toString(),
								type: "effect",
							});
						}
					});
				});
			});

			// Optional: Add mutex links (visually different)
			// Commented out for clarity but can be uncommented if needed
			/*
			G.propLevels.forEach((lev, i) => {
				if (lev.mutexRelations && lev.mutexRelations.size > 0) {
					for (const [prop, mutexProps] of lev.mutexRelations.entries()) {
						mutexProps.forEach(mutexProp => {
							// Only add each mutex relation once (avoid duplicates)
							if (prop.toString() < mutexProp.toString()) {
								links.push({
									source: prop.toString(),
									target: mutexProp.toString(),
									type: "mutex"
								});
							}
						});
					}
				}
			});
			*/

			// Also comment out action mutex relations
			/*
				G.actionLevels.forEach((lev, i) => {
					if (lev.mutexRelations && lev.mutexRelations.size > 0) {
						for (const [action, mutexActions] of lev.mutexRelations.entries()) {
							mutexActions.forEach(mutexAction => {
								// Only add each mutex relation once (avoid duplicates)
								if (action.toString() < mutexAction.toString()) {
									links.push({
										source: action.toString(),
										target: mutexAction.toString(),
										type: "mutex"
									});
								}
							});
						}
					}
				});
				*/
		} else {
			// --- PLAN visualization ---
			const P = props.plan;
			const byStep = P.actionsByTimeStep;

			// Collect level information
			levelInfo = Object.keys(byStep).map((t) => ({
				level: Number(t),
				type: "action",
				count: byStep[t].length,
				label: `Time Step ${t}`,
			}));

			// Add action nodes
			Object.entries(byStep).forEach(([t, acts]) => {
				acts.forEach((a) =>
					nodes.push({
						id: a.toString(),
						type: "action",
						level: Number(t),
						original: a,
					}),
				);
			});

			// Create sequence links
			const steps = Object.keys(byStep)
				.map(Number)
				.sort((a, b) => a - b);

			for (let i = 0; i < steps.length - 1; i++) {
				const a1 = byStep[steps[i]];
				const a2 = byStep[steps[i + 1]];
				a1.forEach((x) =>
					a2.forEach((y) =>
						links.push({
							source: x.toString(),
							target: y.toString(),
							type: "sequence",
						}),
					),
				);
			}
		}

		// SVG setup
		const width = svgRef.clientWidth || 800;
		const height = svgRef.clientHeight || 600;
		const svg = d3.select(svgRef);
		svg.attr("viewBox", [0, 0, width, height]);
		const g = svg.append("g");

		// Zoom behavior
		const zoom = d3
			.zoom()
			.scaleExtent([0.1, 4])
			.on("zoom", (e) => g.attr("transform", e.transform));

		svg
			.call(zoom)
			.call(
				zoom.transform,
				d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8),
			);

		// Arrow markers for links
		svg
			.append("defs")
			.selectAll("marker")
			.data(["precondition", "effect", "sequence"])
			.enter()
			.append("marker")
			.attr("id", (d) => `arrow-${d}`)
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 15)
			.attr("refY", 0)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M0,-5L10,0L0,5")
			.attr("fill", (d) => (d === "precondition" ? "#999" : "#555"));

		// Color scheme
		const nodeColors = {
			prop: "#4299e1", // blue
			action: "#ed8936", // orange
			selected: "#38a169", // green for selected nodes
		};

		// Level visualization
		if (levelInfo.length > 0) {
			const maxLevel = Math.max(...levelInfo.map((l) => l.level));
			const levelSpacing = width / (maxLevel + 2); // Leave room on edges

			// Draw level backgrounds
			g.append("g")
				.selectAll("rect")
				.data(levelInfo)
				.join("rect")
				.attr("x", (d) => (d.level + 1) * levelSpacing - levelSpacing / 2 + 10)
				.attr("y", 30) // Start below the labels
				.attr("width", levelSpacing - 20)
				.attr("height", height - 60)
				.attr("fill", (d) => (d.type === "prop" ? "#e6f7ff" : "#fff8e6"))
				.attr("stroke", (d) => (d.type === "prop" ? "#bde0ff" : "#ffe8a9"))
				.attr("stroke-width", 1)
				.attr("rx", 5)
				.attr("ry", 5)
				.attr("opacity", 0.3);

			// Add level headers
			g.append("g")
				.selectAll("text")
				.data(levelInfo)
				.join("text")
				.attr("x", (d) => (d.level + 1) * levelSpacing)
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.attr("font-size", "12px")
				.attr("font-weight", "bold")
				.attr("font-family", "sans-serif")
				.attr("fill", (d) => (d.type === "prop" ? "#1a7fd1" : "#c76500"))
				.text((d) => d.label);
		}

		// Create links
		const link = g
			.append("g")
			.selectAll("line")
			.data(links)
			.join("line")
			.attr("stroke", (d) => (d.type === "mutex" ? "#e53e3e" : "#999"))
			.attr("stroke-opacity", (d) => (d.type === "mutex" ? 0.4 : 0.6))
			.attr("stroke-width", (d) => (d.type === "mutex" ? 1 : 1.5))
			.attr("stroke-dasharray", (d) => (d.type === "mutex" ? "3,3" : null))
			.attr("marker-end", (d) =>
				d.type !== "mutex" ? `url(#arrow-${d.type})` : null,
			);

		// Error handling for empty nodes
		if (nodes.length === 0) {
			svg
				.append("text")
				.attr("x", width / 2)
				.attr("y", height / 2)
				.attr("text-anchor", "middle")
				.attr("fill", "red")
				.text("No nodes to display. Check console for errors.");
			console.error("No nodes found to visualize");
			return;
		}

		// Create nodes
		const node = g
			.append("g")
			.selectAll("circle")
			.data(nodes)
			.join("circle")
			.attr("r", (d) => (d.type === "action" ? 7 : 6))
			.attr("fill", (d) => nodeColors[d.type])
			.attr("stroke", "#fff")
			.attr("stroke-width", 1.5)
			.call(
				d3
					.drag()
					.on("start", (e, d) => {
						if (!e.active) simulation.alphaTarget(0.3).restart();
						d.fx = d.x;
						d.fy = d.y;
					})
					.on("drag", (e, d) => {
						d.fx = e.x;
						d.fy = e.y;
					})
					.on("end", (e, d) => {
						if (!e.active) simulation.alphaTarget(0);
						d.fx = null;
						d.fy = null;
					}),
			)
			.on("mouseover", function (event, d) {
				d3.select(this)
					.attr("r", d.type === "action" ? 9 : 8)
					.attr("stroke", "#38a169");

				// Show the tooltip with full node information
				setTooltipContent(d.id);
				setTooltipPosition({
					x: event.clientX + 10,
					y: event.clientY - 10,
				});
				setTooltipVisible(true);

				// Highlight connected elements
				link.attr("stroke-opacity", (l) =>
					l.source.id === d.id || l.target.id === d.id ? 1 : 0.1,
				);

				node.attr("opacity", (n) =>
					n.id === d.id ||
					links.some(
						(l) =>
							(l.source.id === d.id && l.target.id === n.id) ||
							(l.source.id === n.id && l.target.id === d.id),
					)
						? 1
						: 0.4,
				);

				label.attr("opacity", (n) =>
					n.id === d.id ||
					links.some(
						(l) =>
							(l.source.id === d.id && l.target.id === n.id) ||
							(l.source.id === n.id && l.target.id === d.id),
					)
						? 1
						: 0.4,
				);
			})
			.on("mousemove", function (event) {
				// Update tooltip position when mouse moves
				setTooltipPosition({
					x: event.clientX + 10,
					y: event.clientY - 10,
				});
			})
			.on("mouseout", function () {
				d3.select(this)
					.attr("r", (d) => (d.type === "action" ? 7 : 6))
					.attr("stroke", "#fff");

				// Hide tooltip
				setTooltipVisible(false);

				// Reset highlighting
				link.attr("stroke-opacity", (d) => (d.type === "mutex" ? 0.4 : 0.6));
				node.attr("opacity", 1);
				label.attr("opacity", 1);
			});

		// Create labels with simplified text
		const label = g
			.append("g")
			.selectAll("text")
			.data(nodes)
			.join("text")
			.text((d) => createReadableLabel(d))
			.attr("font-size", "10px")
			.attr("font-family", "sans-serif")
			.attr("dx", 9)
			.attr("dy", "0.35em")
			.attr("pointer-events", "none")
			.attr("fill", "#333");

		// Layout calculations
		const maxLevel = Math.max(...nodes.map((n) => n.level));
		const levelSpacing = width / (maxLevel + 2); // Leave room on edges

		// Initialize node positions based on levels
		nodes.forEach((node) => {
			// Horizontal position fixed by level
			node.x = (node.level + 1) * levelSpacing;

			// Vertical positions to distribute nodes within levels
			const nodesInSameLevel = nodes.filter((n) => n.level === node.level);
			const levelSize = nodesInSameLevel.length;
			const nodeIndexInLevel = nodesInSameLevel.indexOf(node);

			if (levelSize > 1) {
				const levelHeight = height * 0.7;
				const gap = levelHeight / (levelSize - 1);
				node.y = (height - levelHeight) / 2 + nodeIndexInLevel * gap;
			} else {
				node.y = height / 2;
			}
		});

		// Force simulation
		const simulation = d3
			.forceSimulation(nodes)
			.force(
				"link",
				d3
					.forceLink(links)
					.id((d) => d.id)
					.distance(100),
			)
			.force("charge", d3.forceManyBody().strength(-200))
			.force("collide", d3.forceCollide().radius(20))
			// Strong x force to keep nodes in their levels
			.force(
				"x",
				d3
					.forceX()
					.x((d) => (d.level + 1) * levelSpacing)
					.strength(0.7),
			)
			// Weaker y force to allow vertical distribution
			.force("y", d3.forceY(height / 2).strength(0.05))
			.alpha(1)
			.alphaDecay(0.02);

		// Update positions on each tick
		simulation.on("tick", () => {
			// Constrain x position to maintain level structure
			nodes.forEach((node) => {
				// Fix x position to level
				node.x = (node.level + 1) * levelSpacing;

				// Keep y position within bounds
				node.y = Math.max(40, Math.min(height - 30, node.y));
			});

			link
				.attr("x1", (d) => d.source.x)
				.attr("y1", (d) => d.source.y)
				.attr("x2", (d) => d.target.x)
				.attr("y2", (d) => d.target.y);

			node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

			label.attr("x", (d) => d.x).attr("y", (d) => d.y);
		});
	});

	return (
		<div style="width:100%; height:100%; position: relative;">
			<svg
				ref={svgRef}
				style="width:100%; height:100%; border:1px solid #ddd; background:#fafafa; overflow: hidden"
			/>

			{/* Tooltip */}
			<div
				ref={tooltipRef}
				style={{
					position: "fixed",
					left: `${tooltipPosition().x}px`,
					top: `${tooltipPosition().y}px`,
					background: "rgba(0, 0, 0, 0.7)",
					color: "white",
					padding: "5px 10px",
					borderRadius: "4px",
					fontSize: "12px",
					pointerEvents: "none",
					zIndex: 1000,
					opacity: tooltipVisible() ? 1 : 0,
					transition: "opacity 0.2s",
				}}
			>
				{tooltipContent()}
			</div>

			{/* Legend */}
			<div style="position: absolute; bottom: 10px; left: 10px; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 5px; font-size: 12px; box-shadow: 0 0 5px rgba(0,0,0,0.1);">
				<div style="font-weight: bold; margin-bottom: 5px;">Legend</div>
				<div style="display: flex; align-items: center; margin-bottom: 4px;">
					<div style="width: 12px; height: 12px; border-radius: 50%; background: #4299e1; margin-right: 6px;"></div>
					<span>Proposition</span>
				</div>
				<div style="display: flex; align-items: center; margin-bottom: 4px;">
					<div style="width: 12px; height: 12px; border-radius: 50%; background: #ed8936; margin-right: 6px;"></div>
					<span>Action</span>
				</div>
				<div style="display: flex; align-items: center; margin-bottom: 4px;">
					<div style="width: 20px; height: 2px; background: #999; margin-right: 6px;"></div>
					<span>Precondition</span>
				</div>
				<div style="display: flex; align-items: center;">
					<div style="width: 20px; height: 2px; background: #555; margin-right: 6px;"></div>
					<span>Effect</span>
				</div>
			</div>
		</div>
	);
}
