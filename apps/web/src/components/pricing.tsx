"use client";

import { Check, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

const pricingPlans = [
	{
		id: "free",
		name: "Free",
		price: "$0",
		period: "/forever",
		description: "Perfect for exploring DataCV and creating your first documents",
		features: [
			"Up to 2 documents",
			"Access to basic templates",
			"Save & edit documents",
			"AI document type recommendation",
			"Up to 10 AI generations/month",
			"Up to 5 content improvements/month",
			"Up to 3 job match analyses/month",
			"Export to PDF, DOCX, TXT",
		],
		buttonText: "Get Started Free",
		buttonVariant: "outline" as const,
		popular: false,
	},
	{
		id: "monthly_pro",
		name: "Monthly Pro",
		price: "$19",
		period: "/month",
		description: "Ideal for active job searching with unlimited AI assistance",
		features: [
			"Everything in Free",
			"Unlimited documents",
			"Access to all advanced templates",
			"Industry-specific templates",
			"Unlimited AI generations",
			"Unlimited content improvements",
			"Unlimited job match analyses",
			"Advanced AI suggestions (role/industry tailored)",
			"ATS optimization tools",
			"Export to PDF, DOCX, TXT, JSON",
			"Detailed export history",
			"Priority customer support",
		],
		buttonText: "Start Monthly Trial",
		buttonVariant: "default" as const,
		popular: true,
		polarProductSlug: "monthly_pro",
	},
	{
		id: "lifetime_pro",
		name: "Lifetime Pro",
		price: "$199",
		period: "/one-time",
		description:
			"Best value for long-term career growth without recurring costs",
		features: [
			"Everything in Monthly Pro",
			"Lifetime access",
			"All future features included",
			"No recurring payments",
			"Premium support for life",
			"Early access to new features",
		],
		buttonText: "Buy Lifetime Access",
		buttonVariant: "default" as const,
		popular: false,
		polarProductSlug: "lifetime_pro",
	},
];

export default function Pricing() {
	const [isLoading, setIsLoading] = useState<string | null>(null);

	const handleCheckout = async (planId: string, polarProductSlug?: string) => {
		if (planId === "free") {
			// Redirect to sign up for free plan
			window.location.href = "/signup";
			return;
		}

		if (!polarProductSlug) {
			toast.error("Product configuration error. Please try again.");
			return;
		}

		setIsLoading(planId);

		try {
			await authClient.checkout({
				slug: polarProductSlug,
			});
		} catch (error) {
			console.error("Checkout error:", error);
			toast.error("Failed to start checkout. Please try again.");
		} finally {
			setIsLoading(null);
		}
	};

	return (
		<section className="py-16 md:py-32">
			<div className="mx-auto max-w-6xl px-6">
				<div className="mx-auto max-w-2xl space-y-6 text-center">
					<h1 className="text-center font-semibold text-4xl lg:text-5xl">
						Pricing Built for Data Professionals
					</h1>
					<p className="text-muted-foreground">
						Choose the perfect plan to accelerate your data science career. From
						exploring opportunities to landing your dream role, DataCV has you
						covered.
					</p>
				</div>

				<div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
					{pricingPlans.map((plan) => (
						<Card
							key={plan.id}
							className={`flex flex-col ${plan.popular ? "ring-2 ring-primary" : ""}`}
						>
							{plan.popular && (
								<div className="-top-3 -translate-x-1/2 absolute left-1/2">
									<div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 font-medium text-white text-xs">
										<Sparkles className="h-3 w-3" />
										Most Popular
									</div>
								</div>
							)}

							<CardHeader>
								<CardTitle className="flex items-center gap-2 font-medium">
									{plan.id === "lifetime_pro" && (
										<Zap className="h-4 w-4 text-amber-500" />
									)}
									{plan.name}
								</CardTitle>
								<div className="flex items-baseline gap-1">
									<span className="font-semibold text-3xl">{plan.price}</span>
									<span className="text-muted-foreground text-sm">
										{plan.period}
									</span>
								</div>
								<CardDescription className="text-sm">
									{plan.description}
								</CardDescription>
							</CardHeader>

							<CardContent className="flex-1 space-y-4">
								<hr className="border-dashed" />

								<ul className="space-y-3 text-sm">
									{plan.features.map((feature, index) => (
										<li key={index} className="flex items-start gap-2">
											<Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter>
								<Button
									variant={plan.buttonVariant}
									className="w-full"
									disabled={isLoading === plan.id}
									onClick={() => handleCheckout(plan.id, plan.polarProductSlug)}
								>
									{isLoading === plan.id ? "Loading..." : plan.buttonText}
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>

				<div className="mt-12 text-center">
					<p className="text-muted-foreground text-sm">
						All plans include SSL security, regular updates, and access to our
						data professional community.
					</p>
				</div>
			</div>
		</section>
	);
}
