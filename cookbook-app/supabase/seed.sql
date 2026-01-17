-- C & J Cookbook Seed Data
-- Run this AFTER schema.sql to populate your database with recipes

-- Insert Categories
INSERT INTO categories (name, sort_order) VALUES
  ('Salads', 1),
  ('Bread', 2),
  ('Soups Stews & Curries', 3),
  ('Crock Pot', 4),
  ('Apps', 5),
  ('Sides', 6),
  ('Chicken', 7),
  ('Steak/Beef', 8),
  ('Seafood', 9),
  ('Sausage', 10),
  ('Turkey', 11),
  ('Vegetarian', 12),
  ('Noodles', 13),
  ('Desserts', 14),
  ('To Try', 15),
  ('Cocktails', 16),
  ('Random', 17)
ON CONFLICT (name) DO NOTHING;

-- Insert Recipes
-- SALADS
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Cashew Crunch Salad with Sesame Dressing', 'https://pinchofyum.com/cashew-crunch-salad-with-sesame-dressing', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Curried Quinoa Salad', 'https://minimalistbaker.com/curried-quinoa-salad/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Cranberry Maple Vinaigrette', 'https://docs.google.com/document/d/1ha1BsO_91aFc_4WDyJV92WsLJCquHNnIgxjv64M2oVM/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Chickpea Chopped Kale Salad Adobo Dressing', 'https://minimalistbaker.com/chickpea-chopped-kale-salad-with-adobo-dressing/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Mixed Berry Kale Salad', 'https://www.lahbco.com/greens-n-things/berryburratasalad', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Blueberry Corn and Avocado Chopped Salad', 'https://www.gimmesomeoven.com/blueberry-corn-and-avocado-chopped-salad/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('White Cabbage Salad', 'https://www.theeleganteconomist.com/2019/08/20/salatet-malfouf-lebanese-white-cabbage-salad/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Kale Quinoa Salad', 'http://dailyburn.com/life/recipes/kale-quinoa-salad/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Corn and Chickpea Salad with Miso Jalapeno Tahini', 'https://www.bonappetit.com/recipe/corn-and-chickpea-bowl-with-miso-jalapeno-tahini', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Shaved Brussel Sprouts Salad', 'https://www.twopeasandtheirpod.com/shaved-brussels-sprouts-salad/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Grilled Veggie Kale Salad with Lemon Basil Vinaigrette', 'https://docs.google.com/document/d/15Ph1nPheFHgnkVXbhjSeyi_VNJNvxLGuyfYmxq_xaEs/edit', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Butternut Squash Nourish Bowl', 'https://minimalistbaker.com/butternut-squash-miso-brussels-sprouts-nourish-bowl/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Sauteed Kale Salad with Ricotta', 'https://justinesnacks.com/sauteed-kale-salad-with-ricotta-salata/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Kale and brussels sprouts salad with sweet pot', 'https://docs.google.com/document/d/1jb5ZoBJpdDCT_foJlrsxh7sPylzOJ9AdS8RI2eyKEz8/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Salads'), 'TikTok'),
  ('Warm Kale Salad-raisins + bread crumbs', 'https://docs.google.com/document/d/1_Q9YJKndIrwGiKW5StKv4OvCzbZ5ujjauY4R81r7c30/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Warm kale and Brussels sprouts with strawberries', 'https://docs.google.com/document/d/1sJX587p2glA0WSl3J0em_QVGPMQttlw6C735falMpqs/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Strawberry Kale Salad (Sweetgreen)', 'https://www.lahbco.com/greens-n-things/berryburratasalad', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Greek dressing with turkey meatballs', 'https://www.thepalatablelife.com/herby-chicken-meatball-bowl/#recipe', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Bean steak salad', 'https://violetcooks.substack.com/p/grilled-corn-steak-and-peach-dense', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Salmon spicy rice salad', 'https://kalejunkie.com/crispy-rice-salmon-cucumber-salad-with-creamy-soy-dressing/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Brussel Sprout Salad', 'https://jenneatsgoood.com/roasted-brussels-sprouts-and-kale-salad-gf-veg-grain-free/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Teriyaki Crispy Chicken Rice Salad', 'https://kalejunkie.com/teriyaki-chicken-crispy-rice-salad/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Kale Couscous Salad', 'https://www.ambitiouskitchen.com/kale-couscous-salad/', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Steak Chimichurri Dense Bean Salad', 'https://docs.google.com/document/d/19cMmtWPdGlmrtUFwQCAlnqCygYml_5k59TIcJypo0YA/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Chicken Kale Salad', '', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Sweetgreen Elote Bowl', 'https://www.lahbco.com/greens-n-things/elotesweetgreenbowl', (SELECT id FROM categories WHERE name = 'Salads'), ''),
  ('Grilled Corn, Peaches, Steak Dense Bean Salad', 'https://violetcooks.substack.com/p/grilled-corn-steak-and-peach-dense', (SELECT id FROM categories WHERE name = 'Salads'), '');

-- BREAD
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Focaccia Muffins', 'https://abrightmoment.com/salted-rosemary-sourdough-focaccia-muffins/#recipe-card', (SELECT id FROM categories WHERE name = 'Bread'), ''),
  ('Sour Dough Sandwich', '', (SELECT id FROM categories WHERE name = 'Bread'), ''),
  ('Crunchy Sour Dough Bread', '', (SELECT id FROM categories WHERE name = 'Bread'), ''),
  ('Bagels', 'https://www.alyonascooking.com/whole-wheat-sourdough-bagels/', (SELECT id FROM categories WHERE name = 'Bread'), ''),
  ('Discard English Muffins', 'https://gatherednutrition.com/sourdough-discard-english-muffins/', (SELECT id FROM categories WHERE name = 'Bread'), ''),
  ('Swedish Cardamom Buns', 'https://docs.google.com/document/d/17AlJBrw6PQv5GMZ5yxW4RdwyyRPTsWXWUMaiyx-pgqA/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Bread'), ''),
  ('King Cake', '', (SELECT id FROM categories WHERE name = 'Bread'), ''),
  ('Blueberry Muffin Cookie Skillet', '', (SELECT id FROM categories WHERE name = 'Bread'), '');

-- SOUPS STEWS & CURRIES
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Garlicky Tomato Soup with Smashed White Beans', 'https://minimalistbaker.com/super-garlicky-tomato-soup-with-smashed-white-beans/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Vegan Chili Pearl Barley', 'https://docs.google.com/document/d/1xd9iykVgXTC1WaZLAa6k3pPbBeH_MFXmuHVpTgPaj3Y/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Leek Sweet Potato Soup', 'https://www.lahbco.com/soups/sweet-potato-leek-soup', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Smoky White Bean Shakshuka', 'https://www.budgetbytes.com/smoky-white-bean-shakshuka/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Chorizo Chili', 'https://docs.google.com/document/d/1qZdN3al7COoh2q9uaeucd8mRJGxW9Nfh4-yHke39QCo/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Red Lentil Cashew Tomato Soup', 'https://plantyou.com/vegan-tomato-soup-recipe-with-red-lentils-cashews/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Thai Chicken Soup', 'https://minimalistbaker.com/cozy-thai-inspired-chicken-noodle-soup/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Preston''s Chili', '', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Lemony Lentil Soup', 'https://www.gimmesomeoven.com/lemony-lentil-soup/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Red Lemon Lentil Soup', 'https://cooking.nytimes.com/recipes/1016062-red-lentil-soup-with-lemon', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Miso Soup', 'https://minimalistbaker.com/15-minute-miso-soup-with-greens-and-tofu/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Josh''s Turkey Coconut Chili', 'https://docs.google.com/document/d/14J8O0XzSzHUbdqpikGH2YlRxlg33CsTBOG2yqsBaUPA/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Ethiopian Lentils', 'https://www.washingtonpost.com/food/2021/04/21/misir-wot-recipe-ethiopian-lentils/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Meatball Stew', 'https://themodernproper.com/meatball-stew', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Chickpea and Eggplant Curry', 'https://www.bonappetit.com/recipe/chickpea-and-eggplant-curry-with-mint-chutney', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Tagine', 'https://rainbowplantlife.com/vegan-tagine-with-chickpeas/#ingredients', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('One Pot Red Curry Thick Boi', 'https://minimalistbaker.com/easy-1-pot-massaman-curry/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('One Pan Red Curry Thin Boi', 'https://cookieandkate.com/thai-red-curry-recipe/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Green Curry with Chickpeas and Kale', 'https://minimalistbaker.com/1-pot-green-curry-with-chickpeas-kale-and-sweet-potato/.', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Curried Lentils', 'https://www.girlversusdough.com/spiced-lentils-with-poached-eggs/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Shakshuka', '', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Gumbo', 'https://www.gimmesomeoven.com/gumbo-recipe/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('West African Stew', 'https://docs.google.com/document/d/1WYtww_0ml-Gs3eJYAR_mS4AmK5sDutia5TYHU5bh4tc/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Green Curry Lentil Soup', 'https://www.bonappetit.com/recipe/green-curry-lentil-soup', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Thai-Inspired Chicken Meatball Soup', 'https://cooking.nytimes.com/recipes/1020631-thai-inspired-chicken-meatball-soup?smid=ck-recipe-iOS-share', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Beef Bourguignon', 'https://cafedelites.com/beef-bourguignon/#recipe', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Creamy Wild Rice and Mushroom Soup', 'https://gooodeats.com/2023/09/25/creamy-dairy-free-mushroom-wild-rice-soup/#', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Double Lentil Soup', 'https://plantbasedrdblog.com/2024/10/double-lentil-sweet-potato-soup/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Chicken Noodle Soup', 'https://docs.google.com/document/d/1vxTM0hmcIRawlstEjg34BuIIjj6OI09lvQQb7shIcF0/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), 'cooking school'),
  ('Creamy Potato Leek Soup', 'https://plantbasedrdblog.com/2024/12/creamy-potato-leek-soup-with-garlic-scallion-oil/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Creamy Sausage Gnocchi Soup', 'https://www.lemon8-app.com/foodiefromvt/7438788185612698168?region=us', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Red Curry Wonton Soup', 'https://brendanpang.com.au/recipes/red-curry-wonton-soup-02/', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Chicken Wonton', 'https://pinchofyum.com/chicken-wontons-in-spicy-chili-sauce', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), ''),
  ('Butternut Squash Curry', 'https://themodernproper.com/slow-cooker-chicken-pumpkin-curry', (SELECT id FROM categories WHERE name = 'Soups Stews & Curries'), '');

-- CROCK POT
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Slow Cooker Sweet Potato', 'https://therealfooddietitians.com/slow-cooker-sweet-potato-chicken-curry/', (SELECT id FROM categories WHERE name = 'Crock Pot'), ''),
  ('White Bean Chicken Chili', 'https://hungry-blonde.com/slow-cooker-white-bean-chicken-chili/', (SELECT id FROM categories WHERE name = 'Crock Pot'), ''),
  ('Slow Cooker Jambalaya', 'https://www.lecremedelacrumb.com/slow-cooker-jambalaya/', (SELECT id FROM categories WHERE name = 'Crock Pot'), ''),
  ('Crock Pot Turkey Chili', 'https://docs.google.com/document/d/1WOarnYTVYAox_cm5S2ndwq-6Rsj5JJyPf-kSs4QndYw/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Crock Pot'), ''),
  ('Slow Cooker BBQ Pulled Pork', 'https://drive.google.com/file/d/18Pst8Y9SBLrL0kFmT5IeUtIc9D8gFJyu/view?usp=sharing', (SELECT id FROM categories WHERE name = 'Crock Pot'), ''),
  ('Slow Cooker Indian Spiced Chicken with Tomato and Cream', 'https://drive.google.com/file/d/1CdWd3AglkTfPcwQ18_G12VNnal5RYyC5/view?usp=sharing', (SELECT id FROM categories WHERE name = 'Crock Pot'), ''),
  ('Slow Cooker Beer Braised Brisket', 'https://drive.google.com/file/d/1J8FF5st2j3Z3achlLKQrMI_VBKHNLLy8/view?usp=sharing', (SELECT id FROM categories WHERE name = 'Crock Pot'), '');

-- APPS
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Boursin Fig Dip', 'https://docs.google.com/document/d/15VQ4PGd12u4LkQmsUic53cM2UiB-8mKkLnQYVupZ5dY/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Apps'), 'TikTok');

-- SIDES
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Turmeric Rice', 'https://www.fooddolls.com/coconut-turmeric-rice/', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Veggie Galette', 'https://www.lahbco.com/snacks/summergalette?rq=Galette', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Grilled Corn with Hot Honey Lime Dressing', 'https://www.bonappetit.com/recipe/grilled-corn-salad-with-hot-honey-lime-dressing', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Roasted Za''atar Veggies', '', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Spicy Cucumber Salad', '', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Broccoli Salad', 'https://minimalistbaker.com/creamy-vegan-broccoli-salad-mayo-free', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Southwest Sweet Potato Dip', 'https://minimalistbaker.com/southwest-sweet-potato-black-bean-dip/', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Summer Squash Lemon Thyme', 'https://www.sprinklesandsprouts.com/roasted-summer-squash-with-thyme-and-charred-lemon/', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Moroccan Carrots', 'https://minimalistbaker.com/moroccan-spiced-roasted-carrots/', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Moroccan Quinoa Power Bowl', 'https://letsdishrecipes.com/moroccan-quinoa-power-salad/', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Harissa Sweet Potatoes', 'https://cooking.nytimes.com/recipes/1023541-harissa-roasted-sweet-potatoes-and-red-onion?smid=ck-recipe-iOS-share', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Sweet Potatoes with Tahini Butter Chickpeas', 'https://www.bunchbunchbunch.com/recipes/sweet-potatoes-with-tahini-butter-chickpeas', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Hot Honey Brussels Sprouts', 'https://www.emilyeatsthings.com/hot-honey-brussels-sprouts/', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Aloo Palak (Spinach Potatoes)', 'https://docs.google.com/document/d/1hhXTp1k0Xb4DZV2oGYRmwFd3vPtuxzqpGB2gi92sWtw/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Mushroom Miso Rice', 'https://www.provecho.bio/@groovyfoodiess/xl-crispy-rice-with-miso-mushrooms', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Gochujang Crispy Potatoes', 'https://lindseyeatsla.com/crispy-smashed-potatoes-with-gochujang-spicy-mayo/', (SELECT id FROM categories WHERE name = 'Sides'), ''),
  ('Pan Fried Zucchini with Hot Honey', 'https://healthyishfoods.com/pan-fried-zucchini-with-hot-honey-and-feta/', (SELECT id FROM categories WHERE name = 'Sides'), '');

-- CHICKEN
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Slow Cooker Greek Chicken and Potatoes', 'https://www.cookingclassy.com/slow-cooker-greek-lemon-chicken-and-potatoes/', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Teriyaki Chicken with Noodle Nest', 'https://thehappyfoodie.co.uk/recipes/nadiya-hussains-teriyaki-chicken-noodles/', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Pineapple Chicken Thighs with Turmeric Cauliflower', 'https://docs.google.com/document/d/1vP9vpZ_U8BuTAlyIfNhCGrdldk1GnyKQvziyEuF4oHE/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Miso Maple Harvest Bowl with Chicken', 'https://www.lahbco.com/greens-n-things/misomapleharvestbowl', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Thai Chicken Thighs Coconut Rice', 'https://www.bonappetit.com/recipe/thai-roast-chicken-thighs-with-coconut-rice', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Pineapple Salsa Rice and Chicken Bowls', '', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Sheet Pan Chicken Meatballs and Charred Broccoli', 'https://www.bonappetit.com/recipe/sheet-pan-chicken-meatballs-and-charred-broccoli/amp', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Quinoa Bowls with Chicken and Sauteed Veggies', '', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Chicken Dutch Oven Dates and Lemon', 'https://anewsletter.alisoneroman.com/p/onepotchicken', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Cashew Chicken', 'https://letsdishrecipes.com/easy-cashew-chicken', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Mexican Shredded Chicken', 'https://minimalistbaker.com/1-pan-mexican-shredded-chicken/', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Chicken/Tuna Salad', '', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Curry Chicken Salad', 'https://therealfooddietitians.com/curry-chicken-salad/', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Gochujang Chicken with Butternut Squash', 'https://cooking.nytimes.com/recipes/1020829-sheet-pan-gochujang-chicken-and-roasted-vegetables?smid=ck-recipe-iOS-share', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Skillet Chicken with Turmeric and Orange', '', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Pad See Yew (Thai Noodles with Chicken)', '', (SELECT id FROM categories WHERE name = 'Chicken'), 'TikTok'),
  ('Chicken Pot Pie', 'https://allezlefood.com/2019/02/22/chicken-pot-pie-from-salt-fat-acid-heat/', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Lemon and Herb Roasted Chicken Thighs', 'https://minimalistbaker.com/lemon-herb-roasted-chicken-thighs/', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Skillet Chicken and Pearl Couscous With Moroccan Spices', 'https://cooking.nytimes.com/recipes/1020967-skillet-chicken-and-pearl-couscous-with-moroccan-spices?smid=ck-recipe-iOS-share', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Indonesian Peanut Chicken', 'https://www.tasteofhome.com/recipes/indonesian-peanut-chicken/', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Spicy Wontons in Sauce', 'https://pinchofyum.com/chicken-wontons-in-spicy-chili-sauce', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Elote Chicken Pasta', 'https://docs.google.com/document/d/1hgV22g6o6rqmFMg2l-ApBaKJqLhBIWIQOq_8OrRR1uw/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Vietnamese Chicken Salad', 'https://www.177milkstreet.com/recipes/vietnamese-chicken-salad-goi-ga', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Pepperoncini Chicken Salad', 'https://docs.google.com/document/d/1SNaqYfkI3MzlcCfGcNHWrrlhOsaCqJF5G02NqXZvre0/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Chicken'), ''),
  ('Airfryer Paprika Chicken', 'https://nutrient-matters.com/recipe/air-fryer-paprika-chicken/', (SELECT id FROM categories WHERE name = 'Chicken'), '');

-- STEAK/BEEF
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Beef Empanadas', 'https://www.bonappetit.com/recipe/argentinian-beef-empanadas/amp', (SELECT id FROM categories WHERE name = 'Steak/Beef'), ''),
  ('Meatloaf with Kale Slaw and Mushrooms', 'https://natashaskitchen.com/meatloaf-recipe/', (SELECT id FROM categories WHERE name = 'Steak/Beef'), ''),
  ('Korean Steak Bowl', 'https://www.gimmesomeoven.com/korean-steak-bowls-with-sesame-cucumber-slaw/', (SELECT id FROM categories WHERE name = 'Steak/Beef'), ''),
  ('Carne Asada', 'https://www.gimmesomeoven.com/carne-asada/', (SELECT id FROM categories WHERE name = 'Steak/Beef'), ''),
  ('Ginger Beef and Green Bean Stir Fry', 'https://drive.google.com/file/d/1rawB-xXD6pW3H-WVpqWuYJZ6C0_ixDXb/view?usp=sharing', (SELECT id FROM categories WHERE name = 'Steak/Beef'), ''),
  ('Pad Kra Pao', 'https://kwokspots.com/pad-kra-pao-thai-basil-beef/', (SELECT id FROM categories WHERE name = 'Steak/Beef'), ''),
  ('Meat Stuffed Pita', 'https://moribyan.com/arayes-meat-stuffed-pita/', (SELECT id FROM categories WHERE name = 'Steak/Beef'), '');

-- SEAFOOD
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Creamy Lemon Shrimp Pearl Couscous Scampi', 'https://docs.google.com/document/d/1lptO9k-0-P106QTomoQbvAdDlTlxrdd-CUhzPMLHlFE/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Sheet Pan Tilapia', 'https://docs.google.com/document/d/1XzuQtMVLqrKv7MPlGCPNVyjHKxi1J5w3_NnDYDGSppE/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Tequila Lime Shrimp', 'https://jz-eats.com/drunken-tequila-lime-shrimp/', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Honey Cilantro Lime Shrimp', 'https://www.lecremedelacrumb.com/honey-cilantro-lime-shrimp/', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Coconut Pineapple Shrimp Kebabs', 'https://www.wellplated.com/coconut-pineapple-shrimp-skewers/', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Fish Tacos', 'https://www.gimmesomeoven.com/fish-tacos/#tasty-recipes-59652', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Tuna Cakes', 'https://thedefineddish.com/whole30-tuna-cakes-with-smoked-paprika-aioli/#disqus_thread', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Sweet Cilantro Lime Salmon', 'https://letsdishrecipes.com/sweet-cilantro-lime-salmon', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Orange Maple Glazed Salmon', 'https://letsdishrecipes.com/orange-maple-glazed-salmon/', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Sushi Bowl', 'https://www.budgetbytes.com/sushi-bowls-sriracha-mayo/', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Honey Sriracha Salmon', 'https://www.lecremedelacrumb.com/baked-honey-sriracha-lime-salmon/#wprm-recipe-container-19898', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Greek Oven Roasted White Fish', 'https://thedefineddish.com/oven-baked-greek-inspired-halibut/', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Tuna Melt', 'https://docs.google.com/document/d/18pmGUK8dTl77codCuAVdirqzrDqNfJAALD0Y_BJv_BY/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Coconut Curry Salmon', 'https://pinchofyum.com/coconut-curry-salmon', (SELECT id FROM categories WHERE name = 'Seafood'), ''),
  ('Spicy Tuna Pasta', 'https://www.foodandwine.com/spicy-tuna-pantry-pasta-11816115', (SELECT id FROM categories WHERE name = 'Seafood'), 'Samin');

-- SAUSAGE
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Sheet Pan Gnocchi with Sausage', 'https://docs.google.com/document/d/1v7PGzStyL9Se_uEPdnOE0OpttMWDeHgxyTdlWJjItbg/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Sausage'), ''),
  ('White Bean Sausage Skillet', 'https://themodernproper.com/white-bean-sausage-skillet', (SELECT id FROM categories WHERE name = 'Sausage'), ''),
  ('Sausage and Bell Pepper Skillet', 'https://thedefineddish.com/sausage-and-bell-pepper-skillet/', (SELECT id FROM categories WHERE name = 'Sausage'), ''),
  ('Dan Dan Pappardelle', 'https://www.bonappetit.com/recipe/dan-dan-pappardelle', (SELECT id FROM categories WHERE name = 'Sausage'), ''),
  ('Hash with Veggies and Sausage', '', (SELECT id FROM categories WHERE name = 'Sausage'), ''),
  ('Corn Leek Bacon Pancakes', 'https://docs.google.com/document/d/e/2PACX-1vTmESucqOBJuWxkgMq15A32FgR5af7N6KhPPNaKoGUXKz5vuSfZvY-obrQ1-87dGh3pTXoTV7iXVME0/pub', (SELECT id FROM categories WHERE name = 'Sausage'), ''),
  ('Spicy Maple Tahini Sheet Pan', 'https://gatherednutrition.com/sheet-pan-roasted-fall-veggies-with-tahini-sauce/', (SELECT id FROM categories WHERE name = 'Sausage'), ''),
  ('Spicy Sausage Pumpkin Pasta', '', (SELECT id FROM categories WHERE name = 'Sausage'), '');

-- TURKEY
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Acorn Squash with Ground Turkey', 'https://www.realfoodwithjessica.com/2019/09/23/paleo-whole30-sausage-stuffed-acorn-squash/', (SELECT id FROM categories WHERE name = 'Turkey'), ''),
  ('Egg Roll in a Bowl', 'https://allthehealthythings.com/egg-roll-in-a-bowl/', (SELECT id FROM categories WHERE name = 'Turkey'), ''),
  ('Asian Ground Turkey Stir Fry', '', (SELECT id FROM categories WHERE name = 'Turkey'), ''),
  ('Turkey Burgers', 'https://www.bonappetit.com/recipe/turkey-spinach-sliders', (SELECT id FROM categories WHERE name = 'Turkey'), ''),
  ('Turkey Meatballs', 'https://www.culinaryhill.com/turkey-meatballs/', (SELECT id FROM categories WHERE name = 'Turkey'), ''),
  ('Dill Lemon Turkey Meatballs with Orzo', 'https://cooking.nytimes.com/recipes/1024124-lemon-dill-meatballs-with-orzo?smid=ck-recipe-iOS-share', (SELECT id FROM categories WHERE name = 'Turkey'), ''),
  ('Meatballs Standalone Panko', 'https://pinchofyum.com/best-anytime-baked-chicken-meatballs', (SELECT id FROM categories WHERE name = 'Turkey'), '');

-- VEGETARIAN
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Veggie Shepherd''s Pie', 'https://pinchofyum.com/vegetarian-shepherds-pie', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Butternut Squash and Brussels Miso Bowl', 'https://minimalistbaker.com/butternut-squash-miso-brussels-sprouts-nourish-bowl/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Peanut Miso Chickpea "Chicken" Salad', 'https://www.lahbco.com/dinner/peanutmisochickpeasalad', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Veggie Black Bean Burritos', 'https://somethingnutritiousblog.com/black-bean-and-veggie-burritos/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Pasta Salad with Butternut Squash and Eggplant', 'https://www.lahbco.com/dinner/coconut-curry-orzo?rq=Orzo', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Mediterranean Bowl', 'https://minimalistbaker.com/the-ultimate-mediterranean-bowl/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Sweet Pot Buddha Bowl', 'https://minimalistbaker.com/sweet-potato-chickpea-buddha-bowl/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Quiche', 'https://www.gimmesomeoven.com/dairy-free-vegetable-quiche-with-eggs/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Quinoa Patties', 'https://www.skinnytaste.com/quinoa-and-spinach-patties/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Zucchini Fritters', 'https://minimalistbaker.com/easy-zucchini-fritters/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Kimchi Stir Fry', 'https://healthynibblesandbits.com/kimchi-fried-rice/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Butternut Squash Orzo with Mushrooms', '', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Sun-Dried Tomato Shakshuka', 'https://docs.google.com/document/d/e/2PACX-1vRU4uTwSl3YPcKX_LPJYvrexLM9_DmNCswmfhh_NFGXhjsCGVcuHGbGQHDho7hLuLdyQy7dkXJkTp05/pub', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Tuscan Chickpea', 'https://carolefood.com/recipe/tuscan-chickpeas', (SELECT id FROM categories WHERE name = 'Vegetarian'), 'TikTok'),
  ('Miso Pasta', 'https://junandtonic.com/blog/miso-mushroom-pasta?rq=Miso%20pasta', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Creamy Lentil Japanese Sweet Pot Skillet', 'https://gatherednutrition.com/one-pan-creamy-lentils-japanese-sweet-potatoes-kale/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Crispy Buffalo White Bean Tacos', 'https://www.youtube.com/watch?v=iGJRMjLcwVM', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Creamy Chipotle Beans', 'https://plantbasedrdblog.com/2024/08/creamy-chipotle-bean-salad/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Falafel Flat Bread', 'https://docs.google.com/document/d/10EJVkSlwrel361ej0-k13uXTteNNg5rgXAtcCTmnFEY/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Vegetarian'), 'Trader Joes'),
  ('Creamy Tomato and Basil Beans', 'https://docs.google.com/document/d/1C4sVYLW3lgrg7jd97AEJpOuqNi5Y-dyKIwMpmIkeYHQ/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Avocado White Bean Sandwich', 'https://plantbasedrdblog.com/2022/09/high-protein-avocado-white-bean-sandwich/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Pesto Chickpea Salad', 'https://www.lahbco.com/dinner/basilpestochickpeasalad', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Chickpea/Roasted Red Pepper/Sun-Dried Tomato', 'https://justinesnacks.com/sauteed-kale-salad-with-ricotta-salata/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Harissa Simmered Artichokes on Toast', 'https://justinesnacks.com/harissa-simmered-artichokes-on-toast/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Jacket Potato: Tahini Chickpea', 'https://www.mob.co.uk/recipes/sweet-potatoes-with-tahini-butter-chickpeas', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Harissa Sweet Potato', 'https://zenaskitchen.com/harissa-sweet-potatoes/', (SELECT id FROM categories WHERE name = 'Vegetarian'), ''),
  ('Creamy Tomato Basil Beans', 'https://docs.google.com/document/d/1qXKk7hoIlIA4zblfnIpls1vo0Mj2BzXKjnYmlQ9qj1o/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Vegetarian'), '');

-- NOODLES
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Creamy Nutty Ramen', '', (SELECT id FROM categories WHERE name = 'Noodles'), ''),
  ('Spicy Peanut Udon Noodles', 'https://nutrient-matters.com/recipe/coconut-curry-peanut-udon-noodles/', (SELECT id FROM categories WHERE name = 'Noodles'), '');

-- DESSERTS
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Pumpkin Muffins', 'https://www.realfoodwithjessica.com/2016/09/07/paleo-pumpkin-muffins/', (SELECT id FROM categories WHERE name = 'Desserts'), ''),
  ('Pumpkin Bread', 'https://sallysbakingaddiction.com/pumpkin-chocolate-chip-bread/', (SELECT id FROM categories WHERE name = 'Desserts'), ''),
  ('Blueberry Scones', 'https://www.bonappetit.com/recipe/easy-blueberry-cream-scones', (SELECT id FROM categories WHERE name = 'Desserts'), ''),
  ('Pistachio Cake', 'https://bromabakery.com/persian-love-cake-cardamom-rose-almond-cake/', (SELECT id FROM categories WHERE name = 'Desserts'), ''),
  ('Key Lime Pie Cookies', 'https://www.bonappetit.com/recipe/key-lime-pie-thumbprint-cookies', (SELECT id FROM categories WHERE name = 'Desserts'), '');

-- TO TRY
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Warm Fall Pearl Couscous Salad', 'https://britacooks.com/warm-fall-pearl-couscous-salad/', (SELECT id FROM categories WHERE name = 'To Try'), ''),
  ('Crispy Rice Salad', 'https://dishedbykate.com/satay-crispy-rice-salad/', (SELECT id FROM categories WHERE name = 'To Try'), ''),
  ('Roasted Broccoli Miso Salad', 'https://dishingouthealth.com/roasted-broccoli-salad/', (SELECT id FROM categories WHERE name = 'To Try'), ''),
  ('Sheet Pan Harissa Meatballs', 'https://munchinwithmaddie.blog/sheet-pan-harissa-chicken-meatballs-with-cauliflower-and-chickpeas/', (SELECT id FROM categories WHERE name = 'To Try'), ''),
  ('Bulgogi Bean Salad', 'https://mishkamakesfood.substack.com/p/bulgogi-bean-salad-with-scallion', (SELECT id FROM categories WHERE name = 'To Try'), ''),
  ('Green Olive Bean Salad', 'https://violetcooks.substack.com/p/turkey-green-olive-dense-bean-salad', (SELECT id FROM categories WHERE name = 'To Try'), ''),
  ('Coconut Milk Poached Fish', 'https://zenaskitchen.com/coconut-milk-poached-fish/', (SELECT id FROM categories WHERE name = 'To Try'), ''),
  ('Sourdough Honey Cornbread', 'https://gatherednutrition.com/sourdough-honey-cornbread/', (SELECT id FROM categories WHERE name = 'To Try'), ''),
  ('Pizza Bowls', '', (SELECT id FROM categories WHERE name = 'To Try'), ''),
  ('Baked Salad: Salsa Macha', 'https://justinesnacks.com/sunflower-salsa-macha/#recipe', (SELECT id FROM categories WHERE name = 'To Try'), '');

-- COCKTAILS
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Fig Sidecar', 'https://joinjules.com/', (SELECT id FROM categories WHERE name = 'Cocktails'), ''),
  ('Limoncello and Elderflower Spritz', '', (SELECT id FROM categories WHERE name = 'Cocktails'), ''),
  ('The Lone Rangers', '', (SELECT id FROM categories WHERE name = 'Cocktails'), '');

-- RANDOM
INSERT INTO recipes (name, url, category_id, notes) VALUES
  ('Rosemary Salt', 'https://docs.google.com/document/d/1zwdKu4Geg0hD_NKWcy9G4k9IlTDUOjdJWwr-ZIN4Igc/edit?usp=sharing', (SELECT id FROM categories WHERE name = 'Random'), ''),
  ('Tomato Dressing', '', (SELECT id FROM categories WHERE name = 'Random'), '');
