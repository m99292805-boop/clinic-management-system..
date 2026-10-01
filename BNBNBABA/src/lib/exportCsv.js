import { calcTotals } from './utils'

// يهرب أي قيمة قبل ما تنحط بخلية CSV: يحيطها بعلامات اقتباس لو فيها فاصلة/سطر جديد/علامة اقتباس،
// ويضاعف أي علامة اقتباس داخلية (القاعدة القياسية لصيغة CSV — RFC 4180)
function escapeCsvField(value) {
  const str = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export function exportPatientsToCsv(patients, lang) {
  const headers =
    lang === 'ar'
      ? ['الاسم', 'الهاتف', 'العمر', 'الموعد القادم', 'إجمالي التكلفة', 'إجمالي المدفوع', 'المتبقي']
      : ['Name', 'Phone', 'Age', 'Next Appointment', 'Total Cost', 'Total Paid', 'Remaining']

  const rows = patients.map((p) => {
    const { totalCost, totalPaid, remaining } = calcTotals(p)
    return [p.name, p.phone, p.age, p.nextAppointment || '', totalCost, totalPaid, remaining]
  })

  const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\r\n')

  // BOM (Byte Order Mark) ضروري حتى Excel يعرض النص العربي صحيح بدل رموز غريبة
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const dateStr = new Date().toISOString().slice(0, 10)
  link.download = `patients_${dateStr}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
