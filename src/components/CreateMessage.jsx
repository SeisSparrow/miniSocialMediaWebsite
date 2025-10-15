import { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import './CreateMessage.css'

function CreateMessage({ user }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('请填写标题和内容')
      return
    }

    setLoading(true)

    try {
      await addDoc(collection(db, 'messages'), {
        title: title.trim(),
        content: content.trim(),
        authorEmail: user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      })

      setTitle('')
      setContent('')
      alert('发布成功！')
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-message-container">
      <div className="create-message-card">
        <h2>✍️ 发布新消息</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给你的消息起个标题"
              maxLength="100"
              required
            />
          </div>
          <div className="form-group">
            <label>内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的想法..."
              rows="4"
              maxLength="1000"
              required
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? '发布中...' : '发布消息'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateMessage


