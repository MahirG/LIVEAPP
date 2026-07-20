import { BarChart3, CalendarClock, Edit3, Eye, Heart, Radio, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

const stats = [
  { label: "Followers", value: "12.4K", icon: Users },
  { label: "Live views", value: "84.2K", icon: Eye },
  { label: "Reactions", value: "31.8K", icon: Heart },
  { label: "Hours live", value: "146", icon: Radio },
];

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[.08] bg-[#11131a] p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_18%_0%,rgba(93,115,255,.32),transparent_33%),radial-gradient(circle_at_85%_0%,rgba(204,88,155,.25),transparent_32%)]" />
        <div className="relative mt-16 flex flex-col gap-5 sm:flex-row sm:items-end">
          <UserAvatar initials="MA" className="size-24 bg-gradient-to-br from-[#6377ff] to-[#a85fd0] text-2xl ring-4 ring-[#11131a]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-extrabold tracking-[-.04em]">Mahir Aman</h1><Badge className="border-[#5d73ff]/25 bg-[#5d73ff]/15 text-[#a9b4ff]">Creator</Badge></div>
            <div className="mt-1 text-sm text-[#7f8590]">@mahir · Addis Ababa, Ethiopia</div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#a0a5af]">Building thoughtful technology, sharing the journey, and learning with people around the world.</p>
          </div>
          <Button variant="secondary"><Edit3 /> Edit profile</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return <div key={stat.label} className="rounded-[20px] border border-white/[.07] bg-[#101217] p-5"><Icon className="size-4 text-[#8798ff]" /><div className="mt-4 text-2xl font-extrabold tracking-[-.03em]">{stat.value}</div><div className="mt-1 text-[11px] text-[#717783]">{stat.label}</div></div>;
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[24px] border border-white/[.07] bg-[#101217] p-5"><div className="flex items-center gap-2 text-sm font-extrabold"><BarChart3 className="size-4 text-[#4ac39d]" /> Audience growth</div><div className="mt-8 flex h-40 items-end gap-2">{[26,34,28,48,43,61,58,72,67,86,78,94].map((height,index)=><span key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-[#5265dd]/55 to-[#7e8eff]" style={{height:`${height}%`}} />)}</div><div className="mt-3 flex justify-between text-[9px] text-[#626874]"><span>12 weeks ago</span><span>This week</span></div></div>
        <div className="rounded-[24px] border border-white/[.07] bg-[#101217] p-5"><div className="flex items-center gap-2 text-sm font-extrabold"><CalendarClock className="size-4 text-[#d990e1]" /> Next scheduled live</div><div className="mt-5 rounded-[18px] border border-white/[.07] bg-white/[.035] p-4"><div className="text-[10px] font-bold uppercase tracking-[.1em] text-[#8798ff]">Tomorrow · 19:30</div><div className="mt-2 text-sm font-extrabold leading-5">Building LIVE from scratch</div><div className="mt-1 text-[11px] text-[#6f7581]">Product & Technology · Public</div></div><Button className="mt-4 w-full" variant="secondary" size="sm">Manage schedule</Button></div>
      </div>
    </div>
  );
}
