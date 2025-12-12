import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Friend {
    uid: string;
    displayName: string;
    photoURL: string | null;
    email: string;
    statusMessage?: string;
}

export function useFriends(userId: string | undefined) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        // 친구 목록 실시간 리스너
        const q = query(
            collection(db, 'friends'),
            where('users', 'array-contains', userId),
            where('status', '==', 'active')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const friendsMap = new Map<string, Friend>();

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                // 친구 UID 찾기 (나를 제외한 다른 사용자)
                const friendUid = data.users.find((uid: string) => uid !== userId);

                if (friendUid && !friendsMap.has(friendUid)) {
                    // 친구 프로필 정보 가져오기
                    const friendDoc = await getDoc(doc(db, 'users', friendUid));
                    if (friendDoc.exists()) {
                        const friendData = friendDoc.data();
                        friendsMap.set(friendUid, {
                            uid: friendUid,
                            displayName: friendData.displayName || '사용자',
                            photoURL: friendData.photoURL || null,
                            email: friendData.email || '',
                            statusMessage: friendData.statusMessage || '',
                        });
                    }
                }
            }

            setFriends(Array.from(friendsMap.values()));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { friends, loading };
}
