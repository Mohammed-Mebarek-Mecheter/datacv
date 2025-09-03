// apps/server/src/routers/documents/schemas.ts
import { z } from "zod";
import type {
    DataIndustry,
    DataProjectType,
    DataSkillCategory,
    DataSpecialization,
    ExperienceLevel,
} from "@/lib/data-ai";

// Common personal info schemas
export const resumePersonalInfoSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedIn: z.url().optional(),
    github: z.url().optional(),
    portfolio: z.url().optional(),
    website: z.url().optional(),
    twitter: z.string().optional(),
    stackoverflow: z.url().optional(),
    medium: z.url().optional(),
    kaggle: z.url().optional(),
    tagline: z.string().optional(),
    professionalPhoto: z.url().optional(),
});

export const cvPersonalInfoSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    phone: z.string().optional(),
    institutionAddress: z.object({
        institution: z.string(),
        department: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
    homeAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
    linkedIn: z.url().optional(),
    googleScholar: z.url().optional(),
    orcid: z.string().optional(),
    researchGate: z.url().optional(),
    academiaEdu: z.url().optional(),
    personalWebsite: z.url().optional(),
    professionalTitle: z.string().optional(),
    credentials: z.array(z.string()).default([]),
    citizenship: z.string().optional(),
    workAuthorization: z.string().optional(),
});

export const coverLetterPersonalInfoSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    phone: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
    linkedIn: z.url().optional(),
    portfolio: z.url().optional(),
    currentTitle: z.string().optional(),
    currentCompany: z.string().optional(),
    professionalSummary: z.string().optional(),
});

// Enhanced skill schema with comprehensive metadata
export const skillSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string() as z.ZodType<DataSkillCategory>,
    proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
    yearsOfExperience: z.number().optional(),
    lastUsed: z.string().optional(),
    certifications: z.array(z.string()).default([]),
    projects: z.array(z.string()).default([]),
    endorsements: z.number().optional(),
    learnedAt: z.string().optional(),
    appliedIn: z.array(z.string()).default([]),
    showProficiency: z.boolean().default(true),
    showYearsExperience: z.boolean().default(true),
    isVisible: z.boolean().default(true),
    priority: z.number().default(0),
});

// Enhanced project schema with comprehensive metadata
export const projectSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.string() as z.ZodType<DataProjectType>,
    technologiesUsed: z.array(z.string()),
    architectureUsed: z.string().optional(),
    dataSize: z.string().optional(),
    businessProblem: z.string(),
    solution: z.string(),
    stakeholders: z.array(z.string()).default([]),
    duration: z.string().optional(),
    teamSize: z.number().optional(),
    outcomes: z.array(z.object({
        metric: z.string(),
        value: z.string(),
        description: z.string().optional(),
    })).default([]),
    businessImpact: z.string().optional(),
    lessonsLearned: z.array(z.string()).default([]),
    githubUrl: z.url().optional(),
    liveUrl: z.url().optional(),
    documentationUrl: z.url().optional(),
    presentationUrl: z.url().optional(),
    publications: z.array(z.object({
        title: z.string(),
        venue: z.string(),
        year: z.string(),
    })).default([]),
    emphasizeBusinessImpact: z.boolean().default(false),
    showTechnicalDetails: z.boolean().default(true),
    isVisible: z.boolean().default(true),
    priority: z.number().default(0),
});

// Enhanced work experience schema
export const workExperienceSchema = z.object({
    id: z.string(),
    company: z.string(),
    position: z.string(),
    location: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    isCurrentRole: z.boolean().default(false),
    achievements: z.array(z.object({
        id: z.string(),
        description: z.string(),
        impact: z.string().optional(),
        metrics: z.array(z.string()).default([]),
        technologiesUsed: z.array(z.string()).default([]),
        businessValue: z.string().optional(),
        quantifiableResults: z.array(z.object({
            metric: z.string(),
            value: z.string(),
            timeframe: z.string().optional(),
        })).default([]),
    })),
    primaryTechnologies: z.array(z.string()),
    projectTypes: z.array(z.string() as z.ZodType<DataProjectType>).optional(),
    teamSize: z.string().optional(),
    budgetManaged: z.string().optional(),
    dataVolume: z.string().optional(),
    clientTypes: z.array(z.string()).default([]),
    regulatoryContext: z.array(z.string()).default([]),
    emphasizeMetrics: z.boolean().default(false),
    showTechnologies: z.boolean().default(true),
    isVisible: z.boolean().default(true),
    priority: z.number().default(0),
});

// Enhanced education schema
export const educationSchema = z.object({
    id: z.string(),
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    gpa: z.string().optional(),
    honors: z.array(z.string()).default([]),
    relevantCoursework: z.array(z.string()).default([]),
    thesis: z.object({
        title: z.string(),
        advisor: z.string().optional(),
        abstract: z.string().optional(),
        keywords: z.array(z.string()).default([]),
    }).optional(),
    academicProjects: z.array(z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()).default([]),
    })).default([]),
    isVisible: z.boolean().default(true),
    priority: z.number().default(0),
});

// Enhanced certification schema
export const certificationSchema = z.object({
    id: z.string(),
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional(),
    credentialId: z.string().optional(),
    credentialUrl: z.url().optional(),
    skillsValidated: z.array(z.string()).default([]),
    level: z.enum(["associate", "professional", "expert", "master"]).optional(),
    prerequisites: z.array(z.string()).default([]),
    continuingEducation: z.boolean().default(false),
    isVerified: z.boolean().default(false),
    verificationMethod: z.string().optional(),
    industryRecognition: z.enum(["high", "medium", "low"]).optional(),
    isVisible: z.boolean().default(true),
    priority: z.number().default(0),
});

// Achievement schema
export const achievementSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.enum(["award", "recognition", "milestone", "innovation", "leadership", "impact"]),
    organization: z.string().optional(),
    date: z.string().optional(),
    scope: z.enum(["individual", "team", "department", "company", "industry"]).optional(),
    metrics: z.array(z.object({
        metric: z.string(),
        value: z.string(),
        context: z.string().optional(),
    })).default([]),
    evidenceUrl: z.url().optional(),
    mediaUrl: z.url().optional(),
    isVisible: z.boolean().default(true),
    priority: z.number().default(0),
});

// Publication schema
export const publicationSchema = z.object({
    id: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.string(),
    type: z.enum(["journal", "conference", "preprint", "blog", "book", "other"]),
    citations: z.number().optional(),
    hIndex: z.number().optional(),
    doi: z.string().optional(),
    url: z.url().optional(),
    abstract: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    industryRelevance: z.string().optional(),
    businessApplications: z.array(z.string()).default([]),
    isVisible: z.boolean().default(true),
    priority: z.number().default(0),
});

// Common update input validators
export const commonTargetingSchema = z.object({
    targetRole: z.string().optional(),
    targetJobTitle: z.string().optional(),
    targetSpecialization: z.string().optional() as z.ZodOptional<z.ZodType<DataSpecialization>>,
    targetIndustry: z.string().optional() as z.ZodOptional<z.ZodType<DataIndustry>>,
    targetCompanyType: z.enum(["startup", "enterprise", "consulting", "agency", "non_profit", "government"]).optional(),
    experienceLevel: z.string().optional() as z.ZodOptional<z.ZodType<ExperienceLevel>>,
});

export const designConfigSchema = z.object({
    colors: z.any().optional(),
    typography: z.any().optional(),
    layout: z.any().optional(),
    spacing: z.any().optional(),
    borders: z.any().optional(),
    effects: z.any().optional(),
    icons: z.any().optional(),
    contentStyles: z.any().optional(),
});
