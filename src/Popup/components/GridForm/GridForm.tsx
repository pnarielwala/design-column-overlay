import React from 'react'

import { Box, Flex, Button, Text } from 'rebass'
import { Label, Input, Select } from '@rebass/forms'

type PropsT = {
  breakpoint: string
  grid: {
    columns: string
    gutter: string
    margin: string
  }
  updateGrid: (breakpoint: string, key: string, value: string) => void
  deleteGrid: (breakpoint: string) => void
}

const GridForm = (props: PropsT) => (
  <Flex flexWrap="wrap" my={3} mx={-2} alignItems="flex-end">
    <Box width={1 / 5} px={2}>
      <Label>Breakpoint</Label>
      <Text fontWeight="bold" py={2}>
        {props.breakpoint}
      </Text>
    </Box>
    <Box width={1 / 5} px={2}>
      <Label htmlFor="columns">Columns</Label>
      <Select
        id="columns"
        name="columns"
        value={props.grid.columns}
        onChange={(event) =>
          props.updateGrid(
            props.breakpoint,
            event.currentTarget.name,
            event.target.value,
          )
        }
      >
        {[...Array(16)].map((_, index) => (
          <option key={index + 1}>{index + 1}</option>
        ))}
      </Select>
    </Box>
    <Box width={1 / 5} px={2}>
      <Label>Gutter</Label>
      <Input
        type="number"
        max={100}
        min={0}
        value={props.grid.gutter}
        name="gutter"
        onChange={(event) =>
          props.updateGrid(
            props.breakpoint,
            event.currentTarget.name,
            event.target.value,
          )
        }
      />
    </Box>
    <Box width={1 / 5} px={2}>
      <Label>Margin</Label>
      <Input
        type="number"
        max={100}
        min={0}
        value={props.grid.margin}
        name="margin"
        onChange={(event) =>
          props.updateGrid(
            props.breakpoint,
            event.currentTarget.name,
            event.target.value,
          )
        }
      />
    </Box>
    <Box width={1 / 5} px={2}>
      <Button
        bg="red"
        width={1}
        onClick={() => props.deleteGrid(props.breakpoint)}
      >
        Delete
      </Button>
    </Box>
  </Flex>
)

export default GridForm
