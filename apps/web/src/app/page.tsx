// src/app/(marketing)/page.tsx
'use client'
import Link from 'next/link';
import { ArrowRight, CheckCircle, Sparkles, FileText, BarChart3, Target, Zap, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footerdemo } from "@/components/ui/footer-section";
import { Hero } from "@/components/animated-hero";
import Testimonials from "@/components/testimonials";
import FAQs from "@/components/faqs";
import { HeroHeader } from "@/components/header";

const solutionFeatures = [
    {
        icon: BarChart3,
        title: "Data-Focused AI",
        description: "AI prompts fine-tuned for data roles, emphasizing metrics like accuracy improvements, cost savings, and data scale impacts.",
        highlight: "89% of users report improved interview rates"
    },
    {
        icon: FileText,
        title: "Flexible Document Types",
        description: "Create resumes for industry roles, CVs for research positions, and cover letters tailored to specific data opportunities.",
        highlight: "Support for unlimited-length CVs"
    },
    {
        icon: Target,
        title: "Job Match Analysis",
        description: "AI analyzes how well your resume matches job descriptions and provides specific recommendations for improvement.",
        highlight: "Increase match scores by 40% on average"
    },
    {
        icon: Zap,
        title: "ATS Optimization",
        description: "Ensure your resume passes Applicant Tracking Systems with built-in optimization and scoring.",
        highlight: "95% ATS compatibility rate"
    },
    {
        icon: Sparkles,
        title: "Smart Templates",
        description: "Industry-specific templates optimized for different data roles, from entry-level analysts to senior architects.",
        highlight: "20+ data-specific templates"
    },
    {
        icon: CheckCircle,
        title: "Quantified Impact",
        description: "Specialized sections for showcasing data projects, model performance, and measurable business outcomes.",
        highlight: "Built-in impact calculators"
    }
];

const companyLogos = [
    "Google", "Meta", "Microsoft", "Amazon", "Netflix", "Uber", "Airbnb", "Spotify"
];

const socialProof = [
    {
        metric: "5,000+",
        label: "Data Professionals",
        description: "Using DataCV to advance their careers"
    },
    {
        metric: "89%",
        label: "Success Rate",
        description: "Report improved interview rates"
    },
    {
        metric: "150+",
        label: "Top Companies",
        description: "Where our users have been hired"
    }
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <HeroHeader />
            <Hero />

            {/* Social Proof Section */}
            <section className="py-12 px-6 border-b bg-background">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <p className="text-sm text-muted-foreground mb-6">
                            Trusted by data professionals at leading companies
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                            {companyLogos.map((company, index) => (
                                <div key={index} className="text-lg font-semibold">
                                    {company}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        {socialProof.map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl font-bold text-primary mb-2">{item.metric}</div>
                                <div className="font-semibold mb-1">{item.label}</div>
                                <div className="text-sm text-muted-foreground">{item.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-background px-6 py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <Badge className="mb-4" variant="secondary">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Research-Backed Insights
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Built Specifically for Data Professionals
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Every feature designed with data careers in mind
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {solutionFeatures.map((feature, index) => (
                            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <feature.icon className="w-10 h-10 text-primary mb-4" />
                                    <CardTitle>{feature.title}</CardTitle>
                                    <Badge variant="secondary" className="absolute top-4 right-4 text-xs">
                                        {feature.highlight}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    {feature.description}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-16 px-6 bg-background">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            DataCV vs. Generic Resume Builders
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            See why data professionals choose DataCV over tools like Rezi.ai
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold">Why Generic Tools Fail Data Professionals</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                    <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-destructive-foreground text-sm font-bold">✗</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-destructive">Generic AI Makes Stuff Up</p>
                                        <p className="text-sm text-destructive/80">Tools like Rezi.ai suggest irrelevant achievements and pull content from wrong sections</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                    <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-destructive-foreground text-sm font-bold">✗</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-destructive">Artificial Length Limits</p>
                                        <p className="text-sm text-destructive/80">Senior professionals can't showcase 15+ years of patents, publications, and complex projects</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                    <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-destructive-foreground text-sm font-bold">✗</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-destructive">No Data-Specific Features</p>
                                        <p className="text-sm text-destructive/80">Missing sections for ML models, data pipelines, research publications, and quantified business impact</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-primary">How DataCV Solves These Problems</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary">AI Trained on Data Roles</p>
                                        <p className="text-sm text-primary/80">Understands technical achievements like "improved model accuracy by 23%" and "reduced processing time by 40%"</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary">Unlimited CV Length</p>
                                        <p className="text-sm text-primary/80">Support for multi-page CVs perfect for research roles and senior professionals</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary">Data-Specific Templates</p>
                                        <p className="text-sm text-primary/80">Specialized sections for ML projects, data pipelines, publications, and quantified business outcomes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Testimonials />

            {/* CTA Section */}
            <section className="bg-background px-6 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge className="mb-6" variant="secondary">
                        <Users className="w-4 h-4 mr-2" />
                        Join 5,000+ Data Professionals
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Build Your Data Career Resume?
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                        Stop wasting time with generic tools that don't understand your expertise.
                        Join thousands of data professionals who've accelerated their careers with DataCV.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Button asChild size="lg" className="text-lg px-8">
                            <Link href="/sign-up">
                                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="lg" className="text-lg px-8">
                            <Link href="/pricing">
                                View Pricing
                            </Link>
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Free tier includes 2 documents and 10 AI generations</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>30-day money-back guarantee</span>
                        </div>
                    </div>
                </div>
            </section>

            <FAQs />

            <Footerdemo />
        </div>
    );
}
