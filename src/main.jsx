import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Camera, Coins, LogOut, Menu, Minus, Plus, Scissors, ShoppingBag, Sparkles, X } from 'lucide-react'
import hero from './assets/salon-hero.png'
import work01 from './assets/work-01.jpg'
import work02 from './assets/work-02.jpg'
import work03 from './assets/work-03.jpg'
import work04 from './assets/work-04.jpg'
import product01 from '../source/good/S__134217755.jpg'
import product02 from '../source/good/S__134217757.jpg'
import product03 from '../source/good/S__134217758.jpg'
import './styles.css'
import './schedule.css'
import './lineLogin.css'
import './nav.css'
import Admin from './Admin.jsx'
import { createSchedule } from './scheduleApi'
import { beginLineLogin, getCurrentAccount, listMyPointTransactions, logoutAccount } from './authApi'
import { createOrder, listProducts } from './commerceApi'

const membershipLabels = { normal: '一般會員', silver: '銀卡會員', gold: '金卡會員', vip: 'VIP 會員' }
const pointTypeLabels = { earn: '獲得', redeem: '兌換', refund: '退回', expire: '到期', adjustment: '調整' }

const services = [
  { icon: Sparkles, name: '洗髮（含潤髮）', detail: '基礎清潔・潤髮護理', price: 'NT$ 200' },
  { icon: Scissors, name: '剪髮', detail: '專業剪裁・造型整理', price: 'NT$ 300' },
  { icon: 'wave', name: '冷燙', detail: '依髮長、髮量現場評估', price: 'NT$ 1,200+' },
  { icon: 'wave', name: '縮毛矯正／溫塑燙', detail: '依髮長、髮量現場評估', price: 'NT$ 1,700+' },
  { icon: Sparkles, name: '染髮', detail: '依髮長、髮量現場評估', price: 'NT$ 1,500+' },
  { icon: 'leaf', name: '一般護髮', detail: '日常髮絲修護', price: 'NT$ 1,000' },
  { icon: 'leaf', name: '結構式二段護髮', detail: '兩階段深層結構修護', price: 'NT$ 1,500' },
  { icon: 'leaf', name: '深層頭皮護理', detail: '頭皮清潔・舒緩養護', price: 'NT$ 1,200' },
]

const works = [
  { number: '01', name: '莓果暖棕', en: 'BERRY WARM BROWN', image: work01 },
  { number: '02', name: '柔感波浪', en: 'SOFT WAVE', image: work02 },
  { number: '03', name: '質感茶棕', en: 'GLOSSY TEA BROWN', image: work03 },
  { number: '04', name: '午夜藍黑', en: 'MIDNIGHT BLUE BLACK', image: work04 },
]

const productFallbacks = {
  'MUSE-HAIR-OIL': { image: product01, imagePosition: 'center 58%' },
  'MUSE-STYLING-CREAM': { image: product02, imagePosition: 'center' },
  'MUSE-MOISTURE-MASK': { image: product03, imagePosition: 'left center' },
}

function App() {
  const [menu, setMenu] = useState(false)
  const [sent, setSent] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [account, setAccount] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [memberOpen, setMemberOpen] = useState(false)
  const [pointTransactions, setPointTransactions] = useState([])
  const [pointsLoading, setPointsLoading] = useState(false)
  const [cart, setCart] = useState({})
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productOffset, setProductOffset] = useState(0)
  const [storeError, setStoreError] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const close = () => setMenu(false)

  useEffect(() => {
    let active = true
    getCurrentAccount()
      .then(current => {
        if (active) setAccount(current)
      })
      .catch(error => {
        if (active) setAuthError(error.message)
      })
      .finally(() => {
        if (active) setAuthLoading(false)
      })
    return () => { active = false }
  }, [])

  const loadProducts = async () => {
    setProductsLoading(true)
    try {
      const records = await listProducts()
      setProducts((Array.isArray(records) ? records : []).map(product => ({
        ...product,
        price: Number(product.price),
        stock_quantity: Number(product.stock_quantity),
      })))
      setStoreError('')
    } catch (error) {
      setStoreError(error.message)
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const maxProductOffset = Math.max(0, products.length - 3)
  const visibleProducts = products.slice(productOffset, productOffset + 3)

  useEffect(() => {
    setProductOffset(current => Math.min(current, maxProductOffset))
  }, [maxProductOffset])

  const handleLineLogin = () => {
    try {
      beginLineLogin('#home')
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const handleBookingLogin = () => {
    try {
      beginLineLogin('#booking')
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const toggleMember = async () => {
    const willOpen = !memberOpen
    setMemberOpen(willOpen)
    if (!willOpen || pointTransactions.length || pointsLoading) return
    setPointsLoading(true)
    setAuthError('')
    try {
      setPointTransactions(await listMyPointTransactions() || [])
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setPointsLoading(false)
    }
  }

  const handleLogout = async () => {
    setAuthError('')
    try {
      await logoutAccount()
      setAccount(null)
      setPointTransactions([])
      setMemberOpen(false)
    } catch (error) {
      setAuthError(error.message)
    }
  }
  const submit = async event => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const service = data.get('service')
    const notes = data.get('notes')?.trim() || null

    setBookingLoading(true)
    setBookingError('')
    try {
      await createSchedule({
        booker: account.display_name,
        booker_phone: data.get('booker_phone').trim(),
        service,
        reservation_date: new Date(`${data.get('date')}T${data.get('time')}:00+08:00`).toISOString(),
        notes,
      })
      form.reset()
      setSent(true)
    } catch (error) {
      setBookingError(error.message)
    } finally {
      setBookingLoading(false)
    }
  }
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const cartItems = products
    .filter(product => cart[product.id] > 0)
    .map(product => ({ ...product, quantity: cart[product.id] }))
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const changeCart = (product, amount) => setCart(current => ({
    ...current,
    [product.id]: Math.min(product.stock_quantity, Math.max(0, (current[product.id] || 0) + amount)),
  }))

  const handleStoreLogin = () => {
    try {
      beginLineLogin('#store')
    } catch (error) {
      setStoreError(error.message)
    }
  }

  const submitOrder = async event => {
    event.preventDefault()
    if (!account) {
      handleStoreLogin()
      return
    }
    if (!cartItems.length) {
      setStoreError('購物袋目前沒有商品')
      return
    }
    const data = new FormData(event.currentTarget)
    setOrderLoading(true)
    setStoreError('')
    try {
      const order = await createOrder({
        customer_phone: data.get('customer_phone').trim(),
        notes: data.get('notes')?.trim() || null,
        items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
      })
      setCompletedOrder(order)
      setCart({})
      await loadProducts()
    } catch (error) {
      setStoreError(error.message)
    } finally {
      setOrderLoading(false)
    }
  }

  return <main>
    <nav className="nav">
      <a className="brand" href="#home">MUSE <span>HAIR STUDIO</span></a>
      <div className={menu ? 'links open' : 'links'}>
        <a onClick={close} href="#about">關於我們</a><a onClick={close} href="#pricing">價目表</a>
        <a onClick={close} href="#portfolio">作品集</a><a onClick={close} href="#store">線上商城</a><a onClick={close} href="#booking">線上預約</a>
        {authLoading ? <span className="member-loading">會員載入中…</span> : account ? <div className="member-menu">
          <button type="button" className="member-trigger" aria-expanded={memberOpen} onClick={toggleMember}>
            {account.picture_url ? <img src={account.picture_url} alt="" referrerPolicy="no-referrer" /> : <span className="member-avatar">{account.display_name.slice(0, 1)}</span>}
            <span>{account.display_name}<small><Coins /> {account.points_balance.toLocaleString()} 點</small></span>
            <ChevronDown />
          </button>
          {memberOpen && <div className="member-panel">
            <div className="member-summary"><strong>{membershipLabels[account.membership_level] || account.membership_level}</strong><span>可用點數<b>{account.points_balance.toLocaleString()}</b></span><small>累積獲得 {account.total_points_earned.toLocaleString()} 點</small></div>
            <div className="point-history"><p>近期點數紀錄</p>{pointsLoading ? <small>載入中…</small> : pointTransactions.length ? pointTransactions.slice(0, 5).map(item => <div key={item.id}><span>{item.description || pointTypeLabels[item.transaction_type]}</span><b className={item.amount > 0 ? 'positive' : 'negative'}>{item.amount > 0 ? '+' : ''}{item.amount}</b><small>{new Date(item.created_at).toLocaleDateString('zh-TW')}</small></div>) : <small>目前沒有點數紀錄</small>}</div>
            {authError && <p className="member-error">{authError}</p>}
            <button type="button" className="member-logout" onClick={handleLogout}><LogOut /> 登出</button>
          </div>}
        </div> : <div className="line-login-wrap"><button type="button" className="line-login" onClick={handleLineLogin}><span>LINE</span> 登入</button>{authError && <small className="line-login-error">{authError}</small>}</div>}
        <a className="admin-login-link" onClick={close} href="#admin">後台登入</a>
      </div>
      <a className="nav-cta bag-link" href="#cart"><ShoppingBag /> 購物袋 <span>{cartCount}</span></a>
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
      <div className="works">{works.map(work => <article className="work-card" key={work.number}>
        <div className="work-image" style={{backgroundImage:`url(${work.image})`}}><span>{work.number}</span></div>
        <h3>{work.name}</h3><p>{work.en}</p>
      </article>)}</div>
      <a className="text-link" href="https://www.instagram.com/melody_melody_3333/" target="_blank" rel="noreferrer"><Camera /> 在 Instagram 看更多作品 <ArrowRight /></a>
    </section>

    <section className="store section" id="store">
      <div className="section-label"><span>04</span> MUSE STORE</div>
      <div className="section-heading store-heading"><div><p className="eyebrow">CURATED ESSENTIALS</p><h2>把沙龍質感，<br />帶回你的日常。</h2></div><p>由我親自挑選的居家護理與造型品，<br />讓好髮型延續到每一天。</p></div>
      {productsLoading ? <p className="store-message">商品載入中…</p> : products.length ? <div className="product-carousel">
        {products.length > 3 && <button type="button" className="product-slide previous" aria-label="查看前面的商品" disabled={productOffset === 0} onClick={() => setProductOffset(current => Math.max(0, current - 1))}><ChevronLeft /></button>}
        <div className="products">{visibleProducts.map((product, index) => {
        const quantity = cart[product.id] || 0
        const fallback = productFallbacks[product.sku] || {}
        const image = product.image_url || fallback.image
        return <article className="product-card" key={product.id}>
          <div className="product-visual">{image ? <img src={image} alt={product.name} style={{objectPosition: fallback.imagePosition || 'center'}} /> : <span className="product-image-empty">尚未設定圖片</span>}<small>{String(productOffset + index + 1).padStart(2, '0')}</small></div>
          <div className="product-info"><p>{product.sku || 'MUSE SELECT'}</p><h3>{product.name}</h3><span>{product.description || '精選沙龍商品'}</span><small className={product.stock_quantity > 0 ? 'stock' : 'stock sold-out'}>{product.stock_quantity > 0 ? `庫存 ${product.stock_quantity} 件` : '目前缺貨'}</small>
            <div className="product-buy"><strong>NT$ {product.price.toLocaleString()}</strong>{quantity === 0
              ? <button disabled={!product.stock_quantity} onClick={() => changeCart(product, 1)}>{product.stock_quantity ? '加入購物袋' : '已售完'} <Plus /></button>
              : <div className="quantity"><button aria-label="減少數量" onClick={() => changeCart(product, -1)}><Minus /></button><b>{quantity}</b><button aria-label="增加數量" disabled={quantity >= product.stock_quantity} onClick={() => changeCart(product, 1)}><Plus /></button></div>}
            </div>
          </div>
        </article>
      })}</div>
        {products.length > 3 && <button type="button" className="product-slide next" aria-label="查看更多商品" disabled={productOffset === maxProductOffset} onClick={() => setProductOffset(current => Math.min(maxProductOffset, current + 1))}><ChevronRight /></button>}
      </div> : <p className="store-message">目前沒有上架商品</p>}
      <section className="checkout" id="cart">
        <div className="checkout-copy"><p className="eyebrow">SHOPPING BAG</p><h3>確認你的訂單</h3><p>售價與庫存會在送出時由系統再次確認，訂單成立後由店家與你聯繫。</p></div>
        {!cartItems.length && !completedOrder ? <div className="cart-empty"><ShoppingBag /><p>購物袋目前沒有商品</p></div> : completedOrder ? <div className="order-success"><Check /><h3>訂單已送出</h3><p>訂單編號 <strong>{completedOrder.order_number}</strong></p><p>總金額 NT$ {Number(completedOrder.total_amount).toLocaleString()}</p><button type="button" onClick={() => setCompletedOrder(null)}>繼續選購</button></div> : <>
          <div className="cart-items">{cartItems.map(item => <div key={item.id}><span>{item.name}<small>NT$ {item.price.toLocaleString()} × {item.quantity}</small></span><strong>NT$ {(item.price * item.quantity).toLocaleString()}</strong><button type="button" aria-label={`移除 ${item.name}`} onClick={() => setCart(current => ({ ...current, [item.id]: 0 }))}><X /></button></div>)}<p>合計 <strong>NT$ {cartTotal.toLocaleString()}</strong></p></div>
          {!account ? <div className="checkout-login"><span className="line-mark">LINE</span><h3>登入後才能送出訂單</h3><p>我們會使用 LINE 會員名稱建立訂單。</p><button type="button" className="line-login" onClick={handleStoreLogin}><span>LINE</span> 登入後結帳</button></div> : <form className="checkout-form" onSubmit={submitOrder}><p>訂購人 <strong>{account.display_name}</strong></p><label>聯絡電話<input name="customer_phone" type="tel" defaultValue={account.phone || ''} required placeholder="09xx-xxx-xxx" /></label><label>訂單備註<textarea name="notes" placeholder="取貨需求或想告訴店家的事項（選填）" /></label><button className="submit" disabled={orderLoading}>{orderLoading ? '訂單送出中…' : <>送出訂單 <ArrowRight /></>}</button></form>}
        </>}
        {storeError && <p className="store-error" role="alert">{storeError}</p>}
      </section>
    </section>

    <section className="booking section" id="booking">
      <div className="booking-intro"><div className="section-label light"><span>05</span> BOOKING</div><p className="eyebrow">MAKE AN APPOINTMENT</p><h2>準備好，遇見<br />全新的自己了嗎？</h2>
        <p>選擇你方便的時間與想做的服務，我會在 24 小時內與你確認預約細節。</p>
        <div className="contact-info"><p>新北市金山區中正路37號1樓・金山農會步行 3 分鐘</p><p>Tue — Sun · 08:00 — 21:00</p></div>
      </div>
      {authLoading ? <div className="booking-form booking-login-required"><span className="member-loading-dark">正在確認會員身分…</span></div> : !account ? <div className="booking-form booking-login-required"><span className="line-mark">LINE</span><h3>請先登入再預約</h3><p>使用 LINE 登入後即可建立會員預約並累積點數。</p><button type="button" className="line-login" onClick={handleBookingLogin}><span>LINE</span> 登入後預約</button>{authError && <small className="booking-auth-error">{authError}</small>}</div> : <form className="booking-form" onSubmit={submit}>
        {sent ? <div className="success"><Check /><h3>收到你的預約了！</h3><p>我會在 24 小時內與你聯絡確認。</p><button type="button" onClick={()=>setSent(false)}>再填一次</button></div> : <>
          <div className="field full"><label>想預約的服務</label><div className="select-wrap"><select name="service" required defaultValue=""><option value="" disabled>請選擇服務項目</option>{services.map(service => <option key={service.name}>{service.name}</option>)}</select><ChevronDown /></div></div>
          <div className="field"><label><CalendarDays /> 日期</label><input name="date" type="date" required /></div>
          <div className="field"><label><Clock3 /> 時間</label><input name="time" type="time" required /></div>
          <div className="field full"><label>聯絡電話</label><input key={`phone-${account.id}`} name="booker_phone" type="tel" defaultValue={account.phone || ''} placeholder="09xx-xxx-xxx" required /></div>
          <div className="field full"><label>想告訴我的事</label><textarea name="notes" placeholder="目前髮況、理想髮型，或任何想先討論的細節…" /></div>
          {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
          <button className="submit" type="submit" disabled={bookingLoading}>{bookingLoading ? '送出中…' : <>送出預約 <ArrowRight /></>}</button>
        </>}
      </form>}
    </section>

    <footer><div><a className="brand" href="#home">MUSE <span>HAIR STUDIO</span></a><p>讓髮型，成為你最自在的樣子。</p></div><div><p>FOLLOW</p><a href="https://instagram.com">Instagram</a><a href="#booking">LINE 預約</a></div><div><p>CONTACT</p><a href="tel:0223456789">02 2345 6789</a><a href="mailto:hello@musehair.tw">hello@musehair.tw</a><a href="#admin">管理後台</a></div><small>© 2026 MUSE HAIR STUDIO</small></footer>
  </main>
}

function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const updateHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', updateHash)
    const returnHash = window.sessionStorage.getItem('line_login_return_hash')
    if (returnHash) {
      window.sessionStorage.removeItem('line_login_return_hash')
      window.location.hash = returnHash
    }
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])
  return hash === '#admin' ? <Admin /> : <App />
}

createRoot(document.getElementById('root')).render(<Root />)
