import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/api'

function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  const handleRoleChange = async (userId, roleId) => {
    try {
      const user = users.find((item) => item.id === userId)

      if (!user) {
        return
      }

      const currentAssignments = user.roleAssignments || []

      // Remove all existing role assignments for this user
      for (const assignment of currentAssignments) {
        const response = await apiFetch(
          `/user-roles/${assignment.id}`,
          {
            method: 'DELETE',
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          console.error(
            'Role removal failed:',
            JSON.stringify(errorData, null, 2)
          )

          throw new Error(
            `Failed to remove existing role (${response.status})`
          )
        }
      }

      // If "No role" was selected, stop here
      if (roleId === 0) {
        await fetchUsers()
        return
      }

      // Assign the newly selected role
      const response = await apiFetch('/user-roles', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          role_id: roleId,
          created_at: Math.floor(Date.now() / 1000),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        console.error(
          'Role assignment failed:',
          JSON.stringify(errorData, null, 2)
        )

        throw new Error(
          `Failed to assign role (${response.status})`
        )
      }

      await fetchUsers()
    } catch (error) {
      console.error('Role change error:', error)
      setError(error.message)
    }
  }


  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await apiFetch('/users')

      if (!response.ok) {
        throw new Error(`Failed to load users (${response.status})`)
      }

      const data = await response.json()

      const userRolesResponse = await apiFetch('/user-roles')

      if (!userRolesResponse.ok) {
        throw new Error('Failed to fetch user roles')
      }

      const userRolesData = await userRolesResponse.json()


      const usersWithRoleAssignments = data.map((user) => ({
        ...user,
        roleAssignments: userRolesData.filter(
          (userRole) => userRole.user_id === user.id
        ),
      }))

      setUsers(usersWithRoleAssignments)


      const rolesResponse = await apiFetch('/roles')

      if (!rolesResponse.ok) {
        throw new Error('Failed to fetch roles')
      }

      const rolesData = await rolesResponse.json()
      setRoles(rolesData)


    } catch (error) {
      console.error('Error fetching users:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="organization-section">

      <div className="section-heading">
        <div>
          <h3>Users</h3>
          <p>
            Manage and view users across the organization.
          </p>
        </div>

        <button className="secondary-button" onClick={fetchUsers}>
          Refresh
        </button>
      </div>

      {!loading && !error && (
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
            <div className="stat-icon active-icon">
              ✓
            </div>

            <div>
              <span>Active Users</span>
              <strong>{users.length}</strong>
            </div>
          </div>

          <div className="organization-stat-card">
            <div className="stat-icon manager-icon">
              M
            </div>

            <div>
              <span>Managers</span>
              <strong>
                {users.filter((user) =>
                  users.some(
                    (employee) => employee.manager_id === user.id
                  )
                ).length}
              </strong>
            </div>
          </div>

        </div>
      )}

      <div className="organization-table-card">

        <div className="table-card-header">
          <div>
            <h4>Organization Users</h4>
            <span>
              {users.length} user{users.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {loading && (
          <div className="organization-loading">
            Loading users...
          </div>
        )}

        {error && (
          <div className="organization-error">
            {error}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="organization-empty">
            No users found.
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="organization-table-wrapper">
            <table className="organization-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ORGANIZATION UNIT</th>
                  <th>MANAGER</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>

                    <td>
                      <div className="organization-user-cell">

                        <div className="organization-user-avatar">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                          <span>User ID: {user.id}</span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="table-secondary-text">
                        {user.email}
                      </span>
                    </td>


                    <td>
                      {user.organizationUnits?.length > 0 ? (
                        <span className="manager-badge">
                          {user.organizationUnits[0].name}
                        </span>
                      ) : (
                        <span className="table-secondary-text">
                          No unit
                        </span>
                      )}
                    </td>


                    <td>
                      {user.manager_id ? (
                        <span className="manager-badge">
                          {users.find((manager) => manager.id === user.manager_id)?.name ||
                            `User ${user.manager_id}`}
                        </span>
                      ) : (
                        <span className="table-secondary-text">
                          No manager
                        </span>
                      )}
                    </td>


                    <td>
                      <div className="role-control">
                        <select
                          className="role-select"
                          value={user.roleAssignments?.[0]?.role_id || ''}
                          onChange={(e) => {
                            const selectedRoleId = e.target.value
                              ? Number(e.target.value)
                              : 0

                            handleRoleChange(user.id, selectedRoleId)
                          }}
                        >
                          <option value="">No role</option>

                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>


                    <td>
                      <span className="active-status">
                        <span></span>
                        Active
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  )
}

export default Users