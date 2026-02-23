import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://api.artic.edu/api/v1/artworks?page=1")
        const result = await res.json()
        setData(result)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [])


  return (
    <>
      <div >{data ? JSON.stringify(data) : "Loading..."}</div>
    </>
  )
}

export default App
