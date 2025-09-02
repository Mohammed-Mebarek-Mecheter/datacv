export default function FAQs() {
	return (
		<section className="scroll-py-16 bg-background py-16 md:scroll-py-32 md:py-32">
			<div className="mx-auto max-w-5xl px-6">
				<div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
					<div className="text-center lg:text-left">
						<h2 className="mb-4 font-semibold text-3xl text-foreground md:text-4xl">
							Frequently <br className="hidden lg:block" /> Asked{" "}
							<br className="hidden lg:block" />
							Questions
						</h2>
						<p className="text-muted-foreground">
							Everything you need to know about building data-focused resumes
							with DataCV.
						</p>
					</div>

					<div className="divide-y divide-border sm:mx-auto sm:max-w-lg lg:mx-0">
						<div className="pb-6">
							<h3 className="font-medium">
								What makes DataCV different from other resume builders?
							</h3>
							<p className="mt-4 text-muted-foreground">
								DataCV is specifically designed for data professionals. Unlike
								generic tools like Rezi.ai, our AI understands data-specific
								metrics, project types, and career progression. We help you
								quantify impacts like "improved model accuracy by 23%" and
								"reduced processing time by 40%."
							</p>

							<ul className="mt-4 list-outside list-disc space-y-2 pl-4">
								<li className="text-muted-foreground">
									Data-focused AI that doesn't "make stuff up" or pull from
									irrelevant sections
								</li>
								<li className="text-muted-foreground">
									Support for multi-page CVs for senior professionals and
									researchers
								</li>
								<li className="text-muted-foreground">
									Industry-specific templates optimized for data roles
								</li>
							</ul>
						</div>
						<div className="py-6">
							<h3 className="font-medium">
								Can I create both resumes and CVs?
							</h3>
							<p className="mt-4 text-muted-foreground">
								Yes! DataCV supports multiple document types including resumes
								(1-2 pages for industry roles), CVs (unlimited length for
								academic/research positions), and tailored cover letters. Our AI
								recommends the best format based on your target role and
								industry.
							</p>
						</div>
						<div className="py-6">
							<h3 className="font-medium">
								How does the AI job match analysis work?
							</h3>
							<p className="my-4 text-muted-foreground">
								Our AI analyzes your resume content against specific job
								descriptions and provides actionable recommendations to improve
								your match score.
							</p>
							<ul className="list-outside list-disc space-y-2 pl-4">
								<li className="text-muted-foreground">
									Identifies missing keywords and technical skills
								</li>
								<li className="text-muted-foreground">
									Suggests improvements to quantify your achievements better
								</li>
								<li className="text-muted-foreground">
									Provides ATS optimization recommendations
								</li>
							</ul>
						</div>
						<div className="py-6">
							<h3 className="font-medium">Is there a refund policy?</h3>
							<p className="mt-4 text-muted-foreground">
								We offer a 30-day money-back guarantee on all paid plans. If
								you're not satisfied with DataCV, contact our support team with
								your order details for a full refund.
							</p>
						</div>
						<div className="py-6">
							<h3 className="font-medium">
								What export formats are supported?
							</h3>
							<p className="mt-4 text-muted-foreground">
								Free users can export to PDF, DOCX, and TXT formats. Pro users
								also get JSON export for data portability and detailed export
								history tracking.
							</p>
						</div>
						<div className="py-6">
							<h3 className="font-medium">
								Do you offer support for specific data roles?
							</h3>
							<p className="mt-4 text-muted-foreground">
								Absolutely! DataCV has specialized templates and AI prompts for
								various data roles including Data Scientists, ML Engineers, Data
								Engineers, Data Analysts, Research Scientists, and Data
								Architects. Each template emphasizes the skills and achievements
								most relevant to that role.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
