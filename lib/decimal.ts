import { Prisma } from "@prisma/client";

/**
 * Coerce a number from client input to a Prisma Decimal at the server boundary.
 * Goes through a 1-decimal string to avoid any IEEE-754 intermediate.
 * Assumes the caller has already validated the input is a valid rating (0.0–5.0, step 0.1).
 */
export const toDecimal = (n: number): Prisma.Decimal =>
  new Prisma.Decimal(n.toFixed(1));
