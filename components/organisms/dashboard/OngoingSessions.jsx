import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import Button from "@/components/atoms/form/Button";
const sessions = [
    { name: "Zakatul Fitr", date: 8, },
    { name: "Tafseer (Suratul Nab'a)", date: 12 },
    { name: "History of Prophet Yusuf", date: 2},
];

const OngoingSessions = () => (
    <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-3">Ongoing Sessions</h3>
        <ul className="space-y-2 text-sm">
            {sessions.map((s, i) => (
                <li key={i} className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src="/images/mosque.png" alt="Instructor" />
                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                        </Avatar>
                        <span className="font-stretch-125% font-medium text-md">{s.name}</span>
                    </div>
                    <div className="flex items-center justify-center text-muted-foreground text-xs ">
                        <span> Started {s.date}mins ago </span>
              
                    </div>

                </li>
            ))}
        </ul>
        <Button wide round className="mt-4 bg-accent text-white w-full py-2 rounded-full text-sm font-stretch-125%">Join Now</Button>
    </div>
);

export default OngoingSessions;
