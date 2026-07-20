"use client";

import {
  BatteryCharging,
  Camera,
  Captions,
  Check,
  ChevronDown,
  CircleAlert,
  Eye,
  Gauge,
  Lightbulb,
  LoaderCircle,
  Mic,
  Radio,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Video,
  WandSparkles,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CameraStatus = "idle" | "requesting" | "ready" | "blocked";

const topics = ["IRL & Culture", "Design", "Music", "Gaming", "Learning", "Food"];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-[#5d73ff]" : "bg-white/[.12]")}
    >
      <span className={cn("absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-5" : "translate-x-1")} />
    </button>
  );
}

export function CreatorStudio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraError, setCameraError] = useState("");
  const [title, setTitle] = useState("Addis after dark — stories from the city");
  const [topic, setTopic] = useState(topics[0]);
  const [captions, setCaptions] = useState(true);
  const [record, setRecord] = useState(true);
  const [enhance, setEnhance] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    return () => mediaRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    const timeout = window.setTimeout(() => {
      if (countdown <= 1) {
        setIsLive(true);
        setCountdown(null);
        if (streamId) {
          void fetch(`/api/streams/${encodeURIComponent(streamId)}/transition`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "live" }),
          });
        }
      } else {
        setCountdown(countdown - 1);
      }
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [countdown, streamId]);

  async function enableCamera() {
    setCameraStatus("requesting");
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mediaRef.current?.getTracks().forEach((track) => track.stop());
      mediaRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus("ready");
    } catch {
      setCameraStatus("blocked");
      setCameraError("Camera or microphone permission was not granted. Check your browser permissions and try again.");
    }
  }

  async function prepareBroadcast() {
    if (title.trim().length < 3) {
      setBackendMessage("Add a clear title before starting.");
      return;
    }

    setStarting(true);
    setBackendMessage("");
    try {
      const response = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, topic, language: "English" }),
      });
      const result = await response.json() as { mode?: string; stream?: { id?: string }; error?: string };
      if (!response.ok || !result.stream?.id) {
        setBackendMessage(result.error ?? "The broadcast could not be prepared.");
        return;
      }

      setStreamId(result.stream.id);
      setBackendMessage(result.mode === "connected" ? "Secure stream record ready." : "Demo transport ready. Add Supabase settings to persist broadcasts.");
      setCountdown(3);
    } catch {
      setBackendMessage("The broadcast service is temporarily unavailable.");
    } finally {
      setStarting(false);
    }
  }

  async function stopBroadcast() {
    setIsLive(false);
    if (streamId) {
      await fetch(`/api/streams/${encodeURIComponent(streamId)}/transition`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended" }),
      }).catch(() => undefined);
    }
  }

  const checkItems = [
    { icon: Camera, label: "Camera", value: cameraStatus === "ready" ? "1080p · Ready" : cameraStatus === "blocked" ? "Permission blocked" : "Not tested", ready: cameraStatus === "ready" },
    { icon: Mic, label: "Microphone", value: cameraStatus === "ready" ? "Clear signal" : "Not tested", ready: cameraStatus === "ready" },
    { icon: Wifi, label: "Connection", value: "Excellent · 18 Mbps", ready: true },
    { icon: Lightbulb, label: "Lighting", value: cameraStatus === "ready" ? "Looks good" : "Test with camera", ready: cameraStatus === "ready" },
  ];

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge className="mb-3 border-[#5d73ff]/25 bg-[#5d73ff]/10 text-[#a7b3ff]">
            <Video className="mr-1.5 size-3" /> Creator studio
          </Badge>
          <h1 className="text-[30px] font-extrabold tracking-[-.04em] sm:text-[38px]">Ready when you are.</h1>
          <p className="mt-1.5 text-sm text-[#7e8490]">We&apos;ll check everything before your audience arrives.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/[.08] bg-white/[.04] px-3.5 py-2 text-xs font-semibold text-[#a3a8b3]">
          <ShieldCheck className="size-4 text-[#4ac39d]" /> Practice room · only you can see this
        </div>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0">
          <div className="relative aspect-video overflow-hidden rounded-[26px] border border-white/[.09] bg-[#11131a] shadow-[0_30px_90px_rgba(0,0,0,.35)]">
            <video ref={videoRef} muted playsInline className={cn("absolute inset-0 h-full w-full object-cover", cameraStatus !== "ready" && "opacity-0")} />

            {cameraStatus !== "ready" && (
              <div className="absolute inset-0 grid place-items-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(93,115,255,.18),transparent_32%),linear-gradient(145deg,#11141d,#08090d)]" />
                <div className="absolute -left-20 top-1/3 size-72 rounded-full bg-[#5d73ff]/10 blur-3xl" />
                <div className="relative flex max-w-sm flex-col items-center px-6 text-center">
                  <span className="grid size-20 place-items-center rounded-[26px] border border-white/10 bg-white/[.06] text-[#8da0ff] shadow-2xl">
                    <Camera className="size-8" strokeWidth={1.7} />
                  </span>
                  <h2 className="mt-5 text-xl font-extrabold">See yourself before going live</h2>
                  <p className="mt-2 text-sm leading-6 text-[#7f8591]">Your browser will ask for camera and microphone access. Nothing is broadcast yet.</p>
                  <Button className="mt-5" onClick={enableCamera} disabled={cameraStatus === "requesting"}>
                    {cameraStatus === "requesting" ? "Requesting access…" : cameraStatus === "blocked" ? "Try again" : "Enable camera & mic"}
                  </Button>
                  {cameraError && <p className="mt-3 max-w-md text-xs leading-5 text-[#f58b9f]">{cameraError}</p>}
                </div>
              </div>
            )}

            {cameraStatus === "ready" && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  {isLive ? (
                    <Badge className="border-0 bg-[#ff3f63]"><Radio className="mr-1.5 size-3" /> Live preview</Badge>
                  ) : (
                    <Badge className="border-white/15 bg-black/30 text-white/85">Practice preview</Badge>
                  )}
                  <span className="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-bold backdrop-blur-md">1080p · 30 fps</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div>
                    <div className="max-w-xl truncate text-base font-extrabold sm:text-xl">{title || "Untitled live"}</div>
                    <div className="mt-1 text-xs text-white/65">{topic} · English · Public</div>
                  </div>
                  <Button variant="secondary" size="icon" onClick={enableCamera} aria-label="Restart camera"><RotateCcw /></Button>
                </div>
              </>
            )}

            {countdown !== null && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-black/70 backdrop-blur-sm">
                <div className="grid size-32 place-items-center rounded-full border border-white/15 bg-white/[.06] text-6xl font-black shadow-2xl">
                  {countdown}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {checkItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[18px] border border-white/[.07] bg-[#101217] p-4">
                  <div className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-xl bg-white/[.06] text-[#a7adb8]"><Icon className="size-4" /></span>
                    <span className={cn("grid size-5 place-items-center rounded-full", item.ready ? "bg-[#32b88d]/15 text-[#4ad1a4]" : cameraStatus === "blocked" && item.label === "Camera" ? "bg-[#ff3f63]/15 text-[#ff6c86]" : "bg-white/[.06] text-[#626874]")}>
                      {item.ready ? <Check className="size-3" strokeWidth={3} /> : <CircleAlert className="size-3" />}
                    </span>
                  </div>
                  <div className="mt-3 text-xs font-extrabold">{item.label}</div>
                  <div className="mt-0.5 text-[10px] text-[#6f7581]">{item.value}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-[22px] border border-white/[.07] bg-[#101217] p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold"><Gauge className="size-[18px] text-[#4ac39d]" /> Stream health forecast</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[.06]">
              <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#43b995] to-[#77d4b8]" />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#5ed0ac]">Excellent</span>
              <span className="text-[#6f7581]">Estimated audience delay: 2.1 seconds</span>
            </div>
          </div>
        </section>

        <aside className="min-w-0 space-y-5">
          <div className="rounded-[24px] border border-white/[.07] bg-[#101217] p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold"><Settings2 className="size-[18px] text-[#8798ff]" /> Live details</div>

            <label className="mt-5 block text-[11px] font-bold uppercase tracking-[.09em] text-[#747a87]" htmlFor="stream-title">Title</label>
            <div className="mt-2 rounded-[14px] border border-white/[.09] bg-white/[.04] px-3.5 py-3 focus-within:border-[#5d73ff]/65">
              <input
                id="stream-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={90}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-[#555b66]"
                placeholder="What are you going live about?"
              />
              <div className="mt-2 text-right text-[9px] text-[#5f6570]">{title.length}/90</div>
            </div>

            <label className="mt-4 block text-[11px] font-bold uppercase tracking-[.09em] text-[#747a87]" htmlFor="stream-topic">Topic</label>
            <div className="relative mt-2">
              <select
                id="stream-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="h-12 w-full appearance-none rounded-[14px] border border-white/[.09] bg-white/[.04] px-3.5 text-sm font-semibold text-white outline-none focus:border-[#5d73ff]/65"
              >
                {topics.map((item) => <option key={item} value={item} className="bg-[#14161b]">{item}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#737986]" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-[14px] border border-white/[.09] bg-white/[.04] p-3 text-left hover:border-white/15">
                <div className="text-[10px] font-bold text-[#747a87]">Audience</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold"><Eye className="size-3.5" /> Public</div>
              </button>
              <button className="rounded-[14px] border border-white/[.09] bg-white/[.04] p-3 text-left hover:border-white/15">
                <div className="text-[10px] font-bold text-[#747a87]">Language</div>
                <div className="mt-1 text-xs font-bold">English</div>
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/[.07] bg-[#101217] p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold"><WandSparkles className="size-[18px] text-[#d782df]" /> Smart production</div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-white/[.05] text-[#a7adb8]"><Captions className="size-4" /></span>
                <div className="min-w-0 flex-1"><div className="text-xs font-bold">Live captions</div><div className="mt-0.5 text-[10px] text-[#6f7581]">English · translation ready</div></div>
                <Toggle checked={captions} onChange={() => setCaptions((value) => !value)} label="Live captions" />
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-white/[.05] text-[#a7adb8]"><BatteryCharging className="size-4" /></span>
                <div className="min-w-0 flex-1"><div className="text-xs font-bold">Save local master</div><div className="mt-0.5 text-[10px] text-[#6f7581]">High-quality replay backup</div></div>
                <Toggle checked={record} onChange={() => setRecord((value) => !value)} label="Save local master" />
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-white/[.05] text-[#a7adb8]"><Sparkles className="size-4" /></span>
                <div className="min-w-0 flex-1"><div className="text-xs font-bold">Natural enhancement</div><div className="mt-0.5 text-[10px] text-[#6f7581]">Light correction only</div></div>
                <Toggle checked={enhance} onChange={() => setEnhance((value) => !value)} label="Natural enhancement" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#5d73ff]/20 bg-[#151832] p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#5d73ff]/20 text-[#aab5ff]"><Sparkles className="size-4" /></span>
              <div>
                <div className="text-xs font-extrabold">You&apos;re almost ready</div>
                <p className="mt-1 text-[11px] leading-5 text-[#939ab5]">Test the camera, confirm your title, then start. You can end the test broadcast at any time.</p>
              </div>
            </div>
            {isLive ? (
              <Button variant="secondary" size="lg" className="mt-4 w-full border-[#ff3f63]/25 text-[#ff9aad]" onClick={stopBroadcast}>
                <Radio className="text-[#ff3f63]" /> End test broadcast
              </Button>
            ) : (
              <Button variant="live" size="lg" className="mt-4 w-full" onClick={prepareBroadcast} disabled={countdown !== null || starting}>
                {starting ? <LoaderCircle className="animate-spin" /> : <Radio />} Prepare broadcast
              </Button>
            )}
            <div className="mt-3 text-center text-[9px] leading-4 text-[#737b91]" role="status">
              {backendMessage || "Stream lifecycle is persisted when Supabase is connected; video transport remains in safe preview mode."}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
