"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Check, Heart, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { upsertDatingProfile, addDatingPhoto } from "@/actions/dating";

const INTEREST_OPTIONS = [
  "Music", "Movies", "Travel", "Fitness", "Gaming", "Reading", "Photography",
  "Cooking", "Art", "Sports", "Dancing", "Hiking", "Coffee", "Netflix",
  "Foodie", "Tech", "Fashion", "Anime", "K-Pop", "Clubbing", "Studying",
  "Volunteering", "Entrepreneurship", "Politics", "Spirituality"
];

const PROMPT_OPTIONS = [
  "My ideal first date is...",
  "I'm looking for someone who...",
  "Two truths and a lie...",
  "The way to my heart is...",
  "My most controversial opinion is...",
  "I geek out on...",
  "The best way to ask me out is...",
  "My love language is...",
  "I'm convinced that...",
  "A life goal of mine is...",
];

const RELATIONSHIP_GOALS = [
  { id: "RELATIONSHIP", label: "Long-term relationship" },
  { id: "CASUAL", label: "Something casual" },
  { id: "FRIENDS", label: "New friends" },
  { id: "NOT_SURE", label: "Still figuring it out" },
];

export default function DatingProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Step 1: Basic info
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  
  // Step 2: About
  const [bio, setBio] = useState("");
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [faculty, setFaculty] = useState("");
  const [height, setHeight] = useState("");
  
  // Step 3: Interests
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  
  // Step 4: Photos
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Step 5: Prompts
  const [prompt1Question, setPrompt1Question] = useState(PROMPT_OPTIONS[0]);
  const [prompt1Answer, setPrompt1Answer] = useState("");
  const [prompt2Question, setPrompt2Question] = useState(PROMPT_OPTIONS[1]);
  const [prompt2Answer, setPrompt2Answer] = useState("");
  
  // Step 6: Preferences
  const [minAge, setMinAge] = useState("18");
  const [maxAge, setMaxAge] = useState("25");
  const [relationshipGoal, setRelationshipGoal] = useState("");

  const totalSteps = 6;
  
  function toggleInterest(interest: string) {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  }
  
  function addCustomInterest() {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests(prev => [...prev, customInterest.trim()]);
      setCustomInterest("");
    }
  }
  
  function toggleLookingFor(g: string) {
    setLookingFor(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, upload to cloud storage. For now, create a data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setPhotos(prev => [...prev, url]);
    };
    reader.readAsDataURL(file);
  }
  
  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");
    
    try {
      // Create the profile
      const result = await upsertDatingProfile({
        displayName,
        age: parseInt(age),
        gender,
        lookingFor,
        bio: bio || undefined,
        course: course || undefined,
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : undefined,
        faculty: faculty || undefined,
        height: height || undefined,
        interests,
        prompt1Question,
        prompt1Answer: prompt1Answer || undefined,
        prompt2Question,
        prompt2Answer: prompt2Answer || undefined,
        minAge: parseInt(minAge),
        maxAge: parseInt(maxAge),
        relationshipGoal: relationshipGoal || undefined,
      });
      
      if (!result.success) {
        setError(result.error || "Failed to create profile");
        setIsSubmitting(false);
        return;
      }
      
      // Upload photos
      for (let i = 0; i < photos.length; i++) {
        await addDatingPhoto(photos[i], i === 0);
      }
      
      router.push("/dating");
    } catch (err) {
      setError("Something went wrong");
      setIsSubmitting(false);
    }
  }

  function canProceed() {
    switch (step) {
      case 1:
        return displayName.trim() && age && parseInt(age) >= 18 && gender && lookingFor.length > 0;
      case 2:
        return true; // Optional step
      case 3:
        return interests.length >= 3;
      case 4:
        return photos.length >= 1;
      case 5:
        return true; // Optional step
      case 6:
        return true;
      default:
        return true;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
          <p className="text-gray-600">Step {step} of {totalSteps}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < step ? "bg-pink-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Let&apos;s start with the basics</h2>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">First Name</label>
                  <Input
                    placeholder="Your first name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">Age</label>
                  <Input
                    type="number"
                    placeholder="18"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                  {age && parseInt(age) < 18 && (
                    <p className="mt-1 text-sm text-red-500">You must be 18 or older</p>
                  )}
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">I am a...</label>
                  <div className="flex gap-2">
                    {["MALE", "FEMALE", "NON_BINARY"].map((g) => (
                      <Button
                        key={g}
                        type="button"
                        variant={gender === g ? "default" : "outline"}
                        onClick={() => setGender(g)}
                        className={gender === g ? "bg-pink-600 hover:bg-pink-700" : ""}
                      >
                        {g === "MALE" ? "Man" : g === "FEMALE" ? "Woman" : "Non-binary"}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">Show me...</label>
                  <div className="flex gap-2">
                    {["MALE", "FEMALE", "NON_BINARY"].map((g) => (
                      <Button
                        key={g}
                        type="button"
                        variant={lookingFor.includes(g) ? "default" : "outline"}
                        onClick={() => toggleLookingFor(g)}
                        className={lookingFor.includes(g) ? "bg-pink-600 hover:bg-pink-700" : ""}
                      >
                        {g === "MALE" ? "Men" : g === "FEMALE" ? "Women" : "Everyone"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: About */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Tell us about yourself</h2>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">Bio</label>
                  <Textarea
                    placeholder="Write something interesting about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{bio.length}/500</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Course/Major</label>
                    <Input
                      placeholder="e.g., Computer Science"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Year</label>
                    <Input
                      type="number"
                      placeholder="e.g., 2"
                      min={1}
                      max={7}
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Faculty</label>
                    <Input
                      placeholder="e.g., Engineering"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Height</label>
                    <Input
                      placeholder="e.g., 5'10 or 178cm"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">What are you into?</h2>
                  <p className="text-sm text-gray-500">Select at least 3 interests</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={interests.includes(interest) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        interests.includes(interest)
                          ? "bg-pink-600 hover:bg-pink-700"
                          : "hover:bg-pink-50"
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom interest"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                  />
                  <Button type="button" onClick={addCustomInterest} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {interests.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Selected ({interests.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <Badge key={interest} className="bg-pink-600">
                          {interest}
                          <button onClick={() => toggleInterest(interest)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Add your best photos</h2>
                  <p className="text-sm text-gray-500">Add at least 1 photo (up to 6)</p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100"
                    >
                      {photos[idx] ? (
                        <>
                          <img
                            src={photos[idx]}
                            alt={`Photo ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            onClick={() => removePhoto(idx)}
                            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 rounded bg-pink-600 px-2 py-0.5 text-xs text-white">
                              Main
                            </span>
                          )}
                        </>
                      ) : (
                        <label className="flex h-full cursor-pointer flex-col items-center justify-center text-gray-400 hover:bg-gray-200">
                          <Camera className="h-8 w-8" />
                          <span className="mt-1 text-xs">Add</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500">
                  Tip: Photos showing your face clearly get more matches!
                </p>
              </div>
            )}

            {/* Step 5: Prompts */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Add some conversation starters</h2>
                  <p className="text-sm text-gray-500">Help others start a conversation with you</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <select
                      value={prompt1Question}
                      onChange={(e) => setPrompt1Question(e.target.value)}
                      className="mb-2 w-full rounded-md border p-2 text-sm"
                    >
                      {PROMPT_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <Textarea
                      placeholder="Your answer..."
                      value={prompt1Answer}
                      onChange={(e) => setPrompt1Answer(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                  
                  <div>
                    <select
                      value={prompt2Question}
                      onChange={(e) => setPrompt2Question(e.target.value)}
                      className="mb-2 w-full rounded-md border p-2 text-sm"
                    >
                      {PROMPT_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <Textarea
                      placeholder="Your answer..."
                      value={prompt2Answer}
                      onChange={(e) => setPrompt2Answer(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Preferences */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Almost done! Set your preferences</h2>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">Age Range</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={18}
                      max={100}
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      className="w-20"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      min={18}
                      max={100}
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
                      className="w-20"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">What are you looking for?</label>
                  <div className="space-y-2">
                    {RELATIONSHIP_GOALS.map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => setRelationshipGoal(goal.id)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          relationshipGoal === goal.id
                            ? "border-pink-500 bg-pink-50"
                            : "border-gray-200 hover:border-pink-200"
                        }`}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {isSubmitting ? "Creating..." : "Start Matching"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
