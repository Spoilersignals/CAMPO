"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Camera, Edit2, Eye, EyeOff, Heart, Plus, Settings, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getMyDatingProfile, upsertDatingProfile, addDatingPhoto, deleteDatingPhoto, toggleProfileVisibility } from "@/actions/dating";

type DatingProfile = {
  id: string;
  displayName: string;
  bio: string | null;
  age: number;
  gender: string;
  lookingFor: string[];
  course: string | null;
  yearOfStudy: number | null;
  faculty: string | null;
  interests: string[];
  height: string | null;
  relationshipGoal: string | null;
  instagramHandle: string | null;
  prompt1Question: string | null;
  prompt1Answer: string | null;
  prompt2Question: string | null;
  prompt2Answer: string | null;
  minAge: number;
  maxAge: number;
  showMe: boolean;
  profileCompleteness: number;
  superLikesRemaining: number;
  photos: { id: string; url: string; isMain: boolean }[];
};

export default function DatingProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DatingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const result = await getMyDatingProfile();
    if (result.success && result.data) {
      setProfile(result.data);
      setEditedBio(result.data.bio || "");
    } else {
      router.push("/dating/profile/setup");
    }
    setIsLoading(false);
  }

  async function handleToggleVisibility() {
    if (!profile) return;
    const result = await toggleProfileVisibility(!profile.showMe);
    if (result.success) {
      setProfile({ ...profile, showMe: !profile.showMe });
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const url = reader.result as string;
      const result = await addDatingPhoto(url, false);
      if (result.success) {
        loadProfile();
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleDeletePhoto(photoId: string) {
    if (!confirm("Delete this photo?")) return;
    await deleteDatingPhoto(photoId);
    loadProfile();
  }

  async function handleSaveBio() {
    if (!profile) return;
    await upsertDatingProfile({
      displayName: profile.displayName,
      age: profile.age,
      gender: profile.gender,
      lookingFor: profile.lookingFor,
      interests: profile.interests,
      bio: editedBio,
      course: profile.course || undefined,
      yearOfStudy: profile.yearOfStudy || undefined,
      minAge: profile.minAge,
      maxAge: profile.maxAge,
    });
    setProfile({ ...profile, bio: editedBio });
    setIsEditing(false);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dating")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/dating/profile/setup")}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Completeness */}
      <Card className="mb-6 bg-gradient-to-r from-pink-50 to-rose-50">
        <CardContent className="py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
            <span className="text-sm font-bold text-pink-600">{profile.profileCompleteness}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-pink-100">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all"
              style={{ width: `${profile.profileCompleteness}%` }}
            />
          </div>
          {profile.profileCompleteness < 80 && (
            <p className="mt-2 text-xs text-gray-500">
              Complete your profile to get more matches!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Visibility Toggle */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {profile.showMe ? (
              <Eye className="h-5 w-5 text-green-500" />
            ) : (
              <EyeOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                {profile.showMe ? "Profile Visible" : "Profile Hidden"}
              </p>
              <p className="text-xs text-gray-500">
                {profile.showMe ? "Others can see you" : "You won't appear in discovery"}
              </p>
            </div>
          </div>
          <Switch checked={profile.showMe} onCheckedChange={handleToggleVisibility} />
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {profile.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                <Image src={photo.url} alt="Profile" fill className="object-cover" />
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
                {photo.isMain && (
                  <span className="absolute bottom-1 left-1 rounded bg-pink-600 px-2 py-0.5 text-xs text-white">
                    Main
                  </span>
                )}
              </div>
            ))}
            {profile.photos.length < 6 && (
              <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-pink-400 hover:text-pink-500">
                <Plus className="h-8 w-8" />
                <span className="mt-1 text-xs">Add Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">About Me</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Write something about yourself..."
                className="min-h-[100px]"
                maxLength={500}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveBio} className="bg-pink-600 hover:bg-pink-700">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{profile.bio || "No bio yet. Add one!"}</p>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">{profile.displayName}, {profile.age}</span>
          </div>
          {profile.course && (
            <div className="flex justify-between">
              <span className="text-gray-500">Studies</span>
              <span className="font-medium">{profile.course}</span>
            </div>
          )}
          {profile.yearOfStudy && (
            <div className="flex justify-between">
              <span className="text-gray-500">Year</span>
              <span className="font-medium">{profile.yearOfStudy}</span>
            </div>
          )}
          {profile.height && (
            <div className="flex justify-between">
              <span className="text-gray-500">Height</span>
              <span className="font-medium">{profile.height}</span>
            </div>
          )}
          {profile.relationshipGoal && (
            <div className="flex justify-between">
              <span className="text-gray-500">Looking for</span>
              <span className="font-medium capitalize">{profile.relationshipGoal.toLowerCase().replace("_", " ")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, idx) => (
              <Badge key={idx} variant="secondary" className="bg-pink-50 text-pink-700">
                {interest}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-center">
            <div>
              <p className="text-2xl font-bold text-pink-600">{profile.superLikesRemaining}</p>
              <p className="text-xs text-gray-500">Super Likes Today</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <p className="text-2xl font-bold text-pink-600">{profile.photos.length}/6</p>
              <p className="text-xs text-gray-500">Photos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
