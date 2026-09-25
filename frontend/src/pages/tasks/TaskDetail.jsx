import { useEffect, useState } from 'react'

import './TaskDetail.css'
import { apiFetch } from '../../api/api'

function TaskDetail({ task, onBack, onOpenChat }) {

    const [selectedStatus, setSelectedStatus] = useState(task?.status || 'todo')
    const [savingStatus, setSavingStatus] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')

    const [users, setUsers] = useState([])
    const [teams, setTeams] = useState([])
    const [selectedTeam, setSelectedTeam] = useState('')

    const [assignedTeams, setAssignedTeams] = useState([])
    const [loadingAssignedTeams, setLoadingAssignedTeams] = useState(true)

    const [savingTeam, setSavingTeam] = useState(false)
    const [teamMessage, setTeamMessage] = useState('')


    const [selectedAssignee, setSelectedAssignee] = useState(
        task?.assigned_to || ''
    )
    const [savingAssignee, setSavingAssignee] = useState(false)
    const [assigneeMessage, setAssigneeMessage] = useState('')

    const [selectedWatcher, setSelectedWatcher] = useState('')
    const [savingWatcher, setSavingWatcher] = useState(false)
    const [watcherMessage, setWatcherMessage] = useState('')

    const [watchers, setWatchers] = useState([])
    const [loadingWatchers, setLoadingWatchers] = useState(true)

    const [dependencies, setDependencies] = useState([])
    const [allTasks, setAllTasks] = useState([])
    const [showDependencyForm, setShowDependencyForm] = useState(false)
    const [loadingDependencies, setLoadingDependencies] = useState(true)
    const [dependencyMessage, setDependencyMessage] = useState('')

    const [selectedDependency, setSelectedDependency] = useState('')
    const [savingDependency, setSavingDependency] = useState(false)

    const [activities, setActivities] = useState([])
    const [loadingActivities, setLoadingActivities] = useState(true)
    const [activityMessage, setActivityMessage] = useState('')



    const [showEditForm, setShowEditForm] = useState(false)
    const [savingTask, setSavingTask] = useState(false)
    const [editMessage, setEditMessage] = useState('')

    const [editTitle, setEditTitle] = useState(task?.title || '')
    const [editDescription, setEditDescription] = useState(
        task?.description || ''
    )
    const [editPriority, setEditPriority] = useState(
        task?.priority || 'medium'
    )
    const [editDueDate, setEditDueDate] = useState(
        task?.due_date
            ? new Date(task.due_date * 1000).toISOString().split('T')[0]
            : ''
    )

    const [showActivityForm, setShowActivityForm] = useState(false)
    const [savingActivity, setSavingActivity] = useState(false)
    const [newActivityDetails, setNewActivityDetails] = useState('')
    const [newActivityAction, setNewActivityAction] = useState('comment')
    const [activityFormMessage, setActivityFormMessage] = useState('')




    useEffect(() => {
        apiFetch('/users')
        .then((response) => {
            if (!response.ok) {
            throw new Error(`Failed to fetch users (${response.status})`)
            }

            return response.json()
        })
        .then((data) => {
            setUsers(data)
        })
        .catch((error) => {
            console.error('Failed to load users:', error)
        })
    }, [])


    useEffect(() => {

        if (!task?.id) return

        setLoadingDependencies(true)
        setDependencyMessage('')

        apiFetch(`/task-dependencies?task_id=${task.id}`)
        .then((response) => {
        if (!response.ok) {
            throw new Error(
            `Failed to load dependencies (${response.status})`
            )
        }

        return response.json()
        })
        .then((data) => {
            const taskDependencies = data.filter(
                (dependency) => dependency.task_id === task.id
            )

            setDependencies(taskDependencies)
        })
        .catch((error) => {
            console.error('Failed to load dependencies:', error)
            setDependencyMessage(error.message)
        })
        .finally(() => {
            setLoadingDependencies(false)
        })
    }, [task?.id])



    useEffect(() => {
        apiFetch('/tasks')
        .then((response) => {
        if (!response.ok) {
            throw new Error(`Failed to load tasks (${response.status})`)
        }

        return response.json()
        })
        .then((data) => {
            setAllTasks(data)
        })
        .catch((error) => {
            console.error('Failed to load tasks:', error)
        })
    }, [])



    useEffect(() => {
        if (!task?.id) return

        setLoadingActivities(true)
        setActivityMessage('')

        apiFetch(`/task-activities?task_id=${task.id}`)
        .then((response) => {
        if (!response.ok) {
            throw new Error(
            `Failed to load activity (${response.status})`
            )
        }

        return response.json()
        })
        .then((data) => {
        setActivities(data)
        })
        .catch((error) => {
        console.error('Failed to load activity:', error)
        setActivityMessage(error.message)
        })
        .finally(() => {
        setLoadingActivities(false)
        })
    }, [task?.id])



    useEffect(() => {
        if (!task?.id) return

        setLoadingWatchers(true)

        apiFetch(`/task-watchers?task_id=${task.id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Failed to load watchers (${response.status})`
                    )
                }

                return response.json()
            })
            .then((data) => {
                setWatchers(data)
            })
            .catch((error) => {
                console.error('Failed to load watchers:', error)
            })
            .finally(() => {
                setLoadingWatchers(false)
            })
    }, [task?.id])




    useEffect(() => {
        apiFetch('/teams')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load teams (${response.status})`)
                }

                return response.json()
            })
            .then((data) => {
                setTeams(data)
            })
            .catch((error) => {
                console.error('Failed to load teams:', error)
            })
    }, [])





    useEffect(() => {
        if (!task?.id) return

        setLoadingAssignedTeams(true)

        apiFetch(`/task-assignments?task_id=${task.id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Failed to load assignments (${response.status})`
                    )
                }

                return response.json()
            })
            .then((data) => {
                const taskAssignments = data.filter(
                    (assignment) =>
                        assignment.task_id === task.id &&
                        assignment.team_id !== null
                )

                setAssignedTeams(taskAssignments)
            })
            .catch((error) => {
                console.error('Failed to load team assignments:', error)
            })
            .finally(() => {
                setLoadingAssignedTeams(false)
            })
    }, [task?.id])






    const handleEditTask = async () => {

        try {
            setSavingTask(true)
            setEditMessage('')

            const response = await apiFetch(`/tasks/${task.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    priority: editPriority,
                    due_date: editDueDate
                        ? Math.floor(
                            new Date(editDueDate).getTime() / 1000
                        )
                        : null,
                    }),
                }
            )

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    `Failed to update task (${response.status})`
                )
            }

            setEditMessage('Task updated successfully.')
            setShowEditForm(false)

            // Refresh activities because the backend logs task changes.
            const activityResponse = await apiFetch(
                `/task-activities?task_id=${task.id}`
            )

            if (activityResponse.ok) {
                const activityData = await activityResponse.json()
                setActivities(activityData)
            }

            // Refresh the page so the updated task details are displayed.
            window.location.reload()

        } catch (error) {
            setEditMessage(error.message)
        } finally {
            setSavingTask(false)
        }
    }


    const handleAddActivity = async () => {

        if (!newActivityDetails.trim()) {
            setActivityFormMessage('Please enter activity details.')
            return
        }

        try {
            setSavingActivity(true)
            setActivityFormMessage('')

            const response = await apiFetch('/task-activities', {
                        method: 'POST',
                        body: JSON.stringify({
                        task_id: task.id,
                        action: newActivityAction,
                        details: newActivityDetails.trim(),
                        created_at: Math.floor(Date.now() / 1000),
                    }),
                }
            )

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    `Failed to add activity (${response.status})`
                )
            }

            setNewActivityDetails('')
            setNewActivityAction('comment')
            setShowActivityForm(false)

            // Refresh activity list.
            const activityResponse = await apiFetch(
                `/task-activities?task_id=${task.id}`
            )

            if (activityResponse.ok) {
                const activityData = await activityResponse.json()
                setActivities(activityData)
            }

        } catch (error) {
            setActivityFormMessage(error.message)
        } finally {
            setSavingActivity(false)
        }
    }







    if (!task) {
        return (
        <div className="task-detail-page">
            <div className="task-detail-empty">
            <h2>No task selected</h2>
            <button onClick={onBack}>Back to Tasks</button>
            </div>
        </div>
        )
    }

    const statusClass = task.status
        .toLowerCase()
        .replace(/\s+/g, '-')

    const priorityClass = task.priority?.toLowerCase() || 'medium'

    const formatDate = (timestamp) => {
            if (!timestamp) return 'Not set'

            return new Date(timestamp * 1000).toLocaleDateString (
            'en-IN',
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }
        )
    }

  return (
    <div className="task-detail-page">


        {showEditForm && (
            <div className="task-modal-overlay">
                <div className="task-modal">

                    <div className="task-modal-header">
                        <div>
                            <h2>Edit Task</h2>
                            <p>Update the task details</p>
                        </div>

                        <button
                            type="button"
                            className="task-modal-close"
                            onClick={() => setShowEditForm(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="task-modal-body">

                        <label>Title</label>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Task title"
                        />

                        <label>Description</label>
                        <textarea
                            value={editDescription}
                            onChange={(e) =>
                                setEditDescription(e.target.value)
                            }
                            placeholder="Task description"
                            rows="5"
                        />

                        <label>Priority</label>
                        <select
                            value={editPriority}
                            onChange={(e) =>
                                setEditPriority(e.target.value)
                            }
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>

                        <label>Due Date</label>
                        <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) =>
                                setEditDueDate(e.target.value)
                            }
                        />

                        {editMessage && (
                            <p className="task-form-message">
                                {editMessage}
                            </p>
                        )}

                    </div>

                    <div className="task-modal-footer">

                        <button
                            type="button"
                            className="cancel-modal-button"
                            onClick={() => setShowEditForm(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="save-modal-button"
                            disabled={savingTask}
                            onClick={handleEditTask}
                        >
                            {savingTask ? 'Saving...' : 'Save Changes'}
                        </button>

                    </div>

                </div>
            </div>
        )}



        {showActivityForm && (
            <div className="task-modal-overlay">
                <div className="task-modal">

                    <div className="task-modal-header">
                        <div>
                            <h2>Add Activity</h2>
                            <p>Record an update or comment</p>
                        </div>

                        <button
                            type="button"
                            className="task-modal-close"
                            onClick={() => setShowActivityForm(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="task-modal-body">

                        <label>Activity Type</label>

                        <select
                            value={newActivityAction}
                            onChange={(e) =>
                                setNewActivityAction(e.target.value)
                            }
                        >
                            <option value="comment">Comment</option>
                            <option value="update">Update</option>
                            <option value="note">Note</option>
                        </select>

                        <label>Details</label>

                        <textarea
                            value={newActivityDetails}
                            onChange={(e) =>
                                setNewActivityDetails(e.target.value)
                            }
                            placeholder="Describe what happened..."
                            rows="5"
                        />

                        {activityFormMessage && (
                            <p className="task-form-message">
                                {activityFormMessage}
                            </p>
                        )}

                    </div>

                    <div className="task-modal-footer">

                        <button
                            type="button"
                            className="cancel-modal-button"
                            onClick={() => setShowActivityForm(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="save-modal-button"
                            disabled={savingActivity}
                            onClick={handleAddActivity}
                        >
                            {savingActivity ? 'Adding...' : 'Add Activity'}
                        </button>

                    </div>

                </div>
            </div>
        )}




      {/* HEADER */}

      <div className="task-detail-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ←
          <span>Back to Tasks</span>
        </button>

        <div className="task-header-content">

            <div className="task-title-section">

                <div className="task-title-row">

                <span className="task-detail-id">
                    TASK-{task.id}
                </span>

                <span className={`detail-status ${statusClass}`}>
                    {task.status}
                </span>

                </div>

                <h1>{task.title}</h1>

                <p>
                Task created by User {task.created_by}
                </p>

            </div>

            <div className="task-header-actions">

                <button
                    className="secondary-action"
                    onClick={() => {
                        setEditTitle(task.title || '')
                        setEditDescription(task.description || '')
                        setEditPriority(task.priority || 'medium')
                        setEditDueDate(
                            task.due_date
                                ? new Date(task.due_date * 1000)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                        )
                        setEditMessage('')
                        setShowEditForm(true)
                    }}
                >
                    Edit Task
                </button>

                <button
                    className="primary-action"
                    onClick={() => {
                        setNewActivityDetails('')
                        setNewActivityAction('comment')
                        setActivityFormMessage('')
                        setShowActivityForm(true)
                    }}
                >
                    + Add Activity
                </button>

            </div>

        </div>

      </div>

      {/* CONTENT */}

      <div className="task-detail-layout">

        {/* MAIN COLUMN */}

        <main className="task-detail-main">

          <section className="detail-card">

            <div className="card-heading">
              <div>
                <h2>Description</h2>
                <p>Task details and requirements</p>
              </div>
            </div>

            <div className="description-content">
              {task.description ? (
                <p>{task.description}</p>
              ) : (
                <p className="muted-text">
                  No description has been added to this task.
                </p>
              )}
            </div>

          </section>

          <section className="detail-card">

            <div className="card-heading">
              <div>
                <h2>Task Progress</h2>
                <p>Current status of this task</p>
              </div>
            </div>


            <div className="progress-flow">

                {['todo', 'in progress', 'blocked', 'review', 'completed'].map((status) => (
                <button
                    key={status}
                    type="button"
                    className={`progress-step ${
                    selectedStatus === status ? 'active' : ''
                    }`}
                    onClick={() => {
                    setSelectedStatus(status)
                    setStatusMessage('')
                    }}
                >
                    <span className="progress-dot"></span>
                    <span>{status}</span>
                </button>
                ))}

            </div>

            <button
            className="save-status-button"
            disabled={savingStatus}
            onClick={async () => {
                try {
                setSavingStatus(true)
                setStatusMessage('')

                const response = await apiFetch(`/tasks/${task.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        status: selectedStatus,
                    }),
                })

                if (!response.ok) {
                    const data = await response.json().catch(() => null)

                    throw new Error(
                    data?.message ||
                    `Failed to update status (${response.status})`
                    )
                }

                setStatusMessage('Status updated successfully.')

                const activityResponse = await apiFetch(
                    `/task-activities?task_id=${task.id}`
                )

                if (activityResponse.ok) {
                    const activityData = await activityResponse.json()
                    setActivities(activityData)
                }
                

                } catch (error) {
                setStatusMessage(error.message)
                } finally {
                setSavingStatus(false)
                }
            }}
            >
            {savingStatus ? 'Saving...' : 'Save Status'}
            </button>

            {statusMessage && (
            <p className="status-message">{statusMessage}</p>
            )}


          </section>

          <section className="detail-card">

            <div className="card-heading">
                <div>
                    <h2>Task Chat</h2>
                    <p>Conversation related to this task</p>
                </div>

                <button
                    className="view-chat-button"
                    onClick={() => onOpenChat(task)}
                >
                    Open Chat →
                </button>
            </div>

            <div className="chat-placeholder">

              <div className="chat-placeholder-icon">
                💬
              </div>

              <div>
                <h3>Task conversation</h3>
                <p>
                  Discuss this task with the assigned team
                  members and collaborators.
                </p>
              </div>

            </div>

          </section>



           <section className="detail-card activity-card">

                <div className="card-heading">
                    <div>
                        <h2>Activity</h2>
                        <p>History of changes and actions on this task</p>
                    </div>

                    <span className="activity-count">
                        {activities.length} {activities.length === 1 ? 'event' : 'events'}
                    </span>
                </div>

                <div className="activity-content">

                    {loadingActivities ? (

                    <p className="muted-text">
                        Loading activity...
                    </p>

                    ) : activityMessage ? (

                    <p className="muted-text">
                        {activityMessage}
                    </p>

                    ) : activities.length === 0 ? (

                    <div className="activity-empty">
                        <div className="activity-empty-icon">✓</div>

                        <strong>No activity yet</strong>

                        <p>
                        Changes and actions on this task will appear here.
                        </p>
                    </div>

                    ) : (

                    <div className="activity-timeline">

                        {[...activities].reverse().map((activity) => {

                        const activityTitle = activity.action
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (letter) =>
                            letter.toUpperCase()
                            )

                        return (
                            <div
                            className="activity-item"
                            key={activity.id}
                            >

                            <div className="activity-marker">
                                <span></span>
                            </div>

                            <div className="activity-info">

                                <div className="activity-top-row">

                                <strong>
                                    {activityTitle}
                                </strong>

                                <span className="activity-user">
                                    User {activity.user_id}
                                </span>

                                </div>

                                <p>
                                {activity.details}
                                </p>

                            </div>

                            </div>
                        )
                        })}

                    </div>

                    )}

                </div>

            </section>



        </main>

        {/* SIDEBAR */}

        <aside className="task-detail-sidebar">

          <section className="detail-card">

            <div className="card-heading">
              <h2>Task Information</h2>
            </div>

            <div className="info-list">

              <div className="info-row">
                <span>Status</span>

                <span className={`detail-status ${statusClass}`}>
                  {task.status}
                </span>
              </div>

              <div className="info-row">
                <span>Priority</span>

                <span className={`priority-detail ${priorityClass}`}>
                  <i></i>
                  {task.priority || 'medium'}
                </span>
              </div>

              <div className="info-row">
                <span>Task ID</span>
                <strong>#{task.id}</strong>
              </div>

              <div className="info-row">
                <span>Created</span>
                <strong>{formatDate(task.created_at)}</strong>
              </div>

              <div className="info-row">
                <span>Due Date</span>
                <strong>
                  {formatDate(task.due_date)}
                </strong>
              </div>

            </div>

          </section>

          <section className="detail-card">

            <div className="card-heading">

              <div>
                <h2>Assignment</h2>
                <p>People working on this task</p>
              </div>

              <button className="small-action">
                Edit
              </button>

            </div>

            <div className="assignment-content">

                <label className="assignment-label">
                    Assigned to
                </label>

                <select
                    className="assignee-select"
                    value={selectedAssignee}
                    onChange={(e) => {
                    setSelectedAssignee(e.target.value)
                    setAssigneeMessage('')
                    }}
                >
                    <option value="">
                    Unassigned
                    </option>

                    {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name || `User ${user.id}`}
                    </option>
                    ))}
                </select>

                <button
                    className="save-assignee-button"
                    disabled={savingAssignee}
                    onClick={async () => {
                    try {
                        setSavingAssignee(true)
                        setAssigneeMessage('')

                        const response = await apiFetch(`/tasks/${task.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                            assigned_to: selectedAssignee
                                ? Number(selectedAssignee)
                                : null,
                            }),
                        }
                        )

                        if (!response.ok) {
                        const data = await response.json().catch(() => null)

                        throw new Error(
                            data?.message ||
                            `Failed to update assignee (${response.status})`
                        )
                        }

                        setAssigneeMessage('Assignee updated successfully.')

                        const activityResponse = await apiFetch(
                            `/task-activities?task_id=${task.id}`
                        )

                        if (activityResponse.ok) {
                            const activityData = await activityResponse.json()
                            setActivities(activityData)
                        }
                    } catch (error) {
                        setAssigneeMessage(error.message)
                    } finally {
                        setSavingAssignee(false)
                    }
                    }}
                >
                    {savingAssignee ? 'Saving...' : 'Save Assignee'}
                </button>

                {assigneeMessage && (
                    <p className="assignee-message">
                    {assigneeMessage}
                    </p>
                )}

                
                <div className="team-assignment-section">

                    <label className="assignment-label">
                        Assigned team
                    </label>

                    <select
                        className="assignee-select"
                        value={selectedTeam}
                        onChange={(e) => {
                            setSelectedTeam(e.target.value)
                            setTeamMessage('')
                        }}
                    >
                        <option value="">
                            Select a team
                        </option>

                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name || `Team ${team.id}`}
                            </option>
                        ))}
                    </select>

                    <button
                        className="save-assignee-button"
                        disabled={savingTeam || !selectedTeam}
                        onClick={async () => {
                            try {
                                setSavingTeam(true)
                                setTeamMessage('')

                                // Get existing assignments for this task
                                const existingResponse = await apiFetch(
                                    `/task-assignments?task_id=${task.id}`
                                )

                                const existingAssignments = await existingResponse.json()

                                // Find existing team assignments
                                const existingTeamAssignments = existingAssignments.filter(
                                    (assignment) =>
                                        assignment.task_id === task.id &&
                                        assignment.team_id !== null
                                )

                                // Remove old team assignments
                                for (const assignment of existingTeamAssignments) {
                                    const deleteResponse = await apiFetch(
                                        `/task-assignments/${assignment.id}`,
                                        {
                                            method: 'DELETE',
                                        }
                                    )

                                    if (!deleteResponse.ok) {
                                        throw new Error(
                                            `Failed to remove previous team (${deleteResponse.status})`
                                        )
                                    }
                                }

                                // Create the new team assignment
                                const response = await apiFetch('/task-assignments', {
                                            method: 'POST',
                                            body: JSON.stringify({
                                            task_id: task.id,
                                            team_id: Number(selectedTeam),
                                            user_id: null,
                                            created_at: Math.floor(Date.now() / 1000),
                                        }),
                                    }
                                )

                                const data = await response.json().catch(() => null)

                                if (!response.ok) {
                                    const errorMessage =
                                        data?.[0]?.message ||
                                        data?.message ||
                                        data?.error ||
                                        `Failed to assign team (${response.status})`

                                    throw new Error(errorMessage)
                                }

                                setTeamMessage('Team assigned successfully.')
                                setSelectedTeam('')

                                // Refresh displayed team assignments
                                const refreshedResponse = await apiFetch(
                                    `/task-assignments?task_id=${task.id}`
                                )

                                if (refreshedResponse.ok) {
                                    const refreshedData = await refreshedResponse.json()

                                    setAssignedTeams(
                                        refreshedData.filter(
                                            (assignment) =>
                                                assignment.task_id === task.id &&
                                                assignment.team_id !== null
                                        )
                                    )
                                }

                                // Refresh activity
                                const activityResponse = await apiFetch(
                                    `/task-activities?task_id=${task.id}`
                                )

                                if (activityResponse.ok) {
                                    const activityData = await activityResponse.json()
                                    setActivities(activityData)
                                }

                            } catch (error) {
                                setTeamMessage(error.message)
                            } finally {
                                setSavingTeam(false)
                            }
                        }}
                    >
                        {savingTeam ? 'Assigning...' : 'Assign Team'}
                    </button>


                    {teamMessage && (
                        <p className="assignee-message">
                            {teamMessage}
                        </p>
                    )}


                    
                    <div className="current-assignee">
                        <div className="current-assignee-header">
                            <span className="assignment-label">
                                Assigned user
                            </span>
                        </div>

                        {selectedAssignee ? (
                            <div className="assigned-user-item">
                                <strong>
                                    {users.find(
                                        (user) =>
                                            user.id === Number(selectedAssignee)
                                    )?.name || `User ${selectedAssignee}`}
                                </strong>

                                <span>
                                    Assigned to this task
                                </span>
                            </div>
                        ) : (
                            <p className="watchers-empty">
                                No individual user assigned.
                            </p>
                        )}
                    </div>



                    {loadingAssignedTeams ? (
                        <p className="watchers-loading">
                            Loading assigned teams...
                        </p>
                    ) : assignedTeams.length > 0 ? (
                        <div className="assigned-teams-list">
                            {assignedTeams.map((assignment) => {
                                const team = teams.find(
                                    (teamItem) => teamItem.id === assignment.team_id
                                )

                                return (
                                    <div
                                        className="assigned-team-item"
                                        key={assignment.id}
                                    >
                                        <div>
                                            <strong>
                                                {team?.name || `Team ${assignment.team_id}`}
                                            </strong>

                                            <span>
                                                Assigned to this task
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="remove-team-button"
                                            onClick={async () => {
                                                try {
                                                    const response = await apiFetch(
                                                        `/task-assignments/${assignment.id}`,
                                                        {
                                                            method: 'DELETE',
                                                        }
                                                    )

                                                    if (!response.ok) {
                                                        throw new Error(
                                                            `Failed to remove team (${response.status})`
                                                        )
                                                    }

                                                    setAssignedTeams((current) =>
                                                        current.filter(
                                                            (item) => item.id !== assignment.id
                                                        )
                                                    )

                                                    setTeamMessage('Team removed successfully.')
                                                } catch (error) {
                                                    setTeamMessage(error.message)
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="watchers-empty">
                            No team assigned yet.
                        </p>
                    )}

                </div>


            </div>

          </section>



          <section className="detail-card">

            <div className="card-heading">
                <div>
                    <h2>Watchers</h2>
                    <p>People following this task</p>
                </div>
            </div>

            <div className="watcher-content">
                <label className="assignment-label">Add watcher</label>

                <select
                    className="assignee-select"
                    value={selectedWatcher}
                    onChange={(e) => {
                    setSelectedWatcher(e.target.value)
                    setWatcherMessage('')
                    }}
                >
                    <option value="">Select a user</option>

                    {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name || `User ${user.id}`}
                    </option>
                    ))}
                </select>

                <button
                    className="save-assignee-button"
                    disabled={savingWatcher || !selectedWatcher}
                    onClick={async () => {
                    try {
                        setSavingWatcher(true)
                        setWatcherMessage('')

                        const response = await apiFetch(
                            '/task-watchers',
                            {
                                method: 'POST',
                                body: JSON.stringify({
                                    task_id: task.id,
                                    user_id: Number(selectedWatcher),
                                }),
                            }
                        )

                        const data = await response.json().catch(() => null)

                        if (!response.ok) {
                            const errorMessage =
                                data?.[0]?.message ||
                                data?.message ||
                                data?.error ||
                                (typeof data === 'string' ? data : null) ||
                                `Failed to add watcher (${response.status})`

                            throw new Error(errorMessage)
                        }

                        setWatcherMessage('Watcher added successfully.')

                        const newWatcher = {
                            ...data,
                            task_id: task.id,
                            user_id: Number(selectedWatcher),
                        }

                        setWatchers((previous) => [
                            ...previous,
                            newWatcher,
                        ])

                        setSelectedWatcher('')

                    } catch (error) {
                        setWatcherMessage(error.message)
                    } finally {
                        setSavingWatcher(false)
                    }
                    }}
                >
                    {savingWatcher ? 'Adding...' : 'Add Watcher'}
                </button>

                {watcherMessage && (
                    <p className="assignee-message">{watcherMessage}</p>
                )}


                {loadingWatchers ? (
                    <p className="watchers-loading">Loading watchers...</p>
                ) : watchers.length === 0 ? (
                    <p className="watchers-empty">No watchers yet.</p>
                ) : (
                    <div className="watchers-list">
                        {watchers
                            .filter((watcher) => watcher.task_id === task.id)
                            .map((watcher) => {
                                const user = users.find(
                                    (user) => user.id === watcher.user_id
                                )

                                return (
                                    <div
                                        className="watcher-item"
                                        key={watcher.id}
                                    >
                                        <div className="watcher-avatar">
                                            {(user?.name || `User ${watcher.user_id}`)
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="watcher-info">
                                            <strong>
                                                {user?.name || `User ${watcher.user_id}`}
                                            </strong>

                                            <span>Watching this task</span>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                )}



            </div>

          </section>

          <section className="detail-card">

            <div className="card-heading">
                <div>
                    <h2>Dependencies</h2>
                    <p>Tasks that this task depends on</p>
                </div>

                <button
                    className="add-dependency-button"
                    type="button"
                    onClick={() => setShowDependencyForm(true)}
                >
                    + Add Dependency
                </button>
            </div>

                <div className="dependency-content">

                    {showDependencyForm && (
                    <div className="dependency-form">
                        <label className="assignment-label">
                        Select task
                        </label>

                        <select
                            className="assignee-select"
                            value={selectedDependency}
                            onChange={(e) => setSelectedDependency(e.target.value)}
                        >
                        <option value="">Select a task</option>

                        {allTasks
                            .filter((taskItem) => taskItem.id !== task.id)
                            .map((taskItem) => (
                            <option
                                key={taskItem.id}
                                value={taskItem.id}
                            >
                                {taskItem.title}
                            </option>
                            ))}
                        </select>



                        <button
                        className="save-assignee-button"
                        type="button"
                        disabled={savingDependency || !selectedDependency}
                        onClick={async () => {
                            try {
                            setSavingDependency(true)

                            const response = await apiFetch(
                                '/task-dependencies',
                                {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        task_id: task.id,
                                        depends_on_task_id: Number(selectedDependency),
                                    }),
                                }
                            )

                            const data = await response.json().catch(() => null)

                            if (!response.ok) {
                                throw new Error(
                                data?.message ||
                                `Failed to add dependency (${response.status})`
                                )
                            }

                            setDependencies((previous) => [
                                ...previous,
                                data,
                            ])

                            setSelectedDependency('')
                            setShowDependencyForm(false)

                            const activityResponse = await apiFetch(
                                `/task-activities?task_id=${task.id}`
                            )

                            if (activityResponse.ok) {
                                const activityData = await activityResponse.json()
                                setActivities(activityData)
                            }

                            } catch (error) {
                            console.error('Failed to add dependency:', error)
                            } finally {
                            setSavingDependency(false)
                            }
                        }}
                        >
                        {savingDependency ? 'Adding...' : 'Add Dependency'}
                        </button>


                        <button
                            type="button"
                            className="cancel-dependency-button"
                            onClick={() => {
                                setShowDependencyForm(false)
                                setSelectedDependency('')
                            }}
                        >
                            Cancel
                        </button>

                    </div>
                    )}

                    {loadingDependencies ? (
                        <p className="muted-text">Loading dependencies...</p>
                    ) : dependencyMessage ? (
                        <p className="muted-text">{dependencyMessage}</p>
                    ) : dependencies.length === 0 ? (
                        <p className="muted-text">No dependencies added yet.</p>
                    ) : (
                        <div className="dependency-list">
                        {dependencies.map((dependency) => (
                            <div
                            className="dependency-item"
                            key={dependency.id}
                            >
                            <div className="dependency-icon">↳</div>

                            <div className="dependency-info">
                                <span className="dependency-label">
                                Depends on
                                </span>

                                <strong>
                                    {allTasks.find(
                                        (taskItem) => taskItem.id === dependency.depends_on_task_id
                                    )?.title || `Task #${dependency.depends_on_task_id}`}
                                </strong>
                            </div>


                            <button
                            type="button"
                            className="remove-dependency-button"
                            onClick={async () => {
                                try {
                                const response = await apiFetch(
                                    `/task-dependencies/${dependency.id}`,
                                    {
                                        method: 'DELETE',
                                    }
                                )

                                if (!response.ok) {
                                    const data = await response.json().catch(() => null)

                                    throw new Error(
                                    data?.message ||
                                    `Failed to remove dependency (${response.status})`
                                    )
                                }

                                setDependencies((previous) =>
                                    previous.filter((item) => item.id !== dependency.id)
                                )
                                
                                const activityResponse = await apiFetch(
                                    `/task-activities?task_id=${task.id}`
                                )

                                if (activityResponse.ok) {
                                    const activityData = await activityResponse.json()
                                    setActivities(activityData)
                                }

                                } catch (error) {
                                console.error('Failed to remove dependency:', error)
                                }
                            }}
                            >
                            Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
            </div>

          </section>


           

        </aside>

      </div>

    </div>
  )
}

export default TaskDetail