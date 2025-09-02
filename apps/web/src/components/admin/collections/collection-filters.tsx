// components/admin/collections/collection-filters.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";

export interface CollectionFilterState {
    isActive?: boolean;
    isFeatured?: boolean;
    isPremium?: boolean;
    isCurated?: boolean;
    parentCollectionId?: string;
}

interface CollectionFiltersProps {
    filters: CollectionFilterState;
    onChange: (filters: CollectionFilterState) => void;
    onReset: () => void;
    isLoading: boolean;
}

export const CollectionFilters: React.FC<CollectionFiltersProps> = ({
                                                                        filters,
                                                                        onChange,
                                                                        onReset,
                                                                    }) => {
    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={onReset}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Active */}
                    <div>
                        <Select
                            value={filters.isActive?.toString() || "all"}
                            onValueChange={(value: string) =>
                                onChange({
                                    ...filters,
                                    isActive: value === "all" ? undefined : value === "true",
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Featured */}
                    <div>
                        <Select
                            value={filters.isFeatured?.toString() || "all"}
                            onValueChange={(value: string) =>
                                onChange({
                                    ...filters,
                                    isFeatured: value === "all" ? undefined : value === "true",
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Featured" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Collections</SelectItem>
                                <SelectItem value="true">Featured Only</SelectItem>
                                <SelectItem value="false">Not Featured</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Premium */}
                    <div>
                        <Select
                            value={filters.isPremium?.toString() || "all"}
                            onValueChange={(value: string) =>
                                onChange({
                                    ...filters,
                                    isPremium: value === "all" ? undefined : value === "true",
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Premium" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Collections</SelectItem>
                                <SelectItem value="true">Premium Only</SelectItem>
                                <SelectItem value="false">Free Collections</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Curated */}
                    <div>
                        <Select
                            value={filters.isCurated?.toString() || "all"}
                            onValueChange={(value: string) =>
                                onChange({
                                    ...filters,
                                    isCurated: value === "all" ? undefined : value === "true",
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Curation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Collections</SelectItem>
                                <SelectItem value="true">Curated Only</SelectItem>
                                <SelectItem value="false">Not Curated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Parent Collection */}
                    <div>
                        <Select
                            value={filters.parentCollectionId || "all"}
                            onValueChange={(value: string) =>
                                onChange({
                                    ...filters,
                                    parentCollectionId: value === "all" ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Parent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Collections</SelectItem>
                                <SelectItem value="root">Root Collections</SelectItem>
                                <SelectItem value="child">Child Collections</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
