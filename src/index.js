"use strict";

const Rand = require('rand-seed').default;
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const sharp = require('sharp');

const { User } = require("./user");
const { Creature } = require("./creature");

require("./constants");

// Keep track of all users
const users = new Map();
const allCreatures = new Map();
const seeds = [];

// Random data
const randomData = new Map();

// username, name, species, geolocation,
// numbers -> traits, physiology, age, max_age, length, height, width, family, solar_system, planet,
// 9 habitats
// 5 rarity (Common, Uncommon, Rare, Epic, Legendary
// 3 hostility, social_structure, activity, hostility, diet
function generateRandomData() {
    var datasets = ["username", "name", "rarity", "solar_system", "planet", "species", "numbers", "geolocation", "habitat", "diet", "hostility", "social_structure", "activity"]

    for (var i = 0; i < datasets.length; i++) {
        try {
            var data = fs.readFileSync(`datasets/${datasets[i]}.txt`, 'utf8');
            var splitData = data.split(",");
            randomData.set(datasets[i], splitData);
        } catch (err) {
            continue;
        }
    }
}

function generateID() {
    var theID = null;
    while (true) {
        var rstring = uuidv4();
        if (!users.has(rstring)) {
            theID = rstring;
            break;
        }
    }
    return theID;
}

function initUser(user) {
    var newID = generateID();
    if (newID !== null) {
        user.userid = newID;
        users.set(newID, user);
    }
}


// inclusive
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSeed() {
    var rseed = random(0, Math.pow(2, SEED_BIT_SIZE));
    seeds.push(rseed.toString());
    return rseed;
}

function initCreature(forceSeed = null) {
    var c = new Creature();
    var seed;
    if (forceSeed != null) {
        seed = forceSeed;
    } else {
        seed = generateSeed();
    }
    if (seed != null) {
        var randgen = new Rand(seed.toString());
        c.seed = seed.toString();
        c.name = randomData.get("name")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND];
        // Rarity
        var try_rarity = randgen.next();
        var rarity = undefined;
        var multiplier = undefined;
        var max = undefined;
        var baseline = undefined;
        if (try_rarity < LEGENDARY_CHANCE) {
            rarity = 4;
            multiplier = 3;
            max = 10000;
            baseline = 500;
        }
        else if (try_rarity < EPIC_CHANCE) {
            rarity = 3;
            multiplier = 1.25;
            max = 1000;
            baseline = 250;
        }
        else if (try_rarity < RARE_CHANCE) {
            rarity = 2;
            multiplier = 1.1;
            max = 500;
            baseline = 100;
        }
        else if (try_rarity < UNCOMMON_CHANCE) {
            rarity = 1;
            multiplier = 0.25;
            max = 300;
            baseline = 50;
        }
        else {
            rarity = 0;
            multiplier = 0.1;
            max = 100;
            baseline = 5;
        }
        c.rarity = randomData.get("rarity")[rarity];
        // Age
        c.age = parseInt(Math.round(randgen.next() * DATASET_MAX_SIZE * multiplier) % MAX_THOUSAND % MAX_HUNDRED);
        c.max_age = c.age + parseInt(Math.round(randgen.next() * DATASET_MAX_SIZE * multiplier));
        // Origin
        c.origin.solar_system = randomData.get("solar_system")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND];
        c.origin.planet = randomData.get("planet")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND];
        // Taxonomy
        c.taxonomy.species = randomData.get("species")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND];
        // Traits
        c.traits.health = Math.round(Math.round(randgen.next() * DATASET_MAX_SIZE) * multiplier + baseline % max);
        c.traits.strength = Math.round(Math.round(randgen.next() * DATASET_MAX_SIZE) * multiplier + baseline % max);
        c.traits.defense = Math.round(Math.round(randgen.next() * DATASET_MAX_SIZE) * multiplier + baseline % max);
        c.traits.agility = Math.round(Math.round(randgen.next() * DATASET_MAX_SIZE) * multiplier + baseline % max);
        c.traits.intelligence = Math.round(Math.round(randgen.next() * DATASET_MAX_SIZE) * multiplier + baseline % max);
        // Physiology
        c.physiology.length = Math.round(Math.round(randgen.next() * DATASET_MAX_SIZE) * multiplier % MAX_THOUSAND);
        c.physiology.height = Math.round(Math.round(randgen.next() * DATASET_MAX_SIZE) * multiplier % MAX_THOUSAND);
        c.physiology.weight = Math.round(Math.round(randgen.next() * DATASET_MAX_SIZE) * multiplier % MAX_THOUSAND);
        // Ecology
        c.ecology.geolocation = randomData.get("geolocation")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND];
        c.ecology.habitat = randomData.get("habitat")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND % (randomData.get("habitat").length)];
        c.ecology.diet = randomData.get("diet")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND % (randomData.get("diet").length)];
        // Behaviour
        c.behaviour.hostility = randomData.get("hostility")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND % (randomData.get("hostility").length)];
        c.behaviour.social_structure = randomData.get("social_structure")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND % (randomData.get("social_structure").length)];
        c.behaviour.activity = randomData.get("activity")[Math.round(randgen.next() * DATASET_MAX_SIZE) % MAX_THOUSAND % (randomData.get("activity").length)];
    }
    if (!allCreatures.has(seed)) {
        allCreatures.set(seed, c);
    }
	// createCreatureArt(c);
    return c;
}

function generateCreatures(amount) {
    var times = [];
    console.log("Generating", amount, "creatures...")
    for (var i = 0; i < amount; i++) {
        var start = performance.now();
        initCreature();
        times.push(performance.now() - start);
    }
    var sum = 0;
    for (var i = 0; i < times.length; i++) {
        sum += times[i];
    }
    console.log("Avg ms / creature:", (sum / times.length).toFixed(3))
}

function countCreatures() {
    var counts = new Map();
    var legendary = [];
    counts.set("Common", 0);
    counts.set("Uncommon", 0);
    counts.set("Rare", 0);
    counts.set("Epic", 0);
    counts.set("Legendary", 0);
    allCreatures.forEach((value, key) => {
        var theRarity = "";
        if (value.rarity == "Common") {
            theRarity = "Common";
        }
        else if (value.rarity == "Uncommon") {
            theRarity = "Uncommon";
        }
        else if (value.rarity == "Rare") {
            theRarity = "Rare";
        }
        else if (value.rarity == "Epic") {
            theRarity = "Epic";
        }
        else if (value.rarity == "Legendary") {
            theRarity = "Legendary";
            legendary.push(value);
        }
        counts.set(theRarity, counts.get(theRarity) + 1);
    })
    console.log("------------")
    console.log("Creatures found:")
    counts.forEach((value, key) => {
        console.log(key + ":", value)
    })
}

function viewInventory(user) {
    for (var i = 0; i < user.getCreatures().length; i++) {
        console.log(user.getCreatures()[i])
    }
}

function rollForCreature(user) {
    var c = initCreature();
    // createCreatureArt(c);
    if (user.addCreature(c) != null) {

        console.log(`${c.name} (${c.rarity}) was added to your inventory`);
    } else {
        console.log(`Your inventory is full! ${c.name} (${c.rarity}) couldn't be added to your inventory`);
    }
	return c;
}

function deleteCreature(user, c) {
    if (user.removeCreature(c) != null) {
        console.log(`${c.name} (${c.rarity}) was removed to your inventory`);
		fs.stat(c.image, function(err) {
			if (err) {
				console.log(err)
			}
		})
		fs.unlink(c.image, function(err) {
			if (err) {
				console.log(err)
			}
		})
    } else {
        console.log("Deletion of creature did not work");
    }
}

function rollMultiCreatures(user, amount) {
    for (var i = 0; i < amount; i++) {
        rollForCreature(user);
    }
}

function createCreatureArt(c) {
    var body = undefined;
    var eyes = undefined;
    var mouth = undefined;
    var variations = 5;
    var dir = "/images/";
    var toDir = "public/assets/creatures/";
    var ff = ".png";
    var seed = c.seed;
    var name = c.name;
    c.image = toDir + seed.toString() + ff;
    var randgen = new Rand(seed.toString());

    var hue_rand_body = Math.round(randgen.next() * DATASET_MAX_SIZE) % 12;
    var saturate_rand_body = randgen.next().toFixed(3) % 1;
    var hue_rand_eyes = Math.round(randgen.next() * DATASET_MAX_SIZE) % 12;
    var saturate_rand_eyes = randgen.next().toFixed(3) % 1;
    var hue_rand_mouth = Math.round(randgen.next() * DATASET_MAX_SIZE) % 12;
    var saturate_rand_mouth = randgen.next().toFixed(3) % 1;

    var type_body = Math.round(randgen.next() * DATASET_MAX_SIZE) % variations;
    var type_eyes = Math.round(randgen.next() * DATASET_MAX_SIZE) % variations;
    var type_mouth = Math.round(randgen.next() * DATASET_MAX_SIZE) % variations;

    function openImage(path) {
        return sharp(__dirname + path);
    }

    openImage(dir + "body" + type_body + ff)
        .modulate({ hue: HUE_STEP * hue_rand_body, saturation: SATURATE_STEP * -saturate_rand_body })
        .toBuffer()
        .then((bodyBuffer) => {
            body = sharp(bodyBuffer);
            return openImage(dir + "eyes" + type_eyes + ff)
                .modulate({ hue: HUE_STEP * hue_rand_eyes, saturation: SATURATE_STEP * -saturate_rand_eyes })
                .toBuffer();
        })
        .then((eyesBuffer) => {
            eyes = sharp(eyesBuffer);
            return openImage(dir + "mouth" + type_mouth + ff)
                .modulate({ hue: HUE_STEP * hue_rand_mouth, saturation: SATURATE_STEP * -saturate_rand_mouth })
                .toBuffer();
        })
        .then((mouthBuffer) => {
            mouth = sharp(mouthBuffer);
            return sharp({ create: { width: 128, height: 128, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
                .composite([{ input: body, left: 0, top: 0 }, { input: eyes, left: 0, top: 0 }, { input: mouth, left: 0, top: 0 }])
                .toFile(toDir + name + "_" + seed.toString() + ff);
        })
        .catch((err) => {
            console.error(err);
        });
}

generateRandomData();
//generateCreatures(10000);
//countCreatures();

var user1 = new User();
initUser(user1);
var c = initCreature();

console.log(c)
user1.addCreature(c);

// rollMultiCreatures(user1, 1)




