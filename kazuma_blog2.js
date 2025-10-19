// YOUR BLOG FUNCTIONALITY

// Emoji reactions
const EMOJIS = ['💙', '❤', '😂', '😁', '🤬', '🤓', '😎', '😍', '😘', '🤩', '🥲', '🤑', '😭', '🤯', '🤡', '🥸', '👺', '💀', '💩', '👽', '👻'];

// Media handling
let selectedMedia = [];
let currentReactingPostId = null;

// Check if user is logged in
function isUserLoggedIn() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.username && currentUser.username !== 'Guest';
}

// Check if user is admin
function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userEmail = localStorage.getItem('userEmail');
    
    // Check both possible locations for admin email
    return (currentUser && currentUser.email === "kazumasatou20021423@gmail.com") || 
           userEmail === "kazumasatou20021423@gmail.com";
}

// Handle media file selection
function handleMediaSelect(event) {
    const files = event.target.files;
    const preview = document.getElementById('mediaPreview');
    
    // Clear previous preview and selection
    while (preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }
    selectedMedia = [];
    
    for (let file of files) {
        // Check if file is image or GIF
        if (!file.type.startsWith('image/')) {
            alert('Only images and GIFs are allowed!');
            continue;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            selectedMedia.push({
                type: 'image',
                data: e.target.result,
                name: file.name
            });
            
            // Create preview element
            const mediaElement = document.createElement('img');
            mediaElement.src = e.target.result;
            mediaElement.className = 'media-preview-item';
            mediaElement.alt = file.name;
            
            preview.appendChild(mediaElement);
        };
        
        reader.readAsDataURL(file);
    }
}

// Initialize the blog
function initYourBlog() {
    // Add event listener for media upload
    const mediaUpload = document.getElementById('mediaUpload');
    if (mediaUpload) {
        mediaUpload.addEventListener('change', handleMediaSelect);
    }
    
    // Initialize emoji reaction buttons
    initEmojiReactions();
    
    checkUserAccess();
    loadUserBlogPosts();
    
    // Start slideshow if function exists
    if (typeof startSlideshow === 'function') {
        startSlideshow();
    }
}

// Initialize emoji reaction buttons
function initEmojiReactions() {
    const emojiContainer = document.getElementById('emojiReactionButtons');
    
    EMOJIS.forEach(emoji => {
        const emojiBtn = document.createElement('button');
        emojiBtn.className = 'emoji-reaction-btn';
        emojiBtn.textContent = emoji;
        emojiBtn.title = emoji;
        emojiBtn.addEventListener('click', () => reactToCurrentPost(emoji));
        emojiContainer.appendChild(emojiBtn);
    });
}

// Check user access and show/hide controls
function checkUserAccess() {
    const addPostBtn = document.getElementById('addPostBtn');
    
    if (isUserLoggedIn()) {
        addPostBtn.style.display = 'flex';
    } else {
        addPostBtn.style.display = 'none';
        document.getElementById('createPostBar').classList.remove('active');
    }
}

// Toggle create post bar
function toggleCreatePostBar() {
    if (!isUserLoggedIn()) {
        alert('Please log in to create posts!');
        return;
    }
    
    const createBar = document.getElementById('createPostBar');
    createBar.classList.toggle('active');
    
    if (createBar.classList.contains('active')) {
        document.getElementById('postContent').focus();
    } else {
        // Clear form when closing
        document.getElementById('postContent').value = '';
        document.getElementById('mediaUpload').value = '';
        
        const preview = document.getElementById('mediaPreview');
        while (preview.firstChild) {
            preview.removeChild(preview.firstChild);
        }
        
        selectedMedia = [];
    }
}

// Create a new user post
function createUserPost() {
    if (!isUserLoggedIn()) {
        alert('Please log in to create posts!');
        return;
    }
    
    const content = document.getElementById('postContent').value.trim();
    
    if (!content && selectedMedia.length === 0) {
        alert('Please write something or add media!');
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('userBlogPosts')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const newPost = {
        id: Date.now(),
        content: content,
        media: [...selectedMedia],
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        author: currentUser.username,
        authorPic: currentUser.profilePic || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username,
        reactions: {}
    };
    
    posts.unshift(newPost);
    localStorage.setItem('userBlogPosts', JSON.stringify(posts));
    
    // Reset form and close bar
    document.getElementById('postContent').value = '';
    document.getElementById('mediaUpload').value = '';
    
    const preview = document.getElementById('mediaPreview');
    while (preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }
    
    selectedMedia = [];
    document.getElementById('createPostBar').classList.remove('active');
    
    loadUserBlogPosts();
}

// Load user blog posts
function loadUserBlogPosts() {
    const postsContainer = document.getElementById('blogPosts');
    const posts = JSON.parse(localStorage.getItem('userBlogPosts')) || [];
    
    // Clear container
    while (postsContainer.firstChild) {
        postsContainer.removeChild(postsContainer.firstChild);
    }
    
    if (posts.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-blog';
        
        const heading = document.createElement('h3');
        heading.textContent = 'No posts yet';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = isUserLoggedIn() 
            ? 'Be the first to share something!' 
            : 'Log in to create the first post!';
        
        emptyMessage.appendChild(heading);
        emptyMessage.appendChild(paragraph);
        postsContainer.appendChild(emptyMessage);
        return;
    }
    
    // Show login prompt if not logged in
    if (!isUserLoggedIn()) {
        const loginPrompt = document.createElement('div');
        loginPrompt.className = 'login-prompt';
        
        const heading = document.createElement('h3');
        heading.textContent = 'Log in to interact with posts';
        
        const loginBtn = document.createElement('a');
        loginBtn.href = 'kazuma_1.html';
        loginBtn.className = 'login-btn';
        loginBtn.textContent = 'Go to Login';
        
        loginPrompt.appendChild(heading);
        loginPrompt.appendChild(loginBtn);
        postsContainer.appendChild(loginPrompt);
    }
    
    // Create posts using DOM methods
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create post element using DOM methods
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'blog-post';
    postDiv.setAttribute('data-post-id', post.id);
    
    // Add click event for emoji reactions (only for logged-in users)
    if (isUserLoggedIn()) {
        postDiv.addEventListener('click', (e) => {
            // Don't trigger if clicking on admin delete button, media, or reaction counts
            if (!e.target.closest('.admin-actions') && 
                !e.target.classList.contains('post-media-item') && 
                !e.target.closest('.reaction-counts') &&
                e.target.tagName !== 'IMG') {
                openReactionBar(post.id);
            }
        });
    }
    
    // Create post header
    const postHeader = document.createElement('div');
    postHeader.className = 'post-header';
    
    const profilePic = document.createElement('img');
    profilePic.className = 'post-profile-pic';
    profilePic.src = post.authorPic;
    profilePic.alt = post.author;
    
    const userInfo = document.createElement('div');
    userInfo.className = 'post-user-info';
    
    const username = document.createElement('span');
    username.className = 'post-username';
    username.textContent = post.author;
    
    const date = document.createElement('span');
    date.className = 'post-date';
    date.textContent = post.date;
    
    userInfo.appendChild(username);
    userInfo.appendChild(date);
    
    postHeader.appendChild(profilePic);
    postHeader.appendChild(userInfo);
    
    // Create post content
    const postContent = document.createElement('div');
    postContent.className = 'post-content';
    
    if (post.content) {
        const contentText = document.createElement('p');
        contentText.textContent = post.content;
        postContent.appendChild(contentText);
    }
    
    // Create media section if media exists
    if (post.media && post.media.length > 0) {
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'post-media';
        
        post.media.forEach(media => {
            const mediaElement = document.createElement('img');
            mediaElement.className = 'post-media-item';
            mediaElement.src = media.data;
            mediaElement.alt = media.name;
            mediaContainer.appendChild(mediaElement);
        });
        
        postContent.appendChild(mediaContainer);
    }
    
    // Create reactions section
    const reactionsSection = document.createElement('div');
    reactionsSection.className = 'reactions-section';
    
    // Reaction summary
    const reactionSummary = document.createElement('div');
    reactionSummary.className = 'reaction-summary';
    
    const reactionCounts = document.createElement('div');
    reactionCounts.className = 'reaction-counts';
    
    // Add reaction counts
    Object.entries(post.reactions || {}).forEach(([emoji, users]) => {
        if (users.length > 0) {
            const countItem = document.createElement('div');
            countItem.className = 'reaction-count-item';
            
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = emoji;
            
            const countSpan = document.createElement('span');
            countSpan.textContent = users.length;
            
            countItem.appendChild(emojiSpan);
            countItem.appendChild(countSpan);
            reactionCounts.appendChild(countItem);
        }
    });
    
    reactionSummary.appendChild(reactionCounts);
    reactionsSection.appendChild(reactionSummary);
    
    // Create admin actions if user is admin
    if (isAdmin()) {
        const adminActions = document.createElement('div');
        adminActions.className = 'admin-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the post click event
            deleteUserPost(post.id);
        });
        
        adminActions.appendChild(deleteBtn);
        postDiv.appendChild(adminActions);
    }
    
    // Assemble the post
    postDiv.appendChild(postHeader);
    postDiv.appendChild(postContent);
    postDiv.appendChild(reactionsSection);
    
    return postDiv;
}

// Open emoji reaction bar
function openReactionBar(postId) {
    if (!isUserLoggedIn()) {
        alert('Please log in to react to posts!');
        return;
    }
    
    console.log('Opening reaction bar for post:', postId);
    currentReactingPostId = postId;
    const reactionBar = document.getElementById('emojiReactionBar');
    if (reactionBar) {
        reactionBar.classList.add('active');
        
        // Remove any inline positioning and use CSS instead
        reactionBar.style.bottom = '';
        reactionBar.style.top = '';
    }
}

// Close emoji reaction bar
function closeReactionBar() {
    const reactionBar = document.getElementById('emojiReactionBar');
    if (reactionBar) {
        reactionBar.classList.remove('active');
    }
    currentReactingPostId = null;
}

// React to current post with emoji
function reactToCurrentPost(emoji) {
    if (!currentReactingPostId) {
        console.error('No post selected for reaction');
        return;
    }
    
    console.log('Reacting with', emoji, 'to post:', currentReactingPostId);
    reactToPost(currentReactingPostId, emoji);
    closeReactionBar();
}

// React to a post
function reactToPost(postId, emoji) {
    if (!isUserLoggedIn()) {
        alert('Please log in to react to posts!');
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('userBlogPosts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
        console.error('Post not found:', postId);
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const username = currentUser.username;
    
    // Initialize reactions object if it doesn't exist
    if (!posts[postIndex].reactions) {
        posts[postIndex].reactions = {};
    }
    
    // Initialize emoji array if it doesn't exist
    if (!posts[postIndex].reactions[emoji]) {
        posts[postIndex].reactions[emoji] = [];
    }
    
    // Check if user already reacted with this emoji
    const userIndex = posts[postIndex].reactions[emoji].indexOf(username);
    
    if (userIndex > -1) {
        // Remove reaction if already exists
        posts[postIndex].reactions[emoji].splice(userIndex, 1);
        
        // Remove emoji entry if no more reactions
        if (posts[postIndex].reactions[emoji].length === 0) {
            delete posts[postIndex].reactions[emoji];
        }
    } else {
        // Add reaction
        posts[postIndex].reactions[emoji].push(username);
    }
    
    localStorage.setItem('userBlogPosts', JSON.stringify(posts));
    loadUserBlogPosts();
}

// Delete user post (admin only)
function deleteUserPost(postId) {
    if (!isAdmin()) {
        alert('Only admin can delete posts!');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('userBlogPosts')) || [];
    const updatedPosts = posts.filter(post => post.id !== postId);
    
    localStorage.setItem('userBlogPosts', JSON.stringify(updatedPosts));
    loadUserBlogPosts();
    
    alert('Post deleted successfully!');
}

// SINGLE outside click handler - REMOVED DUPLICATE
document.addEventListener('click', function(e) {
    const reactionBar = document.getElementById('emojiReactionBar');
    
    if (reactionBar && reactionBar.classList.contains('active')) {
        // If click is outside the reaction bar and not on a post
        if (!reactionBar.contains(e.target) && !e.target.closest('.blog-post')) {
            closeReactionBar();
        }
    }
});

// Handle Enter key in post input
document.addEventListener('DOMContentLoaded', function() {
    const postInput = document.getElementById('postContent');
    if (postInput) {
        postInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                createUserPost();
            }
        });
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initYourBlog);