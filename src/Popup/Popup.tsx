import React, { useState, useEffect } from 'react'

import { Box, Flex, Button } from 'rebass'
import { Input, Switch } from '@rebass/forms'

import GridForm from './components/GridForm'
import { GridT, GridDataT } from 'types/Grid'
import { useEffectOnce } from 'react-use'

type Message =
  | { type: 'update_grid'; data: GridDataT }
  | { type: 'get_content_grid' }
  | { type: 'grid_visible'; data: boolean }

const sendTabMessage = (
  message: Message,
  responseCallback?: (response: any) => void,
) => {
  window.chrome.tabs.query(
    { currentWindow: true, active: true },
    (tabs: any) => {
      const currentTabId: number = tabs[0].id

      window.chrome.tabs.sendMessage(currentTabId, message, responseCallback)
    },
  )
}

const initialGrid: GridT = {
  columns: '1',
  gutter: '0',
  margin: '0',
}

type SettingsT = {
  grids: GridDataT
}

const getLocalSettings = (): SettingsT =>
  JSON.parse(localStorage.getItem('gridSettings') ?? '{}')
const setLocalSettings = (data: SettingsT) => {
  localStorage.setItem('gridSettings', JSON.stringify(data))
}

const Popup = () => {
  const [currentTabId, setCurrentTabId] = useState<number | null>(null)
  const [grids, setGrids] = useState<GridDataT>(getLocalSettings().grids ?? {})

  const [showGridOverlay, setShowGridOverlay] = useState(false)
  const [breakpointInput, setBreakpointInput] = useState('')

  // Initialize currentTabId
  useEffectOnce(() => {
    window.chrome.tabs.query(
      { currentWindow: true, active: true },
      (tabs: any) => {
        const currentTabId: number = tabs[0].id
        setCurrentTabId(currentTabId)

        window.chrome.tabs.executeScript(
          null,
          { file: 'contentScript.js' },
          () => {
            setTimeout(() => {
              console.log('about to send init message', Date.now())
              sendTabMessage(
                { type: 'get_content_grid' },
                (response: { visible: boolean; grids: GridDataT }) => {
                  if (response) {
                    if (Object.keys(response.grids).length > 0) {
                      setGrids(response.grids)
                      setShowGridOverlay(response.visible)
                    } else {
                      sendTabMessage({
                        type: 'update_grid',
                        data: grids || {},
                      })
                    }
                  }
                },
              )
            }, 1)
          },
        )
      },
    )
  })

  // Save grids when popup unmounts
  useEffect(() => {
    setLocalSettings({
      grids,
    })
  }, [grids, currentTabId])

  useEffect(() => {
    if (currentTabId) {
      sendTabMessage({
        type: 'update_grid',
        data: grids || {},
      })
    }
  }, [currentTabId, grids])

  const handleAddGrid = () => {
    if (breakpointInput) {
      setGrids((prevGrids) => ({
        ...prevGrids,
        [breakpointInput]: initialGrid,
      }))

      setBreakpointInput('')
    }
  }

  const handleUpdateGrid = (breakpoint: string, key: string, value: string) => {
    setGrids((prevGrids) => {
      const grid = prevGrids[breakpoint]
      const newGrids = {
        ...prevGrids,
        [breakpoint]: {
          ...grid,
          [key]: value,
        },
      }
      return newGrids
    })
  }

  const handleDeleteGrid = (breakpoint: string) => {
    setGrids((prevGrids) => {
      delete prevGrids[breakpoint]
      return { ...prevGrids }
    })
  }

  const handleToggleGrid = () => {
    const newValue = !showGridOverlay
    setShowGridOverlay(newValue)
    sendTabMessage({ type: 'grid_visible', data: newValue })
  }

  return (
    <Box>
      <Switch checked={showGridOverlay} onClick={handleToggleGrid} />
      <Flex
        as="form"
        onSubmit={(event) => {
          event.preventDefault()
          handleAddGrid()
        }}
        flexWrap="wrap"
        mx={-2}
      >
        <Box width={1 / 2} px={2}>
          <Input
            value={breakpointInput}
            type="number"
            autoFocus
            onChange={(event) => setBreakpointInput(event.target.value)}
          />
        </Box>
        <Box width={1 / 2} px={2}>
          <Button width={1} type="submit">
            Add
          </Button>
        </Box>
      </Flex>
      {Object.entries(grids).map(([breakpoint, grid]) => {
        return (
          <GridForm
            key={breakpoint}
            breakpoint={breakpoint}
            grid={grid}
            updateGrid={handleUpdateGrid}
            deleteGrid={handleDeleteGrid}
          />
        )
      })}
    </Box>
  )
}

export default Popup
