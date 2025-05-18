import React from "react";

const ProfileContent = ({ selectedTab }) => {
    switch (selectedTab) {
        case "courses":
            return <CoursesTab />;
        case "books":
            return <BooksTab />;
        case "saved":
            return <SavedTab />;
        case "achievements":
            return <AchievementsTab />;
        case "followers":
            return <FollowersTab />;
        case "following":
            return <FollowingTab />;
        case "about":
            return <AboutTab />;
        default:
            return <div>Coming soon...</div>;
    }
};

export default ProfileContent;

// Temporary placeholder components
const Placeholder = ({ title }) => (
    <div className="p-6 text-center text-muted-foreground text-lg">
        No {title} yet. Stay tuned!
    </div>
);

const CoursesTab = () => <Placeholder title="courses" />;
const BooksTab = () => <Placeholder title="books" />;
const SavedTab = () => <Placeholder title="saved items" />;
const AchievementsTab = () => <Placeholder title="achievements" />;
const FollowersTab = () => <Placeholder title="followers" />;
const FollowingTab = () => <Placeholder title="following" />;
const AboutTab = () => (
    <div className="p-6 space-y-2 text-base">
        <p>
            <strong>About Ali Jamal:</strong> A passionate learner who loves technology,
            books, and exploring new skills through online platforms.
        </p>
    </div>
);
