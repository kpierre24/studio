
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
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, type Firestore } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";


import type { AppState, AppAction, User, Course, Lesson, Assignment, Submission, QuizQuestion, QuizAnswer, NotificationMessage, CreateUserPayload, UpdateUserPayload, DeleteUserPayload, Announcement, CreateCoursePayload, UpdateCoursePayload, DeleteCoursePayload, TakeAttendancePayload, UpdateAttendanceRecordPayload, AttendanceRecord, Payment, RecordPaymentPayload, UpdatePaymentPayload, CreateLessonPayload, UpdateLessonPayload, DeleteLessonPayload, CreateAssignmentPayload, UpdateAssignmentPayload, DeleteAssignmentPayload, LoginUserPayload, RegisterStudentPayload, SubmitAssignmentPayload, GradeSubmissionPayload, BulkCreateStudentData, BulkCreateStudentsResult } from '@/types';
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
    case ActionType.BULK_CREATE_STUDENTS_REQUEST:
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
    
    case ActionType.CREATE_USER: { 
      const payload = action.payload as CreateUserPayload;
      const emailExists = state.users.some(u => u.email === payload.email);
      if (emailExists) {
        return { ...state, error: `Email ${payload.email} already exists.` };
      }
      const newUserDoc: User = { 
        id: `user-admin-created-${Date.now()}`, 
        name: payload.name,
        email: payload.email,
        role: payload.role,
        avatarUrl: payload.avatarUrl || `https://placehold.co/100x100.png?text=${payload.name.substring(0,2).toUpperCase()}`,
      };
      return {
        ...state,
        users: [...state.users, newUserDoc],
        error: null,
        successMessage: `User document for ${newUserDoc.name} (${newUserDoc.role}) created successfully in local state.`,
      };
    }

    case ActionType.UPDATE_USER: {
      const payload = action.payload as UpdateUserPayload;
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
      return {
        ...state,
        users: state.users.filter(user => user.id !== payload.id),
        successMessage: `User ${userToDelete?.name || payload.id} deleted successfully.`,
      };
    }

    case ActionType.BULK_CREATE_STUDENTS_SUCCESS: {
      const { users: newUsers, results } = action.payload;
      // Filter out any new users that might already exist by ID (though unlikely with UUIDs from Firebase)
      const uniqueNewUsers = newUsers.filter(newUser => !state.users.some(existingUser => existingUser.id === newUser.id));
      return {
        ...state,
        users: [...state.users, ...uniqueNewUsers],
        isLoading: false,
        error: null,
        // Success message handled by toast in the calling function
      };
    }
    case ActionType.BULK_CREATE_STUDENTS_FAILURE: {
       const { error, results } = action.payload;
       // Error message handled by toast in the calling function
      return { ...state, isLoading: false, error: error };
    }
    
     case ActionType.CREATE_COURSE: {
      const newCourse = action.payload as Course; 
      let finalTeacherId = newCourse.teacherId;
      if (state.currentUser?.role === UserRole.TEACHER && !finalTeacherId) { 
        finalTeacherId = state.currentUser.id;
      } else if (state.currentUser?.role === UserRole.SUPER_ADMIN) { 
        finalTeacherId = newCourse.teacherId || 'unassigned';
      }

      const courseToAdd: Course = {
        ...newCourse,
        id: newCourse.id || `course-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
        teacherId: finalTeacherId,
        studentIds: newCourse.studentIds || [],
        cost: newCourse.cost || 0, 
      };
      return {
        ...state,
        courses: [...state.courses, courseToAdd],
        successMessage: `Course "${courseToAdd.name}" created successfully.`,
      };
    }

    case ActionType.UPDATE_COURSE: {
      const updatedCourseData = action.payload as UpdateCoursePayload;
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
      return {
        ...state,
        lessons: [...state.lessons, newLesson].sort((a, b) => a.order - b.order),
        successMessage: `Lesson "${newLesson.title}" created successfully.`,
      };
    }

    case ActionType.UPDATE_LESSON: {
      const payload = action.payload as UpdateLessonPayload;
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
      return {
        ...state,
        lessons: state.lessons.filter(lesson => lesson.id !== id),
        successMessage: `Lesson "${lessonToDelete?.title || id}" deleted successfully.`,
      };
    }

    case ActionType.CREATE_ASSIGNMENT: {
      const { courseId, title, description, dueDate, type, questions, rubric, manualTotalPoints, assignmentFileName, assignmentFileUrl } = action.payload as CreateAssignmentPayload;
      let totalPoints = 0;
      if (type === AssignmentType.QUIZ && questions) {
        totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      } else if (type === AssignmentType.STANDARD && rubric) {
        totalPoints = rubric.reduce((sum, r) => sum + r.points, 0);
      } else if (manualTotalPoints) {
        totalPoints = manualTotalPoints;
      }

      const newAssignmentId = `assign-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;
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
        assignmentFileName,
        assignmentFileUrl,
      };
      return {
        ...state,
        assignments: [...state.assignments, newAssignment],
        successMessage: `Assignment "${title}" created successfully.`,
      };
    }

    case ActionType.UPDATE_ASSIGNMENT: {
        const payload = action.payload as UpdateAssignmentPayload;
        let totalPoints = payload.totalPoints; // Use existing if not overridden
        if (payload.manualTotalPoints !== undefined) {
            totalPoints = payload.manualTotalPoints;
        } else if (payload.type === AssignmentType.QUIZ && payload.questions) {
            totalPoints = payload.questions.reduce((sum, q) => sum + q.points, 0);
        } else if (payload.type === AssignmentType.STANDARD && payload.rubric) {
            totalPoints = payload.rubric.reduce((sum, r) => sum + r.points, 0);
        }
        
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
        return {
            ...state,
            assignments: state.assignments.filter(assignment => assignment.id !== id),
            submissions: state.submissions.filter(sub => sub.assignmentId !== id), 
            successMessage: `Assignment "${assignmentToDelete?.title || id}" deleted successfully.`,
        };
    }
    
    case ActionType.SUBMIT_ASSIGNMENT: {
      const payload = action.payload as Submission; 
      
      const existingSubmissionIndex = state.submissions.findIndex(
        sub => sub.assignmentId === payload.assignmentId && sub.studentId === payload.studentId
      );

      if (existingSubmissionIndex !== -1) {
        return { ...state, error: "You have already submitted this assignment." };
      }

      const newSubmission: Submission = {
        ...payload, // Payload now contains id, studentId, assignmentId, fileUrl, fileName, content from the upload handler
        submittedAt: new Date().toISOString(),
      };
      
      const assignment = state.assignments.find(a => a.id === payload.assignmentId);
      const course = state.courses.find(c => c.id === assignment?.courseId);
      const teacher = state.users.find(u => u.id === course?.teacherId);
      let notifications = state.notifications;
      if(teacher && assignment && course) {
        notifications = [
          {
            id: `notif-sub-${newSubmission.id}`,
            userId: teacher.id,
            type: 'submission_received',
            message: `New submission for '${assignment.title}' in course '${course.name}' from student ${state.users.find(u => u.id === payload.studentId)?.name || payload.studentId}.`,
            link: `/teacher/courses/${assignment.courseId}?assignment=${assignment.id}`, 
            read: false,
            timestamp: Date.now(),
          },
          ...state.notifications
        ];
      }

      return {
        ...state,
        submissions: [...state.submissions, newSubmission],
        notifications: notifications.slice(0,20),
        successMessage: `Assignment submitted successfully.`,
      };
    }

    case ActionType.GRADE_SUBMISSION: {
      const { submissionId, grade, feedback } = action.payload as GradeSubmissionPayload;
      const submissionToGrade = state.submissions.find(sub => sub.id === submissionId);
      if (!submissionToGrade) {
        return { ...state, error: "Submission not found." };
      }
      const assignment = state.assignments.find(a => a.id === submissionToGrade.assignmentId);


      let notifications = state.notifications;
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

      return {
        ...state,
        submissions: state.submissions.map(sub =>
          sub.id === submissionId ? { ...sub, grade, feedback, submittedAt: sub.submittedAt || new Date().toISOString() } : sub 
        ),
        notifications: notifications.slice(0,20),
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
      return { ...state, error: action.payload, successMessage: null };
    case ActionType.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionType.SET_SUCCESS_MESSAGE:
      return { ...state, successMessage: action.payload, error: null };
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
} | undefined>(undefined);


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    dispatch({ type: ActionType.LOAD_DATA, payload: {} });

    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      console.error("Firebase Auth instance not available in AppContext. Firebase might not be initialized correctly (check .env.local).");
      dispatch({ type: ActionType.SET_CURRENT_USER, payload: null }); 
      dispatch({ type: ActionType.SET_ERROR, payload: "Firebase initialization failed. App cannot connect to authentication services." });
      return;
    }
    
    const dbInstance = getFirebaseDb(); 
    if (!dbInstance) {
        console.error("Firebase Firestore instance not available in AppContext.");
    }

    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        if (!dbInstance) {
            console.error("Firestore instance not available for fetching user profile.");
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
            dispatch({ type: ActionType.SET_ERROR, payload: "Database connection error. Cannot fetch user profile." });
            return;
        }
        try {
          const userDocRef = doc(dbInstance, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userProfile = { id: userDocSnap.id, ...userDocSnap.data() } as User;
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: userProfile });
          } else {
            console.warn(`No Firestore profile found for user ${firebaseUser.uid}. Logging out.`);
            await signOut(authInstance); 
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
            dispatch({ type: ActionType.SET_ERROR, payload: "User profile not found. Please contact support." });
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
          dispatch({ type: ActionType.SET_ERROR, payload: error.message || "Failed to load user profile." });
        }
      } else {
        dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
      }
    });

    return () => unsubscribe();
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
  }, [state.error, state.successMessage, toast, dispatch]);


  const handleLoginUser = useCallback(async (payload: LoginUserPayload) => {
    dispatch({ type: ActionType.LOGIN_USER_REQUEST });
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      dispatch({ type: ActionType.LOGIN_USER_FAILURE, payload: "Firebase Auth not initialized." });
      return;
    }
    try {
      if (!payload.password) {
        throw new Error("Password is required for login.");
      }
      await signInWithEmailAndPassword(authInstance, payload.email, payload.password);
      // onAuthStateChanged handles success
    } catch (error: any) {
      console.error("Login error:", error);
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
      if (!payload.password) {
        throw new Error("Password is required for registration.");
      }
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
        userId: firebaseUser.uid,
        type: 'success',
        message: `Welcome to ${APP_NAME}, ${newUserForFirestore.name}! Your account has been created.`
      }});
      // onAuthStateChanged handles success
    } catch (error: any) {
      console.error("Registration error:", error);
      dispatch({ type: ActionType.REGISTER_STUDENT_FAILURE, payload: error.message || "Failed to register." });
    }
  }, [dispatch]);

  const handleLogoutUser = useCallback(async () => {
    dispatch({ type: ActionType.LOGOUT_USER_REQUEST });
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      dispatch({ type: ActionType.LOGOUT_USER_FAILURE, payload: "Firebase Auth not initialized." });
      return;
    }
    try {
      await signOut(authInstance);
      dispatch({ type: ActionType.LOGOUT_USER_SUCCESS }); 
    } catch (error: any) {
      console.error("Logout error:", error);
      dispatch({ type: ActionType.LOGOUT_USER_FAILURE, payload: error.message || "Failed to logout." });
    }
  }, [dispatch]);

  const handleFileUpload = useCallback(async (path: string, file: File) => {
    const storage = getFirebaseStorage();
    if (!storage) throw new Error("Firebase Storage not initialized.");
    if (!file) throw new Error("No file provided for upload.");

    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return { downloadURL, fileName: file.name };
  }, []);

  const handleLessonFileUpload = useCallback(async (courseId: string, lessonId: string, file: File) => {
    const path = `lessons/${courseId}/${lessonId}/${file.name}`;
    const { downloadURL, fileName } = await handleFileUpload(path, file);
    return { fileUrl: downloadURL, fileName };
  }, [handleFileUpload]);

  const handleAssignmentAttachmentUpload = useCallback(async (courseId: string, assignmentId: string, file: File) => {
    const path = `assignment_attachments/${courseId}/${assignmentId}/${file.name}`;
    const { downloadURL, fileName } = await handleFileUpload(path, file);
    return { assignmentFileUrl: downloadURL, assignmentFileName: fileName };
  }, [handleFileUpload]);
  
  const handleStudentSubmissionUpload = useCallback(async (courseId: string, assignmentId: string, studentId: string, file: File) => {
    const path = `submissions/${courseId}/${assignmentId}/${studentId}/${file.name}`;
    const { downloadURL, fileName } = await handleFileUpload(path, file);
    dispatch({ 
        type: ActionType.SUBMIT_ASSIGNMENT, 
        payload: { 
            id: `sub-temp-${Date.now()}`, // Temporary ID, real one set by reducer logic for new items
            assignmentId, 
            studentId, 
            fileUrl: downloadURL, 
            fileName,
            submittedAt: new Date().toISOString(), // ensure submittedAt is present
        } as Submission // Cast to Submission if content is optional
    });
    return { fileUrl: downloadURL, fileName };
  }, [handleFileUpload, dispatch]);

  const handleBulkCreateStudents = useCallback(async (studentsToCreate: BulkCreateStudentData[]) => {
    dispatch({ type: ActionType.BULK_CREATE_STUDENTS_REQUEST });
    const authInstance = getFirebaseAuth();
    const dbInstance = getFirebaseDb();

    if (!authInstance || !dbInstance) {
      dispatch({ type: ActionType.BULK_CREATE_STUDENTS_FAILURE, payload: { error: "Firebase services not initialized.", results: [] } });
      return;
    }

    const results: BulkCreateStudentsResult = [];
    const successfullyCreatedUsers: User[] = [];

    for (const studentData of studentsToCreate) {
      try {
        const emailExistsLocally = state.users.some(u => u.email === studentData.email);
        if (emailExistsLocally) {
          results.push({ success: false, email: studentData.email, error: "Email already exists in local user list." });
          continue;
        }
        
        if (!studentData.password) {
          results.push({ success: false, email: studentData.email, error: "Password is required for this user." });
          continue;
        }

        const userCredential = await createUserWithEmailAndPassword(authInstance, studentData.email, studentData.password);
        const firebaseUser = userCredential.user;

        const newUserForFirestore: User = {
          id: firebaseUser.uid,
          name: studentData.name,
          email: firebaseUser.email || studentData.email,
          role: UserRole.STUDENT,
          avatarUrl: `https://placehold.co/100x100.png?text=${studentData.name.substring(0, 2).toUpperCase()}`,
        };

        await setDoc(doc(dbInstance, "users", firebaseUser.uid), newUserForFirestore);
        successfullyCreatedUsers.push(newUserForFirestore);
        results.push({ success: true, email: studentData.email, userId: firebaseUser.uid });

        dispatch({ type: ActionType.ADD_NOTIFICATION, payload: {
          userId: firebaseUser.uid,
          type: 'success',
          message: `Welcome to ${APP_NAME}, ${newUserForFirestore.name}! Your account has been created via bulk upload.`
        }});

      } catch (error: any) {
        console.error(`Failed to create user ${studentData.email}:`, error);
        results.push({ success: false, email: studentData.email, error: error.message || "Failed to create user." });
      }
    }

    if (successfullyCreatedUsers.length > 0) {
      dispatch({ type: ActionType.BULK_CREATE_STUDENTS_SUCCESS, payload: { users: successfullyCreatedUsers, results } });
      toast({ title: "Bulk Creation Complete", description: `${successfullyCreatedUsers.length} student(s) created. ${results.filter(r => !r.success).length} failed.` });
    } else if (results.length > 0) {
      dispatch({ type: ActionType.BULK_CREATE_STUDENTS_FAILURE, payload: { error: "Bulk student creation failed for all entries.", results } });
      toast({ variant: "destructive", title: "Bulk Creation Failed", description: `No students were successfully created. ${results.filter(r => !r.success).length} attempt(s) failed.` });
    } else {
        toast({ title: "Bulk Creation", description: "No students were processed (CSV might be empty or invalid after filtering)."})
    }
  }, [state.users, toast, dispatch]);
  
  const contextValue = {
    state,
    dispatch,
    handleLoginUser,
    handleRegisterStudent,
    handleLogoutUser,
    handleLessonFileUpload,
    handleAssignmentAttachmentUpload,
    handleStudentSubmissionUpload,
    handleBulkCreateStudents, // Now correctly included
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

    