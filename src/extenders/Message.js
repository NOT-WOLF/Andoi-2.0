const { Structures, APIMessage, MessageEmbed } = require("discord.js");
const AndoiEmbed = require("../struct/AndoiEmbed");
module.exports = Structures.extend(
  "Message",
  (Message) =>
    class AndoiMessage extends Message {
      constructor(...args) {
        super(...args);

        this.lastResponse = null;
        this.flags = [];
      }
      /*
      alias for translate
      */
      async t(thing, extra_args) {
        return this.client.lang.get(this.guild, thing, extra_args);
      }
      async translate(thing, extra_args) {
        return this.client.lang.get(this.guild, thing, extra_args);
      }
      /**
       *
       * @returns {AndoiEmbed} embed
       */
      embed() {
        return new AndoiEmbed();
      }
      /**
       *
       * @param {String} lang
       * @param {String} content
       * @param {Object} options
       * @returns {<Promise>}
       */
      sendCode(lang, content, options) {
        return this.send({
          content: content,

          options: options,
          code: lang,
        });
      }

      async send(content, options) {
        const transformedOptions = APIMessage.transformOptions(
          content,
          options
        );

        if ("files" in transformedOptions)
          return this.channel.send(transformedOptions);

        if (!transformedOptions.content) transformedOptions.content = null;
        if (!transformedOptions.embed) transformedOptions.embed = null;

        if (
          this.lastResponse &&
          !this.lastResponse.deleted &&
          !this.lastResponse.attachments.size
        ) {
          return this.lastResponse.edit(transformedOptions);
        }

        const sent = await this.channel.send(transformedOptions);
        this.lastResponse = Array.isArray(sent) ? sent.slice(-1)[0] : sent;

        return sent;
      }
      async awaitReply(question, filter, limit = 60000) {
        let e = new MessageEmbed().setDescription(question).setColor("RANDOM");
        await this.channel.send(e);

        return this.channel
          .awaitMessages(filter, { max: 1, time: limit, errors: ["time"] })
          .then((collected) => collected.first().content)
          .catch(() => false);
      }
      async awaitReact(question, filter, reactions, limit = 60000) {
        const msg = await this.channel.send(question);
        reactions.forEach((r) => {
          msg.react(r);
        });
        const rr = await msg.awaitReactions(filter, {
          max: 1,
          time: limit,
          errors: ["time"],
        });

        const ms = rr.first()._emoji.name;
        return ms;
      }
      succes(content) {
        if (!content) return this.react("786561775705129040");
        if (content) {
          this.channel.send(content);
          this.react("786561775705129040");
        }
      }

      error(content) {
        if (!content) return this.react("786561514122641408");
        if (content) {
          this.channel.send(content);
          this.react("786561514122641408");
        }
      }
    }
);
