# ClassroomHQ Firestore Data Structure

This document outlines the intended Firestore collection and subcollection structure
for the ClassroomHQ application, based on the defined types and security rules.

Firestore creates collections automatically when the first document is added to them.
This schema is for reference and to guide data interaction.

## Top-Level Collections

1.  **`users`**
    *   Path: `/users/{userId}`
    *   Description: Stores user profiles (SuperAdmins, Teachers, Students).
    *   Fields: Corresponds to the `User` type in `src/types/index.ts`.
        *   `id` (string, document ID should match `userId`)
        *   `name` (string)
        *   `email` (string)
        *   `role` (string, from `UserRole` enum)
        *   `avatarUrl` (string, optional)
        *   *(Password is handled by Firebase Authentication, not stored here)*

2.  **`courses`**
    *   Path: `/courses/{courseId}`
    *   Description: Stores course information.
    *   Fields: Corresponds to the `Course` type.
        *   `id` (string, document ID should match `courseId`)
        *   `name` (string)
        *   `description` (string)
        *   `teacherId` (string, ID of a user with Teacher role)
        *   `studentIds` (array of strings, IDs of enrolled students)
        *   `category` (string, optional)
        *   `cost` (number)
        *   `prerequisites` (array of strings, course IDs, optional)
    *   **Subcollections:**
        *   `lessons`
        *   `assignments`

3.  **`enrollments`**
    *   Path: `/enrollments/{enrollmentId}`
    *   Description: Tracks student enrollments in courses. Each document represents one enrollment.
    *   Fields: Corresponds to the `Enrollment` type.
        *   `id` (string, document ID)
        *   `studentId` (string)
        *   `courseId` (string)
        *   `enrollmentDate` (timestamp or ISO string)
        *   `grade` (string, optional, e.g., "A", "B+", "85%")

4.  **`attendanceRecords`**
    *   Path: `/attendanceRecords/{attendanceRecordId}`
    *   Description: Stores individual attendance records for students in courses for specific dates.
    *   Fields: Corresponds to the `AttendanceRecord` type.
        *   `id` (string, document ID)
        *   `studentId` (string)
        *   `courseId` (string)
        *   `date` (string, YYYY-MM-DD format or timestamp)
        *   `status` (string, from `AttendanceStatus` enum)
        *   `notes` (string, optional)

5.  **`payments`**
    *   Path: `/payments/{paymentId}`
    *   Description: Tracks payments made by students for courses.
    *   Fields: Corresponds to the `Payment` type.
        *   `id` (string, document ID)
        *   `studentId` (string)
        *   `courseId` (string)
        *   `amount` (number)
        *   `status` (string, from `PaymentStatus` enum)
        *   `paymentDate` (timestamp or ISO string)
        *   `transactionId` (string, optional)
        *   `notes` (string, optional)

6.  **`notifications`**
    *   Path: `/notifications/{notificationId}`
    *   Description: Stores notifications for users. These are typically targeted.
    *   Fields: Corresponds to the `NotificationMessage` type.
        *   `id` (string, document ID)
        *   `userId` (string, ID of the target user)
        *   `courseId` (string, optional, context course)
        *   `type` (string, e.g., 'grade_update', 'new_assignment')
        *   `message` (string)
        *   `link` (string, optional)
        *   `read` (boolean)
        *   `timestamp` (timestamp or number)

7.  **`announcements`**
    *   Path: `/announcements/{announcementId}`
    *   Description: Stores general or course-specific announcements.
    *   Fields: Corresponds to the `Announcement` type.
        *   `id` (string, document ID)
        *   `message` (string)
        *   `timestamp` (timestamp or number)
        *   `type` (string)
        *   `courseId` (string, optional)
        *   `userId` (string, optional, for announcements targeting specific users, though notifications are better for this)
        *   `link` (string, optional)

## Subcollections

1.  **`lessons` (under `courses`)**
    *   Path: `/courses/{courseId}/lessons/{lessonId}`
    *   Description: Stores lessons for a specific course.
    *   Fields: Corresponds to the `Lesson` type.
        *   `id` (string, document ID should match `lessonId`)
        *   `title` (string)
        *   `contentMarkdown` (string)
        *   `videoUrl` (string, optional)
        *   `fileUrl` (string, optional, from Firebase Storage)
        *   `fileName` (string, optional)
        *   `order` (number)
        *   *(Implicit `courseId` from parent document)*

2.  **`assignments` (under `courses`)**
    *   Path: `/courses/{courseId}/assignments/{assignmentId}`
    *   Description: Stores assignments for a specific course.
    *   Fields: Corresponds to the `Assignment` type.
        *   `id` (string, document ID should match `assignmentId`)
        *   `title` (string)
        *   `description` (string)
        *   `dueDate` (timestamp or ISO string)
        *   `type` (string, from `AssignmentType` enum)
        *   `totalPoints` (number)
        *   `rubric` (array of objects, for standard assignments, optional)
        *   `questions` (array of objects, for quiz assignments, optional)
        *   *(Implicit `courseId` from parent document)*
    *   **Subcollections:**
        *   `submissions`

3.  **`submissions` (under `assignments`)**
    *   Path: `/courses/{courseId}/assignments/{assignmentId}/submissions/{submissionId}`
    *   Description: Stores student submissions for a specific assignment.
    *   Fields: Corresponds to the `Submission` type.
        *   `id` (string, document ID should match `submissionId`)
        *   `studentId` (string)
        *   `submittedAt` (timestamp or ISO string)
        *   `content` (string, optional, for text responses)
        *   `fileUrl` (string, optional, for file uploads via Firebase Storage)
        *   `quizAnswers` (array of objects, optional, for quiz submissions)
        *   `grade` (number, optional)
        *   `feedback` (string, optional)
        *   `rubricScores` (array of objects, optional)
        *   *(Implicit `courseId` and `assignmentId` from parent documents)*

This structure is designed to work well with Firestore's querying capabilities and the security rules defined for the application.
