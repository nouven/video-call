import { useContext, useEffect, useRef, useState } from 'react'
import { callContext } from './callContext'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { GrCopy } from 'react-icons/gr'
import { FiPhoneIncoming, FiPhoneOff } from 'react-icons/fi'
import { BiMicrophoneOff, BiMicrophone } from 'react-icons/bi'
import { BsCameraVideoOff, BsCameraVideo } from 'react-icons/bs'

function App() {
  let { info, callUser, leaveCall, answerCall, socket, call, isCalling, setIsCalling, isCallUser, setIsCallUser } = useContext(callContext)

  let [isMicOff, setIsMicOff] = useState(false);
  let [isCamOff, setIsCamOff] = useState(false);
  let [userOnls, setUserOnls] = useState([]);
  let [name, setName] = useState('');
  let [callInput, setCallInput] = useState('');

  let myVideo = useRef();
  let otherVideo = useRef();
  const openCallWindow = () => {
    const url = `http://localhost:3000/innercall`
    const screenX = window.screenX
    const screenY = window.screenY
    const popupWidth = 700
    const popupHeight = 400
    const height = window.outerHeight
    const width = window.outerWidth
    const left = Math.max(0, (screenX + width) / 2 - (popupWidth / 2))
    const top = Math.max(0, (screenY + height) / 2 - (popupHeight / 2))
    let config = `width=${popupWidth}, height=${popupHeight}, left=${left}, top=${top}`
    return window.open(url, "_blank", config)
  }

  let style = {
    icon: `p-2 text-2xl rounded-full overflow-hidden `
  }
  useEffect(() => {
    socket.on('init', ({ id }) => {
      let temp = info.current
      info.current = { ...temp, id }
    })
    socket.on('userOnl', (data) => {
      setUserOnls(() => {
        return data.userOnls.filter(userOnl => {
          return userOnl.id !== info.current.id
        })
      })
    })

  }, [])

  let handleConfirm = () => {
    let temp = info.current
    info.current = { ...temp, name }
    socket.emit('init', { name })
  }
  let handleAccept = () => {
    answerCall({ myVideo, otherVideo })
    setIsCalling(false)
    setIsCallUser(true)
  }
  let handleCancel = () => {
    setIsCalling(false)
  }
  let handleCall = () => {
    if (!callInput) {
      return
    }
    callUser({ myVideo, otherVideo, id: callInput })
    setIsCallUser(true)
  }

  return (
    <div className="relative / flex justify-center / w-screen h-screen /  ">
      {isCallUser ? (
        <div className="relative / w-full h-full overflow-hidden bg-black">
          <video className=" object-cover w-full h-full" ref={otherVideo} autoPlay />
          <div className="absolute right-0 bottom-4 z-10 w-[200px] h-[150px] border">
            <video className="object-cover w-full h-full" ref={myVideo} muted autoPlay />
          </div>
          <div className="absolute flex gap-4 bottom-4  left-1/2 -translate-x-1/2 ">
            {isCamOff ? (
              <div onClick={() => setIsCamOff(false)} className={`${style.icon} bg-gray-200`}><BsCameraVideoOff /></div>
            ) : (
              <div onClick={() => setIsCamOff(true)} className={`${style.icon} bg-gray-200`}><BsCameraVideo /></div>
            )}
            {isMicOff ? (
              <div onClick={() => setIsMicOff(false)} className={`${style.icon} bg-gray-200`}><BiMicrophoneOff /></div>
            ) : (
              <div onClick={() => setIsMicOff(true)} className={`${style.icon} bg-gray-200`}><BiMicrophone /></div>
            )}
            <div onClick={() => leaveCall()} className={`${style.icon} bg-red-500`}><FiPhoneOff /></div>
          </div>
        </div>
      ) : (
        <div className="relative / w-[375px] px-2 my-20 select-none ">
          {isCalling && (
            <div className="absolute top-1/2 left-1/2 border -translate-x-1/2  -translate-y-1/2 flex flex-col gap-4 p-2 w-fit z-10">
              <p> {call?.from.name || 'Nllu'} is calling ....</p>
              <div className="flex justify-between">
                <button onClick={() => handleAccept()} className={`${style.icon} bg-green-500`}><FiPhoneIncoming /></button>
                <button onClick={() => handleCancel()} className={`${style.icon} bg-red-500`}> <FiPhoneOff /></button>
              </div>
            </div>
          )}
          {!info.current?.name && (
            <div className="relative / flex / border p-1 w-full ">
              <input value={name} onChange={e => setName(e.target.value)} className="flex-1 outline-none " placeholder="Enter your name..." />
              <button className="border-l px-2" onClick={() => handleConfirm()}>Confirm</button>
            </div>
          )}
          {info.current?.name && (
            <div className="flex flex-col gap-1 w-full h-full">
              <div className="relative / flex-1 flex flex-col gap-1 / border h-8 overflow-auto">
                {userOnls.map(userOnl => {
                  return (
                    <div key={userOnl.id} className="flex gap-4 / p-2 border">
                      <p className="truncate">{userOnl.name}</p>
                      <p className="flex-1 mr-12 / font-light text / truncate ">id: {userOnl.id}</p>
                      <CopyToClipboard onCopy={e => setCallInput(userOnl.id)} text={userOnl.id}>
                        <button><GrCopy /></button>
                      </CopyToClipboard>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-2 pl-2 py-2 border">
                <input value={callInput} onChange={() => { }} className="outline-none flex-1" placeholder="Enter your friend id..." />
                <button onClick={() => handleCall()} className="px-2 border-l">Call</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div >
  )
}
export default App
