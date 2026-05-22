/**
 * Build a Google Maps review URL from a Google Place ID.
 * When opened, this URL takes the user directly to the review form.
 */
export function buildGoogleReviewUrl(googlePlaceId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(googlePlaceId)}`;
}
