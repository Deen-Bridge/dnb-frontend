// pages/dashboard.jsx
import GreetingCard from "@/components/organisms/dashboard/GreetingCard";
import StatsOverview from "@/components/organisms/dashboard/StatsOverview";
import RecommendedCourses from "@/components/organisms/dashboard/RecommendedCourses";
import UpcomingSessions from "@/components/organisms/dashboard/UpcomingSessions";
import RecentChats from "@/components/organisms/dashboard/RecentChats";
import LearningProgress from "@/components/organisms/dashboard/LearningProgress";
export default function Dashboard() {
  return (
    <div className="p-2 sm:p-6 space-y-6">
      <GreetingCard />
      <StatsOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecommendedCourses />
        </div>
        <div className="space-y-6">
          <UpcomingSessions />
          <RecentChats />
          <LearningProgress />
        </div>
      </div>
    </div>
  );
}
