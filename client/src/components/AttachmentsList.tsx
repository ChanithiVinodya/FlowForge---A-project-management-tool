import * as React from 'react';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as attachmentsApi from '../api/attachments.api';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Paperclip, Upload, Trash2, FileText, Image, File, Download, Loader2 } from 'lucide-react';

interface AttachmentsListProps {
  projectId: string;
  taskId: string;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return <Image size={16} className="text-blue-400" />;
  if (fileType === 'application/pdf') return <FileText size={16} className="text-red-400" />;
  return <File size={16} className="text-gray-400" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({ projectId, taskId }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { data: attachments, isLoading } = useQuery<attachmentsApi.Attachment[]>({
    queryKey: ['attachments', taskId],
    queryFn: () => attachmentsApi.getAttachments(projectId, taskId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      attachmentsApi.uploadAttachment(projectId, taskId, file, setUploadProgress),
    onSuccess: () => { setUploadProgress(null); invalidate(); },
    onError: () => setUploadProgress(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      attachmentsApi.deleteAttachment(projectId, taskId, attachmentId),
    onSuccess: invalidate,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <Paperclip size={16} className="text-primary" />
          {isLoading ? 'Loading...' : `${attachments?.length ?? 0} Attachment${(attachments?.length ?? 0) !== 1 ? 's' : ''}`}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50"
        >
          {uploadMutation.isPending ? (
            <><Loader2 size={14} className="animate-spin" /> {uploadProgress ?? 0}%</>
          ) : (
            <><Upload size={14} /> Attach</>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.txt,.zip,.docx,.xlsx"
        />
      </div>

      {/* Upload progress bar */}
      {uploadProgress !== null && (
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Attachments list */}
      <div className="space-y-2">
        {attachments?.map((attachment: attachmentsApi.Attachment) => (
          <div
            key={attachment.id}
            className="group flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border hover:border-border/60 hover:bg-secondary/50 transition-all"
          >
            <div className="p-2 rounded-lg bg-background border border-border">
              {getFileIcon(attachment.fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.fileName}</p>
              <p className="text-[11px] text-muted-foreground/60">
                {formatBytes(attachment.size)} · {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })} · by {attachment.uploader.name}
              </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={attachment.fileName}
                className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors"
              >
                <Download size={14} />
              </a>
              {attachment.uploader.id === user?.id && (
                <button
                  onClick={() => deleteMutation.mutate(attachment.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
        {attachments?.length === 0 && (
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={24} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground/50">Click to attach a file</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentsList;
