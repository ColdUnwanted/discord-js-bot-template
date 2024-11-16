const {
    Client,
    Events,
    GatewayIntentBits,
    Collection,
    PermissionFlagsBits,
} = require("discord.js");

// Load the environment variables
require("dotenv").config();

// i18n Localization
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const { join } = require("path");
const { readdirSync, lstatSync } = require("fs");

//i18n Configuration
i18next.use(Backend).init({
    initImmediate: false,
    lng: "en",
    ns: ["common", "ping"],
    defaultNS: "common",
    saveMissing: true,
    saveMissingTo: "current",
    fallbackLng: false,
    preload: readdirSync(join(__dirname, "locales")).filter((fileName) => {
        const joinedPath = join(join(__dirname, "locales"), fileName);
        const isDirectory = lstatSync(joinedPath).isDirectory();
        return isDirectory;
    }),
    backend: {
        loadPath: join(__dirname, "locales/{{lng}}/{{ns}}.json"),
        addPath: join(__dirname, "locales/{{lng}}/{{ns}}.missing.json"),
    },
});

// Ms
const prettyMs = require("pretty-ms");

// Import utils
const logger = require("./utils/logger");
const builder = require("./utils/embed_builder");
const deploy = require("./utils/deploy_commands");

// Create a new client instance
const client = new Client({
    disableMentions: "everyone",
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Client stuff
client.login(process.env.DISCORD_TOKEN);
client.commands = new Collection();
const cooldowns = new Collection();

// Setup logger
client.on(Events.Debug, (m) => logger.debug(m));
client.on(Events.Warn, (m) => logger.warn(m));
client.on(Events.Error, (m) => logger.error(m));

// Client ready event
client.once(Events.ClientReady, (c) => {
    // Register slash commands
    (async () => {
        await deploy.register_slash(client);
    })();

    // Display the bot information
    logger.info("");
    logger.info("------------------------------");
    logger.info("Logged in as: ");
    logger.info(`Username: ${client.user.username}`);
    logger.info(`ID: ${client.user.id}`);
    logger.info("------------------------------");
    logger.info("");

    // Set bot activity
    client.user.setActivity(process.env.BOT_ACTIVITY_NAME);
    client.user.setStatus("watching");
});

client.on(Events.InteractionCreate, async (interaction) => {
    // Slash command handling
    if (interaction.isCommand()) {
        // Check if the command exists
        if (!client.commands.has(interaction.commandName)) return;

        // Check if the bot has permission to view and send message to that channel
        const permission_for_channel = interaction.guild.channels.cache
            .get(interaction.channelId)
            .permissionsFor(client.user);
        if (
            !permission_for_channel.has(PermissionFlagsBits.ViewChannel) ||
            !permission_for_channel.has(PermissionFlagsBits.SendMessages)
        ) {
            const embed = builder.error({
                description: i18next.t("interactionPermissionError"),
                interaction,
            });

            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });

            return;
        }

        // Try to run the command
        try {
            const command = client.commands.get(interaction.commandName);

            // Check if there is a cooldown
            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Collection());
            }

            // Cooldown handler
            const now = Date.now();
            const timestamps = cooldowns.get(command.name);
            const cooldown_amount = (command.cooldown || 1) * 100;

            if (timestamps.has(interaction.user.id)) {
                const expiration_time =
                    timestamps.get(interaction.user.id) + cooldown_amount;

                if (now < expiration_time) {
                    const time_left = prettyMs(expiration_time - now, {
                        verbose: true,
                    });

                    const embed = builder.default({
                        description: i18next.t("cooldownMessage", {
                            time: time_left,
                        }),
                        interaction,
                    });

                    return interaction.reply({ embeds: [embed] });
                }
            }

            // No cooldown so give them cooldown
            timestamps.set(interaction.user.id, now);
            setTimeout(
                () => timestamps.delete(interaction.user.id),
                cooldown_amount,
            );

            command.slash(client, interaction);
        } catch (error) {
            logger.error(error);

            const embed = builder.error({
                description: i18next.t("interactionError", { type: "command" }),
                interaction,
            });

            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    }
});
