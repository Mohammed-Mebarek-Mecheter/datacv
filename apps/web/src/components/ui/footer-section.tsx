import {
    Facebook,
    Instagram,
    Linkedin,
    Moon,
    Send,
    Sun,
    Twitter,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function Footerdemo() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isChatOpen, setIsChatOpen] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleThemeChange = (checked: boolean) => {
        setTheme(checked ? "dark" : "light");
    };

    // Don't render theme-dependent UI until after hydration
    if (!mounted) {
        return (
            <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
                <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
                    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                        <div className="relative">
                            <h2 className="mb-4 font-bold text-3xl tracking-tight">
                                Stay Connected
                            </h2>
                            <p className="mb-6 text-muted-foreground">
                                Join our newsletter for the latest updates and exclusive offers.
                            </p>
                            <form className="relative">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="pr-12 backdrop-blur-sm"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute top-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                                >
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">Subscribe</span>
                                </Button>
                            </form>
                            <div className="-right-4 absolute top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                        </div>
                        <div>
                            <h3 className="mb-4 font-semibold text-lg">Quick Links</h3>
                            <nav className="space-y-2 text-sm">
                                <a
                                    href="#"
                                    className="block transition-colors hover:text-primary"
                                >
                                    Home
                                </a>
                                <a
                                    href="#"
                                    className="block transition-colors hover:text-primary"
                                >
                                    About Us
                                </a>
                                <a
                                    href="#"
                                    className="block transition-colors hover:text-primary"
                                >
                                    Services
                                </a>
                                <a
                                    href="#"
                                    className="block transition-colors hover:text-primary"
                                >
                                    Products
                                </a>
                                <a
                                    href="#"
                                    className="block transition-colors hover:text-primary"
                                >
                                    Contact
                                </a>
                            </nav>
                        </div>
                        <div>
                            <h3 className="mb-4 font-semibold text-lg">Contact Us</h3>
                            <address className="space-y-2 text-sm not-italic">
                                <p>123 Innovation Street</p>
                                <p>Tech City, TC 12345</p>
                                <p>Phone: (123) 456-7890</p>
                                <p>Email: hello@example.com</p>
                            </address>
                        </div>
                        <div className="relative">
                            <h3 className="mb-4 font-semibold text-lg">Follow Us</h3>
                            <div className="mb-6 flex space-x-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-full"
                                            >
                                                <Facebook className="h-4 w-4" />
                                                <span className="sr-only">Facebook</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Follow us on Facebook</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-full"
                                            >
                                                <Twitter className="h-4 w-4" />
                                                <span className="sr-only">Twitter</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Follow us on Twitter</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-full"
                                            >
                                                <Instagram className="h-4 w-4" />
                                                <span className="sr-only">Instagram</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Follow us on Instagram</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-full"
                                            >
                                                <Linkedin className="h-4 w-4" />
                                                <span className="sr-only">LinkedIn</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Connect with us on LinkedIn</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Sun className="h-4 w-4" />
                                <Switch
                                    id="dark-mode"
                                    checked={false}
                                    onCheckedChange={() => {}}
                                    aria-label="Toggle theme"
                                />
                                <Moon className="h-4 w-4" />
                                <Label htmlFor="dark-mode" className="sr-only">
                                    Toggle dark mode
                                </Label>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
                        <p className="text-muted-foreground text-sm">
                            © 2024 Your Company. All rights reserved.
                        </p>
                        <nav className="flex gap-4 text-sm">
                            <a href="#" className="transition-colors hover:text-primary">
                                Privacy Policy
                            </a>
                            <a href="#" className="transition-colors hover:text-primary">
                                Terms of Service
                            </a>
                            <a href="#" className="transition-colors hover:text-primary">
                                Cookie Settings
                            </a>
                        </nav>
                    </div>
                </div>
            </footer>
        );
    }

    const isDarkMode = theme === "dark";

    return (
        <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
            <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                        <h2 className="mb-4 font-bold text-3xl tracking-tight">
                            Stay Connected
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Join our newsletter for the latest updates and exclusive offers.
                        </p>
                        <form className="relative">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="pr-12 backdrop-blur-sm"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute top-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                            >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Subscribe</span>
                            </Button>
                        </form>
                        <div className="-right-4 absolute top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                    </div>
                    <div>
                        <h3 className="mb-4 font-semibold text-lg">Quick Links</h3>
                        <nav className="space-y-2 text-sm">
                            <a
                                href="#"
                                className="block transition-colors hover:text-primary"
                            >
                                Home
                            </a>
                            <a
                                href="#"
                                className="block transition-colors hover:text-primary"
                            >
                                About Us
                            </a>
                            <a
                                href="#"
                                className="block transition-colors hover:text-primary"
                            >
                                Services
                            </a>
                            <a
                                href="#"
                                className="block transition-colors hover:text-primary"
                            >
                                Products
                            </a>
                            <a
                                href="#"
                                className="block transition-colors hover:text-primary"
                            >
                                Contact
                            </a>
                        </nav>
                    </div>
                    <div>
                        <h3 className="mb-4 font-semibold text-lg">Contact Us</h3>
                        <address className="space-y-2 text-sm not-italic">
                            <p>123 Innovation Street</p>
                            <p>Tech City, TC 12345</p>
                            <p>Phone: (123) 456-7890</p>
                            <p>Email: hello@example.com</p>
                        </address>
                    </div>
                    <div className="relative">
                        <h3 className="mb-4 font-semibold text-lg">Follow Us</h3>
                        <div className="mb-6 flex space-x-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <Facebook className="h-4 w-4" />
                                            <span className="sr-only">Facebook</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow us on Facebook</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <Twitter className="h-4 w-4" />
                                            <span className="sr-only">Twitter</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow us on Twitter</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <Instagram className="h-4 w-4" />
                                            <span className="sr-only">Instagram</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow us on Instagram</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <Linkedin className="h-4 w-4" />
                                            <span className="sr-only">LinkedIn</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Connect with us on LinkedIn</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4" />
                            <Switch
                                id="dark-mode"
                                checked={isDarkMode}
                                onCheckedChange={handleThemeChange}
                                aria-label="Toggle theme"
                            />
                            <Moon className="h-4 w-4" />
                            <Label htmlFor="dark-mode" className="sr-only">
                                Toggle dark mode
                            </Label>
                        </div>
                    </div>
                </div>
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
                    <p className="text-muted-foreground text-sm">
                        © 2024 Your Company. All rights reserved.
                    </p>
                    <nav className="flex gap-4 text-sm">
                        <a href="#" className="transition-colors hover:text-primary">
                            Privacy Policy
                        </a>
                        <a href="#" className="transition-colors hover:text-primary">
                            Terms of Service
                        </a>
                        <a href="#" className="transition-colors hover:text-primary">
                            Cookie Settings
                        </a>
                    </nav>
                </div>
            </div>
        </footer>
    );
}

export { Footerdemo };
