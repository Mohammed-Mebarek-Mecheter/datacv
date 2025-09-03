// apps/server/src/routers/documents/index.ts
import { router } from "@/lib/trpc";
import { resumeRouter } from "./resume";
import { cvRouter } from "./cv";
import { coverLetterRouter } from "./cover-letter";
import { templateRouter } from "./template";
import { sharedRouter } from "./shared-router";
import {documentInitializationRouter} from "@/routers/documents/document-initialization";

export const documentRouter = router({
    // Resume operations
    resume: resumeRouter,

    // CV operations
    cv: cvRouter,

    // Cover letter operations
    coverLetter: coverLetterRouter,

    // Template operations
    template: templateRouter,

    // Shared document operations (analytics, export, etc.)
    shared: sharedRouter,

    // document initialization
    init: documentInitializationRouter,
});

// Export individual routers for direct use if needed
export { resumeRouter, cvRouter, coverLetterRouter, templateRouter, sharedRouter };
