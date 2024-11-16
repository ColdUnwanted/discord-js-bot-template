const { EmbedBuilder } = require("discord.js");

module.exports.default = function ({
  description,
  interaction,
  title = interaction.user.username,
}) {
  const embed = new EmbedBuilder()
    .setColor(process.env.COLOR_DEFAULT)
    .setDescription(description)
    .setAuthor({
      name: title,
      iconURL: interaction.user.avatarURL(),
    })
    .setTimestamp();

  return embed;
};

module.exports.error = function ({
  description,
  interaction,
  title = interaction.user.username,
}) {
  const embed = new EmbedBuilder()
    .setColor(process.env.COLOR_ERROR)
    .setDescription(description)
    .setAuthor({
      name: title,
      iconURL: interaction.user.avatarURL(),
    })
    .setTimestamp();

  return embed;
};

module.exports.success = function ({
  description,
  interaction,
  title = interaction.user.username,
}) {
  const embed = new EmbedBuilder()
    .setColor(process.env.COLOR_SUCCESS)
    .setDescription(description)
    .setAuthor({
      name: title,
      iconURL: interaction.user.avatarURL(),
    })
    .setTimestamp();

  return embed;
};
