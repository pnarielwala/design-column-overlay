export type GridT = {
  columns: string
  gutter: string
  margin: string
}

export type GridDataT = { [breakpoint: string]: GridT }
