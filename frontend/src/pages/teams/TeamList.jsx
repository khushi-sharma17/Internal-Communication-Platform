import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/api'

function TeamList({
  selectedTeam,
  setSelectedTeam,
  deletedTeamId,
}) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // CREATE TEAM STATES
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [organizationUnitId, setOrganizationUnitId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const fetchTeams = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await apiFetch('/teams')

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            'You are not authorized to access this section.'
          )
        }

        throw new Error(
          `Failed to load teams (${response.status})`
        )
      }

      const data = await response.json()

      setTeams(data)

      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }




  useEffect(() => {
    fetchTeams()
  }, [])




  useEffect(() => {
    if (!deletedTeamId) {
      return
    }

    setTeams((currentTeams) =>
      currentTeams.filter((team) => team.id !== deletedTeamId)
    )
  }, [deletedTeamId])




  const handleCreateTeam = async (event) => {
    event.preventDefault()

    setCreateError('')
    setCreateSuccess('')

    if (!teamName.trim()) {
      setCreateError('Team name is required.')
      return
    }

    if (!organizationUnitId) {
      setCreateError('Organization Unit ID is required.')
      return
    }

    try {
      setCreating(true)

      const response = await apiFetch('/teams', {
        method: 'POST',
        body: JSON.stringify({
          organization_unit_id: Number(organizationUnitId),
          name: teamName.trim(),
          description: teamDescription.trim(),
          created_at: Math.floor(Date.now() / 1000),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.name?.[0] ||
          `Failed to create team (${response.status})`
        )
      }

      setTeams((currentTeams) => [...currentTeams, data])
      setSelectedTeam(data)

      setTeamName('')
      setTeamDescription('')
      setOrganizationUnitId('')
      setCreateSuccess('Team created successfully.')
      setShowCreateForm(false)

    } catch (error) {
      console.error('Error creating team:', error)
      setCreateError(error.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="teams-section">

      {/* HEADER */}
      <div className="teams-section-header">
        <div>
          <h3>Teams</h3>
          <p>
            View and manage teams across the organization.
          </p>
        </div>

        <div>
          <button
            className="team-primary-button"
            onClick={() => {
              setShowCreateForm(true)
              setCreateError('')
              setCreateSuccess('')
            }}
          >
            + Create Team
          </button>

          <button
            className="team-secondary-button"
            onClick={fetchTeams}
            style={{ marginLeft: '8px' }}
          >
            Refresh
          </button>
        </div>
      </div>


      {/* CREATE TEAM FORM */}
      {showCreateForm && (
        <div className="teams-list-card team-edit-form">

          <div className="teams-list-header">
            <div>
              <h4>Create New Team</h4>
              <span>
                Add a new team to the organization.
              </span>
            </div>
          </div>

          {createError && (
            <div className="team-error">
              {createError}
            </div>
          )}

          <form onSubmit={handleCreateTeam}>

            <div className="team-form-field">
              <label>Team Name</label>

              <input
                type="text"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="Enter team name"
              />
            </div>


            <div className="team-form-field">
              <label>Description</label>

              <textarea
                value={teamDescription}
                onChange={(event) =>
                  setTeamDescription(event.target.value)
                }
                placeholder="Enter team description"
              />
            </div>


            <div className="team-form-field">
              <label>Organization Unit ID</label>

              <input
                type="number"
                value={organizationUnitId}
                onChange={(event) =>
                  setOrganizationUnitId(event.target.value)
                }
                placeholder="Enter organization unit ID"
              />
            </div>


            <div>
              <button
                type="submit"
                className="team-primary-button"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Team'}
              </button>

              <button
                type="button"
                className="team-secondary-button"
                onClick={() => {
                  setShowCreateForm(false)
                  setCreateError('')
                }}
                disabled={creating}
                style={{ marginLeft: '8px' }}
              >
                Cancel
              </button>
            </div>

          </form>

        </div>
      )}


      {/* SUCCESS */}
      {createSuccess && (
        <div className="team-success">
          {createSuccess}
        </div>
      )}


      {/* STATS */}
      {!loading && !error && (
        <div className="team-stats">

          <div className="team-stat-card">
            <div className="team-stat-icon team-icon">
              T
            </div>

            <div>
              <span>Total Teams</span>
              <strong>{teams.length}</strong>
            </div>
          </div>

          <div className="team-stat-card">
            <div className="team-stat-icon active-team-icon">
              ✓
            </div>

            <div>
              <span>Active Teams</span>
              <strong>{teams.length}</strong>
            </div>
          </div>

          <div className="team-stat-card">
            <div className="team-stat-icon member-team-icon">
              👥
            </div>

            <div>
              <span>Team Management</span>
              <strong>RBAC</strong>
            </div>
          </div>

        </div>
      )}


      {/* TEAM LIST */}
      <div className="teams-list-card">

        <div className="teams-list-header">
          <div>
            <h4>Organization Teams</h4>

            <span>
              {teams.length} team
              {teams.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>


        {/* LOADING */}
        {loading && (
          <div className="team-loading">
            Loading teams...
          </div>
        )}


        {/* ERROR */}
        {error && (
          <div className="team-error">
            {error}
          </div>
        )}


        {/* EMPTY */}
        {!loading && !error && teams.length === 0 && (
          <div className="team-empty">
            No teams found.
          </div>
        )}


        {/* TEAM CARDS */}
        {!loading && !error && teams.length > 0 && (
          <div className="team-list">

            {teams.map((team) => (
              <button
                key={team.id}
                className={`team-list-item ${
                  selectedTeam?.id === team.id
                    ? 'selected'
                    : ''
                }`}
                onClick={() => setSelectedTeam(team)}
              >

                <div className="team-avatar">
                  {team.name?.charAt(0)?.toUpperCase() || 'T'}
                </div>


                <div className="team-list-info">

                  <strong>
                    {team.name}
                  </strong>

                  <span>
                    Team ID: {team.id}
                  </span>

                </div>


                <div className="team-list-status">
                  <span></span>
                  Active
                </div>


                <div className="team-arrow">
                  →
                </div>

              </button>
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default TeamList