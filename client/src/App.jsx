import React from 'react'
import {io} from 'socket.io-client'

export default function App() {
  const socket = io('http://localhost:3000')
  console.log(socket)
  return (
    <div>App</div>
  )
}
