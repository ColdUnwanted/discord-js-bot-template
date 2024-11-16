const { SlashCommandBuilder } = require("@discordjs/builders");

const i18next = require("i18next");
const ms = require("ms");
const prettyMs = require("pretty-ms");

const builder = require("../../utils/embed_builder");

/*
    Summary:
    A command that will show the ping to Discord's API & their websocket. Also added another ping to wiki site, technically that is not needed.
    Purpose of this is just to know how's the ping like.
*/

async function execute(client, interaction) {
    const websocket_ping = Math.round(client.ws.ping);

    const embed = builder.default({
        description: i18next.t("ping:message", {
            websocket: websocket_ping + "ms",
            api: "Testing...",
        }),
        interaction,
        title: i18next.t("ping:title"),
    });

    // Get the api start and end time
    let date = new Date();
    const start_time = date.getTime();
    await interaction
        .reply({
            embeds: [embed],
            allowedMentions: {
                repliedUser: false,
            },
        })
        .catch(console.error);

    date = new Date();
    const end_time = date.getTime();

    // Edit the msg to add the api
    embed.setDescription(
        i18next.t("ping:message", {
            websocket: websocket_ping + "ms",
            api: prettyMs(end_time - start_time),
        }),
    );

    await interaction.editReply({
        embeds: [embed],
    });
}

module.exports = {
    name: "ping",
    cooldown: ms("30s"),
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription(i18next.t("ping:description"))
        .setDMPermission(false),
    async slash(client, interaction) {
        await execute(client, interaction);
    },
};
