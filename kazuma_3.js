//SHOWING PROFILE PICTURE
function showBigImage() {
    document.getElementById("bigImageOverlay").style.display = "flex";
}

function hideBigImage() {
    document.getElementById("bigImageOverlay").style.display = "none";
}




//BACKGROUND SLIDESHOW
function startSlideshow() {
    // Get current slide index from storage or start from 0
    let currentSlideIndex = parseInt(localStorage.getItem('currentSlideIndex')) || 0;
    const slides = document.querySelectorAll(".slide");
    
    // Remove active class from all slides and set the correct one
    slides.forEach(slide => slide.classList.remove("active"));
    if (slides.length > 0) {
        slides[currentSlideIndex].classList.add("active");
        
    }
    
    // Keep your original setInterval logic but update storage
    setInterval(() => {
        const current = document.querySelector(".slide.active");
        const next = current.nextElementSibling || document.querySelector(".slide:first-child");
        
        current.classList.remove("active");
        next.classList.add("active");
        
        // Update the stored index to match the new active slide
        const newIndex = Array.from(slides).indexOf(next);
        localStorage.setItem('currentSlideIndex', newIndex);
        
    }, 10000);
}

startSlideshow();


//THE EDIT BUTTONS
const profileEd = document.getElementById("profileEd");
const profileEdi = document.getElementById("profileEdi");
const changeImg = document.getElementById("changeImg");
const changeH = document.getElementById("changeH");
const prof = document.getElementById("prof");
const name = document.getElementById("name");
const editForm = document.getElementById("editForm");

function showHide() {
    
    
   const isHidd = window.getComputedStyle(editForm).display === "none";
    
    editForm.style.display = isHidd ? "block" : "none";
    
    
}//the first one


// PROFILE PICTURE CHANGE - FIXED VERSION
function changeImg2() {
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

// NAME CHANGE - FIXED VERSION  
function changeN() {
    profileEdi.value = name.textContent;
    profileEdi.classList.remove('hidden2');
    profileEdi.focus();
    profileEdi.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            saveName();
        }
    });
    profileEdi.addEventListener("blur", () => {
        saveName();
    });
}

// Helper function to save name
function saveName() {
    if (profileEdi.value.trim() !== "") {
        name.textContent = profileEdi.value;
        localStorage.setItem('userName', profileEdi.value);
    }
    profileEdi.classList.add('hidden2');
}



//ABOUT ME BUTTON
const textBtn = document.getElementById("textBtn");
const textContent1 = document.getElementById("textContent1");

function editTxt() {
    textBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.value = textContent1.textContent;
    
    textContent1.replaceWith(input);
    input.focus();
    
    input.addEventListener("blur", () => {
        textContent1.textContent = input.value || textContent1.textContent;
        input.replaceWith(textContent1);
    });
});
}

editTxt();




//HIRE ME BUTTONS
const hireBtn = document.getElementById("hireBtn");
const hireTxt = document.getElementById("hireTxt");
let isEditing = false; // Track edit state

function changeHire() {
    hireBtn.addEventListener("click", () => {
        if (isEditing) {
            // Exit edit mode
            hireTxt.contentEditable = "false";
            isEditing = false;
            
            // Remove buttons if they exist
            const existingLinkBtn = document.getElementById("linkBtn");
            const existingSaveBtn = document.getElementById("saveBtn");
            if (existingLinkBtn) existingLinkBtn.remove();
            if (existingSaveBtn) existingSaveBtn.remove();
            
        } else {
            // Enter edit mode
            hireTxt.contentEditable = "true";
            hireTxt.focus();
            isEditing = true;
            
            // Create link buttons with IDs
            const linkBtn = document.createElement("button");
            linkBtn.textContent = "🔗 Add Link";
            linkBtn.id = "linkBtn"; // Add ID
            
            const saveBtn = document.createElement("button");
            saveBtn.textContent = "💾 Save";
            saveBtn.id = "saveBtn"; // Add ID
            
            // Add buttons below text
            hireTxt.after(linkBtn, saveBtn);
            
            // Add link functionality
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
            
            // Save
            saveBtn.addEventListener("click", () => {
                hireTxt.contentEditable = "false";
                isEditing = false;
                linkBtn.remove();
                saveBtn.remove();
            });
        }
    });
}

changeHire();




//SOCIAL MEDIA BUTTONS
const socialBtn = document.getElementById("socialBtn");
const socialAcc = document.getElementById("socialAcc");
let isEditing2 = false; // Track edit state

function socialEd() {
    socialBtn.addEventListener("click", () => {
        if (isEditing2) {
            // Exit edit mode
            socialAcc.contentEditable = "false";
            isEditing2 = false;
            
            // Remove buttons if they exist
            const existingLinkBtn2 = document.getElementById("linkBtn2");
            const existingSaveBtn2 = document.getElementById("saveBtn2");
            if (existingLinkBtn2) existingLinkBtn2.remove();
            if (existingSaveBtn2) existingSaveBtn2.remove();
            
        } else {
            // Enter edit mode
            socialAcc.contentEditable = "true";
            socialAcc.focus();
            isEditing2 = true;
            
            // Create link buttons with IDs
            const linkBtn2 = document.createElement("button");
            linkBtn2.textContent = "🔗 Add Link";
            linkBtn2.id = "linkBtn2"; // Add ID
            
            const saveBtn2 = document.createElement("button2");
            saveBtn2.textContent = "💾 Save";
            saveBtn2.id = "saveBtn2"; // Add ID
            
            // Add buttons below text
            socialAcc.after(linkBtn2, saveBtn2);
            
            // Add link functionality
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
            
            // Save
            saveBtn2.addEventListener("click", () => {
                socialAcc.contentEditable = "false";
                isEditing2 = false;
                linkBtn2.remove();
                saveBtn2.remove();
            });
        }
    });
}

socialEd();




//HIDEHIRE BUTTON
const hireMe = document.getElementById("hireMe");
const hideHire = document.getElementById("hideHire");

function hideHire2() {
    hideHire.addEventListener("click", () => {
         // Get current display value
        const currentDisplay = window.getComputedStyle(hireMe).display;
        
        // Toggle between 'none' and 'block'
        if (currentDisplay === "none") {
            hireMe.style.display = "block";
        } else {
            hireMe.style.display = "none";
        }
    });
        
}

hideHire2();




// Show/hide login/signup sections
function showLogin() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('signupSection').classList.add('hidden');
}

function showSignup() {
    document.getElementById('signupSection').classList.remove('hidden');
    document.getElementById('loginSection').classList.add('hidden');
}

// Regular signup function for normal users
function signUp() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value;
    const message = document.getElementById('message');
    
    if (!username || !email) {
        message.textContent = 'Please fill in both username and email!';
        message.style.color = 'red';
        return;
    }
    
    // Save user data
    const userData = {
        username: username,
        email: email,
        profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` // Default avatar
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');
    
    message.textContent = 'Account created successfully! Welcome!';
    message.style.color = 'green';
    
    // Hide login form after signup
    document.querySelector('.login-form').classList.add('hidden');
    document.querySelector('.profile-picture').style.marginTop = '20px';
}


function checkAccess() {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    const message = document.getElementById("message");
    
    if (email && password) {
        // For new users, create default account
        let userData = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!userData) {
            userData = {
                username: email === "kazumasatou20021423@gmail.com" ? "Kazumaali" : "Guest",
                email: email,
                profilePic: email === "kazumasatou20021423@gmail.com" ? 
                    'kazuma.png' : 
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isLoggedIn', 'true');
        
        message.textContent = 'Login successful! Welcome!';
        message.style.color = 'green';
        
        document.querySelector('.login-form').classList.add('hidden');
        document.querySelector('.profile-picture').style.marginTop = "20px";
        
        // SPECIAL: Only show edit buttons if it's YOUR email
        if (email === "kazumasatou20021423@gmail.com") {
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'block';
            });
            document.querySelectorAll('.hid2, .hid3, .hid4, .hid5').forEach(el => {
                el.style.display = 'block';
            });
            document.getElementById('hideHire').style.display = 'block';
        }
    }
}

window.addEventListener("load", function(){
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    const savedProfilePic = localStorage.getItem('profilePicture');
    const savedUserName = localStorage.getItem('userName');
    
    if (savedProfilePic) {
        document.getElementById("prof").src = savedProfilePic;
        document.getElementById("profi").src = savedProfilePic;
    }
    
    if (savedUserName) {
        document.getElementById("name").textContent = savedUserName;
    }
    
    if (isLoggedIn === 'true') {
        // User is logged in - hide login form
        document.querySelector('.login-form').classList.add('hidden');
        
        document.querySelector('.profile-picture').style.marginTop = '20px';
        
        // Check if it's the admin user
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail === "kazumasatou20021423@gmail.com") {
            // Show edit buttons only for admin
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'block';
            });
            // Show hide-hire button for admin
            document.getElementById('hideHire').style.display = 'block';
        }
    } else {
        // User is not logged in - show welcome form
        document.querySelector('.login-form').classList.remove('hidden');
        // Hide all edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.style.display = 'none';
        });
        // Hide the hide-hire button
        document.getElementById('hideHire').style.display = 'none';
    }
});