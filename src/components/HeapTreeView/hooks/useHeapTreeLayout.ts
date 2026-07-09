import { useCallback, useMemo } from "react";
import type { SortEngine } from "@/hooks/useSortEngine";

export interface TreeNode {
  readonly index: number;
  readonly value: number;
  readonly x: number;
  readonly y: number;
  readonly isHighlighted: boolean;
}

export interface TreeEdge {
  readonly from: TreeNode;
  readonly to: TreeNode;
}

export interface TreeData {
  readonly nodes: readonly TreeNode[];
  readonly edges: readonly TreeEdge[];
  readonly svgWidth: number;
  readonly svgHeight: number;
  readonly nodeRadius: number;
}

export interface NodeColors {
  readonly fill: string;
  readonly stroke: string;
  readonly text: string;
}

export interface EdgeStyle {
  readonly stroke: string;
  readonly strokeWidth: number;
}

export interface HeapTreeLayoutViewModel {
  readonly treeData: TreeData | null;
  readonly getNodeColor: (node: TreeNode) => NodeColors;
  readonly getEdgeStyle: (edge: TreeEdge) => EdgeStyle;
}

export function useHeapTreeLayout(engine: SortEngine): HeapTreeLayoutViewModel {
  const {
    currentPhase,
    displayArray,
    activeRange,
    highlightedIndices,
    sortedIndices,
    steps,
    currentStepIndex,
  } = engine;

  const isHeapPhase = currentPhase === "heapsort";

  const treeData = useMemo<TreeData | null>(() => {
    if (!isHeapPhase || !activeRange) return null;

    const [lo, hi] = activeRange;
    const size = hi - lo + 1;
    if (size <= 0) return null;

    const highlightSet = new Set(highlightedIndices);
    const nodes: TreeNode[] = [];
    const edges: TreeEdge[] = [];

    // Calculate tree layout
    const levels = Math.ceil(Math.log2(size + 1));
    const svgWidth = 280;
    const svgHeight = Math.max(120, levels * 44);
    const nodeRadius = 14;

    for (let i = 0; i < size; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const posInLevel = i - (2 ** level - 1);
      const fullCapacity = 2 ** level;
      const levelWidth = svgWidth - 40;
      const spacing = levelWidth / (fullCapacity + 1);

      const node: TreeNode = {
        value: displayArray[lo + i] ?? 0,
        index: lo + i,
        x: 20 + spacing * (posInLevel + 1),
        y: 28 + level * 44,
        isHighlighted: highlightSet.has(lo + i),
      };
      nodes.push(node);
    }

    for (let i = 0; i < size; i++) {
      const leftChild = 2 * i + 1;
      const rightChild = 2 * i + 2;
      const parentNode = nodes[i];
      if (parentNode) {
        const leftNode = nodes[leftChild];
        if (leftChild < size && leftNode) {
          edges.push({ from: parentNode, to: leftNode });
        }
        const rightNode = nodes[rightChild];
        if (rightChild < size && rightNode) {
          edges.push({ from: parentNode, to: rightNode });
        }
      }
    }

    return { nodes, edges, svgWidth, svgHeight, nodeRadius };
  }, [isHeapPhase, activeRange, displayArray, highlightedIndices]);

  const sortedSet = useMemo(() => new Set(sortedIndices), [sortedIndices]);
  const currentStep = steps[currentStepIndex];

  const getNodeColor = useCallback(
    (node: TreeNode): NodeColors => {
      if (sortedSet.has(node.index)) {
        return {
          fill: "rgba(0, 255, 102, 0.25)",
          stroke: "#00ff66",
          text: "#00ff66",
        };
      }
      if (node.isHighlighted) {
        if (currentStep?.type === "compare") {
          return {
            fill: "rgba(0, 229, 255, 0.25)",
            stroke: "#00e5ff",
            text: "#00e5ff",
          };
        }
        if (currentStep?.type === "swap") {
          return {
            fill: "rgba(255, 51, 0, 0.3)",
            stroke: "#ff3300",
            text: "#ff3300",
          };
        }
        return {
          fill: "rgba(255, 183, 0, 0.28)",
          stroke: "#ffb700",
          text: "#ffb700",
        };
      }
      return {
        fill: "rgba(8, 23, 12, 0.9)",
        stroke: "rgba(0, 255, 102, 0.22)",
        text: "rgba(230, 255, 240, 0.75)",
      };
    },
    [sortedSet, currentStep?.type],
  );

  const getEdgeStyle = useCallback(
    (edge: TreeEdge): EdgeStyle => {
      if (edge.from.isHighlighted && edge.to.isHighlighted) {
        let stroke = "#ffb700";
        if (currentStep?.type === "compare") stroke = "#00e5ff";
        else if (currentStep?.type === "swap") stroke = "#ff3300";
        return { stroke, strokeWidth: 2.5 };
      }
      return { stroke: "rgba(0, 255, 102, 0.15)", strokeWidth: 1.5 };
    },
    [currentStep?.type],
  );

  return {
    treeData,
    getNodeColor,
    getEdgeStyle,
  };
}
