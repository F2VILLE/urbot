const ExtendedClient = require("../class/ExtendedClient")
/**
 * 
 * @param {ExtendedClient} client 
 */
module.exports = async (client) => {
    console.log("Logged in as " + client.user.username)
}