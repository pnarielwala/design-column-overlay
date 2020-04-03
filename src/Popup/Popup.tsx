import React, { useState, useEffect } from 'react'

import { Box, Flex, Button } from 'rebass'
import { Input, Switch } from '@rebass/forms'

import GridForm from './components/GridForm'
import { GridT, GridDataT } from 'types/Grid'
import GridContainer from './components/GridContainer'
import GridManager from './components/GridManager'

const initialGrid: GridT = {
  columns: '1',
  gutter: '0',
  margin: '0',
}

const Popup = () => {
  const [showGridOverlay, setShowGridOverlay] = useState(false)

  const [breakpointInput, setBreakpointInput] = useState('')
  const [grids, setGrids] = useState<GridDataT>(
    JSON.parse(localStorage.getItem('gridSettings') || '{}'),
  )

  useEffect(() => {
    localStorage.setItem('gridSettings', JSON.stringify(grids))
  }, [grids])

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

  return (
    <Box>
      <Switch
        checked={showGridOverlay}
        onClick={() => setShowGridOverlay(!showGridOverlay)}
      />
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
      <GridContainer>
        {showGridOverlay && <GridManager grids={grids}></GridManager>}
      </GridContainer>
    </Box>
  )
}

export default Popup
