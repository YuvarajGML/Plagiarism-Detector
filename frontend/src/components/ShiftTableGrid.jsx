import React, { useState } from 'react'
import { SHIFT_TABLE } from '../data/mockData'

// Character descriptions for control characters and common symbols
const getCharDescription = (code) => {
  if (code === 32) return "Space (SPC)"
  if (code < 32) {
    const controls = ["NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS", "TAB", "LF", "VT", "FF", "CR", "SO", "SI", "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US"]
    return `${controls[code]} (Control)`
  }
  if (code === 127) return "DEL (Delete)"
  if (code > 127) return `Extended ASCII ${code}`
  return `Character '${String.fromCharCode(code)}'`
}

const getCharLabel = (code) => {
  if (code === 32) return "SPC"
  if (code < 32) {
    const controls = ["NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS", "TAB", "LF", "VT", "FF", "CR", "SO", "SI", "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US"]
    return controls[code]
  }
  if (code === 127) return "DEL"
  if (code > 127) return `•`
  return String.fromCharCode(code)
}

export default function ShiftTableGrid() {
  const [hoveredCell, setHoveredCell] = useState(null)

  // Generate 256 ASCII cells
  const cells = Array.from({ length: 256 }, (_, index) => {
    const char = String.fromCharCode(index).toLowerCase()
    // If it's in SHIFT_TABLE, get it, else default max shift is 16
    const shift = SHIFT_TABLE[char] !== undefined ? SHIFT_TABLE[char] : 16
    return {
      code: index,
      label: getCharLabel(index),
      desc: getCharDescription(index),
      shift
    }
  })

  // Linearly interpolate color between White (shift=1) and Teal rgb(2, 128, 144) (shift=16)
  const getCellStyles = (shift) => {
    const ratio = (shift - 1) / (16 - 1)
    const r = Math.round(255 - (255 - 2) * ratio)
    const g = Math.round(255 - (255 - 128) * ratio)
    const b = Math.round(255 - (255 - 144) * ratio)

    const bg = `rgb(${r}, ${g}, ${b})`
    // Text color should be white for darker teal backgrounds (shift > 8)
    const text = shift > 8 ? 'rgba(255, 255, 255, 0.95)' : '#334155'
    const border = shift === 1 ? '1px solid #E2E8F0' : `1px solid rgba(${r-20}, ${g-20}, ${b-20}, 0.2)`

    return { backgroundColor: bg, color: text, border }
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Bad-Character Shift Table
        </h3>
        <span className="text-[10px] text-text-secondary bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          Horspool
        </span>
      </div>

      {/* Grid container */}
      <div className="relative">
        <div
          style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
          className="grid gap-[2px] bg-slate-50 p-2 rounded-xl border border-slate-200 justify-center"
        >
          {cells.map((cell) => {
            const style = getCellStyles(cell.shift)
            return (
              <div
                key={cell.code}
                onMouseEnter={() => setHoveredCell(cell)}
                onMouseLeave={() => setHoveredCell(null)}
                style={style}
                className="w-[17px] h-[17px] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px] lg:w-[15px] lg:h-[15px] xl:w-[17px] xl:h-[17px] 2xl:w-[19px] 2xl:h-[19px] flex flex-col items-center justify-center rounded-[2px] cursor-crosshair transition-all duration-150 hover:scale-125 hover:z-10 hover:shadow-md"
              >
                {/* Visual tiny indicator for shift value */}
                <span className="text-[6px] scale-[0.75] font-bold leading-none select-none">
                  {cell.shift}
                </span>
              </div>
            )
          })}
        </div>

        {/* Floating character tooltip */}
        {hoveredCell && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded shadow-lg border border-slate-700 z-20 flex flex-col items-center pointer-events-none whitespace-nowrap">
            <span className="font-semibold">{hoveredCell.desc}</span>
            <span className="text-slate-300 font-mono text-[9px] mt-0.5">
              ASCII: {hoveredCell.code} | Shift: {hoveredCell.shift} chars
            </span>
          </div>
        )}
      </div>

      {/* Color Scale Legend */}
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-center text-[9px] text-text-secondary font-medium">
          <span>Low shift (1)</span>
          <span>High shift (16)</span>
        </div>
        <div className="h-1.5 w-full rounded bg-gradient-to-r from-white via-primary-light to-primary border border-slate-200"></div>
      </div>
    </div>
  )
}
