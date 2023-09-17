const { default: axios } = require("axios");
const { SlashCommandBuilder, ComponentBuilder, ButtonBuilder, Emoji, ActionRowBuilder, ButtonStyle } = require("discord.js");
const ytdl = require("ytdl-core")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("motd")
        .setDescription("Quelle est la musique du jour ?")
        .addStringOption(inp => inp
            .setRequired(false).setDescription("Trouvez la musique du jour d'une date spécifique ! (format: 2023-09-16)").setName("date")),
    async run(interaction) {
        await interaction.deferReply()
        axios("https://urlab.be/api/space/motd/", {
            method: "GET"
        }).then(async r => {
            let mod
            const date = interaction.options.getString("date")
            if (interaction.options.getString("date")) {
                motd = r.data.results.find(x => x.day == date)
            } else {
                motd = r.data.results[0]
            }
            if (!motd) return interaction.editReply({
                embeds: [
                    {
                        title: ":x: Aucune musique pour le " + date,
                        description: "Si vous souhaitez trouver une musique du jour, rendez vous sur [UrLab](https://urlab.be/space/motd) !",
                        color: 0xff9955
                    }
                ]
            })
            const embed = {
                title: ":musical_note: Musique du Jour !",
                color: 0x7059d4
            }
            embed.description = `[Lien vers la musique](${motd.url})`
            embed.footer = { text: `Musique du ${new Date(motd.day).toLocaleDateString("fr-FR")}` }
            if (ytdl.validateURL(motd.url)) {
                const yturl = motd.url.includes("youtu.be") ? "https://youtube.com/watch?v=" + motd.url.split("/").pop() : motd.url
                try {

                    console.log("Trying to get infos from " + yturl)
                    const infos = await ytdl.getBasicInfo(yturl)
                    const details = infos.videoDetails
                    embed.description = `
                        **${details.title}** - ${details.author.name}
                    `
                    embed.image = { url: details.thumbnails.sort((a, b) => b.width - a.width)[0].url }
                } catch (error) {
                    if (error.statusCode == 410) {
                        embed.description = "La vidéo est soumise à une restriction d'âge. Veuillez ouvrir la page pour voir les infos et l'écouter !"
                    }
                    else {
                        console.error(e)
                        interaction.editReply({
                            embeds: [
                                {
                                    title: ":x: Une erreur s'est produite :(",
                                    description: "J'ai rencontré une erreur, si celà persiste, veuillez contacter l'un des développeurs !",
                                    color: 0xff8888
                                }
                            ]
                        })
                    }
                }
            }

            const openButton = new ButtonBuilder().setURL(motd.url).setLabel("Écouter").setEmoji({ name: "🔊" }).setStyle(ButtonStyle.Link)
            const componentRow = new ActionRowBuilder().addComponents(openButton)
            interaction.editReply({
                embeds: [
                    embed
                ],
                components: [
                    componentRow
                ],
                fetchReply: true
            })
        }).catch(e => {
            console.error(e)
            interaction.editReply({
                embeds: [
                    {
                        title: ":x: Une erreur s'est produite :(",
                        description: "J'ai rencontré une erreur, si celà persiste, veuillez contacter l'un des développeurs !",
                        color: 0xff8888
                    }
                ]
            })
        })

    }
}