import { randomBytes } from "crypto";

export function generateReference(): string {
  const year = new Date().getFullYear();
  const code = randomBytes(4).toString("hex").toUpperCase().slice(0, 5);
  return `GAS-${year}-${code}`;
}
