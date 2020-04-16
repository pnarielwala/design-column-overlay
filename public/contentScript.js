var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
function intializeScript() {
    var grids = {};
    var currentGrid;
    var showGrid = false;
    var rootContainer;
    function initGrid() {
        var root = document.getElementById('grid-overlay-root');
        if (!root) {
            var container = document.createElement('div');
            container.setAttribute('id', 'grid-overlay-root');
            container.setAttribute('style', 'position: fixed; ' +
                'top: 0; ' +
                'bottom: 0; ' +
                'left: 0; ' +
                'right: 0; ' +
                'z-index: 999999999; ' +
                'pointer-events: none; ');
            document.body.appendChild(container);
            rootContainer = document.getElementById('grid-overlay-root');
        }
        else {
            rootContainer = root;
        }
        if (rootContainer.children.length > 0) {
            showGrid = true;
        }
    }
    function drawGrid(grid) {
        var flexContainer = document.createElement('div');
        var marginBox = document.createElement('div');
        var gutterBox = document.createElement('div');
        var columnBox = document.createElement('div');
        flexContainer.setAttribute('style', "box-sizing: border-box;\n        min-width: 0px;\n        height: 100%;\n        display: flex;\n        max-width: 1664px;\n        margin: auto;");
        marginBox.setAttribute('style', "box-sizing: border-box;\n        min-width: " + grid.margin + "px;\n        background-color: rgba(100, 100, 100, 0.2);\n        margin: 0px;");
        gutterBox.setAttribute('style', "box-sizing: border-box;\n        min-width: " + grid.gutter + "px;\n        background-color: rgba(100, 100, 100, 0.2);\n        margin: 0px;");
        columnBox.setAttribute('style', "box-sizing: border-box;\n        min-width: 0px;\n        background-color: rgba(255, 0, 0, 0.2);\n        width: 100%;\n        margin: 0px;");
        var root = rootContainer;
        root.innerHTML = '';
        root.appendChild(flexContainer);
        flexContainer.appendChild(marginBox.cloneNode());
        __spreadArrays(Array(+grid.columns)).forEach(function (_, i) {
            flexContainer.appendChild(columnBox.cloneNode());
            i + 1 < +grid.columns && flexContainer.appendChild(gutterBox.cloneNode());
        });
        flexContainer.appendChild(marginBox.cloneNode());
    }
    function updateGrid() {
        var _a;
        var sortedGrids = Object.entries(grids).sort(function (a, b) {
            if (+a[0] < +b[0]) {
                return -1;
            }
            else {
                return 1;
            }
        });
        var gridEntry = (_a = sortedGrids.find(function (_a) {
            var breakpoint = _a[0];
            if (+breakpoint > window.innerWidth) {
                return true;
            }
            else {
                return false;
            }
        })) !== null && _a !== void 0 ? _a : sortedGrids[sortedGrids.length - 1];
        if (gridEntry && currentGrid !== gridEntry[1]) {
            currentGrid = gridEntry[1];
        }
        if (showGrid && currentGrid) {
            drawGrid(currentGrid);
        }
    }
    function removeGrid() {
        rootContainer.innerHTML = '';
    }
    window.onload = initGrid;
    initGrid();
    var resizeHandler = function () {
        updateGrid();
    };
    window.addEventListener('resize', resizeHandler);
    function messageListener(message, sender, sendResponse) {
        if (message.type === 'update_grid') {
            grids = message.data;
            updateGrid();
        }
        else if (message.type === 'get_content_grid') {
            sendResponse({ visible: showGrid, grids: grids });
        }
        else if (message.type === 'grid_visible') {
            showGrid = message.data;
            if (showGrid) {
                initGrid();
                updateGrid();
            }
            else {
                removeGrid();
            }
        }
    }
    window.chrome.runtime.onMessage.addListener(messageListener);
}
if (window.contentScriptInjected !== true) {
    window.contentScriptInjected = true;
    intializeScript();
}
