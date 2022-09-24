import React, { useState, useEffect } from 'react';
import { ChromePicker } from 'react-color';

import { Box, Flex, Button, Text } from 'rebass';
import { Input, Switch, Label } from '@rebass/forms';

import GridForm from './components/GridForm';
import { GridT, GridDataT, Message, StoredDataT, SettingsT } from 'types';
import { useEffectOnce } from 'react-use';

// Allow local development without errors
window.chrome = {
  tabs: {
    query: () => {},
    executeScript: () => {},
    sendMessage: () => {},
  },
  ...window.chrome,
};

const sendTabMessage = (
  message: Message,
  responseCallback?: (response: any) => void,
) => {
  window.chrome.tabs.query(
    { currentWindow: true, active: true },
    (tabs: any) => {
      const currentTabId: number = tabs[0].id;

      window.chrome.tabs.sendMessage(currentTabId, message, responseCallback);
    },
  );
};

const initialGrid: GridT = {
  columns: '1',
  gutter: '0',
  margin: '0',
};

const DEFAULT_MAX_WIDTH = '1664';

const getLocalSettings = (): StoredDataT =>
  JSON.parse(localStorage.getItem('gridSettings') ?? '{}');
const setLocalSettings = (data: StoredDataT) => {
  localStorage.setItem('gridSettings', JSON.stringify(data));
};

const Popup = () => {
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [grids, setGrids] = useState<GridDataT>(getLocalSettings().grids ?? {});
  const [settings, setSettings] = useState<SettingsT>(
    getLocalSettings().settings ?? {
      maxWidth: DEFAULT_MAX_WIDTH,
      columnColor: { r: 255, g: 0, b: 0, a: 0.2 },
    },
  );

  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [breakpointInput, setBreakpointInput] = useState('');

  const [settingTab, setSettingTab] = useState<'breakpoints' | 'settings'>(
    'breakpoints',
  );

  useEffectOnce(() => {
    window.chrome.tabs.query(
      { currentWindow: true, active: true },
      (tabs: any) => {
        // Inject contentScript into tabs
        window.chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            files: ['contentScript.js'],
          },
          () => {
            setTimeout(() => {
              // Get grid status on the page
              sendTabMessage(
                { type: 'get_content_grid' },
                (response: {
                  visible: boolean;
                  grids: GridDataT;
                  settings: SettingsT;
                }) => {
                  if (response) {
                    setShowGridOverlay(response.visible);
                  }

                  // Initialize currentTabId
                  const currentTabId: number = tabs[0].id;
                  setCurrentTabId(currentTabId);

                  if (response) {
                    if (Object.keys(response.grids).length > 0) {
                      setGrids(response.grids);
                      setSettings(response.settings);
                    } else {
                      sendTabMessage({
                        type: 'update_grid',
                        data: { grids, settings },
                      });
                    }
                  }
                },
              );
            }, 1);
          },
        );
      },
    );
  });

  // Save grids whenever values change
  useEffect(() => {
    if (currentTabId) {
      setLocalSettings({
        grids,
        settings,
      });
    }
  }, [grids, currentTabId, settings]);

  // Update grid setting on page
  useEffect(() => {
    if (currentTabId) {
      sendTabMessage({
        type: 'update_grid',
        data: { grids, settings },
      });
    }
  }, [currentTabId, grids, settings]);

  const handleAddGrid = () => {
    if (breakpointInput) {
      setGrids((prevGrids) => ({
        ...prevGrids,
        [breakpointInput]: initialGrid,
      }));

      setBreakpointInput('');
    }
  };

  const handleUpdateGrid = (breakpoint: string, key: string, value: string) => {
    setGrids((prevGrids) => {
      const grid = prevGrids[breakpoint];
      const newGrids = {
        ...prevGrids,
        [breakpoint]: {
          ...grid,
          [key]: value,
        },
      };
      return newGrids;
    });
  };

  const handleDeleteGrid = (breakpoint: string) => {
    setGrids((prevGrids) => {
      delete prevGrids[breakpoint];
      return { ...prevGrids };
    });
  };

  const handleToggleGrid = () => {
    const newValue = !showGridOverlay;
    setShowGridOverlay(newValue);
    sendTabMessage({ type: 'grid_visible', data: newValue });
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mt={3}>
        <Text fontWeight="bold" fontSize={17}>
          Enable grid:
        </Text>
        <Switch checked={showGridOverlay} onClick={handleToggleGrid} />
      </Flex>

      <Flex alignItems="center" mt={4}>
        <Button
          fontWeight="bold"
          fontSize={21}
          mr={2}
          sx={{
            backgroundColor: 'transparent',
            p: 0,
          }}
          color={settingTab === 'breakpoints' ? 'black' : '#999999'}
          onClick={() => setSettingTab('breakpoints')}
        >
          Breakpoints
        </Button>
        <Button
          fontWeight="bold"
          fontSize={21}
          color={settingTab === 'settings' ? 'black' : '#999999'}
          sx={{
            backgroundColor: 'transparent',
            p: 0,
          }}
          onClick={() => setSettingTab('settings')}
        >
          Settings
        </Button>
      </Flex>

      {settingTab === 'breakpoints' && (
        <>
          <Flex
            as="form"
            onSubmit={(event) => {
              event.preventDefault();
              handleAddGrid();
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
                max={Number.POSITIVE_INFINITY}
                min={0}
                onChange={(event) => setBreakpointInput(event.target.value)}
              />
            </Box>
            <Box width={2 / 3} px={2}>
              <Button width={1} type="submit" sx={{ cursor: 'pointer' }}>
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
            );
          })}
        </>
      )}

      {settingTab === 'settings' && (
        <>
          <Flex flexWrap="wrap" my={2}>
            <Box width={1 / 3}>
              <Label>Max width</Label>
              <Input
                type="number"
                max={30000}
                min={0}
                value={settings.maxWidth}
                name="maxWidth"
                onChange={(event) => {
                  const value = event.target.value;
                  setSettings((prevSettings) => ({
                    ...prevSettings,
                    maxWidth: value,
                  }));
                }}
              />
            </Box>
            <Box width={1} mt={3}>
              <Label>Column color</Label>
              <Box mt={2}>
                <ChromePicker
                  color={settings.columnColor}
                  onChangeComplete={(color) => {
                    const value = color;
                    setSettings((prevSettings) => ({
                      ...prevSettings,
                      columnColor: value.rgb,
                    }));
                  }}
                />
              </Box>
            </Box>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Popup;
