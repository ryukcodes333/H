'use strict'
const express  = require('express')
const mongoose = require('mongoose')
const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcryptjs')
const cors     = require('cors')
const path     = require('path')
const fs       = require('fs')

const app  = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'konosuba-web-secret-change-me'
const MONGO_URI  = process.env.MONGO_URI  || 'mongodb+srv://konosubacommunity1:kono%2Esuba001@cluster-kono.41yglcv.mongodb.net/?appName=Cluster-kono'

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// ── Database ────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(e => console.error('❌ MongoDB error:', e.message))

const userSchema = new mongoose.Schema({
  phone:          { type: String, unique: true, sparse: true },
  name:           { type: String, default: 'Adventurer' },
  password:       { type: String, default: null },
  wallet:         { type: Number, default: 0 },
  bank:           { type: Number, default: 500 },
  bank_limit:     { type: Number, default: 50000 },
  gems:           { type: Number, default: 0 },
  xp:             { type: Number, default: 0 },
  rpg_xp:         { type: Number, default: 0 },
  level:          { type: Number, default: 1 },
  streak:         { type: Number, default: 0 },
  banned:         { type: Boolean, default: false },
  premium:        { type: Boolean, default: false },
  role:           { type: String, default: 'member' },
  title:          { type: String, default: 'Newcomer' },
  bio:            { type: String, default: '' },
  pokemon_badges: { type: Number, default: 0 },
  pokemon_wins:   { type: Number, default: 0 },
  pokemon_losses: { type: Number, default: 0 },
  reputation:     { type: Number, default: 0 },
  class_name:     { type: String, default: null },
  profile_pp:     { type: String, default: null },
  profile_bg:     { type: String, default: null },
  created_at:     { type: Date, default: Date.now },
}, { timestamps: true })

const cooldownSchema = new mongoose.Schema({
  phone:      String,
  command:    String,
  expires_at: Date,
})
cooldownSchema.index({ phone: 1, command: 1 }, { unique: true })

const inventorySchema = new mongoose.Schema({
  phone:    String,
  item:     String,
  quantity: { type: Number, default: 1 },
})
inventorySchema.index({ phone: 1, item: 1 }, { unique: true })

const cardSchema = new mongoose.Schema({
  name:        String,
  tier:        String,
  series:      String,
  price:       { type: Number, default: 35000 },
  image_url:   String,
  rarity:      String,
  external_id: { type: String, sparse: true },
}, { timestamps: true })

const userCardSchema = new mongoose.Schema({
  phone:   String,
  card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  in_deck: { type: Boolean, default: false },
}, { timestamps: true })

const userPokemonSchema = new mongoose.Schema({
  phone:      String,
  name:       String,
  pokemon_id: Number,
  level:      { type: Number, default: 1 },
  hp:         Number,
  max_hp:     Number,
  in_party:   { type: Boolean, default: true },
  is_shiny:   { type: Boolean, default: false },
  types:      { type: [String], default: [] },
  slot:       { type: Number, default: 1 },
}, { timestamps: true })

const User        = mongoose.model('User',        userSchema)
const Cooldown    = mongoose.model('Cooldown',    cooldownSchema)
const Inventory   = mongoose.model('Inventory',   inventorySchema)
const Card        = mongoose.model('Card',        cardSchema)
const UserCard    = mongoose.model('UserCard',    userCardSchema)
const UserPokemon = mongoose.model('UserPokemon', userPokemonSchema)

// ── Card data ────────────────────────────────────────────────────────────────
let cardsMazoku = []
let cardsLegacy = []
try { cardsMazoku = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/cards_mazoku.json'), 'utf8')) } catch {}
try { cardsLegacy = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/cards.json'), 'utf8')) } catch {}

// ── Shop items ───────────────────────────────────────────────────────────────
const SHOP_ITEMS = {
  sword:          { name: 'Sword',            price: 500,    type: 'weapon',    emoji: '⚔️',  desc: 'A trusty iron sword for the bold adventurer.' },
  shield:         { name: 'Shield',           price: 400,    type: 'weapon',    emoji: '🛡️',  desc: 'Block incoming attacks with this sturdy shield.' },
  bow:            { name: 'Bow',              price: 350,    type: 'weapon',    emoji: '🏹',  desc: 'Strike from a distance with deadly precision.' },
  dagger:         { name: 'Dagger',           price: 300,    type: 'weapon',    emoji: '🗡️',  desc: 'A quick and silent blade for rogues.' },
  axe:            { name: 'Battle Axe',       price: 650,    type: 'weapon',    emoji: '🪓',  desc: 'Heavy and devastating in the right hands.' },
  staff_wep:      { name: 'Magic Staff',      price: 700,    type: 'weapon',    emoji: '🪄',  desc: 'Channel your mana with this enchanted staff.' },
  spear:          { name: 'Spear',            price: 550,    type: 'weapon',    emoji: '🔱',  desc: 'Keep enemies at bay with this long spear.' },
  armor:          { name: 'Iron Armor',       price: 800,    type: 'armor',     emoji: '🥋',  desc: 'Solid protection for frontline fighters.' },
  helmet:         { name: 'Steel Helmet',     price: 450,    type: 'armor',     emoji: '⛑️',  desc: 'Protect your head in the heat of battle.' },
  boots:          { name: 'Shadow Boots',     price: 380,    type: 'armor',     emoji: '👟',  desc: 'Lightweight boots that enhance speed.' },
  potion:         { name: 'Health Potion',    price: 100,    type: 'consumable', emoji: '🧪', desc: 'Restore HP during combat.' },
  elixir:         { name: 'Mana Elixir',      price: 120,    type: 'consumable', emoji: '💙', desc: 'Replenish mana for spell casting.' },
  energy:         { name: 'Energy Drink',     price: 80,     type: 'consumable', emoji: '⚡', desc: 'Boost your energy for the next challenge.' },
  antidote:       { name: 'Antidote',         price: 90,     type: 'consumable', emoji: '💊', desc: 'Cure poison and status ailments.' },
  bomb:           { name: 'Shadow Bomb',      price: 200,    type: 'consumable', emoji: '💣', desc: 'Explosive damage in a wide area.' },
  ticket:         { name: 'Luck Ticket',      price: 150,    type: 'tool',      emoji: '🎟️', desc: 'Boost your luck in gambling and draws.' },
  pickaxe:        { name: 'Pickaxe',          price: 280,    type: 'tool',      emoji: '⛏️', desc: 'Mine for rare ores and crystals.' },
  fishingrod:     { name: 'Fishing Rod',      price: 220,    type: 'tool',      emoji: '🎣', desc: 'Catch fish for coins and rare items.' },
  map:            { name: 'Treasure Map',     price: 500,    type: 'tool',      emoji: '🗺️', desc: 'Uncover hidden dungeons and treasure.' },
  lantern:        { name: 'Shadow Lantern',   price: 180,    type: 'tool',      emoji: '🏮', desc: 'Light up dark dungeons safely.' },
  ring:           { name: 'Power Ring',       price: 950,    type: 'accessory', emoji: '💍', desc: 'Amplifies all stats while equipped.' },
  amulet:         { name: 'Mana Amulet',      price: 850,    type: 'accessory', emoji: '📿', desc: 'Reduces mana costs for spells.' },
  cloak:          { name: 'Shadow Cloak',     price: 1200,   type: 'accessory', emoji: '🧣', desc: 'Grants stealth and reduces detection.' },
  bank_note:      { name: 'Bank Note',        price: 10000,  type: 'banking',   emoji: '💵', desc: 'Deposit into your bank.' },
  bank_note_100k: { name: 'Bank Note (100K)', price: 50000,  type: 'banking',   emoji: '💴', desc: 'High-value bank note.' },
  bank_note_500k: { name: 'Bank Note (500K)', price: 100000, type: 'banking',   emoji: '💶', desc: 'Premium bank note.' },
  bank_note_1m:   { name: 'Bank Note (1M)',   price: 500000, type: 'banking',   emoji: '💷', desc: 'Elite bank note for the wealthy.' },
}

// ── Daily config ─────────────────────────────────────────────────────────────
const DAILY_COINS = [20, 23, 26, 30, 35]
const DAILY_GEMS  = [1, 1, 1, 2, 2]
const CD_DAILY    = 24 * 3600 * 1000

// ── Helpers ──────────────────────────────────────────────────────────────────
function cleanPhone(p) { return String(p || '').replace(/\D/g, '') }
function sanitizeUser(u) { const { password, ...r } = u; return r }

function authMiddleware(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try { req.user = jwt.verify(token, JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid or expired token' }) }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    let { phone, name, password } = req.body
    phone = cleanPhone(phone)
    if (!phone || phone.length < 7)  return res.status(400).json({ error: 'Enter a valid phone number (with country code)' })
    if (!password || password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' })

    const exists = await User.findOne({ phone }).lean()
    if (exists && exists.password) return res.status(409).json({ error: 'Account already exists — please log in instead.' })

    const hashed = await bcrypt.hash(String(password), 10)
    let user
    if (exists) {
      await User.updateOne({ phone }, { $set: { password: hashed, name: name || exists.name } })
      user = await User.findOne({ phone }).lean()
    } else {
      const doc = await User.create({ phone, name: name || `Adventurer_${phone.slice(-4)}`, password: hashed })
      user = doc.toObject()
    }

    const token = jwt.sign({ phone: user.phone, name: user.name }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: sanitizeUser(user), message: 'Welcome to Konosuba Bot! Your account is now linked to WhatsApp.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error — please try again' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    let { phone, password } = req.body
    phone = cleanPhone(phone)
    if (!phone) return res.status(400).json({ error: 'Phone number required' })

    const user = await User.findOne({ phone }).lean()
    if (!user)          return res.status(404).json({ error: 'No account found for this number. Sign up first!' })
    if (!user.password) return res.status(400).json({ error: 'No password set — sign up to create one.' })
    if (user.banned)    return res.status(403).json({ error: 'This account has been suspended.' })

    const valid = await bcrypt.compare(String(password), user.password)
    if (!valid) return res.status(401).json({ error: 'Wrong password. Try again.' })

    const token = jwt.sign({ phone: user.phone, name: user.name }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: sanitizeUser(user) })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Profile ───────────────────────────────────────────────────────────────────
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.user.phone }).lean()
    if (!user) return res.status(404).json({ error: 'User not found' })

    const [userCards, pokemon, inventory] = await Promise.all([
      UserCard.find({ phone: req.user.phone }).populate('card_id').limit(50).lean(),
      UserPokemon.find({ phone: req.user.phone }).lean(),
      Inventory.find({ phone: req.user.phone }).lean(),
    ])

    res.json({ user: sanitizeUser(user), cards: userCards, pokemon, inventory })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name, bio } = req.body
    const updates = {}
    if (name && name.trim()) updates.name = name.trim().slice(0, 32)
    if (bio !== undefined)   updates.bio  = String(bio).slice(0, 120)
    await User.updateOne({ phone: req.user.phone }, { $set: updates })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Shop ──────────────────────────────────────────────────────────────────────
app.get('/api/shop', (req, res) => {
  const items = Object.entries(SHOP_ITEMS).map(([id, item]) => ({ id, ...item }))
  res.json({ items })
})

app.post('/api/shop/buy', authMiddleware, async (req, res) => {
  try {
    const { item_id } = req.body
    const item = SHOP_ITEMS[item_id]
    if (!item) return res.status(404).json({ error: 'Item not found' })

    const user = await User.findOne({ phone: req.user.phone }).lean()
    if (!user) return res.status(404).json({ error: 'User not found' })
    if ((user.wallet || 0) < item.price) return res.status(400).json({ error: `Not enough coins! You need ${item.price.toLocaleString()} coins.` })

    await User.updateOne({ phone: req.user.phone }, { $inc: { wallet: -item.price } })
    await Inventory.findOneAndUpdate(
      { phone: req.user.phone, item: item_id },
      { $inc: { quantity: 1 } },
      { upsert: true }
    )

    res.json({ ok: true, message: `🎉 Bought ${item.emoji} ${item.name} for ${item.price.toLocaleString()} coins!` })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Leaderboard ───────────────────────────────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
  try {
    const type = req.query.type || 'xp'
    let sort = {}
    if (type === 'xp')     sort = { xp: -1, level: -1 }
    else if (type === 'coins') sort = { wallet: -1, bank: -1 }
    else if (type === 'level') sort = { level: -1, xp: -1 }
    else if (type === 'wins')  sort = { pokemon_wins: -1 }
    else if (type === 'rep')   sort = { reputation: -1 }

    const users = await User.find({ banned: false })
      .sort(sort).limit(50)
      .select('phone name xp level wallet bank gems pokemon_wins reputation role title premium created_at')
      .lean()

    res.json({ users })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Cards ─────────────────────────────────────────────────────────────────────
app.get('/api/cards', (req, res) => {
  try {
    const { tier, series, search, page = 1, limit = 48, source = 'all' } = req.query
    const pageNum  = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 48))

    let cards = cardsMazoku.map(c => ({
      id:      c.id,
      name:    c.name,
      tier:    c.tier,
      series:  c.seriesName || c.series || 'Unknown',
      imageUrl: c.imageUrl || c.url,
      source:  'mazoku',
    }))

    if (tier)   cards = cards.filter(c => c.tier?.toUpperCase() === tier.toUpperCase())
    if (series) cards = cards.filter(c => c.series?.toLowerCase().includes(series.toLowerCase()))
    if (search) cards = cards.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.series?.toLowerCase().includes(search.toLowerCase()))

    const total = cards.length
    const paginated = cards.slice((pageNum - 1) * limitNum, pageNum * limitNum)
    res.json({ cards: paginated, total, page: pageNum, pages: Math.ceil(total / limitNum) })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Daily ─────────────────────────────────────────────────────────────────────
app.get('/api/daily/status', authMiddleware, async (req, res) => {
  try {
    const [cd, user] = await Promise.all([
      Cooldown.findOne({ phone: req.user.phone, command: 'daily' }),
      User.findOne({ phone: req.user.phone }).select('streak wallet gems').lean(),
    ])
    const now = new Date()
    const streak = user?.streak || 0
    const tierIdx = Math.min(Math.floor(streak / 7), 4)

    if (cd && cd.expires_at > now) {
      return res.json({ available: false, remaining: cd.expires_at - now, streak, nextCoins: DAILY_COINS[tierIdx], nextGems: DAILY_GEMS[tierIdx] })
    }
    res.json({ available: true, streak, nextCoins: DAILY_COINS[tierIdx], nextGems: DAILY_GEMS[tierIdx] })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/daily', authMiddleware, async (req, res) => {
  try {
    const phone = req.user.phone
    const now   = new Date()
    const cd    = await Cooldown.findOne({ phone, command: 'daily' })
    if (cd && cd.expires_at > now) {
      return res.status(429).json({ error: 'Already claimed today!', remaining: cd.expires_at - now })
    }

    const user = await User.findOne({ phone }).lean()
    if (!user) return res.status(404).json({ error: 'User not found' })

    const streak  = (user.streak || 0)
    const tierIdx = Math.min(Math.floor(streak / 7), 4)
    const coins   = DAILY_COINS[tierIdx]
    const gems    = DAILY_GEMS[tierIdx]

    await User.updateOne({ phone }, { $inc: { wallet: coins, gems }, $set: { streak: streak + 1 } })
    await Cooldown.findOneAndUpdate(
      { phone, command: 'daily' },
      { expires_at: new Date(now.getTime() + CD_DAILY) },
      { upsert: true }
    )

    res.json({ ok: true, coins, gems, streak: streak + 1, message: `Claimed ${coins} coins & ${gems} gem${gems !== 1 ? 's' : ''}! 🎉` })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Stats ─────────────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const [totalUsers, totalCards, totalPokemon] = await Promise.all([
      User.countDocuments(),
      UserCard.countDocuments(),
      UserPokemon.countDocuments(),
    ])
    res.json({ totalUsers, totalCards, totalPokemon, totalPokemons: 1025, cardPoolSize: cardsMazoku.length })
  } catch {
    res.json({ totalUsers: 0, totalCards: 0, totalPokemon: 0, totalPokemons: 1025, cardPoolSize: cardsMazoku.length })
  }
})

// ── SPA fallback ──────────────────────────────────────────────────────────────
const pages = ['shop', 'leaderboard', 'pokemons', 'cards', 'profile', 'signup', 'login', 'daily']
pages.forEach(p => {
  app.get(`/${p}`, (req, res) => res.sendFile(path.join(__dirname, 'public', `${p}.html`)))
})
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

app.listen(PORT, () => console.log(`🚀 Konosuba Web running on port ${PORT}`))
