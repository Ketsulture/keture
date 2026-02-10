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
    const SECRET_PASSWORD = "imgoingtobeasuccess1998"; // You can change this
    
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
            newEntryLink.href = 'javascript:void(0)';
            newEntryLink.innerHTML = '<i class="fas fa-plus-circle"></i> Inscribe Thought';
            newEntryLink.onclick = createNewEntry;
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
            newEntryLink.href = 'javascript:void(0)';
            newEntryLink.innerHTML = '<i class="fas fa-lock"></i> Locked';
            newEntryLink.onclick = function() {
                showNotification('Enter edit mode first', 'error');
            };
        }
        
        // Hide edit/delete buttons in modal
        if (modalEditBtn) modalEditBtn.style.display = 'none';
        if (modalDeleteBtn) modalDeleteBtn.style.display = 'none';
    }
}

// ===== FORM-BASED ENTRY CREATION =====
function createNewEntry() {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('keture_authenticated') === 'true';
    if (!isAuthenticated) {
        showNotification('Enter edit mode first', 'error');
        const passwordModal = document.getElementById('password-modal');
        if (passwordModal) {
            passwordModal.style.display = 'block';
            document.getElementById('password-input').focus();
        }
        return;
    }
    
    // Remove any existing form
    const existingForm = document.getElementById('entry-form-modal');
    if (existingForm) existingForm.remove();
    
    // Create form modal
    const formHTML = `
        <div id="entry-form-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:1001;display:flex;align-items:center;justify-content:center;">
            <div style="background:var(--vogue-white);padding:3rem;max-width:500px;width:90%;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
                    <h3 style="font-family:var(--font-serif);color:var(--coffee-dark);">Create New Entry</h3>
                    <button onclick="document.getElementById('entry-form-modal').remove()" style="background:none;border:none;font-size:1.5rem;color:var(--vogue-gray);cursor:pointer;">&times;</button>
                </div>
                
                <form id="new-entry-form" style="display:flex;flex-direction:column;gap:1.5rem;">
                    <div>
                        <label style="display:block;margin-bottom:0.5rem;color:var(--coffee-medium);font-size:0.9rem;">Entry Title</label>
                        <input type="text" id="entry-title" required style="width:100%;padding:12px;border:1px solid var(--vogue-border);font-size:1rem;border-radius:4px;">
                    </div>
                    
                    <div>
                        <label style="display:block;margin-bottom:0.5rem;color:var(--coffee-medium);font-size:0.9rem;">Category</label>
                        <select id="entry-category" required style="width:100%;padding:12px;border:1px solid var(--vogue-border);font-size:1rem;border-radius:4px;">
                            <option value="fashion">Fashion</option>
                            <option value="culture">Culture</option>
                            <option value="music">Sound</option>
                            <option value="poetry">Poetry</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display:block;margin-bottom:0.5rem;color:var(--coffee-medium);font-size:0.9rem;">Content</label>
                        <textarea id="entry-content" required rows="6" style="width:100%;padding:12px;border:1px solid var(--vogue-border);font-size:1rem;resize:vertical;border-radius:4px;"></textarea>
                        <div style="font-size:0.8rem;color:var(--vogue-gray);margin-top:0.5rem;">Word count: <span id="form-word-count">0</span></div>
                    </div>
                    
                    <div style="display:flex;gap:1rem;margin-top:1rem;">
                        <button type="button" onclick="document.getElementById('entry-form-modal').remove()" style="flex:1;padding:12px;background:var(--vogue-light-gray);border:1px solid var(--vogue-border);color:var(--vogue-black);cursor:pointer;border-radius:4px;">Cancel</button>
                        <button type="submit" style="flex:1;padding:12px;background:var(--coffee-dark);border:none;color:white;cursor:pointer;border-radius:4px;">Create Entry</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHTML);
    
    // Add word count functionality
    const textarea = document.getElementById('entry-content');
    const wordCountSpan = document.getElementById('form-word-count');
    
    textarea.addEventListener('input', function() {
        const text = this.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        wordCountSpan.textContent = words;
    });
    
    // Handle form submission
    document.getElementById('new-entry-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('entry-title').value;
        const category = document.getElementById('entry-category').value;
        const content = document.getElementById('entry-content').value;
        
        if (title && category && content) {
            const newEntry = {
                id: Date.now(),
                title: title,
                category: category.toLowerCase(),
                content: content,
                date: new Date().toISOString(),
                tags: []
            };
            
            const entries = JSON.parse(localStorage.getItem('keture_entries') || '[]');
            entries.push(newEntry);
            localStorage.setItem('keture_entries', JSON.stringify(entries));
            
            loadEntries();
            updateStats();
            document.getElementById('entry-form-modal').remove();
            showNotification('Entry created successfully!', 'success');
        } else {
            showNotification('Please fill in all fields', 'error');
        }
    });
    
    // Focus on title field
    setTimeout(() => document.getElementById('entry-title').focus(), 100);
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
}

// Image compression function
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

function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('keture_entries') || '[]');
    const container = document.getElementById('entries-container');
    
    if (!container) return;
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="thought-card">
                <div class="thought-header">
                    <h3 class="thought-title">Welcome to KETURE</h3>
                    <span class="thought-category">Archive</span>
                </div>
                <div class="thought-preview">
                    This is your personal archive. Enter edit mode and click "Inscribe" to add your first thought.
                </div>
                <div class="thought-footer">
                    <span class="thought-date">Today</span>
                    <button class="thought-view">View</button>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = entries.map(entry => `
        <div class="thought-card" data-category="${entry.category}" data-date="${entry.date}">
            <div class="thought-header">
                <h3 class="thought-title">${entry.title}</h3>
                <span class="thought-category">${entry.category}</span>
            </div>
            <div class="thought-preview">
                ${entry.content.substring(0, 150)}${entry.content.length > 150 ? '...' : ''}
            </div>
            <div class="thought-footer">
                <span class="thought-date">${formatDate(entry.date)}</span>
                <button class="thought-view" onclick="viewEntry('${entry.id}')">View</button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const entries = JSON.parse(localStorage.getItem('keture_entries') || '[]');
    const categories = new Set(entries.map(e => e.category));
    
    const totalEntriesEl = document.getElementById('total-entries');
    const categoriesCountEl = document.getElementById('categories-count');
    const latestDateEl = document.getElementById('latest-date');
    
    if (totalEntriesEl) totalEntriesEl.textContent = entries.length;
    if (categoriesCountEl) categoriesCountEl.textContent = categories.size;
    
    if (entries.length > 0 && latestDateEl) {
        const latest = entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        latestDateEl.textContent = formatDate(latest.date);
    }
}

function setupViewToggle() {
    // This function sets up the expand/collapse functionality for entries
    // You can customize this based on how you want entries to display
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
            const entryFormModal = document.getElementById('entry-form-modal');
            if (entryFormModal) {
                entryFormModal.remove();
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

function filterEntries(searchTerm) {
    const cards = document.querySelectorAll('.thought-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.thought-title').textContent.toLowerCase();
        const content = card.querySelector('.thought-preview').textContent.toLowerCase();
        const category = card.querySelector('.thought-category').textContent.toLowerCase();
        
        const matches = title.includes(searchTerm) || 
                       content.includes(searchTerm) || 
                       category.includes(searchTerm);
        
        card.style.display = matches ? 'block' : 'none';
    });
}

function filterEntriesByDate(range) {
    const cards = document.querySelectorAll('.thought-card');
    const now = new Date();
    
    cards.forEach(card => {
        const entryDate = new Date(card.dataset.date);
        let show = true;
        
        switch(range) {
            case 'today':
                show = entryDate.toDateString() === now.toDateString();
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                show = entryDate >= weekAgo;
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                show = entryDate >= monthAgo;
                break;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

function viewEntry(id) {
    const entries = JSON.parse(localStorage.getItem('keture_entries') || '[]');
    const entry = entries.find(e => e.id == id);
    
    if (!entry) return;
    
    const modal = document.getElementById('entry-modal');
    if (modal) {
        document.getElementById('modal-title').textContent = entry.title;
        document.getElementById('modal-category').textContent = entry.category;
        document.getElementById('modal-content').innerHTML = entry.content.replace(/\n/g, '<br>');
        document.getElementById('modal-date').textContent = formatDate(entry.date);
        
        // Show edit/delete buttons if authenticated
        const isAuthenticated = localStorage.getItem('keture_authenticated') === 'true';
        const editBtn = document.getElementById('modal-edit');
        const deleteBtn = document.getElementById('modal-delete');
        
        if (editBtn) editBtn.style.display = isAuthenticated ? 'flex' : 'none';
        if (deleteBtn) deleteBtn.style.display = isAuthenticated ? 'flex' : 'none';
        
        // Set up edit/delete functionality
        if (isAuthenticated) {
            editBtn.onclick = function() { editEntry(entry.id); };
            deleteBtn.onclick = function() { deleteEntry(entry.id); };
        }
        
        modal.style.display = 'flex';
    }
}

function editEntry(id) {
    const entries = JSON.parse(localStorage.getItem('keture_entries') || '[]');
    const entry = entries.find(e => e.id == id);
    
    if (!entry) return;
    
    // Remove any existing form
    const existingForm = document.getElementById('entry-form-modal');
    if (existingForm) existingForm.remove();
    
    // Create edit form modal
    const formHTML = `
        <div id="entry-form-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:1001;display:flex;align-items:center;justify-content:center;">
            <div style="background:var(--vogue-white);padding:3rem;max-width:500px;width:90%;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
                    <h3 style="font-family:var(--font-serif);color:var(--coffee-dark);">Edit Entry</h3>
                    <button onclick="document.getElementById('entry-form-modal').remove()" style="background:none;border:none;font-size:1.5rem;color:var(--vogue-gray);cursor:pointer;">&times;</button>
                </div>
                
                <form id="edit-entry-form" style="display:flex;flex-direction:column;gap:1.5rem;">
                    <div>
                        <label style="display:block;margin-bottom:0.5rem;color:var(--coffee-medium);font-size:0.9rem;">Entry Title</label>
                        <input type="text" id="edit-entry-title" value="${entry.title}" required style="width:100%;padding:12px;border:1px solid var(--vogue-border);font-size:1rem;border-radius:4px;">
                    </div>
                    
                    <div>
                        <label style="display:block;margin-bottom:0.5rem;color:var(--coffee-medium);font-size:0.9rem;">Category</label>
                        <select id="edit-entry-category" required style="width:100%;padding:12px;border:1px solid var(--vogue-border);font-size:1rem;border-radius:4px;">
                            <option value="fashion" ${entry.category === 'fashion' ? 'selected' : ''}>Fashion</option>
                            <option value="culture" ${entry.category === 'culture' ? 'selected' : ''}>Culture</option>
                            <option value="music" ${entry.category === 'music' ? 'selected' : ''}>Sound</option>
                            <option value="poetry" ${entry.category === 'poetry' ? 'selected' : ''}>Poetry</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display:block;margin-bottom:0.5rem;color:var(--coffee-medium);font-size:0.9rem;">Content</label>
                        <textarea id="edit-entry-content" required rows="6" style="width:100%;padding:12px;border:1px solid var(--vogue-border);font-size:1rem;resize:vertical;border-radius:4px;">${entry.content}</textarea>
                        <div style="font-size:0.8rem;color:var(--vogue-gray);margin-top:0.5rem;">Word count: <span id="edit-form-word-count">${entry.content.trim() ? entry.content.trim().split(/\s+/).length : 0}</span></div>
                    </div>
                    
                    <div style="display:flex;gap:1rem;margin-top:1rem;">
                        <button type="button" onclick="document.getElementById('entry-form-modal').remove()" style="flex:1;padding:12px;background:var(--vogue-light-gray);border:1px solid var(--vogue-border);color:var(--vogue-black);cursor:pointer;border-radius:4px;">Cancel</button>
                        <button type="submit" style="flex:1;padding:12px;background:var(--coffee-dark);border:none;color:white;cursor:pointer;border-radius:4px;">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHTML);
    closeModal();
    
    // Add word count functionality
    const textarea = document.getElementById('edit-entry-content');
    const wordCountSpan = document.getElementById('edit-form-word-count');
    
    textarea.addEventListener('input', function() {
        const text = this.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        wordCountSpan.textContent = words;
    });
    
    // Handle form submission
    document.getElementById('edit-entry-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('edit-entry-title').value;
        const category = document.getElementById('edit-entry-category').value;
        const content = document.getElementById('edit-entry-content').value;
        
        if (title && category && content) {
            const entries = JSON.parse(localStorage.getItem('keture_entries') || '[]');
            const index = entries.findIndex(e => e.id == id);
            
            if (index !== -1) {
                entries[index] = {
                    ...entries[index],
                    title: title,
                    category: category.toLowerCase(),
                    content: content,
                    date: new Date().toISOString() // Update date when edited
                };
                
                localStorage.setItem('keture_entries', JSON.stringify(entries));
                
                loadEntries();
                updateStats();
                document.getElementById('entry-form-modal').remove();
                showNotification('Entry updated successfully!', 'success');
            }
        } else {
            showNotification('Please fill in all fields', 'error');
        }
    });
    
    // Focus on title field
    setTimeout(() => document.getElementById('edit-entry-title').focus(), 100);
}

function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        return;
    }
    
    const entries = JSON.parse(localStorage.getItem('keture_entries') || '[]');
    const filteredEntries = entries.filter(e => e.id != id);
    
    localStorage.setItem('keture_entries', JSON.stringify(filteredEntries));
    
    loadEntries();
    updateStats();
    closeModal();
    showNotification('Entry deleted', 'info');
}

function closeModal() {
    const modal = document.getElementById('entry-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days/7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;margin-left:1rem;">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Export/Import functionality
function exportAllData() {
    const entries = JSON.parse(localStorage.getItem('keture_entries') || '[]');
    
    const allData = {
        entries: entries,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const fileName = `keture-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();
    
    showNotification('Backup downloaded successfully', 'success');
}

function importAllData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm(`Import ${data.entries?.length || 0} entries? This will replace your current data.`)) {
                if (data.entries) {
                    localStorage.setItem('keture_entries', JSON.stringify(data.entries));
                    loadEntries();
                    updateStats();
                    showNotification('Data imported successfully', 'success');
                }
            }
        } catch (error) {
            showNotification('Error importing data. Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// Make functions available globally
window.viewEntry = viewEntry;
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;
window.closeModal = closeModal;
window.exportAllData = exportAllData;
window.importAllData = importAllData;
window.createNewEntry = createNewEntry;
