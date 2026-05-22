import { customAlphabet } from "nanoid";

/**
 * Generate a 12-character alphanumeric QR ID.
 * Uses a custom alphabet (lowercase + digits) for readability.
 */
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const generateQRId = customAlphabet(alphabet, 12);

export default generateQRId;
