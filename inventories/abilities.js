const abilities = {
    six_foot_king: {
        name: "Six_Foot_King",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Reach places where others cannot.",
        image: "https://i.imgur.com/WcbUe3M.png"
    },
    aggrog: {
        name: "Aggrog",
        activate: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Take all party damage until your next turn.",
        image: "https://i.imgur.com/WEoM1sA.png"
    },
    alchemist: {
        name: "Alchemist",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Combine up to 3 spells together.",
        image: "https://i.imgur.com/Midl7Z1.gif"
    },
    bloodborne: {
        name: "Bloodborne",
        activate: true,
        hp: -12,
        str: 10,
        mana: 0,
        info: "Sacrifice 12 health to increase strength by 10. Lasts 3 turns.",
        image: "https://i.imgur.com/lUl6HGN.png"
    },
    clear_as_fiji_water: {
        name: "Clear_as_Fiji_water",
        activate: true,
        hp: -12,
        str: 10,
        mana: 0,
        info: "Go invisible for 2 turns or until your next attack, enemies cannot target you while invisible.",
        image: "https://i.imgur.com/Iv7DUPQ.png"
    },
    critical_timing: {
        name: "Critical_Timing",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "18-20 count as critical hits during combat.",
        image: "https://i.imgur.com/D1uepAK.gif"
    },
    double_damnage: {
        name: "Double_Damnage",
        activate: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Roll 2 die when attacking. Lasts 2 turns.",
        image: "https://i.imgur.com/yGpMUvF.png"
    },
    double_time: {
        name: "Double_Time",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Take 2 actions on your turn during combat.",
        image: "https://i.imgur.com/fVjwGb0.png"
    },
    how_you_doin: {
        name: "How_You_Doin",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Increase persuasion rolls by 3.",
        image: "https://i.imgur.com/r61b7AV.png"
    },
    i_am_my_own_plus_1: {
        name: "I_Am_My_Own_Plus_1",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Add 1 to all dice rolls.",
        image: "https://i.imgur.com/zCb2Djc.png"
    },
    inner_reflection: {
        name: "Inner_Reflection",
        consumable: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Reflect all damage done to you this turn onto the cause.",
        image: "https://i.imgur.com/X5Gf8wX.png"
    },
    inspire: {
        name: "Inspire",
        activate: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Inspire a target with song and dance to give them an inspiration D8.",
        image: "https://i.imgur.com/YUqDu1R.gif"
    },
    invincibility: {
        name: "Invincibility",
        consumable: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Take 0 damage until your next turn.",
        image: "https://i.imgur.com/H7LjCXQ.png"
    },
    lady_luck: {
        name: "Lady_Luck",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "When rolling a D20, 1-3 count as catastrophic failure and 18-20 count as critical successes.",
        image: "https://i.imgur.com/vXrC56B.png"
    },
    magic_resistance: {
        name: "Magic_Resistance",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Take ½ damage from magic attacks.",
        image: "https://i.imgur.com/ML5AeLn.png"
    },
    mana_recycling: {
        name: "Mana_Recycling",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Spells take half the mana cost.",
        image: "https://i.imgur.com/1yvM8j0.png"
    },
    mary_shelley: {
        name: "Mary_Shelley",
        consumable: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Whole party turns into turtles and takes 0 damage until your next turn.",
        image: "https://i.imgur.com/2obGURK.png"
    },
    meditate: {
        name: "Meditate",
        activate: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "All combat spells deal an additional D10 of damage, lasts 3 turns.",
        image: "https://i.imgur.com/xT97ItC.gif"
    },
    mighty_morphin_time: {
        name: "Mighty_Morphin_Time",
        consumable: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Change size, lasts 3 turns.",
        image: "https://i.imgur.com/1ujJd7P.png"
    },
    minds_eye: {
        name: "Minds_Eye",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Increase perception rolls by 3.",
        image: "https://i.imgur.com/CQJqb08.png"
    },
    physical_resistance: {
        name: "Physical_Resistance",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Take ½ damage from physical attacks.",
        image: "https://i.imgur.com/F6aG3gb.png"
    },
    prayer: {
        name: "Prayer",
        activate: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "All healing spells heal an additional D10 of health, lasts 3 turns.",
        image: "https://i.imgur.com/dk1VPW6.gif"
    },
    risky: {
        name: "Risky",
        activate: true,
        hp: 0,
        str: -2,
        mana: 0,
        diceSize: 12,
        info: "Roll a D12 instead of a D10 but decrease strength by 2.",
        image: "https://i.imgur.com/t0qtHvA.png"
    },
    rock_hard_abs: {
        name: "Rock_Hard_Abs",
        passive: true,
        hp: 10,
        str: 0,
        mana: 0,
        info: "Increase health by 10.",
        image: "https://i.imgur.com/zjlxDpp.png"
    },
    rock_hard_bis: {
        name: "Rock_Hard_Bis",
        passive: true,
        hp: 0,
        str: 2,
        mana: 0,
        info: "Increase strength by 2.",
        image: "https://i.imgur.com/NUL9NvV.png"
    },
    rock_hard_wits: {
        name: "Rock_Hard_Wits",
        passive: true,
        hp: 0,
        str: 0,
        mana: 4,
        info: "Increase mana by 2.",
        image: "https://i.imgur.com/5aqzSxF.png"
    },
    salvation: {
        name: "Salvation",
        consumable: true,
        hp: 40,
        str: 0,
        mana: 0,
        info: "Heal whole party with 40 health.",
        image: "https://i.imgur.com/5aqzSxF.png"
    },
    skittish: {
        name: "Skittish",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Enemies must roll 16 or higher to hit you.",
        image: "https://i.imgur.com/sDXz3Ox.png"
    },
    strong_jump: {
        name: "Strong_Jump",
        activate: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Do a strong jump in a direction.",
        image: "https://i.imgur.com/zjQdpHu.png"
    },
    super_risky: {
        name: "Super_Risky",
        activate: true,
        hp: 0,
        str: -5,
        mana: 0,
        diceSize: 15,
        info: "Roll a D15 instead of a D10 but decrease strength by 5.",
        image: "https://i.imgur.com/ffcLH2w.png"
    },
    thicc_queen: {
        name: "Thicc_Queen",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Wake beings long gone with the sound of your clapping cheeks.",
        image: "https://i.imgur.com/7n0VjnR.png"
    },
    ultra_risky: {
        name: "Ultra_Risky",
        activate: true,
        hp: 0,
        str: -10,
        mana: 0,
        diceSize: 20,
        info: "Roll a D20 instead of a D10 but decrease strength by 10.",
        image: "https://i.imgur.com/UpbTxHl.png"
    },
    vantage: {
        name: "Vantage",
        passive: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Always go first during combat.",
        image: "https://i.imgur.com/PgUSpux.png"
    },
    vibe_check: {
        name: "Vibe_Check",
        activate: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Check your enemies vibes by dealing 10 damage to all of them. Skips your next turn too.",
        image: "https://i.imgur.com/L7fRSxq.png"
    }
}

exports.abilities = abilities;
