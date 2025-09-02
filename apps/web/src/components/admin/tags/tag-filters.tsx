// components/admin/tags/tag-filters.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';

const TAG_CATEGORIES = [
    'industry',
    'skill',
    'experience',
    'style',
    'format',
    'specialization',
    'other'
];

interface TagFiltersProps {
    filters: any;
    onChange: (filters: any) => void;
    onReset: () => void;
    isLoading: boolean;
}

export const TagFilters: React.FC<TagFiltersProps> = ({
                                                          filters,
                                                          onChange,
                                                          onReset
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                        <Select
                            value={filters.category || "all"}
                            onValueChange={(value: string) =>
                                onChange({
                                    ...filters,
                                    category: value === "all" ? undefined : value
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {TAG_CATEGORIES.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Select
                            value={filters.isSystemTag?.toString() || "all"}
                            onValueChange={(value: string) =>
                                onChange({
                                    ...filters,
                                    isSystemTag: value === "all" ? undefined : value === "true"
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tag Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tags</SelectItem>
                                <SelectItem value="true">System Tags</SelectItem>
                                <SelectItem value="false">Custom Tags</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Select
                            value={filters.usageFilter || "all"}
                            onValueChange={(value: string) => {
                                let usageCondition;
                                switch (value) {
                                    case 'unused':
                                        usageCondition = { minUsage: 0, maxUsage: 0 };
                                        break;
                                    case 'low':
                                        usageCondition = { minUsage: 1, maxUsage: 10 };
                                        break;
                                    case 'high':
                                        usageCondition = { minUsage: 10 };
                                        break;
                                    default:
                                        usageCondition = undefined;
                                }
                                onChange({
                                    ...filters,
                                    usageFilter: value === "all" ? undefined : value,
                                    ...usageCondition
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Usage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Usage</SelectItem>
                                <SelectItem value="unused">Unused (0)</SelectItem>
                                <SelectItem value="low">Low Usage (1-10)</SelectItem>
                                <SelectItem value="high">High Usage (10+)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Select
                            value={filters.parentTagId || "all"}
                            onValueChange={(value: string) =>
                                onChange({
                                    ...filters,
                                    parentTagId: value === "all" ? undefined :
                                        value === "root" ? null : value
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Hierarchy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tags</SelectItem>
                                <SelectItem value="root">Root Tags</SelectItem>
                                <SelectItem value="child">Child Tags</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
