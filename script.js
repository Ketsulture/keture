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
                selected