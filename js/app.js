class ModernTodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'created';
        this.sortOrder = 'desc';
        this.selectedPriority = 'medium';
        this.searchQuery = '';
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.loadTasks();
        this.bindEvents();
        this.setupFormValidation();
        this.setupMobileResponsiveness();
        this.updateUI();
        this.selectPriority('medium'); // Initialize priority selection
    }

    setupMobileResponsiveness() {
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.handleMobileLayout();
        });
        this.handleMobileLayout();
    }

    handleMobileLayout() {
        const formContainer = document.getElementById('taskFormContainer');
        const listContainer = document.querySelector('.lg\\:col-span-2');
        
        if (this.isMobile) {
            this.addMobileToggleButton();
            // Hide form initially on mobile
            if (formContainer) {
                formContainer.style.display = 'none';
            }
        } else {
            this.removeMobileToggleButton();
            // Show form on desktop
            if (formContainer) {
                formContainer.style.display = 'block';
            }
        }
    }

    addMobileToggleButton() {
        const existingToggle = document.getElementById('mobileToggle');
        if (existingToggle) return;

        const toggleButton = document.createElement('button');
        toggleButton.id = 'mobileToggle';
        toggleButton.className = 'fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40 flex items-center justify-center';
        toggleButton.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
        `;

        // Add click event
        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileForm();
        });

        document.body.appendChild(toggleButton);
    }

    removeMobileToggleButton() {
        const existingToggle = document.getElementById('mobileToggle');
        if (existingToggle) {
            existingToggle.remove();
        }
    }

    toggleMobileForm() {
        const formContainer = document.getElementById('taskFormContainer');
        const listContainer = document.querySelector('.lg\\:col-span-2');
        
        if (formContainer && listContainer) {
            if (formContainer.style.display === 'none' || formContainer.style.display === '') {
                formContainer.style.display = 'block';
                formContainer.style.position = 'fixed';
                formContainer.style.top = '0';
                formContainer.style.left = '0';
                formContainer.style.right = '0';
                formContainer.style.bottom = '0';
                formContainer.style.zIndex = '45';
                formContainer.style.backgroundColor = '#f0f2f5';
                formContainer.style.overflowY = 'auto';
                formContainer.style.padding = '1rem';
                
                // Add close button
                const closeBtn = document.createElement('button');
                closeBtn.id = 'closeMobileForm';
                closeBtn.className = 'fixed top-4 right-4 z-50 p-2 bg-gray-500 text-white rounded-full shadow-lg';
                closeBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                `;
                closeBtn.onclick = () => this.closeMobileForm();
                formContainer.appendChild(closeBtn);
                
                listContainer.style.display = 'none';
            } else {
                this.closeMobileForm();
            }
        }
    }

    closeMobileForm() {
        const formContainer = document.getElementById('taskFormContainer');
        const listContainer = document.querySelector('.lg\\:col-span-2');
        const closeBtn = document.getElementById('closeMobileForm');
        
        if (formContainer) {
            formContainer.style.display = 'none';
            formContainer.style.position = '';
            formContainer.style.top = '';
            formContainer.style.left = '';
            formContainer.style.right = '';
            formContainer.style.bottom = '';
            formContainer.style.zIndex = '';
            formContainer.style.backgroundColor = '';
            formContainer.style.overflowY = '';
            formContainer.style.padding = '';
        }
        
        if (closeBtn) {
            closeBtn.remove();
        }
        
        if (listContainer) {
            listContainer.style.display = 'block';
        }
    }

    bindEvents() {
        // Form submission
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createTask();
            });
        }

        // Character counters
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');

        if (taskTitle) {
            taskTitle.addEventListener('input', (e) => {
                this.updateCharCount('titleCount', e.target.value, 60);
            });
        }

        if (taskDescription) {
            taskDescription.addEventListener('input', (e) => {
                this.updateCharCount('descCount', e.target.value, 200);
            });
        }

        // Priority buttons
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectPriority(btn.dataset.priority);
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.id.replace('filter', '').toLowerCase();
                this.setFilter(filter);
            });
        });

        // Search
        const searchInput = document.getElementById('searchTasks');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderTasks();
            });
        }

        // Sort
        const sortSelect = document.getElementById('sortBy');
        const sortOrderBtn = document.getElementById('sortOrder');

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderTasks();
            });
        }

        if (sortOrderBtn) {
            sortOrderBtn.addEventListener('click', () => {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                this.updateSortIcon();
                this.renderTasks();
            });
        }

        // Clear completed
        const clearCompletedBtn = document.getElementById('clearCompleted');
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => {
                this.clearCompleted();
            });
        }

        // Modal
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Export
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportTasks();
            });
        }

        // Modal backdrop click
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    setupFormValidation() {
        const titleInput = document.getElementById('taskTitle');
        const titleError = document.getElementById('titleError');

        if (titleInput && titleError) {
            titleInput.addEventListener('blur', () => {
                if (!titleInput.value.trim()) {
                    titleError.classList.remove('hidden');
                    titleInput.classList.add('border-red-500');
                } else {
                    titleError.classList.add('hidden');
                    titleInput.classList.remove('border-red-500');
                }
            });

            titleInput.addEventListener('input', () => {
                if (titleInput.value.trim()) {
                    titleError.classList.add('hidden');
                    titleInput.classList.remove('border-red-500');
                }
            });
        }
    }

    updateCharCount(elementId, value, maxLength) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const count = value.length;
        element.textContent = `${count}/${maxLength}`;
        
        element.classList.remove('text-red-500', 'text-yellow-500', 'text-gray-400');
        
        if (count > maxLength * 0.8) {
            element.classList.add('text-red-500');
        } else if (count > maxLength * 0.6) {
            element.classList.add('text-yellow-500');
        } else {
            element.classList.add('text-gray-400');
        }
    }

    selectPriority(priority) {
        this.selectedPriority = priority;
        
        // Remove active class from all buttons
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('shadow-neu-pressed', 'transform', 'scale-95');
        });
        
        // Add active class to selected button
        const selectedBtn = document.querySelector(`[data-priority="${priority}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
            selectedBtn.classList.add('shadow-neu-pressed', 'transform', 'scale-95');
        }
    }

    createTask() {
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const dueDateInput = document.getElementById('taskDueDate');

        if (!titleInput) {
            this.showToast('Task form not found', 'error');
            return;
        }

        const title = titleInput.value.trim();
        const description = descriptionInput ? descriptionInput.value.trim() : '';
        const dueDate = dueDateInput ? dueDateInput.value : '';

        if (!title) {
            this.showToast('Please enter a task title', 'error');
            titleInput.focus();
            return;
        }

        if (title.length > 60) {
            this.showToast('Task title is too long', 'error');
            return;
        }

        const task = {
            id: Date.now() + Math.random(),
            title: title,
            description: description,
            priority: this.selectedPriority,
            dueDate: dueDate || null,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.addAnimationToNewElements(); // Add this line
        this.updateStats();
        this.resetForm();
        this.showToast('Task created successfully!', 'success');

        // Hide mobile form after creating task
        if (this.isMobile) {
            this.closeMobileForm();
        }
    }

    addAnimationToNewElements() {
        // Add animation classes to newly created task items
        const taskItems = document.querySelectorAll('.task-item:not(.animated)');
        taskItems.forEach((item, index) => {
            item.classList.add('animated');
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    resetForm() {
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.reset();
        }

        const titleCount = document.getElementById('titleCount');
        const descCount = document.getElementById('descCount');

        if (titleCount) titleCount.textContent = '0/60';
        if (descCount) descCount.textContent = '0/200';

        this.selectPriority('medium');
    }

    toggleTask(id) {
        // Prevent toggling in Done tab
        if (this.currentFilter === 'completed') {
            this.showToast('Cannot modify tasks in Done tab', 'info');
            return;
        }
        
        const task = this.tasks.find(t => t.id == id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();

            const message = task.completed ? 'Task completed!' : 'Task marked as active';
            this.showToast(message, 'success');
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id != id);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showToast('Task deleted', 'info');
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id == id);
        if (task) {
            this.showTaskModal(task);
        }
    }

    showTaskModal(task) {
        const modal = document.getElementById('taskModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) return;

        modalContent.innerHTML = '';
        
        const isInDoneTab = this.currentFilter === 'completed';
        
        const modalHTML = `
            <div class="space-y-4">
                ${isInDoneTab ? `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-green-800 font-medium">Completed Task</span>
                        </div>
                        <p class="text-green-700 text-sm mt-1">This task is completed and cannot be marked as incomplete.</p>
                    </div>
                ` : ''}
                <div>
                    <label class="block text-gray-700 font-medium mb-2">Title</label>
                    <input type="text" id="editTitle" value="${this.escapeHtml(task.title)}" 
                           class="w-full px-4 py-3 bg-white rounded-xl border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea id="editDescription" rows="3" 
                              class="w-full px-4 py-3 bg-white rounded-xl border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">${this.escapeHtml(task.description)}</textarea>
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-2">Priority</label>
                    <div class="grid grid-cols-3 gap-2">
                        <button type="button" class="edit-priority-btn px-3 py-2 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all ${task.priority === 'low' ? 'ring-2 ring-green-500' : ''}" data-priority="low">Low</button>
                        <button type="button" class="edit-priority-btn px-3 py-2 text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all ${task.priority === 'medium' ? 'ring-2 ring-yellow-500' : ''}" data-priority="medium">Medium</button>
                        <button type="button" class="edit-priority-btn px-3 py-2 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all ${task.priority === 'high' ? 'ring-2 ring-red-500' : ''}" data-priority="high">High</button>
                    </div>
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-2">Due Date</label>
                    <input type="date" id="editDueDate" value="${task.dueDate || ''}" 
                           class="w-full px-4 py-3 bg-white rounded-xl border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                ${isInDoneTab && task.completedAt ? `
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Completed On</label>
                        <div class="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-600">
                            ${new Date(task.completedAt).toLocaleString()}
                        </div>
                    </div>
                ` : ''}
                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                    <button id="saveTask" class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all">
                        Save Changes
                    </button>
                    <button id="cancelEdit" class="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        modalContent.innerHTML = modalHTML;
        
        // Handle priority selection
        modalContent.querySelectorAll('.edit-priority-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modalContent.querySelectorAll('.edit-priority-btn').forEach(b => {
                    b.classList.remove('ring-2', 'ring-green-500', 'ring-yellow-500', 'ring-red-500');
                });
                
                const priority = btn.dataset.priority;
                if (priority === 'low') {
                    btn.classList.add('ring-2', 'ring-green-500');
                } else if (priority === 'medium') {
                    btn.classList.add('ring-2', 'ring-yellow-500');
                } else {
                    btn.classList.add('ring-2', 'ring-red-500');
                }
            });
        });
        
        // Handle save and cancel buttons
        modalContent.querySelector('#saveTask').addEventListener('click', () => {
            const newTitle = modalContent.querySelector('#editTitle').value.trim();
            const newDescription = modalContent.querySelector('#editDescription').value.trim();
            const newDueDate = modalContent.querySelector('#editDueDate').value;
            const activePriorityBtn = modalContent.querySelector('.edit-priority-btn.ring-2');
            const newPriority = activePriorityBtn ? activePriorityBtn.dataset.priority : task.priority;

            if (!newTitle) {
                this.showToast('Title is required', 'error');
                return;
            }

            task.title = newTitle;
            task.description = newDescription;
            task.dueDate = newDueDate || null;
            task.priority = newPriority;

            // Don't change completion status in Done tab
            if (!isInDoneTab) {
                // Allow completion status changes in other tabs
            }

            this.saveTasks();
            this.renderTasks();
            this.closeModal();
            this.showToast('Task updated successfully!', 'success');
        });

        modalContent.querySelector('#cancelEdit').addEventListener('click', () => {
            this.closeModal();
        });

        // Show modal
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    closeModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Remove active class from all filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected filter
        const activeFilterBtn = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
        if (activeFilterBtn) {
            activeFilterBtn.classList.add('active');
        }
        
        this.renderTasks();
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showToast('No completed tasks to clear', 'info');
            return;
        }

        if (confirm(`Hide ${completedCount} completed task(s) from active view?`)) {
            // Mark completed tasks as hidden instead of deleting them
            this.tasks.forEach(task => {
                if (task.completed) {
                    task.hidden = true;
                }
            });
            
            this.saveTasks();
            this.renderTasks();
            this.updateStats(); // This will now show correct stats
            this.showToast(`${completedCount} completed task(s) hidden from active view`, 'success');
        }
    }

    getFilteredTasks() {
        let filtered = [...this.tasks];

        // Apply filter
        switch (this.currentFilter) {
            case 'active':
                // Show only non-completed and non-hidden tasks
                filtered = filtered.filter(t => !t.completed && !t.hidden);
                break;
            case 'completed':
                // Show ALL completed tasks, even if hidden from active view
                filtered = filtered.filter(t => t.completed);
                break;
            case 'all':
            default:
                // Show all tasks except those hidden from active view
                filtered = filtered.filter(t => !t.hidden);
                break;
        }

        // Apply search
        if (this.searchQuery) {
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(this.searchQuery) ||
                t.description.toLowerCase().includes(this.searchQuery)
            );
        }

        // Apply sort
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (this.currentSort) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    aValue = priorityOrder[a.priority] || 2;
                    bValue = priorityOrder[b.priority] || 2;
                    break;
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'due':
                    aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
                    bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
                    break;
                default:
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
            }

            if (this.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        
        if (!taskList || !emptyState) return;

        const filteredTasks = this.getFilteredTasks();
        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
            taskList.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            taskList.classList.remove('hidden');
            
            filteredTasks.forEach((task, index) => {
                const taskElement = this.createTaskElement(task);
                // Add stagger animation
                taskElement.style.animationDelay = `${index * 0.1}s`;
                taskList.appendChild(taskElement);
            });
        }
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.setAttribute('data-id', task.id);

        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

        // Show restore button for hidden completed tasks when viewing Done tab
        const showRestoreButton = task.completed && task.hidden && this.currentFilter === 'completed';
        
        // Disable checkbox interaction in Done tab
        const isInDoneTab = this.currentFilter === 'completed';
        const checkboxClickable = !isInDoneTab;

        div.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 pt-1">
                    <div class="custom-checkbox ${task.completed ? 'checked' : ''} ${!checkboxClickable ? 'disabled' : ''}" ${checkboxClickable ? `onclick="todoApp.toggleTask(${task.id})"` : ''}>
                        ${task.completed ? '<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' : ''}
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 class="task-title font-semibold text-gray-800 text-sm sm:text-base break-words ${task.completed ? 'line-through text-gray-500' : ''}">${this.escapeHtml(task.title)}</h3>
                        <div class="priority-indicator priority-${task.priority}"></div>
                        ${task.completed ? '<span class="text-green-600 text-sm">✓</span>' : ''}
                        ${showRestoreButton ? '<span class="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded">Hidden</span>' : ''}
                    </div>
                    ${task.description ? `<p class="task-description text-gray-600 text-xs sm:text-sm mb-2 break-words ${task.completed ? 'line-through text-gray-400' : ''}">${this.escapeHtml(task.description)}</p>` : ''}
                    <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span class="flex items-center gap-1">
                            <span>📅</span>
                            <span>${new Date(task.createdAt).toLocaleDateString()}</span>
                        </span>
                        ${dueDate ? `<span class="flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : ''}">
                            <span>⏰</span>
                            <span>${dueDate}</span>
                        </span>` : ''}
                        <span class="capitalize bg-gray-100 px-2 py-1 rounded text-xs">${task.priority}</span>
                        ${task.completedAt ? `<span class="text-green-600 text-xs">Completed: ${new Date(task.completedAt).toLocaleDateString()}</span>` : ''}
                    </div>
                </div>
                <div class="flex-shrink-0 flex flex-col sm:flex-row gap-1 sm:gap-2">
                    ${showRestoreButton ? `
                        <button onclick="todoApp.restoreTask(${task.id})" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Restore to Active">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </button>
                    ` : ''}
                    ${isInDoneTab ? `
                        <button onclick="todoApp.editTask(${task.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="todoApp.deleteTask(${task.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Permanently">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    ` : `
                        <button onclick="todoApp.editTask(${task.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="todoApp.deleteTask(${task.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    `}
                </div>
            </div>
        `;

        return div;
    }

    updateStats() {
        // Get all tasks (not hidden by "Clear Done")
        const allVisibleTasks = this.tasks.filter(t => !t.hidden);
        
        // Get all tasks including hidden ones for proper counting
        const allTasks = this.tasks;
        
        // Calculate stats based on all tasks (including hidden completed ones)
        const total = allTasks.length;
        const completed = allTasks.filter(t => t.completed).length;
        const active = allTasks.filter(t => !t.completed).length;
        
        // For display purposes, show visible active tasks (excluding hidden completed ones)
        const visibleActive = allTasks.filter(t => !t.completed && !t.hidden).length;
        
        // Completion rate based on all tasks
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const totalEl = document.getElementById('totalTasks');
        const completedEl = document.getElementById('completedTasks');
        const activeEl = document.getElementById('activeTasks');
        const rateEl = document.getElementById('completionRate');

        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
        if (activeEl) activeEl.textContent = visibleActive; // Show only visible active tasks
        if (rateEl) rateEl.textContent = `${completionRate}%`;
    }

    updateSortIcon() {
        const sortIcon = document.querySelector('#sortOrder svg');
        if (sortIcon) {
            if (this.sortOrder === 'asc') {
                sortIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>';
            } else {
                sortIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>';
            }
        }
    }

    updateUI() {
        this.renderTasks();
        this.updateStats();
        this.updateSortIcon();
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast p-4 rounded-lg shadow-lg transform transition-all duration-300 max-w-sm text-sm relative`;
        
        // Position properly
        toast.style.marginBottom = '0.5rem';
        toast.style.transform = 'translateX(100%)';
        
        switch (type) {
            case 'success':
                toast.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                toast.classList.add('bg-red-500', 'text-white');
                break;
            case 'info':
                toast.classList.add('bg-blue-500', 'text-white');
                break;
        }

        toast.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <span class="flex-1">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200 flex-shrink-0 ml-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    exportTasks() {
        try {
            const dataStr = JSON.stringify(this.tasks, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `taskflow-export-${new Date().toISOString().slice(0, 10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showToast('Tasks exported successfully!', 'success');
        } catch (error) {
            this.showToast('Export failed', 'error');
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('modernTodoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showToast('Failed to save tasks', 'error');
        }
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('modernTodoTasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new ModernTodoApp();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                const titleInput = document.getElementById('taskTitle');
                if (titleInput) {
                    titleInput.focus();
                }
                break;
            case 'f':
                e.preventDefault();
                const searchInput = document.getElementById('searchTasks');
                if (searchInput) {
                    searchInput.focus();
                }
                break;
        }
    }
});
