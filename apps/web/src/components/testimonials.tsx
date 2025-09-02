import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Testimonials() {
	return (
		<section className="bg-background py-16 md:py-32">
			<div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
				<div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
					<h2 className="font-medium text-4xl lg:text-5xl">
						Trusted by Data Professionals Worldwide
					</h2>
					<p>
						From machine learning engineers to data scientists, professionals
						use DataCV to showcase their quantifiable impact and land roles at top
						tech companies.
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
					<Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2">
						<CardHeader>
							<div className="mb-4 flex items-center gap-2">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className="h-4 w-4 fill-yellow-400 text-yellow-400"
									/>
								))}
							</div>
						</CardHeader>
						<CardContent>
							<blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
								<p className="font-medium text-xl">
									Finally, a resume builder that understands what hiring
									managers in data science are looking for. The AI suggestions
									actually make sense and helped me highlight my ML projects
									with proper impact metrics. I got 3 interview requests in my
									first week of applying!
								</p>

								<div className="grid grid-cols-[auto_1fr] items-center gap-3">
									<Avatar className="size-12">
										<AvatarImage
											src="https://tailus.io/images/reviews/shekinah.webp"
											alt="Shekinah Tshiokufila"
											height="400"
											width="400"
											loading="lazy"
										/>
										<AvatarFallback>SC</AvatarFallback>
									</Avatar>

									<div>
										<cite className="font-medium text-sm">Sarah Chen</cite>
										<span className="block text-muted-foreground text-sm">
											Senior Data Scientist
										</span>
									</div>
								</div>
							</blockquote>
						</CardContent>
					</Card>
					<Card className="md:col-span-2">
						<CardContent className="h-full pt-6">
							<blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
								<p className="font-medium text-xl">
									DataCV helped me transition from academia to industry by
									transforming my research publications into business impact
									statements. The job match analysis feature is incredibly
									valuable.
								</p>

								<div className="grid grid-cols-[auto_1fr] items-center gap-3">
									<Avatar className="size-12">
										<AvatarImage
											src="https://tailus.io/images/reviews/jonathan.webp"
											alt="Dr. Michael Rodriguez"
											height="400"
											width="400"
											loading="lazy"
										/>
										<AvatarFallback>MR</AvatarFallback>
									</Avatar>
									<div>
										<cite className="font-medium text-sm">
											Dr. Michael Rodriguez
										</cite>
										<span className="block text-muted-foreground text-sm">
											ML Engineer
										</span>
									</div>
								</div>
							</blockquote>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="h-full pt-6">
							<blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
								<p>
									The industry-specific templates and ATS optimization made all
									the difference. My resume now properly showcases my data
									pipeline work and cloud architecture experience.
								</p>

								<div className="grid items-center gap-3 [grid-template-columns:auto_1fr]">
									<Avatar className="size-12">
										<AvatarImage
											src="https://tailus.io/images/reviews/yucel.webp"
											alt="Jessica Park"
											height="400"
											width="400"
											loading="lazy"
										/>
										<AvatarFallback>JP</AvatarFallback>
									</Avatar>
									<div>
										<cite className="font-medium text-sm">Jessica Park</cite>
										<span className="block text-muted-foreground text-sm">
											Data Engineer
										</span>
									</div>
								</div>
							</blockquote>
						</CardContent>
					</Card>
					<Card className="card variant-mixed">
						<CardContent className="h-full pt-6">
							<blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
								<p>
									As a senior data professional with 15+ years experience, I
									needed more than a one-page resume. DataCV's flexible CV format
									let me showcase my full career journey and technical
									expertise.
								</p>

								<div className="grid grid-cols-[auto_1fr] gap-3">
									<Avatar className="size-12">
										<AvatarImage
											src="https://tailus.io/images/reviews/rodrigo.webp"
											alt="David Kim"
											height="400"
											width="400"
											loading="lazy"
										/>
										<AvatarFallback>DK</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium text-sm">David Kim</p>
										<span className="block text-muted-foreground text-sm">
											Principal Data Architect
										</span>
									</div>
								</div>
							</blockquote>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
