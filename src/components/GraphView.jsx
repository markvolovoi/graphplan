import { onMount } from "solid-js";
import * as d3 from "d3";

export function GraphView(props) {
	let svgRef;

	onMount(() => {
		const raw = props.graph ?? props.plan;
		if (!raw) return;

		// Clear any previous graph
		d3.select(svgRef).selectAll("*").remove();

		// Add debugging info to help us see what's happening
		console.log("Building graph with:", {
			graph: props.graph ? true : false,
			plan: props.plan ? true : false,
			propLevels: props.graph?.propLevels?.length,
			actionLevels: props.graph?.actionLevels?.length,
		});

		// build nodes & links
		const nodes = [];
		const links = [];

		if (props.graph) {
			// --- PLANNING GRAPH visualization ---
			const G = props.graph;

			// Add proposition nodes
			G.propLevels.forEach((lev, i) => {
				lev.propositions.forEach((p) =>
					nodes.push({
						id: p.toString(),
						type: "prop",
						level: i,
						original: p, // Keep reference to original object
					}),
				);
			});

			// Add action nodes
			G.actionLevels.forEach((lev, i) => {
				lev.actions.forEach((a) =>
					nodes.push({
						id: a.toString(),
						type: "action",
						level: i * 2 + 1, // Position action levels between prop levels
						original: a, // Keep reference to original object
					}),
				);
			});

			// Create links: preconditions (prop → action)
			G.propLevels.forEach((lev, i) => {
				// Skip the last proposition level since there's no action level after it
				if (i < G.actionLevels.length) {
					lev.propositions.forEach((p) => {
						G.actionLevels[i].actions.forEach((a) => {
							// Check if action has preconditions and if proposition is in them
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

			// Create links: effects (action → next prop)
			G.actionLevels.forEach((lev, i) => {
				lev.actions.forEach((a) => {
					G.propLevels[i + 1].propositions.forEach((p) => {
						// Check if action has effects and if proposition is in them
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

			// Add this debugging check first to see what's happening
			if (nodes.length > 0) {
				console.log(
					"Initial nodes:",
					nodes.slice(0, 5),
					"Total nodes:",
					nodes.length,
				);
			}
			if (links.length > 0) {
				console.log(
					"Initial links:",
					links.slice(0, 5),
					"Total links:",
					links.length,
				);
			}

			// Optional: Add mutex links (visually different)
			// Comment this out for now to simplify the graph and debug
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

		// Setup SVG canvas with better zoom controls
		const width = svgRef.clientWidth || 800;
		const height = svgRef.clientHeight || 600;

		const svg = d3.select(svgRef);
		svg.attr("viewBox", [0, 0, width, height]);

		const g = svg.append("g");

		// Define zoom behavior with better bounds
		const zoom = d3
			.zoom()
			.scaleExtent([0.1, 4])
			.on("zoom", (e) => g.attr("transform", e.transform));

		svg
			.call(zoom)
			.call(
				zoom.transform,
				d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8),
			); // Center and zoom out

		// Define arrow markers for directional links
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

		// Create links with appropriate styling
		const link = g
			.append("g")
			.selectAll("line")
			.data(links)
			.join("line")
			.attr("stroke", (d) => (d.type === "mutex" ? "#e53e3e" : "#999")) // Red for mutex
			.attr("stroke-opacity", (d) => (d.type === "mutex" ? 0.4 : 0.6))
			.attr("stroke-width", (d) => (d.type === "mutex" ? 1 : 1.5))
			.attr("stroke-dasharray", (d) => (d.type === "mutex" ? "3,3" : null)) // Dashed for mutex
			.attr("marker-end", (d) =>
				d.type !== "mutex" ? `url(#arrow-${d.type})` : null,
			);

		// Make sure we have nodes to visualize
		if (nodes.length === 0) {
			// Display error message directly in the SVG
			svg
				.append("text")
				.attr("x", width / 2)
				.attr("y", height / 2)
				.attr("text-anchor", "middle")
				.attr("fill", "red")
				.text("No nodes to display. Check console for errors.");
			console.error("No nodes found to visualize");
			return; // Exit early
		}

		// Create nodes with improved styling and mouse events
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

				// Highlight connected links and nodes
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
			.on("mouseout", function () {
				d3.select(this)
					.attr("r", (d) => (d.type === "action" ? 7 : 6))
					.attr("stroke", "#fff");

				link.attr("stroke-opacity", (d) => (d.type === "mutex" ? 0.4 : 0.6));
				node.attr("opacity", 1);
				label.attr("opacity", 1);
			});

		// Add better positioned and styled labels
		const label = g
			.append("g")
			.selectAll("text")
			.data(nodes)
			.join("text")
			.text((d) => {
				// Truncate long labels to avoid clutter
				const max = 25;
				return d.id.length > max ? d.id.substring(0, max) + "..." : d.id;
			})
			.attr("font-size", "10px")
			.attr("font-family", "sans-serif")
			.attr("dx", 9)
			.attr("dy", "0.35em")
			.attr("pointer-events", "none") // Prevent labels from capturing mouse events
			.attr("fill", "#333");

		// Find max level for scaling
		const maxLevel = Math.max(...nodes.map((n) => n.level));
		const levelSpacing = width / (maxLevel + 2); // Leave room on edges

		// Set initial positions
		nodes.forEach((node) => {
			// Horizontal position based on level
			node.x = (node.level + 1) * levelSpacing;
			// Vertical position with some randomness
			node.y = height / 2 + ((Math.random() - 0.5) * height) / 4;
		});

		// Set up force simulation with better forces
		const simulation = d3
			.forceSimulation(nodes)
			.force(
				"link",
				d3
					.forceLink(links)
					.id((d) => d.id)
					.distance((d) => (d.type === "mutex" ? 150 : 100)),
			) // Longer distances
			.force("charge", d3.forceManyBody().strength(-400)) // Much stronger repulsion
			.force("collide", d3.forceCollide().radius(30)) // Prevent overlap
			// Use x-positioning force based on level
			.force(
				"x",
				d3
					.forceX()
					.x((d) => (d.level + 1) * levelSpacing)
					.strength(0.2),
			)
			.force("y", d3.forceY(height / 2).strength(0.1))
			.alpha(1)
			.alphaDecay(0.02); // Slower decay for better layout

		// Update positions on each tick
		simulation.on("tick", () => {
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
			{/* Add legend */}
			<div style="position: absolute; bottom: 10px; left: 10px; background: rgba(255,255,255,0.8); padding: 5px; border-radius: 5px; font-size: 12px;">
				<div style="display: flex; align-items: center; margin-bottom: 4px;">
					<div style="width: 12px; height: 12px; border-radius: 50%; background: #4299e1; margin-right: 6px;"></div>
					<span>Proposition</span>
				</div>
				<div style="display: flex; align-items: center; margin-bottom: 4px;">
					<div style="width: 12px; height: 12px; border-radius: 50%; background: #ed8936; margin-right: 6px;"></div>
					<span>Action</span>
				</div>
				<div style="display: flex; align-items: center;">
					<div style="width: 20px; height: 2px; background: #e53e3e; margin-right: 6px; opacity: 0.4;"></div>
					<span>Mutex</span>
				</div>
			</div>
		</div>
	);
}
