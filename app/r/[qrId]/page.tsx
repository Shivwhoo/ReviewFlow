import ReviewFlowClient from "@/components/review/ReviewFlow";

interface ReviewPageProps {
  params: Promise<{ qrId: string }>;
}

export async function generateMetadata({ params }: ReviewPageProps) {
  const { qrId } = await params;
  return {
    title: "Leave a Review | ReviewFlow AI",
    description: "Share your experience with a quick, AI-assisted review.",
    robots: "noindex, nofollow", // Don't index individual QR pages
    openGraph: {
      title: "Leave a Review",
      description: "Share your experience with a quick, AI-assisted review.",
    },
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { qrId } = await params;
  return <ReviewFlowClient qrId={qrId} />;
}
