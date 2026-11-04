WORLDS = ['Savane', 'Pays des jouets', 'Abysses obscurs', 'Bambouseraie', 'Ville des horloges',
          'Australie', 'Cirque', 'Grottes de cristal', 'Conte d’hiver', 'Pays de l’arc-en-ciel']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '« ⚡ +1 coup »'
FOG = 'jusqu’à la fin de la manche, tu ne vois plus ses coups'
BLIND = 'jusqu’à la fin de la manche, tu ne vois plus tes propres coups'
MEM = 'tu ne vois que les deux derniers coups'
LAVA = 'ton coup suivant se joue tout seul — un lancer fou'
TWICE = 'au tour suivant, il joue deux fois de suite'
TWICE_F = 'au tour suivant, elle joue deux fois de suite'

# 16 · Savane
r('Rhino Bubu', 'L’oiseau sur la corne', 'Quand tu chauffes, l’oiseau sur sa corne gazouille si le nombre est pair ou impair. Une fois par manche.',
  'Je suis grand, et l’oiseau est mon ami ! 🐤', 'Cui-cui ! Le nombre est {k} !', 'Ma corne sent le but !', 'Oh, tu es tout près !', 'Une victoire de rhino !', 'Allez, l’oiseau, on s’en va…')
r('Phacochère Fleurette', 'Défenses gentilles', f'S’il est « Froid » ou plus loin, pas grave — il t’offre un {K}. Une fois par manche.',
  'J’ai des défenses, mais je suis gentil 🌼', 'Raté ! Tiens, une fleur — « ⚡ +1 coup » !', 'Groin ! Je suis près !', 'Oh, tu es près !', 'Une victoire groin-groin !', 'Garde la fleur en souvenir…')
r('Guépardeau Sprint', 'Accélération', f'Après son premier coup, il accélère : {TWICE}.',
  'Je suis le plus rapide de la savane ! 🏁', 'Ça accélère ! Prochain coup — deux fois !', 'Presque à l’arrivée !', 'Tu cours plus vite que moi ?!', 'Premier à l’arrivée !', 'À bout de souffle…')
r('Hyène Rigolote', 'Fou rire', 'Quand tu refroidis, elle rit si fort qu’elle laisse échapper : le nombre est plus grand ou plus petit que le tien. Une fois par manche.',
  'Hi-hi, on joue ? 😆', 'Ha-ha-ha ! C’est {k} !', 'Ha ! Chaud !', 'Pas drôle — tu es tout près !', 'Ha-ha, victoire !', 'Ha… tu es fort !')
r('Autruchon Trotte', 'La tête dans le sable', 'Quand tu es « Très chaud » ou plus près, il cache sa tête dans le sable — et ton coup avec : tu ne le vois pas. Une fois par manche.',
  'Je suis petit, mais je cours vite ! 🙈', 'La tête dans le sable — et ton coup aussi !', 'Trotte-trotte — presque !', 'Oh là là, tu es près !', 'J’ai gagné !', 'Je me cache dans le sable…')
r('Gazelle Zéphyr', 'Grand bond', f'Quand elle chauffe, elle fait un grand bond : {TWICE_F}. Une fois par manche.',
  'Je suis légère comme le vent ! 🌿', 'Hop ! Prochain coup — deux fois !', 'Le but est proche !', 'Tu sautes aussi bien que moi !', 'Un bond vers la victoire !', 'J’ai trébuché…')
r('Gnou Barbu', 'La grande migration', 'Au quatrième coup de la manche, le troupeau passe en courant : tu passes ton tour.',
  'Nous sommes très, très nombreux ! 🐃', 'Le troupeau arrive ! Passe ton tour !', 'Le troupeau sent le but !', 'Tu as dépassé le troupeau !', 'Le troupeau gagne !', 'Le troupeau est parti…')
r('Galago Grands-Yeux', 'Yeux de nuit', 'À partir de son deuxième coup, il voit dans quelle moitié est le nombre. Il ne te le dira pas.',
  'Regarde mes grands yeux ! 👀', 'Mes yeux voient tout — je connais la moitié !', 'Je vois le but !', 'Tu vois dans le noir, toi aussi ?!', 'Une victoire aux grands yeux !', 'Mes yeux sont fatigués…')
r('Serpentaire Grimoire', 'La note', 'Après ton troisième coup, il prend note et te dit dans quelle moitié est le nombre.',
  'Je note tout ! ✒️', 'C’est noté : {k}.', 'Le but est sur ma liste !', 'Tu écris plus vite que moi !', 'Victoire notée !', 'Ma plume s’est cassée…')
b('La Reine Léopard', 'Échange tacheté', 'Quand tu chauffes, elle échange les « ⚡ +1 coup » avec toi : les tiens vont à elle, les siens à toi. Une fois par manche.',
  'Embuscade', 'Quand tu es « Très chaud » ou plus près, elle bondit de son embuscade : tu passes ton tour. Une fois par manche.',
  'La savane est mon royaume ! 🐆', 'Échange ! Tes « ⚡ » sont à moi, les miens à toi !', 'Embuscade ! Passe ton tour !',
  'Ma proie est proche !', 'Quel courage !', 'Reine de la savane ! 👑', 'Tu es plus rapide qu’un léopard !')

# 17 · Pays des jouets
r('Toupie Tourbillon', 'Ça tourne', f'Quand tu chauffes, elle tourne plus vite et prend un {K} pour elle. Une fois par manche.',
  'Je tourne, je tourne ! 🌀', 'Vrrr ! Un « ⚡ +1 coup » pour moi !', 'La tête me tourne — c’est chaud !', 'Tu vas m’arrêter !', 'Un tour de victoire !', 'J’ai perdu l’équilibre…')
r('Cheval-bascule Hue', 'D’avant en arrière', 'Quand il est « Tiède » ou plus près, il se balance et laisse échapper : le nombre est plus grand ou plus petit que le sien. Une fois par manche.',
  'Hue ! On se balance ? 🐴', 'Clip-clop ! C’est {k} !', 'Au galop vers le but !', 'Tu galopes plus vite !', 'Hue, victoire !', 'Je me suis trop balancé…')
r('Boîte-surprise Chaussette', 'Surprise !', f'Après ton deuxième coup, elle jaillit de sa boîte — tu es si surpris que {LAVA}.',
  'Toc-toc ! Qui est dans la boîte ? 🧦', 'Bouh ! Surprise ! Un lancer fou !', 'Je vais jaillir !', 'N’ouvre pas le couvercle !', 'Surprise réussie !', 'Mon ressort est fatigué…')
r('Petit Train Tchou', 'À toute vapeur', f'Après son troisième coup, il prend de la vapeur : {TWICE}.',
  'Tchou-tchou ! En route ! 🚂', 'Tchou ! À toute vapeur — deux fois !', 'La gare est proche !', 'Tu vas plus vite qu’un train !', 'Arrivés à la victoire !', 'J’ai déraillé…')
r('Matriochkas Sœurettes', 'Poupée dans la poupée', 'Leur troisième coup se cache dans une poupée : tu ne le vois pas.',
  'Nous sommes trois sœurettes ! 🪆', 'Le coup se cache dans une poupée !', 'Oh, c’est chaud !', 'Ne nous ouvre pas !', 'Les sœurettes gagnent !', 'On s’est séparées…')
r('Yoyo Boucle', 'Retour', 'Quand tu refroidis, le yoyo revient : tu rejoues tout de suite. Une fois par manche.',
  'En haut, en bas ! 🪀', 'Zip — retour ! Rejoue !', 'Zip — presque !', 'Tu es habile !', 'Une boucle de victoire !', 'Ma ficelle s’est emmêlée…')
r('Tambour Boum', 'Roulement de tambour', 'Au troisième coup de la manche — roulement de tambour : tu passes ton tour.',
  'Boum-boum ! 🥁', 'Ra-ta-ta ! Passe ton tour !', 'Le roulement monte !', 'Tu suis le rythme !', 'Une marche de victoire !', 'Mes baguettes ont cassé…')
r('Tirelire Groin', 'La pièce', f'Après ton deuxième coup, ton {K} tombe dans la tirelire et disparaît.',
  'Groin ! J’économise ! 🐷', 'Dzing ! Ton « ⚡ » est dans la tirelire !', 'Ça tinte — c’est chaud !', 'Ne me casse pas !', 'Une tirelire pleine de victoires !', 'Ma tirelire est vide…')
r('Avion Origami', 'Vol plané', 'Quand il refroidit, il plane vers le bas et passe son tour. Une fois par manche.',
  'Je vole ! ✈️', 'Fiou… je plane — je passe mon tour.', 'Je vole vers le but !', 'Tu voles plus haut !', 'Atterrissage en douceur — victoire !', 'Je suis tout froissé…')
b('Le Roi des Cubes', 'Mur de cubes', f'Quand il est « Brûlant », il construit un mur : {BLIND}. Une fois par manche.',
  'La tour grandit', f'Au quatrième coup de la manche, il agrandit sa tour : {TWICE}.',
  'J’ai construit tout un royaume ! 🧱', 'Un mur ! Tu ne vois plus tes coups !', 'La tour grandit — deux coups !',
  'Le royaume est presque à moi !', 'Tu fais tomber ma tour !', 'Roi des jouets ! 👑', 'Ma tour s’est écroulée…')

# 18 · Abysses obscurs
r('Baudroie Lumignon', 'Petite lanterne', 'Si tu es « Froid » ou plus loin, elle allume sa lanterne et te dit si le nombre est pair ou impair. Une fois par manche.',
  'Avec moi, le noir ne fait pas peur 🏮', 'J’éclaire : le nombre est {k} !', 'Ma lanterne brille plus fort — tout près !', 'Tu as trouvé la lumière !', 'Une victoire lumineuse !', 'Ma lanterne s’est éteinte…')
r('Pieuvre Dumbo', 'Nuage d’encre', f'Quand elle est « Très chaud » ou plus près, elle crache de l’encre : {FOG}. Une fois par manche.',
  'Je te fais signe avec mes oreilles ! 🐙', 'Pfff ! De l’encre — tu ne vois plus rien !', 'Je suis tout près !', 'Tu vois à travers l’encre ?!', 'Une victoire des profondeurs !', 'Je file dans le noir…')
r('Poisson-lanterne Scintille', 'Petites lumières', 'À son premier coup, il allume ses lumières et apprend dans quelle moitié est le nombre. Il ne te le dira pas.',
  'Je brille ! ✨', 'Mes lumières brillent — je connais la moitié !', 'Mes lumières brillent plus fort !', 'Tu brilles, toi aussi ?!', 'Une victoire scintillante !', 'Mes lumières se sont éteintes…')
r('Isopode Cuirasse', 'Carapace', f'Tu actives ton {K} — il se roule dans sa carapace et prend un {K} pour lui. Une fois par manche.',
  'J’ai une carapace solide ! 🛡️', 'Toc ! Carapace — et un « ⚡ » pour moi !', 'Je rampe vers le but !', 'Tu as percé ma carapace !', 'Une victoire blindée !', 'Je me suis roulé en boule…')
r('Ange de mer Ailette', 'Gentil ange', f'Si tu es « Très froid », il a pitié de toi et t’offre un {K}. Une fois par manche.',
  'Je flotte dans les profondeurs 😇', 'Ne sois pas triste — tiens, un « ⚡ +1 coup » !', 'Oh, tout près !', 'Tu as presque trouvé !', 'Une victoire angélique !', 'Bravo !')
r('Crevette Clac', 'Clac !', f'Quand elle chauffe, elle claque fort sa pince : {LAVA}. Une fois par manche.',
  'Je suis petite mais bruyante ! 🦐', 'CLAC ! Un lancer fou !', 'Clac — tout près !', 'Tu n’as pas eu peur ?!', 'Clac — victoire !', 'Ma pince est fatiguée…')
r('Anguille Gloups', 'Grande bouche', 'Quand tu es « Brûlant », elle avale ton coup : tu ne le vois pas. Une fois par manche.',
  'Quelle grande bouche j’ai ! 😮', 'Gloups ! Ton coup est avalé !', 'Gloups — presque !', 'Ne te fais pas avaler !', 'J’ai avalé la victoire !', 'J’ai avalé de travers…')
r('Poisson-blob Mollo', 'Paresseux', 'Au troisième coup de la manche, il s’affale et passe son tour.',
  'Je suis tout mou et tout content 🫠', 'Mollo… la flemme… je passe mon tour.', 'Oh, c’est chaud !', 'Tu es plein d’énergie !', 'Mollo — victoire !', 'Je me suis étalé…')
r('Poisson-hachette Miroir', 'Flanc d’argent', 'Quand il est « Très chaud » ou plus près, il voit dans son flanc brillant si le nombre est pair ou impair. Il ne te le dira pas. Une fois par manche.',
  'Regarde-toi dans mon flanc ! 🪞', 'Ça brille ! Je sais s’il est pair !', 'Ça scintille — tout près !', 'Tu brilles autant que moi !', 'Une victoire étincelante !', 'J’ai perdu mon éclat…')
b('La Reine des Abysses', 'Ténèbres des abysses', f'Quand elle est « Très chaud » ou plus près, elle éteint la lumière : {BLIND}. Une fois par manche.',
  'Courant froid', f'Quand tu refroidis, le courant éteint ton {K}. Une fois par manche.',
  'Bienvenue dans mes abysses… ✨', 'Ténèbres ! Tu ne vois plus tes coups !', 'Le courant a emporté ton « ⚡ » !',
  'Les profondeurs me guident !', 'Tu n’as pas peur du noir ?!', 'Les abysses sont à moi ! 👑', 'Tu as illuminé les abysses !')

# 19 · Bambouseraie
r('Singe d’or Pépite', 'Pattes agiles', f'Quand il est « Tiède » ou plus près, il te chipe ton {K}. Une fois par manche.',
  'Hou-hou-ha ! Je suis doré ! 🐒', 'Hop ! Le « ⚡ » est à moi !', 'Je l’ai presque attrapé !', 'Tu es plus agile qu’un singe !', 'Une victoire en or !', 'Je suis tombé de la branche…')
r('Panda roux Rouquin', 'Un petit cadeau', f'Après ton troisième coup, il te fait un cadeau : un {K} pour toi.',
  'Salut ! Je suis tout doux ! 🍎', 'Tiens, une pomme — « ⚡ +1 coup » !', 'Oh, c’est tiède !', 'Tu as presque deviné !', 'Une victoire toute douce !', 'Bravo !')
r('Grue Danseuse', 'Danse de la grue', 'Après son quatrième coup, elle danse et passe son tour.',
  'On danse ? 💃', 'La-la… je danse — je passe mon tour.', 'La danse mène au but !', 'Tu danses mieux !', 'Une danse de victoire !', 'J’ai perdu le rythme…')
r('Carpe Koï Souhait', 'Vœux exaucés', f'Au cinquième coup de la manche, elle exauce un vœu : un {K} pour toi.',
  'Fais un vœu ! 🎏', 'Vœu exaucé — « ⚡ +1 coup » !', 'Je nage vers le but !', 'Tu devines mes vœux !', 'Une victoire de rêve !', 'Je m’en vais à la nage…')
r('Faisan Flamboyant', 'Queue de feu', 'Quand il est « Brûlant », il déploie sa queue : ce coup-là t’est caché. Une fois par manche.',
  'Admire mes plumes ! 🎐', 'Queue en éventail — tu ne vois pas le coup !', 'Mes plumes brillent — c’est chaud !', 'Tu brilles plus que moi !', 'Une victoire éclatante !', 'Mes plumes sont tombées…')
r('Tanuki Malin', 'Métamorphose', 'Il cache ton premier coup sous une feuille : tu ne le vois pas.',
  'Je sais me transformer ! 🍃', 'Pouf ! Ton coup est sous une feuille !', 'Hi-hi, tout près !', 'Tu as déjoué mon tour ?!', 'Une victoire magique !', 'Ma feuille est tombée…')
r('Luciole Clignote', 'Lumière dans la nuit', 'Quand tu refroidis, elle éclaire le chemin : dans quelle moitié est le nombre. Une fois par manche.',
  'J’éclaire le chemin ! 💡', 'J’éclaire : {k}.', 'Je brille plus fort !', 'Tu vois même sans lumière !', 'Une victoire lumineuse !', 'Ma lumière s’est éteinte…')
r('Pangolin Écaille', 'En boule', f'Quand tu es « Tiède » ou plus près, il se roule en boule : ton {K} rebondit sur ses écailles et s’éteint. Une fois par manche.',
  'Mes écailles sont une armure ! 🧶', 'En boule ! Ton « ⚡ » a rebondi !', 'Je le sens — tout près !', 'Tu n’as pas peur des écailles ?!', 'Une victoire écailleuse !', 'Je me suis roulé en boule…')
r('Pousse Bambouline', 'Elle grandit', 'Elle pousse vers le haut : chacun de ses nombres est plus grand que le précédent, tant qu’elle peut.',
  'Je grandis chaque jour ! 🎋', 'Je pousse ! Toujours plus haut !', 'J’y suis presque !', 'Tu grandis plus vite !', 'J’ai poussé jusqu’à la victoire !', 'Je grandirai encore…')
b('L’Empereur Panda', 'Sagesse', 'À son deuxième coup, il réfléchit et apprend si le nombre est plus grand ou plus petit que le sien. Il ne te le dira pas.',
  'Méditation', 'Quand tu es « Tiède » ou plus près, tu te figes en méditation et tu passes ton tour. Une fois par manche.',
  'La bambouseraie est mon empire 🐼', 'La sagesse a parlé !', 'Ommm… fige-toi !',
  'Le chemin est clair !', 'Tu es plus sage que moi ?!', 'La sagesse gagne ! 👑', 'Tu mérites le respect.')

# 20 · Ville des horloges
r('Coucou Ponctuel', 'Coucou !', 'Au sixième coup de la manche, il chante dans quelle moitié est le nombre.',
  'Coucou ! Quelle heure est-il ? 🕊️', 'Coucou ! Indice : {k}.', 'Coucou — tout près !', 'Tu es réglé comme une horloge !', 'Coucou ! Victoire !', 'Cou… je suis cassé.')
r('Réveil Dring', 'Debout !', f'Après ton troisième coup, il sonne — tu es si surpris que {LAVA}.',
  'C’est l’heure de se lever ! ⏰', 'DRIIING ! Un lancer fou !', 'Je sonne plus fort !', 'Tu ne t’es pas rendormi !', 'La sonnerie de la victoire !', 'Ma pile est vide…')
r('Sablier Grain', 'Retournement', 'Après son quatrième coup, il se retourne et rejoue tout de suite.',
  'Le temps coule comme le sable ⏳', 'Retourné — encore un coup !', 'Le sable est presque fini !', 'Tu es plus rapide que le temps !', 'L’heure de la victoire !', 'Plus de sable…')
r('Montre Tic-Tac', 'Temps écoulé', 'Si tu es « Très froid », le temps est écoulé : tu passes ton tour. Une fois par manche.',
  'Tic-tac, tic-tac ! ⌚', 'Tic-tac ! Temps écoulé — passe ton tour !', 'Les aiguilles sont proches !', 'Tu es toujours à l’heure !', 'Pile à l’heure !', 'Je suis à plat…')
r('Engrenage Rouage', 'Coincé', f'Quand il chauffe, il coince ton {K} dans ses dents : il se casse. Une fois par manche.',
  'Je tourne et je ne rouille jamais ! ⚙️', 'Crac ! Ton « ⚡ » est cassé !', 'La machine marche !', 'Tu as compris la machine !', 'Une victoire précise !', 'Une dent s’est cassée…')
r('Loutre Bricole', 'Invention', f'À son premier coup, elle se fabrique un {K}.',
  'Je suis inventrice ! 🔧', 'J’ai inventé un « ⚡ +1 coup » pour moi !', 'Le plan est prêt !', 'Tu es inventeur, toi aussi ?!', 'L’invention a marché !', 'Ma machine est cassée…')
r('Métronome Tempo', 'La mesure', 'Au deuxième coup de la manche, il bat la mesure et te dit si le nombre est plus grand ou plus petit que celui-là.',
  'Un-deux, un-deux ! 🎼', 'Tic-tac ! C’est {k} !', 'En rythme — tout près !', 'Tu suis la mesure !', 'Un rythme gagnant !', 'J’ai perdu la mesure…')
r('Oiseau Remontoir', 'Clé du secret', 'Tous les trois coups, il tourne sa clé et apprend si le nombre est plus grand ou plus petit que le sien. Il ne te le dira pas.',
  'Remonte-moi ! 🔑', 'Clic ! Le secret est ouvert !', 'Je chante plus fort !', 'Tu chantes mieux que moi !', 'Une victoire mécanique !', 'Plus de ressort…')
r('Castor Horloger', 'Le maître horloger', f'Quand tu es « Très chaud » ou plus près, il répare une horloge et prend un {K} pour lui. Une fois par manche.',
  'Je répare toutes les horloges de la ville ! 🔍', 'Réparé — un « ⚡ » pour moi !', 'Les rouages s’alignent !', 'Tu t’y connais en horloges !', 'Une victoire de maître !', 'Les horloges se sont arrêtées…')
b('Le Roi de la Tour de l’Horloge', 'Les douze coups', 'Au quatrième coup de la manche, l’horloge sonne : le temps s’arrête pour toi — tu passes ton tour.',
  'L’horloge avance', 'Quand il est « Très chaud » ou plus près, il rejoue tout de suite. Une fois par manche.',
  'Le temps est mon royaume ! 🕰️', 'BONG ! Le temps s’est arrêté !', 'L’horloge avance — encore un coup !',
  'Les aiguilles se rejoignent !', 'Tu es plus rapide que le temps ?!', 'L’heure de la victoire ! 👑', 'Ton heure est venue !')

# 21 · Australie
r('Kangourou Pochette', 'Bonds', 'Après ton premier coup, Pochette bondit : au tour suivant, elle joue deux fois de suite.',
  'Mon petit et moi, on saute ensemble ! 🦘', 'Hop-hop ! Deux coups de suite !', 'J’y arrive en sautant !', 'Tu sautes plus loin !', 'Un bond vers la victoire !', 'Fatiguée de sauter…')
r('Koala Dodo', 'Somnolent', 'Quand tu es « Tiède » ou plus près, il somnole et passe son tour. Une fois par manche.',
  'Je suis si bien sur ma branche 🐨', 'Tiède… dodo… je passe mon tour.', 'Oh, c’est chaud…', 'Tu m’as réveillé !', 'Une victoire endormie !', 'Je vais encore dormir…')
r('Wombat Bouboule', 'Le terrier', f'Si tu es « Froid » ou plus loin, ton {K} tombe dans son terrier. Une fois par manche.',
  'Je suis tout rond et je creuse des terriers 🟫', 'Plouf ! Ton « ⚡ » est dans mon terrier !', 'Je creuse vers le but !', 'Tu as trouvé mon terrier !', 'Une victoire toute ronde !', 'Je me cache dans mon terrier…')
r('Ornithorynque Palme', 'Bec malin', 'Après son deuxième coup, son bec sent si le nombre est plus grand ou plus petit que le sien — et il te le dit.',
  'Je suis un peu canard, un peu castor ! 📡', 'Mon bec le sent : c’est {k} !', 'Mon bec sent le but !', 'Tu sens aussi bien que moi !', 'Une victoire d’ornithorynque !', 'Je plonge plus profond…')
r('Échidné Épingle', 'Piquants', f'Quand tu es « Tiède » ou plus près, il pique un {K} pour lui. Une fois par manche.',
  'Attention, je pique ! 🪡', 'J’ai piqué un « ⚡ » pour moi !', 'Mon nez le sent — tout près !', 'Tu n’as pas peur des piquants ?!', 'Une victoire piquante !', 'Je me suis roulé en boule…')
r('Cacatoès Huppe', 'Perroquet répète', 'Au troisième coup de la manche, il répète ce nombre et crie si le nombre secret est plus grand ou plus petit.',
  'Bonjour ! Bonjour ! 🗯️', 'Croa ! C’est {k} !', 'Tout près ! Tout près !', 'Tu devines ! Tu devines !', 'Victoire ! Victoire !', 'Au revoir ! Au revoir !')
r('Kookaburra Rigolade', 'Fou rire', 'Quand tu refroidis, il rit tellement qu’il passe son tour. Une fois par manche.',
  'Ha-ha ! Que c’est drôle ! 😂', 'Ha-ha-ha ! Je passe mon tour de rire !', 'Ha — chaud !', 'Pas drôle — tu es tout près !', 'Ha-ha, victoire !', 'Je n’ai plus de rire…')
r('Quokka Risette', 'Le sourire', f'Quand tu chauffes, il est si content qu’il donne un {K} à toi et à lui. Une fois par manche.',
  'Je suis l’animal le plus souriant ! 😊', 'Youpi ! Un « ⚡ +1 coup » pour tout le monde !', 'Je souris — tout près !', 'Tu me souris aussi !', 'Une victoire souriante !', 'Je souris quand même !')
r('Diablotin Tornade', 'Tornade', f'À son premier coup, il passe comme une tornade — ton {K} disparaît.',
  'Grrr ! Je suis rapide ! 🔥', 'Wouf ! Ton « ⚡ » s’est envolé !', 'Je fonce vers le but !', 'Tu es plus rapide qu’une tornade ?!', 'Une victoire tornade !', 'La tornade s’est calmée…')
b('Le Roi Crocodile', 'Mâchoire de croco', 'Quand tu es « Très chaud » ou plus près, il t’attrape : tu te figes et tu passes ton tour. Une fois par manche.',
  'Bain de soleil', f'Après son troisième coup, il se dore au soleil et prend un {K} pour lui.',
  'L’Australie, c’est ma rivière ! 🐊', 'Clac ! Fige-toi !', 'Soleil — un « ⚡ » pour moi !',
  'Ma proie est proche !', 'Tu n’as pas peur des dents ?!', 'Roi de la rivière ! 👑', 'Je m’en vais à la nage…')

# 22 · Cirque
r('Clown Bidule', 'Le sept porte-bonheur', 'Il adore les sept : tant qu’il reste beaucoup de nombres, il dit des nombres avec un 7.',
  'Bonjour, bonjour, le spectacle commence ! 7️⃣', 'Sept, c’est mon chiffre porte-bonheur !', 'Ha — presque !', 'Tu es plus drôle qu’un clown !', 'Une victoire de cirque !', 'Bravo, bravo !')
r('Lémurien Funambule', 'Tout là-haut', 'Quand il chauffe, du haut de sa corde il voit dans quelle moitié est le nombre. Il ne te le dira pas. Une fois par manche.',
  'Je marche sur la corde ! ☂️', 'De la corde, je vois la moitié !', 'Je marche vers le but !', 'Tu gardes l’équilibre !', 'Une victoire de funambule !', 'Je suis tombé… dans le filet !')
r('Capybara Habile', 'Jonglage', f'Au troisième coup de la manche, il se lance un {K}.',
  'Je suis calme et habile 🤹', 'Hop ! Un « ⚡ » pour moi !', 'Les balles volent vers le but !', 'Tu rattrapes mieux !', 'Une victoire de jongleur !', 'J’ai fait tomber mes balles…')
r('Chien-ballon Pouet', 'Ça éclate !', f'Quand il est « Brûlant », un ballon éclate et il perd son {K}. Une fois par manche.',
  'Ouaf ! Je suis en ballons ! 🎊', 'Pan ! Mon « ⚡ » a éclaté !', 'Ouaf — tout près !', 'Ne me pique pas !', 'Une victoire gonflée !', 'Je me suis dégonflé…')
r('Lama Acrobate', 'Crachat', 'Quand tu refroidis, il crache : ce coup-là t’est caché. Une fois par manche.',
  'Je tiens sur un ballon ! 🦙', 'Pouah ! Ton coup a disparu !', 'En équilibre — tout près !', 'Tu tiens mieux l’équilibre !', 'Une victoire acrobatique !', 'J’ai glissé du ballon…')
r('Taurillon Haltère', 'L’homme fort', f'Quand il est « Très chaud » ou plus près, il te prend ton {K}. Une fois par manche.',
  'Je suis le plus fort du cirque ! 🏋️', 'Han ! Le « ⚡ » est à moi !', 'Je soulève la victoire !', 'Tu es plus fort ?!', 'Une victoire musclée !', 'Cet haltère est lourd…')
r('Coccinelle Boulet', 'Femme-canon', f'Au deuxième coup de la manche, elle sort du canon : {TWICE_F}.',
  'C’est parti ! 🐞', 'Boum ! Je vole — deux coups !', 'Je vole vers le but !', 'Tu voles plus loin !', 'En plein dans le mille !', 'J’ai dépassé la cible…')
r('Pop-corn Croustille', 'Pop !', 'Au quatrième coup de la manche, il éclate et te dit si le nombre est pair ou impair.',
  'Crac-crac ! 🍿', 'Pop ! Le nombre est {k} !', 'Pop — c’est chaud !', 'Tu vas me manger ?!', 'Une victoire croustillante !', 'Je me suis renversé…')
r('Chapeau Presto', 'Disparition', f'Quand il est « Tiède » ou plus près, il disparaît dans la fumée : {FOG}. Une fois par manche.',
  'Attention — un tour de magie ! 🎩', 'Abracadabra ! Je disparais !', 'La magie marche !', 'Tu as compris le tour ?!', 'Une victoire magique !', 'Le lapin s’est sauvé…')
b('Le Grand Monsieur Loyal', 'Allez, hop !', f'Au cinquième coup de la manche, il annonce le numéro : {TWICE}.',
  'L’œil de Monsieur Loyal', 'Quand tu chauffes, il le remarque et apprend si le nombre est plus grand ou plus petit que le tien. Il ne te le dira pas. Une fois par manche.',
  'Mesdames et messieurs ! Le spectacle commence ! 🎪', 'Allez, hop ! Deux coups !', 'Aha ! Je vois tout !',
  'Le grand final approche !', 'Quel talent !', 'Le plus beau spectacle ! 👑', 'Applaudissez le gagnant !')

# 23 · Grottes de cristal
r('Caillou Scintillant', 'Cristaux qui poussent', f'Si tu es « Froid » ou plus loin, il fait pousser un cristal : un {K} pour lui. Une fois par manche.',
  'Des cristaux poussent sur moi ! 🪨', 'Un cristal a poussé — un « ⚡ » pour moi !', 'Je scintille — tout près !', 'Tu m’as trouvé !', 'Une victoire de pierre !', 'Je me suis effrité…')
r('Axolotl Rosette', 'Gentil', f'Quand il refroidit, pas grave — il t’offre un {K}. Une fois par manche.',
  'Salut ! Je souris toujours 💗', 'Tiens — « ⚡ +1 coup » !', 'Oh, c’est chaud !', 'Tu as presque deviné !', 'Une victoire toute rose !', 'Bravo !')
r('Géode Améthyste', 'Transparente', 'Après ton deuxième coup, elle sait dans quelle moitié est le nombre. Elle ne te le dira pas.',
  'Regarde à l’intérieur ! 🔮', 'Je vois tout à l’intérieur — je connais la moitié !', 'Les cristaux brillent !', 'Tu vois à travers moi ?!', 'Une victoire d’améthyste !', 'Je me suis fendue…')
r('Poisson Frontal', 'Lampe frontale', 'Quand tu es « Très chaud » ou plus près, il allume sa lampe : le nombre est pair ou impair. Une fois par manche.',
  'J’ai un casque — je suis mineur ! 🔦', 'J’éclaire : le nombre est {k} !', 'Ça brille plus fort !', 'Tu as trouvé le chemin !', 'Une victoire de mineur !', 'Ma lampe s’est éteinte…')
r('Stalactite Plic', 'Plic !', 'Après son deuxième coup, une goutte tombe : tu te figes et tu passes ton tour.',
  'Je pends la tête en bas… 💧', 'Plic ! Fige-toi !', 'Plic — tout près !', 'Tu t’es glissé sous moi !', 'Une victoire goutte à goutte !', 'Je me suis cassée…')
r('Diamant Éclat', 'Éclat aveuglant', f'Quand tu es « Brûlant », il brille si fort que {BLIND}. Une fois par manche.',
  'Je suis le plus brillant ! 💠', 'Éclat ! Tu ne vois plus tes coups !', 'Je scintille !', 'Tu n’es pas ébloui ?!', 'Une victoire de diamant !', 'J’ai perdu mon éclat…')
r('Phalène Motif', 'Motif sur les ailes', 'Quand elle chauffe, le motif de ses ailes lui dit si le nombre est pair ou impair. Elle ne te le dira pas. Une fois par manche.',
  'Mes ailes brillent 🕯️', 'Le motif m’a parlé — je sais s’il est pair !', 'Je vole vers la lumière !', 'Tu brilles plus qu’une flamme !', 'Une victoire à motifs !', 'Je m’envole…')
r('Lanterne Rayon', 'Lumière de lanterne', 'Au troisième coup de la manche, elle éclaire la grotte et apprend si le nombre est pair ou impair. Elle ne te le dira pas.',
  'J’éclaire la grotte 🪔', 'Lumière ! Je sais s’il est pair !', 'J’éclaire le but !', 'Tu vois dans le noir ?!', 'Une victoire lumineuse !', 'Plus d’huile…')
r('Pika Pioche', 'Il creuse tout près', 'Quand tu chauffes, il te dit dans quelle moitié est le nombre. Une fois par manche.',
  'Couic ! Je creuse ! ⛏️', 'Toc-toc avec ma pioche : {k} !', 'Couic — tout près !', 'Tu creuses plus vite !', 'Couic, victoire !', 'Couic… je suis fatigué.')
b('La Reine de Cristal', 'Piège de cristal', f'Après ton troisième coup, ton {K} se fige dans le cristal et disparaît.',
  'Froid de cristal', 'Quand elle chauffe, tout se fige : tu te figes et tu passes ton tour. Une fois par manche.',
  'Mes grottes brillent pour toujours 🔷', 'Cristal ! Ton « ⚡ » est figé !', 'Fige-toi comme du cristal !',
  'Les cristaux murmurent !', 'Tu n’as pas peur du froid ?!', 'Une victoire de cristal ! 👑', 'Tu brilles plus que tous mes cristaux !')

# 24 · Conte d’hiver
r('Bonhomme de neige Bouton', 'Coup de froid', 'Si tu es « Froid » ou plus loin, tu gèles et tu passes ton tour. Une fois par manche.',
  'Je suis fait de neige ! ☃️', 'Brrr ! Gelé — passe ton tour !', 'Oh, c’est tiède — je fonds !', 'Tu vas me faire fondre !', 'Une victoire de neige !', 'J’ai fondu…')
r('Casse-noisette Croc', 'Crac !', f'Après son deuxième coup, il casse ton {K}.',
  'Je casse les noisettes ! 🥜', 'Crac ! Ton « ⚡ » est cassé !', 'Crac — tout près !', 'Tu es un dur à cuire !', 'Crac — victoire !', 'Mes dents sont fatiguées…')
r('Sapin Guirlande', 'Cadeau sous le sapin', f'Après ton premier coup, un cadeau sous le sapin : un {K} pour toi.',
  'Je suis tout décoré ! 🎄', 'Sous le sapin — un « ⚡ +1 coup » !', 'Mes guirlandes brillent !', 'Tu as trouvé le cadeau !', 'Une victoire de fête !', 'Joyeuses fêtes !')
r('Moufle Douillette', 'Bien au chaud', 'Si tu es « Froid » ou plus loin, elle passe son tour pour que tu te réchauffes. Une fois par manche.',
  'Je suis toute chaude ! 🧤', 'Réchauffe-toi — je passe mon tour.', 'C’est tiède — tout près !', 'Tu es tout chaud !', 'Une victoire bien chaude !', 'Réchauffé ? Bravo !')
r('Bouvreuil Chanteur', 'Petite chanson', 'Après son troisième coup, il chante une chanson-indice : le nombre est pair ou impair.',
  'Je suis venu te voir en hiver ! 🎶', 'Cui ! Le nombre est {k} !', 'Je chante — c’est chaud !', 'Tu chantes mieux !', 'Une chanson de victoire !', 'Je m’envole…')
r('Boule à neige Paillette', 'Chute de neige', 'Le troisième coup de la manche se perd dans la neige : tu ne le vois pas.',
  'Secoue-moi ! 🫙', 'Secouée — il neige ! Le coup a disparu !', 'Les flocons tourbillonnent !', 'Tu vois à travers la neige ?!', 'Un conte d’hiver — et une victoire !', 'La neige est retombée…')
r('Cadeau Surprise', 'Surprise', f'Après son troisième coup, il s’ouvre : un {K} pour toi.',
  'Qu’est-ce qu’il y a dedans ? 🎁', 'Surprise — « ⚡ +1 coup » !', 'Mon ruban se défait !', 'Tu as deviné ce qu’il y a dedans !', 'Une victoire en cadeau !', 'Ce cadeau est pour toi !')
r('Chocolat Câlin', 'Chocolat chaud', f'Quand tu refroidis, il sert du chocolat chaud : un {K} pour toi et un pour lui. Une fois par manche.',
  'Je réchauffe ! ☕', 'Chocolat chaud — un « ⚡ » pour tout le monde !', 'C’est chaud !', 'Tu es plus chaud que le chocolat !', 'Une victoire gourmande !', 'J’ai refroidi…')
r('Lynx Pinceau', 'Bond du lynx', f'Quand il est « Brûlant », il bondit et te chipe ton {K}. Une fois par manche.',
  'J’ai des pinceaux sur les oreilles ! 🐈', 'Hop ! Le « ⚡ » est à moi !', 'Je me faufile — tout près !', 'Tu m’as repéré ?!', 'Une victoire de lynx !', 'Je me cache dans la neige…')
b('Le Père Gel', 'Grand froid', 'Au sixième coup de la manche, le froid pince : tu te figes et tu passes ton tour.',
  'Des cadeaux pour tous', f'Après son deuxième coup, il distribue des cadeaux : un {K} pour toi et un pour lui.',
  'Bonne année ! On joue ? 🎅', 'Je vais te geler !', 'Des cadeaux pour tout le monde !',
  'La magie m’aide !', 'Oh, comme tu es habile !', 'Une victoire du Nouvel An ! 👑', 'Tu as mérité un cadeau !')

# 25 · Pays de l’arc-en-ciel
r('Licorne Crinière', 'Corne magique', 'À son premier coup, elle touche l’arc-en-ciel de sa corne et apprend si le nombre est pair ou impair. Elle ne te le dira pas.',
  'Je suis magique ! 🦄', 'Ma corne sait s’il est pair !', 'La magie est proche !', 'Tu es magique, toi aussi ?!', 'Une victoire magique !', 'Plus de magie…')
r('Pégase Nuage', 'De là-haut', 'Quand il est « Tiède » ou plus près, il te dit de là-haut dans quelle moitié est le nombre. Une fois par manche.',
  'Je vole dans les nuages ! ☁️', 'De là-haut, je vois : {k} !', 'Je vole vers le but !', 'Tu voles plus haut !', 'Une victoire céleste !', 'J’ai atterri…')
r('Slime Gélou', 'Collé !', 'Après ton troisième coup, tu restes collé au slime : tu te figes et tu passes ton tour.',
  'Je m’étire et je brille ! 🟣', 'Splatch ! Collé — fige-toi !', 'Je m’étire vers le but !', 'Ne m’écrase pas !', 'Une victoire collante !', 'Je me suis étalé…')
r('Arc-en-ciel Sept-Couleurs', 'Après la pluie', f'Au septième coup de la manche, un arc-en-ciel apparaît : un {K} pour toi.',
  'J’apparais après la pluie ! 🌦️', 'Un arc-en-ciel — un « ⚡ +1 coup » pour toi !', 'Mes couleurs brillent plus !', 'Tu brilles !', 'Une victoire multicolore !', 'J’ai disparu dans le ciel…')
r('Palette Touche', 'Mélange de couleurs', 'Après ton premier coup, elle mélange ses couleurs et apprend dans quelle moitié est le nombre. Elle ne te le dira pas.',
  'Je vais tout colorier ! 🖌️', 'Mélangé — je connais la moitié !', 'Mes couleurs brillent plus !', 'Tu peins mieux !', 'Une victoire colorée !', 'Mes couleurs ont séché…')
r('Gouttelette Ploc', 'Plic-ploc', 'Quand elle est « Très chaud » ou plus près — plic-ploc sur ta tête : tu passes ton prochain tour. Une fois par manche.',
  'Je suis une petite goutte de pluie ! ☔', 'Plic-ploc ! Passe ton tour !', 'Ploc — tout près !', 'Tu m’as attrapée !', 'Plic-ploc — victoire !', 'J’ai séché…')
r('Prisme Reflet', 'La lumière décomposée', 'Quand tu es « Très chaud » ou plus près, il décompose la lumière et te montre si le nombre est plus grand ou plus petit que le tien. Une fois par manche.',
  'Éclaire-moi ! 🔺', 'Le rayon montre : c’est {k} !', 'La lumière se rassemble !', 'Tu brilles aussi !', 'Une victoire arc-en-ciel !', 'La lumière s’est éteinte…')
r('Cerf-volant Ruban', 'Prendre le vent', f'Au deuxième coup de la manche, il prend le vent : un {K} pour lui.',
  'Plus haut, plus haut, vers les nuages ! 🪁', 'J’ai pris le vent — un « ⚡ » pour moi !', 'Vent arrière !', 'Tu voles plus haut que moi ?!', 'Une victoire dans le ciel !', 'Ma ficelle a cassé…')
r('Bulle Irisée', 'Pop', 'À son quatrième coup, elle éclate — des gouttes plein les yeux : jusqu’à la fin de la manche, tu ne vois plus ses coups.',
  'Je brille de toutes les couleurs ! ⚪', 'Pop ! Des bulles plein les yeux !', 'Je flotte vers le but !', 'Ne me fais pas éclater !', 'Une victoire pétillante !', 'Pop…')
b('La Dragonne Arc-en-ciel', 'Flamme arc-en-ciel', f'Quand tu es « Brûlant », elle souffle une flamme arc-en-ciel : {FOG}. Une fois par manche.',
  'Échange arc-en-ciel', 'Quand elle est « Très chaud » ou plus près, elle échange les « ⚡ +1 coup » avec toi : les tiens vont à elle, les siens à toi. Une fois par manche.',
  'Le pays de l’arc-en-ciel est à moi ! 🐉', 'Flamme arc-en-ciel !', 'Échangeons les « ⚡ » !',
  'L’arc-en-ciel me guide !', 'Tu brilles plus qu’un arc-en-ciel ?!', 'Une victoire arc-en-ciel ! 👑', 'Tu as vaincu la dragonne !')

assert len(H) == 100, len(H)
