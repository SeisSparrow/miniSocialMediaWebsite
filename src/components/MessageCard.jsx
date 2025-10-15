import { useState } from 'react'
import { db } from '../firebase'
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'
import './MessageCard.css'

function MessageCard({ message, user }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(message.title)
  const [editContent, setEditContent] = useState(message.content)
  const [loading, setLoading] = useState(false)

  const isAuthor = user && user.uid === message.authorId

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这条消息吗？')) {
      return
    }

    setLoading(true)
    try {
      await deleteDoc(doc(db, 'messages', message.id))
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    if (!editTitle.trim() || !editContent.trim()) {
      alert('标题和内容不能为空')
      return
    }

    setLoading(true)
    try {
      await updateDoc(doc(db, 'messages', message.id), {
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      setIsEditing(false)
      alert('更新成功！')
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditTitle(message.title)
    setEditContent(message.content)
    setIsEditing(false)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '刚刚'
    
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now - date
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚'
    }
    // 小于1小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    }
    // 小于1天
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    }
    // 小于7天
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`
    }
    
    // 超过7天显示具体日期
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="message-card">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-title"
            maxLength="100"
            required
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-content"
            rows="4"
            maxLength="1000"
            required
          />
          <div className="edit-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn-cancel"
              disabled={loading}
            >
              取消
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="message-header">
            <h3 className="message-title">{message.title}</h3>
          </div>
          <div className="message-meta">
            <span className="message-author">👤 {message.authorEmail}</span>
            <span className="message-time">🕒 {formatDate(message.createdAt)}</span>
          </div>
          <p className="message-content">{message.content}</p>
          
          {isAuthor && (
            <div className="message-actions">
              <button
                onClick={() => setIsEditing(true)}
                className="btn-edit"
                disabled={loading}
              >
                编辑
              </button>
              <button
                onClick={handleDelete}
                className="btn-delete"
                disabled={loading}
              >
                {loading ? '删除中...' : '删除'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MessageCard


