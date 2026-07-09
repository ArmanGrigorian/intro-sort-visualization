"use client";

import { AlgorithmInfo } from "@/components/AlgorithmInfo";
import { ArrayBars } from "@/components/ArrayBars";
import { ControlPanel } from "@/components/ControlPanel";
import { DepthMeter } from "@/components/DepthMeter";
import { Header } from "@/components/Header";
import { HeapTreeView } from "@/components/HeapTreeView";
import { PhaseIndicator } from "@/components/PhaseIndicator";
import { StatsPanel } from "@/components/StatsPanel";
import { Timeline } from "@/components/Timeline";
import { useSortEngine } from "@/hooks/useSortEngine";
import styles from "./page.module.css";

export default function HomePage() {
  const engine = useSortEngine();

  return (
    <div className={styles.layout}>
      <Header />
      <ControlPanel engine={engine} />

      <div className={styles.mainContent}>
        <div className={styles.vizArea}>
          <div className={styles.barsContainer}>
            <ArrayBars engine={engine} />
          </div>
        </div>

        <aside className={styles.sidebar}>
          <PhaseIndicator engine={engine} />
          <DepthMeter engine={engine} />
          <StatsPanel engine={engine} />
          <HeapTreeView engine={engine} />
          <AlgorithmInfo engine={engine} />
        </aside>
      </div>

      <div className={styles.bottomPanel}>
        <Timeline engine={engine} />
      </div>
    </div>
  );
}
