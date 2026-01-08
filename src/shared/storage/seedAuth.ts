import { readJson, writeJson } from "./storage";
import type { StoredUser } from "../types/auth";

const USERS_KEY = "pm_users_v1";

export function seedAuthOnce() {
  const users = readJson<StoredUser[]>(USERS_KEY, []);
  if (users.length > 0) return;

  const seed: StoredUser[] = [
    {
      id: "user_seed_1",
      email: "demo@demo.com",
      name: "Demo User",
      password: "demo123",
      createdAt: new Date().toISOString(),
    },
  ];
  

  writeJson(USERS_KEY, seed);
}
