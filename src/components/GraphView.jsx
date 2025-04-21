import { onMount, createSignal } from "solid-js";
import * as d3 from "d3";

//from gpt - makes text wrap
function truncateText(text, maxWidth, fontSize = 22) {
	const avgCharWidth = fontSize * 0.6; // rough average
	const maxChars = Math.floor(maxWidth / (avgCharWidth*2));
	return text.length > maxChars ? text.slice(0, maxChars - 3) + "..." : text;
}

// Helper function to create more readable labels
function createReadableLabel(node, width) {
	if (!node || !node.original) return node.id;

	const original = node.original;

	if (node.type === "action") {
		// For actions, show the name with simplified parameters
		if (!original.params) return truncateText(original.name, width);

		// Get a brief representation of parameters (just values)
		const paramValues = Object.values(original.params).join(",");
		const text = paramValues.length > 0
		? `${original.name}(${paramValues})`
		: original.name;
		return truncateText(text, width);
	} else if (node.type === "prop") {
		// For propositions, show name with a simplified parameter format
		const prefix = original.truth_value === false ? "¬" : "";

		// If there are no parameters, just return the name
		if (!original.params) return truncateText(`${prefix}${original.name}`, width);

		// Get a brief representation of parameters (just values, not keys)
		const paramValues = Object.values(original.params).join(",");
		const text = paramValues.length > 0
		? `${prefix}${original.name}(${paramValues})`
		: `${prefix}${original.name}`;
		return truncateText(text, width);
	}

	return node.id;
}

// Calculate minimum dimensions based on graph complexity
function calculateDimensions(nodes, levelInfo) {
	if (!nodes || nodes.length === 0) return { width: 1200, height: 800 };

	// Get the maximum level
	const maxLevel = Math.max(...nodes.map((n) => n.level ?? 0));

	// Calculate nodes per level
	const nodesPerLevel = {};
	nodes.forEach((node) => {
		nodesPerLevel[node.level] = (nodesPerLevel[node.level] || 0) + 1;
	});

	// Get maximum nodes in any level
	const maxNodesInLevel = Math.max(...Object.values(nodesPerLevel));

	// Calculate minimum dimensions with reasonable base values
	// Reduce the spacing between levels slightly to prevent overly wide graphs
	const minWidth = Math.max(1200, (maxLevel + 1) * 200);

	// Each node needs vertical space - but don't make it too tall
	const minHeight = Math.max(800, Math.min(maxNodesInLevel * 60 + 120, 1600));

	return { width: minWidth, height: minHeight };
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
					label: `Prop. Level ${i}`,
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
					label: `Act. Level ${i}`,
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

		// Error handling for empty nodes
		if (nodes.length === 0) {
			const svg = d3.select(svgRef);
			const width = svgRef.clientWidth || 800;
			const height = svgRef.clientHeight || 600;

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

		// Calculate appropriate dimensions based on graph complexity
		// But limit maximum dimensions to prevent extremely large graphs
		const rawDimensions = calculateDimensions(nodes, levelInfo);
		const width = Math.min(rawDimensions.width, 3000); // Cap width
		const maxLevel = Math.max(...nodes.map((n) => n.level));
		const levelSpacing = width / (maxLevel + 2); // Leave room on edges
		const height = Math.min(rawDimensions.height, 2000); // Cap height

		// SVG setup with dynamic sizing
		const svg = d3.select(svgRef);
		svg.attr("viewBox", [0, 0, width, height]);
		const g = svg.append("g");

		// Zoom behavior with improved initial centering
		const zoom = d3
			.zoom()
			.scaleExtent([0.3, 4]) // Adjusted minimum scale
			.on("zoom", (e) => g.attr("transform", e.transform));

		svg.call(zoom);

		// Center the view properly in the container
		const svgBounds = svgRef.getBoundingClientRect();
		const containerWidth = svgBounds.width || 800;
		const containerHeight = svgBounds.height || 600;

		// Use a larger initial scale to show more detail
		const initialScale = 1.6;

		// Center the graph in the viewport with additional offsets to counteract the top-left bias
		// The offsets are calculated as a percentage of the container dimensions
		const translateX =
			containerWidth / 2 - (width * initialScale) / 2 + containerWidth * 0.1; // Add 10% rightward offset
		// Adjust translateY to move graph down even more
		const translateY =
			containerHeight / 2 -
			(height * initialScale) / 2 +
			containerHeight * 0.15; // Add 15% downward offset

		// Apply transform
		svg.call(
			zoom.transform,
			d3.zoomIdentity.translate(translateX, translateY).scale(initialScale),
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
			prop: "#3d8369",
			action: "#584597",
			selected: "#000000",
		};

		// Level visualization
		if (levelInfo.length > 0) {
			// const maxLevel = Math.max(...levelInfo.map((l) => l.level));

			// Draw level backgrounds
			g.append("g")
				.selectAll("rect")
				.data(levelInfo)
				.join("rect")
				.attr("x", (d) => (d.level + 1) * levelSpacing - (levelSpacing - 10) / 2)
				.attr("y", 30) // Start below the labels
				.attr("width", levelSpacing)
				.attr("height", height - 60)
				.attr("fill", (d) => (d.type === "prop" ? "#d5ece3" : "#ddd8ed"))
				.attr("stroke", (d) => (d.type === "prop" ? "#7ec3aa" : "#9788c9"))
				.attr("stroke-width", 1)
				.attr("rx", 5)
				.attr("ry", 5)
				.attr("opacity", 0.3);

			// Add level headers with increased text size
			g.append("g")
				.selectAll("text")
				.data(levelInfo)
				.join("text")
				.attr("x", (d) => (d.level + 1) * levelSpacing)
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.attr("font-size", "26px") // Increased from 12px
				.attr("font-weight", "bold")
				.attr("font-family", "Afacad Flux")
				.attr("fill", (d) => (d.type === "prop" ? "#255040" : "#352a5b"))
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

		// Create nodes with increased size
		const node = g
			.append("g")
			.selectAll("circle")
			.data(nodes)
			.join("circle")
			.attr("r", (d) => (d.type === "action" ? 10 : 8)) // Increased node size
			.attr("fill", (d) => nodeColors[d.type])
			.attr("stroke", "#fff")
			.attr("stroke-width", 2) // Slightly thicker stroke
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
					.attr("r", d.type === "action" ? 12 : 10) // Increased hover size to match new node size
					.attr("stroke", "#38a169");

				// Get SVG bounds for proper positioning
				const svgRect = svgRef.getBoundingClientRect();
				const tooltipWidth = 200;
				const tooltipHeight = 50;

				// Calculate position relative to the SVG element
				// Using offset positions to ensure tooltip stays within the SVG
				const mouseX = event.clientX - svgRect.left;
				const mouseY = event.clientY - svgRect.top;

				// Position tooltip relative to mouse but keep inside SVG bounds
				let x = mouseX + 15;
				let y = mouseY - 15;

				// Ensure tooltip stays within SVG boundaries
				if (x + tooltipWidth > svgRect.width) {
					x = mouseX - tooltipWidth - 15;
				}

				if (y + tooltipHeight > svgRect.height) {
					y = mouseY - tooltipHeight - 15;
				}

				// Keep tooltip from going off the left or top edges
				x = Math.max(10, x);
				y = Math.max(10, y);

				// Show the tooltip with full node information
				setTooltipContent(d.id);
				setTooltipPosition({ x, y });
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
				// Get SVG bounds for proper positioning
				const svgRect = svgRef.getBoundingClientRect();
				const tooltipWidth = 200;
				const tooltipHeight = 50;

				// Calculate position relative to the SVG element
				const mouseX = event.clientX - svgRect.left;
				const mouseY = event.clientY - svgRect.top;

				// Position tooltip relative to mouse but keep inside SVG bounds
				let x = mouseX + 15;
				let y = mouseY - 15;

				// Ensure tooltip stays within SVG boundaries
				if (x + tooltipWidth > svgRect.width) {
					x = mouseX - tooltipWidth - 15;
				}

				if (y + tooltipHeight > svgRect.height) {
					y = mouseY - tooltipHeight - 15;
				}

				// Keep tooltip from going off the left or top edges
				x = Math.max(10, x);
				y = Math.max(10, y);

				setTooltipPosition({ x, y });
			})
			.on("mouseout", function () {
				d3.select(this)
					.attr("r", (d) => (d.type === "action" ? 10 : 8)) // Restore to new larger default size
					.attr("stroke", "#fff");

				// Hide tooltip
				setTooltipVisible(false);

				// Reset highlighting
				link.attr("stroke-opacity", (d) => (d.type === "mutex" ? 0.4 : 0.6));
				node.attr("opacity", 1);
				label.attr("opacity", 1);
			});

		// Create labels with simplified text and improved readability
		const label = g
			.append("g")
			.selectAll("g")
			.data(nodes)
			.join("g")
			.attr("pointer-events", "none");

		// Optional text background for better readability
		label
			.append("rect")
			.attr("fill", "white")
			.attr("opacity", 0.7)
			.attr("rx", 3)
			.attr("ry", 3);

		// Text with significantly increased size for better visibility
		const textElements = label
			.append("text")
			.text((d) => createReadableLabel(d, levelSpacing))
			.attr("font-size", "22px") // Significantly increased for better visibility
			.attr("font-family", "Afacad Flux")
			.attr("font-weight", "500")
			.attr("dx", 14) // Slightly increased distance from node
			.attr("dy", "0.35em")
			.attr("fill", "#333")
			.attr("stroke", "#ffffff") // Add white outline for better readability
			.attr("stroke-width", "0.7px") // Slightly thicker for larger text
			.attr("paint-order", "stroke"); // Draw stroke behind text

		// No background rectangles as user didn't like them

		// Layout calculations - improved spacing
		// const maxLevel = Math.max(...nodes.map((n) => n.level));
		// const levelSpacing = width / (maxLevel + 2); // Leave room on edges

		// Initialize node positions based on levels with improved distribution
		nodes.forEach((node) => {
			// Horizontal position fixed by level
			node.x = (node.level + 1) * levelSpacing;

			// Vertical positions to distribute nodes within levels
			const nodesInSameLevel = nodes.filter((n) => n.level === node.level);
			const levelSize = nodesInSameLevel.length;
			const nodeIndexInLevel = nodesInSameLevel.indexOf(node);

			if (levelSize > 1) {
				// Use more of the available height for better spacing
				const levelHeight = height * 0.8;
				const gap = levelHeight / (levelSize - 1);
				node.y = (height - levelHeight) / 2 + nodeIndexInLevel * gap;
			} else {
				node.y = height / 2;
			}
		});

		// Force simulation with further improved parameters for better spacing
		const simulation = d3
			.forceSimulation(nodes)
			.force(
				"link",
				d3
					.forceLink(links)
					.id((d) => d.id)
					.distance(150), // Increased for better spacing with larger nodes and text
			)
			.force("charge", d3.forceManyBody().strength(-400)) // Even stronger repulsion
			.force("collide", d3.forceCollide().radius(40)) // Much larger collision radius to account for labels
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
			.alphaDecay(0.02); // Slower decay for better stabilization

		// Update positions on each tick with improved constraints
		simulation.on("tick", () => {
			// Constrain x position to maintain level structure
			nodes.forEach((node) => {
				// Fix x position to level with slight jitter for better readability when nodes overlap
				// This creates a small horizontal offset to prevent text overlap
				const jitter = (node.id.length % 3) * 5 - 5; // -5, 0, or 5px offset based on ID length
				node.x = (node.level + 1) * levelSpacing + jitter;

				// Keep y position within bounds with increased padding
				const padding = 60; // Increased padding to prevent cutoff with larger elements
				node.y = Math.max(padding, Math.min(height - padding, node.y));
			});

			link
				.attr("x1", (d) => d.source.x)
				.attr("y1", (d) => d.source.y)
				.attr("x2", (d) => d.target.x)
				.attr("y2", (d) => d.target.y);

			node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

			label.attr("transform", (d) => `translate(${d.x},${d.y})`);
		});
	});

	return (
		<div style="width:100%; height:100%; position: relative;">
			<svg
				ref={svgRef}
				style="width:100%; height:100%; border-radius: 5px; background:#fafafa; overflow: hidden"
			/>

			{/* Tooltip - Absolute positioning relative to SVG container */}
			<div
				ref={tooltipRef}
				style={{
					position: "absolute", // Absolute positioning within parent container
					left: `${tooltipPosition().x}px`,
					top: `${tooltipPosition().y}px`,
					background: "rgba(0, 0, 0, 0.8)",
					color: "white",
					padding: "8px 12px",
					borderRadius: "4px",
					fontSize: "14px", // Larger font size for tooltips
					fontWeight: "500",
					pointerEvents: "none",
					zIndex: 1000,
					opacity: tooltipVisible() ? 1 : 0,
					transition: "opacity 0.2s",
					maxWidth: "200px",
					wordWrap: "break-word",
					boxShadow: "0 2px 8px rgba(0,0,0,0.2)", // Add shadow for better visibility
				}}
			>
				{tooltipContent()}
			</div>

			{/* Legend */}
			<div style="position: absolute; bottom: 10px; left: 10px; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 5px; font-size: 12px; box-shadow: 0 0 5px rgba(0,0,0,0.1);">
				<div style="font-weight: bold; margin-bottom: 5px;">Legend</div>
				<div style="display: flex; align-items: center; margin-bottom: 4px;">
					<div style="width: 12px; height: 12px; border-radius: 50%; background: #3d8369; margin-right: 6px;"></div>
					<span>Proposition</span>
				</div>
				<div style="display: flex; align-items: center; margin-bottom: 4px;">
					<div style="width: 12px; height: 12px; border-radius: 50%; background: #584597; margin-right: 6px;"></div>
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
