// ============================================================================
// Excel Workspace - Client-Side Processing
// ============================================================================

// State Management
let workbook = null;
let currentSheet = null;
let currentSheetName = null;
let spreadsheetData = [];
let selectedCell = null;
let fileName = 'Untitled Spreadsheet';
const charts = [];

// Theme Management
let darkMode = localStorage.getItem('darkMode') === 'true';

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeEventListeners();
    loadFromStorage();
});

// ============================================================================
// Theme Management
// ============================================================================

function initializeTheme() {
    if (darkMode) {
        document.documentElement.classList.add('dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }
}

function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark');

    const icon = document.getElementById('theme-icon');
    icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
}

// ============================================================================
// Event Listeners
// ============================================================================

function initializeEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // File upload
    document.getElementById('upload-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', handleFileUpload);

    // Drop zone
    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Sheet operations
    document.getElementById('new-sheet-btn').addEventListener('click', createNewSheet);
    document.getElementById('add-row-btn').addEventListener('click', addRow);
    document.getElementById('add-column-btn').addEventListener('click', addColumn);
    document.getElementById('clear-btn').addEventListener('click', clearSheet);

    // Export buttons
    document.getElementById('export-excel-btn').addEventListener('click', () => exportFile('xlsx'));
    document.getElementById('export-csv-btn').addEventListener('click', () => exportFile('csv'));
    document.getElementById('export-pdf-btn').addEventListener('click', () => exportFile('pdf'));
    document.getElementById('export-json-btn').addEventListener('click', () => exportFile('json'));

    // Formula bar
    document.getElementById('apply-formula-btn').addEventListener('click', applyFormula);
    document.getElementById('formula-bar').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFormula();
    });

    // Chart modal
    document.getElementById('create-chart-btn').addEventListener('click', openChartModal);
    document.getElementById('close-chart-modal').addEventListener('click', closeChartModal);
    document.getElementById('cancel-chart-btn').addEventListener('click', closeChartModal);
    document.getElementById('generate-chart-btn').addEventListener('click', generateChart);

    // Data Quality buttons
    document.getElementById('highlight-duplicates-btn').addEventListener('click', highlightDuplicates);
    document.getElementById('show-data-types-btn').addEventListener('click', toggleDataTypeBadges);

    // Conditional Formatting
    document.getElementById('conditional-format-btn').addEventListener('click', openConditionalFormatModal);
    document.getElementById('close-format-modal').addEventListener('click', closeConditionalFormatModal);
    document.getElementById('cancel-format-btn').addEventListener('click', closeConditionalFormatModal);
    document.getElementById('apply-format-btn').addEventListener('click', applyConditionalFormat);
    document.getElementById('clear-format-btn').addEventListener('click', clearConditionalFormat);

    // Preview updates for conditional formatting
    document.getElementById('color-scale-type')?.addEventListener('change', updateFormatPreview);
    document.getElementById('data-bar-color')?.addEventListener('change', updateFormatPreview);
    document.getElementById('icon-set-type')?.addEventListener('change', updateFormatPreview);
}

// ============================================================================
// File Upload and Parsing
// ============================================================================

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const { files } = e.dataTransfer;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileUpload(e) {
    const { files } = e.target;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

async function processFile(file) {
    fileName = file.name;
    document.getElementById('file-name').textContent = fileName;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            workbook = XLSX.read(data, { type: 'array' });

            // Load first sheet by default
            currentSheetName = workbook.SheetNames[0];
            loadSheet(currentSheetName);

            // Create sheet tabs
            createSheetTabs();

            // Hide drop zone, show spreadsheet
            document.getElementById('drop-zone').classList.add('hidden');
            document.getElementById('spreadsheet-wrapper').classList.remove('hidden');
            document.getElementById('formula-section').classList.remove('hidden');
            document.getElementById('sheet-tabs').classList.remove('hidden');

            // Save to storage
            saveToStorage();

            showToast('File loaded successfully!', 'success');
        } catch (error) {
            console.error('Error parsing file:', error);
            showToast('Error loading file. Please ensure it\'s a valid Excel or CSV file.', 'error');
        }
    };

    reader.readAsArrayBuffer(file);
}

function loadSheet(sheetName) {
    currentSheetName = sheetName;
    currentSheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    spreadsheetData = XLSX.utils.sheet_to_json(currentSheet, { header: 1, defval: '' });

    // Ensure we have at least some rows and columns
    if (spreadsheetData.length === 0) {
        spreadsheetData = Array(20).fill(null).map(() => Array(10).fill(''));
    }

    renderSpreadsheet();
}

// ============================================================================
// Spreadsheet Rendering
// ============================================================================

function renderSpreadsheet() {
    const headerEl = document.getElementById('spreadsheet-header');
    const bodyEl = document.getElementById('spreadsheet-body');

    // Clear existing content
    headerEl.innerHTML = '';
    bodyEl.innerHTML = '';

    if (spreadsheetData.length === 0) return;

    // Determine number of columns
    const maxCols = Math.max(...spreadsheetData.map(row => row.length), 10);

    // Render header with column controls
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('th');
    cornerCell.innerHTML = '<i class="fas fa-table text-gray-400"></i>';
    headerRow.appendChild(cornerCell);

    for (let col = 0; col < maxCols; col++) {
        const th = document.createElement('th');
        th.className = 'group relative';

        const headerContent = document.createElement('div');
        headerContent.className = 'flex items-center justify-between gap-2';

        const label = document.createElement('span');
        label.textContent = getColumnLabel(col);
        headerContent.appendChild(label);

        // Column actions (visible on hover)
        const actions = document.createElement('div');
        actions.className = 'opacity-0 group-hover:opacity-100 transition-opacity flex gap-1';

        const insertBtn = document.createElement('button');
        insertBtn.innerHTML = '<i class="fas fa-plus text-xs"></i>';
        insertBtn.className = 'px-1 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600';
        insertBtn.title = 'Insert column';
        insertBtn.onclick = (e) => {
            e.stopPropagation();
            insertColumnAt(col);
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash text-xs"></i>';
        deleteBtn.className = 'px-1 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600';
        deleteBtn.title = 'Delete column';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteColumnAt(col);
        };

        actions.appendChild(insertBtn);
        actions.appendChild(deleteBtn);
        headerContent.appendChild(actions);

        th.appendChild(headerContent);
        headerRow.appendChild(th);
    }
    headerEl.appendChild(headerRow);

    // Render rows with row controls
    spreadsheetData.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        tr.className = 'group';

        // Row header with controls
        const rowHeader = document.createElement('th');
        rowHeader.className = 'relative';

        const rowHeaderContent = document.createElement('div');
        rowHeaderContent.className = 'flex items-center justify-between gap-2';

        const rowNum = document.createElement('span');
        rowNum.textContent = rowIndex + 1;
        rowHeaderContent.appendChild(rowNum);

        // Row actions (visible on hover)
        const rowActions = document.createElement('div');
        rowActions.className = 'opacity-0 group-hover:opacity-100 transition-opacity flex gap-1';

        const insertRowBtn = document.createElement('button');
        insertRowBtn.innerHTML = '<i class="fas fa-plus text-xs"></i>';
        insertRowBtn.className = 'px-1 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600';
        insertRowBtn.title = 'Insert row';
        insertRowBtn.onclick = (e) => {
            e.stopPropagation();
            insertRowAt(rowIndex);
        };

        const deleteRowBtn = document.createElement('button');
        deleteRowBtn.innerHTML = '<i class="fas fa-trash text-xs"></i>';
        deleteRowBtn.className = 'px-1 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600';
        deleteRowBtn.title = 'Delete row';
        deleteRowBtn.onclick = (e) => {
            e.stopPropagation();
            deleteRowAt(rowIndex);
        };

        rowActions.appendChild(insertRowBtn);
        rowActions.appendChild(deleteRowBtn);
        rowHeaderContent.appendChild(rowActions);

        rowHeader.appendChild(rowHeaderContent);
        tr.appendChild(rowHeader);

        // Cells
        for (let colIndex = 0; colIndex < maxCols; colIndex++) {
            const td = document.createElement('td');
            const cellValue = row[colIndex] || '';

            // Check if it's a formula
            const displayValue = String(cellValue).startsWith('=')
                ? evaluateFormula(cellValue, rowIndex, colIndex)
                : cellValue;

            td.textContent = displayValue;
            td.dataset.row = rowIndex;
            td.dataset.col = colIndex;
            td.dataset.originalValue = cellValue;

            td.addEventListener('click', () => selectCell(td, rowIndex, colIndex));
            td.addEventListener('dblclick', () => editCell(td, rowIndex, colIndex));

            tr.appendChild(td);
        }

        bodyEl.appendChild(tr);
    });

    // Update stats
    document.getElementById('row-count').textContent = spreadsheetData.length;
    document.getElementById('col-count').textContent = maxCols;
}

function getColumnLabel(index) {
    let label = '';
    while (index >= 0) {
        label = String.fromCharCode(65 + (index % 26)) + label;
        index = Math.floor(index / 26) - 1;
    }
    return label;
}

function selectCell(cell, row, col) {
    // Remove previous selection
    document.querySelectorAll('.spreadsheet-table td.selected').forEach(td => {
        td.classList.remove('selected');
    });

    // Select new cell
    cell.classList.add('selected');
    selectedCell = { row, col, element: cell };

    // Update formula bar
    const cellLabel = getColumnLabel(col) + (row + 1);
    document.getElementById('selected-cell-label').textContent = cellLabel;

    const originalValue = cell.dataset.originalValue || cell.textContent;
    document.getElementById('formula-bar').value = originalValue;
}

function editCell(cell, row, col) {
    const currentValue = cell.dataset.originalValue || cell.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'dark:text-gray-100';

    cell.textContent = '';
    cell.appendChild(input);
    input.focus();
    input.select();

    const saveEdit = () => {
        const newValue = input.value;
        spreadsheetData[row][col] = newValue;

        // Update display
        const displayValue = newValue.startsWith('=')
            ? evaluateFormula(newValue, row, col)
            : newValue;

        cell.textContent = displayValue;
        cell.dataset.originalValue = newValue;

        // Update formula bar if this cell is selected
        if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
            document.getElementById('formula-bar').value = newValue;
        }

        saveToStorage();
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

// ============================================================================
// Formula Engine
// ============================================================================

function evaluateFormula(formula, currentRow, currentCol) {
    try {
        if (!formula.startsWith('=')) return formula;

        const expression = formula.substring(1).toUpperCase();

        // Handle SUM function
        if (expression.startsWith('SUM(')) {
            return evaluateSUM(expression);
        }

        // Handle AVERAGE function
        if (expression.startsWith('AVERAGE(') || expression.startsWith('AVG(')) {
            return evaluateAVERAGE(expression);
        }

        // Handle COUNT function
        if (expression.startsWith('COUNT(')) {
            return evaluateCOUNT(expression);
        }

        // Handle IF function
        if (expression.startsWith('IF(')) {
            return evaluateIF(expression, currentRow, currentCol);
        }

        // Handle VLOOKUP function
        if (expression.startsWith('VLOOKUP(')) {
            return evaluateVLOOKUP(expression);
        }

        // Handle HLOOKUP function
        if (expression.startsWith('HLOOKUP(')) {
            return evaluateHLOOKUP(expression);
        }

        // Handle CONCAT function
        if (expression.startsWith('CONCAT(')) {
            return evaluateCONCAT(expression);
        }

        // Handle TEXT function
        if (expression.startsWith('TEXT(')) {
            return evaluateTEXT(expression);
        }

        // Handle TODAY function
        if (expression === 'TODAY()') {
            return new Date().toLocaleDateString();
        }

        // Handle NOW function
        if (expression === 'NOW()') {
            return new Date().toLocaleString();
        }

        // Handle DATEDIF function
        if (expression.startsWith('DATEDIF(')) {
            return evaluateDATEDIF(expression);
        }

        // Handle simple arithmetic
        return evaluateArithmetic(expression, currentRow, currentCol);

    } catch (error) {
        return '#ERROR!';
    }
}

function evaluateSUM(expression) {
    const range = extractRange(expression);
    const values = getRangeValues(range);
    return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
}

function evaluateAVERAGE(expression) {
    const range = extractRange(expression);
    const values = getRangeValues(range);
    const numbers = values.filter(v => !isNaN(parseFloat(v)));

    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, val) => sum + parseFloat(val), 0) / numbers.length;
}

function evaluateCOUNT(expression) {
    const range = extractRange(expression);
    const values = getRangeValues(range);
    return values.filter(v => v !== '' && v !== null && v !== undefined).length;
}

function evaluateIF(expression, currentRow, currentCol) {
    // Extract condition, true value, false value
    const match = expression.match(/IF\((.*),(.*),(.*)\)/);
    if (!match) return '#ERROR!';

    const [, condition, trueVal, falseVal] = match;

    // Simple condition evaluation (e.g., A1>10)
    const condResult = evaluateCondition(condition.trim(), currentRow, currentCol);
    return condResult ? trueVal.trim().replace(/"/g, '') : falseVal.trim().replace(/"/g, '');
}

function evaluateCondition(condition, currentRow, currentCol) {
    // Replace cell references with values
    const replaced = replaceCellReferences(condition, currentRow, currentCol);

    // Evaluate the condition
    try {
        return eval(replaced);
    } catch {
        return false;
    }
}

function evaluateArithmetic(expression, currentRow, currentCol) {
    // Replace cell references with values
    const replaced = replaceCellReferences(expression, currentRow, currentCol);

    try {
        return eval(replaced);
    } catch {
        return '#ERROR!';
    }
}

function replaceCellReferences(expression, currentRow, currentCol) {
    // Replace cell references like A1, B2, etc.
    return expression.replace(/([A-Z]+)(\d+)/g, (match, col, row) => {
        const colIndex = columnLabelToIndex(col);
        const rowIndex = parseInt(row) - 1;

        const value = spreadsheetData[rowIndex]?.[colIndex] || 0;
        return isNaN(value) ? `"${value}"` : value;
    });
}

function extractRange(expression) {
    const match = expression.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
}

function getRangeValues(range) {
    const values = [];

    // Handle single column (e.g., A:A or B:B)
    if (range.match(/^([A-Z]+):([A-Z]+)$/)) {
        const [, startCol, endCol] = range.match(/^([A-Z]+):([A-Z]+)$/);
        const startColIndex = columnLabelToIndex(startCol);
        const endColIndex = columnLabelToIndex(endCol);

        for (let row = 0; row < spreadsheetData.length; row++) {
            for (let col = startColIndex; col <= endColIndex; col++) {
                const val = spreadsheetData[row]?.[col];
                if (val !== undefined && val !== '') values.push(val);
            }
        }
        return values;
    }

    // Handle range (e.g., A1:B10)
    if (range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)) {
        const [, startCol, startRow, endCol, endRow] = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);

        const startColIndex = columnLabelToIndex(startCol);
        const endColIndex = columnLabelToIndex(endCol);
        const startRowIndex = parseInt(startRow) - 1;
        const endRowIndex = parseInt(endRow) - 1;

        for (let row = startRowIndex; row <= endRowIndex; row++) {
            for (let col = startColIndex; col <= endColIndex; col++) {
                const val = spreadsheetData[row]?.[col];
                if (val !== undefined && val !== '') values.push(val);
            }
        }
    }

    return values;
}

function columnLabelToIndex(label) {
    let index = 0;
    for (let i = 0; i < label.length; i++) {
        index = index * 26 + (label.charCodeAt(i) - 64);
    }
    return index - 1;
}

// ============================================================================
// Advanced Formula Functions
// ============================================================================

/**
 * VLOOKUP - Vertical lookup in a table
 * Syntax: =VLOOKUP(searchValue, range, columnIndex, exactMatch)
 * Example: =VLOOKUP(A1, B1:D10, 3, FALSE)
 */
function evaluateVLOOKUP(expression) {
    try {
        // Extract parameters: VLOOKUP(value, range, colIndex, exactMatch)
        const match = expression.match(/VLOOKUP\((.*?),\s*([A-Z]+\d+:[A-Z]+\d+),\s*(\d+),?\s*(TRUE|FALSE)?\)/);
        if (!match) return '#ERROR!';

        const [, searchExpr, range, colIndexStr, exactMatch] = match;
        const columnIndex = parseInt(colIndexStr) - 1; // Convert to 0-based
        const exact = exactMatch !== 'FALSE';

        // Get search value (could be cell reference or literal)
        let searchValue = searchExpr.trim();
        if (searchValue.match(/^[A-Z]+\d+$/)) {
            const cellRef = searchValue.match(/^([A-Z]+)(\d+)$/);
            const col = columnLabelToIndex(cellRef[1]);
            const row = parseInt(cellRef[2]) - 1;
            searchValue = spreadsheetData[row]?.[col];
        } else {
            searchValue = searchValue.replace(/"/g, '');
        }

        // Parse range
        const rangeMatch = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
        if (!rangeMatch) return '#ERROR!';

        const [, startCol, startRow, endCol, endRow] = rangeMatch;
        const startColIndex = columnLabelToIndex(startCol);
        const startRowIndex = parseInt(startRow) - 1;
        const endRowIndex = parseInt(endRow) - 1;

        // Search in first column of range
        for (let row = startRowIndex; row <= endRowIndex; row++) {
            const cellValue = spreadsheetData[row]?.[startColIndex];

            if (exact) {
                // Exact match
                if (String(cellValue).toLowerCase() === String(searchValue).toLowerCase()) {
                    return spreadsheetData[row]?.[startColIndex + columnIndex] || '#N/A';
                }
            } else {
                // Approximate match (for sorted data)
                if (cellValue >= searchValue) {
                    return spreadsheetData[row]?.[startColIndex + columnIndex] || '#N/A';
                }
            }
        }

        return '#N/A';
    } catch (error) {
        return '#ERROR!';
    }
}

/**
 * HLOOKUP - Horizontal lookup in a table
 * Syntax: =HLOOKUP(searchValue, range, rowIndex, exactMatch)
 * Example: =HLOOKUP("Product", A1:E5, 3, FALSE)
 */
function evaluateHLOOKUP(expression) {
    try {
        const match = expression.match(/HLOOKUP\((.*?),\s*([A-Z]+\d+:[A-Z]+\d+),\s*(\d+),?\s*(TRUE|FALSE)?\)/);
        if (!match) return '#ERROR!';

        const [, searchExpr, range, rowIndexStr, exactMatch] = match;
        const rowIndex = parseInt(rowIndexStr) - 1;
        const exact = exactMatch !== 'FALSE';

        // Get search value
        let searchValue = searchExpr.trim();
        if (searchValue.match(/^[A-Z]+\d+$/)) {
            const cellRef = searchValue.match(/^([A-Z]+)(\d+)$/);
            const col = columnLabelToIndex(cellRef[1]);
            const row = parseInt(cellRef[2]) - 1;
            searchValue = spreadsheetData[row]?.[col];
        } else {
            searchValue = searchValue.replace(/"/g, '');
        }

        // Parse range
        const rangeMatch = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
        if (!rangeMatch) return '#ERROR!';

        const [, startCol, startRow, endCol] = rangeMatch;
        const startColIndex = columnLabelToIndex(startCol);
        const endColIndex = columnLabelToIndex(endCol);
        const startRowIndex = parseInt(startRow) - 1;

        // Search in first row of range
        for (let col = startColIndex; col <= endColIndex; col++) {
            const cellValue = spreadsheetData[startRowIndex]?.[col];

            if (exact) {
                if (String(cellValue).toLowerCase() === String(searchValue).toLowerCase()) {
                    return spreadsheetData[startRowIndex + rowIndex]?.[col] || '#N/A';
                }
            } else {
                if (cellValue >= searchValue) {
                    return spreadsheetData[startRowIndex + rowIndex]?.[col] || '#N/A';
                }
            }
        }

        return '#N/A';
    } catch (error) {
        return '#ERROR!';
    }
}

/**
 * CONCAT - Concatenate text values
 * Syntax: =CONCAT(text1, text2, ...)
 * Example: =CONCAT(A1, " - ", B1)
 */
function evaluateCONCAT(expression) {
    try {
        // Extract all arguments
        const argsMatch = expression.match(/CONCAT\((.*)\)/);
        if (!argsMatch) return '#ERROR!';

        const args = argsMatch[1].split(',').map(arg => arg.trim());
        let result = '';

        for (const arg of args) {
            // Check if it's a cell reference
            if (arg.match(/^[A-Z]+\d+$/)) {
                const cellRef = arg.match(/^([A-Z]+)(\d+)$/);
                const col = columnLabelToIndex(cellRef[1]);
                const row = parseInt(cellRef[2]) - 1;
                result += String(spreadsheetData[row]?.[col] || '');
            } else {
                // It's a literal string
                result += arg.replace(/"/g, '');
            }
        }

        return result;
    } catch (error) {
        return '#ERROR!';
    }
}

/**
 * TEXT - Format a number as text with specific format
 * Syntax: =TEXT(value, format)
 * Example: =TEXT(1234.5, "$#,##0.00")
 */
function evaluateTEXT(expression) {
    try {
        const match = expression.match(/TEXT\((.*?),\s*"(.*)"\)/);
        if (!match) return '#ERROR!';

        const [, valueExpr, format] = match;

        // Get value
        let value = valueExpr.trim();
        if (value.match(/^[A-Z]+\d+$/)) {
            const cellRef = value.match(/^([A-Z]+)(\d+)$/);
            const col = columnLabelToIndex(cellRef[1]);
            const row = parseInt(cellRef[2]) - 1;
            value = spreadsheetData[row]?.[col];
        }

        const num = parseFloat(value);
        if (isNaN(num)) return '#ERROR!';

        // Simple format parsing
        if (format.includes('$')) {
            // Currency format
            return '$' + num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        } else if (format.includes('#,##0')) {
            // Number with thousands separator
            const decimals = (format.match(/\.0+/) || [''])[0].length - 1;
            return num.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
        } else if (format.includes('%')) {
            // Percentage
            return (num * 100).toFixed(2) + '%';
        }

        return String(num);
    } catch (error) {
        return '#ERROR!';
    }
}

/**
 * DATEDIF - Calculate difference between two dates
 * Syntax: =DATEDIF(startDate, endDate, unit)
 * Units: "D" (days), "M" (months), "Y" (years)
 * Example: =DATEDIF("2024-01-01", "2024-12-31", "D")
 */
function evaluateDATEDIF(expression) {
    try {
        const match = expression.match(/DATEDIF\((.*?),\s*(.*?),\s*"(.*)"\)/);
        if (!match) return '#ERROR!';

        const [, startExpr, endExpr, unit] = match;

        // Get start date
        let startDate = startExpr.trim().replace(/"/g, '');
        if (startDate.match(/^[A-Z]+\d+$/)) {
            const cellRef = startDate.match(/^([A-Z]+)(\d+)$/);
            const col = columnLabelToIndex(cellRef[1]);
            const row = parseInt(cellRef[2]) - 1;
            startDate = spreadsheetData[row]?.[col];
        }

        // Get end date
        let endDate = endExpr.trim().replace(/"/g, '');
        if (endDate.match(/^[A-Z]+\d+$/)) {
            const cellRef = endDate.match(/^([A-Z]+)(\d+)$/);
            const col = columnLabelToIndex(cellRef[1]);
            const row = parseInt(cellRef[2]) - 1;
            endDate = spreadsheetData[row]?.[col];
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return '#ERROR!';
        }

        switch (unit.toUpperCase()) {
            case 'D': // Days
                return Math.floor((end - start) / (1000 * 60 * 60 * 24));

            case 'M': // Months
                let months = (end.getFullYear() - start.getFullYear()) * 12;
                months += end.getMonth() - start.getMonth();
                return months;

            case 'Y': // Years
                return end.getFullYear() - start.getFullYear();

            default:
                return '#ERROR!';
        }
    } catch (error) {
        return '#ERROR!';
    }
}

function applyFormula() {
    if (!selectedCell) {
        showToast('Please select a cell first', 'error');
        return;
    }

    const formula = document.getElementById('formula-bar').value;
    const { row, col, element } = selectedCell;

    spreadsheetData[row][col] = formula;

    const displayValue = formula.startsWith('=')
        ? evaluateFormula(formula, row, col)
        : formula;

    element.textContent = displayValue;
    element.dataset.originalValue = formula;

    saveToStorage();
    showToast('Formula applied!', 'success');
}

// ============================================================================
// Sheet Management
// ============================================================================

function createSheetTabs() {
    const tabsContainer = document.getElementById('sheet-tabs');
    tabsContainer.innerHTML = '';

    workbook.SheetNames.forEach((sheetName) => {
        const tab = document.createElement('button');
        tab.className = 'sheet-tab';
        tab.textContent = sheetName;

        if (sheetName === currentSheetName) {
            tab.classList.add('active');
        }

        tab.addEventListener('click', () => {
            document.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadSheet(sheetName);
        });

        tabsContainer.appendChild(tab);
    });
}

function createNewSheet() {
    const sheetName = prompt('Enter sheet name:', `Sheet${workbook.SheetNames.length + 1}`);
    if (!sheetName) return;

    // Create empty sheet
    const newData = Array(20).fill(null).map(() => Array(10).fill(''));
    const newSheet = XLSX.utils.aoa_to_sheet(newData);

    if (!workbook) {
        workbook = XLSX.utils.book_new();
    }

    XLSX.utils.book_append_sheet(workbook, newSheet, sheetName);
    currentSheetName = sheetName;
    spreadsheetData = newData;

    createSheetTabs();
    renderSpreadsheet();
    saveToStorage();

    showToast(`Sheet "${sheetName}" created!`, 'success');
}

// ============================================================================
// Data Operations
// ============================================================================

function addRow() {
    const maxCols = Math.max(...spreadsheetData.map(row => row.length), 10);
    spreadsheetData.push(Array(maxCols).fill(''));
    renderSpreadsheet();
    saveToStorage();
    showToast('Row added!', 'success');
}

function addColumn() {
    spreadsheetData.forEach(row => row.push(''));
    renderSpreadsheet();
    saveToStorage();
    showToast('Column added!', 'success');
}

function insertRowAt(index) {
    const maxCols = Math.max(...spreadsheetData.map(row => row.length), 10);
    spreadsheetData.splice(index + 1, 0, Array(maxCols).fill(''));
    renderSpreadsheet();
    saveToStorage();
    showToast(`Row inserted at ${index + 2}!`, 'success');
}

function deleteRowAt(index) {
    if (spreadsheetData.length <= 1) {
        showToast('Cannot delete the last row!', 'error');
        return;
    }

    if (!confirm(`Delete row ${index + 1}?`)) return;

    spreadsheetData.splice(index, 1);
    renderSpreadsheet();
    saveToStorage();
    showToast(`Row ${index + 1} deleted!`, 'success');
}

function insertColumnAt(colIndex) {
    spreadsheetData.forEach(row => {
        row.splice(colIndex + 1, 0, '');
    });
    renderSpreadsheet();
    saveToStorage();
    showToast(`Column inserted at ${getColumnLabel(colIndex + 1)}!`, 'success');
}

function deleteColumnAt(colIndex) {
    const maxCols = Math.max(...spreadsheetData.map(row => row.length));

    if (maxCols <= 1) {
        showToast('Cannot delete the last column!', 'error');
        return;
    }

    if (!confirm(`Delete column ${getColumnLabel(colIndex)}?`)) return;

    spreadsheetData.forEach(row => {
        row.splice(colIndex, 1);
    });
    renderSpreadsheet();
    saveToStorage();
    showToast(`Column ${getColumnLabel(colIndex)} deleted!`, 'success');
}

function clearSheet() {
    if (!confirm('Are you sure you want to clear all data in this sheet?')) return;

    spreadsheetData = Array(20).fill(null).map(() => Array(10).fill(''));
    renderSpreadsheet();
    saveToStorage();
    showToast('Sheet cleared!', 'success');
}

// ============================================================================
// Export Functions
// ============================================================================

function exportFile(format) {
    if (!workbook && spreadsheetData.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    try {
        switch (format) {
            case 'xlsx':
                exportExcel();
                break;
            case 'csv':
                exportCSV();
                break;
            case 'pdf':
                exportPDF();
                break;
            case 'json':
                exportJSON();
                break;
        }
    } catch (error) {
        console.error('Export error:', error);
        showToast('Error exporting file', 'error');
    }
}

function exportExcel() {
    const wb = workbook || createWorkbookFromData();
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    downloadFile(blob, fileName.replace(/\.[^.]+$/, '') + '.xlsx');
    showToast('Excel file exported!', 'success');
}

function exportCSV() {
    const ws = currentSheet || XLSX.utils.aoa_to_sheet(spreadsheetData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, fileName.replace(/\.[^.]+$/, '') + '.csv');
    showToast('CSV file exported!', 'success');
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Prepare data for autoTable
    const headers = [];
    const maxCols = Math.max(...spreadsheetData.map(row => row.length));
    for (let i = 0; i < maxCols; i++) {
        headers.push(getColumnLabel(i));
    }

    const body = spreadsheetData.map(row => {
        return row.map(cell => String(cell || ''));
    });

    doc.autoTable({
        head: [headers],
        body,
        theme: 'grid',
        styles: { fontSize: 8 },
    });

    doc.save(fileName.replace(/\.[^.]+$/, '') + '.pdf');
    showToast('PDF file exported!', 'success');
}

function exportJSON() {
    const ws = currentSheet || XLSX.utils.aoa_to_sheet(spreadsheetData);
    const jsonData = XLSX.utils.sheet_to_json(ws);
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    downloadFile(blob, fileName.replace(/\.[^.]+$/, '') + '.json');
    showToast('JSON file exported!', 'success');
}

function createWorkbookFromData() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(spreadsheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return wb;
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================================================
// Chart Generation
// ============================================================================

let currentChart = null;

function openChartModal() {
    document.getElementById('chart-modal').classList.remove('hidden');
    document.getElementById('chart-modal').classList.add('flex');
}

function closeChartModal() {
    document.getElementById('chart-modal').classList.add('hidden');
    document.getElementById('chart-modal').classList.remove('flex');

    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

function generateChart() {
    const chartType = document.getElementById('chart-type').value;
    const range = document.getElementById('chart-range').value.trim().toUpperCase();

    if (!range) {
        showToast('Please enter a data range', 'error');
        return;
    }

    const values = getRangeValues(range);

    if (values.length === 0) {
        showToast('No data found in the specified range', 'error');
        return;
    }

    // Prepare chart data
    const labels = values.map((_, i) => `Item ${i + 1}`);
    const data = values.map(v => parseFloat(v) || 0);

    // Destroy previous chart
    if (currentChart) {
        currentChart.destroy();
    }

    const ctx = document.getElementById('chart-canvas').getContext('2d');

    currentChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels,
            datasets: [{
                label: 'Data',
                data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                ],
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: chartType === 'pie' || chartType === 'doughnut',
                },
            },
        },
    });

    showToast('Chart generated!', 'success');
}

// ============================================================================
// Storage
// ============================================================================

function saveToStorage() {
    try {
        const data = {
            fileName,
            spreadsheetData,
            currentSheetName,
            timestamp: new Date().toISOString(),
        };

        localStorage.setItem('excelWorkspace', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

function loadFromStorage() {
    try {
        const stored = localStorage.getItem('excelWorkspace');
        if (stored) {
            const data = JSON.parse(stored);

            if (confirm('Load previously saved spreadsheet?')) {
                fileName = data.fileName;
                spreadsheetData = data.spreadsheetData;
                currentSheetName = data.currentSheetName || 'Sheet1';

                // Create a workbook from the data
                workbook = createWorkbookFromData();

                // Show the spreadsheet
                document.getElementById('drop-zone').classList.add('hidden');
                document.getElementById('spreadsheet-wrapper').classList.remove('hidden');
                document.getElementById('formula-section').classList.remove('hidden');
                document.getElementById('sheet-tabs').classList.remove('hidden');
                document.getElementById('file-name').textContent = fileName;

                createSheetTabs();
                renderSpreadsheet();

                showToast('Previous session restored!', 'success');
            }
        }
    } catch (error) {
        console.error('Error loading from storage:', error);
    }
}

// ============================================================================
// Data Quality & Validation Features
// ============================================================================

// Track data quality state
let showingDataTypes = false;

/**
 * Detect data type of a cell value
 * @param {*} value - Cell value to analyze
 * @returns {string} - 'number', 'date', 'boolean', 'text', or 'empty'
 */
function detectDataType(value) {
    if (value === null || value === undefined || value === '') {
        return 'empty';
    }

    // Check for boolean
    if (typeof value === 'boolean' || value === 'TRUE' || value === 'FALSE' ||
        value === 'true' || value === 'false') {
        return 'boolean';
    }

    // Check for number
    if (!isNaN(value) && !isNaN(parseFloat(value)) && typeof value !== 'string') {
        return 'number';
    }

    // Check if string represents a number
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!isNaN(trimmed) && trimmed !== '') {
            return 'number';
        }
    }

    // Check for date patterns
    const datePatterns = [
        /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,  // MM/DD/YYYY or DD-MM-YYYY
        /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,    // YYYY-MM-DD
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}$/i,
    ];

    const strValue = String(value);
    for (const pattern of datePatterns) {
        if (pattern.test(strValue)) {
            const date = new Date(strValue);
            if (!isNaN(date.getTime())) {
                return 'date';
            }
        }
    }

    // Default to text
    return 'text';
}

/**
 * Highlight duplicate values in columns
 */
function highlightDuplicates() {
    if (!spreadsheetData || spreadsheetData.length === 0) {
        showToast('No data to analyze', 'info');
        return;
    }

    // Remove existing duplicate highlighting
    const existingHighlights = document.querySelectorAll('.cell-duplicate');
    existingHighlights.forEach(cell => cell.classList.remove('cell-duplicate'));

    // Analyze each column for duplicates
    const numCols = spreadsheetData[0].length;
    let totalDuplicates = 0;

    for (let col = 0; col < numCols; col++) {
        const columnValues = {};
        const duplicateIndices = [];

        // First pass: count occurrences
        spreadsheetData.forEach((row, rowIndex) => {
            const value = row[col];
            if (value !== null && value !== undefined && value !== '') {
                const key = String(value).toLowerCase().trim();
                if (!columnValues[key]) {
                    columnValues[key] = [];
                }
                columnValues[key].push(rowIndex);
            }
        });

        // Second pass: identify duplicates (values that appear more than once)
        Object.values(columnValues).forEach(indices => {
            if (indices.length > 1) {
                duplicateIndices.push(...indices);
            }
        });

        // Highlight duplicate cells
        duplicateIndices.forEach(rowIndex => {
            const cell = document.querySelector(`[data-row="${rowIndex}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('cell-duplicate');
                totalDuplicates++;
            }
        });
    }

    if (totalDuplicates > 0) {
        showToast(`Found ${totalDuplicates} duplicate value${totalDuplicates > 1 ? 's' : ''}`, 'success');
    } else {
        showToast('No duplicates found', 'info');
    }
}

/**
 * Toggle data type badges on all cells
 */
function toggleDataTypeBadges() {
    showingDataTypes = !showingDataTypes;

    if (showingDataTypes) {
        // Add data type badges to all cells
        spreadsheetData.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                const cell = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);
                if (cell) {
                    const dataType = detectDataType(value);

                    // Remove existing badge if any
                    const existingBadge = cell.querySelector('.data-type-badge');
                    if (existingBadge) {
                        existingBadge.remove();
                    }

                    // Add new badge (skip empty cells)
                    if (dataType !== 'empty') {
                        const badge = document.createElement('span');
                        badge.className = 'data-type-badge';
                        badge.textContent = dataType.charAt(0).toUpperCase();
                        badge.title = `Data type: ${dataType}`;
                        cell.style.position = 'relative';
                        cell.appendChild(badge);
                    }
                }
            });
        });

        showToast('Data types displayed', 'success');
    } else {
        // Remove all data type badges
        const badges = document.querySelectorAll('.data-type-badge');
        badges.forEach(badge => badge.remove());
        showToast('Data types hidden', 'info');
    }
}

/**
 * Calculate data quality score for a column
 * @param {number} colIndex - Column index
 * @returns {object} - Quality metrics and grade
 */
function calculateColumnQuality(colIndex) {
    if (!spreadsheetData || spreadsheetData.length === 0) {
        return { grade: 'F', score: 0, metrics: {} };
    }

    const totalRows = spreadsheetData.length;
    let emptyCount = 0;
    let typeConsistency = 0;
    const typeCounts = {};

    // Analyze column
    spreadsheetData.forEach(row => {
        const value = row[colIndex];
        const dataType = detectDataType(value);

        if (dataType === 'empty') {
            emptyCount++;
        } else {
            typeCounts[dataType] = (typeCounts[dataType] || 0) + 1;
        }
    });

    // Calculate completeness (% non-empty)
    const completeness = ((totalRows - emptyCount) / totalRows) * 100;

    // Calculate type consistency (% of most common type)
    const nonEmptyCount = totalRows - emptyCount;
    if (nonEmptyCount > 0) {
        const maxTypeCount = Math.max(...Object.values(typeCounts));
        typeConsistency = (maxTypeCount / nonEmptyCount) * 100;
    }

    // Overall quality score (weighted average)
    const score = (completeness * 0.6) + (typeConsistency * 0.4);

    // Assign grade
    let grade;
    if (score >= 95) grade = 'A';
    else if (score >= 85) grade = 'B';
    else if (score >= 75) grade = 'C';
    else if (score >= 65) grade = 'D';
    else if (score >= 50) grade = 'E';
    else grade = 'F';

    return {
        grade,
        score: Math.round(score),
        metrics: {
            completeness: Math.round(completeness),
            typeConsistency: Math.round(typeConsistency),
            emptyCount,
            totalRows,
            dominantType: Object.keys(typeCounts).reduce((a, b) =>
                typeCounts[a] > typeCounts[b] ? a : b, 'unknown'),
        },
    };
}

// ============================================================================
// Conditional Formatting
// ============================================================================

let currentFormatType = null;
let appliedFormats = [];

function openConditionalFormatModal() {
    document.getElementById('conditional-format-modal').classList.remove('hidden');
    document.getElementById('conditional-format-modal').classList.add('flex');
}

function closeConditionalFormatModal() {
    document.getElementById('conditional-format-modal').classList.add('hidden');
    document.getElementById('conditional-format-modal').classList.remove('flex');
}

function selectFormatType(type) {
    currentFormatType = type;

    // Update button states
    document.querySelectorAll('.format-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.format-type-btn').classList.add('active');

    // Show/hide relevant options
    document.getElementById('color-scale-options').classList.toggle('hidden', type !== 'color-scale');
    document.getElementById('data-bars-options').classList.toggle('hidden', type !== 'data-bars');
    document.getElementById('icon-sets-options').classList.toggle('hidden', type !== 'icon-sets');

    updateFormatPreview();
}

function updateFormatPreview() {
    const preview = document.getElementById('format-preview');

    if (!currentFormatType) {
        preview.textContent = 'Select a format type and range to see preview';
        return;
    }

    switch (currentFormatType) {
        case 'color-scale':
            const scaleType = document.getElementById('color-scale-type').value;
            preview.innerHTML = `
                <div class="text-sm mb-2">Cells will be colored based on their values:</div>
                <div class="flex gap-2">
                    ${getColorScalePreview(scaleType)}
                </div>
            `;
            break;
        case 'data-bars':
            const barColor = document.getElementById('data-bar-color').value;
            preview.innerHTML = `
                <div class="text-sm mb-2">Horizontal bars proportional to cell values:</div>
                <div class="space-y-1">
                    <div class="relative h-6 border dark:border-gray-600">
                        <div class="data-bar data-bar-${barColor}" style="width: 100%"></div>
                        <span class="relative z-10 px-2">100</span>
                    </div>
                    <div class="relative h-6 border dark:border-gray-600">
                        <div class="data-bar data-bar-${barColor}" style="width: 60%"></div>
                        <span class="relative z-10 px-2">60</span>
                    </div>
                    <div class="relative h-6 border dark:border-gray-600">
                        <div class="data-bar data-bar-${barColor}" style="width: 30%"></div>
                        <span class="relative z-10 px-2">30</span>
                    </div>
                </div>
            `;
            break;
        case 'icon-sets':
            const iconSet = document.getElementById('icon-set-type').value;
            preview.innerHTML = `
                <div class="text-sm mb-2">Icons based on value ranges:</div>
                <div class="space-y-1 text-lg">
                    ${getIconSetPreview(iconSet)}
                </div>
            `;
            break;
    }
}

function getColorScalePreview(type) {
    const scales = {
        'green-yellow-red': '<div class="w-20 h-6" style="background: linear-gradient(to right, #10b981, #fbbf24, #ef4444)"></div>',
        'red-yellow-green': '<div class="w-20 h-6" style="background: linear-gradient(to right, #ef4444, #fbbf24, #10b981)"></div>',
        'white-red': '<div class="w-20 h-6" style="background: linear-gradient(to right, #ffffff, #ef4444)"></div>',
        'white-blue': '<div class="w-20 h-6" style="background: linear-gradient(to right, #ffffff, #3b82f6)"></div>',
        'white-green': '<div class="w-20 h-6" style="background: linear-gradient(to right, #ffffff, #10b981)"></div>',
    };
    return scales[type] + '<span class="ml-2 text-xs">Low → High</span>';
}

function getIconSetPreview(type) {
    const icons = {
        arrows: '↑ High (top 33%) → Moderate (middle 33%) ↓ Low (bottom 33%)',
        'traffic-lights': '🟢 High → 🟡 Moderate → 🔴 Low',
        stars: '⭐⭐⭐ High → ⭐⭐ Moderate → ⭐ Low',
        flags: '✅ High → ⚠️ Moderate → 🚩 Low',
    };
    return icons[type];
}

function applyConditionalFormat() {
    const range = document.getElementById('format-range').value;
    if (!range || !currentFormatType) {
        showToast('Please select format type and range', 'error');
        return;
    }

    const rangeMatch = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!rangeMatch) {
        showToast('Invalid range format. Use A1:C10', 'error');
        return;
    }

    const [, startCol, startRow, endCol, endRow] = rangeMatch;
    const startColIndex = columnLabelToIndex(startCol);
    const endColIndex = columnLabelToIndex(endCol);
    const startRowIndex = parseInt(startRow) - 1;
    const endRowIndex = parseInt(endRow) - 1;

    // Collect values in range
    const values = [];
    for (let row = startRowIndex; row <= endRowIndex; row++) {
        for (let col = startColIndex; col <= endColIndex; col++) {
            const val = spreadsheetData[row]?.[col];
            if (val !== undefined && val !== '' && !isNaN(parseFloat(val))) {
                values.push(parseFloat(val));
            }
        }
    }

    if (values.length === 0) {
        showToast('No numeric values in range', 'error');
        return;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    // Apply formatting to each cell
    for (let row = startRowIndex; row <= endRowIndex; row++) {
        for (let col = startColIndex; col <= endColIndex; col++) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!cell) continue;

            const val = parseFloat(spreadsheetData[row]?.[col]);
            if (isNaN(val)) continue;

            switch (currentFormatType) {
                case 'color-scale':
                    applyColorScale(cell, val, min, max);
                    break;
                case 'data-bars':
                    applyDataBar(cell, val, min, max);
                    break;
                case 'icon-sets':
                    applyIconSet(cell, val, min, max);
                    break;
            }
        }
    }

    // Store applied format for later clearing
    appliedFormats.push({ type: currentFormatType, range });

    showToast(`${currentFormatType.replace('-', ' ')} applied to ${range}`, 'success');
    closeConditionalFormatModal();
}

function applyColorScale(cell, value, min, max) {
    const scaleType = document.getElementById('color-scale-type').value;
    const normalized = (value - min) / (max - min);

    let color;
    switch (scaleType) {
        case 'green-yellow-red':
            color = getGradientColor(normalized, ['#10b981', '#fbbf24', '#ef4444']);
            break;
        case 'red-yellow-green':
            color = getGradientColor(normalized, ['#ef4444', '#fbbf24', '#10b981']);
            break;
        case 'white-red':
            color = interpolateColor('#ffffff', '#ef4444', normalized);
            break;
        case 'white-blue':
            color = interpolateColor('#ffffff', '#3b82f6', normalized);
            break;
        case 'white-green':
            color = interpolateColor('#ffffff', '#10b981', normalized);
            break;
    }

    cell.style.backgroundColor = color;
}

function applyDataBar(cell, value, min, max) {
    const barColor = document.getElementById('data-bar-color').value;
    const percentage = ((value - min) / (max - min)) * 100;

    // Remove existing data bar
    const existingBar = cell.querySelector('.data-bar');
    if (existingBar) existingBar.remove();

    // Add new data bar
    const bar = document.createElement('div');
    bar.className = `data-bar data-bar-${barColor}`;
    bar.style.width = `${percentage}%`;

    cell.style.position = 'relative';
    cell.insertBefore(bar, cell.firstChild);

    // Ensure text is visible
    if (cell.querySelector('input')) {
        cell.querySelector('input').style.position = 'relative';
        cell.querySelector('input').style.zIndex = '1';
    }
}

function applyIconSet(cell, value, min, max) {
    const iconSetType = document.getElementById('icon-set-type').value;
    const range = max - min;
    const third = range / 3;

    let icon;
    if (value >= min + (2 * third)) {
        // High
        switch (iconSetType) {
            case 'arrows': icon = '↑'; break;
            case 'traffic-lights': icon = '🟢'; break;
            case 'stars': icon = '⭐⭐⭐'; break;
            case 'flags': icon = '✅'; break;
        }
    } else if (value >= min + third) {
        // Medium
        switch (iconSetType) {
            case 'arrows': icon = '→'; break;
            case 'traffic-lights': icon = '🟡'; break;
            case 'stars': icon = '⭐⭐'; break;
            case 'flags': icon = '⚠️'; break;
        }
    } else {
        // Low
        switch (iconSetType) {
            case 'arrows': icon = '↓'; break;
            case 'traffic-lights': icon = '🔴'; break;
            case 'stars': icon = '⭐'; break;
            case 'flags': icon = '🚩'; break;
        }
    }

    // Remove existing icon
    const existingIcon = cell.querySelector('.icon-indicator');
    if (existingIcon) existingIcon.remove();

    // Add new icon
    const iconEl = document.createElement('span');
    iconEl.className = 'icon-indicator';
    iconEl.textContent = icon;
    cell.style.position = 'relative';
    cell.appendChild(iconEl);
}

function getGradientColor(value, colors) {
    if (colors.length === 2) {
        return interpolateColor(colors[0], colors[1], value);
    } else if (colors.length === 3) {
        if (value < 0.5) {
            return interpolateColor(colors[0], colors[1], value * 2);
        } else {
            return interpolateColor(colors[1], colors[2], (value - 0.5) * 2);
        }
    }
    return colors[0];
}

function interpolateColor(color1, color2, factor) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));

    return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
}

function clearConditionalFormat() {
    if (confirm('Clear all conditional formatting?')) {
        // Remove all formatting styles
        document.querySelectorAll('#spreadsheet td').forEach(cell => {
            cell.style.backgroundColor = '';
            const dataBar = cell.querySelector('.data-bar');
            if (dataBar) dataBar.remove();
            const icon = cell.querySelector('.icon-indicator');
            if (icon) icon.remove();
        });

        appliedFormats = [];
        showToast('Conditional formatting cleared', 'success');
        closeConditionalFormatModal();
    }
}

// ============================================================================
// UI Helpers
// ============================================================================

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 z-50`;

    switch (type) {
        case 'success':
            toast.classList.add('bg-green-600');
            break;
        case 'error':
            toast.classList.add('bg-red-600');
            break;
        default:
            toast.classList.add('bg-blue-600');
    }

    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
