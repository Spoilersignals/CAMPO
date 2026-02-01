"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  Bell,
  Info,
  Loader2,
  CheckCircle,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createBroadcast, deactivateBroadcast } from "@/actions/broadcasts";
import { prisma } from "@/lib/prisma";

type Broadcast = {
  id: string;
  title: string;
  content: string;
  priority: string;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  _count: { reads: number };
};

const priorityOptions = [
  { value: "LOW", label: "Low", icon: Info, color: "text-gray-500" },
  { value: "NORMAL", label: "Normal", icon: Megaphone, color: "text-purple-500" },
  { value: "HIGH", label: "High", icon: Bell, color: "text-orange-500" },
  { value: "URGENT", label: "Urgent", icon: AlertTriangle, color: "text-red-500" },
];

export default function AdminBroadcastsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [expiresInHours, setExpiresInHours] = useState<number | undefined>();

  useEffect(() => {
    loadBroadcasts();
  }, []);

  async function loadBroadcasts() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/broadcasts");
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.broadcasts);
      }
    } catch (error) {
      console.error("Error loading broadcasts:", error);
    }
    setIsLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await createBroadcast(title, content, priority, expiresInHours);

    if (result.success) {
      setSuccess("Broadcast created successfully!");
      setShowCreateForm(false);
      setTitle("");
      setContent("");
      setPriority("NORMAL");
      setExpiresInHours(undefined);
      loadBroadcasts();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || "Failed to create broadcast");
    }

    setIsSubmitting(false);
  }

  async function handleDeactivate(broadcastId: string) {
    if (!confirm("Are you sure you want to deactivate this broadcast?")) return;

    const result = await deactivateBroadcast(broadcastId);
    if (result.success) {
      loadBroadcasts();
    } else {
      setError(result.error || "Failed to deactivate");
    }
  }

  const getPriorityIcon = (p: string) => {
    const option = priorityOptions.find((o) => o.value === p);
    const Icon = option?.icon || Megaphone;
    return <Icon className={`h-4 w-4 ${option?.color || "text-gray-500"}`} />;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcasts</h1>
          <p className="text-gray-600">Send announcements to all users</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Broadcast
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Broadcast</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Important Announcement"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your message here..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPriority(option.value)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 border transition-colors ${
                        priority === option.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <option.icon className={`h-4 w-4 ${option.color}`} />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In (hours, optional)
                </label>
                <input
                  type="number"
                  value={expiresInHours || ""}
                  onChange={(e) => setExpiresInHours(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Leave empty for no expiration"
                  min="1"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                  ) : (
                    "Create Broadcast"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcasts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Megaphone className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No broadcasts yet</h3>
          <p className="mt-2 text-gray-500">Create your first broadcast to reach all users.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((broadcast) => (
            <div
              key={broadcast.id}
              className={`rounded-xl border p-5 ${
                broadcast.isActive
                  ? "border-gray-200 bg-white"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getPriorityIcon(broadcast.priority)}
                    <h3 className="font-semibold text-gray-900">{broadcast.title}</h3>
                    {!broadcast.isActive && (
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{broadcast.content}</p>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(broadcast.createdAt), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {broadcast._count.reads} reads
                    </span>
                    {broadcast.expiresAt && (
                      <span className="flex items-center gap-1 text-orange-500">
                        Expires {formatDistanceToNow(new Date(broadcast.expiresAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                {broadcast.isActive && (
                  <button
                    onClick={() => handleDeactivate(broadcast.id)}
                    className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 transition-colors"
                    title="Deactivate"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
