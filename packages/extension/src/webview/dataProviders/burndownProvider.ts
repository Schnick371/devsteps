/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Burndown Chart Data Provider - Sprint progress tracking
 */

import { STATUS } from '@schnick371/devsteps-shared';

export interface BurndownData {
  total: number;
  remaining: number;
  dataPoints: Array<{ date: string; ideal: number; actual: number }>;
}

/**
 * Calculate burndown chart data from tasks
 */
export function getBurndownData(tasks: any[]): BurndownData {
  if (tasks.length === 0) {
    return { total: 0, remaining: 0, dataPoints: [] };
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((i: any) => i.status === STATUS.DONE).length;

  const dataPoints = calculateBurndownPoints(tasks);

  return {
    total: totalTasks,
    remaining: totalTasks - doneTasks,
    dataPoints,
  };
}

function calculateBurndownPoints(
  items: any[]
): Array<{ date: string; ideal: number; actual: number }> {
  if (items.length === 0) {
    return [];
  }

  // Group tasks by completion date
  const tasksByDate: Record<string, number> = {};
  const total = items.length;

  items.forEach((item) => {
    if (item.status === STATUS.DONE && item.updated) {
      const date = new Date(item.updated).toISOString().split('T')[0];
      tasksByDate[date] = (tasksByDate[date] || 0) + 1;
    }
  });

  // Get date range
  const dates = Object.keys(tasksByDate).sort();
  if (dates.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    return [{ date: today, ideal: total, actual: total }];
  }

  const startDate = new Date(dates[0]);
  const endDate = new Date();
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate ideal and actual burndown
  const dataPoints: Array<{ date: string; ideal: number; actual: number }> = [];
  let remaining = total;

  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const ideal = Math.max(0, total - (total / daysDiff) * i);
    const completed = tasksByDate[dateStr] || 0;
    remaining = Math.max(0, remaining - completed);

    dataPoints.push({
      date: dateStr,
      ideal: Math.round(ideal),
      actual: remaining,
    });
  }

  return dataPoints;
}
