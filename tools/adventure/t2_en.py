WORLDS = ['Savanna', 'Toy Land', 'Dark Abyss', 'Bamboo Grove', 'Clockwork City',
          'Australia', 'Circus', 'Crystal Caves', 'Winter Tale', 'Rainbow Land']
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

# 17 · Toy Land
r('Twirl the Spinning Top', 'Spin Up', f'When you get warmer, she spins faster and takes a {K} for herself. Once per round.',
  'I spin and spin! 🌀', 'Whirr! A “⚡ +1 move” for me!', 'I’m dizzy — it’s hot!', 'You’re about to stop me!', 'A victory lap!', 'I spun out…')
r('Rocky the Rocking Horse', 'Back and Forth', 'When she is “Warm” or closer, she rocks and lets it slip: the number is more or less than hers. Once per round.',
  'Neigh! Shall we rock? 🐴', 'Clip-clop! It’s {k}!', 'Galloping to the goal!', 'You gallop faster!', 'Neigh, a win!', 'I rocked too hard…')
r('Socky the Jack-in-the-Box', 'Surprise!', 'After your second move he pops out of his box — you’re so surprised that your next move is made for you: a wild throw.',
  'Knock-knock! Who’s in the box? 🧦', 'Boo! Surprise! A wild throw!', 'I’m about to pop!', 'Don’t open the lid!', 'Surprise worked!', 'My spring got tired…')
r('Puffy the Toy Train', 'Full Steam', 'After his third move he builds up steam: his next move is two in a row.',
  'Choo-choo! Let’s go! 🚂', 'Toot-toot! Full steam — two in a row!', 'The station is close!', 'You’re faster than a train!', 'We arrived at victory!', 'Off the rails…')
r('The Matryoshka Sisters', 'Doll in a Doll', 'Their third move hides inside a doll: you can’t see it.',
  'There are three of us sisters! 🪆', 'The move is hiding in a doll!', 'Oh, it’s hot!', 'Don’t open me!', 'The sisters win!', 'We came apart…')
r('Loop the Yo-Yo', 'Come Back', 'When you get colder, the yo-yo comes back: you move again right away. Once per round.',
  'Up and down! 🪀', 'Zip — back! Have another go!', 'Zip — almost!', 'You’re so nimble!', 'A loop of victory!', 'My string got tangled…')
r('Boom the Toy Drum', 'Drum Roll', 'On the third move of the round — a drum roll: you skip a turn.',
  'Boom-boom! 🥁', 'Ra-ta-tat! Skip a turn!', 'The drum roll gets louder!', 'You keep the beat!', 'A victory march!', 'My sticks broke…')
r('Penny the Piggy Bank', 'The Coin', f'After your second move your {K} drops into the piggy bank and is gone.',
  'Oink! I’m saving coins! 🐷', 'Clink! Your “⚡” is in the piggy bank!', 'It jingles — it’s hot!', 'Don’t break me!', 'A piggy bank full of wins!', 'The piggy bank is empty…')
r('Flappy the Paper Plane', 'Gliding Down', 'When he gets colder, he glides down and skips his turn. Once per round.',
  'I’m flying! ✈️', 'Whoosh… gliding — I’ll skip a turn.', 'Flying to the goal!', 'You fly higher!', 'Soft landing — a win!', 'I got crumpled…')
b('The Block King', 'Block Wall', 'When he is “Burning”, he builds a wall: you can’t see your own moves for the rest of the round. Once per round.',
  'The Tower Grows', 'On the fourth move of the round he adds to his tower: his next move is two in a row.',
  'I built a whole kingdom! 🧱', 'A wall! You can’t see your moves!', 'The tower is taller — two moves!',
  'The kingdom is almost mine!', 'You’re knocking down my tower!', 'King of the toys! 👑', 'My tower fell…')

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
r('Shooty the Bamboo Sprout', 'Growing Up', 'He grows up: each of his numbers is higher than the last one, as long as he can.',
  'I grow every day! 🎋', 'Growing! Higher and higher!', 'I’ve almost grown there!', 'You grow faster!', 'I grew all the way to a win!', 'I’ll grow some more…')
b('The Panda Emperor', 'Wisdom', 'With his second move he thinks it over and learns: the number is more or less than his. He won’t tell you.',
  'Meditation', 'When you are “Warm” or closer, you freeze in meditation and skip a turn. Once per round.',
  'The bamboo grove is my empire 🐼', 'Wisdom has spoken!', 'Ommm… freeze!',
  'The path is clear!', 'You’re wiser than me?!', 'Wisdom wins! 👑', 'You deserve respect.')

# 20 · Clockwork City
r('Cuckoo the Cuckoo Bird', 'Cuckoo!', 'On the sixth move of the round she cuckoos which half the number is in.',
  'Cuckoo! What time is it? 🕊️', 'Cuckoo! Hint: {k}.', 'Cuckoo — close!', 'You’re like clockwork!', 'Cuckoo! A win!', 'Cuck… I broke.')
r('Ring the Alarm Clock', 'Wake Up!', 'After your third move he rings — you’re so surprised that your next move is made for you: a wild throw.',
  'Time to get up! ⏰', 'RRRING! A wild throw!', 'Ringing louder!', 'You didn’t oversleep!', 'A victory bell!', 'My battery died…')
r('Sandy the Hourglass', 'Flip Over', 'After her fourth move she flips over and moves again right away.',
  'Time flows like sand ⏳', 'Flip — one more move!', 'The sand is almost out!', 'You’re faster than time!', 'Time to win!', 'Out of sand…')
r('Tick-Tock the Pocket Watch', 'Time’s Up', 'If you are “Very cold”, time is up: you skip a turn. Once per round.',
  'Tick-tock, tick-tock! ⌚', 'Tick-tock! Time’s up — skip a turn!', 'The hands are close!', 'You’re always on time!', 'Right on time!', 'I ran down…')
r('Cog the Gear', 'Caught in the Teeth', f'When she gets warmer, she catches your {K} in her teeth: it breaks. Once per round.',
  'I spin and never rust! ⚙️', 'Crunch! Your “⚡” broke!', 'The machine is working!', 'You figured out the machine!', 'A precise win!', 'A tooth broke…')
r('Wrench the Otter', 'Invention', f'With her first move she builds herself a {K}.',
  'I’m an inventor! 🔧', 'I invented a “⚡ +1 move” for me!', 'The blueprint is ready!', 'You’re an inventor too?!', 'The invention worked!', 'My machine broke…')
r('Tempo the Metronome', 'Keeping Time', 'On the second move of the round he keeps time and tells you: the number is more or less than that one.',
  'One-two, one-two! 🎼', 'Tick-tock! It’s {k}!', 'In rhythm — close!', 'You keep the beat!', 'A winning rhythm!', 'I lost the beat…')
r('Keywind the Tin Bird', 'Secret Key', 'Every third move she turns her key and learns whether the number is more or less than hers. She won’t tell you.',
  'Wind me up! 🔑', 'Click! The secret is unlocked!', 'Singing louder!', 'You out-sang me!', 'A wind-up win!', 'I ran down…')
r('Tinker the Beaver', 'The Clockmaker', f'When you are “Very hot” or closer, he fixes a clock and takes a {K} for himself. Once per round.',
  'I fix every clock in town! 🔍', 'Fixed it — a “⚡” for me!', 'The gears line up!', 'You know your clocks!', 'A masterful win!', 'The clocks stopped…')
b('The Clock Tower King', 'The Clock Strikes', 'On the fourth move of the round the clock strikes: time freezes for you — you skip a turn.',
  'Fast Clock', 'When he is “Very hot” or closer, he moves again right away. Once per round.',
  'Time is my kingdom! 🕰️', 'BONG! Time froze!', 'The clock runs fast — another move!',
  'The hands meet!', 'You’re faster than time?!', 'Time for victory! 👑', 'Your time has come!')

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
r('Bouncy the Balloon Dog', 'Pop!', f'When she is “Burning”, a balloon pops and she loses her {K}. Once per round.',
  'Woof! I’m made of balloons! 🎊', 'Bang! My “⚡” popped!', 'Woof — close!', 'Don’t poke me!', 'An inflatable win!', 'I deflated…')
r('Tippy the Llama', 'Spit!', 'When you get colder, she spits: you can’t see that move of yours. Once per round.',
  'I stand on a ball! 🦙', 'Ptooey! Your move is gone!', 'Balancing — close!', 'You balance better!', 'An acrobatic win!', 'I rolled off the ball…')
r('Barbell the Bull', 'The Strongman', f'When he is “Very hot” or closer, he takes your {K} for himself. Once per round.',
  'I’m the strongest in the circus! 🏋️', 'Hup! The “⚡” is mine!', 'Lifting up the win!', 'You’re stronger?!', 'A strong win!', 'That barbell is heavy…')
r('Cannonball the Ladybug', 'Out of the Cannon', 'On the second move of the round she flies out of a cannon: her next move is two in a row.',
  'Here I go! 🐞', 'Boom! Flying — two moves!', 'Flying to the goal!', 'You fly farther!', 'Right on target!', 'I overshot…')
r('Crunch the Popcorn', 'Pop!', 'On the fourth move of the round he pops and tells you whether the number is even or odd.',
  'Crunch-crunch! 🍿', 'Pop! The number is {k}!', 'Pop — hot!', 'Are you going to eat me?!', 'A crunchy win!', 'I spilled…')
r('Presto the Magic Hat', 'Vanishing Act', 'When he is “Warm” or closer, he vanishes in smoke: you can’t see his moves for the rest of the round. Once per round.',
  'Attention — a magic trick! 🎩', 'Hocus-pocus! I vanish!', 'The magic works!', 'You figured out the trick?!', 'A magical win!', 'The rabbit ran away…')
b('The Ringmaster', 'Allez-hop!', 'On the fifth move of the round he announces the next act: his next move is two in a row.',
  'The Ringmaster’s Eye', 'When you get warmer, he notices and learns whether the number is more or less than yours. He won’t tell you. Once per round.',
  'Ladies and gentlemen! The show begins! 🎪', 'Allez-hop! Two moves!', 'Aha! I see everything!',
  'The grand finale is close!', 'What talent!', 'The greatest show! 👑', 'A round of applause for the winner!')

# 23 · Crystal Caves
r('Sparky the Crystal Rock', 'Growing Crystals', f'If you are “Cold” or farther, he grows a crystal: a {K} for himself. Once per round.',
  'Crystals grow on me! 🪨', 'A crystal grew — a “⚡” for me!', 'Sparkling — close!', 'You found me!', 'A rocky win!', 'I crumbled…')
r('Rosie the Axolotl', 'Friendly', f'When he gets colder, he doesn’t mind and gives you a {K}. Once per round.',
  'Hi! I always smile 💗', 'Here you go — “⚡ +1 move”!', 'Oh, hot!', 'You almost guessed it!', 'A rosy win!', 'Well done!')
r('Amethyst the Geode', 'See-through', 'After your second move she knows which half the number is in. She won’t tell you.',
  'Take a look inside! 🔮', 'I see everything inside — I know the half!', 'The crystals shine!', 'You can see through me?!', 'An amethyst win!', 'I cracked…')
r('Helmet the Cave Fish', 'Helmet Lamp', 'When you are “Very hot” or closer, she shines her lamp: the number is even or odd. Once per round.',
  'I wear a helmet — I’m a miner! 🔦', 'I shine: the number is {k}!', 'Shining brighter!', 'You found the way!', 'A miner’s win!', 'My lamp went out…')
r('Drip the Stalactite', 'Drip!', 'After his second move a drop falls from him: you freeze and skip a turn.',
  'I hang upside down… 💧', 'Drip! Freeze!', 'Drip — close!', 'You sneaked under me!', 'A drippy win!', 'I broke off…')
r('Bling the Diamond', 'Dazzling Shine', 'When you are “Burning”, he sparkles so brightly that you can’t see your own moves for the rest of the round. Once per round.',
  'I’m the shiniest! 💠', 'Bling! You can’t see your moves!', 'Sparkling!', 'You’re not dazzled?!', 'A diamond win!', 'I lost my sparkle…')
r('Pattern the Moth', 'Wing Patterns', 'When he gets warmer, the pattern on his wings tells him whether the number is even or odd. He won’t tell you. Once per round.',
  'My wings glow 🕯️', 'The pattern told me — I know if it’s even!', 'Flying to the light!', 'You’re brighter than a flame!', 'A patterned win!', 'Flying away…')
r('Beam the Lantern', 'Lantern Light', 'On the third move of the round he lights up the cave and learns whether the number is even or odd. He won’t tell you.',
  'I light up the cave 🪔', 'Bright! I know if it’s even!', 'Shining on the goal!', 'You see in the dark?!', 'A bright win!', 'Out of oil…')
r('Pickaxe the Pika', 'Digging Nearby', 'When you get warmer, she tells you which half the number is in. Once per round.',
  'Squeak! I’m digging! ⛏️', 'Tap-tap with my pickaxe: {k}!', 'Squeak — close!', 'You dig faster!', 'Squeak, a win!', 'Squeak… I’m tired.')
b('The Crystal Queen', 'Crystal Trap', f'After your third move your {K} freezes into crystal and is gone.',
  'Crystal Chill', 'When she gets warmer, everything freezes: you freeze and skip a turn. Once per round.',
  'My caves shine forever 🔷', 'Crystal! Your “⚡” froze!', 'Freeze like crystal!',
  'The crystals whisper!', 'You’re not afraid of the cold?!', 'A crystal win! 👑', 'You shine brighter than all my crystals!')

# 24 · Winter Tale
r('Button the Snowman', 'Frosty', 'If you are “Cold” or farther, you freeze and skip a turn. Once per round.',
  'I’m made of snow! ☃️', 'Brrr! Frozen — skip a turn!', 'Oh, warm — I’m melting!', 'You’ll melt me!', 'A snowy win!', 'I melted…')
r('Nutty the Nutcracker', 'Crack!', f'After his second move he cracks your {K}.',
  'I crack nuts! 🥜', 'Crack! Your “⚡” is cracked!', 'Crack — close!', 'You’re a tough nut!', 'Crack — a win!', 'My teeth are tired…')
r('Tinsel the Fir Tree', 'Gift Under the Tree', f'After your first move there’s a gift under the tree: a {K} for you.',
  'I’m all decorated! 🎄', 'Under the tree — a “⚡ +1 move”!', 'My lights are on!', 'You found the gift!', 'A festive win!', 'Happy holidays!')
r('Cozy the Mitten', 'Warming Up', 'If you are “Cold” or farther, she skips her turn so you can warm up. Once per round.',
  'I’m nice and warm! 🧤', 'Warm up — I’ll skip a turn.', 'Warm — close!', 'You’re hot!', 'A warm win!', 'Warmed up? Well done!')
r('Robin the Bullfinch', 'A Little Song', 'After his third move he sings a hint song: the number is even or odd.',
  'I came to you in winter! 🎶', 'Tweet! The number is {k}!', 'Singing — hot!', 'You sing better!', 'A winning song!', 'Flying away…')
r('Glitter the Snow Globe', 'Snowfall', 'The third move of the round gets lost in the snowfall: you can’t see it.',
  'Shake me! 🫙', 'Shake — snowfall! You can’t see the move!', 'The snowflakes are swirling!', 'You see through the snow?!', 'A winter tale — and a win!', 'The snow settled…')
r('Bow the Gift Box', 'Surprise', f'After his third move he opens up: a {K} for you.',
  'What’s inside? 🎁', 'Surprise — “⚡ +1 move”!', 'My bow is coming undone!', 'You guessed what’s inside!', 'A gift of a win!', 'This gift is for you!')
r('Foam the Hot Cocoa', 'Hot Cocoa', f'When you get colder, he serves cocoa: a {K} for you and one for himself. Once per round.',
  'I warm you up! ☕', 'Hot cocoa — a “⚡” for everyone!', 'Hot!', 'You’re hotter than cocoa!', 'A tasty win!', 'I cooled down…')
r('Tufty the Lynx Kitten', 'Lynx Leap', f'When he is “Burning”, he leaps and snatches your {K}. Once per round.',
  'I have tufts on my ears! 🐈', 'Leap! The “⚡” is mine!', 'Sneaking — close!', 'You spotted me?!', 'A lynx win!', 'I’ll hide in a snowdrift…')
b('Father Frost', 'Hard Frost', 'On the sixth move of the round the frost bites: you freeze and skip a turn.',
  'Gifts for All', f'After his second move he hands out gifts: a {K} for you and one for himself.',
  'Happy New Year! Shall we play? 🎅', 'I’ll freeze you!', 'Gifts for everyone!',
  'Magic helps me!', 'Oh, how nimble!', 'A New Year’s win! 👑', 'You’ve earned a gift!')

# 25 · Rainbow Land
r('Mane the Baby Unicorn', 'Magic Horn', 'With her first move she touches the rainbow with her horn and learns whether the number is even or odd. She won’t tell you.',
  'I’m magical! 🦄', 'My horn knows if it’s even!', 'Magic is close!', 'You’re magical too?!', 'A magical win!', 'My magic ran out…')
r('Cloudy the Pegasus Foal', 'From Up High', 'When he is “Warm” or closer, he tells you from up high which half the number is in. Once per round.',
  'I fly in the clouds! ☁️', 'From up here I see: {k}!', 'Flying to the goal!', 'You fly higher!', 'A heavenly win!', 'I landed…')
r('Wobble the Rainbow Slime', 'Stuck!', 'After your third move you get stuck to the slime: you freeze and skip a turn.',
  'I stretch and shimmer! 🟣', 'Splat! Stuck — freeze!', 'Stretching to the goal!', 'Don’t squish me!', 'A sticky win!', 'I spread out…')
r('Seven the Rainbow', 'After the Rain', f'On the seventh move of the round a rainbow appears: a {K} for you.',
  'I come out after the rain! 🌦️', 'A rainbow — a “⚡ +1 move” for you!', 'My colors are brighter!', 'You shine!', 'A colorful win!', 'I faded away…')
r('Dab the Palette', 'Mixing Colors', 'After your first move she mixes colors and learns which half the number is in. She won’t tell you.',
  'I’ll paint everything! 🖌️', 'Mixed it — I know the half!', 'My colors are brighter!', 'You paint better!', 'A colorful win!', 'My paints dried up…')
r('Drizzle the Raindrop', 'Drip-drop', 'When she is “Very hot” or closer — drip-drop on your head: you skip your next turn. Once per round.',
  'I’m a little raindrop! ☔', 'Drip-drop! Skip a turn!', 'Drip — close!', 'You caught me!', 'Drip-drop — a win!', 'I dried up…')
r('Prism the Glass Prism', 'Splitting Light', 'When you are “Very hot” or closer, she splits the light and shows you: the number is more or less than yours. Once per round.',
  'Shine a light on me! 🔺', 'The beam shows: it’s {k}!', 'The light is gathering!', 'You glow too!', 'A rainbow win!', 'The light went out…')
r('Tails the Kite', 'Catching the Wind', f'On the second move of the round he catches the wind: a {K} for himself.',
  'Higher, higher, to the clouds! 🪁', 'Caught the wind — a “⚡” for me!', 'A tailwind!', 'You’re higher than me?!', 'A win in the sky!', 'My string snapped…')
r('Shimmer the Soap Bubble', 'Pop', 'With his fourth move he pops — splash in your eyes: you can’t see his moves for the rest of the round.',
  'I shimmer in every color! ⚪', 'Pop! Bubbles in your eyes!', 'Floating to the goal!', 'Don’t pop me!', 'A bubbly win!', 'Pop…')
b('The Rainbow Dragon', 'Rainbow Fire', 'When you are “Burning”, she breathes rainbow fire: you can’t see her moves for the rest of the round. Once per round.',
  'Rainbow Swap', 'When she is “Very hot” or closer, she swaps “⚡ +1 move” with you: yours go to her, hers go to you. Once per round.',
  'Rainbow Land is mine! 🐉', 'Rainbow fire!', 'Let’s swap “⚡”!',
  'The rainbow guides me!', 'You’re brighter than a rainbow?!', 'A rainbow win! 👑', 'You beat the dragon!')

assert len(H) == 100, len(H)
