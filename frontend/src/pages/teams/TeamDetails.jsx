import { useState } from 'react'

function TeamDetails({
  team,
  onManageMembers,
  onTeamUpdated,
  onTeamDeleted,
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(team?.name || '')
  const [description, setDescription] = useState(team?.description || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleting, setDeleting] = useState(false)

  if (!team) {
    return null
  }

  const handleEdit = () => {
    setName(team.name || '')
    setDescription(team.description || '')
    setError('')
    setSuccess('')
    setEditing(true)
  }

  const handleCancel = () => {
    setName(team.name || '')
    setDescription(team.description || '')
    setError('')
    setSuccess('')
    setEditing(false)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Team name is required.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch(
        `http://localhost:8080/teams/${team.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer user1-test-token-12345',
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to update team (${response.status})`
        )
      }

      const updatedTeam = await response.json()

      setName(updatedTeam.name || '')
      setDescription(updatedTeam.description || '')
      setSuccess('Team updated successfully.')
      setEditing(false)

      if (onTeamUpdated) {
        onTeamUpdated(updatedTeam)
      }

    } catch (error) {
      console.error('Error updating team:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }




  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${team.name}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)
      setError('')
      setSuccess('')

      const response = await fetch(
        `http://localhost:8080/teams/${team.id}`,
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
          `Failed to delete team (${response.status})`
        )
      }

      setSuccess('Team deleted successfully.')

      if (onTeamDeleted) {
        onTeamDeleted(team.id)
      }

    } catch (error) {
      console.error('Error deleting team:', error)
      setError(error.message)
    } finally {
      setDeleting(false)
    }
  }




  return (
    <div className="team-details-card">

      <div className="team-details-header">
        <div className="team-details-title">

          <div className="team-details-avatar">
            {team.name?.charAt(0)?.toUpperCase() || 'T'}
          </div>

          <div>
            <h3>{team.name}</h3>

            <span>
              Team ID: {team.id}
            </span>
          </div>

        </div>

        <span className="team-active-badge">
          <span></span>
          Active
        </span>
      </div>

      {!editing ? (
        <>
          <div className="team-details-body">

            <div className="team-info-item">
              <span>TEAM NAME</span>
              <strong>{team.name}</strong>
            </div>

            <div className="team-info-item">
              <span>TEAM ID</span>
              <strong>#{team.id}</strong>
            </div>

            <div className="team-info-item">
              <span>STATUS</span>
              <strong>{team.status || 'Active'}</strong>
            </div>

            <div className="team-info-item">
              <span>VISIBILITY</span>
              <strong>{team.visibility || 'Private'}</strong>
            </div>

          </div>

          <div className="team-details-footer">

            <button
              className="team-secondary-button"
              onClick={handleEdit}
            >
              Edit Team
            </button>


              <button
                className="team-primary-button"
                onClick={onManageMembers}
              >
                Manage Members
              </button>


            <button
              className="team-danger-button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Team'}
            </button>

          </div>

        </>
      ) : (
        <div className="team-edit-form">

          <div className="team-form-field">
            <label>Team Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
            />
          </div>

          <div className="team-form-field">
            <label>Description</label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter team description"
              rows="4"
            />
          </div>

          {error && (
            <div className="team-error">
              {error}
            </div>
          )}

          {success && (
            <div className="team-success">
              {success}
            </div>
          )}

          <div className="team-details-footer">

            <button
              className="team-secondary-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className="team-primary-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default TeamDetails