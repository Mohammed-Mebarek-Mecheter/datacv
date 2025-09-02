// apps/server/src/routes/admin/index.ts
import { router } from "@/lib/trpc";
import { adminAnalytics } from "./admin-analytics";
import { adminCollectionRouter } from "./admin-collections";
import { adminTagRouter } from "./admin-tags";
import { adminTemplateRouter } from "./admin-templates";
import { adminUserRouter } from "./admin-users";
import { adminSampleContentRouter } from "./sample-content";

export const adminRouter = router({
	templates: adminTemplateRouter,
	tags: adminTagRouter,
	collections: adminCollectionRouter,
	analytics: adminAnalytics,
	users: adminUserRouter,
	sampleContent: adminSampleContentRouter,
});
