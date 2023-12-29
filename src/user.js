var { Creature } = require("./creature");
require("./constants");
class User {
    constructor() {
        this.username = "";
        this.userid = undefined;
        this.date_created = undefined;
        this.creatures = [];
        this.inventory_cap = MAX_INVENTORY_SIZE;
    }
    getUsername() {
        return this.username;
    }
    getUserID() {
        return this.userid;
    }
    getDateCreated() {
        return date_created;
    }
    setUsername(username) {
        this.username = username;
    }
    setUserID(userid) {
        this.userid = userid;
    }
    setDateCreated(date_created) {
        this.date_created = date_created;
    }
    getCreatures() {
        return this.creatures;
    }
    setCreatures(creatures) {
        this.creatures = creatures;
    }
    addCreature(c) {
        if (this.creatures.length < this.inventory_cap) {
            this.creatures.push(c);
            return c;
        }
        return null;
    }
    removeCreature(c) {
        if (this.creatures.length > 0) {
            if (this.creatures.includes(c)) {
                this.creatures.splice(this.creatures.indexOf(c), 1);
                return c;
            }
        }
        return null;
    }
}


module.exports = {
  User,
};
