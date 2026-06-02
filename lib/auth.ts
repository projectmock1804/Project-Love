import { NextRequest } from "next/server";
import { verifyToken, JwtPayload } from "./jwt";

export function getAuthUser(req: NextRequest): JwtPayload | null {
  try {
    const header = req.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return null;
    const token = header.slice(7);
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): JwtPayload {
  const user = getAuthUser(req);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
