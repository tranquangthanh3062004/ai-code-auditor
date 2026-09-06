import type { SecurityFinding, Scores, Grade } from '../types/audit.js';

export class ScorecardCalculator {
  public calculate(findings: SecurityFinding[]): Scores {
    let securityDeduction = 0;
    let logicDeduction = 0;

    for (const f of findings) {
      if (f.severity === 'CRITICAL') {
        securityDeduction += 35;
        logicDeduction += 15;
      } else if (f.severity === 'HIGH') {
        securityDeduction += 15;
        logicDeduction += 10;
      } else if (f.severity === 'MEDIUM') {
        securityDeduction += 5;
        logicDeduction += 5;
      } else if (f.severity === 'LOW') {
        securityDeduction += 2;
      }
    }

    const security = Math.max(0, Math.min(100, 100 - securityDeduction));
    const businessLogic = Math.max(10, Math.min(100, 95 - logicDeduction));
    const visualStability = Math.max(20, Math.min(100, security < 40 ? 50 : 90));

    // Tính điểm tổng trọng số: Security 40%, Logic 35%, Visual 25%
    const overall = Math.round(security * 0.4 + businessLogic * 0.35 + visualStability * 0.25);

    let grade: Grade = 'F';
    if (overall >= 90) grade = 'A+';
    else if (overall >= 80) grade = 'A';
    else if (overall >= 70) grade = 'B';
    else if (overall >= 50) grade = 'C';
    else grade = 'F';

    return {
      overall,
      security,
      businessLogic,
      visualStability,
      grade,
    };
  }
}
