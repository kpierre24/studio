
import type { User, Course, Lesson, Assignment, Submission, Payment, AttendanceRecord, NotificationMessage, Enrollment, QuizQuestion, RubricCriterion, Announcement } from '@/types';
import { UserRole, AssignmentType, QuestionType, AttendanceStatus } from '@/types';

export const APP_NAME = "ClassroomHQ";

export const SAMPLE_SUPER_ADMIN: User = {
  id: 'user-super-admin',
  name: 'Super Admin',
  email: 'superadmin@classroomhq.com',
  password: 'password123', // In a real app, this would be hashed or managed by an auth provider
  role: UserRole.SUPER_ADMIN,
  avatarUrl: 'https://placehold.co/100x100.png?text=SA',
};

export const SAMPLE_TEACHERS: User[] = [
  {
    id: 'user-teacher-1',
    name: 'Alice Wonderland',
    email: 'alice@classroomhq.com',
    password: 'password123',
    role: UserRole.TEACHER,
    avatarUrl: 'https://placehold.co/100x100.png?text=AW',
  },
  {
    id: 'user-teacher-2',
    name: 'Bob The Builder',
    email: 'bob@classroomhq.com',
    password: 'password123',
    role: UserRole.TEACHER,
    avatarUrl: 'https://placehold.co/100x100.png?text=BB',
  },
];

export const SAMPLE_STUDENTS: User[] = [
  {
    id: 'user-student-1',
    name: 'Charlie Brown',
    email: 'charlie@classroomhq.com',
    password: 'password123',
    role: UserRole.STUDENT,
    avatarUrl: 'https://placehold.co/100x100.png?text=CB',
  },
  {
    id: 'user-student-2',
    name: 'Diana Prince',
    email: 'diana@classroomhq.com',
    password: 'password123',
    role: UserRole.STUDENT,
    avatarUrl: 'https://placehold.co/100x100.png?text=DP',
  },
];

export const SAMPLE_USERS: User[] = [
  SAMPLE_SUPER_ADMIN,
  ...SAMPLE_TEACHERS,
  ...SAMPLE_STUDENTS,
];

export const SAMPLE_COURSES: Course[] = [
  {
    id: 'course-1',
    name: 'Introduction to Programming',
    description: 'Learn the fundamentals of programming using JavaScript.',
    teacherId: 'user-teacher-1',
    studentIds: ['user-student-1', 'user-student-2'],
    category: 'Computer Science',
    cost: 100,
    prerequisites: [],
  },
  {
    id: 'course-2',
    name: 'Advanced Mathematics',
    description: 'Explore complex mathematical concepts.',
    teacherId: 'user-teacher-2',
    studentIds: ['user-student-1'],
    category: 'Mathematics',
    cost: 150,
    prerequisites: ['course-1'], // Example prerequisite
  },
];

export const SAMPLE_LESSONS: Lesson[] = [
  {
    id: 'lesson-1-1',
    courseId: 'course-1',
    title: 'Variables and Data Types',
    contentMarkdown: '### What are Variables?\nVariables are containers for storing data values. In JavaScript, variables can be declared with `var`, `let`, or `const` keywords.',
    videoUrl: 'https://www.youtube.com/watch?v= primjer', // Example video URL
    order: 1,
  },
  {
    id: 'lesson-1-2',
    courseId: 'course-1',
    title: 'Control Flow',
    contentMarkdown: '### Conditional Statements\nUse `if`, `else if`, and `else` to execute different blocks of code based on conditions.',
    order: 2,
  },
];

const quiz1Questions: QuizQuestion[] = [
    { id: 'q1', questionText: 'What keyword is used to declare a variable that cannot be reassigned?', questionType: QuestionType.MULTIPLE_CHOICE, options: ['var', 'let', 'const', 'static'], correctAnswer: 'const', points: 10 },
    { id: 'q2', questionText: 'Is JavaScript a statically typed language? (True/False)', questionType: QuestionType.TRUE_FALSE, correctAnswer: 'False', points: 5 },
];

const sampleRubricForAssign1: RubricCriterion[] = [
    { id: 'rubric-1-1', description: 'Code Clarity and Readability', points: 10 },
    { id: 'rubric-1-2', description: 'Correctness of Logic', points: 15 },
    { id: 'rubric-1-3', description: 'Efficiency of Solution', points: 5 },
];


export const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1-1',
    courseId: 'course-1',
    title: 'First Programming Challenge',
    description: 'Write a simple JavaScript function.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 7 days
    type: AssignmentType.STANDARD,
    totalPoints: 30, // Sum of rubric points
    rubric: sampleRubricForAssign1,
  },
  {
    id: 'assign-1-2',
    courseId: 'course-1',
    title: 'Basic Concepts Quiz',
    description: 'Test your understanding of variables and types.',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Due in 10 days
    type: AssignmentType.QUIZ,
    totalPoints: 15, // Sum of question points
    questions: quiz1Questions.map(q => ({...q, assignmentId: 'assign-1-2'})),
  },
];

export const SAMPLE_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    assignmentId: 'assign-1-1',
    studentId: 'user-student-1',
    submittedAt: new Date().toISOString(),
    content: 'This is my submission for the first programming challenge.',
    grade: 25, // Example grade
    feedback: 'Good effort, but review the section on loops.',
    rubricScores: [ { criterionId: 'rubric-1-1', score: 8 }, { criterionId: 'rubric-1-2', score: 12 }, { criterionId: 'rubric-1-3', score: 5 }]
  },
  {
    id: 'sub-2',
    assignmentId: 'assign-1-2', // Quiz submission
    studentId: 'user-student-1',
    submittedAt: new Date().toISOString(),
    quizAnswers: [
      { questionId: 'q1', studentAnswer: 'const' },
      { questionId: 'q2', studentAnswer: 'False' },
    ],
    // Grade will be auto-calculated by LOAD_DATA in AppContext
  },
];

export const SAMPLE_PAYMENTS: Payment[] = [
  {
    id: 'payment-1',
    studentId: 'user-student-1',
    courseId: 'course-1',
    amount: 100,
    status: 'Paid',
    paymentDate: new Date().toISOString(),
  },
];

export const SAMPLE_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    studentId: 'user-student-1',
    courseId: 'course-1',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    status: AttendanceStatus.PRESENT,
  },
];

export const SAMPLE_NOTIFICATIONS: NotificationMessage[] = []; // Start with no notifications, they are generated by actions


export const INITIAL_ENROLLMENTS: Enrollment[] = SAMPLE_COURSES.flatMap(course =>
  course.studentIds.map(studentId => ({
    id: `enroll-${course.id}-${studentId}`,
    studentId,
    courseId: course.id,
    enrollmentDate: new Date().toISOString(),
  }))
);

export const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'announce-1',
    message: "Welcome to the new semester!\nWe're excited to have you all. Please check your course pages for initial assignments and materials.",
    timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    type: 'announcement', // General announcement
    link: '/student/dashboard'
  },
  {
    id: 'announce-2',
    message: "Scheduled Maintenance Notice\nThe platform will be down for maintenance on Saturday from 2 AM to 4 AM. We apologize for any inconvenience.",
    timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
    type: 'announcement', // General announcement
  },
  {
    id: 'announce-course-1-update',
    courseId: 'course-1',
    message: "Intro to Programming: Week 1 materials are now live!\nPlease review Lesson 1 and start working on the first challenge.",
    timestamp: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
    type: 'course_update', // Course-specific type, or could be 'announcement' with courseId
    link: '/student/courses/course-1'
  },
    {
    id: 'announce-student-1-specific',
    userId: 'user-student-1', // Target student
    message: "Hi Charlie, just a reminder that your payment for Advanced Maths is due next week.",
    timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
    type: 'user_specific_reminder', // User-specific type
    link: '/student/payments'
  },
];


// This is a simplified version. User should provide their full constants.ts content.
// For example, more detailed announcements, forum posts, etc.
