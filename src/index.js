const { isIPv4 } = require('net')
const os = require('os')

const { program } = require('commander')
const express = require('express')
const cors = require('cors')

const MixerManager = require('./mixer-manager')

program
    .version('0.1.0')
    .requiredOption('-i, --ip <ip>', 'Mixer IP address')
    .option('-p, --web-port <port>', 'Port on which the HTTP API will be served', 8080)

program.parse(process.argv)

let manager = new MixerManager({
    localAddress: '0.0.0.0',
    localPort: 57121
})
manager.connect(program.ip, (mixer) => {
    console.info(`Connected to mixer at ${program.ip}`)

    let app = express()

    app.use(cors())

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.param('channel', function (req, res, next, channel) {
        let channelNumber = parseInt(channel, 10)
        if (Number.isNaN(channelNumber)) {
            next(new Error('Invalid channel number'))
        }

        req.channel = channelNumber

        next()
    })

    app.param('bus', function (req, res, next, bus) {
        let busNumber = parseInt(bus, 10)
        if (Number.isNaN(busNumber)) {
            next(new Error('Invalid bus number'))
        }

        req.bus = busNumber

        next()
    })
    
    app.get('/channel/:channel', (req, res) => {
        mixer.getChannel(req.channel, (channel) => {
            res.json(channel)
        })
    })

    app.get('/channel/:channel/fader', (req, res) => {
        mixer.level(req.channel, (level) => {
            res.json({ level })
        })
    })

    app.post('/channel/:channel/fader', (req, res) => {
        let level = req.body.level
        if (typeof level != 'number' || level > 1.0 || level < 0.0) {
            return res.status(422).json({ error: 'Invalid level' })
        }

        let duration = req.body.duration
        if (typeof duration != 'undefined') {
            if (typeof duration != 'number') {
                return res.status(422).json({ error: 'Invalid duration' })
            }

            mixer.fadeTo(req.channel, level, duration)
        } else {
            mixer.setLevel(req.channel, level)
        }

        res.json({ level })
    })

    app.get('/channel/:channel/on', (req, res) => {
        mixer.isOn(req.channel, (isOn) => {
            res.json({ isOn })
        })
    })

    app.post('/channel/:channel/on', (req, res) => {
        let isOn = req.body.isOn
        if (typeof isOn != 'boolean') {
            return res.json({ error: 'Invalid isOn' })
        }

        if (isOn) {
            mixer.unmute(req.channel)
        } else {
            mixer.mute(req.channel)
        }

        res.json({ isOn })
    })

    app.get('/channel/:channel/bus/:bus', (req, res) => {
        mixer.getChannel(req.channel, req.bus, (channel) => {
            res.json(channel)
        })
    })

    app.post('/channel/:channel/bus/:bus/fader', (req, res) => {
        let level = req.body.level
        if (typeof level != 'number' || level > 1.0 || level < 0.0) {
            return res.status(422).json({ error: 'Invalid level' })
        }

        let duration = req.body.duration
        if (typeof duration != 'undefined') {
            if (typeof duration != 'number') {
                return res.status(422).json({ error: 'Invalid duration' })
            }

            mixer.fadeTo(req.channel, req.bus, level, duration)
        } else {
            mixer.setLevel(req.channel, req.bus, level)
        }

        res.json({ level })
    })

    app.listen(program.webPort)
})