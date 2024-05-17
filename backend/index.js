import express from 'express';
import http from 'http';
import ip from 'ip';
import { Server } from 'socket.io';
import cors from 'cors';
import { log } from 'console';
const app = express();
const server = http.createServer(app);
const PORT = 3000;
const io = new Server(server, {
    cors: {
        origin: '*',
        }
})
app.use(cors())

app.get('/', (req, res) => {
    res.json('ip address: http://' + ip.address()+':'+PORT);    
});

const rooms = [];

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.broadcast.emit('user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.broadcast.emit('user disconnected');
    });

    // socket.on('message', (msg) => {
    //     console.log('message: ' + msg);
    //     io.emit('message', msg);
    // });
    
    // socket.on('room', (room, msg) => {
    //     console.log('room: ' + room + ' message: ' + msg);
    //     io.to(room).emit('message', msg);
    // });

    socket.on('join', (room) => {
        console.log('join room: ' + room);
        socket.join(room);
        let roomData = rooms[room];
        io.to(room).emit('join', room, roomData);
        // io.to(room).emit('updateColor', rooms[room]);
    });
    socket.on('leave', (room) => {
        console.log('leave room: ' + room);
        socket.leave(room);
        io.to(room).emit('leave', room);
    });

    socket.on('updateColor', (data) => {
        io.to(data.currentRoom).emit('changeColor', data);

        if (!rooms.hasOwnProperty(data.currentRoom)) {
            rooms[data.currentRoom] = [];
        }
        // Récupérer la salle actuelle
        const room = rooms[data.currentRoom];
    
        // Vérifier si la cellule existe déjà
        const existingCellIndex = room.findIndex(cell => cell.cellId === data.cellId);
        
        if (existingCellIndex!== -1) {
            // La cellule existe, mettons à jour sa couleur
            room[existingCellIndex].color = data.newColor;
        } else {
            // La cellule n'existe pas, ajoutons-la
            room.push({ cellId: data.cellId, color: data.newColor });
        }
    });

})


server.listen(PORT, () => {
    console.log('Server ip : http://' +ip.address() +":" + PORT);
})

