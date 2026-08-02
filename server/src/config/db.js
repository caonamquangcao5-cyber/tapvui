import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Data lives OUTSIDE the code directory to prevent accidental deletion
// Gym/          → code only
// Gym_data/     → data only (sibling of Gym/)
// On hosting: set DATA_DIR env var to a persistent volume path
// __dirname = Gym/server/src/config → 4 levels up = Desktop
const projectRoot = path.join(__dirname, '..', '..', '..', '..')
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(projectRoot, 'Gym_data')
const dbPath = path.join(dataDir, 'tapvui.json')
const bakDir = path.join(dataDir, 'backups')
const MAX_BACKUPS = 10

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
if (!fs.existsSync(bakDir)) {
  fs.mkdirSync(bakDir, { recursive: true })
}

// Write protection marker file
const lockPath = path.join(dataDir, 'DO_NOT_DELETE.txt')
if (!fs.existsSync(lockPath)) {
  fs.writeFileSync(lockPath,
    '⚠️ THƯ MỤC NÀY CHỨA DỮ LIỆU HỆ THỐNG TẬP VUI\n' +
    '⚠️ KHÔNG ĐƯỢC XÓA, ĐỔI TÊN, HAY DI CHUYỂN THƯ MỤC NÀY\n' +
    '⚠️ NẾU XÓA, TOÀN BỘ DỮ LIỆU SẼ MẤT VĨNH VIỄN\n'
  )
}

const initialData = {
  users: [],
  students: [],
  workouts: [],
  checkins: [],
  badges: [],
  _seq: { users: 0, students: 0, workouts: 0, checkins: 0, badges: 0 },
}

function validateData(obj) {
  if (!obj || typeof obj !== 'object') return false
  if (!Array.isArray(obj.users)) return false
  if (!Array.isArray(obj.students)) return false
  if (!Array.isArray(obj.workouts)) return false
  if (!Array.isArray(obj.checkins)) return false
  if (!Array.isArray(obj.badges)) return false
  if (!obj._seq || typeof obj._seq !== 'object') return false
  return true
}

function loadData() {
  // Try main file first
  if (fs.existsSync(dbPath)) {
    try {
      const raw = fs.readFileSync(dbPath, 'utf-8')
      if (raw.trim().length === 0) throw new Error('File rỗng')
      const parsed = JSON.parse(raw)
      if (validateData(parsed)) {
        return parsed
      }
      console.warn('⚠️ File dữ liệu không hợp lệ, thử đọc backup...')
    } catch (e) {
      console.warn('⚠️ Không đọc được file dữ liệu:', e.message)
      console.warn('⚠️ Thử đọc backup...')
    }
  }

  // Try .bak file
  const bakPath = path.join(dataDir, 'tapvui.json.bak')
  if (fs.existsSync(bakPath)) {
    try {
      const raw = fs.readFileSync(bakPath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (validateData(parsed)) {
        console.log('✅ Khôi phục dữ liệu từ .bak thành công')
        return parsed
      }
    } catch (e) {
      console.warn('⚠️ File .bak cũng hỏng:', e.message)
    }
  }

  // Try timestamped backups (newest first)
  try {
    const backups = fs.readdirSync(bakDir)
      .filter(f => f.startsWith('tapvui_') && f.endsWith('.json'))
      .sort()
      .reverse()
    for (const f of backups) {
      try {
        const raw = fs.readFileSync(path.join(bakDir, f), 'utf-8')
        const parsed = JSON.parse(raw)
        if (validateData(parsed)) {
          console.log(`✅ Khôi phục dữ liệu từ backup ${f} thành công`)
          return parsed
        }
      } catch {
        // try next backup
      }
    }
  } catch {
    // no backup dir
  }

  console.warn('🆕 Không có dữ liệu cũ, tạo file mới')
  return JSON.parse(JSON.stringify(initialData))
}

let data = loadData()
let saveInProgress = false

function save() {
  // Prevent concurrent writes
  if (saveInProgress) return
  saveInProgress = true

  try {
    const json = JSON.stringify(data, null, 2)
    const tmpPath = dbPath + '.tmp'

    // Write to temp file first (atomic write)
    fs.writeFileSync(tmpPath, json, 'utf-8')

    // Verify temp file is valid before replacing
    const verify = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'))
    if (!validateData(verify)) {
      throw new Error('Dữ liệu ghi ra không hợp lệ')
    }

    // Backup current file before overwriting
    if (fs.existsSync(dbPath)) {
      // Copy to .bak
      fs.copyFileSync(dbPath, path.join(dataDir, 'tapvui.json.bak'))

      // Copy to timestamped backup
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      const tsBakPath = path.join(bakDir, `tapvui_${ts}.json`)
      fs.copyFileSync(dbPath, tsBakPath)

      // Clean old backups (keep MAX_BACKUPS newest)
      try {
        const oldBackups = fs.readdirSync(bakDir)
          .filter(f => f.startsWith('tapvui_') && f.endsWith('.json'))
          .sort()
          .reverse()
        for (let i = MAX_BACKUPS; i < oldBackups.length; i++) {
          fs.unlinkSync(path.join(bakDir, oldBackups[i]))
        }
      } catch {
        // non-critical
      }
    }

    // Atomic rename: temp → main
    fs.renameSync(tmpPath, dbPath)
  } catch (e) {
    console.error('❌ Lỗi khi lưu dữ liệu:', e.message)
    // Try to preserve existing file — don't overwrite with bad data
    const tmpPath = dbPath + '.tmp'
    if (fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath) } catch {}
    }
  } finally {
    saveInProgress = false
  }
}

// Ensure file exists on first run
if (!fs.existsSync(dbPath)) {
  save()
}

// Auto-create default PT if missing
const ptPhone = '0909993708'
const existingPT = data.users.find(u => u.phone === ptPhone)
if (!existingPT) {
  const hashed = bcrypt.hashSync('1', 10)
  const id = (data._seq.users || 0) + 1
  data.users.push({
    id,
    name: 'PT',
    phone: ptPhone,
    password: hashed,
    role: 'pt',
    avatar: '',
    created_at: new Date().toISOString(),
  })
  data._seq.users = id
  save()
}

// Auto-create default Owner if missing
const ownerPhone = '0358013019'
const existingOwner = data.users.find(u => u.phone === ownerPhone)
if (!existingOwner) {
  const hashed = bcrypt.hashSync('140899', 10)
  const id = (data._seq.users || 0) + 1
  data.users.push({
    id,
    name: 'Owner',
    phone: ownerPhone,
    password: hashed,
    role: 'owner',
    avatar: '',
    created_at: new Date().toISOString(),
  })
  data._seq.users = id
  save()
}

function nextId(table) {
  data._seq[table] = (data._seq[table] || 0) + 1
  return data._seq[table]
}

const db = {
  insert(table, row) {
    const id = row.id || nextId(table)
    const newRow = { ...row, id, created_at: new Date().toISOString() }
    data[table].push(newRow)
    save()
    return { lastInsertRowid: id, changes: 1 }
  },

  find(table, predicate) {
    return data[table].find(predicate)
  },

  findAll(table, predicate) {
    if (!predicate) return [...data[table]]
    return data[table].filter(predicate)
  },

  update(table, predicate, changes) {
    let count = 0
    data[table].forEach(row => {
      if (predicate(row)) {
        Object.assign(row, changes)
        count++
      }
    })
    if (count > 0) save()
    return { changes: count }
  },

  count(table, predicate) {
    if (!predicate) return data[table].length
    return data[table].filter(predicate).length
  },

  save,
  raw: () => data,

  exportData() {
    return JSON.parse(JSON.stringify(data))
  },

  importData(newData) {
    if (!validateData(newData)) {
      return { success: false, error: 'Dữ liệu không hợp lệ' }
    }
    data = newData
    save()
    return { success: true }
  },
}

export default db
