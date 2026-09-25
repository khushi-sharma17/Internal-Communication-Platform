import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/api'

function ChannelList({
  hasPermission,
  selectedTeam,
  selectedChannel,
  setSelectedChannel,
  channelRefreshKey,
  deletedChannelId,
}) {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')
  const [channelType, setChannelType] = useState('team')
  const [channelVisibility, setChannelVisibility] = useState('private')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const fetchChannels = async () => {
    if (!selectedTeam) {
      setChannels([])
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await apiFetch(
        `/teams/${selectedTeam.id}/channels`
      )

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            'You are not authorized to access this section.'
          )
        }

        throw new Error(
          `Failed to load channels (${response.status})`
        )
      }

      const data = await response.json()

      setChannels(data)

      if (data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0])
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }




  const handleCreateChannel = async (event) => {
    event.preventDefault()

    setCreateError('')
    setCreateSuccess('')

    if (!channelName.trim()) {
      setCreateError('Channel name is required.')
      return
    }

    try {
      setCreating(true)

      const response = await apiFetch(
        '/channels',
        {
          method: 'POST',
          body: JSON.stringify({
            team_id: selectedTeam.id,
            name: channelName.trim(),
            description: channelDescription.trim(),
            type: channelType,
            visibility: channelVisibility,
            created_at: Math.floor(Date.now() / 1000),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.errors?.name?.[0] ||
          `Failed to create channel (${response.status})`
        )
      }

      setChannels((currentChannels) => [
        ...currentChannels,
        data,
      ])

      setSelectedChannel(data)

      setChannelName('')
      setChannelDescription('')
      setChannelType('team')
      setChannelVisibility('private')

      setCreateSuccess('Channel created successfully.')
      setShowCreateForm(false)

    } catch (error) {
      console.error('Error creating channel:', error)
      setCreateError(error.message)
    } finally {
      setCreating(false)
    }
  }



  useEffect(() => {
    fetchChannels()
  }, [selectedTeam, channelRefreshKey])



  useEffect(() => {
    if (!deletedChannelId) {
      return
    }

    setChannels((currentChannels) =>
      currentChannels.filter(
        (channel) => channel.id !== deletedChannelId
      )
    )
  }, [deletedChannelId])



  if (!selectedTeam) {
    return (
      <div className="team-empty">
        Select a team first to view its channels.
      </div>
    )
  }

  return (
    <div className="teams-section">

      {/* HEADER */}
      <div className="teams-section-header">

        <div>
          <h3>Channels</h3>

          <p>
            Channels available in {selectedTeam.name}.
          </p>
        </div>

        <div>
          {hasPermission('manage_channels') && (
            <button
              className="team-primary-button"
              onClick={() => {
                setShowCreateForm(true)
                setCreateError('')
                setCreateSuccess('')
              }}
            >
              + Create Channel
            </button>
          )}

          <button
            className="team-secondary-button"
            onClick={fetchChannels}
            style={{ marginLeft: '8px' }}
          >
            Refresh
          </button>
        </div>

      </div>



      {/* CREATE CHANNEL FORM */}
      {showCreateForm && hasPermission('manage_channels') && (
        <div className="teams-list-card team-edit-form">

          <div className="teams-list-header">
            <div>
              <h4>Create New Channel</h4>
              <span>
                Add a new channel to {selectedTeam.name}.
              </span>
            </div>
          </div>

          {createError && (
            <div className="team-error">
              {createError}
            </div>
          )}

          <form onSubmit={handleCreateChannel}>

            <div className="team-form-field">
              <label>Channel Name</label>

              <input
                type="text"
                value={channelName}
                onChange={(event) =>
                  setChannelName(event.target.value)
                }
                placeholder="Enter channel name"
              />
            </div>

            <div className="team-form-field">
              <label>Description</label>

              <textarea
                value={channelDescription}
                onChange={(event) =>
                  setChannelDescription(event.target.value)
                }
                placeholder="Enter channel description"
                rows="4"
              />
            </div>

            <div className="team-form-field">
              <label>Channel Type</label>

              <select
                value={channelType}
                onChange={(event) =>
                  setChannelType(event.target.value)
                }
              >
                <option value="team">Team</option>
                <option value="task">Task</option>
                <option value="announcement">Announcement</option>
                <option value="one_to_one">One-to-One</option>
              </select>
            </div>

            <div className="team-form-field">
              <label>Visibility</label>

              <select
                value={channelVisibility}
                onChange={(event) =>
                  setChannelVisibility(event.target.value)
                }
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="team-primary-button"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Channel'}
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



      {/* STATS */}
      {!loading && !error && (
        <div className="team-stats">

          <div className="team-stat-card">

            <div className="team-stat-icon team-icon">
              #
            </div>

            <div>
              <span>Total Channels</span>
              <strong>{channels.length}</strong>
            </div>

          </div>

          <div className="team-stat-card">

            <div className="team-stat-icon active-team-icon">
              ✓
            </div>

            <div>
              <span>Active Channels</span>
              <strong>{channels.length}</strong>
            </div>

          </div>

          <div className="team-stat-card">

            <div className="team-stat-icon member-team-icon">
              T
            </div>

            <div>
              <span>Team</span>
              <strong>{selectedTeam.name}</strong>
            </div>

          </div>

        </div>
      )}


      {/* CHANNEL LIST */}
      <div className="teams-list-card">

        <div className="teams-list-header">

          <div>
            <h4>{selectedTeam.name} Channels</h4>

            <span>
              {channels.length} channel
              {channels.length !== 1 ? 's' : ''} found
            </span>
          </div>

        </div>


        {/* LOADING */}
        {loading && (
          <div className="team-loading">
            Loading channels...
          </div>
        )}


        {/* ERROR */}
        {error && (
          <div className="team-error">
            {error}
          </div>
        )}


        {/* EMPTY */}
        {!loading && !error && channels.length === 0 && (
          <div className="team-empty">
            No channels found for this team.
          </div>
        )}


        {/* CHANNELS */}
        {!loading && !error && channels.length > 0 && (
          <div className="channel-list">

            {channels.map((channel) => (
              <button
                key={channel.id}
                className={`channel-list-item ${
                  selectedChannel?.id === channel.id
                    ? 'selected'
                    : ''
                }`}
                onClick={() => setSelectedChannel(channel)}
              >

                <div className="channel-icon">
                  #
                </div>

                <div className="channel-list-info">

                  <strong>
                    {channel.name}
                  </strong>

                  <span>
                    Channel ID: {channel.id}
                  </span>

                </div>

                <div className="channel-arrow">
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

export default ChannelList