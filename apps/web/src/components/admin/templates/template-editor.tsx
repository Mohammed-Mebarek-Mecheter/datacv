// components/admin/templates/template-editor.tsx
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Save, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { toast } from '@/hooks/use-toast';

// Import panels
import { BasicInfoPanel } from './panels/basic-info-panel';
import { DesignPanel } from './panels/design-panel';
import { StructurePanel } from './panels/structure-panel';
import { PreviewPanel } from './panels/preview-panel';
import { VersionPanel } from './panels/version-panel';
import { QualityPanel } from './panels/quality-panel';
import { CollectionsPanel } from './panels/collections-panel';
import { TagsPanel } from './panels/tags-panel';
import { SampleContentPanel } from './panels/sample-content-panel';

// Import types
import type { DocumentsType, DataSpecialization, DataIndustry } from '@/types/types';

// Enhanced template schema with new fields from documentTemplates schema
const templateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    description: z.string().optional(),
    category: z.enum(["professional", "modern", "creative", "academic", "minimalist", "executive", "technical", "infographic"]),
    documentType: z.enum(["resume", "cv", "cover_letter"]) as z.ZodType<DocumentsType>,
    parentTemplateId: z.string().optional(),
    baseTemplateId: z.string().optional(),
    isBaseTemplate: z.boolean().default(false),
    isVariant: z.boolean().default(false),
    variantType: z.enum(["color", "layout", "typography", "style", "complete"]).optional(),
    variantName: z.string().optional(),
    targetSpecialization: z.array(z.string()).optional() as z.ZodOptional<z.ZodType<DataSpecialization[]>>,
    targetIndustries: z.array(z.string()).optional() as z.ZodOptional<z.ZodType<DataIndustry[]>>,
    targetExperienceLevel: z.enum(["entry","junior","mid","senior","lead","principal","executive"]).optional(),
    targetJobTitles: z.array(z.string()).optional(),
    targetCompanyTypes: z.array(z.enum(["startup", "enterprise", "consulting", "agency", "non_profit", "government"])).optional(),
    templateStructure: z.object({
        sections: z.array(z.object({
            id: z.string(),
            name: z.string(),
            type: z.enum([
                "personal_info", "summary", "experience", "education", "skills",
                "projects", "certifications", "publications", "achievements", "references", "custom"
            ]),
            isRequired: z.boolean(),
            order: z.number(),
            description: z.string().optional(),
            maxItems: z.number().optional(),
            layoutProps: z.object({
                columnSpan: z.union([z.literal(1), z.literal(2)]).optional(),
                rowSpan: z.number().optional(),
                flexGrow: z.number().optional(),
                alignment: z.enum(["left", "center", "right"]).optional(),
                sticky: z.boolean().optional(),
            }).optional(),
            displayStyle: z.enum(["standard", "timeline", "cards", "grid", "compact"]).optional(),
            headerStyle: z.enum(["minimal", "standard", "prominent", "divider", "colored_bar", "icon"]).optional(),
            iconName: z.string().optional(),
            validation: z.any().optional(),
            conditionalVisibility: z.any().optional(),
        })),
        layout: z.object({
            style: z.enum([
                "single_column", "two_column_left", "two_column_right", "two_column_balanced",
                "grid_based", "hybrid", "timeline", "modular_cards", "infographic"
            ]),
            columns: z.union([z.literal(1), z.literal(2), z.literal(3)]),
            columnWidths: z.array(z.number()).optional(),
            headerStyle: z.enum(["minimal", "standard", "prominent", "hero", "split"]),
            paperFormat: z.enum(["a4_portrait", "a4_landscape", "us_letter_portrait", "us_letter_landscape"]),
            pageMargins: z.object({
                top: z.number(),
                bottom: z.number(),
                left: z.number(),
                right: z.number(),
            }),
            sectionSpacing: z.number(),
            itemSpacing: z.number().optional(),
            allowReordering: z.boolean().optional(),
            stickyHeader: z.boolean().optional(),
            pageBreaks: z.enum(["auto", "manual", "avoid_orphans"]).optional(),
            contentFlow: z.enum(["standard", "masonry", "justified"]).optional(),
        }),
        visualStyle: z.object({
            theme: z.enum(["professional", "modern", "creative", "minimal", "bold", "elegant", "technical"]),
            personality: z.enum(["conservative", "balanced", "progressive", "creative"]),
            density: z.enum(["compact", "comfortable", "spacious"]),
            emphasis: z.enum(["content", "design", "balanced"]),
        }),
        customFields: z.array(z.any()).optional(),
    }),
    designConfig: z.object({
        colors: z.object({
            primary: z.string(),
            primaryLight: z.string().optional(),
            primaryDark: z.string().optional(),
            secondary: z.string().optional(),
            accent: z.string().optional(),
            text: z.string(),
            textSecondary: z.string().optional(),
            textMuted: z.string().optional(),
            headings: z.string().optional(),
            background: z.string(),
            surface: z.string().optional(),
            surfaceSecondary: z.string().optional(),
            border: z.string().optional(),
            divider: z.string().optional(),
            success: z.string().optional(),
            warning: z.string().optional(),
            error: z.string().optional(),
            links: z.string().optional(),
            dates: z.string().optional(),
            companies: z.string().optional(),
            achievements: z.string().optional(),
            variations: z.record(z.string(), z.object({
                name: z.string(),
                primary: z.string(),
                secondary: z.string().optional(),
                accent: z.string().optional(),
                description: z.string().optional(),
            })).optional(),
        }),
        typography: z.object({
            fontFamily: z.string(),
            headingFontFamily: z.string().optional(),
            brandFontFamily: z.string().optional(),
            baseFontSize: z.number(),
            scaleRatio: z.number().optional(),
            fontSizes: z.object({
                xs: z.number(),
                sm: z.number(),
                base: z.number(),
                lg: z.number(),
                xl: z.number(),
                "2xl": z.number(),
                "3xl": z.number(),
                "4xl": z.number(),
            }),
            headingSizes: z.object({
                name: z.number(),
                h1: z.number(),
                h2: z.number(),
                h3: z.number(),
            }),
            fontWeights: z.object({
                light: z.number(),
                normal: z.number(),
                medium: z.number(),
                semibold: z.number(),
                bold: z.number(),
            }),
            lineHeight: z.number(),
            headingLineHeight: z.number().optional(),
            letterSpacing: z.number().optional(),
            headingLetterSpacing: z.number().optional(),
            fontPairings: z.array(z.object({
                name: z.string(),
                heading: z.string(),
                body: z.string(),
                accent: z.string().optional(),
            })).optional(),
        }),
        spacing: z.object({
            baseUnit: z.number(),
            sectionSpacing: z.number(),
            itemSpacing: z.number().optional(),
            paragraphSpacing: z.number().optional(),
            nameSpacing: z.number().optional(),
            contactSpacing: z.number().optional(),
            summarySpacing: z.number().optional(),
            listItemSpacing: z.number().optional(),
            pageMargins: z.object({
                top: z.number(),
                bottom: z.number(),
                left: z.number(),
                right: z.number(),
            }),
            columnGap: z.number().optional(),
            rowGap: z.number().optional(),
        }),
        borders: z.object({
            sectionDividers: z.boolean(),
            headerUnderline: z.boolean(),
            style: z.enum(["solid", "dotted", "dashed", "double"]),
            width: z.number(),
            radius: z.number().optional(),
            sectionBorders: z.boolean().optional(),
            itemBorders: z.boolean().optional(),
            headerBorders: z.object({
                top: z.boolean().optional(),
                bottom: z.boolean().optional(),
                left: z.boolean().optional(),
                right: z.boolean().optional(),
                style: z.enum(["solid", "dotted", "dashed"]).optional(),
                color: z.string().optional(),
            }).optional(),
        }),
        layout: z.object({
            maxWidth: z.string().optional(),
            contentAlignment: z.enum(["left", "center", "right", "justified"]).optional(),
            headerAlignment: z.enum(["left", "center", "right"]).optional(),
            columnConfiguration: z.object({
                leftColumn: z.object({
                    width: z.number(),
                    sections: z.array(z.string()),
                    alignment: z.enum(["left", "center", "right"]).optional(),
                    backgroundColor: z.string().optional(),
                    padding: z.number().optional(),
                }).optional(),
                rightColumn: z.object({
                    width: z.number(),
                    sections: z.array(z.string()),
                    alignment: z.enum(["left", "center", "right"]).optional(),
                    backgroundColor: z.string().optional(),
                    padding: z.number().optional(),
                }).optional(),
            }).optional(),
            gridConfiguration: z.object({
                columns: z.number(),
                rows: z.number(),
                areas: z.record(z.string(), z.object({
                    row: z.number(),
                    column: z.number(),
                    rowSpan: z.number().optional(),
                    colSpan: z.number().optional(),
                })),
            }).optional(),
        }),
        effects: z.object({
            shadows: z.boolean().optional(),
            animations: z.boolean().optional(),
            gradients: z.boolean().optional(),
            backgroundPattern: z.enum(["none", "dots", "lines", "subtle_texture"]).optional(),
            hoverEffects: z.boolean().optional(),
            smoothTransitions: z.boolean().optional(),
            printOptimization: z.boolean().optional(),
            colorAdjustment: z.enum(["auto", "preserve", "grayscale"]).optional(),
        }),
        icons: z.object({
            sectionIcons: z.boolean().optional(),
            contactIcons: z.boolean().optional(),
            skillIcons: z.boolean().optional(),
            iconStyle: z.enum(["outline", "filled", "minimal"]).optional(),
            iconSize: z.number().optional(),
            customIcons: z.record(z.string(), z.string()).optional(),
        }),
        contentStyles: z.object({
            bulletStyle: z.enum(["standard", "minimal", "custom", "icons", "colored"]).optional(),
            dateFormat: z.enum(["month_year", "full_date", "year_only", "custom"]).optional(),
            skillPresentation: z.enum(["list", "tags", "bars", "grid", "compact"]).optional(),
            projectPresentation: z.enum(["detailed", "compact", "cards", "timeline"]).optional(),
            achievementFormat: z.enum(["bullets", "numbered", "highlights", "metrics_focused"]).optional(),
        }),
    }),
    specificSampleContentMap: z.record(z.string(), z.union([
        z.string(),
        z.object({
            default: z.string(),
            byJobTitle: z.record(z.string(), z.string()).optional(),
            bySpecialization: z.record(z.string(), z.string()).optional(),
            byIndustry: z.record(z.string(), z.string()).optional(),
            byExperienceLevel: z.record(z.string(), z.string()).optional(),
        })
    ])).optional(),
    templateVariants: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        variantType: z.enum(["color", "layout", "typography", "style", "complete"]),
        designOverrides: z.any().optional(),
        previewImageUrl: z.string().optional(),
        isDefault: z.boolean().default(false),
        isPremium: z.boolean().default(false),
        sortOrder: z.number().optional(),
    })).optional(),
    componentCode: z.string().optional(),
    componentPath: z.string().optional(),
    componentVersion: z.string().default("1.0.0"),
    layoutEngine: z.object({
        engine: z.enum(["standard", "flexbox", "grid", "absolute", "custom"]).default("standard"),
        responsive: z.boolean().optional(),
        breakpoints: z.object({
            mobile: z.number().optional(),
            tablet: z.number().optional(),
            desktop: z.number().optional(),
        }).optional(),
        layoutRules: z.array(z.object({
            condition: z.string(),
            overrides: z.any(),
        })).optional(),
    }).optional(),
    previewImageUrl: z.string().optional(),
    previewImages: z.any().optional(),
    previewImageAlt: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    tags: z.array(z.string()).optional(),
    searchKeywords: z.string().optional(),
    isPremium: z.boolean().default(false),
    isActive: z.boolean().default(true),
    isPublic: z.boolean().default(true),
    isDraft: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    featuredOrder: z.number().optional(),
    featuredUntil: z.date().optional(),
    featuredCategory: z.enum(["trending", "popular", "new", "staff_pick"]).optional(),
    version: z.string().default("1.0.0"),
    reviewStatus: z.enum(["pending", "approved", "rejected"]).default("pending"),
    reviewNotes: z.string().optional(),
    accessLevel: z.enum(["public", "premium", "enterprise", "beta"]).default("public"),
    requiredPlan: z.enum(["free", "pro", "enterprise"]).optional(),
    qualityScore: z.number().min(0).max(100).optional(),
    qualityMetrics: z.object({
        designConsistency: z.number().min(0).max(100).optional(),
        contentRelevance: z.number().min(0).max(100).optional(),
        userSatisfaction: z.number().min(0).max(100).optional(),
        technicalQuality: z.number().min(0).max(100).optional(),
        accessibility: z.number().min(0).max(100).optional(),
    }).optional(),
    features: z.object({
        supportedExports: z.array(z.enum(["pdf", "docx", "txt", "json"])).default(["pdf"]),
        aiOptimized: z.boolean().default(false),
        aiSuggestions: z.boolean().default(false),
        contentGeneration: z.boolean().default(false),
        colorCustomization: z.boolean().default(true),
        fontCustomization: z.boolean().default(true),
        layoutCustomization: z.boolean().default(false),
        sectionCustomization: z.boolean().default(true),
        multilingual: z.boolean().default(false),
        atsOptimized: z.boolean().default(true),
        printOptimized: z.boolean().default(true),
        mobileOptimized: z.boolean().default(false),
        portfolioSupport: z.boolean().default(false),
        publicationSupport: z.boolean().default(false),
        projectGallery: z.boolean().default(false),
        skillVisualization: z.boolean().default(false),
    }).optional(),
    sampleContent: z.any().optional(),
    collectionIds: z.array(z.string()).optional(),
});

type TemplateFormInput = z.input<typeof templateSchema>;

interface TemplateEditorProps {
    templateId?: string;
    mode: 'create' | 'edit' | 'duplicate';
    onSave?: (template: any) => void;
    onCancel?: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
                                                                  templateId,
                                                                  mode,
                                                                  onSave,
                                                                  onCancel
                                                              }) => {
    const [activeTab, setActiveTab] = React.useState('basic');
    const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

    // Initialize form with enhanced defaults
    const form = useForm<TemplateFormInput>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: '',
            description: '',
            category: 'professional',
            documentType: 'resume',
            isBaseTemplate: false,
            isVariant: false,
            templateStructure: {
                sections: [
                    {
                        id: 'personal-info',
                        name: 'Personal Information',
                        type: 'personal_info',
                        isRequired: true,
                        order: 0,
                    },
                    {
                        id: 'summary',
                        name: 'Professional Summary',
                        type: 'summary',
                        isRequired: false,
                        order: 1,
                    },
                ],
                layout: {
                    style: "single_column",
                    columns: 1,
                    headerStyle: 'standard',
                    paperFormat: "a4_portrait",
                    pageMargins: {
                        top: 72,
                        bottom: 72,
                        left: 72,
                        right: 72,
                    },
                    sectionSpacing: 16,
                },
                visualStyle: {
                    theme: "professional",
                    personality: "balanced",
                    density: "comfortable",
                    emphasis: "content",
                },
            },
            designConfig: {
                colors: {
                    primary: '#000000',
                    text: '#000000',
                    background: '#ffffff',
                },
                typography: {
                    fontFamily: 'Inter',
                    baseFontSize: 12,
                    fontSizes: {
                        xs: 10,
                        sm: 11,
                        base: 12,
                        lg: 14,
                        xl: 16,
                        "2xl": 18,
                        "3xl": 20,
                        "4xl": 24,
                    },
                    headingSizes: {
                        name: 24,
                        h1: 18,
                        h2: 16,
                        h3: 14,
                    },
                    fontWeights: {
                        light: 300,
                        normal: 400,
                        medium: 500,
                        semibold: 600,
                        bold: 700,
                    },
                    lineHeight: 1.5,
                },
                spacing: {
                    baseUnit: 4,
                    sectionSpacing: 16,
                    pageMargins: {
                        top: 72,
                        bottom: 72,
                        left: 72,
                        right: 72,
                    },
                },
                borders: {
                    sectionDividers: false,
                    headerUnderline: false,
                    style: 'solid',
                    width: 1,
                },
            },
            tags: [],
            isPremium: false,
            isActive: true,
            isPublic: true,
            isDraft: true,
            isFeatured: false,
            version: '1.0.0',
            reviewStatus: 'pending',
            accessLevel: "public",
            features: {
                supportedExports: ["pdf"],
                aiOptimized: false,
                atsOptimized: true,
                printOptimized: true,
            },
            sampleContent: {},
            collectionIds: [],
            specificSampleContentMap: {},
            templateVariants: [],
        },
    });

    // Load existing template data
    const { data: templateData } = trpc.admin.templates.getTemplate.useQuery(
        { id: templateId! },
        { enabled: !!templateId && mode === 'edit' }
    );

    // Validation mutation
    const validateMutation = trpc.admin.templates.validateTemplateStructure.useMutation({
        onSuccess: (result) => {
            setValidationErrors([...result.issues, ...result.warnings]);
        },
    });

    // Save mutations
    const createMutation = trpc.admin.templates.createTemplate.useMutation({
        onSuccess: (data) => {
            toast({
                title: "Template created",
                description: "Template has been successfully created.",
            });
            setHasUnsavedChanges(false);
            onSave?.(data.template);
        },
        onError: (error) => {
            toast({
                title: "Save failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const updateMutation = trpc.admin.templates.updateTemplate.useMutation({
        onSuccess: () => {
            toast({
                title: "Template updated",
                description: "Template has been successfully updated.",
            });
            setHasUnsavedChanges(false);
            onSave?.(templateData?.template);
        },
        onError: (error) => {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Load template data into form
    React.useEffect(() => {
        if (templateData?.template && mode === 'edit') {
            const template = templateData.template as any;
            form.reset({
                ...template,
                targetSpecialization: template.targetSpecialization || undefined,
                targetIndustries: template.targetIndustries || undefined,
                targetExperienceLevel: template.targetExperienceLevel || undefined,
                targetJobTitles: template.targetJobTitles || undefined,
                targetCompanyTypes: template.targetCompanyTypes || undefined,
                sampleContent: template.sampleContent || {},
                collectionIds: template.collectionIds || [],
                specificSampleContentMap: template.specificSampleContentMap || {},
                templateVariants: template.templateVariants || [],
                layoutEngine: template.layoutEngine || { engine: "standard" },
                features: template.features || {
                    supportedExports: ["pdf"],
                    aiOptimized: false,
                    atsOptimized: true,
                    printOptimized: true,
                },
                qualityMetrics: template.qualityMetrics || undefined,
            });
        }
    }, [templateData, mode, form]);

    // Watch for changes
    React.useEffect(() => {
        const subscription = form.watch(() => {
            setHasUnsavedChanges(true);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    // Auto-validate on structure changes
    const watchedStructure = form.watch('templateStructure');
    const watchedSampleContent = form.watch('sampleContent');
    const watchedDesignConfig = form.watch('designConfig');

    React.useEffect(() => {
        if (watchedStructure) {
            validateMutation.mutate({
                templateStructure: watchedStructure,
                designConfig: watchedDesignConfig,
                sampleContent: watchedSampleContent,
            });
        }
    }, [watchedStructure, watchedSampleContent, watchedDesignConfig]);

    const handleSave = async (data: TemplateFormInput) => {
        try {
            const parsed = templateSchema.parse(data);
            if (mode === 'create') {
                createMutation.mutate(parsed);
            } else if (mode === 'edit' && templateId) {
                updateMutation.mutate({ ...parsed, id: templateId });
            }
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handlePreview = () => {
        const formData = form.getValues();
        window.open(`/admin/templates/preview?data=${encodeURIComponent(JSON.stringify(formData))}`, '_blank');
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Tab configuration with validation requirements
    const tabs = [
        { value: 'basic', label: 'Basic Info', required: true },
        { value: 'structure', label: 'Structure', required: true },
        { value: 'design', label: 'Design', required: false },
        { value: 'collections', label: 'Collections', required: false, editOnly: false },
        { value: 'tags', label: 'Tags', required: false, editOnly: false },
        { value: 'sample-content', label: 'Sample Content', required: false, editOnly: false },
        { value: 'preview', label: 'Preview', required: false },
        { value: 'quality', label: 'Quality', required: false },
        { value: 'versions', label: 'Versions', required: false, editOnly: true },
    ];

    const availableTabs = tabs.filter(tab =>
        !tab.editOnly || (tab.editOnly && mode === 'edit')
    );

    // Get completion status for tabs
    const getTabStatus = (tabValue: string): boolean => {
        const formData = form.getValues();

        switch (tabValue) {
            case 'basic':
                return !!(formData.name && formData.category && formData.documentType);
            case 'structure':
                return (formData.templateStructure?.sections?.length > 0);
            case 'design':
                return !!(formData.designConfig?.colors?.primary);
            case 'tags':
                return !!(formData.tags?.length || 0 > 0);
            case 'collections':
                return !!(formData.collectionIds?.length || 0 > 0);
            case 'sample-content':
                return (Object.keys(formData.specificSampleContentMap || {}).length > 0);
            default:
                return true;
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">
                            {mode === 'create' ? 'Create Template' :
                                mode === 'edit' ? 'Edit Template' : 'Duplicate Template'}
                        </h2>
                        {hasUnsavedChanges && (
                            <Badge variant="outline" className="text-orange-600">
                                Unsaved Changes
                            </Badge>
                        )}
                        {templateData?.template && (
                            <Badge variant="secondary">
                                v{templateData.template.version}
                            </Badge>
                        )}
                        {/* Template Status Indicators */}
                        <div className="flex items-center gap-1">
                            {form.watch('isDraft') && (
                                <Badge variant="outline">Draft</Badge>
                            )}
                            {form.watch('isPremium') && (
                                <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                            )}
                            {form.watch('isFeatured') && (
                                <Badge className="bg-blue-100 text-blue-800">Featured</Badge>
                            )}
                            {form.watch('isVariant') && (
                                <Badge className="bg-purple-100 text-purple-800">Variant</Badge>
                            )}
                            {form.watch('isBaseTemplate') && (
                                <Badge className="bg-green-100 text-green-800">Base Template</Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePreview}
                            disabled={isLoading}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                        <Button
                            onClick={() => form.handleSubmit(handleSave)()}
                            disabled={isLoading}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isLoading ? 'Saving...' : 'Save Template'}
                        </Button>
                        {onCancel && (
                            <Button variant="ghost" onClick={onCancel}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <div className="px-4 pb-4">
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1">
                                    <p className="font-medium">Template Validation Issues:</p>
                                    <ul className="text-sm list-disc list-inside">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Template Progress Indicator */}
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        {availableTabs.map((tab, index) => {
                            const isCompleted = getTabStatus(tab.value);
                            const isActive = activeTab === tab.value;

                            return (
                                <React.Fragment key={tab.value}>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                                        isActive ? 'bg-blue-100 text-blue-800' :
                                            isCompleted ? 'bg-green-100 text-green-800' :
                                                tab.required ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-600'
                                    }`}>
                                        <span className="text-xs">{tab.label}</span>
                                        {isCompleted ? (
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        ) : tab.required ? (
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                        ) : (
                                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                        )}
                                    </div>
                                    {index < availableTabs.length - 1 && (
                                        <div className="w-2 h-px bg-gray-300" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden">
                <FormProvider {...form}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <TabsList className="mx-4 mt-4 grid grid-cols-9 w-full">
                            <TabsTrigger value="basic" className="relative">
                                Basic Info
                                {!getTabStatus('basic') && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="structure" className="relative">
                                Structure
                                {!getTabStatus('structure') && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="design">Design</TabsTrigger>
                            <TabsTrigger value="collections" className="relative">
                                Collections
                                {getTabStatus('collections') && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="tags" className="relative">
                                Tags
                                {getTabStatus('tags') && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="sample-content" className="relative">
                                Sample Content
                                {getTabStatus('sample-content') && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="quality">Quality</TabsTrigger>
                            {mode === 'edit' && <TabsTrigger value="versions">Versions</TabsTrigger>}
                        </TabsList>

                        <div className="flex-1 overflow-hidden px-4 pb-4">
                            <TabsContent value="basic" className="h-full">
                                <BasicInfoPanel />
                            </TabsContent>
                            <TabsContent value="structure" className="h-full">
                                <StructurePanel />
                            </TabsContent>
                            <TabsContent value="design" className="h-full">
                                <DesignPanel />
                            </TabsContent>
                            <TabsContent value="collections" className="h-full">
                                <CollectionsPanel templateId={templateId} />
                            </TabsContent>
                            <TabsContent value="tags" className="h-full">
                                <TagsPanel />
                            </TabsContent>
                            <TabsContent value="sample-content" className="h-full">
                                <SampleContentPanel />
                            </TabsContent>
                            <TabsContent value="preview" className="h-full">
                                <PreviewPanel templateData={form.watch()} />
                            </TabsContent>
                            <TabsContent value="quality" className="h-full">
                                <QualityPanel
                                    templateData={form.watch()}
                                    validationErrors={validationErrors}
                                />
                            </TabsContent>
                            {mode === 'edit' && (
                                <TabsContent value="versions" className="h-full">
                                    <VersionPanel templateId={templateId} />
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </FormProvider>
            </div>

            {/* Footer with Save Reminder */}
            {hasUnsavedChanges && (
                <div className="border-t bg-yellow-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-yellow-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span>You have unsaved changes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => form.reset()}>
                                Discard Changes
                            </Button>
                            <Button size="sm" onClick={() => form.handleSubmit(handleSave)()}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
