"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Clock, Copy, ExternalLink, VideoIcon, CheckCircle } from "lucide-react";
import Button from "@/components/atoms/form/Button";
import useAuth from "@/hooks/useAuth";
import { joinSpaceWaitlist } from "@/lib/actions/spaces/joinSpaceWaitlist";
import { updateSpace } from "@/lib/actions/spaces/updateSpace";
import { getSpaceMeetingToken } from "@/lib/actions/calls/get-space-meeting-token";
import { config } from "@/lib/config/env";

// The Jitsi meeting client (and the external_api.js script it injects) is
// only needed once a live session is actually joined — the mount below is
// gated on meetingActive — so keep it out of the space-page bundle.
const JaasMeetingComponent = dynamic(
  () => import("@/components/organisms/jitsi/JitsiMeeting"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full animate-pulse rounded-xl bg-black/80"
        style={{ height: "75vh", marginTop: "1rem" }}
      />
    ),
  }
);

const normalizeDomain = (domain = "meet.jit.si") =>
  domain.replace(/^https?:\/\//i, "").replace(/\/+$/g, "");

const ensureHttpsUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

export default function JaasMeetingClientButtons({ space }) {
    const { user } = useAuth();
  const isHost = space?.host?._id === user?._id;

  const waitListIds = useMemo(
    () => space?.waitList || space?.waitlist || [],
    [space?.waitList, space?.waitlist]
  );

  const [joinedWaitlist, setJoinedWaitlist] = useState(
    waitListIds.some((id) => id?.toString() === user?._id)
  );
  const [spaceStatus, setSpaceStatus] = useState(space?.status ?? "upcoming");
  const [meetingActive, setMeetingActive] = useState(
    isHost && space?.status === "live"
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const envRequiresJwt = config.jitsiRequireJwt;

  const [meetingToken, setMeetingToken] = useState(null);
  const [requiresJwt, setRequiresJwt] = useState(
    envRequiresJwt ? true : null
  );
  const effectiveRequiresJwt = useMemo(
    () => (requiresJwt === null ? envRequiresJwt : requiresJwt),
    [requiresJwt, envRequiresJwt]
  );
  const [meetingMeta, setMeetingMeta] = useState(() => {
    const domain = config.jitsiDomain;
    const normalizedDomain = normalizeDomain(domain);
    const fallbackRoom =
      space?.meetingRoom || (space?._id ? `deenbridge-space-${space._id}` : "");
    const fallbackUrl = ensureHttpsUrl(
      space?.meetingUrl || `https://${normalizedDomain}/${fallbackRoom}`
    );

    return {
      domain: normalizedDomain,
      roomName: fallbackRoom,
      meetingUrl: fallbackUrl,
    };
  });
  const isEndingRef = useRef(false);

  useEffect(() => {
    setSpaceStatus(space?.status ?? "upcoming");
  }, [space?.status]);

  useEffect(() => {
    setMeetingActive(isHost && space?.status === "live");
  }, [isHost, space?.status]);

  useEffect(() => {
    setJoinedWaitlist(waitListIds.some((id) => id?.toString() === user?._id));
  }, [waitListIds, user?._id]);

  const baseDomain = useMemo(
    () => normalizeDomain(config.jitsiDomain),
    []
  );

  const baseMeetingRoom = useMemo(() => {
    if (space?.meetingRoom) return space.meetingRoom;
    if (!space?._id) return "";
    return `deenbridge-space-${space._id}`;
  }, [space?.meetingRoom, space?._id]);

  const baseMeetingUrl = useMemo(() => {
    if (space?.meetingUrl) return ensureHttpsUrl(space.meetingUrl);
    if (!baseMeetingRoom) return "";
    return `https://${baseDomain}/${baseMeetingRoom}`;
  }, [space?.meetingUrl, baseDomain, baseMeetingRoom]);

  useEffect(() => {
    setMeetingMeta({
      domain: baseDomain,
      roomName: baseMeetingRoom,
      meetingUrl: baseMeetingUrl,
    });
  }, [baseDomain, baseMeetingRoom, baseMeetingUrl]);

  const handleJoinWaitlist = useCallback(async () => {
    if (!user?._id) {
      toast.error("Please sign in to join the waitlist.");
      return;
    }

    try {
        await joinSpaceWaitlist(space._id);
        setJoinedWaitlist(true);
      toast.success("You have been added to the waitlist.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to join waitlist.";
      toast.error(message);
    }
  }, [space._id, user?._id]);

  const handleCopyLink = useCallback(async () => {
    const urlToCopy = meetingMeta.meetingUrl;
    if (!urlToCopy) {
      toast.error("Meeting link is not available yet.");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("Clipboard access is not available in this browser.");
      return;
    }

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(urlToCopy);
      toast.success("Meeting link copied to clipboard.");
    } catch (error) {
      toast.error("Failed to copy meeting link.");
    } finally {
      setIsCopying(false);
    }
  }, [meetingMeta.meetingUrl]);

  const requestMeetingToken = useCallback(
    async ({ silent = false } = {}) => {
      if (tokenLoading) return null;

      setTokenLoading(true);
      try {
        const response = await getSpaceMeetingToken(space._id);

        if (!response?.success) {
          if (!silent) {
            toast.error(
              response?.message || "Unable to prepare the meeting session."
            );
          }
          return null;
        }

        const requiresJwtResponse =
          typeof response.requiresJwt === "boolean"
            ? response.requiresJwt
            : envRequiresJwt;

        setRequiresJwt(requiresJwtResponse);

        if (requiresJwtResponse && !response.token) {
          if (!silent) {
            toast.error(
              response?.message ||
                "Secure meeting token missing. Please try again."
            );
          }
          return null;
        }

        const normalizedDomain = normalizeDomain(
          response.domain || meetingMeta.domain || baseDomain
        );
        const resolvedRoom = response.meetingRoom || meetingMeta.roomName;
        const resolvedUrl = ensureHttpsUrl(
          response.meetingUrl ||
            `https://${normalizedDomain}/${resolvedRoom || ""}`
        );

        setMeetingToken(requiresJwtResponse ? response.token : null);
        const meta = {
          domain: normalizedDomain,
          roomName: resolvedRoom,
          meetingUrl: resolvedUrl,
        };

        setMeetingMeta(meta);

        return {
          ...response,
          ...meta,
          requiresJwt: requiresJwtResponse,
        };
      } catch (error) {
        if (!silent) {
          toast.error("Unable to prepare the meeting session.");
        }
        return null;
      } finally {
        setTokenLoading(false);
      }
    },
    [
      space._id,
      tokenLoading,
      meetingMeta.domain,
      meetingMeta.roomName,
      baseDomain,
      envRequiresJwt,
    ]
  );

  const openMeetingWindow = useCallback(async () => {
    if (spaceStatus !== "live") {
      toast.error("The space is not live yet.");
      return;
    }

    const tokenResponse = await requestMeetingToken({ silent: true });
    if (!tokenResponse) {
      toast.error("Unable to join the meeting. Please try again.");
      return;
    }

    try {
      const url = new URL(ensureHttpsUrl(tokenResponse.meetingUrl));
      if (tokenResponse.requiresJwt && tokenResponse.token) {
        url.searchParams.set("jwt", tokenResponse.token);
      }

      const displayName = user?.name?.trim() || "Guest User";
      const hashParams = [
        `userInfo.displayName=${encodeURIComponent(displayName)}`,
        "config.prejoinPageEnabled=false",
      ];
      url.hash = hashParams.join("&");
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open meeting window:", error);
      toast.error("Unable to open the meeting link.");
    }
  }, [requestMeetingToken, spaceStatus, user?.name]);

  const startMeeting = useCallback(async () => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      if (spaceStatus !== "live") {
        await updateSpace(space._id, { status: "live" });
        setSpaceStatus("live");
      }

      const tokenResponse = await requestMeetingToken({ silent: true });
      if (!tokenResponse) {
        setMeetingActive(false);
        toast.error(
          "Unable to start the live session. Please check the call configuration."
        );
        return;
      }

      setMeetingActive(true);
      toast.success("Space is now live.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to start the live session.";
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [isUpdatingStatus, spaceStatus, space._id, requestMeetingToken]);

  const endMeeting = useCallback(async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    setMeetingActive(false);

    try {
      await updateSpace(space._id, { status: "ended" });
      setSpaceStatus("ended");
      toast.success("Live session has ended.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update space status.";
      toast.error(message);
    } finally {
      isEndingRef.current = false;
    }
  }, [space._id]);

  const handleMeetingClosed = useCallback(() => {
    if (!isHost) return;
    endMeeting();
  }, [endMeeting, isHost]);

  useEffect(() => {
    if (isHost && meetingActive && effectiveRequiresJwt && !meetingToken && !tokenLoading) {
      requestMeetingToken({ silent: true });
    }
  }, [
    isHost,
    meetingActive,
    meetingToken,
    tokenLoading,
    requestMeetingToken,
    effectiveRequiresJwt,
  ]);

  const participantCtas = (
    <>
                <Button
                    wide
                    className="bg-accent hover:bg-highlight text-white font-bold shadow-lg transition"
                    round
        disabled={spaceStatus !== "live" || joinLoading}
        loading={joinLoading}
        onClick={async () => {
          setJoinLoading(true);
          try {
            await openMeetingWindow();
          } finally {
            setJoinLoading(false);
          }
        }}
      >
        <VideoIcon className="w-5 h-5 mr-2" />
        {spaceStatus === "live" ? "Join Live Session" : "Session Not Live Yet"}
                </Button>

            {!joinedWaitlist ? (
        <Button outlined round onClick={handleJoinWaitlist}>
                    <Clock className="w-5 h-5 mr-2" /> Join Waitlist
                </Button>
            ) : (
                <Button outlined round disabled>
          <CheckCircle className="w-5 h-5 mr-2 text-brand-text" /> Waitlist Joined
        </Button>
      )}

      {spaceStatus === "live" && (
        <Button outlined round onClick={handleCopyLink} disabled={isCopying}>
          <Copy className="w-5 h-5 mr-2" />
          {isCopying ? "Copying..." : "Copy Meeting Link"}
                </Button>
            )}
    </>
  );

  const hostControls = (
    <>
      {!meetingActive ? (
        <Button
          wide
          className="bg-accent hover:bg-highlight text-white font-bold shadow-lg transition"
          round
          loading={isUpdatingStatus}
          onClick={startMeeting}
        >
          <VideoIcon className="w-5 h-5 mr-2" />
          {spaceStatus === "live" ? "Reopen Live Session" : "Start Live Session"}
        </Button>
      ) : (
        <div className="flex w-full flex-wrap gap-3">
          <Button
            outlined
            round
            className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
            onClick={endMeeting}
          >
            End Session
          </Button>
          <Button outlined round onClick={openMeetingWindow}>
            <ExternalLink className="w-5 h-5 mr-2" />
            Open in New Window
          </Button>
          <Button outlined round onClick={handleCopyLink} disabled={isCopying}>
            <Copy className="w-5 h-5 mr-2" />
            {isCopying ? "Copying..." : "Copy Meeting Link"}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">Current status:</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            spaceStatus === "live"
              ? "bg-green-100 text-green-700"
              : spaceStatus === "ended"
              ? "bg-gray-200 text-gray-600"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {spaceStatus?.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        {isHost ? hostControls : participantCtas}
      </div>

      {isHost &&
        meetingActive &&
        (effectiveRequiresJwt ? Boolean(meetingToken) : true) && (
        <JaasMeetingComponent
          roomName={meetingMeta.roomName}
          displayName={user?.name || "Host"}
          domain={meetingMeta.domain}
            jwt={effectiveRequiresJwt ? meetingToken : undefined}
            requiresJwt={effectiveRequiresJwt}
          height="75vh"
          onReadyToClose={handleMeetingClosed}
        />
        )}
      {isHost && meetingActive && effectiveRequiresJwt && !meetingToken && (
        <div className="rounded-xl border border-dashed border-accent/40 bg-muted/60 p-6 text-sm text-muted-foreground">
          Preparing secure meeting session...
        </div>
            )}
        </div>
    );
}