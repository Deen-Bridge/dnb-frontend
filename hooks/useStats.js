import { useEffect, useState } from "react";
import axiosInstance from "@/lib/config/axios.config";
import useAuth from "./useAuth";

export default function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    booksRead: 0,
    upcomingSessions: 0,
    messagesUnread: 0,
    totalUptime: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?._id) return;

    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get(`/api/users/${user._id}/stats`);
        setStats({
          ...res.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to fetch stats",
        }));
      }
    };

    fetchStats();
  }, [user?._id]);

  return stats;
}
