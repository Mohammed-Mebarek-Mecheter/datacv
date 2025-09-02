// src/lib/trpc/routers/admin/templates/index.ts
import { router } from "@/lib/trpc";
import { baseTemplateRouter } from "./base-operations";
import { duplicationRouter } from "./duplication";
import { versionsRouter } from "./versions";
import { bulkOperationsRouter } from "./bulk-operations";
import { validationRouter } from "./validation";

export const adminTemplateRouter = router({
    // Base CRUD operations
    getTemplates: baseTemplateRouter.getTemplates,
    getTemplate: baseTemplateRouter.getTemplate,
    createTemplate: baseTemplateRouter.createTemplate,
    updateTemplate: baseTemplateRouter.updateTemplate,
    deleteTemplate: baseTemplateRouter.deleteTemplate,
    generatePreviewImages: baseTemplateRouter.generatePreviewImages,

    // Template duplication and derivation
    duplicateTemplate: duplicationRouter.duplicateTemplate,
    createTemplateFromBase: duplicationRouter.createTemplateFromBase,

    // Version management
    getTemplateVersions: versionsRouter.getTemplateVersions,
    getTemplateVersion: versionsRouter.getTemplateVersion,
    createTemplateVersion: versionsRouter.createTemplateVersion,
    publishTemplateVersion: versionsRouter.publishTemplateVersion,
    revertToTemplateVersion: versionsRouter.revertToTemplateVersion,

    // Bulk operations
    bulkUpdateTemplates: bulkOperationsRouter.bulkUpdateTemplates,
    bulkDeleteTemplates: bulkOperationsRouter.bulkDeleteTemplates,
    bulkChangeStatus: bulkOperationsRouter.bulkChangeStatus,
    bulkToggleFeature: bulkOperationsRouter.bulkToggleFeature,

    // Validation operations
    validateTemplateStructure: validationRouter.validateTemplateStructure,
    validateTemplateIntegrity: validationRouter.validateTemplateIntegrity,
});

// Export individual routers for testing purposes
export {
    baseTemplateRouter,
    duplicationRouter,
    versionsRouter,
    bulkOperationsRouter,
    validationRouter,
};
