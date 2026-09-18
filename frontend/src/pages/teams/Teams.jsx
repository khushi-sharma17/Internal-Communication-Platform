import { useState } from 'react'

import './Teams.css'

import TeamList from './TeamList'
import TeamDetails from './TeamDetails'
import TeamMembers from './TeamMembers'
import ChannelList from './ChannelList'
import ChannelDetails from './ChannelDetails'

function Teams({ onTeamSelected }) {
  const [section, setSection] = useState('teams')
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [deletedTeamId, setDeletedTeamId] = useState(null)
  const [channelRefreshKey, setChannelRefreshKey] = useState(0)
  const [deletedChannelId, setDeletedChannelId] = useState(null)

  const handleTeamSelected = (team) => {
    setSelectedTeam(team)
    onTeamSelected?.(team)
  }

  return (
    <div className="teams-page">

      {/* PAGE HEADER */}
      <div className="teams-page-header">
        <div>
          <h2>Teams & Channels</h2>
          <p>
            Manage teams, channels, members and communication spaces.
          </p>
        </div>
      </div>


      {/* TABS */}
      <div className="teams-tabs">

        <button
          className={section === 'teams' ? 'active' : ''}
          onClick={() => setSection('teams')}
        >
          Teams
        </button>

        <button
          className={section === 'channels' ? 'active' : ''}
          onClick={() => setSection('channels')}
        >
          Channels
        </button>

        <button
          className={section === 'members' ? 'active' : ''}
          onClick={() => setSection('members')}
        >
          Team Members
        </button>

      </div>


      {/* CONTENT */}
      <div className="teams-page-content">

        {section === 'teams' && (
          <TeamList
            selectedTeam={selectedTeam}
            setSelectedTeam={handleTeamSelected}
            deletedTeamId={deletedTeamId}
          />
        )}

        {section === 'channels' && (
          <ChannelList
            selectedTeam={selectedTeam}
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
            channelRefreshKey={channelRefreshKey}
            deletedChannelId={deletedChannelId}
          />
        )}

        {section === 'members' && (
          <TeamMembers
            selectedTeam={selectedTeam}
          />
        )}

      </div>


      {/* TEAM DETAILS */}
      {selectedTeam && section === 'teams' && (
        <TeamDetails
          team={selectedTeam}
          onManageMembers={() => setSection('members')}
          onTeamUpdated={(updatedTeam) => {
            setSelectedTeam(updatedTeam)
            onTeamSelected?.(updatedTeam)
          }}
          onTeamDeleted={(deletedTeamId) => {
            setDeletedTeamId(deletedTeamId)
            setSelectedTeam(null)
            onTeamSelected?.(null)
          }}
        />
      )}


      {/* CHANNEL DETAILS */}
      {selectedChannel && section === 'channels' && (
        <ChannelDetails
          channel={selectedChannel}
          onChannelUpdated={(updatedChannel) => {
            setSelectedChannel(updatedChannel)
            setChannelRefreshKey((current) => current + 1)
          }}
          onChannelDeleted={(deletedId) => {
            setDeletedChannelId(deletedId)
            setSelectedChannel(null)
          }}
        />
      )}

    </div>
  )
}

export default Teams