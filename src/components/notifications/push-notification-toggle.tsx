"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  isPushSupported,
  getPermissionStatus,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  getSubscriptionStatus,
} from "@/lib/push-notifications";
import {
  savePushSubscription,
  removePushSubscription,
} from "@/actions/push-notifications";
import { cn } from "@/lib/utils";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supported = isPushSupported();
    setIsSupported(supported);
    setPermission(getPermissionStatus());

    if (supported) {
      getCurrentSubscription().then((sub) => {
        setIsSubscribed(!!sub && getSubscriptionStatus());
      });
    }
  }, []);

  const handleToggle = async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      if (isSubscribed) {
        const subscription = await getCurrentSubscription();
        if (subscription) {
          await removePushSubscription(subscription.endpoint);
        }
        await unsubscribeFromPush();
        setIsSubscribed(false);
      } else {
        if (permission !== "granted") {
          const newPermission = await requestNotificationPermission();
          setPermission(newPermission);
          if (newPermission !== "granted") {
            setIsLoading(false);
            return;
          }
        }

        if (!VAPID_PUBLIC_KEY) {
          console.error("VAPID public key not configured");
          setIsLoading(false);
          return;
        }

        const subscription = await subscribeToPush(VAPID_PUBLIC_KEY);
        if (subscription) {
          const subscriptionJson = subscription.toJSON();
          await savePushSubscription({
            endpoint: subscriptionJson.endpoint!,
            keys: {
              p256dh: subscriptionJson.keys!.p256dh,
              auth: subscriptionJson.keys!.auth,
            },
          });
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error("Failed to toggle push notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-500">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-500">
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">Push Notifications</h3>
        <p className="text-sm text-gray-500">
          {isSubscribed
            ? "You will receive notifications for important updates."
            : "Enable to receive notifications for messages, listings, and more."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isSubscribed}
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isSubscribed ? "bg-blue-600" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            isSubscribed ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
