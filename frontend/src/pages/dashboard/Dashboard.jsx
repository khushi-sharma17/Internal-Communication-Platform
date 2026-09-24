import { useEffect, useState } from 'react'
import './Dashboard.css'
import { apiFetch } from '../../api/api'

function Dashboard({
  onTaskSelected,
  onTeamSelected,
  onMeetingSelected,
  onUserSelected,
  onRoleSelected,
}) {
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeTasks, setActiveTasks] = useState(0)
  const [totalTeams, setTotalTeams] = useState(0)
  const [upcomingMeetings, setUpcomingMeetings] = useState(0)
  const [recentActivity, setRecentActivity] = useState([])
  const [teamMembers, setTeamMembers] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [teams, setTeams] = useState([])
  const [meetings, setMeetings] = useState([])


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch users
        const usersResponse = await apiFetch('/users')
        const usersData = await usersResponse.json()

        if (usersResponse.ok && Array.isArray(usersData)) {
          setTotalUsers(usersData.length)
          setUsers(usersData)
        }

        // Fetch tasks
        const tasksResponse = await apiFetch('/tasks')
        const tasksData = await tasksResponse.json()

        if (tasksResponse.ok && Array.isArray(tasksData)) {
          setTasks(tasksData)

          const active = tasksData.filter(
            (task) => task.status !== 'completed'
          )

          setActiveTasks(active.length)
        }

        // Fetch teams
        const teamsResponse = await apiFetch('/teams')
        const teamsData = await teamsResponse.json()

        if (teamsResponse.ok && Array.isArray(teamsData)) {
          setTotalTeams(teamsData.length)
          setTeams(teamsData)
        }


        // Fetch team members
        if (teamsResponse.ok && Array.isArray(teamsData)) {
            const membersByTeam = {}

            for (const team of teamsData) {
                const membersResponse = await apiFetch(
                    `/teams/${team.id}/members`
                )

                const membersData = await membersResponse.json()

                if (membersResponse.ok && Array.isArray(membersData)) {
                    membersByTeam[team.id] = membersData
                }
            }

            setTeamMembers(membersByTeam)
        }


        // Fetch roles
        const rolesResponse = await apiFetch('/roles')
        const rolesData = await rolesResponse.json()

        if (rolesResponse.ok && Array.isArray(rolesData)) {
          setRoles(rolesData)
        }

        // Fetch upcoming meetings
        const meetingsResponse = await apiFetch('/meetings')
        const meetingsData = await meetingsResponse.json()

        if (meetingsResponse.ok && Array.isArray(meetingsData)) {
            setMeetings(meetingsData)

            const now = Math.floor(Date.now() / 1000)
            const upcoming = meetingsData.filter(
                (meeting) => meeting.start_time > now
            )
            setUpcomingMeetings(upcoming.length)
        }

        // Fetch recent audit activity
        const auditResponse = await apiFetch('/audit-logs')
        const auditData = await auditResponse.json()

        if (auditResponse.ok && Array.isArray(auditData)) {
          setRecentActivity(
            [...auditData]
                .sort((a, b) => Number(b.id) - Number(a.id))
                .slice(0, 5)
            )
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [])

  const getActivityDescription = (activity, oldValue, newValue) => {

    if (activity.action === 'status_changed') {
        const task = tasks.find(
            (item) => Number(item.id) === Number(activity.object_id)
        )

        const user = users.find(
            (item) => Number(item.id) === Number(activity.actor_id)
        )

        return {
            title: `${user?.name || 'User'} changed task status`,
            detail: `${task?.title || 'Task'}: ${
            oldValue?.status || 'Unknown'
            } → ${newValue?.status || 'Unknown'}`,
        }
    }



    if (activity.action === 'role_changed') {
        const user = users.find(
            (item) => Number(item.id) === Number(activity.actor_id)
        )

        const oldRole = roles.find(
            (role) => Number(role.id) === Number(oldValue?.role_id)
        )

        const newRole = roles.find(
            (role) => Number(role.id) === Number(newValue?.role_id)
        )

        return {
            title: `${user?.name || 'User'} changed a user's role`,
            detail: `${oldRole?.name || 'Unknown role'} → ${
            newRole?.name || 'Unknown role'
            }`,
        }
    }




    if (activity.object_type === 'meeting') {
        const user = users.find(
            (item) => Number(item.id) === Number(activity.actor_id)
        )

        return {
            title: `${user?.name || 'User'} ${activity.action} a meeting`,
            detail: newValue?.title || 'Meeting',
        }
    }

    

    if (activity.object_type === 'team_membership') {
        const actor = users.find(
            (item) => Number(item.id) === Number(activity.actor_id)
        )

        const member = users.find(
            (item) => Number(item.id) === Number(newValue?.user_id)
        )

        const team = teams.find(
            (item) => Number(item.id) === Number(newValue?.team_id)
        )

        return {
            title: `${actor?.name || 'User'} updated team membership`,
            detail: `${member?.name || 'User'} — ${
            team?.name || 'Team'
            }`,
        }
    }

    return {
        title: `${activity.action
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
        detail: `${activity.object_type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
    }
  }



    const filteredTasks = tasks.filter((task) =>
        `${task.title || ''} ${task.status || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )

    const filteredUsers = users.filter((user) =>
    `${user.name || ''} ${user.email || ''} ${
        Array.isArray(user.roles)
        ? user.roles.map((role) => role.name).join(' ')
        : ''
    }`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )



    const filteredMeetings = meetings.filter((meeting) =>
    `${meeting.title || ''} ${meeting.agenda || ''} ${
        meeting.location || ''
    }`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )



    const filteredTeams = teams.filter((team) =>
    `${team.name || ''} ${team.visibility || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )



    const filteredRoles = roles.filter((role) =>
    `${role.name || ''} ${role.description || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )


    const filteredActivity = recentActivity.filter((activity) =>
    `${activity.action || ''} ${activity.object_type || ''} ${
        activity.object_id || ''
    }`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )



  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of your organization's activity and performance.
          </p>

          <div className="dashboard-search">
            <input
                type="text"
                placeholder="Search users, tasks, meetings, teams, or roles..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
            />
           </div>
        </div>
      </div>



      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
            <small>Registered users</small>
        </div>

        <div className="dashboard-stat-card">
            <span>Active Tasks</span>
            <strong>{activeTasks}</strong>
            <small>Tasks not completed</small>
        </div>

        <div className="dashboard-stat-card">
            <span>Upcoming Meetings</span>
            <strong>{upcomingMeetings}</strong>
            <small>Scheduled meetings</small>
        </div>

        <div className="dashboard-stat-card">
            <span>Teams</span>
            <strong>{totalTeams}</strong>
            <small>Active teams</small>
        </div>

        <div className="dashboard-stat-card">
            <span>Team Members</span>
            <strong>
                {Object.values(teamMembers)
                .flat()
                .filter((member) => member.status === 'active').length}
            </strong>
            <small>Active memberships</small>
        </div>
    </div>



    {searchTerm.trim() && (
    <div className="dashboard-search-results">
        <h3>Search Results</h3>

        <div className="search-result-section">
            <strong>Users</strong>

            {filteredUsers.length === 0 ? (
                <p>No users found.</p>
            ) : (
                filteredUsers.map((user) => (
                <div
                className="search-result-item search-result-clickable"
                key={`user-${user.id}`}
                onClick={() => onUserSelected(user)}
                >
                    <span>{user.name}</span>
                    <small>{user.email}</small>
                </div>
                ))
            )}
        </div>

        <div className="search-result-section">
            <strong>Tasks</strong>

            {filteredTasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                filteredTasks.map((task) => (
                <div
                    className="search-result-item search-result-clickable"
                    key={`task-${task.id}`}
                    onClick={() => onTaskSelected(task)}
                >
                    <span>{task.title}</span>
                    <small>{task.status}</small>
                </div>
                ))
            )}
        </div>


        <div className="search-result-section">
            <strong>Meetings</strong>
            {filteredMeetings.length === 0 ? (
                <p>No meetings found.</p>
            ) : (
                filteredMeetings.map((meeting) => (
                <div
                    className="search-result-item search-result-clickable"
                    key={`meeting-${meeting.id}`}
                    onClick={() => onMeetingSelected(meeting)}
                    >
                    <span>{meeting.title}</span>
                    <small>
                        {meeting.location || meeting.agenda || 'Meeting'}
                    </small>
                </div>
                ))
            )}
        </div>



        <div className="search-result-section">
            <strong>Teams</strong>
            {filteredTeams.length === 0 ? (
                <p>No teams found.</p>
            ) : (
                filteredTeams.map((team) => (
                <div
                className="search-result-item search-result-clickable"
                key={`team-${team.id}`}
                onClick={() => onTeamSelected(team)}
                >
                    <span>{team.name}</span>
                    <small>{team.visibility || 'Team'}</small>
                </div>
                ))
            )}
        </div>



        <div className="search-result-section">
            <strong>Roles</strong>
            {filteredRoles.length === 0 ? (
                <p>No roles found.</p>
            ) : (
                filteredRoles.map((role) => (
                <div
                className="search-result-item search-result-clickable"
                key={`role-${role.id}`}
                onClick={() => onRoleSelected(role)}
                >
                    <span>{role.name}</span>
                    <small>{role.description || 'Role'}</small>
                </div>
                ))
            )}
        </div>


        <div className="search-result-section">
            <strong>Activity</strong>
            {filteredActivity.length === 0 ? (
                <p>No activity found.</p>
            ) : (
                filteredActivity.map((activity) => (
                <div
                className="search-result-item search-result-clickable"
                key={`activity-${activity.id}`}
                onClick={() => {
                    document
                    .getElementById(`activity-${activity.id}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                >
                    <span>
                    {activity.action
                        ?.replace(/_/g, ' ')
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </span>
                    <small>
                    {activity.object_type
                        ?.replace(/_/g, ' ')
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </small>
                </div>
                ))
            )}
        </div>

    </div>
    )}



      <div className="dashboard-content">
        <div className="dashboard-panel">
            <h3>Activity Overview</h3>

            <div className="activity-overview">
                <div className="activity-row">
                    <span>To Do</span>
                    <strong>
                        {filteredTasks.filter((task) => task.status === 'todo').length}
                    </strong>
                </div>

                <div className="activity-row">
                    <span>In Progress</span>
                    <strong>
                        {filteredTasks.filter((task) => task.status === 'in progress').length}
                    </strong>
                </div>

                <div className="activity-row">
                    <span>Blocked</span>
                    <strong>
                        {filteredTasks.filter((task) => task.status === 'blocked').length}
                    </strong>
                </div>

                <div className="activity-row">
                    <span>Review</span>
                    <strong>
                        {filteredTasks.filter((task) => task.status === 'review').length}
                    </strong>
                </div>

                <div className="activity-row">
                    <span>Completed</span>
                    <strong>
                        {filteredTasks.filter((task) => task.status === 'completed').length}
                    </strong>
                </div>



                <div className="activity-completion">
                    <div className="activity-completion-header">
                        <span>Task Completion</span>
                        <strong>
                        {filteredTasks.length > 0
                            ? Math.round(
                                (filteredTasks.filter((task) => task.status === 'completed').length /
                                filteredTasks.length) *
                                100
                            )
                            : 0}
                        %
                        </strong>
                    </div>

                    <div className="activity-progress">
                        <div
                        className="activity-progress-bar"
                        style={{
                            width: `${
                            filteredTasks.length > 0
                                ? Math.round(
                                    (filteredTasks.filter(
                                    (task) => task.status === 'completed'
                                    ).length /
                                    filteredTasks.length) *
                                    100
                                )
                                : 0
                            }%`,
                        }}
                        />
                    </div>
                </div>
            </div>
        </div>

        
        <div className="dashboard-panel">
            <h3>Role Distribution</h3>

            <div className="role-distribution">
                {roles.length === 0 ? (
                    <p>No roles available.</p>
                ) : (
                    roles.map((role) => {
                    const userCount = users.filter(
                        (user) =>
                        Array.isArray(user.roles) &&
                        user.roles.some(
                            (userRole) =>
                            Number(userRole.id) === Number(role.id)
                        )
                    ).length

                    return (
                        <div className="role-row" key={role.id}>
                        <span>{role.name}</span>
                        <strong>{userCount}</strong>
                        </div>
                    )
                    })
                )}
            </div>
        </div>


        
        <div className="dashboard-panel">
            <h3>Team Overview</h3>

            <div className="team-overview">
                {teams.length === 0 ? (
                <p>No teams available.</p>
                ) : (
                teams.map((team) => {
                    const members = teamMembers[team.id] || []

                    const activeMembers = members.filter(
                    (member) => member.status === 'active'
                    ).length

                    return (
                    <div className="team-row" key={team.id}>
                        <div className="team-row-info">
                        <strong>{team.name}</strong>
                        <span>{team.visibility} team</span>
                        </div>

                        <div className="team-row-count">
                        <strong>{activeMembers}</strong>
                        <span>members</span>
                        </div>
                    </div>
                    )
                })
                )}
            </div>
        </div>



        <div className="dashboard-panel dashboard-panel-full">
          <h3>Recent Activity</h3>

          {recentActivity.length === 0 ? (
            <p>No recent activity.</p>
          ) : (
            <div className="recent-activity-list">
              {recentActivity.map((activity) => {
                let oldValue = null
                let newValue = null

                try {
                  oldValue = activity.old_value_json
                    ? JSON.parse(activity.old_value_json)
                    : null

                  newValue = activity.new_value_json
                    ? JSON.parse(activity.new_value_json)
                    : null
                } catch (error) {
                  console.error(
                    'Failed to parse audit activity:',
                    error
                  )
                }

                const activityInfo = getActivityDescription(
                  activity,
                  oldValue,
                  newValue
                )

                return (
                  <div
                    className="recent-activity-item"
                    id={`activity-${activity.id}`}
                    key={activity.id}
                >
                    <div className="recent-activity-main">
                      <strong>{activityInfo.title}</strong>

                      {activityInfo.detail && (
                        <span>{activityInfo.detail}</span>
                      )}
                    </div>

                    <time>
                      {new Date(
                        activity.created_at * 1000
                      ).toLocaleString()}
                    </time>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard