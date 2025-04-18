import React, { useState, useEffect } from 'react';
import { fetchProjects, createProject } from '@/lib/apiClient';
import type { Project } from '@shared/types';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the new project form
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProjects = await fetchProjects();
        setProjects(fetchedProjects);
      } catch (err: any) {
        console.error('Failed to fetch projects:', err);
        setError(err.response?.data?.message || 'Failed to load projects.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []); // Empty dependency array means this runs once on mount

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle) {
      setCreateError('Project title is required.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const newProject = await createProject({ 
        title: newProjectTitle, 
        description: newProjectDescription 
      });
      setProjects((prevProjects) => [...prevProjects, newProject]); // Add new project to the list
      // Clear the form
      setNewProjectTitle('');
      setNewProjectDescription('');
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setCreateError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>

      {/* Create Project Form */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-medium mb-2">Create New Project</h3>
        <form onSubmit={handleCreateProject}>
          {createError && <p className="text-red-500 text-sm mb-2">{createError}</p>}
          <div className="mb-3">
            <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              id="projectTitle"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="My Awesome Project"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              id="projectDescription"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              rows={3}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Details about the project..."
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCreating ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>

      {/* Project List */}
      {isLoading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!isLoading && !error && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <p>No projects found. Create one above!</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="p-4 border rounded shadow-sm bg-white">
                <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                {project.description && <p className="mt-1 text-sm text-gray-600">{project.description}</p>}
                {/* Add links to project details, edit, delete buttons etc. here */}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Replace the placeholder component in App.tsx if it wasn't already done
// This file should be located at client/src/pages/ProjectsPage.tsx

export default ProjectsPage;
