

"use client";

import type { Dispatch } from 'react';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, AppAction, User, Course, Lesson, Assignment, Submission, QuizQuestion, QuizAnswer, NotificationMessage, CreateUserPayload, UpdateUserPayload, DeleteUserPayload, Announcement } from '@/types';
import { ActionType, UserRole, AssignmentType, QuestionType } from '@/types';
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
  announcements: [], // Initialize announcements
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
      // Assuming single correct answer for MCQs
      isCorrect = studentAnswer.toString().toLowerCase() === question.correctAnswer.toString().toLowerCase();
      break;
    case QuestionType.SHORT_ANSWER:
      // Simple keyword match (case-insensitive)
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
        announcements: action.payload.announcements || SAMPLE_ANNOUNCEMENTS, // Load announcements
        isLoading: false,
      };
    }
    case ActionType.LOGIN_USER: {
      const user = state.users.find(
        (u) => u.email === action.payload.email // && u.password === action.payload.password // Password check is illustrative
      );
      if (user) {
        return { ...state, currentUser: user, error: null, successMessage: 'Login successful!' };
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

    case ActionType.CREATE_USER: { // Admin creates a user
      const payload = action.payload as CreateUserPayload;
      const emailExists = state.users.some(u => u.email === payload.email);
      if (emailExists) {
        return { ...state, error: `Email ${payload.email} already exists.` };
      }
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: payload.name,
        email: payload.email,
        password: payload.password, // Store password directly for simplicity
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

    case ActionType.UPDATE_USER: { // Admin updates a user
      const payload = action.payload as UpdateUserPayload;
      return {
        ...state,
        users: state.users.map(user =>
          user.id === payload.id ? { ...user, ...payload } : user
        ),
        successMessage: `User ${payload.name || state.users.find(u=>u.id === payload.id)?.name} updated successfully.`,
      };
    }

    case ActionType.DELETE_USER: { // Admin deletes a user
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

    case ActionType.ADD_NOTIFICATION: {
      const newNotification: NotificationMessage = {
        ...action.payload,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        timestamp: Date.now(),
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications].slice(0, 20), // Add to start, limit count
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
    dispatch({ type: ActionType.LOAD_DATA, payload: {} }); // Load initial sample data
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

