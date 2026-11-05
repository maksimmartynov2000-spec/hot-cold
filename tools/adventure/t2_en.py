WORLDS = ['Savanna', 'Dragon Valley', 'Dark Abyss', 'Bamboo Grove', 'UFO Station',
          'Australia', 'Circus', 'Crystal Caves', 'Mammoth Age', 'Rainbow Land']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '“⚡ +1 move”'

# 16 · Savanna
r('Bubu the Baby Rhino', 'Bird on the Horn', 'When you get warmer, the bird on his horn chirps whether the number is even or odd. Once per round.',
  'I’m big, and the bird is my friend! 🐤', 'Tweet-tweet! The number is {k}!', 'My horn senses the goal!', 'Oh, you’re very close!', 'A rhino win!', 'Come on, bird, let’s go…')
r('Petunia the Warthog', 'Kind Tusks', f'If he is “Cold” or farther, he doesn’t mind — he gives you a {K}. Once per round.',
  'I have tusks, but I’m kind 🌼', 'Missed! Have a flower — “⚡ +1 move”!', 'Oink! I’m close!', 'Oh, you’re close!', 'An oink-tastic win!', 'Keep the flower…')
r('Sprint the Cheetah Cub', 'Burst', 'After his first move he speeds up: his next move is two in a row.',
  'I’m the fastest in the savanna! 🏁', 'Speeding up! Next move — two in a row!', 'Almost at the finish!', 'You run faster than me?!', 'First at the finish!', 'Out of breath…')
r('Giggles the Hyena Pup', 'The Giggler', 'When you get colder, he laughs so hard he lets it slip: the number is more or less than yours. Once per round.',
  'Hee-hee, let’s play! 😆', 'Ha-ha-ha! It’s {k}!', 'Ha! Hot!', 'Not funny — you’re close!', 'Ha-ha, a win!', 'Ha… you’re good!')
r('Stomper the Ostrich Chick', 'Head in the Sand', 'When you are “Very hot” or closer, he hides his head in the sand — and your move with it: you can’t see that move. Once per round.',
  'I’m little, but I run fast! 🙈', 'Head in the sand — and your move too!', 'Stomp-stomp — almost!', 'Eek, you’re close!', 'I won!', 'I’ll hide in the sand…')
r('Skippy the Gazelle', 'Big Leap', 'When she gets warmer, she makes a huge leap: her next move is two in a row. Once per round.',
  'I’m light as the wind! 🌿', 'Leap! Next move — two in a row!', 'The goal is close!', 'You leap just as well!', 'A leap to victory!', 'I tripped…')
r('Beardy the Wildebeest', 'The Great Migration', 'On the fourth move of the round the herd runs past: you skip a turn.',
  'There are lots and lots of us! 🐃', 'The herd is coming! Skip a turn!', 'The herd smells the goal!', 'You outran the herd!', 'The herd wins!', 'The herd moved on…')
r('Big Eyes the Bushbaby', 'Night Eyes', 'From her second move she sees which half the number is in. She won’t tell you.',
  'Look at my big eyes! 👀', 'My eyes see it all — I know the half!', 'I see the goal!', 'You see in the dark too?!', 'A wide-eyed win!', 'My eyes are tired…')
r('Scribe the Secretary Bird', 'Notes', 'After your third move he writes it down and tells you which half the number is in.',
  'I write everything down! ✒️', 'Noted: {k}.', 'The goal is on my list!', 'You write faster than me!', 'Victory noted!', 'My quill broke…')
b('The Leopard Queen', 'Spotted Swap', 'When you get warmer, she swaps “⚡ +1 move” with you: yours go to her, hers go to you. Once per round.',
  'Ambush', 'When you are “Very hot” or closer, she pounces from an ambush: you skip a turn. Once per round.',
  'The savanna is my kingdom! 🐆', 'Swap! Your “⚡” are mine, mine are yours!', 'Ambush! Skip a turn!',
  'My prey is close!', 'How brave!', 'Queen of the savanna! 👑', 'You’re faster than a leopard!')

# 17 · Dragon Valley
r('Cinder the Dragonling', 'Fanning the Coals', 'When you get warmer, he fans the coals and takes a “⚡ +1 move” for himself. Once per round.',
  'Fwoosh! I warm my paws on an ember! 🔥', 'Fwoosh! Heat — a “⚡ +1 move” for me!', 'Hot, hot, hot!', 'Warming yourself by my fire?!', 'A win hotter than fire!', 'My ember went out…')
r('Weathervane the Wyvern', 'Weathervane Tail', 'When she is “Warm” or closer, her tail turns like a weathervane and tells you: the number is more or less than hers. Once per round.',
  'My tail always knows which way the wind blows! 🐉', 'My tail points: it’s {k}!', 'The wind blows my way!', 'You’re flying with the wind!', 'The wind brought me victory!', 'The wind has changed…')
r('Achoo the Dragonling', 'Achoo!', 'After your second move he sneezes sparks — startled, your next move is made for you: a wild throw.',
  'Hi… ah… ah… ACHOO! 🤧', 'ACHOO! Your move flew anywhere!', 'Achoo! Oh, I’m close!', 'Bless you… I mean, you’re close!', 'Achoo! I win!', 'Achoo… caught a cold and lost.')
r('Windwing the Dragon', 'Wingbeat', 'After his third move he spreads his wings: his next move is two in a row.',
  'My wings outrun the wind! 🌬️', 'Flap! Two moves in a row!', 'Flying at full speed!', 'Are you flying after me?!', 'I soared to victory!', 'I folded my wings…')
r('Mirage the Dragonling', 'Invisible', 'His third move melts into thin air: you can’t see it.',
  'Can you see me? And now? ✨', 'Poof! That move vanished!', 'I’m where you aren’t looking!', 'Can you see through the mirage?!', 'The mirage wins!', 'The mirage faded…')
r('Kindly the Dragonling', 'Second Chance', 'When you get colder, he kindly lets you try again: you move again right away. Once per round.',
  'I’m the kindest dragon in the valley! 💛', 'Don’t be sad — have another go!', 'Oh, I almost guessed it myself!', 'You’re close — I’m happy for you!', 'I win! But you did great!', 'Hooray! You win — no hard feelings!')
r('Rumble the Dragon', 'Roar', 'On the third move of the round he roars so loudly that you skip a turn.',
  'Grrr… that’s how I say hello 🐲', 'GRRR! You skip a turn!', 'Grrr, I smell victory!', 'You’re not scared of me?!', 'Grrr! A victory roar!', 'Grr… oh well.')
r('Miser the Dragon', 'Treasure Hoard', 'After your second move he hides your “⚡ +1 move” in his hoard — and it’s gone.',
  'All the gold is mine! Yours too! 💰', 'Mine! Into the hoard!', 'I smell gold!', 'Stay away from my gold!', 'One more coin for the hoard!', 'My gold… sigh.')
r('Quill the Feathered Serpent', 'Gliding', 'When he gets colder, he glides in the clouds and skips his turn. Once per round.',
  'Hsss… feathers and scales — that’s my beauty 🪶', 'Hsss… gliding, skipping a turn.', 'Hsss, I’m close!', 'You ruffled my feathers!', 'Hsss! I win!', 'My feathers drooped…')
b('The Dragon King', 'Curtain of Fire', 'When he is “Burning”, he breathes a curtain of fire: you can’t see your own moves for the rest of the round. Once per round.',
  'Take Off', 'On the fourth move of the round he soars into the sky: his next move is two in a row.',
  'Bow before the Dragon King! 👑', 'Fire! You can’t see your own moves!', 'Taking off! Two moves in a row!',
  'My flames smell victory!', 'You’re not afraid of fire?!', 'A dragon’s victory! 👑', 'My flame went out… you win.')

# 18 · Dark Abyss
r('Bulb the Anglerfish', 'Little Lantern', 'If you are “Cold” or farther, he shines his lantern and tells you whether the number is even or odd. Once per round.',
  'With me, the dark isn’t scary 🏮', 'I shine: the number is {k}!', 'My lantern glows brighter — close!', 'You found the light!', 'A bright win!', 'My bulb went out…')
r('Dumbo the Octopus', 'Ink Cloud', 'When he is “Very hot” or closer, he squirts ink: you can’t see his moves for the rest of the round. Once per round.',
  'I’ll wave my ears at you! 🐙', 'Pfft! Ink — you can’t see a thing!', 'I’m close!', 'You see through ink?!', 'A win from the deep!', 'Swimming off into the dark…')
r('Blinky the Lanternfish', 'Little Lights', 'With her first move she lights up and learns which half the number is in. She won’t tell you.',
  'I glow! ✨', 'My lights are on — I know the half!', 'My lights are brighter!', 'You glow too?!', 'A shining win!', 'My lights went out…')
r('Armor the Giant Isopod', 'Armor Up', f'You switch on your {K} — he curls up in his armor and takes a {K} for himself. Once per round.',
  'I have a tough shell! 🛡️', 'Clunk! Armor up — and a “⚡” for me!', 'Crawling to the goal!', 'You broke through my armor!', 'An armored win!', 'I curled up into a ball…')
r('Angel the Sea Angel', 'Kind Angel', f'If you are “Very cold”, she feels sorry for you and gives you a {K}. Once per round.',
  'I float in the deep 😇', 'Don’t be sad — have a “⚡ +1 move”!', 'Oh, close!', 'You almost found it!', 'An angelic win!', 'Well done!')
r('Snap the Shrimp', 'Snap!', 'When she gets warmer, she snaps her claw loudly: your next move is made for you — a wild throw. Once per round.',
  'I’m small but loud! 🦐', 'SNAP! A wild throw!', 'Snap — close!', 'You weren’t scared?!', 'Snap — a win!', 'My claw is tired…')
r('Gulp the Gulper Eel', 'Big Mouth', 'When you are “Burning”, he swallows your move: you can’t see it. Once per round.',
  'What a big mouth I have! 😮', 'Gulp! Your move is swallowed!', 'Gulp — almost!', 'Don’t get caught!', 'I swallowed the win!', 'I choked…')
r('Squish the Blobfish', 'Lazybones', 'On the third move of the round she flops and skips her turn.',
  'I’m soft and happy 🫠', 'Squish… so lazy… I’ll skip a turn.', 'Oh, it’s hot!', 'You’re so lively!', 'Squish — a win!', 'I melted into a puddle…')
r('Mirror the Hatchetfish', 'Silver Side', 'When she is “Very hot” or closer, she learns from her shiny side whether the number is even or odd. She won’t tell you. Once per round.',
  'Look at yourself in my side! 🪞', 'Shine! I know if it’s even!', 'It sparkles — close!', 'You shine just as well!', 'A sparkling win!', 'I lost my shine…')
b('The Queen of the Deep', 'Darkness of the Abyss', 'When she is “Very hot” or closer, she puts out the light: you can’t see your own moves for the rest of the round. Once per round.',
  'Cold Current', f'When you get colder, the current puts out your {K}. Once per round.',
  'Welcome to my abyss… ✨', 'Darkness! You can’t see your moves!', 'The current took your “⚡”!',
  'The deep guides me!', 'You’re not afraid of the dark?!', 'The abyss is mine! 👑', 'You lit up the abyss!')

# 19 · Bamboo Grove
r('Goldie the Golden Monkey', 'Quick Paws', f'When she is “Warm” or closer, she snatches your {K} for herself. Once per round.',
  'Oo-oo-ah! I’m golden! 🐒', 'Snatch! The “⚡” is mine!', 'I almost reached it!', 'You’re quicker than a monkey!', 'A golden win!', 'I fell off the branch…')
r('Ginger the Red Panda', 'A Treat', f'After your third move she treats you: a {K} for you.',
  'Hi! I’m fluffy! 🍎', 'Have an apple — “⚡ +1 move”!', 'Oh, warm!', 'You almost guessed it!', 'A fluffy win!', 'Well done!')
r('Dancer the Crane', 'Crane Dance', 'After his fourth move he dances and skips his turn.',
  'Shall we dance? 💃', 'La-la… dancing — I’ll skip a turn.', 'The dance leads to the goal!', 'You dance better!', 'A victory dance!', 'I lost the rhythm…')
r('Wish the Koi', 'Wishes Come True', f'On the fifth move of the round he grants a wish: a {K} for you.',
  'Make a wish! 🎏', 'Wish granted — “⚡ +1 move”!', 'Swimming to the goal!', 'You guess my wishes!', 'A wishful win!', 'Swimming away…')
r('Goldwing the Pheasant', 'Fiery Tail', 'When he is “Burning”, he fans out his tail: you can’t see that move of his. Once per round.',
  'Admire my feathers! 🎐', 'Tail fanned out — you can’t see the move!', 'My feathers are glowing — hot!', 'You’re brighter than me!', 'A dazzling win!', 'My feathers fell…')
r('Trickster the Tanuki', 'Shape-shifter', 'He hides your first move under a leaf: you can’t see it.',
  'I can change my shape! 🍃', 'Poof! Your move is under a leaf!', 'Hee-hee, close!', 'You saw through my trick?!', 'A magical win!', 'My leaf fell off…')
r('Flicker the Firefly', 'Light in the Night', 'When you get colder, she lights the way: which half the number is in. Once per round.',
  'I light the way! 💡', 'I shine: {k}.', 'I’m glowing brighter!', 'You see even without light!', 'A bright win!', 'My light went out…')
r('Scales the Pangolin', 'Curl Up', f'When you are “Warm” or closer, he curls up into a ball: your {K} bounces off his scales and goes out. Once per round.',
  'My scales are like armor! 🧶', 'Curled up! Your “⚡” bounced off!', 'I sense it — close!', 'You’re not afraid of scales?!', 'A scaly win!', 'I curled up…')
r('Vine the Gibbon', 'Ever Higher', 'Climbs higher and higher: each of his numbers is bigger than the last, as long as it can be.',
  'Ooh-ooh! The higher, the better! 🐒', 'Ooh-ooh! Climbing higher!', 'Almost at the treetop!', 'Are you climbing after me?!', 'Ooh-ooh! I’m at the very top!', 'I slipped off the vine…')
b('The Panda Emperor', 'Wisdom', 'With his second move he thinks it over and learns: the number is more or less than his. He won’t tell you.',
  'Meditation', 'When you are “Warm” or closer, you freeze in meditation and skip a turn. Once per round.',
  'The bamboo grove is my empire 🐼', 'Wisdom has spoken!', 'Ommm… freeze!',
  'The path is clear!', 'You’re wiser than me?!', 'Wisdom wins! 👑', 'You deserve respect.')

# 20 · UFO Station
r('Goop the Alien', 'Signal', 'On the sixth move of the round he picks up a signal from orbit and tells you which half the number is in.',
  'Goop-goop! Hello, Earthling! 👽', 'Goop-goop! The signal says: {k}!', 'Goop! My antennae are tingling!', 'The Earthling got close!', 'Goop-goop! I win!', 'Goop… returning to base.')
r('Floaty the Tardigrade', 'Zero Gravity', 'After your third move she switches on zero gravity: your next move is made for you — a wild throw.',
  'I can survive even in outer space! 🚀', 'Zero gravity! Your move drifted off!', 'Floating straight to the answer!', 'Are you floating towards me?!', 'I’m tough — I win!', 'Drifted away…')
r('Twofer the Martian', 'Two Heads', 'After his fourth move his two heads agree: he moves again right away.',
  'Hi-hi! There are two of us — in one! 🪐', 'Two heads — one more move!', 'Two heads are better than one — very hot!', 'Both heads are worried!', 'A double victory!', 'Both heads are sad…')
r('Slimy the Space Slug', 'Sticky Trail', 'If you are “Very cold”, you step into his sticky trail and skip a turn. Once per round.',
  'Squelch! Greetings from the nebula! 🌌', 'Squelch! Stuck — you skip a turn!', 'Squelch-squelch, I’m close!', 'Oh, you’re not sticking?!', 'Squelch! I win!', 'Squelch… I melted.')
r('Zappy the Star Hedgehog', 'Static Shock', 'When he gets warmer, he zaps you: your “⚡ +1 move” burns out. Once per round.',
  'Don’t pet me — I give shocks! ⚡', 'Bzzz! Your “⚡” burned out!', 'Sparkling with joy!', 'Not afraid of sparks?!', 'Bzzz! I win!', 'My battery’s flat…')
r('Pilot the Mouse Astronaut', 'Launch Supply', 'With her first move she pulls a “⚡ +1 move” out of her spacesuit for herself.',
  'Pilot ready for take-off! 🚀', 'Launch supply — a “⚡ +1 move” for me!', 'Course set for victory!', 'You’re in my orbit!', 'Landing on victory!', 'Flight cancelled…')
r('Radar the Alien', 'Radar Dish', 'On the second move of the round he catches a signal with his radar and tells you: the number is more or less than that one.',
  'Beep-beep… Earthling detected! 📡', 'Beep-beep! It’s {k}!', 'The signal is getting stronger!', 'You’re jamming my signal!', 'Beep-beep! I win!', 'Signal lost…')
r('Thinker the Telepathic Octopus', 'Mind Reading', 'With every third move of his he reads minds and learns: the number is more or less than his. He won’t tell you.',
  'I know what you’re thinking… 🐙', 'Reading minds… I know where to go!', 'Thoughts lead me to the answer!', 'You’re thinking too loudly!', 'I foresaw this!', 'Couldn’t read it… you win.')
r('Rocket the Space Puppy', 'Jetpack', 'When you are “Very hot” or closer, he fires up his jetpack and takes a “⚡ +1 move” for himself. Once per round.',
  'Woof! To the stars! 🚀', 'Woof! Jetpack charged — a “⚡ +1 move” for me!', 'Woof! I smell a star trail!', 'You’re flying faster than me!', 'Woof-woof! Victory in space!', 'Woof… I landed.')
b('The Great Bear', 'Starry Chill', 'On the fourth move of the round she breathes the chill of space: you freeze and skip a turn.',
  'North Star', 'When she is “Very hot” or closer, she checks the North Star and moves again right away. Once per round.',
  'I shine in the sky every night! 👑', 'Starry chill! You skip a turn!', 'The North Star has spoken — I move again!',
  'The stars are winking at me!', 'You’re flying to my stars!', 'A starry victory! 👑', 'The stars have dimmed… you win.')

# 21 · Australia
r('Pouch the Kangaroo', 'Hop-hop', 'After your first move she hops: her next move is two in a row.',
  'My baby and I hop together! 🦘', 'Hop-hop! Two moves in a row!', 'I’ll hop there!', 'You hop farther!', 'A hop to victory!', 'Tired of hopping…')
r('Snooze the Koala', 'Drowsy', 'When you are “Warm” or closer, she gets drowsy and skips her turn. Once per round.',
  'I’m so cozy on my branch 🐨', 'Warm… sleepy… I’ll skip a turn.', 'Oh, hot…', 'You woke me up!', 'A sleepy win!', 'I’ll sleep some more…')
r('Chubby the Wombat', 'The Burrow', f'If you are “Cold” or farther, your {K} falls into his burrow. Once per round.',
  'I’m round and I dig burrows 🟫', 'Plop! Your “⚡” is in my burrow!', 'Digging to the goal!', 'You found my burrow!', 'A chubby win!', 'I’ll hide in my burrow…')
r('Flipper the Platypus', 'Clever Bill', 'After his second move his bill senses whether the number is more or less than his — and he tells you.',
  'I’m part duck, part beaver! 📡', 'My bill senses it: it’s {k}!', 'My bill senses the goal!', 'You sense it just as well!', 'A platypus win!', 'I’ll dive deeper…')
r('Needles the Echidna', 'Spines', f'When you are “Warm” or closer, she spikes a {K} for herself. Once per round.',
  'Careful, I’m prickly! 🪡', 'Spiked a “⚡” for me!', 'My nose says — close!', 'You’re not afraid of spines?!', 'A prickly win!', 'I curled up…')
r('Crest the Cockatoo', 'Copycat', 'On the third move of the round she repeats that number and shouts: the number is more or less than it.',
  'Hello! Hello! 🗯️', 'Squawk! It’s {k}!', 'Close! Close!', 'You’re guessing! Guessing!', 'Win! Win!', 'Bye! Bye!')
r('Cackle the Kookaburra', 'Laughing Fit', 'When you get colder, she laughs so hard she skips her turn. Once per round.',
  'Ha-ha! What fun! 😂', 'Ha-ha-ha! I’ll skip a turn laughing!', 'Ha — hot!', 'Not funny — you’re close!', 'Ha-ha, a win!', 'All laughed out…')
r('Smiley the Quokka', 'The Smile', f'When you get warmer, she’s so happy she gives a {K} to you and to herself. Once per round.',
  'I’m the smiliest animal! 😊', 'Yay! A “⚡ +1 move” for everyone!', 'Smiling — close!', 'You’re smiling back!', 'A smiley win!', 'Still smiling!')
r('Whirl the Tasmanian Devil', 'Whirlwind', f'With his first move he spins like a whirlwind — your {K} is gone.',
  'Grrr! I’m quick! 🔥', 'Whoosh! Your “⚡” got blown away!', 'Rushing to the goal!', 'You’re faster than a whirlwind?!', 'A whirlwind win!', 'The whirlwind calmed down…')
b('The Crocodile King', 'Croc Grip', 'When you are “Very hot” or closer, he grabs you: you freeze and skip a turn. Once per round.',
  'Sunbathing', f'After his third move he basks in the sun and takes a {K} for himself.',
  'Australia is my river! 🐊', 'Snap! Freeze!', 'Sunshine — a “⚡” for me!',
  'My prey is close!', 'You’re not afraid of teeth?!', 'King of the river! 👑', 'Swimming away…')

# 22 · Circus
r('Pompom the Clown', 'Lucky Seven', 'He loves sevens: while there are many numbers left, he names numbers with a 7 in them.',
  'Hello, hello, the show begins! 7️⃣', 'Seven is my lucky number!', 'Ha — almost!', 'You’re funnier than a clown!', 'A circus win!', 'Bravo, bravo!')
r('Rope the Lemur', 'Up High', 'When he gets warmer, from the tightrope he sees which half the number is in. He won’t tell you. Once per round.',
  'I walk the tightrope! ☂️', 'From the rope I can see the half!', 'Walking to the goal!', 'You keep your balance!', 'A tightrope win!', 'I fell… into the net!')
r('Nimble the Capybara', 'Juggling', f'On the third move of the round she tosses a {K} to herself.',
  'I’m calm and nimble 🤹', 'Hup! A “⚡” for me!', 'The balls fly to the goal!', 'You catch better!', 'A juggling win!', 'I dropped the balls…')
r('Hoop the Tiger Cub', 'Through the Hoop', 'When he is “Burning”, he gets so excited he jumps through the hoop and loses his own “⚡ +1 move”. Once per round.',
  'Rawr! Watch me jump! 🐯', 'Hup! I dropped my own “⚡”!', 'Rawr! I’m close!', 'You jump better than me!', 'Rawr! A victory leap!', 'I missed the hoop…')
r('Tippy the Llama', 'Spit!', 'When you get colder, she spits: you can’t see that move of yours. Once per round.',
  'I stand on a ball! 🦙', 'Ptooey! Your move is gone!', 'Balancing — close!', 'You balance better!', 'An acrobatic win!', 'I rolled off the ball…')
r('Barbell the Bull', 'The Strongman', f'When he is “Very hot” or closer, he takes your {K} for himself. Once per round.',
  'I’m the strongest in the circus! 🏋️', 'Hup! The “⚡” is mine!', 'Lifting up the win!', 'You’re stronger?!', 'A strong win!', 'That barbell is heavy…')
r('Cannonball the Ladybug', 'Out of the Cannon', 'On the second move of the round she flies out of a cannon: her next move is two in a row.',
  'Here I go! 🐞', 'Boom! Flying — two moves!', 'Flying to the goal!', 'You fly farther!', 'Right on target!', 'I overshot…')
r('Tumble the Hamster', 'Somersault Hint', 'On the fourth move of the round he does a somersault and tells you whether the number is even or odd.',
  'Somersault! And another! Hi! 🐹', 'Somersault! The number is {k}!', 'My head is spinning — very hot!', 'You’re tumbling towards the answer!', 'A victory somersault!', 'Tumbled out…')
r('Presto the Magic Hat', 'Vanishing Act', 'When he is “Warm” or closer, he vanishes in smoke: you can’t see his moves for the rest of the round. Once per round.',
  'Attention — a magic trick! 🎩', 'Hocus-pocus! I vanish!', 'The magic works!', 'You figured out the trick?!', 'A magical win!', 'The rabbit ran away…')
b('The Ringmaster', 'Allez-hop!', 'On the fifth move of the round he announces the next act: his next move is two in a row.',
  'The Ringmaster’s Eye', 'When you get warmer, he notices and learns whether the number is more or less than yours. He won’t tell you. Once per round.',
  'Ladies and gentlemen! The show begins! 🎪', 'Allez-hop! Two moves!', 'Aha! I see everything!',
  'The grand finale is close!', 'What talent!', 'The greatest show! 👑', 'A round of applause for the winner!')

# 23 · Crystal Caves
r('Starnose the Star-Nosed Mole', 'Crystal Collector', 'If you are “Cold” or farther, he digs up a crystal: a “⚡ +1 move” for himself. Once per round.',
  'My nose is a star! I find everything with it ⭐', 'Dig, dig — a “⚡ +1 move” for me!', 'My nose smells crystals!', 'You’re digging right next to me!', 'I dug up a victory!', 'I burrowed away… you win.')
r('Rosie the Axolotl', 'Friendly', f'When he gets colder, he doesn’t mind and gives you a {K}. Once per round.',
  'Hi! I always smile 💗', 'Here you go — “⚡ +1 move”!', 'Oh, hot!', 'You almost guessed it!', 'A rosy win!', 'Well done!')
r('Feeler the Olm', 'Sixth Sense', 'After your second move he senses through the rock which half the number is in. He won’t tell you.',
  'I live in the dark — I don’t need eyes 🦎', 'I sense it… I know where to look!', 'The darkness guides me!', 'Can you sense it too?!', 'No eyes — and I won!', 'I sensed the wrong way…')
r('Helmet the Cave Fish', 'Helmet Lamp', 'When you are “Very hot” or closer, she shines her lamp: the number is even or odd. Once per round.',
  'I wear a helmet — I’m a miner! 🔦', 'I shine: the number is {k}!', 'Shining brighter!', 'You found the way!', 'A miner’s win!', 'My lamp went out…')
r('Drip the Stalactite', 'Drip!', 'After his second move a drop falls from him: you freeze and skip a turn.',
  'I hang upside down… 💧', 'Drip! Freeze!', 'Drip — close!', 'You sneaked under me!', 'A drippy win!', 'I broke off…')
r('Glitter the Crystal Lizard', 'Dazzling Sparkle', 'When you are “Burning”, she sparkles so brightly that you can’t see your own moves for the rest of the round. Once per round.',
  'Look how I sparkle! 💎', 'Sparkle! You can’t see your own moves!', 'My crystals are shining!', 'Aren’t you squinting?!', 'A sparkling victory!', 'I’ve lost my shine…')
r('Pattern the Moth', 'Wing Patterns', 'When he gets warmer, the pattern on his wings tells him whether the number is even or odd. He won’t tell you. Once per round.',
  'My wings glow 🕯️', 'The pattern told me — I know if it’s even!', 'Flying to the light!', 'You’re brighter than a flame!', 'A patterned win!', 'Flying away…')
r('Creak the Cave Cricket', 'Cave Echo', 'On the third move of the round he listens to the echo and learns whether the number is even or odd. He won’t tell you.',
  'Creak-creak! Hear the echo? 🦗', 'Creak-creak… the echo told me everything!', 'The echo rings — very hot!', 'Your footsteps are too loud!', 'Creak-creak — I win!', 'The echo fooled me…')
r('Pickaxe the Pika', 'Digging Nearby', 'When you get warmer, she tells you which half the number is in. Once per round.',
  'Squeak! I’m digging! ⛏️', 'Tap-tap with my pickaxe: {k}!', 'Squeak — close!', 'You dig faster!', 'Squeak, a win!', 'Squeak… I’m tired.')
b('The Crystal Queen', 'Crystal Trap', f'After your third move your {K} freezes into crystal and is gone.',
  'Crystal Chill', 'When she gets warmer, everything freezes: you freeze and skip a turn. Once per round.',
  'My caves shine forever 🔷', 'Crystal! Your “⚡” froze!', 'Freeze like crystal!',
  'The crystals whisper!', 'You’re not afraid of the cold?!', 'A crystal win! 👑', 'You shine brighter than all my crystals!')

# 24 · Mammoth Age
r('Fuzzy the Baby Mammoth', 'Ice Dust', 'If you are “Cold” or farther, he swings his trunk and showers you with ice dust: you freeze and skip a turn. Once per round.',
  'Toot-toot! I’m the fluffiest mammoth! 🦣', 'Poof! Frozen — you skip a turn!', 'Toot-toot! I’m close!', 'You’re following my tracks!', 'Toot-toooot! I win!', 'My fur stands on end… you win.')
r('Fang the Saber-Tooth', 'Sharp Fang', 'After his second move he bites your “⚡ +1 move” — and it’s gone.',
  'Don’t worry — I only look fierce 🐯', 'Chomp! Your “⚡” is gone!', 'My fangs smell victory!', 'You’re brave!', 'Grr! I win!', 'My fangs got blunt…')
r('Snowdrift the Woolly Rhino', 'Gentle Giant', 'After your first move he gives you a “⚡ +1 move” — to warm up.',
  'I’m big, but kind! 🦏', 'Have a “⚡ +1 move” — warm up!', 'Stomp-stomp, I’m close!', 'You’re close — well done!', 'Stomp-stomp — I win!', 'Well, you earned it!')
r('Den the Cave Bear', 'Warm Den', 'If you are “Cold” or farther, he goes to his den to warm up and skips his turn. Once per round.',
  'Hmm… I just woke up 🐻', 'Going to warm up… skipping a turn.', 'I smell honey — very hot!', 'You’re at my den!', 'Grr! I win — and off to sleep!', 'Back to my nap…')
r('Antlers the Giant Deer', 'Trumpet Call', 'After his third move he trumpets a hint: whether the number is even or odd.',
  'See my antlers? The widest of all! 🦌', 'Toooot! The number is {k}!', 'My antlers sense victory!', 'You came right up to my antlers!', 'Toooot! I win!', 'My antlers drooped…')
r('Ambush the Cave Lion', 'Lying in Wait', 'The third move of the round sinks into a snowdrift: you can’t see it.',
  'Grr… you can’t see me in the snow 🦁', 'Shh… that move is lying in wait!', 'Prey is near!', 'Did you find my hiding spot?!', 'A pounce from cover — I win!', 'The ambush failed…')
r('Shellby the Glyptodont', 'Generous Shell', 'After his third move he opens his shell a little and gives you a “⚡ +1 move”.',
  'My shell is harder than stone! 🛡️', 'Have a “⚡ +1 move” from under my shell!', 'Crawling towards the answer!', 'Are you knocking on my shell?!', 'A rock-solid victory!', 'I’ll hide in my shell…')
r('Giant the Ground Sloth', 'Big Hug', 'When you get colder, he gives you a hug: a “⚡ +1 move” each for you and for himself. Once per round.',
  'Hellooo… huuug? 🦥', 'Big hug! A “⚡ +1 move” for each of us!', 'I’m… almost… there…', 'You’re… so… fast…', 'Slowly… but I win!', 'It’s okay… hug?')
r('Tufty the Lynx Kitten', 'Lynx Leap', f'When he is “Burning”, he leaps and snatches your {K}. Once per round.',
  'I have tufts on my ears! 🐈', 'Leap! The “⚡” is mine!', 'Sneaking — close!', 'You spotted me?!', 'A lynx win!', 'I’ll hide in a snowdrift…')
b('The Mammoth King', 'Ice Storm', 'On the sixth move of the round he trumpets up a storm: you freeze and skip a turn.',
  'Leader’s Gift', 'After his second move he shares with you: a “⚡ +1 move” each for you and for himself.',
  'I lead my herd across the endless ice! 👑', 'Toooot! A storm — you skip a turn!', 'The leader is generous: a “⚡ +1 move” for each of us!',
  'The ice is cracking — very hot!', 'You’re strong, little one!', 'A royal victory! 👑', 'I bow my tusks — you win.')

# 25 · Rainbow Land
r('Mane the Baby Unicorn', 'Magic Horn', 'With her first move she touches the rainbow with her horn and learns whether the number is even or odd. She won’t tell you.',
  'I’m magical! 🦄', 'My horn knows if it’s even!', 'Magic is close!', 'You’re magical too?!', 'A magical win!', 'My magic ran out…')
r('Cloudy the Pegasus Foal', 'From Up High', 'When he is “Warm” or closer, he tells you from up high which half the number is in. Once per round.',
  'I fly in the clouds! ☁️', 'From up here I see: {k}!', 'Flying to the goal!', 'You fly higher!', 'A heavenly win!', 'I landed…')
r('Whirlpool the Kelpie', 'Whirlpool', 'After your third move he pulls you into a whirlpool: you freeze and skip a turn.',
  'Want to ride the waves? 🌊', 'Gurgle! Whirlpool — you skip a turn!', 'The waves carry me to the answer!', 'You’re swimming against the current!', 'Gurgle-gurgle — I win!', 'Swept away by the current…')
r('Paisley the Mandarin Duck', 'Patterned Feather', 'On the seventh move of the round she drops a patterned feather: a “⚡ +1 move” for you.',
  'Quack! I’m the fanciest duck around! 🦆', 'Quack! Have a feather — a “⚡ +1 move”!', 'Quack! Almost!', 'Quack-quack, you’re close!', 'Quack! I win!', 'Quack… you win.')
r('Sage the Qilin', 'Qilin Wisdom', 'After your first move he thinks deeply and learns which half the number is in. He won’t tell you.',
  'I bring wisdom and good luck ✨', 'Wisdom has shown me the way…', 'Luck is on my side!', 'You’re wise beyond your years!', 'Wisdom wins!', 'Even sages make mistakes…')
r('Zing the Jellyfish', 'Stinging Tentacle', 'When she is “Very hot” or closer, she stings with a tentacle: you skip your next turn. Once per round.',
  'I shimmer in every color! 🪼', 'Ouch! You skip a turn!', 'Floating straight to the answer!', 'Careful, I sting!', 'A shimmering victory!', 'I melted into the waves…')
r('Twirl the Bird of Paradise', 'Dance Hint', 'When you are “Very hot” or closer, she dances and shows with her feathers: the number is more or less than yours. Once per round.',
  'Shall we dance? I’m the best dancer in the forest! 🦚', 'My dance says: it’s {k}!', 'My dance leads to victory!', 'You dance better than me!', 'Victory dance!', 'I lost the rhythm…')
r('Sippy the Lorikeet', 'Nectar', 'On the second move of the round she sips nectar: a “⚡ +1 move” for herself.',
  'Tweet! I’m the most colorful bird! 🦜', 'Sweet nectar — a “⚡ +1 move” for me!', 'Tweet! Very hot!', 'Tweet! You’re close!', 'Tweet-tweet! I win!', 'Tweet… you win.')
r('Glimmer the Firefly Squid', 'Ink Cloud', 'With his fourth move he squirts ink: you can’t see his moves for the rest of the round.',
  'I twinkle in the deep! 🦑', 'Pssht! Ink — you can’t see my moves!', 'Twinkling right by the answer!', 'Can you see through the ink?!', 'A twinkling victory!', 'My lights went out…')
b('The Rainbow Dragon', 'Rainbow Fire', 'When you are “Burning”, she breathes rainbow fire: you can’t see her moves for the rest of the round. Once per round.',
  'Rainbow Swap', 'When she is “Very hot” or closer, she swaps “⚡ +1 move” with you: yours go to her, hers go to you. Once per round.',
  'Rainbow Land is mine! 🐉', 'Rainbow fire!', 'Let’s swap “⚡”!',
  'The rainbow guides me!', 'You’re brighter than a rainbow?!', 'A rainbow win! 👑', 'You beat the dragon!')

assert len(H) == 100, len(H)
