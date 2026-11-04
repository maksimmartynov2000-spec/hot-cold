WORLDS = ['Savanne', 'Spielzeugland', 'Dunkler Abgrund', 'Bambushain', 'Uhrenstadt',
          'Australien', 'Zirkus', 'Kristallhöhlen', 'Wintermärchen', 'Regenbogenland']
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

# 16 · Savanne
r('Nashorn Bubu', 'Vogel auf dem Horn', 'Wirst du wärmer, zwitschert der Vogel auf seinem Horn, ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Ich bin groß, und der Vogel ist mein Freund! 🐤', 'Piep-piep! Die Zahl ist {k}!', 'Mein Horn spürt das Ziel!', 'Oh, du bist ganz nah!', 'Ein Nashorn-Sieg!', 'Komm, Vogel, wir gehen…')
r('Warzenschwein Blümchen', 'Liebe Hauer', f'Ist das Warzenschwein „Kalt“ oder weiter weg, macht es nichts — es schenkt dir einen {K}. Einmal pro Runde.',
  'Ich habe Hauer, aber ich bin lieb 🌼', 'Daneben! Hier, eine Blume — „⚡ +1 Zug“!', 'Grunz! Ich bin nah dran!', 'Oh, du bist nah dran!', 'Ein Grunz-Sieg!', 'Behalte die Blume…')
r('Gepard Sprint', 'Spurt', 'Nach seinem ersten Zug legt er los: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Ich bin der Schnellste der Savanne! 🏁', 'Spurt! Nächster Zug — doppelt!', 'Fast im Ziel!', 'Du läufst schneller als ich?!', 'Als Erster im Ziel!', 'Aus der Puste…')
r('Hyäne Kicher', 'Kicheranfall', 'Wirst du kälter, lacht sie so sehr, dass sie sich verplappert: Die Zahl ist größer oder kleiner als deine. Einmal pro Runde.',
  'Hihi, spielen wir? 😆', 'Hahaha! Sie ist {k}!', 'Ha! Heiß!', 'Nicht lustig — du bist nah!', 'Haha, gewonnen!', 'Ha… du bist gut!')
r('Strauß Stampfi', 'Kopf in den Sand', 'Bist du „Sehr heiß“ oder näher, steckt er den Kopf in den Sand — und deinen Zug gleich mit: Du siehst ihn nicht. Einmal pro Runde.',
  'Ich bin klein, aber ich renne schnell! 🙈', 'Kopf in den Sand — und dein Zug auch!', 'Stampf-stampf — fast!', 'Huch, du bist nah!', 'Gewonnen!', 'Ich verstecke mich im Sand…')
r('Gazelle Sprung', 'Großer Sprung', 'Wird sie wärmer, macht sie einen großen Sprung: Beim nächsten Mal zieht sie zweimal hintereinander. Einmal pro Runde.',
  'Ich bin leicht wie der Wind! 🌿', 'Hopp! Nächster Zug — doppelt!', 'Das Ziel ist nah!', 'Du springst genauso gut!', 'Ein Sprung zum Sieg!', 'Gestolpert…')
r('Gnu Bart', 'Die große Wanderung', 'Beim vierten Zug der Runde rennt die Herde vorbei: Du setzt einen Zug aus.',
  'Wir sind ganz, ganz viele! 🐃', 'Die Herde kommt! Setz einen Zug aus!', 'Die Herde riecht das Ziel!', 'Du hast die Herde überholt!', 'Die Herde gewinnt!', 'Die Herde ist weitergezogen…')
r('Galago Kulleraugen', 'Nachtaugen', 'Ab seinem zweiten Zug sieht er, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht.',
  'Schau mal, was für große Augen ich habe! 👀', 'Meine Augen sehen alles — ich kenne die Hälfte!', 'Ich sehe das Ziel!', 'Du siehst auch im Dunkeln?!', 'Ein Kulleraugen-Sieg!', 'Meine Augen sind müde…')
r('Sekretärvogel Schreiber', 'Notiz', 'Nach deinem dritten Zug schreibt er es auf und verrät dir, in welcher Hälfte die Zahl liegt.',
  'Ich schreibe alles auf! ✒️', 'Notiert: {k}.', 'Das Ziel steht auf meiner Liste!', 'Du schreibst schneller als ich!', 'Sieg notiert!', 'Meine Feder ist zerbrochen…')
b('Die Leopardenkönigin', 'Getupfter Tausch', 'Wirst du wärmer, tauscht sie mit dir die „⚡ +1 Zug“: Deine gehen an sie, ihre an dich. Einmal pro Runde.',
  'Hinterhalt', 'Bist du „Sehr heiß“ oder näher, springt sie aus dem Hinterhalt: Du setzt einen Zug aus. Einmal pro Runde.',
  'Die Savanne ist mein Königreich! 🐆', 'Tausch! Deine „⚡“ gehören mir, meine dir!', 'Hinterhalt! Setz einen Zug aus!',
  'Meine Beute ist nah!', 'Wie mutig!', 'Königin der Savanne! 👑', 'Du bist schneller als ein Leopard!')

# 17 · Spielzeugland
r('Kreisel Drehdich', 'Aufdrehen', f'Wirst du wärmer, dreht er sich schneller und holt sich einen {K}. Einmal pro Runde.',
  'Ich drehe mich und drehe mich! 🌀', 'Surr! Ein „⚡ +1 Zug“ für mich!', 'Mir ist schwindlig — heiß!', 'Gleich hältst du mich an!', 'Eine Ehrenrunde!', 'Ich bin umgekippt…')
r('Schaukelpferd Hü', 'Hin und her', 'Ist das Schaukelpferd „Warm“ oder näher, schaukelt es und verplappert sich: Die Zahl ist größer oder kleiner als seine. Einmal pro Runde.',
  'Hü! Schaukeln wir? 🐴', 'Klipp-klapp! Sie ist {k}!', 'Im Galopp zum Ziel!', 'Du galoppierst schneller!', 'Hü, gewonnen!', 'Zu doll geschaukelt…')
r('Springteufel Socke', 'Überraschung!', f'Nach deinem zweiten Zug springt er aus der Schachtel — du erschrickst so, dass: {LAVA}.',
  'Klopf-klopf! Wer ist in der Schachtel? 🧦', 'Buh! Überraschung! Ein wilder Wurf!', 'Gleich springe ich raus!', 'Mach den Deckel nicht auf!', 'Überraschung gelungen!', 'Meine Feder ist müde…')
r('Eisenbahn Tschu', 'Volldampf', 'Nach ihrem dritten Zug macht sie Dampf: Beim nächsten Mal zieht sie zweimal hintereinander.',
  'Tschu-tschu! Los geht’s! 🚂', 'Tuut-tuut! Volldampf — doppelt!', 'Der Bahnhof ist nah!', 'Du bist schneller als ein Zug!', 'Am Sieg angekommen!', 'Entgleist…')
r('Matroschka-Schwestern', 'Puppe in der Puppe', 'Ihr dritter Zug versteckt sich in einer Puppe: Du siehst ihn nicht.',
  'Wir sind drei Schwestern! 🪆', 'Der Zug versteckt sich in einer Puppe!', 'Oh, heiß!', 'Mach uns nicht auf!', 'Die Schwestern gewinnen!', 'Wir sind auseinandergefallen…')
r('Jo-Jo Schleife', 'Zurück', 'Wirst du kälter, kommt das Jo-Jo zurück: Du ziehst sofort noch einmal. Einmal pro Runde.',
  'Rauf und runter! 🪀', 'Zisch — zurück! Zieh noch mal!', 'Zisch — fast!', 'Du bist geschickt!', 'Eine Siegesschleife!', 'Meine Schnur hat sich verheddert…')
r('Trommel Bumm', 'Trommelwirbel', 'Beim dritten Zug der Runde — Trommelwirbel: Du setzt einen Zug aus.',
  'Bumm-bumm! 🥁', 'Trrrr! Setz einen Zug aus!', 'Der Wirbel wird lauter!', 'Du hältst den Takt!', 'Ein Siegesmarsch!', 'Meine Stöcke sind zerbrochen…')
r('Sparschwein Klimper', 'Die Münze', f'Nach deinem zweiten Zug fällt dein {K} ins Sparschwein und ist weg.',
  'Oink! Ich spare Münzen! 🐷', 'Kling! Dein „⚡“ ist im Sparschwein!', 'Es klimpert — heiß!', 'Mach mich nicht kaputt!', 'Ein Sparschwein voller Siege!', 'Das Sparschwein ist leer…')
r('Papierflieger Falti', 'Gleitflug', 'Wird er kälter, gleitet er nach unten und setzt seinen Zug aus. Einmal pro Runde.',
  'Ich fliege! ✈️', 'Wusch… ich gleite — setze aus.', 'Ich fliege zum Ziel!', 'Du fliegst höher!', 'Sanfte Landung — gewonnen!', 'Ich bin zerknittert…')
b('Der Klötzchenkönig', 'Klötzchenmauer', f'Ist er „Glühend“, baut er eine Mauer: {BLIND}. Einmal pro Runde.',
  'Der Turm wächst', 'Beim vierten Zug der Runde baut er seinen Turm höher: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Ich habe ein ganzes Königreich gebaut! 🧱', 'Eine Mauer! Du siehst deine Züge nicht!', 'Der Turm wächst — zwei Züge!',
  'Das Königreich ist fast meins!', 'Du stößt meinen Turm um!', 'König der Spielsachen! 👑', 'Mein Turm ist eingestürzt…')

# 18 · Dunkler Abgrund
r('Anglerfisch Lämpchen', 'Kleine Laterne', 'Bist du „Kalt“ oder weiter weg, leuchtet er mit seiner Laterne und verrät dir, ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Mit mir ist die Dunkelheit nicht schlimm 🏮', 'Ich leuchte: Die Zahl ist {k}!', 'Meine Laterne leuchtet heller — nah!', 'Du hast das Licht gefunden!', 'Ein heller Sieg!', 'Mein Lämpchen ist aus…')
r('Dumbo-Krake Flatterohr', 'Tintenwolke', f'Ist er „Sehr heiß“ oder näher, spritzt er Tinte: {FOG}. Einmal pro Runde.',
  'Ich winke dir mit meinen Ohren! 🐙', 'Pfff! Tinte — du siehst nichts!', 'Ich bin nah dran!', 'Du siehst durch Tinte?!', 'Ein Sieg aus der Tiefe!', 'Ich schwimme ins Dunkel…')
r('Laternenfisch Blinki', 'Kleine Lichter', 'Mit seinem ersten Zug schaltet er seine Lichter an und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht.',
  'Ich leuchte! ✨', 'Meine Lichter sind an — ich kenne die Hälfte!', 'Meine Lichter leuchten heller!', 'Du leuchtest auch?!', 'Ein strahlender Sieg!', 'Meine Lichter sind aus…')
r('Riesenassel Panzer', 'Panzerung', f'Du schaltest deinen {K} ein — sie rollt sich in ihren Panzer und holt sich einen {K}. Einmal pro Runde.',
  'Ich habe einen harten Panzer! 🛡️', 'Klonk! Panzer — und ein „⚡“ für mich!', 'Ich krabbele zum Ziel!', 'Du hast meinen Panzer geknackt!', 'Ein gepanzerter Sieg!', 'Ich habe mich eingerollt…')
r('Seeengel Flügelchen', 'Lieber Engel', f'Bist du „Sehr kalt“, hat er Mitleid mit dir und schenkt dir einen {K}. Einmal pro Runde.',
  'Ich schwebe in der Tiefe 😇', 'Sei nicht traurig — hier ist ein „⚡ +1 Zug“!', 'Oh, nah!', 'Fast gefunden!', 'Ein engelhafter Sieg!', 'Gut gemacht!')
r('Garnele Knall', 'Knall!', f'Wird sie wärmer, knallt sie laut mit der Schere: {LAVA}. Einmal pro Runde.',
  'Ich bin klein, aber laut! 🦐', 'KNALL! Ein wilder Wurf!', 'Knall — nah!', 'Du hattest keine Angst?!', 'Knall — gewonnen!', 'Meine Schere ist müde…')
r('Pelikanaal Schluck', 'Großes Maul', 'Bist du „Glühend“, verschluckt er deinen Zug: Du siehst ihn nicht. Einmal pro Runde.',
  'Was für ein großes Maul ich habe! 😮', 'Schluck! Dein Zug ist verschluckt!', 'Schluck — fast!', 'Lass dich nicht schnappen!', 'Den Sieg verschluckt!', 'Verschluckt…')
r('Blobfisch Wabbel', 'Faulpelz', 'Beim dritten Zug der Runde wird er ganz schlapp und setzt seinen Zug aus.',
  'Ich bin weich und fröhlich 🫠', 'Wabbel… so faul… ich setze aus.', 'Oh, heiß!', 'Du bist so munter!', 'Wabbel — gewonnen!', 'Ich bin zerflossen…')
r('Beilfisch Spiegel', 'Silberne Seite', 'Ist er „Sehr heiß“ oder näher, sieht er in seiner glänzenden Seite, ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Schau dich in meiner Seite an! 🪞', 'Glanz! Ich weiß, ob sie gerade ist!', 'Es glitzert — nah!', 'Du glänzt genauso!', 'Ein glänzender Sieg!', 'Mein Glanz ist weg…')
b('Die Königin der Tiefe', 'Dunkelheit des Abgrunds', f'Ist sie „Sehr heiß“ oder näher, löscht sie das Licht: {BLIND}. Einmal pro Runde.',
  'Kalte Strömung', f'Wirst du kälter, löscht die Strömung deinen {K}. Einmal pro Runde.',
  'Willkommen in meinem Abgrund… ✨', 'Dunkelheit! Du siehst deine Züge nicht!', 'Die Strömung hat deinen „⚡“ mitgerissen!',
  'Die Tiefe führt mich!', 'Du hast keine Angst vor der Dunkelheit?!', 'Der Abgrund gehört mir! 👑', 'Du hast den Abgrund erhellt!')

# 19 · Bambushain
r('Goldaffe Goldi', 'Flinke Pfoten', f'Ist er „Warm“ oder näher, schnappt er sich deinen {K}. Einmal pro Runde.',
  'U-u-a! Ich bin golden! 🐒', 'Schnapp! Der „⚡“ gehört mir!', 'Fast erwischt!', 'Du bist flinker als ein Affe!', 'Ein goldener Sieg!', 'Vom Ast gefallen…')
r('Kleiner Panda Rosti', 'Eine Leckerei', f'Nach deinem dritten Zug gibt er dir etwas Leckeres: einen {K} für dich.',
  'Hallo! Ich bin flauschig! 🍎', 'Hier, ein Apfel — „⚡ +1 Zug“!', 'Oh, warm!', 'Fast erraten!', 'Ein flauschiger Sieg!', 'Gut gemacht!')
r('Kranich Tänzer', 'Kranichtanz', 'Nach seinem vierten Zug tanzt er und setzt seinen Zug aus.',
  'Tanzen wir? 💃', 'La-la… ich tanze — setze aus.', 'Der Tanz führt zum Ziel!', 'Du tanzt besser!', 'Ein Siegestanz!', 'Aus dem Takt…')
r('Koi Wunsch', 'Wünsche werden wahr', f'Beim fünften Zug der Runde erfüllt er einen Wunsch: einen {K} für dich.',
  'Wünsch dir was! 🎏', 'Wunsch erfüllt — „⚡ +1 Zug“!', 'Ich schwimme zum Ziel!', 'Du errätst meine Wünsche!', 'Ein Wunsch-Sieg!', 'Ich schwimme davon…')
r('Goldfasan Flamme', 'Feuerschweif', 'Ist er „Glühend“, fächert er seinen Schweif auf: Diesen Zug siehst du nicht. Einmal pro Runde.',
  'Bewundere meine Federn! 🎐', 'Schweif aufgefächert — der Zug ist weg!', 'Meine Federn glühen — heiß!', 'Du strahlst heller als ich!', 'Ein funkelnder Sieg!', 'Meine Federn sind ausgefallen…')
r('Tanuki Schlaumeier', 'Verwandlung', 'Deinen ersten Zug versteckt er unter einem Blatt: Du siehst ihn nicht.',
  'Ich kann mich verwandeln! 🍃', 'Puff! Dein Zug liegt unter einem Blatt!', 'Hihi, nah!', 'Du hast meinen Streich durchschaut?!', 'Ein magischer Sieg!', 'Mein Blatt ist abgefallen…')
r('Glühwürmchen Funzel', 'Licht in der Nacht', 'Wirst du kälter, leuchtet es dir den Weg: in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Ich leuchte dir den Weg! 💡', 'Ich leuchte: {k}.', 'Ich leuchte heller!', 'Du siehst auch ohne Licht!', 'Ein heller Sieg!', 'Mein Licht ist aus…')
r('Schuppentier Schuppi', 'Einrollen', f'Bist du „Warm“ oder näher, rollt sich das Schuppentier zusammen: Dein {K} prallt an den Schuppen ab und erlischt. Einmal pro Runde.',
  'Meine Schuppen sind wie ein Panzer! 🧶', 'Eingerollt! Dein „⚡“ ist abgeprallt!', 'Ich spüre es — nah!', 'Du hast keine Angst vor Schuppen?!', 'Ein schuppiger Sieg!', 'Ich habe mich eingerollt…')
r('Bambussprössling Sprössi', 'Er wächst', 'Er wächst nach oben: Jede seiner Zahlen ist größer als die vorige, solange es geht.',
  'Ich wachse jeden Tag! 🎋', 'Ich wachse! Höher und höher!', 'Fast hingewachsen!', 'Du wächst schneller!', 'Bis zum Sieg gewachsen!', 'Ich wachse noch…')
b('Der Panda-Kaiser', 'Weisheit', 'Mit seinem zweiten Zug denkt er nach und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät er es nicht.',
  'Meditation', 'Bist du „Warm“ oder näher, erstarrst du in Meditation und setzt einen Zug aus. Einmal pro Runde.',
  'Der Bambushain ist mein Kaiserreich 🐼', 'Die Weisheit hat gesprochen!', 'Ommm… erstarre!',
  'Der Weg ist klar!', 'Du bist weiser als ich?!', 'Die Weisheit siegt! 👑', 'Du verdienst Respekt.')

# 20 · Uhrenstadt
r('Kuckuck Pünktlich', 'Kuckuck!', 'Beim sechsten Zug der Runde ruft er, in welcher Hälfte die Zahl liegt.',
  'Kuckuck! Wie spät ist es? 🕊️', 'Kuckuck! Tipp: {k}.', 'Kuckuck — nah!', 'Du bist pünktlich wie ein Uhrwerk!', 'Kuckuck! Gewonnen!', 'Kuck… kaputt.')
r('Wecker Klingel', 'Aufstehen!', f'Nach deinem dritten Zug klingelt er — du erschrickst so, dass: {LAVA}.',
  'Zeit zum Aufstehen! ⏰', 'RRRING! Ein wilder Wurf!', 'Ich klingle lauter!', 'Du hast nicht verschlafen!', 'Die Siegesglocke!', 'Meine Batterie ist leer…')
r('Sanduhr Rieselchen', 'Umdrehen', 'Nach ihrem vierten Zug dreht sie sich um und zieht sofort noch einmal.',
  'Die Zeit rieselt wie Sand ⏳', 'Umgedreht — noch ein Zug!', 'Der Sand ist fast durch!', 'Du bist schneller als die Zeit!', 'Zeit für den Sieg!', 'Kein Sand mehr…')
r('Taschenuhr Ticktack', 'Zeit ist um', 'Bist du „Sehr kalt“, ist die Zeit um: Du setzt einen Zug aus. Einmal pro Runde.',
  'Ticktack, ticktack! ⌚', 'Ticktack! Zeit ist um — setz aus!', 'Die Zeiger sind nah!', 'Du bist immer pünktlich!', 'Auf die Sekunde!', 'Abgelaufen…')
r('Zahnrad Zacki', 'Verhakt', f'Wird das Zahnrad wärmer, verhakt sich dein {K} in seinen Zähnen: Er zerbricht. Einmal pro Runde.',
  'Ich drehe mich und roste nie! ⚙️', 'Knirsch! Dein „⚡“ ist kaputt!', 'Die Maschine läuft!', 'Du hast die Maschine verstanden!', 'Ein präziser Sieg!', 'Ein Zahn ist abgebrochen…')
r('Otterin Schraube', 'Erfindung', f'Mit ihrem ersten Zug baut sie sich einen {K}.',
  'Ich bin Erfinderin! 🔧', 'Einen „⚡ +1 Zug“ für mich erfunden!', 'Der Bauplan ist fertig!', 'Du bist auch Erfinder?!', 'Die Erfindung hat geklappt!', 'Meine Maschine ist kaputt…')
r('Metronom Takt', 'Taktgeber', 'Beim zweiten Zug der Runde gibt es den Takt an und verrät dir, ob die Zahl größer oder kleiner als diese ist.',
  'Eins-zwei, eins-zwei! 🎼', 'Ticktack! Sie ist {k}!', 'Im Takt — nah!', 'Du hältst den Takt!', 'Ein Siegesrhythmus!', 'Aus dem Takt…')
r('Blechvogel Schlüssel', 'Geheimschlüssel', 'Bei jedem dritten Zug dreht er seinen Schlüssel und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät er es nicht.',
  'Zieh mich auf! 🔑', 'Klick! Das Geheimnis ist offen!', 'Ich singe lauter!', 'Du singst besser als ich!', 'Ein aufgezogener Sieg!', 'Abgelaufen…')
r('Biber Uhrmacher', 'Der Uhrmacher', f'Bist du „Sehr heiß“ oder näher, repariert er eine Uhr und holt sich einen {K}. Einmal pro Runde.',
  'Ich repariere alle Uhren der Stadt! 🔍', 'Repariert — ein „⚡“ für mich!', 'Die Zahnräder passen!', 'Du kennst dich mit Uhren aus!', 'Ein meisterhafter Sieg!', 'Die Uhren sind stehen geblieben…')
b('Der Uhrturmkönig', 'Glockenschlag', 'Beim vierten Zug der Runde schlägt die Uhr: Die Zeit bleibt für dich stehen — du setzt einen Zug aus.',
  'Die Uhr geht vor', 'Ist er „Sehr heiß“ oder näher, zieht er sofort noch einmal. Einmal pro Runde.',
  'Die Zeit ist mein Königreich! 🕰️', 'BONG! Die Zeit steht still!', 'Die Uhr geht vor — noch ein Zug!',
  'Die Zeiger treffen sich!', 'Du bist schneller als die Zeit?!', 'Zeit für den Sieg! 👑', 'Deine Zeit ist gekommen!')

# 21 · Australien
r('Känguru Beutel', 'Hüpf-hüpf', 'Nach deinem ersten Zug hüpft das Känguru: Beim nächsten Mal zieht es zweimal hintereinander.',
  'Mein Baby und ich hüpfen zusammen! 🦘', 'Hüpf-hüpf! Zwei Züge hintereinander!', 'Ich hüpfe hin!', 'Du hüpfst weiter!', 'Ein Sprung zum Sieg!', 'Müde vom Hüpfen…')
r('Koala Schlummer', 'Schläfrig', 'Bist du „Warm“ oder näher, wird er schläfrig und setzt seinen Zug aus. Einmal pro Runde.',
  'Auf meinem Ast ist es so gemütlich 🐨', 'Warm… schläfrig… ich setze aus.', 'Oh, heiß…', 'Du hast mich geweckt!', 'Ein verschlafener Sieg!', 'Ich schlafe noch ein bisschen…')
r('Wombat Kugelrund', 'Der Bau', f'Bist du „Kalt“ oder weiter weg, fällt dein {K} in seinen Bau. Einmal pro Runde.',
  'Ich bin kugelrund und grabe Baue 🟫', 'Plumps! Dein „⚡“ ist in meinem Bau!', 'Ich grabe zum Ziel!', 'Du hast meinen Bau gefunden!', 'Ein kugelrunder Sieg!', 'Ich verstecke mich in meinem Bau…')
r('Schnabeltier Flosse', 'Schlauer Schnabel', 'Nach seinem zweiten Zug spürt sein Schnabel, ob die Zahl größer oder kleiner als seine ist — und es verrät es dir.',
  'Ich bin halb Ente, halb Biber! 📡', 'Mein Schnabel spürt es: Sie ist {k}!', 'Mein Schnabel spürt das Ziel!', 'Du spürst es genauso gut!', 'Ein Schnabeltier-Sieg!', 'Ich tauche tiefer…')
r('Ameisenigel Stachelchen', 'Stacheln', f'Bist du „Warm“ oder näher, spießt er sich einen {K} auf. Einmal pro Runde.',
  'Vorsicht, ich bin stachelig! 🪡', 'Einen „⚡“ aufgespießt!', 'Meine Nase sagt — nah!', 'Du hast keine Angst vor Stacheln?!', 'Ein stacheliger Sieg!', 'Ich habe mich eingerollt…')
r('Kakadu Haube', 'Nachplapperer', 'Beim dritten Zug der Runde plappert er diese Zahl nach und ruft: Die gesuchte ist größer oder kleiner.',
  'Hallo! Hallo! 🗯️', 'Krächz! Sie ist {k}!', 'Nah! Nah!', 'Du rätst! Du rätst!', 'Sieg! Sieg!', 'Tschüss! Tschüss!')
r('Kookaburra Lachsack', 'Lachkrampf', 'Wirst du kälter, lacht er so sehr, dass er seinen Zug aussetzt. Einmal pro Runde.',
  'Haha! Wie lustig! 😂', 'Hahaha! Vor Lachen setze ich aus!', 'Ha — heiß!', 'Nicht lustig — du bist nah!', 'Haha, gewonnen!', 'Ausgelacht…')
r('Quokka Lächel', 'Das Lächeln', f'Wirst du wärmer, freut sich das Quokka so sehr, dass es dir und sich je einen {K} schenkt. Einmal pro Runde.',
  'Ich bin das fröhlichste Tier! 😊', 'Juhu! Ein „⚡ +1 Zug“ für alle!', 'Ich lächle — nah!', 'Du lächelst zurück!', 'Ein lächelnder Sieg!', 'Ich lächle trotzdem!')
r('Teufelchen Wirbelwind', 'Wirbelsturm', f'Mit seinem ersten Zug fegt es wie ein Wirbelsturm vorbei — dein {K} ist weg.',
  'Grrr! Ich bin flink! 🔥', 'Wusch! Dein „⚡“ ist weggeweht!', 'Ich sause zum Ziel!', 'Du bist schneller als ein Wirbelsturm?!', 'Ein stürmischer Sieg!', 'Der Sturm hat sich gelegt…')
b('Der Krokodilkönig', 'Krokodilgriff', 'Bist du „Sehr heiß“ oder näher, packt er zu: Du erstarrst und setzt einen Zug aus. Einmal pro Runde.',
  'Sonnenbad', f'Nach seinem dritten Zug sonnt er sich und holt sich einen {K}.',
  'Australien ist mein Fluss! 🐊', 'Schnapp! Erstarre!', 'Sonnenschein — ein „⚡“ für mich!',
  'Meine Beute ist nah!', 'Du hast keine Angst vor Zähnen?!', 'König des Flusses! 👑', 'Ich schwimme davon…')

# 22 · Zirkus
r('Clown Pompon', 'Glückliche Sieben', 'Er liebt die Sieben: Solange noch viele Zahlen übrig sind, nennt er Zahlen mit einer 7.',
  'Hallo, hallo, die Vorstellung beginnt! 7️⃣', 'Sieben ist meine Glückszahl!', 'Ha — fast!', 'Du bist lustiger als ein Clown!', 'Ein Zirkussieg!', 'Bravo, bravo!')
r('Lemur Seiltänzer', 'Hoch oben', 'Wird er wärmer, sieht er vom Seil aus, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich laufe auf dem Seil! ☂️', 'Vom Seil sehe ich die Hälfte!', 'Ich laufe zum Ziel!', 'Du hältst das Gleichgewicht!', 'Ein Seiltänzer-Sieg!', 'Runtergefallen… ins Netz!')
r('Capybara Geschickt', 'Jonglieren', f'Beim dritten Zug der Runde wirft sich das Capybara einen {K} zu.',
  'Ich bin ruhig und geschickt 🤹', 'Hopp! Ein „⚡“ für mich!', 'Die Bälle fliegen zum Ziel!', 'Du fängst besser!', 'Ein Jongleur-Sieg!', 'Meine Bälle sind runtergefallen…')
r('Ballonhund Quietsch', 'Peng!', f'Ist er „Glühend“, platzt ein Ballon, und er verliert seinen {K}. Einmal pro Runde.',
  'Wuff! Ich bin aus Ballons! 🎊', 'Peng! Mein „⚡“ ist geplatzt!', 'Wuff — nah!', 'Stich mich nicht!', 'Ein aufgeblasener Sieg!', 'Die Luft ist raus…')
r('Lama Akrobat', 'Spucke', 'Wirst du kälter, spuckt das Lama: Diesen Zug von dir siehst du nicht. Einmal pro Runde.',
  'Ich stehe auf einem Ball! 🦙', 'Ptui! Dein Zug ist weg!', 'Ich balanciere — nah!', 'Du balancierst besser!', 'Ein akrobatischer Sieg!', 'Vom Ball gerollt…')
r('Bulle Hantel', 'Der Kraftprotz', f'Ist er „Sehr heiß“ oder näher, nimmt er sich deinen {K}. Einmal pro Runde.',
  'Ich bin der Stärkste im Zirkus! 🏋️', 'Hau-ruck! Der „⚡“ gehört mir!', 'Ich stemme den Sieg!', 'Du bist stärker?!', 'Ein starker Sieg!', 'Die Hantel ist schwer…')
r('Marienkäfer Pünktchen', 'Aus der Kanone', 'Beim zweiten Zug der Runde fliegt er aus der Kanone: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Gleich fliege ich! 🐞', 'Bumm! Ich fliege — zwei Züge!', 'Ich fliege zum Ziel!', 'Du fliegst weiter!', 'Volltreffer!', 'Übers Ziel hinaus…')
r('Popcorn Knusper', 'Plopp!', 'Beim vierten Zug der Runde ploppt es und verrät dir, ob die Zahl gerade oder ungerade ist.',
  'Knusper-knusper! 🍿', 'Plopp! Die Zahl ist {k}!', 'Plopp — heiß!', 'Willst du mich essen?!', 'Ein knuspriger Sieg!', 'Ich bin umgekippt…')
r('Zauberhut Simsala', 'Verschwunden', f'Ist er „Warm“ oder näher, verschwindet er im Rauch: {FOG}. Einmal pro Runde.',
  'Achtung — ein Zaubertrick! 🎩', 'Hokuspokus! Ich verschwinde!', 'Der Zauber wirkt!', 'Du hast den Trick durchschaut?!', 'Ein magischer Sieg!', 'Das Kaninchen ist weggelaufen…')
b('Der Zirkusdirektor', 'Manege frei!', 'Beim fünften Zug der Runde kündigt er die Nummer an: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Das Auge des Direktors', 'Wirst du wärmer, bemerkt er es und erfährt, ob die Zahl größer oder kleiner als deine ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Hochverehrtes Publikum! Die Vorstellung beginnt! 🎪', 'Manege frei! Zwei Züge!', 'Aha! Ich sehe alles!',
  'Das große Finale ist nah!', 'Welch ein Talent!', 'Die größte Show! 👑', 'Applaus für den Sieger!')

# 23 · Kristallhöhlen
r('Kristallstein Glitzer', 'Kristalle wachsen', f'Bist du „Kalt“ oder weiter weg, lässt er einen Kristall wachsen: einen {K} für sich. Einmal pro Runde.',
  'Auf mir wachsen Kristalle! 🪨', 'Ein Kristall ist gewachsen — ein „⚡“ für mich!', 'Ich glitzere — nah!', 'Du hast mich gefunden!', 'Ein steinharter Sieg!', 'Ich bin zerbröselt…')
r('Axolotl Rosa', 'Freundlich', f'Wird er kälter, macht es ihm nichts — er schenkt dir einen {K}. Einmal pro Runde.',
  'Hallo! Ich lächle immer 💗', 'Hier — „⚡ +1 Zug“!', 'Oh, heiß!', 'Fast erraten!', 'Ein rosiger Sieg!', 'Gut gemacht!')
r('Geode Amethyst', 'Durchschaut', 'Nach deinem zweiten Zug weiß sie, in welcher Hälfte die Zahl liegt. Dir verrät sie es nicht.',
  'Schau mal hinein! 🔮', 'Innen sehe ich alles — ich kenne die Hälfte!', 'Die Kristalle leuchten!', 'Du siehst durch mich hindurch?!', 'Ein Amethyst-Sieg!', 'Ich habe einen Sprung…')
r('Höhlenfisch Helm', 'Helmlampe', 'Bist du „Sehr heiß“ oder näher, knipst er seine Lampe an: Die Zahl ist gerade oder ungerade. Einmal pro Runde.',
  'Ich trage einen Helm — ich bin Bergmann! 🔦', 'Ich leuchte: Die Zahl ist {k}!', 'Es leuchtet heller!', 'Du hast den Weg gefunden!', 'Ein Bergmann-Sieg!', 'Meine Lampe ist aus…')
r('Tropfstein Plitsch', 'Plitsch!', 'Nach seinem zweiten Zug fällt ein Tropfen: Du erstarrst und setzt einen Zug aus.',
  'Ich hänge kopfüber… 💧', 'Plitsch! Erstarre!', 'Plitsch — nah!', 'Du bist unter mich geschlichen!', 'Ein tröpfelnder Sieg!', 'Abgebrochen…')
r('Diamant Blitz', 'Blendender Glanz', f'Bist du „Glühend“, funkelt er so hell: {BLIND}. Einmal pro Runde.',
  'Ich bin der Glänzendste! 💠', 'Funkel! Du siehst deine Züge nicht!', 'Ich funkle!', 'Du bist nicht geblendet?!', 'Ein Diamant-Sieg!', 'Mein Glanz ist weg…')
r('Motte Muster', 'Flügelmuster', 'Wird sie wärmer, zeigt ihr das Muster auf ihren Flügeln, ob die Zahl gerade oder ungerade ist. Dir verrät sie es nicht. Einmal pro Runde.',
  'Meine Flügel leuchten 🕯️', 'Das Muster zeigt es mir — ich weiß, ob sie gerade ist!', 'Ich fliege zum Licht!', 'Du strahlst heller als eine Flamme!', 'Ein gemusterter Sieg!', 'Ich fliege davon…')
r('Laterne Strahl', 'Laternenlicht', 'Beim dritten Zug der Runde erleuchtet sie die Höhle und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät sie es nicht.',
  'Ich erleuchte die Höhle 🪔', 'Hell! Ich weiß, ob sie gerade ist!', 'Ich leuchte aufs Ziel!', 'Du siehst im Dunkeln?!', 'Ein heller Sieg!', 'Kein Öl mehr…')
r('Pfeifhase Spitzhacke', 'Gräbt nebenan', 'Wirst du wärmer, verrät er dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Piep! Ich grabe! ⛏️', 'Tock-tock mit der Spitzhacke: {k}!', 'Piep — nah!', 'Du gräbst schneller!', 'Piep, gewonnen!', 'Piep… ich bin müde.')
b('Die Kristallkönigin', 'Kristallfalle', f'Nach deinem dritten Zug erstarrt dein {K} zu Kristall und ist weg.',
  'Kristallkälte', 'Wird sie wärmer, erstarrt alles: Du erstarrst und setzt einen Zug aus. Einmal pro Runde.',
  'Meine Höhlen leuchten ewig 🔷', 'Kristall! Dein „⚡“ ist erstarrt!', 'Erstarre wie Kristall!',
  'Die Kristalle flüstern!', 'Du hast keine Angst vor Kälte?!', 'Ein Kristallsieg! 👑', 'Du strahlst heller als all meine Kristalle!')

# 24 · Wintermärchen
r('Schneemann Knopf', 'Frostig', 'Bist du „Kalt“ oder weiter weg, frierst du ein und setzt einen Zug aus. Einmal pro Runde.',
  'Ich bin aus Schnee! ☃️', 'Brrr! Eingefroren — setz aus!', 'Oh, warm — ich schmelze!', 'Du bringst mich zum Schmelzen!', 'Ein Schneesieg!', 'Geschmolzen…')
r('Nussknacker Knacks', 'Knack!', f'Nach seinem zweiten Zug knackt er deinen {K}.',
  'Ich knacke Nüsse! 🥜', 'Knack! Dein „⚡“ ist geknackt!', 'Knack — nah!', 'Du bist eine harte Nuss!', 'Knack — gewonnen!', 'Meine Zähne sind müde…')
r('Tannenbaum Lametta', 'Geschenk unterm Baum', f'Nach deinem ersten Zug liegt ein Geschenk unterm Baum: einen {K} für dich.',
  'Ich bin festlich geschmückt! 🎄', 'Unterm Baum — ein „⚡ +1 Zug“!', 'Meine Lichter leuchten!', 'Du hast das Geschenk gefunden!', 'Ein festlicher Sieg!', 'Frohes Fest!')
r('Fäustling Kuschel', 'Wärmt dich', 'Bist du „Kalt“ oder weiter weg, setzt er seinen Zug aus, damit du dich aufwärmen kannst. Einmal pro Runde.',
  'Ich bin schön warm! 🧤', 'Wärm dich auf — ich setze aus.', 'Warm — nah!', 'Du bist heiß!', 'Ein warmer Sieg!', 'Aufgewärmt? Gut gemacht!')
r('Gimpel Rotbrust', 'Ein Liedchen', 'Nach seinem dritten Zug singt er ein Tipp-Liedchen: Die Zahl ist gerade oder ungerade.',
  'Ich bin im Winter zu dir geflogen! 🎶', 'Piep! Die Zahl ist {k}!', 'Ich singe — heiß!', 'Du singst besser!', 'Ein Siegeslied!', 'Ich fliege davon…')
r('Schneekugel Glitzi', 'Schneefall', 'Der dritte Zug der Runde verschwindet im Schneefall: Du siehst ihn nicht.',
  'Schüttel mich! 🫙', 'Geschüttelt — es schneit! Der Zug ist weg!', 'Die Flocken wirbeln!', 'Du siehst durch den Schnee?!', 'Ein Wintermärchen — und ein Sieg!', 'Der Schnee hat sich gelegt…')
r('Geschenk Überraschung', 'Überraschung', f'Nach seinem dritten Zug öffnet es sich: einen {K} für dich.',
  'Was ist wohl drin? 🎁', 'Überraschung — „⚡ +1 Zug“!', 'Meine Schleife geht auf!', 'Du hast erraten, was drin ist!', 'Ein Geschenk von einem Sieg!', 'Dieses Geschenk ist für dich!')
r('Kakao Sahnehaube', 'Heißer Kakao', f'Wirst du kälter, gibt es heißen Kakao: je einen {K} für dich und für ihn. Einmal pro Runde.',
  'Ich wärme dich! ☕', 'Heißer Kakao — ein „⚡“ für alle!', 'Heiß!', 'Du bist heißer als Kakao!', 'Ein leckerer Sieg!', 'Ich bin kalt geworden…')
r('Luchs Pinselohr', 'Luchssprung', f'Ist er „Glühend“, springt er und schnappt sich deinen {K}. Einmal pro Runde.',
  'Ich habe Pinsel an den Ohren! 🐈', 'Sprung! Der „⚡“ gehört mir!', 'Ich schleiche — nah!', 'Du hast mich entdeckt?!', 'Ein Luchs-Sieg!', 'Ich verstecke mich im Schnee…')
b('Väterchen Frost', 'Klirrende Kälte', 'Beim sechsten Zug der Runde wird der Frost klirrend: Du erstarrst und setzt einen Zug aus.',
  'Geschenke für alle', f'Nach seinem zweiten Zug verteilt er Geschenke: je einen {K} für dich und für ihn.',
  'Frohes neues Jahr! Spielen wir? 🎅', 'Ich friere dich ein!', 'Geschenke für alle!',
  'Die Magie hilft mir!', 'Oh, wie geschickt!', 'Ein Neujahrssieg! 👑', 'Du hast dir ein Geschenk verdient!')

# 25 · Regenbogenland
r('Einhorn Mähne', 'Zauberhorn', 'Mit seinem ersten Zug berührt das Einhorn den Regenbogen und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät es es nicht.',
  'Ich bin magisch! 🦄', 'Mein Horn weiß, ob sie gerade ist!', 'Die Magie ist nah!', 'Du bist auch magisch?!', 'Ein magischer Sieg!', 'Meine Magie ist aufgebraucht…')
r('Pegasus Wolke', 'Von oben', 'Ist er „Warm“ oder näher, verrät er dir von oben, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Ich fliege in den Wolken! ☁️', 'Von hier oben sehe ich: {k}!', 'Ich fliege zum Ziel!', 'Du fliegst höher!', 'Ein himmlischer Sieg!', 'Gelandet…')
r('Schleim Glibber', 'Kleben geblieben', 'Nach deinem dritten Zug bleibst du am Schleim kleben: Du erstarrst und setzt einen Zug aus.',
  'Ich dehne mich und schimmere! 🟣', 'Platsch! Kleben geblieben — erstarre!', 'Ich dehne mich zum Ziel!', 'Zerquetsch mich nicht!', 'Ein klebriger Sieg!', 'Ich bin zerlaufen…')
r('Regenbogen Siebenfarb', 'Nach dem Regen', f'Beim siebten Zug der Runde erscheint ein Regenbogen: einen {K} für dich.',
  'Ich komme nach dem Regen! 🌦️', 'Ein Regenbogen — ein „⚡ +1 Zug“ für dich!', 'Meine Farben leuchten heller!', 'Du strahlst!', 'Ein bunter Sieg!', 'Am Himmel verblasst…')
r('Palette Klecks', 'Farben mischen', 'Nach deinem ersten Zug mischt sie ihre Farben und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät sie es nicht.',
  'Ich male alles bunt an! 🖌️', 'Gemischt — ich kenne die Hälfte!', 'Meine Farben leuchten heller!', 'Du malst besser!', 'Ein farbenfroher Sieg!', 'Meine Farben sind eingetrocknet…')
r('Regentropfen Tropfi', 'Tropf-tropf', 'Ist er „Sehr heiß“ oder näher — tropf-tropf auf deinen Kopf: Du setzt deinen nächsten Zug aus. Einmal pro Runde.',
  'Ich bin ein kleiner Regentropfen! ☔', 'Tropf-tropf! Setz aus!', 'Tropf — nah!', 'Du hast mich gefangen!', 'Tropf-tropf — gewonnen!', 'Ich bin getrocknet…')
r('Prisma Lichtstrahl', 'Licht zerlegen', 'Bist du „Sehr heiß“ oder näher, zerlegt das Prisma das Licht und zeigt dir: Die Zahl ist größer oder kleiner als deine. Einmal pro Runde.',
  'Leuchte mich an! 🔺', 'Der Strahl zeigt: Sie ist {k}!', 'Das Licht sammelt sich!', 'Du leuchtest auch!', 'Ein Regenbogensieg!', 'Das Licht ist aus…')
r('Flugdrache Bändchen', 'Wind fangen', f'Beim zweiten Zug der Runde fängt er den Wind: einen {K} für sich.',
  'Höher, höher, zu den Wolken! 🪁', 'Wind gefangen — ein „⚡“ für mich!', 'Rückenwind!', 'Du fliegst höher als ich?!', 'Ein Sieg am Himmel!', 'Meine Schnur ist gerissen…')
r('Seifenblase Schimmer', 'Plopp', 'Mit ihrem vierten Zug zerplatzt sie — Spritzer in die Augen: Bis zum Rundenende siehst du ihre Züge nicht.',
  'Ich schimmere in allen Farben! ⚪', 'Plopp! Seifenspritzer — du siehst nichts!', 'Ich schwebe zum Ziel!', 'Bring mich nicht zum Platzen!', 'Ein schillernder Sieg!', 'Plopp…')
b('Die Regenbogendrachin', 'Regenbogenfeuer', f'Bist du „Glühend“, speit sie Regenbogenfeuer: {FOG_F}. Einmal pro Runde.',
  'Regenbogentausch', 'Ist sie „Sehr heiß“ oder näher, tauscht sie mit dir die „⚡ +1 Zug“: Deine gehen an sie, ihre an dich. Einmal pro Runde.',
  'Das Regenbogenland gehört mir! 🐉', 'Regenbogenfeuer!', 'Tauschen wir die „⚡“!',
  'Der Regenbogen führt mich!', 'Du strahlst heller als ein Regenbogen?!', 'Ein Regenbogensieg! 👑', 'Du hast die Drachin besiegt!')

assert len(H) == 100, len(H)
