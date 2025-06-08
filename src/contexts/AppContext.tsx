

"use client";

import type { Dispatch } from 'react';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, AppAction, User, Course, Lesson, Assignment, Submission, QuizQuestion, QuizAnswer, NotificationMessage, CreateUserPayload, UpdateUserPayload, DeleteUserPayload, Announcement, CreateCoursePayload, UpdateCoursePayload, DeleteCoursePayload, TakeAttendancePayload, UpdateAttendanceRecordPayload, AttendanceRecord, Payment, RecordPaymentPayload, UpdatePaymentPayload, CreateLessonPayload, UpdateLessonPayload, DeleteLessonPayload, UpdateAssignmentPayload, DeleteAssignmentPayload } from '@/types';
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
  currentUser: null,
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
  isLoading: false,
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
        isLoading: false,
      };
    }
    case ActionType.LOGIN_USER: {
      const user = state.users.find(
        (u) => u.email === action.payload.email
      );
      if (user) {
        // Simulate password check - In a real app, this would be done by the backend/auth provider
        if (user.password === action.payload.password) {
          return { ...state, currentUser: user, error: null, successMessage: 'Login successful!' };
        }
      }
      return { ...state, error: 'Invalid credentials', currentUser: null };
    }
    case ActionType.LOGOUT_USER:
      return { ...state, currentUser: null, notifications: [], successMessage: 'Logged out successfully.' };
    
    case ActionType.REGISTER_STUDENT: {
      const emailExists = state.users.some(u => u.email === action.payload.email);
      if (emailExists) {
        return { ...state, error: "Email already exists." };
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        password: action.payload.password, 
        role: UserRole.STUDENT,
        avatarUrl: action.payload.avatarUrl || `https://placehold.co/100x100.png?text=${action.payload.name.substring(0,2).toUpperCase()}`,
      };
      const newNotification: Omit<NotificationMessage, 'id' | 'read' | 'timestamp'> = {
        userId: newUser.id,
        type: 'success',
        message: `Welcome to ${APP_NAME}, ${newUser.name}! Your account has been created.`,
      };
      const addedNotification: NotificationMessage = {
        ...newNotification,
        id: `notif-${Date.now()}`,
        read: false,
        timestamp: Date.now(),
      };
      return {
        ...state,
        users: [...state.users, newUser],
        currentUser: newUser, 
        error: null,
        successMessage: 'Registration successful!',
        notifications: [addedNotification, ...state.notifications].slice(0, 20),
      };
    }

    case ActionType.CREATE_USER: {
      const payload = action.payload as CreateUserPayload;
      const emailExists = state.users.some(u => u.email === payload.email);
      if (emailExists) {
        return { ...state, error: `Email ${payload.email} already exists.` };
      }
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        avatarUrl: payload.avatarUrl || `https://placehold.co/100x100.png?text=${payload.name.substring(0,2).toUpperCase()}`,
      };
      return {
        ...state,
        users: [...state.users, newUser],
        error: null,
        successMessage: `User ${newUser.name} (${newUser.role}) created successfully.`,
      };
    }

    case ActionType.UPDATE_USER: {
      const payload = action.payload as UpdateUserPayload;
      return {
        ...state,
        users: state.users.map(user =>
          user.id === payload.id ? { ...user, ...payload } : user
        ),
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
    
     case ActionType.CREATE_COURSE: {
      const newCourse = action.payload as Course; 
      let finalTeacherId = newCourse.teacherId;
      if (state.currentUser?.role === UserRole.TEACHER) {
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
      return {
        ...state,
        assignments: [...state.assignments, newAssignment],
        successMessage: `Assignment "${title}" created successfully.`,
      };
    }

    case ActionType.UPDATE_ASSIGNMENT: {
        const payload = action.payload as UpdateAssignmentPayload;
        // Recalculate totalPoints if questions/rubric changed
        let totalPoints = payload.totalPoints;
        if (payload.type === AssignmentType.QUIZ && payload.questions) {
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
            submissions: state.submissions.filter(sub => sub.assignmentId !== id), // Also remove related submissions
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

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> } | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    dispatch({ type: ActionType.LOAD_DATA, payload: {} });
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


  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
