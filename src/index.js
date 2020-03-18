const { isIPv4 } = require('net')
const os = require('os')

const { program } = require('commander')

const MixerManager = require('./mixer-manager')

program
    .version('0.0.1')
    .requiredOption('-i, --ip <ip>', 'Mixer IP address')
    .option('-p, --web-port <port>', 'Port on which the HTTP API will be served', 8080)

program.parse(process.argv)

let manager = new MixerManager({
    localAddress: '0.0.0.0',
    localPort: 57121
})
manager.connect(program.ip, (mixer) => {
    // mixer.fadeTo(12, 0.75, 1000)
})