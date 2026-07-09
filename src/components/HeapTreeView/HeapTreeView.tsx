"use client";

import { motion } from "framer-motion";
import type { SortEngine } from "@/hooks/useSortEngine";
import styles from "./HeapTreeView.module.css";
import { useHeapTreeLayout } from "./hooks/useHeapTreeLayout";

interface HeapTreeViewProps {
  engine: SortEngine;
}

export function HeapTreeView({ engine }: HeapTreeViewProps) {
  const { treeData, getNodeColor, getEdgeStyle } = useHeapTreeLayout(engine);

  if (!treeData) {
    return (
      <div className={styles.container}>
        <div className={styles.label}>Heap Structure</div>
        <div className={styles.placeholder}>
          Active only during HeapSort phase
        </div>
      </div>
    );
  }

  const { nodes, edges, svgWidth, svgHeight, nodeRadius } = treeData;

  return (
    <div className={styles.container}>
      <div className={styles.label}>Heap Structure</div>
      <div className={styles.svgContainer}>
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <title>Heap Tree</title>
          {/* Edges */}
          {edges.map((edge) => {
            const edgeStyle = getEdgeStyle(edge);
            return (
              <line
                key={`edge-${edge.from.index}-${edge.to.index}`}
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                stroke={edgeStyle.stroke}
                strokeWidth={edgeStyle.strokeWidth}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const colors = getNodeColor(node);
            return (
              <g key={`node-${node.index}`}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={node.isHighlighted ? 2 : 1}
                  animate={{
                    scale: node.isHighlighted ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize={9}
                  fontFamily="var(--font-sans)"
                  fontWeight={node.isHighlighted ? 600 : 400}
                >
                  {node.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
