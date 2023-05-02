## Knitting

→  [English translation](README.md)

[Lien d'invitation](https://discord.com/api/oauth2/authorize?client_id=1101559076086886500&permissions=292057785360&scope=bot)

Si vous voulez essayer le bot, vous pouvez rejoindre [ce serveur discord](https://discord.gg/TWjfz2yTSA) !

Un bot qui vous aide à ajouter un utilisateur à un fil de discussion, pour que le fil soit toujours visible pour tout le monde, sans les mentionner !

> **Note**  
> L'utilisateur ajouté au fil doit avoir la permission de le voir.

Le bot ajoutera automatiquement un utilisateur à un fil de discussion lorsque :
- Un utilisateur rejoint le serveur et a la permission de voir le fil.
- Un utilisateur est mis à jour et reçoit un nouveau rôle.
- Lorsqu'un canal ou une catégorie ont leurs autorisations modifiées.
- Lorsqu'un fil de discussion est créé.

Le bot ne fera rien lorsqu'il rejoindra le serveur. Si vous voulez mettre à jour tous les fils, vous pouvez utiliser la commande slash `/update-all-threads` (voir ci-dessous).

### Commandes Slash

Si vous voulez mettre à jour manuellement un fil, vous pouvez utiliser les commandes slash:
- `/update-specific-thread [thread]`: Mettre à jour un fil spécifique.
- `/update-all-threads`: Mettre à jour tous les fils sur le serveur.
- `/update-thread`: Mettre à jour le fil sur lequel la commande est utilisée.

Ces commandes n'apparaissent pas pour les utilisateurs qui n'ont pas la permission `gérer les fils`.

> **Attention**  
> Tous les utilisateurs qui quittent le fil seront ré-ajoutés, même s'ils l'ont quitté volontairement.

> **Note**  
> Il n'y a aucun moyen que je puisse coder quelque chose qui n'ajoute aucune notification (c'est-à-dire la bordure blanche) sur le fil. Vous aurez toujours le fil qui deviendra blanc lorsque le bot s'active.

De plus, vous pouvez configurer le bot et désactiver les événements que vous ne souhaitez pas utiliser. Vous pouvez le faire avec la commande `/config`. Vous pouvez voir la configuration avec `/config afficher`.

#### Configuration

La commande slash `/config` vous permet de configurer le bot. Vous pouvez :
- Changer la langue (anglais ou français)
- Désactiver/activer tous les événements (nouveaux membres, membres mis à jour, nouveau fil de discussion créé ou autorisations de canal/catégorie mises à jour).
- Il est possible de tout désactiver avec la commande `/config mode-manuel`. Dans ce mode, vous devez utiliser les commandes slash pour mettre à jour les fils.

### Comment ça fonctionne

Le bot enverra un message contenant "//", l'éditera avec la liste des utilisateurs/rôles qui peuvent voir le fil, puis supprimera le message. Comme l'utilisateur a été mentionné, le fil sera visible pour eux et un seul message sera envoyé.

Pour des raisons d'optimisation, le bot mentionnera d'abord les @rôle d'abord lorsqu'un fil doit être mis à jour. Ensuite, il vérifiera si certains utilisateurs (qui n'ont pas de rôle/role autorisé) peuvent voir le fil et les ajoutera.
De plus, s'il n'y a aucun rôle dans le serveur, le bot traitera la liste des membres à la place.

Notez que le rôle sera mentionné si certains utilisateurs ayant le rôle ne sont pas dans le fil de discussion.

### Permission requise

Le bot a besoin de certaines permissions pour fonctionner :
- Présence
- Membres du serveur

(Pour une raison inconnue, le bot a besoin de l'intention de présence pour obtenir l'identifiant de l'utilisateur lorsqu'il rejoint le serveur.)

---

## 🤖 Développement 

Le bot est créé avec [discord.js](https://discord.js.org/#/). Vous devez avoir [node.js (LTS)](https://nodejs.org/en/) installé sur votre ordinateur.
Après avoir cloné le référentiel, vous devez installer les dépendances avec:
```bash
npm run init
```

Le script vous demandera le jeton du bot. Vous pouvez l'obtenir sur le [portail des développeurs Discord](https://discord.com/developers/applications).

Au fait, le fichier `.env` doit ressembler à ceci :
```
BOT_TOKEN=your_token
CLIENT_ID=your_client_id
NODE_ENV=development # or production
```

La dernière partie concerne la journalisation. En production, rien (sauf les erreurs) n'est enregistré. En développement, le bot enregistrera tout dans la console.

Le bot utilise Enmap pour stocker des données. Vous pouvez trouver la documentation [ici](https://enmap.evie.dev/). Vous avez besoin d'une installation spéciale pour cela, donc suivez les instructions [ici](https://enmap.evie.dev/install). 

## 🎼 Traduction 

Le bot est traduit en :
- [x] Français
- [x] Anglais

J'utilise i18next pour traduire le bot. Vous pouvez trouver la documentation [ici](https://www.i18next.com/).

Si vous voulez ajouter une traduction, vous devez :
- Dupliquer `src/i18next/locales/en.json` et le renommer avec le code de la langue (ex: `fr.json`)
- Traduire le fichier
- Mettre à jour le fichier `src/i18next/index.ts` et ajouter la langue dans l'objet `ressources`, sans oublier de l'importer (ex: `import * as fr from "./locales/fr.json";`)
- Vous devez mettre à jour **tous** les fichiers de commandes (`src/commands`), et mettre à jour:
    - Ajout de `const lang = i18next.getFixedT("lang");` en haut du fichier
    - Ajout de `setNameLocalizations({lang: lang("même clé que pour l'autre langue")})` 
    - Ajout de la langue directement dans `setDescriptionLocalizations`.
  Vous pouvez obtenir plus d'informations sur la [localisation des commandes dans la documentation officielle de DiscordJS](https://discordjs.guide/slash-commands/advanced-creation.html#localizations).
  La langue des commandes slash est directement basée sur la langue de votre client Discord.

---

## Thread Watcher

Un bot cool à utiliser avec ce bot est [Thread Watcher](https://threadwatcher.xyz/) !
