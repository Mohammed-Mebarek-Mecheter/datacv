// src/routers/admin/templates/versions.ts
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { documentTemplates } from "@/db/schema/document-templates";
import { templateVersions } from "@/db/schema/template-versions";
import { adminProcedure, router } from "@/lib/trpc";
import {
    templateVersionSchema,
    versionListSchema,
    publishVersionSchema,
    revertVersionSchema,
} from "./schemas";

export const versionsRouter = router({
    // Get template versions
    getTemplateVersions: adminProcedure
        .input(versionListSchema)
        .query(async ({ input }) => {
            const versions = await db
                .select({
                    id: templateVersions.id,
                    versionNumber: templateVersions.versionNumber,
                    versionType: templateVersions.versionType,
                    changelogNotes: templateVersions.changelogNotes,
                    isBreaking: templateVersions.isBreaking,
                    backwardCompatible: templateVersions.backwardCompatible,
                    isPublished: templateVersions.isPublished,
                    publishedAt: templateVersions.publishedAt,
                    createdBy: templateVersions.createdBy,
                    createdAt: templateVersions.createdAt,
                    // Include creator name
                    creatorName: user.name,
                })
                .from(templateVersions)
                .leftJoin(user, eq(templateVersions.createdBy, user.id))
                .where(eq(templateVersions.templateId, input.templateId))
                .orderBy(desc(templateVersions.createdAt))
                .limit(input.limit)
                .offset(input.offset);

            return { versions };
        }),

    // Get specific version details
    getTemplateVersion: adminProcedure
        .input(
            z.object({
                versionId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const [version] = await db
                .select()
                .from(templateVersions)
                .where(eq(templateVersions.id, input.versionId))
                .limit(1);

            if (!version) {
                throw new Error("Version not found");
            }

            return { version };
        }),

    // Create new template version
    createTemplateVersion: adminProcedure
        .input(templateVersionSchema)
        .mutation(async ({ input, ctx }) => {
            const createdBy = ctx.session.user.id;

            // Get current template data for snapshot
            const [template] = await db
                .select()
                .from(documentTemplates)
                .where(eq(documentTemplates.id, input.templateId))
                .limit(1);

            if (!template) {
                throw new Error("Template not found");
            }

            const [newVersion] = await db
                .insert(templateVersions)
                .values({
                    ...input,
                    snapshot: {
                        name: template.name,
                        description: template.description,
                        templateStructure: template.templateStructure,
                        designConfig: template.designConfig,
                        tags: template.tags,
                    },
                    createdBy,
                } as typeof templateVersions.$inferInsert)
                .returning();

            return {
                success: true,
                version: newVersion,
            };
        }),

    // Publish template version
    publishTemplateVersion: adminProcedure
        .input(publishVersionSchema)
        .mutation(async ({ input, ctx }) => {
            const updatedBy = ctx.session.user.id;

            // Get version details
            const [version] = await db
                .select()
                .from(templateVersions)
                .where(eq(templateVersions.id, input.versionId))
                .limit(1);

            if (!version) {
                throw new Error("Version not found");
            }

            // Unpublish other versions if requested
            if (input.unpublishOthers) {
                await db
                    .update(templateVersions)
                    .set({
                        isPublished: false,
                        publishedAt: null,
                    })
                    .where(eq(templateVersions.templateId, version.templateId));
            }

            // Publish this version
            await db
                .update(templateVersions)
                .set({
                    isPublished: true,
                    publishedAt: new Date(),
                })
                .where(eq(templateVersions.id, input.versionId));

            return { success: true };
        }),

    // Revert template to specific version
    revertToTemplateVersion: adminProcedure
        .input(revertVersionSchema)
        .mutation(async ({ input, ctx }) => {
            const updatedBy = ctx.session.user.id;

            // Get version data
            const [version] = await db
                .select()
                .from(templateVersions)
                .where(eq(templateVersions.id, input.versionId))
                .limit(1);

            if (!version || version.templateId !== input.templateId) {
                throw new Error("Version not found or doesn't belong to template");
            }

            // Create backup if requested
            if (input.createBackup) {
                const [currentTemplate] = await db
                    .select()
                    .from(documentTemplates)
                    .where(eq(documentTemplates.id, input.templateId))
                    .limit(1);

                if (currentTemplate) {
                    await db.insert(templateVersions).values({
                        templateId: input.templateId,
                        versionNumber: `${currentTemplate.version}-backup-${Date.now()}`,
                        versionType: "patch",
                        snapshot: {
                            name: currentTemplate.name,
                            description: currentTemplate.description,
                            templateStructure: currentTemplate.templateStructure,
                            designConfig: currentTemplate.designConfig,
                            componentCode: currentTemplate.componentCode,
                            tags: currentTemplate.tags,
                        },
                        changelogNotes: "Backup before reverting to older version",
                        createdBy: updatedBy,
                    } as typeof templateVersions.$inferInsert);
                }
            }

            // Apply version data to template
            const versionData = version.snapshot;
            await db
                .update(documentTemplates)
                .set({
                    name: versionData.name,
                    description: versionData.description,
                    templateStructure: versionData.templateStructure as any,
                    designConfig: versionData.designConfig as any,
                    componentCode: versionData.componentCode,
                    tags: versionData.tags,
                    version: version.versionNumber,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, input.templateId));

            return { success: true };
        }),
});
