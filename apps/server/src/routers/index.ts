// apps/server/src/routers/index.ts
import { protectedProcedure, publicProcedure, router } from "@/lib/trpc";
import { userRouter } from "./user/user";
import { aiRouter } from "./ai";
import { adminRouter } from "@/routers/admin";
import {userfacingtemplateRouter} from "@/routers/user/user-facing-template";
import { emailOtpRouter } from "@/routers/email-otp";
import {documentRouter} from "@/routers/documents";

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

	// Mount the enhanced AI router
	ai: aiRouter,

	// Mount the user router
	user: userRouter,

	// Mount the admin router
	admin: adminRouter,

	// user Template operations (browsing, using templates)
	userfacingtemplate: userfacingtemplateRouter,

	// Email OTP operations
	emailOtp: emailOtpRouter,

    // document router
    document: documentRouter,
});

export type AppRouter = typeof appRouter;
