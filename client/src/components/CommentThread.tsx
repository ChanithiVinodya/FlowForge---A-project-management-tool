import * as React from 'react';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as commentsApi from '../api/comments.api';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Send, Edit3, Trash2, Check, X, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';

interface CommentThreadProps {
  projectId: string;
  taskId: string;
}

const CommentThread: React.FC<CommentThreadProps> = ({ projectId, taskId }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: comments, isLoading } = useQuery<commentsApi.Comment[]>({
    queryKey: ['comments', taskId],
    queryFn: () => commentsApi.getComments(projectId, taskId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] });

  const createMutation = useMutation({
    mutationFn: (text: string) => commentsApi.createComment(projectId, taskId, text),
    onSuccess: () => { setBody(''); invalidate(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      commentsApi.updateComment(projectId, taskId, commentId, text),
    onSuccess: () => { setEditingId(null); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(projectId, taskId, commentId),
    onSuccess: invalidate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    createMutation.mutate(body.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (body.trim()) createMutation.mutate(body.trim());
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <MessageSquare size={16} className="text-primary" />
        {isLoading ? 'Loading...' : `${comments?.length ?? 0} Comment${(comments?.length ?? 0) !== 1 ? 's' : ''}`}
      </div>

      {/* Comment list */}
      <div className="space-y-4">
        {comments?.map((comment: commentsApi.Comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
              {comment.author.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold">{comment.author.name}</span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    {comment.editedAt && ' · edited'}
                  </span>
                </div>
                {comment.author.id === user?.id && editingId !== comment.id && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(comment.id); setEditBody(comment.body); }}
                      className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(comment.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMutation.mutate({ commentId: comment.id, text: editBody.trim() })}
                      disabled={!editBody.trim() || updateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    >
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {comment.body}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment… (Ctrl+Enter to send)"
            className="w-full px-3.5 py-3 text-sm bg-secondary border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/40"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!body.trim() || createMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Send size={14} />
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentThread;
