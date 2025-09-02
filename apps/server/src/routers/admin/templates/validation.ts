// src/routers/admin/templates/validation.ts
import { z } from "zod";
import { adminProcedure, router } from "@/lib/trpc";
import {
    validateStructureSchema,
    sectionSchema,
} from "./schemas";

export const validationRouter = router({
    // Validate template structure before saving
    validateTemplateStructure: adminProcedure
        .input(validateStructureSchema)
        .mutation(async ({ input }) => {
            const issues: string[] = [];
            const warnings: string[] = [];

            const { sections, layout } = input.templateStructure;

            // Validate section structure
            const sectionIds = sections.map((s) => s.id);
            const duplicateIds = sectionIds.filter(
                (id, index) => sectionIds.indexOf(id) !== index,
            );
            if (duplicateIds.length > 0) {
                issues.push(`Duplicate section IDs: ${duplicateIds.join(", ")}`);
            }

            // Check for required sections
            type SectionType = z.infer<typeof sectionSchema>["type"];
            const requiredSectionTypes: SectionType[] = ["personal_info"];
            const presentTypes = sections.map((s) => s.type as SectionType);
            const missingRequired = requiredSectionTypes.filter(
                (type) => !presentTypes.includes(type),
            );
            if (missingRequired.length > 0) {
                issues.push(`Missing required sections: ${missingRequired.join(", ")}`);
            }

            // Validate section ordering
            const orders = sections.map((s) => s.order).sort((a, b) => a - b);
            for (let i = 0; i < orders.length - 1; i++) {
                if (orders[i] === orders[i + 1]) {
                    warnings.push(`Duplicate section order: ${orders[i]}`);
                }
            }

            // Validate layout
            if (layout.columns > 2) {
                warnings.push(
                    "More than 2 columns may not render well on mobile devices",
                );
            }

            // Validate sample content against structure if provided
            if (input.sampleContent) {
                const sampleSections = Object.keys(input.sampleContent);
                const structureSectionTypes = sections.map((s) => s.type) as string[];

                const extraSampleSections = sampleSections.filter(
                    (section) =>
                        !structureSectionTypes.includes(section) && section !== "custom",
                );
                if (extraSampleSections.length > 0) {
                    warnings.push(
                        `Sample content has sections not in structure: ${extraSampleSections.join(", ")}`,
                    );
                }
            }

            return {
                isValid: issues.length === 0,
                issues,
                warnings,
            };
        }),

    // Additional validation methods can be added here
    validateTemplateIntegrity: adminProcedure
        .input(
            z.object({
                templateId: z.string(),
                checkDependencies: z.boolean().default(true),
                checkVersions: z.boolean().default(true),
            }),
        )
        .mutation(async ({ input }) => {
            // Implementation for comprehensive template integrity checks
            const issues: string[] = [];
            const warnings: string[] = [];

            // This could include checks for:
            // - Component code validity
            // - Design config consistency
            // - Missing preview images
            // - Broken parent/child relationships
            // - Version inconsistencies

            return {
                isValid: issues.length === 0,
                issues,
                warnings,
            };
        }),
});
