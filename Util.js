const marked = require("marked");
const Joi = require("joi");
const moment = require("moment");
const chunk = require("chunk");
module.exports = class Utils {
    /**
     * @param {Object} bot 
     * @param user
     * @returns {Object}
     */
    static async attachPropBot(bot, user = {}) {
        const client = require("./ConstantStore").bot;
        const { r } = require("./ConstantStore");
        const botUser = client.users.get(bot.id) || await client.users.fetch(bot.id);
        bot.online = botUser.presence.status !== "offline";
        bot._discordAvatarURL = botUser.displayAvatarURL({format: "png", size: 512});
        bot._markedDescription = marked(bot.longDescription, {sanitize: true});
        bot._ownerViewing = user.id === bot.ownerID;
        bot._comments = await r.table("comments").filter({botID: bot.id}).run();
        try {
            bot._ownerTag = client.users.get(bot.ownerID).tag;
        }
        catch(e) {
            bot._ownerTag = "Unknown#0000";
        }
        if (user.id) {
            const like = (await r.table("likes").filter({userID: user.id, botID: bot.id}).run())[0];
            bot._userLikes = !!like;
        }
        bot.likeCount = await r.table("likes").filter({botID: bot.id}).count().run();
        return bot;
    }
    /**
     * Hides sensetive and internal data from bots.
     * @param {Object} bot 
     */
    static hidePropsBot(bot) {
        delete bot._discordAvatarURL;
        delete bot._markedDescription;
        delete bot._ownerViewing;
        delete bot.apiToken;
        return bot;
    }

    /**
     * Hides sensetive and internal data from bots.
     * @param user
     * @param hideBots
     */
    static hidePropsUser(user, hideBots = true) {
        delete user.discordAT;
        delete user.discordRT;
        delete user._fmtCreatedAt;
        if (hideBots) user._bots = user._bots.map(Utils.hidePropsBot);
        delete user._verifiedBots;
        return user;
    }
    /**
     * @param {Object} user
     * @returns {Object} 
     */
    static async attachPropUser(user) {
        const client = require("./ConstantStore").bot;
        const { r } = require("./ConstantStore");
        const discordUser = client.users.get(user.id) || await client.users.fetch(user.id);
	user.online = discordUser.presence.status !== 'offline';
	user.discriminator = discordUser.discriminator;
        user._discordAvatarURL = discordUser.displayAvatarURL({ format: "png", size: 512 });
        user._bots = await Promise.all((await r.table("bots").filter({ownerID: user.id})).map(b => Utils.attachPropBot(b)));
        user._verifiedBots = user._bots.filter(bot => bot.verified);
        user._chunked = chunk(user._verifiedBots, 4);
        if (user.mod) user.badges.push("Moderator");
        if (user.admin) user.badges.push("Administrator");
        return user;
    }
    /**
     * method for api endpoints
     */
    static filterUnexpectedData(orig, startingData, schema) {
        const data = Object.assign({}, startingData);
        Object.keys(schema.describe().children).forEach(key => {
            data[key] = orig[key];
        });
        return data;
    }
    /**
     * method for api endpoints
     */
    static handleJoi(schema, req, res) {
        const wdjt = Joi.validate(req.body, schema); // What Does Joi Think (wdjt)
        if (wdjt.error) {
            if (!wdjt.error.isJoi) {
                console.error("Error while running Joi.", wdjt.error);
                res.status(500).json({error: "Internal Server Error"});
                return true;
            }
            res.status(400).json({error: wdjt.error.name, details: wdjt.error.details.map(item => item.message)});
            return true;
        }
        return false;
    }
};
