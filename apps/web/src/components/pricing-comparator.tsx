"use client";
import { Database, Sparkles, Users, Zap } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const featureCategories = [
	{
		name: "Document Creation & Management",
		icon: Database,
		features: [
			{
				feature: "Create Resumes/CVs/Cover Letters",
				free: "Up to 2 documents",
				monthlyPro: "Unlimited documents",
				lifetimePro: "Unlimited documents",
			},
			{
				feature: "Access to Basic Templates",
				free: true,
				monthlyPro: true,
				lifetimePro: true,
			},
			{
				feature: "Save & Edit Documents",
				free: true,
				monthlyPro: true,
				lifetimePro: true,
			},
			{
				feature: "Advanced Templates",
				free: false,
				monthlyPro: true,
				lifetimePro: true,
			},
			{
				feature: "Industry-Specific Templates",
				free: false,
				monthlyPro: true,
				lifetimePro: true,
			},
		],
	},
	{
		name: "AI-Powered Features",
		icon: Sparkles,
		features: [
			{
				feature: "AI Document Type Recommendation",
				free: true,
				monthlyPro: true,
				lifetimePro: true,
			},
			{
				feature: "AI Content Generation",
				free: "10 generations/month",
				monthlyPro: "Unlimited",
				lifetimePro: "Unlimited",
			},
			{
				feature: "AI Content Improvement",
				free: "5 improvements/month",
				monthlyPro: "Unlimited",
				lifetimePro: "Unlimited",
			},
			{
				feature: "AI Job Match Analysis",
				free: "3 analyses/month",
				monthlyPro: "Unlimited",
				lifetimePro: "Unlimited",
			},
			{
				feature: "AI Document Analysis & Scoring",
				free: "3 analyses/month",
				monthlyPro: "Unlimited",
				lifetimePro: "Unlimited",
			},
			{
				feature: "Advanced AI Suggestions (Role/Industry Tailored)",
				free: false,
				monthlyPro: true,
				lifetimePro: true,
			},
		],
	},
	{
		name: "Data Professional Features",
		icon: Users,
		features: [
			{
				feature: "ATS Optimization Tools",
				free: false,
				monthlyPro: true,
				lifetimePro: true,
			},
			{
				feature: "Export Formats",
				free: "PDF, DOCX, TXT",
				monthlyPro: "PDF, DOCX, TXT, JSON",
				lifetimePro: "PDF, DOCX, TXT, JSON",
			},
			{
				feature: "Skill Gap Analysis with Learning Paths",
				free: false,
				monthlyPro: "Coming Soon",
				lifetimePro: "Coming Soon",
			},
			{
				feature: "Market Trend Analysis",
				free: false,
				monthlyPro: "Coming Soon",
				lifetimePro: "Coming Soon",
			},
			{
				feature: "Detailed Export History",
				free: false,
				monthlyPro: true,
				lifetimePro: true,
			},
			{
				feature: "Priority Customer Support",
				free: false,
				monthlyPro: true,
				lifetimePro: true,
			},
		],
	},
];

const CheckIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className="h-4 w-4 text-green-500"
	>
		<path
			fillRule="evenodd"
			d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
			clipRule="evenodd"
		/>
	</svg>
);

const XIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className="h-4 w-4 text-gray-400"
	>
		<path
			fillRule="evenodd"
			d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
			clipRule="evenodd"
		/>
	</svg>
);

export default function PricingComparator() {
	const [isLoading, setIsLoading] = useState<string | null>(null);

	const handleCheckout = async (planType: string, slug?: string) => {
		if (planType === "free") {
			window.location.href = "/signup";
			return;
		}

		if (!slug) {
			toast.error("Product configuration error. Please try again.");
			return;
		}

		setIsLoading(planType);

		try {
			await authClient.checkout({
				slug: slug,
			});
		} catch (error) {
			console.error("Checkout error:", error);
			toast.error("Failed to start checkout. Please try again.");
		} finally {
			setIsLoading(null);
		}
	};

	const renderFeatureValue = (value: any) => {
		if (value === true) {
			return <CheckIcon />;
		}
		if (value === false) {
			return <XIcon />;
		}
		return <span className="text-sm">{value}</span>;
	};

	return (
		<section className="py-16 md:py-32">
			<div className="mx-auto max-w-5xl px-6">
				<div className="mx-auto mb-16 max-w-2xl space-y-6 text-center">
					<h2 className="text-center font-semibold text-3xl lg:text-4xl">
						Compare All Features
					</h2>
					<p className="text-muted-foreground">
						See exactly what's included in each plan to make the best choice for
						your data career.
					</p>
				</div>

				<div className="w-full overflow-auto lg:overflow-visible">
					<table className="w-[800px] border-separate border-spacing-x-3 md:w-full">
						<thead className="sticky top-0 z-10 bg-background">
							<tr className="*:py-6 *:text-left *:font-medium">
								<th className="lg:w-2/5" />
								<th className="space-y-3 text-center">
									<div className="space-y-2">
										<span className="block font-semibold text-lg">Free</span>
										<div className="font-bold text-2xl">$0</div>
										<div className="text-muted-foreground text-sm">forever</div>
									</div>
									<Button
										variant="outline"
										size="sm"
										disabled={isLoading === "free"}
										onClick={() => handleCheckout("free")}
									>
										{isLoading === "free" ? "Loading..." : "Get Started"}
									</Button>
								</th>
								<th className="relative space-y-3 rounded-t-lg bg-muted px-4 text-center">
									<div className="-top-3 -translate-x-1/2 absolute left-1/2">
										<div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 font-medium text-white text-xs">
											<Sparkles className="h-3 w-3" />
											Popular
										</div>
									</div>
									<div className="space-y-2 pt-3">
										<span className="block font-semibold text-lg">
											Monthly Pro
										</span>
										<div className="font-bold text-2xl">$19</div>
										<div className="text-muted-foreground text-sm">/month</div>
									</div>
									<Button
										size="sm"
										disabled={isLoading === "monthly"}
										onClick={() => handleCheckout("monthly", "monthly_pro")}
									>
										{isLoading === "monthly" ? "Loading..." : "Start Trial"}
									</Button>
								</th>
								<th className="space-y-3 text-center">
									<div className="space-y-2">
										<span className="block flex items-center justify-center gap-2 font-semibold text-lg">
											<Zap className="h-4 w-4 text-amber-500" />
											Lifetime Pro
										</span>
										<div className="font-bold text-2xl">$199</div>
										<div className="text-muted-foreground text-sm">
											one-time
										</div>
									</div>
									<Button
										variant="outline"
										size="sm"
										disabled={isLoading === "lifetime"}
										onClick={() => handleCheckout("lifetime", "lifetime_pro")}
									>
										{isLoading === "lifetime" ? "Loading..." : "Buy Lifetime"}
									</Button>
								</th>
							</tr>
						</thead>
						<tbody className="text-sm">
							{featureCategories.map((category, categoryIndex) => (
								<React.Fragment key={`category-${categoryIndex}`}>
									<tr className="*:py-4">
										<td className="flex items-center gap-2 font-medium text-base">
											<category.icon className="h-4 w-4" />
											<span>{category.name}</span>
										</td>
										<td />
										<td className="border-none bg-muted px-4" />
										<td />
									</tr>
									{category.features.map((feature, featureIndex) => (
										<tr
											key={`${categoryIndex}-${featureIndex}`}
											className="*:border-b *:py-3"
										>
											<td className="font-medium text-muted-foreground">
												{feature.feature}
											</td>
											<td className="text-center">
												{renderFeatureValue(feature.free)}
											</td>
											<td className="border-none bg-muted px-4">
												<div className="-mb-3 border-b py-3 text-center">
													{renderFeatureValue(feature.monthlyPro)}
												</div>
											</td>
											<td className="text-center">
												{renderFeatureValue(feature.lifetimePro)}
											</td>
										</tr>
									))}
								</React.Fragment>
							))}
							<tr className="*:py-6">
								<td />
								<td />
								<td className="rounded-b-lg border-none bg-muted px-4" />
								<td />
							</tr>
						</tbody>
					</table>
				</div>

				<div className="mt-12 space-y-4 text-center">
					<p className="text-muted-foreground text-sm">
						All plans include SSL security, regular updates, and access to our
						data professional community.
					</p>
					<p className="text-muted-foreground text-xs">
						30-day money-back guarantee on all paid plans. Cancel anytime.
					</p>
				</div>
			</div>
		</section>
	);
}
