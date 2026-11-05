WORLDS = ['Sumpfland', 'Fernes Zarenreich', 'Berggipfel', 'Roboterfabrik', 'Welt der Mythen',
          'Herbstwald', 'Tal der Pyramiden', 'Atlantis', 'Traumland', 'Zwergenschmiede']
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
r('Nerz Flink', 'Flinke Pfoten', 'Bist du „Kalt“ oder weiter weg, schnappt er sich flink deinen „⚡ +1 Zug“. Einmal pro Runde.',
  'Hihi, ich bin der Flinkste im Sumpf! 🦦', 'Geschnappt! Dein „⚡“ gehört jetzt mir!', 'Hihi, fast hab ich’s!', 'Du holst mich ein!', 'Flink! Ich gewinne!', 'Entwischt…')
r('Kaulquappe Zappel', 'Zappelgeschenk', f'Wirst du wärmer, zappelt sie zu dir und schenkt dir einen {K}. Einmal pro Runde.',
  'Bald werde ich ein Frosch! 🐸', 'Zappel! Hier, ein „⚡ +1 Zug“!', 'Ich schwimme zum Ziel!', 'Du schwimmst schneller!', 'Ein zappeliger Sieg!', 'Ich schwimme davon…')
r('Wasserläufer Gleiter', 'Kreise im Wasser', 'Wirst du wärmer, gleitet er übers Wasser, und die Kreise verraten dir, ob die Zahl größer oder kleiner als deine ist. Einmal pro Runde.',
  'Ich kann über Wasser laufen! 🦟', 'Schau auf die Kreise: Die Zahl ist {k}!', 'Ich gleite zum Ziel!', 'Oh, du bist schon nah!', 'Ein rutschiger Sieg!', 'Ich bin ausgerutscht…')
r('Nutria Platsch', 'Platsch!', f'Mit ihrem dritten Zug springt sie ins Wasser — die Spritzer löschen deinen {K}.',
  'Ich tauche so gern! 🦫', 'Platsch! Dein „⚡“ ist aus!', 'Ich paddle direkt zum Ziel!', 'Du schwimmst genauso gut!', 'Ein nasser Sieg!', 'Ich gehe mich trocknen…')
r('Kikimora Moosi', 'Sumpfzauber', f'Bist du „Warm“ oder näher, verwirrt sie dich: {LAVA}. Einmal pro Runde.',
  'Ich bin eine liebe Kikimora! 🍃', 'Zauber! Ein wilder Wurf!', 'Der Schlamm flüstert — nah!', 'Oh, dich kann man nicht verwirren!', 'Ein Sumpfsieg!', 'Zurück in den Schlamm…')
r('Biber Damm', 'Der Damm', 'Beim dritten Zug der Runde baut er seinen Damm fertig und schenkt dir und sich je einen „⚡ +1 Zug“.',
  'Ich baue die besten Dämme im Sumpf! 🦫', 'Der Damm ist fertig — ein „⚡ +1 Zug“ für jeden!', 'Ich baue mir den Weg zur Antwort!', 'Du bist über meinen Damm geschwommen!', 'Ein solider Sieg!', 'Der Damm ist gebrochen…')
r('Desman Rüssel', 'Feine Nase', 'Wird er wärmer, schnüffelt er mit seinem langen Rüssel und verrät dir, ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Meine Nase riecht alles! 👃', 'Schnupper-schnupper! Die Zahl ist {k}!', 'Ich rieche das Ziel!', 'Deine Nase ist so gut wie meine!', 'Meine Nase hatte recht!', 'Meine Nase ist zu…')
b('Der Sumpfkönig', 'Morast', 'Wirst du kälter, hält dich der Morast fest: Du erstarrst und setzt einen Zug aus. Einmal pro Runde.',
  'Seerose', f'Nach deinem ersten Zug pflückt er eine Seerose: einen {K} für sich.',
  'Ich bin der König des ganzen Sumpfes! 👑', 'Blubb-blubb! Erstarre!', 'Eine Seerose — ein „⚡“ für mich!', 'Der Sumpf verrät es mir — nah!', 'Oh, du hast meinen Palast erreicht!', 'Ein königlicher Sieg!', 'Zurück auf den Grund…')

# 27 · Fernes Zarenreich
r('Sirin Melodie', 'Prophetisches Lied', 'Wirst du kälter, singt sie ein prophetisches Lied und verrät dir, ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Hör mein Lied, Wanderer 🎶', 'Ich singe, ich singe: Die Zahl ist {k}!', 'Mein Lied führt mich zur Antwort!', 'Hörst du mein Lied?', 'Ein Siegeslied!', 'Das Lied ist aus…')
r('Das bucklige Pferdchen', 'Kluger Rat', 'Wird es wärmer, flüstert es dir einen Rat ins Ohr: in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Sei nicht traurig, ich helfe dir! 🐴', 'Mein Rat: {k}!', 'Ich galoppiere direkt zur Antwort!', 'Du bist mir dicht auf den Fersen!', 'Wieher! Ich gewinne!', 'Wieher… du gewinnst!')
r('Waldgeist Moosbart', 'Waldschatz', 'Ist er „Warm“ oder näher, findet er im Wald einen Schatz: einen „⚡ +1 Zug“ für sich. Einmal pro Runde.',
  'Hallo-o! Verlauf dich nicht in meinem Wald! 🌲', 'Ein Waldschatz — ein „⚡ +1 Zug“ für mich!', 'Der Wald rauscht — sehr heiß!', 'Du hast meinen geheimen Pfad gefunden!', 'Hallo! Der Wald gewinnt!', 'Ich habe mich verlaufen…')
r('Smei Gorynytsch', 'Drei Köpfe', 'Ist er „Glühend“, drängeln seine drei Köpfe einander: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Hallo! Hallo! Hallo! Das sind wir alle drei 🐉', 'Drei Köpfe in Eile — zwei Züge hintereinander!', 'Drei Köpfe wittern die Antwort!', 'Die Köpfe streiten — du bist nah!', 'Ein dreifacher Sieg!', 'Alle drei Köpfe sind traurig…')
r('Hausgeist Raschel', 'Hinter dem Ofen', 'Jeder zweite seiner Züge versteckt sich hinter dem Ofen: Du siehst ihn nicht.',
  'Raschel-raschel… ich bin hier, hinter dem Ofen 🏠', 'Raschel-raschel… dieser Zug ist hinter dem Ofen!', 'Raschel-raschel, ich bin nah!', 'Hast du hinter den Ofen geguckt?!', 'Raschel-raschel — ich gewinne!', 'Raschel… ich verstecke mich weiter weg.')
r('Feuervogel Goldfeder', 'Feuervogelfeder', 'Bist du „Sehr heiß“ oder näher, lässt er eine leuchtende Feder fallen: einen „⚡ +1 Zug“ für dich. Einmal pro Runde.',
  'Meine Feder strahlt heller als die Sonne! 🔥', 'Fang die Feder — einen „⚡ +1 Zug“!', 'Ich leuchte direkt neben der Antwort!', 'Fast hättest du den Feuervogel gefangen!', 'Ein leuchtender Sieg!', 'Ich fliege davon, hinter die sieben Berge…')
r('Falke Finist', 'Scharfer Blick', 'Mit seinem dritten Zug blickt er von oben herab und verrät dir, ob die Zahl größer oder kleiner als seine ist.',
  'Von oben sehe ich alles! 🦅', 'Von hier oben sehe ich: Sie ist {k}!', 'Ein klarer Blick — der richtige Weg!', 'Deine Augen sind schärfer als meine!', 'Ein Sieg von oben!', 'Ich fliege davon… du gewinnst.')
r('Baba Jaga', 'Der Mörser', 'Du schaltest deinen „⚡ +1 Zug“ ein — die Jaga steigt in ihren Mörser: Beim nächsten Mal zieht sie zweimal hintereinander. Einmal pro Runde.',
  'Willkommen, Gast! Keine Angst — heute bin ich lieb 🧹', 'Flieg, Mörser! Zwei Züge hintereinander!', 'Ich rieche es — die Antwort ist nah!', 'Ei, was für ein flinker Gast!', 'Hehe! Die Oma gewinnt!', 'Na gut, junger Held, du gewinnst!')
r('Die Froschprinzessin', 'Verzauberung', 'Nach deinem ersten Zug spricht sie einen Zauber und erfährt, ob die Zahl größer oder kleiner als deine ist. Dir verrät sie es nicht.',
  'Quak! Ich bin eine verzauberte Prinzessin 🐸', 'Quak! Mein Zauber hat das Geheimnis gelüftet!', 'Quak! Der Zauber wirkt!', 'Hast du meinen Zauber gebrochen?!', 'Quak! Ein königlicher Sieg!', 'Quak… der Zauber ist gebrochen.')
b('Koschtschei der Unsterbliche', 'Eisiger Blick', 'Beim fünften Zug der Runde wirft er dir einen eisigen Blick zu: Du erstarrst und setzt einen Zug aus.',
  'Unsterbliche Eile', 'Wirst du wärmer, beeilt er sich: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Ich bin Koschtschei der Unsterbliche — mich besiegt keiner! 👑', 'Erstarre! Setz einen Zug aus!', 'Ha! Zwei Züge hintereinander!',
  'Meine Nadel ist gut versteckt!', 'Hast du etwa meine Nadel gefunden?!', 'Ein unsterblicher Sieg! 👑', 'Du hast meine Nadel gefunden… du gewinnst.')

# 28 · Berggipfel (die ganze Welt hat Minuszahlen)
r('Yak Zottel', 'Warmes Fell', 'Nach deinem ersten Zug wärmt er dich mit seinem Fell und setzt seinen Zug aus.',
  'Mein Fell hält sogar in den Bergen warm! 🐂', 'Wärm dich auf! Ich setze aus.', 'Ich stapfe zum Ziel!', 'Du kletterst schneller!', 'Ein zotteliger Sieg!', 'Ich geh ein bisschen Gras kauen…')
r('Murmeltier Pfeifer', 'Winterschlaf', 'Ist es „Sehr heiß“ oder näher, schläft es ein und setzt seinen Zug aus. Einmal pro Runde.',
  'Ich schlafe so gern! 😴', 'Chrr… Ich setze aus…', 'Oh, ich bin wach — nah!', 'Du lässt mich nicht schlafen!', 'Als Sieger aufgewacht!', 'Ich schlafe weiter…')
r('Bergschaf Schnörkel', 'Kopfstoß', 'Beim zweiten Zug der Runde stößt es mit den Hörnern: Du erstarrst und setzt einen Zug aus.',
  'Schau dir meine Hörner an! 🐏', 'Bumm! Erstarre!', 'Ich springe über Felsen zum Ziel!', 'Oh, du bist so stur wie ich!', 'Ein gehörnter Sieg!', 'Ich bin gegen einen Felsen gerannt…')
r('Pfeifhase Heuhaufen', 'Bergpfiff', 'Beim vierten Zug der Runde pfeift er einen Tipp: in welcher Hälfte die Zahl liegt.',
  'Iiep-iiep! Ich trockne Heu für den Winter 🌾', 'Iiep-iiep! Tipp: {k}!', 'Iiep! Sehr heiß!', 'Du bist an meinem Heuhaufen!', 'Iiep-iiep — ich gewinne!', 'Iiep… du gewinnst.')
r('Bernhardiner Fässchen', 'Retter', f'Beim vierten Zug der Runde eilt er zu Hilfe: Er schenkt dir einen {K}.',
  'Ich rette alle, die sich verirren! 🛟', 'Wuff! Hier, ein „⚡ +1 Zug“!', 'Ich schnuppere — das Ziel ist nah!', 'Du hast den Weg selbst gefunden!', 'Ein Rettersieg!', 'Ich rette jetzt die anderen…')
r('Chinchilla Flaum', 'Flauschiger Schwanz', f'Ist es „Warm“ oder näher, wedelt es mit seinem flauschigen Schwanz und löscht deinen {K}. Einmal pro Runde.',
  'Ich bin das flauschigste von allen! 🐭', 'Fuuh! Dein „⚡“ ist aus!', 'Flausch-flausch — nah!', 'Oh, du hast es fast gefunden!', 'Ein flauschiger Sieg!', 'Ich wälze mich jetzt im Staub…')
r('Alpendohle Rußi', 'Glitzerding', f'Mit ihrem ersten Zug schnappt sie sich deinen glänzenden {K}.',
  'Ich liebe alles, was glänzt! 💍', 'Glänzt! Der „⚡“ gehört mir!', 'Ich sehe das Ziel glänzen!', 'Oh, du hast scharfe Augen!', 'Ein glänzender Sieg!', 'Ich fliege auf einen Felsen…')
r('Steinbock Kletterer', 'Steinschlag', 'Ist er „Sehr heiß“ oder näher, tritt er Steine los: Dein nächster Zug geschieht von selbst — ein wilder Wurf. Einmal pro Runde.',
  'Mäh-äh! Ich springe auf die steilsten Felsen! 🐐', 'Mäh-äh! Steinschlag — dein Zug fliegt davon!', 'Mäh-äh! Fast am Gipfel!', 'Kletterst du auf meinen Felsen?!', 'Mäh-äh! Der Gipfel gehört mir!', 'Ausgerutscht… mäh-äh.')
r('Bartgeier Scharfblick', 'Gipfelblick', 'Ist er „Sehr heiß“ oder näher, blickt er vom Gipfel herab und verrät dir, ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Von hier oben ist alles glasklar! 🦅', 'Vom Gipfel sehe ich: Die Zahl ist {k}!', 'Ich kreise über der Antwort!', 'Du bist hoch geklettert!', 'Ein Sieg über den Wolken!', 'Ich segle davon…')
b('Der Schneeleopardenkönig', 'Schneesturm', f'Wirst du wärmer, entfacht er einen Schneesturm: {BLIND}. Einmal pro Runde.',
  'Blick vom Gipfel', 'Ist er „Warm“ oder näher, schaut er vom Gipfel und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Die Berge sind mein Reich! 👑', 'Schneesturm! Man sieht nichts!', 'Vom Gipfel sehe ich alles!', 'Ich schleiche zum Ziel!', 'Oh, du bist flink wie ein Leopard!', 'Ein königlicher Sprung!', 'Zurück in die Berge…')

# 29 · Roboterfabrik
r('Roboterhund Wuffbot', 'Schnüffelsensor', 'Beim zweiten Zug der Runde schaltet er seinen Sensor ein und erfährt, ob die Zahl größer oder kleiner als diese ist. Dir verrät er es nicht.',
  'Wuff-piep! Ich bin ein Roboterhund! 🐕', 'Piep-piep! Mein Sensor hat es verstanden!', 'Das Signal wird stärker!', 'Fehler! Du bist zu nah!', 'Sieg geladen!', 'Akku leer…')
r('Roboterkatze Zahnrad', 'Kurzschluss', 'Beim zweiten Zug der Runde sprüht sie Funken: Dein „⚡ +1 Zug“ brennt durch.',
  'Miau-piep! Ich bin das neueste Katzenmodell 🤖', 'Piep-bzzz! Dein „⚡“ ist durchgebrannt!', 'Miau-piep! Das Ziel ist nah!', 'Piep! Du bist zu nah!', 'Miau-piep! Ich gewinne!', 'Piep… überhitzt.')
r('Drohne Summi', 'Überflug', 'Beim vierten Zug der Runde überfliegt sie das Feld und verrät dir, ob die Zahl größer oder kleiner als diese ist.',
  'Ich sehe alles von oben! 🚁', 'Summ! Die Zahl ist {k}!', 'Ich setze zur Landung an!', 'Du fliegst genauso gut!', 'Landung — Sieg!', 'Mein Propeller ist müde…')
r('Roboterelster Raffi', 'Glitzerdiebin', 'Nach deinem ersten Zug schnappt sie sich deinen „⚡ +1 Zug“ — er glänzt ja so schön!',
  'Schäck-schäck! Alles Glänzende gehört mir! ✨', 'Schäck! Dein „⚡“ kommt in mein Nest!', 'Schäck! Die Antwort glänzt!', 'Finger weg von meinem Nest!', 'Schäck! Der Sieg glänzt!', 'Schäck… du gewinnst.')
r('Android Ladung', 'Voll geladen', 'Zu Beginn der Runde lädt er sich auf: einen „⚡ +1 Zug“ für sich.',
  'Ladung 100 %. Starte das Spiel 🔋', 'Ladung 100 %! Ein „⚡ +1 Zug“ für mich!', 'Berechnung korrekt!', 'Fehler: Gegner in der Nähe!', 'Aufgabe erledigt!', 'Batterie leer…')
r('Roboterkrabbe Klammer', 'Zugriff', 'Nach deinem zweiten Zug packt sie dich mit ihrer Schere: Du erstarrst und setzt einen Zug aus.',
  'Klick-klick! Meine Scheren sind aus Stahl 🦀', 'Klick! Gepackt — setz einen Zug aus!', 'Klick! Ziel erfasst!', 'Du entwischst mir!', 'Klick-klick! Ich gewinne!', 'Meine Scheren haben losgelassen…')
r('Roboterbiene Linse', 'Scanner', 'Mit ihrem dritten Zug scannt sie das Feld und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät sie es nicht.',
  'Bzzz-piep! Ich scanne! 🐝', 'Piep! Scan abgeschlossen!', 'Bzz-piep! Ziel nah!', 'Störung! Du bist nah!', 'Bzzz! Ich gewinne!', 'Mein Scanner ist kaputt…')
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
r('Wiesel Ahorn', 'Raschelndes Laub', 'Wird es wärmer, raschelt es im Laub und verrät dir, ob die Zahl größer oder kleiner als seine ist. Einmal pro Runde.',
  'Knister-knister! Ich spiele im Laub 🍁', 'Knister-knister! Sie ist {k}!', 'Das Laub flüstert: sehr heiß!', 'Du hast mich im Laub gefunden!', 'Knister-knister — ich gewinne!', 'Das Laub ist weggeweht…')
r('Baummarder Pelzchen', 'Flinke Pfoten', f'Beim dritten Zug der Runde schnappt er sich flink deinen {K}.',
  'Schau dir meinen Pelzmantel an! 🧣', 'Schnapp! Der „⚡“ gehört mir!', 'Ich schleiche zum Ziel!', 'Oh, du bist flink!', 'Ein Sieg auf Samtpfoten!', 'Ich flitze auf einen Baum…')
r('Frischling Wühler', 'Wühlen', 'Mit seinem dritten Zug wühlt er sich ins Laub und setzt seinen Zug aus.',
  'Grunz! Ich finde Eicheln unter dem Laub! 🐗', 'Ich wühle… ich setze aus.', 'Grunz! Ich rieche das Ziel!', 'Oh, du wühlst schneller!', 'Ein grunzender Sieg!', 'Ich wühle mich ins Laub…')
r('Eichelhäher Schwätzer', 'Geschwätz', 'Er schwatzt ohne Pause — deinen zweiten Zug siehst du nicht.',
  'Krr-krr! Ich erzähle es dem ganzen Wald! 🪶', 'Krr-krr! Wo ist dein Zug hin?', 'Krr — nah!', 'Oh, du lässt dich nicht ablenken!', 'Ein schwatzhafter Sieg!', 'Ich schwatze jetzt in einem anderen Wald…')
r('Auerhahn Griesgram', 'Brummiger Rat', 'Bist du „Kalt“ oder weiter weg, brummt er und verrät dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Brumm-brumm… na, hallo 🍂', 'Brumm… na gut, ein Tipp: {k}.', 'Brumm! Ich bin nah!', 'Brumm… du hast dich angeschlichen!', 'Brumm — ich gewinne!', 'Brumm… na gut.')
r('Stinktier Puschel', 'Pfui!', 'Mit seinem dritten Zug — pfui! Du hältst dir die Nase zu und setzt einen Zug aus.',
  'Ich bin süß — erschreck mich nur nicht! 🦨', 'Pfui! Setz aus!', 'Oh, nah!', 'Oh, erschreck mich nicht!', 'Ein duftender Sieg!', 'Ich laufe weg…')
r('Opossum Baumel', 'Totstellen', 'Ist es „Glühend“, tut es so, als ob es schläft, und setzt seinen Zug aus. Einmal pro Runde.',
  'Ich hänge so gern kopfüber! 💤', 'Ich schlafe… ich setze aus.', 'Oh, ich bin wach — nah!', 'Du hast mich geweckt!', 'Ein baumelnder Sieg!', 'Ich stelle mich schlafend…')
b('Der Elchkönig', 'Trompetenruf', 'Beim dritten Zug der Runde röhrt er durch den ganzen Wald: Du erstarrst und setzt einen Zug aus.',
  'Waldweisheit', 'Ist er „Warm“ oder näher, lauscht er dem Wald und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich bin der König des Herbstwaldes! 👑', 'Tröö-öö! Erstarre!', 'Der Wald hat es mir verraten — ich kenne die Hälfte!', 'Der Wald flüstert — nah!', 'Oh, du kennst den Wald besser als ich!', 'Ein Sieg im Blätterregen!', 'Zurück ins Dickicht…')

# 32 · Tal der Pyramiden
r('Ibis Papyrus', 'Papyrus', 'Ist er „Sehr heiß“ oder näher, schaut er in seinen Papyrus und verrät dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Ich schreibe alles auf Papyrus 📜', 'Der Papyrus sagt: {k}.', 'Die Hieroglyphen führen zur Antwort!', 'Liest du etwa meine Papyri?!', 'Notiert: Sieg!', 'Notiert: Du gewinnst.')
r('Skarabäus Rollo', 'Rollende Kugel', 'Bist du „Sehr heiß“ oder näher, rollt er dir seine Kugel entgegen: Dein nächster Zug geschieht von selbst — ein wilder Wurf. Einmal pro Runde.',
  'Ich rolle die Sonne über den Himmel! ☀️', 'Und los rollt sie! Dein Zug fliegt irgendwohin!', 'Ich rolle direkt zur Antwort!', 'Nimmst du mir etwa meine Kugel weg?!', 'Ich bin zum Sieg gerollt!', 'Meine Kugel ist weggerollt…')
r('Katze Bastet', 'Segen', 'Mit ihrem ersten Zug segnet sie dich: einen „⚡ +1 Zug“ für dich.',
  'Schnurr… ich bin die Hüterin des Hauses 🐈‍⬛', 'Ich segne dich — ein „⚡ +1 Zug“!', 'Schnurr! Das Glück ist mit mir!', 'Schnurr… du bist klug!', 'Schnurr-schnurr — ich gewinne!', 'Schnurr… du gewinnst.')
r('Schakalwelpe Anubis', 'Die Waage', 'Beim vierten Zug der Runde wiegt er alles auf seiner Waage: Er tauscht mit dir die „⚡ +1 Zug“ — deine an ihn, seine an dich.',
  'Auuu! Ich bewache die Pyramiden 🐺', 'Die Waage hat sich geneigt — wir tauschen die „⚡“!', 'Auuu! Ich rieche die Antwort!', 'Du hast dich in die Pyramide geschlichen!', 'Auuu! Ich gewinne!', 'Die Waage war nicht auf meiner Seite…')
r('Falke Horus', 'Horusauge', 'Beim fünften Zug der Runde blickt er mit dem Horusauge und verrät dir, ob die Zahl größer oder kleiner als diese ist.',
  'Mein Auge sieht alles! 🦅', 'Das Horusauge sieht: Sie ist {k}!', 'Das Auge irrt sich nie!', 'Du hast Augen wie ein Falke!', 'Ein Sieg unter der Sonne!', 'Das Auge hat sich geschlossen…')
r('Nilpferd Taweret', 'Tollpatsch', 'Nach deinem dritten Zug plumpst sie in den Nil und verliert ihren eigenen „⚡ +1 Zug“.',
  'Platsch! Ich bin die Riesin des Flusses 🦛', 'Platsch! Mein „⚡“ ist ins Wasser gefallen!', 'Platsch-platsch, sehr heiß!', 'Schwimmst du etwa zu mir?!', 'Platsch! Ich gewinne!', 'Platsch… du gewinnst.')
r('Krokodil Sobek', 'Untergetaucht', 'Mit seinem ersten Zug taucht es unter: Du siehst diesen Zug nicht.',
  'Blubb… ich bin hier, im Nil 🐊', 'Blubb! Mein erster Zug ist unter Wasser!', 'Ich schwimme zur Antwort!', 'Siehst du mich unter Wasser?!', 'Zack! Ich gewinne!', 'Ich schwimme davon…')
r('Mungo Schnapp', 'Schneller Griff', 'Beim sechsten Zug der Runde schnappt er sich Beute: einen „⚡ +1 Zug“ für sich.',
  'Ich bin schnell und mutig! 🦡', 'Schnapp! Ein „⚡ +1 Zug“ für mich!', 'Ich wittere Beute!', 'Bist du etwa schneller als ich?!', 'Schnapp — ich gewinne!', 'Die Beute ist weg…')
r('Reiher Bennu', 'Sonnenzeichen', 'Wirst du kälter, blickt er in die Sonne und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich begrüße jeden Sonnenaufgang 🌅', 'Die Sonne hat mir das Geheimnis verraten!', 'Die Sonne zeigt den Weg!', 'Du folgst der Sonne!', 'Ein Sieg im Morgenrot!', 'Die Sonne ist untergegangen…')
b('Der Sonnenkönig Ra', 'Sonnenstich', 'Beim zweiten Zug der Runde lodert er vor Sonnenlicht: Dein nächster Zug geschieht von selbst — ein wilder Wurf.',
  'Strahlenglanz', 'Ist er „Glühend“, strahlt er noch heller: einen „⚡ +1 Zug“ für sich. Einmal pro Runde.',
  'Ich bin die Sonne über den Pyramiden! 👑', 'Sengende Sonne! Dein Zug fliegt irgendwohin!', 'Strahlenglanz! Ein „⚡ +1 Zug“ für mich!',
  'Die Sonne steht im Zenit!', 'Du hast keine Angst vor der Hitze?!', 'Ein sonniger Sieg! 👑', 'Die Sonne geht unter… du gewinnst.')

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
r('Seeotter Döserchen', 'Schlaf auf den Wellen', 'Beim sechsten Zug der Runde schläft er auf den Wellen ein und setzt seinen Zug aus.',
  'Ich schlafe auf dem Rücken, mit einem Kiesel in den Pfoten 🦦', 'Chrrr… ich schaukle auf den Wellen… und setze aus.', 'Die Wellen tragen mich zur Antwort!', 'Du weckst mich auf!', 'Gewonnen — gute Nacht!', 'Ich bin weggedöst…')
r('Mondspinner Luna', 'Mondlicht', 'Beim dritten Zug der Runde fliegt er zum Mond und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht.',
  'Ich fliege dem Mondlicht entgegen 🌙', 'Das Mondlicht hat mir alles gezeigt…', 'Das Licht führt mich!', 'Fliegst du etwa zu meinem Licht?!', 'Ein Sieg im Mondschein!', 'Das Licht ist aus…')
r('Siebenschläfer Döser', 'Gähnen', 'Nach deinem ersten Zug gähnt er so süß, dass du einschläfst und einen Zug aussetzt.',
  'Gäääähn… 🥱', 'Uaaah… Schlaf, setz aus!', 'Im Traum sehe ich das Ziel!', 'Oh, du gähnst ja gar nicht!', 'Ein verschlafener Sieg!', 'Ich träume weiter…')
r('Ole Schirmchen', 'Zauberschirm', f'Bist du „Sehr heiß“ oder näher, spannt er seinen Traumschirm über dir auf: {BLIND}. Einmal pro Runde.',
  'Ich spanne meinen Schirm auf — du träumst ein Märchen! ☂️', 'Süße Träume! Wo sind deine Züge?', 'Das Märchen ist bald zu Ende — nah!', 'Oh, du schläfst nicht!', 'Ein märchenhafter Sieg!', 'Mein Schirm ist zugeklappt…')
r('Fledermaus Flatter', 'Echo in der Nacht', 'Ist sie „Sehr heiß“ oder näher, lauscht sie dem Echo und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät sie es nicht. Einmal pro Runde.',
  'Nachts höre ich alles! 🦇', 'Piep! Ich kenne die Hälfte!', 'Ich höre das Ziel!', 'Oh, du fliegst so leise!', 'Ein nächtlicher Sieg!', 'Ich hänge mich kopfüber zum Schlafen…')
r('Koboldmaki Nachtlicht', 'Traumfänger', 'Nach deinem dritten Zug fängt er deinen „⚡ +1 Zug“ — zusammen mit deinem Traum.',
  'Meine Augen sind größer als der Mond! 👀', 'Hopp! Ich habe deinen „⚡“ und deinen Traum gefangen!', 'Ich sehe die Antwort im Dunkeln!', 'Schläfst du etwa nicht?!', 'Sieg — süße Träume!', 'Ich bin aufgewacht… du gewinnst.')
r('Pinguinküken Schlafwandler', 'Schlafwandeln', 'Bist du „Kalt“ oder weiter weg, wandelt es im Schlaf davon und lässt dich durch: Du ziehst sofort noch einmal. Einmal pro Runde.',
  'Chrrr… ich wandle im Schlaf 🐧', 'Chrrr… zieh noch mal…', 'Chrrr… ich bin nah…', 'Oh, du hast mich geweckt!', 'Gewonnen… im Schlaf!', 'Als Verlierer aufgewacht…')
r('Kater Bajun', 'Schlaflied', f'Beim vierten Zug der Runde schnurrt er ein Schlaflied: {LAVA}.',
  'Ich erzähle dir eine Geschichte… 🐈', 'Schnurr… Ein verschlafener wilder Wurf!', 'Die Geschichte ist gleich zu Ende — nah!', 'Oh, dich kann man nicht einschläfern!', 'Ein schnurrender Sieg!', 'Ich lege mich an den Ofen…')
b('Die Mondkönigin', 'Nacht', f'Mit ihrem ersten Zug ruft sie die Nacht: {FOG_F}.',
  'Sternschnuppe', f'Bist du „Glühend“, fängt sie eine Sternschnuppe: einen {K} für sich. Einmal pro Runde.',
  'Gute Nacht, Kleines! 👑', 'Die Nacht ist da!', 'Eine Sternschnuppe — ein „⚡“ für mich!', 'Die Sterne verraten es mir — nah!', 'Oh, du strahlst heller als die Sterne!', 'Ein Sieg im Mondschein!', 'Der Morgen kommt…')

# 35 · Zwergenschmiede
r('Zwerg Hämmerchen', 'Hammerschlag', 'Mit seinem zweiten Zug schlägt er mit dem Hammer zu — bumm! — du setzt einen Zug aus.',
  'Klopf-klopf, ich schmiede! 🔨', 'Bumm! Setz aus!', 'Fast fertig geschmiedet!', 'Oh, du schmiedest schneller!', 'Ein geschmiedeter Sieg!', 'Mein Hämmerchen ist kaputt…')
r('Feuergeist Lodri', 'Erloschen', 'Wirst du kälter, erlischt er und es wird dunkel: Bis zum Rundenende siehst du deine eigenen Züge nicht. Einmal pro Runde.',
  'Fauch! Ich bin das lebendige Feuer der Schmiede! 🔥', 'Pff! Dunkel — du siehst deine Züge nicht!', 'Ich lodere auf — sehr heiß!', 'Du fachst mein Feuer an!', 'Flammen des Sieges!', 'Ich bin erloschen…')
r('Zwergenschmiedin Kling', 'Klingender Amboss', 'Beim dritten Zug der Runde schlägt sie auf den Amboss und erfährt am Klang, ob die Zahl größer oder kleiner als diese ist. Dir verrät sie es nicht.',
  'Kling! Ich bin die beste Schmiedin unter dem Berg ⚒️', 'Kling! Der Klang hat mir alles verraten!', 'Schmiede das Eisen, solange es heiß ist!', 'Du hämmerst lauter als ich!', 'Kling! Der Sieg ist geschmiedet!', 'Mein Hammer ist abgerutscht…')
r('Bergmannsmaulwurf Lore', 'Ab geht’s!', 'Mit seinem dritten Zug fährt er deinen „⚡ +1 Zug“ in seiner Lore davon.',
  'Ich grabe tiefer als alle! ⛏️', 'Ab geht’s! Dein „⚡“ ist in meiner Lore!', 'Die Ader ist nah!', 'Gräbst du etwa in meinem Stollen?!', 'Ich habe einen Sieg geschürft!', 'Verschüttet… du gewinnst.')
r('Troll Puster', 'Schmiederauch', 'Bist du „Sehr heiß“ oder näher, pustet er Rauch aus: Bis zum Rundenende siehst du seine Züge nicht. Einmal pro Runde.',
  'Puff-puff! Ich halte den Ofen am Laufen 💨', 'Puff! Rauch — du siehst meine Züge nicht!', 'Puff-puff, sehr heiß!', 'Siehst du etwa durch den Rauch?!', 'Puff! Ich gewinne!', 'Der Rauch hat sich verzogen…')
r('Grubenkobold Nugget', 'Goldnase', 'Beim vierten Zug der Runde wittert er Gold und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht.',
  'Hihi! Ich weiß, wo das Gold versteckt ist 🪙', 'Hihi! Meine Nase hat es herausgefunden!', 'Das Gold ist nah!', 'Suchst du etwa mein Gold?!', 'Hihi! Ein goldener Sieg!', 'Das Gold ist mir entwischt…')
r('Goldgräberzwerg Glückspilz', 'Goldgräberglück', 'Nach deinem zweiten Zug wäscht er einen Goldklumpen aus: einen „⚡ +1 Zug“ für sich.',
  'Ha! Heute ist mein Glückstag! ✨', 'Ein Goldklumpen! Ein „⚡ +1 Zug“ für mich!', 'Ich wittere eine Goldader!', 'Du wäschst Gold direkt neben mir!', 'Ha! Was für ein Glück!', 'Nichts als Steine…')
r('Zwergenkrieger Axt', 'Schlachtruf', 'Ist er „Glühend“, stößt er einen Schlachtruf aus: Du erstarrst und setzt einen Zug aus. Einmal pro Runde.',
  'Ha! Ich bin der tapferste Zwerg unter dem Berg! ⚔️', 'AAARGH! Erstarre — setz einen Zug aus!', 'Der Sieg ist nah!', 'Du bist ein tapferer Krieger!', 'Hurra! Ich gewinne!', 'Rückzug… du gewinnst.')
r('Schmiedebär Bruno', 'Hammerschlag', 'Mit seinem ersten Zug schlägt er mit dem Hammer zu — bong! —: Dein nächster Zug geschieht von selbst — ein wilder Wurf.',
  'Bong-bong! Ich schmiede Hufeisen und Schwerter 🔨', 'BONG! Dein Zug fliegt davon!', 'Das Eisen glüht — sehr heiß!', 'Du hämmerst so gut wie ich!', 'Bong! Ich gewinne!', 'Der Hammer ist schwer… du gewinnst.')
b('Der Zwergenkönig', 'Unterwelt', f'Mit seinem zweiten Zug führt er dich unter die Erde: {MEM}.',
  'Schatzkammer', f'Beim zweiten Zug der Runde trägt er deinen {K} in seine Schatzkammer.',
  'Willkommen in meiner Schmiede! 👑', 'Unter der Erde! Was war vorher?', 'In die Schatzkammer — der „⚡“ gehört mir!', 'Der Schatz ist fast gefunden!', 'Oh, du hast meine Goldader gefunden!', 'Ein Sieg des Zwergenkönigs!', 'Tief in den Berg hinein…')
