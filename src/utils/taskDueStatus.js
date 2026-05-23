/** Classify task due date for list highlighting (due within 48h, overdue). */
export function classifyTaskDue(dueIso, now = new Date()) {
  if (!dueIso) return { section: "upcoming", tone: "gray" };
  const due = new Date(`${String(dueIso).split("T")[0]}T23:59:59`);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  if (due < startOfToday) {
    return { section: "overdue", tone: "red" };
  }
  const in48h = new Date(now);
  in48h.setHours(in48h.getHours() + 48);
  if (due <= in48h) {
    return { section: "due_soon", tone: "amber" };
  }
  return { section: "upcoming", tone: "gray" };
}
