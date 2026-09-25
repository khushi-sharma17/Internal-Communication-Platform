import { useEffect, useState } from 'react'

import './Tasks.css'
import { apiFetch } from '../../api/api'

function Tasks({ onTaskSelected }) {

    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creatingTask, setCreatingTask] = useState(false)

    const [activeFilter, setActiveFilter] = useState('all')

    const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    })

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await apiFetch('/tasks')

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks (${response.status})`)
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])







  const createTask = async () => {
    try {
        setCreatingTask(true)
        setError('')

        const response = await apiFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify({
            title: newTask.title.trim(),
            description: newTask.description.trim() || null,
            priority: newTask.priority,
            status: newTask.status,
            due_date: newTask.due_date
                ? Math.floor(
                    new Date(`${newTask.due_date}T00:00:00`).getTime() / 1000
                )
                : null,
            }),
        }
        )

        const data = await response.json().catch(() => null)

        if (!response.ok) {
        const errorMessage =
            data?.message ||
            data?.error ||
            data?.[0]?.message ||
            `Failed to create task (${response.status})`

        throw new Error(errorMessage)
        }

        setTasks((previous) => [
          ...previous,
          data,
        ])

        setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            due_date: '',
        })

        setShowCreateForm(false)

    } catch (err) {
        setError(err.message)
    } finally {
        setCreatingTask(false)
    }
  }





  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
        'Are you sure you want to delete this task? This action cannot be undone.'
    )

    if (!confirmed) {
        return
    }

    try {
        setError('')

        const response = await apiFetch(`/tasks/${taskId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
        const data = await response.json().catch(() => null)

        const errorMessage =
            data?.message ||
            data?.error ||
            data?.[0]?.message ||
            `Failed to delete task (${response.status})`

        throw new Error(errorMessage)
        }

        // Remove the deleted task from the current list
        setTasks((previous) =>
        previous.filter((task) => task.id !== taskId)
        )

    } catch (err) {
        setError(err.message)
    }
  }





  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, '-')
  }

  const getPriorityClass = (priority) => {
    return priority?.toLowerCase() || 'medium'
  }

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="tasks-header">
          <div>
            <h1>Tasks</h1>
            <p>Manage and track your team's work.</p>
          </div>
        </div>

        <div className="tasks-loading">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tasks-page">
        <div className="tasks-header">
          <div>
            <h1>Tasks</h1>
            <p>Manage and track your team's work.</p>
          </div>
        </div>

        <div className="tasks-error">
          <div className="error-icon">!</div>
          <h3>Unable to load tasks</h3>
          <p>{error}</p>

          <button onClick={fetchTasks} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }


  const filteredTasks =
  activeFilter === 'all'
    ? tasks
    : tasks.filter((task) => task.status === activeFilter)


  return (
    <div className="tasks-page">

      <div className="tasks-header">
        <div>
          <h1>Tasks</h1>
          <p>Manage and track your team's work.</p>
        </div>

        <button
            className="create-task-button"
            onClick={() => setShowCreateForm(true)}
        >
          <span>+</span>
          Create Task
        </button>
      </div>


        {showCreateForm && (
        <div className="create-task-form">

            <div className="create-task-form-header">
            <div>
                <h2>Create Task</h2>
                <p>Add a new task to your workspace.</p>
            </div>

            <button
                type="button"
                className="close-create-task"
                onClick={() => setShowCreateForm(false)}
            >
                ×
            </button>
            </div>

            <div className="create-task-fields">

            <div className="form-field">
                <label>Task Title</label>
                <input
                type="text"
                value={newTask.title}
                onChange={(e) =>
                    setNewTask({
                    ...newTask,
                    title: e.target.value,
                    })
                }
                placeholder="Enter task title"
                />
            </div>

            <div className="form-field">
                <label>Description</label>
                <textarea
                value={newTask.description}
                onChange={(e) =>
                    setNewTask({
                    ...newTask,
                    description: e.target.value,
                    })
                }
                placeholder="Describe the task"
                rows="3"
                />
            </div>

            <div className="form-row">

                <div className="form-field">
                <label>Priority</label>
                <select
                    value={newTask.priority}
                    onChange={(e) =>
                    setNewTask({
                        ...newTask,
                        priority: e.target.value,
                    })
                    }
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                </div>

                <div className="form-field">
                <label>Due Date</label>
                <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) =>
                    setNewTask({
                        ...newTask,
                        due_date: e.target.value,
                    })
                    }
                />
                </div>

            </div>

            </div>

            <div className="create-task-actions">

            <button
                type="button"
                className="cancel-task-button"
                onClick={() => setShowCreateForm(false)}
            >
                Cancel
            </button>

            <button
                type="button"
                className="save-task-button"
                disabled={!newTask.title.trim() || creatingTask}
                onClick={createTask}
            >
                {creatingTask ? 'Creating...' : 'Create Task'}
            </button>

            </div>

        </div>
        )}



      <div className="task-summary">

        <div className="summary-card">
          <div className="summary-icon total">✓</div>
          <div>
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon todo">○</div>
          <div>
            <span>To Do</span>
            <strong>
              {tasks.filter((task) => task.status === 'todo').length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon progress">◐</div>
          <div>
            <span>In Progress</span>
            <strong>
              {tasks.filter((task) => task.status === 'in progress').length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon completed">✓</div>
          <div>
            <span>Completed</span>
            <strong>
              {tasks.filter((task) => task.status === 'completed').length}
            </strong>
          </div>
        </div>

      </div>



      <div className="tasks-toolbar">

        <div>
          <h2>All Tasks</h2>
          <span>{tasks.length} tasks</span>
        </div>

        <div className="task-filters">
            <button
                className={`filter-button ${
                    activeFilter === 'all' ? 'active' : ''
                }`}
                onClick={() => setActiveFilter('all')}
            >
            All
            </button>

            <button
                className={`filter-button ${
                    activeFilter === 'todo' ? 'active' : ''
                }`}
                onClick={() => setActiveFilter('todo')}
            >
            To Do
            </button>


            <button
                className={`filter-button ${
                    activeFilter === 'in progress' ? 'active' : ''
                }`}
                onClick={() => setActiveFilter('in progress')}
            >
            In Progress
            </button>


            <button
                className={`filter-button ${
                    activeFilter === 'completed' ? 'active' : ''
                }`}
                onClick={() => setActiveFilter('completed')}
            >
            Completed
            </button>
        </div>

      </div>

      {tasks.length === 0 ? (
        <div className="empty-tasks">
          <div className="empty-icon">✓</div>
          <h3>No tasks yet</h3>
          <p>Create your first task to get started.</p>
        </div>
      ) : (
        <div className="task-list">

          {filteredTasks.map((task) => (

            <div className="task-card" key={task.id}>

              <div className="task-card-main">

                <div className="task-check">
                  <span></span>
                </div>

                <div className="task-content">

                  <h3>{task.title}</h3>

                  {task.description && (
                    <p className="task-description">
                      {task.description}
                    </p>
                  )}

                  <div className="task-meta">

                    <span
                      className={`status-badge ${getStatusClass(task.status)}`}
                    >
                      {task.status}
                    </span>

                    <span
                      className={`priority-badge ${getPriorityClass(task.priority)}`}
                    >
                      <span className="priority-dot"></span>
                      {task.priority || 'medium'}
                    </span>

                    <span className="task-id">
                      TASK-{task.id}
                    </span>

                  </div>

                </div>

              </div>

              <div className="task-card-right">

                <div className="task-assignee">

                  {task.assigned_to ? (
                    <>
                      <div className="avatar">
                        U{task.assigned_to}
                      </div>

                      <div>
                        <span>Assigned to</span>
                        <strong>
                          User {task.assigned_to}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <div className="unassigned">
                      <span>Assigned to</span>
                      <strong>Unassigned</strong>
                    </div>
                  )}

                </div>

                <div className="task-card-actions">

                    <button
                        className="task-open-button"
                        onClick={() => onTaskSelected(task)}
                    >
                        View
                        <span>→</span>
                    </button>

                    <button
                        className="task-delete-button"
                        onClick={() => deleteTask(task.id)}
                    >
                        Delete
                    </button>

                </div>

              </div>


            </div>

          ))}

        </div>
      )}

    </div>
  )
}

export default Tasks