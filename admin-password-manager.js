
// admin-password-manager.js
const admin = require('firebase-admin');

// --- CONFIGURATION ---
// Option 1: Set GOOGLE_APPLICATION_CREDENTIALS environment variable
// admin.initializeApp();

// Option 2: Initialize with service account key directly (replace with your actual path)
const serviceAccount = require('/home/user/studio/classroomhq-qzqnp-firebase-adminsdk-fbsvc-2a4de69fdd.json'); // !!! REPLACE THIS PATH IF DIFFERENT !!!
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const NEW_PASSWORD_FOR_STUDENTS = '123456';
const STUDENT_ROLE_IDENTIFIER = 'Student'; // Adjust if your role field/value is different
const SCHOOL_OF_MINISTRY_COURSE_ID = 'vIvjehHXH4e5wOnIJxwF'; // !!! REPLACE THIS WITH YOUR ACTUAL "School of Ministry" COURSE ID !!!

async function resetAllStudentPasswords() {
    console.log(`Starting password reset for all users with role '${STUDENT_ROLE_IDENTIFIER}' to '${NEW_PASSWORD_FOR_STUDENTS}'.`);
    let studentsProcessed = 0;
    let studentsFailed = 0;
    let nextPageToken; // For pagination if you have more than 1000 users

    try {
        const listUsersResult = await auth.listUsers(1000, nextPageToken);

        if (!listUsersResult.users || listUsersResult.users.length === 0) {
            console.log("No users found in Firebase Authentication to process.");
            return;
        }

        console.log(`Fetched ${listUsersResult.users.length} users from Firebase Auth. Checking roles in Firestore...`);

        for (const userRecord of listUsersResult.users) {
            const uid = userRecord.uid;
            const email = userRecord.email || 'N/A';

            try {
                const userDocRef = db.collection('users').doc(uid);
                const userDoc = await userDocRef.get();

                if (userDoc.exists && userDoc.data()?.role === STUDENT_ROLE_IDENTIFIER) {
                    console.log(`Updating password for student: ${email} (UID: ${uid})...`);
                    await auth.updateUser(uid, {
                        password: NEW_PASSWORD_FOR_STUDENTS,
                    });
                    console.log(`Successfully updated password for ${email} (UID: ${uid})`);
                    studentsProcessed++;
                } else if (userDoc.exists) {
                    // console.log(`User ${email} (UID: ${uid}) is not a '${STUDENT_ROLE_IDENTIFIER}'. Skipping.`);
                } else {
                    console.warn(`Firestore document not found for user ${email} (UID: ${uid}). Skipping password update.`);
                }
            } catch (error) {
                console.error(`Failed to process user ${email} (UID: ${uid}):`, error.message);
                studentsFailed++;
            }
        }

        if (listUsersResult.pageToken) {
            nextPageToken = listUsersResult.pageToken;
            console.warn("More users exist. Implement pagination to process all users.");
        }

        console.log("\n--- Password Reset Summary ---");
        console.log(`Successfully updated passwords for ${studentsProcessed} students.`);
        if (studentsFailed > 0) {
            console.log(`Failed to update passwords for ${studentsFailed} users. Check logs above for details.`);
        }
        console.log("Password reset process finished for this batch.");

    } catch (error) {
        console.error('An critical error occurred during the password reset process:', error);
    }
}

async function checkSchoolOfMinistryEnrollments() {
    console.log(`\nChecking enrollment status for all '${STUDENT_ROLE_IDENTIFIER}' users in course ID '${SCHOOL_OF_MINISTRY_COURSE_ID}' (School of Ministry)...`);

    if (!SCHOOL_OF_MINISTRY_COURSE_ID) {
        console.error("Error: SCHOOL_OF_MINISTRY_COURSE_ID is not set. Please define it in the script.");
        return;
    }

    try {
        const courseRef = db.collection('courses').doc(SCHOOL_OF_MINISTRY_COURSE_ID);
        const courseDoc = await courseRef.get();

        if (!courseDoc.exists) {
            console.error(`Error: Course with ID '${SCHOOL_OF_MINISTRY_COURSE_ID}' (School of Ministry) not found in Firestore.`);
            return;
        }
        const courseData = courseDoc.data();
        const enrolledStudentIdsInCourse = new Set(courseData.studentIds || []);
        console.log(`Course "${courseData.name}" has ${enrolledStudentIdsInCourse.size} student(s) listed in its studentIds array.`);

        const usersSnapshot = await db.collection('users').get();
        if (usersSnapshot.empty) {
            console.log("No users found in the 'users' collection.");
            return;
        }

        let studentCount = 0;
        let enrolledCount = 0;
        const notEnrolledStudents = [];

        console.log("\n--- Enrollment Check Details ---");
        usersSnapshot.forEach(userDoc => {
            const userData = userDoc.data();
            const userId = userDoc.id;
            const userName = userData.name || 'Unknown Name';
            const userEmail = userData.email || 'N/A';

            if (userData.role === STUDENT_ROLE_IDENTIFIER) {
                studentCount++;
                if (enrolledStudentIdsInCourse.has(userId)) {
                    console.log(`- Student ${userName} (${userEmail}, ID: ${userId}) IS ENROLLED in School of Ministry.`);
                    enrolledCount++;
                } else {
                    console.log(`- Student ${userName} (${userEmail}, ID: ${userId}) IS NOT ENROLLED in School of Ministry.`);
                    notEnrolledStudents.push({ name: userName, email: userEmail, id: userId });
                }
            }
        });

        console.log("\n--- Enrollment Check Summary ---");
        console.log(`Total users checked: ${usersSnapshot.size}`);
        console.log(`Total users with role '${STUDENT_ROLE_IDENTIFIER}': ${studentCount}`);
        console.log(`Students enrolled in "School of Ministry" (course ID: ${SCHOOL_OF_MINISTRY_COURSE_ID}): ${enrolledCount}`);
        
        if (notEnrolledStudents.length > 0) {
            console.warn(`\nThe following ${notEnrolledStudents.length} student(s) are NOT enrolled in "School of Ministry":`);
            notEnrolledStudents.forEach(student => {
                console.warn(`  - ${student.name} (${student.email}, ID: ${student.id})`);
            });
        } else if (studentCount > 0) {
            console.log(`All ${studentCount} student(s) are correctly enrolled in "School of Ministry".`);
        } else {
            console.log("No students found to check enrollment for.");
        }

    } catch (error) {
        console.error('An error occurred during the enrollment check process:', error);
    }
}

async function enrollMissingStudentsInSchoolOfMinistry() {
    console.log(`\nAttempting to enroll missing '${STUDENT_ROLE_IDENTIFIER}' users into course ID '${SCHOOL_OF_MINISTRY_COURSE_ID}' (School of Ministry)...`);

    if (!SCHOOL_OF_MINISTRY_COURSE_ID) {
        console.error("Error: SCHOOL_OF_MINISTRY_COURSE_ID is not set. Please define it in the script.");
        return;
    }

    try {
        const courseRef = db.collection('courses').doc(SCHOOL_OF_MINISTRY_COURSE_ID);
        const courseDoc = await courseRef.get();

        if (!courseDoc.exists) {
            console.error(`Error: Course with ID '${SCHOOL_OF_MINISTRY_COURSE_ID}' not found.`);
            return;
        }
        const courseData = courseDoc.data();
        const enrolledStudentIdsInCourse = new Set(courseData.studentIds || []);
        console.log(`Course "${courseData.name}" currently has ${enrolledStudentIdsInCourse.size} student(s).`);

        const usersSnapshot = await db.collection('users').where('role', '==', STUDENT_ROLE_IDENTIFIER).get();
        if (usersSnapshot.empty) {
            console.log(`No users found with role '${STUDENT_ROLE_IDENTIFIER}'.`);
            return;
        }

        const studentsToEnroll = [];
        usersSnapshot.forEach(userDoc => {
            if (!enrolledStudentIdsInCourse.has(userDoc.id)) {
                studentsToEnroll.push({ id: userDoc.id, name: userDoc.data().name || 'Unknown Name', email: userDoc.data().email || 'N/A' });
            }
        });

        if (studentsToEnroll.length === 0) {
            console.log(`All students with role '${STUDENT_ROLE_IDENTIFIER}' are already enrolled in "${courseData.name}".`);
            return;
        }

        console.log(`\nThe following ${studentsToEnroll.length} student(s) will be enrolled into "${courseData.name}":`);
        studentsToEnroll.forEach(student => {
            console.log(`  - ${student.name} (${student.email}, ID: ${student.id})`);
        });

        // Simple confirmation prompt
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        await new Promise(resolve => {
            readline.question('\nDo you want to proceed with enrolling these students? (yes/no): ', async (answer) => {
                readline.close();
                if (answer.toLowerCase() !== 'yes') {
                    console.log("Enrollment cancelled by user.");
                    resolve();
                    return;
                }

                const batch = db.batch();
                let enrolledCount = 0;

                for (const student of studentsToEnroll) {
                    // 1. Update the course's studentIds array
                    batch.update(courseRef, {
                        studentIds: admin.firestore.FieldValue.arrayUnion(student.id)
                    });

                    // 2. Create an enrollment document
                    const enrollmentId = `enroll-${SCHOOL_OF_MINISTRY_COURSE_ID}-${student.id}`;
                    const enrollmentRef = db.collection('enrollments').doc(enrollmentId);
                    batch.set(enrollmentRef, {
                        id: enrollmentId,
                        studentId: student.id,
                        courseId: SCHOOL_OF_MINISTRY_COURSE_ID,
                        enrollmentDate: new Date().toISOString(), // Or admin.firestore.FieldValue.serverTimestamp()
                        grade: null // Or some default
                    });
                    console.log(`Scheduled enrollment for ${student.name} (ID: ${student.id}).`);
                    enrolledCount++;
                }

                try {
                    await batch.commit();
                    console.log(`\nSuccessfully enrolled ${enrolledCount} student(s) into "${courseData.name}".`);
                } catch (batchError) {
                    console.error("Error committing batch enrollments:", batchError);
                }
                resolve();
            });
        });

    } catch (error) {
        console.error('An error occurred during the enrollment process:', error);
    }
}


// To run a specific function:
// 1. Save this file.
// 2. Replace './path/to/your/serviceAccountKey.json' (or the existing path) if needed.
// 3. Replace SCHOOL_OF_MINISTRY_COURSE_ID with your actual course ID if needed.
// 4. Open your terminal in the directory where you saved the file.
// 5. Run: node admin-password-manager.js
// 6. Then, in the Node REPL that appears after "Script loaded...", type the function name and call it:
//    e.g., resetAllStudentPasswords()
//    OR
//    e.g., checkSchoolOfMinistryEnrollments()
//    OR
//    e.g., enrollMissingStudentsInSchoolOfMinistry()
//    and press Enter.

// !! IMPORTANT !!:
// - Test scripts thoroughly in a development/staging Firebase project first.
// - Use with extreme caution if modifying data (like resetAllStudentPasswords or enrollMissingStudentsInSchoolOfMinistry).

console.log("Admin script loaded. Available functions: resetAllStudentPasswords(), checkSchoolOfMinistryEnrollments(), enrollMissingStudentsInSchoolOfMinistry()");
console.log("Make sure to set SCHOOL_OF_MINISTRY_COURSE_ID if using checkSchoolOfMinistryEnrollments() or enrollMissingStudentsInSchoolOfMinistry().");
console.log("Ensure you have configured your service account key and understand the risks before running data-modifying functions.");

// Example: To run a function immediately when the script starts, uncomment the line below:
// checkSchoolOfMinistryEnrollments();
// enrollMissingStudentsInSchoolOfMinistry();
    