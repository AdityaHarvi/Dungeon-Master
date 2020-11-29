const items = {
    a_sack_of_frozen_potatoes: {
        name: "A_Sack_of_Frozen_Potatoes",
        consumable: true,
        equipable: false,
        hp: -5,
        str: 0,
        mana: 0,
        info: "Russian gold, or Russian mercury if fermented and distilled. Trying to consume will inflict 5 damage because it’s too hard.",
        image: "https://i.imgur.com/fgU5bQV.png"
    },
    actual_robot_costume: {
        name: "Actual_Robot_Costume",
        consumable: false,
        equipable: true,
        hp: 60,
        str: 0,
        mana: 0,
        info: "The real deal. Increases health by 60. (Top Jug.)",
        image: "https://i.imgur.com/hA8h5XF.png"
    },
    alto_health_potion: {
        name: "Alto_Health_Potion",
        consumable: true,
        equipable: false,
        hp: 5,
        str: 0,
        mana: 0,
        info: "Restores 5 health.",
        image: "https://i.imgur.com/y97CIk4.png"
    },
    alto_hydroflask_of_vitamin_water: {
        name: "Alto_Hydroflask_of_Vitamin_Water",
        consumable: true,
        equipable: false,
        hp: 5,
        str: 0,
        mana: 2,
        info: "Sksksksk. Restores 5 health and 2 mana.",
        image: "https://i.imgur.com/iZ079AR.png"
    },
    alto_mana_potion: {
        name: "Alto_Mana_Potion",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 2,
        info: "Restores 2 mana.",
        image: "https://i.imgur.com/g1keWTE.png"
    },
    anonymous_key: {
        name: "Anonymous_Key",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 0,
        info: "A generic key, doesn’t seem particularly useful. Probably tastes pretty metallic. Could be used in conjunction with something else?",
        image: "https://i.imgur.com/esANBdF.png"
    },
    anonymous_skeleton: {
        name: "Anonymous_Skeleton",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 0,
        info: "A generic skeleton, didn’t seem particularly useful during its lifetime. Probably tastes bony. Could be used in conjunction with something else?",
        image: "https://i.imgur.com/ApGq5mP.png"
    },
    backpack: {
        name: "Backpack",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 0,
        addInventory: 3,
        info: "Some old backpack, it's pretty torn but you can still use bits of it. Increases your inventory capacity by 3 slots.",
        image: "https://i.imgur.com/3onA2X4.png"
    },
    bare_fist: {
        name: "Bare_Fist",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Just your bare fists.",
        image: "https://i.imgur.com/trX6GKf.png"
    },
    bari_health_potion: {
        name: "Bari_Health_Potion",
        consumable: true,
        equipable: false,
        hp: 35,
        str: 0,
        mana: 0,
        info: "Restores 35 health.",
        image: "https://i.imgur.com/0ZyMDva.gif"
    },
    bari_hydroflask_of_vitamin_water: {
        name: "Bari_Hydroflask_of_Vitamin_Water",
        consumable: true,
        equipable: false,
        hp: 35,
        str: 0,
        mana: 14,
        info: "Sksksksk. Restores 35 health and 14 mana.",
        image: "https://i.imgur.com/4sKXwKV.png"
    },
    bari_mana_potion: {
        name: "Bari_Mana_Potion",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 14,
        info: "Restores 14 mana.",
        image: "https://i.imgur.com/KN0Wgez.png"
    },
    bass_health_potion: {
        name: "Bass_Health_Potion",
        consumable: true,
        equipable: false,
        hp: 100,
        str: 0,
        mana: 0,
        info: "Restores 100 health.",
        image: "https://i.imgur.com/ZRHiTXS.png"
    },
    beeg_shield: {
        name: "BEEG_Shield",
        consumable: false,
        equipable: true,
        hp: 5,
        str: 1,
        mana: 2,
        info: "Shield blessed by the local patron deity. Increases health by 5, strength by 1 and mana by 2 and helps you evade taxes. (Weak Bard)",
        image: "https://i.imgur.com/exdhxYc.png"
    },
    caduceus: {
        name: "Caduceus",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 0,
        mana: 16,
        info: "Literally 2 snakes wrapped around your arms, make for very interesting conversation. Increases mana by 16. (Mid Wiz.)",
        image: "https://i.imgur.com/b74l3gW.png"
    },
    cardboard_robot_costume: {
        name: "Cardboard_Robot_Costume",
        consumable: false,
        equipable: true,
        hp: 4,
        str: 0,
        mana: 0,
        info: "Some kid’s halloween costume, and now your only defense from death. Increases health by 4 but eliminates all dignity.",
        image: "https://i.imgur.com/1ddULrW.png"
    },
    djungelskog: {
        name: "Djungelskog",
        consumable: false,
        equipable: true,
        hp: 12,
        str: 3,
        mana: 8,
        info: "A soft, yet deadly wearable brown bear costume. Increases health by 12, strength by 3 and mana by 8. (Mid Bard)",
        image: "https://i.imgur.com/4JA5R0N.png"
    },
    double_sticky_blicky: {
        name: "Double_Sticky_Blicky",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 0,
        mana: 36,
        info: "Back to basics. Increases mana by 36. (Top Wiz.)",
        image: "https://i.imgur.com/8AzBXE7.png"
    },
    eternal_flame_piece: {
        name: "Eternal_Flame_Piece",
        consumable: true,
        equipable: false,
        hp: -5,
        str: 0,
        mana: 0,
        info: "The hottest mixtape of this year, will be forgotten by the next. Trying to consume will inflict 5 damage because it’s too hot.",
        image: "https://i.imgur.com/gbrpGME.png"
    },
    gloves_of_boi: {
        name: "Gloves_of_BOI",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 1,
        mana: 2,
        info: "Gloves that achieve maximum power when roasting someone. Increases mana by 2 and strength by 1. (Weak Arc)",
        image: "https://i.imgur.com/Pe0ACFw.png"
    },
    golden_armour: {
        name: "Golden_Armour",
        consumable: false,
        equipable: true,
        hp: 160,
        str: 10,
        mana: 0,
        info: "Increases health by 160 and strength by 10.",
        image: "https://i.imgur.com/7OMjyLh.gif"
    },
    golden_staff: {
        name: "Golden_Staff",
        consumable: false,
        equipable: true,
        hp: 35,
        str: 0,
        mana: 60,
        info: "Increases health by 35 and mana by 60.",
        image: "https://i.imgur.com/ri50t06.gif"
    },
    golden_sticky_icky: {
        name: "Golden_Sticky_Icky",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 14,
        mana: 0,
        info: "Strength and simplicity. Increases strength by 14. (Top Ass.)",
        image: "https://i.imgur.com/iQkytew.png"
    },
    golden_sword: {
        name: "Golden_Sword",
        consumable: false,
        equipable: true,
        hp: 50,
        str: 40,
        mana: 0,
        info: "Increases health by 50 and strength by 40.",
        image: "https://i.imgur.com/VUgplq9.gif"
    },
    hand_groot: {
        name: "Hand_Groot",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 9,
        mana: 26,
        info: "The cutest Guardian of the Galaxy, now forever strapped to your palm. Increases strength by 9 and mana by 26. (Top Arc.)",
        image: "https://i.imgur.com/OOcX9LT.png"
    },
    jack_of_all_trades: {
        name: "Jack_of_All_Trades",
        consumable: false,
        equipable: true,
        hp: 25,
        str: 6,
        mana: 16,
        info: "Master of none. Increases health by 25, strength by 6 and mana by 16. (Top Bard)",
        image: "https://i.imgur.com/mvz81vO.png"
    },
    lab3l_brooklyn_distressed_denim_jacket: {
        name: "Lab3l_Brooklyn_Distressed_Denim_Jacket",
        consumable: false,
        equipable: true,
        hp: 16,
        str: 0,
        mana: 12,
        info: "Oi bruv, you got a loicense for looking that fresh? A highly distressed charcoal denim jacket. Increases fit and health by 16 and mana by 12. (Mid Cle.)",
        image: "https://i.imgur.com/Dux3Ir6.png"
    },
    lightsaber: {
        name: "Lightsaber",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 6,
        mana: 0,
        info: "Plasma blade that can change colours according to your mood, makes cool noises when swinging. Increases strength by 6 but drops coolness by 6. (Mid Ass.)",
        image: "https://i.imgur.com/ZdSoOMY.gif"
    },
    marvins_sword: {
        name: "Marvins_Sword",
        consumable: false,
        equipable: true,
        hp: 45,
        str: 6,
        mana: 10,
        info: "A goofy talking sword, but his words cut deeper than a knife. Increases health by 45 and strength by 10. (Top Pal.)",
        image: "https://i.imgur.com/QrmuLUk.png"
    },
    nike_chunky_dunks: {
        name: "Nike_Chunky_Dunks",
        consumable: false,
        equipable: true,
        hp: 5,
        str: 1,
        mana: 0,
        info: "Used shoes for 4,000USD anyone? Increases health by 5 and strength by 1",
        image: "https://i.imgur.com/2O1PuLJ.png"
    },
    not_a_flamethrower: {
        name: "Not_a_Flamethrower",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 4,
        mana: 12,
        info: "A blowtorch shaped to look like a gun. Legal in all states except Maryland. Increases strength by 4 and mana by 12. (Mid Arc.)",
        image: "https://i.imgur.com/mR0YSM7.png"
    },
    off_white_face_mask: {
        name: "Off_White_Face_Mask",
        consumable: false,
        equipable: true,
        hp: 5,
        str: 0,
        mana: 2,
        info: "Fundamental before going out. Increases health by 5 and mana by 2.",
        image: "https://i.imgur.com/MWq8yOi.png"
    },
    old_fryer_oil: {
        name: "Old_Fryer_Oil",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 0,
        info: "The most caustic substance known to man, able to hold massive amounts of heat forever. Takes out 50 HP from all nearby enemies.",
        image: "https://i.imgur.com/WwrS496.png"
    },
    playing_cards_clubs: {
        name: "Playing_Cards_Clubs",
        consumable: true,
        equipable: false,
        hp: 1,
        str: 0,
        mana: 0,
        info: "13 playing cards, seem to be part of a full deck. Surprisingly tasty, restores 1 health.",
        image: "https://i.imgur.com/LE1CTWA.png"
    },
    playing_cards_diamonds: {
        name: "Playing_Cards_Diamonds",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 1,
        info: "13 playing cards, seem to be part of a full deck. Surprisingly savoury, restores 1 mana.",
        image: "https://i.imgur.com/f5AfZWe.png"
    },
    playing_cards_hearts: {
        name: "Playing_Cards_Hearts",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: -1,
        info: "13 playing cards, seem to be part of a full deck. Surprisingly bland, damages 1 mana.",
        image: "https://i.imgur.com/6wIZCDz.png"
    },
    playing_cards_spades: {
        name: "Playing_Cards_Spades",
        consumable: true,
        equipable: false,
        hp: -1,
        str: 0,
        mana: 0,
        info: "13 playing cards, seem to be part of a full deck. Surprisingly gross, damages 1 health.",
        image: "https://i.imgur.com/Wrug9Dn.png"
    },
    potion_of_invisibility: {
        name: "Potion_of_Invisibility",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Go invisible for 1 turn.",
        image: "https://i.imgur.com/xtGpLvU.gif"
    },
    santas_frozen_beard: {
        name: "Santas_Frozen_Beard",
        consumable: false,
        equipable: true,
        hp: 40,
        str: 0,
        mana: 24,
        info: "A mane so long, robust and cool, no attacks can get through. Increases health by 40 and mana by 24. (Top Cle.)",
        image: "https://i.imgur.com/QR92yoE.png"
    },
    santas_torn_hat: {
        name: "Santas_Torn_Hat",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 0,
        info: "Krampus’ last shred of humanity. Freezes all enemies in place for two turns, stopping them from attacking.",
        image: "https://i.imgur.com/XchEgQb.png"
    },
    sticky_blicky: {
        name: "Sticky_Blicky",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 0,
        mana: 2,
        info: "It’s a stick, but blue. Increases mana by 2. (Weak Wiz.)",
        image: "https://i.imgur.com/i1oQSdu.png"
    },
    sticky_icky: {
        name: "Sticky_Icky",
        consumable: false,
        equipable: true,
        hp: 0,
        str: 1,
        mana: 0,
        info: "It’s a stick, but blue. Increases strength by 1.",
        image: "https://i.imgur.com/UQ97kwM.gif"
    },
    sword_of_eternal_shame: {
        name: "Sword_of_Eternal_Shame",
        consumable: false,
        equipable: true,
        hp: 25,
        str: 5,
        mana: 0,
        info: "A sharp sword that makes you unable to look at your opponents (and your friends once they discover what you’ve done). Increases health by 25 and strength by 5. (Mid Pal.)",
        image: "https://i.imgur.com/C8eJyP0.png"
    },
    tenor_health_potion: {
        name: "Tenor_Health_Potion",
        consumable: true,
        equipable: false,
        hp: 10,
        str: 0,
        mana: 0,
        info: "Restores 10 health.",
        image: "https://i.imgur.com/NLo9Wfz.png"
    },
    tenor_hydroflask_of_vitamin_water: {
        name: "Tenor_Hydroflask_of_Vitamin_Water",
        consumable: true,
        equipable: false,
        hp: 10,
        str: 0,
        mana: 5,
        info: "Sksksksk. Restores 10 health and 5 mana.",
        image: "https://i.imgur.com/SFsLMza.png"
    },
    tenor_mana_potion: {
        name: "Tenor_Mana_Potion",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 5,
        info: "Restores 5 mana.",
        image: "https://i.imgur.com/iEAPY99.png"
    },
    the_golden_mic: {
        name: "The_Golden_Mic",
        consumable: true,
        equipable: false,
        hp: 0,
        str: 0,
        mana: 5,
        info: "Issa Brampton ting, mans got Draco’s vibe now. Skips all enemies’ turns once.",
        image: "https://i.imgur.com/d05rGix.png"
    },
    the_pale_king: {
        name: "The_Pale_King",
        consumable: false,
        equipable: true,
        hp: -10,
        str: -2,
        mana: -4,
        info: "The most important piece in the game and can grant strong power, also a very heavy burden. Decreases health by 10, strength by 2 and mana by 4. Also summons a pale king minion",
        image: "https://i.imgur.com/kAByhA6.png"
    },
    the_yankee_with_no_brim: {
        name: "The_Yankee_with_No_Brim",
        consumable: false,
        equipable: true,
        hp: 25,
        str: 0,
        mana: 0,
        info: "A legendary hat said to only exist in the heart of anarchists. Increases health by 25 and gives you the moniker of “madlad”.",
        image: "https://i.imgur.com/0XN316i.png"
    }
}

exports.items = items;
