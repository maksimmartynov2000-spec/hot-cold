WORLDS = ['Nouvelle-Zélande', 'Amazonie', 'École de magie', 'Cité des super-héros', 'Trône du Temps']
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

# 46 · Nouvelle-Zélande
r('Kiwi Pelote', 'Bec sensible', 'Quand tu es « Très chaud » ou plus près, il renifle le sol du bout du bec et te dit dans quelle moitié est le nombre. Une fois par manche.',
  'Mes narines sont au bout de mon bec ! 🥝', 'Snif, snif ! Indice : {k} !', 'Je sens la réponse sous les feuilles !', 'Tu as trouvé mon sentier !', 'Victoire de kiwi !', 'Je repars dans la forêt de nuit…')
r('Kéa Chenapan', 'Farce', f'À son deuxième coup, il te chipe ton {K} : il est à lui maintenant.',
  'Hi-hi ! Je suis le perroquet le plus effronté des montagnes ! 🦜', 'Chipé ! Ton « ⚡ » est à moi !', 'Je fais des bêtises juste à côté de la réponse !', 'Tu m’as attrapé ?!', 'Une victoire de chenapan !', 'Je m’envole vers la montagne…')
r('Kakapo Câlin', 'Câlin', f'Si tu es « Très froid », il te fait un câlin : un {K} pour toi et un pour lui. Une fois par manche.',
  'Je ne sais pas voler — mais je fais de super câlins ! 🤗', 'Câlin ! Un « ⚡ +1 coup » pour chacun !', 'Je me dandine vers la réponse !', 'Tu me rattrapes !', 'Une victoire toute douce !', 'Je vais faire un câlin à un arbre…')
r('Pukeko Marais', 'Coup d’œil', 'Quand tu chauffes, il jette un coup d’œil et apprend si le nombre est pair ou impair. Il ne te le dit pas. Une fois par manche.',
  'Mes plumes sont bleues comme la mer ! 🐦', 'J’ai jeté un œil… maintenant j’en sais plus.', 'Je saute de touffe en touffe vers la réponse !', 'Tu regardes aussi ?!', 'Une victoire du marais !', 'Je me cache dans les roseaux…')
r('Wéta Colosse', 'Sous la bûche', 'Quand elle est « Froid » ou plus loin, elle se cache sous une bûche et passe son tour. Une fois par manche.',
  'Je suis énorme, mais très gentille ! 🦗', 'Sous la bûche… je passe mon tour.', 'Je rampe vers la réponse !', 'Je ne t’ai pas fait peur ?!', 'Une victoire géante !', 'Je retourne sous ma bûche…')
r('Takahé Indigo', 'Herbe tendre', f'Après ton troisième coup, il grignote de l’herbe tendre — et prend un {K} pour lui.',
  'Tout le monde me croyait disparu, mais me voilà ! 🌾', 'Miam, miam ! Un « ⚡ +1 coup » pour moi !', 'Je traverse l’herbe vers la réponse !', 'Tu as trouvé mon pré !', 'Une victoire bleue !', 'Je vais brouter un peu…')
r('Tui Imitateur', 'Chanson en écho', 'Après ton deuxième coup, il chante ton coup en écho et te dit : le nombre est plus grand ou plus petit que le tien.',
  'Je chante avec deux voix à la fois ! 🎶', 'Je chante : le nombre est {k} !', 'La chanson mène à la réponse !', 'Tu m’imites ?!', 'Un chant de victoire !', 'Ma voix s’est cassée…')
r('Otarie Plagiste', 'Bain de soleil', 'Au début de la manche, il bronze sur un rocher et passe son premier tour.',
  'Du soleil, des rochers, la mer — que demander de plus ? 🏖️', 'Je bronze… je passe mon tour.', 'Je nage vers la réponse !', 'Tu bronzes à côté de moi ?!', 'Une victoire à la plage !', 'Je pars me baigner…')
r('Rhipidure Virevolte', 'Virevolte', 'Après ton troisième coup, elle virevolte et cache ton coup : tu ne le vois pas.',
  'Frrr, frrr ! Ma queue est un éventail ! 🍃', 'Frrr ! Tu ne vois pas ton coup !', 'Je virevolte autour de la réponse !', 'Tu n’arrives pas à me suivre !', 'Une victoire en plein vol !', 'Envolée…')
b('Le Grand Tuatara', 'Troisième œil', 'Dès le début de la manche, il voit avec son troisième œil si le nombre est pair ou impair. Il ne te le dit pas.',
  'Conseil ancien', 'Quand il est « Froid » ou plus loin, il te donne un conseil : le nombre est plus grand ou plus petit que le sien. Une fois par manche.',
  'Je suis plus vieux que les dinosaures ! 👑', 'Le troisième œil voit : j’en sais plus.', 'Conseil ancien : le nombre est {k} !',
  'Le temps me mène à la réponse !', 'Tu es sage comme un reptile ancien !', 'Une victoire ancienne ! 👑', 'Je te confie ces îles…')

# 47 · Amazonie
r('Anguille électrique Volt', 'Décharge', f'Si tu es « Très froid », il te donne une décharge : ton {K} grille. Une fois par manche.',
  'Bzzz ! Je suis une pile vivante ! 🔌', 'Bzzz ! Ton « ⚡ » a grillé !', 'J’étincelle de joie !', 'L’électricité ne te fait pas peur ?!', 'Une victoire chargée !', 'Ma pile est à plat…')
r('Inia Rosine', 'Écho de la rivière', 'Quand elle est « Brûlant », elle écoute l’écho de la rivière et apprend dans quelle moitié est le nombre. Elle ne te le dit pas. Une fois par manche.',
  'Je suis un dauphin de rivière tout rose ! 🐬', 'L’écho a répondu… j’en sais plus.', 'Je nage droit vers la réponse !', 'Tu nages comme un dauphin !', 'Une victoire rose !', 'Je descends la rivière…')
r('Piranha Quenotte', 'Clac', f'Quand elle refroidit, elle claque ses petites dents : ton {K} disparaît. Une fois par manche.',
  'Je suis un piranha souriant, promis ! 🐟', 'Clac ! Ton « ⚡ » a disparu !', 'Je nage vers la réponse avec mon banc !', 'Je ne te fais pas peur ?!', 'Clac — victoire !', 'Je file dans les algues…')
r('Hoazin Punk', 'Parfum de la jungle', f'Quand il est « Très chaud » ou plus près, il sent si fort que la tête te tourne : {MEM}. Une fois par manche.',
  'Je suis l’oiseau le plus bizarre d’Amazonie ! 😵', 'Pouah ! Tu ne te souviens que de deux coups !', 'Ma crête tremble — c’est tout près !', 'Tu te bouches le nez ?!', 'Une victoire punk !', 'Tout ébouriffé…')
r('Dendrobate Turquoise', 'Couleurs vives', f'À son deuxième coup, il fait briller ses couleurs vives : {BLIND}.',
  'Je suis minuscule, mais très voyant ! 🐸', 'Flash ! Tu ne vois plus tes coups !', 'Je saute vers la réponse !', 'Ça ne t’a pas ébloui ?!', 'Une victoire éclatante !', 'Je me cache sous une feuille…')
r('Harpie Regard', 'Regard de la harpie', 'Quand elle est « Très froid », elle te fixe si fort que tu gèles et tu passes ton tour. Une fois par manche.',
  'Mes yeux voient toute la jungle ! 🦅', 'Gèle ! Passe ton tour !', 'Je vois la réponse du haut des arbres !', 'Tu as soutenu mon regard ?!', 'Une victoire d’en haut !', 'Je retourne sur mon kapokier…')
r('Tamarin Moustachu', 'Espièglerie', 'Après ton deuxième coup, il échange les « ⚡ +1 coup » avec toi : les tiens à lui, les siens à toi.',
  'Tu as vu ma moustache ? Digne d’un empereur ! 🔀', 'On échange les « ⚡ » ! Hi-hi !', 'Ma moustache flaire la réponse !', 'Tu es plus malin que moi ?!', 'Une victoire moustachue !', 'Je file par les branches…')
r('Agouti Noisette', 'Noisette de réserve', f'Après ton quatrième coup, il déterre une noisette cachée — et prend un {K} pour lui.',
  'Je plante des arbres en cachant des noisettes ! 🌰', 'Une noisette ! Un « ⚡ +1 coup » pour moi !', 'Je cours vers la réponse !', 'Tu as trouvé ma cachette ?!', 'Une victoire croquante !', 'J’ai perdu ma noisette…')
r('Morpho Azur', 'Reflet bleu', f'Quand elle chauffe, ses ailes scintillent : {FOG}. Une fois par manche.',
  'Mes ailes brillent comme le ciel ! 🦋', 'Reflet ! Tu ne vois plus mes coups !', 'Je volette vers la réponse !', 'Tu vois à travers le reflet ?!', 'Une victoire bleue !', 'Je m’envole…')
b('La Reine Anaconda', 'Anneaux', 'Après ton troisième coup, elle t’enserre dans ses anneaux : tu gèles et tu passes ton tour.',
  'Tribut de la jungle', f'Au début de la manche, elle prend ton {K} pour elle.',
  'Je suis la reine du grand fleuve ! 👑', 'Enserré ! Gèle — passe ton tour !', 'Le tribut — ton « ⚡ » est à moi !',
  'La réponse est déjà dans mes anneaux !', 'Tu t’es bien faufilé !', 'La reine gagne ! 👑', 'Je plonge dans les profondeurs…')

# 48 · École de magie
r('Hibou Enveloppe', 'Lettre', 'Après ton quatrième coup, il apporte une lettre : dans quelle moitié est le nombre.',
  'Hou-hou ! Du courrier pour les élèves ! ✉️', 'La lettre dit : {k} !', 'La lettre vole vers la réponse !', 'Tu as lu ma lettre ?!', 'Lettre livrée — victoire !', 'La lettre s’est perdue…')
r('Crapaud Bulle', 'Potion', f'Après ton quatrième coup, la potion éclabousse : {LAVA}.',
  'Croâ ! Je prépare des potions ! 🧪', 'Splash ! Ton coup est parti n’importe où !', 'La potion est presque prête !', 'Tu fais des potions aussi ?!', 'Une victoire magique !', 'La potion s’est évaporée…')
r('Apprentie Rune', 'Sortilège', 'Après ton troisième coup, elle lance un sort et apprend dans quelle moitié est le nombre. Elle ne te le dit pas.',
  'Je suis la meilleure élève de l’école ! 🪄', 'Le sort a marché… j’en sais plus.', 'La magie mène à la réponse !', 'Tu lances des sorts aussi ?!', 'La première de la classe gagne !', 'Le sort a raté…')
r('Apprenti Parchemin', 'Parchemin', 'À son quatrième coup, il lit un parchemin à voix haute : le nombre est pair ou impair.',
  'J’ai lu tous les parchemins de la bibliothèque ! 📜', 'Le parchemin dit : le nombre est {k} !', 'Le parchemin mène à la réponse !', 'Tu lis mon parchemin ?!', 'Une victoire savante !', 'Le parchemin s’est enroulé…')
r('Chat Mystique', 'Ombres', 'Quand il est « Froid » ou plus loin, il cache son coup dans l’ombre : tu ne le vois pas. Une fois par manche.',
  'Ronron… Je suis le chat d’un sorcier 🐈', 'Ronron ! Ce coup est dans l’ombre !', 'Je ronronne près de la réponse !', 'Tu vois dans l’ombre ?!', 'Une victoire ronronnante !', 'Disparu dans l’ombre…')
r('Hippogriffe Ouragan', 'Coup d’ailes', 'À son troisième coup, il bat des ailes : au tour suivant, il joue deux fois de suite.',
  'Moitié aigle, moitié cheval ! 🌪️', 'Coup d’ailes ! Deux coups de suite !', 'Je vole vers la réponse !', 'Tu voles avec moi ?!', 'Une victoire en ouragan !', 'Je replie mes ailes…')
r('Pixie Malice', 'Farce', 'Au troisième coup de la manche, elle fait une farce : elle échange les « ⚡ +1 coup » avec toi — les tiens à elle, les siens à toi.',
  'Hi-hi ! J’adore les farces ! 🔀', 'Farce ! On a échangé les « ⚡ » !', 'Je fais des farces tout près de la réponse !', 'Tu m’as attrapée ?!', 'Une victoire malicieuse !', 'Je m’envole…')
r('Lapin Abracadabra', 'Abracadabra', 'Au deuxième coup de la manche — abracadabra : celui qui vient de jouer rejoue.',
  'Abracadabra ! Me voilà ! 🎩', 'Abracadabra ! Encore un coup !', 'Le tour a presque marché !', 'Tu as compris mon tour ?!', 'Une victoire magique !', 'Pouf — disparu…')
r('Hérisson Sauge', 'Tisane', f'Quand il est « Brûlant », il prépare une tisane : un {K} pour toi. Une fois par manche.',
  'Je cueille des herbes magiques ! 🍵', 'La tisane est prête ! Prends un « ⚡ +1 coup » !', 'Les herbes mènent à la réponse !', 'Tu connais les herbes ?!', 'Une victoire qui fait du bien !', 'La tisane a refroidi…')
b('L’Archimage Barbe-Grise', 'Envoûtement', f'Si tu es « Froid » ou plus loin, il te jette un sort : {BLIND}. Une fois par manche.',
  'Savoir des étoiles', 'À son premier coup, il lit dans les étoiles et apprend si le nombre est divisible par 3. Il ne te le dit pas.',
  'Bienvenue à l’École de magie ! 👑', 'Envoûté ! Tu ne vois plus tes coups !', 'Les étoiles m’en ont dit plus…',
  'La magie me mène à la réponse !', 'Tu es un puissant magicien !', 'L’archimage gagne ! 👑', 'Je te tire mon chapeau — tu as gagné…')

# 49 · Cité des super-héros
r('Faucon pèlerin Piqué', 'Piqué', 'Un coup sur quatre des siens, il pique : au tour suivant, il joue deux fois de suite.',
  'Je suis l’oiseau le plus rapide de la planète ! 💨', 'Piqué ! Deux coups de suite !', 'Je pique sur la réponse !', 'Tu es plus rapide que moi ?!', 'Une victoire supersonique !', 'J’ai raté mon piqué…')
r('Scarabée hercule Titan', 'Rocher', 'À son deuxième coup, il soulève un rocher : tu gèles et tu passes ton tour.',
  'Je soulève cent fois mon poids ! 🪨', 'Rocher ! Gèle — passe ton tour !', 'La force mène à la réponse !', 'Tu es plus fort que tu n’en as l’air !', 'Une victoire de titan !', 'Le rocher était trop lourd…')
r('Grenouille de verre Invisible', 'Invisibilité', f'Après ton troisième coup, elle devient invisible : {FOG}.',
  'On voit à travers moi ! 👻', 'Invisible ! Tu ne vois plus mes coups !', 'Je saute vers la réponse sans qu’on me voie !', 'Tu me vois ?!', 'Une victoire invisible !', 'On m’a repérée…')
r('Crevette-mante Uppercut', 'Super-coup de poing', 'À son quatrième coup, elle place un super-coup de poing : tu passes ton tour.',
  'Mon coup de poing est plus rapide qu’une balle ! 🥊', 'Bam ! Passe ton tour !', 'Un coup en plein dans le mille !', 'Tu as esquivé ?!', 'Une victoire fracassante !', 'Fatiguée de me battre…')
r('Ratel Intrépide', 'Sans peur', f'Quand il est « Très froid », il te prend ton {K} sans aucune peur. Une fois par manche. Tes bonus « Gel » et « Lancer fou » ne marchent pas sur lui.',
  'Je n’ai peur de rien ! 🦡', 'Sans peur ! Ton « ⚡ » est à moi !', 'Je fonce droit sur la réponse !', 'Tu n’as peur de rien non plus ?!', 'Une victoire intrépide !', 'Bon… cette fois, tu as gagné.')
r('Poisson-archer Sniper', 'Jet précis', f'Au quatrième coup de la manche, elle abat ton {K} d’un jet d’eau.',
  'J’abats une mouche en plein vol avec de l’eau ! 🎯', 'Pssht ! Ton « ⚡ » est abattu !', 'Je vise la réponse !', 'Tu as esquivé mon jet ?!', 'Une victoire de tireuse d’élite !', 'Raté…')
r('Ornithorynque Capteur', 'Électrosens', 'Si tu es « Froid » ou plus loin, il capte l’électricité et apprend : le nombre est plus grand ou plus petit que le tien. Il ne te le dit pas. Une fois par manche.',
  'Mon bec capte l’électricité ! 📡', 'Le radar a capté… j’en sais plus.', 'Le radar bipe — c’est tout près !', 'Tu brouilles mon radar ?!', 'Une victoire sensationnelle !', 'Mon radar est cassé…')
r('Musaraigne Turbo', 'Turbo', 'Au sixième coup de la manche, le turbo s’enclenche : celui qui vient de jouer rejoue.',
  'Mon cœur bat mille fois par minute ! 🏎️', 'Turbo ! Encore un coup !', 'Je fonce vers la réponse !', 'Tu arrives à me suivre ?!', 'Une victoire turbo !', 'Panne d’essence…')
r('Oiseau-lyre Sirène', 'Sirène', f'Quand il refroidit, il imite une sirène : {LAVA}. Une fois par manche.',
  'Je sais imiter n’importe quel son ! 🎙️', 'Pin-pon, pin-pon ! Ton coup est parti n’importe où !', 'Je chante vers la réponse !', 'Tu chantes mieux que moi ?!', 'Une imitation de victoire !', 'J’ai perdu ma voix…')
b('Docteur Chaos', 'Rayon du chaos', f'Tu as activé ton {K} — le Chaos s’en mêle : {LAVA}. Une fois par manche.',
  'Éblouisseur', f'Au cinquième coup de la manche, il allume son éblouisseur : {BLIND}.',
  'Ha-ha ! Je suis un méchant… mais un mignon ! 👑', 'Rayon du chaos ! Ton coup est parti n’importe où !', 'Éblouisseur ! Tu ne vois plus tes coups !',
  'Mon plan va marcher !', 'Tu as déjoué mon plan ?!', 'Le chaos gagne ! 👑', 'Je me rends, héros…')

# 50 · Trône du Temps
r('Dodo Trébuche', 'Trébuchement', 'Quand tu es « Brûlant », il trébuche de surprise et passe son tour. Une fois par manche.',
  'Je suis un dodo, pas un dinosaure ! 🦤', 'Oups ! J’ai trébuché — je passe mon tour.', 'Je trotte vers la réponse !', 'Tu me rattrapes ?!', 'Une victoire de dodo !', 'J’ai trébuché…')
r('Moa Échasses', 'Voir loin', 'À son quatrième coup, elle regarde par-dessus les arbres et apprend dans quelle moitié est le nombre. Elle ne te le dit pas.',
  'Je suis plus grande qu’une girafe ! 🔭', 'Je vois loin… j’en sais plus.', 'J’avance à grands pas vers la réponse !', 'Tu es grand, toi aussi !', 'Une victoire de géante !', 'Mes jambes sont fatiguées…')
r('Thylacine Tasman', 'Disparition', 'Si tu es « Très froid », il disparaît avec ton coup : tu ne le vois pas. Une fois par manche.',
  'Personne ne m’a vu depuis longtemps ! 🐺', 'Disparu ! Tu ne vois pas ton coup !', 'Je me faufile vers la réponse !', 'Tu me vois ?!', 'Une victoire rayée !', 'Je disparais encore…')
r('Trilobite Cambrien', 'Pas ancien', 'Un coup sur deux des siens, il est trop lent et passe.',
  'J’ai cinq cents millions d’années ! 🪲', 'Trop lent… je passe mon tour.', 'Je rampe vers la réponse depuis des siècles !', 'Tu es plus rapide que les temps anciens !', 'Une victoire ancienne !', 'Je vais devenir un fossile…')
r('Rhytine de Steller Varech', 'Algues', f'À son deuxième coup, elle partage des algues : un {K} pour toi.',
  'Je suis énorme et très gentille ! 🐄', 'Prends des algues — et un « ⚡ +1 coup » !', 'Je nage vers la réponse !', 'Tu nages à côté de moi !', 'Une victoire gentille !', 'Je repars dans la mer froide…')
r('Grand Pingouin Queue-de-pie', 'Révérence', 'Après ton deuxième coup, elle fait une révérence polie et te dit le dernier chiffre du nombre.',
  'Je porte une queue-de-pie toute ma vie ! 🐧', 'Avec une révérence : {k} !', 'Je marche vers la réponse en queue-de-pie !', 'Tu es aussi poli que moi ?!', 'Une victoire élégante !', 'Je prends congé…')
r('Aigle de Haast Envergure', 'Ombre des ailes', 'À son troisième coup, il te couvre de l’ombre de ses ailes : tu gèles et tu passes ton tour.',
  'Mes ailes sont plus larges qu’une voiture ! 🦅', 'L’ombre ! Gèle — passe ton tour !', 'Je vole vers la réponse !', 'L’ombre ne te fait pas peur ?!', 'Une victoire à grande envergure !', 'Je m’envole vers le passé…')
r('Quagga Demi-Zèbre', 'À mi-chemin', 'Au début de la manche, elle te dit dans quelle moitié est le nombre.',
  'Je suis un demi-zèbre ! 🦓', 'À mi-chemin : {k} !', 'Je galope vers la réponse !', 'Tu as trouvé ta moitié !', 'Une victoire rayée !', 'Je galope vers le passé…')
r('Ammonite Jurassique', 'Spirale du temps', f'Après ton deuxième coup, il enroule le temps en spirale : {MEM}.',
  'J’habite une coquille en spirale ! 🐚', 'Spirale ! Tu ne te souviens que de deux coups !', 'La spirale mène à la réponse !', 'Tu es sorti de la spirale ?!', 'Une victoire en spirale !', 'Ma coquille est vide…')
b('Le Seigneur Chronos', 'Temps arrêté', 'Au début de la manche, il arrête le temps : tu gèles et tu passes ton tour.',
  'Regard à travers le temps', 'Quand il est « Très chaud » ou plus près, il regarde à travers le temps et apprend le dernier chiffre du nombre. Il ne te le dit pas. Une fois par manche.',
  'Je garde le temps du monde entier ! 👑', 'Temps arrêté ! Passe ton tour !', 'Je vois l’avenir… et j’en sais plus.',
  'Le temps est de mon côté !', 'Tu as devancé le temps !', 'Le temps gagne ! 👑', 'Ton heure est venue — tu as gagné…')
