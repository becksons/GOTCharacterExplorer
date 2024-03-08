const express = require('express');
const router = express.Router();
const axios = require('axios');


router.get('/characters', async (req, res, next) => {
    try {
        if (!req.query.name) {
            return res.render('search', { message: 'Search for Character' });
        }
        const formattedName = req.query.name.trim();

        const response = await axios.get(`https://www.anapioficeandfire.com/api/characters?name=${formattedName}`);

        if (response.data.length > 0) {
            const character = response.data[0];
            res.render('characterDetails', { character: character });
        } else {
            res.render('search', { message: 'Character not found.' });
        }


    } catch (error) {
        console.error('Error fetching characters:', error);
        next(error);
    }
});
var characterList = [];
router.post('/search', async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.render('search', { message: 'Search for Character' });
        }
        const formattedName = name.trim();
        const response = await axios.get(`https://www.anapioficeandfire.com/api/characters?name=${formattedName}`);

        if (response.data.length > 0) {
            const character = response.data[0];
            characterList.push(character)

            res.render('characters', {
                characters: characterList.reverse() });
        } else {
            res.render('characters', { message: 'Character not found.', characters: [] });
        }

    } catch (error) {
        console.error('Error fetching characters:', error);
        next(error);
    }
});

module.exports = router;
