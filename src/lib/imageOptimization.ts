/**
 * Image optimization utilities
 */

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Lazy load image with IntersectionObserver
 */
export function lazyLoadImage(
    img: HTMLImageElement,
    src: string,
    placeholder?: string
): void {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const image = entry.target as HTMLImageElement;
                    image.src = src;
                    image.classList.remove('lazy');
                    observer.unobserve(image);
                }
            });
        });

        if (placeholder) {
            img.src = placeholder;
        }
        img.classList.add('lazy');
        observer.observe(img);
    } else {
        // Fallback for browsers without IntersectionObserver
        img.src = src;
    }
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#151725');
        gradient.addColorStop(1, '#0B0C15');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    return canvas.toDataURL();
}

/**
 * Optimize image loading with native lazy loading
 */
export function optimizeImageElement(img: HTMLImageElement): void {
    // Enable native lazy loading
    img.loading = 'lazy';

    // Add decoding hint
    img.decoding = 'async';

    // Prevent layout shift
    if (!img.width || !img.height) {
        img.style.aspectRatio = '1';
    }
}
