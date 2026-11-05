WORLDS = ['New Zealand', 'Amazonia', 'School of Magic', 'Superhero City', 'Throne of Time']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '“⚡ +1 move”'
LAVA = 'your next move is made for you: a wild throw'

# 46 · New Zealand
r('Bundle the Kiwi', 'Sensitive Beak', 'When you are “Very hot” or closer, he sniffs the ground with the tip of his beak and tells you which half the number is in. Once per round.',
  'My nostrils are at the tip of my beak! 🥝', 'Sniff, sniff! Hint: the number is {k}!', 'I can smell the answer under the leaves!', 'You found my path!', 'A kiwi win!', 'Off into the night forest…')
r('Rascal the Kea', 'Prank', f'With his second move he swipes your {K}: it’s his now.',
  'Hee-hee! I’m the cheekiest parrot in the mountains! 🦜', 'Grab! Your “⚡” is mine now!', 'Causing mischief right by the answer!', 'You caught me?!', 'A rascally win!', 'Flying off to the mountain…')
r('Cuddles the Kakapo', 'Cuddles', f'If you are “Very cold”, he gives you a hug: a {K} for you and for himself. Once per round.',
  'I can’t fly — but I give great hugs! 🤗', 'Hugs! A “⚡ +1 move” for each of us!', 'Waddling to the answer!', 'You’re catching up!', 'A warm win!', 'Off to hug a tree…')
r('Marsh the Pukeko', 'Peeking', 'When you get warmer, he peeks and learns whether the number is even or odd. He won’t tell you. Once per round.',
  'My feathers are as blue as the sea! 🐦', 'I peeked… now I know more.', 'Hopping over the tussocks to the answer!', 'Are you peeking too?!', 'A marshy win!', 'Hiding in the reeds…')
r('Bulky the Weta', 'Under the Log', 'When she is “Cold” or farther, she hides under a log and skips her turn. Once per round.',
  'I’m big, but very kind! 🦗', 'Under the log… skipping a turn.', 'Crawling to the answer!', 'You weren’t scared of me?!', 'A giant win!', 'Crawling under my log…')
r('Indigo the Takahe', 'Juicy Grass', f'After your third move he nibbles juicy grass — and takes a {K} for himself.',
  'Everyone thought I was extinct, but here I am! 🌾', 'Nibble, nibble! A “⚡ +1 move” for me!', 'Walking through the grass to the answer!', 'You found my meadow!', 'A blue win!', 'Off to nibble some grass…')
r('Mimic the Tui', 'Copycat Song', 'After your second move he sings your move back and tells you: the number is more or less than yours.',
  'I sing with two voices at once! 🎶', 'I sing: the number is {k}!', 'The song leads to the answer!', 'Are you copying me?!', 'A song of victory!', 'My voice cracked…')
r('Beachy the Fur Seal', 'Sunbathing', 'At the start of the round he’s sunbathing on a rock and skips his first turn.',
  'Sun, rocks, sea — what else do you need? 🏖️', 'Sunbathing… skipping a turn.', 'Swimming up to the answer!', 'Sunbathing next to me?!', 'A beach win!', 'Off for a swim…')
r('Swish the Fantail', 'Flit', 'After your third move she flits up and blocks your move: you can’t see it.',
  'Flit, flit! My tail is a fan! 🍃', 'Flit! You can’t see your move!', 'Flitting around the answer!', 'You can’t keep up with me!', 'A fluttering win!', 'Flitted away…')
b('The Great Tuatara', 'Third Eye', 'Right from the start of the round he sees with his third eye whether the number is even or odd. He won’t tell you.',
  'Ancient Advice', 'When he is “Cold” or farther, he gives you advice: the number is more or less than his. Once per round.',
  'I’m older than the dinosaurs! 👑', 'The third eye sees: I know more.', 'Ancient advice: the number is {k}!',
  'Time leads me to the answer!', 'You’re as wise as an ancient reptile!', 'An ancient win! 👑', 'I give you these islands…')

# 47 · Amazonia
r('Volt the Electric Eel', 'Shock', f'If you are “Very cold”, he gives you a shock: your {K} burns out. Once per round.',
  'Bzzz! I’m a living battery! 🔌', 'Bzzz! Your “⚡” burned out!', 'Sparking with joy!', 'You’re not afraid of electricity?!', 'A charged win!', 'My battery’s flat…')
r('Rosy the River Dolphin', 'River Echo', 'When she is “Burning”, she listens to the river’s echo and learns which half the number is in. She won’t tell you. Once per round.',
  'I’m a pink river dolphin! 🐬', 'The echo answered… I know more.', 'Swimming straight to the answer!', 'You swim like a dolphin!', 'A pink win!', 'Swimming off downstream…')
r('Clack the Piranha', 'Clack', f'When she gets colder, she clacks her little teeth: your {K} is gone. Once per round.',
  'I’m a smiling piranha, honest! 🐟', 'Clack! Your “⚡” is gone!', 'Swimming to the answer with my school!', 'You’re not scared of me?!', 'Clack — I win!', 'Swam off into the weeds…')
r('Punk the Hoatzin', 'Jungle Smell', 'When he is “Very hot” or closer, he smells so strong that your head spins: for the rest of the round you only see the last two moves. Once per round.',
  'I’m the strangest bird in the Amazon! 😵', 'Phew! You only remember two moves!', 'My crest is trembling — close!', 'Are you holding your nose?!', 'A punk win!', 'All ruffled up…')
r('Turquoise the Dart Frog', 'Bright Colors', 'With his second move he flashes his bright colors: you can’t see your own moves for the rest of the round.',
  'I’m tiny, but very bright! 🐸', 'Flash! You can’t see your own moves!', 'Hopping to the answer!', 'Didn’t that dazzle you?!', 'A bright win!', 'Hiding under a leaf…')
r('Glare the Harpy Eagle', 'Harpy’s Glare', 'When she is “Very cold”, she stares at you so hard that you freeze and skip a turn. Once per round.',
  'My eyes see everything in the jungle! 🦅', 'Freeze! Skip a turn!', 'I see the answer from the treetops!', 'You stood up to my glare?!', 'A win from above!', 'Off to the kapok tree…')
r('Mustache the Tamarin', 'Mischief', 'After your second move he swaps “⚡ +1 move” with you: yours go to him, his go to you.',
  'See my mustache? An emperor’s! 🔀', 'Let’s swap “⚡”! Hee-hee!', 'My mustache smells the answer!', 'You’re slyer than me?!', 'A mustached win!', 'Off through the branches…')
r('Nutty the Agouti', 'Nut for a Rainy Day', f'After your fourth move he digs up a hidden nut — and takes a {K} for himself.',
  'I plant trees by hiding nuts! 🌰', 'Found a nut! A “⚡ +1 move” for me!', 'Running to the answer!', 'You found my stash?!', 'A nutty win!', 'I lost my nut…')
r('Azure the Morpho', 'Blue Shimmer', 'When she gets warmer, her wings shimmer: you can’t see her moves for the rest of the round. Once per round.',
  'My wings shine like the sky! 🦋', 'Shimmer! You can’t see my moves!', 'Fluttering to the answer!', 'Can you see through the shimmer?!', 'A blue win!', 'Flying away…')
b('The Anaconda Queen', 'Coils', 'After your third move she wraps you in her coils: you freeze and skip a turn.',
  'Jungle Tribute', f'At the start of the round she takes your {K} for herself.',
  'I’m the queen of the great river! 👑', 'Wrapped up! Freeze — skip a turn!', 'Tribute — your “⚡” is mine!',
  'The answer is already in my coils!', 'You slipped away nicely!', 'The queen wins! 👑', 'Swimming off into the deep…')

# 48 · School of Magic
r('Hoot the Owlet', 'Letter', 'After your fourth move he brings a letter: which half the number is in.',
  'Hoo! Mail for the students! ✉️', 'The letter says: the number is {k}!', 'The letter flies to the answer!', 'You read my letter?!', 'Letter delivered — I win!', 'The letter got lost…')
r('Bubble the Toad', 'Potion', f'After your fourth move the potion splashes: {LAVA}.',
  'Croak! I brew potions! 🧪', 'Splash! Your move flew anywhere!', 'The potion is almost ready!', 'Do you brew potions too?!', 'A magical win!', 'The potion boiled away…')
r('Rune the Apprentice Witch', 'Spell', 'After your third move she casts a spell and learns which half the number is in. She won’t tell you.',
  'I’m the best student in school! 🪄', 'The spell worked… I know more.', 'Magic leads to the answer!', 'Do you cast spells too?!', 'Top of the class wins!', 'The spell fizzled…')
r('Scroll the Apprentice Wizard', 'Scroll', 'With his fourth move he reads a scroll aloud: whether the number is even or odd.',
  'I’ve read every scroll in the library! 📜', 'The scroll says: the number is {k}!', 'The scroll leads to the answer!', 'Are you reading my scroll?!', 'A scholarly win!', 'The scroll rolled up…')
r('Mystic the Cat', 'Shadows', 'When he is “Cold” or farther, he hides his move in the shadows: you can’t see it. Once per round.',
  'Purr… I’m a wizard’s cat 🐈', 'Purr! This move is in the shadows!', 'Purring by the answer!', 'Can you see in the shadows?!', 'A purr-fect win!', 'Gone into the shadows…')
r('Hurricane the Hippogriff', 'Wingbeat', 'With his third move he beats his wings: his next move is two in a row.',
  'Half eagle, half horse! 🌪️', 'Wingbeat! Two moves in a row!', 'Flying to the answer!', 'Are you flying with me?!', 'A hurricane win!', 'Folding my wings…')
r('Mischief the Pixie', 'Prank', 'On the third move of the round she plays a prank: she swaps “⚡ +1 move” with you — yours to her, hers to you.',
  'Hee-hee! I love pranks! 🔀', 'Prank! We swapped “⚡”!', 'Pranking right by the answer!', 'You caught me?!', 'A mischievous win!', 'Fluttered away…')
r('Abracadabra the Rabbit', 'Abracadabra', 'On the second move of the round — abracadabra: whoever just moved moves again.',
  'Abracadabra! Here I am! 🎩', 'Abracadabra! Another move!', 'The trick almost worked!', 'You figured out my trick?!', 'A magic win!', 'Poof — gone…')
r('Herbie the Hedgehog', 'Herbal Tea', 'After every second move of yours he sips his herbal tea: a “⚡ +1 move” for him.',
  'I gather magic herbs! 🍵', 'Tea time! A “⚡ +1 move” for me!', 'The herbs lead to the answer!', 'You know your herbs?!', 'A healing win!', 'The tea went cold…')
b('Archmage Greybeard', 'Enchantment', 'If you are “Cold” or farther, he casts a spell: you can’t see your own moves for the rest of the round. Once per round.',
  'Star Knowledge', 'With his first move he reads the stars and learns whether the number is divisible by 3. He won’t tell you.',
  'Welcome to the School of Magic! 👑', 'Enchanted! You can’t see your own moves!', 'The stars told me more…',
  'Magic leads me to the answer!', 'You’re a powerful wizard!', 'The archmage wins! 👑', 'I tip my hat — you win…')

# 49 · Superhero City
r('Stoop the Peregrine Falcon', 'Power Dive', 'Every fourth move of his he dives: his next move is two in a row.',
  'I’m the fastest bird on the planet! 💨', 'Power dive! Two moves in a row!', 'Diving at the answer!', 'You’re faster than me?!', 'A super-speed win!', 'Pulled out of the dive…')
r('Titan the Hercules Beetle', 'Boulder', 'With his second move he lifts a boulder: you freeze and skip a turn.',
  'I can lift a hundred times my own weight! 🪨', 'Boulder! Freeze — skip a turn!', 'Strength leads to the answer!', 'You’re stronger than you look!', 'A titanic win!', 'The boulder was too heavy…')
r('Ghost the Glass Frog', 'Invisibility', 'After your third move she turns invisible: you can’t see her moves for the rest of the round.',
  'You can see right through me! 👻', 'Invisible! You can’t see my moves!', 'Hopping to the answer unseen!', 'Can you see me?!', 'An invisible win!', 'I’ve been spotted…')
r('Punch the Mantis Shrimp', 'Super Punch', 'With her fourth move she lands a super punch: you skip a turn.',
  'My punch is faster than a bullet! 🥊', 'Bam! Skip a turn!', 'A punch right on target!', 'You dodged?!', 'A smashing win!', 'Tired of fighting…')
r('Fearless the Honey Badger', 'Fearless', f'When he is “Very cold”, he fearlessly takes your {K}. Once per round. Your “Freeze” and “Wild throw” bonuses don’t work on him.',
  'I’m not afraid of anything! 🦡', 'No fear! Your “⚡” is mine!', 'Charging straight to the answer!', 'Are you fearless too?!', 'A fearless win!', 'Fine… you win this time.')
r('Sniper the Archerfish', 'Precise Jet', f'On the fourth move of the round she shoots down your {K} with a jet of water.',
  'I can hit a fly in mid-air with water! 🎯', 'Pssht! Your “⚡” is shot down!', 'Aiming at the answer!', 'You dodged my jet?!', 'A sharpshooter’s win!', 'Missed…')
r('Sensor the Platypus', 'Dive', 'When he is “Cold” or farther, he dives and searches with his sensor bill: you can’t see his moves for the rest of the round. Once per round.',
  'My bill senses electricity! 📡', 'Splash! You can’t see my moves!', 'The sensor beeps — close!', 'Are you jamming my sensor?!', 'A sensational win!', 'My sensor broke…')
r('Turbo the Shrew', 'Turbo', 'After every second move of yours, turbo kicks in: her next move is two in a row.',
  'My heart beats a thousand times a minute! 🏎️', 'Turbo! Two moves in a row!', 'Racing to the answer!', 'Can you keep up with me?!', 'A turbo win!', 'Out of fuel…')
r('Siren the Lyrebird', 'Siren', 'With every third move of his he imitates a siren: your next move is made for you: a wild throw.',
  'I can copy any sound! 🎙️', 'Wee-oo-wee-oo! Your move flew anywhere!', 'Singing to the answer!', 'You out-sang me?!', 'An imitation of victory!', 'Lost my voice…')
b('Doctor Chaos', 'Chaos Ray', f'You switched on your {K} — Chaos steps in: {LAVA}. Once per round.',
  'Dazzler', 'On the fifth move of the round he turns on his dazzler: you can’t see your own moves for the rest of the round.',
  'Ha-ha! I’m a villain… but a cute one! 👑', 'Chaos ray! Your move flew anywhere!', 'Dazzler! You can’t see your own moves!',
  'My plan will work!', 'You foiled my plan?!', 'Chaos wins! 👑', 'I surrender, hero…')

# 50 · Throne of Time
r('Stumble the Dodo', 'Stumble', 'After your second move he stumbles and bumps into you: you skip a turn.',
  'I’m a dodo, not a dinosaur! 🦤', 'Oops! Bumped into you — skip a turn!', 'Stomping to the answer!', 'You’re catching up?!', 'A dodo win!', 'Tripped up…')
r('Stilts the Moa', 'Seeing Far', 'On the second move of the round she looks over the trees and learns the tens digit. She won’t tell you.',
  'I’m taller than any giraffe! 🔭', 'I see far… I know more.', 'Striding to the answer!', 'You’re tall!', 'A towering win!', 'My legs are tired…')
r('Tasman the Thylacine', 'Vanishing', 'After your third move he vanishes — and takes your moves with him: you can’t see your own moves for the rest of the round.',
  'Nobody has seen me for ages! 🐺', 'Vanished! You can’t see your own moves!', 'Sneaking up on the answer!', 'Can you see me?!', 'A striped win!', 'Vanishing again…')
r('Cambrian the Trilobite', 'Ancient Silt', 'With his second move he burrows into the ancient silt: you can’t see his moves for the rest of the round.',
  'I’m five hundred million years old! 🪲', 'Burrowed in! You can’t see my moves!', 'Crawling to the answer for ages!', 'You’re faster than ancient times!', 'An ancient win!', 'Time to become a fossil…')
r('Kelp the Sea Cow', 'Kelp Forest', 'With her first move she stirs up the kelp forest: for the rest of the round you only see the last two moves.',
  'I’m huge and very kind! 🐄', 'All stirred up! You only remember two moves!', 'Swimming to the answer!', 'You’re swimming next to me!', 'A kind win!', 'Swimming off into the cold sea…')
r('Tailcoat the Great Auk', 'A Bow', 'After your second move she bows politely — and learns whether the number is even or odd. She won’t tell you.',
  'I wear a tailcoat all my life! 🐧', 'With a bow… I know more.', 'Walking to the answer in my tailcoat!', 'You’re just as polite?!', 'An elegant win!', 'Taking my leave…')
r('Span the Haast’s Eagle', 'Shadow of Wings', 'With his third move he covers you with the shadow of his wings: you freeze and skip a turn.',
  'My wings are wider than a car! 🦅', 'Shadow! Freeze — skip a turn!', 'Flying to the answer!', 'You’re not afraid of the shadow?!', 'A wide-winged win!', 'Flying off into the past…')
r('Halfstripe the Quagga', 'Dazzling Stripes', 'At the start of the round her stripes dazzle you: you can’t see your own moves for the rest of the round.',
  'I’m half a zebra! 🦓', 'Stripes! You can’t see your own moves!', 'Galloping to the answer!', 'Can you see through my stripes?!', 'A striped win!', 'Galloped off into the past…')
r('Jurassic the Ammonite', 'Spiral of Time', 'After your second move he twists time into a spiral: for the rest of the round you only see the last two moves.',
  'I live in a spiral shell! 🐚', 'Spiral! You only remember two moves!', 'The spiral leads to the answer!', 'You got out of the spiral?!', 'A spiral win!', 'My shell is empty…')
b('Lord Chronos', 'Time Stop', 'At the start of the round he stops time: you freeze and skip a turn.',
  'Looking Through Time', 'When he is “Very hot” or closer, he looks through time and learns the last digit of the number. He won’t tell you. Once per round.',
  'I keep the time of the whole world! 👑', 'Time stop! Skip a turn!', 'I see the future… and I know more.',
  'Time is on my side!', 'You outran time!', 'Time wins! 👑', 'Your time has come — you win…')
