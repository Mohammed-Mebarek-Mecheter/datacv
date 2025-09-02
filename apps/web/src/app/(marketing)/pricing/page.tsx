// src/app/(marketing)/pricing/page.tsx
"use client";
import {
	ArrowRight,
	Check,
	Headphones,
	Shield,
	Sparkles,
	Star,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { HeroHeader } from "@/components/header";
import PricingComparator from "@/components/pricing-comparator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Footerdemo } from "@/components/ui/footer-section";

const pricingPlans = [
	{
		id: "free",
		name: "Free",
		price: "$0",
		period: "/forever",
		description:
			"Perfect for exploring DataCV and creating your first data resume",
		features: [
			"Up to 2 documents (resume + cover letter)",
			"Access to 3 basic templates",
			"Save & edit documents",
			"AI document type recommendation",
			"Up to 10 AI content generations/month",
			"Up to 5 content improvements/month",
			"Up to 3 job match analyses/month",
			"Export to PDF, DOCX, TXT",
			"Basic customer support",
		],
		buttonText: "Start Free",
		buttonVariant: "outline" as const,
		popular: false,
		badge: "Great for Testing",
		testimonial: {
			text: "Perfect for getting started and seeing if DataCV works for my data science resume.",
			author: "Alex Chen, Junior Data Analyst",
		},
	},
	{
		id: "monthly_pro",
		name: "Monthly Pro",
		price: "$19",
		period: "/month",
		originalPrice: "$29",
		description:
			"Ideal for active job seekers who need unlimited AI assistance",
		features: [
			"Everything in Free",
			"Unlimited documents",
			"Access to 20+ advanced templates",
			"Industry-specific templates for DS/ML/DE",
			"Unlimited AI content generation",
			"Unlimited content improvements",
			"Unlimited job match analysis",
			"Advanced AI suggestions (role-tailored)",
			"ATS optimization tools",
			"Export to PDF, DOCX, TXT, JSON",
			"Detailed export history",
			"Priority customer support",
			"Early access to new features",
		],
		buttonText: "Start 7-Day Free Trial",
		buttonVariant: "default" as const,
		popular: true,
		badge: "Most Popular",
		polarProductSlug: "monthly_pro",
		testimonial: {
			text: "The unlimited AI generations were crucial during my job search. Got 3 interviews in the first week!",
			author: "Sarah Rodriguez, Senior Data Scientist",
		},
	},
	{
		id: "lifetime_pro",
		name: "Lifetime Pro",
		price: "$199",
		period: "/one-time",
		originalPrice: "$399",
		description:
			"Best value for long-term career growth without recurring costs",
		features: [
			"Everything in Monthly Pro",
			"Lifetime access to all features",
			"All future features included",
			"No recurring payments ever",
			"Premium support for life",
			"Early access to new features",
			"Beta testing opportunities",
			"Exclusive data career insights",
			"Priority feature requests",
		],
		buttonText: "Buy Lifetime Access",
		buttonVariant: "default" as const,
		popular: false,
		badge: "Best Value",
		polarProductSlug: "lifetime_pro",
		savings: "Save $429 vs 2 years monthly",
		testimonial: {
			text: "As a senior data professional, this was a no-brainer. The lifetime deal pays for itself quickly.",
			author: "David Park, Principal Data Engineer",
		},
	},
];

const faqItems = [
	{
		question: "Why is DataCV more expensive than generic resume builders?",
		answer:
			"DataCV is specifically built for data professionals with specialized AI that understands technical achievements, quantifiable impacts, and data career progression. Generic tools often fail data professionals with irrelevant suggestions and rigid formatting - that's why we built a solution that actually works for data careers.",
	},
	{
		question: "Can I switch between plans?",
		answer:
			"Yes! You can upgrade from Free to Pro anytime. If you're on Monthly Pro, you can upgrade to Lifetime Pro and we'll credit your unused monthly subscription.",
	},
	{
		question: "What's included in the 30-day money-back guarantee?",
		answer:
			"If you're not satisfied with your paid plan for any reason within 30 days, we'll provide a full refund. No questions asked.",
	},
	{
		question: "Do you offer student discounts?",
		answer:
			"We offer a 50% student discount on Monthly Pro plans for students currently enrolled in data science, computer science, or related programs. Contact support with your student ID.",
	},
	{
		question: "How does the lifetime plan work with new features?",
		answer:
			"Lifetime Pro users get access to ALL future features at no additional cost. This includes upcoming features like skill gap analysis, market trend insights, and portfolio integration.",
	},
];

const comparisonHighlights = [
	{
		icon: Users,
		title: "5,000+",
		subtitle: "Data professionals trust DataCV",
		description:
			"Join data scientists, ML engineers, and analysts at top companies",
	},
	{
		icon: Shield,
		title: "Enterprise Security",
		subtitle: "Your data is protected",
		description: "SOC 2 compliant with end-to-end encryption",
	},
	{
		icon: Headphones,
		title: "Expert Support",
		subtitle: "Data career guidance",
		description: "Our team understands data professional challenges",
	},
];

const createHref = (path: string) => path as any;
export default function PricingPage() {
	return (
		<div className="min-h-screen bg-background">
			<HeroHeader />

			{/* Hero Section */}
			<section className="px-6 pt-32 pb-16">
				<div className="mx-auto max-w-6xl text-center">
					<Badge className="mb-6" variant="secondary">
						<Sparkles className="mr-2 h-4 w-4" />
						30-Day Money-Back Guarantee
					</Badge>
					<h1 className="mb-6 font-bold text-4xl md:text-6xl">
						Pricing Built for{" "}
						<span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
							Data Careers
						</span>
					</h1>
					<p className="mx-auto mb-8 max-w-3xl text-muted-foreground text-xl">
						From free exploration to professional job searching, choose the plan
						that fits your data science career stage. No hidden fees, no
						surprises.
					</p>

					{/* Comparison Highlights */}
					<div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
						{comparisonHighlights.map((item, index) => (
							<div
								key={index}
								className="flex items-center gap-3 rounded-lg bg-muted/30 p-4"
							>
								<item.icon className="h-8 w-8 text-primary" />
								<div className="text-left">
									<div className="font-semibold">{item.title}</div>
									<div className="text-muted-foreground text-sm">
										{item.subtitle}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-6xl">
					<div className="grid gap-8 lg:grid-cols-3">
						{pricingPlans.map((plan) => (
							<Card
								key={plan.id}
								className={`relative flex flex-col ${plan.popular ? "scale-105 shadow-2xl ring-2 ring-primary" : ""}`}
							>
								{plan.badge && (
									<div className="-top-3 -translate-x-1/2 absolute left-1/2">
										<div
											className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium text-white text-xs ${
												plan.popular
													? "bg-gradient-to-r from-purple-500 to-pink-500"
													: plan.id === "lifetime_pro"
														? "bg-gradient-to-r from-amber-500 to-orange-500"
														: "bg-gradient-to-r from-blue-500 to-cyan-500"
											}`}
										>
											{plan.id === "monthly_pro" && (
												<Sparkles className="h-3 w-3" />
											)}
											{plan.id === "lifetime_pro" && (
												<Zap className="h-3 w-3" />
											)}
											{plan.badge}
										</div>
									</div>
								)}

								<CardHeader className="pb-8 text-center">
									<CardTitle className="font-bold text-2xl">
										{plan.name}
									</CardTitle>
									<div className="mb-2 flex items-center justify-center gap-2">
										{plan.originalPrice && (
											<span className="text-lg text-muted-foreground line-through">
												{plan.originalPrice}
											</span>
										)}
										<span className="font-bold text-4xl">{plan.price}</span>
										<span className="text-muted-foreground">{plan.period}</span>
									</div>
									{plan.savings && (
										<Badge variant="secondary" className="text-xs">
											{plan.savings}
										</Badge>
									)}
									<CardDescription className="mt-2 text-center">
										{plan.description}
									</CardDescription>
								</CardHeader>

								<CardContent className="flex-1 space-y-4">
									<ul className="space-y-3">
										{plan.features.map((feature, featureIndex) => (
											<li key={featureIndex} className="flex items-start gap-2">
												<Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
												<span className="text-sm">{feature}</span>
											</li>
										))}
									</ul>

									{/* Testimonial */}
									<div className="mt-6 rounded-lg bg-muted/50 p-4">
										<div className="mb-2 flex">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className="h-4 w-4 fill-yellow-400 text-yellow-400"
												/>
											))}
										</div>
										<p className="mb-2 text-sm italic">
											"{plan.testimonial.text}"
										</p>
										<p className="text-muted-foreground text-xs">
											— {plan.testimonial.author}
										</p>
									</div>
								</CardContent>

								<CardFooter>
									<Button
										variant={plan.buttonVariant}
										className="w-full"
										asChild
									>
                                        <Link
                                            href={
                                                plan.id === "free"
                                                    ? createHref("/sign-up")
                                                    : createHref(`/checkout?plan=${plan.id}`)
                                            }
                                        >
											{plan.buttonText}
											<ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>

					{/* Plan Comparison Note */}
					<div className="mt-12 text-center">
						<p className="mb-4 text-muted-foreground">
							Need more details? Compare all features side-by-side
						</p>
						<Button variant="outline" asChild>
							<Link href="#detailed-comparison">View Detailed Comparison</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Why Choose DataCV vs Competitors */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-6xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							Why Data Professionals Choose DataCV Over Generic Tools
						</h2>
						<p className="text-lg text-muted-foreground">
							See why our pricing reflects real value for data careers
						</p>
					</div>

					<div className="grid items-center gap-12 md:grid-cols-2">
						<div className="space-y-6">
							<div className="flex items-start gap-4">
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
									<Check className="h-4 w-4 text-green-600" />
								</div>
								<div>
									<h3 className="mb-2 font-semibold">
										Data-Specific AI That Actually Works
									</h3>
									<p className="text-muted-foreground text-sm">
										Unlike Rezi.ai's generic AI that "makes stuff up," our AI
										understands technical achievements, quantifiable impacts,
										and data career progression.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-4">
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
									<Check className="h-4 w-4 text-green-600" />
								</div>
								<div>
									<h3 className="mb-2 font-semibold">
										No Artificial Length Limits
									</h3>
									<p className="text-muted-foreground text-sm">
										Senior professionals need space for patents, publications,
										and complex projects. We don't truncate your 15+ years of
										experience like other tools.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-4">
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
									<Check className="h-4 w-4 text-green-600" />
								</div>
								<div>
									<h3 className="mb-2 font-semibold">ROI-Focused Investment</h3>
									<p className="text-muted-foreground text-sm">
										Data professionals earn $80K-$200K+. A small investment in a
										specialized tool pays for itself with one successful
										application.
									</p>
								</div>
							</div>
						</div>

						<div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-8">
							<h3 className="mb-4 font-bold text-xl">Compare the Real Cost</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm">Generic Tool Annual Cost</span>
									<span className="font-semibold">$120-180/year</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">
										Time wasted on poor suggestions
									</span>
									<span className="font-semibold text-red-500">10+ hours</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">
										Missed opportunities from bad resumes
									</span>
									<span className="font-semibold text-red-500">Priceless</span>
								</div>
								<div className="mt-4 border-t pt-4">
									<div className="flex items-center justify-between">
										<span className="font-semibold">DataCV Lifetime Pro</span>
										<span className="font-bold text-primary">$199 once</span>
									</div>
									<div className="flex items-center justify-between text-green-600 text-sm">
										<span>Perfect resume, faster job search</span>
										<span className="font-semibold">Priceless</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Detailed Comparison Table */}
			<section id="detailed-comparison" className="bg-background px-6 py-16">
				<PricingComparator />
			</section>

			{/* FAQ Section */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-4xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							Pricing Questions Answered
						</h2>
						<p className="text-lg text-muted-foreground">
							Common questions about DataCV's pricing and plans
						</p>
					</div>

					<div className="space-y-6">
						{faqItems.map((item, index) => (
							<Card key={index}>
								<CardHeader>
									<CardTitle className="text-lg">{item.question}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">{item.answer}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="bg-background px-6 py-16">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="mb-4 font-bold text-3xl md:text-4xl">
						Ready to Invest in Your Data Career?
					</h2>
					<p className="mb-8 text-lg text-muted-foreground">
						Join over 5,000 data professionals who've accelerated their careers
						with DataCV. Start free, upgrade when you're ready to job search.
					</p>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button asChild size="lg" className="px-8 text-lg">
							<Link href="/sign-up">
								Start Free Today
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button asChild variant="ghost" size="lg" className="px-8 text-lg">
							<Link href="/features">Explore All Features</Link>
						</Button>
					</div>

					<div className="mt-8 grid gap-6 text-muted-foreground text-sm md:grid-cols-3">
						<div className="flex items-center justify-center gap-2">
							<Shield className="h-4 w-4" />
							<span>30-day money-back guarantee</span>
						</div>
						<div className="flex items-center justify-center gap-2">
							<Users className="h-4 w-4" />
							<span>Join 5,000+ data professionals</span>
						</div>
						<div className="flex items-center justify-center gap-2">
							<Headphones className="h-4 w-4" />
							<span>Expert support team</span>
						</div>
					</div>
				</div>
			</section>

			<Footerdemo />
		</div>
	);
}
