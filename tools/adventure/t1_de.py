WORLDS = ['Lemureninsel', 'Eisige Arktis', 'Sonnenwüste', 'Lustiger Bauernhof', 'Wolkenstadt',
          'Blumengarten', 'Dinotal', 'Pirateninsel', 'Halloweendorf', 'Königsschloss']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '„⚡ +1 Zug“'
FOG = 'Bis zum Rundenende siehst du seine Züge nicht'
FOG_F = 'Bis zum Rundenende siehst du ihre Züge nicht'
MEM = 'Bis zum Rundenende siehst du nur die letzten zwei Züge'
LAVA = 'Dein nächster Zug geschieht von selbst — ein wilder Wurf'

# 6 · Lemureninsel
r('Giraffenkäfer Stelze', 'Schranke', 'Bist du „Kalt“ oder weiter weg, senkt er seinen langen Hals wie eine Schranke: Du setzt einen Zug aus. Einmal pro Runde.',
  'Siehst du meinen Hals? Der längste der Insel! 🦒', 'Schranke runter — setz einen Zug aus!', 'Von hier oben sieht man die Antwort besser!', 'Oh, du bist schon an meinem Hals!', 'Ich habe mich bis zum Sieg gestreckt!', 'Langer Hals, aber der Sieg gehört dir…')
r('Katta Ringel', 'Mango für alle', 'Ist er „Sehr heiß“ oder näher, freut er sich so sehr, dass er eine Mango teilt: einen „⚡ +1 Zug“ für dich. Einmal pro Runde.',
  'Hallo! Siehst du meinen Schwanz? Das ist meine Fahne! 🥭', 'Hier, eine Mango — ein „⚡ +1 Zug“!', 'Ich rieche reife Mangos — sehr heiß!', 'He, du schleichst dich an meine Mango heran!', 'Schwanz hoch — ich gewinne!', 'Na gut, heute gehört die Mango dir.')
r('Fingertier Mitternacht', 'Mitternacht', 'Nach deinem ersten Zug bricht Mitternacht an: Bis zum Rundenende siehst du seine Züge nicht.',
  'Ich gehe nur nachts aus… 🌙', 'Mitternacht! Du siehst meine Züge nicht!', 'Im Dunkeln sehe ich am besten!', 'Siehst du etwa auch im Dunkeln?!', 'Die Nacht gehört mir!', 'Es dämmert schon… du gewinnst.')
r('Sifaka Hopser', 'Sifaka-Tanz', 'Bist du „Sehr heiß“ oder näher, fängt er an zu tanzen: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Ich gehe nicht — ich tanze! 🕺', 'Hopp-hopp! Zwei Züge hintereinander!', 'Ein paar Sprünge, und ich bin nah!', 'Oh, du hast meinen Rhythmus erwischt!', 'Ein Siegestanz!', 'Ich habe mich müde getanzt…')
r('Mausmaki Vorrat', 'Schwanz-Speicher', 'Mit seinem zweiten Zug holt er sich einen „⚡ +1 Zug“ aus seinem dicken Schwanz.',
  'Ich bin klein, aber ich spare alles! 🐭', 'Mein Schwanz-Speicher — ein „⚡ +1 Zug“ für mich!', 'Oh, ich rieche den Sieg!', 'Finger weg von meinem Vorrat!', 'Mein Vorrat hat sich gelohnt!', 'Mein Vorrat ist alle…')
r('Strahlenschildkröte Uroma', 'Weiser Rat', 'Nach deinem ersten Zug gibt sie dir einen weisen Rat: ob die Zahl gerade oder ungerade ist.',
  'Ich bin hundert Jahre alt — ich weiß viel 🐢', 'Alte Weisheit: Die Zahl ist {k}!', 'Langsam, aber sicher!', 'Du bist schneller, als ich dachte!', 'Langsam, aber sicher zum Sieg!', 'Ach, die Jugend… du gewinnst.')
r('Blattschwanzgecko Laubi', 'Ich bin ein Blatt', 'Wirst du wärmer, erstarrt er wie ein trockenes Blatt und setzt seinen nächsten Zug aus. Einmal pro Runde.',
  'Finde mich doch! 🍂', 'Ich bin ein Blatt… nur ein Blatt… ich setze aus.', 'Ich raschle direkt neben der Antwort!', 'Schau mich nicht an, ich bin ein Blatt!', 'Ha! Du hast mich nicht entdeckt!', 'Entdeckt… ich bin ein schlechtes Blatt.')
r('Tanrek Schlafmütze', 'Winterschlaf', 'Nach deinem zweiten Zug gähnt er, schläft ein und setzt einen Zug aus.',
  'Uaaah… hallo… 🥱', 'Chrrr… weck mich in einem Zug…', 'Sogar verschlafen bin ich nah!', 'Ich bin aufgewacht — und du bist schon nah!', 'Gewonnen — und weiterschlafen!', 'Ich habe verschlafen…')
r('Tomatenfrosch Tomi', 'Lautes Quaken', 'Bist du „Warm“ oder näher, quakt er so laut, dass du den Faden verlierst: Bis zum Rundenende siehst du nur die letzten zwei Züge. Einmal pro Runde.',
  'Quak! Ich bin rund und rot wie eine Tomate! 🐸', 'QUAAAK! Du merkst dir nur zwei Züge!', 'Quak! Sehr heiß!', 'Quak… du hast dich angeschlichen!', 'Quak-quak — ich gewinne!', 'Quak… mir ist die Luft ausgegangen.')
b('Der Fossa-Fürst', 'Sprung', 'Wirst du wärmer, springt er los und nimmt sich deinen „⚡ +1 Zug“. Einmal pro Runde.',
  'Beute', 'Beim vierten Zug der Runde holt er sich Beute: einen „⚡ +1 Zug“.',
  'Die ganze Insel gehört mir! 👑', 'Sprung! Dein „⚡“ gehört mir!', 'Beute — ein „⚡ +1 Zug“ für mich!',
  'Ich wittere Beute!', 'Du bist ein mutiges Tierchen!', 'Der Fürst der Insel gewinnt! 👑', 'Na gut… heute gehört die Insel dir.')

# 7 · Eisige Arktis
r('Eisbär Flocke', 'Schneeball', f'Nach deinem ersten Zug wirft er einen Schneeball: {LAVA}.',
  'Schneeballschlacht? ⛄', 'Fang den Schneeball! Ein wilder Wurf!', 'Gemütlich wie in meiner Höhle!', 'Oh, du bist an meiner Höhle!', 'Ein schneeweißer Sieg! ⛄', 'Du hast mich geschmolzen…')
r('Polarfuchs Wirbel', 'Spuren verwischen', f'Wirst du kälter, entfacht er einen Schneesturm: {FOG}. Einmal pro Runde.',
  'Pssst… hörst du den Schneesturm? 🌨️', 'Schneesturm! Meine Spuren sind weg!', 'Ich rieche Beute unter dem Schnee!', 'Du hast meine Spuren gefunden?!', 'Weggeweht — der Sieg gehört mir!', 'Der Sturm hat sich gelegt…')
r('Walross Schnauzer', 'Angelglück', f'Wird das Walross kälter, macht es nichts — es angelt sich im Eisloch einen {K}. Einmal pro Runde.',
  'Ho-ho! Es beißt an! 🎣', 'Kein Fisch — aber ein „⚡“ an der Angel!', 'Sie beißen immer besser!', 'He, verscheuch meine Fische nicht!', 'Was für ein Fang!', 'Er ist entwischt…')
r('Narwal Kompass', 'Horn-Kompass', 'Ist er „Sehr heiß“ oder näher, zeigt sein Horn: Die Zahl ist größer oder kleiner als seine. Einmal pro Runde.',
  'Mein Horn kennt immer den Weg 🧭', 'Mein Horn zeigt: {k}!', 'Mein Horn kribbelt — heiß!', 'Du schwimmst direkt drauf zu!', 'Der Kompass irrt sich nie!', 'Mein Horn hat sich verirrt…')
r('Schneeeule Stille', 'Lautloser Flug', 'Jeder dritte ihrer Züge ist vor dir versteckt.',
  'Huu… ich fliege ganz leise 🌙', 'Huu! Dieser Zug ist lautlos!', 'Ich sehe Beute im Dunkeln!', 'Du hast mich entdeckt?!', 'Leise und genau! 🦉', 'Ich fliege in den Sturm…')
r('Rentier Bimmel', 'Glöckchen', 'Bist du „Warm“ oder näher, klingelt sein Glöckchen: Die Zahl ist größer oder kleiner als deine. Einmal pro Runde.',
  'Bimmel-bimmel! Hallo! 🔔', 'Bimm! Sie ist {k}!', 'Mein Glöckchen klingelt — heiß!', 'Bimmel-bimmel, du bist fast da!', 'Das Glöckchen läutet den Sieg ein!', 'Mein Glöckchen ist verstummt…')
r('Hermelin Frost', 'Raureif', 'Bist du „Glühend“, überzieht dich das Hermelin mit Raureif: Du frierst ein und setzt einen Zug aus. Einmal pro Runde.',
  'Ich bin weiß wie Raureif ❄️', 'Einfrieren! Du bist voller Raureif!', 'Ich spüre Wärme — ich bin nah dran!', 'Du bist zu heiß für den Winter!', 'Ein eisiger Sieg!', 'Du hast meinen Frost geschmolzen…')
r('Papageitaucher Schnabel', 'Der Fang', f'Wirst du kälter, fängt er einen Fisch: einen {K} für ihn. Einmal pro Runde.',
  'Ich bin ein Papageitaucher — und schlau! 🐟', 'Du wirst kälter — ich hab einen Fisch! „⚡“ für mich!', 'Der Fisch ist genau hier!', 'Oh, du tauchst tiefer als ich!', 'Ein Schnabel voller Sieg!', 'Der Fisch ist weggeschwommen…')
r('Husky Sturm', 'Schlittengespann', 'Nach seinem zweiten Zug legt er los: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Auuu! Los geht’s! 🛷', 'Volle Fahrt! Nächster Zug — doppelt!', 'Ich rase zum Ziel!', 'Du rennst schneller als mein Schlitten!', 'Als Erster im Ziel! 🛷', 'Mein Gespann ist müde…')
b('Der Schnee-Yeti', 'Schneesturm', f'Nach deinem zweiten Zug entfacht er einen Sturm: {FOG}.',
  'Eisiges Gebrüll', 'Wirst du wärmer, brüllt er: Du frierst ein und setzt einen Zug aus. Einmal pro Runde.',
  'Wer stapft da durch meinen Schnee? ❄️', 'STUUURM!', 'G-R-R! Einfrieren!',
  'Ich rieche einen warmen Gast!', 'Du hast keine Angst vor Kälte?!', 'Die Arktis gehört mir! ❄️', 'Du bist heißer als die Sonne!')

# 8 · Sonnenwüste
r('Kamel Düne', 'Spucke', f'Bist du „Sehr heiß“ oder näher, spuckt das Kamel: Dein {K} ist weg. Einmal pro Runde.',
  'Ich halte eine Woche ohne Wasser aus! 🐪', 'Ptui! Dein „⚡“ ist weg!', 'Die Oase ist nah!', 'Bleib weg von meinem Höcker!', 'Die Dünen gehören mir!', 'Ich bin ausgetrocknet…')
r('Fennek Lauscher', 'Feine Ohren', 'Nach deinem zweiten Zug flüstert er dir zu, in welcher Hälfte die Zahl liegt.',
  'Ich höre alles! 👂', 'Ein kleines Geheimnis: {k}.', 'Ich höre es — ganz nah!', 'Du gehst direkt auf die Antwort zu!', 'Meine Ohren haben nicht gelogen!', 'Überhört…')
r('Erdmännchen Wache', 'Fernglas', 'Bei jedem zweiten seiner Züge schaut es durchs Fernglas und verrät dir: Die Zahl ist größer oder kleiner als seine.',
  'Die Wache ist auf Posten! 🔭', 'Durchs Fernglas: {k}!', 'Ziel am Horizont!', 'Alarm! Du bist nah dran!', 'Die Wache schläft nie!', 'Nicht gesehen…')
r('Skorpion Stachel', 'Stich', f'Wirst du wärmer, sticht er mit dem Schwanz: {LAVA}. Einmal pro Runde.',
  'Ich bin klein, aber stachelig 🦂', 'Pieks! Ein wilder Wurf!', 'Der Sand ist heiß — ich bin nah dran!', 'Vorsicht, ich pikse!', 'Volltreffer!', 'Mein Schwanz hängt runter…')
r('Gecko Sonnig', 'Sonnenbad', 'Ist er „Warm“ oder näher, räkelt er sich in der Sonne und setzt seinen nächsten Zug aus. Einmal pro Runde.',
  'Sonne ist alles! 😎', 'So warm… ich sonne mich und setze aus.', 'Heiß — genau wie ich es mag!', 'Du glühst ja wie die Mittagssonne!', 'Ein sonniger Sieg!', 'Die Sonne ist untergegangen…')
r('Gürteltier Roll', 'Kugelrolle', 'Wird das Gürteltier kälter, rollt es sich zusammen und zieht sofort noch einmal. Einmal pro Runde.',
  'Ich bin wie ein Ball! 🥎', 'Kälter? Ich rolle — und ziehe noch mal!', 'Ich rolle direkt zum Ziel!', 'Du holst auf!', 'Zum Sieg gerollt!', 'In ein Loch gerollt…')
r('Springmaus Hops', 'Gegenteil', 'Sie springt ans andere Ende: Sie nennt die Zahl, die deiner spiegelbildlich gegenüberliegt — wenn sie noch die gesuchte sein kann.',
  'Hops-hops! 🔁', 'Hops — ans andere Ende!', 'Noch ein Sprung, dann hab ich’s!', 'Du springst besser als ich!', 'Ein Sprung zum Sieg!', 'Zu weit gesprungen…')
r('Sandkatze Schatten', 'Hinter der Düne', 'Bist du „Warm“ oder näher, deckt sie deinen Zug mit Sand zu: Du siehst ihn nicht. Einmal pro Runde.',
  'Miau… im Sand entdeckst du mich nicht 🏜️', 'Pst… dein Zug liegt unter dem Sand!', 'Hinter der Düne wittere ich Beute!', 'Hast du meine Spur gefunden?!', 'Schnurr! Die Wüste gehört mir!', 'Miau… die Spuren führten zu dir.')
r('Kragenechse Rüsche', 'Schreck-Kragen', 'Mit ihrem ersten Zug spreizt sie den Kragen und erschreckt dich: Du setzt einen Zug aus.',
  'Schau, wie ich meinen Kragen aufspanne! 😱', 'Buh! Erschrocken? Setz einen Zug aus!', 'Mein Kragen zittert — nah dran!', 'Du hast keine Angst vor mir?!', 'Erschreckt und gewonnen!', 'Mein Kragen ist zugeklappt…')
b('Der Sphinx-Pharao', 'Sandsturm', f'Nach deinem dritten Zug begräbt er die Spuren im Sand: {MEM}.',
  'Fluch der Pyramide', 'Bist du „Glühend“, geschieht dein nächster Zug von selbst: ein wilder Wurf. Einmal pro Runde.',
  'Löse mein Rätsel, Wanderer 🏺', 'Der Sand begräbt dein Gedächtnis!', 'Ein Fluch! Ein wilder Wurf!',
  'Die Wüstensterne sind auf meiner Seite!', 'Du hast mein Rätsel gelöst?!', 'Das Rätsel bleibt meins! 🏺', 'Du bist weiser als die Sphinx!')

# 9 · Lustiger Bauernhof
r('Kuh Rosi', 'Frische Milch', f'Bist du „Kalt“ oder weiter weg, spendiert sie dir Milch: einen {K} für dich. Einmal pro Runde.',
  'Muh! Hallo! 🥛', 'Kalt? Trink Milch — „⚡ +1 Zug“!', 'Muh, warm!', 'Muh! Fast gefunden!', 'Muh! Gewonnen!', 'Muh… gut gemacht!')
r('Ferkel Matsch', 'Pfütze', f'Wirst du kälter, springt das Ferkel in eine Pfütze: Platsch! {MEM}. Einmal pro Runde.',
  'Oink! Ich liebe Pfützen! 🐽', 'Platsch! Hoppla, überall Matsch!', 'Oink! Ich rieche den Sieg!', 'Oink-oink, nicht so nah!', 'Oink! Ich bin der Beste!', 'Oink… das war eine Sauerei.')
r('Esel Stroh', 'Sturkopf', 'Seinen dritten Zug setzt er stur aus.',
  'I-ah! Nur keine Eile 🌾', 'I-ah! Ich geh nicht — basta!', 'I-ah! Fast geschafft!', 'I-ah! Du bist schnell!', 'I-ah! Gewonnen!', 'I-ah… Sturheit hat nicht geholfen.')
r('Hahn Kamm', 'Kikeriki!', 'Mit seinem ersten Zug kräht er dem ganzen Hof zu: Die Zahl ist größer oder kleiner als seine.',
  'Kikeriki! Aufwachen! 📣', 'Kikeriki! Sie ist {k}!', 'Mein Kamm glüht — heiß!', 'Gack! Fast gefunden!', 'Kikeriki — gewonnen!', 'Meine Stimme ist weg…')
r('Ente Stiefel', 'Runde Pfützen', 'Sie springt auf runde Zahlen — die auf 0 enden —, solange noch viele Zahlen übrig sind.',
  'Quak! Platsch-platsch! 🎯', 'Quak! Ich springe in eine runde Pfütze!', 'Quak-quak, warm!', 'Quak! Du hast mich überholt!', 'Quak! Gewonnen!', 'Quak… nass geworden.')
r('Pony Zopf', 'Galopp', 'Ist das Pony „Sehr heiß“ oder näher, galoppiert es los: Beim nächsten Mal zieht es zweimal hintereinander. Einmal pro Runde.',
  'Wieher! Ich bin das Schnellste! 🐎', 'Wieher! Im Galopp — doppelt!', 'Im Galopp zum Sieg!', 'Du galoppierst schneller!', 'Ein Sieg im Galopp!', 'Meine Hufe sind müde…')
r('Collie Hirte', 'Zusammentreiben', 'Wirst du kälter, treibt er dich in den Pferch: Du setzt einen Zug aus. Einmal pro Runde.',
  'Wuff! Ich hole alle zusammen! 🐕', 'Wuff! Ab in den Pferch — setz aus!', 'Ich rieche es — nah dran!', 'Wuff! Du läufst direkt hin!', 'Alle im Pferch — gewonnen!', 'Alle sind weggelaufen…')
r('Truthahn Fächer', 'Fächerschwanz', 'Sein zweiter Zug ist hinter seinem Schwanz versteckt.',
  'Bewundere meinen Schwanz! 🎴', 'Frrr! Der Zug ist hinter meinem Schwanz!', 'Mein Schwanz fächert sich — heiß!', 'Du schaust hinter meinen Schwanz?!', 'Ein schöner Sieg!', 'Mein Schwanz hängt…')
r('Maus Emmentaler', 'Knabberei', f'Bist du „Sehr kalt“, knabbert sie heimlich: einen {K} für sie. Einmal pro Runde.',
  'Piep! Der Käse gehört mir! 🧀', 'Piep! Geknabbert — „⚡“ für mich!', 'Ich rieche Käse — ich bin nah dran!', 'Piep! Du bist an meinem Loch!', 'Piep! Der ganze Käse gehört mir!', 'Piep… der Käse ist weg.')
b('General Gans', 'Zwicken', 'Bist du „Warm“ oder näher, zwickt er dich und schnappt sich deinen „⚡ +1 Zug“. Einmal pro Runde.',
  'Gänsemarsch', 'Wird er kälter, befiehlt er „Marsch!“: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Stillgestanden! Auf diesem Hof habe ich das Kommando! 👑', 'Schnatter! Gezwickt — dein „⚡“ gehört mir!', 'Im Gänsemarsch! Zwei Züge hintereinander!',
  'Schnatter! Ziel in Sicht!', 'Soldat, du bist zu nah!', 'Sieg! Körner für alle! 👑', 'Rückzug… du gewinnst, schnatter.')

# 10 · Wolkenstadt
r('Papagei Pilot', 'Nachplappern', 'Bist du „Glühend“, plappert er dir nach und verplappert sich: Die Zahl ist größer oder kleiner als deine. Einmal pro Runde.',
  'Hallo! Hallo! 🦜', 'Glühend! Glühend! Sie ist {k}!', 'Kurs aufs Ziel! Kurs!', 'Nah! Nah!', 'Landung — gewonnen!', 'Kurs verloren!')
r('Kolibri Nektar', 'Flatter-flatter', 'Mit seinem ersten Zug flattert er doppelt: Er zieht sofort noch einmal.',
  'Ich bin der Kleinste und Schnellste! 🌺', 'Flatter-flatter — zwei Züge!', 'Ich rieche Nektar — heiß!', 'Du bist schneller als ein Kolibri?!', 'Der süße Nektar des Sieges!', 'Ich fliege zu den Blumen…')
r('Flamingo Fifi', 'Auf einem Bein', 'Beim fünften Zug der Runde stellt sich Fifi auf ein Bein und setzt den nächsten Zug aus.',
  'Ich bin die Eleganteste! 🦩', 'Ich stehe auf einem Bein… setze aus.', 'Oh, wie heiß!', 'Oh! Fast gefunden!', 'Ein eleganter Sieg!', 'Oh… Gleichgewicht verloren.')
r('Jungadler Höhe', 'Adlerauge', 'Ab seinem zweiten Zug weiß er, ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht.',
  'Von oben sehe ich alles! 🦅', 'Von hier oben weiß ich, ob sie gerade ist oder nicht!', 'Ziel in Sicht!', 'Du fliegst höher als ich!', 'Ein Adlersieg!', 'Eine Wolke war im Weg…')
r('Mauersegler Blitz', 'Wirbelwind', 'Ein Wirbelwind trägt deinen dritten Zug davon: Du siehst ihn nicht.',
  'Wusch! Ich bin schneller als der Wind! 💨', 'Wusch! Dein Zug ist weggeweht!', 'Ich fliege direkt zum Ziel!', 'Kannst du etwa auch fliegen?!', 'Wusch — ich gewinne!', 'Ich habe es nicht geschafft…')
r('Albatros Brise', 'Rückenwind', 'Wird er wärmer, fängt er Rückenwind und zieht sofort noch einmal. Einmal pro Runde.',
  'Ich überquere den ganzen Ozean, ohne mit den Flügeln zu schlagen 🌊', 'Rückenwind! Ich ziehe noch mal!', 'Der Wind trägt mich zur Antwort!', 'Sturm zieht auf… du bist nah!', 'Ich war zuerst da!', 'Flaute… du gewinnst.')
r('Schwalbe Pfeil', 'Ein Brief', f'Wirst du kälter, bringt sie dir einen Brief mit einem {K}. Einmal pro Runde.',
  'Ich habe einen Brief für dich! ✉️', 'Sei nicht traurig — hier ist ein „⚡ +1 Zug“!', 'Ich fliege direkt zum Ziel!', 'Du bist schneller als eine Schwalbe!', 'Ich war zuerst da!', 'Der Brief kam zu spät…')
r('Gleithörnchen Segler', 'Gleitflug', 'Wird das Gleithörnchen kälter, gleitet es davon: Dieser Zug ist vor dir versteckt.',
  'Ich fliege ohne Flügel! 🪂', 'Wusch — ich gleite unsichtbar!', 'Ich gleite genau aufs Ziel!', 'Du holst mich ein!', 'Sanfte Landung — gewonnen!', 'An einem Ast hängen geblieben…')
r('Storch Post', 'Ein Paket', f'Nach deinem zweiten Zug bringt er ein Paket: einen {K} für dich.',
  'Post! Für wen ist das Paket? 📦', 'Ein Paket für dich — „⚡ +1 Zug“!', 'Die Adresse hab ich fast!', 'Du hast die Adresse selbst gefunden?!', 'Zugestellt — gewonnen!', 'Das Paket kam zurück…')
b('Der Donnervogel', 'Donnerschlag', 'Wirst du wärmer, grollt der Donner: Du setzt einen Zug aus. Einmal pro Runde.',
  'Platzregen', 'Der vierte Zug der Runde verschwindet im Platzregen: Du siehst ihn nicht.',
  'Der Himmel ist mein Reich! 👑', 'KAWUMM! Setz einen Zug aus!', 'Platzregen! Diesen Zug siehst du nicht!',
  'Das Gewitter ist nah!', 'Du fliegst durch mein Gewitter!', 'Ein donnernder Sieg! 👑', 'Das Gewitter hat sich gelegt… du gewinnst.')

# 11 · Blumengarten
r('Biene Summ', 'Honig', f'Ist sie „Sehr heiß“ oder näher, legt sie Honig zurück: einen {K} für sich. Einmal pro Runde.',
  'Summ! Hallo! 🐝', 'Summ! Honig — und ein „⚡ +1 Zug“ für mich!', 'Ich rieche eine Blume — heiß!', 'Summ! Du bist an meinem Stock!', 'Ein honigsüßer Sieg! 🍯', 'Summ… ich fliege weg.')
r('Schmetterling Regenbogen', 'Pollen-Tipp', 'Bist du „Warm“ oder näher, verrät er dir, ob die Zahl gerade oder ungerade ist. Einmal pro Runde.',
  'Ich mache dein Spiel bunt! 🌈', 'Der Pollen flüstert: Die Zahl ist {k}!', 'Ich flattere zur Antwort!', 'Fast hättest du mich gefangen!', 'Ein Regenbogensieg!', 'Weiter zur nächsten Blume…')
r('Raupe Buch', 'Fertig gelesen!', 'Mit ihrem dritten Zug liest sie den Tipp zu Ende: Sie weiß, in welcher Hälfte die Zahl liegt. Dir verrät sie es nicht.',
  'Ich lese alles! 📖', 'Fertig gelesen! Jetzt kenne ich die Hälfte!', 'Das Buch sagt — nah dran!', 'Hast du das Buch auch gelesen?!', 'Wissen ist Macht!', 'Hätte ich das Buch doch zu Ende gelesen…')
r('Schnecke Gänseblümchen', 'Trippelschritte', 'Sie kriecht in winzigen Schritten nah an ihrer letzten Zahl. Und sie denkt lange nach.',
  'Keine Eile… ich komme 🐌', 'Ein Schrittchen… noch ein Schrittchen…', 'Langsam, aber sicher — heiß!', 'Du bist schnell… und ich bin eine Schnecke!', 'Langsam gewinnt auch! 🐌', 'Nicht rechtzeitig angekommen…')
r('Grashüpfer Geige', 'Melodie', 'Beim dritten Zug der Runde spielt er eine Tipp-Melodie: gerade oder ungerade.',
  'Hör dir meine Geige an! 🎻', 'Tra-la-la! Die Zahl ist {k}!', 'Die Musik wird lauter — nah dran!', 'Du triffst jeden Ton!', 'Eine Siegesmelodie!', 'Eine Saite ist gerissen…')
r('Libelle Propeller', 'Hubschrauber', 'Ist sie „Warm“ oder näher, schwirrt sie hoch und zieht sofort noch einmal. Einmal pro Runde.',
  'Wrrr! Abflug! 🚁', 'Warm! Ich schwirre hoch — noch ein Zug!', 'Ich schwebe über dem Ziel!', 'Du fliegst schneller!', 'Landung mit Sieg!', 'Mein Propeller ist müde…')
r('Ameise Kraftpaket', 'Verwirrt', f'Du schaltest deinen {K} ein — die Ameise ist so verblüfft, dass sie einen Zug aussetzt. Einmal pro Runde.',
  'Ich kann alles heben! 💪', 'Oh, ein „⚡“! Ich bin verwirrt — setze aus!', 'Ich trage den Sieg nach Hause!', 'Du bist stärker als ich?!', 'Stark ist, wer nicht aufgibt!', 'Das war schwer…')
r('Hummel Pummel', 'Teilen', f'Wird sie wärmer, teilt sie mit dir: einen {K} für dich. Einmal pro Runde.',
  'Summ! Lass uns Freunde sein! 🌸', 'Wärmer! Ich teile — hier, ein „⚡“!', 'Summ, die Blume ist nah!', 'Summ! Du hast meine Blume gefunden!', 'Ein flauschiger Sieg!', 'Summ… gut gemacht.')
r('Maulwurf Gießkanne', 'Tunnel', 'Mit seinem dritten Zug gräbt er einen Tunnel: Er zieht sofort noch einmal.',
  'Ich grabe und grabe! 🕳️', 'Ein Tunnel! Noch ein Zug!', 'Ich rieche eine Wurzel — nah dran!', 'Du gräbst schneller!', 'Zum Sieg gegraben!', 'Eingestürzt…')
b('Die Bienenkönigin', 'Schwarm', f'Wirst du wärmer, kommt ein Schwarm geflogen: {FOG_F}. Einmal pro Runde.',
  'Honigfalle', 'Bist du „Glühend“, bleibst du im Honig kleben und setzt einen Zug aus. Einmal pro Runde.',
  'Der ganze Garten dient mir! 🐝', 'Schwarm, los! Summ!', 'Im Honig kleben geblieben? Setz aus!',
  'Der Honig des Sieges ist nah!', 'Wie mutig du fliegst!', 'Königin des Gartens! 🐝', 'Du bist süßer als Honig!')

# 12 · Dinotal
r('Triceratops Horn', 'Rammen', 'Ist er „Glühend“, stürmt er los: Du setzt einen Zug aus. Einmal pro Runde.',
  'Drei Hörner — drei Siege! 🦏', 'Angriff! Setz einen Zug aus!', 'Meine Hörner spüren das Ziel!', 'Du hast keine Angst vor Hörnern?!', 'Zum Sieg gestürmt!', 'Meine Hörner sind stumpf…')
r('Stegosaurus Zacke', 'Zacken', f'Du schaltest deinen {K} ein — er platzt an seinen Zacken und ist weg. Einmal pro Runde.',
  'Vorsicht, ich bin stachelig! 🦔', 'Autsch! Dein „⚡“ ist an meinen Zacken geplatzt!', 'Meine Zacken zittern — nah dran!', 'Du weichst meinen Zacken aus!', 'Ein zackiger Sieg!', 'Meine Zacken haben nicht geholfen…')
r('Flugsaurier Feder', 'Sturzflug', 'Wirst du kälter, geht er in den Sturzflug: Beim nächsten Mal zieht er zweimal hintereinander. Einmal pro Runde.',
  'Ich bin der König der Lüfte! 🪶', 'Sturzflug! Nächster Zug — doppelt!', 'Ich sehe das Ziel vom Himmel aus!', 'Du fliegst höher als ich?!', 'Ein Sieg von oben!', 'Gelandet…')
r('Brachiosaurus Langhals', 'Langer Hals', 'Er reckt sich: Nach seinem dritten Zug verrät er dir, in welcher Hälfte die Zahl liegt.',
  'Von hier oben sehe ich alles! 🦒', 'Erreicht! Ich sehe: {k}.', 'Mein Hals reckt sich zur Antwort!', 'Du bist so hoch geklettert!', 'Langer Hals — langer Sieg!', 'Nicht drangekommen…')
r('Ankylosaurus Keule', 'Schwanzkeule', f'Bist du „Glühend“, schwingt er die Keule: Dein {K} ist weg. Einmal pro Runde.',
  'Bumm-bumm! Ich bin gepanzert! 🔨', 'BUMM! Dein „⚡“ ist zertrümmert!', 'Meine Keule spürt das Ziel!', 'Du hast meinen Panzer geknackt?!', 'Ein gepanzerter Sieg!', 'Mein Panzer hat einen Riss…')
r('Raptor Flitz', 'Flink', 'Er denkt schnell und zieht mit seinem zweiten Zug sofort noch einmal.',
  'Ich bin der Schnellste! 💨', 'Zack! Noch ein Zug!', 'Ich hole die Antwort ein!', 'Du bist genauso flink!', 'Ein blitzschneller Sieg!', 'Aus der Puste…')
r('Dino Schale', 'Schlüpfen', 'Bei seinem zweiten Zug schlüpft er noch — und setzt ihn aus.',
  'Klopf-klopf… ich schlüpfe! 🥚', 'Knack… ich schlüpfe noch, ich setze aus!', 'Wow, fast getroffen!', 'Du bist groß und schlau!', 'Klein, aber oho!', 'Ich verstecke mich in meiner Schale…')
r('Parasaurus Tröte', 'Trompete', 'Bist du „Kalt“ oder weiter weg, trötet er: Die Zahl ist größer oder kleiner als deine.',
  'Tröt-tröt! Hör meine Trompete! 🎺', 'Tröt! Sie ist {k}!', 'Meine Trompete tönt — warm!', 'Tröt! Du bist fast da!', 'Ein Siegesmarsch!', 'Meine Trompete ist heiser…')
r('Plesiosaurus Taucher', 'Abtauchen', 'Ist er „Warm“ oder näher, taucht er ab: Dieser Zug ist vor dir versteckt. Einmal pro Runde.',
  'Platsch! Ich komme aus dem See! 🌊', 'Abgetaucht — der Zug ist unter Wasser!', 'Ich rieche Fisch — nah dran!', 'Du tauchst tiefer?!', 'Ein Sieg aus der Tiefe!', 'Mit leeren Flossen aufgetaucht…')
b('König T-Rex', 'Stampfen', 'Ist er „Sehr heiß“ oder näher, stampft er: Du erstarrst vor Schreck und setzt einen Zug aus. Einmal pro Runde.',
  'Königsschritt', 'Nach seinem vierten Zug macht er einen Königsschritt: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Ich bin der König der Dinos! ROAR! 🦖', 'STAMPF-STAMPF! Erstarre!', 'Ein Königsschritt — doppelt!',
  'Der König riecht Beute!', 'Du hast keine Angst vor dem König?!', 'Das Tal gehört mir! 🦖', 'Du hast den König besiegt!')

# 13 · Pirateninsel
r('Möwe Matrosin', 'Schreihals', 'Jedes Mal, wenn sie kälter wird, ruft sie: Die Zahl ist größer oder kleiner als ihre.',
  'Matrosin an Deck! ⚓', 'Kreisch! Sie ist {k}!', 'Land! Land ist nah!', 'Kreisch! Du hast den Schatz gefunden?!', 'Die Matrosin ist eine Heldin!', 'Kreiiisch… über Bord.')
r('Mops Freibeuter', 'Entern', f'Bist du „Sehr heiß“ oder näher, entert er dein Schiff und nimmt deinen {K}. Einmal pro Runde.',
  'Wuff! Alle Mann an Deck! 🏴‍☠️', 'Entern! Dein „⚡“ gehört mir!', 'Ich rieche einen Schatz!', 'Wuff! Du bist an meiner Truhe!', 'Die Beute gehört mir!', 'Ich ergebe mich, Kapitän…')
r('Papagei Dublone', 'Piaster!', 'Bist du „Glühend“, krächzt er „Piaster!“ und wirft dir eine Münze zu: einen „⚡ +1 Zug“. Einmal pro Runde.',
  'Piaster! Ahoi, Schiffsjunge! 🦜', 'Piaster! Fang einen „⚡ +1 Zug“!', 'Lora wittert einen Schatz!', 'Der Schiffsjunge hat den Schatz fast gefunden!', 'Die Dublonen gehören mir!', 'Die Dublonen… gehören dir.')
r('Seestern Funkel', 'Leitstern', 'Zu Beginn der Runde verrät er dir, ob die Zahl gerade oder ungerade ist.',
  'Ich zeige dir den Weg! ⭐', 'Der Leitstern sagt: Die Zahl ist {k}!', 'Genau auf Kurs!', 'Du segelst nach den Sternen!', 'Ein strahlender Sieg!', 'Mein Stern ist erloschen…')
r('Ratte Pfiff', 'Trillerpfeife', 'Mit ihrem dritten Zug pfeift sie: Du erstarrst und setzt einen Zug aus.',
  'Schrubbt das Deck! 📯', 'Trillll! Erstarre! Setz aus!', 'Kurs auf den Schatz!', 'Du bist schneller als die ganze Mannschaft!', 'Volle Fahrt voraus — gewonnen!', 'Meine Pfeife ist über Bord gefallen…')
r('Hummer Zange', 'Schere', 'Wirst du wärmer, schnappt er deinen Zug mit der Schere: Du siehst ihn nicht. Einmal pro Runde.',
  'Schnipp-schnapp! 🦞', 'Schnapp! Dein Zug ist in meiner Schere!', 'Meine Scheren spüren das Ziel!', 'Du hast dich an meine Scheren rangeschlichen!', 'Den Sieg geschnappt!', 'Meine Scheren haben losgelassen…')
r('Pelikan Lotse', 'Die Karte', 'Nach seinem zweiten Zug rollt er die Karte aus: Er verrät dir, in welcher Hälfte die Zahl liegt.',
  'Der Lotse ist auf der Brücke! 🗺️', 'Die Karte zeigt: {k}.', 'Kurs direkt auf den Schatz!', 'Du hast auch eine Karte?!', 'Die Karte führte zum Sieg!', 'Meine Karte ist nass…')
r('Katze Dreispitz', 'Schatzversteck', f'Wirst du kälter, schleppt sie deinen {K} in ihre Truhe. Einmal pro Runde.',
  'Miau! Wo ist der Schatz? 🗝️', 'Schnurr! Dein „⚡“ kommt in meine Truhe!', 'Schnurr, ich rieche Fisch!', 'Miau! Du bist an meinem Schatz!', 'Schnurr! Die Beute gehört mir!', 'Miau… entwischt.')
r('Leguan Kanone', 'Breitseite', f'Ist er „Glühend“ — Kanonenschuss: {LAVA}. Einmal pro Runde.',
  'Kanone geladen! 💥', 'BUMM! Ein wilder Wurf!', 'Ziel im Visier!', 'Du bist der Kugel ausgewichen!', 'Ein perfekter Schuss!', 'Mein Pulver ist nass…')
b('Kapitän Tiger', 'Entern!', f'Bist du „Glühend“, nimmt er sich deinen {K}. Einmal pro Runde.',
  'Kanonensalve', 'Beim fünften Zug der Runde feuern alle Kanonen: Du setzt einen Zug aus.',
  'Diese Insel gehört mir! Grrr! 🏴‍☠️', 'Entern! Der „⚡“ gehört mir!', 'Feuer! Setz einen Zug aus!',
  'Der Schatz ist fast meiner!', 'Ein mutiger Pirat!', 'Die Insel gehört mir! 🐯', 'Du bist der beste Kapitän!')

# 14 · Halloweendorf
r('Gespenst Laterne', 'Durch Wände', 'Ist das Gespenst „Sehr heiß“ oder näher, schwebt es durch die Wand: Diesen Zug siehst du nicht. Einmal pro Runde.',
  'Buh! Keine Angst, ich bin lieb 👻', 'Huuuh! Dieser Zug geht durch die Wand!', 'Meine Laterne leuchtet heller — nah dran!', 'Du kannst mich sehen?!', 'Huuuh! Gewonnen!', 'Ich verblasse…')
r('Wasserspeier Zeiger', 'Steinfinger', 'Nach deinem zweiten Zug zeigt er mit seinem Steinfinger: Die Zahl ist größer oder kleiner als deine.',
  'Keine Angst — ich bin aus Stein, aber lieb 🗿', 'Mein Finger zeigt: Sie ist {k}!', 'Ich spüre den Weg, wie Stein den Regen spürt!', 'Du bist auf dem richtigen Weg!', 'Stein ist stark — der Sieg gehört mir!', 'Ich bin vor Staunen versteinert…')
r('Katze Besen', 'Besenflug', 'Ist sie „Glühend“, fliegt sie auf ihrem Besen davon und zieht sofort noch einmal. Einmal pro Runde.',
  'Miau! Ich kann zaubern 🧹', 'Miau! Auf den Besen — noch ein Zug!', 'Der Zauber wirkt!', 'Miau! Du kannst auch zaubern?!', 'Ein magischer Sieg!', 'Mein Besen ist kaputt…')
r('Mumie Binde', 'Binden', 'Nach deinem dritten Zug wickelt sie dich in Binden: Du setzt einen Zug aus.',
  'Mmm… ich komme aus der Pyramide 🩹', 'Mmm! Eingewickelt — setz aus!', 'Mmm… warm…', 'Wickel mich nicht aus!', 'Mmm! Gewonnen!', 'Ich habe mich ausgewickelt…')
r('Monster Bolzen', 'Stromschlag', f'Mit seinem zweiten Zug verteilt es einen Stromschlag: {LAVA}.',
  'Ich bin aus lauter Einzelteilen! 🔌', 'Bzzzt! Stromschlag! Ein wilder Wurf!', 'Es funkt — heiß!', 'Oh, du hast bei mir einen Kurzschluss ausgelöst!', 'Ein geladener Sieg!', 'Meine Batterie ist leer…')
r('Spinne Zylinder', 'Netz', 'Bist du „Warm“ oder näher, verhedderst du dich im Netz und setzt einen Zug aus. Einmal pro Runde.',
  'Willkommen in meinem kleinen Netz! 🕸️', 'Im Netz gefangen! Setz aus!', 'Mein Netz zittert — nah dran!', 'Du zerreißt mein Netz!', 'Ein eleganter Sieg!', 'Mein Netz ist gerissen…')
r('Rabe Krächz', 'Krah!', f'Wirst du kälter, krächzt er dir ins Ohr: {LAVA}. Einmal pro Runde.',
  'Krah! Ich bin der König der Nacht! 😵', 'KRAH! Ein wilder Wurf!', 'Krah! Nah dran!', 'Krah-krah! Fast gefunden!', 'Krah — gewonnen!', 'Krah… ich fliege weg.')
r('Wolfswelpe Heuler', 'Vollmond', 'Beim sechsten Zug der Runde geht der Mond auf: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Auuu! Gleich kommt der Mond! 🌕', 'Vollmond! Auuu! Zwei Züge!', 'Meine Nase riecht das Ziel!', 'Du heulst besser als ich!', 'Auuu! Gewonnen!', 'Der Mond hat sich versteckt…')
r('Goblin Wusel', 'Beinchen stellen', 'Wird er wärmer, stellt er dir ein Beinchen: Du setzt einen Zug aus. Einmal pro Runde.',
  'Hihi! Wusch — und schon bin ich da! 👀', 'Hoppla! Beinchen gestellt — setz einen Zug aus!', 'Hihi, ich bin fast da!', 'Oh, du hast mich entdeckt!', 'Hihi! Ausgetrickst!', 'Wusch… und weg bin ich. Du gewinnst.')
b('Graf Fangzahn', 'Fledermausschwarm', f'Ist er „Glühend“, lässt er die Fledermäuse los: {FOG}. Einmal pro Runde.',
  'Biss', f'Wirst du wärmer, beißt er in deinen {K}: Er ist weg. Einmal pro Runde.',
  'Willkommen in meinem Schloss… 🦇', 'Fliegt, meine Fledermäuse!', 'Happs! Dein „⚡“ ist weg!',
  'Ich rieche… etwas Warmes!', 'Wie hast du mein Schloss gefunden?!', 'Die Nacht gehört mir! 🦇', 'Morgengrauen… verloren.')

# 15 · Königsschloss
r('Froschprinz Quak', 'Guter Prinz', 'Bist du „Sehr kalt“, hat er Mitleid: Du ziehst sofort noch einmal. Einmal pro Runde.',
  'Quak! Ich bin ein verzauberter Prinz 🐸', 'Quak! Sei nicht traurig — zieh noch mal!', 'Quak! Meine Krone spürt das Ziel!', 'Quak! Fast hättest du den Zauber gebrochen!', 'Quak — ein königlicher Sieg!', 'Quak… noch eine Runde?')
r('Corgi Prinzessin', 'Königlicher Befehl', 'Nach deinem ersten Zug befiehlt die Prinzessin dir zu warten: Du setzt deinen nächsten Zug aus.',
  'Wuff! Verbeug dich vor der Prinzessin! 📜', 'Ich befehle: Setz einen Zug aus!', 'Die Prinzessin riecht den Sieg!', 'Du bist ein mutiger Untertan!', 'Sieg für die Prinzessin!', 'Na gut, du hast eine Belohnung verdient!')
r('Frettchen Schelm', 'Lachanfall', 'Beim dritten Zug der Runde bringt es dich so zum Lachen, dass dein nächster Zug von selbst geschieht — ein wilder Wurf.',
  'Hihi! Ich bringe dich zum Lachen! 🃏', 'Haha! Vor Lachen — ein wilder Wurf!', 'Hihi, heiß!', 'Du lachst nicht?!', 'Der Narr gewinnt — das ist lustig!', 'Ha… der Witz war ein Flop.')
r('Schwan Ballerina', 'Pirouette', 'Wird die Ballerina wärmer, dreht sie eine Pirouette: Dieser Zug ist vor dir versteckt. Einmal pro Runde.',
  'Ich tanze schöner als alle! 🩰', 'Eine Pirouette — und der Zug ist weg!', 'Der Tanz führt zum Ziel!', 'Du tanzt genauso leicht!', 'Ein Siegestanz!', 'Gestolpert…')
r('Pfau Herold', 'Der Herold', 'Mit seinem ersten Zug verkündet er dem ganzen Schloss, in welcher Hälfte die Zahl liegt.',
  'Achtung! Hört, hört! 🦚', 'Hört, hört: {k}!', 'Ich verkünde den Sieg!', 'Du bist lauter als der Herold!', 'Ich rufe den Sieg aus!', 'Kein Ton mehr…')
r('Greif Gold', 'Krallen', f'Wird er wärmer, trägt er deinen {K} in seinen Krallen davon. Einmal pro Runde.',
  'Ich bin ein Greif — stark und schnell! 🦅', 'Wärmer! Dein „⚡“ ist in meinen Krallen!', 'Meine Flügel tragen mich zum Ziel!', 'Du bist mutiger als ein Löwe!', 'Ein Greifensieg!', 'Ich fliege in die Berge…')
r('Beagle Musketier', 'Ausfall', f'Ist er „Sehr heiß“ oder näher, macht er einen Ausfall: Dein {K} ist weg. Einmal pro Runde.',
  'Einer für alle! 🤺', 'Treffer! Dein „⚡“ ist weg!', 'Mein Degen spürt das Ziel!', 'En garde!', 'Für den König — gewonnen!', 'Touché… du gewinnst.')
r('Dachsritter Tapfer', 'Der Ritter beginnt', 'Er zieht immer zuerst und verrät dir mit seinem zweiten Zug ehrlich, ob die Zahl gerade oder ungerade ist.',
  'Ein Ritter zieht immer zuerst! 🛡️', 'Ritterwort: Die Zahl ist {k}!', 'Vorwärts, zum Sieg!', 'Ein würdiger Gegner!', 'Sieg dem Ritter!', 'Ich senke meinen Schild — du gewinnst.')
r('Troll Moos', 'Brückenzoll', f'Nach deinem zweiten Zug verlangt er Brückenzoll: Dein {K} gehört ihm.',
  'Du willst über meine Brücke? Zahl! 🌉', 'Brückenzoll! Der „⚡“ gehört mir!', 'Der Troll riecht den Sieg!', 'Du bist schlauer als ein Troll!', 'Die Brücke gehört mir!', 'Geh nur… du hast gewonnen.')
b('Der Löwenkönig', 'Königsgebrüll', 'Bist du „Glühend“, brüllt er so laut, dass du bis zum Rundenende nur die letzten zwei Züge siehst. Einmal pro Runde.',
  'Die Krone', 'Ist er „Warm“ oder näher, zieht er beim nächsten Mal zweimal hintereinander. Einmal pro Runde.',
  'Ich bin der König dieses Schlosses! 🦁', 'B-R-R-RÜLL! Alles vergessen?', 'Meine Krone strahlt — zwei Züge!',
  'Das Königreich ist fast meins!', 'Du bist mutiger als alle meine Ritter!', 'Lang lebe der König! 🦁', 'Du bist der Krone würdig!')

assert len(H) == 100, len(H)
