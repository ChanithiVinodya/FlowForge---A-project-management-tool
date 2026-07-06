import client from './client';

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId?: string;
  actorId: string;
  action: string;
  metadata?: any;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  task?: {
    id: string;
    title: string;
  };
}

export const getProjectActivities = async (projectId: string): Promise<ActivityLog[]> => {
  const { data } = await client.get(`/projects/${projectId}/activities`);
  return data.activities;
};
