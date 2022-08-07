import { createContext, useRef, useState, useEffect } from 'react'
import io from 'socket.io-client'
import Peer from 'simple-peer'
let callContext = createContext();
let socket = io('http://localhost:5000')


function CallContextProvider({ children }) {
  let [userOnls, setUserOnls] = useState([])
  let [myStream, setMyStream] = useState()
  let [otherStream, setOtherStream] = useState(null)
  let [call, setCall] = useState({})
  let [isCalling, setIsCalling] = useState(false)


  let [isCallUser, setIsCallUser] = useState(false)

  let info = useRef();
  let myPeer = useRef();




  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setMyStream(stream)
      })
    socket.on("callUser", ({ from, signal }) => {
      setCall({ from, signal })
      setIsCalling(true)
    })
  }, [])

  let answerCall = ({ myVideo, otherVideo }) => {
    let peer = new Peer({ initiator: false, trickle: false, stream: myStream })
    peer.on('signal', signal => {
      let from = {
        id: info.current.id,
        name: info.current.name,
      }
      let to = call.from.id
      socket.emit('answerCall', { from, to, signal })
    })
    peer.on('stream', stream => {
      otherVideo.current.srcObject = stream
      myVideo.current.srcObject = myStream
    })
    peer.signal(call.signal)
    myPeer.current = peer
  }

  let callUser = ({ myVideo, otherVideo, id }) => {
    let peer = new Peer({ initiator: true, trickle: false, stream: myStream })
    peer.on('signal', signal => {
      let from = {
        id: info.current.id,
        name: info.current.name
      }
      let to = id
      socket.emit('callUser', { from, to, signal })
    })
    socket.on('answerCall', ({ signal }) => {
      peer.signal(signal)
    })
    peer.on('stream', stream => {
      otherVideo.current.srcObject = stream
      myVideo.current.srcObject = myStream
    })
    myPeer.current = peer
  }
  let leaveCall = () => {
    myPeer.current._destroy()
    window.location.reload()
    setIsCallUser(false)
  }




  let value = {
    socket,
    info,
    myStream, setMyStream,
    call, setCall,
    myPeer,
    isCalling, setIsCalling,
    leaveCall,
    isCallUser, setIsCallUser,
    callUser, answerCall,
  }
  return (
    <callContext.Provider value={value}>
      {children}
    </callContext.Provider >
  )
}
export { CallContextProvider, callContext }
