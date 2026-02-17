

import { useState } from 'react'
import './App.css'
import Button from './components/button/Button'
import Input from './components/input/Input'
import Modal from './components/modal/Modal'
import TaskCard from './components/card/TaskCard'
import TaskForm from './components/form/TaskForm'

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
      <TaskCard task={{
        id: '1',
        title: 'Task 1',
        description: 'This is a sample task',
        dueDate: '2024-12-31',
        status: 'pending'
      }} onToggleStatus={(id) => alert(`Toggled status for task with id: ${id}`)} />
      {/* <p>name: {showName}</p> */}
      <h1>Task Form </h1>
      <TaskForm onCreate={(task) => alert(`Created task: ${task.title}`)} />
    </>
  )
}

export default App
