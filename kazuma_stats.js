// STATISTICS PAGE FUNCTIONALITY

// Enhanced admin check function
function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userEmail = localStorage.getItem('userEmail');
    
    // Check both possible locations for admin email
    const adminEmail = "kazumasatou20021423@gmail.com";
    return (currentUser && currentUser.email === adminEmail) || 
           (currentUser && currentUser.username === "admin") ||
           userEmail === adminEmail;
}

// Check if any user is logged in
function isUserLoggedIn() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.username && currentUser.username !== 'Guest';
}

// Initialize statistics page
function initStatsPage() {
    console.log('Initializing stats page...');
    console.log('Is admin:', isAdmin());
    console.log('Is user logged in:', isUserLoggedIn());
    
    // Always load public stats for everyone
    loadPublicStats();
    
    // Only show admin stats if user is admin
    if (isAdmin()) {
        console.log('Loading admin statistics...');
        loadPrivateStats();
        // Show admin sections
        const adminSections = document.querySelectorAll('.admin-only');
        adminSections.forEach(section => {
            section.style.display = 'block';
        });
    } else {
        console.log('Hiding admin statistics...');
        // Hide admin sections for non-admin users
        const adminSections = document.querySelectorAll('.admin-only');
        adminSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Also hide any admin-specific elements that might not have the class
        const adminElements = document.querySelectorAll('[id*="admin"], [class*="admin"]');
        adminElements.forEach(element => {
            if (element.classList.contains('admin-only') || 
                element.id.includes('admin') || 
                element.className.includes('admin')) {
                element.style.display = 'none';
            }
        });
    }
}

// Load public statistics (ALWAYS visible to everyone)
function loadPublicStats() {
    console.log('Loading public statistics for all users...');
    
    // 1. My Blog Stats (Likes, Dislikes, Karma)
    const blogStats = calculateBlogStats();
    document.getElementById('totalLikes').textContent = blogStats.totalLikes;
    document.getElementById('totalDislikes').textContent = blogStats.totalDislikes;
    
    const karmaElement = document.getElementById('totalKarma');
    karmaElement.textContent = blogStats.karma;
    
    if (blogStats.karma >= 0) {
        karmaElement.className = 'stat-value karma-positive';
    } else {
        karmaElement.className = 'stat-value karma-negative';
    }
    
    // 2. Projects Average Rating
    const projectsRating = calculateProjectsRating();
    document.getElementById('averageRating').textContent = projectsRating.toFixed(1);
    
    // 3. Your Blog Posts Count
    const yourBlogPosts = calculateYourBlogPosts();
    document.getElementById('yourBlogPosts').textContent = yourBlogPosts;
}

// Calculate My Blog statistics
function calculateBlogStats() {
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    let totalLikes = 0;
    let totalDislikes = 0;
    
    posts.forEach(post => {
        totalLikes += post.likes || 0;
        totalDislikes += post.dislikes || 0;
    });
    
    const karma = totalLikes - totalDislikes;
    
    return {
        totalLikes,
        totalDislikes,
        karma
    };
}

// Calculate Projects average rating
function calculateProjectsRating() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    if (projects.length === 0) return 0;
    
    let totalRating = 0;
    let ratedProjects = 0;
    
    projects.forEach(project => {
        if (project.ratings && project.ratings.length > 0) {
            const avgRating = calculateAverageRating(project.ratings);
            totalRating += avgRating;
            ratedProjects++;
        }
    });
    
    return ratedProjects > 0 ? totalRating / ratedProjects : 0;
}

// Calculate average rating (helper function)
function calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    return sum / ratings.length;
}

// Calculate Your Blog posts count
function calculateYourBlogPosts() {
    const posts = JSON.parse(localStorage.getItem('userBlogPosts')) || [];
    return posts.length;
}

// Load private statistics (admin only)
function loadPrivateStats() {
    console.log('Loading private admin statistics...');
    
    // Initialize visitor tracking if not exists
    initializeVisitorTracking();
    
    // Load visitor chart
    loadVisitorChart('daily');
    
    // Load visitor summary
    loadVisitorSummary();
    
    // Load social media clicks
    loadSocialMediaStats();
}

// Initialize visitor tracking system
function initializeVisitorTracking() {
    let visitorStats = JSON.parse(localStorage.getItem('visitorStats')) || {
        totalVisits: 0,
        daily: {},
        weekly: {},
        monthly: {},
        annually: {},
        tenYears: {}
    };
    
    // Get current date
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Update total visits
    visitorStats.totalVisits++;
    
    // Update daily visits
    if (!visitorStats.daily[dateKey]) {
        visitorStats.daily[dateKey] = 0;
    }
    visitorStats.daily[dateKey]++;
    
    // Update weekly visits (using ISO week)
    const weekKey = getWeekKey(now);
    if (!visitorStats.weekly[weekKey]) {
        visitorStats.weekly[weekKey] = 0;
    }
    visitorStats.weekly[weekKey]++;
    
    // Update monthly visits
    const monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!visitorStats.monthly[monthKey]) {
        visitorStats.monthly[monthKey] = 0;
    }
    visitorStats.monthly[monthKey]++;
    
    // Update annual visits
    const yearKey = now.getFullYear().toString();
    if (!visitorStats.annually[yearKey]) {
        visitorStats.annually[yearKey] = 0;
    }
    visitorStats.annually[yearKey]++;
    
    // Update 10-year visits
    const tenYearKey = Math.floor(now.getFullYear() / 10) * 10;
    if (!visitorStats.tenYears[tenYearKey]) {
        visitorStats.tenYears[tenYearKey] = 0;
    }
    visitorStats.tenYears[tenYearKey]++;
    
    // Save updated stats
    localStorage.setItem('visitorStats', JSON.stringify(visitorStats));
}

// Get ISO week key (helper function)
function getWeekKey(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return date.getFullYear() + '-W' + 
           (1 + Math.ceil((firstThursday - target) / 604800000)).toString().padStart(2, '0');
}

// Load visitor chart
function loadVisitorChart(period) {
    const visitorStats = JSON.parse(localStorage.getItem('visitorStats')) || {
        daily: {},
        weekly: {},
        monthly: {},
        annually: {},
        tenYears: {}
    };
    
    const chartContainer = document.getElementById('visitorChart');
    if (!chartContainer) {
        console.error('Visitor chart container not found!');
        return;
    }
    
    chartContainer.innerHTML = '';
    
    let data = {};
    let labels = [];
    let values = [];
    
    // Get data based on selected period
    switch (period) {
        case 'daily':
            data = visitorStats.daily;
            labels = Object.keys(data).sort().slice(-30); // Last 30 days
            break;
        case 'weekly':
            data = visitorStats.weekly;
            labels = Object.keys(data).sort().slice(-12); // Last 12 weeks
            break;
        case 'monthly':
            data = visitorStats.monthly;
            labels = Object.keys(data).sort().slice(-12); // Last 12 months
            break;
        case 'annually':
            data = visitorStats.annually;
            labels = Object.keys(data).sort().slice(-10); // Last 10 years
            break;
        case 'tenYears':
            data = visitorStats.tenYears;
            labels = Object.keys(data).sort();
            break;
    }
    
    // Get values for labels
    labels.forEach(label => {
        values.push(data[label] || 0);
    });
    
    // Find max value for scaling
    const maxValue = Math.max(...values, 1);
    
    // Create chart bars
    const barWidth = Math.min(30, (chartContainer.offsetWidth - 40) / labels.length);
    const spacing = (chartContainer.offsetWidth - (barWidth * labels.length)) / (labels.length + 1);
    
    labels.forEach((label, index) => {
        const barHeight = (values[index] / maxValue) * 200; // Reduced max height to make room for numbers
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${barHeight}px`;
        bar.style.left = `${spacing + (index * (barWidth + spacing))}px`;
        bar.style.width = `${barWidth}px`;
        
        // ADD NUMBER LABEL ON TOP OF EACH BAR
        const numberLabel = document.createElement('div');
        numberLabel.className = 'chart-number';
        numberLabel.textContent = values[index];
        numberLabel.style.position = 'absolute';
        numberLabel.style.bottom = `${barHeight + 25}px`; // Position above the bar
        numberLabel.style.left = `${spacing + (index * (barWidth + spacing))}px`;
        numberLabel.style.width = `${barWidth}px`;
        numberLabel.style.textAlign = 'center';
        numberLabel.style.color = '#FFD700';
        numberLabel.style.fontSize = '11px';
        numberLabel.style.fontWeight = 'bold';
        numberLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
        
        const labelElement = document.createElement('div');
        labelElement.className = 'chart-label';
        labelElement.textContent = formatLabel(label, period);
        labelElement.style.left = `${spacing + (index * (barWidth + spacing)) + (barWidth / 2)}px`;
        
        // Add tooltip
        bar.title = `${formatLabel(label, period)}: ${values[index]} visitors`;
        
        chartContainer.appendChild(bar);
        chartContainer.appendChild(numberLabel);
        chartContainer.appendChild(labelElement);
    });
    
    // ADD TOTAL VISITORS DISPLAY
    const totalVisits = visitorStats.totalVisits || 0;
    const totalDisplay = document.createElement('div');
    totalDisplay.className = 'total-visitors';
    totalDisplay.innerHTML = `<strong>Total Website Visits: ${totalVisits}</strong>`;
    totalDisplay.style.position = 'absolute';
    totalDisplay.style.top = '10px';
    totalDisplay.style.left = '10px';
    totalDisplay.style.color = '#FFD700';
    totalDisplay.style.fontSize = '14px';
    totalDisplay.style.fontWeight = 'bold';
    totalDisplay.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    chartContainer.appendChild(totalDisplay);
    
    // Update active button
    document.querySelectorAll('.time-period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-period="${period}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Format label based on period
function formatLabel(label, period) {
    switch (period) {
        case 'daily':
            return new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'weekly':
            return `W${label.split('-W')[1]}`;
        case 'monthly':
            const [year, month] = label.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        case 'annually':
            return label;
        case 'tenYears':
            return `${label}s`;
        default:
            return label;
    }
}

// Load social media click statistics
function loadSocialMediaStats() {
    const socialStats = JSON.parse(localStorage.getItem('socialMediaClicks')) || {
        github: 0,
        facebook: 0,
        twitter: 0,
        instagram: 0,
        linkedin: 0,
        youtube: 0
    };
    
    // Update social media stats display
    document.getElementById('githubClicks').textContent = socialStats.github;
    document.getElementById('facebookClicks').textContent = socialStats.facebook;
    document.getElementById('twitterClicks').textContent = socialStats.twitter;
    document.getElementById('instagramClicks').textContent = socialStats.instagram;
    document.getElementById('linkedinClicks').textContent = socialStats.linkedin;
    document.getElementById('youtubeClicks').textContent = socialStats.youtube;
}

// Track social media click (this should be called from your home page)
function trackSocialMediaClick(platform) {
    // Track regardless of who is clicking - we want all clicks
    const socialStats = JSON.parse(localStorage.getItem('socialMediaClicks')) || {
        github: 0,
        facebook: 0,
        twitter: 0,
        instagram: 0,
        linkedin: 0,
        youtube: 0
    };
    
    if (socialStats.hasOwnProperty(platform)) {
        socialStats[platform]++;
        localStorage.setItem('socialMediaClicks', JSON.stringify(socialStats));
    }
}

// Change time period for visitor chart
function changeTimePeriod(period) {
    loadVisitorChart(period);
}

// Calculate and display visitor summary statistics
function loadVisitorSummary() {
    const visitorStats = JSON.parse(localStorage.getItem('visitorStats')) || {
        daily: {},
        weekly: {},
        monthly: {},
        annually: {},
        totalVisits: 0
    };
    
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const weekKey = getWeekKey(now);
    const monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const yearKey = now.getFullYear().toString();
    
    // Update summary displays
    document.getElementById('todayVisits').textContent = visitorStats.daily[todayKey] || 0;
    document.getElementById('weekVisits').textContent = visitorStats.weekly[weekKey] || 0;
    document.getElementById('monthVisits').textContent = visitorStats.monthly[monthKey] || 0;
    document.getElementById('yearVisits').textContent = visitorStats.annually[yearKey] || 0;
    
    // Show the summary section
    document.getElementById('visitorSummary').style.display = 'grid';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initStatsPage);