module.exports = {
    help: {
        description: 'Removes a role from a person'
    }
};

module.exports.run = async (client, msg, args) => {
    if (!msg.member.permissions.has("MANAGE_SERVER")) return msg.reply("you cannot use this command!");
    let member = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
    if (!member) return msg.channel.send(`<:customX:485196473441583134> Couldn't find that user`)
    let role = args.slice(1).join(' ');
    if (!role) return msg.channel.send(`<:customX:485196473441583134> Please specifiy a role`);
    let gRole = msg.guild.roles.find(`name`, role);
    if (!gRole) return msg.channel.send(`<:customX:485196473441583134> Couldn't find that role`);

    if (!member.roles.has(gRole.id)) return msg.channel.send(`<:customX:485196473441583134> That user doesn't have that role`);
    member.removeRole(gRole.id).then(() => {
        msg.channel.send(`<:customCheck:485196148064256019> Removed role **${gRole.name}** from <@${member.id}>. `)
    }).catch((e) => {
        msg.channel.send(`<:customX:485196473441583134> An unexpected error has occurred while removing the role from <@${member.id}>. The error has been logged.`);
        console.log(e);
    });


};