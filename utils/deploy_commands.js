const { REST, Routes } = require("discord.js");

const logger = require("./logger");

const fs = require("fs");
const { join } = require("path");

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

const commands = [];

module.exports.register_slash = async function (client) {
  // Load the commands
  function readFiles(dir) {
    const paths = fs.readdirSync(dir, { withFileTypes: true });

    return paths.reduce((files, path) => {
      if (path.isDirectory()) {
        files.push(...readFiles(join(dir, path.name)));
      } else if (path.isFile()) {
        files.push(join(dir, path.name));
      }

      return files;
    }, []);
  }

  const commandFiles = readFiles("commands").filter((file) =>
    file.endsWith(".js"),
  );

  for (const file of commandFiles) {
    const command = require(join(__dirname, "../", file));
    client.commands.set(command.name, command);

    if (command.data != null) {
      commands.push(command.data.toJSON());
    }
  }

  // Register the slash commands
  try {
    logger.info(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: commands,
      },
    );

    logger.info(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    logger.error(error);
  }
};
