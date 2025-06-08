
"use client";

import type { Dispatch } from 'react';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  auth, 
  db, 
  // storage // Import if/when storage operations are added to context
} from '@/lib/firebase'; 
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

import type { AppState, AppAction, User, Course, Lesson, Assignment, Submission, QuizQuestion, QuizAnswer, NotificationMessage, CreateUserPayload, UpdateUserPayload, DeleteUserPayload, Announcement, CreateCoursePayload, UpdateCoursePayload, DeleteCoursePayload, TakeAttendancePayload, UpdateAttendanceRecordPayload, AttendanceRecord, Payment, RecordPaymentPayload, UpdatePaymentPayload, CreateLessonPayload, UpdateLessonPayload, DeleteLessonPayload, UpdateAssignmentPayload, DeleteAssignmentPayload, LoginUserPayload, RegisterStudentPayload } from '@/types';
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
  currentUser: undefined, // undefined initially, null if no user, User object if logged in
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
  isLoading: true, // Start with loading true until auth state is determined
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
      const loadedSubmissions = (action.payload.submissions || SAMPLE_SUBMISSIONS).map(submission => {
        if (submission.assignmentId) {
          const assignment = (action.payload.assignments || SAMPLE_ASSIGNMENTS).find(a => a.id === submission.assignmentId);
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
      });

      return {
        ...state,
        users: action.payload.users || SAMPLE_USERS,
        courses: action.payload.courses || SAMPLE_COURSES,
        lessons: action.payload.lessons || SAMPLE_LESSONS,
        assignments: action.payload.assignments || SAMPLE_ASSIGNMENTS,
        submissions: loadedSubmissions,
        enrollments: action.payload.enrollments || INITIAL_ENROLLMENTS,
        attendanceRecords: action.payload.attendanceRecords || SAMPLE_ATTENDANCE,
        payments: action.payload.payments || SAMPLE_PAYMENTS,
        notifications: action.payload.notifications || SAMPLE_NOTIFICATIONS,
        announcements: action.payload.announcements || SAMPLE_ANNOUNCEMENTS,
        // isLoading: false, // isLoading is now managed by auth state
      };
    }
    
    case ActionType.LOGIN_USER_REQUEST:
    case ActionType.REGISTER_STUDENT_REQUEST:
    case ActionType.LOGOUT_USER_REQUEST:
      return { ...state, isLoading: true, error: null, successMessage: null };

    case ActionType.LOGIN_USER_SUCCESS:
    case ActionType.REGISTER_STUDENT_SUCCESS:
    case ActionType.FETCH_USER_PROFILE_SUCCESS:
      return { ...state, currentUser: action.payload, isLoading: false, error: null, successMessage: action.type === ActionType.LOGIN_USER_SUCCESS ? 'Login successful!' : (action.type === ActionType.REGISTER_STUDENT_SUCCESS ? 'Registration successful!' : null ) };
    
    case ActionType.SET_CURRENT_USER: // From onAuthStateChanged
      return { ...state, currentUser: action.payload, isLoading: false, error: null };

    case ActionType.LOGIN_USER_FAILURE:
    case ActionType.REGISTER_STUDENT_FAILURE:
    case ActionType.LOGOUT_USER_FAILURE:
    case ActionType.FETCH_USER_PROFILE_FAILURE:
      return { ...state, isLoading: false, error: action.payload, currentUser: state.currentUser === undefined ? null : state.currentUser  }; // If undefined, means initial load failed so set to null

    case ActionType.LOGOUT_USER_SUCCESS:
      return { ...initialState, users: state.users, courses: state.courses, lessons: state.lessons, assignments: state.assignments, submissions: state.submissions, enrollments: state.enrollments, attendanceRecords: state.attendanceRecords, payments: state.payments, announcements: state.announcements, currentUser: null, isLoading: false, successMessage: 'Logged out successfully.' };
    
    case ActionType.CREATE_USER: { // Admin action
      const payload = action.payload as CreateUserPayload;
      // This action assumes password creation for Firebase Auth is handled elsewhere (e.g. admin SDK or invites)
      // It only creates the Firestore document.
      const emailExists = state.users.some(u => u.email === payload.email);
      if (emailExists) {
        return { ...state, error: `Email ${payload.email} already exists.` };
      }
      const newUserDoc: User = { // This is for Firestore document
        id: `user-admin-created-${Date.now()}`, // Placeholder ID, should be Firebase UID if user is also created in Auth
        name: payload.name,
        email: payload.email,
        role: payload.role,
        avatarUrl: payload.avatarUrl || `https://placehold.co/100x100.png?text=${payload.name.substring(0,2).toUpperCase()}`,
      };
      // Actual Firestore write would happen in an async thunk or useEffect calling a service
      // For now, just updating local state for consistency if not using live DB
      return {
        ...state,
        users: [...state.users, newUserDoc],
        error: null,
        successMessage: `User document for ${newUserDoc.name} (${newUserDoc.role}) created successfully in local state.`,
      };
    }

    case ActionType.UPDATE_USER: {
      const payload = action.payload as UpdateUserPayload;
      // Actual Firestore update would happen in an async thunk or useEffect
      return {
        ...state,
        users: state.users.map(user =>
          user.id === payload.id ? { ...user, ...payload } : user
        ),
        currentUser: state.currentUser?.id === payload.id ? { ...state.currentUser, ...payload } : state.currentUser,
        successMessage: `User ${payload.name || state.users.find(u=>u.id === payload.id)?.name} updated successfully.`,
      };
    }

    case ActionType.DELETE_USER: {
      const payload = action.payload as DeleteUserPayload;
      if (state.currentUser && state.currentUser.id === payload.id) {
        return { ...state, error: "You cannot delete your own account." };
      }
      const userToDelete = state.users.find(u => u.id === payload.id);
      // Actual Firestore delete would happen in an async thunk or useEffect
      return {
        ...state,
        users: state.users.filter(user => user.id !== payload.id),
        successMessage: `User ${userToDelete?.name || payload.id} deleted successfully.`,
      };
    }
    
     case ActionType.CREATE_COURSE: {
      const newCourse = action.payload as Course; 
      let finalTeacherId = newCourse.teacherId;
      if (state.currentUser?.role === UserRole.TEACHER && !finalTeacherId) { // Teacher creating for self
        finalTeacherId = state.currentUser.id;
      } else if (state.currentUser?.role === UserRole.SUPER_ADMIN) { // Admin can assign or unassign
        finalTeacherId = newCourse.teacherId || 'unassigned';
      }

      const courseToAdd: Course = {
        ...newCourse,
        id: newCourse.id || `course-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
        teacherId: finalTeacherId,
        studentIds: newCourse.studentIds || [],
        cost: newCourse.cost || 0, 
      };
      // Firestore write would be async
      return {
        ...state,
        courses: [...state.courses, courseToAdd],
        successMessage: `Course "${courseToAdd.name}" created successfully.`,
      };
    }

    case ActionType.UPDATE_COURSE: {
      const updatedCourseData = action.payload as UpdateCoursePayload;
      // Firestore update would be async
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === updatedCourseData.id ? { ...course, ...updatedCourseData, cost: updatedCourseData.cost ?? course.cost } : course
        ),
        successMessage: `Course "${updatedCourseData.name || state.courses.find(c=>c.id === updatedCourseData.id)?.name}" updated successfully.`,
      };
    }

    case ActionType.DELETE_COURSE: {
      const { id } = action.payload as DeleteCoursePayload;
      const courseToDelete = state.courses.find(c => c.id === id);
      if (courseToDelete && courseToDelete.studentIds.length > 0 && state.currentUser?.role !== UserRole.SUPER_ADMIN) {
         return { ...state, error: "Course has enrolled students. Only Super Admin can delete." };
      }
      // Firestore delete would be async, and cascade deletes for subcollections if needed
      return {
        ...state,
        courses: state.courses.filter(course => course.id !== id),
        lessons: state.lessons.filter(lesson => lesson.courseId !== id),
        assignments: state.assignments.filter(assignment => assignment.courseId !== id),
        successMessage: `Course "${courseToDelete?.name || id}" deleted successfully.`,
      };
    }
    
    case ActionType.CREATE_LESSON: {
      const payload = action.payload as CreateLessonPayload;
      const newLesson: Lesson = {
        id: `lesson-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        courseId: payload.courseId,
        title: payload.title,
        contentMarkdown: payload.contentMarkdown,
        videoUrl: payload.videoUrl,
        fileUrl: payload.fileUrl,
        fileName: payload.fileName,
        order: payload.order,
      };
      // Firestore write would be async
      return {
        ...state,
        lessons: [...state.lessons, newLesson].sort((a, b) => a.order - b.order),
        successMessage: `Lesson "${newLesson.title}" created successfully.`,
      };
    }

    case ActionType.UPDATE_LESSON: {
      const payload = action.payload as UpdateLessonPayload;
      // Firestore update would be async
      return {
        ...state,
        lessons: state.lessons.map(lesson =>
          lesson.id === payload.id ? { ...lesson, ...payload } : lesson
        ).sort((a, b) => a.order - b.order),
        successMessage: `Lesson "${payload.title || state.lessons.find(l=>l.id === payload.id)?.title}" updated.`,
      };
    }

    case ActionType.DELETE_LESSON: {
      const { id, courseId } = action.payload as DeleteLessonPayload;
      const lessonToDelete = state.lessons.find(l => l.id === id);
      // Firestore delete would be async
      return {
        ...state,
        lessons: state.lessons.filter(lesson => lesson.id !== id),
        successMessage: `Lesson "${lessonToDelete?.title || id}" deleted successfully.`,
      };
    }

    case ActionType.CREATE_ASSIGNMENT: {
      const { courseId, title, description, dueDate, type, questions, rubric, manualTotalPoints } = action.payload;
      let totalPoints = 0;
      if (type === AssignmentType.QUIZ && questions) {
        totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      } else if (type === AssignmentType.STANDARD && rubric) {
        totalPoints = rubric.reduce((sum, r) => sum + r.points, 0);
      } else if (manualTotalPoints) {
        totalPoints = manualTotalPoints;
      }

      const newAssignmentId = `assign-${Date.now()}`;
      const newAssignment: Assignment = {
        id: newAssignmentId,
        courseId,
        title,
        description,
        dueDate,
        type,
        questions: questions?.map(q => ({...q, id: q.id || `q-${Date.now()}-${Math.random()}` , assignmentId: newAssignmentId})),
        rubric,
        totalPoints,
      };
      // Firestore write would be async
      return {
        ...state,
        assignments: [...state.assignments, newAssignment],
        successMessage: `Assignment "${title}" created successfully.`,
      };
    }

    case ActionType.UPDATE_ASSIGNMENT: {
        const payload = action.payload as UpdateAssignmentPayload;
        let totalPoints = payload.totalPoints;
        if (payload.type === AssignmentType.QUIZ && payload.questions) {
            totalPoints = payload.questions.reduce((sum, q) => sum + q.points, 0);
        } else if (payload.type === AssignmentType.STANDARD && payload.rubric) {
            totalPoints = payload.rubric.reduce((sum, r) => sum + r.points, 0);
        }
        // Firestore update would be async
        return {
            ...state,
            assignments: state.assignments.map(assignment =>
                assignment.id === payload.id ? { ...assignment, ...payload, totalPoints } : assignment
            ),
            successMessage: `Assignment "${payload.title || state.assignments.find(a=>a.id === payload.id)?.title}" updated.`,
        };
    }

    case ActionType.DELETE_ASSIGNMENT: {
        const { id } = action.payload as DeleteAssignmentPayload;
        const assignmentToDelete = state.assignments.find(a => a.id === id);
        // Firestore delete would be async, and cascade deletes for submissions
        return {
            ...state,
            assignments: state.assignments.filter(assignment => assignment.id !== id),
            submissions: state.submissions.filter(sub => sub.assignmentId !== id), 
            successMessage: `Assignment "${assignmentToDelete?.title || id}" deleted successfully.`,
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
      // Firestore write would be async
      return {
        ...state,
        attendanceRecords: updatedAttendanceRecords,
        successMessage: `Attendance for ${date} saved. ${recordsAdded} record(s) added, ${recordsUpdated} record(s) updated.`,
      };
    }

    case ActionType.UPDATE_ATTENDANCE_RECORD: {
      const payload = action.payload as UpdateAttendanceRecordPayload;
      // Firestore update would be async
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
      // Firestore write would be async
      return {
        ...state,
        payments: [...state.payments, newPayment],
        successMessage: `Payment of $${newPayment.amount} for student ${newPayment.studentId} recorded.`,
      };
    }

    case ActionType.UPDATE_PAYMENT: {
      const payload = action.payload as UpdatePaymentPayload;
      // Firestore update would be async
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
      return { ...state, error: action.payload, successMessage: null };
    case ActionType.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionType.SET_SUCCESS_MESSAGE:
      return { ...state, successMessage: action.payload, error: null };
    case ActionType.CLEAR_SUCCESS_MESSAGE:
      return { ...state, successMessage: null };
    default:
      // Ensure all action types are handled or explicitly ignored
      // const _exhaustiveCheck: never = action; // Uncomment for exhaustive checks
      return state;
  }
};

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> } | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial non-user-specific data (courses, etc.) from mock data for now
    // In a real app, this would be fetched from Firestore after auth is resolved or based on public access rules
    dispatch({ type: ActionType.LOAD_DATA, payload: {} });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userProfile = { id: userDocSnap.id, ...userDocSnap.data() } as User;
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: userProfile });
            // Optionally, load user-specific data here (enrollments, submissions, etc.)
            // For now, LOAD_DATA loads all sample data, which will be filtered by UI components
          } else {
            // This case should ideally not happen if registration creates the user doc.
            // Could be a new Firebase Auth user without a Firestore profile.
            console.warn(`No Firestore profile found for user ${firebaseUser.uid}. Logging out.`);
            await signOut(auth); // Sign out the user as their profile is incomplete
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
            dispatch({ type: ActionType.SET_ERROR, payload: "User profile not found. Please contact support." });
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
          dispatch({ type: ActionType.SET_ERROR, payload: error.message || "Failed to load user profile." });
        }
      } else {
        // User is signed out
        dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    if (state.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
      dispatch({ type: ActionType.CLEAR_ERROR }); 
    }
    if (state.successMessage) {
      toast({ title: "Success", description: state.successMessage });
      dispatch({ type: ActionType.CLEAR_SUCCESS_MESSAGE });
    }
  }, [state.error, state.successMessage, toast]);


  // --- Async Action Creators (Thunks) ---
  // These functions will dispatch multiple actions and interact with Firebase services

  const handleLoginUser = async (payload: LoginUserPayload) => {
    dispatch({ type: ActionType.LOGIN_USER_REQUEST });
    try {
      if (!payload.password) { // Ensure password is provided
        throw new Error("Password is required for login.");
      }
      const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password);
      // onAuthStateChanged will handle fetching profile and dispatching LOGIN_USER_SUCCESS or SET_CURRENT_USER
      // No explicit success dispatch here as onAuthStateChanged is the source of truth for currentUser
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch({ type: ActionType.LOGIN_USER_FAILURE, payload: error.message || "Failed to login." });
    }
  };

  const handleRegisterStudent = async (payload: RegisterStudentPayload) => {
    dispatch({ type: ActionType.REGISTER_STUDENT_REQUEST });
    try {
      if (!payload.password) { // Ensure password is provided for registration
        throw new Error("Password is required for registration.");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const newUserForFirestore: User = {
        id: firebaseUser.uid,
        name: payload.name,
        email: firebaseUser.email || payload.email, // Use email from FirebaseUser if available
        role: UserRole.STUDENT, // Default role for self-registration
        avatarUrl: payload.avatarUrl || `https://placehold.co/100x100.png?text=${payload.name.substring(0,2).toUpperCase()}`,
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUserForFirestore);
      // onAuthStateChanged will handle setting currentUser and dispatching success
      // We can add a specific notification here if needed:
      dispatch({ type: ActionType.ADD_NOTIFICATION, payload: {
        userId: firebaseUser.uid,
        type: 'success',
        message: `Welcome to ${APP_NAME}, ${newUserForFirestore.name}! Your account has been created.`
      }});

    } catch (error: any) {
      console.error("Registration error:", error);
      dispatch({ type: ActionType.REGISTER_STUDENT_FAILURE, payload: error.message || "Failed to register." });
    }
  };

  const handleLogoutUser = async () => {
    dispatch({ type: ActionType.LOGOUT_USER_REQUEST });
    try {
      await signOut(auth);
      // onAuthStateChanged will set currentUser to null
      dispatch({ type: ActionType.LOGOUT_USER_SUCCESS }); // To clear notifications etc.
    } catch (error: any) {
      console.error("Logout error:", error);
      dispatch({ type: ActionType.LOGOUT_USER_FAILURE, payload: error.message || "Failed to logout." });
    }
  };
  
  // Provide both state and the new async action handlers
  const contextValue = {
    state,
    dispatch, // Keep synchronous dispatch for other actions
    handleLoginUser,
    handleRegisterStudent,
    handleLogoutUser,
  };


  return (
    <AppContext.Provider value={contextValue as any}> {/* Cast to any for simplicity with new async handlers */}
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  // This assertion is safe if we ensure AppProvider always provides the async handlers
  return context as { 
    state: AppState; 
    dispatch: Dispatch<AppAction>;
    handleLoginUser: (payload: LoginUserPayload) => Promise<void>;
    handleRegisterStudent: (payload: RegisterStudentPayload) => Promise<void>;
    handleLogoutUser: () => Promise<void>;
  };
};
