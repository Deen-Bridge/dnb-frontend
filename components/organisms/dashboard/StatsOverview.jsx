const stats = [
    { label: "Courses Enrolled", value: 8 },
    { label: "Upcoming Sessions", value: 2 },
    { label: "Messages Unread", value: 3 },
    { label: "Hours Learned", value: 12 },
];

const StatsOverview = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 space-y-4 text-center shadow-sm">
                <p className="text-sm text-muted-foreground flex justify-start">{stat.label}</p>

                <h3 className="text-2xl font-bold flex justify-start">{stat.value}</h3>
            </div>
        ))}
    </div>
);

export default StatsOverview;
