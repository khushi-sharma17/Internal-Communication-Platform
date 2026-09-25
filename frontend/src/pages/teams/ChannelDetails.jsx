import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/api'

function ChannelDetails({
  channel,
  hasPermission,
  onChannelUpdated,
  onChannelDeleted,
}) {

  const [editing, setEditing] = useState(false)

  const [name, setName] = useState(channel?.name || '')
  const [description, setDescription] = useState(
    channel?.description || ''
  )
  const [type, setType] = useState(channel?.type || 'team')
  const [visibility, setVisibility] = useState(
    channel?.visibility || 'private'
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [memberError, setMemberError] = useState('')
  const [memberSuccess, setMemberSuccess] = useState('')



  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      setMemberError('')

      const [usersResponse, membershipsResponse] = await Promise.all([
        apiFetch('/users'),
        apiFetch('/channel-memberships'),
      ])

      if (!usersResponse.ok) {
        throw new Error(
          usersResponse.status === 403
            ? 'You are not authorized to view users.'
            : `Failed to load users (${usersResponse.status})`
        )
      }

      if (!membershipsResponse.ok) {
        if (membershipsResponse.status === 403) {
          throw new Error(
            'You are not authorized to access this section.'
          )
        }

        throw new Error(
          `Failed to load channel members (${membershipsResponse.status})`
        )
      }

      const allUsers = await usersResponse.json()
      const allMemberships = await membershipsResponse.json()

      const memberIds = new Set(
        allMemberships
          .filter(
            (membership) =>
              Number(membership.channel_id) === Number(channel.id) &&
              membership.status === 'active'
          )
          .map((membership) => Number(membership.user_id))
      )

      const availableUsers = allUsers.filter(
        (user) => !memberIds.has(Number(user.id))
      )

      setUsers(availableUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      setMemberError(error.message)
    } finally {
      setUsersLoading(false)
    }
  }




  useEffect(() => {
    if (showAddMember && hasPermission('manage_channel_members')) {
      fetchUsers()
    }
  }, [showAddMember])



  const handleAddMember = async (event) => {
    event.preventDefault()

    setMemberError('')
    setMemberSuccess('')

    if (!selectedUserId) {
      setMemberError('Please select a user.')
      return
    }

    try {
      setAddingMember(true)

      const response = await apiFetch(
        '/channel-memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            channel_id: channel.id,
            user_id: Number(selectedUserId),
            status: 'active',
            joined_at: Math.floor(Date.now() / 1000),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.errors?.user_id?.[0] ||
          data?.user_id?.[0] ||
          `Failed to add channel member (${response.status})`
        )
      }

      setMemberSuccess('Member added successfully.')
      setSelectedUserId('')
      setShowAddMember(false)

    } catch (error) {
      console.error('Error adding channel member:', error)
      setMemberError(error.message)
    } finally {
      setAddingMember(false)
    }
  }



  if (!channel) {
    return null
  }

  const handleEdit = () => {
    setName(channel.name || '')
    setDescription(channel.description || '')
    setType(channel.type || 'team')
    setVisibility(channel.visibility || 'private')

    setError('')
    setSuccess('')
    setEditing(true)
  }

  const handleCancel = () => {
    setName(channel.name || '')
    setDescription(channel.description || '')
    setType(channel.type || 'team')
    setVisibility(channel.visibility || 'private')

    setError('')
    setSuccess('')
    setEditing(false)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Channel name is required.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await apiFetch(
        `/channels/${channel.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            type,
            visibility,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.name?.[0] ||
          `Failed to update channel (${response.status})`
        )
      }

      setName(data.name || '')
      setDescription(data.description || '')
      setType(data.type || 'team')
      setVisibility(data.visibility || 'private')

      setSuccess('Channel updated successfully.')
      setEditing(false)

      if (onChannelUpdated) {
        onChannelUpdated(data)
      }

    } catch (error) {
      console.error('Error updating channel:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }




  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${channel.name}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)
      setError('')
      setSuccess('')

      const response = await apiFetch(
        `/channels/${channel.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        let data = {}

        try {
          data = await response.json()
        } catch {
          // DELETE may return an empty response
        }

        throw new Error(
          data?.message ||
          `Failed to delete channel (${response.status})`
        )
      }

      setSuccess('Channel deleted successfully.')

      if (onChannelDeleted) {
        onChannelDeleted(channel.id)
      }

    } catch (error) {
      console.error('Error deleting channel:', error)
      setError(error.message)
    } finally {
      setDeleting(false)
    }
  }




  return (
    <div className="channel-details-card">

      {/* HEADER */}
      <div className="channel-details-header">

        <div className="channel-details-title">

          <div className="channel-details-icon">
            #
          </div>

          <div>
            <h3>{channel.name}</h3>

            <span>
              Channel ID: {channel.id}
            </span>
          </div>

        </div>

        <span className="channel-active-badge">
          <span></span>
          Active
        </span>

      </div>

      {!editing ? (
        <>
          {/* INFORMATION */}
          <div className="channel-details-body">

            <div className="channel-info-item">
              <span>CHANNEL NAME</span>
              <strong>#{channel.name}</strong>
            </div>

            <div className="channel-info-item">
              <span>CHANNEL ID</span>
              <strong>#{channel.id}</strong>
            </div>

            <div className="channel-info-item">
              <span>TYPE</span>
              <strong>
                {channel.type === 'one_to_one'
                  ? 'One-to-One'
                  : channel.type
                    ? channel.type.charAt(0).toUpperCase() +
                      channel.type.slice(1)
                    : 'Team'}
              </strong>
            </div>

            <div className="channel-info-item">
              <span>VISIBILITY</span>
              <strong>
                {channel.visibility === 'private'
                  ? 'Private'
                  : 'Public'}
              </strong>
            </div>

            <div className="channel-info-item">
              <span>DESCRIPTION</span>
              <strong>
                {channel.description || 'No description'}
              </strong>
            </div>

          </div>

          {success && (
            <div className="team-success">
              {success}
            </div>
          )}

          {error && (
            <div className="team-error">
              {error}
            </div>
          )}



          {hasPermission('manage_channel_members') && (
            <div className="channel-members-section">

              <div className="channel-members-header">
                <h4>Channel Members</h4>

                <button
                  type="button"
                  className="team-secondary-button"
                  onClick={() => {
                    setMemberError('')
                    setMemberSuccess('')
                    setShowAddMember((current) => !current)
                  }}
                >
                  {showAddMember ? 'Cancel' : 'Add Member'}
                </button>
              </div>

              {showAddMember && (
                <form
                  className="team-edit-form"
                  onSubmit={handleAddMember}
                >
                  <div className="team-form-field">
                    <label>Select User</label>

                    <select
                      value={selectedUserId}
                      onChange={(event) =>
                        setSelectedUserId(event.target.value)
                      }
                      disabled={usersLoading || addingMember}
                    >
                      <option value="">
                        {usersLoading
                          ? 'Loading users...'
                          : 'Select a user'}
                      </option>

                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} — {user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {memberError && (
                    <div className="team-error">
                      {memberError}
                    </div>
                  )}

                  {memberSuccess && (
                    <div className="team-success">
                      {memberSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="team-primary-button"
                    disabled={addingMember || usersLoading}
                  >
                    {addingMember ? 'Adding...' : 'Add Member'}
                  </button>
                </form>
              )}
            </div>
          )}




          {/* FOOTER */}
          <div className="channel-details-footer">

            {hasPermission('manage_channels') && (
              <button
                className="team-secondary-button"
                onClick={handleEdit}
              >
                Edit Channel
              </button>
            )}


            {hasPermission('manage_channels') && (
              <button
                className="team-danger-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Channel'}
            </button>
            )}

          </div>

          
        </>
      ) : (
        /* EDIT FORM */
        <div className="team-edit-form">

          {error && (
            <div className="team-error">
              {error}
            </div>
          )}

          <div className="team-form-field">
            <label>Channel Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter channel name"
            />
          </div>

          <div className="team-form-field">
            <label>Description</label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Enter channel description"
              rows="4"
            />
          </div>

          <div className="team-form-field">
            <label>Channel Type</label>

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
            >
              <option value="team">Team</option>
              <option value="task">Task</option>
              <option value="announcement">
                Announcement
              </option>
              <option value="one_to_one">
                One-to-One
              </option>
            </select>
          </div>

          <div className="team-form-field">
            <label>Visibility</label>

            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value)
              }
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div>
            <button
              className="team-primary-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              className="team-secondary-button"
              onClick={handleCancel}
              disabled={saving}
              style={{ marginLeft: '8px' }}
            >
              Cancel
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

export default ChannelDetails