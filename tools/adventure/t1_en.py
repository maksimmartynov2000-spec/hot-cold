WORLDS = ['Lemur Island', 'Frozen Arctic', 'Hot Desert', 'Happy Farm', 'Cloud City',
          'Flower Garden', 'Dino Valley', 'Pirate Island', 'Halloween Village', 'Royal Castle']
H = []
def r(n, t, d, hi, rule, luck, worry, win, lose):
    H.append(dict(n=n, t=t, d=d, hi=hi, rule=rule, luck=luck, worry=worry, win=win, lose=lose))
def b(n, a1t, a1d, a2t, a2d, hi, a1, a2, luck, worry, win, lose):
    H.append(dict(n=n, a1t=a1t, a1d=a1d, a2t=a2t, a2d=a2d, hi=hi, a1=a1, a2=a2, luck=luck, worry=worry, win=win, lose=lose))
K = '“⚡ +1 move”'

# 6 · Lemur Island
r('Lofty the Giraffe Weevil', 'Barrier', 'If you are “Cold” or farther, he lowers his long neck like a barrier: you skip a turn. Once per round.',
  'See my neck? Tallest on the island! 🦒', 'Barrier down — you skip a turn!', 'From up here the answer is easier to see!', 'Oh, you’re right at my neck!', 'I stretched all the way to victory!', 'Long neck, but the win is yours…')
r('Ringo the Ring-Tailed Lemur', 'Mango for All', 'When he is “Very hot” or closer, he’s so happy he shares a mango: a “⚡ +1 move” for you. Once per round.',
  'Hi! See my tail? It’s my flag! 🥭', 'Have a mango — a “⚡ +1 move”!', 'I smell ripe mango — very hot!', 'Hey, you’re sneaking up on my mango!', 'Tail up — I win!', 'Fine, the mango is yours today.')
r('Midnight the Aye-Aye', 'Midnight', 'After your first move, midnight falls for him: you can’t see his moves for the rest of the round.',
  'I only go out at night… 🌙', 'Midnight! You can’t see my moves!', 'I see best in the dark!', 'Can you see in the dark too?!', 'The night is mine!', 'It’s dawn already… you win.')
r('Hopper the Sifaka', 'Sifaka Dance', 'When you are “Very hot” or closer, he starts dancing: his next move is two in a row. Once per round.',
  'I don’t walk — I dance! 🕺', 'Hop-hop! Two moves in a row!', 'A few hops and I’m close!', 'Oh, you caught my rhythm!', 'Victory dance!', 'I danced myself out…')
r('Stash the Mouse Lemur', 'Tail Pantry', 'On his second move he pulls a “⚡ +1 move” out of his plump tail for himself.',
  'I’m small, but I save everything! 🐭', 'My tail pantry — a “⚡ +1 move” for me!', 'Ooh, I smell victory!', 'Don’t touch my stash!', 'My stash came in handy!', 'My stash ran out…')
r('Sunray the Radiated Tortoise', 'Wise Advice', 'After your first move she gives wise advice: whether the number is even or odd.',
  'I’m a hundred years old — I know a lot 🐢', 'Ancient wisdom: the number is {k}!', 'Slow and steady!', 'You’re faster than I thought!', 'Slow and steady wins the race!', 'Oh, youngsters… you win.')
r('Leafy the Leaf-Tailed Gecko', 'Playing Leaf', 'When you get warmer, he freezes like a dry leaf and skips his next turn. Once per round.',
  'Find me if you can! 🍂', 'I’m a leaf… just a leaf… skipping a turn.', 'I’m rustling right by the answer!', 'Don’t look at me, I’m a leaf!', 'Ha! You didn’t spot me!', 'Found me… I’m a bad leaf.')
r('Dozy the Tenrec', 'Hibernation', 'After your second move he yawns, falls asleep and skips a turn.',
  'Yaaawn… hi… 🥱', 'Zzz… wake me in a turn…', 'Even sleepy, I’m close!', 'I woke up — and you’re already close!', 'I won — back to sleep!', 'I overslept…')
r('Tommy the Tomato Frog', 'Loud Croak', 'When you are “Warm” or closer, she croaks so loudly you lose your train of thought: you only see the last two moves. Once per round.',
  'Ribbit! I’m round and red like a tomato! 🐸', 'RIBBIT! You only remember two moves!', 'Ribbit! Very hot!', 'Ribbit… you sneaked up on me!', 'Ribbit-ribbit — I win!', 'Ribbit… I’m deflated.')
b('Lord Fossa', 'Pounce', 'When you get warmer, he pounces and takes your “⚡ +1 move” for himself. Once per round.',
  'Prey', 'On the fourth move of the round he brings himself some prey: a “⚡ +1 move”.',
  'The whole island is mine! 👑', 'Pounce! Your “⚡” is mine!', 'Prey — a “⚡ +1 move” for me!',
  'I smell prey!', 'You’re a brave little critter!', 'The Lord of the island wins! 👑', 'Fine… the island is yours for today.')

# 7 · Frozen Arctic
r('Snowball the Polar Bear Cub', 'Snowball', 'After your first move he throws a snowball: your next move is made for you — a wild throw.',
  'Snowball fight? ⛄', 'Catch this snowball! A wild throw!', 'Cozy as my den!', 'Oh, you’re at my den!', 'A snowy win! ⛄', 'You melted me…')
r('Blizzard the Arctic Fox', 'Covering Tracks', 'When you get colder, he whips up a blizzard: you can’t see his moves for the rest of the round. Once per round.',
  'Shhh… hear the blizzard? 🌨️', 'Blizzard! My tracks are gone!', 'I smell prey under the snow!', 'You found my tracks?!', 'Blown away — the win is mine!', 'The blizzard stopped…')
r('Whiskers the Walrus', 'Gone Fishing', f'When he gets colder, he doesn’t mind — he goes ice fishing and catches a {K} for himself. Once per round.',
  'Ho-ho! A bite! 🎣', 'No fish — but I caught a “⚡”!', 'They’re biting!', 'Hey, don’t scare my fish!', 'What a catch!', 'It got away…')
r('Compass the Narwhal', 'Horn Compass', 'When he is “Very hot” or closer, his horn points: the number is more or less than his. Once per round.',
  'My horn always knows the way 🧭', 'My horn points: it’s {k}!', 'My horn is tingling — hot!', 'You’re swimming right to it!', 'The compass never fails!', 'My horn got lost…')
r('Flurry the Snowy Owl', 'Silent Flight', 'Every third move of hers is hidden from you.',
  'Hoo… I fly quietly 🌙', 'Hoo! This move is silent!', 'I see prey in the dark!', 'You spotted me?!', 'Quiet and precise! 🦉', 'I’m flying into the storm…')
r('Jingle the Reindeer', 'Jingle Bell', 'When you are “Warm” or closer, his bell rings: the number is more or less than yours. Once per round.',
  'Jingle-jingle! Hi! 🔔', 'Ding! It’s {k}!', 'My bell is ringing — hot!', 'Jingle-jingle, you’re almost there!', 'Ringing in the win!', 'My bell went quiet…')
r('Frost the Ermine', 'Hoarfrost', 'When you are “Burning”, she covers you in frost: you freeze and skip a turn. Once per round.',
  'I’m white as frost ❄️', 'Freeze! You’re covered in frost!', 'I feel warmth — I’m close!', 'You’re too hot for winter!', 'An icy win!', 'You melted my frost…')
r('Beaky the Puffin', 'The Catch', f'When you get colder, he catches a fish: a {K} for him. Once per round.',
  'I’m a puffin, and I’m clever! 🐟', 'You’re getting colder — I’ve got a fish! “⚡” for me!', 'The fish is right here!', 'Oh, you dive deeper than me!', 'A beak full of victory!', 'The fish swam away…')
r('Storm the Husky', 'Sled Team', 'After his second move he speeds up: his next move is two in a row.',
  'Awoo! Let’s go! 🛷', 'Full speed! Next move — twice!', 'Racing to the goal!', 'You run faster than my sled!', 'First to the finish! 🛷', 'My team is tired…')
b('The Snow Yeti', 'Snowstorm', 'After your second move he raises a storm: you can’t see his moves for the rest of the round. Once per round.',
  'Icy Roar', 'When you get warmer, he roars: you freeze and skip a turn. Once per round.',
  'Who’s stomping on my snow? ❄️', 'STO-O-ORM!', 'G-R-R! Freeze!',
  'I smell a warm guest!', 'You’re not afraid of the cold?!', 'The Arctic is mine! ❄️', 'You’re hotter than the sun!')

# 8 · Hot Desert
r('Dune the Camel', 'Spit', f'When you are “Very hot” or closer, he spits: your {K} is gone. Once per round.',
  'I can go a week without water! 🐪', 'Ptooey! Your “⚡” is gone!', 'The oasis is close!', 'Stay away from my hump!', 'The dunes are mine!', 'I dried up…')
r('Big Ears the Fennec Fox', 'Sharp Ears', 'After your second move he whispers which half the number is in.',
  'I hear everything! 👂', 'A little secret: {k}.', 'I hear it — very close!', 'You’re walking right to the answer!', 'My ears didn’t lie!', 'I missed it…')
r('Lookout the Meerkat', 'Binoculars', 'With every second move of his he looks through binoculars and tells you: the number is more or less than his.',
  'Lookout on duty! 🔭', 'Through my binoculars: it’s {k}!', 'Target on the horizon!', 'Alert! You’re close!', 'The lookout never sleeps!', 'I didn’t see it…')
r('Sting the Little Scorpion', 'Sting', 'When you get warmer, he stings with his tail: your next move is made for you — a wild throw. Once per round.',
  'I’m small but spiky 🦂', 'Sting! A wild throw!', 'The sand is hot — I’m close!', 'Careful, I’m spiky!', 'Spot on!', 'My tail drooped…')
r('Sunny the Gecko', 'Sunbathing', 'When he is “Warm” or closer, he stretches out in the sun and skips his next turn. Once per round.',
  'The sun is everything! 😎', 'So warm… I’ll sunbathe and skip a turn.', 'Hot — just how I like it!', 'You’re hotter than the sun!', 'A sunny win!', 'The sun went down…')
r('Rolly the Armadillo', 'Ball Roll', 'When he gets colder, he curls up and rolls: he moves again right away. Once per round.',
  'I’m like a ball! 🥎', 'Colder? I roll — and move again!', 'Rolling right to the goal!', 'You’re catching up!', 'Rolled to victory!', 'I rolled into a hole…')
r('Hop the Jerboa', 'Opposite', 'He jumps to the other end: he names the number that mirrors yours — if it can still be the secret.',
  'Hop-hop! 🔁', 'Hop — to the other end!', 'One more hop and I’ll get it!', 'You jump better than me!', 'A leap to victory!', 'I jumped too far…')
r('Shadow the Sand Cat', 'Behind the Dune', 'If you are “Warm” or closer, she covers your move with sand: you can’t see it. Once per round.',
  'Meow… you won’t spot me in the sand 🏜️', 'Shhh… your move is buried in sand!', 'I smell prey behind the dune!', 'Did you find my trail?!', 'Purr! The desert is mine!', 'Meow… the tracks led to you.')
r('Frilly the Lizard', 'Scary Frill', 'With her first move she opens her frill and scares you: you skip a turn.',
  'Watch me open my frill! 😱', 'Boo! Scared? Skip a turn!', 'My frill is trembling — close!', 'You’re not scared of me?!', 'I scared you and won!', 'My frill folded…')
b('The Sphinx Pharaoh', 'Sandstorm', 'After your third move he buries the tracks in sand: you only see the last two moves.',
  'Pyramid Curse', 'When you are “Burning”, your next move is made for you: a wild throw. Once per round.',
  'Solve my riddle, traveler 🏺', 'The sands bury your memory!', 'A curse! A wild throw!',
  'The desert stars are on my side!', 'You solved my riddle?!', 'The riddle stays mine! 🏺', 'You are wiser than the Sphinx!')

# 9 · Happy Farm
r('Buttercup the Cow', 'Fresh Milk', f'If you are “Cold” or farther, she treats you to milk: a {K} for you. Once per round.',
  'Moo! Hi! 🥛', 'Cold? Have some milk — “⚡ +1 move”!', 'Moo, warm!', 'Moo! You almost found it!', 'Moo! A win!', 'Moo… well done!')
r('Oinky the Piglet', 'Puddle', 'When you get colder, he jumps into a puddle: splash! You only see the last two moves. Once per round.',
  'Oink! I love puddles! 🐽', 'Splash! Oops, mud everywhere!', 'Oink! I smell a win!', 'Oink-oink, not so close!', 'Oink! I’m the best!', 'Oink… that got messy.')
r('Straw the Donkey', 'Stubborn', 'He stubbornly skips his third move.',
  'Hee-haw! No rush 🌾', 'Hee-haw! I won’t go — that’s that!', 'Hee-haw! I’m nearly there!', 'Hee-haw! You’re fast!', 'Hee-haw! A win!', 'Hee-haw… being stubborn didn’t help.')
r('Comb the Rooster', 'Cock-a-doodle-doo!', 'With his first move he crows to the whole farm: the number is more or less than his.',
  'Cock-a-doodle-doo! Wake up! 📣', 'Cock-a-doodle-doo! It’s {k}!', 'My comb is burning — hot!', 'Cluck! You almost got it!', 'Cock-a-doodle-doo — a win!', 'I lost my voice…')
r('Galosh the Duck', 'Round Puddles', 'She splashes on round numbers — ending in 0 — while there are many numbers left.',
  'Quack! Splish-splash! 🎯', 'Quack! I jump into a round puddle!', 'Quack-quack, warm!', 'Quack! You passed me!', 'Quack! A win!', 'Quack… I got wet.')
r('Braid the Pony', 'Gallop', 'When she is “Very hot” or closer, she breaks into a gallop: her next move is two in a row. Once per round.',
  'Neigh! I’m the fastest! 🐎', 'Neigh! Galloping — twice!', 'Galloping to victory!', 'You gallop faster!', 'A galloping win!', 'My hooves are tired…')
r('Shep the Sheepdog', 'Round-up', 'When you get colder, he herds you in: you skip a turn. Once per round.',
  'Woof! I’ll round everyone up! 🐕', 'Woof! Into the pen — skip a turn!', 'I smell it — close!', 'Woof! You’re running right to it!', 'Everyone’s in the pen — a win!', 'They all ran off…')
r('Fan the Turkey', 'Fan Tail', 'His second move is hidden behind his tail.',
  'Admire my tail! 🎴', 'Frrr! That move is behind my tail!', 'My tail is spreading — hot!', 'Are you peeking behind my tail?!', 'A beautiful win!', 'My tail drooped…')
r('Cheesy the Mouse', 'Cheese Nibble', f'If you are “Very cold”, he sneaks a bite: a {K} for him. Once per round.',
  'Squeak! The cheese is mine! 🧀', 'Squeak! A nibble — “⚡” for me!', 'I smell cheese — I’m close!', 'Squeak! You’re at my hole!', 'Squeak! All the cheese is mine!', 'Squeak… the cheese got away.')
b('General Goose', 'Pinch', 'When you are “Warm” or closer, he pinches and snatches your “⚡ +1 move” for himself. Once per round.',
  'Goose March', 'When he gets colder, he orders “March!”: his next move is two in a row. Once per round.',
  'Attention! I’m in command on this farm! 👑', 'Honk! Pinch — your “⚡” is mine!', 'Quick march! Two moves in a row!',
  'Honk! Target in sight!', 'Private, you’re too close!', 'Victory! Grain for everyone! 👑', 'Retreat… you win, honk.')

# 10 · Cloud City
r('Captain the Parrot Pilot', 'Copycat', 'When you are “Burning”, he repeats after you and lets it slip: the number is more or less than yours. Once per round.',
  'Hello! Hello! 🦜', 'Hot! Hot! It’s {k}!', 'Flying to the goal! Flying!', 'Close! Close!', 'Landing — a win!', 'I lost my course!')
r('Nectar the Hummingbird', 'Flutter-Flutter', 'With her first move she flutters twice: she moves again right away.',
  'I’m the tiniest and fastest! 🌺', 'Flutter-flutter — two moves!', 'I smell nectar — hot!', 'You’re faster than a hummingbird?!', 'The sweet nectar of victory!', 'Off to the flowers…')
r('Fifi the Flamingo', 'On One Leg', 'On the fifth move of the round she stands on one leg and skips her next turn.',
  'I’m the most graceful! 🦩', 'I’ll stand on one leg… skip a turn.', 'Oh, how hot!', 'Oh! You almost got it!', 'A graceful win!', 'Oh… I lost my balance.')
r('Skyhigh the Eaglet', 'Eagle Eye', 'From his second move he knows whether the number is even or odd. He won’t tell you.',
  'I see everything from above! 🦅', 'From up here I know if it’s even or not!', 'Target in sight!', 'You fly higher than me!', 'An eagle-eyed win!', 'A cloud got in the way…')
r('Dart the Swift', 'Whirlwind', 'A whirlwind sweeps away your third move: you can’t see it.',
  'Whoosh! I’m faster than the wind! 💨', 'Whoosh! Your move blew away!', 'Flying straight to the target!', 'Can you fly too?!', 'Whoosh — I win!', 'I didn’t make it…')
r('Breezy the Albatross', 'Tailwind', 'When he gets warmer, he catches a tailwind and moves again right away. Once per round.',
  'I cross the whole ocean without a flap of my wings 🌊', 'Tailwind! I move again!', 'The wind carries me to the answer!', 'Stormy… you’re close!', 'I got there first!', 'The wind has changed…')
r('Arrow the Swallow', 'A Letter', f'When you get colder, she brings you a letter with a {K}. Once per round.',
  'I have a letter for you! ✉️', 'Don’t be sad — here’s a “⚡ +1 move”!', 'Flying straight to the goal!', 'You’re faster than a swallow!', 'I got there first!', 'The letter was late…')
r('Glider the Flying Squirrel', 'Gliding', 'When she gets colder, she glides off: that move of hers is hidden.',
  'I fly without wings! 🪂', 'Whoosh — gliding unseen!', 'Gliding right on target!', 'You’re catching up!', 'Soft landing — a win!', 'I got caught on a branch…')
r('Postie the Stork', 'A Parcel', f'After your second move he brings a parcel: a {K} for you.',
  'Mail! Who’s the parcel for? 📦', 'A parcel for you — “⚡ +1 move”!', 'I’ve almost found the address!', 'You found the address yourself?!', 'Delivered — a win!', 'The parcel came back…')
b('The Thunderbird', 'Thunderclap', 'When you get warmer, thunder roars: you skip a turn. Once per round.',
  'Downpour', 'The fourth move of the round hides in the downpour: you can’t see it.',
  'The sky is my kingdom! 👑', 'KA-BOOM! You skip a turn!', 'Downpour! You can’t see this move!',
  'The storm is near!', 'You’re flying through my storm!', 'Thunder of victory! 👑', 'The storm has calmed… you win.')

# 11 · Flower Garden
r('Buzzy the Bee', 'Honey', f'When she is “Very hot” or closer, she stores honey: a {K} for her. Once per round.',
  'Bzzz! Hi! 🐝', 'Bzz! Honey — and a “⚡ +1 move” for me!', 'I smell a flower — hot!', 'Bzz! You’re at my hive!', 'A sweet win! 🍯', 'Bzz… flying away.')
r('Rainbow the Butterfly', 'Pollen Hint', 'When you are “Warm” or closer, she hints whether the number is even or odd. Once per round.',
  'I’ll color your game! 🌈', 'The pollen whispers: the number is {k}!', 'Fluttering to the answer!', 'You almost caught me!', 'A rainbow win!', 'Off to another flower…')
r('Bookworm the Caterpillar', 'Finished Reading!', 'On her third move she finishes reading the hint: she knows which half the number is in. She won’t tell you.',
  'I read everything! 📖', 'Done reading! Now I know the half!', 'The book says — close!', 'Did you read this book too?!', 'Knowledge is power!', 'I should have finished the book…')
r('Petal the Snail', 'Tiny Steps', 'She crawls in tiny steps near her last number. And she thinks for a long time.',
  'No rush… I’m coming 🐌', 'A little step… another step…', 'Slow and steady — hot!', 'You’re fast… and I’m a snail!', 'Slow and steady wins the race! 🐌', 'I didn’t make it…')
r('Fiddle the Grasshopper', 'Melody', 'On the third move of the round he plays a hint melody: even or odd.',
  'Listen to my violin! 🎻', 'Tra-la-la! The number is {k}!', 'The music gets louder — close!', 'You’re hitting all the notes!', 'A victory tune!', 'A string snapped…')
r('Propeller the Dragonfly', 'Helicopter', 'When she is “Warm” or closer, she zooms up and moves again right away. Once per round.',
  'Whirr! Let’s fly! 🚁', 'Warm! I zoom up — another move!', 'Hovering over the goal!', 'You fly faster!', 'Landing with a win!', 'My propeller is tired…')
r('Muscles the Ant', 'Confused', f'You switched on your {K} — the ant is so surprised he skips a turn. Once per round.',
  'I can lift anything! 💪', 'Whoa, a “⚡”! I’m confused — skipping a turn!', 'Carrying the win home!', 'You’re stronger than me?!', 'Strength is in not giving up!', 'That was heavy…')
r('Fluffy the Bumblebee', 'Sharing', f'When he gets warmer, he shares with you: a {K} for you. Once per round.',
  'Bzzz! Let’s be friends! 🌸', 'Warmer! I’ll share — have a “⚡”!', 'Bzz, the flower is close!', 'Bzz! You found my flower!', 'A fluffy win!', 'Bzz… well done.')
r('Digger the Mole', 'Tunnel', 'With his third move he digs a tunnel: he moves again right away.',
  'Digging, digging! 🕳️', 'A tunnel! Another move!', 'I smell a root — close!', 'You dig faster!', 'Dug my way to victory!', 'It caved in…')
b('The Queen Bee', 'Swarm', 'When you get warmer, a swarm flies in: you can’t see her moves for the rest of the round. Once per round.',
  'Honey Trap', 'When you are “Burning”, you get stuck in honey and skip a turn. Once per round.',
  'The whole garden serves me! 🐝', 'Swarm, go! Bzzz!', 'Stuck in honey? Skip a turn!',
  'The honey of victory is close!', 'How bravely you fly!', 'Queen of the garden! 🐝', 'You’re sweeter than honey!')

# 12 · Dino Valley
r('Horns the Triceratops', 'Ram', 'When he is “Burning”, he charges: you skip a turn. Once per round.',
  'Three horns — three wins! 🦏', 'Charge! Skip a turn!', 'My horns sense the goal!', 'You’re not afraid of horns?!', 'Charged to victory!', 'My horns got blunt…')
r('Spike the Stegosaurus', 'Spikes', f'You switch on your {K} — it pops on his spikes and is gone. Once per round.',
  'Careful, I’m spiky! 🦔', 'Ouch! Your “⚡” popped on my spikes!', 'My spikes are trembling — close!', 'You’re dodging my spikes!', 'A spiky win!', 'My spikes didn’t help…')
r('Wingy the Pterodactyl', 'Dive', 'When you get colder, he dives: his next move is two in a row. Once per round.',
  'I’m the king of the sky! 🪶', 'Dive! Next move — twice!', 'I see the goal from the sky!', 'You fly higher than me?!', 'A win from above!', 'I landed…')
r('Neck the Little Brontosaurus', 'Long Neck', 'He reaches up: after his third move he tells you which half the number is in.',
  'I can see everything from up here! 🦒', 'Reached it! I see: {k}.', 'My neck stretches to the answer!', 'You climbed so high!', 'Long neck — long win!', 'Couldn’t reach…')
r('Mace the Ankylosaurus', 'Club Tail', f'When you are “Burning”, he swings his club: your {K} is gone. Once per round.',
  'Boom-boom! I’m armored! 🔨', 'BOOM! Your “⚡” is smashed!', 'My club senses the goal!', 'You broke my armor?!', 'An armored win!', 'My armor cracked…')
r('Zippy the Raptor', 'Speedy', 'He thinks fast, and with his second move he moves again right away.',
  'I’m the fastest! 💨', 'Zoom! Another move!', 'Catching up with the answer!', 'You’re just as speedy!', 'A speedy win!', 'Out of breath…')
r('Shelly the Baby Dino', 'Hatching', 'He’s still hatching on his second move — and skips it.',
  'Knock-knock… I’m hatching! 🥚', 'Crack… still hatching, I’ll skip a turn!', 'Wow, I almost got it!', 'You’re big and clever!', 'Small but mighty!', 'I’ll hide in my shell…')
r('Trumpet the Parasaurolophus', 'Trumpet', 'If you are “Cold” or farther, he trumpets: the number is more or less than yours.',
  'Toot-toot! Hear my trumpet! 🎺', 'Toot! It’s {k}!', 'My trumpet sounds — warm!', 'Toot! You’re almost there!', 'A victory march!', 'My trumpet went hoarse…')
r('Diver the Plesiosaur', 'Dive Under', 'When he is “Warm” or closer, he dives: that move of his is hidden. Once per round.',
  'Splash! I’m from the lake! 🌊', 'Dove under — the move is underwater!', 'I smell fish — close!', 'You dive deeper?!', 'A win from the deep!', 'Came up empty…')
b('King T-Rex', 'Stomp', 'When he is “Very hot” or closer, he stomps: you freeze in fear and skip a turn. Once per round.',
  'Royal Stride', 'After his fourth move he takes a royal stride: his next move is two in a row.',
  'I’m the king of dinosaurs! ROAR! 🦖', 'STOMP-STOMP! Freeze!', 'A royal stride — twice!',
  'The king smells prey!', 'You’re not afraid of the king?!', 'The valley is mine! 🦖', 'You beat the king!')

# 13 · Pirate Island
r('Cabin Girl the Seagull', 'Loudmouth', 'Every time she gets colder, she shouts: the number is more or less than hers.',
  'Cabin girl on deck! ⚓', 'Squawk! It’s {k}!', 'Land! Land is close!', 'Squawk! You found the treasure?!', 'The cabin girl is a hero!', 'Squa-a-awk… overboard.')
r('Buccaneer the Pug', 'Boarding', f'When you are “Very hot” or closer, he boards your ship and takes your {K}. Once per round.',
  'Woof! All hands on deck! 🏴‍☠️', 'Board her! Your “⚡” is mine!', 'I smell treasure!', 'Woof! You’re at my chest!', 'The loot is mine!', 'I surrender, captain…')
r('Doubloon the Parrot', 'Pieces of Eight!', 'When you are “Burning”, he squawks “Pieces of eight!” and tosses you a coin: a “⚡ +1 move”. Once per round.',
  'Pieces of eight! Ahoy, deckhand! 🦜', 'Pieces of eight! Catch a “⚡ +1 move”!', 'Polly smells treasure!', 'The deckhand has almost found the treasure!', 'The doubloons are mine!', 'The doubloons… are yours.')
r('Sparkle the Starfish', 'Guiding Star', 'At the start of the round she tells you whether the number is even or odd.',
  'I’ll show you the way! ⭐', 'Guiding star: the number is {k}!', 'Right on course!', 'You’re sailing by the stars!', 'A starry win!', 'My star went out…')
r('Bosun the Rat', 'Whistle', 'With his third move he blows his whistle: you freeze and skip a turn.',
  'Swab the deck! 📯', 'Tweeeet! Freeze! Skip a turn!', 'Course set for the treasure!', 'You’re faster than the whole crew!', 'Steady as she goes — a win!', 'My whistle fell overboard…')
r('Pincher the Lobster', 'Claw', 'When you get warmer, he grabs your move with his claw: you can’t see it. Once per round.',
  'Snip-snap! 🦞', 'Snap! Your move is in my claw!', 'My claws sense the goal!', 'You sneaked up on my claws!', 'I grabbed the win!', 'My claws let go…')
r('Navigator the Pelican', 'The Map', 'After his second move he unrolls his map: he tells you which half the number is in.',
  'Navigator on the bridge! 🗺️', 'The map shows: {k}.', 'Course straight to the treasure!', 'You have a map too?!', 'The map led to victory!', 'My map got wet…')
r('Tricorn the Cat', 'Treasure Hoard', f'When you get colder, she drags your {K} into her chest. Once per round.',
  'Meow! Where’s the treasure? 🗝️', 'Purr! Your “⚡” goes in my chest!', 'Purr, I smell fish!', 'Meow! You’re at my treasure!', 'Purr! The loot is mine!', 'Meow… I let it slip.')
r('Cannon the Iguana', 'Broadside', 'When she is “Burning” — cannon fire: your next move is made for you — a wild throw. Once per round.',
  'Cannon loaded! 💥', 'BANG! A wild throw!', 'Target in my sights!', 'You dodged the cannonball!', 'A perfect shot!', 'My powder got wet…')
b('Captain Tiger', 'Boarding Party!', f'When you are “Burning”, he takes your {K} for himself. Once per round.',
  'Cannon Volley', 'On the fifth move of the round — every cannon fires: you skip a turn.',
  'This island is mine! Grrr! 🏴‍☠️', 'Board them! The “⚡” is mine!', 'Fire! Skip a turn!',
  'The treasure is almost mine!', 'A brave pirate!', 'The island is mine! 🐯', 'You’re the best captain!')

# 14 · Halloween Village
r('Lantern the Ghost', 'Through Walls', 'When he is “Very hot” or closer, he slips through a wall: you can’t see that move. Once per round.',
  'Boo! Don’t worry, I’m friendly 👻', 'Oooh! This move goes through the wall!', 'My lantern glows brighter — close!', 'You can see me?!', 'Oooh! A win!', 'Fading away…')
r('Pointer the Gargoyle', 'Stone Finger', 'After your second move she points with her stone finger: the number is more or less than yours.',
  'Don’t be scared — I’m stone, but kind 🗿', 'My finger points: it’s {k}!', 'I sense the way like stone senses rain!', 'You’re on the right path!', 'Stone is strong — the win is mine!', 'I’m petrified with surprise…')
r('Witchy the Cat', 'Broomstick', 'When she is “Burning”, she flies off on her broom and moves again right away. Once per round.',
  'Meow! I do magic 🧹', 'Meow! On my broom — another move!', 'The magic works!', 'Meow! You do magic too?!', 'A magical win!', 'My broom broke…')
r('Bandage the Mummy', 'Bandages', 'After your third move she wraps you in bandages: you skip a turn.',
  'Mmm… I’m from the pyramid 🩹', 'Mmm! All wrapped up — skip a turn!', 'Mmm… warm…', 'Don’t unwrap me!', 'Mmm! A win!', 'I came unwrapped…')
r('Stitches the Little Monster', 'Zap', 'With his second move he zaps: your next move is made for you — a wild throw.',
  'I’m made of bits and pieces! 🔌', 'Bzzzt! Zap! A wild throw!', 'It’s sparking — hot!', 'Oh, you short-circuited me!', 'A charged-up win!', 'My battery died…')
r('Top Hat the Spider', 'Web', 'If you are “Warm” or closer, you get tangled in the web and skip a turn. Once per round.',
  'Welcome to my little web! 🕸️', 'Caught in my web! Skip a turn!', 'My web is shaking — close!', 'You’re tearing my web!', 'An elegant win!', 'My web broke…')
r('Caw the Raven', 'Caw!', 'When you get colder, he caws in your ear: your next move is made for you — a wild throw. Once per round.',
  'Caw! I’m the king of the night! 😵', 'CAW! A wild throw!', 'Caw! Close!', 'Caw-caw! You almost got it!', 'Caw — a win!', 'Caw… flying away.')
r('Howly the Werewolf Pup', 'Full Moon', 'On the sixth move of the round the moon rises: his next move is two in a row.',
  'Awoo! The moon is coming! 🌕', 'Full moon! Awoo! Two moves!', 'My nose smells the goal!', 'You howl better than me!', 'Awoo! A win!', 'The moon hid…')
r('Sneaky the Goblin', 'Trip-Up', 'When he gets warmer, he trips you up: you skip a turn. Once per round.',
  'Hee-hee! Zip — and here I am! 👀', 'Oops! Tripped you — you skip a turn!', 'Hee-hee, I’m almost there!', 'Oh, you spotted me!', 'Hee-hee! Outsmarted you!', 'Zip… and I’m off. You win.')
b('Count Fangs', 'Bat Swarm', 'When he is “Burning”, he releases his bats: you can’t see his moves for the rest of the round. Once per round.',
  'Fang', f'When you get warmer, he bites your {K}: it’s gone. Once per round.',
  'Welcome to my castle… 🦇', 'Fly, my bats!', 'Chomp! Your “⚡” is gone!',
  'I smell… something warm!', 'How did you find my castle?!', 'The night is mine! 🦇', 'Dawn… I lost.')

# 15 · Royal Castle
r('Prince Froggy', 'Kind Prince', 'If you are “Very cold”, he feels sorry for you: you move again right away. Once per round.',
  'Ribbit! I’m an enchanted prince 🐸', 'Ribbit! Don’t be sad — have another go!', 'Ribbit! My crown senses the goal!', 'Ribbit! You almost broke my spell!', 'Ribbit — a royal win!', 'Ribbit… play again?')
r('Princess the Corgi', 'Royal Order', 'After your first move she orders you to wait: you skip your next turn.',
  'Woof! Bow to the princess! 📜', 'I order you: skip a turn!', 'The princess smells victory!', 'You’re a brave subject!', 'A royal win!', 'Fine, you’ve earned a reward!')
r('Jester the Ferret', 'Laughing Fit', 'On the third move of the round he makes you laugh so hard that your next move is made for you — a wild throw.',
  'Hee-hee! I’ll make you laugh! 🃏', 'Ha-ha! Laughing too hard — a wild throw!', 'Hee-hee, hot!', 'You’re not laughing?!', 'The jester wins — now that’s funny!', 'Ha… the joke flopped.')
r('Ballerina the Swan', 'Pirouette', 'When she gets warmer, she does a pirouette: that move of hers is hidden. Once per round.',
  'I dance better than anyone! 🩰', 'A pirouette — and the move is gone!', 'The dance leads to the goal!', 'You dance just as lightly!', 'A dance of victory!', 'I tripped…')
r('Herald the Peacock', 'Herald', 'With his first move he trumpets to the whole castle which half the number is in.',
  'Attention! Hear ye, hear ye! 🦚', 'Hear ye: {k}!', 'Trumpeting victory!', 'You’re louder than the herald!', 'I proclaim victory!', 'I lost my voice…')
r('Feather the Griffin', 'Talons', f'When he gets warmer, he carries off your {K} in his talons. Once per round.',
  'I’m a griffin — strong and fast! 🦅', 'Warmer! Your “⚡” is in my talons!', 'I see the goal from the sky!', 'You’re braver than a lion!', 'A griffin’s win!', 'Flying off to the mountains…')
r('Musketeer the Beagle', 'Lunge', f'When he is “Very hot” or closer, he lunges: your {K} is gone. Once per round.',
  'All for one! 🤺', 'Lunge! Your “⚡” is gone!', 'My sword senses the goal!', 'En garde!', 'For the king — a win!', 'Touché… you win.')
r('Brave the Badger Knight', 'The Knight Goes First', 'Always moves first, and with his second move he honestly tells you whether the number is even or odd.',
  'A knight always goes first! 🛡️', 'A knight’s word: the number is {k}!', 'Forward, to victory!', 'A worthy opponent!', 'Victory to the knight!', 'I lower my shield — you win.')
r('Bridge the Troll', 'Bridge Toll', f'After your second move he takes a toll for the bridge: your {K} goes to him.',
  'Want to cross my bridge? Pay up! 🌉', 'Bridge toll! The “⚡” is mine!', 'The troll smells victory!', 'You’re trickier than a troll!', 'The bridge is mine!', 'Go ahead… you win.')
b('The Lion King', 'Royal Roar', 'When you are “Burning”, he roars so loud you only see the last two moves. Once per round.',
  'The Crown', 'When he is “Warm” or closer, his next move is two in a row. Once per round.',
  'I am the king of this castle! 🦁', 'R-R-ROAR! Forgot everything?', 'My crown shines — two moves!',
  'The kingdom is almost mine!', 'You’re braver than all my knights!', 'Long live the king! 🦁', 'You are worthy of the crown!')

assert len(H) == 100, len(H)
