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

    getChannel (channel, bus, callback) {
        if (typeof bus == 'function' && callback == undefined) {
            callback = bus
            bus = undefined
        }

        if (bus == undefined) {
            this._send(
                '/ch/' + channelNumberToString(channel) + '/mix',
                (message) => {                
                    callback({
                        isOn: message.args[0].value == 1,
                        level: message.args[1].value,
                        isStereoLinked: message.args[2].value == 1,
                        pan: message.args[3].value
                    })
                }
            )
        } else {
            this._send(
                '/ch/' + channelNumberToString(channel) + '/mix/' + channelNumberToString(bus),
                (message) => {
                    callback({
                        level: message.args[0].value,
                        type: message.args[2].value,
                        pan: message.args[3].value
                    })
                }
            )
        }
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

    fadeTo (channel, bus, level, duration) {
        if (duration == undefined) {
            duration = level
            level = bus
            bus = undefined
        }
        
        this.level(channel, bus, (currentLevel) => {
            console.log(currentLevel)
            
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
                    this.setLevel(channel, bus, level)
                } else {
                    currentLevel += change
                    this.setLevel(channel, bus, currentLevel)
                }

                stepNumber++
                if (stepNumber < numberOfSteps) {
                    setTimeout(runStep, stepDuration)
                }
            }

            runStep()
        })
    }

    level (channel, bus, callback) {
        if (callback == undefined) {
            callback = bus
            bus = undefined
        }

        let address
        if (bus == undefined) {
            address = '/ch/' + channelNumberToString(channel) + '/mix/fader'
        } else {
            address = '/ch/' + channelNumberToString(channel) + '/mix/' + channelNumberToString(bus) + '/level'
        }

        this._send(address, (message) => {
            callback(message.args[0].value)
        })
    }

    setLevel (channel, bus, level) {
        if (level == undefined) {
            level = bus
            bus = undefined
        }

        let address
        if (bus == undefined) {
            address = '/ch/' + channelNumberToString(channel) + '/mix/fader'
        } else {
            address = '/ch/' + channelNumberToString(channel) + '/mix/' + channelNumberToString(bus) + '/level'
        }

        this._send(
            address,
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