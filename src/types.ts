export interface HSLColor {
  a?: number
  h: number
  l: number
  s: number
}

export interface RGBColor {
  a?: number
  b: number
  g: number
  r: number
}

export type Color = RGBColor

export type GridT = {
  columns: string
  gutter: string
  margin: string
}

export type GridDataT = { [breakpoint: string]: GridT }

export type SettingsT = {
  maxWidth: string
  columnColor: Color
}

export type StoredDataT = {
  grids?: GridDataT
  settings?: SettingsT
}

export type Message =
  | { type: 'update_grid'; data: StoredDataT }
  | { type: 'get_content_grid' }
  | { type: 'grid_visible'; data: boolean }
