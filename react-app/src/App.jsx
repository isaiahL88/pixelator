import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [file, setfile] = useState();

  const handleSubmit = async () => {

  }



  return (
    <div className="flex flex-col justify-center items-center bg-slate-500 w-screen h-screen">
      <h1 className='font-mono text-4xl'>Pixelator</h1>
      <div className="flex flex-col justify-center items-centerw-2/3 bg-slate-300 h-60 z-29">
        <input onChange={(event) => setfile(event.target.files[0])} type="file" accept="image/*"></input>
        <button className="btn btn-blue" type='submit' onClick={handleSubmit}>Pixlate Image</button>
      </div>
    </div>

  )
}

export default App
