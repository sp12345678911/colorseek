import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, Clock3 } from 'lucide-react'
import { beginLineLogin, getCurrentAccount, loginWithLiff } from './authApi'
import { LIFF_ID } from './config'
import { createSchedule } from './scheduleApi'
import { services } from './services'
import './styles.css'
import './schedule.css'
import './lineLogin.css'
import './bookingPage.css'

function BookingPage() {
  const [account, setAccount] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [sent, setSent] = useState(false)

  const connectLiff = async () => {
    if (!LIFF_ID || !window.liff) return false
    await window.liff.init({ liffId: LIFF_ID })
    if (!window.liff.isLoggedIn()) {
      window.liff.login({ redirectUri: window.location.href.split('#')[0] })
      return true
    }
    const idToken = window.liff.getIDToken()
    if (!idToken) throw new Error('無法取得 LINE 登入憑證，請重新登入')
    const current = await loginWithLiff(idToken)
    setAccount(current)
    return true
  }

  useEffect(() => {
    let active = true
    const initialize = async () => {
      try {
        const current = await getCurrentAccount()
        if (!active) return
        if (current) {
          setAccount(current)
          return
        }
        await connectLiff()
      } catch (error) {
        if (active) setAuthError(error.message)
      } finally {
        if (active) setAuthLoading(false)
      }
    }
    initialize()
    return () => { active = false }
  }, [])

  const login = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      if (!await connectLiff()) beginLineLogin('booking.html')
    } catch (error) {
      setAuthError(error.message)
      setAuthLoading(false)
    }
  }

  const submit = async event => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBookingLoading(true)
    setBookingError('')
    try {
      await createSchedule({
        booker: account.display_name,
        booker_phone: data.get('booker_phone').trim(),
        service: data.get('service'),
        reservation_date: new Date(`${data.get('date')}T${data.get('time')}:00+08:00`).toISOString(),
        notes: data.get('notes')?.trim() || null,
      })
      form.reset()
      setSent(true)
    } catch (error) {
      setBookingError(error.message)
    } finally {
      setBookingLoading(false)
    }
  }

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date())

  return <main className="booking-page">
    <nav className="booking-nav">
      <a className="brand" href="./">MUSE <span>HAIR STUDIO</span></a>
      <a className="booking-back" href="./"><ArrowLeft /> 返回首頁</a>
    </nav>
    <section className="booking section">
      <div className="booking-intro"><div className="section-label light"><span>01</span> BOOKING</div><p className="eyebrow">MAKE AN APPOINTMENT</p><h1>簡單登入，<br />立即預約。</h1>
        <p>使用 LINE 登入後，選擇服務與方便的時間即可送出。我們會在 24 小時內與你確認預約細節。</p>
        <div className="contact-info"><p>新北市金山區中正路37號1樓・金山農會步行 3 分鐘</p><p>Tue — Sun · 08:00 — 21:00</p></div>
      </div>
      {authLoading ? <div className="booking-form booking-login-required"><span className="member-loading-dark">正在連接 LINE…</span></div> : !account ? <div className="booking-form booking-login-required"><span className="line-mark">LINE</span><h2>登入後開始預約</h2><p>不需要另外註冊帳號，只要使用 LINE 就能完成登入。</p><button type="button" className="line-login" onClick={login}><span>LINE</span> 登入並預約</button>{authError && <small className="booking-auth-error">{authError}</small>}</div> : <form className="booking-form" onSubmit={submit}>
        {sent ? <div className="success"><Check /><h2>收到你的預約了！</h2><p>我們會在 24 小時內與你聯絡確認。</p><button type="button" onClick={() => setSent(false)}>再預約一次</button></div> : <>
          <p className="booking-member">預約人 <strong>{account.display_name}</strong></p>
          <div className="field full"><label>想預約的服務</label><div className="select-wrap"><select name="service" required defaultValue=""><option value="" disabled>請選擇服務項目</option>{services.map(service => <option key={service.name}>{service.name}</option>)}</select><ChevronDown /></div></div>
          <div className="field"><label><CalendarDays /> 日期</label><input name="date" type="date" min={today} required /></div>
          <div className="field"><label><Clock3 /> 時間</label><input name="time" type="time" min="08:00" max="21:00" required /></div>
          <div className="field full"><label>聯絡電話</label><input name="booker_phone" type="tel" defaultValue={account.phone || ''} inputMode="tel" autoComplete="tel" placeholder="09xx-xxx-xxx" required /></div>
          <div className="field full"><label>想告訴我的事</label><textarea name="notes" placeholder="目前髮況、理想髮型，或任何想先討論的細節…" /></div>
          {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
          <button className="submit" type="submit" disabled={bookingLoading}>{bookingLoading ? '送出中…' : <>送出預約 <ArrowRight /></>}</button>
        </>}
      </form>}
    </section>
  </main>
}

createRoot(document.getElementById('root')).render(<BookingPage />)
