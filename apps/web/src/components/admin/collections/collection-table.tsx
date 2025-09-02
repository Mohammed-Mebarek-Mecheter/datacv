// components/admin/collections/collection-table.tsx
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
    Star,
    Crown,
    Folder,
    Users
} from 'lucide-react';
import { format } from 'date-fns';

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

interface CollectionTableProps {
    collections: Collection[];
    selectedCollections: string[];
    onSelectCollection: (id: string) => void;
    onSelectAll: () => void;
    onEditCollection: (collection: Collection) => void;
    onDeleteCollection: (id: string) => void;
}

export const CollectionTable: React.FC<CollectionTableProps> = ({
                                                                    collections,
                                                                    selectedCollections,
                                                                    onSelectCollection,
                                                                    onSelectAll,
                                                                    onEditCollection,
                                                                    onDeleteCollection,
                                                                }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Collections ({collections.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedCollections.length === collections.length && collections.length > 0}
                                    onCheckedChange={onSelectAll}
                                />
                            </TableHead>
                            <TableHead>Collection</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Templates</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {collections.map((collection) => (
                            <TableRow key={collection.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedCollections.includes(collection.id)}
                                        onCheckedChange={() => onSelectCollection(collection.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-start gap-3">
                                        {collection.coverImageUrl ? (
                                            <img
                                                src={collection.coverImageUrl}
                                                alt={collection.name}
                                                className="w-12 h-12 object-cover rounded border"
                                            />
                                        ) : (
                                            <div
                                                className="w-12 h-12 rounded border flex items-center justify-center"
                                                style={{ backgroundColor: collection.color || '#000000' }}
                                            >
                                                {collection.icon ? (
                                                    <span className="text-white">{collection.icon}</span>
                                                ) : (
                                                    <Folder className="h-6 w-6 text-white/80" />
                                                )}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium truncate">{collection.name}</h3>
                                                <div className="flex items-center gap-1">
                                                    {collection.isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                                                    {collection.isFeatured && <Star className="h-3 w-3 text-blue-500" />}
                                                </div>
                                            </div>
                                            {collection.description && (
                                                <p className="text-sm text-muted-foreground truncate mt-1">
                                                    {collection.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                {collection.slug && (
                                                    <Badge variant="outline" className="text-xs">
                                                        /{collection.slug}
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    Order: {collection.order}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant={collection.isActive ? 'default' : 'secondary'}>
                                            {collection.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                        {collection.isCurated && (
                                            <Badge variant="outline" className="text-xs">
                                                Curated
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span className="text-sm">{collection.templateCount}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-muted-foreground">
                                        {format(new Date(collection.createdAt), 'MMM d, yyyy')}
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
                                            <DropdownMenuItem onClick={() => onEditCollection(collection)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => onDeleteCollection(collection.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
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
