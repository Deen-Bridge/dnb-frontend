"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useMemo } from "react";
import {
  Facebook,
  Link as LinkIcon,
  MessageCircle,
  Send,
  Share2,
  Twitter,
  Copy,
} from "lucide-react";

const platformConfig = [
  {
    id: "whatsapp",
    label: "Share via WhatsApp",
    description: "Send to your WhatsApp chats in one tap",
    icon: <MessageCircle className="h-5 w-5" />,
    gradient: "linear-gradient(135deg, #0ba360, #3cba92)",
    buildUrl: (url, description) =>
      `https://wa.me/?text=${encodeURIComponent(`${description}\n${url}`)}`,
  },
  {
    id: "telegram",
    label: "Share via Telegram",
    description: "Broadcast to your Telegram contacts",
    icon: <Send className="h-5 w-5" />,
    gradient: "linear-gradient(135deg, #1d8ef0, #3ea5ff)",
    buildUrl: (url, description) =>
      `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(description)}`,
  },
  {
    id: "twitter",
    label: "Share on X (Twitter)",
    description: "Post a thought-provoking excerpt",
    icon: <Twitter className="h-5 w-5" />,
    gradient: "linear-gradient(135deg, #0f172a, #1e293b)",
    buildUrl: (url, description) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${description}\n`
      )}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "facebook",
    label: "Share on Facebook",
    description: "Reach your community on Facebook",
    icon: <Facebook className="h-5 w-5" />,
    gradient: "linear-gradient(135deg, #1d4ed8, #2563eb)",
    buildUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

const ReelShareDialog = ({ reel, open, onOpenChange, onShared }) => {
  const shareUrl = useMemo(() => {
    if (!reel) return "";
    const url = new URL("/dashboard/reels", window.location.origin);
    url.searchParams.set("focus", reel.id);
    return url.toString();
  }, [reel]);

  const description =
    reel?.description || "Check out this impactful reel on DeenBridge";

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const temp = document.createElement("textarea");
        temp.value = shareUrl;
        temp.setAttribute("readonly", "");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      toast.success("Link copied to clipboard!");
      onShared?.(reel?.id);
      onOpenChange(false);
    } catch (error) {
      toast.error("Unable to copy link");
    }
  };

  const handleShare = (platform) => {
    const config = platformConfig.find((item) => item.id === platform);
    if (!config) return;
    try {
      const url = config.buildUrl(shareUrl, description);
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success(`Opening ${config.label}…`);
      onShared?.(reel?.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to open share target:", error);
      toast.error("Unable to open share option");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-hidden border-none bg-gradient-to-b from-background via-background/80 to-background p-0 shadow-2xl">
        <DialogHeader className="space-y-3 px-6 py-5">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            Share this moment
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Amplify the impact by sharing this reel with your circles.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {platformConfig.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => handleShare(platform.id)}
                className="group overflow-hidden rounded-2xl p-[1px] transition hover:scale-[1.02] focus:outline-none"
                style={{ backgroundImage: platform.gradient }}
              >
                <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-background/95 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-card-foreground shadow">
                      {platform.icon}
                    </span>
                    <span className="text-left text-base font-semibold text-foreground">
                      {platform.label}
                    </span>
                  </div>
                  <p className="mt-3 text-left text-sm text-muted-foreground">
                    {platform.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/60 p-4 shadow-inner">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Share2 className="h-4 w-4 text-accent" />
                Direct link
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-accent/40 text-accent hover:bg-accent/10"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
            <p className="truncate rounded-xl bg-background/70 px-3 py-2 text-xs text-muted-foreground shadow-sm">
              {shareUrl}
            </p>
            <p className="text-xs text-muted-foreground/80">{description}</p>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col items-start gap-3 border-t border-border/60 bg-muted/50 px-6 py-4 text-[11px] text-muted-foreground">
          <p>
            Tip: You can also highlight an excerpt and press <span className="rounded bg-background/70 px-1 py-0.5 font-medium text-foreground">Alt + S</span> to share instantly.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReelShareDialog;

