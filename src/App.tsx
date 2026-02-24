import { useEffect, useMemo, useState } from 'react'
import './App.css'

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";


interface Data {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

function App() {
  const [data, setData] = useState<Data[]>([])
  const [currPage, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({})
  const [selectInput, setSelectInput] = useState('')
  const [selectCount, setSelectCount] = useState(0)

  const totalSelected = Object.keys(selectedIds).length

  function range(page: number) {
    const start = (page - 1) * 12 + 1;
    const end = start + 12 - 1;
    return { start, end }
  }

  function toggleSelection(id: number) {
    setSelectedIds(prev => {
      const next = { ...prev }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = true
      }
      return next
    })
  }

  function toggleAllOnPage() {
    const allSelected = data.every(row => selectedIds[row.id])
    setSelectedIds(prev => {
      const next = { ...prev }
      if (allSelected) {
        data.forEach(row => delete next[row.id])
      } else {
        data.forEach(row => { next[row.id] = true })
      }
      return next
    })
  }

  function handleSelectByNumber() {
    const count = parseInt(selectInput)
    if (isNaN(count) || count <= 0) return
    setSelectedIds({})
    setSelectCount(count)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currPage}&limit=12`)
        const result = await res.json()
        setData(result.data || [])
        setTotal(result.pagination.total)
        setTotalPages(result.pagination.total_pages)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [currPage])

  useEffect(() => {
    if (selectCount > 0 && data.length > 0) {
      const startRow = (currPage - 1) * 12
      const rowsToSelect = Math.min(Math.max(selectCount - startRow, 0), data.length)
      if (rowsToSelect > 0) {
        setSelectedIds(prev => {
          const next = { ...prev }
          for (let i = 0; i < rowsToSelect; i++) {
            next[data[i].id] = true
          }
          return next
        })
      }
    }
  }, [data, selectCount, currPage])

  const allOnPageSelected = data.length > 0 && data.every(row => selectedIds[row.id])

  const tableData = useMemo(() => data.map(row => ({
    ...row,
    _selected: !!selectedIds[row.id]
  })), [data, selectedIds])

  const { start, end } = range(currPage);
  return (
    <div className="app-container">
      <div className="toolbar">
        <span><strong>{totalSelected}</strong> rows selected</span>
        <div className="select-by-number">
          <input
            type="number"
            min="1"
            placeholder="Enter number of rows..."
            value={selectInput}
            onChange={(e) => setSelectInput(e.target.value)}
          />
          <button onClick={handleSelectByNumber}>Select</button>
        </div>
      </div>
      <div className="table-wrapper">
        <DataTable value={tableData} tableStyle={{ minWidth: "50rem" }}>
          <Column
            header={
              <input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} />
            }
            body={(rowData: Data & { _selected: boolean }) => (
              <input type="checkbox" checked={rowData._selected} onChange={() => toggleSelection(rowData.id)} />
            )}
          />
          <Column field="title" header="Title"></Column>
          <Column field="place_of_origin" header="Place of origin"></Column>
          <Column field="artist_display" header="Artist"></Column>
          <Column field="inscriptions" header="Inscriptions" body={(rowData: Data) => rowData.inscriptions || "N/A"}></Column>
          <Column field="date_start" header="Start Date"></Column>
          <Column field="date_end" header="End Date"></Column>
        </DataTable>
      </div>
      <div className="pagination-bar">
        <span className="page-info">Showing {start} to {Math.min(end, total)} of {total} entries</span>
        <div className="pagination-buttons">
          <button onClick={() => setPage(currPage - 1)} disabled={currPage === 1}>Previous</button>
          <button onClick={() => setPage(currPage)} className="active-page">{currPage}</button>
          {currPage + 1 <= totalPages && <button onClick={() => setPage(currPage + 1)}>{currPage + 1}</button>}
          {currPage + 2 <= totalPages && <button onClick={() => setPage(currPage + 2)}>{currPage + 2}</button>}
          {currPage + 3 <= totalPages && <button onClick={() => setPage(currPage + 3)}>{currPage + 3}</button>}
          {currPage + 4 <= totalPages && <button onClick={() => setPage(currPage + 4)}>{currPage + 4}</button>}
          {currPage + 5 <= totalPages && <button onClick={() => setPage(currPage + 5)}>{currPage + 5}</button>}
          <button onClick={() => setPage(currPage + 1)} disabled={currPage === totalPages}>Next</button>
        </div>
      </div>
    </div>
  )
}

export default App
