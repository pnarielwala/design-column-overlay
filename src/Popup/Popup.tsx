import React, { useState, useEffect } from 'react'

import { Box, Flex, Button, Text } from 'rebass'
import { Input, Switch } from '@rebass/forms'

import GridForm from './components/GridForm'
import { GridT, GridDataT, Message } from 'types'
import { useEffectOnce } from 'react-use'

// Allow local development without errors
window.chrome = {
  tabs: {
    query: () => {},
    executeScript: () => {},
    sendMessage: () => {},
  },
  ...window.chrome,
}

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

  useEffectOnce(() => {
    window.chrome.tabs.query(
      { currentWindow: true, active: true },
      (tabs: any) => {
        // Initialize currentTabId
        const currentTabId: number = tabs[0].id
        setCurrentTabId(currentTabId)

        // Inject contentScript into tabs
        window.chrome.tabs.executeScript(
          null,
          { file: 'contentScript.js' },
          () => {
            setTimeout(() => {
              // Get grid status on the page
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

  // Update grid setting on page
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
      <Flex justifyContent="space-between" alignItems="center" mt={3}>
        <Text fontWeight="bold" fontSize={17}>
          Enable grid:
        </Text>
        <Switch checked={showGridOverlay} onClick={handleToggleGrid} />
      </Flex>

      <Text width="100%" fontWeight="bold" fontSize={21} pt={4}>
        Breakpoints
      </Text>
      <Flex
        as="form"
        onSubmit={(event) => {
          event.preventDefault()
          handleAddGrid()
        }}
        flexWrap="wrap"
        my={3}
        pt={2}
        mx={-2}
      >
        <Box width={1 / 3} px={2}>
          <Input
            value={breakpointInput}
            type="number"
            autoFocus
            onChange={(event) => setBreakpointInput(event.target.value)}
          />
        </Box>
        <Box width={2 / 3} px={2}>
          <Button width={1} type="submit">
            Add breakpoint
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
