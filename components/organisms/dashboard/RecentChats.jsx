import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { roboto_500 } from "@/lib/config/font.config"; 
const chats = [
    { name: "Zayd", message: "Asalamualaykum brother", unread: true,  image: "/images/img-9.jpeg" },
    { name: "Gateway to Jannah", message: "The Prophet Rasullah said ...", unread: false, image: "/images/img-10.jpg" },
    { name: "Tahir", message: "Asalamualaykum brother", unread: true, image: "/images/img-11.jpg" },
];

const RecentChats = () => (
    <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className={cn("text-xl font-semibold mb-3",roboto_500)}>Recent Conversations</h3>
        <ul className="space-y-2 text-sm">
            {chats.map((chat, i) => (
                <li key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src={chat.image} alt="Instructor" />
                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-base font-semibold">{chat.name}</span>
                            <span className="text-muted-foreground"> {chat.message}</span>
                        </div>
                    </div>
                    {chat.unread && <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs">{2 || 4}</span>}
                </li>
            ))}
        </ul>
    </div>
);

export default RecentChats;
