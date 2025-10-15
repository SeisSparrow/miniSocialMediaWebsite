import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import MessageCard from './MessageCard'
import './MessageList.css'

function MessageList({ user }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 创建查询，按创建时间降序排列
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'))

    // 实时监听消息变化
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMessages(messagesData)
      setLoading(false)
    }, (error) => {
      console.error('获取消息失败:', error)
      setLoading(false)
    })

    // 清理函数
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="messages-container">
        <div className="loading-messages">加载消息中...</div>
      </div>
    )
  }

  return (
    <div className="messages-container">
      <h2 className="messages-title">📱 所有消息</h2>
      {messages.length === 0 ? (
        <div className="no-messages">
          <p>暂无消息</p>
          <p className="hint">成为第一个发布消息的人吧！</p>
        </div>
      ) : (
        <div className="messages-grid">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MessageList


