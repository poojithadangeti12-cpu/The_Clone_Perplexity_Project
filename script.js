document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('search-input');
    const submitBtn = document.getElementById('submit-btn');
    const chatHistory = document.getElementById('chat-history');
    const suggestions = document.getElementById('suggestions');
    const container = document.querySelector('.container');
    const logo = document.querySelector('.logo');

    // File Upload Elements
    const plusBtn = document.getElementById('plus-btn');
    const fileInput = document.getElementById('file-input');
    const contextBadge = document.getElementById('context-badge');
    const filenameDisplay = document.getElementById('filename-display');
    const clearContextBtn = document.getElementById('clear-context');

    // Auth Elements
    const authModal = document.getElementById('auth-modal');
    const loginTrigger = document.getElementById('login-trigger');
    const signupTrigger = document.getElementById('signup-trigger');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const userControls = document.getElementById('user-controls');
    const premiumBadge = document.getElementById('premium-badge');

    // Voice Elements
    const micBtn = document.querySelector('.icon-btn[title="Microphone"]');
    const historyContainer = document.getElementById('history-container');
    const voiceHelp = document.getElementById('voice-help');

    // Suggestion Handling
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const suggestionItems = document.querySelectorAll('.suggestion-item');

    // Persistent Toolbar Button
    const toolbarPitchDeck = document.getElementById('toolbar-pitch-deck');
    if (toolbarPitchDeck) {
        toolbarPitchDeck.addEventListener('click', () => {
            fileInput.click();
        });
    }

    function handleSuggestion(query) {
        textarea.value = query;
        handleSubmit();
    }

    suggestionChips.forEach(chip => {
        if (!chip.dataset.query) return;
        chip.addEventListener('click', () => handleSuggestion(chip.dataset.query));
    });

    // Pitch Deck Shortcut Chip
    const pitchDeckChip = document.getElementById('pitch-deck-chip');
    if (pitchDeckChip) {
        pitchDeckChip.addEventListener('click', () => {
            fileInput.click();
        });
    }

    suggestionItems.forEach(item => {
        item.addEventListener('click', () => handleSuggestion(item.dataset.query));
    });

    // Auto-resize textarea
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    });

    // Enter to submit
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    });

    // --- Authentication Logic ---
    async function checkUserStatus() {
        try {
            const response = await fetch('/api/user_status');
            const data = await response.json();
            if (data.logged_in) {
                updateUIForLoggedIn(data.username, data.is_premium);
                loadChatHistory();
            } else {
                updateUIForLoggedOut();
            }
        } catch (e) {
            console.error("Auth check failed", e);
        }
    }

    async function loadChatHistory() {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            renderSidebarHistory(data);
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }

    function renderSidebarHistory(history) {
        if (!history || history.length === 0) {
            historyContainer.innerHTML = '<div class="history-empty">No previous chats</div>';
            return;
        }

        historyContainer.innerHTML = '';
        history.forEach(item => {
            const historyDiv = document.createElement('div');
            historyDiv.className = 'history-item';
            historyDiv.title = item.text;
            historyDiv.innerHTML = `
                <i class="fa-regular fa-message" style="margin-right: 10px; opacity: 0.5;"></i>
                ${item.text}
            `;
            historyDiv.addEventListener('click', () => {
                textarea.value = item.text;
                textarea.focus();
                // Optionally auto-submit if desired, but here we just populate
            });
            historyContainer.appendChild(historyDiv);
        });
    }

    function updateUIForLoggedIn(username, isPremium) {
        userControls.innerHTML = `
            <span style="color: #9aa0a6; font-size: 0.9rem; margin-right: 10px;">${username}</span>
            <button id="logout-btn" class="nav-btn">Logout</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        if (isPremium) premiumBadge.classList.remove('hidden');
        else premiumBadge.classList.add('hidden');
    }

    function updateUIForLoggedOut() {
        userControls.innerHTML = `
            <button id="login-trigger-new" class="nav-btn">Login</button>
            <button id="signup-trigger-new" class="nav-btn primary">Sign Up</button>
        `;
        document.getElementById('login-trigger-new').addEventListener('click', () => showAuth('login'));
        document.getElementById('signup-trigger-new').addEventListener('click', () => showAuth('signup'));
        premiumBadge.classList.add('hidden');
    }

    function showAuth(type) {
        authModal.classList.remove('hidden');
        if (type === 'login') {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        }
    }

    async function handleLogout() {
        await fetch('/api/logout', { method: 'POST' });
        window.location.reload();
    }

    loginTrigger.addEventListener('click', () => showAuth('login'));
    signupTrigger.addEventListener('click', () => showAuth('signup'));
    closeModal.addEventListener('click', () => authModal.classList.add('hidden'));
    showSignup.addEventListener('click', () => showAuth('signup'));
    showLogin.addEventListener('click', () => showAuth('login'));

    loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await response.json();
        if (data.success) {
            window.location.reload();
        } else {
            alert(data.error);
        }
    });

    signupBtn.addEventListener('click', async () => {
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await response.json();
        if (data.success) {
            window.location.reload();
        } else {
            alert(data.error);
        }
    });

    // Check status on load
    checkUserStatus();

    // --- Voice Input Logic ---
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        micBtn.addEventListener('click', () => {
            if (voiceHelp) voiceHelp.style.display = 'none'; // Hide once used
            if (micBtn.classList.contains('recording')) {
                recognition.stop();
            } else {
                recognition.start();
                micBtn.classList.add('recording');
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textarea.value = transcript;
            textarea.dispatchEvent(new Event('input')); // Trigger resize
        };

        recognition.onend = () => {
            micBtn.classList.remove('recording');
        };

        recognition.onerror = () => {
            micBtn.classList.remove('recording');
        };
    } else {
        micBtn.style.display = 'none';
    }

    const reviewBtn = document.getElementById('review-btn');

    // File Upload Logic
    plusBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        plusBtn.style.opacity = '0.5'; // Visual feedback

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                contextBadge.classList.remove('hidden');
                filenameDisplay.innerText = file.name;
                
                // Show review button if it's a PDF or PPTX
                const isPitchDeck = file.name.toLowerCase().endsWith('.pdf') || 
                                   file.name.toLowerCase().endsWith('.pptx') || 
                                   file.name.toLowerCase().endsWith('.ppt');
                if (isPitchDeck) {
                    reviewBtn.classList.remove('hidden');
                } else {
                    reviewBtn.classList.add('hidden');
                }
            } else {
                alert(`Upload failed: ${data.error}`);
            }
        } catch (error) {
            alert(`Error during upload: ${error.message}`);
        }

        plusBtn.style.opacity = '1';
        fileInput.value = ''; // Reset for next upload
    });

    clearContextBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/clear_context', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                contextBadge.classList.add('hidden');
            }
        } catch (error) {
            console.error("Error clearing context:", error);
        }
    });

    reviewBtn.addEventListener('click', handleReview);

    async function handleReview() {
        // Reset UI to show chat mode
        logo.style.fontSize = '2rem';
        logo.style.marginBottom = '10px';
        container.style.paddingTop = '40px';
        suggestions.classList.add('hidden');
        chatHistory.classList.remove('hidden');

        addMessage(`Review my pitch deck: ${filenameDisplay.innerText}`, 'user');

        // Add loading indicator with granular steps
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading';
        loadingDiv.innerHTML = `
            <div class="loading-steps">
                <div id="step-1" class="loading-step active"><i class="fa-solid fa-cloud-upload"></i> Pre-Processing Deck...</div>
                <div id="step-2" class="loading-step"><i class="fa-solid fa-chart-simple"></i> Running Scoring Engine...</div>
                <div id="step-3" class="loading-step"><i class="fa-solid fa-skull-crossbones"></i> Simulating Contrarian Engine...</div>
                <div id="step-4" class="loading-step"><i class="fa-solid fa-bolt"></i> Compiling Improvement Engine...</div>
                <div id="step-5" class="loading-step"><i class="fa-solid fa-wand-magic-sparkles"></i> Finalizing Investment Thesis...</div>
            </div>
        `;
        chatHistory.appendChild(loadingDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        const updateStep = (stepNum) => {
            const steps = loadingDiv.querySelectorAll('.loading-step');
            steps.forEach((s, i) => {
                const stepIcon = s.querySelector('i');
                if (i + 1 < stepNum) {
                    s.classList.remove('active');
                    s.classList.add('complete');
                    if (stepIcon) {
                        stepIcon.className = 'fa-solid fa-check';
                    }
                } else if (i + 1 === stepNum) {
                    s.classList.add('active');
                    if (stepIcon && !stepIcon.classList.contains('fa-spin')) {
                        stepIcon.className = 'fa-solid fa-spinner fa-spin';
                    }
                }
            });
        };

        try {
            updateStep(1);
            await new Promise(r => setTimeout(r, 600));
            updateStep(2);
            await new Promise(r => setTimeout(r, 800));
            updateStep(3);
            await new Promise(r => setTimeout(r, 1000));
            updateStep(4);

            const response = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            loadingDiv.remove();

            if (response.status === 401 && data.error === "AUTH_REQUIRED") {
                showAuth('login');
                addMessage("Please login to continue your review.", 'ai');
                return;
            }

            if (response.status === 429) {
                renderPaywall(data.message);
                return;
            }

            if (data.response) {
                renderReviewReport(data.response);
                loadChatHistory(); // Refresh sidebar after response
            } else {
                addMessage("Review failed: " + (data.error || "Unknown error"), 'ai');
            }
        } catch (error) {
            loadingDiv.remove();
            addMessage("Error: Could not connect to the API.", 'ai');
        }
    }

    function renderPaywall(message) {
        const paywallDiv = document.createElement('div');
        paywallDiv.className = 'message ai-message animate-in';
        
        paywallDiv.innerHTML = `
            <div class="paywall-container">
                <div class="paywall-icon"><i class="fa-solid fa-crown" style="color: #facc15;"></i></div>
                <h3 class="paywall-title">Premium Unlocked</h3>
                <p class="paywall-text" style="margin-bottom: 20px;">You've used all your free reviews. Upgrade to Pro to get unlimited access and deep investor-level analysis.</p>
                
                <ul class="premium-benefits-list">
                    <li><i class="fa-solid fa-check"></i> Unlimited Pitch Deck Reviews</li>
                    <li><i class="fa-solid fa-check"></i> Detailed Investor-Level Feedback</li>
                    <li><i class="fa-solid fa-check"></i> Star Ratings and Graph Analysis</li>
                    <li><i class="fa-solid fa-check"></i> Priority Processing</li>
                    <li><i class="fa-solid fa-check"></i> Advanced Evaluation Insights</li>
                </ul>

                <button class="upgrade-btn" onclick="alert('Proceeding to Stripe Checkout for PRO Plan...')">
                    Unlock Premium - ₹299/mo <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        chatHistory.appendChild(paywallDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function renderReviewReport(jsonString) {
        let dataStr = typeof jsonString === 'string' ? jsonString : JSON.stringify(jsonString);
        dataStr = dataStr.replace(/^```json/, '').replace(/```$/, '').trim();
        let payload;
        try {
            payload = JSON.parse(dataStr);
        } catch (e) {
            addMessage("Error: Failed to parse AI JSON response.", "ai");
            console.error("JSON parse error:", e, dataStr);
            return;
        }

        const reportDiv = document.createElement('div');
        reportDiv.className = 'message ai-message animate-in';

        // Use the template from index.html
        const template = document.getElementById('review-report-template');
        const reportContent = template.content.cloneNode(true);

        // Engine 5: One-line Pitch
        reportContent.querySelector('.one-line-pitch-text').innerText = payload.one_line_pitch || "Visionary Startup Pitch";

        // Engine 1: Review Engine
        reportContent.querySelector('.executive-summary').innerText = payload.executive_summary;
        reportContent.querySelector('.verdict-container').innerHTML = `<span class="verdict-badge">${payload.verdict}</span>`;

        // Engine 2: Scoring Engine
        const categories = [
            { key: "problem_clarity", label: "Problem Clarity" },
            { key: "solution_strength", label: "Solution Strength" },
            { key: "market_opportunity", label: "Market Opportunity" },
            { key: "business_model", label: "Business Model" },
            { key: "competitive_advantage", label: "Competitive Advantage" },
            { key: "team_strength", label: "Team Strength" },
            { key: "financial_clarity", label: "Financial Clarity" },
            { key: "storytelling", label: "Storytelling" },
            { key: "innovation", label: "Innovation" },
            { key: "overall_quality", label: "Overall Quality" }
        ];

        let scoreChipsHtml = '';
        categories.forEach(c => {
            const scoreObj = (payload.scoring_engine && payload.scoring_engine[c.key]) || { numeric_score: 0, star_rating: "☆☆☆☆☆" };
            scoreChipsHtml += `
                <div class="score-chip">
                    <span class="score-val" style="font-size: 1.1rem; color: #3b82f6;">${scoreObj.star_rating}</span>
                    <span class="score-label">${c.label}</span>
                </div>
            `;
        });
        reportContent.querySelector('.score-grid').innerHTML = scoreChipsHtml;

        // Engine 3: Contrarian Engine
        const contrarian = payload.contrarian_engine || {};
        let contrarianHtml = '';
        if (contrarian.failure_modes) {
            contrarianHtml += (contrarian.failure_modes).map(m => `<div class="failure-mode-item"><i class="fa-solid fa-triangle-exclamation"></i> ${m}</div>`).join('');
        }
        if (contrarian.devils_advocate_thesis) {
            contrarianHtml += `<div class="devils-advocate-text"><strong>Devil's Advocate Thesis:</strong> ${contrarian.devils_advocate_thesis}</div>`;
        }
        reportContent.querySelector('.contrarian-content').innerHTML = contrarianHtml;

        // Engine 4: Improvement Engine
        const improvement = payload.improvement_engine || {};
        let improvementHtml = '';
        if (improvement.critical_fixes) {
            improvementHtml += `<h4 style="margin: 10px 0; font-size: 0.9rem; color: #4ade80;">Critical Fixes</h4>` + (improvement.critical_fixes).map(f => `<div class="improvement-item"><i class="fa-solid fa-wrench"></i> ${f}</div>`).join('');
        }
        if (improvement.strategic_next_steps) {
            improvementHtml += `<h4 style="margin: 15px 0 10px 0; font-size: 0.9rem; color: #3b82f6;">Strategic Next Steps</h4>` + (improvement.strategic_next_steps).map(s => `<div class="improvement-item"><i class="fa-solid fa-map-location-dot"></i> ${s}</div>`).join('');
        }
        reportContent.querySelector('.improvement-content').innerHTML = improvementHtml;

        // Detailed Criterion Breakdown
        let detailsHtml = '<h3 style="margin: 30px 0 15px 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">Detailed Analysis</h3>';
        categories.forEach(c => {
            const scoreObj = payload.scoring_engine && payload.scoring_engine[c.key];
            if(scoreObj) {
                detailsHtml += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #3b82f6; margin-bottom: 5px;">${c.label} - ${scoreObj.numeric_score}/5.0</h4>
                        <p style="color: var(--text-primary); margin-bottom: 5px; font-size: 0.95rem;">${scoreObj.justification}</p>
                    </div>
                `;
            }
        });
        reportContent.querySelector('.review-details').innerHTML = detailsHtml;

        reportDiv.appendChild(reportContent);
        chatHistory.appendChild(reportDiv);

        // Assign IDs to canvases
        const radarCanvas = reportDiv.querySelector('.radar-chart');
        const barCanvas = reportDiv.querySelector('.bar-chart');
        radarCanvas.id = 'radar-' + Date.now();
        barCanvas.id = 'bar-' + Date.now();

        // Chart Data
        const radarData = (payload.graph_data && payload.graph_data.radar_chart) || [];
        const barData = (payload.graph_data && payload.graph_data.bar_graph) || [];
        const labels = categories.map(c => c.label);

        setTimeout(() => {
            new Chart(radarCanvas.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Investability Index',
                        data: radarData,
                        fill: true,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgb(59, 130, 246)',
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#fff'
                    }]
                },
                options: {
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            pointLabels: { color: '#9aa0a6', font: { size: 10 } },
                            ticks: { display: false, stepSize: 1 },
                            suggestedMin: 0,
                            suggestedMax: 5
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });

            new Chart(barCanvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Score',
                        data: barData,
                        backgroundColor: 'rgba(74, 222, 128, 0.6)',
                        borderColor: 'rgb(74, 222, 128)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    scales: {
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#9aa0a6' },
                            max: 5,
                            min: 0
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: '#efefef', font: { size: 11 } }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }, 100);

        chatHistory.scrollTop = chatHistory.scrollHeight;
    }


    submitBtn.addEventListener('click', handleSubmit);

    async function handleSubmit() {
        const query = textarea.value.trim();
        if (!query) return;

        // More subtle transitions to keep tools visible
        logo.style.fontSize = '2.2rem';
        logo.style.marginBottom = '8px';
        container.style.paddingTop = '10px';
        suggestions.classList.add('hidden');
        chatHistory.classList.remove('hidden');

        // Add user message
        addMessage(query, 'user');
        textarea.value = '';
        textarea.style.height = 'auto';

        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading';
        loadingDiv.innerText = 'Thinking...';
        chatHistory.appendChild(loadingDiv);
        
        try {
            // We'll try to use the search endpoint first
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query })
            });

            const data = await response.json();
            loadingDiv.remove();

            if (data.response) {
                addMessage(data.response, 'ai');
                loadChatHistory(); // Refresh sidebar after response
            } else if (data.error) {
                addMessage(`Error: ${data.error}`, 'ai');
            }
        } catch (error) {
            loadingDiv.remove();
            console.error('Error:', error);
            // Fallback for local testing if API isn't running
            addMessage("I'm sorry, I couldn't reach the backend server. Make sure the Flask app is running on localhost.", 'ai');
        }

        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function addMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}-message animate-in`;
        
        if (type === 'user') {
            msgDiv.innerText = text;
        } else {
            // Basic markdown-like formatting for AI
            msgDiv.innerHTML = text.replace(/\n/g, '<br>');
        }
        
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
});
