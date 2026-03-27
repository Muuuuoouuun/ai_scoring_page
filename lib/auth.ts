import { createHash, randomBytes } from "crypto";
import { readJsonFile, writeJsonFile } from "./storage";

export type StoredUser = {
  id: string;
  email: string;
  nickname: string;
  role: "user" | "admin";
  passwordHash: string;
  createdAt: string;
  reviewCount: number;
  points: number;
};

export type PublicUser = Omit<StoredUser, "passwordHash">;

type Session = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

const SALT = "g2-judgment-mvp-salt-2024";

export const hashPassword = (password: string): string =>
  createHash("sha256").update(password + SALT).digest("hex");

const getUsers = (): StoredUser[] => readJsonFile<StoredUser[]>("users.json", []);
const getSessions = (): Session[] => readJsonFile<Session[]>("sessions.json", []);

export const findUserByEmail = (email: string): StoredUser | undefined =>
  getUsers().find((u) => u.email === email);

export const findUserById = (id: string): StoredUser | undefined =>
  getUsers().find((u) => u.id === id);

export const getAllPublicUsers = (): PublicUser[] =>
  getUsers().map(({ passwordHash: _, ...rest }) => rest);

export const login = (email: string, password: string): string | null => {
  const user = findUserByEmail(email);
  if (!user) return null;
  if (user.passwordHash !== hashPassword(password)) return null;

  const sessionId = randomBytes(32).toString("hex");
  const session: Session = {
    id: sessionId,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  const sessions = getSessions();
  sessions.push(session);
  writeJsonFile("sessions.json", sessions);
  return sessionId;
};

export const getSessionUser = (sessionId: string): PublicUser | null => {
  const sessions = getSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) return null;
  const user = findUserById(session.userId);
  if (!user) return null;
  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
};

export const logout = (sessionId: string): void => {
  const sessions = getSessions().filter((s) => s.id !== sessionId);
  writeJsonFile("sessions.json", sessions);
};

export const createUser = (
  email: string,
  nickname: string,
  password: string,
  role: "user" | "admin" = "user"
): PublicUser => {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email,
    nickname,
    role,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    reviewCount: 0,
    points: 0
  };
  users.push(newUser);
  writeJsonFile("users.json", users);
  const { passwordHash: _, ...publicUser } = newUser;
  return publicUser;
};

export const updateUserStats = (userId: string, delta: { reviewCount?: number; points?: number }) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return;
  if (delta.reviewCount) users[idx].reviewCount = (users[idx].reviewCount ?? 0) + delta.reviewCount;
  if (delta.points) users[idx].points = (users[idx].points ?? 0) + delta.points;
  writeJsonFile("users.json", users);
};

export const initDefaultUsers = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    createUser("admin@g2.com", "Admin", "admin1234", "admin");
    createUser("test@g2.com", "테스트유저", "test1234", "user");
  }
};
