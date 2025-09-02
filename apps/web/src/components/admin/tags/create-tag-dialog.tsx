// components/admin/tags/create-tag-dialog.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Shield } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import {handleZodErrors} from "@/utils/zod-error-handler";
import {TagCategoryColorFields} from "@/components/admin/tags/tag-category-color-fields";

const createTagSchema = z.object({
    name: z.string().min(1, "Tag name is required"),
    description: z.string().optional(),
    color: z.string().default("#3B82F6"),
    category: z.string().optional(),
    isSystemTag: z.boolean().default(false),
});

interface CreateTagDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const CreateTagDialog: React.FC<CreateTagDialogProps> = ({
                                                                    open,
                                                                    onOpenChange,
                                                                    onSuccess,
                                                                }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        category: '',
        isSystemTag: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = trpc.admin.tags.createTag.useMutation({
        onSuccess: () => {
            toast({
                title: "Tag created",
                description: "Tag has been successfully created.",
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
            color: '#3B82F6',
            category: '',
            isSystemTag: false,
        });
        setErrors({});
    };

    const validateForm = () => {
        try {
            createTagSchema.parse(formData);
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
            description: formData.description || undefined,
            category: formData.category || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tag
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New Tag</DialogTitle>
                    <DialogDescription>
                        Create a new tag for template categorization and search
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Tag Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="data-science"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Use lowercase with hyphens (e.g., "data-science", "entry-level")
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Templates suitable for data science professionals..."
                            rows={3}
                        />
                    </div>

                    <TagCategoryColorFields
                        category={formData.category}
                        color={formData.color}
                        onCategoryChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        onColorChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                    />

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-500" />
                                System Tag
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Protected tag that cannot be deleted by users
                            </p>
                        </div>
                        <Switch
                            checked={formData.isSystemTag}
                            onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, isSystemTag: checked }))}
                        />
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: formData.color }}
                                />
                                <span
                                    className="px-2 py-1 rounded-md text-sm font-medium"
                                    style={{
                                        backgroundColor: formData.color + '20',
                                        color: formData.color
                                    }}
                                >
                                    {formData.name || 'tag-name'}
                                </span>
                                {formData.isSystemTag && <Shield className="h-3 w-3 text-green-500" />}
                            </div>
                            {formData.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    {formData.description}
                                </p>
                            )}
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
                        {createMutation.isPending ? 'Creating...' : 'Create Tag'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
