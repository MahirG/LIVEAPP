import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[calc(100vh-64px)] place-items-center px-4 text-center">
      <div><span className="mx-auto grid size-16 place-items-center rounded-[22px] bg-[#5d73ff]/15 text-[#8d9dff]"><Radio className="size-7" /></span><h1 className="mt-5 text-3xl font-extrabold tracking-[-.04em]">This live has ended.</h1><p className="mt-2 text-sm text-[#7d838e]">The moment is gone, but another one is starting now.</p><Link href="/" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#5d73ff] px-5 text-sm font-bold text-white"><ArrowLeft className="size-4" /> Find another live</Link></div>
    </div>
  );
}
