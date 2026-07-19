import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Camera, Menu, Scissors, Sparkles, X } from 'lucide-react'
import hero from './assets/salon-hero.png'
import portfolio from './assets/hair-portfolio.png'
import './styles.css'

const services = [
  { icon: Scissors, name: '質感剪髮', detail: '洗髮・造型・居家整理建議', price: 'NT$ 1,200+' },
  { icon: Sparkles, name: '專屬染髮', detail: '質感染・挑染・漂髮設計', price: 'NT$ 3,500+' },
  { icon: 'wave', name: '柔感燙髮', detail: '韓系燙・慵懶捲・縮毛矯正', price: 'NT$ 4,200+' },
  { icon: 'leaf', name: '深層護理', detail: '結構式護髮・頭皮舒緩', price: 'NT$ 1,800+' },
]

const works = [
  ['01', '柔霧可可', 'WARM COCOA'], ['02', '霧感短鮑伯', 'ASH BOB'],
  ['03', '琥珀層次', 'AMBER LAYERS'], ['04', '午夜光澤', 'MIDNIGHT GLOSS'],
]

function App() {
  const [menu, setMenu] = useState(false)
  const [sent, setSent] = useState(false)
  const close = () => setMenu(false)
  const submit = (e) => { e.preventDefault(); setSent(true) }

  return <main>
    <nav className="nav">
      <a className="brand" href="#home">MUSE <span>HAIR STUDIO</span></a>
      <div className={menu ? 'links open' : 'links'}>
        <a onClick={close} href="#about">ABOUT ME</a><a onClick={close} href="#pricing">PRICE</a>
        <a onClick={close} href="#portfolio">PORTFOLIO</a><a onClick={close} href="#booking">BOOKING</a>
      </div>
      <a className="nav-cta" href="#booking">立即預約 <ArrowRight /></a>
      <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="切換選單">{menu ? <X /> : <Menu />}</button>
    </nav>

    <section className="hero" id="home" style={{'--hero': `url(${hero})`}}>
      <div className="hero-copy"><p className="kicker">PERSONAL HAIR DESIGN · TAIPEI</p>
        <h1>找到專屬於你的<br /><em>理想髮型</em></h1>
        <p className="lead">不追逐短暫潮流，從你的輪廓與日常出發，<br />設計一款真正適合你的髮型。</p>
        <a className="primary" href="#booking">預約我的服務 <ArrowRight /></a>
      </div>
      <div className="hero-note"><span>SCROLL TO DISCOVER</span><i /></div>
    </section>

    <section className="about section" id="about">
      <div className="section-label"><span>01</span> ABOUT ME</div>
      <div className="about-photo"><div className="crop hero-crop" style={{backgroundImage:`url(${hero})`}} /><small>HAIR DESIGNER / MUSE</small></div>
      <div className="about-copy"><p className="eyebrow">哈囉，我是 MUSE</p><h2>讓每一次改變，<br />都更靠近真實的你。</h2>
        <p>專注於質感染髮與柔和層次剪裁。我相信好看的髮型不只是拍照的那一刻，而是回到家後，每一天都能輕鬆整理、自在生活。</p>
        <p>從髮質、臉型到你的日常習慣，我會先傾聽，再一起找出最適合你的設計。</p>
        <div className="signature">Muse Lin <span>資歷 8 年 · 台北</span></div>
      </div>
    </section>

    <section className="pricing section" id="pricing">
      <div className="section-label light"><span>02</span> SERVICE & PRICING</div>
      <div className="pricing-title"><p className="eyebrow">SERVICES</p><h2>為你的日常，<br />設計剛剛好的美。</h2></div>
      <div className="service-list">{services.map(({icon: Icon, name, detail, price}) => <div className="service" key={name}>
        <div className="service-icon">{typeof Icon === 'string' ? (Icon === 'wave' ? '〰' : '♧') : <Icon />}</div>
        <div><h3>{name}</h3><p>{detail}</p></div><strong>{price}</strong>
      </div>)}</div>
      <p className="price-note">＊ 實際價格會依髮長、髮量與當日評估調整，預約前皆會完整說明。</p>
    </section>

    <section className="portfolio section" id="portfolio">
      <div className="section-label"><span>03</span> SELECTED WORKS</div>
      <div className="section-heading"><div><p className="eyebrow">PORTFOLIO</p><h2>近期作品</h2></div><p>每一款髮型，都從理解一個人開始。<br />看看我們一起完成的改變。</p></div>
      <div className="works">{works.map((work, i) => <article className="work-card" key={work[0]}>
        <div className="work-image" style={{backgroundImage:`url(${portfolio})`, backgroundPosition:`${i * 33.333}% center`}}><span>{work[0]}</span></div>
        <h3>{work[1]}</h3><p>{work[2]}</p>
      </article>)}</div>
      <a className="text-link" href="https://instagram.com" target="_blank" rel="noreferrer"><Camera /> 在 Instagram 看更多作品 <ArrowRight /></a>
    </section>

    <section className="booking section" id="booking">
      <div className="booking-intro"><div className="section-label light"><span>04</span> BOOKING</div><p className="eyebrow">MAKE AN APPOINTMENT</p><h2>準備好，遇見<br />全新的自己了嗎？</h2>
        <p>選擇你方便的時間與想做的服務，我會在 24 小時內與你確認預約細節。</p>
        <div className="contact-info"><p>台北市中山區・捷運步行 5 分鐘</p><p>Tue — Sun · 11:00 — 20:00</p></div>
      </div>
      <form className="booking-form" onSubmit={submit}>
        {sent ? <div className="success"><Check /><h3>收到你的預約了！</h3><p>我會在 24 小時內與你聯絡確認。</p><button type="button" onClick={()=>setSent(false)}>再填一次</button></div> : <>
          <div className="field full"><label>想預約的服務</label><div className="select-wrap"><select required defaultValue=""><option value="" disabled>請選擇服務項目</option><option>質感剪髮</option><option>專屬染髮</option><option>柔感燙髮</option><option>深層護理</option></select><ChevronDown /></div></div>
          <div className="field"><label><CalendarDays /> 日期</label><input type="date" required /></div>
          <div className="field"><label><Clock3 /> 時間</label><input type="time" required /></div>
          <div className="field"><label>你的名字</label><input placeholder="怎麼稱呼你？" required /></div>
          <div className="field"><label>聯絡電話</label><input type="tel" placeholder="09xx-xxx-xxx" required /></div>
          <div className="field full"><label>想告訴我的事</label><textarea placeholder="目前髮況、理想髮型，或任何想先討論的細節…" /></div>
          <button className="submit" type="submit">送出預約 <ArrowRight /></button>
        </>}
      </form>
    </section>

    <footer><div><a className="brand" href="#home">MUSE <span>HAIR STUDIO</span></a><p>讓髮型，成為你最自在的樣子。</p></div><div><p>FOLLOW</p><a href="https://instagram.com">Instagram</a><a href="#booking">LINE 預約</a></div><div><p>CONTACT</p><a href="tel:0223456789">02 2345 6789</a><a href="mailto:hello@musehair.tw">hello@musehair.tw</a></div><small>© 2026 MUSE HAIR STUDIO</small></footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
