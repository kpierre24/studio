import { getFirebaseStorage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  url: string;
  path: string;
  metadata: {
    name: string;
    size: number;
    type: string;
    timeCreated: string;
  };
}

export class FileUploadService {
  private static instance: FileUploadService;

  static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  /**
   * Upload a file to Firebase Storage
   */
  async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const storage = getFirebaseStorage();
    if (!storage) {
      throw new Error('Firebase Storage is not available');
    }
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.({
            progress,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
          });
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const metadata = uploadTask.snapshot.metadata;
            
            resolve({
              url: downloadURL,
              path: uploadTask.snapshot.ref.fullPath,
              metadata: {
                name: metadata.name || file.name,
                size: metadata.size || file.size,
                type: metadata.contentType || file.type,
                timeCreated: metadata.timeCreated || new Date().toISOString(),
              },
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    basePath: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file, index) => {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${basePath}/${fileName}`;
      
      return this.uploadFile(file, filePath, (progress) => {
        onProgress?.(index, progress);
      });
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Firebase Storage
   */
  async deleteFile(path: string): Promise<void> {
    const storage = getFirebaseStorage();
    if (!storage) {
      throw new Error('Firebase Storage is not available');
    }
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  /**
   * Generate a unique file path
   */
  generateFilePath(userId: string, courseId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `uploads/${userId}/${courseId}/${timestamp}-${sanitizedFileName}`;
  }

  /**
   * Validate file type and size
   */
  validateFile(
    file: File,
    allowedTypes: string[] = [],
    maxSize: number = 10 * 1024 * 1024 // 10MB
  ): { valid: boolean; error?: string } {
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    return { valid: true };
  }

  /**
   * Get file type category
   */
  getFileCategory(mimeType: string): 'image' | 'video' | 'document' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('presentation')
    ) {
      return 'document';
    }
    return 'other';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileUploadService = FileUploadService.getInstance();