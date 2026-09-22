import { useEffect, useRef, useState } from 'react'
import './App.css'
import TaskChat from './pages/TaskChat'
import DirectChat from './pages/DirectChat'
import Organization from './pages/organization/Organization'
import Teams from './pages/teams/Teams'
import Tasks from './pages/tasks/Tasks'
import TaskDetail from './pages/tasks/TaskDetail'

function App() {
  const [currentPage, setCurrentPage] = useState('team')
  const [permissions, setPermissions] = useState([])

  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [notifications, setNotifications] = useState([])

  const unreadNotifications = notifications.filter(
    (notification) => Number(notification.is_read) === 0
  ).length

  const [users, setUsers] = useState([])
  const [showMentionPicker, setShowMentionPicker] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')

  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const [replyingTo, setReplyingTo] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [deletingMessage, setDeletingMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(true)

  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [channelsLoading, setChannelsLoading] = useState(true)

  const [activeConversationId, setActiveConversationId] = useState(null)

  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedDirectUser, setSelectedDirectUser] = useState(null)

  const [selectedTask, setSelectedTask] = useState(null)

  const messagesEndRef = useRef(null)


  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:8080/notification', {
        headers: {
          Authorization: 'Bearer user1-test-token-12345',
        },
      })

      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }


  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/users",
        {
          headers: {
            Authorization: "Bearer user1-test-token-12345",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };




  const fetchPermissions = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/permissions/mine',
        {
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch permissions')
      }

      const data = await response.json()

      const permissionNames = Array.isArray(data)
        ? data
            .map((permission) =>
              typeof permission === 'string'
                ? permission
                : permission.name
            )
            .filter(Boolean)
        : []

      setPermissions(permissionNames)

      console.log('PERMISSION DATA:', data)
      console.log('PERMISSION NAMES:', permissionNames)

      setPermissions(data)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions([])
    }
  }

  console.log('CURRENT PERMISSIONS STATE:', permissions)


  const hasPermission = (permission) => {
    const result = permissions.some(
      (item) => item.name === permission
    )

    console.log(
      'CHECK PERMISSION:',
      permission,
      'RESULT:',
      result
    )

    return result
  }



  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/notification/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Refresh notifications so the badge updates
      await fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }





  const fetchChannels = async () => {
    try {
      if (!selectedTeam) {
        setChannels([])
        setSelectedChannel(null)
        return
      }

      setChannelsLoading(true)

      const response = await fetch(
        `http://localhost:8080/teams/${selectedTeam.id}/channels`,
        {
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to load channels (${response.status})`
        )
      }

      const data = await response.json()

      setChannels(data)

      // Select the first channel of the selected team
      if (data.length > 0) {
        setSelectedChannel(data[0])
      } else {
        setSelectedChannel(null)
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
      setChannels([])
      setSelectedChannel(null)
    } finally {
      setChannelsLoading(false)
    }
  }




  const fetchMessages = async () => {
    try {
      if (!selectedChannel) {
        setMessages([])
        setIsLive(false)
        return
      }

      const conversationResponse = await fetch(
        `http://localhost:8080/conversations?channel_id=${selectedChannel.id}`,
        {
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      if (!conversationResponse.ok) {
        throw new Error(
          `Failed to fetch conversation (${conversationResponse.status})`
        )
      }

      const conversations = await conversationResponse.json()

      const conversation = conversations.find(
        (item) =>
          Number(item.channel_id) === Number(selectedChannel.id) &&
          item.type === 'team_chat'
      )


      console.log('Selected channel:', selectedChannel)
      console.log('Matching conversation:', conversation)

      setActiveConversationId(conversation.id)


      if (!conversation) {
        setMessages([])
        setActiveConversationId(null)
        setIsLive(false)
        setLoading(false)
        return
      }

      console.log('MESSAGE REQUEST CONVERSATION ID:', conversation.id)

      const response = await fetch(
        `http://localhost:8080/messages?conversation_id=${conversation.id}`,
        {
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch messages (${response.status})`
        )
      }

      const data = await response.json()

      setIsLive(true)

      data.forEach((msg) => {
        markMessageAsRead(msg.id)
      })

      setMessages((previousMessages) => {
        if (JSON.stringify(previousMessages) === JSON.stringify(data)) {
          return previousMessages
        }

        return data
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }


  const markMessageAsRead = async (messageId) => {
    try {
      await fetch('http://localhost:8080/message-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user1-test-token-12345',
        },
        body: JSON.stringify({
          message_id: messageId,
        }),
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }



  useEffect(() => {
    if (currentPage !== 'team') {
      return
    }

    fetchMessages()
    fetchNotifications()
    fetchUsers()
    fetchPermissions()

    const interval = setInterval(() => {
      fetchMessages()
      fetchNotifications()
    }, 3000)

    return () => clearInterval(interval)
  }, [currentPage, selectedChannel])



  useEffect(() => {
    fetchChannels()
  }, [selectedTeam])




  const handleEdit = async () => {
    if (!editingMessage || !message.trim()) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8080/messages/${editingMessage.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer user1-test-token-12345',
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to edit message')
      }

      await response.json()

      setMessage('')
      setEditingMessage(null)
      await fetchMessages()
    } catch (error) {
      console.error('Error editing message:', error)
    }
  }



  const handleDelete = async () => {
    console.log('DELETE BUTTON CLICKED', deletingMessage)

    // keep the rest of your existing code below
    if (!deletingMessage) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8080/messages/${deletingMessage.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      console.log('DELETE STATUS:', response.status)

      const result = await response.json()

      console.log('DELETE RESPONSE:', result)

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }


      setDeletingMessage(null)
      await fetchMessages()
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }



  const handleReaction = async (messageId, reaction) => {
    console.log('REACTION CLICKED:', messageId, reaction)
    try {
      const messageItem = messages.find(
        (item) => item.id === messageId
      )

      const existingReaction = messageItem?.reactions?.find(
        (item) =>
          item.user_id === 1 &&
          item.reaction === reaction
      )

      if (existingReaction) {
        const response = await fetch(
          `http://localhost:8080/message-reaction/${existingReaction.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: 'Bearer user1-test-token-12345',
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to remove reaction')
        }
      } else {
        const response = await fetch(
          'http://localhost:8080/message-reaction',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer user1-test-token-12345',
            },
            body: JSON.stringify({
              message_id: messageId,
              reaction: reaction,
            }),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to add reaction')
        }
      }

      await fetchMessages()
    } catch (error) {
      console.error('Error updating reaction:', error)
    }
  }




  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim()) {
      return
    }

    if (!activeConversationId) {
      console.error('No active conversation selected')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:8080/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer user1-test-token-12345',
          },
          body: JSON.stringify({
            conversation_id: activeConversationId,
            message: message,
            parent_message_id: replyingTo ? replyingTo.id : null,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const createdMessage = await response.json()

      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadResponse = await fetch(
          `http://localhost:8080/messages/${createdMessage.id}/upload-attachment`,
          {
            method: 'POST',
            headers: {
              Authorization: 'Bearer user1-test-token-12345',
            },
            body: formData,
          }
        )

        if (!uploadResponse.ok) {
          throw new Error('Message sent, but file upload failed')
        }

        setSelectedFile(null)
      }

      setMessage('')
      setReplyingTo(null)

      await fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.message)
    }
  }



  const handleFileUpload = async (messageId) => {
    if (!selectedFile) {
      return
    }

    setUploadingFile(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(
        `http://localhost:8080/messages/${messageId}/upload-attachment`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.message || 'Failed to upload attachment'
        )
      }

      setSelectedFile(null)

      await fetchMessages()
    } catch (error) {
      console.error('Error uploading attachment:', error)
      alert(error.message)
    } finally {
      setUploadingFile(false)
    }
  }




  const handleAttachmentDownload = async (attachmentId, fileName) => {
    try {
      const response = await fetch(
        `http://localhost:8080/messages/${attachmentId}/download-attachment`,
        {
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to download attachment')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading attachment:', error)
      alert(error.message)
    }
  }



  useEffect(() => {
    console.log('Selected channel:', selectedChannel)
  }, [selectedChannel])



  return (
    <div className="app-layout">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-header">
          <h1>Internal</h1>
          <span>Communication</span>
        </div>

        <nav className="sidebar-content">

          <div className="sidebar-section">

            <p className="section-title">WORKSPACE</p>

              {hasPermission('view_channels') && (
                <button
                  className={`sidebar-item ${
                    currentPage === 'team' ? 'active' : ''
                  }`}
                  onClick={() => setCurrentPage('team')}
                >
                  <span>💬</span>
                  Team Chat

                  {unreadNotifications > 0 && (
                    <span className="notification-badge">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              )}
              

            <button
              className={`sidebar-item ${
                currentPage === 'notifications' ? 'active' : ''
              }`}
              onClick={() => setCurrentPage('notifications')}
            >
              <span>🔔</span>
              Notifications

              {unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications}
                </span>
              )}
            </button>


            <button
              className={`sidebar-item ${
                currentPage === 'organization' ? 'active' : ''
              }`}
              onClick={() => setCurrentPage('organization')}
            >
              <span>🏢</span>
              Organization
            </button>

          </div>



          <div className="sidebar-section">
            <p className="section-title">TEAMS</p>

              {hasPermission('view_channels') && (
                <button
                  className={`sidebar-item ${
                    currentPage === 'teams' ? 'active' : ''
                  }`}
                  onClick={() => setCurrentPage('teams')}
                >
                  <span>👥</span>
                  Teams
                </button>
              )}

            {selectedTeam && (
              <div className="sidebar-selected-team">
                <span>▾</span>
                {selectedTeam.name}
              </div>
            )}
          </div>





          {selectedTeam && hasPermission('view_channels') && (
            <div className="sidebar-section">
              <p className="section-title">CHANNELS</p>

              {channelsLoading ? (
                <div className="sidebar-item">
                  Loading channels...
                </div>
              ) : channels.length === 0 ? (
                <div className="sidebar-item disabled">
                  No channels
                </div>
              ) : (
                channels.map((channel) => (
                  <button
                    key={channel.id}
                    className={`sidebar-item sidebar-channel ${
                      selectedChannel?.id === channel.id && currentPage === 'team'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedChannel(channel)
                      setCurrentPage('team')
                    }}
                  >
                    <span>#</span>
                    {channel.name}
                  </button>
                ))
              )}
            </div>
          )}


          {hasPermission('view_tasks') && (
  <div className="sidebar-section">
    <p className="section-title">TASKS</p>

    <button
      className={`sidebar-item ${
        currentPage === 'tasks' ? 'active' : ''
      }`}
      onClick={() => setCurrentPage('tasks')}
    >
      <span>✓</span>
      Tasks
    </button>
  </div>
)}



        {users.length > 0 && (
          <div className="sidebar-section">
            <p className="section-title">DIRECT MESSAGES</p>

            {users.length === 0 ? (
              <div className="sidebar-item disabled">
                No users
              </div>
            ) : (
              users
                .filter((user) => Number(user.id) !== 1)
                .map((user) => (
                  <button
                    key={user.id}
                    className={`sidebar-item ${
                      currentPage === 'direct' &&
                      selectedDirectUser?.id === user.id
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedDirectUser(user)
                      setCurrentPage('direct')
                    }}
                  >
                    <span>●</span>
                    {user.name || `User ${user.id}`}
                  </button>
                ))
            )}
          </div>
          )}

        </nav>


        <div className="sidebar-footer">
          <div className="user-avatar">U</div>

          <div>
            <strong>User 1</strong>
            <small>Online</small>
          </div>
        </div>

      </aside>




      {/* Main Content */}

      <main className="main-content">
            {currentPage === 'organization' ? (
              <Organization />
            ) : currentPage === 'teams' ? (
              <Teams
                onTeamSelected={setSelectedTeam}
                hasPermission={hasPermission}
              />
            ) : currentPage === 'tasks' ? (
              <Tasks
                onTaskSelected={(task) => {
                  setSelectedTask(task)
                  setCurrentPage('task-detail')
                }}
              />
            ) : currentPage === 'task-detail' ? (
              <TaskDetail
                  task={selectedTask}
                  onBack={() => setCurrentPage('tasks')}
                  onOpenChat={(task) => {
                      setSelectedTask(task)
                      setCurrentPage('task')
                  }}
              />
            ) : currentPage === 'task' ? (
              <TaskChat task={selectedTask} />
            ) : currentPage === 'direct' ? (
              <DirectChat selectedUser={selectedDirectUser} />
            ) : currentPage === 'notifications' ? (
              <div className="notifications-container">

                <header className="chat-header">
                  <div>
                    <h2>
                      <span>🔔</span> Notifications
                    </h2>

                    <p>
                      Stay updated with your messages and mentions
                    </p>
                  </div>
                </header>

                <div className="notifications-list">

                  {notifications.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-notification-icon">🔔</div>
                      <h3>No notifications</h3>
                      <p>You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const isUnread = Number(notification.is_read) === 0

                      return (
                        <div
                          key={notification.id}
                          className={`notification-item ${
                            isUnread ? 'unread' : 'read'
                          }`}
                        >

                          <div className="notification-icon">
                            {notification.type === 'mention'
                              ? '@'
                              : '💬'}
                          </div>

                          <div className="notification-content">

                            <div className="notification-title-row">
                              <strong>
                                {notification.type === 'mention'
                                  ? 'You were mentioned'
                                  : 'New message'}
                              </strong>

                              {isUnread && (
                                <span className="unread-dot"></span>
                              )}
                            </div>

                            <p>
                              {notification.content}
                            </p>

                            <small>
                              {notification.created_at
                                ? new Date(
                                    notification.created_at * 1000
                                  ).toLocaleString()
                                : ''}
                            </small>

                          </div>

                          {isUnread && (
                            <button
                              className="mark-read-button"
                              onClick={() =>
                                markNotificationAsRead(notification.id)
                              }
                            >
                              Mark as read
                            </button>
                          )}

                        </div>
                      )
                    })
                  )}

                </div>

              </div>
            ) : (
          <div className="chat-container">

            <header className="chat-header">

              <div>
                <h2>
                  <span>#</span> {selectedChannel?.name || 'General'}
                </h2>

                <p>
                  Team {selectedChannel?.team_id || 2} ·{' '}
                  {selectedChannel?.description || 'Team discussion'}
                </p>
              </div>

              <div className="connection-status">
                <span className={isLive ? 'status-dot' : 'status-dot offline'}></span>

                {isLive ? 'Live' : 'Connection lost'}
              </div>

            </header>

            <main className="messages">

              {loading ? (
                <div className="empty-state">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-state">
                  No messages yet.
                </div>
              ) : (
                messages.map((item) => (
                  <div
                    className={`message ${
                      item.sender_id === 1 ? 'own-message' : ''
                    }`}
                    key={item.id}
                  >
                    <strong>
                      User {item.sender_id}
                    </strong>

                    {item.parent_message_id && (
                      <div className="reply-reference">
                        <strong>
                          Replying to User {
                            messages.find(
                              (parent) => parent.id === item.parent_message_id
                            )?.sender_id
                          }
                        </strong>

                        <span>
                          {
                            messages.find(
                              (parent) => parent.id === item.parent_message_id
                            )?.message
                          }
                        </span>
                      </div>
                    )}


                    {item.deleted_at ? (
                      <p className="deleted-message">
                        This message was deleted
                      </p>
                    ) : (
                      <p>{item.message}</p>
                    )}


                    {item.attachments && item.attachments.length > 0 && (
                      <div className="message-attachments">
                        {item.attachments.map((attachment) => (
                          <button
                            key={attachment.id}
                            type="button"
                            className="attachment-button"
                            onClick={() =>
                              handleAttachmentDownload(
                                attachment.id,
                                attachment.file_name
                              )
                            }
                          >
                            📎 {attachment.file_name}
                          </button>
                        ))}
                      </div>
                    )}


                    {item.reactions && item.reactions.length > 0 && (
                      <div className="message-reactions">
                        {[...new Set(item.reactions.map((r) => r.reaction))].map(
                          (reactionType) => {
                            const count = item.reactions.filter(
                              (r) => r.reaction === reactionType
                            ).length

                            const reactedByMe = item.reactions.some(
                              (r) =>
                                r.reaction === reactionType &&
                                Number(r.user_id) === 1
                            )

                            return (
                              <span
                                key={reactionType}
                                className={`reaction-chip ${
                                  reactedByMe ? 'my-reaction' : ''
                                }`}
                                onClick={() =>
                                  handleReaction(item.id, reactionType)
                                }
                              >
                                {reactionType} {count}
                              </span>
                            )
                          }
                        )}
                      </div>
                    )}


                    <small>
                      {item.created_at
                        ? new Date(
                            item.created_at * 1000
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}

                      {item.updated_at &&
                        Number(item.updated_at) !== Number(item.created_at) && (
                          <span className="edited-label"> · edited</span>
                        )}
                    </small>



                    {!item.deleted_at && (
                      <>
                        <button
                          className="reply-button"
                          onClick={() => setReplyingTo(item)}
                        >
                          Reply
                        </button>

                        {item.sender_id === 1 && (
                          <button
                            className="reply-button"
                            onClick={() => {
                              setEditingMessage(item)
                              setMessage(item.message)
                            }}
                          >
                            Edit
                          </button>
                        )}

                        {item.sender_id === 1 && (
                          <button
                            className="reply-button"
                            onClick={() => setDeletingMessage(item)}
                          >
                            Delete
                          </button>
                        )}

                        <div className="reaction-buttons">
                          <button
                            className="reaction-button"
                            onClick={() => handleReaction(item.id, '👍')}
                          >
                            👍
                          </button>

                          <button
                            className="reaction-button"
                            onClick={() => handleReaction(item.id, '❤️')}
                          >
                            ❤️
                          </button>

                          <button
                            className="reaction-button"
                            onClick={() => handleReaction(item.id, '😂')}
                          >
                            😂
                          </button>

                          <button
                            className="reaction-button"
                            onClick={() => handleReaction(item.id, '😮')}
                          >
                            😮
                          </button>

                          <button
                            className="reaction-button"
                            onClick={() => handleReaction(item.id, '😢')}
                          >
                            😢
                          </button>
                        </div>

                      </>
                    )}

                  </div>
                ))
              )}



              <div ref={messagesEndRef} />

            </main>


            {replyingTo && (
              <div className="reply-preview">
                <div>
                  <strong>Replying to User {replyingTo.sender_id}</strong>
                  <span>{replyingTo.message}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </button>
              </div>
            )}


            {deletingMessage && (
              <div className="delete-confirmation">
                <span>
                  Delete this message?
                </span>

                <button
                  type="button"
                  onClick={handleDelete}
                >
                  Delete
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingMessage(null)}
                >
                  Cancel
                </button>
              </div>
            )}


            <form
              className="message-form"
              onSubmit={editingMessage ? (e) => {
                e.preventDefault()
                handleEdit()
              } : handleSubmit}
            > 

              
              <div className="attachment-picker">
                <input
                  id="file-input"
                  type="file"
                  onChange={(e) => {
                    setSelectedFile(e.target.files[0] || null)
                  }}
                  disabled={uploadingFile}
                />

                <label htmlFor="file-input" className="attach-button">
                  📎 Attach
                </label>

                {selectedFile && (
                  <div className="selected-file">
                    <span className="file-icon">📄</span>

                    <span className="file-name">
                      {selectedFile.name}
                    </span>

                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => setSelectedFile(null)}
                      disabled={uploadingFile}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>


              <input
                type="text"
                placeholder="Write a message..."
                value={message}
                onChange={(e) => {
                  const value = e.target.value
                  setMessage(value)

                  if (value.endsWith('@')) {
                    setShowMentionPicker(true)
                    setMentionSearch('')
                  } else if (!value.includes('@')) {
                    setShowMentionPicker(false)
                  }
                }}
              />


              {showMentionPicker && (
                <div className="mention-picker">
                  {users
                    .filter((user) =>
                      user.name.toLowerCase().includes(mentionSearch.toLowerCase())
                    )
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setMessage((prev) => {
                            const index = prev.lastIndexOf('@')
                            return prev.slice(0, index) + '@' + user.name + ' '
                          })

                          setShowMentionPicker(false)
                        }}
                      >
                        @{user.name}
                      </button>
                    ))}
                </div>
              )}

              <button type="submit">
                {editingMessage ? 'Update' : 'Send'}
              </button>

            </form>

          </div>
        )}

      </main>

    </div>
  )
}

export default App