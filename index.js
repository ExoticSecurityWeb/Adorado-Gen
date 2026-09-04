const { 
    Client, 
    GatewayIntentBits, 
    PermissionFlagsBits, 
    SlashCommandBuilder, 
    REST, 
    Routes 
} = require("discord.js");
const { Redis } = require("@upstash/redis");
const os = require("os");
const express = require('express');
const chalk = require('chalk');

// 1. Initialisation de la base de données Upstash Redis (récupère automatiquement les variables d'env)
const redis = Redis.from_env();

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

const botname = "Adorado Gen";
const generated = new Set();
const bannerUrl = "https://i.imgur.com/Z5ioo4B.jpeg";
const themeColor = 0x00d2ff;

// 2. Serveur Web pour Render (Maintien en ligne)
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Adorado Gen est en ligne !'));
app.listen(PORT, () => {
    console.log(`Serveur Web actif sur le port ${PORT}`);
});

// 3. Définition des Commandes Slash
const commands = [
    new SlashCommandBuilder()
        .setName("gen")
        .setDescription("Générer un compte pour un service spécifique")
        .addStringOption(option => 
            option.setName("service")
                .setDescription("Nom du service (ex: netflix)")
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Afficher les statistiques du bot"),

    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Afficher la liste des commandes disponibles"),

    new SlashCommandBuilder()
        .setName("add")
        .setDescription("Ajouter un compte à un service (Admin uniquement)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName("compte")
                .setDescription("Identifiants (ex: mail:pass)")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("service")
                .setDescription("Nom du service")
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("create")
        .setDescription("Créer un nouveau service (Admin uniquement)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName("service")
                .setDescription("Nom du nouveau service")
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("restock")
        .setDescription("Notifier un réapprovisionnement de service (Admin uniquement)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName("service")
                .setDescription("Nom du service réapprovisionné")
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName("quantite")
                .setDescription("Nombre de comptes ajoutés")
                .setRequired(true))
].map(command => command.toJSON());

// 4. Événement de démarrage
bot.on('clientReady', async () => {
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

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log("Mise à jour des commandes Slash (/)...");
        await rest.put(
            Routes.applicationCommands(bot.user.id),
            { body: commands }
        );
        console.log("Commandes Slash enregistrées avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'enregistrement des commandes Slash :", error);
    }

    console.log(`Statistiques : ${bot.guilds.cache.size} serveurs | ${bot.users.cache.size} membres.`);
    bot.user.setActivity("/help - Adorado Gen");
});

// 5. Gestion des Interactions
bot.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === "gen") {
        if (generated.has(interaction.user.id)) {
            return interaction.reply({ 
                content: "Vous avez un temps de récupération de 15 minutes !", 
                ephemeral: true 
            });
        }

        const service = options.getString("service").toLowerCase();

        const embedStockOut = {
            title: "En rupture de stock ou introuvable !",
            description: "Le service que vous avez demandé est actuellement en rupture de stock ou n'existe pas !",
            color: themeColor,
            timestamp: new Date(),
            footer: { icon_url: "https://i.imgur.com/Bl8zjHy.png", text: "Développé par Adorado#2556" },
            image: { url: bannerUrl },
            author: { name: botname + " - générateur de compte", url: "https://discord.gg/UezHmtRP7c", icon_url: bot.user.displayAvatarURL() }
        };

        const account = await redis.lpop(`service:${service}`);

        if (!account) {
            return interaction.reply({ embeds: [embedStockOut], ephemeral: true });
        }

        try {
            await interaction.user.send(`Voici votre compte **${service}** :\n\`${account}\``);
        } catch (e) {
            await redis.rpush(`service:${service}`, account);
            return interaction.reply({ content: "Impossible de vous envoyer un message privé. Vérifiez vos paramètres de confidentialité !", ephemeral: true });
        }

        const embedGen = {
            title: "Compte " + service + " généré !",
            description: "Le compte a été envoyé dans vos messages privés !",
            color: themeColor,
            timestamp: new Date(),
            footer: { icon_url: "https://i.imgur.com/Bl8zjHy.png", text: "Développé par Adorado#2556" },
            image: { url: bannerUrl },
            author: { name: botname + " - générateur de compte", url: "https://discord.gg/UezHmtRP7c", icon_url: bot.user.displayAvatarURL() }
        };

        interaction.reply({ embeds: [embedGen] });
        generated.add(interaction.user.id);
        setTimeout(() => {
            generated.delete(interaction.user.id);
        }, 900000);
    }

    else if (commandName === "stats") {
        const embed = {
            title: "Stats de " + botname,
            description: "Nombre total d'utilisateurs: `" + bot.users.cache.size + " membres`\nNombre total de salons: `" + bot.channels.cache.size + " salons`\nNombre total de serveurs: `" + bot.guilds.cache.size + " serveur(s)`\nCréé par Adorado#2556",
            color: themeColor,
            timestamp: new Date(),
            footer: { icon_url: "https://i.imgur.com/Bl8zjHy.png", text: "Développé par Adorado#2556" },
            image: { url: bannerUrl },
            author: { name: botname + " - générateur de compte", url: "https://discord.gg/UezHmtRP7c", icon_url: bot.user.displayAvatarURL() }
        };
        interaction.reply({ embeds: [embed] });
    }

    else if (commandName === "help") {
        const embed = {
            color: themeColor,
            title: botname + ' - générateur de compte',
            url: 'https://discord.gg/UezHmtRP7c',
            author: { name: 'Liste des commandes Slash', url: 'https://discord.gg/UezHmtRP7c' },
            image: { url: bannerUrl },
            description: '**Toutes les commandes s\'utilisent désormais avec `/`**',
            fields: [
                { name: 'Générer un compte', value: "`/gen service:<nom>`" },
                { name: 'Créer un service', value: "`/create service:<nom>`" },
                { name: 'Notifier un restock', value: "`/restock service:<nom> quantite:<nombre>`" },
                { name: 'Ajouter des comptes', value: "`/add compte:<mail:pass> service:<nom>`" },
                { name: 'Statistiques du bot', value: "`/stats`" }
            ],
            timestamp: new Date(),
            footer: { text: 'Développé par Adorado#2556', icon_url: 'https://i.imgur.com/Bl8zjHy.png' }
        };
        interaction.reply({ embeds: [embed] });
    }

    else if (commandName === "add") {
        const account = options.getString("compte");
        const service = options.getString("service").toLowerCase();

        await redis.rpush(`service:${service}`, account);

        const embed = {
            title: "Compte ajouté !",
            description: "Compte ajouté avec succès au service `" + service + "` !",
            color: themeColor,
            timestamp: new Date(),
            footer: { icon_url: "https://i.imgur.com/Bl8zjHy.png", text: "Développé par Adorado#2556" },
            image: { url: bannerUrl },
            author: { name: botname + " - générateur de compte", url: "https://discord.gg/UezHmtRP7c", icon_url: bot.user.displayAvatarURL() }
        };
        interaction.reply({ embeds: [embed] });
    }

    else if (commandName === "create") {
        const service = options.getString("service").toLowerCase();

        const embed = {
            title: "Service créé !",
            description: "Le service `" + service + "` a été créé avec succès !",
            color: themeColor,
            timestamp: new Date(),
            footer: { icon_url: "https://i.imgur.com/Bl8zjHy.png", text: "Développé par Adorado#2556" },
            image: { url: bannerUrl },
            author: { name: botname + " - générateur de compte", url: "https://discord.gg/UezHmtRP7c", icon_url: bot.user.displayAvatarURL() }
        };
        interaction.reply({ embeds: [embed] });
    }

    else if (commandName === "restock") {
        const service = options.getString("service");
        const count = options.getInteger("quantite");

        interaction.reply({ 
            content: `@everyone\n● Restock de compte: **${service}**\n● Nombre de comptes restock: **${count} compte(s)**\n● Restock par: <@${interaction.user.id}>`
        });
    }
});

bot.login(process.env.DISCORD_TOKEN);
