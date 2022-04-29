import { RefreshingAuthProvider } from "@twurple/auth"
import { ChatClient } from "@twurple/chat"
import { promises as fs } from "fs"
import dotenv from "dotenv-flow"

dotenv.config({
  default_node_env: "development",
})

const commandsInterval = 5 * 1000
// let running = true

const clientId = process.env.CLIENT_ID as string
const clientSecret = process.env.CLIENT_SECRET as string
const channel = process.env.CHANNEL as string

const coms = require('./commands.json')

async function main() {
  const tokenData = JSON.parse(await fs.readFile("./tokens.json", "utf-8"))
  const auth = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: async (newTokenData) =>
        await fs.writeFile(
          "./tokens.json",
          JSON.stringify(newTokenData, null, 2),
          "utf-8"
        ),
    },
    tokenData
  )

  const chatClient = new ChatClient(auth, { channels: [channel] })


  const placePlot = async () => {
    for (let i = 1; i <= coms.length; i++) {
      const [x, y, rgb] = coms[i - 1]
      const message = `!p ${x} ${y} ${rgb}`
      setTimeout(async () => {
        await chatClient.say(channel, message).then(
          () => {
            console.log("Send", { message })
          },
          (reason) => {
            console.error("Not sent", { message, reason })
          }
        )
      }, commandsInterval * i);
    }
  }
  await chatClient.connect();
  await placePlot();
}

main()