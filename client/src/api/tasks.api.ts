import client from './client';

export const getTasks = async (projectId: string, listId: string) => {
  const response = await client.get(`/projects/${projectId}/lists/${listId}/tasks`);
  return response.data;
};

export const createTask = async (projectId: string, listId: string, data: any) => {
  const response = await client.post(`/projects/${projectId}/lists/${listId}/tasks`, data);
  return response.data;
};

export const updateTask = async (projectId: string, taskId: string, data: any) => {
  const response = await client.patch(`/projects/${projectId}/tasks/${taskId}`, data);
  return response.data;
};

export const moveTask = async (projectId: string, taskId: string, data: { listId: string; position: number }) => {
  const response = await client.patch(`/projects/${projectId}/tasks/${taskId}/move`, data);
  return response.data;
};

export const deleteTask = async (projectId: string, taskId: string) => {
  const response = await client.delete(`/projects/${projectId}/tasks/${taskId}`);
  return response.data;
};
