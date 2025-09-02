"use client";
import type { SpringOptions } from "motion/react";
import { motion, useSpring, useTransform } from "motion/react";
import type { JSX } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type AnimatedNumberProps = {
	value: number;
	className?: string;
	springOptions?: SpringOptions;
	as?: React.ElementType;
};

export function AnimatedNumber({
	value,
	className,
	springOptions,
	as = "span",
}: AnimatedNumberProps) {
	const MotionComponent = motion.create(as as keyof JSX.IntrinsicElements);

	const spring = useSpring(value, springOptions);
	const display = useTransform(spring, (current) =>
		Math.round(current).toLocaleString(),
	);

	useEffect(() => {
		spring.set(value);
	}, [spring, value]);

	return (
		<MotionComponent className={cn("tabular-nums", className)}>
			{display}
		</MotionComponent>
	);
}
