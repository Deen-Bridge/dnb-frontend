import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import Button from "@/components/atoms/form/Button";
const sessions = [
    { name: "Yaoumul Jumuah Rituals.", date: "Jul 21", time: "3:00 PM" },
    { name: "Selected Sunnah of the Prophet", date: "Jul 22", time: "11:00 AM" },
    { name: "Balanced Diet for the Soul", date: "Jul 25", time: "1:00 PM" },
];

const UpcomingSessions = () => (
    <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-3">Upcoming Sessions</h3>
        <ul className="space-y-2 text-sm">
            {sessions.map((s, i) => (
                <li key={i} className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src="/images/img1.jpeg" alt="Instructor" />
                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                        </Avatar>
                        <span className="font-stretch-125% font-medium text-md">{s.name}</span>
                    </div>
                    <div className="flex flex-col items-end text-muted-foreground text-xs ">
                        <span>{s.date} </span>
                        <span>{s.time}</span>
                    </div>

                </li>
            ))}
        </ul>
        <Button wide round className="mt-4 bg-accent text-white  py-2  text-sm font-stretch-125%">View Upcomings</Button>
    </div>
);

export default UpcomingSessions;
