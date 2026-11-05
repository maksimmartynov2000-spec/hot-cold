WORLDS = ['Neuseeland', 'Amazonien', 'Zauberschule', 'Superheldenstadt', 'Thron der Zeit']
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

# 46 · Neuseeland
r('Kiwi Knäuel', 'Feine Schnabelspitze', 'Bist du „Sehr heiß“ oder näher, schnüffelt er mit der Schnabelspitze am Boden und verrät dir, in welcher Hälfte die Zahl liegt. Einmal pro Runde.',
  'Meine Nasenlöcher sitzen an der Schnabelspitze! 🥝', 'Schnüffel, schnüffel! Hinweis: Die Zahl ist {k}!', 'Ich rieche die Antwort unter dem Laub!', 'Du hast meinen Pfad gefunden!', 'Ein Kiwi-Sieg!', 'Ab in den nächtlichen Wald…')
r('Kea Lausbub', 'Streich', f'Mit seinem zweiten Zug stibitzt er deinen {K}: Jetzt gehört er ihm.',
  'Hihi! Ich bin der frechste Papagei der Berge! 🦜', 'Stibitzt! Dein „⚡“ gehört jetzt mir!', 'Ich mache Unfug direkt neben der Antwort!', 'Du hast mich erwischt?!', 'Ein Lausbuben-Sieg!', 'Ich fliege in die Berge…')
r('Kakapo Kuschel', 'Knuddeln', f'Bist du „Sehr kalt“, knuddelt er dich: je einen {K} für dich und für ihn. Einmal pro Runde.',
  'Fliegen kann ich nicht — aber super knuddeln! 🤗', 'Knuddel! Ein „⚡ +1 Zug“ für jeden!', 'Ich watschle zur Antwort!', 'Du holst auf!', 'Ein kuscheliger Sieg!', 'Ich knuddle jetzt einen Baum…')
r('Pukeko Sumpfi', 'Spähen', 'Wirst du wärmer, späht er heimlich und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht. Einmal pro Runde.',
  'Meine Federn sind blau wie das Meer! 🐦', 'Ich habe gespäht… jetzt weiß ich mehr.', 'Ich hüpfe über die Grasbüschel zur Antwort!', 'Spähst du auch?!', 'Ein Sumpfsieg!', 'Ich verstecke mich im Schilf…')
r('Weta Koloss', 'Unter dem Baumstamm', 'Ist sie „Kalt“ oder weiter weg, versteckt sie sich unter einem Baumstamm und setzt ihren Zug aus. Einmal pro Runde.',
  'Ich bin riesig, aber sehr lieb! 🦗', 'Unter dem Baumstamm… ich setze aus.', 'Ich krabble zur Antwort!', 'Du hattest keine Angst vor mir?!', 'Ein riesiger Sieg!', 'Ich krabble unter meinen Baumstamm…')
r('Takahe Indigo', 'Saftiges Gras', f'Nach deinem dritten Zug knabbert er saftiges Gras — und nimmt sich einen {K}.',
  'Alle dachten, ich sei ausgestorben — und hier bin ich! 🌾', 'Mampf, mampf! Ein „⚡ +1 Zug“ für mich!', 'Ich laufe durchs Gras zur Antwort!', 'Du hast meine Wiese gefunden!', 'Ein blauer Sieg!', 'Ich gehe Gras knabbern…')
r('Tui Spötter', 'Spottlied', 'Nach deinem zweiten Zug singt er deinen Zug nach und verrät dir: Die Zahl ist größer oder kleiner als deine.',
  'Ich singe mit zwei Stimmen zugleich! 🎶', 'Ich singe: Die Zahl ist {k}!', 'Das Lied führt zur Antwort!', 'Machst du mich nach?!', 'Ein gesungener Sieg!', 'Meine Stimme ist gebrochen…')
r('Seebär Strandi', 'Sonnenbad', 'Zu Beginn der Runde sonnt er sich auf einem Felsen und setzt seinen ersten Zug aus.',
  'Sonne, Felsen, Meer — was braucht man mehr? 🏖️', 'Ich sonne mich… ich setze aus.', 'Ich schwimme zur Antwort!', 'Sonnst du dich neben mir?!', 'Ein Strandsieg!', 'Ich gehe schwimmen…')
r('Fächerschwanz Flirr', 'Flatterflug', 'Nach deinem dritten Zug flattert sie auf und verdeckt deinen Zug: Du siehst ihn nicht.',
  'Flatter, flatter! Mein Schwanz ist ein Fächer! 🍃', 'Flatter! Du siehst deinen Zug nicht!', 'Ich flattere um die Antwort herum!', 'Du kommst mir nicht hinterher!', 'Ein flatterhafter Sieg!', 'Davongeflattert…')
b('Der Große Tuatara', 'Drittes Auge', 'Schon zu Beginn der Runde sieht er mit seinem dritten Auge, ob die Zahl gerade oder ungerade ist. Dir verrät er es nicht.',
  'Uralter Rat', 'Ist er „Kalt“ oder weiter weg, gibt er dir einen Rat: Die Zahl ist größer oder kleiner als seine. Einmal pro Runde.',
  'Ich bin älter als die Dinosaurier! 👑', 'Das dritte Auge sieht: Ich weiß mehr.', 'Uralter Rat: Die Zahl ist {k}!',
  'Die Zeit führt mich zur Antwort!', 'Du bist weise wie ein uraltes Reptil!', 'Ein uralter Sieg! 👑', 'Ich überlasse dir diese Inseln…')

# 47 · Amazonien
r('Zitteraal Volt', 'Stromschlag', f'Bist du „Sehr kalt“, verpasst er dir einen Stromschlag: Dein {K} brennt durch. Einmal pro Runde.',
  'Bzzz! Ich bin eine lebende Batterie! 🔌', 'Bzzz! Dein „⚡“ ist durchgebrannt!', 'Ich sprühe Funken vor Freude!', 'Du hast keine Angst vor Strom?!', 'Ein geladener Sieg!', 'Meine Batterie ist leer…')
r('Flussdelfin Rosalie', 'Echo des Flusses', 'Ist sie „Glühend“, lauscht sie dem Echo des Flusses und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät sie es nicht. Einmal pro Runde.',
  'Ich bin ein rosa Flussdelfin! 🐬', 'Das Echo hat geantwortet… ich weiß mehr.', 'Ich schwimme direkt zur Antwort!', 'Du schwimmst wie ein Delfin!', 'Ein rosa Sieg!', 'Ich schwimme flussabwärts…')
r('Piranha Klapp', 'Klapp', f'Wird sie kälter, klappert sie mit ihren kleinen Zähnen: Dein {K} ist weg. Einmal pro Runde.',
  'Ich bin ein lächelnder Piranha, ehrlich! 🐟', 'Klapp! Dein „⚡“ ist weg!', 'Ich schwimme mit meinem Schwarm zur Antwort!', 'Du hast keine Angst vor mir?!', 'Klapp — ich gewinne!', 'Ab ins Seegras…')
r('Hoatzin Punk', 'Dschungelduft', f'Ist er „Sehr heiß“ oder näher, riecht er so stark, dass dir schwindlig wird: {MEM}. Einmal pro Runde.',
  'Ich bin der seltsamste Vogel am Amazonas! 😵', 'Puh! Du merkst dir nur zwei Züge!', 'Mein Kamm zittert — nah!', 'Hältst du dir die Nase zu?!', 'Ein Punk-Sieg!', 'Ganz zerzaust…')
r('Pfeilgiftfrosch Türkis', 'Grelle Farben', f'Mit seinem zweiten Zug lässt er seine grellen Farben aufleuchten: {BLIND}.',
  'Ich bin winzig, aber sehr grell! 🐸', 'Blitz! Du siehst deine eigenen Züge nicht!', 'Ich hüpfe zur Antwort!', 'Hat dich das nicht geblendet?!', 'Ein leuchtender Sieg!', 'Ich verstecke mich unter einem Blatt…')
r('Harpyie Blick', 'Blick der Harpyie', 'Ist sie „Sehr kalt“, starrt sie dich so an, dass du einfrierst und einen Zug aussetzt. Einmal pro Runde.',
  'Meine Augen sehen den ganzen Dschungel! 🦅', 'Einfrieren! Setz einen Zug aus!', 'Ich sehe die Antwort von den Baumwipfeln!', 'Du hast meinem Blick standgehalten?!', 'Ein Sieg aus den Wipfeln!', 'Ich fliege zurück zum Kapokbaum…')
r('Tamarin Schnauzbart', 'Unfug', 'Nach deinem zweiten Zug tauscht er mit dir die „⚡ +1 Zug“: Deine gehen an ihn, seine an dich.',
  'Siehst du meinen Bart? Ein kaiserlicher! 🔀', 'Wir tauschen die „⚡“! Hihi!', 'Mein Bart wittert die Antwort!', 'Du bist schlauer als ich?!', 'Ein bärtiger Sieg!', 'Ab durch die Äste…')
r('Aguti Nüsschen', 'Nuss für schlechte Zeiten', f'Nach deinem vierten Zug gräbt er eine versteckte Nuss aus — und nimmt sich einen {K}.',
  'Ich pflanze Bäume, indem ich Nüsse verstecke! 🌰', 'Eine Nuss! Ein „⚡ +1 Zug“ für mich!', 'Ich renne zur Antwort!', 'Du hast mein Versteck gefunden?!', 'Ein nussiger Sieg!', 'Ich habe meine Nuss verloren…')
r('Morphofalter Azur', 'Blauer Schimmer', f'Wird sie wärmer, schimmern ihre Flügel: {FOG_F}. Einmal pro Runde.',
  'Meine Flügel leuchten wie der Himmel! 🦋', 'Schimmer! Du siehst meine Züge nicht!', 'Ich flattere zur Antwort!', 'Siehst du durch den Schimmer?!', 'Ein himmelblauer Sieg!', 'Ich fliege davon…')
b('Die Anakonda-Königin', 'Umschlingung', 'Nach deinem dritten Zug umschlingt sie dich: Du frierst ein und setzt einen Zug aus.',
  'Tribut des Dschungels', f'Zu Beginn der Runde nimmt sie sich deinen {K}.',
  'Ich bin die Königin des großen Flusses! 👑', 'Umschlungen! Einfrieren — setz einen Zug aus!', 'Tribut — dein „⚡“ gehört mir!',
  'Die Antwort liegt schon in meiner Umarmung!', 'Du bist mir gut entschlüpft!', 'Die Königin gewinnt! 👑', 'Ich tauche ab in die Tiefe…')

# 48 · Zauberschule
r('Eulenküken Briefchen', 'Brief', 'Nach deinem vierten Zug bringt er einen Brief: in welcher Hälfte die Zahl liegt.',
  'Huhu! Post für die Schüler! ✉️', 'Im Brief steht: Die Zahl ist {k}!', 'Der Brief fliegt zur Antwort!', 'Du hast meinen Brief gelesen?!', 'Post zugestellt — Sieg!', 'Der Brief ist verloren gegangen…')
r('Kröte Blubber', 'Zaubertrank', f'Nach deinem vierten Zug spritzt der Zaubertrank: {LAVA}.',
  'Quak! Ich braue Zaubertränke! 🧪', 'Platsch! Dein Zug ist irgendwohin geflogen!', 'Der Trank ist fast fertig!', 'Braust du auch Tränke?!', 'Ein magischer Sieg!', 'Der Trank ist verkocht…')
r('Zauberschülerin Rune', 'Zauberspruch', 'Nach deinem dritten Zug spricht sie einen Zauber und erfährt, in welcher Hälfte die Zahl liegt. Dir verrät sie es nicht.',
  'Ich bin die beste Schülerin der Schule! 🪄', 'Der Zauber hat gewirkt… ich weiß mehr.', 'Magie führt zur Antwort!', 'Zauberst du auch?!', 'Die Klassenbeste gewinnt!', 'Der Zauber ist verpufft…')
r('Zauberschüler Pergament', 'Schriftrolle', 'Mit seinem vierten Zug liest er eine Schriftrolle vor: ob die Zahl gerade oder ungerade ist.',
  'Ich habe alle Schriftrollen der Bibliothek gelesen! 📜', 'Die Schriftrolle sagt: Die Zahl ist {k}!', 'Die Schriftrolle führt zur Antwort!', 'Liest du meine Schriftrolle?!', 'Ein gelehrter Sieg!', 'Die Schriftrolle hat sich zusammengerollt…')
r('Kater Mystik', 'Schatten', 'Ist er „Kalt“ oder weiter weg, versteckt er seinen Zug im Schatten: Du siehst ihn nicht. Einmal pro Runde.',
  'Schnurr… ich bin der Kater eines Zauberers 🐈', 'Schnurr! Dieser Zug liegt im Schatten!', 'Ich schnurre neben der Antwort!', 'Siehst du im Schatten?!', 'Ein schnurrender Sieg!', 'Im Schatten verschwunden…')
r('Hippogreif Orkan', 'Flügelschlag', 'Mit seinem dritten Zug schlägt er mit den Flügeln: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Halb Adler, halb Pferd! 🌪️', 'Flügelschlag! Zwei Züge hintereinander!', 'Ich fliege zur Antwort!', 'Fliegst du mit mir?!', 'Ein Orkan-Sieg!', 'Ich falte meine Flügel…')
r('Pixie Schabernack', 'Streich', 'Beim dritten Zug der Runde spielt sie einen Streich: Sie tauscht mit dir die „⚡ +1 Zug“ — deine an sie, ihre an dich.',
  'Hihi! Ich liebe Streiche! 🔀', 'Streich! Wir haben die „⚡“ getauscht!', 'Ich treibe Schabernack neben der Antwort!', 'Du hast mich erwischt?!', 'Ein schelmischer Sieg!', 'Ich schwirre davon…')
r('Kaninchen Abrakadabra', 'Abrakadabra', 'Beim zweiten Zug der Runde — Abrakadabra: Wer gerade gezogen hat, zieht sofort noch einmal.',
  'Abrakadabra! Da bin ich! 🎩', 'Abrakadabra! Noch ein Zug!', 'Der Trick hat fast geklappt!', 'Du hast meinen Trick durchschaut?!', 'Ein Zaubersieg!', 'Puff — weg…')
r('Igel Salbei', 'Kräutertee', 'Nach jedem zweiten deiner Züge trinkt er Kräutertee: einen „⚡ +1 Zug“ für sich.',
  'Ich sammle Zauberkräuter! 🍵', 'Teezeit! Ein „⚡ +1 Zug“ für mich!', 'Die Kräuter führen zur Antwort!', 'Kennst du dich mit Kräutern aus?!', 'Ein heilsamer Sieg!', 'Der Tee ist kalt geworden…')
b('Erzmagier Graubart', 'Verzauberung', f'Bist du „Kalt“ oder weiter weg, verzaubert er dich: {BLIND}. Einmal pro Runde.',
  'Sternenwissen', 'Mit seinem ersten Zug liest er in den Sternen und erfährt, ob die Zahl durch 3 teilbar ist. Dir verrät er es nicht.',
  'Willkommen in der Zauberschule! 👑', 'Verzaubert! Du siehst deine eigenen Züge nicht!', 'Die Sterne haben mir mehr verraten…',
  'Die Magie führt mich zur Antwort!', 'Du bist ein mächtiger Zauberer!', 'Der Erzmagier gewinnt! 👑', 'Ich ziehe den Hut — du gewinnst…')

# 49 · Superheldenstadt
r('Wanderfalke Sturzflug', 'Sturzflug', 'Bei jedem vierten seiner Züge stürzt er herab: Beim nächsten Mal zieht er zweimal hintereinander.',
  'Ich bin der schnellste Vogel der Welt! 💨', 'Sturzflug! Zwei Züge hintereinander!', 'Ich stürze mich auf die Antwort!', 'Du bist schneller als ich?!', 'Ein Sieg mit Überschall!', 'Aus dem Sturzflug abgefangen…')
r('Herkuleskäfer Titan', 'Felsbrocken', 'Mit seinem zweiten Zug hebt er einen Felsbrocken: Du frierst ein und setzt einen Zug aus.',
  'Ich hebe das Hundertfache meines Gewichts! 🪨', 'Felsbrocken! Einfrieren — setz einen Zug aus!', 'Kraft führt zur Antwort!', 'Du bist ja auch ein Kraftprotz!', 'Ein titanischer Sieg!', 'Der Felsbrocken war zu schwer…')
r('Glasfrosch Unsichtbar', 'Unsichtbarkeit', f'Nach deinem dritten Zug wird sie unsichtbar: {FOG_F}.',
  'Man kann durch mich hindurchsehen! 👻', 'Unsichtbar! Du siehst meine Züge nicht!', 'Ich hüpfe ungesehen zur Antwort!', 'Siehst du mich?!', 'Ein unsichtbarer Sieg!', 'Ich wurde entdeckt…')
r('Fangschreckenkrebs Wumms', 'Superschlag', 'Mit ihrem vierten Zug landet sie einen Superschlag: Du setzt einen Zug aus.',
  'Mein Schlag ist schneller als eine Kugel! 🥊', 'Bumm! Setz einen Zug aus!', 'Ein Schlag genau ins Ziel!', 'Du hast meinen Schlag pariert?!', 'Ein schlagkräftiger Sieg!', 'Ich bin müde vom Kämpfen…')
r('Honigdachs Furchtlos', 'Furchtlos', f'Ist er „Sehr kalt“, nimmt er dir furchtlos deinen {K} weg. Einmal pro Runde. Deine Boni „Einfrieren“ und „Wilder Wurf“ wirken bei ihm nicht.',
  'Ich habe vor nichts Angst! 🦡', 'Keine Angst! Dein „⚡“ gehört mir!', 'Ich stürme direkt zur Antwort!', 'Bist du auch furchtlos?!', 'Ein furchtloser Sieg!', 'Na gut… diesmal hast du gewonnen.')
r('Schützenfisch Volltreffer', 'Präziser Strahl', f'Beim vierten Zug der Runde schießt sie deinen {K} mit einem Wasserstrahl ab.',
  'Ich treffe eine Fliege im Flug — mit Wasser! 🎯', 'Pssst! Dein „⚡“ ist abgeschossen!', 'Ich ziele auf die Antwort!', 'Du bist meinem Strahl ausgewichen?!', 'Ein Sieg wie ein Meisterschuss!', 'Daneben…')
r('Schnabeltier Sensor', 'Tauchgang', 'Ist er „Kalt“ oder weiter weg, taucht er ab und sucht mit seinem Sensorschnabel: Bis zum Rundenende siehst du seine Züge nicht. Einmal pro Runde.',
  'Mein Schnabel spürt Strom! 📡', 'Blubb! Du siehst meine Züge nicht!', 'Der Sensor piept — nah!', 'Störst du meinen Sensor?!', 'Ein sensationeller Sieg!', 'Mein Sensor ist kaputt…')
r('Spitzmaus Turbo', 'Turbo', 'Nach jedem zweiten deiner Züge zündet ihr Turbo: Beim nächsten Mal zieht sie zweimal hintereinander.',
  'Mein Herz schlägt tausendmal pro Minute! 🏎️', 'Turbo! Zwei Züge hintereinander!', 'Ich düse zur Antwort!', 'Kommst du mit?!', 'Ein Turbo-Sieg!', 'Der Tank ist leer…')
r('Leierschwanz Sirene', 'Sirene', 'Bei jedem dritten seiner Züge ahmt er eine Sirene nach: Dein nächster Zug geschieht von selbst — ein wilder Wurf.',
  'Ich kann jedes Geräusch nachmachen! 🎙️', 'Tatü-tata! Dein Zug ist irgendwohin geflogen!', 'Ich singe zur Antwort!', 'Du hast mich übertönt?!', 'Ein nachgemachter Sieg — aber echt!', 'Meine Stimme ist weg…')
b('Doktor Chaos', 'Chaosstrahl', f'Du hast deinen {K} eingeschaltet — das Chaos mischt mit: {LAVA}. Einmal pro Runde.',
  'Blendstrahler', f'Beim fünften Zug der Runde schaltet er seinen Blendstrahler ein: {BLIND}.',
  'Haha! Ich bin ein Bösewicht… aber ein süßer! 👑', 'Chaosstrahl! Dein Zug ist irgendwohin geflogen!', 'Blendstrahler! Du siehst deine eigenen Züge nicht!',
  'Mein Plan geht auf!', 'Du hast meinen Plan durchkreuzt?!', 'Das Chaos gewinnt! 👑', 'Ich ergebe mich, Held…')

# 50 · Thron der Zeit
r('Dodo Stolper', 'Stolperer', 'Nach deinem zweiten Zug stolpert er und rempelt dich an: Du setzt einen Zug aus.',
  'Ich bin ein Dodo, kein Dinosaurier! 🦤', 'Hoppla! Angerempelt — setz einen Zug aus!', 'Ich stapfe zur Antwort!', 'Du holst auf?!', 'Ein Dodo-Sieg!', 'Ich bin gestolpert…')
r('Moa Langbein', 'Weitblick', 'Beim zweiten Zug der Runde schaut sie über die Bäume und erfährt die Zehnerziffer der Zahl. Dir verrät sie es nicht.',
  'Ich bin größer als jede Giraffe! 🔭', 'Ich sehe weit… ich weiß mehr.', 'Ich stakse zur Antwort!', 'Du bist aber groß!', 'Ein großer Sieg!', 'Meine Beine sind müde…')
r('Beutelwolf Tasman', 'Verschwinden', 'Nach deinem dritten Zug verschwindet er — und nimmt deine Züge mit: Bis zum Rundenende siehst du deine eigenen Züge nicht.',
  'Mich hat schon lange keiner mehr gesehen! 🐺', 'Verschwunden! Du siehst deine eigenen Züge nicht!', 'Ich schleiche mich zur Antwort!', 'Siehst du mich?!', 'Ein gestreifter Sieg!', 'Ich verschwinde wieder…')
r('Trilobit Kambrium', 'Uralter Schlamm', 'Mit seinem zweiten Zug gräbt er sich in uralten Schlamm ein: Bis zum Rundenende siehst du seine Züge nicht.',
  'Ich bin fünfhundert Millionen Jahre alt! 🪲', 'Eingegraben! Du siehst meine Züge nicht!', 'Seit Urzeiten krabble ich zur Antwort!', 'Du bist schneller als die Urzeit!', 'Ein urzeitlicher Sieg!', 'Zeit, ein Fossil zu werden…')
r('Stellersche Seekuh Riesin', 'Seetangwald', 'Mit ihrem ersten Zug wirbelt sie den Seetangwald auf: Bis zum Rundenende siehst du nur die letzten zwei Züge.',
  'Ich bin riesig und sehr lieb! 🐄', 'Aufgewirbelt! Du merkst dir nur zwei Züge!', 'Ich schwimme zur Antwort!', 'Du schwimmst neben mir!', 'Ein lieber Sieg!', 'Ich schwimme ins kalte Meer…')
r('Riesenalk Frack', 'Verbeugung', 'Nach deinem zweiten Zug verbeugt sie sich höflich — und erfährt, ob die Zahl gerade oder ungerade ist. Dir verrät sie es nicht.',
  'Ich trage mein Leben lang einen Frack! 🐧', 'Mit einer Verbeugung… ich weiß mehr.', 'Ich gehe im Frack zur Antwort!', 'Du bist genauso höflich?!', 'Ein eleganter Sieg!', 'Ich empfehle mich…')
r('Haastadler Spannweite', 'Flügelschatten', 'Mit seinem dritten Zug bedeckt er dich mit dem Schatten seiner Flügel: Du frierst ein und setzt einen Zug aus.',
  'Meine Flügel sind breiter als ein Auto! 🦅', 'Schatten! Einfrieren — setz einen Zug aus!', 'Ich fliege zur Antwort!', 'Du hast keine Angst vor dem Schatten?!', 'Ein Sieg mit Spannweite!', 'Ich fliege in die Vergangenheit…')
r('Quagga Halbzebra', 'Flimmernde Streifen', 'Zu Beginn der Runde blenden dich ihre Streifen: Bis zum Rundenende siehst du deine eigenen Züge nicht.',
  'Ich bin ein halbes Zebra! 🦓', 'Streifen! Du siehst deine eigenen Züge nicht!', 'Ich galoppiere zur Antwort!', 'Siehst du durch meine Streifen?!', 'Ein halbgestreifter Sieg!', 'Ich galoppiere in die Vergangenheit…')
r('Ammonit Jura', 'Zeitspirale', f'Nach deinem zweiten Zug dreht er die Zeit zur Spirale: {MEM}.',
  'Ich wohne in einem Spiralhaus! 🐚', 'Spirale! Du merkst dir nur zwei Züge!', 'Die Spirale führt zur Antwort!', 'Du bist aus der Spirale entkommen?!', 'Ein spiraliger Sieg!', 'Mein Haus ist leer…')
b('Gebieter Chronos', 'Zeitstillstand', 'Zu Beginn der Runde hält er die Zeit an: Du frierst ein und setzt einen Zug aus.',
  'Blick durch die Zeit', 'Ist er „Sehr heiß“ oder näher, blickt er durch die Zeit und erfährt die letzte Ziffer der Zahl. Dir verrät er es nicht. Einmal pro Runde.',
  'Ich hüte die Zeit der ganzen Welt! 👑', 'Zeitstillstand! Setz einen Zug aus!', 'Ich sehe die Zukunft… und weiß mehr.',
  'Die Zeit ist auf meiner Seite!', 'Du bist schneller als die Zeit!', 'Die Zeit gewinnt! 👑', 'Deine Zeit ist gekommen — du gewinnst…')
