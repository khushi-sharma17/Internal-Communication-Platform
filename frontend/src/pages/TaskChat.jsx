import { useEffect, useRef, useState } from 'react'

function TaskChat() {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [deletingMessage, setDeletingMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(true)

  const messagesEndRef = useRef(null)

  const conversationId = 52

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/messages?conversation_id=${conversationId}`,
        {
          headers: {
            Authorization: 'Bearer user1-test-token-12345',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch task messages')
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
      console.error('Error fetching task messages:', error)
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
        console.error('Error marking task message as read:', error)
    }
  }



  useEffect(() => {
    fetchMessages()

    const interval = setInterval(() => {
      fetchMessages()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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
        throw new Error('Failed to edit message')
        }

        await response.json()

        setMessage('')
        setEditingMessage(null)
        await fetchMessages()
    } catch (error) {
        console.error('Error editing task message:', error)
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
        const messageItem = messages.find(
        (item) => item.id === messageId
        )

        const existingReaction = messageItem?.reactions?.find(
        (item) =>
            Number(item.user_id) === 1 &&
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
        throw new Error('Failed to send task message')
      }

      await response.json()

      setMessage('')
      setReplyingTo(null)
      await fetchMessages()
    } catch (error) {
      console.error('Error sending task message:', error)
    }
  }

  return (
    <div className="chat-container">

      <header className="chat-header">

        <div>
          <h2>
            <span>✓</span> Test Task
          </h2>

          <p>
            Task-based conversation · Task #1
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

      <div className="task-info">

        <div>
          <strong>Task</strong>
          <span>Test Task</span>
        </div>

        <div>
          <strong>Assigned to</strong>
          <span>User 2</span>
        </div>

        <div>
          <strong>Created by</strong>
          <span>User 1</span>
        </div>

      </div>

      <main className="messages">

        {loading ? (
          <div className="empty-state">
            Loading task messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            No messages yet. Start the task conversation.
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
            placeholder="Write a message about this task..."
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

export default TaskChat