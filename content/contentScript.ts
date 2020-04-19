import { GridDataT, GridT, Message, SettingsT } from '../src/types'

declare global {
  interface Window {
    chrome: any
    contentScriptInjected: boolean
  }
}

function intializeScript() {
  const initSettings: SettingsT = {
    maxWidth: '1664',
    columnColor: { r: 255, g: 0, b: 0, a: 0.2 },
  }
  let grids: GridDataT = {}
  let settings: SettingsT = initSettings
  let showGrid: boolean = Boolean(document.getElementById('grid-overlay-root'))

  function drawGrid(grid: GridT) {
    const existingRoot = document.getElementById('grid-overlay-root')
    if (existingRoot) {
      existingRoot.remove()
    }
    const rootContainer = document.createElement('div')
    const flexContainer = document.createElement('div')
    const marginBox = document.createElement('div')
    const gutterBox = document.createElement('div')
    const columnBox = document.createElement('div')

    rootContainer.setAttribute('id', 'grid-overlay-root')
    rootContainer.setAttribute(
      'style',
      'position: fixed; ' +
        'top: 0; ' +
        'bottom: 0; ' +
        'left: 0; ' +
        'right: 0; ' +
        'z-index: 999999999; ' +
        'pointer-events: none; ',
    )

    flexContainer.setAttribute(
      'style',
      `box-sizing: border-box;
        min-width: 0px;
        height: 100%;
        display: flex;
        max-width: ${settings.maxWidth}px;
        margin: auto;`,
    )

    marginBox.setAttribute(
      'style',
      `box-sizing: border-box;
        min-width: ${grid.margin}px;
        margin: 0px;`,
    )

    gutterBox.setAttribute(
      'style',
      `box-sizing: border-box;
        min-width: ${grid.gutter}px;
        margin: 0px;`,
    )

    columnBox.setAttribute(
      'style',
      `box-sizing: border-box;
        min-width: 0px;
        background-color: rgba(${settings.columnColor.r}, ${
        settings.columnColor.g
      }, ${settings.columnColor.b}, ${settings.columnColor.a || 1});
        width: 100%;
        margin: 0px;`,
    )

    rootContainer.appendChild(flexContainer)

    flexContainer.appendChild(marginBox.cloneNode())
    ;[...Array(+grid.columns)].forEach((_, i) => {
      flexContainer.appendChild(columnBox.cloneNode())
      i + 1 < +grid.columns && flexContainer.appendChild(gutterBox.cloneNode())
    })
    flexContainer.appendChild(marginBox.cloneNode())

    document.body.appendChild(rootContainer)
  }

  function updateGrid() {
    // Sort grids by breakpoint
    const sortedGrids = Object.entries(grids).sort((a, b) => {
      if (+a[0] < +b[0]) {
        return -1
      } else {
        return 1
      }
    })

    // Find grid within current width
    const gridEntry =
      sortedGrids.find(([breakpoint]) => {
        if (+breakpoint > window.innerWidth) {
          return true
        } else {
          return false
        }
      }) ?? sortedGrids[sortedGrids.length - 1]

    const currentGrid = gridEntry?.[1]

    if (showGrid && currentGrid) {
      drawGrid(currentGrid)
    }
  }

  function removeGrid() {
    document.getElementById('grid-overlay-root')?.remove()
  }

  const resizeHandler = () => {
    updateGrid()
  }

  window.addEventListener('resize', resizeHandler)

  function messageListener(message: Message, sender: any, sendResponse: any) {
    if (message.type === 'update_grid') {
      grids = message.data.grids ?? {}
      settings = message.data.settings ?? initSettings

      updateGrid()
    } else if (message.type === 'get_content_grid') {
      sendResponse({
        visible: showGrid,
        grids,
        settings,
      })
    } else if (message.type === 'grid_visible') {
      showGrid = message.data
      if (showGrid) {
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
