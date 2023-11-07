const { Client, IntentsBitField, REST, Routes } = require("discord.js"),
    fs = require("fs")

const mqtt = require("mqtt");

class ExtendedClient extends Client {
    constructor(token) {
        super({
            intents: [
                IntentsBitField.Flags.GuildEmojisAndStickers,
                IntentsBitField.Flags.GuildIntegrations,
                IntentsBitField.Flags.GuildInvites,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildMessageTyping,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildModeration,
                IntentsBitField.Flags.GuildPresences,
                IntentsBitField.Flags.GuildScheduledEvents,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.GuildWebhooks,
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.AutoModerationConfiguration,
                IntentsBitField.Flags.AutoModerationExecution,
                IntentsBitField.Flags.DirectMessages
            ]
        })
        this.token = token
        this.commands = new Map()
    }

    start() {
        this.loadCommands()
        this.setCommandHandler()
        this.loadEvents()
        this.mqtt = mqtt.connect(process.env.MQTT_BROKER)
        this.mqtt.on("connect", () => {
            this.login(this.token).then(() => {
                this.registerSlashCommands()
            })    
            console.log("[MQTT] connected ! :", this.mqtt.options.host)
        })

        this.mqtt.on("disconnect", () => {
            console.log("{MQTT} disconnected !")
        })

        this.mqtt.on("error",(e) => {
            console.log("[MQTT] Error :", e)
        })

    }

    setCommandHandler() {
        this.on("interactionCreate", (interaction) => {
            if (interaction.isCommand()) {
                if (this.commands.has(interaction.commandName)) {
                    this.commands.get(interaction.commandName).run(interaction)
                }
            }
        })
    }

    async registerSlashCommands() {
        const rest = new REST().setToken(this.token);

        const commands = []
        for (const file of fs.readdirSync("./commands/")) {
            const prop = require("../commands/" + file)
            commands.push(prop.data.toJSON())
        }
        const guilds = await this.guilds.fetch()
        console.log("Updating /commands . . .")
        for (const guild of guilds.keys()) {
            try {

                const data = await rest.put(
                    Routes.applicationGuildCommands(this.user.id, guild),
                    { body: commands },
                );

                console.log(`Updated ${commands.length} commands on ${guild}.`);
            } catch (error) {
                console.error(error);
            }

        }
    }

    loadCommands() {
        for (const file of fs.readdirSync("./commands/")) {
            const prop = require("../commands/" + file)
            this.commands.set(prop.data.name, prop)
        }
    }

    loadEvents() {
        for (const file of fs.readdirSync("./events/")) {
            const prop = require("../events/" + file)
            this.on(file.split(".").shift(), (...args) => prop(this, ...args))
        }
    }

}

module.exports = ExtendedClient