import dynamic from 'next/dynamic';

// Dynamically import heavy components
export const DynamicMessageBubble = dynamic(
    () => import('@/components/chat/MessageBubble')
);

export const DynamicChatRoom = dynamic(
    () => import('@/components/chat/ChatRoom')
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
