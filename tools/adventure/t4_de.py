WORLDS = ['Stadion der Champions', 'Detektivviertel', 'Galápagos', 'Wilder Westen', 'Land der Yokai',
          'Inseln Indonesiens', 'Akademie der Forscher', 'Verlorener Tempel', 'Große Steppe', 'Asgard']
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

# 36 · Stadion der Champions
r('Windhund Flitzi', 'Sprint', 'Ist sie „Kalt“ oder weiter weg, sprintet sie los: Sie zieht sofort noch einmal. Einmal pro Runde.',
  'Auf die Plätze, fertig… los! 🏃', 'Sprint! Ich ziehe noch mal!', 'Die Zielgerade!', 'Du läufst schneller als ich?!', 'Als Erste im Ziel!', 'Ich habe das Rennen aufgegeben…')
r('Känguru Haken', 'Haken', 'Nach deinem vierten Zug landet er einen Haken: Du gehst zu Boden und setzt einen Zug aus.',
  'Wir boxen fair! 🥊', 'Haken! Du bist am Boden — setz einen Zug aus!', 'Ich bin in Topform!', 'Du steckst gut ein!', 'K.o. — ich gewinne!', 'Ich hänge die Handschuhe an den Nagel…')
r('Otter Paddel', 'Luft holen', f'Mit ihrem vierten Zug taucht sie auf, holt Luft — und nimmt sich einen {K}.',
  'Niemand schwimmt so gut Brust wie ich! 🏊', 'Luft holen! Ein „⚡ +1 Zug“ für mich!', 'Ich sehe schon den Beckenrand!', 'Wir liegen Kopf an Kopf!', 'Gold im Becken!', 'Ich habe Wasser geschluckt…')
r('See-Elefant Stemmer', 'Verschnaufpause', 'Wird er wärmer, stemmt er die Hantel und ruht sich aus: Er setzt seinen Zug aus. Einmal pro Runde.',
  'Ich bin der Stärkste am Strand! 🏋️', 'Puh… Gewicht gestemmt. Ich ruhe mich aus — ich setze aus.', 'Rekordgewicht — und ich bin nah dran!', 'Du bist stärker, als du aussiehst!', 'Weltrekord!', 'Die Hantel hat gewonnen…')
r('Biber Puck', 'Schlagschuss', f'Ist er „Glühend“, schießt er den Puck: Dein {K} fliegt davon. Einmal pro Runde.',
  'Los, ein Tor! 🏒', 'Schlagschuss! Dein „⚡“ fliegt davon!', 'Konter!', 'Du hältst meine Schüsse!', 'Tor! Ich gewinne!', 'Nur der Pfosten…')
r('Zobel Kufe', 'Pirouette', 'Der sechste Zug der Runde verschwindet in einer Pirouette: Du siehst ihn nicht.',
  'Schau, wie ich mich drehe! ⛸️', 'Pirouette! Diesen Zug siehst du nicht!', 'Eine saubere Kür!', 'Du läufst so gut wie ich!', 'Höchstnote!', 'Ich bin aufs Eis gefallen…')
r('Schimpanse Salto', 'Salto', 'Bist du „Warm“ oder näher, schlägt er einen Salto: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Uh-uh! Schau dir diesen Salto an! 🤸', 'Salto! Zwei Züge hintereinander!', 'Ich lande genau im Ziel!', 'Bist du auch Turner?!', 'Perfekte Landung!', 'Von den Ringen gefallen…')
r('Impala Marathon', 'Verpflegung', f'Mit ihrem dritten Zug reicht sie dir an der Verpflegungsstation Wasser: einen {K} für dich.',
  'Ein Marathon ist lang! 🥤', 'Verpflegung! Nimm einen „⚡ +1 Zug“!', 'Zweite Luft!', 'Du holst mich ein!', 'Marathon geschafft!', 'Bei Kilometer 30 ausgestiegen…')
r('Okapi Dunk', 'Pass', f'Ist er „Warm“ oder näher, passt er dir zu: einen {K}. Einmal pro Runde.',
  'Halb Giraffe, halb Zebra — ganz Basketballer! 🏀', 'Pass! Fang einen „⚡ +1 Zug“!', 'Ich gehe zum Dunk!', 'Starke Verteidigung!', 'Dunk! Ich gewinne!', 'Korb verfehlt…')
b('Der Grizzly-Champion', 'Siegerbrüllen', 'Mit seinem vierten Zug brüllt er so laut, dass du einfrierst und einen Zug aussetzt.',
  'Goldmedaille', f'Beim fünften Zug der Runde nimmt er sich deinen {K}.',
  'Ich bin der Champion aller Stadien! 👑', 'GROAR! Einfrieren — setz einen Zug aus!', 'Die Medaille gehört mir — und dein „⚡“ auch!',
  'Der Rekord ist nah!', 'Du bist ein würdiger Gegner!', 'Der Champion gewinnt wieder! 👑', 'Ich überreiche dir den Pokal…')

# 37 · Detektivviertel
r('Basset Schnupper', 'Auf der Fährte', 'Bist du „Sehr kalt“, nimmt er die Fährte auf und verrät dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Meine Nase täuscht sich nie! 🔎', 'Schnüffel, schnüffel! Hinweis: Die Zahl ist {k}!', 'Die Spur führt direkt zur Antwort!', 'Du folgst meiner Spur!', 'Fall gelöst!', 'Die Spur ist kalt geworden…')
r('Bulldogge Inspektor', 'Bericht', 'Mit seinem vierten Zug erstattet er dir Bericht: Die Zahl ist größer oder kleiner als seine.',
  'Inspektor im Dienst! 📋', 'Bericht: Die Zahl ist {k}!', 'Der Verdächtige ist fast gefasst!', 'Ermittelst du auf eigene Faust?!', 'Fall abgeschlossen!', 'Die Beweise passen nicht…')
r('Elster Indiz', 'Glänzendes Indiz', 'Beim sechsten Zug der Runde bringt sie ein Indiz: die letzte Ziffer der Zahl.',
  'Alles, was glänzt, ist ein Indiz! 🔑', 'Ein Indiz gefunden: {k}!', 'Die Indizien führen zur Antwort!', 'Sammelst du auch Indizien?!', 'Das Indiz hat geholfen!', 'Ich habe das Indiz verloren…')
r('Siamkatze Chiffre', 'Entschlüsseln', 'Nach deinem zweiten Zug entschlüsselt sie, ob die Zahl durch 3 teilbar ist. Dir verrät sie es nicht.',
  'Miau. Agentin meldet sich 🕶️', 'Nachricht entschlüsselt. Verrate ich nicht.', 'Ziel im Visier!', 'Du hast meinen Code geknackt?!', 'Mission erfüllt!', 'Meine Tarnung ist aufgeflogen…')
r('Taube Kurier', 'Depesche', 'Nach deinem dritten Zug bringt er eine Depesche: ob die Zahl gerade oder ungerade ist.',
  'Gurr-gurr! Post für den Detektiv ✉️', 'Depesche: Die Zahl ist {k}!', 'Ich fliege direkt zum Ziel!', 'Du hast meinen Brief abgefangen?!', 'Brief zugestellt — ich gewinne!', 'Der Wind hat meinen Brief geholt…')
r('Meerschweinchen Akte', 'Die Akte', 'Nach deinem vierten Zug findet sie die Akte: die Zehnerziffer der Zahl.',
  'In meiner Kartei steht alles! 🗂️', 'Akte gefunden: {k}!', 'Der Fall ist fast gelöst!', 'Liest du meine Akten?!', 'Fall archiviert — ich gewinne!', 'Die Akte ist verschwunden…')
r('Koala Abdruck', 'Fingerabdrücke', 'Ist er „Warm“ oder näher, nimmt er Fingerabdrücke und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Koalas haben Fingerabdrücke wie Menschen! 🖐️', 'Abdrücke genommen… ich weiß mehr.', 'Die Abdrücke führen zur Antwort!', 'Du hast meine Fingerabdrücke gefunden?!', 'Die Spurensicherung bestätigt — ich gewinne!', 'Die Abdrücke sind verwischt…')
r('Star Tratsch', 'Tratsch', 'Beim fünften Zug der Runde verplappert er sich, in welcher Hälfte die Zahl liegt.',
  'Willst du Neuigkeiten? Ich habe Hunderte! 🗣️', 'Psst, nicht weitersagen! Die Zahl ist {k}!', 'Ich habe gehört, die Antwort ist ganz nah!', 'Lauschst du etwa?!', 'Alle reden über meinen Sieg!', 'Mir sind die Neuigkeiten ausgegangen…')
r('Waschbär Dietrich', 'Flinke Pfoten', f'Nach deinem dritten Zug greift er in deine Tasche: Dein {K} gehört jetzt ihm.',
  'Ich bin nur zufällig vorbeigekommen! 🔓', 'Klick! Dein „⚡“ gehört jetzt mir!', 'Das Schloss ist fast offen!', 'Du hast mich erwischt?!', 'Hehe, sauber!', 'Auf frischer Tat ertappt…')
b('Die Phantom-Pantherin', 'Rauchwand', f'Beim vierten Zug der Runde verschwindet sie im Rauch: {FOG_F}.',
  'Coup des Jahrhunderts', f'Wird sie kälter, stiehlt sie deinen {K}. Einmal pro Runde.',
  'Mich hat noch nie jemand gefasst! 👑', 'Puff! Such mich im Rauch!', 'Coup des Jahrhunderts — dein „⚡“ gehört mir!',
  'Die Antwort ist fast in meinen Pfoten!', 'Du bist mir auf der Spur!', 'Das Phantom ist nicht zu fassen! 👑', 'Gefasst… du bist der beste Detektiv.')

# 38 · Galápagos
r('Meerechse Salzi', 'Salziges Niesen', 'Wird sie kälter, niest sie Salz: Du setzt einen Zug aus. Einmal pro Runde.',
  'Ich tauche im Meer nach Algen! 🧂', 'Hatschi! Salz — setz einen Zug aus!', 'Ich sonne mich direkt neben der Antwort!', 'Du bist tiefer getaucht als ich!', 'Ein salziger Sieg!', 'Ich wärme mich auf einem Stein…')
r('Blaufußtölpel Tango', 'Blaufußtanz', 'Bist du „Glühend“, fängt sie an zu tanzen: Beim nächsten Mal zieht sie zweimal hintereinander. Einmal pro Runde.',
  'Schau dir meine blauen Füße an! 🩰', 'Tango! Zwei Züge hintereinander!', 'Ich tanze direkt zur Antwort!', 'Du tanzt besser als ich?!', 'Ein Siegestanz!', 'Ich bin aus dem Takt…')
r('Fregattvogel Ballon', 'Roter Ballon', f'Bist du „Warm“ oder näher, bläst er den roten Ballon an seiner Kehle auf: {FOG}. Einmal pro Runde.',
  'Siehst du meinen roten Ballon? 🔴', 'Puff! Du siehst meine Züge nicht!', 'Ich schwebe über der Antwort!', 'Fliegst du mir hinterher?!', 'Ein Sieg mit weiten Flügeln!', 'Mein Ballon ist geplatzt…')
r('Fink Darwin', 'Beobachtung', 'Mit seinem dritten Zug teilt er eine Beobachtung: ob die Zahl durch 3 teilbar ist.',
  'An meinem Schnabel haben Forscher die Evolution verstanden! 🔬', 'Beobachtung: Die Zahl ist {k}!', 'Die Hypothese stimmt!', 'Bist du auch Forscher?!', 'Ein wissenschaftlicher Sieg!', 'Das Experiment ist gescheitert…')
r('Seelöwe Faulpelz', 'Ansteckendes Gähnen', 'Mit seinem vierten Zug gähnt er so ansteckend, dass du einnickst und einen Zug aussetzt.',
  'Gääähn… die Sonne ist so warm 😴', 'Gääähn… Müde? Setz einen Zug aus!', 'Sogar im Liegen bin ich nah!', 'Du hast mich geweckt!', 'Gewonnen, ohne aufzustehen!', 'Zurück zum Nickerchen…')
r('Flugfisch Gischt', 'Gischt', 'Der zweite Zug der Runde geht in der Gischt unter: Du siehst ihn nicht.',
  'Ich kann über die Wellen fliegen! 🌊', 'Platsch! Dieser Zug ist in der Gischt verschwunden!', 'Ich fliege direkt zur Antwort!', 'Kannst du auch fliegen?!', 'Ein fliegender Sieg!', 'Zurück ins Meer…')
r('Kormoran Watschel', 'Ein Fisch für dich', f'Ist er „Sehr kalt“, teilt er einen Fisch mit dir: einen {K} für dich. Einmal pro Runde.',
  'Fliegen kann ich nicht — aber tauchen! 🐟', 'Nimm einen Fisch — und einen „⚡ +1 Zug“!', 'Ich tauche direkt zur Antwort!', 'Du tauchst tiefer!', 'Ein Sieg ohne Flügel!', 'Der Fisch ist entwischt…')
r('Lavaechse Liegestütz', 'Liegestütze', f'Mit ihrem zweiten Zug macht sie Liegestütze auf einem Stein — und nimmt sich einen {K}.',
  'Eins-zwei, eins-zwei! Liegestütze! 💪', 'Liegestütze geschafft — ein „⚡ +1 Zug“ für mich!', 'Ich bin in Topform!', 'Du bist stärker als ich?!', 'Die Kraft gewinnt!', 'Zu müde für Liegestütze…')
r('Habicht Wächter', 'Blick vom Kaktus', 'Nach deinem vierten Zug schaut er von einem Kaktus herab und verrät dir: Die Zahl ist größer oder kleiner als deine.',
  'Von einem Kaktus sieht man alles! 🦅', 'Von hier oben sehe ich: Die Zahl ist {k}!', 'Ich kreise über der Antwort!', 'Du hast so scharfe Augen wie ich!', 'Ein Sieg von oben!', 'Ab zum nächsten Kaktus…')
b('Patriarch George', 'Weisheit der Jahrhunderte', 'Schon zu Beginn der Runde weiß er, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht.',
  'Schildkrötensprint', 'Bist du „Kalt“ oder weiter weg, legt er plötzlich zu: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Ich bin zweihundert Jahre alt — ich habe alles gesehen! 👑', 'Die Weisheit der Jahrhunderte: Ich weiß, wo ich suchen muss.', 'Schildkrötensprint — zwei Züge hintereinander!',
  'Langsam, aber sicher zur Antwort!', 'Du bist weise für dein Alter!', 'Die Weisheit gewinnt! 👑', 'Ich schenke dir diese Insel…')

# 39 · Wilder Westen
r('Präriehund Kläff', 'Alarmruf', 'Bist du „Glühend“, kläfft sie einen Hinweis: ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Kläff! Ich halte Wache! 🐕', 'Kläff-kläff! Die Zahl ist {k}!', 'Von meinem Hügel sehe ich die Antwort!', 'Du hast dich an meinen Bau geschlichen!', 'Kläff! Ich gewinne!', 'Ich verstecke mich im Bau…')
r('Kojote Streuner', 'Mondgeheul', f'Beim dritten Zug der Runde heult er den Mond an: {MEM}.',
  'Ich streife durch die Prärie! 🐺', 'Auuuh! Du merkst dir nur zwei Züge!', 'Ich rieche die Antwort!', 'Bist du auch ein Streuner?!', 'Ein Siegesgeheul!', 'Ich reite in den Sonnenuntergang…')
r('Klapperschlange Rassel', 'Rassel', 'Bist du „Sehr kalt“, schüttelt er seine Rassel: Du frierst ein und setzt einen Zug aus. Einmal pro Runde.',
  'Rrrrr! So sage ich Hallo 🐍', 'Rrrrr! Einfrieren — setz einen Zug aus!', 'Ich schlängle mich zur Antwort!', 'Du hast keine Angst vor meiner Rassel?!', 'Rrrrr! Ich gewinne!', 'Ich krieche unter einen Stein…')
r('Mustang Wildfang', 'Galopp', 'Mit seinem zweiten Zug galoppiert er los: Er zieht sofort noch einmal.',
  'Mich zähmt niemand! 🐎', 'Galopp! Ich ziehe noch mal!', 'Ich galoppiere direkt zur Antwort!', 'Reitest du mir nach?!', 'Ein wilder Sieg!', 'Ab in die Prärie…')
r('Stachelschwein Pieks', 'Stacheln', 'Ist er „Kalt“ oder weiter weg, stellt er seine Stacheln auf: Du stichst dich und setzt einen Zug aus. Einmal pro Runde.',
  'Mich solltest du lieber nicht umarmen! 📌', 'Autsch! Gestochen — setz einen Zug aus!', 'Ich piekse genau ins Ziel!', 'Du hast keine Angst vor mir?!', 'Ein stacheliger Sieg!', 'Ich rolle mich zusammen…')
r('Rennkuckuck Staubi', 'Wie der Blitz', 'Ist sie „Sehr kalt“, saust sie davon wie der Blitz: Sie zieht sofort noch einmal. Einmal pro Runde.',
  'Miep-miep! Mich fängst du nicht! 💨', 'Miep-miep! Ich ziehe noch mal!', 'Ich renne direkt zur Antwort!', 'Du rennst schneller?!', 'Miep-miep! Ich gewinne!', 'Nur noch eine Staubwolke…')
r('Kanincheneule Guckmal', 'Aus dem Bau', 'Nach deinem zweiten Zug schaut sie aus ihrem Bau und erfährt, ob die Zahl größer oder kleiner als deine ist. Dir verrät sie es nicht.',
  'Ich wohne in einem Erdbau, wie ein Ziesel! 🦉', 'Ich habe rausgeschaut — jetzt weiß ich mehr.', 'Aus meinem Bau sehe ich die Antwort!', 'Du hast in meinen Bau geguckt?!', 'Ein unterirdischer Sieg!', 'Ich verstecke mich wieder…')
r('Krustenechse Perlchen', 'Biss', f'Mit seinem vierten Zug beißt er in deinen {K} — und weg ist er.',
  'Meine Haut sieht aus wie Perlen! 🦎', 'Schnapp! Dein „⚡“ ist weg!', 'Ich krieche zur Antwort!', 'Du bist ausgewichen?!', 'Perlchen gewinnt!', 'Ich krieche in den Schatten…')
r('Gabelbock Hornfix', 'Vollgas', 'Nach jedem dritten deiner Züge legt er zu: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Ich bin der Schnellste der Prärie! 🦌', 'Vollgas! Zwei Züge hintereinander!', 'Ich rase zur Antwort!', 'Du holst auf?!', 'Ein gehörnter Sieg!', 'Zu müde zum Rennen…')
b('Sheriff Bison', 'Hände hoch!', f'Du hast deinen {K} eingeschaltet — der Sheriff ruft „Hände hoch!“: Du setzt deinen nächsten Zug aus. Einmal pro Runde.',
  'Beschlagnahme', f'Beim sechsten Zug der Runde beschlagnahmt er deinen {K}.',
  'In dieser Stadt sorge ich für Ordnung! 👑', 'Hände hoch! Setz einen Zug aus!', 'Dein „⚡“ ist beschlagnahmt!',
  'Die Antwort ist verhaftet!', 'Du bist ein ehrlicher Cowboy!', 'Das Gesetz gewinnt! 👑', 'Ich gebe meinen Stern ab… du gewinnst.')

# 40 · Land der Yokai
r('Kappa Gurke', 'Gurke', f'Ist er „Sehr kalt“, knabbert er eine Gurke und nimmt sich einen {K}. Einmal pro Runde.',
  'Verschütte nicht das Wasser auf meinem Kopf! 🥒', 'Knack! Ein „⚡ +1 Zug“ für mich!', 'Die Gurke führt zur Antwort!', 'Hast du dich höflich verbeugt?!', 'Ein knackiger Sieg!', 'Das Wasser ist verschüttet…')
r('Tengu Federwind', 'Federfächer', 'Bei jedem vierten seiner Züge wedelt er mit seinem Federfächer: Dein nächster Zug geschieht von selbst — ein wilder Wurf.',
  'Ich bin ein Berggeist mit Krähenflügeln! 🍃', 'Wusch! Dein Zug ist irgendwohin geflogen!', 'Der Wind trägt mich zur Antwort!', 'Hat es dich nicht weggeweht?!', 'Ein stürmischer Sieg!', 'Zurück in die Berge…')
r('Nekomata Zweischwanz', 'Zwei Schwänze', 'Mit ihrem zweiten Zug schwingt sie beide Schwänze: Beim nächsten Mal zieht sie zweimal hintereinander.',
  'Miau! Zwei Schwänze sind besser als einer 🐈', 'Miau! Zwei Züge hintereinander!', 'Meine Laterne beleuchtet die Antwort!', 'Siehst du im Dunkeln?!', 'Ein Sieg mit zwei Schwänzen!', 'Meine Laterne ist ausgegangen…')
r('Kamaitachi Windstoß', 'Windstoß', 'Nach deinem zweiten Zug weht ein Windstoß deine Züge davon: Bis zum Rundenende siehst du deine eigenen Züge nicht.',
  'Wusch! Ich bin ein Wind mit kleinen Krallen 🌀', 'Wusch! Deine Züge sind weggeweht!', 'Ich wirble direkt neben der Antwort!', 'Du hast dem Wind standgehalten?!', 'Ein Wirbelwind-Sieg!', 'Der Wind hat sich gelegt…')
r('Kodama Wispel', 'Waldflüstern', 'Beim vierten Zug der Runde beginnt der Wald zu flüstern: Bis zum Rundenende siehst du nur die letzten zwei Züge.',
  'Psst… ich wohne in einem alten Baum 🌳', 'Psst… Du merkst dir nur zwei Züge…', 'Der Wald flüstert — die Antwort ist nah!', 'Hörst du den Wald?', 'Ein Waldsieg!', 'Ich verschwinde im Laub…')
r('Amabie Glanz', 'Prophezeiung', 'Zu Beginn der Runde hat sie eine Vision: ob die Zahl durch 5 teilbar ist. Dir verrät sie es nicht.',
  'Ich bringe gute Vorzeichen! ✨', 'Ich hatte eine Vision… ich weiß mehr.', 'Meine Schuppen leuchten — die Antwort ist nah!', 'Glaubst du an Prophezeiungen?', 'Sie hat sich erfüllt — ich gewinne!', 'Die Prophezeiung hat sich nicht erfüllt…')
r('Yuki-onna Schneeflocke', 'Schneesturm', 'Beim fünften Zug der Runde entfacht sie einen Schneesturm: Bis zum Rundenende siehst du ihre Züge nicht.',
  'Ich tanze mit den Schneeflocken ❄️', 'Huuu… Schneesturm! Du siehst meine Züge nicht!', 'Der Schneesturm führt mich zur Antwort!', 'Ist dir nicht kalt?!', 'Ein verschneiter Sieg!', 'Ich bin geschmolzen…')
r('Zashiki-warashi Glücksi', 'Das Glück zieht aus', 'Mit ihrem dritten Zug zieht sie aus — und nimmt das Glück mit: Dein „⚡ +1 Zug“ gehört jetzt ihr.',
  'Hihi! Wo ich bin, ist das Glück! 🎎', 'Das Glück geht mit mir — dein „⚡“ gehört jetzt mir!', 'Das Glück ist auf meiner Seite!', 'Du hast Glück!', 'Hihi, Glück gehabt!', 'Mein Glück ist zu dir gewandert…')
r('Schneeaffe Onsen', 'Dampf der Quelle', 'Beim zweiten Zug der Runde steigt Dampf aus der heißen Quelle: Bis zum Rundenende siehst du nur die letzten zwei Züge.',
  'Ah, eine heiße Quelle… ♨️', 'Dampf! Du merkst dir nur zwei Züge!', 'Sogar im Wasser bin ich nah!', 'Willst du dich auch aufwärmen?!', 'Ein gemütlicher Sieg!', 'Das Wasser ist kalt geworden…')
b('Der Oni-König', 'Trommel', f'Mit seinem dritten Zug schlägt er die Trommel: {MEM}.',
  'Oni-Kraft', f'Ist er „Kalt“ oder weiter weg, nimmt er sich deinen {K}. Einmal pro Runde.',
  'Keine Angst — ich bin ein lieber Oni! 👑', 'BUMM-BUMM! Du merkst dir nur zwei Züge!', 'Oni-Kraft — dein „⚡“ gehört mir!',
  'Die Trommel dröhnt — die Antwort ist nah!', 'Du bist mutig!', 'Der Oni-König gewinnt! 👑', 'Du hast den Oni besiegt…')

# 41 · Inseln Indonesiens
r('Orang-Utan Borneo', 'Blätterschirm', 'Bist du „Kalt“ oder weiter weg, deckt er deinen Zug mit einem Blatt zu: Du siehst ihn nicht. Einmal pro Runde.',
  'Grüße aus den Wäldern Borneos! 🌿', 'Unter dem Blatt siehst du deinen Zug nicht!', 'Ich greife direkt nach der Antwort!', 'Kannst du auf Bäume klettern?!', 'Ein Regenwald-Sieg!', 'Ab in den Regen…')
r('Balistar Perle', 'Liedhinweis', 'Beim zweiten Zug der Runde singt er dir einen Hinweis: ob die Zahl gerade oder ungerade ist.',
  'Mich gibt es nur auf Bali! 🐦', 'Ich singe: Die Zahl ist {k}!', 'Das Lied führt zur Antwort!', 'Du singst besser als ich?!', 'Ein Siegeslied!', 'Ich habe meine Stimme verloren…')
r('Nashornvogel Helmi', 'Eine Feige', f'Nach deinem vierten Zug bringt sie dir eine Feige: einen {K}.',
  'Siehst du meinen Helm? Er gehört zu meinem Schnabel! 🍈', 'Nimm eine Feige — und einen „⚡ +1 Zug“!', 'Ich fliege zur Antwort!', 'Du hast mich überholt?!', 'Ein Sieg mit Helm!', 'Ich fliege zu den Bäumen…')
r('Tapir Pyjama', 'Pyjama-Nickerchen', 'Bei jedem vierten seiner Züge schläft er ein und setzt aus.',
  'Ich bin immer im Pyjama! 🛌', 'Gääähn… ich setze aus.', 'Ich taste mich zur Antwort!', 'Du hast mich geweckt!', 'Ein Pyjama-Sieg!', 'Zeit fürs Bett…')
r('Plumplori Gemach', 'Gaaanz langsam', 'Nach deinem dritten Zug versinkt er gaaanz langsam in Gedanken und setzt seinen Zug aus.',
  'Hal-lo-o… ich ha-abe es ni-icht eilig 🦥', 'Ich de-enke… ich setze aus.', 'Lang-sam, aber zur Antwort!', 'Du bist so-o schnell!', 'Leise — und ich gewinne!', 'Zu-u spät…')
r('Nasenaffe Zinken', 'Trompetennase', f'Bist du „Kalt“ oder weiter weg, trötet er so laut mit seiner Nase: {MEM}. Einmal pro Runde.',
  'Siehst du meine Nase? Die größte im Dschungel! 👃', 'TRÖÖÖT! Du merkst dir nur zwei Züge!', 'Meine Nase riecht die Antwort!', 'Deine Nase ist so gut wie meine!', 'Ein Sieg um Nasenlänge!', 'Die Nase hängt…')
r('Mandarinfisch Karneval', 'Farbenkarneval', f'Wird sie kälter, lässt sie ihre Farben aufblitzen: {FOG_F}. Einmal pro Runde.',
  'Ich bin der bunteste Fisch am Riff! 🎨', 'Blitz! Du siehst meine Züge nicht!', 'Ich schwimme zur Antwort!', 'Siehst du durch die Farben?!', 'Ein bunter Sieg!', 'Meine Farben sind verblasst…')
r('Binturong Popcorn', 'Leckerei', f'Nach deinem dritten Zug teilt er eine Leckerei: je einen {K} für dich und für ihn.',
  'Ich rieche nach Popcorn — wirklich! 🍿', 'Greif zu! Ein „⚡ +1 Zug“ für jeden!', 'Ich klettere zur Antwort!', 'Du hast mich gefunden!', 'Schnurr — ich gewinne!', 'Ich mache ein Nickerchen…')
r('Malaienbär Strahl', 'Honig', f'Ist er „Sehr heiß“ oder näher, teilt er fröhlich Honig: je einen {K} für dich und für ihn. Einmal pro Runde.',
  'Siehst du die Sonne auf meiner Brust? Das bin ich! 🍯', 'Honig! Ein „⚡ +1 Zug“ für jeden!', 'Ich rieche Honig — die Antwort ist nah!', 'Du hast meinen Honig gefunden?!', 'Ein süßer Sieg!', 'Der Honig ist alle…')
b('Der Komodo-König', 'Griff', 'Nach deinem vierten Zug packt er dich: Du frierst ein und setzt einen Zug aus.',
  'Beute', f'Mit seinem dritten Zug nimmt er sich einen {K}.',
  'Ich bin die größte Echse der Welt! 👑', 'Gepackt! Einfrieren — setz einen Zug aus!', 'Beute — ein „⚡ +1 Zug“ für mich!',
  'Die Antwort ist schon in meinem Maul!', 'Du bist mutig!', 'Der Inselkönig gewinnt! 👑', 'Ich krieche in die Sonne…')

# 42 · Akademie der Forscher
r('Fledermaus Echo', 'Echoortung', 'Bei jedem zweiten seiner Züge lauscht er dem Echo und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät er es nicht.',
  'Ich sehe mit den Ohren! 🦇', 'Das Echo hat geantwortet… ich weiß mehr.', 'Das Echo führt zur Antwort!', 'Hörst du das Echo auch?!', 'Ein Sieg nach Gehör!', 'Das Echo ist verklungen…')
r('Krähe Tüftel', 'Erfindung', 'Nach deinem zweiten Zug baut sie ein Gerät und verrät dir die Zehnerziffer der Zahl.',
  'Ich erfinde alles! ⚙️', 'Das Gerät zeigt: {k}!', 'Die Rechnung stimmt!', 'Bist du auch Erfinder?!', 'Die Erfindung funktioniert!', 'Das Gerät ist kaputt…')
r('Kapuziner Röhrchen', 'Reaktion', f'Beim fünften Zug der Runde sprudelt das Reagenzglas: {LAVA}.',
  'Chemie macht Spaß! 🧪', 'Blubb! Dein Zug ist irgendwohin geflogen!', 'Die Reaktion läuft gut!', 'Hast du dasselbe gemischt?!', 'Das Experiment ist gelungen!', 'Das Reagenzglas ist gesprungen…')
r('Nacktmull Geologe', 'Ausgrabung', 'Bist du „Kalt“ oder weiter weg, gräbt er und erfährt die Zehnerziffer der Zahl. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich lebe unter der Erde und werde kaum alt! ⛏️', 'Ausgegraben… jetzt weiß ich mehr.', 'Schicht für Schicht — zur Antwort!', 'Gräbst du nebenan?!', 'Ein wertvoller Fund!', 'Der Tunnel ist eingestürzt…')
r('Graupapagei Polyglott', 'In allen Sprachen', 'Mit seinem zweiten Zug verkündet er, ob die Zahl durch 3 teilbar ist.',
  'Ich spreche hundert Sprachen! 💬', 'Verkündung: Die Zahl ist {k}!', 'Worte führen zur Antwort!', 'Verstehst du mich?!', 'Ein Sieg in allen Sprachen!', 'Mir fehlen die Worte…')
r('Nasenbär Kolben', 'Analyse', 'Bist du „Warm“ oder näher, macht er eine Analyse und erfährt, ob die Zahl durch 5 teilbar ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Mein gestreifter Schwanz ist wie ein Lineal! ⚗️', 'Analyse fertig. Verrate ich nicht.', 'Die Formel stimmt!', 'Prüfst du meine Rechnung?!', 'Ein wissenschaftlicher Sieg!', 'Der Kolben ist zerbrochen…')
r('Biene Sechseck', 'Sechsecke', 'Nach deinem dritten Zug zeichnet sie Waben und verrät dir, ob die Zahl durch 5 teilbar ist.',
  'Waben sind perfekte Sechsecke! 📐', 'Summ! Die Zahl ist {k}!', 'Die Zeichnung geht auf!', 'Kennst du dich mit Geometrie aus?!', 'Ein schnurgerader Sieg!', 'Mein Zirkel ist kaputt…')
r('Alpaka Bauplan', 'Bauplan', 'Ist sie „Glühend“, rollt sie ihren Bauplan aus und zeigt dir die Zehnerziffer der Zahl. Einmal pro Runde.',
  'Ich zeichne Brücken und Türme! 📏', 'Bauplan: {k}!', 'Alles nach Plan!', 'Bist du auch Ingenieur?!', 'Ich habe einen Sieg gebaut!', 'Der Bauplan ist zerknittert…')
r('Rennmaus Labori', 'Experiment', 'Wird sie wärmer, macht sie ein Experiment und erfährt die letzte Ziffer der Zahl. Dir verrät sie es nicht. Einmal pro Runde.',
  'Experimente sind der beste Lehrer! 🧫', 'Hat geklappt… ich weiß mehr.', 'Das Experiment bestätigt es!', 'Wiederholst du mein Experiment?!', 'Experiment — Erfolg!', 'Das Experiment ist schiefgegangen…')
b('Die Rektorin Schleiereule', 'Prüfung', 'Schon zu Beginn der Runde kennt sie die letzte Ziffer der Zahl. Dir verrät sie es nicht.',
  'Hinweis der Rektorin', 'Nach deinem dritten Zug verrät sie dir fairerweise dieselbe Ziffer: die letzte.',
  'Willkommen an der Akademie! 👑', 'Ich kenne die Antwort. Mal sehen, ob du sie kennst.', 'Hinweis der Rektorin: {k}!',
  'Die Prüfung ist fast bestanden!', 'Ausgezeichnet!', 'Die Prüfung ist vorbei — ich gewinne! 👑', 'Eine glatte Eins für dich…')

# 43 · Verlorener Tempel
r('Quetzal Smaragd', 'Heilige Feder', 'Bist du „Glühend“, lässt er eine heilige Feder fallen und verrät dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Ich bin der heilige Vogel des Tempels! 🪶', 'Die Feder sagt: Die Zahl ist {k}!', 'Die Feder führt zur Antwort!', 'Du hast meine Feder gefunden?!', 'Ein smaragdgrüner Sieg!', 'Ich fliege in den Dschungel…')
r('Brüllaffe Krawall', 'Gebrüll', f'Bist du „Sehr heiß“ oder näher, brüllt er über den ganzen Wald: {MEM}. Einmal pro Runde.',
  'Mich hört man fünf Kilometer weit! 📣', 'UH-WAAA! Du merkst dir nur zwei Züge!', 'Ich brülle vor Freude — nah!', 'Bist du taub geworden?!', 'Ein lauter Sieg!', 'Ich bin heiser…')
r('Pekari Grunzi', 'Ausgrabung', 'Mit seinem vierten Zug gräbt er einen Hinweis aus und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht.',
  'Grunz! Ich grabe alte Geheimnisse aus! 🐗', 'Ausgegraben… jetzt weiß ich mehr.', 'Ich grabe zur Antwort!', 'Gräbst du auch hier?!', 'Grunz — ich gewinne!', 'Nichts gefunden…')
r('Klammeraffe Fünfhand', 'Schwanzhand', f'Nach deinem zweiten Zug schnappt sie sich mit dem Schwanz deinen {K}: Jetzt gehört er ihr.',
  'Ich habe fünf Hände — eine davon ist mein Schwanz! 🐒', 'Mit dem Schwanz geschnappt! Dein „⚡“ gehört mir!', 'Ich komme an die Antwort ran!', 'Du bist flink!', 'Ein Sieg mit Schwung!', 'Mein Schwanz ist müde…')
r('Basilisk Platschi', 'Lauf übers Wasser', 'Ist er „Kalt“ oder weiter weg, sprintet er übers Wasser: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Ich kann übers Wasser laufen! 💧', 'Platsch-platsch-platsch! Zwei Züge hintereinander!', 'Ich renne direkt zur Antwort!', 'Kannst du auch übers Wasser laufen?!', 'Ein nasser Sieg!', 'Ich bin untergegangen…')
r('Wickelbär Greifi', 'Nachteinbruch', f'Beim sechsten Zug der Runde bricht die Nacht herein: {FOG}.',
  'Ich gehe nachts aus! 🌙', 'Nacht! Du siehst meine Züge nicht!', 'Im Dunkeln sehe ich die Antwort!', 'Siehst du im Dunkeln?!', 'Ein nächtlicher Sieg!', 'Morgengrauen… ab ins Bett.')
r('Ozelot Tupfen', 'Hinterhalt', 'Sein vierter Zug versteckt sich im Laub: Du siehst ihn nicht.',
  'Meine Flecken verstecken mich im Laub! 🐆', 'Psst! Dieser Zug liegt im Hinterhalt!', 'Ich schleiche mich an die Antwort!', 'Du hast meinen Hinterhalt entdeckt?!', 'Ein Sprung aus dem Hinterhalt — ich gewinne!', 'Der Hinterhalt ist gescheitert…')
r('Tamandua Schlecker', 'Lange Zunge', f'Mit seinem dritten Zug schleckt er deinen {K} auf — und weg ist er.',
  'Meine Zunge ist länger als mein Kopf! 👅', 'Schleck! Dein „⚡“ ist weg!', 'Ich schmecke die Antwort!', 'Du bist ausgewichen?!', 'Ein Sieg zum Abschlecken!', 'Meine Zunge ist müde…')
r('Ara Fackel', 'Feuerflügel', f'Mit seinem dritten Zug schlägt er mit seinen feurigen Flügeln: {LAVA}.',
  'Meine Federn lodern wie eine Fackel! 🔥', 'Flatter! Dein Zug ist irgendwohin geflogen!', 'Ich fliege zur Antwort!', 'Du leuchtest heller als ich?!', 'Ein feuriger Sieg!', 'Meine Federn sind verblasst…')
b('Häuptling Balam', 'Blick des Häuptlings', 'Wird er kälter, sieht er dich so an, dass du einfrierst und einen Zug aussetzt. Einmal pro Runde.',
  'Geschenketausch', 'Mit seinem ersten Zug tauscht er mit dir die „⚡ +1 Zug“: Deine gehen an ihn, seine an dich.',
  'Ich bin der Häuptling des verlorenen Tempels! 👑', 'Der Blick des Häuptlings! Einfrieren — setz einen Zug aus!', 'Geschenketausch — wir tauschen die „⚡“!',
  'Der Tempel verrät mir die Antwort!', 'Du bist des Tempels würdig!', 'Der Häuptling gewinnt! 👑', 'Der Tempel gehört dir, Reisender…')

# 44 · Große Steppe
r('Manul Grummel', 'Grimmiger Blick', f'Nach deinem vierten Zug schaut er so grimmig, dass dein {K} erlischt.',
  'Ich lächle nicht. Niemals 😾', 'Hmpf! Dein „⚡“ ist erloschen!', 'Grimmig, aber nah!', 'Du hast mich zum Lachen gebracht?!', 'Ein grimmiger Sieg!', 'Hmpf… na gut.')
r('Saiga Schnuffel', 'Staubsturm', 'Ist er „Sehr kalt“, verschwindet sein Zug im Staub: Du siehst ihn nicht. Einmal pro Runde.',
  'Meine Nase filtert den Steppenstaub! 🏜️', 'Staub! Diesen Zug siehst du nicht!', 'Ich galoppiere zur Antwort!', 'Rennst du mit mir?!', 'Ein Steppensieg!', 'Im Staub verschwunden…')
r('Przewalski-Pferd Falbi', 'Wilder Galopp', 'Nach deinem zweiten Zug fällt sie in Galopp: Beim nächsten Mal zieht sie zweimal hintereinander.',
  'Ich bin das letzte Wildpferd der Erde! 🐴', 'Galopp! Zwei Züge hintereinander!', 'Ich galoppiere zur Antwort!', 'Du galoppierst so gut wie ich?!', 'Ein Sieg im vollen Galopp!', 'In die Steppe galoppiert…')
r('Kulan Galopp', 'Wettrennen', 'Bei jedem vierten seiner Züge zieht er sofort noch einmal.',
  'Ich bin schneller als der Steppenwind! 🏇', 'Wettrennen! Ich ziehe noch mal!', 'Ich hole die Antwort ein!', 'Du galoppierst schneller?!', 'Ein rasanter Sieg!', 'Zu müde zum Galoppieren…')
r('Trampeltier Karawane', 'Karawane', f'Beim sechsten Zug der Runde kommt die Karawane an: je einen {K} für dich und für ihn.',
  'Zwei Höcker — doppelter Vorrat! 🐫', 'Die Karawane ist da! Ein „⚡ +1 Zug“ für jeden!', 'Die Karawane zieht zur Antwort!', 'Du hast mich eingeholt!', 'Die Karawane gewinnt!', 'Die Karawane ist weitergezogen…')
r('Ziesel Pfosten', 'Ausguck', 'Wird er kälter, macht er Männchen, schaut in die Ferne und erfährt die Zehnerziffer der Zahl. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich mache Männchen und schaue in die Ferne! 🐿️', 'Pfiiit! Ich habe etwas entdeckt…', 'Ich sehe die Antwort in der Ferne!', 'Machst du auch Männchen?!', 'Pfiiit — ich gewinne!', 'Ich verstecke mich im Bau…')
r('Trappe Wichtig', 'Wichtigtuerei', 'Nach deinem dritten Zug stolziert sie so wichtig an dir vorbei, dass du warten musst: Du setzt einen Zug aus.',
  'Ich bin der schwerste fliegende Vogel! 🦃', 'Platz da! Setz einen Zug aus!', 'Ich schreite wichtig zur Antwort!', 'Du bist wichtiger als ich?!', 'Ein wichtiger Sieg!', 'Meine Federn hängen…')
r('Tigeriltis Tupfi', 'Schwanz hoch', f'Mit ihrem zweiten Zug stellt sie den Schwanz auf: {MEM}.',
  'Ich bin so bunt wie ein Steppenteppich! 🦨', 'Schwanz hoch! Du merkst dir nur zwei Züge!', 'Ich flitze um die Antwort herum!', 'Ich habe dich nicht erschreckt?!', 'Ein gefleckter Sieg!', 'Zurück in meinen Bau…')
r('Korsak Dämmer', 'Dämmerung', 'Wird er wärmer, senkt sich die Dämmerung über die Steppe: Bis zum Rundenende siehst du deine eigenen Züge nicht. Einmal pro Runde.',
  'Der Steppenfuchs ist der Schlauste! 🦊', 'Dämmerung! Du siehst deine eigenen Züge nicht!', 'Schlauheit führt zur Antwort!', 'Du bist schlauer als ich?!', 'Ein schlauer Sieg!', 'Ausgetrickst…')
b('Der Adler-Khan', 'Sturzflug', f'Bist du „Kalt“ oder weiter weg, stößt er auf dich herab: {LAVA}. Einmal pro Runde.',
  'Blick von oben', 'Ist er „Glühend“, schaut er von oben herab und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich bin der Khan dieser Steppe! 👑', 'Sturzflug! Dein Zug ist irgendwohin geflogen!', 'Von oben sehe ich mehr…',
  'Die Antwort ist in meinen Krallen!', 'Du hast Augen wie ein Adler!', 'Der Khan gewinnt! 👑', 'Die Steppe gehört dir…')

# 45 · Asgard
r('Sleipnir Achtbein', 'Acht Beine', 'Ist er „Sehr kalt“, galoppiert er auf allen acht Beinen: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Ich habe acht Beine — fang mich! 🐎', 'Acht Beine! Zwei Züge hintereinander!', 'Ich galoppiere durch die Welten zur Antwort!', 'Reitest du mit mir?!', 'Ein achtbeiniger Sieg!', 'Meine Beine haben sich verheddert…')
r('Rabe Hugin', 'Gedanke', 'Bist du „Warm“ oder näher, fliegt er um die Welt und erfährt, ob die Zahl größer oder kleiner als deine ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Mein Name bedeutet Gedanke — Hugin! 🪶', 'Ich bin um die Welt geflogen… ich weiß mehr.', 'Gedanken führen zur Antwort!', 'Du denkst schnell!', 'Ein weiser Sieg!', 'Der Gedanke ist davongeflogen…')
r('Eichhörnchen Ratatöskr', 'Neues von der Esche', 'Mit ihrem zweiten Zug rennt sie die Esche hinauf und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät sie es nicht.',
  'Ich renne den Weltenbaum rauf und runter! 📯', 'Neues von der Esche… ich weiß mehr.', 'Ich renne zur Antwort!', 'Du rennst schneller?!', 'Ein Eichhörnchen-Sieg!', 'Ab in die Baumkrone…')
r('Wolfswelpe Fenrir', 'Kleine Zähne', f'Nach deinem ersten Zug knabbert er deinen {K} an — und weg ist er.',
  'Grrr! Ich werde mal groß! 🐺', 'Knack! Dein „⚡“ ist weg!', 'Ich rieche die Antwort!', 'Du hast keine Angst vor mir?!', 'Ein wölfischer Sieg!', 'Ich gehe zurück zu Mama…')
r('Zicklein Donnerer', 'Donner', 'Bei jedem dritten seiner Züge grollt der Donner: Du setzt einen Zug aus.',
  'Mäh! Ich ziehe den Donnerwagen! 🌩️', 'KA-WUMM! Setz einen Zug aus!', 'Der Donner führt mich zur Antwort!', 'Du hast keine Angst vor Donner?!', 'Ein donnernder Sieg!', 'Das Gewitter ist vorbei…')
r('Frostriese Eiszapfen', 'Frost', 'Nach deinem zweiten Zug haucht er Frost: Du frierst ein und setzt einen Zug aus.',
  'Ich bin ein kleiner Frostriese! ❄️', 'Huuu! Einfrieren — setz einen Zug aus!', 'Das Eis führt zur Antwort!', 'Ist dir nicht kalt?!', 'Ein eisiger Sieg!', 'Ich schmelze…')
r('Walküre Sigrun', 'Über den Wolken', 'Beim dritten Zug der Runde steigt sie über die Wolken: Bis zum Rundenende siehst du ihre Züge nicht.',
  'Ich wähle die Mutigsten! ⚔️', 'Hinauf! Du siehst meine Züge nicht!', 'Ich fliege zur Antwort!', 'Du bist ein tapferer Krieger!', 'Ruhm dem Sieg!', 'Ab nach Walhall…')
r('Waldkatze Freya', 'Schnurren', 'Nach deinem ersten Zug schnurrt sie so sanft, dass du schläfrig wirst: Bis zum Rundenende siehst du nur die letzten zwei Züge.',
  'Ich ziehe den Wagen der Göttin! 🐈', 'Schnurr… Du merkst dir nur zwei Züge!', 'Ich schnurre direkt neben der Antwort!', 'Streichelst du mich?!', 'Ein schnurriger Sieg!', 'Ab in den Wald…')
r('Bärenjunges Berserker', 'Raserei', 'Zu Beginn der Runde gerät er in Raserei und wirbelt eine Schneewolke auf: Bis zum Rundenende siehst du seine Züge nicht.',
  'Grrr! Ich bin furchterregend… fast! 🐻', 'GRRR! Du siehst meine Züge nicht!', 'Die Raserei führt zur Antwort!', 'Du hattest keine Angst?!', 'Ein wilder Sieg!', 'Meine Wut ist verflogen…')
b('Jörmungandr die Weltenschlange', 'Sturm', f'Mit seinem vierten Zug entfacht er einen Sturm: {LAVA}.',
  'Meeresnebel', f'Bist du „Sehr kalt“, steigt Nebel über dem Meer auf: {FOG}. Einmal pro Runde.',
  'Ich schlinge meinen Schwanz um die ganze Welt! 👑', 'Sturm! Dein Zug ist irgendwohin geflogen!', 'Nebel! Du siehst meine Züge nicht!',
  'Die Antwort ist schon in meinen Windungen!', 'Du hast mein Meer überquert!', 'Die Weltenschlange gewinnt! 👑', 'Ich lasse meinen Schwanz los…')
