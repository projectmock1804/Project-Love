import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

if (!SECRET || SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

export interface JwtPayload {
  userId: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, SECRET, { algorithms: ["HS256"] });
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof (decoded as JwtPayload).userId !== "string"
  ) {
    throw new Error("UNAUTHORIZED");
  }
  return decoded as JwtPayload;
}
