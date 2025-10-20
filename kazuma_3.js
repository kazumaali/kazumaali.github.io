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
    
    const userData = {
        username: username,
        email: email,
        profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');
    
    message.textContent = 'Account created successfully! Welcome!';
    message.style.color = 'green';
    
    document.querySelector('.login-form').classList.add('hidden');
    document.querySelector('.profile-picture').style.marginTop = '20px';
}

function checkAccess() {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    const message = document.getElementById("message");
    
    if (email && password) {
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
        
        if (email === "kazumasatou20021423@gmail.com") {
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'block';
            });
            document.getElementById('hideHire').style.display = 'block';
        }
    }
}

// Initialize everything when the page loads
window.addEventListener("load", function(){
    // Load slideshow
    startSlideshow();
    
    // Load all saved content
    loadAllContent();
    
    // Initialize edit functions
    editTxt();
    changeHire();
    socialEd();
    hideHire2();
    
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
        document.querySelector('.login-form').classList.add('hidden');
        document.querySelector('.profile-picture').style.marginTop = '20px';
        
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail === "kazumasatou20021423@gmail.com") {
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'block';
            });
            document.getElementById('hideHire').style.display = 'block';
        }
    } else {
        document.querySelector('.login-form').classList.remove('hidden');
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.style.display = 'none';
        });
        document.getElementById('hideHire').style.display = 'none';
    }
});