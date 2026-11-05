WORLDS = ['Savane', 'Vallée des dragons', 'Abysses obscurs', 'Bambouseraie', 'Station OVNI',
          'Australie', 'Cirque', 'Grottes de cristal', 'Âge des mammouths', 'Pays de l’arc-en-ciel']
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

# 17 · Vallée des dragons
r('Dragonnet Tison', 'Il attise les braises', 'Quand tu chauffes, il attise les braises et prend un « ⚡ +1 coup » pour lui. Une fois par manche.',
  'Fffou ! Je me réchauffe les pattes sur une braise ! 🔥', 'Fffou ! La chaleur — un « ⚡ +1 coup » pour moi !', 'Chaud, chaud, chaud !', 'Tu te réchauffes à mon feu ?!', 'Une victoire plus chaude que le feu !', 'Ma braise s’est éteinte…')
r('Wyverne Girouette', 'Queue-girouette', 'Quand elle est « Tiède » ou plus près, sa queue tourne comme une girouette et indique si le nombre est plus grand ou plus petit que le sien. Une fois par manche.',
  'Ma queue sait toujours d’où vient le vent ! 🐉', 'Ma queue indique : c’est {k} !', 'Le vent souffle de mon côté !', 'Tu voles dans le sens du vent !', 'Le vent m’a apporté la victoire !', 'Le vent a tourné…')
r('Dragonnet Atchoum', 'Atchoum !', 'Après ton deuxième coup, il éternue des étincelles — surpris, ton coup suivant se joue tout seul : un lancer fou.',
  'Salut… a… a… ATCHOUM ! 🤧', 'ATCHOUM ! Ton coup est parti n’importe où !', 'Atchoum ! Oh, je suis tout près !', 'À tes souhaits… enfin, tu es tout près !', 'Atchoum ! J’ai gagné !', 'Atchoum… enrhumé et battu.')
r('Dragon Rafale', 'Battement d’ailes', 'Après son troisième coup, il déploie ses ailes : au tour suivant, il joue deux fois de suite.',
  'Mes ailes vont plus vite que le vent ! 🌬️', 'Battement ! Deux coups de suite !', 'Je vole à toute allure !', 'Tu voles derrière moi ?!', 'Je me suis envolé vers la victoire !', 'J’ai replié mes ailes…')
r('Dragonnet Mirage', 'Invisible', 'Son troisième coup se dissout dans l’air : on ne le voit pas.',
  'Tu me vois ? Et maintenant ? ✨', 'Pouf ! Ce coup a disparu !', 'Je suis là où tu ne regardes pas !', 'Tu vois à travers le mirage ?!', 'Le mirage a gagné !', 'Le mirage s’est dissipé…')
r('Dragonnet Gentil', 'Deuxième chance', 'Quand tu refroidis, il te laisse gentiment réessayer : tu rejoues tout de suite. Une fois par manche.',
  'Je suis le dragon le plus gentil de la vallée ! 💛', 'Ne sois pas triste — rejoue !', 'Oh, j’ai presque trouvé moi-même !', 'Tu es tout près — je suis content pour toi !', 'J’ai gagné ! Mais tu as été super !', 'Hourra ! Tu as gagné — je ne suis pas fâché !')
r('Dragon Grondement', 'Rugissement', 'Au troisième coup de la manche, il rugit si fort que tu passes ton tour.',
  'Grrr… c’est ma façon de dire bonjour 🐲', 'GRRR ! Tu passes ton tour !', 'Grrr, je sens la victoire !', 'Tu n’as pas peur de moi ?!', 'Grrr ! Un rugissement de victoire !', 'Grr… bon, d’accord.')
r('Dragon Radin', 'Trésor', 'Après ton deuxième coup, il cache ton « ⚡ +1 coup » dans son trésor — et il disparaît.',
  'Tout l’or est à moi ! Le tien aussi ! 💰', 'À moi ! Dans le trésor !', 'Ça sent l’or !', 'Ne t’approche pas de mon or !', 'Encore une pièce pour mon trésor !', 'Mon or… soupir.')
r('Serpent à plumes Quetzal', 'Il plane', 'Quand il refroidit, il plane dans les nuages et passe son tour. Une fois par manche.',
  'Sss… plumes et écailles — voilà ma beauté 🪶', 'Sss… je plane, je passe mon tour.', 'Sss, je suis tout près !', 'Tu m’as ébouriffé les plumes !', 'Sss ! J’ai gagné !', 'Mes plumes sont retombées…')
b('Le Roi des dragons', 'Rideau de feu', 'Quand il est « Brûlant », il souffle un rideau de feu : jusqu’à la fin de la manche, tu ne vois plus tes propres coups. Une fois par manche.',
  'Envol', 'Au quatrième coup de la manche, il s’envole : au tour suivant, il joue deux fois de suite.',
  'Incline-toi devant le Roi des dragons ! 👑', 'Feu ! Tu ne vois plus tes propres coups !', 'Je m’envole ! Deux coups de suite !',
  'Mes flammes sentent la victoire !', 'Tu n’as pas peur du feu ?!', 'Une victoire de dragon ! 👑', 'Ma flamme s’est éteinte… tu as gagné.')

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
r('Gibbon Liane', 'Toujours plus haut', 'Grimpe toujours plus haut : chacun de ses nombres est plus grand que le précédent, tant que c’est possible.',
  'Hou-hou ! Plus c’est haut, mieux c’est ! 🐒', 'Hou-hou ! Je grimpe plus haut !', 'Presque au sommet de l’arbre !', 'Tu grimpes derrière moi ?!', 'Hou-hou ! Je suis tout en haut !', 'J’ai lâché la liane…')
b('L’Empereur Panda', 'Sagesse', 'À son deuxième coup, il réfléchit et apprend si le nombre est plus grand ou plus petit que le sien. Il ne te le dira pas.',
  'Méditation', 'Quand tu es « Tiède » ou plus près, tu te figes en méditation et tu passes ton tour. Une fois par manche.',
  'La bambouseraie est mon empire 🐼', 'La sagesse a parlé !', 'Ommm… fige-toi !',
  'Le chemin est clair !', 'Tu es plus sage que moi ?!', 'La sagesse gagne ! 👑', 'Tu mérites le respect.')

# 20 · Station OVNI
r('Extraterrestre Goup', 'Signal', 'Au sixième coup de la manche, il capte un signal venu de l’orbite et te dit dans quelle moitié est le nombre.',
  'Goup-goup ! Bonjour, Terrien ! 👽', 'Goup-goup ! Le signal dit : {k} !', 'Goup ! Mes antennes frémissent !', 'Le Terrien s’est approché !', 'Goup-goup ! J’ai gagné !', 'Goup… retour à la base.')
r('Tardigrade Apesanteur', 'Apesanteur', 'Après ton troisième coup, il active l’apesanteur : ton coup suivant se joue tout seul — un lancer fou.',
  'Je survis même dans l’espace ! 🚀', 'Apesanteur ! Ton coup s’est envolé !', 'Je flotte droit vers la réponse !', 'Tu flottes vers moi ?!', 'Je suis coriace — j’ai gagné !', 'Parti à la dérive…')
r('Martien Doublé', 'Deux têtes', 'Après son quatrième coup, ses deux têtes se mettent d’accord : il rejoue tout de suite.',
  'Salut-salut ! Nous sommes deux — en un ! 🪐', 'Deux têtes — un coup de plus !', 'Deux têtes valent mieux qu’une — très chaud !', 'Les deux têtes s’inquiètent !', 'Une double victoire !', 'Les deux têtes sont tristes…')
r('Limace spatiale Gluante', 'Traînée collante', 'Si tu es « Très froid », tu marches dans sa traînée collante et tu passes ton tour. Une fois par manche.',
  'Splotch ! Salut de la nébuleuse ! 🌌', 'Splotch ! Collé — tu passes ton tour !', 'Splotch-splotch, je suis tout près !', 'Oh, tu ne colles pas ?!', 'Splotch ! J’ai gagné !', 'Splotch… j’ai fondu.')
r('Hérisson stellaire Zap', 'Décharge', 'Quand il chauffe, il te lance une étincelle : ton « ⚡ +1 coup » grille. Une fois par manche.',
  'Ne me caresse pas — je fais des décharges ! ⚡', 'Bzzz ! Ton « ⚡ » a grillé !', 'J’étincelle de joie !', 'Tu n’as pas peur des étincelles ?!', 'Bzzz ! J’ai gagné !', 'Je suis à plat…')
r('Souris astronaute Cosmo', 'Réserve de départ', 'À son premier coup, elle sort de sa combinaison un « ⚡ +1 coup » pour elle.',
  'Pilote prête au décollage ! 🚀', 'Réserve de départ — un « ⚡ +1 coup » pour moi !', 'Cap sur la victoire !', 'Tu es sur mon orbite !', 'Atterrissage sur la victoire !', 'Vol annulé…')
r('Extraterrestre Radar', 'Radar', 'Au deuxième coup de la manche, il capte un signal avec son radar et te dit si le nombre est plus grand ou plus petit que celui-là.',
  'Bip-bip… Terrien détecté ! 📡', 'Bip-bip ! C’est {k} !', 'Le signal est de plus en plus fort !', 'Tu brouilles mon signal !', 'Bip-bip ! J’ai gagné !', 'Signal perdu…')
r('Pieuvre télépathe Pensée', 'Lecture des pensées', 'Un coup sur trois, elle lit dans les pensées et apprend si le nombre est plus grand ou plus petit que le sien. Elle ne te le dira pas.',
  'Je sais à quoi tu penses… 🐙', 'Je lis les pensées… je sais où aller !', 'Les pensées me guident vers la réponse !', 'Tu penses trop fort !', 'Je l’avais prévu !', 'Rien lu… tu as gagné.')
r('Chiot astronaute Fusée', 'Réacteur dorsal', 'Quand tu es « Très chaud » ou plus près, il allume son réacteur dorsal et prend un « ⚡ +1 coup » pour lui. Une fois par manche.',
  'Ouaf ! Vers les étoiles ! 🚀', 'Ouaf ! Réacteur chargé — un « ⚡ +1 coup » pour moi !', 'Ouaf ! Je flaire une traînée d’étoiles !', 'Tu voles plus vite que moi !', 'Ouaf-ouaf ! Victoire dans l’espace !', 'Ouaf… j’ai atterri.')
b('La Grande Ourse', 'Froid des étoiles', 'Au quatrième coup de la manche, elle souffle le froid de l’espace : tu gèles et tu passes ton tour.',
  'Étoile polaire', 'Quand elle est « Très chaude » ou plus près, elle consulte l’étoile polaire et rejoue tout de suite. Une fois par manche.',
  'Je brille dans le ciel chaque nuit ! 👑', 'Froid des étoiles ! Tu passes ton tour !', 'L’étoile polaire a parlé — je rejoue !',
  'Les étoiles me font des clins d’œil !', 'Tu voles vers mes étoiles !', 'Une victoire étoilée ! 👑', 'Les étoiles se sont éteintes… tu as gagné.')

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
r('Tigreau Cerceau', 'Saut dans le cerceau', 'Quand il est « Brûlant », il s’emballe, saute dans le cerceau et perd son « ⚡ +1 coup ». Une fois par manche.',
  'Grao ! Regarde comme je saute ! 🐯', 'Hop ! J’ai fait tomber mon « ⚡ » !', 'Grao ! Je suis tout près !', 'Tu sautes mieux que moi !', 'Grao ! Un saut victorieux !', 'J’ai raté le cerceau…')
r('Lama Acrobate', 'Crachat', 'Quand tu refroidis, il crache : ce coup-là t’est caché. Une fois par manche.',
  'Je tiens sur un ballon ! 🦙', 'Pouah ! Ton coup a disparu !', 'En équilibre — tout près !', 'Tu tiens mieux l’équilibre !', 'Une victoire acrobatique !', 'J’ai glissé du ballon…')
r('Taurillon Haltère', 'L’homme fort', f'Quand il est « Très chaud » ou plus près, il te prend ton {K}. Une fois par manche.',
  'Je suis le plus fort du cirque ! 🏋️', 'Han ! Le « ⚡ » est à moi !', 'Je soulève la victoire !', 'Tu es plus fort ?!', 'Une victoire musclée !', 'Cet haltère est lourd…')
r('Coccinelle Boulet', 'Femme-canon', f'Au deuxième coup de la manche, elle sort du canon : {TWICE_F}.',
  'C’est parti ! 🐞', 'Boum ! Je vole — deux coups !', 'Je vole vers le but !', 'Tu voles plus loin !', 'En plein dans le mille !', 'J’ai dépassé la cible…')
r('Hamster Galipette', 'Galipette-indice', 'Au quatrième coup de la manche, il fait une galipette et te dit si le nombre est pair ou impair.',
  'Galipette ! Et encore une ! Salut ! 🐹', 'Galipette ! Le nombre est {k} !', 'J’ai la tête qui tourne — très chaud !', 'Tu roules vers la réponse !', 'La galipette de la victoire !', 'J’ai trop roulé…')
r('Chapeau Presto', 'Disparition', f'Quand il est « Tiède » ou plus près, il disparaît dans la fumée : {FOG}. Une fois par manche.',
  'Attention — un tour de magie ! 🎩', 'Abracadabra ! Je disparais !', 'La magie marche !', 'Tu as compris le tour ?!', 'Une victoire magique !', 'Le lapin s’est sauvé…')
b('Le Grand Monsieur Loyal', 'Allez, hop !', f'Au cinquième coup de la manche, il annonce le numéro : {TWICE}.',
  'L’œil de Monsieur Loyal', 'Quand tu chauffes, il le remarque et apprend si le nombre est plus grand ou plus petit que le tien. Il ne te le dira pas. Une fois par manche.',
  'Mesdames et messieurs ! Le spectacle commence ! 🎪', 'Allez, hop ! Deux coups !', 'Aha ! Je vois tout !',
  'Le grand final approche !', 'Quel talent !', 'Le plus beau spectacle ! 👑', 'Applaudissez le gagnant !')

# 23 · Grottes de cristal
r('Condylure Creuseur', 'Collectionneur de cristaux', 'Si tu es « Froid » ou plus loin, il déterre un cristal : un « ⚡ +1 coup » pour lui. Une fois par manche.',
  'Mon nez est une étoile ! Avec lui, je trouve tout ⭐', 'Je creuse, je creuse — un « ⚡ +1 coup » pour moi !', 'Mon nez sent les cristaux !', 'Tu creuses juste à côté de moi !', 'J’ai déterré la victoire !', 'Je me suis terré… tu as gagné.')
r('Axolotl Rosette', 'Gentil', f'Quand il refroidit, pas grave — il t’offre un {K}. Une fois par manche.',
  'Salut ! Je souris toujours 💗', 'Tiens — « ⚡ +1 coup » !', 'Oh, c’est chaud !', 'Tu as presque deviné !', 'Une victoire toute rose !', 'Bravo !')
r('Protée Flair', 'Sixième sens', 'Après ton deuxième coup, il sent à travers la roche dans quelle moitié est le nombre. Il ne te le dira pas.',
  'Je vis dans le noir — je n’ai pas besoin d’yeux 🦎', 'Je sens… je sais où chercher !', 'Le noir me guide !', 'Toi aussi, tu le sens ?!', 'Sans yeux — et j’ai gagné !', 'J’ai senti dans la mauvaise direction…')
r('Poisson Frontal', 'Lampe frontale', 'Quand tu es « Très chaud » ou plus près, il allume sa lampe : le nombre est pair ou impair. Une fois par manche.',
  'J’ai un casque — je suis mineur ! 🔦', 'J’éclaire : le nombre est {k} !', 'Ça brille plus fort !', 'Tu as trouvé le chemin !', 'Une victoire de mineur !', 'Ma lampe s’est éteinte…')
r('Stalactite Plic', 'Plic !', 'Après son deuxième coup, une goutte tombe : tu te figes et tu passes ton tour.',
  'Je pends la tête en bas… 💧', 'Plic ! Fige-toi !', 'Plic — tout près !', 'Tu t’es glissé sous moi !', 'Une victoire goutte à goutte !', 'Je me suis cassée…')
r('Lézard de cristal Prisme', 'Éclat aveuglant', 'Quand tu es « Brûlant », il scintille si fort que, jusqu’à la fin de la manche, tu ne vois plus tes propres coups. Une fois par manche.',
  'Regarde comme je scintille ! 💎', 'Éclat ! Tu ne vois plus tes propres coups !', 'Mes cristaux brillent !', 'Tu ne plisses pas les yeux ?!', 'Une victoire étincelante !', 'J’ai perdu mon éclat…')
r('Phalène Motif', 'Motif sur les ailes', 'Quand elle chauffe, le motif de ses ailes lui dit si le nombre est pair ou impair. Elle ne te le dira pas. Une fois par manche.',
  'Mes ailes brillent 🕯️', 'Le motif m’a parlé — je sais s’il est pair !', 'Je vole vers la lumière !', 'Tu brilles plus qu’une flamme !', 'Une victoire à motifs !', 'Je m’envole…')
r('Grillon des cavernes Grinçant', 'Écho de la grotte', 'Au troisième coup de la manche, il écoute l’écho et apprend si le nombre est pair ou impair. Il ne te le dira pas.',
  'Cri-cri ! Tu entends l’écho ? 🦗', 'Cri-cri… l’écho m’a tout raconté !', 'L’écho résonne — très chaud !', 'Tes pas font trop de bruit !', 'Cri-cri — j’ai gagné !', 'L’écho m’a trompé…')
r('Pika Pioche', 'Il creuse tout près', 'Quand tu chauffes, il te dit dans quelle moitié est le nombre. Une fois par manche.',
  'Couic ! Je creuse ! ⛏️', 'Toc-toc avec ma pioche : {k} !', 'Couic — tout près !', 'Tu creuses plus vite !', 'Couic, victoire !', 'Couic… je suis fatigué.')
b('La Reine de Cristal', 'Piège de cristal', f'Après ton troisième coup, ton {K} se fige dans le cristal et disparaît.',
  'Froid de cristal', 'Quand elle chauffe, tout se fige : tu te figes et tu passes ton tour. Une fois par manche.',
  'Mes grottes brillent pour toujours 🔷', 'Cristal ! Ton « ⚡ » est figé !', 'Fige-toi comme du cristal !',
  'Les cristaux murmurent !', 'Tu n’as pas peur du froid ?!', 'Une victoire de cristal ! 👑', 'Tu brilles plus que tous mes cristaux !')

# 24 · Âge des mammouths
r('Bébé mammouth Hirsute', 'Poussière de glace', 'Si tu es « Froid » ou plus loin, il agite sa trompe et te couvre de poussière de glace : tu gèles et tu passes ton tour. Une fois par manche.',
  'Tou-tou ! Je suis le mammouth le plus poilu ! 🦣', 'Pouf ! Gelé — tu passes ton tour !', 'Tou-tou ! Je suis tout près !', 'Tu suis mes traces !', 'Tou-touuu ! J’ai gagné !', 'J’en ai les poils dressés… tu as gagné.')
r('Smilodon Canine', 'Croc acéré', 'Après son deuxième coup, il croque ton « ⚡ +1 coup » — et il disparaît.',
  'N’aie pas peur — je n’ai l’air féroce qu’en apparence 🐯', 'Crac ! Ton « ⚡ » a disparu !', 'Mes crocs sentent la victoire !', 'Tu es courageux !', 'Grr ! J’ai gagné !', 'Mes crocs se sont émoussés…')
r('Rhinocéros laineux Congère', 'Gentil géant', 'Après ton premier coup, il t’offre un « ⚡ +1 coup » — pour te réchauffer.',
  'Je suis grand, mais gentil ! 🦏', 'Tiens, un « ⚡ +1 coup » — réchauffe-toi !', 'Boum-boum, je suis tout près !', 'Tu es tout près — bravo !', 'Boum-boum — j’ai gagné !', 'Bon, tu l’as mérité !')
r('Ours des cavernes Tanière', 'Tanière chaude', 'Si tu es « Froid » ou plus loin, il va se réchauffer dans sa tanière et passe son tour. Une fois par manche.',
  'Hmm… je viens de me réveiller 🐻', 'Je vais me réchauffer… je passe mon tour.', 'Ça sent le miel — très chaud !', 'Tu es devant ma tanière !', 'Grr ! J’ai gagné — et au lit !', 'Je retourne dormir…')
r('Cerf géant Ramure', 'Appel du brame', 'Après son troisième coup, il brame un indice : le nombre est-il pair ou impair.',
  'Tu vois mes bois ? Les plus larges de tous ! 🦌', 'Bôôô ! Le nombre est {k} !', 'Mes bois sentent la victoire !', 'Tu t’es approché de mes bois !', 'Bôôô ! J’ai gagné !', 'Mes bois se sont baissés…')
r('Lion des cavernes Embuscade', 'À l’affût', 'Le troisième coup de la manche s’enfonce dans une congère : on ne le voit pas.',
  'Grr… dans la neige, tu ne me vois pas 🦁', 'Chut… ce coup est à l’affût !', 'La proie est proche !', 'Tu as trouvé ma cachette ?!', 'Un bond hors de l’affût — j’ai gagné !', 'L’embuscade a raté…')
r('Glyptodon Carapace', 'Carapace généreuse', 'Après son troisième coup, il entrouvre sa carapace et t’offre un « ⚡ +1 coup ».',
  'Ma carapace est plus dure que la pierre ! 🛡️', 'Tiens, un « ⚡ +1 coup » de sous ma carapace !', 'Je rampe vers la réponse !', 'Tu frappes à ma carapace ?!', 'Une victoire solide comme le roc !', 'Je rentre dans ma carapace…')
r('Paresseux géant Câlin', 'Gros câlin', 'Quand tu refroidis, il te fait un câlin : un « ⚡ +1 coup » pour toi et un pour lui. Une fois par manche.',
  'Bonjouuur… un câliiin ? 🦥', 'Câlin ! Un « ⚡ +1 coup » pour chacun !', 'Je suis… presque… là…', 'Tu es… si… rapide…', 'Lentement… mais j’ai gagné !', 'Pas grave… un câlin ?')
r('Lynx Pinceau', 'Bond du lynx', f'Quand il est « Brûlant », il bondit et te chipe ton {K}. Une fois par manche.',
  'J’ai des pinceaux sur les oreilles ! 🐈', 'Hop ! Le « ⚡ » est à moi !', 'Je me faufile — tout près !', 'Tu m’as repéré ?!', 'Une victoire de lynx !', 'Je me cache dans la neige…')
b('Le Roi des mammouths', 'Tempête de glace', 'Au sixième coup de la manche, il barrit une tempête : tu gèles et tu passes ton tour.',
  'Cadeau du chef', 'Après son deuxième coup, il partage avec toi : un « ⚡ +1 coup » pour toi et un pour lui.',
  'Je mène mon troupeau à travers les glaces éternelles ! 👑', 'Tôôô ! Tempête — tu passes ton tour !', 'Le chef est généreux : un « ⚡ +1 coup » pour chacun !',
  'La glace craque — très chaud !', 'Tu es fort, petit !', 'Une victoire royale ! 👑', 'J’incline mes défenses — tu as gagné.')

# 25 · Pays de l’arc-en-ciel
r('Licorne Crinière', 'Corne magique', 'À son premier coup, elle touche l’arc-en-ciel de sa corne et apprend si le nombre est pair ou impair. Elle ne te le dira pas.',
  'Je suis magique ! 🦄', 'Ma corne sait s’il est pair !', 'La magie est proche !', 'Tu es magique, toi aussi ?!', 'Une victoire magique !', 'Plus de magie…')
r('Pégase Nuage', 'De là-haut', 'Quand il est « Tiède » ou plus près, il te dit de là-haut dans quelle moitié est le nombre. Une fois par manche.',
  'Je vole dans les nuages ! ☁️', 'De là-haut, je vois : {k} !', 'Je vole vers le but !', 'Tu voles plus haut !', 'Une victoire céleste !', 'J’ai atterri…')
r('Kelpie Remous', 'Remous', 'Après ton troisième coup, il t’entraîne dans un remous : tu gèles et tu passes ton tour.',
  'On fait un tour sur les vagues ? 🌊', 'Glouglou ! Remous — tu passes ton tour !', 'La vague me porte vers la réponse !', 'Tu nages à contre-courant !', 'Glouglou — j’ai gagné !', 'Emporté par le courant…')
r('Canard mandarin Arabesque', 'Plume à motifs', 'Au septième coup de la manche, il laisse tomber une plume à motifs : un « ⚡ +1 coup » pour toi.',
  'Coin ! Je suis le canard le plus élégant ! 🦆', 'Coin ! Tiens, une plume — un « ⚡ +1 coup » !', 'Coin ! Presque !', 'Coin-coin, tu es tout près !', 'Coin ! J’ai gagné !', 'Coin… tu as gagné.')
r('Qilin Sage', 'Sagesse du qilin', 'Après ton premier coup, il réfléchit et apprend dans quelle moitié est le nombre. Il ne te le dira pas.',
  'J’apporte la sagesse et la chance ✨', 'La sagesse m’a montré le chemin…', 'La chance est de mon côté !', 'Tu es sage pour ton âge !', 'La sagesse a gagné !', 'Même les sages se trompent…')
r('Méduse Piquante', 'Tentacule piquant', 'Quand elle est « Très chaude » ou plus près, elle pique avec un tentacule : tu passes ton tour suivant. Une fois par manche.',
  'Je chatoie de toutes les couleurs ! 🪼', 'Aïe ! Tu passes ton tour !', 'Je flotte droit vers la réponse !', 'Attention, je pique !', 'Une victoire chatoyante !', 'J’ai fondu dans les vagues…')
r('Oiseau de paradis Danseur', 'Danse-indice', 'Quand tu es « Très chaud » ou plus près, il danse et montre avec ses plumes si le nombre est plus grand ou plus petit que le tien. Une fois par manche.',
  'On danse ? Je suis le meilleur danseur de la forêt ! 🦚', 'Ma danse dit : c’est {k} !', 'Ma danse mène à la victoire !', 'Tu danses mieux que moi !', 'Danse de la victoire !', 'J’ai perdu le rythme…')
r('Loriquet Siroteur', 'Nectar', 'Au deuxième coup de la manche, il sirote du nectar : un « ⚡ +1 coup » pour lui.',
  'Cui ! Je suis l’oiseau le plus coloré ! 🦜', 'Doux nectar — un « ⚡ +1 coup » pour moi !', 'Cui ! Très chaud !', 'Cui ! Tu es tout près !', 'Cui-cui ! J’ai gagné !', 'Cui… tu as gagné.')
r('Calmar luciole Néon', 'Nuage d’encre', 'À son quatrième coup, il crache de l’encre : jusqu’à la fin de la manche, tu ne vois plus ses coups.',
  'Je scintille dans les profondeurs ! 🦑', 'Pschitt ! De l’encre — tu ne vois plus mes coups !', 'Je scintille tout près de la réponse !', 'Tu vois à travers l’encre ?!', 'Une victoire scintillante !', 'Mes lumières se sont éteintes…')
b('La Dragonne Arc-en-ciel', 'Flamme arc-en-ciel', f'Quand tu es « Brûlant », elle souffle une flamme arc-en-ciel : {FOG}. Une fois par manche.',
  'Échange arc-en-ciel', 'Quand elle est « Très chaud » ou plus près, elle échange les « ⚡ +1 coup » avec toi : les tiens vont à elle, les siens à toi. Une fois par manche.',
  'Le pays de l’arc-en-ciel est à moi ! 🐉', 'Flamme arc-en-ciel !', 'Échangeons les « ⚡ » !',
  'L’arc-en-ciel me guide !', 'Tu brilles plus qu’un arc-en-ciel ?!', 'Une victoire arc-en-ciel ! 👑', 'Tu as vaincu la dragonne !')

assert len(H) == 100, len(H)
