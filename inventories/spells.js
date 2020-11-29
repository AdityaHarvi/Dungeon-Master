const spells = {
    bolt: {
        name: "Bolt",
        mana: 4,
        damage: 10,
        diceSize: 14,
        info: "Deal 10 + D14 roll worth of electric damage.",
        image: "https://i.imgur.com/tqR3tcY.png"
    },
    buff: {
        name: "Buff",
        mana: 12,
        info: "Increase strength by 10. Lasts 3 turns.",
        image: "https://i.imgur.com/beDVT42.png"
    },
    creation: {
        name: "Creation",
        mana: "?",
        info: "Create what you need. MP cost depends on the usefulness of the product",
        image: "https://i.imgur.com/MT3QbsV.png"
    },
    disguise: {
        name: "Disguise",
        mana: 3,
        info: "Make everyone perceive the target however you desire.",
        image: "https://i.imgur.com/P5e59hY.png"
    },
    divinate: {
        name: "Divinate",
        mana: 6,
        info: "Look into the future.",
        image: "https://i.imgur.com/l5xivfZ.png"
    },
    fireball: {
        name: "Fireball",
        mana: 2,
        damage: 8,
        diceSize: 8,
        info: "Deal 8 + D8 roll worth of fire damage.",
        image: "https://i.imgur.com/tCcDRR8.png"
    },
    freeze: {
        name: "Freeze",
        mana: 18,
        damage: 18,
        diceSize: 6,
        info: "Deal 18 + D6 roll worth of frost damage to all enemies.",
        image: "https://i.imgur.com/TqoTprJ.png"
    },
    heal: {
        name: "Heal",
        mana: 2,
        heal: 6,
        info: "Heal 6 health to ally",
        image: "https://i.imgur.com/93AzCVy.png"
    },
    necromancy: {
        name: "Necromancy",
        mana: 9,
        info: "Revive target with 15 health to obey you.",
        image: "https://i.imgur.com/UUJTvow.png"
    },
    obfuscate: {
        name: "Obfuscate",
        mana: 3,
        info: "Blind someone.",
        image: "https://i.imgur.com/EOYo2Xq.png"
    },
    overheal: {
        name: "Overheal",
        mana: 12,
        heal: 30,
        info: "Increase ally's current and max HP by 30. Max health returns to normal after combat is finished.",
        image: "https://i.imgur.com/89tIUbD.jpg"
    },
    poison: {
        name: "Poison",
        mana: 12,
        damage: 8,
        diceSize: 12,
        info: "Deal 8 + D12 roll worth of poison damage each turn for 3 turns.",
        image: "https://i.imgur.com/Xn98T6N.png"
    },
    protect: {
        name: "Protect",
        mana: 12,
        info: "Take ½ damage. Lasts 2 turns.",
        image: "https://i.imgur.com/8OHICpR.png"
    },
    quake: {
        name: "Quake",
        mana: 8,
        damage: 6,
        diceSize: 12,
        info: "Deal 6 + D12 roll worth of rock damage to all enemies.",
        image: "https://i.imgur.com/FJTy8TV.png"
    },
    rebirth: {
        name: "Rebirth",
        mana: 9,
        heal: 27,
        info: "Heal 27 health to target. Also makes target speak baby-babble for 1 turn.",
        image: "https://i.imgur.com/TViV1Jk.png"
    },
    restore: {
        name: "Restore",
        mana: 6,
        heal: 15,
        info: "Heal target for 15 health.",
        image: "https://i.imgur.com/B9UWeZu.png"
    },
    reveal: {
        name: "Reveal",
        mana: 3,
        info: "Analyze your environment and reveal something hidden. Equivalent to a high perception check.",
        image: "https://i.imgur.com/L9Co78B.png"
    },
    revive: {
        name: "Revive",
        mana: 6,
        info: "Revive target with 10 health.",
        image: "https://i.imgur.com/1GEPpLE.png"
    },
    star: {
        name: "Star",
        mana: 12,
        damage: 36,
        info: "Deal 36 light damage.",
        image: "https://i.imgur.com/NUYjD4z.png"
    },
    summon_guard: {
        name: "Summon_Guard",
        mana: 18,
        info: "Bring forth an old guardian to heed your command.",
        image: "https://i.imgur.com/ph2RDoz.png"
    },
    summon_lucifer: {
        name: "Summon_Lucifer",
        mana: 60,
        info: "Bring forth the ancient Babylonian King",
        image: "https://i.imgur.com/VcERa1z.png"
    },
    summon_minion: {
        name: "Summon_Minion",
        mana: 8,
        info: "Bring forth a small minion to heed your command.",
        image: "https://i.imgur.com/3fwUHs4.png"
    },
    summon_monster: {
        name: "Summon_Monster",
        mana: 24,
        info: "Bring forth a small monstrosity to heed your command.",
        image: "https://i.imgur.com/cDDoTNW.png"
    },
    telekinesis: {
        name: "Telekinesis",
        mana: 3,
        info: "Move an object anywhere within 20m.",
        image: "https://i.imgur.com/pqf2QRr.png"
    },
    telepathy: {
        name: "Telepathy",
        mana: 3,
        info: "Read the target's mind.",
        image: "https://i.imgur.com/YJaBVDe.png"
    },
    teleport: {
        name: "Teleport",
        mana: 3,
        info: "Move anywhere in sight within 40m.",
        image: "https://i.imgur.com/YUmd9RA.png"
    },
    trick: {
        name: "Trick",
        mana: 0,
        info: "Cool magic trick designed to impress.",
        image: "https://i.imgur.com/wF3MNaf.png"
    },
    void: {
        name: "Void",
        mana: 24,
        damage: 20,
        diceSize: 30,
        info: "Deal 20 + D30 roll worth of dark damage.",
        image: "https://i.imgur.com/qrrOJQ8.png"
    },
    waterfall: {
        name: "Waterfall",
        mana: 6,
        damage: 18,
        info: "Deal 18 water damage",
        image: "https://i.imgur.com/RetRV3J.png"
    }
};

exports.spells = spells;
