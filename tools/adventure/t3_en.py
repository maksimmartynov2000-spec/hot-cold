WORLDS = ['Swamp', 'Music Valley', 'Mountain Peaks', 'Robot Factory', 'Land of Myths',
          'Autumn Forest', 'Magic Kitchen', 'Atlantis', 'Dreamland', 'Dwarf Forge']
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
r('Snappy the Flytrap', 'Snap!', f'If you are “Cold” or farther — snap! — she catches your {K} and keeps it. Once per round.',
  'I catch flies, not kids! 🪤', 'Snap! The “⚡” is mine!', 'I’m about to snap the goal!', 'Oh, you’re quicker than me!', 'Snap — a win!', 'I missed…')
r('Wiggle the Tadpole', 'Wiggly Gift', f'When you get warmer, he wiggles over and gives you a {K}. Once per round.',
  'Soon I’ll be a frog! 🐸', 'Wiggle! Have a “⚡ +1 move”!', 'Swimming to the goal!', 'You swim faster!', 'A wiggly win!', 'Swimming away…')
r('Skimmer the Water Strider', 'Ripples', 'When you get warmer, she skims across the water and the ripples tell you: the number is more or less than yours. Once per round.',
  'I can run on water! 🦟', 'Look at the ripples: it’s {k}!', 'Skimming to the goal!', 'Oh, you’re close already!', 'A slippery win!', 'I slipped…')
r('Splash the Nutria', 'Splash!', f'With her third move she belly-flops into the water — the splash puts out your {K}.',
  'I love diving! 🦫', 'Splash! Your “⚡” went out!', 'Paddling straight to the goal!', 'You swim just as well!', 'A wet win!', 'I’ll go dry off…')
r('Tangle the Swamp Sprite', 'Swamp Spell', f'When you are “Warm” or closer, she muddles your head: {LAVA}. Once per round.',
  'I’m a kind swamp sprite! 🍃', 'A spell! A wild throw!', 'The mud whispers — close!', 'Oh, you can’t be tricked!', 'A swampy win!', 'Back into the mud…')
r('Mossy the Marimo', 'Mossy Gift', f'On the third move of the round she rolls over and gives a {K} to you and to herself.',
  'I’m soft as moss! 🟢', 'Rolled over — a “⚡ +1 move” for everyone!', 'Rolling to the goal!', 'You roll faster!', 'A mossy win!', 'I’ll roll to the bottom…')
r('Snouty the Desman', 'Keen Nose', 'When she gets warmer, she sniffs with her long snout and tells you whether the number is even or odd. Once per round.',
  'My nose smells everything! 👃', 'Sniff-sniff! The number is {k}!', 'I smell the goal!', 'Your nose is as good as mine!', 'My nose was right!', 'My nose is stuffy…')
b('The Water King', 'Quagmire', 'When you get colder, the quagmire holds you: you freeze and skip a turn. Once per round.',
  'Water Lily', f'After your first move he picks a water lily: a {K} for himself.',
  'I’m the king of the whole swamp! 👑', 'Glug-glug! Freeze!', 'A lily — a “⚡” for me!', 'The swamp tells me — close!', 'Oh, you reached my palace!', 'A kingly win!', 'Back to the bottom…')

# 27 · Music Valley
r('Trill the Nightingale', 'Trill Hint', 'When you get colder, he sings a trill and tells you whether the number is even or odd. Once per round.',
  'Listen to my song! 🎶', 'Tweet-tweet! The number is {k}!', 'I sing louder — close!', 'You sing just as well!', 'A winning trill!', 'I lost my voice…')
r('Keys the Grand Piano', 'Chord', 'When he gets warmer, he plays a chord and tells you which half the number is in. Once per round.',
  'I have eighty-eight keys! 🎹', 'Pam-pam! The number is {k}!', 'It sounds closer and closer!', 'You play right on the beat!', 'Applause!', 'My lid is closed…')
r('Strum the Guitar', 'Strumming', f'When she is “Warm” or closer, she strums and takes a {K} for herself. Once per round.',
  'Strum-strum, let’s play! 🎸', 'Twang! A “⚡” for me!', 'My strings ring — close!', 'Oh, you hit the right note!', 'A guitar win!', 'A string snapped…')
r('Jazzy the Saxophone', 'Jazz Solo', 'When he is “Burning”, he plays a solo: his next move is two in a row. Once per round.',
  'A little jazz? 🎷', 'Solo! Two moves in a row!', 'Doo-doo-doo — close!', 'You improvise so well!', 'A jazzy win!', 'A wrong note…')
r('The Cha-Cha Maracas', 'Cha-Cha-Cha', 'Every second move of theirs is lost in the rattle: you can’t see it.',
  'Cha-cha-cha, let’s dance! 🕺', 'Cha-cha! You can’t hear that move!', 'Shaking to the goal!', 'Oh, you dance better!', 'A dancing win!', 'We’re tired…')
r('Chime the Harp', 'Ringing Strings', f'When you are “Very hot” or closer, she rings her strings and gives you a {K}. Once per round.',
  'My strings sing! ✨', 'Ding-ding! A “⚡ +1 move” for you!', 'Ringing closer and closer!', 'Oh, you’re almost there!', 'A ringing win!', 'My strings went quiet…')
r('Sol the Music Note', 'Clear Note', 'With her third move she rings out and tells you: the number is more or less than hers.',
  'Do, re, mi, fa, SOL! 🎵', 'Sooo-ol! It’s {k}!', 'I hit the note!', 'You sing clearly too!', 'A note-perfect win!', 'I sang off-key…')
r('Squeezy the Accordion', 'Open Bellows', f'You switch on your {K} — he stretches his bellows: his next move is two in a row. Once per round.',
  'I’ll stretch my bellows — let’s sing! 🪗', 'Hey-ho! Two moves in a row!', 'Playing closer and closer!', 'You sing along on the beat!', 'A dancing tune win!', 'My bellows are empty…')
r('Echo the Lyrebird', 'Echo', 'After your first move he echoes it and learns whether the number is more or less than yours. He won’t tell you.',
  'I can copy any sound! 🐦', 'Echo-echo… I know!', 'The echo tells me — close!', 'Oh, you mimicked me!', 'An echo of victory!', 'The echo faded…')
b('Maestro Treble Clef', 'Pause', 'On the fifth move of the round he waves his baton: pause! You freeze and skip a turn.',
  'Crescendo', 'When you get warmer, the orchestra plays louder: his next move is two in a row. Once per round.',
  'Orchestra, let’s begin! 👑', 'Pause! Freeze!', 'Crescendo! Two moves in a row!', 'The finale is near!', 'Oh, you’re leading the tune!', 'Bravo, maestro!', 'The concert is over…')

# 28 · Mountain Peaks (the whole world has minus numbers)
r('Shaggy the Baby Yak', 'Warm Fur', 'After your first move he warms you with his fur and skips his turn.',
  'My coat is warm even in the mountains! 🐂', 'Warm up! I’ll skip a turn.', 'Stomping to the goal!', 'You climb faster!', 'A shaggy win!', 'I’ll go munch some grass…')
r('Plumpy the Marmot', 'Hibernation', 'When he is “Very hot” or closer, he falls asleep and skips his turn. Once per round.',
  'I love sleeping! 😴', 'Zzz… Skipping a turn…', 'Oh, I’m awake — close!', 'You won’t let me sleep!', 'I woke up a winner!', 'Back to sleep…')
r('Coil the Bighorn Lamb', 'Headbutt', 'On the second move of the round he headbutts: you freeze and skip a turn.',
  'Look at my horns! 🐏', 'Bonk! Freeze!', 'Leaping over rocks to the goal!', 'Oh, you’re as stubborn as me!', 'A horned win!', 'I bumped into a rock…')
r('Snowflake the Edelweiss', 'Mountain Flower', 'On the fourth move of the round he blooms and tells you which half the number is in.',
  'I grow at the very top! ❄️', 'I bloomed! The number is {k}!', 'Reaching for the sun — close!', 'You climbed so high!', 'A blooming win!', 'I wilted…')
r('Barrel the St. Bernard', 'Rescuer', f'On the fourth move of the round he rushes to help: he gives you a {K}.',
  'I rescue anyone who gets lost! 🛟', 'Woof! Have a “⚡ +1 move”!', 'Sniffing — the goal is close!', 'You found the way yourself!', 'A rescue win!', 'I’ll go rescue others…')
r('Puffball the Chinchilla', 'Fluffy Tail', f'When she is “Warm” or closer, she swishes her fluffy tail and puts out your {K}. Once per round.',
  'I’m the fluffiest! 🐭', 'Whoosh! Your “⚡” went out!', 'Fluff-fluff — close!', 'Oh, you’ve almost found it!', 'A fluffy win!', 'I’ll go roll in the dust…')
r('Sooty the Alpine Chough', 'Shiny Thing', f'With her first move she snatches your shiny {K} for herself.',
  'I love everything shiny! 💍', 'Shiny! The “⚡” is mine!', 'I see the goal shining!', 'Oh, you have sharp eyes!', 'A shiny win!', 'I’ll fly to a cliff…')
r('Rumble the Snowball', 'Avalanche', f'When he is “Very hot” or closer, he rolls into an avalanche: {LAVA}. Once per round.',
  'I’m small, but I can become an avalanche! ⛄', 'Avalanche! A wild throw!', 'Rolling straight to the goal!', 'Oh, I’m about to melt!', 'A snowy win!', 'I melted…')
r('Lift the Cable Car', 'Lookout Ride', 'When she is “Very hot” or closer, she rides higher and tells you from above whether the number is even or odd. Once per round.',
  'I’ll take you to the very top! 🚡', 'From up here: the number is {k}!', 'Arriving at the goal!', 'You go up faster!', 'Summit reached!', 'Stuck on the cable…')
b('The Snow Leopard King', 'Blizzard', 'When you get warmer, he whips up a blizzard: you can’t see your own moves for the rest of the round. Once per round.',
  'View from the Top', 'When he is “Warm” or closer, he looks down from the summit and learns whether the number is more or less than his. He won’t tell you. Once per round.',
  'The mountains are my kingdom! 👑', 'Blizzard! You can’t see a thing!', 'I can see everything from the top!', 'Sneaking up on the goal!', 'Oh, you’re as nimble as a leopard!', 'A royal leap!', 'Back to the mountains…')

# 29 · Robot Factory
r('Bolt the Robot Dog', 'Sniff Sensor', 'On the second move of the round he turns on his sensor and learns whether the number is more or less than that one. He won’t tell you.',
  'Woof-beep! I’m a robot dog! 🐕', 'Beep-beep! My sensor got it!', 'The signal is getting stronger!', 'Error! You’re too close!', 'Victory loaded!', 'My battery died…')
r('Whirr the Robot Vacuum', 'Suction', f'On the second move of the round he sucks up your {K}.',
  'I’ll clean up every crumb! 🧹', 'Whoosh! Your “⚡” is in my bag!', 'Whirring to the goal!', 'Oh, you work cleaner!', 'A clean win!', 'My bag is full…')
r('Buzz the Drone', 'Flyover', 'On the fourth move of the round he flies over the field and tells you: the number is more or less than that one.',
  'I see everything from above! 🚁', 'Bzzz! It’s {k}!', 'Coming in to land!', 'You fly just as well!', 'Landing — a win!', 'My propeller is tired…')
r('Sticky the Magnet', 'Attraction', f'After your first move he pulls your {K} over to himself.',
  'Everything sticks to me! 🧲', 'Clink! The “⚡” stuck to me!', 'I’m drawn to the goal!', 'Oh, you’re magnetic too!', 'An attractive win!', 'I lost my magnetism…')
r('Zap the Battery', 'Fully Charged', f'At the start of the round she charges up: a {K} for herself.',
  'Charged to one hundred percent! 🔋', 'Zap! Charged — a “⚡” for me!', 'The charge is rising — close!', 'Oh, you’re fully charged too!', 'A charged-up win!', 'I ran flat…')
r('Grabby the Robot Arm', 'Grab', 'After your second move she grabs you: you freeze and skip a turn.',
  'Hi! High five! 🦾', 'Grab! Freeze!', 'Reaching for the goal!', 'Oh, you slip right out!', 'An iron grip!', 'My joints are stuck…')
r('Printy the 3D Printer', 'Print', 'With his third move he prints himself a hint: whether the number is even or odd. He won’t tell you.',
  'I can print anything! 🖨️', 'Brrr-brrr… I know if it’s even!', 'Printing the answer!', 'Oh, I’m running out of paper!', 'I printed a win!', 'Out of ink…')
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
r('Crimson the Maple Leaf', 'Falling Leaf', 'When he gets warmer, he falls and tells you: the number is more or less than his. Once per round.',
  'I’m the reddest in the forest! 🍁', 'Rustle! It’s {k}!', 'The wind carries me to the goal!', 'Oh, you spin faster!', 'A leaf-fall win!', 'I’ll fly away with the wind…')
r('Silky the Pine Marten', 'Nimble Paws', f'On the third move of the round she nimbly snatches your {K} for herself.',
  'Look at my fur coat! 🧣', 'Snatch! The “⚡” is mine!', 'Sneaking up on the goal!', 'Oh, you’re nimble!', 'A furry-pawed win!', 'I’ll run up a tree…')
r('Snuffle the Boar Piglet', 'Digging', 'With his third move he burrows into the leaves and skips his turn.',
  'Oink! I’ll find acorns under the leaves! 🐗', 'Digging… I’ll skip a turn.', 'Oink! I smell the goal!', 'Oh, you dig faster!', 'An oinking win!', 'I’ll burrow into the leaves…')
r('Chatter the Jay', 'Chattering', 'She chatters nonstop — you can’t see your second move.',
  'Krr-krr! I’ll tell the whole forest! 🪶', 'Krr-krr! Where did your move go?', 'Krr — close!', 'Oh, you don’t get distracted!', 'A chattering win!', 'I’ll go chatter in another forest…')
r('Shiny the Chestnut', 'Rolling Out', 'If you are “Cold” or farther, he rolls out of his spiky shell and tells you which half the number is in. Once per round.',
  'I’m as shiny as polish! 🌰', 'Bump! The number is {k}!', 'Rolling to the goal!', 'Oh, you found me!', 'A chestnut win!', 'I’ll hide in my spikes…')
r('Whiff the Skunk', 'Phew!', 'With his third move — phew! You hold your nose and skip a turn.',
  'I’m cute — just don’t scare me! 🦨', 'Phew! Skip a turn!', 'Oh, close!', 'Oh, don’t scare me!', 'A fragrant win!', 'Running away…')
r('Dangle the Opossum', 'Playing Dead', 'When he is “Burning”, he pretends to be asleep and skips his turn. Once per round.',
  'I love hanging upside down! 💤', 'I’m asleep… skipping a turn.', 'Oh, I woke up — close!', 'You woke me up!', 'A dangling win!', 'I’ll pretend to be asleep…')
b('The Moose King', 'Trumpet Call', 'On the third move of the round he trumpets through the forest: you freeze and skip a turn.',
  'Forest Wisdom', 'When he is “Warm” or closer, he listens to the forest and learns which half the number is in. He won’t tell you. Once per round.',
  'I’m the king of the autumn forest! 👑', 'Toot-toooo! Freeze!', 'The forest told me — I know the half!', 'The forest whispers — close!', 'Oh, you know the forest better than me!', 'A win under falling leaves!', 'Into the thicket…')

# 32 · Magic Kitchen
r('Steamy the Teapot', 'Whistle', 'When he is “Very hot” or closer, he whistles and tells you which half the number is in. Once per round.',
  'Fancy some tea? 🫖', 'Wheee! The number is {k}!', 'I’m boiling — close!', 'Oh, you’re hotter than me!', 'A boiling win!', 'I cooled down…')
r('Sizzle the Frying Pan', 'Sizzling', f'When you are “Very hot” or closer, she sizzles and spatters: {LAVA}. Once per round.',
  'I’ll fry you an egg! 🍳', 'Sizzle-sizzle! A wild throw!', 'Heating up — close!', 'Oh, hot-hot-hot!', 'A sizzling win!', 'I got burnt…')
r('Butter the Pancake', 'First Pancake', f'The first pancake is yours: with his first move he gives you a {K}.',
  'My first pancake is a perfect one! 🥞', 'Have a “⚡ +1 move” — with butter!', 'Getting golden — close!', 'Oh, you bake faster!', 'A buttery win!', 'I came out lumpy…')
r('Whippy the Whisk', 'Whip It All!', 'Every fourth move of the round he tries to whip everything up: he swaps “⚡ +1 move” with you — yours go to him, his go to you. Once per round.',
  'I’ll whip it all into foam! 🥄', 'Whisk-whisk! Let’s swap “⚡”!', 'Whisking — close!', 'Oh, everything works for you!', 'A fluffy win!', 'The foam fell flat…')
r('Toasty the Toaster', 'Toast Is Ready', 'On the fifth move of the round a slice of toast pops up and tells you: the number is more or less than that one.',
  'Ding! The toast is ready! 🍞', 'Ding! It’s {k}!', 'Toasting — close!', 'Oh, you’re as hot as toast!', 'A crunchy win!', 'I got burnt…')
r('Pinch the Salt Shaker', 'Spilled', f'After your third move she spills salt and loses her own {K}.',
  'A pinch of salt makes it tasty! 🧂', 'Oops, I spilled my “⚡”!', 'Salty — close!', 'Oh, you didn’t add too much salt!', 'A salty win!', 'I spilled everywhere…')
r('Yolky the Egg', 'In the Shell', 'With his first move he hides in his shell: you can’t see that move.',
  'Tap-tap, I’m an egg! 🥚', 'Hidden in my shell!', 'I’m about to hatch — close!', 'Oh, don’t crack me!', 'A hard-boiled win!', 'I cracked…')
r('Curly the Broccoli', 'Growing', f'On the sixth move of the round he grows a bit: a {K} for himself.',
  'Eat your veggies and you’ll be strong! 🥦', 'I grew — a “⚡” for me!', 'Reaching for the goal!', 'Oh, you’re strong — do you eat veggies?', 'A healthy win!', 'I turned yellow…')
r('Dumpy the Dumpling', 'Pinching', 'When you get colder, he pinches his edges and learns whether the number is even or odd. He won’t tell you. Once per round.',
  'I have the tastiest filling! 🥟', 'Pinched — I know if it’s even!', 'Boiling — close!', 'Oh, you found me!', 'A piping-hot win!', 'I got overcooked…')
b('The Stove Queen', 'Oven Heat', f'On the second move of the round she breathes out heat: {LAVA}.',
  'Little Pie', f'When she is “Burning”, she bakes a little pie: a {K} for herself. Once per round.',
  'Sit down, have some pies! 👑', 'Heat! A wild throw!', 'A pie — a “⚡” for me!', 'The pies are almost ready!', 'Oh, you bake better than me!', 'A golden-brown win!', 'The fire went out…')

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
r('Cushy the Pillow', 'Soft Pillow', 'On the sixth move of the round she falls asleep herself — she skips her turn.',
  'Give me a hug! 🛏️', 'Yawn… skipping a turn.', 'Oh, I’m not sleepy — close!', 'Oh, you’re wide awake!', 'A soft win!', 'Sleeping…')
r('Glow the Night-Light', 'Night Light', 'On the third move of the round he shines in the dark and sees which half the number is in. He won’t tell you.',
  'Don’t be afraid of the dark — I’m here! 🌙', 'I lit it up — I know the half!', 'My light gets closer to the goal!', 'Oh, can you see in the dark?', 'A bright win!', 'I switched off…')
r('Drowsy the Dormouse', 'Yawning', 'After your first move he yawns so sweetly that you doze off and skip a turn.',
  'Yaaawn… 🥱', 'Yaaawn… Sleep, skip a turn!', 'I see the goal in my dreams!', 'Oh, you’re not yawning!', 'A sleepy win!', 'Back to my dream…')
r('Ole the Dream Keeper', 'Magic Umbrella', 'When you are “Very hot” or closer, he opens his dream umbrella over you: you can’t see your own moves for the rest of the round. Once per round.',
  'I’ll open my umbrella — you’ll dream a fairy tale! ☂️', 'Sweet dreams! Where are your moves?', 'The tale is almost over — close!', 'Oh, you’re not asleep!', 'A fairy-tale win!', 'My umbrella folded…')
r('Flutter the Bat', 'Night Echo', 'When she is “Very hot” or closer, she listens to the echo and learns which half the number is in. She won’t tell you. Once per round.',
  'At night I hear everything! 🦇', 'Squeak! I know the half!', 'I hear the goal!', 'Oh, you fly so quietly!', 'A nighttime win!', 'I’ll hang upside down and sleep…')
r('Webby the Dreamcatcher', 'Catching Dreams', f'After your third move he catches your {K} in his web.',
  'I catch bad dreams! 🕸️', 'Caught the “⚡”! Now it’s mine!', 'The dream is almost caught!', 'Oh, you slipped through!', 'A caught win!', 'My web broke…')
r('Shuffle the Slipper', 'Warm Slippers', 'If you are “Cold” or farther, he warms your feet: you move again right away. Once per round.',
  'Shuffle-shuffle, I’m a slipper! 🥿', 'Shuffle! Have another go!', 'Shuffling to the goal!', 'Oh, you shuffle faster!', 'A slipper win!', 'Lost under the bed…')
r('Bayun the Storyteller Cat', 'Lullaby', f'On the fourth move of the round he purrs a lullaby: {LAVA}.',
  'Let me tell you a story… 🐈', 'Purr… A sleepy wild throw!', 'The story is ending — close!', 'Oh, you won’t fall asleep!', 'A purring win!', 'I’ll go nap by the stove…')
b('The Moon Queen', 'Night', 'With her first move she calls the night: you can’t see her moves for the rest of the round.',
  'Shooting Star', f'When you are “Burning”, she catches a shooting star: a {K} for herself. Once per round.',
  'Good night, little one! 👑', 'Night has fallen!', 'A star fell — a “⚡” for me!', 'The stars tell me — close!', 'Oh, you shine brighter than the stars!', 'A moonlit win!', 'Morning is coming…')

# 35 · Dwarf Forge
r('Hammer the Little Dwarf', 'Hammer Bang', 'With his second move he strikes with his hammer — bang! — you skip a turn.',
  'Tap-tap, I’m forging! 🔨', 'Bang! Skip a turn!', 'Almost forged!', 'Oh, you forge faster!', 'A forged win!', 'My hammer broke…')
r('Blaze the Torch', 'Out!', 'When you get colder, the torch goes out: you can’t see your own moves for the rest of the round. Once per round.',
  'I’ll light the way into the mine! 🔥', 'Pff! It’s dark — where are your moves?', 'Flaring up — close!', 'Oh, you’re brighter than me!', 'A blazing win!', 'I’m burning out…')
r('Clang the Anvil', 'Clang', 'On the third move of the round she rings out and learns whether the number is more or less than that one. She won’t tell you.',
  'Clang-clang, they hammer on me! ⚒️', 'Clang! I know!', 'Ringing louder and louder!', 'Oh, you’re tougher than iron!', 'An iron win!', 'I cooled down…')
r('Rattle the Mine Cart', 'Off I Go!', f'With her third move she carts your {K} away for herself.',
  'I’m carrying gems! 🛒', 'Clickety-clack — the “⚡” is mine!', 'Riding straight to the goal!', 'Oh, you’re overtaking me!', 'A breezy win!', 'I came off the rails…')
r('The Huff-Puff Bellows', 'Smoke', 'When you are “Very hot” or closer, they blow up smoke: you can’t see their moves for the rest of the round. Once per round.',
  'Huff-puff, let’s fan the fire! 💨', 'Puff! All smoke!', 'Puffing to the goal!', 'Oh, you’re hotter than fire!', 'A huffing win!', 'We’re out of air…')
r('Glint the Gold Nugget', 'Golden Glint', 'On the fourth move of the round he glints and learns whether the number is even or odd. He won’t tell you.',
  'I’m pure gold! 🪙', 'Glint — I know if it’s even!', 'Shining brighter and brighter!', 'Oh, you struck gold!', 'A nugget win!', 'I lost my shine…')
r('Lucky the Horseshoe', 'For Luck', f'After your second move she brings herself luck: a {K} for her.',
  'I bring good luck! 🍀', 'For luck — a “⚡” for me!', 'Luck is near!', 'Oh, you’re lucky too!', 'The horseshoe came through!', 'My luck ran out…')
r('Valor the Viking Helmet', 'Battle Cry', 'When he is “Burning”, he lets out a battle cry: you freeze and skip a turn. Once per round.',
  'I’m as tough as a rock! ⛑️', 'Oh-ho-ho! Freeze!', 'Into battle — the goal is close!', 'Oh, you’re brave!', 'A Viking win!', 'I got dented…')
r('Bong the Bell', 'Bong!', f'With his first move he rings — bong! — {LAVA}.',
  'Bong-bong, I’m ringing! 🔔', 'BONG! A wild throw!', 'Ringing in the win!', 'Oh, you ring louder than me!', 'A bell-ringing win!', 'I went quiet…')
b('The Dwarf King', 'Dungeon', 'With his second move he leads you into the dungeon: you only see the last two moves.',
  'Treasury', f'On the second move of the round he carries your {K} off to his treasury.',
  'Welcome to my forge! 👑', 'The dungeon! What came before?', 'To the treasury — the “⚡” is mine!', 'The treasure is almost found!', 'Oh, you found my gold vein!', 'A dwarf king win!', 'Deep into the mountain…')
