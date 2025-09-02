// apps/web/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";
import { emailOTPClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    plugins: [
        polarClient(),
        emailOTPClient(),
        adminClient(),
    ],
});

// Export types for better TypeScript support
export type AuthClient = typeof authClient;
