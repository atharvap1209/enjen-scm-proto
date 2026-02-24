import { screenerStocks, screenerFilters } from '../data/mock-screener-data.js';

let appState = {
    stocks: [...screenerStocks],
    columns: [
        { id: 'id', label: 'Coil No', visible: true, width: '120px' },
        { id: 'category', label: 'Category', visible: true, width: '100px' },
        { id: 'grade', label: 'Grade', visible: true, width: '140px' },
        { id: 'coating', label: 'Coating', visible: true, width: '100px' },
        { id: 'surfaceFinish', label: 'Surface Finish', visible: true, width: '120px' },
        { id: 'thickness', label: 'Thickness', visible: true, width: '100px' },
        { id: 'width', label: 'Width', visible: true, width: '110px' },
        { id: 'length', label: 'Length', visible: true, width: '110px' },
        { id: 'weight', label: 'Weight', visible: true, width: '100px' },
        { id: 'remarks1', label: 'Remarks 1', visible: true, width: '120px' },
        { id: 'remarks2', label: 'Remarks 2', visible: true, width: '120px' },
        { id: 'remarks3', label: 'Remarks 3', visible: true, width: '120px' },
    ],
    selectedFilters: {
        surface: [],
        category: [],
        coating: [],
        thickness: [],
        width: [],
        grade: [],
        item: [],
        plant: []
    }
};

export function renderStockScreener(container) {
    const defaultStyles = `
        .screener-page {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 60px); /* Fill available space minus topbar */
            overflow: hidden; 
            padding: 12px;
            gap: 12px;
            min-height: 0;
            background: #F9FAFB;
        }
        .screener-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        .screener-header-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
        }
        .screener-toolbar {
            display: flex;
            gap: 12px;
            flex-shrink: 0;
        }
        .screener-search {
            flex-grow: 1;
            padding: 6px 12px;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            font-size: 0.85rem;
        }
        .btn-outline {
            padding: 6px 12px;
            border: 1px solid #D1D5DB;
            background: #fff;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .btn-outline:hover { background: #F3F4F6; }
        
        /* Filter Section - Compact & Resizable */
        .filter-panel-wrapper {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
            overflow-x: auto;
            padding-bottom: 4px;
            max-height: 140px; /* Kept very compact so table gets more space */
        }
        .filter-box {
            background: #fff;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            resize: horizontal;
            overflow: hidden;
            min-width: 100px;
            width: 130px; /* Default width */
        }
        .filter-box-header {
            font-size: 0.65rem;
            text-transform: uppercase;
            font-weight: 600;
            color: #6B7280;
            padding: 4px 8px;
            background: #F9FAFB;
            border-bottom: 1px solid #E5E7EB;
            text-align: center;
            letter-spacing: 0.5px;
            cursor: pointer;
        }
        /* Color themes for different filters based on screenshot */
        .filter-box[data-key="surface"] { border-color: #FCD34D; }
        .filter-box[data-key="surface"] .filter-box-header { background: #FEF3C7; color: #D97706; border-color: #FCD34D; }
        .filter-box[data-key="category"] { border-color: #86EFAC; }
        .filter-box[data-key="category"] .filter-box-header { background: #DCFCE7; color: #15803D; border-color: #86EFAC; }
        .filter-box[data-key="coating"] { border-color: #D1D5DB; }
        .filter-box[data-key="coating"] .filter-box-header { background: #F3F4F6; color: #4B5563; border-color: #D1D5DB; }
        .filter-box[data-key="thickness"] { border-color: #FDE047; }
        .filter-box[data-key="thickness"] .filter-box-header { background: #FEF08A; color: #A16207; border-color: #FDE047; }
        .filter-box[data-key="width"] { border-color: #F9A8D4; }
        .filter-box[data-key="width"] .filter-box-header { background: #FBCFE8; color: #BE185D; border-color: #F9A8D4; }
        .filter-box[data-key="grade"] { border-color: #FCA5A5; }
        .filter-box[data-key="grade"] .filter-box-header { background: #FECACA; color: #B91C1C; border-color: #FCA5A5; }
        .filter-box[data-key="item"] { border-color: #93C5FD; }
        .filter-box[data-key="item"] .filter-box-header { background: #BFDBFE; color: #1D4ED8; border-color: #93C5FD; }
        .filter-box[data-key="plant"] { border-color: #C4B5FD; }
        .filter-box[data-key="plant"] .filter-box-header { background: #DDD6FE; color: #5B21B6; border-color: #C4B5FD; }
        
        .filter-items-scroll {
            overflow-y: auto;
            flex-grow: 1;
            padding: 4px;
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            align-content: flex-start;
            justify-content: center;
        }
        /* Ensure scrollbar is small */
        .filter-items-scroll::-webkit-scrollbar { width: 4px; }
        .filter-items-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }

        .filter-pill {
            font-size: 0.65rem;
            padding: 2px 6px;
            border: 1px solid #E5E7EB;
            border-radius: 3px;
            cursor: pointer;
            background: #fff;
            color: #374151;
            text-align: center;
            user-select: none;
            flex: 1 1 auto;
            min-width: 20px;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .filter-pill.selected {
            background: #E0E7FF;
            border-color: #6366F1;
            color: #4338CA;
            font-weight: 600;
        }

        /* Toggler for filters section */
        .filter-toggler {
            display: flex;
            justify-content: center;
            margin: -4px 0;
            z-index: 10;
        }
        .filter-toggler-btn {
            background: #fff;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            width: 32px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        /* Table Section */
        .table-container {
            flex-grow: 1;
            background: #fff;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            overflow: auto; /* scrollable table */
            position: relative;
        }
        .screener-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.75rem; /* Reduced font size for more rows */
            text-align: left;
        }
        .screener-table th {
            font-size: 0.7rem;
            color: #6B7280;
            background: #F9FAFB;
            font-weight: 600;
            padding: 6px 12px;
            border-bottom: 2px solid #E5E7EB;
            border-right: 1px solid #E5E7EB;
            position: sticky;
            top: 0;
            z-index: 5;
            cursor: grab;
            user-select: none;
            white-space: nowrap;
        }
        .screener-table th:active { cursor: grabbing; background: #E5E7EB; }
        .screener-table td {
            padding: 4px 12px;
            border-bottom: 1px solid #E5E7EB;
            border-right: 1px solid #E5E7EB;
            color: #111827;
            white-space: nowrap;
        }
        .screener-table tr:hover { background: #F3F4F6; }
        .drag-over { background: #E0E7FF !important; }
        
        .column-picker-modal {
            position: absolute;
            top: 40px;
            right: 0;
            width: 250px;
            background: #fff;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            z-index: 50;
            padding: 12px;
            display: none;
        }
        .column-picker-modal.open { display: block; }
        .column-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            font-size: 0.8rem;
        }
        .column-item label { flex-grow: 1; cursor: pointer; }
        .drag-handle { cursor: grab; color: #9CA3AF; }
    `;

    // Inject styles if not present
    if (!document.getElementById('screener-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'screener-styles';
        styleEl.textContent = defaultStyles;
        document.head.appendChild(styleEl);
    }

    // Build markup
    const markup = `
        <div class="screener-page">
            <div class="screener-header">
                <div class="screener-header-title">Stock Center Filter</div>
                <div style="display:flex; gap:16px; font-size: 0.9rem;">
                    <div><span style="color:#6B7280">Total Weight:</span> <strong>85,241</strong></div>
                    <div><span style="color:#6B7280">Total Price:</span> <strong>INR 0</strong></div>
                </div>
            </div>

            <div class="screener-toolbar">
                <input type="text" class="screener-search" placeholder="Search stocks..." />
                <div style="position: relative;">
                    <button class="btn-outline" id="columnsBtn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg> Columns
                    </button>
                    <div class="column-picker-modal" id="columnPickerMenu">
                        <div style="font-weight:600; margin-bottom: 8px; font-size: 0.85rem;">Show/Hide & Arrange</div>
                        <div id="columnPickerList"></div>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="filter-panel-wrapper" id="filterPanel">
                ${Object.entries(screenerFilters).map(([key, options]) => `
                    <div class="filter-box" data-key="${key}">
                        <div class="filter-box-header">${key}</div>
                        <div class="filter-items-scroll">
                            ${options.map(opt => `
                                <div class="filter-pill" data-key="${key}" data-val="${opt}">${opt}</div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="filter-toggler">
                <button class="filter-toggler-btn" id="filterToggleBtn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>
                </button>
            </div>

            <!-- Table Container -->
            <div class="table-container">
                <table class="screener-table">
                    <thead>
                        <tr id="tableHeaderRow"></tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = markup;

    // References
    const filterPills = container.querySelectorAll('.filter-pill');
    const tableHeaderRow = container.getElementById('tableHeaderRow');
    const tableBody = container.getElementById('tableBody');
    const columnPickerList = container.getElementById('columnPickerList');
    const columnsBtn = container.getElementById('columnsBtn');
    const columnPickerMenu = container.getElementById('columnPickerMenu');
    const filterToggleBtn = container.getElementById('filterToggleBtn');
    const filterPanel = container.getElementById('filterPanel');

    // Filter toggle
    let filtersExpanded = true;
    filterToggleBtn.addEventListener('click', () => {
        filtersExpanded = !filtersExpanded;
        if (filtersExpanded) {
            filterPanel.style.display = 'flex';
            filterToggleBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 15l-7-7-7 7"/></svg>';
        } else {
            filterPanel.style.display = 'none';
            filterToggleBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7-7-7-7"/></svg>';
        }
    });

    // Column Picker Toggle
    columnsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        columnPickerMenu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#columnPickerMenu') && !e.target.closest('#columnsBtn')) {
            columnPickerMenu.classList.remove('open');
        }
    });

    // Filtering logic
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const key = pill.dataset.key;
            const val = pill.dataset.val;

            // Toggle selection
            pill.classList.toggle('selected');
            const isSelected = pill.classList.contains('selected');

            if (isSelected) {
                appState.selectedFilters[key].push(val);
            } else {
                appState.selectedFilters[key] = appState.selectedFilters[key].filter(v => String(v) !== String(val));
            }
            renderTable();
        });
    });

    function getFilteredStocks() {
        return appState.stocks.filter(stock => {
            // Must match all active filters
            for (const [key, selectedValues] of Object.entries(appState.selectedFilters)) {
                if (selectedValues.length > 0) {
                    // Normalize values for comparison
                    const stockVal = String(stock[key]);
                    if (!selectedValues.some(v => String(v) === stockVal)) {
                        return false;
                    }
                }
            }
            return true;
        });
    }

    // Drag API for columns (Headers)
    let dragSourceColId = null;

    function handleDragStart(e) {
        dragSourceColId = e.target.dataset.id;
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.4';
    }
    function handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const th = e.target.closest('th');
        if (th && th.dataset.id !== dragSourceColId) {
            th.classList.add('drag-over');
        }
        return false;
    }
    function handleDragLeave(e) {
        const th = e.target.closest('th');
        if (th) th.classList.remove('drag-over');
    }
    function handleDragEnd(e) {
        e.target.style.opacity = '1';
        container.querySelectorAll('th').forEach(th => th.classList.remove('drag-over'));
    }
    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        const th = e.target.closest('th');
        if (th && dragSourceColId !== th.dataset.id) {
            const dropTargetColId = th.dataset.id;
            reorderColumns(dragSourceColId, dropTargetColId);
        }
        return false;
    }

    function reorderColumns(sourceId, targetId) {
        const sourceIndex = appState.columns.findIndex(c => c.id === sourceId);
        const targetIndex = appState.columns.findIndex(c => c.id === targetId);
        const col = appState.columns.splice(sourceIndex, 1)[0];
        appState.columns.splice(targetIndex, 0, col);
        renderTable();
        renderColumnPicker();
    }

    function renderColumnPicker() {
        columnPickerList.innerHTML = appState.columns.map(col => `
            <div class="column-item" draggable="true" data-id="${col.id}">
                <span class="drag-handle">⠿</span>
                <input type="checkbox" id="chk-${col.id}" data-id="${col.id}" ${col.visible ? 'checked' : ''} />
                <label for="chk-${col.id}">${col.label}</label>
            </div>
        `).join('');

        // Visibility toggles
        columnPickerList.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const col = appState.columns.find(c => c.id === e.target.dataset.id);
                if (col) col.visible = e.target.checked;
                renderTable();
            });
        });

        // Drag & Drop for picker items
        let pickerDragSrc = null;
        const items = columnPickerList.querySelectorAll('.column-item');
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                pickerDragSrc = item.dataset.id;
                e.target.style.opacity = '0.5';
            });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.style.background = '#F3F4F6';
            });
            item.addEventListener('dragleave', (e) => {
                item.style.background = 'transparent';
            });
            item.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
                items.forEach(i => i.style.background = 'transparent');
            });
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.style.background = 'transparent';
                if (pickerDragSrc && pickerDragSrc !== item.dataset.id) {
                    reorderColumns(pickerDragSrc, item.dataset.id);
                }
            });
        });
    }

    function renderTable() {
        const visibleCols = appState.columns.filter(c => c.visible);

        // Render Headers
        tableHeaderRow.innerHTML = visibleCols.map(col => `
            <th draggable="true" data-id="${col.id}" style="width: ${col.width}">
                ${col.label} 
                <span style="opacity:0.5; font-size:10px; cursor:pointer" title="Sort">↑↓</span>
            </th>
        `).join('');

        // Attach Header drag events
        const headers = tableHeaderRow.querySelectorAll('th');
        headers.forEach(th => {
            th.addEventListener('dragstart', handleDragStart);
            th.addEventListener('dragover', handleDragOver);
            th.addEventListener('dragleave', handleDragLeave);
            th.addEventListener('drop', handleDrop);
            th.addEventListener('dragend', handleDragEnd);
        });

        // Render Body
        const filteredStocks = getFilteredStocks();
        if (filteredStocks.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${visibleCols.length}" style="text-align:center; padding: 24px; color: #6B7280;">No stocks found matching the selected filters.</td></tr>`;
            return;
        }

        tableBody.innerHTML = filteredStocks.map(stock => `
            <tr>
                ${visibleCols.map(col => {
            // Special fields editable or specific formatting
            const val = stock[col.id] || '';
            if (col.id.startsWith('remarks')) {
                return `<td><input type="text" value="${val}" style="border:1px solid transparent; width: 100%; font-size:inherit; padding: 2px" onfocus="this.style.border='1px solid #D1D5DB'" onblur="this.style.border='1px solid transparent'" placeholder="..."/></td>`;
            }
            return `<td>${val}</td>`;
        }).join('')}
            </tr>
        `).join('');
    }

    // Init display
    renderColumnPicker();
    renderTable();
}
