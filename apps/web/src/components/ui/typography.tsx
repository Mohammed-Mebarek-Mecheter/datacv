// components/ui/typography.tsx
import * as React from "react"; // Import React for type definitions and forwardRef

// Define a type for props that includes standard HTML attributes
// This allows passing className, onClick, id, etc.
interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
	// You can add specific props here if needed, but for basic text, HTMLAttributes covers most cases.
}

// --- Headings ---
export const TypographyH1 = React.forwardRef<
	HTMLHeadingElement,
	TypographyProps // Use the defined props type
>(({ className, children, ...props }, ref) => {
	return (
		<h1
			ref={ref}
			className={`scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl ${className || ""}`}
			{...props} // Spread other props like id, onClick, etc.
		>
			{children} {/* Render the content passed as children */}
		</h1>
	);
});
TypographyH1.displayName = "TypographyH1"; // Set display name for debugging

export const TypographyH2 = React.forwardRef<
	HTMLHeadingElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<h2
			ref={ref}
			className={`scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0 ${className || ""}`}
			{...props}
		>
			{children}
		</h2>
	);
});
TypographyH2.displayName = "TypographyH2";

export const TypographyH3 = React.forwardRef<
	HTMLHeadingElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<h3
			ref={ref}
			className={`scroll-m-20 font-semibold text-2xl tracking-tight ${className || ""}`}
			{...props}
		>
			{children}
		</h3>
	);
});
TypographyH3.displayName = "TypographyH3";

export const TypographyH4 = React.forwardRef<
	HTMLHeadingElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<h4
			ref={ref}
			className={`scroll-m-20 font-semibold text-xl tracking-tight ${className || ""}`}
			{...props}
		>
			{children}
		</h4>
	);
});
TypographyH4.displayName = "TypographyH4";

// --- Paragraphs and Text ---
export const TypographyP = React.forwardRef<
	HTMLParagraphElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<p
			ref={ref}
			className={`leading-7 [&:not(:first-child)]:mt-6 ${className || ""}`}
			{...props}
		>
			{children}
		</p>
	);
});
TypographyP.displayName = "TypographyP";

export const TypographyBlockquote = React.forwardRef<
	HTMLQuoteElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<blockquote
			ref={ref}
			className={`mt-6 border-l-2 pl-6 italic ${className || ""}`}
			{...props}
		>
			{children}
		</blockquote>
	);
});
TypographyBlockquote.displayName = "TypographyBlockquote";

export const TypographyLead = React.forwardRef<
	HTMLParagraphElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<p
			ref={ref}
			className={`text-muted-foreground text-xl ${className || ""}`}
			{...props}
		>
			{children}
		</p>
	);
});
TypographyLead.displayName = "TypographyLead";

export const TypographyLarge = React.forwardRef<
	HTMLDivElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<div
			ref={ref}
			className={`font-semibold text-lg ${className || ""}`}
			{...props}
		>
			{children}
		</div>
	);
});
TypographyLarge.displayName = "TypographyLarge";

export const TypographySmall = React.forwardRef<
	HTMLElement,
	TypographyProps // Could be HTMLSpanElement or HTMLElement
>(({ className, children, ...props }, ref) => {
	return (
		<small
			ref={ref}
			className={`font-medium text-sm leading-none ${className || ""}`}
			{...props}
		>
			{children}
		</small>
	);
});
TypographySmall.displayName = "TypographySmall";

export const TypographyMuted = React.forwardRef<
	HTMLParagraphElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<p
			ref={ref}
			className={`text-muted-foreground text-sm ${className || ""}`}
			{...props}
		>
			{children}
		</p>
	);
});
TypographyMuted.displayName = "TypographyMuted";

// --- Inline Code ---
export const TypographyInlineCode = React.forwardRef<
	HTMLElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<code
			ref={ref}
			className={`relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm ${className || ""}`}
			{...props}
		>
			{children}
		</code>
	);
});
TypographyInlineCode.displayName = "TypographyInlineCode";

// --- Table ---
// Tables are slightly different as they usually contain structured content.
// You might use this component as a wrapper around standard <table> elements.
export const TypographyTableWrapper = React.forwardRef<
	HTMLDivElement,
	TypographyProps
>(({ className, children, ...props }, ref) => {
	return (
		<div
			ref={ref}
			className={`my-6 w-full overflow-y-auto ${className || ""}`}
			{...props}
		>
			{children} {/* Children would be your <table>...</table> */}
		</div>
	);
});
TypographyTableWrapper.displayName = "TypographyTableWrapper";

// Example usage of the corrected components in another file:
/*
import { TypographyH1, TypographyP, TypographyBlockquote } from "@/components/ui/typography";

export default function MyPage() {
  return (
    <div>
      <TypographyH1>My Actual Page Title</TypographyH1>
      <TypographyP>This is the first paragraph of my page content.</TypographyP>
      <TypographyP>This is the second paragraph.</TypographyP>
      <TypographyBlockquote>This is a quote relevant to my content.</TypographyBlockquote>
    </div>
  );
}
*/
