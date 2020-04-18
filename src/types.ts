export type GridT = {
  columns: string
  gutter: string
  margin: string
}

export type GridDataT = { [breakpoint: string]: GridT }

export type Message =
  | { type: 'update_grid'; data: GridDataT }
  | { type: 'get_content_grid' }
  | { type: 'grid_visible'; data: boolean }
