const { SlashCommandBuilder } = require("discord.js");

function getColor(ping) {
    if (ping < 300) return 0x88ff88
    if (ping < 500) return 0xffbb88
    return 0xff8888
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Vous donne la latence du bot !"),
    async run(interaction) {
        // const ping = Date.now() - new Date(interaction.createdTimestamp)
        const pingingEmbed = {
            title: ":ping_pong: Calcul du temps de latence",
            description: ". . .",
        }

        const sent = await interaction.reply({
            embeds: [
                pingingEmbed
            ],
            fetchReply: true
        })
        const ping = sent.createdTimestamp - interaction.createdTimestamp
        const embed = {
            title: ":ping_pong: Pong !",
            description: "Mon temps de latence est de :```" + ping + " ms```",
            color: getColor(ping)
        }

        interaction.editReply({
            embeds: [embed]
        })

    }
}