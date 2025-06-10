
"use client";

import type { Dispatch } from 'react';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  getFirebaseAuth, 
  getFirebaseDb, 
  getFirebaseStorage
} from '@/lib/firebase'; 
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  type Firestore 
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";


import type { AppState, AppAction, User, Course, Lesson, Assignment, Submission, QuizQuestion, QuizAnswer, NotificationMessage, CreateUserPayload, UpdateUserPayload, DeleteUserPayload, Announcement, CreateCoursePayload, UpdateCoursePayload, DeleteCoursePayload, TakeAttendancePayload, UpdateAttendanceRecordPayload, AttendanceRecord, Payment, RecordPaymentPayload, UpdatePaymentPayload, CreateLessonPayload, UpdateLessonPayload, DeleteLessonPayload, CreateAssignmentPayload, UpdateAssignmentPayload, DeleteAssignmentPayload, LoginUserPayload, RegisterStudentPayload, SubmitAssignmentPayload, GradeSubmissionPayload, BulkCreateStudentData, BulkCreateStudentsResult, BulkCreateStudentsResultItem } from '@/types';
import { ActionType, UserRole, AssignmentType, QuestionType, AttendanceStatus, PaymentStatus } from '@/types';
import { 
  SAMPLE_USERS, 
  SAMPLE_COURSES, 
  SAMPLE_LESSONS, 
  SAMPLE_ASSIGNMENTS, 
  SAMPLE_SUBMISSIONS, 
  SAMPLE_PAYMENTS, 
  SAMPLE_ATTENDANCE, 
  INITIAL_ENROLLMENTS,
  SAMPLE_NOTIFICATIONS,
  SAMPLE_ANNOUNCEMENTS,
  APP_NAME
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const initialState: AppState = {
  currentUser: undefined, 
  users: [], 
  courses: [],
  lessons: [],
  assignments: [],
  submissions: [],
  enrollments: [],
  attendanceRecords: [],
  payments: [],
  notifications: [],
  announcements: [],
  isLoading: true, 
  error: null,
  successMessage: null,
};

// Helper function for auto-grading quiz answers
const autoGradeQuizAnswer = (question: QuizQuestion, studentAnswer: string | string[]): { isCorrect: boolean; score: number } => {
  if (studentAnswer === undefined || studentAnswer === null || (Array.isArray(studentAnswer) && studentAnswer.length === 0) || studentAnswer === "") {
    return { isCorrect: false, score: 0 };
  }

  let isCorrect = false;
  switch (question.questionType) {
    case QuestionType.TRUE_FALSE:
      isCorrect = studentAnswer.toString().toLowerCase() === question.correctAnswer.toString().toLowerCase();
      break;
    case QuestionType.MULTIPLE_CHOICE:
      isCorrect = studentAnswer.toString().toLowerCase() === question.correctAnswer.toString().toLowerCase();
      break;
    case QuestionType.SHORT_ANSWER:
      const keywords = Array.isArray(question.correctAnswer) ? question.correctAnswer.map(k => k.toLowerCase()) : [question.correctAnswer.toString().toLowerCase()];
      const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer.map(sa => sa.toLowerCase()) : [studentAnswer.toString().toLowerCase()];
      isCorrect = keywords.some(keyword => studentAnswers.includes(keyword));
      break;
    default:
      isCorrect = false;
  }
  return { isCorrect, score: isCorrect ? question.points : 0 };
};


const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case ActionType.LOAD_DATA: {
      return {
        ...state,
        courses: action.payload.courses || (state.courses.length === 0 ? SAMPLE_COURSES : state.courses),
        lessons: action.payload.lessons || (state.lessons.length === 0 ? SAMPLE_LESSONS : state.lessons),
        assignments: action.payload.assignments || (state.assignments.length === 0 ? SAMPLE_ASSIGNMENTS : state.assignments),
        submissions: (action.payload.submissions || (state.submissions.length === 0 ? SAMPLE_SUBMISSIONS : state.submissions)).map(submission => {
          if (submission.assignmentId) {
            const assignment = (action.payload.assignments || (state.assignments.length === 0 ? SAMPLE_ASSIGNMENTS : state.assignments)).find(a => a.id === submission.assignmentId);
            if (assignment && assignment.type === AssignmentType.QUIZ && submission.quizAnswers && assignment.questions) {
              let calculatedGrade = 0;
              const updatedQuizAnswers = submission.quizAnswers.map(qa => {
                const question = assignment.questions!.find(q => q.id === qa.questionId);
                if (question) {
                  const { isCorrect, score } = autoGradeQuizAnswer(question, qa.studentAnswer);
                  calculatedGrade += score;
                  return { ...qa, isCorrect, autoGradeScore: score };
                }
                return qa;
              });
              return { ...submission, quizAnswers: updatedQuizAnswers, grade: submission.grade ?? calculatedGrade };
            }
          }
          return submission;
        }),
        enrollments: action.payload.enrollments || (state.enrollments.length === 0 ? INITIAL_ENROLLMENTS : state.enrollments),
        attendanceRecords: action.payload.attendanceRecords || (state.attendanceRecords.length === 0 ? SAMPLE_ATTENDANCE : state.attendanceRecords),
        payments: action.payload.payments || (state.payments.length === 0 ? SAMPLE_PAYMENTS : state.payments),
        notifications: action.payload.notifications || (state.notifications.length === 0 ? SAMPLE_NOTIFICATIONS : state.notifications),
        announcements: action.payload.announcements || (state.announcements.length === 0 ? SAMPLE_ANNOUNCEMENTS : state.announcements),
      };
    }
    
    case ActionType.FETCH_USERS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_USERS_SUCCESS:
      return { ...state, users: action.payload, isLoading: false, error: null };
    case ActionType.FETCH_USERS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.LOGIN_USER_REQUEST:
    case ActionType.REGISTER_STUDENT_REQUEST:
    case ActionType.LOGOUT_USER_REQUEST:
    case ActionType.BULK_CREATE_STUDENTS_REQUEST:
    case ActionType.CREATE_USER_REQUEST:
    case ActionType.UPDATE_USER_REQUEST:
    case ActionType.DELETE_USER_REQUEST:
    case ActionType.CREATE_COURSE_REQUEST:
    case ActionType.UPDATE_COURSE_REQUEST:
    case ActionType.DELETE_COURSE_REQUEST:
    case ActionType.CREATE_LESSON_REQUEST:
    case ActionType.UPDATE_LESSON_REQUEST:
    case ActionType.DELETE_LESSON_REQUEST:
    case ActionType.CREATE_ASSIGNMENT_REQUEST:
    case ActionType.UPDATE_ASSIGNMENT_REQUEST:
    case ActionType.DELETE_ASSIGNMENT_REQUEST:
    case ActionType.SUBMIT_ASSIGNMENT_REQUEST:
    case ActionType.GRADE_SUBMISSION_REQUEST:
      return { ...state, isLoading: true, error: null, successMessage: null };

    case ActionType.LOGIN_USER_SUCCESS:
    case ActionType.REGISTER_STUDENT_SUCCESS:
    case ActionType.FETCH_USER_PROFILE_SUCCESS: 
      return { 
        ...state, 
        currentUser: action.payload, 
        isLoading: false, 
        error: null, 
        successMessage: action.type === ActionType.LOGIN_USER_SUCCESS ? 'Login successful!' : (action.type === ActionType.REGISTER_STUDENT_SUCCESS ? 'Registration successful!' : null ) 
      };
    
    case ActionType.SET_CURRENT_USER: 
      return { ...state, currentUser: action.payload, isLoading: false, error: null };

    case ActionType.LOGIN_USER_FAILURE:
    case ActionType.REGISTER_STUDENT_FAILURE:
    case ActionType.LOGOUT_USER_FAILURE:
    case ActionType.FETCH_USER_PROFILE_FAILURE:
    case ActionType.CREATE_USER_FAILURE:
    case ActionType.UPDATE_USER_FAILURE:
    case ActionType.DELETE_USER_FAILURE:
    case ActionType.CREATE_COURSE_FAILURE:
    case ActionType.UPDATE_COURSE_FAILURE:
    case ActionType.DELETE_COURSE_FAILURE:
    case ActionType.CREATE_LESSON_FAILURE:
    case ActionType.UPDATE_LESSON_FAILURE:
    case ActionType.DELETE_LESSON_FAILURE:
    case ActionType.CREATE_ASSIGNMENT_FAILURE:
    case ActionType.UPDATE_ASSIGNMENT_FAILURE:
    case ActionType.DELETE_ASSIGNMENT_FAILURE:
    case ActionType.SUBMIT_ASSIGNMENT_FAILURE:
    case ActionType.GRADE_SUBMISSION_FAILURE:
      return { ...state, isLoading: false, error: action.payload, currentUser: state.currentUser === undefined ? null : state.currentUser  }; 

    case ActionType.LOGOUT_USER_SUCCESS:
      return { 
        ...initialState, 
        users: [], 
        courses: state.courses, 
        lessons: state.lessons,
        assignments: state.assignments,
        submissions: state.submissions,
        enrollments: state.enrollments,
        attendanceRecords: state.attendanceRecords,
        payments: state.payments,
        announcements: state.announcements, 
        currentUser: null, 
        isLoading: false, 
        successMessage: 'Logged out successfully.' 
      };
    
    case ActionType.CREATE_USER_SUCCESS: { 
      const newUserDoc = action.payload as User;
      const userExists = state.users.some(u => u.id === newUserDoc.id);
      return {
        ...state,
        users: userExists ? state.users.map(u => u.id === newUserDoc.id ? newUserDoc : u) : [...state.users, newUserDoc],
        isLoading: false, error: null,
        successMessage: `User document for ${newUserDoc.name} (${newUserDoc.role}) created successfully.`,
      };
    }

    case ActionType.UPDATE_USER_SUCCESS: {
      const payload = action.payload as UpdateUserPayload;
      return {
        ...state,
        users: state.users.map(user =>
          user.id === payload.id ? { ...user, ...payload } : user
        ),
        currentUser: state.currentUser?.id === payload.id ? { ...state.currentUser, ...payload } : state.currentUser,
        isLoading: false, error: null,
        successMessage: `User ${payload.name || state.users.find(u=>u.id === payload.id)?.name} updated successfully.`,
      };
    }

    case ActionType.DELETE_USER_SUCCESS: {
      const payload = action.payload as DeleteUserPayload;
      const userToDelete = state.users.find(u => u.id === payload.id);
      return {
        ...state,
        users: state.users.filter(user => user.id !== payload.id),
        isLoading: false, error: null,
        successMessage: `User ${userToDelete?.name || payload.id} deleted successfully.`,
      };
    }

    case ActionType.BULK_CREATE_STUDENTS_SUCCESS: {
      const { users: newUsers } = action.payload;
      const uniqueNewUsers = newUsers.filter(newUser => !state.users.some(existingUser => existingUser.id === newUser.id));
      return {
        ...state,
        users: [...state.users, ...uniqueNewUsers],
        isLoading: false,
        error: null,
      };
    }
    case ActionType.BULK_CREATE_STUDENTS_FAILURE: {
       const { error } = action.payload;
      return { ...state, isLoading: false, error: error };
    }
    
     case ActionType.CREATE_COURSE_SUCCESS: {
      const courseToAdd = action.payload as Course; 
      return {
        ...state,
        courses: [...state.courses, courseToAdd],
        isLoading: false, error: null,
        successMessage: `Course "${courseToAdd.name}" created successfully.`,
      };
    }

    case ActionType.UPDATE_COURSE_SUCCESS: {
      const updatedCourseData = action.payload as UpdateCoursePayload;
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === updatedCourseData.id ? { ...course, ...updatedCourseData, cost: updatedCourseData.cost ?? course.cost } : course
        ),
        isLoading: false, error: null,
        successMessage: `Course "${updatedCourseData.name || state.courses.find(c=>c.id === updatedCourseData.id)?.name}" updated successfully.`,
      };
    }

    case ActionType.DELETE_COURSE_SUCCESS: {
      const { id } = action.payload as DeleteCoursePayload;
      const courseToDelete = state.courses.find(c => c.id === id);
      return {
        ...state,
        courses: state.courses.filter(course => course.id !== id),
        lessons: state.lessons.filter(lesson => lesson.courseId !== id), 
        assignments: state.assignments.filter(assignment => assignment.courseId !== id), 
        isLoading: false, error: null,
        successMessage: `Course "${courseToDelete?.name || id}" deleted successfully.`,
      };
    }
    
    case ActionType.CREATE_LESSON_SUCCESS: {
      const newLesson = action.payload as Lesson;
      return {
        ...state,
        lessons: [...state.lessons, newLesson].sort((a, b) => a.order - b.order),
        isLoading: false, error: null,
        successMessage: `Lesson "${newLesson.title}" created successfully.`,
      };
    }

    case ActionType.UPDATE_LESSON_SUCCESS: {
      const payload = action.payload as UpdateLessonPayload;
      return {
        ...state,
        lessons: state.lessons.map(lesson =>
          lesson.id === payload.id ? { ...lesson, ...payload } : lesson
        ).sort((a, b) => a.order - b.order),
        isLoading: false, error: null,
        successMessage: `Lesson "${payload.title || state.lessons.find(l=>l.id === payload.id)?.title}" updated.`,
      };
    }

    case ActionType.DELETE_LESSON_SUCCESS: {
      const { id } = action.payload as DeleteLessonPayload;
      const lessonToDelete = state.lessons.find(l => l.id === id);
      return {
        ...state,
        lessons: state.lessons.filter(lesson => lesson.id !== id),
        isLoading: false, error: null,
        successMessage: `Lesson "${lessonToDelete?.title || id}" deleted successfully.`,
      };
    }

    case ActionType.CREATE_ASSIGNMENT_SUCCESS: {
      const newAssignment = action.payload as Assignment;
      return {
        ...state,
        assignments: [...state.assignments, newAssignment],
        isLoading: false, error: null,
        successMessage: `Assignment "${newAssignment.title}" created successfully.`,
      };
    }

    case ActionType.UPDATE_ASSIGNMENT_SUCCESS: {
        const payload = action.payload as UpdateAssignmentPayload;
        return {
            ...state,
            assignments: state.assignments.map(assignment =>
                assignment.id === payload.id ? { ...assignment, ...payload } : assignment
            ),
            isLoading: false, error: null,
            successMessage: `Assignment "${payload.title || state.assignments.find(a=>a.id === payload.id)?.title}" updated.`,
        };
    }

    case ActionType.DELETE_ASSIGNMENT_SUCCESS: {
        const { id } = action.payload as DeleteAssignmentPayload;
        const assignmentToDelete = state.assignments.find(a => a.id === id);
        return {
            ...state,
            assignments: state.assignments.filter(assignment => assignment.id !== id),
            submissions: state.submissions.filter(sub => sub.assignmentId !== id), 
            isLoading: false, error: null,
            successMessage: `Assignment "${assignmentToDelete?.title || id}" deleted successfully.`,
        };
    }
    
    case ActionType.SUBMIT_ASSIGNMENT_SUCCESS: {
      const newSubmission = action.payload as Submission; 
      
      const assignment = state.assignments.find(a => a.id === newSubmission.assignmentId);
      const course = state.courses.find(c => c.id === assignment?.courseId);
      const teacher = state.users.find(u => u.id === course?.teacherId);
      let notifications = state.notifications;
      if(teacher && assignment && course) {
        notifications = [
          {
            id: `notif-sub-${newSubmission.id}`,
            userId: teacher.id,
            type: 'submission_received',
            message: `New submission for '${assignment.title}' in course '${course.name}' from student ${state.users.find(u => u.id === newSubmission.studentId)?.name || newSubmission.studentId}.`,
            link: `/teacher/courses/${assignment.courseId}?assignment=${assignment.id}`, 
            read: false,
            timestamp: Date.now(),
          },
          ...state.notifications
        ];
      }

      return {
        ...state,
        submissions: [...state.submissions.filter(s => s.id !== newSubmission.id), newSubmission], // Replace if exists, else add
        notifications: notifications.slice(0,20),
        isLoading: false, error: null,
        successMessage: `Assignment submitted successfully.`,
      };
    }

    case ActionType.GRADE_SUBMISSION_SUCCESS: {
      const { submissionId, grade, feedback } = action.payload as GradeSubmissionPayload;
      const submissionToGrade = state.submissions.find(sub => sub.id === submissionId);
      const assignment = state.assignments.find(a => a.id === submissionToGrade?.assignmentId);

      let notifications = state.notifications;
      if (submissionToGrade && assignment) {
        notifications = [
          {
            id: `notif-grade-${submissionId}`,
            userId: submissionToGrade.studentId,
            type: 'submission_graded',
            message: `Your submission for '${assignment?.title}' has been graded. Grade: ${grade}`,
            link: `/student/courses/${assignment?.courseId}?assignment=${assignment?.id}`, 
            read: false,
            timestamp: Date.now(),
          },
          ...state.notifications
        ];
      }
      
      return {
        ...state,
        submissions: state.submissions.map(sub =>
          sub.id === submissionId ? { ...sub, grade, feedback, submittedAt: sub.submittedAt || new Date().toISOString() } : sub 
        ),
        notifications: notifications.slice(0,20),
        isLoading: false, error: null,
        successMessage: `Submission graded successfully.`,
      };
    }

    case ActionType.GENERATE_QUIZ_QUESTIONS_SUCCESS: {
      const { assignmentId, questions } = action.payload;
      return {
        ...state,
        assignments: state.assignments.map(assignment =>
          assignment.id === assignmentId
            ? { ...assignment, questions: [...(assignment.questions || []), ...questions.map(q => ({...q, assignmentId}))], totalPoints: (assignment.questions || []).reduce((sum, q) => sum + q.points, 0) + questions.reduce((sum, q) => sum + q.points, 0) }
            : assignment
        ),
        successMessage: `${questions.length} quiz questions generated and added to assignment.`,
      };
    }

    case ActionType.GENERATE_QUIZ_QUESTIONS_ERROR: {
        return { ...state, error: action.payload.error };
    }

    case ActionType.TAKE_ATTENDANCE: { 
      const { courseId, date, studentStatuses } = action.payload as TakeAttendancePayload;
      const updatedAttendanceRecords = [...state.attendanceRecords];
      let recordsAdded = 0;
      let recordsUpdated = 0;

      studentStatuses.forEach(ss => {
        const existingRecordIndex = updatedAttendanceRecords.findIndex(
          ar => ar.courseId === courseId && ar.studentId === ss.studentId && ar.date === date
        );

        if (existingRecordIndex !== -1) {
          updatedAttendanceRecords[existingRecordIndex] = {
            ...updatedAttendanceRecords[existingRecordIndex],
            status: ss.status,
            notes: ss.notes,
          };
          recordsUpdated++;
        } else {
          const newRecord: AttendanceRecord = {
            id: `att-${courseId}-${ss.studentId}-${date}-${Math.random().toString(36).substring(2, 7)}`,
            courseId,
            studentId: ss.studentId,
            date,
            status: ss.status,
            notes: ss.notes,
          };
          updatedAttendanceRecords.push(newRecord);
          recordsAdded++;
        }
      });
      return {
        ...state,
        attendanceRecords: updatedAttendanceRecords,
        successMessage: `Attendance for ${date} saved. ${recordsAdded} record(s) added, ${recordsUpdated} record(s) updated.`,
      };
    }

    case ActionType.UPDATE_ATTENDANCE_RECORD: {
      const payload = action.payload as UpdateAttendanceRecordPayload;
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.map(ar =>
          ar.id === payload.id ? { ...ar, ...payload } : ar
        ),
        successMessage: `Attendance record ${payload.id} updated.`,
      };
    }

    case ActionType.RECORD_PAYMENT: {
      const payload = action.payload as RecordPaymentPayload;
      const newPayment: Payment = {
        ...payload,
        id: `payment-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
        paymentDate: payload.paymentDate || new Date().toISOString(),
      };
      return {
        ...state,
        payments: [...state.payments, newPayment],
        successMessage: `Payment of $${newPayment.amount} for student ${newPayment.studentId} recorded.`,
      };
    }

    case ActionType.UPDATE_PAYMENT: {
      const payload = action.payload as UpdatePaymentPayload;
      return {
        ...state,
        payments: state.payments.map(p =>
          p.id === payload.id ? { ...p, ...payload, paymentDate: payload.paymentDate ?? p.paymentDate } : p
        ),
        successMessage: `Payment ${payload.id} updated to status ${payload.status}.`,
      };
    }

    case ActionType.ADD_NOTIFICATION: {
      const newNotification: NotificationMessage = {
        ...action.payload,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        timestamp: Date.now(),
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications].slice(0, 20),
      };
    }
    case ActionType.MARK_NOTIFICATION_READ: {
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.id ? { ...n, read: true } : n
        ),
      };
    }
    case ActionType.MARK_ALL_NOTIFICATIONS_READ: {
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      };
    }
    case ActionType.CLEAR_ALL_NOTIFICATIONS: {
      return { ...state, notifications: [] };
    }

    case ActionType.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionType.SET_ERROR:
      return { ...state, error: action.payload, successMessage: null, isLoading: false };
    case ActionType.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionType.SET_SUCCESS_MESSAGE:
      return { ...state, successMessage: action.payload, error: null, isLoading: false };
    case ActionType.CLEAR_SUCCESS_MESSAGE:
      return { ...state, successMessage: null };
    default:
      return state;
  }
};

const AppContext = createContext<{ 
  state: AppState; 
  dispatch: Dispatch<AppAction>;
  handleLoginUser: (payload: LoginUserPayload) => Promise<void>;
  handleRegisterStudent: (payload: RegisterStudentPayload) => Promise<void>;
  handleLogoutUser: () => Promise<void>;
  handleLessonFileUpload: (courseId: string, lessonId: string, file: File) => Promise<{ fileUrl: string, fileName: string }>;
  handleAssignmentAttachmentUpload: (courseId: string, assignmentId: string, file: File) => Promise<{ assignmentFileUrl: string, assignmentFileName: string }>;
  handleStudentSubmissionUpload: (courseId: string, assignmentId: string, studentId: string, file: File) => Promise<{ fileUrl: string, fileName: string }>;
  handleBulkCreateStudents: (studentsToCreate: BulkCreateStudentData[]) => Promise<void>;
  handleAdminCreateUser: (payload: CreateUserPayload) => Promise<void>;
  handleAdminUpdateUser: (payload: UpdateUserPayload) => Promise<void>;
  handleAdminDeleteUser: (payload: DeleteUserPayload) => Promise<void>;
  handleCreateCourse: (payload: CreateCoursePayload) => Promise<void>;
  handleUpdateCourse: (payload: UpdateCoursePayload) => Promise<void>;
  handleDeleteCourse: (payload: DeleteCoursePayload) => Promise<void>;
  handleCreateLesson: (payload: CreateLessonPayload) => Promise<void>;
  handleUpdateLesson: (payload: UpdateLessonPayload) => Promise<void>;
  handleDeleteLesson: (payload: DeleteLessonPayload) => Promise<void>;
  handleCreateAssignment: (payload: CreateAssignmentPayload) => Promise<void>;
  handleUpdateAssignment: (payload: UpdateAssignmentPayload) => Promise<void>;
  handleDeleteAssignment: (payload: DeleteAssignmentPayload) => Promise<void>;
  handleStudentSubmitAssignment: (payload: Submission) => Promise<void>; 
  handleTeacherGradeSubmission: (payload: GradeSubmissionPayload) => Promise<void>;

} | undefined>(undefined);


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    dispatch({ type: ActionType.LOAD_DATA, payload: {} }); 
  }, [dispatch]);

  const fetchAllUsers = useCallback(async () => {
    dispatch({ type: ActionType.FETCH_USERS_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_USERS_FAILURE, payload: "Firestore not available to fetch users." });
      return;
    }
    try {
      const usersCol = collection(db, "users");
      const userSnapshot = await getDocs(usersCol);
      const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      dispatch({ type: ActionType.FETCH_USERS_SUCCESS, payload: usersList });
    } catch (error: any) {
      console.error("Error fetching all users:", error);
      dispatch({ type: ActionType.FETCH_USERS_FAILURE, payload: error.message || "Failed to fetch all users." });
    }
  }, [dispatch]);

  useEffect(() => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      console.error("Firebase Auth instance not available.");
      dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
      dispatch({ type: ActionType.SET_ERROR, payload: "Firebase initialization failed." });
      dispatch({ type: ActionType.SET_LOADING, payload: false });
      return;
    }
    
    const dbInstance = getFirebaseDb(); 
    if (!dbInstance) {
        console.error("Firebase Firestore instance not available.");
    }

    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser: FirebaseUser | null) => {
      dispatch({ type: ActionType.SET_LOADING, payload: true }); 
      if (firebaseUser) {
        if (!dbInstance) {
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
            dispatch({ type: ActionType.SET_ERROR, payload: "Database connection error." });
            dispatch({ type: ActionType.SET_LOADING, payload: false });
            return;
        }
        try {
          const userDocRef = doc(dbInstance, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userProfile = { id: userDocSnap.id, ...userDocSnap.data() } as User;
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: userProfile });
            if (userProfile) { 
                await fetchAllUsers(); 
            } else {
                dispatch({ type: ActionType.SET_LOADING, payload: false }); 
            }
          } else {
            await signOut(authInstance); 
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
            dispatch({ type: ActionType.FETCH_USERS_SUCCESS, payload: [] }); 
            dispatch({ type: ActionType.SET_ERROR, payload: "User profile not found in database. Signed out." });
            dispatch({ type: ActionType.SET_LOADING, payload: false });
          }
        } catch (error: any) {
          dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
          dispatch({ type: ActionType.FETCH_USERS_SUCCESS, payload: [] }); 
          dispatch({ type: ActionType.SET_ERROR, payload: error.message || "Failed to load user profile." });
          dispatch({ type: ActionType.SET_LOADING, payload: false });
        }
      } else { 
        dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
        dispatch({ type: ActionType.FETCH_USERS_SUCCESS, payload: [] }); 
        dispatch({ type: ActionType.SET_LOADING, payload: false });
      }
    });
    return () => unsubscribe();
  }, [dispatch, fetchAllUsers]); 

  useEffect(() => {
    if (state.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
      dispatch({ type: ActionType.CLEAR_ERROR }); 
    }
    if (state.successMessage) {
      toast({ title: "Success", description: state.successMessage });
      dispatch({ type: ActionType.CLEAR_SUCCESS_MESSAGE });
    }
  }, [state.error, state.successMessage, toast, dispatch]);

  const handleLoginUser = useCallback(async (payload: LoginUserPayload) => {
    dispatch({ type: ActionType.LOGIN_USER_REQUEST });
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      dispatch({ type: ActionType.LOGIN_USER_FAILURE, payload: "Firebase Auth not initialized." });
      return;
    }
    try {
      if (!payload.password) throw new Error("Password is required.");
      await signInWithEmailAndPassword(authInstance, payload.email, payload.password);
    } catch (error: any) {
      dispatch({ type: ActionType.LOGIN_USER_FAILURE, payload: error.message || "Failed to login." });
    }
  }, [dispatch]);

  const handleRegisterStudent = useCallback(async (payload: RegisterStudentPayload) => {
    dispatch({ type: ActionType.REGISTER_STUDENT_REQUEST });
    const authInstance = getFirebaseAuth();
    const dbInstance = getFirebaseDb();

    if (!authInstance || !dbInstance) {
      dispatch({ type: ActionType.REGISTER_STUDENT_FAILURE, payload: "Firebase services not initialized." });
      return;
    }
    try {
      if (!payload.password) throw new Error("Password is required.");
      const userCredential = await createUserWithEmailAndPassword(authInstance, payload.email, payload.password);
      const firebaseUser = userCredential.user;
      const newUserForFirestore: User = {
        id: firebaseUser.uid,
        name: payload.name,
        email: firebaseUser.email || payload.email,
        role: UserRole.STUDENT,
        avatarUrl: payload.avatarUrl || `https://placehold.co/100x100.png?text=${payload.name.substring(0,2).toUpperCase()}`,
      };
      await setDoc(doc(dbInstance, "users", firebaseUser.uid), newUserForFirestore);
      dispatch({ type: ActionType.ADD_NOTIFICATION, payload: {
        userId: firebaseUser.uid, type: 'success',
        message: `Welcome to ${APP_NAME}, ${newUserForFirestore.name}! Account created.`
      }});
    } catch (error: any)      dispatch({ type: ActionType.CREATE_LESSON_REQUEST });
      const db = getFirebaseDb();
      if (!db) {
        dispatch({ type: ActionType.CREATE_LESSON_FAILURE, payload: "Firestore not available." });
        return;
      }
      let uploadedFileUrl = payload.fileUrl;
      let uploadedFileName = payload.fileName;

      if (payload.file) {
        try {
          const { fileUrl: newFileUrl, fileName: newFileName } = await handleLessonFileUpload(payload.courseId, payload.id || `new-${Date.now()}`, payload.file);
          uploadedFileUrl = newFileUrl;
          uploadedFileName = newFileName;
        } catch (error: any) {
          dispatch({ type: ActionType.CREATE_LESSON_FAILURE, payload: error.message || "Failed to upload lesson file." });
          return;
        }
      }
      
      try {
        const lessonId = payload.id || doc(collection(db, "courses", payload.courseId, "lessons")).id;
        const newLesson: Lesson = { 
          id: lessonId,
          courseId: payload.courseId,
          title: payload.title,
          contentMarkdown: payload.contentMarkdown,
          videoUrl: payload.videoUrl,
          order: payload.order,
          fileUrl: uploadedFileUrl,
          fileName: uploadedFileName,
        };
        await setDoc(doc(db, "courses", payload.courseId, "lessons", lessonId), newLesson);
        dispatch({ type: ActionType.CREATE_LESSON_SUCCESS, payload: newLesson });
      } catch (error: any) {
        dispatch({ type: ActionType.CREATE_LESSON_FAILURE, payload: error.message || "Failed to create lesson."});
      }
    }, [dispatch, handleLessonFileUpload]);

  const handleUpdateLesson = useCallback(async (payload: UpdateLessonPayload & { file?: File | null }) => {
    dispatch({ type: ActionType.UPDATE_LESSON_REQUEST });
    const db = getFirebaseDb();
    if (!db || !payload.courseId) {
      dispatch({ type: ActionType.UPDATE_LESSON_FAILURE, payload: "Firestore or courseId not available." });
      return;
    }
    
    let uploadedFileUrl = payload.fileUrl;
    let uploadedFileName = payload.fileName;

    if (payload.file) { // New file uploaded
      try {
        const { fileUrl: newFileUrl, fileName: newFileName } = await handleLessonFileUpload(payload.courseId, payload.id, payload.file);
        uploadedFileUrl = newFileUrl;
        uploadedFileName = newFileName;
      } catch (error: any) {
        dispatch({ type: ActionType.UPDATE_LESSON_FAILURE, payload: error.message || "Failed to upload new lesson file." });
        return;
      }
    } else if (payload.file === null && payload.fileUrl === undefined) { // File explicitly removed
        uploadedFileUrl = undefined;
        uploadedFileName = undefined;
        // Potentially delete old file from storage here if needed, but requires old file path.
        // For now, just removes the reference from Firestore.
    }


    try {
      const lessonRef = doc(db, "courses", payload.courseId, "lessons", payload.id);
      const updateData: Partial<Lesson> = { 
        title: payload.title,
        contentMarkdown: payload.contentMarkdown,
        videoUrl: payload.videoUrl,
        order: payload.order,
        fileUrl: uploadedFileUrl,
        fileName: uploadedFileName,
       };
      await updateDoc(lessonRef, updateData);
      dispatch({ type: ActionType.UPDATE_LESSON_SUCCESS, payload: { ...payload, fileUrl: uploadedFileUrl, fileName: uploadedFileName } });
    } catch (error: any) {
      dispatch({ type: ActionType.UPDATE_LESSON_FAILURE, payload: error.message || "Failed to update lesson."});
    }
  }, [dispatch, handleLessonFileUpload]);
  
  const handleDeleteLesson = useCallback(async (payload: DeleteLessonPayload) => {
    dispatch({ type: ActionType.DELETE_LESSON_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.DELETE_LESSON_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      // Optionally: Delete file from Firebase Storage if fileUrl exists
      // const lessonDoc = state.lessons.find(l => l.id === payload.id && l.courseId === payload.courseId);
      // if (lessonDoc && lessonDoc.fileUrl) {
      //   const fileStorageRef = storageRef(getFirebaseStorage()!, lessonDoc.fileUrl);
      //   try { await deleteObject(fileStorageRef); } catch (e) { console.warn("Could not delete lesson file from storage", e); }
      // }
      await deleteDoc(doc(db, "courses", payload.courseId, "lessons", payload.id));
      dispatch({ type: ActionType.DELETE_LESSON_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.DELETE_LESSON_FAILURE, payload: error.message || "Failed to delete lesson."});
    }
  }, [dispatch]);

  const handleCreateAssignment = useCallback(async (payload: CreateAssignmentPayload) => {
    dispatch({ type: ActionType.CREATE_ASSIGNMENT_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.CREATE_ASSIGNMENT_FAILURE, payload: "Firestore not available." });
      return;
    }

    let uploadedFileUrl = payload.assignmentFileUrl;
    let uploadedFileName = payload.assignmentFileName;

    if (payload.assignmentFile) {
        try {
            const { assignmentFileUrl: newFileUrl, assignmentFileName: newFileName } = await handleAssignmentAttachmentUpload(payload.courseId, payload.id || `new-${Date.now()}`, payload.assignmentFile);
            uploadedFileUrl = newFileUrl;
            uploadedFileName = newFileName;
        } catch (error: any) {
            dispatch({ type: ActionType.CREATE_ASSIGNMENT_FAILURE, payload: error.message || "Failed to upload assignment attachment."});
            return;
        }
    }
    
    try {
      const assignmentId = payload.id || doc(collection(db, "courses", payload.courseId, "assignments")).id;
      let totalPoints = 0;
      if (payload.type === AssignmentType.QUIZ && payload.questions) {
        totalPoints = payload.questions.reduce((sum, q) => sum + q.points, 0);
      } else if (payload.type === AssignmentType.STANDARD && payload.rubric) {
        totalPoints = payload.rubric.reduce((sum, r) => sum + r.points, 0);
      } else if (payload.manualTotalPoints !== undefined) {
        totalPoints = payload.manualTotalPoints;
      }
      const newAssignment: Assignment = {
        ...payload,
        id: assignmentId,
        totalPoints,
        questions: payload.questions?.map(q => ({...q, id: q.id || doc(collection(db, "temp")).id , assignmentId: assignmentId})),
        assignmentFileUrl: uploadedFileUrl,
        assignmentFileName: uploadedFileName,
      };
      delete (newAssignment as any).assignmentFile; 
      delete (newAssignment as any).manualTotalPoints;

      await setDoc(doc(db, "courses", payload.courseId, "assignments", assignmentId), newAssignment);
      dispatch({ type: ActionType.CREATE_ASSIGNMENT_SUCCESS, payload: newAssignment });
    } catch (error: any) {
      dispatch({ type: ActionType.CREATE_ASSIGNMENT_FAILURE, payload: error.message || "Failed to create assignment."});
    }
  }, [dispatch, handleAssignmentAttachmentUpload]);

  const handleUpdateAssignment = useCallback(async (payload: UpdateAssignmentPayload) => {
    dispatch({ type: ActionType.UPDATE_ASSIGNMENT_REQUEST });
    const db = getFirebaseDb();
    if (!db || !payload.courseId) {
      dispatch({ type: ActionType.UPDATE_ASSIGNMENT_FAILURE, payload: "Firestore or courseId not available." });
      return;
    }

    let uploadedFileUrl = payload.assignmentFileUrl;
    let uploadedFileName = payload.assignmentFileName;
    
    if (payload.assignmentFile) {
        try {
            const { assignmentFileUrl: newFileUrl, assignmentFileName: newFileName } = await handleAssignmentAttachmentUpload(payload.courseId, payload.id, payload.assignmentFile);
            uploadedFileUrl = newFileUrl;
            uploadedFileName = newFileName;
        } catch (error: any) {
            dispatch({ type: ActionType.UPDATE_ASSIGNMENT_FAILURE, payload: error.message || "Failed to upload new assignment attachment." });
            return;
        }
    } else if (payload.assignmentFile === null && payload.assignmentFileUrl === undefined) { 
        uploadedFileUrl = undefined;
        uploadedFileName = undefined;
    }

    try {
      const assignmentRef = doc(db, "courses", payload.courseId, "assignments", payload.id);
      let totalPoints = payload.totalPoints; 
      if (payload.manualTotalPoints !== undefined) {
          totalPoints = payload.manualTotalPoints;
      } else if (payload.type === AssignmentType.QUIZ && payload.questions) {
          totalPoints = payload.questions.reduce((sum, q) => sum + q.points, 0);
      } else if (payload.type === AssignmentType.STANDARD && payload.rubric) {
          totalPoints = payload.rubric.reduce((sum, r) => sum + r.points, 0);
      }
      const updateData: Partial<Assignment> = { 
        ...payload, 
        totalPoints,
        assignmentFileUrl: uploadedFileUrl,
        assignmentFileName: uploadedFileName,
       };
      delete updateData.id;
      delete updateData.courseId;
      delete (updateData as any).assignmentFile;
      delete (updateData as any).manualTotalPoints;

      await updateDoc(assignmentRef, updateData as any);
      dispatch({ type: ActionType.UPDATE_ASSIGNMENT_SUCCESS, payload: { ...payload, assignmentFileUrl: uploadedFileUrl, assignmentFileName: uploadedFileName, totalPoints: totalPoints } });
    } catch (error: any) {
      dispatch({ type: ActionType.UPDATE_ASSIGNMENT_FAILURE, payload: error.message || "Failed to update assignment."});
    }
  }, [dispatch, handleAssignmentAttachmentUpload]);

  const handleDeleteAssignment = useCallback(async (payload: DeleteAssignmentPayload) => {
    dispatch({ type: ActionType.DELETE_ASSIGNMENT_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.DELETE_ASSIGNMENT_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      await deleteDoc(doc(db, "courses", payload.courseId, "assignments", payload.id));
      // Potentially delete associated submissions and files from storage
      dispatch({ type: ActionType.DELETE_ASSIGNMENT_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.DELETE_ASSIGNMENT_FAILURE, payload: error.message || "Failed to delete assignment."});
    }
  }, [dispatch]);
  
  const handleStudentSubmitAssignment = useCallback(async (payload: Submission) => {
    dispatch({ type: ActionType.SUBMIT_ASSIGNMENT_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.SUBMIT_ASSIGNMENT_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const assignment = state.assignments.find(a => a.id === payload.assignmentId);
      if (!assignment || !assignment.courseId) {
        dispatch({ type: ActionType.SUBMIT_ASSIGNMENT_FAILURE, payload: "Assignment or course context not found for submission." });
        return;
      }

      const submissionId = payload.id || doc(collection(db, "courses", assignment.courseId, "assignments", payload.assignmentId, "submissions")).id;
      const finalSubmission: Submission = {
        ...payload,
        id: submissionId,
        submittedAt: payload.submittedAt || new Date().toISOString(),
      };
      delete (finalSubmission as any).file; // Remove transient file object

      await setDoc(doc(db, "courses", assignment.courseId, "assignments", payload.assignmentId, "submissions", submissionId), finalSubmission);
      dispatch({ type: ActionType.SUBMIT_ASSIGNMENT_SUCCESS, payload: finalSubmission });
    } catch (error: any) {
      dispatch({ type: ActionType.SUBMIT_ASSIGNMENT_FAILURE, payload: error.message || "Failed to submit assignment."});
    }
  }, [dispatch, state.assignments]);

  const handleTeacherGradeSubmission = useCallback(async (payload: GradeSubmissionPayload) => {
    dispatch({ type: ActionType.GRADE_SUBMISSION_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.GRADE_SUBMISSION_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const submission = state.submissions.find(s => s.id === payload.submissionId);
      if (!submission) {
        dispatch({ type: ActionType.GRADE_SUBMISSION_FAILURE, payload: "Submission not found." });
        return;
      }
      const assignment = state.assignments.find(a => a.id === submission.assignmentId);
      if (!assignment || !assignment.courseId) {
         dispatch({ type: ActionType.GRADE_SUBMISSION_FAILURE, payload: "Assignment or course context not found for submission." });
        return;
      }

      const submissionRef = doc(db, "courses", assignment.courseId, "assignments", submission.assignmentId, "submissions", payload.submissionId);
      await updateDoc(submissionRef, { grade: payload.grade, feedback: payload.feedback });
      dispatch({ type: ActionType.GRADE_SUBMISSION_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.GRADE_SUBMISSION_FAILURE, payload: error.message || "Failed to grade submission."});
    }
  }, [dispatch, state.submissions, state.assignments]);

  const contextValue = {
    state,
    dispatch,
    handleLoginUser,
    handleRegisterStudent,
    handleLogoutUser,
    handleLessonFileUpload,
    handleAssignmentAttachmentUpload,
    handleStudentSubmissionUpload,
    handleBulkCreateStudents,
    handleAdminCreateUser,
    handleAdminUpdateUser,
    handleAdminDeleteUser,
    handleCreateCourse,
    handleUpdateCourse,
    handleDeleteCourse,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleCreateAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    handleStudentSubmitAssignment,
    handleTeacherGradeSubmission,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
