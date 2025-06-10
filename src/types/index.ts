

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
  STANDARD = 'standard', 
  QUIZ = 'quiz', 
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
  SHORT_ANSWER = 'short-answer',
}

export enum AnnouncementAudience {
  ALL = 'all', 
  STUDENTS = 'students', 
  TEACHERS = 'teachers', 
  COURSE_SPECIFIC = 'course_specific', 
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  FAILED = 'Failed',
}

// Action Types (Simplified for brevity, expand as needed)
export enum ActionType {
  // Auth & User
  LOGIN_USER_REQUEST = 'LOGIN_USER_REQUEST',
  LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS',
  LOGIN_USER_FAILURE = 'LOGIN_USER_FAILURE',
  REGISTER_STUDENT_REQUEST = 'REGISTER_STUDENT_REQUEST',
  REGISTER_STUDENT_SUCCESS = 'REGISTER_STUDENT_SUCCESS',
  REGISTER_STUDENT_FAILURE = 'REGISTER_STUDENT_FAILURE',
  LOGOUT_USER_REQUEST = 'LOGOUT_USER_REQUEST',
  LOGOUT_USER_SUCCESS = 'LOGOUT_USER_SUCCESS',
  LOGOUT_USER_FAILURE = 'LOGOUT_USER_FAILURE',
  SET_CURRENT_USER = 'SET_CURRENT_USER', 
  FETCH_USER_PROFILE_SUCCESS = 'FETCH_USER_PROFILE_SUCCESS', // Used internally by auth flow
  FETCH_USER_PROFILE_FAILURE = 'FETCH_USER_PROFILE_FAILURE', // Used internally by auth flow

  CREATE_USER_REQUEST = 'CREATE_USER_REQUEST',
  CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS',
  CREATE_USER_FAILURE = 'CREATE_USER_FAILURE',
  UPDATE_USER_REQUEST = 'UPDATE_USER_REQUEST',
  UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS',
  UPDATE_USER_FAILURE = 'UPDATE_USER_FAILURE',
  DELETE_USER_REQUEST = 'DELETE_USER_REQUEST',
  DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS',
  DELETE_USER_FAILURE = 'DELETE_USER_FAILURE',
  
  FETCH_USERS_REQUEST = 'FETCH_USERS_REQUEST',
  FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS',
  FETCH_USERS_FAILURE = 'FETCH_USERS_FAILURE',
  
  BULK_CREATE_STUDENTS_REQUEST = 'BULK_CREATE_STUDENTS_REQUEST',
  BULK_CREATE_STUDENTS_SUCCESS = 'BULK_CREATE_STUDENTS_SUCCESS',
  BULK_CREATE_STUDENTS_FAILURE = 'BULK_CREATE_STUDENTS_FAILURE',
  
  // Course Management
  FETCH_COURSES_REQUEST = 'FETCH_COURSES_REQUEST',
  FETCH_COURSES_SUCCESS = 'FETCH_COURSES_SUCCESS',
  FETCH_COURSES_FAILURE = 'FETCH_COURSES_FAILURE',
  CREATE_COURSE_REQUEST = 'CREATE_COURSE_REQUEST',
  CREATE_COURSE_SUCCESS = 'CREATE_COURSE_SUCCESS',
  CREATE_COURSE_FAILURE = 'CREATE_COURSE_FAILURE',
  UPDATE_COURSE_REQUEST = 'UPDATE_COURSE_REQUEST',
  UPDATE_COURSE_SUCCESS = 'UPDATE_COURSE_SUCCESS',
  UPDATE_COURSE_FAILURE = 'UPDATE_COURSE_FAILURE',
  DELETE_COURSE_REQUEST = 'DELETE_COURSE_REQUEST',
  DELETE_COURSE_SUCCESS = 'DELETE_COURSE_SUCCESS',
  DELETE_COURSE_FAILURE = 'DELETE_COURSE_FAILURE',
  
  // Enrollment Management
  ENROLL_STUDENT_REQUEST = 'ENROLL_STUDENT_REQUEST',
  ENROLL_STUDENT_SUCCESS = 'ENROLL_STUDENT_SUCCESS',
  ENROLL_STUDENT_FAILURE = 'ENROLL_STUDENT_FAILURE',
  UNENROLL_STUDENT_REQUEST = 'UNENROLL_STUDENT_REQUEST',
  UNENROLL_STUDENT_SUCCESS = 'UNENROLL_STUDENT_SUCCESS',
  UNENROLL_STUDENT_FAILURE = 'UNENROLL_STUDENT_FAILURE',

  // Lesson Management
  FETCH_LESSONS_REQUEST = 'FETCH_LESSONS_REQUEST',
  FETCH_LESSONS_SUCCESS = 'FETCH_LESSONS_SUCCESS',
  FETCH_LESSONS_FAILURE = 'FETCH_LESSONS_FAILURE',
  CREATE_LESSON_REQUEST = 'CREATE_LESSON_REQUEST',
  CREATE_LESSON_SUCCESS = 'CREATE_LESSON_SUCCESS',
  CREATE_LESSON_FAILURE = 'CREATE_LESSON_FAILURE',
  UPDATE_LESSON_REQUEST = 'UPDATE_LESSON_REQUEST',
  UPDATE_LESSON_SUCCESS = 'UPDATE_LESSON_SUCCESS',
  UPDATE_LESSON_FAILURE = 'UPDATE_LESSON_FAILURE',
  DELETE_LESSON_REQUEST = 'DELETE_LESSON_REQUEST',
  DELETE_LESSON_SUCCESS = 'DELETE_LESSON_SUCCESS',
  DELETE_LESSON_FAILURE = 'DELETE_LESSON_FAILURE',
  // Assignment & Submission
  CREATE_ASSIGNMENT_REQUEST = 'CREATE_ASSIGNMENT_REQUEST',
  CREATE_ASSIGNMENT_SUCCESS = 'CREATE_ASSIGNMENT_SUCCESS',
  CREATE_ASSIGNMENT_FAILURE = 'CREATE_ASSIGNMENT_FAILURE',
  UPDATE_ASSIGNMENT_REQUEST = 'UPDATE_ASSIGNMENT_REQUEST',
  UPDATE_ASSIGNMENT_SUCCESS = 'UPDATE_ASSIGNMENT_SUCCESS',
  UPDATE_ASSIGNMENT_FAILURE = 'UPDATE_ASSIGNMENT_FAILURE',
  DELETE_ASSIGNMENT_REQUEST = 'DELETE_ASSIGNMENT_REQUEST',
  DELETE_ASSIGNMENT_SUCCESS = 'DELETE_ASSIGNMENT_SUCCESS',
  DELETE_ASSIGNMENT_FAILURE = 'DELETE_ASSIGNMENT_FAILURE',
  
  SUBMIT_ASSIGNMENT_REQUEST = 'SUBMIT_ASSIGNMENT_REQUEST',
  SUBMIT_ASSIGNMENT_SUCCESS = 'SUBMIT_ASSIGNMENT_SUCCESS',
  SUBMIT_ASSIGNMENT_FAILURE = 'SUBMIT_ASSIGNMENT_FAILURE',
  
  GRADE_SUBMISSION_REQUEST = 'GRADE_SUBMISSION_REQUEST',
  GRADE_SUBMISSION_SUCCESS = 'GRADE_SUBMISSION_SUCCESS',
  GRADE_SUBMISSION_FAILURE = 'GRADE_SUBMISSION_FAILURE',
  
  ADMIN_UPDATE_OR_CREATE_SUBMISSION_REQUEST = 'ADMIN_UPDATE_OR_CREATE_SUBMISSION_REQUEST',
  ADMIN_UPDATE_OR_CREATE_SUBMISSION_SUCCESS = 'ADMIN_UPDATE_OR_CREATE_SUBMISSION_SUCCESS',
  ADMIN_UPDATE_OR_CREATE_SUBMISSION_FAILURE = 'ADMIN_UPDATE_OR_CREATE_SUBMISSION_FAILURE',

  // Attendance
  TAKE_ATTENDANCE = 'TAKE_ATTENDANCE', 
  UPDATE_ATTENDANCE_RECORD = 'UPDATE_ATTENDANCE_RECORD', 
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
  // Payment
  RECORD_PAYMENT = 'RECORD_PAYMENT', 
  UPDATE_PAYMENT = 'UPDATE_PAYMENT', 
}

// Interfaces
export interface User {
  id: string; 
  name: string;
  email: string; 
  role: UserRole;
  avatarUrl?: string; 
  password?: string; // Only for payload during creation by admin, not stored in Firestore doc
}

export interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string; 
  studentIds: string[];
  category?: string;
  cost: number; 
  prerequisites?: string[]; 
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  contentMarkdown: string; 
  videoUrl?: string;
  fileUrl?: string; 
  fileName?: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  assignmentId?: string; 
  questionText: string;
  questionType: QuestionType;
  options?: string[]; 
  correctAnswer: string | string[]; 
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
  dueDate: string; 
  type: AssignmentType;
  totalPoints: number;
  rubric?: RubricCriterion[]; 
  questions?: QuizQuestion[]; 
  assignmentFileUrl?: string; 
  assignmentFileName?: string; 
  externalLink?: string;
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
  submittedAt: string; 
  content?: string; 
  fileUrl?: string; 
  fileName?: string; 
  quizAnswers?: QuizAnswer[]; 
  grade?: number; 
  feedback?: string; 
  rubricScores?: { criterionId: string; score: number }[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string; 
  grade?: string; 
}

export interface AttendanceRecord {
  id: string; 
  studentId: string;
  courseId: string;
  date: string; 
  status: AttendanceStatus;
  notes?: string; 
}

export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  status: PaymentStatus;
  paymentDate?: string; 
  transactionId?: string;
  notes?: string; 
}

export interface NotificationMessage {
  id: string;
  userId?: string; 
  courseId?: string; 
  type: 'success' | 'error' | 'info' | 'warning' | 'new_assignment' | 'grade_update' | 'announcement' | 'payment_due' | 'payment_received' | 'submission_received' | 'submission_graded' | 'enrollment_update';
  message: string;
  link?: string; 
  read: boolean;
  timestamp: number;
}

export interface Announcement {
  id: string;
  message: string; 
  timestamp: number; 
  type: string; 
  courseId?: string; 
  userId?: string;   
  link?: string;     
}


// App State
export interface AppState {
  currentUser: User | null | undefined; 
  users: User[]; 
  courses: Course[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  enrollments: Enrollment[];
  attendanceRecords: AttendanceRecord[];
  payments: Payment[];
  notifications: NotificationMessage[];
  announcements: Announcement[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// App Actions - Define payload types for each action
export type LoginUserPayload = { email: string; password?: string };
export type RegisterStudentPayload = { name: string; email: string; password?: string; avatarUrl?: string };

export type CreateUserPayload = Omit<User, 'id' | 'avatarUrl'> & Partial<Pick<User, 'avatarUrl'>>;
export type UpdateUserPayload = Partial<Omit<User, 'id' | 'email' | 'password'>> & { id: string };
export type DeleteUserPayload = { id: string };

export type BulkCreateStudentData = { name: string; email: string; password?: string; };
export type BulkCreateStudentsResultItem = { success: boolean; email: string; userId?: string; error?: string; };
export type BulkCreateStudentsResult = BulkCreateStudentsResultItem[];


export type CreateCoursePayload = Omit<Course, 'id' | 'studentIds'> & { studentIds?: string[]; id?: string; }; 
export type UpdateCoursePayload = Partial<Omit<Course, 'id'>> & { id: string };
export type DeleteCoursePayload = { id: string };

export type EnrollStudentPayload = { courseId: string; studentId: string; };
export type EnrollStudentSuccessPayload = { course: Course; enrollment: Enrollment; };
export type UnenrollStudentPayload = { courseId: string; studentId: string; };
export type UnenrollStudentSuccessPayload = { course: Course; studentId: string; enrollmentId: string; };


export type CreateLessonPayload = Omit<Lesson, 'id'>;
export type UpdateLessonPayload = Partial<Omit<Lesson, 'id' | 'courseId'>> & { id: string; courseId?: string; }; 
export type DeleteLessonPayload = { id: string; courseId: string };


export type CreateAssignmentPayload = Omit<Assignment, 'id'| 'totalPoints'> & { manualTotalPoints?: number; assignmentFile?: File | null; };
export type UpdateAssignmentPayload = Partial<Omit<Assignment, 'id' | 'courseId'>> & { id: string; courseId: string; assignmentFile?: File | null; manualTotalPoints?:number; }; // courseId is now mandatory
export type DeleteAssignmentPayload = { id: string; courseId: string };

export type SubmitAssignmentPayload = Submission; // Submission type itself is used as payload
export type GradeSubmissionPayload = {
  submissionId: string;
  grade: number;
  feedback?: string;
};

export type AdminUpdateOrCreateSubmissionPayload = {
  studentId: string;
  assignmentId: string;
  courseId: string; // Needed to find the assignment in subcollection
  grade: number;
  feedback?: string;
  assignmentTotalPoints: number; // Needed for validation
};


export type TakeAttendancePayload = {
  courseId: string;
  date: string; 
  studentStatuses: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>;
};
export type UpdateAttendanceRecordPayload = Partial<Omit<AttendanceRecord, 'id' | 'courseId' | 'studentId' | 'date'>> & { id: string };

export type RecordPaymentPayload = Omit<Payment, 'id'>;
export type UpdatePaymentPayload = Pick<Payment, 'id' | 'status' | 'notes'> & { amount?: number, paymentDate?: string };


export type AppAction =
  | { type: ActionType.LOGIN_USER_REQUEST }
  | { type: ActionType.LOGIN_USER_SUCCESS; payload: User }
  | { type: ActionType.LOGIN_USER_FAILURE; payload: string }
  | { type: ActionType.REGISTER_STUDENT_REQUEST }
  | { type: ActionType.REGISTER_STUDENT_SUCCESS; payload: User }
  | { type: ActionType.REGISTER_STUDENT_FAILURE; payload: string }
  | { type: ActionType.LOGOUT_USER_REQUEST }
  | { type: ActionType.LOGOUT_USER_SUCCESS }
  | { type: ActionType.LOGOUT_USER_FAILURE; payload: string }
  | { type: ActionType.SET_CURRENT_USER; payload: User | null } 
  | { type: ActionType.FETCH_USER_PROFILE_SUCCESS; payload: User }
  | { type: ActionType.FETCH_USER_PROFILE_FAILURE; payload: string }

  | { type: ActionType.CREATE_USER_REQUEST }
  | { type: ActionType.CREATE_USER_SUCCESS; payload: User }
  | { type: ActionType.CREATE_USER_FAILURE; payload: string }
  | { type: ActionType.UPDATE_USER_REQUEST }
  | { type: ActionType.UPDATE_USER_SUCCESS; payload: UpdateUserPayload }
  | { type: ActionType.UPDATE_USER_FAILURE; payload: string }
  | { type: ActionType.DELETE_USER_REQUEST }
  | { type: ActionType.DELETE_USER_SUCCESS; payload: DeleteUserPayload }
  | { type: ActionType.DELETE_USER_FAILURE; payload: string }
  
  | { type: ActionType.FETCH_USERS_REQUEST }
  | { type: ActionType.FETCH_USERS_SUCCESS; payload: User[] }
  | { type: ActionType.FETCH_USERS_FAILURE; payload: string }
  
  | { type: ActionType.BULK_CREATE_STUDENTS_REQUEST }
  | { type: ActionType.BULK_CREATE_STUDENTS_SUCCESS; payload: { users: User[]; results: BulkCreateStudentsResult } }
  | { type: ActionType.BULK_CREATE_STUDENTS_FAILURE; payload: { error: string; results: BulkCreateStudentsResult } }

  | { type: ActionType.FETCH_COURSES_REQUEST }
  | { type: ActionType.FETCH_COURSES_SUCCESS; payload: Course[] }
  | { type: ActionType.FETCH_COURSES_FAILURE; payload: string }
  | { type: ActionType.CREATE_COURSE_REQUEST }
  | { type: ActionType.CREATE_COURSE_SUCCESS; payload: Course }
  | { type: ActionType.CREATE_COURSE_FAILURE; payload: string }
  | { type: ActionType.UPDATE_COURSE_REQUEST }
  | { type: ActionType.UPDATE_COURSE_SUCCESS; payload: UpdateCoursePayload }
  | { type: ActionType.UPDATE_COURSE_FAILURE; payload: string }
  | { type: ActionType.DELETE_COURSE_REQUEST }
  | { type: ActionType.DELETE_COURSE_SUCCESS; payload: DeleteCoursePayload }
  | { type: ActionType.DELETE_COURSE_FAILURE; payload: string }

  | { type: ActionType.ENROLL_STUDENT_REQUEST }
  | { type: ActionType.ENROLL_STUDENT_SUCCESS; payload: EnrollStudentSuccessPayload }
  | { type: ActionType.ENROLL_STUDENT_FAILURE; payload: string }
  | { type: ActionType.UNENROLL_STUDENT_REQUEST }
  | { type: ActionType.UNENROLL_STUDENT_SUCCESS; payload: UnenrollStudentSuccessPayload }
  | { type: ActionType.UNENROLL_STUDENT_FAILURE; payload: string }

  | { type: ActionType.FETCH_LESSONS_REQUEST }
  | { type: ActionType.FETCH_LESSONS_SUCCESS; payload: Lesson[] }
  | { type: ActionType.FETCH_LESSONS_FAILURE; payload: string }
  | { type: ActionType.CREATE_LESSON_REQUEST }
  | { type: ActionType.CREATE_LESSON_SUCCESS; payload: Lesson }
  | { type: ActionType.CREATE_LESSON_FAILURE; payload: string }
  | { type: ActionType.UPDATE_LESSON_REQUEST }
  | { type: ActionType.UPDATE_LESSON_SUCCESS; payload: UpdateLessonPayload }
  | { type: ActionType.UPDATE_LESSON_FAILURE; payload: string }
  | { type: ActionType.DELETE_LESSON_REQUEST }
  | { type: ActionType.DELETE_LESSON_SUCCESS; payload: DeleteLessonPayload }
  | { type: ActionType.DELETE_LESSON_FAILURE; payload: string }
  
  | { type: ActionType.CREATE_ASSIGNMENT_REQUEST }
  | { type: ActionType.CREATE_ASSIGNMENT_SUCCESS; payload: Assignment }
  | { type: ActionType.CREATE_ASSIGNMENT_FAILURE; payload: string }
  | { type: ActionType.UPDATE_ASSIGNMENT_REQUEST }
  | { type: ActionType.UPDATE_ASSIGNMENT_SUCCESS; payload: UpdateAssignmentPayload }
  | { type: ActionType.UPDATE_ASSIGNMENT_FAILURE; payload: string }
  | { type: ActionType.DELETE_ASSIGNMENT_REQUEST }
  | { type: ActionType.DELETE_ASSIGNMENT_SUCCESS; payload: DeleteAssignmentPayload }
  | { type: ActionType.DELETE_ASSIGNMENT_FAILURE; payload: string }

  | { type: ActionType.SUBMIT_ASSIGNMENT_REQUEST }
  | { type: ActionType.SUBMIT_ASSIGNMENT_SUCCESS; payload: Submission }
  | { type: ActionType.SUBMIT_ASSIGNMENT_FAILURE; payload: string }
  
  | { type: ActionType.GRADE_SUBMISSION_REQUEST }
  | { type: ActionType.GRADE_SUBMISSION_SUCCESS; payload: GradeSubmissionPayload }
  | { type: ActionType.GRADE_SUBMISSION_FAILURE; payload: string }

  | { type: ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_REQUEST }
  | { type: ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_SUCCESS; payload: Submission }
  | { type: ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_FAILURE; payload: string }

  | { type: ActionType.TAKE_ATTENDANCE; payload: TakeAttendancePayload }
  | { type: ActionType.UPDATE_ATTENDANCE_RECORD; payload: UpdateAttendanceRecordPayload }
  | { type: ActionType.RECORD_PAYMENT; payload: RecordPaymentPayload }
  | { type: ActionType.UPDATE_PAYMENT; payload: UpdatePaymentPayload }
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

// AI Generated Types from Genkit
export interface GenerateQuizQuestionsInput {
    lessonContent: string;
    numberOfQuestions: number;
}

export interface GenerateQuizQuestionsOutput {
    questions: Array<{
        questionText: string;
        options: string[];
        correctAnswer: string;
    }>;
}
