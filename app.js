const WebSocketServer = require('ws').Server

let wss = new WebSocketServer({ port: 9880 })

DEBUG = false
function debug_log() {
    if(DEBUG) {
        console.log.apply(this, arguments)
    }
}

let rooms = {}

wss.on('connection', client => {
    let room
    let user
    client.on('message', message => {
        let receivedMessage = JSON.parse(message)
        if(receivedMessage) {
            if('room' in receivedMessage) {
                room = receivedMessage['room']
            }
            if('user' in receivedMessage) {
                user = receivedMessage['user']
            }
            if(room in rooms) {
                if(!(user in rooms[room])) {
                    rooms[room][user] = client
                }
            } else {
                rooms[room] = {}
                rooms[room][user] = client
            }
            switch(receivedMessage['action']) {
                case 'seekTo':
                    sendToAllInRoomExceptSender(room, user, {
                        user: user,
                        action: 'seekTo',
                        seekTime: receivedMessage['seekTime']
                    })
                    break;
                case 'pause':
                    sendToAllInRoomExceptSender(room, user, {
                        user: user,
                        action: 'pause',
                        seekTime: receivedMessage['seekTime']
                    })
                    break;
                case 'play':
                    sendToAllInRoomExceptSender(room, user, {
                        user: user,
                        action: 'play',
                        seekTime: receivedMessage['seekTime']
                    })
                    break;
                case 'chat':
                    sendToAllInRoomExceptSender(room, user, {
                        user: user,
                        action: 'chat',
                        seekTime: receivedMessage['seekTime'],
                        message: receivedMessage['message']
                    })
                    break;
            }
            debug_log(rooms)
        }
    })
    client.on('close', e => {
        if(room in rooms && user in rooms[room]) {
            delete rooms[room][user]
        }
        debug_log(rooms)
    })
})

function sendToAllInRoomExceptSender(room, user, message) {
    for(userKey in rooms[room]) {
        if(userKey !== user) {
            let client = rooms[room][userKey]
            client.send(JSON.stringify(message), err => {
                if(err) {
                    debug_log(err)
                }
            })
        }
    }
}