import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/api'

function ReportingHierarchy() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedManagerId, setSelectedManagerId] = useState('')
  const [updatingManager, setUpdatingManager] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await apiFetch('/users')

      if (!response.ok) {
        throw new Error(`Failed to load hierarchy (${response.status})`)
      }

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching reporting hierarchy:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }




  const updateManager = async () => {
    if (!selectedUserId) {
      setUpdateMessage('Please select a user.')
      return
    }

    try {
      setUpdatingManager(true)
      setUpdateMessage('')
      setError('')

      const response = await apiFetch(`/users/${selectedUserId}`, {
        method: 'PUT',
        body: JSON.stringify({
          manager_id: selectedManagerId
            ? Number(selectedManagerId)
            : null,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.[0]?.message ||
          data?.message ||
          `Failed to update manager (${response.status})`
        )
      }

      setUpdateMessage('Reporting relationship updated successfully.')

      await fetchUsers()
    } catch (error) {
      console.error('Error updating manager:', error)
      setUpdateMessage(error.message)
    } finally {
      setUpdatingManager(false)
    }
  }




  useEffect(() => {
    fetchUsers()
  }, [])

  const managers = users.filter((user) => {
    return users.some((employee) => employee.manager_id === user.id)
  })

  const topLevelUsers = users.filter((user) => !user.manager_id)

  const getDirectReports = (managerId) => {
    return users.filter((user) => user.manager_id === managerId)
  }



  const renderHierarchy = (user) => {
    const directReports = getDirectReports(user.id)

    return (
      <div className="hierarchy-node" key={user.id}>

        <div className="hierarchy-user">
          <div className="hierarchy-avatar">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="hierarchy-user-info">
            <strong>{user.name}</strong>

            <span>
              User ID: {user.id}
            </span>
          </div>

          {directReports.length > 0 && (
            <span className="manager-label">
              Manager
            </span>
          )}

          <span className="hierarchy-status">
            <span></span>
            Active
          </span>
        </div>

        {directReports.length > 0 && (
          <div className="hierarchy-children">
            {directReports.map((employee) =>
              renderHierarchy(employee)
            )}
          </div>
        )}

      </div>
    )
  }



  return (
    <div className="organization-section hierarchy-section">

      <div className="section-heading">
        <div>
          <h3>Reporting Hierarchy</h3>
          <p>
            View the reporting relationships between users in the
            organization.
          </p>
        </div>

        <button className="secondary-button" onClick={fetchUsers}>
          Refresh
        </button>
      </div>

      {loading && (
        <div className="organization-loading">
          Loading reporting hierarchy...
        </div>
      )}

      {error && (
        <div className="organization-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="organization-stats">

            <div className="organization-stat-card">
              <div className="stat-icon users-icon">
                👥
              </div>

              <div>
                <span>Total Users</span>
                <strong>{users.length}</strong>
              </div>
            </div>

            <div className="organization-stat-card">
              <div className="stat-icon manager-icon">
                M
              </div>

              <div>
                <span>Managers</span>
                <strong>{managers.length}</strong>
              </div>
            </div>

            <div className="organization-stat-card">
              <div className="stat-icon active-icon">
                ↳
              </div>

              <div>
                <span>Top-Level Users</span>
                <strong>{topLevelUsers.length}</strong>
              </div>
            </div>

          </div>

          <div className="hierarchy-card">

            <div className="hierarchy-card-header">
              <div>
                <h4>Organization Reporting Structure</h4>
                <span>
                  {users.length} users · {managers.length} managers
                </span>
              </div>

              <div className="hierarchy-legend">
                <span className="legend-dot"></span>
                Active
              </div>
            </div>


            <div className="reporting-controls">
              <div>
                <label>Select User</label>

                <select
                  value={selectedUserId}
                  onChange={(event) => {
                    const userId = event.target.value
                    setSelectedUserId(userId)

                    const selectedUser = users.find(
                      (user) => user.id === Number(userId)
                    )

                    setSelectedManagerId(
                      selectedUser?.manager_id
                        ? String(selectedUser.manager_id)
                        : ''
                    )

                    setUpdateMessage('')
                  }}
                >
                  <option value="">Select a user</option>

                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Reports To</label>

                <select
                  value={selectedManagerId}
                  onChange={(event) => setSelectedManagerId(event.target.value)}
                  disabled={!selectedUserId}
                >
                  <option value="">No Manager — Top-level User</option>

                  {users
                    .filter((user) => user.id !== Number(selectedUserId))
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={updateManager}
                disabled={!selectedUserId || updatingManager}
              >
                {updatingManager ? 'Updating...' : 'Update Reporting Line'}
              </button>
            </div>

            {updateMessage && (
              <div className="organization-success">
                {updateMessage}
              </div>
            )}



            <div className="hierarchy-tree">

              {topLevelUsers.map((user) => renderHierarchy(user))}

              {users.length === 0 && (
                <div className="organization-empty">
                  No reporting relationships found.
                </div>
              )}

            </div>

            <div className="hierarchy-footer">
              Reporting relationships are based on each user's manager assignment.
            </div>

          </div>
        </>
      )}

    </div>
  )
}

export default ReportingHierarchy