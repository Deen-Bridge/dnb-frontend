import { PageShell } from "@/components/ui/page-shell";
import GreetingCard from "@/components/organisms/dashboard/GreetingCard";
import PrayerTimesWidget from "@/components/organisms/dashboard/PrayerTimesWidget";
import StatsOverview from "@/components/organisms/dashboard/StatsOverview";
import RecommendedCourses from "@/components/organisms/dashboard/RecommendedCourses";
import UpcomingSessions from "@/components/organisms/dashboard/UpcomingSessions";
import RecentChats from "@/components/organisms/dashboard/RecentChats";
import LearningProgress from "@/components/organisms/dashboard/LearningProgress";
import OngoingSessions from "@/components/organisms/dashboard/OngoingSessions";
import RecommendedBooks from "@/components/organisms/dashboard/RecommendedBooks";
import SupportPalestine from "@/components/organisms/dashboard/Supports";
// Verification status banner — client component island, renders nothing for
// non-educators and verified educators.
import VerificationBanner from "@/components/organisms/dashboard/VerificationBanner";

export default function Dashboard() {
  return (
    <PageShell>
      {/* Educator verification CTA — status-aware, dismissible, resumable */}
      <VerificationBanner />
      <GreetingCard />
      <PrayerTimesWidget />
      <StatsOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecommendedCourses />
          <RecommendedBooks />
        </div>
        <div className="space-y-6">
          <OngoingSessions />
          <UpcomingSessions />
          <RecentChats />
          <LearningProgress />
          <SupportPalestine />
        </div>
      </div>
    </PageShell>
  );
}
