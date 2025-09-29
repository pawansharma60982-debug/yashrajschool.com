 // Your existing JavaScript code goes here unchanged
        // Import Firebase modules
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
        import { getFirestore, collection, addDoc, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, where, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
        import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAtBkB9ldsgcKSMF-lKRtyjbsipYvOTtH0",
            authDomain: "student-data-9f366.firebaseapp.com",
            projectId: "student-data-9f366",
            storageBucket: "student-data-9f366.firebasestorage.app",
            messagingSenderId: "817051783708",
            appId: "1:817051783708:web:188a75008cabd0c3f5c5d9",
            measurementId: "G-HCSZE7BMZ7"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);

        // Global variables
        let currentUser = null;
        let currentUserData = null;

        // Toppers data
        const toppers = [
            { name: "Rahul Sharma", percentage: "92.2%", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
            { name: "Priya Patel", percentage: "91.2%", image: "https://image2url.com/images/1759169383743-7efcb563-0254-4f08-a67d-d76cba91e902.jpeg" },
            { name: "Amit Kumar", percentage: "90.1%", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
            { name: "Gaurav", percentage: "89.7%", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
            { name: "Shlok Paswan", percentage: "87%", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
        ];

        // Populate toppers slider
        function populateToppers() {
            const slider = document.querySelector('.topper-slide');
            // Duplicate toppers to create seamless loop
            const allToppers = [...toppers, ...toppers, ...toppers];
            
            allToppers.forEach(topper => {
                const topperItem = document.createElement('div');
                topperItem.className = 'topper-item';
                topperItem.innerHTML = `
                    <img src="${topper.image}" alt="${topper.name}" class="topper-img">
                    <h5>${topper.name}</h5>
                    <p class="text-primary fw-bold">${topper.percentage}</p>
                `;
                slider.appendChild(topperItem);
            });
        }

        // Load events from Firestore
        async function loadEvents() {
            const eventsContainer = document.getElementById('eventsContainer');
            eventsContainer.innerHTML = '<div class="col-12 text-center"><p>Loading events...</p></div>';
            
            try {
                const q = query(collection(db, "events"), orderBy("date", "asc"));
                const querySnapshot = await getDocs(q);
                
                eventsContainer.innerHTML = '';
                
                if (querySnapshot.empty) {
                    // Add sample events if none exist
                    const sampleEvents = [
                        {
                            title: "Annual Sports Day",
                            description: "Join us for our exciting annual sports day with various competitions and activities for students of all ages.",
                            date: new Date(new Date().setDate(new Date().getDate() + 15)),
                            time: "9:00 AM - 4:00 PM",
                            location: "School Ground"
                        },
                        {
                            title: "Science Exhibition",
                            description: "Students will showcase their innovative science projects and experiments. Parents and community members are welcome.",
                            date: new Date(new Date().setDate(new Date().getDate() + 25)),
                            time: "10:00 AM - 2:00 PM",
                            location: "Science Lab & Auditorium"
                        }
                    ];
                    
                    for (const event of sampleEvents) {
                        await addDoc(collection(db, "events"), event);
                    }
                    
                    // Reload events
                    return loadEvents();
                }
                
                querySnapshot.forEach((doc) => {
                    const event = doc.data();
                    const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    
                    const eventHTML = `
                        <div class="col-lg-6 mb-4">
                            <div class="card event-card">
                                <div class="card-body p-4">
                                    <div class="event-date">
                                        <span class="day">${eventDate.getDate()}</span>
                                        <span class="month">${monthNames[eventDate.getMonth()]}</span>
                                    </div>
                                    <h4 class="card-title">${event.title}</h4>
                                    <p class="card-text">${event.description}</p>
                                    <div class="event-info">
                                        <p><i class="fas fa-clock me-2"></i> ${event.time}</p>
                                        <p><i class="fas fa-map-marker-alt me-2"></i> ${event.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    eventsContainer.innerHTML += eventHTML;
                });
            } catch (error) {
                console.error("Error loading events: ", error);
                eventsContainer.innerHTML = '<div class="col-12 text-center"><p>Error loading events</p></div>';
            }
        }

        // Login modal functionality
        document.addEventListener('DOMContentLoaded', function() {
            populateToppers();
            loadEvents();
            
            const roleButtons = document.querySelectorAll('.role-btn');
            const roleSelection = document.getElementById('roleSelection');
            const loginForm = document.getElementById('loginForm');
            const standardField = document.getElementById('standardField');
            const backToRole = document.getElementById('backToRole');
            const actualLoginForm = document.getElementById('actualLoginForm');
            const admissionForm = document.getElementById('admissionForm');
            const newsletterForm = document.getElementById('newsletterForm');
            
            let selectedRole = '';
            
            roleButtons.forEach(button => {
                button.addEventListener('click', function() {
                    selectedRole = this.getAttribute('data-role');
                    roleSelection.style.display = 'none';
                    loginForm.style.display = 'block';
                    
                    if (selectedRole === 'principal') {
                        standardField.style.display = 'none';
                    } else {
                        standardField.style.display = 'block';
                    }
                });
            });
            
            backToRole.addEventListener('click', function(e) {
                e.preventDefault();
                loginForm.style.display = 'none';
                roleSelection.style.display = 'block';
                selectedRole = '';
                actualLoginForm.reset();
            });
            
            actualLoginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                const standard = selectedRole !== 'principal' ? document.getElementById('standard').value : '';
                
                // Authenticate with Firebase
                loginWithFirebase(email, password, selectedRole, standard);
            });
            
            // Admission form submission
            admissionForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form values
                const studentName = document.getElementById('studentName').value;
                const applyingFor = document.getElementById('applyingFor').value;
                
                // Save to Firebase
                addDoc(collection(db, 'admissions'), {
                    studentName: studentName,
                    dob: document.getElementById('dob').value,
                    gender: document.getElementById('gender').value,
                    applyingFor: applyingFor,
                    previousSchool: document.getElementById('previousSchool').value,
                    casteCategory: document.getElementById('casteCategory').value,
                    entranceMarks: parseInt(document.getElementById('entranceMarks').value),
                    parentName: document.getElementById('parentName').value,
                    parentOccupation: document.getElementById('parentOccupation').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value,
                    address: document.getElementById('address').value,
                    status: 'pending',
                    timestamp: new Date()
                }).then(() => {
                    alert(`Thank you ${studentName}! Your application for Class ${applyingFor} has been submitted successfully. We will contact you soon.`);
                    
                    // Close modal
                    const admissionModal = bootstrap.Modal.getInstance(document.getElementById('admissionModal'));
                    admissionModal.hide();
                    
                    // Reset form
                    admissionForm.reset();
                }).catch((error) => {
                    console.error("Error adding document: ", error);
                    alert("There was an error submitting your application. Please try again.");
                });
            });
            
            // Newsletter form submission
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = this.querySelector('input[type="email"]').value;
                
                // Save to Firebase
                addDoc(collection(db, 'newsletter'), {
                    email: email,
                    timestamp: new Date()
                }).then(() => {
                    alert('Thank you for subscribing to our newsletter!');
                    this.reset();
                }).catch((error) => {
                    console.error("Error adding document: ", error);
                    alert("There was an error with your subscription. Please try again.");
                });
            });

            // File upload functionality
            setupFileUpload();
        });

        // Setup file upload functionality
        function setupFileUpload() {
            const fileUploadContainer = document.getElementById('fileUploadContainer');
            const profilePhotoInput = document.getElementById('profilePhotoInput');
            const previewImage = document.getElementById('previewImage');
            const imagePreview = document.getElementById('imagePreview');
            const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
            
            // Drag and drop functionality
            fileUploadContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadContainer.classList.add('dragover');
            });
            
            fileUploadContainer.addEventListener('dragleave', () => {
                fileUploadContainer.classList.remove('dragover');
            });
            
            fileUploadContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadContainer.classList.remove('dragover');
                
                if (e.dataTransfer.files.length) {
                    profilePhotoInput.files = e.dataTransfer.files;
                    handleImageSelection();
                }
            });
            
            // File input change
            profilePhotoInput.addEventListener('change', handleImageSelection);
            
            // Upload button click
            uploadPhotoBtn.addEventListener('click', uploadProfilePhoto);
            
            function handleImageSelection() {
                const file = profilePhotoInput.files[0];
                if (file) {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            previewImage.src = e.target.result;
                            imagePreview.style.display = 'block';
                        };
                        reader.readAsDataURL(file);
                    } else {
                        alert('Please select an image file.');
                        profilePhotoInput.value = '';
                    }
                }
            }
        }

        // Upload profile photo
        async function uploadProfilePhoto() {
            const fileInput = document.getElementById('profilePhotoInput');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a photo to upload.');
                return;
            }
            
            if (!currentUser) {
                alert('You must be logged in to upload a photo.');
                return;
            }
            
            try {
                // Create a reference to the file location
                const storageRef = ref(storage, `profile-photos/${currentUser.uid}`);
                
                // Upload the file
                await uploadBytes(storageRef, file);
                
                // Get the download URL
                const downloadURL = await getDownloadURL(storageRef);
                
                // Update the user's profile in Firestore
                await updateDoc(doc(db, "users", currentUser.uid), {
                    photoURL: downloadURL,
                    lastUpdated: new Date()
                });
                
                // Update current user data
                currentUserData.photoURL = downloadURL;
                
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('imageUploadModal'));
                modal.hide();
                
                // Refresh the dashboard to show the new photo
                showDashboard(currentUserData.role, currentUserData);
                
                alert('Profile photo updated successfully!');
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Error uploading photo. Please try again.');
            }
        }

        // Show image upload modal
        function showImageUploadModal() {
            // Reset the form
            document.getElementById('profilePhotoInput').value = '';
            document.getElementById('imagePreview').style.display = 'none';
            
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('imageUploadModal'));
            modal.show();
        }

        // Firebase login function
        async function loginWithFirebase(email, password, role, standard) {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                currentUser = user;
                
                // Check user role in Firestore
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    currentUserData = userData;
                    
                    // Verify role matches
                    if (userData.role === role) {
                        // Check if standard matches for students/teachers
                        if ((role === 'student' || role === 'teacher') && 
                            userData.standard != standard) {
                            alert('Standard does not match your account. Please select the correct standard.');
                            await signOut(auth);
                            return;
                        }
                        
                        // Successful login
                        alert(`Login successful as ${role}!`);
                        
                        // Close login modal
                        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                        loginModal.hide();
                        
                        // Show dashboard modal
                        showDashboard(role, userData);
                    } else {
                        alert(`Your account is registered as ${userData.role}, not ${role}. Please select the correct role.`);
                        await signOut(auth);
                    }
                } else {
                    alert("User data not found. Please contact administrator.");
                    await signOut(auth);
                }
            } catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                
                if (errorCode === 'auth/user-not-found') {
                    alert('No account found with this email. Please check your email or contact administrator.');
                } else if (errorCode === 'auth/wrong-password') {
                    alert('Incorrect password. Please try again.');
                } else {
                    alert('Login error: ' + errorMessage);
                }
            }
        }

        // Get actual statistics from Firestore
        async function getSchoolStatistics() {
            try {
                // Get student count
                const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
                const studentsSnapshot = await getDocs(studentsQuery);
                const studentCount = studentsSnapshot.size;
                
                // Get teacher count
                const teachersQuery = query(collection(db, "users"), where("role", "==", "teacher"));
                const teachersSnapshot = await getDocs(teachersQuery);
                const teacherCount = teachersSnapshot.size;
                
                // Get pending admissions count
                const admissionsQuery = query(collection(db, "admissions"), where("status", "==", "pending"));
                const admissionsSnapshot = await getDocs(admissionsQuery);
                const pendingAdmissionsCount = admissionsSnapshot.size;
                
                // Calculate average attendance (this would need to be calculated from attendance records)
                let totalAttendance = 0;
                let attendanceCount = 0;
                
                studentsSnapshot.forEach((doc) => {
                    const student = doc.data();
                    if (student.attendance) {
                        totalAttendance += student.attendance;
                        attendanceCount++;
                    }
                });
                
                const averageAttendance = attendanceCount > 0 ? Math.round(totalAttendance / attendanceCount) : 0;
                
                return {
                    studentCount,
                    teacherCount,
                    pendingAdmissionsCount,
                    averageAttendance
                };
            } catch (error) {
                console.error("Error getting statistics: ", error);
                return {
                    studentCount: 0,
                    teacherCount: 0,
                    pendingAdmissionsCount: 0,
                    averageAttendance: 0
                };
            }
        }

        // Get student marks and rankings
        async function getStudentRankings() {
            try {
                const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
                const studentsSnapshot = await getDocs(studentsQuery);
                
                const students = [];
                studentsSnapshot.forEach((doc) => {
                    const student = doc.data();
                    student.id = doc.id;
                    students.push(student);
                });
                
                // Sort by percentage (descending)
                students.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
                
                // Add rank
                students.forEach((student, index) => {
                    student.rank = index + 1;
                });
                
                return students;
            } catch (error) {
                console.error("Error getting student rankings: ", error);
                return [];
            }
        }

        // Get admission applications with caste-wise ranking
        async function getAdmissionApplications() {
            try {
                const admissionsQuery = query(collection(db, "admissions"), where("status", "==", "pending"));
                const admissionsSnapshot = await getDocs(admissionsQuery);
                
                const applications = [];
                admissionsSnapshot.forEach((doc) => {
                    const application = doc.data();
                    application.id = doc.id;
                    applications.push(application);
                });
                
                // Sort by entrance marks (descending) within each caste category
                const casteCategories = {
                    'general': [],
                    'obc': [],
                    'sc': [],
                    'st': []
                };
                
                applications.forEach(app => {
                    if (casteCategories[app.casteCategory]) {
                        casteCategories[app.casteCategory].push(app);
                    }
                });
                
                // Sort each category by marks
                Object.keys(casteCategories).forEach(category => {
                    casteCategories[category].sort((a, b) => b.entranceMarks - a.entranceMarks);
                    
                    // Add rank within category
                    casteCategories[category].forEach((app, index) => {
                        app.casteRank = index + 1;
                    });
                });
                
                // Flatten back to single array
                const rankedApplications = [];
                Object.keys(casteCategories).forEach(category => {
                    rankedApplications.push(...casteCategories[category]);
                });
                
                return rankedApplications;
            } catch (error) {
                console.error("Error getting admission applications: ", error);
                return [];
            }
        }

        // Show dashboard based on role
        async function showDashboard(role, userData) {
            const dashboardContent = document.getElementById('dashboardContent');
            let dashboardHTML = '';
            
            switch(role) {
                case 'student':
                    dashboardHTML = await getStudentDashboard(userData);
                    break;
                    
                case 'teacher':
                    dashboardHTML = await getTeacherDashboard(userData);
                    break;
                    
                case 'principal':
                    dashboardHTML = await getPrincipalDashboard(userData);
                    break;
            }
            
            dashboardContent.innerHTML = dashboardHTML;
            
            // Show dashboard modal
            const dashboardModal = new bootstrap.Modal(document.getElementById('dashboardModal'));
            dashboardModal.show();
            
            // If principal, load additional data
            if (role === 'principal') {
                loadAdmissionApplications();
                loadStudentRankings();
            }
        }

        // Student Dashboard
        async function getStudentDashboard(userData) {
            return `
                <div class="profile-header">
                    <div class="position-relative d-inline-block">
                        <img src="${userData.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'}" 
                             class="profile-avatar" id="studentProfileImg">
                        <button class="btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0 rounded-circle" 
                                onclick="showImageUploadModal()">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    <h3>${userData.name || 'Student'}</h3>
                    <p class="text-muted">Class ${userData.standard} | Roll No: ${userData.rollNo || 'N/A'} | Caste: ${userData.casteCategory || 'N/A'}</p>
                    <button class="btn btn-outline-primary btn-sm mt-2" onclick="showChangePasswordModal()">
                        <i class="fas fa-key me-1"></i>Change Password
                    </button>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${userData.percentage || 0}%</div>
                            <div class="stats-label">Overall Percentage</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${userData.attendance || 0}%</div>
                            <div class="stats-label">Attendance</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${getGrade(userData.percentage || 0)}</div>
                            <div class="stats-label">Overall Grade</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${userData.rank || 'N/A'}</div>
                            <div class="stats-label">Class Rank</div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <h4>Subject-wise Marks</h4>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Marks</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateMarksTable(userData.marks || {})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h4>Notifications</h4>
                        <div class="list-group">
                            <div class="list-group-item">
                                <h6>Science Project Submission</h6>
                                <p class="mb-1">Submit your science project by September 30th</p>
                                <small>2 days ago</small>
                            </div>
                            <div class="list-group-item">
                                <h6>Parent-Teacher Meeting</h6>
                                <p class="mb-1">PTM scheduled for October 5th</p>
                                <small>1 week ago</small>
                            </div>
                            <div class="list-group-item">
                                <h6>Sports Day Practice</h6>
                                <p class="mb-1">Practice sessions begin from September 10th</p>
                                <small>2 weeks ago</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Teacher Dashboard
        async function getTeacherDashboard(userData) {
            const stats = await getTeacherStatistics(userData.standard);
            
            return `
                <div class="profile-header">
                    <div class="position-relative d-inline-block">
                        <img src="${userData.photoURL || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'}" 
                             class="profile-avatar" id="teacherProfileImg">
                        <button class="btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0 rounded-circle" 
                                onclick="showImageUploadModal()">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    <h3>${userData.name || 'Teacher'}</h3>
                    <p class="text-muted">Class ${userData.standard} Teacher | ${userData.subject || 'All Subjects'}</p>
                    <button class="btn btn-outline-primary btn-sm mt-2" onclick="showChangePasswordModal()">
                        <i class="fas fa-key me-1"></i>Change Password
                    </button>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${stats.studentCount}</div>
                            <div class="stats-label">Students</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${stats.assignmentCount || 5}</div>
                            <div class="stats-label">Pending Evaluations</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${stats.attendancePercentage || 92}%</div>
                            <div class="stats-label">Class Attendance</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${stats.lessonCount || 12}</div>
                            <div class="stats-label">Lessons This Week</div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <h4>Class ${userData.standard} Students</h4>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Attendance</th>
                                        <th>Performance</th>
                                    </tr>
                                </thead>
                                <tbody id="teacherStudentsTable">
                                    ${await generateTeacherStudentsTable(userData.standard)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h4>Quick Actions</h4>
                        <div class="d-grid gap-2 mb-4">
                            <button class="btn btn-outline-primary" onclick="showAddStudentForm('${userData.standard}')">
                                <i class="fas fa-user-plus me-2"></i>Add New Student
                            </button>
                            <button class="btn btn-outline-primary" onclick="showUpdateRollNumbers('${userData.standard}')">
                                <i class="fas fa-sort-numeric-up me-2"></i>Update Roll Numbers
                            </button>
                            <button class="btn btn-outline-primary" onclick="window.open('attendance.html?class=${userData.standard}', '_blank')">
                                <i class="fas fa-clipboard-check me-2"></i>Mark Attendance
                            </button>
                            <button class="btn btn-outline-primary" onclick="showUploadMarksForm('${userData.standard}')">
                                <i class="fas fa-upload me-2"></i>Upload Marks
                            </button>
                            <button class="btn btn-outline-primary" onclick="showSendNotificationForm('${userData.standard}')">
                                <i class="fas fa-bell me-2"></i>Send Notifications
                            </button>
                        </div>
                        
                        <h4>Recent Announcements</h4>
                        <div class="list-group">
                            <div class="list-group-item">
                                <h6>Staff Meeting</h6>
                                <p class="mb-1">Monthly staff meeting on Friday at 3:00 PM</p>
                                <small class="text-muted">2 days ago</small>
                            </div>
                            <div class="list-group-item">
                                <h6>Exam Schedule</h6>
                                <p class="mb-1">Half-yearly exams from October 15th</p>
                                <small class="text-muted">1 week ago</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Modals for teacher actions -->
                ${getTeacherModals(userData.standard)}
            `;
        }

        // Principal Dashboard
        async function getPrincipalDashboard(userData) {
            const stats = await getSchoolStatistics();
            
            return `
                <div class="profile-header">
                    <div class="position-relative d-inline-block">
                        <img src="${userData.photoURL || 'https://image2url.com/images/1759170596235-d5dc83bf-b210-429f-86e1-06b61a70d42a.jpg'}" 
                             class="profile-avatar" id="principalProfileImg">
                        <button class="btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0 rounded-circle" 
                                onclick="showImageUploadModal()">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    <h3>${userData.name || 'Mr. Fayaz Sir'}</h3>
                    <p class="text-muted">School Principal</p>
                    <button class="btn btn-outline-primary btn-sm mt-2" onclick="showChangePasswordModal()">
                        <i class="fas fa-key me-1"></i>Change Password
                    </button>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${stats.studentCount}</div>
                            <div class="stats-label">Total Students</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${stats.teacherCount}</div>
                            <div class="stats-label">Teaching Staff</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number">${stats.averageAttendance}%</div>
                            <div class="stats-label">Average Attendance</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-number" id="pendingAdmissions">${stats.pendingAdmissionsCount}</div>
                            <div class="stats-label">Pending Admissions</div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <h4>Admission Applications</h4>
                        <div class="mb-3">
                            <label for="casteFilter" class="form-label">Filter by Caste:</label>
                            <select class="form-select" id="casteFilter" onchange="filterApplications()">
                                <option value="all">All Categories</option>
                                <option value="general">General</option>
                                <option value="obc">OBC</option>
                                <option value="sc">SC</option>
                                <option value="st">ST</option>
                            </select>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Caste</th>
                                        <th>Marks</th>
                                        <th>Rank</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="admissionsTable">
                                    <!-- Admission applications will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                        
                        <h4 class="mt-4">Quick Actions</h4>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" onclick="showAddUserForm()">
                                <i class="fas fa-user-plus me-2"></i>Add New User
                            </button>
                            <button class="btn btn-outline-primary" onclick="showEventManagement()">
                                <i class="fas fa-calendar-alt me-2"></i>Manage Events
                            </button>
                            <button class="btn btn-outline-primary" onclick="generateReports()">
                                <i class="fas fa-chart-bar me-2"></i>Generate Reports
                            </button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h4>Student Rankings (Caste-wise)</h4>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Caste</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody id="rankingsTable">
                                    <!-- Student rankings will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                        
                        <h4 class="mt-4">School Statistics</h4>
                        <div class="list-group">
                            <div class="list-group-item d-flex justify-content-between">
                                <span>Students per Class:</span>
                                <span>Average 54</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between">
                                <span>Teacher-Student Ratio:</span>
                                <span>1:15</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between">
                                <span>Pass Percentage (Last Year):</span>
                                <span>98.7%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Modals for principal actions -->
                ${getPrincipalModals()}
            `;
        }

        // Get teacher statistics
        async function getTeacherStatistics(standard) {
            try {
                // Get students in teacher's class
                const studentsQuery = query(collection(db, "users"), 
                    where("role", "==", "student"), 
                    where("standard", "==", standard));
                const studentsSnapshot = await getDocs(studentsQuery);
                
                return {
                    studentCount: studentsSnapshot.size,
                    // Add more teacher-specific stats as needed
                };
            } catch (error) {
                console.error("Error getting teacher statistics: ", error);
                return { studentCount: 0 };
            }
        }

        // Generate marks table for student dashboard
        function generateMarksTable(marks) {
            const subjects = Object.keys(marks);
            if (subjects.length === 0) {
                return '<tr><td colspan="3" class="text-center">No marks available</td></tr>';
            }
            
            let marksHTML = '';
            subjects.forEach(subject => {
                marksHTML += `
                    <tr>
                        <td>${subject}</td>
                        <td>${marks[subject]}/100</td>
                        <td>${getGrade(marks[subject])}</td>
                    </tr>
                `;
            });
            
            return marksHTML;
        }

        // Generate teacher students table
        async function generateTeacherStudentsTable(standard) {
            try {
                const studentsQuery = query(collection(db, "users"), 
                    where("role", "==", "student"), 
                    where("standard", "==", standard));
                const studentsSnapshot = await getDocs(studentsQuery);
                
                if (studentsSnapshot.empty) {
                    return '<tr><td colspan="4" class="text-center">No students in this class</td></tr>';
                }
                
                let studentsHTML = '';
                studentsSnapshot.forEach(doc => {
                    const student = doc.data();
                    studentsHTML += `
                        <tr>
                            <td>${student.rollNo || 'N/A'}</td>
                            <td>${student.name}</td>
                            <td>${student.attendance || 0}%</td>
                            <td>${student.percentage || 0}%</td>
                        </tr>
                    `;
                });
                
                return studentsHTML;
            } catch (error) {
                console.error("Error generating teacher students table: ", error);
                return '<tr><td colspan="4" class="text-center">Error loading students</td></tr>';
            }
        }

        // Get grade from percentage
        function getGrade(percentage) {
            if (percentage >= 90) return 'A+';
            if (percentage >= 80) return 'A';
            if (percentage >= 70) return 'B+';
            if (percentage >= 60) return 'B';
            if (percentage >= 50) return 'C';
            return 'F';
        }

        // Get teacher modals HTML
        function getTeacherModals(standard) {
            return `
                <!-- Add Student Modal -->
                <div class="modal fade" id="addStudentModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add New Student to Class ${standard}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addStudentForm">
                                    <div class="mb-3">
                                        <label class="form-label">Student Name</label>
                                        <input type="text" class="form-control" id="newStudentName" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Roll Number</label>
                                        <input type="number" class="form-control" id="newStudentRoll" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Parent Email</label>
                                        <input type="email" class="form-control" id="newStudentParentEmail">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Caste Category</label>
                                        <select class="form-select" id="newStudentCaste">
                                            <option value="general">General</option>
                                            <option value="obc">OBC</option>
                                            <option value="sc">SC</option>
                                            <option value="st">ST</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="addNewStudent('${standard}')">Add Student</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Update Roll Numbers Modal -->
                <div class="modal fade" id="updateRollNumbersModal">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Update Roll Numbers for Class ${standard}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Current Roll No</th>
                                                <th>Student Name</th>
                                                <th>New Roll No</th>
                                            </tr>
                                        </thead>
                                        <tbody id="rollNumbersTable">
                                            <!-- Students will be loaded here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="updateRollNumbers('${standard}')">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upload Marks Modal -->
                <div class="modal fade" id="uploadMarksModal">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Upload Marks for Class ${standard}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Select Subject</label>
                                    <select class="form-select" id="marksSubject">
                                        <option value="math">Mathematics</option>
                                        <option value="science">Science</option>
                                        <option value="english">English</option>
                                        <option value="hindi">Hindi</option>
                                        <option value="social">Social Studies</option>
                                    </select>
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Roll No</th>
                                                <th>Student Name</th>
                                                <th>Marks (out of 100)</th>
                                            </tr>
                                        </thead>
                                        <tbody id="marksTable">
                                            <!-- Students will be loaded here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="uploadMarks('${standard}')">Upload Marks</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Send Notification Modal -->
                <div class="modal fade" id="sendNotificationModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Send Notification to Class ${standard}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="notificationForm">
                                    <div class="mb-3">
                                        <label class="form-label">Notification Title</label>
                                        <input type="text" class="form-control" id="notificationTitle" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Notification Message</label>
                                        <textarea class="form-control" id="notificationMessage" rows="4" required></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Priority</label>
                                        <select class="form-select" id="notificationPriority">
                                            <option value="low">Low</option>
                                            <option value="medium" selected>Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="sendNotification('${standard}')">Send Notification</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Change Password Modal -->
                <div class="modal fade" id="changePasswordModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Change Password</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="changePasswordForm">
                                    <div class="mb-3">
                                        <label class="form-label">Current Password</label>
                                        <input type="password" class="form-control" id="currentPassword" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">New Password</label>
                                        <input type="password" class="form-control" id="newPassword" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Confirm New Password</label>
                                        <input type="password" class="form-control" id="confirmPassword" required>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="changePassword()">Change Password</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Get principal modals HTML
        function getPrincipalModals() {
            return `
                <!-- Add User Modal -->
                <div class="modal fade" id="addUserModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add New User</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addUserForm">
                                    <div class="mb-3">
                                        <label class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="newUserName" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" id="newUserEmail" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Role</label>
                                        <select class="form-select" id="newUserRole" required>
                                            <option value="" selected disabled>Select Role</option>
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="principal">Principal</option>
                                        </select>
                                    </div>
                                    <div class="mb-3" id="newUserStandardField" style="display: none;">
                                        <label class="form-label">Standard</label>
                                        <select class="form-select" id="newUserStandard">
                                            <option value="" selected disabled>Select Standard</option>
                                            <option value="1">1st Standard</option>
                                            <option value="2">2nd Standard</option>
                                            <option value="3">3rd Standard</option>
                                            <option value="4">4th Standard</option>
                                            <option value="5">5th Standard</option>
                                            <option value="6">6th Standard</option>
                                            <option value="7">7th Standard</option>
                                            <option value="8">8th Standard</option>
                                            <option value="9">9th Standard</option>
                                            <option value="10">10th Standard</option>
                                            <option value="11">11th Standard</option>
                                            <option value="12">12th Standard</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="addNewUser()">Add User</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Manage Events Modal -->
                <div class="modal fade" id="manageEventsModal">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Manage School Events</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <button class="btn btn-primary mb-3" onclick="showAddEventForm()">
                                    <i class="fas fa-plus me-2"></i>Add New Event
                                </button>
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Location</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="eventsManagementTable">
                                            <!-- Events will be loaded here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Event Modal -->
                <div class="modal fade" id="addEventModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add New Event</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addEventForm">
                                    <div class="mb-3">
                                        <label class="form-label">Event Title</label>
                                        <input type="text" class="form-control" id="eventTitle" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Description</label>
                                        <textarea class="form-control" id="eventDescription" rows="3" required></textarea>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Date</label>
                                            <input type="date" class="form-control" id="eventDate" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Time</label>
                                            <input type="time" class="form-control" id="eventTime" required>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Location</label>
                                        <input type="text" class="form-control" id="eventLocation" required>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="addNewEvent()">Add Event</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Generate Reports Modal -->
                <div class="modal fade" id="generateReportsModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Generate Reports</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Select Report Type</label>
                                    <select class="form-select" id="reportType">
                                        <option value="attendance">Attendance Report</option>
                                        <option value="performance">Academic Performance</option>
                                        <option value="admissions">Admissions Report</option>
                                        <option value="financial">Financial Report</option>
                                    </select>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">From Date</label>
                                        <input type="date" class="form-control" id="reportFromDate">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">To Date</label>
                                        <input type="date" class="form-control" id="reportToDate">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Format</label>
                                    <select class="form-select" id="reportFormat">
                                        <option value="pdf">PDF</option>
                                        <option value="excel">Excel</option>
                                        <option value="csv">CSV</option>
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="generateReport()">Generate Report</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Teacher dashboard functions
        window.showAddStudentForm = function(standard) {
            const modal = new bootstrap.Modal(document.getElementById('addStudentModal'));
            modal.show();
        };

        window.showUpdateRollNumbers = async function(standard) {
            // Load students for the class
            try {
                const studentsQuery = query(collection(db, "users"), 
                    where("role", "==", "student"), 
                    where("standard", "==", standard));
                const studentsSnapshot = await getDocs(studentsQuery);
                
                let studentsHTML = '';
                studentsSnapshot.forEach(doc => {
                    const student = doc.data();
                    studentsHTML += `
                        <tr>
                            <td>${student.rollNo || 'N/A'}</td>
                            <td>${student.name}</td>
                            <td>
                                <input type="number" class="form-control" value="${student.rollNo || ''}" 
                                       data-id="${doc.id}">
                            </td>
                        </tr>
                    `;
                });
                
                document.getElementById('rollNumbersTable').innerHTML = studentsHTML;
                
                const modal = new bootstrap.Modal(document.getElementById('updateRollNumbersModal'));
                modal.show();
            } catch (error) {
                console.error("Error loading students for roll number update: ", error);
                alert("Error loading students. Please try again.");
            }
        };

        window.showUploadMarksForm = async function(standard) {
            // Load students for the class
            try {
                const studentsQuery = query(collection(db, "users"), 
                    where("role", "==", "student"), 
                    where("standard", "==", standard));
                const studentsSnapshot = await getDocs(studentsQuery);
                
                let marksHTML = '';
                studentsSnapshot.forEach(doc => {
                    const student = doc.data();
                    marksHTML += `
                        <tr>
                            <td>${student.rollNo || 'N/A'}</td>
                            <td>${student.name}</td>
                            <td>
                                <input type="number" class="form-control" min="0" max="100" 
                                       data-id="${doc.id}">
                            </td>
                        </tr>
                    `;
                });
                
                document.getElementById('marksTable').innerHTML = marksHTML;
                
                const modal = new bootstrap.Modal(document.getElementById('uploadMarksModal'));
                modal.show();
            } catch (error) {
                console.error("Error loading students for marks upload: ", error);
                alert("Error loading students. Please try again.");
            }
        };

        window.showSendNotificationForm = function(standard) {
            const modal = new bootstrap.Modal(document.getElementById('sendNotificationModal'));
            modal.show();
        };

        window.showChangePasswordModal = function() {
            const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
            modal.show();
        };

        // Principal dashboard functions
        window.showAddUserForm = function() {
            const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
            
            // Show/hide standard field based on role selection
            document.getElementById('newUserRole').addEventListener('change', function() {
                const standardField = document.getElementById('newUserStandardField');
                if (this.value === 'student' || this.value === 'teacher') {
                    standardField.style.display = 'block';
                } else {
                    standardField.style.display = 'none';
                }
            });
            
            modal.show();
        };

        window.showEventManagement = async function() {
            // Load events for management
            try {
                const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"));
                const eventsSnapshot = await getDocs(eventsQuery);
                
                let eventsHTML = '';
                eventsSnapshot.forEach(doc => {
                    const event = doc.data();
                    const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
                    
                    eventsHTML += `
                        <tr>
                            <td>${event.title}</td>
                            <td>${eventDate.toLocaleDateString()}</td>
                            <td>${event.time}</td>
                            <td>${event.location}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteEvent('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                document.getElementById('eventsManagementTable').innerHTML = eventsHTML;
                
                const modal = new bootstrap.Modal(document.getElementById('manageEventsModal'));
                modal.show();
            } catch (error) {
                console.error("Error loading events for management: ", error);
                alert("Error loading events. Please try again.");
            }
        };

        window.showAddEventForm = function() {
            const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
            modal.show();
        };

        window.generateReports = function() {
            const modal = new bootstrap.Modal(document.getElementById('generateReportsModal'));
            modal.show();
        };

        // Implementation of the actual functions
        window.addNewStudent = async function(standard) {
            const name = document.getElementById('newStudentName').value;
            const rollNo = document.getElementById('newStudentRoll').value;
            const parentEmail = document.getElementById('newStudentParentEmail').value;
            const caste = document.getElementById('newStudentCaste').value;
            
            if (!name || !rollNo) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                // Create student account
                const studentEmail = `student${rollNo}class${standard}@yashraj.com`;
                const password = generatePassword();
                
                const userCredential = await createUserWithEmailAndPassword(auth, studentEmail, password);
                const user = userCredential.user;
                
                // Add student data to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    email: studentEmail,
                    rollNo: parseInt(rollNo),
                    standard: standard,
                    parentEmail: parentEmail,
                    casteCategory: caste,
                    role: 'student',
                    attendance: 100, // Default attendance
                    percentage: 0, // Default percentage
                    createdAt: new Date(),
                    lastUpdated: new Date()
                });
                
                alert(`Student added successfully! Login: ${studentEmail}, Password: ${password}`);
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
                modal.hide();
                document.getElementById('addStudentForm').reset();
                
                // Refresh the dashboard
                showDashboard(currentUserData.role, currentUserData);
                
            } catch (error) {
                console.error('Error adding student:', error);
                alert('Error adding student. Please try again.');
            }
        };

        window.updateRollNumbers = async function(standard) {
            const inputs = document.querySelectorAll('#rollNumbersTable input');
            const updates = [];
            
            for (const input of inputs) {
                const newRollNo = input.value;
                const studentId = input.getAttribute('data-id');
                
                if (newRollNo && studentId) {
                    updates.push({
                        id: studentId,
                        rollNo: parseInt(newRollNo)
                    });
                }
            }
            
            if (updates.length === 0) {
                alert('No changes to save');
                return;
            }
            
            try {
                for (const update of updates) {
                    await updateDoc(doc(db, "users", update.id), {
                        rollNo: update.rollNo,
                        lastUpdated: new Date()
                    });
                }
                
                alert('Roll numbers updated successfully!');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('updateRollNumbersModal'));
                modal.hide();
                
                // Refresh the dashboard
                showDashboard(currentUserData.role, currentUserData);
                
            } catch (error) {
                console.error('Error updating roll numbers:', error);
                alert('Error updating roll numbers. Please try again.');
            }
        };

        window.uploadMarks = async function(standard) {
            const subject = document.getElementById('marksSubject').value;
            const inputs = document.querySelectorAll('#marksTable input');
            const updates = [];
            
            for (const input of inputs) {
                const marks = input.value;
                const studentId = input.getAttribute('data-id');
                
                if (marks && studentId) {
                    updates.push({
                        id: studentId,
                        marks: parseInt(marks)
                    });
                }
            }
            
            if (updates.length === 0) {
                alert('No marks to upload');
                return;
            }
            
            try {
                for (const update of updates) {
                    // Get current student data
                    const studentDoc = await getDoc(doc(db, "users", update.id));
                    const studentData = studentDoc.data();
                    
                    // Update marks for the specific subject
                    const updatedMarks = {
                        ...studentData.marks,
                        [subject]: update.marks
                    };
                    
                    // Calculate new percentage
                    const subjects = Object.keys(updatedMarks);
                    const totalMarks = subjects.reduce((sum, subj) => sum + updatedMarks[subj], 0);
                    const newPercentage = subjects.length > 0 ? Math.round(totalMarks / subjects.length) : 0;
                    
                    await updateDoc(doc(db, "users", update.id), {
                        marks: updatedMarks,
                        percentage: newPercentage,
                        lastUpdated: new Date()
                    });
                }
                
                alert('Marks uploaded successfully!');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('uploadMarksModal'));
                modal.hide();
                
            } catch (error) {
                console.error('Error uploading marks:', error);
                alert('Error uploading marks. Please try again.');
            }
        };

        window.sendNotification = async function(standard) {
            const title = document.getElementById('notificationTitle').value;
            const message = document.getElementById('notificationMessage').value;
            const priority = document.getElementById('notificationPriority').value;
            
            if (!title || !message) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                // Get students in the class
                const studentsQuery = query(collection(db, "users"), 
                    where("role", "==", "student"), 
                    where("standard", "==", standard));
                const studentsSnapshot = await getDocs(studentsQuery);
                
                // Create notification for each student
                const batch = writeBatch(db);
                
                studentsSnapshot.forEach(doc => {
                    const notificationRef = doc(collection(db, "notifications"));
                    batch.set(notificationRef, {
                        studentId: doc.id,
                        title: title,
                        message: message,
                        priority: priority,
                        timestamp: new Date(),
                        read: false
                    });
                });
                
                await batch.commit();
                
                alert('Notification sent successfully!');
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('sendNotificationModal'));
                modal.hide();
                document.getElementById('notificationForm').reset();
                
            } catch (error) {
                console.error('Error sending notification:', error);
                alert('Error sending notification. Please try again.');
            }
        };

        window.changePassword = async function() {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            if (newPassword.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }
            
            try {
                // Reauthenticate user
                // Note: In a real application, you would need to reauthenticate the user
                // This is a simplified version
                
                // Update password
                await updatePassword(currentUser, newPassword);
                
                alert('Password changed successfully!');
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                modal.hide();
                document.getElementById('changePasswordForm').reset();
                
            } catch (error) {
                console.error('Error changing password:', error);
                alert('Error changing password. Please try again.');
            }
        };

        window.addNewUser = async function() {
            const name = document.getElementById('newUserName').value;
            const email = document.getElementById('newUserEmail').value;
            const role = document.getElementById('newUserRole').value;
            const standard = document.getElementById('newUserStandard').value;
            
            if (!name || !email || !role) {
                alert('Please fill in all required fields');
                return;
            }
            
            if ((role === 'student' || role === 'teacher') && !standard) {
                alert('Please select a standard for this user');
                return;
            }
            
            try {
                const password = generatePassword();
                
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Add user data to Firestore
                const userData = {
                    name: name,
                    email: email,
                    role: role,
                    createdAt: new Date(),
                    lastUpdated: new Date()
                };
                
                if (role === 'student' || role === 'teacher') {
                    userData.standard = standard;
                    
                    if (role === 'student') {
                        userData.attendance = 100;
                        userData.percentage = 0;
                    }
                }
                
                await setDoc(doc(db, "users", user.uid), userData);
                
                alert(`User added successfully! Login: ${email}, Password: ${password}`);
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
                modal.hide();
                document.getElementById('addUserForm').reset();
                
                // Refresh the dashboard
                showDashboard(currentUserData.role, currentUserData);
                
            } catch (error) {
                console.error('Error adding user:', error);
                alert('Error adding user. Please try again.');
            }
        };

        window.addNewEvent = async function() {
            const title = document.getElementById('eventTitle').value;
            const description = document.getElementById('eventDescription').value;
            const date = document.getElementById('eventDate').value;
            const time = document.getElementById('eventTime').value;
            const location = document.getElementById('eventLocation').value;
            
            if (!title || !description || !date || !time || !location) {
                alert('Please fill in all fields');
                return;
            }
            
            try {
                await addDoc(collection(db, "events"), {
                    title: title,
                    description: description,
                    date: new Date(date),
                    time: time,
                    location: location,
                    createdAt: new Date()
                });
                
                alert('Event added successfully!');
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('addEventModal'));
                modal.hide();
                document.getElementById('addEventForm').reset();
                
                // Refresh events on the main page
                loadEvents();
                
            } catch (error) {
                console.error('Error adding event:', error);
                alert('Error adding event. Please try again.');
            }
        };

        window.deleteEvent = async function(eventId) {
            if (confirm('Are you sure you want to delete this event?')) {
                try {
                    await deleteDoc(doc(db, "events", eventId));
                    
                    alert('Event deleted successfully!');
                    
                    // Refresh the events management table
                    showEventManagement();
                    
                    // Refresh events on the main page
                    loadEvents();
                    
                } catch (error) {
                    console.error('Error deleting event:', error);
                    alert('Error deleting event. Please try again.');
                }
            }
        };

        window.generateReport = function() {
            const reportType = document.getElementById('reportType').value;
            const fromDate = document.getElementById('reportFromDate').value;
            const toDate = document.getElementById('reportToDate').value;
            const format = document.getElementById('reportFormat').value;
            
            // In a real application, this would generate an actual report
            // For this demo, we'll just show a confirmation
            alert(`Report generated successfully!\nType: ${reportType}\nFormat: ${format}\nDate Range: ${fromDate} to ${toDate}`);
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('generateReportsModal'));
            modal.hide();
        };

        // Generate random password
        function generatePassword() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let password = '';
            for (let i = 0; i < 8; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        }

        // Load admission applications for principal
        async function loadAdmissionApplications() {
            const applications = await getAdmissionApplications();
            const admissionsTable = document.getElementById('admissionsTable');
            admissionsTable.innerHTML = '';
            
            applications.forEach(app => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${app.studentName}</td>
                    <td>Class ${app.applyingFor}</td>
                    <td><span class="badge badge-caste-${app.casteCategory}">${app.casteCategory.toUpperCase()}</span></td>
                    <td>${app.entranceMarks}/100</td>
                    <td>${app.casteRank}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="approveApplication('${app.id}', '${app.studentName}', '${app.email}')">Approve</button>
                        <button class="btn btn-sm btn-danger" onclick="rejectApplication('${app.id}')">Reject</button>
                        <button class="btn btn-sm btn-info" onclick="viewApplication('${app.id}')">View</button>
                    </td>
                `;
                admissionsTable.appendChild(row);
            });
        }

        // Load student rankings for principal
        async function loadStudentRankings() {
            const students = await getStudentRankings();
            const rankingsTable = document.getElementById('rankingsTable');
            rankingsTable.innerHTML = '';
            
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.rank}</td>
                    <td>${student.name}</td>
                    <td>Class ${student.standard}</td>
                    <td><span class="badge badge-caste-${student.casteCategory || 'general'}">${(student.casteCategory || 'general').toUpperCase()}</span></td>
                    <td>${student.percentage || 0}%</td>
                `;
                rankingsTable.appendChild(row);
            });
        }

        // Approve admission application
        window.approveApplication = async function(applicationId, studentName, email) {
            if (confirm(`Are you sure you want to approve ${studentName}'s application?`)) {
                try {
                    // Update application status
                    await updateDoc(doc(db, "admissions", applicationId), {
                        status: 'approved',
                        approvedAt: new Date()
                    });
                    
                    // Create a student account
                    const password = generatePassword();
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    
                    // Add student data to Firestore
                    await setDoc(doc(db, "users", user.uid), {
                        name: studentName,
                        email: email,
                        role: 'student',
                        standard: document.querySelector(`#admissionsTable tr[data-id="${applicationId}"] td:nth-child(2)`).textContent.replace('Class ', ''),
                        casteCategory: document.querySelector(`#admissionsTable tr[data-id="${applicationId}"] td:nth-child(3) span`).textContent.toLowerCase(),
                        attendance: 100,
                        percentage: 0,
                        createdAt: new Date()
                    });
                    
                    alert(`Application approved! Student account created with password: ${password}`);
                    loadAdmissionApplications();
                    loadStudentRankings();
                    
                    // Update statistics
                    const stats = await getSchoolStatistics();
                    document.getElementById('pendingAdmissions').textContent = stats.pendingAdmissionsCount;
                } catch (error) {
                    alert('Error approving application: ' + error.message);
                }
            }
        };

        // Reject admission application
        window.rejectApplication = async function(applicationId) {
            if (confirm('Are you sure you want to reject this application?')) {
                try {
                    await updateDoc(doc(db, "admissions", applicationId), {
                        status: 'rejected',
                        rejectedAt: new Date()
                    });
                    
                    alert('Application rejected!');
                    loadAdmissionApplications();
                    
                    // Update statistics
                    const stats = await getSchoolStatistics();
                    document.getElementById('pendingAdmissions').textContent = stats.pendingAdmissionsCount;
                } catch (error) {
                    alert('Error rejecting application: ' + error.message);
                }
            }
        };

        // View application details
        window.viewApplication = async function(applicationId) {
            try {
                const docSnap = await getDoc(doc(db, "admissions", applicationId));
                if (docSnap.exists()) {
                    const app = docSnap.data();
                    alert(`Application Details:\nName: ${app.studentName}\nClass: ${app.applyingFor}\nCaste: ${app.casteCategory}\nMarks: ${app.entranceMarks}/100\nParent: ${app.parentName}\nPhone: ${app.phone}`);
                }
            } catch (error) {
                alert('Error viewing application: ' + error.message);
            }
        };

        // Filter applications by caste
        window.filterApplications = function() {
            const filter = document.getElementById('casteFilter').value;
            const rows = document.querySelectorAll('#admissionsTable tr');
            
            rows.forEach(row => {
                if (filter === 'all') {
                    row.style.display = '';
                } else {
                    const caste = row.querySelector('td:nth-child(3) span').textContent.toLowerCase();
                    row.style.display = caste === filter ? '' : 'none';
                }
            });
        };

        // Make functions globally available
        window.showImageUploadModal = showImageUploadModal;
        window.uploadProfilePhoto = uploadProfilePhoto;

