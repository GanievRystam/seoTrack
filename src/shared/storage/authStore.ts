import { readJson, writeJson } from "./storage";
import { uid } from "../lib/id";
import type { PublicUser, StoredUser, Session } from "../types/auth";

const USERS_KEY = "pm_users_v1";
const SESSION_KEY = "pm_session_v1";

export type AuthErrorCode =
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "VALIDATION"
  | "NO_SESSION";

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateRegister(email: string, password: string, name: string) {
  if (!name.trim()) throw new AuthError("VALIDATION", "Name is required");
  if (!isValidEmail(email)) throw new AuthError("VALIDATION", "Invalid email");
  if (password.length < 6) throw new AuthError("VALIDATION", "Password must be at least 6 characters");
}

function validateLogin(email: string, password: string) {
  if (!isValidEmail(email)) throw new AuthError("VALIDATION", "Invalid email");
  if (!password) throw new AuthError("VALIDATION", "Password is required");
}

function toPublicUser(u: StoredUser): PublicUser {
  const { password: _p, ...rest } = u;
  return rest;
}

function loadUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_KEY, []);
}

function saveUsers(users: StoredUser[]) {
  writeJson(USERS_KEY, users);
}

function saveSession(userId: string) {
  const session: Session = { userId, createdAt: new Date().toISOString() };
  writeJson(SESSION_KEY, session);
}

export function getSessionUser(): PublicUser | null {
  const session = readJson<Session | null>(SESSION_KEY, null);
  if (!session) return null;

  const users = loadUsers();
  const user = users.find((u) => u.id === session.userId);
  return user ? toPublicUser(user) : null;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function register(email: string, password: string, name: string): PublicUser {
  validateRegister(email, password, name);

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new AuthError("EMAIL_TAKEN", "This email is already registered");
  }

  const user: StoredUser = {
    id: uid("user"),
    email: normalizedEmail,
    name: name.trim(),
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);
  saveSession(user.id);

  return toPublicUser(user);
}

export function login(email: string, password: string): PublicUser {
  validateLogin(email, password);

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (!user) throw new AuthError("INVALID_CREDENTIALS", "Wrong email or password");

  saveSession(user.id);
  return toPublicUser(user);
}
