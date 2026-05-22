import QRCodeLib from "qrcode";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Generate a QR code image as a Data URL (base64 PNG).
 */
export async function generateQRDataURL(qrId: string): Promise<string> {
  const url = `${APP_URL}/r/${qrId}`;
  return QRCodeLib.toDataURL(url, {
    type: "image/png",
    width: 400,
    margin: 2,
    color: {
      dark: "#1a1a2e",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate a QR code image as an SVG string.
 */
export async function generateQRSVG(qrId: string): Promise<string> {
  const url = `${APP_URL}/r/${qrId}`;
  return QRCodeLib.toString(url, {
    type: "svg",
    margin: 2,
    color: {
      dark: "#1a1a2e",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate a QR code as a PNG buffer.
 */
export async function generateQRBuffer(qrId: string): Promise<Buffer> {
  const url = `${APP_URL}/r/${qrId}`;
  return QRCodeLib.toBuffer(url, {
    type: "png",
    width: 600,
    margin: 2,
    color: {
      dark: "#1a1a2e",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}
