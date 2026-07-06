import client from './client';

export interface SearchTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  listId: string;
  assigneeId?: string;
  createdAt: string;
  assignee?: { id: string; name: string; email: string; avatarUrl?: string };
  labels: { id: string; name: string; color: string }[];
  list: {
    id: string;
    name: string;
    board: {
      id: string;
      name: string;
      project: { id: string; name: string };
    };
  };
}

export interface SearchParams {
  q?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueBefore?: string;
  dueAfter?: string;
}

export const searchTasks = async (params: SearchParams): Promise<SearchTask[]> => {
  const query = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
  );
  const { data } = await client.get('/search', { params: query });
  return data.tasks;
};
