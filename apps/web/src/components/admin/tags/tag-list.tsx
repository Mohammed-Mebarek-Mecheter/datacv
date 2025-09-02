// components/admin/tags/tag-list.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    Tag as TagIcon,
    Shield,
    TrendingUp
} from 'lucide-react';
import { TagTable } from './tag-table';
import { TagFilters } from './tag-filters';
import { CreateTagDialog } from './create-tag-dialog';
import { EditTagDialog } from './edit-tag-dialog';
import { trpc } from '@/utils/trpc';
import { toast } from '@/hooks/use-toast';

// Update the Tag interface to match backend response
interface Tag {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    category: string | null;
    isSystemTag: boolean | null;
    usageCount: number | null;
    parentTagId: string | null;
    createdAt: string;
}

export const TagList: React.FC = () => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, _] = useState(1);
    const [pageSize] = useState(50);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    // Fetch tags
    const {
        data: tagsData,
        isLoading,
        refetch
    } = trpc.admin.tags.getTags.useQuery({
        ...filters,
        search: searchTerm || undefined,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
    });

    // Normalize values to match Tag type
    const tags: Tag[] = (tagsData?.tags || []).map((tag): Tag => ({
        ...tag,
        description: tag.description ?? null,
        color: tag.color ?? '#3B82F6',
        category: tag.category ?? null,
        isSystemTag: tag.isSystemTag ?? false,
        usageCount: tag.usageCount ?? 0,
        parentTagId: tag.parentTagId ?? null,
    }));

    // Delete tag mutation
    const deleteTagMutation = trpc.admin.tags.deleteTag.useMutation({
        onSuccess: () => {
            toast({
                title: "Tag deleted",
                description: "Tag has been successfully deleted.",
            });
            refetch();
            setSelectedTags(prev => prev.filter(id => !prev.includes(id)));
        },
        onError: (error) => {
            toast({
                title: "Delete failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSelectTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleSelectAll = () => {
        if (selectedTags.length === tags.length) {
            setSelectedTags([]);
        } else {
            setSelectedTags(tags.map(t => t.id));
        }
    };

    const handleDeleteTag = (tagId: string) => {
        const tag = tags.find(t => t.id === tagId);
        if (tag?.isSystemTag) {
            toast({
                title: "Cannot delete system tag",
                description: "System tags cannot be deleted.",
                variant: "destructive",
            });
            return;
        }

        if (confirm('Are you sure you want to delete this tag? It will be removed from all templates.')) {
            deleteTagMutation.mutate({ id: tagId });
        }
    };

    const handleEditTag = (tag: Tag) => {
        setEditingTag(tag);
        setEditDialogOpen(true);
    };

    // Calculate statistics with null checks
    const totalUsage = tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0);
    const systemTags = tags.filter(tag => tag.isSystemTag).length;
    const categories = [...new Set(tags.map(tag => tag.category).filter(Boolean))].length;

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <TagIcon className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{tags.length}</p>
                                <p className="text-sm text-muted-foreground">Total Tags</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">{systemTags}</p>
                                <p className="text-sm text-muted-foreground">System Tags</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            <div>
                                <p className="text-2xl font-bold">{totalUsage}</p>
                                <p className="text-sm text-muted-foreground">Total Usage</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <TagIcon className="h-4 w-4 text-orange-500" />
                            <div>
                                <p className="text-2xl font-bold">{categories}</p>
                                <p className="text-sm text-muted-foreground">Categories</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-80"
                        />
                    </div>
                    {selectedTags.length > 0 && (
                        <Badge variant="secondary">
                            {selectedTags.length} selected
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <CreateTagDialog
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                        onSuccess={refetch}
                    />
                </div>
            </div>

            {/* Filters */}
            <TagFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters({})}
                isLoading={isLoading}
            />

            {/* Tags Display */}
            {isLoading ? (
                <div className="text-center py-8">
                    <p>Loading tags...</p>
                </div>
            ) : (
                <TagTable
                    tags={tags}
                    selectedTags={selectedTags}
                    onSelectTag={handleSelectTag}
                    onSelectAll={handleSelectAll}
                    onEditTag={handleEditTag}
                    onDeleteTag={handleDeleteTag}
                />
            )}

            {tags.length === 0 && !isLoading && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No tags found matching your criteria.</p>
                    <Button
                        className="mt-4"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Tag
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            <EditTagDialog
                tag={editingTag}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={() => {
                    setEditingTag(null);
                    refetch();
                }}
            />
        </div>
    );
};
