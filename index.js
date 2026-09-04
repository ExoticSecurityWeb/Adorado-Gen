const Discord = require("discord.js");

// 1. Déclaration des intents
const botOptions = {
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent
  ]
};

// 2. Client Discord
const bot = new Discord.Client(botOptions);

const config = require("./config.json");
const prefix = config.prefix;
const botname = "Adorado Gen";
const prefix1 = "+";
var fs = require("fs");
var lineReader = require("line-reader");
var async = require("async");
const firstline = require("firstline");
const generated = new Set();
var os = require("os");
var express = require('express');
var app = express();
const chalk = require('chalk');

// --- SERVEUR WEB POUR RENDER (Résout l'erreur de port fermé) ---
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Adorado Gen est en ligne !'));
app.listen(PORT, () => {
    console.log(`Serveur Web actif sur le port ${PORT}`);
});

bot.on('clientReady', () => {
  console.log("");                                   
  console.log((chalk.cyan(`                                            #####                                      #####                `)));
  console.log((chalk.cyan(`                                           #     #   ##   #        ##    ####  #    # #     # ###### #    # `)));
  console.log((chalk.cyan(`                                           #        #  #  #       #  #  #    # #   #  #       #      ##   # `)));
  console.log((chalk.cyan(`                                           #  #### #    # #      #    # #      ####   #  #### #####  # #  # `)));
  console.log((chalk.cyan(`                                           #     # ###### #      ###### #      #  #   #     # #      #  # # `)));
  console.log((chalk.cyan(`                                           #     # #    # #      #    # #    # #   #  #     # #      #   ## `)));
  console.log((chalk.cyan(`                                            #####  #    # ###### #    #  ####  #    #  #####  ###### #    # `)));
  console.log("");                                  
  console.log((chalk.yellow(`                                                               Crée par Adorado#2556 !`)));  
  console.log((chalk.yellow(`                                                                © 2026 Adorado, Gen.`))); 
  console.log("");                                   
  console.log((chalk.red(`                                                         Discord: https://discord.gg/UezHmtRP7c`)));   
  console.log((chalk.red(`                                                       Twitter: https://twitter.com/`)));   
  console.log((chalk.red(`                                                        Github: https://github.com/`)));   
  console.log((chalk.red(`                                                        Youtube: `)));   
  console.log("");                                  

  console.log(`Statistiques globales : \n\nLe bot a un total de ${bot.guilds.cache.size} serveurs. \nPour un total de ${bot.users.cache.size} membres.`);
  console.log("Connecté en tant que " + bot.user.id + " | Prefix : " + prefix1 + " | Nombre de Serveurs "+ bot.guilds.cache.size +" | Nombres de salons "+ bot.channels.cache.size +" | Utilisateur totaux "+ bot.users.cache.size +" | Nombre d'emojis totaux "+ bot.emojis.cache.size +'');
  bot.user.setActivity("+help - Adorado Gen");
});

bot.on("messageCreate", message => {
    if (message.channel.id === config.botChannel) { 
        if (message.author.bot) return;
        var command = message.content
            .toLowerCase()
            .slice(prefix.length)
            .split(" ")[0];

        if (command === "gen") {
            if (generated.has(message.author.id)) {
                message.channel.send(
                    "Vous avez un temps de récupération de 15 minutes! - " +
                    message.author.tag
                );
            } else {
                let messageArray = message.content.split(" ");
                let args = messageArray.slice(1);
                if (!args[0])
                    return message.reply("Veuillez fournir un service!");

                const filePath = __dirname + "/comptes/" + args[0] + ".txt";

                const embed = {
                    title: "En rupture de stock!",
                    description: "Le service que vous avez demandé est actuellement en rupture de stock!",
                    color: 0xff033d,
                    timestamp: new Date(),
                    footer: {
                        icon_url: "https://i.imgur.com/Bl8zjHy.png",
                        text: "Développé par Adorado#2556"
                    },
                    image: { url: "https://i.imgur.com/XuVrWQh.png" },
                    author: {
                        name: botname + " - générateur de compte",
                        url: "https://discord.gg/UezHmtRP7c",
                        icon_url: bot.user.displayAvatarURL()
                    },
                    fields: []
                };

                fs.readFile(filePath, function (err, data) {
                    if (!err) {
                        data = data.toString();
                        var position = data.indexOf("\n");
                        var firstLine = data.split("\n")[0];
                        if (position == -1)
                            return message.channel.send({ embeds: [embed] });

                        message.author.send(firstLine);
                        if (position != -1) {
                            data = data.substr(position + 1);
                            fs.writeFile(filePath, data, function (err) {
                                const embedGen = {
                                    title: "Compte " + args[0] + " généré!",
                                    description: "Le compte de votre service demandé a été envoyé en tant que DM!",
                                    color: 0xff033d,
                                    timestamp: new Date(),
                                    footer: {
                                        icon_url: "https://i.imgur.com/Bl8zjHy.png",
                                        text: "Développé par Adorado#2556"
                                    },
                                    image: {
                                        url: "https://i.imgur.com/X1QIYyS.gif"
                                    },
                                    author: {
                                        name: botname + " - générateur de compte",
                                        url: "https://discord.gg/UezHmtRP7c",
                                        icon_url: bot.user.displayAvatarURL()
                                    },
                                    fields: []
                                };
                                message.channel.send({ embeds: [embedGen] });
                                generated.add(message.author.id);
                                setTimeout(() => {
                                    generated.delete(message.author.id);
                                }, 150000);
                                if (err) {
                                    console.log(err);
                                }
                            });
                        } else {
                            message.channel.send("En rupture de stock!");
                        }
                    } else {
                        const embedNotFound = {
                            title: "Service non trouvé!",
                            description: "Le service demandé est introuvable!",
                            color: 0xff033d,
                            timestamp: new Date(),
                            footer: {
                                icon_url: "https://i.imgur.com/Bl8zjHy.png",
                                text: "Développé par Adorado#2556"
                            },
                            image: { url: "https://i.imgur.com/XuVrWQh.png" },
                            author: {
                                name: botname + " - générateur de compte",
                                url: "https://discord.gg/UezHmtRP7c",
                                icon_url: bot.user.displayAvatarURL()
                            },
                            fields: []
                        };
                        message.channel.send({ embeds: [embedNotFound] });
                        return;
                    }
                });
            }
        }
        else if (command === "stats") {
            const embed = {
                title: "Stats de " + botname,
                description: "Nombre total d'utilisateurs: `" + bot.users.cache.size + " membres`\nNombre total de salons: `" + bot.channels.cache.size + " salons`\nNombre total d'émojis: `" + bot.emojis.cache.size + " émojis`\nNombre total de serveurs: `" + bot.guilds.cache.size + " serveur(s)`\nCréé par Adorado#2556",
                color: 0xff033d,
                timestamp: new Date(),
                footer: {
                    icon_url: "https://i.imgur.com/Bl8zjHy.png",
                    text: "Développé par Adorado#2556"
                },
                image: { url: "https://i.imgur.com/XuVrWQh.png" },
                author: {
                    name: botname + " - générateur de compte",
                    url: "https://discord.gg/UezHmtRP7c",
                    icon_url: bot.user.displayAvatarURL()
                },
                fields: []
            };
            message.channel.send({ embeds: [embed] });
        }
        
        if (command === "help") {
            const embed = {
                color: 0xff033d,
                title: botname + ' - générateur de compte',
                url: 'https://discord.gg/UezHmtRP7c',
                author: {
                    name: 'Liste des commandes',
                    url: 'https://discord.gg/UezHmtRP7c',
                },
                image: { url: "https://i.imgur.com/XuVrWQh.png" },
                description: '**Ceci est une liste de toutes les commandes**',
                fields: [
                    {
                        name: 'Générer des comptes',
                        value: "Exemple: `" + prefix1 + "gen <Nom du service>`",
                    },
                    {
                        name: 'Créer un service',
                        value: "Exemple: `" + prefix1 + "create <Nom du service>`",
                    },
                    {
                        name: 'Notifier les restocks de compte',
                        value: "Exemple: `" + prefix1 + "restock <Nom du service> <Nombre de compte>`",
                    },
                    {
                        name: 'Ajouter des comptes',
                        value: "Exemple: `" + prefix1 + "add <mail:pass> <Nom du service>`",
                    },
                    {
                        name: 'Afficher les statistiques du bot ' + botname,
                        value: "Exemple: `" + prefix1 + "stats`",
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Développé par Adorado#2556',
                    icon_url: 'https://i.imgur.com/Bl8zjHy.png',
                },
            };
            message.channel.send({ embeds: [embed] });
        }

        if (command === "add") {
            if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator))
                return message.reply("Vous n'avez pas les autorisations pour faire cela!");

            let messageArray = message.content.split(" ");
            let args = messageArray.slice(1);
            var account = args[0];
            var service = args[1];
            if (!account) return message.reply("Fournissez d'abord une chaîne de compte formatée!");
            if (!service) return message.reply("Fournissez d'abord un service!");
            const filePath = __dirname + "/comptes/" + args[1] + ".txt";
            fs.appendFile(filePath, os.EOL + args[0], function (err) {
                if (err) return console.log(err);
                const embed = {
                    title: "Compte ajouté!",
                    description: "Compte ajouté avec succès à `" + service + "`!",
                    color: 0xff033d,
                    timestamp: new Date(),
                    footer: {
                        icon_url: "https://i.imgur.com/Bl8zjHy.png",
                        text: "Développé par Adorado#2556"
                    },
                    image: { url: "https://i.imgur.com/XuVrWQh.png" },
                    author: {
                        name: botname + " - générateur de compte",
                        url: "https://discord.gg/UezHmtRP7c",
                        icon_url: bot.user.displayAvatarURL()
                    },
                    fields: []
                };
                message.channel.send({ embeds: [embed] });
            });
        }

        if (command === "create") {
            if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator))
                return message.reply("Vous n'avez pas les autorisations pour faire cela!");

            let messageArray = message.content.split(" ");
            let args = messageArray.slice(1);
            const filePath = __dirname + "/comptes/" + args[0] + ".txt";
            fs.writeFile(filePath, 'Adorado:Adorado', function (err) {
                if (err) throw err;
                const embed = {
                    title: "Service créé!",
                    description: "Service créé avec succès `" + args[0] + "`!",
                    color: 0xff033d,
                    timestamp: new Date(),
                    footer: {
                        icon_url: "https://i.imgur.com/Bl8zjHy.png",
                        text: "Développé par Adorado#2556"
                    },
                    image: { url: "https://i.imgur.com/XuVrWQh.png" },
                    author: {
                        name: botname + " - générateur de compte",
                        url: "https://discord.gg/UezHmtRP7c",
                        icon_url: bot.user.displayAvatarURL()
                    },
                    fields: []
                };
                message.channel.send({ embeds: [embed] });
            });
        }

        if (command === "restock") {
            const embed = {
                title: "Merci de mettre un service!",
                description: "Veuillez fournir le nom du service réapprovisionné!",
                color: 0xff033d,
                timestamp: new Date(),
                footer: {
                    icon_url: "https://i.imgur.com/Bl8zjHy.png",
                    text: "Développé par Adorado#2556"
                },
                image: { url: "https://i.imgur.com/XuVrWQh.png" },
                author: {
                    name: botname + " - générateur de compte ",
                    url: "https://discord.gg/UezHmtRP7c",
                    icon_url: bot.user.displayAvatarURL()
                },
                fields: []
            };
            let messageArray = message.content.split(" ");
            let args = messageArray.slice(1);
            if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator))
                return message.reply("Vous n'avez pas les autorisations pour faire cela!");
            if (!args[0] || !args[1]) {
                return message.channel.send({ embeds: [embed] });
            } else {
                message.channel.send("@everyone\n● Restock de compte: **" + args[0] + "**\n● Nombre de compte restock: **" + args[1] + " compte(s)**\n● Restock par: " + "<@" + message.author.id + ">");
            }
        }
    }
});

bot.login(process.env.DISCORD_TOKEN);
