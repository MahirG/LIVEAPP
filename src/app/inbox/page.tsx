import { AtSign, Heart, MessageCircle, Radio, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";

const activity = [
  { icon: UserPlus, tone: "bg-[#5d73ff]/15 text-[#8798ff]", initials: "ET", name: "Eden Talks", message: "followed you", time: "2m" },
  { icon: MessageCircle, tone: "bg-[#32b88d]/15 text-[#4ac39d]", initials: "NT", name: "Noah Tesfaye", message: "invited you to co-host a live", time: "18m" },
  { icon: Heart, tone: "bg-[#ff3f63]/15 text-[#ff6d87]", initials: "LB", name: "Liya B.", message: "liked your live replay", time: "1h" },
  { icon: AtSign, tone: "bg-[#d47ede]/15 text-[#d990e1]", initials: "MC", name: "Miki Codes", message: "mentioned you in chat", time: "3h" },
];

export default function InboxPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <Badge className="mb-3 border-[#5d73ff]/25 bg-[#5d73ff]/10 text-[#a7b3ff]"><Radio className="mr-1.5 size-3" /> Your community</Badge>
      <h1 className="text-[32px] font-extrabold tracking-[-.045em] sm:text-[40px]">Inbox</h1>
      <p className="mt-1.5 text-sm text-[#7c828e]">Invitations, activity, and the people who showed up.</p>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-white/[.07] bg-[#101217]">
        <div className="flex h-14 items-center border-b border-white/[.07] px-5">
          <div className="text-sm font-extrabold">Recent activity</div>
          <button className="ml-auto text-[11px] font-bold text-[#8998f6]">Mark all read</button>
        </div>
        {activity.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.name + item.message} className="flex w-full items-center gap-3 border-b border-white/[.055] px-4 py-4 text-left transition last:border-0 hover:bg-white/[.03] sm:px-5">
              <div className="relative">
                <UserAvatar initials={item.initials} className="size-11 bg-gradient-to-br from-[#5c6dd0] to-[#af628b]" />
                <span className={`absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full ring-[3px] ring-[#101217] ${item.tone}`}><Icon className="size-3" /></span>
              </div>
              <div className="min-w-0 flex-1 text-sm leading-5"><span className="font-extrabold">{item.name}</span> <span className="text-[#8c929e]">{item.message}</span></div>
              <span className="text-[10px] font-semibold text-[#646a75]">{item.time}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
