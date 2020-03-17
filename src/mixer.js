const osc = require('osc')
const util = require('util')

function channelNumberToString(num) {
    if (num < 10) {
        return '0' + num
    } else {
        return String(num)
    }
}

class Mixer {
    constructor (port) {
        this.port = port
        
        this.port.on('message', (message, time, info) => {
            console.log(`[${time}] Received message: ${util.inspect(message)}}`)

            if (Object.keys(this.callbacks).includes(message.address)) {
                let callbacks = this.callbacks[message.address]
                callbacks.forEach(callback => {
                    callback(message)
                });
            }

            this.callbacks[message.address] = []
        })

        this.levels = {}
        this.mutes = {}

        this.fades = {}

        this.callbacks = {}
    }

    mute (channel) {
        this._send(
            '/ch/' + channelNumberToString(channel) + '/mix/on',
            [
                {
                    type: 'i',
                    value: 0
                }
            ]
        )
    }

    unmute (channel) {
        this._send(
            '/ch/' + channelNumberToString(channel) + '/mix/on',
            [
                {
                    type: 'i',
                    value: 1
                }
            ]
        )
    }

    fadeTo (channel, level, duration) {
        this.level(channel, (currentLevel) => {
            let distance = level - currentLevel
            
            if (Math.abs(distance) < 1 / 1024) {
                return
            }
            
            let stepDuration = 50
            let numberOfSteps = duration / stepDuration
            let change = distance / numberOfSteps

            let stepNumber = 1
            let runStep = () => {
                if (stepNumber == numberOfSteps - 1) {
                    // last step, just set to the desired level
                    this.setLevel(channel, level)
                } else {
                    currentLevel += change
                    this.setLevel(channel, currentLevel)
                }

                stepNumber++
                if (stepNumber < numberOfSteps) {
                    setTimeout(runStep, stepDuration)
                }
            }

            runStep()
        })
    }

    level (channel, callback) {
        this._send('/ch/' + channelNumberToString(channel) + '/mix/fader', (message) => {
            callback(message.args[0].value)
        })
    }

    setLevel (channel, level) {
        this._send(
            '/ch/' + channelNumberToString(channel) + '/mix/fader',
            [
                {
                    type: 'f',
                    value: level
                }
            ]
        )
    }

    _send (address, args, callback) {
        if (callback == undefined && typeof args == 'function') {
            callback = args
            args = undefined
        }
        
        if (callback != undefined) {
            if (Object.keys(this.callbacks).includes(address)) {
                this.callbacks[address].push(callback)
            } else {
                this.callbacks[address] = [callback]
            }
        }
        
        this.port.send({
            address,
            args
        })
    }
}

module.exports = Mixer