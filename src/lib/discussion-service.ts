import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, increment, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { DiscussionPost, DiscussionReply, DiscussionFilters, CreatePostRequest, CreateReplyRequest } from '@/types/discussion';

export class DiscussionService {
  private db = getFirebaseDb();

  async createPost(request: CreatePostRequest, userId: string, userName: string, userAvatar?: string): Promise<string> {
    if (!this.db) throw new Error('Firestore not initialized');

    const postData = {
      ...request,
      authorId: userId,
      authorName: userName,
      authorAvatar: userAvatar || '',
      status: 'active',
      replyCount: 0,
      viewCount: 0,
      tags: request.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(this.db, 'discussionPosts'), postData);
    return docRef.id;
  }

  async getPosts(courseId: string, filters: DiscussionFilters = {}): Promise<DiscussionPost[]> {
    if (!this.db) throw new Error('Firestore not initialized');

    let q = query(
      collection(this.db, 'discussionPosts'),
      where('courseId', '==', courseId)
    );

    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.authorId) {
      q = query(q, where('authorId', '==', filters.authorId));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'mostReplies':
        q = query(q, orderBy('replyCount', 'desc'));
        break;
      case 'mostViews':
        q = query(q, orderBy('viewCount', 'desc'));
        break;
      case 'lastReply':
        q = query(q, orderBy('lastReplyAt', 'desc'));
        break;
      case 'oldest':
        q = query(q, orderBy('createdAt', 'asc'));
        break;
      default:
        q = query(q, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DiscussionPost));

    // Apply search filter if provided
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return posts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return posts;
  }

  async getPost(postId: string): Promise<DiscussionPost | null> {
    if (!this.db) throw new Error('Firestore not initialized');

    const docRef = doc(this.db, 'discussionPosts', postId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    // Increment view count
    await updateDoc(docRef, {
      viewCount: increment(1)
    });

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as DiscussionPost;
  }

  async createReply(request: CreateReplyRequest, userId: string, userName: string, userAvatar?: string): Promise<string> {
    if (!this.db) throw new Error('Firestore not initialized');

    const replyData = {
      postId: request.postId,
      content: request.content,
      authorId: userId,
      authorName: userName,
      authorAvatar: userAvatar || '',
      parentReplyId: request.parentReplyId || null,
      isEdited: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(this.db, 'discussionReplies'), replyData);

    // Update post's reply count and last reply info
    await updateDoc(doc(this.db, 'discussionPosts', request.postId), {
      replyCount: increment(1),
      lastReplyAt: serverTimestamp(),
      lastReplyBy: userName
    });

    return docRef.id;
  }

  async getReplies(postId: string): Promise<DiscussionReply[]> {
    if (!this.db) throw new Error('Firestore not initialized');

    const q = query(
      collection(this.db, 'discussionReplies'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DiscussionReply));
  }

  async updatePost(postId: string, updates: Partial<DiscussionPost>): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');

    await updateDoc(doc(this.db, 'discussionPosts', postId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async updateReply(replyId: string, content: string): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');

    await updateDoc(doc(this.db, 'discussionReplies', replyId), {
      content,
      isEdited: true,
      updatedAt: serverTimestamp()
    });
  }

  async deletePost(postId: string): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');

    // Delete all replies associated with this post
    const repliesQuery = query(
      collection(this.db, 'discussionReplies'),
      where('postId', '==', postId)
    );
    const repliesSnapshot = await getDocs(repliesQuery);
    
    const deletePromises = repliesSnapshot.docs.map(replyDoc =>
      deleteDoc(doc(this.db, 'discussionReplies', replyDoc.id))
    );
    
    await Promise.all(deletePromises);
    await deleteDoc(doc(this.db, 'discussionPosts', postId));
  }

  async deleteReply(replyId: string): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');

    const replyDoc = await getDoc(doc(this.db, 'discussionReplies', replyId));
    if (replyDoc.exists()) {
      const postId = replyDoc.data().postId;
      await deleteDoc(doc(this.db, 'discussionReplies', replyId));
      
      // Update post's reply count
      await updateDoc(doc(this.db, 'discussionPosts', postId), {
        replyCount: increment(-1)
      });
    }
  }
}

export const discussionService = new DiscussionService();