// Bundled recipe dataset — used as fallback when TheMealDB is unreachable
// or as the primary source if OFFLINE_MODE = true
const BUNDLED_RECIPES = [
  // ── Indian ──────────────────────────────────────────────────────
  {
    id:"b001", name:"Butter Chicken", cuisine:"Indian", category:"Chicken",
    thumbnail:"",
    description:"Tender chicken pieces simmered in a velvety tomato-cream sauce spiced with garam masala.",
    ingredients:["500g Chicken thighs","2 tbsp Butter","1 cup Tomato purée","1/2 cup Heavy cream","2 cloves Garlic","1 tsp Garam masala","1 tsp Turmeric","1 tsp Cumin","Salt to taste"],
    instructions:["Marinate chicken in yogurt, turmeric and salt for 30 min.","Sear chicken in butter until golden, set aside.","Sauté garlic, add tomato purée, simmer 10 min.","Stir in cream and garam masala.","Return chicken, simmer 15 min until cooked through.","Serve with basmati rice or naan."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b002", name:"Dal Tadka", cuisine:"Indian", category:"Vegan",
    thumbnail:"",
    description:"Comforting yellow lentils tempered with cumin, garlic and chillies.",
    ingredients:["1 cup Yellow lentils","1 Onion, chopped","2 Tomatoes, diced","3 cloves Garlic","1 tsp Cumin seeds","1 tsp Turmeric","2 tbsp Oil","Salt to taste","Fresh coriander"],
    instructions:["Boil lentils with turmeric and salt until soft.","Heat oil, add cumin seeds until they splutter.","Add garlic, onion; cook until golden.","Add tomatoes, cook 5 min.","Pour over lentils, stir.","Garnish with coriander and serve with rice."],
    difficulty:"Easy", youtube:"", source:""
  },
  {
    id:"b003", name:"Palak Paneer", cuisine:"Indian", category:"Vegetarian",
    thumbnail:"",
    description:"Fresh cottage cheese cubes in a vibrant, spiced spinach gravy.",
    ingredients:["250g Paneer, cubed","500g Spinach","1 Onion","2 Tomatoes","2 cloves Garlic","1 tsp Ginger","1 tsp Cumin","1 tsp Garam masala","2 tbsp Oil","Salt to taste"],
    instructions:["Blanch spinach, blend to purée.","Fry paneer cubes until golden, set aside.","Sauté onion, garlic, ginger until soft.","Add tomatoes and spices, cook 5 min.","Add spinach purée, simmer 8 min.","Fold in paneer and serve."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b004", name:"Chicken Biryani", cuisine:"Indian", category:"Chicken",
    thumbnail:"",
    description:"Fragrant long-grain rice layered with spiced chicken and caramelised onions.",
    ingredients:["500g Chicken pieces","2 cups Basmati rice","2 Onions, sliced","1 cup Yogurt","1 tsp Turmeric","1 tsp Garam masala","1 tsp Cumin","4 Cardamom pods","2 Bay leaves","3 tbsp Ghee","Salt to taste"],
    instructions:["Marinate chicken in yogurt and spices for 1 hr.","Soak rice 30 min, parboil and drain.","Fry onions until crispy brown.","Cook marinated chicken until 80% done.","Layer rice over chicken, top with fried onions and ghee.","Seal pot and steam on low heat 20 min."],
    difficulty:"Hard", youtube:"", source:""
  },
  {
    id:"b005", name:"Chana Masala", cuisine:"Indian", category:"Vegan",
    thumbnail:"",
    description:"Hearty chickpeas braised in a tangy, spiced tomato-onion sauce.",
    ingredients:["2 cups Chickpeas, cooked","2 Onions","3 Tomatoes","3 cloves Garlic","1 tsp Ginger","1 tsp Cumin","1 tsp Coriander powder","1 tsp Turmeric","1 tsp Chilli powder","2 tbsp Oil","Salt to taste"],
    instructions:["Sauté onions until golden.","Add garlic and ginger, cook 2 min.","Add tomatoes and all spices, cook 10 min.","Add chickpeas and 1/2 cup water.","Simmer 15 min until sauce thickens.","Serve with rice or bhatura."],
    difficulty:"Easy", youtube:"", source:""
  },
  // ── Chinese ─────────────────────────────────────────────────────
  {
    id:"b010", name:"Kung Pao Chicken", cuisine:"Chinese", category:"Chicken",
    thumbnail:"",
    description:"Stir-fried diced chicken with peanuts, dried chillies and Sichuan peppercorns.",
    ingredients:["400g Chicken breast, diced","1/2 cup Peanuts","4 Dried red chillies","2 cloves Garlic","1 tsp Ginger","2 tbsp Soy sauce","1 tbsp Vinegar","1 tsp Sugar","1 tbsp Cornstarch","2 tbsp Oil"],
    instructions:["Marinate chicken with soy sauce and cornstarch.","Fry peanuts until golden, set aside.","Stir-fry chillies and garlic in hot oil.","Add chicken, cook until browned.","Add soy sauce, vinegar and sugar sauce.","Toss in peanuts and serve with rice."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b011", name:"Fried Rice", cuisine:"Chinese", category:"Rice",
    thumbnail:"",
    description:"Classic day-old rice stir-fried with egg, vegetables and soy sauce.",
    ingredients:["3 cups Cooked rice (day old)","3 Eggs","1 cup Peas","1 Carrot, diced","3 cloves Garlic","3 tbsp Soy sauce","2 tbsp Sesame oil","2 Spring onions","2 tbsp Oil"],
    instructions:["Heat oil, fry garlic until fragrant.","Push aside, scramble eggs.","Add carrot and peas, cook 3 min.","Add rice, break up clumps.","Pour soy sauce and sesame oil, toss.","Garnish with spring onions."],
    difficulty:"Easy", youtube:"", source:""
  },
  {
    id:"b012", name:"Sweet and Sour Pork", cuisine:"Chinese", category:"Pork",
    thumbnail:"",
    description:"Crispy pork pieces tossed in a vibrant sweet-sour sauce with peppers and pineapple.",
    ingredients:["400g Pork shoulder, cubed","1 Bell pepper","1/2 cup Pineapple chunks","3 tbsp Ketchup","2 tbsp Vinegar","2 tbsp Sugar","1 tbsp Soy sauce","1 cup Cornstarch","Oil for frying"],
    instructions:["Coat pork in cornstarch and deep fry until crispy.","Mix ketchup, vinegar, sugar and soy sauce.","Stir-fry pepper and pineapple.","Add sauce, bring to boil.","Toss in pork and coat evenly.","Serve immediately with steamed rice."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b013", name:"Mapo Tofu", cuisine:"Chinese", category:"Vegan",
    thumbnail:"",
    description:"Silken tofu in a spicy, fragrant sauce of chilli bean paste, garlic and Sichuan pepper.",
    ingredients:["400g Silken tofu","200g Pork mince (optional)","2 tbsp Chilli bean paste","3 cloves Garlic","1 tsp Ginger","1 tbsp Soy sauce","1 tsp Sichuan pepper","1 cup Chicken stock","2 tbsp Oil","Spring onions"],
    instructions:["Fry garlic and ginger in oil.","Add chilli bean paste, fry 2 min.","Add pork mince if using, brown it.","Pour in stock, bring to simmer.","Gently add tofu cubes, simmer 5 min.","Finish with soy sauce and Sichuan pepper."],
    difficulty:"Medium", youtube:"", source:""
  },
  // ── Iranian / Turkish ───────────────────────────────────────────
  {
    id:"b020", name:"Ghormeh Sabzi", cuisine:"Iranian", category:"Lamb",
    thumbnail:"",
    description:"A deeply flavoured Persian herb stew with lamb, dried limes and kidney beans.",
    ingredients:["400g Lamb, cubed","2 cups Mixed herbs (parsley, spinach, chives)","1 can Kidney beans","4 Dried limes","1 Onion","1 tsp Turmeric","3 tbsp Oil","Salt & pepper"],
    instructions:["Fry onion until golden with turmeric.","Add lamb, brown on all sides.","Add herbs, sauté 5 min until dark green.","Add kidney beans, dried limes and water to cover.","Simmer covered 1.5 hours until lamb is tender.","Adjust seasoning and serve with rice."],
    difficulty:"Hard", youtube:"", source:""
  },
  {
    id:"b021", name:"Fesenjan", cuisine:"Iranian", category:"Chicken",
    thumbnail:"",
    description:"Rich Persian chicken stew with pomegranate molasses and walnut paste.",
    ingredients:["4 Chicken thighs","1 cup Walnuts, ground","3 tbsp Pomegranate molasses","1 Onion","1 tsp Cinnamon","1 tsp Cardamom","2 tbsp Oil","Salt to taste"],
    instructions:["Fry onion until golden.","Add chicken, brown on both sides.","Add ground walnuts, stir 2 min.","Mix pomegranate molasses with 1 cup water, pour in.","Add spices, simmer covered 45 min.","Adjust sweet-sour balance and serve with rice."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b022", name:"Turkish Lentil Soup", cuisine:"Iranian", category:"Soup",
    thumbnail:"",
    description:"Velvety red lentil soup with cumin, paprika and a drizzle of chilli butter.",
    ingredients:["1 cup Red lentils","1 Onion","2 Tomatoes","2 cloves Garlic","1 tsp Cumin","1 tsp Paprika","3 tbsp Butter","Salt & pepper","Lemon for serving"],
    instructions:["Sauté onion and garlic in 1 tbsp butter.","Add tomatoes, cook 3 min.","Add lentils and 4 cups water.","Simmer 25 min until lentils are soft.","Blend until smooth.","Fry remaining butter with paprika, drizzle on top."],
    difficulty:"Easy", youtube:"", source:""
  },
  {
    id:"b023", name:"Adana Kebab", cuisine:"Iranian", category:"Lamb",
    thumbnail:"",
    description:"Spiced minced lamb kebabs grilled on skewers with a smoky char.",
    ingredients:["500g Lamb mince","1 Onion, grated","3 cloves Garlic","1 tsp Cumin","1 tsp Paprika","1/2 tsp Chilli flakes","Salt & pepper","Flatbread to serve"],
    instructions:["Mix all ingredients thoroughly.","Shape into long sausages on flat skewers.","Grill on high heat 4-5 min per side.","Rest 2 min before serving.","Serve on flatbread with tomatoes and parsley."],
    difficulty:"Medium", youtube:"", source:""
  },
  // ── Western / British ───────────────────────────────────────────
  {
    id:"b030", name:"Classic Roast Chicken", cuisine:"Western", category:"Chicken",
    thumbnail:"",
    description:"Whole roast chicken with herb butter, crispy skin and golden pan juices.",
    ingredients:["1 whole Chicken (1.5kg)","4 tbsp Butter","3 cloves Garlic","2 sprigs Rosemary","2 sprigs Thyme","1 Lemon, halved","Olive oil","Salt & pepper"],
    instructions:["Preheat oven to 200°C.","Mix butter with garlic, herbs and zest.","Rub under skin and over chicken.","Stuff cavity with lemon.","Roast 1 hr 20 min, basting every 30 min.","Rest 15 min before carving."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b031", name:"Beef Stew", cuisine:"Western", category:"Beef",
    thumbnail:"",
    description:"Slow-cooked chunks of beef with root vegetables in a rich red wine gravy.",
    ingredients:["600g Beef chuck, cubed","3 Carrots, sliced","3 Potatoes, cubed","2 Onions","3 cloves Garlic","2 cups Beef stock","1 cup Red wine","2 tbsp Flour","2 tbsp Oil","Thyme, bay leaf"],
    instructions:["Brown beef in batches, set aside.","Sauté onions and garlic.","Sprinkle flour, stir 1 min.","Add wine and stock, bring to boil.","Return beef, add vegetables and herbs.","Simmer covered 1.5 hours until tender."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b032", name:"Fish and Chips", cuisine:"Western", category:"Fish",
    thumbnail:"",
    description:"Beer-battered cod fillet with thick-cut chips and mushy peas.",
    ingredients:["2 Cod fillets","4 Potatoes, cut into chips","1 cup Flour","1/2 cup Beer","1 Egg","Oil for frying","Salt & vinegar to serve"],
    instructions:["Parboil chips 5 min, drain and dry.","Make batter from flour, beer and egg.","Fry chips in oil until golden and crispy.","Dip cod in batter, fry 5-6 min until golden.","Drain and season with salt.","Serve with vinegar and mushy peas."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b033", name:"Shepherd's Pie", cuisine:"Western", category:"Lamb",
    thumbnail:"",
    description:"Minced lamb and vegetables topped with creamy mashed potato and baked golden.",
    ingredients:["400g Lamb mince","3 Potatoes","1 Onion","2 Carrots","2 cloves Garlic","1 cup Lamb stock","2 tbsp Tomato paste","1 tbsp Worcestershire sauce","3 tbsp Butter","Milk"],
    instructions:["Cook lamb mince with onion, garlic and carrot.","Add tomato paste, Worcestershire and stock.","Simmer 20 min until thick.","Make creamy mash with butter and milk.","Spoon meat into dish, top with mash.","Bake at 190°C for 25 min until golden."],
    difficulty:"Medium", youtube:"", source:""
  },
  // ── Italian ─────────────────────────────────────────────────────
  {
    id:"b040", name:"Spaghetti Carbonara", cuisine:"Italian", category:"Pasta",
    thumbnail:"",
    description:"Silky pasta with crispy guanciale, egg yolk and Pecorino Romano.",
    ingredients:["400g Spaghetti","150g Pancetta or guanciale","4 Egg yolks","100g Pecorino Romano","Black pepper","Salt"],
    instructions:["Cook spaghetti in salted water.","Fry pancetta until crispy.","Whisk egg yolks with cheese and pepper.","Reserve 1 cup pasta water, drain pasta.","Off heat, mix pasta with pancetta.","Add egg mixture, toss with pasta water until creamy."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b041", name:"Margherita Pizza", cuisine:"Italian", category:"Pizza",
    thumbnail:"",
    description:"Thin Neapolitan pizza with San Marzano tomato sauce, fresh mozzarella and basil.",
    ingredients:["250g Pizza dough","1/2 cup Tomato sauce","150g Fresh mozzarella","Basil leaves","Olive oil","Salt"],
    instructions:["Stretch dough to thin circle.","Spread tomato sauce.","Top with torn mozzarella.","Bake at 250°C for 10-12 min.","Drizzle olive oil, add fresh basil.","Serve immediately."],
    difficulty:"Easy", youtube:"", source:""
  },
  {
    id:"b042", name:"Risotto ai Funghi", cuisine:"Italian", category:"Vegetarian",
    thumbnail:"",
    description:"Creamy Arborio rice with porcini mushrooms, white wine and Parmesan.",
    ingredients:["300g Arborio rice","200g Mixed mushrooms","1 Onion","3 cloves Garlic","1 cup White wine","1L Vegetable stock","50g Parmesan","2 tbsp Butter","Olive oil","Thyme"],
    instructions:["Sauté onion and garlic in oil.","Add mushrooms, cook until golden.","Add rice, toast 1 min.","Add wine, stir until absorbed.","Add warm stock ladle by ladle, stirring constantly.","Stir in butter and Parmesan to finish."],
    difficulty:"Medium", youtube:"", source:""
  },
  // ── Mexican ─────────────────────────────────────────────────────
  {
    id:"b050", name:"Chicken Tacos", cuisine:"Mexican", category:"Chicken",
    thumbnail:"",
    description:"Smoky spiced chicken in warm corn tortillas with avocado, salsa and lime.",
    ingredients:["400g Chicken breast","8 Corn tortillas","1 Avocado","1 Lime","1 Tomato","1 tsp Cumin","1 tsp Paprika","1 tsp Chilli powder","Olive oil","Salt"],
    instructions:["Season chicken with cumin, paprika, chilli and salt.","Cook chicken in oil 6 min per side.","Rest and slice into strips.","Warm tortillas in dry pan.","Mash avocado with lime juice.","Assemble tacos with chicken, avocado and salsa."],
    difficulty:"Easy", youtube:"", source:""
  },
  {
    id:"b051", name:"Black Bean Soup", cuisine:"Mexican", category:"Vegan",
    thumbnail:"",
    description:"Smoky, hearty black bean soup with cumin, chipotle and a dollop of sour cream.",
    ingredients:["2 cans Black beans","1 Onion","4 cloves Garlic","1 tsp Cumin","1 tsp Chipotle powder","2 cups Vegetable stock","1 Lime","2 tbsp Oil","Salt"],
    instructions:["Sauté onion and garlic until soft.","Add cumin and chipotle, stir 1 min.","Add beans and stock, simmer 20 min.","Blend half the soup for a chunky texture.","Adjust seasoning, finish with lime juice.","Serve with sour cream and tortilla chips."],
    difficulty:"Easy", youtube:"", source:""
  },
  // ── Thai ────────────────────────────────────────────────────────
  {
    id:"b060", name:"Pad Thai", cuisine:"Thai", category:"Noodle",
    thumbnail:"",
    description:"Stir-fried rice noodles with egg, bean sprouts, spring onions and crushed peanuts.",
    ingredients:["200g Rice noodles","2 Eggs","100g Tofu or prawns","2 tbsp Fish sauce","1 tbsp Tamarind paste","1 tbsp Sugar","Bean sprouts","Spring onions","Peanuts","Lime wedges","Oil"],
    instructions:["Soak noodles in warm water 20 min.","Fry tofu until golden, push aside.","Scramble eggs.","Add noodles, fish sauce, tamarind and sugar.","Toss in bean sprouts and spring onions.","Serve with peanuts and lime."],
    difficulty:"Medium", youtube:"", source:""
  },
  {
    id:"b061", name:"Green Curry", cuisine:"Thai", category:"Chicken",
    thumbnail:"",
    description:"Aromatic Thai green curry with chicken, coconut milk, Thai basil and vegetables.",
    ingredients:["400g Chicken breast","400ml Coconut milk","3 tbsp Green curry paste","1 Zucchini","1 Bell pepper","1 tbsp Fish sauce","1 tsp Sugar","Thai basil","Lime leaves","Oil"],
    instructions:["Fry green curry paste in oil 2 min.","Add chicken, coat in paste.","Pour in coconut milk, bring to simmer.","Add vegetables and lime leaves.","Simmer 12 min until chicken is cooked.","Season with fish sauce and sugar, top with basil."],
    difficulty:"Easy", youtube:"", source:""
  },
  // ── Japanese ────────────────────────────────────────────────────
  {
    id:"b070", name:"Chicken Teriyaki", cuisine:"Japanese", category:"Chicken",
    thumbnail:"",
    description:"Glossy caramelised chicken thighs in a sweet-savoury teriyaki glaze served with rice.",
    ingredients:["4 Chicken thighs","3 tbsp Soy sauce","2 tbsp Mirin","2 tbsp Sake or rice wine","1 tbsp Sugar","1 tbsp Oil","Sesame seeds","Spring onions"],
    instructions:["Mix soy sauce, mirin, sake and sugar.","Score chicken skin.","Fry skin-side down in oil until golden.","Flip, cook 5 min.","Add sauce, simmer and baste until glazed.","Slice and serve with sesame seeds."],
    difficulty:"Easy", youtube:"", source:""
  },
  {
    id:"b071", name:"Miso Soup", cuisine:"Japanese", category:"Soup",
    thumbnail:"",
    description:"Delicate dashi broth with miso, silken tofu and wakame seaweed.",
    ingredients:["4 cups Dashi or vegetable stock","3 tbsp White miso paste","200g Silken tofu, cubed","2 tbsp Dried wakame","2 Spring onions"],
    instructions:["Heat dashi to just below boiling.","Dissolve miso paste in a ladle of broth.","Add tofu and rehydrated wakame.","Return miso to pot, do not boil.","Serve garnished with spring onions."],
    difficulty:"Easy", youtube:"", source:""
  },
  // ── American ────────────────────────────────────────────────────
  {
    id:"b080", name:"BBQ Pulled Pork", cuisine:"American", category:"Pork",
    thumbnail:"",
    description:"Slow-cooked pork shoulder shredded and tossed in smoky BBQ sauce.",
    ingredients:["1kg Pork shoulder","1 cup BBQ sauce","2 tbsp Brown sugar","1 tbsp Paprika","1 tsp Garlic powder","1 tsp Onion powder","1 tsp Cumin","Salt & pepper","Burger buns"],
    instructions:["Mix dry spices and rub over pork.","Cook in slow cooker on low 8 hrs or oven at 150°C for 4 hrs.","Shred meat with two forks.","Toss with BBQ sauce.","Pile into toasted buns.","Serve with coleslaw."],
    difficulty:"Easy", youtube:"", source:""
  },
  {
    id:"b081", name:"Classic Cheeseburger", cuisine:"American", category:"Beef",
    thumbnail:"",
    description:"Juicy beef patty with melted cheddar, lettuce, tomato and pickles in a brioche bun.",
    ingredients:["400g Beef mince","4 Cheddar cheese slices","4 Brioche buns","Lettuce","2 Tomatoes","Pickles","Ketchup","Mustard","Salt & pepper"],
    instructions:["Season beef mince with salt and pepper.","Form 4 equal patties.","Grill on high heat 3-4 min per side.","Add cheese in last minute of cooking.","Toast buns on grill.","Assemble with lettuce, tomato and pickles."],
    difficulty:"Easy", youtube:"", source:""
  },
  // ── Mediterranean ───────────────────────────────────────────────
  {
    id:"b090", name:"Greek Moussaka", cuisine:"Mediterranean", category:"Lamb",
    thumbnail:"",
    description:"Layered aubergine and spiced lamb mince topped with a creamy béchamel sauce.",
    ingredients:["500g Lamb mince","2 Aubergines, sliced","2 Onions","3 Tomatoes","3 cloves Garlic","1 tsp Cinnamon","1 tsp Allspice","2 cups Milk","3 tbsp Flour","3 tbsp Butter","Parmesan"],
    instructions:["Fry aubergine slices until golden.","Brown lamb with onion, garlic and spices.","Add tomatoes, simmer 15 min.","Layer aubergine and meat in dish.","Make béchamel with butter, flour and milk.","Top with béchamel, bake at 180°C for 40 min."],
    difficulty:"Hard", youtube:"", source:""
  },
  {
    id:"b091", name:"Hummus & Falafel", cuisine:"Mediterranean", category:"Vegan",
    thumbnail:"",
    description:"Creamy chickpea hummus with crispy spiced falafel and warm pitta.",
    ingredients:["2 cans Chickpeas","3 tbsp Tahini","3 cloves Garlic","2 Lemons","1 tsp Cumin","1 tsp Coriander","2 tbsp Olive oil","Pitta bread","Parsley"],
    instructions:["Blend half chickpeas with tahini, garlic and lemon for hummus.","Mash rest of chickpeas with cumin, coriander and parsley.","Form into balls, shallow-fry until crispy.","Spread hummus on plate.","Top with falafel and a drizzle of olive oil.","Serve with warm pitta."],
    difficulty:"Medium", youtube:"", source:""
  },
];

const OFFLINE_MODE = false; // Set true to always use bundled data
