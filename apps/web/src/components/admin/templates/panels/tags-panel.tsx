// components/admin/templates/panels/tags-panel.tsx
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    X,
    Search,
    Tag as TagIcon,
    Shield,
    TrendingUp
} from 'lucide-react';
import { trpc } from '@/utils/trpc';

// Add proper types for the Tag interface based on the database schema
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

export const TagsPanel: React.FC = () => {
    const form = useFormContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    // Fetch all tags
    const { data: tagsData } = trpc.admin.tags.getTags.useQuery({
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        limit: 100,
    });

    const tags: Tag[] = tagsData?.tags || [];
    const currentTags = form.watch('tags') || [];

    const handleAddTags = () => {
        const newTags = [...new Set([...currentTags, ...selectedTags])];
        form.setValue('tags', newTags, { shouldDirty: true });
        setSelectedTags([]);
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = currentTags.filter((tag: string) => tag !== tagToRemove);
        form.setValue('tags', updatedTags, { shouldDirty: true });
    };

    const handleToggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const availableTags = tags.filter((tag: Tag) => !currentTags.includes(tag.name));
    const filteredTags = availableTags.filter((tag: Tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Get tag details for current tags
    const currentTagDetails = currentTags
        .map((tagName: string) => tags.find((tag: Tag) => tag.name === tagName))
        .filter((tag: Tag | undefined): tag is Tag => tag !== undefined);

    const categories = [...new Set(tags.map((tag: Tag) => tag.category).filter(Boolean))] as string[];

    return (
        <div className="space-y-6 max-h-full overflow-y-auto">
            {/* Current Tags */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4 text-blue-500" />
                        Current Tags ({currentTags.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {currentTags.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <TagIcon className="h-6 w-6 mx-auto mb-2" />
                            <p>No tags assigned to this template</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {currentTagDetails.map((tag: Tag) => (
                                <div key={tag.id} className="flex items-center gap-1">
                                    <Badge
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                        style={{
                                            backgroundColor: `${tag.color || '#000000'}20`,
                                            color: tag.color || '#000000',
                                            borderColor: `${tag.color || '#000000'}40`
                                        }}
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: tag.color || '#000000' }}
                                        />
                                        {tag.name}
                                        {tag.isSystemTag && <Shield className="h-2 w-2" />}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 ml-1"
                                            onClick={() => handleRemoveTag(tag.name)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                </div>
                            ))}
                            {/* Handle any tags that aren't in the fetched list */}
                            {currentTags
                                .filter((tagName: string) => !currentTagDetails.some((t: Tag) => t.name === tagName))
                                .map((tagName: string) => (
                                    <div key={tagName} className="flex items-center gap-1">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            {tagName}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-0 ml-1"
                                                onClick={() => handleRemoveTag(tagName)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Tags */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Add Tags</CardTitle>
                        {selectedTags.length > 0 && (
                            <Button onClick={handleAddTags}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add {selectedTags.length} Tag(s)
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category: string) => (
                                <option key={category} value={category}>
                                    {category?.charAt(0).toUpperCase() + category?.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedTags.length === filteredTags.length && filteredTags.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedTags(filteredTags.map((tag: Tag) => tag.name));
                                                } else {
                                                    setSelectedTags([]);
                                                }
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>Tag</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Usage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTags.map((tag: Tag) => (
                                    <TableRow key={tag.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedTags.includes(tag.name)}
                                                onCheckedChange={() => handleToggleTag(tag.name)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: tag.color || '#000000'}}
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{tag.name}</span>
                                                        {tag.isSystemTag && <Shield className="h-3 w-3 text-green-500" />}
                                                    </div>
                                                    {tag.description && (
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {tag.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {tag.category ? (
                                                <Badge variant="outline" className="capitalize text-xs">
                                                    {tag.category}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="text-sm">{tag.usageCount || 0}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredTags.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                            {searchTerm ? (
                                <p>No tags found matching "{searchTerm}"</p>
                            ) : (
                                <p>No available tags to add</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tag Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Tag Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{tags.length}</div>
                            <div className="text-sm text-blue-800">Total Tags</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{currentTags.length}</div>
                            <div className="text-sm text-green-800">Applied Tags</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {tags.filter((tag: Tag) => tag.isSystemTag).length}
                            </div>
                            <div className="text-sm text-purple-800">System Tags</div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
                            <div className="text-sm text-orange-800">Categories</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
