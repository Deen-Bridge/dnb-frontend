import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

const chats = [
    { name: "Zayd", message: "Asalamualaykum brother", unread: true },
    { name: "Gateway to Jannah", message: "The Prophet Rasullah said ...", unread: false },
    { name: "Tahir", message: "Asalamualaykum brother", unread: false },
];

const RecentChats = () => (
    <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-3">Recent Conversations</h3>
        <ul className="space-y-2 text-sm">
            {chats.map((chat, i) => (
                <li key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src="/images/img1.jpeg" alt="Instructor" />
                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-base font-semibold">{chat.name}</span>
                            <span className="text-muted-foreground"> {chat.message}</span>
                        </div>
                    </div>
                    {chat.unread && <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">2</span>}
                </li>
            ))}
        </ul>
    </div>
);

export default RecentChats;
