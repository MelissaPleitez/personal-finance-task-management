

import { useState } from 'react'
import './App.css'
import Button from './components/button/Button'
import Input from './components/input/Input'
import Modal from './components/modal/Modal'

function App() {
  // const [count, setCount] = useState(0)
  const [showName, setShowName] = useState('')
  const [getName, setGetName] = useState('')
  return (
    <>
      <h1>Under contruction</h1>
      <Input onChange={(e) => setGetName(e.target.value)} />
      <Button text="Show name" onClick={() => setShowName(getName)} />
      <Modal title="Nombres" content={showName} onClose={() => alert('Modal closed')} />
      {/* <p>name: {showName}</p> */}
    </>
  )
}

export default App
