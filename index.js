import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
const app = express();
const server = http.createServer(app)
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['get', 'post']
  }
})



let userOnls = [];
io.on('connection', socket => {

  socket.emit('init', { id: socket.id })
  socket.on('init', ({ name }) => {
    userOnls.unshift({ name, id: socket.id })
    console.log(`push: ${userOnls.length}`)
    io.emit('userOnl', { userOnls })
  })


  socket.on("callUser", ({ from, to, signal }) => {
    io.to(to).emit('callUser', { from, signal })
  })
  socket.on("answerCall", ({ from, to, signal }) => {
    io.to(to).emit('answerCall', { from, signal })
  })


  socket.on('disconnect', () => {
    userOnls = userOnls.filter(userOnl => {
      return userOnl.id !== socket.id
    })
    console.log(`pop: ${userOnls.length}`)
    io.emit('userOnl', { userOnls })
  })
})

server.listen(process.env.PORT || 5000, () => {
  console.log(`app is runing!!`)
})

