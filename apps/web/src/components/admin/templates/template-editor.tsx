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

// Enhanced template schema with new fields
const templateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    description: z.string().optional(),
    category: z.enum(["professional", "modern", "creative", "academic"]),
    documentType: z.enum(["resume", "cv", "cover_letter"]) as z.ZodType<DocumentsType>,
    parentTemplateId: z.string().optional(),
    isBaseTemplate: z.boolean().default(false),
    targetSpecialization: z.array(z.string()).optional() as z.ZodOptional<z.ZodType<DataSpecialization[]>>,
    targetIndustries: z.array(z.string()).optional() as z.ZodOptional<z.ZodType<DataIndustry[]>>,
    targetExperienceLevel: z.enum(["entry","junior","mid","senior","lead","principal","executive"]).optional(),
    templateStructure: z.object({
        sections: z.array(z.object({
            id: z.string(),
            name: z.string(),
            type: z.enum(["personal_info", "summary", "experience", "education", "skills", "projects", "custom"]),
            isRequired: z.boolean(),
            order: z.number(),
            description: z.string().optional(),
            maxItems: z.number().optional(),
            validation: z.any().optional(),
            conditionalVisibility: z.any().optional(),
        })),
        layout: z.object({
            columns: z.union([z.literal(1), z.literal(2)]),
            headerStyle: z.enum(["minimal", "standard", "prominent"]),
            pageMargins: z.object({
                top: z.number(),
                bottom: z.number(),
                left: z.number(),
                right: z.number(),
            }).optional(),
            sectionSpacing: z.number().optional(),
            allowReordering: z.boolean().optional(),
        }),
        customFields: z.array(z.any()).optional(),
    }),
    designConfig: z.object({
        colors: z.object({
            primary: z.string(),
            secondary: z.string().optional(),
            accent: z.string().optional(),
            text: z.string(),
            textSecondary: z.string().optional(),
            background: z.string(),
            border: z.string().optional(),
            variations: z.record(z.string(), z.any()).optional(),
        }),
        typography: z.object({
            fontFamily: z.string(),
            fontSize: z.number(),
            lineHeight: z.number().optional(),
            headingFontFamily: z.string().optional(),
            headingSizes: z.object({
                h1: z.number(),
                h2: z.number(),
                h3: z.number(),
            }).optional(),
            fontWeights: z.object({
                normal: z.number(),
                bold: z.number(),
                heading: z.number(),
            }).optional(),
            letterSpacing: z.number().optional(),
        }),
        spacing: z.object({
            sectionSpacing: z.number(),
            itemSpacing: z.number().optional(),
            paragraphSpacing: z.number().optional(),
            marginTop: z.number().optional(),
            marginBottom: z.number().optional(),
        }),
        borders: z.object({
            sectionDividers: z.boolean(),
            headerUnderline: z.boolean(),
            style: z.enum(["solid", "dotted", "dashed"]),
            width: z.number(),
            radius: z.number().optional(),
        }).optional(),
        layout: z.object({
            maxWidth: z.string().optional(),
            columnGap: z.number().optional(),
            rowGap: z.number().optional(),
            alignment: z.enum(["left", "center", "right"]).optional(),
        }).optional(),
        effects: z.object({
            shadows: z.boolean().optional(),
            animations: z.boolean().optional(),
            gradients: z.boolean().optional(),
        }).optional(),
    }),
    componentCode: z.string().optional(),
    componentPath: z.string().optional(),
    componentVersion: z.string().default("1.0.0"),
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
    version: z.string().default("1.0.0"),
    reviewStatus: z.enum(["pending", "approved", "rejected"]).default("pending"),
    reviewNotes: z.string().optional(),
    sampleContent: z.any().optional(),
    collectionIds: z.array(z.string()).optional(),
    specificSampleContentMap: z.record(z.string(), z.array(z.string())).optional(),
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
                    columns: 1,
                    headerStyle: 'standard',
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
                    fontSize: 12,
                },
                spacing: {
                    sectionSpacing: 16,
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
            sampleContent: {},
            collectionIds: [],
            specificSampleContentMap: {},
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
                sampleContent: template.sampleContent || {},
                collectionIds: template.collectionIds || [],
                specificSampleContentMap: template.specificSampleContentMap || {},
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

    React.useEffect(() => {
        if (watchedStructure) {
            validateMutation.mutate({
                templateStructure: watchedStructure,
                sampleContent: watchedSampleContent,
            });
        }
    }, [watchedStructure, watchedSampleContent]);

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
