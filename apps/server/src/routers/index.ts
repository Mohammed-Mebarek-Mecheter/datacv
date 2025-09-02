// apps/server/src/routers/index.ts
import { protectedProcedure, publicProcedure, router } from "@/lib/trpc";
import { userRouter } from "./user/user";
import { documentRouter } from "./documents/document";
import { aiRouter } from "./ai";
import { adminRouter } from "../routers/admin";
import { templateRouter } from "../routers/user/user-facing-template";
import { emailOtpRouter } from "../routers/email-otp";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),

	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),

	// Mount the document router (enhanced resume router with CV/Cover Letter support)
	document: documentRouter,

	// Keep backward compatibility
	resume: documentRouter, // Alias for backward compatibility

	// Mount the enhanced AI router
	ai: aiRouter,

	// Mount the user router
	user: userRouter,

	// Mount the admin router
	admin: adminRouter,

	// Template operations (browsing, customizing, using templates)
	template: templateRouter,

	// Email OTP operations
	emailOtp: emailOtpRouter,
});

export type AppRouter = typeof appRouter;
