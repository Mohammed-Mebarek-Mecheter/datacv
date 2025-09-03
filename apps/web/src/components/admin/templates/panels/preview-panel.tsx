// components/admin/templates/panels/preview-panel.tsx
import {
    Download,
    Eye,
    Maximize2,
    Monitor,
    Printer,
    RefreshCw,
    Smartphone,
    User,
    Briefcase,
    GraduationCap,
    Wrench,
    FolderOpen,
    Award,
    BookOpen,
    Link,
    FileText,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PreviewPanelProps {
    templateData: any;
}

// Icon mapping for sections
const sectionIcons: Record<string, React.ComponentType<any>> = {
    personal_info: User,
    summary: FileText,
    experience: Briefcase,
    education: GraduationCap,
    skills: Wrench,
    projects: FolderOpen,
    certifications: Award,
    publications: BookOpen,
    achievements: Award,
    references: Link,
    custom: FileText,
};

// Sample content data structure
interface SampleContentItem {
    id: string;
    content: any;
    contentType: string;
    title?: string;
    description?: string;
    targetIndustry?: string[];
    targetSpecialization?: string[];
    experienceLevel?: string;
    tags?: string[];
}

// Sample content data
const sampleContentData: Record<string, SampleContentItem[]> = {
    personal_info: [
        {
            id: "pi-1",
            contentType: "personal_info",
            content: {
                firstName: "Alex",
                lastName: "Johnson",
                email: "alex.johnson@example.com",
                phone: "+1 (555) 123-4567",
                location: "San Francisco, CA",
                linkedIn: "linkedin.com/in/alexjohnson",
                github: "github.com/alexjohnson",
            },
        },
    ],
    summary: [
        {
            id: "sum-1",
            contentType: "summary",
            content: {
                content:
                    "Results-driven data scientist with 5+ years of experience in machine learning and statistical analysis. Proven track record of delivering actionable insights that drive business growth. Expert in Python, R, and cloud platforms.",
                style: "narrative",
                focusAreas: ["Machine Learning", "Data Visualization", "Predictive Modeling"],
            },
        },
    ],
    experience: [
        {
            id: "exp-1",
            contentType: "experience",
            content: {
                company: "Tech Innovations Inc.",
                position: "Senior Data Scientist",
                location: "San Francisco, CA",
                startDate: "2020-01-01",
                endDate: null,
                isCurrentRole: true,
                achievements: [
                    {
                        description:
                            "Developed ML models that improved customer retention by 23%",
                        metrics: ["23% improvement in retention", "$2M annual savings"],
                    },
                    {
                        description:
                            "Led a team of 4 data scientists on a predictive analytics project",
                        technologiesUsed: ["Python", "TensorFlow", "Spark"],
                    },
                ],
                primaryTechnologies: ["Python", "SQL", "AWS", "TensorFlow"],
            },
        },
        {
            id: "exp-2",
            contentType: "experience",
            content: {
                company: "Data Insights LLC",
                position: "Data Analyst",
                location: "New York, NY",
                startDate: "2018-03-01",
                endDate: "2019-12-31",
                isCurrentRole: false,
                achievements: [
                    {
                        description:
                            "Created automated reporting system reducing manual work by 40%",
                        metrics: ["40% time savings", "99% accuracy improvement"],
                    },
                ],
                primaryTechnologies: ["SQL", "Tableau", "Excel"],
            },
        },
    ],
    education: [
        {
            id: "edu-1",
            contentType: "education",
            content: {
                institution: "Stanford University",
                degree: "M.S. in Data Science",
                fieldOfStudy: "Statistics and Machine Learning",
                startDate: "2016-09-01",
                endDate: "2018-05-01",
                gpa: "3.8",
                honors: "Magna Cum Laude",
            },
        },
    ],
    skills: [
        {
            id: "skl-1",
            contentType: "skills",
            content: {
                name: "Machine Learning",
                category: "Technical",
                proficiency: "expert",
                yearsOfExperience: 5,
                projects: ["Customer Churn Prediction", "Recommendation Engine"],
            },
        },
        {
            id: "skl-2",
            contentType: "skills",
            content: {
                name: "Python",
                category: "Programming",
                proficiency: "expert",
                yearsOfExperience: 6,
            },
        },
        {
            id: "skl-3",
            contentType: "skills",
            content: {
                name: "Data Visualization",
                category: "Technical",
                proficiency: "advanced",
                yearsOfExperience: 4,
                tools: ["Tableau", "D3.js", "Power BI"],
            },
        },
    ],
    projects: [
        {
            id: "prj-1",
            contentType: "projects",
            content: {
                name: "Customer Churn Prediction Model",
                description:
                    "Built ensemble model achieving 94% accuracy, reducing churn by 15% and saving $2M annually in retention costs.",
                type: "Machine Learning",
                technologiesUsed: ["Python", "Scikit-learn", "Pandas", "AWS"],
                businessProblem:
                    "High customer churn rate affecting revenue stability",
                solution:
                    "Developed predictive model to identify at-risk customers and implemented targeted retention campaigns",
                keyMetrics: ["94% accuracy", "15% churn reduction", "$2M annual savings"],
            },
        },
    ],
    certifications: [
        {
            id: "cert-1",
            contentType: "certifications",
            content: {
                name: "AWS Certified Machine Learning",
                issuer: "Amazon Web Services",
                issueDate: "2021-06-01",
                expiryDate: "2024-06-01",
                credentialId: "AWS-ML-12345",
            },
        },
    ],
    publications: [
        {
            id: "pub-1",
            contentType: "publications",
            content: {
                title:
                    "Advancements in Predictive Analytics for Customer Behavior Modeling",
                publication: "Journal of Data Science",
                date: "2022-03-15",
                authors: ["Alex Johnson", "Maria Garcia"],
                link: "https://jds.example.com/predictive-analytics",
            },
        },
    ],
    achievements: [
        {
            id: "ach-1",
            contentType: "achievements",
            content: {
                title: "Innovation Award",
                organization: "Tech Innovations Inc.",
                date: "2021-12-01",
                description:
                    "Recognized for outstanding contribution to the development of the customer analytics platform",
            },
        },
    ],
    references: [
        {
            id: "ref-1",
            contentType: "references",
            content: {
                name: "Sarah Williams",
                position: "Director of Data Science",
                company: "Tech Innovations Inc.",
                email: "s.williams@techinnovations.com",
                phone: "+1 (555) 987-6543",
                relationship: "Direct Supervisor",
            },
        },
    ],
};

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ templateData }) => {
    const [previewMode, setPreviewMode] = React.useState<
        "desktop" | "mobile" | "print"
    >("desktop");
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [refreshKey, setRefreshKey] = React.useState(0);

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const handleExport = (format: "pdf" | "png") => {
        // Implementation would connect to export service
        console.log(`Exporting as ${format}`, templateData);
    };

    // Get sample content for a section type
    const getSampleContent = (sectionType: string) => {
        // Check if specific content is mapped for this section
        if (templateData?.specificSampleContentMap) {
            const sectionMappings = templateData.specificSampleContentMap[sectionType];
            if (sectionMappings && Array.isArray(sectionMappings)) {
                // Return first mapped content if available
                const contentId = sectionMappings[0];
                for (const contentType in sampleContentData) {
                    const contentItems = sampleContentData[contentType];
                    const found = contentItems.find(item => item.id === contentId);
                    if (found) return [found];
                }
            }
        }

        // Return default sample content for the section type
        return sampleContentData[sectionType] || [];
    };

    const renderPreview = () => {
        if (!templateData) {
            return (
                <div className="flex h-96 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <Eye className="mx-auto mb-2 h-8 w-8" />
                        <p>Preview will appear here</p>
                        <p className="text-sm">
                            Configure template structure and design to see preview
                        </p>
                    </div>
                </div>
            );
        }

        const { templateStructure, designConfig } = templateData;

        // Determine layout classes based on preview mode
        let layoutClasses = "";
        if (previewMode === "mobile") {
            layoutClasses = "mx-auto max-w-sm";
        } else if (previewMode === "print") {
            layoutClasses = "mx-auto max-w-[8.5in]";
        } else {
            layoutClasses = "w-full";
        }

        // Apply design configuration
        const containerStyle: React.CSSProperties = {
            fontFamily: designConfig?.typography?.fontFamily || "Inter",
            fontSize: `${designConfig?.typography?.baseFontSize || 12}pt`,
            lineHeight: designConfig?.typography?.lineHeight || 1.5,
            color: designConfig?.colors?.text || "#000000",
            backgroundColor: designConfig?.colors?.background || "#ffffff",
        };

        // Apply spacing
        const baseUnit = designConfig?.spacing?.baseUnit || 4;
        const sectionSpacing = designConfig?.spacing?.sectionSpacing || 16;

        return (
            <div
                key={refreshKey}
                className={`rounded-lg border bg-white transition-all duration-300 ${layoutClasses}`}
                style={containerStyle}
            >
                {/* Resume Content Container */}
                <div
                    className="p-6"
                    style={{
                        paddingTop: `${designConfig?.spacing?.pageMargins?.top || 72}px`,
                        paddingBottom: `${designConfig?.spacing?.pageMargins?.bottom || 72}px`,
                        paddingLeft: `${designConfig?.spacing?.pageMargins?.left || 72}px`,
                        paddingRight: `${designConfig?.spacing?.pageMargins?.right || 72}px`,
                    }}
                >
                    {/* Header */}
                    <div
                        className={`text-center ${
                            templateStructure?.layout?.headerStyle === "prominent"
                                ? "pb-6"
                                : templateStructure?.layout?.headerStyle === "minimal"
                                    ? "pb-2"
                                    : "pb-4"
                        }`}
                        style={{
                            marginBottom: `${sectionSpacing}px`,
                        }}
                    >
                        <h1
                            className="mb-1 font-bold text-2xl"
                            style={{
                                color: designConfig?.colors?.headings || designConfig?.colors?.primary || "#000000",
                                fontFamily:
                                    designConfig?.typography?.headingFontFamily ||
                                    designConfig?.typography?.fontFamily ||
                                    "Inter",
                                fontWeight: designConfig?.typography?.fontWeights?.bold || 700,
                            }}
                        >
                            Alex Johnson
                        </h1>
                        <p
                            className="text-lg"
                            style={{
                                color: designConfig?.colors?.textSecondary || designConfig?.colors?.secondary || "#666666",
                                fontWeight: designConfig?.typography?.fontWeights?.medium || 500,
                            }}
                        >
                            Senior Data Scientist
                        </p>
                        <p className="text-sm mt-1">
                            alex.johnson@example.com • +1 (555) 123-4567 • San Francisco, CA
                        </p>
                    </div>

                    {/* Sections Layout */}
                    {templateStructure?.layout?.style === "two_column_left" ||
                    templateStructure?.layout?.style === "two_column_right" ||
                    templateStructure?.layout?.style === "two_column_balanced" ? (
                        <div
                            className="grid grid-cols-1 gap-6 md:grid-cols-2"
                            style={{
                                gap: `${baseUnit * 4}px`,
                                gridTemplateColumns: templateStructure?.layout?.columnWidths
                                    ? `${templateStructure.layout.columnWidths[0]}fr ${templateStructure.layout.columnWidths[1]}fr`
                                    : "1fr 1fr"
                            }}
                        >
                            <div className="space-y-4">
                                {templateStructure.sections
                                    ?.filter((_: any, index: number) => index % 2 === (templateStructure?.layout?.style === "two_column_right" ? 1 : 0))
                                    ?.map((section: any, index: number) =>
                                        renderSection(section, index, designConfig),
                                    )}
                            </div>
                            <div className="space-y-4">
                                {templateStructure.sections
                                    ?.filter((_: any, index: number) => index % 2 === (templateStructure?.layout?.style === "two_column_right" ? 0 : 1))
                                    ?.map((section: any, index: number) =>
                                        renderSection(section, index, designConfig),
                                    )}
                            </div>
                        </div>
                    ) : templateStructure?.layout?.style === "single_column" ? (
                        <div
                            className="space-y-4"
                            style={{ gap: `${sectionSpacing}px` }}
                        >
                            {templateStructure?.sections?.map((section: any, index: number) =>
                                renderSection(section, index, designConfig),
                            )}
                        </div>
                    ) : (
                        // Default to single column for other layouts
                        <div
                            className="space-y-4"
                            style={{ gap: `${sectionSpacing}px` }}
                        >
                            {templateStructure?.sections?.map((section: any, index: number) =>
                                renderSection(section, index, designConfig),
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSection = (section: any, index: number, designConfig: any) => {
        const sectionSpacing = designConfig?.spacing?.sectionSpacing || 16;
        const baseUnit = designConfig?.spacing?.baseUnit || 4;

        // Get section icon
        const SectionIcon = sectionIcons[section.type] || FileText;

        // Get sample content for this section
        const sampleContents = getSampleContent(section.type);

        // Apply section-specific styling
        const sectionStyle: React.CSSProperties = {
            marginBottom: `${sectionSpacing}px`,
            padding: designConfig?.layout?.sectionPadding ? `${designConfig.layout.sectionPadding}px` : undefined,
            backgroundColor: designConfig?.colors?.surface ? designConfig.colors.surface : undefined,
            borderRadius: designConfig?.borders?.radius ? `${designConfig.borders.radius}px` : undefined,
        };

        return (
            <div key={section.id} style={sectionStyle}>
                <h2
                    className="mb-2 pb-1 font-semibold flex items-center gap-2"
                    style={{
                        color: designConfig?.colors?.headings || designConfig?.colors?.primary || "#000000",
                        fontFamily:
                            designConfig?.typography?.headingFontFamily ||
                            designConfig?.typography?.fontFamily ||
                            "Inter",
                        fontWeight: designConfig?.typography?.fontWeights?.bold || 700,
                        fontSize: `${(designConfig?.typography?.baseFontSize || 12) * 1.2}pt`,
                        borderBottom: designConfig?.borders?.headerUnderline
                            ? `${designConfig?.borders?.width || 1}px ${designConfig?.borders?.style || "solid"} ${designConfig?.colors?.border || designConfig?.colors?.primary || "#000000"}`
                            : designConfig?.borders?.sectionDividers
                                ? `${designConfig?.borders?.width || 1}px ${designConfig?.borders?.style || "solid"} ${designConfig?.colors?.border || "#e5e7eb"}`
                                : "none",
                        paddingBottom: designConfig?.borders?.headerUnderline ? `${baseUnit}px` : undefined,
                    }}
                >
                    {designConfig?.icons?.sectionIcons && <SectionIcon className="h-4 w-4" />}
                    {section.name}
                </h2>

                <div
                    className="space-y-3"
                    style={{
                        gap: `${designConfig?.spacing?.itemSpacing || 8}px`
                    }}
                >
                    {sampleContents.length > 0 ? (
                        sampleContents.map((sampleItem) => (
                            <div key={sampleItem.id}>
                                {section.type === "personal_info" && (
                                    <div className="space-y-1">
                                        <p className="font-medium">{sampleItem.content.firstName} {sampleItem.content.lastName}</p>
                                        <p className="text-sm">{sampleItem.content.email} • {sampleItem.content.phone}</p>
                                        <p className="text-sm">{sampleItem.content.location}</p>
                                        {sampleItem.content.linkedIn && (
                                            <p className="text-sm text-blue-600">linkedin.com/in/{sampleItem.content.linkedIn}</p>
                                        )}
                                    </div>
                                )}

                                {section.type === "summary" && (
                                    <p className="text-sm">
                                        {sampleItem.content.content}
                                    </p>
                                )}

                                {section.type === "experience" && (
                                    <div>
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-medium">{sampleItem.content.position}</h3>
                                                <p
                                                    style={{
                                                        color: designConfig?.colors?.textSecondary || designConfig?.colors?.secondary || "#666666",
                                                    }}
                                                >
                                                    {sampleItem.content.company} • {sampleItem.content.location}
                                                </p>
                                            </div>
                                            <span className="text-sm whitespace-nowrap">
												{new Date(sampleItem.content.startDate).getFullYear()} - {
                                                sampleItem.content.isCurrentRole
                                                    ? "Present"
                                                    : new Date(sampleItem.content.endDate).getFullYear()
                                            }
											</span>
                                        </div>
                                        <ul className="mt-2 space-y-1 text-sm">
                                            {sampleItem.content.achievements.map((achievement: any, i: number) => (
                                                <li key={i} className="flex items-start gap-1">
                                                    <span>•</span>
                                                    <span>{achievement.description}</span>
                                                    {achievement.metrics && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {achievement.metrics.map((metric: string, j: number) => (
                                                                <Badge key={j} variant="secondary" className="text-xs">
                                                                    {metric}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                        {sampleItem.content.primaryTechnologies && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {sampleItem.content.primaryTechnologies.map((tech: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {section.type === "education" && (
                                    <div>
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-medium">{sampleItem.content.degree}</h3>
                                                <p
                                                    style={{
                                                        color: designConfig?.colors?.textSecondary || designConfig?.colors?.secondary || "#666666",
                                                    }}
                                                >
                                                    {sampleItem.content.institution}
                                                </p>
                                                {sampleItem.content.fieldOfStudy && (
                                                    <p className="text-sm">{sampleItem.content.fieldOfStudy}</p>
                                                )}
                                            </div>
                                            <span className="text-sm whitespace-nowrap">
												{new Date(sampleItem.content.startDate).getFullYear()} - {
                                                new Date(sampleItem.content.endDate).getFullYear()
                                            }
											</span>
                                        </div>
                                        {sampleItem.content.gpa && (
                                            <p className="text-sm mt-1">GPA: {sampleItem.content.gpa} {sampleItem.content.honors && `(${sampleItem.content.honors})`}</p>
                                        )}
                                    </div>
                                )}

                                {section.type === "skills" && (
                                    <div className="flex flex-wrap gap-2">
                                        {sampleContents.map((skillItem, i) => (
                                            <span
                                                key={skillItem.id}
                                                className="rounded px-2 py-1 text-sm"
                                                style={{
                                                    backgroundColor: designConfig?.colors?.surfaceSecondary || "#f3f4f6",
                                                    color: designConfig?.colors?.text || "#000000",
                                                }}
                                            >
												{skillItem.content.name}
											</span>
                                        ))}
                                    </div>
                                )}

                                {section.type === "projects" && (
                                    <div>
                                        <h3 className="font-medium">{sampleItem.content.name}</h3>
                                        <p className="mt-1 text-sm">
                                            {sampleItem.content.description}
                                        </p>
                                        {sampleItem.content.keyMetrics && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {sampleItem.content.keyMetrics.map((metric: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {metric}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        {sampleItem.content.technologiesUsed && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {sampleItem.content.technologiesUsed.map((tech: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {section.type === "certifications" && (
                                    <div>
                                        <h3 className="font-medium">{sampleItem.content.name}</h3>
                                        <p
                                            style={{
                                                color: designConfig?.colors?.textSecondary || designConfig?.colors?.secondary || "#666666",
                                            }}
                                        >
                                            {sampleItem.content.issuer}
                                        </p>
                                        {sampleItem.content.issueDate && (
                                            <p className="text-sm mt-1">
                                                Issued: {new Date(sampleItem.content.issueDate).toLocaleDateString()}
                                                {sampleItem.content.expiryDate && ` • Expires: ${new Date(sampleItem.content.expiryDate).toLocaleDateString()}`}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {section.type === "publications" && (
                                    <div>
                                        <h3 className="font-medium">{sampleItem.content.title}</h3>
                                        <p
                                            style={{
                                                color: designConfig?.colors?.textSecondary || designConfig?.colors?.secondary || "#666666",
                                            }}
                                        >
                                            {sampleItem.content.publication}
                                        </p>
                                        <p className="text-sm mt-1">
                                            {new Date(sampleItem.content.date).toLocaleDateString()} • {sampleItem.content.authors.join(", ")}
                                        </p>
                                        {sampleItem.content.link && (
                                            <a
                                                href={sampleItem.content.link}
                                                className="text-sm text-blue-600 hover:underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Publication
                                            </a>
                                        )}
                                    </div>
                                )}

                                {section.type === "achievements" && (
                                    <div>
                                        <h3 className="font-medium">{sampleItem.content.title}</h3>
                                        <p
                                            style={{
                                                color: designConfig?.colors?.textSecondary || designConfig?.colors?.secondary || "#666666",
                                            }}
                                        >
                                            {sampleItem.content.organization}
                                        </p>
                                        <p className="text-sm mt-1">
                                            {new Date(sampleItem.content.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm mt-1">
                                            {sampleItem.content.description}
                                        </p>
                                    </div>
                                )}

                                {section.type === "references" && (
                                    <div>
                                        <h3 className="font-medium">{sampleItem.content.name}</h3>
                                        <p
                                            style={{
                                                color: designConfig?.colors?.textSecondary || designConfig?.colors?.secondary || "#666666",
                                            }}
                                        >
                                            {sampleItem.content.position}, {sampleItem.content.company}
                                        </p>
                                        <p className="text-sm mt-1">
                                            {sampleItem.content.email} • {sampleItem.content.phone}
                                        </p>
                                        <p className="text-sm">
                                            Relationship: {sampleItem.content.relationship}
                                        </p>
                                    </div>
                                )}

                                {section.type === "custom" && (
                                    <div
                                        className="rounded-lg p-3"
                                        style={{
                                            backgroundColor: designConfig?.colors?.surface || "#f9fafb",
                                            border: designConfig?.borders?.sectionBorders
                                                ? `${designConfig?.borders?.width || 1}px ${designConfig?.borders?.style || "solid"} ${designConfig?.colors?.border || "#e5e7eb"}`
                                                : undefined,
                                        }}
                                    >
                                        <p className="text-muted-foreground text-sm">
                                            Custom section:{" "}
                                            {section.description || "User-defined content will appear here"}
                                        </p>
                                        {sampleItem.content && (
                                            <div className="mt-2 text-sm">
                                                {typeof sampleItem.content === 'string' ? (
                                                    <p>{sampleItem.content}</p>
                                                ) : (
                                                    <pre className="whitespace-pre-wrap">
														{JSON.stringify(sampleItem.content, null, 2)}
													</pre>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-muted-foreground text-sm">
                            No sample content available for this section type
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full flex-col">
            {/* Preview Controls */}
            <Card className="mb-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Template Preview
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleRefresh}>
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                            >
                                <Maximize2 className="mr-1 h-3 w-3" />
                                {isFullscreen ? "Exit" : "Fullscreen"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Preview Mode Selector */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant={previewMode === "desktop" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPreviewMode("desktop")}
                            >
                                <Monitor className="mr-1 h-4 w-4" />
                                Desktop
                            </Button>
                            <Button
                                variant={previewMode === "mobile" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPreviewMode("mobile")}
                            >
                                <Smartphone className="mr-1 h-4 w-4" />
                                Mobile
                            </Button>
                            <Button
                                variant={previewMode === "print" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPreviewMode("print")}
                            >
                                <Printer className="mr-1 h-4 w-4" />
                                Print
                            </Button>
                        </div>

                        {/* Export Options */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport("pdf")}
                            >
                                <Download className="mr-1 h-4 w-4" />
                                Export PDF
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport("png")}
                            >
                                <Download className="mr-1 h-4 w-4" />
                                Export PNG
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Template Info */}
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                            <span>Category:</span>
                            <Badge variant="outline">{templateData?.category}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Type:</span>
                            <Badge variant="outline">{templateData?.documentType}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Sections:</span>
                            <Badge variant="outline">
                                {templateData?.templateStructure?.sections?.length || 0}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Layout:</span>
                            <Badge variant="outline">
                                {templateData?.templateStructure?.layout?.style?.replace('_', ' ') || 'single_column'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Columns:</span>
                            <Badge variant="outline">
                                {templateData?.templateStructure?.layout?.columns || 1}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Container */}
            <div
                className={`flex-1 overflow-auto ${isFullscreen ? "fixed inset-0 z-50 bg-white p-4" : ""}`}
            >
                <div className="flex h-full w-full items-start justify-center">
                    {renderPreview()}
                </div>
            </div>
        </div>
    );
};
