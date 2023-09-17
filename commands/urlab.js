const { default: axios } = require("axios");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("urlab")
        .setDescription("Le UrLab est-il ouvert ?"),
    async run(interaction) {
        await interaction.deferReply()
        axios("https://urlab.be/api/space/openings", {
            method: "GET"
        }).then(r => {
            const isOpen = r.data.results[0].is_open
            interaction.editReply({
                embeds: [
                    {
                        title: (isOpen ? ":white_check_mark: UrLab est ouvert !" : ":x: UrLab est fermé :("),
                        image: {url:(isOpen ? "https://urlab.be/static/img/space-invaders-open.png" : "https://urlab.be/static/img/space-invaders.png")},
                        color: (isOpen ? 0x99ff99 : 0xff9999)
                    }
                ]
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