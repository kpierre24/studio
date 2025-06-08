// ClassroomHQ - Core Application Types

// Enums
export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  TEACHER = 'Teacher',
  STUDENT = 'Student',
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late',
  EXCUSED = 'Excused',
}

export enum AssignmentType {
  STANDARD = 'standard', // e.g. essay, project with rubric or manual grading
  QUIZ = 'quiz', // multiple choice, true/false, short answer
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
  SHORT_ANSWER = 'short-answer',
}

export enum AnnouncementAudience {
  ALL = 'all', // All users
  STUDENTS = 'students', // All students
  TEACHERS = 'teachers', // All teachers
  COURSE_SPECIFIC = 'course_specific', // Students and teacher of a specific course
}

// Action Types (Simplified for brevity, expand as needed)
export enum ActionType {
  // Auth & User
  LOGIN_USER = 'LOGIN_USER',
  LOGOUT_USER = 'LOGOUT_USER',
  REGISTER_STUDENT = 'REGISTER_STUDENT',
  UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE',
  // Course Management
  CREATE_COURSE = 'CREATE_COURSE',
  UPDATE_COURSE = 'UPDATE_COURSE',
  DELETE_COURSE = 'DELETE_COURSE',
  ENROLL_COURSE = 'ENROLL_COURSE',
  // Lesson Management
  CREATE_LESSON = 'CREATE_LESSON',
  UPDATE_LESSON = 'UPDATE_LESSON',
  DELETE_LESSON = 'DELETE_LESSON',
  // Assignment & Submission
  CREATE_ASSIGNMENT = 'CREATE_ASSIGNMENT',
  UPDATE_ASSIGNMENT = 'UPDATE_ASSIGNMENT',
  DELETE_ASSIGNMENT = 'DELETE_ASSIGNMENT',
  SUBMIT_ASSIGNMENT = 'SUBMIT_ASSIGNMENT',
  GRADE_SUBMISSION = 'GRADE_SUBMISSION',
  // UI & Data
  LOAD_DATA = 'LOAD_DATA',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  SET_SUCCESS_MESSAGE = 'SET_SUCCESS_MESSAGE',
  CLEAR_SUCCESS_MESSAGE = 'CLEAR_SUCCESS_MESSAGE',
  // Notifications
  ADD_NOTIFICATION = 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ = 'MARK_NOTIFICATION_READ',
  MARK_ALL_NOTIFICATIONS_READ = 'MARK_ALL_NOTIFICATIONS_READ',
  CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS',
  // AI Quiz Generation
  GENERATE_QUIZ_QUESTIONS_SUCCESS = 'GENERATE_QUIZ_QUESTIONS_SUCCESS',
  GENERATE_QUIZ_QUESTIONS_ERROR = 'GENERATE_QUIZ_QUESTIONS_ERROR',
}

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Typically hashed, or not stored if using external auth
  role: UserRole;
  avatarUrl?: string; // Optional
}

export interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string | 'unassigned';
  studentIds: string[];
  category?: string;
  cost?: number; // Optional
  prerequisites?: string[]; // Course IDs
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  contentMarkdown: string; // Markdown content
  videoUrl?: string;
  fileUrl?: string; // Mock file URL
  order: number;
}

export interface QuizQuestion {
  id: string;
  assignmentId?: string; // Link back to assignment if part of a quiz assignment
  questionText: string;
  questionType: QuestionType;
  options?: string[]; // For multiple-choice
  correctAnswer: string | string[]; // string for T/F, short-answer; string[] for MC if multiple selections allowed (not typical for this app)
  points: number;
}

export interface RubricCriterion {
  id: string;
  description: string;
  points: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  type: AssignmentType;
  totalPoints: number;
  rubric?: RubricCriterion[]; // For standard assignments
  questions?: QuizQuestion[]; // For quiz assignments
}

export interface QuizAnswer {
  questionId: string;
  studentAnswer: string | string[];
  isCorrect?: boolean;
  autoGradeScore?: number;
  manualOverrideScore?: number;
  teacherComments?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string; // ISO date string
  content?: string; // For standard assignments (e.g., text response)
  fileUrl?: string; // For standard assignments
  quizAnswers?: QuizAnswer[]; // For quiz assignments
  grade?: number; // Final grade
  feedback?: string; // General feedback from teacher
  rubricScores?: { criterionId: string; score: number }[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string; // ISO date string
  grade?: string; // e.g., A, B, C or percentage
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string; // ISO date string (just date part)
  status: AttendanceStatus;
}

export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed';
  paymentDate?: string; // ISO date string
  transactionId?: string;
}

export interface NotificationMessage {
  id: string;
  userId?: string; // Target user, undefined for global
  courseId?: string; // Context course
  type: 'success' | 'error' | 'info' | 'warning' | 'new_assignment' | 'grade_update' | 'announcement';
  message: string;
  link?: string; // e.g., to an assignment or course
  read: boolean;
  timestamp: number;
}

// App State
export interface AppState {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  enrollments: Enrollment[];
  attendanceRecords: AttendanceRecord[];
  payments: Payment[];
  notifications: NotificationMessage[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// App Actions - Define payload types for each action
// Example:
export type LoginUserPayload = { email: string; password?: string /* IRL password check happens backend */ };
export type RegisterStudentPayload = Omit<User, 'id' | 'role' | 'avatarUrl'>;
export type UpdateUserProfilePayload = Partial<Pick<User, 'name' | 'email' | 'avatarUrl'>> & { id: string };
export type CreateCoursePayload = Omit<Course, 'id' | 'studentIds'>;
export type CreateLessonPayload = Omit<Lesson, 'id'>;
export type CreateAssignmentPayload = Omit<Assignment, 'id'| 'totalPoints'> & { manualTotalPoints?: number }; // totalPoints calculated
export type SubmitAssignmentPayload = Omit<Submission, 'id' | 'submittedAt' | 'grade' | 'feedback' | 'rubricScores'>;
export type GradeSubmissionPayload = Pick<Submission, 'id' | 'grade' | 'feedback' | 'rubricScores' | 'quizAnswers'> & { assignmentId: string; studentId: string };


export type AppAction =
  | { type: ActionType.LOGIN_USER; payload: LoginUserPayload }
  | { type: ActionType.LOGOUT_USER }
  | { type: ActionType.REGISTER_STUDENT; payload: RegisterStudentPayload }
  | { type: ActionType.UPDATE_USER_PROFILE; payload: UpdateUserProfilePayload }
  | { type: ActionType.CREATE_COURSE; payload: CreateCoursePayload }
  | { type: ActionType.CREATE_LESSON; payload: CreateLessonPayload }
  | { type: ActionType.CREATE_ASSIGNMENT; payload: CreateAssignmentPayload }
  | { type: ActionType.SUBMIT_ASSIGNMENT; payload: SubmitAssignmentPayload }
  | { type: ActionType.GRADE_SUBMISSION; payload: GradeSubmissionPayload }
  | { type: ActionType.LOAD_DATA; payload: Partial<AppState> }
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_ERROR; payload: string | null }
  | { type: ActionType.CLEAR_ERROR }
  | { type: ActionType.SET_SUCCESS_MESSAGE; payload: string | null }
  | { type: ActionType.CLEAR_SUCCESS_MESSAGE }
  | { type: ActionType.ADD_NOTIFICATION; payload: Omit<NotificationMessage, 'id' | 'read' | 'timestamp'> }
  | { type: ActionType.MARK_NOTIFICATION_READ; payload: { id: string } }
  | { type: ActionType.MARK_ALL_NOTIFICATIONS_READ }
  | { type: ActionType.CLEAR_ALL_NOTIFICATIONS }
  | { type: ActionType.GENERATE_QUIZ_QUESTIONS_SUCCESS, payload: { assignmentId: string, questions: QuizQuestion[] } }
  | { type: ActionType.GENERATE_QUIZ_QUESTIONS_ERROR, payload: { error: string } };

// This is a simplified version. User should provide their full types.ts content.
