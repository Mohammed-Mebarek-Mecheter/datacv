// components/admin/collections/collection-list.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    MoreHorizontal,
    Plus,
    Search,
    Grid,
    List,
    Edit,
    Trash2,
    Star,
    Crown,
    Folder,
    Users
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CollectionTable } from './collection-table';
import { CollectionFilters } from './collection-filters';
import { CreateCollectionDialog } from './create-collection-dialog';
import { EditCollectionDialog } from './edit-collection-dialog';
import { trpc } from '@/utils/trpc';
import { toast } from '@/hooks/use-toast';
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

export const CollectionList: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, _] = useState(1);
    const [pageSize] = useState(20);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    // Fetch collections
    const {
        data: collectionsData,
        isLoading,
        refetch
    } = trpc.admin.collections.getCollections.useQuery({
        ...filters,
        search: searchTerm || undefined,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
    });

    const rawCollections = collectionsData?.collections || [];
    const collections: Collection[] = rawCollections.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? undefined,
        slug: c.slug ?? undefined,
        coverImageUrl: c.coverImageUrl ?? undefined,
        color: c.color || '#000000',
        icon: c.icon ?? undefined,
        order: c.order ?? 0,
        isActive: c.isActive ?? true,
        isFeatured: c.isFeatured ?? false,
        isPremium: c.isPremium ?? false,
        isCurated: c.isCurated ?? false,
        parentCollectionId: c.parentCollectionId ?? undefined,
        templateCount: c.templateCount ?? 0,
        createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date(c.createdAt as any).toISOString(),
    }));

    // Delete collection mutation
    const deleteCollectionMutation = trpc.admin.collections.deleteCollection.useMutation({
        onSuccess: () => {
            toast({
                title: "Collection deleted",
                description: "Collection has been successfully deleted.",
            });
            refetch();
            setSelectedCollections(prev => prev.filter(id => !prev.includes(id)));
        },
        onError: (error) => {
            toast({
                title: "Delete failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSelectCollection = (collectionId: string) => {
        setSelectedCollections(prev =>
            prev.includes(collectionId)
                ? prev.filter(id => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    const handleSelectAll = () => {
        if (selectedCollections.length === collections.length) {
            setSelectedCollections([]);
        } else {
            setSelectedCollections(collections.map(c => c.id));
        }
    };

    const handleDeleteCollection = (collectionId: string) => {
        if (confirm('Are you sure you want to delete this collection? Templates will be removed from this collection.')) {
            deleteCollectionMutation.mutate({ id: collectionId });
        }
    };

    const handleEditCollection = (collection: Collection) => {
        setEditingCollection(collection);
        setEditDialogOpen(true);
    };

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collections.map((collection) => (
                <Card key={collection.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                            <Checkbox
                                checked={selectedCollections.includes(collection.id)}
                                onCheckedChange={() => handleSelectCollection(collection.id)}
                                className="mt-1"
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditCollection(collection)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => handleDeleteCollection(collection.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {collection.coverImageUrl ? (
                            <div
                                className="aspect-[4/3] rounded-lg overflow-hidden"
                                style={{ backgroundColor: collection.color || '#000000' }}
                            >
                                <img
                                    src={collection.coverImageUrl}
                                    alt={collection.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div
                                className="aspect-[4/3] rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: collection.color || '#000000' }}
                            >
                                {collection.icon ? (
                                    <span className="text-2xl">{collection.icon}</span>
                                ) : (
                                    <Folder className="h-8 w-8 text-white/80" />
                                )}
                            </div>
                        )}

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium truncate">{collection.name}</h3>
                                <div className="flex items-center gap-1">
                                    {collection.isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                                    {collection.isFeatured && <Star className="h-3 w-3 text-blue-500" />}
                                    {collection.isCurated && <Badge variant="outline" className="text-xs">Curated</Badge>}
                                </div>
                            </div>

                            {collection.description && (
                                <p className="text-sm text-muted-foreground truncate mb-2">
                                    {collection.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{collection.templateCount} templates</span>
                                    </div>
                                    <Badge variant={collection.isActive ? 'default' : 'secondary'}>
                                        {collection.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(collection.createdAt), 'MMM d')}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search collections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-80"
                        />
                    </div>
                    {selectedCollections.length > 0 && (
                        <Badge variant="secondary">
                            {selectedCollections.length} selected
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <CreateCollectionDialog
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                        onSuccess={refetch}
                    />
                </div>
            </div>

            {/* Filters */}
            <CollectionFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters({})}
                isLoading={isLoading}
            />

            {/* Collections Display */}
            {isLoading ? (
                <div className="text-center py-8">
                    <p>Loading collections...</p>
                </div>
            ) : viewMode === 'list' ? (
                <CollectionTable
                    collections={collections}
                    selectedCollections={selectedCollections}
                    onSelectCollection={handleSelectCollection}
                    onSelectAll={handleSelectAll}
                    onEditCollection={handleEditCollection}
                    onDeleteCollection={handleDeleteCollection}
                />
            ) : (
                renderGridView()
            )}

            {collections.length === 0 && !isLoading && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No collections found matching your criteria.</p>
                    <Button
                        className="mt-4"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Collection
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            <EditCollectionDialog
                collection={editingCollection}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={() => {
                    setEditingCollection(null);
                    refetch();
                }}
            />
        </div>
    );
};
