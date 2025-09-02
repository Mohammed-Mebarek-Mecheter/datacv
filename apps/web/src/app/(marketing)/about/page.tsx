// src/app/(marketing)/about/page.tsx
"use client";
import {
	Award,
	BarChart3,
	Heart,
	Lightbulb,
	Shield,
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

const values = [
	{
		icon: Target,
		title: "Purpose-Built Solutions",
		description:
			"We build tools specifically for data professionals, not one-size-fits-all solutions that barely work for anyone.",
	},
	{
		icon: Users,
		title: "Community-Driven",
		description:
			"Our features come from real feedback from data scientists, ML engineers, and analysts in the field.",
	},
	{
		icon: Shield,
		title: "Privacy-First",
		description:
			"Your career data is sensitive. We use enterprise-grade security and never share your information.",
	},
	{
		icon: Lightbulb,
		title: "Continuous Innovation",
		description:
			"We're constantly improving our AI and features based on the evolving needs of data careers.",
	},
];

const teamMembers = [
	{
		name: "Alex Rodriguez",
		role: "Co-Founder & CEO",
		background: "Former Senior Data Scientist at Meta",
		bio: "Spent 8 years in data science roles and experienced firsthand how generic resume tools fail data professionals. Built DataCV after struggling to showcase complex ML projects and quantifiable impacts.",
		expertise: "Data Science Leadership, Product Strategy",
	},
	{
		name: "Sarah Chen",
		role: "Co-Founder & CTO",
		background: "Ex-ML Engineer at Google",
		bio: "Led ML infrastructure teams and noticed how hard it was for data professionals to properly communicate their technical achievements to non-technical recruiters and hiring managers.",
		expertise: "Machine Learning, AI Systems",
	},
	{
		name: "Dr. Michael Kim",
		role: "Head of AI",
		background: "Former Research Scientist at OpenAI",
		bio: "PhD in NLP with expertise in domain-specific AI applications. Leads our AI content generation that understands data professional terminology and achievements.",
		expertise: "Natural Language Processing, AI Research",
	},
	{
		name: "Jessica Park",
		role: "Head of Product",
		background: "Ex-Data Analyst at Stripe",
		bio: "Transitioned through multiple data roles and understands the resume challenges at each career stage. Ensures our product serves everyone from junior analysts to principal architects.",
		expertise: "Product Management, Data Analytics",
	},
];

const stats = [
	{
		icon: Users,
		number: "5,000+",
		label: "Data Professionals",
		description: "Trust DataCV for their career documents",
	},
	{
		icon: BarChart3,
		number: "89%",
		label: "Success Rate",
		description: "Users report improved interview rates",
	},
	{
		icon: Award,
		number: "150+",
		label: "Companies",
		description: "Our users have joined including FAANG",
	},
	{
		icon: Zap,
		number: "10M+",
		label: "AI Generations",
		description: "Of data-specific content created",
	},
];

const milestones = [
	{
		year: "2023",
		title: "The Problem",
		description:
			"Co-founders experience frustration with generic resume builders while job searching in data roles",
	},
	{
		year: "2024 Q1",
		title: "Research Phase",
		description:
			"Extensive research with 200+ data professionals reveals common pain points with existing tools",
	},
	{
		year: "2024 Q2",
		title: "MVP Development",
		description:
			"Built first version with data-specific AI and flexible document formats",
	},
	{
		year: "2024 Q4",
		title: "Beta Launch",
		description:
			"Private beta with 100 data professionals, refining AI and adding features",
	},
	{
		year: "2025 Q1",
		title: "Public Launch",
		description: "Official launch with 5,000+ users in first month",
	},
	{
		year: "2025 Q2",
		title: "Future Vision",
		description:
			"Expanding to comprehensive data career platform with skill gap analysis and market insights",
	},
];

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-background">
			<HeroHeader />

			{/* Hero Section */}
			<section className="px-6 pt-32 pb-16">
				<div className="mx-auto max-w-6xl">
					<div className="mb-16 text-center">
						<Badge className="mb-6" variant="secondary">
							<Heart className="mr-2 h-4 w-4" />
							Built by Data Professionals
						</Badge>
						<h1 className="mb-6 font-bold text-4xl md:text-6xl">
							We Understand Your{" "}
							<span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
								Career Challenges
							</span>
						</h1>
						<p className="mx-auto max-w-4xl text-muted-foreground text-xl">
							DataCV was born from the frustration of experienced data
							professionals who couldn't find resume tools that understood their
							unique career needs. We built the solution we wished existed.
						</p>
					</div>

					{/* Stats */}
					<div className="grid gap-8 md:grid-cols-4">
						{stats.map((stat, index) => (
							<Card key={index} className="text-center">
								<CardHeader className="pb-2">
									<stat.icon className="mx-auto mb-2 h-8 w-8 text-primary" />
									<CardTitle className="font-bold text-3xl">
										{stat.number}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="mb-1 font-semibold">{stat.label}</p>
									<p className="text-muted-foreground text-sm">
										{stat.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Our Story */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-6xl">
					<div className="grid items-center gap-12 lg:grid-cols-2">
						<div>
							<h2 className="mb-6 font-bold text-3xl md:text-4xl">Our Story</h2>
							<div className="space-y-4 text-muted-foreground">
								<p>
									In 2023, our co-founders Alex and Sarah were both job
									searching in data science roles. Despite their impressive
									backgrounds - Alex as a Senior Data Scientist at Meta and
									Sarah as an ML Engineer at Google - they struggled with
									generic resume builders.
								</p>
								<p>
									Tools like Rezi.ai would suggest irrelevant content, truncate
									their complex technical projects, and fail to understand how
									to quantify the impact of ML models or data pipelines. The AI
									would literally "make stuff up" or pull content from unrelated
									sections.
								</p>
								<p>
									After talking to 200+ data professionals who shared similar
									frustrations, they realized this wasn't just their problem -
									it was an industry-wide issue. Generic tools simply weren't
									built for the unique challenges of data careers.
								</p>
								<p className="font-semibold text-foreground">
									So they built DataCV - the resume builder they wished existed
									when they were job searching.
								</p>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg text-red-700 dark:text-red-300">
										The Problem
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2 text-sm">
									<p className="text-red-600 dark:text-red-400">
										• AI makes stuff up
									</p>
									<p className="text-red-600 dark:text-red-400">
										• One-page limits truncate experience
									</p>
									<p className="text-red-600 dark:text-red-400">
										• No data-specific sections
									</p>
									<p className="text-red-600 dark:text-red-400">
										• Generic, irrelevant suggestions
									</p>
								</CardContent>
							</Card>
							<Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
								<CardHeader className="pb-3">
									<CardTitle className="text-green-700 text-lg dark:text-green-300">
										Our Solution
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2 text-sm">
									<p className="text-green-600 dark:text-green-400">
										• AI trained on data roles
									</p>
									<p className="text-green-600 dark:text-green-400">
										• Flexible CV lengths
									</p>
									<p className="text-green-600 dark:text-green-400">
										• Data-specific templates
									</p>
									<p className="text-green-600 dark:text-green-400">
										• Quantified impact focus
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Our Values */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-6xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							What Drives Us
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
							Our values shape every feature we build and every decision we make
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{values.map((value, index) => (
							<Card key={index} className="text-center">
								<CardHeader>
									<value.icon className="mx-auto mb-4 h-12 w-12 text-primary" />
									<CardTitle className="text-lg">{value.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground text-sm">
										{value.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Team */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-6xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							Meet Our Team
						</h2>
						<p className="text-lg text-muted-foreground">
							Data professionals building tools for data professionals
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						{teamMembers.map((member, index) => (
							<Card key={index}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-xl">{member.name}</CardTitle>
											<p className="font-semibold text-primary">
												{member.role}
											</p>
											<p className="text-muted-foreground text-sm">
												{member.background}
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<p className="text-muted-foreground text-sm">{member.bio}</p>
									<div>
										<Badge variant="secondary" className="text-xs">
											{member.expertise}
										</Badge>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Timeline */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-4xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">Our Journey</h2>
						<p className="text-lg text-muted-foreground">
							From problem identification to solution
						</p>
					</div>

					<div className="space-y-8">
						{milestones.map((milestone, index) => (
							<div key={index} className="flex items-start gap-6">
								<div className="flex flex-col items-center">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
										{milestone.year.slice(-2)}
									</div>
									{index < milestones.length - 1 && (
										<div className="mt-4 h-16 w-0.5 bg-border" />
									)}
								</div>
								<div className="flex-1 pb-8">
									<div className="mb-2 flex items-center gap-3">
										<h3 className="font-semibold text-lg">{milestone.title}</h3>
										<Badge variant="outline" className="text-xs">
											{milestone.year}
										</Badge>
									</div>
									<p className="text-muted-foreground">
										{milestone.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Mission Statement */}
			<section className="bg-background from-primary/10 to-primary/5 px-6 py-16">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="mb-6 font-bold text-3xl md:text-4xl">Our Mission</h2>
					<p className="mb-8 text-muted-foreground text-xl leading-relaxed">
						To empower data professionals with tools that truly understand their
						unique career challenges, helping them showcase their technical
						expertise and quantifiable impact to land roles where they can make
						meaningful contributions to the world through data.
					</p>

					<div className="rounded-lg bg-background/80 p-8 shadow-lg backdrop-blur-sm">
						<h3 className="mb-4 font-bold text-2xl">Join Our Mission</h3>
						<p className="mb-6 text-muted-foreground">
							Whether you're a junior analyst or a principal data scientist,
							we're here to help you showcase your expertise and advance your
							career.
						</p>
						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Button asChild size="lg">
								<Link href="/sign-up">Start Building Your Resume</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/features">Explore Our Features</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<Footerdemo />
		</div>
	);
}
