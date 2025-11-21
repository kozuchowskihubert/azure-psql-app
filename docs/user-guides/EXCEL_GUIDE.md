# 📊 Excel Data Workspace - User Guide

> Client-side Excel manipulation with zero database dependencies

**Access**: [https://notesapp-dev-app.azurewebsites.net/excel.html](https://notesapp-dev-app.azurewebsites.net/excel.html)

---

## 🎯 Overview

The Excel Data Workspace is a powerful browser-based tool for manipulating spreadsheet data without any server uploads or database storage. All processing happens locally in your browser, ensuring complete privacy and offline capability.

### ✨ Key Benefits

- **🔒 Privacy First** - Your data never leaves your browser
- **⚡ Lightning Fast** - No network latency, instant processing
- **📴 Works Offline** - After initial page load, no internet required
- **🎨 Modern UI** - Beautiful interface with dark mode support

---

## 🚀 Quick Start

### 1. Upload a File

**Drag and Drop**:
- Drag an Excel or CSV file onto the upload zone
- File is instantly parsed and displayed

**Click to Upload**:
- Click the "Upload File" button
- Select .xlsx, .xls, or .csv file
- Data appears in spreadsheet grid

### 2. Create New Sheet

- Click "New Sheet" button
- Enter sheet name (or use default)
- Start with blank 20x10 grid

### 3. Edit Data

**Select Cell**:
- Click any cell to select it
- Cell reference shows in formula bar (e.g., A1)

**Edit Cell**:
- Double-click cell to edit inline
- OR use formula bar to enter value/formula
- Press Enter to apply

**Add Rows/Columns**:
- Click "+ Row" to add row at bottom
- Click "+ Column" to add column at right

---

## 📐 Formula Guide

### Supported Formulas

#### SUM - Add values in a range
```excel
=SUM(A1:A10)        # Sum cells A1 through A10
=SUM(B:B)           # Sum entire column B
=SUM(C2:E2)         # Sum cells C2 to E2 (horizontal)
```

#### AVERAGE - Calculate mean
```excel
=AVERAGE(A1:A10)    # Average of A1 to A10
=AVG(B:B)           # Average of entire column B
```

#### COUNT - Count non-empty cells
```excel
=COUNT(A1:A100)     # Count filled cells in range
=COUNT(C:C)         # Count filled cells in column C
```

#### IF - Conditional logic
```excel
=IF(A1>10,"High","Low")         # If A1 > 10, show "High", else "Low"
=IF(B2=0,"Zero","Not Zero")     # Check if B2 equals 0
```

#### Arithmetic - Simple calculations
```excel
=A1+B1              # Add two cells
=A1*B1/100          # Multiply and divide
=A1-B1+C1           # Multiple operations
=(A1+B1)/2          # Use parentheses for order
```

### Formula Tips

1. **Always start with `=`** - Formulas must begin with equals sign
2. **Cell References** - Use column letter + row number (A1, B2, etc.)
3. **Ranges** - Use colon notation (A1:A10, B:B, C2:E5)
4. **Case Insensitive** - =SUM and =sum work the same
5. **Nested Formulas** - You can nest formulas (coming soon)

---

## 📥 Import/Export Options

### Import Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| Excel 2007+ | .xlsx | Full support, all features |
| Excel 97-2003 | .xls | Legacy format, supported |
| CSV | .csv | Comma-separated values |

### Export Formats

#### 📗 Excel (.xlsx)
- Click "Excel" export button
- Downloads Excel workbook with all sheets
- Preserves formulas and formatting
- Compatible with Microsoft Excel, Google Sheets

#### 📄 CSV (.csv)
- Click "CSV" export button
- Exports current active sheet only
- Plain text format
- Opens in any spreadsheet software

#### 📕 PDF (.pdf)
- Click "PDF" export button
- Generates printable PDF document
- Includes all data in table format
- Good for sharing and archiving

#### 🔧 JSON (.json)
- Click "JSON" export button
- Structured data format
- Perfect for API integration
- Developers: Use for data pipelines

---

## 📊 Creating Charts

### Chart Types Available

1. **Bar Chart** - Compare values across categories
2. **Line Chart** - Show trends over time
3. **Pie Chart** - Show proportions of a whole
4. **Doughnut Chart** - Like pie, but with center hole

### How to Create Charts

1. **Click "Create Chart"** button
2. **Select Chart Type** from dropdown
3. **Enter Data Range** (e.g., A1:B10)
   - Range format: StartCell:EndCell
   - Example: A1:B10 (rows 1-10, columns A-B)
4. **Click "Generate Chart"**
5. Chart appears in modal with live preview

### Chart Range Examples

```
A1:A10          # Single column, 10 rows
A1:B5           # Two columns, 5 rows
C2:E10          # Multiple columns and rows
```

---

## 💾 Auto-Save & Storage

### Local Storage

**Automatic Saving**:
- Every edit auto-saves to browser localStorage
- No manual save button needed
- Data persists across browser sessions

**Session Restoration**:
- On page load, prompts to restore previous session
- Click "OK" to restore last spreadsheet
- Click "Cancel" to start fresh

**Storage Limits**:
- Browser localStorage typically: 5-10MB
- Enough for thousands of rows
- Large files (>1MB) may need IndexedDB (future)

### Data Privacy

- ✅ Data stored ONLY in your browser
- ✅ Never uploaded to server
- ✅ Can be cleared from browser settings
- ✅ Private browsing mode = no persistence

---

## 🎨 User Interface

### Toolbar Sections

**File Operations**:
- 📤 Upload File - Import Excel/CSV
- ➕ New Sheet - Create blank spreadsheet

**Export Options**:
- 📗 Excel - Export as .xlsx
- 📄 CSV - Export as .csv
- 📕 PDF - Export as .pdf
- 🔧 JSON - Export as .json

**Data Operations**:
- ➕ Row - Add new row
- ➕ Column - Add new column
- 🗑️ Clear - Clear all data in sheet

**Visualization**:
- 📊 Create Chart - Generate charts from data

### Formula Bar

- Shows selected cell reference (e.g., A1, B2)
- Input area for formulas and values
- "Apply" button to save changes
- Press Enter to apply formula

### Sheet Tabs

- Multiple sheets in one workbook
- Click tab to switch sheets
- Active sheet highlighted in blue

### Spreadsheet Grid

- Column headers: A, B, C, D...
- Row numbers: 1, 2, 3, 4...
- Click cell to select
- Double-click to edit
- Selected cells highlighted in blue

---

## 🌙 Dark Mode

**Toggle Dark Mode**:
- Click moon/sun icon in header
- Syncs with main Notes app theme
- Saves preference to localStorage

**Dark Mode Features**:
- Easier on eyes in low light
- All UI elements adapt
- Spreadsheet grid inverts colors
- Charts remain colorful and readable

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Apply formula / Confirm edit |
| Escape | Cancel edit |
| Tab | Move to next cell (future) |
| Arrow Keys | Navigate cells (future) |

---

## 🐛 Troubleshooting

### File Won't Upload

**Problem**: Drop zone doesn't accept file  
**Solution**:
- Ensure file is .xlsx, .xls, or .csv
- Try using "Upload File" button instead
- Check file isn't corrupted

### Formula Shows #ERROR!

**Problem**: Formula displays error  
**Solution**:
- Check formula syntax (must start with =)
- Verify cell references exist (A1, B2)
- Ensure range is valid (A1:A10)
- Check for circular references

### Export Not Working

**Problem**: Export button doesn't download  
**Solution**:
- Check browser allows downloads
- Disable popup blocker for this site
- Try different export format
- Check console for errors (F12)

### Data Not Saving

**Problem**: Data lost after refresh  
**Solution**:
- Ensure localStorage not disabled
- Not in private/incognito mode
- Browser storage not full
- Try exporting to Excel as backup

### Chart Not Generating

**Problem**: Chart modal empty  
**Solution**:
- Verify data range is correct (A1:B10)
- Ensure range contains numeric data
- Check range exists in spreadsheet
- Try smaller data range

---

## 💡 Tips & Best Practices

### Performance Tips

1. **Large Files**: Break into multiple sheets instead of one huge sheet
2. **Formulas**: Avoid too many complex formulas on large datasets
3. **Export Often**: Save important work as Excel file backup
4. **Clear Unused**: Remove empty rows/columns to reduce size

### Data Organization

1. **Headers**: Use row 1 for column headers
2. **Consistency**: Keep data types consistent in columns
3. **Validation**: Use formulas to validate data (=IF statements)
4. **Documentation**: Add sheet names describing data

### Formula Tips

1. **Test First**: Test formulas on small range before applying to all
2. **Use Ranges**: Ranges are more efficient than individual cells
3. **Document**: Add notes in adjacent cells explaining complex formulas
4. **Verify**: Double-check formula results manually

---

## 🔮 Coming Soon

### Phase 3 Enhancements (Next Month)

- ✨ VLOOKUP and HLOOKUP functions
- ✨ More chart types (scatter, area, radar)
- ✨ Cell formatting (colors, fonts, alignment)
- ✨ Conditional formatting rules
- ✨ Freeze panes and split views
- ✨ Find and replace functionality
- ✨ Undo/Redo with history
- ✨ Keyboard shortcuts for navigation
- ✨ Copy/paste with clipboard API

### Phase 4 Features (Q2 2026)

- 🔄 Real-time collaboration (optional server mode)
- 💬 Cell comments and annotations
- 📤 Share spreadsheet via link
- 🔐 Password-protected exports
- 📊 Pivot tables
- 📈 Advanced visualizations

See [Product Roadmap](../business/ROADMAP.md) for complete feature timeline.

---

## 📞 Support

**Documentation**:
- This guide: `/docs/EXCEL_GUIDE.md`
- Product roadmap: `/ROADMAP.md`
- Main README: `/README.md`

**Issues**:
- [GitHub Issues](https://github.com/kozuchowskihubert/azure-psql-app/issues)
- Tag with `excel-workspace` label

**Questions**:
- [GitHub Discussions](https://github.com/kozuchowskihubert/azure-psql-app/discussions)
- Community support and tips

---

## 🎓 Example Use Cases

### 1. Budget Tracking
```
A: Category | B: Budget | C: Actual | D: Difference
Row 2: Food | 500 | 450 | =B2-C2
Row 3: Total | =SUM(B2:B10) | =SUM(C2:C10) | =SUM(D2:D10)
```

### 2. Grade Calculator
```
A: Student | B: Test1 | C: Test2 | D: Average | E: Pass/Fail
Row 2: John | 85 | 90 | =AVERAGE(B2:C2) | =IF(D2>=60,"Pass","Fail")
```

### 3. Sales Analysis
```
A: Month | B: Sales | C: Target | D: % of Target
Row 2: Jan | 10000 | 15000 | =(B2/C2)*100
Create bar chart from A1:B13 to visualize monthly sales
```

### 4. Inventory Management
```
A: Item | B: Stock | C: Reorder Level | D: Status
Row 2: Widget | 50 | 20 | =IF(B2<C2,"ORDER","OK")
```

---

**Happy Spreadsheeting! 📊**

*Last Updated: November 20, 2025*
