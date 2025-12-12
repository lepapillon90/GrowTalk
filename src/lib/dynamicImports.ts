import dynamic from 'next/dynamic';

// Dynamically import heavy components
export const DynamicMessageBubble = dynamic(
    () => import('@/components/chat/MessageBubble'),
    {
        loading: () => (
            <div className= "animate-pulse bg-white/5 h-12 rounded-2xl w-48" />
        )
    }
);

export const DynamicChatRoom = dynamic(
    () => import('@/components/chat/ChatRoom'),
    {
        loading: () => (
            <div className= "flex items-center justify-center h-screen" >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
                </div>
        )
    }
);

export const DynamicEmptyState = dynamic(
    () => import('@/components/ui/EmptyState'),
    {
        ssr: true
    }
);

export const DynamicAnimatedButton = dynamic(
    () => import('@/components/ui/AnimatedButton'),
    {
        ssr: false
    }
);

export const DynamicAnimatedInput = dynamic(
    () => import('@/components/ui/AnimatedInput'),
    {
        ssr: false
    }
);
