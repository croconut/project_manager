export const TaskStage = ["To-Do", "Ongoing", "Complete", "Cancelled"] as const;
export type Stage = typeof TaskStage;
