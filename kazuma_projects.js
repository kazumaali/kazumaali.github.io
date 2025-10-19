// PROJECTS SYSTEM

// MEDIA HANDLING
let selectedMedia = [];

// SECURITY: Enhanced admin verification
function isAdmin() {
    const savedEmail = localStorage.getItem('userEmail');
    return savedEmail === "kazumasatou20021423@gmail.com";
}

// SECURITY: Prevent function execution for non-admins
function requireAdmin(actionName = "perform this action") {
    if (!isAdmin()) {
        console.warn(`Security: Non-admin attempted ${actionName}`);
        alert('Access denied: Admin privileges required');
        return false;
    }
    return true;
}

// SECURITY: Remove admin features from DOM for non-admins
function secureAdminFeatures() {
    if (!isAdmin()) {
        // Remove create project section completely
        const createSection = document.getElementById('createProjectSection');
        if (createSection) createSection.remove();
        
        // Remove add project button
        const addBtn = document.getElementById('addProjectBtn');
        if (addBtn) addBtn.remove();
        
        // Remove any admin buttons from projects
        document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => {
            btn.remove();
        });
    }
}

// Handle media file selection
document.addEventListener('DOMContentLoaded', function() {
    const mediaUpload = document.getElementById('mediaUpload');
    if (mediaUpload) {
        mediaUpload.addEventListener('change', handleMediaSelect);
    }
    checkProjectsAccess();
});

function handleMediaSelect(event) {
    const files = event.target.files;
    const preview = document.getElementById('mediaPreview');
    preview.innerHTML = '';
    selectedMedia = [];
    
    for (let file of files) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            selectedMedia.push({
                type: file.type.startsWith('image') ? 'image' : 'video',
                data: e.target.result,
                name: file.name
            });
            
            // Create preview
            const mediaElement = document.createElement(file.type.startsWith('image') ? 'img' : 'video');
            mediaElement.src = e.target.result;
            mediaElement.className = 'media-preview-item';
            
            if (file.type.startsWith('video')) {
                mediaElement.controls = true;
            }
            
            preview.appendChild(mediaElement);
        };
        
        reader.readAsDataURL(file);
    }
}

function checkProjectsAccess() {
    // SECURITY: Remove admin features from DOM first
    secureAdminFeatures();
    
    const savedEmail = localStorage.getItem('userEmail');
    const isAdminUser = isAdmin();
    
    if (isAdminUser) {
        document.getElementById('addProjectBtn').style.display = 'block';
        document.getElementById('createProjectSection').style.display = 'block';
    } else {
        document.getElementById('addProjectBtn').style.display = 'none';
        document.getElementById('createProjectSection').style.display = 'none';
    }
    
    loadProjects();
}

// Toggle create project section
function toggleCreateProject() {
    const createSection = document.getElementById('createProjectSection');
    const isVisible = createSection.style.display === 'block';
    
    createSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        document.getElementById('projectContent').value = '';
        document.getElementById('mediaUpload').value = '';
        document.getElementById('mediaPreview').innerHTML = '';
        selectedMedia = [];
        document.getElementById('projectContent').focus();
    }
}

// Create a new project
function createProject() {
    if (!requireAdmin("create project")) return;
    
    const content = document.getElementById('projectContent').value.trim();
    
    if (!content && selectedMedia.length === 0) {
        alert('Please write something or add media!');
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    const newProject = {
        id: Date.now(),
        content: content,
        media: selectedMedia,
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        author: 'Kazuma Ali',
        ratings: [],
        averageRating: 0
    };
    
    projects.unshift(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    document.getElementById('projectContent').value = '';
    document.getElementById('mediaUpload').value = '';
    document.getElementById('mediaPreview').innerHTML = '';
    selectedMedia = [];
    document.getElementById('createProjectSection').style.display = 'none';
    
    loadProjects();
    alert('Project added successfully!');
}

function loadProjects() {
    const projectsContainer = document.getElementById('projectsList');
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    // SECURITY: Remove admin features from DOM
    secureAdminFeatures();
    
    if (projects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-projects">
                <h3>No projects yet</h3>
            </div>
        `;
        return;
    }
    
    // Clear container
    projectsContainer.innerHTML = '';
    
    // Create project elements
    projects.forEach(project => {
        const projectElement = createProjectElement(project, isAdmin()); // SECURITY: Use isAdmin() function
        projectsContainer.appendChild(projectElement);
    });
}

// Create a project element
function createProjectElement(project, isAdmin) {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project-post';
    projectDiv.setAttribute('data-project-id', project.id);
    
    // Calculate average rating
    const avgRating = calculateAverageRating(project.ratings);
    const userRating = getUserRating(project.id);
    
    // Create project content using DOM methods instead of innerHTML
    const projectContent = document.createElement('div');
    projectContent.className = 'project-content';
    
    // Add project text content
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = formatProjectContent(project.content);
    projectContent.appendChild(contentDiv);
    
    // Add rating section
    const ratingSection = document.createElement('div');
    ratingSection.className = 'rating-section';
    
    const ratingStats = document.createElement('div');
    ratingStats.className = 'rating-stats';
    
    const averageRating = document.createElement('span');
    averageRating.className = 'average-rating';
    averageRating.textContent = avgRating.toFixed(1);
    
    const ratingCount = document.createElement('span');
    ratingCount.className = 'rating-count';
    ratingCount.textContent = `(${project.ratings ? project.ratings.length : 0} ratings)`;
    
    ratingStats.appendChild(averageRating);
    ratingStats.appendChild(ratingCount);
    
    const starRating = document.createElement('div');
    starRating.className = 'star-rating';
    starRating.innerHTML = generateStarRating(project.id, userRating);
    
    ratingSection.appendChild(ratingStats);
    ratingSection.appendChild(starRating);
    projectContent.appendChild(ratingSection);
    
    // Add media if exists
    if (project.media && project.media.length > 0) {
        const projectMedia = document.createElement('div');
        projectMedia.className = 'project-media';
        
        project.media.forEach(media => {
            let mediaElement;
            if (media.type === 'image') {
                mediaElement = document.createElement('img');
                mediaElement.src = media.data;
            } else {
                mediaElement = document.createElement('video');
                mediaElement.src = media.data;
                mediaElement.controls = true;
            }
            mediaElement.className = 'project-media-item';
            mediaElement.alt = media.name;
            projectMedia.appendChild(mediaElement);
        });
        
        projectContent.appendChild(projectMedia);
    }
    
    projectDiv.appendChild(projectContent);
    
    // Add comment section
    const commentSection = document.createElement('div');
    commentSection.className = 'comment-section';
    
    const commentForm = document.createElement('div');
    commentForm.className = 'comment-form';
    
    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.className = 'comment-input';
    commentInput.placeholder = 'Write a comment...';
    commentInput.addEventListener('keypress', (event) => handleProjectCommentKeypress(event, project.id));
    
    const commentBtn = document.createElement('button');
    commentBtn.className = 'comment-btn';
    commentBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    commentBtn.addEventListener('click', () => addProjectComment(project.id));
    
    commentForm.appendChild(commentInput);
    commentForm.appendChild(commentBtn);
    commentSection.appendChild(commentForm);
    
    const commentsList = document.createElement('div');
    commentsList.className = 'comments-list';
    commentsList.id = `comments-${project.id}`;
    commentsList.innerHTML = loadProjectComments(project.id);
    commentSection.appendChild(commentsList);
    
    projectDiv.appendChild(commentSection);
    
    // Add admin actions
    if (isAdmin) {
        const projectActions = document.createElement('div');
        projectActions.className = 'project-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.addEventListener('click', () => editProject(project.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.addEventListener('click', () => deleteProject(project.id));
        
        projectActions.appendChild(editBtn);
        projectActions.appendChild(deleteBtn);
        projectDiv.appendChild(projectActions);
    }
    
    return projectDiv;
}

// Format project content (preserve line breaks)
function formatProjectContent(content) {
    return content.replace(/\n/g, '<br>');
}

// Calculate average rating
function calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    return sum / ratings.length;
}

// Get user's rating for a project
function getUserRating(projectId) {
    const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
    return userRatings[`project_${projectId}`] || 0;
}

// Generate star rating HTML
function generateStarRating(projectId, userRating) {
    let starsHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const isActive = i <= userRating;
        starsHTML += `
            <span class="star ${isActive ? 'active' : ''}" 
                  onclick="rateProject(${projectId}, ${i})"
                  onmouseover="highlightStars(${i}, ${projectId})"
                  onmouseout="resetStars(${userRating}, ${projectId})">
                ★
            </span>
        `;
    }
    
    return starsHTML;
}

// Rate a project
function rateProject(projectId, rating) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'Guest' };
    
    // Initialize ratings array if it doesn't exist
    if (!projects[projectIndex].ratings) {
        projects[projectIndex].ratings = [];
    }
    
    // Check if user already rated this project
    const existingRatingIndex = projects[projectIndex].ratings.findIndex(
        r => r.user === currentUser.username
    );
    
    if (existingRatingIndex !== -1) {
        // Update existing rating
        projects[projectIndex].ratings[existingRatingIndex].rating = rating;
    } else {
        // Add new rating
        projects[projectIndex].ratings.push({
            user: currentUser.username,
            rating: rating
        });
    }
    
    // Save user rating
    const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
    userRatings[`project_${projectId}`] = rating;
    localStorage.setItem('userRatings', JSON.stringify(userRatings));
    
    // Save projects
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Reload projects
    loadProjects();
}

// Highlight stars on hover
function highlightStars(count, projectId) {
    const stars = document.querySelectorAll(`[data-project-id="${projectId}"] .star`);
    
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.add('hover');
        } else {
            star.classList.remove('hover');
        }
    });
}

// Reset stars after hover
function resetStars(rating, projectId) {
    const stars = document.querySelectorAll(`[data-project-id="${projectId}"] .star`);
    
    stars.forEach((star, index) => {
        star.classList.remove('hover');
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// EDIT PROJECT FUNCTIONALITY
function editProject(projectId) {
    
    if (!requireAdmin("edit project")) return;
        
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === projectId);
    
    if (!project) return;
    
    const projectElement = document.querySelector(`[data-project-id="${projectId}"]`);
    
    projectElement.innerHTML = `
        <div class="edit-project-form">
            <textarea class="edit-content-input">${escapeHtml(project.content)}</textarea>
            <div class="edit-actions">
                <button class="save-edit-btn" onclick="saveProjectEdit(${projectId})">
                    <i class="fas fa-save"></i> Save Changes
                </button>
                <button class="cancel-edit-btn" onclick="cancelProjectEdit(${projectId})">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    // Focus on the content field
    projectElement.querySelector('.edit-content-input').focus();
}

// SAVE EDITED PROJECT
function saveProjectEdit(projectId) {
    // SECURITY: Admin verification
    if (!requireAdmin("save project edit")) return;
    
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return;
    
    const newContent = document.querySelector(`[data-project-id="${projectId}"] .edit-content-input`).value.trim();
    
    if (!newContent) {
        alert('Please write something!');
        return;
    }
    
    // Update the project
    projects[projectIndex].content = newContent;
    projects[projectIndex].date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) + ' (edited)';
    
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
    
    alert('Project updated successfully!');
}

// CANCEL EDIT
function cancelProjectEdit(projectId) {
    loadProjects(); // Just reload to show original project
}

// DELETE PROJECT
function deleteProject(projectId) {
    
    if (!requireAdmin("delete project")) return;
    
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const updatedProjects = projects.filter(project => project.id !== projectId);
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    loadProjects();
    
    alert('Project deleted successfully!');
}

// Helper function to prevent HTML injection
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize projects when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkProjectsAccess();
    
    if (typeof startSlideshow === 'function') {
        startSlideshow();
    }
});

// PROJECT COMMENTS SYSTEM
function loadProjectComments(projectId) {
    const comments = JSON.parse(localStorage.getItem(`project-comments-${projectId}`)) || [];
    if (comments.length === 0) {
        return '<p class="no-comments">No comments yet. Be the first to comment!</p>';
    }
    
    return comments.map(comment => `
        <div class="comment" data-comment-id="${comment.id}">
            <div class="comment-header">
                <img src="${comment.authorPic}" class="comment-profile-pic" alt="${comment.author}">
                <div class="comment-user-info">
                    <span class="comment-author">${escapeHtml(comment.author)}</span>
                    <span class="comment-time">${comment.time}</span>
                </div>
                ${canDeleteContent(comment.author) ? `
                    <button class="delete-comment-btn" onclick="deleteProjectComment(${projectId}, ${comment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            
            <!-- REPLY SECTION -->
            <div class="reply-section">
                <button class="reply-btn" onclick="toggleProjectReplyForm(${projectId}, ${comment.id})">
                    <i class="fas fa-reply"></i> Reply
                </button>
                
                <div class="reply-form" id="reply-form-${projectId}-${comment.id}" style="display: none;">
                    <input type="text" class="reply-input" placeholder="Write a reply..."
                           onkeypress="handleProjectReplyKeypress(event, ${projectId}, ${comment.id})">
                    <button class="reply-submit-btn" onclick="addProjectReply(${projectId}, ${comment.id})">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                
                <!-- REPLIES LIST - RECURSIVE -->
                <div class="replies-list">
                    ${comment.replies && comment.replies.length > 0 ? 
                        renderProjectReplies(comment.replies, projectId, comment.id, 1) : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// NEW RECURSIVE FUNCTION FOR INFINITE REPLY CHAINS
function renderProjectReplies(replies, projectId, parentCommentId, depthLevel) {
    return replies.map(reply => `
        <div class="reply reply-level-${depthLevel}" data-reply-id="${reply.id}">
            <div class="reply-header">
                <img src="${reply.authorPic}" class="reply-profile-pic" alt="${reply.author}">
                <div class="reply-user-info">
                    <span class="reply-author">${escapeHtml(reply.author)}</span>
                    <span class="reply-time">${reply.time}</span>
                </div>
                ${canDeleteContent(reply.author) ? `
                    <button class="delete-reply-btn" onclick="deleteProjectReply(${projectId}, ${parentCommentId}, ${reply.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
            <div class="reply-text">${escapeHtml(reply.text)}</div>
            
            <!-- REPLY TO REPLY BUTTON -->
            <div class="reply-actions">
                <button class="reply-btn" onclick="toggleProjectReplyToReplyForm(${projectId}, ${parentCommentId}, ${reply.id})">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
            
            <!-- REPLY TO REPLY FORM -->
            <div class="reply-to-reply-form" id="reply-to-reply-${projectId}-${parentCommentId}-${reply.id}" style="display: none;">
                <input type="text" class="reply-input" placeholder="Write a reply..."
                       onkeypress="handleProjectReplyToReplyKeypress(event, ${projectId}, ${parentCommentId}, ${reply.id})">
                <button class="reply-submit-btn" onclick="addProjectReplyToReply(${projectId}, ${parentCommentId}, ${reply.id})">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            
            <!-- NESTED REPLIES - RECURSIVE CALL -->
            ${reply.replies && reply.replies.length > 0 ? 
                renderProjectReplies(reply.replies, projectId, parentCommentId, depthLevel + 1) : ''}
        </div>
    `).join('');
}

function addProjectComment(projectId) {
    const projectElement = document.querySelector(`[data-project-id="${projectId}"]`);
    const commentInput = projectElement.querySelector('.comment-input');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('Please write a comment!');
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`project-comments-${projectId}`)) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: 'Guest',
        profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
    };
    
    const newComment = {
        id: Date.now(),
        author: currentUser.username,
        authorPic: currentUser.profilePic,
        text: commentText,
        time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        replies: []
    };
    
    comments.push(newComment);
    localStorage.setItem(`project-comments-${projectId}`, JSON.stringify(comments));
    
    commentInput.value = '';
    document.getElementById(`comments-${projectId}`).innerHTML = loadProjectComments(projectId);
}

// PROJECT REPLY FUNCTIONS
function toggleProjectReplyForm(projectId, commentId) {
    const replyForm = document.getElementById(`reply-form-${projectId}-${commentId}`);
    if (replyForm) {
        replyForm.style.display = replyForm.style.display === 'none' ? 'flex' : 'none';
    }
}

function addProjectReply(projectId, commentId) {
    const replyInput = document.querySelector(`#reply-form-${projectId}-${commentId} .reply-input`);
    const replyText = replyInput.value.trim();
    
    if (!replyText) {
        alert('Please write a reply!');
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`project-comments-${projectId}`)) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: 'Guest',
        profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
    };
    
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        if (!comment.replies) comment.replies = [];
        
        const newReply = {
            id: Date.now(),
            author: currentUser.username,
            authorPic: currentUser.profilePic,
            text: replyText,
            time: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        comment.replies.push(newReply);
        localStorage.setItem(`project-comments-${projectId}`, JSON.stringify(comments));
        
        replyInput.value = '';
        document.getElementById(`comments-${projectId}`).innerHTML = loadProjectComments(projectId);
    }
}

function handleProjectCommentKeypress(event, projectId) {
    if (event.key === 'Enter') {
        addProjectComment(projectId);
    }
}

function handleProjectReplyKeypress(event, projectId, commentId) {
    if (event.key === 'Enter') {
        addProjectReply(projectId, commentId);
    }
}

// PROJECT REPLY TO REPLY FUNCTIONS
function toggleProjectReplyToReplyForm(projectId, commentId, replyId) {
    const form = document.getElementById(`reply-to-reply-${projectId}-${commentId}-${replyId}`);
    if (form) {
        form.style.display = form.style.display === 'none' ? 'flex' : 'none';
    }
}
    
function addProjectReplyToReply(projectId, commentId, parentReplyId) {
    const replyInput = document.querySelector(`#reply-to-reply-${projectId}-${commentId}-${parentReplyId} .reply-input`);
    const replyText = replyInput.value.trim();
    
    if (!replyText) {
        alert('Please write a reply!');
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`project-comments-${projectId}`)) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: 'Guest',
        profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
    };
    
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.replies) {
        // Function to recursively find parent reply and add nested reply
        function addNestedReply(replies, targetId) {
            for (let reply of replies) {
                if (reply.id === targetId) {
                    if (!reply.replies) reply.replies = [];
                    const newReply = {
                        id: Date.now(),
                        author: currentUser.username,
                        authorPic: currentUser.profilePic,
                        text: replyText,
                        time: new Date().toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        }),
                        replies: []
                    };
                    reply.replies.push(newReply);
                    return true;
                }
                if (reply.replies) {
                    if (addNestedReply(reply.replies, targetId)) return true;
                }
            }
            return false;
        }
        
        addNestedReply(comment.replies, parentReplyId);
        localStorage.setItem(`project-comments-${projectId}`, JSON.stringify(comments));
        
        replyInput.value = '';
        document.getElementById(`comments-${projectId}`).innerHTML = loadProjectComments(projectId);
    }
}

function handleProjectReplyToReplyKeypress(event, projectId, commentId, replyId) {
    if (event.key === 'Enter') {
        addProjectReplyToReply(projectId, commentId, replyId);
    }
}

// PROJECT DELETE FUNCTIONS
function deleteProjectComment(projectId, commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`project-comments-${projectId}`)) || [];
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    
    localStorage.setItem(`project-comments-${projectId}`, JSON.stringify(updatedComments));
    document.getElementById(`comments-${projectId}`).innerHTML = loadProjectComments(projectId);
}

function deleteProjectReply(projectId, commentId, replyId) {
    if (!confirm('Are you sure you want to delete this reply?')) {
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`project-comments-${projectId}`)) || [];
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
        // Function to recursively find and delete reply
        function deleteReplyFromReplies(replies, targetId) {
            return replies.filter(reply => {
                if (reply.id === targetId) {
                    return false; // Remove the target reply
                }
                if (reply.replies) {
                    reply.replies = deleteReplyFromReplies(reply.replies, targetId);
                }
                return true;
            });
        }
        
        comment.replies = deleteReplyFromReplies(comment.replies || [], replyId);
        localStorage.setItem(`project-comments-${projectId}`, JSON.stringify(comments));
        document.getElementById(`comments-${projectId}`).innerHTML = loadProjectComments(projectId);
    }
}

// CHECK IF USER CAN DELETE CONTENT (from blog_b.js)
function canDeleteContent(author) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'Guest' };
    const isAdmin = localStorage.getItem('userEmail') === "kazumasatou20021423@gmail.com";
    return currentUser.username === author || isAdmin;
}