import { motion } from "framer-motion";
import { FileText, MoveRight, Sparkles } from "lucide-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextLoop } from "@/components/ui/text-loop";

function Hero() {
	const [titleNumber, setTitleNumber] = useState(0);
	// Update titles to reflect data professional focus
	const titles = useMemo(() => ["impactful", "effective", "optimized"], []);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (titleNumber === titles.length - 1) {
				setTitleNumber(0);
			} else {
				setTitleNumber(titleNumber + 1);
			}
		}, 5000);
		return () => clearTimeout(timeoutId);
	}, [titleNumber, titles]);

	return (
		<div className="w-full">
			<div className="container mx-auto">
				<div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
					<div>
						{/* Update button text and icon */}
						<Badge className="mb-6" variant="secondary">
							<Sparkles className="mr-2 h-4 w-4" />
							<TextLoop interval={3} className="font-medium">
								{[
									"AI-Powered Resume Builder for Data Pros",
									"Built by Data Scientists, for Data Scientists",
									"Finally, a Resume Builder That Gets Data Careers",
								]}
							</TextLoop>
						</Badge>
					</div>
					<div className="flex flex-col gap-4">
						{/* Update main headline */}
						<h1 className="max-w-2xl text-center font-regular text-5xl tracking-tighter md:text-7xl">
							<span className="text-spektr-cyan-50">Build an</span>
							<span className="relative flex w-full justify-center overflow-hidden text-center md:pt-1 md:pb-4">
								&nbsp;
								{titles.map((title, index) => (
									<motion.span
										key={index}
										className="absolute font-semibold"
										initial={{ opacity: 0, y: "-100" }}
										transition={{ type: "spring", stiffness: 50 }}
										animate={
											titleNumber === index
												? {
														y: 0,
														opacity: 1,
													}
												: {
														y: titleNumber > index ? -150 : 150,
														opacity: 0,
													}
										}
									>
										{title}
									</motion.span>
								))}
							</span>
							<span className="text-spektr-cyan-50">data resume</span>{" "}
							{/* Added closing span */}
						</h1>

						{/* Update subheading text */}
						<p className="max-w-2xl text-center text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
							DataCV crafts resumes and CVs specifically for data professionals.
							Highlight your technical skills, quantify your impact, and tailor
							your application to data roles with AI-powered precision.
						</p>
					</div>
					<div className="flex flex-row gap-3">
						{/* Update button text and icon */}
						<Button size="lg" className="gap-4" variant="outline">
							View Templates <FileText className="h-4 w-4" />
						</Button>
						<Button size="lg" className="gap-4">
							Start Building <MoveRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export { Hero };
