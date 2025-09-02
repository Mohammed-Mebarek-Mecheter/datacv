// components/admin/collections/edit-collection-dialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Star, Crown, Folder } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import {format} from "date-fns";
import {CollectionVisualSettings} from "@/components/admin/collections/collection-visual-settings";
import {
    type CollectionFormData
} from "@/components/admin/collections/collection-settings-wrapper";
import {CollectionSettingsFormSection} from "@/components/admin/collections/collection-settings-form-section";

const updateCollectionSchema = z.object({
    name: z.string().min(1, "Collection name is required"),
    description: z.string().optional(),
    slug: z.string().optional(),
    coverImageUrl: z.url().optional().or(z.literal('')),
    color: z.string(),
    icon: z.string().optional(),
    order: z.number(),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    isPremium: z.boolean(),
    isCurated: z.boolean(),
});

interface Collection {
    id: string;
    name: string;
    description?: string;
    slug?: string;
    coverImageUrl?: string;
    color: string;
    icon?: string;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    isPremium: boolean;
    isCurated: boolean;
    parentCollectionId?: string;
    templateCount: number;
    createdAt: string;
}

interface EditCollectionDialogProps {
    collection: Collection | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const EditCollectionDialog: React.FC<EditCollectionDialogProps> = ({
                                                                              collection,
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

    // Update form when collection changes
    useEffect(() => {
        if (collection) {
            setFormData({
                name: collection.name,
                description: collection.description || '',
                slug: collection.slug || '',
                coverImageUrl: collection.coverImageUrl || '',
                color: collection.color,
                icon: collection.icon || '',
                order: collection.order,
                isActive: collection.isActive,
                isFeatured: collection.isFeatured,
                isPremium: collection.isPremium,
                isCurated: collection.isCurated,
            });
            setErrors({});
        }
    }, [collection]);

    const updateMutation = trpc.admin.collections.updateCollection.useMutation({
        onSuccess: () => {
            toast({
                title: "Collection updated",
                description: "Collection has been successfully updated.",
            });
            onOpenChange(false);
            onSuccess();
        },
        onError: (error) => {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const validateForm = () => {
        try {
            updateCollectionSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.issues.forEach((issue) => {
                    if (issue.path.length > 0) {
                        newErrors[issue.path[0] as string] = issue.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = () => {
        if (!collection || !validateForm()) return;

        updateMutation.mutate({
            id: collection.id,
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

    if (!collection) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                    <DialogDescription>
                        Update collection details and settings
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
                                placeholder="A curated collection of professional templates..."
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

                    {/* Collection Stats */}
                    <div className="space-y-2">
                        <Label>Collection Statistics</Label>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{collection.templateCount}</div>
                                <div className="text-sm text-blue-800">Templates</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{collection.order}</div>
                                <div className="text-sm text-green-800">Display Order</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="text-sm font-medium text-purple-600">
                                    {format(new Date(collection.createdAt), 'MMM d, yyyy')}
                                </div>
                                <div className="text-sm text-purple-800">Created</div>
                            </div>
                        </div>
                    </div>

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
                                    <h4 className="font-medium">{formData.name}</h4>
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
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Updating...' : 'Update Collection'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
