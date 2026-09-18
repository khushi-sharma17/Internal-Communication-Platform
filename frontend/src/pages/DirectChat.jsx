import { useEffect, useRef, useState } from 'react'

function DirectChat({ selectedUser }) {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [deletingMessage, setDeletingMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(true)

  const [conversationId, setConversationId] = useState(null)

  const messagesEndRef = useRef(null)
  const fetchRequestId = useRef(0)

  // const conversationId = 2

  const fetchMessages = async (showLoading = false) => {
    const requestId = ++fetchRequestId.current

    try {
      if (!selectedUser) {
        setMessages([])
        setConversationId(null)

        if (showLoading) {
          setLoading(false)
        }

        return
      }

      if (showLoading) {
        setLoading(true)
      }

      const conversationResponse = await fetch(
        'http://localhost:8080/conversations',
        {
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      if (!conversationResponse.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const conversations = await conversationResponse.json()

      let conversation = null

      const oneToOneConversations = conversations.filter(
        (item) => item.type === 'one_to_one'
      )

      for (const item of oneToOneConversations) {
        const participantsResponse = await fetch(
          `http://localhost:8080/conversation-participants?conversation_id=${item.id}`,
          {
            headers: {
              Authorization: 'Bearer user1-test-token-12345',
            },
          }
        )

        if (!participantsResponse.ok) {
          continue
        }

        const participants = await participantsResponse.json()

        const hasCurrentUser = participants.some(
          (participant) =>
            Number(participant.user_id) === 1
        )

        const hasSelectedUser = participants.some(
          (participant) =>
            Number(participant.user_id) === Number(selectedUser.id)
        )

        if (hasCurrentUser && hasSelectedUser) {
          conversation = item
          break
        }
      }

      // Ignore this request if a newer request has started
      if (requestId !== fetchRequestId.current) {
        return
      }

      console.log(
        'Selected direct user:',
        selectedUser
      )

      console.log(
        'Selected user ID:',
        selectedUser.id
      )

      console.log(
        'Matching direct conversation:',
        conversation
      )

      if (!conversation) {
        console.log(
          'No direct conversation found. Creating one for:',
          selectedUser
        )

        const createResponse = await fetch(
          'http://localhost:8080/conversations',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer user1-test-token-12345',
            },
            body: JSON.stringify({
              user_id: Number(selectedUser.id),
            }),
          }
        )

        if (!createResponse.ok) {
          throw new Error(
            `Failed to create direct conversation (${createResponse.status})`
          )
        }

        const createdConversation = await createResponse.json()

        console.log(
          'Created direct conversation:',
          createdConversation
        )

        setConversationId(createdConversation.id)
        setMessages([])
        setIsLive(true)

        if (showLoading) {
          setLoading(false)
        }

        return
      }

      const currentConversationId = conversation.id

      setConversationId(currentConversationId)

      const response = await fetch(
        `http://localhost:8080/messages?conversation_id=${currentConversationId}`,
        {
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch direct messages')
      }

      const data = await response.json()

      // Ignore old request if user/conversation changed
      if (requestId !== fetchRequestId.current) {
        return
      }

      setIsLive(true)

      data.forEach((msg) => {
        markMessageAsRead(msg.id)
      })

      setMessages((previousMessages) => {
        if (
          JSON.stringify(previousMessages) ===
          JSON.stringify(data)
        ) {
          return previousMessages
        }

        return data
      })

    } catch (error) {
      // Ignore errors from old requests
      if (requestId !== fetchRequestId.current) {
        return
      }

      console.error(
        'Error fetching direct messages:',
        error
      )

      setIsLive(false)

    } finally {
      if (
        showLoading &&
        requestId === fetchRequestId.current
      ) {
        setLoading(false)
      }
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
        console.error('Error marking direct message as read:', error)
    }
  }


  useEffect(() => {
    if (!selectedUser) {
      setMessages([])
      setConversationId(null)
      setMessage('')
      setReplyingTo(null)
      setEditingMessage(null)
      setDeletingMessage(null)
      return
    }

    setMessages([])
    setMessage('')
    setReplyingTo(null)
    setEditingMessage(null)
    setDeletingMessage(null)

    fetchMessages(true)

    const interval = setInterval(() => {
      fetchMessages(false)
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedUser])



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])




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
        throw new Error('Failed to edit direct message')
        }

        await response.json()

        setMessage('')
        setEditingMessage(null)
        await fetchMessages()
    } catch (error) {
        console.error('Error editing direct message:', error)
    }
  }



  const handleDelete = async () => {
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

        if (!response.ok) {
        throw new Error('Failed to delete message')
        }

        await response.json()

        setDeletingMessage(null)
        await fetchMessages()
    } catch (error) {
        console.error('Error deleting message:', error)
    }
  }





    const handleReaction = async (messageId, reaction) => {
        try {
        const currentMessage = messages.find(
            (item) => item.id === messageId
        )

        const existingReaction = currentMessage?.reactions?.find(
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
        console.error('Error handling reaction:', error)
        }
    }




  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim()) {
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
          conversation_id: conversationId,
          message: message,
          parent_message_id: replyingTo ? replyingTo.id : null,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send direct message')
      }

      await response.json()

      setMessage('')
      setReplyingTo(null)
      await fetchMessages()
    } catch (error) {
      console.error('Error sending direct message:', error)
    }
  }

  return (
    <div className="chat-container">

      <header className="chat-header">

        <div>
          <h2>
            <span>●</span>{' '}
            {selectedUser?.name || `User ${selectedUser?.id}`}
          </h2>

          <p>
            Direct message · Private conversation
          </p>
        </div>

        <div className="connection-status">
          <span
            className={
              isLive
                ? 'status-dot'
                : 'status-dot offline'
            }
          ></span>

          {isLive ? 'Live' : 'Connection lost'}
        </div>

      </header>

      <div className="direct-info">
        <div className="direct-avatar">
          {selectedUser?.name
            ? selectedUser.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : `U${selectedUser?.id}`}
        </div>

        <div className="direct-details">
            <strong>
              {selectedUser?.name || `User ${selectedUser?.id}`}
            </strong>
            <span>Private conversation</span>
        </div>
      </div>

      <main className="messages">

        {loading ? (
          <div className="empty-state">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            No messages yet. Start a conversation.
          </div>
        ) : (
          messages.map((item) => (
            <div
              className={`message ${
                item.sender_id === 1
                  ? 'own-message'
                  : ''
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
        onSubmit={
            editingMessage
            ? (e) => {
                e.preventDefault()
                handleEdit()
                }
            : handleSubmit
        }
      >
        <input
          type="text"
          placeholder="Write a private message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button type="submit">
        {editingMessage ? 'Update' : 'Send'}
        </button>

      </form>

    </div>
  )
}

export default DirectChat