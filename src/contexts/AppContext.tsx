

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
  arrayUnion,
  arrayRemove,
  orderBy,
  serverTimestamp, // For Firestore server-side timestamps if needed
  Timestamp, // For client-side timestamp creation consistent with Firestore
  type Firestore
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";


import type { AppState, AppAction, User, Course, Lesson, Assignment, Submission, QuizQuestion, QuizAnswer, NotificationMessage, CreateUserPayload, UpdateUserPayload, DeleteUserPayload, Announcement, CreateCoursePayload, UpdateCoursePayload, DeleteCoursePayload, TakeAttendancePayload, Payment, RecordPaymentPayload, UpdatePaymentPayload, DeletePaymentPayload, CreateLessonPayload, UpdateLessonPayload, DeleteLessonPayload, CreateAssignmentPayload, UpdateAssignmentPayload, DeleteAssignmentPayload, LoginUserPayload, RegisterStudentPayload, SubmitAssignmentPayload, GradeSubmissionPayload, BulkCreateStudentData, BulkCreateStudentsResult, BulkCreateStudentsResultItem, Enrollment, EnrollStudentPayload, EnrollStudentSuccessPayload, UnenrollStudentPayload, UnenrollStudentSuccessPayload, AdminUpdateOrCreateSubmissionPayload, CreateAnnouncementPayload, DirectMessage, CreateDirectMessagePayload, MarkDirectMessageReadPayload, CourseDaySchedule, UpdateCourseDaySchedulePayload, ClearCourseDaySchedulePayload, SaveAttendanceSuccessPayload, AttendanceRecord } from '@/types';
import { ActionType, UserRole, AssignmentType, QuestionType, AttendanceStatus, PaymentStatus } from '@/types';
import {
  INITIAL_ENROLLMENTS,
  SAMPLE_ATTENDANCE,
  SAMPLE_NOTIFICATIONS,
  APP_NAME
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const initialState: AppState = {
  currentUser: undefined, // undefined initially, then User object or null
  users: [],
  courses: [],
  lessons: [],
  assignments: [],
  submissions: [],
  enrollments: [],
  attendanceRecords: [],
  courseSchedules: [],
  payments: [],
  notifications: [],
  announcements: [],
  directMessages: [],
  isLoading: true, // Start true until auth resolves
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
        // enrollments: action.payload.enrollments !== undefined ? action.payload.enrollments : state.enrollments, // Managed by FETCH_ENROLLMENTS
        attendanceRecords: action.payload.attendanceRecords !== undefined ? action.payload.attendanceRecords : state.attendanceRecords,
        notifications: action.payload.notifications !== undefined ? action.payload.notifications : state.notifications,
        // Other data (courses, lessons, assignments, etc.) are fetched dynamically
      };
    }

    case ActionType.FETCH_USERS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_USERS_SUCCESS:
      return { ...state, users: action.payload, isLoading: false, error: null };
    case ActionType.FETCH_USERS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_COURSES_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_COURSES_SUCCESS:
      return { ...state, courses: action.payload, isLoading: false, error: null };
    case ActionType.FETCH_COURSES_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_ENROLLMENTS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_ENROLLMENTS_SUCCESS:
      return { ...state, enrollments: action.payload, isLoading: false, error: null };
    case ActionType.FETCH_ENROLLMENTS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_LESSONS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_LESSONS_SUCCESS:
      return { ...state, lessons: action.payload, isLoading: false, error: null };
    case ActionType.FETCH_LESSONS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_ASSIGNMENTS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_ASSIGNMENTS_SUCCESS:
      return { ...state, assignments: action.payload, isLoading: false, error: null };
    case ActionType.FETCH_ASSIGNMENTS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_SUBMISSIONS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_SUBMISSIONS_SUCCESS: {
      const assignmentsForGrading = state.assignments; 
      const processedSubmissions = (action.payload || []).map(submission => {
        if (submission.assignmentId) {
          const assignment = assignmentsForGrading.find(a => a.id === submission.assignmentId);
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
      return { ...state, submissions: processedSubmissions, isLoading: false, error: null };
    }
    case ActionType.FETCH_SUBMISSIONS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_ATTENDANCE_RECORDS_REQUEST:
        return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_ATTENDANCE_RECORDS_SUCCESS:
        return { ...state, attendanceRecords: action.payload, isLoading: false, error: null };
    case ActionType.FETCH_ATTENDANCE_RECORDS_FAILURE:
        return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_COURSE_SCHEDULE_REQUEST: // For single course
        return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_COURSE_SCHEDULE_SUCCESS: // For single course
        { // Merge with existing schedules, ensure no duplicates for the same courseId and date
            const newSchedulesForCourse = action.payload;
            const otherSchedules = state.courseSchedules.filter(cs => cs.courseId !== newSchedulesForCourse[0]?.courseId);
            return { ...state, courseSchedules: [...otherSchedules, ...newSchedulesForCourse], isLoading: false, error: null };
        }
    case ActionType.FETCH_COURSE_SCHEDULE_FAILURE: // For single course
        return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_ALL_COURSE_SCHEDULES_REQUEST:
        return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_ALL_COURSE_SCHEDULES_SUCCESS:
        return { ...state, courseSchedules: action.payload, isLoading: false, error: null };
    case ActionType.FETCH_ALL_COURSE_SCHEDULES_FAILURE:
        return { ...state, isLoading: false, error: action.payload };
    
    case ActionType.UPDATE_COURSE_DAY_SCHEDULE_REQUEST:
        return { ...state, isLoading: true, error: null, successMessage: null };
    case ActionType.UPDATE_COURSE_DAY_SCHEDULE_SUCCESS:
        {
            const updatedSchedule = action.payload;
            const existingIndex = state.courseSchedules.findIndex(cs => cs.courseId === updatedSchedule.courseId && cs.id === updatedSchedule.id);
            let newSchedules;
            if (existingIndex > -1) {
                newSchedules = state.courseSchedules.map(cs => cs.id === updatedSchedule.id && cs.courseId === updatedSchedule.courseId ? updatedSchedule : cs);
            } else {
                newSchedules = [...state.courseSchedules, updatedSchedule];
            }
            return {
                ...state,
                courseSchedules: newSchedules,
                isLoading: false,
                successMessage: `Day status for ${updatedSchedule.id} updated to ${updatedSchedule.status}.`
            };
        }
    case ActionType.UPDATE_COURSE_DAY_SCHEDULE_FAILURE:
        return { ...state, isLoading: false, error: action.payload };

    case ActionType.CLEAR_COURSE_DAY_SCHEDULE_REQUEST:
        return { ...state, isLoading: true, error: null, successMessage: null };
    case ActionType.CLEAR_COURSE_DAY_SCHEDULE_SUCCESS:
        {
            const { courseId, date } = action.payload;
            return {
                ...state,
                courseSchedules: state.courseSchedules.filter(cs => !(cs.courseId === courseId && cs.id === date)),
                isLoading: false,
                successMessage: `Day status for ${date} cleared.`
            };
        }
    case ActionType.CLEAR_COURSE_DAY_SCHEDULE_FAILURE:
        return { ...state, isLoading: false, error: action.payload };


    case ActionType.FETCH_PAYMENTS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_PAYMENTS_SUCCESS:
      return { ...state, payments: action.payload, isLoading: false, error: null };
    case ActionType.FETCH_PAYMENTS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_ANNOUNCEMENTS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_ANNOUNCEMENTS_SUCCESS:
      return { ...state, announcements: action.payload.sort((a,b) => b.timestamp - a.timestamp), isLoading: false, error: null };
    case ActionType.FETCH_ANNOUNCEMENTS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.CREATE_ANNOUNCEMENT_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.CREATE_ANNOUNCEMENT_SUCCESS:
      return {
        ...state,
        announcements: [action.payload, ...state.announcements].sort((a,b) => b.timestamp - a.timestamp),
        isLoading: false,
        error: null,
        successMessage: 'Announcement created successfully.'
      };
    case ActionType.CREATE_ANNOUNCEMENT_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.FETCH_DIRECT_MESSAGES_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.FETCH_DIRECT_MESSAGES_SUCCESS:
      return { ...state, directMessages: action.payload.sort((a,b) => a.timestamp - b.timestamp), isLoading: false, error: null };
    case ActionType.FETCH_DIRECT_MESSAGES_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.SEND_DIRECT_MESSAGE_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ActionType.SEND_DIRECT_MESSAGE_SUCCESS:
      return {
        ...state,
        directMessages: [...state.directMessages, action.payload].sort((a,b) => a.timestamp - b.timestamp),
        isLoading: false,
        error: null,
        successMessage: 'Message sent.'
      };
    case ActionType.SEND_DIRECT_MESSAGE_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ActionType.MARK_DIRECT_MESSAGE_READ_REQUEST:
        return { ...state, isLoading: true, error: null };
    case ActionType.MARK_DIRECT_MESSAGE_READ_SUCCESS:
        return {
            ...state,
            directMessages: state.directMessages.map(dm =>
                dm.id === action.payload.messageId ? { ...dm, read: true } : dm
            ),
            isLoading: false,
            error: null,
        };
    case ActionType.MARK_DIRECT_MESSAGE_READ_FAILURE:
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
    case ActionType.ENROLL_STUDENT_REQUEST:
    case ActionType.UNENROLL_STUDENT_REQUEST:
    case ActionType.CREATE_LESSON_REQUEST:
    case ActionType.UPDATE_LESSON_REQUEST:
    case ActionType.DELETE_LESSON_REQUEST:
    case ActionType.CREATE_ASSIGNMENT_REQUEST:
    case ActionType.UPDATE_ASSIGNMENT_REQUEST:
    case ActionType.DELETE_ASSIGNMENT_REQUEST:
    case ActionType.SUBMIT_ASSIGNMENT_REQUEST:
    case ActionType.GRADE_SUBMISSION_REQUEST:
    case ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_REQUEST:
    case ActionType.RECORD_PAYMENT_REQUEST:
    case ActionType.UPDATE_PAYMENT_REQUEST:
    case ActionType.DELETE_PAYMENT_REQUEST:
    case ActionType.SAVE_ATTENDANCE_REQUEST:
      return { ...state, isLoading: true, error: null, successMessage: null };

    case ActionType.LOGIN_USER_SUCCESS:
    case ActionType.REGISTER_STUDENT_SUCCESS:
    case ActionType.FETCH_USER_PROFILE_SUCCESS: // Used by auth flow, should not change isLoading directly
      return {
        ...state,
        currentUser: action.payload,
        error: null,
        successMessage: action.type === ActionType.LOGIN_USER_SUCCESS ? 'Login successful!' : (action.type === ActionType.REGISTER_STUDENT_SUCCESS ? 'Registration successful!' : null )
        // isLoading is managed by the overall auth flow in onAuthStateChanged
      };

    case ActionType.SET_CURRENT_USER:
      return { 
        ...state, 
        currentUser: action.payload, 
        // Do NOT change isLoading here. It's managed by the calling auth flow.
        error: null 
      };

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
    case ActionType.ENROLL_STUDENT_FAILURE:
    case ActionType.UNENROLL_STUDENT_FAILURE:
    case ActionType.CREATE_LESSON_FAILURE:
    case ActionType.UPDATE_LESSON_FAILURE:
    case ActionType.DELETE_LESSON_FAILURE:
    case ActionType.CREATE_ASSIGNMENT_FAILURE:
    case ActionType.UPDATE_ASSIGNMENT_FAILURE:
    case ActionType.DELETE_ASSIGNMENT_FAILURE:
    case ActionType.SUBMIT_ASSIGNMENT_FAILURE:
    case ActionType.GRADE_SUBMISSION_FAILURE:
    case ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_FAILURE:
    case ActionType.RECORD_PAYMENT_FAILURE:
    case ActionType.UPDATE_PAYMENT_FAILURE:
    case ActionType.DELETE_PAYMENT_FAILURE:
    case ActionType.SAVE_ATTENDANCE_FAILURE:
      return { ...state, isLoading: false, error: action.payload, currentUser: state.currentUser === undefined ? null : state.currentUser  };

    case ActionType.LOGOUT_USER_SUCCESS:
      return {
        ...initialState, // Resets all fields to their initial values including enrollments
        currentUser: null, // Explicitly set currentUser to null
        isLoading: false, // Auth flow is complete
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
        currentUser: state.currentUser?.id === payload.id ? { ...state.currentUser, ...payload } as User : state.currentUser,
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
      const courseExists = state.courses.some(c => c.id === courseToAdd.id);
      return {
        ...state,
        courses: courseExists ? state.courses.map(c => c.id === courseToAdd.id ? courseToAdd : c) : [...state.courses, courseToAdd],
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

    case ActionType.ENROLL_STUDENT_SUCCESS: {
      const { course, enrollment } = action.payload;
      const student = state.users.find(u => u.id === enrollment.studentId);
      const courseName = course.name;
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? course : c),
        enrollments: [...state.enrollments.filter(e => e.id !== enrollment.id), enrollment],
        isLoading: false,
        error: null,
        successMessage: `Student ${student?.name || enrollment.studentId} enrolled in ${courseName}.`,
        notifications: [
          {
            id: `notif-enroll-${enrollment.id}`,
            userId: enrollment.studentId,
            type: 'enrollment_update',
            message: `You have been enrolled in the course: ${courseName}.`,
            link: `/student/courses/${course.id}`,
            read: false,
            timestamp: Date.now(),
          },
          ...state.notifications,
        ].slice(0, 20),
      };
    }

    case ActionType.UNENROLL_STUDENT_SUCCESS: {
      const { course, studentId, enrollmentId } = action.payload;
      const student = state.users.find(u => u.id === studentId);
      const courseName = course.name;
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? course : c),
        enrollments: state.enrollments.filter(e => e.id !== enrollmentId),
        isLoading: false,
        error: null,
        successMessage: `Student ${student?.name || studentId} unenrolled from ${courseName}.`,
         notifications: [
          {
            id: `notif-unenroll-${enrollmentId}`,
            userId: studentId,
            type: 'enrollment_update',
            message: `You have been unenrolled from the course: ${courseName}.`,
            read: false,
            timestamp: Date.now(),
          },
          ...state.notifications,
        ].slice(0, 20),
      };
    }

    case ActionType.CREATE_LESSON_SUCCESS: {
      const newLesson = action.payload as Lesson;
      const lessonExists = state.lessons.some(l => l.id === newLesson.id);
      return {
        ...state,
        lessons: lessonExists
          ? state.lessons.map(l => l.id === newLesson.id ? newLesson : l).sort((a, b) => a.order - b.order)
          : [...state.lessons, newLesson].sort((a, b) => a.order - b.order),
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

    case ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_SUCCESS: {
      const updatedSubmission = action.payload;
      const existingSubmissionIndex = state.submissions.findIndex(s => s.id === updatedSubmission.id);
      let newSubmissions;
      if (existingSubmissionIndex > -1) {
        newSubmissions = state.submissions.map(s => s.id === updatedSubmission.id ? updatedSubmission : s);
      } else {
        newSubmissions = [...state.submissions, updatedSubmission];
      }

      const assignment = state.assignments.find(a => a.id === updatedSubmission.assignmentId);
      const studentName = state.users.find(u => u.id === updatedSubmission.studentId)?.name || "Student";

      return {
        ...state,
        submissions: newSubmissions,
        isLoading: false,
        error: null,
        successMessage: `Submission for ${studentName} on assignment "${assignment?.title || 'Unknown'}" updated.`,
        notifications: [
          {
            id: `notif-admin-grade-${updatedSubmission.id}`,
            userId: updatedSubmission.studentId,
            type: 'grade_update',
            message: `Your submission for '${assignment?.title}' has been updated by an administrator. Grade: ${updatedSubmission.grade}`,
            link: `/student/courses/${assignment?.courseId}?assignment=${assignment?.id}`,
            read: false,
            timestamp: Date.now(),
          },
          ...state.notifications,
        ].slice(0, 20),
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

    case ActionType.SAVE_ATTENDANCE_SUCCESS:
      // Merge new/updated records into existing state, avoiding duplicates
      const updatedRecords = action.payload as AttendanceRecord[];
      const existingRecordIds = new Set(updatedRecords.map(ur => ur.id));
      const mergedAttendanceRecords = [
        ...state.attendanceRecords.filter(ar => !existingRecordIds.has(ar.id)), // Keep old records not in payload
        ...updatedRecords // Add all new/updated records from payload
      ];
      return {
        ...state,
        attendanceRecords: mergedAttendanceRecords,
        isLoading: false,
        error: null,
        successMessage: 'Attendance saved successfully.',
      };


    case ActionType.RECORD_PAYMENT_SUCCESS: {
      const newPayment = action.payload;
      const student = state.users.find(u => u.id === newPayment.studentId);
      const course = state.courses.find(c => c.id === newPayment.courseId);
      return {
        ...state,
        payments: [...state.payments, newPayment],
        isLoading: false, error: null,
        successMessage: `Payment of $${newPayment.amount} for student ${student?.name || newPayment.studentId} for course "${course?.name || newPayment.courseId}" recorded.`,
      };
    }

    case ActionType.UPDATE_PAYMENT_SUCCESS: {
      const updatedPayment = action.payload;
      return {
        ...state,
        payments: state.payments.map(p =>
          p.id === updatedPayment.id ? { ...p, ...updatedPayment } : p
        ),
        isLoading: false, error: null,
        successMessage: `Payment ${updatedPayment.id} updated. Status: ${updatedPayment.status}, Amount: ${updatedPayment.amount}.`,
      };
    }
    case ActionType.DELETE_PAYMENT_SUCCESS: {
      const { id } = action.payload;
      const paymentToDelete = state.payments.find(p => p.id === id);
      const student = state.users.find(u => u.id === paymentToDelete?.studentId);
      const course = state.courses.find(c => c.id === paymentToDelete?.courseId);
      return {
        ...state,
        payments: state.payments.filter(p => p.id !== id),
        isLoading: false, error: null,
        successMessage: `Payment record for ${student?.name} in ${course?.name} deleted.`,
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

type AppContextType = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  handleLoginUser: (payload: LoginUserPayload) => Promise<void>;
  handleRegisterStudent: (payload: RegisterStudentPayload) => Promise<void>;
  handleLogoutUser: () => Promise<void>;
  handleUpdateUserProfile: (payload: UpdateUserPayload) => Promise<void>; // For users updating their own profile
  handleLessonFileUpload: (courseId: string, lessonId: string, file: File) => Promise<{ fileUrl: string, fileName: string }>;
  handleAssignmentAttachmentUpload: (courseId: string, assignmentId: string, file: File) => Promise<{ assignmentFileUrl: string, assignmentFileName: string }>;
  handleStudentSubmissionUpload: (courseId: string, assignmentId: string, studentId: string, file: File) => Promise<{ fileUrl: string, fileName: string }>;
  handleBulkCreateStudents: (studentsToCreate: BulkCreateStudentData[]) => Promise<void>;
  handleAdminCreateUser: (payload: CreateUserPayload) => Promise<void>;
  handleAdminUpdateUser: (payload: UpdateUserPayload) => Promise<void>; // For admins updating any user
  handleAdminDeleteUser: (payload: DeleteUserPayload) => Promise<void>;
  handleCreateCourse: (payload: CreateCoursePayload) => Promise<void>;
  handleUpdateCourse: (payload: UpdateCoursePayload) => Promise<void>;
  handleDeleteCourse: (payload: DeleteCoursePayload) => Promise<void>;
  handleEnrollStudent: (payload: EnrollStudentPayload) => Promise<void>;
  handleUnenrollStudent: (payload: UnenrollStudentPayload) => Promise<void>;
  handleCreateLesson: (payload: CreateLessonPayload & { file?: File | null }) => Promise<void>;
  handleUpdateLesson: (payload: UpdateLessonPayload & { file?: File | null }) => Promise<void>;
  handleDeleteLesson: (payload: DeleteLessonPayload) => Promise<void>;
  handleCreateAssignment: (payload: CreateAssignmentPayload & { assignmentFile?: File | null }) => Promise<void>;
  handleUpdateAssignment: (payload: UpdateAssignmentPayload & { assignmentFile?: File | null }) => Promise<void>;
  handleDeleteAssignment: (payload: DeleteAssignmentPayload) => Promise<void>;
  handleStudentSubmitAssignment: (payload: SubmitAssignmentPayload) => Promise<void>;
  handleTeacherGradeSubmission: (payload: GradeSubmissionPayload) => Promise<void>;
  handleAdminUpdateOrCreateSubmission: (payload: AdminUpdateOrCreateSubmissionPayload) => Promise<void>;
  handleRecordPayment: (payload: RecordPaymentPayload) => Promise<void>;
  handleUpdatePayment: (payload: UpdatePaymentPayload) => Promise<void>;
  handleDeletePayment: (payload: DeletePaymentPayload) => Promise<void>;
  handleCreateAnnouncement: (payload: CreateAnnouncementPayload) => Promise<void>;
  handleSendDirectMessage: (payload: CreateDirectMessagePayload) => Promise<void>;
  handleMarkMessageRead: (payload: MarkDirectMessageReadPayload) => Promise<void>;
  fetchCourseSchedule: (courseId: string) => Promise<void>; // For fetching single course schedule
  fetchAllCourseSchedules: (allCourses: Course[]) => Promise<void>; // For fetching all
  handleUpdateCourseDaySchedule: (payload: UpdateCourseDaySchedulePayload) => Promise<void>;
  handleClearCourseDaySchedule: (payload: ClearCourseDaySchedulePayload) => Promise<void>;
  handleSaveAttendanceRecords: (payload: TakeAttendancePayload) => Promise<void>;
  fetchAllAttendanceRecords: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    dispatch({ type: ActionType.LOAD_DATA, payload: {
      notifications: SAMPLE_NOTIFICATIONS,
    } });
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

  const fetchAllCourses = useCallback(async (): Promise<Course[]> => {
    dispatch({ type: ActionType.FETCH_COURSES_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_COURSES_FAILURE, payload: "Firestore not available to fetch courses." });
      return [];
    }
    try {
      const coursesCol = collection(db, "courses");
      const courseSnapshot = await getDocs(coursesCol);
      const coursesList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      dispatch({ type: ActionType.FETCH_COURSES_SUCCESS, payload: coursesList });
      return coursesList; // Return for chaining
    } catch (error: any) {
      console.error("Error fetching all courses:", error);
      dispatch({ type: ActionType.FETCH_COURSES_FAILURE, payload: error.message || "Failed to fetch all courses." });
      return [];
    }
  }, [dispatch]);

  const fetchEnrollmentsForUser = useCallback(async (userId: string) => {
    dispatch({ type: ActionType.FETCH_ENROLLMENTS_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_ENROLLMENTS_FAILURE, payload: "Firestore not available to fetch enrollments." });
      return;
    }
    try {
      const enrollmentsCol = collection(db, "enrollments");
      const q = query(enrollmentsCol, where("studentId", "==", userId));
      const enrollmentSnapshot = await getDocs(q);
      const enrollmentsList = enrollmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
      dispatch({ type: ActionType.FETCH_ENROLLMENTS_SUCCESS, payload: enrollmentsList });
    } catch (error: any) {
      console.error("Error fetching enrollments for user:", error);
      dispatch({ type: ActionType.FETCH_ENROLLMENTS_FAILURE, payload: error.message || "Failed to fetch enrollments." });
    }
  }, [dispatch]);


  const fetchAllLessons = useCallback(async (coursesForFetch: Course[]) => {
    if (coursesForFetch.length === 0) {
        dispatch({ type: ActionType.FETCH_LESSONS_SUCCESS, payload: [] });
        return;
    }
    dispatch({ type: ActionType.FETCH_LESSONS_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_LESSONS_FAILURE, payload: "Firestore not available to fetch lessons." });
      return;
    }
    try {
      const allLessons: Lesson[] = [];
      await Promise.all(coursesForFetch.map(async (course) => {
        const lessonsColRef = collection(db, "courses", course.id, "lessons");
        const lessonSnapshot = await getDocs(lessonsColRef);
        lessonSnapshot.forEach(doc => {
          allLessons.push({ id: doc.id, courseId: course.id, ...doc.data() } as Lesson);
        });
      }));
      dispatch({ type: ActionType.FETCH_LESSONS_SUCCESS, payload: allLessons.sort((a,b) => a.order - b.order) });
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      dispatch({ type: ActionType.FETCH_LESSONS_FAILURE, payload: error.message || "Failed to fetch lessons." });
    }
  }, [dispatch]);

  const fetchAllAssignments = useCallback(async (coursesForFetch: Course[]) => {
    if (coursesForFetch.length === 0) {
        dispatch({ type: ActionType.FETCH_ASSIGNMENTS_SUCCESS, payload: [] });
        return;
    }
    dispatch({ type: ActionType.FETCH_ASSIGNMENTS_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
        dispatch({ type: ActionType.FETCH_ASSIGNMENTS_FAILURE, payload: "Firestore not available." });
        return;
    }
    try {
        const allAssignments: Assignment[] = [];
        for (const course of coursesForFetch) {
            const assignmentsColRef = collection(db, "courses", course.id, "assignments");
            const assignmentSnapshot = await getDocs(assignmentsColRef);
            assignmentSnapshot.forEach(doc => {
                allAssignments.push({ id: doc.id, courseId: course.id, ...doc.data() } as Assignment);
            });
        }
        dispatch({ type: ActionType.FETCH_ASSIGNMENTS_SUCCESS, payload: allAssignments });
    } catch (error: any) {
        console.error("Error fetching assignments:", error);
        dispatch({ type: ActionType.FETCH_ASSIGNMENTS_FAILURE, payload: error.message || "Failed to fetch assignments." });
    }
  }, [dispatch]);

  const fetchAllSubmissions = useCallback(async (currentUserForFetch: User | null | undefined, assignmentsForFetch: Assignment[]) => {
    if (!currentUserForFetch || assignmentsForFetch.length === 0) {
        dispatch({ type: ActionType.FETCH_SUBMISSIONS_SUCCESS, payload: [] });
        return;
    }
    dispatch({ type: ActionType.FETCH_SUBMISSIONS_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
        dispatch({ type: ActionType.FETCH_SUBMISSIONS_FAILURE, payload: "Firestore not available." });
        return;
    }
    try {
        const allSubmissions: Submission[] = [];
        for (const assignment of assignmentsForFetch) {
            if (!assignment.courseId) continue;
            const submissionsColRef = collection(db, "courses", assignment.courseId, "assignments", assignment.id, "submissions");

            let q = query(submissionsColRef);
            if (currentUserForFetch.role === UserRole.STUDENT) {
               q = query(submissionsColRef, where("studentId", "==", currentUserForFetch.id));
            }

            const submissionSnapshot = await getDocs(q);
            submissionSnapshot.forEach(doc => {
                allSubmissions.push({ id: doc.id, ...doc.data() } as Submission);
            });
        }
        dispatch({ type: ActionType.FETCH_SUBMISSIONS_SUCCESS, payload: allSubmissions });
    } catch (error: any) {
        console.error("Error fetching submissions:", error);
        dispatch({ type: ActionType.FETCH_SUBMISSIONS_FAILURE, payload: error.message || "Failed to fetch submissions." });
    }
  }, [dispatch]);

  const fetchAllAttendanceRecords = useCallback(async () => {
    dispatch({ type: ActionType.FETCH_ATTENDANCE_RECORDS_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_ATTENDANCE_RECORDS_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const attendanceCol = collection(db, "attendanceRecords");
      const attendanceSnapshot = await getDocs(attendanceCol);
      const attendanceList = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
      dispatch({ type: ActionType.FETCH_ATTENDANCE_RECORDS_SUCCESS, payload: attendanceList });
    } catch (error: any) {
      console.error("Error fetching attendance records:", error);
      dispatch({ type: ActionType.FETCH_ATTENDANCE_RECORDS_FAILURE, payload: error.message || "Failed to fetch attendance records." });
    }
  }, [dispatch]);


  const fetchCourseSchedule = useCallback(async (courseId: string) => {
    dispatch({ type: ActionType.FETCH_COURSE_SCHEDULE_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_COURSE_SCHEDULE_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const scheduleCol = collection(db, "courses", courseId, "schedule");
      const scheduleSnapshot = await getDocs(scheduleCol);
      const schedulesList = scheduleSnapshot.docs.map(doc => ({ id: doc.id, courseId, ...doc.data() } as CourseDaySchedule));
      dispatch({ type: ActionType.FETCH_COURSE_SCHEDULE_SUCCESS, payload: schedulesList }); // This will merge
    } catch (error: any) {
      console.error("Error fetching course schedule for course " + courseId + ":", error);
      dispatch({ type: ActionType.FETCH_COURSE_SCHEDULE_FAILURE, payload: error.message || "Failed to fetch course schedule." });
    }
  }, [dispatch]);
  
  const fetchAllCourseSchedules = useCallback(async (allCourses: Course[]) => {
    if (!allCourses || allCourses.length === 0) {
      dispatch({ type: ActionType.FETCH_ALL_COURSE_SCHEDULES_SUCCESS, payload: [] });
      return;
    }
    dispatch({ type: ActionType.FETCH_ALL_COURSE_SCHEDULES_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_ALL_COURSE_SCHEDULES_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const combinedSchedules: CourseDaySchedule[] = [];
      for (const course of allCourses) {
        const scheduleCol = collection(db, "courses", course.id, "schedule");
        const scheduleSnapshot = await getDocs(scheduleCol);
        scheduleSnapshot.forEach(doc => {
          combinedSchedules.push({ id: doc.id, courseId: course.id, ...doc.data() } as CourseDaySchedule);
        });
      }
      dispatch({ type: ActionType.FETCH_ALL_COURSE_SCHEDULES_SUCCESS, payload: combinedSchedules });
    } catch (error: any) {
      console.error("Error fetching all course schedules:", error);
      dispatch({ type: ActionType.FETCH_ALL_COURSE_SCHEDULES_FAILURE, payload: error.message || "Failed to fetch all course schedules." });
    }
  }, [dispatch]);

  const handleUpdateCourseDaySchedule = useCallback(async (payload: UpdateCourseDaySchedulePayload) => {
    dispatch({ type: ActionType.UPDATE_COURSE_DAY_SCHEDULE_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.UPDATE_COURSE_DAY_SCHEDULE_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const scheduleDocRef = doc(db, "courses", payload.courseId, "schedule", payload.date);
      const scheduleData: Omit<CourseDaySchedule, 'id' | 'courseId'> = {
        status: payload.status,
        notes: payload.notes || "",
      };
      await setDoc(scheduleDocRef, scheduleData); // Use setDoc to create or overwrite
      dispatch({ type: ActionType.UPDATE_COURSE_DAY_SCHEDULE_SUCCESS, payload: { ...scheduleData, id: payload.date, courseId: payload.courseId } });
    } catch (error: any) {
      dispatch({ type: ActionType.UPDATE_COURSE_DAY_SCHEDULE_FAILURE, payload: error.message || "Failed to update day schedule." });
    }
  }, [dispatch]);

  const handleClearCourseDaySchedule = useCallback(async (payload: ClearCourseDaySchedulePayload) => {
    dispatch({ type: ActionType.CLEAR_COURSE_DAY_SCHEDULE_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.CLEAR_COURSE_DAY_SCHEDULE_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const scheduleDocRef = doc(db, "courses", payload.courseId, "schedule", payload.date);
      await deleteDoc(scheduleDocRef);
      dispatch({ type: ActionType.CLEAR_COURSE_DAY_SCHEDULE_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.CLEAR_COURSE_DAY_SCHEDULE_FAILURE, payload: error.message || "Failed to clear day schedule." });
    }
  }, [dispatch]);


  const fetchAllPayments = useCallback(async (currentUserForFetch: User | null | undefined) => {
    if (!currentUserForFetch) {
      dispatch({ type: ActionType.FETCH_PAYMENTS_SUCCESS, payload: [] }); 
      return;
    }
    dispatch({ type: ActionType.FETCH_PAYMENTS_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_PAYMENTS_FAILURE, payload: "Firestore not available to fetch payments." });
      return;
    }

    try {
      let paymentsQuery;
      const paymentsCol = collection(db, "payments");

      if (currentUserForFetch.role === UserRole.SUPER_ADMIN) {
        paymentsQuery = query(paymentsCol);
      } else if (currentUserForFetch.role === UserRole.STUDENT) {
        paymentsQuery = query(paymentsCol, where("studentId", "==", currentUserForFetch.id));
      } else {
        dispatch({ type: ActionType.FETCH_PAYMENTS_SUCCESS, payload: [] });
        return;
      }

      const paymentSnapshot = await getDocs(paymentsQuery);
      const paymentsList = paymentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
      dispatch({ type: ActionType.FETCH_PAYMENTS_SUCCESS, payload: paymentsList });
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      dispatch({ type: ActionType.FETCH_PAYMENTS_FAILURE, payload: error.message || "Failed to fetch payments." });
    }
  }, [dispatch]);

  const fetchAllAnnouncements = useCallback(async () => {
    dispatch({ type: ActionType.FETCH_ANNOUNCEMENTS_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_ANNOUNCEMENTS_FAILURE, payload: "Firestore not available to fetch announcements." });
      return;
    }
    try {
      const announcementsCol = collection(db, "announcements");
      const q = query(announcementsCol, orderBy("timestamp", "desc"));
      const announcementSnapshot = await getDocs(q);
      const announcementsList = announcementSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      dispatch({ type: ActionType.FETCH_ANNOUNCEMENTS_SUCCESS, payload: announcementsList });
    } catch (error: any) {
      console.error("Error fetching announcements:", error);
      dispatch({ type: ActionType.FETCH_ANNOUNCEMENTS_FAILURE, payload: error.message || "Failed to fetch announcements." });
    }
  }, [dispatch]);

  const fetchDirectMessagesForUser = useCallback(async (userId: string) => {
    dispatch({ type: ActionType.FETCH_DIRECT_MESSAGES_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.FETCH_DIRECT_MESSAGES_FAILURE, payload: "Firestore not available to fetch messages." });
      return;
    }
    try {
      const messagesSentQuery = query(collection(db, "directMessages"), where("senderId", "==", userId));
      const messagesReceivedQuery = query(collection(db, "directMessages"), where("recipientId", "==", userId));

      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(messagesSentQuery),
        getDocs(messagesReceivedQuery)
      ]);

      const messagesList: DirectMessage[] = [];
      const messageIds = new Set<string>();

      sentSnapshot.forEach(doc => {
        if (!messageIds.has(doc.id)) {
          messagesList.push({ id: doc.id, ...doc.data() } as DirectMessage);
          messageIds.add(doc.id);
        }
      });
      receivedSnapshot.forEach(doc => {
         if (!messageIds.has(doc.id)) {
          messagesList.push({ id: doc.id, ...doc.data() } as DirectMessage);
          messageIds.add(doc.id);
        }
      });

      dispatch({ type: ActionType.FETCH_DIRECT_MESSAGES_SUCCESS, payload: messagesList.sort((a,b) => a.timestamp - b.timestamp) });
    } catch (error: any) {
      console.error("Error fetching direct messages:", error);
      dispatch({ type: ActionType.FETCH_DIRECT_MESSAGES_FAILURE, payload: error.message || "Failed to fetch direct messages." });
    }
  }, [dispatch]);


  useEffect(() => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      console.error("Firebase Auth instance not available.");
      dispatch({ type: ActionType.SET_ERROR, payload: "Firebase initialization failed." });
      dispatch({ type: ActionType.SET_LOADING, payload: false }); 
      return;
    }

    const dbInstance = getFirebaseDb();
    if (!dbInstance) {
        console.error("Firebase Firestore instance not available.");
         dispatch({ type: ActionType.SET_ERROR, payload: "Firebase Firestore not initialized." });
         dispatch({ type: ActionType.SET_LOADING, payload: false }); 
         return;
    }
    dispatch({ type: ActionType.SET_LOADING, payload: true });
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(dbInstance, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userProfile = { id: userDocSnap.id, ...userDocSnap.data() } as User;
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: userProfile });

            await fetchAllUsers(); 
            const fetchedCourses = await fetchAllCourses(); // Wait for courses to be fetched
            if (fetchedCourses && fetchedCourses.length > 0) {
                await fetchAllCourseSchedules(fetchedCourses); // Then fetch schedules
            } else {
                dispatch({ type: ActionType.FETCH_ALL_COURSE_SCHEDULES_SUCCESS, payload: [] }); // Ensure schedules are cleared if no courses
            }
            await fetchEnrollmentsForUser(userProfile.id); 
            await fetchAllPayments(userProfile); 
            await fetchAllAnnouncements();
            await fetchDirectMessagesForUser(userProfile.id);
            await fetchAllAttendanceRecords(); 
          } else {
            await signOut(authInstance); 
            dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
            dispatch({ type: ActionType.SET_ERROR, payload: "User profile not found. Signed out." });
          }
        } catch (error: any) {
          console.error("Error during auth state change processing:", error);
          dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
          dispatch({ type: ActionType.SET_ERROR, payload: error.message || "Failed to load user profile." });
        } finally {
            dispatch({ type: ActionType.SET_LOADING, payload: false }); 
        }
      } else { 
        dispatch({ type: ActionType.SET_CURRENT_USER, payload: null });
        dispatch({ type: ActionType.FETCH_USERS_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_COURSES_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_ENROLLMENTS_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_LESSONS_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_ASSIGNMENTS_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_SUBMISSIONS_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_PAYMENTS_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_ANNOUNCEMENTS_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_DIRECT_MESSAGES_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_ATTENDANCE_RECORDS_SUCCESS, payload: [] });
        dispatch({ type: ActionType.FETCH_ALL_COURSE_SCHEDULES_SUCCESS, payload: []});
        dispatch({ type: ActionType.SET_LOADING, payload: false });
      }
    });
    return () => unsubscribe();
  }, [dispatch, fetchAllUsers, fetchAllCourses, fetchAllCourseSchedules, fetchEnrollmentsForUser, fetchAllPayments, fetchAllAnnouncements, fetchDirectMessagesForUser, fetchAllAttendanceRecords]);

  useEffect(() => {
    if (state.currentUser && state.courses.length > 0) {
      fetchAllLessons(state.courses);
    } else if (!state.currentUser) { 
        dispatch({ type: ActionType.FETCH_LESSONS_SUCCESS, payload: [] });
    }
  }, [state.currentUser, state.courses, fetchAllLessons, dispatch]);

  useEffect(() => {
      if (state.currentUser && state.courses.length > 0) {
          fetchAllAssignments(state.courses);
      } else if (!state.currentUser) { 
          dispatch({ type: ActionType.FETCH_ASSIGNMENTS_SUCCESS, payload: [] });
      }
  }, [state.currentUser, state.courses, fetchAllAssignments, dispatch]);

  useEffect(() => {
      if (state.currentUser && state.assignments.length > 0) {
          fetchAllSubmissions(state.currentUser, state.assignments); 
      } else if (!state.currentUser) { 
          dispatch({ type: ActionType.FETCH_SUBMISSIONS_SUCCESS, payload: [] });
      }
  }, [state.currentUser, state.assignments, fetchAllSubmissions, dispatch]);


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
      // onAuthStateChanged will handle success and data loading
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
        avatarUrl: payload.avatarUrl || `https://placehold.co/100x100.png`,
      };
      await setDoc(doc(dbInstance, "users", firebaseUser.uid), newUserForFirestore);
      // onAuthStateChanged will handle setting current user and fetching data.
      // We can dispatch a local update to users array if needed immediately.
      dispatch({ type: ActionType.FETCH_USERS_SUCCESS, payload: [...state.users, newUserForFirestore] });
       dispatch({ type: ActionType.ADD_NOTIFICATION, payload: {
        userId: firebaseUser.uid, type: 'success',
        message: `Welcome to ${APP_NAME}, ${newUserForFirestore.name}! Account created.`
      }});
    } catch (error: any) {
      dispatch({ type: ActionType.REGISTER_STUDENT_FAILURE, payload: error.message || "Failed to register." });
    }
  }, [dispatch, state.users]);

  const handleLogoutUser = useCallback(async () => {
    dispatch({ type: ActionType.LOGOUT_USER_REQUEST });
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      dispatch({ type: ActionType.LOGOUT_USER_FAILURE, payload: "Firebase Auth not initialized." });
      return;
    }
    try {
      await signOut(authInstance);
      dispatch({ type: ActionType.LOGOUT_USER_SUCCESS }); // This will trigger onAuthStateChanged with null user
    } catch (error: any) {
      dispatch({ type: ActionType.LOGOUT_USER_FAILURE, payload: error.message || "Failed to logout." });
    }
  }, [dispatch]);

  const handleUpdateUserProfile = useCallback(async (payload: UpdateUserPayload) => {
    dispatch({ type: ActionType.UPDATE_USER_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.UPDATE_USER_FAILURE, payload: "Firestore not available." });
      return;
    }
    if (state.currentUser?.id !== payload.id) {
      dispatch({ type: ActionType.UPDATE_USER_FAILURE, payload: "User can only update their own profile." });
      return;
    }
    try {
      const userRef = doc(db, "users", payload.id);
      const updateData: Partial<User> = {};
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.avatarUrl !== undefined) updateData.avatarUrl = payload.avatarUrl;
      if (payload.phoneNumber !== undefined) updateData.phoneNumber = payload.phoneNumber;
      if (payload.bio !== undefined) updateData.bio = payload.bio;

      if (Object.keys(updateData).length === 0) {
        dispatch({ type: ActionType.UPDATE_USER_SUCCESS, payload }); // No actual changes to save
        toast({ title: "No Changes", description: "No profile information was changed." });
        return;
      }

      await updateDoc(userRef, updateData);
      dispatch({ type: ActionType.UPDATE_USER_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.UPDATE_USER_FAILURE, payload: error.message || "Failed to update profile."});
    }
  }, [dispatch, state.currentUser, toast]);

  const handleLessonFileUpload = useCallback(async (courseId: string, lessonId: string, file: File) => {
    const storage = getFirebaseStorage();
    if (!storage) {
      console.error("Firebase Storage service not available for lesson file upload.");
      throw new Error("Firebase Storage not available.");
    }
    const filePath = `lessons/${courseId}/${lessonId}/${file.name}`;
    const fileStorageRef = storageRef(storage, filePath);
    await uploadBytes(fileStorageRef, file);
    const fileUrl = await getDownloadURL(fileStorageRef);
    return { fileUrl, fileName: file.name };
  }, []);

  const handleAssignmentAttachmentUpload = useCallback(async (courseId: string, assignmentId: string, file: File) => {
    const storage = getFirebaseStorage();
    if (!storage) {
      console.error("Firebase Storage service not available for assignment attachment upload.");
      throw new Error("Firebase Storage not available.");
    }
    const filePath = `assignment_attachments/${courseId}/${assignmentId}/${file.name}`;
    const fileStorageRef = storageRef(storage, filePath);
    await uploadBytes(fileStorageRef, file);
    const assignmentFileUrl = await getDownloadURL(fileStorageRef);
    return { assignmentFileUrl, assignmentFileName: file.name };
  }, []);

  const handleStudentSubmissionUpload = useCallback(async (courseId: string, assignmentId: string, studentId: string, file: File) => {
    const storage = getFirebaseStorage();
    if (!storage) {
      console.error("Firebase Storage service not available for student submission upload.");
      throw new Error("Firebase Storage not available.");
    }
    const filePath = `submissions/${courseId}/${assignmentId}/${studentId}/${file.name}`;
    const fileStorageRef = storageRef(storage, filePath);
    await uploadBytes(fileStorageRef, file);
    const fileUrl = await getDownloadURL(fileStorageRef);
    return { fileUrl, fileName: file.name };
  }, []);

  const handleBulkCreateStudents = useCallback(async (studentsToCreate: BulkCreateStudentData[]) => {
    dispatch({ type: ActionType.BULK_CREATE_STUDENTS_REQUEST });
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    if (!auth || !db) {
      dispatch({ type: ActionType.BULK_CREATE_STUDENTS_FAILURE, payload: { error: "Firebase services not initialized.", results: [] } });
      return;
    }

    const results: BulkCreateStudentsResult = [];
    const createdUsers: User[] = [];
    const defaultPassword = "123456";

    for (const studentData of studentsToCreate) {
      try {
        const existingUser = state.users.find(u => u.email === studentData.email);
        if (existingUser) {
            results.push({ success: false, email: studentData.email, error: "Email already exists in local state." });
            continue;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, studentData.email, studentData.password || defaultPassword);
        const firebaseUser = userCredential.user;
        const newUserDoc: User = {
          id: firebaseUser.uid,
          name: studentData.name,
          email: firebaseUser.email || studentData.email,
          role: UserRole.STUDENT,
          avatarUrl: `https://placehold.co/100x100.png`,
        };
        await setDoc(doc(db, "users", firebaseUser.uid), newUserDoc);
        results.push({ success: true, email: studentData.email, userId: firebaseUser.uid });
        createdUsers.push(newUserDoc);
         dispatch({ type: ActionType.ADD_NOTIFICATION, payload: {
            userId: firebaseUser.uid, type: 'success',
            message: `Welcome to ${APP_NAME}, ${newUserDoc.name}! Your account was created by an admin.`
        }});
      } catch (error: any) {
        results.push({ success: false, email: studentData.email, error: error.message || "Unknown error during creation." });
      }
    }

    if (createdUsers.length > 0) {
      dispatch({ type: ActionType.BULK_CREATE_STUDENTS_SUCCESS, payload: { users: createdUsers, results } });
    } else if (results.some(r => !r.success && r.error !== "Email already exists in local state.")) {
      dispatch({ type: ActionType.BULK_CREATE_STUDENTS_FAILURE, payload: { error: "Some students could not be created. Check details.", results } });
    } else {
       dispatch({ type: ActionType.BULK_CREATE_STUDENTS_SUCCESS, payload: { users: [], results } });
    }

  }, [dispatch, state.users]);

  const handleAdminCreateUser = useCallback(async (payload: CreateUserPayload) => {
    dispatch({ type: ActionType.CREATE_USER_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.CREATE_USER_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      // Note: This function creates a Firestore user document but DOES NOT create a Firebase Auth user.
      // Login will not be possible for this user unless an Auth account is created separately.
      const userId = doc(collection(db, "users")).id; 
      const newUserDoc: User = {
        id: userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        avatarUrl: payload.avatarUrl || `https://placehold.co/100x100.png`,
        phoneNumber: payload.phoneNumber,
        bio: payload.bio,
        // password field from payload is for admin reference, not stored or used for auth here.
      };
      await setDoc(doc(db, "users", userId), newUserDoc);
      dispatch({ type: ActionType.CREATE_USER_SUCCESS, payload: newUserDoc });
    } catch (error: any) {
      dispatch({ type: ActionType.CREATE_USER_FAILURE, payload: error.message || "Failed to create user document." });
    }
  }, [dispatch]);

  const handleAdminUpdateUser = useCallback(async (payload: UpdateUserPayload) => {
    dispatch({ type: ActionType.UPDATE_USER_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.UPDATE_USER_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const userRef = doc(db, "users", payload.id);
      const updateData: Partial<User> = { ...payload };
      delete updateData.id; // Don't try to update the ID field itself
      await updateDoc(userRef, updateData as any);
      dispatch({ type: ActionType.UPDATE_USER_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.UPDATE_USER_FAILURE, payload: error.message || "Failed to update user."});
    }
  }, [dispatch]);

  const handleAdminDeleteUser = useCallback(async (payload: DeleteUserPayload) => {
    dispatch({ type: ActionType.DELETE_USER_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.DELETE_USER_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      await deleteDoc(doc(db, "users", payload.id));
      dispatch({ type: ActionType.DELETE_USER_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.DELETE_USER_FAILURE, payload: error.message || "Failed to delete user document."});
    }
  }, [dispatch]);

  const handleCreateCourse = useCallback(async (payload: CreateCoursePayload) => {
    dispatch({ type: ActionType.CREATE_COURSE_REQUEST });
    const db = getFirebaseDb();
    const currentUser = state.currentUser; 

    if (!db) {
        console.error("[AppContext] Firestore DB instance is not available for handleCreateCourse.");
        dispatch({ type: ActionType.CREATE_COURSE_FAILURE, payload: "Firestore not available." });
        return;
    }
    if (!currentUser) {
        console.error("[AppContext] Current user is not available for handleCreateCourse.");
        dispatch({ type: ActionType.CREATE_COURSE_FAILURE, payload: "User not authenticated to create course." });
        return;
    }
    console.log("[AppContext] handleCreateCourse: User is authenticated. Proceeding...");

    try {
        const courseId = payload.id || doc(collection(db, "courses")).id;
        const newCourse: Course = {
            id: courseId,
            name: payload.name,
            description: payload.description,
            teacherId: payload.teacherId || currentUser.id,
            studentIds: payload.studentIds || [],
            category: payload.category || '',
            cost: payload.cost || 0,
            prerequisites: payload.prerequisites || [],
            bannerImageUrl: payload.bannerImageUrl,
        };
        console.log("[AppContext] Attempting to save course to Firestore:", newCourse);
        await setDoc(doc(db, "courses", courseId), newCourse);
        console.log("[AppContext] Course saved successfully to Firestore with ID:", courseId);
        dispatch({ type: ActionType.CREATE_COURSE_SUCCESS, payload: newCourse });
    } catch (error: any) {
        let errorMessage = error.message || "Failed to create course.";
        if (error.code === 'permission-denied') {
            errorMessage = "Permission denied. Check Firestore security rules for creating courses.";
        }
        console.error("[AppContext] Firestore Error - Failed to create course:", error.code, error.message, error);
        dispatch({ type: ActionType.CREATE_COURSE_FAILURE, payload: errorMessage });
    }
}, [dispatch, state.currentUser]);


  const handleUpdateCourse = useCallback(async (payload: UpdateCoursePayload) => {
    dispatch({ type: ActionType.UPDATE_COURSE_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.UPDATE_COURSE_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const courseRef = doc(db, "courses", payload.id);
      const updateData: Partial<Course> = { ...payload };
      delete updateData.id;
      await updateDoc(courseRef, updateData as any);
      dispatch({ type: ActionType.UPDATE_COURSE_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.UPDATE_COURSE_FAILURE, payload: error.message || "Failed to update course."});
    }
  }, [dispatch]);

  const handleDeleteCourse = useCallback(async (payload: DeleteCoursePayload) => {
    dispatch({ type: ActionType.DELETE_COURSE_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.DELETE_COURSE_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      await deleteDoc(doc(db, "courses", payload.id));
      dispatch({ type: ActionType.DELETE_COURSE_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.DELETE_COURSE_FAILURE, payload: error.message || "Failed to delete course."});
    }
  }, [dispatch]);

  const handleEnrollStudent = useCallback(async (payload: EnrollStudentPayload) => {
    dispatch({ type: ActionType.ENROLL_STUDENT_REQUEST });
    const { courseId, studentId } = payload;
    const db = getFirebaseDb();

    if (!db) {
      dispatch({ type: ActionType.ENROLL_STUDENT_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const courseRef = doc(db, "courses", courseId);
      const enrollmentId = `enroll-${courseId}-${studentId}`;
      const enrollmentRef = doc(db, "enrollments", enrollmentId);

      const batch = writeBatch(db);
      batch.update(courseRef, { studentIds: arrayUnion(studentId) });
      const newEnrollment: Enrollment = {
        id: enrollmentId,
        courseId,
        studentId,
        enrollmentDate: new Date().toISOString(),
      };
      batch.set(enrollmentRef, newEnrollment);
      await batch.commit();

      const updatedCourseDoc = await getDoc(courseRef);
      const updatedCourse = { id: updatedCourseDoc.id, ...updatedCourseDoc.data() } as Course;

      dispatch({ type: ActionType.ENROLL_STUDENT_SUCCESS, payload: { course: updatedCourse, enrollment: newEnrollment } });

    } catch (error: any) {
      dispatch({ type: ActionType.ENROLL_STUDENT_FAILURE, payload: error.message || "Failed to enroll student." });
    }
  }, [dispatch]);

  const handleUnenrollStudent = useCallback(async (payload: UnenrollStudentPayload) => {
    dispatch({ type: ActionType.UNENROLL_STUDENT_REQUEST });
    const { courseId, studentId } = payload;
    const db = getFirebaseDb();

    if (!db) {
      dispatch({ type: ActionType.UNENROLL_STUDENT_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const courseRef = doc(db, "courses", courseId);
      const enrollmentId = `enroll-${courseId}-${studentId}`;
      const enrollmentRef = doc(db, "enrollments", enrollmentId);

      const batch = writeBatch(db);
      batch.update(courseRef, { studentIds: arrayRemove(studentId) });
      batch.delete(enrollmentRef);
      await batch.commit();

      const updatedCourseDoc = await getDoc(courseRef);
      const updatedCourse = { id: updatedCourseDoc.id, ...updatedCourseDoc.data() } as Course;

      dispatch({ type: ActionType.UNENROLL_STUDENT_SUCCESS, payload: { course: updatedCourse, studentId, enrollmentId } });
    } catch (error: any) {
      dispatch({ type: ActionType.UNENROLL_STUDENT_FAILURE, payload: error.message || "Failed to unenroll student." });
    }
  }, [dispatch]);

  const handleCreateLesson = useCallback(async (payload: CreateLessonPayload & { file?: File | null }) => {
    dispatch({ type: ActionType.CREATE_LESSON_REQUEST });
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

    if (payload.file) {
      try {
        const { fileUrl: newFileUrl, fileName: newFileName } = await handleLessonFileUpload(payload.courseId, payload.id, payload.file);
        uploadedFileUrl = newFileUrl;
        uploadedFileName = newFileName;
      } catch (error: any) {
        dispatch({ type: ActionType.UPDATE_LESSON_FAILURE, payload: error.message || "Failed to upload new lesson file." });
        return;
      }
    } else if (payload.file === null && payload.fileUrl === undefined) {
        uploadedFileUrl = undefined;
        uploadedFileName = undefined;
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
      const lessonToDelete = state.lessons.find(l => l.id === payload.id && l.courseId === payload.courseId);
      if (lessonToDelete?.fileUrl) {
        const storage = getFirebaseStorage();
        if (storage) {
          const fileStorageRef = storageRef(storage, lessonToDelete.fileUrl);
          try {
            await deleteObject(fileStorageRef);
            console.log("Associated lesson file deleted from storage:", lessonToDelete.fileUrl);
          } catch (storageError: any) {
            console.warn("Could not delete lesson file from storage:", storageError.message);
          }
        }
      }
      await deleteDoc(doc(db, "courses", payload.courseId, "lessons", payload.id));
      dispatch({ type: ActionType.DELETE_LESSON_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.DELETE_LESSON_FAILURE, payload: error.message || "Failed to delete lesson."});
    }
  }, [dispatch, state.lessons]);

  const handleCreateAssignment = useCallback(async (payload: CreateAssignmentPayload & { assignmentFile?: File | null }) => {
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
      if (payload.type === AssignmentType.QUIZ && payload.questions && payload.questions.length > 0) {
        totalPoints = payload.questions.reduce((sum, q) => sum + q.points, 0);
      } else if (payload.type === AssignmentType.STANDARD && payload.rubric && payload.rubric.length > 0) {
        totalPoints = payload.rubric.reduce((sum, r) => sum + r.points, 0);
      } else if (payload.manualTotalPoints !== undefined) {
        totalPoints = payload.manualTotalPoints;
      }

      const firestoreData: any = {
        id: assignmentId,
        courseId: payload.courseId,
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate,
        type: payload.type,
        totalPoints,
      };

      if (payload.rubric && payload.rubric.length > 0) {
        firestoreData.rubric = payload.rubric;
      }
      if (uploadedFileUrl) {
        firestoreData.assignmentFileUrl = uploadedFileUrl;
      }
      if (uploadedFileName) {
        firestoreData.assignmentFileName = uploadedFileName;
      }
      if (payload.externalLink) {
        firestoreData.externalLink = payload.externalLink;
      }

      if (payload.type === AssignmentType.QUIZ) {
        firestoreData.questions = (payload.questions && payload.questions.length > 0)
          ? payload.questions.map(q => ({
              ...q,
              id: q.id || doc(collection(db, "temp")).id,
              assignmentId: assignmentId
            }))
          : [];
      }


      await setDoc(doc(db, "courses", payload.courseId, "assignments", assignmentId), firestoreData);


      const newAssignmentForState: Assignment = {
        id: firestoreData.id,
        courseId: firestoreData.courseId,
        title: firestoreData.title,
        description: firestoreData.description,
        dueDate: firestoreData.dueDate,
        type: firestoreData.type,
        totalPoints: firestoreData.totalPoints,
        questions: payload.type === AssignmentType.QUIZ ? (firestoreData.questions || []) : null,
        rubric: firestoreData.rubric || null,
        assignmentFileUrl: firestoreData.assignmentFileUrl || null,
        assignmentFileName: firestoreData.assignmentFileName || null,
        externalLink: firestoreData.externalLink || null,
      };

      dispatch({ type: ActionType.CREATE_ASSIGNMENT_SUCCESS, payload: newAssignmentForState });
    } catch (error: any) {
      dispatch({ type: ActionType.CREATE_ASSIGNMENT_FAILURE, payload: error.message || "Failed to create assignment."});
    }
  }, [dispatch, handleAssignmentAttachmentUpload]);

  const handleUpdateAssignment = useCallback(async (payload: UpdateAssignmentPayload & { assignmentFile?: File | null }) => {
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

        uploadedFileUrl = null;
        uploadedFileName = null;
    }

    try {
      const assignmentRef = doc(db, "courses", payload.courseId, "assignments", payload.id);

      let totalPoints = payload.totalPoints || 0;
      if (payload.manualTotalPoints !== undefined) {
          totalPoints = payload.manualTotalPoints;
      } else if (payload.type === AssignmentType.QUIZ && payload.questions && payload.questions.length > 0) {
          totalPoints = payload.questions.reduce((sum, q) => sum + q.points, 0);
      } else if (payload.type === AssignmentType.STANDARD && payload.rubric && payload.rubric.length > 0) {
          totalPoints = payload.rubric.reduce((sum, r) => sum + r.points, 0);
      }

      const firestoreUpdateData: Partial<Assignment> = {
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate,
        type: payload.type,
        totalPoints,
      };


      firestoreUpdateData.rubric = (payload.rubric && payload.rubric.length > 0) ? payload.rubric : null;
      firestoreUpdateData.externalLink = payload.externalLink || null;

      if (uploadedFileUrl !== undefined) {
        firestoreUpdateData.assignmentFileUrl = uploadedFileUrl;
        firestoreUpdateData.assignmentFileName = uploadedFileName;
      } else if (payload.assignmentFile === null && payload.assignmentFileUrl === undefined) {

        firestoreUpdateData.assignmentFileUrl = null;
        firestoreUpdateData.assignmentFileName = null;
      }


      if (payload.type === AssignmentType.QUIZ) {
        firestoreUpdateData.questions = (payload.questions && payload.questions.length > 0)
          ? payload.questions.map(q_1 => ({
              ...q_1,
              id: q_1.id || doc(collection(db, "temp")).id,
              assignmentId: payload.id
            }))
          : [];
      } else {
        firestoreUpdateData.questions = null;
      }


      await updateDoc(assignmentRef, firestoreUpdateData as any);

      const updatedAssignmentForState: UpdateAssignmentPayload = {
        ...payload,
        courseId: payload.courseId,
        assignmentFileUrl: uploadedFileUrl,
        assignmentFileName: uploadedFileName,
        totalPoints: totalPoints,
        questions: payload.type === AssignmentType.QUIZ ? (firestoreUpdateData.questions || []) : null,
        rubric: firestoreUpdateData.rubric === null ? null : firestoreUpdateData.rubric,
        externalLink: firestoreUpdateData.externalLink === null ? null : firestoreUpdateData.externalLink,
      };
      dispatch({ type: ActionType.UPDATE_ASSIGNMENT_SUCCESS, payload: updatedAssignmentForState });
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
      const assignmentToDelete = state.assignments.find(a => a.id === payload.id && a.courseId === payload.courseId);
      if (assignmentToDelete?.assignmentFileUrl) {
         const storage = getFirebaseStorage();
         if (storage) {
            const fileStorageRef = storageRef(storage, assignmentToDelete.assignmentFileUrl);
            try {
            await deleteObject(fileStorageRef);
            console.log("Associated assignment file deleted from storage:", assignmentToDelete.assignmentFileUrl);
            } catch (storageError: any) {
            console.warn("Could not delete assignment file from storage:", storageError.message);
            }
         }
      }

      await deleteDoc(doc(db, "courses", payload.courseId, "assignments", payload.id));
      dispatch({ type: ActionType.DELETE_ASSIGNMENT_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.DELETE_ASSIGNMENT_FAILURE, payload: error.message || "Failed to delete assignment."});
    }
  }, [dispatch, state.assignments]);

  const handleStudentSubmitAssignment = useCallback(async (payload: SubmitAssignmentPayload) => {
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
      delete (finalSubmission as any).file;

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

  const handleAdminUpdateOrCreateSubmission = useCallback(async (payload: AdminUpdateOrCreateSubmissionPayload) => {
    dispatch({ type: ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_FAILURE, payload: "Firestore not available." });
      return;
    }

    try {
      if (payload.grade > payload.assignmentTotalPoints || payload.grade < 0) {
        throw new Error(`Grade must be between 0 and ${payload.assignmentTotalPoints}.`);
      }

      const submissionCollectionRef = collection(db, "courses", payload.courseId, "assignments", payload.assignmentId, "submissions");
      const q = query(submissionCollectionRef, where("studentId", "==", payload.studentId));
      const querySnapshot = await getDocs(q);

      let submissionToUpdate: Submission;

      if (!querySnapshot.empty) {
        const existingSubmissionDoc = querySnapshot.docs[0];
        submissionToUpdate = {
          ...existingSubmissionDoc.data() as Submission,
          id: existingSubmissionDoc.id,
          grade: payload.grade,
          feedback: payload.feedback || existingSubmissionDoc.data().feedback || "",
          submittedAt: existingSubmissionDoc.data().submittedAt || new Date().toISOString(),
        };
        await updateDoc(doc(submissionCollectionRef, existingSubmissionDoc.id), {
          grade: submissionToUpdate.grade,
          feedback: submissionToUpdate.feedback,
        });
      } else {
        const newSubmissionId = doc(submissionCollectionRef).id;
        submissionToUpdate = {
          id: newSubmissionId,
          assignmentId: payload.assignmentId,
          studentId: payload.studentId,
          submittedAt: new Date().toISOString(),
          content: "Administratively recorded.",
          grade: payload.grade,
          feedback: payload.feedback || "",
        };
        await setDoc(doc(submissionCollectionRef, newSubmissionId), submissionToUpdate);
      }
      dispatch({ type: ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_SUCCESS, payload: submissionToUpdate });
    } catch (error: any) {
      dispatch({ type: ActionType.ADMIN_UPDATE_OR_CREATE_SUBMISSION_FAILURE, payload: error.message || "Failed to update/create submission." });
    }
  }, [dispatch]);

  const handleSaveAttendanceRecords = useCallback(async (payload: TakeAttendancePayload) => {
    dispatch({ type: ActionType.SAVE_ATTENDANCE_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.SAVE_ATTENDANCE_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const batch = writeBatch(db);
      const recordsToUpdateInState: AttendanceRecord[] = [];
      let recordsAdded = 0;
      let recordsUpdated = 0;

      for (const ss of payload.studentStatuses) {
        const attendanceColRef = collection(db, "attendanceRecords");
        const q = query(attendanceColRef,
          where("courseId", "==", payload.courseId),
          where("studentId", "==", ss.studentId),
          where("date", "==", payload.date)
        );
        const querySnapshot = await getDocs(q);

        const recordData = {
          courseId: payload.courseId,
          studentId: ss.studentId,
          date: payload.date,
          status: ss.status,
          notes: ss.notes || "",
        };

        if (!querySnapshot.empty) { // Record exists, update it
          const existingDoc = querySnapshot.docs[0];
          batch.update(doc(db, "attendanceRecords", existingDoc.id), { status: ss.status, notes: ss.notes || "" });
          recordsToUpdateInState.push({ ...recordData, id: existingDoc.id });
          recordsUpdated++;
        } else { // Record doesn't exist, create it
          const newRecordId = doc(collection(db, "attendanceRecords")).id;
          batch.set(doc(db, "attendanceRecords", newRecordId), { ...recordData, id: newRecordId });
          recordsToUpdateInState.push({ ...recordData, id: newRecordId });
          recordsAdded++;
        }
      }

      await batch.commit();
      dispatch({ type: ActionType.SAVE_ATTENDANCE_SUCCESS, payload: recordsToUpdateInState });
      toast({ title: "Attendance Saved", description: `${recordsAdded} record(s) added, ${recordsUpdated} record(s) updated.`});

    } catch (error: any) {
      dispatch({ type: ActionType.SAVE_ATTENDANCE_FAILURE, payload: error.message || "Failed to save attendance." });
    }
  }, [dispatch, toast]);

  const handleRecordPayment = useCallback(async (payload: RecordPaymentPayload) => {
    dispatch({ type: ActionType.RECORD_PAYMENT_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.RECORD_PAYMENT_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const paymentId = doc(collection(db, "payments")).id;
      const newPayment: Payment = {
        ...payload,
        id: paymentId,
        paymentDate: payload.paymentDate || new Date().toISOString(),
      };
      await setDoc(doc(db, "payments", paymentId), newPayment);
      dispatch({ type: ActionType.RECORD_PAYMENT_SUCCESS, payload: newPayment });
    } catch (error: any) {
      dispatch({ type: ActionType.RECORD_PAYMENT_FAILURE, payload: error.message || "Failed to record payment." });
    }
  }, [dispatch]);

  const handleUpdatePayment = useCallback(async (payload: UpdatePaymentPayload) => {
    dispatch({ type: ActionType.UPDATE_PAYMENT_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.UPDATE_PAYMENT_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      const paymentRef = doc(db, "payments", payload.id);
      const updateData: Partial<Payment> = { ...payload };
      delete updateData.id;

      if (payload.paymentDate === undefined) {
        delete updateData.paymentDate;
      }

      await updateDoc(paymentRef, updateData);
      const updatedPaymentForState = { ...state.payments.find(p => p.id === payload.id), ...payload } as Payment;
      dispatch({ type: ActionType.UPDATE_PAYMENT_SUCCESS, payload: updatedPaymentForState });
    } catch (error: any) {
      dispatch({ type: ActionType.UPDATE_PAYMENT_FAILURE, payload: error.message || "Failed to update payment." });
    }
  }, [dispatch, state.payments]);

  const handleDeletePayment = useCallback(async (payload: DeletePaymentPayload) => {
    dispatch({ type: ActionType.DELETE_PAYMENT_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
      dispatch({ type: ActionType.DELETE_PAYMENT_FAILURE, payload: "Firestore not available." });
      return;
    }
    try {
      await deleteDoc(doc(db, "payments", payload.id));
      dispatch({ type: ActionType.DELETE_PAYMENT_SUCCESS, payload });
    } catch (error: any) {
      dispatch({ type: ActionType.DELETE_PAYMENT_FAILURE, payload: error.message || "Failed to delete payment." });
    }
  }, [dispatch]);

  const handleCreateAnnouncement = useCallback(async (payload: CreateAnnouncementPayload) => {
    dispatch({ type: ActionType.CREATE_ANNOUNCEMENT_REQUEST });
    const db = getFirebaseDb();
    if(!db) {
        dispatch({ type: ActionType.CREATE_ANNOUNCEMENT_FAILURE, payload: "Firestore not available." });
        return;
    }
    try {
        const announcementId = doc(collection(db, "announcements")).id;
        const newAnnouncement: Announcement = {
            ...payload,
            id: announcementId,
            timestamp: Date.now(),
        };
        await setDoc(doc(db, "announcements", announcementId), newAnnouncement);
        dispatch({ type: ActionType.CREATE_ANNOUNCEMENT_SUCCESS, payload: newAnnouncement});

    } catch (error: any) {
        dispatch({ type: ActionType.CREATE_ANNOUNCEMENT_FAILURE, payload: error.message || "Failed to create announcement."});
    }
  }, [dispatch]);

  const handleSendDirectMessage = useCallback(async (payload: CreateDirectMessagePayload) => {
    const currentUser = state.currentUser; 
    if (!currentUser) {
      dispatch({ type: ActionType.SEND_DIRECT_MESSAGE_FAILURE, payload: "User not authenticated." });
      return;
    }
    dispatch({ type: ActionType.SEND_DIRECT_MESSAGE_REQUEST });
    const db = getFirebaseDb();
    if(!db) {
        dispatch({ type: ActionType.SEND_DIRECT_MESSAGE_FAILURE, payload: "Firestore not available." });
        return;
    }
    try {
        const messageId = doc(collection(db, "directMessages")).id;
        const newMessage: DirectMessage = {
            ...payload,
            id: messageId,
            senderId: currentUser.id,
            timestamp: Date.now(),
            read: false,
        };
        await setDoc(doc(db, "directMessages", messageId), newMessage);
        dispatch({ type: ActionType.SEND_DIRECT_MESSAGE_SUCCESS, payload: newMessage });

        const recipientUser = state.users.find(u => u.id === payload.recipientId);
        if (recipientUser) {
           dispatch({
             type: ActionType.ADD_NOTIFICATION,
             payload: {
               userId: payload.recipientId,
               type: 'new_message',
               message: `New message from ${currentUser.name}: "${payload.content.substring(0,30)}..."`,
               link: '/messages'
            }
          });
        }

    } catch (error: any) {
        dispatch({ type: ActionType.SEND_DIRECT_MESSAGE_FAILURE, payload: error.message || "Failed to send message."});
    }
  }, [dispatch, state.currentUser, state.users]); 

  const handleMarkMessageRead = useCallback(async (payload: MarkDirectMessageReadPayload) => {
    dispatch({ type: ActionType.MARK_DIRECT_MESSAGE_READ_REQUEST });
    const db = getFirebaseDb();
    if (!db) {
        dispatch({ type: ActionType.MARK_DIRECT_MESSAGE_READ_FAILURE, payload: "Firestore not available." });
        return;
    }
    try {
        const messageRef = doc(db, "directMessages", payload.messageId);
        await updateDoc(messageRef, { read: true });
        dispatch({ type: ActionType.MARK_DIRECT_MESSAGE_READ_SUCCESS, payload });
    } catch (error: any) {
        dispatch({ type: ActionType.MARK_DIRECT_MESSAGE_READ_FAILURE, payload: error.message || "Failed to mark message as read." });
    }
  }, [dispatch]);


  const contextValue: AppContextType = {
    state,
    dispatch,
    handleLoginUser,
    handleRegisterStudent,
    handleLogoutUser,
    handleUpdateUserProfile,
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
    handleEnrollStudent,
    handleUnenrollStudent,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleCreateAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    handleStudentSubmitAssignment,
    handleTeacherGradeSubmission,
    handleAdminUpdateOrCreateSubmission,
    handleRecordPayment,
    handleUpdatePayment,
    handleDeletePayment,
    handleCreateAnnouncement,
    handleSendDirectMessage,
    handleMarkMessageRead,
    fetchCourseSchedule,
    fetchAllCourseSchedules,
    handleUpdateCourseDaySchedule,
    handleClearCourseDaySchedule,
    handleSaveAttendanceRecords,
    fetchAllAttendanceRecords,
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

