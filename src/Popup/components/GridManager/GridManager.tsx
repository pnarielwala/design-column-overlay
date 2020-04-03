import React, { Fragment } from 'react'
import { GridDataT } from 'types/Grid'
import { Box, Flex } from 'rebass'

import { useWindowSize } from 'react-use'

type PropsT = {
  grids: GridDataT
}

const GridManager = (props: PropsT) => {
  const { width } = useWindowSize()
  const sortedGrids = Object.entries(props.grids).sort((a, b) => {
    if (+a[0] < +b[0]) {
      return -1
    } else {
      return 1
    }
  })
  const gridEntry =
    sortedGrids.find(([breakpoint]) => {
      if (+breakpoint > width) {
        return true
      } else {
        return false
      }
    }) ?? sortedGrids[sortedGrids.length - 1]
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999999999,
        pointerEvents: 'none',
      }}
    >
      {gridEntry && (
        <Flex height="100%" key={gridEntry[0]} maxWidth="1500px" margin="auto">
          <Box
            minWidth={`${gridEntry[1].margin}px`}
            bg="rgba(0, 0, 255, 0.2)"
          ></Box>
          {[...Array(+gridEntry[1].columns)].map((_, i) => {
            return (
              <Fragment key={i}>
                <Box
                  width="100%"
                  sx={{
                    bg: 'rgba(255, 0, 0, 0.2)',
                  }}
                ></Box>
                {i + 1 < +gridEntry[1].columns && (
                  <Box
                    minWidth={`${gridEntry[1].gutter}px`}
                    bg="rgba(0, 255, 0, 0.2)"
                  />
                )}
              </Fragment>
            )
          })}
          <Box
            minWidth={`${gridEntry[1].margin}px`}
            bg="rgba(0, 0, 255, 0.2)"
          ></Box>
        </Flex>
      )}
    </Box>
  )
}

export default GridManager
