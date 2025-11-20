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
let charts = [];

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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileUpload(e) {
    const files = e.target.files;
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
        body: body,
        theme: 'grid',
        styles: { fontSize: 8 }
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
            labels: labels,
            datasets: [{
                label: 'Data',
                data: data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: chartType === 'pie' || chartType === 'doughnut'
                }
            }
        }
    });
    
    showToast('Chart generated!', 'success');
}

// ============================================================================
// Storage
// ============================================================================

function saveToStorage() {
    try {
        const data = {
            fileName: fileName,
            spreadsheetData: spreadsheetData,
            currentSheetName: currentSheetName,
            timestamp: new Date().toISOString()
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
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}$/i
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
                typeCounts[a] > typeCounts[b] ? a : b, 'unknown')
        }
    };
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
