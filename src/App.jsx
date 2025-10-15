import { useState, useEffect } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Auth from './components/Auth'
import MessageList from './components/MessageList'
import CreateMessage from './components/CreateMessage'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('退出登录失败:', error)
      alert('退出登录失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>🌟 迷你社交网站</h1>
          {user ? (
            <div className="user-info">
              <span className="welcome">欢迎, {user.email}</span>
              <button onClick={handleLogout} className="btn-logout">
                退出登录
              </button>
            </div>
          ) : (
            <div className="user-info">
              <span className="welcome">游客模式</span>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {!user && <Auth />}
          {user && <CreateMessage user={user} />}
          <MessageList user={user} />
        </div>
      </main>
    </div>
  )
}

export default App


