// components/admin/templates/panels/collections-panel.tsx
import React, { useState } from 'react';
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
    Minus,
    Search,
    Folder,
    Star,
    Crown,
    Users,
    CheckCircle2
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from '@/hooks/use-toast';
interface CollectionsPanelProps {
    templateId?: string;
}

export const CollectionsPanel: React.FC<CollectionsPanelProps> = ({ templateId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

    // Fetch all collections
    const { data: collectionsData } = trpc.admin.collections.getCollections.useQuery({
        search: searchTerm || undefined,
        limit: 100,
    });

    // Fetch current template's collections (only in edit mode)
    const { data: templateCollections, refetch: refetchTemplateCollections } =
        trpc.admin.collections.getTemplateCollections?.useQuery(
            { templateId: templateId! },
            { enabled: !!templateId }
        );

    const collections = collectionsData?.collections || [];
    const currentCollectionIds = templateCollections?.collections?.map(c => c.id) || [];

    // Mutations for adding/removing templates from collections
    const addToCollectionMutation = trpc.admin.collections.addTemplatesToCollection.useMutation({
        onSuccess: (data) => {
            toast({
                title: "Added to collections",
                description: `Template added to ${data.added} collection(s).`,
            });
            refetchTemplateCollections?.();
            setSelectedCollections([]);
        },
        onError: (error) => {
            toast({
                title: "Failed to add to collections",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const removeFromCollectionMutation = trpc.admin.collections.removeTemplatesFromCollection.useMutation({
        onSuccess: (data) => {
            toast({
                title: "Removed from collections",
                description: `Template removed from ${data.removed} collection(s).`,
            });
            refetchTemplateCollections?.();
        },
        onError: (error) => {
            toast({
                title: "Failed to remove from collections",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleAddToCollections = () => {
        if (!templateId || selectedCollections.length === 0) return;

        selectedCollections.forEach(collectionId => {
            if (!currentCollectionIds.includes(collectionId)) {
                addToCollectionMutation.mutate({
                    collectionId,
                    templateIds: [templateId],
                });
            }
        });
    };

    const handleRemoveFromCollection = (collectionId: string) => {
        if (!templateId) return;

        removeFromCollectionMutation.mutate({
            collectionId,
            templateIds: [templateId],
        });
    };

    const handleToggleCollection = (collectionId: string) => {
        setSelectedCollections(prev =>
            prev.includes(collectionId)
                ? prev.filter(id => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    const filteredCollections = collections.filter(collection =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!templateId) {
        return (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
                <div className="text-center">
                    <Folder className="h-8 w-8 mx-auto mb-2" />
                    <p>Collections can be managed after saving the template</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-h-full overflow-y-auto">
            {/* Current Collections */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Current Collections ({currentCollectionIds.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {currentCollectionIds.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <Folder className="h-6 w-6 mx-auto mb-2" />
                            <p>This template is not in any collections</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {templateCollections?.collections?.map((collection) => (
                                <div key={collection.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: collection.color || '#000000'}}
                                        >
                                            {collection.icon || <Folder className="h-4 w-4 text-white/80" />}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{collection.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                {collection.isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                                                {collection.isFeatured && <Star className="h-3 w-3 text-blue-500" />}
                                                <span className="text-xs text-muted-foreground">
                                                    {collection.templateCount} templates
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveFromCollection(collection.id)}
                                        disabled={removeFromCollectionMutation.isPending}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add to Collections */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Add to Collections</CardTitle>
                        {selectedCollections.length > 0 && (
                            <Button
                                onClick={handleAddToCollections}
                                disabled={addToCollectionMutation.isPending}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add to {selectedCollections.length} Collection(s)
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search collections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedCollections.length === filteredCollections.length && filteredCollections.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedCollections(
                                                        filteredCollections
                                                            .filter(c => !currentCollectionIds.includes(c.id))
                                                            .map(c => c.id)
                                                    );
                                                } else {
                                                    setSelectedCollections([]);
                                                }
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>Collection</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Templates</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCollections.map((collection) => {
                                    const isInCollection = currentCollectionIds.includes(collection.id);
                                    const isSelected = selectedCollections.includes(collection.id);

                                    return (
                                        <TableRow
                                            key={collection.id}
                                            className={`hover:bg-muted/50 ${isInCollection ? 'bg-green-50' : ''}`}
                                        >
                                            <TableCell>
                                                {isInCollection ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleToggleCollection(collection.id)}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded flex items-center justify-center"
                                                        style={{ backgroundColor: collection.color || '#000000'}}
                                                    >
                                                        {collection.icon || <Folder className="h-3 w-3 text-white/80" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{collection.name}</h4>
                                                        {collection.description && (
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                {collection.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant={collection.isActive ? 'default' : 'secondary'}>
                                                        {collection.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    {collection.isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                                                    {collection.isFeatured && <Star className="h-3 w-3 text-blue-500" />}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    <span className="text-sm">{collection.templateCount}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredCollections.length === 0 && searchTerm && (
                        <div className="text-center py-6 text-muted-foreground">
                            <p>No collections found matching "{searchTerm}"</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Collection Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Collection Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{collections.length}</div>
                            <div className="text-sm text-blue-800">Total Collections</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{currentCollectionIds.length}</div>
                            <div className="text-sm text-green-800">In Collections</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {collections.filter(c => c.isFeatured).length}
                            </div>
                            <div className="text-sm text-purple-800">Featured</div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                                {collections.filter(c => c.isPremium).length}
                            </div>
                            <div className="text-sm text-orange-800">Premium</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
