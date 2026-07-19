import React, { useState } from 'react'
import { ArrowLeft, CalendarDays, Check, ChevronRight, DollarSign, Eye, EyeOff, LogOut, Package, Plus, TrendingUp } from 'lucide-react'
import './admin.css'

const initialRevenue = [
  { date: '2026-07-19', service: 18600, product: 4280, note: '週日預約客較多' },
  { date: '2026-07-18', service: 14200, product: 1960, note: '' },
  { date: '2026-07-17', service: 9800, product: 3240, note: '髮膜組合銷售' },
  { date: '2026-07-16', service: 12500, product: 980, note: '' },
]

const mockOrders = [
  { id: 'MS26072001', customer: '林郁晴', phone: '0912-345-678', items: '柔光修護髮油 × 1', total: 1280, status: '待確認', date: '07/20 14:32' },
  { id: 'MS26072002', customer: '陳思妤', phone: '0988-120-567', items: '深層保濕髮膜 × 2', total: 2960, status: '已確認', date: '07/20 11:05' },
  { id: 'MS26071904', customer: '王庭安', phone: '0921-667-520', items: '輕盈造型乳 × 1', total: 980, status: '已完成', date: '07/19 18:46' },
  { id: 'MS26071903', customer: '許雅雯', phone: '0933-480-119', items: '柔光修護髮油 × 1、髮膜 × 1', total: 2760, status: '已取消', date: '07/19 13:20' },
]

const money = value => `NT$ ${Number(value).toLocaleString()}`

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [revenues, setRevenues] = useState(initialRevenue)
  const [saved, setSaved] = useState(false)

  const login = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (data.get('account') === 'admin' && data.get('password') === '123456') {
      setLoggedIn(true)
      setError('')
    } else setError('帳號或密碼不正確')
  }

  const addRevenue = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setRevenues(current => [{ date: data.get('date'), service: Number(data.get('service')), product: Number(data.get('product')), note: data.get('note') }, ...current])
    event.currentTarget.reset()
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  if (!loggedIn) return <main className="admin-login">
    <a className="admin-back" href="#home"><ArrowLeft /> 回到網站</a>
    <section className="login-panel">
      <div className="login-brand">MUSE <span>HAIR STUDIO</span></div>
      <p className="admin-kicker">PRIVATE MANAGEMENT</p>
      <h1>管理後台</h1>
      <p className="login-lead">登入以查看每日營運與訂單資訊。</p>
      <form onSubmit={login}>
        <label>管理員帳號<input name="account" autoComplete="username" defaultValue="admin" required /></label>
        <label>密碼<div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" defaultValue="123456" required /><button type="button" aria-label="顯示或隱藏密碼" onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
        {error && <p className="login-error">{error}</p>}
        <button className="admin-primary" type="submit">登入管理後台 <ChevronRight /></button>
      </form>
      <small>DEMO ACCOUNT · ADMIN / 123456</small>
    </section>
  </main>

  const totalRevenue = revenues.reduce((sum, item) => sum + item.service + item.product, 0)
  const today = revenues[0] || { service: 0, product: 0 }

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <div className="login-brand">MUSE <span>MANAGEMENT</span></div>
      <nav><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}><TrendingUp /> 業績管理</button><button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}><Package /> 後台訂單 <b>{mockOrders.filter(order => order.status === '待確認').length}</b></button></nav>
      <div className="sidebar-bottom"><a href="#home"><ArrowLeft /> 回到前台</a><button onClick={() => setLoggedIn(false)}><LogOut /> 登出</button></div>
    </aside>
    <section className="admin-content">
      <header><div><p className="admin-kicker">MUSE HAIR STUDIO</p><h1>{tab === 'overview' ? '業績管理' : '後台訂單'}</h1></div><div className="admin-user"><span>A</span><p>Admin<small>管理員</small></p></div></header>
      {tab === 'overview' ? <>
        <div className="admin-stats"><article><span><DollarSign /></span><p>最新單日業績<strong>{money(today.service + today.product)}</strong></p></article><article><span><TrendingUp /></span><p>歷史總業績<strong>{money(totalRevenue)}</strong></p></article><article><span><CalendarDays /></span><p>目前紀錄<strong>{revenues.length} 天</strong></p></article></div>
        <div className="admin-grid">
          <section className="admin-card revenue-form"><div className="card-title"><div><p>DAILY REVENUE</p><h2>輸入當天業績</h2></div><Plus /></div>
            <form onSubmit={addRevenue}><label>日期<input name="date" type="date" defaultValue="2026-07-20" required /></label><div className="input-row"><label>服務業績<input name="service" type="number" min="0" placeholder="0" required /></label><label>商品業績<input name="product" type="number" min="0" placeholder="0" required /></label></div><label>備註<textarea name="note" placeholder="輸入今日營運備註（選填）" /></label><button className="admin-primary" type="submit">{saved ? <><Check /> 已加入紀錄</> : '儲存今日業績'}</button></form>
          </section>
          <section className="admin-card revenue-history"><div className="card-title"><div><p>REVENUE HISTORY</p><h2>歷史業績</h2></div></div><div className="admin-table"><div className="table-head"><span>日期</span><span>服務</span><span>商品</span><span>總計</span></div>{revenues.map((item, index) => <div className="table-row" key={`${item.date}-${index}`}><span>{item.date}</span><span>{money(item.service)}</span><span>{money(item.product)}</span><strong>{money(item.service + item.product)}</strong>{item.note && <small>{item.note}</small>}</div>)}</div></section>
        </div>
      </> : <section className="admin-card orders-card"><div className="card-title"><div><p>STORE ORDERS</p><h2>商城訂單</h2></div><span className="demo-badge">示範資料</span></div><div className="orders-table"><div className="orders-head"><span>訂單編號</span><span>顧客</span><span>訂購內容</span><span>金額</span><span>狀態</span></div>{mockOrders.map(order => <div className="order-row" key={order.id}><span><b>{order.id}</b><small>{order.date}</small></span><span>{order.customer}<small>{order.phone}</small></span><span>{order.items}</span><strong>{money(order.total)}</strong><span className={`order-status ${order.status}`}>{order.status}</span></div>)}</div></section>}
    </section>
  </main>
}
