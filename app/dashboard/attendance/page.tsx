"use client";

import { useState } from "react";
import { 
  Clock, CalendarDays, FileText, MapPin, Coffee, 
  ChevronLeft, ChevronRight, Plus, Check, X, 
  Plane, Thermometer, Heart, Clock3, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  totalHours: number;
  status: "present" | "absent" | "late" | "on-leave";
}

interface TimeOffRequest {
  id: string;
  type: "vacation" | "sick" | "personal" | "other";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
}

const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { date: "2026-05-12", clockIn: "09:02 AM", clockOut: "06:15 PM", totalHours: 9.2, status: "late" },
  { date: "2026-05-11", clockIn: "08:55 AM", clockOut: "06:30 PM", totalHours: 9.6, status: "present" },
  { date: "2026-05-10", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: 9.0, status: "present" },
  { date: "2026-05-09", clockIn: "09:10 AM", clockOut: "06:45 PM", totalHours: 9.6, status: "late" },
  { date: "2026-05-08", clockIn: "09:05 AM", clockOut: "06:20 PM", totalHours: 9.3, status: "late" },
  { date: "2026-05-07", clockIn: null, clockOut: null, totalHours: 0, status: "on-leave" },
  { date: "2026-05-06", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: 9.0, status: "present" },
  { date: "2026-05-05", clockIn: "08:58 AM", clockOut: "06:10 PM", totalHours: 9.2, status: "present" },
  { date: "2026-05-04", clockIn: null, clockOut: null, totalHours: 0, status: "absent" },
  { date: "2026-05-03", clockIn: "09:00 AM", clockOut: "06:00 PM", totalHours: 9.0, status: "present" },
];

const TIME_OFF_REQUESTS: TimeOffRequest[] = [
  { id: "1", type: "vacation", startDate: "2026-06-15", endDate: "2026-06-22", reason: "Family vacation to Europe", status: "pending", appliedOn: "2026-05-10" },
  { id: "2", type: "sick", startDate: "2026-05-07", endDate: "2026-05-07", reason: "Doctor appointment", status: "approved", appliedOn: "2026-05-05" },
  { id: "3", type: "personal", startDate: "2026-04-25", endDate: "2026-04-25", reason: "Personal work", status: "approved", appliedOn: "2026-04-22" },
];

const CALENDAR_DAYS = Array.from({ length: 35 }, (_, i) => {
  const day = i - 3;
  if (day < 1 || day > 31) return null;
  return day;
});

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false);
  const [timeOffType, setTimeOffType] = useState<string>("");
  const [timeOffReason, setTimeOffReason] = useState("");
  const [activeTab, setActiveTab] = useState<"clock" | "history" | "calendar" | "timeoff">("clock");

  const handleClockIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setClockInTime(timeString);
    setIsClockedIn(true);
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
    setClockInTime(null);
  };

  const handleTimeOffSubmit = () => {
    console.log("Time off request submitted:", { type: timeOffType, reason: timeOffReason });
    setShowTimeOffDialog(false);
    setTimeOffType("");
    setTimeOffReason("");
  };

  const tabs = [
    { id: "clock", label: "Clock In/Out", icon: Clock },
    { id: "history", label: "History", icon: History },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "timeoff", label: "Time Off", icon: FileText },
  ] as const;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "late": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "absent": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "on-leave": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTimeOffTypeIcon = (type: string) => {
    switch (type) {
      case "vacation": return <Plane className="w-4 h-4" />;
      case "sick": return <Thermometer className="w-4 h-4" />;
      case "personal": return <Heart className="w-4 h-4" />;
      default: return <Clock3 className="w-4 h-4" />;
    }
  };

  const getTimeOffTypeLabel = (type: string) => {
    switch (type) {
      case "vacation": return "Vacation";
      case "sick": return "Sick Leave";
      case "personal": return "Personal Leave";
      case "other": return "Other";
      default: return type;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your daily attendance, view history, and request time off.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 shrink-0">
          <Card className="lg:sticky lg:top-8">
            <CardContent className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
          {activeTab === "clock" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Today</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Clock In</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {clockInTime || "09:00 AM"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Break</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">1 hr</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-300">Work Mode</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">Office</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="max-w-md mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Clock In / Clock Out</CardTitle>
                  <CardDescription>
                    {isClockedIn 
                      ? `You clocked in at ${clockInTime}` 
                      : "Ready to start your workday"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-40 h-40 mx-auto rounded-full border-4 border-gray-200 dark:border-zinc-700 flex items-center justify-center mb-6 relative">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isClockedIn ? "Working" : "Not Started"}
                      </p>
                    </div>
                  </div>

                  {isClockedIn ? (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleClockOut}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Clock Out
                      </Button>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Worked: ~{Math.floor((new Date().getTime() - new Date().setHours(9, 0, 0, 0)) / 3600000)}h {Math.floor(((new Date().getTime() - new Date().setHours(9, 0, 0, 0)) % 3600000) / 60000)}m
                      </p>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleClockIn}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Clock In
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Attendance History
                </CardTitle>
                <CardDescription>
                  View your past clock-ins and clock-outs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-800">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Clock In</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Clock Out</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Total Hours</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ATTENDANCE_RECORDS.map((record, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                            {new Date(record.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{record.clockIn || "-"}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{record.clockOut || "-"}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{record.totalHours ? `${record.totalHours}h` : "-"}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(record.status)}>
                              {record.status === "present" ? "Present" : 
                               record.status === "late" ? "Late" :
                               record.status === "absent" ? "Absent" : "On Leave"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "calendar" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Attendance Calendar
                  </CardTitle>
                  <CardDescription>
                    Visual overview of your attendance and time off.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium px-3">May 2026</span>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {CALENDAR_DAYS.map((day, index) => {
                    const isToday = day === 12;
                    const hasRecord = day && [1, 2, 3, 5, 6, 8, 9, 10, 11].includes(day);
                    const isLeave = day === 7;
                    const isAbsent = day === 4;
                    const hasTimeOff = day === 15 || day === 16 || day === 17 || day === 18 || day === 19 || day === 20 || day === 21 || day === 22;
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "aspect-square flex flex-col items-center justify-center text-sm rounded-lg relative",
                          day ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800" : "",
                          isToday && "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                        )}
                      >
                        {day && (
                          <>
                            <span className={cn(
                              isToday ? "text-white dark:text-gray-900" : "text-gray-700 dark:text-gray-300"
                            )}>{day}</span>
                            {isLeave && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 absolute bottom-1" />
                            )}
                            {isAbsent && (
                              <div className="w-2 h-2 rounded-full bg-red-500 absolute bottom-1" />
                            )}
                            {hasTimeOff && (
                              <div className="w-2 h-2 rounded-full bg-purple-500 absolute bottom-1" />
                            )}
                            {hasRecord && !isLeave && !isAbsent && !hasTimeOff && (
                              <div className="w-2 h-2 rounded-full bg-green-500 absolute bottom-1" />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">On Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Time Off Requested</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "timeoff" && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Time Off Requests
                    </CardTitle>
                    <CardDescription>
                      Submit and track your time off requests.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowTimeOffDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Request
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {TIME_OFF_REQUESTS.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            request.type === "vacation" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                            request.type === "sick" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                            "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                          )}>
                            {getTimeOffTypeIcon(request.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Label className="font-medium">{getTimeOffTypeLabel(request.type)}</Label>
                              <Badge className={cn(
                                request.status === "approved" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                request.status === "pending" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                request.status === "rejected" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              )}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(request.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(request.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{request.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 dark:text-gray-500">Applied on</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(request.appliedOn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leave Balance</CardTitle>
                  <CardDescription>Your available leave days for this year.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { type: "Vacation", total: 15, used: 5, available: 10, color: "bg-blue-500" },
                      { type: "Sick Leave", total: 10, used: 2, available: 8, color: "bg-red-500" },
                      { type: "Personal", total: 5, used: 1, available: 4, color: "bg-purple-500" },
                      { type: "Comp Off", total: 3, used: 0, available: 3, color: "bg-green-500" },
                    ].map((leave) => (
                      <div key={leave.type} className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{leave.type}</span>
                          <div className={cn("w-3 h-3 rounded-full", leave.color)} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{leave.available}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{leave.used} used / {leave.total} total</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog open={showTimeOffDialog} onOpenChange={setShowTimeOffDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={timeOffType} onValueChange={setTimeOffType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea 
                placeholder="Provide a reason for your time off request..." 
                value={timeOffReason}
                onChange={(e) => setTimeOffReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeOffDialog(false)}>Cancel</Button>
            <Button onClick={handleTimeOffSubmit} className="gap-2">
              <Check className="w-4 h-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}