import os
import discord
from discord import app_commands
from discord.ext import commands
from upstash_redis import Redis
import aiohttp
from aiohttp import web

# 1. Chargement sécurisé du token et connexion à la base de données Redis
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
redis = Redis.from_env()

# Configuration du Bot Discord (Intents nécessaires)
class AdoradoGenBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        super().__init__(command_prefix="!", intents=intents)

    async def setup_hook(self):
        await self.tree.sync()
        print("[INFO] Commandes slash synchronisées avec succès.")

bot = AdoradoGenBot()

botname = "Adorado Gen"
bannerUrl = "https://i.imgur.com/Z5ioo4B.jpeg"
themeColor = 0x00d2ff

# 2. Serveur Web (pour maintenir le bot en vie sur Render)
async def web_server(request):
    return web.Response(text="Adorado Gen est en ligne !")

async def start_web_server():
    app = aiohttp.web.Application()
    app.router.add_get('/', web_server)
    runner = aiohttp.web.AppRunner(app)
    await runner.setup()
    port = int(os.environ.get("PORT", 3000))
    site = aiohttp.web.TCPSite(runner, '0.0.0.0', port)
    await site.start()
    print(f"Serveur Web actif sur le port {port}")

@bot.event
async def on_ready():
    print(f"[INFO] Bot connecté en tant que {bot.user.name} (ID: {bot.user.id})")
    print(f"Statistiques : {bot.guilds.cache.size} serveurs | {bot.users.cache.size} membres.")
    bot.user.setActivity("/help - Adorado Gen")
    
    # Démarrage du serveur web en arrière-plan
    await start_web_server()

# Dictionnaire de cooldown simple pour la commande gen (15 minutes)
cooldowns = {}

# 3. Gestion des Commandes Slash
@bot.tree.command(name="gen", description="Générer un compte pour un service spécifique")
@app_commands.describe(service="Nom du service (ex: netflix)")
async def gen(interaction: discord.Interaction, service: str):
    service = service.lower()
    user_id = interaction.user.id

    # Vérification du cooldown de 15 minutes (900000 ms)
    import time
    now = time.time() * 1000
    if user_id in cooldowns and now - cooldowns[user_id] < 900000:
        remaining = math.ceil((900000 - (now - cooldowns[user_id])) / 60000)
        return await interaction.response.send_message(
            f"Vous avez un temps de récupération ! Réessayez dans environ {remaining} minute(s).", 
            ephemeral=True
        )

    # Récupération d'un compte dans la liste Redis (pop du premier élément)
    account = redis.lpop(f"service:{service}")

    embed_base = {
        "color": themeColor,
        "timestamp": str(discord.utils.utcnow()),
        "footer": { "icon_url": "https://i.imgur.com/Bl8zjHy.png", "text": "Développé par Adorado#2556" },
        "image": { "url": bannerUrl },
        "author": { "name": botname + " - générateur de compte", "url": "https://discord.gg/UezHmtRP7c", "icon_url": bot.user.displayAvatarURL() }
    }

    if not account:
        embed_not_found = {
            **embed_base,
            "title": "En rupture de stock ou inexistant !",
            "description": f"Le service **{service}** est soit introuvable, soit en rupture de stock."
        }
        return await interaction.response.send_message(embeds=[embed_not_found], ephemeral=True)

    try:
        await interaction.user.send(f"Voici votre compte **{service}** :\n`{account}`")
    except Exception:
        # Remettre le compte dans la base si les MP sont fermés
        redis.rpush(f"service:{service}", account)
        return await interaction.response.send_message(
            "Impossible de vous envoyer un message privé. Vérifiez vos paramètres de confidentialité !", 
            ephemeral=True
        )

    cooldowns[user_id] = now
    
    embed_success = {
        **embed_base,
        "title": f"Compte {service} généré !",
        "description": "Le compte a été envoyé dans vos messages privés !"
    }
    await interaction.response.send_message(embeds=[embed_success])

@bot.tree.command(name="stats", description="Afficher les statistiques du bot")
async def stats(interaction: discord.Interaction):
    embed = {
        "title": f"Stats de {botname}",
        "description": f"Nombre total d'utilisateurs: `{bot.users.cache.size} membres`\nNombre total de salons: `{bot.channels.cache.size} salons`\nNombre total de serveurs: `{bot.guilds.cache.size} serveur(s)`\nCréé par Adorado#2556",
        "color": themeColor,
        "timestamp": str(discord.utils.utcnow()),
        "footer": { "icon_url": "https://i.imgur.com/Bl8zjHy.png", "text": "Développé par Adorado#2556" },
        "image": { "url": bannerUrl },
        "author": { "name": botname + " - générateur de compte", "url": "https://discord.gg/UezHmtRP7c", "icon_url": bot.user.displayAvatarURL() }
    }
    await interaction.response.send_message(embeds=[embed])

@bot.tree.command(name="help", description="Afficher la liste des commandes disponibles")
async def help_cmd(interaction: discord.Interaction):
    embed = {
        "color": themeColor,
        "title": botname + ' - générateur de compte',
        "url": 'https://discord.gg/UezHmtRP7c',
        "author": { "name": 'Liste des commandes Slash', "url": 'https://discord.gg/UezHmtRP7c' },
        "image": { "url": bannerUrl },
        "description": "**Toutes les commandes s'utilisent désormais avec `/`**",
        "fields": [
            { "name": 'Générer un compte', "value": "`/gen service:<nom>`" },
            { "name": 'Créer un service', "value": "`/create service:<nom>`" },
            { "name": 'Notifier un restock', "value": "`/restock service:<nom> quantite:<nombre>`" },
            { "name": 'Ajouter des comptes', "value": "`/add compte:<mail:pass> service:<nom>`" },
            { "name": 'Statistiques du bot', "value": "`/stats`" }
        ],
        "timestamp": str(discord.utils.utcnow()),
        "footer": { "text": 'Développé par Adorado#2556', "icon_url": 'https://i.imgur.com/Bl8zjHy.png' }
    }
    await interaction.response.send_message(embeds=[embed])

@bot.tree.command(name="add", description="Ajouter un compte à un service (Admin uniquement)")
@app_commands.default_permissions(administrator=True)
@app_commands.describe(compte="Identifiants (ex: mail:pass)", service="Nom du service")
async def add(interaction: discord.Interaction, compte: str, service: str):
    service = service.lower()
    redis.rpush(f"service:{service}", compte)

    embed = {
        "title": "Compte ajouté !",
        "description": f"Compte ajouté avec succès au service `{service}` !",
        "color": themeColor,
        "timestamp": str(discord.utils.utcnow()),
        "footer": { "icon_url": "https://i.imgur.com/Bl8zjHy.png", "text": "Développé par Adorado#2556" },
        "image": { "url": bannerUrl },
        "author": { "name": botname + " - générateur de compte", "url": "https://discord.gg/UezHmtRP7c", "icon_url": bot.user.displayAvatarURL() }
    }
    await interaction.response.send_message(embeds=[embed])

@bot.tree.command(name="create", description="Créer un nouveau service (Admin uniquement)")
@app_commands.default_permissions(administrator=True)
@app_commands.describe(service="Nom du nouveau service")
async def create(interaction: discord.Interaction, service: str):
    service = service.lower()
    # On initialise simplement le service dans Redis s'il n'existe pas
    embed = {
        "title": "Service créé !",
        "description": f"Le service `{service}` est prêt à recevoir des comptes !",
        "color": themeColor,
        "timestamp": str(discord.utils.utcnow()),
        "footer": { "icon_url": "https://i.imgur.com/Bl8zjHy.png", "text": "Développé par Adorado#2556" },
        "image": { "url": bannerUrl },
        "author": { "name": botname + " - générateur de compte", "url": "https://discord.gg/UezHmtRP7c", "icon_url": bot.user.displayAvatarURL() }
    }
    await interaction.response.send_message(embeds=[embed])

@bot.tree.command(name="restock", description="Notifier un réapprovisionnement de service (Admin uniquement)")
@app_commands.default_permissions(administrator=True)
@app_commands.describe(service="Nom du service réapprovisionné", quantite="Nombre de comptes ajoutés")
async def restock(interaction: discord.Interaction, service: str, quantite: int):
    await interaction.response.send_message(
        f"@everyone\n● Restock de compte: **{service}**\n● Nombre de comptes restock: **{quantite} compte(s)**\n● Restock par: <@{interaction.user.id}>"
    )

if __name__ == "__main__":
    if not DISCORD_TOKEN:
        print("[ERREUR CRITIQUE] La variable d'environnement 'DISCORD_TOKEN' est manquante.")
    else:
        bot.run(DISCORD_TOKEN)
