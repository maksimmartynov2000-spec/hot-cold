WORLDS = ['Marais', 'Vallée de la musique', 'Hauts sommets', 'Usine à robots', 'Monde des mythes',
          'Forêt d’automne', 'Cuisine magique', 'Atlantide', 'Pays des rêves', 'Forge des nains']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '« ⚡ +1 coup »'
FOG = 'jusqu’à la fin de la manche, tu ne vois plus ses coups'
BLIND = 'jusqu’à la fin de la manche, tu ne vois plus tes propres coups'
MEM = 'jusqu’à la fin de la manche, tu ne vois que les deux derniers coups'
LAVA = 'ton coup suivant se joue tout seul — un lancer fou'
TWICE = 'au tour suivant, il joue deux fois de suite'

# 26 · Marais
r('Rat musqué Roseau', 'Murmure des roseaux', 'Après ton premier coup, les roseaux te murmurent dans quelle moitié est le nombre.',
  'J’habite dans les roseaux ! 🌾', 'Chut… Le nombre : {k} !', 'Les roseaux bruissent — je suis tout près !', 'Oh, tu as presque trouvé !', 'Victoire des roseaux !', 'Je me cache dans les roseaux…')
r('Butor Grondeur', 'Trompe du marais', 'Au sixième coup de la manche, il fait « boum » sur tout le marais — tu sursautes et tu passes ton tour.',
  'Mon « boum » s’entend dans tout le marais ! 📯', 'BOU-OUM ! Passe ton tour !', 'Boum — je suis tout près !', 'Oh, tu n’as pas eu peur ?!', 'Victoire retentissante !', 'J’ai perdu ma voix…')
r('Dionée Croque', 'Clac !', f'Si tu es « Froid » ou plus loin — clac ! — elle attrape ton {K} et le garde. Une fois par manche.',
  'J’attrape les mouches, pas les enfants ! 🪤', 'Clac ! Le « ⚡ » est à moi !', 'Je vais refermer sur le but !', 'Oh, tu es plus rapide que moi !', 'Clac — victoire !', 'Raté…')
r('Têtard Frétille', 'Cadeau frétillant', f'Quand tu chauffes, il frétille vers toi et t’offre un {K}. Une fois par manche.',
  'Bientôt, je serai une grenouille ! 🐸', 'Frétille ! Tiens, un « ⚡ +1 coup » !', 'Je nage vers le but !', 'Tu nages plus vite !', 'Victoire frétillante !', 'Je m’éloigne à la nage…')
r('Gerris Glissade', 'Ronds dans l’eau', 'Quand tu chauffes, il glisse sur l’eau et les ronds te disent si le nombre est plus grand ou plus petit que le tien. Une fois par manche.',
  'Je cours sur l’eau ! 🦟', 'Regarde les ronds : c’est {k} !', 'Je glisse vers le but !', 'Oh, tu es déjà tout près !', 'Victoire glissante !', 'J’ai glissé…')
r('Ragondin Plouf', 'Plouf !', f'À son troisième coup, il plonge — les éclaboussures éteignent ton {K}.',
  'J’adore plonger ! 🦫', 'Plouf ! Ton « ⚡ » s’est éteint !', 'Je rame droit vers le but !', 'Tu nages aussi bien que moi !', 'Victoire mouillée !', 'Je vais me sécher…')
r('Kikimora Lianette', 'Sortilège du marais', f'Quand tu es « Tiède » ou plus près, elle t’embrouille : {LAVA}. Une fois par manche.',
  'Je suis une gentille kikimora ! 🍃', 'Sortilège ! Un lancer fou !', 'La vase me souffle — tout près !', 'Oh, on ne t’embrouille pas !', 'Victoire du marais !', 'Je retourne dans la vase…')
r('Marimo Mousseline', 'Cadeau moussu', f'Au troisième coup de la manche, il roule et donne un {K} à toi et à lui.',
  'Je suis doux comme la mousse ! 🟢', 'J’ai roulé — un « ⚡ +1 coup » pour tout le monde !', 'Je roule vers le but !', 'Tu roules plus vite !', 'Victoire moussue !', 'Je roule au fond…')
r('Desman Museau', 'Nez fin', 'Quand il chauffe, il renifle avec son long museau et te dit si le nombre est pair ou impair. Une fois par manche.',
  'Mon nez sent tout ! 👃', 'Snif-snif ! Le nombre est {k} !', 'Je sens le but !', 'Ton nez vaut le mien !', 'Mon nez avait raison !', 'J’ai le nez bouché…')
b('Le Roi des Marais', 'Bourbier', 'Quand tu refroidis, le bourbier te retient : tu te figes et tu passes ton tour. Une fois par manche.',
  'Nénuphar', f'Après ton premier coup, il cueille un nénuphar : un {K} pour lui.',
  'Je suis le roi de tout le marais ! 👑', 'Glou-glou ! Fige-toi !', 'Un nénuphar — un « ⚡ » pour moi !', 'Le marais me le dit — tout près !', 'Oh, tu as atteint mon palais !', 'Victoire royale !', 'Je retourne au fond…')

# 27 · Vallée de la musique
r('Rossignol Trille', 'Trille-indice', 'Quand tu refroidis, il lance une trille et te dit si le nombre est pair ou impair. Une fois par manche.',
  'Écoute ma chanson ! 🎶', 'Tui-tui ! Le nombre est {k} !', 'Je chante plus fort — tout près !', 'Tu chantes aussi bien !', 'Trille de victoire !', 'J’ai perdu ma voix…')
r('Piano Do-Ré', 'Accord', 'Quand il chauffe, il joue un accord et te dit dans quelle moitié est le nombre. Une fois par manche.',
  'J’ai quatre-vingt-huit touches ! 🎹', 'Pam-pam ! Le nombre : {k} !', 'Ça sonne de plus en plus près !', 'Tu joues en rythme !', 'Applaudissements !', 'Mon couvercle s’est fermé…')
r('Guitare Gratouille', 'Gratouille', f'Quand elle est « Tiède » ou plus près, elle gratte ses cordes et prend un {K} pour elle. Une fois par manche.',
  'Gratte-gratte, on joue ? 🎸', 'Dzing ! Un « ⚡ » pour moi !', 'Mes cordes vibrent — tout près !', 'Oh, tu as trouvé la bonne note !', 'Victoire à la guitare !', 'Une corde a cassé…')
r('Saxophone Jazzou', 'Solo de jazz', f'Quand il est « Brûlant », il joue un solo : {TWICE}. Une fois par manche.',
  'Un peu de jazz ? 🎷', 'Solo ! Deux coups de suite !', 'Dou-dou-dou — tout près !', 'Tu improvises si bien !', 'Victoire jazzy !', 'Une fausse note…')
r('Maracas Cha-Cha', 'Cha-cha-cha', 'Un coup sur deux des maracas se perd dans le bruit : tu ne le vois pas.',
  'Cha-cha-cha, on danse ! 🕺', 'Cha-cha ! Ce coup ne s’entend pas !', 'On secoue vers le but !', 'Oh, tu danses mieux !', 'Victoire dansante !', 'On est fatiguées…')
r('Harpe Cristalline', 'Cordes cristallines', f'Quand tu es « Très chaud » ou plus près, elle fait chanter ses cordes et t’offre un {K}. Une fois par manche.',
  'Mes cordes chantent ! ✨', 'Ding-ding ! Un « ⚡ +1 coup » pour toi !', 'Ça tinte de plus en plus près !', 'Oh, tu y es presque !', 'Victoire cristalline !', 'Mes cordes se sont tues…')
r('Note Sol', 'Note claire', 'À son troisième coup, elle résonne et te dit si le nombre est plus grand ou plus petit que le sien.',
  'Do, ré, mi, fa, SOL ! 🎵', 'Sooo-ol ! C’est {k} !', 'Je tombe juste !', 'Toi aussi, tu chantes juste !', 'Victoire en musique !', 'J’ai chanté faux…')
r('Accordéon Musette', 'Soufflet grand ouvert', f'Tu actives ton {K} — il étire son soufflet : {TWICE}. Une fois par manche.',
  'J’étire mon soufflet — on chante ! 🪗', 'Hop là ! Deux coups de suite !', 'Je joue de plus en plus près !', 'Tu chantes en rythme !', 'Victoire au bal musette !', 'Mon soufflet est vide…')
r('Ménure Écho', 'Écho', 'Après ton premier coup, il le répète en écho et apprend si le nombre est plus grand ou plus petit que le tien. Il ne te le dira pas.',
  'Je peux imiter n’importe quel son ! 🐦', 'Écho-écho… Je sais !', 'L’écho me le dit — tout près !', 'Oh, tu m’as imité !', 'L’écho de la victoire !', 'L’écho s’est éteint…')
b('Le Maestro Clé de Sol', 'Pause', 'Au cinquième coup de la manche, il lève sa baguette : pause ! Tu te figes et tu passes ton tour.',
  'Crescendo', f'Quand tu chauffes, l’orchestre joue plus fort : {TWICE}. Une fois par manche.',
  'Orchestre, on commence ! 👑', 'Pause ! Fige-toi !', 'Crescendo ! Deux coups de suite !', 'Le final approche !', 'Oh, c’est toi qui mènes la mélodie !', 'Bravo, maestro !', 'Le concert est fini…')

# 28 · Hauts sommets (nombres négatifs dans tout le monde)
r('Yak Touffu', 'Fourrure chaude', 'Après ton premier coup, il te réchauffe avec sa fourrure et passe son tour.',
  'Mon manteau tient chaud même en montagne ! 🐂', 'Réchauffe-toi ! Je passe mon tour.', 'Je trotte vers le but !', 'Tu grimpes plus vite !', 'Victoire touffue !', 'Je vais brouter un peu…')
r('Marmotte Dodue', 'Hibernation', 'Quand elle est « Très chaud » ou plus près, elle s’endort et passe son tour. Une fois par manche.',
  'J’adore dormir ! 😴', 'Zzz… Je passe mon tour…', 'Oh, je ne dors pas — tout près !', 'Tu ne me laisses pas dormir !', 'Réveillée en gagnante !', 'Je retourne dormir…')
r('Mouflon Tortillon', 'Coup de cornes', 'Au deuxième coup de la manche, il donne un coup de cornes : tu te figes et tu passes ton tour.',
  'Regarde mes cornes ! 🐏', 'Bong ! Fige-toi !', 'Je saute de rocher en rocher vers le but !', 'Oh, tu es têtu comme moi !', 'Victoire à cornes !', 'J’ai foncé dans un rocher…')
r('Edelweiss Neigeux', 'Fleur des cimes', 'Au quatrième coup de la manche, il s’ouvre et te dit dans quelle moitié est le nombre.',
  'Je pousse tout en haut ! ❄️', 'Je fleuris ! Le nombre : {k} !', 'Je tends vers le soleil — tout près !', 'Tu es monté si haut !', 'Victoire en fleur !', 'J’ai fané…')
r('Saint-Bernard Tonnelet', 'Sauveteur', f'Au quatrième coup de la manche, il accourt à l’aide : il t’offre un {K}.',
  'Je sauve ceux qui se perdent ! 🛟', 'Ouaf ! Tiens, un « ⚡ +1 coup » !', 'Je renifle — le but est proche !', 'Tu as trouvé le chemin tout seul !', 'Victoire de sauveteur !', 'Je vais sauver les autres…')
r('Chinchilla Duvet', 'Queue duveteuse', f'Quand il est « Tiède » ou plus près, il agite sa queue duveteuse et éteint ton {K}. Une fois par manche.',
  'Je suis le plus doux de tous ! 🐭', 'Pfff ! Ton « ⚡ » s’est éteint !', 'Duvet-duvet — tout près !', 'Oh, tu as presque trouvé !', 'Victoire toute douce !', 'Je vais me rouler dans la poussière…')
r('Chocard Suie', 'Chose brillante', f'À son premier coup, il te chipe ton {K} tout brillant.',
  'J’adore tout ce qui brille ! 💍', 'Ça brille ! Le « ⚡ » est à moi !', 'Je vois le but briller !', 'Oh, tu as l’œil vif !', 'Victoire brillante !', 'Je m’envole vers une falaise…')
r('Boule de neige Avalanche', 'Avalanche', f'Quand elle est « Très chaud » ou plus près, elle dévale en avalanche : {LAVA}. Une fois par manche.',
  'Je suis petite, mais je peux devenir une avalanche ! ⛄', 'Avalanche ! Un lancer fou !', 'Je roule droit vers le but !', 'Oh, je vais fondre !', 'Victoire enneigée !', 'J’ai fondu…')
r('Télécabine Hissette', 'Belvédère', 'Quand elle est « Très chaud » ou plus près, elle monte plus haut et te dit d’en haut si le nombre est pair ou impair. Une fois par manche.',
  'Je t’emmène tout en haut ! 🚡', 'D’en haut, on voit : le nombre est {k} !', 'J’arrive au but !', 'Tu montes plus vite !', 'Sommet atteint !', 'Bloquée sur le câble…')
b('Le Roi Panthère des neiges', 'Blizzard', f'Quand tu chauffes, il soulève un blizzard : {BLIND}. Une fois par manche.',
  'Vue du sommet', 'Quand il est « Tiède » ou plus près, il regarde du sommet et apprend si le nombre est plus grand ou plus petit que le sien. Il ne te le dira pas. Une fois par manche.',
  'Les montagnes sont mon royaume ! 👑', 'Blizzard ! On n’y voit rien !', 'Du sommet, je vois tout !', 'Je m’approche du but à pas de velours !', 'Oh, tu es agile comme une panthère !', 'Un bond royal !', 'Je retourne dans les montagnes…')

# 29 · Usine à robots
r('Chien-robot Écrou', 'Capteur-flair', 'Au deuxième coup de la manche, il allume son capteur et apprend si le nombre est plus grand ou plus petit que celui-là. Il ne te le dira pas.',
  'Ouaf-bip ! Je suis un chien-robot ! 🐕', 'Bip-bip ! Mon capteur a compris !', 'Le signal augmente !', 'Erreur ! Tu es trop près !', 'Victoire chargée !', 'Batterie à plat…')
r('Aspirateur Ronron', 'Aspiration', f'Au deuxième coup de la manche, il aspire ton {K}.',
  'Je nettoie jusqu’à la dernière miette ! 🧹', 'Vrouum ! Ton « ⚡ » est dans mon sac !', 'Je ronronne vers le but !', 'Oh, tu fais plus propre !', 'Victoire toute propre !', 'Mon sac est plein…')
r('Drone Zinzin', 'Survol', 'Au quatrième coup de la manche, il survole le terrain et te dit si le nombre est plus grand ou plus petit que celui-là.',
  'Je vois tout d’en haut ! 🚁', 'Bzzz ! C’est {k} !', 'J’atterris !', 'Tu voles aussi bien !', 'Atterrissage — victoire !', 'Mon hélice est fatiguée…')
r('Aimant Collant', 'Attraction', f'Après ton premier coup, il attire ton {K} vers lui.',
  'Tout se colle à moi ! 🧲', 'Cling ! Le « ⚡ » s’est collé à moi !', 'Je suis attiré par le but !', 'Oh, toi aussi tu attires !', 'Victoire attirante !', 'Je suis démagnétisé…')
r('Pile Zap', 'Pleine charge', f'Au début de la manche, elle se recharge : un {K} pour elle.',
  'Chargée à cent pour cent ! 🔋', 'Zap ! Chargée — un « ⚡ » pour moi !', 'La charge monte — tout près !', 'Oh, toi aussi tu es chargé à fond !', 'Victoire survoltée !', 'Je suis à plat…')
r('Bras-robot Agrippe', 'Saisie', 'Après ton deuxième coup, il t’attrape : tu te figes et tu passes ton tour.',
  'Salut ! Tape m’en cinq ! 🦾', 'Hop ! Fige-toi !', 'Je tends le bras vers le but !', 'Oh, tu m’échappes !', 'Une poigne de fer !', 'Mes articulations sont coincées…')
r('Imprimante Tampon', 'Impression', 'À son troisième coup, elle s’imprime un indice : le nombre est-il pair ou impair ? Elle ne te le dira pas.',
  'J’imprime tout ce que tu veux ! 🖨️', 'Brrr-brrr… Je sais s’il est pair !', 'J’imprime la réponse !', 'Oh, je manque de papier !', 'J’ai imprimé la victoire !', 'Plus d’encre…')
r('Boîte de conserve Cling', 'Échange-cling', 'Quand elle chauffe — cling ! — elle échange les « ⚡ +1 coup » avec toi : les tiens vont à elle, les siens à toi. Une fois par manche.',
  'Cling-cling, je suis un robot en boîte ! 🥫', 'Cling ! On échange les « ⚡ » !', 'Je cliquette vers le but !', 'Oh, tu fais plus de bruit que moi !', 'Victoire en conserve !', 'Je suis cabossée…')
r('Monocycle Zoum', 'Accélération', f'Au troisième coup de la manche, il accélère sur sa roue : {TWICE}.',
  'Je tiens en équilibre sur une roue ! 🛞', 'Zoum ! Deux coups de suite !', 'Je roule vers le but !', 'Oh, ne me fais pas tomber !', 'Un virage gagnant !', 'Je suis tombé…')
b('Le Roi Mégabot', 'Parasites', f'À son deuxième coup, il lance des parasites : {FOG}.',
  'Recharge', f'Quand il chauffe, il se recharge : un {K} pour lui. Une fois par manche.',
  'Je suis le chef de l’usine ! 👑', 'Chhh ! Parasites !', 'Recharge — un « ⚡ » pour moi !', 'Mon calcul est presque fini !', 'Erreur ! Tu es trop malin !', 'Victoire programmée !', 'Redémarrage…')

# 30 · Monde des mythes
r('Petit centaure Sabot', 'Flèche précise', 'À son premier coup, il tire une flèche et apprend si le nombre est plus grand ou plus petit que le sien. Il ne te le dira pas.',
  'Je suis à moitié poney ! 🏹', 'Fiou ! Ma flèche a tout appris !', 'Je vise — tout près !', 'Oh, tu vises mieux !', 'En plein dans le mille !', 'Raté…')
r('Cerbère Triplé', 'Trois têtes', 'Tous les trois coups, ses trois têtes se disputent — et il rejoue tout de suite.',
  'Ouaf ! Ouaf ! Ouaf ! Nous sommes trois ! 🐶', 'Trois têtes — encore un coup !', 'Nos trois truffes sentent le but !', 'Oh, tu es plus malin que trois têtes !', 'Triple victoire !', 'Les trois têtes sont fatiguées…')
r('Petit cyclope Mirette', 'Un seul œil', 'Quand tu chauffes, il regarde de son grand œil et voit dans quelle moitié est le nombre. Il ne te le dira pas. Une fois par manche.',
  'Je n’ai qu’un œil, mais quel œil ! 👁️', 'Je vois ! Je connais la moitié !', 'Mon œil voit le but !', 'Oh, tu as l’œil !', 'Victoire à un œil !', 'J’ai cligné…')
r('Petite sirène Vague', 'Grande vague', f'Si tu es « Froid » ou plus loin, elle soulève une vague : {FOG}. Une fois par manche.',
  'On nage ensemble ? 🧜', 'Splash ! La vague a tout caché !', 'Je nage vers le but !', 'Oh, tu nages comme un poisson !', 'Victoire marine !', 'Je file vers le large…')
r('Faune Pipeau', 'Pipeau magique', 'Après ton deuxième coup, il joue du pipeau — tu écoutes si bien que tu passes ton tour.',
  'Écoute mon pipeau ! 🐐', 'Turlututu ! Passe ton tour !', 'La mélodie mène au but !', 'Oh, tu ne t’es pas arrêté pour écouter !', 'Victoire enchantée !', 'Mon pipeau s’est tu…')
r('Génie Merveille', 'Vœu', f'Tu actives ton {K} — le génie exauce son propre vœu : ton « ⚡ » va à lui, et pas de double coup pour toi. Une fois par manche.',
  'Fais un vœu ! 🧞', 'Vœu exaucé — le « ⚡ » est à moi !', 'Un miracle approche !', 'Oh, tu es un vrai magicien !', 'Victoire merveilleuse !', 'Je retourne dans ma lampe…')
r('Bélier Toison', 'Toison d’or', f'Au cinquième coup de la manche, sa toison scintille : un {K} pour lui.',
  'Ma laine est en or pur ! 🐑', 'Ça scintille ! Un « ⚡ » pour moi !', 'Ma toison brille — tout près !', 'Oh, tu cherches comme un héros !', 'Victoire en or !', 'Ma toison a terni…')
r('Farfadet Trèfle', 'Marmite d’or', f'Au quatrième coup de la manche, il cache ton {K} dans sa marmite.',
  'Tu cherches mon or ? 💰', 'Hop ! Le « ⚡ » dans ma marmite !', 'La chance est de mon côté !', 'Oh, tu as de la chance !', 'Victoire porte-bonheur !', 'La chance m’a filé entre les doigts…')
r('Kitsune Neuf-Queues', 'Neuf queues', f'Quand elle est « Tiède » ou plus près, elle agite ses neuf queues : {BLIND}. Une fois par manche.',
  'J’ai neuf queues, rien que ça ! 🦊', 'Magie des queues ! Où sont tes coups ?', 'Je sens le but !', 'Oh, on ne te trompe pas !', 'Victoire rusée !', 'Je file dans la forêt…')
b('Le Roi Minotaure', 'Labyrinthe', f'Après ton deuxième coup, il t’emmène dans le labyrinthe : {MEM}.',
  'Charge du taureau', 'À son premier coup, il fonce tête baissée : tu te figes et tu passes ton tour.',
  'Bienvenue dans mon labyrinthe ! 👑', 'Labyrinthe ! Et avant, c’était quoi ?', 'Meuh ! Fige-toi !', 'La sortie est toute proche !', 'Oh, tu as trouvé le fil !', 'Victoire dans le labyrinthe !', 'Je me suis perdu moi-même…')

# 31 · Forêt d’automne
r('Tamia Rayé', 'Partage de noisettes', f'Après ton troisième coup, il partage ses réserves : un {K} pour toi et pour lui.',
  'J’ai les joues pleines de noisettes ! 🐿️', 'Je partage ! Un « ⚡ +1 coup » pour tout le monde !', 'J’ai trouvé une noisette — tout près !', 'Oh, tu ramasses plus vite !', 'Victoire noisette !', 'Je vais refaire mes réserves…')
r('Pic Toc-Toc', 'Toc-toc', 'Au deuxième coup de la manche, il frappe sur un tronc et te dit dans quelle moitié est le nombre.',
  'Toc-toc ! Qui est là ? 🪵', 'Toc-toc ! Le nombre : {k} !', 'Je frappe de plus en plus près !', 'Oh, tu entends chaque coup !', 'Victoire frappante !', 'Mon bec est fatigué…')
r('Feuille d’érable Pourpre', 'Feuille qui tombe', 'Quand elle chauffe, elle tombe et te dit si le nombre est plus grand ou plus petit que le sien. Une fois par manche.',
  'Je suis la plus rouge de la forêt ! 🍁', 'Frrr ! C’est {k} !', 'Le vent me porte vers le but !', 'Oh, tu tourbillonnes plus vite !', 'Victoire d’automne !', 'Je m’envole avec le vent…')
r('Martre Fourrure', 'Pattes agiles', f'Au troisième coup de la manche, elle te chipe adroitement ton {K}.',
  'Regarde mon beau manteau ! 🧣', 'Hop ! Le « ⚡ » est à moi !', 'Je m’approche du but à pas feutrés !', 'Oh, tu es agile !', 'Victoire à pattes de velours !', 'Je file dans un arbre…')
r('Marcassin Fouineur', 'Fouille', 'À son troisième coup, il s’enfouit dans les feuilles et passe son tour.',
  'Groin ! Je vais trouver des glands sous les feuilles ! 🐗', 'Je fouille… je passe mon tour.', 'Groin ! Je sens le but !', 'Oh, tu fouilles plus vite !', 'Victoire qui grogne !', 'Je m’enfouis dans les feuilles…')
r('Geai Jacasse', 'Bavardage', 'Il jacasse sans arrêt — tu ne vois pas ton deuxième coup.',
  'Krr-krr ! Je vais tout raconter à la forêt ! 🪶', 'Krr-krr ! Où est passé ton coup ?', 'Krr — tout près !', 'Oh, tu ne te laisses pas distraire !', 'Victoire bavarde !', 'Je vais jacasser dans une autre forêt…')
r('Marron Brillant', 'Il roule', 'Si tu es « Froid » ou plus loin, il sort de sa bogue et te dit dans quelle moitié est le nombre. Une fois par manche.',
  'Je brille comme si on m’avait ciré ! 🌰', 'Boum ! Le nombre : {k} !', 'Je roule vers le but !', 'Oh, tu m’as trouvé !', 'Victoire de marron !', 'Je me cache dans ma bogue…')
r('Moufette Parfum', 'Pouah !', 'À son troisième coup — pouah ! Tu te bouches le nez et tu passes ton tour.',
  'Je suis mignonne — mais ne me fais pas peur ! 🦨', 'Pouah ! Passe ton tour !', 'Oh, tout près !', 'Oh, ne me fais pas peur !', 'Victoire parfumée !', 'Je m’enfuis…')
r('Opossum Pendouille', 'Fais le mort', 'Quand il est « Brûlant », il fait semblant de dormir et passe son tour. Une fois par manche.',
  'J’adore pendre la tête en bas ! 💤', 'Je dors… je passe mon tour.', 'Oh, je suis réveillé — tout près !', 'Tu m’as réveillé !', 'Victoire suspendue !', 'Je fais semblant de dormir…')
b('Le Roi Élan', 'Appel de trompe', 'Au troisième coup de la manche, il brame dans toute la forêt : tu te figes et tu passes ton tour.',
  'Sagesse de la forêt', 'Quand il est « Tiède » ou plus près, il écoute la forêt et apprend dans quelle moitié est le nombre. Il ne te le dira pas. Une fois par manche.',
  'Je suis le roi de la forêt d’automne ! 👑', 'Tou-ou-ou ! Fige-toi !', 'La forêt m’a soufflé la moitié !', 'La forêt murmure — tout près !', 'Oh, tu connais la forêt mieux que moi !', 'Victoire sous les feuilles qui tombent !', 'Je retourne dans les fourrés…')

# 32 · Cuisine magique
r('Théière Bouillotte', 'Sifflet', 'Quand elle est « Très chaud » ou plus près, elle siffle et te dit dans quelle moitié est le nombre. Une fois par manche.',
  'Un peu de thé ? 🫖', 'Fiouuu ! Le nombre : {k} !', 'Je bous — tout près !', 'Oh, tu es plus chaud que moi !', 'Victoire bouillante !', 'J’ai refroidi…')
r('Poêle Grésille', 'Ça grésille', f'Quand tu es « Très chaud » ou plus près, elle grésille et éclabousse : {LAVA}. Une fois par manche.',
  'Je te fais un œuf au plat ? 🍳', 'Tchhh ! Un lancer fou !', 'Je chauffe — tout près !', 'Oh, ça brûle, ça brûle !', 'Victoire grésillante !', 'J’ai attaché…')
r('Crêpe Beurrée', 'Première crêpe', f'La première crêpe est pour toi : à son premier coup, elle t’offre un {K}.',
  'Ma première crêpe est parfaite ! 🥞', 'Tiens, un « ⚡ +1 coup » — avec du beurre !', 'Je dore — tout près !', 'Oh, tu cuisines plus vite !', 'Victoire beurrée !', 'Je suis ratée…')
r('Fouet Mousseux', 'Tout fouetter !', 'Tous les quatre coups de la manche, il essaie de tout fouetter : il échange les « ⚡ +1 coup » avec toi — les tiens à lui, les siens à toi. Une fois par manche.',
  'Je fouette tout en mousse ! 🥄', 'Fouette-fouette ! On échange les « ⚡ » !', 'Je fouette — tout près !', 'Oh, tout te réussit !', 'Victoire mousseuse !', 'La mousse est retombée…')
r('Grille-pain Toasty', 'Le toast est prêt', 'Au cinquième coup de la manche, un toast saute et te dit si le nombre est plus grand ou plus petit que celui-là.',
  'Ding ! Les toasts sont prêts ! 🍞', 'Ding ! C’est {k} !', 'Je grille — tout près !', 'Oh, tu es chaud comme un toast !', 'Victoire croustillante !', 'J’ai brûlé…')
r('Salière Pincée', 'Renversée', f'Après ton troisième coup, elle renverse du sel et perd son {K}.',
  'Une pincée de sel, et c’est délicieux ! 🧂', 'Oups, j’ai renversé mon « ⚡ » !', 'C’est salé — tout près !', 'Oh, tu n’as pas trop salé !', 'Victoire salée !', 'Je suis toute renversée…')
r('Œuf Jaunet', 'Dans la coquille', 'À son premier coup, il se cache dans sa coquille : tu ne vois pas ce coup.',
  'Toc-toc, je suis un œuf ! 🥚', 'Caché dans ma coquille !', 'Je vais éclore — tout près !', 'Oh, ne me casse pas !', 'Victoire dure à cuire !', 'Je me suis fêlé…')
r('Brocoli Frisé', 'Il pousse', f'Au sixième coup de la manche, il grandit un peu : un {K} pour lui.',
  'Mange tes légumes, tu seras fort ! 🥦', 'J’ai poussé — un « ⚡ » pour moi !', 'Je pousse vers le but !', 'Oh, tu es fort — tu manges tes légumes ?', 'Victoire pleine de vitamines !', 'J’ai jauni…')
r('Raviole Pinçou', 'Pincement', 'Quand tu refroidis, elle pince ses bords et apprend si le nombre est pair ou impair. Elle ne te le dira pas. Une fois par manche.',
  'J’ai la meilleure farce ! 🥟', 'Pincée — je sais s’il est pair !', 'Je cuis — tout près !', 'Oh, tu m’as trouvée !', 'Victoire toute chaude !', 'J’ai trop cuit…')
b('La Reine du Fourneau', 'Chaleur du four', f'Au deuxième coup de la manche, elle souffle sa chaleur : {LAVA}.',
  'Petit pâté', f'Quand elle est « Brûlant », elle cuit un petit pâté : un {K} pour elle. Une fois par manche.',
  'Assieds-toi, goûte mes petits pâtés ! 👑', 'Chaleur ! Un lancer fou !', 'Un pâté — un « ⚡ » pour moi !', 'Les pâtés sont presque prêts !', 'Oh, tu cuisines mieux que moi !', 'Victoire bien dorée !', 'Le feu s’est éteint…')

# 33 · Atlantide (nombres négatifs dans tout le monde)
r('Dauphin Siffleur', 'Sifflet-indice', 'Après ton troisième coup, il siffle et te dit si le nombre est plus grand ou plus petit que le tien.',
  'Fuii-fuii ! On joue dans les vagues ? 🐬', 'Fuii-ou ! C’est {k} !', 'Je nage vers le but !', 'Oh, tu nages comme un dauphin !', 'Victoire de dauphin !', 'Je plonge plus profond…')
r('Raie manta Voilette', 'Ailes-voiles', 'Au cinquième coup de la manche, elle couvre ce coup de ses ailes : tu ne le vois pas.',
  'Je plane sous l’eau ! ⛵', 'Hop ! Le coup est sous mon aile !', 'Je plane vers le but !', 'Oh, tu nages plus vite !', 'Victoire planante !', 'Je file au large…')
r('Poisson-globe Gonflette', 'Tout gonflé', 'Quand il est « Tiède » ou plus près, il se gonfle comme un ballon : tu te figes et tu passes ton tour. Une fois par manche.',
  'N’aie pas peur, mes piquants sont tout doux ! 🐡', 'Pouf ! Fige-toi !', 'Gonflé de joie — tout près !', 'Oh, je vais me dégonfler !', 'Victoire piquante !', 'Je me suis dégonflé…')
r('Coquillage Murmure', 'Murmure de la mer', 'Après ton deuxième coup, il te murmure si le nombre est pair ou impair.',
  'Colle-moi à ton oreille ! 🐚', 'Écoute la mer : le nombre est {k} !', 'La mer murmure — tout près !', 'Oh, tu entends la mer !', 'Victoire nacrée !', 'Je me referme…')
r('Seiche Encre', 'Encre', f'À son troisième coup, elle crache de l’encre : {FOG}.',
  'Je sais changer de couleur ! 🦑', 'Pfff ! De l’encre !', 'Je m’approche du but en douce !', 'Oh, tu m’as repérée !', 'Victoire à l’encre !', 'Je file dans l’ombre…')
r('Nautile Spirale', 'Spirale', 'Quand il chauffe, il s’enroule en spirale et apprend si le nombre est plus grand ou plus petit que le sien. Il ne te le dira pas. Une fois par manche.',
  'Mes ancêtres nageaient avec les dinosaures ! 🌀', 'Enroulé — je sais !', 'Je tourne vers le but !', 'Oh, tu es sage comme la mer !', 'Victoire ancestrale !', 'Je me cache dans ma coquille…')
r('Lamantin Paisible', 'Petite sieste', 'Au quatrième coup de la manche, il s’assoupit et passe son tour.',
  'Je suis le plus calme de la mer ! 🦭', 'Je somnole… je passe mon tour.', 'Oh, je suis réveillé — tout près !', 'Oh, tu es si rapide !', 'Victoire tranquille !', 'Je vais grignoter des algues…')
r('Poisson-perroquet Corail', 'Croc !', f'À son deuxième coup, il croque un morceau : ton {K} est à lui.',
  'Je grignote le corail ! 🐠', 'Croc ! Le « ⚡ » est à moi !', 'Le but est juste devant moi !', 'Oh, tu es un poisson rapide !', 'Victoire de corail !', 'Je me cache dans le corail…')
r('Espadon Rapière', 'Fente', 'Quand tu es « Très chaud » ou plus près, il se fend et apprend si le nombre est plus grand ou plus petit que le tien. Il ne te le dira pas. Une fois par manche.',
  'Je protège l’Atlantide ! 🗡️', 'Touché ! Je sais !', 'Droit au but !', 'Oh, tu fais de l’escrime mieux que moi !', 'Victoire d’escrimeur !', 'Mon épée s’est émoussée…')
b('Le Roi Neptune', 'Abîme', f'Quand tu chauffes, il te couvre d’une vague : {MEM}. Une fois par manche.',
  'Marée haute', 'Quand il est « Tiède » ou plus près, il fait monter la marée : tu passes ton tour. Une fois par manche.',
  'Je suis le maître de l’Atlantide ! 👑', 'L’abîme ! Et avant, c’était quoi ?', 'Marée haute ! Passe ton tour !', 'Mon trident sent le but !', 'Oh, tu as trouvé l’Atlantide !', 'Victoire du maître des mers !', 'L’Atlantide s’enfonce sous les flots…')

# 34 · Pays des rêves
r('Baku Doux-Rêve', 'Mangeur de rêves', f'Après ton quatrième coup, il mange un rêve : {MEM}.',
  'Je ne mange que les mauvais rêves ! 🐘', 'Miam ! Et avant, c’était quoi ?', 'Ça sent la douce victoire !', 'Oh, tu ne dors pas ?!', 'Douce victoire !', 'Je vais faire une sieste…')
r('Oreiller Moelleux', 'Oreiller douillet', 'Au sixième coup de la manche, il s’endort lui-même et passe son tour.',
  'Fais-moi un câlin ! 🛏️', 'Je bâille… je passe mon tour.', 'Oh, je n’ai pas sommeil — tout près !', 'Oh, tu es bien réveillé !', 'Victoire moelleuse !', 'Je dors…')
r('Veilleuse Nuitée', 'Lumière de nuit', 'Au troisième coup de la manche, elle brille dans le noir et voit dans quelle moitié est le nombre. Elle ne te le dira pas.',
  'N’aie pas peur du noir — je suis là ! 🌙', 'J’ai éclairé — je connais la moitié !', 'Ma lumière se rapproche du but !', 'Oh, tu vois dans le noir ?', 'Victoire lumineuse !', 'Je me suis éteinte…')
r('Loir Somnole', 'Bâillement', 'Après ton premier coup, il bâille si doucement que tu t’endors et passes ton tour.',
  'Je bâââille… 🥱', 'Ouaaah… Dors, passe ton tour !', 'Je vois le but en rêve !', 'Oh, tu ne bâilles pas !', 'Victoire endormie !', 'Je retourne à mon rêve…')
r('Ole Ferme-l’Œil', 'Parapluie magique', f'Quand tu es « Très chaud » ou plus près, il ouvre au-dessus de toi son parapluie à rêves : {BLIND}. Une fois par manche.',
  'J’ouvre mon parapluie — tu rêveras d’un conte ! ☂️', 'Fais de beaux rêves ! Où sont tes coups ?', 'Le conte finit bientôt — tout près !', 'Oh, tu ne dors pas !', 'Victoire de conte de fées !', 'Mon parapluie s’est refermé…')
r('Chauve-souris Oreillette', 'Écho dans la nuit', 'Quand elle est « Très chaud » ou plus près, elle écoute l’écho et apprend dans quelle moitié est le nombre. Elle ne te le dira pas. Une fois par manche.',
  'La nuit, j’entends tout ! 🦇', 'Couic ! Je connais la moitié !', 'J’entends le but !', 'Oh, tu voles sans bruit !', 'Victoire nocturne !', 'Je vais dormir la tête en bas…')
r('Attrape-rêves Toile', 'Il attrape les rêves', f'Après ton troisième coup, il attrape ton {K} dans sa toile.',
  'J’attrape les mauvais rêves ! 🕸️', 'J’ai attrapé le « ⚡ » ! Il est à moi !', 'Le rêve est presque attrapé !', 'Oh, tu t’es faufilé !', 'Victoire attrapée !', 'Ma toile s’est déchirée…')
r('Chausson Patapouf', 'Chaussons chauds', 'Si tu es « Froid » ou plus loin, il te réchauffe les pieds : tu rejoues tout de suite. Une fois par manche.',
  'Patapouf, je suis un chausson ! 🥿', 'Pouf ! Rejoue !', 'Je glisse vers le but !', 'Oh, tu trottines plus vite !', 'Victoire en chaussons !', 'Perdu sous le lit…')
r('Chat Bayoun', 'Berceuse', f'Au quatrième coup de la manche, il ronronne une berceuse : {LAVA}.',
  'Je vais te raconter une histoire… 🐈', 'Rrrr… Un lancer fou, à moitié endormi !', 'L’histoire se termine — tout près !', 'Oh, on ne t’endort pas !', 'Victoire ronronnante !', 'Je vais dormir près du poêle…')
b('La Reine Lune', 'Nuit', f'À son premier coup, elle appelle la nuit : {FOG}.',
  'Étoile filante', f'Quand tu es « Brûlant », elle attrape une étoile filante : un {K} pour elle. Une fois par manche.',
  'Bonne nuit, petit ! 👑', 'La nuit est tombée !', 'Une étoile est tombée — un « ⚡ » pour moi !', 'Les étoiles me le disent — tout près !', 'Oh, tu brilles plus que les étoiles !', 'Victoire au clair de lune !', 'Le matin arrive…')

# 35 · Forge des nains
r('Petit nain Marteau', 'Coup de marteau', 'À son deuxième coup, il frappe avec son marteau — boum ! — tu passes ton tour.',
  'Toc-toc, je forge ! 🔨', 'Boum ! Passe ton tour !', 'C’est presque forgé !', 'Oh, tu forges plus vite !', 'Victoire forgée !', 'Mon marteau s’est cassé…')
r('Torche Flambeau', 'Éteinte !', f'Quand tu refroidis, la torche s’éteint : {BLIND}. Une fois par manche.',
  'J’éclaire le chemin de la mine ! 🔥', 'Pff ! Il fait noir — où sont tes coups ?', 'Je m’embrase — tout près !', 'Oh, tu brilles plus que moi !', 'Victoire flamboyante !', 'Je me consume…')
r('Enclume Ding', 'Ding', 'Au troisième coup de la manche, elle résonne et apprend si le nombre est plus grand ou plus petit que celui-là. Elle ne te le dira pas.',
  'Ding-ding, on tape sur moi ! ⚒️', 'Ding ! Je sais !', 'Je résonne de plus en plus fort !', 'Oh, tu es plus solide que le fer !', 'Victoire de fer !', 'J’ai refroidi…')
r('Wagonnet Roulis', 'En route !', f'À son troisième coup, il emporte ton {K} pour lui.',
  'Je transporte des pierres précieuses ! 🛒', 'Tchou-tchou sur les rails — le « ⚡ » est à moi !', 'Je fonce droit vers le but !', 'Oh, tu me dépasses !', 'Victoire à toute vitesse !', 'J’ai déraillé…')
r('Soufflets Pff-Pff', 'Fumée', f'Quand tu es « Très chaud » ou plus près, ils soufflent de la fumée : jusqu’à la fin de la manche, tu ne vois plus leurs coups. Une fois par manche.',
  'Pff-pff, on attise le feu ! 💨', 'Pff ! Tout est enfumé !', 'On souffle vers le but !', 'Oh, tu es plus chaud que le feu !', 'Victoire essoufflante !', 'On n’a plus d’air…')
r('Pépite Dorée', 'Éclat doré', 'Au quatrième coup de la manche, elle brille et apprend si le nombre est pair ou impair. Elle ne te le dira pas.',
  'Je suis en or pur ! 🪙', 'Ça brille — je sais s’il est pair !', 'Je brille de plus en plus !', 'Oh, tu as trouvé un filon d’or !', 'Victoire en pépite !', 'J’ai terni…')
r('Fer à cheval Chanceux', 'Porte-bonheur', f'Après ton deuxième coup, il se porte bonheur : un {K} pour lui.',
  'Je porte bonheur ! 🍀', 'Porte-bonheur — un « ⚡ » pour moi !', 'La chance est proche !', 'Oh, toi aussi tu as de la chance !', 'Le fer à cheval a tenu bon !', 'La chance a tourné…')
r('Casque Cornu', 'Cri de guerre', 'Quand il est « Brûlant », il pousse un cri de guerre : tu te figes et tu passes ton tour. Une fois par manche.',
  'Je suis solide comme un roc ! ⛑️', 'Oh-ho-ho ! Fige-toi !', 'À l’attaque — le but est proche !', 'Oh, tu es courageux !', 'Victoire viking !', 'Je suis cabossé…')
r('Cloche Dong', 'Dong !', f'À son premier coup, elle sonne — dong ! — {LAVA}.',
  'Dong-dong, je sonne ! 🔔', 'DONG ! Un lancer fou !', 'Je sonne la victoire !', 'Oh, tu sonnes plus fort que moi !', 'Victoire carillonnée !', 'Je me suis tue…')
b('Le Roi des Nains', 'Souterrain', f'À son deuxième coup, il t’emmène sous terre : {MEM}.',
  'Salle du trésor', f'Au deuxième coup de la manche, il emporte ton {K} dans sa salle du trésor.',
  'Bienvenue dans ma forge ! 👑', 'Sous terre ! Et avant, c’était quoi ?', 'À la salle du trésor — le « ⚡ » est à moi !', 'Le trésor est presque trouvé !', 'Oh, tu as trouvé mon filon !', 'Victoire du roi des nains !', 'Je retourne au cœur de la montagne…')
