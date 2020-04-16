import { GridDataT, GridT } from './Grid'

declare global {
  interface Window {
    chrome: any
    contentScriptInjected: boolean
  }
}

function intializeScript() {
  let grids: GridDataT = {}
  let currentGrid: GridT
  let showGrid: boolean = false
  let rootContainer: HTMLElement

  function initGrid() {
    const root = document.getElementById('grid-overlay-root')
    if (!root) {
      const container = document.createElement('div')

      container.setAttribute('id', 'grid-overlay-root')

      container.setAttribute(
        'style',
        'position: fixed; ' +
          'top: 0; ' +
          'bottom: 0; ' +
          'left: 0; ' +
          'right: 0; ' +
          'z-index: 999999999; ' +
          'pointer-events: none; ',
      )

      document.body.appendChild(container)

      rootContainer = document.getElementById('grid-overlay-root')
    } else {
      rootContainer = root
    }

    if (rootContainer.children.length > 0) {
      showGrid = true
    }
  }

  function drawGrid(grid: GridT) {
    const flexContainer = document.createElement('div')
    const marginBox = document.createElement('div')
    const gutterBox = document.createElement('div')
    const columnBox = document.createElement('div')

    flexContainer.setAttribute(
      'style',
      `box-sizing: border-box;
        min-width: 0px;
        height: 100%;
        display: flex;
        max-width: 1664px;
        margin: auto;`,
    )

    marginBox.setAttribute(
      'style',
      `box-sizing: border-box;
        min-width: ${grid.margin}px;
        background-color: rgba(100, 100, 100, 0.2);
        margin: 0px;`,
    )

    gutterBox.setAttribute(
      'style',
      `box-sizing: border-box;
        min-width: ${grid.gutter}px;
        background-color: rgba(100, 100, 100, 0.2);
        margin: 0px;`,
    )

    columnBox.setAttribute(
      'style',
      `box-sizing: border-box;
        min-width: 0px;
        background-color: rgba(255, 0, 0, 0.2);
        width: 100%;
        margin: 0px;`,
    )

    const root = rootContainer

    root.innerHTML = ''

    root.appendChild(flexContainer)

    flexContainer.appendChild(marginBox.cloneNode())
    ;[...Array(+grid.columns)].forEach((_, i) => {
      flexContainer.appendChild(columnBox.cloneNode())
      i + 1 < +grid.columns && flexContainer.appendChild(gutterBox.cloneNode())
    })
    flexContainer.appendChild(marginBox.cloneNode())
  }

  function updateGrid() {
    const sortedGrids = Object.entries(grids).sort((a, b) => {
      if (+a[0] < +b[0]) {
        return -1
      } else {
        return 1
      }
    })
    const gridEntry =
      sortedGrids.find(([breakpoint]) => {
        if (+breakpoint > window.innerWidth) {
          return true
        } else {
          return false
        }
      }) ?? sortedGrids[sortedGrids.length - 1]

    if (gridEntry && currentGrid !== gridEntry[1]) {
      currentGrid = gridEntry[1]
    }

    if (showGrid && currentGrid) {
      drawGrid(currentGrid)
    }
  }

  function removeGrid() {
    rootContainer.innerHTML = ''
  }

  window.onload = initGrid

  initGrid()

  const resizeHandler = () => {
    updateGrid()
  }

  window.addEventListener('resize', resizeHandler)

  type Message =
    | { type: 'update_grid'; data: GridDataT }
    | { type: 'get_content_grid' }
    | { type: 'grid_visible'; data: boolean }

  function messageListener(message: Message, sender: any, sendResponse: any) {
    if (message.type === 'update_grid') {
      grids = message.data

      updateGrid()
    } else if (message.type === 'get_content_grid') {
      sendResponse({ visible: showGrid, grids })
    } else if (message.type === 'grid_visible') {
      showGrid = message.data
      if (showGrid) {
        initGrid()
        updateGrid()
      } else {
        removeGrid()
      }
    }
  }

  window.chrome.runtime.onMessage.addListener(messageListener)
}

if (window.contentScriptInjected !== true) {
  window.contentScriptInjected = true // global scope

  intializeScript()
}
