import { useState } from 'react'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import './Auth.css'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('认证失败:', error)
      let errorMessage = '操作失败，请重试'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '该邮箱已被注册'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '邮箱格式不正确'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '密码强度太弱，至少需要6个字符'
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = '用户不存在'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = '密码错误'
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = '邮箱或密码错误'
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? '登录' : '注册'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码（至少6个字符）"
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>
        <p className="toggle-auth">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="btn-link"
          >
            {isLogin ? '立即注册' : '立即登录'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth


