//text

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
        return false;
    }
    return true;
}

// SECURITY: Remove admin features from DOM for non-admins
function secureAdminFeatures() {
    if (!isAdmin()) {
        // Remove create post section completely
        const createSection = document.getElementById('createPostSection');
        if (createSection) createSection.remove();
        
        // Remove add post button
        const addBtn = document.getElementById('addPostBtn');
        if (addBtn) addBtn.remove();
        
        // Remove any admin buttons from posts
        document.querySelectorAll('.pin-btn, .unpin-btn, .edit-btn, .delete-btn').forEach(btn => {
            btn.remove();
        });
    }
}

// VOTE TRACKING
function getUserVotes() {
    return JSON.parse(localStorage.getItem('userVotes')) || {};
}

function saveUserVotes(votes) {
    localStorage.setItem('userVotes', JSON.stringify(votes));
}


function handleMediaSelect(event) {
    const files = event.target.files;
    const preview = document.getElementById('mediaPreview');
    preview.innerHTML = '';
    selectedMedia = [];
    
    for (let file of files) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // FIX: Properly detect both images and videos
            let mediaType = 'image';
            if (file.type.startsWith('video/')) {
                mediaType = 'video';
            } else if (file.type === 'image/gif') {
                mediaType = 'image'; // GIFs are images
            }
            
            selectedMedia.push({
                type: mediaType,
                data: e.target.result,
                name: file.name
            });
            
            // Create preview - FIX: Proper element creation
            let mediaElement;
            if (mediaType === 'image') {
                mediaElement = document.createElement('img');
                mediaElement.src = e.target.result;
            } else {
                mediaElement = document.createElement('video');
                mediaElement.src = e.target.result;
                mediaElement.controls = true;
                mediaElement.style.maxWidth = '150px';
                mediaElement.style.maxHeight = '150px';
            }
            
            mediaElement.className = 'media-preview-item';
            preview.appendChild(mediaElement);
        };
        
        reader.readAsDataURL(file);
    }
}

function checkBlogAccess() {
    // SECURITY: Remove admin features from DOM first
    secureAdminFeatures();
    
    const savedEmail = localStorage.getItem('userEmail');
    const isAdminUser = isAdmin();
    
    if (isAdminUser) {
        document.getElementById('addPostBtn').style.display = 'block';
        document.getElementById('createPostSection').style.display = 'block';
    } else {
        document.getElementById('addPostBtn').style.display = 'none';
        document.getElementById('createPostSection').style.display = 'none';
    }
    
    loadBlogPosts();
}

// Toggle create post section
function toggleCreatePost() {
    const createSection = document.getElementById('createPostSection');
    const isVisible = createSection.style.display === 'block';
    
    createSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        document.getElementById('postContent').value = '';
        document.getElementById('mediaUpload').value = '';
        document.getElementById('mediaPreview').innerHTML = '';
        selectedMedia = [];
        document.getElementById('postContent').focus();
    }
}


function createPost() {
    // SECURITY: Admin verification
    if (!requireAdmin("create post")) return;
    
    const content = document.getElementById('postContent').value.trim();
    
    if (!content && selectedMedia.length === 0) {
        alert('Please write something or add media!');
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    const newPost = {
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
        // SECURITY: Store creator info
        createdBy: localStorage.getItem('userEmail')
    };
    
    posts.unshift(newPost);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    // Reset form
    document.getElementById('postContent').value = '';
    document.getElementById('mediaUpload').value = '';
    document.getElementById('mediaPreview').innerHTML = '';
    selectedMedia = [];
    document.getElementById('createPostSection').style.display = 'none';
    
    loadBlogPosts();
    alert('Post published successfully!');
}


function loadBlogPosts() {
    const postsContainer = document.getElementById('blogPosts');
    let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    // SECURITY: Remove admin features from DOM
    secureAdminFeatures();
    
    // Get profile data
    const profilePic = localStorage.getItem('profilePicture') || 'kazuma.png';
    const userName = localStorage.getItem('userName') || 'Kazuma Ali';
    
    // Sort posts: pinned first, then by date (newest first)
    posts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.id - a.id;
    });
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="empty-blog">
                <h3>No blog posts yet</h3>
            </div>
        `;
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <div class="blog-post ${post.pinned ? 'pinned-post' : ''}" data-post-id="${post.id}">
            ${post.pinned ? '<div class="pin-indicator"><i class="fas fa-thumbtack"></i> Pinned</div>' : ''}
            
            <!-- PROFILE HEADER -->
            <div class="post-header">
                <img src="${profilePic}" class="post-profile-pic" alt="${userName}">
                <div class="post-user-info">
                    <span class="post-username">${userName}</span>
                    <span class="post-date">${post.date}</span>
                </div>
            </div>
            
            <div class="post-content">
                ${formatPostContent(post.content)}
                <!-- LIKE/DISLIKE BUTTONS -->
                <div class="post-actions">
                    <button class="like-btn" onclick="likePost(${post.id})">
                        <i class="fas fa-thumbs-up"></i> <span class="like-count">${post.likes || 0}</span>
                    </button>
                    <button class="dislike-btn" onclick="dislikePost(${post.id})">
                        <i class="fas fa-thumbs-down"></i> <span class="dislike-count">${post.dislikes || 0}</span>
                    </button>
                </div>
    ${post.media && post.media.length > 0 ? `
    <div class="post-media">
        ${post.media.map(media => {
            if (media.type === 'image') {
                return `<img src="${media.data}" class="post-media-item" alt="${media.name}" onclick="viewMedia('${media.data}', 'image')">`;
            } else {
                return `
                    <div class="video-container">
                        <video class="post-media-item" controls controlsList="nodownload">
                            <source src="${media.data}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <div class="video-overlay" onclick="togglePlayPause(this.previousElementSibling)">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                `;
            }
        }).join('')}
    </div>
` : ''}
                
                
            
            <!-- COMMENT SECTION -->
            <div class="comment-section">
                <div class="comment-form">
                    <input type="text" class="comment-input" placeholder="Write a comment..." 
                           onkeypress="handleCommentKeypress(event, ${post.id})">
                    <button class="comment-btn" onclick="addComment(${post.id})">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="comments-list" id="comments-${post.id}">
                    ${loadComments(post.id)}
                </div>
            </div>
            
            <!-- SECURITY: Admin buttons only shown and functional for admin -->
            ${isAdmin() ? `
                <div class="post-actions">
                    ${!post.pinned ? `
                        <button class="pin-btn" onclick="pinPost(${post.id})">
                            <i class="fas fa-thumbtack"></i> Pin
                        </button>
                    ` : `
                        <button class="unpin-btn" onclick="unpinPost(${post.id})">
                            <i class="fas fa-thumbtack"></i> Unpin
                        </button>
                    `}
                    <button class="edit-btn" onclick="editPost(${post.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deletePost(${post.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}



function editPost(postId) {
    // SECURITY: Admin verification
    if (!requireAdmin("edit post")) return;
    
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const post = posts.find(p => p.id === postId);
    
    if (!post) return;
    
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    
    postElement.innerHTML = `
        <div class="edit-post-form">
            <textarea class="edit-content-input">${escapeHtml(post.content)}</textarea>
            <div class="edit-actions">
                <button class="save-edit-btn" onclick="savePostEdit(${postId})">
                    <i class="fas fa-save"></i> Save Changes
                </button>
                <button class="cancel-edit-btn" onclick="cancelPostEdit(${postId})">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    postElement.querySelector('.edit-content-input').focus();
}


// SAVE EDITED POST
function savePostEdit(postId) {
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return;
    
    const newContent = document.querySelector(`[data-post-id="${postId}"] .edit-content-input`).value.trim();
    
    if (!newContent) {
        alert('Please write something!');
        return;
    }
    
    // Update the post
    posts[postIndex].content = newContent;
    posts[postIndex].date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) + ' (edited)';
    
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    loadBlogPosts();
    
    alert('Post updated successfully!');
}


// CANCEL EDIT
function cancelPostEdit(postId) {
    loadBlogPosts(); // Just reload to show original post
}

function deletePost(postId) {
    // SECURITY: Admin verification
    if (!requireAdmin("delete post")) return;
    
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const updatedPosts = posts.filter(post => post.id !== postId);
    
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
    loadBlogPosts();
    
    alert('Post deleted successfully!');
}

// Format post content (preserve line breaks)
function formatPostContent(content) {
    return content.replace(/\n/g, '<br>');
}

// Helper function to prevent HTML injection
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize blog when page loads
document.addEventListener('DOMContentLoaded', function() {
    const mediaUpload = document.getElementById('mediaUpload');
    if (mediaUpload) {
        mediaUpload.addEventListener('change', handleMediaSelect);
    }
    
    // SECURITY: Apply security measures on page load
    secureAdminFeatures();
    checkBlogAccess();
    
    if (typeof startSlideshow === 'function') {
        startSlideshow();
    }
});


function loadComments(postId) {
    const comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
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
                    <button class="delete-comment-btn" onclick="deleteComment(${postId}, ${comment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            
            <!-- UPVOTE/DOWNVOTE -->
            <div class="vote-buttons">
                <button class="upvote-btn" onclick="upvoteComment(${postId}, ${comment.id})">
                    <i class="fas fa-arrow-up"></i> <span class="upvote-count">${comment.upvotes || 0}</span>
                </button>
                <button class="downvote-btn" onclick="downvoteComment(${postId}, ${comment.id})">
                    <i class="fas fa-arrow-down"></i> <span class="downvote-count">${comment.downvotes || 0}</span>
                </button>
            </div>
            
            <!-- REPLY SECTION -->
            <div class="reply-section">
                <button class="reply-btn" onclick="toggleReplyForm(${postId}, ${comment.id})">
                    <i class="fas fa-reply"></i> Reply
                </button>
                
                <div class="reply-form" id="reply-form-${postId}-${comment.id}" style="display: none;">
                    <input type="text" class="reply-input" placeholder="Write a reply..."
                           onkeypress="handleReplyKeypress(event, ${postId}, ${comment.id})">
                    <button class="reply-submit-btn" onclick="addReply(${postId}, ${comment.id})">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                
                <!-- REPLIES LIST - RECURSIVE -->
                <div class="replies-list">
                    ${comment.replies && comment.replies.length > 0 ? 
                        renderReplies(comment.replies, postId, comment.id, 1) : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// NEW RECURSIVE FUNCTION FOR INFINITE REPLY CHAINS
function renderReplies(replies, postId, parentCommentId, depthLevel) {
    return replies.map(reply => `
        <div class="reply reply-level-${depthLevel}" data-reply-id="${reply.id}">
            <div class="reply-header">
                <img src="${reply.authorPic}" class="reply-profile-pic" alt="${reply.author}">
                <div class="reply-user-info">
                    <span class="reply-author">${escapeHtml(reply.author)}</span>
                    <span class="reply-time">${reply.time}</span>
                </div>
                ${canDeleteContent(reply.author) ? `
                    <button class="delete-reply-btn" onclick="deleteReply(${postId}, ${parentCommentId}, ${reply.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
            <div class="reply-text">${escapeHtml(reply.text)}</div>
            
            <!-- VOTE BUTTONS FOR REPLIES -->
            <div class="vote-buttons">
                <button class="upvote-btn" onclick="upvoteReply(${postId}, ${parentCommentId}, ${reply.id})">
                    <i class="fas fa-arrow-up"></i> <span class="upvote-count">${reply.upvotes || 0}</span>
                </button>
                <button class="downvote-btn" onclick="downvoteReply(${postId}, ${parentCommentId}, ${reply.id})">
                    <i class="fas fa-arrow-down"></i> <span class="downvote-count">${reply.downvotes || 0}</span>
                </button>
            </div>
            
            <!-- REPLY TO REPLY BUTTON -->
            <div class="reply-actions">
                <button class="reply-btn" onclick="toggleReplyToReplyForm(${postId}, ${parentCommentId}, ${reply.id})">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
            
            <!-- REPLY TO REPLY FORM -->
            <div class="reply-to-reply-form" id="reply-to-reply-${postId}-${parentCommentId}-${reply.id}" style="display: none;">
                <input type="text" class="reply-input" placeholder="Write a reply..."
                       onkeypress="handleReplyToReplyKeypress(event, ${postId}, ${parentCommentId}, ${reply.id})">
                <button class="reply-submit-btn" onclick="addReplyToReply(${postId}, ${parentCommentId}, ${reply.id})">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            
            <!-- NESTED REPLIES - RECURSIVE CALL -->
            ${reply.replies && reply.replies.length > 0 ? 
                renderReplies(reply.replies, postId, parentCommentId, depthLevel + 1) : ''}
        </div>
    `).join('');
}
            

function addComment(postId) {
    const commentInput = document.querySelector(`[data-post-id="${postId}"] .comment-input`);
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('Please write a comment!');
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
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
    localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
    
    commentInput.value = '';
    document.getElementById(`comments-${postId}`).innerHTML = loadComments(postId);
}

// REPLY FUNCTIONS
function toggleReplyForm(postId, commentId) {
    const replyForm = document.getElementById(`reply-form-${postId}-${commentId}`);
    replyForm.style.display = replyForm.style.display === 'none' ? 'flex' : 'none';
}

function addReply(postId, commentId) {
    const replyInput = document.querySelector(`#reply-form-${postId}-${commentId} .reply-input`);
    const replyText = replyInput.value.trim();
    
    if (!replyText) {
        alert('Please write a reply!');
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
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
        localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
        
        replyInput.value = '';
        document.getElementById(`comments-${postId}`).innerHTML = loadComments(postId);
    }
}

function handleCommentKeypress(event, postId) {
    if (event.key === 'Enter') {
        addComment(postId);
    }
}

function handleReplyKeypress(event, postId, commentId) {
    if (event.key === 'Enter') {
        addReply(postId, commentId);
    }
}

function likePost(postId) {
    const userVotes = getUserVotes();
    const postKey = `post_${postId}`;
    
    // If already liked, remove like
    if (userVotes[postKey] === 'like') {
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        // Remove previous dislike if exists
        if (userVotes[postKey] === 'dislike') {
            posts[postIndex].dislikes = Math.max(0, (posts[postIndex].dislikes || 0) - 1);
        }
        
        // Add like
        posts[postIndex].likes = (posts[postIndex].likes || 0) + 1;
        userVotes[postKey] = 'like';
        
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        saveUserVotes(userVotes);
        loadBlogPosts();
    }
}

function dislikePost(postId) {
    const userVotes = getUserVotes();
    const postKey = `post_${postId}`;
    
    // If already disliked, remove dislike
    if (userVotes[postKey] === 'dislike') {
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        // Remove previous like if exists
        if (userVotes[postKey] === 'like') {
            posts[postIndex].likes = Math.max(0, (posts[postIndex].likes || 0) - 1);
        }
        
        // Add dislike
        posts[postIndex].dislikes = (posts[postIndex].dislikes || 0) + 1;
        userVotes[postKey] = 'dislike';
        
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        saveUserVotes(userVotes);
        loadBlogPosts();
    }
}

function upvoteComment(postId, commentId) {
    const userVotes = getUserVotes();
    const commentKey = `comment_${postId}_${commentId}`;
    
    if (userVotes[commentKey] === 'upvote') {
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex !== -1) {
        // Remove previous downvote if exists
        if (userVotes[commentKey] === 'downvote') {
            comments[commentIndex].downvotes = Math.max(0, (comments[commentIndex].downvotes || 0) - 1);
        }
        
        // Add upvote
        comments[commentIndex].upvotes = (comments[commentIndex].upvotes || 0) + 1;
        userVotes[commentKey] = 'upvote';
        
        localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
        saveUserVotes(userVotes);
        document.getElementById(`comments-${postId}`).innerHTML = loadComments(postId);
    }
}

function downvoteComment(postId, commentId) {
    const userVotes = getUserVotes();
    const commentKey = `comment_${postId}_${commentId}`;
    
    if (userVotes[commentKey] === 'downvote') {
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex !== -1) {
        // Remove previous upvote if exists
        if (userVotes[commentKey] === 'upvote') {
            comments[commentIndex].upvotes = Math.max(0, (comments[commentIndex].upvotes || 0) - 1);
        }
        
        // Add downvote
        comments[commentIndex].downvotes = (comments[commentIndex].downvotes || 0) + 1;
        userVotes[commentKey] = 'downvote';
        
        localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
        saveUserVotes(userVotes);
        document.getElementById(`comments-${postId}`).innerHTML = loadComments(postId);
    }
}

// MEDIA VIEWER FUNCTIONALITY
function viewMedia(mediaSrc, mediaType) {
    if (mediaType === 'image') {
        // Create image modal
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '10000';
        modal.style.cursor = 'pointer';
        
        const img = document.createElement('img');
        img.src = mediaSrc;
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '10px';
        
        modal.appendChild(img);
        
        // Close on click
        modal.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        document.body.appendChild(modal);
    }
    // Videos already have controls, so no need for special modal
}

// VIDEO PLAY/PAUSE TOGGLE
function togglePlayPause(videoElement) {
    if (videoElement.paused) {
        videoElement.play();
    } else {
        videoElement.pause();
    }
}