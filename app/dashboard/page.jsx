// pages/dashboard.jsx
import GreetingCard from "@/components/organisms/dashboard/GreetingCard";
import StatsOverview from "@/components/organisms/dashboard/StatsOverview";
import RecommendedCourses from "@/components/organisms/dashboard/RecommendedCourses";
import UpcomingSessions from "@/components/organisms/dashboard/UpcomingSessions";
import RecentChats from "@/components/organisms/dashboard/RecentChats";
import LearningProgress from "@/components/organisms/dashboard/LearningProgress";
import OngoingSessions from "@/components/organisms/dashboard/OngoingSessions";
import RecommendedBooks from "@/components/organisms/dashboard/RecommendedBooks";
import SupportPalestine from "@/components/organisms/dashboard/Supports";
export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <GreetingCard />
      <StatsOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecommendedCourses />
          <RecommendedBooks />
        </div>
        <div className="space-y-6">
          <OngoingSessions/>
          <UpcomingSessions />
          <RecentChats />
          <LearningProgress />
          <SupportPalestine/>
        </div>
      </div>
    </div>
  );
}
