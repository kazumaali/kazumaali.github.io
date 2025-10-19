// CHECK IF USER CAN DELETE CONTENT
function canDeleteContent(author) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'Guest' };
    const isAdmin = localStorage.getItem('userEmail') === "kazumasatou20021423@gmail.com";
    return currentUser.username === author || isAdmin;
}

// DELETE COMMENT
function deleteComment(postId, commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    
    localStorage.setItem(`comments-${postId}`, JSON.stringify(updatedComments));
    document.getElementById(`comments-${postId}`).innerHTML = loadComments(postId);
}

function deleteReply(postId, commentId, replyId) {
    if (!confirm('Are you sure you want to delete this reply?')) {
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
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
        localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
        document.getElementById(`comments-${postId}`).innerHTML = loadComments(postId);
    }
}

// REPLY TO REPLY FUNCTIONS
function toggleReplyToReplyForm(postId, commentId, replyId) {
    const form = document.getElementById(`reply-to-reply-${postId}-${commentId}-${replyId}`);
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
}
    
    function addReplyToReply(postId, commentId, parentReplyId) {
    const replyInput = document.querySelector(`#reply-to-reply-${postId}-${commentId}-${parentReplyId} .reply-input`);
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
                        upvotes: 0,
                        downvotes: 0,
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
        localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
        
        replyInput.value = '';
        document.getElementById(`comments-${postId}`).innerHTML = loadComments(postId);
    }
}

function handleReplyToReplyKeypress(event, postId, commentId, replyId) {
    if (event.key === 'Enter') {
        addReplyToReply(postId, commentId, replyId);
    }
}

// VOTE FUNCTIONS FOR REPLIES
function upvoteReply(postId, commentId, replyId) {
    const userVotes = getUserVotes();
    const replyKey = `reply_${postId}_${commentId}_${replyId}`;
    
    if (userVotes[replyKey] === 'upvote') return;
    
    const comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
    
    // Function to recursively find and upvote reply
    function findAndUpvoteReply(replies, targetId) {
        for (let reply of replies) {
            if (reply.id === targetId) {
                if (userVotes[replyKey] === 'downvote') {
                    reply.downvotes = Math.max(0, (reply.downvotes || 0) - 1);
                }
                reply.upvotes = (reply.upvotes || 0) + 1;
                userVotes[replyKey] = 'upvote';
                return true;
            }
            if (reply.replies) {
                if (findAndUpvoteReply(reply.replies, targetId)) return true;
            }
        }
        return false;
    }
    
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.replies) {
        findAndUpvoteReply(comment.replies, replyId);
        localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
        saveUserVotes(userVotes);
        document.getElementById(`comments-${postId}`).innerHTML = loadComments(postId);
    }
}

function downvoteReply(postId, commentId, replyId) {
    const userVotes = getUserVotes();
    const replyKey = `reply_${postId}_${commentId}_${replyId}`;
    
    if (userVotes[replyKey] === 'downvote') return;
    
    const comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
    
    // Function to recursively find and downvote reply
    function findAndDownvoteReply(replies, targetId) {
        for (let reply of replies) {
            if (reply.id === targetId) {
                if (userVotes[replyKey] === 'upvote') {
                    reply.upvotes = Math.max(0, (reply.upvotes || 0) - 1);
                }
                reply.downvotes = (reply.downvotes || 0) + 1;
                userVotes[replyKey] = 'downvote';
                return true;
            }
            if (reply.replies) {
                if (findAndDownvoteReply(reply.replies, targetId)) return true;
            }
        }
        return false;
    }
    
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.replies) {
        findAndDownvoteReply(comment.replies, replyId);
        localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
        saveUserVotes(userVotes);
        document.getElementById(`comments-${postId}`).innerHTML = loadComments(postId);
    }
}

function pinPost(postId) {
    // SECURITY: Admin verification
    if (!requireAdmin("pin post")) return;
    
    if (!confirm('Are you sure you want to pin this post?')) {
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    // Unpin any currently pinned post
    posts.forEach(post => {
        if (post.pinned) {
            post.pinned = false;
        }
    });
    
    // Pin the selected post
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        posts[postIndex].pinned = true;
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        loadBlogPosts();
        alert('Post pinned successfully!');
    }
}

function unpinPost(postId) {
    // SECURITY: Admin verification
    if (!requireAdmin("unpin post")) return;
    
    if (!confirm('Are you sure you want to unpin this post?')) {
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        posts[postIndex].pinned = false;
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        loadBlogPosts();
        alert('Post unpinned successfully!');
    }
}

// SEARCH FUNCTIONALITY
function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    if (!searchTerm) {
        loadBlogPosts(); // Show all posts if search is empty
        return;
    }
    
    const filteredPosts = posts.filter(post => 
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.toLowerCase().includes(searchTerm) ||
        post.date.toLowerCase().includes(searchTerm)
    );
    
    displaySearchResults(filteredPosts, searchTerm);
}

function displaySearchResults(posts, searchTerm) {
    const postsContainer = document.getElementById('blogPosts');
    const isAdmin = localStorage.getItem('userEmail') === "kazumasatou20021423@gmail.com";
    
    // Get profile data
    const profilePic = localStorage.getItem('profilePicture') || 'kazuma.png';
    const userName = localStorage.getItem('userName') || 'Kazuma Ali';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="empty-blog">
                <h3>No posts found for "${searchTerm}"</h3>
                <p>Try different keywords or check the spelling.</p>
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
                        ${post.media.map(media => 
                            media.type === 'image' ? 
                                `<img src="${media.data}" class="post-media-item" alt="${media.name}">` :
                                `<video src="${media.data}" class="post-media-item" controls></video>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
            
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
            
            ${isAdmin ? `
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

function handleSearchKeypress(event) {
    if (event.key === 'Enter') {
        searchPosts();
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    loadBlogPosts();
}