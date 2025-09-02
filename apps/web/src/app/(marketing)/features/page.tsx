// src/app/(marketing)/features/page.tsx
"use client";
import {
	Brain,
	CheckCircle,
	Database,
	Download,
	FileText,
	LineChart,
	Shield,
	Sparkles,
	Target,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { HeroHeader } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footerdemo } from "@/components/ui/footer-section";

const coreFeatures = [
	{
		icon: Brain,
		title: "Data-Specific AI Content Generation",
		description:
			"AI trained on data roles that understands technical achievements and quantifiable impacts",
		details: [
			"Generate achievement bullets with CAR format (Challenge, Action, Result)",
			"Emphasize metrics like 'improved model accuracy by 23%' and 'reduced processing time by 40%'",
			"Smart suggestions for ML projects, data pipelines, and research contributions",
			"Context-aware content that never 'makes stuff up' like generic tools",
		],
		badge: "Most Popular",
	},
	{
		icon: Target,
		title: "Advanced Job Match Analysis",
		description:
			"AI-powered analysis that matches your resume to specific data science job requirements",
		details: [
			"Deep analysis of job descriptions vs. your experience",
			"Identifies missing technical skills and keywords",
			"Provides actionable recommendations to improve match scores",
			"Tailored suggestions for different data roles (DS, ML, DE, DA)",
		],
	},
	{
		icon: FileText,
		title: "Flexible Document Types",
		description:
			"Create resumes for industry or multi-page CVs for research - no artificial length limits",
		details: [
			"1-2 page resumes optimized for industry data roles",
			"Unlimited length CVs for academic and research positions",
			"Custom sections for publications, patents, research statements",
			"Smart document type recommendations based on your target role",
		],
	},
	{
		icon: Zap,
		title: "ATS Optimization Engine",
		description:
			"Built-in optimization ensures your resume passes Applicant Tracking Systems",
		details: [
			"Real-time ATS compatibility scoring",
			"Data-specific keyword optimization",
			"Format validation for major ATS platforms",
			"Technical skills parsing optimization",
		],
	},
	{
		icon: Database,
		title: "Smart Templates for Every Data Role",
		description:
			"Industry-specific templates optimized for different data career paths",
		details: [
			"Data Scientist templates emphasizing ML models and business impact",
			"Data Engineer templates highlighting pipeline architecture and scale",
			"Data Analyst templates focusing on insights and business intelligence",
			"Research Scientist templates for academic and R&D positions",
		],
	},
	{
		icon: LineChart,
		title: "Impact Quantification Assistant",
		description: "Specialized tools to showcase measurable business outcomes",
		details: [
			"Pre-built sections for model performance metrics",
			"Cost savings and efficiency improvement calculators",
			"Data scale indicators (TB processed, millions of records, etc.)",
			"ROI calculation helpers for business impact statements",
		],
	},
];

const advancedFeatures = [
	{
		icon: Shield,
		title: "Enterprise Security",
		description:
			"Your data and career information protected with enterprise-grade security",
	},
	{
		icon: Download,
		title: "Multiple Export Formats",
		description: "Export to PDF, DOCX, TXT, and JSON for maximum compatibility",
	},
	{
		icon: Users,
		title: "Version Control",
		description:
			"Track changes and maintain multiple versions for different job applications",
	},
];

const comparisonData = [
	{
		feature: "Data-Specific AI",
		DataCV: "✓ Trained on data roles",
		generic: "✗ Generic suggestions",
		rezi: "✗ Often inaccurate for data roles",
	},
	{
		feature: "Multi-page CVs",
		DataCV: "✓ Unlimited length support",
		generic: "✗ Usually 1-page limit",
		rezi: "✗ Truncates senior experience",
	},
	{
		feature: "Technical Sections",
		DataCV: "✓ ML projects, publications, patents",
		generic: "✗ Basic work experience only",
		rezi: "✗ Limited customization",
	},
	{
		feature: "Job Match Analysis",
		DataCV: "✓ Deep data role analysis",
		generic: "✗ Basic keyword matching",
		rezi: "✗ Generic scoring",
	},
	{
		feature: "ATS Optimization",
		DataCV: "✓ Data-specific keywords",
		generic: "✗ Generic optimization",
		rezi: "✓ Basic ATS support",
	},
];

export default function FeaturesPage() {
	return (
		<div className="min-h-screen bg-background">
			<HeroHeader />

			{/* Hero Section */}
			<section className="bg-background px-6 pt-32 pb-16">
				<div className="mx-auto max-w-6xl text-center">
					<Badge className="mb-6" variant="secondary">
						<Sparkles className="mr-2 h-4 w-4" />
						Built for Data Professionals
					</Badge>
					<h1 className="mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text font-bold text-4xl text-transparent md:text-6xl">
						Features That Actually Understand Data Careers
					</h1>
					<p className="mx-auto mb-8 max-w-3xl text-muted-foreground text-xl">
						Unlike generic resume builders, every DataCV feature is designed
						around the unique challenges of data science, machine learning, and
						analytics careers.
					</p>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button asChild size="lg" className="px-8 text-lg">
							<Link href="/sign-up">Try All Features Free</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="px-8 text-lg"
						>
							<Link href="/pricing">View Pricing</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Core Features */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-6xl">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							Core Features for Data Professionals
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
							Each feature addresses specific pain points identified in our
							research with data professionals
						</p>
					</div>

					<div className="grid gap-12 lg:grid-cols-2">
						{coreFeatures.map((feature, index) => (
							<Card key={index} className="relative overflow-hidden">
								{feature.badge && (
									<div className="absolute top-4 right-4">
										<Badge variant="secondary" className="text-xs">
											{feature.badge}
										</Badge>
									</div>
								)}
								<CardHeader>
									<div className="flex items-center gap-4">
										<div className="rounded-lg bg-primary/10 p-3">
											<feature.icon className="h-8 w-8 text-primary" />
										</div>
										<div>
											<CardTitle className="text-xl">{feature.title}</CardTitle>
										</div>
									</div>
									<p className="text-muted-foreground">{feature.description}</p>
								</CardHeader>
								<CardContent>
									<ul className="space-y-3">
										{feature.details.map((detail, detailIndex) => (
											<li key={detailIndex} className="flex items-start gap-3">
												<CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
												<span className="text-sm">{detail}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Comparison Table */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-6xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							How DataCV Compares to Generic Resume Builders
						</h2>
						<p className="text-lg text-muted-foreground">
							See why data professionals choose DataCV over tools like Rezi.ai
						</p>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full border-collapse overflow-hidden rounded-lg bg-background shadow-lg">
							<thead>
								<tr className="bg-muted">
									<th className="p-6 text-left font-semibold">Feature</th>
									<th className="p-6 text-center font-semibold">
										<div className="font-bold text-primary">DataCV</div>
										<div className="text-muted-foreground text-sm">
											Data-Focused
										</div>
									</th>
									<th className="p-6 text-center font-semibold">
										<div>Generic Tools</div>
										<div className="text-muted-foreground text-sm">
											One-Size-Fits-All
										</div>
									</th>
									<th className="p-6 text-center font-semibold">
										<div>Rezi.ai</div>
										<div className="text-muted-foreground text-sm">
											Popular Generic
										</div>
									</th>
								</tr>
							</thead>
							<tbody>
								{comparisonData.map((row, index) => (
									<tr key={index} className="border-t">
										<td className="p-6 font-medium">{row.feature}</td>
										<td className="p-6 text-center font-medium text-green-600">
											{row.DataCV}
										</td>
										<td className="p-6 text-center text-red-500">
											{row.generic}
										</td>
										<td className="p-6 text-center text-red-500">{row.rezi}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Additional Features */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-6xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							Additional Professional Features
						</h2>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						{advancedFeatures.map((feature, index) => (
							<Card key={index} className="text-center">
								<CardHeader>
									<feature.icon className="mx-auto mb-4 h-12 w-12 text-primary" />
									<CardTitle>{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">{feature.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="mb-4 font-bold text-3xl md:text-4xl">
						Ready to Experience the Difference?
					</h2>
					<p className="mb-8 text-lg text-muted-foreground">
						Join thousands of data professionals using DataCV to showcase their
						technical expertise and land better roles
					</p>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button asChild size="lg" className="px-8 text-lg">
							<Link href="/sign-up">Start Building Your Data Resume</Link>
						</Button>
						<Button asChild variant="ghost" size="lg" className="px-8 text-lg">
							<Link href="/pricing">See All Plans</Link>
						</Button>
					</div>
					<p className="mt-4 text-muted-foreground text-sm">
						Free tier includes 2 documents and 10 AI generations. No credit card
						required.
					</p>
				</div>
			</section>

			<Footerdemo />
		</div>
	);
}
