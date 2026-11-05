WORLDS = ['Stade des champions', 'Quartier des détectives', 'Galápagos', 'Far West', 'Pays des yokai',
          'Îles d’Indonésie', 'Académie des savants', 'Temple perdu', 'Grande steppe', 'Asgard']
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

# 36 · Stade des champions
r('Lévrier Élan', 'Sprint', 'Quand elle est « Froid » ou plus loin, elle sprinte : elle rejoue tout de suite. Une fois par manche.',
  'À vos marques, prêts… partez ! 🏃', 'Sprint ! Je rejoue !', 'La dernière ligne droite !', 'Tu cours plus vite que moi ?!', 'Première à l’arrivée !', 'J’ai abandonné la course…')
r('Kangourou Crochet', 'Crochet', 'Après ton quatrième coup, il place un crochet : tu es au tapis et tu passes ton tour.',
  'On boxe à la loyale ! 🥊', 'Crochet ! Au tapis — passe ton tour !', 'Je suis en pleine forme !', 'Tu encaisses bien !', 'K.-O. — victoire !', 'Je raccroche les gants…')
r('Loutre Brasse', 'Bouffée d’air', f'À son quatrième coup, elle remonte respirer — et prend un {K} pour elle.',
  'Personne ne nage la brasse comme moi ! 🏊', 'J’inspire ! Un « ⚡ +1 coup » pour moi !', 'Je vois le mur d’arrivée !', 'On est au coude à coude !', 'L’or à la piscine !', 'J’ai bu la tasse…')
r('Éléphant de mer Haltère', 'Pause', 'Quand il chauffe, il soulève l’haltère et se repose : il passe son tour. Une fois par manche.',
  'Je suis le plus fort de la plage ! 🏋️', 'Ouf… charge soulevée. Je me repose — je passe.', 'Un poids record — et je suis tout près !', 'Tu es plus fort que tu n’en as l’air !', 'Record du monde !', 'L’haltère a gagné…')
r('Castor Palet', 'Lancer frappé', f'Quand il est « Brûlant », il tire le palet : ton {K} est envoyé au loin. Une fois par manche.',
  'Allez, on marque ! 🏒', 'Lancer frappé ! Ton « ⚡ » s’envole !', 'Échappée !', 'Tu bloques mes tirs !', 'But ! Victoire !', 'Sur le poteau…')
r('Zibeline Pirouette', 'Pirouette', 'Le sixième coup de la manche disparaît dans une pirouette : on ne le voit pas.',
  'Regarde-moi tourner ! ⛸️', 'Pirouette ! Ce coup est invisible !', 'Un programme parfait !', 'Tu patines aussi bien que moi !', 'Note maximale !', 'Je suis tombée sur la glace…')
r('Chimpanzé Salto', 'Salto', 'Quand tu es « Tiède » ou plus près, il fait un salto : au tour suivant, il joue deux fois de suite. Une fois par manche.',
  'Hou-hou ! Regarde ce salto ! 🤸', 'Salto ! Deux coups de suite !', 'J’atterris pile sur la cible !', 'Tu es gymnaste aussi ?!', 'Réception parfaite !', 'Tombé des anneaux…')
r('Impala Marathon', 'Ravitaillement', f'À son troisième coup, elle te tend de l’eau au ravitaillement : un {K} pour toi.',
  'Un marathon, c’est long ! 🥤', 'Ravitaillement ! Prends un « ⚡ +1 coup » !', 'Deuxième souffle !', 'Tu me rattrapes !', 'Marathon terminé !', 'J’ai abandonné au 30e kilomètre…')
r('Okapi Dunk', 'Passe', f'Quand il est « Tiède » ou plus près, il te fait une passe : un {K}. Une fois par manche.',
  'Moitié girafe, moitié zèbre — et tout basketteur ! 🏀', 'Passe ! Attrape un « ⚡ +1 coup » !', 'Je tente le dunk !', 'Belle défense !', 'Dunk ! Victoire !', 'Raté le panier…')
b('Le Grizzly Champion', 'Rugissement du champion', 'À son quatrième coup, il rugit si fort que tu gèles et tu passes ton tour.',
  'Médaille d’or', f'Au cinquième coup de la manche, il prend ton {K} pour lui.',
  'Je suis le champion de tous les stades ! 👑', 'GRAOU ! Gèle — passe ton tour !', 'La médaille est à moi — et ton « ⚡ » aussi !',
  'Le record est tout proche !', 'Tu es un adversaire digne !', 'Le champion gagne encore ! 👑', 'Je te remets la coupe…')

# 37 · Quartier des détectives
r('Basset Pisteur', 'Sur la piste', 'Si tu es « Très froid », il flaire la piste et te dit dans quelle moitié est le nombre. Une fois par manche.',
  'Mon flair ne me trompe jamais ! 🔎', 'Snif, snif ! Indice : {k} !', 'La piste mène droit à la réponse !', 'Tu suis ma piste !', 'Affaire résolue !', 'La piste s’est refroidie…')
r('Bouledogue Inspecteur', 'Rapport', 'À son quatrième coup, il te fait son rapport : le nombre est plus grand ou plus petit que le sien.',
  'Inspecteur en service ! 📋', 'Rapport : le nombre est {k} !', 'Le suspect est presque coincé !', 'Tu mènes ta propre enquête ?!', 'Affaire classée !', 'Les preuves ne collent pas…')
r('Pie Indice', 'Indice brillant', 'Au troisième coup de la manche, elle rapporte un indice : le dernier chiffre du nombre.',
  'Tout ce qui brille est un indice ! 🔑', 'J’ai trouvé un indice : {k} !', 'Les indices mènent à la réponse !', 'Tu collectionnes les indices aussi ?!', 'L’indice a marché !', 'J’ai perdu l’indice…')
r('Chat siamois Chiffre', 'Décodage', 'Après ton deuxième coup, il décode si le nombre est divisible par 3. Il ne te le dit pas.',
  'Miaou. Agent au rapport 🕶️', 'Message décodé. Je ne te dis rien.', 'Cible en vue !', 'Tu as cassé mon code ?!', 'Mission accomplie !', 'Ma couverture a sauté…')
r('Pigeon Messager', 'Dépêche', 'Après ton troisième coup, il apporte une dépêche : le nombre est pair ou impair.',
  'Rou-rou ! Du courrier pour le détective ✉️', 'Dépêche : le nombre est {k} !', 'Je vole droit vers la cible !', 'Tu as intercepté ma lettre ?!', 'Lettre livrée — victoire !', 'Le vent a emporté ma lettre…')
r('Cochon d’Inde Dossier', 'Le dossier', 'Après ton quatrième coup, il retrouve le dossier : le chiffre des dizaines.',
  'Mes archives contiennent tout ! 🗂️', 'Dossier trouvé : {k} !', 'L’affaire est presque résolue !', 'Tu lis mes dossiers ?!', 'Affaire archivée — victoire !', 'Le dossier a disparu…')
r('Koala Empreinte', 'Empreintes', 'Quand il est « Tiède » ou plus près, il relève les empreintes et te dit si le nombre est pair ou impair. Une fois par manche.',
  'Les koalas ont des empreintes comme les humains ! 🖐️', 'Les empreintes disent : le nombre est {k} !', 'Les empreintes mènent à la réponse !', 'Tu as trouvé mes empreintes ?!', 'L’expertise confirme — victoire !', 'Les empreintes sont brouillées…')
r('Étourneau Commère', 'Commérages', 'Au cinquième coup de la manche, il laisse échapper dans quelle moitié est le nombre.',
  'Tu veux une nouvelle ? J’en ai cent ! 🗣️', 'Chut, c’est un secret ! {k} !', 'Il paraît que la réponse est tout près !', 'Tu écoutes aux portes ?!', 'Tout le monde parle de ma victoire !', 'Je n’ai plus de nouvelles…')
r('Raton laveur Passe-partout', 'Pattes agiles', f'Après ton troisième coup, il te fait les poches : ton {K} est à lui maintenant.',
  'Je ne faisais que passer ! 🔓', 'Clic ! Ton « ⚡ » est à moi !', 'La serrure est presque ouverte !', 'Tu m’as pris sur le fait ?!', 'Hé hé, bien joué !', 'Pris la main dans le sac…')
b('La Panthère Fantôme', 'Écran de fumée', f'Au quatrième coup de la manche, elle disparaît dans la fumée : jusqu’à la fin de la manche, tu ne vois plus ses coups.',
  'Le casse du siècle', f'Quand elle refroidit, elle te vole ton {K}. Une fois par manche.',
  'Personne ne m’a jamais attrapée ! 👑', 'Pouf ! Trouve-moi dans la fumée !', 'Le casse du siècle — ton « ⚡ » est à moi !',
  'La réponse est presque entre mes pattes !', 'Tu es sur ma piste !', 'Le Fantôme est insaisissable ! 👑', 'Attrapée… tu es le meilleur détective.')

# 38 · Galápagos
r('Iguane marin Sel', 'Éternuement salé', 'Quand elle refroidit, elle éternue du sel : tu passes ton tour. Une fois par manche.',
  'Je plonge chercher des algues ! 🧂', 'Atchoum ! Du sel — passe ton tour !', 'Je bronze juste à côté de la réponse !', 'Tu as plongé plus profond que moi !', 'Une victoire salée !', 'Je vais me réchauffer sur un rocher…')
r('Fou à pieds bleus Tango', 'Danse des pieds bleus', 'Quand tu es « Brûlant », elle se met à danser : au tour suivant, elle joue deux fois de suite. Une fois par manche.',
  'Regarde mes pieds bleus ! 🩰', 'Tango ! Deux coups de suite !', 'Je danse droit vers la réponse !', 'Tu danses mieux que moi ?!', 'Une danse de victoire !', 'J’ai perdu le rythme…')
r('Frégate Ballon', 'Ballon rouge', f'Quand tu es « Tiède » ou plus près, il gonfle le ballon rouge de sa gorge : {FOG}. Une fois par manche.',
  'Tu vois mon ballon rouge ? 🔴', 'Pouf ! Tu ne vois plus mes coups !', 'Je plane au-dessus de la réponse !', 'Tu voles après moi ?!', 'Une victoire à grande envergure !', 'Mon ballon s’est dégonflé…')
r('Pinson Darwin', 'Observation', 'À son troisième coup, il partage une observation : le nombre est-il divisible par 3.',
  'Les savants ont compris l’évolution grâce à mon bec ! 🔬', 'Observation : le nombre est {k} !', 'L’hypothèse se confirme !', 'Tu es chercheur aussi ?!', 'Une victoire scientifique !', 'L’expérience a raté…')
r('Lion de mer Flemmard', 'Flemme', 'Un coup sur trois des siens, il a la flemme et passe.',
  'Bâââille… le soleil est si chaud 😴', 'Flemme… je passe mon tour.', 'Même allongé, je suis tout près !', 'Tu m’as réveillé !', 'J’ai gagné sans me lever !', 'Je retourne faire la sieste…')
r('Poisson volant Éclabousse', 'Embruns', 'Le deuxième coup de la manche se noie dans les embruns : on ne le voit pas.',
  'Je sais voler au-dessus des vagues ! 🌊', 'Plouf ! Ce coup est dans les embruns !', 'Je vole droit vers la réponse !', 'Tu sais voler aussi ?!', 'Une victoire volante !', 'Retour à la mer…')
r('Cormoran Pataud', 'Un poisson pour un ami', f'Quand il est « Très froid », il partage un poisson avec toi : un {K} pour toi. Une fois par manche.',
  'Je ne vole pas — mais je plonge ! 🐟', 'Prends un poisson — et un « ⚡ +1 coup » !', 'Je plonge droit vers la réponse !', 'Tu plonges plus profond !', 'Une victoire sans ailes !', 'Le poisson s’est échappé…')
r('Lézard de lave Pompes', 'Pompes', f'À son deuxième coup, elle fait des pompes sur un rocher — et prend un {K} pour elle.',
  'Un-deux, un-deux ! Des pompes ! 💪', 'Pompes faites — un « ⚡ +1 coup » pour moi !', 'Je suis en pleine forme !', 'Tu es plus fort que moi ?!', 'La force a gagné !', 'Trop fatiguée pour les pompes…')
r('Buse Sentinelle', 'Vue du cactus', 'Après ton quatrième coup, il regarde du haut d’un cactus et te dit : le nombre est plus grand ou plus petit que le tien.',
  'Du haut d’un cactus, on voit tout ! 🦅', 'D’en haut, je vois : le nombre est {k} !', 'Je tourne au-dessus de la réponse !', 'Tu as l’œil aussi perçant que moi !', 'Une victoire vue d’en haut !', 'Je m’envole vers un autre cactus…')
b('Le Patriarche George', 'Sagesse des siècles', 'Dès le début de la manche, il sait dans quelle moitié est le nombre. Il ne te le dit pas.',
  'Sprint de tortue', 'Si tu es « Froid » ou plus loin, il accélère d’un coup : au tour suivant, il joue deux fois de suite. Une fois par manche.',
  'J’ai deux cents ans — j’ai tout vu ! 👑', 'La sagesse des siècles : je sais où chercher.', 'Sprint de tortue — deux coups de suite !',
  'Lentement mais sûrement vers la réponse !', 'Tu es sage pour ton âge !', 'La sagesse gagne ! 👑', 'Je te laisse cette île…')

# 39 · Far West
r('Chien de prairie Jappe', 'Cri d’alarme', 'Quand tu es « Brûlant », elle jappe un indice : le nombre est pair ou impair. Une fois par manche.',
  'Wouf ! Je monte la garde ! 🐕', 'Jap-jap ! Le nombre est {k} !', 'Je vois la réponse de ma butte !', 'Tu t’es approché de mon terrier !', 'Wouf ! Victoire !', 'Je me cache dans mon terrier…')
r('Coyote Vagabond', 'Hurlement à la lune', f'Au troisième coup de la manche, il hurle à la lune : {MEM}.',
  'Je parcours la prairie ! 🐺', 'Aou-ou-ou ! Tu ne retiens que deux coups !', 'Je flaire la réponse !', 'Tu es un vagabond aussi ?!', 'Un hurlement de victoire !', 'Je pars vers le soleil couchant…')
r('Crotale Crécelle', 'Crécelle', 'Si tu es « Très froid », il agite sa crécelle : tu gèles et tu passes ton tour. Une fois par manche.',
  'Trrrr ! C’est ma façon de dire bonjour 🐍', 'Trrrr ! Gèle — passe ton tour !', 'Je glisse vers la réponse !', 'Tu n’as pas peur de ma crécelle ?!', 'Trrrr ! Victoire !', 'Je me glisse sous un rocher…')
r('Mustang Fougueux', 'Galop', 'À son deuxième coup, il part au galop : il rejoue tout de suite.',
  'Personne ne me domptera ! 🐎', 'Au galop ! Je rejoue !', 'Je galope droit vers la réponse !', 'Tu galopes derrière moi ?!', 'Une victoire sauvage !', 'Je repars dans la prairie…')
r('Porc-épic Aiguillon', 'Piquants', 'Quand il est « Froid » ou plus loin, il hérisse ses piquants : tu te piques et tu passes ton tour. Une fois par manche.',
  'À ta place, je ne me ferais pas de câlin ! 📌', 'Aïe ! Piqué — passe ton tour !', 'Je pique droit sur la cible !', 'Tu n’as pas peur de moi ?!', 'Une victoire piquante !', 'Je me roule en boule…')
r('Géocoucou Poussière', 'Démarrage éclair', 'Quand elle est « Très froid », elle démarre comme une flèche : elle rejoue tout de suite. Une fois par manche.',
  'Bip-bip ! Tu ne m’attraperas pas ! 💨', 'Bip-bip ! Je rejoue !', 'Je cours droit vers la réponse !', 'Tu cours plus vite ?!', 'Bip-bip ! Victoire !', 'Il ne reste que la poussière…')
r('Chouette des terriers Guetteuse', 'Hors du terrier', 'Après ton deuxième coup, elle sort la tête de son terrier et apprend : le nombre est plus grand ou plus petit que le tien. Elle ne te le dit pas.',
  'J’habite dans un terrier, comme un spermophile ! 🦉', 'J’ai jeté un œil — j’en sais plus.', 'Je vois la réponse depuis mon terrier !', 'Tu as regardé dans mon terrier ?!', 'Une victoire souterraine !', 'Je rentre me cacher…')
r('Héloderme Mosaïque', 'Morsure', f'À son quatrième coup, il mord ton {K} — et il disparaît.',
  'Ma peau ressemble à des perles ! 🦎', 'Crac ! Ton « ⚡ » a disparu !', 'Je rampe vers la réponse !', 'Tu as esquivé ?!', 'Mosaïque gagne !', 'Je rampe à l’ombre…')
r('Antilocapre Fourche', 'Accélération', 'Après ton troisième coup, il accélère : au tour suivant, il joue deux fois de suite.',
  'Je suis le plus rapide de la prairie ! 🦌', 'Accélération ! Deux coups de suite !', 'Je fonce vers la réponse !', 'Tu me rattrapes ?!', 'Une victoire cornue !', 'Trop fatigué pour courir…')
b('Le Shérif Bison', 'Haut les mains !', f'Tu as activé ton {K} — le shérif crie « Haut les mains ! » : tu passes ton tour suivant. Une fois par manche.',
  'Confiscation', f'Au sixième coup de la manche, il confisque ton {K}.',
  'C’est moi qui fais la loi dans cette ville ! 👑', 'Haut les mains ! Passe ton tour !', 'Je confisque ton « ⚡ » !',
  'La réponse est en état d’arrestation !', 'Tu es un cow-boy honnête !', 'La loi gagne ! 👑', 'Je rends mon étoile… tu as gagné.')

# 40 · Pays des yokai
r('Kappa Concombre', 'Concombre', f'Quand il est « Très froid », il croque un concombre et prend un {K} pour lui. Une fois par manche.',
  'Ne renverse pas l’eau sur ma tête ! 🥒', 'Croc ! Un « ⚡ +1 coup » pour moi !', 'Le concombre mène à la réponse !', 'Tu t’es poliment incliné ?!', 'Une victoire croquante !', 'L’eau s’est renversée…')
r('Tengu Souffle', 'Éventail de plumes', f'Quand il est « Tiède » ou plus près, il agite son éventail : {LAVA}. Une fois par manche.',
  'Je suis un esprit des montagnes aux ailes de corbeau ! 🍃', 'Fouuu ! Ton coup s’envole n’importe où !', 'Le vent me porte vers la réponse !', 'Le vent ne t’a pas emporté ?!', 'Une victoire venteuse !', 'Je retourne dans les montagnes…')
r('Nekomata Deux-Queues', 'Deux queues', 'À son deuxième coup, elle agite ses deux queues : au tour suivant, elle joue deux fois de suite.',
  'Miaou ! Deux queues valent mieux qu’une 🐈', 'Miaou ! Deux coups de suite !', 'Ma lanterne éclaire la réponse !', 'Tu vois dans le noir ?!', 'Une victoire ronronnante !', 'Ma lanterne s’est éteinte…')
r('Kamaitachi Bourrasque', 'Bourrasque', 'Ton quatrième coup est emporté par une bourrasque : on ne le voit pas.',
  'Fffuit ! Je suis un vent à petites griffes 🌀', 'Fffuit ! Ton coup s’est envolé !', 'Je tourbillonne près de la réponse !', 'Tu as tenu bon dans le vent ?!', 'Une victoire tourbillonnante !', 'Le vent est tombé…')
r('Kodama Chuchote', 'Murmure de la forêt', 'Quand tu es « Tiède » ou plus près, il te murmure dans quelle moitié est le nombre. Une fois par manche.',
  'Chut… je vis dans un vieil arbre 🌳', 'Chut… {k}…', 'La forêt murmure — la réponse est proche !', 'Tu entends la forêt ?', 'Une victoire de la forêt !', 'Je me fonds dans les feuilles…')
r('Amabie Éclat', 'Prophétie', 'Au début de la manche, elle prédit si le nombre est divisible par 5.',
  'J’apporte de bonnes prédictions ! ✨', 'Prophétie : le nombre est {k} !', 'Mes écailles brillent — la réponse est proche !', 'Tu crois aux prophéties ?', 'C’est arrivé — victoire !', 'La prophétie ne s’est pas réalisée…')
r('Yuki-onna Givrine', 'Souffle glacé', 'Quand elle est « Froid » ou plus loin, elle souffle du givre : tu gèles et tu passes ton tour. Une fois par manche.',
  'Je danse avec les flocons ❄️', 'Fouuu… Gèle — passe ton tour !', 'La tempête de neige me mène à la réponse !', 'Tu n’as pas froid ?!', 'Une victoire neigeuse !', 'J’ai fondu…')
r('Zashiki-warashi Chance', 'La chance à la maison', f'Au troisième coup de la manche, elle apporte la chance : un {K} pour toi.',
  'Hi hi ! Là où je suis, il y a de la chance ! 🎎', 'Chance ! Prends un « ⚡ +1 coup » !', 'La chance est de mon côté !', 'Tu as de la chance !', 'Hi hi, quelle chance !', 'Ma chance est partie chez toi…')
r('Macaque des neiges Onsen', 'Source chaude', 'Si tu es « Très froid », elle se réchauffe dans la source chaude et passe son tour. Une fois par manche.',
  'Ah, une source chaude… ♨️', 'Je me réchauffe… je passe mon tour.', 'Même dans l’eau, je suis tout près !', 'Tu veux te réchauffer aussi ?!', 'Une victoire bien au chaud !', 'L’eau a refroidi…')
b('Le Roi Oni', 'Tambour', f'À son troisième coup, il frappe son tambour : {MEM}.',
  'Force d’oni', f'Quand il est « Froid » ou plus loin, il te prend ton {K}. Une fois par manche.',
  'N’aie pas peur — je suis un gentil oni ! 👑', 'BOUM-BOUM ! Tu ne retiens que deux coups !', 'Force d’oni — ton « ⚡ » est à moi !',
  'Le tambour gronde — la réponse est proche !', 'Tu es courageux !', 'Le Roi Oni gagne ! 👑', 'Tu as vaincu l’oni…')

# 41 · Îles d’Indonésie
r('Orang-outan Bornéo', 'Parapluie de feuille', 'Si tu es « Froid » ou plus loin, il couvre ton coup d’une feuille : on ne le voit pas. Une fois par manche.',
  'Bonjour des forêts de Bornéo ! 🌿', 'Sous la feuille, ton coup est invisible !', 'Je tends la main vers la réponse !', 'Tu grimpes aux arbres ?!', 'Une victoire de la forêt tropicale !', 'Je pars sous la pluie…')
r('Mainate de Bali Perle', 'Chanson-indice', 'Au deuxième coup de la manche, il te chante un indice : le nombre est pair ou impair.',
  'Je ne vis qu’à Bali ! 🐦', 'Je chante : le nombre est {k} !', 'La chanson mène à la réponse !', 'Tu chantes mieux que moi ?!', 'Un chant de victoire !', 'J’ai perdu ma voix…')
r('Calao Heaume', 'Une figue', f'Après ton quatrième coup, il t’apporte une figue : un {K}.',
  'Tu vois mon casque ? C’est mon bec ! 🍈', 'Prends une figue — et un « ⚡ +1 coup » !', 'Je vole vers la réponse !', 'Tu m’as dépassé ?!', 'Une victoire casquée !', 'Je m’envole vers les arbres…')
r('Tapir Pyjama', 'Sieste en pyjama', 'Un coup sur quatre des siens, il s’endort et passe.',
  'Je suis toujours en pyjama ! 🛌', 'Bâille… je passe mon tour.', 'J’avance à tâtons vers la réponse !', 'Tu m’as réveillé !', 'Une victoire en pyjama !', 'Au lit…')
r('Loris Tout-doux', 'Trè-ès lentement', 'Après ton troisième coup, il se perd lentement dans ses pensées et passe son tour.',
  'Bon-jou-our… je ne suis pa-as pressé 🦥', 'Je ré-flé-chis… je passe mon tour.', 'Len-te-ment, mais vers la réponse !', 'Tu es si-i rapide !', 'Tout doux — et victoire !', 'Trop ta-a-ard…')
r('Nasique Klaxon', 'Nez-trompette', f'Si tu es « Froid » ou plus loin, il souffle si fort dans son nez que {MEM}. Une fois par manche.',
  'Tu vois mon nez ? Le plus grand de la jungle ! 👃', 'POUÊÊÊT ! Tu ne retiens que deux coups !', 'Mon nez flaire la réponse !', 'Ton nez vaut le mien !', 'Une victoire à vue de nez !', 'Le nez en berne…')
r('Poisson-mandarin Carnaval', 'Carnaval de couleurs', 'Quand elle refroidit, elle fait éclater ses couleurs : jusqu’à la fin de la manche, tu ne vois plus ses coups. Une fois par manche.',
  'Je suis le poisson le plus coloré du récif ! 🎨', 'Éclat ! Tu ne vois plus mes coups !', 'Je nage vers la réponse !', 'Tu vois à travers les couleurs ?!', 'Une victoire haute en couleur !', 'Mes couleurs ont pâli…')
r('Binturong Popcorn', 'Friandise', f'Après ton troisième coup, il partage une friandise : un {K} pour toi et un pour lui.',
  'Je sens le pop-corn — c’est vrai ! 🍿', 'Sers-toi ! Un « ⚡ +1 coup » chacun !', 'Je rampe vers la réponse !', 'Tu m’as trouvé !', 'Ronron — victoire !', 'Je vais faire une sieste…')
r('Ours malais Rayon', 'Miel', f'Quand il est « Très chaud » ou plus près, il partage son miel de bonheur : un {K} pour toi et un pour lui. Une fois par manche.',
  'Tu vois le soleil sur ma poitrine ? C’est moi ! 🍯', 'Du miel ! Un « ⚡ +1 coup » chacun !', 'Je sens le miel — la réponse est proche !', 'Tu as trouvé mon miel ?!', 'Une victoire sucrée !', 'Plus de miel…')
b('Le Roi Komodo', 'Prise', 'Après ton quatrième coup, il t’attrape : tu gèles et tu passes ton tour.',
  'Proie', f'À son troisième coup, il prend un {K} pour lui.',
  'Je suis le plus grand lézard du monde ! 👑', 'Attrapé ! Gèle — passe ton tour !', 'Une proie — un « ⚡ +1 coup » pour moi !',
  'La réponse est déjà dans ma gueule !', 'Tu es courageux !', 'Le roi de l’île gagne ! 👑', 'Je pars bronzer…')

# 42 · Académie des savants
r('Pipistrelle Écho', 'Écholocation', 'Un coup sur deux des siens, il écoute l’écho et apprend : le nombre est plus grand ou plus petit que le sien. Il ne te le dit pas.',
  'Je vois avec mes oreilles ! 🦇', 'L’écho a répondu… j’en sais plus.', 'L’écho mène à la réponse !', 'Tu entends l’écho aussi ?!', 'Une victoire au son !', 'L’écho s’est tu…')
r('Corneille Engrenage', 'Invention', 'Après ton deuxième coup, elle construit un appareil et te dit : le chiffre des dizaines.',
  'J’invente de tout ! ⚙️', 'L’appareil indique : {k} !', 'Le calcul est juste !', 'Tu es inventeur aussi ?!', 'L’invention a marché !', 'L’appareil est cassé…')
r('Capucin Éprouvette', 'Réaction', f'Au cinquième coup de la manche, l’éprouvette bouillonne : {LAVA}.',
  'La chimie, c’est amusant ! 🧪', 'Ça bouillonne ! Ton coup part n’importe où !', 'La réaction se passe bien !', 'Tu as mélangé les mêmes produits ?!', 'L’expérience a réussi !', 'L’éprouvette s’est fêlée…')
r('Rat-taupe nu Géologue', 'Fouilles', 'Si tu es « Froid » ou plus loin, il creuse et apprend le chiffre des dizaines. Il ne te le dit pas. Une fois par manche.',
  'Je vis sous terre et je ne vieillis presque pas ! ⛏️', 'Déterré… maintenant j’en sais plus.', 'Couche après couche — vers la réponse !', 'Tu creuses à côté ?!', 'Une trouvaille précieuse !', 'Le tunnel s’est effondré…')
r('Gris du Gabon Polyglotte', 'Dans toutes les langues', 'À son deuxième coup, il annonce : le nombre est-il divisible par 3.',
  'Je parle cent langues ! 💬', 'Annonce : le nombre est {k} !', 'Les mots mènent à la réponse !', 'Tu me comprends ?!', 'Une victoire dans toutes les langues !', 'J’ai la langue qui fourche…')
r('Coati Fiole', 'Analyse', 'Quand tu es « Tiède » ou plus près, il fait une analyse et apprend si le nombre est divisible par 5. Il ne te le dit pas. Une fois par manche.',
  'Ma queue rayée est comme une règle ! ⚗️', 'Analyse terminée. Je ne te dis rien.', 'La formule tombe juste !', 'Tu vérifies mes calculs ?!', 'Une victoire scientifique !', 'La fiole s’est brisée…')
r('Abeille Géomètre', 'Hexagones', 'Après ton troisième coup, elle trace des alvéoles et te dit si le nombre est divisible par 5.',
  'Les alvéoles sont des hexagones parfaits ! 📐', 'Bzzz ! Le nombre est {k} !', 'Le dessin tombe juste !', 'Tu connais la géométrie ?!', 'Une victoire bien droite !', 'Mon compas est cassé…')
r('Alpaga Ingénieure', 'Le plan', 'Quand elle est « Brûlant », elle déroule son plan et te montre : le chiffre des dizaines. Une fois par manche.',
  'Je dessine des ponts et des tours ! 📏', 'Le plan : {k} !', 'Tout se passe comme prévu !', 'Tu es ingénieur aussi ?!', 'J’ai construit une victoire !', 'Le plan est froissé…')
r('Gerbille Expérience', 'Expérience', 'Quand elle chauffe, elle fait une expérience et apprend le dernier chiffre. Elle ne te le dit pas. Une fois par manche.',
  'L’expérience est le meilleur professeur ! 🧫', 'Ça a marché… j’en sais plus.', 'L’expérience le confirme !', 'Tu refais mon expérience ?!', 'Expérience réussie !', 'L’expérience a échoué…')
b('La Rectrice Effraie', 'Examen', 'Dès le début de la manche, elle connaît le dernier chiffre du nombre. Elle ne te le dit pas.',
  'L’indice de la rectrice', 'Après ton troisième coup, elle te donne honnêtement le même chiffre : le dernier.',
  'Bienvenue à l’Académie ! 👑', 'Je connais la réponse. Voyons si toi aussi.', 'L’indice de la rectrice : {k} !',
  'L’examen est presque réussi !', 'Un excellent élève !', 'L’examen est terminé — victoire ! 👑', 'Je te mets la meilleure note…')

# 43 · Temple perdu
r('Quetzal Émeraude', 'Plume sacrée', 'Quand tu es « Brûlant », il laisse tomber une plume sacrée et te dit dans quelle moitié est le nombre. Une fois par manche.',
  'Je suis l’oiseau sacré du temple ! 🪶', 'La plume dit : {k} !', 'La plume mène à la réponse !', 'Tu as trouvé ma plume ?!', 'Une victoire émeraude !', 'Je m’envole dans la jungle…')
r('Singe hurleur Clameur', 'Hurlement', f'Quand tu es « Très chaud » ou plus près, il hurle à travers la forêt : {MEM}. Une fois par manche.',
  'On m’entend à cinq kilomètres ! 📣', 'HOU-OUAAA ! Tu ne retiens que deux coups !', 'Je hurle de joie — tout près !', 'Tu n’es pas devenu sourd ?!', 'Une victoire bruyante !', 'J’ai perdu ma voix…')
r('Pécari Fouisseur', 'Fouilles', 'À son quatrième coup, il déterre un indice et apprend si le nombre est pair ou impair. Il ne te le dit pas.',
  'Groin ! Je déterre des secrets anciens ! 🐗', 'Déterré… maintenant j’en sais plus.', 'Je creuse vers la réponse !', 'Tu creuses à côté ?!', 'Groin — victoire !', 'Je n’ai rien trouvé…')
r('Atèle Cinq-Mains', 'Queue-main', f'Après ton deuxième coup, elle attrape ton {K} avec sa queue : il est à elle maintenant.',
  'J’ai cinq mains — l’une est ma queue ! 🐒', 'Attrapé avec la queue ! Ton « ⚡ » est à moi !', 'J’atteins la réponse !', 'Tu es agile !', 'Une victoire à la queue !', 'Ma queue est fatiguée…')
r('Basilic Coureur', 'Course sur l’eau', 'Au troisième coup de la manche — un sprint sur l’eau : celui qui vient de jouer rejoue.',
  'Je cours sur l’eau ! 💧', 'Plic-plic-plic ! Encore un coup !', 'Je cours droit vers la réponse !', 'Tu cours sur l’eau aussi ?!', 'Une victoire mouillée !', 'J’ai coulé…')
r('Kinkajou Grappin', 'La nuit tombe', f'Au sixième coup de la manche, la nuit tombe : {FOG}.',
  'Je sors la nuit ! 🌙', 'La nuit ! Tu ne vois plus mes coups !', 'Dans le noir, je vois la réponse !', 'Tu vois dans le noir ?!', 'Une victoire nocturne !', 'L’aube… je vais dormir.')
r('Ocelot Moucheté', 'Embuscade', 'Son quatrième coup se cache dans les feuilles : on ne le voit pas.',
  'Mes taches me cachent dans les feuilles ! 🐆', 'Chut ! Ce coup est en embuscade !', 'Je m’approche de la réponse !', 'Tu as trouvé mon embuscade ?!', 'Un bond hors de l’embuscade — victoire !', 'L’embuscade a échoué…')
r('Tamandua Lèche-tout', 'Longue langue', f'À son troisième coup, il lèche ton {K} — et il disparaît.',
  'Ma langue est plus longue que ma tête ! 👅', 'Slurp ! Ton « ⚡ » a disparu !', 'Je goûte la réponse !', 'Tu as esquivé ?!', 'Une victoire léchée !', 'Ma langue est fatiguée…')
r('Ara Flambeau', 'Ailes de feu', f'À son troisième coup, il bat de ses ailes de feu : {LAVA}.',
  'Mes plumes brûlent comme un flambeau ! 🔥', 'Flap ! Ton coup part n’importe où !', 'Je vole vers la réponse !', 'Tu brilles plus que moi ?!', 'Une victoire enflammée !', 'Mes plumes ont pâli…')
b('Balam le Jaguar', 'Regard du chef', 'Quand il refroidit, il te regarde si fort que tu gèles et tu passes ton tour. Une fois par manche.',
  'Échange de présents', 'À son premier coup, il échange les « ⚡ +1 coup » avec toi : les tiens à lui, les siens à toi.',
  'Je suis le chef du temple perdu ! 👑', 'Le regard du chef ! Gèle — passe ton tour !', 'Échange de présents — on échange les « ⚡ » !',
  'Le temple me révèle la réponse !', 'Tu es digne du temple !', 'Le chef gagne ! 👑', 'Le temple est à toi, voyageur…')

# 44 · Grande steppe
r('Manul Grognon', 'Air renfrogné', f'Après ton quatrième coup, il fronce les sourcils si fort que ton {K} s’éteint.',
  'Je ne souris pas. Jamais 😾', 'Hmpf ! Ton « ⚡ » s’est éteint !', 'Grognon, mais tout près !', 'Tu m’as fait rire ?!', 'Une victoire grognonne !', 'Hmpf… d’accord.')
r('Saïga Gros-Nez', 'Tempête de poussière', 'Quand il est « Très froid », son coup se perd dans la poussière : on ne le voit pas. Une fois par manche.',
  'Mon nez filtre la poussière de la steppe ! 🏜️', 'Poussière ! Ce coup est invisible !', 'Je galope vers la réponse !', 'Tu cours avec moi ?!', 'Une victoire de la steppe !', 'Parti dans la poussière…')
r('Cheval de Przewalski Isabelle', 'En selle', 'Quand tu es « Tiède » ou plus près, elle te prend sur son dos : tu rejoues tout de suite. Une fois par manche.',
  'Je suis le dernier cheval sauvage de la Terre ! 🐴', 'En selle — rejoue !', 'Je galope vers la réponse !', 'Tu tiens bien en selle !', 'Une victoire au galop !', 'Partie au galop dans la steppe…')
r('Koulan Galop', 'Course', 'Un coup sur quatre des siens, il rejoue tout de suite.',
  'Je suis plus rapide que le vent de la steppe ! 🏇', 'Je cours ! Je rejoue !', 'Je rattrape la réponse !', 'Tu galopes plus vite ?!', 'Une victoire rapide !', 'Trop fatigué pour galoper…')
r('Chameau de Bactriane Caravane', 'Caravane', f'Au sixième coup de la manche, la caravane arrive : un {K} pour toi et un pour lui.',
  'Deux bosses — double provision ! 🐫', 'La caravane est là ! Un « ⚡ +1 coup » chacun !', 'La caravane avance vers la réponse !', 'Tu m’as rattrapé !', 'La caravane gagne !', 'La caravane est partie…')
r('Spermophile Piquet', 'Sifflet', 'Quand il refroidit, il siffle un indice : le nombre est pair ou impair. Une fois par manche.',
  'Je me dresse comme un piquet et je regarde au loin ! 🐿️', 'Fuiiit ! Le nombre est {k} !', 'Je vois la réponse au loin !', 'Tu te dresses aussi ?!', 'Fuiiit — victoire !', 'Je me cache dans mon terrier…')
r('Outarde Majestueuse', 'Importance', 'Quand tu es « Très chaud » ou plus près, elle gonfle ses plumes avec importance et passe son tour. Une fois par manche.',
  'Je suis l’oiseau volant le plus lourd ! 🦃', 'Toute gonflée… je passe mon tour.', 'Je marche majestueusement vers la réponse !', 'Tu es plus important que moi ?!', 'Une victoire majestueuse !', 'Mes plumes sont retombées…')
r('Putois marbré Bigarré', 'Queue en panache', f'À son deuxième coup, elle dresse la queue : {MEM}.',
  'Je suis bariolée comme un tapis de la steppe ! 🦨', 'Queue en panache ! Tu ne retiens que deux coups !', 'Je file autour de la réponse !', 'Tu n’as pas eu peur de moi ?!', 'Une victoire bigarrée !', 'Je retourne dans mon terrier…')
r('Corsac Crépuscule', 'Échange rusé', 'Quand tu refroidis, il échange les « ⚡ +1 coup » avec toi : les tiens à lui, les siens à toi. Une fois par manche.',
  'Le renard de la steppe est le plus rusé ! 🦊', 'On échange les « ⚡ » ! Rusé, non ?', 'La ruse mène à la réponse !', 'Tu es plus rusé que moi ?!', 'Une victoire rusée !', 'Berné…')
b('Le Khan Aigle royal', 'Piqué', f'Si tu es « Froid » ou plus loin, il pique sur toi : {LAVA}. Une fois par manche.',
  'Vue d’en haut', 'Quand il est « Brûlant », il regarde d’en haut et apprend : le nombre est plus grand ou plus petit que le sien. Il ne te le dit pas. Une fois par manche.',
  'Je suis le khan de cette steppe ! 👑', 'Piqué ! Ton coup part n’importe où !', 'D’en haut, j’en vois plus…',
  'La réponse est dans mes serres !', 'Tu as l’œil d’un aigle !', 'Le khan gagne ! 👑', 'La steppe est à toi…')

# 45 · Asgard
r('Sleipnir Huit-Pattes', 'Huit pattes', 'Quand il est « Très froid », il galope sur ses huit pattes : au tour suivant, il joue deux fois de suite. Une fois par manche.',
  'J’ai huit pattes — attrape-moi ! 🐎', 'Huit pattes ! Deux coups de suite !', 'Je galope à travers les mondes vers la réponse !', 'Tu galopes avec moi ?!', 'Une victoire à huit pattes !', 'Mes pattes se sont emmêlées…')
r('Corbeau Hugin', 'Pensée', 'Quand tu es « Tiède » ou plus près, il fait le tour du monde et apprend : le nombre est plus grand ou plus petit que le tien. Il ne te le dit pas. Une fois par manche.',
  'Mon nom veut dire Pensée — Hugin ! 🪶', 'J’ai fait le tour du monde… j’en sais plus.', 'Les pensées mènent à la réponse !', 'Tu penses vite !', 'Une victoire sage !', 'La pensée s’est envolée…')
r('Écureuil Ratatosk', 'Nouvelles du Frêne', 'À son premier coup, elle apporte des nouvelles : le nombre est pair ou impair.',
  'Je cours de haut en bas de l’Arbre-Monde ! 📯', 'Nouvelles du Frêne : le nombre est {k} !', 'Je cours vers la réponse !', 'Tu cours plus vite ?!', 'Une victoire d’écureuil !', 'Je file au sommet…')
r('Louveteau Fenrir', 'Petites dents', f'Après ton premier coup, il ronge ton {K} — et il disparaît.',
  'Grrr ! Je deviendrai grand ! 🐺', 'Crac ! Ton « ⚡ » a disparu !', 'Je flaire la réponse !', 'Tu n’as pas peur de moi ?!', 'Une victoire de loup !', 'Je retourne voir maman…')
r('Chevreau Tonnerre', 'Tonnerre', 'Au deuxième coup de la manche, le tonnerre gronde : tu passes ton tour.',
  'Bêê ! Je tire le char du tonnerre ! 🌩️', 'BADABOUM ! Passe ton tour !', 'Le tonnerre me mène à la réponse !', 'Tu n’as pas peur du tonnerre ?!', 'Une victoire tonitruante !', 'L’orage est passé…')
r('Géant de givre Glaçon', 'Givre', 'Après ton deuxième coup, il souffle du givre : tu gèles et tu passes ton tour.',
  'Je suis un petit géant de givre ! ❄️', 'Hooo ! Gèle — passe ton tour !', 'La glace mène à la réponse !', 'Tu n’as pas froid ?!', 'Une victoire glacée !', 'Je fonds…')
r('Valkyrie Sigrun', 'Récompense', f'À son deuxième coup, elle récompense ton courage : un {K} pour toi.',
  'Je choisis les plus braves ! ⚔️', 'Pour ton courage — un « ⚡ +1 coup » !', 'Je vole vers la réponse !', 'Tu es un brave guerrier !', 'Gloire à la victoire !', 'Je m’envole au Valhalla…')
r('Chat des forêts Freyja', 'Ronronnement', f'Quand tu es « Tiède » ou plus près, elle ronronne : un {K} pour toi et un pour elle. Une fois par manche.',
  'Je tire le char de la déesse ! 🐈', 'Ronron ! Un « ⚡ +1 coup » chacun !', 'Je ronronne près de la réponse !', 'Tu me caresses ?!', 'Une victoire ronronnante !', 'Je retourne dans la forêt…')
r('Ourson Berserk', 'Fureur', 'Quand il est « Très froid », il entre en fureur : tu passes ton tour. Une fois par manche.',
  'Grrr ! Je fais peur… presque ! 🐻', 'GRRR ! Passe ton tour !', 'La fureur mène à la réponse !', 'Tu n’as pas eu peur ?!', 'Une victoire furieuse !', 'Ma fureur est passée…')
b('Jörmungand le Serpent-Monde', 'Tempête', f'À son quatrième coup, il soulève une tempête : {LAVA}.',
  'Brouillard marin', 'Si tu es « Très froid », un brouillard se lève sur la mer : jusqu’à la fin de la manche, tu ne vois plus ses coups. Une fois par manche.',
  'J’entoure le monde entier de ma queue ! 👑', 'Tempête ! Ton coup part n’importe où !', 'Brouillard ! Tu ne vois plus mes coups !',
  'La réponse est déjà dans mes anneaux !', 'Tu as traversé ma mer !', 'Le Serpent-Monde gagne ! 👑', 'Je lâche ma queue…')
