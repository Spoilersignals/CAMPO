"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PushNotificationToggle } from "@/components/notifications/push-notification-toggle";
import { getPermissionStatus, isPushSupported } from "@/lib/push-notifications";

export default function NotificationSettingsPage() {
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");

  useEffect(() => {
    if (isPushSupported()) {
      setPermissionStatus(getPermissionStatus());
    } else {
      setPermissionStatus("unsupported");
    }
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "granted":
        return "Enabled";
      case "denied":
        return "Blocked";
      case "default":
        return "Not set";
      case "unsupported":
        return "Not supported";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "granted":
        return "text-green-600";
      case "denied":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Notification Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Permission Status</span>
            <span className={`text-sm font-medium ${getStatusColor(permissionStatus)}`}>
              {getStatusLabel(permissionStatus)}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <PushNotificationToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
