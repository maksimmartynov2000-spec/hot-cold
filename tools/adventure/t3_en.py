WORLDS = ['Swamp', 'Faraway Tsardom', 'Mountain Peaks', 'Robot Factory', 'Land of Myths',
          'Autumn Forest', 'Valley of the Pyramids', 'Atlantis', 'Dreamland', 'Dwarf Forge']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '“⚡ +1 move”'
LAVA = 'your next move is made for you: a wild throw'

# 26 · Swamp
r('Reedy the Muskrat', 'Whispering Reeds', 'After your first move the reeds whisper to you which half the number is in.',
  'I live in the reeds! 🌾', 'Shhh… The number is {k}!', 'The reeds rustle — I’m close!', 'Oh, you’ve almost found it!', 'A reedy win!', 'I’ll hide in the reeds…')
r('Boomer the Bittern', 'Swamp Horn', 'On the sixth move of the round she booms across the swamp — you jump and skip a turn.',
  'My “boom” fills the whole swamp! 📯', 'BOO-OOM! Skip a turn!', 'Boom — I’m close!', 'Oh, you weren’t scared?!', 'A booming win!', 'I lost my voice…')
r('Slick the Mink', 'Nimble Paws', 'If you are “Cold” or farther, she nimbly snatches your “⚡ +1 move” for herself. Once per round.',
  'Hee-hee, I’m the nimblest in the swamp! 🦦', 'Snatch! Your “⚡” is mine now!', 'Hee-hee, almost got it!', 'You’re catching up with me!', 'Nimble! I win!', 'It slipped away…')
r('Wiggle the Tadpole', 'Wiggly Gift', f'When you get warmer, he wiggles over and gives you a {K}. Once per round.',
  'Soon I’ll be a frog! 🐸', 'Wiggle! Have a “⚡ +1 move”!', 'Swimming to the goal!', 'You swim faster!', 'A wiggly win!', 'Swimming away…')
r('Skimmer the Water Strider', 'Ripples', 'When you get warmer, she skims across the water and the ripples tell you: the number is more or less than yours. Once per round.',
  'I can run on water! 🦟', 'Look at the ripples: it’s {k}!', 'Skimming to the goal!', 'Oh, you’re close already!', 'A slippery win!', 'I slipped…')
r('Splash the Nutria', 'Splash!', f'With her third move she belly-flops into the water — the splash puts out your {K}.',
  'I love diving! 🦫', 'Splash! Your “⚡” went out!', 'Paddling straight to the goal!', 'You swim just as well!', 'A wet win!', 'I’ll go dry off…')
r('Tangle the Swamp Sprite', 'Swamp Spell', f'When you are “Warm” or closer, she muddles your head: {LAVA}. Once per round.',
  'I’m a kind swamp sprite! 🍃', 'A spell! A wild throw!', 'The mud whispers — close!', 'Oh, you can’t be tricked!', 'A swampy win!', 'Back into the mud…')
r('Dam the Beaver', 'The Dam', 'On the third move of the round he finishes his dam and gives a “⚡ +1 move” each to you and to himself.',
  'I build the best dams in the swamp! 🦫', 'The dam is done — a “⚡ +1 move” for each of us!', 'Building my way to the answer!', 'You swam across my dam!', 'A solid victory!', 'The dam broke…')
r('Snouty the Desman', 'Keen Nose', 'When she gets warmer, she sniffs with her long snout and tells you whether the number is even or odd. Once per round.',
  'My nose smells everything! 👃', 'Sniff-sniff! The number is {k}!', 'I smell the goal!', 'Your nose is as good as mine!', 'My nose was right!', 'My nose is stuffy…')
b('The Water King', 'Quagmire', 'When you get colder, the quagmire holds you: you freeze and skip a turn. Once per round.',
  'Water Lily', f'After your first move he picks a water lily: a {K} for himself.',
  'I’m the king of the whole swamp! 👑', 'Glug-glug! Freeze!', 'A lily — a “⚡” for me!', 'The swamp tells me — close!', 'Oh, you reached my palace!', 'A kingly win!', 'Back to the bottom…')

# 27 · Faraway Tsardom
r('Melody the Sirin', 'Prophetic Song', 'When you get colder, she sings a prophetic song and tells you whether the number is even or odd. Once per round.',
  'Listen to my song, traveler 🎶', 'I sing, I sing: the number is {k}!', 'My song leads me to the answer!', 'Can you hear my song?', 'A song of victory!', 'The song is over…')
r('The Little Humpbacked Horse', 'Wise Whisper', 'When he gets warmer, he whispers advice in your ear: which half the number is in. Once per round.',
  'Don’t be sad, I’ll help you! 🐴', 'Here’s my advice: {k}!', 'Galloping straight to the answer!', 'You’re catching up with me!', 'Neigh! I win!', 'Neigh… you win!')
r('Mossy the Leshy', 'Forest Treasure', 'When he is “Warm” or closer, he finds treasure in the forest: a “⚡ +1 move” for himself. Once per round.',
  'Hello-o! Don’t get lost in my forest! 🌲', 'Forest treasure — a “⚡ +1 move” for me!', 'The forest rustles — very hot!', 'You found my secret path!', 'Hello! The forest wins!', 'I got lost…')
r('Zmey Gorynych', 'Three Heads', 'When he is “Burning”, his three heads rush each other: his next move is two in a row. Once per round.',
  'Hi! Hi! Hi! That’s all three of us 🐉', 'Three heads in a hurry — two moves in a row!', 'Three heads smell the answer!', 'The heads are arguing — you’re close!', 'A triple victory!', 'All three heads are sad…')
r('Rustle the Domovoi', 'Behind the Stove', 'Every second move of his hides behind the stove: you can’t see it.',
  'Rustle-rustle… I’m here, behind the stove 🏠', 'Rustle-rustle… that move is behind the stove!', 'Rustle-rustle, I’m close!', 'Did you peek behind the stove?!', 'Rustle-rustle — I win!', 'Rustle… I’ll hide further away.')
r('Blaze the Firebird', 'Firebird Feather', 'When you are “Very hot” or closer, she drops a glowing feather: a “⚡ +1 move” for you. Once per round.',
  'My feather shines brighter than the sun! 🔥', 'Catch the feather — a “⚡ +1 move”!', 'Glowing right by the answer!', 'You almost caught the Firebird!', 'A glowing victory!', 'Flying away beyond thrice-nine lands…')
r('Finist the Falcon', 'Sharp Eye', 'With his third move he looks down from above and tells you: the number is more or less than his.',
  'I see everything from up high! 🦅', 'From up here I see: it’s {k}!', 'A clear eye — the right path!', 'Your eyes are sharper than mine!', 'Victory from above!', 'Flying away… you win.')
r('Baba Yaga', 'The Mortar', 'You switch on your “⚡ +1 move” — Yaga climbs into her mortar: her next move is two in a row. Once per round.',
  'Welcome, guest! Don’t be scared — I’m kind today 🧹', 'Fly, mortar! Two moves in a row!', 'I smell it — the answer is near!', 'My, what a speedy guest!', 'Heh-heh! Granny wins!', 'Well, good youth, you win!')
r('The Frog Princess', 'Enchantment', 'After your first move she casts a spell and learns: the number is more or less than yours. She won’t tell you.',
  'Ribbit! I’m an enchanted princess 🐸', 'Ribbit! My spell revealed the secret!', 'Ribbit! The magic works!', 'Did you break my spell?!', 'Ribbit! A royal victory!', 'Ribbit… the spell is broken.')
b('Koschei the Deathless', 'Icy Stare', 'On the fifth move of the round he gives you an icy stare: you freeze and skip a turn.',
  'Deathless Speed', 'When you get warmer, he hurries: his next move is two in a row. Once per round.',
  'I am Koschei the Deathless — no one can beat me! 👑', 'Freeze! You skip a turn!', 'Ha! Two moves in a row!',
  'My needle is well hidden!', 'Did you really find my needle?!', 'A deathless victory! 👑', 'You found my needle… you win.')

# 28 · Mountain Peaks (the whole world has minus numbers)
r('Shaggy the Baby Yak', 'Warm Fur', 'After your first move he warms you with his fur and skips his turn.',
  'My coat is warm even in the mountains! 🐂', 'Warm up! I’ll skip a turn.', 'Stomping to the goal!', 'You climb faster!', 'A shaggy win!', 'I’ll go munch some grass…')
r('Plumpy the Marmot', 'Hibernation', 'When he is “Very hot” or closer, he falls asleep and skips his turn. Once per round.',
  'I love sleeping! 😴', 'Zzz… Skipping a turn…', 'Oh, I’m awake — close!', 'You won’t let me sleep!', 'I woke up a winner!', 'Back to sleep…')
r('Coil the Bighorn Lamb', 'Headbutt', 'On the second move of the round he headbutts: you freeze and skip a turn.',
  'Look at my horns! 🐏', 'Bonk! Freeze!', 'Leaping over rocks to the goal!', 'Oh, you’re as stubborn as me!', 'A horned win!', 'I bumped into a rock…')
r('Haystack the Pika', 'Mountain Whistle', 'On the fourth move of the round she whistles a hint: which half the number is in.',
  'Eep-eep! I’m drying hay for the winter 🌾', 'Eep-eep! Hint: {k}!', 'Eep! Very hot!', 'You’re at my haystack!', 'Eep-eep — I win!', 'Eep… you win.')
r('Barrel the St. Bernard', 'Rescuer', f'On the fourth move of the round he rushes to help: he gives you a {K}.',
  'I rescue anyone who gets lost! 🛟', 'Woof! Have a “⚡ +1 move”!', 'Sniffing — the goal is close!', 'You found the way yourself!', 'A rescue win!', 'I’ll go rescue others…')
r('Puffball the Chinchilla', 'Fluffy Tail', f'When she is “Warm” or closer, she swishes her fluffy tail and puts out your {K}. Once per round.',
  'I’m the fluffiest! 🐭', 'Whoosh! Your “⚡” went out!', 'Fluff-fluff — close!', 'Oh, you’ve almost found it!', 'A fluffy win!', 'I’ll go roll in the dust…')
r('Sooty the Alpine Chough', 'Shiny Thing', f'With her first move she snatches your shiny {K} for herself.',
  'I love everything shiny! 💍', 'Shiny! The “⚡” is mine!', 'I see the goal shining!', 'Oh, you have sharp eyes!', 'A shiny win!', 'I’ll fly to a cliff…')
r('Climber the Ibex', 'Rockfall', 'When he is “Very hot” or closer, he knocks down rocks: your next move is made for you — a wild throw. Once per round.',
  'Meh-eh! I jump on the steepest cliffs! 🐐', 'Meh-eh! Rockfall — your move went flying!', 'Meh-eh! Almost at the top!', 'Are you climbing my cliff?!', 'Meh-eh! The summit is mine!', 'I slipped… meh-eh.')
r('Keen-Eye the Bearded Vulture', 'View from the Summit', 'When he is “Very hot” or closer, he looks down from the summit and tells you whether the number is even or odd. Once per round.',
  'From up here everything is crystal clear! 🦅', 'From the summit I see: the number is {k}!', 'Circling over the answer!', 'You’ve climbed high!', 'Victory from above!', 'Flying off above the clouds…')
b('The Snow Leopard King', 'Blizzard', 'When you get warmer, he whips up a blizzard: you can’t see your own moves for the rest of the round. Once per round.',
  'View from the Top', 'When he is “Warm” or closer, he looks down from the summit and learns whether the number is more or less than his. He won’t tell you. Once per round.',
  'The mountains are my kingdom! 👑', 'Blizzard! You can’t see a thing!', 'I can see everything from the top!', 'Sneaking up on the goal!', 'Oh, you’re as nimble as a leopard!', 'A royal leap!', 'Back to the mountains…')

# 29 · Robot Factory
r('Bolt the Robot Dog', 'Sniff Sensor', 'On the second move of the round he turns on his sensor and learns whether the number is more or less than that one. He won’t tell you.',
  'Woof-beep! I’m a robot dog! 🐕', 'Beep-beep! My sensor got it!', 'The signal is getting stronger!', 'Error! You’re too close!', 'Victory loaded!', 'My battery died…')
r('Sprocket the Robo-Cat', 'Short Circuit', 'On the second move of the round he sparks: your “⚡ +1 move” burns out.',
  'Meow-beep! I’m the newest cat model 🤖', 'Beep-bzzz! Your “⚡” burned out!', 'Meow-beep! Target is close!', 'Beep! You’re too close!', 'Meow-beep! I win!', 'Beep… overheated.')
r('Buzz the Drone', 'Flyover', 'On the fourth move of the round he flies over the field and tells you: the number is more or less than that one.',
  'I see everything from above! 🚁', 'Bzzz! It’s {k}!', 'Coming in to land!', 'You fly just as well!', 'Landing — a win!', 'My propeller is tired…')
r('Grabby the Robo-Magpie', 'Grabby', 'After your first move she snatches your “⚡ +1 move” — it’s shiny, after all!',
  'Chatter! Everything shiny is mine! ✨', 'Chatter! Your “⚡” goes to my nest!', 'Chatter! The answer is shining!', 'Don’t touch my nest!', 'Chatter! Victory shines!', 'Chatter… you win.')
r('Charge the Android', 'Fully Charged', 'At the start of the round he charges up: a “⚡ +1 move” for himself.',
  'Charge 100%. Starting the game 🔋', 'Charge 100%! A “⚡ +1 move” for me!', 'Calculation correct!', 'Error: opponent nearby!', 'Task complete!', 'Battery empty…')
r('Pincer the Robo-Crab', 'Grab', 'After your second move he grabs you with his claw: you freeze and skip a turn.',
  'Click-click! My claws are made of steel 🦀', 'Click! Grabbed — you skip a turn!', 'Click! Target locked!', 'You’re slipping away!', 'Click-click! I win!', 'My claws let go…')
r('Lens the Robo-Bee', 'Scanner', 'With her third move she scans the field and learns whether the number is even or odd. She won’t tell you.',
  'Bzzz-beep! Scanning! 🐝', 'Beep! Scan complete!', 'Bzz-beep! Target close!', 'Interference! You’re close!', 'Bzzz! I win!', 'My scanner broke…')
r('Clank the Tin Can Robot', 'Clank Swap', 'When she gets warmer — clank! — she swaps “⚡ +1 move” with you: yours go to her, hers go to you. Once per round.',
  'Clank-clank, I’m a robot from a can! 🥫', 'Clank! Let’s swap “⚡”!', 'Rattling to the goal!', 'Oh, you’re louder than me!', 'A tin-can win!', 'I got dented…')
r('Wheely the Unicycle Bot', 'Speed Up', 'On the third move of the round he speeds up on his wheel: his next move is two in a row.',
  'I balance on one wheel! 🛞', 'Vroom! Two moves in a row!', 'Rolling to the goal!', 'Oh, don’t knock me over!', 'A winning turn!', 'I fell over…')
b('The Megabot King', 'Static', 'With his second move he turns on static: you can’t see his moves for the rest of the round.',
  'Recharge', f'When he gets warmer, he recharges: a {K} for himself. Once per round.',
  'I’m the boss of the factory! 👑', 'Shhh! Static!', 'Recharged — a “⚡” for me!', 'My calculation is almost done!', 'Error! You’re too smart!', 'Victory programmed!', 'Rebooting…')

# 30 · Land of Myths
r('Hoof the Centaur Foal', 'Sharp Arrow', 'With his first move he shoots an arrow and learns whether the number is more or less than his. He won’t tell you.',
  'I’m half pony! 🏹', 'Zing! My arrow found out!', 'Taking aim — close!', 'Oh, your aim is better!', 'Bullseye!', 'I missed…')
r('Triple the Three-Headed Puppy', 'Three Heads', 'Every third move of his, the three heads argue — and he moves again right away.',
  'Woof! Woof! Woof! There are three of us! 🐶', 'Three heads — one more move!', 'All three noses smell the goal!', 'Oh, you’re smarter than three heads!', 'A triple win!', 'All three heads are tired…')
r('Peeper the Little Cyclops', 'One Eye', 'When you get warmer, he looks with his one big eye and sees which half the number is in. He won’t tell you. Once per round.',
  'I have only one eye, but what an eye! 👁️', 'I see! I know the half!', 'My eye sees the goal!', 'Oh, you have sharp eyes!', 'A one-eyed win!', 'I blinked…')
r('Wave the Little Mermaid', 'Big Wave', 'If you are “Cold” or farther, she raises a wave: you can’t see her moves for the rest of the round. Once per round.',
  'Shall we swim together? 🧜', 'Splash! The wave hid everything!', 'Swimming to the goal!', 'Oh, you swim like a fish!', 'A sea win!', 'I’ll swim to the deep…')
r('Piper the Faun', 'Magic Pipe', 'After your second move he plays his pipe — you listen so closely that you skip a turn.',
  'Listen to my pipe! 🐐', 'Toot-toot! Skip a turn!', 'The tune leads to the goal!', 'Oh, you didn’t stop to listen!', 'A magical win!', 'My pipe went quiet…')
r('Marvel the Genie', 'Wish', f'You switch on your {K} — the genie grants his own wish: your “⚡” goes to him, and you get no double move. Once per round.',
  'Make a wish! 🧞', 'Wish granted — the “⚡” is mine!', 'A miracle is close!', 'Oh, you’re a wizard yourself!', 'A marvelous win!', 'Back into the lamp…')
r('Fleece the Golden Ram', 'Golden Fleece', f'On the fifth move of the round his fleece sparkles: a {K} for him.',
  'My wool is pure gold! 🐑', 'Sparkle! A “⚡” for me!', 'My fleece glitters — close!', 'Oh, you search like a hero!', 'A golden win!', 'My fleece lost its shine…')
r('Clover the Leprechaun', 'Pot of Gold', f'On the fourth move of the round he hides your {K} in his pot.',
  'Looking for my gold? 💰', 'Hop! The “⚡” goes in my pot!', 'Luck is on my side!', 'Oh, you’re lucky!', 'A lucky win!', 'My luck slipped away…')
r('Ninetails the Kitsune', 'Nine Tails', 'When she is “Warm” or closer, she waves her nine tails: you can’t see your own moves for the rest of the round. Once per round.',
  'I have nine whole tails! 🦊', 'Tail magic! Where are your moves?', 'I sense the goal!', 'Oh, you can’t be fooled!', 'A clever win!', 'Running off to the woods…')
b('The Minotaur King', 'Labyrinth', 'After your second move he leads you into the labyrinth: you only see the last two moves.',
  'Bull Charge', 'With his first move he charges ahead: you freeze and skip a turn.',
  'Welcome to my labyrinth! 👑', 'Labyrinth! What came before?', 'Moo! Freeze!', 'The exit is very close!', 'Oh, you found the thread!', 'A labyrinth win!', 'I got lost myself…')

# 31 · Autumn Forest
r('Cheeky the Chipmunk', 'Sharing Nuts', f'After your third move he shares his stash: a {K} for you and for himself.',
  'My cheeks are full of nuts! 🐿️', 'Sharing! A “⚡ +1 move” for everyone!', 'Found a nut — close!', 'Oh, you gather faster!', 'A nutty win!', 'I’ll go refill my stash…')
r('Knocky the Woodpecker', 'Knock-Knock', 'On the second move of the round he knocks on a trunk and tells you which half the number is in.',
  'Knock-knock! Who’s there? 🪵', 'Knock-knock! The number is {k}!', 'Knocking closer and closer!', 'Oh, you hear every knock!', 'A knockout win!', 'My beak is tired…')
r('Maple the Weasel', 'Rustling Leaves', 'When she gets warmer, she rustles the leaves and tells you: the number is more or less than hers. Once per round.',
  'Rustle-rustle! I’m playing in the leaves 🍁', 'Rustle-rustle! It’s {k}!', 'The leaves whisper: very hot!', 'You found me in the leaves!', 'Rustle-rustle — I win!', 'The leaves blew away…')
r('Silky the Pine Marten', 'Nimble Paws', f'On the third move of the round she nimbly snatches your {K} for herself.',
  'Look at my fur coat! 🧣', 'Snatch! The “⚡” is mine!', 'Sneaking up on the goal!', 'Oh, you’re nimble!', 'A furry-pawed win!', 'I’ll run up a tree…')
r('Snuffle the Boar Piglet', 'Digging', 'With his third move he burrows into the leaves and skips his turn.',
  'Oink! I’ll find acorns under the leaves! 🐗', 'Digging… I’ll skip a turn.', 'Oink! I smell the goal!', 'Oh, you dig faster!', 'An oinking win!', 'I’ll burrow into the leaves…')
r('Chatter the Jay', 'Chattering', 'She chatters nonstop — you can’t see your second move.',
  'Krr-krr! I’ll tell the whole forest! 🪶', 'Krr-krr! Where did your move go?', 'Krr — close!', 'Oh, you don’t get distracted!', 'A chattering win!', 'I’ll go chatter in another forest…')
r('Grumble the Capercaillie', 'Grumpy Advice', 'If you are “Cold” or farther, he grumbles and tells you which half the number is in. Once per round.',
  'Grumble-grumble… well, hello 🍂', 'Grumble… fine, here’s a hint: {k}.', 'Grumble! I’m close!', 'Grumble… you sneaked up!', 'Grumble — I win!', 'Grumble… oh well.')
r('Whiff the Skunk', 'Phew!', 'With his third move — phew! You hold your nose and skip a turn.',
  'I’m cute — just don’t scare me! 🦨', 'Phew! Skip a turn!', 'Oh, close!', 'Oh, don’t scare me!', 'A fragrant win!', 'Running away…')
r('Dangle the Opossum', 'Playing Dead', 'When he is “Burning”, he pretends to be asleep and skips his turn. Once per round.',
  'I love hanging upside down! 💤', 'I’m asleep… skipping a turn.', 'Oh, I woke up — close!', 'You woke me up!', 'A dangling win!', 'I’ll pretend to be asleep…')
b('The Moose King', 'Trumpet Call', 'On the third move of the round he trumpets through the forest: you freeze and skip a turn.',
  'Forest Wisdom', 'When he is “Warm” or closer, he listens to the forest and learns which half the number is in. He won’t tell you. Once per round.',
  'I’m the king of the autumn forest! 👑', 'Toot-toooo! Freeze!', 'The forest told me — I know the half!', 'The forest whispers — close!', 'Oh, you know the forest better than me!', 'A win under falling leaves!', 'Into the thicket…')

# 32 · Valley of the Pyramids
r('Papyrus the Ibis', 'Papyrus', 'When he is “Very hot” or closer, he checks his papyrus and tells you which half the number is in. Once per round.',
  'I write everything down on papyrus 📜', 'The papyrus says: {k}.', 'The hieroglyphs lead to the answer!', 'Are you reading my papyri?!', 'Noted: victory!', 'Noted: you win.')
r('Roller the Scarab', 'Rolling Ball', 'When you are “Very hot” or closer, he rolls his ball at you: your next move is made for you — a wild throw. Once per round.',
  'I roll the sun across the sky! ☀️', 'Off it rolls! Your move goes anywhere!', 'Rolling straight to the answer!', 'Are you taking my ball?!', 'I rolled to victory!', 'My ball rolled away…')
r('Bastet the Cat', 'Blessing', 'With her first move she blesses you: a “⚡ +1 move” for you.',
  'Purr… I’m the guardian of the home 🐈‍⬛', 'I bless you — a “⚡ +1 move”!', 'Purr! Luck is with me!', 'Purr… you’re clever!', 'Purr-purr — I win!', 'Purr… you win.')
r('Anubis the Jackal Pup', 'The Scales', 'On the fourth move of the round he weighs everything on his scales: he swaps “⚡ +1 move” with you — yours go to him, his go to you.',
  'Awoo! I guard the pyramids 🐺', 'The scales tipped — we swap “⚡”!', 'Awoo! I smell the answer!', 'You sneaked into the pyramid!', 'Awoo! I win!', 'The scales didn’t favor me…')
r('Horus the Falcon', 'Eye of Horus', 'On the fifth move of the round he looks with the Eye of Horus and tells you: the number is more or less than that one.',
  'My eye sees everything! 🦅', 'The Eye of Horus sees: it’s {k}!', 'The Eye is never wrong!', 'You’re as sharp-eyed as a falcon!', 'Victory under the sun!', 'The Eye has closed…')
r('Taweret the Hippo', 'Butterfingers', 'After your third move she flops into the Nile and loses her own “⚡ +1 move”.',
  'Splash! I’m the giant of the river 🦛', 'Splash! I dropped my “⚡” in the water!', 'Splash-splash, very hot!', 'Are you swimming towards me?!', 'Splash! I win!', 'Splash… you win.')
r('Sobek the Little Crocodile', 'Underwater', 'With his first move he dives: you can’t see that move.',
  'Blub… I’m here, in the Nile 🐊', 'Blub! My first move is underwater!', 'Swimming up to the answer!', 'Can you see me underwater?!', 'Snap! I win!', 'Swimming away…')
r('Snatch the Mongoose', 'Quick Grab', 'On the sixth move of the round he grabs some prey: a “⚡ +1 move” for himself.',
  'I’m quick and brave! 🦡', 'Grab! A “⚡ +1 move” for me!', 'I smell prey!', 'Are you faster than me?!', 'Grab — I win!', 'It got away…')
r('Bennu the Heron', 'Sun Sign', 'When you get colder, she looks at the sun and learns whether the number is even or odd. She won’t tell you. Once per round.',
  'I greet every sunrise 🌅', 'The sun revealed the secret to me!', 'The sun shows the way!', 'You’re following the sun!', 'A sunrise victory!', 'The sun has set…')
b('Ra the Sun King', 'Sunstroke', 'On the second move of the round he blazes with sunlight: your next move is made for you — a wild throw.',
  'Radiance', 'When he is “Burning”, he shines even brighter: a “⚡ +1 move” for himself. Once per round.',
  'I am the sun above the pyramids! 👑', 'Scorching sun! Your move goes anywhere!', 'Radiance! A “⚡ +1 move” for me!',
  'The sun is at its height!', 'You’re not afraid of the heat?!', 'A sunny victory! 👑', 'The sun is setting… you win.')

# 33 · Atlantis (the whole world has minus numbers)
r('Whistle the Dolphin', 'Whistle Hint', 'After your third move he whistles and tells you: the number is more or less than yours.',
  'Whee-whee! Shall we play in the waves? 🐬', 'Whee-oo! It’s {k}!', 'Swimming to the goal!', 'Oh, you swim like a dolphin!', 'A dolphin win!', 'I’ll dive deeper…')
r('Sail the Manta Ray', 'Wing Sails', 'On the fifth move of the round she covers that move with her wings: you can’t see it.',
  'I glide under the water! ⛵', 'Flap! The move is under my wing!', 'Gliding to the goal!', 'Oh, you swim faster!', 'A gliding win!', 'I’ll swim far away…')
r('Poof the Pufferfish', 'Puffed Up', 'When she is “Warm” or closer, she puffs up into a ball: you freeze and skip a turn. Once per round.',
  'Don’t worry, my spikes are soft! 🐡', 'Poof! Freeze!', 'Puffed up with joy — close!', 'Oh, I’m about to deflate!', 'A spiky win!', 'I deflated…')
r('Whisper the Seashell', 'Whisper of the Sea', 'After your second move she whispers to you whether the number is even or odd.',
  'Hold me to your ear! 🐚', 'Listen to the sea: the number is {k}!', 'The sea whispers — close!', 'Oh, you can hear the sea!', 'A pearly win!', 'I’ll close up…')
r('Inky the Cuttlefish', 'Ink', 'With her third move she squirts ink: you can’t see her moves for the rest of the round.',
  'I can change color! 🦑', 'Pfft! Ink!', 'Sneaking up on the goal!', 'Oh, you spotted me!', 'An inky win!', 'I’ll swim into the shadows…')
r('Swirly the Nautilus', 'Spiral', 'When he gets warmer, he curls into a spiral and learns whether the number is more or less than his. He won’t tell you. Once per round.',
  'My ancestors swam with the dinosaurs! 🌀', 'Curled up — I know!', 'Spinning to the goal!', 'Oh, you’re as wise as the sea!', 'An ancient win!', 'I’ll hide in my shell…')
r('Hush the Manatee', 'Doze', 'On the fourth move of the round he dozes off and skips his turn.',
  'I’m the calmest one in the sea! 🦭', 'Dozing… skipping a turn.', 'Oh, I’m awake — close!', 'Oh, you’re so quick!', 'A quiet win!', 'I’ll go munch some seaweed…')
r('Coral the Parrotfish', 'Chomp!', f'With her second move she takes a bite: your {K} goes to her.',
  'I nibble on coral! 🐠', 'Chomp! The “⚡” is mine!', 'The goal is right in front of me!', 'Oh, you’re a quick fish!', 'A coral win!', 'I’ll hide in the coral…')
r('Rapier the Swordfish', 'Lunge', 'When you are “Very hot” or closer, she lunges and learns whether the number is more or less than yours. She won’t tell you. Once per round.',
  'I guard Atlantis! 🗡️', 'Lunge! I know!', 'Right on target!', 'Oh, you fence better!', 'A touché win!', 'My sword got blunt…')
b('King Neptune', 'Deep Sea', 'When you get warmer, he covers you with a wave: you only see the last two moves. Once per round.',
  'High Tide', 'When he is “Warm” or closer, he raises the tide: you skip a turn. Once per round.',
  'I’m the ruler of Atlantis! 👑', 'The deep! What came before?', 'High tide! Skip a turn!', 'My trident senses the goal!', 'Oh, you found Atlantis!', 'A win for the ruler of the seas!', 'Atlantis is sinking…')

# 34 · Dreamland
r('Sweetdream the Baku', 'Dream Eater', 'After your fourth move he eats a dream: you only see the last two moves.',
  'I only eat bad dreams! 🐘', 'Gulp! What came before?', 'I smell a sweet win!', 'Oh, you’re not asleep?!', 'A sweet win!', 'I’ll go take a nap…')
r('Bobber the Sea Otter', 'Asleep on the Waves', 'On the sixth move of the round he falls asleep on the waves and skips his turn.',
  'I sleep on my back holding a pebble 🦦', 'Zzz… rocking on the waves… skipping a turn.', 'The waves carry me to the answer!', 'You’re waking me up!', 'I won — time for bed!', 'I overslept…')
r('Moony the Luna Moth', 'Moonlight', 'On the third move of the round he flies to the moon and learns which half the number is in. He won’t tell you.',
  'I fly towards the moonlight 🌙', 'The moonlight showed me everything…', 'The light guides me!', 'Are you flying to my light?!', 'A moonlit victory!', 'The light went out…')
r('Drowsy the Dormouse', 'Yawning', 'After your first move he yawns so sweetly that you doze off and skip a turn.',
  'Yaaawn… 🥱', 'Yaaawn… Sleep, skip a turn!', 'I see the goal in my dreams!', 'Oh, you’re not yawning!', 'A sleepy win!', 'Back to my dream…')
r('Ole the Dream Keeper', 'Magic Umbrella', 'When you are “Very hot” or closer, he opens his dream umbrella over you: you can’t see your own moves for the rest of the round. Once per round.',
  'I’ll open my umbrella — you’ll dream a fairy tale! ☂️', 'Sweet dreams! Where are your moves?', 'The tale is almost over — close!', 'Oh, you’re not asleep!', 'A fairy-tale win!', 'My umbrella folded…')
r('Flutter the Bat', 'Night Echo', 'When she is “Very hot” or closer, she listens to the echo and learns which half the number is in. She won’t tell you. Once per round.',
  'At night I hear everything! 🦇', 'Squeak! I know the half!', 'I hear the goal!', 'Oh, you fly so quietly!', 'A nighttime win!', 'I’ll hang upside down and sleep…')
r('Nightlight the Tarsier', 'Dream Catcher', 'After your third move he catches your “⚡ +1 move” along with your dream.',
  'My eyes are bigger than the moon! 👀', 'Hop! I caught your “⚡” and your dream!', 'I see the answer in the dark!', 'Aren’t you asleep?!', 'Victory — sweet dreams!', 'I woke up… you win.')
r('Sleepwalker the Penguin Chick', 'Sleepwalking', 'If you are “Cold” or farther, he wanders in his sleep and lets you go: you move again right away. Once per round.',
  'Zzz… I walk in my sleep 🐧', 'Zzz… have another move…', 'Zzz… I’m close…', 'Oh, you woke me up!', 'I won… in my sleep!', 'I woke up a loser…')
r('Bayun the Storyteller Cat', 'Lullaby', f'On the fourth move of the round he purrs a lullaby: {LAVA}.',
  'Let me tell you a story… 🐈', 'Purr… A sleepy wild throw!', 'The story is ending — close!', 'Oh, you won’t fall asleep!', 'A purring win!', 'I’ll go nap by the stove…')
b('The Moon Queen', 'Night', 'With her first move she calls the night: you can’t see her moves for the rest of the round.',
  'Shooting Star', f'When you are “Burning”, she catches a shooting star: a {K} for herself. Once per round.',
  'Good night, little one! 👑', 'Night has fallen!', 'A star fell — a “⚡” for me!', 'The stars tell me — close!', 'Oh, you shine brighter than the stars!', 'A moonlit win!', 'Morning is coming…')

# 35 · Dwarf Forge
r('Hammer the Little Dwarf', 'Hammer Bang', 'With his second move he strikes with his hammer — bang! — you skip a turn.',
  'Tap-tap, I’m forging! 🔨', 'Bang! Skip a turn!', 'Almost forged!', 'Oh, you forge faster!', 'A forged win!', 'My hammer broke…')
r('Flare the Fire Spirit', 'Burnt Out', 'When you get colder, he goes out and it gets dark: you can’t see your own moves for the rest of the round. Once per round.',
  'Fwoosh! I’m the living fire of the forge! 🔥', 'Pff! It’s dark — you can’t see your own moves!', 'I’m flaring up — very hot!', 'You’re fanning my fire!', 'Flames of victory!', 'I’ve gone out…')
r('Clang the Dwarf Smith', 'Ringing Anvil', 'On the third move of the round she strikes the anvil and learns from the ring: the number is more or less than that one. She won’t tell you.',
  'Clang! I’m the best smith under the mountain ⚒️', 'Clang! The ring told me everything!', 'Strike while the iron is hot!', 'You hammer louder than me!', 'Clang! Victory is forged!', 'My hammer slipped…')
r('Hauler the Mole Miner', 'Off It Goes!', 'With his third move he carts your “⚡ +1 move” away.',
  'I dig deeper than anyone! ⛏️', 'Off it goes! Your “⚡” is in my cart!', 'The vein is near!', 'You’re digging right beside me!', 'I mined a victory!', 'Cave-in… you win.')
r('Puff the Troll', 'Forge Smoke', 'When you are “Very hot” or closer, he puffs out smoke: you can’t see his moves for the rest of the round. Once per round.',
  'Puff-puff! I keep the furnace going 💨', 'Puff! Smoke — you can’t see my moves!', 'Puff-puff, very hot!', 'Can you see through the smoke?!', 'Puff! I win!', 'The smoke cleared…')
r('Nugget the Kobold', 'Nose for Gold', 'On the fourth move of the round he sniffs out the gold and learns whether the number is even or odd. He won’t tell you.',
  'Hee-hee! I know where the gold is hidden 🪙', 'Hee-hee! My nose figured it out!', 'The gold is near!', 'Are you looking for my gold?!', 'Hee-hee! A golden victory!', 'The gold slipped away…')
r('Lucky the Prospector Dwarf', 'Prospector’s Luck', 'After your second move he pans out a nugget: a “⚡ +1 move” for himself.',
  'Ha! Today is my lucky day! ✨', 'A nugget! A “⚡ +1 move” for me!', 'I smell a golden vein!', 'You’re panning right next to me!', 'Ha! What luck!', 'Nothing but rocks…')
r('Axe the Dwarf Warrior', 'Battle Cry', 'When he is “Burning”, he lets out a battle cry: you freeze and skip a turn. Once per round.',
  'Ha! I’m the bravest dwarf under the mountain! ⚔️', 'AAARGH! Freeze — you skip a turn!', 'Victory is near!', 'You’re a brave warrior!', 'Hooray! I win!', 'Retreating… you win.')
r('Bruno the Blacksmith Bear', 'Hammer Strike', 'With his first move he strikes with his hammer: bong! — your next move is made for you — a wild throw.',
  'Bong-bong! I forge horseshoes and swords 🔨', 'BONG! Your move went flying!', 'Strike while it’s hot!', 'You hammer as well as I do!', 'Bong! I win!', 'The hammer is heavy… you win.')
b('The Dwarf King', 'Dungeon', 'With his second move he leads you into the dungeon: you only see the last two moves.',
  'Treasury', f'On the second move of the round he carries your {K} off to his treasury.',
  'Welcome to my forge! 👑', 'The dungeon! What came before?', 'To the treasury — the “⚡” is mine!', 'The treasure is almost found!', 'Oh, you found my gold vein!', 'A dwarf king win!', 'Deep into the mountain…')
