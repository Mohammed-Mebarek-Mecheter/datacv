// components/admin/templates/panels/sample-content-panel.tsx
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Link2,
    Unlink,
    Search,
    FileText,
    Plus,
    AlertCircle
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from '@/hooks/use-toast';

interface SampleContent {
    id: string;
    contentType: string;
    content: any;
    targetIndustry?: string[];
    targetSpecialization?: string[];
    experienceLevel?: string;
    tags?: string[];
}

// 🔹 Extracted helper to avoid duplication
const isMatchingSection = (sectionType: string, contentType: string): boolean => {
    if (sectionType === contentType) return true;

    const validTypes = ["summary", "experience", "education", "skills", "projects"];
    return validTypes.includes(contentType) && sectionType === contentType;
};

export const SampleContentPanel: React.FC = () => {
    const form = useFormContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [contentTypeFilter, setContentTypeFilter] = useState<string>('');
    const [selectedContent, setSelectedContent] = useState<string[]>([]);

    // Get template's target audience for filtering
    const templateData = form.getValues();
    const targetIndustry = templateData.targetIndustries?.[0];
    const targetSpecialization = templateData.targetSpecialization?.[0];
    const experienceLevel = templateData.targetExperienceLevel;

    // Fetch sample content
    const { data: sampleContentData } = trpc.admin.sampleContent.getForTemplatePreview.useQuery({
        targetIndustry,
        targetSpecialization,
        experienceLevel,
        contentTypes: contentTypeFilter ? [contentTypeFilter] : undefined,
    });

    // Get current sample content mappings
    const currentMappings = form.watch('specificSampleContentMap') || {};
    const templateSections = form.watch('templateStructure.sections') || [];

    const handleLinkContent = (sectionId: string, contentId: string) => {
        const currentSectionMappings = currentMappings[sectionId] || [];
        const updatedMappings = {
            ...currentMappings,
            [sectionId]: [...currentSectionMappings, contentId]
        };
        form.setValue('specificSampleContentMap', updatedMappings, { shouldDirty: true });

        toast({
            title: "Sample content linked",
            description: "Sample content has been linked to the section.",
        });
    };

    const handleUnlinkContent = (sectionId: string, contentId: string) => {
        const currentSectionMappings = currentMappings[sectionId] || [];
        const updatedMappings = {
            ...currentMappings,
            [sectionId]: currentSectionMappings.filter((id: string) => id !== contentId)
        };
        form.setValue('specificSampleContentMap', updatedMappings, { shouldDirty: true });

        toast({
            title: "Sample content unlinked",
            description: "Sample content has been unlinked from the section.",
        });
    };

    const handleBulkLink = () => {
        if (selectedContent.length === 0) return;

        // Auto-link based on content type matching
        const newMappings = { ...currentMappings };

        selectedContent.forEach(contentId => {
            const content = Object.values(sampleContentData?.data || {})
                .flat()
                .find((c: any) => c.id === contentId);

            if (content) {
                const matchingSection = templateSections.find((section: any) =>
                    isMatchingSection(section.type, content.contentType)
                );

                if (matchingSection) {
                    const sectionMappings = newMappings[matchingSection.id] || [];
                    if (!sectionMappings.includes(contentId)) {
                        newMappings[matchingSection.id] = [...sectionMappings, contentId];
                    }
                }
            }
        });

        form.setValue('specificSampleContentMap', newMappings, { shouldDirty: true });
        setSelectedContent([]);

        toast({
            title: "Sample content linked",
            description: `${selectedContent.length} content items have been auto-linked to matching sections.`,
        });
    };

    const allSampleContent = Object.values(sampleContentData?.data || {}).flat() as SampleContent[];
    const filteredContent = allSampleContent.filter(content => {
        const matchesSearch = !searchTerm ||
            content.contentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof content.content === 'string' && content.content.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = !contentTypeFilter || content.contentType === contentTypeFilter;

        return matchesSearch && matchesType;
    });

    const contentTypes = [...new Set(allSampleContent.map(c => c.contentType))];
    const totalLinked = Object.values(currentMappings).reduce((sum: number, mappings: any) =>
        sum + (Array.isArray(mappings) ? mappings.length : 0), 0
    );

    return (
        <div className="space-y-6 max-h-full overflow-y-auto">
            {/* Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-blue-500" />
                        Sample Content Linking
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{allSampleContent.length}</div>
                            <div className="text-sm text-blue-800">Available Content</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{totalLinked}</div>
                            <div className="text-sm text-green-800">Linked Content</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{templateSections.length}</div>
                            <div className="text-sm text-purple-800">Template Sections</div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{contentTypes.length}</div>
                            <div className="text-sm text-orange-800">Content Types</div>
                        </div>
                    </div>

                    {templateData.targetIndustries?.length === 0 && templateData.targetSpecialization?.length === 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <p className="text-sm text-yellow-800">
                                    Consider setting target industries and specializations in Basic Info for more relevant sample content suggestions.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Current Section Mappings */}
            <Card>
                <CardHeader>
                    <CardTitle>Section Mappings</CardTitle>
                </CardHeader>
                <CardContent>
                    {templateSections.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <FileText className="h-6 w-6 mx-auto mb-2" />
                            <p>Configure template structure first to manage sample content</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {templateSections.map((section: any) => {
                                const sectionMappings = currentMappings[section.id] || [];
                                const linkedContent = sectionMappings.map((contentId: string) =>
                                    allSampleContent.find(c => c.id === contentId)
                                ).filter(Boolean);

                                return (
                                    <div key={section.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-medium">{section.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Type: {section.type} • {linkedContent.length} linked content(s)
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                {section.type}
                                            </Badge>
                                        </div>

                                        {linkedContent.length > 0 ? (
                                            <div className="space-y-2">
                                                {linkedContent.map((content: any) => (
                                                    <div key={content.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{content.contentType}</p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {typeof content.content === 'string'
                                                                    ? content.content.substring(0, 100) + '...'
                                                                    : JSON.stringify(content.content).substring(0, 100) + '...'
                                                                }
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleUnlinkContent(section.id, content.id)}
                                                        >
                                                            <Unlink className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-3 text-muted-foreground text-sm">
                                                No sample content linked to this section
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Available Sample Content */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Available Sample Content</CardTitle>
                        {selectedContent.length > 0 && (
                            <Button onClick={handleBulkLink}>
                                <Plus className="h-4 w-4 mr-2" />
                                Auto-Link {selectedContent.length} Content(s)
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search sample content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={contentTypeFilter}
                            onValueChange={setContentTypeFilter}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All content types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">All Types</SelectItem>
                                {contentTypes.map(type => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace('_', ' ').toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedContent.length === filteredContent.length && filteredContent.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedContent(filteredContent.map(c => c.id));
                                                } else {
                                                    setSelectedContent([]);
                                                }
                                            }}
                                            className="rounded"
                                        />
                                    </TableHead>
                                    <TableHead>Content</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Targeting</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContent.map((content) => {
                                    const isLinked = Object.values(currentMappings).some((mappings: any) =>
                                        Array.isArray(mappings) && mappings.includes(content.id)
                                    );

                                    const matchingSections = templateSections.filter((section: any) =>
                                        isMatchingSection(section.type, content.contentType)
                                    );

                                    return (
                                        <TableRow key={content.id} className={`hover:bg-muted/50 ${isLinked ? 'bg-green-50' : ''}`}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContent.includes(content.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedContent(prev => [...prev, content.id]);
                                                        } else {
                                                            setSelectedContent(prev => prev.filter(id => id !== content.id));
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-md">
                                                    <p className="text-sm font-medium truncate">
                                                        {typeof content.content === 'string'
                                                            ? content.content.substring(0, 100)
                                                            : JSON.stringify(content.content).substring(0, 100)
                                                        }
                                                        {(typeof content.content === 'string' ? content.content : JSON.stringify(content.content)).length > 100 && '...'}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {content.tags?.slice(0, 2).map(tag => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {content.tags && content.tags.length > 2 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                +{content.tags.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {content.contentType.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {content.experienceLevel && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {content.experienceLevel}
                                                        </Badge>
                                                    )}
                                                    {content.targetIndustry?.slice(0, 2).map(industry => (
                                                        <Badge key={industry} variant="outline" className="text-xs">
                                                            {industry}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {isLinked ? (
                                                        <Badge variant="default" className="text-xs">
                                                            <Link2 className="h-2 w-2 mr-1" />
                                                            Linked
                                                        </Badge>
                                                    ) : matchingSections.length > 0 ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleLinkContent(matchingSections[0].id, content.id)}
                                                        >
                                                            <Link2 className="h-3 w-3 mr-1" />
                                                            Link to {matchingSections[0].name}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            No matching sections
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredContent.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                            {searchTerm || contentTypeFilter ? (
                                <p>No sample content found matching your filters</p>
                            ) : (
                                <p>No sample content available for this template's target audience</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Manual Section Linking */}
            <Card>
                <CardHeader>
                    <CardTitle>Manual Section Linking</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templateSections.map((section: any) => (
                            <div key={section.id} className="border rounded-lg p-3">
                                <h4 className="font-medium mb-2">{section.name}</h4>
                                <div className="space-y-2">
                                    {allSampleContent
                                        .filter(content => isMatchingSection(section.type, content.contentType))
                                        .slice(0, 3)
                                        .map(content => {
                                            const isLinked = (currentMappings[section.id] || []).includes(content.id);
                                            return (
                                                <div key={content.id} className="flex items-center justify-between text-sm">
                                                    <span className="truncate flex-1">
                                                        {typeof content.content === 'string'
                                                            ? content.content.substring(0, 50) + '...'
                                                            : 'Structured content'
                                                        }
                                                    </span>
                                                    <Button
                                                        variant={isLinked ? "destructive" : "outline"}
                                                        size="sm"
                                                        onClick={() =>
                                                            isLinked
                                                                ? handleUnlinkContent(section.id, content.id)
                                                                : handleLinkContent(section.id, content.id)
                                                        }
                                                    >
                                                        {isLinked ? <Unlink className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
