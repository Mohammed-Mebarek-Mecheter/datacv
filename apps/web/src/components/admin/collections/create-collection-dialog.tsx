// components/admin/collections/create-collection-dialog.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {Plus, Star, Crown, Folder} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import {Badge} from "@/components/ui/badge";
import {handleZodErrors} from "@/utils/zod-error-handler";
import {CollectionVisualSettings} from "@/components/admin/collections/collection-visual-settings";
import {
    type CollectionFormData
} from "@/components/admin/collections/collection-settings-wrapper";
import {CollectionSettingsFormSection} from "@/components/admin/collections/collection-settings-form-section";

const createCollectionSchema = z.object({
    name: z.string().min(1, "Collection name is required"),
    description: z.string().optional(),
    slug: z.string().optional(),
    coverImageUrl: z.url().optional().or(z.literal('')),
    color: z.string().default("#3B82F6"),
    icon: z.string().optional(),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isPremium: z.boolean().default(false),
    isCurated: z.boolean().default(false),
});

interface CreateCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const CreateCollectionDialog: React.FC<CreateCollectionDialogProps> = ({
                                                                                  open,
                                                                                  onOpenChange,
                                                                                  onSuccess,
                                                                              }) => {
    const [formData, setFormData] = useState<CollectionFormData & {
        name: string;
        description: string;
        slug: string;
        coverImageUrl: string;
        color: string;
        icon: string;
        order: number;
    }>({
        name: '',
        description: '',
        slug: '',
        coverImageUrl: '',
        color: '#3B82F6',
        icon: '',
        order: 0,
        isActive: true,
        isFeatured: false,
        isPremium: false,
        isCurated: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = trpc.admin.collections.createCollection.useMutation({
        onSuccess: () => {
            toast({
                title: "Collection created",
                description: "Collection has been successfully created.",
            });
            resetForm();
            onOpenChange(false);
            onSuccess();
        },
        onError: (error) => {
            toast({
                title: "Create failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            slug: '',
            coverImageUrl: '',
            color: '#3B82F6',
            icon: '',
            order: 0,
            isActive: true,
            isFeatured: false,
            isPremium: false,
            isCurated: false,
        });
        setErrors({});
    };

    const validateForm = () => {
        try {
            createCollectionSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            setErrors(handleZodErrors(error));
            return false;
        }
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        createMutation.mutate({
            ...formData,
            coverImageUrl: formData.coverImageUrl || undefined,
            slug: formData.slug || undefined,
            description: formData.description || undefined,
            icon: formData.icon || undefined,
        });
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            name: value,
            slug: prev.slug || generateSlug(value)
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Collection
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                    <DialogDescription>
                        Create a new template collection to organize and curate templates
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Collection Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Professional Data Science Templates"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="A curated collection of professional templates for data science professionals..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="slug">URL Slug</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    placeholder="professional-data-science"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Will be auto-generated from name if left empty
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Visual Settings */}
                    <CollectionVisualSettings
                        color={formData.color}
                        icon={formData.icon}
                        coverImageUrl={formData.coverImageUrl}
                        errors={errors}
                        onColorChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                        onIconChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                        onCoverImageUrlChange={(value) => setFormData(prev => ({ ...prev, coverImageUrl: value }))}
                    />

                    {/* Collection Settings */}
                    <CollectionSettingsFormSection
                        formData={{
                            isActive: formData.isActive,
                            isFeatured: formData.isFeatured,
                            isPremium: formData.isPremium,
                            isCurated: formData.isCurated,
                        }}
                        setFormData={setFormData}
                    />

                    {/* Preview */}
                    <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: formData.color }}
                                >
                                    {formData.icon || <Folder className="h-6 w-6 text-white/80" />}
                                </div>
                                <div>
                                    <h4 className="font-medium">{formData.name || 'Collection Name'}</h4>
                                    {formData.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {formData.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        {formData.isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                                        {formData.isFeatured && <Star className="h-3 w-3 text-blue-500" />}
                                        {formData.isCurated && (
                                            <Badge variant="outline" className="text-xs">Curated</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Creating...' : 'Create Collection'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
