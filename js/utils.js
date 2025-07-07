// Utility functions for the Todo App

class TodoUtils {
    static validateInput(input) {
        return input && input.trim() !== '' && input.length <= 100;
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static sanitizeHTML(text) {
        const temp = document.createElement('div');
        temp.textContent = text;
        return temp.innerHTML;
    }

    static getTaskStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            pending,
            completionRate
        };
    }

    static sortTasks(tasks, sortBy = 'createdAt', order = 'desc') {
        return [...tasks].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'createdAt' || sortBy === 'completedAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    static filterTasks(tasks, filter) {
        switch (filter) {
            case 'completed':
                return tasks.filter(t => t.completed);
            case 'pending':
            case 'active':
                return tasks.filter(t => !t.completed);
            case 'today':
                const today = new Date().toDateString();
                return tasks.filter(t => new Date(t.createdAt).toDateString() === today);
            case 'this-week':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return tasks.filter(t => new Date(t.createdAt) >= weekAgo);
            default:
                return tasks;
        }
    }

    static searchTasks(tasks, query) {
        if (!query) return tasks;
        
        const lowercaseQuery = query.toLowerCase();
        return tasks.filter(task => 
            task.title.toLowerCase().includes(lowercaseQuery) ||
            task.description.toLowerCase().includes(lowercaseQuery)
        );
    }

    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50`;
        
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-500', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-500', 'text-white');
        }

        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <span>${message}</span>
                <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('translate-x-0');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);

        return notification;
    }

    static confirmDialog(message, callback) {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                <h3 class="text-lg font-semibold mb-4">Confirm Action</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex justify-end gap-3">
                    <button class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400" data-action="cancel">
                        Cancel
                    </button>
                    <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" data-action="confirm">
                        Confirm
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            dialog.remove();
            callback(false);
        });

        dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            dialog.remove();
            callback(true);
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
                callback(false);
            }
        });
    }
}

// Export for use in other files
window.TodoUtils = TodoUtils;