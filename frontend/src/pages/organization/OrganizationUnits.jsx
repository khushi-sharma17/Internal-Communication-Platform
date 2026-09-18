import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/api'

function OrganizationUnits() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [unitName, setUnitName] = useState('')
  const [unitType, setUnitType] = useState('department')
  const [parentId, setParentId] = useState('')
  const [editingUnit, setEditingUnit] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [users, setUsers] = useState([])

  const [managerId, setManagerId] = useState('')
  const [unitStatus, setUnitStatus] = useState('active')

  const fetchUnits = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await apiFetch('/organization-units')

      if (!response.ok) {
        throw new Error(
          `Failed to load organization units (${response.status})`
        )
      }

      const data = await response.json()
      setUnits(data)
    } catch (error) {
      console.error('Error fetching organization units:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }



  const fetchUsers = async () => {
    try {
      const response = await apiFetch('/users')

      if (!response.ok) {
        throw new Error(`Failed to fetch users (${response.status})`)
      }

      const data = await response.json()

      console.log('Users API response:', data)

      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }


  const createUnit = async (event) => {
    event.preventDefault()

    try {
      setCreating(true)
      setCreateError('')

      const response = await apiFetch('/organization-units', {
        method: 'POST',
        body: JSON.stringify({
          name: unitName.trim(),
          type: unitType,
          parent_id: parentId ? Number(parentId) : null,
          manager_id: managerId ? Number(managerId) : null,
          status: unitStatus,
          created_at: Math.floor(Date.now() / 1000),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.[0]?.message ||
          data?.message ||
          `Failed to create organization unit (${response.status})`
        )
      }

      setUnitName('')
      setUnitType('department')
      setParentId('')
      setShowCreateForm(false)
      setManagerId('')
      setUnitStatus('active')

      await fetchUnits()
    } catch (error) {
      console.error('Error creating organization unit:', error)
      setCreateError(error.message)
    } finally {
      setCreating(false)
    }
  }




  const updateUnit = async (event) => {
    event.preventDefault()

    if (!editingUnit) {
      return
    }

    try {
      setCreating(true)
      setCreateError('')

      const response = await apiFetch(`/organization-units/${editingUnit.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: unitName.trim(),
          type: unitType,
          parent_id: parentId ? Number(parentId) : null,
          manager_id: managerId ? Number(managerId) : null,
          status: unitStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.[0]?.message ||
          data?.message ||
          `Failed to update organization unit (${response.status})`
        )
      }

      // Clear edit mode
      setEditingUnit(null)
      setUnitName('')
      setUnitType('department')
      setParentId('')
      setManagerId('')
      setUnitStatus('active')
      setShowCreateForm(false)

      // Reload units from backend
      await fetchUnits()
    } catch (error) {
      console.error('Error updating organization unit:', error)
      setCreateError(error.message)
    } finally {
      setCreating(false)
    }
  }




  const deleteUnit = async (unit) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${unit.name}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await apiFetch(`/organization-units/${unit.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(
          data?.[0]?.message ||
          data?.message ||
          `Failed to delete organization unit (${response.status})`
        )
      }

      await fetchUnits()
    } catch (error) {
      console.error('Error deleting organization unit:', error)
      setCreateError(error.message)
    }
  }




  useEffect(() => {
    fetchUnits()
    fetchUsers()
  }, [])



  const departmentCount = units.filter(
    (unit) => unit.type === 'department'
  ).length

  const topLevelCount = units.filter(
    (unit) => !unit.parent_id
  ).length

  return (
    <div className="organization-section">

      <div className="section-heading">
        <div>
          <h3>Organization Units</h3>
          <p>
            View and manage the organizational structure and departments.
          </p>
        </div>

        <div>
          <button
            className="secondary-button"
            onClick={() => setShowCreateForm((value) => !value)}
          >
            {showCreateForm ? 'Cancel' : 'Create Unit'}
          </button>

          <button className="secondary-button" onClick={fetchUnits}>
            Refresh
          </button>
        </div>

      </div>


        {(showCreateForm || editingUnit) && (
          <form className="organization-create-form" onSubmit={editingUnit ? updateUnit : createUnit}>
            <div>
              <label>Unit Name</label>
              <input
                type="text"
                value={unitName}
                onChange={(event) => setUnitName(event.target.value)}
                placeholder="e.g. Frontend Development"
                required
              />
            </div>

            <div>
              <label>Unit Type</label>
              <input
                type="text"
                value={unitType}
                onChange={(event) => setUnitType(event.target.value)}
                placeholder="e.g. department"
                required
              />
            </div>

            <div>
              <label>Parent Unit</label>
              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
              >
                <option value="">No Parent — Top-level Unit</option>

                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            
            <div>
              <label>Manager</label>
              <select
                value={managerId}
                onChange={(event) => setManagerId(event.target.value)}
              >
                <option value="">No Manager</option>

                {users.length > 0 ? (
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No users available
                  </option>
                )}
              </select>
            </div>


            <div>
              <label>Status</label>
              <select
                value={unitStatus}
                onChange={(event) => setUnitStatus(event.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>


            {createError && (
              <div className="organization-error">
                {createError}
              </div>
            )}

            <button type="submit" disabled={creating}>
            {creating
              ? editingUnit
                ? 'Updating...'
                : 'Creating...'
              : editingUnit
                ? 'Update Unit'
                : 'Create Unit'}
          </button>

        </form>
      )}



      {!loading && !error && (
        <div className="organization-stats">

          <div className="organization-stat-card">
            <div className="stat-icon users-icon">
              ◫
            </div>

            <div>
              <span>Total Units</span>
              <strong>{units.length}</strong>
            </div>
          </div>

          <div className="organization-stat-card">
            <div className="stat-icon active-icon">
              ▦
            </div>

            <div>
              <span>Departments</span>
              <strong>{departmentCount}</strong>
            </div>
          </div>

          <div className="organization-stat-card">
            <div className="stat-icon manager-icon">
              ⌂
            </div>

            <div>
              <span>Top-Level Units</span>
              <strong>{topLevelCount}</strong>
            </div>
          </div>

        </div>
      )}

      <div className="organization-table-card">

        <div className="table-card-header">
          <div>
            <h4>Organizational Units</h4>

            <span>
              {units.length} unit{units.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {loading && (
          <div className="organization-loading">
            Loading organization units...
          </div>
        )}

        {error && (
          <div className="organization-error">
            {error}
          </div>
        )}

        {!loading && !error && units.length === 0 && (
          <div className="organization-empty">
            No organization units found.
          </div>
        )}

        {!loading && !error && units.length > 0 && (
          <div className="organization-table-wrapper">

            <table className="organization-table">

              <thead>
                <tr>
                  <th>UNIT</th>
                  <th>TYPE</th>
                  <th>PARENT UNIT</th>
                  <th>MANAGER</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                  <th>UPDATED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id}>

                    <td>
                      <div className="organization-user-cell">

                        <div className="organization-unit-icon">
                          {unit.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>

                        <div>
                          <strong>{unit.name}</strong>
                          <span>Unit ID: {unit.id}</span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="unit-type-badge">
                        {unit.type || 'General'}
                      </span>
                    </td>

                    <td>
                      {unit.parent_id ? (
                        <span className="manager-badge">
                          {units.find((parent) => parent.id === unit.parent_id)?.name ||
                            `Unit ${unit.parent_id}`}
                        </span>
                      ) : (
                        <span className="table-secondary-text">
                          Top-level unit
                        </span>
                      )}
                    </td>

                    

                    <td>
                      {unit.manager_id ? (
                        <span className="manager-badge">
                          {users.find((user) => user.id === unit.manager_id)?.name ||
                            `User ${unit.manager_id}`}
                        </span>
                      ) : (
                        <span className="table-secondary-text">
                          No manager
                        </span>
                      )}
                    </td>

                    <td>
                      <span className={`unit-status-badge ${unit.status || 'active'}`}>
                        {unit.status || 'active'}
                      </span>
                    </td>


                    <td>
                      <span className="table-secondary-text">
                        {unit.created_at
                          ? new Date(
                              unit.created_at * 1000
                            ).toLocaleDateString()
                          : '—'}
                      </span>
                    </td>


                    <td>
                      <span className="table-secondary-text">
                        {unit.updated_at
                          ? new Date(
                              unit.updated_at * 1000
                            ).toLocaleDateString()
                          : '—'}
                      </span>
                    </td>


                    <td>
                      <div className="organization-action-buttons">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUnit(unit)
                            setUnitName(unit.name)
                            setUnitType(unit.type)
                            setParentId(unit.parent_id ? String(unit.parent_id) : '')
                            setManagerId(unit.manager_id ? String(unit.manager_id) : '')
                            setUnitStatus(unit.status || 'active')
                          }}
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          onClick={() => deleteUnit(unit)}
                        >
                          Delete
                        </button>

                      </div>
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

export default OrganizationUnits