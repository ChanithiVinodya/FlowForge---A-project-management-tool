import client from './client';

export interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: number;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export const getAttachments = async (projectId: string, taskId: string): Promise<Attachment[]> => {
  const { data } = await client.get(`/projects/${projectId}/tasks/${taskId}/attachments`);
  return data.attachments;
};

export const uploadAttachment = async (
  projectId: string,
  taskId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post(
    `/projects/${projectId}/tasks/${taskId}/attachments`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    },
  );
  return data.attachment;
};

export const deleteAttachment = async (
  projectId: string,
  taskId: string,
  attachmentId: string,
): Promise<void> => {
  await client.delete(`/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`);
};
