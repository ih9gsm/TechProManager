import React, { useState, useEffect } from 'react';
import type { Task, TaskPriority, User } from '@shared/types'; // Import User
import { updateTask, fetchUsers } from '@/lib/apiClient'; // Import fetchUsers

interface EditTaskModalProps {
  task: Task & { assignedTo?: string[] }; // Ensure assignedTo is potentially present
  onClose: () => void;
  onSave: (updatedTask: Task & { assignedTo?: string[] }) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, onSave }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [isDone, setIsDone] = useState(task.isDone);
  const [assignedUsers, setAssignedUsers] = useState<string[]>(task.assignedTo || []); // State for assigned user IDs
  const [allUsers, setAllUsers] = useState<User[]>([]); // State for all available users
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all users when the modal opens
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const users = await fetchUsers();
        setAllUsers(users);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Failed to load users list."); // Show error in modal
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const handleUserSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    setAssignedUsers(selectedOptions);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    const updatedTaskData: Partial<Task> & { assignedTo?: string[] } = {
      title,
      description: description || null, // Send null if empty
      priority,
      dueDate: dueDate || null, // Send null if empty
      isDone,
      assignedTo: assignedUsers, // Include assigned users
    };

    try {
      const updatedTask = await updateTask(task.id, updatedTaskData);
      onSave(updatedTask); // Pass the full updated task back
      onClose(); // Close modal on successful save
    } catch (err: any) {
      console.error('Failed to update task:', err);
      setError(err.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Task</h3>
        <div className="space-y-4">
          {error && <p className="text-red-500 text-sm">Error: {error}</p>}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {/* User Assignment Select */} 
          <div>
            <label htmlFor="assignedUsers" className="block text-sm font-medium text-gray-700">Assign Users</label>
            {isLoadingUsers ? (
              <p className="text-sm text-gray-500">Loading users...</p>
            ) : (
              <select
                id="assignedUsers"
                multiple
                value={assignedUsers}
                onChange={handleUserSelectionChange}
                className="mt-1 block w-full h-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} {/* Assuming User type has id and username */}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl (or Cmd on Mac) to select multiple users.</p>
          </div>
          <div className="flex items-center">
            <input
              id="isDone"
              type="checkbox"
              checked={isDone}
              onChange={(e) => setIsDone(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isDone" className="ml-2 block text-sm text-gray-900">Mark as Done</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoadingUsers}
            className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSaving || isLoadingUsers ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
