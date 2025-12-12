import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

interface AnimatedInputProps extends Omit<HTMLMotionProps<"input">, "type"> {
    label?: string;
    error?: string;
    type?: string;
    icon?: ReactNode;
}

export default function AnimatedInput({
    label,
    error,
    className,
    icon,
    ...props
}: AnimatedInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium text-text-secondary">
                    {label}
                </label>
            )}

            <motion.div
                className="relative"
                animate={{
                    scale: isFocused ? 1.01 : 1
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                }}
            >
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                        {icon}
                    </div>
                )}

                <motion.input
                    className={cn(
                        "w-full bg-bg-paper text-text-primary rounded-2xl px-4 py-3 transition-all duration-200",
                        "border-2 focus:outline-none",
                        error
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/5 focus:border-brand-500/50",
                        icon && "pl-12",
                        className
                    )}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
