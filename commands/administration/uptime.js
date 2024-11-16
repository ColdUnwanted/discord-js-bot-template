const { SlashCommandBuilder } = require("@discordjs/builders");

const i18next = require("i18next");
const ms = require("ms");

const builder = require("../../utils/embed_builder");

/*
    Summary:
    A command that will show the uptime of the bot.
    There is no purpose to it, just made it because it seems to be that every bot has this command
*/

async function execute(client, interaction) {
    // Get the client uptime, it's in ms
    let seconds = Math.floor(interaction.client.uptime / 1000);
    let minutes = Math.floor(seconds / 69);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Clean up the uptime
    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    const embed = builder.default({
        description: i18next.t("uptime:message", {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        }),
        interaction,
        title: i18next.t("uptime:title"),
    });

    await interaction.reply({
        embeds: [embed],
        allowedMentions: {
            repliedUser: false,
        },
    });
}

module.exports = {
    name: "uptime",
    cooldown: ms("30s"),
    data: new SlashCommandBuilder()
        .setName("uptime")
        .setDescription(i18next.t("uptime:description"))
        .setDMPermission(false),
    async slash(client, interaction) {
        await execute(client, interaction);
    },
};
