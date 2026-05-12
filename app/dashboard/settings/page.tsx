"use client";

import { useState } from "react";
import { Save, Bell, Users, Plug, Check, X, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotificationSettings {
  email: {
    enabled: boolean;
    employeeJoining: boolean;
    employeeLeaving: boolean;
    leaveRequests: boolean;
    payroll: boolean;
    performanceReviews: boolean;
  };
  sms: {
    enabled: boolean;
    employeeJoining: boolean;
    leaveRequests: boolean;
    payroll: boolean;
  };
  inApp: {
    enabled: boolean;
    all: boolean;
  };
}

interface RolePermission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  status: "connected" | "disconnected" | "pending";
  lastSync?: string;
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      enabled: true,
      employeeJoining: true,
      employeeLeaving: true,
      leaveRequests: true,
      payroll: false,
      performanceReviews: true,
    },
    sms: {
      enabled: false,
      employeeJoining: false,
      leaveRequests: false,
      payroll: false,
    },
    inApp: {
      enabled: true,
      all: true,
    },
  });

  const [roles, setRoles] = useState<RolePermission[]>([
    { id: "view-employees", name: "View Employees", description: "View employee list and basic details", enabled: true },
    { id: "edit-employees", name: "Edit Employees", description: "Modify employee information", enabled: true },
    { id: "delete-employees", name: "Delete Employees", description: "Remove employees from system", enabled: false },
    { id: "view-payroll", name: "View Payroll", description: "Access payroll information", enabled: false },
    { id: "manage-payroll", name: "Manage Payroll", description: "Process and manage payroll", enabled: false },
    { id: "manage-leave", name: "Manage Leave", description: "Approve or reject leave requests", enabled: true },
    { id: "view-reports", name: "View Reports", description: "Access analytics and reports", enabled: true },
    { id: "manage-users", name: "Manage Users", description: "Add, remove, or modify user accounts", enabled: false },
    { id: "system-settings", name: "System Settings", description: "Access and modify system configuration", enabled: false },
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "zoho-payroll", name: "Zoho Payroll", description: "Sync employee data and process payroll", icon: "💰", connected: false, status: "disconnected" },
    { id: "google-calendar", name: "Google Calendar", description: "Sync events and schedules", icon: "📅", connected: true, status: "connected", lastSync: "2 hours ago" },
    { id: "slack", name: "Slack", description: "Send notifications to Slack channels", icon: "💬", connected: false, status: "disconnected" },
    { id: "microsoft-teams", name: "Microsoft Teams", description: "Team communication and notifications", icon: "👥", connected: false, status: "disconnected" },
    { id: "quickbooks", name: "QuickBooks", description: "Accounting and financial management", icon: "📊", connected: false, status: "disconnected" },
    { id: "workday", name: "Workday", description: "HR and workforce management", icon: "🏢", connected: false, status: "disconnected" },
  ]);

  const [activeTab, setActiveTab] = useState<"notifications" | "roles" | "integrations">("notifications");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleNotificationChange = (category: keyof NotificationSettings, key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleRoleToggle = (roleId: string) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.id === roleId ? { ...role, enabled: !role.enabled } : role
      )
    );
  };

  const handleIntegrationToggle = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              connected: !integration.connected,
              status: !integration.connected ? "pending" : "disconnected",
            }
          : integration
      )
    );
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  };

  const tabs = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "roles", label: "User Roles", icon: Users },
    { id: "integrations", label: "Integrations", icon: Plug },
  ] as const;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your notification preferences, user roles, and system integrations.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={cn(
            "gap-2 min-w-[140px]",
            saveStatus === "saved" && "bg-green-600 hover:bg-green-700"
          )}
        >
          {saveStatus === "saving" ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 shrink-0">
          <Card className="lg:sticky lg:top-8">
            <CardContent className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                    activeTab === tab.id
                      ? "bg-gray-900 dark:bg-zinc-800 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === "notifications" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure which email notifications you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Email Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email.enabled}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("email", "enabled", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Notification Types
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "employeeJoining", label: "New Employee Joining" },
                        { key: "employeeLeaving", label: "Employee Leaving" },
                        { key: "leaveRequests", label: "Leave Requests" },
                        { key: "payroll", label: "Payroll Updates" },
                        { key: "performanceReviews", label: "Performance Reviews" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                          <Label>{item.label}</Label>
                          <Switch
                            checked={notifications.email[item.key as keyof typeof notifications.email] as boolean}
                            onCheckedChange={(checked) =>
                              handleNotificationChange("email", item.key, checked)
                            }
                            disabled={!notifications.email.enabled}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    SMS Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure SMS notifications for critical updates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable SMS Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive critical updates via SMS
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sms.enabled}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("sms", "enabled", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Notification Types
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "employeeJoining", label: "New Employee Joining" },
                        { key: "leaveRequests", label: "Leave Requests" },
                        { key: "payroll", label: "Payroll Alerts" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                          <Label>{item.label}</Label>
                          <Switch
                            checked={notifications.sms[item.key as keyof typeof notifications.sms] as boolean}
                            onCheckedChange={(checked) =>
                              handleNotificationChange("sms", item.key, checked)
                            }
                            disabled={!notifications.sms.enabled}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    In-App Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure in-app notification preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable In-App Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Show notifications within the application
                      </p>
                    </div>
                    <Switch
                      checked={notifications.inApp.enabled}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("inApp", "enabled", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                    <div>
                      <Label>All Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive all types of in-app notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.inApp.all}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("inApp", "all", checked)
                      }
                      disabled={!notifications.inApp.enabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "roles" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Roles & Permissions
                </CardTitle>
                <CardDescription>
                  Configure access levels and permissions for different user roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">A</span>
                      </div>
                      <div>
                        <Label className="text-base font-medium">Administrator</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Full system access</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      Default
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-all",
                          role.enabled
                            ? "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                            : "bg-gray-50 dark:bg-zinc-900/50 border-gray-100 dark:border-zinc-800/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                              role.enabled
                                ? "bg-gray-900 dark:bg-zinc-800 border-gray-900 dark:border-zinc-800"
                                : "border-gray-300 dark:border-zinc-600"
                            )}
                          >
                            {role.enabled && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <Label className="font-medium cursor-pointer" onClick={() => handleRoleToggle(role.id)}>
                              {role.name}
                            </Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                          </div>
                        </div>
                        <Switch checked={role.enabled} onCheckedChange={() => handleRoleToggle(role.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="w-5 h-5" />
                  System Integrations
                </CardTitle>
                <CardDescription>
                  Connect with third-party applications and services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        integration.connected
                          ? "bg-white dark:bg-zinc-900 border-green-200 dark:border-green-900/50"
                          : "bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <Switch
                          checked={integration.connected}
                          onCheckedChange={() => handleIntegrationToggle(integration.id)}
                        />
                      </div>
                      <Label className="font-medium">{integration.name}</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{integration.description}</p>
                      {integration.connected && (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              integration.status === "connected"
                                ? "border-green-500 text-green-600"
                                : "border-yellow-500 text-yellow-600"
                            )}
                          >
                            {integration.status === "connected" ? "Connected" : "Pending"}
                          </Badge>
                          {integration.lastSync && (
                            <span className="text-xs text-gray-400">Last sync: {integration.lastSync}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <Label className="text-blue-800 dark:text-blue-300 font-medium">Need a custom integration?</Label>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Contact our support team to discuss custom integration options for your specific needs.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}