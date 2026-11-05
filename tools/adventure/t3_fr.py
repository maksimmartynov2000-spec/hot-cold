WORLDS = ['Marais', 'Royaume lointain', 'Hauts sommets', 'Usine à robots', 'Monde des mythes',
          'Forêt d’automne', 'Vallée des pyramides', 'Atlantide', 'Pays des rêves', 'Forge des nains']
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
r('Vison Leste', 'Pattes agiles', 'Si tu es « Froid » ou plus loin, il te chipe adroitement ton « ⚡ +1 coup ». Une fois par manche.',
  'Hi-hi, je suis le plus agile du marais ! 🦦', 'Hop ! Ton « ⚡ » est à moi maintenant !', 'Hi-hi, je l’ai presque !', 'Tu me rattrapes !', 'Bien joué ! J’ai gagné !', 'Il m’a échappé…')
r('Têtard Frétille', 'Cadeau frétillant', f'Quand tu chauffes, il frétille vers toi et t’offre un {K}. Une fois par manche.',
  'Bientôt, je serai une grenouille ! 🐸', 'Frétille ! Tiens, un « ⚡ +1 coup » !', 'Je nage vers le but !', 'Tu nages plus vite !', 'Victoire frétillante !', 'Je m’éloigne à la nage…')
r('Gerris Glissade', 'Ronds dans l’eau', 'Quand tu chauffes, il glisse sur l’eau et les ronds te disent si le nombre est plus grand ou plus petit que le tien. Une fois par manche.',
  'Je cours sur l’eau ! 🦟', 'Regarde les ronds : c’est {k} !', 'Je glisse vers le but !', 'Oh, tu es déjà tout près !', 'Victoire glissante !', 'J’ai glissé…')
r('Ragondin Plouf', 'Plouf !', f'À son troisième coup, il plonge — les éclaboussures éteignent ton {K}.',
  'J’adore plonger ! 🦫', 'Plouf ! Ton « ⚡ » s’est éteint !', 'Je rame droit vers le but !', 'Tu nages aussi bien que moi !', 'Victoire mouillée !', 'Je vais me sécher…')
r('Kikimora Lianette', 'Sortilège du marais', f'Quand tu es « Tiède » ou plus près, elle t’embrouille : {LAVA}. Une fois par manche.',
  'Je suis une gentille kikimora ! 🍃', 'Sortilège ! Un lancer fou !', 'La vase me souffle — tout près !', 'Oh, on ne t’embrouille pas !', 'Victoire du marais !', 'Je retourne dans la vase…')
r('Castor Barrage', 'Le barrage', 'Au troisième coup de la manche, il termine son barrage et donne un « ⚡ +1 coup » à toi et à lui.',
  'Je construis les meilleurs barrages du marais ! 🦫', 'Le barrage est fini — un « ⚡ +1 coup » pour chacun !', 'Je construis le chemin vers la réponse !', 'Tu as traversé mon barrage !', 'Une victoire solide !', 'Le barrage a cédé…')
r('Desman Museau', 'Nez fin', 'Quand il chauffe, il renifle avec son long museau et te dit si le nombre est pair ou impair. Une fois par manche.',
  'Mon nez sent tout ! 👃', 'Snif-snif ! Le nombre est {k} !', 'Je sens le but !', 'Ton nez vaut le mien !', 'Mon nez avait raison !', 'J’ai le nez bouché…')
b('Le Roi des Marais', 'Bourbier', 'Quand tu refroidis, le bourbier te retient : tu te figes et tu passes ton tour. Une fois par manche.',
  'Nénuphar', f'Après ton premier coup, il cueille un nénuphar : un {K} pour lui.',
  'Je suis le roi de tout le marais ! 👑', 'Glou-glou ! Fige-toi !', 'Un nénuphar — un « ⚡ » pour moi !', 'Le marais me le dit — tout près !', 'Oh, tu as atteint mon palais !', 'Victoire royale !', 'Je retourne au fond…')

# 27 · Royaume lointain
r('Sirin Mélodie', 'Chant prophétique', 'Quand tu refroidis, elle chante un chant prophétique et te dit si le nombre est pair ou impair. Une fois par manche.',
  'Écoute mon chant, voyageur 🎶', 'Je chante, je chante : le nombre est {k} !', 'Mon chant me guide vers la réponse !', 'Tu entends mon chant ?', 'Le chant de la victoire !', 'Le chant est fini…')
r('Le Petit Cheval bossu', 'Conseil du petit cheval', 'Quand il chauffe, il te chuchote un conseil à l’oreille : dans quelle moitié est le nombre. Une fois par manche.',
  'Ne sois pas triste, je vais t’aider ! 🐴', 'Écoute mon conseil : {k} !', 'Je galope droit vers la réponse !', 'Tu me rattrapes !', 'Hiii ! J’ai gagné !', 'Hiii… tu as gagné !')
r('Léchi Moussu', 'Trésor de la forêt', 'Quand il est « Tiède » ou plus près, il trouve un trésor dans la forêt : un « ⚡ +1 coup » pour lui. Une fois par manche.',
  'Ohé ! Ne te perds pas dans ma forêt ! 🌲', 'Trésor de la forêt — un « ⚡ +1 coup » pour moi !', 'La forêt bruisse — très chaud !', 'Tu as trouvé mon sentier secret !', 'Ohé ! La forêt a gagné !', 'Je me suis égaré…')
r('Zmeï Gorynytch', 'Trois têtes', 'Quand il est « Brûlant », ses trois têtes se bousculent : au tour suivant, il joue deux fois de suite. Une fois par manche.',
  'Salut ! Salut ! Salut ! C’est nous trois 🐉', 'Trois têtes pressées — deux coups de suite !', 'Trois têtes sentent la réponse !', 'Les têtes se disputent — tu es tout près !', 'Une triple victoire !', 'Les trois têtes sont tristes…')
r('Domovoï Froufrou', 'Derrière le poêle', 'Un coup sur deux du domovoï se cache derrière le poêle : on ne le voit pas.',
  'Frou-frou… je suis là, derrière le poêle 🏠', 'Frou-frou… ce coup est derrière le poêle !', 'Frou-frou, je suis tout près !', 'Tu as regardé derrière le poêle ?!', 'Frou-frou — j’ai gagné !', 'Frou… je vais me cacher plus loin.')
r('Oiseau de feu Brasier', 'Plume de l’Oiseau de feu', 'Quand tu es « Très chaud » ou plus près, il laisse tomber une plume étincelante : un « ⚡ +1 coup » pour toi. Une fois par manche.',
  'Ma plume brille plus que le soleil ! 🔥', 'Attrape la plume — un « ⚡ +1 coup » !', 'Je brille tout près de la réponse !', 'Tu as presque attrapé l’Oiseau de feu !', 'Une victoire éclatante !', 'Je m’envole au-delà des trois fois neuf pays…')
r('Faucon Finist', 'Œil perçant', 'À son troisième coup, il regarde d’en haut et te dit si le nombre est plus grand ou plus petit que le sien.',
  'Je vois tout de là-haut ! 🦅', 'D’en haut, je vois : c’est {k} !', 'Œil clair — bon chemin !', 'Tu as l’œil plus perçant que moi !', 'Victoire vue d’en haut !', 'Je m’envole… tu as gagné.')
r('Baba Yaga', 'Le mortier', 'Tu actives ton « ⚡ +1 coup » — Yaga monte dans son mortier : au tour suivant, elle joue deux fois de suite. Une fois par manche.',
  'Bienvenue, invité ! N’aie pas peur — aujourd’hui, je suis gentille 🧹', 'Vole, mortier ! Deux coups de suite !', 'Je le sens — la réponse est proche !', 'Oh, quel invité rapide !', 'Hé-hé ! Mamie a gagné !', 'Eh bien, brave jeune homme, tu as gagné !')
r('La Princesse Grenouille', 'Enchantement', 'Après ton premier coup, elle jette un sort et apprend si le nombre est plus grand ou plus petit que le tien. Elle ne te le dira pas.',
  'Croâ ! Je suis une princesse ensorcelée 🐸', 'Croâ ! Mon sort m’a révélé le secret !', 'Croâ ! La magie fonctionne !', 'Tu as rompu mon sort ?!', 'Croâ ! Une victoire royale !', 'Croâ… le sort est rompu.')
b('Kochtcheï l’Immortel', 'Regard glacé', 'Au cinquième coup de la manche, il te lance un regard glacé : tu gèles et tu passes ton tour.',
  'Vivacité immortelle', 'Quand tu chauffes, il se dépêche : au tour suivant, il joue deux fois de suite. Une fois par manche.',
  'Je suis Kochtcheï l’Immortel — personne ne peut me battre ! 👑', 'Fige-toi ! Tu passes ton tour !', 'Ha ! Deux coups de suite !',
  'Mon aiguille est bien cachée !', 'Tu as vraiment trouvé mon aiguille ?!', 'Une victoire immortelle ! 👑', 'Tu as trouvé mon aiguille… tu as gagné.')

# 28 · Hauts sommets (nombres négatifs dans tout le monde)
r('Yak Touffu', 'Fourrure chaude', 'Après ton premier coup, il te réchauffe avec sa fourrure et passe son tour.',
  'Mon manteau tient chaud même en montagne ! 🐂', 'Réchauffe-toi ! Je passe mon tour.', 'Je trotte vers le but !', 'Tu grimpes plus vite !', 'Victoire touffue !', 'Je vais brouter un peu…')
r('Marmotte Dodue', 'Hibernation', 'Quand elle est « Très chaud » ou plus près, elle s’endort et passe son tour. Une fois par manche.',
  'J’adore dormir ! 😴', 'Zzz… Je passe mon tour…', 'Oh, je ne dors pas — tout près !', 'Tu ne me laisses pas dormir !', 'Réveillée en gagnante !', 'Je retourne dormir…')
r('Mouflon Tortillon', 'Coup de cornes', 'Au deuxième coup de la manche, il donne un coup de cornes : tu te figes et tu passes ton tour.',
  'Regarde mes cornes ! 🐏', 'Bong ! Fige-toi !', 'Je saute de rocher en rocher vers le but !', 'Oh, tu es têtu comme moi !', 'Victoire à cornes !', 'J’ai foncé dans un rocher…')
r('Pika Meule', 'Sifflet de la montagne', 'Au quatrième coup de la manche, il siffle un indice : dans quelle moitié est le nombre.',
  'Ii-ii ! Je fais sécher le foin pour l’hiver 🌾', 'Ii-ii ! Indice : {k} !', 'Ii ! Très chaud !', 'Tu es à ma meule de foin !', 'Ii-ii — j’ai gagné !', 'Ii… tu as gagné.')
r('Saint-Bernard Tonnelet', 'Sauveteur', f'Au quatrième coup de la manche, il accourt à l’aide : il t’offre un {K}.',
  'Je sauve ceux qui se perdent ! 🛟', 'Ouaf ! Tiens, un « ⚡ +1 coup » !', 'Je renifle — le but est proche !', 'Tu as trouvé le chemin tout seul !', 'Victoire de sauveteur !', 'Je vais sauver les autres…')
r('Chinchilla Duvet', 'Queue duveteuse', f'Quand il est « Tiède » ou plus près, il agite sa queue duveteuse et éteint ton {K}. Une fois par manche.',
  'Je suis le plus doux de tous ! 🐭', 'Pfff ! Ton « ⚡ » s’est éteint !', 'Duvet-duvet — tout près !', 'Oh, tu as presque trouvé !', 'Victoire toute douce !', 'Je vais me rouler dans la poussière…')
r('Chocard Suie', 'Chose brillante', f'À son premier coup, il te chipe ton {K} tout brillant.',
  'J’adore tout ce qui brille ! 💍', 'Ça brille ! Le « ⚡ » est à moi !', 'Je vois le but briller !', 'Oh, tu as l’œil vif !', 'Victoire brillante !', 'Je m’envole vers une falaise…')
r('Bouquetin Grimpeur', 'Chute de pierres', 'Quand il est « Très chaud » ou plus près, il fait tomber des pierres : ton coup suivant se joue tout seul — un lancer fou. Une fois par manche.',
  'Bêê ! Je saute sur les falaises les plus raides ! 🐐', 'Bêê ! Chute de pierres — ton coup est parti tout seul !', 'Bêê ! Presque au sommet !', 'Tu grimpes sur ma falaise ?!', 'Bêê ! Le sommet est à moi !', 'J’ai glissé… bêê.')
r('Gypaète Œil-vif', 'Vue du sommet', 'Quand il est « Très chaud » ou plus près, il regarde du sommet et te dit si le nombre est pair ou impair. Une fois par manche.',
  'D’en haut, tout est clair comme de l’eau de roche ! 🦅', 'Du sommet, je vois : le nombre est {k} !', 'Je tourne au-dessus de la réponse !', 'Tu es monté bien haut !', 'Victoire vue d’en haut !', 'Je m’envole au-dessus des nuages…')
b('Le Roi Panthère des neiges', 'Blizzard', f'Quand tu chauffes, il soulève un blizzard : {BLIND}. Une fois par manche.',
  'Vue du sommet', 'Quand il est « Tiède » ou plus près, il regarde du sommet et apprend si le nombre est plus grand ou plus petit que le sien. Il ne te le dira pas. Une fois par manche.',
  'Les montagnes sont mon royaume ! 👑', 'Blizzard ! On n’y voit rien !', 'Du sommet, je vois tout !', 'Je m’approche du but à pas de velours !', 'Oh, tu es agile comme une panthère !', 'Un bond royal !', 'Je retourne dans les montagnes…')

# 29 · Usine à robots
r('Chien-robot Écrou', 'Capteur-flair', 'Au deuxième coup de la manche, il allume son capteur et apprend si le nombre est plus grand ou plus petit que celui-là. Il ne te le dira pas.',
  'Ouaf-bip ! Je suis un chien-robot ! 🐕', 'Bip-bip ! Mon capteur a compris !', 'Le signal augmente !', 'Erreur ! Tu es trop près !', 'Victoire chargée !', 'Batterie à plat…')
r('Robochat Rouage', 'Court-circuit', 'Au deuxième coup de la manche, il fait des étincelles : ton « ⚡ +1 coup » grille.',
  'Miaou-bip ! Je suis le dernier modèle de chat 🤖', 'Bip-bzzz ! Ton « ⚡ » a grillé !', 'Miaou-bip ! Cible proche !', 'Bip ! Tu es trop près !', 'Miaou-bip ! J’ai gagné !', 'Bip… surchauffe.')
r('Drone Zinzin', 'Survol', 'Au quatrième coup de la manche, il survole le terrain et te dit si le nombre est plus grand ou plus petit que celui-là.',
  'Je vois tout d’en haut ! 🚁', 'Bzzz ! C’est {k} !', 'J’atterris !', 'Tu voles aussi bien !', 'Atterrissage — victoire !', 'Mon hélice est fatiguée…')
r('Robopie Chapardeuse', 'Chapardeuse', 'Après ton premier coup, elle chipe ton « ⚡ +1 coup » — il brille, après tout !',
  'Tchak ! Tout ce qui brille est à moi ! ✨', 'Tchak ! Ton « ⚡ » file dans mon nid !', 'Tchak ! La réponse brille !', 'Ne touche pas à mon nid !', 'Tchak ! La victoire brille !', 'Tchak… tu as gagné.')
r('Androïde Charge', 'Pleine charge', 'Au début de la manche, il se recharge : un « ⚡ +1 coup » pour lui.',
  'Charge 100 %. Début de la partie 🔋', 'Charge 100 % ! Un « ⚡ +1 coup » pour moi !', 'Calcul correct !', 'Erreur : adversaire à proximité !', 'Mission accomplie !', 'Batterie vide…')
r('Robocrabe Tenaille', 'Prise', 'Après ton deuxième coup, il t’attrape avec sa pince : tu gèles et tu passes ton tour.',
  'Clic-clic ! Mes pinces sont en acier 🦀', 'Clic ! Attrapé — tu passes ton tour !', 'Clic ! Cible verrouillée !', 'Tu m’échappes !', 'Clic-clic ! J’ai gagné !', 'Mes pinces ont lâché…')
r('Roboabeille Lentille', 'Scanner', 'À son troisième coup, elle scanne le terrain et apprend si le nombre est pair ou impair. Elle ne te le dira pas.',
  'Bzzz-bip ! Scan en cours ! 🐝', 'Bip ! Scan terminé !', 'Bzz-bip ! Cible proche !', 'Interférences ! Tu es tout près !', 'Bzzz ! J’ai gagné !', 'Mon scanner est cassé…')
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
r('Belette Érable', 'Feuilles bruissantes', 'Quand elle chauffe, elle fait bruisser les feuilles et te dit si le nombre est plus grand ou plus petit que le sien. Une fois par manche.',
  'Frou-frou ! Je joue dans les feuilles 🍁', 'Frou-frou ! C’est {k} !', 'Les feuilles chuchotent : très chaud !', 'Tu m’as trouvée dans les feuilles !', 'Frou-frou — j’ai gagné !', 'Les feuilles se sont envolées…')
r('Martre Fourrure', 'Pattes agiles', f'Au troisième coup de la manche, elle te chipe adroitement ton {K}.',
  'Regarde mon beau manteau ! 🧣', 'Hop ! Le « ⚡ » est à moi !', 'Je m’approche du but à pas feutrés !', 'Oh, tu es agile !', 'Victoire à pattes de velours !', 'Je file dans un arbre…')
r('Marcassin Fouineur', 'Fouille', 'À son troisième coup, il s’enfouit dans les feuilles et passe son tour.',
  'Groin ! Je vais trouver des glands sous les feuilles ! 🐗', 'Je fouille… je passe mon tour.', 'Groin ! Je sens le but !', 'Oh, tu fouilles plus vite !', 'Victoire qui grogne !', 'Je m’enfouis dans les feuilles…')
r('Geai Jacasse', 'Bavardage', 'Il jacasse sans arrêt — tu ne vois pas ton deuxième coup.',
  'Krr-krr ! Je vais tout raconter à la forêt ! 🪶', 'Krr-krr ! Où est passé ton coup ?', 'Krr — tout près !', 'Oh, tu ne te laisses pas distraire !', 'Victoire bavarde !', 'Je vais jacasser dans une autre forêt…')
r('Grand tétras Ronchon', 'Conseil grognon', 'Si tu es « Froid » ou plus loin, il ronchonne et te dit dans quelle moitié est le nombre. Une fois par manche.',
  'Ronron… bon, bonjour 🍂', 'Grmbl… bon, voilà un indice : {k}.', 'Grmbl ! Je suis tout près !', 'Grmbl… tu m’as surpris !', 'Grmbl — j’ai gagné !', 'Grmbl… bon, d’accord.')
r('Moufette Parfum', 'Pouah !', 'À son troisième coup — pouah ! Tu te bouches le nez et tu passes ton tour.',
  'Je suis mignonne — mais ne me fais pas peur ! 🦨', 'Pouah ! Passe ton tour !', 'Oh, tout près !', 'Oh, ne me fais pas peur !', 'Victoire parfumée !', 'Je m’enfuis…')
r('Opossum Pendouille', 'Fais le mort', 'Quand il est « Brûlant », il fait semblant de dormir et passe son tour. Une fois par manche.',
  'J’adore pendre la tête en bas ! 💤', 'Je dors… je passe mon tour.', 'Oh, je suis réveillé — tout près !', 'Tu m’as réveillé !', 'Victoire suspendue !', 'Je fais semblant de dormir…')
b('Le Roi Élan', 'Appel de trompe', 'Au troisième coup de la manche, il brame dans toute la forêt : tu te figes et tu passes ton tour.',
  'Sagesse de la forêt', 'Quand il est « Tiède » ou plus près, il écoute la forêt et apprend dans quelle moitié est le nombre. Il ne te le dira pas. Une fois par manche.',
  'Je suis le roi de la forêt d’automne ! 👑', 'Tou-ou-ou ! Fige-toi !', 'La forêt m’a soufflé la moitié !', 'La forêt murmure — tout près !', 'Oh, tu connais la forêt mieux que moi !', 'Victoire sous les feuilles qui tombent !', 'Je retourne dans les fourrés…')

# 32 · Vallée des pyramides
r('Ibis Papyrus', 'Papyrus', 'Quand il est « Très chaud » ou plus près, il consulte son papyrus et te dit dans quelle moitié est le nombre. Une fois par manche.',
  'J’écris tout sur du papyrus 📜', 'Le papyrus dit : {k}.', 'Les hiéroglyphes mènent à la réponse !', 'Tu lis mes papyrus ?!', 'Noté : victoire !', 'Noté : tu as gagné.')
r('Scarabée Rouleur', 'Boule qui roule', 'Quand tu es « Très chaud » ou plus près, il te lance sa boule : ton coup suivant se joue tout seul — un lancer fou. Une fois par manche.',
  'Je fais rouler le soleil dans le ciel ! ☀️', 'Ça roule ! Ton coup part n’importe où !', 'Je roule droit vers la réponse !', 'Tu me prends ma boule ?!', 'J’ai roulé jusqu’à la victoire !', 'Ma boule a roulé au loin…')
r('Chatte Bastet', 'Bénédiction', 'À son premier coup, elle te bénit : un « ⚡ +1 coup » pour toi.',
  'Ronron… je suis la gardienne de la maison 🐈‍⬛', 'Je te bénis — un « ⚡ +1 coup » !', 'Ronron ! La chance est avec moi !', 'Ronron… tu es malin !', 'Ronron — j’ai gagné !', 'Ronron… tu as gagné.')
r('Chacal Anubis', 'La balance', 'Au quatrième coup de la manche, il pèse tout sur sa balance : il échange les « ⚡ +1 coup » avec toi — les tiens vont à lui, les siens à toi.',
  'Aouh ! Je garde les pyramides 🐺', 'La balance a penché — on échange les « ⚡ » !', 'Aouh ! Je flaire la réponse !', 'Tu t’es faufilé dans la pyramide !', 'Aouh ! J’ai gagné !', 'La balance ne m’a pas favorisé…')
r('Faucon Horus', 'Œil d’Horus', 'Au cinquième coup de la manche, il regarde avec l’Œil d’Horus et te dit si le nombre est plus grand ou plus petit que celui-là.',
  'Mon œil voit tout ! 🦅', 'L’Œil d’Horus voit : c’est {k} !', 'L’Œil ne se trompe jamais !', 'Tu as l’œil du faucon !', 'Victoire sous le soleil !', 'L’Œil s’est fermé…')
r('Hippopotame Taouret', 'Maladroit', 'Après ton troisième coup, il plonge dans le Nil et perd son « ⚡ +1 coup ».',
  'Plouf ! Je suis le géant du fleuve 🦛', 'Plouf ! Mon « ⚡ » est tombé à l’eau !', 'Plouf-plouf, très chaud !', 'Tu nages vers moi ?!', 'Plouf ! J’ai gagné !', 'Plouf… tu as gagné.')
r('Crocodile Sobek', 'Sous l’eau', 'À son premier coup, il plonge : ce coup-là, on ne le voit pas.',
  'Blub… je suis là, dans le Nil 🐊', 'Blub ! Mon premier coup est sous l’eau !', 'Je nage vers la réponse !', 'Tu me vois sous l’eau ?!', 'Clac ! J’ai gagné !', 'Je m’en vais à la nage…')
r('Mangouste Chipe', 'Prise rapide', 'Au sixième coup de la manche, elle attrape une proie : un « ⚡ +1 coup » pour elle.',
  'Je suis rapide et courageuse ! 🦡', 'Hop ! Un « ⚡ +1 coup » pour moi !', 'Je sens une proie !', 'Tu es plus rapide que moi ?!', 'Hop — j’ai gagné !', 'Elle m’a échappé…')
r('Héron Bénou', 'Signe du soleil', 'Quand tu refroidis, il regarde le soleil et apprend si le nombre est pair ou impair. Il ne te le dira pas. Une fois par manche.',
  'Je salue chaque lever du soleil 🌅', 'Le soleil m’a révélé le secret !', 'Le soleil montre le chemin !', 'Tu suis le soleil !', 'Une victoire à l’aube !', 'Le soleil s’est couché…')
b('Râ le Soleil', 'Coup de soleil', 'Au deuxième coup de la manche, il brûle de soleil : ton coup suivant se joue tout seul — un lancer fou.',
  'Rayonnement', 'Quand il est « Brûlant », il brille encore plus fort : un « ⚡ +1 coup » pour lui. Une fois par manche.',
  'Je suis le soleil au-dessus des pyramides ! 👑', 'Soleil brûlant ! Ton coup part n’importe où !', 'Rayonnement ! Un « ⚡ +1 coup » pour moi !',
  'Le soleil est au zénith !', 'Tu n’as pas peur de la chaleur ?!', 'Une victoire ensoleillée ! 👑', 'Le soleil se couche… tu as gagné.')

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
r('Loutre de mer Sieste', 'Sommeil sur les vagues', 'Au sixième coup de la manche, elle s’endort sur les vagues et passe son tour.',
  'Je dors sur le dos en tenant un caillou 🦦', 'Zzz… je me berce sur les vagues… je passe mon tour.', 'Les vagues me portent vers la réponse !', 'Tu me réveilles !', 'J’ai gagné — au dodo !', 'J’ai trop dormi…')
r('Papillon lune Clair-de-lune', 'Clair de lune', 'Au troisième coup de la manche, il vole vers la lune et apprend dans quelle moitié est le nombre. Il ne te le dira pas.',
  'Je vole vers le clair de lune 🌙', 'Le clair de lune m’a tout montré…', 'La lumière me guide !', 'Tu voles vers ma lumière ?!', 'Une victoire au clair de lune !', 'La lumière s’est éteinte…')
r('Loir Somnole', 'Bâillement', 'Après ton premier coup, il bâille si doucement que tu t’endors et passes ton tour.',
  'Je bâââille… 🥱', 'Ouaaah… Dors, passe ton tour !', 'Je vois le but en rêve !', 'Oh, tu ne bâilles pas !', 'Victoire endormie !', 'Je retourne à mon rêve…')
r('Ole Ferme-l’Œil', 'Parapluie magique', f'Quand tu es « Très chaud » ou plus près, il ouvre au-dessus de toi son parapluie à rêves : {BLIND}. Une fois par manche.',
  'J’ouvre mon parapluie — tu rêveras d’un conte ! ☂️', 'Fais de beaux rêves ! Où sont tes coups ?', 'Le conte finit bientôt — tout près !', 'Oh, tu ne dors pas !', 'Victoire de conte de fées !', 'Mon parapluie s’est refermé…')
r('Chauve-souris Oreillette', 'Écho dans la nuit', 'Quand elle est « Très chaud » ou plus près, elle écoute l’écho et apprend dans quelle moitié est le nombre. Elle ne te le dira pas. Une fois par manche.',
  'La nuit, j’entends tout ! 🦇', 'Couic ! Je connais la moitié !', 'J’entends le but !', 'Oh, tu voles sans bruit !', 'Victoire nocturne !', 'Je vais dormir la tête en bas…')
r('Tarsier Veilleuse', 'Attrape-rêves', 'Après ton troisième coup, il attrape ton « ⚡ +1 coup » avec ton rêve.',
  'Mes yeux sont plus grands que la lune ! 👀', 'Hop ! J’ai attrapé ton « ⚡ » et ton rêve !', 'Je vois la réponse dans le noir !', 'Tu ne dors pas ?!', 'Victoire — fais de beaux rêves !', 'Je me suis réveillé… tu as gagné.')
r('Manchot Somnambule', 'Somnambule', 'Si tu es « Froid » ou plus loin, il se promène en dormant et te laisse passer : tu rejoues tout de suite. Une fois par manche.',
  'Zzz… je marche en dormant 🐧', 'Zzz… rejoue…', 'Zzz… je suis tout près…', 'Oh, tu m’as réveillé !', 'J’ai gagné… en dormant !', 'Je me suis réveillé perdant…')
r('Chat Bayoun', 'Berceuse', f'Au quatrième coup de la manche, il ronronne une berceuse : {LAVA}.',
  'Je vais te raconter une histoire… 🐈', 'Rrrr… Un lancer fou, à moitié endormi !', 'L’histoire se termine — tout près !', 'Oh, on ne t’endort pas !', 'Victoire ronronnante !', 'Je vais dormir près du poêle…')
b('La Reine Lune', 'Nuit', f'À son premier coup, elle appelle la nuit : {FOG}.',
  'Étoile filante', f'Quand tu es « Brûlant », elle attrape une étoile filante : un {K} pour elle. Une fois par manche.',
  'Bonne nuit, petit ! 👑', 'La nuit est tombée !', 'Une étoile est tombée — un « ⚡ » pour moi !', 'Les étoiles me le disent — tout près !', 'Oh, tu brilles plus que les étoiles !', 'Victoire au clair de lune !', 'Le matin arrive…')

# 35 · Forge des nains
r('Petit nain Marteau', 'Coup de marteau', 'À son deuxième coup, il frappe avec son marteau — boum ! — tu passes ton tour.',
  'Toc-toc, je forge ! 🔨', 'Boum ! Passe ton tour !', 'C’est presque forgé !', 'Oh, tu forges plus vite !', 'Victoire forgée !', 'Mon marteau s’est cassé…')
r('Esprit du feu Flambée', 'Éteint', 'Quand tu refroidis, il s’éteint et il fait noir : jusqu’à la fin de la manche, tu ne vois plus tes propres coups. Une fois par manche.',
  'Fffou ! Je suis le feu vivant de la forge ! 🔥', 'Pff ! Il fait noir — tu ne vois plus tes propres coups !', 'Je m’embrase — très chaud !', 'Tu attises mon feu !', 'Les flammes de la victoire !', 'Je me suis éteint…')
r('Naine forgeronne Tinte', 'Enclume qui tinte', 'Au troisième coup de la manche, elle frappe l’enclume et apprend au son si le nombre est plus grand ou plus petit que celui-là. Elle ne te le dira pas.',
  'Ding ! Je suis la meilleure forgeronne sous la montagne ⚒️', 'Ding ! Le son m’a tout dit !', 'Il faut battre le fer tant qu’il est chaud !', 'Tu frappes plus fort que moi !', 'Ding ! La victoire est forgée !', 'Mon marteau a glissé…')
r('Taupe mineuse Brouette', 'En route !', 'À son troisième coup, elle emporte ton « ⚡ +1 coup » dans son wagonnet.',
  'Je creuse plus profond que tout le monde ! ⛏️', 'En route ! Ton « ⚡ » est dans mon wagonnet !', 'Le filon est proche !', 'Tu creuses juste à côté de moi !', 'J’ai extrait la victoire !', 'Éboulement… tu as gagné.')
r('Troll Bouffée', 'Fumée de la forge', 'Quand tu es « Très chaud » ou plus près, il souffle de la fumée : jusqu’à la fin de la manche, tu ne vois plus ses coups. Une fois par manche.',
  'Pouf-pouf ! J’entretiens le feu de la forge 💨', 'Pouf ! De la fumée — tu ne vois plus mes coups !', 'Pouf-pouf, très chaud !', 'Tu vois à travers la fumée ?!', 'Pouf ! J’ai gagné !', 'La fumée s’est dissipée…')
r('Kobold Filon', 'Flair pour l’or', 'Au quatrième coup de la manche, il flaire l’or et apprend si le nombre est pair ou impair. Il ne te le dira pas.',
  'Hi-hi ! Je sais où l’or est caché 🪙', 'Hi-hi ! Mon nez a tout compris !', 'L’or est proche !', 'Tu cherches mon or ?!', 'Hi-hi ! Une victoire en or !', 'L’or m’a filé entre les doigts…')
r('Nain chercheur d’or Chanceux', 'Chance du chercheur', 'Après ton deuxième coup, il trouve une pépite au tamis : un « ⚡ +1 coup » pour lui.',
  'Ha ! Aujourd’hui, c’est mon jour de chance ! ✨', 'Une pépite ! Un « ⚡ +1 coup » pour moi !', 'Je sens un filon d’or !', 'Tu tamises juste à côté de moi !', 'Ha ! Quelle chance !', 'Rien que des cailloux…')
r('Nain guerrier Hache', 'Cri de guerre', 'Quand il est « Brûlant », il pousse un cri de guerre : tu gèles et tu passes ton tour. Une fois par manche.',
  'Ha ! Je suis le nain le plus brave sous la montagne ! ⚔️', 'AAARGH ! Fige-toi — tu passes ton tour !', 'La victoire est proche !', 'Tu es un brave guerrier !', 'Hourra ! J’ai gagné !', 'Je bats en retraite… tu as gagné.')
r('Ours forgeron Enclume', 'Coup de marteau', 'À son premier coup, il frappe de son marteau : bong ! — ton coup suivant se joue tout seul — un lancer fou.',
  'Bong-bong ! Je forge des fers à cheval et des épées 🔨', 'BONG ! Ton coup est parti n’importe où !', 'Il faut battre le fer tant qu’il est chaud !', 'Tu frappes aussi bien que moi !', 'Bong ! J’ai gagné !', 'Le marteau est lourd… tu as gagné.')
b('Le Roi des Nains', 'Souterrain', f'À son deuxième coup, il t’emmène sous terre : {MEM}.',
  'Salle du trésor', f'Au deuxième coup de la manche, il emporte ton {K} dans sa salle du trésor.',
  'Bienvenue dans ma forge ! 👑', 'Sous terre ! Et avant, c’était quoi ?', 'À la salle du trésor — le « ⚡ » est à moi !', 'Le trésor est presque trouvé !', 'Oh, tu as trouvé mon filon !', 'Victoire du roi des nains !', 'Je retourne au cœur de la montagne…')
