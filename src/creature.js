class Creature {
    constructor() {
        this.name = "";
        this.age = 0;
        this.seed = undefined;
        this.image = undefined;
        this.max_age = 0;
        this.rarity = undefined;
        this.origin = {
            solar_system: undefined,
            planet: undefined,
        };
        this.taxonomy = {
            species: undefined,
        };
        this.traits = {
            health: 0,
            strength: 0,
            defense: 0,
            agility: 0,
            intelligence: 0,
        };
        this.physiology = {
            length: 0,
            height: 0,
            weight: 0, 
        };
        this.ecology = {
            geolocation: undefined, // place
            habitat: undefined, // land, water, sky
            diet: undefined // herbivore, carnivore, omnivore
        };
        this.behaviour = {
            hostility: undefined, // friendly, neutral, hostile
            social_structure: undefined, // alone, group, society
            activity: undefined, // day, night, both
        };
    }
}
module.exports = {
  Creature,
};