import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export default function AnimatedButton({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    className,
    disabled,
    ...props
}: AnimatedButtonProps) {
    const baseStyles = "font-medium rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

    const variantStyles = {
        primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20",
        secondary: "bg-bg-paper hover:bg-white/10 text-text-primary border border-white/10",
        ghost: "hover:bg-white/5 text-text-primary",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
    };

    const sizeStyles = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-2.5 text-base",
        lg: "px-8 py-3 text-lg"
    };

    return (
        <motion.button
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
            whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
            }}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    <span>처리 중...</span>
                </>
            ) : (
                children
            )}
        </motion.button>
    );
}
