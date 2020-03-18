# xair-fade

xair-fade provides an interface for interacting with a Behringer X-AIR mixer, with the specific purpose of fading in and out specific channels.

## Usage

To use this piece of software, run the following commands:

```bash
npm install
node src/index.js --ip <mixer ip address>
```

This will start serving an HTTP API on port 8080 for interacting with the mixer. To change the port, supply a `--web-port` argument with a new port number.

## HTTP API

### GET /channel/:channel

Returns mix information about a channel.

#### Response

```json
{
    "isOn": true,
    "level": 0.75,
    "isStereoLinked": false,
    "pan": 0.5
}
```

### GET /channel/:channel/level

Returns the level of the channel.

#### Response

```json
{
    "level": 0.75
}
```

### POST /channel/:channel/level

Sets the level of a channel, optionally ramping to the new level over a duration in milliseconds.

#### Request Body

```json
{
    "level": 0.75
}
```

```json
{
    "level": 0.75,
    "duration": 300
}
```

#### Response

```json
{
    "level": 0.75
}
```

### GET /channel/:channel/on

Returns whether a channel is muted or not.

#### Response

```json
{
    "isOn": true
}
```

### POST /channel/:channel/on

Mutes or unmutes a channel.

#### Request Body

```json
{
    "isOn": false
}
```

#### Response

```json
{
    "isOn": false
}
```
