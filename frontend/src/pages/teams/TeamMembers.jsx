import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/api'

function TeamMembers({ selectedTeam }) {
  const [members, setMembers] = useState([])
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [userId, setUserId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState('')
  const [removeSuccess, setRemoveSuccess] = useState('')


  const [editingRole, setEditingRole] = useState(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [updatingRole, setUpdatingRole] = useState(false)

  const [reportingUserId, setReportingUserId] = useState('')
  const [editingReporting, setEditingReporting] = useState(null)
  const [updatingReporting, setUpdatingReporting] = useState(false)
  

  const fetchMembers = async () => {
    if (!selectedTeam) {
      setMembers([])
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await apiFetch(
        `/teams/${selectedTeam.id}/members`
      )

      if (!response.ok) {
        throw new Error(
          `Failed to load team members (${response.status})`
        )
      }

      const data = await response.json()

      setMembers(data)
    } catch (error) {
      console.error('Error fetching team members:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }



  const fetchUsers = async () => {
    try {
      setUsersLoading(true)

      const response = await apiFetch('/users')

      if (!response.ok) {
        throw new Error(
          `Failed to load users (${response.status})`
        )
      }

      const data = await response.json()

      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setAddError(error.message)
    } finally {
      setUsersLoading(false)
    }
  }



  const fetchRoles = async () => {
    try {
      setRolesLoading(true)

      const response = await apiFetch('/roles')

      if (!response.ok) {
        throw new Error(
          `Failed to load roles (${response.status})`
        )
      }

      const data = await response.json()

      setRoles(data)
    } catch (error) {
      console.error('Error fetching roles:', error)
      setAddError(error.message)
    } finally {
      setRolesLoading(false)
    }
  }



  const handleAddMember = async (event) => {
    event.preventDefault()

    setAddError('')
    setAddSuccess('')

    if (!userId) {
      setAddError('Please select a user.')
      return
    }

    try {
      setAdding(true)

      const response = await apiFetch(
        '/team-memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            team_id: selectedTeam.id,
            user_id: Number(userId),
            role_id: roleId ? Number(roleId) : null,
            joined_at: Math.floor(Date.now() / 1000),
            status: 'active',
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.errors?.user_id?.[0] ||
          data?.user_id?.[0] ||
          `Failed to add member (${response.status})`
        )
      }

      setAddSuccess('Member added successfully.')
      setUserId('')
      setRoleId('')
      setShowAddForm(false)

      await fetchMembers()

    } catch (error) {
      console.error('Error adding team member:', error)
      setAddError(error.message)
    } finally {
      setAdding(false)
    }
  }



  const handleRemoveMember = async (membershipId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${userName} from ${selectedTeam.name}?`
    )

    if (!confirmed) {
      return
    }

    try {
      setRemoving(true)
      setRemoveError('')
      setRemoveSuccess('')

      const response = await apiFetch(
        `/team-memberships/${membershipId}`,
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
          data?.errors?.user_id?.[0] ||
          `Failed to remove member (${response.status})`
        )
      }

      setRemoveSuccess(`${userName} was removed from the team.`)

      await fetchMembers()
    } catch (error) {
      console.error('Error removing team member:', error)
      setRemoveError(error.message)
    } finally {
      setRemoving(false)
    }
  }




  const handleUpdateRole = async (membershipId, userName) => {
    if (!selectedRoleId) {
      setRemoveError('Please select a role.')
      return
    }

    try {
      setUpdatingRole(true)
      setRemoveError('')
      setRemoveSuccess('')

      const response = await apiFetch(
        `/team-memberships/${membershipId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            role_id: Number(selectedRoleId),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.errors?.role_id?.[0] ||
          `Failed to update role (${response.status})`
        )
      }

      setEditingRole(null)
      setSelectedRoleId('')

      setRemoveSuccess(
        `${userName}'s role was updated successfully.`
      )

      await fetchMembers()
    } catch (error) {
      console.error('Error updating member role:', error)
      setRemoveError(error.message)
    } finally {
      setUpdatingRole(false)
    }
  }




  const handleUpdateReporting = async (membershipId, userName) => {
    
    if (reportingUserId === undefined) {
      setRemoveError('Please select a reporting option.')
      return
    }

    try {
      setUpdatingReporting(true)
      setRemoveError('')
      setRemoveSuccess('')

      const response = await apiFetch(
        `/team-memberships/${membershipId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            reports_to_user_id: reportingUserId
              ? Number(reportingUserId)
              : null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.errors?.reports_to_user_id?.[0] ||
          `Failed to update reporting person (${response.status})`
        )
      }

      setEditingReporting(null)
      setReportingUserId('')

      setRemoveSuccess(
        `${userName}'s reporting person was updated successfully.`
      )

      await fetchMembers()
    } catch (error) {
      console.error('Error updating reporting person:', error)
      setRemoveError(error.message)
    } finally {
      setUpdatingReporting(false)
    }
  }




  useEffect(() => {
    fetchMembers()
  }, [selectedTeam])

  if (!selectedTeam) {
    return (
      <div className="team-empty">
        Select a team to view its members.
      </div>
    )
  }

  return (
    <div className="teams-section">

      {/* HEADER */}
      <div className="teams-section-header">

        <div>
          <h3>Team Members</h3>

          <p>
            Members of {selectedTeam.name}.
          </p>
        </div>

        <div>
          <button
            className="team-primary-button"
            onClick={() => {
              setShowAddForm(true)
              setAddError('')
              setAddSuccess('')
              fetchUsers()
              fetchRoles()
            }}
          >
            + Add Member
          </button>

          <button
            className="team-secondary-button"
            onClick={fetchMembers}
            style={{ marginLeft: '8px' }}
          >
            Refresh
          </button>
        </div>

      </div>



      {showAddForm && (
        <div className="teams-list-card team-edit-form">

          <div className="teams-list-header">
            <div>
              <h4>Add Team Member</h4>
              <span>
                Add a user to {selectedTeam.name}.
              </span>
            </div>
          </div>

          {addError && (
            <div className="team-error">
              {addError}
            </div>
          )}

          <form onSubmit={handleAddMember}>

            <div className="team-form-field">
              <label>Select User</label>

              <select
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? 'Loading users...' : 'Select a user'}
                </option>

                {users
                  .filter(
                    (user) =>
                      !members.some(
                        (member) => member.id === user.id
                      )
                  )
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} — {user.email}
                    </option>
                  ))}
              </select>
            </div>

            
            <div className="team-form-field">
              <label>Select Role</label>

              <select
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
                disabled={rolesLoading}
              >
                <option value="">
                  {rolesLoading ? 'Loading roles...' : 'Select a role'}
                </option>

                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>


            <div className="team-form-actions">
              <button
                type="submit"
                className="team-primary-button"
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add Member'}
              </button>

              <button
                type="button"
                className="team-secondary-button"
                onClick={() => {
                  setShowAddForm(false)
                  setAddError('')
                }}
                disabled={adding}
              >
                Cancel
              </button>
            </div>

          </form>

        </div>
      )}


      {addSuccess && (
        <div className="team-success">
          {addSuccess}
        </div>
      )}


      {removeError && (
        <div className="team-error">
          {removeError}
        </div>
      )}

      {removeSuccess && (
        <div className="team-success">
          {removeSuccess}
        </div>
      )}


      {/* STATS */}
      {!loading && !error && (
        <div className="team-stats">

          <div className="team-stat-card">

            <div className="team-stat-icon member-team-icon">
              👥
            </div>

            <div>
              <span>Total Members</span>
              <strong>{members.length}</strong>
            </div>

          </div>

          <div className="team-stat-card">

            <div className="team-stat-icon active-team-icon">
              ✓
            </div>

            <div>
              <span>Active Members</span>
              <strong>{members.length}</strong>
            </div>

          </div>

          <div className="team-stat-card">

            <div className="team-stat-icon team-icon">
              T
            </div>

            <div>
              <span>Team</span>
              <strong>{selectedTeam.name}</strong>
            </div>

          </div>

        </div>
      )}


      {/* MEMBERS CARD */}
      <div className="teams-list-card">

        <div className="teams-list-header">

          <div>
            <h4>{selectedTeam.name} Members</h4>

            <span>
              {members.length} member
              {members.length !== 1 ? 's' : ''} found
            </span>
          </div>

        </div>


        {/* LOADING */}
        {loading && (
          <div className="team-loading">
            Loading team members...
          </div>
        )}


        {/* ERROR */}
        {error && (
          <div className="team-error">
            {error}
          </div>
        )}


        {/* EMPTY */}
        {!loading && !error && members.length === 0 && (
          <div className="team-empty">
            No members found for this team.
          </div>
        )}


        {/* MEMBERS */}
        {!loading && !error && members.length > 0 && (
          <div className="team-list">

            {members.map((member, index) => {

              const user =
                member.user ||
                member

              const userId =
                member.user_id ||
                user.id

              const userName =
                user.name ||
                `User ${userId}`

              const userEmail =
                user.email ||
                'No email available'


              const reportingUser = users.find(
                (user) => user.id === member.reports_to_user_id
              )

              const reportingUserName =
                reportingUser?.name || 'Not assigned'
              

              return (
                <div
                  className="team-member-item"
                  key={member.id || userId || index}
                >

                  <div className="team-avatar">
                    {userName
                      ?.charAt(0)
                      ?.toUpperCase() || 'U'}
                  </div>


                  <div className="team-list-info">

                    <strong>
                      {userName}
                    </strong>

                    <span>
                      {userEmail}
                    </span>

                  </div>


                  <div className="team-member-id">
                    User ID: {userId}
                  </div>


                  <div className="team-member-role">
                    {editingRole === member.membership_id ? (
                      <div className="team-role-edit">
                        <select
                          value={selectedRoleId}
                          onChange={(event) => setSelectedRoleId(event.target.value)}
                          disabled={updatingRole}
                        >
                          <option value="">
                            {rolesLoading ? 'Loading roles...' : 'Select role'}
                          </option>

                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="team-primary-button"
                          onClick={() =>
                            handleUpdateRole(member.membership_id, userName)
                          }
                          disabled={updatingRole || !selectedRoleId}
                        >
                          {updatingRole ? 'Saving...' : 'Save'}
                        </button>

                        <button
                          type="button"
                          className="team-secondary-button"
                          onClick={() => {
                            setEditingRole(null)
                            setSelectedRoleId('')
                          }}
                          disabled={updatingRole}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span>
                          Role:{' '}
                          {roles.find(
                            (role) => role.id === member.role_id
                          )?.name || 'No role assigned'}
                        </span>

                        <button
                          type="button"
                          className="team-role-edit-button"
                          onClick={() => {
                            setEditingRole(member.membership_id)
                            setSelectedRoleId(
                              member.role_id ? String(member.role_id) : ''
                            )
                            setRemoveError('')
                            setRemoveSuccess('')
                            fetchRoles()
                          }}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>


                  <div className="team-member-reporting">
                    {editingReporting === member.membership_id ? (
                      <div className="team-reporting-edit">
                        <select
                          value={reportingUserId}
                          onChange={(event) =>
                            setReportingUserId(event.target.value)
                          }
                          disabled={updatingReporting}
                        >
                          <option value="">
                            No reporting person
                          </option>

                          {members
                            .filter((teamMember) => teamMember.id !== member.id)
                            .map((teamMember) => (
                              <option
                                key={teamMember.id}
                                value={teamMember.id}
                              >
                                {teamMember.name}
                              </option>
                            ))}
                        </select>

                        <button
                          type="button"
                          className="team-primary-button"
                          onClick={() =>
                            handleUpdateReporting(
                              member.membership_id,
                              userName
                            )
                          }
                          disabled={updatingReporting}
                        >
                          {updatingReporting ? 'Saving...' : 'Save'}
                        </button>

                        <button
                          type="button"
                          className="team-secondary-button"
                          onClick={() => {
                            setEditingReporting(null)
                            setReportingUserId('')
                          }}
                          disabled={updatingReporting}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span>
                          Reports To: {reportingUserName}
                        </span>

                        <button
                          type="button"
                          className="team-role-edit-button"
                          onClick={() => {
                            setEditingReporting(member.membership_id)
                            setReportingUserId(
                              member.reports_to_user_id
                                ? String(member.reports_to_user_id)
                                : ''
                            )
                            setRemoveError('')
                            setRemoveSuccess('')
                            fetchUsers()
                          }}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>



                  <div className="team-list-status">
                    <span></span>
                    Active
                  </div>

                  <button
                    type="button"
                    className="team-secondary-button team-remove-button"
                    onClick={() => handleRemoveMember(member.membership_id, userName)}
                    disabled={removing}
                  >
                    {removing ? 'Removing...' : 'Remove'}
                  </button>

                </div>
              )
            })}

          </div>
        )}

      </div>

    </div>
  )
}

export default TeamMembers