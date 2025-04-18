import React, { useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask, fetchUsers } from '@/lib/apiClient'; // Import fetchUsers
import type { Task, TaskPriority, User } from '@shared/types'; // Import User type
import { useAuthStore } from '@/store/authStore';
import EditTaskModal from '@/components/EditTaskModal'; // Import the modal

// Type for task data returned from API (might include assignments)
type ApiTask = Task & { assignedTo?: string[] };

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);

  // State for the new task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // State for editing tasks
  const [editingTask, setEditingTask] = useState<ApiTask | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [users, setUsers] = useState<User[]>([]); // State for users
  const [userMap, setUserMap] = useState<Record<string, string>>({}); // State for user ID -> username map

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch tasks and users concurrently
        const [fetchedTasks, fetchedUsers] = await Promise.all([
          fetchTasks(),
          fetchUsers()
        ]);

        setTasks(fetchedTasks);
        setUsers(fetchedUsers);

        // Create a map for easy username lookup
        const map: Record<string, string> = {};
        fetchedUsers.forEach(user => {
          map[user.id] = user.username; // Assuming User type has id and username
        });
        setUserMap(map);

      } catch (err: any) {
        console.error('Failed to load tasks or users:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) {
      setCreateError('Task title is required.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const newTaskData: Partial<Task> & { assignedTo?: string[] } = {
        title: newTaskTitle,
        // Assign to current user by default (can be expanded)
        assignedTo: currentUser ? [currentUser.id] : [],
      };
      const newTask = await createTask(newTaskData);
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setNewTaskTitle(''); // Clear the form
    } catch (err: any) {
      console.error('Failed to create task:', err);
      setCreateError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleTaskStatus = async (task: ApiTask) => {
    const originalStatus = task.isDone;
    // Optimistically update UI
    setTasks(tasks.map(t => t.id === task.id ? { ...t, isDone: !t.isDone } : t));
    try {
      await updateTask(task.id, { isDone: !task.isDone });
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      setError('Failed to update task status. Please try again.');
      // Revert UI on error
      setTasks(tasks.map(t => t.id === task.id ? { ...t, isDone: originalStatus } : t));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const originalTasks = tasks;
    // Optimistically update UI
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
      await deleteTask(taskId);
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please try again.');
      // Revert UI on error
      setTasks(originalTasks);
    }
  };

  // --- Edit Task Logic ---
  const openEditModal = (task: ApiTask) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingTask(null);
    setIsEditModalOpen(false);
  };

  const handleUpdateTask = (updatedTask: ApiTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    // Optionally show a success message
  };

  // Helper to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Helper for priority display
  const getPriorityClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'text-red-600 font-medium';
      case 'medium': return 'text-yellow-600 font-medium';
      case 'low': return 'text-green-600 font-medium';
      default: return 'text-gray-500';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Tasks</h2>

      {/* Create Task Form */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-medium mb-2">Add New Task</h3>
        <form onSubmit={handleCreateTask} className="flex items-center space-x-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-grow shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="What needs to be done?"
            required
          />
          <button
            type="submit"
            disabled={isCreating}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCreating ? 'Adding...' : 'Add Task'}
          </button>
        </form>
        {createError && <p className="text-red-500 text-sm mt-2">{createError}</p>}
      </div>

      {/* Task List */}
      {isLoading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!isLoading && !error && (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p>No tasks found. Add one above!</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded shadow-sm bg-white">
                <div className="flex items-center flex-grow min-w-0 mr-4"> {/* Added flex-grow and min-w-0 */} 
                  <input
                    type="checkbox"
                    checked={task.isDone}
                    onChange={() => handleToggleTaskStatus(task)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3 flex-shrink-0" // Added flex-shrink-0
                  />
                  <div className="flex-grow min-w-0"> {/* Added flex-grow and min-w-0 */} 
                    <span className={`${task.isDone ? 'line-through text-gray-500' : 'text-gray-900'} block truncate`}> {/* Added block and truncate */} 
                      {task.title}
                    </span>
                    <div className="text-xs text-gray-500 mt-1 flex space-x-2">
                      <span className={getPriorityClass(task.priority)}>Priority: {task.priority}</span>
                      <span>Due: {formatDate(task.dueDate)}</span>
                      {/* Display Assigned Users */}
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <span>Assigned: {task.assignedTo.map(userId => userMap[userId] || 'Unknown User').join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0"> {/* Added flex-shrink-0 */} 
                  <button
                    onClick={() => openEditModal(task)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    aria-label={`Edit task ${task.title}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                    aria-label={`Delete task ${task.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Task Modal */} 
      {isEditModalOpen && editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={closeEditModal}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default TasksPage;
