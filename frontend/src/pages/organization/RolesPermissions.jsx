import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/api'

function RolesPermissions({ initialSelectedRole }) {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateRole, setShowCreateRole] = useState(false)
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [editingRole, setEditingRole] = useState(null)

  const [selectedRole, setSelectedRole] = useState(
    initialSelectedRole || null
  )

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      setError('Role name is required.')
      return
    }

    try {
      setError('')

      const response = await apiFetch('/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: roleName.trim(),
          description: roleDescription.trim(),
          permission_ids: selectedPermissions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Role creation failed:', errorData)
        throw new Error(`Failed to create role (${response.status})`)
      }

      await response.json()

      setRoleName('')
      setRoleDescription('')
      setSelectedPermissions([])
      setShowCreateRole(false)

      await fetchData()
    } catch (error) {
      console.error('Error creating role:', error)
      setError(error.message)
    }
  }




  const handleUpdateRole = async () => {
    if (!editingRole) {
      return
    }

    if (!roleName.trim()) {
      setError('Role name is required.')
      return
    }

    try {
      setError('')

      const response = await apiFetch(`/roles/${editingRole.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: roleName.trim(),
          description: roleDescription.trim(),
          created_at: editingRole.created_at,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Role update failed:', errorData)
        throw new Error(`Failed to update role (${response.status})`)
      }

      await handleUpdateRolePermissions(editingRole.id)

      setRoleName('')
      setRoleDescription('')
      setSelectedPermissions([])
      setEditingRole(null)
      setShowCreateRole(false)

      await fetchData()
    } catch (error) {
      console.error('Error updating role:', error)
      setError(error.message)
    }
  }





  const handleUpdateRolePermissions = async (roleId) => {
    try {
      setError('')

      const currentRole = roles.find((role) => role.id === roleId)

      if (!currentRole) {
        return
      }

      const currentPermissionIds =
        currentRole.permissions?.map((permission) => permission.id) || []

      const permissionsToAdd = selectedPermissions.filter(
        (permissionId) => !currentPermissionIds.includes(permissionId)
      )

      const permissionsToRemove = currentPermissionIds.filter(
        (permissionId) => !selectedPermissions.includes(permissionId)
      )

      for (const permissionId of permissionsToAdd) {
        const response = await apiFetch('/role-permissions', {
          method: 'POST',
          body: JSON.stringify({
            role_id: roleId,
            permission_id: permissionId,
            created_at: Math.floor(Date.now() / 1000),
          }),
        })

        if (!response.ok) {
          throw new Error(
            `Failed to add permission (${response.status})`
          )
        }
      }

      for (const permissionId of permissionsToRemove) {

        const rolePermissionsResponse = await apiFetch(
          `/role-permissions?role_id=${roleId}`
        )

        if (!rolePermissionsResponse.ok) {
          throw new Error('Failed to fetch role permissions')
        }

        const rolePermissions =
          await rolePermissionsResponse.json()

        const assignment = rolePermissions.find(
          (item) => item.permission_id === permissionId
        )

        if (assignment) {
          const response = await apiFetch(
            `/role-permissions/${assignment.id}`,
            {
              method: 'DELETE',
            }
          )

          if (!response.ok) {
            throw new Error(
              `Failed to remove permission (${response.status})`
            )
          }
        }
      }

      await fetchData()
    } catch (error) {
      console.error('Error updating role permissions:', error)
      setError(error.message)
    }
  }




  const handleDeleteRole = async (roleId) => {
    const role = roles.find((item) => item.id === roleId)

    if (!role) {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the role "${role.name}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      const response = await apiFetch(`/roles/${roleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Role deletion failed:', errorData)
        throw new Error(`Failed to delete role (${response.status})`)
      }

      await fetchData()
    } catch (error) {
      console.error('Error deleting role:', error)
      setError(error.message)
    }
  }




  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')


      const [rolesResponse, permissionsResponse] = await Promise.all([
        apiFetch('/roles'),
        apiFetch('/permissions'),
      ])

      if (!rolesResponse.ok) {
        if (rolesResponse.status === 403) {
          throw new Error(
            'You are not authorized to access this section.'
          )
        }

        throw new Error(
          `Failed to load roles (${rolesResponse.status})`
        )
      }

      if (!permissionsResponse.ok) {
        if (permissionsResponse.status === 403) {
          throw new Error(
            'You are not authorized to access this section.'
          )
        }

        throw new Error(
          `Failed to load permissions (${permissionsResponse.status})`
        )
      }
      

      const rolesData = await rolesResponse.json()
      const permissionsData = await permissionsResponse.json()

      setRoles(rolesData)
      setPermissions(permissionsData)
    } catch (error) {
      console.error('Error fetching roles and permissions:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="organization-section">

      <div className="section-heading">
        <div>
          <h3>Roles & Permissions</h3>
          <p>
            View organizational roles and the permissions available in the
            system.
          </p>
        </div>

        <button className="secondary-button" onClick={fetchData}>
          Refresh
        </button>
      </div>

      {!loading && !error && (
        <div className="organization-stats">

          <div className="organization-stat-card">
            <div className="stat-icon users-icon">
              R
            </div>

            <div>
              <span>Total Roles</span>
              <strong>{roles.length}</strong>
            </div>
          </div>

          <div className="organization-stat-card">
            <div className="stat-icon active-icon">
              ✓
            </div>

            <div>
              <span>Total Permissions</span>
              <strong>{permissions.length}</strong>
            </div>
          </div>

          <div className="organization-stat-card">
            <div className="stat-icon manager-icon">
              🔐
            </div>

            <div>
              <span>Access Control</span>
              <strong>RBAC</strong>
            </div>
          </div>

        </div>
      )}

      {loading && (
        <div className="organization-loading">
          Loading roles and permissions...
        </div>
      )}

      {error && (
        <div className="organization-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="roles-permissions-grid">

          {/* Roles */}
          <div className="organization-panel">

            <div className="panel-header">
              <div>
                <h4>Roles</h4>
                <span>
                  {roles.length} role
                  {roles.length !== 1 ? 's' : ''}
                </span>
              </div>

              <button
                className="secondary-button"
                onClick={() => setShowCreateRole(true)}
              >
                + Create Role
              </button>
            </div>



            {showCreateRole && (
              <div className="role-create-form">

                <h5>{editingRole ? 'Edit Role' : 'Create Custom Role'}</h5>

                <input
                  type="text"
                  placeholder="Role name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />

                <textarea
                  placeholder="Role description"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                />


                <div className="role-permissions-select">
                  <strong>Permissions</strong>

                  {permissions.map((permission) => (
                    <label key={permission.id}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissions([
                              ...selectedPermissions,
                              permission.id,
                            ])
                          } else {
                            setSelectedPermissions(
                              selectedPermissions.filter(
                                (id) => id !== permission.id
                              )
                            )
                          }
                        }}
                      />

                      <span>
                        {permission.name}
                      </span>
                    </label>
                  ))}
                </div>


                <div className="role-form-actions">
                  <button
                    className="secondary-button"
                    onClick={() => setShowCreateRole(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="primary-button"
                    onClick={editingRole ? handleUpdateRole : handleCreateRole}
                  >
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </button>
                </div>

              </div>
            )}
                        


            {roles.length === 0 ? (
              <div className="panel-empty">
                No roles found.
              </div>
            ) : (
              <div className="role-list">

                {roles.map((role) => (
                  <div
                    className={`role-card ${
                      selectedRole?.id === role.id ? 'selected-role' : ''
                    }`}
                    key={role.id}
                  >

                    <div className="role-icon">
                      {role.name?.charAt(0)?.toUpperCase() || 'R'}
                    </div>

                    <div className="role-details">
                      <strong>{role.name}</strong>

                      <span>
                        {role.description ||
                          'No description available'}
                      </span>

                      <small>
                        Role ID: {role.id}
                      </small>

                      <div className="role-permissions">
                        <span>Permissions:</span>

                        {role.permissions?.length > 0 ? (
                          <div className="permission-badges">
                            {role.permissions.map((permission) => (
                              <span
                                className="permission-badge"
                                key={permission.id}
                              >
                                {permission.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="no-permissions">
                            No permissions assigned
                          </span>
                        )}
                      </div>

                    </div>


                    <button
                      className="secondary-button role-edit-button"
                      onClick={() => {
                        setEditingRole(role)
                        setRoleName(role.name || '')
                        setRoleDescription(role.description || '')
                        setSelectedPermissions(
                          role.permissions?.map((permission) => permission.id) || []
                        )
                        setShowCreateRole(true)
                      }}
                    >
                      Edit
                    </button>


                    {role.id !== 2 && (
                      <button
                        className="secondary-button role-delete-button"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        Delete
                      </button>
                    )}

                  </div>
                ))}

              </div>
            )}

          </div>

          {/* Permissions */}
          <div className="organization-panel">

            <div className="panel-header">
              <div>
                <h4>Permissions</h4>

                <span>
                  {permissions.length} permission
                  {permissions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {permissions.length === 0 ? (
              <div className="panel-empty">
                No permissions found.
              </div>
            ) : (
              <div className="permission-list">

                {permissions.map((permission) => (
                  <div
                    className="permission-card"
                    key={permission.id}
                  >

                    <div className="permission-row">

                      <div className="permission-icon">
                        ✓
                      </div>

                      <div>
                        <div className="permission-name">
                          {permission.name}
                        </div>

                        <div className="permission-description">
                          {permission.description ||
                            'No description available'}
                        </div>
                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  )
}

export default RolesPermissions