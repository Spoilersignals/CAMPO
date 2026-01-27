"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser } from "@/actions/follows";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  size?: "sm" | "md";
}

export function FollowButton({
  userId,
  initialIsFollowing,
  size = "sm",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (isFollowing) {
        const result = await unfollowUser(userId);
        if (!result.error) {
          setIsFollowing(false);
        }
      } else {
        const result = await followUser(userId);
        if (!result.error) {
          setIsFollowing(true);
        }
      }
    });
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className="gap-2"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
