export function getPerformanceLevel(score) {
  if (score >= 75) {
    return "Good";
  }
  if (score >= 50) {
    return "Average";
  }
  return "Needs Improvement";
}

export function computeAttendancePercentage(attendedClasses, totalClasses) {
  if (!totalClasses || totalClasses <= 0) {
    return 0;
  }
  return Number(((attendedClasses / totalClasses) * 100).toFixed(2));
}

export function computeOverallScore(avgMarks, attendancePercentage) {
  return Number((((avgMarks || 0) + (attendancePercentage || 0)) / 2).toFixed(2));
}
