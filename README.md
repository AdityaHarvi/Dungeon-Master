# Dungeon-Master Discord Bot
This bot is designed to operated by a group of friends on a private discord server. It also does not follow the exact rules of Dungeons and Dragons 5e, but instead a much more relaxed version with easier to understand set of rules. This works perfectly for new-comers to the game!\
This discord bot allows for player inventory management, basic combat with melee weapons and spells, player shopping (the host of the game can create a shop allowing players to purchase items from it), dice rolling capabilities among other functions.
## Getting Started
### Pre-Requisites for operating this bot:
- You need to create your own discord bot entity which can be invited to your private server.
  - [Tutorial on how to create your own bot can be found here.](https://discordpy.readthedocs.io/en/latest/discord.html)\
    When creating the bot, be sure to give it admin permissions.
- [Install NodeJS](https://nodejs.org/en/)
- Install dependencies with `npm install`
- Replace `getToken.getToken()` with your personal bot token- found on [this line](https://github.com/AdityaHarvi/Dungeon-Master/blob/main/main.js#L21) (remember to put it in quotes).\
  You may also need to remove [this line](https://github.com/AdityaHarvi/Dungeon-Master/blob/main/main.js#L3) depending on how you implemented your bot token.
### How to start the bot:
- Boot up your terminal and run `node main.js`! The bot should notify you (through the terminal) once it has setup the database and is accepting commands.
- From here you can create a game with `!create <campaign name>`. A list of further commands can be found in the wiki :)
  - There is no limit to how many players can join the game, but upon clicking the :+1: button, you will be assigned as the host of the game and all players will be allowed to pick their classes.
## Questions?
- Take a look at the [wiki](https://github.com/AdityaHarvi/Dungeon-Master/wiki)
