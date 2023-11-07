const ExtendedClient = require("../class/ExtendedClient")
/**
 * 
 * @param {ExtendedClient} client 
 */
module.exports = async (client) => {
    console.log("Logged in as " + client.user.username)
    client.mqtt.subscribe("urlab_status")
    client.mqtt.on("message", (topic, payload) => {
        console.log(`New message on ${topic}: ${payload}`)
        console.log(topic == "urlab_status")
        console.log(payload.toString())
        console.log(["open", "closed"].includes(payload))
        if (topic == "urlab_status") {
            if (["open", "closed"].includes(payload.toString())) {
                console.log("Sending status on discord")
                const isOpen = (payload.toString() == "open" ? true : false)
                console.log("IsOpen :" ,isOpen)
                console.log("Guild", client.guilds.cache.get(process.env.GUILD).name)
                console.log("Channel", client.guilds.cache.get(process.env.GUILD).channels.cache.get(process.env.CHANNEL).name)
                client.guilds.cache.get(process.env.GUILD).channels.cache.get(process.env.CHANNEL).send({
                    embeds: [
                        {
                            title: (isOpen ? ":white_check_mark: UrLab est ouvert !" : ":x: UrLab est fermé :("),
                            image: {url:(isOpen ? "https://urlab.be/static/img/space-invaders-open.png" : "https://urlab.be/static/img/space-invaders.png")},
                            color: (isOpen ? 0x99ff99 : 0xff9999)
                        }
                    ]
                })
            }
        }
    })
}