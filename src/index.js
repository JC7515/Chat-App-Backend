import { app } from './socketIo.js';
import express from 'express';
import { server } from './socketIo.js';
import { SERVER_PORT } from './configEnv.js'
import fileUpload from 'express-fileupload'
import compression from 'compression'
import cors from 'cors'
import responseTime  from 'response-time'
import morgan from 'morgan'
// const app = express()
import profile from './v1/routes/profileRoutes.js'
import signUp from './v1/routes/signUpRoutes.js'
import login from './v1/routes/loginRoutes.js'
import groups from './v1/routes/groupsRoutes.js'
import users from './v1/routes/usersRoutes.js'
import members from './v1/routes/membersRoutes.js'
import messages from './v1/routes/messagesRoutes.js'
import chatsParticipants from './v1/routes/chatParticipants.js'
import notifications from './v1/routes/notificationsRoutes.js'
import contacts from './v1/routes/contactsRoutes.js'
import blocks from './v1/routes/blocksRoutes.js'
import chatHistoryDeletions from './v1/routes/chatHistoryDeletionsRouters.js'
import emails from './v1/routes/emailsRoutes.js'

app.use(morgan('dev'))

app.use(responseTime())

app.use(compression())

app.use(express.urlencoded({
    extended: false
}))


app.use(express.json({
    type: "application/json"
}))


app.use(cors({
    origin: 'http://localhost:3000',
    // origin: '*',
    methods: 'GET,PUT,POST,DELETE', 
    allowedHeaders: 'Content-Type, Authorization'
}))


app.use(fileUpload({useTempFiles: true, tempFileDir: './uploads'}))



app.use('/v1', login)
app.use('/v1', profile)
app.use('/v1', signUp)
app.use('/v1', groups)
app.use('/v1', users)
app.use('/v1', members)
app.use('/v1', messages)
app.use('/v1', chatsParticipants)
app.use('/v1', notifications)
app.use('/v1', contacts)
app.use('/v1', blocks)
app.use('/v1', chatHistoryDeletions)
app.use('/v1', emails)

// app.use('/v1', groups)
// app.use('/v1',memberships)


const SERVER = server.listen( SERVER_PORT, () => {
    console.log(`el servidor esta corriendo el puesto ${SERVER_PORT}`)
})


export default { SERVER }
