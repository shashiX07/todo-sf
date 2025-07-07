// Storage utilities for the Todo App

class TodoStorage {
    constructor(storageKey = 'modernTodoTasks') {
        this.storageKey = storageKey;
        this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    }

    checkLocalStorageAvailability() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    saveTasks(tasks) {
        if (!this.isLocalStorageAvailable) {
            console.warn('LocalStorage is not available');
            return false;
        }

        try {
            const data = {
                tasks: tasks,
                lastUpdated: new Date().toISOString(),
                version: '1.0.0'
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            return false;
        }
    }

    loadTasks() {
        if (!this.isLocalStorageAvailable) {
            console.warn('LocalStorage is not available');
            return [];
        }

        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return [];

            const parsedData = JSON.parse(data);
            
            // Handle legacy format
            if (Array.isArray(parsedData)) {
                return parsedData;
            }

            // Handle new format
            return parsedData.tasks || [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    clearTasks() {
        if (!this.isLocalStorageAvailable) {
            console.warn('LocalStorage is not available');
            return false;
        }

        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing tasks:', error);
            return false;
        }
    }

    exportTasks() {
        const tasks = this.loadTasks();
        const exportData = {
            tasks: tasks,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `taskflow-export-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importTasks(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Handle different import formats
                    let tasks = [];
                    if (Array.isArray(importData)) {
                        tasks = importData;
                    } else if (importData.tasks && Array.isArray(importData.tasks)) {
                        tasks = importData.tasks;
                    } else {
                        throw new Error('Invalid file format');
                    }

                    // Validate tasks
                    const validTasks = tasks.filter(task => 
                        task && 
                        typeof task.id !== 'undefined' && 
                        typeof task.title === 'string' &&
                        typeof task.completed === 'boolean'
                    );

                    resolve(validTasks);
                } catch (error) {
                    reject(new Error('Invalid JSON file or file format'));
                }
            };

            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }
}

// Export for use in other files
window.TodoStorage = TodoStorage;
window.todoStorage = new TodoStorage();