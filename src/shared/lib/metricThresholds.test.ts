import { describe, it, expect } from "vitest";
import { getIssues, METRIC_THRESHOLDS } from "./metricThresholds";
import type { MetricKey } from "../types/run";

describe("getIssues", () => {
  it("returns an empty list when all metrics are good", () => {
    const metrics: Record<MetricKey, number> = {
      lcp: METRIC_THRESHOLDS.lcp.good,
      cls: METRIC_THRESHOLDS.cls.good,
      inp: METRIC_THRESHOLDS.inp.good,
      ttfb: METRIC_THRESHOLDS.ttfb.good,
      pageWeightKb: METRIC_THRESHOLDS.pageWeightKb.good,
    };

    expect(getIssues(metrics)).toEqual([]);
  });

  it("returns warning and critical issues with correct thresholds", () => {
    const metrics: Record<MetricKey, number> = {
      lcp: METRIC_THRESHOLDS.lcp.good + 1,
      cls: METRIC_THRESHOLDS.cls.warning + 1,
      inp: METRIC_THRESHOLDS.inp.good,
      ttfb: METRIC_THRESHOLDS.ttfb.good,
      pageWeightKb: METRIC_THRESHOLDS.pageWeightKb.good,
    };

    const issues = getIssues(metrics);
    expect(issues).toHaveLength(2);

    const lcpIssue = issues.find((issue) => issue.key === "lcp");
    expect(lcpIssue?.level).toBe("warning");
    expect(lcpIssue?.threshold).toBe(METRIC_THRESHOLDS.lcp.good);

    const clsIssue = issues.find((issue) => issue.key === "cls");
    expect(clsIssue?.level).toBe("critical");
    expect(clsIssue?.threshold).toBe(METRIC_THRESHOLDS.cls.warning);
  });
});
