// 日期格式化
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 分页计算
export function calculatePagination(items, currentPage, pageSize) {
  // 防御性检查：确保 items 是数组
  const safeItems = Array.isArray(items) ? items : []

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = safeItems.slice(startIndex, endIndex)
  const totalPages = Math.ceil(safeItems.length / pageSize) || 1

  return {
    items: paginatedItems,
    totalPages,
    currentPage,
    pageSize,
    total: safeItems.length
  }
}

// 数组筛选
export function filterArray(array, filters) {
  return array.filter(item => {
    return Object.keys(filters).every(key => {
      const filterValue = filters[key]
      if (filterValue === '' || filterValue === null || filterValue === undefined) {
        return true
      }
      const itemValue = item[key]
      if (typeof itemValue === 'string') {
        return itemValue.includes(filterValue)
      }
      return itemValue == filterValue
    })
  })
}
