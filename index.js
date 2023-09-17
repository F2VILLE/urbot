const ExtendedClient = require("./class/ExtendedClient");
require("dotenv").config()

const client = new ExtendedClient(process.env.TOKEN)

client.start()