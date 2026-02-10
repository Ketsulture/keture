// KETURE DIARY - WITH IMAGE UPLOAD FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
    // Set your password here - CHANGE THIS TO YOUR OWN PASSWORD
    const SECRET_PASSWORD = "imgoingtobeasuccess1998"; // Change this to whatever password you want
    
    // Initialize the diary
    initDiary();
    
    // Setup password protection
    setupPasswordProtection();
    
    // Setup image upload if on new-entry page
    setupImageUpload();
    
    // Update UI based on authentication status
    const isAuthenticated = localStorage.getItem('keture_authenticated') === 'true';
    updateAuthUI(isAuthenticated);
    
    // Set up event listeners
    setupEventListeners();
});

function initDiary() {
    loadEntries();
    updateStats();
    setupViewToggle();
}

function setupPasswordProtection() {
    // Password modal elements
    const passwordModal = document.getElementById('password-modal');
    const editModeToggle = document.getElementById('edit-mode-toggle');
    const cancelLoginBtn = document.getElementById('cancel-login');
    const submitPasswordBtn = document.getElementById('submit-password');
    const passwordInput = document.getElementById('password-input');
    const modeStatus = document.getElementById('mode-status');
    const newEntryLink = document.getElementById('new-entry-link');
    
    // Set your password here
    const SECRET_PASSWORD = "keture2024"; // You can change this
    
    // Check authentication on page load
    const isAuthenticated = localStorage.getItem('keture_authenticated') === 'true';
    updateAuthUI(isAuthenticated);
    
    // Edit mode toggle click
    if (editModeToggle) {
        editModeToggle.addEventListener('click', function() {
            const isAuthenticated = localStorage.getItem('keture_authenticated') === 'true';
            
            if (isAuthenticated) {
                // Log out
                localStorage.setItem('keture_authenticated', 'false');
                updateAuthUI(false);
                showNotification('Edit mode locked', 'info');
            } else {
                // Show password modal
                if (passwordModal) {
                    passwordModal.style.display = 'block';
                    passwordInput.focus();
                }
            }
        });
    }
    
    // Cancel login
    if (cancelLoginBtn) {
        cancelLoginBtn.addEventListener('click', function() {
            if (passwordModal) {
                passwordModal.style.display = 'none';
                passwordInput.value = '';
            }
        });
    }
    
    // Submit password
    if (submitPasswordBtn) {
        submitPasswordBtn.addEventListener('click', function() {
            const enteredPassword = passwordInput.value;
            
            if (enteredPassword === SECRET_PASSWORD) {
                // Correct password
                localStorage.setItem('keture_authenticated', 'true');
                updateAuthUI(true);
                
                if (passwordModal) {
                    passwordModal.style.display = 'none';
                    passwordInput.value = '';
                }
                
                showNotification('Edit mode unlocked!', 'success');
            } else {
                // Wrong password
                showNotification('Incorrect password', 'error');
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }
    
    // Enter key for password input
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitPasswordBtn.click();
            }
        });
    }
    
    // Close modal when clicking outside
    if (passwordModal) {
        passwordModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                passwordInput.value = '';
            }
        });
    }
}

function updateAuthUI(isAuthenticated) {
    const editModeToggle = document.getElementById('edit-mode-toggle');
    const modeStatus = document.getElementById('mode-status');
    const newEntryLink = document.getElementById('new-entry-link');
    const modalEditBtn = document.getElementById('modal-edit');
    const modalDeleteBtn = document.getElementById('modal-delete');
    
    if (isAuthenticated) {
        // User is authenticated - EDIT MODE
        if (editModeToggle) {
            editModeToggle.innerHTML = '<i class="fas fa-unlock"></i> Exit Edit Mode';
            editModeToggle.style.background = '#28a745';
            editModeToggle.style.borderColor = '#28a745';
        }
        
        if (modeStatus) {
            modeStatus.textContent = 'Edit Mode';
            modeStatus.className = 'mode-status edit-mode';
        }
        
        if (newEntryLink) {
            newEntryLink.classList.remove('disabled');
            newEntryLink.href = 'new-entry.html';
            newEntryLink.innerHTML = '<i class="fas fa-plus-circle"></i> Inscribe Thought';
        }
        
        // Show edit/delete buttons in modal
        if (modalEditBtn) modalEditBtn.style.display = 'flex';
        if (modalDeleteBtn) modalDeleteBtn.style.display = 'flex';
        
    } else {
        // User is not authenticated - VIEW ONLY MODE
        if (editModeToggle) {
            editModeToggle.innerHTML = '<i class="fas fa-lock"></i> Enter Edit Mode';
            editModeToggle.style.background = '';
            editModeToggle.style.borderColor = '';
        }
        
        if (modeStatus) {
            modeStatus.textContent = 'View Only';
            modeStatus.className = 'mode-status';
        }
        
        if (newEntryLink) {
            newEntryLink.classList.add('disabled');
            newEntryLink.href = '#';
            newEntryLink.innerHTML = '<i class="fas fa-lock"></i> Locked';
        }
        
        // Hide edit/delete buttons in modal
        if (modalEditBtn) modalEditBtn.style.display = 'none';
        if (modalDeleteBtn) modalDeleteBtn.style.display = 'none';
    }
}

// IMAGE UPLOAD FUNCTIONALITY
let uploadedImages = [];

function setupImageUpload() {
    const imageUploadArea = document.getElementById('image-upload-area');
    const imageUploadInput = document.getElementById('image-upload-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    
    if (!imageUploadArea || !imageUploadInput) return;
    
    // Click to upload
    imageUploadArea.addEventListener('click', function() {
        imageUploadInput.click();
    });
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        imageUploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        imageUploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        imageUploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        imageUploadArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        imageUploadArea.classList.remove('drag-over');
    }
    
    // Handle drop
    imageUploadArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Handle file input change
    imageUploadInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    function handleFiles(files) {
        if (files.length === 0) return;
        
        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        const validFiles = [];
        
        for (let i = 0; i < files.length; i++) {
            if (files[i].size > maxSize) {
                showNotification(`Image "${files[i].name}" is too large (max 5MB)`, 'error');
                continue;
            }
            if (!files[i].type.startsWith('image/')) {
                showNotification(`File "${files[i].name}" is not an image`, 'error');
                continue;
            }
            validFiles.push(files[i]);
        }
        
        if (validFiles.length === 0) return;
        
        // Process each valid file
        validFiles.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageData = e.target.result;
                
                // Add to uploaded images array
                uploadedImages.push({
                    name: file.name,
                    data: imageData,
                    type: file.type,
                    size: file.size
                });
                
                // Create preview
                createImagePreview(imageData, file.name);
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    function createImagePreview(imageData, fileName) {
        if (!imagePreviewContainer) return;
        
        const previewDiv = document.createElement('div');
        previewDiv.className = 'image-preview';
        
        previewDiv.innerHTML = `
            <img src="${imageData}" alt="${fileName}">
            <button type="button" class="remove-image" title="Remove image">&times;</button>
        `;
        
        // Add remove functionality
        const removeBtn = previewDiv.querySelector('.remove-image');
        removeBtn.addEventListener('click', function() {
            // Remove from array
            uploadedImages = uploadedImages.filter(img => img.data !== imageData);
            
            // Remove preview
            previewDiv.remove();
            
            showNotification('Image removed', 'info');
        });
        
        imagePreviewContainer.appendChild(previewDiv);
    }
}// Add to your image upload function in script.js
function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onload = () => resolve(reader.result);
                }, 'image/jpeg', quality);
            };
        };
        reader.onerror = reject;
    });
}

function setupEventListeners() {
    // Modal close button
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('entry-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            const passwordModal = document.getElementById('password-modal');
            if (passwordModal && passwordModal.style.display === 'block') {
                passwordModal.style.display = 'none';
                document.getElementById('password-input').value = '';
            }
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterEntries(this.value.toLowerCase());
        });
    }
    
    // Filter functionality
    const filterSelect = document.getElementById('filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            filterEntriesByDate(this.value);
        });
    }
}

// Word counter for new entry page
document.addEventListener('DOMContentLoaded', function() {
    const entryContent = document.getElementById('entry-content');
    const wordCountSpan = document.getElementById('word-count');
    const charCountSpan = document.getElementById('char-count');
    
    if (entryContent && wordCountSpan && charCountSpan) {
        function updateWordCount() {
            const text = entryContent.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            const chars = text.length;
            wordCountSpan.textContent = words;
            charCountSpan.textContent = chars;
        }
        
        entryContent.addEventListener('input', updateWordCount);
        updateWordCount();
    }
    
    // Mood selector for new entry page
    const moodButtons = document.querySelectorAll('.mood-option');
    const selectedMoodInput = document.getElementById('selected-mood');
    
    if (moodButtons.length > 0 && selectedMoodInput) {
        moodButtons.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all mood options
                moodButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked option
                this.classList.add('active');
                // Update hidden input
                selectedMoodInput.value = this.getAttribute('data-mood');
            });
        });
    }
    
    // Category selector for new entry page
    const categoryButtons = document.querySelectorAll('.category-btn');
    const selectedCategoryInput = document.getElementById('entry-category');
    
    if (categoryButtons.length > 0 && selectedCategoryInput) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all category buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                // Update hidden input
                selectedCategoryInput.value = this.getAttribute('data-category');
            });
        });
    }
    
    // Form submission for new entry page
    const entryForm = document.getElementById('entry-form');
    if (entryForm) {
        entryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check if user is authenticated
            const isAuthenticated = localStorage.getItem('keture_authenticated') === 'true';
            if (!isAuthenticated) {
                showNotification('Please enter edit mode first', 'error');
                return;
            }
            
            const title = document.getElementById('entry-title').value;
            const content = document.getElementById('entry-content').value;
            const mood = selectedMoodInput ? selectedMoodInput.value : '💭';
            const category = selectedCategoryInput ? selectedCategoryInput.value : 'general';
            const tags = document.getElementById('entry-tags').value;
            
            // Create entry object with images
            const entry = {
                id: Date.now(),
                title: title || "Untitled Entry",
                content: content,
                mood: mood,
                category: category,
                images: uploadedImages, // Save images
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                }),
                timestamp: new Date().toISOString(),
                time: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            
            // Save to localStorage
            let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
            entries.push(entry);
            localStorage.setItem('diaryEntries', JSON.stringify(entries));
            
            // Show success message
            const imageCount = uploadedImages.length;
            const imageText = imageCount > 0 ? ` with ${imageCount} image${imageCount > 1 ? 's' : ''}` : '';
            showNotification(`Entry "${entry.title.substring(0, 30)}..." saved${imageText}!`, 'success');
            
            // Clear form and images
            this.reset();
            uploadedImages = [];
            const imagePreviewContainer = document.getElementById('image-preview-container');
            if (imagePreviewContainer) imagePreviewContainer.innerHTML = '';
            
            if (wordCountSpan) wordCountSpan.textContent = '0';
            if (charCountSpan) charCountSpan.textContent = '0';
            
            // Reset category and mood to defaults
            if (categoryButtons.length > 0) {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                categoryButtons[0].classList.add('active');
                if (selectedCategoryInput) selectedCategoryInput.value = 'general';
            }
            
            if (moodButtons.length > 0) {
                moodButtons.forEach(btn => btn.classList.remove('active'));
                moodButtons[1].classList.add('active');
                if (selectedMoodInput) selectedMoodInput.value = '💭';
            }
            
            // Redirect to main page after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
        
        // Save draft button
        const saveDraftBtn = document.getElementById('save-draft');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', function() {
                // Save current state as draft (simplified)
                const draft = {
                    title: document.getElementById('entry-title').value,
                    content: document.getElementById('entry-content').value,
                    images: uploadedImages,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('keture_draft', JSON.stringify(draft));
                showNotification('Draft saved locally', 'info');
            });
        }
    }
});

// Load and display entries
function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const container = document.getElementById('entries-container');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort by date (newest first)
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>Your diary is empty</h3>
                <p>Start documenting your thoughts by creating your first entry!</p>
                <button id="empty-state-edit-btn" class="edit-toggle-btn" style="margin-top: 20px;">
                    <i class="fas fa-lock"></i> Enter Edit Mode to Write
                </button>
            </div>
        `;
        
        // Add event listener to the empty state button
        setTimeout(() => {
            const emptyStateBtn = document.getElementById('empty-state-edit-btn');
            if (emptyStateBtn) {
                emptyStateBtn.addEventListener('click', function() {
                    document.getElementById('edit-mode-toggle').click();
                });
            }
        }, 100);
        
        return;
    }
    
    entries.forEach((entry, index) => {
        const card = createDiaryCard(entry, index);
        container.appendChild(card);
    });
}

// Create a diary card
function createDiaryCard(entry, index) {
    const card = document.createElement('div');
    card.className = 'thought-card';
    card.setAttribute('data-id', entry.id);
    card.setAttribute('data-category', entry.category || 'general');
    
    // Add image indicator class if entry has images
    if (entry.images && entry.images.length > 0) {
        card.classList.add('card-has-images');
    }
    
    // Truncate content for preview
    const previewText = entry.content.length > 200 
        ? entry.content.substring(0, 200) + '...' 
        : entry.content;
    
    // Category display name
    const categoryNames = {
        'general': 'General',
        'fashion': 'Fashion',
        'culture': 'Culture',
        'music': 'Music',
        'poetry': 'Poetry',
        'essay': 'Essay'
    };
    
    const categoryName = categoryNames[entry.category] || 'General';
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-category">${categoryName}</div>
            <div class="card-title">
                <span>${entry.title}</span>
                <span class="card-mood">${entry.mood}</span>
            </div>
            <div class="card-date">${entry.date} • ${entry.time || ''}</div>
        </div>
        <div class="card-preview">
            <p>${previewText}</p>
        </div>
        <div class="card-footer">
            <div class="card-tags">
                ${entry.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
            </div>
            <span class="card-read">Click to read →</span>
        </div>
    `;
    
    // Make entire card clickable
    card.addEventListener('click', function(e) {
        if (!e.target.classList.contains('modal-close') && 
            !e.target.classList.contains('btn-delete') &&
            !e.target.classList.contains('btn-edit')) {
            openEntryModal(entry);
        }
    });
    
    return card;
}

// Open entry in modal
function openEntryModal(entry) {
    const modal = document.getElementById('entry-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalMood = document.getElementById('modal-mood');
    const modalContent = document.getElementById('modal-content');
    const modalTags = document.getElementById('modal-tags');
    const modalCategory = document.getElementById('modal-category');
    const modalImages = document.getElementById('modal-images');
    
    if (!modal) return;
    
    // Category display name
    const categoryNames = {
        'general': 'General Thought',
        'fashion': 'Fashion Dimension',
        'culture': 'Culture Layer',
        'music': 'Sound Layer',
        'poetry': 'Poetry Space',
        'essay': 'Essay Form'
    };
    
    const categoryName = categoryNames[entry.category] || 'General Thought';
    
    // Populate modal with entry data
    modalTitle.textContent = entry.title;
    modalDate.textContent = `${entry.date} at ${entry.time || ''}`;
    modalMood.textContent = entry.mood;
    modalCategory.textContent = categoryName;
    modalContent.textContent = entry.content;
    
    // Add essay styling for essay category
    if (entry.category === 'essay') {
        modalContent.classList.add('essay-content');
    } else {
        modalContent.classList.remove('essay-content');
    }
    
    // Display images if any
    modalImages.innerHTML = '';
    if (entry.images && entry.images.length > 0) {
        const imageCount = document.createElement('div');
        imageCount.className = 'image-count';
        imageCount.textContent = `${entry.images.length} image${entry.images.length > 1 ? 's' : ''}`;
        modalImages.appendChild(imageCount);
        
        const gallery = document.createElement('div');
        gallery.className = 'modal-image-gallery';
        
        entry.images.forEach(image => {
            const imgItem = document.createElement('div');
            imgItem.className = 'modal-image-item';
            
            const img = document.createElement('img');
            img.src = image.data;
            img.alt = image.name;
            img.loading = 'lazy';
            
            imgItem.appendChild(img);
            gallery.appendChild(imgItem);
        });
        
        modalImages.appendChild(gallery);
    }
    
    // Create tags
    modalTags.innerHTML = '';
    entry.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'thought-tag';
        tagSpan.textContent = tag;
        modalTags.appendChild(tagSpan);
    });
    
    // Set up action buttons (only shown if authenticated)
    const editBtn = document.getElementById('modal-edit');
    const deleteBtn = document.getElementById('modal-delete');
    const isAuthenticated = localStorage.getItem('keture_authenticated') === 'true';
    
    if (editBtn && isAuthenticated) {
        editBtn.onclick = () => editEntry(entry.id);
        editBtn.style.display = 'flex';
    }
    
    if (deleteBtn && isAuthenticated) {
        deleteBtn.onclick = () => deleteEntry(entry.id);
        deleteBtn.style.display = 'flex';
    }
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('entry-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Filter functions
function filterEntries(searchTerm) {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const container = document.getElementById('entries-container');
    
    if (!container || !searchTerm) {
        loadEntries();
        return;
    }
    
    const filtered = entries.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm) ||
        entry.content.toLowerCase().includes(searchTerm) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    displayEntries(filtered);
}

function filterEntriesByDate(filter) {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    
    if (filter === 'all') {
        loadEntries();
        return;
    }
    
    const now = new Date();
    let filtered = entries;
    
    switch(filter) {
        case 'today':
            const today = now.toDateString();
            filtered = entries.filter(entry => 
                new Date(entry.timestamp).toDateString() === today
            );
            break;
        case 'week':
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            filtered = entries.filter(entry => 
                new Date(entry.timestamp) >= weekAgo
            );
            break;
        case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            filtered = entries.filter(entry => 
                new Date(entry.timestamp) >= monthAgo
            );
            break;
    }
    
    displayEntries(filtered);
}

function displayEntries(entries) {
    const container = document.getElementById('entries-container');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No entries found</h3>
                <p>Try a different search or create a new entry</p>
            </div>
        `;
        return;
    }
    
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    entries.forEach((entry, index) => {
        const card = createDiaryCard(entry, index);
        container.appendChild(card);
    });
}

// View toggle
function setupViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const container = document.getElementById('entries-container');
    
    if (!viewBtns.length || !container) return;
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Switch view
            const view = this.getAttribute('data-view');
            if (view === 'list') {
                container.classList.add('list-view');
            } else {
                container.classList.remove('list-view');
            }
        });
    });
}

// Update statistics
function updateStats() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    
    // Total entries
    const totalEl = document.getElementById('total-entries');
    if (totalEl) totalEl.textContent = entries.length;
    
    // Latest entry
    const latestEl = document.getElementById('latest-date');
    if (latestEl) {
        if (entries.length > 0) {
            const latest = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            const date = new Date(latest.timestamp);
            latestEl.textContent = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } else {
            latestEl.textContent = "-";
        }
    }
    
    // Categories count
    const categoriesEl = document.getElementById('categories-count');
    if (categoriesEl && entries.length > 0) {
        const categories = [...new Set(entries.map(entry => entry.category))];
        categoriesEl.textContent = categories.length;
    }
}

// Edit and Delete functions (only available in edit mode)
function editEntry(id) {
    const isAuthenticated = localStorage.getItem('keture_authenticated') === 'true';
    if (!isAuthenticated) {
        showNotification('Please enter edit mode first', 'error');
        return;
    }
    
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const entry = entries.find(e => e.id === id);
    
    if (entry) {
        // Store entry to edit in localStorage
        localStorage.setItem('editEntry', JSON.stringify(entry));
        
        // Remove from main storage temporarily
        const filtered = entries.filter(e => e.id !== id);
        localStorage.setItem('diaryEntries', JSON.stringify(filtered));
        
        // Redirect to edit page
        window.location.href = 'new-entry.html?edit=true';
    }
}

function deleteEntry(id) {
    const isAuthenticated = localStorage.getItem('keture_authenticated') === 'true';
    if (!isAuthenticated) {
        showNotification('Please enter edit mode first', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
        let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        entries = entries.filter(entry => entry.id !== id);
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
        
        closeModal();
        loadEntries();
        updateStats();
        
        showNotification('Entry deleted', 'success');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    background: var(--charcoal);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-width: 300px;
    max-width: 400px;
    z-index: 9999;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    background: #28a745;
}

.notification-error {
    background: #dc3545;
}

.notification-info {
    background: var(--charcoal);
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
}

.notification-close:hover {
    opacity: 1;
}
`;

// Inject notification styles
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Category tabs functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab[data-category]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filter entries by category
            if (category === 'all') {
                loadEntries();
            } else {
                filterByCategory(category);
            }
        });
    });
});

function filterByCategory(category) {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const filtered = entries.filter(entry => entry.category === category);
    displayEntries(filtered);
}

// Load draft on page load (for new-entry page)
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('new-entry.html')) {
        const draft = localStorage.getItem('keture_draft');
        if (draft) {
            try {
                const draftData = JSON.parse(draft);
                const titleInput = document.getElementById('entry-title');
                const contentInput = document.getElementById('entry-content');
                
                if (titleInput && draftData.title) titleInput.value = draftData.title;
                if (contentInput && draftData.content) contentInput.value = draftData.content;
                
                // Load images from draft
                if (draftData.images && draftData.images.length > 0) {
                    uploadedImages = draftData.images;
                    const imagePreviewContainer = document.getElementById('image-preview-container');
                    if (imagePreviewContainer) {
                        imagePreviewContainer.innerHTML = '';
                        draftData.images.forEach(image => {
                            createImagePreview(image.data, image.name);
                        });
                    }
                }
            } catch (e) {
                console.log('No valid draft found');
            }
        }
        
        // Check for edit mode
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('edit') === 'true') {
            const editEntry = localStorage.getItem('editEntry');
            if (editEntry) {
                try {
                    const entryData = JSON.parse(editEntry);
                    const titleInput = document.getElementById('entry-title');
                    const contentInput = document.getElementById('entry-content');
                    const tagsInput = document.getElementById('entry-tags');
                    
                    if (titleInput) titleInput.value = entryData.title;
                    if (contentInput) contentInput.value = entryData.content;
                    if (tagsInput) tagsInput.value = entryData.tags.join(', ');
                    
                    // Set category
                    const categoryButtons = document.querySelectorAll('.category-btn');
                    const selectedCategoryInput = document.getElementById('entry-category');
                    if (categoryButtons.length > 0 && selectedCategoryInput) {
                        categoryButtons.forEach(btn => btn.classList.remove('active'));
                        const targetBtn = Array.from(categoryButtons).find(
                            btn => btn.getAttribute('data-category') === entryData.category
                        );
                        if (targetBtn) {
                            targetBtn.classList.add('active');
                            selectedCategoryInput.value = entryData.category;
                        }
                    }
                    
                    // Set mood
                    const moodOptions = document.querySelectorAll('.mood-option');
                    const selectedMoodInput = document.getElementById('selected-mood');
                    if (moodOptions.length > 0 && selectedMoodInput) {
                        moodOptions.forEach(opt => opt.classList.remove('active'));
                        const targetMood = Array.from(moodOptions).find(
                            opt => opt.getAttribute('data-mood') === entryData.mood
                        );
                        if (targetMood) {
                            targetMood.classList.add('active');
                            selectedMoodInput.value = entryData.mood;
                        }
                    }
                    
                    // Load images
                    if (entryData.images && entryData.images.length > 0) {
                        uploadedImages = entryData.images;
                        const imagePreviewContainer = document.getElementById('image-preview-container');
                        if (imagePreviewContainer) {
                            imagePreviewContainer.innerHTML = '';
                            entryData.images.forEach(image => {
                                createImagePreview(image.data, image.name);
                            });
                        }
                    }
                } catch (e) {
                    console.log('Error loading entry for edit:', e);
                }
            }
        }
    }
});
// ===== VISIONS FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the visions page
    if (document.querySelector('.visions-page')) {
        initVisionsPage();
    }
});

function initVisionsPage() {
    loadVisions();
    setupVisionFilters();
    setupVisionForm();
    setupDailyPrompt();
}

// Vision data structure
function loadVisions() {
    const visions = JSON.parse(localStorage.getItem('keture_visions') || '[]');
    const container = document.getElementById('visions-container');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (visions.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-mountain"></i>
                <h3>No visions yet</h3>
                <p>Begin mapping your becoming by planting your first vision</p>
            </div>
        `;
        return;
    }
    
    // Sort by timeline
    visions.sort((a, b) => parseInt(a.timeline) - parseInt(b.timeline));
    
    visions.forEach(vision => {
        const card = createVisionCard(vision);
        container.appendChild(card);
    });
}

function createVisionCard(vision) {
    const card = document.createElement('div');
    card.className = `vision-card ${vision.type}`;
    card.setAttribute('data-type', vision.type);
    card.setAttribute('data-timeline', vision.timeline);
    
    // Type labels
    const typeLabels = {
        'aspirations': 'Aspiration',
        'projects': 'Project',
        'skills': 'Skill',
        'embodiments': 'Embodiment'
    };
    
    // Timeline labels
    const timelineLabels = {
        '2024': 'Now (2024)',
        '2025': '2025',
        '2026': '2026',
        '2027': 'Beyond 2027'
    };
    
    card.innerHTML = `
        <div class="vision-header">
            <div>
                <h3 class="vision-title">${vision.title}</h3>
                <span class="vision-type-badge">${typeLabels[vision.type] || vision.type}</span>
            </div>
        </div>
        <div class="vision-description">
            ${vision.description}
        </div>
        <div class="vision-footer">
            <span class="vision-timeline">${timelineLabels[vision.timeline] || vision.timeline}</span>
            <div class="vision-progress">
                <button class="progress-btn" onclick="updateVisionProgress('${vision.id}', 'seed')">
                    <i class="fas fa-seedling"></i> Seed
                </button>
                <button class="progress-btn" onclick="updateVisionProgress('${vision.id}', 'growing')">
                    <i class="fas fa-leaf"></i> Growing
                </button>
                <button class="progress-btn" onclick="updateVisionProgress('${vision.id}', 'blooming')">
                    <i class="fas fa-feather-alt"></i> Blooming
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function setupVisionFilters() {
    const visionTypes = document.querySelectorAll('.vision-type');
    const timelineMarkers = document.querySelectorAll('.timeline-marker');
    
    // Filter by type
    visionTypes.forEach(type => {
        type.addEventListener('click', function() {
            visionTypes.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filterType = this.getAttribute('data-type');
            filterVisions(filterType);
        });
    });
    
    // Filter by timeline
    timelineMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            timelineMarkers.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            const timeline = this.getAttribute('data-year');
            filterVisionsByTimeline(timeline);
        });
    });
}

function filterVisions(type) {
    const allCards = document.querySelectorAll('.vision-card');
    
    allCards.forEach(card => {
        if (type === 'all' || card.getAttribute('data-type') === type) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterVisionsByTimeline(timeline) {
    const allCards = document.querySelectorAll('.vision-card');
    
    allCards.forEach(card => {
        if (card.getAttribute('data-timeline') === timeline) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function setupVisionForm() {
    const saveBtn = document.getElementById('save-vision');
    
    if (!saveBtn) return;
    
    saveBtn.addEventListener('click', function() {
        const title = document.getElementById('vision-title').value.trim();
        const description = document.getElementById('vision-description').value.trim();
        const type = document.getElementById('vision-type').value;
        const timeline = document.getElementById('vision-timeline').value;
        
        if (!title || !description) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        const vision = {
            id: Date.now(),
            title: title,
            description: description,
            type: type,
            timeline: timeline,
            progress: 'seed', // seed, growing, blooming
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        let visions = JSON.parse(localStorage.getItem('keture_visions') || '[]');
        visions.push(vision);
        localStorage.setItem('keture_visions', JSON.stringify(visions));
        
        // Clear form
        document.getElementById('vision-title').value = '';
        document.getElementById('vision-description').value = '';
        
        // Reload visions
        loadVisions();
        
        showNotification(`Vision "${title}" planted!`, 'success');
    });
}

function updateVisionProgress(visionId, progress) {
    let visions = JSON.parse(localStorage.getItem('keture_visions') || '[]');
    const visionIndex = visions.findIndex(v => v.id === parseInt(visionId));
    
    if (visionIndex !== -1) {
        visions[visionIndex].progress = progress;
        visions[visionIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('keture_visions', JSON.stringify(visions));
        
        showNotification(`Vision marked as ${progress}`, 'info');
        loadVisions();
    }
}

// Add link to visions page in your main navigation
// Add this to your index.html in the mind-tabs section:
// <a href="visions.html" class="tab">
//     <i class="fas fa-mountain"></i> Visions
// </a>
// Add to your existing script.js
function exportEntries() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const manifestos = JSON.parse(localStorage.getItem('keture_visions') || '[]');
    
    const exportData = {
        diary: entries,
        manifestos: manifestos,
        exportDate: new Date().toISOString(),
        version: "Keture Archive v1.0"
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `keture-archive-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Archive exported successfully', 'success');
}

function importEntries(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (confirm('This will replace ALL current entries. Continue?')) {
                if (importData.diary) {
                    localStorage.setItem('diaryEntries', JSON.stringify(importData.diary));
                }
                if (importData.manifestos) {
                    localStorage.setItem('keture_visions', JSON.stringify(importData.manifestos));
                }
                
                loadEntries();
                if (typeof loadManifestos === 'function') loadManifestos();
                showNotification('Archive imported successfully', 'success');
            }
        } catch (error) {
            showNotification('Invalid archive file', 'error');
        }
    };
    reader.readAsText(file);
}
// Add keyword extraction to entries
function extractKeywords(text) {
    const commonWords = ['the', 'and', 'that', 'for', 'with', 'this', 'but', 'not'];
    const words = text.toLowerCase().split(/\W+/);
    const frequency = {};
    
    words.forEach(word => {
        if (word.length > 3 && !commonWords.includes(word)) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    });
    
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
}
// Add to new-entry.html script
let autoSaveTimer;

function startAutoSave() {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    
    autoSaveTimer = setInterval(() => {
        const draft = {
            title: document.getElementById('entry-title').value,
            content: document.getElementById('entry-content').value,
            tags: document.getElementById('entry-tags').value,
            timestamp: new Date().toISOString()
        };
        
        if (draft.title || draft.content) {
            localStorage.setItem('keture_auto_draft', JSON.stringify(draft));
            console.log('Auto-saved draft');
        }
    }, 30000); // Every 30 seconds
}

// Load auto-saved draft on page load
const autoDraft = localStorage.getItem('keture_auto_draft');
if (autoDraft) {
    const draft = JSON.parse(autoDraft);
    // Auto-fill form with draft
}
// Add touch events for better mobile interaction
function setupMobileTouch() {
    // Prevent double-tap zoom on buttons
    document.querySelectorAll('button, .vision-badge, .timeline-frame').forEach(element => {
        element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.opacity = '0.8';
        });
        
        element.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
    
    // Better touch for progress buttons
    document.querySelectorAll('.progress-btn').forEach(btn => {
        btn.style.touchAction = 'manipulation';
        btn.style.webkitTapHighlightColor = 'transparent';
    });
}

// Call this in your init function
function initManifestosStudio() {
    loadManifestos();
    setupStudioFilters();
    setupManifestoForm();
    setupStudioAccess();
    setupMobileTouch(); // Add this line
}
// Add this function to your script
function setupNavigation() {
    const exitBtn = document.querySelector('.studio-exit');
    if (exitBtn) {
        exitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Try different paths
            const paths = [
                'index.html',
                './index.html',
                '../index.html',
                '/index.html',
                window.location.origin // Go to root
            ];
            
            // Try each path
            for (let path of paths) {
                try {
                    // Check if file exists (simplified check)
                    fetch(path, { method: 'HEAD' })
                        .then(response => {
                            if (response.ok) {
                                window.location.href = path;
                                return;
                            }
                        })
                        .catch(() => {
                            // Try next path
                        });
                } catch (error) {
                    console.log('Trying next path...');
                }
            }
            
            // If all fails, go back or show message
            setTimeout(() => {
                if (confirm('Cannot find main page. Go to homepage?')) {
                    window.location.href = window.location.origin || '/';
                }
            }, 500);
        });
    }
}

// Call it in your init function
function initManifestosStudio() {
    loadManifestos();
    setupStudioFilters();
    setupManifestoForm();
    setupStudioAccess();
    setupNavigation(); // Add this line
}
// Add this function
function fixExitButton() {
    const exitBtn = document.querySelector('.studio-exit');
    
    if (exitBtn) {
        // Remove all existing click listeners
        const newExitBtn = exitBtn.cloneNode(true);
        exitBtn.parentNode.replaceChild(newExitBtn, exitBtn);
        
        // Add a clean click handler
        newExitBtn.addEventListener('click', function(e) {
            console.log('Navigating to index.html...');
            
            // Try multiple locations if first fails
            const tryPaths = [
                'index.html',
                './index.html',
                window.location.pathname.replace('manifestos.html', 'index.html'),
                '/index.html'
            ];
            
            let success = false;
            
            for (let path of tryPaths) {
                fetch(path, { method: 'HEAD' })
                    .then(response => {
                        if (response.ok && !success) {
                            success = true;
                            window.location.href = path;
                            return;
                        }
                    })
                    .catch(() => {});
            }
            
            // If none work after 1 second, show error
            setTimeout(() => {
                if (!success) {
                    if (confirm('Cannot find main page. Would you like to create a test index.html?')) {
                        // Create a temporary index.html
                        const tempIndex = '<html><body><h1>Welcome</h1><a href="manifestos.html">Go to Manifestos</a></body></html>';
                        const blob = new Blob([tempIndex], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        window.location.href = url;
                    }
                }
            }, 1000);
            
            e.preventDefault();
        });
    }
}

// Call it in your init
function initManifestosStudio() {
    fixExitButton(); // Add this first!
    loadManifestos();
    setupStudioFilters();
    setupManifestoForm();
    setupStudioAccess();
}