/**
 * CAC Target and Alert System
 * Monitor CAC against targets and generate alerts
 */

import type { CACResult } from './types';

/**
 * CAC Target configuration
 */
export interface CACTarget {
  /** Target CAC value in dollars */
  targetCAC: number;
  /** Warning threshold as percentage above target (e.g., 0.1 = 10% above) */
  warningThreshold: number;
  /** Critical threshold as percentage above target (e.g., 0.25 = 25% above) */
  criticalThreshold: number;
  /** Optional channel-specific targets */
  channelTargets?: Record<string, number>;
}

/**
 * CAC Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * CAC Alert structure
 */
export interface CACAlert {
  /** Alert unique ID */
  id: string;
  /** Channel ID (or 'blended' for overall) */
  channelId: string;
  /** Period when alert triggered */
  period: string;
  /** Severity level */
  severity: AlertSeverity;
  /** Alert message */
  message: string;
  /** Current CAC value */
  currentCAC: number;
  /** Target CAC value */
  targetCAC: number;
  /** Percentage over target */
  percentOverTarget: number;
  /** Timestamp when alert was generated */
  timestamp: Date;
}

/**
 * Default CAC targets for B2B SaaS
 */
export const defaultCACTarget: CACTarget = {
  targetCAC: 100,
  warningThreshold: 0.15, // 15% above target
  criticalThreshold: 0.30, // 30% above target
  channelTargets: {
    'paid-search': 120,
    'paid-social': 150,
    'display': 180,
    'email': 50,
    'seo': 30,
    'events': 200,
    'direct-sales': 250,
    'partnerships': 100,
    'athlete-endorsements': 300,
    'coach-ambassadors': 200,
    'social-influencers': 180,
    'blog': 40,
    'video': 80,
    'podcast': 100,
    'webinars': 90,
  },
};

/**
 * Generate unique alert ID
 */
function generateAlertId(channelId: string, period: string): string {
  return `cac-alert-${channelId}-${period}-${Date.now()}`;
}

/**
 * Determine alert severity based on CAC vs target
 */
export function determineAlertSeverity(
  currentCAC: number,
  targetCAC: number,
  target: CACTarget
): AlertSeverity | null {
  if (targetCAC <= 0) return null;
  
  const percentOver = (currentCAC - targetCAC) / targetCAC;
  
  if (percentOver >= target.criticalThreshold) {
    return 'critical';
  }
  if (percentOver >= target.warningThreshold) {
    return 'warning';
  }
  if (percentOver > 0) {
    return 'info';
  }
  
  return null; // No alert needed - under target
}

/**
 * Check CAC against target and generate alert if needed
 */
export function checkCACTarget(
  cacResult: CACResult,
  target: CACTarget = defaultCACTarget
): CACAlert | null {
  // Determine target - use channel-specific if available
  const targetCAC = target.channelTargets?.[cacResult.channelId] ?? target.targetCAC;
  
  // Skip if no customers (CAC is 0)
  if (cacResult.cac <= 0) {
    return null;
  }
  
  const severity = determineAlertSeverity(cacResult.cac, targetCAC, target);
  
  if (!severity) {
    return null; // CAC is under target
  }
  
  const percentOverTarget = ((cacResult.cac - targetCAC) / targetCAC) * 100;
  
  const messages: Record<AlertSeverity, string> = {
    info: `CAC for ${cacResult.channelId} is slightly above target`,
    warning: `CAC for ${cacResult.channelId} exceeds target by ${percentOverTarget.toFixed(1)}%`,
    critical: `CRITICAL: CAC for ${cacResult.channelId} is ${percentOverTarget.toFixed(1)}% over target!`,
  };
  
  return {
    id: generateAlertId(cacResult.channelId, cacResult.period),
    channelId: cacResult.channelId,
    period: cacResult.period,
    severity,
    message: messages[severity],
    currentCAC: cacResult.cac,
    targetCAC,
    percentOverTarget,
    timestamp: new Date(),
  };
}

/**
 * Check multiple CAC results and generate alerts
 */
export function checkCACTargets(
  cacResults: CACResult[],
  target: CACTarget = defaultCACTarget
): CACAlert[] {
  const alerts: CACAlert[] = [];
  
  for (const result of cacResults) {
    const alert = checkCACTarget(result, target);
    if (alert) {
      alerts.push(alert);
    }
  }
  
  // Sort by severity (critical first, then warning, then info)
  const severityOrder: Record<AlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Check blended CAC against target
 */
export function checkBlendedCACTarget(
  cacResult: CACResult,
  target: CACTarget = defaultCACTarget
): CACAlert | null {
  if (cacResult.channelId !== 'blended') {
    throw new Error('Expected blended CAC result');
  }
  
  return checkCACTarget(cacResult, { ...target, channelTargets: undefined });
}

/**
 * Get CAC status relative to target
 */
export function getCACStatus(
  cac: number,
  targetCAC: number
): 'under' | 'at' | 'over' | 'critical' {
  const ratio = cac / targetCAC;
  
  if (ratio <= 0.95) return 'under';
  if (ratio <= 1.05) return 'at';
  if (ratio <= 1.30) return 'over';
  return 'critical';
}

/**
 * Calculate CAC efficiency score (0-100)
 * 100 = excellent (CAC well under target)
 * 0 = poor (CAC significantly over target)
 */
export function calculateCACEfficiency(
  cac: number,
  targetCAC: number
): number {
  if (targetCAC <= 0) return 0;
  if (cac <= 0) return 100; // No spend = perfect efficiency (but may indicate no activity)
  
  const ratio = cac / targetCAC;
  
  // Score calculation: 100 at 50% of target, 50 at target, 0 at 150% of target
  const score = Math.max(0, Math.min(100, 100 - (ratio - 0.5) * 100));
  
  return Math.round(score);
}

/**
 * Get recommended action based on CAC status
 */
export function getCACRecommendation(
  cac: number,
  targetCAC: number,
  channelId: string
): string {
  const status = getCACStatus(cac, targetCAC);
  
  const recommendations: Record<typeof status, string> = {
    under: `${channelId} is performing well. Consider scaling spend if ROAS remains healthy.`,
    at: `${channelId} is at target. Monitor closely and optimize for efficiency.`,
    over: `${channelId} is above target. Review ad creatives, targeting, and landing pages.`,
    critical: `${channelId} requires immediate attention. Consider pausing or significantly restructuring.`,
  };
  
  return recommendations[status];
}
