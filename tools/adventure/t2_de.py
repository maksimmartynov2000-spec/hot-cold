WORLDS = ['Savanne', 'Drachental', 'Dunkler Abgrund', 'Bambushain', 'UFO-Station',
          'Australien', 'Zirkus', 'Kristallhöhlen', 'Mammutzeit', 'Regenbogenland']
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

# 17 · Drachental
r('Drachenkind Zunder', 'Glut anfachen', 'Wirst du wärmer, facht es die Glut an und holt sich einen „⚡ +1 Zug“. Einmal pro Runde.',
  'Fauch! Ich wärme meine Pfoten an der Glut! 🔥', 'Fauch! Hitze — ein „⚡ +1 Zug“ für mich!', 'Heiß, heiß, heiß!', 'Wärmst du dich etwa an meinem Feuer?!', 'Ein Sieg, heißer als Feuer!', 'Meine Glut ist erloschen…')
r('Lindwurm Wetterfahne', 'Wetterfahnen-Schwanz', 'Ist er „Warm“ oder näher, dreht sich sein Schwanz wie eine Wetterfahne und verrät dir: Die Zahl ist größer oder kleiner als seine. Einmal pro Runde.',
  'Mein Schwanz weiß immer, woher der Wind weht! 🐉', 'Mein Schwanz zeigt: Sie ist {k}!', 'Der Wind weht in meine Richtung!', 'Du fliegst mit dem Wind!', 'Der Wind hat mir den Sieg gebracht!', 'Der Wind hat gedreht…')
r('Drachenkind Hatschi', 'Hatschi!', 'Nach deinem zweiten Zug niest es Funken — du erschrickst: Dein nächster Zug geschieht von selbst — ein wilder Wurf.',
  'Ha… ha… HATSCHI! 🤧', 'HATSCHI! Dein Zug fliegt irgendwohin!', 'Hatschi! Oh, ich bin nah!', 'Gesundheit… ich meine, du bist nah!', 'Hatschi! Ich gewinne!', 'Hatschi… erkältet und verloren.')
r('Drache Windflügel', 'Flügelschlag', 'Nach seinem dritten Zug breitet er die Flügel aus: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Meine Flügel sind schneller als der Wind! 🌬️', 'Flatter-flatter! Zwei Züge hintereinander!', 'Ich fliege mit voller Kraft!', 'Fliegst du mir etwa nach?!', 'Ich bin zum Sieg geflogen!', 'Ich habe die Flügel eingeklappt…')
r('Drachenkind Trugbild', 'Unsichtbar', 'Sein dritter Zug löst sich in Luft auf: Du siehst ihn nicht.',
  'Siehst du mich? Und jetzt? ✨', 'Puff! Der Zug ist verschwunden!', 'Ich bin dort, wo du nicht hinschaust!', 'Durchschaust du etwa das Trugbild?!', 'Das Trugbild gewinnt!', 'Das Trugbild ist verblasst…')
r('Drachenkind Gutherz', 'Zweite Chance', 'Wirst du kälter, lässt es dich freundlich noch mal versuchen: Du ziehst sofort noch einmal. Einmal pro Runde.',
  'Ich bin der liebste Drache im ganzen Tal! 💛', 'Nicht traurig sein — versuch’s noch mal!', 'Oh, fast hätte ich es selbst erraten!', 'Du bist nah — ich freue mich für dich!', 'Ich gewinne! Aber du warst toll!', 'Hurra! Du gewinnst — ich bin nicht böse!')
r('Drache Grollen', 'Gebrüll', 'Beim dritten Zug der Runde brüllt er so laut, dass du einen Zug aussetzt.',
  'Grrr… so sage ich Hallo 🐲', 'GRRR! Setz einen Zug aus!', 'Grrr, ich wittere den Sieg!', 'Du hast keine Angst vor mir?!', 'Grrr! Ein Siegesgebrüll!', 'Grr… na gut.')
r('Drache Geizhals', 'Schatzhort', 'Nach deinem zweiten Zug versteckt er deinen „⚡ +1 Zug“ in seinem Hort — und er ist weg.',
  'Alles Gold gehört mir! Deins auch! 💰', 'Meins! Ab in den Hort!', 'Ich rieche Gold!', 'Weg von meinem Gold!', 'Noch eine Münze für den Hort!', 'Mein Gold… seufz.')
r('Federschlange Quetzal', 'Gleitflug', 'Wird sie kälter, gleitet sie durch die Wolken und setzt ihren Zug aus. Einmal pro Runde.',
  'Zisch… Federn und Schuppen — das ist meine Schönheit 🪶', 'Zisch… ich gleite und setze aus.', 'Zisch, ich bin nah!', 'Du hast mir die Federn zerzaust!', 'Zisch! Ich gewinne!', 'Meine Federn hängen…')
b('Der Drachenkönig', 'Feuervorhang', 'Ist er „Glühend“, speit er einen Feuervorhang: Bis zum Rundenende siehst du deine eigenen Züge nicht. Einmal pro Runde.',
  'Abheben', 'Beim vierten Zug der Runde steigt er in den Himmel: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Verneige dich vor dem Drachenkönig! 👑', 'Feuer! Du siehst deine Züge nicht!', 'Ich hebe ab! Zwei Züge hintereinander!',
  'Meine Flammen wittern den Sieg!', 'Du hast keine Angst vor Feuer?!', 'Ein Drachensieg! 👑', 'Meine Flamme ist erloschen… du gewinnst.')

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
r('Gibbon Liane', 'Immer höher', 'Er klettert immer höher: Jede seiner Zahlen ist größer als die vorige, solange es geht.',
  'Uh-uh! Je höher, desto besser! 🐒', 'Uh-uh! Ich klettere höher!', 'Fast an der Baumspitze!', 'Kletterst du mir etwa nach?!', 'Uh-uh! Ich bin ganz oben!', 'Ich bin von der Liane gerutscht…')
b('Der Panda-Kaiser', 'Weisheit', 'Mit seinem zweiten Zug denkt er nach und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät er es nicht.',
  'Meditation', 'Bist du „Warm“ oder näher, erstarrst du in Meditation und setzt einen Zug aus. Einmal pro Runde.',
  'Der Bambushain ist mein Kaiserreich 🐼', 'Die Weisheit hat gesprochen!', 'Ommm… erstarre!',
  'Der Weg ist klar!', 'Du bist weiser als ich?!', 'Die Weisheit siegt! 👑', 'Du verdienst Respekt.')

# 20 · UFO-Station
r('Alien Gup', 'Signal', 'Beim sechsten Zug der Runde empfängt er ein Signal aus der Umlaufbahn und verrät dir, in welcher Hälfte die Zahl liegt.',
  'Gup-gup! Hallo, Erdling! 👽', 'Gup-gup! Das Signal sagt: {k}!', 'Gup! Meine Antennen kribbeln!', 'Der Erdling ist nah!', 'Gup-gup! Ich gewinne!', 'Gup… zurück zur Basis.')
r('Bärtierchen Schwebi', 'Schwerelosigkeit', 'Nach deinem dritten Zug schaltet es die Schwerelosigkeit ein: Dein nächster Zug geschieht von selbst — ein wilder Wurf.',
  'Ich überlebe sogar im Weltall! 🚀', 'Schwerelos! Dein Zug ist davongeschwebt!', 'Ich schwebe direkt zur Antwort!', 'Schwebst du etwa zu mir?!', 'Ich bin zäh — ich gewinne!', 'Davongeschwebt…')
r('Marsmensch Doppelkopf', 'Zwei Köpfe', 'Nach seinem vierten Zug sind sich seine zwei Köpfe einig: Er zieht sofort noch einmal.',
  'Hi-hi! Wir sind zwei — in einem! 🪐', 'Zwei Köpfe — noch ein Zug!', 'Zwei Köpfe denken besser als einer — sehr heiß!', 'Beide Köpfe machen sich Sorgen!', 'Ein doppelter Sieg!', 'Beide Köpfe sind traurig…')
r('Weltraumschnecke Glibber', 'Klebrige Spur', 'Bist du „Sehr kalt“, trittst du in ihre klebrige Spur und setzt einen Zug aus. Einmal pro Runde.',
  'Schmatz! Grüße aus dem Nebel! 🌌', 'Schmatz! Kleben geblieben — setz aus!', 'Schmatz-schmatz, ich bin nah!', 'Oh, du bleibst nicht kleben?!', 'Schmatz! Ich gewinne!', 'Schmatz… ich bin geschmolzen.')
r('Sternigel Funki', 'Stromschlag', 'Wird er wärmer, verpasst er dir einen Schlag: Dein „⚡ +1 Zug“ brennt durch. Einmal pro Runde.',
  'Nicht streicheln — ich gebe Stromschläge! ⚡', 'Bzzz! Dein „⚡“ ist durchgebrannt!', 'Ich funkle vor Freude!', 'Keine Angst vor Funken?!', 'Bzzz! Ich gewinne!', 'Meine Batterie ist leer…')
r('Astronautenmaus Pilotin', 'Startvorrat', 'Mit ihrem ersten Zug holt sie sich einen „⚡ +1 Zug“ aus ihrem Raumanzug.',
  'Pilotin bereit zum Start! 🚀', 'Startvorrat — ein „⚡ +1 Zug“ für mich!', 'Kurs auf den Sieg!', 'Du bist in meiner Umlaufbahn!', 'Landung auf dem Sieg!', 'Flug abgesagt…')
r('Alien Radar', 'Radarschüssel', 'Beim zweiten Zug der Runde fängt er mit seinem Radar ein Signal auf und verrät dir, ob die Zahl größer oder kleiner als diese ist.',
  'Piep-piep… Erdling entdeckt! 📡', 'Piep-piep! Sie ist {k}!', 'Das Signal wird stärker!', 'Du störst mein Signal!', 'Piep-piep! Ich gewinne!', 'Signal verloren…')
r('Gedankenkrake Grübel', 'Gedankenlesen', 'Bei jedem dritten seiner Züge liest er Gedanken und erfährt, ob die Zahl größer oder kleiner als seine ist. Dir verrät er es nicht.',
  'Ich weiß, was du denkst… 🐙', 'Ich lese Gedanken… und weiß, wohin!', 'Gedanken führen mich zur Antwort!', 'Du denkst zu laut!', 'Das habe ich vorhergesehen!', 'Nicht gelesen… du gewinnst.')
r('Astronautenwelpe Rakete', 'Raketenrucksack', 'Bist du „Sehr heiß“ oder näher, zündet er seinen Raketenrucksack und holt sich einen „⚡ +1 Zug“. Einmal pro Runde.',
  'Wuff! Zu den Sternen! 🚀', 'Wuff! Rucksack geladen — ein „⚡ +1 Zug“ für mich!', 'Wuff! Ich wittere eine Sternenspur!', 'Du fliegst schneller als ich!', 'Wuff-wuff! Sieg im Weltall!', 'Wuff… gelandet.')
b('Die Große Bärin', 'Sternenkälte', 'Beim vierten Zug der Runde haucht sie die Kälte des Alls aus: Du erstarrst und setzt einen Zug aus.',
  'Polarstern', 'Ist sie „Sehr heiß“ oder näher, blickt sie auf den Polarstern und zieht sofort noch einmal. Einmal pro Runde.',
  'Ich leuchte jede Nacht am Himmel! 👑', 'Sternenkälte! Setz einen Zug aus!', 'Der Polarstern hat gesprochen — ich ziehe noch mal!',
  'Die Sterne zwinkern mir zu!', 'Du fliegst zu meinen Sternen!', 'Ein Sternensieg! 👑', 'Die Sterne sind verblasst… du gewinnst.')

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
r('Tigerjunges Reifen', 'Durch den Reifen', 'Ist es „Glühend“, springt es vor Aufregung durch den Reifen und verliert seinen eigenen „⚡ +1 Zug“. Einmal pro Runde.',
  'Rrrr! Schau, wie ich springe! 🐯', 'Hopp! Mein eigener „⚡“ ist weg!', 'Rrrr! Ich bin nah!', 'Du springst besser als ich!', 'Rrrr! Ein Siegessprung!', 'Den Reifen verfehlt…')
r('Lama Akrobat', 'Spucke', 'Wirst du kälter, spuckt das Lama: Diesen Zug von dir siehst du nicht. Einmal pro Runde.',
  'Ich stehe auf einem Ball! 🦙', 'Ptui! Dein Zug ist weg!', 'Ich balanciere — nah!', 'Du balancierst besser!', 'Ein akrobatischer Sieg!', 'Vom Ball gerollt…')
r('Bulle Hantel', 'Der Kraftprotz', f'Ist er „Sehr heiß“ oder näher, nimmt er sich deinen {K}. Einmal pro Runde.',
  'Ich bin der Stärkste im Zirkus! 🏋️', 'Hau-ruck! Der „⚡“ gehört mir!', 'Ich stemme den Sieg!', 'Du bist stärker?!', 'Ein starker Sieg!', 'Die Hantel ist schwer…')
r('Marienkäfer Pünktchen', 'Aus der Kanone', 'Beim zweiten Zug der Runde fliegt er aus der Kanone: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Gleich fliege ich! 🐞', 'Bumm! Ich fliege — zwei Züge!', 'Ich fliege zum Ziel!', 'Du fliegst weiter!', 'Volltreffer!', 'Übers Ziel hinaus…')
r('Hamster Purzel', 'Purzelbaum-Tipp', 'Beim vierten Zug der Runde schlägt er einen Purzelbaum und verrät dir, ob die Zahl gerade oder ungerade ist.',
  'Purzelbaum! Und noch einer! Hallo! 🐹', 'Purzelbaum! Die Zahl ist {k}!', 'Mir ist schwindlig — sehr heiß!', 'Du purzelst zur Antwort!', 'Ein Sieges-Purzelbaum!', 'Ausgepurzelt…')
r('Zauberhut Simsala', 'Verschwunden', f'Ist er „Warm“ oder näher, verschwindet er im Rauch: {FOG}. Einmal pro Runde.',
  'Achtung — ein Zaubertrick! 🎩', 'Hokuspokus! Ich verschwinde!', 'Der Zauber wirkt!', 'Du hast den Trick durchschaut?!', 'Ein magischer Sieg!', 'Das Kaninchen ist weggelaufen…')
b('Der Zirkusdirektor', 'Manege frei!', 'Beim fünften Zug der Runde kündigt er die Nummer an: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Das Auge des Direktors', 'Wirst du wärmer, bemerkt er es und erfährt, ob die Zahl größer oder kleiner als deine ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Hochverehrtes Publikum! Die Vorstellung beginnt! 🎪', 'Manege frei! Zwei Züge!', 'Aha! Ich sehe alles!',
  'Das große Finale ist nah!', 'Welch ein Talent!', 'Die größte Show! 👑', 'Applaus für den Sieger!')

# 23 · Kristallhöhlen
r('Sternmull Buddel', 'Kristallsammler', 'Bist du „Kalt“ oder weiter weg, buddelt er einen Kristall aus: einen „⚡ +1 Zug“ für sich. Einmal pro Runde.',
  'Meine Nase ist ein Stern! Damit finde ich alles ⭐', 'Buddel-buddel — ein „⚡ +1 Zug“ für mich!', 'Meine Nase riecht Kristalle!', 'Du gräbst direkt neben mir!', 'Ich habe einen Sieg ausgegraben!', 'Ich habe mich verbuddelt… du gewinnst.')
r('Axolotl Rosa', 'Freundlich', f'Wird er kälter, macht es ihm nichts — er schenkt dir einen {K}. Einmal pro Runde.',
  'Hallo! Ich lächle immer 💗', 'Hier — „⚡ +1 Zug“!', 'Oh, heiß!', 'Fast erraten!', 'Ein rosiger Sieg!', 'Gut gemacht!')
r('Grottenolm Spürnase', 'Sechster Sinn', 'Nach deinem zweiten Zug spürt er durch den Fels, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht.',
  'Ich lebe im Dunkeln — Augen brauche ich nicht 🦎', 'Ich spüre es… ich weiß, wo ich suchen muss!', 'Die Dunkelheit führt mich!', 'Spürst du es etwa auch?!', 'Ohne Augen — und gewonnen!', 'Mein Gespür lag daneben…')
r('Höhlenfisch Helm', 'Helmlampe', 'Bist du „Sehr heiß“ oder näher, knipst er seine Lampe an: Die Zahl ist gerade oder ungerade. Einmal pro Runde.',
  'Ich trage einen Helm — ich bin Bergmann! 🔦', 'Ich leuchte: Die Zahl ist {k}!', 'Es leuchtet heller!', 'Du hast den Weg gefunden!', 'Ein Bergmann-Sieg!', 'Meine Lampe ist aus…')
r('Tropfstein Plitsch', 'Plitsch!', 'Nach seinem zweiten Zug fällt ein Tropfen: Du erstarrst und setzt einen Zug aus.',
  'Ich hänge kopfüber… 💧', 'Plitsch! Erstarre!', 'Plitsch — nah!', 'Du bist unter mich geschlichen!', 'Ein tröpfelnder Sieg!', 'Abgebrochen…')
r('Kristallechse Glitzer', 'Blendender Glanz', 'Bist du „Glühend“, funkelt sie so hell: Bis zum Rundenende siehst du deine eigenen Züge nicht. Einmal pro Runde.',
  'Schau, wie ich glitzere! 💎', 'Funkel! Du siehst deine Züge nicht!', 'Meine Kristalle leuchten!', 'Musst du nicht blinzeln?!', 'Ein funkelnder Sieg!', 'Mein Glanz ist weg…')
r('Motte Muster', 'Flügelmuster', 'Wird sie wärmer, zeigt ihr das Muster auf ihren Flügeln, ob die Zahl gerade oder ungerade ist. Dir verrät sie es nicht. Einmal pro Runde.',
  'Meine Flügel leuchten 🕯️', 'Das Muster zeigt es mir — ich weiß, ob sie gerade ist!', 'Ich fliege zum Licht!', 'Du strahlst heller als eine Flamme!', 'Ein gemusterter Sieg!', 'Ich fliege davon…')
r('Höhlengrille Knarz', 'Höhlenecho', 'Beim dritten Zug der Runde lauscht sie dem Echo und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät sie es nicht.',
  'Knarz-knarz! Hörst du das Echo? 🦗', 'Knarz-knarz… das Echo hat mir alles verraten!', 'Das Echo hallt — sehr heiß!', 'Deine Schritte sind zu laut!', 'Knarz-knarz — ich gewinne!', 'Das Echo hat mich getäuscht…')
r('Pfeifhase Spitzhacke', 'Gräbt nebenan', 'Wirst du wärmer, verrät er dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Piep! Ich grabe! ⛏️', 'Tock-tock mit der Spitzhacke: {k}!', 'Piep — nah!', 'Du gräbst schneller!', 'Piep, gewonnen!', 'Piep… ich bin müde.')
b('Die Kristallkönigin', 'Kristallfalle', f'Nach deinem dritten Zug erstarrt dein {K} zu Kristall und ist weg.',
  'Kristallkälte', 'Wird sie wärmer, erstarrt alles: Du erstarrst und setzt einen Zug aus. Einmal pro Runde.',
  'Meine Höhlen leuchten ewig 🔷', 'Kristall! Dein „⚡“ ist erstarrt!', 'Erstarre wie Kristall!',
  'Die Kristalle flüstern!', 'Du hast keine Angst vor Kälte?!', 'Ein Kristallsieg! 👑', 'Du strahlst heller als all meine Kristalle!')

# 24 · Mammutzeit
r('Mammutbaby Wuschel', 'Eisstaub', 'Bist du „Kalt“ oder weiter weg, schwingt es seinen Rüssel und überschüttet dich mit Eisstaub: Du erstarrst und setzt einen Zug aus. Einmal pro Runde.',
  'Törööö! Ich bin das flauschigste Mammut! 🦣', 'Puff! Eingefroren — setz einen Zug aus!', 'Törö! Ich bin nah!', 'Du folgst meinen Spuren!', 'Törööö! Ich gewinne!', 'Mir stehen die Haare zu Berge… du gewinnst.')
r('Säbelzahntiger Hauer', 'Scharfer Zahn', 'Nach seinem zweiten Zug beißt er deinen „⚡ +1 Zug“ durch — und er ist weg.',
  'Keine Sorge — ich sehe nur wild aus 🐯', 'Happs! Dein „⚡“ ist weg!', 'Meine Zähne wittern den Sieg!', 'Du bist mutig!', 'Grr! Ich gewinne!', 'Meine Zähne sind stumpf geworden…')
r('Wollnashorn Schneewehe', 'Sanfter Riese', 'Nach deinem ersten Zug schenkt es dir einen „⚡ +1 Zug“ — zum Aufwärmen.',
  'Ich bin groß, aber lieb! 🦏', 'Hier, ein „⚡ +1 Zug“ — wärm dich auf!', 'Stampf-stampf, ich bin nah!', 'Du bist nah — gut gemacht!', 'Stampf-stampf — ich gewinne!', 'Na, du hast es dir verdient!')
r('Höhlenbär Höhli', 'Warme Höhle', 'Bist du „Kalt“ oder weiter weg, geht er sich in seiner Höhle aufwärmen und setzt seinen Zug aus. Einmal pro Runde.',
  'Hmm… ich bin gerade aufgewacht 🐻', 'Ich wärme mich auf… und setze aus.', 'Ich rieche Honig — sehr heiß!', 'Du bist an meiner Höhle!', 'Grr! Gewonnen — und ab ins Bett!', 'Zurück zu meinem Nickerchen…')
r('Riesenhirsch Geweih', 'Röhren', 'Nach seinem dritten Zug röhrt er einen Tipp: ob die Zahl gerade oder ungerade ist.',
  'Siehst du mein Geweih? Das breiteste von allen! 🦌', 'Öööhr! Die Zahl ist {k}!', 'Mein Geweih spürt den Sieg!', 'Du bist direkt an meinem Geweih!', 'Öööhr! Ich gewinne!', 'Mein Geweih hängt…')
r('Höhlenlöwe Lauer', 'Auf der Lauer', 'Der dritte Zug der Runde versinkt im tiefen Schnee: Du siehst ihn nicht.',
  'Grr… im Schnee siehst du mich nicht 🦁', 'Pst… dieser Zug liegt auf der Lauer!', 'Die Beute ist nah!', 'Hast du mein Versteck gefunden?!', 'Ein Sprung aus dem Versteck — ich gewinne!', 'Der Hinterhalt ist geplatzt…')
r('Glyptodon Kuppel', 'Großzügiger Panzer', 'Nach seinem dritten Zug öffnet er seinen Panzer ein wenig: einen „⚡ +1 Zug“ für dich.',
  'Mein Panzer ist härter als Stein! 🛡️', 'Hier, ein „⚡ +1 Zug“ unter meinem Panzer hervor!', 'Ich krieche zur Antwort!', 'Klopfst du an meinen Panzer?!', 'Ein steinharter Sieg!', 'Ich verstecke mich in meinem Panzer…')
r('Riesenfaultier Knuddel', 'Große Umarmung', 'Wirst du kälter, umarmt es dich: je einen „⚡ +1 Zug“ für dich und für sich. Einmal pro Runde.',
  'Halloooo… knuddeln? 🦥', 'Große Umarmung! Ein „⚡ +1 Zug“ für jeden!', 'Ich bin… gleich… da…', 'Du bist… so… schnell…', 'Langsam… aber ich gewinne!', 'Macht nichts… knuddeln?')
r('Luchs Pinselohr', 'Luchssprung', f'Ist er „Glühend“, springt er und schnappt sich deinen {K}. Einmal pro Runde.',
  'Ich habe Pinsel an den Ohren! 🐈', 'Sprung! Der „⚡“ gehört mir!', 'Ich schleiche — nah!', 'Du hast mich entdeckt?!', 'Ein Luchs-Sieg!', 'Ich verstecke mich im Schnee…')
b('Der Mammutkönig', 'Eissturm', 'Beim sechsten Zug der Runde trompetet er einen Sturm herbei: Du erstarrst und setzt einen Zug aus.',
  'Geschenk des Leittiers', 'Nach seinem zweiten Zug teilt er mit dir: je einen „⚡ +1 Zug“ für dich und für sich.',
  'Ich führe meine Herde über das endlose Eis! 👑', 'Törööö! Ein Sturm — setz einen Zug aus!', 'Das Leittier ist großzügig: ein „⚡ +1 Zug“ für jeden!',
  'Das Eis knackt — sehr heiß!', 'Du bist stark, Kleiner!', 'Ein königlicher Sieg! 👑', 'Ich senke meine Stoßzähne — du gewinnst.')

# 25 · Regenbogenland
r('Einhorn Mähne', 'Zauberhorn', 'Mit seinem ersten Zug berührt das Einhorn den Regenbogen und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät es es nicht.',
  'Ich bin magisch! 🦄', 'Mein Horn weiß, ob sie gerade ist!', 'Die Magie ist nah!', 'Du bist auch magisch?!', 'Ein magischer Sieg!', 'Meine Magie ist aufgebraucht…')
r('Pegasus Wolke', 'Von oben', 'Ist er „Warm“ oder näher, verrät er dir von oben, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Ich fliege in den Wolken! ☁️', 'Von hier oben sehe ich: {k}!', 'Ich fliege zum Ziel!', 'Du fliegst höher!', 'Ein himmlischer Sieg!', 'Gelandet…')
r('Kelpie Strudel', 'Strudel', 'Nach deinem dritten Zug zieht er dich in einen Strudel: Du erstarrst und setzt einen Zug aus.',
  'Willst du auf den Wellen reiten? 🌊', 'Gluck! Ein Strudel — setz einen Zug aus!', 'Die Wellen tragen mich zur Antwort!', 'Du schwimmst gegen den Strom!', 'Gluck-gluck — ich gewinne!', 'Von der Strömung fortgerissen…')
r('Mandarinente Mandy', 'Bunte Feder', 'Beim siebten Zug der Runde lässt sie eine bunte Feder fallen: einen „⚡ +1 Zug“ für dich.',
  'Quak! Ich bin die schickste Ente weit und breit! 🦆', 'Quak! Hier, eine Feder — ein „⚡ +1 Zug“!', 'Quak! Fast!', 'Quak-quak, du bist nah!', 'Quak! Ich gewinne!', 'Quak… du gewinnst.')
r('Qilin Weisheit', 'Qilin-Weisheit', 'Nach deinem ersten Zug denkt er gründlich nach und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät er es nicht.',
  'Ich bringe Weisheit und Glück ✨', 'Die Weisheit hat mir den Weg gezeigt…', 'Das Glück ist auf meiner Seite!', 'Du bist weise für dein Alter!', 'Die Weisheit gewinnt!', 'Auch Weise irren sich…')
r('Qualle Nessel', 'Brennender Tentakel', 'Ist sie „Sehr heiß“ oder näher, brennt sie dich mit einem Tentakel: Du setzt deinen nächsten Zug aus. Einmal pro Runde.',
  'Ich schimmere in allen Farben! 🪼', 'Autsch! Setz einen Zug aus!', 'Ich treibe direkt zur Antwort!', 'Vorsicht, ich brenne!', 'Ein schimmernder Sieg!', 'Ich bin in den Wellen zerflossen…')
r('Paradiesvogel Pirouette', 'Tanz-Tipp', 'Bist du „Sehr heiß“ oder näher, tanzt er und zeigt dir mit seinen Federn: Die Zahl ist größer oder kleiner als deine. Einmal pro Runde.',
  'Tanzen wir? Ich bin der beste Tänzer im Wald! 🦚', 'Mein Tanz sagt: Sie ist {k}!', 'Mein Tanz führt zum Sieg!', 'Du tanzt besser als ich!', 'Ich tanze zum Sieg!', 'Ich habe den Takt verloren…')
r('Allfarblori Bunti', 'Nektar', 'Beim zweiten Zug der Runde nascht er Nektar: einen „⚡ +1 Zug“ für sich.',
  'Tschilp! Ich bin der bunteste Vogel! 🦜', 'Süßer Nektar — ein „⚡ +1 Zug“ für mich!', 'Tschilp! Sehr heiß!', 'Tschilp! Du bist nah!', 'Tschilp-tschilp! Ich gewinne!', 'Tschilp… du gewinnst.')
r('Leuchtkalmar Glimmer', 'Tintenwolke', 'Mit seinem vierten Zug spritzt er Tinte: Bis zum Rundenende siehst du seine Züge nicht.',
  'Ich funkle in der Tiefe! 🦑', 'Pschht! Tinte — du siehst meine Züge nicht!', 'Ich funkle direkt neben der Antwort!', 'Siehst du etwa durch die Tinte?!', 'Ein Sieg aus der Tiefe!', 'Meine Lichter sind aus…')
b('Die Regenbogendrachin', 'Regenbogenfeuer', f'Bist du „Glühend“, speit sie Regenbogenfeuer: {FOG_F}. Einmal pro Runde.',
  'Regenbogentausch', 'Ist sie „Sehr heiß“ oder näher, tauscht sie mit dir die „⚡ +1 Zug“: Deine gehen an sie, ihre an dich. Einmal pro Runde.',
  'Das Regenbogenland gehört mir! 🐉', 'Regenbogenfeuer!', 'Tauschen wir die „⚡“!',
  'Der Regenbogen führt mich!', 'Du strahlst heller als ein Regenbogen?!', 'Ein Regenbogensieg! 👑', 'Du hast die Drachin besiegt!')

assert len(H) == 100, len(H)
