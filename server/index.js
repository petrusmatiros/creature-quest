const Rand = require('rand-seed').default;
const PRNG = require('rand-seed');
const uuid = require('uuid');
const CryptoJS = require("crypto-js");
const fs = require('fs');

var { User } = require("./user");
var { Creature } = require("./creature");

require("./constants");

// Keep track of all users
var users = new Map();
var allCreatures = new Map();
var seeds = [];

// Random data
var randomData = new Map();

// username, name, species, geolocation,
// numbers -> traits, physiology, age, max_age, length, height, width, family, solar_system, planet,
// 9 habitats
// 5 rarity (Common, Uncommon, Rare, Epic, Lengendary
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
        var rstring = uuid.v4();
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

/* 
encrypt - dehash string or object
*/
function encrypt(data, type, key) {
    var encryptedData = undefined;
    if (type == "object") {
        encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    } else if (type == "string") {
        encryptedData = CryptoJS.AES.encrypt(data.toString(), key).toString();
    }
    return encryptedData;
}
/* 
decrypt - hash string or object
*/
function decrypt(hash, type, key) {
    var decryptedData = undefined;
    if (type == "object") {
        var bytes = CryptoJS.AES.decrypt(hash, key);
        decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } else if (type == "string") {
        var bytes = CryptoJS.AES.decrypt(hash, key);
        decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    }
    return decryptedData;
}

// inclusive
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSeed() {
    var theSeed = null;
    while (true) {
        var rseed = random(0, Math.pow(2, seed_bit_size));
        if (!seeds.includes(rseed)) {
            seeds.push(rseed.toString());
            theSeed = rseed;
            break;
        }
    }
    return theSeed;
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
        c.name = randomData.get("name")[Math.round(randgen.next() * dataset_max_size) % max_thousand];
        // Rarity
        var try_rarity = randgen.next();
        var rarity = undefined;
        var multiplier = undefined;
        var max = undefined;
        var baseline = undefined;
        if (try_rarity < legendary_chance) {
            rarity = 4;
            multiplier = 3;
            max = 10000;
            baseline = 500;
        }
        else if (try_rarity < epic_chance) {
            rarity = 3;
            multiplier = 1.25;
            max = 1000;
            baseline = 250;
        }
        else if (try_rarity < rare_chance) {
            rarity = 2;
            multiplier = 1.1;
            max = 500;
            baseline = 100;
        }
        else if (try_rarity < uncommon_chance) {
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
        c.age = parseInt(Math.round(randgen.next() * dataset_max_size * multiplier) % max_thousand % max_hundred);
        c.max_age = c.age + parseInt(Math.round(randgen.next() * dataset_max_size * multiplier));
        // Origin
        c.origin.solar_system = randomData.get("solar_system")[Math.round(randgen.next() * dataset_max_size) % max_thousand];
        c.origin.planet = randomData.get("planet")[Math.round(randgen.next() * dataset_max_size) % max_thousand];
        // Taxonomy
        c.taxonomy.species = randomData.get("species")[Math.round(randgen.next() * dataset_max_size) % max_thousand];
        // Traits
        c.traits.health = Math.round(Math.round(randgen.next() * dataset_max_size) * multiplier + baseline % max);
        c.traits.strength = Math.round(Math.round(randgen.next() * dataset_max_size) * multiplier + baseline % max);
        c.traits.defense = Math.round(Math.round(randgen.next() * dataset_max_size) * multiplier + baseline % max);
        c.traits.agility = Math.round(Math.round(randgen.next() * dataset_max_size) * multiplier + baseline % max);
        c.traits.intelligence = Math.round(Math.round(randgen.next() * dataset_max_size) * multiplier + baseline % max);
        // Physiology
        c.physiology.length = Math.round(Math.round(randgen.next() * dataset_max_size) * multiplier % max_thousand);
        c.physiology.height = Math.round(Math.round(randgen.next() * dataset_max_size) * multiplier % max_thousand);
        c.physiology.weight = Math.round(Math.round(randgen.next() * dataset_max_size) * multiplier % max_thousand);
        // Ecology
        c.ecology.geolocation = randomData.get("geolocation")[Math.round(randgen.next() * dataset_max_size) % max_thousand];
        c.ecology.habitat = randomData.get("habitat")[Math.round(randgen.next() * dataset_max_size) % max_thousand % (randomData.get("habitat").length)];
        c.ecology.diet = randomData.get("diet")[Math.round(randgen.next() * dataset_max_size) % max_thousand % (randomData.get("diet").length)];
        // Behaviour
        c.behaviour.hostility = randomData.get("hostility")[Math.round(randgen.next() * dataset_max_size) % max_thousand % (randomData.get("hostility").length)];
        c.behaviour.social_structure = randomData.get("social_structure")[Math.round(randgen.next() * dataset_max_size) % max_thousand % (randomData.get("social_structure").length)];
        c.behaviour.activity = randomData.get("activity")[Math.round(randgen.next() * dataset_max_size) % max_thousand % (randomData.get("activity").length)];
    }
    if (!allCreatures.has(seed)) {
        allCreatures.set(seed, c);
    }
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
    if (user.addCreature(c) != null) {
        console.log(`${c.name} (${c.rarity}) was added to your inventory`);
    } else {
        console.log(`Your inventory is full! ${c.name} (${c.rarity}) couldn't be added to your inventory`);
    }
}

function deleteCreature(user, c) {
    if (user.removeCreature(c) != null) {
        console.log(`${c.name} (${c.rarity}) was removed to your inventory`);
    } else {
        console.log("Deletion of creature did not work");
    }
}

generateRandomData();
//generateCreatures(10000);
//countCreatures();

var user1 = new User();
initUser(user1);
rollForCreature(user1);
rollForCreature(user1);
rollForCreature(user1);
rollForCreature(user1);
rollForCreature(user1);
viewInventory(user1);







