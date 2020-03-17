const MixerManager = require('./mixer-manager')

let manager = new MixerManager({
    localAddress: '10.0.0.14',
    localPort: 12345
})
manager.connect('10.0.0.32', (mixer) => {
    mixer.fadeTo(12, 0.75, 1000)
})

// const osc = require('osc')

// let udpPort = new osc.UDPPort({
// 	localAddress: '10.0.0.14',
// 	localPort: 52361,
//     remoteAddress: '10.0.0.32',
//     remotePort: 10024,
//     metadata: true
// })

// udpPort.on('raw', (buf) => {
//     const str = buf.toString('ascii');
//     console.log(str)
// })

// udpPort.on('error', error => {
// 	console.warn('[osc] Error:', error.stack);
// });

// udpPort.on('open', () => {
// 	console.info('[osc] Port open, can now communicate with a Behringer X32.');
// });

// udpPort.on('close', () => {
// 	console.warn('[osc] Port closed.');
// });

// udpPort.open()

// // udpPort.send({
// //     address: '/mix/on'
// // })

// udpPort.send({
//     address: '/info'
// })

// // renewSubscriptions()

// // function renewSubscriptions() {
// // 	udpPort.send({
// // 		address: '/batchsubscribe',
// // 		args: [
// // 			// First defines the local endpoint that the X32 will send this subscription data to.
// // 			{type: 's', value: '/chMutes'},
// // 			{type: 's', value: '/mix/on'},
// // 			{type: 'i', value: 0},
// // 			{type: 'i', value: 63},
// // 			{type: 'i', value: 10}
// // 		]
// // 	});

// // 	udpPort.send({
// // 		address: '/batchsubscribe',
// // 		args: [
// // 			// First defines the local endpoint that the X32 will send this subscription data to.
// // 			{type: 's', value: '/chFaders'},
// // 			{type: 's', value: '/mix/fader'},
// // 			{type: 'i', value: 0},
// // 			{type: 'i', value: 63},
// // 			{type: 'i', value: 10}
// // 		]
// // 	});
// // }