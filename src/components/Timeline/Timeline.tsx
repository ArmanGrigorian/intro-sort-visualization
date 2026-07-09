"use client";

import type { SortEngine } from "@/hooks/useSortEngine";
import {
  PHASE_BADGE,
  PHASE_LABEL,
  STEP_ICONS,
  useTimelineViewModel,
} from "./hooks/useTimelineViewModel";
import styles from "./Timeline.module.css";

interface TimelineProps {
  engine: SortEngine;
}

export function Timeline({ engine }: TimelineProps) {
  const {
    steps,
    visibleSteps,
    currentStepIndex,
    listRef,
    currentRef,
    handleStepClick,
    getEntryClassName,
  } = useTimelineViewModel(engine);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Execution Timeline</span>
        <span className={styles.count}>{steps.length} operations</span>
      </div>

      <div className={styles.list} ref={listRef}>
        {steps.length === 0 ? (
          <div className={styles.empty}>Run the sort to see the timeline</div>
        ) : (
          visibleSteps.map(({ step, index }) => {
            const isCurrent = index === currentStepIndex;
            return (
              <button
                type="button"
                key={step.id}
                ref={isCurrent ? currentRef : undefined}
                className={getEntryClassName(step, index)}
                onClick={() => handleStepClick(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStepClick(index);
                }}
                tabIndex={0}
              >
                <span className={styles.stepNum}>{index + 1}</span>
                <span className={styles.stepIcon}>{STEP_ICONS[step.type]}</span>
                <span className={styles.stepText}>{step.description}</span>
                <span className={styles[PHASE_BADGE[step.phase]]}>
                  {PHASE_LABEL[step.phase]}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
