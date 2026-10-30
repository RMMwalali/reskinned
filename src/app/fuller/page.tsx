import type { Metadata } from "next";
import { FullerLook } from "@/components/treatment/FullerLook";
import ui from "@/components/ui.module.css";

export const metadata: Metadata = { title: "Look fuller now — edge.wise" };

export default function FullerPage() {
  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <h1>Look fuller now.</h1>
        <p>Treatment takes months. Volume, a fringe or a colour change can help today.</p>
      </header>
      <FullerLook />
    </div>
  );
}
