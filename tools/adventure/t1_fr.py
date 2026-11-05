WORLDS = ['Royaume des bonbons', 'Arctique glacé', 'Désert torride', 'Ferme joyeuse', 'Ville des nuages',
          'Jardin fleuri', 'Vallée des dinosaures', 'Île aux pirates', 'Village d’Halloween', 'Château royal']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '« ⚡ +1 coup »'
FOG = 'jusqu’à la fin de la manche, tu ne vois plus ses coups'
MEM = 'jusqu’à la fin de la manche, tu ne vois que les deux derniers coups'
LAVA = 'ton coup suivant se joue tout seul — un lancer fou'
TWICE = 'au tour suivant, il joue deux fois de suite'
TWICE_F = 'au tour suivant, elle joue deux fois de suite'

# 6 · Royaume des bonbons
r('Ourson Gelée', 'Collant', 'Si tu es « Froid » ou plus loin, tu restes collé dans la gelée et tu passes ton tour. Une fois par manche.',
  'Je suis sucré et collant ! 🍬', 'Collé ? Passe ton tour !', 'Mmm, ça sent la victoire !', 'Oh, tu es trop près !', 'Une victoire sucrée ! 🍬', 'J’ai fondu…')
r('Cupcake Cerise', 'La cerise sur le gâteau', f'Quand il est « Très chaud » ou plus près, il est si content qu’il t’offre un {K}. Une fois par manche.',
  'Salut ! Sers-toi ! 🍒', 'Tiens, une cerise — « ⚡ +1 coup » !', 'Je suis presque cuit — c’est chaud !', 'Tu es chaud comme un four !', 'La victoire, c’est la cerise sur le gâteau !', 'Oh non, j’ai brûlé…')
r('Caniche Barbe-à-papa', 'Nuage sucré', f'Après ton premier coup, il t’enveloppe de barbe à papa : {FOG}.',
  'Je suis tout doux et sucré ! 🍭', 'Pouf ! Nuage sucré !', 'Je crois que je suis tout près !', 'Ne mange pas ma barbe à papa — tu vas deviner !', 'Une victoire toute douce !', 'Ma barbe à papa a fondu… 🍭')
r('Bonhomme Glaçage', 'Tu ne m’attraperas pas !', f'Quand tu es « Très chaud » ou plus près, il s’enfuit : {TWICE}. Une fois par manche.',
  'Cours, cours, tu ne m’attraperas pas ! 🏃', 'Tu ne m’attraperas pas — je cours deux fois !', 'J’y suis presque !', 'Oh, tu me rattrapes !', 'Pas attrapé ! Ha !', 'Tu m’as quand même attrapé…')
r('Hamster Macaron', 'Joues-garde-manger', f'À son deuxième coup, il sort de ses joues un {K} pour lui.',
  'J’ai tout mis de côté ! 🥮', 'Miam ! Un « ⚡ +1 coup » de ma joue !', 'Ça sent bon par ici !', 'Hé, pas touche à mes réserves !', 'Une réserve de victoire — à moi !', 'Plus de réserves…')
r('Hippo Gâteau', 'Fais un vœu', 'Après ton premier coup, il souffle une bougie et te dit si le nombre est pair ou impair.',
  'C’est ma fête ! 🎂', 'Pfff ! Le nombre est {k} !', 'Le cadeau est tout près !', 'Tu as soufflé presque toutes mes bougies !', 'Le plus beau des anniversaires !', 'Au moins, il reste du gâteau 🎂')
r('Chiot Beignet', 'Queue qui frétille', 'Quand tu chauffes, il est si content qu’il passe son tour suivant. Une fois par manche.',
  'Ouaf ! On joue ? 🍩', 'Youpi, tu chauffes ! Je remue la queue — je passe mon tour !', 'Snif-snif — c’est par ici !', 'Tu es si près — je vais sauter de joie !', 'Ouaf ! J’ai trouvé !', 'Bravo, ouaf !')
r('Brebis Guimauve', 'Compter les moutons', 'Après ton deuxième coup, elle se met à compter les moutons — elle s’endort et passe son tour.',
  'Bêê, je suis douce comme la guimauve ☁️', 'Un mouton, deux moutons… Zzz…', 'Oh, j’ai presque trouvé !', 'Bêê ! Tu as presque deviné !', 'Fais de beaux rêves — j’ai gagné !', 'Je me suis endormie… bêê.')
r('Glace Cornet', 'Coup de froid', f'Quand tu es « Tiède » ou plus près, ta mémoire gèle : {MEM}. Une fois par manche.',
  'Je suis la plus fraîche du royaume ! 🍦', 'Brrr ! Tu ne te souviens que de deux coups !', 'Je fonds — donc c’est chaud !', 'Oh, je vais fondre !', 'Une victoire glacée ! 🍦', 'Tout a fondu…')
b('La Reine Sucrée', 'Impôt sucré', f'Quand tu chauffes, elle te prend ton {K}. Une fois par manche.',
  'Trésor royal', f'Au quatrième coup de la manche, elle sort de son trésor un {K} pour elle.',
  'Le royaume des bonbons est à moi ! 👑', 'L’impôt ! Ton « ⚡ » va dans mon trésor !', 'Le trésor est plein — un « ⚡ +1 coup » pour moi !',
  'Ma couronne sent la victoire !', 'Oh, quel sujet insolent !', 'La Reine a gagné ! 👑', 'Bon… tu es un gagnant tout sucré !')

# 7 · Arctique glacé
r('Ourson Glaçon', 'Boule de neige', f'Après ton premier coup, il te lance une boule de neige : {LAVA}.',
  'Bataille de boules de neige ? ⛄', 'Attrape ma boule de neige ! Un lancer fou !', 'Bien au chaud comme dans ma tanière !', 'Oh, tu es devant ma tanière !', 'Une victoire toute blanche ! ⛄', 'Tu m’as fait fondre…')
r('Renard Blizzard', 'Traces effacées', f'Quand tu refroidis, il soulève un blizzard : {FOG}. Une fois par manche.',
  'Chut… tu entends le blizzard ? 🌨️', 'Blizzard ! Mes traces ont disparu !', 'Je sens une proie sous la neige !', 'Tu as trouvé mes traces ?!', 'Emportée par le vent — la victoire est à moi !', 'Le blizzard s’est calmé…')
r('Morse Moustache', 'Partie de pêche', f'Quand il refroidit, pas grave — il pêche sous la glace un {K} pour lui. Une fois par manche.',
  'Oh-oh ! Ça mord ! 🎣', 'Pas de poisson — mais j’ai pêché un « ⚡ » !', 'Ça mord de plus en plus !', 'Hé, ne fais pas peur à mes poissons !', 'Quelle prise !', 'Il s’est échappé…')
r('Narval Boussole', 'Corne-boussole', 'Quand il est « Très chaud » ou plus près, sa corne indique si le nombre est plus grand ou plus petit que le sien. Une fois par manche.',
  'Ma corne connaît toujours le chemin 🧭', 'Ma corne indique : c’est {k} !', 'Ma corne picote — c’est chaud !', 'Tu nages droit vers le but !', 'La boussole ne se trompe jamais !', 'Ma corne s’est perdue…')
r('Chouette Flocon', 'Vol silencieux', 'Un coup sur trois de la chouette t’est caché.',
  'Hou… je vole sans bruit 🌙', 'Hou ! Ce coup est silencieux !', 'Je vois une proie dans le noir !', 'Tu m’as repérée ?!', 'Silencieuse et précise ! 🦉', 'Je m’envole dans la tempête…')
r('Renne Grelot', 'Clochette', 'Quand tu es « Tiède » ou plus près, sa clochette sonne : le nombre est plus grand ou plus petit que le tien. Une fois par manche.',
  'Ding-ding ! Salut ! 🔔', 'Ding ! C’est {k} !', 'Ma clochette sonne — c’est chaud !', 'Ding-ding, tu y es presque !', 'La clochette sonne la victoire !', 'Ma clochette s’est tue…')
r('Hermine Givre', 'Givre', 'Quand tu es « Brûlant », elle te couvre de givre : tu gèles et tu passes ton tour. Une fois par manche.',
  'Je suis blanche comme le givre ❄️', 'Gèle ! Te voilà couvert de givre !', 'Je sens la chaleur — je suis tout près !', 'Tu es trop chaud pour l’hiver !', 'Une victoire gelée !', 'Tu as fait fondre mon givre…')
r('Macareux Bec', 'La prise', f'Quand tu refroidis, il attrape un poisson : un {K} pour lui. Une fois par manche.',
  'Je suis un macareux, et je suis malin ! 🐟', 'Tu refroidis — j’ai un poisson ! « ⚡ » pour moi !', 'Le poisson est juste là !', 'Oh, tu plonges plus profond que moi !', 'Un bec plein de victoire !', 'Le poisson s’est enfui…')
r('Husky Tempête', 'Attelage', f'Après son deuxième coup, il accélère : {TWICE}.',
  'Aouh ! En route ! 🛷', 'À toute vitesse ! Prochain coup — deux fois !', 'Je fonce vers le but !', 'Tu cours plus vite que mon traîneau !', 'Premier à l’arrivée ! 🛷', 'Mon attelage est fatigué…')
b('Le Yéti des neiges', 'Tempête de neige', f'Après ton deuxième coup, il soulève une tempête : {FOG}.',
  'Rugissement glacé', 'Quand tu chauffes, il rugit : tu gèles et tu passes ton tour. Une fois par manche.',
  'Qui piétine ma neige ? ❄️', 'TEM-PÊ-ÊTE !', 'GRRR ! Gèle !',
  'Je sens un invité tout chaud !', 'Tu n’as pas peur du froid ?!', 'L’Arctique est à moi ! ❄️', 'Tu es plus chaud que le soleil !')

# 8 · Désert torride
r('Chameau Dune', 'Crachat', f'Quand tu es « Très chaud » ou plus près, il crache : ton {K} disparaît. Une fois par manche.',
  'Je tiens une semaine sans boire ! 🐪', 'Ptou ! Ton « ⚡ » a disparu !', 'L’oasis est tout près !', 'Éloigne-toi de ma bosse !', 'Les dunes sont à moi !', 'Je suis tout desséché…')
r('Fennec Oreilles', 'Fine oreille', 'Après ton deuxième coup, il te chuchote dans quelle moitié est le nombre.',
  'J’entends tout ! 👂', 'Un petit secret : {k}.', 'Je l’entends — tout près !', 'Tu marches droit vers la réponse !', 'Mes oreilles ne m’ont pas trompé !', 'Je n’ai rien entendu…')
r('Suricate Vigie', 'Jumelles', 'Un coup sur deux, il regarde dans ses jumelles et te dit si le nombre est plus grand ou plus petit que le sien.',
  'La vigie est à son poste ! 🔭', 'Dans mes jumelles : c’est {k} !', 'Cible à l’horizon !', 'Alerte ! Tu es tout près !', 'La vigie ne dort jamais !', 'Je ne l’ai pas vu…')
r('Scorpion Piquant', 'Piqûre', f'Quand tu chauffes, il pique avec sa queue : {LAVA}. Une fois par manche.',
  'Je suis petit mais piquant 🦂', 'Pique ! Un lancer fou !', 'Le sable est chaud — je suis tout près !', 'Attention, je pique !', 'En plein dans le mille !', 'Ma queue est retombée…')
r('Gecko Soleil', 'Bain de soleil', 'Quand il est « Tiède » ou plus près, il s’étire au soleil et passe son tour suivant. Une fois par manche.',
  'Le soleil, c’est la vie ! 😎', 'Il fait si bon… je bronze et je passe mon tour.', 'Chaud — comme j’aime !', 'Tu brilles comme le soleil de midi !', 'Une victoire ensoleillée !', 'Le soleil s’est couché…')
r('Tatou Boule', 'Roule-boule', 'Quand il refroidit, il se roule en boule et rejoue tout de suite. Une fois par manche.',
  'Je suis comme une balle ! 🥎', 'Je refroidis ? Je roule — et je rejoue !', 'Je roule droit vers le but !', 'Tu me rattrapes !', 'J’ai roulé jusqu’à la victoire !', 'Je suis tombé dans un trou…')
r('Gerboise Hop', 'À l’opposé', 'Elle saute à l’autre bout : elle dit le nombre « en miroir » du tien — s’il peut encore être le nombre secret.',
  'Hop-hop ! 🔁', 'Hop — à l’autre bout !', 'Encore un saut et je l’ai !', 'Tu sautes mieux que moi !', 'Un bond vers la victoire !', 'J’ai sauté trop loin…')
r('Cactus Épine', 'Épines', 'Si tu es « Tiède » ou plus près, ton coup se cache dans les épines : tu ne le vois pas. Une fois par manche.',
  'Un câlin ? 🌵', 'Aïe ! Ton coup est dans mes épines !', 'Je fleuris — donc c’est tout près !', 'Ne te pique pas — tu as presque trouvé !', 'Une victoire piquante ! 🌵', 'J’ai fané…')
r('Lézard Collerette', 'Collerette effrayante', 'À son premier coup, il ouvre sa collerette et te fait peur : tu passes ton tour.',
  'Regarde, j’ouvre ma collerette ! 😱', 'Bouh ! Peur ? Passe ton tour !', 'Ma collerette frémit — tout près !', 'Je ne te fais pas peur ?!', 'Je t’ai fait peur et j’ai gagné !', 'Ma collerette s’est refermée…')
b('Le Sphinx Pharaon', 'Tempête de sable', f'Après ton troisième coup, il ensevelit les traces sous le sable : {MEM}.',
  'Malédiction de la pyramide', f'Quand tu es « Brûlant », {LAVA}. Une fois par manche.',
  'Résous mon énigme, voyageur 🏺', 'Le sable ensevelit ta mémoire !', 'Malédiction ! Un lancer fou !',
  'Les étoiles du désert sont avec moi !', 'Tu as résolu mon énigme ?!', 'L’énigme reste à moi ! 🏺', 'Tu es plus sage que le Sphinx !')

# 9 · Ferme joyeuse
r('Vache Marguerite', 'Lait frais', f'Si tu es « Froid » ou plus loin, elle t’offre du lait : un {K} pour toi. Une fois par manche.',
  'Meuh ! Salut ! 🥛', 'Froid ? Bois un peu de lait — « ⚡ +1 coup » !', 'Meuh, c’est chaud !', 'Meuh ! Tu as presque trouvé !', 'Meuh ! Victoire !', 'Meuh… bravo !')
r('Porcelet Gadoue', 'Flaque', f'Quand tu refroidis, il saute dans une flaque : splash ! Et {MEM}. Une fois par manche.',
  'Groin ! J’adore les flaques ! 🐽', 'Splash ! Oups, de la boue partout !', 'Groin ! Ça sent la victoire !', 'Groin-groin, pas si près !', 'Groin ! Je suis le meilleur !', 'Groin… quel désordre.')
r('Âne Paille', 'Têtu', 'Il est têtu et passe son troisième coup.',
  'Hi-han ! Rien ne presse 🌾', 'Hi-han ! Je n’avance pas — un point c’est tout !', 'Hi-han ! J’y suis presque !', 'Hi-han ! Tu es rapide !', 'Hi-han ! Victoire !', 'Hi-han… être têtu n’a pas aidé.')
r('Coq Crête', 'Cocorico !', 'À son premier coup, il crie à toute la ferme si le nombre est plus grand ou plus petit que le sien.',
  'Cocorico ! Debout ! 📣', 'Cocorico ! C’est {k} !', 'Ma crête brûle — c’est chaud !', 'Cot-cot ! Tu as presque trouvé !', 'Cocorico — victoire !', 'Je suis tout enroué…')
r('Cane Botte', 'Flaques rondes', 'Elle saute dans les nombres ronds — qui finissent par 0 — tant qu’il reste beaucoup de nombres.',
  'Coin ! Plouf-plouf ! 🎯', 'Coin ! Je saute dans une flaque ronde !', 'Coin-coin, c’est chaud !', 'Coin ! Tu m’as dépassée !', 'Coin ! Victoire !', 'Coin… je suis toute mouillée.')
r('Poney Tresse', 'Galop', f'Quand il est « Très chaud » ou plus près, il part au galop : {TWICE}. Une fois par manche.',
  'Hiii ! Je suis le plus rapide ! 🐎', 'Hiii ! Au galop — deux fois !', 'Au galop vers la victoire !', 'Tu galopes plus vite !', 'Une victoire au galop !', 'Mes sabots sont fatigués…')
r('Colley Berger', 'Rassemblement', 'Quand tu refroidis, il te ramène dans l’enclos : tu passes ton tour. Une fois par manche.',
  'Ouaf ! Je rassemble tout le monde ! 🐕', 'Ouaf ! Dans l’enclos — passe ton tour !', 'Je le sens — tout près !', 'Ouaf ! Tu cours droit vers le but !', 'Tout le monde est dans l’enclos — victoire !', 'Ils se sont tous sauvés…')
r('Dindon Éventail', 'Queue en éventail', 'Son deuxième coup est caché derrière sa queue.',
  'Admire ma queue ! 🎴', 'Frrr ! Ce coup est derrière ma queue !', 'Ma queue s’ouvre — c’est chaud !', 'Tu regardes derrière ma queue ?!', 'Une belle victoire !', 'Ma queue est retombée…')
r('Souris Fromage', 'Grignotage', f'Si tu es « Très froid », elle grignote en douce : un {K} pour elle. Une fois par manche.',
  'Couic ! Le fromage est à moi ! 🧀', 'Couic ! Je grignote — « ⚡ » pour moi !', 'Ça sent le fromage — tout près !', 'Couic ! Tu es devant mon trou !', 'Couic ! Tout le fromage est à moi !', 'Couic… le fromage m’a échappé.')
b('L’Épouvantail', 'Corbeau sur l’épaule', f'Quand tu es « Tiède » ou plus près, son corbeau lui rapporte ton {K}. Une fois par manche.',
  'Tourbillon de paille', f'Quand il refroidit, il tourne comme un tourbillon : {TWICE}. Une fois par manche.',
  'Je garde ce champ ! 🌾', 'Croa ! Le corbeau a pris ton « ⚡ » !', 'Whoosh ! Tourbillon de paille !',
  'La récolte est presque à moi !', 'Tu n’as pas peur d’un épouvantail ?!', 'Le champ est à moi ! 🌾', 'Tu as fait fuir tous mes corbeaux !')

# 10 · Ville des nuages
r('Perroquet Pilote', 'Perroquet bavard', 'Quand tu es « Brûlant », il répète après toi et laisse échapper : le nombre est plus grand ou plus petit que le tien. Une fois par manche.',
  'Bonjour ! Bonjour ! 🦜', 'Brûlant ! Brûlant ! C’est {k} !', 'Cap sur le but ! Cap !', 'Tout près ! Tout près !', 'Atterrissage — victoire !', 'J’ai perdu le cap !')
r('Colibri Nectar', 'Battements d’ailes', 'À son premier coup, il bat des ailes deux fois : il rejoue tout de suite.',
  'Je suis le plus petit et le plus rapide ! 🌺', 'Frrr-frrr — deux coups !', 'Ça sent le nectar — c’est chaud !', 'Tu es plus rapide qu’un colibri ?!', 'Le doux nectar de la victoire !', 'Je m’envole vers les fleurs…')
r('Flamant Fifi', 'Sur une patte', 'Au cinquième coup de la manche, il se met sur une patte et passe son tour suivant.',
  'Je suis le plus gracieux ! 🦩', 'Je tiens sur une patte… je passe mon tour.', 'Oh, comme c’est chaud !', 'Oh ! Tu as presque trouvé !', 'Une victoire gracieuse !', 'Oh… j’ai perdu l’équilibre.')
r('Aiglon Altitude', 'Œil d’aigle', 'À partir de son deuxième coup, il sait si le nombre est pair ou impair. Il ne te le dira pas.',
  'D’en haut, je vois tout ! 🦅', 'D’ici, je sais s’il est pair ou pas !', 'Cible en vue !', 'Tu voles plus haut que moi !', 'Une victoire d’aigle !', 'Un nuage m’a gêné…')
r('Nuage Pouf', 'Petit brouillard', 'Il cache ton troisième coup dans le brouillard : tu ne le vois pas.',
  'Je suis tout doux et moelleux ☁️', 'Pouf ! Ton coup est dans le brouillard !', 'Oh, je vais presque pleuvoir — c’est chaud !', 'Tu vois à travers les nuages ?!', 'Une victoire nuageuse !', 'Je me suis envolé…')
r('Ballon Brise', 'Décollage', 'Quand il chauffe, il décolle et rejoue tout de suite. Une fois par manche.',
  'Vent, emporte-moi ! 🎈', 'Je chauffe ! Je décolle — et je rejoue !', 'Je monte de plus en plus haut !', 'Oh, je me dégonfle !', 'Tout là-haut — victoire !', 'Pssst… dégonflé.')
r('Hirondelle Flèche', 'Une lettre', f'Quand tu refroidis, elle t’apporte une lettre avec un {K}. Une fois par manche.',
  'J’ai une lettre pour toi ! ✉️', 'Ne sois pas triste — voilà un « ⚡ +1 coup » !', 'Je vole droit vers le but !', 'Tu es plus rapide qu’une hirondelle !', 'Je suis arrivée la première !', 'La lettre est arrivée en retard…')
r('Écureuil Planeur', 'Vol plané', 'Quand il refroidit, il plane en douce : ce coup-là t’est caché.',
  'Je vole sans ailes ! 🪂', 'Whoosh — je plane en cachette !', 'Je plane droit sur la cible !', 'Tu me rattrapes !', 'Atterrissage en douceur — victoire !', 'Je me suis accroché à une branche…')
r('Cigogne Facteur', 'Un colis', f'Après ton deuxième coup, elle t’apporte un colis : un {K} pour toi.',
  'Courrier ! Pour qui est le colis ? 📦', 'Un colis pour toi — « ⚡ +1 coup » !', 'J’ai presque trouvé l’adresse !', 'Tu as trouvé l’adresse tout seul ?!', 'Livré — victoire !', 'Le colis est revenu…')
b('Le Roi Tonnerre', 'Coup de tonnerre', 'Quand tu chauffes, il tonne : tu passes ton tour. Une fois par manche.',
  'Averse', 'Le quatrième coup de la manche se cache sous l’averse : tu ne le vois pas.',
  'Le ciel est à moi ! Crains le tonnerre ! 🌩️', 'BRAOUM ! Passe ton tour !', 'Averse ! Ce coup a disparu !',
  'Mes éclairs frappent juste !', 'Tu n’as pas peur de l’orage ?!', 'L’orage a gagné ! 🌩️', 'Les nuages s’écartent… tu brilles !')

# 11 · Jardin fleuri
r('Abeille Butine', 'Miel', f'Quand elle est « Très chaud » ou plus près, elle met du miel de côté : un {K} pour elle. Une fois par manche.',
  'Bzzz ! Salut ! 🐝', 'Bzz ! Du miel — et un « ⚡ +1 coup » pour moi !', 'Ça sent la fleur — c’est chaud !', 'Bzz ! Tu es devant ma ruche !', 'Une victoire toute sucrée ! 🍯', 'Bzz… je m’envole.')
r('Papillon Arc-en-ciel', 'Indice de pollen', 'Quand tu es « Tiède » ou plus près, il te souffle si le nombre est pair ou impair. Une fois par manche.',
  'Je vais colorer ta partie ! 🌈', 'Le pollen chuchote : le nombre est {k} !', 'Je voltige vers la réponse !', 'Tu as failli m’attraper !', 'Une victoire arc-en-ciel !', 'Je m’envole vers une autre fleur…')
r('Chenille Bouquin', 'Fini de lire !', 'À son troisième coup, elle finit de lire l’indice : elle sait dans quelle moitié est le nombre. Elle ne te le dira pas.',
  'Je lis tout ! 📖', 'Fini de lire ! Maintenant, je connais la moitié !', 'Le livre dit — tout près !', 'Tu as lu ce livre, toi aussi ?!', 'Le savoir, c’est le pouvoir !', 'J’aurais dû finir le livre…')
r('Escargot Pâquerette', 'Petits pas', 'Il avance à tout petits pas, près de son nombre précédent. Et il réfléchit longtemps.',
  'Rien ne presse… j’arrive 🐌', 'Un petit pas… encore un petit pas…', 'Lentement mais sûrement — c’est chaud !', 'Tu es rapide… et moi, je suis un escargot !', 'Rien ne sert de courir ! 🐌', 'Je ne suis pas arrivé à temps…')
r('Criquet Violon', 'Mélodie', 'Au troisième coup de la manche, il joue une mélodie-indice : pair ou impair.',
  'Écoute mon violon ! 🎻', 'Tra-la-la ! Le nombre est {k} !', 'La musique monte — tout près !', 'Tu joues toutes les bonnes notes !', 'Un air de victoire !', 'Une corde a cassé…')
r('Libellule Hélice', 'Hélicoptère', 'Quand elle est « Tiède » ou plus près, elle s’envole et rejoue tout de suite. Une fois par manche.',
  'Vrrr ! On s’envole ! 🚁', 'Tiède ! Je décolle — encore un coup !', 'Je vole au-dessus du but !', 'Tu voles plus vite !', 'Atterrissage avec la victoire !', 'Mon hélice est fatiguée…')
r('Fourmi Costaude', 'Étonnée', f'Tu actives ton {K} — la fourmi est si surprise qu’elle passe son tour. Une fois par manche.',
  'Je peux tout soulever ! 💪', 'Oh, un « ⚡ » ! Je suis perdue — je passe mon tour !', 'Je rapporte la victoire à la maison !', 'Tu es plus fort que moi ?!', 'La force, c’est de ne jamais abandonner !', 'C’était lourd…')
r('Bourdon Pompon', 'Partage', f'Quand il chauffe, il partage avec toi : un {K} pour toi. Une fois par manche.',
  'Bzzz ! Soyons amis ! 🌸', 'Je chauffe ! Je partage — tiens, un « ⚡ » !', 'Bzz, la fleur est tout près !', 'Bzz ! Tu as trouvé ma fleur !', 'Une victoire toute douce !', 'Bzz… bravo.')
r('Taupe Arrosoir', 'Tunnel', 'À son troisième coup, elle creuse un tunnel : elle rejoue tout de suite.',
  'Je creuse, je creuse ! 🕳️', 'Un tunnel ! Encore un coup !', 'Ça sent la racine — tout près !', 'Tu creuses plus vite !', 'J’ai creusé jusqu’à la victoire !', 'Tout s’est effondré…')
b('La Reine des abeilles', 'Essaim', f'Quand tu chauffes, un essaim arrive : {FOG}. Une fois par manche.',
  'Piège à miel', 'Quand tu es « Brûlant », tu restes collé dans le miel et tu passes ton tour. Une fois par manche.',
  'Tout le jardin est à mon service ! 🐝', 'Essaim, en avant ! Bzzz !', 'Collé dans le miel ? Passe ton tour !',
  'Le miel de la victoire est tout près !', 'Comme tu voles bravement !', 'Reine du jardin ! 🐝', 'Tu es plus doux que le miel !')

# 12 · Vallée des dinosaures
r('Tricératops Cornes', 'Charge', 'Quand il est « Brûlant », il charge : tu passes ton tour. Une fois par manche.',
  'Trois cornes — trois victoires ! 🦏', 'Chaaarge ! Passe ton tour !', 'Mes cornes sentent le but !', 'Tu n’as pas peur des cornes ?!', 'Une charge jusqu’à la victoire !', 'Mes cornes se sont émoussées…')
r('Stégosaure Pique', 'Piques', f'Tu actives ton {K} — il éclate sur ses piques et disparaît. Une fois par manche.',
  'Attention, je pique ! 🦔', 'Aïe ! Ton « ⚡ » a éclaté sur mes piques !', 'Mes piques frémissent — tout près !', 'Tu évites mes piques !', 'Une victoire hérissée !', 'Mes piques n’ont pas aidé…')
r('Ptérodactyle Plume', 'Piqué', f'Quand tu refroidis, il pique vers le sol : {TWICE}. Une fois par manche.',
  'Je suis le roi du ciel ! 🪶', 'En piqué ! Prochain coup — deux fois !', 'Je vois le but depuis le ciel !', 'Tu voles plus haut que moi ?!', 'Une victoire tombée du ciel !', 'J’ai atterri…')
r('Brachiosaure Long-Cou', 'Long cou', 'Il s’étire : après son troisième coup, il te dit dans quelle moitié est le nombre.',
  'D’ici, je vois tout ! 🦒', 'Je l’ai atteint ! Je vois : {k}.', 'Mon cou s’étire vers la réponse !', 'Tu es monté si haut !', 'Long cou — longue victoire !', 'Je n’ai pas pu l’atteindre…')
r('Ankylosaure Massue', 'Queue-massue', f'Quand tu es « Brûlant », il frappe avec sa massue : ton {K} disparaît. Une fois par manche.',
  'Boum-boum ! Je suis blindé ! 🔨', 'BOUM ! Ton « ⚡ » est écrasé !', 'Ma massue sent le but !', 'Tu as cassé mon armure ?!', 'Une victoire blindée !', 'Mon armure s’est fendue…')
r('Raptor Éclair', 'Rapide', 'Il réfléchit vite et, à son deuxième coup, il rejoue tout de suite.',
  'Je suis le plus rapide ! 💨', 'Zoum ! Encore un coup !', 'Je rattrape la réponse !', 'Tu es aussi rapide que moi !', 'Une victoire éclair !', 'À bout de souffle…')
r('Dino Coquille', 'Éclosion', 'À son deuxième coup, il est encore en train d’éclore — et il le passe.',
  'Toc-toc… j’éclos ! 🥚', 'Crac… j’éclos encore, je passe mon tour !', 'Waouh, j’ai presque trouvé !', 'Tu es grand et malin !', 'Petit mais costaud !', 'Je retourne dans ma coquille…')
r('Parasaure Trompette', 'Trompette', 'Si tu es « Froid » ou plus loin, il sonne de la trompette : le nombre est plus grand ou plus petit que le tien.',
  'Tut-tut ! Écoute ma trompette ! 🎺', 'Tut ! C’est {k} !', 'Ma trompette sonne — c’est tiède !', 'Tut ! Tu y es presque !', 'Une marche de victoire !', 'Ma trompette s’est enrouée…')
r('Plésiosaure Plongeon', 'Plongée', 'Quand il est « Tiède » ou plus près, il plonge : ce coup-là t’est caché. Une fois par manche.',
  'Splash ! Je viens du lac ! 🌊', 'Plongé — le coup est sous l’eau !', 'Ça sent le poisson — tout près !', 'Tu plonges plus profond ?!', 'Une victoire des profondeurs !', 'Remonté bredouille…')
b('Le Roi T-Rex', 'Piétinement', 'Quand il est « Très chaud » ou plus près, il piétine : tu te figes de peur et tu passes ton tour. Une fois par manche.',
  'Pas royal', f'Après son quatrième coup, il fait un pas royal : {TWICE}.',
  'Je suis le roi des dinosaures ! ROAR ! 🦖', 'BOUM-BOUM ! Fige-toi !', 'Un pas royal — deux fois !',
  'Le roi sent sa proie !', 'Tu n’as pas peur du roi ?!', 'La vallée est à moi ! 🦖', 'Tu as battu le roi !')

# 13 · Île aux pirates
r('Mouette Mousse', 'Grande gueule', 'Chaque fois qu’elle refroidit, elle crie si le nombre est plus grand ou plus petit que le sien.',
  'Mousse sur le pont ! ⚓', 'Kia-kia ! C’est {k} !', 'Terre ! La terre est proche !', 'Kia ! Tu as trouvé le trésor ?!', 'Le mousse est un héros !', 'Kiaaa… à la mer.')
r('Carlin Boucanier', 'À l’abordage', f'Quand tu es « Très chaud » ou plus près, il aborde ton navire et te prend ton {K}. Une fois par manche.',
  'Ouaf ! Tout le monde sur le pont ! 🏴‍☠️', 'À l’abordage ! Ton « ⚡ » est à moi !', 'Ça sent le trésor !', 'Ouaf ! Tu es devant mon coffre !', 'Le butin est à moi !', 'Je me rends, capitaine…')
r('Coffre Perle', 'Trésor', f'Quand tu es « Brûlant », il s’ouvre : un {K} pour toi. Une fois par manche.',
  'Je suis plein de trésors ! 💎', 'Crrr-ic ! Un trésor — « ⚡ +1 coup » pour toi !', 'Mes perles tintent — tout près !', 'Tu as trouvé ma clé !', 'Le trésor reste chez moi !', 'Tu as trouvé le trésor !')
r('Étoile Lueur', 'Étoile du berger', 'Au début de la manche, elle te dit si le nombre est pair ou impair.',
  'Je vais te montrer le chemin ! ⭐', 'L’étoile guide : le nombre est {k} !', 'En plein sur le cap !', 'Tu navigues aux étoiles !', 'Une victoire scintillante !', 'Mon étoile s’est éteinte…')
r('Rat Sifflet', 'Sifflet', 'À son troisième coup, il siffle : tu te figes et tu passes ton tour.',
  'Briquez le pont ! 📯', 'Tuuuut ! Fige-toi ! Passe ton tour !', 'Cap sur le trésor !', 'Tu es plus rapide que tout l’équipage !', 'Bonne route — victoire !', 'Mon sifflet est tombé à la mer…')
r('Homard Pince', 'Pince', 'Quand tu chauffes, il attrape ton coup avec sa pince : tu ne le vois pas. Une fois par manche.',
  'Clic-clac ! 🦞', 'Clac ! Ton coup est dans ma pince !', 'Mes pinces sentent le but !', 'Tu t’es faufilé jusqu’à mes pinces !', 'J’ai attrapé la victoire !', 'Mes pinces ont lâché…')
r('Pélican Navigateur', 'La carte', 'Après son deuxième coup, il déroule sa carte : il te dit dans quelle moitié est le nombre.',
  'Le navigateur est à la barre ! 🗺️', 'La carte montre : {k}.', 'Cap droit sur le trésor !', 'Tu as une carte, toi aussi ?!', 'La carte m’a mené à la victoire !', 'Ma carte est mouillée…')
r('Chat Tricorne', 'Butin caché', f'Quand tu refroidis, il traîne ton {K} dans son coffre. Une fois par manche.',
  'Miaou ! Où est le trésor ? 🗝️', 'Ronron ! Ton « ⚡ » va dans mon coffre !', 'Ronron, ça sent le poisson !', 'Miaou ! Tu es devant mon trésor !', 'Ronron ! Le butin est à moi !', 'Miaou… il m’a échappé.')
r('Iguane Canon', 'Bordée', f'Quand il est « Brûlant » — coup de canon : {LAVA}. Une fois par manche.',
  'Canon chargé ! 💥', 'BOUM ! Un lancer fou !', 'Cible dans le viseur !', 'Tu as esquivé le boulet !', 'Un tir parfait !', 'Ma poudre est mouillée…')
b('Le Capitaine Tigre', 'À l’abordage !', f'Quand tu es « Brûlant », il te prend ton {K}. Une fois par manche.',
  'Salve de canons', 'Au cinquième coup de la manche, tous les canons tirent : tu passes ton tour.',
  'Cette île est à moi ! Grrr ! 🏴‍☠️', 'À l’abordage ! Le « ⚡ » est à moi !', 'Feu ! Passe ton tour !',
  'Le trésor est presque à moi !', 'Un pirate courageux !', 'L’île est à moi ! 🐯', 'Tu es le meilleur capitaine !')

# 14 · Village d’Halloween
r('Fantôme Lanterne', 'À travers les murs', 'Quand il est « Très chaud » ou plus près, il passe à travers un mur : ce coup-là t’est caché. Une fois par manche.',
  'Bouh ! N’aie pas peur, je suis gentil 👻', 'Ouuuh ! Ce coup passe à travers le mur !', 'Ma lanterne brille plus fort — tout près !', 'Tu me vois ?!', 'Ouuuh ! Victoire !', 'Je m’efface…')
r('Citrouille Sourire', 'Lanterne-citrouille', 'Après ton deuxième coup, elle s’illumine : le nombre est plus grand ou plus petit que le tien.',
  'Hi-hi ! Je suis une citrouille qui brille ! 🎃', 'Je brille : c’est {k} !', 'Ma bougie brille plus fort !', 'Tu as presque soufflé ma bougie !', 'Une victoire citrouille !', 'Ma bougie s’est éteinte…')
r('Minette Balai', 'Balai volant', 'Quand elle est « Brûlant », elle s’envole sur son balai et rejoue tout de suite. Une fois par manche.',
  'Miaou ! Je fais de la magie 🧹', 'Miaou ! Sur mon balai — encore un coup !', 'La magie marche !', 'Miaou ! Tu fais de la magie, toi aussi ?!', 'Une victoire magique !', 'Mon balai est cassé…')
r('Momie Bandelette', 'Bandelettes', 'Après ton troisième coup, elle t’enroule dans ses bandelettes : tu passes ton tour.',
  'Mmm… je viens de la pyramide 🩹', 'Mmm ! Emballé — passe ton tour !', 'Mmm… c’est tiède…', 'Ne me déballe pas !', 'Mmm ! Victoire !', 'Je me suis déroulée…')
r('Monstre Boulon', 'Décharge', f'À son deuxième coup, il lance une décharge : {LAVA}.',
  'Je suis fait de bric et de broc ! 🔌', 'Bzzzt ! Décharge ! Un lancer fou !', 'Ça fait des étincelles — c’est chaud !', 'Oh, tu m’as mis en court-circuit !', 'Une victoire électrique !', 'Ma batterie est vide…')
r('Araignée Chapeau', 'Toile', 'Si tu es « Tiède » ou plus près, tu t’emmêles dans la toile et tu passes ton tour. Une fois par manche.',
  'Bienvenue dans ma petite toile ! 🕸️', 'Pris dans ma toile ! Passe ton tour !', 'Ma toile tremble — tout près !', 'Tu déchires ma toile !', 'Une victoire élégante !', 'Ma toile s’est déchirée…')
r('Corbeau Croa', 'Croa !', f'Quand tu refroidis, il croasse dans ton oreille : {LAVA}. Une fois par manche.',
  'Croa ! Je suis le roi de la nuit ! 😵', 'CROA ! Un lancer fou !', 'Croa ! Tout près !', 'Croa-croa ! Tu as presque trouvé !', 'Croa — victoire !', 'Croa… je m’envole.')
r('Louveteau Hurlou', 'Pleine lune', f'Au sixième coup de la manche, la lune se lève : {TWICE}.',
  'Aouuh ! La lune arrive ! 🌕', 'Pleine lune ! Aouuh ! Deux coups !', 'Mon nez sent le but !', 'Tu hurles mieux que moi !', 'Aouuh ! Victoire !', 'La lune s’est cachée…')
r('Chaudron Bulle', 'Ça déborde', 'Quand il chauffe, le chaudron bouillonne et t’éclabousse : tu passes ton tour. Une fois par manche.',
  'Blop-blop ! Je prépare une potion ! 🫧', 'Blop-blop-blop ! Splash — passe ton tour !', 'La potion est presque prête !', 'Tu as lu ma recette ?!', 'La potion de la victoire est prête !', 'La potion a brûlé…')
b('Le Comte Crocs', 'Nuée de chauves-souris', f'Quand il est « Brûlant », il lâche ses chauves-souris : {FOG}. Une fois par manche.',
  'Croc', f'Quand tu chauffes, il croque ton {K} : il disparaît. Une fois par manche.',
  'Bienvenue dans mon château… 🦇', 'Volez, mes chauves-souris !', 'Crac ! Ton « ⚡ » a disparu !',
  'Je sens… quelque chose de chaud !', 'Comment as-tu trouvé mon château ?!', 'La nuit est à moi ! 🦇', 'L’aube… j’ai perdu.')

# 15 · Château royal
r('Prince Grenouille', 'Prince gentil', 'Si tu es « Très froid », il a pitié de toi : tu rejoues tout de suite. Une fois par manche.',
  'Coâ ! Je suis un prince enchanté 🐸', 'Coâ ! Ne sois pas triste — rejoue !', 'Coâ ! Ma couronne sent le but !', 'Coâ ! Tu as presque rompu le sort !', 'Coâ — une victoire royale !', 'Coâ… on rejoue ?')
r('Corgi Princesse', 'Ordre royal', 'Après ton premier coup, elle t’ordonne d’attendre : tu passes ton tour suivant.',
  'Ouaf ! Salue la princesse ! 📜', 'Je l’ordonne : passe ton tour !', 'La princesse sent la victoire !', 'Tu es un sujet courageux !', 'Victoire pour la princesse !', 'Bon, tu as mérité une récompense !')
r('Furet Bouffon', 'Fou rire', f'Au troisième coup de la manche, il te fait tellement rire que {LAVA}.',
  'Hi-hi ! Je vais te faire rire ! 🃏', 'Ha-ha ! Mort de rire — un lancer fou !', 'Hi-hi, c’est chaud !', 'Tu ne ris pas ?!', 'Le bouffon gagne — ça, c’est drôle !', 'Ha… la blague est tombée à plat.')
r('Cygne Ballerine', 'Pirouette', 'Quand elle chauffe, elle fait une pirouette : ce coup-là t’est caché. Une fois par manche.',
  'Je danse mieux que tout le monde ! 🩰', 'Une pirouette — et le coup a disparu !', 'La danse mène au but !', 'Tu danses aussi légèrement que moi !', 'Une danse de victoire !', 'J’ai trébuché…')
r('Paon Héraut', 'Le héraut', 'À son premier coup, il annonce à tout le château dans quelle moitié est le nombre.',
  'Oyez, oyez ! 🦚', 'Oyez : {k} !', 'Je sonne la victoire !', 'Tu es plus fort que le héraut !', 'Je proclame la victoire !', 'Plus un son…')
r('Griffon Doré', 'Serres', f'Quand il chauffe, il emporte ton {K} dans ses serres. Une fois par manche.',
  'Je suis un griffon — fort et rapide ! 🦅', 'Je chauffe ! Ton « ⚡ » est dans mes serres !', 'Mes ailes me portent vers le but !', 'Tu es plus courageux qu’un lion !', 'Une victoire de griffon !', 'Je m’envole vers les montagnes…')
r('Beagle Mousquetaire', 'Touché !', f'Quand il est « Très chaud » ou plus près, il attaque à l’épée : ton {K} disparaît. Une fois par manche.',
  'Un pour tous ! 🤺', 'Touché ! Ton « ⚡ » a disparu !', 'Mon épée sent le but !', 'En garde !', 'Pour le roi — victoire !', 'Touché… tu as gagné.')
r('Le Cavalier d’échecs', 'Les blancs commencent', 'Il joue toujours en premier et, à son deuxième coup, il te dit si le nombre est pair ou impair.',
  'Échec ! Je me déplace en L ♞', 'Coup du cavalier : le nombre est {k} !', 'Échec — c’est chaud !', 'Tu joues comme un grand maître !', 'Échec et mat ! Victoire !', 'J’abandonne…')
r('Troll Pont', 'Péage du pont', f'Après ton deuxième coup, il fait payer le pont : ton {K} est pour lui.',
  'Tu veux passer mon pont ? Paie ! 🌉', 'Péage ! Le « ⚡ » est à moi !', 'Le troll sent la victoire !', 'Tu es plus malin qu’un troll !', 'Le pont est à moi !', 'Passe… tu as gagné.')
b('Le Roi Lion', 'Rugissement royal', f'Quand tu es « Brûlant », il rugit si fort que, {MEM}. Une fois par manche.',
  'La couronne', f'Quand il est « Tiède » ou plus près, {TWICE}. Une fois par manche.',
  'Je suis le roi de ce château ! 🦁', 'R-R-ROAR ! Tout oublié ?', 'Ma couronne brille — deux coups !',
  'Le royaume est presque à moi !', 'Tu es plus courageux que tous mes chevaliers !', 'Vive le roi ! 🦁', 'Tu es digne de la couronne !')

assert len(H) == 100, len(H)
