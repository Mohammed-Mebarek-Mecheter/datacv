// components/admin/tags/tag-table.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Shield,
    TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

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

interface TagTableProps {
    tags: Tag[];
    selectedTags: string[];
    onSelectTag: (id: string) => void;
    onSelectAll: () => void;
    onEditTag: (tag: Tag) => void;
    onDeleteTag: (id: string) => void;
}

export const TagTable: React.FC<TagTableProps> = ({
                                                      tags,
                                                      selectedTags,
                                                      onSelectTag,
                                                      onSelectAll,
                                                      onEditTag,
                                                      onDeleteTag,
                                                  }) => {
    const getUsageBadgeVariant = (count: number | null) => {
        const actualCount = count || 0;
        if (actualCount === 0) return 'outline';
        if (actualCount < 5) return 'secondary';
        if (actualCount < 20) return 'default';
        return 'destructive';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tags ({tags.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedTags.length === tags.length && tags.length > 0}
                                    onCheckedChange={onSelectAll}
                                />
                            </TableHead>
                            <TableHead>Tag</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tags.map((tag) => (
                            <TableRow key={tag.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedTags.includes(tag.id)}
                                        onCheckedChange={() => onSelectTag(tag.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: tag.color || '#3B82F6' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{tag.name}</h3>
                                                {tag.isSystemTag && (
                                                    <Shield className="h-3 w-3 text-green-500" />
                                                )}
                                            </div>
                                            {tag.description && (
                                                <p className="text-sm text-muted-foreground truncate mt-1">
                                                    {tag.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    /{tag.slug}
                                                </Badge>
                                                {tag.parentTagId && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Child Tag
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {tag.category ? (
                                        <Badge variant="outline" className="capitalize">
                                            {tag.category}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3" />
                                        <Badge variant={getUsageBadgeVariant(tag.usageCount)}>
                                            {tag.usageCount || 0} uses
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={tag.isSystemTag ? 'default' : 'secondary'}>
                                        {tag.isSystemTag ? 'System' : 'Custom'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-muted-foreground">
                                        {format(new Date(tag.createdAt), 'MMM d, yyyy')}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEditTag(tag)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            {!tag.isSystemTag && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => onDeleteTag(tag.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
