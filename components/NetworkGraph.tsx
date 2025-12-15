import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData } from '../types';

interface NetworkGraphProps {
  data: GraphData;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 600;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value || 1));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d: any) => d.val ? Math.sqrt(d.val) * 3 : 5)
      .attr("fill", (d: any) => color(String(d.group)));

    node.append("title")
      .text((d: any) => d.label);
      
    // Add labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d: any) => d.label)
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4)
      .attr("fill", "#334155");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Drag behavior
    const drag = (simulation: any) => {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    node.call(drag(simulation) as any);

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Entity Map (D3)</h3>
      <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-slate-500 justify-center">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1f77b4]"></span>Clients</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff7f0e]"></span>Projects</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2ca02c]"></span>Users</div>
      </div>
    </div>
  );
};

export default NetworkGraph;