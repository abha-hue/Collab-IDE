import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Editor from './pages/Editor'
import { Toaster } from 'react-hot-toast'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Toaster position="top-center" reverseOrder={false}
        toastOptions={{
          success: {
            style:
            {
              background: 'green',
              color: 'white',
              fontFamily: 'monospace',
            },
          },
          error: {
            style:
            {
              background: 'red',
              color: 'white',
              fontFamily: 'monospace',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomid" element={<Editor />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
