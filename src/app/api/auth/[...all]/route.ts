/*
 * Better Auth API Route Handler
 * Handles all /api/auth/* requests
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
