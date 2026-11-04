WORLDS = ['Sumpfland', 'Musiktal', 'Berggipfel', 'Roboterfabrik', 'Welt der Mythen',
          'Herbstwald', 'Zauberküche', 'Atlantis', 'Traumland', 'Zwergenschmiede']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '„⚡ +1 Zug“'
FOG = 'Bis zum Rundenende siehst du seine Züge nicht'
FOG_F = 'Bis zum Rundenende siehst du ihre Züge nicht'
BLIND = 'Bis zum Rundenende siehst du deine eigenen Züge nicht'
MEM = 'Bis zum Rundenende siehst du nur die letzten zwei Züge'
LAVA = 'Dein nächster Zug geschieht von selbst — ein wilder Wurf'

# 26 · Sumpfland
r('Bisamratte Schilfi', 'Flüsterndes Schilf', 'Nach deinem ersten Zug flüstert dir das Schilf zu, in welcher Hälfte die Zahl liegt.',
  'Ich wohne im Schilf! 🌾', 'Psst… Die Zahl ist {k}!', 'Das Schilf raschelt — ich bin nah!', 'Oh, du hast es fast gefunden!', 'Ein Schilfsieg!', 'Ich verstecke mich im Schilf…')
r('Rohrdommel Brummer', 'Sumpfhorn', 'Beim sechsten Zug der Runde dröhnt sie über den ganzen Sumpf — du zuckst zusammen und setzt einen Zug aus.',
  'Mein „Buuh“ hört man im ganzen Sumpf! 📯', 'BUU-UUH! Setz aus!', 'Buuh — ich bin nah!', 'Oh, du hattest keine Angst?!', 'Ein dröhnender Sieg!', 'Ich bin heiser…')
r('Venusfliegenfalle Schnappi', 'Schnapp!', f'Bist du „Kalt“ oder weiter weg — schnapp! —, fängt sie deinen {K} und behält ihn. Einmal pro Runde.',
  'Ich fange Fliegen, keine Kinder! 🪤', 'Schnapp! Der „⚡“ gehört mir!', 'Gleich schnappe ich das Ziel!', 'Oh, du bist schneller als ich!', 'Schnapp — gewonnen!', 'Daneben…')
r('Kaulquappe Zappel', 'Zappelgeschenk', f'Wirst du wärmer, zappelt sie zu dir und schenkt dir einen {K}. Einmal pro Runde.',
  'Bald werde ich ein Frosch! 🐸', 'Zappel! Hier, ein „⚡ +1 Zug“!', 'Ich schwimme zum Ziel!', 'Du schwimmst schneller!', 'Ein zappeliger Sieg!', 'Ich schwimme davon…')
r('Wasserläufer Gleiter', 'Kreise im Wasser', 'Wirst du wärmer, gleitet er übers Wasser, und die Kreise verraten dir, ob die Zahl größer oder kleiner als deine ist. Einmal pro Runde.',
  'Ich kann über Wasser laufen! 🦟', 'Schau auf die Kreise: Die Zahl ist {k}!', 'Ich gleite zum Ziel!', 'Oh, du bist schon nah!', 'Ein rutschiger Sieg!', 'Ich bin ausgerutscht…')
r('Nutria Platsch', 'Platsch!', f'Mit ihrem dritten Zug springt sie ins Wasser — die Spritzer löschen deinen {K}.',
  'Ich tauche so gern! 🦫', 'Platsch! Dein „⚡“ ist aus!', 'Ich paddle direkt zum Ziel!', 'Du schwimmst genauso gut!', 'Ein nasser Sieg!', 'Ich gehe mich trocknen…')
r('Kikimora Moosi', 'Sumpfzauber', f'Bist du „Warm“ oder näher, verwirrt sie dich: {LAVA}. Einmal pro Runde.',
  'Ich bin eine liebe Kikimora! 🍃', 'Zauber! Ein wilder Wurf!', 'Der Schlamm flüstert — nah!', 'Oh, dich kann man nicht verwirren!', 'Ein Sumpfsieg!', 'Zurück in den Schlamm…')
r('Mooskugel Wuschel', 'Moosgeschenk', f'Beim dritten Zug der Runde rollt sie herum und schenkt dir und sich je einen {K}.',
  'Ich bin weich wie Moos! 🟢', 'Gerollt — ein „⚡ +1 Zug“ für alle!', 'Ich rolle zum Ziel!', 'Du rollst schneller!', 'Ein mooshafter Sieg!', 'Ich rolle auf den Grund…')
r('Desman Rüssel', 'Feine Nase', 'Wird er wärmer, schnüffelt er mit seinem langen Rüssel und verrät dir, ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Meine Nase riecht alles! 👃', 'Schnupper-schnupper! Die Zahl ist {k}!', 'Ich rieche das Ziel!', 'Deine Nase ist so gut wie meine!', 'Meine Nase hatte recht!', 'Meine Nase ist zu…')
b('Der Sumpfkönig', 'Morast', 'Wirst du kälter, hält dich der Morast fest: Du erstarrst und setzt einen Zug aus. Einmal pro Runde.',
  'Seerose', f'Nach deinem ersten Zug pflückt er eine Seerose: einen {K} für sich.',
  'Ich bin der König des ganzen Sumpfes! 👑', 'Blubb-blubb! Erstarre!', 'Eine Seerose — ein „⚡“ für mich!', 'Der Sumpf verrät es mir — nah!', 'Oh, du hast meinen Palast erreicht!', 'Ein königlicher Sieg!', 'Zurück auf den Grund…')

# 27 · Musiktal
r('Nachtigall Triller', 'Trillertipp', 'Wirst du kälter, schmettert sie einen Triller und verrät dir, ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Hör dir mein Lied an! 🎶', 'Tirili! Die Zahl ist {k}!', 'Ich singe lauter — nah!', 'Du singst genauso gut!', 'Ein Siegestriller!', 'Meine Stimme ist weg…')
r('Flügel Taste', 'Akkord', 'Wird er wärmer, spielt er einen Akkord und verrät dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Ich habe achtundachtzig Tasten! 🎹', 'Pam-pam! Die Zahl ist {k}!', 'Es klingt immer näher!', 'Du spielst genau im Takt!', 'Applaus!', 'Mein Deckel ist zu…')
r('Gitarre Zupf', 'Zupfen', f'Ist sie „Warm“ oder näher, zupft sie ihre Saiten und holt sich einen {K}. Einmal pro Runde.',
  'Zupf-zupf, spielen wir? 🎸', 'Pling! Ein „⚡“ für mich!', 'Meine Saiten klingen — nah!', 'Oh, du hast den richtigen Ton getroffen!', 'Ein Gitarrensieg!', 'Eine Saite ist gerissen…')
r('Saxofon Jazzy', 'Jazzsolo', 'Ist es „Glühend“, spielt es ein Solo: Beim nächsten Mal zieht es zweimal hintereinander. Einmal pro Runde.',
  'Ein bisschen Jazz? 🎷', 'Solo! Zwei Züge hintereinander!', 'Du-du-du — nah!', 'Du improvisierst so toll!', 'Ein jazziger Sieg!', 'Ein falscher Ton…')
r('Die Cha-Cha-Rasseln', 'Cha-Cha-Cha', 'Jeder zweite ihrer Züge geht im Rasseln unter: Du siehst ihn nicht.',
  'Cha-Cha-Cha, wir tanzen! 🕺', 'Cha-Cha! Diesen Zug hört man nicht!', 'Wir rasseln zum Ziel!', 'Oh, du tanzt besser!', 'Ein Tanzsieg!', 'Wir sind müde…')
r('Harfe Kling', 'Klingende Saiten', f'Bist du „Sehr heiß“ oder näher, lässt sie ihre Saiten klingen und schenkt dir einen {K}. Einmal pro Runde.',
  'Meine Saiten singen! ✨', 'Kling-kling! Ein „⚡ +1 Zug“ für dich!', 'Es klingt immer näher!', 'Oh, du bist fast da!', 'Ein klingender Sieg!', 'Meine Saiten sind verstummt…')
r('Note Sol', 'Klarer Ton', 'Mit ihrem dritten Zug klingt sie hell und verrät dir, ob die Zahl größer oder kleiner als ihre ist.',
  'Do, Re, Mi, Fa, SOL! 🎵', 'Sooo-ol! Die Zahl ist {k}!', 'Ich treffe den Ton!', 'Du singst auch ganz sauber!', 'Ein Notensieg!', 'Ich habe falsch gesungen…')
r('Akkordeon Quetschi', 'Offener Balg', f'Du schaltest deinen {K} ein — es zieht seinen Balg auf: Beim nächsten Mal zieht es zweimal hintereinander. Einmal pro Runde.',
  'Ich zieh den Balg auf — wir singen! 🪗', 'Hopp! Zwei Züge hintereinander!', 'Ich spiele immer näher!', 'Du singst im Takt mit!', 'Ein Tanzmusiksieg!', 'Mein Balg ist leer…')
r('Leierschwanz Echo', 'Echo', 'Nach deinem ersten Zug wiederholt er ihn als Echo und erfährt, ob die Zahl größer oder kleiner als deine ist. Dir verrät er es nicht.',
  'Ich kann jeden Laut nachmachen! 🐦', 'Echo-echo… Ich weiß es!', 'Das Echo verrät es mir — nah!', 'Oh, du hast mich nachgemacht!', 'Ein Echo des Sieges!', 'Das Echo ist verklungen…')
b('Der Maestro Notenschlüssel', 'Pause', 'Beim fünften Zug der Runde hebt er den Taktstock: Pause! Du erstarrst und setzt einen Zug aus.',
  'Crescendo', 'Wirst du wärmer, spielt das Orchester lauter: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Orchester, wir beginnen! 👑', 'Pause! Erstarre!', 'Crescendo! Zwei Züge hintereinander!', 'Das Finale ist nah!', 'Oh, du führst die Melodie!', 'Bravo, Maestro!', 'Das Konzert ist vorbei…')

# 28 · Berggipfel (die ganze Welt hat Minuszahlen)
r('Yak Zottel', 'Warmes Fell', 'Nach deinem ersten Zug wärmt er dich mit seinem Fell und setzt seinen Zug aus.',
  'Mein Fell hält sogar in den Bergen warm! 🐂', 'Wärm dich auf! Ich setze aus.', 'Ich stapfe zum Ziel!', 'Du kletterst schneller!', 'Ein zotteliger Sieg!', 'Ich geh ein bisschen Gras kauen…')
r('Murmeltier Pfeifer', 'Winterschlaf', 'Ist es „Sehr heiß“ oder näher, schläft es ein und setzt seinen Zug aus. Einmal pro Runde.',
  'Ich schlafe so gern! 😴', 'Chrr… Ich setze aus…', 'Oh, ich bin wach — nah!', 'Du lässt mich nicht schlafen!', 'Als Sieger aufgewacht!', 'Ich schlafe weiter…')
r('Bergschaf Schnörkel', 'Kopfstoß', 'Beim zweiten Zug der Runde stößt es mit den Hörnern: Du erstarrst und setzt einen Zug aus.',
  'Schau dir meine Hörner an! 🐏', 'Bumm! Erstarre!', 'Ich springe über Felsen zum Ziel!', 'Oh, du bist so stur wie ich!', 'Ein gehörnter Sieg!', 'Ich bin gegen einen Felsen gerannt…')
r('Edelweiß Flöckchen', 'Bergblume', 'Beim vierten Zug der Runde blüht es auf und verrät dir, in welcher Hälfte die Zahl liegt.',
  'Ich wachse ganz oben! ❄️', 'Aufgeblüht! Die Zahl ist {k}!', 'Ich strecke mich zur Sonne — nah!', 'Du bist so hoch geklettert!', 'Ein blühender Sieg!', 'Ich bin verwelkt…')
r('Bernhardiner Fässchen', 'Retter', f'Beim vierten Zug der Runde eilt er zu Hilfe: Er schenkt dir einen {K}.',
  'Ich rette alle, die sich verirren! 🛟', 'Wuff! Hier, ein „⚡ +1 Zug“!', 'Ich schnuppere — das Ziel ist nah!', 'Du hast den Weg selbst gefunden!', 'Ein Rettersieg!', 'Ich rette jetzt die anderen…')
r('Chinchilla Flaum', 'Flauschiger Schwanz', f'Ist es „Warm“ oder näher, wedelt es mit seinem flauschigen Schwanz und löscht deinen {K}. Einmal pro Runde.',
  'Ich bin das flauschigste von allen! 🐭', 'Fuuh! Dein „⚡“ ist aus!', 'Flausch-flausch — nah!', 'Oh, du hast es fast gefunden!', 'Ein flauschiger Sieg!', 'Ich wälze mich jetzt im Staub…')
r('Alpendohle Rußi', 'Glitzerding', f'Mit ihrem ersten Zug schnappt sie sich deinen glänzenden {K}.',
  'Ich liebe alles, was glänzt! 💍', 'Glänzt! Der „⚡“ gehört mir!', 'Ich sehe das Ziel glänzen!', 'Oh, du hast scharfe Augen!', 'Ein glänzender Sieg!', 'Ich fliege auf einen Felsen…')
r('Schneeball Lawine', 'Lawine', f'Ist er „Sehr heiß“ oder näher, rollt er als Lawine los: {LAVA}. Einmal pro Runde.',
  'Ich bin klein, aber ich kann zur Lawine werden! ⛄', 'Lawine! Ein wilder Wurf!', 'Ich rolle direkt zum Ziel!', 'Oh, gleich schmelze ich!', 'Ein Schneesieg!', 'Ich bin geschmolzen…')
r('Seilbahn Gondi', 'Aussicht', 'Ist sie „Sehr heiß“ oder näher, fährt sie höher und verrät dir von oben, ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Ich bringe dich ganz nach oben! 🚡', 'Von oben sieht man es: Die Zahl ist {k}!', 'Ich komme am Ziel an!', 'Du fährst schneller hoch!', 'Gipfel erreicht!', 'Am Seil stecken geblieben…')
b('Der Schneeleopardenkönig', 'Schneesturm', f'Wirst du wärmer, entfacht er einen Schneesturm: {BLIND}. Einmal pro Runde.',
  'Blick vom Gipfel', 'Ist er „Warm“ oder näher, schaut er vom Gipfel und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Die Berge sind mein Reich! 👑', 'Schneesturm! Man sieht nichts!', 'Vom Gipfel sehe ich alles!', 'Ich schleiche zum Ziel!', 'Oh, du bist flink wie ein Leopard!', 'Ein königlicher Sprung!', 'Zurück in die Berge…')

# 29 · Roboterfabrik
r('Roboterhund Wuffbot', 'Schnüffelsensor', 'Beim zweiten Zug der Runde schaltet er seinen Sensor ein und erfährt, ob die Zahl größer oder kleiner als diese ist. Dir verrät er es nicht.',
  'Wuff-piep! Ich bin ein Roboterhund! 🐕', 'Piep-piep! Mein Sensor hat es verstanden!', 'Das Signal wird stärker!', 'Fehler! Du bist zu nah!', 'Sieg geladen!', 'Akku leer…')
r('Saugroboter Surri', 'Einsaugen', f'Beim zweiten Zug der Runde saugt er deinen {K} ein.',
  'Ich putze jeden Krümel weg! 🧹', 'Wusch! Dein „⚡“ ist in meinem Beutel!', 'Ich surre zum Ziel!', 'Oh, du arbeitest sauberer!', 'Ein sauberer Sieg!', 'Mein Beutel ist voll…')
r('Drohne Summi', 'Überflug', 'Beim vierten Zug der Runde überfliegt sie das Feld und verrät dir, ob die Zahl größer oder kleiner als diese ist.',
  'Ich sehe alles von oben! 🚁', 'Summ! Die Zahl ist {k}!', 'Ich setze zur Landung an!', 'Du fliegst genauso gut!', 'Landung — Sieg!', 'Mein Propeller ist müde…')
r('Magnet Klebi', 'Anziehung', f'Nach deinem ersten Zug zieht er deinen {K} zu sich.',
  'An mir bleibt alles kleben! 🧲', 'Kling! Der „⚡“ klebt an mir!', 'Mich zieht es zum Ziel!', 'Oh, du ziehst auch an!', 'Ein anziehender Sieg!', 'Ich bin entmagnetisiert…')
r('Batterie Zapp', 'Voll geladen', f'Zu Beginn der Runde lädt sie sich auf: einen {K} für sich.',
  'Zu hundert Prozent geladen! 🔋', 'Zapp! Geladen — ein „⚡“ für mich!', 'Die Ladung steigt — nah!', 'Oh, du bist auch voll geladen!', 'Ein geladener Sieg!', 'Ich bin leer…')
r('Roboterarm Greifi', 'Zugriff', 'Nach deinem zweiten Zug packt er dich: Du erstarrst und setzt einen Zug aus.',
  'Hallo! Gib mir fünf! 🦾', 'Zack! Erstarre!', 'Ich greife nach dem Ziel!', 'Oh, du rutschst mir weg!', 'Ein eiserner Griff!', 'Meine Gelenke klemmen…')
r('3D-Drucker Druckli', 'Druck', 'Mit seinem dritten Zug druckt er sich einen Tipp: ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht.',
  'Ich drucke alles, was du willst! 🖨️', 'Brrr-brrr… Ich weiß, ob sie gerade ist!', 'Ich drucke die Antwort!', 'Oh, mein Papier geht aus!', 'Ich habe den Sieg gedruckt!', 'Keine Tinte mehr…')
r('Blechdose Klapper', 'Klappertausch', 'Wird sie wärmer — klapper! —, tauscht sie mit dir die „⚡ +1 Zug“: Deine gehen an sie, ihre an dich. Einmal pro Runde.',
  'Klapper-klapper, ich bin ein Dosenroboter! 🥫', 'Klapper! Wir tauschen die „⚡“!', 'Ich klappere zum Ziel!', 'Oh, du bist lauter als ich!', 'Ein blecherner Sieg!', 'Ich habe eine Delle…')
r('Einradroboter Balanci', 'Beschleunigen', 'Beim dritten Zug der Runde beschleunigt er auf seinem Rad: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Ich balanciere auf einem Rad! 🛞', 'Brumm! Zwei Züge hintereinander!', 'Ich rolle zum Ziel!', 'Oh, wirf mich nicht um!', 'Eine siegreiche Kurve!', 'Ich bin umgekippt…')
b('Der Megabot-König', 'Störsignal', f'Mit seinem zweiten Zug schaltet er ein Störsignal ein: {FOG}.',
  'Aufladen', f'Wird er wärmer, lädt er sich auf: einen {K} für sich. Einmal pro Runde.',
  'Ich bin der Chef der Fabrik! 👑', 'Schhh! Störsignal!', 'Aufgeladen — ein „⚡“ für mich!', 'Meine Berechnung ist fast fertig!', 'Fehler! Du bist zu schlau!', 'Sieg programmiert!', 'Neustart…')

# 30 · Welt der Mythen
r('Zentaurenfohlen Huf', 'Treffsicherer Pfeil', 'Mit seinem ersten Zug schießt es einen Pfeil und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät es es nicht.',
  'Ich bin halb Pony! 🏹', 'Sirr! Mein Pfeil hat es herausgefunden!', 'Ich ziele — nah!', 'Oh, du zielst besser!', 'Volltreffer!', 'Daneben…')
r('Zerberus Drilling', 'Drei Köpfe', 'Bei jedem dritten seiner Züge streiten seine drei Köpfe — und er zieht sofort noch einmal.',
  'Wuff! Wuff! Wuff! Wir sind zu dritt! 🐶', 'Drei Köpfe — noch ein Zug!', 'Alle drei Nasen riechen das Ziel!', 'Oh, du bist schlauer als drei Köpfe!', 'Ein dreifacher Sieg!', 'Alle drei Köpfe sind müde…')
r('Zyklop Guckauge', 'Ein Auge', 'Wirst du wärmer, schaut er mit seinem großen Auge und sieht, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich habe nur ein Auge, aber was für eins! 👁️', 'Ich sehe es! Ich kenne die Hälfte!', 'Mein Auge sieht das Ziel!', 'Oh, du hast scharfe Augen!', 'Ein einäugiger Sieg!', 'Ich habe geblinzelt…')
r('Kleine Meerjungfrau Welle', 'Große Welle', f'Bist du „Kalt“ oder weiter weg, lässt sie eine Welle aufsteigen: {FOG_F}. Einmal pro Runde.',
  'Schwimmen wir zusammen? 🧜', 'Platsch! Die Welle hat alles versteckt!', 'Ich schwimme zum Ziel!', 'Oh, du schwimmst wie ein Fisch!', 'Ein Meeressieg!', 'Ich schwimme in die Tiefe…')
r('Faun Flöti', 'Zauberflöte', 'Nach deinem zweiten Zug spielt er auf seiner Flöte — du hörst so gebannt zu, dass du einen Zug aussetzt.',
  'Hör dir meine Flöte an! 🐐', 'Tirili! Setz aus!', 'Die Melodie führt zum Ziel!', 'Oh, du bist nicht stehen geblieben!', 'Ein zauberhafter Sieg!', 'Meine Flöte ist verstummt…')
r('Dschinn Wunderlich', 'Wunsch', f'Du schaltest deinen {K} ein — der Dschinn erfüllt sich seinen eigenen Wunsch: Dein „⚡“ geht an ihn, und du ziehst nicht doppelt. Einmal pro Runde.',
  'Wünsch dir was! 🧞', 'Wunsch erfüllt — der „⚡“ gehört mir!', 'Ein Wunder ist nah!', 'Oh, du bist selbst ein Zauberer!', 'Ein wundersamer Sieg!', 'Zurück in die Lampe…')
r('Widder Vlies', 'Goldenes Vlies', f'Beim fünften Zug der Runde funkelt sein Vlies: einen {K} für ihn.',
  'Meine Wolle ist aus purem Gold! 🐑', 'Funkel! Ein „⚡“ für mich!', 'Mein Vlies glänzt — nah!', 'Oh, du suchst wie ein Held!', 'Ein goldener Sieg!', 'Mein Vlies glänzt nicht mehr…')
r('Kobold Kleeblatt', 'Goldtopf', f'Beim vierten Zug der Runde versteckt er deinen {K} in seinem Topf.',
  'Suchst du mein Gold? 💰', 'Hopp! Der „⚡“ kommt in meinen Topf!', 'Das Glück ist auf meiner Seite!', 'Oh, du hast Glück!', 'Ein glücklicher Sieg!', 'Mein Glück ist mir entwischt…')
r('Kitsune Neunschweif', 'Neun Schwänze', f'Ist sie „Warm“ oder näher, wedelt sie mit ihren neun Schwänzen: {BLIND}. Einmal pro Runde.',
  'Ich habe ganze neun Schwänze! 🦊', 'Schwanzzauber! Wo sind deine Züge?', 'Ich spüre das Ziel!', 'Oh, dich kann man nicht täuschen!', 'Ein listiger Sieg!', 'Ich laufe in den Wald…')
b('Der Minotauruskönig', 'Labyrinth', f'Nach deinem zweiten Zug führt er dich ins Labyrinth: {MEM}.',
  'Stierangriff', 'Mit seinem ersten Zug stürmt er drauflos: Du erstarrst und setzt einen Zug aus.',
  'Willkommen in meinem Labyrinth! 👑', 'Labyrinth! Was war vorher?', 'Muuh! Erstarre!', 'Der Ausgang ist ganz nah!', 'Oh, du hast den Faden gefunden!', 'Ein Sieg im Labyrinth!', 'Ich habe mich selbst verirrt…')

# 31 · Herbstwald
r('Streifenhörnchen Pausback', 'Nüsse teilen', f'Nach deinem dritten Zug teilt es seinen Vorrat: dir und sich je einen {K}.',
  'Meine Backen sind voller Nüsse! 🐿️', 'Ich teile! Ein „⚡ +1 Zug“ für alle!', 'Eine Nuss gefunden — nah!', 'Oh, du sammelst schneller!', 'Ein nussiger Sieg!', 'Ich fülle meinen Vorrat auf…')
r('Specht Klopfer', 'Klopf-klopf', 'Beim zweiten Zug der Runde klopft er an einen Stamm und verrät dir, in welcher Hälfte die Zahl liegt.',
  'Klopf-klopf! Wer ist da? 🪵', 'Klopf-klopf! Die Zahl ist {k}!', 'Ich klopfe immer näher!', 'Oh, du hörst jedes Klopfen!', 'Ein klopfender Sieg!', 'Mein Schnabel ist müde…')
r('Ahornblatt Purpur', 'Fallendes Blatt', 'Wird es wärmer, fällt es und verrät dir, ob die Zahl größer oder kleiner als seine ist. Einmal pro Runde.',
  'Ich bin das röteste im ganzen Wald! 🍁', 'Raschel! Die Zahl ist {k}!', 'Der Wind trägt mich zum Ziel!', 'Oh, du wirbelst schneller!', 'Ein Herbstsieg!', 'Ich fliege mit dem Wind davon…')
r('Baummarder Pelzchen', 'Flinke Pfoten', f'Beim dritten Zug der Runde schnappt er sich flink deinen {K}.',
  'Schau dir meinen Pelzmantel an! 🧣', 'Schnapp! Der „⚡“ gehört mir!', 'Ich schleiche zum Ziel!', 'Oh, du bist flink!', 'Ein Sieg auf Samtpfoten!', 'Ich flitze auf einen Baum…')
r('Frischling Wühler', 'Wühlen', 'Mit seinem dritten Zug wühlt er sich ins Laub und setzt seinen Zug aus.',
  'Grunz! Ich finde Eicheln unter dem Laub! 🐗', 'Ich wühle… ich setze aus.', 'Grunz! Ich rieche das Ziel!', 'Oh, du wühlst schneller!', 'Ein grunzender Sieg!', 'Ich wühle mich ins Laub…')
r('Eichelhäher Schwätzer', 'Geschwätz', 'Er schwatzt ohne Pause — deinen zweiten Zug siehst du nicht.',
  'Krr-krr! Ich erzähle es dem ganzen Wald! 🪶', 'Krr-krr! Wo ist dein Zug hin?', 'Krr — nah!', 'Oh, du lässt dich nicht ablenken!', 'Ein schwatzhafter Sieg!', 'Ich schwatze jetzt in einem anderen Wald…')
r('Kastanie Glanz', 'Herausgerollt', 'Bist du „Kalt“ oder weiter weg, rollt sie aus ihrer stacheligen Schale und verrät dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Ich glänze wie poliert! 🌰', 'Plumps! Die Zahl ist {k}!', 'Ich rolle zum Ziel!', 'Oh, du hast mich gefunden!', 'Ein Kastaniensieg!', 'Ich verstecke mich in meinen Stacheln…')
r('Stinktier Puschel', 'Pfui!', 'Mit seinem dritten Zug — pfui! Du hältst dir die Nase zu und setzt einen Zug aus.',
  'Ich bin süß — erschreck mich nur nicht! 🦨', 'Pfui! Setz aus!', 'Oh, nah!', 'Oh, erschreck mich nicht!', 'Ein duftender Sieg!', 'Ich laufe weg…')
r('Opossum Baumel', 'Totstellen', 'Ist es „Glühend“, tut es so, als ob es schläft, und setzt seinen Zug aus. Einmal pro Runde.',
  'Ich hänge so gern kopfüber! 💤', 'Ich schlafe… ich setze aus.', 'Oh, ich bin wach — nah!', 'Du hast mich geweckt!', 'Ein baumelnder Sieg!', 'Ich stelle mich schlafend…')
b('Der Elchkönig', 'Trompetenruf', 'Beim dritten Zug der Runde röhrt er durch den ganzen Wald: Du erstarrst und setzt einen Zug aus.',
  'Waldweisheit', 'Ist er „Warm“ oder näher, lauscht er dem Wald und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich bin der König des Herbstwaldes! 👑', 'Tröö-öö! Erstarre!', 'Der Wald hat es mir verraten — ich kenne die Hälfte!', 'Der Wald flüstert — nah!', 'Oh, du kennst den Wald besser als ich!', 'Ein Sieg im Blätterregen!', 'Zurück ins Dickicht…')

# 32 · Zauberküche
r('Teekanne Pfeifi', 'Pfeife', 'Ist sie „Sehr heiß“ oder näher, pfeift sie und verrät dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Möchtest du Tee? 🫖', 'Fiiiep! Die Zahl ist {k}!', 'Ich koche — nah!', 'Oh, du bist heißer als ich!', 'Ein kochend heißer Sieg!', 'Ich bin abgekühlt…')
r('Pfanne Brutzel', 'Es brutzelt', f'Bist du „Sehr heiß“ oder näher, brutzelt und spritzt sie: {LAVA}. Einmal pro Runde.',
  'Ich brate dir ein Spiegelei! 🍳', 'Zisch! Ein wilder Wurf!', 'Ich werde heiß — nah!', 'Oh, heiß-heiß-heiß!', 'Ein brutzelnder Sieg!', 'Ich bin angebrannt…')
r('Pfannkuchen Butterli', 'Erster Pfannkuchen', f'Der erste Pfannkuchen ist für dich: Mit seinem ersten Zug schenkt er dir einen {K}.',
  'Mein erster Pfannkuchen ist perfekt! 🥞', 'Hier, ein „⚡ +1 Zug“ — mit Butter!', 'Ich werde goldbraun — nah!', 'Oh, du backst schneller!', 'Ein buttriger Sieg!', 'Ich bin missraten…')
r('Schneebesen Quirl', 'Alles aufschlagen!', 'Jeden vierten Zug der Runde versucht er, alles aufzuschlagen: Er tauscht mit dir die „⚡ +1 Zug“ — deine an ihn, seine an dich. Einmal pro Runde.',
  'Ich schlage alles zu Schaum! 🥄', 'Quirl-quirl! Wir tauschen die „⚡“!', 'Ich quirle — nah!', 'Oh, dir gelingt alles!', 'Ein schaumiger Sieg!', 'Der Schaum ist zusammengefallen…')
r('Toaster Röstli', 'Toast ist fertig', 'Beim fünften Zug der Runde springt ein Toast heraus und verrät dir, ob die Zahl größer oder kleiner als diese ist.',
  'Ding! Der Toast ist fertig! 🍞', 'Ding! Die Zahl ist {k}!', 'Ich röste — nah!', 'Oh, du bist heiß wie ein Toast!', 'Ein knuspriger Sieg!', 'Ich bin verbrannt…')
r('Salzstreuer Prise', 'Verschüttet', f'Nach deinem dritten Zug verschüttet er Salz und verliert seinen eigenen {K}.',
  'Eine Prise Salz, und es schmeckt! 🧂', 'Hoppla, ich habe meinen „⚡“ verschüttet!', 'Salzig — nah!', 'Oh, du hast nicht versalzen!', 'Ein salziger Sieg!', 'Ich bin ganz verschüttet…')
r('Ei Dotter', 'In der Schale', 'Mit seinem ersten Zug versteckt es sich in seiner Schale: Du siehst diesen Zug nicht.',
  'Klopf-klopf, ich bin ein Ei! 🥚', 'In der Schale versteckt!', 'Gleich schlüpfe ich — nah!', 'Oh, zerbrich mich nicht!', 'Ein hartgekochter Sieg!', 'Ich habe einen Sprung…')
r('Brokkoli Kraus', 'Wachsen', f'Beim sechsten Zug der Runde wächst er ein Stück: einen {K} für sich.',
  'Iss dein Gemüse, dann wirst du stark! 🥦', 'Gewachsen — ein „⚡“ für mich!', 'Ich wachse zum Ziel!', 'Oh, du bist stark — isst du Gemüse?', 'Ein gesunder Sieg!', 'Ich bin gelb geworden…')
r('Teigtasche Zwick', 'Zwicken', 'Wirst du kälter, zwickt sie ihre Ränder zu und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät sie es nicht. Einmal pro Runde.',
  'Ich habe die leckerste Füllung! 🥟', 'Zugezwickt — ich weiß, ob sie gerade ist!', 'Ich koche — nah!', 'Oh, du hast mich gefunden!', 'Ein dampfender Sieg!', 'Ich bin zerkocht…')
b('Die Ofenkönigin', 'Ofenhitze', f'Beim zweiten Zug der Runde atmet sie Hitze aus: {LAVA}.',
  'Piroggen', f'Ist sie „Glühend“, backt sie eine Pirogge: einen {K} für sich. Einmal pro Runde.',
  'Setz dich, nimm ein paar Piroggen! 👑', 'Hitze! Ein wilder Wurf!', 'Eine Pirogge — ein „⚡“ für mich!', 'Die Piroggen sind fast fertig!', 'Oh, du backst besser als ich!', 'Ein goldbrauner Sieg!', 'Das Feuer ist aus…')

# 33 · Atlantis (die ganze Welt hat Minuszahlen)
r('Delfin Springer', 'Pfeiftipp', 'Nach deinem dritten Zug pfeift er und verrät dir, ob die Zahl größer oder kleiner als deine ist.',
  'Pfiii-pfiii! Spielen wir in den Wellen? 🐬', 'Pfiii! Die Zahl ist {k}!', 'Ich schwimme zum Ziel!', 'Oh, du schwimmst wie ein Delfin!', 'Ein Delfinsieg!', 'Ich tauche tiefer…')
r('Mantarochen Segel', 'Flügelsegel', 'Beim fünften Zug der Runde deckt er diesen Zug mit seinen Flügeln zu: Du siehst ihn nicht.',
  'Ich gleite unter Wasser! ⛵', 'Flapp! Der Zug ist unter meinem Flügel!', 'Ich gleite zum Ziel!', 'Oh, du schwimmst schneller!', 'Ein schwebender Sieg!', 'Ich schwimme weit weg…')
r('Kugelfisch Pustebacke', 'Aufgeblasen', 'Ist er „Warm“ oder näher, bläst er sich zur Kugel auf: Du erstarrst und setzt einen Zug aus. Einmal pro Runde.',
  'Keine Angst, meine Stacheln sind weich! 🐡', 'Puff! Erstarre!', 'Ich platze vor Freude — nah!', 'Oh, gleich geht mir die Luft aus!', 'Ein stacheliger Sieg!', 'Mir ist die Luft ausgegangen…')
r('Muschel Flüster', 'Meeresflüstern', 'Nach deinem zweiten Zug flüstert sie dir zu, ob die Zahl gerade oder ungerade ist.',
  'Halt mich an dein Ohr! 🐚', 'Hör aufs Meer: Die Zahl ist {k}!', 'Das Meer flüstert — nah!', 'Oh, du hörst das Meer!', 'Ein perlmuttfarbener Sieg!', 'Ich klappe zu…')
r('Sepia Tinte', 'Tinte', f'Mit ihrem dritten Zug spritzt sie Tinte: {FOG_F}.',
  'Ich kann meine Farbe wechseln! 🦑', 'Pfff! Tinte!', 'Ich schleiche mich ans Ziel!', 'Oh, du hast mich entdeckt!', 'Ein tintiger Sieg!', 'Ich schwimme in den Schatten…')
r('Nautilus Spirali', 'Spirale', 'Wird er wärmer, rollt er sich zur Spirale und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Meine Vorfahren schwammen schon mit den Dinosauriern! 🌀', 'Eingerollt — ich weiß es!', 'Ich drehe mich zum Ziel!', 'Oh, du bist weise wie das Meer!', 'Ein uralter Sieg!', 'Ich verstecke mich in meinem Gehäuse…')
r('Seekuh Sachte', 'Nickerchen', 'Beim vierten Zug der Runde nickt sie ein und setzt ihren Zug aus.',
  'Ich bin die Ruhigste im Meer! 🦭', 'Ich döse… ich setze aus.', 'Oh, ich bin wach — nah!', 'Oh, du bist so flink!', 'Ein stiller Sieg!', 'Ich gehe Seegras knabbern…')
r('Papageifisch Koralle', 'Happs!', f'Mit seinem zweiten Zug beißt er ein Stück ab: Dein {K} geht an ihn.',
  'Ich knabbere Korallen! 🐠', 'Happs! Der „⚡“ gehört mir!', 'Das Ziel liegt direkt vor mir!', 'Oh, du bist ein schneller Fisch!', 'Ein Korallensieg!', 'Ich verstecke mich in den Korallen…')
r('Schwertfisch Degen', 'Ausfall', 'Bist du „Sehr heiß“ oder näher, macht er einen Ausfall und erfährt, ob die Zahl größer oder kleiner als deine ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich beschütze Atlantis! 🗡️', 'Ausfall! Ich weiß es!', 'Mitten ins Ziel!', 'Oh, du fechtest besser!', 'Touché — Sieg!', 'Mein Degen ist stumpf…')
b('König Neptun', 'Meerestiefe', f'Wirst du wärmer, deckt er dich mit einer Welle zu: {MEM}. Einmal pro Runde.',
  'Flut', 'Ist er „Warm“ oder näher, lässt er die Flut steigen: Du setzt einen Zug aus. Einmal pro Runde.',
  'Ich bin der Herrscher von Atlantis! 👑', 'Die Tiefe! Was war vorher?', 'Flut! Setz aus!', 'Mein Dreizack spürt das Ziel!', 'Oh, du hast Atlantis gefunden!', 'Ein Sieg des Meeresherrschers!', 'Atlantis versinkt…')

# 34 · Traumland
r('Baku Süßtraum', 'Traumfresser', f'Nach deinem vierten Zug frisst er einen Traum: {MEM}.',
  'Ich fresse nur böse Träume! 🐘', 'Happs! Was war vorher?', 'Es duftet nach süßem Sieg!', 'Oh, du schläfst nicht?!', 'Ein süßer Sieg!', 'Ich mache ein Nickerchen…')
r('Kissen Kuschli', 'Weiches Kissen', 'Beim sechsten Zug der Runde schläft es selbst ein — es setzt seinen Zug aus.',
  'Nimm mich in den Arm! 🛏️', 'Gähn… ich setze aus.', 'Oh, ich bin nicht müde — nah!', 'Oh, du bist hellwach!', 'Ein weicher Sieg!', 'Ich schlafe…')
r('Nachtlicht Leuchti', 'Nachtlicht', 'Beim dritten Zug der Runde leuchtet es im Dunkeln und sieht, in welcher Hälfte die Zahl liegt. Dir verrät es es nicht.',
  'Hab keine Angst im Dunkeln — ich bin da! 🌙', 'Angeleuchtet — ich kenne die Hälfte!', 'Mein Licht kommt dem Ziel näher!', 'Oh, siehst du im Dunkeln?', 'Ein strahlender Sieg!', 'Ich bin ausgegangen…')
r('Siebenschläfer Döser', 'Gähnen', 'Nach deinem ersten Zug gähnt er so süß, dass du einschläfst und einen Zug aussetzt.',
  'Gäääähn… 🥱', 'Uaaah… Schlaf, setz aus!', 'Im Traum sehe ich das Ziel!', 'Oh, du gähnst ja gar nicht!', 'Ein verschlafener Sieg!', 'Ich träume weiter…')
r('Ole Schirmchen', 'Zauberschirm', f'Bist du „Sehr heiß“ oder näher, spannt er seinen Traumschirm über dir auf: {BLIND}. Einmal pro Runde.',
  'Ich spanne meinen Schirm auf — du träumst ein Märchen! ☂️', 'Süße Träume! Wo sind deine Züge?', 'Das Märchen ist bald zu Ende — nah!', 'Oh, du schläfst nicht!', 'Ein märchenhafter Sieg!', 'Mein Schirm ist zugeklappt…')
r('Fledermaus Flatter', 'Echo in der Nacht', 'Ist sie „Sehr heiß“ oder näher, lauscht sie dem Echo und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät sie es nicht. Einmal pro Runde.',
  'Nachts höre ich alles! 🦇', 'Piep! Ich kenne die Hälfte!', 'Ich höre das Ziel!', 'Oh, du fliegst so leise!', 'Ein nächtlicher Sieg!', 'Ich hänge mich kopfüber zum Schlafen…')
r('Traumfänger Netz', 'Träume fangen', f'Nach deinem dritten Zug fängt er deinen {K} in seinem Netz.',
  'Ich fange böse Träume! 🕸️', 'Den „⚡“ gefangen! Jetzt gehört er mir!', 'Der Traum ist fast gefangen!', 'Oh, du bist durchgeschlüpft!', 'Ein gefangener Sieg!', 'Mein Netz ist gerissen…')
r('Hausschuh Schlurf', 'Warme Hausschuhe', 'Bist du „Kalt“ oder weiter weg, wärmt er dir die Füße: Du ziehst sofort noch einmal. Einmal pro Runde.',
  'Schlurf-schlurf, ich bin ein Hausschuh! 🥿', 'Schlurf! Zieh noch mal!', 'Ich schlurfe zum Ziel!', 'Oh, du schlurfst schneller!', 'Ein Hausschuhsieg!', 'Unters Bett gerutscht…')
r('Kater Bajun', 'Schlaflied', f'Beim vierten Zug der Runde schnurrt er ein Schlaflied: {LAVA}.',
  'Ich erzähle dir eine Geschichte… 🐈', 'Schnurr… Ein verschlafener wilder Wurf!', 'Die Geschichte ist gleich zu Ende — nah!', 'Oh, dich kann man nicht einschläfern!', 'Ein schnurrender Sieg!', 'Ich lege mich an den Ofen…')
b('Die Mondkönigin', 'Nacht', f'Mit ihrem ersten Zug ruft sie die Nacht: {FOG_F}.',
  'Sternschnuppe', f'Bist du „Glühend“, fängt sie eine Sternschnuppe: einen {K} für sich. Einmal pro Runde.',
  'Gute Nacht, Kleines! 👑', 'Die Nacht ist da!', 'Eine Sternschnuppe — ein „⚡“ für mich!', 'Die Sterne verraten es mir — nah!', 'Oh, du strahlst heller als die Sterne!', 'Ein Sieg im Mondschein!', 'Der Morgen kommt…')

# 35 · Zwergenschmiede
r('Zwerg Hämmerchen', 'Hammerschlag', 'Mit seinem zweiten Zug schlägt er mit dem Hammer zu — bumm! — du setzt einen Zug aus.',
  'Klopf-klopf, ich schmiede! 🔨', 'Bumm! Setz aus!', 'Fast fertig geschmiedet!', 'Oh, du schmiedest schneller!', 'Ein geschmiedeter Sieg!', 'Mein Hämmerchen ist kaputt…')
r('Fackel Lodri', 'Erloschen!', f'Wirst du kälter, erlischt die Fackel: {BLIND}. Einmal pro Runde.',
  'Ich leuchte dir den Weg in die Mine! 🔥', 'Pff! Dunkel — wo sind deine Züge?', 'Ich lodere auf — nah!', 'Oh, du strahlst heller als ich!', 'Ein lodernder Sieg!', 'Ich brenne aus…')
r('Amboss Klong', 'Klong', 'Beim dritten Zug der Runde klingt er laut und erfährt, ob die Zahl größer oder kleiner als diese ist. Dir verrät er es nicht.',
  'Kling-klong, man hämmert auf mich! ⚒️', 'Klong! Ich weiß es!', 'Ich klinge immer lauter!', 'Oh, du bist härter als Eisen!', 'Ein eiserner Sieg!', 'Ich bin abgekühlt…')
r('Grubenlore Rumpel', 'Ab geht’s!', f'Mit ihrem dritten Zug fährt sie deinen {K} zu sich.',
  'Ich transportiere Edelsteine! 🛒', 'Rumpel-rumpel auf den Schienen — der „⚡“ gehört mir!', 'Ich fahre direkt zum Ziel!', 'Oh, du überholst mich!', 'Ein rasanter Sieg!', 'Ich bin entgleist…')
r('Blasebalg Puster', 'Rauch', f'Bist du „Sehr heiß“ oder näher, bläst er Rauch auf: {FOG}. Einmal pro Runde.',
  'Puff-puff, wir fachen das Feuer an! 💨', 'Puff! Alles voller Rauch!', 'Ich puste zum Ziel!', 'Oh, du bist heißer als Feuer!', 'Ein pustender Sieg!', 'Mir geht die Luft aus…')
r('Goldklumpen Glänzi', 'Goldglanz', 'Beim vierten Zug der Runde glänzt er und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht.',
  'Ich bin aus purem Gold! 🪙', 'Glanz — ich weiß, ob sie gerade ist!', 'Ich glänze immer heller!', 'Oh, du bist auf eine Goldader gestoßen!', 'Ein Goldklumpensieg!', 'Ich glänze nicht mehr…')
r('Hufeisen Glücki', 'Glücksbringer', f'Nach deinem zweiten Zug bringt es sich selbst Glück: einen {K} für sich.',
  'Ich bringe Glück! 🍀', 'Viel Glück — ein „⚡“ für mich!', 'Das Glück ist nah!', 'Oh, du hast auch Glück!', 'Das Hufeisen hat geholfen!', 'Mein Glück ist weg…')
r('Wikingerhelm Horni', 'Schlachtruf', 'Ist er „Glühend“, stößt er einen Schlachtruf aus: Du erstarrst und setzt einen Zug aus. Einmal pro Runde.',
  'Ich bin hart wie ein Fels! ⛑️', 'Hoho-ho! Erstarre!', 'Zum Angriff — das Ziel ist nah!', 'Oh, du bist mutig!', 'Ein Wikingersieg!', 'Ich habe eine Delle…')
r('Glocke Bimbam', 'Bimbam!', f'Mit ihrem ersten Zug läutet sie — bimbam! —: {LAVA}.',
  'Bim-bam, ich läute! 🔔', 'BIMBAM! Ein wilder Wurf!', 'Ich läute den Sieg ein!', 'Oh, du klingst lauter als ich!', 'Ein läutender Sieg!', 'Ich bin verstummt…')
b('Der Zwergenkönig', 'Unterwelt', f'Mit seinem zweiten Zug führt er dich unter die Erde: {MEM}.',
  'Schatzkammer', f'Beim zweiten Zug der Runde trägt er deinen {K} in seine Schatzkammer.',
  'Willkommen in meiner Schmiede! 👑', 'Unter der Erde! Was war vorher?', 'In die Schatzkammer — der „⚡“ gehört mir!', 'Der Schatz ist fast gefunden!', 'Oh, du hast meine Goldader gefunden!', 'Ein Sieg des Zwergenkönigs!', 'Tief in den Berg hinein…')
