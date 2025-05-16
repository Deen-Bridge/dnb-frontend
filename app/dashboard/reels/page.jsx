import {
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const reelsData = [
  {
    id: 1,
    username: "Jamiu Yusuf",
    profilePic: "/images/img-4.jpg",
    video: "/videos/dnb-sample.mp4",
    caption:
      "Lorem ipsum dolor sit amet consectetur. Mauris posuere fusce vitae egestas. See more",
    hashtags: "#Adire #Anniversary #dote #dote #dote",
    likes: "23k",
    comments: "1.5k",
  },
];

export default function ReelsPage() {
  return (
    <div className="py-3 flex items-center justify-center bg-white">
      <div className="flex items-center justify-center w-full max-w-5xl gap-6 flex-col md:flex-row relative">
        {reelsData.map((reel) => (
          <div key={reel.id} className="relative flex items-center justify-center">
            {/* Video container */}
            <div className="relative w-full sm:w-[420px] h-[700px] rounded-xl overflow-hidden">
              <video
                src={reel.video}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
              />

              {/* Overlay: User Info + Caption */}
              <div className="absolute bottom-0 left-0 w-full px-4 py-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={reel.profilePic} alt={reel.username} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm truncate">{reel.username}</span>
                  <button className="ml-auto bg-white text-black text-xs px-3 py-1 rounded-full hover:bg-gray-200 transition">
                    Subscribe
                  </button>
                </div>
                <p className="text-sm">{reel.caption}</p>
                <p className="text-xs text-gray-300 mt-1">{reel.hashtags}</p>
              </div>

              {/* Action buttons - inside video on mobile */}
              <div className="absolute right-3 bottom-28 flex-col items-center gap-4 text-white  md:hidden flex">
                <Action icon={<Heart className="h-6 w-6" />} label={reel.likes} />
                <Action icon={<MessageCircle className="h-6 w-6" />} label={reel.comments} />
                <Action icon={<Share2 className="h-6 w-6" />} />
                <Action icon={<ThumbsUp className="h-6 w-6" />} />
              </div>
            </div>

            {/* Action buttons - outside video on right (medium and above) */}
            <div className="hidden md:flex flex-col gap-4 ml-6">
              <Action icon={<Heart className="h-6 w-6" />} label={reel.likes} />
              <Action icon={<MessageCircle className="h-6 w-6" />} label={reel.comments} />
              <Action icon={<Share2 className="h-6 w-6" />} />
              <Action icon={<ThumbsUp className="h-6 w-6" />} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Action({ icon, label }) {
  return (
    <div className="flex flex-col items-center hover:text-secondary transition cursor-pointer">
      <div className="bg-white/10 p-2 rounded-full">
        {icon}
      </div>
      {label && <span className="text-xs mt-1">{label}</span>}
    </div>
  );
}
