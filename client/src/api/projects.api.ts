import client from './client';

export const getProjects = async () => {
  const response = await client.get('/projects');
  return response.data;
};

export const createProject = async (data: { name: string; description?: string }) => {
  const response = await client.post('/projects', data);
  return response.data;
};

export const getProject = async (projectId: string) => {
  const response = await client.get(`/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (projectId: string, data: any) => {
  const response = await client.patch(`/projects/${projectId}`, data);
  return response.data;
};

export const deleteProject = async (projectId: string) => {
  const response = await client.delete(`/projects/${projectId}`);
  return response.data;
};

export const getBoards = async (projectId: string) => {
  const response = await client.get(`/projects/${projectId}/boards`);
  return response.data;
};

export const createBoard = async (projectId: string, data: { name: string }) => {
  const response = await client.post(`/projects/${projectId}/boards`, data);
  return response.data;
};

export const getBoard = async (projectId: string, boardId: string) => {
  const response = await client.get(`/projects/${projectId}/boards/${boardId}`);
  return response.data;
};
