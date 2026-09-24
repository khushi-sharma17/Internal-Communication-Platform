import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/api'
import './Meetings.css'

function Meetings({ initialSelectedMeeting }) {

    const [meetings, setMeetings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creatingMeeting, setCreatingMeeting] = useState(false)

    const [showParticipantForm, setShowParticipantForm] = useState(null)
    const [users, setUsers] = useState([])
    const [selectedMeeting, setSelectedMeeting] = useState(
      initialSelectedMeeting || null
    )
    const [selectedUserId, setSelectedUserId] = useState('')
    const [addingParticipant, setAddingParticipant] = useState(false)

    const [newMeeting, setNewMeeting] = useState({
        title: '',
        agenda: '',
        start_time: '',
        end_time: '',
        timezone: 'Asia/Kolkata',
        location: '',
        meeting_link: '',
        is_recurring: false,
    })

    const [currentUserId, setCurrentUserId] = useState(null)

    const fetchMeetings = async () => {
        try {
        setLoading(true)
        setError('')

        const response = await apiFetch('/meetings?expand=participants.user')
        const data = await response.json()

        if (!response.ok) {
            throw new Error(
            data?.message ||
            data?.error ||
            `Failed to fetch meetings (${response.status})`
            )
        }

        setMeetings(Array.isArray(data) ? data : data.items || [])
        } catch (err) {
        setError(err.message || 'Failed to load meetings')
        } finally {
        setLoading(false)
        }
    }



    const fetchCurrentUser = async () => {
        try {
            const response = await apiFetch('/users/me')

            if (!response.ok) {
            throw new Error('Failed to identify current user')
            }

            const data = await response.json()
            setCurrentUserId(Number(data.id))
        } catch (err) {
            setError(err.message || 'Failed to identify current user')
        }
    }



    const fetchUsers = async () => {
        try {
            const response = await apiFetch('/users')
            const data = await response.json()

            if (!response.ok) {
            throw new Error(
                data?.message ||
                data?.error ||
                `Failed to fetch users (${response.status})`
            )
            }

            setUsers(Array.isArray(data) ? data : data.items || [])
        } catch (err) {
            setError(err.message || 'Failed to load users')
        }
    }




    const addParticipant = async () => {

        if (!showParticipantForm || !selectedUserId) return

        try {
            setAddingParticipant(true)
            setError('')

            const response = await apiFetch('/meeting-participants', {
            method: 'POST',
            body: JSON.stringify({
                meeting_id: showParticipantForm,
                user_id: Number(selectedUserId),
                response: 'invited',
                attended: false,
            }),
            })

            const data = await response.json().catch(() => null)

            if (!response.ok) {
            const errorMessage =
                data?.message ||
                data?.error ||
                data?.[0]?.message ||
                `Failed to invite participant (${response.status})`

            throw new Error(errorMessage)
            }

            setShowParticipantForm(null)
            setSelectedUserId('')

            await fetchMeetings()
        } catch (err) {
            setError(err.message || 'Failed to invite participant')
        } finally {
            setAddingParticipant(false)
        }
    }




    const updateParticipantResponse = async (participantId, response) => {
        try {
            setError('')

            const apiResponse = await apiFetch(
            `/meeting-participants/${participantId}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                response,
                }),
            }
            )

            const data = await apiResponse.json().catch(() => null)

            if (!apiResponse.ok) {
            const errorMessage =
                data?.message ||
                data?.error ||
                data?.[0]?.message ||
                `Failed to update participant (${apiResponse.status})`

            throw new Error(errorMessage)
            }

            await fetchMeetings()
        } catch (err) {
            setError(err.message || 'Failed to update participant')
        }
    }






    const updateParticipantAttendance = async (participantId, attended) => {
        try {
            setError('')

            const apiResponse = await apiFetch(
                `/meeting-participants/${participantId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        attended,
                    }),
                }
            )

            const data = await apiResponse.json().catch(() => null)

            if (!apiResponse.ok) {
                const errorMessage =
                    data?.message ||
                    data?.error ||
                    data?.[0]?.message ||
                    `Failed to update attendance (${apiResponse.status})`

                throw new Error(errorMessage)
            }

            await fetchMeetings()
        } catch (err) {
            setError(err.message || 'Failed to update attendance')
        }
    }





    useEffect(() => {
        fetchCurrentUser()
        fetchMeetings()
    }, [])




    const createMeeting = async () => {
        try {
            setCreatingMeeting(true)
            setError('')

            const response = await apiFetch('/meetings', {
                method: 'POST',
                body: JSON.stringify({
                title: newMeeting.title.trim(),
                agenda: newMeeting.agenda.trim() || null,
                start_time: Math.floor(
                    new Date(newMeeting.start_time).getTime() / 1000
                ),
                end_time: Math.floor(
                    new Date(newMeeting.end_time).getTime() / 1000
                ),
                timezone: newMeeting.timezone,
                location: newMeeting.location.trim() || null,
                meeting_link: newMeeting.meeting_link.trim() || null,
                is_recurring: newMeeting.is_recurring,
                }),
            })

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                const errorMessage =
                data?.message ||
                data?.error ||
                data?.[0]?.message ||
                `Failed to create meeting (${response.status})`

                throw new Error(errorMessage)
            }

            setMeetings((previous) => [
                ...previous,
                data,
            ])

            setNewMeeting({
                title: '',
                agenda: '',
                start_time: '',
                end_time: '',
                timezone: 'Asia/Kolkata',
                location: '',
                meeting_link: '',
                is_recurring: false,
            })

            setShowCreateForm(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setCreatingMeeting(false)
        }
    }

  const formatMeetingDate = (timestamp) => {
    if (!timestamp) {
      return 'Date not available'
    }

    return new Date(timestamp * 1000).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const upcomingMeetings = meetings.filter(
    (meeting) => Number(meeting.start_time) * 1000 > Date.now()
  ).length

  const recurringMeetings = meetings.filter(
    (meeting) => Number(meeting.is_recurring) === 1
  ).length

  if (loading) {
    return (
      <div className="meetings-page">
        <div className="meetings-header">
          <div>
            <h1>Meetings</h1>
            <p>Schedule and manage your team's meetings.</p>
          </div>
        </div>

        <div className="meetings-loading">
          <div className="loading-spinner"></div>
          <p>Loading meetings...</p>
        </div>
      </div>
    )
  }

  if (error && meetings.length === 0) {
    return (
      <div className="meetings-page">
        <div className="meetings-header">
          <div>
            <h1>Meetings</h1>
            <p>Schedule and manage your team's meetings.</p>
          </div>
        </div>

        <div className="meetings-error">
          <div className="error-icon">!</div>
          <h3>Unable to load meetings</h3>
          <p>{error}</p>

          <button
            onClick={fetchMeetings}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="meetings-page">

      <div className="meetings-header">
        <div>
          <h1>Meetings</h1>
          <p>Schedule and manage your team's meetings.</p>
        </div>

        <button
          className="create-meeting-button"
          onClick={() => setShowCreateForm(true)}
        >
          <span>+</span>
          Schedule Meeting
        </button>
      </div>


      {error && (
        <div className="meetings-inline-error">
          {error}
        </div>
      )}


      {showCreateForm && (
        <div className="create-meeting-form">

          <div className="create-meeting-form-header">
            <div>
              <h2>Schedule Meeting</h2>
              <p>Add a new meeting to your workspace.</p>
            </div>

            <button
              type="button"
              className="close-create-meeting"
              onClick={() => setShowCreateForm(false)}
            >
              ×
            </button>
          </div>


          <div className="create-meeting-fields">

            <div className="form-field">
              <label>Meeting Title</label>

              <input
                type="text"
                value={newMeeting.title}
                onChange={(e) =>
                  setNewMeeting({
                    ...newMeeting,
                    title: e.target.value,
                  })
                }
                placeholder="Enter meeting title"
              />
            </div>


            <div className="form-field">
              <label>Agenda</label>

              <textarea
                value={newMeeting.agenda}
                onChange={(e) =>
                  setNewMeeting({
                    ...newMeeting,
                    agenda: e.target.value,
                  })
                }
                placeholder="Add meeting agenda"
                rows="3"
              />
            </div>


            <div className="form-row">

              <div className="form-field">
                <label>Start Time</label>

                <input
                  type="datetime-local"
                  value={newMeeting.start_time}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      start_time: e.target.value,
                    })
                  }
                />
              </div>


              <div className="form-field">
                <label>End Time</label>

                <input
                  type="datetime-local"
                  value={newMeeting.end_time}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      end_time: e.target.value,
                    })
                  }
                />
              </div>

            </div>


            <div className="form-row">

              <div className="form-field">
                <label>Timezone</label>

                <select
                  value={newMeeting.timezone}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      timezone: e.target.value,
                    })
                  }
                >
                  <option value="Asia/Kolkata">
                    Asia/Kolkata
                  </option>
                  <option value="UTC">
                    UTC
                  </option>
                </select>
              </div>


              <div className="form-field">
                <label>Location</label>

                <input
                  type="text"
                  value={newMeeting.location}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      location: e.target.value,
                    })
                  }
                  placeholder="Meeting room or location"
                />
              </div>

            </div>


            <div className="form-field">
              <label>Meeting Link</label>

              <input
                type="text"
                value={newMeeting.meeting_link}
                onChange={(e) =>
                  setNewMeeting({
                    ...newMeeting,
                    meeting_link: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </div>


            <label className="recurring-checkbox">
              <input
                type="checkbox"
                checked={newMeeting.is_recurring}
                onChange={(e) =>
                  setNewMeeting({
                    ...newMeeting,
                    is_recurring: e.target.checked,
                  })
                }
              />

              <span>Recurring meeting</span>
            </label>

          </div>


          <div className="create-meeting-actions">

            <button
              type="button"
              className="cancel-meeting-button"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-meeting-button"
              disabled={
                !newMeeting.title.trim() ||
                !newMeeting.start_time ||
                !newMeeting.end_time ||
                creatingMeeting
              }
              onClick={createMeeting}
            >
              {creatingMeeting
                ? 'Creating...'
                : 'Schedule Meeting'}
            </button>

          </div>

        </div>
      )}



      {showParticipantForm && (
        <div className="participant-form">

            <div className="participant-form-header">
            <div>
                <h2>Invite Participant</h2>
                <p>Select a user to invite to this meeting.</p>
            </div>

            <button
                type="button"
                className="close-participant-form"
                onClick={() => {
                setShowParticipantForm(null)
                setSelectedUserId('')
                }}
            >
                ×
            </button>
            </div>

            <div className="participant-form-fields">

            <div className="form-field">
                <label>Select User</label>

                <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                >
                <option value="">
                    Select a user
                </option>

                {users
                    .filter((user) => {
                    const currentMeeting = meetings.find(
                        (meeting) => meeting.id === showParticipantForm
                    )

                    const existingParticipantIds =
                        currentMeeting?.participants?.map(
                        (participant) => Number(participant.user_id)
                        ) || []

                    return !existingParticipantIds.includes(Number(user.id))
                    })
                    .map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                    </option>
                    ))}
                </select>
            </div>

            </div>

            <div className="participant-form-actions">

                <button
                    type="button"
                    className="cancel-participant-button"
                    onClick={() => {
                    setShowParticipantForm(null)
                    setSelectedUserId('')
                    }}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="save-participant-button"
                    onClick={addParticipant}
                    disabled={!selectedUserId || addingParticipant}
                >
                    {addingParticipant
                    ? 'Inviting...'
                    : 'Invite Participant'}
                </button>

            </div>

        </div>
      )}



      <div className="meeting-summary">

        <div className="summary-card">
          <div className="summary-icon total">✓</div>

          <div>
            <span>Total Meetings</span>
            <strong>{meetings.length}</strong>
          </div>
        </div>


        <div className="summary-card">
          <div className="summary-icon upcoming">◷</div>

          <div>
            <span>Upcoming</span>
            <strong>{upcomingMeetings}</strong>
          </div>
        </div>


        <div className="summary-card">
          <div className="summary-icon recurring">↻</div>

          <div>
            <span>Recurring</span>
            <strong>{recurringMeetings}</strong>
          </div>
        </div>

      </div>


      <div className="meetings-toolbar">

        <div>
          <h2>All Meetings</h2>
          <span>{meetings.length} meetings</span>
        </div>

      </div>


      {meetings.length === 0 ? (
        <div className="empty-meetings">
          <div className="empty-icon">◷</div>

          <h3>No meetings yet</h3>

          <p>
            Schedule your first meeting to get started.
          </p>
        </div>
      ) : (
        <div className="meeting-list">

          {meetings.map((meeting) => (

            <div
              className={`meeting-card ${
                selectedMeeting?.id === meeting.id ? 'selected-meeting' : ''
              }`}
              key={meeting.id}
            >

              <div className="meeting-card-main">

                <div className="meeting-icon">
                  ◷
                </div>

                <div className="meeting-content">

                  <h3>{meeting.title}</h3>

                  {meeting.agenda && (
                    <p className="meeting-description">
                      {meeting.agenda}
                    </p>
                  )}

                  <div className="meeting-meta">

                    <span className="meeting-date">
                        {formatMeetingDate(meeting.start_time)}
                    </span>

                    {meeting.location && (
                        <span className="meeting-location">
                        {meeting.location}
                        </span>
                    )}

                    {Number(meeting.is_recurring) === 1 && (
                        <span className="recurring-badge">
                        Recurring
                        </span>
                    )}

                    {meeting.participants?.length > 0 && (
                        <div className="participant-names">
                            {meeting.participants.map((participant) => (
                            <div key={participant.id} className="participant-item">
                                <span className="participant-name">
                                {participant.user?.name || `User ${participant.user_id}`}
                                </span>

                                <div className="participant-response">
                                {Number(participant.user_id) === currentUserId ||
                                Number(meeting.created_by) === currentUserId ? (
                                    <select
                                    className={`participant-status-select ${participant.response}`}
                                    value={participant.response}
                                    onChange={(e) =>
                                        updateParticipantResponse(
                                        participant.id,
                                        e.target.value
                                        )
                                    }
                                    >
                                    <option value="invited">Invited</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="declined">Declined</option>
                                    </select>
                                ) : (
                                    <span className={`participant-status ${participant.response}`}>
                                    {participant.response}
                                    </span>
                                )}
                                </div>

                                <div className="participant-attendance">
                                {Number(meeting.created_by) === currentUserId ? (
                                    <label className="attendance-control">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(participant.attended)}
                                        onChange={(e) =>
                                        updateParticipantAttendance(
                                            participant.id,
                                            e.target.checked
                                        )
                                        }
                                    />
                                    <span>
                                        {participant.attended ? 'Present' : 'Absent'}
                                    </span>
                                    </label>
                                ) : (
                                    <span className="attendance-status">
                                    {participant.attended ? 'Present' : 'Absent'}
                                    </span>
                                )}
                                </div>


                            </div>
                            ))}
                        </div>
                    )}

                  </div>


                </div>

              </div>



              <div className="meeting-card-right">

                <button
                    type="button"
                    className="invite-participant-button"
                    onClick={() => {
                    setShowParticipantForm(meeting.id)
                    setSelectedUserId('')
                    fetchUsers()
                    }}
                >
                    + Invite
                </button>

                <div className="meeting-id">
                    MEETING-{meeting.id}
                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  )
}

export default Meetings