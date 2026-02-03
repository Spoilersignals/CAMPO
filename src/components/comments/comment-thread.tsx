"use client";

import * as React from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TelegramReactions } from "@/components/reactions/telegram-reactions";

export interface Comment {
  id: string;
  authorName?: string;
  content: string;
  createdAt: Date | string;
  reactions: Array<{ emoji: string; count: number }>;
  userReactions: string[];
  parentId?: string;
  replies?: Comment[];
}

export interface CommentThreadProps {
  contentType: "confession" | "crush" | "spotted" | "poll";
  contentId: string;
  initialComments?: Comment[];
  onAddComment?: (content: string, authorName?: string, parentId?: string) => Promise<void>;
  onToggleReaction?: (commentId: string, emoji: string) => void;
}

interface CommentFormProps {
  onSubmit: (content: string, authorName?: string) => Promise<void>;
  onCancel?: () => void;
  isReply?: boolean;
  placeholder?: string;
}

function CommentForm({
  onSubmit,
  onCancel,
  isReply = false,
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const [content, setContent] = React.useState("");
  const [authorName, setAuthorName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), authorName.trim() || undefined);
      setContent("");
      setAuthorName("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!isReply && (
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={50}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      )}
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          className="min-h-[80px] resize-none pr-16"
        />
        <span
          className={cn(
            "absolute bottom-2 right-2 text-xs",
            remainingChars < 50 ? "text-orange-500" : "text-gray-400",
            remainingChars < 20 && "text-red-500"
          )}
        >
          {remainingChars}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? "Posting..." : isReply ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  onReply?: (parentId: string) => void;
  onToggleReaction?: (commentId: string, emoji: string) => void;
  replyingTo?: string | null;
  onSubmitReply?: (content: string, authorName?: string, parentId?: string) => Promise<void>;
  onCancelReply?: () => void;
}

function CommentItem({
  comment,
  depth = 0,
  onReply,
  onToggleReaction,
  replyingTo,
  onSubmitReply,
  onCancelReply,
}: CommentItemProps) {
  const maxDepth = 2;
  const canReply = depth < maxDepth;
  const isReplying = replyingTo === comment.id;

  return (
    <div className="group">
      <div
        className={cn(
          "relative",
          depth > 0 && "ml-8 border-l-2 border-gray-200 pl-4"
        )}
      >
        {depth > 0 && (
          <div className="absolute -left-[2px] top-4 h-4 w-4 rounded-bl-xl border-b-2 border-l-2 border-gray-200" />
        )}

        <div className="rounded-lg p-3 transition-colors hover:bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-medium text-white">
              {(comment.authorName?.[0] || "A").toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {comment.authorName || "Anonymous"}
                </span>
                <span className="text-sm text-gray-500">·</span>
                <span className="text-sm text-gray-500">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>

              <p className="mt-1 whitespace-pre-wrap break-words text-gray-700">
                {comment.content}
              </p>

              <div className="mt-2 flex items-center gap-4">
                <TelegramReactions
                  reactions={comment.reactions}
                  userReactions={comment.userReactions}
                  onToggleReaction={(emoji) =>
                    onToggleReaction?.(comment.id, emoji)
                  }
                  size="sm"
                />

                {canReply && (
                  <button
                    onClick={() => onReply?.(comment.id)}
                    className="text-sm text-gray-500 transition-colors hover:text-blue-600"
                  >
                    Reply
                  </button>
                )}
              </div>

              {isReplying && onSubmitReply && (
                <div className="mt-3">
                  <CommentForm
                    onSubmit={(content) =>
                      onSubmitReply(content, undefined, comment.id)
                    }
                    onCancel={onCancelReply}
                    isReply
                    placeholder={`Reply to ${comment.authorName || "Anonymous"}...`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-1 space-y-1">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                onReply={onReply}
                onToggleReaction={onToggleReaction}
                replyingTo={replyingTo}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentThread({
  contentType,
  contentId,
  initialComments = [],
  onAddComment,
  onToggleReaction,
}: CommentThreadProps) {
  const [comments, setComments] = React.useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadComments();
  }, [contentType, contentId]);

  async function loadComments() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/comments?type=${contentType}&id=${contentId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddComment = async (
    content: string,
    authorName?: string,
    parentId?: string
  ) => {
    if (onAddComment) {
      await onAddComment(content, authorName, parentId);
      return;
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          content,
          authorName,
          parentId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.comment) {
          if (parentId) {
            setComments((prev) =>
              prev.map((c) => {
                if (c.id === parentId) {
                  return {
                    ...c,
                    replies: [...(c.replies || []), data.comment],
                  };
                }
                return c;
              })
            );
          } else {
            setComments((prev) => [...prev, data.comment]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
    setReplyingTo(null);
  };

  const handleToggleReaction = (commentId: string, emoji: string) => {
    if (onToggleReaction) {
      onToggleReaction(commentId, emoji);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
        <CommentForm
          onSubmit={(content, authorName) =>
            handleAddComment(content, authorName)
          }
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyingTo}
              onToggleReaction={handleToggleReaction}
              replyingTo={replyingTo}
              onSubmitReply={handleAddComment}
              onCancelReply={() => setReplyingTo(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
