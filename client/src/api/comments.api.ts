import client from './client';

export interface Comment {
  id: string;
  taskId: string;
  body: string;
  createdAt: string;
  editedAt?: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export const getComments = async (projectId: string, taskId: string): Promise<Comment[]> => {
  const { data } = await client.get(`/projects/${projectId}/tasks/${taskId}/comments`);
  return data.comments;
};

export const createComment = async (
  projectId: string,
  taskId: string,
  body: string,
): Promise<Comment> => {
  const { data } = await client.post(`/projects/${projectId}/tasks/${taskId}/comments`, { body });
  return data.comment;
};

export const updateComment = async (
  projectId: string,
  taskId: string,
  commentId: string,
  body: string,
): Promise<Comment> => {
  const { data } = await client.patch(
    `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    { body },
  );
  return data.comment;
};

export const deleteComment = async (
  projectId: string,
  taskId: string,
  commentId: string,
): Promise<void> => {
  await client.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
};
