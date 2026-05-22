import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave a Review | ReviewFlow AI",
  description: "Share your experience with a quick, AI-assisted Google review.",
};

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#0f0f1a] via-[#13132a] to-[#0f0f1a]">
      {children}
    </div>
  );
}
