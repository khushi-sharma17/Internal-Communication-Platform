import { useState } from 'react'

import './Organization.css'

import Users from './Users'
import OrganizationUnits from './OrganizationUnits'
import RolesPermissions from './RolesPermissions'
import ReportingHierarchy from './ReportingHierarchy'

function Organization() {
  const [section, setSection] = useState('users')

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h2>Organization</h2>
          <p>Manage users, organization structure, roles and reporting hierarchy.</p>
        </div>
      </header>

      <div className="page-tabs">
        <button
          className={section === 'users' ? 'active' : ''}
          onClick={() => setSection('users')}
        >
          Users
        </button>

        <button
          className={section === 'units' ? 'active' : ''}
          onClick={() => setSection('units')}
        >
          Organization Units
        </button>

        <button
          className={section === 'roles' ? 'active' : ''}
          onClick={() => setSection('roles')}
        >
          Roles & Permissions
        </button>

        <button
          className={section === 'hierarchy' ? 'active' : ''}
          onClick={() => setSection('hierarchy')}
        >
          Reporting Hierarchy
        </button>
      </div>

      <div className="page-content">
        {section === 'users' && <Users />}
        {section === 'units' && <OrganizationUnits />}
        {section === 'roles' && <RolesPermissions />}
        {section === 'hierarchy' && <ReportingHierarchy />}
      </div>
    </div>
  )
}

export default Organization
