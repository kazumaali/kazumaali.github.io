//SHOWING PROFILE PICTURE
function showBigImage() {
    document.getElementById("bigImageOverlay").style.display = "flex";
}

function hideBigImage() {
    document.getElementById("bigImageOverlay").style.display = "none";
}

//BACKGROUND SLIDESHOW
function startSlideshow() {
    let currentSlideIndex = parseInt(localStorage.getItem('currentSlideIndex')) || 0;
    const slides = document.querySelectorAll(".slide");
    
    slides.forEach(slide => slide.classList.remove("active"));
    if (slides.length > 0) {
        slides[currentSlideIndex].classList.add("active");
    }
    
    setInterval(() => {
        const current = document.querySelector(".slide.active");
        const next = current.nextElementSibling || document.querySelector(".slide:first-child");
        
        current.classList.remove("active");
        next.classList.add("active");
        
        const newIndex = Array.from(slides).indexOf(next);
        localStorage.setItem('currentSlideIndex', newIndex);
    }, 10000);
}

// Save all content function
function saveAllContent() {
    const textContent1 = document.getElementById("textContent1");
    const hireTxt = document.getElementById("hireTxt");
    const socialAcc = document.getElementById("socialAcc");
    const hireMe = document.getElementById("hireMe");
    
    if (textContent1) localStorage.setItem('aboutMeContent', textContent1.innerHTML);
    if (hireTxt) localStorage.setItem('hireMeContent', hireTxt.innerHTML);
    if (socialAcc) localStorage.setItem('socialMediaContent', socialAcc.innerHTML);
    if (hireMe) {
        const hireMeDisplay = window.getComputedStyle(hireMe).display;
        localStorage.setItem('hireMeVisibility', hireMeDisplay);
    }
}

// Load all content function
function loadAllContent() {
    const textContent1 = document.getElementById("textContent1");
    const hireTxt = document.getElementById("hireTxt");
    const socialAcc = document.getElementById("socialAcc");
    const hireMe = document.getElementById("hireMe");
    
    const savedAboutMe = localStorage.getItem('aboutMeContent');
    const savedHireMe = localStorage.getItem('hireMeContent');
    const savedSocialMedia = localStorage.getItem('socialMediaContent');
    const savedHireVisibility = localStorage.getItem('hireMeVisibility');
    
    if (savedAboutMe && textContent1) {
        textContent1.innerHTML = savedAboutMe;
    }
    
    if (savedHireMe && hireTxt) {
        hireTxt.innerHTML = savedHireMe;
    }
    
    if (savedSocialMedia && socialAcc) {
        socialAcc.innerHTML = savedSocialMedia;
    }
    
    if (savedHireVisibility && hireMe) {
        hireMe.style.display = savedHireVisibility;
    }
}

//THE EDIT BUTTONS
function showHide() {
    const editForm = document.getElementById("editForm");
    const isHidd = window.getComputedStyle(editForm).display === "none";
    editForm.style.display = isHidd ? "block" : "none";
}

// PROFILE PICTURE CHANGE
function changeImg2() {
    const profileEd = document.getElementById("profileEd");
    const prof = document.getElementById("prof");
    const profi = document.getElementById("profi");
    
    profileEd.click();
    profileEd.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                prof.src = e.target.result;
                profi.src = e.target.result;
                localStorage.setItem('profilePicture', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

// NAME CHANGE  
function changeN() {
    const profileEdi = document.getElementById("profileEdi");
    const name = document.getElementById("name");
    
    profileEdi.value = name.textContent;
    profileEdi.classList.remove('hidden2');
    profileEdi.focus();
    
    const saveName = () => {
        if (profileEdi.value.trim() !== "") {
            name.textContent = profileEdi.value;
            localStorage.setItem('userName', profileEdi.value);
        }
        profileEdi.classList.add('hidden2');
    };
    
    profileEdi.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            saveName();
        }
    });
    profileEdi.addEventListener("blur", saveName);
}

//ABOUT ME BUTTON
function editTxt() {
    const textBtn = document.getElementById("textBtn");
    const textContent1 = document.getElementById("textContent1");
    
    textBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.value = textContent1.textContent;
        
        textContent1.replaceWith(input);
        input.focus();
        
        const saveText = () => {
            textContent1.textContent = input.value || textContent1.textContent;
            input.replaceWith(textContent1);
            saveAllContent();
        };
        
        input.addEventListener("blur", saveText);
        input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                saveText();
            }
        });
    });
}

//HIRE ME BUTTONS
function changeHire() {
    const hireBtn = document.getElementById("hireBtn");
    const hireTxt = document.getElementById("hireTxt");
    let isEditing = false;

    hireBtn.addEventListener("click", () => {
        if (isEditing) {
            hireTxt.contentEditable = "false";
            isEditing = false;
            
            const existingLinkBtn = document.getElementById("linkBtn");
            const existingSaveBtn = document.getElementById("saveBtn");
            if (existingLinkBtn) existingLinkBtn.remove();
            if (existingSaveBtn) existingSaveBtn.remove();
            
            saveAllContent();
        } else {
            hireTxt.contentEditable = "true";
            hireTxt.focus();
            isEditing = true;
            
            const linkBtn = document.createElement("button");
            linkBtn.textContent = "🔗 Add Link";
            linkBtn.id = "linkBtn";
            
            const saveBtn = document.createElement("button");
            saveBtn.textContent = "💾 Save";
            saveBtn.id = "saveBtn";
            
            hireTxt.after(linkBtn, saveBtn);
            
            linkBtn.addEventListener("click", () => {
                const selectedText = window.getSelection().toString();
                if (selectedText) {
                    const url = prompt("Enter URL for: " + selectedText);
                    if (url) {
                        document.execCommand('createLink', false, url);
                    }
                } else {
                    alert("First select some text to link");
                }
            });
            
            saveBtn.addEventListener("click", () => {
                hireTxt.contentEditable = "false";
                isEditing = false;
                linkBtn.remove();
                saveBtn.remove();
                saveAllContent();
            });
        }
    });
}

//SOCIAL MEDIA BUTTONS
function socialEd() {
    const socialBtn = document.getElementById("socialBtn");
    const socialAcc = document.getElementById("socialAcc");
    let isEditing2 = false;

    socialBtn.addEventListener("click", () => {
        if (isEditing2) {
            socialAcc.contentEditable = "false";
            isEditing2 = false;
            
            const existingLinkBtn2 = document.getElementById("linkBtn2");
            const existingSaveBtn2 = document.getElementById("saveBtn2");
            if (existingLinkBtn2) existingLinkBtn2.remove();
            if (existingSaveBtn2) existingSaveBtn2.remove();
            
            saveAllContent();
        } else {
            socialAcc.contentEditable = "true";
            socialAcc.focus();
            isEditing2 = true;
            
            const linkBtn2 = document.createElement("button");
            linkBtn2.textContent = "🔗 Add Link";
            linkBtn2.id = "linkBtn2";
            
            const saveBtn2 = document.createElement("button");
            saveBtn2.textContent = "💾 Save";
            saveBtn2.id = "saveBtn2";
            
            socialAcc.after(linkBtn2, saveBtn2);
            
            linkBtn2.addEventListener("click", () => {
                const selectedText2 = window.getSelection().toString();
                if (selectedText2) {
                    const url = prompt("Enter URL for: " + selectedText2);
                    if (url) {
                        document.execCommand('createLink', false, url);
                    }
                } else {
                    alert("First select some text to link");
                }
            });
            
            saveBtn2.addEventListener("click", () => {
                socialAcc.contentEditable = "false";
                isEditing2 = false;
                linkBtn2.remove();
                saveBtn2.remove();
                saveAllContent();
            });
        }
    });
}

//HIDEHIRE BUTTON
function hideHire2() {
    const hideHire = document.getElementById("hideHire");
    const hireMe = document.getElementById("hireMe");
    
    hideHire.addEventListener("click", () => {
        const currentDisplay = window.getComputedStyle(hireMe).display;
        
        if (currentDisplay === "none") {
            hireMe.style.display = "block";
        } else {
            hireMe.style.display = "none";
        }
        
        localStorage.setItem('hireMeVisibility', hireMe.style.display);
    });
}

// Show/hide login/signup sections
function showLogin() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('signupSection').classList.add('hidden');
}

function showSignup() {
    document.getElementById('signupSection').classList.remove('hidden');
    document.getElementById('loginSection').classList.add('hidden');
}

// ========== EMAIL VERIFICATION SYSTEM ========== //
let emailVerificationCode = null;
let pendingUserData = null;

// Initialize EmailJS
function initEmailJS() {
    emailjs.init("d3oDpvpHsE4_0H-dq");
}

// Generate random verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, username) {
    try {
        const verificationCode = generateVerificationCode();
        
        const templateParams = {
            to_email: email,
            to_name: username,
            verification_code: verificationCode,
            website_name: "Kazuma Ali Website",
            from_name: "Kazuma Ali"
        };

        const response = await emailjs.send(
            "service_t07qw3s",
            "template_g220aut",
            templateParams
        );

        console.log('Verification email sent successfully:', response);
        return verificationCode;
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email. Please try again.');
    }
}

// Enhanced signup function with email verification
async function signUp() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const message = document.getElementById('message');

    // Validation
    if (!username || !email || !password) {
        message.textContent = 'Please fill in all fields!';
        message.style.color = 'red';
        return;
    }

    if (username.length < 3) {
        message.textContent = 'Username must be at least 3 characters long!';
        message.style.color = 'red';
        return;
    }

    if (password.length < 6) {
        message.textContent = 'Password must be at least 6 characters long!';
        message.style.color = 'red';
        return;
    }

    if (!isValidEmail(email)) {
        message.textContent = 'Please enter a valid email address!';
        message.style.color = 'red';
        return;
    }

    // Check if email already exists
    if (isEmailTaken(email)) {
        message.textContent = 'This email is already registered!';
        message.style.color = 'red';
        return;
    }

    // Check if username already exists
    if (isUsernameTaken(username)) {
        message.textContent = 'This username is already taken!';
        message.style.color = 'red';
        return;
    }

    try {
        message.textContent = 'Sending verification code...';
        message.style.color = 'blue';

        // Send verification email
        const verificationCode = await sendVerificationEmail(email, username);

        // Store verification data
        emailVerificationCode = verificationCode;
        pendingUserData = {
            username: username,
            email: email,
            password: hashPassword(password),
            profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            verified: false,
            createdAt: new Date().toISOString()
        };

        // Show verification section
        showVerificationSection();
        message.textContent = 'Verification code sent to your email!';
        message.style.color = 'green';

    } catch (error) {
        message.textContent = error.message;
        message.style.color = 'red';
    }
}

// Show verification input section
function showVerificationSection() {
    document.getElementById('signupSection').classList.add('hidden');
    
    // Create verification section if it doesn't exist
    let verificationSection = document.getElementById('verificationSection');
    if (!verificationSection) {
        verificationSection = document.createElement('div');
        verificationSection.id = 'verificationSection';
        verificationSection.className = 'auth-section';
        verificationSection.innerHTML = `
            <h4>Verify Your Email</h4>
            <p>We sent a 6-digit code to your email</p>
            <input type="text" id="verificationCode" placeholder="Enter verification code" maxlength="6">
            <button onclick="verifyEmail()">Verify Email</button>
            <button onclick="resendVerificationCode()" class="resend-btn">Resend Code</button>
            <button onclick="cancelVerification()" class="cancel-btn">Cancel</button>
        `;
        document.querySelector('.login-form').appendChild(verificationSection);
    }
    
    verificationSection.classList.remove('hidden');
    document.getElementById('verificationCode').focus();
}

// Verify email with code
function verifyEmail() {
    const enteredCode = document.getElementById('verificationCode').value.trim();
    const message = document.getElementById('message');

    if (!enteredCode) {
        message.textContent = 'Please enter the verification code!';
        message.style.color = 'red';
        return;
    }

    if (enteredCode === emailVerificationCode) {
        // Mark user as verified and save
        pendingUserData.verified = true;
        saveUser(pendingUserData);
        

        // Update UI state
        updateLoginState();
        
        // Clear verification data
        emailVerificationCode = null;
        pendingUserData = null;
        
        // Remove verification section
        const verificationSection = document.getElementById('verificationSection');
        if (verificationSection) {
            verificationSection.remove();
        }

    } else {
        message.textContent = 'Invalid verification code! Please try again.';
        message.style.color = 'red';
    }
}

// Resend verification code
async function resendVerificationCode() {
    const message = document.getElementById('message');
    
    if (!pendingUserData) {
        message.textContent = 'No pending verification found. Please sign up again.';
        message.style.color = 'red';
        return;
    }

    try {
        message.textContent = 'Resending verification code...';
        message.style.color = 'blue';

        const newCode = await sendVerificationEmail(pendingUserData.email, pendingUserData.username);
        emailVerificationCode = newCode;

        message.textContent = 'New verification code sent!';
        message.style.color = 'green';

    } catch (error) {
        message.textContent = error.message;
        message.style.color = 'red';
    }
}

// Cancel verification process
function cancelVerification() {
    emailVerificationCode = null;
    pendingUserData = null;
    
    const verificationSection = document.getElementById('verificationSection');
    if (verificationSection) {
        verificationSection.remove();
    }
    
    document.getElementById('signupSection').classList.remove('hidden');
    document.getElementById('message').textContent = '';
}

// Enhanced user storage system
function saveUser(userData) {
    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem('websiteUsers')) || [];
    
    // Add new user
    users.push(userData);
    
    // Save to localStorage
    localStorage.setItem('websiteUsers', JSON.stringify(users));
    
    // Set as current user
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('isLoggedIn', 'true');
}

// Check if email is already taken
function isEmailTaken(email) {
    const users = JSON.parse(localStorage.getItem('websiteUsers')) || [];
    return users.some(user => user.email === email && user.verified);
}

// Check if username is already taken
function isUsernameTaken(username) {
    const users = JSON.parse(localStorage.getItem('websiteUsers')) || [];
    return users.some(user => user.username === username && user.verified);
}

// Enhanced login function
function checkAccess() {
    const email = document.getElementById("emailInput").value.trim().toLowerCase();
    const password = document.getElementById("passwordInput").value;
    const message = document.getElementById("message");
    
    if (!email || !password) {
        message.textContent = 'Please fill in both email and password!';
        message.style.color = 'red';
        return;
    }

    // Special case for admin email (bypass verification for admin)
    if (email === "kazumasatou20021423@gmail.com") {
        let userData = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!userData) {
            userData = {
                username: "Kazumaali",
                email: email,
                profilePic: 'kazuma.png',
                verified: true
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isLoggedIn', 'true');
        
        
        // Update UI state
        updateLoginState();
        
        // Clear login form
        document.getElementById("emailInput").value = '';
        document.getElementById("passwordInput").value = '';
        
        return;
    }

    const users = JSON.parse(localStorage.getItem('websiteUsers')) || [];
    const user = users.find(u => u.email === email);

    if (!user) {
        message.textContent = 'No account found with this email!';
        message.style.color = 'red';
        return;
    }

    // Password verification
    if (user.password !== hashPassword(password)) {
        message.textContent = 'Invalid password!';
        message.style.color = 'red';
        return;
    }

    if (!user.verified) {
        message.textContent = 'Please verify your email before logging in!';
        message.style.color = 'red';
        
        // Allow resending verification for unverified users
        pendingUserData = user;
        showVerificationSection();
        return;
    }

    // Successful login
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('isLoggedIn', 'true');
    
    
    // Update UI state
    updateLoginState();
    
    // Clear login form
    document.getElementById("emailInput").value = '';
    document.getElementById("passwordInput").value = '';
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function hashPassword(password) {
    // Simple hash for demo purposes
    return btoa(password).split('').reverse().join('');
}

// ========== LOGOUT FUNCTIONALITY ========== //

// Logout function
function logout() {
    // Clear current user session
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isLoggedIn');
    
    // Don't clear websiteUsers - we want to keep registered users
    // Don't clear profile picture, name, or other settings
    
    // Show success message
    const message = document.getElementById('message');
    message.textContent = 'Logged out successfully!';
    message.style.color = 'green';
    
    // Reset UI to logged out state
    resetToLoggedOutState();
    
    // Reload page after a short delay
    setTimeout(() => {
        location.reload();
    }, 1500);
}

// Reset UI to logged out state
function resetToLoggedOutState() {
    // Hide logged in section, show login/signup options
    document.getElementById('loggedInSection').classList.add('hidden');
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('signupSection').classList.add('hidden');
    
    // Show auth buttons
    document.querySelector('.auth-buttons').style.display = 'flex';
    
    // Hide edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.style.display = 'none';
    });
    
    // Hide hideHire button
    document.getElementById('hideHire').style.display = 'none';
    
    // Remove any verification section
    const verificationSection = document.getElementById('verificationSection');
    if (verificationSection) {
        verificationSection.remove();
    }
}

// Update login state display
function updateLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (isLoggedIn === 'true' && currentUser) {
        // User is logged in - show logged in section
        document.querySelector('.auth-buttons').style.display = 'none';
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('signupSection').classList.add('hidden');
        
        // Show logged in section
        document.getElementById('loggedInSection').classList.remove('hidden');
        document.getElementById('welcomeUser').textContent = currentUser.username;
        
        // Show/hide edit buttons based on admin status
        if (currentUser.email === "kazumasatou20021423@gmail.com") {
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'block';
            });
            document.getElementById('hideHire').style.display = 'block';
        } else {
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'none';
            });
            document.getElementById('hideHire').style.display = 'none';
        }
        
    } else {
        // User is not logged in - show login/signup options
        document.querySelector('.auth-buttons').style.display = 'flex';
        document.getElementById('loggedInSection').classList.add('hidden');
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.style.display = 'none';
        });
        document.getElementById('hideHire').style.display = 'none';
    }
}

// Initialize everything when the page loads
window.addEventListener("load", function(){
    // Initialize EmailJS
    initEmailJS();
    
    // Load slideshow
    startSlideshow();
    
    // Load all saved content
    loadAllContent();
    
    // Initialize edit functions
    editTxt();
    changeHire();
    socialEd();
    hideHire2();
    
    // Update login state
    updateLoginState();
    
    const savedProfilePic = localStorage.getItem('profilePicture');
    const savedUserName = localStorage.getItem('userName');
    
    if (savedProfilePic) {
        document.getElementById("prof").src = savedProfilePic;
        document.getElementById("profi").src = savedProfilePic;
    }
    
    if (savedUserName) {
        document.getElementById("name").textContent = savedUserName;
    }
});
