import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface FriendRequest {
    id: string;
    from: {
        uid: string;
        displayName: string;
        photoURL: string | null;
        email: string;
    };
    createdAt: any;
}

export function useFriendRequests(userId: string | undefined) {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        // 받은 친구 요청 실시간 리스너
        const q = query(
            collection(db, 'friendRequests'),
            where('to', '==', userId),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const requestsData: FriendRequest[] = [];

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                // 요청자 정보 가져오기
                const userDoc = await getDoc(doc(db, 'users', data.from));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    requestsData.push({
                        id: docSnap.id,
                        from: {
                            uid: data.from,
                            displayName: userData.displayName || '사용자',
                            photoURL: userData.photoURL || null,
                            email: userData.email || '',
                        },
                        createdAt: data.createdAt,
                    });
                }
            }

            setRequests(requestsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const acceptRequest = async (requestId: string, fromUid: string) => {
        if (!userId) return;

        try {
            // 1. friendRequests 상태를 'accepted'로 업데이트
            await updateDoc(doc(db, 'friendRequests', requestId), {
                status: 'accepted',
            });

            // 2. friends 컬렉션에 추가 (양방향)
            await addDoc(collection(db, 'friends'), {
                users: [userId, fromUid],
                createdAt: serverTimestamp(),
                status: 'active',
            });

            toast.success('친구 요청을 수락했습니다');
        } catch (error) {
            console.error('Error accepting friend request:', error);
            toast.error('친구 요청 수락 중 오류가 발생했습니다');
        }
    };

    const rejectRequest = async (requestId: string) => {
        try {
            // friendRequests 상태를 'rejected'로 업데이트
            await updateDoc(doc(db, 'friendRequests', requestId), {
                status: 'rejected',
            });

            toast.success('친구 요청을 거절했습니다');
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            toast.error('친구 요청 거절 중 오류가 발생했습니다');
        }
    };

    return { requests, loading, acceptRequest, rejectRequest };
}
