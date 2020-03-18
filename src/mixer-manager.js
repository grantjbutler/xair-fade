const osc = require('osc')

const Mixer = require('./mixer')

class MixerManager {
    constructor (options) {
        this.options = options
        this.mixers = []
    }

    connect (address, callback) {
        let udpPort = new osc.UDPPort({
            localAddress: this.options.localAddress,
            localPort: this.options.localPort,
            remoteAddress: address,
            remotePort: 10024,
            metadata: true
        })

        let mixer = new Mixer(udpPort)
        this.mixers.push(mixer)
        
        udpPort.on('error', (error) => {
            console.log(error)
        })

        udpPort.on('open', () => {
            callback(mixer)
        });

        udpPort.open()
    }
}

module.exports = MixerManager