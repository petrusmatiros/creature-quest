# Creature Quest <img src="public/assets/icons/creature-quest.svg" alt="The Creature Quest logo" width=32 style="vertical-align:middle">

### A web based collection game inspired by procedural &amp; random generation

---

# Table of contents
  ### Game
  - [Link to website](#link-to-website)
  - [Game description & objective](#game-description--objective)
  ### Project
  - [Dependencies](#dependencies)
  - [Install and build](#install-and-build)
---

## Link to website
<!-- #### TBD -->
 TBD
 
 Enjoy ^-^


## Game description & objective
 A collection game, where you can discover unique creatures from different worlds (spanning different planets and even solar systems). All of the creatures are procedurally generated, with their origin, species, stats and even art.
 

## Dependencies
```json
"dependencies": {
    "@mediabox/lwip": "^3.0.18",
    "crypto-js": "^4.1.1",
    "fs": "^0.0.1-security",
    "rand-seed": "^1.0.2",
    "uuid": "^9.0.0"
  }
```

## Install and run

```
npm i
node server/index.js
```

lwip package is native and requires compilation with `node-gyp`
```
cd @mediabox/lwip
node-gyp configure
node-gyp build
```


