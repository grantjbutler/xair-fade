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
            console.log('[osc] Port open, can now communicate with a Behringer X32.');

            callback(mixer)
        });

        udpPort.on('raw', (buf) => {
            const str = buf.toString('ascii');
            console.log(str)
        })

        udpPort.open()
    }
}

module.exports = MixerManager