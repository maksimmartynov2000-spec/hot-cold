WORLDS = ['Champions’ Stadium', 'Detective Quarter', 'Galápagos', 'Wild West', 'Land of Yokai',
          'Islands of Indonesia', 'Academy of Scientists', 'Lost Temple', 'Great Steppe', 'Asgard']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '“⚡ +1 move”'
LAVA = 'your next move is made for you: a wild throw'

# 36 · Champions’ Stadium
r('Dash the Greyhound', 'Sprint', 'If she is “Cold” or farther, she sprints: she moves again right away. Once per round.',
  'On your marks, get set… go! 🏃', 'Sprint! I move again!', 'The home straight!', 'You run faster than me?!', 'First across the line!', 'I dropped out of the race…')
r('Hook the Kangaroo', 'Hook', 'After your fourth move he throws a hook: you’re knocked down and skip a turn.',
  'Let’s box fair and square! 🥊', 'Hook! You’re down — skip a turn!', 'I’m in top form!', 'You can take a punch!', 'Knockout — I win!', 'Hanging up my gloves…')
r('Paddles the Otter', 'A Breath of Air', f'With her fourth move she comes up for air — and takes a {K} for herself.',
  'Nobody swims breaststroke like me! 🏊', 'Breathe! A “⚡ +1 move” for me!', 'I can see the wall!', 'You’re neck and neck with me!', 'Gold in the pool!', 'I swallowed some water…')
r('Hefty the Elephant Seal', 'Breather', 'When he gets warmer, he lifts the barbell and rests: he skips his turn. Once per round.',
  'I’m the strongest on the beach! 🏋️', 'Phew… weight lifted. Resting — skipping a turn.', 'A record lift — and I’m close!', 'You’re stronger than you look!', 'A world record!', 'The barbell won…')
r('Puck the Beaver', 'Slap Shot', f'When he is “Burning”, he fires the puck: your {K} is knocked away. Once per round.',
  'Score! Score! 🏒', 'Slap shot! Your “⚡” is knocked away!', 'Breakaway!', 'You block my shots!', 'Goal! I win!', 'Hit the post…')
r('Pirouette the Sable', 'Pirouette', 'The sixth move of the round disappears into a pirouette: you can’t see it.',
  'Watch me spin! ⛸️', 'Pirouette! You can’t see this move!', 'A clean skate!', 'You skate as well as I do!', 'Perfect score!', 'I fell on the ice…')
r('Flip the Chimpanzee', 'Somersault', 'When you are “Warm” or closer, he does a somersault: his next move is two in a row. Once per round.',
  'Ooh-ooh! Watch this flip! 🤸', 'Somersault! Two moves in a row!', 'Landing right on target!', 'Are you a gymnast too?!', 'A perfect landing!', 'Fell off the rings…')
r('Marathon the Impala', 'Water Station', f'With her third move she hands you water at the water station: a {K} for you.',
  'A marathon is a long way! 🥤', 'Water station! Have a “⚡ +1 move”!', 'Second wind!', 'You’re catching up with me!', 'Marathon complete!', 'I dropped out at mile 20…')
r('Dunk the Okapi', 'Pass', f'When he is “Warm” or closer, he passes to you: a {K}. Once per round.',
  'Half giraffe, half zebra — all basketball player! 🏀', 'Pass! Catch a “⚡ +1 move”!', 'Going for the dunk!', 'Great defense!', 'Slam dunk! I win!', 'Missed the hoop…')
b('The Grizzly Champion', 'Champion’s Roar', 'With his fourth move he roars so loudly that you freeze and skip a turn.',
  'Gold Medal', f'On the fifth move of the round he takes your {K} for himself.',
  'I’m the champion of every stadium! 👑', 'ROAR! Freeze — skip a turn!', 'The medal is mine — and so is your “⚡”!',
  'The record is close!', 'You’re a worthy opponent!', 'The champion wins again! 👑', 'I hand you the trophy…')

# 37 · Detective Quarter
r('Sniffer the Basset Hound', 'On the Trail', 'If you are “Very cold”, he picks up the trail and tells you which half the number is in. Once per round.',
  'My nose never lets me down! 🔎', 'Sniff, sniff! Hint: the number is {k}!', 'The trail leads straight to the answer!', 'You’re following my trail!', 'Case closed!', 'The trail went cold…')
r('Inspector Bulldog', 'Report', 'With his fourth move he reports to you: the number is more or less than his.',
  'Inspector on duty! 📋', 'Reporting: the number is {k}!', 'The suspect is almost caught!', 'Running your own investigation?!', 'Case closed!', 'The evidence didn’t add up…')
r('Clue the Magpie', 'Shiny Clue', 'On the third move of the round she brings a clue: the last digit of the number.',
  'Everything shiny is a clue! 🔑', 'Found a clue: {k}!', 'The clues lead to the answer!', 'Collecting clues too?!', 'The clue worked!', 'I lost the clue…')
r('Cipher the Siamese Cat', 'Decoding', 'After your second move she decodes whether the number is divisible by 3. She won’t tell you.',
  'Meow. Agent reporting 🕶️', 'Message decoded. Not telling you.', 'Target in sight!', 'You cracked my code?!', 'Mission accomplished!', 'My cover is blown…')
r('Courier the Pigeon', 'Dispatch', 'After your third move he delivers a dispatch: whether the number is even or odd.',
  'Coo-coo! Mail for the detective ✉️', 'Dispatch: the number is {k}!', 'Flying straight to the target!', 'You intercepted my letter?!', 'Letter delivered — I win!', 'The wind took my letter…')
r('Files the Guinea Pig', 'Case File', 'After your fourth move she finds the case file: the tens digit.',
  'My filing cabinet has everything! 🗂️', 'Found the file: {k}!', 'The case is almost solved!', 'Are you reading my files?!', 'Case archived — I win!', 'The file went missing…')
r('Prints the Koala', 'Fingerprints', 'When he is “Warm” or closer, he dusts for prints and tells you whether the number is even or odd. Once per round.',
  'Koalas have fingerprints just like people! 🖐️', 'The prints say: the number is {k}!', 'The prints lead to the answer!', 'You found my fingerprints?!', 'Forensics confirm — I win!', 'The prints smudged…')
r('Gossip the Starling', 'Gossip', 'On the fifth move of the round he lets slip which half the number is in.',
  'Want some news? I’ve got hundreds! 🗣️', 'Shhh, don’t tell! The number is {k}!', 'I heard the answer is very close!', 'Are you eavesdropping?!', 'Everyone’s talking about my win!', 'I’m out of news…')
r('Lockpick the Raccoon', 'Quick Paws', f'After your third move he picks your pocket: your {K} is his now.',
  'I was just passing by! 🔓', 'Click! Your “⚡” is mine now!', 'The lock is almost open!', 'You caught me?!', 'Heh-heh, smooth!', 'Caught red-handed…')
b('The Phantom Panther', 'Smoke Screen', 'On the fourth move of the round she vanishes in smoke: you can’t see her moves for the rest of the round.',
  'Heist of the Century', f'When she gets colder, she steals your {K}. Once per round.',
  'Nobody has ever caught me! 👑', 'Poof! Find me in the smoke!', 'Heist of the century — your “⚡” is mine!',
  'The answer is almost in my paws!', 'You’re on my trail!', 'The Phantom can’t be caught! 👑', 'Caught… you’re the best detective.')

# 38 · Galápagos
r('Salty the Marine Iguana', 'Salty Sneeze', 'When she gets colder, she sneezes salt: you skip a turn. Once per round.',
  'I dive into the sea for seaweed! 🧂', 'Achoo! Salt — skip a turn!', 'Sunbathing right by the answer!', 'You dove deeper than me!', 'A salty win!', 'Off to warm up on a rock…')
r('Tango the Blue-Footed Booby', 'Blue-Foot Dance', 'When you are “Burning”, she starts dancing: her next move is two in a row. Once per round.',
  'Look at my blue feet! 🩰', 'Tango! Two moves in a row!', 'Dancing straight to the answer!', 'You dance better than me?!', 'A victory dance!', 'I lost the beat…')
r('Balloon the Frigatebird', 'Red Balloon', 'When you are “Warm” or closer, he puffs up the red balloon on his throat: you can’t see his moves for the rest of the round. Once per round.',
  'See my red balloon? 🔴', 'Puff! You can’t see my moves!', 'Soaring over the answer!', 'Are you flying after me?!', 'A wide-winged win!', 'My balloon popped…')
r('Darwin the Finch', 'Observation', 'With his third move he shares an observation: whether the number is divisible by 3.',
  'Scientists understood evolution by looking at my beak! 🔬', 'Observation: the number is {k}!', 'The hypothesis checks out!', 'Are you a researcher too?!', 'A scientific win!', 'The experiment failed…')
r('Lazybones the Sea Lion', 'Laziness', 'Every third move of his he’s too lazy and skips it.',
  'Yaaawn… the sun is so warm 😴', 'Too lazy… skipping a turn.', 'Even lying down I’m close!', 'You woke me up!', 'I won without getting up!', 'Back to my nap…')
r('Skipper the Flying Fish', 'Spray', 'The second move of the round drowns in spray: you can’t see it.',
  'I can fly over the waves! 🌊', 'Splash! This move is lost in the spray!', 'Flying straight to the answer!', 'Can you fly too?!', 'A flying win!', 'Back into the sea…')
r('Waddle the Cormorant', 'A Fish for a Friend', f'When he is “Very cold”, he shares a fish with you: a {K} for you. Once per round.',
  'I can’t fly — but I can dive! 🐟', 'Have a fish — and a “⚡ +1 move”!', 'Diving straight to the answer!', 'You dive deeper!', 'A flightless win!', 'The fish got away…')
r('Pushup the Lava Lizard', 'Push-ups', f'With her second move she does push-ups on a rock — and takes a {K} for herself.',
  'One-two, one-two! Push-ups! 💪', 'Push-ups done — a “⚡ +1 move” for me!', 'I’m in great shape!', 'You’re stronger than me?!', 'Strength wins!', 'Too tired for push-ups…')
r('Sentry the Hawk', 'View from the Cactus', 'After your fourth move he looks down from a cactus and tells you: the number is more or less than yours.',
  'You can see everything from a cactus! 🦅', 'From up here I see: the number is {k}!', 'Circling over the answer!', 'You’re as sharp-eyed as me!', 'A win from above!', 'Off to another cactus…')
b('Patriarch George', 'Ancient Wisdom', 'Right from the start of the round he knows which half the number is in. He won’t tell you.',
  'Tortoise Dash', 'If you are “Cold” or farther, he suddenly speeds up: his next move is two in a row. Once per round.',
  'I’m two hundred years old — I’ve seen it all! 👑', 'The wisdom of ages: I know where to look.', 'Tortoise dash — two moves in a row!',
  'Slow and steady to the answer!', 'You’re wise beyond your years!', 'Wisdom wins! 👑', 'I give you this island…')

# 39 · Wild West
r('Yip the Prairie Dog', 'Alarm Call', 'When you are “Burning”, she yips a hint: whether the number is even or odd. Once per round.',
  'Yip! I’m on lookout! 🐕', 'Yip-yip! The number is {k}!', 'I can see the answer from my mound!', 'You sneaked up to my burrow!', 'Yip! I win!', 'Hiding in my burrow…')
r('Drifter the Coyote', 'Howl at the Moon', 'On the third move of the round he howls at the moon: for the rest of the round you only see the last two moves.',
  'I roam the prairie! 🐺', 'Ow-ooo! You only remember two moves!', 'I can smell the answer!', 'Are you a drifter too?!', 'A victory howl!', 'Riding off into the sunset…')
r('Rattle the Rattlesnake', 'Rattle', 'If you are “Very cold”, he shakes his rattle: you freeze and skip a turn. Once per round.',
  'Rrrrr! That’s how I say hello 🐍', 'Rrrrr! Freeze — skip a turn!', 'Slithering to the answer!', 'You’re not scared of my rattle?!', 'Rrrrr! I win!', 'Slithering under a rock…')
r('Gale the Mustang', 'Gallop', 'With his second move he breaks into a gallop: he moves again right away.',
  'Nobody can tame me! 🐎', 'Gallop! I move again!', 'Galloping straight to the answer!', 'Are you riding after me?!', 'A wild win!', 'Off to the prairie…')
r('Prickles the Porcupine', 'Quills', 'When he is “Cold” or farther, he raises his quills: you get pricked and skip a turn. Once per round.',
  'I wouldn’t hug me if I were you! 📌', 'Ouch! Pricked — skip a turn!', 'Poking right at the target!', 'You’re not scared of me?!', 'A prickly win!', 'Rolling into a ball…')
r('Dusty the Roadrunner', 'Off Like a Shot', 'When she is “Very cold”, she takes off like a shot: she moves again right away. Once per round.',
  'Beep-beep! You can’t catch me! 💨', 'Beep-beep! I move again!', 'Running straight to the answer!', 'You run faster?!', 'Beep-beep! I win!', 'Just a cloud of dust left…')
r('Peeky the Burrowing Owl', 'Out of the Burrow', 'After your second move she peeks out of her burrow and learns: the number is more or less than yours. She won’t tell you.',
  'I live in a burrow, like a gopher! 🦉', 'I peeked out — now I know more.', 'I can see the answer from my burrow!', 'You peeked into my burrow?!', 'An underground win!', 'Hiding back inside…')
r('Beady the Gila Monster', 'Bite', f'With his fourth move he bites your {K} — and it’s gone.',
  'My skin looks like beads! 🦎', 'Chomp! Your “⚡” is gone!', 'Crawling to the answer!', 'You dodged?!', 'Beady wins!', 'Crawling into the shade…')
r('Forky the Pronghorn', 'Speeding Up', 'After your third move he speeds up: his next move is two in a row.',
  'I’m the fastest on the prairie! 🦌', 'Speeding up! Two moves in a row!', 'Racing to the answer!', 'You’re catching up?!', 'A horned win!', 'Too tired to run…')
b('Sheriff Bison', 'Hands Up!', f'You switched on your {K} — the sheriff shouts “Hands up!”: you skip your next turn. Once per round.',
  'Confiscation', f'On the sixth move of the round he confiscates your {K}.',
  'I keep the law in this town! 👑', 'Hands up! Skip a turn!', 'Confiscating your “⚡”!',
  'The answer is under arrest!', 'You’re an honest cowboy!', 'The law wins! 👑', 'Handing in my badge… you win.')

# 40 · Land of Yokai
r('Cucumber the Kappa', 'Cucumber', f'When he is “Very cold”, he crunches a cucumber and takes a {K} for himself. Once per round.',
  'Don’t spill the water on my head! 🥒', 'Crunch! A “⚡ +1 move” for me!', 'The cucumber leads to the answer!', 'Did you bow politely?!', 'A crunchy win!', 'The water spilled…')
r('Featherfan the Tengu', 'Feather Fan', f'When he is “Warm” or closer, he waves his feather fan: {LAVA}. Once per round.',
  'I’m a mountain spirit with crow wings! 🍃', 'Whoosh! Your move flew anywhere!', 'The wind carries me to the answer!', 'Didn’t you get blown away?!', 'A windy win!', 'Flying back to the mountains…')
r('Twotails the Nekomata', 'Two Tails', 'With her second move she swishes both tails: her next move is two in a row.',
  'Meow! Two tails are better than one 🐈', 'Meow! Two moves in a row!', 'My lantern lights up the answer!', 'Can you see in the dark?!', 'A purr-fect win!', 'My lantern went out…')
r('Gust the Kamaitachi', 'Gust of Wind', 'Your fourth move is blown away by a gust: you can’t see it.',
  'Whoosh! I’m a wind with little claws 🌀', 'Whoosh! Your move blew away!', 'Spinning right by the answer!', 'You stood firm in the wind?!', 'A whirlwind win!', 'The wind died down…')
r('Murmur the Kodama', 'Forest Whisper', 'When you are “Warm” or closer, it whispers to you which half the number is in. Once per round.',
  'Shhh… I live in an old tree 🌳', 'Shhh… the number is {k}…', 'The forest whispers — the answer is near!', 'Can you hear the forest?', 'A forest win!', 'Fading into the leaves…')
r('Shine the Amabie', 'Prophecy', 'At the start of the round she foretells whether the number is divisible by 5.',
  'I bring good fortunes! ✨', 'Prophecy: the number is {k}!', 'My scales shine — the answer is near!', 'Do you believe in prophecies?', 'It came true — I win!', 'The prophecy didn’t come true…')
r('Snowflake the Yuki-onna', 'Icy Breath', 'When she is “Cold” or farther, she breathes frost: you freeze and skip a turn. Once per round.',
  'I dance with the snowflakes ❄️', 'Whoo… Freeze — skip a turn!', 'The blizzard leads me to the answer!', 'Aren’t you cold?!', 'A snowy win!', 'I melted…')
r('Fortune the Zashiki-warashi', 'Luck at Home', f'On the third move of the round she brings luck: a {K} for you.',
  'Hee-hee! Wherever I am, there’s luck! 🎎', 'Luck! Have a “⚡ +1 move”!', 'Luck is on my side!', 'You’re lucky!', 'Hee-hee, lucky me!', 'My luck went to you…')
r('Onsen the Snow Monkey', 'Hot Spring', 'If you are “Very cold”, she warms up in the hot spring and skips her turn. Once per round.',
  'Ahh, a hot spring… ♨️', 'Warming up… skipping a turn.', 'Even in the water I’m close!', 'Want to warm up too?!', 'A cozy win!', 'The water got cold…')
b('The Oni King', 'Drum', 'With his third move he beats his drum: for the rest of the round you only see the last two moves.',
  'Oni Strength', f'When he is “Cold” or farther, he takes your {K}. Once per round.',
  'Don’t be afraid — I’m a kind oni! 👑', 'BOOM-BOOM! You only remember two moves!', 'Oni strength — your “⚡” is mine!',
  'The drum thunders — the answer is near!', 'You’re brave!', 'The Oni King wins! 👑', 'You beat the oni…')

# 41 · Islands of Indonesia
r('Borneo the Orangutan', 'Leaf Umbrella', 'If you are “Cold” or farther, he covers your move with a leaf: you can’t see it. Once per round.',
  'Hello from the forests of Borneo! 🌿', 'Under the leaf you can’t see your move!', 'Reaching right for the answer!', 'Can you climb trees?!', 'A rainforest win!', 'Off into the rain…')
r('Pearl the Bali Myna', 'Song Hint', 'On the second move of the round he sings you a hint: whether the number is even or odd.',
  'I live only on Bali! 🐦', 'I sing: the number is {k}!', 'The song leads to the answer!', 'You sing better than me?!', 'A song of victory!', 'I lost my voice…')
r('Casque the Hornbill', 'A Fig', f'After your fourth move she brings you a fig: a {K}.',
  'See my helmet? It’s part of my beak! 🍈', 'Have a fig — and a “⚡ +1 move”!', 'Flying to the answer!', 'You overtook me?!', 'A win in a helmet!', 'Flying off to the trees…')
r('Pajamas the Tapir', 'Pajama Nap', 'Every fourth move of his he falls asleep and skips it.',
  'I’m always in my pajamas! 🛌', 'Yawn… skipping a turn.', 'Feeling my way to the answer!', 'You woke me up!', 'A pajama win!', 'Time for bed…')
r('Slowpoke the Slow Loris', 'Ve-ery Slowly', 'After your third move he slowly gets lost in thought and skips his turn.',
  'Hel-lo-o… I’m no-ot in a hu-urry 🦥', 'Thi-inking… skipping a turn.', 'Slo-owly, but to the answer!', 'You’re so-o fast!', 'Quietly — and I win!', 'Too-oo late…')
r('Nosey the Proboscis Monkey', 'Trumpet Nose', 'If you are “Cold” or farther, he honks his nose so loudly that you only see the last two moves. Once per round.',
  'See my nose? The biggest in the jungle! 👃', 'HOOONK! You only remember two moves!', 'My nose smells the answer!', 'Your nose is as good as mine!', 'A nosy win!', 'Nose down…')
r('Carnival the Mandarinfish', 'Carnival of Colors', 'When she gets colder, she flashes her colors: you can’t see her moves for the rest of the round. Once per round.',
  'I’m the brightest fish on the reef! 🎨', 'Flash! You can’t see my moves!', 'Swimming to the answer!', 'Can you see through the colors?!', 'A colorful win!', 'My colors faded…')
r('Popcorn the Binturong', 'Treat', f'After your third move he shares a treat: a {K} for you and for himself.',
  'I smell like popcorn — really! 🍿', 'Help yourself! A “⚡ +1 move” for each of us!', 'Crawling to the answer!', 'You found me!', 'Purr — I win!', 'Off for a nap…')
r('Ray the Sun Bear', 'Honey', f'When he is “Very hot” or closer, he happily shares honey: a {K} for you and for himself. Once per round.',
  'See the sun on my chest? That’s me! 🍯', 'Honey! A “⚡ +1 move” for each of us!', 'I smell honey — the answer is near!', 'You found my honey?!', 'A sweet win!', 'The honey’s all gone…')
b('The Komodo King', 'Grip', 'After your fourth move he grabs you: you freeze and skip a turn.',
  'Prey', f'With his third move he takes a {K} for himself.',
  'I’m the biggest lizard in the world! 👑', 'Grab! Freeze — skip a turn!', 'Prey — a “⚡ +1 move” for me!',
  'The answer is already in my jaws!', 'You’re brave!', 'The island king wins! 👑', 'Crawling off to sunbathe…')

# 42 · Academy of Scientists
r('Echo the Bat', 'Echolocation', 'With every second move of his he listens to the echo and learns: the number is more or less than his. He won’t tell you.',
  'I see with my ears! 🦇', 'The echo answered… I know more.', 'The echo leads to the answer!', 'Can you hear the echo too?!', 'A win by sound!', 'The echo faded…')
r('Cog the Crow', 'Invention', 'After your second move she builds a gadget and tells you: the tens digit.',
  'I invent everything! ⚙️', 'The gadget shows: {k}!', 'The calculation is right!', 'Are you an inventor too?!', 'The invention worked!', 'The gadget broke…')
r('Beaker the Capuchin', 'Reaction', f'On the fifth move of the round the test tube fizzes: {LAVA}.',
  'Chemistry is fun! 🧪', 'Fizz! Your move flew anywhere!', 'The reaction is going well!', 'Mixed the same chemicals?!', 'The experiment worked!', 'The test tube cracked…')
r('Geo the Naked Mole-Rat', 'Excavation', 'If you are “Cold” or farther, he digs and learns the tens digit. He won’t tell you. Once per round.',
  'I live underground and hardly ever get old! ⛏️', 'Dug it up… now I know more.', 'Layer by layer — to the answer!', 'Digging nearby?!', 'A valuable find!', 'The tunnel caved in…')
r('Polyglot the Grey Parrot', 'In Every Language', 'With his second move he announces: whether the number is divisible by 3.',
  'I speak a hundred languages! 💬', 'Announcement: the number is {k}!', 'Words lead to the answer!', 'Do you understand me?!', 'A win in every language!', 'My tongue’s tied…')
r('Flask the Coati', 'Analysis', 'When you are “Warm” or closer, he runs an analysis and learns whether the number is divisible by 5. He won’t tell you. Once per round.',
  'My striped tail is like a ruler! ⚗️', 'Analysis complete. Not telling you.', 'The formula checks out!', 'Are you checking my math?!', 'A scientific win!', 'The flask broke…')
r('Hexa the Bee', 'Hexagons', 'After your third move she draws honeycombs and tells you whether the number is divisible by 5.',
  'Honeycombs are perfect hexagons! 📐', 'Bzzz! The number is {k}!', 'The drawing adds up!', 'Do you know geometry?!', 'A perfectly straight win!', 'My compass broke…')
r('Blueprint the Alpaca', 'Blueprint', 'When she is “Burning”, she unrolls her blueprint and shows you: the tens digit. Once per round.',
  'I draw bridges and towers! 📏', 'Blueprint: {k}!', 'All according to plan!', 'Are you an engineer too?!', 'I built a win!', 'The blueprint got crumpled…')
r('Labby the Gerbil', 'Experiment', 'When she gets warmer, she runs an experiment and learns the last digit. She won’t tell you. Once per round.',
  'Experiments are the best teacher! 🧫', 'It worked… I know more.', 'The experiment confirms it!', 'Repeating my experiment?!', 'Experiment — success!', 'The experiment failed…')
b('The Barn Owl Rector', 'Exam', 'Right from the start of the round she knows the last digit of the number. She won’t tell you.',
  'Rector’s Hint', 'After your third move she fairly tells you the same digit: the last one.',
  'Welcome to the Academy! 👑', 'I know the answer. Let’s see if you do.', 'The rector’s hint: {k}!',
  'The exam is almost passed!', 'An excellent student!', 'The exam is over — I win! 👑', 'Top marks to you…')

# 43 · Lost Temple
r('Emerald the Quetzal', 'Sacred Feather', 'When you are “Burning”, he drops a sacred feather and tells you which half the number is in. Once per round.',
  'I’m the sacred bird of the temple! 🪶', 'The feather says: the number is {k}!', 'The feather leads to the answer!', 'You found my feather?!', 'An emerald win!', 'Flying off into the jungle…')
r('Bellow the Howler Monkey', 'Howl', 'When you are “Very hot” or closer, he howls across the forest: for the rest of the round you only see the last two moves. Once per round.',
  'You can hear me three miles away! 📣', 'HOO-WAAA! You only remember two moves!', 'Howling with joy — close!', 'Did you go deaf?!', 'A loud win!', 'I lost my voice…')
r('Rooter the Peccary', 'Excavation', 'With his fourth move he digs up a clue and learns whether the number is even or odd. He won’t tell you.',
  'Oink! Digging up ancient secrets! 🐗', 'Dug it up… now I know more.', 'Digging to the answer!', 'Digging nearby?!', 'Oink — I win!', 'Found nothing…')
r('Fivehands the Spider Monkey', 'Tail Hand', f'After your second move she grabs your {K} with her tail: it’s hers now.',
  'I have five hands — one is my tail! 🐒', 'Grabbed it with my tail! Your “⚡” is mine!', 'I can reach the answer!', 'You’re nimble!', 'A tail-ented win!', 'My tail is tired…')
r('Splashdash the Basilisk Lizard', 'Run on Water', 'On the third move of the round — a dash across the water: whoever just moved moves again.',
  'I can run on water! 💧', 'Splash-splash-splash! Another move!', 'Running straight to the answer!', 'Can you run on water too?!', 'A wet win!', 'I sank…')
r('Grip the Kinkajou', 'Nightfall', 'On the sixth move of the round night falls: you can’t see his moves for the rest of the round.',
  'I go out at night! 🌙', 'Night! You can’t see my moves!', 'In the dark I can see the answer!', 'Can you see in the dark?!', 'A night-time win!', 'Dawn… off to sleep.')
r('Spots the Ocelot', 'Ambush', 'His fourth move hides in the leaves: you can’t see it.',
  'My spots hide me in the leaves! 🐆', 'Shh! This move is in ambush!', 'Sneaking up on the answer!', 'You found my ambush?!', 'A leap from ambush — I win!', 'The ambush failed…')
r('Licky the Tamandua', 'Long Tongue', f'With his third move he licks up your {K} — and it’s gone.',
  'My tongue is longer than my head! 👅', 'Slurp! Your “⚡” is gone!', 'I can taste the answer!', 'You dodged?!', 'A licked win!', 'My tongue is tired…')
r('Torch the Macaw', 'Fiery Wings', f'With his third move he flaps his fiery wings: {LAVA}.',
  'My feathers blaze like a torch! 🔥', 'Flap! Your move flew anywhere!', 'Flying to the answer!', 'You’re brighter than me?!', 'A fiery win!', 'My feathers faded…')
b('Balam the Jaguar Chief', 'Chief’s Stare', 'When he gets colder, he stares at you so that you freeze and skip a turn. Once per round.',
  'Exchange of Gifts', 'With his first move he swaps “⚡ +1 move” with you: yours go to him, his go to you.',
  'I’m the chief of the lost temple! 👑', 'The chief’s stare! Freeze — skip a turn!', 'An exchange of gifts — we swap “⚡”!',
  'The temple reveals the answer to me!', 'You’re worthy of the temple!', 'The chief wins! 👑', 'The temple is yours, traveler…')

# 44 · Great Steppe
r('Grumpy the Pallas Cat', 'Grumpy Look', f'After your fourth move he frowns so hard that your {K} goes out.',
  'I don’t smile. Ever 😾', 'Hmph! Your “⚡” went out!', 'Grumpy, but close!', 'Did you make me laugh?!', 'A grumpy win!', 'Hmph… fine.')
r('Snoot the Saiga', 'Dust Storm', 'When he is “Very cold”, his move is lost in the dust: you can’t see it. Once per round.',
  'My nose filters the steppe dust! 🏜️', 'Dust! You can’t see this move!', 'Galloping to the answer!', 'Running with me?!', 'A steppe win!', 'Gone into the dust…')
r('Dun the Przewalski Horse', 'A Ride', 'When you are “Warm” or closer, she gives you a ride: you move again right away. Once per round.',
  'I’m the last wild horse on Earth! 🐴', 'Hop on — move again!', 'Galloping to the answer!', 'You stay in the saddle!', 'A win at full gallop!', 'Galloped off into the steppe…')
r('Gallop the Kulan', 'Race', 'Every fourth move of his he moves again right away.',
  'I’m faster than the steppe wind! 🏇', 'Racing! I move again!', 'Catching up with the answer!', 'You gallop faster?!', 'A speedy win!', 'Too tired to gallop…')
r('Caravan the Bactrian Camel', 'Caravan', f'On the sixth move of the round the caravan arrives: a {K} for you and for him.',
  'Two humps — double supplies! 🐫', 'The caravan is here! A “⚡ +1 move” for each of us!', 'The caravan heads to the answer!', 'You caught up with me!', 'The caravan wins!', 'The caravan has gone…')
r('Pillar the Ground Squirrel', 'Whistle', 'When he gets colder, he whistles a hint: whether the number is even or odd. Once per round.',
  'I stand up straight and look far away! 🐿️', 'Wheet! The number is {k}!', 'I see the answer in the distance!', 'Standing up straight too?!', 'Wheet — I win!', 'Hiding in my burrow…')
r('Pompous the Bustard', 'Self-Importance', 'When you are “Very hot” or closer, she fluffs up her feathers importantly and skips her turn. Once per round.',
  'I’m the heaviest flying bird! 🦃', 'Fluffed up… skipping a turn.', 'Striding importantly to the answer!', 'You’re more important than me?!', 'An important win!', 'My feathers drooped…')
r('Speckles the Marbled Polecat', 'Tail Up', 'With her second move she raises her tail: for the rest of the round you only see the last two moves.',
  'I’m as colorful as a steppe carpet! 🦨', 'Tail up! You only remember two moves!', 'Darting around the answer!', 'You weren’t scared of me?!', 'A speckled win!', 'Running back to my burrow…')
r('Dusk the Corsac Fox', 'Sly Swap', 'When you get colder, he swaps “⚡ +1 move” with you: yours go to him, his go to you. Once per round.',
  'The steppe fox is the slyest! 🦊', 'We swap “⚡”! Sly, huh?', 'Slyness leads to the answer!', 'You’re slyer than me?!', 'A sly win!', 'Outfoxed…')
b('The Eagle Khan', 'Dive', f'If you are “Cold” or farther, he dives at you: {LAVA}. Once per round.',
  'View from Above', 'When he is “Burning”, he looks down from above and learns: the number is more or less than his. He won’t tell you. Once per round.',
  'I’m the khan of this steppe! 👑', 'Dive! Your move flew anywhere!', 'From above I see more…',
  'The answer is in my talons!', 'You’re as sharp-eyed as an eagle!', 'The khan wins! 👑', 'The steppe is yours…')

# 45 · Asgard
r('Sleipnir the Eight-Legged Foal', 'Eight Legs', 'When he is “Very cold”, he gallops on all eight legs: his next move is two in a row. Once per round.',
  'I have eight legs — catch me! 🐎', 'Eight legs! Two moves in a row!', 'Galloping across the worlds to the answer!', 'Are you riding with me?!', 'An eight-legged win!', 'My legs got tangled…')
r('Huginn the Raven', 'Thought', 'When you are “Warm” or closer, he flies around the world and learns: the number is more or less than yours. He won’t tell you. Once per round.',
  'My name means Thought — Huginn! 🪶', 'I flew around the world… I know more.', 'Thoughts lead to the answer!', 'You think fast!', 'A wise win!', 'The thought flew away…')
r('Ratatoskr the Squirrel', 'News from the Ash Tree', 'With her first move she brings news: whether the number is even or odd.',
  'I run up and down the World Tree! 📯', 'News from the Ash: the number is {k}!', 'Running to the answer!', 'You run faster?!', 'A squirrel’s win!', 'Off to the treetop…')
r('Fenrir the Wolf Pup', 'Little Teeth', f'After your first move he gnaws your {K} — and it’s gone.',
  'Grrr! I’ll grow up big! 🐺', 'Crunch! Your “⚡” is gone!', 'I can smell the answer!', 'You’re not scared of me?!', 'A wolfish win!', 'Going back to mom…')
r('Rumbler the Goat Kid', 'Thunder', 'On the second move of the round thunder rumbles: you skip a turn.',
  'Maa! I pull the chariot of thunder! 🌩️', 'KA-BOOM! Skip a turn!', 'The thunder leads me to the answer!', 'You’re not afraid of thunder?!', 'A thundering win!', 'The storm has passed…')
r('Icicle the Frost Giant', 'Frost', 'After your second move he breathes frost: you freeze and skip a turn.',
  'I’m a little frost giant! ❄️', 'Hooo! Freeze — skip a turn!', 'The ice leads to the answer!', 'Aren’t you cold?!', 'An icy win!', 'I’m melting…')
r('Sigrun the Valkyrie', 'Reward', f'With her second move she rewards your courage: a {K} for you.',
  'I choose the bravest! ⚔️', 'For courage — a “⚡ +1 move”!', 'Flying to the answer!', 'You’re a brave warrior!', 'Glory to the victory!', 'Off to Valhalla…')
r('Freya the Forest Cat', 'Purring', f'When you are “Warm” or closer, she purrs: a {K} for you and for herself. Once per round.',
  'I pull the goddess’s chariot! 🐈', 'Purr! A “⚡ +1 move” for each of us!', 'Purring right by the answer!', 'Are you petting me?!', 'A purr-fect win!', 'Off into the forest…')
r('Berserk the Bear Cub', 'Fury', 'When he is “Very cold”, he flies into a fury: you skip a turn. Once per round.',
  'Grrr! I’m scary… almost! 🐻', 'GRRR! Skip a turn!', 'Fury leads to the answer!', 'You weren’t scared?!', 'A furious win!', 'My fury’s gone…')
b('Jörmungandr the World Serpent', 'Storm', f'With his fourth move he stirs up a storm: {LAVA}.',
  'Sea Fog', 'If you are “Very cold”, a fog rises over the sea: you can’t see his moves for the rest of the round. Once per round.',
  'I wrap my tail around the whole world! 👑', 'Storm! Your move flew anywhere!', 'Fog! You can’t see my moves!',
  'The answer is already in my coils!', 'You crossed my sea!', 'The World Serpent wins! 👑', 'I let go of my tail…')
