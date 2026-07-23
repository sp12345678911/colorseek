import React, { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, DollarSign, Eye, EyeOff, LogOut, Package, Pencil, Plus, Scissors, Trash2, TrendingUp, X } from 'lucide-react'
import './admin.css'
import './schedule.css'
import { createRevenueRecord, deleteRevenueRecord, listRevenueRecords, updateRevenueRecord } from './revenueApi'
import { listSchedules, updateScheduleStatus } from './scheduleApi'

const mockOrders = [
  { id: 'MS26072001', customer: '林郁晴', phone: '0912-345-678', items: '柔光修護髮油 × 1', total: 1280, status: '待確認', date: '07/20 14:32' },
  { id: 'MS26072002', customer: '陳思妤', phone: '0988-120-567', items: '深層保濕髮膜 × 2', total: 2960, status: '已確認', date: '07/20 11:05' },
  { id: 'MS26071904', customer: '王庭安', phone: '0921-667-520', items: '輕盈造型乳 × 1', total: 980, status: '已完成', date: '07/19 18:46' },
  { id: 'MS26071903', customer: '許雅雯', phone: '0933-480-119', items: '柔光修護髮油 × 1、髮膜 × 1', total: 2760, status: '已取消', date: '07/19 13:20' },
]

const money = value => `NT$ ${Number(value).toLocaleString()}`
const toRevenue = record => ({ ...record, id: record.id ?? record.record_id, service: Number(record.hair_service_revenue ?? 0), product: Number(record.product_revenue ?? 0), customerCount: Number(record.customer_count ?? 0) })
const formPayload = form => {
  const data = new FormData(form)
  return { date: data.get('date'), hair_service_revenue: Number(data.get('service')), product_revenue: Number(data.get('product')), customer_count: Number(data.get('customerCount')), note: data.get('note') || '' }
}

const statusLabels = {
  pending: '待確認',
  confirmed: '已確認',
  completed: '已完成',
  cancelled: '已取消',
}

const dateTimeParts = reservationDate => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(reservationDate))
  const value = type => parts.find(part => part.type === type)?.value
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    time: `${value('hour')}:${value('minute')}`,
  }
}

const toBooking = schedule => {
  const { date, time } = dateTimeParts(schedule.reservation_date)
  const lines = (schedule.notes || '').split('\n')
  const serviceLine = lines[0]?.match(/^服務[：:]\s*(.+)$/)
  const hasLegacyServiceNote = serviceLine && (!schedule.service || serviceLine[1] === schedule.service)
  return {
    ...schedule,
    id: schedule.id ?? schedule.schedule_id,
    customer: schedule.booker,
    phone: schedule.booker_phone ?? schedule.book_number,
    date,
    time,
    service: schedule.service || serviceLine?.[1] || '預約服務',
    note: hasLegacyServiceNote ? lines.slice(1).join('\n') : schedule.notes,
    status: schedule.status || 'pending',
  }
}

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [revenues, setRevenues] = useState([])
  const [saved, setSaved] = useState(false)
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [revenueError, setRevenueError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [bookings, setBookings] = useState([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [updatingBookingId, setUpdatingBookingId] = useState(null)
  const [bookingDate, setBookingDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }))

  const login = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (data.get('account') === 'admin' && data.get('password') === '123456') {
      setLoggedIn(true)
      setError('')
    } else setError('帳號或密碼不正確')
  }

  useEffect(() => {
    if (!loggedIn) return
    let active = true
    setRevenueLoading(true)
    listRevenueRecords().then(result => {
      if (!active) return
      const records = Array.isArray(result) ? result : result.items || result.records || []
      setRevenues(records.map(toRevenue).sort((a, b) => b.date.localeCompare(a.date)))
      setRevenueError('')
    }).catch(err => active && setRevenueError(err.message)).finally(() => active && setRevenueLoading(false))
    return () => { active = false }
  }, [loggedIn])

  useEffect(() => {
    if (!loggedIn) return
    let active = true
    setBookingLoading(true)
    listSchedules().then(result => {
      if (!active) return
      const records = Array.isArray(result) ? result : result.items || result.schedules || result.records || []
      const normalized = records
        .map(toBooking)
        .filter(item => new Date(item.reservation_date).getTime() >= Date.now())
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
      setBookings(normalized)
      if (normalized.length && !normalized.some(item => item.date === bookingDate)) setBookingDate(normalized[0].date)
      setBookingError('')
    }).catch(err => active && setBookingError(err.message)).finally(() => active && setBookingLoading(false))
    return () => { active = false }
  }, [loggedIn])

  const addRevenue = async event => {
    event.preventDefault()
    const form = event.currentTarget
    setRevenueLoading(true)
    try {
      const created = toRevenue(await createRevenueRecord(formPayload(form)))
      setRevenues(current => [created, ...current].sort((a, b) => b.date.localeCompare(a.date)))
      form.reset(); setRevenueError(''); setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch (err) { setRevenueError(err.message) } finally { setRevenueLoading(false) }
  }

  const saveRevenue = async (event, id) => {
    event.preventDefault(); setRevenueLoading(true)
    try {
      const updated = toRevenue(await updateRevenueRecord(id, formPayload(event.currentTarget)))
      setRevenues(current => current.map(item => item.id === id ? updated : item).sort((a, b) => b.date.localeCompare(a.date)))
      setEditingId(null); setRevenueError('')
    } catch (err) { setRevenueError(err.message) } finally { setRevenueLoading(false) }
  }

  const removeRevenue = async record => {
    if (!window.confirm(`確定要刪除 ${record.date} 的營業額紀錄嗎？`)) return
    setRevenueLoading(true)
    try {
      await deleteRevenueRecord(record.id)
      setRevenues(current => current.filter(item => item.id !== record.id)); setRevenueError('')
    } catch (err) { setRevenueError(err.message) } finally { setRevenueLoading(false) }
  }

  const changeBookingStatus = async (id, status) => {
    setUpdatingBookingId(id)
    setBookingError('')
    try {
      const updated = await updateScheduleStatus(id, status)
      setBookings(current => current.map(item => item.id === id
        ? (updated?.reservation_date ? { ...item, ...toBooking(updated), status } : { ...item, ...updated, status })
        : item))
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setUpdatingBookingId(null)
    }
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
      <nav><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}><TrendingUp /> 業績管理</button><button className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')}><CalendarDays /> 預約紀錄 {bookings.filter(booking => booking.status === 'pending').length > 0 && <b>{bookings.filter(booking => booking.status === 'pending').length}</b>}</button><button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}><Package /> 後台訂單 <b>{mockOrders.filter(order => order.status === '待確認').length}</b></button></nav>
      <div className="sidebar-bottom"><a href="#home"><ArrowLeft /> 回到前台</a><button onClick={() => setLoggedIn(false)}><LogOut /> 登出</button></div>
    </aside>
    <section className="admin-content">
      <header><div><p className="admin-kicker">MUSE HAIR STUDIO</p><h1>{tab === 'overview' ? '業績管理' : tab === 'bookings' ? '預約紀錄' : '後台訂單'}</h1></div><div className="admin-user"><span>A</span><p>Admin<small>管理員</small></p></div></header>
      {tab === 'overview' ? <>
        <div className="admin-stats"><article><span><DollarSign /></span><p>最新單日業績<strong>{money(today.service + today.product)}</strong></p></article><article><span><TrendingUp /></span><p>歷史總業績<strong>{money(totalRevenue)}</strong></p></article><article><span><CalendarDays /></span><p>目前紀錄<strong>{revenues.length} 天</strong></p></article></div>
        <div className="admin-grid">
          <section className="admin-card revenue-form"><div className="card-title"><div><p>DAILY REVENUE</p><h2>輸入當天業績</h2></div><Plus /></div>
            <form onSubmit={addRevenue}><label>日期<input name="date" type="date" defaultValue={new Date().toLocaleDateString('en-CA')} required /></label><div className="input-row"><label>服務業績<input name="service" type="number" min="0" placeholder="0" required /></label><label>商品業績<input name="product" type="number" min="0" placeholder="0" required /></label></div><label>來客數<input name="customerCount" type="number" min="0" placeholder="0" required /></label><label>備註<textarea name="note" placeholder="輸入今日營運備註（選填）" /></label>{revenueError && <p className="login-error">{revenueError}</p>}<button className="admin-primary" type="submit" disabled={revenueLoading}>{saved ? <><Check /> 已加入紀錄</> : revenueLoading ? '處理中…' : '儲存今日業績'}</button></form>
          </section>
          <section className="admin-card revenue-history"><div className="card-title"><div><p>REVENUE HISTORY</p><h2>歷史業績</h2></div></div><div className="admin-table"><div className="table-head"><span>日期</span><span>服務</span><span>商品</span><span>總計 / 操作</span></div>{revenueLoading && !revenues.length ? <p className="revenue-message">載入中…</p> : !revenues.length ? <p className="revenue-message">目前沒有營業額紀錄</p> : revenues.map(item => editingId === item.id ? <form className="revenue-edit" key={item.id} onSubmit={event => saveRevenue(event, item.id)}><input name="date" type="date" defaultValue={item.date} required /><input name="service" type="number" min="0" defaultValue={item.service} required /><input name="product" type="number" min="0" defaultValue={item.product} required /><input name="customerCount" type="number" min="0" defaultValue={item.customerCount} aria-label="來客數" required /><textarea name="note" defaultValue={item.note || ''} placeholder="備註" /><div className="row-actions"><button type="submit" aria-label="儲存" disabled={revenueLoading}><Check /></button><button type="button" aria-label="取消" onClick={() => setEditingId(null)}><X /></button></div></form> : <div className="table-row" key={item.id}><span>{item.date}<small>{item.customerCount} 位顧客</small></span><span>{money(item.service)}</span><span>{money(item.product)}</span><strong>{money(item.service + item.product)}</strong>{item.note && <small>{item.note}</small>}<div className="row-actions"><button type="button" aria-label={`編輯 ${item.date}`} onClick={() => setEditingId(item.id)}><Pencil /></button><button type="button" aria-label={`刪除 ${item.date}`} onClick={() => removeRevenue(item)} disabled={revenueLoading}><Trash2 /></button></div></div>)}</div></section>
        </div>
      </> : tab === 'bookings' ? <BookingsPanel bookings={bookings} bookingDate={bookingDate} setBookingDate={setBookingDate} loading={bookingLoading} error={bookingError} updatingId={updatingBookingId} onStatusChange={changeBookingStatus} /> : <section className="admin-card orders-card"><div className="card-title"><div><p>STORE ORDERS</p><h2>商城訂單</h2></div><span className="demo-badge">示範資料</span></div><div className="orders-table"><div className="orders-head"><span>訂單編號</span><span>顧客</span><span>訂購內容</span><span>金額</span><span>狀態</span></div>{mockOrders.map(order => <div className="order-row" key={order.id}><span><b>{order.id}</b><small>{order.date}</small></span><span>{order.customer}<small>{order.phone}</small></span><span>{order.items}</span><strong>{money(order.total)}</strong><span className={`order-status ${order.status}`}>{order.status}</span></div>)}</div></section>}
    </section>
  </main>
}

function BookingsPanel({ bookings: allBookings, bookingDate, setBookingDate, loading, error, updatingId, onStatusChange }) {
  const [dateOffset, setDateOffset] = useState(0)
  const showingAll = bookingDate === 'all'
  const dates = [...new Set(allBookings.map(booking => booking.date))]
  const maxDateOffset = Math.max(0, dates.length - 3)
  const visibleDates = dates.slice(dateOffset, dateOffset + 3)
  const bookings = (showingAll ? allBookings : allBookings.filter(booking => booking.date === bookingDate))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  useEffect(() => {
    setDateOffset(current => Math.min(current, maxDateOffset))
  }, [maxDateOffset])

  return <>
    {dates.length > 0 && <div className="booking-summary-carousel"><button type="button" className="booking-slide" aria-label="查看前面的預約日期" disabled={dateOffset === 0} onClick={() => setDateOffset(current => Math.max(0, current - 1))}><ChevronLeft /></button><div className="booking-summary">{visibleDates.map(date => <button className={date === bookingDate ? 'active' : ''} key={date} onClick={() => setBookingDate(date)}><CalendarDays /><span>{new Date(`${date}T00:00:00`).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })}<small>{allBookings.filter(item => item.date === date).length} 筆預約</small></span></button>)}</div><button type="button" className="booking-slide" aria-label="查看更多預約日期" disabled={dateOffset === maxDateOffset} onClick={() => setDateOffset(current => Math.min(maxDateOffset, current + 1))}><ChevronRight /></button></div>}
    <section className="admin-card bookings-card"><div className="card-title"><div><p>BOOKING SCHEDULE</p><h2>{showingAll ? '全部預約時程' : `${bookingDate} 預約時程`}</h2></div><div className="booking-filters"><button type="button" className={showingAll ? 'active' : ''} onClick={() => setBookingDate('all')}><CalendarDays /> 全部預約</button><label className="date-filter">選擇日期<input type="date" value={showingAll ? '' : bookingDate} onChange={event => setBookingDate(event.target.value)} /></label></div></div>
      {error && <p className="booking-api-error" role="alert">{error}</p>}
      {loading ? <div className="empty-bookings"><CalendarDays /><h3>載入預約中</h3><p>正在向排程 API 取得資料…</p></div> : bookings.length ? <div className="booking-list">{bookings.map(booking => <article key={booking.id}><div className="booking-time"><Clock3 /><p>{showingAll && <small>{booking.date}</small>}<strong>{booking.time}</strong></p></div><div className="booking-service"><span><Scissors /></span><p><strong>{booking.service}</strong><small>排程 #{booking.id}</small></p></div><div className="booking-customer"><strong>{booking.customer}</strong><small>{booking.phone}</small></div><p className="booking-note">{booking.note || '無備註'}</p><select className={`booking-status ${booking.status}`} aria-label={`更新 ${booking.customer} 的預約狀態`} value={booking.status} disabled={updatingId === booking.id} onChange={event => onStatusChange(booking.id, event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></article>)}</div> : <div className="empty-bookings"><CalendarDays /><h3>{showingAll ? '目前沒有預約' : '當天沒有預約'}</h3><p>{showingAll ? '新預約建立後會顯示在這裡。' : '請選擇其他日期查看。'}</p></div>}
    </section>
  </>
}
