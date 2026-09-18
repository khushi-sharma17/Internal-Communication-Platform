import { useState } from 'react'

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

      const response = await fetch(
        `http://localhost:8080/channels/${channel.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
            'Content-Type': 'application/json',
          },
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

      const response = await fetch(
        `http://localhost:8080/channels/${channel.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
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