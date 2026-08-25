"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Users,
  Radio,
  ArrowRightLeft,
  Pause,
  Play,
  Wifi,
  WifiOff,
  Clock,
  TrendingUp,
  Shield,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

const MOCK_USERS = [
  { id: 1, name: "Aisha K.", avatar: "AK", activity: "Viewing Quran Studies", status: "active" },
  { id: 2, name: "Omar M.", avatar: "OM", activity: "Reading Tafsir Book", status: "active" },
  { id: 3, name: "Fatima R.", avatar: "FR", activity: "In Study Room #4", status: "in-room" },
  { id: 4, name: "Yusuf A.", avatar: "YA", activity: "Browsing Courses", status: "active" },
  { id: 5, name: "Khadija B.", avatar: "KB", activity: "Completing Lesson 3", status: "active" },
  { id: 6, name: "Hassan S.", avatar: "HS", activity: "In Study Room #2", status: "in-room" },
  { id: 7, name: "Zainab I.", avatar: "ZI", activity: "Taking Notes", status: "active" },
  { id: 8, name: "Ali J.", avatar: "AJ", activity: "Viewing Arabic Course", status: "active" },
  { id: 9, name: "Maryam T.", avatar: "MT", activity: "In Study Room #1", status: "in-room" },
  { id: 10, name: "Ibrahim H.", avatar: "IH", activity: "Watching Lecture", status: "active" },
];

const MOCK_ROOMS = [
  { id: 1, name: "Quran Memorization Circle", participants: 4, capacity: 8, type: "study" },
  { id: 2, name: "Arabic Grammar Workshop", participants: 3, capacity: 6, type: "workshop" },
  { id: 3, name: "Fiqh Discussion", participants: 2, capacity: 10, type: "discussion" },
  { id: 4, name: "Hadith Study Group", participants: 5, capacity: 8, type: "study" },
];

const MOCK_TRANSACTIONS = [
  { id: 1, type: "course", title: "Quran Studies - Beginner", amount: "$49.99", user: "New User", time: "2 min ago", status: "completed" },
  { id: 2, type: "book", title: "Tafsir Ibn Kathir Vol.1", amount: "$12.99", user: "User #452", time: "5 min ago", status: "completed" },
  { id: 3, type: "course", title: "Arabic Language Basics", amount: "$39.99", user: "User #128", time: "8 min ago", status: "completed" },
  { id: 4, type: "book", title: "Forty Hadith Nawawi", amount: "$8.99", user: "User #789", time: "12 min ago", status: "pending" },
  { id: 5, type: "course", title: "Islamic History 101", amount: "$54.99", user: "User #234", time: "15 min ago", status: "completed" },
  { id: 6, type: "book", title: "Seerah of the Prophet", amount: "$15.99", user: "User #567", time: "18 min ago", status: "completed" },
  { id: 7, type: "course", title: "Fiqh for Beginners", amount: "$44.99", user: "User #321", time: "22 min ago", status: "completed" },
  { id: 8, type: "book", title: "Al-Aqeedah Al-Wasitiyyah", amount: "$11.99", user: "User #654", time: "25 min ago", status: "completed" },
  { id: 9, type: "course", title: "Hadith Sciences Intro", amount: "$59.99", user: "User #876", time: "30 min ago", status: "pending" },
  { id: 10, type: "book", title: "Riyadh As-Saliheen", amount: "$14.99", user: "User #135", time: "35 min ago", status: "completed" },
];

function generateSparklineData(points = 12, min = 20, max = 100) {
  const data = [];
  let value = min + Math.random() * (max - min);
  for (let i = 0; i < points; i++) {
    value = Math.max(min, Math.min(max, value + (Math.random() - 0.5) * 15));
    data.push(Math.round(value));
  }
  return data;
}

function Sparkline({ data, color = "#009900", height = 40, width = 120 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={color}
      />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, sparkData, sparkColor, subtext, pulse }) {
  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className={cn(poppins_500.className, "text-xs uppercase tracking-wider text-muted-foreground")}>
              {label}
            </p>
            <p className={cn(poppins_600.className, "text-3xl text-foreground")}>{value}</p>
            {subtext && (
              <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>{subtext}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10", pulse && "animate-pulse")}>
              <Icon className="h-5 w-5 text-accent" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserRow({ user }) {
  const statusColor = user.status === "in-room" ? "bg-blue-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
      <div className="relative">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/15 text-xs font-semibold text-secondary">
          {user.avatar}
        </div>
        <div className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background", statusColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(poppins_500.className, "text-sm truncate")}>{user.name}</p>
        <p className={cn(poppins_400.className, "text-xs text-muted-foreground truncate")}>{user.activity}</p>
      </div>
      <Badge variant={user.status === "in-room" ? "secondary" : "outline"} className="text-xs shrink-0">
        {user.status === "in-room" ? "In Room" : "Online"}
      </Badge>
    </div>
  );
}

function RoomCard({ room }) {
  const fillPercent = (room.participants / room.capacity) * 100;
  return (
    <div className="rounded-xl border p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-green-500" />
          <span className={cn(poppins_500.className, "text-sm")}>{room.name}</span>
        </div>
        <Badge variant="outline" className="text-xs capitalize">{room.type}</Badge>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
          {room.participants}/{room.capacity} participants
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}

function TransactionRow({ transaction }) {
  const iconMap = {
    course: GraduationCap,
    book: BookOpen,
  };
  const Icon = iconMap[transaction.type] || ArrowRightLeft;
  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10">
        <Icon className="h-4 w-4 text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(poppins_500.className, "text-sm truncate")}>{transaction.title}</p>
        <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
          {transaction.user} · {transaction.time}
        </p>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className={cn(poppins_600.className, "text-sm text-foreground")}>{transaction.amount}</span>
        <Badge
          variant={transaction.status === "completed" ? "default" : "secondary"}
          className={cn(
            "text-xs",
            transaction.status === "completed"
              ? "bg-green-500/10 text-green-700 hover:bg-green-500/20"
              : ""
          )}
        >
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
}

export default function ActivityMonitorPage() {
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [usersData, setUsersData] = useState(MOCK_USERS);
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [onlineCount, setOnlineCount] = useState(47);
  const [activeRoomsCount, setActiveRoomsCount] = useState(4);
  const [hourTxTotal, setHourTxTotal] = useState(128);
  const [txVolume, setTxVolume] = useState("$12,450");
  const [isTabVisible, setIsTabVisible] = useState(true);

  const [usersSpark, setUsersSpark] = useState(() => generateSparklineData());
  const [roomsSpark, setRoomsSpark] = useState(() => generateSparklineData(12, 2, 8));
  const [txSpark, setTxSpark] = useState(() => generateSparklineData(12, 100, 200));
  const [volumeSpark, setVolumeSpark] = useState(() => generateSparklineData(12, 5000, 20000));

  const intervalRef = useRef(null);

  const updateData = useCallback(() => {
    setOnlineCount((prev) => {
      const delta = Math.floor(Math.random() * 7) - 3;
      return Math.max(20, Math.min(80, prev + delta));
    });
    setActiveRoomsCount((prev) => {
      const delta = Math.random() > 0.5 ? 1 : -1;
      return Math.max(2, Math.min(8, prev + delta));
    });
    setHourTxTotal((prev) => prev + Math.floor(Math.random() * 5));
    setLastUpdated(new Date());
    setUsersSpark((prev) => [...prev.slice(1), onlineCount]);
    setRoomsSpark((prev) => [...prev.slice(1), activeRoomsCount]);
    setTxSpark((prev) => [...prev.slice(1), hourTxTotal]);
    setVolumeSpark((prev) => [...prev.slice(1), Math.floor(5000 + Math.random() * 15000)]);
  }, [onlineCount, activeRoomsCount, hourTxTotal]);

  useEffect(() => {
    if (isRefreshing && isTabVisible) {
      intervalRef.current = setInterval(updateData, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRefreshing, isTabVisible, updateData]);

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const toggleRefresh = () => setIsRefreshing((prev) => !prev);

  const txVolumeNum = useMemo(() => {
    return transactions.reduce((sum, t) => sum + parseFloat(t.amount.replace("$", "")), 0);
  }, [transactions]);

  return (
    <PageShell>
      <PageHeader
        icon={Activity}
        title="Activity Monitor"
        subtitle="Real-time view of platform activity and user engagement"
        actions={
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
              isTabVisible && isRefreshing
                ? "border-green-500/30 bg-green-500/10 text-green-700"
                : "border-yellow-500/30 bg-yellow-500/10 text-yellow-700"
            )}>
              {isTabVisible && isRefreshing ? (
                <>
                  <Wifi className="h-3 w-3 animate-pulse" />
                  Live
                </>
              ) : !isTabVisible ? (
                <>
                  <WifiOff className="h-3 w-3" />
                  Tab Hidden
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3" />
                  Paused
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRefresh}
              className="gap-1.5"
            >
              {isRefreshing ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Resume
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Online Now"
          value={onlineCount}
          sparkData={usersSpark}
          sparkColor="#009900"
          subtext="Active in the last 5 min"
          pulse={isRefreshing && isTabVisible}
        />
        <StatCard
          icon={Radio}
          label="Active Rooms"
          value={activeRoomsCount}
          sparkData={roomsSpark}
          sparkColor="#3b82f6"
          subtext="Live study sessions"
        />
        <StatCard
          icon={ArrowRightLeft}
          label="Transactions (1h)"
          value={hourTxTotal}
          sparkData={txSpark}
          sparkColor="#f59e0b"
          subtext="Completed and pending"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue (1h)"
          value={`$${txVolumeNum.toLocaleString()}`}
          sparkData={volumeSpark}
          sparkColor="#8b5cf6"
          subtext="Total transaction volume"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Online Users */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Online Users
            </CardTitle>
            <CardDescription>Currently active on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
              {usersData.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
            <div className="mt-3 flex justify-center">
              <Badge variant="secondary" className="text-xs">
                +{onlineCount - usersData.length} more online
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Active Rooms */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Radio className="h-5 w-5" />
              Active Rooms
            </CardTitle>
            <CardDescription>Live study and discussion sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRightLeft className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Purchases from the last hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span className={cn(poppins_400.className)}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
        <span className={cn(poppins_400.className)}>
          Auto-refresh: {isRefreshing && isTabVisible ? "Every 5s" : "Paused"} · Tab visibility aware
        </span>
      </div>
    </PageShell>
  );
}
