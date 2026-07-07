export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

export const taskLabelSelect = {
  id: true,
  name: true,
  color: true,
} as const;

export const taskSummarySelect = {
  id: true,
  title: true,
  description: true,
  position: true,
  priority: true,
  status: true,
  dueDate: true,
  listId: true,
  assigneeId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: publicUserSelect },
  labels: { select: taskLabelSelect },
} as const;
